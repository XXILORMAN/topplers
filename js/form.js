/* Modulo "avvisami al lancio". Valida l'email; con CONFIG.FORM_ENDPOINT invia un POST JSON, senza endpoint conferma soltanto
   (niente viene inviato o salvato). Il campo "website" e' un'esca per i robot. */
(function (T) {
  "use strict";
  var form = T.$("news"), msg = T.$("newsMsg"), input = T.$("email"), btn = form.querySelector("button");
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function say(key, bad) { msg.textContent = T.t(key); msg.className = "news-msg show" + (bad ? " err" : ""); }
  function done() {
    say("news_ok", false); form.classList.add("ok");
    var r = msg.getBoundingClientRect(); T.burst(r.left + r.width / 2, r.top, 18);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (form.website.value) return; /* esca compilata: un robot */
    var mail = input.value.trim();
    if (!EMAIL.test(mail)) { say("news_err", true); input.setAttribute("aria-invalid", "true"); input.focus(); if (window.gsap && !T.reduce) gsap.fromTo(input, { x: -8 }, { x: 0, duration: .5, ease: "elastic.out(1,.3)" }); return; }
    input.removeAttribute("aria-invalid");
    var url = (window.CONFIG || {}).FORM_ENDPOINT;
    if (!url) { done(); return; }
    btn.disabled = true; say("news_wait", false);
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ email: mail, lang: T.lang() }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { say("news_fail", true); })
      .then(function () { btn.disabled = false; });
  });
})(window.Topplers);
