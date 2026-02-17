# Taskliste: Identity-Link Client Implementierung

Stand: 2026-02-17

## Ziel

Implementierung eines dritten Clients fuer die Verknuepfung von SSO-Identitaeten mit Nostr-Keys inklusive Mismatch-Erkennung und gefuehrter Konfliktbehandlung.

## Epic A: Grundlagen und Struktur

- [ ] A1. Ordner `embedclients/identity-link/` anlegen.
- [ ] A2. Basisdateien erstellen: `index.html`, `index.css`, `index.js`.
- [ ] A3. Runtime-Konfiguration via `data-*` Attribute definieren (`provider`, `apiBaseUrl`, `signerUri`, etc.).
- [ ] A4. Bestehende `createBunkerConnectClient(...)`-Bausteine aus `democlient/nostr.js` integrieren.
- [ ] A5. Core-vs-Adapter Modulgrenze definieren (kein Provider-spezifischer Code im Core).

## Epic B: Adapter-Architektur (inkl. OIDC)

- [ ] B1. Verbindliches Adapter-Interface definieren:
  `getIdentity()`, `normalizeSubject()`, `bindIdentityPubkey()`, `rebindIdentityPubkey()`, `mapApiError()`.
- [ ] B2. Gemeinsamen `oidcAdapter` implementieren (Keycloak/Moodle als OIDC-Varianten).
- [ ] B3. `wordpressAdapter` implementieren (WP-spezifische Session/Nonce/Endpoint-Details).
- [ ] B4. `drupalAdapter` spezifizieren (Phase-1 optional, Phase-2 verpflichtend).
- [ ] B5. Adapter-Resolver implementieren (`provider` -> Adapterinstanz).

## Epic C: Identity-Input aus Backend

- [ ] C1. API-Contract fuer Session-Identity definieren (`provider`, `subject`, `displayName`, `expectedPubkey`).
- [ ] C2. Client-Loader fuer Session-Identity implementieren (inkl. Fehlerzustand).
- [ ] C3. UI-Status fuer "Identity geladen / nicht geladen" einbauen.
- [ ] C4. WordPress-first Mapping fuer `subject` etablieren (kompatibel zu `wp-ensure-user-key`).

## Epic D: Signer-Binding und Abgleich

- [ ] D1. Bridge-Request fuer User-Key Ensure im neuen Client implementieren.
- [ ] D2. Response-Handling fuer `wp-user-key-result` robust abbilden (Timeout/Fehler/locked).
- [ ] D3. Vergleich `expectedPubkey` vs. `signerPubkey` implementieren.
- [ ] D4. Binding-Statusmodell im Client halten (`unbound`, `matched`, `mismatched`).

## Epic E: Konfliktbehandlung

- [ ] E1. Konflikt-UI mit klarer Gegenueberstellung beider Pubkeys bauen.
- [ ] E2. Signieraktionen bei `mismatched` blockieren.
- [ ] E3. Rebinding-Aktion Richtung Backend (explizite Bestaetigung) vorbereiten.
- [ ] E4. Optional: Signer-Key-Switch-Flow spezifizieren (Bridge-Erweiterung als eigener Task).

## Epic F: Backend-Integration (schnittstellenorientiert)

- [ ] F1. Endpunkt fuer Erstzuordnung definieren (`POST /identity-link/bind`).
- [ ] F2. Endpunkt fuer Rebinding definieren (`POST /identity-link/rebind`).
- [ ] F3. Auditfelder vorsehen (`actor`, `timestamp`, `oldPubkey`, `newPubkey`).
- [ ] F4. Fehlercodes und Client-Mapping standardisieren.

## Epic G: Security, UX, Stabilitaet

- [ ] G1. Bestehende Secure-Transport-Pruefungen beibehalten/verwenden.
- [ ] G2. Klare Locked-Signer UX ueber Dialogfluss umsetzen.
- [ ] G3. Timeout- und Retry-Verhalten fuer Bridge/API sauber kapseln.
- [ ] G4. Keine neuen externen Abhaengigkeiten einfuehren.

## Epic H: Doku und Projektpflege

- [ ] H1. `SIGNER_DOKU.md` um neuen Client und Identity-Link-Flow erweitern.
- [ ] H2. Fortschritt in `tasks/*.md` fortlaufend aktualisieren.
- [ ] H3. Optionalen README-Verweis nur falls noetig ergaenzen (keine volle Doku dort).

## Epic I: Test- und Abnahmekriterien

- [ ] I1. Testfall: User ohne bestehende Zuordnung -> Key wird erzeugt/zugeordnet.
- [ ] I2. Testfall: Erwarteter Pubkey matcht Signer-Pubkey -> Signierbereit.
- [ ] I3. Testfall: Pubkey-Mismatch -> Warnung + Blockierung aktiv.
- [ ] I4. Testfall: Rebinding erfolgreich -> Status springt auf `matched`.
- [ ] I5. Testfall: Signer locked/timeout -> klare Recovery-Hinweise.
- [ ] I6. Testfall: OIDC-Provider ueber `oidcAdapter` laeuft ohne Core-Aenderung.

## Milestone-Vorschlag

- [ ] M1. MVP abgeschlossen: Epic A-D + I1-I3.
- [ ] M2. Konfliktaufloesung produktionsreif: Epic E-F + I4.
- [ ] M3. Doku/Hardening abgeschlossen: Epic G-H + I5-I6.
