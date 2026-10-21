/* MLBB TOP - test automatici nel browser (Chromium via Playwright)
   Uso:  npm install && npx playwright install chromium && npm test
   Serve la cartella del progetto su una porta locale, blocca la rete esterna
   (le chiamate ad arena.rone.dev sono simulate) e controlla che l'app funzioni. */
var http = require("http"), fs = require("fs"), path = require("path");
var chromium = require("playwright").chromium;

var ROOT = path.join(__dirname, ".."), PORT = +process.env.PORT || 8790, URL0 = "http://127.0.0.1:" + PORT + "/";
var TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".webp": "image/webp" };

var fails = 0, passes = 0;
function ok(cond, msg) { if (cond) { passes++; console.log("  ✓ " + msg) } else { fails++; console.log("  ✗ " + msg) } }
function section(t) { console.log("\n" + t) }

function serve() {
  return new Promise(function (done) {
    var srv = http.createServer(function (req, res) {
      var p = decodeURIComponent(req.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
      var f = path.join(ROOT, path.normalize(p));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-cache" });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(PORT, "127.0.0.1", function () { done(srv) });
  });
}

/* risposta finta di arena.rone.dev: ogni eroe con win/pick/ban rate fissi */
function arenaBody(ids) {
  return JSON.stringify({ data: { records: ids.map(function (id, i) { return { data: { main_heroid: id, main_hero_win_rate: .45 + (i % 10) / 100, main_hero_appearance_rate: .01 + (i % 7) / 100, main_hero_ban_rate: (i % 5) / 10 } } }) } });
}

async function newPage(ctx, errs) {
  var p = await ctx.newPage();
  p.on("pageerror", function (e) { errs.push(e.message) });
  p.on("dialog", function (d) { p.lastDialog = d.message(); d.accept() });
  return p;
}

async function run() {
  var srv = await serve();
  var browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    var ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    var arena = { mode: "ok" };
    /* niente rete esterna: arena.rone.dev simulato, tutto il resto bloccato */
    await ctx.route(function (u) { return !u.href.startsWith(URL0) }, async function (route) {
      var u = route.request().url();
      if (u.indexOf("https://arena.rone.dev/") === 0) {
        if (arena.mode === "fail") return route.fulfill({ status: 500, body: "" });
        return route.fulfill({ status: 200, contentType: "application/json", body: arenaBody(arena.ids || []) });
      }
      return route.abort();
    });
    var errs = [], p = await newPage(ctx, errs);
    await p.goto(URL0);
    await p.waitForFunction(function () { return window.NAMES && document.querySelector("#v-draft.on") });
    arena.ids = await p.evaluate(function () { return Object.keys(HX).map(function (h) { return HX[h].id }) });

    section("Avvio");
    var info = await p.evaluate(function () { return { heroes: NAMES.length, items: Object.keys(ITEMS).length } });
    ok(info.heroes > 100, "dati caricati: " + info.heroes + " eroi, " + info.items + " oggetti");
    ok(errs.length === 0, "nessun errore JavaScript all'avvio" + (errs.length ? ": " + errs.join(" | ") : ""));
    var first = await p.evaluate(function () { return { picks: used().length, hint: /Inizia dai ban/.test(document.querySelector("#v-draft").textContent) } });
    ok(first.picks === 0 && first.hint, "prima apertura: draft vuoto con il suggerimento iniziale");

    section("Schermate");
    for (var v of ["draft", "tier", "heroes", "quiz", "profile"]) {
      var n = await p.evaluate(function (v) { go(v); return document.querySelector("#v-" + v).innerHTML.length }, v);
      ok(n > 200, "schermata " + v + " disegnata");
    }
    for (var sub of ["her", "itm", "emb", "spl"]) {
      var c = await p.evaluate(function (s) { go("heroes"); hsub = s; rHeroes(); return document.querySelectorAll("#hlist .hg").length || document.querySelectorAll("#hlist > *").length }, sub);
      ok(c > 0, "database, sezione " + sub + ": " + c + " elementi");
    }
    var heroes = await p.evaluate(function () { return NAMES.filter(function (h, i) { return i % 9 === 0 }) });
    var bad = [];
    for (var h of heroes) for (var t of ["ab", "bd", "mu", "lo"]) {
      var len = await p.evaluate(function (a) { openHero(a[0], a[1]); return document.querySelector("#hbody").innerHTML.length }, [h, t]);
      if (len < 50) bad.push(h + "/" + t);
    }
    ok(!bad.length, "schede eroe (" + heroes.length + " eroi × 4 schede)" + (bad.length ? ": vuote " + bad.join(", ") : ""));
    ok(errs.length === 0, "nessun errore JavaScript nelle schermate" + (errs.length ? ": " + errs.join(" | ") : ""));

    section("Draft");
    var d = await p.evaluate(function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; go("draft");
      var r0 = recs.length;
      setSlot(S.enemy, 0, NAMES[3]); setSlot(S.enemy, 1, NAMES[40]); setSlot(S.ally, 0, NAMES[10]); rDraft();
      var r = focusRec();
      return { r0: r0, rec: r && r.n, used: used().indexOf(r && r.n) > -1, lanes: document.querySelectorAll(".lrow").length };
    });
    ok(d.r0 > 0 && d.rec, "consigli presenti (consigliato: " + d.rec + ")");
    ok(!d.used, "il consigliato non è già in campo");
    ok(d.lanes === 5, "5 righe di lane");
    var picked = await p.evaluate(function () { var n = focusRec().n; document.getElementById("pk").click(); return S.ally.indexOf(n) > -1 });
    ok(picked, "il pulsante Scegli mette il consigliato negli alleati");

    section("Condividi draft");
    var shared = await p.evaluate(function () {
      S.banA[0] = NAMES[20]; S.banE[1] = NAMES[21]; S.allyLane[0] = "j"; save(); rDraft();
      return { url: shareUrl(), st: JSON.stringify([S.ally, S.enemy, S.banA, S.banE, S.allyLane]) };
    });
    ok(/#d=a[\d.]+_e[\d.]+_x[\d.]+_y[\d.]+_l[a-z-]{5}$/.test(shared.url), "link generato: " + shared.url.split("#")[1]);
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: URL0 });
    await p.click("#share"); await p.waitForTimeout(300);
    var clip = await p.evaluate(async function () { return { txt: await navigator.clipboard.readText(), btn: document.getElementById("share").textContent } });
    ok(clip.txt === shared.url && /copiato/.test(clip.btn), "il pulsante Condividi copia il link e lo conferma");
    var ctx2 = await browser.newContext(), errs2 = [], p2 = await newPage(ctx2, errs2);
    await ctx2.route(function (u) { return !u.href.startsWith(URL0) }, function (r) { return r.abort() });
    await p2.goto(shared.url); await p2.waitForFunction(function () { return window.NAMES && document.querySelector("#v-draft.on") });
    var got = await p2.evaluate(function () { return { st: JSON.stringify([S.ally, S.enemy, S.banA, S.banE, S.allyLane]), hash: location.hash } });
    ok(got.st === shared.st, "chi apre il link vede lo stesso draft (pick, ban e lane)");
    ok(got.hash === "", "il codice viene tolto dalla barra degli indirizzi dopo l'apertura");
    await p2.evaluate(function () { location.hash = "d=zzz" }); await p2.waitForTimeout(300);
    ok(/non valido/.test(p2.lastDialog || ""), "link rovinato: avviso, draft invariato");
    var still = await p2.evaluate(function () { return JSON.stringify([S.ally, S.enemy, S.banA, S.banE, S.allyLane]) });
    ok(still === shared.st, "il draft resta quello di prima dopo un link rovinato");
    ok(errs2.length === 0, "nessun errore JavaScript aprendo il link" + (errs2.length ? ": " + errs2.join(" | ") : ""));
    await ctx2.close();

    section("Immagini locali");
    var im = await p.evaluate(async function () {
      var ls = await (await fetch("img/list.json")).json(), miss = [];
      for (var u of ls) { var r = await fetch(u); if (!r.ok) miss.push(u) }
      go("heroes"); hsub = "her"; rHeroes();
      return { n: ls.length, miss: miss };
    });
    ok(im.n > 0 && !im.miss.length, im.n + " immagini in img/list.json, tutte presenti" + (im.miss.length ? " (mancano " + im.miss.length + ")" : ""));
    var refs = await p.evaluate(function () { var s = JSON.stringify([HX, ITEMS, TAL, SPL]), m = s.match(/img\/[0-9a-f]+\.webp/g) || []; return m.filter(function (u, i) { return m.indexOf(u) === i }) });
    var listed = await p.evaluate(async function () { return (await fetch("img/list.json")).json() });
    var unl = refs.filter(function (u) { return listed.indexOf(u) < 0 });
    ok(!unl.length, "ogni immagine usata nei dati è nell'elenco" + (unl.length ? ": " + unl.slice(0, 3).join(", ") : ""));

    section("Aggiornamento live (simulato)");
    p.lastDialog = null; arena.mode = "fail";
    await p.evaluate(function () { localStorage.removeItem("draftsync_live"); go("profile") });
    await p.click("#live"); await p.waitForTimeout(500);
    ok(/non riuscito/.test(p.lastDialog || ""), "server in errore: avviso mostrato, niente salvato");
    arena.mode = "ok"; p.lastDialog = null;
    await p.evaluate(function () { go("profile") });
    await p.click("#live"); await p.waitForFunction(function () { return !!localStorage.getItem("draftsync_live") }, null, { timeout: 5000 }).catch(function () { });
    var lv = await p.evaluate(function () { var x = JSON.parse(localStorage.getItem("draftsync_live") || "null"); return x && Object.keys(x.rk).length });
    ok(lv > 100, "server ok: statistiche salvate per " + lv + " eroi");

    section("Tendenze e aggiornamento automatico");
    var prev = await p.evaluate(function () { return JSON.parse(localStorage.getItem("draftsync_prev") || "null") });
    ok(prev && prev.date === "20/10/2026" && Object.keys(prev.rk).length > 100, "la classifica precedente (snapshot del " + (prev && prev.date) + ") è salvata per le tendenze");
    var tr = await p.evaluate(function () { tf = "all"; tq = ""; tOpen = { SS: 1, S: 1, A: 1, B: 1 }; go("tier"); var r = document.querySelector(".radar").textContent; return { arrows: document.querySelectorAll("#tlist .dl").length, radar: /Dal 20\/10\/2026: in crescita/.test(r), hero: (openHero(NAMES[0]), document.querySelectorAll("#v-hero .dl").length) } });
    ok(tr.arrows > 20, "frecce di tendenza nella Tier list: " + tr.arrows);
    ok(tr.radar, "il riquadro Radar elenca chi sale e chi scende");
    ok(tr.hero <= 1, "la scheda eroe mostra la variazione del win rate se c'è");
    await p.evaluate(function () { go("profile") }); await p.click("#live"); await p.waitForTimeout(500);
    var prev2 = await p.evaluate(function () { return JSON.parse(localStorage.getItem("draftsync_prev") || "null").date });
    ok(prev2 === "20/10/2026", "un secondo aggiornamento nello stesso giorno non cancella il confronto");
    var ctx3 = await browser.newContext(), errs3 = [], p3 = await newPage(ctx3, errs3), calls = { n: 0 };
    await ctx3.route(function (u) { return !u.href.startsWith(URL0) }, function (r) { if (r.request().url().indexOf("arena.rone.dev") > -1) { calls.n++; return r.fulfill({ status: 200, contentType: "application/json", body: arenaBody(arena.ids) }) } return r.abort() });
    await p3.goto(URL0); await p3.waitForTimeout(2500);
    var auto = await p3.evaluate(function () { return { live: META.live, saved: !!localStorage.getItem("draftsync_live") } });
    ok(auto.live && auto.saved && calls.n === 3, "all'apertura le statistiche si aggiornano da sole (" + calls.n + " richieste)");
    await p3.reload(); await p3.waitForTimeout(2500);
    ok(calls.n === 3, "riaprendo nello stesso giorno non riscarica");
    await p3.evaluate(function () { localStorage.clear(); S.autoLive = false; save() }); await p3.reload(); await p3.waitForTimeout(2500);
    ok(calls.n === 3, "con l'opzione spenta non scarica niente");
    ok(errs3.length === 0, "nessun errore JavaScript" + (errs3.length ? ": " + errs3.join(" | ") : ""));
    await ctx3.close();

    section("Offline (service worker)");
    await p.evaluate(function () { return navigator.serviceWorker.ready });
    await p.reload(); await p.waitForFunction(function () { return navigator.serviceWorker.controller });
    var cached = await p.evaluate(async function () { var n = 0; for (var k of await caches.keys()) n += (await (await caches.open(k)).keys()).length; return n });
    ok(cached > listed.length, "file salvati in cache: " + cached);
    await ctx.setOffline(true);
    await p.reload(); await p.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    var off = await p.evaluate(async function () { go("heroes"); var r = await fetch("img/list.json"), l = await r.json(), ok2 = 0; for (var u of l) if ((await fetch(u)).ok) ok2++; return { heroes: NAMES.length, img: ok2, tot: l.length } });
    ok(off.heroes > 100 && off.img === off.tot, "offline: " + off.heroes + " eroi e " + off.img + "/" + off.tot + " immagini");
    await ctx.setOffline(false);

    ok(errs.length === 0, "nessun errore JavaScript in tutto il test" + (errs.length ? ": " + errs.join(" | ") : ""));
  } finally {
    await browser.close(); srv.close();
  }
  console.log("\n" + passes + " controlli superati, " + fails + " falliti");
  process.exit(fails ? 1 : 0);
}
run().catch(function (e) { console.error(e); process.exit(1) });
