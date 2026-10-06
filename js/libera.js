/* Costruzione libera: un altimetro da trascinare. Il pezzo sul cursore sale, le tappe 25 / 50 / 60 m si accendono (titolo, titolo piu' raro, skin Nuvole).
   Compatto, senza fissare la pagina. La prima volta che si vede sale da solo fino a 28 m per far capire come funziona. */
(function (T) {
  "use strict";
  var $ = T.$, MAX = 65, last = 0, auto = null, played = false;
  var range, out, fill;

  function paint(v, burst) {
    v = Math.round(v);
    out.textContent = v; range.value = v; range.style.setProperty("--p", (v / MAX * 100) + "%");
    range.setAttribute("aria-valuetext", v + " m");
    var lis = document.querySelectorAll("#miles li"), now = 0;
    lis.forEach(function (li) { var on = v >= +li.getAttribute("data-m"); if (on) now++; if (on !== li.classList.contains("on")) { li.classList.toggle("on", on); if (on && burst && !T.reduce) { var r = li.getBoundingClientRect(); T.burst(r.left + 30, r.top + r.height / 2, 12); gsap.fromTo(li, { scale: 1.06 }, { scale: 1, duration: .5, ease: "elastic.out(1,.4)" }); } } });
    last = now;
  }

  T.initLibera = function () {
    range = $("altRange"); out = $("altOut");
    range.max = MAX;
    T.onLang(function () { paint(+range.value, false); });
    range.addEventListener("input", function () { if (auto) { auto.kill(); auto = null; } paint(+range.value, true); });
    range.addEventListener("pointerdown", function () { if (auto) { auto.kill(); auto = null; } });
    paint(0, false);
    ScrollTrigger.create({ trigger: "#alt", start: "top 80%", once: true, onEnter: function () {
      if (played || T.reduce) { paint(60, false); return; }
      played = true; var o = { v: 0 };
      auto = gsap.to(o, { v: 28, duration: 2.2, ease: "power2.inOut", delay: .3, onUpdate: function () { paint(o.v, true); } });
    } });
  };
})(window.Topplers);
