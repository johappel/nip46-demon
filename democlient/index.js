import { createBunkerConnectClient } from "./nostr.js";

const pubkeyBtn = document.getElementById("pubkey-btn");
const sendBtn = document.getElementById("send-btn");
const signerFrame = document.getElementById("signer-frame");
const signerSetupDialogEl = document.getElementById("signer-setup-dialog");
const setupCardEl = document.querySelector(".setup-card");
const setupDialogTitleEl = document.getElementById("setup-dialog-title");
const setupDialogHintEl = document.getElementById("setup-dialog-hint");
const openSignerExternalBtn = document.getElementById("open-signer-external-btn");
const showSignerBtn = document.getElementById("show-signer-btn");
const showSignerLabel = document.getElementById("show-signer-label");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const connectionInfoEl = document.getElementById("connection-info");
const postForm = document.getElementById("post-form");
const postContent = document.getElementById("post-content");
const contentCountEl = document.getElementById("content-count");
const requestDialogEl = document.getElementById("signer-request-dialog");
const requestTitleEl = document.getElementById("signer-request-title");
const requestDetailsEl = document.getElementById("signer-request-details");
const requestAllowOnceBtn = document.getElementById("request-allow-once-btn");
const requestAllowAlwaysBtn = document.getElementById("request-allow-always-btn");
const requestRejectBtn = document.getElementById("request-reject-btn");

// Default: feste Signer-URL fuer Zero-Config.
// Optional spaeter per Settings-UI austauschbar machen.
const SIGNER_URL = "../signer.html";

// Optional spaeter per Settings-UI: eigene bunker:// oder nostrconnect:// URI erlauben.
// Beispiel: const CUSTOM_BUNKER_URI = "bunker://<pubkey>?relay=...";
const CUSTOM_BUNKER_URI = "";
const APPROVAL_BUTTON_FIND_TIMEOUT_MS = 2500;
const APPROVAL_BUTTON_FIND_POLL_MS = 80;

let currentConnection = null;
let signerFrameUiObserver = null;

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
    if (setupCardEl) {
        setupCardEl.classList.toggle("compact-connected-view", Boolean(isReady));
    }
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
        "body.compact-connected #status{margin-top:0 !important;}" +
        "body.compact-connected #overlay{display:none !important;}" +
        "body.compact-connected #auth-modal{position:static !important;top:auto !important;left:auto !important;transform:none !important;max-width:none !important;width:100% !important;margin:0 !important;padding:14px !important;border-radius:0 !important;border-left:none !important;border-right:none !important;background:#222 !important;}" +
        "body.compact-connected #request-details{display:none !important;}" +
        "body.compact-connected #toggle-request-details-btn{display:none !important;}" +
        "body.compact-connected #auth-modal .button-row{gap:10px !important;justify-content:flex-start !important;}";
}

/**
 * Installs iframe observer to react on compact-connected class changes.
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
        applyEmbeddedSignerCompactPresentation();
    });
    signerFrameUiObserver.observe(frameDoc.body, {
        attributes: true,
        attributeFilter: ["class"],
        subtree: false
    });

    applyEmbeddedSignerCompactPresentation();
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
    const signerUrl = new URL(SIGNER_URL, window.location.href).toString();
    window.open(signerUrl, "_blank", "noopener,noreferrer");
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
    applyEmbeddedSignerCompactPresentation();
    refreshActionButtons();
}

/**
 * Creates a hidden fallback URI input when CUSTOM_BUNKER_URI is set.
 * @returns {HTMLInputElement|null} Hidden input element or null.
 */
function buildHiddenConnectionUriInput() {
    if (!CUSTOM_BUNKER_URI) return null;
    const input = document.createElement("input");
    input.type = "hidden";
    input.value = CUSTOM_BUNKER_URI;
    document.body.appendChild(input);
    return input;
}

const hiddenConnectionUriInput = buildHiddenConnectionUriInput();

const bunkerClient = createBunkerConnectClient({
    signerFrameEl: signerFrame,
    connectionUriInputEl: hiddenConnectionUriInput,
    statusEl,
    requestDialogEl,
    requestDialogTitleEl: requestTitleEl,
    requestDialogDetailsEl: requestDetailsEl,
    signerUrl: SIGNER_URL,
    autoConnect: true,
    exposeWindowNostr: true,
    showUnlockRequestDialog: false,
    showApprovalRequestDialog: false,
    onStatus: onSignerStatus,
    onConnectionChanged
});

/**
 * Opens the large signer setup dialog.
 */
function openSignerSetupDialog() {
    if (!signerSetupDialogEl) return;
    if (typeof signerSetupDialogEl.showModal === "function" && !signerSetupDialogEl.open) {
        signerSetupDialogEl.showModal();
        return;
    }
    signerSetupDialogEl.setAttribute("open", "open");
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
 * Sets pending busy state for action buttons.
 * @param {boolean} isBusy - Busy flag.
 */
function setBusy(isBusy) {
    sendBtn.disabled = isBusy || !currentConnection;
    pubkeyBtn.disabled = isBusy || !currentConnection;
}

/**
 * Updates post content counter.
 */
function updateContentCounter() {
    const len = (postContent.value || "").length;
    contentCountEl.textContent = `${len} / 280`;
}

/**
 * Validates post form content.
 * @returns {{ok:boolean, message:string}} Validation result.
 */
function validatePostContent() {
    const content = String(postContent.value || "").trim();
    if (!content) {
        return { ok: false, message: "Bitte Event-Content eingeben." };
    }
    if (content.length > 280) {
        return { ok: false, message: "Maximal 280 Zeichen erlaubt." };
    }
    return { ok: true, message: "" };
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
        openSignerSetupDialog();
        await bunkerClient.installSignerAndAutoConnect();
        clearSetupResultHintIfPresent();
    } catch (err) {
        setResult(`Fehler beim Setup: ${err.message}`);
    } finally {
        setBusy(false);
    }
}

/**
 * Loads pubkey from active provider.
 */
async function onGetPubkeyClicked() {
    setBusy(true);
    try {
        const pubkey = await bunkerClient.getPublicKey();
        setResult(`window.nostr.getPublicKey() => ${pubkey}`);
    } catch (err) {
        setResult(`Fehler: ${err.message}`);
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

    const validation = validatePostContent();
    if (!validation.ok) {
        setResult(validation.message);
        return;
    }

    setBusy(true);
    const setupDialogWasOpenBeforeSubmit = Boolean(signerSetupDialogEl?.open);
    try {
        if (!setupDialogWasOpenBeforeSubmit) {
            openSignerSetupDialog();
        }
        const response = await bunkerClient.publishTextNote(postContent.value.trim());
        setResult(
            `Signiert:\n${JSON.stringify(response.signedEvent, null, 2)}\n\n` +
            `Veroeffentlicht an:\n${response.publishedRelayUrls.join("\n") || "(unbekannt)"}`
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
    sendBtn.disabled = !currentConnection;
    pubkeyBtn.disabled = !currentConnection;
}

/**
 * Boots the demo UI and starts one-command signer integration.
 */
async function bootstrap() {
    showSignerBtn.addEventListener("click", openSignerSetupDialog);
    signerFrame.addEventListener("load", onSignerFrameLoad);
    openSignerExternalBtn.addEventListener("click", openSignerInBrowserTab);
    requestAllowOnceBtn.addEventListener("click", onRequestAllowOnceClicked);
    requestAllowAlwaysBtn.addEventListener("click", onRequestAllowAlwaysClicked);
    requestRejectBtn.addEventListener("click", onRequestRejectClicked);
    pubkeyBtn.addEventListener("click", onGetPubkeyClicked);
    postForm.addEventListener("submit", onPostSubmit);
    postContent.addEventListener("input", updateContentCounter);

    updateContentCounter();
    setSignerButtonState("connecting", "Signer: verbindet");
    setSetupDialogMode(false);
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

bootstrap().catch(onBootstrapError);
