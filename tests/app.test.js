/* MLBB TOP - test automatici nel browser (Chromium via Playwright)
   Uso:  npm install && npx playwright install chromium && npm test
   Serve la cartella del progetto su una porta locale, blocca la rete esterna
   (le chiamate ad arena.rone.dev sono simulate) e controlla che l'app funzioni. */
var http = require("http"), fs = require("fs"), path = require("path");
var chromium = require("playwright").chromium;

var ROOT = path.join(__dirname, ".."), PORT = +process.env.PORT || 8790, URL0 = "http://127.0.0.1:" + PORT + "/";
var TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".png": "image/png", ".webp": "image/webp" };

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
    await p.waitForFunction(function () { return window.NAMES && document.querySelector("#v-start.on") });
    arena.ids = await p.evaluate(function () { return Object.keys(HX).map(function (h) { return HX[h].id }) });

    section("File generati");
    var built = true; try { require("child_process").execFileSync("node", [path.join(ROOT, "tools/build.js"), "--check"], { stdio: "pipe" }) } catch (e) { built = false }
    ok(built, "img/list.json e sw.js aggiornati (altrimenti lancia npm run build)");

    section("Salvataggi");
    var ctxm = await browser.newContext(), pm = await newPage(ctxm, errs);
    await ctxm.route(function (u) { return !u.href.startsWith(URL0) }, function (r) { return r.abort() });
    await ctxm.addInitScript(function () { if (!sessionStorage.getItem("seed")) { sessionStorage.setItem("seed", 1); localStorage.setItem("draftsync", JSON.stringify({ nick: "Vecchio", ally: ["Layla", null, null, null, null], quiz: { xp: 120 } })); localStorage.setItem("draftsync_prev", JSON.stringify({ rk: {}, date: "01/01/2026" })) } });
    await pm.goto(URL0); await pm.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    var mg = await pm.evaluate(function () { save(); return { old: localStorage.getItem("draftsync") || localStorage.getItem("draftsync_prev"), s: JSON.parse(localStorage.getItem("mlbb-top")), prev: !!localStorage.getItem("mlbb-top-prev") } });
    ok(!mg.old && mg.s.nick === "Vecchio" && mg.s.ally[0] === "Layla" && mg.s.quiz.xp === 120 && mg.prev, "i dati salvati coi vecchi nomi (draftsync) passano ai nuovi senza perdite");
    ok(mg.s.v === 2, "i salvataggi hanno il numero di versione dello schema (" + mg.s.v + ")");
    ok(await pm.evaluate(function () { return cur === "home" && S.onb === true }), "chi aggiorna l'app non rivede la configurazione iniziale");
    await ctxm.close();

    section("Avvio");
    var info = await p.evaluate(function () { return { heroes: NAMES.length, items: Object.keys(ITEMS).length } });
    ok(info.heroes > 100, "dati caricati: " + info.heroes + " eroi, " + info.items + " oggetti");
    ok(await p.evaluate(function () { return getComputedStyle(document.querySelector(".app")).display === "flex" && getComputedStyle(document.body).backgroundColor === "rgb(6, 8, 12)" }), "foglio di stile caricato (css/app.css)");
    ok(errs.length === 0, "nessun errore JavaScript all'avvio" + (errs.length ? ": " + errs.join(" | ") : ""));
    var ob = await p.evaluate(function () {
      var r = { start: cur === "start" && !!document.getElementById("spool") };
      [].filter.call(document.querySelectorAll("#srole button"), function (b) { return b.textContent === "Tiratore" })[0].click();
      [].filter.call(document.querySelectorAll("#slane button"), function (b) { return b.textContent === "Gold Lane" })[0].click();
      r.sugg = [].map.call(document.querySelectorAll("#spools button"), function (b) { return b.textContent.replace("+", "") });
      document.querySelector("#spools button").click(); document.querySelector("#spool .pch.add").click();
      r.sheet = document.getElementById("sheet").classList.contains("show"); document.querySelector("#grid button").click();
      r.pool = S.pool.slice(); document.getElementById("snick").value = "Tester"; document.getElementById("sgo").click();
      r.after = cur + "|" + S.onb + "|" + S.main + "|" + S.lane + "|" + S.nick + "|" + JSON.parse(localStorage.getItem("mlbb-top")).pool.length;
      return r;
    });
    ok(ob.start, "primo avvio: si apre la configurazione iniziale");
    ok(ob.sugg.length && ob.pool.length === 2 && ob.pool[0] === ob.sugg[0].trim(), "pool: eroi suggeriti per la lane e aggiunta dal selettore (" + ob.pool.join(", ") + ")");
    ok(ob.after === "home|true|X|o|Tester|2" && ob.sheet, "a fine configurazione si va alla Home con ruolo, lane, nickname e pool salvati (" + ob.after + ")");
    var tu = await p.evaluate(async function () {
      await new Promise(function (r) { setTimeout(r, 600) }); var r = { open: !!document.getElementById("tour") }, n = 0;
      while (document.getElementById("tour") && !document.querySelector("#tour.out") && n < 20) { n++; document.getElementById("tnext").click() }
      r.n = n; r.done = S.tour === true; go("home"); return r;
    });
    ok(tu.open && tu.done && tu.n === 9, "dopo la configurazione parte il tutorial di Layla e si chiude dopo " + tu.n + " passi");
    var first = await p.evaluate(function () { S.pool = []; save(); var home = cur === "home"; go("draft"); return { home: home, picks: used().length, hint: /Inizia dai ban/.test(document.querySelector("#v-draft").textContent) } });
    ok(first.home, "dopo la configurazione l'app è sulla Home");
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

    section("Home e navigazione");
    var nv = await p.evaluate(function () {
      go("home");
      var groups = [].map.call(document.querySelectorAll("#nav button"), function (b) { return b.textContent }).join(","), r = { groups: groups };
      document.querySelector('#nav button[data-g="study"]').click(); r.study = cur + "|" + [].map.call(document.querySelectorAll("#subnav button"), function (b) { return b.textContent }).join(",");
      document.querySelector('#nav button[data-g="play"]').click(); r.play = cur + "|" + [].map.call(document.querySelectorAll("#subnav button"), function (b) { return b.textContent }).join(",");
      document.querySelector('#nav button[data-g="me"]').click(); [].filter.call(document.querySelectorAll("#subnav button"), function (b) { return b.textContent === "Impostazioni" })[0].click(); r.set = cur === "settings" && !!document.getElementById("bkx") && !document.querySelector("#v-profile #bkx");
      go("heroes"); openHero("Layla"); r.heroNav = document.querySelector("#nav button.on").dataset.g + "|" + document.querySelector("#subnav button.on").textContent;
      go("home"); document.getElementById("hdraft").click(); r.draft = cur;
      S.newsSeen = "vecchia"; go("home"); r.news1 = !!document.getElementById("hnews"); document.getElementById("hnews").click(); r.newsPage = cur === "news" && document.querySelectorAll("#v-news li").length > 5; go("home"); r.news2 = !!document.getElementById("hnews");
      return r;
    });
    ok(nv.groups === "Home,Gioca,Studia,Io", "barra in basso a gruppi: " + nv.groups);
    ok(/^(tier|heroes|quiz)\|Tier list,Eroi,Quiz$/.test(nv.study) && /^(draft|guide|cmp|games)\|Draft,Guida,Confronto,Storico$/.test(nv.play), "barra del gruppo: Studia e Gioca con le loro schermate (" + nv.study + " · " + nv.play + ")");
    ok(nv.set, "Impostazioni in una schermata a parte (non più nel Profilo)");
    ok(nv.heroNav === "study|Eroi", "la scheda eroe resta sotto Studia → Eroi");
    ok(nv.draft === "draft", "dalla Home si va al draft");
    ok(nv.news1 && nv.newsPage && !nv.news2, "avviso Novità in Home finché non apri la pagina, poi sparisce");
    /* anche dove 100dvh non esiste (browser vecchi) la pagina non deve scorrere: scorre solo la schermata, la barra resta ferma */
    var fx = await p.evaluate(async function () {
      for (var sh of document.styleSheets) { try { for (var r of sh.cssRules) if (r.selectorText === ".app" && /dvh/.test(r.style.height)) r.style.removeProperty("height") } catch (e) { } }
      go("tier"); await new Promise(function (r) { setTimeout(r, 50) });
      var sc = document.getElementById("v-tier"); sc.scrollTop = 99999; var nav = document.getElementById("nav").getBoundingClientRect();
      return { page: document.scrollingElement.scrollHeight <= innerHeight + 1, inner: sc.scrollTop > 0, nav: Math.abs(nav.bottom - innerHeight) < 2 };
    });
    /* computer con finestra bassa: la cornice da telefono si accorcia e la lista del selettore resta raggiungibile */
    await p.setViewportSize({ width: 1280, height: 700 });
    var low = await p.evaluate(async function () {
      go("draft"); await new Promise(function (r) { setTimeout(r, 50) }); var app = document.querySelector(".app").getBoundingClientRect();
      openPick("Ban alleati 2", NAMES, function () { }); await new Promise(function (r) { setTimeout(r, 50) });
      var box = document.querySelector("#sheet .box"); box.scrollTop = 99999; var last = document.getElementById("grid").lastElementChild.getBoundingClientRect(), nav = document.getElementById("nav").getBoundingClientRect();
      document.getElementById("sheet").classList.remove("show");
      return { fits: app.bottom <= innerHeight, last: last.bottom <= innerHeight + 1 && last.bottom > 0, nav: nav.bottom <= innerHeight };
    });
    await p.setViewportSize({ width: 390, height: 844 });
    ok(low.fits && low.nav && low.last, "computer con finestra bassa: l'app sta nella finestra e si arriva in fondo alla lista degli eroi");
    var hd = await p.evaluate(async function () {
      var out = []; document.querySelector(".app").style.maxWidth = "320px";
      for (var v of ["guide", "cmp", "draft", "settings"]) { go(v); await new Promise(function (r) { setTimeout(r, 30) }); var a = document.getElementById("act").getBoundingClientRect(), t = document.querySelector(".top").getBoundingClientRect(); if (a.right > t.right + 1) out.push(v) }
      document.querySelector(".app").style.maxWidth = ""; return out;
    });
    ok(!hd.length, "telefono stretto (320px): i pulsanti dell'intestazione restano nello schermo anche con sottotitoli lunghi" + (hd.length ? ": fuori in " + hd.join(", ") : ""));
    ok(fx.page && fx.inner && fx.nav, "Tier list lunga: scorre la schermata, la pagina no e la barra in basso resta ferma");

    section("Draft");
    var d = await p.evaluate(function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; go("draft");
      var r0 = recs.length;
      setSlot(S.enemy, 0, NAMES[3]); setSlot(S.enemy, 1, NAMES[40]); setSlot(S.ally, 0, NAMES[10]); rDraft();
      var r = focusRec();
      return { r0: r0, rec: r && r.n, used: used().indexOf(r && r.n) > -1, lanes: document.querySelectorAll("#lanes .lrow").length };
    });
    ok(d.r0 > 0 && d.rec, "consigli presenti (consigliato: " + d.rec + ")");
    ok(!d.used, "il consigliato non è già in campo");
    ok(d.lanes === 5, "5 righe di lane");
    var rp = await p.evaluate(function () {
      var st = JSON.stringify([S.ally, S.enemy]); document.getElementById("rp").click();
      var d = document.getElementById("dlg"), r = { shown: !!d && /Azzerare i pick/.test(d.textContent) && !!d.querySelector(".btn.rd") };
      document.getElementById("dlgno").click(); r.kept = JSON.stringify([S.ally, S.enemy]) === st;
      return r;
    });
    ok(rp.shown && rp.kept, "Azzera pick chiede conferma con la finestra dell'app; Annulla lascia il draft com'era");
    var pl = await p.evaluate(function () {
      var c = H[NAMES[50]].l.charAt(0), h = NAMES.filter(function (x) { return used().indexOf(x) < 0 && H[x].l.indexOf(c) > -1 })[5];
      S.pool = []; compute(); var a = poolRecs.length;
      S.pool = [h]; S.lane = c; go("draft"); var r = poolRecs[0], row = document.querySelectorAll("#poolr .lcand").length;
      var bonus = r && r.parts.some(function (x) { return /pool/.test(x.t) && x.v === 2 });
      openPick("x", free(), function () { }, { quick: 1 }); var g = document.querySelector("#grid .ghd").textContent, g1 = document.querySelector("#grid .ghd + button").textContent; document.getElementById("sheet").classList.remove("show");
      S.useMine = false; compute(); var off = poolRecs.length; S.useMine = true;
      S.pool = []; S.lane = null; save(); go("draft");
      return { a: a, h: h, r: r && r.n, lane: r && r.lane === c, row: row, bonus: bonus, g: g, g1: g1, off: off };
    });
    ok(pl.a === 0 && pl.r === pl.h && pl.lane && pl.row === 1, "pool: riga «Dal tuo pool» nel draft con " + pl.h);
    ok(pl.bonus, "pool: bonus nei consigli, più alto nella lane preferita");
    ok(pl.g === "Il tuo pool" && pl.g1 === pl.h, "pool: primo gruppo nel selettore degli eroi");
    ok(pl.off === 0, "pool: si disattiva con «Usa i miei eroi nei consigli»");

    section("Guida in partita");
    var gd = await p.evaluate(function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null];
      go("guide"); var empty = !!document.getElementById("gdr") && document.querySelectorAll("#glane button").length === 5;
      setSlot(S.ally, 0, "Tigreal"); ["Estes", "Lancelot", "Layla"].forEach(function (h, i) { setSlot(S.enemy, i, h) }); go("guide");
      var txt = document.querySelector("#v-guide").textContent;
      document.querySelectorAll("#glane button")[3].click(); var jg = /Retribution/.test(document.querySelector("#v-guide").textContent);
      var li = document.querySelector("#v-guide .gtips li"), cs = getComputedStyle(li), wide = li.getBoundingClientRect().width > 200 && cs.position === "static" && cs.borderRadius === "0px";
      gLane = null; S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; save();
      return { wide: wide, empty: empty, plan: /Tigreal/.test(txt) && /Lancelot/.test(txt) && /Layla/.test(txt) && /anti-cure contro Estes/.test(txt), phases: /Lord/.test(txt) && /Turtle/.test(txt), jg: jg };
    });
    ok(gd.empty, "guida: senza draft invita ad andare al draft, 5 lane da scegliere");
    ok(gd.plan, "guida: piano dal draft (iniziatore, bersagli, minacce, anti-cure)");
    ok(gd.phases && gd.jg, "guida: obiettivi per fase e consigli della lane scelta");
    ok(gd.wide, "guida: le righe del piano sono testo normale (non prendono lo stile degli interruttori)");

    section("Ricerca unica");
    var sr = await p.evaluate(function () {
      var r = {}; document.getElementById("srch").click(); r.open = document.getElementById("ssheet").classList.contains("show");
      var q = function (t) { var x = document.getElementById("sq"); x.value = t; x.oninput(); return [].map.call(document.querySelectorAll("#sres .ghd"), function (h) { return h.textContent }).join(",") };
      r.lay = q("lay"); r.first = document.querySelector("#sres button b").textContent;
      r.acc = q("ÀTHENA"); r.none = q("zzzz") === "" && /Nessun risultato/.test(document.getElementById("sres").textContent);
      q("athena"); document.querySelector("#sres button").click();
      r.item = cur === "heroes" && hsub === "itm" && document.querySelectorAll("#hlist details").length === 1 && !document.getElementById("ssheet").classList.contains("show");
      document.getElementById("srch").click(); q("impost"); document.querySelector("#sres button").click(); r.scr = cur;
      document.getElementById("srch").click(); q("layla"); var e = new KeyboardEvent("keydown", { key: "Enter" }); document.getElementById("sq").onkeydown(e); r.hero = cur + "|" + hero;
      hsub = "her"; hq = ""; return r;
    });
    ok(sr.open && /^Eroi/.test(sr.lay) && sr.first === "Layla", "la lente apre la ricerca; «lay» trova per prima Layla (" + sr.lay + ")");
    ok(sr.acc === "Oggetti" && sr.none, "ricerca senza accenti e maiuscole, messaggio se non trova nulla");
    ok(sr.item, "un oggetto apre il database filtrato su quell'oggetto");
    ok(sr.scr === "settings" && sr.hero === "hero|Layla", "trova anche le schermate; Invio apre il primo risultato");

    section("Interfaccia in inglese");
    var ctxe = await browser.newContext({ viewport: { width: 390, height: 844 } }), pe = await newPage(ctxe, errs);
    await ctxe.route(function (u) { return !u.href.startsWith(URL0) }, function (r) { return r.abort() });
    await pe.goto(URL0); await pe.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    await pe.evaluate(function () { S.tour = true; document.getElementById("sskip").click(); go("settings") });
    await pe.click("#uil button:nth-child(2)"); await pe.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    var en = await pe.evaluate(async function () {
      var IT = /(^|[^\p{L}])(il|della|degli|nella|alla|che|con|non|sono|nessun|nessuna|tocca|scegli|eroi|nemici|alleati|partita|squadra|consigli|ancora|già|punti|abilità|oggetti|talenti|giungla|impostazioni|storico|confronto|guida)(?![\p{L}])/iu, bad = [];
      var scan = function (v) { var w = document.createTreeWalker(document.getElementById("v-" + v), NodeFilter.SHOW_TEXT), n; while ((n = w.nextNode())) { var t = n.nodeValue.trim(); if (t && IT.test(t) && !n.parentNode.closest("[data-raw]")) bad.push(v + ": " + t.slice(0, 60)) } };
      var wait = function () { return new Promise(function (r) { setTimeout(r, 30) }) };
      var r = { lang: document.documentElement.lang, ui: S.ui, game: S.lang, nav: [].map.call(document.querySelectorAll("#nav button"), function (b) { return b.textContent }).join(",") };
      setSlot(S.ally, 0, "Tigreal"); ["Estes", "Lancelot", "Layla"].forEach(function (h, i) { setSlot(S.enemy, i, h) }); detOpen = true;
      for (var v of ["home", "draft", "guide", "games", "tier", "heroes", "cmp", "quiz", "profile", "settings", "news"]) { go(v); await wait(); scan(v) }
      openHero("Layla", "bd"); await wait(); scan("hero"); openHero("Layla", "lo"); await wait(); scan("hero");
      r.draft = document.querySelector("#nav button.on") && (go("draft"), await wait(), /Recommended by lane/.test(document.getElementById("v-draft").textContent));
      r.tr = tr("Countera Franco (+2.0% di win rate contro di lui)"); r.bad = bad;
      return r;
    });
    ok(en.lang === "en" && en.ui === "en" && en.game === "en" && en.nav === "Home,Play,Study,Me", "Impostazioni → Lingua dell'app: English (barra: " + en.nav + ")");
    ok(en.draft && en.tr === "Counters Franco (+2.0% win rate vs him)", "schermate e frasi composte in inglese (" + en.tr + ")");
    ok(!en.bad.length, "nessun testo italiano nelle schermate in inglese" + (en.bad.length ? ": " + en.bad.slice(0, 6).join(" | ") : ""));
    await pe.evaluate(function () { go("settings") }); await pe.click("#uil button:nth-child(1)"); await pe.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    ok(await pe.evaluate(function () { go("settings"); return S.ui === "it" && document.documentElement.lang === "it" && /Lingua dell'app/.test(document.getElementById("v-settings").textContent) }), "si torna all'italiano");
    await ctxe.close();

    section("Build contro i nemici");
    var bv = await p.evaluate(function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null];
      var none = situItems("Layla", "o", []).items.length;
      ["Estes", "Kagura", "Eudora", "Layla", "Tigreal"].forEach(function (h, i) { setSlot(S.enemy, i, h) });
      var mm = situItems("Moskov", "o", en()), mg = situItems("Kagura", "m", en()), tk = situItems("Tigreal", "r", en());
      var ids = function (r) { return r.items.map(function (o) { return o.id }) };
      detOpen = true; go("draft"); var m = focusRec(), box = document.querySelector("#detail .bvs"), line = document.querySelector("#rec .spl1");
      openHero(m.n, "bd"); var hb = !!document.querySelector("#hbody .bvs"); detOpen = false;
      var cc = spellFor("Layla", "o", ["Tigreal", "Atlas", "Franco", "Khufra"].filter(function (h) { return H[h] }));
      return { none: none, mm: mm.type + ":" + ids(mm), mg: mg.type + ":" + ids(mg), tk: tk.type + ":" + ids(tk), box: !!box && box.querySelectorAll(".sit li").length, line: line && line.textContent, hb: hb, jg: spellFor(NAMES.filter(function (h) { return H[h].l.charAt(0) === "j" })[0], "j", []).sp, cc: cc.alt && cc.alt.id };
    });
    ok(bv.none === 0, "senza nemici nessun oggetto situazionale");
    ok(/^atk:/.test(bv.mm) && bv.mm.indexOf("3013") > -1 && bv.mm.indexOf("3205") > -1, "tiratore contro Estes e maghi: Sea Halberd e Athena's Shield (" + bv.mm + ")");
    ok(/^mag:/.test(bv.mg) && bv.mg.indexOf("3105") > -1, "mago contro Estes: Glowing Wand (" + bv.mg + ")");
    ok(/^tank:/.test(bv.tk) && bv.tk.indexOf("3206") > -1, "tank contro Estes: Dominance Ice (" + bv.tk + ")");
    ok(bv.box > 0 && bv.hb, "riquadro build nell'analisi dettagliata e nella scheda eroe (" + bv.box + " oggetti)");
    ok(/Spell: .+Emblema: /.test(bv.line || ""), "spell ed emblema nel consigliato: " + bv.line);
    ok(bv.jg === 20020 && bv.cc === 20080, "giungla: Retribution; contro tanti controlli si suggerisce Purify");
    var picked = await p.evaluate(function () { var n = focusRec().n; document.getElementById("pk").click(); return S.ally.indexOf(n) > -1 });
    ok(picked, "il pulsante Scegli mette il consigliato negli alleati");

    section("Ban consigliati");
    var bn = await p.evaluate(function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; go("draft");
      var empty = document.querySelectorAll("#bans .lcand").length, top = banRecs()[0];
      S.ally[0] = "Layla"; S.enemy[0] = "Fanny"; rDraft();
      var withPick = banRecs(), cnt = withPick.slice(0, 10).filter(function (r) { return r.parts.some(function (x) { return /Countera Layla/.test(x.t) }) }).length;
      var first = document.querySelector("#bans .lcand b").textContent; document.querySelector("#bans .lcand").click();
      var banned = S.banA[0] === first, again = banRecs().some(function (r) { return r.n === first });
      S.banA = NAMES.filter(function (h) { return used().indexOf(h) < 0 }).slice(0, 5); rDraft();
      return { empty: empty, top: top && top.n, cnt: cnt, banned: banned, again: again, full: document.querySelectorAll("#bans .lcand").length, hint: /Perché bannare/.test(document.querySelector("#bans").textContent) };
    });
    ok(bn.empty === 3, "draft vuoto: 3 ban consigliati (primo: " + bn.top + ")");
    ok(bn.cnt > 0, "con Layla in squadra, tra i primi 10 ban ci sono suoi counter (" + bn.cnt + ")");
    ok(bn.banned && !bn.again, "toccando un consiglio l'eroe finisce nei ban alleati e sparisce dai consigli");
    ok(bn.full === 0 && !bn.hint, "con i 5 ban alleati pieni i consigli spariscono");

    section("Draft guidato");
    for (var mode of [["blue", 10, "rank"], ["red", 10, "rank"], ["blue", 6, "rank"], ["blue", 10, "tour"], ["red", 10, "tour"], ["blue", 6, "tour"]]) {
      var gr = await p.evaluate(function (mo) {
        S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null];
        S.guide = mo[0]; S.gbans = mo[1]; S.gmode = mo[2]; go("draft");
        var seq = [], lit = 0;
        for (var n = 0; n < 25; n++) {
          var g = guideNow(); if (!g.t) break;
          seq.push(g.t); if (document.querySelectorAll("#v-draft .now").length === 1) lit++;
          var b = document.getElementById("gsug");
          if (b && n % 2 === 0) b.click(); else { document.getElementById("gpick").click(); document.querySelector("#grid button").click() }
        }
        return { seq: seq.join(" "), lit: lit, done: /Draft completato/.test(document.querySelector("#v-draft").textContent), cnt: [S.ally, S.enemy, S.banA, S.banE].map(function (t) { return t.filter(Boolean).length }).join("/"), dup: used().length !== new Set(used()).size };
      }, mode);
      var exp = { "blue10tour": "bA bE bA bE bA bE pA pE pE pA pA pE bE bA bE bA pE pA pA pE", "red10tour": "bE bA bE bA bE bA pE pA pA pE pE pA bA bE bA bE pA pE pE pA", "blue6tour": "bA bE bA bE bA bE pA pE pE pA pA pE pE pA pA pE",
        "blue10rank": "bA bE bA bE bA bE bA bE bA bE pA pE pE pA pA pE pE pA pA pE", "red10rank": "bE bA bE bA bE bA bE bA bE bA pE pA pA pE pE pA pA pE pE pA", "blue6rank": "bA bE bA bE bA bE pA pE pE pA pA pE pE pA pA pE" }[mode.join("")];
      var nSteps = exp.split(" ").length;
      ok(gr.seq === exp, (mode[2] === "rank" ? "ranked" : "torneo") + ", " + (mode[0] === "blue" ? "primi noi" : "primi loro") + ", " + mode[1] + " ban: ordine dei turni corretto");
      ok(gr.lit === nSteps && gr.done && !gr.dup, "  a ogni turno uno slot evidenziato, alla fine Draft completato (" + gr.cnt + "), nessun eroe doppio");
    }
    var gm = await p.evaluate(function () {
      S.guide = "blue"; S.gbans = 10; S.gmode = "tour"; S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; go("draft"); document.getElementById("dbs").click(); var gmo = document.querySelectorAll("#osg .seg")[1];
      var r = { btn: [].map.call(gmo.querySelectorAll("button"), function (b) { return b.textContent + (b.className === "on" ? "*" : "") }).join(",") };
      gmo.querySelector("button").click(); document.getElementById("oshx").click(); r.after = S.gmode + "|" + guideSteps().slice(0, 10).every(function (t) { return t.charAt(0) === "b" }); return r;
    });
    ok(gm.btn === "Ranked,Torneo*" && gm.after === "rank|true", "selettore Modalità: Ranked mette tutti i 10 ban prima dei pick (" + gm.btn + ")");
    await p.evaluate(function () { S.guide = null; save(); go("draft") });
    ok(await p.evaluate(function () { return !document.querySelector(".guide") && !document.querySelector("#v-draft .now") }), "modalità spenta: niente turni né evidenziazioni");

    section("Storico partite");
    var hs = await p.evaluate(function () {
      S.games = []; var five = NAMES.slice(0, 5), foes = NAMES.slice(5, 10);
      S.ally = [null, null, null, null, null]; S.enemy = foes.slice(); S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; go("draft");
      var before = !!document.getElementById("gwin");
      S.ally = five.slice(); rDraft();
      var shown = !!document.getElementById("gwin");
      [].filter.call(document.querySelectorAll("#gme .chip"), function (b) { return b.textContent === five[2] })[0].click();
      document.getElementById("gwin").click();
      var after = { games: S.games.length, me: S.games[0].me, r: S.games[0].r, empty: used().length === 0, msg: /Partita salvata: vittoria con/.test(document.querySelector("#v-draft").textContent) };
      S.ally = five.slice(); S.enemy = foes.slice(); rDraft(); document.getElementById("glose").click();
      S.ally = five.slice(); S.enemy = foes.slice(); rDraft(); document.getElementById("gwin").click();
      go("games"); var t = document.querySelector("#v-games").textContent;
      return { before: before, shown: shown, after: after, n: S.games.length, prof: /Partite segnate3/.test(t) && /Vittorie2 \(67%\)/.test(t), mine: /I tuoi eroi/.test(t), team: /Con questi in squadra vinci di più/.test(t), dots: document.querySelectorAll(".gdots i").length };
    });
    ok(!hs.before && hs.shown, "Vittoria/Sconfitta compaiono solo con 5 alleati");
    ok(hs.after.games === 1 && hs.after.r === 1 && hs.after.me && hs.after.empty && hs.after.msg, "Vittoria salva la partita col tuo eroe e svuota il draft");
    ok(hs.n === 3 && hs.prof && hs.mine && hs.team && hs.dots === 3, "nel Profilo: 3 partite, 67% vittorie, i tuoi eroi, compagni migliori, ultime partite");
    var cleared = await p.evaluate(function () {
      var n = S.games.length; document.getElementById("ghx").click(); var d = document.getElementById("dlg"), r = { shown: !!d && /Cancellare lo storico/.test(d.textContent) && d.closest(".app") !== null };
      document.getElementById("dlgno").click(); r.kept = S.games.length === n && !document.getElementById("dlg");
      document.getElementById("ghx").click(); document.getElementById("dlgok").click(); r.n = S.games.length; return r;
    });
    ok(cleared.shown && cleared.kept, "Cancella storico apre la finestra di conferma dell'app; Annulla non cancella nulla");
    ok(cleared.n === 0 && !p.lastDialog, "confermando si svuotano le partite (nessun avviso del browser)");

    var gl = await p.evaluate(function () {
      S.games = [{ d: 1, r: 1, a: ["Layla"], e: ["Saber"] }, { d: 2, r: 0, a: ["Tigreal"], e: ["Ling"] }]; save(); go("games");
      var r = { rows: document.querySelectorAll(".glist .gi").length, first: document.querySelector(".glist .gi .pill").textContent };
      document.querySelector('[data-flip="1"]').click(); r.flip = S.games[1].r === 1;
      document.querySelector('[data-del="0"]').click(); document.getElementById("dlgok").click(); r.del = S.games.length === 1 && S.games[0].a[0] === "Tigreal";
      S.games = []; save(); return r;
    });
    ok(gl.rows === 2 && gl.first === "S" && gl.flip && gl.del, "storico: elenco delle partite (più recente in alto), correggi il risultato o elimina una partita");

    section("Confronto 1 contro 1");
    var cm = await p.evaluate(async function () {
      var wait = function () { return new Promise(function (r) { setTimeout(r, 120) }) };
      openHero("Layla"); document.getElementById("cmpb").click(); await wait();
      [].filter.call(document.querySelectorAll("#grid button"), function (b) { return b.textContent === "Diggie" })[0].click(); await wait();
      var t = document.querySelector("#v-cmp").textContent, r = { cur: cur, a: cmpA, b: cmpB, rows: document.querySelectorAll(".cmpt .cr").length, duel: /Diggie è favorito: Layla ha -2\.4%/.test(t), nav: document.querySelector('#nav button.on').dataset.g };
      document.getElementById("csw").click(); r.sw = cmpA === "Diggie" && cmpB === "Layla" && /Diggie è favorito: Diggie ha \+2\.4%/.test(document.querySelector("#v-cmp").textContent);
      r.h2h = [h2h("Diggie", "Layla"), h2h("Layla", "Diggie")];
      hsub = "her"; go("heroes"); document.getElementById("cmpo").click(); await wait(); document.querySelectorAll("#grid button")[0].click(); await wait(); document.querySelectorAll("#grid button")[0].click(); await wait();
      r.db = cur === "cmp" && cmpA && cmpB && cmpA !== cmpB;
      return r;
    });
    ok(cm.cur === "cmp" && cm.a === "Layla" && cm.b === "Diggie" && cm.rows >= 8, "dalla scheda di Layla: confronto con Diggie (" + cm.rows + " righe)");
    ok(cm.duel && cm.sw, "scontro diretto dai dati ufficiali, anche dopo lo scambio (Diggie +2.4% contro Layla)");
    ok(cm.h2h[0] === 2.44 && cm.h2h[1] === -2.44, "il calcolo dello scontro è simmetrico");
    ok(cm.nav === "play", "il Confronto ora sta in Gioca");
    ok(cm.db, "dal Database: scegli due eroi e si apre il confronto");

    section("Lane 1v1");
    var ln = await p.evaluate(function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; S.allyLane = [null, null, null, null, null];
      go("draft"); var r = { none: !document.querySelector("#v-draft .l1") };
      ["Tigreal", "Ling", "Kagura", "Layla", "Masha"].forEach(function (h, i) { setSlot(S.ally, i, h) }); ["Estes", "Saber", "Eudora", "Moskov", "Chou"].forEach(function (h, i) { setSlot(S.enemy, i, h) });
      go("draft"); var el = enemyLanes(); r.el = LANES.map(function (l) { return el[l] }).join(",");
      r.rows = document.querySelectorAll("#v-draft .l1 .lr:not([disabled])").length;
      var jg = lanePair("j"); r.jg = jg.a + ">" + jg.e + ":" + jg.d + ":" + jg.est; var ex = lanePair("e"); r.est = ex.est && /\*/.test(document.querySelector('#v-draft .lr[data-l="e"]').textContent);
      document.querySelector('#v-draft .lr[data-l="j"]').click(); var sh = document.getElementById("lane1"), t = sh && sh.textContent;
      r.sheet = !!sh && /Ling è avvantaggiato/.test(t) && /dati ufficiali/.test(t) && sh.querySelectorAll(".sb").length === 3 && /Oggetto utile/.test(t);
      document.getElementById("l1x").click(); r.closed = !document.getElementById("lane1") && cur === "draft";
      document.querySelector('#v-draft .lr[data-l="r"]').click(); document.getElementById("l1c").click(); r.cmp = cur === "cmp" && cmpA === "Tigreal" && cmpB === "Estes";
      go("guide"); r.guide = document.querySelectorAll("#v-guide .l1 .lr").length === 5;
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; save();
      return r;
    });
    ok(ln.none, "senza alleati e nemici il riquadro Lane 1v1 non compare");
    ok(ln.el === "Moskov,Chou,Eudora,Saber,Estes" && ln.rows === 5, "nemici messi nella loro lane (" + ln.el + "), 5 scontri");
    ok(ln.jg === "Ling>Saber:4.22:false" && ln.est, "dato ufficiale quando c'è (Ling contro Saber +4.2%), altrimenti stima segnata con *");
    ok(ln.sheet && ln.closed, "toccando una lane si apre la scheda (chi è avvantaggiato, perché, statistiche, oggetto) e si chiude restando nel draft");
    ok(ln.cmp && ln.guide, "dalla scheda si apre il Confronto completo; lo stesso riquadro è nella Guida");

    section("Lane dei nemici e selettore");
    var en2 = await p.evaluate(async function () {
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null];
      ["Tigreal", "Ling", "Kagura", "Layla", "Masha"].forEach(function (h, i) { setSlot(S.ally, i, h) }); ["Estes", "Saber", "Eudora", "Moskov", "Chou"].forEach(function (h, i) { setSlot(S.enemy, i, h) });
      go("draft"); var r = {}, btn = function (i) { return document.querySelectorAll("#enemy .srow")[i].querySelector(".lnb") };
      r.auto = btn(4).textContent + "|" + laneOfEnemy("Chou");
      for (var k = 0; k < 10 && laneOfEnemy("Chou") !== "r"; k++) btn(4).click();
      r.man = S.enemyLane[4] + "|" + btn(4).classList.contains("man") + "|" + laneOfEnemy("Chou") + "|" + laneOfEnemy("Estes") + "|" + lanePair("r").e;
      var code = draftCode(); r.code = /_m----r$/.test(code); var o = readCode(code); r.read = o.enemyLane.join(",") === ",,,,r";
      setSlot(S.enemy, 4, "Atlas"); r.cleared = S.enemyLane[4] === null;
      /* selettore: la ricerca resta ferma e il risultato filtrato è subito sotto */
      openPick("Scegli l’eroe nemico", free(), function () { }, { quick: 1 }); await new Promise(function (r) { setTimeout(r, 30) });
      var q = document.getElementById("q"), y0 = q.getBoundingClientRect().top; q.value = "aulu"; q.oninput();
      var y1 = q.getBoundingClientRect().top, first = document.querySelector("#grid button"), fb = first.getBoundingClientRect();
      r.pick = Math.abs(y1 - y0) < 2 && first.textContent === "Aulus" ? "ok" : y0 + "→" + y1 + " " + first.textContent; r.near = fb.top - y1 < 120;
      document.getElementById("sheet").classList.remove("show");
      S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.enemyLane = [null, null, null, null, null]; save();
      return r;
    });
    ok(/^[A-Z]{3,4}\|[oemjr]$/.test(en2.auto), "anche i nemici hanno il pulsante della lane, automatica all'inizio (" + en2.auto + ")");
    ok(en2.man === "r|true|r|null|Chou" || /^r\|true\|r\|[oemj]?\|Chou$/.test(en2.man), "lane nemica scelta a mano: vale per la Lane 1v1 e sposta gli altri (" + en2.man + ")");
    ok(en2.code && en2.read && en2.cleared, "la lane dei nemici viaggia nel link condiviso e si azzera cambiando eroe");
    ok(en2.pick === "ok" && en2.near, "selettore: cercando, la barra di ricerca resta ferma e l'eroe filtrato è subito sotto (" + en2.pick + ")");

    ok(await p.evaluate(function () { go("draft"); document.getElementById("dbs").click(); var o = !!document.getElementById("osh"); document.querySelector("#osg .seg button:nth-child(2)").click(); var r = o && S.guide === "blue" && /Primi noi/.test(document.querySelector(".dsum b").textContent); document.getElementById("oshx").click(); var c = !document.getElementById("osh"); S.guide = null; save(); go("draft"); return r && c }), "«Cambia» apre il menu, la scelta si applica e il menu si chiude");
    ok(await p.evaluate(function () { go("draft"); return !!document.getElementById("rp") }), "Azzera pick sopra le squadre");

    section("Inserimento rapido");
    await p.evaluate(function () { window.qClean = function () { S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; S.guide = null; S.only = false; S.qt = "pE"; S.gskip = []; QE.hist = []; QE.q = ""; QE.focus = false; save(); go("draft") }; qClean() });
    await p.click("#qin"); await p.keyboard.type("lng"); await p.keyboard.press("Enter");
    await p.keyboard.type("a lay"); await p.keyboard.press("Enter");
    await p.keyboard.type("bn sab"); await p.keyboard.press("Enter");
    var q1 = await p.evaluate(function () { return { e: S.enemy[0], a: S.ally[0], b: S.banE[0], foc: document.activeElement && document.activeElement.id } });
    ok(q1.e === "Ling" && q1.foc === "qin", "scrivi e Invio: «lng» mette Ling nei nemici e la casella resta pronta per il prossimo");
    ok(q1.a === "Layla" && q1.b === "Saber", "prefissi: «a lay» pick alleato, «bn sab» ban nemico");
    await p.keyboard.press("Backspace");
    ok(await p.evaluate(function () { return S.banE[0] === null && S.ally[0] === "Layla" }), "Backspace a casella vuota annulla l'ultimo inserito");
    await p.evaluate(function () { document.querySelector("#qlike .lcand").click() });
    ok(await p.evaluate(function () { return S.enemy.filter(Boolean).length === 2 && document.querySelectorAll("#qlike .lcand").length === 4 }), "eroi probabili a un tocco (4 proposte)");
    /* draft guidato ranked: la destinazione segue il turno, Tab salta un turno */
    await p.evaluate(function () { qClean(); S.guide = "blue"; S.gmode = "rank"; S.gbans = 10; save(); go("draft") });
    await p.click("#qin"); await p.keyboard.type("mas"); await p.keyboard.press("Enter");
    var g1 = await p.evaluate(function () { return S.banA[0] + "|" + document.getElementById("qto").textContent });
    await p.keyboard.press("Tab");
    var g2 = await p.evaluate(function () { return guideNow().k + "|" + document.getElementById("qto").textContent });
    ok(g1 === "Masha|Ban nemico" && g2 === "2|Ban alleato", "draft guidato: va nel turno giusto (" + g1 + "), Tab salta il turno (" + g2 + ")");
    /* solo pick nemici: niente ban, il turno è sempre un pick nemico */
    await p.evaluate(function () { qClean(); S.guide = "blue"; save(); go("draft"); document.getElementById("qonly").click() });
    var on = await p.evaluate(function () { return { t: qTarget(), g: guideNow().t, bans: !document.querySelector("#bans .bslot"), to: document.getElementById("qto").textContent } });
    ok(on.t === "pE" && on.g === "pE" && on.bans && on.to === "Pick nemico", "«Solo pick nemici»: ban nascosti e si inseriscono solo i pick nemici");
    await p.evaluate(function () { qClean() });

    section("Annulla, eroi nuovi, statistiche per eroe");
    var un = await p.evaluate(function () {
      qClean(); setSlot(S.enemy, 0, "Ling"); rDraft(); S.banA[0] = "Masha"; rDraft(); setSlot(S.ally, 0, "Layla"); rDraft();
      var r = { btn: !!document.getElementById("undo") };
      document.getElementById("undo").click(); r.u1 = S.ally[0] === null && S.banA[0] === "Masha";
      document.getElementById("undo").click(); r.u2 = S.banA[0] === null && S.enemy[0] === "Ling";
      document.getElementById("undo").click(); r.u3 = S.enemy[0] === null;
      qClean(); return r;
    });
    ok(un.btn && un.u1 && un.u2 && un.u3, "pulsante Annulla: toglie una alla volta le ultime modifiche (pick, ban)");
    var nh = await p.evaluate(function () {
      var errs0 = 0, n = addNewHero(99999, { n: "Zyrothan", img: "" }); calcMeta(); HX[n].rk = { all: [53.2, 1.5, 4.1] }; calcMeta();
      var r = { n: n, list: NAMES.indexOf("Zyrothan") > -1 && free().indexOf("Zyrothan") > -1, find: qFind("zyro")[0], tier: M.Zyrothan.tier };
      try { openHero("Zyrothan"); r.sheet = /Eroe nuovo/.test(document.getElementById("v-hero").textContent); go("tier"); go("draft"); setSlot(S.enemy, 0, "Zyrothan"); rDraft(); r.draft = S.enemy[0] === "Zyrothan" } catch (e) { r.err = e.message }
      r.again = addNewHero(99999, { n: "Zyrothan" }) === "Zyrothan" && NAMES.filter(function (h) { return h === "Zyrothan" }).length === 1;
      /* via l'eroe di prova: la sfida del giorno dipende dall'elenco degli eroi */
      delete H.Zyrothan; delete HX.Zyrothan; delete ID2[99999]; delete M.Zyrothan; NAMES.splice(NAMES.indexOf("Zyrothan"), 1); calcMeta();
      qClean(); return r;
    });
    ok(nh.list && nh.find === "Zyrothan" && nh.tier && nh.sheet && nh.draft && nh.again && !nh.err, "eroe nuovo dai dati online: compare in elenco, ricerca, tier list, draft e scheda con avviso" + (nh.err ? ": " + nh.err : ""));
    var ms = await p.evaluate(function () {
      S.games = [{ d: 1, r: 0, me: "Ling", a: ["Ling", "Tigreal"], e: ["Saber", "Atlas"] }, { d: 2, r: 0, me: "Ling", a: ["Ling"], e: ["Saber"] }, { d: 3, r: 1, me: "Ling", a: ["Ling", "Tigreal"], e: ["Eudora"] }, { d: 4, r: 1, me: "Layla", a: ["Layla"], e: ["Saber"] }];
      go("games"); var L = myHeroStats(), ling = L[0];
      var r = { first: ling.n + ":" + ling.g + ":" + ling.w, bad: ling.bad[0].n + ":" + (ling.bad[0].g - ling.bad[0].w), good: ling.good[0] && ling.good[0].n, rows: document.querySelectorAll(".myst .mys").length };
      S.games = []; save(); return r;
    });
    ok(ms.first === "Ling:3:33" && ms.bad === "Saber:2" && ms.good === "Tigreal" && ms.rows === 2, "statistiche per eroe: win rate, contro chi perdi (Saber 2 sconfitte) e con chi vinci");

    section("Scontri di lane");
    var lc = await p.evaluate(function () {
      qClean(); S.lc = {}; setSlot(S.enemy, 0, "Cecilion"); compute();
      var mid = function () { compute(); return (byLaneList.m || []).map(function (r) { return r.n }) };
      var r = { rule: laneRule("Lunox", "Cecilion").v > 0, est: laneVs("Lunox", "Cecilion").src, before: mid().indexOf("Lunox") };
      openHero("Cecilion", "mu"); r.team = /Counter di squadra/.test(document.getElementById("hbody").textContent);
      var inl = [].map.call(document.querySelectorAll(".mlane .neg .hc"), function (x) { return x.dataset.h }); r.sameLane = inl.length > 0 && inl.every(function (n) { return H[n] && shareLane(n, "Cecilion") });
      document.querySelector("#mylc .pch.add").click(); [].filter.call(document.querySelectorAll("#grid button"), function (b) { return b.textContent === "Lunox" })[0].click();
      r.saved = JSON.stringify(S.lc.Cecilion) === '["Lunox"]' && laneVs("Lunox", "Cecilion").src === "tu";
      r.after = mid().indexOf("Lunox");
      setSlot(S.ally, 0, "Lunox"); S.allyLane[0] = "m"; S.enemyLane[0] = "m"; go("draft"); var p1 = lanePair("m"); r.pair = p1.a + ">" + p1.e + ":" + p1.d + ":" + p1.mine;
      document.querySelector("#mylc") || go("hero"); S.lc = {}; qClean(); return r;
    });
    ok(lc.rule && lc.est === "stima", "regola di lane: chi si cura regge il poke di un eroe fermo (Lunox contro Cecilion)");
    ok(lc.team && lc.sameLane, "scheda eroe: «In lane» mostra solo eroi della stessa lane, i counter ufficiali diventano «di squadra»");
    ok(lc.saved && lc.after > -1 && lc.after < 3 && (lc.before < 0 || lc.after < lc.before), "counter di lane segnato da te: Lunox sale tra i primi consigli in mid (" + lc.before + " → " + lc.after + ")");
    ok(lc.pair === "Lunox>Cecilion:5:true", "Lane 1v1 usa il counter segnato da te (" + lc.pair + ")");

    section("Criterio dei consigli");
    var cr = await p.evaluate(function () {
      qClean(); S.gc = {}; S.lc = {}; S.myLane = false; ["Gloo", "Moskov"].forEach(function (h, i) { setSlot(S.enemy, i, h) }); S.enemyLane[0] = "e"; S.enemyLane[1] = "o";
      var top = function (l) { compute(); return (byLaneList[l] || []).map(function (x) { return x.n }) }, r = {};
      S.crit = "bal"; r.balR = top("r").indexOf("Faramis");
      S.gc.Gloo = ["Faramis"]; S.crit = "game"; r.gameR = top("r").indexOf("Faramis"); r.gameM = top("m").indexOf("Faramis");
      S.crit = "meta"; var m = top("o"); r.meta = m.length > 1 && M[m[0]].meta >= M[m[1]].meta;
      S.crit = "lane"; var g = top("o"); r.lane = g[0] + ":" + laneVs(g[0], "Moskov").v; r.laneOk = g.slice(1).every(function (x) { return laneVs(x, "Moskov").v <= laneVs(g[0], "Moskov").v + .01 });
      S.myLane = true; S.lane = "o"; go("draft"); r.rows = [].map.call(document.querySelectorAll("#lanes .lrow .lh b"), function (b) { return b.textContent }).join(","); r.six = document.querySelectorAll("#lanes .lrow .lcand").length;
      document.getElementById("dbs").click(); r.btns = document.querySelectorAll("#osc .opt1").length; document.getElementById("oshx").click();
      S.myLane = false; S.crit = "bal"; S.gc = {}; qClean(); return r;
    });
    ok(cr.gameR === 0 || cr.gameM === 0, "«Counter in partita» con Faramis segnato contro Gloo: Faramis primo in roam o mid (bal: " + cr.balR + ", game: roam " + cr.gameR + " / mid " + cr.gameM + ")");
    ok(cr.meta && cr.laneOk, "«Meta» ordina per forza nel meta, «Vinci la lane» per lo scontro con il nemico della lane (" + cr.lane + ")");
    ok(cr.rows === "GOLD" && cr.six === 6 && cr.btns === 5, "«Solo la mia lane»: solo la riga GOLD con 6 proposte; 5 criteri nel selettore");

    section("Quiz: sfida del giorno");
    var qa = await p.evaluate(function () { S.daily = null; QZ = null; go("quiz"); document.getElementById("dgo").click(); return JSON.stringify(QZ.r.map(function (q) { return [q.q, q.o, q.a] })) });
    var ctx4 = await browser.newContext({ locale: "en-US" }), errs4 = [], p4 = await newPage(ctx4, errs4);
    await ctx4.route(function (u) { return !u.href.startsWith(URL0) }, function (r) { return r.abort() });
    await p4.goto(URL0); await p4.waitForFunction(function () { return window.NAMES });
    var qb = await p4.evaluate(function () { newRound(true); return JSON.stringify(QZ.r.map(function (q) { return [q.q, q.o, q.a] })) });
    ok(qa === qb && JSON.parse(qa).length === 5, "stesse 5 domande e risposte su un altro dispositivo (anche in inglese)");
    ok(errs4.length === 0, "nessun errore JavaScript sul secondo dispositivo"); await ctx4.close();
    var dq = await p.evaluate(function () {
      for (var i = 0; i < 5; i++) { document.querySelectorAll("#opts .opt")[i % 2 ? 0 : QZ.r[QZ.i].a].click(); document.getElementById("qgo").click(); document.getElementById("qgo").click() }
      var t = document.querySelector("#v-quiz").textContent, d = S.daily;
      return { d: d && d.d === today() && d.res.length === 5, txt: d && dailyText(), noReplay: !document.getElementById("dgo"), share: !!document.getElementById("dsh"), streak: S.dstreak, wrQ: JSON.stringify(QZ.r).indexOf("win rate più alto") < 0 };
    });
    ok(dq.d && dq.noReplay && dq.share, "a fine sfida il risultato resta salvato e non si può rigiocare oggi");
    ok(/^MLBB TOP · Sfida del giorno \d\d\/\d\d\/\d{4}: \d\/5 [🟩🟥]{5}$/u.test(dq.txt || ""), "testo da condividere: " + dq.txt);
    ok(dq.streak === 1 && dq.wrQ, "giorni di fila = 1, nessuna domanda sul win rate nella sfida");
    var rnd2 = await p.evaluate(function () { newRound(); var a = JSON.stringify(QZ.r.map(function (q) { return q.q })); newRound(); return a !== JSON.stringify(QZ.r.map(function (q) { return q.q })) });
    ok(rnd2, "i round normali restano casuali");

    section("Testi in italiano");
    var tx = await p.evaluate(function () {
      openHero("Layla", "ab"); var ab = document.querySelector("#hbody").textContent;
      openHero("Layla", "mu"); var mu = document.querySelector("#hbody").textContent;
      openHero("Layla", "bd"); var bd = document.querySelector("#hbody").textContent;
      hsub = "itm"; go("heroes"); var itm = document.querySelector("#hlist").textContent;
      return { on: ITON, ab: /danni fisici/.test(ab) && !/Physical Damage/.test(ab), mu: /tank lenti/.test(mu), bd: /Attacco adattivo|Penetrazione adattiva|Velocità di movimento/.test(bd), itm: /Velocità di movimento|Potere magico/.test(itm) && !/Movement Speed/.test(itm), hint: /tradott/.test(itm) };
    });
    ok(tx.on && tx.ab, "abilità in italiano (scheda di Layla)");
    ok(tx.mu && tx.bd, "matchup ed emblemi della build in italiano");
    ok(tx.itm && tx.hint, "oggetti del database in italiano, con la nota sulla traduzione");
    await p.evaluate(function () { go("settings") });
    await p.click("#lang button:nth-child(2)"); await p.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    var en = await p.evaluate(function () { openHero("Layla", "ab"); return { on: ITON, ab: /Physical Damage/.test(document.querySelector("#hbody").textContent) } });
    ok(!en.on && en.ab, "Profilo → Testi di gioco: Originale riporta i testi in inglese");
    await p.evaluate(function () { S.lang = "it"; save() }); await p.reload(); await p.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    ok(await p.evaluate(function () { return ITON }), "e si torna all'italiano");

    section("Condividi draft");
    var shared = await p.evaluate(function () {
      S.banA = [NAMES[20], null, null, null, null]; S.banE = [null, NAMES[21], null, null, null]; S.allyLane[0] = "j"; save(); go("draft");
      return { url: shareUrl(), st: JSON.stringify([S.ally, S.enemy, S.banA, S.banE, S.allyLane.map(function (l, i) { return S.ally[i] ? l : null })]) };
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
    ok(got.st === shared.st, "chi apre il link vede lo stesso draft (pick, ban e lane)" + (got.st === shared.st ? "" : ": " + shared.st + " ≠ " + got.st));
    ok(got.hash === "", "il codice viene tolto dalla barra degli indirizzi dopo l'apertura");
    var sh2 = await p2.evaluate(async function (url) {
      var st = JSON.stringify(S.ally); S.ally[0] = null; S.ally[1] = null; save(); var mine = JSON.stringify(S.ally);
      location.hash = url.split("#")[1]; await new Promise(function (r) { setTimeout(r, 300) });
      var r = { asked: !!document.getElementById("dlg") && /draft condiviso/.test(document.getElementById("dlg").textContent), kept: JSON.stringify(S.ally) === mine };
      document.getElementById("dlgok").click(); r.opened = JSON.stringify(S.ally) === st && cur === "draft"; return r;
    }, shared.url);
    ok(sh2.asked && sh2.kept && sh2.opened, "link con un draft già in corso: chiede prima con la finestra dell'app, poi apre il draft condiviso");
    await p2.evaluate(function () { location.hash = "d=zzz" }); await p2.waitForTimeout(300);
    ok(await p2.evaluate(function () { return /non valido/.test(document.getElementById("toasts").textContent) }), "link rovinato: avviso dentro l'app, draft invariato");
    var still = await p2.evaluate(function () { return JSON.stringify([S.ally, S.enemy, S.banA, S.banE, S.allyLane]) });
    ok(still === shared.st, "il draft resta quello di prima dopo un link rovinato");
    ok(errs2.length === 0, "nessun errore JavaScript aprendo il link" + (errs2.length ? ": " + errs2.join(" | ") : ""));
    await ctx2.close();

    section("Screenshot, backup, OCR offline, manifest");
    var PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    await p.evaluate(function (png) { localStorage.setItem("draftsync_shot", png) }, PNG);
    await p.reload(); await p.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") }); await p.waitForTimeout(300);
    var mig = await p.evaluate(async function () { return { ls: localStorage.getItem("draftsync_shot") || localStorage.getItem(KEY.shot), idb: await shotGet(), mem: SHOT.length } });
    ok(!mig.ls && mig.idb && mig.mem > 0, "lo screenshot salvato in localStorage passa in IndexedDB al primo avvio");
    await p.reload(); await p.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") }); await p.waitForTimeout(300);
    ok(await p.evaluate(function () { go("profile"); return !!document.getElementById("mshot") }), "dopo il riavvio lo screenshot compare nel Profilo");
    await ctx.setOffline(true);
    var ocr = await p.evaluate(function () { delete window.Tesseract; document.getElementById("mocr").click(); return document.getElementById("mst").textContent });
    await ctx.setOffline(false);
    ok(/Sei offline/.test(ocr), "OCR senza rete: messaggio chiaro invece di bloccarsi");
    await p.evaluate(function () { S.games = [{ d: 1, r: 1, a: NAMES.slice(0, 5), e: NAMES.slice(5, 10), me: NAMES[0] }]; S.nick = "Backup1"; save(); go("settings") });
    var dl = await Promise.all([p.waitForEvent("download"), p.click("#bkx")]);
    var bpath = await dl[0].path(), bk = JSON.parse(fs.readFileSync(bpath, "utf8"));
    ok(bk.app === "mlbb-top" && bk.S.nick === "Backup1" && bk.S.games.length === 1 && bk.shot === PNG, "Esporta: file con profilo, storico partite e screenshot (" + dl[0].suggestedFilename() + ")");
    await p.evaluate(async function () { S.nick = "Altro"; S.games = []; save(); await shotSet(null); SHOT = ""; go("settings") });
    await p.setInputFiles("#bkf", bpath); await p.waitForSelector("#dlgok"); await p.click("#dlgok"); await p.waitForTimeout(800); await p.waitForFunction(function () { return window.NAMES && document.querySelector(".scr.on") });
    var rs = await p.evaluate(async function () { return { nick: S.nick, games: S.games.length, shot: (await shotGet()) || "" } });
    ok(rs.nick === "Backup1" && rs.games === 1 && rs.shot === PNG, "Importa: dopo la conferma tornano profilo, storico e screenshot");
    await p.evaluate(function () { go("settings") });
    var bad = path.join(require("os").tmpdir(), "non-backup.json"); fs.writeFileSync(bad, '{"x":1}');
    await p.setInputFiles("#bkf", bad); await p.waitForTimeout(300);
    ok(await p.evaluate(function () { return /non è un backup/.test(document.getElementById("toasts").textContent) && S.nick === "Backup1" }), "un file sbagliato viene rifiutato senza toccare i dati");
    var mf = await p.evaluate(async function () { return (await fetch("manifest.json")).json() });
    var mk = (mf.icons || []).filter(function (i) { return i.purpose === "maskable" })[0];
    ok(mf.lang === "it" && mf.description && mk && (await p.evaluate(async function (u) { return (await fetch(u)).ok }, mk.src)), "manifest con lingua, descrizione e icona maskable");

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
    await p.evaluate(function () { localStorage.removeItem("mlbb-top-live"); go("settings") });
    await p.click("#live"); await p.waitForTimeout(500);
    ok(await p.evaluate(function () { return /non riuscito/.test(document.getElementById("toasts").textContent) && !localStorage.getItem("mlbb-top-live") }), "server in errore: avviso dentro l'app, niente salvato");
    arena.mode = "ok"; p.lastDialog = null;
    await p.evaluate(function () { go("settings") });
    await p.click("#live"); await p.waitForFunction(function () { return !!localStorage.getItem("mlbb-top-live") }, null, { timeout: 5000 }).catch(function () { });
    var lv = await p.evaluate(function () { var x = JSON.parse(localStorage.getItem("mlbb-top-live") || "null"); return x && Object.keys(x.rk).length });
    ok(lv > 100, "server ok: statistiche salvate per " + lv + " eroi");

    section("Tendenze e aggiornamento automatico");
    var prev = await p.evaluate(function () { return JSON.parse(localStorage.getItem("mlbb-top-prev") || "null") });
    ok(prev && prev.date === "20/10/2026" && Object.keys(prev.rk).length > 100, "la classifica precedente (snapshot del " + (prev && prev.date) + ") è salvata per le tendenze");
    var tr = await p.evaluate(function () { tf = "all"; tq = ""; tOpen = { SS: 1, S: 1, A: 1, B: 1 }; go("tier"); var r = document.querySelector(".radar").textContent; return { arrows: document.querySelectorAll("#tlist .dl").length, radar: /Dal 20\/10\/2026: in crescita/.test(r), hero: (openHero(NAMES[0]), document.querySelectorAll("#v-hero .dl").length) } });
    ok(tr.arrows > 20, "frecce di tendenza nella Tier list: " + tr.arrows);
    ok(tr.radar, "il riquadro Radar elenca chi sale e chi scende");
    ok(tr.hero <= 1, "la scheda eroe mostra la variazione del win rate se c'è");
    await p.evaluate(function () { go("settings") }); await p.click("#live"); await p.waitForTimeout(500);
    var prev2 = await p.evaluate(function () { return JSON.parse(localStorage.getItem("mlbb-top-prev") || "null").date });
    ok(prev2 === "20/10/2026", "un secondo aggiornamento nello stesso giorno non cancella il confronto");
    var ctx3 = await browser.newContext(), errs3 = [], p3 = await newPage(ctx3, errs3), calls = { n: 0 };
    await ctx3.route(function (u) { return !u.href.startsWith(URL0) }, function (r) { if (r.request().url().indexOf("arena.rone.dev") > -1) { calls.n++; return r.fulfill({ status: 200, contentType: "application/json", body: arenaBody(arena.ids) }) } return r.abort() });
    await p3.goto(URL0); await p3.waitForTimeout(2500);
    var auto = await p3.evaluate(function () { return { live: META.live, saved: !!localStorage.getItem("mlbb-top-live") } });
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
