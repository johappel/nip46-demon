const CACHE_VERSION = "nip46-signer-v12";
const CORE_ASSETS = [
    "./",
    "./index.html",
    "./signer-ui.css",
    "./signer-ui.js",
    "./signer-nip46.js",
    "./manifest.webmanifest",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_VERSION);
        await cache.addAll(CORE_ASSETS);
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((key) => key !== CACHE_VERSION)
                .map((key) => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    if (req.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(req);
                const cache = await caches.open(CACHE_VERSION);
                cache.put(req, fresh.clone());
                return fresh;
            } catch (_err) {
                const cached = await caches.match(req);
                return cached || caches.match("./index.html");
            }
        })());
        return;
    }

    event.respondWith((async () => {
        const cached = await caches.match(req);
        if (cached) {
            const cache = await caches.open(CACHE_VERSION);
            fetch(req)
                .then((fresh) => {
                    if (fresh && fresh.ok) cache.put(req, fresh.clone());
                })
                .catch(() => {});
            return cached;
        }

        try {
            const fresh = await fetch(req);
            if (fresh && fresh.ok) {
                const cache = await caches.open(CACHE_VERSION);
                cache.put(req, fresh.clone());
            }
            return fresh;
        } catch (_err) {
            return new Response("Offline", { status: 503, statusText: "Offline" });
        }
    })());
});