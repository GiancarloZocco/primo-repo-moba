/* MLBB TOP - Ricerca unica: la lente in alto cerca eroi, oggetti, talenti, spell e schermate */
function fold(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim() }
/* 0 = inizia con la ricerca, 1 = una parola inizia con la ricerca, 2 = la contiene, -1 = niente */
function hit(name, q) { var n = fold(name); return n.indexOf(q) === 0 ? 0 : (" " + n).indexOf(" " + q) > -1 ? 1 : n.indexOf(q) > -1 ? 2 : -1 }
function searchAll(text) {
  var q = fold(text), out = []; if (!q) return out;
  var add = function (grp, list) { var r = list.filter(function (x) { return x.h >= 0 }).sort(function (a, b) { return a.h - b.h || a.t.localeCompare(b.t) }).slice(0, 8); if (r.length) out.push({ g: grp, r: r }) };
  add("Eroi", NAMES.map(function (h) { return { t: h, h: hit(h, q), s: roleLane(h), ic: tile(h, "sm"), go: function () { openHero(h) } } }));
  add("Oggetti", Object.keys(ITEMS).map(function (k) { var it = ITEMS[k]; return { t: it[0], h: hit(it[0], q), s: "Oggetto · " + (ITN[it[1]] || it[1]), ic: it[4] ? '<img src="' + it[4] + '" alt="">' : '<span class="ico0"></span>', go: function () { dbOpen("itm", it[0]) } } }));
  add("Talenti", Object.keys(TAL).map(function (k) { var x = TAL[k]; return { t: x[0], h: hit(x[0], q), s: "Talento livello " + x[2], ic: x[3] ? '<img src="' + x[3] + '" alt="">' : '<span class="ico0"></span>', go: function () { dbOpen("emb", x[0]) } } }));
  add("Spell", Object.keys(SPL).map(function (k) { var x = SPL[k]; return { t: x[0], h: hit(x[0], q), s: "Spell", ic: x[2] ? '<img src="' + x[2] + '" alt="">' : '<span class="ico0"></span>', go: function () { dbOpen("spl", x[0]) } } }));
  add("Schermate", Object.keys(SCR).filter(function (k) { return SCR[k].t || k === "news" }).map(function (k) { var t = SCR[k].t || SCR[k].sub, h = [hit(t, q), hit(SCR[k].sub, q)].filter(function (v) { return v >= 0 }); return { t: t, h: h.length ? Math.min.apply(null, h) : -1, s: SCR[k].sub, ic: '<span class="ico0"></span>', go: function () { go(k) } } }));
  return out
}
/* apre il database già filtrato sul nome cercato */
function dbOpen(sub, name) { hsub = sub; hq = name; itf = "all"; go("heroes") }
function fillSearch() {
  var res = searchAll($("sq").value), el = $("sres"); el.innerHTML = "";
  if (!$("sq").value.trim()) { el.innerHTML = '<p class="hint">Scrivi il nome di un eroe, un oggetto, un talento, una spell o una schermata.</p>'; return }
  if (!res.length) { el.innerHTML = '<p class="hint">Nessun risultato per «' + esc($("sq").value) + '».</p>'; return }
  res.forEach(function (g) {
    var hd = document.createElement("div"); hd.className = "ghd"; hd.textContent = g.g; el.appendChild(hd);
    var box = document.createElement("div"); box.className = "sres";
    g.r.forEach(function (x) { var b = document.createElement("button"); b.innerHTML = x.ic + '<span><b>' + esc(x.t) + '</b><small>' + esc(x.s) + '</small></span>'; b.onclick = function () { closeSearch(); x.go() }; box.appendChild(b) });
    el.appendChild(box)
  })
}
function openSearch() { $("sq").value = ""; fillSearch(); $("ssheet").classList.add("show"); $("sq").focus() }
function closeSearch() { $("ssheet").classList.remove("show") }
$("srch").onclick = openSearch;
$("sx").onclick = closeSearch;
$("sq").oninput = fillSearch;
$("sq").onkeydown = function (e) { if (e.key === "Escape") closeSearch(); if (e.key === "Enter") { var b = document.querySelector("#sres button"); if (b) b.click() } };
$("ssheet").onclick = function (e) { if (e.target === this) closeSearch() };
