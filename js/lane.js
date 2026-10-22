/* MLBB TOP - Lane 1v1: chi è avvantaggiato in ogni lane tra il nostro eroe e quello nemico, e perché */
/* lane dei nemici: come per gli alleati, la combinazione che copre più lane con le build ufficiali più usate */
function enemyLanes() {
  var list = S.enemy.filter(Boolean), best = null;
  (function rec(k, used, cur, sc) {
    if (k === list.length) { var v = Object.keys(cur).length * 10 + sc; if (!best || v > best.v) best = { v: v, map: Object.assign({}, cur) }; return }
    H[list[k]].l.split("").forEach(function (l) { if (!used[l]) { used[l] = 1; cur[l] = list[k]; rec(k + 1, used, cur, sc + fit(list[k], l)); delete used[l]; delete cur[l] } });
    rec(k + 1, used, cur, sc)
  })(0, {}, {}, 0);
  return best ? best.map : {}
}
/* coppia di una lane: d = vantaggio in % per il nostro eroe; dato ufficiale se c'è, altrimenti stima (est) da tratti e win rate */
function lanePair(l, al, el) {
  var a = (al || laneAssign())[l], e = (el || enemyLanes())[l], d = a && e ? h2h(a, e) : null, est = false;
  if (a && e && d == null) { est = true; d = Math.round(((sc(a, e).s - sc(e, a).s) * .8 + ((M[a].wr || 50) - (M[e].wr || 50)) * .3) * 10) / 10 }
  return { l: l, a: a, e: e, d: d, est: est }
}
function laneCard() {
  var al = laneAssign(), el = enemyLanes(), any = false;
  var rows = LANES.map(function (l) {
    var p = lanePair(l, al, el), d = p.d, col = d == null || Math.abs(d) < .5 ? "var(--mute)" : d > 0 ? "var(--green)" : "var(--red)", w = d == null ? 0 : Math.min(50, Math.abs(d) * 8);
    if (p.a && p.e) any = true;
    var side = function (h, cls) { return '<div class="side ' + cls + '">' + (h ? tile(h, "sm") + '<span><b>' + esc(h) + '</b><small>' + rlab(h) + '</small></span>' : '<span class="hint">—</span>') + '</div>' };
    return '<button class="lr" data-l="' + l + '"' + (p.a && p.e ? "" : " disabled") + ' aria-label="' + LN[l] + ': ' + (p.a || "nessuno") + ' contro ' + (p.e || "nessuno") + '">' + side(p.a, "a") +
      '<span class="mid"><span class="ln">' + LS3[l] + '</span><span class="vb"><i style="' + (d > 0 ? "right" : "left") + ':50%;width:' + w + '%;background:' + col + '"></i></span><span class="pct" style="color:' + col + '">' +
      (d == null ? "" : Math.abs(d) < .5 ? "pari" : (d > 0 ? "+" : "") + d.toFixed(1) + "%") + (p.est && d != null ? "*" : "") + '</span></span>' + side(p.e, "e") + '</button>'
  }).join("");
  return '<div class="card l1"><div class="kv"><b class="hh">' + IC.swap + ' Lane 1v1</b><span class="k">' + (any ? "tocca una lane" : "servono alleati e nemici") + '</span></div><div class="l1r">' + rows + '</div>' +
    '<p class="hint" style="margin:6px 0 0">% = vantaggio del tuo eroe nello scontro diretto (dati ufficiali) · * stima da tratti e win rate</p></div>'
}
function laneBind(root) { [].forEach.call(root.querySelectorAll(".l1 .lr"), function (b) { b.onclick = function () { openLane(b.dataset.l) } }) }
/* scheda di dettaglio sopra la schermata: si chiude e si resta dove si era */
function openLane(l) {
  var p = lanePair(l), a = p.a, e = p.e, d = p.d; if (!a || !e) return;
  var A = (HX[a] && HX[a].ab) || null, E = (HX[e] && HX[e].ab) || null, ta = sc(a, e), te = sc(e, a), even = Math.abs(d) < .5, fav = d > 0, it = situItems(a, l, [e]).items[0];
  var sb = function (lab, x, y) { return '<div class="sb"><span class="bar2 l"><i style="width:' + x + '%;background:' + (x >= y ? "var(--green)" : "var(--blue2)") + '"></i></span><span class="k">' + lab + '<br>' + x + ' · ' + y + '</span><span class="bar2"><i style="width:' + y + '%;background:' + (y > x ? "var(--red)" : "var(--blue2)") + '"></i></span></div>' };
  var why = [];
  if (!p.est) why.push((fav ? a : e) + " vince il " + Math.abs(d).toFixed(1) + "% in più di questo scontro (dati ufficiali, " + META.win + ")");
  else why.push("Nessun dato ufficiale su questo scontro: stima da tratti e win rate (" + pc(M[a].wr) + " contro " + pc(M[e].wr) + ")");
  if (ta.s) why.push(a + ": " + ta.w); if (te.s) why.push(e + ": " + te.w);
  var tips = even ? ["Scontro equilibrato: decide chi gestisce meglio l'onda e i tempi delle abilità.", "Non sprecare abilità sui minion quando " + e + " è vicino."]
    : fav ? ["Spingi l'onda e cerca lo scambio nei primi minuti: il vantaggio è tuo.", "Quando " + e + " resta sotto torre, ruota o aiuta il jungler."]
      : ["Gioca sicuro vicino alla torre e prendi i minion senza scambi lunghi.", "Chiedi aiuto al jungler o al roamer prima di ingaggiare " + e + "."];
  var d0 = $("lane1"); if (d0) d0.remove();
  var s = document.createElement("div"); s.className = "sheet show"; s.id = "lane1";
  s.innerHTML = '<div class="box s1"><div class="kv"><span class="k">' + LN[l] + ' · 1 contro 1</span><button class="lnk" id="l1x">Chiudi</button></div>' +
    '<div class="vs"><div>' + tile(a, "lg", rlab(a)) + '<b>' + esc(a) + '</b><small class="hint">Alleato</small></div><span class="k">VS</span><div>' + tile(e, "lg", rlab(e)) + '<b>' + esc(e) + '</b><small class="hint">Nemico</small></div></div>' +
    '<div class="verd ' + (even ? "n" : fav ? "g" : "r") + '">' + (even ? '<b>Scontro equilibrato</b>' : '<b class="' + (fav ? "g" : "r") + '">' + esc(fav ? a : e) + ' è avvantaggiato</b> in lane') + ': ' + (d > 0 ? "+" : "") + d.toFixed(1) + '% per ' + esc(a) + (p.est ? " (stima)" : "") + '.</div>' +
    '<div class="k">Perché</div><ul>' + why.map(function (t) { return '<li>' + esc(t) + '</li>' }).join("") + '</ul>' +
    (A && E ? '<div class="k" style="margin-top:12px">Statistiche</div>' + sb("Durabilità", A[0], E[0]) + sb("Offesa", A[1], E[1]) + sb("Controllo", A[2], E[2]) : '') +
    '<div class="k" style="margin-top:12px">Come giocarla</div><ul>' + tips.map(function (t) { return '<li>' + esc(t) + '</li>' }).join("") +
    (it ? '<li>Oggetto utile: <b>' + esc(ITEMS[it.id][0]) + '</b> — ' + esc(it.why) + '.</li>' : '') + '</ul>' +
    '<div class="two" style="margin-top:14px"><button class="btn sm" id="l1h">Scheda ' + esc(e) + '</button><button class="btn sm p" id="l1c">Confronto completo</button></div></div>';
  document.querySelector(".app").appendChild(s);
  var close = function () { s.remove() };
  s.onclick = function (ev) { if (ev.target === s) close() }; $("l1x").onclick = close;
  $("l1h").onclick = function () { close(); openHero(e) };
  $("l1c").onclick = function () { close(); cmpA = a; cmpB = e; go("cmp") };
}
