/* La torre laterale, sempre con la skin base (Mattoncini). Una sezione = un pezzo: cade con rimbalzo quando la sezione sale oltre il 62% dello schermo,
   e sparisce se si torna su. Lo stato si ricalcola dalla posizione delle sezioni a ogni scroll (niente callback da incastrare), quindi
   salti, ricarica a meta' pagina e resize danno sempre la torre giusta. Oscilla con la velocita' dello scroll, crolla (per gioco) se si scorre troppo forte.
   Si vede solo dove c'e' spazio a lato del contenuto; altrove resta la barra a blocchi in alto. */
(function (T) {
  "use strict";
  var COLS = 4, SEQ = ["I", "O", "T", "L", "J", "S", "Z", "I", "O", "T", "L", "J"];
  var items = [], secs = [], cell = 28, rowsMax = 0, shown = -1, crashing = false, lastCrash = 0, wide = false;
  var root, stack, hud, hudBox, meters = { v: 0 };

  function build() {
    stack.innerHTML = ""; items = [];
    var G = T.newGrid(COLS), rnd = function () { return 0; }; /* sempre la migliore: la torre e' sempre la stessa */
    SEQ.forEach(function (kind, i) {
      var pos = T.bestSpot(G, kind, rnd); T.commit(G, pos);
      var el = T.pieceEl("button", kind, pos.rot, T.skin);
      el.style.visibility = "hidden";
      el.addEventListener("click", function () { var s = secs[i]; if (s) s.scrollIntoView({ behavior: T.reduce ? "auto" : "smooth" }); });
      stack.appendChild(el);
      items.push({ el: el, pos: pos, on: false });
    });
    rowsMax = G.height;
  }

  function layout() {
    var vw = window.innerWidth, gutter = (vw - 1140) / 2 - 28;
    cell = Math.max(0, Math.min(40, Math.floor(gutter / COLS)));
    wide = cell >= 20;
    root.classList.toggle("on", wide);
    document.documentElement.classList.toggle("has-torre", wide);
    if (!wide) return;
    root.style.setProperty("--c", cell + "px");
    stack.style.height = rowsMax * cell + "px"; stack.style.width = COLS * cell + "px";
    items.forEach(function (it) { T.placeEl(it.el, it.pos, cell); });
    updateMeters(true);
  }

  function updateMeters(now) {
    var top = 0; items.forEach(function (it) { if (it.on) top = Math.max(top, it.pos.top); });
    gsap.to(meters, { v: top, duration: now ? 0 : .6, ease: "power2.out", onUpdate: function () { hud.textContent = Math.round(meters.v); } });
    gsap.to(hudBox, { y: (rowsMax - top) * cell, duration: now ? 0 : .9, ease: "bounce.out", overwrite: "auto" });
  }

  function show(i, on) {
    var it = items[i]; if (!it || it.on === on) return;
    it.on = on; gsap.killTweensOf(it.el);
    if (on) {
      it.el.style.visibility = "visible";
      if (T.reduce) gsap.set(it.el, { clearProps: "transform,opacity" });
      else gsap.fromTo(it.el, { y: -(window.innerHeight * .7 + i * 14), rotation: gsap.utils.random(-35, 35), opacity: 0, scaleY: 1.15, scaleX: .9 }, { y: 0, rotation: 0, opacity: 1, scaleY: 1, scaleX: 1, duration: .95, ease: "bounce.out", clearProps: "opacity" });
    } else if (T.reduce) it.el.style.visibility = "hidden";
    else gsap.to(it.el, { y: -260, opacity: 0, rotation: gsap.utils.random(-25, 25), duration: .35, ease: "power1.in", onComplete: function () { if (!it.on) { gsap.set(it.el, { clearProps: "transform,opacity" }); it.el.style.visibility = "hidden"; } } });
  }

  /* quante sezioni hanno gia' passato la soglia: il primo pezzo c'e' sempre */
  function count() {
    var line = window.innerHeight * .62, n = 1;
    for (var i = 1; i < secs.length; i++) if (secs[i].getBoundingClientRect().top < line) n = i + 1; else break;
    return n;
  }
  function sync() {
    if (!wide || crashing) return;
    var n = count(); if (n === shown) return; shown = n;
    items.forEach(function (it, i) { show(i, i < n); });
    updateMeters(false);
  }

  function crash() {
    var now = performance.now();
    if (!wide || crashing || now - lastCrash < 15000) return;
    var live = items.filter(function (it) { return it.on; }); if (live.length < 6) return;
    crashing = true; lastCrash = now;
    var oops = T.$("tOops"), tl = gsap.timeline();
    tl.to(oops, { opacity: 1, scale: 1, duration: .25, ease: "back.out(2)" }, 0);
    live.forEach(function (it, k) {
      tl.to(it.el, { x: gsap.utils.random(-cell * 4, cell), y: gsap.utils.random(cell, cell * 4), rotation: gsap.utils.random(-220, 220), duration: .55, ease: "power2.in" }, k * .02);
      tl.to(it.el, { opacity: 0, duration: .2 }, .5 + k * .02);
    });
    tl.add(function () {
      live.forEach(function (it, k) { gsap.set(it.el, { clearProps: "transform,opacity" }); gsap.fromTo(it.el, { y: -window.innerHeight * .7, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: "bounce.out", delay: k * .09, clearProps: "opacity" }); });
      gsap.to(oops, { opacity: 0, scale: .6, duration: .3, delay: .5 });
      gsap.delayedCall(.9 + live.length * .09, function () { crashing = false; shown = -1; sync(); });
    }, ">+.15");
  }

  T.torreAccesi = function () { return items.filter(function (it) { return it.on; }).length; }; /* per i controlli */

  T.initTorre = function () {
    root = T.$("torre"); stack = T.$("tStack"); hud = T.$("tMeters"); hudBox = hud.parentNode;
    secs = Array.prototype.slice.call(document.querySelectorAll("section[data-tp]"));
    build(); layout();
    function labels() { items.forEach(function (it, i) { var s = secs[i], h = s && s.querySelector("h2"); var t = h ? (h.getAttribute("aria-label") || h.textContent).replace(/\s+/g, " ").trim() : "Topplers"; it.el.setAttribute("data-label", t); it.el.setAttribute("aria-label", t); }); }
    labels(); document.addEventListener("tp:lang", labels);
    window.addEventListener("resize", function () { layout(); shown = -1; sync(); });

    var qRot = T.reduce ? null : gsap.quickTo(stack, "rotation", { duration: .7, ease: "elastic.out(1,.35)" }), reset;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: function (self) {
      sync();
      if (!qRot || !wide) return;
      var v = self.getVelocity();
      qRot(gsap.utils.clamp(-5, 5, v / 700));
      if (Math.abs(v) > 9000) crash();
      if (reset) reset.kill(); reset = gsap.delayedCall(.14, function () { qRot(0); });
    } });
    ScrollTrigger.addEventListener("refresh", function () { shown = -1; sync(); });
    sync();
    /* barra a blocchi (telefoni e schermi stretti) */
    gsap.to("#progress i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: .25 } });
  };
})(window.Topplers);
