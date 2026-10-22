/* MLBB TOP - service worker
   - File dell'app: prima la rete, così dopo ogni aggiornamento vedi subito la versione nuova.
     La copia salvata si usa solo offline o se la rete non risponde entro 4 secondi.
   - Immagini locali (img/): nomi con l'hash del contenuto, quindi non cambiano mai: dalla cache.
     Vengono salvate tutte all'installazione, così offline c'è tutto anche senza averle mai aperte.
   - Immagini e font esterni: dalla cache se già visti, altrimenti rete + salvataggio.
   - Aggiornamento dati live (arena.rone.dev): sempre dalla rete, mai in cache.
   VERSION e CORE li scrive tools/build.js (npm run build): VERSION è un'impronta dei file,
   quindi cambia da sola a ogni modifica e chi ha l'app installata riceve la versione nuova. */
var VERSION = "edabed62dc";
var CACHE = "mlbb-top-" + VERSION;
var EXT = "mlbb-top-ext-v1";
var EXT_MAX = 600;
var WAIT = 4000;
var CORE = ["./", "./index.html", "./css/app.css", "./css/lod.css", "./data/data.js", "./data/data-it.js", "./js/core.js", "./js/i18n.js", "./js/engine.js", "./js/ui.js", "./js/fx.js", "./js/build.js", "./js/draft.js", "./js/guide.js", "./js/lane.js", "./js/quick.js", "./js/tier.js", "./js/heroes.js", "./js/quiz.js", "./js/profile.js", "./js/start.js", "./js/settings.js", "./js/search.js", "./js/home.js", "./js/system.js", "./manifest.json", "./fonts/cinzel.woff2", "./fonts/rajdhani-600.woff2", "./fonts/rajdhani-700.woff2", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"];

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
    /* resto dei file dell'app: rete prima, cache come riserva */
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
