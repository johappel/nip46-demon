# Security-Status (Signer)

Stand: 15.02.2026  
Gilt fuer: `signer.html` (NIP-46 Signer) und die Einbettung ueber `mpv-nostr-client.html`

## 1) Kurzfassung

Der Signer bietet fuer eine rein statische Browser-Anwendung eine solide Sicherheitsarchitektur:
- verschluesselter Keyring (AES-256-GCM),
- starke Schluesselableitung (PBKDF2-SHA256, 210.000 Iterationen),
- keine Klartext-Passwoerter im Storage,
- verschluesselter Schluessel-Export,
- Permission-System mit Widerruf,
- HTTPS-Pruefung, CSP und Origin-Pruefungen fuer Bridge-Nachrichten.

Wichtig bleibt: Das System ist **kein Hardened Key-Management**.  
Private Schluessel werden zur Laufzeit im Browser-Prozess verarbeitet. Das ist fuer viele reale Use-Cases ok, aber nicht mit Hardware-Wallets/HSM-Sicherheitsniveau gleichzusetzen.

---

## 2) Welche Sicherheitsarchitektur wird bereitgestellt?

### 2.1 Kryptographie fuer lokale Schluessel

- `nsec` wird lokal verschluesselt gespeichert (AES-256-GCM).
- Pro Verschluesselung werden zufaellige Salt/IV-Werte verwendet.
- Der AES-Key wird aus dem Passwort mit PBKDF2-SHA256 (210.000 Iterationen) abgeleitet.
- Ergebnis: Ohne Passwort ist der Keyring aus `localStorage` nicht direkt nutzbar.

### 2.2 Unlock-Cache ohne Klartext-Passwort im Storage

- Das Passwort wird **nicht** als Klartext in `sessionStorage`/`localStorage` abgelegt.
- Stattdessen wird nur abgeleitetes Unlock-Material gecached.
- Es gibt Modi `none`, `session`, `15m`, `1h` mit Ablaufsteuerung.

### 2.3 Schluessel-Export

- Export erfolgt als **verschluesselte** Datei (Passwort-geschuetzt).
- Kein Klartext-`nsec` als Standard-Exportformat.

### 2.4 NIP-46 Permission-Modell

- Unsensitive Methoden (`connect`, `ping`, `get_public_key`) koennen automatisch erlaubt werden.
- Sensitive Methoden (`sign_event`, `nip04_*`, `nip44_*`) erfordern Freigabe.
- "Immer erlauben" wird persistent gespeichert.
- Im UI gibt es eine Revoke-Verwaltung (einzeln/alle permanenten Berechtigungen widerrufen).
- `switch_relays` wird blockiert.

### 2.5 Bridge-Sicherheit (iframe/postMessage)

- Nachrichten werden ueber `source`-Tag und `origin` validiert.
- Parent-Ziel wird auf erwartete Origin eingeschraenkt.
- Client und Signer pruefen jeweils eingehende Origins.

### 2.6 Transport-/Integritaetsschutz

- Explizite HTTP-Warnung/Blockade fuer Nicht-Localhost-Kontexte.
- CSP ist gesetzt.
- NDK wird lokal aus `./vendor/` geladen (kein Laufzeit-CDN fuer Kernlogik).

### 2.7 Missbrauchsreduktion

- Exponentielles Backoff bei fehlgeschlagenen Unlock-Versuchen.
- Timeouts fuer kritische async-Operationen (Handshake, Signierung, Publish, Relay-Connect).
- Sensitives Logging ist auf Dev-Modus begrenzt.

---

## 3) Was bedeutet "nicht als Hardened Key-Management" konkret?

Kurz: Der Signer ist ein gut abgesichertes Browser-Tool, aber kein hochgehaerteter Schluesseltresor.

### 3.1 Technische Grenze von Browser-JavaScript

- Fuer Signaturen muss der private Schluessel zur Laufzeit im Speicher vorhanden sein.
- Auch Passwort/Unlock-Material leben waehrend aktiver Nutzung im Prozessspeicher.
- JavaScript kann Speicher nicht wie ein HSM sicher "wipen".

### 3.2 Folgen fuer das Bedrohungsmodell

Wenn ein Angreifer **Code in derselben Origin ausfuehren** kann (z.B. XSS), kann er:
- laufende Session-Daten auslesen,
- Storage-Inhalte kopieren,
- User-Aktionen missbrauchen.

Wenn das Endgeraet kompromittiert ist (Malware, kompromittierter Browser, boesartige Extensions), hilft lokale Kryptographie nur begrenzt.

---

## 4) Was muss der User beachten?

### 4.1 Unbedingt tun

- Nur ueber HTTPS (ausser localhost) betreiben.
- Starke, einzigartige Passwoerter verwenden.
- Browser und Extensions minimal und vertrauenswuerdig halten.
- "Immer erlauben" nur fuer vertraute Gegenstellen setzen.
- Berechtigungen regelmaessig im Security-Tab pruefen/widerrufen.
- Exportdateien wie private Schluessel behandeln (sicher speichern, Backup-Konzept haben).

### 4.2 Vermeiden

- Betrieb auf unsicheren/shared Geraeten.
- Nutzung mit untrusted Dritt-Skripten auf derselben Origin.
- Dauerhaft entsperrte Sessions ohne Bedarf.
- Leichtfertiges Teilen von Exportdateien oder Export-Passwoertern.

---

## 5) Wofuer ist diese Loesung geeignet?

Geeignet:
- Self-hosted Nostr Signer fuer eigene Webseiten/Workflows.
- Praktische alltagsnahe Signatur-Workflows mit vernuenftigem Sicherheitsniveau.
- Lokale Schluesselhaltung ohne Server-Backend.

Nicht geeignet:
- Hochkritische Umgebungen mit HSM-/Hardware-Wallet-Anforderungen.
- Angriffsmodelle mit starker Endpoint-Kompromittierung.
- Compliance-Szenarien mit formaler Schluesselinfrastruktur-Pflicht.

---

## 6) Fazit

Der aktuelle Stand ist fuer eine einzelne statische Webseite sicherheitstechnisch stark verbessert und in zentralen Punkten professionell abgesichert.  
Die verbleibenden Risiken sind primaer **plattformbedingt (Browser/Endpoint/XSS)**, nicht fehlende Basis-Kryptographie.

Wenn maximale Schluesselhaertung gefordert ist, muss auf Hardware-basierte oder isolierte Signaturkomponenten gewechselt werden.
