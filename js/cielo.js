/* Il cielo: una tela fissa dietro alla pagina. Cambia mondo scorrendo (Pianure, Ghiaccio, Lava, Orbite, Alba),
   le colline scorrono con lo scroll, neve/braci/stelle/vento reagiscono alla velocita'. Con movimento ridotto si ridisegna solo quando cambia. */
(function (T) {
  "use strict";
  var cv = T.$("cielo"), ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1;

  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mk(top, bot, h1, h2, cloud, fx) {
    var a = hex(top), b = hex(bot), c = hex(h1), d = hex(h2), e = hex(cloud);
    var o = { t0: a[0], t1: a[1], t2: a[2], b0: b[0], b1: b[1], b2: b[2], h0: c[0], h1: c[1], h2: c[2], g0: d[0], g1: d[1], g2: d[2], c0: e[0], c1: e[1], c2: e[2],
      stars: 0, snow: 0, ember: 0, wind: 0, lava: 0, ground: 1, planet: 0, cloud: 1 };
    for (var k in fx) o[k] = fx[k];
    return o;
  }
  var P = {
    plains: {
      day: mk("#5AA6F5", "#BDE7FB", "#5FA83D", "#7CC456", "#EEF6FF", { wind: 1 }),
      dusk: mk("#3D3384", "#F39A63", "#3B6B3A", "#4D8A47", "#FFD9C2", { wind: .6, stars: .25 }),
      night: mk("#0D1836", "#2D4485", "#1F4A3A", "#2A6048", "#46599A", { stars: 1, cloud: .6 })
    },
    ice: mk("#8FB9DA", "#EAF5FB", "#D5E3EE", "#FFFFFF", "#FFFFFF", { snow: 1 }),
    lava: mk("#2A0F1E", "#C0431F", "#2A1616", "#3D1C1C", "#5A2A2A", { ember: 1, lava: 1, stars: .25, cloud: .35 }),
    orbit: mk("#070D24", "#2A2F78", "#1B2250", "#28307A", "#46599A", { stars: 1, planet: 1, ground: 0, cloud: 0 }),
    dawn: mk("#5C4A9A", "#FFB27A", "#4A8A4A", "#7CC456", "#FFE0CC", { wind: .5, stars: .2 })
  };

  /* ora del cielo: segue l'orologio, il sole e il bottone la cambiano */
  var hour = "day", ORDER = ["day", "dusk", "night"], world = "plains";
  (function () { var d = new Date(), h = d.getHours() + d.getMinutes() / 60; hour = h >= 8.5 && h < 18.5 ? "day" : (h >= 18.5 && h < 21.5) || (h >= 6 && h < 8.5) ? "dusk" : "night"; })();
  function target() { return world === "plains" ? P.plains[hour] : P[world]; }
  var S = JSON.parse(JSON.stringify(target()));
  function applySkyAttr() { document.documentElement.setAttribute("data-sky", hour); }
  applySkyAttr();

  var stars = [], clouds = [], snow = [], embers = [], streaks = [];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function seed() {
    stars = []; clouds = []; snow = []; embers = []; streaks = [];
    for (var i = 0; i < 140; i++) stars.push({ x: Math.random(), y: Math.random() * .8, r: rnd(.7, 2), p: rnd(0, 6), s: rnd(.6, 2.4) });
    for (i = 0; i < 7; i++) clouds.push({ x: Math.random(), y: rnd(.06, .5), s: rnd(.7, 1.5), v: rnd(.004, .012) });
    for (i = 0; i < 80; i++) snow.push({ x: Math.random(), y: Math.random(), r: rnd(1, 3.2), v: rnd(.03, .09), d: rnd(0, 6) });
    for (i = 0; i < 56; i++) embers.push({ x: Math.random(), y: Math.random(), r: rnd(1.2, 3), v: rnd(.03, .1), d: rnd(0, 6) });
    for (i = 0; i < 14; i++) streaks.push({ x: Math.random(), y: rnd(.1, .8), l: rnd(60, 160), v: rnd(.18, .4) });
  }

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  function rgb(a, b, c, al) { return "rgba(" + (a | 0) + "," + (b | 0) + "," + (c | 0) + "," + (al == null ? 1 : al) + ")"; }

  var vel = 0, lastY = window.scrollY, shoot = null, shootAt = 3;
  function blob(x, y, s, a) {
    ctx.fillStyle = rgb(S.c0, S.c1, S.c2, a);
    ctx.beginPath(); ctx.arc(x, y, 18 * s, 0, 7); ctx.arc(x + 22 * s, y - 8 * s, 24 * s, 0, 7); ctx.arc(x + 48 * s, y, 18 * s, 0, 7); ctx.fill();
    ctx.fillRect(x - 10 * s, y, 76 * s, 18 * s);
  }
  function hills(base, amp, phase, freq, color, parallax) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
    var n = 28;
    for (var i = 0; i <= n; i++) { var x = W * i / n; ctx.lineTo(x, base - amp * (1 + Math.sin(i * freq + phase * parallax)) * .5 - amp * .35 * Math.sin(i * freq * 2.3 + phase * parallax * 1.7)); }
    ctx.lineTo(W, H); ctx.fill();
  }

  function draw(t, dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, rgb(S.t0, S.t1, S.t2)); g.addColorStop(1, rgb(S.b0, S.b1, S.b2)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var sy = window.scrollY, i, p;

    if (S.stars > .02) {
      for (i = 0; i < stars.length; i++) { p = stars[i]; ctx.fillStyle = "rgba(255,255,255," + (S.stars * (.45 + .55 * Math.sin(t * p.s + p.p))).toFixed(3) + ")"; var yy = (p.y * H - sy * .02 * p.r) % H; if (yy < 0) yy += H; ctx.fillRect(p.x * W, yy, p.r, p.r); }
      if (S.stars > .5 && !T.reduce) {
        shootAt -= dt; if (shootAt < 0 && !shoot) { shoot = { x: rnd(.3, .9) * W, y: rnd(.05, .3) * H, life: 0 }; shootAt = rnd(5, 11); }
        if (shoot) { shoot.life += dt; var a = Math.max(0, 1 - shoot.life / .7); ctx.strokeStyle = "rgba(255,255,255," + (a * S.stars) + ")"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(shoot.x - shoot.life * 420, shoot.y + shoot.life * 210); ctx.lineTo(shoot.x - shoot.life * 420 + 70, shoot.y + shoot.life * 210 - 35); ctx.stroke(); if (shoot.life > .7) shoot = null; }
      }
    }
    if (S.planet > .02) {
      var pr = Math.min(W, H) * .1, px = W * .8, py = H * .26 - sy * .01;
      ctx.globalAlpha = S.planet;
      var pg = ctx.createLinearGradient(px - pr, py - pr, px + pr, py + pr); pg.addColorStop(0, "#9a86f0"); pg.addColorStop(1, "#4b3a9a");
      ctx.strokeStyle = "rgba(255,226,160,.8)"; ctx.lineWidth = pr * .13;
      ctx.beginPath(); ctx.ellipse(px, py, pr * 1.75, pr * .45, -.35, Math.PI, 2 * Math.PI); ctx.stroke();
      ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.arc(px - pr * .3, py - pr * .35, pr * .45, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(px, py, pr * 1.75, pr * .45, -.35, 0, Math.PI); ctx.strokeStyle = "rgba(255,226,160,.8)"; ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (S.cloud > .02) for (i = 0; i < clouds.length; i++) { p = clouds[i]; p.x += p.v * dt * (1 + Math.abs(vel) * .0006); if (p.x > 1.15) p.x = -.2; blob(p.x * W, p.y * H - sy * .04 * p.s, p.s * (W < 600 ? .7 : 1), .9 * S.cloud); }

    var boost = 1 + Math.min(Math.abs(vel) * .0016, 5);
    if (S.snow > .02) {
      ctx.fillStyle = "rgba(255,255,255," + (.9 * S.snow) + ")";
      for (i = 0; i < snow.length; i++) { p = snow[i]; p.y += p.v * dt * boost * (vel < 0 ? -1 : 1); if (p.y > 1.02) p.y = -.02; else if (p.y < -.02) p.y = 1.02; p.x += Math.sin(t + p.d) * .0004; ctx.beginPath(); ctx.arc(((p.x % 1) + 1) % 1 * W, p.y * H, p.r, 0, 7); ctx.fill(); }
    }
    if (S.ember > .02) {
      for (i = 0; i < embers.length; i++) { p = embers[i]; p.y -= p.v * dt * boost; if (p.y < -.02) p.y = 1.02; var al = Math.min(1, (1 - p.y) * 1.4) * S.ember; ctx.fillStyle = "rgba(255," + (150 + 80 * (1 - p.y)) + ",70," + al.toFixed(3) + ")"; ctx.fillRect((p.x + Math.sin(t * .8 + p.d) * .01) * W, p.y * H, p.r * 1.6, p.r * 1.6); }
    }
    if (S.wind > .02) {
      ctx.lineCap = "round"; ctx.lineWidth = 3;
      for (i = 0; i < streaks.length; i++) { p = streaks[i]; p.x += p.v * dt * boost; if (p.x > 1.2) { p.x = -.2; p.y = rnd(.1, .8); } var wa = Math.sin(Math.PI * Math.min(1, Math.max(0, (p.x + .2) / 1.4))) * .5 * S.wind; ctx.strokeStyle = "rgba(255,255,255," + wa.toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(p.x * W, p.y * H); ctx.lineTo(p.x * W + p.l, p.y * H); ctx.stroke(); }
    }
    if (S.ground > .02) {
      var gh = (H < 700 ? 110 : 150) * S.ground, ph = sy * .0016 + t * .05;
      hills(H + 40 - gh * .1, gh * .7, ph, .55, rgb(S.h0, S.h1, S.h2), 1);
      hills(H + 20, gh * .55, ph, .8, rgb(S.g0, S.g1, S.g2), 1.6);
    }
    if (S.lava > .02) {
      var lh = (34 + 16 * Math.sin(t * 1.4)) * S.lava, ly = H - lh;
      var lg = ctx.createLinearGradient(0, ly, 0, H); lg.addColorStop(0, "#FFB13B"); lg.addColorStop(.4, "#E4470F"); lg.addColorStop(1, "#8C1B0A");
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(0, H);
      for (i = 0; i <= 30; i++) ctx.lineTo(W * i / 30, ly + Math.sin(i * .7 + t * 2.1 + sy * .004) * 6 * S.lava);
      ctx.lineTo(W, H); ctx.fill();
      var glow = ctx.createLinearGradient(0, ly - 160, 0, ly); glow.addColorStop(0, "rgba(255,120,30,0)"); glow.addColorStop(1, "rgba(255,120,30," + (.35 * S.lava) + ")"); ctx.fillStyle = glow; ctx.fillRect(0, ly - 160, W, 160);
    }
  }

  var last = 0, running = true;
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (document.hidden || !running) return;
    var y = window.scrollY; vel += ((y - lastY) / Math.max(dt, .001) - vel) * .18; lastY = y;
    draw(now / 1000, dt);
  }
  function still() { var dt = 0; draw(performance.now() / 1000, dt); }

  function goWorld(w) {
    if (w === world) return;
    world = w; retarget();
  }
  function retarget() {
    var tg = target();
    gsap.to(S, Object.assign({ duration: T.reduce ? .01 : 2, ease: "sine.inOut", overwrite: true, onUpdate: T.reduce ? still : null }, tg));
  }

  T.setWorld = goWorld; /* lo usano anche i mondi a scorrimento laterale */
  T.cycleHour = function () {
    hour = ORDER[(ORDER.indexOf(hour) + 1) % 3]; applySkyAttr();
    gsap.to(S, Object.assign({ duration: T.reduce ? .01 : .9, ease: "power2.inOut", overwrite: true, onUpdate: T.reduce ? still : null }, target()));
  };

  T.initCielo = function () {
    size(); seed();
    window.addEventListener("resize", function () { size(); if (T.reduce) still(); });
    document.querySelectorAll("section[data-world]").forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: function (self) { if (self.isActive) goWorld(sec.getAttribute("data-world")); } });
    });
    T.$("skybtn").addEventListener("click", T.cycleHour);
    T.$("orb").addEventListener("click", function (e) { T.cycleHour(); T.burst(e.clientX, e.clientY, 10, ["#ffe27a", "#ffb43a", "#fff1a8"]); });
    if (T.reduce) still(); else requestAnimationFrame(frame);
  };
})(window.Topplers);
