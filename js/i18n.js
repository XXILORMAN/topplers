/* Lingua: IT/EN, scelta dal telefono o dal visitatore. Ogni [data-t] prende il testo; i disegnatori di render.js si rifanno al cambio. */
(function (T) {
  "use strict";
  var lang = "en";
  try { var saved = localStorage.getItem("topplers_lang"); if (saved === "it" || saved === "en") lang = saved; else if ((navigator.language || "").toLowerCase().indexOf("it") === 0) lang = "it"; } catch (e) {}
  var DICT = window.TESTI;
  T.lang = function () { return lang; };
  T.t = function (k, vars) {
    var s = (DICT[lang] && DICT[lang][k]) || DICT.en[k] || k;
    if (vars) Object.keys(vars).forEach(function (v) { s = s.replace("{" + v + "}", vars[v]); });
    return s;
  };
  T.money = function (v) { return new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v); };
  var renderers = [];
  T.onLang = function (fn) { renderers.push(fn); };
  T.applyLang = function () {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach(function (el) { el.innerHTML = T.t(el.getAttribute("data-t")); });
    document.querySelectorAll("[data-t-ph]").forEach(function (el) { el.placeholder = T.t(el.getAttribute("data-t-ph")); });
    document.querySelectorAll("[data-t-aria]").forEach(function (el) { el.setAttribute("aria-label", T.t(el.getAttribute("data-t-aria"))); });
    document.querySelectorAll(".langs button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"); });
    var skb = T.$("skybtn"); skb.setAttribute("aria-label", T.t("sky_note")); skb.title = T.t("sky_note");
    T.$("orb").setAttribute("aria-label", T.t("sky_note"));
    renderers.forEach(function (fn) { fn(); });
    document.dispatchEvent(new CustomEvent("tp:lang"));
  };
  document.querySelectorAll(".langs button").forEach(function (b) {
    b.addEventListener("click", function () {
      lang = b.getAttribute("data-lang");
      try { localStorage.setItem("topplers_lang", lang); } catch (e) {}
      T.applyLang();
    });
  });
})(window.Topplers);
