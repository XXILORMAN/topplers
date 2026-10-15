/* Interruttore Kickstarter: con CONFIG.KICKSTARTER_ATTIVO === false toglie dalla pagina tutto cio' che e' marcato data-ks
   (sezione, link in barra, tasti, conto alla rovescia). Gira prima di ogni altro script del sito. */
(function () {
  "use strict";
  var on = (window.CONFIG || {}).KICKSTARTER_ATTIVO !== false;
  window.KS_ATTIVO = on;
  if (on) return;
  document.querySelectorAll("[data-ks]").forEach(function (el) { el.parentNode && el.parentNode.removeChild(el); });
})();
