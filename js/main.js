/* Avvio. Se GSAP non carica la pagina resta statica e leggibile (testi e disegni vengono comunque scritti). */
(function (T) {
  "use strict";
  var ok = !!(window.gsap && window.ScrollTrigger);
  if (!ok) document.documentElement.className = "no-js";
  else { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  if (!ok) { T.applyLang(); return; }

  var small = window.innerWidth < 700;
  T.initLab();      /* prima della lingua: cosi' i suoi comandi vengono scritti al primo giro */
  T.initLibera();
  T.applyLang();
  T.initCielo();
  T.initLogo();
  T.initFloaters();
  T.Pila(T.$("pilaHero"), { count: small ? 7 : 12, floor: small ? 54 : 62, spawnOn: T.$("hero") });
  T.Pila(T.$("pilaClose"), { count: small ? 9 : 16, floor: 56, max: 30, skins: T.CLASSICHE, spawnOn: T.$("join"), rate: 120 });
  T.initTorre();
  T.initMondi();
  T.initScroll();
  T.initEffetti();

  function refresh() { ScrollTrigger.refresh(); }
  window.addEventListener("load", refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})(window.Topplers);
