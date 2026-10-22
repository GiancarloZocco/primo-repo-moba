/* MLBB TOP - Motore dei consigli: punteggi, meta, counter, lane */
/* ---------- motore ---------- */
function sc(c, t) {
  var C = H[c], T = H[t], s = 0, w = "";
  function r(p, n, x) { if (p && n > s) { s = n; w = x } }
  r(T.t.indexOf("m") > -1 && C.t.indexOf("c") > -1, 3, "CC per fermare gli scatti di " + t);
  r(T.t.indexOf("r") > -1 && C.t.indexOf("m") > -1, 3, "si tuffa su " + t + ", fragile in mischia");
  r(T.t.indexOf("t") > -1 && C.t.indexOf("p") > -1, 3, "danni % contro la difesa di " + t);
  r(T.t.indexOf("s") > -1 && C.t.indexOf("b") > -1, 2, "burst prima che " + t + " si curi");
  r(T.t.indexOf("b") > -1 && C.t.indexOf("t") > -1, 2, "regge i burst di " + t);
  return { s: s, w: w }
}
var M = {};
(function () {
  var mc = 0, mr = 0, mv = 0;
  NAMES.forEach(function (h) { var c = 0, r = 0; NAMES.forEach(function (o) { if (o === h) return; c += sc(h, o).s; r += sc(o, h).s }); var v = H[h].g.length + H[h].t.length; M[h] = { c: c, r: r, v: v }; mc = Math.max(mc, c); mr = Math.max(mr, r); mv = Math.max(mv, v) });
  NAMES.forEach(function (h) { var m = M[h]; m.ci = Math.round(100 * m.c / mc); m.sf = Math.round(100 - 100 * m.r / mr); m.vr = Math.round(100 * m.v / mv); m.score = .45 * m.ci + .35 * m.sf + .2 * m.vr });
  NAMES.slice().sort(function (a, b) { return M[b].score - M[a].score }).forEach(function (h, i) { M[h].rank = i + 1 });
  Object.keys(R).forEach(function (r) {
    var hs = NAMES.filter(function (h) { return H[h].r === r }).sort(function (a, b) { return M[b].score - M[a].score }), n = hs.length, a = Math.max(1, Math.round(n * .08)), b = a + Math.round(n * .2), c = b + Math.round(n * .35);
    hs.forEach(function (h, i) { M[h].tier = i < a ? "SS" : i < b ? "S" : i < c ? "A" : "B"; M[h].rrank = i + 1 })
  });
})();
function rkOf(h) { var r = HX[h] && HX[h].rk; return r && (r[S.rk] || r.all) || null }
function calcMeta() {
  NAMES.forEach(function (h) { var r = rkOf(h), m = M[h]; if (r) { m.wr = r[0]; m.pr = r[1]; m.br = r[2]; m.meta = (r[0] - 50) * 6 + Math.sqrt(r[1]) * 12 + Math.sqrt(r[2]) * 5 } else { m.wr = m.pr = m.br = null; m.meta = m.score / 5 } });
  Object.keys(R).forEach(function (r) {
    var hs = NAMES.filter(function (h) { return H[h].r === r }).sort(function (a, b) { return M[b].meta - M[a].meta }), n = hs.length, a = Math.max(1, Math.round(n * .1)), b = a + Math.round(n * .22), c = b + Math.round(n * .35);
    hs.forEach(function (h, i) { M[h].tier = i < a ? "SS" : i < b ? "S" : i < c ? "A" : "B"; M[h].rrank = i + 1 })
  });
}
calcMeta();
function pc(v) { return v == null ? "—" : v.toFixed(1) + "%" }
/* tendenze: win rate rispetto alla classifica precedente (salvata a ogni aggiornamento con data diversa) */
var PREV = null; try { PREV = JSON.parse(localStorage.getItem(KEY.prev) || "null") } catch (e) { }
function prevWr(h) { var r = PREV && PREV.rk && PREV.rk[h]; r = r && (r[S.rk] || r.all); return r ? r[0] : null }
function dWr(h) { var a = M[h] && M[h].wr, b = prevWr(h); return a == null || b == null ? null : Math.round((a - b) * 10) / 10 }
function dTag(h) { var d = dWr(h); return d == null || Math.abs(d) < .1 ? "" : '<small class="dl ' + (d > 0 ? "up" : "dn") + '" title="Win rate rispetto al ' + esc(PREV.date) + '">' + (d > 0 ? "▲" : "▼") + Math.abs(d).toFixed(1) + '</small>' }
function findInc(a, n) { if (!a) return null; for (var i = 0; i < a.length; i++)if (a[i][0] === n) return a[i][1]; return null }
function realC(h, e) { var x = HX[e]; if (!x) return 0; var v = findInc(x.by, h); if (v != null) return v; v = findInc(x.vs, h); return v != null ? v : 0 }
function topCounters(h, n) { var x = HX[h]; if (x && x.by && x.by.length) return x.by.slice(0, n).map(function (a) { return a[0] }); return beatenBy(h).slice(0, n).map(function (o) { return o.n }) }
function stats(h) {
  var x = H[h], d = { T: 85, F: 62, A: 32, M: 28, X: 28, S: 48 }[x.r], o = { T: 35, F: 66, A: 86, M: 80, X: 84, S: 30 }[x.r], f = { T: 40, F: 55, A: 72, M: 52, X: 48, S: 38 }[x.r];
  if (x.t.indexOf("t") > -1) d += 10; if (x.t.indexOf("s") > -1) d += 5; if (x.t.indexOf("b") > -1) o += 8; if (x.t.indexOf("p") > -1) o += 6; if (x.t.indexOf("m") > -1) f += 12; if (x.t.indexOf("c") > -1) f += 4; if (x.t.indexOf("r") > -1) f -= 4;
  function k(v) { return Math.max(10, Math.min(98, v)) } return { d: k(d), o: k(o), f: k(f) }
}
function diff(h) { var f = stats(h).f; return f >= 75 ? "Estrema" : f >= 60 ? "Alta" : f >= 45 ? "Media" : "Facile" }
function beats(h) { return NAMES.filter(function (o) { return o !== h }).map(function (o) { var x = sc(h, o); return { n: o, s: x.s, w: x.w } }).filter(function (x) { return x.s > 0 }).sort(function (a, b) { return b.s - a.s || M[b.n].score - M[a.n].score }) }
function beatenBy(h) { return NAMES.filter(function (o) { return o !== h }).map(function (o) { var x = sc(o, h); return { n: o, s: x.s, w: x.w } }).filter(function (x) { return x.s > 0 }).sort(function (a, b) { return b.s - a.s || M[b.n].score - M[a.n].score }) }
function cats(team) { var s = {}; team.forEach(function (h) { if (h) H[h].g.split("").forEach(function (t) { s[t] = 1 }) }); return s }
function missing() { var c = cats(S.ally); return Object.keys(CAT).filter(function (k) { return !c[k] }) }
function en() { return S.enemy.filter(Boolean) }
function pressed(a) { return a && en().some(function (e) { return sc(e, a).s >= 3 }) }
function synergy() { var pen = S.ally.filter(pressed).length * 3; return Math.max(10, Math.min(100, 38 + 15 * Object.keys(cats(S.ally)).length - pen)) }
function used() { return S.ally.concat(S.enemy, S.banA, S.banE).filter(Boolean) }
function cap(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t }
function mineOf(h) { return S.useMine !== false && S.mp && Array.isArray(S.mp.h) ? S.mp.h.filter(function (z) { return z && z.n === h })[0] || null : null }
function mineBonus(h) {
  var x = mineOf(h); if (!x) return null; var b = 1;
  b = .5; if (x.w != null) b += Math.max(-.5, Math.min(1.5, (x.w - 50) / 10)); else b += .5; if (x.g != null) b *= Math.min(1.2, .5 + x.g / 150);
  b = Math.max(0, Math.round(b * 10) / 10);
  return { v: b, t: "È tra i tuoi eroi più usati" + (x.g != null || x.w != null ? " (" + [x.g != null ? x.g + " partite" : "", x.w != null ? x.w + "% di vittorie" : ""].filter(Boolean).join(", ") + ")" : "") }
}
/* pool scelto dal giocatore (primo avvio o Profilo): bonus fisso, un po' di più nella sua lane preferita */
function inPool(h) { return S.useMine !== false && S.pool.indexOf(h) > -1 }
function poolBonus(h, l) { if (!inPool(h)) return null; var lp = S.lane && l === S.lane; return { v: lp ? 2 : 1.5, t: "È nel tuo pool di eroi" + (lp ? ", nella tua lane preferita" : "") } }
function compute() {
  var u = used(), gaps = missing(), out = [];
  NAMES.forEach(function (h) {
    if (u.indexOf(h) > -1) return;
    var s = 0, why = "", b = 0, risk = 0, parts = [], warn = [];
    en().forEach(function (e) {
      var x = sc(h, e), rc = realC(h, e); s += x.s + rc;
      if (rc > 0 && rc * 1.2 >= b) { b = rc * 1.2; why = "+" + rc.toFixed(1) + "% win rate contro " + e + " (dati ufficiali)" } else if (x.s > b) { b = x.s; why = x.w }
      if (rc) parts.push({ v: rc, t: (rc > 0 ? "+" : "") + rc.toFixed(1) + "% di win rate contro " + e + " (dati ufficiali)" });
      if (x.s) parts.push({ v: x.s, t: cap(x.w) });
      var r1 = sc(e, h), r2 = realC(e, h), rr = r1.s + Math.max(0, r2); risk += rr;
      if (rr > 0) warn.push({ v: rr, t: e + " lo mette in difficoltà" + (r2 > 0 ? " (+" + r2.toFixed(1) + "% di win rate per " + e + ")" : "") + (r1.s ? ": " + r1.w.replace(h, "lui") : "") })
    });
    S.ally.forEach(function (a) { if (a) { var v = findInc(HX[a] && HX[a].mate, h); if (v != null) { s += v * .5; parts.push({ v: v * .5, t: (v >= 0 ? "+" : "") + v.toFixed(1) + "% di win rate in coppia con " + a + " (dati ufficiali)" }) } } });
    var fill = H[h].g.split("").filter(function (t) { return gaps.indexOf(t) > -1 });
    if (fill.length) { s += 1.5; parts.push({ v: 1.5, t: "Porta " + fill.map(function (t) { return CAT[t] }).join(" e ") + ", che manca alla squadra" }) }
    if (S.algo === "meta") { var mv = M[h].meta / 25; s += mv; parts.push({ v: mv, t: "Meta: " + (M[h].wr != null ? "win rate " + pc(M[h].wr) + ", pick " + pc(M[h].pr) + ", ban " + pc(M[h].br) + ", " : "") + "tier " + M[h].tier + " (" + RKN[S.rk] + ")" }) }
    if (S.algo === "safe" && risk) { s -= risk * .8; parts.push({ v: -risk * .8, t: "Penalità Safe pick per i counter nemici" }) }
    var mb = mineBonus(h); if (mb) { s += mb.v; parts.push(mb) }
    out.push({ n: h, s: Math.round(s * 10) / 10, why: why, risk: risk, parts: parts, warn: warn });
  });
  out.sort(function (a, b) { return b.s - a.s || M[b.n].score - M[a.n].score });
  cover = laneAssign(); byLane = {}; byLaneList = {}; var poolBest = {};
  LANES.forEach(function (l) {
    var c = out.filter(function (o) { return H[o.n].l.indexOf(l) > -1 }).map(function (o) {
      var f = fit(o.n, l), main = H[o.n].l[0] === l, pp = o.parts.concat([{ v: 2 * f, t: (main ? "Lane principale" : "Lane secondaria") + ": " + Math.round(f * 100) + "% delle sue build ufficiali sono in " + LN[l] }]);
      if (!cover[l]) pp.push({ v: 0, t: "Copre la " + LN[l] + ", ancora libera" });
      var pb = poolBonus(o.n, l); if (pb) pp.push(pb);
      return Object.assign({}, o, { lane: l, fit: f, s: Math.round((o.s + 2 * f + (pb ? pb.v : 0)) * 10) / 10, parts: pp })
    }).sort(function (a, b) { return b.s - a.s || M[b.n].score - M[a.n].score });
    byLaneList[l] = c.slice(0, 6); if (c[0]) byLane[l] = c[0];
    c.forEach(function (r) { if (inPool(r.n) && (!poolBest[r.n] || r.s > poolBest[r.n].s)) poolBest[r.n] = r })
  });
  poolRecs = Object.keys(poolBest).map(function (h) { return poolBest[h] }).sort(function (a, b) { return b.s - a.s });
  var free = LANES.filter(function (l) { return !cover[l] });
  if (S.lanefit && free.length && S.ally.indexOf(null) > -1) recs = free.map(function (l) { return byLane[l] }).filter(Boolean).sort(function (a, b) { return b.s - a.s });
  else recs = LANES.map(function (l) { return byLane[l] }).filter(Boolean).sort(function (a, b) { return b.s - a.s }).filter(function (r, i, a) { return a.findIndex(function (z) { return z.n === r.n }) === i }).slice(0, 4);
  if (!focus || !focusRec()) { focus = recs[0] && recs[0].n; focusL = recs[0] && recs[0].lane }
}
var LANES = ["o", "e", "m", "j", "r"], poolRecs = [], byLane = {}, byLaneList = {}, cover = {}, laneIdx = {}, focusL = null, lMore = false;
var LS3 = { o: "GOLD", e: "EXP", m: "MID", j: "JGL", r: "ROAM" };
function laneAssign() {
  var map = {}, idx = {}, fixed = {}, al = [], best = null;
  S.ally.forEach(function (h, i) { var l = S.allyLane[i]; if (h && l && !map[l]) { map[l] = h; idx[l] = i; fixed[i] = 1 } });
  S.ally.forEach(function (h, i) { if (h && !fixed[i]) al.push(i) });
  function rec(k, used, cur, sc) {
    if (k === al.length) { var v = Object.keys(cur).length * 10 + sc; if (!best || v > best.v) best = { v: v, map: Object.assign({}, cur) }; return }
    var i = al[k], h = S.ally[i];
    H[h].l.split("").forEach(function (l) { if (!used[l] && !map[l]) { used[l] = 1; cur[l] = i; rec(k + 1, used, cur, sc + fit(h, l)); delete used[l]; delete cur[l] } });
    rec(k + 1, used, cur, sc)
  }
  rec(0, {}, {}, 0);
  if (best) Object.keys(best.map).forEach(function (l) { idx[l] = best.map[l]; map[l] = S.ally[best.map[l]] });
  laneIdx = idx; return map
}
function laneOfAlly(i) { var r = null; Object.keys(laneIdx).forEach(function (l) { if (laneIdx[l] === i) r = l }); return r }
function focusRec() { var all = recs.slice(); LANES.forEach(function (l) { all = all.concat(byLaneList[l] || []) }); return all.filter(function (r) { return r.n === focus && (!focusL || r.lane === focusL) })[0] || all.filter(function (r) { return r.n === focus })[0] }
