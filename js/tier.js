/* MLBB TOP - Schermata Tier list */
/* ---------- TIER LIST ---------- */
var TIERS = { SS: ["OP / Priorità assoluta", "First pick o ban: win rate e ban rate al top"], S: ["Meta dominante", "Solide scelte per draft competitivo"], A: ["Scelte solide", "Affidabili nella maggior parte dei draft"], B: ["Situazionali", "Da scegliere contro composizioni precise"] };
var SORTK = { wr: ["Win rate", "wr"], br: ["Ban rate", "br"], pr: ["Pick rate", "pr"], ci: ["Counter", "ci"] };
var RKN = { all: "Tutti i rank", myth: "Mitico", glory: "Gloria Mitica" };
function srcPill() { return '<span class="pill am">' + IC.trend + ' ' + (META.live ? "Live " : "Dati ") + META.date + '</span>' }
function rTier() {
  var v = $("v-tier");
  v.innerHTML = '<div class="ttl"><div><h2>Meta Tier List<i></i></h2><p>' + NAMES.length + ' eroi · ' + RKN[S.rk] + ' · ' + META.win + '</p></div>' + srcPill() + '</div>' +
    '<div class="chips" id="tchips"></div><div class="card"><div class="search">' + IC.search + '<input id="tq" placeholder="Cerca eroe o counter..." aria-label="Cerca eroe o counter" value="' + esc(tq) + '"><button id="tqx" aria-label="Cancella">' + IC.x + '</button></div><div class="srt"><span class="k">Rank:</span><div class="seg" id="trk"></div></div><div class="srt"><span class="k">Ordina:</span><div class="seg" id="tsort"></div></div></div><div id="tlist" class="rows" style="gap:14px"></div>';
  [["all", "Tutti i ruoli"]].concat(Object.keys(R).map(function (k) { return [k, R[k]] })).forEach(function (c) { var b = document.createElement("button"); b.className = "chip" + (tf === c[0] ? " on" : ""); b.textContent = c[1]; b.onclick = function () { tf = c[0]; rTier() }; $("tchips").appendChild(b) });
  Object.keys(SORTK).forEach(function (k) { var b = document.createElement("button"); b.textContent = SORTK[k][0]; b.className = tsort === k ? "on" : ""; b.onclick = function () { tsort = k; rTier() }; $("tsort").appendChild(b) });
  Object.keys(RKN).forEach(function (k) { var b = document.createElement("button"); b.textContent = RKN[k]; b.className = S.rk === k ? "on" : ""; b.onclick = function () { S.rk = k; save(); calcMeta(); rTier() }; $("trk").appendChild(b) });
  $("tq").oninput = function () { tq = this.value; fillTier() }; $("tqx").onclick = function () { tq = ""; $("tq").value = ""; fillTier() };
  fillTier();
}
function rlab(h) { return H[h].r === "X" ? "MM" : R[H[h].r].slice(0, 3).toUpperCase() }
var tOpen = { SS: 1, S: 1, A: 0, B: 0 };
function fillTier() {
  var q = tq.toLowerCase(), L = $("tlist"); L.innerHTML = "";
  var list = NAMES.filter(function (h) { return (tf === "all" || H[h].r === tf) && (h.toLowerCase().indexOf(q) > -1 || (q && topCounters(h, 3).some(function (n) { return n.toLowerCase().indexOf(q) > -1 }))) });
  ["SS", "S", "A", "B"].forEach(function (t) {
    var open = tOpen[t] || !!q, hs = list.filter(function (h) { return M[h].tier === t }).sort(function (a, b) { return (M[b][tsort] || 0) - (M[a][tsort] || 0) }); if (!hs.length) return;
    var sec = document.createElement("div"); sec.className = "rows"; sec.style.gap = "10px";
    sec.innerHTML = '<div class="tierh"><span class="tb ' + t + '">TIER ' + t + '</span><div class="t"><b>' + TIERS[t][0] + '</b><small>' + TIERS[t][1] + '</small></div><span class="pill ' + (t === "SS" ? "am" : "bl") + '">' + hs.length + ' eroi ' + (open ? "▲" : "▼") + '</span></div>';
    sec.firstChild.onclick = function () { tOpen[t] = !tOpen[t]; fillTier() }; sec.firstChild.style.cursor = "pointer";
    if (!open) { } else if (t === "SS") {
      hs.slice(0, 1).forEach(function (h, i) {
        var m = M[h], c = topCounters(h, 2), d = document.createElement("div"); d.className = "tcard" + (i === 0 ? " top" : "");
        d.innerHTML = '<div class="hd">' + tile(h, "lg", rlab(h)) + '<div style="flex:1;min-width:0"><div class="nm">' + h + '</div><div class="sub"><span class="pill gr" style="font-size:9.5px">#' + m.rrank + ' ' + R[H[h].r] + '</span> ' + lanes(h) + '</div></div><span class="pill rd" style="font-size:9.5px">Diff. ' + diffL(h) + '</span></div>' +
          '<div class="mets"><div class="met"><div class="k">Win rate</div><b class="g">' + pc(m.wr) + '</b>' + dTag(h) + bar(Math.max(5, Math.min(100, ((m.wr || 50) - 40) * 5)), "var(--green)") + '</div><div class="met"><div class="k">Ban rate</div><b class="r">' + pc(m.br) + '</b>' + bar(Math.min(100, m.br || 0), "#FCA5A5") + '</div><div class="met"><div class="k">Pick rate</div><b class="b">' + pc(m.pr) + '</b>' + bar(Math.min(100, (m.pr || 0) * 40), "var(--blue2)") + '</div></div>' +
          '<div class="ft"><span class="a">' + IC.warn + '</span><span style="flex:1">Counter principali: ' + (c.join(", ") || "nessuno") + '</span><button class="lnk">Analisi ›</button></div>';
        d.querySelector(".lnk").onclick = function () { openHero(h) }; sec.appendChild(d)
      }); hs = hs.slice(1)
    }
    if (open && hs.length) {
      var tb = document.createElement("div"); tb.className = "tbl"; tb.innerHTML = '<div class="th"><span>Eroe & ruolo</span><span>WR</span><span>Ban</span><span>Pick</span></div>';
      hs.forEach(function (h) {
        var m = M[h], b = document.createElement("button"); b.className = "tr"; b.style.setProperty("--i", Math.min(tb.children.length, 14));
        b.innerHTML = '<span class="who">' + tile(h, "", rlab(h)) + '<span style="min-width:0"><b>' + h + '</b><small>' + roleLane(h) + '</small></span></span><span class="' + (m.wr >= 52 ? "g" : m.wr >= 49 ? "a" : "r") + '">' + pc(m.wr) + dTag(h) + '</span><span>' + pc(m.br) + '</span><span class="b">' + pc(m.pr) + '</span>';
        b.onclick = function () { openHero(h) }; tb.appendChild(b)
      }); sec.appendChild(tb)
    }
    L.appendChild(sec)
  });
  if (!L.children.length) { L.innerHTML = '<p class="hint">Nessun eroe trovato. Prova con un altro nome o filtro.</p>'; return }
  var top = NAMES.filter(function (h) { return M[h].wr != null }).sort(function (a, b) { return M[b].wr - M[a].wr }).slice(0, 3), ban = NAMES.filter(function (h) { return M[h].br != null }).sort(function (a, b) { return M[b].br - M[a].br }).slice(0, 3);
  var mv = NAMES.filter(function (h) { return dWr(h) != null }).sort(function (a, b) { return dWr(b) - dWr(a) }), upL = mv.filter(function (h) { return dWr(h) >= .1 }).slice(0, 3), dnL = mv.filter(function (h) { return dWr(h) <= -.1 }).reverse().slice(0, 3);
  var trend = PREV && (upL.length || dnL.length) ? ' Dal ' + esc(PREV.date) + ': in crescita <span class="g">' + (upL.map(function (h) { return h + " +" + dWr(h).toFixed(1) }).join(", ") || "nessuno") + '</span>, in calo <span class="r">' + (dnL.map(function (h) { return h + " " + dWr(h).toFixed(1) }).join(", ") || "nessuno") + '</span>.' : "";
  var r = document.createElement("div"); r.className = "card radar";
  r.innerHTML = '<div class="hd"><b>' + IC.chart + ' MLBB TOP Radar</b><span class="k">' + RKN[S.rk] + '</span></div>Win rate più alto: <span class="g">' + top.map(function (h) { return h + " " + pc(M[h].wr) }).join(", ") + '</span>. Più bannati: <span class="r">' + ban.map(function (h) { return h + " " + pc(M[h].br) }).join(", ") + '</span>.' + trend + ' I tier sono calcolati per ruolo combinando win rate, pick rate e ban rate ufficiali (' + META.win + '). Fonte: ' + META.src + '.';
  L.appendChild(r);
}
function diffL(h) { var a = HX[h] && HX[h].ab; if (a && a.length === 4) { var f = a[3]; return f >= 75 ? "Estrema" : f >= 60 ? "Alta" : f >= 40 ? "Media" : "Facile" } return diff(h) }
