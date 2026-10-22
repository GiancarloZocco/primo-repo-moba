/* MLBB TOP - Elementi grafici, navigazione tra le schermate e scelta degli eroi */
/* ---------- ui helpers ---------- */
function ini(h) { return h.replace(/[^A-Za-z]/g, "")[0] }
function tile(h, cls, lab, big) { var c = RC[H[h].r], im = HX[h] && HX[h].img; return '<span class="tile ' + (cls || "") + '" style="background:' + (im ? 'url(' + im + ') center/cover,' : '') + 'linear-gradient(150deg,' + c[0] + ',' + c[1] + ')">' + (im ? '' : ini(h)) + (big ? '<img src="' + esc(big) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + (lab ? '<em>' + lab + '</em>' : '') + '</span>' }
function lanes(h) { return H[h].l.split("").map(function (k) { return LN[k] }).join(" / ") }
function roleLane(h) { return R[H[h].r] + " / " + H[h].l.split("").map(function (k) { return LS[k] }).join(" · ") }
function traits(h) { return H[h].t.split("").map(function (t) { return TR[t] }).join(", ") }
function bar(v, col) { return '<div class="bar"><i style="width:' + v + '%;background:' + col + '"></i></div>' }
function vc(v) { return v >= 70 ? "g" : v >= 45 ? "a" : "r" }
function colv(v) { return v >= 70 ? "var(--green)" : v >= 45 ? "var(--amber)" : "var(--red)" }
var IC = {
  bolt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
  shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
  swap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
  book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h10a4 4 0 014 4v12H8a4 4 0 01-4-4z"/><path d="M8 8h6M8 12h6"/></svg>',
  warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/></svg>',
  bulb: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  pen: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  chart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15v2M11 11v6M15 7v10M19 12v5"/></svg>',
  trend: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></svg>',
  up: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v11H3V10zM7 10l4-8a3 3 0 013 3v4h6a2 2 0 012 2.3l-1.4 7A2 2 0 0118.6 21H7"/></svg>',
  down: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 14V3h4v11zM17 14l-4 8a3 3 0 01-3-3v-4H4a2 2 0 01-2-2.3l1.4-7A2 2 0 015.4 3H17"/></svg>',
  pad: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/></svg>',
  medal: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h10l-3 6h-4zM12 9a6 6 0 110 12 6 6 0 010-12z"/><path d="M12 13l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>',
  lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>',
  sliders: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  monitor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  star: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"/></svg>'
};
var ABI = { m: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>', r: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/></svg>', t: IC.shield, c: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/></svg>', s: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-4.5-8-11a5 5 0 0110-1 5 5 0 0110 1c0 6.5-8 11-8 11z"/></svg>', p: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg>', b: IC.bolt };

/* ---------- navigazione ---------- */
/* schermate: gruppo nella barra in basso (g), nome nella barra del gruppo (t, se manca non compare),
   sottotitolo nell'intestazione (sub) e funzione che la disegna (r, cercata per nome perché sta in un altro file) */
var SCR = {
  home: { g: "home", sub: "Tactical Telemetry", r: "rHome" }, start: { g: "home", sub: "Benvenuto", r: "rStart" },
  news: { g: "home", sub: "Novità", r: "rNews" },
  draft: { g: "play", t: "Draft", sub: "Draft live", r: "rDraft" },
  guide: { g: "play", t: "Guida", sub: "Guida rapida in partita", r: "rGuide" },
  games: { g: "play", t: "Storico", sub: "Storico partite", r: "rGames" },
  tier: { g: "study", t: "Tier list", sub: "Meta tier list", r: "rTier" },
  heroes: { g: "study", t: "Eroi", sub: "Database", r: "rHeroes" },
  hero: { g: "study", r: "rHero" },
  cmp: { g: "study", t: "Confronto", sub: "Confronto 1 contro 1", r: "rCmp" },
  quiz: { g: "study", t: "Quiz", sub: "Prova della conoscenza", r: "rQuiz" },
  profile: { g: "me", t: "Profilo", sub: "Profilo giocatore", r: "rProfile" },
  settings: { g: "me", t: "Impostazioni", sub: "Impostazioni", r: "rSettings" }
};
var NAVG = [
  ["home", "Home", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>'],
  ["play", "Gioca", IC.pad],
  ["study", "Studia", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 5h7a3 3 0 013 3v12a2 2 0 00-2-2H2zM22 5h-7a3 3 0 00-3 3v12a2 2 0 012-2h8z"/></svg>'],
  ["me", "Io", '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.5 18.5c1.2-2 3.2-3 5.5-3s4.3 1 5.5 3"/></svg>']
];
var lastIn = { home: "home", play: "draft", study: "tier", me: "profile" };
/* una sezione per ogni schermata, creata qui così index.html resta corto */
Object.keys(SCR).forEach(function (k) { if (!$("v-" + k)) { var sec = document.createElement("section"); sec.className = "scr"; sec.id = "v-" + k; $("nav").parentNode.insertBefore(sec, $("nav")) } });
NAVG.forEach(function (n) { var b = document.createElement("button"); b.innerHTML = n[2] + "<span>" + n[1] + "</span>"; b.dataset.g = n[0]; b.onclick = function () { go(lastIn[n[0]]) }; $("nav").appendChild(b) });
function rerender() { var f = window[SCR[cur].r]; if (f) f() }
function go(v, noPush) {
  if (!SCR[v]) v = "home";
  if (!noPush && v !== cur) hist.push(cur); cur = v;
  var g = SCR[v].g; if (SCR[v].t || v === "home") lastIn[g] = v;
  Object.keys(SCR).forEach(function (x) { var el = $("v-" + x); if (el) el.classList.toggle("on", x === v) });
  [].forEach.call($("nav").children, function (b) { b.classList.toggle("on", b.dataset.g === g) });
  var tabs = Object.keys(SCR).filter(function (k) { return SCR[k].g === g && SCR[k].t }), sn = $("subnav");
  sn.innerHTML = ""; sn.classList.toggle("show", tabs.length > 1);
  tabs.forEach(function (k) { var b = document.createElement("button"); b.textContent = SCR[k].t; b.className = k === v || (v === "hero" && k === "heroes") ? "on" : ""; b.onclick = function () { go(k) }; sn.appendChild(b) });
  $("sub").textContent = v === "hero" ? "• Scheda eroe: " + hero : SCR[v].sub || "";
  $("back").classList.toggle("hide", !hist.length);
  rerender();
  $("v-" + v).scrollTop = 0
}
$("back").onclick = function () { if (hist.length) go(hist.pop(), true) };
/* con l'avatar scelto il pulsante porta al profilo, altrimenti (icona impostazioni) alle impostazioni */
$("act").onclick = function () { go(S.avatar && H[S.avatar] ? "profile" : "settings") };
function openHero(h, tab) { hero = h; htab = tab || "ab"; go("hero") }

/* ---------- picker ---------- */
function openPick(t, list, cb, o) {
  o = o || {}; pk = { list: list, cb: cb, cur: o.cur, quick: o.quick }; $("pt").textContent = t; $("q").value = "";
  $("rm").classList.toggle("show", !!o.rm); $("rm").onclick = function () { $("sheet").classList.remove("show"); if (o.rm) o.rm() };
  fillPick(); $("sheet").classList.add("show"); $("q").focus()
}
function fillPick() {
  var q = $("q").value.toLowerCase(), g = $("grid"); g.innerHTML = "";
  var btn = function (h) {
    var b = document.createElement("button"); b.innerHTML = tile(h, "sm") + "<span>" + esc(h) + "</span>";
    if (h === pk.cur) { b.className = "cur"; b.setAttribute("aria-current", "true") }
    b.onclick = function () { $("sheet").classList.remove("show"); if (h !== pk.cur) pk.cb(h) }; g.appendChild(b)
  }, head = function (t) { var d = document.createElement("div"); d.className = "ghd"; d.textContent = t; g.appendChild(d) };
  if (!q && pk.quick) {
    var rc = (S.recent || []).filter(function (h) { return pk.list.indexOf(h) > -1 && h !== pk.cur }).slice(0, 6), mine = (S.mp && S.mp.h || []).map(function (z) { return z && z.n }).filter(function (h) { return h && pk.list.indexOf(h) > -1 && rc.indexOf(h) < 0 && h !== pk.cur });
    var pl = S.pool.filter(function (h) { return pk.list.indexOf(h) > -1 && h !== pk.cur });
    rc = rc.filter(function (h) { return pl.indexOf(h) < 0 }); mine = mine.filter(function (h) { return pl.indexOf(h) < 0 });
    if (pl.length) { head("Il tuo pool"); pl.forEach(btn) }
    if (rc.length) { head("Usati di recente"); rc.forEach(btn) }
    if (mine.length) { head("I tuoi eroi"); mine.forEach(btn) }
    if (pl.length || rc.length || mine.length) head("Tutti gli eroi");
  }
  pk.list.filter(function (h) { return h.toLowerCase().indexOf(q) > -1 }).forEach(btn)
}
$("q").oninput = fillPick;
$("sheet").onclick = function (e) { if (e.target === this) this.classList.remove("show") };
function free_() { return free() }
function free() { return NAMES.filter(function (n) { return used().indexOf(n) < 0 }) }
function pushRecent(h) { if (!h) return; S.recent = [h].concat((S.recent || []).filter(function (x) { return x !== h })).slice(0, 12) }
function setSlot(team, i, h) { var was = team[i]; team[i] = h; focus = null; if (team === S.ally) S.allyLane[i] = null; pushRecent(h); if (h && !was) S.picks++; if (team === S.ally && h) { S.synSum += synergy(); S.synN++ } save() }
