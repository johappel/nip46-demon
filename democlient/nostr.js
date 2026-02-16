import NDK, { NDKEvent, NDKNip46Signer, NDKRelaySet } from "../vendor/ndk-3.0.0.js";

const BRIDGE_SOURCE = "nip46-signer-bridge";
const DEFAULT_RELAYS = [
    "wss://relay.damus.io",
    "wss://nos.lol",
    "wss://relay.primal.net",
    "wss://relay.snort.social"
];
const MIN_SIGNER_FRAME_HEIGHT = 110;
const MAX_SIGNER_FRAME_HEIGHT = 1200;

/**
 * @typedef {object} BunkerClientOptions
 * @property {HTMLIFrameElement} signerFrameEl
 * @property {HTMLInputElement=} signerUrlInputEl
 * @property {HTMLInputElement=} connectionUriInputEl
 * @property {HTMLElement=} statusEl
 * @property {HTMLDialogElement=} requestDialogEl
 * @property {HTMLElement=} requestDialogTitleEl
 * @property {HTMLElement=} requestDialogDetailsEl
 * @property {string=} signerUrl
 * @property {boolean=} autoConnect
 * @property {boolean=} exposeWindowNostr
 * @property {boolean=} overrideExistingWindowNostr
 * @property {boolean=} showUnlockRequestDialog
 * @property {boolean=} showApprovalRequestDialog
 * @property {string[]=} defaultRelayUrls
 * @property {(status:{text:string,isError:boolean}) => void=} onStatus
 * @property {(connection:object|null) => void=} onConnectionChanged
 */

/**
 * Checks whether a hostname is local.
 * @param {string} hostname - Hostname to validate.
 * @returns {boolean} True for localhost/loopback.
 */
function isLocalDevHostname(hostname) {
    const host = String(hostname || "").toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/**
 * Builds warning text for insecure HTTP transport.
 * @returns {string} Warning text or empty string.
 */
function getInsecureHttpWarningMessage() {
    if (window.location.protocol !== "http:") return "";
    if (isLocalDevHostname(window.location.hostname)) return "";
    return "Unsicherer HTTP-Zugriff erkannt. Bitte den Client nur ueber HTTPS oeffnen.";
}

/**
 * Throws if transport is insecure.
 * @throws {Error} If transport is insecure.
 */
function ensureSecureTransportOrThrow() {
    const warning = getInsecureHttpWarningMessage();
    if (!warning) return;
    throw new Error(warning);
}

/**
 * Canonicalizes relay URLs for deduplication.
 * @param {string} url - Relay URL.
 * @returns {string} Canonicalized URL.
 */
function canonicalRelayUrl(url) {
    try {
        return new URL(url).toString().replace(/\/$/, "");
    } catch (_err) {
        return String(url || "");
    }
}

/**
 * Returns unique relay URLs.
 * @param {string[]} relays - Candidate relay URLs.
 * @returns {string[]} Unique relay URLs.
 */
function uniqueRelayUrls(relays) {
    const map = new Map();
    for (const relay of relays || []) {
        const key = canonicalRelayUrl(relay);
        if (!key) continue;
        if (!map.has(key)) map.set(key, key);
    }
    return Array.from(map.values());
}

/**
 * Parses relay URLs from connection URI.
 * @param {string} uri - nostrconnect:// or bunker:// URI.
 * @param {string[]} defaultRelays - Relay fallback list.
 * @returns {string[]} Relay URLs.
 */
function relayUrlsFromUri(uri, defaultRelays) {
    const url = new URL(uri);
    const relays = url.searchParams.getAll("relay");
    return uniqueRelayUrls([...(relays || []), ...(defaultRelays || [])]);
}

/**
 * Converts connection URI to bunker URI.
 * @param {string} uri - URI to normalize.
 * @param {string[]} relays - Relay list to merge.
 * @returns {string} bunker:// URI.
 */
function toBunkerUri(uri, relays = []) {
    const url = new URL(uri);

    if (url.protocol === "bunker:") {
        const pubkey = url.hostname || url.pathname.replace(/^\/+/, "");
        if (!pubkey) throw new Error("Kein Pubkey in bunker URI gefunden.");
        const out = new URLSearchParams(url.searchParams);
        const mergedRelays = uniqueRelayUrls([...(out.getAll("relay") || []), ...(relays || [])]);
        out.delete("relay");
        for (const relay of mergedRelays) out.append("relay", relay);
        const qs = out.toString();
        return `bunker://${pubkey}${qs ? `?${qs}` : ""}`;
    }

    if (url.protocol !== "nostrconnect:") {
        throw new Error("URI muss mit nostrconnect:// oder bunker:// beginnen.");
    }

    const pubkey = url.hostname || url.pathname.replace(/^\/+/, "");
    if (!pubkey) throw new Error("Kein Pubkey in URI gefunden.");

    const out = new URLSearchParams();
    const mergedRelays = uniqueRelayUrls([...(url.searchParams.getAll("relay") || []), ...(relays || [])]);
    for (const relay of mergedRelays) out.append("relay", relay);
    const secret = url.searchParams.get("secret");
    if (secret) out.set("secret", secret);

    const qs = out.toString();
    return `bunker://${pubkey}${qs ? `?${qs}` : ""}`;
}

/**
 * Adds timeout behavior to a Promise.
 * @template T
 * @param {Promise<T>} promise - Promise to wrap.
 * @param {number} ms - Timeout in ms.
 * @param {string} stepName - Step name for error.
 * @returns {Promise<T>} Promise with timeout.
 */
function withTimeout(promise, ms, stepName) {
    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${stepName} Timeout (${ms}ms)`)), ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        if (timer) clearTimeout(timer);
    });
}

/**
 * Clamps iframe height.
 * @param {number} value - Requested height.
 * @returns {number} Clamped height.
 */
function clampSignerFrameHeight(value) {
    return Math.max(MIN_SIGNER_FRAME_HEIGHT, Math.min(MAX_SIGNER_FRAME_HEIGHT, value));
}

/**
 * Checks whether an element is visible.
 * @param {Element|null} element - Element to test.
 * @returns {boolean} True when visible.
 */
function isElementVisible(element) {
    if (!element) return false;
    if (element.hasAttribute("hidden")) return false;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * Builds a fixed relay set for publish.
 * @param {NDK} ndk - NDK instance.
 * @param {string[]} relays - Relay URLs.
 * @returns {NDKRelaySet} Relay set.
 */
function buildFixedRelaySet(ndk, relays) {
    const relayObjects = uniqueRelayUrls(relays).map((url) => ndk.pool.getRelay(url));
    return new NDKRelaySet(new Set(relayObjects), ndk);
}

/**
 * Creates a NIP-7 compatible adapter for NIP-46 signer.
 * @param {object} params - Adapter input.
 * @param {NDK} params.ndk - Active NDK instance.
 * @param {any} params.signer - NIP-46 signer.
 * @param {any} params.user - NDK user.
 * @param {string[]} params.relays - Relay list.
 * @returns {object} NIP-7 style provider.
 */
function makeNip7Adapter({ ndk, signer, user, relays }) {
    const pubkey = user.pubkey;

    /**
     * Signs an event over NIP-46.
     * @param {object} unsignedEvent - Unsigned event.
     * @returns {Promise<object>} Signed event.
     */
    async function signEventLikeNip7(unsignedEvent) {
        const normalized = {
            ...unsignedEvent,
            pubkey,
            tags: Array.isArray(unsignedEvent?.tags) ? unsignedEvent.tags : [],
            created_at: unsignedEvent?.created_at || Math.floor(Date.now() / 1000)
        };

        const event = new NDKEvent(ndk, normalized);
        await withTimeout(event.sign(signer), 25000, "sign_event");
        if (typeof event.rawEvent === "function") {
            const raw = event.rawEvent();
            if (raw) return raw;
        }
        return {
            kind: event.kind,
            content: event.content,
            tags: event.tags || [],
            created_at: event.created_at,
            pubkey: event.pubkey,
            id: event.id,
            sig: event.sig
        };
    }

    /**
     * Encrypts with NIP-04.
     * @param {string} pubkeyTarget - Target pubkey.
     * @param {string} plaintext - Plaintext.
     * @returns {Promise<string>} Ciphertext.
     */
    async function nip04Encrypt(pubkeyTarget, plaintext) {
        if (signer?.nip04?.encrypt) return signer.nip04.encrypt(pubkeyTarget, plaintext);
        if (typeof signer?.nip04Encrypt === "function") return signer.nip04Encrypt(pubkeyTarget, plaintext);
        throw new Error("nip04.encrypt nicht verfuegbar.");
    }

    /**
     * Decrypts with NIP-04.
     * @param {string} pubkeyTarget - Source pubkey.
     * @param {string} ciphertext - Ciphertext.
     * @returns {Promise<string>} Plaintext.
     */
    async function nip04Decrypt(pubkeyTarget, ciphertext) {
        if (signer?.nip04?.decrypt) return signer.nip04.decrypt(pubkeyTarget, ciphertext);
        if (typeof signer?.nip04Decrypt === "function") return signer.nip04Decrypt(pubkeyTarget, ciphertext);
        throw new Error("nip04.decrypt nicht verfuegbar.");
    }

    return {
        getPublicKey: async () => pubkey,
        signEvent: signEventLikeNip7,
        getRelays: async () => Object.fromEntries(relays.map((url) => [url, { read: true, write: true }])),
        nip04: { encrypt: nip04Encrypt, decrypt: nip04Decrypt }
    };
}

/**
 * Creates a reusable Bunkerconnect helper.
 * @param {BunkerClientOptions} options - Setup options.
 * @returns {object} Public API.
 */
export function createBunkerConnectClient(options = {}) {
    if (!(options.signerFrameEl instanceof HTMLIFrameElement)) {
        throw new Error("createBunkerConnectClient: signerFrameEl (iframe) fehlt.");
    }

    const config = {
        signerFrameEl: options.signerFrameEl,
        signerUrlInputEl: options.signerUrlInputEl || null,
        connectionUriInputEl: options.connectionUriInputEl || null,
        statusEl: options.statusEl || null,
        requestDialogEl: options.requestDialogEl || null,
        requestDialogTitleEl: options.requestDialogTitleEl || null,
        requestDialogDetailsEl: options.requestDialogDetailsEl || null,
        signerUrl: String(options.signerUrl || "../signer.html"),
        autoConnect: options.autoConnect !== false,
        exposeWindowNostr: options.exposeWindowNostr !== false,
        overrideExistingWindowNostr: options.overrideExistingWindowNostr === true,
        showUnlockRequestDialog: options.showUnlockRequestDialog !== false,
        showApprovalRequestDialog: options.showApprovalRequestDialog !== false,
        defaultRelayUrls: uniqueRelayUrls(options.defaultRelayUrls || DEFAULT_RELAYS),
        onStatus: typeof options.onStatus === "function" ? options.onStatus : null,
        onConnectionChanged: typeof options.onConnectionChanged === "function" ? options.onConnectionChanged : null
    };

    const state = {
        signerFrameOrigin: "",
        lastBridgeConnectionInfo: null,
        activeNdk: null,
        activeRelayUrls: [],
        activeProvider: null,
        activeConnection: null,
        iframeObserver: null,
        iframeDomSyncScheduled: false,
        currentSignerFrameHeight: 230,
        isInstalled: false,
        isConnecting: false,
        bridgeLocked: false,
        dismissedUnlockDialog: false,
        activeDialogKind: "",
        pendingUserApproval: false,
        autoConnectArmed: false,
        unsubscribers: []
    };

    /**
     * Emits status text.
     * @param {string} text - Status text.
     * @param {boolean} isError - Error state flag.
     */
    function setStatus(text, isError = false) {
        if (config.statusEl) {
            config.statusEl.textContent = text;
            config.statusEl.dataset.state = isError ? "error" : "ok";
        }
        if (config.onStatus) config.onStatus({ text, isError });
    }

    /**
     * Emits connection payload.
     * @param {object|null} connection - Current connection data.
     */
    function emitConnectionChanged(connection) {
        if (config.onConnectionChanged) config.onConnectionChanged(connection);
    }

    /**
     * Checks if a specific dialog kind should be shown.
     * @param {string} dialogKind - Dialog category (unlock/approval).
     * @returns {boolean} True when the dialog kind is enabled.
     */
    function shouldShowDialogForKind(dialogKind) {
        if (dialogKind === "unlock") return config.showUnlockRequestDialog;
        if (dialogKind === "approval") return config.showApprovalRequestDialog;
        return true;
    }

    /**
     * Opens request dialog if available.
     * @param {string} title - Dialog title.
     * @param {string} details - Dialog content.
     * @param {string=} dialogKind - Dialog category (unlock/approval).
     */
    function openRequestDialog(title, details, dialogKind = "") {
        if (!shouldShowDialogForKind(dialogKind)) return;
        if (dialogKind === "unlock" && state.dismissedUnlockDialog) return;

        if (config.requestDialogTitleEl) config.requestDialogTitleEl.textContent = title;
        if (config.requestDialogDetailsEl) config.requestDialogDetailsEl.textContent = details;
        state.activeDialogKind = String(dialogKind || "");
        if (!config.requestDialogEl) return;
        if (typeof config.requestDialogEl.showModal === "function" && !config.requestDialogEl.open) {
            try {
                config.requestDialogEl.showModal();
            } catch (_err) {
                config.requestDialogEl.setAttribute("open", "open");
            }
            return;
        }
        config.requestDialogEl.setAttribute("open", "open");
    }

    /**
     * Closes request dialog.
     */
    function closeRequestDialog() {
        if (!config.requestDialogEl) return;
        state.activeDialogKind = "";
        if (typeof config.requestDialogEl.close === "function" && config.requestDialogEl.open) {
            try {
                config.requestDialogEl.close();
            } catch (_err) {
                config.requestDialogEl.removeAttribute("open");
            }
            return;
        }
        config.requestDialogEl.removeAttribute("open");
    }

    /**
     * Handles manual close/cancel of the host request dialog.
     */
    function onHostDialogClosed() {
        if (!shouldShowDialogForKind(state.activeDialogKind)) {
            state.activeDialogKind = "";
            return;
        }
        if (state.activeDialogKind === "unlock" && state.bridgeLocked) {
            state.dismissedUnlockDialog = true;
        }
        state.activeDialogKind = "";
    }

    /**
     * Applies iframe height update.
     * @param {number} height - Requested height.
     */
    function applySignerFrameHeight(height) {
        const numeric = Number(height);
        if (!Number.isFinite(numeric)) return;
        const px = Math.round(clampSignerFrameHeight(numeric));
        if (Math.abs(px - state.currentSignerFrameHeight) < 2) return;
        state.currentSignerFrameHeight = px;
        config.signerFrameEl.style.height = `${px}px`;
    }

    /**
     * Builds signer iframe URL.
     * @returns {URL} Signer URL with parentOrigin.
     */
    function buildSignerFrameSrc() {
        const raw = config.signerUrlInputEl?.value?.trim() || config.signerUrl;
        const signerUrl = new URL(raw, window.location.href);
        signerUrl.searchParams.set("parentOrigin", window.location.origin);
        return signerUrl;
    }

    /**
     * Reloads signer iframe.
     */
    function refreshSignerFrame() {
        const signerUrl = buildSignerFrameSrc();
        state.signerFrameOrigin = signerUrl.origin;
        config.signerFrameEl.src = signerUrl.toString();
        applySignerFrameHeight(MIN_SIGNER_FRAME_HEIGHT);
    }

    /**
     * Persists bridge connection info locally and into fallback input.
     * @param {any} info - Bridge payload.
     */
    function applyConnectionInfo(info) {
        if (!info || typeof info !== "object") return;
        state.lastBridgeConnectionInfo = info;
        if (
            config.connectionUriInputEl &&
            typeof info.nostrconnectUri === "string" &&
            info.nostrconnectUri.startsWith("nostrconnect://")
        ) {
            config.connectionUriInputEl.value = info.nostrconnectUri;
        }
    }

    /**
     * Mirrors current signer request state from iframe DOM into host dialog.
     */
    function syncSignerDialogFromIframeDom() {
        let frameDoc = null;
        try {
            frameDoc = config.signerFrameEl.contentDocument;
        } catch (_err) {
            return;
        }
        if (!frameDoc) return;

        const authModal = frameDoc.getElementById("auth-modal");
        const unlockPanel = frameDoc.getElementById("unlock-panel");
        const authVisible = isElementVisible(authModal);
        const unlockVisible = isElementVisible(unlockPanel) && state.bridgeLocked;

        if (!unlockVisible) {
            state.dismissedUnlockDialog = false;
        }

        if (authVisible) {
            const title = frameDoc.getElementById("request-title")?.textContent?.trim() || "Genehmigung erforderlich";
            const details = frameDoc.getElementById("request-details")?.textContent?.trim() || "Bitte Anfrage im Signer bestaetigen.";
            openRequestDialog(title, details, "approval");
            return;
        }

        if (unlockVisible) {
            const title = frameDoc.getElementById("unlock-title")?.textContent?.trim() || "Passwort erforderlich";
            const details = frameDoc.getElementById("unlock-hint")?.textContent?.trim() || "Bitte Signer entsperren.";
            if (!shouldShowDialogForKind("unlock")) {
                closeRequestDialog();
                return;
            }
            openRequestDialog(title, details, "unlock");
            return;
        }

        if (state.pendingUserApproval) {
            openRequestDialog("Signer Genehmigung", "Bitte Anfrage im Signer bestaetigen oder ablehnen.", "approval");
            return;
        }

        closeRequestDialog();
    }

    /**
     * Schedules one iframe DOM sync run.
     */
    function scheduleSignerDomSync() {
        if (state.iframeDomSyncScheduled) return;
        state.iframeDomSyncScheduled = true;
        requestAnimationFrame(() => {
            state.iframeDomSyncScheduled = false;
            syncSignerDialogFromIframeDom();
        });
    }

    /**
     * Attaches mutation observer to signer iframe.
     */
    function attachIframeDomObserver() {
        if (state.iframeObserver) {
            state.iframeObserver.disconnect();
            state.iframeObserver = null;
        }

        try {
            const frameDoc = config.signerFrameEl.contentDocument;
            if (!frameDoc?.body) return;
            state.iframeObserver = new MutationObserver(() => scheduleSignerDomSync());
            state.iframeObserver.observe(frameDoc.body, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
            scheduleSignerDomSync();
        } catch (_err) {
            setStatus("Hinweis: Iframe-DOM nicht lesbar (Cross-Origin).", false);
        }
    }

    /**
     * Requests connection info from signer iframe.
     * @param {number} timeoutMs - Request timeout in ms.
     * @returns {Promise<any>} Connection payload.
     */
    function requestConnectionInfoFromIframe(timeoutMs = 3000) {
        return new Promise((resolve, reject) => {
            if (!config.signerFrameEl.contentWindow) {
                reject(new Error("Signer iframe ist nicht bereit."));
                return;
            }
            if (!state.signerFrameOrigin) {
                reject(new Error("Signer Origin ist unbekannt."));
                return;
            }

            const timeout = setTimeout(() => {
                window.removeEventListener("message", onMessage);
                reject(new Error("Keine Bridge-Antwort vom Signer iframe."));
            }, timeoutMs);

            /**
             * Handles request-response bridge messages.
             * @param {MessageEvent} event - Browser message event.
             */
            function onMessage(event) {
                if (event.origin !== state.signerFrameOrigin) return;
                const data = event.data;
                if (!data || data.source !== BRIDGE_SOURCE) return;

                if (data.type === "frame-size") {
                    applySignerFrameHeight(data?.payload?.height);
                    return;
                }

                if (data.type === "locked") {
                    clearTimeout(timeout);
                    window.removeEventListener("message", onMessage);
                    state.bridgeLocked = true;
                    openRequestDialog("Signer Passwort", data?.payload?.reason || "Signer ist gesperrt.", "unlock");
                    reject(new Error(data?.payload?.reason || "Signer ist gesperrt."));
                    return;
                }

                if (data.type !== "ready" && data.type !== "connection-info") return;
                clearTimeout(timeout);
                window.removeEventListener("message", onMessage);
                resolve(data.payload || null);
            }

            window.addEventListener("message", onMessage);
            config.signerFrameEl.contentWindow.postMessage(
                { source: BRIDGE_SOURCE, type: "get-connection-info" },
                state.signerFrameOrigin
            );
        });
    }

    /**
     * Resolves relay list and bunker URI from bridge info or manual input.
     * @returns {{relays:string[], bunkerUri:string}} Connect target.
     */
    function resolveConnectTarget() {
        const bridgeInfo = state.lastBridgeConnectionInfo;
        if (bridgeInfo?.bunkerUri && Array.isArray(bridgeInfo?.relays) && bridgeInfo.relays.length > 0) {
            return {
                relays: uniqueRelayUrls(bridgeInfo.relays),
                bunkerUri: bridgeInfo.bunkerUri
            };
        }

        const fallbackUri = config.connectionUriInputEl?.value?.trim() || "";
        if (!fallbackUri) throw new Error("Keine Connection URI vorhanden. Bitte Signer entsperren oder URI eintragen.");

        const relays = relayUrlsFromUri(fallbackUri, config.defaultRelayUrls);
        return { relays, bunkerUri: toBunkerUri(fallbackUri, relays) };
    }

    /**
     * Connects client to Bunker signer.
     * @param {boolean} forceReconnect - Reconnect even if already connected.
     * @returns {Promise<object>} Connection payload.
     */
    async function connectWithBunker(forceReconnect = false) {
        ensureSecureTransportOrThrow();

        if (!forceReconnect && state.activeConnection) return state.activeConnection;
        if (state.isConnecting) throw new Error("Verbindung laeuft bereits.");

        state.isConnecting = true;
        setStatus("Verbinde mit Bunkerconnect ...", false);

        try {
            try {
                const info = await requestConnectionInfoFromIframe(1800);
                applyConnectionInfo(info);
            } catch (_err) {
                // fallback only
            }

            const target = resolveConnectTarget();
            const ndk = new NDK({ explicitRelayUrls: target.relays });
            await withTimeout(ndk.connect(), 10000, "relay connect");

            const signer = NDKNip46Signer.bunker(ndk, target.bunkerUri);
            let user;
            try {
                user = await withTimeout(signer.blockUntilReady(), 15000, "nip46 handshake");
            } catch (_err) {
                const pubkey = await withTimeout(signer.getPublicKey(), 10000, "get_public_key");
                user = ndk.getUser({ pubkey });
            }

            state.activeNdk = ndk;
            state.activeRelayUrls = target.relays;
            state.activeProvider = makeNip7Adapter({ ndk, signer, user, relays: target.relays });
            state.activeConnection = {
                pubkey: user.pubkey,
                npub: user.npub,
                relays: target.relays,
                bunkerUri: target.bunkerUri
            };
            state.bridgeLocked = false;

            if (config.exposeWindowNostr && (config.overrideExistingWindowNostr || !window.nostr)) {
                window.nostr = state.activeProvider;
            }

            setStatus("Verbunden. Signer ist bereit.", false);
            emitConnectionChanged(state.activeConnection);
            scheduleSignerDomSync();
            return state.activeConnection;
        } catch (err) {
            setStatus(`Verbindung fehlgeschlagen: ${err.message}`, true);
            throw err;
        } finally {
            state.isConnecting = false;
        }
    }

    /**
     * Handles incoming bridge events.
     * @param {MessageEvent} event - Browser message event.
     */
    function onWindowMessage(event) {
        if (!state.signerFrameOrigin || event.origin !== state.signerFrameOrigin) return;
        const data = event.data;
        if (!data || data.source !== BRIDGE_SOURCE) return;

        if (data.type === "frame-size") {
            applySignerFrameHeight(data?.payload?.height);
            return;
        }

        if (data.type === "locked") {
            state.bridgeLocked = true;
            setStatus(data?.payload?.reason || "Signer ist gesperrt. Bitte Passwort im iframe eingeben.", false);
            openRequestDialog("Signer Passwort", data?.payload?.reason || "Bitte Signer entsperren.", "unlock");
            scheduleSignerDomSync();
            return;
        }

        if (data.type === "ready" || data.type === "connection-info") {
            state.bridgeLocked = false;
            state.dismissedUnlockDialog = false;
            applyConnectionInfo(data.payload || null);
            setStatus("Signer bereit. Verbindung wird vorbereitet ...", false);
            scheduleSignerDomSync();

            if (config.autoConnect && state.autoConnectArmed && !state.activeConnection && !state.isConnecting) {
                connectWithBunker(false).catch((err) => setStatus(`Auto-Connect fehlgeschlagen: ${err.message}`, true));
            }
        }
    }

    /**
     * Handles signer iframe load event.
     */
    function onSignerFrameLoad() {
        attachIframeDomObserver();

        if (config.signerFrameEl.contentWindow && state.signerFrameOrigin) {
            try {
                config.signerFrameEl.contentWindow.postMessage(
                    { source: BRIDGE_SOURCE, type: "request-frame-size" },
                    state.signerFrameOrigin
                );
            } catch (_err) {
                // no-op
            }
        }

        requestConnectionInfoFromIframe(1500)
            .then((info) => {
                applyConnectionInfo(info);
                if (config.autoConnect && state.autoConnectArmed && !state.activeConnection) {
                    return connectWithBunker(false);
                }
                return null;
            })
            .catch((_err) => {
                // signer likely locked, this is expected.
            });
    }

    /**
     * Installs signer iframe and enables auto connect flow.
     * @returns {Promise<void>} Resolves after setup.
     */
    async function installSignerAndAutoConnect() {
        ensureSecureTransportOrThrow();
        state.autoConnectArmed = true;

        if (!state.isInstalled) {
            window.addEventListener("message", onWindowMessage);
            config.signerFrameEl.addEventListener("load", onSignerFrameLoad);
            if (config.requestDialogEl) {
                config.requestDialogEl.addEventListener("close", onHostDialogClosed);
                config.requestDialogEl.addEventListener("cancel", onHostDialogClosed);
                state.unsubscribers.push(() => config.requestDialogEl.removeEventListener("close", onHostDialogClosed));
                state.unsubscribers.push(() => config.requestDialogEl.removeEventListener("cancel", onHostDialogClosed));
            }
            state.unsubscribers.push(() => window.removeEventListener("message", onWindowMessage));
            state.unsubscribers.push(() => config.signerFrameEl.removeEventListener("load", onSignerFrameLoad));
            state.isInstalled = true;
        }

        setStatus("Signer wird eingebettet ...", false);
        refreshSignerFrame();

        try {
            const info = await requestConnectionInfoFromIframe(1200);
            applyConnectionInfo(info);
            if (config.autoConnect) await connectWithBunker(false);
        } catch (err) {
            setStatus(`Warte auf Signer Entsperrung: ${err.message}`, false);
            scheduleSignerDomSync();
        }
    }

    /**
     * Connects immediately.
     * @returns {Promise<object>} Connection payload.
     */
    async function connectNow() {
        return connectWithBunker(true);
    }

    /**
     * Fetches connection info from iframe manually.
     * @returns {Promise<any>} Bridge info payload.
     */
    async function syncConnectionInfo() {
        const info = await requestConnectionInfoFromIframe(3000);
        applyConnectionInfo(info);
        return info;
    }

    /**
     * Reads active public key.
     * @returns {Promise<string>} Pubkey hex.
     */
    async function getPublicKey() {
        if (!state.activeProvider) throw new Error("Noch kein aktiver Provider. Bitte zuerst verbinden.");
        return withTimeout(state.activeProvider.getPublicKey(), 20000, "window.nostr.getPublicKey");
    }

    /**
     * Signs one event and opens dialog while approval is pending.
     * @param {object} unsignedEvent - Unsigned event.
     * @returns {Promise<object>} Signed event.
     */
    async function signEvent(unsignedEvent) {
        if (!state.activeProvider) throw new Error("Noch kein aktiver Provider. Bitte zuerst verbinden.");
        state.pendingUserApproval = true;
        scheduleSignerDomSync();

        try {
            return await withTimeout(state.activeProvider.signEvent(unsignedEvent), 30000, "window.nostr.signEvent");
        } finally {
            state.pendingUserApproval = false;
            scheduleSignerDomSync();
        }
    }

    /**
     * Publishes one signed event.
     * @param {object} signedEvent - Signed event.
     * @returns {Promise<string[]>} Published relay URLs.
     */
    async function publishSignedEvent(signedEvent) {
        if (!state.activeNdk || state.activeRelayUrls.length === 0) {
            throw new Error("Keine aktive Publish-Umgebung. Bitte zuerst verbinden.");
        }
        const ndkEvent = new NDKEvent(state.activeNdk, signedEvent);
        const relaySet = buildFixedRelaySet(state.activeNdk, state.activeRelayUrls);
        const publishedTo = await withTimeout(ndkEvent.publish(relaySet, 8000, 1), 15000, "publish");
        return Array.from(publishedTo).map((relay) => relay.url);
    }

    /**
     * Signs and publishes a kind:1 text note.
     * @param {string} content - Text note content.
     * @param {string[][]=} tags - Optional tags.
     * @returns {Promise<{signedEvent:object,publishedRelayUrls:string[]}>} Publish result.
     */
    async function publishTextNote(content, tags = []) {
        const normalizedContent = String(content || "").trim();
        if (!normalizedContent) throw new Error("Event-Content darf nicht leer sein.");

        const pubkey = await getPublicKey();
        const signedEvent = await signEvent({
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            tags: Array.isArray(tags) ? tags : [],
            content: normalizedContent,
            pubkey
        });

        const publishedRelayUrls = await publishSignedEvent(signedEvent);
        return { signedEvent, publishedRelayUrls };
    }

    /**
     * Returns a shallow state snapshot.
     * @returns {object} Runtime state snapshot.
     */
    function getStateSnapshot() {
        return {
            signerFrameOrigin: state.signerFrameOrigin,
            lastBridgeConnectionInfo: state.lastBridgeConnectionInfo,
            activeRelayUrls: [...state.activeRelayUrls],
            activeConnection: state.activeConnection ? { ...state.activeConnection } : null,
            isInstalled: state.isInstalled,
            isConnecting: state.isConnecting,
            bridgeLocked: state.bridgeLocked
        };
    }

    /**
     * Disposes all listeners.
     */
    function destroy() {
        for (const unsub of state.unsubscribers.splice(0)) {
            unsub();
        }
        if (state.iframeObserver) {
            state.iframeObserver.disconnect();
            state.iframeObserver = null;
        }
        closeRequestDialog();
        state.isInstalled = false;
    }

    const insecureWarning = getInsecureHttpWarningMessage();
    if (insecureWarning) setStatus(insecureWarning, true);

    return {
        installSignerAndAutoConnect,
        connectNow,
        syncConnectionInfo,
        getPublicKey,
        signEvent,
        publishSignedEvent,
        publishTextNote,
        getState: getStateSnapshot,
        destroy
    };
}
