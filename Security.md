# Security-Status (Signer)

Stand: 15.02.2026  
Gilt für: `signer.html` (NIP-46 Signer) und die Einbettung über `mpv-nostr-client.html`

## 1) Kurzfassung

Der Signer bietet für eine rein statische Browser-Anwendung eine solide Sicherheitsarchitektur:
- verschlüsselter Keyring (AES-256-GCM),
- starke Schlüsselableitung (PBKDF2-SHA256, 210.000 Iterationen),
- keine Klartext-Passwörter im Storage,
- verschlüsselter Schlüssel-Export,
- Permission-System mit Widerruf,
- HTTPS-Prüfung, CSP und Origin-Prüfungen für Bridge-Nachrichten.

Wichtig bleibt: Das System ist **kein Hardened Key-Management**.  
Private Schlüssel werden zur Laufzeit im Browser-Prozess verarbeitet. Das ist für viele reale Use-Cases ok, aber nicht mit Hardware-Wallets/HSM-Sicherheitsniveau gleichzusetzen. Hardware-Wallets nutzen spezielle Secure-Element-(SE)-Chips, um private Schlüssel physisch isoliert zu speichern.

---

## 2) Welche Sicherheitsarchitektur wird bereitgestellt?

### 2.1 Kryptographie für lokale Schlüssel

- `nsec` wird lokal verschlüsselt gespeichert (AES-256-GCM).
- Pro Verschlüsselung werden zufällige Salt/IV-Werte verwendet.
- Der AES-Key wird aus dem Passwort mit PBKDF2-SHA256 (210.000 Iterationen) abgeleitet.
- Ergebnis: Ohne Passwort ist der Keyring aus `localStorage` nicht direkt nutzbar.

### 2.2 Unlock-Cache ohne Klartext-Passwort im Storage

- Das Passwort wird **nicht** als Klartext in `sessionStorage`/`localStorage` abgelegt.
- Stattdessen wird nur abgeleitetes Unlock-Material gecached.
- Es gibt Modi `none`, `session`, `15m`, `1h` mit Ablaufsteuerung.

### 2.3 Schlüssel-Export

- Export erfolgt als **verschlüsselte** Datei (Passwort-geschützt).
- Kein Klartext-`nsec` als Standard-Exportformat.

### 2.4 NIP-46 Permission-Modell

- Unsensitive Methoden (`connect`, `ping`, `get_public_key`) können automatisch erlaubt werden.
- Sensitive Methoden (`sign_event`, `nip04_*`, `nip44_*`) erfordern Freigabe.
- "Immer erlauben" wird persistent gespeichert.
- Im UI gibt es eine Revoke-Verwaltung (einzeln/alle permanenten Berechtigungen widerrufen).
- `switch_relays` wird blockiert.

### 2.5 Bridge-Sicherheit (iframe/postMessage)

- Nachrichten werden über `source`-Tag und `origin` validiert.
- Parent-Ziel wird auf erwartete Origin eingeschränkt.
- Client und Signer prüfen jeweils eingehende Origins.

### 2.6 Transport-/Integritätsschutz

- Explizite HTTP-Warnung/Blockade für Nicht-Localhost-Kontexte.
- CSP ist gesetzt.
- NDK wird lokal aus `./vendor/` geladen (kein Laufzeit-CDN für Kernlogik).

### 2.7 Missbrauchsreduktion

- Exponentielles Backoff bei fehlgeschlagenen Unlock-Versuchen.
- Timeouts für kritische async-Operationen (Handshake, Signierung, Publish, Relay-Connect).
- Sensitives Logging ist auf Dev-Modus begrenzt.

---

## 3) Was bedeutet "nicht als Hardened Key-Management" konkret?

Kurz: Der Signer ist ein gut abgesichertes Browser-Tool, aber kein hochgehärteter Schlüsseltresor.

### 3.1 Technische Grenze von Browser-JavaScript

- Für Signaturen muss der private Schlüssel zur Laufzeit im Speicher vorhanden sein.
- Auch Passwort/Unlock-Material leben während aktiver Nutzung im Prozessspeicher.
- JavaScript kann Speicher nicht wie ein HSM sicher "wipen".

### 3.2 Folgen für das Bedrohungsmodell

Wenn ein Angreifer **Code in derselben Origin ausführen** kann (z.B. XSS), kann er:
- laufende Session-Daten auslesen,
- Storage-Inhalte kopieren,
- User-Aktionen missbrauchen.

Wenn das Endgerät kompromittiert ist (Malware, kompromittierter Browser, bösartige Extensions), hilft lokale Kryptographie nur begrenzt.

---

## 4) Was muss der User beachten?

### 4.1 Unbedingt tun

- Nur über HTTPS (außer localhost) betreiben.
- Starke, einzigartige Passwörter verwenden.
- Browser und Extensions minimal und vertrauenswürdig halten.
- "Immer erlauben" nur für vertraute Gegenstellen setzen.
- Berechtigungen regelmäßig im Security-Tab prüfen/widerrufen.
- Exportdateien wie private Schlüssel behandeln (sicher speichern, Backup-Konzept haben).

### 4.2 Vermeiden

- Betrieb auf unsicheren/shared Geräten.
- Nutzung mit untrusted Dritt-Skripten auf derselben Origin.
- Dauerhaft entsperrte Sessions ohne Bedarf.
- Leichtfertiges Teilen von Exportdateien oder Export-Passwörtern.

---

## 5) Wofür ist diese Lösung geeignet?

Geeignet:
- Self-hosted Nostr Signer für eigene Webseiten/Workflows.
- Praktische alltagsnahe Signatur-Workflows mit vernünftigem Sicherheitsniveau.
- Lokale Schlüsselhaltung ohne Server-Backend.

Nicht geeignet:
- Hochkritische Umgebungen mit HSM-/Hardware-Wallet-Anforderungen.
- Angriffsmodelle mit starker Endpoint-Kompromittierung.
- Compliance-Szenarien mit formaler Schlüsselinfrastruktur-Pflicht.

---

## 6) Fazit

Der aktuelle Stand ist für eine einzelne statische Webseite sicherheitstechnisch stark verbessert und in zentralen Punkten professionell abgesichert.  
Die verbleibenden Risiken sind primär **plattformbedingt (Browser/Endpoint/XSS)**, nicht fehlende Basis-Kryptographie.

Wenn maximale Schlüsselhärtung gefordert ist, muss auf Hardware-basierte oder isolierte Signaturkomponenten gewechselt werden.