# Umsetzungsstrategie: Hexagonal Architecture + Strategy Pattern

Stand: 2026-02-18

## 1. Ziel

Diese Strategie beschreibt, wie der bestehende Code für Client, Signer und WordPress-Integration ohne Big Bang in eine wartbare Architektur überführt wird.

Zielzustand:

- ein gemeinsamer Core für alle fachlichen Abläufe,
- dünne Integrationsadapter pro Provider,
- keine Code-Kopie zwischen Integrationen,
- bestehende Security- und Performance-Optimierungen bleiben erhalten.

## 2. Leitprinzipien

- Hexagonal: Business-Logik kennt keine WordPress-, Moodle- oder Keycloak-Details.
- Strategy: Provider-spezifisches Verhalten wird über austauschbare Strategien injiziert.
- Strangler Fig: Bestehenden Code schrittweise ablösen, nie alles auf einmal umschreiben.
- Backward Compatible: Vorhandene Endpunkte, Message-Formate und UI-Flows bleiben während der Migration lauffähig.

## 3. Zielarchitektur

## 3.1 Schichten

- Core (Domain/Application): State-Machine, Key-Compare, Conflict-Handling, Retry-/Timeout-Policy.
- Ports (Interfaces): IdentityPort, BindingPort, BackupPort, AuthPort, SignerBridgePort.
- Adapters (Infra): WordPressAdapter, OidcAdapter, später DrupalAdapter.
- UI (Client/Signer): rein präsentationsnah, ruft nur Core-Use-Cases auf.

## 3.2 Empfohlene Struktur

```text
shared/
  identity-link-core/
  signer-core/
  adapter-contracts/

integrations/
  wordpress/
    nostr-identity-link/
      public/
      adapter/
  moodle/
    adapter/
  keycloak/
    adapter/
```

Hinweis: Wenn eine neue Top-Level-Struktur aktuell zu riskant ist, zuerst innerhalb des bestehenden WordPress-Pfads starten und später verschieben.

## 4. Port- und Strategy-Verträge

Die folgenden Verträge sind die harte Grenze zwischen Core und Integration.

- IdentityStrategy
  - `getSessionIdentity()`
  - `normalizeSubject(rawSubject)`

- BindingStrategy
  - `getExpectedPubkey(subject)`
  - `bindPubkey(subject, binding)`
  - `rebindPubkey(subject, oldPubkey, newPubkey)`

- BackupStrategy
  - `getBackupStatus()`
  - `saveBackup(payload)`
  - `loadBackup()`

- AuthStrategy
  - `getNonceOrToken()`
  - `ensureAuthorized()`

- SignerBridgePort
  - `ensureUserKey(input)`
  - `getSignerStatus()`
  - `switchKey?(keyId)` (optional, später)

Regel: Core importiert nur `adapter-contracts`, niemals WordPress-Code direkt.

## 5. Migrationsplan in Phasen

## Phase 0: Baseline einfrieren

Ziel: Stabiler Ausgangspunkt vor Refactor.

- Aktuelle Flows dokumentieren: load session, ensure key, compare, bind/rebind, backup save/load.
- Smoke-Testliste festhalten (manuell + falls vorhanden automatisiert).
- Feature-Flags definieren:
  - `USE_CORE_IDENTITY_LINK`
  - `USE_CORE_SIGNER_FLOW`

Ergebnis: Refactor kann ohne Blindflug verglichen werden.

## Phase 1: Contracts extrahieren

Ziel: Provider-neutrale Interfaces schaffen.

- `adapter-contracts` einführen.
- Vorhandene WordPress-spezifische Aufrufe in Adapter-Funktionen kapseln.
- Noch keine Business-Logik verschieben; nur Entkopplung herstellen.

Ergebnis: Bestehender Code läuft weiter, aber Abhängigkeiten sind sauber getrennt.

## Phase 2: Identity-Link-Core aufbauen

Ziel: Fachlogik aus `identity-link/index.js` in Core verschieben.

- Use-Cases extrahieren:
  - `loadIdentityUseCase`
  - `ensureSignerKeyUseCase`
  - `compareKeysUseCase`
  - `resolveConflictUseCase`
- Einheitliches Statusmodell etablieren:
  - `idle | loading | unbound | matched | mismatched | locked | error`
- UI konsumiert nur noch Core-Resultate.

Ergebnis: Client-Flow ist provider-neutral.

## Phase 3: Signer-Core aufbauen

Ziel: WordPress-Sonderlogik aus dem Signer herausziehen.

- Signer-interne Domain-Services extrahieren:
  - Keyring-Zustand
  - Unlock-Policy
  - Permission-Checks
  - Backup-Orchestrierung
- WordPress-Backup als `BackupStrategy` anbinden.
- UI bleibt gleich, ruft nur neue Core-Funktionen.

Ergebnis: Signer kann später von mehreren Integrationen genutzt werden.

## Phase 4: WordPress-Adapter verhärten

Ziel: WordPress als Referenzadapter finalisieren.

- REST-Aufrufe, Nonce-Handling, Fehler-Mapping zentral im Adapter.
- Service-Worker-Regeln und Cache-Bypass im Adapter-/Infra-Bereich halten.
- Einheitliche Adapter-Fehlercodes an Core liefern.

Ergebnis: WordPress ist nur noch eine austauschbare Strategie.

## Phase 5: OIDC-Adapter einführen

Ziel: Wiederverwendbarer Adapter für Keycloak/Moodle.

- `OidcIdentityStrategy` für `sub`, `name`, Session-Claims.
- Provider-spezifische Unterschiede nur als Konfiguration:
  - Endpunkte
  - Claim-Mapping
  - Token/Nonce-Beschaffung

Ergebnis: Neue OIDC-Provider ohne Core-Änderung möglich.

## Phase 6: Kopierten Legacy-Code entfernen

Ziel: Doppelten Code kontrolliert abbauen.

- Alte direkte WordPress-Pfade in Client/Signer markieren.
- Nach erfolgreichem Vergleichstest schrittweise entfernen.
- Feature-Flags final auf Core umstellen und Altpfad löschen.

Ergebnis: Kein Copy/Paste-Stack mehr.

## 6. Test- und Abnahmestrategie

Pro Phase Pflicht:

- Vergleichstest Altpfad vs. Core-Pfad für dieselbe User-Session.
- Kritische Szenarien:
  - Erstzuordnung
  - Match
  - Mismatch
  - Rebind
  - Signer locked/unlocked
  - Backup save/load über Reload
- Adapter-Contract-Tests:
  - Jeder Adapter muss dieselben Contract-Tests bestehen.

Definition of Done pro Migrierungsschritt:

- kein funktionaler Regression in den Kernflows,
- keine Aufweichung von HTTPS-, Permission- oder Passwort-Schutz,
- keine neue externe Abhängigkeit ohne Freigabe,
- Doku-Update in `SIGNER_DOKU.md` und Fortschritt in `tasks/*.md`.

## 7. Konkrete Umsetzung im aktuellen Repo

Empfohlene erste 5 Commits:

1. `chore(architecture): add adapter contracts and feature flags`
2. `refactor(identity-link): move compare/bind flow into core use-cases`
3. `refactor(signer): extract signer core services from UI handlers`
4. `refactor(wordpress): implement wordpress adapter for identity/binding/backup`
5. `chore(cleanup): remove duplicated legacy paths after parity checks`

## 8. Risiken und Gegenmaßnahmen

- Risiko: Verdeckte Kopplungen zwischen UI und WordPress-REST.
  - Gegenmaßnahme: zuerst nur Wrapper schreiben, dann Logik verschieben.

- Risiko: Lock/Unlock-Flow im Signer wird instabil.
  - Gegenmaßnahme: Signer-Status als explizite State-Machine modellieren.

- Risiko: Cache-/SW-Effekte verfalschen Tests.
  - Gegenmaßnahme: `/wp-json` nie über SW cachen; API-Requests mit `no-store`.

## 9. Fortschritt

- [x] Strategie für Hexagonal + Strategy dokumentiert.
- [x] Phase 0 gestartet.
- [x] Phase 1 gestartet.
- [x] Phase 2 gestartet.
- [ ] Phase 3 gestartet.
- [ ] Phase 4 gestartet.
- [ ] Phase 5 gestartet.
- [ ] Phase 6 gestartet.

## 10. Umgesetzt am 2026-02-18

- [x] Strangler-Workspace `nostrclient/` angelegt, ohne bestehende Produktionspfade anzurühren.
- [x] Contracts angelegt unter `nostrclient/shared/adapter-contracts/*`.
- [x] Core-Skeleton angelegt unter:
  - `nostrclient/shared/identity-link-core/*`
  - `nostrclient/shared/signer-core/*`
- [x] WordPress-Strategien als Adapter-Skeleton angelegt unter:
  - `nostrclient/integrations/wordpress/adapter/*`
- [x] Neue Kompositions-Entry-Point angelegt:
  - `nostrclient/apps/identity-link/index.js`
- [x] Feature-Flag-Vorbereitung im bestehenden Identity-Link-Client gestartet:
  - `data-use-new-core`
  - `data-new-core-module-uri`
  - Fallback auf Legacy-Pfad bei nostrclient-Core-Fehler
- [x] Build-/Deployment-Strategie umgesetzt:
  - plattformunabhängiges npm/pnpm-Buildscript für ein zip-fähiges WordPress-Plugin-Artefakt
  - Dist-Ausgabe unter `dist/wordpress/`
- [x] Zusätzliche Dist-Artefakte für getrennte Deployment-Ziele eingeführt:
  - `dist/nostrclient/` via `build`
  - `dist/embedclients/` via `build:embedclients`
  - `dist/signer/` via `build:signer`
