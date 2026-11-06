/* Screen 15, "Why is Go so hard?": how many continuations three games have after one to four moves. */
(function () {
  "use strict";

  // Move sequences after 1-4 moves: tic-tac-toe 9 × 8 × 7 × 6, chess (the known perft counts) and Go on 19 × 19
  // (361 × 360 × 359 × 358, every free point; from the fourth move a few thousand of them would be suicide,
  // so the last Go number is shown rounded).
  var COUNTS = [
    [9, 20, 361],
    [72, 400, 129960],
    [504, 8902, 46655640],
    [3024, 197281, 16702719120]
  ];
  var LAST_GO = "≈ 16,7 млрд.";
  var MAX_DIGITS = 11;
  var TEXTS = [
    "Първи ход: в морския шах има 9 възможности, в шаха — 20, а в Го — 361.",
    "След два хода: в шаха вече има 400 продължения, а в Го — почти 130 хиляди.",
    "След три хода в Го продълженията са над 46 милиона.",
    "След четири хода в Го има около 16,7 милиарда продължения — около два пъти повече от хората на Земята. " +
      "А цяла партия шах е около 80 хода, а Го — около 150."
  ];

  var root = document.getElementById("growth");
  var nums = root.querySelectorAll("[data-n]");
  var bars = root.querySelectorAll(".digits i");
  var counter = root.querySelector(".counter");
  var text = root.querySelector("[data-text]");
  var next = root.querySelector("[data-next]");
  var step = -1;

  function format(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function show() {
    for (var g = 0; g < 3; g++) {
      var n = step < 0 ? 1 : COUNTS[step][g];
      nums[g].textContent = step === 3 && g === 2 ? LAST_GO : format(n);
      bars[g].style.width = (String(n).length / MAX_DIGITS) * 100 + "%";
    }
    if (step < 0) {
      counter.textContent = "Начална позиция";
      text.textContent = "Натисни „Още един ход“ и виж колко различни продължения има след всеки ход.";
      next.textContent = "Още един ход";
      return;
    }
    counter.textContent = "След " + (step + 1) + (step === 0 ? " ход" : " хода");
    text.textContent = TEXTS[step];
    next.textContent = step === COUNTS.length - 1 ? "Отначало" : "Още един ход";
  }

  next.addEventListener("click", function () {
    step = step === COUNTS.length - 1 ? -1 : step + 1;
    show();
  });
  show();
})();
