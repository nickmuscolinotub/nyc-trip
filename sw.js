// NYC Trip · service worker
// Caches the app shell + map tiles so the app works offline on the subway.

const VERSION = "nyc-trip-v13";
const SHELL = "nyc-trip-shell-v13";
const TILES = "nyc-trip-tiles-v13";

const SHELL_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700;800;900&display=swap"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) =>
      // addAll fails if any single request fails; use individual adds + ignore failures for cross-origin
      Promise.all(SHELL_URLS.map((url) =>
        cache.add(new Request(url, { mode: "no-cors" })).catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL && k !== TILES).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const isTile = url.hostname.endsWith(".basemaps.cartocdn.com") || url.hostname.includes("cartocdn.com");
  const isFont = url.hostname.includes("fonts.gstatic.com") || url.hostname.includes("fonts.googleapis.com");
  const isAppShell = url.origin === self.location.origin || url.hostname === "unpkg.com";

  // Map tiles: stale-while-revalidate
  if (isTile) {
    event.respondWith(
      caches.open(TILES).then((cache) =>
        cache.match(req).then((cached) => {
          const fetched = fetch(req).then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Fonts: cache-first
  if (isFont) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(SHELL).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => cached)
      )
    );
    return;
  }

  // App shell: cache-first, fall back to network, fall back to index for navigation
  if (isAppShell) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached || fetch(req).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(SHELL).then((c) => c.put(req, clone));
          }
          return res;
        }).catch(() => {
          if (req.mode === "navigate") return caches.match("./index.html");
        })
      )
    );
  }
});
