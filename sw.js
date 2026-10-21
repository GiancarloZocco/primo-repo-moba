/* MLBB TOP - service worker (uso offline)
   - File dell'app: precache + aggiornamento in background (alla prossima apertura vedi la versione nuova)
   - Immagini e font esterni: salvati man mano che vengono caricati
   - Aggiornamento dati live (arena.rone.dev): sempre dalla rete, mai in cache */
var CACHE = "mlbb-top-v1";
var EXT = "mlbb-top-ext-v1";
var EXT_MAX = 600;
var CORE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE) }).then(function () { return self.skipWaiting() }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE && k !== EXT }).map(function (k) { return caches.delete(k) }));
  }).then(function () { return self.clients.claim() }));
});

function trim(cache) {
  return cache.keys().then(function (ks) {
    if (ks.length <= EXT_MAX) return;
    return Promise.all(ks.slice(0, ks.length - EXT_MAX).map(function (k) { return cache.delete(k) }));
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.hostname === "arena.rone.dev") return;

  /* file dell'app (stessa origine): cache subito, rete in background */
  if (url.origin === self.location.origin) {
    e.respondWith(caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function () { return null });
        if (hit) { e.waitUntil(net); return hit }
        return net.then(function (res) {
          if (res) return res;
          if (req.mode === "navigate") return cache.match("./index.html");
          return Response.error();
        });
      });
    }));
    return;
  }

  /* immagini e font esterni: dalla cache se già visti, altrimenti rete + salvataggio */
  if (url.protocol === "https:") {
    e.respondWith(caches.open(EXT).then(function (cache) {
      return cache.match(req.url).then(function (hit) {
        if (hit) return hit;
        return fetch(req.url, { mode: "cors" }).then(function (res) {
          if (res && res.ok) { cache.put(req.url, res.clone()).then(function () { return trim(cache) }); return res }
          return fetch(req);
        }).catch(function () { return fetch(req) });
      });
    }));
  }
});
