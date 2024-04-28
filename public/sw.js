/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

console.info("[sw] Service Worker installed!");

const CACHE = "smp-wrk-v1";

const assets = [
  "/",
  "/screenshots/D-Home.png",
  "/screenshots/L-Home.png",
  "/screenshots/D-Settings.png",
  "/screenshots/L-Settings.png",
  "/Simpler-Work-128.svg",
  "/Simpler-Work-256.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(assets)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(async (res) => {
      if (res) return res;

      const f = await fetch(e.request);

      if (e.request.method === "GET")
        (await caches.open(CACHE)).add(e.request, f);

      return f;
    })
  );
});
