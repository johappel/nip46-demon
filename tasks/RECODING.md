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
