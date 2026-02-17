# NIP-46 Signer Doku

Diese Doku beschreibt, wie `signer.html` funktioniert und wie du ihn in einen Nostr Client einbindest.

## 1. Ueberblick

Der Signer in `signer.html` ist ein Browser-basierter NIP-46 Signer mit:

- lokalem Keyring (verschluesselte `nsec`-Keys in `localStorage`)
- UI fuer Entsperren, Key-Verwaltung und Request-Freigaben
- NIP-46 Backend ueber NDK (`NDKNip46Backend`)
- PWA-Basis (Manifest + Service Worker) fuer Standalone-App-Fenster
- optionaler iframe-Bridge fuer Parent-Clients (z. B. `mpv-nostr-client.html`, `tests/sendevent.html`)

Wichtige Eigenschaften:

- Default-Relays mit lokalem User-Override (Tab `Relays`)
- Datenschutzhinweise in einfacher Sprache direkt im Tab `Datenschutz`
- per-Methoden-Freigaben mit "einmal" / "immer"
- Auto-Allow fuer nicht-kritische Methoden (`connect`, `ping`, `get_public_key`)
- Blockierung von `switch_relays` (remote), Relay-Aenderung nur lokal im Signer

Aktuelle Dateiaufteilung (Recoding):

- `signer.html`: HTML-Layout + CSP + Modul-Bootstrap
- `signer-ui.css`: komplette Signer-Styles
- `signer-nip46.js`: NIP-46 Core, Keyring, Bridge, Startup
- `signer-ui.js`: UI-nahe Features fuer Aufmerksamkeit (Notification, Title-Blink, Sound)

## 2. Architektur

### 2.1 Kernkomponenten

- `NDK` verbindet den Signer mit den konfigurierten Relays.
- `NDKPrivateKeySigner` signiert lokal mit dem entschluesselten `nsec`.
- `NDKNip46Backend` beantwortet eingehende NIP-46 RPC-Requests.
- Browser-Storage speichert Keyring, Freigaben, Unlock-Cache und optionale WP-Bindings.

### 2.2 Lifecycle

1. `startSigner()` laedt die konfigurierte Relay-Liste (oder Defaults), startet NDK und verbindet Relays.
2. `getOrAskActiveKeyWithRetry()` entsperrt oder initialisiert den Keyring.
3. Aktiver Key wird als `NDKPrivateKeySigner` geladen.
4. `bunker://...` und `nostrconnect://...` URI werden erzeugt.
5. `NDKNip46Backend` startet und verarbeitet Requests inkl. Freigabepruefung.
6. Falls im iframe: `ready` + `connection-info` werden an Parent gesendet.

## 3. Key- und Passwortmodell

### 3.1 Verschluesselung

`nsec` wird mit AES-GCM verschluesselt. Der AES-Key wird aus Passwort + Salt ueber PBKDF2-SHA256 abgeleitet.

- Iterationen: `210000`
- Payload-Format (Version 1): `v`, `kdf`, `alg`, `iter`, `salt`, `iv`, `ct`

### 3.2 Storage-Keys

- Keyring: `nip46_demo_keyring_enc_v2`
- Aktiver Key: `nip46_demo_active_key_id_v1`
- Session-Cache: `nip46_unlock_cache_session_v1`
- TTL-Cache: `nip46_unlock_cache_ttl_v1`
- Unlock-Remember-Praferenz: `nip46_unlock_remember_pref_v1`
- Permissions: `nip46_permissions_v1`
- Permission-Metadaten: `nip46_permissions_meta_v1`
- WP-User-Bindings: `nip46_wp_user_bindings_v1`
- Attention-Settings: `nip46_attention_settings_v1`
- User-Relay-Override: `nip46_custom_relays_v1`

### 3.3 Migrationen

Beim Start werden alte Formate migriert:

- Klartext `nsec` (`nip46_demo_nsec`) -> verschluesselter Keyring
- altes encrypted single-key Format (`nip46_demo_nsec_enc_v1`) -> Keyring

## 4. Freigaben und Security-Verhalten

### 4.1 Methodenklassen

- Auto-Allow: `connect`, `ping`, `get_public_key`
- Sensitiv: `sign_event`, `nip04_encrypt`, `nip04_decrypt`, `nip44_encrypt`, `nip44_decrypt`
- `switch_relays` wird explizit geblockt (Relays werden nur lokal im Signer gesetzt)

### 4.2 Freigabe-Flow

Wenn eine sensitive Methode ankommt:

1. Pruefen, ob gueltige gespeicherte Permission existiert (`pubkey + method`).
2. Falls nein: Modal mit "Einmal erlauben", "Immer erlauben", "Ablehnen".
3. Bei "Immer erlauben": Permission wird persistent gespeichert (`PERMISSION_FOREVER`).

Die Requests laufen ueber eine Queue, damit mehrere gleichzeitige Anfragen nacheinander angezeigt werden.

### 4.3 Aufmerksamkeit bei offenen Requests

Bei neuen sensiblen Requests kann der Signer optional:

- eine Windows-Benachrichtigung per Notification API senden
- den `document.title` blinken lassen
- einen kurzen Signalton ueber Web Audio API abspielen

Die Optionen sind im Tab "Passwort" konfigurierbar und werden in `localStorage` gespeichert (`nip46_attention_settings_v1`).
Zusaetzlich gibt es dort einen Button `Test-Benachrichtigung`, um Notification + Blinkverhalten direkt zu pruefen.

### 4.4 Relay-Robustheit

`patchBackendRpcReliability()` patched `sendRequest` / `sendResponse`, damit vor RPC-Operationen mindestens eine Relay-Verbindung steht.

### 4.5 Relay-Konfiguration durch den User

Im Tab `Relays` kann die Relay-Liste lokal ueberschrieben werden:

- Eingabe: eine URL pro Zeile oder kommasepariert
- Erlaubt: `wss://` und `ws://`
- Deduplizierung und Validierung vor dem Speichern
- Reset auf Default-Relays ueber Button

Wichtig:

- Aenderungen gelten nach Reload/Neustart des Signers.
- Die konfigurierte Liste wird fuer NDK-Verbindung, `NDKNip46Backend` und URI-Erzeugung (`bunker://`, `nostrconnect://`) verwendet.
- Externe `switch_relays`-Requests bleiben aus Sicherheitsgruenden blockiert.

### 4.6 Datenschutz-Tab (User-Transparenz)

Der Tab `Datenschutz` erklaert in einfacher Sprache:

- welche Daten nur lokal im Browser gespeichert werden
- welche Daten bei der Relay-Nutzung an Dritte (Relay-Betreiber) sichtbar sein koennen
- was der Signer nicht automatisch an Dritte weitergibt
- welche Eigenverantwortung beim Nutzer bleibt (Passwort, Geraetesicherheit, vorsichtiger Umgang mit `nsec`)

## 5. Bridge-Protokoll (iframe <-> Parent)

Alle Bridge-Messages nutzen:

- `source: "nip46-signer-bridge"`
- streng geprueftes `origin` via `parentOrigin` Query-Parameter oder `document.referrer`

### 5.1 Signer -> Parent

- `ready` (payload: connectionInfo)
- `connection-info` (payload: connectionInfo)
- `locked` (payload: reason)
- `frame-size` (payload: `{ height }`)
- `wp-user-key-result` (Antwort auf WP-Key-Request)

### 5.2 Parent -> Signer

- `get-connection-info`
- `ping`
- `request-frame-size`
- `wp-ensure-user-key` (payload: `{ requestId, userId }`)

## 6. Einbindung in einen Nostr Client

Es gibt zwei typische Integrationen:

1. iframe + Bridge (empfohlen fuer enge UI-Integration)
2. direkte URI-Eingabe (`nostrconnect://` oder `bunker://`)

Die Referenz-Implementierungen sind:

- `mpv-nostr-client.html`
- `tests/sendevent.html`
- `democlient/index.html` + `democlient/nostr.js` + `democlient/index.js`

### 6.1 Iframe-Integration (empfohlen)

#### Schritt 1: iframe laden

- Signer-URL setzen (z. B. `./signer.html`)
- `parentOrigin` Query-Parameter mitschicken

Beispiel:

```js
const signerUrl = new URL("./signer.html", window.location.href);
signerUrl.searchParams.set("parentOrigin", window.location.origin);
signerFrame.src = signerUrl.toString();
```

#### Schritt 2: Connection-Info via Bridge holen

Nach iframe-load oder auf Button-Klick:

```js
signerFrame.contentWindow.postMessage(
  { source: "nip46-signer-bridge", type: "get-connection-info" },
  signerFrameOrigin
);
```

Erwarte als Antwort:

- `locked` -> User muss im Signer entsperren
- `connection-info` oder `ready` -> enthaelt `bunkerUri`, `nostrconnectUri`, `relays`, `pubkey`, `npub`

#### Schritt 3: NIP-46 Signer instanziieren

```js
const ndk = new NDK({ explicitRelayUrls: relays });
await ndk.connect();

const signer = NDKNip46Signer.bunker(ndk, bunkerUri);
const user = await signer.blockUntilReady(); // ggf. fallback: signer.getPublicKey()
```

#### Schritt 4: Events signieren und publizieren

```js
const event = new NDKEvent(ndk, {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  content: "Hallo",
  tags: []
});

await event.sign(signer);
await event.publish();
```

### 6.2 NIP-7-kompatibler Adapter

Wenn dein Client intern `window.nostr` erwartet, kannst du den NIP-46 Signer auf ein NIP-7-API mappen (wie in `mpv-nostr-client.html`):

- `getPublicKey()`
- `signEvent(unsignedEvent)`
- optional `nip04` / `nip44` encrypt/decrypt

So kann ein vorhandener NIP-7-Client ohne groesseren Umbau NIP-46 nutzen.

### 6.3 URI-Konvertierung

Der Client akzeptiert oft `nostrconnect://...`, braucht intern aber `bunker://...`.
Deshalb wird konvertiert:

- Protokoll pruefen
- Pubkey extrahieren
- Relay-Parameter zusammenfuehren
- optional `secret` uebernehmen

Diese Logik ist in `toBunkerUri(...)` umgesetzt (`mpv-nostr-client.html`, `tests/sendevent.html`).

## 7. WP-User-Key Erweiterung

Der Signer hat optional eine Bridge-Methode fuer deterministisches User-Key-Handling pro `userId`:

- Parent sendet `wp-ensure-user-key`
- Signer erzeugt oder findet gebundenen Key
- Antwort mit `wp-user-key-result` (`pubkey`, `npub`, `existed`, `keyId`, ...)

Use-Case: Multi-User-Systeme (z. B. WordPress), in denen pro App-User ein eigener Nostr-Key verwaltet wird.

## 8. Typische Fehlerbilder

- `locked`: Signer ist nicht entsperrt -> im iframe entsperren.
- Handshake-Timeout: Client kann fallback auf `getPublicKey()` machen (siehe `tests/sendevent.html`).
- Keine RPC-Relay-Verbindung: Relay-Auswahl pruefen, Netzwerk pruefen.
- Relay-Aenderung ohne Effekt: nach `Relays speichern` die Seite neu laden.
- Ungueltige URI: Nur `nostrconnect://` oder `bunker://` akzeptieren.
- Ersteinrichtung ohne `nsec`: Das Unlock-Panel zeigt direkt ein Feld-Feedback (`Bitte nsec eingeben oder generieren.` / `Ungueltiger nsec...`) und blockiert Submit bis ein gueltiger `nsec1...`-Wert gesetzt ist.

## 9. Minimaler Integrations-Blueprint

1. Signer iframe mit `parentOrigin` starten.
2. `connection-info` via Bridge anfordern.
3. `bunkerUri` + `relays` extrahieren.
4. `NDKNip46Signer.bunker(ndk, bunkerUri)` verbinden.
5. Requests im Signer bestaetigen.
6. Events ueber NDK signieren und publizieren.

## 10. Relevante Dateien im Repo

- `signer.html` (Signer-Layout mit Tabs inkl. `Relays`, Modals, CSP, Modul-Bootstrap; ohne `meta[name=\"theme-color\"]`, um Cross-Browser-Lint-Warnungen zu vermeiden)
- `signer-nip46.js` (NIP-46 Core, Keyring, Permissions, Relay-Config, Bridge, Startup)
- `signer-ui.js` (Attention-Features: Notification, Blink, Sound)
- `signer-ui.css` (komplette UI-Styles)
- `manifest.webmanifest`, `sw.js`, `icons/` (PWA/Installierbarkeit + Notification-Fallback)
- `mpv-nostr-client.html` (NIP-7 + NIP-46 Fallback, produktionsnahe Client-Integration)
- `tests/sendevent.html` (fokussierter Testclient inkl. WP-Bridge-Call)
- `democlient/index.html` (Boilerplate UI fuer eigene Clients)
- `democlient/index.css` (ausgelagerte Demo-Styles)
- `democlient/nostr.js` (gekapselte Bunkerconnect-Lib mit Auto-Connect + Dialog-Mirroring)
- `democlient/index.js` (Client-spezifische Logik wie Formularvalidierung und Absenden)

## 11. Manual: Nostr Client mit Bunkerconnect in 2 Minuten

Dieses Minimal-Setup nutzt die neue Boilerplate im Ordner `democlient/`.

### Schritt 1: Dateien einbinden

In deiner Client-Seite:

- `democlient/index.css` laden
- `democlient/index.js` als `type="module"` laden
- `signer.html` per iframe einbetten (in der Demo ueber `#signer-frame`)

Die Demo trennt bewusst:

- `democlient/nostr.js`: wiederverwendbare NIP-46/Bunkerconnect Logik
- `democlient/index.js`: nur app-spezifische Demo-Funktionen

### Schritt 2: Ein Kommando fuer Einbettung + Auto-Connect

```js
import { createBunkerConnectClient } from "./nostr.js";

const SIGNER_URL = "../signer.html"; // fest im Code
// Optional spaeter per Settings:
// const CUSTOM_BUNKER_URI = "bunker://<pubkey>?relay=...";

const bunkerClient = createBunkerConnectClient({
  signerFrameEl: document.getElementById("signer-frame"),
  signerUrl: SIGNER_URL,
  requestDialogEl: document.getElementById("signer-request-dialog"),
  requestDialogTitleEl: document.getElementById("signer-request-title"),
  requestDialogDetailsEl: document.getElementById("signer-request-details"),
  autoConnect: true
});

await bunkerClient.installSignerAndAutoConnect();
```

Ergebnis:

- Signer wird mit `parentOrigin` sicher eingebettet
- nach Passwort-Eingabe im Signer verbindet der Client automatisch
- URI-Sync (Bridge) passiert automatisch im Setup-Flow
- aktuelle Demo-Variante: Genehmigungen laufen direkt im iframe-Signer (`showUnlockRequestDialog: false`, `showApprovalRequestDialog: false`)
- beim Absenden wird der Setup-Dialog automatisch geoeffnet, damit die Signer-Buttons sichtbar und klickbar sind
- der `Signer`-Button zeigt den Zustand per Statuspunkt: gelb (`verbindet`), gruen (`bereit`), rot (`Fehler`)
- im Setup-Dialog wechselt der Titel auf `NIP-46 Signer` sobald verbunden; rechts oben oeffnet ein Link-Icon den Signer in einem eigenen Browser-Tab
- im eingebetteten `compact-connected` Modus blendet die Demo den inneren Signer-Titel aus, um doppelte Ueberschriften zu vermeiden
- technische `connection-info` ist in der Boilerplate-UI ausgeblendet; stattdessen zeigt `Aktuelle Anfrage` die relevante Genehmigungs-Kurzfassung (Methode + erste ~100 Zeichen Inhalt bei `sign_event`/`nip04|nip44_encrypt`)
- bei aktiver Anfrage reduziert die Demo Dopplungen: die Vorschau-Card zeigt nur die wesentliche Aktion + Content-Kurztext; im iframe werden zusaetzlich `status`, `user-info` und `request-title` ausgeblendet, sodass der Fokus auf den Genehmigungsbuttons liegt

### Schritt 3: Event absenden

```js
const response = await bunkerClient.publishTextNote("Hallo von meinem Client");
console.log(response.signedEvent, response.publishedRelayUrls);
```

Alternativ granular:

1. `await bunkerClient.getPublicKey()`
2. `await bunkerClient.signEvent(unsignedEvent)`
3. `await bunkerClient.publishSignedEvent(signedEvent)`

### Schritt 4: Eigene App-Logik erweitern

Empfehlung:

- `democlient/nostr.js` unveraendert als technische Basis behalten
- eigene Business/UI-Logik in einem separaten Modul nach Vorbild `democlient/index.js` halten
