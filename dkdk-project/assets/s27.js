/* Screen 27: bring back the pupil's hypothesis from screen 1, and keep the comparison with the two language
   models closed until the pupil has written an answer: first one's own view, then the models'. */
(function () {
  "use strict";

  var first = window.Site.note("hypothesis").trim();
  var slot = document.querySelector("[data-first]");
  if (first) {
    slot.textContent = "На екран 1 написа: „" + first + "“";
  } else {
    slot.innerHTML = 'На <a href="ekran-01.html">екран 1</a> още не си записал какво според теб компютър никога няма да може да научи. Можеш да го направиш сега.';
  }

  // The lock is added only here, so without JavaScript the comparison stays an ordinary section.
  // site.js has already put back a saved answer, so a pupil who wrote earlier finds it unlocked.
  var compare = document.querySelector("[data-compare]");
  var answer = document.querySelector('textarea[data-note="hypothesis-again"]');
  var summary = compare.querySelector("summary");
  var lockNote = summary.querySelector(".lock-note");

  function locked() {
    return !compare.open && !answer.value.trim();
  }

  function update() {
    var on = locked();
    compare.classList.toggle("locked", on);
    lockNote.hidden = !on;
    summary.setAttribute("aria-disabled", on ? "true" : "false");
  }

  summary.addEventListener("click", function (event) {
    if (!locked()) return;
    event.preventDefault();
    answer.focus();
  });
  answer.addEventListener("input", update);
  compare.addEventListener("toggle", update);
  update();
})();
