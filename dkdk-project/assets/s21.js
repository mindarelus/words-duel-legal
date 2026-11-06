/* Screen 21: the network's first impression (Policy, Value) against the search that checks it. */
(function () {
  "use strict";

  var T = window.TTT;
  var GOOD_SOFT = "#d3eee2";
  var POLICY = { 2: 45, 5: 30, 1: 9, 6: 8, 7: 8 };    // illustrative percentages, as in the textbook
  var SEARCH = { 1: 2, 2: 14, 5: 82, 6: 1, 7: 1 };    // PUCT visits after 100 probes (build.py, seed 3)
  var TEXT = {
    policy: "Policy: мрежата се подлъгва по красивия ход горе вдясно (45%), а средата вдясно получава 30%. Това са предпочитания, не шансове за победа.",
    value: "Value: мрежата оценява позицията около 0 — равностойна. Наистина: при перфектна игра оттук е равенство.",
    search: "Търсенето, насочвано от Policy, проверява отговорите на O. От 100 проби 82 минават през средата вдясно, а красивият ход получава само 14. Проверката поправи първото впечатление."
  };

  var root = document.getElementById("intuition");
  var boardBox = root.querySelector(".board-box");
  var thermo = root.querySelector(".thermo");
  var text = root.querySelector("[data-text]");
  var buttons = root.querySelectorAll("[data-mode]");

  function show(mode) {
    var fills = {};
    var labels = {};
    var cell;
    if (mode === "policy") {
      for (cell in POLICY) {
        if (!Object.prototype.hasOwnProperty.call(POLICY, cell)) continue;
        fills[cell] = "rgba(118, 71, 176, " + Math.min(0.85, (POLICY[cell] / 100) * 1.7).toFixed(2) + ")";
        labels[cell] = POLICY[cell] + "%";
      }
    } else if (mode === "search") {
      for (cell in SEARCH) {
        if (!Object.prototype.hasOwnProperty.call(SEARCH, cell)) continue;
        labels[cell] = String(SEARCH[cell]);
      }
      fills[5] = GOOD_SOFT;
    }
    boardBox.innerHTML = T.boardSVG(T.PUZZLE, { fills: fills, labels: labels, labelSize: 30 });
    thermo.hidden = mode !== "value";
    text.textContent = mode ? TEXT[mode] : "Избери какво да покаже дъската.";
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed", String(buttons[i].getAttribute("data-mode") === mode));
    }
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function (event) {
      show(event.currentTarget.getAttribute("data-mode"));
    });
  }
  show("");
})();
