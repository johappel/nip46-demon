import { nostrclient } from "./nostrclient.js";

window.nostrclient = nostrclient;

const DEMO_SIGNER_IFRAME_URI_STORAGE_KEY = "nostrclient_demo_signer_iframe_uri_v1";
const DEFAULT_SIGNER_IFRAME_URI = "../signer.html";
const INTERACTIVE_SIGNER_MODE = "interactive";

const config = {
    signer_iframe_uri: DEFAULT_SIGNER_IFRAME_URI,
    // "fixed": use signer_iframe_uri directly.
    // "interactive": ask user for signer URL on startup.
    signer_iframe_mode: "interactive",
    // No form_uri means no generated form UI.
    // Then send custom events via API:
    // const signed = await nostrclient.signEvent(unsignedEvent);
    // await nostrclient.publishSignedEvent(signed);
    // Examples:
    // form_uri: "./forms/schemas/kind1.json",
    // form_uri: "./forms/schemas/kind30023.json",
    // form_uri: "./forms/schemas/nip52-calendar.json",
    relays: [],
    allow_nip07: false
};

/**
 * Reads the last signer URL from browser storage.
 * @returns {string} Stored signer URL or empty string.
 */
function readStoredSignerUri() {
    try {
        return normalizeText(window.localStorage.getItem(DEMO_SIGNER_IFRAME_URI_STORAGE_KEY));
    } catch (_error) {
        return "";
    }
}

/**
 * Persists one signer URL to browser storage.
 * @param {string} signerUri Signer URL.
 */
function writeStoredSignerUri(signerUri) {
    try {
        window.localStorage.setItem(DEMO_SIGNER_IFRAME_URI_STORAGE_KEY, signerUri);
    } catch (_error) {
        // Ignore storage write errors (privacy mode, blocked cookies).
    }
}

/**
 * Normalizes one text value.
 * @param {unknown} value Raw value.
 * @returns {string} Trimmed string.
 */
function normalizeText(value) {
    return String(value ?? "").trim();
}

/**
 * Resolves and validates one signer iframe URI.
 * Relative URLs are resolved against current location.
 * @param {unknown} rawUri Candidate URI.
 * @returns {string} Normalized URI.
 * @throws {Error} If URI is empty or invalid.
 */
function resolveSignerIframeUri(rawUri) {
    const candidate = normalizeText(rawUri);
    if (!candidate) {
        throw new Error("Signer URL must not be empty.");
    }

    try {
        new URL(candidate, window.location.href);
    } catch (_error) {
        throw new Error("Signer URL is invalid.");
    }

    return candidate;
}

/**
 * Reads one query override for signer iframe URI.
 * Supported keys: signer_iframe_uri, signerIframeUri.
 * @returns {string} Query override or empty.
 */
function resolveSignerUriFromQuery() {
    const searchParams = new URLSearchParams(window.location.search);
    return normalizeText(
        searchParams.get("signer_iframe_uri") ||
        searchParams.get("signerIframeUri") ||
        ""
    );
}

/**
 * Resolves signer URI from interactive mode.
 * Priority: query -> localStorage -> configured value.
 * @param {Record<string, unknown>} rawConfig Mutable config object.
 * @returns {string} Effective signer URI.
 */
function resolveInteractiveSignerUri(rawConfig) {
    const configuredUri = normalizeText(rawConfig.signer_iframe_uri || DEFAULT_SIGNER_IFRAME_URI) || DEFAULT_SIGNER_IFRAME_URI;
    const fromQuery = resolveSignerUriFromQuery();
    const fromStorage = readStoredSignerUri();
    const prefilledUri = fromQuery || fromStorage || configuredUri;
    const promptLabel =
        "Enter signer iframe URL (relative or absolute).\n" +
        "Example: ../signer.html or https://example.com/nostr/signer/";
    const promptedUri = window.prompt(promptLabel, prefilledUri);
    const selectedUri = normalizeText(promptedUri) || prefilledUri;
    const effectiveUri = resolveSignerIframeUri(selectedUri);

    writeStoredSignerUri(effectiveUri);
    return effectiveUri;
}

/**
 * Builds runtime config and applies interactive signer mode if enabled.
 * @param {Record<string, unknown>} rawConfig Base config.
 * @returns {Record<string, unknown>} Config passed to nostrclient.
 */
function buildRuntimeConfig(rawConfig) {
    const runtimeConfig = {
        ...rawConfig
    };
    const signerMode = normalizeText(runtimeConfig.signer_iframe_mode || runtimeConfig.signerIframeMode || "fixed").toLowerCase();

    if (signerMode === INTERACTIVE_SIGNER_MODE) {
        runtimeConfig.signer_iframe_uri = resolveInteractiveSignerUri(runtimeConfig);
        runtimeConfig.signerIframeUri = runtimeConfig.signer_iframe_uri;
    } else {
        runtimeConfig.signer_iframe_uri = resolveSignerIframeUri(runtimeConfig.signer_iframe_uri || DEFAULT_SIGNER_IFRAME_URI);
        runtimeConfig.signerIframeUri = runtimeConfig.signer_iframe_uri;
    }

    return runtimeConfig;
}

/**
 * Boots the demo client.
 * @returns {Promise<void>} Resolves when init completed.
 */
async function bootstrapDemoClient() {
    const runtimeConfig = buildRuntimeConfig(config);
    await nostrclient.init({ config: runtimeConfig });
}

bootstrapDemoClient().catch((error) => {
    console.error("nostrclient init failed:", error);
});
