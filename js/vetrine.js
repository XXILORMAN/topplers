/* Carosello dei titoli (scorre da solo finche' nessuno lo tocca, si trascina, frecce e pallini)
   e stato dei lavori (anello che si riempie, pastiglie che mostrano il dettaglio una alla volta).
   I contenuti li scrive js/render.js; qui solo il movimento. Con movimento ridotto niente scorrimento automatico. */
(function (T) {
  "use strict";
  var $ = T.$;

  /* ---------- carosello ---------- */
  var idx = 0, auto = null, touched = false, visibile = false;
  function items() { return Array.prototype.slice.call(document.querySelectorAll("#targhe .car-item")); }
  function vicina() {
    var tr = $("targhe"), c = tr.scrollLeft + tr.clientWidth / 2, best = 0, bd = 1e9;
    items().forEach(function (it, k) { var d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - c); if (d < bd) { bd = d; best = k; } });
    return best;
  }
  function accendi(i) {
    idx = i;
    items().forEach(function (it, k) { it.classList.toggle("on", k === i); it.setAttribute("aria-current", k === i ? "true" : "false"); });
    Array.prototype.forEach.call(document.querySelectorAll("#carDots i"), function (d, k) { d.classList.toggle("on", k === i); });
    var x = T.TARGHE[i];
    $("carCap").innerHTML = "<b>" + T.t(x[1]) + '</b><span class="tag ' + x[2] + '">' + T.t(x[2] === "w" ? "tt_tag_w" : "tt_tag_b") + "</span>";
  }
  function vai(i, lento) {
    var list = items(), tr = $("targhe"); if (!list.length) return;
    i = (i + list.length) % list.length;
    var it = list[i];
    tr.scrollTo({ left: it.offsetLeft - (tr.clientWidth - it.offsetWidth) / 2, behavior: T.reduce || lento === false ? "auto" : "smooth" });
    accendi(i);
  }
  function ferma() { touched = true; clearInterval(auto); }
  function parti() {
    if (touched || T.reduce || auto) return;
    auto = setInterval(function () { if (visibile && !document.hidden) vai(idx + 1); }, 2800);
  }
  T.caroselloTarghe = function () {
    var dots = $("carDots"); if (!dots) return;
    dots.innerHTML = items().map(function () { return "<i></i>"; }).join("");
    requestAnimationFrame(function () { vai(idx, false); });
  };
  function initCarosello() {
    var tr = $("targhe"); if (!tr) return;
    var raf = 0;
    tr.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { var b = vicina(); if (b !== idx) accendi(b); }); }, { passive: true });
    $("carPrev").addEventListener("click", function () { ferma(); vai(idx - 1); });
    $("carNext").addEventListener("click", function () { ferma(); vai(idx + 1); });
    tr.addEventListener("click", function (e) { var b = e.target.closest(".car-item"); if (b) { ferma(); vai(+b.getAttribute("data-i")); } });
    tr.addEventListener("touchstart", ferma, { passive: true });
    tr.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") { ferma(); vai(idx + 1); e.preventDefault(); } if (e.key === "ArrowLeft") { ferma(); vai(idx - 1); e.preventDefault(); } });
    /* trascinamento col mouse */
    var giu = false, sx = 0, sl = 0, mosso = false;
    tr.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; giu = true; mosso = false; sx = e.clientX; sl = tr.scrollLeft; ferma(); });
    window.addEventListener("pointermove", function (e) { if (!giu) return; if (Math.abs(e.clientX - sx) > 4) { mosso = true; tr.classList.add("drag"); } tr.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener("pointerup", function () { if (!giu) return; giu = false; tr.classList.remove("drag"); if (mosso) vai(vicina()); });
    tr.addEventListener("click", function (e) { if (mosso) { e.stopPropagation(); e.preventDefault(); mosso = false; } }, true);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visibile = es[0].isIntersecting; if (visibile) parti(); }, { threshold: .4 }).observe(tr);
    window.addEventListener("resize", function () { vai(idx, false); });
  }

  /* ---------- stato: anello + pastiglie ---------- */
  var girato = false;
  function anello(subito) {
    var a = document.querySelector("#statuslist .anello"); if (!a) return;
    var pct = +a.getAttribute("data-pct"), fg = a.querySelector(".a-fg"), b = a.querySelector("b"), C = 314.16;
    if (subito || T.reduce) { fg.style.strokeDashoffset = C * (1 - pct / 100); b.textContent = pct + "%"; return; }
    fg.style.transition = "none"; fg.style.strokeDashoffset = C; void fg.getBoundingClientRect();
    fg.style.transition = ""; fg.style.strokeDashoffset = C * (1 - pct / 100);
    var t0 = performance.now();
    (function tick(n) { var k = Math.min((n - t0) / 1400, 1); b.textContent = Math.round(pct * (1 - Math.pow(1 - k, 3))) + "%"; if (k < 1) requestAnimationFrame(tick); })(t0);
  }
  function scegli(i) {
    var s = T.STATI[i];
    Array.prototype.forEach.call(document.querySelectorAll("#statuslist .pastiglia"), function (p) { var on = +p.getAttribute("data-i") === i; p.classList.toggle("on", on); p.setAttribute("aria-pressed", on); });
    var cap = document.querySelector("#statuslist .st-cap");
    cap.innerHTML = "<b>" + T.t(s[0] + "_t") + " · " + T.t("lv" + s[1]) + "</b>" + T.t(s[0] + "_d");
    if (!T.reduce && window.gsap) gsap.fromTo(cap, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .35, ease: "power2.out" });
  }
  T.statoVivo = function () { anello(!girato); };
  function initStato() {
    var box = $("statuslist"); if (!box) return;
    box.addEventListener("click", function (e) { var p = e.target.closest(".pastiglia"); if (p) scegli(+p.getAttribute("data-i")); });
    box.addEventListener("pointerover", function (e) { var p = e.target.closest(".pastiglia"); if (p && e.pointerType === "mouse") scegli(+p.getAttribute("data-i")); });
    anello(true);
    var fg = box.querySelector(".a-fg"); if (fg && !T.reduce) fg.style.strokeDashoffset = 314.16;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { girato = true; anello(false); io.disconnect(); } }, { threshold: .5 });
      io.observe(box);
    } else { girato = true; anello(true); }
  }

  T.initVetrine = function () { initCarosello(); initStato(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", T.initVetrine); else T.initVetrine();
})(window.Topplers);
