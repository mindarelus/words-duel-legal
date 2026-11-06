/* Screen 20, "Random games": from every free move on our board, play games with completely random moves
   and count how often X wins. Each click adds games, so the pupil sees the noise settle. */
(function () {
  "use strict";

  var T = window.TTT;
  var BATCH = 10;          // random games added per move with one click
  var NOTE_AFTER = 50;     // games per move after which the trap of "top right" is explained
  var BEST = 5;            // middle right, the move minimax finds on screen 5
  var TRAP = 2;            // top right: about even in random games, but O wins at once in a real game
  var GOOD_SOFT = "#d3eee2";
  var BAD_SOFT = "#f6dcda";

  var root = document.getElementById("playouts");
  var boardBox = root.querySelector(".board-box");
  var counter = root.querySelector(".counter");
  var text = root.querySelector("[data-text]");
  var more = root.querySelector("[data-more]");
  var reset = root.querySelector("[data-reset]");
  var moves = T.empties(T.PUZZLE);
  var wins = {};
  var games = 0;

  // One game from position b with uniformly random moves for both sides: +1 X wins, 0 draw, -1 O wins.
  function playout(b) {
    for (;;) {
      var w = T.winner(b);
      if (w) return w === "X" ? 1 : -1;
      var free = T.empties(b);
      if (!free.length) return 0;
      b = T.play(b, free[Math.floor(Math.random() * free.length)]);
    }
  }

  function clear() {
    games = 0;
    for (var i = 0; i < moves.length; i++) wins[moves[i]] = 0;
  }

  function leader() {
    var best = moves[0];
    for (var i = 1; i < moves.length; i++) if (wins[moves[i]] > wins[best]) best = moves[i];
    return best;
  }

  function show() {
    if (!games) {
      boardBox.innerHTML = T.boardSVG(T.PUZZLE, { label: "Нашата дъска преди случайните партии" });
      counter.textContent = "0 партии";
      text.textContent = "Натисни бутона: от всеки свободен ход ще доиграем по " + BATCH + " съвсем случайни партии.";
      reset.hidden = true;
      return;
    }
    var labels = {};
    for (var i = 0; i < moves.length; i++) labels[moves[i]] = Math.round((wins[moves[i]] / games) * 100) + "%";
    var top = leader();
    var fills = {};
    fills[top] = top === BEST ? GOOD_SOFT : BAD_SOFT;
    boardBox.innerHTML = T.boardSVG(T.PUZZLE, {
      fills: fills,
      labels: labels,
      labelSize: 30,
      label: "Колко често печели X след " + games + " случайни партии от всеки ход"
    });
    counter.textContent = games + " случайни партии от всеки ход";
    var line = top === BEST
      ? "Води средата вдясно — същият ход, който откри минимакс. Случайните партии го намериха."
      : "Сега води ходът " + T.CELL_NAMES[top] + ". Малко случайни партии могат да излъжат — пусни още.";
    if (games >= NOTE_AFTER) {
      line += " А ходът " + T.CELL_NAMES[TRAP] + " печели в около половината случайни партии, макар че губи веднага: " +
        "O печели със средата вдясно. Случайният противник пропуска този ход 3 пъти от 4.";
    }
    text.textContent = line;
    reset.hidden = false;
  }

  more.addEventListener("click", function () {
    for (var i = 0; i < moves.length; i++) {
      var b = T.play(T.PUZZLE, moves[i]);
      for (var k = 0; k < BATCH; k++) if (playout(b) === 1) wins[moves[i]]++;
    }
    games += BATCH;
    show();
  });
  reset.addEventListener("click", function () {
    clear();
    show();
  });
  clear();
  show();
})();
