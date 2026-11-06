/* Screen 24, "Finish the sentence": a small hand-written tree of next pieces. Every piece has five named,
   illustrative numbers. The context vector mixes them by attention, and the percentages of the next pieces are
   computed from it: score = the option's numbers times the context's numbers, summed; percent = softmax of the
   scores. A teaching scheme, not a real model: a real vector has thousands of numbers without names. */
(function () {
  "use strict";

  // The start as tokens: a leading space starts a new word, so "робот" + "ът" is one word in two tokens.
  var START = ["Един", " ден", " робот", "ът", " откри"];
  var TREE = [
    { w: "тайна", next: ["в мазето", "за своя създател", "в старата библиотека"],
      end: ["и реши да я пази.", "и се усмихна.", "и я разказа на всички."] },
    { w: "врата", next: ["в стената", "към покрива", "без дръжка"],
      end: ["и я отвори.", "и се спря.", "и почука."] },
    { w: "котка", next: ["в кутията", "на покрива", "под леглото"],
      end: ["и ѝ даде мляко.", "и я снима.", "и тя избяга."] },
    { w: "грешка", next: ["в кода си", "в картата", "в сметките"],
      end: ["и я поправи.", "и поиска помощ.", "и се засмя."] }
  ];
  var NAMES = ["загадка", "място", "живо", "техника", "действие"];
  // Illustrative numbers of every piece, one per name above, tuned by hand so that every path reads sensibly.
  var NUMBERS = {
    "Един": [0.1, 0, 0, 0, 0],
    "ден": [0.1, 0.1, 0, 0, 0],
    "робот": [0.1, 0, 0.2, 0.9, 0.3],
    "ът": [0, 0, 0, 0, 0],
    "откри": [0.7, 0.1, 0, 0.1, 0.6],
    "тайна": [0.9, 0, 0, 0.1, 0],
    "врата": [0.5, 0.7, 0, 0.1, 0.2],
    "котка": [0.3, 0, 0.9, 0, 0.4],
    "грешка": [0.2, 0, 0, 0.9, 0.1],
    "в мазето": [0.6, 0.8, 0, 0, 0],
    "за своя създател": [0.4, 0, 0.8, 0.3, 0],
    "в старата библиотека": [0.7, 0.7, 0, 0, 0],
    "в стената": [0.4, 0.8, 0, 0.1, 0],
    "към покрива": [0.3, 0.8, 0, 0, 0.2],
    "без дръжка": [0.7, 0.2, 0, 0.3, 0],
    "в кутията": [0.3, 0.7, 0.4, 0, 0],
    "на покрива": [0.1, 0.8, 0.5, 0, 0.2],
    "под леглото": [0.2, 0.7, 0.5, 0, 0],
    "в кода си": [0.2, 0, 0, 0.8, 0],
    "в картата": [0.5, 0.5, 0, 0.5, 0],
    "в сметките": [0.2, 0, 0, 0.7, 0.1],
    "и реши да я пази.": [0.5, 0, 0.2, 0, 0.4],
    "и се усмихна.": [0.3, 0, 0.6, 0, 0.3],
    "и я разказа на всички.": [0.4, 0, 0.5, 0, 0.6],
    "и я отвори.": [0.3, 0.2, 0, 0, 0.9],
    "и се спря.": [0.4, 0, 0.2, 0, 0.4],
    "и почука.": [0.2, 0.1, 0.2, 0, 0.8],
    "и ѝ даде мляко.": [0, 0, 0.8, 0, 0.6],
    "и я снима.": [0.1, 0, 0.4, 0.5, 0.6],
    "и тя избяга.": [0.1, 0.1, 0.7, 0, 0.8],
    "и я поправи.": [0, 0, 0, 0.7, 0.5],
    "и поиска помощ.": [0.1, 0, 0.5, 0.6, 0.4],
    "и се засмя.": [0.2, 0, 0.6, 0.4, 0.3]
  };
  // Illustrative attention over the text so far, in percent, by the number of picked pieces.
  var ATTENTION = [
    [4, 4, 30, 2, 60],
    [2, 2, 14, 2, 22, 58],
    [2, 2, 26, 2, 6, 44, 18],
    [2, 2, 16, 2, 6, 22, 10, 40]
  ];
  var SHARPNESS = 0.15;  // softmax temperature: the smaller it is, the more the best score wins
  var MOVED = 0.05;      // a number that changed at least this much since the last pick gets an arrow

  var root = document.getElementById("next-token");
  var sentence = root.querySelector(".sentence");
  var choices = root.querySelector(".choices");
  var vector = root.querySelector("[data-vec]");
  var why = root.querySelector("[data-why]");
  var modelButton = root.querySelector("[data-model]");
  var again = root.querySelector("[data-again]");
  var esc = window.Site.escapeHTML;
  var picked = [];

  function branch() {
    for (var i = 0; i < TREE.length; i++) if (TREE[i].w === picked[0]) return TREE[i];
    throw new Error("Unknown first piece " + picked[0]);
  }

  function options() {
    if (picked.length === 0) {
      var first = [];
      for (var i = 0; i < TREE.length; i++) first.push(TREE[i].w);
      return first;
    }
    if (picked.length === 1) return branch().next;
    if (picked.length === 2) return branch().end;
    return [];
  }

  // The text after `count` picks: the start tokens, then one entry per picked piece.
  function pieces(count) {
    var list = START.slice();
    for (var i = 0; i < count; i++) list.push(" " + picked[i]);
    return list;
  }

  function attention(count) {
    var weights = ATTENTION[count];
    if (weights.length !== START.length + count) throw new Error("Attention row " + count + " does not match the text");
    return weights;
  }

  function numbers(piece) {
    var v = NUMBERS[piece.trim()];
    if (!v) throw new Error("No numbers for the piece " + piece);
    return v;
  }

  // The context vector after `count` picks: the numbers of the pieces mixed by attention.
  function contextVector(count) {
    var list = pieces(count);
    var weights = attention(count);
    var v = [];
    for (var k = 0; k < NAMES.length; k++) v.push(0);
    for (var i = 0; i < list.length; i++) {
      var p = numbers(list[i]);
      for (var j = 0; j < NAMES.length; j++) v[j] += weights[i] / 100 * p[j];
    }
    return v;
  }

  // How well a piece fits the context: its numbers times the context's numbers, summed.
  function score(context, piece) {
    var v = numbers(piece);
    var s = 0;
    for (var k = 0; k < NAMES.length; k++) s += context[k] * v[k];
    return s;
  }

  // Percentages from the scores (softmax), rounded so that they add up to 100.
  function percents(context, list) {
    var weights = [];
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      weights.push(Math.exp(score(context, list[i]) / SHARPNESS));
      total += weights[i];
    }
    var out = [];
    var rests = [];
    var sum = 0;
    for (var j = 0; j < list.length; j++) {
      var raw = (weights[j] / total) * 100;
      out.push(Math.floor(raw));
      rests.push(raw - out[j]);
      sum += out[j];
    }
    var order = ranked(rests);
    for (var r = 0; r < 100 - sum; r++) out[order[r]]++;
    return out;
  }

  function number(x) {
    var r = Math.round(x * 100);
    return (r < 0 ? "−" : "") + (Math.abs(r) / 100).toFixed(2).replace(".", ",");
  }

  function quoted(text) {
    return "„" + text + "“";
  }

  // Indices in order of value, highest first.
  function ranked(values) {
    var order = [];
    for (var i = 0; i < values.length; i++) order.push(i);
    order.sort(function (a, b) { return values[b] - values[a]; });
    return order;
  }

  // The number that grew most since the last pick (or, if none grew, the one that fell most).
  function moved(now, before) {
    var change = [];
    for (var k = 0; k < NAMES.length; k++) change.push(now[k] - before[k]);
    var top = ranked(change)[0];
    if (change[top] > 0) return top;
    var fall = [];
    for (var j = 0; j < NAMES.length; j++) fall.push(-change[j]);
    return ranked(fall)[0];
  }

  // The name that adds most to a piece's score: high both in the context and in the piece.
  function strongest(context, piece) {
    var v = numbers(piece);
    var parts = [];
    for (var k = 0; k < NAMES.length; k++) parts.push(context[k] * v[k]);
    return ranked(parts)[0];
  }

  function sentenceHTML() {
    var list = pieces(picked.length);
    var weights = attention(picked.length);
    var html = "";
    for (var i = 0; i < list.length; i++) {
      var newest = picked.length > 0 && i === list.length - 1;
      html += (list[i].charAt(0) === " " ? " " : "") + '<span class="pc' + (newest ? " new" : "") +
        '" title="внимание: ' + weights[i] + '%" style="background-color: rgba(196, 98, 42, ' + weights[i] / 100 + ')">' +
        esc(list[i].trim()) + "</span>";
    }
    return html;
  }

  function vectorHTML(now, before, hot) {
    var head = '<div class="vec-row vec-head">';
    var row = '<div class="vec-row">';
    for (var k = 0; k < NAMES.length; k++) {
      var arrow = "";
      if (before && Math.abs(now[k] - before[k]) >= MOVED) arrow = now[k] > before[k] ? " ↑" : " ↓";
      head += '<span class="vec-name">' + NAMES[k] + "</span>";
      row += '<span class="vec-n' + (k === hot ? " hot" : "") + '">' + number(now[k]) + arrow + "</span>";
    }
    return head + '<span class="vec-more"></span></div>' + row + '<span class="vec-more">…</span></div>';
  }

  // Why the numbers changed and why the best option fits, in words.
  function whyText(now, before, hot, list, pct) {
    var count = picked.length;
    var soFar = pieces(count);
    var order = ranked(attention(count));
    var looks = quoted(soFar[order[0]].trim()) + " и " + quoted(soFar[order[1]].trim());
    var text;
    if (!before) {
      var high = ranked(now);
      text = "Вниманието (по-тъмните парчета) гледа най-вече към " + looks + ", затова в контекста са високи числата " +
        quoted(NAMES[high[0]]) + " и " + quoted(NAMES[high[1]]) + ".";
    } else {
      text = "След " + quoted(picked[count - 1]) + " числото " + quoted(NAMES[hot]) +
        (now[hot] >= before[hot] ? " порасна" : " намаля") + " от " + number(before[hot]) + " на " + number(now[hot]) + ".";
    }
    if (!list.length) {
      return text + " Готово! Истинският модел прави същото с хиляди числа и всички думи от речника, " +
        "но вижда наведнъж ограничен брой токени — своя „контекст“.";
    }
    if (before) text += " Вниманието гледа най-вече към " + looks + ".";
    var best = ranked(pct)[0];
    return text + " Най-добре пасва " + quoted(list[best]) + ": числото " + quoted(NAMES[strongest(now, list[best])]) +
      " е високо и в контекста, и във варианта.";
  }

  function render() {
    var list = options();
    var now = contextVector(picked.length);
    var before = picked.length ? contextVector(picked.length - 1) : null;
    var hot = before ? moved(now, before) : -1;
    var pct = list.length ? percents(now, list) : [];
    sentence.innerHTML = sentenceHTML() + (list.length ? " …" : "");
    vector.innerHTML = vectorHTML(now, before, hot);
    why.textContent = whyText(now, before, hot, list, pct);
    if (!list.length) {
      choices.innerHTML = "";
      modelButton.disabled = true;
      return;
    }
    var top = pct[ranked(pct)[0]];
    var buttons = [];
    for (var k = 0; k < list.length; k++) {
      buttons.push('<button type="button" class="choice" data-pick="' + k + '"><span>' + esc(list[k]) + "</span>" +
        '<span class="bar" style="width:' + Math.round((pct[k] / top) * 100) + '%"></span><span class="pct">' +
        pct[k] + "%</span></button>");
    }
    choices.innerHTML = buttons.join("");
    modelButton.disabled = false;
  }

  function pick(index) {
    picked.push(options()[index]);
    render();
  }

  // The model samples in proportion to the computed percentages.
  function sample() {
    var list = options();
    var pct = percents(contextVector(picked.length), list);
    var r = Math.random() * 100;
    for (var i = 0; i < list.length; i++) {
      r -= pct[i];
      if (r < 0) return pick(i);
    }
    pick(list.length - 1);
  }

  choices.addEventListener("click", function (event) {
    var button = event.target.closest("[data-pick]");
    if (!button) return;
    pick(Number(button.getAttribute("data-pick")));
    // render() replaced the clicked button: continue on the first new choice, or on "again" when the sentence is done.
    (choices.querySelector("[data-pick]") || again).focus();
  });
  modelButton.addEventListener("click", function () {
    sample();
    if (modelButton.disabled) again.focus();  // the sentence is done and this button was just disabled
  });
  again.addEventListener("click", function () {
    picked = [];
    render();
  });
  render();
})();
