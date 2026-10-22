/* MLBB TOP - Schermata Draft: consigli, ban, turni, condivisione, storico partite */
/* ---------- DRAFT ---------- */
function rDraft() {
  if (!used().length) { S.gskip = []; QE.hist = [] }
  compute(); var v = $("v-draft"), full = S.ally.indexOf(null) < 0, algo = { meta: "Meta", bal: "Bilanciata", safe: "Safe pick" }[S.algo], free = LANES.filter(function (l) { return !cover[l] });
  v.innerHTML = '<div class="ttl"><div><h2>Draft Live<i></i></h2><p>5v5 · ' + algo + ' · ' + RKN[S.rk] + '</p></div><span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><span class="pill am" title="Sinergia della squadra alleata">Sinergia ' + synergy() + '%</span><span class="pill bl">' + en().length + '/5 Nemici</span></span></div>' +
    '<details class="gset" id="gset"' + (gsetOpen ? " open" : "") + '><summary><span class="k">Draft guidato</span><b>' + (S.guide ? (S.gmode === "tour" ? "Torneo" : "Ranked") + ' · ' + (S.guide === "blue" ? "Primi noi" : "Primi loro") + ' · ' + S.gbans + ' ban' : "No") + '</b><span class="gear">' + IC.sliders + '</span></summary>' +
    '<div class="srt" style="margin-top:8px"><span class="k">Guidato:</span><div class="seg" id="gd"></div></div>' + (S.guide ? '<div class="srt" style="margin-top:0"><span class="k">Modalità:</span><div class="seg" id="gmo"></div></div><div class="srt" style="margin-top:0"><span class="k">Ban:</span><div class="seg" id="gbn"></div></div>' : '') + '</details>' + guideBox() + resultBox() + quickBox() +
    (used().length || S.guide || gameMsg ? '' : '<div class="alert"><span class="a">' + IC.bulb + '</span><span>Inizia dai ban, poi aggiungi gli eroi nemici man mano che li scelgono: i consigli per ogni lane si aggiornano a ogni pick.</span></div>') +
    '<div class="teams"><div class="team ally"><h3>Alleati</h3><div id="ally"></div></div><div class="team enemy"><h3>Nemici</h3><div id="enemy"></div></div></div>' + (S.ally.some(Boolean) && en().length ? tend("lane", "Lane 1v1", laneSum(), laneCard()) : '') + tend("bans", "Ban", banSum(), '<div class="bans" id="bans"></div>') +
    foldOpen("recs", "Consigliati", recSum()) + '<div class="kv" style="align-items:center"><span class="k">Consigliati per lane</span><button class="lnk" id="lf">' + (S.lanefit ? "Solo lane libere ✓" : "Tutte le lane") + '</button></div><div class="lrows" id="lanes"></div><button class="lnk" id="lmore" style="align-self:center">' + (lMore ? "Mostra 3 per lane" : "Mostra 6 per lane") + '</button>' + (poolRecs.length && !full ? '<div class="card prow"><div class="kv"><b class="hh">' + IC.star + ' Dal tuo pool</b><span class="k">' + poolRecs.length + ' disponibili</span></div><div class="hrow" id="poolr"></div></div>' : '') + '<div id="rec"></div>' +
    '<div class="two"><button class="btn sm" id="add"' + (en().length >= 5 ? " disabled" : "") + '>+ Nemico</button><button class="btn sm" id="det">' + (detOpen || S.keep ? "Chiudi analisi" : "Analisi dettagliata") + '</button></div><div id="detail"></div></div></details>' +
    '<div id="alert"></div><div class="two"><button class="btn sm" id="rp">Azzera pick</button><button class="btn sm" id="share"' + (used().length ? "" : " disabled") + '>Condividi draft</button></div>';
  slots($("ally"), S.ally, 1); slots($("enemy"), S.enemy, 0); banRows();
  LANES.forEach(function (l) {
    var row = document.createElement("div"), al = cover[l], list = (byLaneList[l] || []).slice(0, lMore ? 6 : 3);
    row.className = "lrow" + (al ? " cov" : "");
    row.innerHTML = '<div class="lh"><b>' + LS3[l] + '</b><small>' + (al ? "✓ " + esc(al) : "libera") + '</small></div><div class="lc3"></div>';
    list.forEach(function (r) {
      var c = document.createElement("button"); c.className = "lcand" + (r.n === focus && r.lane === focusL ? " on" : "");
      c.innerHTML = tile(r.n, "sm") + '<b>' + (inPool(r.n) ? '<i class="pst" title="Nel tuo pool">★</i>' : '') + esc(r.n) + '</b><small class="a">' + r.s + ' pt</small>'; c.setAttribute("aria-label", r.n + " in " + LN[l] + ", " + r.s + " punti");
      c.onclick = function () { focus = r.n; focusL = l; rDraft() }; row.lastChild.appendChild(c)
    });
    if (!list.length) row.lastChild.innerHTML = '<small class="hint">Nessun eroe disponibile</small>';
    $("lanes").appendChild(row)
  });
  if ($("poolr")) poolRecs.slice(0, 3).forEach(function (r) {
    var c = document.createElement("button"); c.className = "lcand" + (r.n === focus && r.lane === focusL ? " on" : "");
    c.innerHTML = tile(r.n, "sm") + '<b>' + esc(r.n) + '</b><small class="a">' + LS3[r.lane] + ' · ' + r.s + ' pt</small>';
    c.onclick = function () { focus = r.n; focusL = r.lane; rDraft() }; $("poolr").appendChild(c)
  });
  var m = focusRec();
  if (m) {
    var gap = missing().filter(function (g) { return H[m.n].g.indexOf(g) > -1 })[0];
    var det = m.why ? m.why.charAt(0).toUpperCase() + m.why.slice(1) + (gap ? ", e porta " + CAT[gap] : "") : (gap ? "Porta " + CAT[gap] + " alla squadra" : "Pick solido per questa composizione");
    $("rec").innerHTML = '<div class="card hl rec"><div class="k">Consigliato · ' + LN[m.lane] + (cover[m.lane] ? " (già coperta)" : "") + '</div><div class="hd">' + tile(m.n, "lg", rlab(m.n)) + '<div style="flex:1;min-width:0"><div class="nm">' + m.n + '</div><div class="hint" style="margin-top:3px">' + roleLane(m.n) + '</div></div><span class="tb ' + M[m.n].tier + '" style="font-size:13px;padding:3px 8px">' + M[m.n].tier + '</span></div><p class="why">' + det + '.</p>' +
      spemLine(m.n, m.lane) + '<div class="mets"><div class="met"><div class="k">Win rate</div><b class="' + (M[m.n].wr >= 52 ? "g" : M[m.n].wr >= 49 ? "a" : "r") + '">' + pc(M[m.n].wr) + '</b></div><div class="met"><div class="k">Ban rate</div><b class="a">' + pc(M[m.n].br) + '</b></div><div class="met"><div class="k">Punteggio</div><b class="b">' + m.s + '</b></div></div>' +
      '<div class="two"><button class="btn sm" id="info">Scheda eroe</button><button class="btn am sm" id="pk"' + (full ? " disabled" : "") + '>Scegli ' + m.n + '</button></div></div>';
    $("pk").onclick = function () { var i = S.ally.indexOf(null); if (i > -1) { setSlot(S.ally, i, m.n); if (!cover[m.lane]) S.allyLane[i] = m.lane; save(); rDraft() } };
    $("info").onclick = function () { openHero(m.n) };
  } else $("rec").innerHTML = '<div class="card"><p class="hint">Nessun eroe disponibile.</p></div>';
  var g = missing(), fl = S.ally.indexOf(null) > -1 ? free : [], msg = [];
  if (fl.length) msg.push("lane scoperte: " + fl.map(function (l) { return LS[l] }).join(", "));
  if (g.length) msg.push("manca " + g.map(function (k) { return CAT[k] }).join(", "));
  $("alert").innerHTML = msg.length ? '<div class="alert"><span class="a">' + IC.warn + '</span><span>Attenzione: ' + msg.join(" · ") + '.</span></div>' : '<div class="alert good"><span class="g">' + IC.check + '</span><span>Composizione completa: lane e ruoli chiave coperti.</span></div>';
  if (S.keep || detOpen) {
    var c = cats(S.ally), why = "";
    if (m) {
      var pos = m.parts.filter(function (x) { return x.v > 0 }).sort(function (a, b) { return b.v - a.v }), neg = m.parts.filter(function (x) { return x.v < 0 }), info = m.parts.filter(function (x) { return x.v === 0 }), alt = (byLaneList[m.lane] || []).filter(function (r) { return r.n !== m.n }).slice(0, 2);
      var li = function (x, cls) { return '<li><span>' + esc(x.t) + '</span>' + (x.v ? '<b class="' + cls + '">' + (x.v > 0 ? "+" : "") + (Math.round(x.v * 10) / 10) + '</b>' : '') + '</li>' };
      why = '<div class="card rows wbox"><div class="ph">Perché ' + esc(m.n) + ' in ' + LN[m.lane] + '</div>' +
        (pos.length ? '<div class="k">A favore</div><ul class="wl">' + pos.map(function (x) { return li(x, "g") }).join("") + info.map(function (x) { return li(x, "") }).join("") + '</ul>' : '') +
        (m.warn.length || neg.length ? '<div class="k">Da tenere d\'occhio</div><ul class="wl">' + neg.map(function (x) { return li(x, "r") }).join("") + m.warn.map(function (x) { return '<li><span>' + esc(x.t) + '</span></li>' }).join("") + '</ul>' : '<p class="hint">Nessun nemico attuale lo countera.</p>') +
        '<div class="kv"><span>Punteggio totale</span><b class="a">' + m.s + ' pt</b></div>' +
        (alt.length ? '<p class="hint">Alternative in ' + LN[m.lane] + ': ' + alt.map(function (r) { return esc(r.n) + " (" + r.s + " pt)" }).join(", ") + '. I punti sommano i vantaggi qui sopra: più alto è, più il pick è adatto a questo draft.</p>' : '') + '</div>'
    }
    $("detail").innerHTML = why + (m ? buildBox(m.n, m.lane) : "") + '<div class="card rows">' + Object.keys(CAT).map(function (k) { return '<div class="kv"><span>' + CAT[k] + '</span><span class="' + (c[k] ? "ok" : "no") + '">' + (c[k] ? "Coperto" : "Mancante") + '</span></div>' }).join("") + LANES.map(function (l) { return '<div class="kv"><span>' + LN[l] + '</span><span class="' + (cover[l] ? "ok" : "no") + '">' + (cover[l] ? esc(cover[l]) + (S.allyLane[laneIdx[l]] ? " (scelta tua)" : "") : "Libera") + '</span></div>' }).join("") + '<div class="kv"><span>Alleati sotto pressione</span><span class="a">' + S.ally.filter(pressed).length + '</span></div><div class="kv"><span>Rischio counter del consigliato</span><span>' + (m ? Math.round(m.risk * 10) / 10 : 0) + '</span></div></div>'
  }
  $("add").onclick = function () { openPick("Scegli l’eroe nemico", free_(), function (n) { var i = S.enemy.indexOf(null); if (i > -1) setSlot(S.enemy, i, n); rDraft() }, { quick: 1 }) };
  $("det").onclick = function () { detOpen = !detOpen; rDraft() };
  $("rp").onclick = function () { if (!S.ally.concat(S.enemy).some(Boolean)) return; ask("Azzerare i pick?", { text: "Si svuotano gli eroi di entrambe le squadre. I ban restano.", ok: "Azzera pick", danger: 1 }, function () { S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.allyLane = [null, null, null, null, null]; focus = null; save(); rDraft() }) };
  $("lf").onclick = function () { S.lanefit = !S.lanefit; focus = null; save(); rDraft() };
  $("share").onclick = function () { shareDraft(this) };
  [[null, "No"], ["blue", "Primi noi"], ["red", "Primi loro"]].forEach(function (o) { var b = document.createElement("button"); b.textContent = o[1]; b.className = S.guide === o[0] ? "on" : ""; b.onclick = function () { S.guide = o[0]; save(); rDraft() }; $("gd").appendChild(b) });
  if (S.guide) [["rank", "Ranked"], ["tour", "Torneo"]].forEach(function (o) { var b = document.createElement("button"); b.textContent = o[1]; b.className = (S.gmode === "tour" ? "tour" : "rank") === o[0] ? "on" : ""; b.onclick = function () { S.gmode = o[0]; save(); rDraft() }; $("gmo").appendChild(b) });
  if (S.guide) [[10, S.gmode === "tour" ? "10" : "10 (Mitico)"], [6, "6"]].forEach(function (o) { var b = document.createElement("button"); b.textContent = o[1]; b.className = S.gbans === o[0] ? "on" : ""; b.onclick = function () { S.gbans = o[0]; save(); rDraft() }; $("gbn").appendChild(b) });
  guideBind(); resultBind(); quickBind(); laneBind(v); foldBind(v);
  $("gset").ontoggle = function () { gsetOpen = this.open }; gameMsg = ""; fxDraftDone(S.ally.every(Boolean) && S.enemy.every(Boolean));
  $("lmore").onclick = function () { lMore = !lMore; rDraft() };
}
/* ---------- tendine del draft: si aprono da sole quelle utili nella fase attuale (ban, pick, draft completo);
   se ne apri o chiudi una a mano, l'app lo ricorda finché non cambia fase ---------- */
var gsetOpen = false;
function draftPhase() {
  if (S.ally.every(Boolean) && S.enemy.every(Boolean)) return "done";
  var g = guideNow(); if (g && g.t) return g.t.charAt(0) === "b" ? "ban" : "pick";
  return !S.only && !S.ally.concat(S.enemy).some(Boolean) && S.banA.concat(S.banE).filter(Boolean).length < 10 ? "ban" : "pick";
}
var FOLDDEF = { ban: ["bans"], pick: ["recs"], done: ["lane"] };
function foldIsOpen(id) {
  var ph = draftPhase(); if (!S.fold || S.fold.ph !== ph) S.fold = { ph: ph, o: {} };
  return id in S.fold.o ? S.fold.o[id] : FOLDDEF[ph].indexOf(id) > -1;
}
function foldOpen(id, title, sum) { return '<details class="fold" data-f="' + id + '"' + (foldIsOpen(id) ? " open" : "") + '><summary><b>' + title + '</b><span class="fs">' + sum + '</span><i class="chev"></i></summary><div class="fb">' }
function tend(id, title, sum, html) { return foldOpen(id, title, sum) + html + '</div></details>' }
function foldBind(v) { [].forEach.call(v.querySelectorAll("details.fold"), function (d) { d.ontoggle = function () { if (d.open !== foldIsOpen(d.dataset.f)) { S.fold.o[d.dataset.f] = d.open; save() } } }) }
function banSum() { var n = S.banA.concat(S.banE).filter(Boolean).length, r = n < 10 && S.banA.indexOf(null) > -1 ? banRecs()[0] : null; return S.only ? "nascosti" : n + "/10" + (r ? " · consigliato: " + esc(r.n) : "") }
function recSum() { var m = focusRec(); return m ? "migliore: " + esc(m.n) + " (" + LS3[m.lane] + ")" : "" }
function laneSum() { var al = laneAssign(), el = enemyLanes(), w = 0, l = 0; LANES.forEach(function (k) { var p = lanePair(k, al, el); if (p.d != null && p.a && p.e) { if (p.d >= .5) w++; else if (p.d <= -.5) l++ } }); return w + " vantaggi · " + l + " svantaggi" }
/* ---------- draft guidato: ordine dei turni (F = chi sceglie per primo, S = l'altra squadra) ----------
   ranked: prima tutti i ban (5 o 3 a testa, in contemporanea), poi i pick 1-2-2-2-2-1
   torneo: 3 ban a testa, 6 pick, poi (con 10 ban) altri 2 ban a testa e gli ultimi 4 pick */
var RANKED = { 10: ["bF", "bS", "bF", "bS", "bF", "bS", "bF", "bS", "bF", "bS"], 6: ["bF", "bS", "bF", "bS", "bF", "bS"] }, PICKS = ["pF", "pS", "pS", "pF", "pF", "pS", "pS", "pF", "pF", "pS"];
var ORDER = { 10: ["bF", "bS", "bF", "bS", "bF", "bS", "pF", "pS", "pS", "pF", "pF", "pS", "bS", "bF", "bS", "bF", "pS", "pF", "pF", "pS"], 6: ["bF", "bS", "bF", "bS", "bF", "bS", "pF", "pS", "pS", "pF", "pF", "pS", "pS", "pF", "pF", "pS"] };
var GT = { bA: "Ban alleato", bE: "Ban nemico", pA: "Pick alleato", pE: "Pick nemico" };
function guideSteps() {
  var first = S.guide === "red" ? "E" : "A", other = first === "A" ? "E" : "A";
  var o = S.gmode === "tour" ? ORDER[S.gbans] || ORDER[10] : (RANKED[S.gbans] || RANKED[10]).concat(PICKS);
  return o.map(function (o) { return o.charAt(0) + (o.charAt(1) === "F" ? first : other) });
}
/* turno attuale: il primo passo per cui la squadra non ha ancora abbastanza ban o pick */
function guideNow() {
  if (!S.guide) return null;
  var st = guideSteps(), need = {}, have = { bA: S.banA.filter(Boolean).length, bE: S.banE.filter(Boolean).length, pA: S.ally.filter(Boolean).length, pE: S.enemy.filter(Boolean).length };
  for (var k = 0; k < st.length; k++) {
    /* turni saltati con Tab e, in "solo pick nemici", tutti i turni che non sono pick nemici */
    if ((S.gskip || []).indexOf(k) > -1 || (S.only && st[k] !== "pE")) continue;
    need[st[k]] = (need[st[k]] || 0) + 1; if (have[st[k]] < need[st[k]]) return { k: k, t: st[k], steps: st }
  }
  return { k: st.length, t: null, steps: st };
}
function guideTeam(t) { return { bA: S.banA, bE: S.banE, pA: S.ally, pE: S.enemy }[t] }
function guideBox() {
  var g = guideNow(); if (!g) return "";
  var bar0 = '<div class="steps">' + g.steps.map(function (t, i) { return '<i class="' + t.charAt(1) + (i < g.k ? " done" : i === g.k ? " cur" : "") + '" title="' + (i + 1) + ". " + GT[t] + '"></i>' }).join("") + '</div>';
  if (!g.t) return '<div class="card guide">' + bar0 + '<div class="gs"><b>Draft completato</b><span class="pill gr">' + g.steps.length + '/' + g.steps.length + '</span></div><p class="hint">Buona partita! A fine match segna com’è andata qui sotto.</p></div>';
  var A = g.t.charAt(1) === "A", ban = g.t.charAt(0) === "b", sug = A ? (ban ? (banRecs()[0] || {}).n : (focusRec() || {}).n) : null;
  return '<div class="card hl guide">' + bar0 + '<div class="gs"><span><span class="k">Turno ' + (g.k + 1) + ' di ' + g.steps.length + '</span><br><b class="' + (A ? "b" : "r") + '">' + GT[g.t] + '</b></span>' +
    (sug ? '<button class="btn am sm" id="gsug">' + (ban ? "Banna " : "Scegli ") + esc(sug) + '</button>' : '') + '</div>' +
    '<button class="btn sm" id="gpick" style="width:100%">' + (A ? "Scegli un altro eroe" : (ban ? "Segna il ban nemico" : "Segna il pick nemico")) + '</button></div>';
}
function guideBind() {
  var g = guideNow(); if (!g || !g.t) return;
  var team = guideTeam(g.t), i = team.indexOf(null), ban = g.t.charAt(0) === "b";
  var put = function (n) { if (i < 0) return; if (ban) { team[i] = n; FX.ban = (team === S.banA ? "a" : "e") + i; pushRecent(n); focus = null; save() } else setSlot(team, i, n); rDraft() };
  if ($("gsug")) $("gsug").onclick = function () { var m = ban ? banRecs()[0] : focusRec(); if (!m) return; put(m.n); if (!ban && !cover[m.lane]) { S.allyLane[i] = m.lane; save(); rDraft() } };
  $("gpick").onclick = function () { openPick(GT[g.t], free(), put, { quick: 1 }) };
}
/* ban consigliati: eroi forti nel meta, che counterano i nostri pick o che rendono di più con i pick nemici */
function banRecs() {
  var u = used(), allies = S.ally.filter(Boolean), out = [];
  NAMES.forEach(function (h) {
    if (u.indexOf(h) > -1) return;
    var m = M[h], mv = m.meta / 25, s = mv, parts = [{ v: mv, t: m.br != null ? "Meta: ban rate " + pc(m.br) + ", win rate " + pc(m.wr) + " (" + RKN[S.rk] + ")" : "Tier " + m.tier + " del suo ruolo" }];
    allies.forEach(function (a) { var rc = realC(h, a), x = sc(h, a), v = Math.max(0, rc) + x.s * .5; if (v > 0) { s += v; parts.push({ v: v, t: rc > 0 ? "Countera " + a + " (+" + rc.toFixed(1) + "% di win rate contro di lui)" : cap(x.w) }) } });
    en().forEach(function (e) { var v = findInc(HX[e] && HX[e].mate, h); if (v != null && v > 0) { s += v * .5; parts.push({ v: v * .5, t: "Forte in coppia con " + e + " (+" + v.toFixed(1) + "% di win rate)" }) } });
    out.push({ n: h, s: Math.round(s * 10) / 10, parts: parts.sort(function (a, b) { return b.v - a.v }) });
  });
  return out.sort(function (a, b) { return b.s - a.s || M[b.n].score - M[a.n].score });
}
function banRows() {
  var el = $("bans");
  if (S.only) { el.innerHTML = '<p class="hint" style="margin:0">Ban nascosti: è attivo «Solo pick nemici» nell\'inserimento rapido.</p>'; return } el.innerHTML = '<div class="bh"><span class="k">Ban</span><button class="lnk" id="rb">Azzera ban</button></div>';
  [["Alleati", S.banA], ["Nemici", S.banE]].forEach(function (g) {
    var lab = document.createElement("div"); lab.className = "k"; lab.style.marginTop = "8px"; lab.textContent = g[0]; el.appendChild(lab);
    var row = document.createElement("div"); row.className = "brow"; el.appendChild(row);
    for (var i = 0; i < 5; i++)(function (i) {
      var h = g[1][i], b = document.createElement("button"), t = "Ban " + g[0].toLowerCase() + " " + (i + 1);
      var gn = guideNow(); b.className = "bslot" + (h ? " on" : "") + (gn && gn.t === (g[1] === S.banA ? "bA" : "bE") && g[1].indexOf(null) === i ? " now" : "") + (h && fxTake("ban", (g[1] === S.banA ? "a" : "e") + i) ? " stamp" : ""); b.innerHTML = h ? tile(h, "sm") + "<span>" + esc(h) + "</span>" : "+";
      b.setAttribute("aria-label", t + (h ? ": " + h : ": libero"));
      var set = function (n) { g[1][i] = n; if (n) FX.ban = (g[1] === S.banA ? "a" : "e") + i; pushRecent(n); focus = null; save(); rDraft() };
      b.onclick = function () { if (h) openPick(t + " · " + h, [h].concat(free_()), set, { cur: h, quick: 1, rm: function () { set(null) } }); else openPick(t, free_(), set, { quick: 1 }) };
      row.appendChild(b)
    })(i)
  });
  var fi = S.banA.indexOf(null);
  if (fi > -1) {
    var br = banRecs().slice(0, lMore ? 6 : 3), row = document.createElement("div");
    row.className = "lrow"; row.style.marginTop = "8px";
    row.innerHTML = '<div class="lh"><b>BAN</b><small>consigli</small></div><div class="lc3"></div>';
    br.forEach(function (r) {
      var c = document.createElement("button"); c.className = "lcand";
      c.innerHTML = tile(r.n, "sm") + '<b>' + esc(r.n) + '</b><small class="r">' + r.s + ' pt</small>';
      c.title = r.parts.map(function (x) { return x.t }).join(" · "); c.setAttribute("aria-label", "Banna " + r.n + ": " + c.title);
      c.onclick = function () { var i = S.banA.indexOf(null); if (i < 0) return; S.banA[i] = r.n; FX.ban = "a" + i; pushRecent(r.n); focus = null; save(); rDraft() };
      row.lastChild.appendChild(c)
    });
    el.appendChild(row);
    if (br[0]) { var hn = document.createElement("p"); hn.className = "hint"; hn.style.margin = "6px 2px 0"; hn.innerHTML = "Perché bannare <b>" + esc(br[0].n) + "</b>: " + br[0].parts.slice(0, 2).map(function (x) { return esc(x.t) }).join(" · ") + ". Tocca un eroe per bannarlo."; el.appendChild(hn) }
  }
  $("rb").onclick = function () { S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; focus = null; save(); rDraft() }
}
/* ---------- condivisione: il draft viaggia nel link (#d=...) con gli id ufficiali degli eroi ---------- */
function draftCode() {
  var ids = function (t) { return t.map(function (h) { return h && HX[h] ? HX[h].id : 0 }).join(".") };
  return "a" + ids(S.ally) + "_e" + ids(S.enemy) + "_x" + ids(S.banA) + "_y" + ids(S.banE) + "_l" + S.allyLane.map(function (l, i) { return S.ally[i] && l || "-" }).join("") +
    (S.enemyLane.some(function (l, i) { return l && S.enemy[i] }) ? "_m" + S.enemyLane.map(function (l, i) { return S.enemy[i] && l || "-" }).join("") : "");
}
function readCode(c) {
  var o = {}, k = { a: "ally", e: "enemy", x: "banA", y: "banE" };
  String(c || "").split("_").forEach(function (part) {
    var t = part.charAt(0), v = part.slice(1);
    if (k[t]) o[k[t]] = sanitizeTeam(v.split(".").map(function (n) { return ID2[+n] || null }));
    else if (t === "l" || t === "m") o[t === "l" ? "allyLane" : "enemyLane"] = v.slice(0, 5).split("").map(function (l) { return LN[l] ? l : null });
  });
  if (!o.ally && !o.enemy && !o.banA && !o.banE) return null;
  ["ally", "enemy", "banA", "banE"].forEach(function (t) { o[t] = o[t] || [null, null, null, null, null] });
  while (!o.allyLane || o.allyLane.length < 5) o.allyLane = (o.allyLane || []).concat([null]);
  while (!o.enemyLane || o.enemyLane.length < 5) o.enemyLane = (o.enemyLane || []).concat([null]);
  var seen = {}; ["ally", "enemy", "banA", "banE"].forEach(function (t) { o[t] = o[t].map(function (h) { if (!h || seen[h]) return null; seen[h] = 1; return h }) });
  o.allyLane = o.allyLane.map(function (l, i) { return o.ally[i] ? l : null }); o.enemyLane = o.enemyLane.map(function (l, i) { return o.enemy[i] ? l : null });
  return o;
}
/* ---------- storico partite: esito dei draft completati ---------- */
var gameMe = null, gameMsg = "";
function resultBox() {
  if (S.ally.indexOf(null) > -1) return gameMsg ? '<div class="alert good"><span class="g">' + IC.check + '</span><span>' + gameMsg + '</span></div>' : "";
  if (S.ally.indexOf(gameMe) < 0) gameMe = null;
  return '<div class="card"><div class="ph">' + IC.medal + ' Com’è andata la partita?</div><div class="k" style="margin-bottom:6px">Il tuo eroe (facoltativo)</div><div class="chips" id="gme" style="margin:0 0 10px;padding:0;flex-wrap:wrap"></div>' +
    '<div class="two"><button class="btn sm" id="gwin" style="border-color:var(--green);color:var(--green)">Vittoria</button><button class="btn rd sm" id="glose">Sconfitta</button></div><p class="hint">La partita va nello Storico (Gioca) e il draft si svuota per la prossima.</p></div>';
}
function resultBind() {
  if (!$("gwin")) return;
  S.ally.forEach(function (h) { var b = document.createElement("button"); b.className = "chip" + (gameMe === h ? " on" : ""); b.textContent = h; b.onclick = function () { gameMe = gameMe === h ? null : h; rDraft() }; $("gme").appendChild(b) });
  var rec = function (w) {
    S.games = S.games.concat([{ d: Date.now(), r: w ? 1 : 0, a: S.ally.slice(), e: S.enemy.slice(), me: gameMe }]).slice(-300);
    S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; S.allyLane = [null, null, null, null, null];
    gameMsg = "Partita salvata: " + (w ? "vittoria" : "sconfitta") + (gameMe ? " con " + gameMe : "") + ". Draft pronto per la prossima."; gameMe = null; focus = null; save(); rDraft(); $("v-draft").scrollTop = 0;
    fxResult(w); var run = winRun(); if (w && run >= 2) setTimeout(function () { fxStreak(run, "vittorie") }, 1500);
  };
  $("gwin").onclick = function () { rec(true) }; $("glose").onclick = function () { rec(false) };
}
/* statistiche: per eroe giocato, per eroe in squadra e per eroe nemico (almeno 2 partite) */
function gameStats() {
  var G = S.games, me = {}, al = {}, vs = {}, add = function (o, h, r) { if (!h) return; o[h] = o[h] || { g: 0, w: 0 }; o[h].g++; o[h].w += r };
  G.forEach(function (x) { add(me, x.me, x.r); (x.a || []).forEach(function (h) { add(al, h, x.r) }); (x.e || []).forEach(function (h) { add(vs, h, x.r) }) });
  var list = function (o, min) { return Object.keys(o).filter(function (h) { return H[h] && o[h].g >= min }).map(function (h) { return { n: h, g: o[h].g, w: Math.round(100 * o[h].w / o[h].g) } }) };
  return { n: G.length, w: G.filter(function (x) { return x.r }).length, me: list(me, 1).sort(function (a, b) { return b.g - a.g || b.w - a.w }), al: list(al, 2).filter(function (x) { return x.w > 50 }).sort(function (a, b) { return b.w - a.w || b.g - a.g }), vs: list(vs, 2).filter(function (x) { return x.w < 50 }).sort(function (a, b) { return a.w - b.w || b.g - a.g }) };
}
function histCard() {
  var st = gameStats();
  if (!st.n) return '<div class="card"><div class="ph">' + IC.medal + ' Storico partite</div><p class="hint">Ancora nessuna partita. Completa un draft (5 alleati) e segna Vittoria o Sconfitta: qui vedrai con quali eroi vinci di più.</p></div>';
  var row = function (x) { return '<div class="kv"><span class="who" style="gap:8px">' + tile(x.n, "xs") + '<span>' + esc(x.n) + '</span></span><span><span class="k">' + x.g + ' partite</span> <b class="' + (x.w >= 55 ? "g" : x.w >= 45 ? "a" : "r") + '">' + x.w + '%</b></span></div>' };
  var last = S.games.slice(-15).map(function (x) { return '<i class="' + (x.r ? "w" : "l") + '" title="' + new Date(x.d).toLocaleDateString("it-IT") + (x.me ? " · " + esc(x.me) : "") + '">' + (x.r ? "V" : "S") + '</i>' }).join("");
  return '<div class="card rows"><div class="ph">' + IC.medal + ' Storico partite</div>' +
    '<div class="kv"><span>Partite segnate</span><b>' + st.n + '</b></div><div class="kv"><span>Vittorie</span><b class="' + (st.w / st.n >= .5 ? "g" : "r") + '">' + st.w + ' (' + Math.round(100 * st.w / st.n) + '%)</b></div>' +
    '<div class="k">Ultime partite</div><div class="gdots">' + last + '</div>' +
    (st.me.length ? '<div class="k">I tuoi eroi</div>' + st.me.slice(0, 5).map(row).join("") : '') +
    (st.al.length ? '<div class="k">Con questi in squadra vinci di più</div>' + st.al.slice(0, 3).map(row).join("") : '') +
    (st.vs.length ? '<div class="k">Nemici più difficili</div>' + st.vs.slice(0, 3).map(row).join("") : '') +
    (st.al.length || st.vs.length ? '' : '<p class="hint">Compagni e nemici compaiono quando un eroe ha almeno 2 partite.</p>') +
    '<div class="set"><span><b>Cancella storico</b><small>Elimina tutte le partite segnate</small></span><button class="btn rd sm" id="ghx">Cancella</button></div></div>';
}
function rGames() {
  var v = $("v-games");
  v.innerHTML = '<div class="ttl"><div><h2>Storico partite</h2><p>Le partite segnate a fine draft</p></div></div>' + histCard();
  if ($("ghx")) $("ghx").onclick = function () { ask("Cancellare lo storico?", { text: "Tutte le partite segnate verranno eliminate.", ok: "Cancella", danger: 1 }, function () { S.games = []; save(); rGames() }) };
}
function shareUrl() { return location.href.split("#")[0] + "#d=" + draftCode() }
function shareDraft(btn) {
  var url = shareUrl(), done = function (t) { btn.textContent = t; setTimeout(function () { if (btn.isConnected) btn.textContent = "Condividi draft" }, 2500) };
  var txt = "Draft MLBB TOP: " + S.ally.filter(Boolean).join(", ") + (en().length ? " contro " + en().join(", ") : "");
  if (navigator.share) { navigator.share({ title: "Draft MLBB TOP", text: txt, url: url }).then(function () { done("Condiviso ✓") }).catch(function () { }); return }
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { done("Link copiato ✓") }).catch(function () { prompt("Copia il link del draft:", url) }); return }
  prompt("Copia il link del draft:", url);
}
function loadShared() {
  var m = /[#&]d=([^&]*)/.exec(location.hash); if (!m) return false;
  history.replaceState(null, "", location.href.split("#")[0]);
  var o = readCode(decodeURIComponent(m[1]));
  if (!o) { toast("Link del draft non valido.", "err"); return false }
  var open = function () { S.ally = o.ally; S.enemy = o.enemy; S.banA = o.banA; S.banE = o.banE; S.allyLane = o.allyLane; S.enemyLane = o.enemyLane; focus = null; save() };
  /* con un draft già in corso si chiede prima: la risposta arriva dopo, quindi qui si risponde false e si apre il draft dopo la conferma */
  if (used().length) { ask("Aprire il draft condiviso?", { text: "Sostituisce il draft che hai in corso.", ok: "Apri" }, function () { open(); go("draft") }); return false }
  open(); return true;
}
window.addEventListener("hashchange", function () { if (loadShared()) go("draft") });
function slots(el, team, side) {
  for (var i = 0; i < 5; i++)(function (i) {
    var wrap = document.createElement("div"), b = document.createElement("button"), h = team[i];
    wrap.className = "srow"; wrap.style.marginTop = i ? "6px" : "0";
    var gn = guideNow(); b.className = "slot" + (h ? " on" : "") + (gn && gn.t === (side ? "pA" : "pE") && team.indexOf(null) === i ? " now" : "") + (h && fxTake("slot", (side ? "a" : "e") + i) ? " lock " + (side ? "la" : "le") : "");
    b.innerHTML = h ? tile(h, "sm") + '<span class="nm">' + h + '</span>' + (side ? '<span class="ed" aria-hidden="true">' + IC.pen + '</span>' : "") : "Slot libero";
    if (h && side) b.setAttribute("aria-label", "Modifica slot alleato " + (i + 1) + ": " + h);
    b.onclick = function () {
      if (h && side) openPick("Slot alleato " + (i + 1) + " · " + h, [h].concat(free()), function (n) { setSlot(team, i, n); rDraft() }, { cur: h, quick: 1, rm: function () { team[i] = null; S.allyLane[i] = null; focus = null; save(); rDraft() } });
      else if (h) { team[i] = null; S.enemyLane[i] = null; focus = null; save(); rDraft() }
      else openPick("Scegli l’eroe " + (side ? "alleato" : "nemico"), free(), function (n) { setSlot(team, i, n); rDraft() }, { quick: 1 });
    };
    wrap.appendChild(b);
    if (h) {
      /* lane: automatica (dalle build ufficiali) finché non la scegli; ogni tocco passa alla successiva */
      var arr = side ? S.allyLane : S.enemyLane, man = arr[i], cur = side ? laneOfAlly(i) : laneOfEnemy(h), lb = document.createElement("button");
      lb.className = "lnb" + (man ? " man" : "") + (cur ? "" : " none"); lb.textContent = cur ? LS3[cur] : "—";
      lb.setAttribute("aria-label", "Lane di " + h + ": " + (cur ? LN[cur] : "nessuna") + (man ? " (scelta da te)" : " (automatica)") + ". Tocca per cambiare");
      lb.title = man ? "Scelta da te · tocca per cambiare" : "Automatica · tocca per sceglierla";
      lb.onclick = function () { var ord = [null].concat(H[h].l.split(""), LANES.filter(function (l) { return H[h].l.indexOf(l) < 0 })), k = ord.indexOf(man), nx = (k + 1) % ord.length; if (man == null && ord[nx] === cur) nx = (nx + 1) % ord.length; arr[i] = ord[nx]; focus = null; save(); rDraft() };
      wrap.appendChild(lb)
    }
    el.appendChild(wrap);
  })(i);
}
