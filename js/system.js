/* MLBB TOP - Backup, aggiornamento delle statistiche, avvio dell'app e service worker */
/* ---------- backup: un file JSON con tutto ciò che l'app salva sul dispositivo ---------- */
function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || "null") } catch (e) { return null } }
function exportBackup() {
  var data = { app: "mlbb-top", v: 1, at: new Date().toISOString(), S: S, live: lsGet("draftsync_live"), prev: lsGet("draftsync_prev"), shot: SHOT || null };
  var blob = new Blob([JSON.stringify(data)], { type: "application/json" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "mlbb-top-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove() }, 1000);
  toast("Backup esportato: conserva il file per ripristinare i dati.", "ok")
}
function importBackup(file) {
  var r = new FileReader();
  r.onload = function () {
    var d; try { d = JSON.parse(r.result) } catch (e) { d = null }
    if (!d || d.app !== "mlbb-top" || !d.S || typeof d.S !== "object") { toast("File non valido: non è un backup di MLBB TOP.", "err"); return }
    if (!confirm("Ripristinare il backup del " + new Date(d.at).toLocaleDateString("it-IT") + "? I dati attuali verranno sostituiti.")) return;
    try {
      localStorage.setItem("draftsync", JSON.stringify(d.S));
      if (d.live) localStorage.setItem("draftsync_live", JSON.stringify(d.live)); else localStorage.removeItem("draftsync_live");
      if (d.prev) localStorage.setItem("draftsync_prev", JSON.stringify(d.prev)); else localStorage.removeItem("draftsync_prev");
    } catch (e) { toast("Memoria del dispositivo piena: backup non ripristinato.", "err"); return }
    shotSet(typeof d.shot === "string" && /^data:image\//.test(d.shot) ? d.shot : null).catch(function () { }).then(function () { location.reload() })
  };
  r.onerror = function () { toast("Impossibile leggere il file.", "err") };
  r.readAsText(file)
}
/* scarica le 3 classifiche (tutti, mitico, gloria); cb(LV o null, classifiche fallite) */
function fetchLive(cb) {
  var ks = [["all", "all"], ["myth", "mythic"], ["glory", "glory"]], out = {}, n = 0, fail = 0;
  ks.forEach(function (k) {
    fetch("https://arena.rone.dev/api/heroes/rank?days=7&rank=" + k[1] + "&size=200").then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json() }).then(function (d) { if (!d || !d.data || !Array.isArray(d.data.records)) throw new Error("risposta non valida"); d.data.records.forEach(function (r) { var x = r.data, h = ID2[x.main_heroid]; if (!h) return; (out[h] = out[h] || {})[k[0]] = [+(x.main_hero_win_rate * 100).toFixed(2), +(x.main_hero_appearance_rate * 100).toFixed(2), +(x.main_hero_ban_rate * 100).toFixed(2)] }) }).catch(function () { fail++ }).then(function () {
      if (++n < 3) return;
      if (!Object.keys(out).length) { cb(null, fail); return }
      var LV = { rk: out, date: today(), t: Date.now() };
      /* la classifica in uso diventa quella "precedente" per le tendenze, ma solo se è di un altro giorno */
      if (META.date !== LV.date) { var old = {}; NAMES.forEach(function (h) { if (HX[h] && HX[h].rk) old[h] = HX[h].rk }); PREV = { rk: old, date: META.date }; try { localStorage.setItem("draftsync_prev", JSON.stringify(PREV)) } catch (e) { } }
      try { localStorage.setItem("draftsync_live", JSON.stringify(LV)) } catch (e) { }
      applyLive(LV); calcMeta(); cb(LV, fail)
    })
  })
}
function today() { return new Date().toLocaleDateString("it-IT") }
function liveUpdate(btn) {
  btn.disabled = true; btn.textContent = "...";
  fetchLive(function (LV, fail) {
    if (!LV) { btn.disabled = false; btn.textContent = "Riprova"; toast("Aggiornamento non riuscito: controlla la connessione e riprova.", "err"); return }
    rProfile(); if (fail) toast("Aggiornamento parziale: classifiche non scaricate " + fail + " su 3, le altre sono aggiornate."); else toast("Statistiche aggiornate.", "ok")
  })
}
/* aggiornamento automatico: una volta al giorno, in silenzio, solo se c'è internet (al massimo un tentativo ogni 3 ore) */
function autoLive() {
  if (S.autoLive === false || !navigator.onLine || (META.live && META.date === today())) return;
  var last = 0; try { last = +localStorage.getItem("draftsync_live_try") || 0 } catch (e) { }
  if (Date.now() - last < 3 * 3600e3) return;
  try { localStorage.setItem("draftsync_live_try", String(Date.now())) } catch (e) { }
  fetchLive(function (LV) {
    if (!LV) return;
    var a = document.activeElement; if ((a && a.tagName === "INPUT") || $("sheet").classList.contains("show")) return;
    var y = $("v-" + cur).scrollTop; ({ draft: rDraft, tier: rTier, heroes: rHeroes, hero: rHero, quiz: function () { }, profile: rProfile, cmp: rCmp })[cur](); $("v-" + cur).scrollTop = y
  })
}
function setAct() { var a = S.avatar && H[S.avatar] ? S.avatar : null; if (a) { $("act").innerHTML = tile(a, "xs"); $("act").setAttribute("aria-label", "Profilo") } }
function applyTheme() { document.body.classList.toggle("hc", S.theme === "hc") }
applyTheme(); setAct(); loadShared(); go("draft", true); setTimeout(autoLive, 1500); window.addEventListener("online", autoLive);
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { }) });    }
