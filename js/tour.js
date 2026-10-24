/* MLBB TOP - Tutorial della prima apertura: Lunox entra dal basso e spiega i tasti principali, illuminando quello di cui parla.
   Parte dopo la configurazione iniziale (S.tour non ancora visto); si rivede da Impostazioni → Info. */
var TOUR = [
  { v: "home", t: "Ciao! Sono Lunox. Ti mostro in un attimo come usare MLBB TOP per vincere più draft." },
  { v: "home", s: "#nav", t: "Qui sotto ci sono le sezioni: Gioca per il draft, Studia per eroi e tier list, Io per profilo e storico." },
  { v: "draft", s: "#dbs", t: "Questo è il Draft live. Tocca qui per scegliere il draft guidato (ranked o torneo), il criterio dei consigli e la tua lane." },
  { v: "draft", s: "#qebox", t: "Inserimento rapido: scrivi 2-3 lettere dell'eroe nemico e premi Invio. Più veloce del timer del draft!" },
  { v: "draft", s: ".teamh", t: "Qui ci sono le squadre: tocca uno slot per scegliere un eroe. «Azzera pick» svuota le squadre." },
  { v: "draft", s: "#undo", t: "Sbagliato eroe? «Annulla» toglie l'ultimo inserito." },
  { v: "draft", s: 'details[data-f="bans"] > summary', t: "Nella fase dei ban ti suggerisco chi bannare: gli eroi più forti del meta e quelli che counterano il tuo pool." },
  { v: "draft", s: 'details[data-f="recs"] > summary', t: "Qui ci sono i pick consigliati per ogni lane, con il perché: counter, sinergia, meta e i tuoi eroi. Tocca un eroe per vedere la scheda." },
  { v: "draft", s: 'details[data-f="lane"] > summary', t: "Lane 1v1: chi vince ogni scontro di lane tra te e l'avversario diretto. Tocca una lane per i consigli su come giocarla." },
  { v: "draft", s: "#subnav", t: "Guida ti dà build, spell ed emblema contro i nemici; Confronto mette due eroi faccia a faccia; Storico tiene le tue partite." },
  { v: "draft", s: "#srch", t: "Con la lente cerchi eroi, oggetti, talenti e schermate da ovunque nell'app." },
  { v: "draft", s: "#act", t: "Qui trovi il tuo profilo e le impostazioni: temi, lingua, backup." },
  { v: "draft", s: "#gwin", full: true, t: "A fine partita segna Vittoria o Sconfitta: imparo quali eroi ti funzionano e miglioro i consigli." },
  { v: "draft", t: "Ah, un'ultima cosa: scusa ma non posso aiutarti se hai dei bot come compagni. 😅" },
  { v: "draft", t: "È tutto! Scegli i nemici e io ti dirò chi pickare. Buona partita, che la luce e il caos siano con te!" }
];
/* draft di esempio durante il tutorial, così le sezioni mostrano eroi e consigli veri; alla fine (o alla prossima apertura, se l'app viene chiusa a metà) torna il draft di prima */
var TDEMO = { ally: ["Tigreal", "Ling", null, null, null], enemy: ["Gloo", "Moskov", "Kagura", null, null], banA: ["Masha", "Fanny", null, null, null], banE: ["Hayabusa", "Chou", null, null, null] };
var TKEYS = ["ally", "enemy", "banA", "banE", "allyLane", "enemyLane", "guide", "only"];
function tourDemo(on) {
  if (on && !S.tourBak) { S.tourBak = JSON.stringify(TKEYS.map(function (k) { return S[k] })); Object.keys(TDEMO).forEach(function (k) { S[k] = TDEMO[k].slice() }); S.allyLane = [null, null, null, null, null]; S.enemyLane = [null, null, null, null, null]; S.guide = null; S.only = false }
  else if (!on && S.tourBak) { var v = JSON.parse(S.tourBak); TKEYS.forEach(function (k, j) { S[k] = v[j] }); delete S.tourBak; focus = null; save(); if (cur === "draft") rDraft() }
}
/* app chiusa a metà tutorial: rimette il draft vero */
if (S.tourBak) tourDemo(false);
function tourStart() {
  var i = 0, d = $("tour"); if (d) d.remove();
  d = document.createElement("div"); d.id = "tour"; d.className = "tour in";
  d.innerHTML = '<div class="tspot" id="tspot"></div><div class="tbox"><img class="tlx" src="img/lunox-full.webp" alt="Lunox">' +
    '<div class="tbub"><b>Lunox</b><p id="ttx"></p><div class="tnav"><button class="lnk" id="tskip">Salta</button><span class="tdots" id="tdots"></span><button class="btn p sm" id="tnext">Avanti</button></div></div></div>';
  document.querySelector(".app").appendChild(d);
  var timer, end = function () { clearInterval(timer); tourDemo(false); S.tour = true; save(); d.classList.add("out"); setTimeout(function () { d.remove() }, 300) };
  var show = function () {
    var st = TOUR[i]; if (st.v === "draft" && !S.tourBak) { tourDemo(true); if (cur === "draft") rDraft() }
    if (st.full) { S.ally = ["Tigreal", "Ling", "Valir", "Layla", "Paquito"]; rDraft() }
    if (cur !== st.v) go(st.v);
    if (st.s && st.s.indexOf("details") === 0) { var f = document.querySelector(st.s.split(" >")[0]); if (f) f.open = true }
    var el = st.s && document.querySelector(st.s), sp = $("tspot");
    if (el) { var sc = el.closest(".scr"); if (sc) sc.scrollTop += el.getBoundingClientRect().top - sc.getBoundingClientRect().top - 12; else el.scrollIntoView({ block: "center" }); var r = el.getBoundingClientRect(), a = d.getBoundingClientRect(); sp.style.cssText = "display:block;left:" + (r.left - a.left - 6) + "px;top:" + (r.top - a.top - 6) + "px;width:" + (r.width + 12) + "px;height:" + (r.height + 12) + "px" }
    else sp.style.cssText = "display:block;left:50%;top:40%;width:0;height:0";
    d.classList.toggle("up", !!el && el.getBoundingClientRect().top > d.getBoundingClientRect().height * .55);
    var tx = tr(st.t), k = 0, p = $("ttx"); p.textContent = ""; clearInterval(timer);
    timer = setInterval(function () { k += 2; p.textContent = tx.slice(0, k); if (k >= tx.length) clearInterval(timer) }, 18);
    $("tdots").innerHTML = TOUR.map(function (x, j) { return '<i' + (j === i ? ' class="on"' : '') + '></i>' }).join("");
    $("tnext").textContent = tr(i === TOUR.length - 1 ? "Iniziamo!" : "Avanti");
    var b = d.querySelector(".tbox"); b.classList.remove("pop"); void b.offsetWidth; if (i) { d.classList.remove("in"); b.classList.add("pop") }
  };
  $("tnext").onclick = function () { if (++i >= TOUR.length) end(); else show() };
  $("tskip").onclick = end;
  show();
}
