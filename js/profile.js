/* MLBB TOP - Profilo e lettura dello screenshot (OCR) */
/* ---------- PROFILO ---------- */
function rProfile() {
  var z = S.quiz, v = $("v-profile"), acc = z.tot ? Math.round(100 * z.ok / z.tot) : 0, syn = S.synN ? Math.round(S.synSum / S.synN) : synergy(), fav = S.avatar && H[S.avatar] ? S.avatar : (S.ally.filter(Boolean)[0] || "Khufra");
  v.innerHTML = '<div class="pcard"><span class="ribbon">' + RANKS[rankOf(z.xp)][0].split(" ")[0].toUpperCase() + '</span><div class="hd">' + '<button class="avb" id="av" aria-label="Cambia avatar">' + tile(fav, "lg", String(rankOf(z.xp) + 1) + "★") + '<span class="avc">' + IC.pen + '</span></button>' + '<div style="flex:1;min-width:0"><input class="nick" id="nick" value="' + esc(S.nick) + '" aria-label="Nickname" maxlength="20"><div class="hint">Profilo locale · dati salvati sul dispositivo</div><div class="a" style="font-size:11.5px;margin-top:4px">' + IC.star + ' ' + RANKS[rankOf(z.xp)][0] + ' · ' + z.xp + ' XP</div></div></div>' +
    '<div class="card" style="background:var(--bg);padding:10px 12px"><div class="kv"><span class="k">Ruolo principale</span><span class="k">Precisione quiz</span></div><div class="kv" style="margin-top:4px;align-items:center"><b style="font-family:var(--hd);font-size:15px">' + R[S.main] + '</b><b class="g" style="font-family:var(--hd);font-size:18px">' + acc + '%</b></div></div>' +
    '<div class="chips" id="mainr" style="margin:0;padding:0"></div><div class="k" style="margin-top:4px">Lane preferita</div><div class="chips" id="plane" style="margin:0;padding:0"></div></div>' +
    '<div class="card">' + poolBox("ppool") + '</div>' +
    '<div class="kv"><span class="k">' + IC.trend + ' Telemetria draft</span><span class="k">Sessione locale</span></div>' +
    '<div class="stats3"><div><span class="k">Eroi scelti</span><b>' + S.picks + '</b>' + bar(Math.min(100, S.picks * 2), "var(--blue2)") + '</div><div><span class="k">Precisione</span><b>' + acc + '%</b>' + bar(acc, "var(--green)") + '</div><div><span class="k">Sinergia media</span><b class="a">' + syn + '%</b>' + bar(syn, "var(--amber)") + '</div></div>' +
    '<div class="card" id="mpc"></div>' +
    '<button class="btn sm" id="toset" style="width:100%">' + IC.sliders + ' Impostazioni dell\'app</button>';
  Object.keys(R).forEach(function (k) { var b = document.createElement("button"); b.className = "chip" + (S.main === k ? " on" : ""); b.textContent = R[k]; b.onclick = function () { S.main = k; save(); rProfile() }; $("mainr").appendChild(b) });
  laneChips($("plane"), rProfile); poolBind("ppool", rProfile);
  mpCard();
  $("toset").onclick = function () { go("settings") };
  $("av").onclick = function () { openPick("Scegli il tuo avatar", NAMES, function (n) { S.avatar = n; save(); setAct(); rProfile() }, { cur: fav }) };
  $("nick").onchange = function () { S.nick = this.value.trim() || "DraftStrategist"; save() };
}
var RKL = ["Guerriero", "Élite", "Maestro", "Gran Maestro", "Epico", "Leggenda", "Mitico", "Onore Mitico", "Gloria Mitica", "Immortale Mitico"];
function mpShot(file, done) {
  var r = new FileReader(); r.onload = function () {
    var im = new Image(); im.onload = function () {
      var k = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); done(c.toDataURL("image/jpeg", .8))
    }; im.onerror = function () { done(null) }; im.src = r.result
  }; r.onerror = function () { done(null) }; r.readAsDataURL(file)
}
function mpNum(t) { t = t.replace(/\s/g, ""); if (/^\d{1,3}([.,]\d{3})+$/.test(t)) t = t.replace(/[.,]/g, ""); return +t.replace(",", ".") }
function mpParse(t) {
  var o = {}, m, fav = /hero\s*power|potere\s*eroe/i.test(t), prof = /rank\s*attuale|current\s*rank|rank\s*pi\w*\s*alto|highest\s*rank/i.test(t), T = t.replace(/mythi(?:c|cal)\s*medal|medaglia\s+mitic\w+\s+\w+/gi, ""), low = T.toLowerCase(), f = function (re) { return t.match(re) }, n0 = function (x) { return Math.round(mpNum(x)) };
  if ((m = f(/(\d{6,12})\s*[(\[]\s*(\d{3,5})\s*[)\]]/))) { o.id = m[1]; o.zone = m[2] }
  if ((m = f(/\b(?:lv|lvl|level|livello)\.?\s*(\d{1,3})\b/i))) o.lvl = +m[1];
  if ((m = f(/matches\s*played\D{0,6}([0-9][0-9.,]*)/i)) || (m = f(/part\w*\s+g\w{1,3}c\w*\D{0,6}(\d{3,6})/i))) o.games = n0(m[1]);
  if (!fav) {
    if ((m = f(/(\d{3,6})\s+(\d{1,3}[.,]\d{2})\s*%(?:\s+(\d{3,6}))?/))) { o.games = n0(m[1]); o.wr = mpNum(m[2]); if (m[3]) o.mvp = n0(m[3]) }
    else if ((m = f(/(\d{1,3}[.,]\d{2})\s*%\s+(\d{3,6})(?:\s+(\d{3,6}))?/))) { o.wr = mpNum(m[1]); o.games = n0(m[2]); if (m[3]) o.mvp = n0(m[3]) }
    else if ((m = f(/(\d{1,3}[.,]\d{2})\s*%/))) o.wr = mpNum(m[1]);
    if (o.mvp == null && o.wr != null && (m = f(/(\d{1,3}[.,]\d{2})\s*%\s+(\d{3,6})\s+(\d{3,6})/))) o.mvp = n0(m[3]);
    if (o.mvp == null && (m = f(/([0-9][0-9.,]*)\s*\n?\s*mvp\b(?!\s*-)/i))) o.mvp = n0(m[1]);
  }
  if ((m = f(/(?:longest\s*win\s*stre\w*|serie\s*di\s*vittorie)[^0-9\n]{0,30}(\d{1,3})\b/i))) o.streak = +m[1];
  if ((m = f(/(\d{1,3})\s+(\d{1,4})\s*\n?\s*heroes\s+skins/i))) { o.heroes = +m[1]; o.skins = +m[2] }
  if ((m = f(/kda[^0-9\n]{0,15}(\d{1,2}[.,]\d{1,2})/i))) o.kda = mpNum(m[1]);
  var L1 = /current\s*rank|rank\s*attuale/.exec(low), L2 = /highest\s*rank|rank\s*pi\w*\s*alto/.exec(low), pn = function (i) { var w = low.slice(Math.max(0, i - 45), i).match(/(?:^|[^a-z0-9])(\d{1,3})(?![a-z0-9])/g); return w ? w.map(function (x) { return +x.replace(/\D/g, "") }) : [] };
  if (L1 && L2 && L2.index > L1.index && L2.index - (L1.index + L1[0].length) < 25) { var ns2 = pn(L1.index); if (ns2.length >= 2) { o.stars = ns2[ns2.length - 2]; o.bstars = ns2[ns2.length - 1] } }
  else { if (L1) { var n1 = pn(L1.index); if (n1.length) o.stars = n1[n1.length - 1] } if (L2) { var n2 = pn(L2.index); if (n2.length) o.bstars = n2[n2.length - 1] } }
  if (o.stars != null && o.stars < 25) delete o.stars; if (o.bstars != null && o.bstars < 25) delete o.bstars;
  if (o.stars != null) { if (mpRankOf(o.stars)) o.rank = mpRankOf(o.stars); if (mpRankOf(o.bstars)) o.best = mpRankOf(o.bstars) }
  else if (!prof && !fav) [["immortal|immortale", 9], ["glory|gloria", 8], ["honou?r|onore", 7], ["mythic|mythical|mitico", 6], ["legend|leggenda", 5], ["epic|epico", 4], ["grand\\s*master|gran\\s*maestro", 3], ["master|maestro", 2], ["elite|élite", 1], ["warrior|guerriero", 0]].some(function (r) { if (new RegExp("\\b(?:" + r[0] + ")\\b").test(low)) { o.rank = RKL[r[1]]; return true } });
  var hit = []; NAMES.forEach(function (n) { var rg = new RegExp("(^|[^a-z])(" + n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")(?![a-z])", "g"), q; while ((q = rg.exec(low))) hit.push([q.index + q[1].length, n]) });
  hit.sort(function (a, b) { return a[0] - b[0] });
  if (fav) {
    var dl = [], rd = /potere\s*eroe(?!\s*pi\w*\s*alto)/gi, q, hh = [];
    while ((q = rd.exec(t))) dl.push([q.index, q.index + q[0].length]);
    dl.forEach(function (d, k) {
      var blk = t.slice(d[1], k + 1 < dl.length ? dl[k + 1][0] : t.length), pv = k ? dl[k - 1][1] : 0, nm = null, w = blk.match(/(\d{1,3}\.\d)\s*%/), ns = (blk.replace(/\d{1,3}\.\d\s*%/g, " ").match(/(?:^|[^\w.])(\d{1,5})(?![\w.])/g) || []).map(function (x) { return +x.replace(/\D/g, "") });
      hit.forEach(function (h) { if (h[0] >= pv && h[0] < d[0]) nm = h[1] });
      if (w || ns.length > 1) hh.push({ n: nm, g: ns.length > 1 ? ns[1] : null, w: w ? +w[1] : null })
    });
    if (hh.length) o.hh = hh.slice(0, 3)
  } else if (!prof && o.wr == null && o.id == null) { var seen = {}, hs = hit.filter(function (h) { return seen[h[1]] ? false : (seen[h[1]] = true) }).slice(0, 3).map(function (x) { return x[1] }); if (hs.length) o.h = hs }
  return o
}
function mpCanvas(src) {
  return new Promise(function (ok, no) {
    var im = new Image(); im.onload = function () { var k = Math.max(1, 2400 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); ok(c) }; im.onerror = no; im.src = src
  })
}
function mpFilter(src, fn) {
  var c = document.createElement("canvas"); c.width = src.width; c.height = src.height; var x = c.getContext("2d"); x.drawImage(src, 0, 0);
  var d = x.getImageData(0, 0, c.width, c.height), a = d.data;
  for (var i = 0; i < a.length; i += 4) { var g = fn(.3 * a[i] + .59 * a[i + 1] + .11 * a[i + 2]); a[i] = a[i + 1] = a[i + 2] = g }
  x.putImageData(d, 0, 0); return c
}
function mpPrep(base, inv) { return mpFilter(base, inv ? function (g) { return g > 170 ? 0 : 255 } : function (g) { return Math.max(0, Math.min(255, (g - 128) * 1.6 + 128)) }) }
function mpCrop(base, b) {
  var h = Math.max(8, b.y1 - b.y0), x0 = Math.max(0, Math.round(b.x0 - 30)), y0 = Math.max(0, Math.round(b.y0 - 2 * h)), w = Math.min(base.width, Math.round(b.x1 + 30)) - x0, hh = Math.max(4, Math.round(b.y0 - 1) - y0);
  var c = document.createElement("canvas"); c.width = w * 3; c.height = hh * 3; var x = c.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(base, x0, y0, w, hh, 0, 0, c.width, c.height);
  var t = mpFilter(c, function (g) { return g > 190 ? 0 : 255 }), o = document.createElement("canvas"); o.width = t.width + 40; o.height = t.height + 40;
  var ox = o.getContext("2d"); ox.fillStyle = "#fff"; ox.fillRect(0, 0, o.width, o.height); ox.drawImage(t, 20, 20); return o
}
function mpWords(d) {
  var out = [], add = function (x) { if (x && x.text && x.bbox) out.push({ text: x.text, bbox: x.bbox }) };
  if (d.words && d.words.length) d.words.forEach(add);
  else (d.blocks || []).forEach(function (b) { (b.paragraphs || []).forEach(function (p) { (p.lines || []).forEach(function (l) { (l.words || []).forEach(add) }) }) });
  return out
}
var HN = null;
function mpKey(s) { return String(s || "").toLowerCase().replace(/[^a-z]/g, "") }
function mpLev(a, b) { var d = [], i, j; for (i = 0; i <= a.length; i++) { d[i] = [i]; for (j = 1; j <= b.length; j++) d[i][j] = i ? Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) : j } return d[a.length][b.length] }
function mpHero(s) {
  if (!HN) { HN = {}; NAMES.forEach(function (n) { HN[mpKey(n)] = n }) }
  var k = mpKey(s), best = null, bd = 2, dup = false; if (k.length < 3) return null; if (HN[k]) return HN[k]; if (k.length < 5) return null;
  Object.keys(HN).forEach(function (key) { if (Math.abs(key.length - k.length) > 1) return; var d = mpLev(k, key); if (d < bd) { bd = d; best = HN[key]; dup = false } else if (d === bd) dup = true });
  return bd <= 1 && !dup ? best : null
}
function mpBoxes(words) { return words.map(function (w) { var b = w.bbox; return { p: w.p || 0, t: String(w.text).trim(), k: mpKey(w.text), x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1, xc: (b.x0 + b.x1) / 2, yc: (b.y0 + b.y1) / 2, h: Math.max(8, b.y1 - b.y0) } }) }
function mpGeo(words, W) {
  var ws = mpBoxes(words), cards = [];
  ws.filter(function (w) { return /^(partit|matche)/.test(w.k) }).forEach(function (L) {
    var lh = L.h, num = null, wr = null, nm = null;
    ws.forEach(function (w) { if (/^\d{1,5}[.,:;)]?$/.test(w.t) && Math.abs(w.yc - L.yc) < lh * .8 && w.x0 > L.x1 && w.x0 - L.x1 < W * .2 && (!num || w.x0 < num.x0)) num = w });
    var R = num ? num.x1 : L.x0 + W * .12, Lf = L.x0 - W * .01;
    ws.forEach(function (w) { var m = w.t.match(/^(\d{1,3}[.,]\d)\s*%?$/); if (m && w.yc > L.yc && w.yc < L.yc + lh * 3.5 && w.xc > Lf && w.xc < R + W * .01 && (!wr || w.yc < wr.y)) wr = { y: w.yc, v: mpNum(m[1]) } });
    var rows = []; ws.filter(function (w) { return w.k && w.yc < L.y0 - lh * .3 && w.yc > L.y0 - lh * 7 && w.xc > Lf && w.xc < R + W * .01 }).sort(function (a, b) { return b.yc - a.yc }).forEach(function (w) { var r = rows.filter(function (r) { return Math.abs(r.y - w.yc) < lh * .7 })[0]; if (r) r.ws.push(w); else rows.push({ y: w.yc, ws: [w] }) });
    rows.some(function (r) { var line = r.ws.sort(function (a, b) { return a.x0 - b.x0 }); nm = mpHero(line.map(function (w) { return w.t }).join("")); if (!nm) line.some(function (w) { return (nm = mpHero(w.t)) }); return !!nm });
    cards.push({ x: L.x0, y: L.y0, lh: lh, n: nm, g: num ? +num.t.replace(/\D/g, "") : null, w: wr ? wr.v : null })
  });
  var out = []; cards.forEach(function (c) { var d = out.filter(function (o) { return Math.abs(o.x - c.x) < W * .03 && Math.abs(o.y - c.y) < c.lh * 1.5 })[0]; if (d) ["n", "g", "w"].forEach(function (k) { if (d[k] == null && c[k] != null) d[k] = c[k] }); else out.push(c) });
  out = out.filter(function (c) { return c.n || c.g != null || c.w != null }).sort(function (a, b) { return Math.abs(a.y - b.y) < a.lh * 2 ? a.x - b.x : a.y - b.y });
  return out.length ? out.slice(0, 3).map(function (c) { return { n: c.n, g: c.g, w: c.w } }) : null
}
function mpStatGeo(words, W) {
  var ws = mpBoxes(words), o = {}, num = /^\d{2,6}$/, pct = /^(\d{1,3}[.,]\d{1,2})\s*%$/;
  var above = function (L, re) { var b = null; ws.forEach(function (w) { if (re.test(w.t) && w.y1 <= L.y0 + 4 && L.y0 - w.y1 < L.h * 4 && Math.abs(w.xc - L.xc) < W * .05 && (!b || w.y1 > b.y1)) b = w }); return b };
  var find = function (re, nx) { return ws.filter(function (w, i) { return re.test(w.k) && (!nx || ws.some(function (z) { return nx.test(z.k) && Math.abs(z.yc - w.yc) < w.h && z.x0 >= w.x1 - 2 && z.x0 - w.x1 < w.h * 3 })) }) };
  var g = null, wr = null, mv = null;
  find(/^(partite|matches)$/).some(function (L) { return (g = above(L, num)) });
  find(/^tasso$/).concat(find(/^win$/, /^rate$/)).some(function (L) { return (wr = above(L, pct)) });
  find(/^mvp$/).some(function (L) { return (mv = above(L, num)) });
  if (!mv && g && wr) ws.forEach(function (w) { if (num.test(w.t) && Math.abs(w.yc - g.yc) < g.h * .6 && w.x0 > wr.x1 && w.x0 - wr.x1 < W * .25 && (!mv || w.x0 < mv.x0)) mv = w });
  if (g) o.games = +g.t; if (wr) o.wr = mpNum(wr.t.match(pct)[1]); if (mv) o.mvp = +mv.t;
  find(/^serie$/, /^di$/).concat(find(/^longest$/)).some(function (L) { var b = null; ws.forEach(function (w) { if (/^\d{1,3}$/.test(w.t) && w.x0 > L.x1 && w.x0 - L.x1 < W * .25 && Math.abs(w.yc - L.yc) < L.h * 2 && (!b || w.x0 < b.x0)) b = w }); if (b) o.streak = +b.t; return !!b });
  var ext = {}, usedN = [], near = function (a, b) { return a === b || (a.length >= 6 && Math.abs(a.length - b.length) <= 2 && mpLev(a, b) <= (b.length >= 9 ? 2 : 1)) }, valR = function (w, last) { var b = null; ws.forEach(function (v) { if (/^\d{1,6}$/.test(v.t) && usedN.indexOf(v) < 0 && v.x0 > last.x1 && v.x0 - last.x1 < W * .3 && Math.abs(v.yc - w.yc) < w.h && (!b || v.x0 < b.x0)) b = v }); if (b) { var alt = ws.filter(function (v) { return v !== b && v.p === 1 && b.p !== 1 && /^\d{1,6}$/.test(v.t) && usedN.indexOf(v) < 0 && Math.abs(v.x0 - b.x0) < b.h * 1.5 && Math.abs(v.yc - b.yc) < b.h })[0]; if (alt) { usedN.push(b); b = alt } usedN.push(b) } return b };
  Object.keys(XS).forEach(function (key) {
    XS[key].some(function (seq) {
      return ws.some(function (w, i) {
        if (!near(w.k, seq[0])) return false; var last = w, j = i + 1, q = 1;
        while (q < seq.length && j < ws.length && j < i + 6) { var z = ws[j++]; if (!z.k) continue; if (Math.abs(z.yc - w.yc) > w.h || z.x0 < last.x0) break; if (near(z.k, seq[q])) { last = z; q++ } else break }
        if (q < seq.length) return false;
        if (key === "dmg" && ws.slice(i + 1, i + 5).some(function (z) { return z.k === "taken" })) return false;
        var b = valR(w, last); if (b) ext[key] = +b.t; return !!b
      })
    })
  });
  if (ext.dmg == null && ext.dmgt == null) { var dn = ws.filter(function (w) { return w.k === "danni" }).sort(function (a, b) { return a.x0 - b.x0 }); dn.some(function (a) { var b2 = dn.filter(function (z) { return z !== a && Math.abs(z.yc - a.yc) < a.h && z.x0 > a.x1 })[0]; if (!b2) return false; var v1 = valR(a, a), v2 = valR(b2, b2); if (v1) ext.dmg = +v1.t; if (v2) ext.dmgt = +v2.t; return true }) }
  if (Object.keys(ext).length) o.ext = ext;
  return o
}
var XS = { leg: [["leggendario"], ["legendary"]], mani: [["folle"], ["maniac"]], sav: [["feroce"], ["savage"]], dk: [["doppia", "uccisione"], ["double", "kill"]], tk: [["tripla", "uccisione"], ["triple", "kill"]], mvpl: [["mvp", "del"], ["mvploss"], ["mvp", "loss"]], mk: [["uccisioni", "massimo"], ["most", "kills"]], ma: [["assist", "massimo"], ["most", "assists"]], fb: [["primo", "sangue"], ["first", "blood"]], dmg: [["danni", "inflitti"], ["highest", "dmg"]], dmgt: [["danni", "subiti"], ["highest", "dmg", "taken"]], gold: [["oro", "guadagnato"], ["oro"], ["highest", "gold"]] };
var XN = { leg: "Leggendario", mani: "Folle", sav: "Feroce", dk: "Doppia uccisione", tk: "Tripla uccisione", mvpl: "MVP squadra perdente", mk: "Uccisioni (max)", ma: "Assist (max)", fb: "Primo sangue", dmg: "Danni inflitti/min (max)", dmgt: "Danni subiti/min (max)", gold: "Oro/min (max)" };
function mpRankLabs(words, W) {
  var ws = mpBoxes(words), out = {};
  ws.forEach(function (w) {
    var key = { attuale: ["cur", 1], alto: ["best", 1], current: ["cur", 0], highest: ["best", 0] }[w.k]; if (!key || out[key[0]]) return;
    var r = ws.filter(function (z) { return z.k === "rank" && Math.abs(z.yc - w.yc) < w.h * .8 && (key[1] ? z.x1 <= w.x0 + 2 && w.x0 - z.x1 < W * .08 : z.x0 >= w.x1 - 2 && z.x0 - w.x1 < W * .03) })[0];
    if (r) out[key[0]] = { x0: Math.min(r.x0, w.x0), y0: Math.min(r.y0, w.y0), x1: Math.max(r.x1, w.x1), y1: Math.max(r.y1, w.y1) }
  });
  if (out.cur && !out.best) { var c = out.cur, r2 = ws.filter(function (z) { return z.k === "rank" && Math.abs(z.yc - (c.y0 + c.y1) / 2) < (c.y1 - c.y0) && z.x0 > c.x1 + 20 && z.x0 - c.x1 < W * .25 })[0]; if (r2) out.best = { x0: r2.x0, y0: Math.min(r2.y0, c.y0), x1: r2.x0 + (c.x1 - c.x0) * 1.05, y1: Math.max(r2.y1, c.y1) } }
  return out
}
async function mpRead(shot, st) {
  if (!window.Tesseract) await new Promise(function (ok, no) { var sc = document.createElement("script"); sc.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js"; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc) });
  var base = await mpCanvas(shot), pass = 0, R = { tx: "", words: [], W: base.width, stars: {} };
  var w = await Tesseract.createWorker("eng", 1, { logger: function (x) { if (x.status === "recognizing text") st.textContent = pass < 2 ? "Lettura " + (pass + 1) + "/2: " + Math.round(x.progress * 100) + "%" : "Leggo le stelle del rank…"; else if (pass === 0) st.textContent = "Preparo il lettore (la prima volta scarica circa 15 MB)…" } });
  try {
    for (pass = 0; pass < 2; pass++) { await w.setParameters({ tessedit_pageseg_mode: pass === 1 ? "11" : "3" }); var r = await w.recognize(mpPrep(base, pass === 1), {}, { text: true, blocks: true }); R.tx += "\n" + (r.data.text || ""); R.words = R.words.concat(mpWords(r.data).map(function (x) { x.p = pass; return x })) }
    var labs = mpRankLabs(R.words, R.W), ks = Object.keys(labs);
    if (ks.length) {
      await w.setParameters({ tessedit_pageseg_mode: "7", tessedit_char_whitelist: "0123456789" });
      for (var i = 0; i < ks.length; i++) { var q = await w.recognize(mpCrop(base, labs[ks[i]])), v = String(q.data.text || "").replace(/\D/g, ""); if (/^0\d/.test(v)) v = "1" + v; if (v && v.length <= 3) R.stars[ks[i]] = +v }
    }
  } finally { await w.terminate() }
  return R
}
function mpRankOf(x) { return x == null ? null : x >= 100 ? RKL[9] : x >= 50 ? RKL[8] : x >= 25 ? RKL[7] : null }
function mpShow(R) {
  var tx = R.tx, m = S.mp, o = mpParse(tx), geo = /hero\s*power|potere\s*eroe/i.test(tx) ? mpGeo(R.words || [], R.W || 2400) : null;
  if (geo) { o.hh = geo; delete o.h }
  else { var sg = mpStatGeo(R.words || [], R.W || 2400); if (sg.wr != null || sg.games != null) { delete o.games; delete o.wr; delete o.mvp } Object.keys(sg).forEach(function (k) { o[k] = sg[k] }) }
  if (R.stars && R.stars.cur != null) { o.stars = R.stars.cur; o.rank = mpRankOf(o.stars) || undefined; if (o.rank === undefined) delete o.rank }
  if (R.stars && R.stars.best != null) { o.bstars = R.stars.best; o.best = mpRankOf(o.bstars) || undefined; if (o.best === undefined) delete o.best }
  var L = { id: "ID gioco", zone: "Server", rank: "Rank attuale", best: "Rank massimo", lvl: "Livello", games: "Partite", wr: "Win rate %", mvp: "MVP", kda: "KDA", stars: "Stelle attuali", bstars: "Stelle massime", streak: "Serie vittorie max", heroes: "Eroi posseduti", skins: "Skin" }, rows = Object.keys(L).filter(function (k) { return o[k] != null }).map(function (k) { return "<b>" + L[k] + "</b>: " + esc(String(o[k])) });
  if (o.hh) rows.push("<b>Eroi più usati</b>: " + esc(o.hh.map(function (x) { return (x.n || "eroe non letto") + (x.g != null ? " (" + x.g + " partite" + (x.w != null ? ", " + x.w + "%" : "") + ")" : "") }).join(", ")));
  else if (o.h) rows.push("<b>Eroi</b>: " + esc(o.h.join(", ")));
  if (o.ext) rows.push("<b>Altre statistiche</b>: " + esc(Object.keys(XN).filter(function (k) { return o.ext[k] != null }).map(function (k) { return XN[k] + " " + o.ext[k] }).join(", ")));
  var el = $("mres"); el.innerHTML = '<div class="card" style="background:var(--bg);padding:10px 12px;margin-top:8px">' + (rows.length ? '<div class="k">Ho riconosciuto</div><p class="hint" style="line-height:1.7">' + rows.join("<br>") + '</p><div class="two"><button class="btn sm" id="mok">Applica</button><button class="btn sm" id="mno">Scarta</button></div>' : '<p class="hint">Non sono riuscito a riconoscere dati. Prova con uno screenshot più nitido, tutto in primo piano, e compila a mano.</p>') + '<details><summary class="k" style="cursor:pointer;margin-top:8px">Testo letto</summary><pre style="white-space:pre-wrap;font-size:11px;color:var(--mute)">' + esc(tx.trim() || "(vuoto)") + '</pre></details></div>';
  if (rows.length) {
    $("mno").onclick = function () { el.innerHTML = "" };
    $("mok").onclick = function () { Object.keys(L).forEach(function (k) { if (o[k] != null) m[k] = o[k] }); if (o.hh) o.hh.forEach(function (x, i) { m.h[i] = { n: x.n || (m.h[i] && m.h[i].n) || null, g: x.g, w: x.w } }); else (o.h || []).forEach(function (n, i) { if (!m.h[i] || !m.h[i].n) m.h[i] = Object.assign(m.h[i] || {}, { n: n }) }); if (o.ext) m.ext = Object.assign(m.ext || {}, o.ext); mpSnap(); save(); mpCard() }
  }
}
function mpDay(d) { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") }
function mpDd(s) { var p = String(s).split("-"); return p[2] + "/" + p[1] + "/" + p[0].slice(2) }
function mpSnap() {
  var m = S.mp || {}; if (m.wr == null && m.games == null && m.stars == null) return false;
  var e = { d: mpDay(), games: m.games, wr: m.wr, mvp: m.mvp, stars: m.stars, rank: m.rank };
  S.mph = (S.mph || []).filter(function (x) { return x.d !== e.d }).concat([e]).sort(function (a, b) { return a.d < b.d ? -1 : 1 }).slice(-60); return true
}
function mpFmt(v) { return Math.round(v * 100) / 100 }
function mpSpark(pts, lab, unit) {
  if (pts.length < 2) return "";
  var W = 300, Hh = 76, pl = 30, pr = 10, pt = 10, pb = 10, vs = pts.map(function (p) { return p.v }), mn = Math.min.apply(0, vs), mx = Math.max.apply(0, vs); if (mx === mn) { mx += 1; mn -= 1 }
  var x = function (i) { return pl + i * (W - pl - pr) / (pts.length - 1) }, y = function (v) { return pt + (mx - v) * (Hh - pt - pb) / (mx - mn) };
  var first = pts[0], last = pts[pts.length - 1], dl = mpFmt(last.v - first.v);
  return '<figure class="spk"><figcaption><span>' + lab + '</span><b>' + mpFmt(last.v) + unit + '</b><small class="' + (dl > 0 ? "g" : dl < 0 ? "r" : "") + '">' + (dl > 0 ? "▲ +" : dl < 0 ? "▼ " : "= ") + dl + unit + ' dal ' + mpDd(first.d) + '</small></figcaption>' +
    '<svg viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="' + lab + ': da ' + mpFmt(first.v) + unit + ' il ' + mpDd(first.d) + ' a ' + mpFmt(last.v) + unit + ' il ' + mpDd(last.d) + '">' +
    '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(mx) + '" y2="' + y(mx) + '" class="gl"/><line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(mn) + '" y2="' + y(mn) + '" class="gl"/>' +
    '<text x="' + (pl - 6) + '" y="' + (y(mx) + 4) + '" text-anchor="end">' + mpFmt(mx) + '</text><text x="' + (pl - 6) + '" y="' + (y(mn) + 4) + '" text-anchor="end">' + mpFmt(mn) + '</text>' +
    '<path d="' + pts.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1) }).join(" ") + '" class="ln"/>' +
    pts.map(function (p, i) { return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="' + (i === pts.length - 1 ? 4.5 : 3.5) + '" class="pt"/><circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="12" class="hit" data-t="' + mpDd(p.d) + ': ' + mpFmt(p.v) + unit + '"><title>' + mpDd(p.d) + ': ' + mpFmt(p.v) + unit + '</title></circle>' }).join("") +
    '</svg><small class="sptip">Tocca un punto per il valore</small></figure>'
}
function mpHist() {
  var el = $("mhist"); if (!el) return; var hs = S.mph || [];
  var ser = function (k) { return hs.filter(function (e) { return e[k] != null }).map(function (e) { return { d: e.d, v: +e[k] } }) };
  el.innerHTML = '<p class="hint">Ogni volta che applichi una lettura viene salvata una voce per quel giorno, così vedi come cambiano win rate e stelle.</p>' +
    mpSpark(ser("wr"), "Win rate", "%") + mpSpark(ser("stars"), "Stelle rank", "") +
    (hs.length ? '<div class="htab" role="table" aria-label="Storico del profilo"><div class="hr hh" role="row"><span>Data</span><span>Win rate</span><span>Partite</span><span>Stelle</span><span></span></div>' + hs.slice().reverse().map(function (e) { return '<div class="hr" role="row"><span>' + mpDd(e.d) + '</span><span>' + (e.wr != null ? mpFmt(e.wr) + "%" : "—") + '</span><span>' + (e.games != null ? e.games : "—") + '</span><span>' + (e.stars != null ? e.stars : "—") + '</span><button class="hx" data-d="' + e.d + '" aria-label="Elimina la voce del ' + mpDd(e.d) + '">×</button></div>' }).join("") + '</div>' : '<p class="hint">Nessuna voce ancora.</p>') +
    '<button class="btn sm" id="msnap" style="width:100%;margin-top:8px">Salva i dati attuali nello storico</button>';
  [].forEach.call(el.querySelectorAll(".spk"), function (f) { var t = f.querySelector(".sptip");[].forEach.call(f.querySelectorAll(".hit"), function (c) { c.onclick = function () { t.textContent = c.dataset.t } }) });
  [].forEach.call(el.querySelectorAll(".hx"), function (b) { b.onclick = function () { S.mph = S.mph.filter(function (e) { return e.d !== b.dataset.d }); save(); mpHist() } });
  $("msnap").onclick = function () { if (mpSnap()) { save(); mpHist() } else toast("Inserisci almeno win rate, partite o stelle prima di salvare.", "err") }
}
function mpCard() {
  var el = $("mpc"), m = S.mp = S.mp && typeof S.mp === "object" ? S.mp : {}, shot = SHOT;
  m.h = m.h || [{}, {}, {}];
  var opt = function (v) { return '<option value="">-</option>' + RKL.map(function (r) { return '<option' + (r === v ? " selected" : "") + '>' + r + '</option>' }).join("") };
  var inp = function (k, lab, type, extra) { return '<label class="k">' + lab + '<input data-k="' + k + '" type="' + type + '" ' + (extra || "") + ' value="' + esc(m[k] == null ? "" : String(m[k])) + '"></label>' };
  el.innerHTML = '<div class="ph">Profilo MLBB</div>' +
    (shot ? '<img class="mshot" id="mshot" src="' + shot + '" alt="Screenshot del profilo MLBB"><div class="two" style="margin-top:8px"><button class="btn sm" id="mchg">Cambia screenshot</button><button class="btn rd sm" id="mdel">Rimuovi</button></div><button class="btn sm" id="mocr" style="width:100%;margin-top:8px">Leggi i dati dallo screenshot</button><p class="hint" id="mst" style="margin-top:8px"></p><div id="mres"></div>' : '<button class="mup" id="mchg">+ Carica screenshot del profilo</button>') +
    '<input type="file" accept="image/*" id="mfile" hidden>' +
    '<p class="hint" style="margin-top:10px">Lo screenshot resta solo su questo dispositivo. Con "Leggi i dati" l\'app prova a riconoscere i numeri: controlla sempre il risultato e correggi i campi qui sotto.</p>' +
    '<div class="mf">' + inp("id", "ID gioco", "text", 'maxlength="20" inputmode="numeric"') + inp("zone", "Server", "text", 'maxlength="10" inputmode="numeric"') +
    '<label class="k">Rank attuale<select data-k="rank">' + opt(m.rank) + '</select></label><label class="k">Rank massimo<select data-k="best">' + opt(m.best) + '</select></label>' +
    inp("lvl", "Livello", "number", 'min="0" max="999"') + inp("games", "Partite", "number", 'min="0"') + inp("wr", "Win rate %", "number", 'min="0" max="100" step="0.1"') + inp("mvp", "MVP", "number", 'min="0"') + inp("kda", "KDA", "number", 'min="0" step="0.01"') + inp("stars", "Stelle rank attuali", "number", 'min="0"') + inp("bstars", "Stelle rank massime", "number", 'min="0"') + inp("streak", "Serie vittorie max", "number", 'min="0"') + inp("heroes", "Eroi posseduti", "number", 'min="0"') + inp("skins", "Skin", "number", 'min="0"') + '</div>' +
    '<details class="mx"' + (m.ext && Object.keys(m.ext).length ? " open" : "") + '><summary class="k">Statistiche dettagliate</summary><div class="mf">' + Object.keys(XN).map(function (k) { var v = m.ext && m.ext[k]; return '<label class="k">' + XN[k] + '<input data-x="' + k + '" type="number" min="0" value="' + (v == null ? "" : esc(String(v))) + '"></label>' }).join("") + '</div></details>' +
    '<div class="k" style="margin-top:12px">Eroi più usati</div><div id="mph"></div>' +
    '<div class="ph" style="margin-top:16px">Storico</div><div id="mhist"></div>';
  var hb = $("mph");
  for (var i = 0; i < 3; i++)(function (i) {
    var h = m.h[i] = m.h[i] || {}, d = document.createElement("div"); d.className = "mh";
    d.innerHTML = '<button class="bslot" style="aspect-ratio:auto;min-height:44px;flex-direction:row;gap:6px;justify-content:flex-start;padding:4px 8px;' + (h.n && H[h.n] ? "border-style:solid" : "") + '">' + (h.n && H[h.n] ? tile(h.n, "xs") + "<span>" + esc(h.n) + "</span>" : "+ Eroe " + (i + 1)) + '</button>' +
      '<label class="k">Partite<input type="number" min="0" data-c="g" value="' + esc(h.g == null ? "" : String(h.g)) + '"></label><label class="k">WR %<input type="number" min="0" max="100" step="0.1" data-c="w" value="' + esc(h.w == null ? "" : String(h.w)) + '"></label>';
    d.firstChild.onclick = function () { openPick("Eroe più usato " + (i + 1), NAMES, function (n) { h.n = n; save(); mpCard() }, { cur: h.n, rm: h.n ? function () { h.n = null; save(); mpCard() } : null }) };
    [].forEach.call(d.querySelectorAll("input"), function (x) { x.onchange = function () { var v = x.value === "" ? null : Math.max(0, +x.value); if (v != null && x.dataset.c === "w") v = Math.min(100, v); h[x.dataset.c] = v; save() } });
    hb.appendChild(d)
  })(i);
  [].forEach.call(el.querySelectorAll("[data-k]"), function (x) { x.onchange = function () { var k = x.dataset.k, v = x.value.trim(); if (x.type === "number") { v = v === "" ? null : Math.max(0, +v); if (k === "wr" && v != null) v = Math.min(100, v) } m[k] = v === "" ? null : v; save() } });
  [].forEach.call(el.querySelectorAll("[data-x]"), function (x) { x.onchange = function () { m.ext = m.ext || {}; m.ext[x.dataset.x] = x.value === "" ? null : Math.max(0, Math.round(+x.value)); save() } });
  mpHist();
  $("mchg").onclick = function () { $("mfile").click() };
  $("mfile").onchange = function () {
    var f = this.files[0]; if (!f) return;
    mpShot(f, function (d) {
      if (!d) { toast("Immagine non valida.", "err"); return }
      shotSet(d).then(function () { SHOT = d; mpCard() }).catch(function () { try { localStorage.setItem(KEY.shot, d); SHOT = d; mpCard() } catch (e) { toast("Memoria del dispositivo piena: screenshot non salvato.", "err") } })
    })
  };
  if (shot) {
    $("mocr").onclick = function () { var b = this, st = $("mst"); if (!window.Tesseract && !navigator.onLine) { st.textContent = "Sei offline: la prima volta il lettore dello screenshot va scaricato da internet. Riprova con la connessione, oppure compila a mano i campi qui sotto."; return } b.disabled = true; $("mres").innerHTML = ""; mpRead(shot, st).then(function (R) { st.textContent = ""; mpShow(R) }).catch(function () { st.textContent = "Lettura non riuscita: serve la connessione la prima volta per scaricare il lettore. Riprova online." }).then(function () { b.disabled = false }) };
    $("mdel").onclick = function () { try { localStorage.removeItem(KEY.shot) } catch (e) { } shotSet(null).catch(function () { }); SHOT = ""; mpCard() };
    $("mshot").onclick = function () { var o = document.createElement("div"); o.style.cssText = "position:fixed;inset:0;z-index:99;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:12px"; o.innerHTML = '<img src="' + shot + '" alt="" style="max-width:100%;max-height:100%;object-fit:contain">'; o.onclick = function () { o.remove() }; document.body.appendChild(o) }
  }
}
