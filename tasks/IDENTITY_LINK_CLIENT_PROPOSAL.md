# Proposal: Identity-Link Client (SSO User <-> Nostr Key)

Stand: 2026-02-17

## 1. Ausgangslage

Im Projekt existieren bereits:

- `democlient/` als generischer NIP-46 Referenzclient.
- `embedclients/flotilla/` als anwendungsnaher Embed-Client.
- Eine Signer-Bridge-Funktion fuer WordPress-User-Bindings (`wp-ensure-user-key`) in `signer-nip46.js`.

Ziel ist ein zusaetzlicher Client, der eine backendgestuetzte User-Identitaet (WordPress, Keycloak, Moodle) mit einem Nostr-Schluessel verknuepft und Inkonsistenzen zwischen gespeicherter Zuordnung und aktuellem Signer-Zustand erkennt.

## 2. Problemstellung

Ohne zentralen Abgleich entstehen Inkonsistenzen:

- Signer-Bindings sind lokal browsergebunden (`localStorage`) und damit geraete-/profilabhaengig.
- Backend-Systeme fuehren User zentral und erwarten eine stabile Zuordnung.
- Ein User kann dadurch je nach Browserprofil unterschiedliche Nostr-Pubkeys verwenden.

Folge: Identitaetsdrift, fehlerhafte Zuordnung und potenziell falsche Signaturen im App-Kontext.

## 3. Zielbild

Ein neuer Client `embedclients/identity-link/` soll:

1. den eingeloggten SSO-User aus einem Backend-Kontext beziehen,
2. einen zugeordneten Nostr-Key im Signer sicherstellen (create/find),
3. den aus dem Signer gelieferten Pubkey mit dem im Backend gespeicherten Pubkey vergleichen,
4. bei Abweichung einen klaren Konflikt-Hinweis zeigen,
5. gefuehrte Konfliktaufloesung anbieten,
6. nur bei konsistenter Zuordnung weiter in den Signaturbetrieb gehen.

## 4. Scope

In Scope:

- Neuer Embed-Client fuer Identity-Linking.
- Provider-neutrales User-Identitaetsmodell (`provider`, `subject`, `displayName`).
- WordPress-first Bridge-Nutzung (`wp-ensure-user-key`) als erster Integrationspfad.
- Mismatch-Detection und Konflikt-UI.
- Dokumentation in `SIGNER_DOKU.md`.

Out of Scope (Phase 1):

- Vollstaendige produktive Backend-Implementierung fuer alle Systeme.
- Neue externe Libraries/Dependencies.
- Tiefgreifendes Redesign des bestehenden Signer-Key-Managements.

## 5. Architekturvorschlag

### 5.1 Komponenten

- Identity-Link Client (`embedclients/identity-link/`)
- Signer iframe (bestehend)
- App-Backend (WordPress/Keycloak/Moodle Adapter-Endpunkte)

### 5.2 Datenmodell (kanonisch)

- `identityProvider`: `wordpress | keycloak | moodle`
- `identitySubject`: stabiler externer User-Identifier (z. B. WP-User-ID, Keycloak-Sub)
- `expectedPubkey`: im Backend gespeicherter Nostr-Pubkey (optional bei Erstzuordnung)
- `signerPubkey`: vom Signer fuer den User ermittelter Pubkey
- `bindingStatus`: `unbound | matched | mismatched`

### 5.3 Ablauf (Happy Path)

1. Client laedt Session-Identity vom Backend.
2. Client fordert vom Signer User-Key an (zunaechst WordPress-Bridge-Flow).
3. Signer liefert `pubkey`/`npub` und Binding-Metadaten.
4. Client gleicht mit `expectedPubkey` ab.
5. Falls kein `expectedPubkey`: Erstzuordnung im Backend speichern.
6. Falls Match: Zustand `matched` -> Signierfunktionen freigeben.

### 5.4 Ablauf (Mismatch)

1. Backend `expectedPubkey` != `signerPubkey`.
2. Client zeigt Warnstatus mit klaren Werten (gekuezte und vollstaendige Keys).
3. Nutzer/Admin waehlt eine Aufloesungsaktion:
   - auf verknuepften Signer-Key wechseln (Bridge-Erweiterung noetig),
   - Backend auf aktuellen Signer-Pubkey aktualisieren,
   - abbrechen.
4. Nach erfolgreicher Aufloesung erneuter Abgleich.

### 5.5 Adapter-Strategie (Provider + OIDC)

- Gemeinsamer Core fuer Signer-Flow, Pubkey-Abgleich, Statusmodell und Konfliktbehandlung.
- Duenne Provider-Adapter nur fuer provider-spezifische Backend-/Identity-Details.
- Ein gemeinsamer `oidcAdapter` fuer OIDC-nahe Systeme (z. B. Keycloak, Moodle mit OIDC).
- Eigene Adapter fuer CMS-spezifische Patterns (z. B. WordPress, Drupal).

Vorgeschlagenes Adapter-Interface:

- `getIdentity(context): Promise<{ provider, subject, displayName, expectedPubkey }>`
- `normalizeSubject(rawSubject): string`
- `bindIdentityPubkey(input): Promise<{ ok, expectedPubkey }>`
- `rebindIdentityPubkey(input): Promise<{ ok, expectedPubkey }>`
- `mapApiError(error): { code, message, retryable }`

Ziel: neue Provider ohne Core-Umbau ergaenzen und `if/else`-Verzweigungen im Client vermeiden.

## 6. Sicherheits- und Betriebsaspekte

- Keine Uebernahme unsicherer Transportpfade (HTTPS-Checks wie bestehend beibehalten).
- Nur serverseitig verifizierte Session-Identity verwenden, keine freie User-ID-Eingabe.
- Konfliktaufloesungen auditen (wer, wann, welcher alter/neuer Pubkey).
- Keine Lockerung bestehender Signer-Permission-Logik.

## 7. Umsetzung in Stufen

Phase 1 (MVP):

- Neuer Identity-Link Client.
- WordPress-basierter Ensure-Key Flow.
- Pubkey-Abgleich gegen Backend-Wert.
- Konfliktanzeige ohne automatischen Schluesselwechsel.

Phase 2:

- Bridge-Erweiterung fuer gezielten Schluesselwechsel auf gebundenen Key.
- Provider-Adapter fuer Keycloak/Moodle/Drupal.
- Erweiterte Admin-/Recovery-Flows.

## 8. Akzeptanzkriterien

- Bei fehlender Backend-Zuordnung wird ein Signer-Pubkey erzeugt/geladen und persistiert.
- Bei passender Zuordnung ist der Client signierbereit.
- Bei Abweichung wird Signieren blockiert und ein klarer Konflikthinweis gezeigt.
- Konflikt kann ueber definierten Prozess aufgeloest werden.
- Doku in `SIGNER_DOKU.md` aktualisiert.

## 9. Offene Punkte

- Soll Phase 1 bereits einen aktiven Signer-Key-Switch unterstuetzen oder nur Mismatch melden?
- Wer darf Backend-Rebinding ausfuehren (Enduser vs. Admin-Rolle)?
- Wie strikt soll `identitySubject` normalisiert werden (provider-spezifische Regeln)?
- Soll fuer OIDC-Provider ein einziger konfigurierbarer Adapter genuegen oder pro Provider ein eigener Wrapper bestehen?
