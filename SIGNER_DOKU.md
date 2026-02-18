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
- `democlient/nostreclient.js` (High-Level Wrapper mit `nostrclient.init(...)`)
- `democlient/index.js` (minimaler Entry-Point mit einer Init-Config)
- `democlient/forms/schema-loader.js` (laedt und normalisiert JSON-Form-Schemata)
- `democlient/forms/form-generator.js` (rendert Felder + sammelt/validiert Formwerte)
- `democlient/forms/kind-adapters/index.js` (Registry + Dispatch fuer Adapter)
- `democlient/forms/kind-adapters/shared.js` (gemeinsame Hilfsfunktionen)
- `democlient/forms/kind-adapters/generic.js` (Fallback-Adapter)
- `democlient/forms/kind-adapters/kind1.js` (kind:1 Adapter)
- `democlient/forms/kind-adapters/nip23.js` (NIP-23 Adapter)
- `democlient/forms/kind-adapters/nip52.js` (NIP-52 Adapter)
- `democlient/forms/schemas/kind1.json` (lokales Default-Schema)
- `embedclients/flotilla/index.html` (Wizard-UI + Flotilla-iframe + Signer-Dialog)
- `embedclients/flotilla/index.css` (Styles fuer den Flotilla-Embed-Client)
- `embedclients/flotilla/index.js` (Bunker-Link-Flow mit `createBunkerConnectClient`)
- `embedclients/identity-link/index.html` (Identity-Link UI fuer Backend-vs-Signer-Abgleich)
- `embedclients/identity-link/index.css` (Styles fuer den Identity-Link Client)
- `embedclients/identity-link/index.js` (Bridge-Flow, Provider-Adapter, Match/Mismatch, Bind/Rebind)
- `integrations/wordpress/nostr-identity-link/nostr-identity-link.php` (WordPress Plugin mit Session/Bind/Rebind REST-API)

## 11. Manual: Nostr Client mit Bunkerconnect in 2 Minuten

Dieses Minimal-Setup nutzt die neue Boilerplate im Ordner `democlient/`.

### Schritt 1: Dateien einbinden

In deiner Client-Seite:

- `democlient/index.css` laden
- `democlient/index.js` als `type="module"` laden
- `signer.html` per iframe einbetten (in der Demo ueber `#signer-frame`)

Die Demo trennt bewusst:

- `democlient/nostr.js`: wiederverwendbare NIP-46/Bunkerconnect Logik
- `democlient/nostreclient.js`: High-Level Wrapper fuer One-Command-Setup
- `democlient/index.js`: nur Konfiguration + Start

### Schritt 2: Ein Kommando fuer Einbettung + Auto-Connect

```js
import { nostrclient } from "./nostreclient.js";

const config = {
  signer_iframe_uri: "../signer.html",
  signer_iframe_mode: "interactive",
  relays: [],
  allow_nip07: false
};

await nostrclient.init({ config });
```

Optional verfuegbare Methoden nach dem Init:

```js
const pubkey = await nostrclient.getPublicKey();
const signedEvent = await nostrclient.signEvent(unsignedEvent);
const relayUrls = await nostrclient.publishSignedEvent(signedEvent);
const response = await nostrclient.publishTextNote("Hallo von meinem Client");
console.log(pubkey, relayUrls, response);
```

`config` unterstuetzt jeweils `snake_case` und `camelCase`:

```js
{
  signer_iframe_uri: "../signer.html", // oder signerIframeUri
  signer_iframe_mode: "interactive",   // oder signerIframeMode ("fixed"|"interactive")
  form_uri: "./forms/schemas/kind1.json", // oder formUri, optional
  relays: ["wss://relay.damus.io"],    // optional, leer => Demo-Defaults
  allow_nip07: true,                   // oder allowNip07
  custom_bunker_uri: ""                // oder customBunkerUri
}
```

`allow_nip07` steuert nur das Exposing von `window.nostr`. Der interne Demo-Flow (Connect, Sign, Publish via Buttons) funktioniert weiterhin.

Ergebnis:

- Signer wird mit `parentOrigin` sicher eingebettet
- nach Passwort-Eingabe im Signer verbindet der Client automatisch
- URI-Sync (Bridge) passiert automatisch im Setup-Flow
- aktuelle Demo-Variante: Genehmigungen laufen direkt im iframe-Signer (`showUnlockRequestDialog: false`, `showApprovalRequestDialog: false`)
- beim Absenden wird der Setup-Dialog automatisch geoeffnet, damit die Signer-Buttons sichtbar und klickbar sind
- der `Signer`-Button zeigt den Zustand per Statuspunkt: gelb (`verbindet`), gruen (`bereit`), rot (`Fehler`)
- die Demo-UI hat keinen separaten `Public Key laden`-Button mehr; der Key wird intern nur bei Bedarf im Submit-Flow geladen
- im Setup-Dialog wechselt der Titel auf `NIP-46 Signer` sobald verbunden; rechts oben oeffnet ein Link-Icon den Signer in einem eigenen Browser-Tab
- im Setup-Dialog gibt es rechts oben zusaetzlich einen `X`-Button zum manuellen Schliessen des Dialogs
- im eingebetteten `compact-connected` Modus blendet die Demo den inneren Signer-Titel aus, um doppelte Ueberschriften zu vermeiden
- technische `connection-info` ist in der Boilerplate-UI ausgeblendet; stattdessen zeigt `Aktuelle Anfrage` die relevante Genehmigungs-Kurzfassung (Methode + erste ~100 Zeichen Inhalt bei `sign_event`/`nip04|nip44_encrypt`)
- bei aktiver Anfrage reduziert die Demo Dopplungen: die Vorschau-Card zeigt nur die wesentliche Aktion + Content-Kurztext; im iframe werden zusaetzlich `status`, `user-info` und `request-title` ausgeblendet, sodass der Fokus auf den Genehmigungsbuttons liegt

### Schritt 3: Event absenden

```js
const response = await nostrclient.publishTextNote("Hallo von meinem Client");
console.log(response.signedEvent, response.publishedRelayUrls);
```

Alternativ granular:

1. `await nostrclient.getPublicKey()`
2. `await nostrclient.signEvent(unsignedEvent)`
3. `await nostrclient.publishSignedEvent(signedEvent)`

### Schritt 4: Eigene App-Logik erweitern

Empfehlung:

- `democlient/nostreclient.js` als stabilen Wrapper nutzen
- bei tieferer Kontrolle direkt `democlient/nostr.js` nutzen

## 12. API-Doku: `democlient/nostreclient.js`

Diese API ist fuer den Einsatz im Demo-HTML (`democlient/index.html`) gedacht.

Wichtig:

- Die API ist ein ES-Modul-Export, kein globales `window`-Objekt.
- In `index.html` wird sie ueber `democlient/index.js` importiert und gestartet.
- App-Aufrufe immer namespaced: `nostrclient.getPublicKey()` statt globalem `getPublicKey()`.
- Export-Namen: `nostreclient` und Alias `nostrclient` (beide identisch, empfohlen: `nostrclient`).

### 12.1 Import

```js
import { nostrclient } from "./nostreclient.js";
```

Optional (Alias):

```js
import { nostreclient } from "./nostreclient.js";
```

### 12.2 `init(options)`

Startet den kompletten Signer-Flow (iframe laden, Verbindung herstellen, UI-Events verdrahten).

Signatur:

```ts
init(options?: {
  config?: {
    signer_iframe_uri?: string; // Alias: signerIframeUri
    signer_iframe_mode?: "fixed" | "interactive"; // Alias: signerIframeMode
    form_uri?: string;          // Alias: formUri
    relays?: string[];
    allow_nip07?: boolean;      // Alias: allowNip07
    custom_bunker_uri?: string; // Alias: customBunkerUri
  }
}): Promise<void>
```

Config-Felder:

- `signer_iframe_uri`: Pfad zur Signer-Seite. Default: `../signer.html`
- `signer_iframe_mode`: `interactive` fragt beim Start nach einer URL (mit localStorage-Merker), `fixed` nutzt direkt `signer_iframe_uri`
- `form_uri`: URI zu einem JSON-Form-Schema. Leer => kein generiertes Formular (API-only Modus)
- `relays`: optionale Relay-Liste fuer den Client. Leer = interne Defaults
- `allow_nip07`: wenn `true`, kann intern `window.nostr` bereitgestellt werden
- `custom_bunker_uri`: optionaler fixer Fallback auf eine `bunker://...` URI

Verhalten:

- Bei erneutem `init(...)` wird die bestehende Verbindung sauber ersetzt (Re-Init).
- Wenn `form_uri` fehlt, wird kein Formular gerendert; du sendest Events direkt ueber `nostrclient.signEvent(...)` und `nostrclient.publishSignedEvent(...)`.
- Wenn erforderliche Demo-Elemente in der HTML fehlen, wird ein Fehler geworfen.

### 12.3 `getPublicKey()`

Liest den aktiven Public Key ueber die bestehende Verbindung.

```ts
getPublicKey(): Promise<string>
```

### 12.4 `signEvent(unsignedEvent)`

Signiert ein unsigniertes Nostr-Event ueber den verbundenen Signer.

```ts
signEvent(unsignedEvent: object): Promise<object>
```

### 12.5 `publishSignedEvent(signedEvent)`

Publiziert ein bereits signiertes Event an die aktiven Relays.

```ts
publishSignedEvent(signedEvent: object): Promise<string[]>
```

### 12.6 `publishTextNote(content, tags?)`

Komfort-Methode fuer `kind:1`:
Public Key lesen, signieren, publizieren.

```ts
publishTextNote(content: string, tags?: string[][]): Promise<{
  signedEvent: object;
  publishedRelayUrls: string[];
}>
```

### 12.7 `getState()`

Liefert einen Snapshot des aktuellen Wrapper-/Verbindungszustands.

```ts
getState(): {
  initialized: boolean;
  runtimeConfig: object;
  connection: object | null;
  bunker: object | null;
}
```

### 12.8 `destroy()`

Entfernt Listener/Observer und beendet die aktive Wrapper-Instanz.

```ts
destroy(): void
```

### 12.9 Beispiel fuer `index.html`/`index.js`

```js
import { nostrclient } from "./nostreclient.js";

const config = {
  signer_iframe_uri: "../signer.html",
  signer_iframe_mode: "interactive",
  // form_uri optional
  relays: [],
  allow_nip07: false
};

await nostrclient.init({ config });
```

### 12.10 DOM-Binding mit `data-nostr`

Die Demo-UI wird ueber semantische Rollen gebunden:

- zuerst ueber `data-nostr="<rolle>"`
- fallback-kompatibel ueber `id="<rolle>"`

Dadurch ist klar dokumentiert, welches Feld welche API-Funktion verwendet.

Beispiel fuer den Post-Flow:

- `data-nostr="post-form"`: Formular-Submit wird als Publish-Trigger genutzt
- `data-nostr="form-fields"`: Container, in den Felder aus dem geladenen Schema gerendert werden
- `data-nostr="send-btn"`: Submit-Button fuer den Post-Flow
- `data-nostr="content-count"`: Zeichenzaehler

Hinweis: Diese Rollen sind nur fuer den Formularmodus mit gesetztem `form_uri` erforderlich.

Minimalbeispiel:

```html
<form data-nostr="post-form" novalidate>
  <div data-nostr="form-fields"></div>
  <button data-nostr="send-btn" type="submit">Signieren + senden</button>
  <span data-nostr="content-count">0 / 280</span>
</form>
```

Wenn du Felder erweiterst, vergib neue `data-nostr` Rollen und dokumentiere sie hier, damit das Mapping fuer CMS-Integrationen eindeutig bleibt.

## 13. Form-Architektur: NIP, Kind, Schema, Adapter

### 13.1 Unterschied NIP vs Kind

- `NIP` = Spezifikation (Regeln/Verhalten)
- `kind` = numerischer Eventtyp im Event (`event.kind`)

Darum kann ein NIP mehrere Kinds nutzen (z. B. NIP-52 mit mehreren 3192x-Kinds).
Gleiches Prinzip bei NIP-23: `30023` (publish) und `30024` (draft).

### 13.2 Unterschied Schema vs Adapter

- `Schema` beschreibt die UI:
  - Felder, Label, Typen, Required, Defaults, Reihenfolge
- `Adapter` beschreibt das Mapping zur Nostr-Event-Struktur:
  - wie aus Formwerten `kind`, `tags`, `content` entstehen

### 13.3 Aktueller Laufzeit-Flow

1. `nostrclient.init({ config })` laedt `form_uri` (wenn gesetzt)
2. `form-generator.js` rendert Felder in `data-nostr="form-fields"`
3. Beim Submit:
   - Werte sammeln + validieren
   - Adapter erzeugt unsigned Event
   - `nostrclient.signEvent(...)` + `nostrclient.publishSignedEvent(...)`

Wenn `form_uri` nicht gesetzt ist, entfallen Schritt 2/3 und der Client bleibt im API-only Modus fuer eigene Custom-Events.

### 13.4 Schema-Format (JSON)

Minimal:

```json
{
  "version": "nostr-form-v1",
  "id": "kind1-default",
  "kind": 1,
  "adapter": "kind-1",
  "submitLabel": "Signieren + senden",
  "contentField": "content",
  "fields": [
    { "name": "content", "label": "Content", "type": "textarea", "required": true, "maxLength": 280 }
  ]
}
```

Erweiterungen fuer Multi-Kind/NIP-Setups:

- `kindSelectorField`: Feldname, dessen Wert den Kind waehlt
- `kindSelectorMap`: Mapping von Feldwert -> Kindnummer
- `tagMappings`: Mapping von Feld -> Tagname

Damit kann ein einziges Schema auch NIPs mit mehreren Kinds abbilden.

Beispiel-Schemata im Repo:

- `democlient/forms/schemas/kind1.json`
- `democlient/forms/schemas/kind30023.json` (NIP-23 Publish/Draft via `kindSelectorMap`)
- `democlient/forms/schemas/nip52-calendar.json` (Multi-Kind + dedizierter `nip-52` Adapter)

### 13.5 NIP-52 Adapter-Details (31923 Time-Based)

Der dedizierte Adapter `democlient/forms/kind-adapters/nip52.js` erzwingt fuer `kind:31923` folgende Regeln:

- `start` ist Pflicht (Unix-Sekunden-Tag `start`).
- `end` ist optional, muss aber groesser als `start` sein.
- `D`-Tags werden automatisch erzeugt (`floor(unix_seconds / 86400)`), bei Zeitraeumen als mehrere `D`-Tags.
- `start_tzid` und `end_tzid` werden automatisch aus der Browser-Systemzeitzone gesetzt (IANA TZID).
- `content` bleibt vorhanden (Beschreibung), darf aber leer sein.
- `g` (geohash) wird automatisch erzeugt, wenn Koordinaten verfuegbar sind:
  - entweder ueber optionale Felder `lat/lon` (in Custom-Schemata)
  - oder direkt aus `location` im Format `lat,lon` (z. B. `52.5200, 13.4050`)
  - reine Ortsnamen ohne Koordinaten erzeugen ohne Geocoding-Service keinen `g`-Tag
  - falls externes Geocoding aktiviert wird, nur ueber offene APIs (keine proprietaeren Pflichtdienste)

Das Beispiel-Schema `democlient/forms/schemas/nip52-calendar.json` zeigt den vereinfachten Input ohne manuelle TZID-/Geohash-Felder.
Die RSVP-spezifischen Felder (`a`-Referenz, `status`) sind im Default-Schema bewusst ausgeblendet, um die Basis-UI einfach zu halten; fuer RSVP nutze ein erweitertes Custom-Schema.

### 13.6 NIP-23 Optional Tags und Editability

Der Adapter `democlient/forms/kind-adapters/nip23.js` setzt die ueblichen optionalen NIP-23 Tags:

- `title`
- `image`
- `summary`
- `published_at` (stringifizierte Unix-Sekunden, automatisch bei `kind:30023` gesetzt)

Zusaetzlich unterstuetzt das Schema `democlient/forms/schemas/kind30023.json`:

- `topics` -> erzeugt mehrere `t`-Tags (Komma-/Zeilenliste)
- `tagsJson` -> rohe zusaetzliche Tags (z. B. `e`/`a` Referenzen)

Hinweis:

- `published_at` ist kein User-Feld im Formular und wird intern generiert.
- `tagsJson` darf `published_at` nicht ueberschreiben (wird im Adapter gefiltert).

Editability:

- NIP-23 ist addressable.
- Fuer Updates musst du denselben `d`-Identifier mit demselben `pubkey` und demselben `kind` wiederverwenden.
- `30023` (publish) und `30024` (draft) sind unterschiedliche Kinds und damit unterschiedliche adressierbare Streams.

## 14. Embed-Client fuer Flotilla

Der Prototyp unter `embedclients/flotilla/` ist kein klassischer Posting-Client, sondern ein Login-Assistent:

- Rechts wird `https://app.flotilla.social/` in einem iframe geladen.
- Links fuehrt ein Wizard den User durch die Flotilla-Login-Schritte.
- Der Signer wird ueber `createBunkerConnectClient(...)` gestartet.
- Sobald verbunden, wird der `bunker://...` Link angezeigt und kann kopiert werden.
- Im Flotilla-Embed ist der Parent absichtlich im Bridge-only Modus (`autoConnect: false`): der Parent muss nicht selbst per NDK zu Relays verbinden, um den Bunker-Link bereitzustellen.

Seit dem Refactor ist `embedclients/flotilla/index.js` app-agnostisch:

- kein Flotilla-Hardcode mehr in der JS-Logik
- Ziel-App wird ueber HTML-Config gesetzt:
  - `#embed-root[data-app-name]`
  - `#embed-root[data-app-url]`
  - `#embed-root[data-signer-uri]`
- dadurch reicht fuer neue Embeds in der Regel eine Anpassung von `index.html` (Guide-Texte + Data-Attribute)

### 14.1 Ziel-Flow

1. In Flotilla: `Log in`
2. In Flotilla: `Log in with Remote Signer`
3. Im Embed-Client: `Bunker Link kopieren`
4. In Flotilla: Link einfuegen und `Next`

### 14.2 Wichtige Grenzen

- Der Flotilla-iframe ist Cross-Origin. Der Parent kann die Flotilla-UI nicht fernsteuern.
- Deshalb bleibt die Bedienung in Flotilla manuell; der Embed-Client liefert nur Fuehrung + Copy-Flow.
- Falls eine Ziel-App iframe-Einbettung spaeter blockiert, nutze den Button `Flotilla im Tab oeffnen`.
- Wenn der Signer gesperrt ist, oeffnet der Embed-Client den Signer-Dialog automatisch, damit die Passwortabfrage direkt sichtbar ist.
- Nach erfolgreicher Entsperrung (Bunker-Link verfuegbar) schliesst der Signer-Dialog automatisch und der Status springt von `Verbindung wird vorbereitet ...` auf `Bunker Link ist bereit`.

## 15. Identity-Link Client (WordPress/OIDC vorbereiteter Flow)

Unter `embedclients/identity-link/` gibt es einen dritten Client fuer den Abgleich:

- Backend-Identity laden (`provider`, `subject`, `displayName`, `expectedPubkey`)
- Signer-Key ueber Bridge sicherstellen (`wp-ensure-user-key`)
- `expectedPubkey` gegen Signer-`pubkey` vergleichen
- bei fehlender Zuordnung optional auto-bind (`POST /wp-json/identity-link/v1/bind`)
- bei Konflikt (`mismatched`) klare Warn-UI und expliziter Rebind (`POST /wp-json/identity-link/v1/rebind`)

### 15.1 Runtime-Konfiguration (HTML Data-Attribute)

Am Root-Element `#identity-link-root`:

- `data-provider` (z. B. `wordpress`, `keycloak`, `moodle`, `drupal`)
- `data-signer-uri` (standardmaessig `../../signer.html`)
- `data-identity-endpoint` (GET Session-Identity, Standard: `/wp-json/identity-link/v1/session`)
- `data-bind-endpoint` (POST Erstzuordnung, Standard: `/wp-json/identity-link/v1/bind`)
- `data-rebind-endpoint` (POST Konfliktaufloesung, Standard: `/wp-json/identity-link/v1/rebind`)
- `data-wp-rest-nonce` (optionaler WP-REST-Nonce fuer write-Calls)
- `data-auto-bind-on-unbound` (`true`/`false`)

### 15.2 Adapter-Architektur

Der Client trennt Core-Flow und Provider-Details:

- Core: Signer-Bridge, State-Machine (`unbound|matched|mismatched`), Mismatch-UI, Bind/Rebind Requests.
- Adapter: Subject-Normalisierung und Mapping auf Bridge-`userId`.

Aktuell enthalten:

- `wordpress` Adapter: nutzt `subject` direkt als Bridge-`userId`.
- OIDC-basierte Adapter (`keycloak`, `moodle`, `drupal`): namespacen `userId` als `<provider>:<subject>`.

Hinweis:

- Die Bridge-Methode heisst aktuell technisch `wp-ensure-user-key`, wird hier aber bereits provider-agnostisch genutzt.
- Fuer produktive Multi-Provider-Setups ist mittelfristig eine neutral benannte Bridge-API empfehlenswert.

### 15.3 WordPress Plugin-Skelett (MVP)

Pfad im Repo:

- `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`
- `integrations/wordpress/nostr-identity-link/public/` (ausgelieferte Web-Assets fuer Signer/Client)

REST-Endpunkte des Plugins:

- `GET /wp-json/identity-link/v1/session`
- `POST /wp-json/identity-link/v1/bind`
- `POST /wp-json/identity-link/v1/rebind`
- `GET /wp-json/identity-link/v1/backup`
- `POST /wp-json/identity-link/v1/backup`

Rewrite-Routen (ueber WordPress):

- `/nostr/` -> Redirect auf `/nostr/identity-link/`
- `/nostr/identity-link/` -> Identity-Link-Client aus dem Plugin
- `/nostr/signer/` -> NIP-46 Signer aus dem Plugin
- `/nostr/nostrclient/*` und `/nostr/vendor/*` -> benoetigte Modul-Abhaengigkeiten

Shortcode:

- `[nip46_identity_link_client]`
- optional mit Attributen:
  - `client_url` (URL zur Identity-Link-Client-Seite)
  - `show_iframe="1|0"`
  - `iframe_height="960"`
  - `iframe_title="..."`

Ohne Attribute nutzt der Shortcode standardmaessig `home_url('/nostr/identity-link/')`.

Sicherheitsprofil:

- `session`: Login erforderlich
- `bind`/`rebind`: Login + gueltiger `X-WP-Nonce` (oder `_wpnonce`)
- `backup` (GET/POST): Login + gueltiger `X-WP-Nonce` (liefert/speichert verschluesselten Exportblob pro User)
- `/nostr/signer/`: oeffentlich erreichbar (kein WordPress-Login erforderlich), damit der Signer als allgemeiner NIP-46 Bunker fuer andere Anwendungen nutzbar bleibt.
- Bei `session` versucht das Plugin den User-Kontext bei Bedarf aus dem `logged_in`-Cookie wiederherzustellen (gegen REST-401 trotz aktivem Frontend-Login).

Datenhaltung (MVP):

- `user_meta` pro User (`pubkey`, `npub`, `keyId`, `updatedAt`)
- begrenzter Audit-Log in Option-Storage (`actor`, `target`, `oldPubkey`, `newPubkey`, `timestamp`, IP, User-Agent)

Hinweis zur Frontend-Integration:

- Der Client uebernimmt den Nonce aus `data-wp-rest-nonce`, `<meta name=\"wp-rest-nonce\">` oder `meta.restNonce` aus der Session-Antwort.
- Der Shortcode injiziert den Nonce automatisch als `<meta name=\"wp-rest-nonce\">` per Inline-Script in die Seite.
- Wenn `client_url` gesetzt ist, wird der Nonce zusaetzlich als Query-Parameter `wpRestNonce` an die Client-URL angehaengt.
- Die Plugin-PHP-Datei muss ohne UTF-8 BOM gespeichert sein, sonst koennen bei Aktivierung `headers already sent`/unerwartete 3-Byte-Ausgaben auftreten.
- Nach Plugin-Aktivierung oder Update der Rewrite-Regeln einmal Permalinks speichern (oder `flush_rewrite_rules()` durch Reaktivierung ausloesen), damit `/nostr/...` sofort erreichbar ist.
- Das Plugin unterbindet Canonical-Redirects auf `/nostr/...`, damit Modul-URLs nicht auf `*.js/` umgebogen werden (sonst falscher MIME-Typ `text/html` moeglich).
- Die HTTP-Sicherheitspruefung im Client behandelt lokale Dev-Hosts als Ausnahme (`localhost`, `127.0.0.1`, `::1`, `*.localhost`, `*.test`), damit lokale Testdomains wie `forums.test` nicht blockiert werden.
- Die gleiche Dev-Ausnahme gilt fuer den Signer-Start (`signer-nip46.js`), damit `/nostr/signer/` im lokalen HTTP-Testbetrieb funktioniert.
- Im Plugin-Bundle ist der Signer-Script-Import versioniert (`signer-nip46.js?v=...`) und die Service-Worker-Cache-Version erhoeht, damit Sicherheitsfixes nicht an alten Browser-Caches haengen bleiben.
- Wenn trotz Dev-Ausnahme `WebCrypto (crypto.subtle)` fehlt, ist das eine Browser-Grenze fuer unsichere Kontexte (typisch `http://*.test` in Firefox). Dann sind nur HTTPS/localhost oder ein browser-spezifischer Dev-Flag (Chromium) moeglich.
- `wp-ensure-user-key` laeuft im Signer jetzt ohne blockierenden Passwort-Prompt: wenn kein nutzbares Session-Entsperrmaterial vorhanden ist, kommt sofort ein klarer `gesperrt/entsperren`-Fehler statt stillem Bridge-Timeout.
- Fuer vorhandenes Session-Entsperrmaterial nutzt der Signer den WP-Bridge-Flow ohne Passwortabfrage (inkl. Key-Erzeugung mit Session-Material), damit eingebettete iframes nicht an unsichtbaren Dialogen haengen.
- Der Identity-Link-Client oeffnet den Signer-Dialog bei `wp-ensure-user-key`-Timeout automatisch und nutzt ein laengeres Timeout (30s), damit der Unlock-Flow im lokalen Testbetrieb stabiler ist.
- Das WordPress-Plugin erzwingt fuer Verzeichnisrouten kanonische Trailing-Slashes (`/nostr/signer/`, `/nostr/identity-link/`), damit relative Asset-URLs (`./signer-ui.css`, `./icons/...`) korrekt aufloesen.
- Fuer Alt-Caches/Broken-URLs gibt es Fallback-Aliase von `/nostr/signer-ui.css`, `/nostr/signer-nip46.js`, `/nostr/icons/*` auf die korrekten `signer/*`-Pfade.
- Bei Lock-Fehlern im eingebetteten Betrieb schaltet der Signer jetzt automatisch aus `compact-connected` in den `management`-Tab, damit Entsperren direkt im iframe moeglich ist.
- Der Identity-Link-Client sendet beim Oeffnen des Signer-Dialogs explizit `show-management` an die Bridge, damit die Entsperr-Ansicht ohne manuellen Tab-Wechsel sichtbar wird.
- `wp-ensure-user-key` behandelt den Fall "gebundener Key ist bereits aktiv" jetzt ohne zusaetzliche Entschluesselung und liefert `pubkey/npub` direkt aus dem aktiven Signer-User.
- Die Statusanzeige im Plugin-Signer wurde auf klares `bereit` vereinheitlicht (kein Emoji/Fallback-`??` mehr).
- Wenn fuer `wp-ensure-user-key` kein Session-Passwort verfuegbar ist, startet der Signer jetzt die Passwort-Bestaetigung aktiv (statt sofort abzubrechen); der Identity-Link-Client wartet dafuer laenger (120s).
- Der Identity-Link-Client wartet vor `wp-ensure-user-key` explizit auf `connection-info` der Bridge (Race-Condition-Fix zwischen iframe-Init und erster Ensure-Anfrage).
- Nach erfolgreicher Entsperrung im eingebetteten Signer kann der Identity-Link-Client automatisch einen erneuten Sync anstossen, damit ein frueher Lock-Fehlerzustand sofort aufgeloest wird.
- Compare-First-Flow: Wenn das Backend bereits einen `expectedPubkey` hat, vergleicht der Identity-Link-Client standardmaessig nur den aktiven Signer-Pubkey aus `connection-info` (ohne `wp-ensure-user-key` und ohne Passwortabfrage).
- `wp-ensure-user-key` wird damit primaer fuer den ungebundenen Erstzuordnungsfall verwendet.
- Fuer Reload-UX oeffnet der Identity-Link-Client den Signer-Dialog bereits beim ersten Bridge-Ready-Fehler, damit eine ggf. noetige Entsperrung direkt sichtbar ist.
- Default fuer `Entsperrt bleiben` im Signer-Unlock wurde auf `session` gesetzt, um Passwortabfragen bei einfachem Reload zu reduzieren (Sicherheit/Komfort-Tradeoff).
- Der Signer stellt fuer Embed-Clients zusaetzlich `get-public-connection-info` bereit: oeffentliche Key-Infos (`pubkey`, `npub`, `keyName`) koennen dadurch auch im Lock-Zustand aus Cache gelesen werden.
- Der Identity-Link-Client nutzt fuer den Standardfall jetzt diesen Read-Only-Bridge-Pfad und vergleicht primär nur `expectedPubkey` gegen `signerPubkey`.
- `wp-ensure-user-key` wird im Alltag damit nur noch fuer den ungebundenen Erstzuordnungsfall benoetigt.
- Die Host-Statusanzeige ist fuer den Compare-Only-Fall jetzt explizit: `Signer-Bridge bereit. Pubkey kann verglichen werden.` (statt unklarem `Verbindung wird vorbereitet ...`).
- Bei Bundle-Kopien in das WordPress-Plugin muessen relative Modulpfade plugin-spezifisch bleiben (`signer/signer-nip46.js` -> `../vendor/...`, `identity-link/index.js` -> `../nostrclient/nostr.js`), sonst laedt der Browser HTML statt Modul-JS.
- Im Signer-Tab `Verwaltung` gibt es zusaetzlich zwei WP-Backup-Aktionen:
  - `Export in WordPress speichern` (speichert den verschluesselten Export im User-Profil)
  - `Aus WordPress wiederherstellen` (laedt diesen Export und importiert ihn lokal im aktuellen Browser)
- Der Signer-Service-Worker umgeht `GET /wp-json/...` bewusst (kein Cache), damit REST-Daten wie Backup-Status nicht stale aus dem Offline-Cache kommen.
- Für die schrittweise Architektur-Migration gibt es eine getrennte Strangler-Zone unter `nostrclient/`:
  - `nostrclient/shared/adapter-contracts` (Ports/Contracts)
  - `nostrclient/shared/identity-link-core` und `nostrclient/shared/signer-core` (provider-neutrale Core-Logik)
  - `nostrclient/integrations/wordpress/adapter` (WordPress-Strategien)
  - `nostrclient/apps/identity-link` (neuer Kompositions-Einstieg)
- Der produktive Signer-/Client-Pfad bleibt bis zur Feature-Flag-Umschaltung unverändert.
- Der Identity-Link-Client unterstützt dafür jetzt Runtime-Flags:
  - `data-use-new-core="true|false"` aktiviert/deaktiviert den nostrclient-Pfad.
  - `data-new-core-module-uri="..."` setzt die Modul-URL zum nostrclient-Entry-Point.
  - Bei nostrclient-Import-/Laufzeitfehlern fällt der Client automatisch auf den Legacy-Sync zurück.
- Deployment ist als Build-Artefakt vorgesehen (kein manuelles Copy/Paste):
  - `npm run build` / `pnpm run build`
    - `dist/nostrclient/nostrclient/`
    - `dist/nostrclient/nostrclient/index.html` (Bundle-Einstieg)
    - `dist/nostrclient/nostrclient.zip`
  - `npm run build:democlient` / `pnpm run build:democlient`
    - `dist/democlient/democlient/`
    - `dist/democlient/vendor/ndk-3.0.0.js`
    - `dist/democlient/democlient.zip`
  - `npm run build:embedclients` / `pnpm run build:embedclients`
    - `dist/embedclients/embedclients/`
    - `dist/embedclients/embedclients.zip`
  - `npm run build:signer` / `pnpm run build:signer`
    - `dist/signer/signer-standalone/`
    - `dist/signer/signer-standalone.zip`
  - `npm run build:identity-link:wordpress`
  - oder `pnpm run build:identity-link:wordpress`
  - erzeugt:
    - `dist/wordpress/nostr-identity-link/` (installierbares Plugin-Verzeichnis)
    - `dist/wordpress/nostr-identity-link-<version>.zip` (WP-Upload)
  - Dist-`identity-link/index.html` wird dabei auf nostrclient-Core gesetzt:
    - `data-use-new-core="true"`
    - `data-new-core-module-uri="../nostrclient/apps/identity-link/index.js?v=<buildToken>"`
- Das Plugin erlaubt für diese nostrclient-Module den Public-Prefix `nostrclient/` unter `/nostr/nostrclient/...`.

Beispiel:

```txt
[nip46_identity_link_client client_url="https://example.com/nostr/embedclients/identity-link/index.html" iframe_height="1100"]
```

