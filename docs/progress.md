# Fortschritt Signer-Entwicklung

## [Datum heute] - Periodischer Heartbeat für NIP-46 Signer hinzugefügt
- **Problem**: Im Desktop-Modus verliert der Signer nach einer gewissen Zeit die Verbindung zu den Relays (Websocket-Timeouts).
- **Lösung**: Ein `setInterval` wurde in der `startSigner()` Funktion am Ende von `signer-nip46.js` hinzugefügt. Das Skript prüft und erzwingt nun alle 45 Sekunden über `ndk.connect()` und `ensureBackendRpcRelaysConnected(nip46Backend, 5000, 1)` die Aufrechterhaltung der Relay-Verbindungen.
