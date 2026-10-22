/* MLBB TOP - Configurazione al primo avvio e pool di eroi */
/* pool: gli eroi che il giocatore sa usare; danno un bonus nei consigli del draft e compaiono per primi nel selettore */
function poolAdd(h) { if (h && H[h] && S.pool.indexOf(h) < 0 && S.pool.length < POOLMAX) { S.pool.push(h); save() } }
function poolDel(h) { S.pool = S.pool.filter(function (x) { return x !== h }); save() }
/* eroi forti nella lane preferita (o nel ruolo principale), da aggiungere con un tocco */
function poolSugg() {
  return NAMES.filter(function (h) { return S.pool.indexOf(h) < 0 && (S.lane ? H[h].l.indexOf(S.lane) > -1 : H[h].r === S.main) }).sort(function (a, b) { return M[b].score - M[a].score }).slice(0, 4)
}
/* riquadro per modificare il pool, usato nel primo avvio e nel Profilo; re() ridisegna la schermata */
function poolBox(id) {
  return '<div class="kv"><b class="hh">' + IC.star + ' Il tuo pool di eroi</b><span class="k">' + S.pool.length + ' / ' + POOLMAX + '</span></div>' +
    '<p class="hint" style="margin:6px 0 8px">Gli eroi che sai giocare: nel draft hanno un bonus e li trovi per primi quando scegli.</p><div class="pool" id="' + id + '"></div>' +
    (poolSugg().length && S.pool.length < POOLMAX ? '<div class="k" style="margin-top:10px">Suggeriti per ' + (S.lane ? LN[S.lane] : R[S.main]) + '</div><div class="pool" id="' + id + 's"></div>' : '')
}
function poolBind(id, re) {
  S.pool.forEach(function (h) {
    var b = document.createElement("button"); b.className = "pch on"; b.innerHTML = tile(h, "xs") + '<span>' + esc(h) + '</span><i aria-hidden="true">×</i>'; b.setAttribute("aria-label", "Togli " + h + " dal pool");
    b.onclick = function () { poolDel(h); re() }; $(id).appendChild(b)
  });
  if (S.pool.length < POOLMAX) {
    var a = document.createElement("button"); a.className = "pch add"; a.textContent = "+ Aggiungi";
    a.onclick = function () { openPick("Aggiungi al tuo pool", NAMES.filter(function (h) { return S.pool.indexOf(h) < 0 }), function (h) { poolAdd(h); re() }) }; $(id).appendChild(a)
  }
  if ($(id + "s")) poolSugg().forEach(function (h) {
    var b = document.createElement("button"); b.className = "pch"; b.innerHTML = tile(h, "xs") + '<span>' + esc(h) + '</span><i aria-hidden="true">+</i>'; b.setAttribute("aria-label", "Aggiungi " + h + " al pool");
    b.onclick = function () { poolAdd(h); re() }; $(id + "s").appendChild(b)
  })
}
/* chips per scegliere la lane preferita (null = qualsiasi) */
function laneChips(el, re) {
  [[null, "Qualsiasi"]].concat(LANES.map(function (l) { return [l, LN[l]] })).forEach(function (o) {
    var b = document.createElement("button"); b.className = "chip" + (S.lane === o[0] ? " on" : ""); b.textContent = o[1];
    b.onclick = function () { S.lane = o[0]; save(); re() }; el.appendChild(b)
  })
}

function rStart() {
  var v = $("v-start");
  v.innerHTML = '<div class="ttl"><div><h2>Benvenuto</h2><p>Configura l\'app in 30 secondi</p></div></div>' +
    '<div class="card"><p style="margin:0 0 10px">MLBB TOP ti consiglia cosa scegliere e cosa bannare durante il draft di Mobile Legends. Dicci come giochi e i consigli saranno su misura per te.</p>' +
    '<div class="k">Il tuo nickname</div><input class="nick" id="snick" value="' + esc(S.nick) + '" maxlength="20" aria-label="Nickname" style="width:100%;margin:4px 0 12px">' +
    '<div class="k">Ruolo principale</div><div class="chips" id="srole" style="margin:6px 0 12px;padding:0"></div>' +
    '<div class="k">Lane preferita</div><div class="chips" id="slane" style="margin:6px 0 0;padding:0"></div></div>' +
    '<div class="card">' + poolBox("spool") + '</div>' +
    '<button class="btn p" id="sgo" style="width:100%">' + (S.pool.length ? "Inizia" : "Inizia senza pool") + '</button>' +
    '<button class="lnk" id="sskip" style="align-self:center">Salta, lo faccio dopo dal Profilo</button>';
  Object.keys(R).forEach(function (k) { var b = document.createElement("button"); b.className = "chip" + (S.main === k ? " on" : ""); b.textContent = R[k]; b.onclick = function () { S.main = k; save(); rStart() }; $("srole").appendChild(b) });
  laneChips($("slane"), rStart);
  poolBind("spool", rStart);
  $("snick").onchange = function () { S.nick = this.value.trim() || "DraftStrategist"; save() };
  var done = function () { S.nick = $("snick").value.trim() || "DraftStrategist"; S.onb = true; save(); hist = []; go("home", true) };
  $("sgo").onclick = done; $("sskip").onclick = done;
}
