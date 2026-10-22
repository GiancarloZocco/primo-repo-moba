/* MLBB TOP - Animazioni a tema MOBA: lock-in del pick, timbro del ban, Vittoria/Sconfitta, annunci delle serie.
   Con "riduci animazioni" attivo sul telefono non parte niente. */
var FXOFF = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
/* slot appena riempiti: chi disegna lo slot aggiunge la classe dell'animazione e poi li dimentica */
var FX = { slot: null, ban: null, full: null };
function fxTake(k, id) { if (FX[k] !== id) return false; FX[k] = null; return !FXOFF }
/* scritta a tutto schermo che sparisce da sola (o toccandola) */
function fxShow(cls, html, ms) {
  if (FXOFF) return; var o = document.createElement("div"); o.className = "fx " + cls; o.innerHTML = html; o.setAttribute("aria-hidden", "true");
  var gone = function () { if (o.parentNode) o.remove() }; o.onclick = gone; document.querySelector(".app").appendChild(o); setTimeout(gone, ms)
}
function fxResult(win) {
  fxShow(win ? "win" : "lose", win ? '<div class="rays"></div><b>Vittoria</b>' : '<div class="crack"></div><b>Sconfitta</b>', 1700)
}
/* annunci come nel gioco: 2 di fila Double Kill, 3 Triple Kill, 4 Maniac, 5 o più Savage */
var STREAK = [null, null, "Double Kill", "Triple Kill", "Maniac", "Savage"];
function fxStreak(n, what) {
  if (n < 2) return; var t = STREAK[Math.min(n, 5)];
  fxShow("streak" + (n >= 4 ? " big" : ""), '<div class="band"><b>' + t + '</b><small>' + n + ' ' + what + ' di fila</small></div>', 1600)
}
/* vittorie consecutive in fondo allo storico */
function winRun() { var n = 0; for (var i = S.games.length - 1; i >= 0 && S.games[i].r; i--) n++; return n }
/* draft completo (10 eroi): le due squadre si scontrano al centro. Solo quando lo diventa, non a ogni apertura */
function fxDraftDone(full) {
  if (FX.full === false && full) fxShow("clash", '<div class="half l"></div><div class="half r"></div><div class="flash"></div><b>Draft completato<small>Buona partita!</small></b>', 1900);
  FX.full = full
}
/* scritta che sale da un elemento, come i numeri di danno/oro nel gioco */
function fxFloat(el, text, cls) {
  if (FXOFF || !el) return; var app = document.querySelector(".app"), a = app.getBoundingClientRect(), r = el.getBoundingClientRect(), f = document.createElement("span");
  f.className = "fxf " + (cls || ""); f.textContent = text; f.style.left = (r.left - a.left + r.width / 2) + "px"; f.style.top = (r.top - a.top) + "px"; f.setAttribute("aria-hidden", "true");
  app.appendChild(f); setTimeout(function () { f.remove() }, 1300)
}
/* nuovo rank nel quiz: emblema che sale e si illumina */
function fxRankUp(name) { fxShow("rankup", '<div class="emb"><i></i></div><b><small>Nuovo rank</small>' + esc(name) + '</b>', 2000) }
/* entrata delle schermate: classe temporanea usata anche dalle righe della tier list */
function fxEnter(el) { if (FXOFF || !el) return; el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); clearTimeout(el._fx); el._fx = setTimeout(function () { el.classList.remove("enter") }, 900) }
