<?php
/**
 * Plugin Name: NIP-46 Identity Link
 * Description: Stellt REST-Endpunkte fuer die Verknuepfung von WordPress-Usern mit Nostr-Pubkeys bereit.
 * Version: 0.1.0
 * Requires at least: 6.2
 * Requires PHP: 8.0
 * Author: NIP-46 Demo
 */

if (!defined('ABSPATH')) {
    exit;
}

const NIP46_IDENTITY_LINK_REST_NAMESPACE = 'identity-link/v1';
const NIP46_IDENTITY_LINK_PROVIDER = 'wordpress';
const NIP46_IDENTITY_LINK_META_PUBKEY = 'nip46_identity_link_pubkey';
const NIP46_IDENTITY_LINK_META_NPUB = 'nip46_identity_link_npub';
const NIP46_IDENTITY_LINK_META_KEY_ID = 'nip46_identity_link_key_id';
const NIP46_IDENTITY_LINK_META_UPDATED_AT = 'nip46_identity_link_updated_at';
const NIP46_IDENTITY_LINK_AUDIT_OPTION = 'nip46_identity_link_audit_log_v1';
const NIP46_IDENTITY_LINK_AUDIT_LIMIT = 200;
const NIP46_IDENTITY_LINK_SHORTCODE_TAG = 'nip46_identity_link_client';
const NIP46_IDENTITY_LINK_SHORTCODE_DEFAULT_IFRAME_HEIGHT = 960;
const NIP46_IDENTITY_LINK_REWRITE_QUERY_VAR = 'nip46_nostr_path';
const NIP46_IDENTITY_LINK_REWRITE_BASE = 'nostr';
const NIP46_IDENTITY_LINK_PUBLIC_DIR = 'public';

/**
 * Aktiviert das Plugin und initialisiert den Audit-Speicher, falls noch nicht vorhanden.
 *
 * @return void
 */
function nip46IdentityLinkActivatePlugin(): void
{
    $existing = get_option(NIP46_IDENTITY_LINK_AUDIT_OPTION, null);
    if (!is_array($existing)) {
        add_option(NIP46_IDENTITY_LINK_AUDIT_OPTION, [], '', false);
    }

    nip46IdentityLinkRegisterRewriteRules();
    flush_rewrite_rules();
}

/**
 * Deaktiviert das Plugin und leert Rewrite-Regeln.
 *
 * @return void
 */
function nip46IdentityLinkDeactivatePlugin(): void
{
    flush_rewrite_rules();
}

/**
 * Registriert die REST-Routen des Plugins.
 *
 * @return void
 */
function nip46IdentityLinkRegisterRoutes(): void
{
    register_rest_route(
        NIP46_IDENTITY_LINK_REST_NAMESPACE,
        '/session',
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'nip46IdentityLinkHandleSession',
            'permission_callback' => 'nip46IdentityLinkCanReadSession'
        ]
    );

    register_rest_route(
        NIP46_IDENTITY_LINK_REST_NAMESPACE,
        '/bind',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nip46IdentityLinkHandleBind',
            'permission_callback' => 'nip46IdentityLinkCanWriteBinding'
        ]
    );

    register_rest_route(
        NIP46_IDENTITY_LINK_REST_NAMESPACE,
        '/rebind',
        [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => 'nip46IdentityLinkHandleRebind',
            'permission_callback' => 'nip46IdentityLinkCanWriteBinding'
        ]
    );
}

/**
 * Registriert die Rewrite-Regeln fuer `/nostr/...` Pfade.
 *
 * @return void
 */
function nip46IdentityLinkRegisterRewriteRules(): void
{
    add_rewrite_rule(
        '^' . NIP46_IDENTITY_LINK_REWRITE_BASE . '/?$',
        'index.php?' . NIP46_IDENTITY_LINK_REWRITE_QUERY_VAR . '=__index__',
        'top'
    );
    add_rewrite_rule(
        '^' . NIP46_IDENTITY_LINK_REWRITE_BASE . '/(.+)$',
        'index.php?' . NIP46_IDENTITY_LINK_REWRITE_QUERY_VAR . '=$matches[1]',
        'top'
    );
}

/**
 * Registriert die benoetigte Query-Variable fuer Rewrite-Auswertung.
 *
 * @param array<int,string> $queryVars Vorhandene Query-Variablen.
 * @return array<int,string> Erweiterte Query-Variablen.
 */
function nip46IdentityLinkRegisterQueryVars(array $queryVars): array
{
    if (!in_array(NIP46_IDENTITY_LINK_REWRITE_QUERY_VAR, $queryVars, true)) {
        $queryVars[] = NIP46_IDENTITY_LINK_REWRITE_QUERY_VAR;
    }
    return $queryVars;
}

/**
 * Liefert statische Plugin-Dateien fuer `/nostr/...` Requests aus.
 *
 * @return void
 */
function nip46IdentityLinkMaybeServePublicRoute(): void
{
    $rawRoutePath = (string) get_query_var(NIP46_IDENTITY_LINK_REWRITE_QUERY_VAR, '');
    if ($rawRoutePath === '') {
        return;
    }

    if ($rawRoutePath === '__index__') {
        $targetUrl = home_url('/' . NIP46_IDENTITY_LINK_REWRITE_BASE . '/identity-link/');
        wp_safe_redirect($targetUrl, 302);
        exit;
    }

    $normalizedRoutePath = nip46IdentityLinkNormalizePublicPath($rawRoutePath);
    if ($normalizedRoutePath === '') {
        status_header(404);
        exit;
    }

    if (
        nip46IdentityLinkIsDirectoryPublicRoute($normalizedRoutePath) &&
        !nip46IdentityLinkCurrentRequestHasTrailingSlash()
    ) {
        $targetUrl = nip46IdentityLinkBuildPublicDirectoryUrl($normalizedRoutePath);
        wp_safe_redirect($targetUrl, 302);
        exit;
    }

    $aliasedRoutePath = nip46IdentityLinkApplyPublicPathAliases($normalizedRoutePath);
    if (nip46IdentityLinkRouteRequiresAuthentication($aliasedRoutePath) && !is_user_logged_in()) {
        $loginUrl = wp_login_url(nip46IdentityLinkGetCurrentRequestUrl());
        wp_safe_redirect($loginUrl, 302);
        exit;
    }

    $resolvedFilePath = nip46IdentityLinkResolvePublicFilePath($rawRoutePath);
    if ($resolvedFilePath === '') {
        status_header(404);
        exit;
    }

    nip46IdentityLinkSendPublicFile($resolvedFilePath);
    exit;
}

/**
 * Loest einen Rewrite-Pfad in einen physischen Dateipfad unter `public/` auf.
 *
 * @param string $routePath Der Rewrite-Pfad.
 * @return string Der absolute Dateipfad oder leerer String.
 */
function nip46IdentityLinkResolvePublicFilePath(string $routePath): string
{
    $normalizedRoutePath = nip46IdentityLinkNormalizePublicPath($routePath);
    if ($normalizedRoutePath === '') {
        return '';
    }

    $normalizedRoutePath = nip46IdentityLinkApplyPublicPathAliases($normalizedRoutePath);
    if ($normalizedRoutePath === '') {
        return '';
    }

    if ($normalizedRoutePath === 'signer') {
        $normalizedRoutePath = 'signer/index.html';
    } elseif ($normalizedRoutePath === 'identity-link') {
        $normalizedRoutePath = 'identity-link/index.html';
    }

    if (!nip46IdentityLinkIsAllowedPublicPath($normalizedRoutePath)) {
        return '';
    }

    $baseDir = realpath(plugin_dir_path(__FILE__) . NIP46_IDENTITY_LINK_PUBLIC_DIR);
    if (!is_string($baseDir) || $baseDir === '') {
        return '';
    }

    $candidatePath = realpath($baseDir . DIRECTORY_SEPARATOR . $normalizedRoutePath);
    if (!is_string($candidatePath) || $candidatePath === '') {
        return '';
    }

    $baseDirWithSeparator = rtrim($baseDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($candidatePath, $baseDirWithSeparator) !== 0) {
        return '';
    }

    if (!is_file($candidatePath) || !is_readable($candidatePath)) {
        return '';
    }

    return $candidatePath;
}

/**
 * Normalisiert einen Rewrite-Pfad und verhindert Path-Traversal.
 *
 * @param string $routePath Der rohe Rewrite-Pfad.
 * @return string Der normalisierte Pfad oder leerer String.
 */
function nip46IdentityLinkNormalizePublicPath(string $routePath): string
{
    $path = trim($routePath);
    $path = str_replace('\\', '/', $path);
    $path = trim($path, '/');
    if ($path === '') {
        return '';
    }

    $parts = explode('/', $path);
    $cleanParts = [];
    foreach ($parts as $part) {
        $segment = trim($part);
        if ($segment === '' || $segment === '.' || $segment === '..') {
            return '';
        }
        $cleanParts[] = $segment;
    }

    return implode('/', $cleanParts);
}

/**
 * Wendet bekannte Alias-Pfade auf Public-Routen an.
 * Damit bleiben Modulpfade robust, falls der Browser eine URL mit
 * unerwuenschtem Slash-Suffix als Verzeichnis aufloest.
 *
 * @param string $normalizedPath Der normalisierte Pfad.
 * @return string Der ggf. umgeschriebene Pfad.
 */
function nip46IdentityLinkApplyPublicPathAliases(string $normalizedPath): string
{
    $aliases = [
        'identity-link/democlient/' => 'democlient/',
        'identity-link/vendor/' => 'vendor/',
        'identity-link/signer/' => 'signer/',
        'signer-ui.css' => 'signer/signer-ui.css',
        'signer-ui.js' => 'signer/signer-ui.js',
        'signer-nip46.js' => 'signer/signer-nip46.js',
        'manifest.webmanifest' => 'signer/manifest.webmanifest',
        'icons/' => 'signer/icons/'
    ];

    foreach ($aliases as $fromPrefix => $toPrefix) {
        if (strpos($normalizedPath, $fromPrefix) === 0) {
            return $toPrefix . substr($normalizedPath, strlen($fromPrefix));
        }
    }

    return $normalizedPath;
}

/**
 * Prueft, ob ein Public-Pfad eine "Verzeichnisroute" ist.
 * Diese Routen sollen kanonisch mit trailing slash aufgerufen werden.
 *
 * @param string $normalizedPath Der normalisierte Pfad.
 * @return bool True, wenn der Pfad als Verzeichnisroute behandelt wird.
 */
function nip46IdentityLinkIsDirectoryPublicRoute(string $normalizedPath): bool
{
    return in_array($normalizedPath, ['signer', 'identity-link'], true);
}

/**
 * Prueft, ob die aktuelle Request-URL bereits mit trailing slash endet.
 *
 * @return bool True, wenn der aktuelle Request-Pfad auf `/` endet.
 */
function nip46IdentityLinkCurrentRequestHasTrailingSlash(): bool
{
    $requestUri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '';
    if ($requestUri === '') {
        return false;
    }

    $requestPath = (string) wp_parse_url($requestUri, PHP_URL_PATH);
    if ($requestPath === '') {
        return false;
    }

    return substr($requestPath, -1) === '/';
}

/**
 * Baut die kanonische URL fuer eine Public-Verzeichnisroute.
 * Query-Parameter der aktuellen Anfrage werden uebernommen.
 *
 * @param string $normalizedPath Der normalisierte Verzeichnispfad.
 * @return string Absolute Ziel-URL mit trailing slash.
 */
function nip46IdentityLinkBuildPublicDirectoryUrl(string $normalizedPath): string
{
    $targetPath = '/' . NIP46_IDENTITY_LINK_REWRITE_BASE . '/' . trim($normalizedPath, '/') . '/';
    $targetUrl = home_url($targetPath);
    $query = isset($_SERVER['QUERY_STRING']) ? trim((string) $_SERVER['QUERY_STRING']) : '';
    if ($query !== '') {
        $targetUrl .= '?' . $query;
    }
    return $targetUrl;
}

/**
 * Prueft, ob ein Public-Route-Ziel einen eingeloggten User erfordert.
 *
 * @param string $normalizedPath Der normalisierte/aliasierte Pfad.
 * @return bool True, wenn Login erforderlich ist.
 */
function nip46IdentityLinkRouteRequiresAuthentication(string $normalizedPath): bool
{
    $routesNeedingAuth = [
        'identity-link',
        'identity-link/index.html',
        'signer',
        'signer/index.html'
    ];

    return in_array($normalizedPath, $routesNeedingAuth, true);
}

/**
 * Ermittelt die aktuelle Request-URL fuer Login-Redirects.
 *
 * @return string Absolute URL der aktuellen Anfrage.
 */
function nip46IdentityLinkGetCurrentRequestUrl(): string
{
    $requestUri = isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '/';
    $requestUri = $requestUri !== '' ? $requestUri : '/';
    return home_url($requestUri);
}

/**
 * Prueft, ob ein normalisierter Pfad in der Public-Allowlist liegt.
 *
 * @param string $normalizedPath Der normalisierte Pfad.
 * @return bool True, wenn der Pfad auslieferbar ist.
 */
function nip46IdentityLinkIsAllowedPublicPath(string $normalizedPath): bool
{
    $allowedPrefixes = ['signer/', 'identity-link/', 'democlient/', 'vendor/'];
    if (in_array($normalizedPath, ['signer', 'identity-link'], true)) {
        return true;
    }

    foreach ($allowedPrefixes as $prefix) {
        if (strpos($normalizedPath, $prefix) === 0) {
            return true;
        }
    }

    return false;
}

/**
 * Ermittelt den MIME-Type anhand der Dateiendung.
 *
 * @param string $filePath Der Dateipfad.
 * @return string MIME-Type inkl. Charset falls passend.
 */
function nip46IdentityLinkResolveMimeType(string $filePath): string
{
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $map = [
        'html' => 'text/html; charset=UTF-8',
        'js' => 'application/javascript; charset=UTF-8',
        'css' => 'text/css; charset=UTF-8',
        'json' => 'application/json; charset=UTF-8',
        'png' => 'image/png',
        'svg' => 'image/svg+xml'
    ];

    if (isset($map[$extension])) {
        return $map[$extension];
    }

    return 'application/octet-stream';
}

/**
 * Sendet eine Public-Datei mit passenden Security-Headern.
 *
 * @param string $filePath Der absolute Dateipfad.
 * @return void
 */
function nip46IdentityLinkSendPublicFile(string $filePath): void
{
    $mimeType = nip46IdentityLinkResolveMimeType($filePath);
    header('Content-Type: ' . $mimeType);
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');

    $isHtml = substr($mimeType, 0, 9) === 'text/html';
    if ($isHtml) {
        nocache_headers();
    } else {
        header('Cache-Control: public, max-age=300');
    }

    readfile($filePath);
}

/**
 * Deaktiviert WordPress-CANONICAL-Redirects fuer `/nostr/...` Routen.
 * Das verhindert, dass Modul-URLs wie `*.js` unerwuenscht auf `*.js/`
 * umgebogen werden und dadurch falsche relative Importpfade entstehen.
 *
 * @param string|false $redirectUrl Ziel-URL des Canonical-Redirects.
 * @param string $requestedUrl Urspruenglich angefragte URL.
 * @return string|false Unveraenderte Redirect-URL oder `false`, um Redirect zu unterbinden.
 */
function nip46IdentityLinkDisableCanonicalForNostrRoutes($redirectUrl, string $requestedUrl)
{
    $requestPath = (string) wp_parse_url($requestedUrl, PHP_URL_PATH);
    $requestPath = trim($requestPath);
    if ($requestPath === '') {
        return $redirectUrl;
    }

    $basePath = '/' . NIP46_IDENTITY_LINK_REWRITE_BASE . '/';
    if (strpos($requestPath, $basePath) === 0 || $requestPath === '/' . NIP46_IDENTITY_LINK_REWRITE_BASE) {
        return false;
    }

    return $redirectUrl;
}

/**
 * Registriert den Identity-Link-Shortcode.
 *
 * @return void
 */
function nip46IdentityLinkRegisterShortcode(): void
{
    add_shortcode(NIP46_IDENTITY_LINK_SHORTCODE_TAG, 'nip46IdentityLinkRenderShortcode');
}

/**
 * Rendert den Identity-Link-Shortcode.
 *
 * Attribute:
 * - client_url: URL zur Identity-Link-Client-Seite (optional)
 * - show_iframe: "1"/"0" ob ein iframe ausgegeben werden soll
 * - iframe_height: Hoehe des iframes in Pixeln
 * - iframe_title: Titelattribut fuer das iframe
 *
 * @param array<string,mixed> $attributes Shortcode-Attribute.
 * @param string|null $content Optionaler Inhalt zwischen den Tags.
 * @param string $shortcodeTag Der aufgerufene Shortcode-Tag.
 * @return string HTML-Output.
 */
function nip46IdentityLinkRenderShortcode(array $attributes = [], ?string $content = null, string $shortcodeTag = ''): string
{
    if (!is_user_logged_in()) {
        return '<p>Identity-Link ist nur fuer eingeloggte Benutzer verfuegbar.</p>';
    }

    $defaults = [
        'client_url' => home_url('/' . NIP46_IDENTITY_LINK_REWRITE_BASE . '/identity-link/'),
        'show_iframe' => '1',
        'iframe_height' => (string) NIP46_IDENTITY_LINK_SHORTCODE_DEFAULT_IFRAME_HEIGHT,
        'iframe_title' => 'NIP-46 Identity Link Client'
    ];
    $resolvedTag = $shortcodeTag !== '' ? $shortcodeTag : NIP46_IDENTITY_LINK_SHORTCODE_TAG;
    $atts = shortcode_atts($defaults, $attributes, $resolvedTag);

    $nonce = wp_create_nonce('wp_rest');
    $clientUrl = nip46IdentityLinkNormalizeClientUrl((string) $atts['client_url']);
    $showIframe = nip46IdentityLinkNormalizeShortcodeBoolean((string) $atts['show_iframe'], true);
    $iframeHeight = nip46IdentityLinkNormalizeIframeHeight((string) $atts['iframe_height']);
    $iframeTitle = nip46IdentityLinkNormalizeIframeTitle((string) $atts['iframe_title']);
    $iframeSrc = nip46IdentityLinkBuildClientSrcWithNonce($clientUrl, $nonce);

    $nonceScript = wp_json_encode($nonce);
    if (!is_string($nonceScript) || $nonceScript === '') {
        $nonceScript = '""';
    }

    $html = [];
    $html[] = '<div class="nip46-identity-link-shortcode" data-wp-rest-nonce="' . esc_attr($nonce) . '">';
    $html[] = '<script>(function(){var nonce=' . $nonceScript . ';var meta=document.querySelector(\'meta[name=\"wp-rest-nonce\"]\');if(!meta){meta=document.createElement(\"meta\");meta.setAttribute(\"name\",\"wp-rest-nonce\");document.head.appendChild(meta);}meta.setAttribute(\"content\",nonce);}());</script>';

    if ($showIframe && $iframeSrc !== '') {
        $html[] = '<iframe class="nip46-identity-link-frame" src="' . esc_url($iframeSrc) . '" title="' . esc_attr($iframeTitle) . '" style="width:100%;min-height:' . esc_attr((string) $iframeHeight) . 'px;border:0;" loading="lazy"></iframe>';
    } elseif ($clientUrl === '') {
        $html[] = '<p>Shortcode aktiv. Bitte `client_url` setzen, um den Identity-Link-Client im iframe zu laden.</p>';
    }

    $html[] = '</div>';
    return implode("\n", $html);
}

/**
 * Normalisiert die optionale Client-URL aus dem Shortcode.
 *
 * @param string $clientUrlRaw Die rohe Client-URL.
 * @return string Die normalisierte URL oder leerer String.
 */
function nip46IdentityLinkNormalizeClientUrl(string $clientUrlRaw): string
{
    $clientUrl = trim($clientUrlRaw);
    if ($clientUrl === '') {
        return '';
    }

    return esc_url_raw($clientUrl);
}

/**
 * Normalisiert einen booleschen Shortcode-Wert.
 *
 * @param string $rawValue Der rohe String-Wert.
 * @param bool $defaultValue Fallback-Wert.
 * @return bool Der normalisierte boolesche Wert.
 */
function nip46IdentityLinkNormalizeShortcodeBoolean(string $rawValue, bool $defaultValue): bool
{
    $normalized = strtolower(trim($rawValue));
    if ($normalized === '') {
        return $defaultValue;
    }

    if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
        return true;
    }
    if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
        return false;
    }

    return $defaultValue;
}

/**
 * Normalisiert die iframe-Hoehe aus dem Shortcode.
 *
 * @param string $heightRaw Der rohe Hoehenwert.
 * @return int Die normalisierte Hoehe in Pixeln.
 */
function nip46IdentityLinkNormalizeIframeHeight(string $heightRaw): int
{
    $numeric = (int) $heightRaw;
    if ($numeric <= 0) {
        $numeric = NIP46_IDENTITY_LINK_SHORTCODE_DEFAULT_IFRAME_HEIGHT;
    }

    if ($numeric < 320) {
        return 320;
    }
    if ($numeric > 2200) {
        return 2200;
    }

    return $numeric;
}

/**
 * Normalisiert das iframe-Title-Attribut.
 *
 * @param string $titleRaw Der rohe Titelwert.
 * @return string Der sanitizte Titel.
 */
function nip46IdentityLinkNormalizeIframeTitle(string $titleRaw): string
{
    $title = sanitize_text_field($titleRaw);
    if ($title === '') {
        return 'NIP-46 Identity Link Client';
    }
    return $title;
}

/**
 * Baut eine Client-URL mit angehaengtem `wpRestNonce` Query-Parameter.
 *
 * @param string $clientUrl Die Basis-Client-URL.
 * @param string $nonce Der WP-REST-Nonce.
 * @return string Die fertige URL oder leerer String.
 */
function nip46IdentityLinkBuildClientSrcWithNonce(string $clientUrl, string $nonce): string
{
    if ($clientUrl === '') {
        return '';
    }

    $separator = strpos($clientUrl, '?') === false ? '?' : '&';
    return $clientUrl . $separator . 'wpRestNonce=' . rawurlencode($nonce);
}

/**
 * Prueft, ob der Benutzer fuer das Lesen der Session-Identity autorisiert ist.
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return bool|WP_Error True bei Erfolg, sonst WP_Error.
 */
function nip46IdentityLinkCanReadSession(WP_REST_Request $request)
{
    nip46IdentityLinkMaybeRestoreUserFromLoggedInCookie();
    return nip46IdentityLinkRequireLoggedInUser();
}

/**
 * Prueft, ob der Benutzer fuer schreibende Binding-Operationen autorisiert ist.
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return bool|WP_Error True bei Erfolg, sonst WP_Error.
 */
function nip46IdentityLinkCanWriteBinding(WP_REST_Request $request)
{
    nip46IdentityLinkMaybeRestoreUserFromLoggedInCookie();
    $authResult = nip46IdentityLinkRequireLoggedInUser();
    if ($authResult !== true) {
        return $authResult;
    }

    if (!nip46IdentityLinkVerifyWpRestNonce($request)) {
        return new WP_Error(
            'nip46_identity_link_nonce_invalid',
            'Ungueltiger oder fehlender WP-REST-Nonce.',
            ['status' => 403]
        );
    }

    return true;
}

/**
 * Stellt sicher, dass ein eingeloggter Benutzer vorhanden ist.
 *
 * @return bool|WP_Error True bei Erfolg, sonst WP_Error.
 */
function nip46IdentityLinkRequireLoggedInUser()
{
    if (!is_user_logged_in()) {
        return new WP_Error(
            'nip46_identity_link_auth_required',
            'Login erforderlich.',
            ['status' => 401]
        );
    }

    return true;
}

/**
 * Stellt bei REST-Aufrufen den aktuellen Benutzer aus dem `logged_in` Cookie wieder her.
 * Hintergrund: Bei fehlendem REST-Nonce kann WordPress den User-Kontext im REST-Request
 * auf anonym setzen, obwohl im Frontend ein gueltiger Login-Cookie vorhanden ist.
 *
 * Diese Funktion hebt keine Write-Schutzregeln auf:
 * - Write-Endpunkte verlangen weiterhin einen gueltigen `X-WP-Nonce`.
 *
 * @return void
 */
function nip46IdentityLinkMaybeRestoreUserFromLoggedInCookie(): void
{
    if (is_user_logged_in()) {
        return;
    }

    $userId = (int) wp_validate_auth_cookie('', 'logged_in');
    if ($userId <= 0) {
        return;
    }

    wp_set_current_user($userId);
}

/**
 * Extrahiert einen WP-REST-Nonce aus Header oder Query.
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return string Der gefundene Nonce oder leerer String.
 */
function nip46IdentityLinkGetWpRestNonce(WP_REST_Request $request): string
{
    $headerNonce = (string) $request->get_header('X-WP-Nonce');
    if ($headerNonce !== '') {
        return $headerNonce;
    }

    return (string) $request->get_param('_wpnonce');
}

/**
 * Verifiziert den WP-REST-Nonce fuer schreibende Requests.
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return bool True bei gueltigem Nonce.
 */
function nip46IdentityLinkVerifyWpRestNonce(WP_REST_Request $request): bool
{
    $nonce = nip46IdentityLinkGetWpRestNonce($request);
    if ($nonce === '') {
        return false;
    }

    return wp_verify_nonce($nonce, 'wp_rest') === 1;
}

/**
 * Verarbeitet GET /session.
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return WP_REST_Response Die normalisierte Identity-Antwort.
 */
function nip46IdentityLinkHandleSession(WP_REST_Request $request): WP_REST_Response
{
    $currentUser = wp_get_current_user();
    $identity = nip46IdentityLinkBuildIdentityPayload($currentUser);

    return nip46IdentityLinkBuildResponse(
        [
            'identity' => $identity,
            'meta' => [
                'restNonce' => wp_create_nonce('wp_rest')
            ]
        ],
        200
    );
}

/**
 * Verarbeitet POST /bind (nur wenn noch keine abweichende Zuordnung existiert).
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return WP_REST_Response|WP_Error Ergebnisobjekt oder Fehler.
 */
function nip46IdentityLinkHandleBind(WP_REST_Request $request)
{
    $currentUser = wp_get_current_user();
    $normalized = nip46IdentityLinkNormalizeBindingInput($request, $currentUser);
    if (is_wp_error($normalized)) {
        return $normalized;
    }

    $existingPubkey = nip46IdentityLinkGetUserPubkey((int) $currentUser->ID);
    if ($existingPubkey !== '' && $existingPubkey !== $normalized['pubkey']) {
        return new WP_Error(
            'nip46_identity_link_conflict',
            'Bereits ein anderer Pubkey verknuepft. Bitte /rebind verwenden.',
            ['status' => 409]
        );
    }

    nip46IdentityLinkPersistBinding((int) $currentUser->ID, $normalized, 'bind');

    return nip46IdentityLinkBuildResponse(
        [
            'identity' => nip46IdentityLinkBuildIdentityPayload($currentUser),
            'meta' => [
                'restNonce' => wp_create_nonce('wp_rest')
            ]
        ],
        200
    );
}

/**
 * Verarbeitet POST /rebind (ueberschreibt eine bestehende Zuordnung explizit).
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @return WP_REST_Response|WP_Error Ergebnisobjekt oder Fehler.
 */
function nip46IdentityLinkHandleRebind(WP_REST_Request $request)
{
    $currentUser = wp_get_current_user();
    $normalized = nip46IdentityLinkNormalizeBindingInput($request, $currentUser);
    if (is_wp_error($normalized)) {
        return $normalized;
    }

    nip46IdentityLinkPersistBinding((int) $currentUser->ID, $normalized, 'rebind');

    return nip46IdentityLinkBuildResponse(
        [
            'identity' => nip46IdentityLinkBuildIdentityPayload($currentUser),
            'meta' => [
                'restNonce' => wp_create_nonce('wp_rest')
            ]
        ],
        200
    );
}

/**
 * Baut ein einheitliches REST-Response-Objekt.
 *
 * @param array<string,mixed> $payload Der Antwortpayload.
 * @param int $statusCode HTTP-Statuscode.
 * @return WP_REST_Response Die Antwort.
 */
function nip46IdentityLinkBuildResponse(array $payload, int $statusCode): WP_REST_Response
{
    return new WP_REST_Response($payload, $statusCode);
}

/**
 * Normalisiert und validiert die Nutzlast fuer Bind/Rebind.
 *
 * @param WP_REST_Request $request Die REST-Anfrage.
 * @param WP_User $currentUser Der eingeloggte Benutzer.
 * @return array<string,string>|WP_Error Normalisierte Daten oder Fehler.
 */
function nip46IdentityLinkNormalizeBindingInput(WP_REST_Request $request, WP_User $currentUser)
{
    $rawInput = $request->get_json_params();
    if (!is_array($rawInput)) {
        return new WP_Error(
            'nip46_identity_link_payload_invalid',
            'Ungueltiger JSON-Payload.',
            ['status' => 400]
        );
    }

    $provider = strtolower(trim((string) ($rawInput['provider'] ?? '')));
    if ($provider !== NIP46_IDENTITY_LINK_PROVIDER) {
        return new WP_Error(
            'nip46_identity_link_provider_invalid',
            'provider muss wordpress sein.',
            ['status' => 400]
        );
    }

    $subject = nip46IdentityLinkNormalizeSubject((string) ($rawInput['subject'] ?? ''));
    if (is_wp_error($subject)) {
        return $subject;
    }

    $expectedSubject = (string) $currentUser->ID;
    if ($subject !== $expectedSubject) {
        return new WP_Error(
            'nip46_identity_link_subject_mismatch',
            'subject passt nicht zum eingeloggten Benutzer.',
            ['status' => 403]
        );
    }

    $pubkey = nip46IdentityLinkNormalizePubkey((string) ($rawInput['pubkey'] ?? ''));
    if (is_wp_error($pubkey)) {
        return $pubkey;
    }

    $npub = nip46IdentityLinkNormalizeNpub((string) ($rawInput['npub'] ?? ''));
    if (is_wp_error($npub)) {
        return $npub;
    }

    $keyId = nip46IdentityLinkNormalizeKeyId((string) ($rawInput['keyId'] ?? ''));
    if (is_wp_error($keyId)) {
        return $keyId;
    }

    return [
        'provider' => $provider,
        'subject' => $subject,
        'pubkey' => $pubkey,
        'npub' => $npub,
        'keyId' => $keyId
    ];
}

/**
 * Normalisiert den Identity-Subject-Wert.
 *
 * @param string $subjectRaw Der rohe Subject-Wert.
 * @return string|WP_Error Normalisierter Subject-Wert oder Fehler.
 */
function nip46IdentityLinkNormalizeSubject(string $subjectRaw)
{
    $subject = trim($subjectRaw);
    if ($subject === '') {
        return new WP_Error(
            'nip46_identity_link_subject_missing',
            'subject fehlt.',
            ['status' => 400]
        );
    }

    if (strlen($subject) > 128) {
        return new WP_Error(
            'nip46_identity_link_subject_too_long',
            'subject ist zu lang (max. 128 Zeichen).',
            ['status' => 400]
        );
    }

    return $subject;
}

/**
 * Normalisiert und validiert einen Nostr-Pubkey (Hex).
 *
 * @param string $pubkeyRaw Der rohe Pubkey.
 * @return string|WP_Error Normalisierter Pubkey oder Fehler.
 */
function nip46IdentityLinkNormalizePubkey(string $pubkeyRaw)
{
    $pubkey = strtolower(trim($pubkeyRaw));
    if ($pubkey === '') {
        return new WP_Error(
            'nip46_identity_link_pubkey_missing',
            'pubkey fehlt.',
            ['status' => 400]
        );
    }

    if (!preg_match('/^[0-9a-f]{64}$/', $pubkey)) {
        return new WP_Error(
            'nip46_identity_link_pubkey_invalid',
            'pubkey muss 64-stelliges Hex sein.',
            ['status' => 400]
        );
    }

    return $pubkey;
}

/**
 * Normalisiert ein optionales npub-Feld.
 *
 * @param string $npubRaw Der rohe npub-Wert.
 * @return string|WP_Error Normalisierter npub oder Fehler.
 */
function nip46IdentityLinkNormalizeNpub(string $npubRaw)
{
    $npub = trim($npubRaw);
    if ($npub === '') {
        return '';
    }

    if (strlen($npub) > 128) {
        return new WP_Error(
            'nip46_identity_link_npub_too_long',
            'npub ist zu lang (max. 128 Zeichen).',
            ['status' => 400]
        );
    }

    if (strpos($npub, 'npub1') !== 0) {
        return new WP_Error(
            'nip46_identity_link_npub_invalid',
            'npub muss mit npub1 beginnen.',
            ['status' => 400]
        );
    }

    return $npub;
}

/**
 * Normalisiert ein optionales keyId-Feld.
 *
 * @param string $keyIdRaw Die rohe Key-ID.
 * @return string|WP_Error Normalisierte Key-ID oder Fehler.
 */
function nip46IdentityLinkNormalizeKeyId(string $keyIdRaw)
{
    $keyId = trim($keyIdRaw);
    if ($keyId === '') {
        return '';
    }

    if (strlen($keyId) > 128) {
        return new WP_Error(
            'nip46_identity_link_key_id_too_long',
            'keyId ist zu lang (max. 128 Zeichen).',
            ['status' => 400]
        );
    }

    return $keyId;
}

/**
 * Liest den aktuell verknuepften Pubkey eines Users.
 *
 * @param int $userId Die WordPress User-ID.
 * @return string Der validierte Pubkey oder leerer String.
 */
function nip46IdentityLinkGetUserPubkey(int $userId): string
{
    $rawPubkey = (string) get_user_meta($userId, NIP46_IDENTITY_LINK_META_PUBKEY, true);
    $normalizedPubkey = strtolower(trim($rawPubkey));

    if (!preg_match('/^[0-9a-f]{64}$/', $normalizedPubkey)) {
        return '';
    }

    return $normalizedPubkey;
}

/**
 * Speichert ein Binding in den User-Metadaten und schreibt einen Audit-Eintrag.
 *
 * @param int $userId Die WordPress User-ID.
 * @param array<string,string> $normalizedInput Die normalisierten Eingabedaten.
 * @param string $action Die Aktion (`bind` oder `rebind`).
 * @return void
 */
function nip46IdentityLinkPersistBinding(int $userId, array $normalizedInput, string $action): void
{
    $previousPubkey = nip46IdentityLinkGetUserPubkey($userId);

    update_user_meta($userId, NIP46_IDENTITY_LINK_META_PUBKEY, $normalizedInput['pubkey']);
    update_user_meta($userId, NIP46_IDENTITY_LINK_META_NPUB, $normalizedInput['npub']);
    update_user_meta($userId, NIP46_IDENTITY_LINK_META_KEY_ID, $normalizedInput['keyId']);
    update_user_meta($userId, NIP46_IDENTITY_LINK_META_UPDATED_AT, gmdate('c'));

    nip46IdentityLinkAppendAuditEntry(
        nip46IdentityLinkBuildAuditEntry(
            $action,
            $userId,
            $normalizedInput['subject'],
            $previousPubkey,
            $normalizedInput['pubkey']
        )
    );
}

/**
 * Baut die normalisierte Identity-Payload fuer API-Antworten.
 *
 * @param WP_User $user Der WordPress-Benutzer.
 * @return array<string,string> Die Identity-Payload.
 */
function nip46IdentityLinkBuildIdentityPayload(WP_User $user): array
{
    $displayName = trim((string) $user->display_name);
    if ($displayName === '') {
        $displayName = (string) $user->user_login;
    }

    return [
        'provider' => NIP46_IDENTITY_LINK_PROVIDER,
        'subject' => (string) $user->ID,
        'displayName' => $displayName,
        'expectedPubkey' => nip46IdentityLinkGetUserPubkey((int) $user->ID)
    ];
}

/**
 * Baut einen Audit-Eintrag fuer Bind/Rebind.
 *
 * @param string $action Die Aktion (`bind` oder `rebind`).
 * @param int $userId Die betroffene User-ID.
 * @param string $subject Der Subject-Wert.
 * @param string $oldPubkey Der vorherige Pubkey.
 * @param string $newPubkey Der neue Pubkey.
 * @return array<string,mixed> Der Audit-Eintrag.
 */
function nip46IdentityLinkBuildAuditEntry(
    string $action,
    int $userId,
    string $subject,
    string $oldPubkey,
    string $newPubkey
): array {
    return [
        'id' => wp_generate_uuid4(),
        'action' => $action,
        'actorUserId' => get_current_user_id(),
        'targetUserId' => $userId,
        'provider' => NIP46_IDENTITY_LINK_PROVIDER,
        'subject' => $subject,
        'oldPubkey' => $oldPubkey,
        'newPubkey' => $newPubkey,
        'ip' => nip46IdentityLinkGetClientIp(),
        'userAgent' => nip46IdentityLinkGetUserAgent(),
        'timestamp' => gmdate('c')
    ];
}

/**
 * Ermittelt die Client-IP fuer Audit-Zwecke (best effort).
 *
 * @return string Die erkannte IP oder leerer String.
 */
function nip46IdentityLinkGetClientIp(): string
{
    $xForwardedFor = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? (string) $_SERVER['HTTP_X_FORWARDED_FOR'] : '';
    if ($xForwardedFor !== '') {
        $firstHop = trim(explode(',', $xForwardedFor)[0]);
        if ($firstHop !== '') {
            return sanitize_text_field($firstHop);
        }
    }

    $remoteAddr = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '';
    return sanitize_text_field($remoteAddr);
}

/**
 * Ermittelt den User-Agent fuer Audit-Zwecke in begrenzter Laenge.
 *
 * @return string Der sanitizte User-Agent.
 */
function nip46IdentityLinkGetUserAgent(): string
{
    $rawUserAgent = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : '';
    $sanitizedUserAgent = sanitize_text_field($rawUserAgent);
    return substr($sanitizedUserAgent, 0, 255);
}

/**
 * Laedt den Audit-Log aus den WordPress-Optionen.
 *
 * @return array<int,array<string,mixed>> Die Audit-Eintraege.
 */
function nip46IdentityLinkLoadAuditLog(): array
{
    $auditLog = get_option(NIP46_IDENTITY_LINK_AUDIT_OPTION, []);
    if (!is_array($auditLog)) {
        return [];
    }

    return $auditLog;
}

/**
 * Speichert den Audit-Log in den WordPress-Optionen.
 *
 * @param array<int,array<string,mixed>> $auditLog Die zu speichernden Audit-Eintraege.
 * @return void
 */
function nip46IdentityLinkSaveAuditLog(array $auditLog): void
{
    update_option(NIP46_IDENTITY_LINK_AUDIT_OPTION, $auditLog, false);
}

/**
 * Haengt einen Eintrag an den Audit-Log an und kuerzt auf das konfigurierte Limit.
 *
 * @param array<string,mixed> $entry Der neue Audit-Eintrag.
 * @return void
 */
function nip46IdentityLinkAppendAuditEntry(array $entry): void
{
    $auditLog = nip46IdentityLinkLoadAuditLog();
    $auditLog[] = $entry;

    if (count($auditLog) > NIP46_IDENTITY_LINK_AUDIT_LIMIT) {
        $auditLog = array_slice($auditLog, -NIP46_IDENTITY_LINK_AUDIT_LIMIT);
    }

    nip46IdentityLinkSaveAuditLog($auditLog);
}

register_activation_hook(__FILE__, 'nip46IdentityLinkActivatePlugin');
register_deactivation_hook(__FILE__, 'nip46IdentityLinkDeactivatePlugin');
add_action('init', 'nip46IdentityLinkRegisterRewriteRules');
add_action('rest_api_init', 'nip46IdentityLinkRegisterRoutes');
add_action('init', 'nip46IdentityLinkRegisterShortcode');
add_filter('query_vars', 'nip46IdentityLinkRegisterQueryVars');
add_filter('redirect_canonical', 'nip46IdentityLinkDisableCanonicalForNostrRoutes', 10, 2);
add_action('template_redirect', 'nip46IdentityLinkMaybeServePublicRoute');
