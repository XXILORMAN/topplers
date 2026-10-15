/* Costruzione libera: una torre vera che cresce col record. Si trascina il cursore (o si tira su la torre nel cielo) e i pezzi si posano
   uno dopo l'altro; la telecamera segue la cima, il righello conta i metri (una cella = un metro), le bandierine a 25 / 50 / 60 m si accendono
   e accanto ci sono una casa, il Colosseo e la Torre di Pisa per la scala. A 60 m la torre si veste con la skin Nuvole.
   La prima volta che si vede sale da sola fino a 28 m per far capire come funziona. */
(function (T) {
  "use strict";
  var $ = T.$, t = T.t, MAX = 65, TERRA = 40, MILES = [25, 50, 60];
  var view, mondo, torre, range, out, h = 0, cell = 20, items = [], nuvole = false, auto = null, presa = null;

  /* sagome per la scala: altezze vere in metri, larghezze in celle */
  var SAGOME = [
    { k: "fb_house", m: 10, w: 3, x: 1.8, svg: '<path d="M4 40 L30 4 L56 40 V100 H4Z"/>', vb: "0 0 60 100" },
    { k: "fb_colos", m: 48, w: 7, x: 5.6, vb: "0 0 120 100", svg: '<path d="M0 100 V12 Q60 -4 120 12 V100Z"/>', archi: true },
    { k: "fb_pisa", m: 56, w: 3.2, x: -8.8, vb: "0 0 40 100", svg: '<g transform="rotate(4 20 100)"><rect x="6" y="2" width="28" height="98" rx="4"/></g>', piani: true, cls: " pisa" }
  ];
  function sagoma(s) {
    var extra = "";
    if (s.archi) for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) extra += '<rect class="buco" x="' + (8 + c * 18.5) + '" y="' + (22 + r * 27) + '" width="10" height="18" rx="5"/>';
    if (s.piani) for (var k = 1; k < 8; k++) extra += '<rect class="buco" x="6" y="' + k * 12.5 + '" width="28" height="2" transform="rotate(4 20 100)"/>';
    return '<div class="sali-sagoma' + (s.cls || "") + '" data-x="' + s.x + '" data-w="' + s.w + '" data-m="' + s.m + '"><svg viewBox="' + s.vb + '" preserveAspectRatio="none">' + s.svg + extra + "</svg><small>" + t(s.k) + "</small></div>";
  }

  /* la torre: sempre la stessa, posata come in partita su quattro colonne */
  function build() {
    var G = T.newGrid(4), caso = T.seeded(7), zero = function () { return 0; };
    while (G.height < MAX + 1) {
      var pos = T.bestSpot(G, T.KINDS[Math.floor(caso() * 7)], zero, 1); T.commit(G, pos);
      var el = T.pieceEl("div", pos.kind, pos.rot, "lego"); el.classList.add("spento");
      torre.appendChild(el); items.push({ el: el, pos: pos });
    }
  }

  function misura() {
    var H = view.clientHeight || 520;
    cell = Math.max(14, Math.min(24, Math.floor((H - TERRA) / 26)));
    view.style.setProperty("--c", cell + "px");
    items.forEach(function (it) { T.placeEl(it.el, it.pos, cell); });
    $("saliSagome").querySelectorAll(".sali-sagoma").forEach(function (s) {
      /* sugli schermi stretti il Colosseo si accosta alla torre e si stringe, per non uscire dal riquadro */
      var stretto = view.clientWidth < 520, x = +s.dataset.x, w = +s.dataset.w;
      if (stretto && x > 4) { x = 3.2; w = 4.5; }
      s.style.left = "calc(50% + " + (x * cell) + "px)"; s.style.width = (w * cell) + "px"; s.style.height = (+s.dataset.m * cell) + "px";
    });
    camera(false);
  }
  function camera(lento) {
    var H = view.clientHeight, shift = Math.max(0, TERRA + h * cell - H * .62);
    mondo.style.transition = lento && !T.reduce ? "" : "none";
    mondo.style.transform = "translateY(" + shift + "px)";
  }
  function avviso(txt) {
    var el = $("saliToast"); el.textContent = txt; el.classList.add("on");
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove("on"); }, 2000);
  }

  function paint(v, vivo) {
    v = Math.max(0, Math.min(MAX, Math.round(v)));
    var su = v > h; h = v;
    out.innerHTML = "<b>" + v + "</b> m"; range.value = v; range.style.setProperty("--p", (v / MAX * 100) + "%");
    range.setAttribute("aria-valuetext", v + " m"); $("saliH").textContent = v + " m";
    items.forEach(function (it, i) {
      var on = it.pos.top <= v, era = !it.el.classList.contains("spento");
      it.el.classList.toggle("spento", !on);
      if (on && !era && vivo && su && !T.reduce && window.gsap) gsap.fromTo(it.el, { y: -cell * 5, rotation: gsap.utils.random(-12, 12), opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: .45, ease: "back.out(1.6)", clearProps: "transform,opacity" });
    });
    var cielo = v >= 60;
    if (cielo !== nuvole) { nuvole = cielo; items.forEach(function (it) { T.reskinEl(it.el, cielo ? "nuvole" : "lego"); }); }
    $("saliBandiere").querySelectorAll(".sali-bandiera").forEach(function (b) { b.classList.toggle("on", v >= +b.dataset.m); });
    document.querySelectorAll("#miles li").forEach(function (li, i) {
      var on = v >= +li.getAttribute("data-m");
      if (on && !li.classList.contains("on") && vivo) avviso(t("fb_got").replace("{x}", t("ms" + (i + 1) + "_d").replace(/[.!]$/, "")));
      li.classList.toggle("on", on);
    });
    /* il cielo si fa piu' scuro salendo */
    var k = v / MAX;
    $("saliAria").style.background = "linear-gradient(hsl(" + (210 + k * 25) + "," + (80 - k * 22) + "%," + (62 - k * 38) + "%), hsl(" + (200 + k * 20) + ",85%," + (86 - k * 30) + "%))";
    camera(true);
  }

  function ferma() { if (auto) { auto.kill(); auto = null; } }
  function sali(fino, durata) {
    ferma(); var o = { v: h };
    if (T.reduce || !window.gsap) { paint(fino, false); return; }
    auto = gsap.to(o, { v: fino, duration: durata, ease: "power1.inOut", onUpdate: function () { paint(o.v, true); } });
  }

  T.initLibera = function () {
    view = $("sali"); mondo = $("saliMondo"); torre = $("saliTorre"); range = $("altRange"); out = $("altOut");
    if (!view) return;
    range.max = MAX;
    var r = ""; for (var m = 0; m <= MAX; m += 5) r += '<span style="bottom:calc(' + TERRA + "px + var(--c) * " + m + ')">' + m + " m</span>"; $("saliRighello").innerHTML = r;
    $("saliBandiere").innerHTML = MILES.map(function (m) { return '<div class="sali-bandiera" data-m="' + m + '" style="bottom:calc(' + TERRA + "px + var(--c) * " + m + ')"><b>' + m + " m</b></div>"; }).join("");
    build();
    T.onLang(function () { $("saliSagome").innerHTML = SAGOME.map(sagoma).join(""); misura(); paint(h, false); });
    range.addEventListener("input", function () { ferma(); paint(+range.value, true); });
    $("altGo").addEventListener("click", function () { if (h >= MAX) paint(0, false); sali(MAX, 4.2); });
    view.addEventListener("pointerdown", function (e) { ferma(); presa = { y: e.clientY, v: h }; view.setPointerCapture(e.pointerId); });
    view.addEventListener("pointermove", function (e) { if (presa) paint(presa.v + (presa.y - e.clientY) / cell * 1.4, true); });
    view.addEventListener("pointerup", function () { presa = null; });
    view.addEventListener("pointercancel", function () { presa = null; });
    if ("ResizeObserver" in window) new ResizeObserver(misura).observe(view); else window.addEventListener("resize", misura);
    paint(0, false);
    ScrollTrigger.create({ trigger: "#sali", start: "top 75%", once: true, onEnter: function () {
      if (T.reduce) { paint(28, false); return; }
      gsap.delayedCall(.3, function () { if (!auto && h === 0) sali(28, 2.6); });
    } });
  };
})(window.Topplers);
