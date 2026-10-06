/* Effetti moderni, uno per uno (ispirati ai siti premiati: testi che si accendono parola per parola, nastri che reagiscono alla velocita' dello scroll,
   carte che si aprono a ventaglio, elementi che si inclinano con la velocita', tasti magnetici, un pezzo che sale lungo la roadmap).
   Con movimento ridotto non parte niente di tutto questo. */
(function (T) {
  "use strict";
  var $ = T.$;

  /* ---------- 1. testi che si accendono parola per parola ---------- */
  var ledeTr = [];
  function wordsOf(el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "wd"; w.textContent = part; frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    })(el);
  }
  function ledes() {
    ledeTr.forEach(function (tw) { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); }); ledeTr = [];
    document.querySelectorAll(".lede").forEach(function (el) {
      if (el.closest(".hs")) return; /* quelli dentro lo scorrimento laterale non si misurano come gli altri */
      wordsOf(el);
      var w = el.querySelectorAll(".wd"); if (!w.length) return;
      ledeTr.push(gsap.fromTo(w, { opacity: .28 }, { opacity: 1, ease: "none", stagger: .2, scrollTrigger: { trigger: el, start: "top 88%", end: "bottom 60%", scrub: .4 } }));
    });
  }

  /* ---------- 2. i nastri: scorrono da soli e seguono lo scroll ---------- */
  var ribbonState = [];
  function ribbons() {
    ribbonState = [];
    var kinds = ["O", "T", "L", "I", "S", "J", "Z"], H = 34;
    document.querySelectorAll(".ribbon").forEach(function (r, ri) {
      var track = r.querySelector(".rb-track"), set = "";
      ["rb1", "rb2", "rb3", "rb4"].forEach(function (k, i) {
        var kind = kinds[(i * 2 + ri * 3) % 7], d = T.dims(T.SHAPES[kind]);
        set += "<span>" + T.t(k) + '</span><img alt="" src="' + T.pieceSrc(kind, "lego") + '" height="' + H + '" width="' + Math.round(H * d.w / d.h) + '">';
      });
      track.innerHTML = set + set + set + set + set + set;
      ribbonState.push({ track: track, dir: +r.getAttribute("data-dir") || -1, x: 0, setW: 0, on: true, el: r });
    });
    measureRibbons();
  }
  function measureRibbons() { ribbonState.forEach(function (s) { s.setW = s.track.scrollWidth / 6; }); }
  function tickRibbons() {
    var last = window.scrollY, vel = 0;
    gsap.ticker.add(function (time, dt) {
      var s = dt / 1000, y = window.scrollY;
      vel += (((y - last) / Math.max(s, .001)) - vel) * .12; last = y;
      ribbonState.forEach(function (r) {
        if (!r.on || !r.setW) return;
        r.x += r.dir * (70 + vel * .25) * s;
        r.x = ((r.x % r.setW) - r.setW) % r.setW;
        r.track.style.transform = "translate3d(" + r.x.toFixed(1) + "px,0,0)";
      });
    });
    ribbonState.forEach(function (r) {
      new IntersectionObserver(function (v) { r.on = v[0].isIntersecting; }, { rootMargin: "200px" }).observe(r.el);
    });
  }

  /* ---------- 3. i potenziamenti si aprono a ventaglio ---------- */
  var fanTw = null;
  function fan() {
    if (fanTw) { if (fanTw.scrollTrigger) fanTw.scrollTrigger.kill(); fanTw.kill(); fanTw = null; }
    var cards = Array.prototype.slice.call(document.querySelectorAll("#pulist .pu")); if (!cards.length) return;
    var box = $("pulist");
    fanTw = gsap.fromTo(cards, {
      x: function (i, el) { var b = box.getBoundingClientRect(), r = el.getBoundingClientRect(); return (b.left + b.width / 2) - (r.left + r.width / 2); },
      y: function (i, el) { var b = box.getBoundingClientRect(), r = el.getBoundingClientRect(); return (b.top + b.height / 2) - (r.top + r.height / 2) + 40; },
      rotation: function (i) { return (i - (cards.length - 1) / 2) * 11; }, scale: .78, opacity: 0
    }, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, ease: "power3.out", stagger: .08, scrollTrigger: { trigger: box, start: "top 90%", end: "top 38%", scrub: .8, invalidateOnRefresh: true } });
  }

  /* ---------- 4. inclinazione con la velocita' ---------- */
  function skew() {
    var sel = ".why .card, .tiers .tier, .status .st, .lab, .altimetro, .risk, .who, .simcard, .road li, .titles";
    var set = gsap.quickSetter(sel, "skewY", "deg"), proxy = { s: 0 }, clamp = gsap.utils.clamp(-4, 4);
    ScrollTrigger.create({ onUpdate: function (self) {
      var v = clamp(self.getVelocity() / -450);
      if (Math.abs(v) > Math.abs(proxy.s)) {
        proxy.s = v;
        gsap.to(proxy, { s: 0, duration: .9, ease: "power3", overwrite: true, onUpdate: function () { set(proxy.s); } });
      }
    } });
  }

  /* ---------- 5. tasti magnetici ---------- */
  function magnetic() {
    if (!T.fine) return;
    var list = Array.prototype.slice.call(document.querySelectorAll(".btn")).map(function (b) {
      var o = { x: 0, y: 0 }; function put() { b.style.setProperty("--mx", o.x.toFixed(1) + "px"); b.style.setProperty("--my", o.y.toFixed(1) + "px"); }
      return { b: b, qx: gsap.quickTo(o, "x", { duration: .5, ease: "elastic.out(1,.5)", onUpdate: put }), qy: gsap.quickTo(o, "y", { duration: .5, ease: "elastic.out(1,.5)", onUpdate: put }), on: false };
    });
    document.addEventListener("pointermove", function (e) {
      list.forEach(function (m) {
        var r = m.b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
        var near = Math.abs(dx) < r.width / 2 + 70 && Math.abs(dy) < r.height / 2 + 60;
        if (near) { m.on = true; m.qx(dx * .28); m.qy(dy * .35); } else if (m.on) { m.on = false; m.qx(0); m.qy(0); }
      });
    });
  }

  /* ---------- 6. la roadmap: un pezzo sale lungo la linea ---------- */
  var roadTr = [];
  function road() {
    roadTr.forEach(function (t) { t.kill(); }); roadTr = [];
    document.querySelectorAll("#road li").forEach(function (li) {
      roadTr.push(ScrollTrigger.create({ trigger: li, start: "top 62%", onEnter: function () { li.classList.add("on"); }, onLeaveBack: function () { li.classList.remove("on"); } }));
    });
  }
  function climber() {
    var wrap = document.querySelector(".roadwrap"), c = $("roadClimber"); if (!wrap || !c) return;
    gsap.fromTo(c, { y: 0, rotation: -12 }, { y: function () { return wrap.offsetHeight - c.offsetHeight; }, rotation: 12, ease: "none",
      scrollTrigger: { trigger: wrap, start: "top 66%", end: "bottom 66%", scrub: .5, invalidateOnRefresh: true } });
  }

  T.initEffetti = function () {
    ribbons();
    if (T.reduce) { document.addEventListener("tp:lang", ribbons); road(); document.querySelectorAll("#road li").forEach(function (li) { li.classList.add("on"); }); return; }
    ledes(); fan(); road(); climber(); skew(); magnetic(); tickRibbons();
    document.addEventListener("tp:lang", function () { ribbons(); ledes(); fan(); road(); ribbonState.forEach(function (r) { new IntersectionObserver(function (v) { r.on = v[0].isIntersecting; }, { rootMargin: "200px" }).observe(r.el); }); });
    window.addEventListener("load", measureRibbons);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureRibbons);
    window.addEventListener("resize", measureRibbons);
  };
})(window.Topplers);
