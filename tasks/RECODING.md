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

## Umgesetzte Aenderungen

1. `signer.html`
- Inline-`<style>` entfernt, durch `<link rel="stylesheet" href="./signer-ui.css">` ersetzt.
- Inline-`<script type="module">` entfernt, durch `<script type="module" src="./signer-nip46.js">` ersetzt.
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
