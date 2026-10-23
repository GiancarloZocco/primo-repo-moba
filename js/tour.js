/* MLBB TOP - Tutorial della prima apertura: Lunox entra dal basso e spiega i tasti principali, illuminando quello di cui parla.
   Parte dopo la configurazione iniziale (S.tour non ancora visto); si rivede da Impostazioni → Info. */
var TOUR = [
  { v: "home", t: "Ciao! Sono Lunox. Ti mostro in un attimo come usare MLBB TOP per vincere più draft." },
  { v: "home", s: "#nav", t: "Qui sotto ci sono le sezioni: Gioca per il draft, Studia per eroi e tier list, Io per profilo e storico." },
  { v: "draft", s: "#dbs", t: "Questo è il Draft live. Tocca qui per scegliere il draft guidato (ranked o torneo), il criterio dei consigli e la tua lane." },
  { v: "draft", s: "#qebox", t: "Inserimento rapido: scrivi 2-3 lettere dell'eroe nemico e premi Invio. Più veloce del timer del draft!" },
  { v: "draft", s: ".teamh", t: "Qui ci sono le squadre: tocca uno slot per scegliere un eroe. «Azzera pick» svuota le squadre." },
  { v: "draft", s: "#undo", t: "Sbagliato eroe? «Annulla» toglie l'ultimo inserito." },
  { v: "draft", s: "#srch", t: "Con la lente cerchi eroi, oggetti, talenti e schermate da ovunque nell'app." },
  { v: "draft", s: "#act", t: "Qui trovi il tuo profilo e le impostazioni: temi, lingua, backup." },
  { v: "draft", t: "È tutto! Scegli i nemici e io ti dirò chi pickare. Buona partita, che la luce e il caos siano con te!" }
];
function tourStart() {
  var i = 0, d = $("tour"); if (d) d.remove();
  d = document.createElement("div"); d.id = "tour"; d.className = "tour in";
  d.innerHTML = '<div class="tspot" id="tspot"></div><div class="tbox"><img class="tlx" src="img/lunox-full.webp" alt="Lunox">' +
    '<div class="tbub"><b>Lunox</b><p id="ttx"></p><div class="tnav"><button class="lnk" id="tskip">Salta</button><span class="tdots" id="tdots"></span><button class="btn p sm" id="tnext">Avanti</button></div></div></div>';
  document.querySelector(".app").appendChild(d);
  var timer, end = function () { clearInterval(timer); S.tour = true; save(); d.classList.add("out"); setTimeout(function () { d.remove() }, 300) };
  var show = function () {
    var st = TOUR[i]; if (cur !== st.v) go(st.v);
    var el = st.s && document.querySelector(st.s), sp = $("tspot");
    if (el) { el.scrollIntoView({ block: "center" }); var r = el.getBoundingClientRect(), a = d.getBoundingClientRect(); sp.style.cssText = "display:block;left:" + (r.left - a.left - 6) + "px;top:" + (r.top - a.top - 6) + "px;width:" + (r.width + 12) + "px;height:" + (r.height + 12) + "px" }
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
