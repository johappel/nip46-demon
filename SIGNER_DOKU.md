# NIP-46 Signer Doku

Diese Doku beschreibt, wie `signer.html` funktioniert und wie du ihn in einen Nostr Client einbindest.

## 1. Ueberblick

Der Signer in `signer.html` ist ein Browser-basierter NIP-46 Signer mit:

- lokalem Keyring (verschluesselte `nsec`-Keys in `localStorage`)
- UI fuer Entsperren, Key-Verwaltung und Request-Freigaben
- NIP-46 Backend ueber NDK (`NDKNip46Backend`)
- optionaler iframe-Bridge fuer Parent-Clients (z. B. `mpv-nostr-client.html`, `tests/sendevent.html`)

Wichtige Eigenschaften:

- fester Relay-Satz (`RELAYS`)
- per-Methoden-Freigaben mit "einmal" / "immer"
- Auto-Allow fuer nicht-kritische Methoden (`connect`, `ping`, `get_public_key`)
- Blockierung von `switch_relays`

## 2. Architektur

### 2.1 Kernkomponenten

- `NDK` verbindet den Signer mit den konfigurierten Relays.
- `NDKPrivateKeySigner` signiert lokal mit dem entschluesselten `nsec`.
- `NDKNip46Backend` beantwortet eingehende NIP-46 RPC-Requests.
- Browser-Storage speichert Keyring, Freigaben, Unlock-Cache und optionale WP-Bindings.

### 2.2 Lifecycle

1. `startSigner()` startet NDK und verbindet Relays.
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
- Permissions: `nip46_permissions_v1`
- WP-User-Bindings: `nip46_wp_user_bindings_v1`

### 3.3 Migrationen

Beim Start werden alte Formate migriert:

- Klartext `nsec` (`nip46_demo_nsec`) -> verschluesselter Keyring
- altes encrypted single-key Format (`nip46_demo_nsec_enc_v1`) -> Keyring

## 4. Freigaben und Security-Verhalten

### 4.1 Methodenklassen

- Auto-Allow: `connect`, `ping`, `get_public_key`
- Sensitiv: `sign_event`, `nip04_encrypt`, `nip04_decrypt`, `nip44_encrypt`, `nip44_decrypt`
- `switch_relays` wird explizit geblockt

### 4.2 Freigabe-Flow

Wenn eine sensitive Methode ankommt:

1. Pruefen, ob gueltige gespeicherte Permission existiert (`pubkey + method`).
2. Falls nein: Modal mit "Einmal erlauben", "Immer erlauben", "Ablehnen".
3. Bei "Immer erlauben": Permission wird persistent gespeichert (`PERMISSION_FOREVER`).

Die Requests laufen ueber eine Queue, damit mehrere gleichzeitige Anfragen nacheinander angezeigt werden.

### 4.3 Relay-Robustheit

`patchBackendRpcReliability()` patched `sendRequest` / `sendResponse`, damit vor RPC-Operationen mindestens eine Relay-Verbindung steht.

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
- Ungueltige URI: Nur `nostrconnect://` oder `bunker://` akzeptieren.

## 9. Minimaler Integrations-Blueprint

1. Signer iframe mit `parentOrigin` starten.
2. `connection-info` via Bridge anfordern.
3. `bunkerUri` + `relays` extrahieren.
4. `NDKNip46Signer.bunker(ndk, bunkerUri)` verbinden.
5. Requests im Signer bestaetigen.
6. Events ueber NDK signieren und publizieren.

## 10. Relevante Dateien im Repo

- `signer.html` (Signer + Keyring + Bridge + NIP-46 Backend)
- `mpv-nostr-client.html` (NIP-7 + NIP-46 Fallback, produktionsnahe Client-Integration)
- `tests/sendevent.html` (fokussierter Testclient inkl. WP-Bridge-Call)

