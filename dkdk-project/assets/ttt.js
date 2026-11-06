/* Tic-tac-toe for "our board" on screens 5 and 19–21: rules, minimax and an SVG board.
   The same rules and tie-breaks as the textbook's figures (uchebnik_opus/build.py). */
(function () {
  "use strict";

  var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var PUZZLE = "X  OO   X";  // X . . / O O . / . . X, X to move
  var CELL_NAMES = ["горе вляво", "горе в средата", "горе вдясно", "в средата вляво", "в центъра",
    "в средата вдясно", "долу вляво", "долу в средата", "долу вдясно"];
  var COLORS = { x: "#2e5eaa", o: "#c2453b", grid: "#9aa6b8", frame: "#c8d0dc", ink: "#1e2633" };
  var memo = {};

  function winner(b) {
    for (var i = 0; i < LINES.length; i++) {
      var l = LINES[i];
      if (b[l[0]] !== " " && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
    }
    return null;
  }

  function empties(b) {
    var out = [];
    for (var i = 0; i < 9; i++) if (b[i] === " ") out.push(i);
    return out;
  }

  function toMove(b) {
    var x = 0;
    var o = 0;
    for (var i = 0; i < 9; i++) {
      if (b[i] === "X") x++;
      else if (b[i] === "O") o++;
    }
    return x === o ? "X" : "O";
  }

  function play(b, i) {
    if (b[i] !== " ") throw new Error("Cell " + i + " is taken in [" + b + "]");
    return b.slice(0, i) + toMove(b) + b.slice(i + 1);
  }

  // Game value for X under perfect play: +1 win, 0 draw, -1 loss.
  function minimax(b) {
    if (Object.prototype.hasOwnProperty.call(memo, b)) return memo[b];
    var w = winner(b);
    var value;
    if (w) {
      value = w === "X" ? 1 : -1;
    } else {
      var free = empties(b);
      if (!free.length) {
        value = 0;
      } else {
        var xTurn = toMove(b) === "X";
        value = xTurn ? -2 : 2;
        for (var i = 0; i < free.length; i++) {
          var v = minimax(play(b, free[i]));
          value = xTurn ? Math.max(value, v) : Math.min(value, v);
        }
      }
    }
    memo[b] = value;
    return value;
  }

  function lexLess(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] < b[i];
    }
    return false;
  }

  // Strongest reply for the side to move; on ties an immediate win first, then the lowest cell.
  function bestReply(b) {
    var sign = toMove(b) === "X" ? 1 : -1;
    var free = empties(b);
    var best = -1;
    var bestKey = null;
    for (var i = 0; i < free.length; i++) {
      var next = play(b, free[i]);
      var key = [-sign * minimax(next), winner(next) ? 0 : 1, free[i]];
      if (bestKey === null || lexLess(key, bestKey)) {
        best = free[i];
        bestKey = key;
      }
    }
    return best;
  }

  // opts: fills {cell: colour}, labels {cell: text}, labelSize, clickable (empty cells become buttons), label.
  function boardSVG(b, opts) {
    opts = opts || {};
    var fills = opts.fills || {};
    var labels = opts.labels || {};
    var size = opts.labelSize || 28;
    var out = ['<svg class="board" viewBox="0 0 300 300" role="' + (opts.clickable ? "group" : "img") +
      '" aria-label="' + (opts.label || "Дъска за морски шах") + '">',
      '<rect x="2" y="2" width="296" height="296" rx="22" fill="#fff" stroke="' + COLORS.frame + '" stroke-width="3"/>'];
    for (var i = 0; i < 9; i++) {
      var r = Math.floor(i / 3);
      var k = i % 3;
      var cx = k * 100 + 50;
      var cy = r * 100 + 50;
      var clickable = opts.clickable && b[i] === " ";
      out.push(clickable ? '<g data-cell="' + i + '" tabindex="0" role="button" aria-label="Играй ' + CELL_NAMES[i] + '">' : "<g>");
      out.push('<rect class="cell" x="' + (k * 100 + 8) + '" y="' + (r * 100 + 8) +
        '" width="84" height="84" rx="14" fill="' + (fills[i] || "#fff") + '"/>');
      if (b[i] === "X") {
        out.push('<path d="M' + (cx - 24) + " " + (cy - 24) + "L" + (cx + 24) + " " + (cy + 24) + "M" + (cx + 24) + " " +
          (cy - 24) + "L" + (cx - 24) + " " + (cy + 24) + '" stroke="' + COLORS.x +
          '" stroke-width="10" stroke-linecap="round" fill="none"/>');
      } else if (b[i] === "O") {
        out.push('<circle cx="' + cx + '" cy="' + cy + '" r="26" fill="none" stroke="' + COLORS.o + '" stroke-width="10"/>');
      }
      if (labels[i] !== undefined) {
        out.push('<text x="' + cx + '" y="' + (cy + size * 0.36) + '" text-anchor="middle" font-size="' + size +
          '" font-weight="700" fill="' + COLORS.ink + '">' + labels[i] + "</text>");
      }
      out.push("</g>");
    }
    for (var t = 1; t < 3; t++) {
      out.push('<path d="M' + t * 100 + " 14V286M14 " + t * 100 + 'H286" stroke="' + COLORS.grid +
        '" stroke-width="4" stroke-linecap="round"/>');
    }
    out.push("</svg>");
    return out.join("");
  }

  window.TTT = {
    PUZZLE: PUZZLE,
    CELL_NAMES: CELL_NAMES,
    winner: winner,
    empties: empties,
    play: play,
    minimax: minimax,
    bestReply: bestReply,
    boardSVG: boardSVG
  };
})();
