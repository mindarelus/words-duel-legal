/* Screen 25: a two-dimensional teaching map of words and the famous king − man + woman ≈ queen. */
(function () {
  "use strict";

  var C = "#c4622a";
  var GROUP = "#3f4a5a";
  var WORDS = {
    "котка": [90, 62], "куче": [140, 92], "тигър": [62, 118], "лъв": [118, 142],
    "влак": [420, 60], "автобус": [462, 98], "кола": [404, 120],
    "мъж": [150, 228], "жена": [150, 300], "крал": [330, 210], "кралица": [342, 291]
  };
  var GROUPS = [["животни", 96, 184, "start"], ["превозни средства", 546, 162, "end"], ["хора и титли", 546, 250, "end"]];

  var root = document.getElementById("word-map");
  var box = root.querySelector(".map-box");
  var button = root.querySelector("[data-calc]");
  var text = root.querySelector("[data-text]");

  function arrow(a, b, dashed) {
    return '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + C +
      '" stroke-width="3" marker-end="url(#wm-head)"' + (dashed ? ' stroke-dasharray="7 6"' : "") + "/>";
  }

  function draw() {
    var man = WORDS["мъж"];
    var woman = WORDS["жена"];
    var king = WORDS["крал"];
    var result = [king[0] + woman[0] - man[0], king[1] + woman[1] - man[1]];
    var s = ['<svg class="wordmap" viewBox="0 0 560 340" role="img" aria-label="Карта на думите: животни, превозни средства, хора и титли">',
      '<defs><marker id="wm-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
      '<path d="M0 0L10 5L0 10z" fill="' + C + '"/></marker></defs>',
      '<rect x="2" y="2" width="556" height="336" rx="12" fill="#fff" stroke="#c8d0dc" stroke-width="1.5"/>'];
    for (var g = 0; g < GROUPS.length; g++) {
      s.push('<text x="' + GROUPS[g][1] + '" y="' + GROUPS[g][2] + '" text-anchor="' + GROUPS[g][3] +
        '" font-size="16" font-style="italic" font-weight="600" fill="' + GROUP + '">' + GROUPS[g][0] + "</text>");
    }
    for (var word in WORDS) {
      if (!Object.prototype.hasOwnProperty.call(WORDS, word)) continue;
      var p = WORDS[word];
      s.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + C + '"/>');
      s.push('<text x="' + (p[0] + 11) + '" y="' + (p[1] + 6) + '" font-size="17" font-weight="600" fill="#1e2633">' + word + "</text>");
    }
    s.push('<g class="calc-arrow">' + arrow([man[0], man[1] + 9], [woman[0], woman[1] - 10], false) +
      arrow([king[0], king[1] + 9], [result[0], result[1] - 10], true) +
      '<circle cx="' + result[0] + '" cy="' + result[1] + '" r="7" fill="#fff" stroke="' + C + '" stroke-width="2.5"/>' +
      '<circle cx="' + (result[0] + 6) + '" cy="' + (result[1] + 4) + '" r="22" fill="none" stroke="' + C +
      '" stroke-width="1.5" stroke-dasharray="3 4"/>' +
      '<text x="' + (result[0] - 14) + '" y="' + (result[1] + 40) + '" font-size="15" font-weight="700" fill="' + C +
      '" text-anchor="end">крал − мъж + жена</text></g>');
    s.push("</svg>");
    box.innerHTML = s.join("");
  }

  button.addEventListener("click", function () {
    var map = box.querySelector(".wordmap");
    var on = !map.classList.contains("show");
    map.classList.toggle("show", on);
    button.setAttribute("aria-pressed", String(on));
    text.textContent = on ? "Стрелката „от мъж към жена“, приложена към „крал“, стига почти до „кралица“. Почти — не точно." : "";
  });
  draw();
})();
