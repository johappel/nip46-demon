# nip46-demon

NIP-46 Signer + Client Toolkit fuer Nostr-basierte Auth, Signatur und Identity-Link Flows.

Dieses Repository enthaelt:
- einen standalone Signer,
- einen konfigurierbaren Demo-Client,
- Embed-Clients,
- einen Identity-Link Client,
- ein WordPress Plugin fuer User<->Nostr-Key Binding,
- einen neuen Core-Ansatz (`nostrclient/`) nach Hexagonal + Strategy.

Hinweis: Detaillierte technische Doku bleibt in `SIGNER_DOKU.md`. Diese README ist der Einstieg und Build-Guide.

## Ziele

- Private Keys bleiben im Signer (Client sieht niemals den nsec).
- Kommunikation ueber NIP-46 und iframe/message bridge.
- Integrationen (WordPress heute, weitere Provider spaeter) ueber Adapter.
- Build-Artefakte fuer unterschiedliche Deployment-Szenarien.

## Repo-Struktur

```text
nip46-demon/
|- democlient/                               # konfigurierbarer Demo-Client
|- embedclients/                             # z.B. flotilla + identity-link embed Varianten
|- integrations/wordpress/nostr-identity-link/  # WordPress Plugin Source
|- nostrclient/                              # neuer Core (apps/shared/integrations)
|- scripts/                                  # Build-Skripte
|- dist/                                     # erzeugte Artefakte
|- signer.html
|- signer-nip46.js
|- signer-ui.css
|- signer-ui.js
|- sw.js
|- manifest.webmanifest
|- vendor/ndk-3.0.0.js
|- SIGNER_DOKU.md
|- Security.md
`- tasks/
```

## Build-Kommandos

Alle Build-Kommandos sind in `package.json` hinterlegt und laufen plattformunabhaengig mit Node.js.

| Kommando | Artefakt | Geeignet fuer |
|---|---|---|
| `npm run build` | `dist/nostrclient/nostrclient/` + `dist/nostrclient/nostrclient.zip` | Komplettes Standalone Bundle (Identity-Link + Signer + Core) fuer lokale End-to-End Tests oder als Ausgangspunkt fuer eigenes Hosting |
| `npm run build:democlient` | `dist/democlient/democlient/` + `dist/democlient/democlient.zip` | Nur Demo-Client Bundle ohne Signer-Artefakte, wenn ein externer Signer genutzt wird |
| `npm run build:embedclients` | `dist/embedclients/embedclients/` + `dist/embedclients/embedclients.zip` | Embed-Varianten (Flotilla/Identity-Link Embed) fuer Einbettung in bestehende UIs |
| `npm run build:signer` | `dist/signer/signer-standalone/` + `dist/signer/signer-standalone.zip` | Reines Signer Deployment (PWA-faehig), getrennt von Clients |
| `npm run build:identity-link:wordpress` | `dist/wordpress/nostr-identity-link-<version>.zip` | Installierbares WordPress Plugin ZIP fuer produktionsnahe Deployments |
| `npm run build:indenty-link:wordpress` | Alias auf `build:identity-link:wordpress` | Legacy-Tippfehler-Alias, kann fuer alte Workflows weiter genutzt werden |

## Welche Build-Variante wann?

1. Du willst alles lokal komplett testen:
`npm run build`

2. Du willst nur den Signer bereitstellen (z.B. eigener Signer Host):
`npm run build:signer`

3. Du willst nur den Demo-Client ausliefern und gegen einen externen Signer verbinden:
`npm run build:democlient`

4. Du brauchst ein fertiges WordPress Plugin ZIP:
`npm run build:identity-link:wordpress`

5. Du brauchst nur die Embed-Clients fuer Integration in vorhandene Frontends:
`npm run build:embedclients`

## Quick Start

### Voraussetzungen

- Node.js 18+ (empfohlen: aktuelle LTS)
- npm oder pnpm

### Build ausfuehren

```bash
npm run build
npm run build:democlient
npm run build:embedclients
npm run build:signer
npm run build:identity-link:wordpress
```

### Ergebnis pruefen

- Standalone Bundle Einstieg: `dist/nostrclient/nostrclient/index.html`
- Signer Standalone: `dist/signer/signer-standalone/signer.html`
- WordPress ZIP: `dist/wordpress/nostr-identity-link-<version>.zip`

## Deployment-Hinweise

### Standalone (`npm run build`)

- Liefert `identity-link/`, `core/`, `signer.html` und Assets in einem Bundle.
- Bridge Modul liegt in diesem Build unter `core/shared/nostr.js`.

### WordPress Plugin (`npm run build:identity-link:wordpress`)

- ZIP direkt in WordPress installierbar.
- Statische Assets werden ueber Plugin-Routen bereitgestellt (`/nostr/...`).
- Identity-Link Frontend nutzt den Core aus `public/nostrclient/...`.

### Demo-Client only (`npm run build:democlient`)

- Kein Signer im Paket.
- Sinnvoll fuer Setups mit bereits vorhandenem, separatem Signer-Endpunkt.

## Architektur (Kurzfassung)

- Neuer Core liegt unter `nostrclient/`.
- Zielbild: Hexagonal Architecture + Strategy Pattern.
- Integrationsspezifisches Verhalten lebt in Adaptern statt in kopierten Client-/Signer-Varianten.
- Stabilitäts-Update: Periodischer Heartbeat hält Signer-Relays im Desktop-Modus nun durchgehend aktiv.

Weitere Infos:
- Strategie: `tasks/ARCHITECTURE.md`
- Fortschritt: `tasks/IDENTITY_LINK_CLIENT_TASKLIST.md`, `tasks/RECODING.md`

## Sicherheit

- Schluesselmaterial bleibt lokal im Signer-Keyring.
- Transport fuer produktive Nutzung nur ueber HTTPS.
- Weitere Details und Grenzen: `Security.md`.

## Weiterfuehrende Doku

- Hauptdoku: `SIGNER_DOKU.md`
- Sicherheitsstatus: `Security.md`
- Architektur/Refactor-Plan: `tasks/ARCHITECTURE.md`

## Lizenz

CC0.