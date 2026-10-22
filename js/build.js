/* MLBB TOP - Build contro i nemici del draft: oggetti situazionali, spell ed emblema consigliati */
/* tipo di danno dell'eroe dagli oggetti della sua build ufficiale (fisico, magico o tank), altrimenti dalle categorie */
function dmgType(h, l) {
  var bd = (HX[h] && HX[h].bd) || {}, b = (bd[l] || bd[Object.keys(bd)[0]] || [])[0], n = { Attack: 0, Magic: 0, Defense: 0 };
  if (b) b.it.forEach(function (id) { var c = ITEMS[id] && ITEMS[id][1]; if (c in n) n[c]++ });
  if (n.Defense >= 2 || (!b && H[h].r === "T")) return "tank";
  if (n.Magic > n.Attack || (!b && H[h].g.indexOf("g") > -1)) return "mag";
  return "atk"
}
/* conteggi sulla squadra nemica: tipo di danno e tratti (TR) */
function foeProfile(list) {
  var f = { n: list.length, mag: 0, phys: 0, sust: [], cc: [], burst: [], tough: [], mm: [], ass: [] };
  list.forEach(function (e) {
    var x = H[e]; if (x.g.indexOf("g") > -1) f.mag++; if (x.g.indexOf("p") > -1) f.phys++;
    if (x.t.indexOf("s") > -1) f.sust.push(e); if (x.t.indexOf("c") > -1) f.cc.push(e); if (x.t.indexOf("b") > -1) f.burst.push(e); if (x.t.indexOf("t") > -1) f.tough.push(e);
    if (x.r === "X") f.mm.push(e); if (x.r === "A") f.ass.push(e)
  });
  return f
}
function few(a) { return a.slice(0, 3).join(", ") }
/* oggetti da aggiungere alla build core in base ai nemici; w = quanto pesa (i primi 4 vengono mostrati) */
function situItems(h, l, foes) {
  var t = dmgType(h, l), f = foeProfile(foes), out = [], add = function (id, w, why) { if (ITEMS[id] && !out.some(function (o) { return o.id === id })) out.push({ id: id, w: w, why: why }) };
  if (!f.n) return { type: t, items: [] };
  if (f.sust.length) add(t === "tank" ? 3206 : t === "mag" ? 3105 : 3013, 2 + f.sust.length, "Taglia le cure e gli scudi di " + few(f.sust));
  if (f.mag >= 2 || (f.mag && f.mag >= f.phys)) add(f.burst.length && t !== "tank" ? 3205 : t === "tank" && f.mag >= 3 ? 3210 : 3205, 1 + f.mag, f.mag + " nemici fanno danni magici");
  if (f.mm.length && f.phys >= 2) add(t === "tank" ? 2207 : 3212, 1 + f.mm.length + f.phys / 2, "Contro gli attacchi base di " + few(f.mm));
  else if (f.phys >= 3 && t === "tank") add(3203, f.phys, f.phys + " nemici fanno danni fisici");
  if (f.tough.length >= 2 && t !== "tank") add(t === "mag" ? 3101 : 3001, 1 + f.tough.length, "Penetrazione contro i nemici resistenti (" + few(f.tough) + ")");
  if (f.burst.length >= 2 || f.ass.length) add(t === "tank" ? 3207 : f.burst.length >= 2 ? 2107 : 3207, 1 + f.burst.length + f.ass.length, "Sopravvivi al burst di " + few(f.ass.concat(f.burst.filter(function (e) { return f.ass.indexOf(e) < 0 }))));
  if (l !== "j" && l !== "r") {
    if (f.cc.length >= 2) add(2302, f.cc.length, "Stivali: controlli più brevi contro " + few(f.cc));
    else if (f.phys >= 3) add(2301, f.phys - 1, "Stivali: più difesa fisica");
  }
  out.sort(function (a, b) { return b.w - a.w });
  return { type: t, items: out.slice(0, 4) }
}
/* spell ed emblema: dalla build ufficiale più usata nella lane, con un'alternativa se i nemici hanno molti controlli */
function spellFor(h, l, foes) {
  var bd = (HX[h] && HX[h].bd) || {}, b = (bd[l] || [])[0], f = foeProfile(foes), r = { sp: null, alt: null, em: null };
  if (b) { r.sp = SPL[b.sp] ? b.sp : null; r.em = { n: b.em, img: b.emi, ea: b.ea, tl: b.tl } }
  if (!r.sp) r.sp = l === "j" ? 20020 : null;
  if (l !== "j" && f.cc.length >= 3 && r.sp !== 20080) r.alt = { id: 20080, why: "Con " + f.cc.length + " nemici che controllano (" + few(f.cc) + ") valuta Purify" };
  return r
}
var DTN = { atk: "danni fisici", mag: "danni magici", tank: "tank" };
/* riquadro con oggetti situazionali, spell ed emblema per l'eroe h nella lane l contro i nemici attuali */
function buildBox(h, l) {
  var foes = en(), si = situItems(h, l, foes), sp = spellFor(h, l, foes), s = SPL[sp.sp];
  var html = '<div class="card bvs"><div class="kv"><b class="hh">' + IC.shield + ' Build per ' + esc(h) + (foes.length ? ' contro questi nemici' : '') + '</b><span class="k">' + (LN[l] || "") + '</span></div>';
  if (!foes.length) html += '<p class="hint" style="margin:6px 0 0">Aggiungi gli eroi nemici: qui compariranno gli oggetti da adattare contro di loro.</p>';
  else if (!si.items.length) html += '<p class="hint" style="margin:6px 0 0">Nessun oggetto particolare da aggiungere: segui la build core (eroe da ' + DTN[si.type] + ').</p>';
  else html += '<div class="k" style="margin:10px 0 6px">Oggetti situazionali · eroe da ' + DTN[si.type] + '</div><ul class="sit">' + si.items.map(function (o) { var it = ITEMS[o.id]; return '<li>' + (it[4] ? '<img src="' + it[4] + '" alt="">' : '') + '<div><b>' + esc(it[0]) + '</b><small>' + esc(o.why) + '</small></div></li>' }).join("") + '</ul>';
  if (s || sp.em) html += '<div class="k" style="margin:10px 0 6px">Spell ed emblema</div><div class="spem">' +
    (s ? '<div class="erow">' + (s[2] ? '<img src="' + s[2] + '" alt="">' : '') + '<div><b>' + esc(s[0]) + '</b><small>' + (sp.em ? 'La più usata nella build ufficiale' : 'Obbligatoria in giungla') + '</small></div></div>' : '') +
    (sp.alt ? '<div class="erow">' + (SPL[sp.alt.id][2] ? '<img src="' + SPL[sp.alt.id][2] + '" alt="">' : '') + '<div><b>' + esc(SPL[sp.alt.id][0]) + '</b><small>' + esc(sp.alt.why) + '</small></div></div>' : '') +
    (sp.em ? '<div class="erow">' + (sp.em.img ? '<img src="' + esc(sp.em.img) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '<div><b>Emblema ' + esc(sp.em.n) + '</b><small>' + sp.em.tl.map(function (t) { return TAL[t] ? esc(TAL[t][0]) : "" }).filter(Boolean).join(" · ") + '</small></div></div>' : '') + '</div>';
  return html + '</div>'
}
/* riga compatta spell + emblema per il consigliato del draft */
function spemLine(h, l) {
  var sp = spellFor(h, l, en()), s = SPL[sp.sp];
  if (!s && !sp.em) return "";
  return '<p class="hint spl1">' + [s ? "Spell: " + esc(s[0]) + (sp.alt ? " (o " + esc(SPL[sp.alt.id][0]) + ")" : "") : "", sp.em ? "Emblema: " + esc(sp.em.n) : ""].filter(Boolean).join(" · ") + '</p>'
}
