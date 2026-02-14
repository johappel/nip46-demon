Hier ist ein minimales, funktionsfähiges Beispiel für einen
Frontend-Signer. Dieses Skript nutzt NDK, um Anfragen über ein Relay zu empfangen. Der Key bleibt im Browser, und statt eines Popups nutzt es ein einfaches HTML-Overlay, um die Blockierung durch den Browser zu umgehen.
HTML & JavaScript (index.html)
Du kannst dies direkt als eine Datei speichern und über einen lokalen Server (z.B. npx serve) aufrufen.

``html`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>JS Nostr Signer (No-Popup)</title>
    <script src="https://unpkg.com"></script>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #121212; color: white; }
        #auth-modal { 
            display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #222; padding: 20px; border: 1px solid #444; border-radius: 8px; z-index: 1000;
        }
        .overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); }
        button { cursor: pointer; padding: 10px 20px; margin: 5px; border-radius: 5px; border: none; }
        .btn-approve { background: #28a745; color: white; }
        .btn-reject { background: #dc3545; color: white; }
    </style>
</head>
<body>

    <h1>NIP-46 JS Signer</h1>
    <div id="status">Verbinde mit Relay...</div>
    <div id="user-info"></div>

    <!-- Das Modal statt eines Popups -->
    <div id="overlay" class="overlay"></div>
    <div id="auth-modal">
        <h3 id="request-title">Signier-Anfrage</h3>
        <p id="request-details"></p>
        <button class="btn-approve" id="approve-btn">Erlauben</button>
        <button class="btn-reject" id="reject-btn">Ablehnen</button>
    </div>

    <script>
        // 1. Initialisierung (In Produktion: nsec aus verschlüsseltem LocalStorage laden)
        const MY_NSEC = "nsec1..."; // Dein Test-nsec
        const RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];
        
        async function startSigner() {
            const ndk = new NDK({ explicitRelayUrls: RELAYS });
            await ndk.connect();
            
            const localSigner = new NDK.NDKPrivateKeySigner(MY_NSEC);
            const user = await localSigner.user();
            
            document.getElementById('status').innerText = "Bereit für Anfragen";
            document.getElementById('user-info').innerText = `Aktiv als: ${user.npub.substring(0,12)}...`;

            // 2. NIP-46 Bunker Setup
            const nip46Signer = new NDK.NDKNip46Signer(ndk, user.pubkey, localSigner);

            // 3. Request Handler (Das Herzstück)
            nip46Signer.on("request", async (request) => {
                console.log("Anfrage erhalten:", request);
                showModal(request, () => {
                    nip46Signer.approve(request.id);
                    hideModal();
                }, () => {
                    nip46Signer.reject(request.id, "User declined");
                    hideModal();
                });
            });

            // Remote Signer abonnieren
            await nip46Signer.blockUntilReady();
            console.log("Bunker URI:", `nostrconnect://${user.pubkey}?relay=${RELAYS[0]}`);
        }

        // UI Logik
        function showModal(req, onApprove, onReject) {
            document.getElementById('request-details').innerText = `Methode: ${req.method}\nParameter: ${JSON.stringify(req.params)}`;
            document.getElementById('overlay').style.display = 'block';
            document.getElementById('auth-modal').style.display = 'block';
            
            document.getElementById('approve-btn').onclick = onApprove;
            document.getElementById('reject-btn').onclick = onReject;
        }

        function hideModal() {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('auth-modal').style.display = 'none';
        }

        startSigner().catch(console.error);
    </script>
</body>
</html>

```
Warum dies besser funktioniert:

    In-App UI: Da der Signier-Dialog ein einfaches HTML-Element (div) ist, wird er niemals von einem Popup-Blocker erfasst.
    NDK Abstraktion: Der NDK (Nostr Dev Kit) übernimmt das komplette NIP-46 Protokoll, inklusive der Verschlüsselung der Events zwischen Client und Signer.
    Non-Custodial: Der nsec wird im JavaScript-Teil deines Frontends verarbeitet. Wenn du den Code als statische Seite hostest (z.B. via GitHub Pages oder Netlify), sieht dein Server den Key nie.

### Wichtige Hinweise:

1. **Sicherheitsaspekte**:
   - Der nsec-Key sollte in Produktion verschlüsselt im LocalStorage gespeichert werden
   - Die UI sollte für Produktionsumgebungen verbessert werden (z.B. mit Passwortschutz)
   
   In einer echten Anwendung solltest du den nsec niemals im Klartext im Skript stehen haben. Nutze die Web Crypto API, um den Key mit einem vom User gewählten Passwort ODER PASSKEY zu verschlüsseln (AES-GCM), bevor du ihn im localStorage speicherst.

2. **Funktionsweise**:
   - Der Bunker wartet auf NIP-46-Anfragen
   - Zeigt jede Anfrage in einem Modal an
   - Der Nutzer kann die Anfrage genehmigen oder ablehnen

3. **Erweiterungsmöglichkeiten**:
   - Anfragen speichern/verwalten
   - Mehrere Nutzeraccounts verwalten
   - Transaktionen signieren

4. **Fehlerbehandlung**:
   - Füge try-catch Blöcke für kritische Operationen hinzu
   - Zeige Nutzerfreundliche Fehlermeldungen an
