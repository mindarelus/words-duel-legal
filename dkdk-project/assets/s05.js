/* Screen 5, "Your move": the pupil picks a move on our board; minimax answers with O's strongest reply. */
(function () {
  "use strict";

  var T = window.TTT;
  var X_SOFT = "#dbe6f7";
  var O_SOFT = "#f6dcda";
  var MESSAGES = {
    2: "Две заплахи наведнъж — красиво! Но O завършва средния ред и печели, преди да използваш заплахите си.",
    5: "Спаси партията. При перфектна игра оттук нататък е равенство."
  };
  var OTHER = "O завършва средния ред и печели веднага.";

  var root = document.getElementById("task");
  var boardBox = root.querySelector(".board-box");
  var feedback = root.querySelector(".feedback");
  var again = root.querySelector("[data-again]");
  var tree = document.getElementById("tree");

  function start() {
    boardBox.innerHTML = T.boardSVG(T.PUZZLE, { clickable: true, label: "Нашата дъска: X е на ход" });
    feedback.textContent = "";
    feedback.className = "feedback";
    again.hidden = true;
  }

  function choose(move) {
    var afterX = T.play(T.PUZZLE, move);
    var reply = T.bestReply(afterX);
    var fills = {};
    fills[move] = X_SOFT;
    fills[reply] = O_SOFT;
    boardBox.innerHTML = T.boardSVG(T.play(afterX, reply), {
      fills: fills,
      label: "Твоят ход и най-силният отговор на O"
    });
    var saved = T.minimax(afterX) === 0;
    feedback.textContent = "Ти: " + T.CELL_NAMES[move] + ". O отговаря: " + T.CELL_NAMES[reply] + ". " +
      (MESSAGES[move] || OTHER);
    feedback.className = "feedback " + (saved ? "good" : "bad");
    again.hidden = false;
    tree.hidden = false;
    again.focus();  // the clicked cell is gone: keep the keyboard focus on the next action
  }

  boardBox.addEventListener("click", function (event) {
    var cell = event.target.closest("[data-cell]");
    if (cell) choose(Number(cell.getAttribute("data-cell")));
  });
  boardBox.addEventListener("keydown", function (event) {
    var cell = event.target.closest("[data-cell]");
    if (cell && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      choose(Number(cell.getAttribute("data-cell")));
    }
  });
  again.addEventListener("click", function () {
    start();
    boardBox.querySelector("[data-cell]").focus();  // "again" is hidden now: continue on the new board
  });
  start();
})();
