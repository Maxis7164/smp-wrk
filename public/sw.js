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
  "/manifest.json",
  "/Inter.ttf"
];

async function respond(req) {
  try {
    const f = await fetch(req);
    
    if (f.ok) {
      
      if (req.method === 'GET') {
        const cache = (await caches.open(CACHE));
        cache.put(req, f.clone())
      }
      
      return f;
    } 
  } catch (err) {
    return caches.match(req);
  }
}


self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(assets)));
});

self.addEventListener('active', async (e) => {
  //? delete stale caches
  const del = (await caches.keys()).filter((key) => key !== CACHE);
  e.waitUntil(Promise.all(del.map((key) => caches.delete(key))))
})

self.addEventListener("fetch", (e) => {
  e.respondWith(respond(e.request))
});
