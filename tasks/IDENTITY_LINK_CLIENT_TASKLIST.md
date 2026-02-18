# Taskliste: Identity-Link Client Implementierung

Stand: 2026-02-18

## Ziel

Implementierung eines dritten Clients fuer die Verknuepfung von SSO-Identitaeten mit Nostr-Keys inklusive Mismatch-Erkennung und gefuehrter Konfliktbehandlung.

## Epic A: Grundlagen und Struktur

- [x] A1. Ordner `embedclients/identity-link/` anlegen.
- [x] A2. Basisdateien erstellen: `index.html`, `index.css`, `index.js`.
- [x] A3. Runtime-Konfiguration via `data-*` Attribute definieren (`provider`, `apiBaseUrl`, `signerUri`, etc.).
- [x] A4. Bestehende `createBunkerConnectClient(...)`-Bausteine aus `democlient/nostr.js` integrieren.
- [x] A5. Core-vs-Adapter Modulgrenze definieren (kein Provider-spezifischer Code im Core).
- [x] A6. Feature-Flag fuer nostrclient-vs-Legacy Sync-Pfad im Identity-Link-Client einfuehren.
- [x] A7. Feature-Flag wieder entfernen und Identity-Link auf Core-only umstellen (kein Legacy-Fallback).

## Epic B: Adapter-Architektur (inkl. OIDC)

- [x] B1. Verbindliches Adapter-Interface definieren:
  `normalizeSubject()`, `toBridgeUserId()` (Core bleibt fuer API/Binding-Verarbeitung zustaendig).
- [x] B2. Gemeinsamen `oidcAdapter` implementieren (Keycloak/Moodle als OIDC-Varianten).
- [x] B3. `wordpressAdapter` implementieren (WP-spezifische Session/Nonce/Endpoint-Details).
- [ ] B4. `drupalAdapter` spezifizieren (Phase-1 optional, Phase-2 verpflichtend).
- [x] B5. Adapter-Resolver implementieren (`provider` -> Adapterinstanz).
- [x] B6. nostrclient-Contracts/Ports (`IdentityStrategy`, `BindingStrategy`, `BackupStrategy`, `AuthStrategy`, `SignerBridgePort`) als Laufzeitvertraege anlegen.

## Epic C: Identity-Input aus Backend

- [x] C1. API-Contract fuer Session-Identity definieren (`provider`, `subject`, `displayName`, `expectedPubkey`).
- [x] C2. Client-Loader fuer Session-Identity implementieren (inkl. Fehlerzustand).
- [x] C3. UI-Status fuer "Identity geladen / nicht geladen" einbauen.
- [x] C4. WordPress-first Mapping fuer `subject` etablieren (kompatibel zu `wp-ensure-user-key`).

## Epic D: Signer-Binding und Abgleich

- [x] D1. Bridge-Request fuer User-Key Ensure im neuen Client implementieren.
- [x] D2. Response-Handling fuer `wp-user-key-result` robust abbilden (Timeout/Fehler/locked).
- [x] D3. Vergleich `expectedPubkey` vs. `signerPubkey` implementieren.
- [x] D4. Binding-Statusmodell im Client halten (`unbound`, `matched`, `mismatched`).
- [x] D5. Compare-First auch im nostrclient-Core-Use-Case (`ensureSignerKeyUseCase`) anwenden.

## Epic E: Konfliktbehandlung

- [x] E1. Konflikt-UI mit klarer Gegenueberstellung beider Pubkeys bauen.
- [ ] E2. Signieraktionen bei `mismatched` blockieren.
- [x] E3. Rebinding-Aktion Richtung Backend (explizite Bestaetigung) vorbereiten.
- [ ] E4. Optional: Signer-Key-Switch-Flow spezifizieren (Bridge-Erweiterung als eigener Task).

## Epic F: Backend-Integration (schnittstellenorientiert)

- [x] F1. Endpunkt fuer Erstzuordnung definieren (`POST /wp-json/identity-link/v1/bind`).
- [x] F2. Endpunkt fuer Rebinding definieren (`POST /wp-json/identity-link/v1/rebind`).
- [x] F3. Auditfelder vorsehen (`actor`, `timestamp`, `oldPubkey`, `newPubkey`).
- [x] F4. Fehlercodes und Client-Mapping standardisieren.

## Epic G: Security, UX, Stabilitaet

- [x] G1. Bestehende Secure-Transport-Pruefungen beibehalten/verwenden.
- [ ] G2. Klare Locked-Signer UX ueber Dialogfluss umsetzen.
- [ ] G3. Timeout- und Retry-Verhalten fuer Bridge/API sauber kapseln.
- [x] G4. Keine neuen externen Abhaengigkeiten einfuehren.

## Epic H: Doku und Projektpflege

- [x] H1. `SIGNER_DOKU.md` um neuen Client und Identity-Link-Flow erweitern.
- [x] H2. Fortschritt in `tasks/*.md` fortlaufend aktualisieren.
- [ ] H3. Optionalen README-Verweis nur falls noetig ergaenzen (keine volle Doku dort).
- [x] H4. Architektur-Migrationsplan in `tasks/ARCHITECTURE.md` pflegen.
- [x] H5. Build-/Deployment-Skript fuer WordPress-Plugin-ZIP (`npm/pnpm run build:identity-link:wordpress`) anlegen.
- [x] H6. Zusaetzliche Build-Targets anlegen:
  - `npm/pnpm run build`
  - `npm/pnpm run build:embedclients`
  - `npm/pnpm run build:signer`
- [x] H7. Eigenes Build-Target fuer Demo-Client ohne Signer-Bundle anlegen:
  - `npm/pnpm run build:democlient`

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
