/* ============================================================
   RokaPuzzle — a tiny dependency-free 3×3 jigsaw.
   One image, swap-on-drag (mouse + touch via Pointer Events).
   Usage:
     RokaPuzzle.init({ board, image, size:3, onWin });
   ============================================================ */
(function (global) {
  'use strict';

  function init(opts) {
    var board = opts.board;
    var image = opts.image;
    var size = opts.size || 3;
    var onWin = opts.onWin || function () {};
    var count = size * size;

    var tiles = [];        // tile elements, index = current slot
    var order = [];        // order[slot] = correct-position id of the tile sitting there
    var dragId = null;     // id of tile being dragged
    var solved = false;

    function build() {
      board.innerHTML = '';
      tiles = [];
      order = [];
      for (var i = 0; i < count; i++) {
        var t = document.createElement('div');
        t.className = 'pz-tile';
        t.dataset.correct = i;                 // its true home position
        var row = Math.floor(i / size), col = i % size;
        t.style.backgroundImage = 'url("' + image + '")';
        // 3 cols => positions at 0%,50%,100%
        var denom = size - 1;
        t.style.backgroundPosition = (col * 100 / denom) + '% ' + (row * 100 / denom) + '%';
        wireTile(t);
        tiles.push(t);
        order.push(i);
        board.appendChild(t);
      }
    }

    function render() {
      // reorder DOM to match `order`
      for (var slot = 0; slot < count; slot++) {
        var tile = tiles[order[slot]];
        board.appendChild(tile);
      }
    }

    function shuffle() {
      solved = false;
      board.classList.remove('solved');
      do {
        for (var i = order.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = order[i]; order[i] = order[j]; order[j] = tmp;
        }
      } while (isSolved()); // never start solved
      render();
    }

    function isSolved() {
      for (var slot = 0; slot < count; slot++) {
        if (order[slot] !== slot) return false; // order[slot] is the tile's correct id
      }
      return true;
    }

    function swap(idA, idB) {
      if (idA === idB) return;
      var sa = order.indexOf(idA), sb = order.indexOf(idB);
      var tmp = order[sa]; order[sa] = order[sb]; order[sb] = tmp;
      render();
      if (isSolved()) win();
    }

    function win() {
      if (solved) return;
      solved = true;
      board.classList.add('solved');
      setTimeout(onWin, 450);
    }

    // ---- Pointer-based drag to swap ----
    function tileUnderPoint(x, y) {
      var el = document.elementFromPoint(x, y);
      while (el && el !== board && !el.classList.contains('pz-tile')) el = el.parentElement;
      return (el && el.classList && el.classList.contains('pz-tile')) ? el : null;
    }

    function wireTile(t) {
      t.addEventListener('pointerdown', function (e) {
        if (solved) return;
        dragId = parseInt(t.dataset.correct, 10);
        t.classList.add('dragging');
        t.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      t.addEventListener('pointermove', function (e) {
        if (dragId === null) return;
        clearOver();
        var over = tileUnderPoint(e.clientX, e.clientY);
        if (over && parseInt(over.dataset.correct, 10) !== dragId) over.classList.add('over');
      });
      t.addEventListener('pointerup', function (e) {
        if (dragId === null) return;
        var over = tileUnderPoint(e.clientX, e.clientY);
        t.classList.remove('dragging');
        clearOver();
        if (over) swap(dragId, parseInt(over.dataset.correct, 10));
        dragId = null;
      });
      t.addEventListener('pointercancel', function () {
        t.classList.remove('dragging'); clearOver(); dragId = null;
      });
      // keyboard a11y: click two tiles to swap
      t.addEventListener('click', function () {
        if (solved) return;
        var id = parseInt(t.dataset.correct, 10);
        if (selected === null) { selected = id; t.classList.add('over'); }
        else { clearOver(); swap(selected, id); selected = null; }
      });
    }
    var selected = null;
    function clearOver() {
      var o = board.querySelectorAll('.over');
      for (var i = 0; i < o.length; i++) o[i].classList.remove('over');
    }

    function solveNow() { // used by "Skip"
      for (var i = 0; i < count; i++) order[i] = i;
      render(); win();
    }

    build();
    shuffle();

    return { shuffle: shuffle, solve: solveNow, isSolved: function () { return solved; } };
  }

  global.RokaPuzzle = { init: init };
})(window);
