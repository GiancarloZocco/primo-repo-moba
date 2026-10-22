/* MLBB TOP - Guida rapida da tenere aperta in partita: piano dal draft, consigli per lane, obiettivi */
var gLane = null;
var LTIP = {
  o: ["Fai l'ultimo colpo ai minion: l'oro della Gold Lane serve per il late game.", "Tieni l'onda vicino alla tua torre se l'avversario è più forte.", "Raggiungi il jungler al Turtle quando la tua onda è pulita.", "Sei il danno principale del late: non morire, stai dietro al tank nei teamfight."],
  e: ["Gestisci l'onda: spingi prima di ruotare, così non perdi esperienza.", "Attento al roamer e al jungler nemici che vengono a cercarti.", "Aiuta al Turtle e al Lord: sei spesso il primo a entrare o a fare da muro.", "Quando il Lord è preso, fai split push sul lato opposto al gruppo."],
  m: ["Pulisci l'onda velocemente, poi ruota sulle altre lane.", "Nei primi minuti aiuta il jungler a prendere i buff e a contendere il fiume.", "Controlla i cespugli del fiume prima di avanzare.", "Nei teamfight colpisci da dietro: punta i nemici più fragili."],
  j: ["Parti dal buff più sicuro e completa il giro prima del primo Turtle.", "Tieni Retribution per Turtle e Lord: chi la usa per ultimo prende l'obiettivo.", "Ganka le lane con l'onda spinta verso la torre nemica.", "Avvisa la squadra prima degli obiettivi e guarda dove sono i nemici sulla minimappa."],
  r: ["Accompagna Gold Lane e jungler nei primi minuti.", "Dai visione nei cespugli prima che la squadra passi.", "Inizia tu i teamfight o proteggi il carry, a seconda del tuo eroe.", "Non farmare: lascia oro ed esperienza ai compagni."]
};
var PHASES = [
  ["Inizio · circa 0–5 min", ["Stai nella tua lane e prendi più minion possibile.", "Il primo Turtle arriva nei primi minuti (circa al 2°): il jungler lo prende con Mid e Roam.", "Non inseguire nella nebbia: i gank arrivano dai cespugli del fiume."]],
  ["Metà partita · circa 5–12 min", ["Muovetevi insieme: le torri esterne cadono più facilmente in 3–4.", "Il Lord compare a metà partita (circa all'8°): prendetelo dopo un teamfight vinto, mai con nemici vivi vicino.", "Dopo ogni fight vinto: torre o obiettivo, poi tornate a farmare."]],
  ["Fine partita · oltre 12 min", ["Un errore costa la partita: restate in gruppo e non fatevi prendere da soli.", "Il Lord diventa più forte e spinge una lane da solo: usatelo per aprire la base.", "Morire ora vuol dire tempi di respawn lunghi: aspettate i compagni prima di entrare."]]
];
/* consigli presi dal draft attuale (alleati e nemici) */
function draftPlan() {
  var al = S.ally.filter(Boolean), foes = en(), out = [];
  if (!al.length && !foes.length) return out;
  var cnt = function (list, f) { return list.filter(f) }, ci = cnt(al, function (h) { return H[h].g.indexOf("i") > -1 }), as = cnt(al, function (h) { return H[h].r === "A" || H[h].t.indexOf("b") > -1 });
  var carry = cnt(foes, function (h) { return H[h].r === "X" || H[h].r === "M" }), fa = cnt(foes, function (h) { return H[h].r === "A" }), fc = cnt(foes, function (h) { return H[h].t.indexOf("c") > -1 }), fs = cnt(foes, function (h) { return H[h].t.indexOf("s") > -1 });
  if (ci.length) out.push(["g", "Cercate i teamfight vicino agli obiettivi: " + few(ci) + (ci.length > 1 ? " possono" : " può") + " aprire lo scontro, entrate subito dopo."]);
  else if (as.length >= 2) out.push(["g", "Puntate sugli scontri rapidi: " + few(as) + " eliminano i nemici isolati, cercateli ai lati della mappa."]);
  else if (al.length >= 3) out.push(["g", "Senza un iniziatore forte: lasciate entrare i nemici e contrattaccate, non attaccate per primi."]);
  if (carry.length) out.push(["a", "Bersagli prioritari: " + few(carry) + " (fanno più danni ma sono fragili)."]);
  if (fa.length) out.push(["r", "Attenti a " + few(fa) + ": state vicini e non giratevi intorno ai cespugli da soli."]);
  if (fc.length >= 2) out.push(["r", few(fc) + " hanno molti controlli: non entrate per primi se non siete il tank."]);
  if (fs.length) out.push(["a", "Comprate presto un oggetto anti-cure contro " + few(fs) + "."]);
  return out
}
function rGuide() {
  var v = $("v-guide"), plan = draftPlan(), l = gLane || S.lane || laneOfAlly(S.ally.findIndex(function (h) { return h })) || "o";
  v.innerHTML = '<div class="ttl"><div><h2>Guida rapida</h2><p>Da tenere a portata di mano in partita</p></div></div>' +
    '<div class="card"><div class="kv"><b class="hh">' + IC.pad + ' Piano dal draft</b><span class="k">' + S.ally.filter(Boolean).length + ' alleati · ' + en().length + ' nemici</span></div>' +
    (plan.length ? '<ul class="gtips">' + plan.map(function (p) { return '<li class="gk-' + p[0] + '">' + esc(p[1]) + '</li>' }).join("") + '</ul>' : '<p class="hint" style="margin:6px 0 8px">Inserisci alleati e nemici nel Draft: qui comparirà il piano per la partita.</p><button class="btn sm" id="gdr" style="width:100%">Vai al draft</button>') + '</div>' +
    '<div class="card"><div class="kv"><b class="hh">' + IC.star + ' La tua lane</b></div><div class="seg" id="glane" style="margin:8px 0"></div><ul class="gtips">' + LTIP[l].map(function (t) { return '<li>' + esc(t) + '</li>' }).join("") + '</ul></div>' +
    (S.ally.some(Boolean) && en().length ? laneCard() : '') +
    PHASES.map(function (p) { return '<div class="card"><b class="hh">' + esc(p[0]) + '</b><ul class="gtips">' + p[1].map(function (t) { return '<li>' + esc(t) + '</li>' }).join("") + '</ul></div>' }).join("") +
    '<p class="hint">I tempi di Turtle e Lord cambiano con le patch: controlla sempre il timer degli obiettivi in partita.</p>';
  LANES.forEach(function (k) { var b = document.createElement("button"); b.textContent = LS3[k]; b.className = k === l ? "on" : ""; b.onclick = function () { gLane = k; rGuide() }; $("glane").appendChild(b) });
  if ($("gdr")) $("gdr").onclick = function () { go("draft") };
  laneBind(v);
}
