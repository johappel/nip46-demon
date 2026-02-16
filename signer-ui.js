const DEFAULT_ATTENTION_SETTINGS = Object.freeze({
    notificationsEnabled: true,
    titleBlinkEnabled: true,
    soundEnabled: false
});

function safeParseJson(raw, fallback) {
    if (typeof raw !== "string" || !raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch (_err) {
        return fallback;
    }
}

export function createSignerAttentionManager(options = {}) {
    const storageKey = typeof options.storageKey === "string" && options.storageKey
        ? options.storageKey
        : "nip46_attention_settings_v1";
    const onUiChanged = typeof options.onUiChanged === "function" ? options.onUiChanged : () => {};

    const baseTitle = String(document.title || "NIP-46 Signer");
    let blinkTimer = null;
    let blinkState = false;
    let blinkTitle = "Neue Signier-Anfrage";
    let pendingAttentionCount = 0;
    let audioContext = null;

    const settings = loadSettings();

    const dom = {
        notificationsToggle: null,
        titleToggle: null,
        soundToggle: null,
        requestPermissionBtn: null,
        permissionState: null
    };

    function loadSettings() {
        const parsed = safeParseJson(window.localStorage.getItem(storageKey), {});
        return {
            notificationsEnabled: parsed?.notificationsEnabled !== false,
            titleBlinkEnabled: parsed?.titleBlinkEnabled !== false,
            soundEnabled: parsed?.soundEnabled === true
        };
    }

    function saveSettings() {
        window.localStorage.setItem(storageKey, JSON.stringify(settings));
    }

    function isNotificationSupported() {
        return typeof window.Notification === "function";
    }

    function notificationPermissionValue() {
        if (!isNotificationSupported()) return "unsupported";
        return String(Notification.permission || "default");
    }

    function renderPermissionState() {
        if (!dom.permissionState) return;

        const permission = notificationPermissionValue();
        if (permission === "unsupported") {
            dom.permissionState.textContent = "Notification API wird von diesem Browser nicht unterstuetzt.";
            dom.permissionState.style.color = "#ffb4b4";
            return;
        }

        if (permission === "granted") {
            dom.permissionState.textContent = "Windows-Benachrichtigungen sind erlaubt.";
            dom.permissionState.style.color = "#9ad1ff";
            return;
        }

        if (permission === "denied") {
            dom.permissionState.textContent = "Windows-Benachrichtigungen wurden blockiert (Browser-Einstellung pruefen).";
            dom.permissionState.style.color = "#ffb4b4";
            return;
        }

        dom.permissionState.textContent = "Windows-Benachrichtigungen sind noch nicht freigegeben.";
        dom.permissionState.style.color = "#bbb";
    }

    function renderButtonState() {
        if (!dom.requestPermissionBtn) return;
        dom.requestPermissionBtn.disabled = !isNotificationSupported() || notificationPermissionValue() === "granted";
    }

    function renderFormState() {
        if (dom.notificationsToggle) dom.notificationsToggle.checked = settings.notificationsEnabled;
        if (dom.titleToggle) dom.titleToggle.checked = settings.titleBlinkEnabled;
        if (dom.soundToggle) dom.soundToggle.checked = settings.soundEnabled;
        renderPermissionState();
        renderButtonState();
    }

    async function requestNotificationPermission() {
        if (!isNotificationSupported()) return "unsupported";
        try {
            const granted = await Notification.requestPermission();
            renderPermissionState();
            renderButtonState();
            return granted;
        } catch (_err) {
            renderPermissionState();
            renderButtonState();
            return notificationPermissionValue();
        }
    }

    function stopTitleBlink() {
        if (blinkTimer) {
            window.clearInterval(blinkTimer);
            blinkTimer = null;
        }
        blinkState = false;
        document.title = baseTitle;
    }

    function startTitleBlink(nextBlinkTitle) {
        if (!settings.titleBlinkEnabled) return;
        blinkTitle = nextBlinkTitle || blinkTitle;

        if (blinkTimer) return;

        blinkTimer = window.setInterval(() => {
            blinkState = !blinkState;
            document.title = blinkState ? blinkTitle : baseTitle;
        }, 900);
    }

    async function playSignalTone() {
        if (!settings.soundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!audioContext) audioContext = new AudioCtx();
            if (audioContext.state === "suspended") {
                await audioContext.resume();
            }

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const now = audioContext.currentTime;

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(880, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start(now);
            oscillator.stop(now + 0.2);
        } catch (_err) {
            // Ignore autoplay / audio device errors.
        }
    }

    function sendNotification({ method = "", pubkey = "" } = {}) {
        if (!settings.notificationsEnabled) return;
        if (!isNotificationSupported()) return;
        if (notificationPermissionValue() !== "granted") return;

        const shortPubkey = pubkey ? `${String(pubkey).slice(0, 12)}...` : "unbekannt";
        const title = `NIP-46 Anfrage: ${method || "unknown"}`;
        const body = `Client: ${shortPubkey}`;

        try {
            const notif = new Notification(title, {
                body,
                tag: "nip46-permission-request",
                renotify: true,
                requireInteraction: false
            });
            notif.onclick = () => {
                window.focus();
                notif.close();
            };
        } catch (_err) {
            // Ignore notification runtime errors.
        }
    }

    function notifyPermissionRequest(request) {
        pendingAttentionCount += 1;
        const method = request?.method || "unknown";
        const pubkey = request?.pubkey || "";

        startTitleBlink(`Neue Anfrage: ${method}`);
        void playSignalTone();
        sendNotification({ method, pubkey });
    }

    function resolvePermissionRequest() {
        pendingAttentionCount = Math.max(0, pendingAttentionCount - 1);
        if (pendingAttentionCount === 0) {
            stopTitleBlink();
        }
    }

    function clearAttention() {
        pendingAttentionCount = 0;
        stopTitleBlink();
    }

    function bindFormHandlers() {
        if (dom.notificationsToggle) {
            dom.notificationsToggle.addEventListener("change", async () => {
                settings.notificationsEnabled = Boolean(dom.notificationsToggle.checked);
                saveSettings();
                if (settings.notificationsEnabled && notificationPermissionValue() === "default") {
                    await requestNotificationPermission();
                } else {
                    renderPermissionState();
                    renderButtonState();
                }
                onUiChanged();
            });
        }

        if (dom.titleToggle) {
            dom.titleToggle.addEventListener("change", () => {
                settings.titleBlinkEnabled = Boolean(dom.titleToggle.checked);
                saveSettings();
                if (!settings.titleBlinkEnabled) {
                    stopTitleBlink();
                } else if (pendingAttentionCount > 0) {
                    startTitleBlink(blinkTitle);
                }
                onUiChanged();
            });
        }

        if (dom.soundToggle) {
            dom.soundToggle.addEventListener("change", () => {
                settings.soundEnabled = Boolean(dom.soundToggle.checked);
                saveSettings();
                onUiChanged();
            });
        }

        if (dom.requestPermissionBtn) {
            dom.requestPermissionBtn.addEventListener("click", async () => {
                await requestNotificationPermission();
            });
        }
    }

    function initSettingsUi() {
        dom.notificationsToggle = document.getElementById("attention-notification-toggle");
        dom.titleToggle = document.getElementById("attention-title-toggle");
        dom.soundToggle = document.getElementById("attention-sound-toggle");
        dom.requestPermissionBtn = document.getElementById("attention-request-permission-btn");
        dom.permissionState = document.getElementById("attention-notification-state");

        renderFormState();
        bindFormHandlers();
    }

    window.addEventListener("focus", () => {
        stopTitleBlink();
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            stopTitleBlink();
        }
    });

    return {
        initSettingsUi,
        notifyPermissionRequest,
        resolvePermissionRequest,
        clearAttention,
        requestNotificationPermission,
        getSettings: () => ({ ...settings })
    };
}
