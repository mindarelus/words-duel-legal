/* Screen 23: a guided round of rock, paper, scissors against an opponent who adapts to the last move. */
(function () {
  "use strict";

  var WINNER = { "камък": "хартия", "ножица": "камък", "хартия": "ножица" };  // what beats each move
  var BEATS = { "хартия": "Хартията бие камъка.", "камък": "Камъкът бие ножицата.", "ножица": "Ножицата бие хартията." };
  var ROUNDS = [
    { opponent: "камък", ask: "Противникът досега играе само камък. Какво избираш?" },
    { opponent: "ножица", ask: "Противникът забелязва, че играеш хартия, и минава на ножица. Сега?" },
    { opponent: "хартия", ask: "Той пак се приспособява и минава на хартия. А ти?" }
  ];

  var root = document.getElementById("rps");
  var ask = root.querySelector("[data-ask]");
  var text = root.querySelector("[data-text]");
  var choices = root.querySelector(".rps-choices");
  var reveal = root.querySelector("[data-reveal]");
  var round = 0;

  function show() {
    ask.textContent = "Рунд " + (round + 1) + " от " + ROUNDS.length + ". " + ROUNDS[round].ask;
    choices.hidden = false;
    reveal.hidden = true;
  }

  function choose(move) {
    var opponent = ROUNDS[round].opponent;
    if (move === WINNER[opponent]) {
      text.textContent = BEATS[move] + " Печелиш рунда.";
      text.className = "feedback good";
      round++;
      if (round < ROUNDS.length) {
        show();
        return;
      }
      ask.textContent = "Три рунда, три победи. Какво следва? Противникът пак ще мине на камък…";
      choices.hidden = true;
      reveal.hidden = false;
      return;
    }
    text.textContent = (move === opponent ? "Равенство: и двамата избрахте едно и също." : BEATS[opponent] + " Губиш рунда.") +
      " Опитай пак.";
    text.className = "feedback bad";
  }

  choices.addEventListener("click", function (event) {
    var button = event.target.closest("[data-move]");
    if (button) choose(button.getAttribute("data-move"));
  });
  root.querySelector("[data-again]").addEventListener("click", function () {
    round = 0;
    text.textContent = "";
    show();
  });
  show();
})();
