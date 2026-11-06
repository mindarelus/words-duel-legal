/* Screen 19, "Release the scouts": precomputed MCTS frames on our board. */
(function () {
  "use strict";

  var T = window.TTT;
  var GOOD_SOFT = "#d3eee2";
  // Root visit counts from one real UCT run with random rollouts (seed 7), computed by uchebnik_opus/build.py.
  var FRAMES = [
    { n: 1, visits: { 1: 0, 2: 0, 5: 1, 6: 0, 7: 0 },
      text: "Първият разузнавач тръгва по случаен ход, доиграва партията и носи резултата обратно. Още почти нищо не знаем." },
    { n: 5, visits: { 1: 1, 2: 1, 5: 1, 6: 1, 7: 1 },
      text: "Всеки ход е проверен по веднъж. Първите резултати могат да лъжат: при случайна игра противникът често пропуска печелившия си ход." },
    { n: 20, visits: { 1: 2, 2: 2, 5: 7, 6: 4, 7: 5 },
      text: "Разузнавачите вече тръгват по-често към обещаващото, но от време на време проверяват и останалите ходове." },
    { n: 100, visits: { 1: 9, 2: 11, 5: 59, 6: 10, 7: 11 },
      text: "59 от 100 разузнавачи са минали през средата вдясно — същия ход, който минимакс откри на екран 5. Избираме хода с най-много посещения." }
  ];

  var root = document.getElementById("scouts");
  var boardBox = root.querySelector(".board-box");
  var counter = root.querySelector(".counter");
  var text = root.querySelector("[data-text]");
  var next = root.querySelector("[data-next]");
  var index = -1;

  function show() {
    if (index < 0) {
      boardBox.innerHTML = T.boardSVG(T.PUZZLE, { label: "Нашата дъска преди първата проба" });
      counter.textContent = "0 проби";
      text.textContent = "Натисни бутона, за да пуснеш първия разузнавач.";
      next.textContent = "Следваща проба";
      return;
    }
    var frame = FRAMES[index];
    var labels = {};
    var top = 0;
    var best = [];
    for (var cell in frame.visits) {
      if (!Object.prototype.hasOwnProperty.call(frame.visits, cell)) continue;
      var count = frame.visits[cell];
      labels[cell] = String(count);
      if (count > top) {
        top = count;
        best = [cell];
      } else if (count === top) {
        best.push(cell);
      }
    }
    var fills = {};
    if (best.length === 1 && frame.n > 1) fills[best[0]] = GOOD_SOFT;
    boardBox.innerHTML = T.boardSVG(T.PUZZLE, {
      fills: fills,
      labels: labels,
      labelSize: 34,
      label: "Посещения след " + frame.n + (frame.n === 1 ? " проба" : " проби")
    });
    counter.textContent = frame.n === 1 ? "1 проба" : frame.n + " проби";
    text.textContent = frame.text;
    next.textContent = index === FRAMES.length - 1 ? "Отначало" : "Следваща проба";
  }

  next.addEventListener("click", function () {
    index = index === FRAMES.length - 1 ? -1 : index + 1;
    show();
  });
  show();
})();
