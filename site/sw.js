const CACHE_NAME = "hvoreralle-v5";
const APP_SHELL = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./js/core.mjs",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/leaflet.js",
  "./vendor/firebase/firebase-app-compat.js",
  "./vendor/firebase/firebase-auth-compat.js",
  "./vendor/firebase/firebase-database-compat.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(
    APP_SHELL.map(path => new Request(new URL(path, self.registration.scope), { cache: "reload" }))
  )).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("hvoreralle-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  const cache = await caches.open(CACHE_NAME).catch(() => null);
  try {
    const response = await fetch(request, { cache: "no-cache", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    // Cache failures must not discard a successful network response.
    try { await cache.put(request, response.clone()); } catch {}
    return response;
  } catch {
    const cached = await cache?.match(request, { ignoreSearch: true }).catch(() => undefined);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const page = await cache?.match(new URL("./index.html", self.registration.scope).href).catch(() => undefined);
      if (page) return page;
    }
    return Response.error();
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  event.respondWith(networkFirst(event.request));
});
