/* MLBB TOP - Schermata Impostazioni: preferenze del draft, app, dati e backup */
function rSettings() {
  var v = $("v-settings");
  v.innerHTML = '<div class="ttl"><div><h2>Impostazioni</h2><p>Draft, app, dati e backup</p></div></div>' +
    '<div class="card"><div class="ph">' + IC.sliders + ' Configurazione draft & preferenze</div>' +
    '<div class="set"><span><b>Analisi dettagliata sempre aperta</b><small>Mostra copertura ruoli e pressione nel draft</small></span><button class="tg' + (S.keep ? " on" : "") + '" id="tg" aria-label="Analisi dettagliata sempre aperta"></button></div>' +
    '<div class="set"><span><b>Usa i miei eroi nei consigli</b><small>Bonus agli eroi del tuo pool e a quelli più usati del Profilo MLBB</small></span><button class="tg' + (S.useMine !== false ? " on" : "") + '" id="tgm" aria-label="Usa i miei eroi nei consigli"></button></div>' +
    '<div class="set" style="flex-direction:column;align-items:stretch"><div class="kv"><b style="font-family:var(--hd);font-weight:500;font-size:13px">Algoritmo consigli</b><span class="a" style="font-size:10.5px;font-weight:700;letter-spacing:.06em">' + ({ meta: "ALTA PRIORITÀ", bal: "EQUILIBRATO", safe: "PRUDENTE" })[S.algo] + '</span></div><div class="seg" id="algo"></div><small style="color:var(--mute);font-size:10.5px">Meta: premia gli eroi in cima alla tier list · Safe: evita gli eroi counterati dai nemici.</small></div>' +
    '<div class="set"><span><b>Azzera il draft</b><small>Svuota squadre e ban</small></span><button class="btn sm" id="reset">Azzera</button></div></div>' +
    '<div class="card"><div class="ph">' + IC.monitor + ' Impostazioni app & sistema</div>' +
    '<div class="set" style="flex-direction:column;align-items:stretch"><span><b>Tema interfaccia</b><small>Colori e stile dell\'app, anche a tema fazioni del gioco</small></span><div class="thg" id="theme"></div></div>' +
    '<div class="set"><span><b>Lingua dell\'app</b><small>Menu, pulsanti e consigli</small></span><div class="seg" id="uil" style="width:170px"></div></div>' +
    '<div class="set"><span><b>Testi di gioco</b><small>Abilità, oggetti, talenti e matchup</small></span><div class="seg" id="lang" style="width:170px"></div></div>' +
    '<div class="set" style="flex-direction:column;align-items:stretch"><div class="kv"><b style="font-family:var(--hd);font-weight:500;font-size:13px">Statistiche per rank</b><span class="a" style="font-size:10.5px;font-weight:700">' + RKN[S.rk].toUpperCase() + '</span></div><div class="seg" id="prk"></div></div>' +
    '<div class="set"><span><b>Aggiornamento automatico</b><small>Scarica le statistiche una volta al giorno quando c’è internet</small></span><button class="tg' + (S.autoLive !== false ? " on" : "") + '" id="tga" aria-label="Aggiornamento automatico"></button></div>' +
    '<div class="set"><span><b>Dati ufficiali</b><small>' + NAMES.length + ' eroi · ' + (META.live ? "aggiornati online il " : "snapshot del ") + META.date + '</small></span><button class="btn sm" id="live">Aggiorna</button></div>' +
    '<div class="set"><span><b>Backup dei dati</b><small>Profilo, draft, storico partite, quiz e screenshot in un file</small></span><span style="display:flex;gap:6px"><button class="btn sm" id="bkx">Esporta</button><button class="btn sm" id="bki">Importa</button></span></div><input type="file" accept="application/json,.json" id="bkf" hidden>' +
    '<div class="set"><span><b>Azzera progressi quiz</b><small>XP, serie e record</small></span><button class="btn rd sm" id="rq">Azzera</button></div>' +
    '<p class="hint" style="padding-top:10px;border-top:1px solid var(--line)">Win rate, pick rate, ban rate, counter, compagni e build: dati ufficiali MLBB Academy (via arena.rone.dev, ' + META.win + '). Abilità e titoli: MLBB Academy e Wiki MLBB. Il pulsante Aggiorna scarica le statistiche più recenti (serve internet). Tier e punteggi del draft sono calcolati da MLBB TOP.</p>' +
    '<p class="k" style="text-align:center;margin:10px 0 0">MLBB TOP esports system · build v4.0</p></div>';
  v.innerHTML += '<button class="btn sm" id="tonews" style="width:100%">Novità di questa versione</button>';
  [["meta", "Meta competitivo"], ["bal", "Bilanciata"], ["safe", "Safe pick"]].forEach(function (a) { var b = document.createElement("button"); b.textContent = a[1]; b.className = S.algo === a[0] ? "on" : ""; b.onclick = function () { S.algo = a[0]; focus = null; save(); rSettings() }; $("algo").appendChild(b) });
  /* [codice, nome, colori dell'anteprima: sfondo, accento, alleati, nemici] */
  [["dark", "Cyber dark", "#0B0E14,#5B8CFF,#A9C3FF,#F87171"], ["lod", "Land of Dawn", "#0d1631,#f5c24a,#3fa9ff,#ff5a5a"], ["moniyan", "Moniyan", "#1c2a52,#f6e3a6,#a9d6ff,#ff5a5a"], ["abyss", "Abyss", "#1c0507,#ff5a3a,#9fc4ff,#ff2a1a"],
    ["eruditio", "Eruditio", "#0a2a33,#4ff0ff,#8ff6ff,#ff5a5a"], ["cadia", "Cadia", "#2c0d0b,#e8c26a,#7fe0b8,#ff5a5a"], ["vale", "Northern Vale", "#1f3249,#cfe6ff,#bfe0ff,#ff5a5a"], ["hc", "Alto contrasto", "#000,#fff,#7FA8FF,#FF8080"]].forEach(function (a) { var b = document.createElement("button"), c = a[2].split(","); b.innerHTML = '<span class="sw" style="background:' + c[0] + '"><i style="background:' + c[1] + '"></i><i style="background:' + c[2] + '"></i><i style="background:' + c[3] + '"></i></span>' + esc(a[1]); b.className = S.theme === a[0] ? "on" : ""; b.onclick = function () { S.theme = a[0]; applyTheme(); save(); rSettings() }; $("theme").appendChild(b) });
  Object.keys(RKN).forEach(function (k) { var b = document.createElement("button"); b.textContent = RKN[k]; b.className = S.rk === k ? "on" : ""; b.onclick = function () { S.rk = k; save(); calcMeta(); rSettings() }; $("prk").appendChild(b) });
  /* l'inglese vale anche per i testi di gioco (originali); si ricarica perché i testi sono già nella pagina */
  [["it", "Italiano"], ["en", "English"]].forEach(function (a) { var b = document.createElement("button"); b.textContent = a[1]; b.className = (S.ui === "en" ? "en" : "it") === a[0] ? "on" : ""; b.setAttribute("data-raw", ""); b.onclick = function () { if ((S.ui === "en" ? "en" : "it") === a[0]) return; S.ui = a[0]; S.lang = a[0]; save(); location.reload() }; $("uil").appendChild(b) });
  [["it", "Italiano"], ["en", "Originale"]].forEach(function (a) { var b = document.createElement("button"); b.textContent = a[1]; b.className = (S.lang === "en" ? "en" : "it") === a[0] ? "on" : ""; b.onclick = function () { if ((S.lang === "en" ? "en" : "it") === a[0]) return; S.lang = a[0]; save(); location.reload() }; $("lang").appendChild(b) });
  $("live").onclick = function () { liveUpdate(this) };
  $("tg").onclick = function () { S.keep = !S.keep; save(); rSettings() };
  $("tga").onclick = function () { S.autoLive = S.autoLive === false; save(); rSettings(); autoLive() };
  $("tgm").onclick = function () { S.useMine = S.useMine === false; focus = null; save(); rSettings() };
  $("reset").onclick = function () { S.allyLane = [null, null, null, null, null]; S.ally = [null, null, null, null, null]; S.enemy = [null, null, null, null, null]; S.banA = [null, null, null, null, null]; S.banE = [null, null, null, null, null]; focus = null; save(); go("draft") };
  $("bkx").onclick = exportBackup;
  $("bki").onclick = function () { $("bkf").click() };
  $("bkf").onchange = function () { var f = this.files[0]; this.value = ""; if (f) importBackup(f) };
  $("rq").onclick = function () { S.quiz = Object.assign({}, DEF.quiz); QZ = null; save(); rSettings() };
  $("tonews").onclick = function () { go("news") };
}
