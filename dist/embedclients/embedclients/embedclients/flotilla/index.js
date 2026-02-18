import { createBunkerConnectClient } from "../../democlient/nostr.js";

const DEFAULT_APP_NAME = "Ziel-App";
const DEFAULT_SIGNER_URI = "../../signer.html";

const embedRootEl = document.getElementById("embed-root");
const embedStatusEl = document.getElementById("embed-status");
const signerStatusEl = document.getElementById("signer-status");
const bunkerUriOutputEl = /** @type {HTMLTextAreaElement|null} */ (document.getElementById("bunker-uri-output"));
const copyBunkerBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("copy-bunker-btn"));
const refreshLinkBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("refresh-link-btn"));
const openSignerBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("open-signer-btn"));
const openAppTabBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("open-app-tab-btn"));
const closeSignerBtn = /** @type {HTMLButtonElement|null} */ (document.getElementById("close-signer-btn"));
const signerDialogEl = /** @type {HTMLDialogElement|null} */ (document.getElementById("signer-dialog"));
const signerFrameEl = /** @type {HTMLIFrameElement|null} */ (document.getElementById("signer-frame"));
const embeddedAppFrameEl = /** @type {HTMLIFrameElement|null} */ (document.getElementById("embedded-app-frame"));
const stepCopyBunkerEl = document.getElementById("step-copy-bunker");

/**
 * @typedef {object} EmbedRuntimeConfig
 * @property {string} appName - Display name of embedded target app.
 * @property {string} appUrl - URL opened in iframe/new tab.
 * @property {string} signerUri - Relative or absolute signer URI.
 */

let bunkerClient = null;
let signerUnlockFlowActive = false;
let runtimeConfig = {
    appName: DEFAULT_APP_NAME,
    appUrl: "",
    signerUri: DEFAULT_SIGNER_URI
};

/**
 * Checks whether a status/error message indicates a locked signer.
 * @param {string} message - Message text to classify.
 * @returns {boolean} True when message points to a locked signer state.
 */
function isLockedSignerMessage(message) {
    const text = String(message || "").toLowerCase();
    if (!text) return false;
    return text.includes("gesperrt") || text.includes("entsperrung");
}

/**
 * Normalizes one URL string.
 * @param {string} value - Raw URL value.
 * @returns {string} Normalized absolute URL or empty string.
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
 * Derives an app display name from URL.
 * @param {string} appUrl - Target app URL.
 * @returns {string} Derived app name.
 */
function appNameFromUrl(appUrl) {
    const normalizedUrl = normalizeUrl(appUrl);
    if (!normalizedUrl) return DEFAULT_APP_NAME;

    try {
        const hostname = new URL(normalizedUrl).hostname;
        if (!hostname) return DEFAULT_APP_NAME;
        const firstToken = hostname.split(".")[0] || "";
        if (!firstToken) return DEFAULT_APP_NAME;
        return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
    } catch (_err) {
        return DEFAULT_APP_NAME;
    }
}

/**
 * Resolves runtime config from HTML data attributes.
 * @returns {EmbedRuntimeConfig} Runtime config.
 */
function resolveRuntimeConfig() {
    const dataAppName = embedRootEl?.dataset?.appName || "";
    const dataAppUrl = embedRootEl?.dataset?.appUrl || "";
    const dataSignerUri = embedRootEl?.dataset?.signerUri || "";

    const iframeAppUrl = embeddedAppFrameEl?.getAttribute("src") || "";
    const appUrl = normalizeUrl(dataAppUrl) || normalizeUrl(iframeAppUrl);
    const appName = String(dataAppName || "").trim() || appNameFromUrl(appUrl);
    const signerUri = String(dataSignerUri || "").trim() || DEFAULT_SIGNER_URI;

    return {
        appName,
        appUrl,
        signerUri
    };
}

/**
 * Applies runtime config to app iframe/button labels.
 */
function applyRuntimeConfigToUi() {
    if (embeddedAppFrameEl instanceof HTMLIFrameElement) {
        if (runtimeConfig.appUrl) {
            embeddedAppFrameEl.src = runtimeConfig.appUrl;
        }
        embeddedAppFrameEl.title = `${runtimeConfig.appName} App`;
    }

    if (openAppTabBtn instanceof HTMLButtonElement) {
        openAppTabBtn.textContent = `${runtimeConfig.appName} im Tab öffnen`;
        openAppTabBtn.disabled = runtimeConfig.appUrl.length === 0;
    }
}

/**
 * Converts a nostrconnect URI to bunker URI.
 * Keeps relay and secret query parameters.
 * @param {string} nostrconnectUri - Source nostrconnect URI.
 * @returns {string} Converted bunker URI.
 */
function toBunkerUri(nostrconnectUri) {
    const raw = String(nostrconnectUri || "").trim();
    if (!raw) return "";

    let parsedUrl = null;
    try {
        parsedUrl = new URL(raw);
    } catch (_err) {
        return "";
    }

    if (parsedUrl.protocol === "bunker:") return raw;
    if (parsedUrl.protocol !== "nostrconnect:") return "";

    const pubkey = parsedUrl.hostname || parsedUrl.pathname.replace(/^\/+/, "");
    if (!pubkey) return "";

    const out = new URLSearchParams();
    for (const relay of parsedUrl.searchParams.getAll("relay")) {
        out.append("relay", relay);
    }
    const secret = parsedUrl.searchParams.get("secret");
    if (secret) out.set("secret", secret);

    const query = out.toString();
    return `bunker://${pubkey}${query ? `?${query}` : ""}`;
}

/**
 * Writes status text to one element.
 * @param {HTMLElement|null} element - Target status element.
 * @param {string} text - Status text.
 * @param {"idle"|"ok"|"error"} state - Visual status state.
 */
function setStatusText(element, text, state = "idle") {
    if (!(element instanceof HTMLElement)) return;
    element.textContent = text;
    element.dataset.state = state;
}

/**
 * Updates bunker URI output and related UI state.
 * @param {string} bunkerUri - Current bunker URI.
 */
function setBunkerUri(bunkerUri) {
    const value = String(bunkerUri || "").trim();
    if (bunkerUriOutputEl instanceof HTMLTextAreaElement) {
        bunkerUriOutputEl.value = value;
    }

    if (copyBunkerBtn instanceof HTMLButtonElement) {
        copyBunkerBtn.disabled = value.length === 0;
    }

    if (stepCopyBunkerEl instanceof HTMLElement) {
        stepCopyBunkerEl.classList.toggle("done", value.length > 0);
    }
}

/**
 * Checks whether the bunker URI output currently has a value.
 * @returns {boolean} True when a bunker URI is available.
 */
function hasBunkerUriValue() {
    if (!(bunkerUriOutputEl instanceof HTMLTextAreaElement)) return false;
    return bunkerUriOutputEl.value.trim().length > 0;
}

/**
 * Opens signer dialog.
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
 * Closes signer dialog.
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
 * Finalizes unlock flow once a bunker URI is available.
 * Closes the signer dialog that was opened for unlock and updates stale status text.
 * @returns {boolean} True when a bunker URI is available.
 */
function finalizeUnlockFlowIfReady() {
    if (!hasBunkerUriValue()) return false;

    const signerStatusText = String(signerStatusEl?.textContent || "").toLowerCase();
    if (signerStatusText.includes("verbindung wird vorbereitet") || signerStatusText.includes("gesperrt")) {
        setStatusText(signerStatusEl, "Signer bereit. Bunker Link ist bereit.", "ok");
    }

    if (signerUnlockFlowActive) {
        closeSignerDialog();
        signerUnlockFlowActive = false;
        setStatusText(embedStatusEl, "Signer entsperrt. Bunker Link ist bereit.", "ok");
    }

    return true;
}

/**
 * Opens the embedded app in a dedicated browser tab.
 */
function openAppInNewTab() {
    if (!runtimeConfig.appUrl) return;
    window.open(runtimeConfig.appUrl, "_blank", "noopener,noreferrer");
}

/**
 * Copies bunker URI to the clipboard.
 * @returns {Promise<void>} Resolves after copy attempt.
 */
async function copyBunkerUriToClipboard() {
    const value = bunkerUriOutputEl instanceof HTMLTextAreaElement ? bunkerUriOutputEl.value.trim() : "";
    if (!value) {
        setStatusText(embedStatusEl, "Noch kein Bunker Link verfuegbar.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        setStatusText(embedStatusEl, `Bunker Link kopiert. In ${runtimeConfig.appName} einfuegen.`, "ok");
    } catch (_err) {
        setStatusText(embedStatusEl, "Clipboard nicht verfuegbar. Bitte Link manuell kopieren.", "error");
    }
}

/**
 * Updates bunker URI output from current bunker client state.
 */
function updateBunkerUriFromState() {
    if (!bunkerClient || typeof bunkerClient.getState !== "function") {
        setBunkerUri("");
        return;
    }

    const state = bunkerClient.getState();
    const bridgeInfo = state?.lastBridgeConnectionInfo || null;
    const bunkerUri = String(
        state?.activeConnection?.bunkerUri ||
        bridgeInfo?.bunkerUri ||
        toBunkerUri(bridgeInfo?.nostrconnectUri || "") ||
        ""
    );
    setBunkerUri(bunkerUri);
}

/**
 * Requests fresh connection info and refreshes bunker URI output.
 * @returns {Promise<void>} Resolves after refresh attempt.
 */
async function refreshBunkerUri() {
    if (!bunkerClient) return;

    setStatusText(embedStatusEl, "Aktualisiere Bunker Link ...", "idle");
    try {
        await bunkerClient.syncConnectionInfo();
        updateBunkerUriFromState();
        if (finalizeUnlockFlowIfReady()) return;
        if (hasBunkerUriValue()) {
            setStatusText(embedStatusEl, "Bunker Link aktualisiert.", "ok");
            return;
        }
        setStatusText(embedStatusEl, "Noch kein Link verfuegbar. Bitte Signer entsperren.", "idle");
    } catch (error) {
        if (isLockedSignerMessage(error?.message)) {
            signerUnlockFlowActive = true;
            openSignerDialog();
            setStatusText(embedStatusEl, "Signer ist gesperrt. Bitte Passwort im Signer-Dialog eingeben.", "idle");
            return;
        }
        setStatusText(embedStatusEl, `Aktualisierung fehlgeschlagen: ${error.message}`, "error");
    }
}

/**
 * Handles bunker client status callbacks.
 * @param {{text:string,isError:boolean}} status - Status payload from bunker client.
 */
function onBunkerClientStatus(status) {
    const text = String(status?.text || "Status unbekannt.");
    const isRelayTimeout = /relay connect timeout/i.test(text);
    const state = status?.isError && !isRelayTimeout ? "error" : "idle";
    setStatusText(signerStatusEl, text, state);
    updateBunkerUriFromState();
    if (finalizeUnlockFlowIfReady()) return;

    if (isLockedSignerMessage(text)) {
        signerUnlockFlowActive = true;
        openSignerDialog();
        setStatusText(embedStatusEl, "Signer ist gesperrt. Bitte Passwort im Signer-Dialog eingeben.", "idle");
        return;
    }

    if (isRelayTimeout) {
        setStatusText(embedStatusEl, "Signer ist bereit. Relay-Connect im Embed-Client ist optional. Nutze den Bunker Link in der Ziel-App.", "ok");
    }
}

/**
 * Handles bunker client connection changes.
 * @param {object|null} connection - Connection payload.
 */
function onConnectionChanged(connection) {
    updateBunkerUriFromState();
    if (finalizeUnlockFlowIfReady()) return;
    if (connection?.bunkerUri) {
        setStatusText(embedStatusEl, "Signer verbunden. Bunker Link ist bereit.", "ok");
        setStatusText(signerStatusEl, "Signer verbunden und bereit.", "ok");
        return;
    }

    setStatusText(embedStatusEl, "Warte auf Signer-Entsperrung ...", "idle");
}

/**
 * Registers click handlers for UI controls.
 */
function bindUiEvents() {
    if (copyBunkerBtn instanceof HTMLButtonElement) {
        copyBunkerBtn.addEventListener("click", copyBunkerUriToClipboard);
    }
    if (refreshLinkBtn instanceof HTMLButtonElement) {
        refreshLinkBtn.addEventListener("click", refreshBunkerUri);
    }
    if (openSignerBtn instanceof HTMLButtonElement) {
        openSignerBtn.addEventListener("click", openSignerDialog);
    }
    if (closeSignerBtn instanceof HTMLButtonElement) {
        closeSignerBtn.addEventListener("click", closeSignerDialog);
    }
    if (openAppTabBtn instanceof HTMLButtonElement) {
        openAppTabBtn.addEventListener("click", openAppInNewTab);
    }
}

/**
 * Initializes bunker client and starts auto-connect flow.
 * @returns {Promise<void>} Resolves after startup.
 */
async function initEmbedClient() {
    if (!(signerFrameEl instanceof HTMLIFrameElement)) {
        throw new Error("signer-frame fehlt.");
    }

    bunkerClient = createBunkerConnectClient({
        signerFrameEl,
        signerUrl: runtimeConfig.signerUri,
        autoConnect: false,
        exposeWindowNostr: false,
        showUnlockRequestDialog: false,
        showApprovalRequestDialog: false,
        statusEl: signerStatusEl || undefined,
        onStatus: onBunkerClientStatus,
        onConnectionChanged
    });

    setBunkerUri("");
    setStatusText(embedStatusEl, "Starte Signer und warte auf Verbindung ...", "idle");
    await bunkerClient.installSignerAndAutoConnect();
    updateBunkerUriFromState();
}

/**
 * Destroys bunker client resources.
 */
function destroyEmbedClient() {
    if (!bunkerClient || typeof bunkerClient.destroy !== "function") return;
    bunkerClient.destroy();
}

/**
 * Bootstraps the generic embed client UI.
 */
async function bootstrap() {
    runtimeConfig = resolveRuntimeConfig();
    applyRuntimeConfigToUi();
    bindUiEvents();

    try {
        await initEmbedClient();
    } catch (error) {
        setStatusText(embedStatusEl, `Initialisierung fehlgeschlagen: ${error.message}`, "error");
        setStatusText(signerStatusEl, `Initialisierung fehlgeschlagen: ${error.message}`, "error");
    }
}

window.addEventListener("beforeunload", destroyEmbedClient);
bootstrap();
