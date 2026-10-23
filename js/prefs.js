/* MLBB TOP - Preferenze del draft (draft guidato, criterio dei consigli, la mia lane) usate in due posti:
   la riga compatta in cima al Draft e la sezione "Draft e consigli" delle Impostazioni.
*/
var CRITD = { bal: "Un po' di tutto: counter, meta, lane, ruoli che mancano e il tuo pool.", meta: "Solo quanto è forte l'eroe nel meta del tuo rank.", lane: "Solo lo scontro con l'avversario diretto: ogni riga consiglia chi batte il nemico di quella lane.", game: "Chi batte tutta la squadra nemica, anche nemici di altre lane (dati ufficiali, tratti e counter segnati da te).", safe: "Come Equilibrato, ma evita gli eroi che i nemici scelti counterano." };
function guideSum() { return S.guide ? (S.gmode === "tour" ? "Torneo" : "Ranked") + " · " + (S.guide === "blue" ? "Primi noi" : "Primi loro") + " · " + S.gbans + " ban" : "Non guidato" }
function myLaneSum() { return S.myLane && S.lane ? LN[S.lane] : "Tutte le lane" }
function prefChanged() { focus = null; save(); if (cur === "draft") rDraft(); else rerender() }
/* bottoni di una scelta: list = [[valore, testo]], get/set leggono e scrivono la preferenza */
function segBtns(el, list, get, set, after) { list.forEach(function (o) { var b = document.createElement("button"); b.textContent = o[1]; b.className = get() === o[0] ? "on" : ""; b.onclick = function () { set(o[0]); prefChanged(); if (after) after() }; el.appendChild(b) }) }
/* after: ridisegna chi contiene i controlli (il menu o la sezione delle Impostazioni) */
function guideCtl(box, after) {
  var again = function () { guideCtl(box, after); if (after) after() };
  box.innerHTML = '<div class="srt"><span class="k">Guidato:</span><div class="seg"></div></div>' + (S.guide ? '<div class="srt"><span class="k">Modalità:</span><div class="seg"></div></div><div class="srt"><span class="k">Ban:</span><div class="seg"></div></div>' : '');
  var s = box.querySelectorAll(".seg");
  segBtns(s[0], [[null, "No"], ["blue", "Primi noi"], ["red", "Primi loro"]], function () { return S.guide }, function (v) { S.guide = v }, again);
  if (S.guide) {
    segBtns(s[1], [["rank", "Ranked"], ["tour", "Torneo"]], function () { return S.gmode === "tour" ? "tour" : "rank" }, function (v) { S.gmode = v }, again);
    segBtns(s[2], [[10, S.gmode === "tour" ? "10" : "10 (Mitico)"], [6, "6"]], function () { return S.gbans }, function (v) { S.gbans = v }, again);
  }
}
/* elenco dei criteri con la spiegazione sotto ciascuno */
function critCtl(box, done) {
  box.innerHTML = ""; box.className = (box.className.replace(/\bopts\b/, "") + " opts").trim();
  Object.keys(CRIT).forEach(function (k) { var b = document.createElement("button"); b.className = "opt1" + (crit() === k ? " on" : ""); b.innerHTML = '<b>' + CRIT[k] + '</b><small>' + CRITD[k] + '</small>'; b.onclick = function () { S.crit = k; if (done) done(); prefChanged() }; box.appendChild(b) });
}
function laneCtl(box, done) {
  box.innerHTML = ""; box.className = (box.className.replace(/\bopts\b/, "") + " opts").trim();
  [[null, "Tutte le lane", "Consigli per ogni lane"]].concat(LANES.map(function (l) { return [l, LN[l], "Solo la riga " + LS3[l] + ", con 6 proposte"] })).forEach(function (o) {
    var on = o[0] ? S.myLane && S.lane === o[0] : !S.myLane, b = document.createElement("button"); b.className = "opt1" + (on ? " on" : ""); b.innerHTML = '<b>' + o[1] + '</b><small>' + o[2] + '</small>';
    b.onclick = function () { if (o[0]) { S.myLane = true; S.lane = o[0] } else S.myLane = false; if (done) done(); prefChanged() }; box.appendChild(b)
  });
}
/* menu che si apre dal basso, sopra la schermata */
function optSheet(title, fill) {
  var d = $("osh"); if (d) d.remove();
  d = document.createElement("div"); d.className = "sheet show"; d.id = "osh";
  d.innerHTML = '<div class="box osb"><div class="kv"><h3>' + esc(title) + '</h3><button class="lnk" id="oshx">Chiudi</button></div><div id="oshb"></div></div>';
  document.querySelector(".app").appendChild(d);
  var close = function () { d.remove() }; d.onclick = function (e) { if (e.target === d) close() }; $("oshx").onclick = close;
  fill($("oshb"), close); return close;
}
function goSettings(sec) { go("settings"); var el = $("sec-" + sec); if (el) el.scrollIntoView({ block: "start" }) }
/* riga in cima al Draft: riepilogo delle scelte, "Cambia" apre un menu con tutte e tre */
function draftBar() { return '<div class="dbar b"><span class="dsum"><b>' + guideSum() + '</b> · ' + CRIT[crit()] + ' · ' + myLaneSum() + '</span><button class="lnk" id="dbs">Cambia ›</button></div>' }
function draftBarBind() {
  if ($("dbs")) $("dbs").onclick = function () {
    optSheet("Draft e consigli", function (b, close) {
      b.innerHTML = '<div class="k">Draft guidato</div><div id="osg"></div><div class="k" style="margin-top:12px">Criterio dei consigli</div><div id="osc"></div><div class="k" style="margin-top:12px">La mia lane</div><div id="osl"></div><button class="btn p sm" id="osok" style="width:100%;margin-top:12px">Fatto</button>';
      var again = function () { critCtl($("osc"), again); laneCtl($("osl"), again); };
      guideCtl($("osg")); again(); $("osok").onclick = close;
    })
  };
}
