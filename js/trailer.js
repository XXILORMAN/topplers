/* Il maxi schermo della sezione "Non il solito puzzle a blocchi": le sette clip della partita in fila come un trailer a capitoli.
   Ogni capitolo dura CAP ms; la barra sotto si riempie e si clicca per saltare. A sinistra il nome del capitolo, a destra il punto
   di forza che quella clip dimostra (sul telefono vanno entrambi in basso). Le clip partono solo quando lo schermo si vede.
   Con movimento ridotto non parte da solo: si avvia col tasto. Sotto, i social presi da CONFIG (spenti finche' manca l'indirizzo). */
(function (T) {
  "use strict";
  var $ = T.$, t = T.t, CAP = 6000;
  var CH = [
    { k: "pianure", n: "w_plains", c: 1 },
    { k: "giganti", n: "tr_giganti", c: 1 },
    { k: "bufera", n: "tr_vento", c: 2 },
    { k: "ghiaccio", n: "w_ice", c: 3 },
    { k: "lava", n: "w_lava", c: 3 },
    { k: "libera", n: "tr_libera", c: 2 },
    { k: "pet", n: "tr_pet", c: 1 }
  ];
  var ICO = {
    ig: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24" rx="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="16" cy="16" r="5.6" fill="none" stroke="#fff" stroke-width="3"/><circle cx="23" cy="9" r="1.9" fill="#fff"/></svg>',
    tt: '<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="none" stroke-width="3.4" stroke-linecap="round"><path d="M17 3v16.5a4.6 4.6 0 1 1-4.6-4.6" stroke="#25f4ee"/><path d="M19 5v16.5a4.6 4.6 0 1 1-4.6-4.6" stroke="#fe2c55"/><path d="M18 4v16.5a4.6 4.6 0 1 1-4.6-4.6M18 4c.6 3.4 3 5.8 6.6 6.2" stroke="#fff"/></g></svg>',
    yt: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="7" width="26" height="18" rx="6" fill="#fff"/><path d="M13.5 11.5v9l8-4.5z" fill="#e00000"/></svg>'
  };
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3l15 9-15 9z" fill="#3a2a00"/></svg>',
      PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="5" height="18" rx="1.5" fill="#3a2a00"/><rect x="14" y="3" width="5" height="18" rx="1.5" fill="#3a2a00"/></svg>';

  var fg, bg, fills, btns, i = 0, acc = 0, t0 = 0, raf = 0, visto = false, fermo = false, avviato = false;

  function didascalie(anim) {
    var c = CH[i], cap = $("tvCap"), cl = $("tvClaim"), kt = t("why" + c.c + "_h"), kp = t("tr_k" + c.c);
    cap.innerHTML = '<span class="k">' + t("tr_ch", { n: i + 1, t: CH.length }) + '</span><span class="t">' + t(c.n) + '</span><span class="m"><b>' + kt + ".</b> " + kp + "</span>";
    cl.innerHTML = "<b>" + kt + "</b><span>" + kp + "</span>";
    if (anim && !T.reduce) [cap, cl].forEach(function (el) { el.classList.remove("tv-swap"); void el.offsetWidth; el.classList.add("tv-swap"); });
  }
  function carica() {
    var c = CH[i], src = "assets/clip/" + c.k;
    fg.poster = src + ".webp"; bg.src = src + ".webp";
    if (avviato) { fg.src = src + ".mp4"; if (!fermo && visto) { var p = fg.play(); if (p && p.catch) p.catch(function () {}); } }
  }
  function vai(j, anim) {
    i = (j + CH.length) % CH.length; acc = 0; t0 = performance.now();
    btns.forEach(function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-current", k === i ? "true" : "false"); fills[k].style.width = k < i ? "100%" : "0"; });
    carica(); didascalie(anim !== false);
  }
  function giro(now) {
    raf = 0;
    if (fermo || !visto) return;
    var f = Math.min(1, (acc + now - t0) / CAP);
    fills[i].style.width = (f * 100) + "%";
    if (f >= 1) vai(i + 1);
    raf = requestAnimationFrame(giro);
  }
  function corri() { if (!raf && !fermo && visto && avviato) { t0 = performance.now(); raf = requestAnimationFrame(giro); } }
  function sosta() { if (raf) { cancelAnimationFrame(raf); raf = 0; acc += performance.now() - t0; } }
  function tasto() {
    var b = $("tvPP"), p = fermo || !avviato;
    b.innerHTML = p ? PLAY : PAUSE; b.setAttribute("aria-label", t(p ? "tr_play" : "tr_pause"));
  }
  function play() { fermo = false; if (!avviato) { avviato = true; carica(); } else if (visto) fg.play().catch(function () {}); corri(); tasto(); }
  function pause() { fermo = true; sosta(); fg.pause(); tasto(); }

  function social() {
    var C = window.CONFIG || {}, L = [["ig", "Instagram", C.INSTAGRAM_URL, "@topplers.official"], ["tt", "TikTok", C.TIKTOK_URL, "@topplers.official"], ["yt", "YouTube", C.YOUTUBE_URL, t("soc_yt")]];
    $("socs").innerHTML = L.map(function (s) {
      var body = ICO[s[0]] + "<span>" + s[1] + "<small>" + (s[2] ? s[3] : t("soc_soon")) + "</small></span>";
      return s[2] ? '<a class="soc ' + s[0] + '" href="' + s[2] + '" target="_blank" rel="noopener">' + body + "</a>"
                  : '<span class="soc off ' + s[0] + '" aria-disabled="true">' + body + "</span>";
    }).join("");
    var fs = $("footSocs");
    if (fs) fs.innerHTML = L.filter(function (s) { return s[2]; }).map(function (s) { return '<a href="' + s[2] + '" target="_blank" rel="noopener" aria-label="' + s[1] + '">' + ICO[s[0]] + "</a>"; }).join("");
    var full = $("tvFull");
    if (C.TRAILER_URL) { full.href = C.TRAILER_URL; full.hidden = false; }
  }

  T.initTrailer = function () {
    fg = $("tvFg"); bg = $("tvBg"); if (!fg) return;
    var rail = $("tvRail");
    rail.innerHTML = CH.map(function () { return '<button class="tv-ch" type="button"><i><b></b></i><span></span></button>'; }).join("");
    btns = Array.prototype.slice.call(rail.querySelectorAll(".tv-ch")); fills = rail.querySelectorAll("b");
    btns.forEach(function (b, k) { b.addEventListener("click", function () { sosta(); vai(k); if (!avviato || fermo) play(); else corri(); }); });
    $("tvPP").addEventListener("click", function () { (fermo || !avviato) ? play() : pause(); });
    fg.addEventListener("click", function () { (fermo || !avviato) ? play() : pause(); });
    T.onLang(function () {
      btns.forEach(function (b, k) { var n = t(CH[k].n); b.querySelector("span").textContent = n; b.setAttribute("aria-label", n); });
      didascalie(false); tasto(); social();
    });
    vai(0, false);
    if (T.reduce) fermo = true; else avviato = true;
    tasto();
    /* le clip girano solo mentre lo schermo si vede, e ripartono da dove erano */
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {
      visto = es[0].isIntersecting;
      if (visto) { if (avviato && !fg.getAttribute("src")) carica(); if (!fermo && avviato) fg.play().catch(function () {}); corri(); }
      else { sosta(); fg.pause(); }
    }, { threshold: .25 }).observe($("tvScr"));
    else { visto = true; carica(); corri(); }
    document.addEventListener("visibilitychange", function () { if (document.hidden) { sosta(); fg.pause(); } else if (visto && !fermo && avviato) { fg.play().catch(function () {}); corri(); } });
  };
})(window.Topplers);
