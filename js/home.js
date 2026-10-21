/* MLBB TOP - Home e pagina Novità */
/* novità per versione, la più recente per prima: la Home mostra un avviso finché non la apri */
var NEWS = [
  {
    v: "2026-10-21", t: "Nuova organizzazione e tante funzioni", items: [
      "Primo avvio guidato: scegli ruolo, lane preferita e il tuo pool di eroi.",
      "Pool di eroi: bonus nei consigli del draft, riga «Dal tuo pool» e primi nel selettore (si modifica dal Profilo).",
      "Build contro i nemici: oggetti situazionali (anti-cure, difese, penetrazione, stivali) in base al draft, nell'analisi dettagliata e nella scheda eroe.",
      "Spell ed emblema consigliati per il pick suggerito, con Purify come alternativa contro molti controlli.",
      "Guida rapida in partita (Gioca → Guida): piano dal draft, consigli per la tua lane e obiettivi per fase.",
      "Ricerca unica: la lente in alto trova eroi, oggetti, talenti, spell e schermate.",
      "Home: riassunto di draft, sfida del giorno, eroi in crescita e ultime partite.",
      "Barra in basso a gruppi: Gioca (Draft, Storico), Studia (Tier list, Eroi, Confronto, Quiz), Io (Profilo, Impostazioni).",
      "Impostazioni in una schermata a parte.",
      "Draft guidato con i turni del ranked, ban consigliati e link per condividere il draft.",
      "Storico partite: segna vittoria o sconfitta e scopri con chi vinci di più.",
      "Confronto 1 contro 1 tra due eroi.",
      "Tendenze del meta: frecce ▲▼ sul win rate e aggiornamento automatico delle statistiche.",
      "Quiz: sfida del giorno da condividere.",
      "Abilità, oggetti, talenti e matchup tradotti in italiano.",
      "Backup dei dati: esporta e importa un file con profilo, storico e quiz.",
      "Avvisi dentro l'app e messaggio chiaro se l'OCR viene usato senza rete."
    ]
  }
];
/* chi apre l'app per la prima volta non ha bisogno dell'avviso delle novità */
if (FIRST) { S.newsSeen = NEWS[0].v; save() }

function rHome() {
  var v = $("v-home"), z = S.quiz, ri = rankOf(z.xp), al = S.ally.filter(Boolean).length, ne = en().length, inDraft = used().length > 0;
  var d = S.daily && S.daily.d === today() ? S.daily : null;
  var mv = NAMES.filter(function (h) { return dWr(h) != null && dWr(h) >= .1 }).sort(function (a, b) { return dWr(b) - dWr(a) }).slice(0, 3);
  var top = mv.length ? mv : NAMES.filter(function (h) { return M[h].wr != null }).sort(function (a, b) { return M[b].wr - M[a].wr }).slice(0, 3);
  var st = gameStats(), last = S.games.slice(-10);
  var news = S.newsSeen !== NEWS[0].v;
  v.innerHTML = '<div class="ttl"><div><h2>Ciao, ' + esc(S.nick) + '</h2><p>' + RANKS[ri][0] + ' · ' + z.xp + ' XP · dati ' + (META.live ? "live " : "") + META.date + '</p></div>' + tile(S.avatar && H[S.avatar] ? S.avatar : "Layla", "") + '</div>' +
    (news ? '<button class="card hl hnews" id="hnews"><b>' + IC.star + ' Novità: ' + esc(NEWS[0].t) + '</b><small>Tocca per vedere cosa è cambiato</small></button>' : '') +
    (!S.onb ? '<button class="card hl hnews" id="hstart"><b>' + IC.sliders + ' Configura l\'app</b><small>Ruolo, lane preferita e il tuo pool di eroi</small></button>' : '') +
    '<button class="btn p" id="hdraft" style="width:100%">' + IC.pad + ' ' + (inDraft ? "Continua il draft (" + al + "/5 alleati · " + ne + "/5 nemici)" : "Nuovo draft") + '</button>' +
    '<div class="card"><div class="kv"><b class="hh">' + IC.star + ' Sfida del giorno</b>' + (d ? '<span class="pill gr">' + d.res.filter(Boolean).length + ' / ' + d.res.length + '</span>' : '<span class="pill am">Da giocare</span>') + '</div>' +
    '<p class="hint" style="margin:6px 0 8px">' + (d ? "Fatta! Giorni di fila: " + S.dstreak + ". Domani ce n'è una nuova." : "5 domande uguali per tutti oggi.") + '</p><button class="btn sm" id="hquiz" style="width:100%">' + (d ? "Vai al quiz" : "Gioca la sfida") + '</button></div>' +
    '<div class="card"><div class="kv"><b class="hh">' + IC.trend + ' ' + (mv.length ? "In crescita dal " + esc(PREV.date) : "Win rate più alto") + '</b><span class="k">' + RKN[S.rk] + '</span></div><div class="hrow" id="htop"></div></div>' +
    '<div class="card"><div class="kv"><b class="hh">' + IC.medal + ' Ultime partite</b>' + (st.n ? '<span class="pill ' + (st.w / st.n >= .5 ? "gr" : "rd") + '">' + Math.round(100 * st.w / st.n) + '% vittorie</span>' : '') + '</div>' +
    (last.length ? '<div class="gdots" style="margin:8px 0">' + last.map(function (x) { return '<i class="' + (x.r ? "w" : "l") + '">' + (x.r ? "V" : "S") + '</i>' }).join("") + '</div>' : '<p class="hint" style="margin:6px 0 8px">Nessuna partita ancora: a fine draft segna Vittoria o Sconfitta.</p>') +
    '<button class="btn sm" id="hgames" style="width:100%">Storico partite</button></div>' +
    '<div class="two"><button class="btn sm" id="hguide">Guida in partita</button><button class="btn sm" id="hcmp">' + IC.swap + ' Confronta eroi</button></div>';
  top.forEach(function (h) { var b = document.createElement("button"); b.className = "lcand"; b.innerHTML = tile(h, "sm") + '<b>' + esc(h) + '</b><small class="' + (mv.length ? "g" : "a") + '">' + (mv.length ? "+" + dWr(h).toFixed(1) : pc(M[h].wr)) + '</small>'; b.onclick = function () { openHero(h) }; $("htop").appendChild(b) });
  if ($("hnews")) $("hnews").onclick = function () { go("news") };
  if ($("hstart")) $("hstart").onclick = function () { go("start") };
  $("hdraft").onclick = function () { go("draft") };
  $("hquiz").onclick = function () { if (!d && (!QZ || !QZ.daily)) newRound(true); go("quiz") };
  $("hgames").onclick = function () { go("games") };
  $("hcmp").onclick = function () { go("cmp") };
  $("hguide").onclick = function () { go("guide") };
}

function rNews() {
  var v = $("v-news");
  v.innerHTML = '<div class="ttl"><div><h2>Novità</h2><p>Cosa è cambiato nell\'app</p></div></div>' + NEWS.map(function (n) {
    return '<div class="card"><div class="kv"><b class="hh">' + esc(n.t) + '</b><span class="k">' + esc(n.v.split("-").reverse().join("/")) + '</span></div><ul class="news">' + n.items.map(function (i) { return '<li>' + esc(i) + '</li>' }).join("") + '</ul></div>'
  }).join("");
  if (S.newsSeen !== NEWS[0].v) { S.newsSeen = NEWS[0].v; save() }
}
