/* MLBB TOP - service worker
   - File dell'app: prima la rete, così dopo ogni aggiornamento vedi subito la versione nuova.
     La copia salvata si usa solo offline o se la rete non risponde entro 4 secondi.
   - Immagini e font esterni: dalla cache se già visti, altrimenti rete + salvataggio.
   - Aggiornamento dati live (arena.rone.dev): sempre dalla rete, mai in cache. */
var CACHE = "mlbb-top-v2";
var EXT = "mlbb-top-ext-v1";
var EXT_MAX = 600;
var WAIT = 4000;
var CORE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(CORE.map(function (u) { return new Request(u, { cache: "reload" }) }));
  }).then(function () { return self.skipWaiting() }));
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

function fromCache(cache, req) {
  return cache.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit || req.mode !== "navigate") return hit;
    return cache.match("./index.html").then(function (h) { return h || cache.match("./") });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.hostname === "arena.rone.dev") return;

  /* file dell'app: rete prima, cache come riserva */
  if (url.origin === self.location.origin) {
    e.respondWith(caches.open(CACHE).then(function (cache) {
      var net = fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then(function (res) {
        if (res && res.ok) return cache.put(req, res.clone()).then(function () { return res });
        return res;
      });
      e.waitUntil(net.catch(function () { }));
      var timer = new Promise(function (ok, no) { setTimeout(function () { no(new Error("timeout")) }, WAIT) });
      return Promise.race([net, timer]).catch(function () {
        return fromCache(cache, req).then(function (hit) { return hit || net }).catch(function () { return Response.error() });
      });
    }));
    return;
  }

  /* immagini e font esterni: cache se già visti, altrimenti rete + salvataggio */
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
