/* Disegnatori delle parti costruite dai dati: mondi, potenziamenti, personalizzazione, stato, ricompense, stretch goal, roadmap. */
(function (T) {
  "use strict";
  var t = T.t, $ = T.$;

  function targa(file, testo) { return '<div class="targa"><img src="assets/targhe/' + file + '.webp" width="520" height="232" alt="" loading="lazy"><span>' + testo + "</span></div>"; }

  /* ---- tasti Kickstarter: spenti finche' il link e' vuoto ---- */
  function setKS() {
    var url = (window.CONFIG || {}).KICKSTARTER_URL;
    ["ksbtn", "ksbtn2", "ksbtn3"].forEach(function (id) {
      var b = $(id); if (!b) return;
      if (url) { b.href = url; b.classList.remove("flat"); b.innerHTML = t("cta_ks"); b.removeAttribute("aria-disabled"); b.removeAttribute("tabindex"); }
      else { b.removeAttribute("href"); b.classList.add("flat"); b.innerHTML = t("cta_ks_soon"); b.setAttribute("aria-disabled", "true"); b.setAttribute("tabindex", "-1"); }
    });
  }

  /* ---- clip che partono solo quando si vedono ---- */
  var clipIO = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { if (!T.reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } } else v.pause();
    });
  }, { threshold: .25 }) : null;
  T.watchClips = function (root) { if (clipIO) (root || document).querySelectorAll("video[data-clip]").forEach(function (v) { clipIO.observe(v); }); };
  function clip(nome) {
    return '<div class="phone" data-tilt><video data-clip muted loop playsinline preload="none" width="540" height="960" poster="assets/clip/' + nome + '.webp" aria-hidden="true"><source src="assets/clip/' + nome + '.mp4" type="video/mp4"></video></div>';
  }

  /* ---- potenziamenti ---- */
  var PUICO = {
    green: '<circle cx="36" cy="36" r="32" fill="#45c940" stroke="#1d6b1a" stroke-width="4"/><path d="M36 54c0-12 3-19 14-24-2 11-6 18-14 24z M36 54c0-9-4-15-13-17 0 9 4 15 13 17z" fill="#fffbea"/><path d="M36 54V30" stroke="#fffbea" stroke-width="3" stroke-linecap="round"/>',
    slate: '<circle cx="36" cy="36" r="32" fill="#59738f" stroke="#2e4157" stroke-width="4"/><path d="M36 20v26M24 36l12 12 12-12" stroke="#fffbea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    orange: '<circle cx="36" cy="36" r="32" fill="#ff8c17" stroke="#9a4d05" stroke-width="4"/><path d="M22 26l14 12 14-12M22 40l14 12 14-12" stroke="#fffbea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    red: '<circle cx="36" cy="36" r="32" fill="#ed3b36" stroke="#8c1b18" stroke-width="4"/><path d="M36 52C22 42 18 34 22 27c3-5 10-5 14 1 4-6 11-6 14-1 4 7 0 15-14 25z" fill="#fffbea"/>',
    purple: '<circle cx="36" cy="36" r="32" fill="#8a5ad8" stroke="#4c2a86" stroke-width="4"/><rect x="23" y="23" width="26" height="26" rx="6" fill="none" stroke="#fffbea" stroke-width="5"/><path d="M29 43l14-14M43 43L29 29" stroke="#fffbea" stroke-width="5" stroke-linecap="round"/>'
  };
  function renderPU() {
    var ks = [["pu1", "green"], ["pu2", "slate"], ["pu3", "orange"], ["pu4", "red"], ["pu5", "purple"]];
    $("pulist").innerHTML = ks.map(function (p) {
      return '<button class="pu" type="button"><svg viewBox="0 0 72 72" aria-hidden="true">' + PUICO[p[1]] + "</svg><h3>" + t(p[0] + "_t") + "</h3><p>" + t(p[0] + "_d") + "</p></button>";
    }).join("");
  }

  /* ---- titoli (le skin, i basamenti e i pet stanno in lab.js) ---- */
  /* titoli: carosello (8 targhe; la logica di scorrimento sta in js/vetrine.js) */
  var TARGHE = [["figlio_delle_pianure", "tt_figlio", "w"], ["signore_del_ghiaccio", "tt_ghiaccio", "w"], ["re_della_lava", "tt_lava", "w"], ["maestro_delle_torri", "tt_maestro", "w"],
    ["apprendista_sostenitore", "t1_n", "b"], ["costruttore_sostenitore", "t2_n", "b"], ["ingegnere_sostenitore", "t3_n", "b"], ["arcangelo_dell_architettura", "t5_n", "b"]];
  T.TARGHE = TARGHE;
  function renderTarghe() {
    $("targhe").innerHTML = TARGHE.map(function (x, i) {
      return '<button type="button" class="car-item" data-i="' + i + '" style="--r:' + (i % 2 ? 2 : -2) + 'deg" aria-label="' + t(x[1]) + '">' + targa(x[0], t(x[1])) + "</button>";
    }).join("");
    T.caroselloTarghe && T.caroselloTarghe();
  }

  /* ---- costruzione libera: il telefono con la clip ---- */
  function renderFreePhone() { $("freePhone").innerHTML = clip("libera"); T.watchClips($("freePhone")); }

  /* ---- tappe della costruzione libera ---- */
  function renderMiles() {
    $("miles").innerHTML = [1, 2, 3].map(function (i) { return '<li data-m="' + [25, 50, 60][i - 1] + '"><b>' + t("ms" + i + "_t") + "</b><span>" + t("ms" + i + "_d") + "</span></li>"; }).join("");
  }

  /* ---- stato dei lavori ---- */
  var STATI = [["s1", 3, "I"], ["s2", 3, "O"], ["s3", 2, "T"], ["s4", 2, "L"], ["s5", 2, "J"], ["s6", 1, "S"], ["s7", 2, "Z"], ["s8", 1, "I"], ["s9", 1, "O"], ["s10", 2, "T"], ["s11", 2, "L"], ["s12", 2, "J"]];
  T.STATI = STATI;
  function pips(n) { var m = ""; for (var i = 1; i <= 4; i++) m += "<i" + (i <= n ? ' class="on"' : "") + "></i>"; return '<span class="pips" aria-hidden="true">' + m + "</span>"; }
  function renderStatus() {
    if (!$("statuslist")) return;
    var pct = Math.round(STATI.reduce(function (a, s) { return a + s[1]; }, 0) / (STATI.length * 4) * 100);
    $("statuslist").innerHTML =
      '<div class="anello" data-pct="' + pct + '"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="a-bg" cx="60" cy="60" r="50"/><circle class="a-fg" cx="60" cy="60" r="50"/></svg><span class="a-in"><b>' + pct + '%</b><small>' + t("st_ring") + "</small></span></div>" +
      '<div class="st-right"><div class="pastiglie">' + STATI.map(function (s, i) {
        return '<button type="button" class="pastiglia" data-i="' + i + '" aria-label="' + t(s[0] + "_t") + ", " + t("lv" + s[1]) + '"><img src="' + T.pieceSrc(s[2], "lego") + '" alt="" width="30" height="20">' + t(s[0] + "_t") + pips(s[1]) + "</button>";
      }).join("") + '</div><p class="st-cap" aria-live="polite"><b>' + t("st_tap") + "</b>" + t("st_tap_d") + "</p></div>";
    T.statoVivo && T.statoVivo();
  }

  /* ---- ricompense ---- */
  /* ---- ricompense: una torre a piani. Ogni piano e' un livello; toccandolo si accende con quelli sotto e a lato compare la sua carta.
     Le cinque carte stanno tutte nella stessa cella della griglia, cosi' il riquadro ha sempre l'altezza della piu' lunga e non salta. ---- */
  var TIERS = [
    { p: 10, k: "t1", n: 4, f: "apprendista_sostenitore", c: ["#dc9a68", "#b06a3c", "#7a4424"] },
    { p: 25, k: "t2", n: 3, f: "costruttore_sostenitore", c: ["#b7c1ce", "#8592a4", "#5d6a7c"] },
    { p: 50, k: "t3", n: 5, f: "ingegnere_sostenitore", c: ["#f8cf4a", "#e0a514", "#9a6a06"] },
    { p: 100, k: "t4", n: 7, f: "maestro_delle_torri", c: ["#5aa6f5", "#2f6fd0", "#1b4c95"] },
    { p: 250, k: "t5", n: 2, f: "arcangelo_dell_architettura", c: ["#b98af2", "#8a52d8", "#5d2fa0"] }
  ];
  var tierCur = 2, tierTouched = false, tierTimer = null, tierVisible = false;
  function renderTiers() {
    if (!$("piFloors")) return;
    $("piFloors").innerHTML = TIERS.map(function (x, i) {
      return '<button type="button" class="pi-floor" data-i="' + i + '" style="--w:' + (100 - i * 6) + "%;--c1:" + x.c[0] + ";--c2:" + x.c[1] + ";--c3:" + x.c[2] + '" aria-pressed="false">' +
        '<span class="pi-price">' + T.money(x.p) + '</span><span class="pi-name">' + t(x.k + "_n") + "</span></button>";
    }).join("");
    $("piCards").innerHTML = TIERS.map(function (x, i) {
      var li = ""; for (var k = 1; k <= x.n; k++) li += "<li>" + t(x.k + "_" + k) + "</li>";
      return '<article class="pi-card' + (x.n > 5 ? " long" : "") + '" data-i="' + i + '" style="--c2:' + x.c[1] + '"><div class="pi-head"><span class="pl price">' + T.money(x.p) + "</span>" + targa(x.f, t(x.k + "_n")) + "</div><ul>" + li + "</ul></article>";
    }).join("");
    showTier(tierCur, false);
  }
  function showTier(i, animate) {
    tierCur = i;
    $("piFloors").querySelectorAll(".pi-floor").forEach(function (b, k) { b.classList.toggle("lit", k <= i); b.classList.toggle("cur", k === i); b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    $("piCards").querySelectorAll(".pi-card").forEach(function (c, k) { c.classList.toggle("on", k === i); });
    if (animate && window.gsap && !T.reduce) {
      var card = $("piCards").children[i];
      gsap.fromTo(card.querySelectorAll("li"), { x: 18, opacity: 0 }, { x: 0, opacity: 1, duration: .4, stagger: .05, ease: "back.out(2)", clearProps: "transform,opacity" });
      gsap.fromTo(card.querySelector(".targa"), { scale: .85, rotation: -4 }, { scale: 1, rotation: 0, duration: .55, ease: "elastic.out(1,.55)", clearProps: "transform" });
    }
  }
  function tierAuto() {
    clearTimeout(tierTimer); tierTimer = null;
    if (tierTouched || T.reduce || !tierVisible) return;
    tierTimer = setTimeout(function () { showTier((tierCur + 1) % TIERS.length, true); tierAuto(); }, 2800);
  }
  if ($("piFloors")) {
    $("piFloors").addEventListener("click", function (e) { var b = e.target.closest(".pi-floor"); if (!b) return; tierTouched = true; clearTimeout(tierTimer); showTier(+b.getAttribute("data-i"), true); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (v) { tierVisible = v[0].isIntersecting; tierAuto(); }, { threshold: .35 }).observe($("tiers"));
  }

  /* ---- stretch goal: un sentiero di oblo'. Il pezzo cammina fino alla cifra del simulatore, gli oblo' raggiunti si colorano,
     la carta sotto dice l'ultimo obiettivo sbloccato e quanto manca al prossimo (o quello dell'oblo' toccato). ---- */
  var GOALS = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000], GMIN = 1500;
  var GCOL = ["#45C940", "#1CB8ED", "#AB4AE8", "#FF8C17", "#2969F5", "#F5384A", "#E0A514", "#8A5AD8"];
  var gShown = null, gLast = -2;
  /* oblo' equidistanti; fra un obiettivo e l'altro il pezzo avanza in proporzione alla cifra */
  function gx(v) {
    var pts = [GMIN].concat(GOALS), n = pts.length - 1;
    v = Math.max(GMIN, Math.min(v, GOALS[GOALS.length - 1]));
    for (var i = 0; i < n; i++) if (v <= pts[i + 1]) return ((i + (v - pts[i]) / (pts[i + 1] - pts[i])) / n * 100).toFixed(2) + "%";
    return "100%";
  }
  function drawGoalsFrame() {
    if (!$("sePath")) return;
    $("sePath").querySelectorAll(".se-o, .se-amt, .se-walker").forEach(function (e) { e.remove(); });
    $("sePath").insertAdjacentHTML("beforeend", GOALS.map(function (g, i) {
      var last = i === GOALS.length - 1;
      return '<button type="button" class="se-o" data-i="' + i + '" style="left:' + gx(g) + ";--k:" + GCOL[i] + '" aria-label="' + T.money(g) + ": " + (last ? t("gb_secret") : t("g" + i + "_t")) + '">' + (last ? "?" : i + 1) + '</button><span class="se-amt" style="left:' + gx(g) + '">' + T.money(g) + "</span>";
    }).join("") + '<img class="se-walker" id="seWalker" alt="" src="' + T.pieceSrc("T", "lego") + '" width="127" height="85">');
    gLast = -2; updateGoals(false);
  }
  function updateGoals(animate) {
    if (!$("sim") || !$("sePath")) return;
    var v = +$("sim").value, n = -1;
    GOALS.forEach(function (g, i) { if (v >= g) n = i; });
    $("simout").textContent = T.money(v);
    $("seFill").style.width = gx(v); $("seWalker").style.left = gx(v);
    var s = gShown == null ? n : gShown;
    $("sePath").querySelectorAll(".se-o").forEach(function (o, i) {
      var was = o.classList.contains("on");
      o.classList.toggle("on", i <= n); o.classList.toggle("sel", i === s);
      if (animate && i <= n && !was && window.gsap && !T.reduce) {
        var r = o.getBoundingClientRect(); T.burst(r.left + r.width / 2, r.top + r.height / 2, 8, [GCOL[i], "#ffcc3d"]);
      }
    });
    var key = s + "|" + n;
    if (key === gLast) return;
    gLast = key;
    var nx = n + 1 < GOALS.length ? n + 1 : -1, html;
    var nextLine = nx < 0 ? t("gb_done") : t("gb_next").replace("{n}", nx === GOALS.length - 1 ? t("gb_secret") : t("g" + nx + "_t")).replace("{v}", T.money(GOALS[nx] - v));
    if (s < 0) html = '<span class="se-k">' + t("gb_none") + '</span><h3>' + t("gb_left").replace("{v}", T.money(GOALS[0] - v)) + '</h3><p>' + t("gb_first").replace("{n}", t("g0_t")) + "</p>";
    else {
      var got = s <= n, secret = s === GOALS.length - 1 && !got;
      html = '<span class="se-k' + (got ? " ok" : "") + '">' + (got ? t("gb_ok") : t("gb_lock")) + " · " + T.money(GOALS[s]) + '</span><h3 style="--k:' + GCOL[s] + '">' + (secret ? t("gb_secret") : t("g" + s + "_t")) + "</h3><p>" + (secret ? t("gb_secret_d") : t("g" + s + "_d")) + '</p><p class="se-next">' + nextLine + "</p>";
    }
    $("seCard").innerHTML = html;
    if (animate && window.gsap && !T.reduce) gsap.fromTo($("seCard").children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .05, ease: "power2.out", clearProps: "transform,opacity" });
  }
  T.updateGoals = updateGoals;
  if ($("sePath")) $("sePath").addEventListener("click", function (e) { var o = e.target.closest(".se-o"); if (o) { gShown = +o.getAttribute("data-i"); updateGoals(true); } });

  /* ---- roadmap ---- */
  function renderRoad() {
    if (!$("road")) return;
    $("road").innerHTML = [1, 2, 3, 4, 5].map(function (i) { return '<li data-rv="left"><b>' + t("r" + i + "_d") + "</b><span>" + t("r" + i + "_t") + "</span></li>"; }).join("");
  }

  T.onLang(function () {
    setKS(); renderPU(); renderTarghe(); renderFreePhone(); renderMiles(); renderStatus(); renderTiers(); drawGoalsFrame(); renderRoad();
  });
  if ($("sim")) $("sim").addEventListener("input", function () { gShown = null; updateGoals(true); });
})(window.Topplers);
