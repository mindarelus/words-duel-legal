/* Screen 26: click "ключ" and see which earlier words it draws on (a teaching scheme, not a real model). */
(function () {
  "use strict";

  var SENTENCES = [
    { words: ["Вратата", "е", "заключена.", "Трябва", "ми"], key: "ключ.",
      weights: [0.55, 0.12, 0.4, 0.06, 0.04], meaning: "ключ за врата" },
    { words: ["Задачата", "изглежда", "трудна.", "Последното", "условие", "е"], key: "ключът.",
      weights: [0.55, 0.06, 0.3, 0.12, 0.25, 0.04], meaning: "най-важната част от решението" },
    { words: ["Болтът", "е", "затегнат.", "Подай", "ми", "гаечния"], key: "ключ.",
      weights: [0.45, 0.06, 0.4, 0.1, 0.04, 0.55], meaning: "инструмент" }
  ];

  var root = document.getElementById("attention");
  var holder = root.querySelector(".sentences");
  var text = root.querySelector("[data-text]");
  var esc = window.Site.escapeHTML;
  var active = -1;

  function render() {
    var html = [];
    for (var i = 0; i < SENTENCES.length; i++) {
      var s = SENTENCES[i];
      var parts = [];
      for (var j = 0; j < s.words.length; j++) {
        var shade = i === active ? "background-color: rgba(196, 98, 42, " + s.weights[j] + ")" : "";
        parts.push('<span class="w" style="' + shade + '">' + esc(s.words[j]) + "</span>");
      }
      parts.push('<button type="button" class="key" data-s="' + i + '" aria-pressed="' + (i === active) + '">' + esc(s.key) + "</button>");
      html.push('<p class="attn">' + parts.join(" ") + "</p>");
    }
    holder.innerHTML = html.join("");
    if (active < 0) {
      text.textContent = "Кликни „ключ“ в някое изречение.";
      return;
    }
    var s2 = SENTENCES[active];
    var order = s2.words.map(function (word, index) { return index; });
    order.sort(function (a, b) { return s2.weights[b] - s2.weights[a]; });
    text.textContent = "Тук „ключ“ взема най-много от „" + s2.words[order[0]].replace(/[.,]$/, "") + "“ и „" +
      s2.words[order[1]].replace(/[.,]$/, "") + "“, значи става дума за: " + s2.meaning + ".";
  }

  holder.addEventListener("click", function (event) {
    var button = event.target.closest("[data-s]");
    if (!button) return;
    var index = Number(button.getAttribute("data-s"));
    active = active === index ? -1 : index;
    render();
    holder.querySelector('[data-s="' + index + '"]').focus();  // render() replaced the clicked button
  });
  render();
})();
