/* MLBB TOP - aggiorna i file generati prima di pubblicare
   - img/list.json: elenco delle immagini locali (il service worker le salva tutte)
   - sw.js: CORE (file dell'app letti da index.html e manifest.json) e VERSION
     (impronta del contenuto: cambia da sola quando cambia un file, così chi ha
     l'app installata riceve la versione nuova)
   Uso:  npm run build          aggiorna i file
         node tools/build.js --check   esce con errore se andrebbero aggiornati (usato dai test) */
var fs = require("fs"), path = require("path"), crypto = require("crypto");
var ROOT = path.join(__dirname, ".."), check = process.argv.indexOf("--check") > -1;
function rd(f) { return fs.readFileSync(path.join(ROOT, f)) }

var imgs = fs.readdirSync(path.join(ROOT, "img")).filter(function (f) { return /\.webp$/.test(f) }).sort().map(function (f) { return "img/" + f });
var listJson = JSON.stringify(imgs, null, 0).replace(/","/g, "\",\n\"").replace("[\"", "[\n\"").replace("\"]", "\"\n]");

var html = rd("index.html").toString(), manifest = JSON.parse(rd("manifest.json"));
var local = function (u) { return u && !/^[a-z]+:|^\/\//i.test(u) };
var core = ["index.html"];
html.replace(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/g, function (m, u) { if (local(u)) core.push(u) });
html.replace(/<link[^>]+href="([^"]+)"[^>]*rel="stylesheet"/g, function (m, u) { if (local(u) && core.indexOf(u) < 0) core.push(u) });
html.replace(/<script[^>]+src="([^"]+)"/g, function (m, u) { if (local(u)) core.push(u) });
core.push("manifest.json");
/* font dei temi: si salvano anche loro, così il tema funziona offline */
if (fs.existsSync(path.join(ROOT, "fonts"))) fs.readdirSync(path.join(ROOT, "fonts")).filter(function (f) { return /\.woff2$/.test(f) }).sort().forEach(function (f) { core.push("fonts/" + f) });
(manifest.icons || []).forEach(function (i) { if (core.indexOf(i.src) < 0) core.push(i.src) });
core.forEach(function (f) { if (!fs.existsSync(path.join(ROOT, f))) { console.error("File mancante: " + f); process.exit(1) } });

var h = crypto.createHash("sha1");
core.forEach(function (f) { h.update(f); h.update(rd(f)) });
h.update(listJson); imgs.forEach(function (f) { h.update(f) });
var version = h.digest("hex").slice(0, 10);

var sw = rd("sw.js").toString();
var sw2 = sw.replace(/var VERSION = "[^"]*";/, 'var VERSION = "' + version + '";')
  .replace(/var CORE = \[[^\]]*\];/, "var CORE = [" + ["./"].concat(core.map(function (f) { return "./" + f })).map(function (f) { return JSON.stringify(f) }).join(", ") + "];");

var listOld = fs.existsSync(path.join(ROOT, "img/list.json")) ? rd("img/list.json").toString() : "";
var stale = [];
if (listOld !== listJson) stale.push("img/list.json");
if (sw2 !== sw) stale.push("sw.js");
if (check) {
  if (stale.length) { console.error("Da aggiornare con npm run build: " + stale.join(", ")); process.exit(1) }
  console.log("File generati aggiornati (versione " + version + ")"); process.exit(0);
}
fs.writeFileSync(path.join(ROOT, "img/list.json"), listJson);
fs.writeFileSync(path.join(ROOT, "sw.js"), sw2);
console.log((stale.length ? "Aggiornati: " + stale.join(", ") : "Niente da aggiornare") + " · versione " + version + " · " + core.length + " file dell'app · " + imgs.length + " immagini");
