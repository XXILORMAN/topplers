/* Disegnatori delle parti costruite dai dati: mondi, potenziamenti, personalizzazione, stato, ricompense, stretch goal, roadmap. */
(function (T) {
  "use strict";
  var t = T.t, $ = T.$;

  function targa(file, testo) { return '<div class="targa"><img src="assets/targhe/' + file + '.webp" width="520" height="232" alt="" loading="lazy"><span>' + testo + "</span></div>"; }

  /* ---- tasti Kickstarter: spenti finche' il link e' vuoto ---- */
  function setKS() {
    var url = (window.CONFIG || {}).KICKSTARTER_URL;
    ["ksbtn", "ksbtn2"].forEach(function (id) {
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
  function renderTarghe() {
    $("targhe").innerHTML = targa("figlio_delle_pianure", t("tt_figlio")) + targa("signore_del_ghiaccio", t("tt_ghiaccio")) + targa("re_della_lava", t("tt_lava")) + targa("maestro_delle_torri", t("tt_maestro"));
  }
  /* ---- costruzione libera: il telefono con la clip ---- */
  function renderFreePhone() { $("freePhone").innerHTML = clip("libera"); T.watchClips($("freePhone")); }

  /* ---- tappe della costruzione libera ---- */
  function renderMiles() {
    $("miles").innerHTML = [1, 2, 3].map(function (i) { return '<li data-m="' + [25, 50, 60][i - 1] + '"><b>' + t("ms" + i + "_t") + "</b><span>" + t("ms" + i + "_d") + "</span></li>"; }).join("");
  }

  /* ---- stato dei lavori ---- */
  function renderStatus() {
    var rows = [["s1", 3], ["s2", 3], ["s3", 2], ["s4", 2], ["s5", 2], ["s6", 1], ["s7", 2], ["s8", 1], ["s9", 1], ["s10", 2], ["s11", 2], ["s12", 2]];
    $("statuslist").innerHTML = rows.map(function (r) {
      var lv = r[1] === 1 ? "lv1" : r[1] === 2 ? "lv2" : "lv3", m = "";
      for (var i = 1; i <= 4; i++) m += "<i" + (i <= r[1] ? ' class="on"' : "") + "></i>";
      return '<div class="st" data-rv="up"><div class="top"><b>' + t(r[0] + "_t") + '</b><span class="lv">' + t(lv) + '</span></div><div class="meter" aria-hidden="true">' + m + "</div><p>" + t(r[0] + "_d") + "</p></div>";
    }).join("");
  }

  /* ---- ricompense ---- */
  function renderTiers() {
    function li(p, n) { var s = ""; for (var i = 1; i <= n; i++) s += "<li>" + t(p + "_" + i) + "</li>"; return s; }
    function price(v) { return '<span class="pl price" data-count="' + v + '">' + T.money(v) + "</span>"; }
    $("tiers").innerHTML =
      '<article class="tier" data-rv="pop">' + price(10) + targa("apprendista_sostenitore", t("t1_n")) + "<ul>" + li("t1", 4) + "</ul></article>" +
      '<article class="tier" data-rv="pop">' + price(25) + targa("costruttore_sostenitore", t("t2_n")) + "<ul>" + li("t2", 3) + "</ul></article>" +
      '<article class="tier" data-rv="pop">' + price(50) + targa("ingegnere_sostenitore", t("t3_n")) + "<ul>" + li("t3", 5) + "</ul></article>" +
      '<article class="tier top" data-rv="pop">' + price(100) + targa("maestro_delle_torri", t("t4_n")) + "<ul>" + li("t4", 7) + "</ul></article>" +
      '<article class="tier top wide" data-rv="pop"><div>' + price(250) + "</div><div>" + targa("arcangelo_dell_architettura", t("t5_n")) + "</div><div><ul>" + li("t5", 2) + "</ul></div></article>";
  }

  /* ---- stretch goal ---- */
  var GOALS = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000];
  var GCOL = ["#45C940", "#1CB8ED", "#AB4AE8", "#FF8C17", "#2969F5", "#F5384A", "#FFC71A", "#8A5AD8"];
  function drawGoalsFrame() {
    $("glist").innerHTML = GOALS.map(function (g, i) {
      return '<div class="g" data-i="' + i + '"><span class="amt">' + T.money(g) + '</span><span class="tx"><b>' + t("g" + i + "_t") + "</b><small>" + t("g" + i + "_d") + '</small></span><span class="st2"></span></div>';
    }).join("");
    $("tower").innerHTML = '<div class="base"></div>' + GOALS.map(function (g, i) { return '<div class="blk" data-i="' + i + '"></div>'; }).join("");
    updateGoals(false);
  }
  function updateGoals(animate) {
    var v = +$("sim").value;
    $("simout").textContent = T.money(v);
    GOALS.forEach(function (g, i) {
      var lit = v >= g;
      var row = $("glist").children[i], blk = $("tower").children[i + 1];
      if (!row || !blk) return;
      var was = row.classList.contains("on");
      row.classList.toggle("on", lit); blk.classList.toggle("on", lit);
      blk.style.background = lit ? "linear-gradient(" + GCOL[i] + "," + T.shade(GCOL[i], -.12) + ")" : "";
      row.querySelector(".st2").textContent = lit ? "OK" : "";
      if (animate && lit && !was && window.gsap && !T.reduce) {
        gsap.fromTo(blk, { y: -80, scaleY: 1.3, scaleX: .85, opacity: 0 }, { y: 0, scaleY: 1, scaleX: 1, opacity: 1, duration: .55, ease: "bounce.out" });
        gsap.fromTo(row, { x: 24 }, { x: 0, duration: .5, ease: "elastic.out(1,.5)" });
        var r = blk.getBoundingClientRect(); T.burst(r.left + r.width / 2, r.top, 8, [GCOL[i], "#ffcc3d"]);
      }
    });
  }
  T.updateGoals = updateGoals;

  /* ---- roadmap ---- */
  function renderRoad() {
    $("road").innerHTML = [1, 2, 3, 4, 5].map(function (i) { return '<li data-rv="left"><b>' + t("r" + i + "_d") + "</b><span>" + t("r" + i + "_t") + "</span></li>"; }).join("");
  }

  T.onLang(function () {
    setKS(); renderPU(); renderTarghe(); renderFreePhone(); renderMiles(); renderStatus(); renderTiers(); drawGoalsFrame(); renderRoad();
  });
  $("sim").addEventListener("input", function () { updateGoals(true); });
})(window.Topplers);
