/* Conto alla rovescia al lancio. Senza data (CONFIG.DATA_LANCIO) mostra "data in arrivo" e nasconde i numeri. */
(function (T) {
  "use strict";
  var iso = (window.CONFIG || {}).DATA_LANCIO, target = iso ? Date.parse(iso) : NaN;
  var row = T.$("cdRow"), label = T.$("cdLabel"), cells = {}, last = {}, timer = null;
  row.querySelectorAll("[data-u]").forEach(function (b) { cells[b.getAttribute("data-u")] = b; });

  function set(u, v) {
    var s = (v < 10 ? "0" : "") + v;
    if (last[u] === s) return;
    last[u] = s; cells[u].textContent = s;
    if (!T.reduce) { cells[u].classList.remove("tick"); void cells[u].offsetWidth; cells[u].classList.add("tick"); }
  }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) { row.hidden = true; label.textContent = T.t("cd_live"); clearInterval(timer); return; }
    var s = Math.floor(diff / 1000);
    set("d", Math.floor(s / 86400)); set("h", Math.floor(s % 86400 / 3600)); set("m", Math.floor(s % 3600 / 60)); set("s", s % 60);
  }
  function paint() {
    if (isNaN(target)) { row.hidden = true; label.textContent = T.t("cd_soon"); return; }
    row.hidden = false; label.textContent = T.t("cd_to");
    if (target - Date.now() <= 0) tick();
  }
  document.addEventListener("tp:lang", paint);
  if (!isNaN(target)) { tick(); timer = setInterval(tick, 1000); }
})(window.Topplers);
