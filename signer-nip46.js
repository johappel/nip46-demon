import NDK, { NDKNip46Backend, NDKPrivateKeySigner } from "./vendor/ndk-3.0.0.js";
import { createSignerAttentionManager } from "./signer-ui.js";
        // ===== Storage Keys =====
        // Älterer Speicherort für unverschlüsselte nsec (nur bei Migration relevant)
        const LEGACY_NSEC_STORAGE_KEY = "nip46_demo_nsec";
        // Verschlüsselte nsec im alten v1-Format (wird auf neues Keyring-Format migriert)
        const ENCRYPTED_NSEC_STORAGE_KEY = "nip46_demo_nsec_enc_v1";
        // Modernes Keyring-Format v2 - Array von verschlüsselten Einträgen mit IDs
        const KEYRING_STORAGE_KEY = "nip46_demo_keyring_enc_v2";
        // Speichert die ID des aktuell aktiven Schlüssels
        const ACTIVE_KEY_ID_STORAGE_KEY = "nip46_demo_active_key_id_v1";
        // Session-basiertes Entsperra-Caching (wird beim Browser-Reload gelöscht)
        const UNLOCK_CACHE_SESSION_KEY = "nip46_unlock_cache_session_v1";
        // TTL-basiertes Entsperra-Caching mit Ablaufzeit (15m/1h möglich)
        const UNLOCK_CACHE_TTL_KEY = "nip46_unlock_cache_ttl_v1";
        // Merkt die zuletzt gewählte "Entsperrt bleiben"-Option im UI
        const UNLOCK_REMEMBER_PREF_STORAGE_KEY = "nip46_unlock_remember_pref_v1";
        // Speichert Genehmigungen für Anfragen (pubkey:method -> TTL oder PERMISSION_FOREVER)
        const PERMISSION_STORAGE_KEY = "nip46_permissions_v1";
        // Optionale Metadaten zu Genehmigungen (z.B. aktiver Schluesselname beim Erteilen)
        const PERMISSION_META_STORAGE_KEY = "nip46_permissions_meta_v1";
        // Bindet WordPress User-IDs an Nostr Schlüssel (für WP-Integration)
        const WP_USER_BINDINGS_STORAGE_KEY = "nip46_wp_user_bindings_v1";
        // Versioniertes Dateiformat für passwortgeschützte Schlüssel-Exportdateien
        const KEY_EXPORT_TYPE = "nip46-key-export";
        const KEY_EXPORT_VERSION = 2;
        
        // ===== Relay und Bridge-Konfiguration =====
        // Standard-Relays für NIP-46 RPC-Kommunikation
        const RELAYS = [
            "wss://relay.damus.io",
            "wss://nos.lol",
            "wss://relay.primal.net",
            "wss://relay.snort.social"
        ];
        // Identifikator für sichere Cross-Origin PostMessage-Kommunikation mit Parent-Frame
        const BRIDGE_SOURCE = "nip46-signer-bridge";
        
        // ===== Kryptographische Konstanten =====
        // PBKDF2 Iterationen für Passwort-Hashing (210.000 = NIST empfohlen für 2024)
        const PBKDF2_ITERATIONS = 210000;
        // Mindestlänge für neue Passwörter
        const MIN_PASSWORD_LENGTH = 8;
        // Wie lange ein nsec maximal im UI sichtbar bleibt (Notfallfunktion)
        const NSEC_REVEAL_DURATION_MS = 10 * 1000;
        // NIP-46 Methoden, die automatisch genehmigt werden (keine User-Bestätigung nötig)
        const AUTO_ALLOW_METHODS = new Set(["connect", "ping", "get_public_key"]);
        // NIP-46 Methoden, die Benutzer-Bestätigung benötigen (sensitiv)
        const SENSITIVE_METHODS = new Set([
            "sign_event",
            "nip04_encrypt",
            "nip04_decrypt",
            "nip44_encrypt",
            "nip44_decrypt"
        ]);
        // Spezialwert: Genehmigung läuft niemals ab (-1 = unbegrenzt)
        const PERMISSION_FOREVER = -1;
        // Unlock-Rate-Limiting: exponentielles Backoff nach fehlgeschlagenen Passwortversuchen
        const UNLOCK_BACKOFF_BASE_MS = 1000;
        const UNLOCK_BACKOFF_MAX_MS = 30000;
        // Bech32-Encoding Zeichensatz (für nsec1 Format)
        const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
        // Bech32 Generator-Polynome (für Checksum-Berechnung)
        const BECH32_GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

        // ===== Global State =====
        // Queue für ausstehende Genehmigungsanfragen (FIFO-Verarbeitung)
        const pendingPermissionRequests = [];
        // Die aktuell zu bearbeitende Genehmigungsanfrage
        let activePermissionRequest = null;
        // Verbindungsinformationen (bunker URI, pubkey, relays, etc.) nach Entsperrrung
        let connectionInfo = null;
        // true wenn dieser iframe in einem Parent-Frame lädt (nicht top-level)
        const isEmbeddedContext = window.parent !== window;

        // ===== Signer Session State =====
        // Das aktuell gespeicherte Passwort (wird nach Entsperrrung in RAM gehalten)
        let sessionPassword = "";
        // Entsperrmaterial aus Unlock-Cache (abgeleiteter Key + Salt/Iter für Keyring-Aktionen ohne Klartext-Passwort)
        let sessionUnlockMaterial = null;
        // Das gesamte Keyring-Objekt mit allen verschlüsselten Schlüsseln
        let currentKeyring = null;
        // Die ID des aktuell aktiven Schlüssels
        let activeKeyId = null;
        // Der entschlüsselte nsec des aktiven Schlüssels (SENSIBEL!)
        let activeNsec = null;
        // Das NDKUser-Objekt des aktiven Schlüssels (enthält pubkey, npub, etc.)
        let activeUser = null;
        // Letzte gemeldete Frame-Höhe (für iframe Auto-Resize)
        let lastPostedFrameHeight = 0;
        // Flag um redundante Frame-Size Updates zu vermeiden (Debouncing)
        let frameSizeNotifyScheduled = false;
        // Timer-Handle für die einmalige nsec-Anzeige
        let nsecRevealTimerHandle = null;
        // Anzahl fehlgeschlagener Unlock-Versuche für Backoff
        let failedUnlockAttempts = 0;
        // Steuerung fuer Notification / Titel-Blink / Signalton
        const signerAttention = createSignerAttentionManager({
            onUiChanged: () => scheduleFrameSizeNotification(true)
        });
        // ===== Validierungs- und Normalisierungs-Funktionen =====
        
        /**
         * Prüft, ob ein String ein gültiger nsec ist.
         * nsec muss mit "nsec1" beginnen und mindestens 21 Zeichen lang sein.
         * @param {string} nsec - Zu prüfender Wert
         * @returns {boolean} true wenn gültiger nsec
         */
        function isValidNsec(nsec) {
            return typeof nsec === "string" && nsec.startsWith("nsec1") && nsec.length > 20;
        }

        /**
         * Normalisiert einen Schlüsselnamen (trimmt Whitespace, gibt leeren String bei null zurück).
         * @param {string} name - Der zu normalisierende Name
         * @returns {string} Normalisierter Name (trimmed) oder leerer String
         */
        function normalizeKeyName(name) {
            return typeof name === "string" ? name.trim() : "";
        }

        /**
         * Erzeugt einen Anzeigetext für einen Schlüssel.
         * Nutzt den benutzerdefinierten Namen oder fällt auf "Schlüssel N" zurück.
         * @param {object} entry - Der Keyring-Eintrag mit optionalem name
         * @param {number} index - Der Index des Eintrags (für Fallback-Text)
         * @returns {string} Anzeigetext
         */
        function keyDisplayName(entry, index = 0) {
            const custom = normalizeKeyName(entry?.name);
            return custom || `Schlüssel ${index + 1}`;
        }

        /**
         * Konvertiert einen beliebigen Input in einen sicheren Dateinamen.
         * Löscht Sonderzeichen, konvertiert zu Kleinbuchstaben, limitiert auf a-z0-9_-
         * @param {string} input - Beliebiger Input-String
         * @returns {string} Sicherer Dateiname oder "nostr-key" als Fallback
         */
        function safeFilename(input) {
            const raw = String(input || "").toLowerCase();
            const slug = raw.replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
            return slug || "nostr-key";
        }

        /**
         * Setzt Inline-Feedback für ein Formularfeld.
         * @param {HTMLElement|null} element - Ziel-Element für Feedback
         * @param {string} message - Fehlermeldung (leer = Feedback ausblenden)
         */
        function setFieldFeedback(element, message) {
            if (!element) return;
            element.innerText = message || "";
            element.style.display = message ? "block" : "none";
        }

        function isLocalDevHostname(hostname) {
            const host = String(hostname || "").toLowerCase();
            return host === "localhost" || host === "127.0.0.1" || host === "::1";
        }

        function getInsecureHttpWarningMessage() {
            if (window.location.protocol !== "http:") return "";
            if (isLocalDevHostname(window.location.hostname)) return "";
            return "Unsicherer HTTP-Zugriff erkannt. Bitte Signer nur ueber HTTPS oeffnen.";
        }

        function ensureSecureTransportOrThrow() {
            const warning = getInsecureHttpWarningMessage();
            if (!warning) return;
            appendRequestLog(warning);
            throw new Error(warning);
        }

        function isDevelopmentMode() {
            const params = new URLSearchParams(window.location.search);
            if (params.get("debug") === "1") return true;
            return isLocalDevHostname(window.location.hostname);
        }

        const DEBUG_MODE = isDevelopmentMode();

        function devLog(...args) {
            if (!DEBUG_MODE) return;
            console.log(...args);
        }

        async function registerPwaServiceWorker() {
            if (!("serviceWorker" in navigator)) return;
            try {
                const registration = await navigator.serviceWorker.register("./sw.js");
                devLog("Service Worker registriert:", registration?.scope || "(ohne scope)");
            } catch (err) {
                appendRequestLog(`Service Worker Registrierung fehlgeschlagen: ${err?.message || err}`);
            }
        }

        function waitMs(ms) {
            const delay = Math.max(0, Number(ms) || 0);
            return new Promise((resolve) => setTimeout(resolve, delay));
        }

        function unlockBackoffDelayMs(failedAttempts) {
            if (!Number.isFinite(failedAttempts) || failedAttempts <= 0) return 0;
            const exponent = Math.min(10, failedAttempts - 1);
            return Math.min(UNLOCK_BACKOFF_MAX_MS, UNLOCK_BACKOFF_BASE_MS * (2 ** exponent));
        }

        function formatWaitSeconds(ms) {
            const seconds = Math.ceil(Math.max(0, ms) / 1000);
            return `${seconds}s`;
        }

        function normalizeRememberMode(mode) {
            const value = String(mode || "").trim();
            if (value === "session" || value === "15m" || value === "1h") return value;
            return "none";
        }

        function loadRememberModePreference() {
            try {
                const raw = localStorage.getItem(UNLOCK_REMEMBER_PREF_STORAGE_KEY);
                return normalizeRememberMode(raw);
            } catch (_err) {
                return "none";
            }
        }

        function saveRememberModePreference(mode) {
            try {
                const normalized = normalizeRememberMode(mode);
                localStorage.setItem(UNLOCK_REMEMBER_PREF_STORAGE_KEY, normalized);
            } catch (_err) {
                // Ignore storage failures (private mode / quota etc.)
            }
        }

        async function copyTextToClipboard(text) {
            const value = String(text || "");
            if (!value) throw new Error("Kein Wert zum Kopieren vorhanden.");

            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(value);
                return;
            }

            const helper = document.createElement("textarea");
            helper.value = value;
            helper.setAttribute("readonly", "");
            helper.style.position = "fixed";
            helper.style.opacity = "0";
            helper.style.pointerEvents = "none";
            document.body.appendChild(helper);
            helper.focus();
            helper.select();
            const copied = document.execCommand("copy");
            helper.remove();
            if (!copied) throw new Error("Kopieren wurde vom Browser blockiert.");
        }

        function setSecretInputVisibility(input, toggleBtn, visible) {
            if (!input || !toggleBtn) return;
            input.type = visible ? "text" : "password";
            toggleBtn.classList.toggle("active", Boolean(visible));
            toggleBtn.title = visible ? "Ausblenden" : "Anzeigen";
            toggleBtn.setAttribute("aria-label", visible ? "nsec ausblenden" : "nsec anzeigen");
            toggleBtn.setAttribute("aria-pressed", visible ? "true" : "false");
        }

        function resetSecretInputVisibility(inputId, toggleBtnId) {
            const input = document.getElementById(inputId);
            const toggleBtn = document.getElementById(toggleBtnId);
            setSecretInputVisibility(input, toggleBtn, false);
        }

        function setupSecretInputControls(inputId, toggleBtnId, copyBtnId, label) {
            const input = document.getElementById(inputId);
            const toggleBtn = document.getElementById(toggleBtnId);
            const copyBtn = document.getElementById(copyBtnId);
            if (!input || !toggleBtn || !copyBtn) return;

            setSecretInputVisibility(input, toggleBtn, false);

            toggleBtn.addEventListener("click", () => {
                const makeVisible = input.type !== "text";
                setSecretInputVisibility(input, toggleBtn, makeVisible);
            });

            copyBtn.addEventListener("click", async () => {
                try {
                    await copyTextToClipboard(input.value);
                    appendRequestLog(`${label} in Zwischenablage kopiert.`);
                } catch (err) {
                    appendRequestLog(`${label} konnte nicht kopiert werden: ${err.message}`);
                }
            });
        }

        // ===== Basis-Konvertierungen (Bytes, Base64) =====
        
        /**
         * Konvertiert ein Uint8Array in einen Base64-String.
         * Dies wird für Speicherung von binären Daten (salt, iv, ciphertext) verwendet.
         * @param {Uint8Array} bytes - Die zu kodierenden Bytes
         * @returns {string} Base64-kodierter String
         */
        function bytesToBase64(bytes) {
            let binary = "";
            for (const b of bytes) binary += String.fromCharCode(b);
            return btoa(binary);
        }

        /**
         * Konvertiert einen Base64-String zurück in Uint8Array.
         * Umkehroperation zu bytesToBase64.
         * @param {string} base64 - Der zu dekodierte Base64-String
         * @returns {Uint8Array} Die dekodierten Bytes
         */
        function base64ToBytes(base64) {
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return bytes;
        }

        function isValidEncryptedPayload(payload) {
            return !!payload &&
                payload.v === 1 &&
                typeof payload.salt === "string" &&
                typeof payload.iv === "string" &&
                typeof payload.ct === "string";
        }

        // ===== AES-GCM Verschlüsselung (für nsec-Speicherung) =====
        
        /**
         * Leitet einen AES-256 Schlüssel aus einem Passwort ab.
         * Nutzt PBKDF2 (Password-Based Key Derivation Function) mit SHA-256.
         * 
         * Dies ist eine sichere Methode, um aus einem Benutzerpasswort einen starken Verschlüsslungsschlüssel zu generieren.
         * Ohne PBKDF2 wäre das Passwort zu kurz für direkten AES-Einsatz.
         * 
         * @param {string} password - Das Benutzerpasswort
         * @param {Uint8Array} saltBytes - Ein eindeutiger Salt (pro Verschlüsselung neu generiert)
         * @param {number} iterations - PBKDF2 Iterationen (default: PBKDF2_ITERATIONS = 210000)
         * @returns {Promise<CryptoKey>} Ein WebCrypto AES-GCM Schlüssel
         */
        async function deriveAesKeyBytesFromPassword(password, saltBytes, iterations = PBKDF2_ITERATIONS) {
            const enc = new TextEncoder();
            const passwordKey = await crypto.subtle.importKey(
                "raw",
                enc.encode(password),
                "PBKDF2",
                false,
                ["deriveBits"]
            );

            const bits = await crypto.subtle.deriveBits(
                {
                    name: "PBKDF2",
                    salt: saltBytes,
                    iterations,
                    hash: "SHA-256"
                },
                passwordKey,
                256
            );
            return new Uint8Array(bits);
        }

        async function importAesKeyFromRaw(rawKeyBytes, usages = ["decrypt"]) {
            return crypto.subtle.importKey(
                "raw",
                rawKeyBytes,
                { name: "AES-GCM", length: 256 },
                false,
                usages
            );
        }

        async function deriveAesKeyFromPassword(password, saltBytes, iterations = PBKDF2_ITERATIONS) {
            const rawKey = await deriveAesKeyBytesFromPassword(password, saltBytes, iterations);
            return importAesKeyFromRaw(rawKey, ["encrypt", "decrypt"]);
        }

        /**
         * Verschlüssselt einen nsec mit AES-256-GCM.
         * Generiert zufällige salt und iv (Initialization Vector).
         * 
         * Produkt: Ein Object mit folgenden Feldern:
         * - v: Versionsnummer (aktuell 1)
         * - kdf: "PBKDF2-SHA256"
         * - alg: "AES-GCM"
         * - iter: Anzahl der PBKDF2-Iterationen
         * - salt: Base64-kodierter Salt
         * - iv: Base64-kodierter IV
         * - ct: Base64-kodierter Ciphertext (verschlüsselter nsec)
         * 
         * @param {string} nsec - Der zu verschlüsselnde nsec
         * @param {string} password - Das Benutzerpasswort
         * @returns {Promise<object>} Verschlüsslungs-Payload mit ct, salt, iv
         */
        async function encryptNsec(nsec, password) {
            const enc = new TextEncoder();
            // Zufällige salt und iv generieren (für Sicherheit)
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await deriveAesKeyFromPassword(password, salt);
            const ciphertext = new Uint8Array(
                await crypto.subtle.encrypt(
                    { name: "AES-GCM", iv },
                    key,
                    enc.encode(nsec)
                )
            );

            return {
                v: 1,
                kdf: "PBKDF2-SHA256",
                alg: "AES-GCM",
                iter: PBKDF2_ITERATIONS,
                salt: bytesToBase64(salt),
                iv: bytesToBase64(iv),
                ct: bytesToBase64(ciphertext)
            };
        }

        /**
         * Entschlüsselt einen zuvor mit encryptNsec verschlüsselten nsec.
         * Extrahiert salt, iv und ciphertext aus dem Payload und entschlüssselt mit dem Passwort.
         * 
         * @param {object} payload - Das Verschlüsselungs-Object (mit ct, salt, iv, kdf, alg, iter)
         * @param {string} password - Das Benutzerpasswort
         * @returns {Promise<string>} Der entschlüsselte nsec
         * @throws {Error} Wenn Format ungültig oder Passwort falsch ist
         */
        async function decryptNsec(payload, password) {
            if (!isValidEncryptedPayload(payload)) {
                throw new Error("Ungültiges verschlüsseltes Format.");
            }

            const dec = new TextDecoder();
            const salt = base64ToBytes(payload.salt);
            const iv = base64ToBytes(payload.iv);
            const ciphertext = base64ToBytes(payload.ct);
            const key = await deriveAesKeyFromPassword(password, salt, payload.iter || PBKDF2_ITERATIONS);
            const clear = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                ciphertext
            );

            return dec.decode(clear);
        }

        async function deriveUnlockKeyFromPasswordAndPayload(password, payload) {
            if (!isValidEncryptedPayload(payload)) {
                throw new Error("Ungültiges verschlüsseltes Format.");
            }
            const salt = base64ToBytes(payload.salt);
            const rawKey = await deriveAesKeyBytesFromPassword(password, salt, payload.iter || PBKDF2_ITERATIONS);
            return bytesToBase64(rawKey);
        }

        async function decryptNsecWithDerivedKey(payload, derivedKeyBase64) {
            if (!isValidEncryptedPayload(payload)) {
                throw new Error("Ungültiges verschlüsseltes Format.");
            }
            if (typeof derivedKeyBase64 !== "string" || !derivedKeyBase64) {
                throw new Error("Ungültiger Unlock-Cache-Schlüssel.");
            }

            const dec = new TextDecoder();
            const iv = base64ToBytes(payload.iv);
            const ciphertext = base64ToBytes(payload.ct);
            const rawKey = base64ToBytes(derivedKeyBase64);
            const key = await importAesKeyFromRaw(rawKey, ["decrypt"]);
            const clear = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                ciphertext
            );
            return dec.decode(clear);
        }

        function buildUnlockMaterial(unlockKey, payload) {
            if (typeof unlockKey !== "string" || !unlockKey || !isValidEncryptedPayload(payload)) {
                return null;
            }
            return {
                unlockKey,
                salt: payload.salt,
                iter: payload.iter || PBKDF2_ITERATIONS
            };
        }

        async function deriveUnlockMaterialFromPassword(password, payload) {
            const unlockKey = await deriveUnlockKeyFromPasswordAndPayload(password, payload);
            return buildUnlockMaterial(unlockKey, payload);
        }

        function hasSessionUnlockMaterial() {
            return !!sessionUnlockMaterial &&
                typeof sessionUnlockMaterial.unlockKey === "string" &&
                !!sessionUnlockMaterial.unlockKey &&
                typeof sessionUnlockMaterial.salt === "string" &&
                !!sessionUnlockMaterial.salt;
        }

        async function encryptNsecWithUnlockMaterial(nsec, material) {
            if (!material || typeof material.unlockKey !== "string" || typeof material.salt !== "string") {
                throw new Error("Kein gültiges Unlock-Material verfügbar.");
            }

            const enc = new TextEncoder();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const rawKey = base64ToBytes(material.unlockKey);
            const key = await importAesKeyFromRaw(rawKey, ["encrypt"]);
            const ciphertext = new Uint8Array(
                await crypto.subtle.encrypt(
                    { name: "AES-GCM", iv },
                    key,
                    enc.encode(nsec)
                )
            );

            return {
                v: 1,
                kdf: "PBKDF2-SHA256",
                alg: "AES-GCM",
                iter: material.iter || PBKDF2_ITERATIONS,
                salt: material.salt,
                iv: bytesToBase64(iv),
                ct: bytesToBase64(ciphertext)
            };
        }

        // ===== Bech32-Encoding (für nsec-Generierung) =====
        // Bech32 ist das Standard-Encoding für Nostr-Werte (nsec, npub, note, usw.)
        // Format: hrp1 + bech32-encoded-data + 6-stellige Checksumme
        
        /**
         * Berechnet das Bech32-Polynom (Checksummen-Algorithmus).
         * Dies wird verwendet um Bech32-Strings zu validieren und zu checksum-en.
         * 
         * @param {array} values - Array von 5-Bit-Werten
         * @returns {number} Das Polynom-Ergebnis
         */
        function bech32Polymod(values) {
            let chk = 1;
            for (const v of values) {
                const top = chk >> 25;
                chk = ((chk & 0x1ffffff) << 5) ^ v;
                for (let i = 0; i < 5; i++) {
                    if ((top >> i) & 1) chk ^= BECH32_GENERATORS[i];
                }
            }
            return chk;
        }

        /**
         * Expandiert das Human Readable Part (HRP) für Bech32-Checksumme.
         * Konvertiert HRP zu speziellem Format für Polynom-Berechnung.
         * 
         * @param {string} hrp - Das HRP (z.B. "nsec")
         * @returns {array} Expandiertes HRP als Array von 5-Bit-Werten
         */
        function bech32HrpExpand(hrp) {
            const out = [];
            for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) >> 5);
            out.push(0);
            for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) & 31);
            return out;
        }

        /**
         * Erstellt die 6-stellige Bech32-Checksumme für ein HRP und seine Daten.
         * 
         * @param {string} hrp - Das Human Readable Part (z.B. "nsec")
         * @param {array} data - Die 5-Bit-Daten zum Checksum-en
         * @returns {array} 6-stelliges Checksum als Array
         */
        function bech32CreateChecksum(hrp, data) {
            const values = [...bech32HrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
            const polymod = bech32Polymod(values) ^ 1;
            const out = [];
            for (let p = 0; p < 6; p++) {
                out.push((polymod >> (5 * (5 - p))) & 31);
            }
            return out;
        }

        /**
         * Kodiert Daten in Bech32-Format mit HRP und Checksumme.
         * Dies wird verwendet um nsec1... oder npub1... Strings zu generieren.
         * 
         * @param {string} hrp - Das Human Readable Part ("nsec" oder "npub")
         * @param {array} data - Die 5-Bit-Daten zum Kodieren
         * @returns {string} Der fertig kodierte Bech32-String (z.B. "nsec1...")
         */
        function bech32Encode(hrp, data) {
            const combined = [...data, ...bech32CreateChecksum(hrp, data)];
            let encoded = `${hrp}1`;
            for (const d of combined) encoded += BECH32_CHARSET[d];
            return encoded;
        }

        /**
         * Konvertiert Bits zwischen verschiedenen Breiten.
         * Wird von Bech32-Encoding verwendet um 8-Bit Bytes zu 5-Bit Werten zu konvertieren.
         * 
         * @param {array} data - Die zu konvertierenden Daten
         * @param {number} fromBits - Quell-Bit-Breite (normalerweise 8)
         * @param {number} toBits - Ziel-Bit-Breite (normalerweise 5)
         * @param {boolean} pad - true um mit Nullen zu padden wenn nötig
         * @returns {array} Die konvertierten Daten
         * @throws {Error} Bei ungültigen Eingabe-Werten oder Padding-Problemen
         */
        function convertBits(data, fromBits, toBits, pad = true) {
            let acc = 0;
            let bits = 0;
            const out = [];
            const maxv = (1 << toBits) - 1;
            const maxAcc = (1 << (fromBits + toBits - 1)) - 1;

            for (const value of data) {
                if (value < 0 || (value >> fromBits) !== 0) throw new Error("Ungültige Bit-Konvertierung.");
                acc = ((acc << fromBits) | value) & maxAcc;
                bits += fromBits;
                while (bits >= toBits) {
                    bits -= toBits;
                    out.push((acc >> bits) & maxv);
                }
            }

            if (pad) {
                if (bits > 0) out.push((acc << (toBits - bits)) & maxv);
            } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
                throw new Error("Ungültiges Padding in Bit-Konvertierung.");
            }

            return out;
        }

        /**
         * Generiert einen random nsec (geheime Schlüssel-Darstellung).
         * 
         * Prozess:
         * 1. 32 zufällige Bytes generieren (256 Bits)
         * 2. In 5-Bit-Format konvertieren (für Bech32)
         * 3. Mit "nsec" HRP in Bech32-Format enkodieren
         * 
         * @returns {string} Ein neuer randomisierter nsec1... String
         */
        function generateRandomNsec() {
            const secret = crypto.getRandomValues(new Uint8Array(32));
            const words = convertBits(secret, 8, 5, true);
            return bech32Encode("nsec", words);
        }

        // ===== WordPress User ID Bindings =====
        // Ermöglicht es, WordPress User-IDs an spezifische Nostr-Schlüssel zu binden
        // (nützlich für WordPress Integrations mit Nostr-Authentifizierung)
        
        /**
         * Normalisiert eine WordPress User-ID und führt Validierung durch.
         * 
         * @param {string} userId - Die zu normalisierende WP User-ID
         * @returns {string} Die normalisierte User-ID (trimmed)
         * @throws {Error} Wenn userId leer oder zu lang ist
         */
        function normalizeWpUserId(userId) {
            const normalized = String(userId ?? "").trim();
            if (!normalized) throw new Error("userId fehlt.");
            if (normalized.length > 128) throw new Error("userId ist zu lang (max. 128 Zeichen).");
            return normalized;
        }

        /**
         * Erzeugt ein Label für einen WP User-Binding aus der User-ID.
         * Nutzt nur sichere Zeichen (lowercase, a-z0-9._-)
         * 
         * @param {string|number} userId - Die WordPress User-ID
         * @returns {string} Ein Label wie "WP admin" oder "WP user-123"
         */
        function wpBindingLabelForUser(userId) {
            const compact = String(userId)
                .toLowerCase()
                .replace(/[^a-z0-9._-]+/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
            return compact ? `WP ${compact}` : "WP User Key";
        }

        /**
         * Lädt die WP User ID -> Nostr Key ID Bindings aus localStorage.
         * Format: { v: 1, byUserId: { "user1": "key_xyz", ... } }
         * 
         * @returns {object} Das Bindings-Objekt oder leerer Default
         */
        function loadWpUserBindings() {
            try {
                const raw = localStorage.getItem(WP_USER_BINDINGS_STORAGE_KEY);
                if (!raw) return { v: 1, byUserId: {} };
                const parsed = JSON.parse(raw);
                if (!parsed || parsed.v !== 1 || typeof parsed.byUserId !== "object" || parsed.byUserId === null) {
                    return { v: 1, byUserId: {} };
                }

                const sanitized = {};
                for (const [userId, keyId] of Object.entries(parsed.byUserId)) {
                    if (typeof userId === "string" && userId && typeof keyId === "string" && keyId) {
                        sanitized[userId] = keyId;
                    }
                }
                return { v: 1, byUserId: sanitized };
            } catch (_err) {
                return { v: 1, byUserId: {} };
            }
        }

        /**
         * Speichert die WP User ID -> Key ID Bindings im localStorage.
         * 
         * @param {object} bindings - Das zu speichernde Bindings-Objekt
         */
        function saveWpUserBindings(bindings) {
            localStorage.setItem(WP_USER_BINDINGS_STORAGE_KEY, JSON.stringify(bindings));
        }

        // ===== Unlock-Cache (Session und TTL-basiert) =====
        // Speichert einen abgeleiteten Schlüssel (nicht das Klartext-Passwort)
        
        /**
         * Löscht den Unlock-Cache vollständig:
         * - Session-Cache aus sessionStorage
         * - TTL-Cache aus localStorage
         */
        function clearUnlockCache() {
            sessionStorage.removeItem(UNLOCK_CACHE_SESSION_KEY);
            localStorage.removeItem(UNLOCK_CACHE_TTL_KEY);
        }

        function isValidUnlockCacheRecord(parsed, requiresExpiry = false) {
            if (!parsed || parsed.v !== 2) return false;
            if (typeof parsed.unlockKey !== "string" || !parsed.unlockKey) return false;
            if (requiresExpiry) {
                return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
            }
            return true;
        }

        /**
         * Lädt den Unlock-Cache aus Session- oder localStorage.
         * Gibt Priorität dem Session-Cache (wird beim Tab-Schließen gelöscht).
         * Prüft TTL bei TTL-Cache und löscht abgelaufene Caches.
         * 
         * @returns {object|null} { mode: "session"|"ttl", unlockKey: str, keyId: str } oder null
         */
        function loadUnlockCache() {
            try {
                const sessionRaw = sessionStorage.getItem(UNLOCK_CACHE_SESSION_KEY);
                if (sessionRaw) {
                    const sessionParsed = JSON.parse(sessionRaw);
                    if (isValidUnlockCacheRecord(sessionParsed, false)) {
                        return {
                            mode: "session",
                            unlockKey: sessionParsed.unlockKey,
                            keyId: typeof sessionParsed.keyId === "string" ? sessionParsed.keyId : null
                        };
                    }
                    sessionStorage.removeItem(UNLOCK_CACHE_SESSION_KEY);
                }
            } catch (_err) {
                sessionStorage.removeItem(UNLOCK_CACHE_SESSION_KEY);
            }

            try {
                const ttlRaw = localStorage.getItem(UNLOCK_CACHE_TTL_KEY);
                if (!ttlRaw) return null;
                const ttlParsed = JSON.parse(ttlRaw);
                if (!isValidUnlockCacheRecord(ttlParsed, true)) {
                    localStorage.removeItem(UNLOCK_CACHE_TTL_KEY);
                    return null;
                }
                return {
                    mode: "ttl",
                    unlockKey: ttlParsed.unlockKey,
                    keyId: typeof ttlParsed.keyId === "string" ? ttlParsed.keyId : null
                };
            } catch (_err) {
                localStorage.removeItem(UNLOCK_CACHE_TTL_KEY);
                return null;
            }
        }

        /**
         * Speichert einen abgeleiteten Unlock-Schlüssel temporär.
         * 
         * Modes:
         * - "none": Keinen Cache speichern (löscht existierenden Cache)
         * - "session": Im sessionStorage (wird mit Tab-Schließen gelöscht)
         * - "15m": Im localStorage mit 15 Minuten TTL
         * - "1h": Im localStorage mit 1 Stunde TTL
         * 
         * @param {string} password - Das Passwort (nur zur Ableitung, wird nicht gespeichert)
         * @param {string} keyId - Die ID des zu speichernden Schlüssels (optional)
         * @param {object} payload - Der verschlüsselte Keyring-Payload des aktiven Schlüssels
         * @param {string} mode - Der Speicher-Modus ("session", "15m", "1h", "none")
         */
        async function saveUnlockCache(password, keyId, payload, mode) {
            clearUnlockCache();
            if (!password || mode === "none") return;
            if (!isValidEncryptedPayload(payload)) return;

            const unlockKey = await deriveUnlockKeyFromPasswordAndPayload(password, payload);
            const now = Date.now();

            if (mode === "session") {
                sessionStorage.setItem(
                    UNLOCK_CACHE_SESSION_KEY,
                    JSON.stringify({ v: 2, keyId: keyId || null, unlockKey, savedAt: now })
                );
                return;
            }

            let ttlMs = 0;
            if (mode === "15m") ttlMs = 15 * 60 * 1000;
            if (mode === "1h") ttlMs = 60 * 60 * 1000;
            if (ttlMs <= 0) return;

            localStorage.setItem(
                UNLOCK_CACHE_TTL_KEY,
                JSON.stringify({
                    v: 2,
                    keyId: keyId || null,
                    unlockKey,
                    savedAt: now,
                    expiresAt: now + ttlMs
                })
            );
        }

        /**
         * Aktualisiert Key-ID und Unlock-Schlüssel im Cache.
         * Nützlich wenn der Benutzer zwischen Schlüsseln wechselt.
         * 
         * @param {string} keyId - Die neue Key-ID
         * @param {string} password - Aktuelles Passwort (nur zur Ableitung)
         * @param {object} payload - Verschlüsselter Payload des neuen aktiven Schlüssels
         */
        async function updateUnlockCacheKeyId(keyId, password, payload) {
            if (!keyId || !password || !isValidEncryptedPayload(payload)) return;
            const unlockKey = await deriveUnlockKeyFromPasswordAndPayload(password, payload);
            const now = Date.now();

            try {
                const sessionRaw = sessionStorage.getItem(UNLOCK_CACHE_SESSION_KEY);
                if (sessionRaw) {
                    const parsed = JSON.parse(sessionRaw);
                    if (isValidUnlockCacheRecord(parsed, false)) {
                        parsed.keyId = keyId;
                        parsed.unlockKey = unlockKey;
                        sessionStorage.setItem(UNLOCK_CACHE_SESSION_KEY, JSON.stringify(parsed));
                    }
                }
            } catch (_err) {
                sessionStorage.removeItem(UNLOCK_CACHE_SESSION_KEY);
            }

            try {
                const ttlRaw = localStorage.getItem(UNLOCK_CACHE_TTL_KEY);
                if (ttlRaw) {
                    const parsed = JSON.parse(ttlRaw);
                    if (isValidUnlockCacheRecord(parsed, true)) {
                        parsed.keyId = keyId;
                        parsed.unlockKey = unlockKey;
                        localStorage.setItem(UNLOCK_CACHE_TTL_KEY, JSON.stringify(parsed));
                    } else if (parsed?.expiresAt <= now) {
                        localStorage.removeItem(UNLOCK_CACHE_TTL_KEY);
                    }
                }
            } catch (_err) {
                localStorage.removeItem(UNLOCK_CACHE_TTL_KEY);
            }
        }

        // ===== Keyring-Verwaltung (Speicherung und Abruf) =====
        
        /**
         * Generiert eine eindeutige ID für einen neuen Keyring-Eintrag.
         * Format: key_<timestamp36>_<randomhex>
         * 
         * @returns {string} Die neue eindeutige Key-ID
         */
        function generateKeyId() {
            return `key_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        }

        /**
         * Lädt das gesamte Keyring aus dem localStorage.
         * Das Keyring ist ein Array von verschlüsselten Schlüssel-Einträgen.
         * 
         * Format:
         * {
         *   v: 1,
         *   keys: [
         *     { id: "key_...", name: "...", createdAt: timestamp, payload: {...encrypted...} },
         *     ...
         *   ]
         * }
         * 
         * @returns {object|null} Das Keyring-Objekt oder null wenn nicht vorhanden/ungültig
         */
        function loadKeyring() {
            try {
                const raw = localStorage.getItem(KEYRING_STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.keys)) return null;
                const keys = parsed.keys
                    .filter((entry) => entry && typeof entry.id === "string" && entry.id && entry.payload && typeof entry.payload === "object")
                    .map((entry) => ({
                        id: entry.id,
                        name: normalizeKeyName(entry.name),
                        createdAt: typeof entry.createdAt === "number" ? entry.createdAt : Date.now(),
                        payload: entry.payload
                    }));
                if (keys.length === 0) return null;
                return { v: 1, keys };
            } catch (_err) {
                return null;
            }
        }

        /**
         * Speichert das gesamte Keyring im localStorage.
         * Das Keyring ist jetzt ein Array - jeder Schlüssel ist separat verschlüsselt.
         * 
         * @param {object} keyring - Das zu speichernde Keyring-Objekt mit keys-Array
         */
        function saveKeyring(keyring) {
            localStorage.setItem(KEYRING_STORAGE_KEY, JSON.stringify(keyring));
        }

        /**
         * Lädt die ID des aktuell aktiven Schlüssels aus dem Storage.
         * Diese ID wird verwendet um nach dem Reload den richtigen Schlüssel zu aktivieren.
         * 
         * @returns {string|null} Die aktive Key-ID oder null
         */
        function activeKeyIdFromStorage() {
            return localStorage.getItem(ACTIVE_KEY_ID_STORAGE_KEY);
        }

        /**
         * Speichert die ID des aktuell aktiven Schlüssels.
         * 
         * @param {string} id - Die zu speichernde Key-ID
         */
        function setActiveKeyId(id) {
            localStorage.setItem(ACTIVE_KEY_ID_STORAGE_KEY, id);
        }

        /**
         * Findet und gibt einen Keyring-Eintrag zurück, basierend auf bevorzugter oder Standard-Auswahl.
         * 
         * Priorität:
         * 1. Wenn preferredId vorhanden: Suche diesen Eintrag
         * 2. Fallback: Nutze den ersten (index 0) Eintrag
         * 
         * @param {object} keyring - Das Keyring-Objekt mit keys-Array
         * @param {string} preferredId - Bevorzugte Key-ID (optional)
         * @returns {object} { entry: Eintrag, index: Array-Index }
         */
        function resolveActiveKeyEntry(keyring, preferredId = null) {
            const wanted = preferredId || activeKeyIdFromStorage();
            if (wanted) {
                const idx = keyring.keys.findIndex((entry) => entry.id === wanted);
                if (idx >= 0) return { entry: keyring.keys[idx], index: idx };
            }
            return { entry: keyring.keys[0], index: 0 };
        }

        /**
         * Erstellt einen neuen Keyring-Eintrag durch Verschlüsselung des nsec.
         * 
         * @param {string} nsec - Der nsec zum Verschlüsseln
         * @param {string} password - Das Passwort zum Verschlüsseln
         * @param {string} name - Optionaler Name für diesen Schlüssel
         * @returns {Promise<object>} Ein neuer Keyring-Eintrag { id, name, createdAt, payload }
         */
        async function createKeyringEntry(nsec, password, name = "") {
            return {
                id: generateKeyId(),
                name: normalizeKeyName(name),
                createdAt: Date.now(),
                payload: await encryptNsec(nsec, password)
            };
        }

        async function createKeyringEntryWithSessionMaterial(nsec, name = "") {
            if (sessionPassword) {
                return createKeyringEntry(nsec, sessionPassword, name);
            }
            if (!hasSessionUnlockMaterial()) {
                throw new Error("Keine Entsperrinformation vorhanden. Bitte Passwort bestätigen.");
            }
            return {
                id: generateKeyId(),
                name: normalizeKeyName(name),
                createdAt: Date.now(),
                payload: await encryptNsecWithUnlockMaterial(nsec, sessionUnlockMaterial)
            };
        }

        async function ensureSessionPassword() {
            if (sessionPassword) return sessionPassword;
            if (!currentKeyring || !Array.isArray(currentKeyring.keys) || currentKeyring.keys.length === 0) {
                throw new Error("Kein Keyring geladen.");
            }

            const { entry: activeEntry } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
            let previewSessionPasswordNsec = "";
            const unlock = await showUnlockPanel({
                title: "Passwort bestätigen",
                hint: "Für diese Aktion bitte das aktuelle Keyring-Passwort eingeben.",
                askNsec: false,
                askConfirm: false,
                askName: false,
                askKey: false,
                askRemember: false,
                modal: true,
                submitLabel: "Bestätigen",
                beforeSubmit: async (draft) => {
                    previewSessionPasswordNsec = "";
                    if (!draft.password) return "Bitte Passwort eingeben.";
                    try {
                        const testNsec = await decryptNsec(activeEntry.payload, draft.password);
                        if (!isValidNsec(testNsec)) return "Passwort ist ungueltig.";
                        previewSessionPasswordNsec = testNsec;
                        return true;
                    } catch (_err) {
                        return "Passwort ist ungueltig.";
                    }
                }
            });
            if (!unlock.password) throw new Error("Kein Passwort angegeben.");
            if (!previewSessionPasswordNsec) throw new Error("Passwort ist ungültig.");

            sessionPassword = unlock.password;
            sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(unlock.password, activeEntry.payload);
            return sessionPassword;
        }

        async function confirmKeyringPasswordForSecurityAction(actionHint) {
            if (!currentKeyring || !Array.isArray(currentKeyring.keys) || currentKeyring.keys.length === 0) {
                throw new Error("Kein Keyring geladen.");
            }

            const { entry: activeEntry } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
            let previewConfirmedNsec = "";
            const unlock = await showUnlockPanel({
                title: "Sicherheitsaktion bestätigen",
                hint: actionHint || "Bitte aktuelles Keyring-Passwort eingeben.",
                askNsec: false,
                askConfirm: false,
                askName: false,
                askKey: false,
                askRemember: false,
                modal: true,
                submitLabel: "Bestätigen",
                beforeSubmit: async (draft) => {
                    previewConfirmedNsec = "";
                    if (!draft.password) return "Bitte Passwort eingeben.";
                    try {
                        const testNsec = await decryptNsec(activeEntry.payload, draft.password);
                        if (!isValidNsec(testNsec)) return "Passwort ist ungültig.";
                        previewConfirmedNsec = testNsec;
                        return true;
                    } catch (_err) {
                        return "Passwort ist ungültig.";
                    }
                }
            });

            if (!unlock.password || !previewConfirmedNsec) {
                throw new Error("Passwort ist ungültig.");
            }

            sessionPassword = unlock.password;
            sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(unlock.password, activeEntry.payload);
        }

        async function ensureWpUserKey(userIdRaw) {
            if (!currentKeyring) {
                throw new Error("Signer ist gesperrt. Bitte zuerst entsperren.");
            }
            const password = await ensureSessionPassword();

            const userId = normalizeWpUserId(userIdRaw);
            const bindings = loadWpUserBindings();
            const boundKeyId = bindings.byUserId[userId];

            if (boundKeyId) {
                const existingIndex = currentKeyring.keys.findIndex((entry) => entry.id === boundKeyId);
                if (existingIndex >= 0) {
                    const existingEntry = currentKeyring.keys[existingIndex];
                    const existingNsec = await decryptNsec(existingEntry.payload, password);
                    if (!isValidNsec(existingNsec)) {
                        throw new Error("Gebundener Schlüssel ist ungültig.");
                    }
                    const existingUser = await new NDKPrivateKeySigner(existingNsec).user();
                    appendRequestLog(`WP-Binding gefunden: ${userId} -> ${keyDisplayName(existingEntry, existingIndex)}`);
                    return {
                        userId,
                        keyId: existingEntry.id,
                        keyName: keyDisplayName(existingEntry, existingIndex),
                        pubkey: existingUser.pubkey,
                        npub: existingUser.npub,
                        existed: true,
                        active: existingEntry.id === activeKeyId
                    };
                }
                delete bindings.byUserId[userId];
            }

            const nsec = generateRandomNsec();
            const newEntry = await createKeyringEntry(nsec, password, wpBindingLabelForUser(userId));
            currentKeyring.keys.push(newEntry);
            saveKeyring(currentKeyring);

            bindings.byUserId[userId] = newEntry.id;
            saveWpUserBindings(bindings);

            const createdUser = await new NDKPrivateKeySigner(nsec).user();
            appendRequestLog(`WP-Binding erstellt: ${userId} -> ${keyDisplayName(newEntry, currentKeyring.keys.length - 1)}`);
            renderKeyManager();
            return {
                userId,
                keyId: newEntry.id,
                keyName: keyDisplayName(newEntry, currentKeyring.keys.length - 1),
                pubkey: createdUser.pubkey,
                npub: createdUser.npub,
                existed: false,
                active: newEntry.id === activeKeyId
            };
        }

        async function getOrAskActiveKey() {
            if (!crypto?.subtle) {
                throw new Error("WebCrypto nicht verfügbar. Nutze HTTPS oder localhost.");
            }

            const keyring = loadKeyring();
            if (keyring) {
                const { entry: defaultEntry } = resolveActiveKeyEntry(keyring);
                const cachedUnlock = loadUnlockCache();
                if (cachedUnlock?.unlockKey) {
                    const { entry: cachedEntry, index: cachedIndex } = resolveActiveKeyEntry(keyring, cachedUnlock.keyId || defaultEntry.id);
                    try {
                        const cachedNsec = await decryptNsecWithDerivedKey(cachedEntry.payload, cachedUnlock.unlockKey);
                        if (!isValidNsec(cachedNsec)) throw new Error("invalid cached nsec");
                        setActiveKeyId(cachedEntry.id);
                        appendRequestLog(`Auto-Entsperrt (${cachedUnlock.mode === "session" ? "Session" : "TTL"}): ${keyDisplayName(cachedEntry, cachedIndex)}`);
                        return {
                            nsec: cachedNsec,
                            password: "",
                            unlockMaterial: buildUnlockMaterial(cachedUnlock.unlockKey, cachedEntry.payload),
                            keyId: cachedEntry.id,
                            keyName: keyDisplayName(cachedEntry, cachedIndex),
                            keyring
                        };
                    } catch (_err) {
                        clearUnlockCache();
                        appendRequestLog("Gespeicherte Entsperrung war ungueltig und wurde entfernt.");
                    }
                }
                postBridgeMessage("locked", { reason: "Passwort benötigt." });
                let previewUnlockNsec = "";
                const unlock = await showUnlockPanel({
                    title: "Signer entsperren",
                    hint: "Bitte Passwort eingeben und optional gespeicherten Schlüssel wählen.",
                    askNsec: false,
                    askConfirm: false,
                    askName: false,
                    askKey: true,
                    askRemember: true,
                    defaultRememberMode: "none",
                    keyOptions: keyring.keys.map((entry, index) => ({
                        id: entry.id,
                        label: keyDisplayName(entry, index)
                    })),
                    defaultKeyId: defaultEntry.id,
                    submitLabel: "Entsperren",
                    beforeSubmit: async (draft) => {
                        previewUnlockNsec = "";
                        if (!draft.password) {
                            return "Bitte Passwort eingeben.";
                        }

                        const { entry: draftEntry } = resolveActiveKeyEntry(keyring, draft.keyId || defaultEntry.id);
                        if (!isValidEncryptedPayload(draftEntry?.payload)) {
                            return "Schlüssel-Daten sind ungueltig oder beschaedigt.";
                        }

                        try {
                            const nsec = await decryptNsec(draftEntry.payload, draft.password);
                            if (!isValidNsec(nsec)) {
                                return "Entschluesselter Schluessel ist ungueltig.";
                            }
                            previewUnlockNsec = nsec;
                            return true;
                        } catch (err) {
                            devLog("Unlock decrypt failed:", err);
                            return "Entsperren fehlgeschlagen. Passwort oder Daten sind ungueltig.";
                        }
                    }
                });
                if (!unlock.password) throw new Error("Kein Passwort angegeben.");

                const { entry: selectedEntry, index: selectedIndex } = resolveActiveKeyEntry(keyring, unlock.keyId || defaultEntry.id);
                const nsec = previewUnlockNsec || await decryptNsec(selectedEntry.payload, unlock.password);
                if (!isValidNsec(nsec)) throw new Error("Ungültiger nsec nach Entschlüsselung.");
                setActiveKeyId(selectedEntry.id);
                await saveUnlockCache(unlock.password, selectedEntry.id, selectedEntry.payload, unlock.rememberMode || "none");
                return {
                    nsec,
                    password: unlock.password,
                    unlockMaterial: await deriveUnlockMaterialFromPassword(unlock.password, selectedEntry.payload),
                    keyId: selectedEntry.id,
                    keyName: keyDisplayName(selectedEntry, selectedIndex),
                    keyring
                };
            }

            const encryptedRaw = localStorage.getItem(ENCRYPTED_NSEC_STORAGE_KEY);
            if (encryptedRaw) {
                postBridgeMessage("locked", { reason: "Migration auf Keyring." });
                const unlock = await showUnlockPanel({
                    title: "Signer entsperren (Migration)",
                    hint: "Bitte Passwort eingeben, um den bisherigen Schlüssel ins neue Keyring-Format zu migrieren.",
                    askNsec: false,
                    askConfirm: false,
                    askName: false,
                    askKey: false,
                    askRemember: true,
                    defaultRememberMode: "none",
                    submitLabel: "Entsperren & migrieren"
                });
                if (!unlock.password) throw new Error("Kein Passwort angegeben.");

                try {
                    const payload = JSON.parse(encryptedRaw);
                    const nsec = await decryptNsec(payload, unlock.password);
                    if (!isValidNsec(nsec)) throw new Error("Ungültiger nsec nach Entschlüsselung.");
                    const firstEntry = await createKeyringEntry(nsec, unlock.password, "Migrated Key");
                    const migratedKeyring = { v: 1, keys: [firstEntry] };
                    saveKeyring(migratedKeyring);
                    setActiveKeyId(firstEntry.id);
                    await saveUnlockCache(unlock.password, firstEntry.id, firstEntry.payload, unlock.rememberMode || "none");
                    localStorage.removeItem(ENCRYPTED_NSEC_STORAGE_KEY);
                    localStorage.removeItem(LEGACY_NSEC_STORAGE_KEY);
                    appendRequestLog("Migration: alter verschlüsselter Storage wurde ins Keyring-Format übernommen.");
                    return {
                        nsec,
                        password: unlock.password,
                        unlockMaterial: await deriveUnlockMaterialFromPassword(unlock.password, firstEntry.payload),
                        keyId: firstEntry.id,
                        keyName: keyDisplayName(firstEntry, 0),
                        keyring: migratedKeyring
                    };
                } catch (_err) {
                    throw new Error("Migration fehlgeschlagen. Passwort oder Alt-Daten sind ungültig.");
                }
            }

            const legacy = localStorage.getItem(LEGACY_NSEC_STORAGE_KEY);
            if (isValidNsec(legacy)) {
                postBridgeMessage("locked", { reason: "Migration von Klartext-nsec auf verschlüsselten Keyring." });
                const unlock = await showUnlockPanel({
                    title: "Signer absichern",
                    hint: "Klartext-nsec gefunden. Bitte Passwort setzen und optional Schlüssel benennen.",
                    askNsec: false,
                    askConfirm: true,
                    askName: true,
                    askKey: false,
                    askRemember: true,
                    defaultRememberMode: "none",
                    submitLabel: "Migrieren"
                });
                if (!unlock.password) throw new Error("Kein Passwort angegeben.");
                if (unlock.password.length < 8) throw new Error("Passwort muss mindestens 8 Zeichen haben.");
                if (unlock.password !== unlock.passwordConfirm) throw new Error("Passwörter stimmen nicht überein.");

                const firstEntry = await createKeyringEntry(legacy, unlock.password, unlock.keyName);
                const migratedKeyring = { v: 1, keys: [firstEntry] };
                saveKeyring(migratedKeyring);
                setActiveKeyId(firstEntry.id);
                await saveUnlockCache(unlock.password, firstEntry.id, firstEntry.payload, unlock.rememberMode || "none");
                localStorage.removeItem(ENCRYPTED_NSEC_STORAGE_KEY);
                localStorage.removeItem(LEGACY_NSEC_STORAGE_KEY);
                appendRequestLog("Klartext-nsec wurde in verschlüsselten Keyring migriert.");
                return {
                    nsec: legacy,
                    password: unlock.password,
                    unlockMaterial: await deriveUnlockMaterialFromPassword(unlock.password, firstEntry.payload),
                    keyId: firstEntry.id,
                    keyName: keyDisplayName(firstEntry, 0),
                    keyring: migratedKeyring
                };
            }

            postBridgeMessage("locked", { reason: "Ersteinrichtung erforderlich." });
            const setup = await showUnlockPanel({
                title: "Signer einrichten",
                hint: "Bitte nsec eingeben oder generieren, Passwort setzen und optional einen Namen vergeben.",
                askNsec: true,
                askConfirm: true,
                askName: true,
                askKey: false,
                askRemember: true,
                defaultRememberMode: "none",
                allowGenerate: true,
                submitLabel: "Speichern & entsperren"
            });
            if (!setup.nsec) throw new Error("Kein nsec angegeben.");
            if (!isValidNsec(setup.nsec)) {
                throw new Error("Ungültiger nsec. Erwartet wird ein kompletter nsec1...-Wert.");
            }
            if (!setup.password) throw new Error("Kein Passwort angegeben.");
            if (setup.password.length < 8) throw new Error("Passwort muss mindestens 8 Zeichen haben.");
            if (setup.password !== setup.passwordConfirm) throw new Error("Passwörter stimmen nicht überein.");

            const firstEntry = await createKeyringEntry(setup.nsec, setup.password, setup.keyName);
            const newKeyring = { v: 1, keys: [firstEntry] };
            saveKeyring(newKeyring);
            setActiveKeyId(firstEntry.id);
            await saveUnlockCache(setup.password, firstEntry.id, firstEntry.payload, setup.rememberMode || "none");
            localStorage.removeItem(ENCRYPTED_NSEC_STORAGE_KEY);
            localStorage.removeItem(LEGACY_NSEC_STORAGE_KEY);
            appendRequestLog("nsec verschlüsselt im Keyring gespeichert.");
            return {
                nsec: setup.nsec,
                password: setup.password,
                unlockMaterial: await deriveUnlockMaterialFromPassword(setup.password, firstEntry.payload),
                keyId: firstEntry.id,
                keyName: keyDisplayName(firstEntry, 0),
                keyring: newKeyring
            };
        }

        function formatRequestParams(request) {
            const params = request?.params;
            if (!params) return "(keine)";

            try {
                if (request.method === "sign_event" && typeof params.rawEvent === "function") {
                    return JSON.stringify(params.rawEvent(), null, 2);
                }

                if (typeof params === "string") return params;
                return JSON.stringify(params, null, 2);
            } catch (_err) {
                return "[Parameter konnten nicht serialisiert werden]";
            }
        }

        function appendRequestLog(line) {
            const logEl = document.getElementById("request-log");
            const now = new Date().toLocaleTimeString();
            const previous = logEl.innerText ? `${logEl.innerText}\n` : "";
            const combined = `[${now}] ${line}\n${previous}`.split("\n").slice(0, 60).join("\n");
            logEl.innerText = combined.trimEnd();
            scheduleFrameSizeNotification();
        }

        function intrinsicBodyContentHeight() {
            const body = document.body;
            if (!body) return 0;

            const bodyTop = body.getBoundingClientRect().top;
            let maxBottom = 0;
            for (const child of body.children) {
                const style = window.getComputedStyle(child);
                if (style.display === "none") continue;
                if (style.position === "fixed") continue;
                const rect = child.getBoundingClientRect();
                if (!Number.isFinite(rect.bottom) || !Number.isFinite(rect.top)) continue;
                const bottom = rect.bottom - bodyTop;
                maxBottom = Math.max(maxBottom, bottom);
            }
            return Math.max(0, Math.ceil(maxBottom));
        }

        function computeDocumentHeight() {
            const body = document.body;
            const intrinsic = intrinsicBodyContentHeight();

            if (intrinsic > 0) return intrinsic + 2;

            return Math.max(
                body?.scrollHeight || 0,
                body?.offsetHeight || 0
            );
        }

        function notifyParentFrameSize(force = false) {
            const height = Math.max(110, computeDocumentHeight());
            if (!force && Math.abs(height - lastPostedFrameHeight) < 4) return;
            lastPostedFrameHeight = height;
            postBridgeMessage("frame-size", { height });
        }

        function scheduleFrameSizeNotification(force = false) {
            if (force) {
                frameSizeNotifyScheduled = false;
                notifyParentFrameSize(true);
                return;
            }
            if (frameSizeNotifyScheduled) return;
            frameSizeNotifyScheduled = true;
            requestAnimationFrame(() => {
                frameSizeNotifyScheduled = false;
                notifyParentFrameSize(false);
            });
        }

        function setupFrameAutoResizeBridge() {
            const resizeTarget = document.documentElement;

            if (typeof ResizeObserver === "function") {
                const ro = new ResizeObserver(() => scheduleFrameSizeNotification(false));
                ro.observe(resizeTarget);
                if (document.body) ro.observe(document.body);
            }

            window.addEventListener("resize", () => scheduleFrameSizeNotification(false));
            scheduleFrameSizeNotification(true);
        }

        function setActiveTab(tabName) {
            const tabs = ["signer", "info", "management", "security"];
            for (const tab of tabs) {
                const panel = document.getElementById(`tab-${tab}`);
                const btn = document.getElementById(`tab-btn-${tab}`);
                if (panel) panel.classList.toggle("active", tab === tabName);
                if (btn) btn.classList.toggle("active", tab === tabName);
            }
            if (tabName === "security") renderPermissionManager();
            scheduleFrameSizeNotification(false);
        }

        function setupTabNavigation() {
            const signerBtn = document.getElementById("tab-btn-signer");
            const infoBtn = document.getElementById("tab-btn-info");
            const managementBtn = document.getElementById("tab-btn-management");
            const securityBtn = document.getElementById("tab-btn-security");

            signerBtn.addEventListener("click", () => setActiveTab("signer"));
            infoBtn.addEventListener("click", () => setActiveTab("info"));
            managementBtn.addEventListener("click", () => setActiveTab("management"));
            securityBtn.addEventListener("click", () => setActiveTab("security"));
        }

        function setCompactConnectedMode(enabled) {
            document.body.classList.toggle("compact-connected", Boolean(enabled));
            scheduleFrameSizeNotification(true);
        }

        function renderStandaloneConnectionInfo() {
            const box = document.getElementById("standalone-connection-box");
            const bunkerInput = document.getElementById("standalone-bunker-uri");
            const nostrconnectInput = document.getElementById("standalone-nostrconnect-uri");
            if (!box || !bunkerInput || !nostrconnectInput) return;

            if (
                isEmbeddedContext ||
                !connectionInfo ||
                typeof connectionInfo.bunkerUri !== "string" ||
                typeof connectionInfo.nostrconnectUri !== "string"
            ) {
                box.hidden = true;
                bunkerInput.value = "";
                nostrconnectInput.value = "";
                scheduleFrameSizeNotification(false);
                return;
            }

            bunkerInput.value = connectionInfo.bunkerUri;
            nostrconnectInput.value = connectionInfo.nostrconnectUri;
            box.hidden = false;
            scheduleFrameSizeNotification(false);
        }

        function showUnlockPanel(options) {
            const panel = document.getElementById("unlock-panel");
            const unlockOverlay = document.getElementById("unlock-overlay");
            const titleEl = document.getElementById("unlock-title");
            const hintEl = document.getElementById("unlock-hint");
            const keyRow = document.getElementById("unlock-key-row");
            const nameRow = document.getElementById("unlock-name-row");
            const nsecRow = document.getElementById("unlock-nsec-row");
            const generateRow = document.getElementById("unlock-generate-row");
            const confirmRow = document.getElementById("unlock-password-confirm-row");
            const rememberRow = document.getElementById("unlock-remember-row");
            const keySelect = document.getElementById("unlock-key-select");
            const nameInput = document.getElementById("unlock-name-input");
            const nsecInput = document.getElementById("unlock-nsec-input");
            const nsecVisibilityBtn = document.getElementById("unlock-nsec-visibility-btn");
            const passwordInput = document.getElementById("unlock-password-input");
            const confirmInput = document.getElementById("unlock-password-confirm-input");
            const passwordFeedbackEl = document.getElementById("unlock-password-feedback");
            const rememberSelect = document.getElementById("unlock-remember-select");
            const generateBtn = document.getElementById("unlock-generate-btn");
            const submitBtn = document.getElementById("unlock-submit-btn");
            const cancelBtn = document.getElementById("unlock-cancel-btn");
            const useModal = Boolean(options?.modal);
            let originalParent = null;
            let originalNextSibling = null;

            titleEl.innerText = options.title;
            hintEl.innerText = options.hint || "";
            submitBtn.innerText = options.submitLabel || "Weiter";

            keyRow.style.display = options.askKey ? "block" : "none";
            nameRow.style.display = options.askName ? "block" : "none";
            nsecRow.style.display = options.askNsec ? "block" : "none";
            generateRow.style.display = options.askNsec && options.allowGenerate ? "flex" : "none";
            confirmRow.style.display = options.askConfirm ? "block" : "none";
            rememberRow.style.display = options.askRemember ? "block" : "none";

            keySelect.innerHTML = "";
            if (Array.isArray(options.keyOptions)) {
                for (const option of options.keyOptions) {
                    const opt = document.createElement("option");
                    opt.value = option.id;
                    opt.textContent = option.label;
                    keySelect.appendChild(opt);
                }
            }
            if (options.defaultKeyId) keySelect.value = options.defaultKeyId;

            nameInput.value = options.defaultName || "";
            nsecInput.value = options.defaultNsec || "";
            nsecInput.readOnly = Boolean(options.readonlyNsec);
            setSecretInputVisibility(nsecInput, nsecVisibilityBtn, false);
            passwordInput.value = "";
            confirmInput.value = "";
            const requestedRememberMode = normalizeRememberMode(options.defaultRememberMode);
            const preferredRememberMode = loadRememberModePreference();
            rememberSelect.value = options.askRemember
                ? (requestedRememberMode === "none" ? preferredRememberMode : requestedRememberMode)
                : "none";
            setFieldFeedback(passwordFeedbackEl, "");

            const validateUnlockPasswordFeedback = () => {
                if (!options.askConfirm) {
                    setFieldFeedback(passwordFeedbackEl, "");
                    return true;
                }
                const password = passwordInput.value || "";
                const passwordConfirm = confirmInput.value || "";

                if (password && password.length < MIN_PASSWORD_LENGTH) {
                    setFieldFeedback(passwordFeedbackEl, `Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
                    scheduleFrameSizeNotification(false);
                    return false;
                }

                if (passwordConfirm && password !== passwordConfirm) {
                    setFieldFeedback(passwordFeedbackEl, "Passwörter stimmen nicht überein.");
                    scheduleFrameSizeNotification(false);
                    return false;
                }

                setFieldFeedback(passwordFeedbackEl, "");
                return true;
            };

            passwordInput.oninput = validateUnlockPasswordFeedback;
            confirmInput.oninput = validateUnlockPasswordFeedback;

            if (!useModal) {
                setActiveTab("management");
            } else if (panel.parentElement !== document.body) {
                originalParent = panel.parentElement;
                originalNextSibling = panel.nextSibling;
                document.body.appendChild(panel);
                panel.classList.add("unlock-panel-modal");
                if (unlockOverlay) unlockOverlay.style.display = "block";
            }

            panel.style.display = "block";
            passwordInput.focus();
            scheduleFrameSizeNotification(true);

            return new Promise((resolve, reject) => {
                let submitInFlight = false;
                const cleanup = () => {
                    submitBtn.onclick = null;
                    cancelBtn.onclick = null;
                    generateBtn.onclick = null;
                    passwordInput.oninput = null;
                    confirmInput.oninput = null;
                    nsecInput.value = "";
                    setSecretInputVisibility(nsecInput, nsecVisibilityBtn, false);
                    setFieldFeedback(passwordFeedbackEl, "");
                    panel.style.display = "none";
                    panel.classList.remove("unlock-panel-modal");
                    if (unlockOverlay) unlockOverlay.style.display = "none";
                    if (originalParent) {
                        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
                            originalParent.insertBefore(panel, originalNextSibling);
                        } else {
                            originalParent.appendChild(panel);
                        }
                    }
                    scheduleFrameSizeNotification(true);
                };

                submitBtn.onclick = async () => {
                    if (submitInFlight) return;
                    if (!validateUnlockPasswordFeedback()) return;

                    const value = {
                        keyId: keySelect.value,
                        keyName: nameInput.value.trim(),
                        nsec: nsecInput.value.trim(),
                        password: passwordInput.value,
                        passwordConfirm: confirmInput.value,
                        rememberMode: rememberSelect.value || "none"
                    };

                    if (typeof options.beforeSubmit === "function") {
                        submitInFlight = true;
                        submitBtn.disabled = true;
                        try {
                            const validationResult = await options.beforeSubmit(value);
                            if (validationResult !== true) {
                                const message = typeof validationResult === "string"
                                    ? validationResult
                                    : "Eingabe konnte nicht verarbeitet werden.";
                                setFieldFeedback(passwordFeedbackEl, message);
                                scheduleFrameSizeNotification(false);
                                return;
                            }
                        } catch (err) {
                            setFieldFeedback(passwordFeedbackEl, err?.message || "Eingabe konnte nicht verarbeitet werden.");
                            scheduleFrameSizeNotification(false);
                            return;
                        } finally {
                            submitInFlight = false;
                            submitBtn.disabled = false;
                        }
                    }

                    if (options.askRemember) {
                        saveRememberModePreference(value.rememberMode);
                    }

                    cleanup();
                    resolve(value);
                };

                cancelBtn.onclick = () => {
                    cleanup();
                    reject(new Error("Entsperren abgebrochen."));
                };

                generateBtn.onclick = () => {
                    try {
                        nsecInput.value = generateRandomNsec();
                    } catch (err) {
                        appendRequestLog(`Generieren fehlgeschlagen: ${err.message}`);
                    }
                };
            });
        }

        function renderKeyManager() {
            const panel = document.getElementById("key-manager");
            if (!currentKeyring || !Array.isArray(currentKeyring.keys) || currentKeyring.keys.length === 0) {
                panel.style.display = "none";
                scheduleFrameSizeNotification(false);
                return;
            }

            const select = document.getElementById("saved-keys-select");
            const activeInfoEl = document.getElementById("active-key-info");
            select.innerHTML = "";

            currentKeyring.keys.forEach((entry, index) => {
                const option = document.createElement("option");
                option.value = entry.id;
                option.textContent = keyDisplayName(entry, index);
                if (entry.id === activeKeyId) option.selected = true;
                select.appendChild(option);
            });

            const { entry: activeEntry, index: activeIndex } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
            const currentName = keyDisplayName(activeEntry, activeIndex);
            const npubShort = activeUser?.npub ? `${activeUser.npub.slice(0, 16)}...` : "(noch nicht geladen)";
            activeInfoEl.innerText = `Aktiv: ${currentName} | ${npubShort}`;

            panel.style.display = "block";
            scheduleFrameSizeNotification(false);
        }

        async function switchToSelectedKey() {
            if (!currentKeyring || !Array.isArray(currentKeyring.keys) || currentKeyring.keys.length === 0) {
                throw new Error("Kein Keyring geladen.");
            }
            const selectedId = document.getElementById("saved-keys-select").value;
            if (!selectedId) throw new Error("Kein Schlüssel ausgewählt.");
            if (selectedId === activeKeyId) {
                appendRequestLog("Ausgewählter Schlüssel ist bereits aktiv.");
                return;
            }
            const selectedEntry = currentKeyring.keys.find((entry) => entry.id === selectedId);
            if (!selectedEntry) throw new Error("Ausgewählter Schlüssel konnte nicht geladen werden.");

            setActiveKeyId(selectedId);
            if (sessionPassword) {
                await updateUnlockCacheKeyId(selectedId, sessionPassword, selectedEntry.payload);
                sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(sessionPassword, selectedEntry.payload);
            } else {
                clearUnlockCache();
                sessionUnlockMaterial = null;
            }
            hideRevealedNsec();
            appendRequestLog("Aktiver Schlüssel gewechselt. Seite wird neu geladen.");
            window.location.reload();
        }

        async function deleteSelectedKey() {
            if (!currentKeyring || !Array.isArray(currentKeyring.keys) || currentKeyring.keys.length === 0) {
                throw new Error("Kein Keyring geladen.");
            }

            const selectedId = document.getElementById("saved-keys-select").value;
            if (!selectedId) throw new Error("Kein Schlüssel ausgewählt.");
            const selectedIndex = currentKeyring.keys.findIndex((entry) => entry.id === selectedId);
            if (selectedIndex < 0) throw new Error("Ausgewählter Schlüssel wurde nicht gefunden.");

            const selectedEntry = currentKeyring.keys[selectedIndex];
            const selectedName = keyDisplayName(selectedEntry, selectedIndex);
            const isLastKey = currentKeyring.keys.length === 1;
            const warningText = isLastKey
                ? `\"${selectedName}\" ist der letzte lokale Schlüssel. Nach dem Löschen startet die Ersteinrichtung. Wirklich löschen?`
                : `Schlüssel \"${selectedName}\" wirklich löschen?`;
            const firstConfirm = window.confirm(warningText);
            if (!firstConfirm) {
                appendRequestLog(`Löschen abgebrochen: ${selectedName}`);
                return;
            }

            const secondConfirm = window.confirm(
                `Letzte Bestätigung: Schlüssel \"${selectedName}\" wird unwiderruflich gelöscht. Fortfahren?`
            );
            if (!secondConfirm) {
                appendRequestLog(`Löschen abgebrochen (2. Bestätigung): ${selectedName}`);
                return;
            }

            currentKeyring.keys.splice(selectedIndex, 1);

            const bindings = loadWpUserBindings();
            let bindingsChanged = false;
            for (const [userId, keyId] of Object.entries(bindings.byUserId)) {
                if (keyId === selectedId) {
                    delete bindings.byUserId[userId];
                    bindingsChanged = true;
                }
            }
            if (bindingsChanged) saveWpUserBindings(bindings);

            hideRevealedNsec();

            if (currentKeyring.keys.length === 0) {
                localStorage.removeItem(KEYRING_STORAGE_KEY);
                localStorage.removeItem(ACTIVE_KEY_ID_STORAGE_KEY);
                clearUnlockCache();
                sessionPassword = "";
                sessionUnlockMaterial = null;
                activeKeyId = null;
                activeNsec = null;
                activeUser = null;
                appendRequestLog(`Letzter Schlüssel gelöscht: ${selectedName}. Seite wird neu geladen.`);
                window.location.reload();
                return;
            }

            saveKeyring(currentKeyring);
            appendRequestLog(`Schlüssel gelöscht: ${selectedName}`);

            if (selectedId === activeKeyId) {
                const replacement = currentKeyring.keys[0];
                setActiveKeyId(replacement.id);
                if (sessionPassword) {
                    await updateUnlockCacheKeyId(replacement.id, sessionPassword, replacement.payload);
                    sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(sessionPassword, replacement.payload);
                } else {
                    clearUnlockCache();
                    sessionUnlockMaterial = null;
                }
                appendRequestLog(`Aktiver Schlüssel wurde gelöscht. Neuer aktiver Schlüssel: ${keyDisplayName(replacement, 0)}. Seite wird neu geladen.`);
                window.location.reload();
                return;
            }

            renderKeyManager();
        }

        async function askForExportPassword() {
            const unlock = await showUnlockPanel({
                title: "Export-Passwort setzen",
                hint: "Das Passwort schützt nur die Exportdatei. Dies ist ein neues Export-Passwort (nicht dein aktuelles Keyring-Passwort). Ohne dieses Passwort kann die Datei nicht importiert werden.",
                askNsec: false,
                askConfirm: false,
                askName: false,
                askKey: false,
                askRemember: false,
                modal: true,
                submitLabel: "Verschlüsselt exportieren"
            });
            if (!unlock.password) throw new Error("Kein Export-Passwort angegeben.");
            if (unlock.password.length < MIN_PASSWORD_LENGTH) {
                throw new Error(`Export-Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
            }
            return unlock.password;
        }

        async function askForImportPassword(encryptedPayload) {
            if (!isValidEncryptedPayload(encryptedPayload)) {
                throw new Error("Exportdatei enthält keinen gültigen verschlüsselten Schlüssel.");
            }

            const unlock = await showUnlockPanel({
                title: "Exportdatei entschlüsseln",
                hint: "Bitte das Passwort der Exportdatei eingeben.",
                askNsec: false,
                askConfirm: false,
                askName: false,
                askKey: false,
                askRemember: false,
                modal: true,
                submitLabel: "Datei entschlüsseln",
                beforeSubmit: async (draft) => {
                    if (!draft.password) return "Bitte Passwort eingeben.";
                    try {
                        const importedNsec = await decryptNsec(encryptedPayload, draft.password);
                        if (!isValidNsec(importedNsec)) {
                            return "Exportdatei enthält keinen gültigen nsec.";
                        }
                        return true;
                    } catch (_err) {
                        return "Exportdatei konnte nicht entschlüsselt werden. Passwort prüfen.";
                    }
                }
            });
            if (!unlock.password) throw new Error("Kein Export-Passwort angegeben.");
            return unlock.password;
        }

        function parseKeyExport(rawText) {
            let parsed;
            try {
                parsed = JSON.parse(rawText);
            } catch (_err) {
                throw new Error("Exportdatei ist kein gültiges JSON.");
            }

            if (!parsed || parsed.v !== KEY_EXPORT_VERSION || parsed.type !== KEY_EXPORT_TYPE) {
                throw new Error("Unbekanntes Exportformat.");
            }
            if (!isValidEncryptedPayload(parsed.payload)) {
                throw new Error("Exportdatei enthält keinen gültigen verschlüsselten Schlüssel.");
            }
            return {
                label: normalizeKeyName(parsed.label),
                encryptedPayload: parsed.payload
            };
        }

        function hideRevealedNsec() {
            const revealBox = document.getElementById("nsec-reveal-box");
            const revealOutput = document.getElementById("nsec-reveal-output");
            const revealCountdown = document.getElementById("nsec-reveal-countdown");
            const nsecModal = document.getElementById("nsec-modal");
            const nsecOverlay = document.getElementById("nsec-overlay");
            const nsecModalOutput = document.getElementById("nsec-modal-output");
            const nsecModalCountdown = document.getElementById("nsec-modal-countdown");
            const nsecModalKeyname = document.getElementById("nsec-modal-keyname");

            if (nsecRevealTimerHandle) {
                clearInterval(nsecRevealTimerHandle);
                nsecRevealTimerHandle = null;
            }
            if (revealOutput) revealOutput.value = "";
            if (revealCountdown) revealCountdown.textContent = "";
            if (revealBox) revealBox.hidden = true;
            if (nsecModalOutput) nsecModalOutput.value = "";
            if (nsecModalCountdown) nsecModalCountdown.textContent = "";
            if (nsecModalKeyname) nsecModalKeyname.textContent = "";
            if (nsecModal) nsecModal.style.display = "none";
            if (nsecOverlay) nsecOverlay.style.display = "none";
            scheduleFrameSizeNotification(false);
        }

        function showNsecRevealModal(nsec, keyLabel = "") {
            const nsecModal = document.getElementById("nsec-modal");
            const nsecOverlay = document.getElementById("nsec-overlay");
            const nsecModalOutput = document.getElementById("nsec-modal-output");
            const nsecModalCountdown = document.getElementById("nsec-modal-countdown");
            const nsecModalKeyname = document.getElementById("nsec-modal-keyname");

            if (!nsecModal || !nsecOverlay || !nsecModalOutput || !nsecModalCountdown) {
                throw new Error("UI für nsec-Anzeige fehlt.");
            }

            nsecModalOutput.value = nsec;
            if (nsecModalKeyname) {
                nsecModalKeyname.textContent = keyLabel ? `Schlüssel: ${keyLabel}` : "";
            }

            nsecOverlay.style.display = "block";
            nsecModal.style.display = "block";

            let remainingSeconds = Math.ceil(NSEC_REVEAL_DURATION_MS / 1000);
            nsecModalCountdown.textContent = `Wird in ${remainingSeconds}s automatisch ausgeblendet.`;

            if (nsecRevealTimerHandle) clearInterval(nsecRevealTimerHandle);
            nsecRevealTimerHandle = setInterval(() => {
                remainingSeconds -= 1;
                if (remainingSeconds <= 0) {
                    hideRevealedNsec();
                    appendRequestLog(`nsec automatisch ausgeblendet (${keyLabel || "aktiver Schlüssel"}).`);
                    return;
                }
                nsecModalCountdown.textContent = `Wird in ${remainingSeconds}s automatisch ausgeblendet.`;
            }, 1000);
        }

        async function askForNsecRevealPassword(encryptedPayload) {
            if (!isValidEncryptedPayload(encryptedPayload)) {
                throw new Error("Aktiver Schlüssel ist ungueltig.");
            }

            const unlock = await showUnlockPanel({
                title: "nsec einmal anzeigen",
                hint: "Bitte Keyring-Passwort eingeben. Der nsec wird nur kurz angezeigt.",
                askNsec: false,
                askConfirm: false,
                askName: false,
                askKey: false,
                askRemember: false,
                modal: true,
                submitLabel: "Anzeigen",
                beforeSubmit: async (draft) => {
                    if (!draft.password) return "Bitte Passwort eingeben.";
                    try {
                        const nsec = await decryptNsec(encryptedPayload, draft.password);
                        if (!isValidNsec(nsec)) return "Passwort ist ungültig.";
                        return true;
                    } catch (_err) {
                        return "Passwort ist ungültig.";
                    }
                }
            });
            if (!unlock.password) throw new Error("Kein Passwort angegeben.");
            return unlock.password;
        }

        async function revealActiveNsecOnce() {
            if (!currentKeyring) throw new Error("Keyring ist nicht entsperrt.");
            const { entry: activeEntry, index: activeIndex } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
            if (!activeEntry) throw new Error("Kein aktiver Schlüssel gefunden.");

            const password = await askForNsecRevealPassword(activeEntry.payload);
            let nsec;
            try {
                nsec = await decryptNsec(activeEntry.payload, password);
            } catch (_err) {
                throw new Error("Passwort ist ungültig.");
            }
            if (!isValidNsec(nsec)) throw new Error("Aktiver Schlüssel konnte nicht als nsec gelesen werden.");
            sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(password, activeEntry.payload);

            sessionPassword = password;
            showNsecRevealModal(nsec, keyDisplayName(activeEntry, activeIndex));
            appendRequestLog(`nsec einmalig angezeigt (${keyDisplayName(activeEntry, activeIndex)}).`);
        }

        async function addKeyToKeyring(nsec, name, password = "") {
            if (!isValidNsec(nsec)) throw new Error("Ungültiger nsec. Erwartet nsec1...");
            if (!currentKeyring || !Array.isArray(currentKeyring.keys)) throw new Error("Kein Keyring geladen.");

            const newSigner = new NDKPrivateKeySigner(nsec);
            const newUser = await newSigner.user();
            let duplicateCheckLimited = false;

            if (password) {
                for (const entry of currentKeyring.keys) {
                    try {
                        const existingNsec = await decryptNsec(entry.payload, password);
                        const existingUser = await new NDKPrivateKeySigner(existingNsec).user();
                        if (existingUser.pubkey === newUser.pubkey) {
                            throw new Error("Dieser Schlüssel ist bereits gespeichert.");
                        }
                    } catch (err) {
                        if (err.message === "Dieser Schlüssel ist bereits gespeichert.") throw err;
                    }
                }
            } else if (hasSessionUnlockMaterial()) {
                duplicateCheckLimited = true;
                for (const entry of currentKeyring.keys) {
                    if (entry?.payload?.salt !== sessionUnlockMaterial.salt) continue;
                    try {
                        const existingNsec = await decryptNsecWithDerivedKey(entry.payload, sessionUnlockMaterial.unlockKey);
                        const existingUser = await new NDKPrivateKeySigner(existingNsec).user();
                        if (existingUser.pubkey === newUser.pubkey) {
                            throw new Error("Dieser Schlüssel ist bereits gespeichert.");
                        }
                    } catch (err) {
                        if (err.message === "Dieser Schlüssel ist bereits gespeichert.") throw err;
                    }
                }
            }

            const entry = password
                ? await createKeyringEntry(nsec, password, name)
                : await createKeyringEntryWithSessionMaterial(nsec, name);
            currentKeyring.keys.push(entry);
            saveKeyring(currentKeyring);
            appendRequestLog(`Neuer Schlüssel gespeichert: ${keyDisplayName(entry, currentKeyring.keys.length - 1)}`);
            if (duplicateCheckLimited) {
                appendRequestLog("Hinweis: Ohne Passwort war die Duplikatprüfung eingeschränkt.");
            }
            renderKeyManager();
            return entry;
        }

        async function downloadActiveKeyPair() {
            if (!currentKeyring) throw new Error("Keyring ist nicht entsperrt.");
            const { entry: activeEntry, index: activeIndex } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
            if (!activeEntry) throw new Error("Kein aktiver Schlüssel gefunden.");
            const password = await ensureSessionPassword();

            const nsec = await decryptNsec(activeEntry.payload, password);
            const signer = new NDKPrivateKeySigner(nsec);
            const user = await signer.user();
            const displayName = keyDisplayName(activeEntry, activeIndex);
            const exportPassword = await askForExportPassword();
            const encryptedPayload = await encryptNsec(nsec, exportPassword);
            const exportPayload = {
                v: KEY_EXPORT_VERSION,
                type: KEY_EXPORT_TYPE,
                format: "encrypted-nsec",
                label: displayName || "",
                createdAt: new Date().toISOString(),
                sourceKeyCreatedAt: new Date(activeEntry.createdAt || Date.now()).toISOString(),
                pubkey: user.pubkey,
                npub: user.npub,
                encryption: {
                    kdf: "PBKDF2-SHA256",
                    iterations: PBKDF2_ITERATIONS,
                    cipher: "AES-256-GCM"
                },
                payload: encryptedPayload,
                importHint: "Im Signer unter Verwaltung die Datei auswählen und auf \"Exportdatei importieren\" klicken."
            };

            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
            const fileName = `${safeFilename(displayName)}-${safeFilename(user.npub.slice(0, 12))}-secure-export.json`;
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            appendRequestLog(`Verschlüsselter Schlüssel exportiert: ${fileName}`);
        }

        async function saveAdditionalKey() {
            if (!currentKeyring) throw new Error("Keyring ist nicht entsperrt.");
            const password = sessionPassword || "";
            if (!password && !hasSessionUnlockMaterial()) {
                await ensureSessionPassword();
            }

            const nameInput = document.getElementById("new-key-name-input");
            const nsecInput = document.getElementById("new-key-nsec-input");
            const nsec = nsecInput.value.trim();
            const name = normalizeKeyName(nameInput.value);

            if (!nsec) throw new Error("Bitte nsec eingeben oder generieren.");
            const addedEntry = await addKeyToKeyring(nsec, name, sessionPassword || "");
            nsecInput.value = "";
            resetSecretInputVisibility("new-key-nsec-input", "new-key-nsec-visibility-btn");
            const savedKeysSelect = document.getElementById("saved-keys-select");
            if (savedKeysSelect && addedEntry?.id) {
                savedKeysSelect.value = addedEntry.id;
                appendRequestLog("Neuer Schlüssel wird direkt aktiviert.");
                await switchToSelectedKey();
            }
        }

        async function importKeyFromFile() {
            if (!currentKeyring) throw new Error("Keyring ist nicht entsperrt.");
            const password = sessionPassword || "";
            if (!password && !hasSessionUnlockMaterial()) {
                await ensureSessionPassword();
            }
            const fileInput = document.getElementById("import-key-file-input");
            const nameInput = document.getElementById("new-key-name-input");
            const file = fileInput?.files?.[0];
            if (!file) throw new Error("Bitte zuerst eine Exportdatei auswählen.");

            const raw = await file.text();
            const parsed = parseKeyExport(raw);
            let importedNsec = "";

            if (!importedNsec && parsed.encryptedPayload) {
                const exportPassword = await askForImportPassword(parsed.encryptedPayload);
                try {
                    importedNsec = await decryptNsec(parsed.encryptedPayload, exportPassword);
                } catch (_err) {
                    throw new Error("Exportdatei konnte nicht entschlüsselt werden. Passwort prüfen.");
                }
            }

            if (!importedNsec || !isValidNsec(importedNsec)) {
                throw new Error("Exportdatei enthält keinen gültigen nsec.");
            }

            const fallbackName = parsed.label || file.name.replace(/\.json$/i, "");
            const targetName = normalizeKeyName(nameInput.value) || fallbackName;
            const addedEntry = await addKeyToKeyring(importedNsec, targetName, sessionPassword || "");
            fileInput.value = "";
            const savedKeysSelect = document.getElementById("saved-keys-select");
            if (savedKeysSelect && addedEntry?.id) {
                savedKeysSelect.value = addedEntry.id;
                appendRequestLog("Importierter Schlüssel wird direkt aktiviert.");
                await switchToSelectedKey();
            }
        }

        async function changeKeyringPassword() {
            if (!currentKeyring) throw new Error("Keyring ist nicht entsperrt.");
            const knownPassword = await ensureSessionPassword();

            const currentInput = document.getElementById("change-password-current-input");
            const newInput = document.getElementById("change-password-new-input");
            const confirmInput = document.getElementById("change-password-confirm-input");
            const changePasswordFeedback = document.getElementById("change-password-feedback");

            const currentPassword = currentInput.value;
            const newPassword = newInput.value;
            const newPasswordConfirm = confirmInput.value;

            setFieldFeedback(changePasswordFeedback, "");

            if (!currentPassword) throw new Error("Bitte aktuelles Passwort eingeben.");
            if (currentPassword !== knownPassword) throw new Error("Aktuelles Passwort ist falsch.");
            if (!newPassword) throw new Error("Bitte neues Passwort eingeben.");
            if (newPassword.length < MIN_PASSWORD_LENGTH) {
                setFieldFeedback(changePasswordFeedback, `Neues Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
                newInput.focus();
                throw new Error(`Neues Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
            }
            if (newPassword !== newPasswordConfirm) throw new Error("Neue Passwörter stimmen nicht überein.");
            if (newPassword === knownPassword) throw new Error("Neues Passwort muss sich vom aktuellen unterscheiden.");

            const reencryptedKeys = [];
            for (const entry of currentKeyring.keys) {
                const nsec = await decryptNsec(entry.payload, knownPassword);
                const reencryptedPayload = await encryptNsec(nsec, newPassword);
                reencryptedKeys.push({
                    ...entry,
                    payload: reencryptedPayload
                });
            }

            currentKeyring = {
                ...currentKeyring,
                keys: reencryptedKeys
            };
            saveKeyring(currentKeyring);

            sessionPassword = newPassword;
            const { entry: activeEntryAfterPasswordChange } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
            sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(newPassword, activeEntryAfterPasswordChange.payload);
            await saveUnlockCache(newPassword, activeKeyId, activeEntryAfterPasswordChange?.payload, "session");

            currentInput.value = "";
            newInput.value = "";
            confirmInput.value = "";
            setFieldFeedback(changePasswordFeedback, "");
            appendRequestLog("Passwort geändert. Alle gespeicherten Schlüssel wurden neu verschlüsselt.");
        }

        function resetKeyringWithConfirmation() {
            const firstConfirm = window.confirm(
                "Warnung: Dadurch werden alle lokal gespeicherten Identitäten und Einstellungen dieses Signers gelöscht. Reimport ist nur mit Exportdatei möglich. Fortfahren?"
            );
            if (!firstConfirm) {
                appendRequestLog("Löschen lokaler Identitäten abgebrochen (1. Bestätigung).");
                return;
            }

            const phrase = window.prompt(
                "Letzte Bestätigung: Tippe RESET, um alle lokalen Identitäten unwiderruflich zu löschen."
            );
            if (phrase !== "RESET") {
                appendRequestLog("Löschen lokaler Identitäten abgebrochen (2. Bestätigung fehlgeschlagen).");
                throw new Error("Reset abgebrochen. Bestätigungswort war nicht korrekt.");
            }

            hideRevealedNsec();
            clearUnlockCache();

            localStorage.removeItem(KEYRING_STORAGE_KEY);
            localStorage.removeItem(ACTIVE_KEY_ID_STORAGE_KEY);
            localStorage.removeItem(ENCRYPTED_NSEC_STORAGE_KEY);
            localStorage.removeItem(LEGACY_NSEC_STORAGE_KEY);
            localStorage.removeItem(PERMISSION_STORAGE_KEY);
            localStorage.removeItem(PERMISSION_META_STORAGE_KEY);
            localStorage.removeItem(WP_USER_BINDINGS_STORAGE_KEY);
            localStorage.removeItem(UNLOCK_REMEMBER_PREF_STORAGE_KEY);

            sessionPassword = "";
            sessionUnlockMaterial = null;
            currentKeyring = null;
            activeKeyId = null;
            activeNsec = null;
            activeUser = null;
            connectionInfo = null;
            pendingPermissionRequests.length = 0;
            activePermissionRequest = null;
            signerAttention.clearAttention();
            appendRequestLog("Alle lokalen Identitäten wurden gelöscht. Seite wird neu geladen.");
            window.location.reload();
        }

        function setupKeyManagerHandlers() {
            const newPasswordInput = document.getElementById("change-password-new-input");
            const changePasswordFeedback = document.getElementById("change-password-feedback");
            const permissionSelect = document.getElementById("permission-manager-select");
            const revokeSelectedPermissionBtn = document.getElementById("revoke-selected-permission-btn");
            const revokeAllPermissionsBtn = document.getElementById("revoke-all-permissions-btn");
            const copyBunkerUriBtn = document.getElementById("copy-bunker-uri-btn");
            const copyNostrconnectUriBtn = document.getElementById("copy-nostrconnect-uri-btn");
            const bunkerUriInput = document.getElementById("standalone-bunker-uri");
            const nostrconnectUriInput = document.getElementById("standalone-nostrconnect-uri");

            setupSecretInputControls("unlock-nsec-input", "unlock-nsec-visibility-btn", "unlock-nsec-copy-btn", "Einrichtungs-nsec");
            setupSecretInputControls("new-key-nsec-input", "new-key-nsec-visibility-btn", "new-key-nsec-copy-btn", "nsec");

            const validateChangePasswordFeedback = () => {
                const value = newPasswordInput.value || "";
                if (value && value.length < MIN_PASSWORD_LENGTH) {
                    setFieldFeedback(changePasswordFeedback, `Neues Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
                    return;
                }
                setFieldFeedback(changePasswordFeedback, "");
            };

            newPasswordInput.addEventListener("input", validateChangePasswordFeedback);

            if (copyBunkerUriBtn && bunkerUriInput) {
                copyBunkerUriBtn.addEventListener("click", async () => {
                    try {
                        await copyTextToClipboard(bunkerUriInput.value);
                        appendRequestLog("Bunker URI in Zwischenablage kopiert.");
                    } catch (err) {
                        appendRequestLog(`Bunker URI konnte nicht kopiert werden: ${err.message}`);
                    }
                });
            }

            if (copyNostrconnectUriBtn && nostrconnectUriInput) {
                copyNostrconnectUriBtn.addEventListener("click", async () => {
                    try {
                        await copyTextToClipboard(nostrconnectUriInput.value);
                        appendRequestLog("Nostrconnect URI in Zwischenablage kopiert.");
                    } catch (err) {
                        appendRequestLog(`Nostrconnect URI konnte nicht kopiert werden: ${err.message}`);
                    }
                });
            }

            document.getElementById("switch-key-btn").addEventListener("click", async () => {
                try {
                    await switchToSelectedKey();
                } catch (err) {
                    appendRequestLog(`Switch fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("download-key-btn").addEventListener("click", async () => {
                try {
                    await downloadActiveKeyPair();
                } catch (err) {
                    appendRequestLog(`Download fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("reveal-nsec-once-btn").addEventListener("click", async () => {
                try {
                    await revealActiveNsecOnce();
                } catch (err) {
                    appendRequestLog(`nsec-Anzeige fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("delete-key-btn").addEventListener("click", async () => {
                try {
                    await deleteSelectedKey();
                } catch (err) {
                    appendRequestLog(`Löschen fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("hide-nsec-btn").addEventListener("click", () => {
                hideRevealedNsec();
                appendRequestLog("nsec manuell ausgeblendet.");
            });

            const nsecModalCloseBtn = document.getElementById("nsec-modal-close-btn");
            if (nsecModalCloseBtn) {
                nsecModalCloseBtn.addEventListener("click", () => {
                    hideRevealedNsec();
                    appendRequestLog("nsec modal manuell ausgeblendet.");
                });
            }

            const nsecModalOverlay = document.getElementById("nsec-overlay");
            if (nsecModalOverlay) {
                nsecModalOverlay.addEventListener("click", () => {
                    hideRevealedNsec();
                    appendRequestLog("nsec modal per Overlay geschlossen.");
                });
            }

            const nsecModalCopyBtn = document.getElementById("nsec-modal-copy-btn");
            if (nsecModalCopyBtn) {
                nsecModalCopyBtn.addEventListener("click", async () => {
                    try {
                        const value = document.getElementById("nsec-modal-output")?.value || "";
                        await copyTextToClipboard(value);
                        appendRequestLog("Temporärer nsec in Zwischenablage kopiert.");
                    } catch (err) {
                        appendRequestLog(`nsec konnte nicht kopiert werden: ${err.message}`);
                    }
                });
            }

            document.getElementById("generate-key-btn").addEventListener("click", () => {
                try {
                    const generated = generateRandomNsec();
                    document.getElementById("new-key-nsec-input").value = generated;
                    appendRequestLog("Neuer nsec wurde generiert.");
                } catch (err) {
                    appendRequestLog(`Generieren fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("save-key-btn").addEventListener("click", async () => {
                try {
                    await saveAdditionalKey();
                } catch (err) {
                    appendRequestLog(`Speichern fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("import-key-file-btn").addEventListener("click", async () => {
                try {
                    await importKeyFromFile();
                } catch (err) {
                    appendRequestLog(`Import fehlgeschlagen: ${err.message}`);
                }
            });

            document.getElementById("change-password-btn").addEventListener("click", async () => {
                try {
                    await changeKeyringPassword();
                } catch (err) {
                    appendRequestLog(`Passwort ändern fehlgeschlagen: ${err.message}`);
                }
            });

            if (revokeSelectedPermissionBtn) {
                revokeSelectedPermissionBtn.addEventListener("click", () => {
                    const selectedKey = permissionSelect?.value || "";
                    if (!selectedKey) {
                        appendRequestLog("Keine permanente Berechtigung ausgewählt.");
                        return;
                    }
                    const removed = revokePermissionByStorageKey(selectedKey);
                    if (!removed) {
                        appendRequestLog("Berechtigung konnte nicht widerrufen werden.");
                        return;
                    }
                    const parsed = parsePermissionStorageKey(selectedKey);
                    if (parsed) {
                        appendRequestLog(`Berechtigung widerrufen: ${parsed.method} (${parsed.pubkey.slice(0, 12)}...)`);
                    } else {
                        appendRequestLog("Berechtigung widerrufen.");
                    }
                });
            }

            if (revokeAllPermissionsBtn) {
                revokeAllPermissionsBtn.addEventListener("click", async () => {
                    try {
                        const permissionsSnapshot = clearExpiredPermissions();
                        const hasPermanentPermission = Object.values(permissionsSnapshot).some((expiry) => expiry === PERMISSION_FOREVER);
                        if (!hasPermanentPermission) {
                            appendRequestLog("Keine permanente Berechtigung zum Widerrufen vorhanden.");
                            return;
                        }

                        await confirmKeyringPasswordForSecurityAction(
                            "Bitte Keyring-Passwort eingeben, um alle permanenten Berechtigungen zu widerrufen."
                        );

                        const removedCount = revokeAllPermanentPermissions();
                        if (removedCount <= 0) {
                            appendRequestLog("Keine permanente Berechtigung zum Widerrufen vorhanden.");
                            return;
                        }
                        appendRequestLog(`${removedCount} permanente Berechtigung(en) widerrufen.`);
                    } catch (err) {
                        if (err?.message === "Entsperren abgebrochen.") {
                            appendRequestLog("Widerruf aller Berechtigungen abgebrochen.");
                            return;
                        }
                        appendRequestLog(`Widerruf aller Berechtigungen fehlgeschlagen: ${err?.message || err}`);
                    }
                });
            }

            document.getElementById("reset-keyring-btn").addEventListener("click", () => {
                try {
                    resetKeyringWithConfirmation();
                } catch (err) {
                    appendRequestLog(`Löschen lokaler Identitäten fehlgeschlagen: ${err.message}`);
                }
            });

            renderPermissionManager();
        }

        // ===== Bridge-Kommunikation (PostMessage Protocol mit Parent) =====
        // Der Bridge Layer ermöglicht sichere Kommunikation zwischen parent window und signer iframe
        // über PostMessage, mit Validierung von Origin und Source
        
        /**
         * Ermittelt die erwartete Origin des Parent-Frames.
         * Dies wird zur Validierung von PostMessage-Events verwendet.
         * 
         * Priorität:
         * 1. Query-Parameter ?parentOrigin=... (explizit gesetzt)
         * 2. document.referrer (Browser liest automatisch)
         * 3. null (unbekannt/nicht gesetzt)
         * 
         * @returns {string|null} Die Origin des Parent-Frames (z.B. "https://example.com") oder null
         */
        function expectedParentOrigin() {
            const params = new URLSearchParams(window.location.search);
            const fromQuery = params.get("parentOrigin");
            if (fromQuery) return fromQuery;

            if (document.referrer) {
                try {
                    return new URL(document.referrer).origin;
                } catch (_err) {
                    return null;
                }
            }

            return null;
        }

        /**
         * Sendet eine Nachricht an den Parent-Frame über PostMessage Bridge mit Origin-Check.
         * 
         * Nachrichten-Format:
         * { source: "nip46-signer-bridge", type: string, payload: object }
         * 
         * Verwendete Message-Types:
         * - "ready": Signer hat erfolgreich initialisiert (payload: connectionInfo)
         * - "locked": Signer benötigt Entsperrrung (payload: { reason: string })
         * - "connection-info": Response auf connection-info Anfrage
         * - "frame-size": Meldet aktuelle iframe Höhe (payload: { height: number })
         * - "wp-user-key-result": Response auf wp-ensure-user-key Anfrage
         * 
         * @param {string} type - Der Nachrichtentyp
         * @param {object} payload - Die Nachricht-Daten
         */
        function postBridgeMessage(type, payload) {
            if (window.parent === window) return;

            const targetOrigin = expectedParentOrigin();
            if (!targetOrigin) {
                appendRequestLog(`Bridge blockiert: unbekannter parentOrigin (${type})`);
                return;
            }

            try {
                window.parent.postMessage(
                    { source: BRIDGE_SOURCE, type, payload },
                    targetOrigin
                );
            } catch (err) {
                appendRequestLog(`Bridge-Post fehlgeschlagen: ${err.message}`);
            }
        }

        /**
         * Verarbeitet eingehende PostMessage-Events vom Parent-Frame.
         * Validiert Origin und Source vor der Verarbeitung.
         * 
         * Unterstützte Anfragen:
         * - "ping": Prüfe ob Signer ready ist → antworte mit connectionInfo oder "locked"
         * - "get-connection-info": Wie ping
         * - "request-frame-size": Parent fragt nach neuer Höhe → antworte mit frame-size
         * - "wp-ensure-user-key": {userId} → erstelle/lade WP User Key → antworte mit wp-user-key-result
         * 
         * @param {MessageEvent} event - Das PostMessage-Event vom Parent-Frame
         */
        function bridgeMessageHandler(event) {
            const targetOrigin = expectedParentOrigin();
            if (!targetOrigin || event.origin !== targetOrigin) return;

            const data = event.data;
            if (!data || data.source !== BRIDGE_SOURCE) return;

            if (data.type === "request-frame-size") {
                scheduleFrameSizeNotification(true);
                return;
            }

            if (data.type === "ping" || data.type === "get-connection-info") {
                if (connectionInfo) {
                    postBridgeMessage("connection-info", connectionInfo);
                } else {
                    postBridgeMessage("locked", { reason: "Signer ist noch gesperrt." });
                }
                return;
            }

            if (data.type === "wp-ensure-user-key") {
                const requestId = typeof data?.payload?.requestId === "string" ? data.payload.requestId : "";
                const userId = data?.payload?.userId;
                (async () => {
                    try {
                        const ensured = await ensureWpUserKey(userId);
                        postBridgeMessage("wp-user-key-result", {
                            requestId,
                            ok: true,
                            ...ensured
                        });
                    } catch (err) {
                        postBridgeMessage("wp-user-key-result", {
                            requestId,
                            ok: false,
                            error: err?.message || "WP-Key konnte nicht bereitgestellt werden."
                        });
                    }
                })();
            }
        }

        // ===== Permissions-System (Genehmigung für NIP-46 Methoden) =====
        // Kontrolliert welche Remote-Signaturen durch welche Clients genehmigt sind
        // Unterstützt sowohl Single-Use (einmalig) als auch TTL-basierte (zeitlich begrenzt) Genehmigungen
        
        /**
         * Lädt die Genehmigungen aus dem localStorage.
         * Format: { "pubkey:method": expiryTimestamp | PERMISSION_FOREVER, ... }
         * 
         * @returns {object} Die geladenen Genehmigungen (oder {} wenn keine vorhanden)
         */
        function loadPermissions() {
            try {
                const raw = localStorage.getItem(PERMISSION_STORAGE_KEY);
                return raw ? JSON.parse(raw) : {};
            } catch (_err) {
                return {};
            }
        }

        /**
         * Speichert die Genehmigungen im localStorage.
         * 
         * @param {object} permissions - Die zu speichernden Genehmigungen
         */
        function savePermissions(permissions) {
            localStorage.setItem(PERMISSION_STORAGE_KEY, JSON.stringify(permissions));
        }

        function loadPermissionMeta() {
            try {
                const raw = localStorage.getItem(PERMISSION_META_STORAGE_KEY);
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === "object" ? parsed : {};
            } catch (_err) {
                return {};
            }
        }

        function savePermissionMeta(meta) {
            localStorage.setItem(PERMISSION_META_STORAGE_KEY, JSON.stringify(meta || {}));
        }

        /**
         * Erzeugt einen eindeutigen Key für eine Genehmigung.
         * Format: "<pubkey>:<method>" (z.B. "abc123....:sign_event")
         * 
         * @param {string} pubkey - Der öffentliche Schlüssel des Clients
         * @param {string} method - Die NIP-46 Methodenname
         * @returns {string} Der Genehmigungskey
         */
        function permissionKey(pubkey, method) {
            return `${pubkey}:${method}`;
        }

        function parsePermissionStorageKey(storageKey) {
            if (typeof storageKey !== "string") return null;
            const splitIndex = storageKey.lastIndexOf(":");
            if (splitIndex <= 0 || splitIndex >= storageKey.length - 1) return null;
            return {
                pubkey: storageKey.slice(0, splitIndex),
                method: storageKey.slice(splitIndex + 1)
            };
        }

        function compactPubkey(pubkey) {
            const value = String(pubkey || "");
            if (value.length <= 24) return value;
            return `${value.slice(0, 12)}...${value.slice(-8)}`;
        }

        function activeSignerKeyName() {
            if (!currentKeyring || !Array.isArray(currentKeyring.keys) || currentKeyring.keys.length === 0) {
                return "";
            }
            try {
                const { entry, index } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
                return keyDisplayName(entry, index);
            } catch (_err) {
                return "";
            }
        }

        function rememberPermissionMeta(storageKey, keyName) {
            if (typeof storageKey !== "string" || !storageKey) return;
            const normalized = normalizeKeyName(keyName);
            const meta = loadPermissionMeta();
            meta[storageKey] = {
                keyName: normalized,
                updatedAt: Date.now()
            };
            savePermissionMeta(meta);
        }

        /**
         * Entfernt abgelaufene Genehmigungen aus dem Storage.
         * Behält nur Genehmigungen die noch nicht expired sind oder ewig gültig (PERMISSION_FOREVER).
         * 
         * @returns {object} Die bereinigten Genehmigungen
         */
        function clearExpiredPermissions() {
            const now = Date.now();
            const permissions = loadPermissions();
            const meta = loadPermissionMeta();
            let changed = false;
            let metaChanged = false;

            for (const [key, value] of Object.entries(permissions)) {
                if (value === PERMISSION_FOREVER) continue;
                if (typeof value !== "number" || value <= now) {
                    delete permissions[key];
                    if (Object.prototype.hasOwnProperty.call(meta, key)) {
                        delete meta[key];
                        metaChanged = true;
                    }
                    changed = true;
                }
            }

            for (const metaKey of Object.keys(meta)) {
                if (!Object.prototype.hasOwnProperty.call(permissions, metaKey)) {
                    delete meta[metaKey];
                    metaChanged = true;
                }
            }

            if (changed) savePermissions(permissions);
            if (metaChanged) savePermissionMeta(meta);
            return permissions;
        }

        function listPermanentPermissions() {
            const permissions = clearExpiredPermissions();
            const meta = loadPermissionMeta();
            const entries = [];
            for (const [key, value] of Object.entries(permissions)) {
                if (value !== PERMISSION_FOREVER) continue;
                const parsed = parsePermissionStorageKey(key);
                if (!parsed) continue;
                const keyName = normalizeKeyName(meta?.[key]?.keyName);
                entries.push({ key, ...parsed, keyName });
            }
            entries.sort((a, b) => {
                const methodCompare = a.method.localeCompare(b.method);
                if (methodCompare !== 0) return methodCompare;
                return a.pubkey.localeCompare(b.pubkey);
            });
            return entries;
        }

        function renderPermissionManager() {
            const select = document.getElementById("permission-manager-select");
            const emptyEl = document.getElementById("permission-manager-empty");
            if (!select || !emptyEl) return;

            const entries = listPermanentPermissions();
            select.innerHTML = "";

            if (entries.length === 0) {
                select.disabled = true;
                emptyEl.style.display = "block";
                scheduleFrameSizeNotification(false);
                return;
            }

            for (const entry of entries) {
                const option = document.createElement("option");
                option.value = entry.key;
                option.textContent = `${entry.method} | ${compactPubkey(entry.pubkey)} | ${entry.keyName || "-"}`;
                option.title =
                    `Methode: ${entry.method}\n` +
                    `Pubkey: ${entry.pubkey}\n` +
                    `Schluesselname: ${entry.keyName || "-"}`;
                select.appendChild(option);
            }

            select.disabled = false;
            emptyEl.style.display = "none";
            scheduleFrameSizeNotification(false);
        }

        function revokePermissionByStorageKey(storageKey) {
            if (typeof storageKey !== "string" || !storageKey) return false;
            const permissions = clearExpiredPermissions();
            const meta = loadPermissionMeta();
            if (!Object.prototype.hasOwnProperty.call(permissions, storageKey)) return false;
            delete permissions[storageKey];
            savePermissions(permissions);
            if (Object.prototype.hasOwnProperty.call(meta, storageKey)) {
                delete meta[storageKey];
                savePermissionMeta(meta);
            }
            renderPermissionManager();
            return true;
        }

        function revokeAllPermanentPermissions() {
            const permissions = clearExpiredPermissions();
            const meta = loadPermissionMeta();
            let removedCount = 0;
            let metaChanged = false;

            for (const [key, value] of Object.entries(permissions)) {
                if (value !== PERMISSION_FOREVER) continue;
                delete permissions[key];
                if (Object.prototype.hasOwnProperty.call(meta, key)) {
                    delete meta[key];
                    metaChanged = true;
                }
                removedCount += 1;
            }

            if (removedCount > 0) savePermissions(permissions);
            if (metaChanged) savePermissionMeta(meta);
            renderPermissionManager();
            return removedCount;
        }

        /**
         * Prüft ob eine Genehmigung für eine Client-Methode-Kombination aktiv ist.
         * Entfernt zuerst abgelaufene Genehmigungen.
         * 
         * @param {string} pubkey - Der Client-Pubkey
         * @param {string} method - Die Methodenname
         * @returns {boolean} true wenn aktiv genehmigt, sonst false
         */
        function hasActivePermission(pubkey, method) {
            const permissions = clearExpiredPermissions();
            const key = permissionKey(pubkey, method);
            const value = permissions[key];
            return value === PERMISSION_FOREVER || (typeof value === "number" && value > Date.now());
        }

        /**
         * Gewährt eine zeitlich begrenzte Genehmigung (TTL - Time To Live).
         * Diese läuft nach ttlMs Millisekunden ab.
         * 
         * @param {string} pubkey - Der Client-Pubkey
         * @param {string} method - Die Methodenname
         * @param {number} ttlMs - Millisekunden bis zur Ablauf
         */
        function grantPermission(pubkey, method, ttlMs) {
            const permissions = clearExpiredPermissions();
            permissions[permissionKey(pubkey, method)] = Date.now() + ttlMs;
            savePermissions(permissions);
        }

        /**
         * Gewährt eine unbegrenzte Genehmigung (läuft nie ab).
         * Diese Genehmigung ist permanent bis manuell gelöscht.
         * 
         * @param {string} pubkey - Der Client-Pubkey
         * @param {string} method - Die Methodenname
         */
        function grantPermissionForever(pubkey, method) {
            const permissions = clearExpiredPermissions();
            const key = permissionKey(pubkey, method);
            permissions[key] = PERMISSION_FOREVER;
            savePermissions(permissions);
            rememberPermissionMeta(key, activeSignerKeyName());
            renderPermissionManager();
        }

        /**
         * Verarbeitet die Warteschlange ausstehender Genehmigungsanfragen sequenziell.
         * Zeigt Modal für jede Anfrage an und wartet auf Benutzer-Entscheidung.
         */
        function processPermissionQueue() {
            if (activePermissionRequest || pendingPermissionRequests.length === 0) return;

            activePermissionRequest = pendingPermissionRequests.shift();
            const { request, resolve } = activePermissionRequest;
            const method = request?.method;
            const pubkey = request?.pubkey;
            signerAttention.notifyPermissionRequest(request);
            showModal(
                request,
                () => {
                    appendRequestLog(`Erlaubt (einmal): ${method}`);
                    resolve(true);
                    activePermissionRequest = null;
                    processPermissionQueue();
                },
                () => {
                    if (pubkey && method) {
                        grantPermissionForever(pubkey, method);
                    }
                    appendRequestLog(`Erlaubt (immer): ${method}`);
                    resolve(true);
                    activePermissionRequest = null;
                    processPermissionQueue();
                },
                () => {
                    appendRequestLog(`Abgelehnt: ${method}`);
                    resolve(false);
                    activePermissionRequest = null;
                    processPermissionQueue();
                }
            );
        }

        /**
         * Fügt eine Genehmigungsanfrage zur Warteschlange hinzu.
         * Die Anfrage wird asynchron verarbeitet und wartet auf Benutzer-Entscheidung.
         * 
         * @param {object} request - Die NIP-46 request mit {method, pubkey, params}
         * @returns {Promise<boolean>} true wenn genehmigt, false wenn abgelehnt
         */
        function requestPermission(request) {
            return new Promise((resolve) => {
                pendingPermissionRequests.push({ request, resolve });
                processPermissionQueue();
            });
        }

        // ===== NIP-46 Backend RPC Relay Management =====
        // Verwaltet die Verbindung zu Relays für NIP-46 RPC-Kommunikation mit Clients
        // Sichert sicher, dass mindestens ein Relay verbunden ist
        
        /**
         * Zählt die Anzahl der verbundenen RPC-Relays im NIP-46 Backend.
         * Ein Relay ist verbunden wenn sein Status === 5 (CONNECTED in NDK).
         * 
         * @param {NDKNip46Backend} nip46Backend - Das NIP-46 Backend Objekt
         * @returns {number} Anzahl der verbundenen Relays (0 wenn keine vorhanden)
         */
        function connectedBackendRpcRelayCount(nip46Backend) {
            const relaysMap = nip46Backend?.rpc?.pool?.relays;
            if (!relaysMap || typeof relaysMap.values !== "function") return 0;
            return Array.from(relaysMap.values()).filter((relay) => relay?.status === 5).length;
        }

        /**
         * Stellt sicher dass mindestens minConnected Relays verbunden sind.
         * Wartet bis zum Timeout auf Relay-Verbindungen.
         * 
         * @param {NDKNip46Backend} nip46Backend - Das NIP-46 Backend Objekt
         * @param {number} timeoutMs - Timeout in Millisekunden (default: 7000)
         * @param {number} minConnected - Minimum erforderliche verbundene Relays (default: 1)
         * @throws {Error} Wenn Timeout auftritt oder zu wenige Relays verbunden sind
         */
        async function ensureBackendRpcRelaysConnected(nip46Backend, timeoutMs = 7000, minConnected = 1) {
            const rpcPool = nip46Backend?.rpc?.pool;
            if (!rpcPool || typeof rpcPool.connect !== "function") return;

            await Promise.race([
                rpcPool.connect(timeoutMs),
                new Promise((_, reject) => setTimeout(() => reject(new Error("rpc pool connect timeout")), timeoutMs + 1000))
            ]);

            const connected = connectedBackendRpcRelayCount(nip46Backend);
            if (connected < minConnected) {
                throw new Error(`Signer RPC relays offline (${connected}/${minConnected})`);
            }
        }

        /**
         * Patcht den NIP-46 RPC um Relay-Verbindungen vor Requests zu checksieren.
         * Dies verhindert dass Requests auf Offline-Relays fehlschlagen.
         * 
         * Patcht folgende Methoden:
         * - sendResponse: Stellt sicher dass mindestens 1 Relay connected ist vor Response
         * - sendRequest: Stellt sicher dass mindestens 1 Relay connected ist vor Request
         * 
         * @param {NDKNip46Backend} nip46Backend - Das NIP-46 Backend Objekt zu patchen
         */
        function patchBackendRpcReliability(nip46Backend) {
            const rpc = nip46Backend?.rpc;
            if (!rpc || rpc.__reliabilityPatched) return;

            const originalSendResponse = rpc.sendResponse?.bind(rpc);
            if (typeof originalSendResponse === "function") {
                rpc.sendResponse = async (...args) => {
                    await ensureBackendRpcRelaysConnected(nip46Backend, 7000, 1);
                    return originalSendResponse(...args);
                };
            }

            const originalSendRequest = rpc.sendRequest?.bind(rpc);
            if (typeof originalSendRequest === "function") {
                rpc.sendRequest = async (...args) => {
                    await ensureBackendRpcRelaysConnected(nip46Backend, 7000, 1);
                    return originalSendRequest(...args);
                };
            }

            rpc.__reliabilityPatched = true;
        }

        /**
         * Prüft ob ein Unlock-Fehler wiederholbar ist (sollte erneut versucht werden).
         * Nicht-wiederholbare Fehler sind definitiv falsch (z.B. ungültiger nsec Format).
         * Wiederholbare Fehler sind Validierungsfehler die durch Benutzereingabe korrigiert werden können.
         * 
         * @param {Error} err - Der zu prüfende Error
         * @returns {boolean} true wenn der Fehler wiederholbar ist
         */
        function isRetryableUnlockError(err) {
            const msg = err?.message || "";
            return msg === "Kein Passwort angegeben." ||
                msg === "Kein nsec angegeben." ||
                msg === "Passwörter stimmen nicht überein." ||
                msg === "Entsperren fehlgeschlagen. Passwort oder Daten sind ungültig." ||
                msg === "Migration fehlgeschlagen. Passwort oder Alt-Daten sind ungültig." ||
                msg.startsWith("Passwort muss mindestens ") ||
                msg.startsWith("Ungültiger nsec");
        }

        function shouldApplyUnlockBackoff(err) {
            const msg = err?.message || "";
            return msg === "Entsperren fehlgeschlagen. Passwort oder Daten sind ungültig." ||
                msg === "Migration fehlgeschlagen. Passwort oder Alt-Daten sind ungültig.";
        }

        function resetUnlockBackoff() {
            failedUnlockAttempts = 0;
        }

        function nextUnlockBackoffDelay(err) {
            if (!shouldApplyUnlockBackoff(err)) return 0;
            failedUnlockAttempts += 1;
            return unlockBackoffDelayMs(failedUnlockAttempts);
        }

        /**
         * Ruft getOrAskActiveKey auf und wiederholt bei wiederholbaren Fehlern.
         * Zeigt Benutzern die Möglichkeit Fehler zu korrigieren (z.B. Passwort erneut eingeben).
         * Nicht-wiederholbare Fehler werden geworfen.
         * 
         * @returns {Promise<object>} Das entsperrte Schlüsselobjekt
         * @throws {Error} Bei nicht-wiederholbarem Fehler
         */
        async function getOrAskActiveKeyWithRetry() {
            while (true) {
                try {
                    const unlocked = await getOrAskActiveKey();
                    resetUnlockBackoff();
                    return unlocked;
                } catch (err) {
                    if (err?.message === "Entsperren abgebrochen.") throw err;
                    if (!isRetryableUnlockError(err)) throw err;
                    const backoffMs = nextUnlockBackoffDelay(err);
                    if (backoffMs > 0) {
                        appendRequestLog(`${err.message} Bitte in ${formatWaitSeconds(backoffMs)} erneut versuchen.`);
                        await waitMs(backoffMs);
                    } else {
                        appendRequestLog(`${err.message} Bitte erneut versuchen.`);
                    }
                }
            }
        }

        // ===== NIP-46 Signer Startup und Initialisierung =====
        // Haupteinstiegspunkt: Initialisiert NDK, entsperrt Schlüssel, startete NIP-46 RPC-Backend
        
        /**\n         * KRITISCHE FUNKTION: Initialisiert und startet den kompletten NIP-46 Signer.\n         * Dies ist der Einstiegspunkt am Ende des Skriptes.\n         * \n         * Prozess (in Reihenfolge):\n         * 1. NDK mit RELAYS initialisieren\n         * 2. Benutzer-Entsperrrung (mit Retry bei Validierungsfehlern)\n         * 3. Aktiven Schlüssel laden und NDKUser erstellen\n         * 4. Bunker/Nostrconnect URIs generieren\n         * 5. Verbindungsinformationen für Parent bereitstellen\n         * 6. UI aktualisieren (Status, User-Info, ConnectionInfo)\n         * 7. NIP-46 NDKNip46Backend initialisieren mit Permission-Callback\n         * 8. RPC-Relay-Zuverlässigkeit patchen\n         * 9. Relay-Verbindungen gewährleisten\n         * 10. \"ready\" Message an Parent senden\n         * \n         * Permission-Callback logik:\n         * - switch_relays: BLOCKIERT (feste Allowlist)\n         * - AUTO_ALLOW_METHODS: Auto erlaubt (connect, ping, get_public_key)\n         * - Nicht-sensible Methoden: Auto erlaubt\n         * - SENSITIVE_METHODS mit TTL-Genehmigung: Erlaubt wenn noch nicht abgelaufen\n         * - SENSITIVE_METHODEN ohne TTL: Frage Benutzer via Modal\n         * \n         * @throws {Error} Bei Entsperrrung fehlgeschlagen, NDK/Relay Fehler, oder NIP-46 Backend Start Fehler\n         */
        async function startSigner() {
            ensureSecureTransportOrThrow();

            const ndk = new NDK({ explicitRelayUrls: RELAYS });
            await ndk.connect();

            const unlocked = await getOrAskActiveKeyWithRetry();
            sessionPassword = unlocked.password;
            sessionUnlockMaterial = unlocked.unlockMaterial || null;
            currentKeyring = unlocked.keyring;
            activeKeyId = unlocked.keyId;
            activeNsec = unlocked.nsec;
            if (!sessionUnlockMaterial && sessionPassword && currentKeyring?.keys?.length) {
                const { entry: activeEntry } = resolveActiveKeyEntry(currentKeyring, activeKeyId);
                sessionUnlockMaterial = await deriveUnlockMaterialFromPassword(sessionPassword, activeEntry.payload);
            }

            const localSigner = new NDKPrivateKeySigner(activeNsec);
            const user = await localSigner.user();
            activeUser = user;

            const relayQuery = RELAYS.map((relayUrl) => `relay=${encodeURIComponent(relayUrl)}`).join("&");
            const bunkerUri = `bunker://${user.pubkey}?${relayQuery}`;
            const nostrconnectUri = `nostrconnect://${user.pubkey}?${relayQuery}`;
            connectionInfo = {
                pubkey: user.pubkey,
                npub: user.npub,
                keyName: unlocked.keyName,
                relays: RELAYS,
                bunkerUri,
                nostrconnectUri
            };

            document.getElementById("status").innerText = "bereit 🟢";
            document.getElementById("user-info").innerText =
                `Aktiver Schlüssel: ${unlocked.keyName} | ` +
                `${user.npub.substring(0, 32)}...\n` +
                "Warte auf NostrConnect-Anfragen.";
            document.getElementById("connection-info").innerText =
                `Aktiver Schlüssel: ${unlocked.keyName}\n` +
                `pubkey: ${user.pubkey}\n` +
                `npub: ${user.npub}\n` +
                `Relays: ${RELAYS.join(", ")}\n` +
                `Bunker URI: ${bunkerUri}\n` +
                `Nostrconnect URI: ${nostrconnectUri}`;

            renderKeyManager();
            setActiveTab("signer");
            setCompactConnectedMode(isEmbeddedContext);
            renderStandaloneConnectionInfo();

            const nip46Backend = new NDKNip46Backend(
                ndk,
                localSigner,
                async (request) => {
                    devLog("NIP-46 Anfrage:", request);
                    const method = request?.method;
                    const pubkey = request?.pubkey ?? "";
                    appendRequestLog(`Methode: ${method} von ${pubkey.slice(0, 12) || "?"}...`);

                    if (method === "switch_relays") {
                        appendRequestLog("Blockiert: switch_relays (feste Relay-Allowlist)");
                        return false;
                    }

                    if (AUTO_ALLOW_METHODS.has(method)) {
                        appendRequestLog(`Auto erlaubt: ${method}`);
                        return true;
                    }

                    if (!SENSITIVE_METHODS.has(method)) {
                        appendRequestLog(`Nicht sensitiv, erlaubt: ${method}`);
                        return true;
                    }

                    if (pubkey && hasActivePermission(pubkey, method)) {
                        appendRequestLog(`TTL erlaubt: ${method}`);
                        return true;
                    }

                    return requestPermission(request);
                },
                RELAYS
            );

            patchBackendRpcReliability(nip46Backend);
            await nip46Backend.start();
            await ensureBackendRpcRelaysConnected(nip46Backend, 9000, 1);
            appendRequestLog("Signer RPC verbunden.");
            postBridgeMessage("ready", connectionInfo);
            appendRequestLog("Bridge: ready an Parent gesendet");
            devLog("Bunker URI:", bunkerUri);
            devLog("Nostrconnect URI:", nostrconnectUri);
        }

        // ===== Modal UI Hilfsfunktionen =====
        
        /**
         * Erzeugt einen benutzerfreundlichen Titel für eine NIP-46 Request-Methode.
         * Wird im Modal als Fragestellung angezeigt.
         * 
         * @param {string} method - Die NIP-46 Methodenname
         * @returns {string} Ein benutzerfreundlicher Titel (z.B. "Signieren und senden?")
         */
        function humanRequestTitle(method) {
            if (method === "sign_event") return "Signieren und senden?";
            if (method === "connect") return "Verbindung erlauben?";
            if (method === "get_public_key") return "Öffentlichen Schlüssel teilen?";
            if (method === "nip04_encrypt" || method === "nip44_encrypt") return "Verschlüsseln erlauben?";
            if (method === "nip04_decrypt" || method === "nip44_decrypt") return "Entschlüsseln erlauben?";
            return `Anfrage: ${method}`;
        }

        /**
         * Zeigt ein Modal-Fenster für eine NIP-46 Genehmigungsanfrage.
         * Der Benutzer kann "einmal erlauben", "immer erlauben" oder "ablehnen" auswählen.
         * 
         * @param {object} req - Die NIP-46 Request mit method, pubkey, params
         * @param {function} onAllowOnce - Callback für "einmal erlauben" (this session only)
         * @param {function} onAllowAlways - Callback für "immer erlauben" (permanent)
         * @param {function} onReject - Callback für "ablehnen"
         */
        function showModal(req, onAllowOnce, onAllowAlways, onReject) {
            document.getElementById("request-title").innerText = humanRequestTitle(req.method);
            document.getElementById("request-details").innerText =
                `Methode: ${req.method}\nParameter: ${formatRequestParams(req)}`;

            document.getElementById("overlay").style.display = "block";
            document.getElementById("auth-modal").style.display = "block";
            scheduleFrameSizeNotification(true);

            document.getElementById("allow-once-btn").onclick = () => {
                hideModal();
                onAllowOnce();
            };

            document.getElementById("allow-always-btn").onclick = () => {
                hideModal();
                onAllowAlways();
            };

            document.getElementById("reject-btn").onclick = () => {
                hideModal();
                onReject();
            };
        }

        /**
         * Versteckt das Modal-Fenster und Overlay.
         */
        function hideModal() {
            document.getElementById("overlay").style.display = "none";
            document.getElementById("auth-modal").style.display = "none";
            signerAttention.resolvePermissionRequest();
            scheduleFrameSizeNotification(true);
        }

        // ===== Initialization und Event Listener Setup =====
        // Diese Zeilen richten alle Event-Listener auf und starten den Signer
        
        setupTabNavigation();
        setupKeyManagerHandlers();
        signerAttention.initSettingsUi();
        setupFrameAutoResizeBridge();
        window.addEventListener("message", bridgeMessageHandler);
        registerPwaServiceWorker().catch(() => {});

        /**
         * Startet den kompletten Signer Prozess.
         * Bei Fehler wird die Fehlermeldung im Status-Display angezeigt.
         */
        startSigner().catch((err) => {
            console.error(err);
            setCompactConnectedMode(false);
            renderStandaloneConnectionInfo();
            document.getElementById("status").innerText = `🔴 Fehler: ${err.message}`;
        });


