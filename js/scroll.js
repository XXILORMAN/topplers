/* Animazioni allo scorrimento (GSAP + ScrollTrigger): titoli lettera per lettera, carte che atterrano, contatori,
   inclinazione 3D, parallasse, costruzione libera con righello fissato, roadmap che si disegna. Con movimento ridotto resta tutto fermo e leggibile. */
(function (T) {
  "use strict";
  var $ = T.$;

  /* ---------- titoli di plastica a lettere ---------- */
  function splitText(root) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            part.split("").forEach(function (ch) { var c = document.createElement("span"); c.className = "c"; c.setAttribute("aria-hidden", "true"); c.textContent = ch; w.appendChild(c); });
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    })(root);
  }
  var heads = [];
  function splitHeads() {
    heads.forEach(function (el) {
      var label = el.textContent; splitText(el); el.setAttribute("aria-label", label.replace(/\s+/g, " ").trim());
      if (!el._shown && !T.reduce) gsap.set(el.querySelectorAll(".c"), { opacity: 0 });
    });
  }
  function animHead(el) {
    el._shown = true;
    if (T.reduce) return;
    gsap.fromTo(el.querySelectorAll(".c"), { y: 70, rotation: function () { return gsap.utils.random(-28, 28); }, scale: .3, opacity: 0 },
      { y: 0, rotation: 0, scale: 1, opacity: 1, duration: .75, ease: "back.out(2.4)", stagger: { each: .028, from: "start" }, clearProps: "transform" });
  }
  function initHeads() {
    heads = Array.prototype.slice.call(document.querySelectorAll("h2.pl, .hero .claim"));
    heads.forEach(function (el) { ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: function () { animHead(el); } }); });
    splitHeads();
    document.addEventListener("tp:lang", function () { heads.forEach(function (el) { el.removeAttribute("aria-label"); }); /* i testi sono stati riscritti da i18n */ splitHeads(); });
    /* le lettere saltellano al passaggio del puntatore */
    if (!T.reduce) document.addEventListener("pointerover", function (e) {
      var c = e.target.closest && e.target.closest(".pl .c"); if (!c || c._busy) return;
      c._busy = true; gsap.to(c, { y: -10, rotation: gsap.utils.random(-14, 14), duration: .16, yoyo: true, repeat: 1, ease: "power2.out", onComplete: function () { c._busy = false; } });
    });
  }

  /* ---------- carte che atterrano ---------- */
  function initReveals() {
    document.querySelectorAll(".lede").forEach(function (el) { el.setAttribute("data-rv", "up"); });
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-rv]"));
    if (T.reduce) return;
    els.forEach(function (el) { el.classList.add("rv-wait"); });
    ScrollTrigger.batch(els, {
      start: "top 92%", once: true,
      onEnter: function (batch) {
        batch.forEach(function (el, i) {
          var k = el.getAttribute("data-rv");
          var from = k === "left" ? { x: -90, rotation: -2 } : k === "right" ? { x: 90, rotation: 2 } : k === "up" ? { y: 46 } : { y: 90, rotation: gsap.utils.random(-5, 5), scaleY: .85, scaleX: 1.04 };
          el.classList.remove("rv-wait");
          gsap.fromTo(el, Object.assign({ opacity: 0 }, from), { opacity: 1, x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: .85, ease: k === "pop" ? "back.out(1.6)" : "power3.out", delay: i * .09, clearProps: "transform,opacity" });
        });
      }
    });
  }

  /* ---------- inclinazione 3D dei telefoni e delle carte ---------- */
  function initTilt() {
    if (!T.fine || T.reduce) return;
    var cur = null;
    function rest(el) { gsap.to(el, { rotationX: 0, rotationY: 0, duration: .7, ease: "elastic.out(1,.5)", overwrite: "auto" }); }
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest && e.target.closest("[data-tilt]");
      if (cur && cur !== el) rest(cur);
      cur = el; if (!el) return;
      var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      gsap.to(el, { rotationY: px * 16, rotationX: -py * 14, transformPerspective: 900, duration: .35, ease: "power2.out", overwrite: "auto" });
    });
    document.addEventListener("pointerleave", function () { if (cur) { rest(cur); cur = null; } }, true);
  }

  /* ---------- hero: ingresso e parallasse ---------- */
  function initHero() {
    if (T.reduce) return;
    gsap.from(".hero-copy > *:not(.marchio):not(.claim)", { y: 40, opacity: 0, duration: .8, ease: "power3.out", stagger: .1, delay: .15, clearProps: "transform,opacity" });
    gsap.from(".hero .phone", { y: 140, rotation: -10, opacity: 0, duration: 1.1, ease: "back.out(1.4)", delay: .3, clearProps: "opacity" });
    gsap.from(".hero .orb", { scale: 0, duration: 1, ease: "elastic.out(1,.5)", delay: .5, clearProps: "scale" });
    var st = { trigger: "#hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero .phone", { yPercent: -14, ease: "none", scrollTrigger: st });
    gsap.to(".hero .orb", { yPercent: -60, ease: "none", scrollTrigger: st });
    gsap.to(".hero-clouds", { yPercent: 18, ease: "none", scrollTrigger: st });
    gsap.utils.toArray(".float").forEach(function (el) { gsap.to(el, { yPercent: -60 * (+el.getAttribute("data-speed") || .5), ease: "none", scrollTrigger: st }); });
    gsap.to(".scroll-cue", { opacity: 0, y: 20, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "+=220", scrub: true } });
    gsap.to(".hero-copy .marchio", { yPercent: -8, ease: "none", scrollTrigger: st });
  }

  /* ---------- contatori, meter, righe ---------- */
  function initNumbers() {
    ScrollTrigger.create({ trigger: "#tiers", start: "top 80%", once: true, onEnter: function () {
      document.querySelectorAll(".price[data-count]").forEach(function (el) {
        var n = +el.getAttribute("data-count"), o = { v: 0 };
        if (T.reduce) return;
        gsap.to(o, { v: n, duration: 1.4, ease: "power2.out", onUpdate: function () { el.textContent = T.money(Math.round(o.v)); }, onComplete: function () { el.textContent = T.money(n); } });
      });
    } });
    ScrollTrigger.create({ trigger: "#statuslist", start: "top 80%", once: true, onEnter: function () {
      if (!T.reduce) gsap.from("#statuslist .meter i.on", { scaleX: 0, duration: .6, ease: "power3.out", stagger: .04, delay: .25 });
    } });
    if (!T.reduce) {
      gsap.fromTo("#roadline", { scaleY: 0, transformOrigin: "50% 0" }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".roadwrap", start: "top 70%", end: "bottom 70%", scrub: true } });
      gsap.from(".simcard", { scale: .94, duration: .6, ease: "back.out(1.6)", scrollTrigger: { trigger: ".simcard", start: "top 85%", once: true } });
      /* il simulatore parte da poco e sale al valore, una volta */
      ScrollTrigger.create({ trigger: "#goals", start: "top 55%", once: true, onEnter: function () {
        var sim = $("sim"), end = +sim.value, o = { v: 1500 };
        gsap.to(o, { v: end, duration: 2.2, ease: "power2.inOut", onUpdate: function () { sim.value = Math.round(o.v / 50) * 50; T.updateGoals(true); } });
      } });
    }
  }

  /* ---------- barra alta: sezione corrente ---------- */
  function initNav() {
    document.querySelectorAll(".links a").forEach(function (a) {
      var sec = document.querySelector(a.getAttribute("href")); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: function (s) { a.classList.toggle("on", s.isActive); } });
    });
  }

  T.initScroll = function () {
    initHeads(); initReveals(); initTilt(); initHero(); initNumbers(); initNav();
  };
})(window.Topplers);
