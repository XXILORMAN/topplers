/* Strumenti condivisi: forme dei pezzi, colori, skin scelta, scoppi di coriandoli. */
window.Topplers = window.Topplers || {};
(function (T) {
  "use strict";
  T.SHAPES = { I: [[0,0],[1,0],[2,0],[3,0]], O: [[0,0],[1,0],[0,1],[1,1]], T: [[0,0],[1,0],[2,0],[1,1]], L: [[0,0],[1,0],[2,0],[0,1]], J: [[0,0],[1,0],[2,0],[2,1]], S: [[1,0],[2,0],[0,1],[1,1]], Z: [[0,0],[1,0],[1,1],[2,1]] };
  T.COL = { I: "#1CB8ED", O: "#FFC71A", T: "#AB4AE8", L: "#FF8C17", J: "#2969F5", S: "#45C940", Z: "#F5384A" };
  T.KINDS = ["I", "O", "T", "L", "J", "S", "Z"];
  T.CELL_PX = 42.25; /* una cella nei fogli dei pezzi */
  T.reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  T.fine = !!(window.matchMedia && matchMedia("(pointer: fine)").matches);
  T.$ = function (id) { return document.getElementById(id); };

  T.rotCells = function (cells, r) {
    var c = cells.map(function (a) { return a.slice(); });
    for (var i = 0; i < ((r % 4) + 4) % 4; i++) c = c.map(function (p) { return [-p[1], p[0]]; });
    var mx = Math.min.apply(null, c.map(function (a) { return a[0]; })), my = Math.min.apply(null, c.map(function (a) { return a[1]; }));
    return c.map(function (p) { return [p[0] - mx, p[1] - my]; });
  };
  T.dims = function (cells) { return { w: Math.max.apply(null, cells.map(function (a) { return a[0]; })) + 1, h: Math.max.apply(null, cells.map(function (a) { return a[1]; })) + 1 }; };
  T.shade = function (hex, p) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, tgt = p < 0 ? 0 : 255, a = Math.abs(p);
    r = Math.round(r + (tgt - r) * a); g = Math.round(g + (tgt - g) * a); b = Math.round(b + (tgt - b) * a);
    return "rgb(" + r + "," + g + "," + b + ")";
  };

  /* le skin classiche del gioco (fogli dei pezzi in assets/pezzi). La torre laterale usa sempre la base: "lego". */
  T.SKINS = ["lego", "cristallo", "muschio", "metallo", "steampunk", "toy", "vetrata", "frutta", "oro", "onemore", "paradiso", "nuvole", "pixel", "caramelle"];
  T.CLASSICHE = ["lego", "caramelle", "pixel", "cristallo", "frutta", "metallo"];
  T.skin = "lego";
  T.pieceSrc = function (kind, skin) { return "assets/pezzi/" + (skin || T.skin) + "_" + kind + ".webp"; };

  /* scoppio di coriandoli a forma di cella */
  T.burst = function (x, y, n, colors) {
    var fx = T.$("fx");
    if (!fx || T.reduce || !window.gsap) return;
    colors = colors || Object.keys(T.COL).map(function (k) { return T.COL[k]; });
    n = Math.min(n || 14, 18);
    for (var i = 0; i < n; i++) {
      var d = document.createElement("i");
      d.style.background = colors[i % colors.length];
      d.style.boxShadow = "inset 0 -3px 0 rgba(0,0,0,.22), inset 0 2px 0 rgba(255,255,255,.4)";
      fx.appendChild(d);
      var ang = (Math.PI * 2 * i) / n + Math.random() * .4, v = 80 + Math.random() * 120, dx = Math.cos(ang) * v, up = -Math.abs(Math.sin(ang)) * v - 60;
      var tl = gsap.timeline({ onComplete: (function (el) { return function () { el.remove(); }; })(d) });
      tl.set(d, { x: x - 6, y: y - 6, rotation: Math.random() * 90, scale: .6 + Math.random() * .7 });
      tl.to(d, { x: x - 6 + dx, duration: 1.1, ease: "none" }, 0);
      tl.to(d, { y: y - 6 + up, duration: .42, ease: "power2.out" }, 0);
      tl.to(d, { y: y - 6 + up + 260 + Math.random() * 120, duration: .8, ease: "power2.in" }, .42);
      tl.to(d, { rotation: "+=" + (180 + Math.random() * 360), duration: 1.2, ease: "none" }, 0);
      tl.to(d, { opacity: 0, duration: .3 }, .95);
    }
  };
  /* i link interni scorrono dolcemente (con scroll-behavior CSS su html ScrollTrigger sbaglia le misure) */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2 || e.defaultPrevented) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: T.reduce ? "auto" : "smooth", block: "start" });
  });
  /* i tasti sbuffano coriandoli */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".btn:not(.flat), .pu");
    if (b) { var r = b.getBoundingClientRect(); T.burst(r.left + r.width / 2, r.top + r.height / 2, 10); }
  });
})(window.Topplers);
