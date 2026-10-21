/* MLBB TOP - service worker (uso offline)
   - File dell'app: precache + aggiornamento in background (alla prossima apertura vedi la versione nuova)
   - Immagini locali (img/): nomi con l'hash del contenuto, quindi non cambiano mai: dalla cache
   - Immagini e font esterni: salvati man mano che vengono caricati
   - Aggiornamento dati live (arena.rone.dev): sempre dalla rete, mai in cache
   A ogni rilascio cambia VERSION: il browser installa il nuovo service worker, riscarica tutto,
   cancella la cache vecchia e la pagina si ricarica da sola con la versione nuova. */
var VERSION = "2026-10-21.1";
var CACHE = "mlbb-top-" + VERSION;
var EXT = "mlbb-top-ext-v1";
var EXT_MAX = 600;
var CORE = ["./", "./index.html", "./data.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];

/* scarica saltando la cache HTTP del browser, così una versione nuova non riceve file vecchi */
function fresh(u) { return new Request(u, { cache: "reload" }) }

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(CORE.map(fresh)).then(function () {
      /* immagini locali: se qualcuna non arriva l'installazione va avanti, verrà salvata al primo uso */
      return fetch(fresh("./img/list.json")).then(function (r) { return r.json() }).then(function (ls) {
        return Promise.all(ls.map(function (u) { return c.add(fresh("./" + u)).catch(function () { }) }));
      }).catch(function () { });
    });
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

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.hostname === "arena.rone.dev") return;

  /* file dell'app (stessa origine) */
  if (url.origin === self.location.origin) {
    /* immagini locali: immutabili, basta la cache */
    if (/\/img\/[0-9a-f]+\.webp$/.test(url.pathname)) {
      e.respondWith(caches.open(CACHE).then(function (cache) {
        return cache.match(req, { ignoreSearch: true }).then(function (hit) {
          return hit || fetch(req).then(function (res) { if (res && res.ok) cache.put(req, res.clone()); return res });
        });
      }));
      return;
    }
    /* resto: cache subito, rete in background */
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
