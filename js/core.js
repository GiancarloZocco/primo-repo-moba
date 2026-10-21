/* MLBB TOP - Costanti, preparazione dei dati e stato salvato */
/* dati salvati sul dispositivo: nomi delle chiavi e versione dello schema.
   Al primo avvio i dati con i vecchi nomi (draftsync...) vengono spostati qui. */
var KEY = { s: "mlbb-top", live: "mlbb-top-live", prev: "mlbb-top-prev", liveTry: "mlbb-top-live-try", shot: "mlbb-top-shot" };
var SAVE_V = 2;
(function () {
  try {
    [["draftsync", KEY.s], ["draftsync_live", KEY.live], ["draftsync_prev", KEY.prev], ["draftsync_live_try", KEY.liveTry], ["draftsync_shot", KEY.shot]].forEach(function (p) {
      var v = localStorage.getItem(p[0]); if (v == null) return;
      if (localStorage.getItem(p[1]) == null) localStorage.setItem(p[1], v);
      localStorage.removeItem(p[0]);
    });
  } catch (e) { }
})();
/* aggiornamenti dello schema: UPG[n] porta i dati dalla versione n-1 alla n */
var UPG = {
  2: function (s) { /* v2: nuovi nomi delle chiavi (spostati sopra); i campi aggiunti prendono i valori di DEF */ }
};
var META = { "src": "MLBB Academy (dati ufficiali Moonton) via arena.rone.dev · Wiki MLBB Fandom", "date": "20/10/2026", "win": "ultimi 7 giorni" };
var R = { T: "Tank", F: "Combattente", A: "Assassino", M: "Mago", X: "Tiratore", S: "Supporto" };
var RC = { T: ["#2B5BD7", "#60A5FA"], F: ["#B45309", "#F59E0B"], A: ["#9F1239", "#F43F5E"], M: ["#5B21B6", "#A78BFA"], X: ["#15803D", "#4ADE80"], S: ["#0E7490", "#22D3EE"] };
var TR = { m: "Mobile", r: "A distanza", t: "Resistente", c: "Controllo", s: "Sustain", p: "Danni %", b: "Burst" };
var TRD = { m: "Scatti e riposizionamenti rapidi: ingaggia, insegue e si sgancia con facilità.", r: "Colpisce da lontano: punisce chi resta fermo e logora i nemici prima dello scontro.", t: "Difese elevate e grande riserva di vita: assorbe i danni al posto della squadra.", c: "Effetti di controllo (stordimenti, lanci, rallentamenti) per bloccare i bersagli chiave.", s: "Si cura o rigenera durante gli scontri prolungati.", p: "Danni in percentuale alla vita massima: ideale contro i bersagli più resistenti.", b: "Danni esplosivi in pochi istanti per eliminare un bersaglio prima che reagisca." };
var WEAK = { m: "c", r: "m", t: "p", s: "b", b: "t" };
function weakOf(h) { return H[h].t.split("").map(function (t) { return WEAK[t] }).filter(function (a, i, s) { return a && s.indexOf(a) === i }) }
var CAT = { i: "Initiator con CC", g: "Danni magici", p: "Danni fisici", s: "Supporto e sustain" };
var IMP = { c: "Alto engage", b: "Burst", s: "Sustain", m: "Mobilità", p: "Danni %", r: "A distanza", t: "Frontline" };
var LN = { o: "Gold Lane", e: "Exp Lane", m: "Mid Lane", j: "Giungla", r: "Roam" };
var LS = { o: "Gold", e: "Exp", m: "Mid", j: "Jungler", r: "Roamer" };
var H = {}; HD.forEach(function (a) { H[a[0]] = { r: a[1], g: a[2], t: a[3], l: a[4], lore: a[5] } });
var LNM = { "Gold Lane": "o", "EXP Lane": "e", "Exp Lane": "e", "Mid Lane": "m", "Jungle": "j", "Jungling": "j", "Roaming": "r", "Roam": "r" };
Object.keys(H).forEach(function (h) { var x = HX[h]; if (x && x.ln && x.ln.length) { var l = x.ln.map(function (s) { return LNM[s] }).filter(function (c, i, a) { return c && a.indexOf(c) === i }).join(""); if (l) H[h].l = l } });
var LW = {}; Object.keys(H).forEach(function (h) {
  var x = HX[h] || {}, w = {}, t = 0, base = H[h].l.split("");
  Object.keys(x.bd || {}).forEach(function (l) { if (!LN[l]) return; var v = (x.bd[l] || []).reduce(function (a, b) { return a + (+b.pr || 0) }, 0); if (v > 0) { w[l] = v; t += v } });
  if (t > 0) { Object.keys(w).forEach(function (l) { w[l] = w[l] / t }); base.forEach(function (l) { if (w[l] == null) w[l] = 0 }) } else { base.forEach(function (l, i) { w[l] = i ? .3 : 1 }); var t2 = 0; Object.keys(w).forEach(function (l) { t2 += w[l] }); Object.keys(w).forEach(function (l) { w[l] /= t2 }) }
  var ord = Object.keys(w).filter(function (l) { return w[l] >= .05 || base.indexOf(l) > -1 }).sort(function (a, b) { return w[b] - w[a] });
  if (ord.length) H[h].l = ord.join(""); LW[h] = w
});
function fit(h, l) { return (LW[h] || {})[l] || 0 }
var ID2 = {}; Object.keys(HX).forEach(function (h) { ID2[HX[h].id] = h });
function applyLive(LV) { Object.keys(LV.rk).forEach(function (h) { if (HX[h]) HX[h].rk = LV.rk[h] }); META.date = LV.date; META.live = 1 }
try { var LV0 = JSON.parse(localStorage.getItem(KEY.live) || "null"); if (LV0 && LV0.rk) applyLive(LV0) } catch (e) { }
var NAMES = Object.keys(H).sort(function (a, b) { return a.localeCompare(b) });
var $ = function (i) { return document.getElementById(i) };
/* avviso dentro l'app al posto di alert(): kind "err" (rosso) o "ok" (verde) */
function toast(msg, kind) {
  var box = $("toasts"), t = document.createElement("div"); if (!box) return;
  t.className = "toast" + (kind ? " " + kind : ""); t.setAttribute("role", kind === "err" ? "alert" : "status"); t.textContent = msg; box.appendChild(t);
  setTimeout(function () { t.classList.add("out") }, 4200); setTimeout(function () { t.remove() }, 4700)
}
/* screenshot del profilo in IndexedDB: localStorage ha pochi MB e se si riempie fallirebbero anche i salvataggi del draft */
function idbDo(mode, fn) {
  return new Promise(function (ok, no) {
    if (!window.indexedDB) return no(new Error("IndexedDB non disponibile"));
    var r = indexedDB.open("mlbb-top", 1);
    r.onupgradeneeded = function () { r.result.createObjectStore("kv") };
    r.onerror = function () { no(r.error) };
    r.onsuccess = function () { var db = r.result, t = db.transaction("kv", mode), q = fn(t.objectStore("kv")); t.oncomplete = function () { db.close(); ok(q && q.result) }; t.onerror = t.onabort = function () { db.close(); no(t.error) } }
  })
}
function shotGet() { return idbDo("readonly", function (st) { return st.get("shot") }) }
function shotSet(v) { return idbDo("readwrite", function (st) { return v ? st.put(v, "shot") : st.delete("shot") }) }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] }) }

/* ---------- stato ---------- */
var DEF = { allyLane: [null, null, null, null, null], recent: [], useMine: true, mph: [], banA: [null, null, null, null, null], banE: [null, null, null, null, null], ally: [null, null, null, null, null], enemy: [null, null, null, null, null], keep: false, lanefit: true, avatar: null, rk: "all", algo: "meta", theme: "dark", nick: "DraftStrategist", main: "T", picks: 0, synSum: 0, synN: 0, quiz: { xp: 0, ok: 0, tot: 0, best: 0, streak: 0, rounds: 0 }, spoken: false, autoLive: true, guide: null, gbans: 10, games: [], daily: null, dstreak: 0, dlast: null, lang: "it", newsSeen: null, pool: [], lane: null, onb: true };
var S; try { S = JSON.parse(localStorage.getItem(KEY.s) || "null") } catch (e) { S = null }
var FIRST = !(S && typeof S === "object"); /* nessun dato salvato: primo avvio */
var POOLMAX = 8; /* eroi nel pool del giocatore */
if (S && typeof S === "object") { for (var sv = (S.v || 1) + 1; sv <= SAVE_V; sv++) if (UPG[sv]) UPG[sv](S) }
S = Object.assign({}, DEF, S || {}); S.quiz = Object.assign({}, DEF.quiz, S.quiz || {}); if (FIRST) S.onb = false; /* configurazione iniziale da fare */
function sanitizeTeam(t) { t = (t || []).slice(0, 5); while (t.length < 5) t.push(null); return t.map(function (h) { return h && H[h] ? h : null }) }
S.ally = sanitizeTeam(S.ally); S.enemy = sanitizeTeam(S.enemy); S.banA = sanitizeTeam(S.banA); S.banE = sanitizeTeam(S.banE); S.allyLane = (Array.isArray(S.allyLane) ? S.allyLane : []).slice(0, 5); while (S.allyLane.length < 5) S.allyLane.push(null); S.allyLane = S.allyLane.map(function (l) { return LN[l] ? l : null }); S.recent = (Array.isArray(S.recent) ? S.recent : []).filter(function (h) { return H[h] }).slice(0, 12); S.mph = Array.isArray(S.mph) ? S.mph : []; S.games = Array.isArray(S.games) ? S.games : []; S.pool = (Array.isArray(S.pool) ? S.pool : []).filter(function (h, i, a) { return H[h] && a.indexOf(h) === i }).slice(0, POOLMAX); if (!LN[S.lane]) S.lane = null;
function save() { S.v = SAVE_V; try { localStorage.setItem(KEY.s, JSON.stringify(S)) } catch (e) { } }
/* testi di gioco in italiano da data-it.js (gli originali inglesi restano in data.js; nel Profilo si può tornare all'inglese) */
function applyIT() {
  if (S.lang === "en" || typeof IT === "undefined") return false;
  Object.keys(IT.it).forEach(function (id) { var x = ITEMS[id], t = IT.it[id]; if (!x) return; if (t[0]) x[2] = t[0]; if (t[1]) x[3] = t[1] });
  Object.keys(IT.tal).forEach(function (id) { if (TAL[id]) TAL[id][1] = IT.tal[id] });
  Object.keys(IT.spl).forEach(function (id) { if (SPL[id]) SPL[id][1] = IT.spl[id] });
  Object.keys(HX).forEach(function (h) {
    var x = HX[h], k = IT.sk[h], r = IT.rel[h];
    if (k) (x.sk || []).forEach(function (sk, i) { if (k[i]) sk.d = k[i] });
    if (r && x.rel) Object.keys(r).forEach(function (t) { if (x.rel[t]) x.rel[t].d = r[t] });
    Object.keys(x.bd || {}).forEach(function (l) { x.bd[l].forEach(function (b) { if (IT.ea[b.ea]) b.ea = IT.ea[b.ea] }) });
  });
  return true;
}
var ITON = applyIT();
var SHOT = "";
(function () {
  var old = null; try { old = localStorage.getItem(KEY.shot) } catch (e) { }
  var show = function () { if (cur === "profile" && $("mpc")) mpCard() };
  if (old) { SHOT = old; shotSet(old).then(function () { try { localStorage.removeItem(KEY.shot) } catch (e) { } }).catch(function () { }) }
  else shotGet().then(function (v) { SHOT = v || ""; if (SHOT) show() }).catch(function () { });
})();
var focus = null, recs = [], detOpen = false, pk = null, cur = "draft", hist = [], hero = "Khufra", htab = "ab", bdl = null, hsub = "her", itf = "all", iq = "", tf = "all", tq = "", tsort = "wr", hf = "all", hq = "", QZ = null;
