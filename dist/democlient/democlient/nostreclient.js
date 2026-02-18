import { createBunkerConnectClient } from "./nostr.js";
import { bindCharacterCounter, collectFormValues, renderFormSchema, validateFormValues } from "./forms/form-generator.js";
import { buildUnsignedEventFromForm } from "./forms/kind-adapters/index.js";
import { isSupportedSchemaVersion, loadFormSchema } from "./forms/schema-loader.js";

const NOSTR_DATA_ATTRIBUTE = "data-nostr";

const DEFAULT_SIGNER_IFRAME_URI = "../signer.html";
const APPROVAL_BUTTON_FIND_TIMEOUT_MS = 2500;
const APPROVAL_BUTTON_FIND_POLL_MS = 80;
const REQUEST_PREVIEW_MAX_LEN = 100;
const REQUIRED_BASE_ELEMENT_ROLES = [
    "signer-frame",
    "signer-setup-dialog",
    "open-signer-external-btn",
    "show-signer-btn",
    "status",
    "result",
    "connection-info",
    "approval-preview",
    "approval-preview-method",
    "approval-preview-content",
    "signer-request-dialog",
    "signer-request-title",
    "signer-request-details",
    "request-allow-once-btn",
    "request-allow-always-btn",
    "request-reject-btn"
];
const REQUIRED_FORM_ELEMENT_ROLES = [
    "send-btn",
    "post-form",
    "form-fields",
    "content-count"
];

/**
 * Resolves one DOM element by semantic role.
 * Lookup order: `data-nostr="<role>"` first, then `id="<role>"`.
 * @param {string} role - Semantic role of the element.
 * @returns {HTMLElement|null} Matching element or null.
 */
function getElementByRole(role) {
    const safeRole = String(role || "").trim();
    if (!safeRole) return null;

    const byDataRole = document.querySelector(`[${NOSTR_DATA_ATTRIBUTE}="${safeRole}"]`);
    if (byDataRole instanceof HTMLElement) return byDataRole;

    const byId = document.getElementById(safeRole);
    if (byId instanceof HTMLElement) return byId;

    return null;
}

const sendBtn = getElementByRole("send-btn");
const signerFrame = /** @type {HTMLIFrameElement|null} */ (getElementByRole("signer-frame"));
const signerSetupDialogEl = /** @type {HTMLDialogElement|null} */ (getElementByRole("signer-setup-dialog"));
const setupCardEl = getElementByRole("setup-card") || document.querySelector(".setup-card");
const setupDialogTitleEl = getElementByRole("setup-dialog-title");
const setupDialogHintEl = getElementByRole("setup-dialog-hint");
const openSignerExternalBtn = getElementByRole("open-signer-external-btn");
const closeSignerDialogBtn = getElementByRole("close-signer-dialog-btn");
const showSignerBtn = getElementByRole("show-signer-btn");
const showSignerLabel = getElementByRole("show-signer-label");
const statusEl = getElementByRole("status");
const resultEl = getElementByRole("result");
const connectionInfoEl = getElementByRole("connection-info");
const approvalPreviewEl = getElementByRole("approval-preview");
const approvalPreviewMethodEl = getElementByRole("approval-preview-method");
const approvalPreviewContentEl = getElementByRole("approval-preview-content");
const postForm = /** @type {HTMLFormElement|null} */ (getElementByRole("post-form"));
const formFieldsEl = getElementByRole("form-fields");
const contentCountEl = getElementByRole("content-count");
const requestDialogEl = /** @type {HTMLDialogElement|null} */ (getElementByRole("signer-request-dialog"));
const requestTitleEl = getElementByRole("signer-request-title");
const requestDetailsEl = getElementByRole("signer-request-details");
const requestAllowOnceBtn = /** @type {HTMLButtonElement|null} */ (getElementByRole("request-allow-once-btn"));
const requestAllowAlwaysBtn = /** @type {HTMLButtonElement|null} */ (getElementByRole("request-allow-always-btn"));
const requestRejectBtn = /** @type {HTMLButtonElement|null} */ (getElementByRole("request-reject-btn"));

/**
 * @typedef {object} NostreClientConfig
 * @property {string=} signer_iframe_uri - Relative/absolute Signer URI.
 * @property {string=} signerIframeUri - camelCase alias for signer URI.
 * @property {string[]=} relays - Optional relay override list.
 * @property {boolean=} allow_nip07 - Expose `window.nostr` (NIP-07 shape).
 * @property {boolean=} allowNip07 - camelCase alias for NIP-07 exposure.
 * @property {string=} custom_bunker_uri - Optional fixed bunker URI fallback.
 * @property {string=} customBunkerUri - camelCase alias for bunker URI fallback.
 * @property {string=} form_uri - Optional JSON form schema URI.
 * @property {string=} formUri - camelCase alias for schema URI.
 */

/**
 * @typedef {object} NostreClientInitOptions
 * @property {NostreClientConfig=} config - Init configuration payload.
 */

/**
 * @typedef {object} NormalizedNostreClientConfig
 * @property {string} signerIframeUri - Signer page URI.
 * @property {string[]} relays - Optional relay override list.
 * @property {boolean} allowNip07 - Expose NIP-07 compatible API on window.
 * @property {string} customBunkerUri - Optional bunker URI fallback.
 * @property {string} formUri - Optional form schema URI.
 */

let currentConnection = null;
let signerFrameUiObserver = null;
let signerFrameUiSyncScheduled = false;
let bunkerClient = null;
let hiddenConnectionUriInput = null;
let activeFormSchema = null;
let formCounterCleanup = null;
let bootstrapStarted = false;
let runtimeConfig = {
    signerIframeUri: DEFAULT_SIGNER_IFRAME_URI,
    relays: [],
    allowNip07: true,
    customBunkerUri: "",
    formUri: ""
};

/**
 * Checks whether the generated form mode is enabled.
 * @param {NormalizedNostreClientConfig=} config - Effective runtime config.
 * @returns {boolean} True when one form URI is configured.
 */
function isFormUiEnabled(config = runtimeConfig) {
    return Boolean(String(config?.formUri || "").trim());
}

/**
 * Resolves and validates required DOM elements by role.
 * @param {{requiresFormUi?: boolean}=} options - Validation options.
 * @throws {Error} If one or more required elements are missing.
 */
function ensureRequiredDemoElements(options = {}) {
    const requiresFormUi = Boolean(options.requiresFormUi);
    const requiredRoles = requiresFormUi
        ? [...REQUIRED_BASE_ELEMENT_ROLES, ...REQUIRED_FORM_ELEMENT_ROLES]
        : REQUIRED_BASE_ELEMENT_ROLES;
    const missingRoles = requiredRoles.filter((role) => !getElementByRole(role));
    if (missingRoles.length === 0) return;
    throw new Error(`Fehlende Demo-Elemente (data-nostr oder id): ${missingRoles.join(", ")}`);
}

/**
 * Normalizes optional relay list.
 * @param {unknown} relayCandidates - Raw relay candidates.
 * @returns {string[]} Normalized relay list.
 */
function normalizeRelayList(relayCandidates) {
    if (!Array.isArray(relayCandidates)) return [];
    return relayCandidates
        .map((relay) => String(relay || "").trim())
        .filter(Boolean);
}

/**
 * Normalizes init config with snake_case and camelCase support.
 * @param {NostreClientConfig=} rawConfig - Init config payload.
 * @returns {NormalizedNostreClientConfig} Normalized config.
 */
function normalizeInitConfig(rawConfig = {}) {
    const config = rawConfig || {};
    const signerIframeUri = String(
        config.signer_iframe_uri ||
        config.signerIframeUri ||
        DEFAULT_SIGNER_IFRAME_URI
    ).trim() || DEFAULT_SIGNER_IFRAME_URI;
    const relays = normalizeRelayList(config.relays);
    const allowNip07 = Boolean(
        config.allow_nip07 !== undefined
            ? config.allow_nip07
            : config.allowNip07 !== undefined
                ? config.allowNip07
                : true
    );
    const customBunkerUri = String(
        config.custom_bunker_uri ||
        config.customBunkerUri ||
        ""
    ).trim();
    const formUri = String(
        config.form_uri ||
        config.formUri ||
        ""
    ).trim();

    return {
        signerIframeUri,
        relays,
        allowNip07,
        customBunkerUri,
        formUri
    };
}

/**
 * Returns active bunker client or throws when not initialized.
 * @returns {ReturnType<typeof createBunkerConnectClient>} Active client instance.
 * @throws {Error} If client setup was not initialized.
 */
function getBunkerClientOrThrow() {
    if (!bunkerClient) {
        throw new Error("nostrclient.init(...) wurde noch nicht ausgefuehrt.");
    }
    return bunkerClient;
}

/**
 * Removes previously mounted hidden connection URI input.
 */
function removeHiddenConnectionUriInput() {
    if (!hiddenConnectionUriInput) return;
    hiddenConnectionUriInput.remove();
    hiddenConnectionUriInput = null;
}

/**
 * Applies visual state and text to the signer button.
 * @param {"connecting"|"ready"|"error"} state - Button state.
 * @param {string} label - Label text.
 */
function setSignerButtonState(state, label) {
    showSignerBtn.dataset.state = state;
    if (showSignerLabel) {
        showSignerLabel.textContent = label;
    } else {
        showSignerBtn.textContent = label;
    }
}

/**
 * Sets the setup dialog presentation for setup or connected mode.
 * @param {boolean} isReady - True when signer is connected.
 */
function setSetupDialogMode(isReady) {
    if (setupDialogTitleEl) {
        setupDialogTitleEl.textContent = isReady ? "NIP-46 Signer" : "Signer Setup";
    }
    if (setupDialogHintEl) {
        setupDialogHintEl.hidden = Boolean(isReady);
    }
    if (statusEl) {
        statusEl.hidden = Boolean(isReady);
    }
    if (setupCardEl) {
        setupCardEl.classList.toggle("compact-connected-view", Boolean(isReady));
    }
}

/**
 * Normalizes text for compact request previews.
 * @param {string} text - Raw text.
 * @param {number=} maxLen - Maximum length.
 * @returns {string} Normalized text.
 */
function normalizePreviewText(text, maxLen = REQUEST_PREVIEW_MAX_LEN) {
    const compact = String(text || "").replace(/\s+/g, " ").trim();
    if (!compact) return "";
    if (compact.length <= maxLen) return compact;
    return `${compact.slice(0, maxLen)}...`;
}

/**
 * Parses method and parameter text from signer request details.
 * @param {string} requestDetailsText - Raw signer details text.
 * @returns {{method: string, paramsText: string}} Parsed parts.
 */
function parseSignerRequestDetailsText(requestDetailsText) {
    const raw = String(requestDetailsText || "");
    const knownMethodMatch = raw.match(/\b(sign_event|nip04_encrypt|nip04_decrypt|nip44_encrypt|nip44_decrypt|connect|get_public_key)\b/i);
    const method = knownMethodMatch ? knownMethodMatch[1].toLowerCase() : "";
    const paramMarkerMatch = raw.match(/Parameter:\s*/i);
    if (!paramMarkerMatch || typeof paramMarkerMatch.index !== "number") {
        return { method, paramsText: "" };
    }

    const paramStart = paramMarkerMatch.index + paramMarkerMatch[0].length;
    return {
        method,
        paramsText: raw.slice(paramStart).trim()
    };
}

/**
 * Maps signer request title text to method name.
 * @param {string} requestTitleText - Raw signer request title.
 * @returns {string} Method or empty string.
 */
function methodFromSignerRequestTitle(requestTitleText) {
    const title = String(requestTitleText || "").toLowerCase();
    const normalized = title
        .replace(/\u00e4/g, "ae")
        .replace(/\u00f6/g, "oe")
        .replace(/\u00fc/g, "ue")
        .replace(/\u00df/g, "ss");
    if (!normalized) return "";
    if (normalized.includes("signieren")) return "sign_event";
    if (normalized.includes("verschl")) return "nip44_encrypt";
    if (normalized.includes("entschl")) return "nip44_decrypt";
    if (normalized.includes("verbindung")) return "connect";
    if (normalized.includes("oeffentlichen schluessel")) return "get_public_key";
    return "";
}

/**
 * Parses JSON-like signer params text.
 * @param {string} paramsText - Raw params text.
 * @returns {any|null} Parsed JSON object/array or null.
 */
function parseSignerParamsAsJson(paramsText) {
    const text = String(paramsText || "").trim();
    if (!text) return null;
    if (!text.startsWith("{") && !text.startsWith("[")) return null;
    try {
        return JSON.parse(text);
    } catch (_err) {
        return null;
    }
}

/**
 * Extracts preview content from parsed JSON params.
 * @param {string} method - Request method.
 * @param {any} parsedParams - Parsed params.
 * @returns {string} Content snippet or empty.
 */
function extractPreviewContentForMethod(method, parsedParams) {
    if (!parsedParams) return "";

    if (method === "sign_event") {
        if (typeof parsedParams?.content === "string") return normalizePreviewText(parsedParams.content);
        if (typeof parsedParams?.event?.content === "string") return normalizePreviewText(parsedParams.event.content);
        return "";
    }

    if (method === "nip04_encrypt" || method === "nip44_encrypt") {
        if (Array.isArray(parsedParams) && typeof parsedParams[1] === "string") return normalizePreviewText(parsedParams[1]);
        if (typeof parsedParams?.plaintext === "string") return normalizePreviewText(parsedParams.plaintext);
        if (typeof parsedParams?.content === "string") return normalizePreviewText(parsedParams.content);
        return "";
    }

    return "";
}

/**
 * Extracts preview content from raw params string if JSON parsing fails.
 * @param {string} method - Request method.
 * @param {string} paramsText - Raw params text.
 * @returns {string} Content snippet or empty.
 */
function extractPreviewContentFromRawParams(method, paramsText) {
    const text = String(paramsText || "");
    if (!text) return "";

    if (method === "sign_event") {
        const contentMatch = text.match(/["']content["']\s*:\s*["']([\s\S]*?)["']/i);
        if (contentMatch && contentMatch[1]) return normalizePreviewText(contentMatch[1].replace(/\\n/g, " "));
        return "";
    }

    if (method === "nip04_encrypt" || method === "nip44_encrypt") {
        const plaintextMatch = text.match(/["']plaintext["']\s*:\s*["']([\s\S]*?)["']/i);
        if (plaintextMatch && plaintextMatch[1]) return normalizePreviewText(plaintextMatch[1].replace(/\\n/g, " "));
        const arrayStyleMatch = text.match(/^\s*\[\s*["'][^"']*["']\s*,\s*["']([\s\S]*?)["']/);
        if (arrayStyleMatch && arrayStyleMatch[1]) return normalizePreviewText(arrayStyleMatch[1].replace(/\\n/g, " "));
        return "";
    }

    return "";
}

/**
 * Builds compact approval preview payload from signer request texts.
 * @param {string} requestTitleText - Raw request title.
 * @param {string} requestDetailsText - Raw request details.
 * @returns {{methodText: string, contentText: string}} Preview payload.
 */
function buildApprovalPreview(requestTitleText, requestDetailsText) {
    const parsed = parseSignerRequestDetailsText(requestDetailsText);
    const method = parsed.method || methodFromSignerRequestTitle(requestTitleText);
    const jsonParams = parseSignerParamsAsJson(parsed.paramsText);
    const previewContent =
        extractPreviewContentForMethod(method, jsonParams) ||
        extractPreviewContentFromRawParams(method, parsed.paramsText);

    if (method === "sign_event") {
        return {
            methodText: "Signieren und senden",
            contentText: previewContent ? `"${previewContent}"` : ""
        };
    }

    if (method === "nip04_encrypt" || method === "nip44_encrypt") {
        return {
            methodText: "Nachricht verschluesseln",
            contentText: previewContent ? `"${previewContent}"` : ""
        };
    }

    if (method === "nip04_decrypt" || method === "nip44_decrypt") {
        return {
            methodText: "Nachricht entschluesseln",
            contentText: ""
        };
    }

    if (method === "connect") {
        return {
            methodText: "Verbindung freigeben",
            contentText: ""
        };
    }

    if (method === "get_public_key") {
        return {
            methodText: "Oeffentlichen Schluessel freigeben",
            contentText: ""
        };
    }

    const fallbackTitle = normalizePreviewText(String(requestTitleText || "").replace(/[?!]+$/g, ""), 72);
    if (fallbackTitle) {
        return {
            methodText: fallbackTitle,
            contentText: ""
        };
    }

    return {
        methodText: "Keine offene Signer-Anfrage.",
        contentText: ""
    };
}

/**
 * Renders an idle preview state.
 */
function renderIdleApprovalPreview() {
    if (approvalPreviewEl) {
        approvalPreviewEl.hidden = true;
    }
    if (approvalPreviewMethodEl) {
        approvalPreviewMethodEl.textContent = "Keine offene Signer-Anfrage.";
    }
    if (approvalPreviewContentEl) {
        approvalPreviewContentEl.textContent = "";
    }
}

/**
 * Renders an active approval preview state.
 * @param {{methodText: string, contentText: string}} preview - Preview payload.
 */
function renderApprovalPreview(preview) {
    if (approvalPreviewEl) {
        approvalPreviewEl.hidden = false;
    }
    if (approvalPreviewMethodEl) {
        approvalPreviewMethodEl.textContent = preview.methodText;
    }
    if (approvalPreviewContentEl) {
        approvalPreviewContentEl.textContent = preview.contentText || "";
    }
}

/**
 * Checks whether a signer frame element is visible.
 * @param {Element|null} element - DOM element from signer iframe.
 * @returns {boolean} True when visible.
 */
function isFrameElementVisible(element) {
    if (!element) return false;
    if (element.hasAttribute("hidden")) return false;
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

/**
 * Syncs the setup dialog request preview from signer iframe modal state.
 */
function syncSetupApprovalPreviewFromFrame() {
    let frameDoc = null;
    try {
        frameDoc = signerFrame.contentDocument;
    } catch (_err) {
        renderIdleApprovalPreview();
        return;
    }
    if (!frameDoc) {
        renderIdleApprovalPreview();
        return;
    }

    const authModal = frameDoc.getElementById("auth-modal");
    const hasActiveRequest = isFrameElementVisible(authModal);
    frameDoc.body?.classList.toggle("demo-has-request", hasActiveRequest);

    if (!hasActiveRequest) {
        renderIdleApprovalPreview();
        return;
    }

    const rawTitle = frameDoc.getElementById("request-title")?.textContent?.trim() || "";
    const rawDetails = frameDoc.getElementById("request-details")?.textContent?.trim() || "";
    const preview = buildApprovalPreview(rawTitle, rawDetails);
    renderApprovalPreview(preview);
}

/**
 * Schedules one consolidated iframe UI sync on the next animation frame.
 */
function scheduleSignerFrameUiSync() {
    if (signerFrameUiSyncScheduled) return;
    signerFrameUiSyncScheduled = true;
    requestAnimationFrame(() => {
        signerFrameUiSyncScheduled = false;
        applyEmbeddedSignerCompactPresentation();
        syncSetupApprovalPreviewFromFrame();
    });
}

/**
 * Applies demo-specific compact embedded styling to the signer iframe.
 * Hides duplicate app title when signer runs in compact-connected mode.
 */
function applyEmbeddedSignerCompactPresentation() {
    let frameDoc = null;
    try {
        frameDoc = signerFrame.contentDocument;
    } catch (_err) {
        return;
    }
    if (!frameDoc?.body) return;

    const isCompactConnected = frameDoc.body.classList.contains("compact-connected");
    if (setupCardEl) {
        setupCardEl.classList.toggle("compact-connected-view", isCompactConnected);
    }

    let styleEl = frameDoc.getElementById("demo-embed-style");
    if (!styleEl) {
        styleEl = frameDoc.createElement("style");
        styleEl.id = "demo-embed-style";
        frameDoc.head?.appendChild(styleEl);
    }
    styleEl.textContent =
        "body.compact-connected #app-title{display:none !important;}" +
        "body.compact-connected.demo-has-request #status{display:none !important;}" +
        "body.compact-connected.demo-has-request #user-info{display:none !important;}" +
        "body.compact-connected #overlay{display:none !important;}" +
        "body.compact-connected #auth-modal{position:static !important;top:auto !important;left:auto !important;transform:none !important;max-width:none !important;width:100% !important;margin:0 !important;padding:14px !important;border-radius:0 !important;border-left:none !important;border-right:none !important;background:#222 !important;}" +
        "body.compact-connected.demo-has-request #request-title{display:none !important;}" +
        "body.compact-connected #request-details{display:none !important;}" +
        "body.compact-connected #toggle-request-details-btn{display:none !important;}" +
        "body.compact-connected #auth-modal .button-row{gap:10px !important;justify-content:flex-start !important;}";
}

/**
 * Installs iframe observer to react on signer UI changes.
 */
function installSignerFrameUiObserver() {
    if (signerFrameUiObserver) {
        signerFrameUiObserver.disconnect();
        signerFrameUiObserver = null;
    }

    let frameDoc = null;
    try {
        frameDoc = signerFrame.contentDocument;
    } catch (_err) {
        return;
    }
    if (!frameDoc?.body) return;

    signerFrameUiObserver = new MutationObserver(() => {
        scheduleSignerFrameUiSync();
    });
    signerFrameUiObserver.observe(frameDoc.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    });

    scheduleSignerFrameUiSync();
}

/**
 * Handles signer iframe load event.
 */
function onSignerFrameLoad() {
    installSignerFrameUiObserver();
}

/**
 * Opens signer page in a separate browser tab.
 */
function openSignerInBrowserTab() {
    const signerUrl = new URL(runtimeConfig.signerIframeUri, window.location.href).toString();
    window.open(signerUrl, "_blank", "noopener,noreferrer");
}

/**
 * Handles click on setup dialog close button.
 */
function onCloseSignerDialogClicked() {
    closeSignerSetupDialog();
}

/**
 * Waits for a specified amount of milliseconds.
 * @param {number} ms - Wait duration in milliseconds.
 * @returns {Promise<void>} Resolves after timeout.
 */
function waitMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Finds one approval button inside signer iframe.
 * @param {"once"|"always"|"reject"} action - Target action.
 * @returns {HTMLElement|null} Matching button element or null.
 */
function findSignerApprovalButton(action) {
    let frameDoc = null;
    try {
        frameDoc = signerFrame.contentDocument;
    } catch (_err) {
        return null;
    }
    if (!frameDoc) return null;

    const buttonIdByAction = {
        once: "allow-once-btn",
        always: "allow-always-btn",
        reject: "reject-btn"
    };

    const targetButtonId = buttonIdByAction[action];
    if (!targetButtonId) return null;
    const button = frameDoc.getElementById(targetButtonId);
    if (!button || typeof button.click !== "function") return null;
    return button;
}

/**
 * Triggers one approval action directly inside the signer iframe.
 * @param {"once"|"always"|"reject"} action - Target action.
 * @param {number=} timeoutMs - Max wait for button presence.
 * @returns {boolean} True when the action button was found and clicked.
 */
async function triggerSignerApprovalAction(action, timeoutMs = APPROVAL_BUTTON_FIND_TIMEOUT_MS) {
    const start = Date.now();
    let button = null;

    while (!button && (Date.now() - start) < timeoutMs) {
        button = findSignerApprovalButton(action);
        if (button) break;
        await waitMs(APPROVAL_BUTTON_FIND_POLL_MS);
    }

    if (!button) return false;
    button.click();
    return true;
}

/**
 * Enables or disables approval action buttons in request dialog.
 * @param {boolean} isBusy - Busy state for action buttons.
 */
function setRequestActionButtonsBusy(isBusy) {
    requestAllowOnceBtn.disabled = isBusy;
    requestAllowAlwaysBtn.disabled = isBusy;
    requestRejectBtn.disabled = isBusy;
}

/**
 * Handles click on "Einmal erlauben" inside parent request dialog.
 */
async function onRequestAllowOnceClicked() {
    setRequestActionButtonsBusy(true);
    try {
        const ok = await triggerSignerApprovalAction("once");
        if (!ok) {
            setResult("Genehmigungsbutton im Signer nicht gefunden. Bitte direkt im Signer bestaetigen.");
            return;
        }
        if (requestDialogEl.open) requestDialogEl.close();
    } finally {
        setRequestActionButtonsBusy(false);
    }
}

/**
 * Handles click on "Immer erlauben" inside parent request dialog.
 */
async function onRequestAllowAlwaysClicked() {
    setRequestActionButtonsBusy(true);
    try {
        const ok = await triggerSignerApprovalAction("always");
        if (!ok) {
            setResult("Genehmigungsbutton im Signer nicht gefunden. Bitte direkt im Signer bestaetigen.");
            return;
        }
        if (requestDialogEl.open) requestDialogEl.close();
    } finally {
        setRequestActionButtonsBusy(false);
    }
}

/**
 * Handles click on "Ablehnen" inside parent request dialog.
 */
async function onRequestRejectClicked() {
    setRequestActionButtonsBusy(true);
    try {
        const ok = await triggerSignerApprovalAction("reject");
        if (!ok) {
            setResult("Ablehnen-Button im Signer nicht gefunden. Bitte direkt im Signer ablehnen.");
            return;
        }
        if (requestDialogEl.open) requestDialogEl.close();
    } finally {
        setRequestActionButtonsBusy(false);
    }
}

/**
 * Maps bunker client status payload to signer button state.
 * @param {{text:string,isError:boolean}} status - Status payload.
 * @returns {"connecting"|"ready"|"error"} Derived button state.
 */
function deriveSignerButtonStateFromStatus(status) {
    if (status?.isError) return "error";
    const text = String(status?.text || "").toLowerCase();
    if (text.includes("verbunden") || text.includes("bereit")) return "ready";
    if (text.includes("verbinde") || text.includes("warte") || text.includes("eingebettet") || text.includes("vorbereitet")) {
        return "connecting";
    }
    return currentConnection ? "ready" : "connecting";
}

/**
 * Handles status callback from bunker client.
 * @param {{text:string,isError:boolean}} status - Status payload.
 */
function onSignerStatus(status) {
    const buttonState = deriveSignerButtonStateFromStatus(status);
    if (buttonState === "error") {
        setSignerButtonState("error", "Signer: Fehler");
        setSetupDialogMode(false);
        return;
    }
    if (buttonState === "ready") {
        setSignerButtonState("ready", "Signer: bereit");
        setSetupDialogMode(true);
        return;
    }
    setSignerButtonState("connecting", "Signer: verbindet");
    setSetupDialogMode(Boolean(currentConnection));
}

/**
 * Handles connection change callback from bunker client.
 * @param {object|null} connection - Current connection payload.
 */
function onConnectionChanged(connection) {
    currentConnection = connection;
    renderConnectionInfo(connection);
    if (connection) {
        closeSignerSetupDialog();
        setSignerButtonState("ready", "Signer: bereit");
        setSetupDialogMode(true);
    } else {
        openSignerSetupDialog();
        setSignerButtonState("connecting", "Signer: verbindet");
        setSetupDialogMode(false);
    }
    scheduleSignerFrameUiSync();
    refreshActionButtons();
}

/**
 * Creates a hidden fallback URI input from config when provided.
 * @param {string} customBunkerUri - Optional bunker URI.
 * @returns {HTMLInputElement|null} Hidden input element or null.
 */
function buildHiddenConnectionUriInput(customBunkerUri) {
    if (!customBunkerUri) return null;
    const input = document.createElement("input");
    input.type = "hidden";
    input.value = customBunkerUri;
    document.body.appendChild(input);
    return input;
}

/**
 * Creates one configured bunker client instance.
 * @param {NormalizedNostreClientConfig} config - Normalized init config.
 * @returns {ReturnType<typeof createBunkerConnectClient>} Configured bunker client.
 */
function createConfiguredBunkerClient(config) {
    removeHiddenConnectionUriInput();
    hiddenConnectionUriInput = buildHiddenConnectionUriInput(config.customBunkerUri);

    return createBunkerConnectClient({
        signerFrameEl: signerFrame,
        connectionUriInputEl: hiddenConnectionUriInput,
        statusEl,
        requestDialogEl,
        requestDialogTitleEl: requestTitleEl,
        requestDialogDetailsEl: requestDetailsEl,
        signerUrl: config.signerIframeUri,
        autoConnect: true,
        exposeWindowNostr: config.allowNip07,
        showUnlockRequestDialog: false,
        showApprovalRequestDialog: false,
        defaultRelayUrls: config.relays.length > 0 ? config.relays : undefined,
        onStatus: onSignerStatus,
        onConnectionChanged
    });
}

/**
 * Opens the large signer setup dialog.
 */
function openSignerSetupDialog() {
    if (!signerSetupDialogEl) return;
    if (typeof signerSetupDialogEl.showModal === "function" && !signerSetupDialogEl.open) {
        signerSetupDialogEl.showModal();
        scheduleSignerFrameUiSync();
        return;
    }
    signerSetupDialogEl.setAttribute("open", "open");
    scheduleSignerFrameUiSync();
}

/**
 * Closes the signer setup dialog.
 */
function closeSignerSetupDialog() {
    if (!signerSetupDialogEl) return;
    if (typeof signerSetupDialogEl.close === "function" && signerSetupDialogEl.open) {
        signerSetupDialogEl.close();
        return;
    }
    signerSetupDialogEl.removeAttribute("open");
}

/**
 * Renders current connection details.
 * @param {object|null} connection - Active connection payload.
 */
function renderConnectionInfo(connection) {
    if (!connection) {
        connectionInfoEl.textContent = "Keine aktive Verbindung.";
        return;
    }

    connectionInfoEl.textContent =
        `pubkey: ${connection.pubkey}\n` +
        `npub: ${connection.npub}\n` +
        `relays:\n- ${connection.relays.join("\n- ")}`;
}

/**
 * Hides technical connection details in boilerplate mode.
 * This keeps the setup dialog focused on user approval context.
 */
function hideConnectionInfoForBoilerplate() {
    if (!connectionInfoEl) return;
    connectionInfoEl.hidden = true;
}

/**
 * Sets pending busy state for action buttons.
 * @param {boolean} isBusy - Busy flag.
 */
function setBusy(isBusy) {
    if (!(sendBtn instanceof HTMLButtonElement)) return;
    sendBtn.disabled = isBusy || !currentConnection || !activeFormSchema;
}

/**
 * Removes form-specific listeners from previous schema render.
 */
function cleanupFormRuntime() {
    if (typeof formCounterCleanup === "function") {
        formCounterCleanup();
    }
    formCounterCleanup = null;
}

/**
 * Toggles generated form visibility in the demo UI.
 * @param {boolean} isVisible - True to show generated form controls.
 */
function setGeneratedFormVisibility(isVisible) {
    if (postForm instanceof HTMLFormElement) {
        postForm.hidden = !isVisible;
    }

    const counterRow = contentCountEl instanceof HTMLElement ? contentCountEl.closest(".row") : null;
    if (counterRow instanceof HTMLElement) {
        counterRow.hidden = !isVisible;
        return;
    }

    if (contentCountEl instanceof HTMLElement) {
        contentCountEl.hidden = !isVisible;
    }
}

/**
 * Applies one normalized form schema to the UI.
 * @param {object} schema - Normalized form schema.
 */
function applyFormSchemaToUi(schema) {
    if (!(postForm instanceof HTMLFormElement)) {
        throw new Error("post-form fehlt.");
    }
    if (!(formFieldsEl instanceof HTMLElement)) {
        throw new Error("form-fields fehlt.");
    }

    cleanupFormRuntime();
    renderFormSchema({ containerEl: formFieldsEl, schema });

    if (sendBtn instanceof HTMLButtonElement && schema.submitLabel) {
        sendBtn.textContent = schema.submitLabel;
    }

    formCounterCleanup = bindCharacterCounter({
        formEl: postForm,
        schema,
        counterEl: contentCountEl
    });
}

/**
 * Loads form schema and renders it into the current form container.
 */
async function initializeFormRuntime() {
    const loadedSchema = await loadFormSchema({
        formUri: runtimeConfig.formUri,
        allowEmpty: true
    });

    if (!loadedSchema) {
        cleanupFormRuntime();
        activeFormSchema = null;
        setGeneratedFormVisibility(false);
        setResult("Kein form_uri gesetzt. Formularmodus ist deaktiviert. Nutze nostrclient.signEvent(...) und nostrclient.publishSignedEvent(...) fuer Custom-Events.");
        return;
    }

    setGeneratedFormVisibility(true);
    if (!isSupportedSchemaVersion(loadedSchema)) {
        setResult("Hinweis: Unbekannte Formular-Version geladen. Es wird versucht, kompatibel zu rendern.");
    }

    activeFormSchema = loadedSchema;
    applyFormSchemaToUi(loadedSchema);
}

/**
 * Writes result output.
 * @param {string} text - Result text.
 */
function setResult(text) {
    resultEl.textContent = text;
}

/**
 * Removes stale setup hints from the result area.
 * Keeps the area focused on event output/errors only.
 */
function clearSetupResultHintIfPresent() {
    const setupHint = "Signer eingebettet. Jetzt im iframe entsperren, Verbindung erfolgt automatisch.";
    if (resultEl.textContent.trim() === setupHint) {
        resultEl.textContent = "Noch kein Event gesendet.";
    }
}

/**
 * Starts the fully automatic signer workflow.
 */
async function startAutoSignerFlow() {
    setBusy(true);
    setSignerButtonState("connecting", "Signer: verbindet");
    try {
        const client = getBunkerClientOrThrow();
        openSignerSetupDialog();
        await client.installSignerAndAutoConnect();
        clearSetupResultHintIfPresent();
    } catch (err) {
        setResult(`Fehler beim Setup: ${err.message}`);
    } finally {
        setBusy(false);
    }
}

/**
 * Handles post submit including validation and publish workflow.
 * @param {SubmitEvent} event - Form submit event.
 */
async function onPostSubmit(event) {
    event.preventDefault();

    if (!(postForm instanceof HTMLFormElement) || !activeFormSchema) {
        setResult("Formular ist noch nicht bereit.");
        return;
    }

    const formValues = collectFormValues(postForm, activeFormSchema);
    const validation = validateFormValues(activeFormSchema, formValues);
    if (!validation.ok) {
        setResult(validation.message);
        return;
    }

    setBusy(true);
    const setupDialogWasOpenBeforeSubmit = Boolean(signerSetupDialogEl?.open);
    try {
        const client = getBunkerClientOrThrow();
        if (!setupDialogWasOpenBeforeSubmit) {
            openSignerSetupDialog();
        }
        const pubkey = currentConnection?.pubkey || await client.getPublicKey();
        const unsignedEvent = buildUnsignedEventFromForm({
            schema: activeFormSchema,
            values: formValues,
            pubkey
        });
        const signedEvent = await client.signEvent(unsignedEvent);
        const publishedRelayUrls = await client.publishSignedEvent(signedEvent);
        setResult(
            `Signiert:\n${JSON.stringify(signedEvent, null, 2)}\n\n` +
            `Veroeffentlicht an:\n${publishedRelayUrls.join("\n") || "(unbekannt)"}`
        );
    } catch (err) {
        setResult(`Senden fehlgeschlagen: ${err.message}`);
    } finally {
        if (!setupDialogWasOpenBeforeSubmit && currentConnection) {
            closeSignerSetupDialog();
        }
        setBusy(false);
    }
}

/**
 * Enables or disables action buttons based on current state.
 */
function refreshActionButtons() {
    if (!(sendBtn instanceof HTMLButtonElement)) return;
    sendBtn.disabled = !currentConnection || !activeFormSchema;
}

/**
 * Boots the demo UI and starts one-command signer integration.
 */
async function bootstrap() {
    if (!bootstrapStarted) {
        showSignerBtn.addEventListener("click", openSignerSetupDialog);
        signerFrame.addEventListener("load", onSignerFrameLoad);
        openSignerExternalBtn.addEventListener("click", openSignerInBrowserTab);
        if (closeSignerDialogBtn) {
            closeSignerDialogBtn.addEventListener("click", onCloseSignerDialogClicked);
        }
        requestAllowOnceBtn.addEventListener("click", onRequestAllowOnceClicked);
        requestAllowAlwaysBtn.addEventListener("click", onRequestAllowAlwaysClicked);
        requestRejectBtn.addEventListener("click", onRequestRejectClicked);
        if (postForm instanceof HTMLFormElement) {
            postForm.addEventListener("submit", onPostSubmit);
        }
        setSignerButtonState("connecting", "Signer: verbindet");
        setSetupDialogMode(false);
        hideConnectionInfoForBoilerplate();
        renderIdleApprovalPreview();
        bootstrapStarted = true;
    }

    await initializeFormRuntime();
    refreshActionButtons();

    await startAutoSignerFlow();
}

/**
 * Handles bootstrap level fatal errors.
 * @param {Error} err - Bootstrap error.
 */
function onBootstrapError(err) {
    setSignerButtonState("error", "Signer: Fehler");
    statusEl.dataset.state = "error";
    statusEl.textContent = `Bootstrap fehlgeschlagen: ${err.message}`;
}

/**
 * Returns a shallow state snapshot of the active wrapper and bunker state.
 * @returns {object} State snapshot.
 */
function getState() {
    return {
        initialized: Boolean(bunkerClient),
        runtimeConfig: { ...runtimeConfig, relays: [...runtimeConfig.relays] },
        connection: currentConnection ? { ...currentConnection } : null,
        activeFormSchema: activeFormSchema
            ? {
                id: activeFormSchema.id,
                title: activeFormSchema.title,
                kind: activeFormSchema.kind,
                adapter: activeFormSchema.adapter
            }
            : null,
        bunker: bunkerClient && typeof bunkerClient.getState === "function"
            ? bunkerClient.getState()
            : null
    };
}

/**
 * Disposes the active bunker client and wrapper resources.
 */
function destroy() {
    if (bunkerClient && typeof bunkerClient.destroy === "function") {
        bunkerClient.destroy();
    }
    cleanupFormRuntime();
    if (signerFrameUiObserver) {
        signerFrameUiObserver.disconnect();
        signerFrameUiObserver = null;
    }
    bunkerClient = null;
    activeFormSchema = null;
    currentConnection = null;
    removeHiddenConnectionUriInput();
}

/**
 * Initializes the demo wrapper API and starts auto-connect flow.
 * @param {NostreClientInitOptions=} options - Init options.
 * @returns {Promise<void>} Resolves when setup flow started.
 */
async function init(options = {}) {
    runtimeConfig = normalizeInitConfig(options.config);
    ensureRequiredDemoElements({ requiresFormUi: isFormUiEnabled(runtimeConfig) });
    currentConnection = null;

    if (bunkerClient && typeof bunkerClient.destroy === "function") {
        bunkerClient.destroy();
    }
    bunkerClient = createConfiguredBunkerClient(runtimeConfig);

    try {
        await bootstrap();
    } catch (err) {
        onBootstrapError(err);
        throw err;
    }
}

/**
 * Reads pubkey from active signer connection.
 * @returns {Promise<string>} Public key hex.
 */
async function getPublicKey() {
    const client = getBunkerClientOrThrow();
    return client.getPublicKey();
}

/**
 * Signs one event over active signer connection.
 * @param {object} unsignedEvent - Unsigned event.
 * @returns {Promise<object>} Signed event.
 */
async function signEvent(unsignedEvent) {
    const client = getBunkerClientOrThrow();
    return client.signEvent(unsignedEvent);
}

/**
 * Publishes one signed event to configured relays.
 * @param {object} signedEvent - Signed event.
 * @returns {Promise<string[]>} Published relay URLs.
 */
async function publishSignedEvent(signedEvent) {
    const client = getBunkerClientOrThrow();
    return client.publishSignedEvent(signedEvent);
}

/**
 * Signs and publishes a kind:1 text note.
 * @param {string} content - Post content.
 * @param {string[][]=} tags - Optional tags.
 * @returns {Promise<{signedEvent: object, publishedRelayUrls: string[]}>} Publish result.
 */
async function publishTextNote(content, tags) {
    const client = getBunkerClientOrThrow();
    return client.publishTextNote(content, tags);
}

export const nostreclient = {
    init,
    destroy,
    getState,
    getPublicKey,
    signEvent,
    publishSignedEvent,
    publishTextNote
};

export const nostrclient = nostreclient;

