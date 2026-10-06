/* L'anteprima della torre: una torre gia' fatta su cui si cambiano skin dei pezzi, basamento e pet. Pochi gesti: un tocco e la torre si trasforma.
   Se nessuno la tocca, da sola passa in rassegna le skin (si ferma al primo tocco). Niente caduta di pezzi, niente crolli. */
(function (T) {
  "use strict";
  var t = T.t, $ = T.$;
  var BASI = ["torrione", "faro", "torta_a_piani", "isola_volante", "gemma_tagliata", "castello_di_sabbia", "fungo"];
  var PETS = [
    { id: "kicky", w: 60, h: 120, n: 6, d: .6, key: "pet_kicky", fly: true },
    { id: "micio", w: 103, h: 100, n: 12, d: 1.5, key: "pet_micio" },
    { id: "draghetto", w: 112, h: 112, n: 8, d: 1, key: "pet_drago" },
    { id: "geco", w: 96, h: 96, n: 10, d: 1.4, key: "pet_geco" }
  ];
  var COLS = 7, SEQ = ["I", "L", "O", "J", "T", "Z", "S", "O", "I"]; /* nessun buco, sei piani */
  var st = { skin: "lego", base: "torrione", pet: "micio" };
  var items = [], cell = 28, stage, stack, baseEl, petEl, nameEl, touched = false, visible = false, step = 0, timer = null;

  function petDef(id) { return PETS.filter(function (p) { return p.id === id; })[0]; }
  function sprite(p, h, still) {
    var s = h / p.h;
    return '<span class="petspr' + (still ? " still" : "") + '" style="--w:' + (p.w * s).toFixed(1) + "px;--h:" + h + "px;--n:" + p.n + ";--d:" + p.d + "s;background-image:url(assets/pet/" + p.id + '.webp)"></span>';
  }
  function label() {
    var p = st.pet ? petDef(st.pet) : null;
    var txt = t("skn_" + st.skin) + " · " + t("b_" + st.base) + (p ? " · " + t(p.key) : "");
    nameEl.textContent = txt; stage.setAttribute("aria-label", t("lab_stage") + ": " + txt);
  }

  /* ---- comandi ---- */
  function renderControls() {
    $("labSkins").innerHTML = T.SKINS.map(function (s) {
      return '<button type="button" class="tile" data-skin="' + s + '" aria-pressed="' + (s === st.skin) + '"><img src="' + T.pieceSrc("T", s) + '" alt="" loading="lazy"><span>' + t("skn_" + s) + "</span></button>";
    }).join("");
    $("labBases").innerHTML = BASI.map(function (b) {
      return '<button type="button" class="tile" data-base="' + b + '" aria-pressed="' + (b === st.base) + '"><span class="thumb" style="background-image:url(assets/basamenti/' + b + '.webp)"></span><span>' + t("b_" + b) + "</span></button>";
    }).join("");
    $("labPets").innerHTML = '<button type="button" class="tile" data-pet="" aria-pressed="' + (!st.pet) + '"><span class="thumb none"></span><span>' + t("lab_none") + "</span></button>" +
      PETS.map(function (p) {
        return '<button type="button" class="tile" data-pet="' + p.id + '" aria-pressed="' + (p.id === st.pet) + '"><span class="thumb pet">' + sprite(p, 44, true) + "</span><span>" + t(p.key) + "</span></button>";
      }).join("");
    if (nameEl) label();
  }
  function pressed(group, attr, val) {
    $(group).querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute(attr) === val ? "true" : "false"); });
  }

  /* ---- misure ---- */
  function measure() {
    var W = stage.clientWidth || 440;
    cell = Math.max(17, Math.min(window.innerWidth < 700 ? 24 : 34, Math.floor(W / 10.6)));
    stage.style.setProperty("--c", cell + "px");
    stage.style.setProperty("--ps", (cell / 30).toFixed(3));
    items.forEach(function (it) { T.placeEl(it.el, it.pos, cell); });
  }

  /* ---- la torre: sempre la stessa, senza buchi ---- */
  function build() {
    var G = T.newGrid(COLS), none = function () { return 0; };
    SEQ.forEach(function (kind) {
      var pos = T.bestSpot(G, kind, none); T.commit(G, pos);
      var el = T.pieceEl("div", pos.kind, pos.rot, st.skin);
      el.style.visibility = "hidden"; stack.appendChild(el); T.placeEl(el, pos, cell);
      items.push({ el: el, pos: pos });
    });
  }
  function drop() {
    items.forEach(function (it, i) {
      it.el.style.visibility = "visible";
      if (T.reduce) return;
      gsap.fromTo(it.el, { y: -(stage.clientHeight * .95), rotation: gsap.utils.random(-30, 30), opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: .9, ease: "bounce.out", delay: .1 + i * .11, clearProps: "opacity" });
    });
    gsap.delayedCall(.1 + items.length * .11 + .6, function () { if (st.pet) petIn(); });
  }

  /* ---- scelte ---- */
  function setSkin(s) {
    if (s === st.skin) return;
    st.skin = s; pressed("labSkins", "data-skin", s); label();
    if (T.reduce) { items.forEach(function (it) { T.reskinEl(it.el, s); }); return; }
    items.forEach(function (it, i) {
      gsap.timeline({ delay: i * .045 })
        .to(it.el, { scaleX: 0, duration: .13, ease: "power1.in" })
        .add(function () { T.reskinEl(it.el, s); })
        .to(it.el, { scaleX: 1, duration: .38, ease: "back.out(2.6)", clearProps: "transform" });
    });
  }
  function setBase(b) {
    if (b === st.base) return;
    st.base = b; pressed("labBases", "data-base", b); label();
    if (T.reduce) { baseEl.src = "assets/basamenti/" + b + ".webp"; return; }
    gsap.timeline()
      .to(baseEl, { y: cell * 2.2, duration: .22, ease: "power2.in" })
      .add(function () { baseEl.src = "assets/basamenti/" + b + ".webp"; })
      .fromTo(baseEl, { y: cell * 2.2 }, { y: 0, duration: .7, ease: "elastic.out(1,.5)", clearProps: "transform" })
      .fromTo(stack, { y: -cell * .35 }, { y: 0, duration: .5, ease: "bounce.out", clearProps: "transform" }, "<.25");
  }
  function petIn() {
    var p = petDef(st.pet); if (!p) return;
    petEl.innerHTML = sprite(p, 96, false); petEl.classList.toggle("fly", !!p.fly);
    if (!T.reduce) gsap.fromTo(petEl, { y: -cell * 3, scale: .3, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .8, ease: "bounce.out", clearProps: "transform,opacity" });
  }
  function setPet(id) {
    id = id || null; if (id === st.pet) return;
    st.pet = id; pressed("labPets", "data-pet", id || ""); label();
    if (T.reduce) { if (id) petIn(); else petEl.innerHTML = ""; return; }
    gsap.to(petEl, { y: -cell * 1.6, scale: .2, opacity: 0, duration: .2, ease: "power2.in", overwrite: true, onComplete: function () {
      petEl.innerHTML = ""; gsap.set(petEl, { clearProps: "transform,opacity" });
      if (id) petIn();
    } });
  }
  function petHop() {
    if (!st.pet || T.reduce) return;
    var r = petEl.getBoundingClientRect(); T.burst(r.left + r.width / 2, r.top + 10, 6, ["#ffcc3d", "#ff8c17", "#ed619e"]);
    gsap.fromTo(petEl, { y: 0 }, { y: -cell * 1.3, duration: .22, ease: "power2.out", yoyo: true, repeat: 1, clearProps: "transform" });
  }

  /* ---- passaggio automatico, finche' nessuno tocca ---- */
  function auto() {
    timer = null;
    if (touched || T.reduce || !visible) return;
    step++;
    setSkin(T.SKINS[step % T.SKINS.length]);
    if (step % 3 === 0) setBase(BASI[(step / 3) % BASI.length | 0]);
    if (step % 4 === 0) setPet(PETS[(step / 4) % PETS.length | 0].id);
    timer = setTimeout(auto, 2300);
  }
  function stopAuto() { touched = true; clearTimeout(timer); timer = null; }

  T.initLab = function () {
    stage = $("labStage"); stack = $("labStack"); baseEl = $("labBase"); petEl = $("labPet"); nameEl = $("labName");
    baseEl.src = "assets/basamenti/" + st.base + ".webp";
    measure(); build();
    T.onLang(renderControls);
    $("labSkins").addEventListener("click", function (e) { var b = e.target.closest("[data-skin]"); if (b) { stopAuto(); setSkin(b.getAttribute("data-skin")); } });
    $("labBases").addEventListener("click", function (e) { var b = e.target.closest("[data-base]"); if (b) { stopAuto(); setBase(b.getAttribute("data-base")); } });
    $("labPets").addEventListener("click", function (e) { var b = e.target.closest("[data-pet]"); if (b) { stopAuto(); setPet(b.getAttribute("data-pet")); } });
    $("labTabs").addEventListener("click", function (e) {
      var b = e.target.closest("[data-tab]"); if (!b) return; stopAuto();
      $("labCtrl").setAttribute("data-tab", b.getAttribute("data-tab"));
      $("labTabs").querySelectorAll("[data-tab]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
    });
    petEl.addEventListener("click", function () { stopAuto(); petHop(); });
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(stage); else window.addEventListener("resize", measure);
    var first = true;
    new IntersectionObserver(function (v) {
      visible = v[0].isIntersecting;
      if (visible && first) { first = false; drop(); timer = setTimeout(auto, 3600); }
      else if (visible && !touched && !timer) timer = setTimeout(auto, 1200);
      else if (!visible) { clearTimeout(timer); timer = null; }
    }, { threshold: .4 }).observe(stage);
  };
})(window.Topplers);
