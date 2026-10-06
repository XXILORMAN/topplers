/* Impilare pezzi su una griglia, come in una torre vera: dove cadrebbe un pezzo, quale posto sceglie un buon giocatore,
   e gli elementi (sprite del foglio della skin) da mettere in pagina. Li usano la torre laterale e il laboratorio. */
(function (T) {
  "use strict";
  var U = T.CELL_PX; /* pixel di una cella nel foglio */

  T.newGrid = function (cols) { return { cols: cols, rows: [], height: 0 }; };

  function up(kind, rot) {
    var cells = T.rotCells(T.SHAPES[kind], rot), d = T.dims(cells);
    return { cells: cells.map(function (c) { return [c[0], d.h - 1 - c[1]]; }), w: d.w, h: d.h };
  }
  function fits(G, cells, x, y) {
    for (var i = 0; i < cells.length; i++) { var cx = x + cells[i][0], cy = y + cells[i][1]; if (cx < 0 || cx >= G.cols || cy < 0 || (G.rows[cy] && G.rows[cy][cx])) return false; }
    return true;
  }
  /* dove si ferma il pezzo se cade in colonna col (y verso l'alto, 0 = sulla base) */
  T.landing = function (G, kind, rot, col) {
    var p = up(kind, rot), x = Math.max(0, Math.min(G.cols - p.w, col)), y = 60;
    while (y > 0 && fits(G, p.cells, x, y - 1)) y--;
    return { kind: kind, rot: rot, x: x, y: y, w: p.w, h: p.h, top: y + p.h, cells: p.cells };
  };
  T.commit = function (G, pos) {
    pos.cells.forEach(function (c) { (G.rows[pos.y + c[1]] = G.rows[pos.y + c[1]] || [])[pos.x + c[0]] = 1; });
    G.height = Math.max(G.height, pos.top);
  };
  /* come starebbe la griglia col pezzo posato: altezza massima, buchi coperti, dislivelli fra colonne */
  function judge(G, pos) {
    var rows = G.rows.map(function (r) { return r ? r.slice() : []; });
    pos.cells.forEach(function (c) { (rows[pos.y + c[1]] = rows[pos.y + c[1]] || [])[pos.x + c[0]] = 1; });
    var H = rows.length, heights = [], holes = 0;
    for (var x = 0; x < G.cols; x++) {
      var h = 0;
      for (var y = H - 1; y >= 0; y--) if (rows[y] && rows[y][x]) { h = y + 1; break; }
      heights.push(h);
      for (var y2 = 0; y2 < h; y2++) if (!(rows[y2] && rows[y2][x])) holes++;
    }
    var bump = 0; for (var i = 1; i < heights.length; i++) bump += Math.abs(heights[i] - heights[i - 1]);
    return { max: Math.max.apply(null, heights), holes: holes, bump: bump };
  }
  /* il posto migliore: basso, pari, senza buchi; tra i migliori ne sceglie uno a caso (rnd() in 0..1) */
  T.bestSpot = function (G, kind, rnd, pick) {
    var cand = [], seen = {};
    for (var rot = 0; rot < 4; rot++) {
      var key = JSON.stringify(up(kind, rot).cells.slice().sort()); if (seen[key]) continue; seen[key] = 1;
      for (var col = 0; col < G.cols; col++) {
        var pos = T.landing(G, kind, rot, col); if (pos.x !== col) continue;
        var j = judge(G, pos); pos.score = j.max * 3 + j.holes * 9 + j.bump * 0.7 + rnd() * 1.2; cand.push(pos);
      }
    }
    cand.sort(function (a, b) { return a.score - b.score; });
    return cand[Math.floor(rnd() * Math.min(pick || 3, cand.length))];
  };
  T.seeded = function (seed) { /* mulberry32: sempre la stessa torre */
    return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  };

  /* ---- elementi in pagina ---- */
  function fitImg(im, cell) { if (im.naturalWidth) im.style.width = (im.naturalWidth * cell / U) + "px"; }
  T.pieceEl = function (tag, kind, rot, skin) {
    var b = document.createElement(tag); b.className = "tp"; if (tag === "button") b.type = "button";
    var im = document.createElement("img"); im.alt = ""; im.draggable = false; im.src = T.pieceSrc(kind, skin);
    im.style.transform = "translate(-50%,-50%) rotate(" + rot * 90 + "deg)";
    b.appendChild(im); b._kind = kind; b._rot = rot;
    return b;
  };
  /* mette l'elemento sulla sua cella (cell = lato in pixel) */
  T.placeEl = function (el, pos, cell) {
    el.style.left = pos.x * cell + "px"; el.style.bottom = pos.y * cell + "px"; el.style.width = pos.w * cell + "px"; el.style.height = pos.h * cell + "px";
    var im = el.firstChild, d = T.dims(T.SHAPES[el._kind]);
    im.style.width = d.w * cell + "px"; /* misura provvisoria, quella vera arriva col foglio */
    fitImg(im, cell);
    im.onload = function () { fitImg(im, cell); };
    el._cell = cell;
  };
  T.reskinEl = function (el, skin) { var im = el.firstChild; im.src = T.pieceSrc(el._kind, skin); im.onload = function () { fitImg(im, el._cell || 24); }; };
})(window.Topplers);
