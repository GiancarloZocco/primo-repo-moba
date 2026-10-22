/* MLBB TOP - Database, scheda eroe e confronto 1 contro 1 */
/* ---------- HEROES ---------- */
function rHeroes() {
  var v = $("v-heroes"), T = { her: "Eroi", itm: "Oggetti", emb: "Talenti", spl: "Spell" };
  v.innerHTML = '<div class="ttl"><div><h2>Database<i></i></h2><p>' + NAMES.length + ' eroi · ' + Object.keys(ITEMS).length + ' oggetti · ' + Object.keys(TAL).length + ' talenti · ' + Object.keys(SPL).length + ' spell</p></div></div><div class="seg" id="hsub"></div>' + (hsub === "her" ? '<button class="btn sm" id="cmpo">' + IC.swap + ' Confronta due eroi</button>' : '') + '<div class="search">' + IC.search + '<input id="hq" placeholder="Cerca..." aria-label="Cerca" value="' + esc(hq) + '"></div><div class="chips" id="hchips"></div><div class="rows" id="hlist"></div>';
  Object.keys(T).forEach(function (k) { var b = document.createElement("button"); b.textContent = T[k]; b.className = hsub === k ? "on" : ""; b.onclick = function () { hsub = k; hq = ""; rHeroes() }; $("hsub").appendChild(b) });
  var ch = hsub === "her" ? [["all", "Tutti"]].concat(Object.keys(R).map(function (k) { return [k, R[k]] })) : hsub === "itm" ? [["all", "Tutti"]].concat(ITYPES.map(function (t) { return [t, ITN[t] || t] })) : [];
  ch.forEach(function (c) { var cur = hsub === "her" ? hf : itf, b = document.createElement("button"); b.className = "chip" + (cur === c[0] ? " on" : ""); b.textContent = c[1]; b.onclick = function () { if (hsub === "her") hf = c[0]; else itf = c[0]; rHeroes() }; $("hchips").appendChild(b) });
  $("hq").oninput = function () { hq = this.value; fillHeroes() }; fillHeroes();
  if ($("cmpo")) $("cmpo").onclick = function () { openPick("Primo eroe da confrontare", NAMES, function (a) { setTimeout(function () { openPick("Confronta " + a + " con…", NAMES.filter(function (n) { return n !== a }), function (b) { cmpA = a; cmpB = b; go("cmp") }, { quick: 1 }) }, 50) }, { quick: 1 }) };
}
var ITN = { Attack: "Attacco", Magic: "Magia", Defense: "Difesa", Movement: "Movimento", Jungling: "Giungla", Jungle: "Giungla", Roaming: "Roam", Roam: "Roam" };
var ITYPES = []; Object.keys(ITEMS).forEach(function (k) { var t = ITEMS[k][1]; if (t && ITYPES.indexOf(t) < 0) ITYPES.push(t) });
function nl(s) { return esc(s).replace(/\n+/g, "<br>") }
function fillHeroes() {
  var q = hq.toLowerCase(), L = $("hlist"); L.innerHTML = "";
  if (hsub === "her") {
    var G = document.createElement("div"); G.className = "hgrid";
    NAMES.filter(function (h) { return (hf === "all" || H[h].r === hf) && h.toLowerCase().indexOf(q) > -1 }).forEach(function (h) {
      var b = document.createElement("button"); b.className = "hg";
      b.innerHTML = '<span class="tb ' + M[h].tier + '">' + M[h].tier + '</span>' + tile(h) + '<b>' + h + '</b><small>' + H[h].l.split("").map(function (k) { return LS[k] }).join("·") + (M[h].wr != null ? ' · ' + M[h].wr.toFixed(0) + '%' : '') + '</small>';
      b.onclick = function () { openHero(h) }; G.appendChild(b)
    });
    if (G.children.length) L.appendChild(G);
  } else if (hsub === "itm") {
    Object.keys(ITEMS).map(function (k) { return ITEMS[k] }).filter(function (it) { return (itf === "all" || it[1] === itf) && it[0].toLowerCase().indexOf(q) > -1 }).sort(function (a, b) { return a[0].localeCompare(b[0]) }).forEach(function (it) {
      var d = document.createElement("details"); d.className = "li dt";
      d.innerHTML = '<summary>' + (it[4] ? '<img class="ico" src="' + it[4] + '" alt="">' : '<span class="ico"></span>') + '<span class="who" style="display:block;min-width:0;flex:1"><b>' + esc(it[0]) + '</b><small>' + (ITN[it[1]] || it[1]) + '</small></span></summary><div class="dd">' + (it[2] ? '<p class="g">' + nl(it[2]) + '</p>' : '') + (it[3] ? '<p>' + nl(it[3]) + '</p>' : '') + '</div>'; L.appendChild(d)
    });
  } else if (hsub === "emb") {
    [1, 2, 3].forEach(function (t) {
      var ks = Object.keys(TAL).filter(function (k) { return TAL[k][2] === t && TAL[k][0].toLowerCase().indexOf(q) > -1 }); if (!ks.length) return;
      var hd = document.createElement("div"); hd.className = "sec"; hd.textContent = "Talenti livello " + t; L.appendChild(hd);
      ks.forEach(function (k) { var x = TAL[k], d = document.createElement("div"); d.className = "ab"; d.innerHTML = '<span class="ic">' + (x[3] ? '<img src="' + x[3] + '" alt="">' : '') + '</span><div><div class="h"><b>' + esc(x[0]) + '</b><small>Tier ' + t + '</small></div><p>' + nl(x[1]) + '</p></div>'; L.appendChild(d) })
    });
  } else {
    Object.keys(SPL).filter(function (k) { return SPL[k][0].toLowerCase().indexOf(q) > -1 }).forEach(function (k) { var x = SPL[k], d = document.createElement("div"); d.className = "ab"; d.innerHTML = '<span class="ic">' + (x[2] ? '<img src="' + x[2] + '" alt="">' : '') + '</span><div><div class="h"><b>' + esc(x[0]) + '</b><small>Spell</small></div><p>' + nl(x[1]) + '</p></div>'; L.appendChild(d) });
  }
  if (!L.children.length) L.innerHTML = '<p class="hint">Nessun risultato. Prova con un altro nome o filtro.</p>';
  if (hsub !== "her") { var p = document.createElement("p"); p.className = "hint"; p.textContent = ITON ? "Testi ufficiali del gioco (MLBB Academy) tradotti in italiano." : "Testi ufficiali in inglese dal gioco (MLBB Academy)."; L.appendChild(p) }
}

/* ---------- HERO DETAIL ---------- */
var SPELL = { j: ["Retribution", "Obbligatoria in giungla: velocizza i mostri e assicura Tartaruga e Lord."], e: ["Vengeance", "Riflette parte dei danni negli scontri prolungati in Exp Lane."], m: ["Flicker", "Riposizionamento istantaneo per schivare o chiudere una combo."], o: ["Flicker", "Fuga d'emergenza o riposizionamento nei teamfight."], r: ["Flicker", "Combo Flicker + CC per ingaggiare a sorpresa."] };
var TIPS = { T: "Apri gli scontri e proteggi il tiratore: la tua vita è la risorsa della squadra.", F: "Gestisci la tua lane e cerca scontri prolungati dove il tuo sustain fa la differenza.", A: "Elimina i bersagli fragili e sparisci: non entrare per primo nei teamfight.", M: "Controlla la mid lane, ruota verso le altre corsie e colpisci dalla seconda linea.", X: "Farma in sicurezza: il tuo danno cresce con gli oggetti, resta dietro la frontline.", S: "Accompagna il jungler e il tiratore, dai visione e salva gli alleati nei momenti chiave." };
var TAGN = { CC: "CC", Damage: "Danni", Heal: "Cura", Mobility: "Mobilità", Buff: "Buff", Debuff: "Debuff", Slow: "Rallenta", Burst: "Burst", Shield: "Scudo", Blink: "Scatto", AoE: "Area", Speedup: "Velocità", Conceal: "Furtività", Reap: "Esecuzione" };
function chips(list, fn) { return '<div class="hchips">' + list.map(function (n) { return H[n] ? '<button class="mrow hc" data-h="' + esc(n) + '">' + tile(n, "sm") + '<span>' + n + '</span>' + (fn ? fn(n) : '') + '</button>' : '' }).join("") + '</div>' }
function rHero() {
  var h = hero, x = H[h], m = M[h], X = HX[h] || {}, st = stats(h), v = $("v-hero"), ab = X.ab && X.ab.length === 4 ? X.ab : null;
  var bars = ab ? [["Durabilità", ab[0], "var(--blue)"], ["Offesa", ab[1], "var(--amber)"], ["Controllo", ab[2], "#C084FC"], ["Difficoltà", ab[3], "var(--green)"]] : [["Durabilità", st.d, "var(--blue)"], ["Offesa", st.o, "var(--amber)"], ["Difficoltà", st.f, "var(--green)"]];
  var ep = X.ti ? X.ti + (X.rg ? " · " + X.rg : "") : x.lore.split(/[,:.]/)[0];
  v.innerHTML = '<div class="strip"><span class="pill bl">' + R[x.r] + ' / ' + x.l.split("").map(function (k) { return LS[k] }).join(" · ") + '</span><span>Tier ' + m.tier + ' · #' + m.rrank + ' ' + R[x.r] + '</span><span class="live"><i></i>' + (m.wr != null ? "Dati ufficiali " + META.date : "Stima offline") + '</span></div>' +
    '<div class="hcard"><div class="top2">' + tile(h, "xl", "DIFF. " + diffL(h).toUpperCase(), X.pt) + '<div style="flex:1;min-width:0"><div class="ep">' + esc(ep) + '</div><div class="nm">' + h + '</div><div class="spec">' + (X.sp && X.sp.length ? "Specialità: " + X.sp.join(", ") : "Tratti: " + traits(h)) + (X.dt ? " · Danni " + ({ Physical: "fisici", Magic: "magici", Mixed: "misti" }[X.dt] || X.dt) : "") + '</div>' +
    bars.map(function (s) { return '<div class="st"><div class="kv"><span>' + s[0] + '</span><span>' + s[1] + ' / 100</span></div>' + bar(s[1], s[2]) + '</div>' }).join("") +
    '</div></div><div class="boxes">' + (m.wr != null ? '<div><span class="k">Win rate</span><b class="' + (m.wr >= 52 ? "g" : m.wr >= 49 ? "a" : "r") + '">' + pc(m.wr) + '</b>' + dTag(h) + '</div><div><span class="k">Ban rate</span><b class="r">' + pc(m.br) + '</b></div><div><span class="k">Pick rate</span><b class="b">' + pc(m.pr) + '</b></div>' : '<div><span class="k">Counter</span><b class="g">' + m.ci + '</b></div><div><span class="k">Sicurezza</span><b class="a">' + m.sf + '</b></div><div><span class="k">Rank ruolo</span><b class="b">#' + m.rrank + '</b></div>') + '</div></div>' +
    '<div class="tabs" id="htabs"></div><div id="hbody" class="rows" style="gap:12px"></div>' +
    '<div class="two"><button class="btn p" id="lock">' + IC.pad + ' Lock-in alleati</button><button class="btn rd" id="lockE">Aggiungi ai nemici</button></div><button class="btn sm" id="cmpb" style="width:100%">' + IC.swap + ' Confronta con un altro eroe</button>';
  [["ab", "Abilità"], ["bd", "Build & emblemi"], ["mu", "Matchup"], ["lo", "Lore"]].forEach(function (t) { var b = document.createElement("button"); b.textContent = t[1]; b.className = htab === t[0] ? "on" : ""; b.onclick = function () { htab = t[0]; rHero() }; $("htabs").appendChild(b) });
  var B = $("hbody"), pos = beats(h), neg = beatenBy(h), tr = x.t.split("");
  if (htab === "ab") {
    var sk = X.sk || [], html = '<div class="sec">' + IC.bolt + ' Abilità<span class="pill am">' + IMP[x.t.indexOf("c") > -1 ? "c" : tr[0]] + '</span></div>';
    html += sk.length ? sk.map(function (s, i) { return '<details class="ab sk2"><summary><span class="ic sk">' + (s.i ? '<img src="' + esc(s.i) + '" alt="" loading="lazy" onerror="this.remove()">' : ABI[tr[0]]) + '</span><span class="sh"><span class="h"><b>' + esc(s.n) + '</b><small>' + (i === 0 ? "Passiva" : (i === sk.length - 1 && sk.length === 4) ? "Suprema" : "Abilità " + i) + '</small></span>' + (s.cd ? '<span class="cd">' + esc(s.cd) + '</span>' : '') + (s.t.length ? '<span class="tags">' + s.t.map(function (t) { return '<span>' + esc(TAGN[t] || t) + '</span>' }).join("") + '</span>' : '') + '</span></summary><p>' + nl(s.d) + '</p></details>' }).join("") + '<p class="hint">Tocca un’abilità per leggere la descrizione.</p>' : '<p class="hint">Abilità non disponibili per questo eroe.</p>';
    html += '<details class="fold"><summary class="sec">' + IC.shield + ' Profilo tattico</summary><div class="rows"><div class="ab"><span class="ic">' + ABI[tr[0]] + '</span><div><div class="h"><b>' + traits(h) + '</b><small>Tratti</small></div><p>' + tr.map(function (t) { return TRD[t] }).join(" ") + '</p></div></div>' +
      '<div class="ab"><span class="ic">' + IC.warn + '</span><div><div class="h"><b>Punto debole</b><small>' + (weakOf(h).map(function (t) { return TR[t] }).join(" · ") || "—") + '</small></div><p>Minacce principali: ' + (topCounters(h, 3).join(", ") || "nessuna diretta") + '.</p></div></div>' +
      '<div class="ab"><span class="ic">' + IC.bulb + '</span><div><div class="h"><b>Come giocarlo</b><small>' + LN[x.l[0]] + '</small></div><p>' + TIPS[x.r] + '</p></div></div></div></details>';
    if (sk.length) html += '<p class="hint">Descrizioni ufficiali delle abilità dalla MLBB Academy' + (ITON ? ', tradotte in italiano.' : ' (in inglese).') + '</p>';
    B.innerHTML = html;
  } else if (htab === "bd") {
    var bd = X.bd || {}, ls = Object.keys(bd);
    if (!ls.length) { B.innerHTML = '<div class="card"><p class="hint">Build ufficiali non disponibili per ' + h + '. Consiglio generico: incantesimo ' + SPELL[x.l[0]][0] + ' — ' + SPELL[x.l[0]][1] + '</p></div>'; }
    else {
      if (ls.indexOf(bdl) < 0) bdl = ls[0];
      var html2 = (en().length ? buildBox(h, bdl) : '') + '<div class="sec">' + IC.shield + ' Build più usate nel rank<span class="pill">' + LN[bdl] + '</span></div>' + (ls.length > 1 ? '<div class="seg" id="bdl"></div>' : '');
      bd[bdl].forEach(function (b, i) {
        html2 += '<details class="card bcard"' + (i === 0 ? " open" : "") + '><summary class="kv"><b class="bt">Build #' + (i + 1) + '</b><span><span class="pill gr">WR ' + b.wr + '%</span> <span class="pill bl">Uso ' + b.pr + '%</span></span></summary>' +
          '<div class="k" style="margin:10px 0 6px">Oggetti core</div><div class="items">' + b.it.map(function (id) { var it = ITEMS[id] || ["#" + id, "", "", "", ""]; return '<button class="item it" data-i="' + id + '">' + (it[4] ? '<img src="' + it[4] + '" alt="">' : '') + '<b>' + esc(it[0]) + '</b><small>' + (ITN[it[1]] || it[1]) + '</small></button>' }).join("") + '</div>' +
          '<div class="k" style="margin:12px 0 6px">Emblema e talenti</div><div class="erow">' + (b.emi ? '<img src="' + esc(b.emi) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '<div><b>' + esc(b.em) + '</b><small>' + esc(b.ea).replace(/\n/g, " · ") + '</small></div></div>' +
          '<div class="emb">' + b.tl.map(function (t) { var z = TAL[t]; return z ? '<div>' + (z[3] ? '<img src="' + z[3] + '" alt="">' : '') + '<b>' + esc(z[0]) + '</b><small>' + esc(z[1]).slice(0, 90) + (z[1].length > 90 ? "…" : "") + '</small></div>' : '' }).join("") + '</div>' +
          (SPL[b.sp] ? '<div class="erow" style="margin-top:10px">' + (SPL[b.sp][2] ? '<img src="' + SPL[b.sp][2] + '" alt="">' : '') + '<div><b>Spell: ' + esc(SPL[b.sp][0]) + '</b><small>' + esc(SPL[b.sp][1]).slice(0, 110) + '…</small></div></div>' : '') + '</details>'
      });
      html2 += '<div id="iinfo"></div><p class="hint">Dati ufficiali MLBB Academy: i 3 oggetti core più usati, con win rate e tasso di utilizzo (' + META.win + '). Tocca un oggetto per i dettagli; completa con stivali e difensivi in base ai nemici.</p>';
      B.innerHTML = html2;
      if (ls.length > 1) ls.forEach(function (l) { var b = document.createElement("button"); b.textContent = LN[l] || l; b.className = l === bdl ? "on" : ""; b.onclick = function () { bdl = l; rHero() }; $("bdl").appendChild(b) });
      [].forEach.call(B.querySelectorAll(".it"), function (b) { b.onclick = function () { var it = ITEMS[b.dataset.i]; if (!it) return; $("iinfo").innerHTML = '<div class="card"><div class="erow">' + (it[4] ? '<img src="' + it[4] + '" alt="">' : '') + '<div><b>' + esc(it[0]) + '</b><small>' + (ITN[it[1]] || it[1]) + '</small></div></div><p class="g" style="font-size:12px">' + nl(it[2]) + '</p><p style="font-size:12px">' + nl(it[3]) + '</p></div>'; $("iinfo").scrollIntoView({ block: "nearest" }) } });
    }
  } else if (htab === "mu") {
    var rel = X.rel || {}, html3 = '<div class="sec">' + IC.swap + ' Analisi matchup & counter</div>';
    function pctf(a) { return function (n) { var v = findInc(a, n); return v == null ? '' : '<span class="' + (v >= 0 ? "g" : "r") + '">' + (v >= 0 ? "+" : "") + v.toFixed(1) + '%</span>' } }
    function names(a) { return (a || []).map(function (z) { return z[0] }) }
    if (rel.strong || rel.weak) {
      html3 += '<div class="card mu1 pos"><h4>' + IC.up + ' Forte contro</h4><p>' + esc(rel.strong && rel.strong.d || "") + '</p>' + chips(rel.strong ? rel.strong.h : []) + '</div>' +
        '<div class="card mu1 neg"><h4>' + IC.down + ' Debole contro</h4><p>' + esc(rel.weak && rel.weak.d || "") + '</p>' + chips(rel.weak ? rel.weak.h : []) + '</div>' +
        '<div class="card mu1 syn"><h4>' + IC.check + ' Sinergia ideale</h4><p>' + esc(rel.assist && rel.assist.d || "") + '</p>' + chips(rel.assist ? rel.assist.h : []) + '</div>';
    }
    if (X.by && X.by.length) html3 += '<div class="mu"><div class="neg"><h4>' + IC.down + ' Lo counterano</h4>' + chips(names(X.by), pctf(X.by)) + '</div><div class="pos"><h4>' + IC.up + ' Domina contro</h4>' + chips(names(X.vs), pctf(X.vs)) + '</div></div>';
    if (X.mate && X.mate.length) html3 += '<div class="mu"><div class="pos"><h4>' + IC.check + ' Compagni migliori</h4>' + chips(names(X.mate), pctf(X.mate)) + '</div><div class="neg"><h4>' + IC.warn + ' Compagni peggiori</h4>' + chips(names(X.bad), pctf(X.bad)) + '</div></div>';
    if (X.by && X.by.length) html3 += '<p class="hint">Percentuali = variazione di win rate nel matchup (dati ufficiali, ' + META.win + '). ' + (ITON ? 'Testi dei matchup ufficiali tradotti in italiano.' : 'Testi dei matchup ufficiali in inglese.') + '</p>';
    function rows(a, cls) { return a.slice(0, 5).map(function (o) { return '<button class="mrow" data-h="' + esc(o.n) + '"><span>' + o.n + '</span><span class="' + cls + '">' + (cls === "g" ? "+" : "-") + o.s + ' ctr</span></button>' }).join("") || '<p>Nessuno nel database.</p>' }
    html3 += '<details class="fold"><summary class="sec">' + IC.bolt + ' Motore tratti MLBB TOP</summary><div class="mu"><div class="pos"><h4>' + IC.up + ' Vantaggio</h4>' + rows(pos, "g") + '</div><div class="neg"><h4>' + IC.down + ' Svantaggio</h4>' + rows(neg, "r") + '</div></div></details>';
    B.innerHTML = html3;
    [].forEach.call(B.querySelectorAll(".mrow"), function (b) { b.onclick = function () { openHero(b.dataset.h, "mu") } });
  } else {
    B.innerHTML = '<div class="card arch"><div class="hd"><span class="a">' + IC.book + '</span><b>Archivio storico: ' + h + '</b><span class="k">Doc #' + String(1000 + (X.id || NAMES.indexOf(h)) * 7).padStart(4, "0") + '</span></div><p>' + x.lore + '</p>' + (X.ds ? '<blockquote>“' + esc(X.ds) + '”</blockquote>' : '') + '</div>' +
      '<div class="card rows">' + [["Titolo", X.ti], ["Regione", X.rg], ["Anno di uscita", X.yr], ["Ruolo ufficiale", (X.rl || []).join(" / ")], ["Lane", lanes(h)], ["Specialità", (X.sp || []).join(", ")], ["Tipo di attacco", { Melee: "Mischia", Ranged: "A distanza", Hybrid: "Ibrido" }[X.at] || X.at], ["Categoria", x.g.split("").map(function (g) { return CAT[g] }).join(", ")]].filter(function (r) { return r[1] }).map(function (r) { return '<div class="kv"><span class="k">' + r[0] + '</span><span>' + esc(r[1]) + '</span></div>' }).join("") + '</div>' +
      '<p class="hint">Titolo, regione e citazione dalla Wiki MLBB (Fandom); riassunto in italiano MLBB TOP.</p>';
  }
  $("lock").onclick = function () { var i = S.ally.indexOf(null); if (used().indexOf(h) < 0 && i > -1) setSlot(S.ally, i, h); go("draft") };
  $("cmpb").onclick = function () { openPick("Confronta " + h + " con…", NAMES.filter(function (n) { return n !== h }), function (n) { cmpA = h; cmpB = n; go("cmp") }, { quick: 1 }) };
  $("lockE").onclick = function () { var i = S.enemy.indexOf(null); if (used().indexOf(h) < 0 && i > -1) setSlot(S.enemy, i, h); go("draft") };
}

/* ---------- CONFRONTO 1 CONTRO 1 ---------- */
var cmpA = null, cmpB = null;
/* variazione di win rate di a quando affronta b (dati ufficiali, in una delle due direzioni) */
function h2h(a, b) {
  var v = findInc(HX[b] && HX[b].by, a); if (v == null) v = findInc(HX[b] && HX[b].vs, a); if (v != null) return v;
  v = findInc(HX[a] && HX[a].by, b); if (v == null) v = findInc(HX[a] && HX[a].vs, b); return v != null ? -v : null;
}
function rCmp() {
  var v = $("v-cmp");
  if (!H[cmpA] || !H[cmpB]) { cmpA = cmpA && H[cmpA] ? cmpA : NAMES[0]; cmpB = cmpB && H[cmpB] && cmpB !== cmpA ? cmpB : NAMES[1] }
  var a = cmpA, b = cmpB, A = HX[a] || {}, B = HX[b] || {}, ma = M[a], mb = M[b];
  var head = function (h, id) { return '<button class="ch" id="' + id + '">' + tile(h, "lg", rlab(h)) + '<b>' + esc(h) + '</b><small>' + roleLane(h) + '</small><span class="tb ' + M[h].tier + '">' + M[h].tier + '</span></button>' };
  /* riga: valori, chi è meglio (1 = a, -1 = b, 0 = pari/non confrontabile) */
  var row = function (lab, va, vb, better) { return '<div class="cr"><span class="' + (better > 0 ? "g" : "") + '">' + va + '</span><span class="k">' + lab + '</span><span class="' + (better < 0 ? "g" : "") + '">' + vb + '</span></div>' };
  var cmpN = function (x, y, hi) { return x == null || y == null || x === y ? 0 : (x > y) === hi ? 1 : -1 };
  var abA = A.ab && A.ab.length === 4 ? A.ab : null, abB = B.ab && B.ab.length === 4 ? B.ab : null;
  var DT = { Physical: "Fisici", Magic: "Magici", Mixed: "Misti" }, AT = { Melee: "Mischia", Ranged: "Distanza", Hybrid: "Ibrido" };
  var rows = row("Win rate", pc(ma.wr), pc(mb.wr), cmpN(ma.wr, mb.wr, true)) + row("Ban rate", pc(ma.br), pc(mb.br), 0) + row("Pick rate", pc(ma.pr), pc(mb.pr), 0) +
    row("Tier ruolo", ma.tier + " #" + ma.rrank, mb.tier + " #" + mb.rrank, H[a].r === H[b].r ? cmpN(ma.rrank, mb.rrank, false) : 0) +
    (abA && abB ? row("Durabilità", abA[0], abB[0], cmpN(abA[0], abB[0], true)) + row("Offesa", abA[1], abB[1], cmpN(abA[1], abB[1], true)) + row("Controllo", abA[2], abB[2], cmpN(abA[2], abB[2], true)) + row("Difficoltà", diffL(a), diffL(b), 0) : row("Difficoltà", diffL(a), diffL(b), 0)) +
    row("Danni", DT[A.dt] || "—", DT[B.dt] || "—", 0) + row("Attacco", AT[A.at] || "—", AT[B.at] || "—", 0) + row("Tratti", traits(a), traits(b), 0);
  var d = h2h(a, b), ta = sc(a, b), tb2 = sc(b, a), duel;
  if (d != null && Math.abs(d) >= .05) duel = '<b class="' + (d > 0 ? "g" : "r") + '">' + esc(d > 0 ? a : b) + '</b> è favorito: ' + esc(a) + ' ha ' + (d > 0 ? "+" : "") + d.toFixed(1) + '% di win rate quando affronta ' + esc(b) + ' (dati ufficiali, ' + META.win + ').';
  else duel = 'Nessun dato ufficiale sullo scontro diretto.';
  var eng = ta.s || tb2.s ? (ta.s >= tb2.s ? cap(ta.w) + " (vantaggio " + esc(a) + ")" : cap(tb2.w) + " (vantaggio " + esc(b) + ")") : "";
  var mate = findInc(A.mate, b); if (mate == null) mate = findInc(B.mate, a); if (mate == null) { mate = findInc(A.bad, b); if (mate == null) mate = findInc(B.bad, a) }
  var ca = topCounters(a, 8), cb = topCounters(b, 8), both = ca.filter(function (n) { return cb.indexOf(n) > -1 });
  v.innerHTML = '<div class="ttl"><div><h2>Confronto<i></i></h2><p>' + RKN[S.rk] + ' · ' + META.win + '</p></div>' + srcPill() + '</div>' +
    '<div class="cmph">' + head(a, "ca") + '<button class="btn sm" id="csw" aria-label="Scambia">' + IC.swap + '</button>' + head(b, "cb") + '</div>' +
    '<div class="card rows cmpt">' + rows + '</div>' +
    '<div class="card rows"><div class="ph">' + IC.swap + ' Scontro diretto</div><p style="margin:0">' + duel + '</p>' + (eng ? '<p class="hint" style="margin:0">Tratti: ' + eng + '.</p>' : '') + '</div>' +
    '<div class="card rows"><div class="ph">' + IC.check + ' Insieme in squadra</div><p style="margin:0">' + (mate != null ? 'In coppia: <b class="' + (mate >= 0 ? "g" : "r") + '">' + (mate >= 0 ? "+" : "") + mate.toFixed(1) + '%</b> di win rate (dati ufficiali).' : 'Nessun dato ufficiale sulla coppia.') + '</p>' +
    '<p class="hint" style="margin:0">Counter in comune: ' + (both.length ? both.map(esc).join(", ") + ' — attenzione se li schierate insieme.' : 'nessuno tra i principali.') + '</p></div>' +
    '<div class="two"><button class="btn sm" id="cha">Scheda ' + esc(a) + '</button><button class="btn sm" id="chb">Scheda ' + esc(b) + '</button></div>';
  var change = function (side) { var other = side ? a : b; openPick("Cambia eroe", NAMES.filter(function (n) { return n !== other }), function (n) { if (side) cmpB = n; else cmpA = n; rCmp() }, { cur: side ? b : a, quick: 1 }) };
  $("ca").onclick = function () { change(0) }; $("cb").onclick = function () { change(1) };
  $("csw").onclick = function () { cmpA = b; cmpB = a; rCmp() };
  $("cha").onclick = function () { openHero(a) }; $("chb").onclick = function () { openHero(b) };
}
