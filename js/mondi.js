/* I mondi: la sezione si ferma e scorrendo i pannelli scivolano di lato (ScrollTrigger: pin + scrub, con containerAnimation per le parti interne).
   Ogni pannello ha uno sfondo che si muove a velocita' diversa (parallasse), il telefono che ruota, i testi che entrano uno a uno e il cielo che cambia mondo.
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
    stops(); document.addEventListener("tp:lang", stops);

    if (T.reduce) { sec.classList.add("hs-flat"); $("hsUi").hidden = true; return; }
    sec.classList.add("hs-on");

    function navH() { var nav = document.querySelector(".nav"); return nav ? nav.offsetHeight : 64; }
    function setNav() { document.documentElement.style.setProperty("--nav", navH() + "px"); }
    setNav(); window.addEventListener("resize", setNav);

    function dist() { return Math.max(0, track.scrollWidth - pin.clientWidth); }
    var tween = gsap.to(track, { x: function () { return -dist(); }, ease: "none" });
    var cur = -1, fill = $("hsFill");
    var st = ScrollTrigger.create({
      trigger: pin, start: function () { return "top top+=" + navH(); },
      end: function () { return "+=" + Math.round(dist() * (window.innerWidth < 700 ? 1.3 : .95)); },
      pin: true, scrub: .7, animation: tween, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 10,
      snap: { snapTo: 1 / (n - 1), duration: { min: .3, max: .8 }, delay: .15, ease: "power2.inOut", directional: false, inertia: false },
      onUpdate: function (self) {
        gsap.set(fill, { scaleX: self.progress });
        var idx = Math.round(self.progress * (n - 1));
        if (idx !== cur) {
          cur = idx; T.setWorld(SKY[idx]);
          $("hsStops").querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", +b.getAttribute("data-i") === idx); });
        }
      },
      onToggle: function (self) { if (self.isActive && cur >= 0) T.setWorld(SKY[cur]); }
    });
    $("hsStops").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]"); if (!b) return;
      window.scrollTo({ top: st.start + (+b.getAttribute("data-i") / (n - 1)) * (st.end - st.start), behavior: "smooth" });
    });

    /* dentro ogni pannello: parallasse e ingresso dei testi, legati al movimento laterale */
    panels.forEach(function (p, i) {
      function at(extra) { return Object.assign({ trigger: p, containerAnimation: tween, scrub: true, start: "left right", end: "right left" }, extra || {}); }
      var big = p.querySelector(".hs-big"), phone = p.querySelector(".phone"), fx = p.querySelector(".hs-fx"), ground = p.querySelector(".hs-ground");
      if (big) gsap.fromTo(big, { xPercent: 22 }, { xPercent: -22, ease: "none", scrollTrigger: at() });
      if (phone) gsap.fromTo(phone, { xPercent: 35, rotation: 9, scale: .9 }, { xPercent: -25, rotation: -6, scale: 1, ease: "none", scrollTrigger: at() });
      if (fx) gsap.fromTo(fx, { xPercent: 10 }, { xPercent: -10, ease: "none", scrollTrigger: at() });
      if (ground) gsap.fromTo(ground, { xPercent: 4 }, { xPercent: -4, ease: "none", scrollTrigger: at() });
      var items = p.querySelectorAll(".tag, h3, .hs-desc, .mech li, .hs-badges .tag, .hs-hint");
      if (i > 0 && items.length) {
        gsap.set(items, { opacity: 0, y: 34 });
        ScrollTrigger.create({ trigger: p, containerAnimation: tween, start: "left 78%", once: true, onEnter: function () {
          gsap.to(items, { opacity: 1, y: 0, duration: .7, ease: "back.out(1.5)", stagger: .08, clearProps: "transform,opacity" });
        } });
      }
    });
  };
})(window.Topplers);
