/* MLBB TOP - Inserimento rapido nel draft: scrivi 2-3 lettere e Invio, eroi probabili a un tocco, modalità "solo pick nemici".
   Dove va l'eroe: con il draft guidato il turno attuale, altrimenti la destinazione scelta (predefinita: pick nemico).
   Prefissi per forzarla: "n " pick nemico, "a " pick alleato, "bn " ban nemico, "ba " ban alleato. */
var QT = { pE: "Pick nemico", pA: "Pick alleato", bE: "Ban nemico", bA: "Ban alleato" };
var QE = { hist: [], focus: false, q: "" };
function qTeam(t) { return { bA: S.banA, bE: S.banE, pA: S.ally, pE: S.enemy }[t] }
/* destinazione attuale: solo pick nemici > turno del draft guidato > scelta manuale */
function qTarget() {
  if (S.only) return "pE";
  var g = guideNow(); if (g && g.t) return g.t;
  return QT[S.qt] ? S.qt : "pE";
}
/* cerca tra gli eroi liberi: inizio del nome, poi inizio di una parola, poi contenuto, poi lettere in ordine (es. "lng" → Ling); a parità il più giocato */
function qFind(text) {
  var q = fold(text); if (!q) return [];
  var sub = function (n) { var i = 0; for (var k = 0; k < n.length && i < q.length; k++) if (n.charAt(k) === q.charAt(i)) i++; return i === q.length };
  return free().map(function (h) { var s = hit(h, q); if (s < 0 && sub(fold(h))) s = fold(h).charAt(0) === q.charAt(0) ? 3 : 4; return { h: h, s: s } }).filter(function (x) { return x.s >= 0 })
    .sort(function (a, b) { return a.s - b.s || (M[b.h].pr || 0) - (M[a.h].pr || 0) }).map(function (x) { return x.h });
}
/* eroi probabili per la destinazione: ban più frequenti, pick nemici nelle lane che il nemico non ha ancora coperto, i nostri consigli per i pick alleati */
function qLikely(t) {
  var fr = free(), byPr = function (a, b) { return (M[b].pr || 0) - (M[a].pr || 0) };
  if (t === "bA") return banRecs().map(function (r) { return r.n }).slice(0, 8);
  if (t === "bE") return fr.slice().sort(function (a, b) { return (M[b].br || 0) - (M[a].br || 0) }).slice(0, 8);
  if (t === "pA") { var all = recs.slice(), o = []; LANES.forEach(function (l) { all = all.concat(byLaneList[l] || []) }); all.forEach(function (r) { if (o.indexOf(r.n) < 0 && fr.indexOf(r.n) > -1) o.push(r.n) }); return o.slice(0, 8) }
  var el = enemyLanes(), open = LANES.filter(function (l) { return !el[l] }), out = [];
  open.forEach(function (l) { fr.filter(function (h) { return H[h].l.charAt(0) === l }).sort(byPr).slice(0, 2).forEach(function (h) { if (out.indexOf(h) < 0) out.push(h) }) });
  fr.slice().sort(byPr).forEach(function (h) { if (out.length < 8 && out.indexOf(h) < 0) out.push(h) });
  return out.slice(0, 8);
}
/* mette l'eroe nella destinazione; ricorda dove, per poterlo annullare */
function qPlace(t, h) {
  var team = qTeam(t), i = team.indexOf(null);
  if (i < 0) { toast((t.charAt(0) === "b" ? "Ban " : "") + (t.charAt(1) === "A" ? "Alleati" : "Nemici") + " al completo.", "err"); return false }
  if (t.charAt(0) === "p") setSlot(team, i, h); else { team[i] = h; pushRecent(h); focus = null; if (typeof FX !== "undefined") FX.ban = (t === "bA" ? "a" : "e") + i; save() }
  QE.hist.push({ t: t, i: i, h: h }); return true;
}
function qUndo() { return draftUndo() }
/* testo scritto → { t: destinazione, q: nome } con i prefissi */
function qParse(v) {
  var m = /^\s*(bn|ba|n|a)\s+(.*)$/i.exec(v), P = { n: "pE", a: "pA", bn: "bE", ba: "bA" };
  return m ? { t: P[m[1].toLowerCase()], q: m[2] } : { t: qTarget(), q: v };
}
function quickBox() {
  var t = qTarget(), g = guideNow(); if (g && !g.t) g = null; if (g && !g.t) g = null;
  return '<div class="card qe" id="qebox"><div class="kv"><b class="hh">' + IC.search + ' Inserimento rapido</b><label class="qonly"><input type="checkbox" id="qonly"' + (S.only ? " checked" : "") + '> Solo pick nemici</label></div>' +
    '<div class="qrow"><span class="qto ' + t.charAt(1) + '" id="qto">' + QT[t] + '</span><input id="qin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Scrivi 2-3 lettere e Invio" aria-label="Eroe da inserire" value="' + esc(QE.q) + '"></div>' +
    '<div class="qsug" id="qsug"></div>' +
    '<div class="qlike" id="qlike"></div>' +
    '<details class="qopt"><summary>Opzioni e scorciatoie</summary>' + (!S.only && !g ? '<div class="seg qts" id="qts"></div>' : '') +
    '<p class="hint" style="margin:6px 0 0">Invio = primo risultato · Backspace a casella vuota = annulla · ' + (g && !S.only ? "Tab = salta turno · " : "") + 'prefissi: n, a, bn, ba</p></details></div>';
}
function quickBind() {
  var inp = $("qin"); if (!inp) return; var t = qTarget(), g = guideNow(); if (g && !g.t) g = null; if (g && !g.t) g = null;
  /* ridisegnare toglie la casella (e il focus): la si rimette subito pronta */
  var done = function () { QE.q = ""; rDraft(); if ($("qin")) $("qin").focus() };
  var sug = function () {
    var p = qParse(inp.value), r = qFind(p.q).slice(0, 4), el = $("qsug"); el.innerHTML = ""; QE.q = inp.value;
    $("qto").textContent = QT[p.t]; $("qto").className = "qto " + p.t.charAt(1);
    r.forEach(function (h, k) { var b = document.createElement("button"); b.className = "qs" + (k ? "" : " on"); b.innerHTML = tile(h, "xs") + '<span>' + esc(h) + '</span>'; b.onclick = function () { if (qPlace(p.t, h)) done() }; el.appendChild(b) });
    if (p.q.trim() && !r.length) el.innerHTML = '<span class="hint">Nessun eroe libero con «' + esc(p.q) + '»</span>';
  };
  inp.oninput = sug; 
  inp.onkeydown = function (e) {
    if (e.key === "Enter") { e.preventDefault(); var p = qParse(inp.value), h = qFind(p.q)[0]; if (h && qPlace(p.t, h)) done() }
    else if ((e.key === "Backspace" && !inp.value) || (e.key === "z" && (e.ctrlKey || e.metaKey))) { e.preventDefault(); if (qUndo()) done() }
    else if (e.key === "Tab" && g && g.t && !S.only) { e.preventDefault(); S.gskip = (S.gskip || []).concat([g.k]); save(); toast("Turno saltato: " + GT[g.t] + "."); done() }
    else if (e.key === "Escape") { inp.value = ""; sug() }
  };
  if (QE.q) sug();
  if ($("qts")) ["pE", "bE", "pA", "bA"].forEach(function (k) { var b = document.createElement("button"); b.textContent = QT[k]; b.className = t === k ? "on" : ""; b.onclick = function () { S.qt = k; save(); rDraft(); $("qin").focus() }; $("qts").appendChild(b) });
  qLikely(t).slice(0, 4).forEach(function (h) { var b = document.createElement("button"); b.className = "lcand"; b.innerHTML = tile(h, "sm") + '<b>' + esc(h) + '</b>'; b.onclick = function () { if (qPlace(t, h)) done() }; $("qlike").appendChild(b) });
  $("qonly").onchange = function () { S.only = this.checked; save(); rDraft() };
}
/* "/" porta subito alla casella, da qualsiasi punto del draft (sul computer) */
document.addEventListener("keydown", function (e) { if (e.key === "/" && cur === "draft" && $("qin") && document.activeElement !== $("qin") && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $("qin").focus() } });
