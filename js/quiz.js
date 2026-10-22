/* MLBB TOP - Quiz e sfida del giorno */
/* ---------- QUIZ ---------- */
var RANKS = [["Guerriero", 0], ["Élite", 300], ["Maestro", 800], ["Gran Maestro", 1500], ["Epico", 2500], ["Leggenda", 4000], ["Mitico", 6000], ["Gloria Mitica", 9000]];
var REW = [["Titolo Stratega", 500], ["Cornice HUD", 1500], ["Titolo Mythic", 6000]];
function rankOf(xp) { var i = 0; RANKS.forEach(function (r, k) { if (xp >= r[1]) i = k }); return i }
/* rnd: casuale, oppure con seme fisso per la sfida del giorno (stesse domande per tutti nella stessa data) */
var rnd = Math.random;
function seeded(str) { var h = 1779033703 ^ str.length; for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19 } return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296 } }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t } return a }
function pick(a) { return a[Math.floor(rnd() * a.length)] }
function genQ(only) {
  var types = only || ["role", "lane", "counter", "lore", "trait", "skill", "title", "wr", "build"], t = pick(types), h = pick(NAMES), x = H[h];
  if (t === "skill") { var hs = NAMES.filter(function (n) { return HX[n] && HX[n].sk && HX[n].sk.length }); if (hs.length > 4) { h = pick(hs); x = H[h]; var sk = pick(HX[h].sk), o6 = shuffle([h].concat(shuffle(hs.filter(function (n) { return n !== h && H[n].r === x.r })).slice(0, 3))); if (o6.length === 4) return { cat: "Abilità", lvl: "Esperto", xp: 50, q: "A quale eroe appartiene l’abilità «" + sk.n + "»?", o: o6, a: o6.indexOf(h), tip: "Tutte le opzioni sono " + R[x.r].toLowerCase() + "." } } }
  if (t === "title") { var ht = NAMES.filter(function (n) { return HX[n] && HX[n].ti }); h = pick(ht); x = H[h]; var o7 = shuffle([h].concat(shuffle(ht.filter(function (n) { return n !== h })).slice(0, 3))); return { cat: "Lore", lvl: "Intermedio", xp: 40, q: "Quale eroe è conosciuto come «" + HX[h].ti + "»?", o: o7, a: o7.indexOf(h), tip: "Regione d’origine: " + (HX[h].rg || "sconosciuta") + "." } }
  if (t === "wr") { var hw = shuffle(NAMES.filter(function (n) { return M[n].wr != null })).slice(0, 4); if (hw.length === 4) { var best = hw.slice().sort(function (a, b) { return M[b].wr - M[a].wr })[0]; return { cat: "Meta & statistiche", lvl: "Esperto", xp: 50, q: "Chi ha il win rate più alto in questo momento (" + RKN[S.rk] + ")?", o: hw, a: hw.indexOf(best), tip: "Pensa a chi domina il meta attuale.", exp: hw.map(function (n) { return n + " " + pc(M[n].wr) }).join(" · ") + "." } } }
  if (t === "build") { var hb = NAMES.filter(function (n) { var b = HX[n] && HX[n].bd; return b && Object.keys(b).length }); if (hb.length > 4) { h = pick(hb); x = H[h]; var bb = HX[h].bd[Object.keys(HX[h].bd)[0]][0], it = ITEMS[bb.it[0]]; if (it) { var o8 = shuffle([h].concat(shuffle(hb.filter(function (n) { return n !== h && H[n].r === x.r && HX[n].bd[Object.keys(HX[n].bd)[0]][0].it.indexOf(bb.it[0]) < 0 })).slice(0, 3))); if (o8.length === 4) return { cat: "Build", lvl: "Esperto", xp: 50, q: "Per quale eroe la build più usata contiene «" + bb.it.map(function (i) { return ITEMS[i] ? ITEMS[i][0] : "" }).join(", ") + "»?", o: o8, a: o8.indexOf(h), tip: "Emblema consigliato: " + bb.em + "." } } } }
  if (t === "role") { var o = shuffle([x.r].concat(shuffle(Object.keys(R).filter(function (k) { return k !== x.r })).slice(0, 3))); return { cat: "Ruoli", lvl: "Base", xp: 30, q: "Qual è il ruolo principale di " + h + "?", o: o.map(function (k) { return R[k] }), a: o.indexOf(x.r), tip: h + " è un " + R[x.r].toLowerCase() + " che si gioca in " + lanes(h) + "." } }
  if (t === "lane") { var l = x.l[0], o2 = shuffle([l].concat(shuffle(Object.keys(LN).filter(function (k) { return x.l.indexOf(k) < 0 })).slice(0, 3))); return { cat: "Lane & mappa", lvl: "Base", xp: 30, q: "In quale corsia si gioca di solito " + h + "?", o: o2.map(function (k) { return LN[k] }), a: o2.indexOf(l), tip: "Pensa al ruolo: " + R[x.r] + " con tratti " + traits(h).toLowerCase() + "." } }
  if (t === "counter") {
    var tg = pick(NAMES.filter(function (n) { return beatenBy(n).some(function (y) { return y.s >= 3 }) })), good = pick(beatenBy(tg).filter(function (y) { return y.s >= 3 })), bad = shuffle(NAMES.filter(function (n) { return n !== tg && sc(n, tg).s === 0 })).slice(0, 3), o3 = shuffle([good.n].concat(bad));
    return { cat: "Counter & draft", lvl: "Esperto", xp: 50, q: "Quale di questi eroi è un buon counter contro " + tg + "?", o: o3, a: o3.indexOf(good.n), tip: tg + " è " + traits(tg).toLowerCase() + ": cerca chi ha il tratto opposto.", exp: good.n + ": " + good.w + "." }
  }
  if (t === "lore") { var same = shuffle(NAMES.filter(function (n) { return n !== h && H[n].r === x.r })).slice(0, 3), o4 = shuffle([h].concat(same)); return { cat: "Lore", lvl: "Esperto", xp: 50, q: "A quale eroe appartiene questa lore?", quote: x.lore, o: o4, a: o4.indexOf(h), tip: "Tutte le opzioni sono " + R[x.r].toLowerCase() + "." } }
  var tt = pick(x.t.split("")), no = shuffle(Object.keys(TR).filter(function (k) { return x.t.indexOf(k) < 0 })).slice(0, 3), o5 = shuffle([tt].concat(no));
  return { cat: "Meccaniche & tratti", lvl: "Intermedio", xp: 40, q: "Quale tratto descrive " + h + "?", o: o5.map(function (k) { return TR[k] }), a: o5.indexOf(tt), tip: h + " è " + R[x.r].toLowerCase() + " in " + lanes(h) + "." }
}
/* nella sfida del giorno niente domande sul win rate: dipendono da quando ognuno ha aggiornato le statistiche */
function newRound(daily) {
  /* stesso ordine degli eroi su ogni dispositivo (l'ordine alfabetico può cambiare con la lingua) */
  var r = [], keep = NAMES; if (daily) { rnd = seeded("mlbbtop-" + today()); NAMES = NAMES.slice().sort(function (a, b) { return (HX[a] ? HX[a].id : 999) - (HX[b] ? HX[b].id : 999) }) }
  try { for (var i = 0; i < 5; i++)r.push(genQ(daily ? ["role", "lane", "counter", "lore", "trait", "skill", "title", "build"] : null)) } finally { rnd = Math.random; NAMES = keep }
  QZ = { r: r, i: 0, sel: null, done: false, ok: 0, daily: !!daily, res: [] }
}
function dailyText() { var d = S.daily; return "MLBB TOP · Sfida del giorno " + d.d + ": " + d.res.filter(Boolean).length + "/" + d.res.length + " " + d.res.map(function (x) { return x ? "🟩" : "🟥" }).join("") }
function dailyBox() {
  var d = S.daily && S.daily.d === today() ? S.daily : null;
  if (QZ && QZ.daily && QZ.i < QZ.r.length) return "";
  if (d) return '<div class="card"><div class="kv"><b style="font-family:var(--hd);font-size:15px">' + IC.star + ' Sfida del giorno</b><span class="pill gr">' + d.res.filter(Boolean).length + ' / ' + d.res.length + '</span></div><div class="gdots" style="margin:8px 0">' + d.res.map(function (x) { return '<i class="' + (x ? "w" : "l") + '">' + (x ? "✓" : "✗") + '</i>' }).join("") + '</div><p class="hint" style="margin:0 0 8px">Giorni di fila: ' + S.dstreak + '. Domani c’è una nuova sfida.</p><button class="btn sm" id="dsh" style="width:100%">Condividi risultato</button></div>';
  return '<div class="card hl"><div class="kv"><b style="font-family:var(--hd);font-size:15px">' + IC.star + ' Sfida del giorno</b><span class="pill am">' + today() + '</span></div><p class="hint" style="margin:6px 0 10px">5 domande uguali per tutti oggi: una sola partita, confronta il risultato con gli amici.</p><button class="btn am sm" id="dgo" style="width:100%">Gioca la sfida</button></div>';
}
function rQuiz() {
  if (!QZ) newRound();
  var z = S.quiz, ri = rankOf(z.xp), nx = RANKS[ri + 1], lo = RANKS[ri][1], pct = nx ? Math.round(100 * (z.xp - lo) / (nx[1] - lo)) : 100, v = $("v-quiz");
  var html0 = '<div class="ttl"><div><h2>Prova della conoscenza</h2><p>Quiz generati dal database</p></div><span class="pill am">' + z.xp + ' XP</span></div>'; var qh = '<div class="qhero"><div class="kv"><span class="g" style="font-size:10.5px;font-weight:700;letter-spacing:.1em">● MAESTRIA DEL SAPERE MLBB</span><span class="pill">Round ' + (z.rounds + 1) + '</span></div>' +
    '<div class="rank"><span class="medal">' + IC.medal + '</span><div style="flex:1"><b>' + RANKS[ri][0] + '</b><div class="hint">' + (nx ? z.xp + " / " + nx[1] + " XP per " + nx[0] : "Rango massimo raggiunto") + '</div></div><span class="pill am">' + pct + '%</span></div>' +
    '<div><div class="ladder">' + RANKS.slice(Math.max(0, Math.min(ri - 1, RANKS.length - 5)), Math.max(0, Math.min(ri - 1, RANKS.length - 5)) + 5).map(function (r) { return '<span class="' + (r[0] === RANKS[ri][0] ? "on" : "") + '">' + r[0] + '</span>' }).join("") + '</div>' + bar(pct, "linear-gradient(90deg,var(--blue2),var(--amber))") + '</div>' +
    '<div class="rw">' + REW.map(function (w) { var g = z.xp >= w[1]; return '<div class="' + (g ? "got" : "lock") + '"><span class="' + (g ? "g" : "") + '">' + (g ? IC.check : IC.lock) + '</span><span>' + w[0] + '<small>' + (g ? "Sbloccato" : w[1] + " XP") + '</small></span></div>' }).join("") + '</div></div>';
  if (QZ.daily && QZ.i >= QZ.r.length && !QZ.saved) {
    QZ.saved = true; var y = new Date(Date.now() - 864e5).toLocaleDateString("it-IT");
    if (!(S.daily && S.daily.d === today())) { S.dstreak = S.dlast === y ? S.dstreak + 1 : 1; S.dlast = today(); S.daily = { d: today(), res: QZ.res.slice() }; save() }
  }
  var html = html0 + dailyBox();
  if (QZ.i >= QZ.r.length) {
    html += '<div class="qcard"><div class="q">Round completato: ' + QZ.ok + ' / ' + QZ.r.length + ' risposte corrette.</div><p class="hint">Serie attuale: ' + z.streak + ' · Miglior serie: ' + z.best + '</p><button class="btn p" id="qnew">Nuovo round</button></div>';
  } else {
    var q = QZ.r[QZ.i];
    html += '<div class="qcard"><div class="qtop"><span class="pill ' + (QZ.daily ? "am" : "bl") + '">' + (QZ.daily ? "Sfida del giorno · " : "") + 'Domanda #' + (QZ.i + 1) + ' di ' + QZ.r.length + '</span><span class="a">Serie: ' + z.streak + '</span></div>' +
      '<div class="qmeta"><span>' + q.cat + ' · Livello: <span class="a">' + q.lvl + '</span></span><span class="pill gr">+' + q.xp + ' XP</span></div>' +
      '<div class="q">' + q.q + (q.quote ? '<blockquote>“' + q.quote + '”</blockquote>' : '') + '</div><div class="rows" id="opts"></div>' +
      '<div class="tip">' + IC.bulb + '<span>' + (QZ.done ? (QZ.sel === q.a ? '<b class="g">Corretto!</b> ' : '<b class="r">Sbagliato.</b> Risposta: ' + q.o[q.a] + '. ') + (q.exp || q.tip) : "Suggerimento tattico: " + q.tip) + '</span></div>' +
      '<button class="btn p" id="qgo"' + (QZ.sel === null ? " disabled" : "") + '>' + (QZ.done ? (QZ.i === QZ.r.length - 1 ? "Vedi risultato" : "Prossima domanda") : "Conferma risposta") + ' ' + IC.shield + '</button></div>';
  }
  html += qh;
  html += '<div class="card lb rows"><div class="kv"><b style="font-family:var(--hd);font-size:16px">' + IC.chart + ' Record personali</b><span class="pill">Locale</span></div>' +
    [["1", "Risposte corrette", z.ok + " / " + z.tot + " totali", z.ok], ["2", "Precisione", z.tot ? "su " + z.tot + " domande" : "nessuna domanda ancora", (z.tot ? Math.round(100 * z.ok / z.tot) : 0) + "%"], ["3", "Miglior serie", "Round completati: " + z.rounds, z.best]].map(function (r) { return '<div class="row"><span class="num">' + r[0] + '</span><span><b>' + r[1] + '</b><small>' + r[2] + '</small></span><span class="v">' + r[3] + '</span></div>' }).join("") + '</div>';
  v.innerHTML = html;
  if ($("dgo")) $("dgo").onclick = function () { newRound(true); rQuiz(); $("v-quiz").scrollTop = 0 };
  if ($("dsh")) $("dsh").onclick = function () { var b = this, t = dailyText(), ok2 = function () { b.textContent = "Copiato ✓" }; if (navigator.share) navigator.share({ text: t }).catch(function () { }); else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok2).catch(function () { prompt("Copia il risultato:", t) }); else prompt("Copia il risultato:", t) };
  if (QZ.i >= QZ.r.length) { $("qnew").onclick = function () { S.quiz.rounds++; save(); newRound(); rQuiz() }; return }
  var q2 = QZ.r[QZ.i];
  q2.o.forEach(function (o, i) { var b = document.createElement("button"); b.className = "opt" + (QZ.done ? (i === q2.a ? " good" : i === QZ.sel ? " bad" : "") : (QZ.sel === i ? " sel" : "")); b.innerHTML = '<span class="L">' + "ABCD"[i] + '</span><span>' + o + '</span><span class="rad"></span>'; b.disabled = QZ.done; b.onclick = function () { QZ.sel = i; rQuiz() }; $("opts").appendChild(b) });
  $("qgo").onclick = function () { if (!QZ.done) { QZ.done = true; z.tot++; if (QZ.sel === q2.a) { z.ok++; z.xp += q2.xp; z.streak++; z.best = Math.max(z.best, z.streak); QZ.ok++ } else z.streak = 0; if (QZ.res) QZ.res.push(QZ.sel === q2.a ? 1 : 0); save() } else { QZ.i++; QZ.sel = null; QZ.done = false } rQuiz() };
}
