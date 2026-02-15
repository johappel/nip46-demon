# Code-Analyse: Datenschutz und IT-Sicherheit

**Gegenstand:** `signer.html`, `mpv-nostr-client.html`  
**Datum:** 15. Februar 2026  
**Fokus:** Datenschutz, IT-Sicherheit, kryptographische Praxis

---

## 1. Zusammenfassung

Das Projekt implementiert einen browser-basierten NIP-46 Remote Signer (`signer.html`) und einen zugehörigen Nostr Client (`mpv-nostr-client.html`). Der Signer verwaltet private Schlüssel (nsec) mit AES-GCM Verschlüsselung und stellt sie über das NIP-46-Protokoll bereit. Die Kommunikation zwischen Client und Signer erfolgt per `postMessage`-Bridge (iframe) oder über Nostr-Relays.

**Gesamtbewertung:** Die kryptographische Basis ist solide (AES-256-GCM, PBKDF2 mit 210.000 Iterationen). Es bestehen jedoch Risiken in der Schlüsselverwaltung im Arbeitsspeicher, im Passwort-Caching und in der PostMessage-Validierung.

---

## 2. Analyse: signer.html

### 2.1 Kryptographie

| Aspekt | Bewertung | Detail |
|---|---|---|
| Schlüsselableitung | **Gut** | PBKDF2-SHA-256 mit 210.000 Iterationen (entspricht NIST SP 800-132 Empfehlung für 2024) |
| Verschlüsselung | **Gut** | AES-256-GCM mit zufälligem Salt (16 Bytes) und IV (12 Bytes) pro Verschlüsselungsvorgang |
| Zufallsgenerierung | **Gut** | `crypto.getRandomValues()` für Salt, IV und nsec-Erzeugung (CSPRNG) |
| WebCrypto-Abhängigkeit | **OK** | Prüfung auf `crypto.subtle` vorhanden; HTTPS/localhost Voraussetzung dokumentiert |

**Positiv:**
- Jeder Verschlüsselungsvorgang generiert neuen Salt und IV → kein Nonce-Reuse
- Payload-Format ist versioniert (`v: 1`) → Migrationsfähigkeit
- Passwort-Mindestlänge von 8 Zeichen wird erzwungen

### 2.2 Schlüsselmanagement im Arbeitsspeicher

| Risiko | Schwere | Detail |
|---|---|---|
| `activeNsec` im RAM | **Hoch** | Der entschlüsselte private Schlüssel wird als globale Variable `activeNsec` gehalten. Bei XSS-Angriffen kann er direkt ausgelesen werden. |
| `sessionPassword` im RAM | **Hoch** | Das Klartext-Passwort bleibt als globale Variable `sessionPassword` im Speicher, solange der Signer aktiv ist. |
| Kein Memory-Wiping | **Mittel** | JavaScript bietet keine Möglichkeit, Speicher sicher zu überschreiben. Strings sind immutable; `activeNsec = null` verhindert nicht, dass der GC den Wert noch im Heap hält. |

**Empfehlung:** Dies ist eine inhärente Limitation von Browser-JavaScript. Bewusstsein dafür ist vorhanden (die Architektur ist auf Browser-Kontext ausgelegt), aber es sollte dokumentiert werden, dass der Signer **nicht als Hardened Key-Management** gilt.

### 2.3 Passwort-Caching (Unlock-Cache)

| Risiko | Schwere | Detail |
|---|---|---|
| Klartext-Passwort in sessionStorage | **Hoch** | Bei Modus `session` wird das Passwort als JSON-String in `sessionStorage` gespeichert. Jeder Script-Kontext auf derselben Origin hat Zugriff. |
| Klartext-Passwort in localStorage (TTL) | **Kritisch** | Bei den Modi `15m` und `1h` wird das Passwort in `localStorage` gespeichert. Dies überlebt Tab-Schließungen und ist von jeder Seite der gleichen Origin lesbar. Ein XSS-Angriff auf der gleichen Origin genügt zum Auslesen. |
| TTL-Prüfung client-seitig | **Mittel** | Die Ablaufzeit (`expiresAt`) wird client-seitig geprüft. Ein Angreifer mit localStorage-Zugriff kann den TTL-Wert manipulieren. |

**Empfehlung:**
- Das Passwort sollte nicht im Klartext im Storage liegen. Alternative: Einen abgeleiteten Schlüssel (z.B. per PBKDF2) statt des Passworts cachen, oder einen einmaligen Session-Token verwenden.
- TTL-Modus in localStorage (`15m`, `1h`) sollte den Nutzer explizit auf das Risiko hinweisen.

### 2.4 localStorage-Sicherheit

| Risiko | Schwere | Detail |
|---|---|---|
| Keyring in localStorage | **Mittel** | Der verschlüsselte Keyring (`nip46_demo_keyring_enc_v2`) ist durch AES-GCM geschützt. Ohne Passwort nicht entschlüsselbar. Akzeptables Risiko. |
| Permissions in localStorage | **Niedrig** | Genehmigungen (`nip46_permissions_v1`) sind nicht verschlüsselt, enthalten aber keine Schlüssel – nur pubkey:method-Zuordnungen. |
| WP-Bindings in localStorage | **Niedrig** | Enthält nur userId→keyId-Mappings, keine sensitiven Daten. |
| Klartext-nsec Migration | **Positiv** | Legacy-nsec-Speicherung (`nip46_demo_nsec`, Klartext) wird automatisch in verschlüsseltes Format migriert und der Klartext gelöscht. |

### 2.5 Schlüssel-Export

| Risiko | Schwere | Detail |
|---|---|---|
| Klartext-nsec im Download | **Hoch** | Die Funktion `downloadActiveKeyPair()` exportiert den nsec als Klartext-JSON. Der Benutzer erhält eine Datei mit dem unverschlüsselten privaten Schlüssel. |

**Empfehlung:** Export-Dateien sollten optional passwortgeschützt (verschlüsselt) angeboten werden. Mindestens sollte ein Warnhinweis in der UI angezeigt werden.

### 2.6 NIP-46 Permission-System

| Aspekt | Bewertung | Detail |
|---|---|---|
| Auto-Allow-Methoden | **OK** | `connect`, `ping`, `get_public_key` sind nicht sicherheitskritisch und werden auto-erlaubt. |
| Sensitive Methoden | **Gut** | `sign_event`, `nip04_encrypt/decrypt`, `nip44_encrypt/decrypt` erfordern explizite Benutzer-Bestätigung. |
| Blockierung von `switch_relays` | **Gut** | Verhindert, dass ein Remoteclient die Relay-Konfiguration ändert. |
| "Immer erlauben" Genehmigungen | **Mittel** | Permanente Genehmigungen (`PERMISSION_FOREVER = -1`) haben kein Ablaufdatum und keine Revoke-UI. |
| Modal-Queue | **Gut** | Sequenzielle Verarbeitung verhindert Race-Conditions bei gleichzeitigen Anfragen. |

**Empfehlung:**
- Eine UI zum Widerrufen permanent erteilter Genehmigungen einbauen.
- Optionaler Sitzungs-Timeout für permanente Genehmigungen erwägen (z.B. "Immer erlauben, bis Seite geschlossen wird").

### 2.7 PostMessage-Bridge (signer.html → Parent)

| Aspekt | Bewertung | Detail |
|---|---|---|
| Origin-Validierung | **Gut** | `expectedParentOrigin()` nutzt den Query-Parameter `parentOrigin` oder `document.referrer`. Nachrichten an unbekannte Origins werden blockiert. |
| Source-Check | **Gut** | Jede Nachricht wird auf `source === BRIDGE_SOURCE` geprüft. |
| parentOrigin-Spoofing | **Mittel** | Der `parentOrigin` Query-Parameter wird vom Parent gesetzt. Ein Angreifer, der die iframe-URL kontrolliert, kann einen beliebigen `parentOrigin` setzen. Dieses Risiko wird durch Same-Origin-Einbettung gemildert. |
| Fallback auf document.referrer | **Niedrig** | `document.referrer` kann in einigen Szenarien leer oder manipuliert sein. Die Implementierung behandelt dies korrekt (gibt `null` zurück → Nachricht wird blockiert). |

### 2.8 Relay-Robustheit

| Aspekt | Bewertung | Detail |
|---|---|---|
| RPC-Reliability-Patch | **Gut** | `patchBackendRpcReliability()` stellt sicher, dass vor RPC-Operationen mindestens eine Relay-Verbindung besteht. |
| Feste Relay-Liste | **OK** | Relays sind hardcoded. Verhindert Relay-Manipulation, schränkt Flexibilität ein. |
| Reconnect-Timeout | **Gut** | 7 Sekunden Timeout für Relay-Reconnect mit klarer Fehlermeldung. |

---

## 3. Analyse: mpv-nostr-client.html

### 3.1 Externe Abhängigkeiten

| Risiko | Schwere | Detail |
|---|---|---|
| CDN-Import von esm.sh | **Hoch** | `import NDK from "https://esm.sh/@nostr-dev-kit/ndk@3.0.0?bundle&target=es2022"` – Die Bibliothek wird zur Laufzeit von einem Drittanbieter-CDN geladen. Bei Kompromittierung des CDN könnte beliebiger Code eingeschleust werden. |
| Keine SRI (Subresource Integrity) | **Hoch** | Kein `integrity`-Attribut oder Import-Map mit Hash-Überprüfung. Der Inhalt des Imports wird nicht verifiziert. |
| Version-Pinning | **OK** | Version `@3.0.0` ist gepinnt, was unbeabsichtigte Updates verhindert. Schützt jedoch nicht gegen CDN-Manipulation. |

**Empfehlung:**
- SRI-Hash für den Import berechnen und in einer Import-Map festhalten, oder die Bibliothek lokal hosten.
- Alternative: Self-Hosting der NDK-Bibliothek.

**Betrifft auch `signer.html`:** Das gleiche CDN-Import-Muster wird dort verwendet.

### 3.2 PostMessage-Bridge (Client-Seite)

| Aspekt | Bewertung | Detail |
|---|---|---|
| Origin-Prüfung | **Gut** | `bridgeMessageHandler()` prüft `event.origin !== signerFrameOrigin` vor jeder Verarbeitung. |
| Source-Prüfung | **Gut** | `data.source !== BRIDGE_SOURCE` wird geprüft. |
| Signer-URL konfigurierbar | **Mittel** | Die Signer-URL ist über ein Eingabefeld (`#signer-url`) konfigurierbar. Ein Benutzer könnte eine bösartige URL eintragen. Der `signerFrameOrigin` wird korrekt aus der URL abgeleitet, was Origin-Checks funktionsfähig hält. |
| iframe-Höhensteuerung | **Niedrig** | `applySignerFrameHeight()` begrenzt die Höhe auf MIN/MAX-Werte (110–1200px). Kein UI-Spoofing durch überdimensionierte iframes möglich. |

### 3.3 NIP-7 Provider-Vertrauen

| Risiko | Schwere | Detail |
|---|---|---|
| Blindes Vertrauen in window.nostr | **Mittel** | `looksLikeNip7Provider()` prüft nur ob `getPublicKey` und `signEvent` Funktionen sind. Ein bösartiges Script könnte `window.nostr` mit manipulierten Funktionen überschreiben. |
| window.nostr Überschreibung durch NIP-46 | **Mittel** | Im NIP-46 Modus wird `window.nostr = nostrProvider` gesetzt, wenn kein natives vorhanden ist. Dies könnte andere Scripts auf der Seite beeinflussen. |

### 3.4 Timeout-Handling

| Aspekt | Bewertung | Detail |
|---|---|---|
| Timeouts für externe Aufrufe | **Gut** | `withTimeout()` schützt vor Hängern bei `signEvent` (25s), `relay connect` (10s), `handshake` (12s), `publish` (15s). |
| Timeout-Cleanup | **Gut** | `Promise.race` + `finally(() => clearTimeout(timer))` verhindert Memory-Leaks. |

### 3.5 Eingabevalidierung

| Aspekt | Bewertung | Detail |
|---|---|---|
| URI-Parsing | **Gut** | `toBunkerUri()` validiert Protocol-Schema (`nostrconnect://` oder `bunker://`), prüft auf vorhandenen Pubkey und wirft bei ungültigen URIs Fehler. |
| User-Content | **OK** | Event-Content wird direkt aus der Textarea übernommen. Da Nostr-Events Klartext sind, gibt es hier kein Injection-Risiko im traditionellen Sinne. |
| textContent-Nutzung | **Gut** | Für Status-Anzeigen wird durchgehend `textContent` (statt `innerHTML`) verwendet → kein XSS-Vektor über Status-Updates. |

### 3.6 Event-Signierung und Publikation

| Aspekt | Bewertung | Detail |
|---|---|---|
| Event-Normalisierung | **Gut** | `signEventLikeNip7()` setzt Defaults für fehlende Felder (tags, created_at). |
| Relay-Publikation | **OK** | Events werden an alle konfigurierten Relays publiziert. Nach der Signierung wird keine weitere Prüfung des Events durchgeführt (z.B. ob das Relay die Nachricht tatsächlich akzeptiert hat). |

---

## 4. Übergreifende Risiken

### 4.1 XSS-Angriffsfläche

| Risiko | Schwere | Betroffene Datei | Detail |
|---|---|---|---|
| Kein CSP-Header | **Hoch** | Beide | Keine Content-Security-Policy definiert. Bei Hosting ohne Server-seitige CSP-Header ist beliebiges Script-Injection möglich. |
| Inline-Script | **Mittel** | Beide | Der gesamte JavaScript-Code befindet sich inline in `<script>` Tags. Eine strenge CSP (`script-src 'self'`) wäre nicht sofort anwendbar. |

**Empfehlung:**
- Mindestens eine `<meta>`-basierte CSP mit `script-src 'self' https://esm.sh` implementieren (oder besser: Scripts in separate Dateien auslagern).
- Alternativ: `script-src` mit Hash-Werten (`'sha256-...'`) für die Inline-Scripts.

### 4.2 Fehlende HTTPS-Erzwingung

Die Anwendung prüft auf `crypto.subtle`, was bei HTTP fehlschlägt. Es gibt jedoch keinen expliziten Check oder Redirect auf HTTPS. Im HTTP-Modus sind alle Relay-Verbindungen (WSS) und PostMessage-Kommunikation potentiell unsicher.

### 4.3 Logging von sensiblen Daten

| Risiko | Schwere | Betroffene Datei | Detail |
|---|---|---|---|
| console.log der Bunker-URI | **Mittel** | signer.html | `console.log("Bunker URI:", bunkerUri)` gibt die URI in der Browserkonsole aus. Die URI enthält den Public Key und Relay-Konfiguration. |
| console.log von NIP-46 Requests | **Niedrig** | signer.html | `console.log("NIP-46 Anfrage:", request)` loggt jede eingehende Anfrage. Bei sensiblen Methoden könnten Verschlüsselungsparameter geloggt werden. |

**Empfehlung:** Conditional Logging (nur im Development-Modus) oder Logging-Level einführen.

### 4.4 Keine Rate-Limiting

Weder im Signer noch im Client gibt es Rate-Limiting für:
- Passwort-Eingabe-Versuche (Brute-Force auf den Unlock-Prozess)
- NIP-46 RPC-Anfragen (ein Client könnte den Signer mit Genehmigungsanfragen fluten)

**Empfehlung:** Exponentielles Backoff bei fehlgeschlagenen Passwort-Eingaben und Request-Throttling für NIP-46 Requests einbauen.

---

## 5. Datenschutz-Bewertung

### 5.1 Gespeicherte Daten

| Datentyp | Speicherort | Verschlüsselt | Personenbezug |
|---|---|---|---|
| Private Schlüssel (nsec) | localStorage (Keyring) | Ja (AES-256-GCM) | Ja (Identifikator) |
| Passwort (Unlock-Cache) | session/localStorage | **Nein (Klartext)** | Ja (Authentifizierungsdaten) |
| Public Key / npub | localStorage (Bindings) | Nein | Ja (pseudonym, aber identifizierbar) |
| Genehmigungen | localStorage | Nein | Ja (pubkey-basiert) |
| WP-User-Bindings | localStorage | Nein | Ja (WordPress User-ID → Nostr Key) |

### 5.2 Datenübertragung

| Datenfluss | Verschlüsselt | Detail |
|---|---|---|
| Client ↔ Signer (iframe) | Nur Origin-geprüft | PostMessage innerhalb des Browsers, kein Netzwerkverkehr |
| Client ↔ Relay | WSS (TLS) | Relay-Kommunikation ist TLS-verschlüsselt |
| Signer ↔ Relay | WSS (TLS) | NIP-46 RPC über TLS-verschlüsselte WebSocket-Verbindung |
| NIP-46 RPC-Inhalt | NIP-04/NIP-44 | Die RPC-Payload zwischen Signer und Client ist Ende-zu-Ende verschlüsselt |

### 5.3 Datenminimierung

- **Positiv:** Keine externen Analytics, Tracker oder Drittanbieter-Services (abgesehen vom CDN-Import).
- **Positiv:** Keine Server-seitige Speicherung – alle Daten bleiben im Browser.
- **Negativ:** Relay-Betreiber können Public Keys und Timestamps der NIP-46 RPC-Events sehen (Metadaten).

---

## 6. Risiko-Matrix (Übersicht)

| # | Risiko | Schwere | Datei | Status |
|---|---|---|---|---|
| R1 | Klartext-Passwort im localStorage (TTL-Cache) | Kritisch | signer.html | Offen |
| R2 | CDN-Import ohne SRI | Hoch | Beide | Offen |
| R3 | Kein CSP-Header | Hoch | Beide | Offen |
| R4 | `activeNsec` / `sessionPassword` im JS-Heap | Hoch | signer.html | Inhärent (Browser) |
| R5 | Klartext-nsec im Export-Download | Hoch | signer.html | Offen |
| R6 | Klartext-Passwort in sessionStorage | Hoch | signer.html | Offen |
| R7 | Kein Rate-Limiting bei Passwort-Eingabe | Mittel | signer.html | Offen |
| R8 | Permanente Genehmigungen ohne Revoke-UI | Mittel | signer.html | Offen |
| R9 | console.log sensitiver Daten | Mittel | signer.html | Offen |
| R10 | parentOrigin-Parameter spoofbar | Mittel | signer.html | Gemildert |
| R11 | Kein expliziter HTTPS-Check/Redirect | Mittel | Beide | Offen |

---

## 7. Empfehlungen (priorisiert)

### Priorität 1 (Kritisch/Hoch)

1. **Passwort-Cache verschlüsseln (R1, R6):** Statt das Klartext-Passwort in session/localStorage zu cachen, einen abgeleiteten Schlüssel oder einen einmaligen Session-Token (z.B. CryptoKey-Handle) verwenden.

2. **SRI oder Self-Hosting für NDK (R2):** Die NDK-Bibliothek lokal hosten oder SRI-Hashes für den CDN-Import bereitstellen, um Supply-Chain-Angriffe zu verhindern.

3. **Content Security Policy einführen (R3):** Mindestens eine Meta-CSP hinzufügen:
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self' https://esm.sh; connect-src wss: https:; style-src 'self' 'unsafe-inline'; frame-src 'self';">
   ```

4. **Export-Datei verschlüsseln (R5):** Schlüssel-Export optional mit Passwort schützen oder nur in verschlüsseltem Format anbieten.

### Priorität 2 (Mittel)

5. **Rate-Limiting für Unlock-Versuche (R7):** Exponentielles Backoff nach fehlgeschlagenen Passwort-Eingaben.

6. **Revoke-UI für Genehmigungen (R8):** Möglichkeit, permanent erteilte Genehmigungen einzeln zu widerrufen.

7. **Conditional Logging (R9):** `console.log` Aufrufe nur im Development-Modus aktivieren.

8. **HTTPS-Prüfung (R11):** Explizite Warnung oder Redirect bei HTTP-Zugriff.

---

## 8. Positive Sicherheitsaspekte

- **Solide kryptographische Basis:** AES-256-GCM + PBKDF2-SHA-256 mit 210k Iterationen ist aktueller Stand der Technik.
- **Konsequente textContent-Nutzung:** Kein innerHTML-basiertes XSS in der Ausgabelogik.
- **Origin-basierte PostMessage-Validierung:** Beide Seiten prüfen Origin und Source-Identifier.
- **switch_relays blockiert:** Verhindert Remote-Manipulation der Relay-Konfiguration.
- **Auto-Migration von Legacy-Formaten:** Klartext-nsec werden automatisch in verschlüsseltes Format überführt und gelöscht.
- **Versionierte Payload-Formate:** Ermöglichen zukünftige Migrationen ohne Datenverlust.
- **Sequenzielle Genehmigungsqueue:** Verhindert Race-Conditions bei parallelen Signatur-Anfragen.
- **Timeout-Schutz:** Alle asynchronen Operationen haben Timeout-Begrenzungen.
