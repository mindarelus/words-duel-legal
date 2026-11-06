/* Screen 22: the two loops of AlphaZero, one step at a time. */
(function () {
  "use strict";

  var STEPS = [
    "<b>Мрежата предлага.</b> За позицията на дъската мрежата дава Policy (кои ходове изглеждат обещаващи) и Value (колко добре изглежда позицията).",
    "<b>Търсенето проверява.</b> MCTS проверява продълженията, като използва подсказките на мрежата. Така може да поправи първото ѝ впечатление.",
    "<b>Избира ход.</b> AlphaZero изиграва хода, през който са минали най-много проби. После всичко се повтаря за следващия ход.",
    "<b>Партии срещу себе си.</b> Така AlphaZero изиграва срещу себе си много партии — милиони за цялото обучение.",
    "<b>Учебни картички.</b> Всяка позиция от изиграните партии става учебна картичка: позицията, какво е предпочело търсенето и как е завършила партията. В картичката от нашата дъска търсенето праща 82 от 100 проби в средата вдясно, а партията завършва наравно.",
    "<b>Обучение на мрежата.</b> Policy се учи да предлага ходовете така, както ги е разпределило търсенето — значи следващия път няма да се подлъже толкова по красивия ход. Value се учи да познава крайния резултат.",
    "<b>По-добра мрежа.</b> Следващите партии се играят с по-добрата мрежа, а по-добрата интуиция прави търсенето по-силно. Големият кръг започва отначало."
  ];
  // One picture per step (media/fig, drawn by uchebnik_opus/site_assets.py); step 5 is the learning card.
  var PICTURES = [
    ["az_step1.svg", "Policy върху нашата дъска: 45% горе вдясно, 30% в средата вдясно; Value около нула"],
    ["az_step2.svg", "Търсенето: 82 проби към средата вдясно, 14 към горе вдясно, 4 към останалите три хода"],
    ["az_step3.svg", "X играе в средата вдясно — ходът с най-много проби, 82 от 100"],
    ["az_step4.svg", "Една и съща мрежа играе и с X, и с O — милиони партии"],
    ["az_card.svg", "Учебна картичка: позицията, разпределението на търсенето с 82% в средата вдясно и резултат равенство, 0"],
    ["az_step6.svg", "Policy се приближава към избора на търсенето: средата вдясно от 30% към 82%, горе вдясно от 45% към 14%"],
    ["az_step7.svg", "След обучението мрежата е по-добра и с нея се играят следващите партии"]
  ];

  var root = document.getElementById("loops");
  var items = root.querySelectorAll("[data-step]");
  var stage = root.querySelector(".stage");
  var picture = root.querySelector("[data-pic]");
  var image = picture.querySelector("img");
  var next = root.querySelector("[data-next]");
  var current = -1;

  function show() {
    for (var i = 0; i < items.length; i++) {
      var n = Number(items[i].getAttribute("data-step"));
      items[i].classList.toggle("now", n === current);
      items[i].classList.toggle("done", n < current);
    }
    stage.innerHTML = current < 0 ? "Натисни „Следваща стъпка“, за да тръгнеш по малкия кръг." : STEPS[current];
    picture.hidden = current < 0;
    if (current >= 0) {
      image.src = "media/fig/" + PICTURES[current][0];
      image.alt = PICTURES[current][1];
    }
    next.textContent = current === STEPS.length - 1 ? "Отначало" : "Следваща стъпка";
  }

  next.addEventListener("click", function () {
    current = current === STEPS.length - 1 ? -1 : current + 1;
    show();
  });
  show();
})();
