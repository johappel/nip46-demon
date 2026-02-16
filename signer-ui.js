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
    let badgeSupported = typeof navigator !== "undefined" &&
        (typeof navigator.setAppBadge === "function" || typeof navigator.clearAppBadge === "function");

    const settings = loadSettings();

    const dom = {
        notificationsToggle: null,
        titleToggle: null,
        soundToggle: null,
        requestPermissionBtn: null,
        testNotificationBtn: null,
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
        if (dom.requestPermissionBtn) {
            dom.requestPermissionBtn.disabled = !isNotificationSupported() || notificationPermissionValue() === "granted";
        }
        if (dom.testNotificationBtn) {
            dom.testNotificationBtn.disabled = !isNotificationSupported();
        }
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
        setInlineAttention(false);
    }

    function startTitleBlink(nextBlinkTitle) {
        if (!settings.titleBlinkEnabled) return;
        blinkTitle = nextBlinkTitle || blinkTitle;
        setInlineAttention(true);

        if (blinkTimer) return;

        blinkTimer = window.setInterval(() => {
            blinkState = !blinkState;
            document.title = blinkState ? blinkTitle : baseTitle;
        }, 900);
    }

    function setInlineAttention(active) {
        const appTitle = document.getElementById("app-title");
        if (!appTitle) return;
        appTitle.classList.toggle("attention-pulse", Boolean(active));
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

    async function sendNotification({ method = "", pubkey = "" } = {}) {
        if (!settings.notificationsEnabled) return false;
        if (!isNotificationSupported()) return false;
        if (notificationPermissionValue() !== "granted") return false;

        const shortPubkey = pubkey ? `${String(pubkey).slice(0, 12)}...` : "unbekannt";
        const title = `NIP-46 Anfrage: ${method || "unknown"}`;
        const body = `Client: ${shortPubkey}`;
        const notificationOptions = {
            body,
            tag: "nip46-permission-request",
            renotify: true,
            requireInteraction: true,
            icon: "./icons/icon-192.png",
            badge: "./icons/icon-192.png"
        };

        try {
            if (navigator.serviceWorker && typeof navigator.serviceWorker.getRegistration === "function") {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration && typeof registration.showNotification === "function") {
                    await registration.showNotification(title, notificationOptions);
                    return true;
                }
            }

            const notif = new Notification(title, notificationOptions);
            notif.onclick = () => {
                window.focus();
                notif.close();
            };
            return true;
        } catch (_err) {
            // Ignore notification runtime errors.
            return false;
        }
    }

    async function runNotificationTest() {
        if (!settings.notificationsEnabled) {
            renderPermissionState();
            if (dom.permissionState) {
                dom.permissionState.textContent = "Windows-Benachrichtigung ist deaktiviert. Aktiviere zuerst die Checkbox.";
                dom.permissionState.style.color = "#ffb4b4";
            }
            return;
        }

        let permission = notificationPermissionValue();
        if (permission === "default") {
            permission = await requestNotificationPermission();
        }

        if (permission !== "granted") {
            renderPermissionState();
            return;
        }

        const delivered = await sendNotification({
            method: "test_notification",
            pubkey: "lokaler-test"
        });
        if (!delivered) {
            if (dom.permissionState) {
                dom.permissionState.textContent = "Test fehlgeschlagen: Notification konnte nicht angezeigt werden.";
                dom.permissionState.style.color = "#ffb4b4";
            }
            return;
        }

        if (pendingAttentionCount === 0 && settings.titleBlinkEnabled) {
            startTitleBlink("Test: Neue Signier-Anfrage");
            window.setTimeout(() => {
                if (pendingAttentionCount === 0) {
                    stopTitleBlink();
                }
            }, 2400);
        }

        if (dom.permissionState) {
            dom.permissionState.textContent = "Test-Benachrichtigung gesendet.";
            dom.permissionState.style.color = "#9ad1ff";
        }
    }

    async function updateAppBadge(count) {
        if (!badgeSupported) return;
        try {
            const n = Number(count) || 0;
            if (n > 0 && typeof navigator.setAppBadge === "function") {
                await navigator.setAppBadge(n);
                return;
            }
            if (typeof navigator.clearAppBadge === "function") {
                await navigator.clearAppBadge();
            }
        } catch (_err) {
            // Ignore badge runtime errors.
        }
    }

    function notifyPermissionRequest(request) {
        pendingAttentionCount += 1;
        const method = request?.method || "unknown";
        const pubkey = request?.pubkey || "";

        startTitleBlink(`Neue Anfrage: ${method}`);
        void playSignalTone();
        void sendNotification({ method, pubkey });
        void updateAppBadge(pendingAttentionCount);
    }

    function resolvePermissionRequest() {
        pendingAttentionCount = Math.max(0, pendingAttentionCount - 1);
        void updateAppBadge(pendingAttentionCount);
        if (pendingAttentionCount === 0) {
            stopTitleBlink();
        }
    }

    function clearAttention() {
        pendingAttentionCount = 0;
        void updateAppBadge(0);
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

        if (dom.testNotificationBtn) {
            dom.testNotificationBtn.addEventListener("click", async () => {
                await runNotificationTest();
            });
        }
    }

    function initSettingsUi() {
        dom.notificationsToggle = document.getElementById("attention-notification-toggle");
        dom.titleToggle = document.getElementById("attention-title-toggle");
        dom.soundToggle = document.getElementById("attention-sound-toggle");
        dom.requestPermissionBtn = document.getElementById("attention-request-permission-btn");
        dom.testNotificationBtn = document.getElementById("attention-test-notification-btn");
        dom.permissionState = document.getElementById("attention-notification-state");

        renderFormState();
        bindFormHandlers();
    }

    window.addEventListener("focus", () => {
        if (pendingAttentionCount === 0) {
            stopTitleBlink();
        }
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && pendingAttentionCount === 0) {
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
