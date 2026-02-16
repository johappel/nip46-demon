import { createBunkerConnectClient } from "./nostr.js";

const pubkeyBtn = document.getElementById("pubkey-btn");
const sendBtn = document.getElementById("send-btn");
const signerFrame = document.getElementById("signer-frame");
const signerSetupDialogEl = document.getElementById("signer-setup-dialog");
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

// Default: feste Signer-URL fuer Zero-Config.
// Optional spaeter per Settings-UI austauschbar machen.
const SIGNER_URL = "../signer.html";

// Optional spaeter per Settings-UI: eigene bunker:// oder nostrconnect:// URI erlauben.
// Beispiel: const CUSTOM_BUNKER_URI = "bunker://<pubkey>?relay=...";
const CUSTOM_BUNKER_URI = "";

let currentConnection = null;

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
        return;
    }
    if (buttonState === "ready") {
        setSignerButtonState("ready", "Signer: bereit");
        return;
    }
    setSignerButtonState("connecting", "Signer: verbindet");
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
    } else {
        openSignerSetupDialog();
        setSignerButtonState("connecting", "Signer: verbindet");
    }
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
    showApprovalRequestDialog: true,
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
 * Starts the fully automatic signer workflow.
 */
async function startAutoSignerFlow() {
    setBusy(true);
    setSignerButtonState("connecting", "Signer: verbindet");
    try {
        openSignerSetupDialog();
        await bunkerClient.installSignerAndAutoConnect();
        setResult("Signer eingebettet. Jetzt im iframe entsperren, Verbindung erfolgt automatisch.");
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
    try {
        const response = await bunkerClient.publishTextNote(postContent.value.trim());
        setResult(
            `Signiert:\n${JSON.stringify(response.signedEvent, null, 2)}\n\n` +
            `Veroeffentlicht an:\n${response.publishedRelayUrls.join("\n") || "(unbekannt)"}`
        );
    } catch (err) {
        setResult(`Senden fehlgeschlagen: ${err.message}`);
    } finally {
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
    pubkeyBtn.addEventListener("click", onGetPubkeyClicked);
    postForm.addEventListener("submit", onPostSubmit);
    postContent.addEventListener("input", updateContentCounter);

    updateContentCounter();
    setSignerButtonState("connecting", "Signer: verbindet");
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
