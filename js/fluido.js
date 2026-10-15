/* Ingresso a tendina, barra che si nasconde scorrendo in giu' e torna salendo, sottomenu della sezione Kickstarter che segue lo scorrimento. */
(function () {
  "use strict";
  var intro = document.getElementById("intro");
  function closeIntro() { if (intro) { intro.classList.add("out"); var i = intro; intro = null; setTimeout(function () { i.parentNode && i.parentNode.removeChild(i); }, 1100); } }
  var t0 = Date.now();
  function ready() { setTimeout(closeIntro, Math.max(0, 900 - (Date.now() - t0))); }
  if (document.readyState === "complete") ready(); else window.addEventListener("load", ready);
  setTimeout(closeIntro, 3500); /* mai bloccare la pagina */

  var nav = document.querySelector(".nav"), last = window.scrollY, busy = false;
  window.addEventListener("scroll", function () {
    if (busy) return; busy = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, d = y - last;
      nav.classList.toggle("lift", y > 8);
      if (Math.abs(d) > 6) {
        var hide = d > 0 && y > 240;
        nav.classList.toggle("hide", hide); document.body.classList.toggle("nav-hidden", hide);
        last = y;
      }
      busy = false;
    });
  }, { passive: true });

  var tabs = document.getElementById("ksTabs");
  if (tabs && "IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(tabs.querySelectorAll("a"));
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); }); });
    }, { rootMargin: "-35% 0px -55% 0px" });
    links.forEach(function (a) { var b = document.querySelector(a.getAttribute("href")); if (b) io.observe(b); });
  }

  /* decorazioni della sezione Kickstarter: salgono a velocita' diverse mentre si scorre (variabile CSS, cosi' non litiga con l'ondeggio) */
  window.addEventListener("load", function () {
    if (!(window.gsap && window.ScrollTrigger) || (window.Topplers && window.Topplers.reduce) || !document.querySelector(".ks-deco")) return;
    document.querySelectorAll(".ks-deco .kd").forEach(function (el, i) {
      gsap.fromTo(el, { "--py": "0px" }, { "--py": (i % 2 ? -1 : 1) * (90 + i * 24) + "px", ease: "none", scrollTrigger: { trigger: ".ks", start: "top bottom", end: "bottom top", scrub: .8 } });
    });
  });
})();
