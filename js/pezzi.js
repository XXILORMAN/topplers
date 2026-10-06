/* Fisica ambientale (Matter.js): le lettere del marchio e le pile di pezzi veri che si afferrano e si lanciano.
   Si fermano fuori schermo; con movimento ridotto restano ferme (le pile spariscono). */
(function (T) {
  "use strict";
  var M = window.Matter;

  /* ============ le otto lettere del marchio ============ */
  var PAROLA = "TOPPLERS", LET = { E: [118, 192], L: [122, 192], O: [167, 194], P: [131, 192], R: [143, 192], S: [128, 194], T: [142, 192] };
  T.initLogo = function (tries) {
    var marchio = T.$("marchio"), asse = marchio.querySelector(".asse");
    /* se la pagina non ha ancora una misura (carattere o foglio di stile in arrivo) si riprova al fotogramma dopo */
    if (marchio.clientWidth < 60 || marchio.clientHeight < 60) { if ((tries || 0) < 60) requestAnimationFrame(function () { T.initLogo((tries || 0) + 1); }); return; }
    var imgs = PAROLA.split("").map(function (c) {
      var im = document.createElement("img");
      im.className = "lettera"; im.src = "assets/lettere/" + c + ".webp"; im.alt = ""; im.draggable = false; im.width = LET[c][0]; im.height = LET[c][1];
      marchio.appendChild(im); return im;
    });
    var misura = {};
    function misuraMarchio() {
      var W = marchio.clientWidth, H = marchio.clientHeight, asseH = 16;
      var larghe = PAROLA.split("").reduce(function (a, c) { return a + LET[c][0]; }, 0);
      var gap = 3, k = Math.min((H - asseH - 6) * .78 / 194, (W * .96 - gap * 7) / larghe), tot = larghe * k + gap * 7, x = 0, posti = [];
      PAROLA.split("").forEach(function (c) { var w = LET[c][0] * k, h = LET[c][1] * k; posti.push({ x: x + w / 2, w: w, h: h }); x += w + gap; });
      asse.style.width = Math.min(W, tot + 24) + "px";
      misura = { W: W, H: H, k: k, posti: posti, fondo: H - asseH, asseW: Math.min(W, tot + 24) };
      return misura;
    }
    function posaFerma() {
      var m = misuraMarchio();
      imgs.forEach(function (im, i) { var p = m.posti[i], a = i === 3 ? -9 : 0; im.style.width = p.w + "px"; im.style.height = p.h + "px"; im.style.transform = "translate(" + (p.x + 12 - p.w / 2) + "px," + (m.fondo - p.h) + "px) rotate(" + a + "deg)"; });
    }
    posaFerma();
    if (!M || T.reduce) { window.addEventListener("resize", posaFerma); return; }

    marchio.classList.add("vivo");
    var engine, corpi, presa = null, gira = false, acc = 0, ultimo = 0, visibile = true;
    function costruisci(daCapo) {
      var m = misuraMarchio();
      engine = M.Engine.create({ enableSleeping: true }); engine.gravity.y = 1.25;
      var terra = M.Bodies.rectangle(m.asseW / 2, m.fondo + 8, m.asseW, 16, { isStatic: true, friction: 1, chamfer: { radius: 6 } });
      corpi = m.posti.map(function (p, i) {
        var y = daCapo ? -m.H * .9 - i * m.H * .38 : m.fondo - p.h / 2;
        var b = M.Bodies.rectangle(p.x + 12, y, p.w * .94, p.h * .94, { chamfer: { radius: p.w * .14 }, friction: .8, frictionStatic: 1.2, restitution: .08, density: .002 });
        if (i === 3) M.Body.setAngle(b, -.16);
        imgs[i].style.width = p.w + "px"; imgs[i].style.height = p.h + "px";
        return b;
      });
      M.Composite.add(engine.world, [terra].concat(corpi));
    }
    function rimetti(i) { var p = misura.posti[i], b = corpi[i]; M.Body.setPosition(b, { x: p.x + 12, y: -p.h }); M.Body.setVelocity(b, { x: 0, y: 0 }); M.Body.setAngularVelocity(b, 0); M.Body.setAngle(b, 0); M.Sleeping.set(b, false); }
    function disegna() {
      corpi.forEach(function (b, i) {
        var p = misura.posti[i];
        imgs[i].style.transform = "translate(" + (b.position.x - p.w / 2) + "px," + (b.position.y - p.h / 2) + "px) rotate(" + b.angle + "rad)";
        if (b.position.y > misura.H + 600 || Math.abs(b.position.x - misura.W / 2) > misura.W + 400) rimetti(i);
      });
    }
    function giro(ora) {
      if (!gira) return;
      acc += Math.min(ora - (ultimo || ora), 50); ultimo = ora;
      while (acc >= 1000 / 60) { M.Engine.update(engine, 1000 / 60); acc -= 1000 / 60; }
      disegna(); requestAnimationFrame(giro);
    }
    function accendi() { if (gira || !visibile || document.hidden) return; gira = true; ultimo = 0; requestAnimationFrame(giro); }
    function spegni() { gira = false; }
    costruisci(true);

    function punto(e) { var r = marchio.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    imgs.forEach(function (im, i) {
      im.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var b = corpi[i], q = punto(e);
        M.Sleeping.set(b, false);
        presa = M.Constraint.create({ pointA: q, bodyB: b, pointB: { x: q.x - b.position.x, y: q.y - b.position.y }, angleB: b.angle, stiffness: .2, damping: .1, length: 0 });
        M.Composite.add(engine.world, presa);
        im.setPointerCapture(e.pointerId); accendi();
      });
      im.addEventListener("pointermove", function (e) { if (presa && presa.bodyB === corpi[i]) presa.pointA = punto(e); });
      function lascia() { if (presa && presa.bodyB === corpi[i]) { M.Composite.remove(engine.world, presa); presa = null; } }
      im.addEventListener("pointerup", lascia); im.addEventListener("pointercancel", lascia);
    });
    /* una piccola scossa quando si scorre forte */
    var yPrev = window.scrollY;
    window.addEventListener("scroll", function () { var d = window.scrollY - yPrev; yPrev = window.scrollY; if (Math.abs(d) > 140 && visibile) corpi.forEach(function (b) { M.Sleeping.set(b, false); M.Body.applyForce(b, b.position, { x: (Math.random() - .5) * .01 * b.mass, y: -.012 * b.mass }); }); }, { passive: true });
    new IntersectionObserver(function (v) { visibile = v[0].isIntersecting; visibile ? accendi() : spegni(); }).observe(marchio);
    document.addEventListener("visibilitychange", function () { document.hidden ? spegni() : accendi(); });
    var attesa, larghezza = marchio.clientWidth;
    new ResizeObserver(function () {
      if (marchio.clientWidth === larghezza) return;
      larghezza = marchio.clientWidth; clearTimeout(attesa);
      attesa = setTimeout(function () { M.Composite.clear(engine.world, false); M.Engine.clear(engine); costruisci(false); disegna(); }, 150);
    }).observe(marchio);
    disegna(); accendi();
  };

  /* ============ pile di pezzi veri ============ */
  T.Pila = function (box, opts) {
    if (!M || T.reduce) { box.style.display = "none"; return null; }
    opts = opts || {};
    var count = opts.count || 12, maxN = opts.max || 26, floorOff = opts.floor || 66, skins = opts.skins || null;
    var W = 0, H = 0, cs = 30, engine, list = [], statics = [], presa = null, run = false, visible = false, acc = 0, ultimo = 0, rained = false, tilt = 0, tiltT = 0;

    function measure() { W = box.clientWidth; H = box.clientHeight; cs = Math.max(24, Math.min(40, Math.round(Math.min(W, 1000) / 26))); }
    function skinFor() { return skins ? skins[Math.floor(Math.random() * skins.length)] : T.skin; }
    function build() {
      measure();
      engine = M.Engine.create({ enableSleeping: true, positionIterations: 8, velocityIterations: 6 }); engine.gravity.y = 1.1;
      var floor = M.Bodies.rectangle(W / 2, H - floorOff + 30, W * 3, 60, { isStatic: true, friction: 1 });
      var l = M.Bodies.rectangle(-30, H / 2 - 400, 60, H * 2 + 800, { isStatic: true }), r = M.Bodies.rectangle(W + 30, H / 2 - 400, 60, H * 2 + 800, { isStatic: true });
      statics = [floor, l, r]; M.Composite.add(engine.world, statics);
      list.forEach(function (p) { p.el.remove(); }); list = [];
    }
    function add(kind, x, y, vel) {
      if (list.length >= maxN) { var old = list.shift(); M.Composite.remove(engine.world, old.body); old.el.remove(); }
      var cells = T.SHAPES[kind], d = T.dims(cells), skin = skinFor();
      var px0 = x - d.w * cs / 2, py0 = y - d.h * cs / 2;
      var parts = cells.map(function (c) { return M.Bodies.rectangle(px0 + (c[0] + .5) * cs, py0 + (c[1] + .5) * cs, cs - 1.5, cs - 1.5, { chamfer: { radius: 4 } }); });
      var body = M.Body.create({ parts: parts, friction: .75, frictionStatic: 1, restitution: .12, frictionAir: .004, density: .002 });
      M.Body.setAngle(body, (Math.random() - .5) * 1.2);
      if (vel) M.Body.setVelocity(body, vel);
      M.Composite.add(engine.world, body);
      var cx = 0, cy = 0; cells.forEach(function (c) { cx += c[0] + .5; cy += c[1] + .5; }); cx = cx / 4 * cs; cy = cy / 4 * cs;
      var el = document.createElement("img"); el.className = "pz"; el.alt = ""; el.draggable = false;
      el.src = T.pieceSrc(kind, skin); el.width = Math.round(d.w * cs); el.height = Math.round(d.h * cs); el.style.transformOrigin = cx + "px " + cy + "px";
      box.appendChild(el);
      var p = { body: body, el: el, kind: kind, cx: cx, cy: cy };
      el.addEventListener("pointerdown", function (e) { e.preventDefault(); grab(p, e); });
      el.addEventListener("pointermove", function (e) { if (presa && presa.bodyB === p.body) presa.pointA = pt(e); });
      el.addEventListener("pointerup", release); el.addEventListener("pointercancel", release);
      list.push(p); return p;
    }
    function pt(e) { var r = box.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function grab(p, e) {
      var q = pt(e); M.Sleeping.set(p.body, false);
      presa = M.Constraint.create({ pointA: q, bodyB: p.body, pointB: { x: q.x - p.body.position.x, y: q.y - p.body.position.y }, angleB: p.body.angle, stiffness: .18, damping: .1, length: 0 });
      M.Composite.add(engine.world, presa); p.el.setPointerCapture(e.pointerId); start();
    }
    function release() { if (presa) { M.Composite.remove(engine.world, presa); presa = null; } }

    function draw() {
      for (var i = 0; i < list.length; i++) {
        var p = list[i], b = p.body;
        p.el.style.transform = "translate(" + (b.position.x - p.cx) + "px," + (b.position.y - p.cy) + "px) rotate(" + b.angle + "rad)";
        if (b.position.y > H + 500) { M.Body.setPosition(b, { x: Math.random() * W, y: -80 }); M.Body.setVelocity(b, { x: 0, y: 0 }); M.Sleeping.set(b, false); }
      }
    }
    function loop(now) {
      if (!run) return;
      acc += Math.min(now - (ultimo || now), 50); ultimo = now;
      tilt += (tiltT - tilt) * .08; engine.gravity.x = tilt;
      while (acc >= 1000 / 60) { M.Engine.update(engine, 1000 / 60); acc -= 1000 / 60; }
      draw(); requestAnimationFrame(loop);
    }
    function start() { if (run || !visible || document.hidden) return; run = true; ultimo = 0; requestAnimationFrame(loop); }
    function stop() { run = false; }
    function rain() {
      if (rained) return; rained = true;
      var n = 0, t = setInterval(function () {
        var k = T.KINDS[Math.floor(Math.random() * 7)];
        add(k, cs * 2 + Math.random() * (W - cs * 4), -cs * 3, { x: (Math.random() - .5) * 4, y: 1 });
        if (++n >= count) clearInterval(t);
      }, opts.rate || 170);
    }

    build();
    new IntersectionObserver(function (v) { visible = v[0].isIntersecting; if (visible) { rain(); start(); } else stop(); }, { threshold: .05 }).observe(box);
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    var rt, w0 = W;
    new ResizeObserver(function () { if (Math.abs(box.clientWidth - w0) < 40) return; w0 = box.clientWidth; clearTimeout(rt); rt = setTimeout(function () { var n = list.length; rained = false; build(); count = Math.max(n, 6); rain(); }, 200); }).observe(box);

    /* un tocco su uno spazio vuoto fa cadere un pezzo */
    var host = opts.spawnOn || box.parentElement;
    host.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a, button, input, canvas, video, img.pz, img.lettera, .phone, .card, .countdown, .news, h1, h2, p, .chips")) return;
      var r = box.getBoundingClientRect(); add(T.KINDS[Math.floor(Math.random() * 7)], e.clientX - r.left, Math.max(-cs, e.clientY - r.top - cs * 3), { x: 0, y: 2 }); start();
    });
    /* scroll: pende e si agita */
    var yPrev = window.scrollY;
    window.addEventListener("scroll", function () {
      var d = window.scrollY - yPrev; yPrev = window.scrollY;
      tiltT = Math.max(-.7, Math.min(.7, d * .018));
      if (Math.abs(d) > 60 && visible) list.forEach(function (p) { M.Sleeping.set(p.body, false); });
      clearTimeout(box._tt); box._tt = setTimeout(function () { tiltT = 0; }, 160);
    }, { passive: true });
    /* giroscopio (Android e iOS gia' autorizzato) */
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", function (e) { if (e.gamma != null) tiltT = Math.max(-.8, Math.min(.8, e.gamma / 40)); });
    }
    return { add: add, list: list };
  };

  /* pezzi che galleggiano accanto al telefono, con parallasse dal puntatore */
  T.initFloaters = function () {
    var art = T.$("heroart"), items = [["Z", 4, 4, 5.2, .4], ["L", 80, 0, 6.4, .6], ["T", 0, 64, 5.8, .5], ["J", 84, 62, 6.9, .7], ["S", 58, 90, 5.5, .3]];
    var els = items.map(function (f, i) {
      var d = document.createElement("div"), d2 = T.dims(T.SHAPES[f[0]]), k = .55;
      d.className = "float"; d.style.left = f[1] + "%"; d.style.top = f[2] + "%"; d.setAttribute("data-speed", f[4]);
      d.innerHTML = '<img alt="" src="' + T.pieceSrc(f[0], "lego") + '" width="' + Math.round(d2.w * T.CELL_PX * k) + '" height="' + Math.round(d2.h * T.CELL_PX * k) + '" style="animation-duration:' + f[3] + "s;animation-delay:-" + i + 's">';
      art.appendChild(d); return d;
    });
    if (T.fine && !T.reduce && window.gsap) {
      var hero = T.$("hero");
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        els.forEach(function (el) { var s = +el.getAttribute("data-speed"); gsap.to(el, { x: nx * 90 * s, y: ny * 60 * s, duration: 1, ease: "power2.out", overwrite: "auto" }); });
      });
    }
  };
})(window.Topplers);
