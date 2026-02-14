# NIP-46 Signer Demo – Popupfreie Nostr-Authentifizierung für Webseiten

> **Template für einen benutzerfreundlichen Remote-Signer & Bunker-Dienst**
> 
> Zeigt wie man ein **dezentrales Authentifizierungssystem** über **NIP-46** in bestehende Webseiten (WordPress, Jekyll, etc.) integriert – ohne Popup-Flut und mit vollem Benutzer-Kontroll.

## 🎯 Was ist NIP-46?

**NIP-46** (Nostr Implementation Possibilities) definiert ein **Remote-Signing-Protokoll** für Nostr:

- **Sichere Schlüsselverwaltung**: Der private Schlüssel (nsec) bleibt lokal auf einem Signer-Server
- **Sichere Authentifizierung**: Clients fordern Signaturen an, ohne jemals den nsec zu sehen
- **Dezentral**: Keine Zentralserver nötig – jeder kann seinen eigenen Bunker betreiben
- **NIP-7 kompatibel**: Funktioniert mit bestehenden Nostr-Apps via standardisierter API

Dieses Projekt zeigt die praktische Umsetzung mit:
- **Frontend** (`mpv-nostr-client.html`) – Plugin für Webseiten zur Authentifizierung
- **Backend** (`signer.html`) – Bunker/Signer für sichere Schlüsselverwaltung

## 🏗️ Architektur

```
┌─────────────────────────────────────────┐
│  Webseite (WordPress, Jekyll, etc.)     │
│  ┌──────────────────────────────────┐   │
│  │  mpv-nostr-client.html (iframe)  │   │
│  │  ├─ Authentifizierung über NIP-46│   │
│  │  │  (Bunker)                     │   │
│  │  └─ Fallback zu NIP-7 (Browser)  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
          ↓ PostMessage Bridge
┌─────────────────────────────────────────┐
│  signer.html (separater Server/Window)  │
│  ┌──────────────────────────────────┐   │
│  │  Bunker/NIP-46 Backend           │   │
│  │  ├─ Keyring (verschlüsselte Keys)│   │
│  │  ├─ Permission System            │   │
│  │  └─ NIP-46 RPC Server            │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
          ↓ WebSocket (NDK)
┌─────────────────────────────────────────┐
│  Nostr Relays                           │
│  (wss://relay.damus.io, ...)            │
└─────────────────────────────────────────┘
```

## 📋 Features

### ✅ Benutzerfreundlich
- **Keine nervigen Pop-ups** – Authentifizierung läuft im Hintergrund
- **Responsive UI** – Funktioniert auf Desktop & Mobile
- **Mehrsprachig** – Deutsche Benutzerführung
- **Auto-Resize** – iframe passt sich automatisch an Höhe an

### 🔒 Sicherheit
- **AES-256-GCM Verschlüsselung** – nsec wird verschlüsselt gespeichert
- **PBKDF2-SHA256** (210.000 Iterationen) – Starke Passworthashing
- **Origin-Validierung** – PostMessage nur mit erwarteten Origins
- **Session & TTL Caching** – Optionales Passwort-Caching mit Ablauf
- **Permission System** – Benutzer kontrolliert welche Clients was dürfen

### 🔧 Entwickler-freundlich
- **Template-Code** – Einfach kopieren & anpassen
- **Vollständig dokumentiert** – JSDoc Comments für alle Funktionen
- **Modular** – Bridge Pattern, Adapter Pattern, Storage Abstraction
- **Erweiterbar** – Neue Funktionen leicht hinzufügbar
  - WordPress User Bindings (WP User → Nostr Key)
  - Multi-Key Management
  - Keyring Password Changes
  - Custom Permission Policies

### 🌐 Integrations-ready
- **WordPress Plugin Template** – Webseite kann Client iframe laden
- **Jekyll Integration** – Static Sites können Authentifizierung nutzen
- **Beliebige HTTP-Server** – Einfach HTML-Datei servieren
- **Browser Extension Fallback** – Funktioniert auch mit NIP-7 Extensions

## 📦 Projektstruktur

```
nip46-demon/
├── README.md                      ← Du liest gerade hier
├── signer.html                    ← NIP-46 Bunker/Signer Backend
│   ├─ Keyring Management
│   ├─ AES-GCM Encryption
│   ├─ Bech32 nsec Generation
│   ├─ Permission System
│   ├─ NIP-46 RPC Backend
│   └─ Frame Auto-Resize Bridge
│
├── mpv-nostr-client.html          ← Client für Webseiten-Integration
│   ├─ NIP-7 Detection & Fallback
│   ├─ NIP-46 Connection
│   ├─ NDK Integration
│   ├─ Relay Management
│   └─ User Session Management
│
├── tests/
│   ├── signer.html                ← Standalone signer test
│   └── sendevent.html             ← Test event publishing
│
├── mpv-nostr-client.html           ← Standalone client demo
└── SIGNER_DOKU.md                 ← Technische Dokumentation
```

## 🚀 Quick Start

### 1. Signer-Server starten

```bash
# Option A: Mit lokaler HTTP-Server (Python)
python3 -m http.server 8000

# Option B: Mit Node.js
npx http-server

# Dann öffnen: http://localhost:8000/signer.html
```

Die **signer.html Seite** wird:
1. Dich auffordern einen **nsec einzugeben oder zu generieren**
2. Ein **Passwort zu setzen** (mit Bestätigung)
3. Schlüssel **verschlüsselt** speichern
4. NIP-46 **RPC Server starten** auf den Standard-Relays

**Connection Info merken:**
```
Bunker URI: bunker://abc123...?relay=wss://relay.damus.io&...
Nostrconnect URI: nostrconnect://abc123...?relay=wss://relay.damus.io&...
```

### 2. Client in Webseite einbetten

In deine WordPress / Jekyll / HTML-Seite:

```html
<!-- Nostr Authentifizierung (NIP-46) -->
<div id="nostr-auth" style="border: 1px solid #ccc; padding: 10px; margin: 20px 0;">
  <h3>Mit Nostr anmelden</h3>
  <iframe 
    id="signer-iframe"
    src="http://localhost:8000/mpv-nostr-client.html?parentOrigin=https://example.com"
    style="width:100%; height:500px; border:none; border-radius:8px;"
  ></iframe>
</div>

<script>
// Auf Nostr-Events lauschen
window.addEventListener('message', (event) => {
  if (event.data?.source === 'nip46-signer-bridge') {
    console.log('Nostr Event:', event.data.type, event.data.payload);
    
    if (event.data.type === 'ready') {
      // Signer ist bereit!
      console.log('Bunker URI:', event.data.payload.bunkerUri);
      console.log('User pubkey:', event.data.payload.pubkey);
      // Benutzer im Backend authentifizieren
    }
  }
});
</script>
```

### 3. Im Backend User authentifizieren

```php
// WordPress Plugin Template
add_action('rest_api_init', function() {
  register_rest_route('nostr', '/auth', array(
    'methods' => 'POST',
    'callback' => function($request) {
      $bunker_uri = $request->get_json_params()['bunkerUri'] ?? null;
      $pubkey = $request->get_json_params()['pubkey'] ?? null;
      
      if (!$pubkey) {
        return new WP_Error('missing_pubkey', 'Pubkey fehlt');
      }
      
      // Benutzer mit Nostr-Pubkey als eindeutige ID erstellen/laden
      $user = get_user_by('login', 'nostr_' . substr($pubkey, 0, 16));
      
      if (!$user) {
        // Neuer Benutzer
        $user_id = wp_create_user(
          'nostr_' . substr($pubkey, 0, 16),
          wp_generate_password(),
          'nostr+' . substr($pubkey, 0, 8) . '@example.com'
        );
        $user = get_user_by('ID', $user_id);
      }
      
      // Session/JWT erstellen
      wp_set_current_user($user->ID);
      wp_set_auth_cookie($user->ID);
      
      return array(
        'success' => true,
        'user_id' => $user->ID,
        'pubkey' => $pubkey
      );
    }
  ));
});
```

## 🔌 Integration Szenarien

### WordPress Plugin

```php
<?php
/**
 * Plugin Name: Nostr Authentication
 * Description: NIP-46 Authentifizierung für WordPress
 */

// In functions.php oder plugin file:
function enqueue_nostr_client() {
  wp_enqueue_script('nostr-client', plugins_url('mpv-nostr-client.html', __FILE__));
}
add_action('wp_enqueue_scripts', 'enqueue_nostr_client');

// Shortcode für iframe-Embedding
function nostr_auth_shortcode() {
  $home_url = esc_url(home_url());
  return sprintf(
    '<iframe src="%s/signer.html?parentOrigin=%s" style="width:100%%;" />',
    $_SERVER['SERVER_NAME'] === 'localhost' ? 'http://localhost:8000' : 'https://signer.example.com',
    urlencode($home_url)
  );
}
add_shortcode('nostr_auth', 'nostr_auth_shortcode');
```

Dann nutzen:
```
[nostr_auth]
```

### Jekyll Static Site

```html
<!-- _includes/nostr_auth.html -->
<div id="nostr-login">
  <h2>Nostr Login</h2>
  <iframe 
    id="signer-frame"
    src="{{ site.nostr_signer_url }}/mpv-nostr-client.html?parentOrigin={{ site.url }}"
    style="width: 100%; height: 600px; border: 1px solid #ddd;"
  ></iframe>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'ready') {
      // Mit API authentifizieren
      fetch('/.netlify/functions/nostr-auth', {
        method: 'POST',
        body: JSON.stringify({
          pubkey: event.data.payload.pubkey,
          bunkerUri: event.data.payload.bunkerUri
        })
      })
      .then(r => r.json())
      .then(data => {
        localStorage.setItem('nostr_pubkey', data.pubkey);
        window.location.href = '/dashboard';
      });
    }
  });
});
</script>
```

In `_config.yml`:
```yaml
nostr_signer_url: https://signer.example.com
```

### Netlify Function (JAMstack)

```javascript
// functions/nostr-auth.js
export const handler = async (event) => {
  const { pubkey, bunkerUri } = JSON.parse(event.body);
  
  if (!pubkey) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing pubkey' })
    };
  }
  
  // Benutzer in DB erstellen/laden
  // (z.B. mit Supabase, Firebase, etc.)
  
  // JWT token generieren
  const token = generateJWT({ pubkey, sub: pubkey });
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      pubkey,
      token,
      bunkerUri
    })
  };
};
```

## 🔐 Sicherheits-Best Practices

### Für den Signer (Backend)

✅ **DO:**
- Nur über HTTPS bereitstellen (selbst-signierte Certs im dev ok)
- `parentOrigin` Parameter verwenden um Origin zu validieren
- Regelmäßig Passwörter erneuern
- Logs für alle Genehmigungen speichern

❌ **DON'T:**
- nsec im Klartext speichern
- `*` als allowed origin verwenden
- Beliebig lange TTL-Genehmigungen geben
- Logs löschen ohne Backups

### Für den Client (Frontend)

✅ **DO:**
- HTTPS für signer.html verwenden
- Origin-Parameter setzen: `?parentOrigin=https://example.com`
- Nutzer regelmäßig auf Entsperrung fragen
- Sessions nach Inaktivität clearen

❌ **DON'T:**
- Passwort im `localStorage` speichern
- NIP-46 URI direkt im Code einbetten
- User ohne Bestätigung Genehmigungen geben

## 📝 Customization

### Relays ändern

In `signer.html` (Line ~30):
```javascript
const RELAYS = [
  "wss://relay.custom.com",  // ← Deine Relays
  "wss://backup.custom.com"
];
```

### Genehmigungen konfigurieren

In `signer.html` (Line ~40):
```javascript
// Diese Methoden werden automatisch erlaubt (kein Popup)
const AUTO_ALLOW_METHODS = new Set([
  "connect",
  "ping",
  "get_public_key"
]);

// Diese brauchen User-Bestätigung
const SENSITIVE_METHODS = new Set([
  "sign_event",
  "nip04_encrypt",
  "nip04_decrypt"
]);
```

### WordPress User Bindings

Feature für WordPress: Jeder WP-User bekommt automatisch einen Nostr-Schlüssel:

```javascript
// In mpv-nostr-client.html:
const wpUserId = new URLSearchParams(location.search).get('wpUserId');
if (wpUserId) {
  // Signer erstellt/lädt automatisch Key für diesen WP-User
  // Bindung: WordPress User → Nostr Pubkey
}
```

## 🧪 Testing

### Standalone Signer-Test

```bash
# Terminal 1: signer.html öffnen
open http://localhost:8000/signer.html

# Schlüssel génériert und Passwort setzen
# Dann: Connection Info kopieren
```

### Client-Integration testen

```bash
# Terminal 2: Client mit Signer verbinden
open "http://localhost:8000/mpv-nostr-client.html?parentOrigin=http://localhost:8000"

# Sollte Bunker URI und Ready-Message zeigen
```

### Event Publishing testen

```bash
open http://localhost:8000/tests/sendevent.html

# Mit dem Signer ein Event signieren und publishen
```

## 📚 Dokumentation

- `SIGNER_DOKU.md` – Technische Details zu Encryption, Keyring, Bech32
- Inline JSDoc Comments – In `signer.html` und `mpv-nostr-client.html`
- `idea.md` – Ursprüngliche Projekt-Ideen

## 🤝 Häufige Fragen

### F: Kann ich meinen eigenen nsec verwenden?
**A:** Ja! Bei Setup eingeben oder in Schlüsselverwaltung hinzufügen. Wird immer verschlüsselt gespeichert.

### F: Ist das production-ready?
**A:** Das ist ein **Template/Demo**. Für Production:
- HTTPS verwenden
- Regelmäßig Security Audits
- Monitoring für Permission-Logs
- Backup-Strategie für Keyring
- Rate-Limiting auf RPC-Anfragen

### F: Kann ich mehrere Schlüssel speichern?
**A:** Ja! "Schlüsselverwaltung" Tab → "Neuen Schlüssel speichern"

### F: Funktioniert das mit {Browser Extension X}?
**A:** Das Projekt versucht zuerst NIP-46 (Bunker) zu nutzen. Falls nicht vorhanden, fallback auf NIP-7 (Browser Extension). So funktioniert es mit **allen** Nostr-Extensions.

### F: Kann ich das in meinen bestehenden Monolithen integrieren?
**A:** Absolutely! 
- WordPress: Als Plugin mit Shortcode
- Django: Als iframe-View
- Ruby on Rails: Als Stimulus-Komponente
- ASP.NET: Als Razor Component

## 🚨 Bekannte Limitationen

1. **RPC Relays offline** – Wenn alle Relays offline sind, funktioniert NIP-46 nicht
   - **Fix:** Fallback auf andere Relays in der URI
   
2. **No Private Key Export** – nsec wird X-verschlüsselt gespeichert
   - **Feature:** Export am Bunker selbst, nicht über Browser-API
   
3. **Browser Local Storage** – Passwort-Cache läuft mit Browser-Daten
   - **Feature:** TTL-Optionen für Session, 15m, 1h

## 📦 Abhängigkeiten

- **NDK** (Nostr Development Kit) – Von esm.sh
  - WebCrypto API (AES-GCM, PBKDF2)
  - BIP32 (falls implementiert)
  - Keine externen npm-Module nötig!

## 🎓 Bildungs-Ressourcen

- [NIP-46 Spezifikation](https://github.com/nostr-protocol/nips/blob/master/46.md)
- [NIP-07 Browser Extension](https://github.com/nostr-protocol/nips/blob/master/07.md)
- [NDK Dokumentation](https://ndk.nostr.com/)
- [Nostr Protocol](https://nostr.com/)

## 📄 Lizenz

CC0. Dieses Projekt ist ein **Educational Template**. Nutze es frei für deine Projekte!

## 🤝 Beiträge

Verbesserungen willkommen! Vor allem:
- Neue language-Unterstützung
- Weitere Integrations-Beispiele
- Security Audit Feedback
- Performance-Optimierungen



