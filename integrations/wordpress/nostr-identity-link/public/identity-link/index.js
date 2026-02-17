import { createBunkerConnectClient } from "../democlient/nostr.js";

const BRIDGE_SOURCE = "nip46-signer-bridge";
const DEFAULT_PROVIDER = "wordpress";
const DEFAULT_SIGNER_URI = "../signer/";
const DEFAULT_IDENTITY_ENDPOINT = "/wp-json/identity-link/v1/session";
const DEFAULT_BIND_ENDPOINT = "/wp-json/identity-link/v1/bind";
const DEFAULT_REBIND_ENDPOINT = "/wp-json/identity-link/v1/rebind";

const rootEl = document.getElementById("identity-link-root");
const overallStatusEl = document.getElementById("overall-status");
const reloadIdentityBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("reload-identity-btn"));
const ensureLinkBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("ensure-link-btn"));
const openSignerBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("open-signer-btn"));
const rebindBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("rebind-btn"));
const providerValueEl = document.getElementById("identity-provider-value");
const subjectValueEl = document.getElementById("identity-subject-value");
const displayNameValueEl = document.getElementById("identity-display-name-value");
const expectedPubkeyValueEl = document.getElementById("identity-expected-pubkey-value");
const signerPubkeyValueEl = document.getElementById("signer-pubkey-value");
const signerNpubValueEl = document.getElementById("signer-npub-value");
const signerKeyNameValueEl = document.getElementById("signer-key-name-value");
const bindingStatusBadgeEl = document.getElementById("binding-status-badge");
const signerStatusEl = document.getElementById("signer-status");
const signerDialogStatusEl = document.getElementById("signer-dialog-status");
const mismatchPanelEl = document.getElementById("mismatch-panel");
const expectedPubkeyOutputEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById("expected-pubkey-output"));
const currentPubkeyOutputEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById("current-pubkey-output"));
const resultOutputEl = document.getElementById("result-output");
const signerDialogEl = /** @type {HTMLDialogElement|null} */ (document.getElementById("signer-dialog"));
const closeSignerBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("close-signer-btn"));
const signerFrameEl = /** @type {HTMLIFrameElement|null} */ (document.getElementById("signer-frame"));

/**
 * @typedef {object} RuntimeConfig
 * @property {string} provider - Active identity provider.
 * @property {string} signerUri - Signer URL.
 * @property {string} identityEndpoint - Endpoint for session identity.
 * @property {string} bindEndpoint - Endpoint for initial bind.
 * @property {string} rebindEndpoint - Endpoint for forced rebind.
 * @property {string} wpRestNonce - Optional WP REST nonce for write calls.
 * @property {boolean} autoBindOnUnbound - Whether unbound identities auto-bind.
 */

/**
 * @typedef {object} IdentitySnapshot
 * @property {string} provider - Identity provider.
 * @property {string} subject - Stable identity subject.
 * @property {string} displayName - Display label.
 * @property {string} expectedPubkey - Backend pubkey mapping (optional).
 */

/**
 * @typedef {object} SignerEnsureResult
 * @property {string} userId - User ID sent to signer bridge.
 * @property {string} keyId - Signer key id.
 * @property {string} keyName - Signer key display name.
 * @property {string} pubkey - Signer pubkey in hex.
 * @property {string} npub - Signer npub.
 * @property {boolean} existed - Whether key existed before.
 * @property {boolean} active - Whether key is currently active in signer.
 */

/**
 * @typedef {object} ProviderAdapter
 * @property {(identity: IdentitySnapshot) => string} toBridgeUserId - Maps identity to signer bridge userId.
 * @property {(subjectRaw: string) => string} normalizeSubject - Normalizes provider subject.
 */

const state = {
    runtimeConfig: /** @type {RuntimeConfig} */ ({
        provider: DEFAULT_PROVIDER,
        signerUri: DEFAULT_SIGNER_URI,
        identityEndpoint: DEFAULT_IDENTITY_ENDPOINT,
        bindEndpoint: DEFAULT_BIND_ENDPOINT,
        rebindEndpoint: DEFAULT_REBIND_ENDPOINT,
        wpRestNonce: "",
        autoBindOnUnbound: true
    }),
    activeIdentity: /** @type {IdentitySnapshot|null} */ (null),
    lastEnsureResult: /** @type {SignerEnsureResult|null} */ (null),
    bindingStatus: "idle",
    isBusy: false,
    signerUnlockFlowActive: false,
    bunkerClient: /** @type {any|null} */ (null)
};

/**
 * Checks whether an error/status text indicates a locked signer.
 * @param {string} message - Message text to classify.
 * @returns {boolean} True when signer lock wording is detected.
 */
function isLockedSignerMessage(message) {
    const text = String(message || "").toLowerCase();
    if (!text) return false;
    return text.includes("gesperrt") || text.includes("entsperr");
}

/**
 * Checks whether a status text indicates that signer bridge is ready.
 * @param {string} message - Message text to classify.
 * @returns {boolean} True when signer ready wording is detected.
 */
function isReadySignerMessage(message) {
    const text = String(message || "").toLowerCase();
    if (!text) return false;
    return text.includes("signer bereit") || text.includes("bridge bereit") || text.includes("verbunden. signer ist bereit");
}

/**
 * Converts any value to a normalized boolean.
 * @param {string|boolean|number|null|undefined} value - Raw input.
 * @param {boolean} fallbackValue - Fallback when value is empty/unknown.
 * @returns {boolean} Parsed boolean value.
 */
function parseBoolean(value, fallbackValue) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    const normalized = String(value ?? "").trim().toLowerCase();
    if (!normalized) return fallbackValue;
    if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
    if (normalized === "false" || normalized === "0" || normalized === "no") return false;
    return fallbackValue;
}

/**
 * Normalizes one URL-like string against current page URL.
 * @param {string} value - Raw URL.
 * @returns {string} Absolute URL string or empty string on parse failure.
 */
function normalizeUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
        return new URL(raw, window.location.href).toString();
    } catch (_err) {
        return "";
    }
}

/**
 * Reads WordPress REST nonce from meta tag.
 * @returns {string} Nonce value or empty string.
 */
function resolveWpRestNonceFromMeta() {
    const nonceMetaEl = document.querySelector('meta[name="wp-rest-nonce"]');
    if (!(nonceMetaEl instanceof HTMLMetaElement)) return "";
    return String(nonceMetaEl.content || "").trim();
}

/**
 * Reads WordPress REST nonce from URL query parameters.
 * Supported keys: `wpRestNonce`, `wp_rest_nonce`, `_wpnonce`.
 * @returns {string} Nonce value or empty string.
 */
function resolveWpRestNonceFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const queryNonce =
        String(params.get("wpRestNonce") || "").trim() ||
        String(params.get("wp_rest_nonce") || "").trim() ||
        String(params.get("_wpnonce") || "").trim();
    return queryNonce;
}

/**
 * Builds runtime config from root data attributes.
 * @returns {RuntimeConfig} Normalized runtime config.
 */
function resolveRuntimeConfig() {
    const dataset = rootEl?.dataset || {};

    const provider = String(dataset.provider || DEFAULT_PROVIDER).trim().toLowerCase() || DEFAULT_PROVIDER;
    const signerUri = String(dataset.signerUri || DEFAULT_SIGNER_URI).trim() || DEFAULT_SIGNER_URI;
    const identityEndpoint =
        normalizeUrl(dataset.identityEndpoint || "") ||
        normalizeUrl(DEFAULT_IDENTITY_ENDPOINT) ||
        DEFAULT_IDENTITY_ENDPOINT;
    const bindEndpoint =
        normalizeUrl(dataset.bindEndpoint || "") ||
        normalizeUrl(DEFAULT_BIND_ENDPOINT) ||
        DEFAULT_BIND_ENDPOINT;
    const rebindEndpoint =
        normalizeUrl(dataset.rebindEndpoint || "") ||
        normalizeUrl(DEFAULT_REBIND_ENDPOINT) ||
        DEFAULT_REBIND_ENDPOINT;
    const wpRestNonce =
        String(dataset.wpRestNonce || "").trim() ||
        resolveWpRestNonceFromQuery() ||
        resolveWpRestNonceFromMeta();
    const autoBindOnUnbound = parseBoolean(dataset.autoBindOnUnbound, true);

    return {
        provider,
        signerUri,
        identityEndpoint,
        bindEndpoint,
        rebindEndpoint,
        wpRestNonce,
        autoBindOnUnbound
    };
}

/**
 * Writes one status message to an element.
 * @param {HTMLElement|null} element - Target element.
 * @param {string} text - Status text.
 * @param {"idle"|"ok"|"warn"|"error"} stateValue - Visual state key.
 */
function setStatusText(element, text, stateValue = "idle") {
    if (!(element instanceof HTMLElement)) return;
    element.textContent = text;
    element.dataset.state = stateValue;
}

/**
 * Appends one line to the local output log.
 * @param {string} message - Line content.
 */
function appendResultLine(message) {
    if (!(resultOutputEl instanceof HTMLElement)) return;
    const previous = String(resultOutputEl.textContent || "").trim();
    const stamp = new Date().toISOString();
    const line = `[${stamp}] ${message}`;
    resultOutputEl.textContent = previous ? `${previous}\n${line}` : line;
}

/**
 * Updates the binding badge text and style.
 * @param {string} status - Current binding status.
 */
function setBindingStatus(status) {
    state.bindingStatus = String(status || "idle");
    if (!(bindingStatusBadgeEl instanceof HTMLElement)) return;
    bindingStatusBadgeEl.dataset.status = state.bindingStatus;
    bindingStatusBadgeEl.textContent = state.bindingStatus;
}

/**
 * Normalizes a pubkey hex string.
 * @param {string} value - Raw pubkey.
 * @returns {string} Lowercase trimmed pubkey.
 */
function normalizePubkey(value) {
    return String(value || "").trim().toLowerCase();
}

/**
 * Checks whether a string is a 64-char hex pubkey.
 * @param {string} value - Candidate string.
 * @returns {boolean} True when valid pubkey hex.
 */
function isPubkeyHex(value) {
    return /^[0-9a-f]{64}$/i.test(String(value || "").trim());
}

/**
 * Applies signer mismatch view state.
 * @param {string} expectedPubkey - Backend pubkey.
 * @param {string} signerPubkey - Signer pubkey.
 */
function setMismatchView(expectedPubkey, signerPubkey) {
    const normalizedExpected = normalizePubkey(expectedPubkey);
    const normalizedSigner = normalizePubkey(signerPubkey);
    const hasMismatch =
        !!normalizedExpected &&
        !!normalizedSigner &&
        isPubkeyHex(normalizedExpected) &&
        isPubkeyHex(normalizedSigner) &&
        normalizedExpected !== normalizedSigner;

    if (mismatchPanelEl instanceof HTMLElement) {
        mismatchPanelEl.hidden = !hasMismatch;
    }
    if (expectedPubkeyOutputEl instanceof HTMLTextAreaElement) {
        expectedPubkeyOutputEl.value = normalizedExpected;
    }
    if (currentPubkeyOutputEl instanceof HTMLTextAreaElement) {
        currentPubkeyOutputEl.value = normalizedSigner;
    }
    if (rebindBtn instanceof HTMLButtonElement) {
        rebindBtn.disabled = !hasMismatch || state.isBusy;
    }
}

/**
 * Renders the active backend identity snapshot.
 * @param {IdentitySnapshot|null} identity - Identity object from backend.
 */
function renderIdentity(identity) {
    const provider = identity?.provider || "-";
    const subject = identity?.subject || "-";
    const displayName = identity?.displayName || "-";
    const expectedPubkey = identity?.expectedPubkey || "-";

    if (providerValueEl) providerValueEl.textContent = provider;
    if (subjectValueEl) subjectValueEl.textContent = subject;
    if (displayNameValueEl) displayNameValueEl.textContent = displayName;
    if (expectedPubkeyValueEl) expectedPubkeyValueEl.textContent = expectedPubkey;
}

/**
 * Renders signer ensure result fields.
 * @param {SignerEnsureResult|null} ensureResult - Ensure result payload.
 */
function renderSignerResult(ensureResult) {
    if (signerPubkeyValueEl) signerPubkeyValueEl.textContent = ensureResult?.pubkey || "-";
    if (signerNpubValueEl) signerNpubValueEl.textContent = ensureResult?.npub || "-";
    if (signerKeyNameValueEl) signerKeyNameValueEl.textContent = ensureResult?.keyName || "-";
}

/**
 * Shows signer modal dialog.
 */
function openSignerDialog() {
    if (!(signerDialogEl instanceof HTMLDialogElement)) return;
    if (typeof signerDialogEl.showModal === "function" && !signerDialogEl.open) {
        signerDialogEl.showModal();
        return;
    }
    signerDialogEl.setAttribute("open", "open");
}

/**
 * Closes signer modal dialog.
 */
function closeSignerDialog() {
    if (!(signerDialogEl instanceof HTMLDialogElement)) return;
    if (typeof signerDialogEl.close === "function" && signerDialogEl.open) {
        signerDialogEl.close();
        return;
    }
    signerDialogEl.removeAttribute("open");
}

/**
 * Checks whether the signer dialog is currently open.
 * @returns {boolean} True when signer dialog is visible.
 */
function isSignerDialogOpen() {
    if (!(signerDialogEl instanceof HTMLDialogElement)) return false;
    if (typeof signerDialogEl.open === "boolean") return signerDialogEl.open;
    return signerDialogEl.hasAttribute("open");
}

/**
 * Sets general busy state and toggles action buttons.
 * @param {boolean} isBusy - Busy flag.
 */
function setBusyState(isBusy) {
    state.isBusy = !!isBusy;
    if (reloadIdentityBtn instanceof HTMLButtonElement) reloadIdentityBtn.disabled = state.isBusy;
    if (ensureLinkBtn instanceof HTMLButtonElement) ensureLinkBtn.disabled = state.isBusy;
    if (openSignerBtn instanceof HTMLButtonElement) openSignerBtn.disabled = false;
    if (rebindBtn instanceof HTMLButtonElement) {
        const mismatchVisible = mismatchPanelEl instanceof HTMLElement && mismatchPanelEl.hidden === false;
        rebindBtn.disabled = state.isBusy || !mismatchVisible;
    }
}

/**
 * Creates a normalized fetch error with details.
 * @param {Response} response - Fetch response.
 * @param {any} payload - Parsed payload.
 * @returns {Error} Error with backend context.
 */
function buildHttpError(response, payload) {
    const message =
        String(payload?.error || payload?.message || "").trim() ||
        `HTTP ${response.status} ${response.statusText}`.trim();
    return new Error(message);
}

/**
 * Sends one JSON HTTP request and parses JSON response.
 * @param {string} url - Target endpoint URL.
 * @param {RequestInit} options - Fetch options.
 * @returns {Promise<any>} Parsed JSON payload.
 */
async function fetchJson(url, options = {}) {
    const nonceHeader = state.runtimeConfig.wpRestNonce;
    const mergedHeaders = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(nonceHeader ? { "X-WP-Nonce": nonceHeader } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        credentials: "include",
        headers: mergedHeaders,
        ...options
    });

    let payload = {};
    try {
        payload = await response.json();
    } catch (_err) {
        payload = {};
    }

    if (!response.ok) {
        throw buildHttpError(response, payload);
    }

    return payload;
}

/**
 * Applies optional backend meta payload to runtime settings.
 * @param {any} payload - Backend response payload.
 */
function applyBackendMeta(payload) {
    const restNonce = String(payload?.meta?.restNonce || "").trim();
    if (!restNonce) return;
    state.runtimeConfig.wpRestNonce = restNonce;
}

/**
 * Normalizes one generic subject string.
 * @param {string} subjectRaw - Raw subject value.
 * @returns {string} Normalized subject.
 */
function normalizeGenericSubject(subjectRaw) {
    const normalized = String(subjectRaw || "").trim();
    if (!normalized) throw new Error("Identity subject fehlt.");
    if (normalized.length > 128) throw new Error("Identity subject ist zu lang (max. 128 Zeichen).");
    return normalized;
}

/**
 * Normalizes one WordPress subject.
 * @param {string} subjectRaw - Raw subject value.
 * @returns {string} WordPress-compatible normalized subject.
 */
function normalizeWordpressSubject(subjectRaw) {
    return normalizeGenericSubject(subjectRaw);
}

/**
 * Builds a WordPress provider adapter.
 * @returns {ProviderAdapter} Provider adapter implementation.
 */
function createWordpressAdapter() {
    /**
     * Maps identity to signer bridge userId for WordPress.
     * @param {IdentitySnapshot} identity - Active identity snapshot.
     * @returns {string} Bridge user ID.
     */
    function toBridgeUserId(identity) {
        return normalizeWordpressSubject(identity.subject);
    }

    return {
        normalizeSubject: normalizeWordpressSubject,
        toBridgeUserId
    };
}

/**
 * Builds a generic OIDC adapter (provider namespaced bridge IDs).
 * @param {string} providerName - OIDC provider key.
 * @returns {ProviderAdapter} Provider adapter implementation.
 */
function createOidcAdapter(providerName) {
    const provider = String(providerName || "oidc").trim().toLowerCase() || "oidc";

    /**
     * Maps OIDC identity to namespaced signer bridge userId.
     * @param {IdentitySnapshot} identity - Active identity snapshot.
     * @returns {string} Namespaced bridge user ID.
     */
    function toBridgeUserId(identity) {
        const normalizedSubject = normalizeGenericSubject(identity.subject);
        return `${provider}:${normalizedSubject}`;
    }

    return {
        normalizeSubject: normalizeGenericSubject,
        toBridgeUserId
    };
}

/**
 * Resolves one provider adapter from runtime provider key.
 * @param {string} providerName - Provider key.
 * @returns {ProviderAdapter} Matching provider adapter.
 */
function resolveProviderAdapter(providerName) {
    const provider = String(providerName || "").trim().toLowerCase();
    if (provider === "wordpress") return createWordpressAdapter();
    if (provider === "keycloak") return createOidcAdapter("keycloak");
    if (provider === "moodle") return createOidcAdapter("moodle");
    if (provider === "drupal") return createOidcAdapter("drupal");
    return createOidcAdapter(provider || "oidc");
}

/**
 * Builds one normalized identity snapshot from backend payload.
 * Accepts direct payload or wrapped payload under `identity`.
 * @param {any} payload - Raw backend payload.
 * @returns {IdentitySnapshot} Normalized identity.
 */
function normalizeIdentityPayload(payload) {
    const source = payload?.identity && typeof payload.identity === "object" ? payload.identity : payload;
    const provider = String(source?.provider || state.runtimeConfig.provider || DEFAULT_PROVIDER).trim().toLowerCase();
    const adapter = resolveProviderAdapter(provider);
    const subject = adapter.normalizeSubject(String(source?.subject ?? source?.userId ?? ""));
    const displayName = String(source?.displayName ?? source?.username ?? source?.name ?? "").trim();
    const expectedPubkey = normalizePubkey(String(source?.expectedPubkey ?? source?.pubkey ?? ""));

    return {
        provider: provider || DEFAULT_PROVIDER,
        subject,
        displayName,
        expectedPubkey
    };
}

/**
 * Loads active identity from backend.
 * @returns {Promise<IdentitySnapshot>} Loaded identity snapshot.
 */
async function loadIdentityFromBackend() {
    const payload = await fetchJson(state.runtimeConfig.identityEndpoint, { method: "GET" });
    applyBackendMeta(payload);
    const identity = normalizeIdentityPayload(payload);
    state.activeIdentity = identity;
    renderIdentity(identity);
    appendResultLine(`Identity geladen: ${identity.provider}:${identity.subject}`);
    return identity;
}

/**
 * Builds the payload for backend bind/rebind requests.
 * @param {IdentitySnapshot} identity - Active identity.
 * @param {SignerEnsureResult} ensureResult - Signer key ensure result.
 * @returns {object} Backend payload.
 */
function buildBindingPayload(identity, ensureResult) {
    return {
        provider: identity.provider,
        subject: identity.subject,
        displayName: identity.displayName,
        pubkey: normalizePubkey(ensureResult.pubkey),
        npub: String(ensureResult.npub || "").trim(),
        keyId: String(ensureResult.keyId || "").trim()
    };
}

/**
 * Sends one bind request to backend and updates local identity cache.
 * @param {"bind"|"rebind"} mode - Binding mode.
 * @returns {Promise<void>} Resolves after successful backend update.
 */
async function sendBindingUpdate(mode) {
    if (!state.activeIdentity) throw new Error("Keine aktive Identity geladen.");
    if (!state.lastEnsureResult) throw new Error("Noch kein Signer-Pubkey verfuegbar.");

    const endpoint = mode === "rebind" ? state.runtimeConfig.rebindEndpoint : state.runtimeConfig.bindEndpoint;
    const payload = buildBindingPayload(state.activeIdentity, state.lastEnsureResult);
    const response = await fetchJson(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    applyBackendMeta(response);
    const normalizedIdentity = normalizeIdentityPayload(response?.identity || {
        provider: state.activeIdentity.provider,
        subject: state.activeIdentity.subject,
        displayName: state.activeIdentity.displayName,
        expectedPubkey: payload.pubkey
    });
    state.activeIdentity = normalizedIdentity;
    renderIdentity(state.activeIdentity);
    appendResultLine(`${mode === "rebind" ? "Rebind" : "Bind"} erfolgreich: ${payload.pubkey.slice(0, 16)}...`);
}

/**
 * Reads signer iframe origin from bunker client state.
 * @returns {string} Signer frame origin or empty string.
 */
function getSignerFrameOrigin() {
    if (!state.bunkerClient || typeof state.bunkerClient.getState !== "function") return "";
    const snapshot = state.bunkerClient.getState();
    return String(snapshot?.signerFrameOrigin || "");
}

/**
 * Requests the signer iframe to switch to management/unlock view.
 * @returns {void}
 */
function requestSignerManagementView() {
    if (!(signerFrameEl instanceof HTMLIFrameElement) || !signerFrameEl.contentWindow) return;
    const signerFrameOrigin = getSignerFrameOrigin();
    if (!signerFrameOrigin) return;
    try {
        signerFrameEl.contentWindow.postMessage(
            {
                source: BRIDGE_SOURCE,
                type: "show-management",
                payload: {}
            },
            signerFrameOrigin
        );
    } catch (_err) {
        // Ignore postMessage transport errors in UI hint path.
    }
}

/**
 * Requests `wp-ensure-user-key` from signer iframe bridge.
 * @param {string} userId - User ID sent to signer.
 * @param {number} timeoutMs - Timeout in milliseconds.
 * @returns {Promise<SignerEnsureResult>} Ensure result payload.
 */
function requestWpEnsureUserKey(userId, timeoutMs = 15000) {
    /**
     * Executes the signer bridge request promise.
     * @param {(value: SignerEnsureResult) => void} resolve - Promise resolve.
     * @param {(reason?: any) => void} reject - Promise reject.
     */
    function executeRequest(resolve, reject) {
        if (!(signerFrameEl instanceof HTMLIFrameElement) || !signerFrameEl.contentWindow) {
            reject(new Error("Signer-iframe ist nicht bereit."));
            return;
        }

        const signerFrameOrigin = getSignerFrameOrigin();
        if (!signerFrameOrigin) {
            reject(new Error("Signer-Origin ist unbekannt."));
            return;
        }

        const normalizedUserId = String(userId || "").trim();
        if (!normalizedUserId) {
            reject(new Error("User-ID fuer Signer fehlt."));
            return;
        }

        const requestId = `wp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

        /**
         * Handles bridge replies for one request ID.
         * @param {MessageEvent} event - Browser message event.
         */
        function onMessage(event) {
            if (event.origin !== signerFrameOrigin) return;
            const data = event.data;
            if (!data || data.source !== BRIDGE_SOURCE) return;
            if (data.type !== "wp-user-key-result") return;
            const responseRequestId = typeof data?.payload?.requestId === "string" ? data.payload.requestId : "";
            if (responseRequestId && responseRequestId !== requestId) return;

            clearTimeout(timeoutHandle);
            window.removeEventListener("message", onMessage);

            if (!data.payload?.ok) {
                reject(new Error(String(data.payload?.error || "Signer konnte keinen User-Key liefern.")));
                return;
            }
            resolve(data.payload);
        }

        /**
         * Handles bridge request timeout.
         */
        function onTimeout() {
            window.removeEventListener("message", onMessage);
            state.signerUnlockFlowActive = true;
            openSignerDialog();
            requestSignerManagementView();
            reject(new Error("Keine Antwort vom Signer auf wp-ensure-user-key. Bitte Signer öffnen, entsperren und erneut versuchen."));
        }

        const timeoutHandle = setTimeout(onTimeout, timeoutMs);

        window.addEventListener("message", onMessage);
        signerFrameEl.contentWindow.postMessage(
            {
                source: BRIDGE_SOURCE,
                type: "wp-ensure-user-key",
                payload: { requestId, userId: normalizedUserId }
            },
            signerFrameOrigin
        );
    }

    return new Promise(executeRequest);
}

/**
 * Waits until signer bridge returns connection-info.
 * This prevents early wp-ensure requests before signer startup completed.
 * @param {number} timeoutMs - Maximum wait time.
 * @param {number} pollMs - Poll interval.
 * @returns {Promise<void>} Resolves when bridge is ready.
 */
async function waitForSignerBridgeReady(timeoutMs = 20000, pollMs = 500) {
    if (!state.bunkerClient || typeof state.bunkerClient.syncConnectionInfo !== "function") return;
    const deadline = Date.now() + Math.max(1000, Number(timeoutMs) || 20000);
    let lastErrorMessage = "";
    let signerDialogRequested = false;

    while (Date.now() < deadline) {
        try {
            await state.bunkerClient.syncConnectionInfo();
            return;
        } catch (error) {
            lastErrorMessage = String(error?.message || "");
            if (!signerDialogRequested) {
                state.signerUnlockFlowActive = true;
                openSignerDialog();
                requestSignerManagementView();
                signerDialogRequested = true;
            } else if (isLockedSignerMessage(lastErrorMessage)) {
                requestSignerManagementView();
            }
            await new Promise((resolve) => setTimeout(resolve, Math.max(100, Number(pollMs) || 500)));
        }
    }

    if (lastErrorMessage) {
        throw new Error(`Signer-Bridge nicht bereit: ${lastErrorMessage}`);
    }
    throw new Error("Signer-Bridge nicht bereit.");
}

/**
 * Builds one signer result object from bridge connection info.
 * @param {any} connectionInfo - Bridge connection payload.
 * @returns {SignerEnsureResult|null} Normalized signer result or null.
 */
function signerResultFromBridgeConnectionInfo(connectionInfo) {
    const pubkey = normalizePubkey(String(connectionInfo?.pubkey || ""));
    if (!isPubkeyHex(pubkey)) return null;
    const npub = String(connectionInfo?.npub || "").trim();
    const keyName = String(connectionInfo?.keyName || "Aktiver Signer-Key").trim() || "Aktiver Signer-Key";
    return {
        userId: "",
        keyId: "",
        keyName,
        pubkey,
        npub,
        existed: true,
        active: true
    };
}

/**
 * Resolves signer pubkey from bridge without triggering wp-ensure.
 * @param {number} timeoutMs - Maximum wait time in ms.
 * @returns {Promise<SignerEnsureResult>} Signer result based on active bridge key.
 */
async function resolveSignerResultFromBridge(timeoutMs = 12000) {
    if (!state.bunkerClient) {
        throw new Error("Signer-Bridge ist nicht initialisiert.");
    }
    const deadline = Date.now() + Math.max(1000, Number(timeoutMs) || 12000);
    let lastErrorMessage = "";

    while (Date.now() < deadline) {
        let connectionInfo = null;
        try {
            if (typeof state.bunkerClient.syncPublicConnectionInfo === "function") {
                connectionInfo = await state.bunkerClient.syncPublicConnectionInfo();
            } else if (typeof state.bunkerClient.syncConnectionInfo === "function") {
                connectionInfo = await state.bunkerClient.syncConnectionInfo();
            }
        } catch (error) {
            lastErrorMessage = String(error?.message || "");
        }

        if (!connectionInfo && typeof state.bunkerClient.getState === "function") {
            const snapshot = state.bunkerClient.getState();
            connectionInfo = snapshot?.lastBridgeConnectionInfo || snapshot?.activeConnection || null;
        }

        const signerResult = signerResultFromBridgeConnectionInfo(connectionInfo);
        if (signerResult) {
            state.lastEnsureResult = signerResult;
            renderSignerResult(signerResult);
            return signerResult;
        }

        if (!lastErrorMessage) {
            lastErrorMessage = "Signer liefert keinen gueltigen Bridge-Pubkey.";
        }
        await new Promise((resolve) => setTimeout(resolve, 350));
    }

    throw new Error(lastErrorMessage || "Signer liefert keinen gueltigen Bridge-Pubkey.");
}

/**
 * Ensures a signer key for the currently active identity.
 * @returns {Promise<SignerEnsureResult>} Ensure result.
 */
async function ensureSignerKeyForActiveIdentity() {
    if (!state.activeIdentity) throw new Error("Identity ist noch nicht geladen.");

    const dialogWasOpen = isSignerDialogOpen();
    if (!dialogWasOpen) {
        state.signerUnlockFlowActive = true;
        openSignerDialog();
    }

    await waitForSignerBridgeReady(25000, 500);
    const adapter = resolveProviderAdapter(state.activeIdentity.provider);
    const bridgeUserId = adapter.toBridgeUserId(state.activeIdentity);
    const ensureResult = await requestWpEnsureUserKey(bridgeUserId, 120000);
    state.lastEnsureResult = ensureResult;
    renderSignerResult(ensureResult);
    appendResultLine(`Signer-Key bereit: ${ensureResult.pubkey.slice(0, 16)}... (${ensureResult.keyName})`);
    if (!dialogWasOpen && state.signerUnlockFlowActive) {
        state.signerUnlockFlowActive = false;
        closeSignerDialog();
    }
    return ensureResult;
}

/**
 * Resolves signer result for current identity with compare-first strategy.
 * Uses bridge pubkey when backend is already bound, wp-ensure only when needed.
 * @returns {Promise<SignerEnsureResult>} Signer result for reconciliation.
 */
async function resolveSignerResultForActiveIdentity() {
    if (!state.activeIdentity) throw new Error("Identity ist noch nicht geladen.");
    const expectedPubkey = normalizePubkey(state.activeIdentity.expectedPubkey);
    const isBackendBound = isPubkeyHex(expectedPubkey);

    try {
        const bridgeResult = await resolveSignerResultFromBridge(15000);
        appendResultLine(`Signer-Bridge-Pubkey genutzt: ${bridgeResult.pubkey.slice(0, 16)}...`);
        return bridgeResult;
    } catch (bridgeError) {
        const bridgeMessage = String(bridgeError?.message || "Bridge-Pubkey nicht verfuegbar.");
        appendResultLine(`Bridge-Pubkey nicht verfuegbar: ${bridgeMessage}`);
        if (isBackendBound) {
            throw bridgeError;
        }
    }

    appendResultLine("Backend ungebunden: Fallback auf wp-ensure-user-key.");
    return ensureSignerKeyForActiveIdentity();
}

/**
 * Reconciles backend expected pubkey with signer result.
 * Automatically binds when identity is unbound and auto-bind is enabled.
 * @returns {Promise<void>} Resolves when reconciliation is complete.
 */
async function reconcileBindingState() {
    if (!state.activeIdentity || !state.lastEnsureResult) {
        setBindingStatus("idle");
        setMismatchView("", "");
        return;
    }

    const expectedPubkey = normalizePubkey(state.activeIdentity.expectedPubkey);
    const signerPubkey = normalizePubkey(state.lastEnsureResult.pubkey);

    setMismatchView(expectedPubkey, signerPubkey);

    if (!isPubkeyHex(signerPubkey)) {
        setBindingStatus("error");
        setStatusText(overallStatusEl, "Signer liefert keinen gueltigen Pubkey.", "error");
        return;
    }

    if (!expectedPubkey) {
        setBindingStatus("unbound");
        setStatusText(overallStatusEl, "Backend ist noch ungebunden.", "warn");
        if (state.runtimeConfig.autoBindOnUnbound) {
            await sendBindingUpdate("bind");
            setMismatchView(state.activeIdentity.expectedPubkey, signerPubkey);
            setBindingStatus("matched");
            setStatusText(overallStatusEl, "Erstzuordnung gespeichert. Identity und Signer sind konsistent.", "ok");
            return;
        }
        return;
    }

    if (expectedPubkey === signerPubkey) {
        setBindingStatus("matched");
        setStatusText(overallStatusEl, "Identity und Signer-Pubkey stimmen ueberein.", "ok");
        return;
    }

    setBindingStatus("mismatched");
    setStatusText(overallStatusEl, "Pubkey-Konflikt erkannt. Rebind oder Signer-Key-Switch notwendig.", "error");
}

/**
 * Runs full sync: load identity, ensure signer key, reconcile.
 * @returns {Promise<void>} Resolves when sync is complete.
 */
async function runFullSync() {
    if (state.isBusy) return;
    setBusyState(true);
    setStatusText(overallStatusEl, "Synchronisiere Identity-Link-Status ...", "idle");

    try {
        await loadIdentityFromBackend();
        await resolveSignerResultForActiveIdentity();
        await reconcileBindingState();
    } catch (error) {
        const message = String(error?.message || "Unbekannter Fehler.");
        setBindingStatus("error");
        setStatusText(overallStatusEl, `Sync fehlgeschlagen: ${message}`, "error");
        appendResultLine(`Fehler: ${message}`);
        if (isLockedSignerMessage(message)) {
            state.signerUnlockFlowActive = true;
            openSignerDialog();
            requestSignerManagementView();
        }
    } finally {
        setBusyState(false);
    }
}

/**
 * Reloads identity only and refreshes mismatch view against current signer data.
 * @returns {Promise<void>} Resolves when refresh is complete.
 */
async function refreshIdentityOnly() {
    if (state.isBusy) return;
    setBusyState(true);
    setStatusText(overallStatusEl, "Lade Identity neu ...", "idle");

    try {
        await loadIdentityFromBackend();
        await reconcileBindingState();
        if (state.bindingStatus === "matched") {
            setStatusText(overallStatusEl, "Identity aktualisiert. Zuordnung bleibt konsistent.", "ok");
        } else if (state.bindingStatus === "mismatched") {
            setStatusText(overallStatusEl, "Identity aktualisiert. Konflikt besteht weiterhin.", "error");
        } else {
            setStatusText(overallStatusEl, "Identity aktualisiert.", "idle");
        }
    } catch (error) {
        const message = String(error?.message || "Unbekannter Fehler.");
        setStatusText(overallStatusEl, `Identity-Reload fehlgeschlagen: ${message}`, "error");
        appendResultLine(`Identity-Reload Fehler: ${message}`);
    } finally {
        setBusyState(false);
    }
}

/**
 * Handles manual ensure-key button click.
 * @returns {Promise<void>} Resolves when action completes.
 */
async function onEnsureLinkClicked() {
    if (state.isBusy) return;
    setBusyState(true);
    setStatusText(overallStatusEl, "Pruefe Signer-Key und Zuordnung ...", "idle");

    try {
        if (!state.activeIdentity) {
            await loadIdentityFromBackend();
        }
        await resolveSignerResultForActiveIdentity();
        await reconcileBindingState();
    } catch (error) {
        const message = String(error?.message || "Unbekannter Fehler.");
        setBindingStatus("error");
        setStatusText(overallStatusEl, `Signer-Key Anfrage fehlgeschlagen: ${message}`, "error");
        appendResultLine(`Signer-Key Fehler: ${message}`);
        if (isLockedSignerMessage(message)) {
            state.signerUnlockFlowActive = true;
            openSignerDialog();
            requestSignerManagementView();
        }
    } finally {
        setBusyState(false);
    }
}

/**
 * Handles manual rebind button click.
 * @returns {Promise<void>} Resolves when action completes.
 */
async function onRebindClicked() {
    if (state.isBusy) return;
    setBusyState(true);
    setStatusText(overallStatusEl, "Fuehre Rebind auf aktuellen Signer-Pubkey aus ...", "warn");

    try {
        await sendBindingUpdate("rebind");
        await reconcileBindingState();
        if (state.bindingStatus === "matched") {
            setStatusText(overallStatusEl, "Rebind erfolgreich. Konflikt aufgeloest.", "ok");
        }
    } catch (error) {
        const message = String(error?.message || "Unbekannter Fehler.");
        setStatusText(overallStatusEl, `Rebind fehlgeschlagen: ${message}`, "error");
        appendResultLine(`Rebind Fehler: ${message}`);
    } finally {
        setBusyState(false);
    }
}

/**
 * Handles Signer open button click.
 */
function onOpenSignerClicked() {
    openSignerDialog();
    requestSignerManagementView();
}

/**
 * Handles Signer close button click.
 */
function onCloseSignerClicked() {
    closeSignerDialog();
}

/**
 * Handles reload-identity button click.
 * @returns {Promise<void>} Resolves when action completes.
 */
async function onReloadIdentityClicked() {
    await refreshIdentityOnly();
}

/**
 * Handles bunker client status callback.
 * @param {{text: string, isError: boolean}} status - Status payload.
 */
function onBunkerClientStatus(status) {
    const text = String(status?.text || "Status unbekannt.");
    const isError = !!status?.isError;
    const isWarn = isLockedSignerMessage(text);
    const stateValue = isError ? "error" : isWarn ? "warn" : "idle";

    setStatusText(signerStatusEl, text, stateValue);
    setStatusText(signerDialogStatusEl, text, stateValue);

    if (isWarn) {
        state.signerUnlockFlowActive = true;
        openSignerDialog();
        requestSignerManagementView();
        return;
    }

    if (state.signerUnlockFlowActive && isReadySignerMessage(text)) {
        state.signerUnlockFlowActive = false;
        closeSignerDialog();
        if (!state.isBusy) {
            runFullSync().catch(() => {});
        }
    }
}

/**
 * Handles bunker client connection changed callback.
 * @param {object|null} connection - Connection payload.
 */
function onBunkerClientConnectionChanged(connection) {
    if (connection?.pubkey) {
        setStatusText(signerStatusEl, "Signer verbunden. Bridge bereit.", "ok");
        setStatusText(signerDialogStatusEl, "Signer verbunden. Bridge bereit.", "ok");
    }
}

/**
 * Initializes bunker bridge client without parent relay auto-connect.
 * @returns {Promise<void>} Resolves after iframe setup.
 */
async function initBunkerBridgeClient() {
    if (!(signerFrameEl instanceof HTMLIFrameElement)) {
        throw new Error("signer-frame fehlt.");
    }

    state.bunkerClient = createBunkerConnectClient({
        signerFrameEl,
        signerUrl: state.runtimeConfig.signerUri,
        autoConnect: false,
        exposeWindowNostr: false,
        showUnlockRequestDialog: false,
        showApprovalRequestDialog: false,
        statusEl: signerStatusEl || undefined,
        onStatus: onBunkerClientStatus,
        onConnectionChanged: onBunkerClientConnectionChanged
    });

    await state.bunkerClient.installSignerAndAutoConnect();
}

/**
 * Registers UI event handlers.
 */
function bindUiEvents() {
    if (reloadIdentityBtn instanceof HTMLButtonElement) {
        reloadIdentityBtn.addEventListener("click", onReloadIdentityClicked);
    }
    if (ensureLinkBtn instanceof HTMLButtonElement) {
        ensureLinkBtn.addEventListener("click", onEnsureLinkClicked);
    }
    if (rebindBtn instanceof HTMLButtonElement) {
        rebindBtn.addEventListener("click", onRebindClicked);
    }
    if (openSignerBtn instanceof HTMLButtonElement) {
        openSignerBtn.addEventListener("click", onOpenSignerClicked);
    }
    if (closeSignerBtn instanceof HTMLButtonElement) {
        closeSignerBtn.addEventListener("click", onCloseSignerClicked);
    }
}

/**
 * Tears down bunker client resources.
 */
function destroyIdentityLinkClient() {
    if (!state.bunkerClient || typeof state.bunkerClient.destroy !== "function") return;
    state.bunkerClient.destroy();
}

/**
 * Boots the identity-link client.
 * @returns {Promise<void>} Resolves after startup flow.
 */
async function bootstrap() {
    state.runtimeConfig = resolveRuntimeConfig();
    bindUiEvents();
    renderIdentity(null);
    renderSignerResult(null);
    setBindingStatus("idle");
    setMismatchView("", "");

    try {
        await initBunkerBridgeClient();
        await runFullSync();
    } catch (error) {
        const message = String(error?.message || "Unbekannter Startfehler.");
        setBindingStatus("error");
        setStatusText(overallStatusEl, `Initialisierung fehlgeschlagen: ${message}`, "error");
        setStatusText(signerStatusEl, `Initialisierung fehlgeschlagen: ${message}`, "error");
        setStatusText(signerDialogStatusEl, `Initialisierung fehlgeschlagen: ${message}`, "error");
        appendResultLine(`Init Fehler: ${message}`);
    }
}

window.addEventListener("beforeunload", destroyIdentityLinkClient);
bootstrap();
