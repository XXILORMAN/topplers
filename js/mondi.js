/* I mondi: la sezione si ferma e scorrendo i pannelli scivolano di lato (ScrollTrigger: pin + scrub, con containerAnimation per le parti interne).
   Ogni pannello ha uno sfondo che si muove a velocita' diversa (parallasse): la scritta gigante, l'elemento del mondo (mulino, baita, vulcano), le colline.
   Il telefono ruota, i testi entrano uno a uno e il cielo cambia mondo. Gli sfondi si dissolvono l'uno nell'altro.
   Con movimento ridotto restano impilati. Senza JS idem. */
(function (T) {
  "use strict";
  var $ = T.$;
  var SKY = ["plains", "plains", "ice", "lava"];

  T.initMondi = function () {
    var sec = $("worlds"), pin = $("hsPin"), track = $("hsTrack"), panels = Array.prototype.slice.call(track.querySelectorAll(".hs-panel")), n = panels.length;
    T.watchClips(track);
    function stops() {
      $("hsStops").innerHTML = panels.map(function (p, i) {
        var label = i === 0 ? "·" : "0" + i + " " + T.t(["", "w_plains", "w_ice", "w_lava"][i]);
        return '<button type="button" data-i="' + i + '" aria-label="' + label.replace(/"/g, "") + '">' + label + "</button>";
      }).join("");
    }
    stops();

    /* La scritta gigante dietro: il corpo si sceglie in modo che la parola intera stia nel pannello (prima era fisso e la tagliava).
       Sul telefono, se conviene, la parola va a capo. `_slack` e' quanto puo' spostarsi di lato la parallasse senza uscire. */
    var on = false;
    function fitBig() {
      panels.forEach(function (p) {
        var big = p.querySelector(".hs-big"); if (!big) return;
        var W = p.clientWidth, H = p.clientHeight; if (!W) return;
        var cap = Math.min(on ? 320 : 220, (H || 800) * .4);
        big.style.whiteSpace = "nowrap"; big.style.width = ""; big.style.lineHeight = ""; big.style.fontSize = "100px";
        var f = Math.min(cap, W * .88 / (big.scrollWidth / 100)), wrap = false;
        if (W <= 760) {
          big.style.whiteSpace = "normal"; big.style.width = "1px";
          var f2 = Math.min(cap, W * .9 / (big.scrollWidth / 100));
          if (f2 > f * 1.15) { f = f2; wrap = true; }
        }
        big.style.whiteSpace = wrap ? "normal" : "nowrap"; big.style.width = wrap ? "92%" : ""; big.style.lineHeight = wrap ? ".84" : "";
        big.style.fontSize = f.toFixed(1) + "px";
        big._slack = Math.max(10, (W - big.getBoundingClientRect().width) / 2 * .9);
      });
    }
    fitBig();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitBig(); if (on) ScrollTrigger.refresh(); });
    document.addEventListener("tp:lang", function () { stops(); setTimeout(function () { fitBig(); if (on) ScrollTrigger.refresh(); }, 0); });
    window.addEventListener("resize", function () { if (!on) fitBig(); });

    if (T.reduce) { sec.classList.add("hs-flat"); $("hsUi").hidden = true; return; }
    sec.classList.add("hs-on"); on = true; fitBig();

    function navH() { var nav = document.querySelector(".nav"); return nav ? nav.offsetHeight : 64; }
    function setNav() { document.documentElement.style.setProperty("--nav", navH() + "px"); }
    setNav(); window.addEventListener("resize", setNav);
    ScrollTrigger.addEventListener("refreshInit", fitBig);

    function dist() { return Math.max(0, track.scrollWidth - pin.clientWidth); }
    var tween = gsap.to(track, { x: function () { return -dist(); }, ease: "none" });
    var cur = -1, sky = -1, fill = $("hsFill");
    var st = ScrollTrigger.create({
      trigger: pin, start: function () { return "top top+=" + navH(); },
      end: function () { return "+=" + Math.round(dist() * (window.innerWidth < 700 ? 1.3 : .95)); },
      pin: true, scrub: 1, animation: tween, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 10,
      /* l'aggancio al pannello piu' vicino: lungo e dolce, senza strappi */
      snap: { snapTo: 1 / (n - 1), duration: { min: .5, max: 1.1 }, delay: .12, ease: "sine.inOut", directional: false, inertia: false },
      onUpdate: function (self) {
        gsap.set(fill, { scaleX: self.progress });
        var pos = self.progress * (n - 1), idx = Math.round(pos);
        if (idx !== cur) {
          cur = idx;
          $("hsStops").querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-i") === idx); });
        }
        /* il cielo parte a un terzo del passaggio, non a meta': ha il tempo di cambiare mentre il pannello arriva */
        var s = Math.min(n - 1, Math.floor(pos + .65));
        if (s !== sky) { sky = s; T.setWorld(SKY[s]); }
      },
      onToggle: function (self) { if (self.isActive && sky >= 0) T.setWorld(SKY[sky]); }
    });
    $("hsStops").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]"); if (!b) return;
      window.scrollTo({ top: st.start + (+b.getAttribute("data-i") / (n - 1)) * (st.end - st.start), behavior: "smooth" });
    });

    /* dentro ogni pannello: parallasse, dissolvenza e ingresso dei testi, legati al movimento laterale */
    panels.forEach(function (p, i) {
      function at(extra) { return Object.assign({ trigger: p, containerAnimation: tween, scrub: true, start: "left right", end: "right left" }, extra || {}); }
      var big = p.querySelector(".hs-big"), phone = p.querySelector(".phone"), fx = p.querySelector(".hs-fx"), ground = p.querySelector(".hs-ground");
      var lands = p.querySelectorAll(".hs-land");
      /* uno sfondo entra piano, resta pieno al centro e se ne va piano: i mondi si sciolgono l'uno nell'altro */
      function fade(el) {
        gsap.timeline({ scrollTrigger: at() })
          .fromTo(el, { opacity: 0 }, { opacity: 1, duration: .32, ease: "sine.out" })
          .to(el, { opacity: 1, duration: .36 })
          .to(el, { opacity: 0, duration: .32, ease: "sine.in" });
      }
      if (big) {
        gsap.set(big, { xPercent: -50 }); /* centrata: la parallasse sposta in pixel, il centro lo tiene GSAP */
        gsap.fromTo(big, { x: function () { return big._slack; } }, { x: function () { return -big._slack; }, ease: "none", scrollTrigger: at({ invalidateOnRefresh: true }) });
        fade(big);
      }
      lands.forEach(function (el) {
        var small = el.classList.contains("hs-small");
        gsap.fromTo(el, { xPercent: small ? 26 : 12 }, { xPercent: small ? -26 : -12, ease: "none", scrollTrigger: at() });
        fade(el);
      });
      if (phone) gsap.fromTo(phone, { xPercent: 35, rotation: 9, scale: .9 }, { xPercent: -25, rotation: -6, scale: 1, ease: "none", scrollTrigger: at() });
      if (fx) gsap.fromTo(fx, { xPercent: 10 }, { xPercent: -10, ease: "none", scrollTrigger: at() });
      if (ground) gsap.fromTo(ground, { xPercent: 4 }, { xPercent: -4, ease: "none", scrollTrigger: at() });
      var items = p.querySelectorAll(".tag, h3, .hs-desc, .mech li, .hs-badges .tag, .hs-hint");
      if (i > 0 && items.length) {
        gsap.set(items, { opacity: 0, y: 34 });
        ScrollTrigger.create({ trigger: p, containerAnimation: tween, start: "left 85%", once: true, onEnter: function () {
          gsap.to(items, { opacity: 1, y: 0, duration: .9, ease: "power3.out", stagger: .07, clearProps: "transform,opacity" });
        } });
      }
    });
  };
})(window.Topplers);
