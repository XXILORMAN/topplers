/* I mondi: la sezione si ferma e scorrendo i pannelli scivolano di lato (ScrollTrigger: pin + scrub, con containerAnimation per le parti interne).
   Ogni pannello ha la scritta gigante che si muove a velocita' diversa (parallasse); sotto ai pannelli corre UN SOLO terreno continuo
   (colline che cambiano da verdi a innevate a laviche, senza vuoti) con dentro il mulino, la baita, il vulcano: piantati sul terreno e mossi con lui.
   Il telefono ruota, i testi entrano uno a uno e il cielo cambia mondo.
   Con movimento ridotto restano impilati. Senza JS idem. */
(function (T) {
  "use strict";
  var $ = T.$;
  var SKY = ["plains", "plains", "ice", "lava"];

  /* ---- IL TERRENO CONTINUO ----
     Altezze in frazione dell'altezza della striscia (0 = in basso, 1 = in cima), per mondo e per fila (dietro / davanti).
     Fra un mondo e l'altro l'altezza passa dall'una all'altra con una curva dolce: la sagoma e' una sola, senza vuoti.
     `F` e' quanto il terreno segue i pannelli: 1 = insieme, meno = piu' lento (profondita'). */
  var F = .9;
  function sm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function tri(t) { t -= Math.floor(t); return Math.abs(t * 2 - 1) * 2 - 1; }
  var SHAPE = {
    plains: { back: function (x) { return .46 + .12 * Math.sin(x / 210 + .6) + .05 * Math.sin(x / 97 + 2); },
              front: function (x) { return .23 + .09 * Math.sin(x / 260 + 2.1) + .035 * Math.sin(x / 120); }, flat: .5 },
    ice:    { back: function (x) { return .42 + .2 * tri(x / 170 + .3) + .05 * tri(x / 63); },
              front: function (x) { return .22 + .06 * Math.sin(x / 170) + .04 * tri(x / 95); }, flat: .46 },
    lava:   { back: function (x) { return .42 + .14 * tri(x / 230 + .7) + .05 * Math.sin(x / 70); },
              front: function (x) { return .17 + .035 * Math.sin(x / 55 + 1); }, flat: .42 }
  };
  var WORLDS = ["plains", "ice", "lava"];
  /* dove sta ogni elemento sullo schermo quando il suo pannello e' al centro (frazione della larghezza) */
  var SPOT = { big: .84, small: .09 };

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

    /* quanto deve scorrere la pista: dai pannelli, NON da `track.scrollWidth` (ci entrerebbe anche il terreno, che si allunga di quanto scorre: un anello) */
    function dist() { return Math.max(0, n * panels[0].offsetWidth - pin.clientWidth); }
    var tween = gsap.to(track, { x: function () { return -dist(); }, ease: "none" });

    /* La striscia di terreno: figlia della pista (sta sotto le schede e sopra la scritta), spostata di (1-F) rispetto a lei. */
    var earth = document.createElement("div");
    earth.className = "hs-earth"; earth.setAttribute("aria-hidden", "true");
    track.insertBefore(earth, track.firstChild);
    var lands = [];
    panels.forEach(function (p, i) {
      p.querySelectorAll(".hs-land").forEach(function (el) {
        el._k = i; el._small = el.classList.contains("hs-small");
        earth.appendChild(el); lands.push(el);
      });
    });
    function buildEarth() {
      var vw = pin.clientWidth, H = earth.clientHeight; if (!vw || !H) return;
      /* `passo` = di quanto avanza la pista da un pannello al successivo (la larghezza della pagina puo' avere la barra di scorrimento in piu');
         il terreno e' lungo quanto serve perche', alla fine della corsa, il suo bordo destro tocchi quello dello schermo. */
      var passo = dist() / (n - 1), Wg = Math.round(vw + F * dist()), A = vw * .3;
      earth.style.width = Wg + "px";
      var s1 = F * 1.5 * passo + vw * .5, s2 = F * 2.5 * passo + vw * .5;
      function wt(x) { var wi = sm(s1 - A, s1 + A, x), wl = sm(s2 - A, s2 + A, x); return [1 - wi, wi * (1 - wl), wl]; }
      function mix(layer, x) { var w = wt(x); return w[0] * SHAPE.plains[layer](x) + w[1] * SHAPE.ice[layer](x) + w[2] * SHAPE.lava[layer](x); }
      /* gli elementi: dove stanno, e quanto e' alto il terreno sotto di loro (un piano, perche' stiano in piedi) */
      var spots = lands.map(function (el) {
        var b = el.getBoundingClientRect(), w = b.width, h = b.height, s = el._small ? SPOT.small : SPOT.big;
        /* quello grande sta a destra del telefono: il bordo sinistro non va sotto di lui (circa 74% della larghezza), e se non c'e' posto sborda a destra */
        if (!el._small && vw > 760) s = Math.max(s, .76 + w / vw / 2);
        else if (!el._small) s = Math.min(s, 1.02 - w / vw / 2); /* sul telefono resta tutto dentro lo schermo */
        var x = F * el._k * passo + vw * s;
        return { el: el, x: x, w: w, h: h, flat: SHAPE[WORLDS[el._k - 1]].flat };
      });
      function back(x) {
        var y = mix("back", x);
        spots.forEach(function (sp) { var b = 1 - sm(sp.w * .55, sp.w * 1.15, Math.abs(x - sp.x)); if (b > 0) y += (sp.flat - y) * b; });
        return y;
      }
      function path(fn) {
        var d = "M0 " + H;
        for (var x = 0; x <= Wg + 5; x += 5) d += "L" + x + " " + (H * (1 - fn(Math.min(x, Wg)))).toFixed(1);
        return d + "L" + Wg + " " + H + "Z";
      }
      spots.forEach(function (sp) {
        sp.el.style.left = (sp.x - sp.w / 2).toFixed(1) + "px";
        sp.el.style.bottom = (sp.flat * H - sp.h * .05).toFixed(1) + "px";
      });
      function u(px) { return Math.max(0, Math.min(1, px / Wg)).toFixed(4); }
      function grad(id, a, b, c) {
        return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + Wg + '" y2="0">' +
          '<stop offset="0" stop-color="' + a + '"/><stop offset="' + u(s1 - A) + '" stop-color="' + a + '"/>' +
          '<stop offset="' + u(s1 + A) + '" stop-color="' + b + '"/><stop offset="' + u(s2 - A) + '" stop-color="' + b + '"/>' +
          '<stop offset="' + u(s2 + A) + '" stop-color="' + c + '"/><stop offset="1" stop-color="' + c + '"/></linearGradient>';
      }
      var front = path(function (x) { return mix("front", x); });
      var old = earth.querySelector(".hs-hills"); if (old) old.remove();
      earth.insertAdjacentHTML("beforeend",
        '<svg class="hs-hills" viewBox="0 0 ' + Wg + " " + H + '" preserveAspectRatio="none"><defs>' +
        grad("eBack", "#5fa83d", "#cfe0ee", "#2a1616") + grad("eFront", "#7cc456", "#ffffff", "#e4470f") +
        '<linearGradient id="eLava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb13b"/><stop offset=".45" stop-color="#e4470f"/><stop offset="1" stop-color="#8c1b0a"/></linearGradient>' +
        '<linearGradient id="eRamp" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + Wg + '" y2="0"><stop offset="0" stop-color="#000"/><stop offset="' + u(s2 - A) + '" stop-color="#000"/><stop offset="' + u(s2 + A) + '" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>' +
        '<mask id="eMask" maskUnits="userSpaceOnUse" x="0" y="0" width="' + Wg + '" height="' + H + '"><rect width="' + Wg + '" height="' + H + '" fill="url(#eRamp)"/></mask></defs>' +
        '<path d="' + path(back) + '" fill="url(#eBack)"/><path d="' + front + '" fill="url(#eFront)"/><path d="' + front + '" fill="url(#eLava)" mask="url(#eMask)"/></svg>');
    }
    function moveEarth() { gsap.set(earth, { x: (1 - F) * dist() * tween.progress() }); }
    tween.eventCallback("onUpdate", moveEarth);
    buildEarth(); moveEarth();
    ScrollTrigger.addEventListener("refreshInit", function () { buildEarth(); moveEarth(); });
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
      var big = p.querySelector(".hs-big"), phone = p.querySelector(".phone"), fx = p.querySelector(".hs-fx");
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
      if (phone) gsap.fromTo(phone, { xPercent: 35, rotation: 9, scale: .9 }, { xPercent: -25, rotation: -6, scale: 1, ease: "none", scrollTrigger: at() });
      if (fx) gsap.fromTo(fx, { xPercent: 10 }, { xPercent: -10, ease: "none", scrollTrigger: at() });
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
