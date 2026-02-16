**TASK-Liste (Recoding `signer.html`)**

1. `Refactor-Plan finalisieren`  
   Scope festlegen: welche Funktionen bleiben in `signer.html`, welche wandern nach `signer-ui.js`, `signer-nip46.js`, `signer-ui.css`.

2. `Dateistruktur anlegen`  
   Neue Dateien erstellen: `signer-ui.js`, `signer-nip46.js`, `signer-ui.css`.

3. `CSS auslagern`  
   Alle Styles aus `signer.html` nach `signer-ui.css` verschieben und per `<link>` einbinden.

4. `UI-Logik auslagern`  
   DOM-Updates, Tabs, Modals, Render-Funktionen, Event-Handler nach `signer-ui.js` verschieben.

5. `NIP-46/Core-Logik auslagern`  
   NDK-Setup, Relay-Handling, Permission-Callback, Bridge-PostMessage, Start/Stop nach `signer-nip46.js`.

6. `Klare Modulgrenzen definieren`  
   Öffentliche API zwischen Modulen festlegen, z. B. `initUI(...)`, `startSigner(...)`, `onPermissionRequest(...)`.

7. `Bootstrapping vereinfachen`  
   `signer.html` auf schlanken Einstieg reduzieren (Imports + `init()`).

8. `Notification API integrieren`  
   Permission-Flow bauen (`default/granted/denied`) und bei neuer Sign-Anfrage Windows-Notification senden.

9. `Blinkenden Titel implementieren`  
   Bei offener Genehmigungsanfrage zwischen z. B. `"NIP-46 Signer"` und `"Signatur anfragen..."` toggeln; bei Fokus/Erledigung zurücksetzen.

10. `Optionalen Sound integrieren`  
    Kurzen Signalton bei neuer Anfrage abspielen; robust gegen Autoplay-Blocker.

11. `User-Settings hinzufügen`  
    Schalter für `Benachrichtigung`, `Title-Blink`, `Sound` in UI + Persistenz via `localStorage`.

12. `Request-Hooks vereinheitlichen`  
    Alle drei Alarmwege (Notification, Title, Sound) zentral an „neue sensitive Anfrage“ koppeln.

13. `Cleanup & Regression-Test`  
    Testen: Unlock, `ready`, `locked`, Sign-Freigabe, iframe-Bridge, Standalone-Betrieb.

14. `Dokumentation aktualisieren`  
    `README.md` und `SIGNER_DOKU.md` um neue Dateistruktur und Notification-Verhalten ergänzen.

15. `Archiv-Datei entscheiden`  
    `tests/signer-archived.html` entweder auf neuen Stand bringen oder klar als Legacy markieren.