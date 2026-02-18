# RECODING Fortschritt (Signer)

Stand: 2026-02-16

## Ziel

Refactoring von `signer.html` in wartbare Module plus neue Aufmerksamkeits-Features bei sensiblen NIP-46 Requests.

## Task-Status

- [x] 1. Refactor-Plan finalisieren.
- [x] 2. Dateistruktur angelegt: `signer-ui.js`, `signer-nip46.js`, `signer-ui.css`.
- [x] 3. CSS aus `signer.html` ausgelagert nach `signer-ui.css`.
- [~] 4. UI-Logik ausgelagert: Initial umgesetzt fuer Attention/Notification-UI in `signer-ui.js`; weitere UI-Helfer koennen in einem zweiten Schritt folgen.
- [x] 5. NIP-46/Core-Logik aus `signer.html` in `signer-nip46.js` verschoben.
- [x] 6. Modulgrenzen definiert: `signer-nip46.js` (Core) + `signer-ui.js` (Attention/UI-Features).
- [x] 7. Bootstrapping vereinfacht: `signer.html` bindet nur noch CSS + externes Modulscript ein.
- [x] 8. Windows-Benachrichtigung (Notification API) integriert.
- [x] 9. Blinkender `document.title` integriert (Reset bei Fokus/Erledigung).
- [x] 10. Optionaler kurzer Sound bei neuer Sign-Anfrage integriert.
- [x] 11. User-Settings hinzugefuegt (Checkboxen + Persistenz in `localStorage`).
- [x] 12. Request-Hooks vereinheitlicht: Alert-Trigger zentral in Permission-Queue.
- [x] 13. Cleanup/Checks: JS-Syntax-Check mit `node --check` fuer neue Module.
- [x] 14. Dokumentation aktualisiert (`README.md`, `SIGNER_DOKU.md`).
- [x] 15. Archiv-Datei-Entscheidung: `tests/signer-archived.html` bleibt als Legacy-Referenz bestehen.
- [x] 16. Test-Benachrichtigung fuer PWA/Desktop-Debugging hinzugefuegt.
- [x] 17. Relay-Tab mit lokaler Relay-Konfiguration (Speichern/Reset) hinzugefuegt.
- [x] 18. Datenschutz-Tab mit klarer Datenfluss-Erklaerung hinzugefuegt.

## Umgesetzte Aenderungen

1. `signer.html`
- Inline-`<style>` entfernt, durch `<link rel="stylesheet" href="./signer-ui.css">` ersetzt.
- Inline-`<script type="module">` entfernt, durch `<script type="module" src="./signer-nip46.js">` ersetzt.
- Neuer Tab `Datenschutz` mit einfacher Erklaerung zu lokaler Speicherung, Datenweitergabe an Relays, Nicht-Tracking und Nutzer-Risiken.
- Neuer Einstellungsbereich im Passwort-Tab:
  - `attention-notification-toggle`
  - `attention-title-toggle`
  - `attention-sound-toggle`
  - `attention-request-permission-btn`
  - `attention-test-notification-btn`
  - `attention-notification-state`

2. `signer-ui.css`
- Vollstaendige Auslagerung des bisherigen Signer-CSS.
- Neue Styles fuer Attention-Settings (`.attention-toggle`, `.attention-hint`).

3. `signer-ui.js`
- Neues UI-Modul fuer Attention-Features.
- Enthalten:
  - Settings laden/speichern (`nip46_attention_settings_v1`)
  - Notification-Permission-Handling
  - Notification senden bei neuen Requests
  - Test-Flow fuer Notification/Blink via UI-Button
  - Titel-Blink starten/stoppen
  - Signalton ueber Web Audio API

4. `signer-nip46.js`
- Vollstaendige Auslagerung der bisherigen Signer-Logik aus HTML.
- Import von `createSignerAttentionManager` und Integration in den Permission-Flow.
- User-konfigurierbare Relay-Liste:
  - Storage-Key `nip46_custom_relays_v1`
  - Defaults + Validierung (`ws://`/`wss://`) + Deduplizierung
  - Verwendung fuer NDK-Connect, Backend und Bunker/Nostrconnect URI
- Hook-Punkte:
  - `notifyPermissionRequest(request)` beim Start einer sensiblen Freigabe
  - `resolvePermissionRequest()` beim Schliessen des Modals
  - `clearAttention()` beim Full-Reset
  - `initSettingsUi()` beim App-Init

5. Dokumentation
- `README.md`: neue Modulstruktur + Request-Alerts ergaenzt.
- `SIGNER_DOKU.md`: Dateiaufteilung + Attention-Features dokumentiert.

## Offene Follow-ups (optional, naechster Refactor-Schritt)

- Restliche generische UI-Helfer (Tabs/Modal/Render-Funktionen) weiter von `signer-nip46.js` nach `signer-ui.js` verschieben.
- Optional dedizierten `signer-core.js` fuer reine Kryptografie/Storage-Helfer extrahieren.

## Fortschritt 2026-02-16 (Demo-Client Boilerplate)

- [x] Neuer Boilerplate-Ordner `democlient/` angelegt.
- [x] `democlient/index.html` erstellt (modulare Demo-UI inkl. Signer-Dialog).
- [x] `democlient/index.css` erstellt (ausgelagerte Styles, responsive).
- [x] `democlient/nostr.js` erstellt als gekapselte Lib:
  - Bridge/Origin-Checks
  - URI/Relay-Normalisierung
  - Auto-Connect nach Signer-Entsperrung
  - Dialog-Mirroring fuer Passwort-/Genehmigungsanfragen
  - API fuer `connect`, `getPublicKey`, `signEvent`, `publishSignedEvent`, `publishTextNote`
- [x] `democlient/index.js` erstellt fuer nicht-generische Client-Logik:
  - Formularvalidierung
  - Absende-Workflow
  - Ergebnisdarstellung
- [x] Manual in `SIGNER_DOKU.md` erweitert: "Nostr Client mit Bunkerconnect in 2 Minuten".
- [x] Syntax-Checks erfolgreich: `node --check democlient/nostr.js` und `node --check democlient/index.js`.

## Fortschritt 2026-02-16 (Unlock-Feedback nsec)

- [x] `signer.html`: Inline-Feld `unlock-nsec-feedback` im Setup/Unlock-Panel hinzugefuegt.
- [x] `signer-nip46.js`: Unlock-Dialog-Validierung erweitert:
  - Bei `askNsec=true` wird leeres `nsec` auf Submit direkt mit Feldfeedback geblockt.
  - Ungueltiges `nsec` zeigt sofort ein klares Feldfeedback (`nsec1...` erwartet).
  - Feedback wird beim Tippen aktualisiert und bei Cleanup sauber zurueckgesetzt.
- [x] `SIGNER_DOKU.md`: Fehlerbild/Verhalten fuer Ersteinrichtung ohne `nsec` dokumentiert.

## Fortschritt 2026-02-16 (Demo-Client Zero-Config Flow)

- [x] `democlient/index.html`: manuelle Felder/Buttons fuer Signer-URL, URI-Sync und Connect entfernt.
- [x] `democlient/index.js`: Workflow auf vollautomatischen Start umgestellt (`installSignerAndAutoConnect()` in `bootstrap`).
- [x] Signer-Link im Demo-Flow fest verdrahtet (`SIGNER_URL` Konstantenansatz), nicht mehr direkt in UI editierbar.
- [x] Nur per Kommentar angedeutet: optionale spaetere Settings fuer eigene Signer-URL bzw. eigene `bunker://` URI.
- [x] `SIGNER_DOKU.md` Manual-Snippet auf den Zero-Config-Flow aktualisiert.

## Fortschritt 2026-02-16 (Setup-Dialog + Approval-Dialog)

- [x] `democlient/index.html`: Signer-Flow in einen separaten Setup-Dialog ausgelagert (`signer-setup-dialog`).
- [x] Setup-Dialog schliesst automatisch, sobald die Verbindung steht (via `onConnectionChanged` in `democlient/index.js`).
- [x] `democlient/index.html` + `democlient/index.css`: kleiner separater Genehmigungs-Dialog fuer Requests gestaltet.
- [x] `democlient/nostr.js`: neue Optionen `showUnlockRequestDialog` und `showApprovalRequestDialog` implementiert.
- [x] Demo-Konfiguration gesetzt: Unlock-Hinweise im grossen Setup-Dialog, Genehmigungen im kleinen Dialog.

## Fortschritt 2026-02-16 (Signer-Statusindikator + Dialog-Farben)

- [x] `democlient/index.html` + `democlient/index.css`: Status-Icon am `Signer`-Button umgesetzt (gelb verbindet, gruen bereit, rot Fehler).
- [x] `democlient/index.js`: Status-Mapping ueber `onStatus`/Connection-State verdrahtet.
- [x] `democlient/index.css`: Setup-Dialog-Overlay visuell angepasst (hellerer Backdrop mit leichtem Blur).
- [x] `democlient/index.css`: `connection-info` Darstellung im Setup-Dialog farblich korrigiert (lesbarer Kontrast + Monospace).

## Fortschritt 2026-02-16 (Dialog-Titel + externer Link)

- [x] `democlient/index.html`: Setup-Dialog-Header mit dynamischem Titel + Link-Icon-Button hinzugefuegt.
- [x] `democlient/index.js`: Titelwechsel `Signer Setup` -> `NIP-46 Signer` nach Verbindungsstatus umgesetzt.
- [x] `democlient/index.js`: Link-Icon oeffnet `signer.html` in neuem Browser-Tab.
- [x] `democlient/index.js`: im eingebetteten `compact-connected` Modus wird der innere Signer-Titel per Demo-Style ausgeblendet (keine doppelte Ueberschrift).

## Fortschritt 2026-02-16 (Parent-Genehmigungsbuttons)

- [x] `democlient/index.html`: Request-Dialog um direkte Buttons `Einmal erlauben`, `Immer erlauben`, `Ablehnen` erweitert.
- [x] `democlient/index.js`: Parent-Buttons mit den echten Signer-Buttons im iframe verdrahtet (`allow-once-btn`, `allow-always-btn`, `reject-btn`).
- [x] `democlient/index.css`: Actions-Layout fuer den kompakten Genehmigungsdialog umgesetzt (inkl. mobiler Darstellung).

## Fortschritt 2026-02-16 (Praeziser Genehmigungstext)

- [x] `democlient/nostr.js`: Anfrage-Text im Parent-Dialog auf methodenspezifische Kurztexte reduziert.
- [x] `democlient/nostr.js`: bei `sign_event` und `nip04/nip44 encrypt` wird eine Vorschau der ersten 100 Zeichen angezeigt.
- [x] `democlient/nostr.js`: bei `nip04/nip44 decrypt` nur konkrete Entschluesselungsanfrage ohne unnoetige Parameterdetails.
- [x] `democlient/nostr.js`: robustere Methodenerkennung (auch bei schlecht formatiertem `request-details` Text).
- [x] `democlient/nostr.js`: kein zusaetzlicher generischer Fallback-Dialog mehr waehrend `pendingUserApproval`, wenn kein Kontext vorliegt.
- [x] `democlient/nostr.js`: Approval-Dialog durch Grace-Zeit stabilisiert, damit er nicht bei kurzen DOM-Wechseln sofort verschwindet.

## Fortschritt 2026-02-16 (Approval-Button-Fix im Parent-Dialog)

- [x] `democlient/index.js`: iframe-Button-Erkennung ohne `instanceof` (cross-frame kompatibel) umgesetzt.
- [x] `democlient/index.js`: Retry/Polling beim Klicken der Signer-Approval-Buttons hinzugefuegt.
- [x] `democlient/index.js`: Action-Buttons waehrend Pending-Klick kurz deaktiviert, um Doppelklick/Fehlzustand zu vermeiden.

## Fortschritt 2026-02-16 (Rollback auf iframe-Genehmigung)

- [x] `democlient/index.js`: Parent-Approvaldialog deaktiviert (`showApprovalRequestDialog: false`), Genehmigungen wieder direkt im iframe-Signer.
- [x] `democlient/index.js`: Beim Post-Submit wird der Setup-Dialog automatisch geoeffnet und nach Abschluss wieder geschlossen.
- [x] `democlient/index.js`: iframe-Auth-Modal in `compact-connected` per Demo-CSS auf reduzierte Ansicht (`Signieren und senden?` + Buttons) getrimmt.

## Fortschritt 2026-02-16 (Result-UX aufgeraeumt)

- [x] `democlient/index.js`: Setup-Hinweistext aus dem `result`-Bereich entfernt, damit dort nur Event-Output/Fehler angezeigt werden.

## Fortschritt 2026-02-17 (Approval-Kurzfassung im Setup-Dialog)

- [x] `democlient/index.html`: neue Card `Aktuelle Anfrage` im Setup-Dialog hinzugefuegt.
- [x] `democlient/index.html`: technische `connection-info` im Boilerplate-Dialog standardmaessig ausgeblendet.
- [x] `democlient/index.js`: Live-Sync aus Signer-iframe eingebaut (auth-modal/request-title/request-details).
- [x] `democlient/index.js`: kompakte Genehmigungsdarstellung implementiert (Methode + Content-Vorschau bis 100 Zeichen fuer `sign_event` und `nip04|nip44_encrypt`).
- [x] `democlient/index.css`: Styles fuer die neue Anfragevorschau ergaenzt.
- [x] `SIGNER_DOKU.md`: Manual um den neuen Boilerplate-Dialogflow erweitert.

## Fortschritt 2026-02-17 (Dopplungen im Setup-Dialog reduziert)

- [x] `democlient/index.js`: Setup-Statuszeile wird im verbundenen Zustand ausgeblendet, damit kein doppelter "bereit"-Hinweis erscheint.
- [x] `democlient/index.js`: Anfrage-Kurzfassung ohne redundantes Prefix (`Anfrage:`) umgestellt.
- [x] `democlient/index.js`: Vorschau-Card nur bei aktiver Genehmigungsanfrage sichtbar (sonst ausgeblendet).
- [x] `democlient/index.js`: iframe-Embed-Styles reduziert (`#status`, `#user-info`, `#request-title` ausgeblendet) fuer klaren Fokus auf Buttons.
- [x] `democlient/index.html`: Vorschau-Card initial versteckt (`hidden`) gegen Lade-Flackern.

## Fortschritt 2026-02-17 (Lint-Warnung theme-color entfernt)

- [x] `signer.html`: `meta[name="theme-color"]` entfernt, um Browser-Kompatibilitaetswarnung in Firefox/Opera-Targets zu vermeiden.

## Fortschritt 2026-02-17 (Dialog-Verhalten bei leerer Anfrage differenziert)

- [x] `democlient/index.js`: iframe bekommt bei aktiver Anfrage die Klasse `demo-has-request`.
- [x] `democlient/index.js`: Ausblendungen fuer `#status`, `#user-info` und `#request-title` greifen nur noch waehrend aktiver Anfrage.
- [x] Ergebnis: Klick auf `Signer: bereit` zeigt im Leerlauf wieder sinnvolle Signer-Infos statt scheinbar leerem Dialog.

## Fortschritt 2026-02-17 (Setup-Dialog Close-Button)

- [x] `democlient/index.html`: Header-Actions um `close-signer-dialog-btn` (`X`) neben `open-signer-external-btn` erweitert.
- [x] `democlient/index.css`: gemeinsame Icon-Button-Styles auf Link- und Close-Button angewendet.
- [x] `democlient/index.js`: Click-Handler `onCloseSignerDialogClicked()` hinzugefuegt und im Bootstrap verdrahtet.

## Fortschritt 2026-02-17 (Setup-Dialog Spacing-Fix)

- [x] `democlient/index.css`: im `compact-connected` Zustand unteren Abstand des `setup-dialog-head` auf `1rem` gesetzt, damit oberer Dialograndabstand und Abstand zum iframe optisch gleich wirken.

## Fortschritt 2026-02-17 (One-Command Client Init API)

- [x] Neues Modul `democlient/nostreclient.js` hinzugefuegt mit Public API `nostreclient.init({ config })`.
- [x] Konfigurations-Schema eingefuehrt (snake_case + camelCase): `signer_iframe_uri`, `relays`, `allow_nip07`, `custom_bunker_uri`.
- [x] `democlient/index.js` auf minimalen Entry-Point reduziert (nur Config + `nostreclient.init(...)`).
- [x] Wrapper-Methoden ergaenzt: `getPublicKey`, `signEvent`, `publishSignedEvent`, `publishTextNote`, `getState`, `destroy`.
- [x] `SIGNER_DOKU.md` auf den neuen Integrationsweg aktualisiert.

## Fortschritt 2026-02-17 (API-Doku nostrclient/nostreclient)

- [x] `SIGNER_DOKU.md`: neue API-Referenz fuer `democlient/nostreclient.js` ergaenzt (Import, Config, Methoden, Rueckgaben, Verhalten).
- [x] `democlient/nostreclient.js`: Alias-Export `nostrclient` hinzugefuegt (identisch zu `nostreclient`) fuer klarere Benennung im Client-Code.

## Fortschritt 2026-02-17 (DOM-Rollen mit data-nostr)

- [x] `democlient/nostreclient.js`: DOM-Resolution auf semantische Rollen erweitert (`data-nostr="<rolle>"` mit `id`-Fallback).
- [x] `democlient/index.html`: zentrale Elemente mit `data-nostr` versehen (u. a. `post-form`, `post-content`, `send-btn`, Dialog-Elemente).
- [x] `SIGNER_DOKU.md`: API-Doku praezisiert (`nostrclient.<methode>()` statt globalen Einzel-Funktionen).
- [x] `SIGNER_DOKU.md`: DOM-Binding fuer CMS-Integrationen dokumentiert (inkl. Post-Flow-Mapping).

## Fortschritt 2026-02-17 (Forms Modulbau + Schema/Adapter-Architektur)

- [x] Neuer Ordner `democlient/forms/` angelegt.
- [x] `democlient/forms/schema-loader.js` implementiert (Schema-Laden + Normalisierung + Fallback auf lokales Default-Schema).
- [x] `democlient/forms/form-generator.js` implementiert (Felder rendern, Werte sammeln, Validierung, Live-Zeichenzaehler).
- [x] `democlient/forms/kind-adapters/index.js` implementiert (Adapter-Registry + `kind-1`, `kind-30023`, `generic-kind`).
- [x] `democlient/forms/schemas/kind1.json` als lokales Default-Schema angelegt.
- [x] Beispiel-Schemata angelegt: `kind30023.json` und `nip52-calendar.json` (Kind-Selector 31922-31925).
- [x] `kind30023.json` auf NIP-23 Publish/Draft erweitert (`30023` vs `30024` per `kindSelectorField` + `kindSelectorMap`).
- [x] `kind-30023` Adapter aktualisiert: nutzt jetzt selektierten Kind statt festem `30023`.
- [x] Dedizierten `nip-52` Adapter implementiert (`democlient/forms/kind-adapters/index.js`).
- [x] `nip52-calendar.json` von `generic-kind` auf `adapter: \"nip-52\"` umgestellt und um RSVP-relevante Felder erweitert.
- [x] Adapter-Refactor: `kind-adapters/index.js` auf Registry/Dispatch reduziert.
- [x] Adapter in eigene Dateien ausgelagert: `generic.js`, `kind1.js`, `nip23.js`, `nip52.js`, `shared.js`.
- [x] `democlient/nostreclient.js` auf dynamischen Submit-Flow umgestellt (`collect -> validate -> adapter -> sign -> publish`).
- [x] `democlient/index.html` um `data-nostr=\"form-fields\"` als Render-Container erweitert.
- [x] `democlient/index.js` um `config.form_uri` erweitert.
- [x] `SIGNER_DOKU.md` um Architektur-Abschnitt (NIP vs Kind, Schema vs Adapter, Schema-Format) erweitert.

## Fortschritt 2026-02-17 (NIP-52 31923 Spezifikation geschaerft)

- [x] `democlient/forms/kind-adapters/nip52.js`: `kind:31923` validiert (`start` Pflicht, `end > start`).
- [x] `democlient/forms/kind-adapters/nip52.js`: automatische `D`-Tag-Generierung (Tag-granular ueber Event-Zeitraum).
- [x] `democlient/forms/kind-adapters/nip52.js`: Unterstuetzung fuer `start_tzid`/`end_tzid`, `summary`, `g` (geohash).
- [x] `democlient/forms/schemas/nip52-calendar.json`: Felder fuer TZID/Summary/Geohash ergaenzt und Default auf `timeBased` gesetzt.
- [x] `SIGNER_DOKU.md`: Adapter-Regeln fuer NIP-52 `31923` dokumentiert.

## Fortschritt 2026-02-17 (NIP-23 Tags + Editability)

- [x] `democlient/forms/kind-adapters/nip23.js`: `published_at` robuster gemacht (Unix-Sekunden oder Datumswert).
- [x] `democlient/forms/kind-adapters/nip23.js`: `topics` -> wiederholte `t`-Tags umgesetzt.
- [x] `democlient/forms/kind-adapters/nip23.js`: `tagsJson` als Durchreiche fuer zusaetzliche Tags (`e`/`a` etc.) eingebaut.
- [x] `democlient/forms/schemas/kind30023.json`: Felder fuer `published_at`, `topics`, `tagsJson` ergaenzt.
- [x] `SIGNER_DOKU.md`: NIP-23 Abschnitt zu optionalen Tags und Editability hinzugefuegt.

## Fortschritt 2026-02-17 (NIP-23 published_at automatisiert)

- [x] `democlient/forms/kind-adapters/nip23.js`: `published_at` wird bei `kind:30023` automatisch zur Laufzeit gesetzt.
- [x] `democlient/forms/schemas/kind30023.json`: User-Felder `published_at` und `publishedAt` entfernt.
- [x] `democlient/forms/kind-adapters/nip23.js`: `tagsJson` kann `published_at` nicht mehr ueberschreiben.
- [x] `SIGNER_DOKU.md`: Verhalten dokumentiert (auto-generated statt User-Eingabe).

## Fortschritt 2026-02-17 (NIP-52 TZID/Geohash automatisiert)

- [x] `democlient/forms/kind-adapters/nip52.js`: `start_tzid`/`end_tzid` auf Browser-Systemzeitzone (IANA) umgestellt.
- [x] `democlient/forms/kind-adapters/nip52.js`: Geohash-Erzeugung ohne externe Abhaengigkeit implementiert.
- [x] `democlient/forms/kind-adapters/nip52.js`: `g` wird aus `lat/lon` oder aus `location`-Text (`lat,lon`) abgeleitet.
- [x] `democlient/forms/schemas/nip52-calendar.json`: manuelle Felder `startTzid`, `endTzid`, `geohash` entfernt.
- [x] `SIGNER_DOKU.md`: NIP-52 Verhalten fuer automatische TZID/Geohash-Ableitung dokumentiert.

## Fortschritt 2026-02-17 (NIP-52 Summary + Open-API Vorgabe)

- [x] `democlient/forms/schemas/nip52-calendar.json`: Feld `summary` auf `textarea` (mehrzeilig) umgestellt.
- [x] `SIGNER_DOKU.md`: Geocoding-Hinweis um Open-API-Vorgabe ergaenzt.

## Fortschritt 2026-02-17 (NIP-52 RSVP-Felder aus Default-UI entfernt)

- [x] `democlient/forms/schemas/nip52-calendar.json`: Felder `calendarReference` und `rsvpStatus` entfernt (weniger Verwirrung im Standardformular).
- [x] `SIGNER_DOKU.md`: Hinweis ergaenzt, dass RSVP-Felder ueber Custom-Schema eingebracht werden koennen.

## Fortschritt 2026-02-17 (Demo-UI ohne Public-Key-Button)

- [x] `democlient/index.html`: Button `Public Key laden` aus der Standard-UI entfernt.
- [x] `democlient/nostreclient.js`: Abhaengigkeiten zu `pubkey-btn` entfernt (Required-Roles, Listener, Busy/Enable-State).
- [x] `SIGNER_DOKU.md`: Verhalten dokumentiert (Public Key wird intern bei Bedarf geladen).

## Fortschritt 2026-02-17 (Form-URI optional / API-only Modus)

- [x] `democlient/forms/schema-loader.js`: `loadFormSchema(...)` um `allowEmpty` erweitert (`null` bei leerem `form_uri`).
- [x] `democlient/nostreclient.js`: Formularmodus optional gemacht; ohne `form_uri` wird kein Formular gerendert.
- [x] `democlient/nostreclient.js`: Required-DOM-Rollen in Basis- und Formularrollen getrennt, damit API-only Setup ohne Formular-Elemente moeglich ist.
- [x] `democlient/index.js`: Default-Config auf formularlosen Start umgestellt (Kommentar fuer Custom-Event-Flow).
- [x] `SIGNER_DOKU.md`: API-Doku auf neues Verhalten aktualisiert (`form_uri` optional, API-only ohne Formular).

## Fortschritt 2026-02-17 (Hidden-Attribut CSS-Fix)

- [x] `democlient/index.css`: globale Regel `[hidden] { display: none !important; }` hinzugefuegt, damit per JS ausgeblendete Bereiche (z. B. `content-count`-Zeile) nicht durch `.row { display: grid; }` sichtbar bleiben.

## Fortschritt 2026-02-17 (Neuer Embed-Client fuer Flotilla)

- [x] Neuer Ordner `embedclients/flotilla/` erstellt.
- [x] `embedclients/flotilla/index.html` angelegt (Wizard + Flotilla-iframe + Signer-Dialog).
- [x] `embedclients/flotilla/index.css` angelegt (responsive Layout, Guide- und Dialog-Styles).
- [x] `embedclients/flotilla/index.js` angelegt:
  - nutzt `createBunkerConnectClient(...)` aus `democlient/nostr.js`
  - startet Signer-Autoconnect
  - zeigt `bunker://...` an und bietet Copy-/Refresh-Buttons
  - fuehrt User manuell durch den Flotilla-Loginflow
- [x] `SIGNER_DOKU.md` um Abschnitt zum Flotilla-Embed-Client erweitert.

## Fortschritt 2026-02-17 (Flotilla Embed: Bridge-only Bunker-Link)

- [x] `embedclients/flotilla/index.js`: Flow auf Bridge-only umgestellt (`autoConnect: false`), damit Relay-Timeouts im Parent den Login-Wizard nicht blockieren.
- [x] `embedclients/flotilla/index.js`: Bunker-Link-Ableitung erweitert (`activeConnection.bunkerUri` -> `lastBridgeConnectionInfo.bunkerUri` -> Konvertierung aus `nostrconnect://`).
- [x] `embedclients/flotilla/index.js`: Relay-Timeout-Status entdramatisiert (Hinweis statt harter Fehler), solange der Bunker-Link verfuegbar ist.

## Fortschritt 2026-02-17 (Flotilla Embed: Lock-Dialog Auto-Open)

- [x] `embedclients/flotilla/index.js`: Locked-Signer-Erkennung hinzugefuegt (`isLockedSignerMessage`).
- [x] `embedclients/flotilla/index.js`: Bei gesperrtem Signer wird der Signer-Dialog automatisch geoeffnet, damit die Passwortabfrage direkt sichtbar ist.
- [x] `embedclients/flotilla/index.js`: Refresh-Fehler bei Lock-Status zeigen nun gezielten Hinweis statt generischem Fehler.

## Fortschritt 2026-02-17 (Flotilla Embed: Unlock Auto-Close + Status-Fix)

- [x] `embedclients/flotilla/index.js`: Unlock-Flow-State (`signerUnlockFlowActive`) eingefuehrt.
- [x] `embedclients/flotilla/index.js`: Nach verfuegbarem Bunker-Link wird der fuer Unlock geoeffnete Signer-Dialog automatisch geschlossen.
- [x] `embedclients/flotilla/index.js`: Stale Header-Status `Verbindung wird vorbereitet ...` wird nach erfolgreicher Entsperrung auf `Signer bereit. Bunker Link ist bereit.` aktualisiert.

## Fortschritt 2026-02-17 (Embed-Client abstrahiert)

- [x] `embedclients/flotilla/index.js`: auf app-agnostische Runtime-Config umgestellt (`data-app-name`, `data-app-url`, `data-signer-uri` statt Flotilla-Hardcodes).
- [x] `embedclients/flotilla/index.js`: generische UI-IDs genutzt (`open-app-tab-btn`, `embedded-app-frame`) fuer wiederverwendbare Embeds.
- [x] `embedclients/flotilla/index.html`: Data-Attribute am Root hinzugefuegt, damit Ziel-App und Signer ohne JS-Edit konfigurierbar sind.
- [x] `embedclients/flotilla/index.html`: CSP `frame-src` auf generisches Embed-Profil (`'self' https: http:`) erweitert.
- [x] `SIGNER_DOKU.md`: Abschnitt 14 um die neue app-agnostische Konfiguration ergaenzt.

## Fortschritt 2026-02-17 (Identity-Link Client MVP Start)

- [x] Neuer Ordner `embedclients/identity-link/` angelegt.
- [x] `embedclients/identity-link/index.html` erstellt (Identity-UI, Status, Mismatch-Panel, Signer-Dialog).
- [x] `embedclients/identity-link/index.css` erstellt (responsive Layout + Status/Badge/Mismatch Styles).
- [x] `embedclients/identity-link/index.js` erstellt:
  - nutzt `createBunkerConnectClient(...)` aus `democlient/nostr.js` im Bridge-only Modus
  - laedt Session-Identity aus Backend-Endpunkt
  - stellt Signer-Key per Bridge sicher (`wp-ensure-user-key`)
  - vergleicht Backend-`expectedPubkey` gegen Signer-`pubkey`
  - bildet Status `unbound|matched|mismatched|error`
  - unterstuetzt `bind` und `rebind` Endpunkte
  - fuehrt Provider-Adapter ein (WordPress + OIDC-Namespace fuer Keycloak/Moodle/Drupal)
- [x] `SIGNER_DOKU.md` um Abschnitt 15 (Identity-Link Client) erweitert.

## Fortschritt 2026-02-17 (WordPress Plugin-Skelett fuer Identity-Link)

- [x] Neuer Ordner `integrations/wordpress/nostr-identity-link/` angelegt.
- [x] Neues Plugin `integrations/wordpress/nostr-identity-link/nostr-identity-link.php` erstellt.
- [x] REST-Endpunkte implementiert:
  - `GET /wp-json/identity-link/v1/session`
  - `POST /wp-json/identity-link/v1/bind`
  - `POST /wp-json/identity-link/v1/rebind`
- [x] Sicherheitschecks fuer write-Endpunkte implementiert (Login + `X-WP-Nonce` / `_wpnonce`).
- [x] Session-Auth robust gemacht: User-Kontext wird fuer `GET /session` bei Bedarf aus `logged_in`-Cookie wiederhergestellt (REST-401 trotz aktivem Login reduziert).
- [x] MVP-Datenhaltung in `user_meta` umgesetzt (`pubkey`, `npub`, `keyId`, `updatedAt`).
- [x] Audit-Log als begrenzte Option-Liste umgesetzt (inkl. `actor`, `target`, `oldPubkey`, `newPubkey`, `timestamp`, IP, User-Agent).
- [x] `embedclients/identity-link/index.html` Default-Endpunkte auf WordPress-REST-Pfade umgestellt.
- [x] `embedclients/identity-link/index.js` um WP-REST-Nonce-Unterstuetzung erweitert (Meta/Data-Attribut + `meta.restNonce` aus API-Antwort).
- [x] Aktivierungsfehler behoben: `nostr-identity-link.php` ohne UTF-8 BOM gespeichert, damit kein vorzeitiger Output (`EF BB BF`) gesendet wird.

## Fortschritt 2026-02-17 (WordPress Shortcode fuer Nonce-Injektion)

- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`: Shortcode `nip46_identity_link_client` hinzugefuegt.
- [x] Shortcode injiziert den WP-REST-Nonce als `<meta name=\"wp-rest-nonce\">` in die Seite.
- [x] Shortcode kann optional ein iframe auf den Identity-Link-Client rendern (`client_url`, `show_iframe`, `iframe_height`, `iframe_title`).
- [x] Shortcode haengt den Nonce zusaetzlich als `wpRestNonce` Query-Parameter an `client_url` an.
- [x] `embedclients/identity-link/index.js`: Query-Fallback fuer Nonce (`wpRestNonce`, `wp_rest_nonce`, `_wpnonce`) ergaenzt.
- [x] `SIGNER_DOKU.md` um Shortcode-Nutzung erweitert.

## Fortschritt 2026-02-17 (WordPress Rewrite fuer /nostr/...)

- [x] Plugin-Rewrite eingefuehrt:
  - `/nostr/` -> Redirect auf `/nostr/identity-link/`
  - `/nostr/identity-link/` -> Plugin-Client
  - `/nostr/signer/` -> Plugin-Signer
- [x] Statische Auslieferung aus `integrations/wordpress/nostr-identity-link/public/` implementiert (inkl. MIME-Type und Path-Sanitizing).
- [x] Query-Var-Registrierung + `template_redirect`-Serve-Flow im Plugin hinzugefuegt.
- [x] Activation/Deactivation erweitert um Rewrite-Flush.
- [x] Web-Bundle im Plugin abgelegt:
  - `public/signer/*`
  - `public/identity-link/*`
  - `public/democlient/nostr.js`
  - `public/vendor/ndk-3.0.0.js`
- [x] Modulpfade fuer Plugin-Route angepasst:
  - `public/signer/signer-nip46.js` -> `../vendor/ndk-3.0.0.js`
  - `public/identity-link/index.js` -> `../democlient/nostr.js`
  - `public/identity-link/index.html` signer URI -> `../signer/`
- [x] `SIGNER_DOKU.md` um Rewrite-/Deployment-Hinweise erweitert.
- [x] MIME-Fix fuer ES-Module: Canonical-Redirects fuer `/nostr/...` deaktiviert, damit `*.js` nicht auf `*.js/` umgebogen wird.
- [x] Alias-Mapping fuer fehlaufgeloeste Modulpfade ergaenzt (`identity-link/democlient/*` -> `democlient/*` etc.).
- [x] HTTP-Dev-Ausnahme erweitert: lokale Domains `*.test` und `*.localhost` werden nicht mehr als unsicher blockiert.
- [x] Signer-Transportcheck ebenfalls erweitert: `signer-nip46.js` (Core + Plugin-Bundle) erlaubt lokale Dev-Hosts `*.test`/`*.localhost` unter HTTP.
- [x] Cache-Busting fuer Plugin-Signer ergaenzt: `public/signer/index.html` nutzt versionierten Script-Import (`signer-nip46.js?v=...`).
- [x] `public/signer/sw.js` korrigiert (Cache-Version hochgezogen, `index.html` statt `signer.html`, ungueltigen `./vendor/...` Eintrag entfernt).
- [x] WebCrypto-Fehlermeldung im Signer verbessert (Core + Plugin-Bundle): erklaert `crypto.subtle`-Browsergrenze auf `http://*.test` und nennt konkrete Dev-Workarounds.

## Fortschritt 2026-02-17 (WP-Bridge Timeout bei `wp-ensure-user-key`)

- [x] `signer-nip46.js`: WP-Bridge-Flow entkoppelt von blockierenden Passwort-Prompts.
- [x] `signer-nip46.js`: neue no-prompt Helfer fuer `wp-ensure-user-key` eingebaut:
  - Entschluesselung vorhandener Bindings via Session-Passwort oder Session-Unlock-Material (bei passendem Salt)
  - Key-Erzeugung via Session-Passwort oder Session-Unlock-Material
  - sofortiger `gesperrt/entsperren`-Fehler, falls interaktive Entsperrung noetig ist
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: identische Fixes im Plugin-Bundle uebernommen.
- [x] `embedclients/identity-link/index.js`: Timeout fuer `wp-ensure-user-key` auf 30s erhoeht und bei Timeout Signer-Dialog automatisch geoeffnet.
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: identische Timeout-/Dialog-Fixes fuer Plugin-Bundle uebernommen.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/index.html` + `public/signer/sw.js`: Cache-Busting fuer Rollout aktualisiert (`signer-nip46.js?v=20260217c`, `CACHE_VERSION` -> `nip46-signer-v3`).
- [x] `SIGNER_DOKU.md`: Verhalten und neue Bridge-Fehlersemantik dokumentiert.

## Fortschritt 2026-02-17 (WordPress Route-Fix fuer `/nostr/signer`)

- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`: kanonischer Redirect fuer Verzeichnisrouten ohne trailing slash eingebaut (`/nostr/signer` -> `/nostr/signer/`, analog fuer `identity-link`).
- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`: Public-Alias-Fallbacks fuer alte Asset-URLs ergaenzt (`signer-ui.css`, `signer-ui.js`, `signer-nip46.js`, `manifest.webmanifest`, `icons/*` -> `signer/...`).
- [x] `SIGNER_DOKU.md`: Hinweis zu Trailing-Slash-Kanonisierung und Asset-Fallback dokumentiert.

## Fortschritt 2026-02-17 (Embedded Unlock-UI fuer Identity-Link)

- [x] `signer-nip46.js`: `focusEmbeddedUnlockUi()` eingefuehrt; bei `wp-ensure-user-key` Lock-Fehler wird automatisch auf `management` umgeschaltet und Compact-Mode deaktiviert.
- [x] `signer-nip46.js`: Bridge-Request `show-management` unterstuetzt, damit Parent den Management-Tab explizit oeffnen kann.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: identische Embedded-Unlock-Fixes ins Plugin-Bundle uebernommen.
- [x] `embedclients/identity-link/index.js`: `requestSignerManagementView()` hinzugefuegt und bei `Signer öffnen`, Lock-Warnungen und Bridge-Timeout verwendet.
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: identische Unlock-View-Trigger ins Plugin-Bundle uebernommen.
- [x] Cache-Busting fuer sofortigen Rollout aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217d`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v4"`
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217d`
- [x] `SIGNER_DOKU.md`: Embedded-Unlock-Verhalten dokumentiert.

## Fortschritt 2026-02-17 (Statuskonsistenz und aktiver Binding-Key)

- [x] `signer-nip46.js`: `wp-ensure-user-key` optimiert: wenn der gebundene Key bereits der aktive Key ist, werden `pubkey/npub` direkt aus `activeUser` geliefert (keine zusaetzliche Entschluesselung noetig).
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: gleicher Fix fuer Plugin-Bundle uebernommen.
- [x] Fehlermeldung praezisiert: statt pauschal "Signer ist gesperrt" jetzt klarer Hinweis auf noetige Passwort-Bestaetigung fuer die konkrete WP-Keyring-Aktion.
- [x] Statusanzeige vereinheitlicht: `bereit ??`/Emoji-Fallback auf klares `bereit` umgestellt.
- [x] Cache-Busting fuer Plugin-Signer erneut hochgezogen (`signer-nip46.js?v=20260217e`, `CACHE_VERSION = "nip46-signer-v5"`).

## Fortschritt 2026-02-17 (Bridge-Timeout Diagnose / Kompatibilitaet)

- [x] `embedclients/identity-link/index.js`: `wp-user-key-result`-Antworten ohne `requestId` als Legacy-Fallback akzeptiert (solange Typ/Source/Origin passt).
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: gleicher Legacy-Fallback im Plugin-Bundle.
- [x] `signer-nip46.js`: Bridge-Diagnose-Logs fuer WP-Flow hinzugefuegt:
  - `Bridge: wp-ensure-user-key empfangen (...)`
  - `Bridge: wp-user-key-result ok (...)`
  - `Bridge: wp-user-key-result error (...)`
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: gleiche Diagnose-Logs im Plugin-Bundle.
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217f`
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217f`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v6"`

## Fortschritt 2026-02-17 (WP-Keyring Passwort-Bestaetigung ueber Bridge)

- [x] `signer-nip46.js`: `wp-ensure-user-key` kann bei fehlendem Session-Passwort jetzt aktiv `ensureSessionPassword()` anstossen (statt sofortiger Fehler), inkl. Fokus auf Management-Ansicht im Embed.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: gleiche Anpassung im Plugin-Bundle.
- [x] `embedclients/identity-link/index.js`: Timeout fuer `wp-ensure-user-key` auf 120s erhoeht, damit Passwort-Bestaetigung im Signer-Dialog nicht in einen kuenstlichen Client-Timeout laeuft.
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: gleicher Timeout-Fix im Plugin-Bundle.
- [x] Cache-Busting erneut erhoeht:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217g`
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217g`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v7"`

## Fortschritt 2026-02-17 (Bridge-Ready Race im Identity-Link Client)

- [x] `embedclients/identity-link/index.js`: `waitForSignerBridgeReady(...)` hinzugefuegt (Polling via `bunkerClient.syncConnectionInfo()`), um `wp-ensure-user-key` erst nach sicherem Bridge-Ready abzusetzen.
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: gleicher Bridge-Ready-Wait im Plugin-Bundle.
- [x] `embedclients/identity-link/index.js`: `isReadySignerMessage(...)` und Auto-Recovery nach Unlock eingebaut (Dialog schliessen + erneuter Sync).
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: gleiche Auto-Recovery-Logik im Plugin-Bundle.
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217h`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v8"`

## Fortschritt 2026-02-17 (Auto-Open Passwortdialog bei Ensure)

- [x] `embedclients/identity-link/index.js`: `isSignerDialogOpen()` hinzugefuegt.
- [x] `embedclients/identity-link/index.js`: `ensureSignerKeyForActiveIdentity()` oeffnet den Signer-Dialog automatisch, wenn er vor dem Ensure geschlossen war.
- [x] `embedclients/identity-link/index.js`: bei erfolgreichem Ensure wird der fuer den Flow automatisch geoeffnete Dialog wieder geschlossen; bei Fehler bleibt er offen.
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: identische Anpassungen im Plugin-Bundle.
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217i`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v9"`

## Fortschritt 2026-02-17 (Compare-First statt Always-Ensure)

- [x] `embedclients/identity-link/index.js`: Compare-First-Strategie eingefuehrt.
  - Bei bereits gebundenem Backend (`expectedPubkey` vorhanden) wird der aktive Signer-Pubkey direkt ueber Bridge gelesen (`connection-info`) und nur verglichen.
  - `wp-ensure-user-key` wird nur noch bei ungebundenem Backend aufgerufen (Erstzuordnung).
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: identische Compare-First-Logik im Plugin-Bundle.
- [x] Neue Bridge-Helfer hinzugefuegt (`signerResultFromBridgeConnectionInfo`, `resolveSignerResultFromBridge`, `resolveSignerResultForActiveIdentity`).
- [x] `runFullSync()` und `onEnsureLinkClicked()` auf Compare-First umgestellt.
- [x] UX-Text angepasst: "Pruefe Signer-Key und Zuordnung ..." statt pauschal "Fordere Signer-Key an ...".
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217k`

## Fortschritt 2026-02-17 (Reload-UX / weniger Passwort-Overhead)

- [x] `embedclients/identity-link/index.js`: `waitForSignerBridgeReady(...)` oeffnet den Signer-Dialog jetzt bereits beim ersten Bridge-Fehler (nicht nur bei explizitem `gesperrt`-Text), damit die Passwortabfrage bei Reload sofort sichtbar wird.
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: gleicher Fix im Plugin-Bundle.
- [x] `signer-nip46.js`: Standard fuer `Entsperrt bleiben` bei Unlock auf `session` gestellt (statt `none`), um wiederholte Passwortabfragen bei einfachem Reload zu reduzieren.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: gleiche Default-Umstellung im Plugin-Bundle.
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217m`
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217m`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v10"`

## Fortschritt 2026-02-17 (Plugin-Bundle Sync-Fix Identity-Link)

- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js` erneut 1:1 mit `embedclients/identity-link/index.js` synchronisiert (nur Plugin-spezifische Pfade angepasst), damit Compare-First/Bridge-First und neue UX-Fixes auch im WordPress-Bundle aktiv sind.
- [x] Verifiziert: `runFullSync()` und `onEnsureLinkClicked()` nutzen jetzt `resolveSignerResultForActiveIdentity()` statt direktem Always-Ensure.
- [x] Cache-Busting fuer Plugin-Identity-Link erneut erhoeht:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217o`

## Fortschritt 2026-02-17 (Fast-Path: nur Pubkey-Vergleich)

- [x] `democlient/nostr.js`: Bridge-Read-Only-Abfrage hinzugefuegt (`get-public-connection-info`), damit oeffentliche Signer-Key-Infos ohne `wp-ensure-user-key` geholt werden koennen.
- [x] `democlient/nostr.js`: neue API `syncPublicConnectionInfo()` exportiert; `applyConnectionInfo()` merged Teilpayloads statt sie hart zu ueberschreiben.
- [x] `democlient/nostr.js`: Status-Texte entkoppelt von Auto-Connect. Bei `autoConnect=false` jetzt klar: `Signer-Bridge bereit. Pubkey kann verglichen werden.`
- [x] `embedclients/identity-link/index.js`: `resolveSignerResultFromBridge()` nutzt zuerst `syncPublicConnectionInfo()` (Fallback: `syncConnectionInfo()`), mit Retry-Loop statt fruehem Lock-Abbruch.
- [x] `embedclients/identity-link/index.js`: Ready-Erkennung erweitert (`bridge bereit`/`verbunden`) fuer stabileren Unlock-Flow.
- [x] Plugin-Bundle erneut synchronisiert:
  - `integrations/wordpress/nostr-identity-link/public/democlient/nostr.js`
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`
  - `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js` (enthaelt nun ebenfalls `public-connection-info`/Cache-Logik)
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217p`
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217p`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v11"`

## Fortschritt 2026-02-17 (Copy-Regression Fix: Plugin-Pfade)

- [x] Kopierfehler im Plugin-Bundle behoben:
  - `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: Import korrigiert auf `../vendor/ndk-3.0.0.js`.
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: Import korrigiert auf `../democlient/nostr.js`.
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.js`: `DEFAULT_SIGNER_URI` korrigiert auf `../signer/`.
- [x] Cache-Busting nach Pfadfix:
  - `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` -> `index.js?v=20260217q`
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217q`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v12"`

## Fortschritt 2026-02-17 (Signer-Route ohne WP-Login)

- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`: Login-Zwang fuer `/nostr/signer/` entfernt.
- [x] `nip46IdentityLinkRouteRequiresAuthentication(...)` verlangt jetzt nur noch Auth fuer `identity-link`-Routen.
- [x] Ergebnis: `https://.../nostr/signer/` ist oeffentlich erreichbar, waehrend Identity-Link-Frontend und REST-Binding-Flow weiter WP-Login/Nonce-geschuetzt bleiben.

## Fortschritt 2026-02-17 (WP-Backup fuer verschluesselte Exportdatei)

- [x] WordPress REST erweitert:
  - `GET /wp-json/identity-link/v1/backup` (Backup lesen)
  - `POST /wp-json/identity-link/v1/backup` (Backup speichern)
- [x] Backup-Endpunkte verlangen Login **und** gueltigen `X-WP-Nonce` (auch fuer GET), damit der verschluesselte Export nicht ohne explizite Session-Autorisierung auslesbar ist.
- [x] Backup-Speicherung pro User in `user_meta` umgesetzt:
  - `nip46_identity_link_backup_json_v1`
  - `nip46_identity_link_backup_updated_at_v1`
- [x] Signer-UI erweitert:
  - Button `Export in WordPress speichern`
  - Button `Aus WordPress wiederherstellen`
- [x] Signer-Flow erweitert:
  - Nonce-Aufloesung aus Meta/Query/Session-Endpoint
  - REST-Retry bei 403 (Nonce-Refresh)
  - Import aus WordPress-Backup in lokalen Keyring inkl. direkter Aktivierung
- [x] Cache-Busting aktualisiert:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217r`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v13"`

## Fortschritt 2026-02-17 (Hotfix: Duplicate Identifier im Signer)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: Duplicate-Identifier-Fehler behoben (`exportPassword` wurde in `buildActiveKeyExportBundle(...)` doppelt deklariert).
- [x] `buildActiveKeyExportBundle(...)` nutzt jetzt strikt den übergebenen Parameter und validiert auf leeren Wert.
- [x] Cache-Busting nach Hotfix:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217s`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v14"`

## Fortschritt 2026-02-17 (UX-Debug: Restore aus WordPress)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: Restore-Flow um sichtbare Logs erweitert:
  - `WordPress-Backup wird geladen ...`
  - Antwort-Meta inkl. `hasBackup`/`updatedAt`
- [x] Klarere Fehlermeldung bei leerem Backup: Hinweis, zuerst `Export in WordPress speichern` auszuführen.
- [x] Bei Restore-Fehler wird automatisch auf Tab `Info/Log` gewechselt; bei fehlendem Backup zusätzlich `alert(...)`.
- [x] Nonce-Refresh verbessert: `requestWordPressBackupApi(...)` übernimmt `meta.restNonce` aus erfolgreicher Antwort.
- [x] Cache-Busting nach UX-Debug:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217t`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v15"`

## Fortschritt 2026-02-17 (Sichtbares Backup-Feedback im Signer)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/index.html`: sichtbare Statuszeile `#wp-backup-state` im WordPress-Backup-Block ergänzt.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: `setWordPressBackupState(...)` ergänzt (neutral/ok/error).
- [x] Save-/Load-Flow aktualisiert:
  - zeigt jetzt direkt am Button-Bereich an, ob gespeichert/gefunden/importiert/fehlgeschlagen.
  - ergänzt Zeitstempel (`updatedAt`) bei Erfolg.
- [x] Cache-Busting nach Feedback-UX:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217u`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v16"`

## Fortschritt 2026-02-17 (Auto-Status nach Reload fuer WP-Backup)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: `refreshWordPressBackupState()` ergänzt.
- [x] Beim Laden des Signers wird jetzt automatisch geprüft, ob ein WordPress-Backup vorhanden ist.
- [x] Statuszeile zeigt nach Reload unmittelbar:
  - `Backup vorhanden (zuletzt: ...)`
  - oder `Kein WordPress-Backup gespeichert.`
  - oder neutralen Login/Nonce-Hinweis.
- [x] Cache-Busting nach Auto-Status:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217v`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v17"`

## Fortschritt 2026-02-17 (Fix: Stale WP-Backup durch Service-Worker-Cache)

- [x] Ursache identifiziert: Signer-Service-Worker cachte bisher auch `GET /wp-json/...` und lieferte stale Backup-Antworten.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/sw.js`: `/wp-json/` Requests werden nicht mehr gecacht/intercepted.
- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: Backup-GET nutzt zusätzlich Cache-Bypass (`_ts`) und `cache: "no-store"`.
- [x] Cache-Busting nach Cache-Fix:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217w`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v18"`

## Fortschritt 2026-02-17 (Backup-Status Robustheit + User-Debug)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: Backup-Erkennung robuster gemacht:
  - `hasBackup` gilt jetzt auch, wenn nur `backup`-Payload vorhanden ist (nicht nur bei strikt boolschem `meta.hasBackup === true`).
- [x] Restore-Log erweitert um Debug-Felder:
  - `hasBackupMeta`, `hasBackupPayload`, `userId`, `updatedAt`.
- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`: `/backup`-Antwort liefert `meta.userId` zur eindeutigen Zuordnung des eingeloggten Users.
- [x] Cache-Busting nach Robustheits-Fix:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217x`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v19"`

## Fortschritt 2026-02-17 (Fix: Reload-Status zeigte false trotz vorhandenem Backup)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: `refreshWordPressBackupState()` auf dieselbe robuste Backup-Erkennung umgestellt wie der manuelle Restore-Flow.
- [x] Status-Log beim Start erweitert (`hasBackupMeta`, `hasBackupPayload`, `userId`, `updatedAt`), um User-/Payload-Mismatches sofort sichtbar zu machen.
- [x] Cache-Busting nach Reload-Status-Fix:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217y`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v20"`

## Fortschritt 2026-02-17 (Backup-Debug vertieft: sourceCount/parseOk)

- [x] `integrations/wordpress/nostr-identity-link/public/signer/signer-nip46.js`: Frontend-Logs erweitert um `sourceCount` und `parseOk` aus `/backup`-Meta.
- [x] Status-/Fehlertexte präzisiert:
  - `Backup-Daten vorhanden, aber nicht lesbar. Bitte Backup erneut speichern.`
- [x] Restore-Flow wirft bei `sourceCount>0 && parseOk=false` expliziten Fehler statt generischem "kein Backup".
- [x] Cache-Busting nach Debug-Erweiterung:
  - `integrations/wordpress/nostr-identity-link/public/signer/index.html` -> `signer-nip46.js?v=20260217z`
  - `integrations/wordpress/nostr-identity-link/public/signer/sw.js` -> `CACHE_VERSION = "nip46-signer-v21"`

## Fortschritt 2026-02-17 (Backend-Fix: parseOk=false bei vorhandenem Usermeta-Backup)

- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php`: Backup-Write speichert jetzt kanonisch als Array in `user_meta` (statt JSON-String), um Decode-Probleme bei späterem Lesen zu vermeiden.
- [x] `nip46IdentityLinkLoadUserBackup(...)` robust gemacht für gemischte Altbestände:
  - verarbeitet String-, Array- und Objektwerte
  - unterstützt JSON, doppelt-kodiertes JSON und serialisierte PHP-Werte
  - validiert Struktur über `nip46IdentityLinkLooksLikeBackupPayload(...)`
- [x] Ziel: Fälle mit `sourceCount>0` und `parseOk=false` auflösen, obwohl Backup in `usermeta` vorhanden ist.

## Fortschritt 2026-02-18 (Architektur-Start: NEW Strangler-Zone)

- [x] Neue Migrationsstruktur angelegt: `NEW/` (bestehende Pfade bleiben unverändert).
- [x] Adapter-Contracts mit Laufzeitvalidierung erstellt:
  - `NEW/shared/adapter-contracts/authStrategy.js`
  - `NEW/shared/adapter-contracts/backupStrategy.js`
  - `NEW/shared/adapter-contracts/bindingStrategy.js`
  - `NEW/shared/adapter-contracts/identityStrategy.js`
  - `NEW/shared/adapter-contracts/signerBridgePort.js`
  - `NEW/shared/adapter-contracts/index.js`
- [x] Identity-Link-Core-Skeleton erstellt:
  - `NEW/shared/identity-link-core/state.js`
  - `NEW/shared/identity-link-core/useCases/loadIdentityUseCase.js`
  - `NEW/shared/identity-link-core/useCases/ensureSignerKeyUseCase.js`
  - `NEW/shared/identity-link-core/useCases/compareKeysUseCase.js`
  - `NEW/shared/identity-link-core/index.js`
- [x] Signer-Core-Skeleton erstellt:
  - `NEW/shared/signer-core/state.js`
  - `NEW/shared/signer-core/services/getSignerStatusService.js`
  - `NEW/shared/signer-core/index.js`
- [x] WordPress-Adapter-Skeleton erstellt:
  - `NEW/integrations/wordpress/adapter/config.js`
  - `NEW/integrations/wordpress/adapter/wordpressIdentityStrategy.js`
  - `NEW/integrations/wordpress/adapter/wordpressBindingStrategy.js`
  - `NEW/integrations/wordpress/adapter/wordpressBackupStrategy.js`
  - `NEW/integrations/wordpress/adapter/wordpressAuthStrategy.js`
  - `NEW/integrations/wordpress/adapter/wordpressSignerBridgePort.js`
  - `NEW/integrations/wordpress/adapter/index.js`
- [x] Neuer Kompositions-Einstieg für den Identity-Link-Flow erstellt:
  - `NEW/apps/identity-link/index.js`
- [x] Workspace-Doku angelegt: `NEW/README.md`

## Fortschritt 2026-02-18 (Identity-Link: Feature-Flag + NEW-Core-Fallback)

- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.html` um Runtime-Flags erweitert:
  - `data-use-new-core="false"`
  - `data-new-core-module-uri=""`
- [x] `integrations/wordpress/nostr-identity-link/public/identity-link/index.js` erweitert:
  - RuntimeConfig um `useNewCore` und `newCoreModuleUri`
  - `runConfiguredSyncCycle()` mit Umschaltung NEW-Core vs. Legacy
  - NEW-Core-Fallback auf Legacy bei Import-/Laufzeitfehlern
  - Log-Zeile beim Start (`Sync-Modus: NEW-Core|Legacy`)
- [x] NEW-Core-RPC-Brücke im Legacy-Client ergänzt:
  - `createNewCoreRpcAdapter()`
  - `resolveSignerStatusForNewCoreRpc()`
  - `runSyncWithNewCore()`
- [x] `NEW/shared/identity-link-core/useCases/ensureSignerKeyUseCase.js` auf Compare-First angepasst:
  - zuerst aktiven Signer-Status lesen
  - `wp-ensure-user-key` nur als Fallback
- [x] WordPress-Adapter im NEW-Pfad gehärtet:
  - `credentials: "include"` für Session-/Bind-/Rebind-/Backup-Requests
  - robustere Session-Normalisierung (direkte Felder oder `payload.identity`)

## Fortschritt 2026-02-18 (Deployment: Buildbares WordPress-Plugin-ZIP via npm/pnpm)

- [x] `package.json` ergänzt mit plattformunabhängigen Build-Skripten:
  - `build:identity-link:wordpress`
  - Alias: `build:indenty-link:wordpress`
- [x] `scripts/build-identity-link-wordpress.mjs` erstellt (ohne externe Dependencies):
  - erzeugt `dist/wordpress/nostr-identity-link/`
  - kopiert Plugin-Source und NEW-Module nach `public/new/...`
  - patcht Dist-`identity-link/index.html` auf:
    - `data-use-new-core="true"`
    - feste Modul-URL `../new/apps/identity-link/index.js?v=<buildToken>`
  - erzeugt installierbares ZIP:
    - `dist/wordpress/nostr-identity-link-0.1.0.zip`
- [x] `integrations/wordpress/nostr-identity-link/nostr-identity-link.php` erweitert:
  - Alias `identity-link/new/ -> new/`
  - Allowlist um Prefix `new/` ergänzt

