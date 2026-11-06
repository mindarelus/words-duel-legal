/* Screen 7, "Teach the neuron": sliders for the weights and one-step learning with the perceptron rule.
   The data and the start are the textbook's; stepping from the start reproduces its 19 corrections. */
(function () {
  "use strict";

  var DATA = [[8, 2, 1], [9, 4, 1], [3, 1, 1], [6, 4, 0], [2, 3, 0], [7, 5, 0]];  // value, danger, take?
  var START = [1, 0, -5];
  var LIMIT = 20;  // slider range
  var GREEN = "#1f8a64";
  var RED = "#c2453b";
  var TAKE_SOFT = "#d3eee2";
  var MUTED = "#55606f";
  var X0 = 0, X1 = 10, Y0 = 0, Y1 = 6;
  var L = 56, R = 540, TOP = 14, B = 276;

  var root = document.getElementById("neuron-lab");
  var plot = root.querySelector(".plot");
  var inputs = root.querySelectorAll("input[data-w]");
  var status = root.querySelector("[data-status]");
  var calc = root.querySelector("[data-calc]");
  var log = root.querySelector("[data-log]");
  var w = START.slice();
  var cursor = 0;
  var selected = 2;

  function minus(n) {
    return String(n).replace("-", "−");
  }
  function signed(n) {
    return n < 0 ? "(" + minus(n) + ")" : String(n);
  }
  function z(x1, x2) {
    return w[0] * x1 + w[1] * x2 + w[2];
  }
  function predict(x1, x2) {
    return z(x1, x2) >= 0 ? 1 : 0;
  }
  function px(x, y) {
    return [L + ((x - X0) / (X1 - X0)) * (R - L), B - ((y - Y0) / (Y1 - Y0)) * (B - TOP)];
  }
  function word(t) {
    return t ? "„вземи“" : "„не вземай“";
  }

  // Corners of the plot box and the points where the line z = 0 crosses its edges.
  function cut() {
    var corners = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];
    var take = [];
    var edge = [];
    for (var i = 0; i < 4; i++) {
      var p = corners[i];
      var q = corners[(i + 1) % 4];
      var fp = z(p[0], p[1]);
      var fq = z(q[0], q[1]);
      if (fp >= 0) take.push(p);
      if ((fp >= 0) !== (fq >= 0)) {
        var t = fp / (fp - fq);
        var hit = [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
        take.push(hit);
        edge.push(hit);
      }
    }
    return { take: take, edge: edge };
  }

  function render() {
    var s = [];
    var c = cut();
    if (c.take.length) {
      var pts = [];
      for (var i = 0; i < c.take.length; i++) {
        var p = px(c.take[i][0], c.take[i][1]);
        pts.push(p[0].toFixed(1) + "," + p[1].toFixed(1));
      }
      s.push('<polygon points="' + pts.join(" ") + '" fill="' + TAKE_SOFT + '" fill-opacity=".8"/>');
    }
    s.push('<rect x="' + L + '" y="' + TOP + '" width="' + (R - L) + '" height="' + (B - TOP) +
      '" fill="none" stroke="#c8d0dc" stroke-width="1.5"/>');
    for (var gx = X0; gx <= X1; gx += 2) {
      var ax = px(gx, 0)[0];
      s.push('<text x="' + ax + '" y="' + (B + 20) + '" font-size="14" text-anchor="middle" fill="' + MUTED + '">' + gx + "</text>");
    }
    for (var gy = Y0; gy <= Y1; gy += 2) {
      var ay = px(0, gy)[1];
      s.push('<text x="' + (L - 10) + '" y="' + (ay + 5) + '" font-size="14" text-anchor="end" fill="' + MUTED + '">' + gy + "</text>");
    }
    s.push('<text x="' + (L + R) / 2 + '" y="' + (B + 44) + '" font-size="15" text-anchor="middle" fill="#1e2633">стойност на съкровището</text>');
    s.push('<text transform="translate(16 ' + (TOP + B) / 2 + ') rotate(-90)" font-size="15" text-anchor="middle" fill="#1e2633">опасност</text>');
    if (c.edge.length === 2) {
      var a = px(c.edge[0][0], c.edge[0][1]);
      var b = px(c.edge[1][0], c.edge[1][1]);
      s.push('<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' +
        b[1].toFixed(1) + '" stroke="' + GREEN + '" stroke-width="3"/>');
    }
    var right = 0;
    for (var k = 0; k < DATA.length; k++) {
      var d = DATA[k];
      var q = px(d[0], d[1]);
      var ok = predict(d[0], d[1]) === d[2];
      if (ok) right++;
      s.push('<g data-ex="' + k + '" tabindex="0" role="button" aria-label="Пример ' + d[0] + ", " + d[1] + '">');
      if (k === selected) {
        s.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="19" fill="none" stroke="#1e2633" stroke-width="2" stroke-dasharray="5 4"/>');
      }
      if (d[2]) s.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="11" fill="' + GREEN + '" stroke="#fff" stroke-width="2"/>');
      else s.push('<rect x="' + (q[0] - 10) + '" y="' + (q[1] - 10) + '" width="20" height="20" rx="3" fill="' + RED + '" stroke="#fff" stroke-width="2"/>');
      if (!ok) s.push('<text x="' + (q[0] - 30) + '" y="' + (q[1] - 10) + '" font-size="20" font-weight="800" fill="' + RED + '">✗</text>');
      s.push('<text x="' + (q[0] + 16) + '" y="' + (q[1] + 24) + '" font-size="14" fill="' + MUTED + '">(' + d[0] + ", " + d[1] + ")</text>");
      s.push("</g>");
    }
    plot.innerHTML = s.join("");

    status.textContent = right === DATA.length ? "Всички примери са верни! Невронът се научи." :
      "Верни: " + right + " от " + DATA.length + ". Грешните са отбелязани с ✗.";
    status.className = "feedback " + (right === DATA.length ? "good" : "");

    var e = DATA[selected];
    var y = predict(e[0], e[1]);
    calc.textContent = "Пример (" + e[0] + ", " + e[1] + "): z = " + signed(w[0]) + "·" + e[0] + " + " + signed(w[1]) + "·" +
      e[1] + " + " + signed(w[2]) + " = " + minus(z(e[0], e[1])) + " → " + word(y) + ". Трябва " + word(e[2]) +
      (y === e[2] ? " ✓" : " ✗");
  }

  function sync() {
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = String(w[i]);
      inputs[i].nextElementSibling.textContent = minus(w[i]);
    }
  }

  // One perceptron correction: the next wrong example, scanning on from the last one, as in training epochs.
  function step() {
    for (var k = 0; k < DATA.length; k++) {
      var idx = (cursor + k) % DATA.length;
      var d = DATA[idx];
      var y = predict(d[0], d[1]);
      if (y === d[2]) continue;
      var err = d[2] - y;
      var next = [w[0] + err * d[0], w[1] + err * d[1], w[2] + err];
      if (Math.max(Math.abs(next[0]), Math.abs(next[1]), Math.abs(next[2])) > LIMIT) {
        log.textContent = "Следващата поправка излиза извън плъзгачите. Натисни „Отначало“.";
        return;
      }
      log.textContent = "Примерът (" + d[0] + ", " + d[1] + ") беше грешен, затова теглата се поправят: w₁ " + minus(w[0]) +
        " → " + minus(next[0]) + ", w₂ " + minus(w[1]) + " → " + minus(next[1]) + ", b " + minus(w[2]) + " → " + minus(next[2]) + ".";
      w = next;
      cursor = (idx + 1) % DATA.length;
      selected = idx;
      sync();
      render();
      return;
    }
    log.textContent = "Няма грешен пример, значи няма какво да се поправя.";
  }

  function pick(event) {
    var g = event.target.closest("[data-ex]");
    if (!g) return;
    selected = Number(g.getAttribute("data-ex"));
    render();
    plot.querySelector('[data-ex="' + selected + '"]').focus();  // render() replaced the focused point
  }

  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("input", function (event) {
      var index = Number(event.target.getAttribute("data-w"));
      w[index] = Number(event.target.value);
      event.target.nextElementSibling.textContent = minus(w[index]);
      render();
    });
  }
  plot.addEventListener("click", pick);
  plot.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(event);
    }
  });
  root.querySelector("[data-step]").addEventListener("click", step);
  root.querySelector("[data-reset]").addEventListener("click", function () {
    w = START.slice();
    cursor = 0;
    selected = 2;
    log.textContent = "Обратно в началото: невронът гледа само стойността.";
    sync();
    render();
  });
  sync();
  render();
})();
