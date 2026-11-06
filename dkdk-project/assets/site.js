/* Shared behaviour of every page: top bar with the screen arrows, the question component,
   the final quiz, YouTube cards, audio and saved notes. No modules and no fetch, so the site also
   works when it is opened straight from a folder. Answers stay in this browser only. */
(function () {
  "use strict";

  // A screen with parts: 2 has a second page, ekran-NN-2.html.
  var SCREENS = [
    { title: "Може ли машина да ни изненада?", ch: 1 },
    { title: "Правилата не са стратегия", ch: 1 },
    { title: "Deep Blue срещу Каспаров", ch: 1 },
    { title: "Колко са партиите?", ch: 1 },
    { title: "Как компютърът мисли напред", ch: 1 },
    { title: "Откъде машината знае, че греши?", ch: 2 },
    { title: "Персептронът: машина, която се поправя", ch: 2, parts: 2 },
    { title: "От персептрона до днешните мрежи", ch: 2 },
    { title: "AlexNet: учене от милиони примери", ch: 2 },
    { title: "Какво „вижда“ мрежата?", ch: 2 },
    { title: "Atari: учене от точки", ch: 2 },
    { title: "DQN отблизо", ch: 2 },
    { title: "Наградата е компас", ch: 2 },
    { title: "Машината гони наградата, не целта ти", ch: 2 },
    { title: "Защо Го е толкова трудно?", ch: 3 },
    { title: "AlphaGo срещу Лий Седол", ch: 3 },
    { title: "Ход №37: грешка или нова идея?", ch: 3 },
    { title: "Ход №78: отговорът на човека", ch: 3 },
    { title: "MCTS: много малки разузнавачи", ch: 3 },
    { title: "Случайни партии — и това работи?", ch: 3 },
    { title: "Интуиция и проверка: Policy и Value", ch: 3 },
    { title: "AlphaZero: само правилата и игра срещу себе си", ch: 3 },
    { title: "AlphaStar: скрита информация и лига от противници", ch: 3 },
    { title: "Как ChatGPT пише отговор", ch: 4 },
    { title: "Думите като числа", ch: 4 },
    { title: "Кой „ключ“? Внимание", ch: 4 },
    { title: "Отвъд игрите", ch: 4, parts: 2 },
    { title: "Финална викторина", ch: 4 }
  ];
  // Screen 0 is the intro. It sits before screen 1 and is not in SCREENS, so the numbering stays as it was.
  var INTRO = { title: "Как стигнахме дотук?" };
  var STORE_KEY = "kak-kompyutrite-v7";
  var QUIZ_ADVANCE_MS = 250;  // the chosen answer stays marked this long before the next quiz question appears
  var LETTERS = ["А", "Б", "В", "Г"];
  var LOGO =
    '<svg viewBox="0 0 40 40" aria-hidden="true">' +
    '<rect width="40" height="40" rx="9" fill="#14213d"/>' +
    '<path d="M16 8v24M24 8v24M8 16h24M8 24h24" stroke="#8ea6d6" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M9.6 9.6l4.8 4.8M14.4 9.6l-4.8 4.8" stroke="#9cc0ff" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="20" cy="20" r="2.6" fill="none" stroke="#ffb0a8" stroke-width="2"/>' +
    '<rect x="24.9" y="24.9" width="6.2" height="6.2" rx="1.6" fill="none" stroke="#f2a65a" stroke-width="2"/>' +
    "</svg>";

  var PAGES = [{ n: 0, part: 1 }];
  for (var s = 0; s < SCREENS.length; s++) {
    for (var part = 1; part <= (SCREENS[s].parts || 1); part++) PAGES.push({ n: s + 1, part: part });
  }

  var memory = { answers: {}, notes: {} };

  function load() {
    try {
      var data = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null");
      if (data && typeof data === "object") {
        memory.answers = data.answers && typeof data.answers === "object" ? data.answers : {};
        memory.notes = data.notes && typeof data.notes === "object" ? data.notes : {};
      }
    } catch (e) {
      // Storage is blocked or holds something unreadable: start with an empty memory.
    }
  }

  function save() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(memory));
    } catch (e) {
      // Storage is blocked (private mode, file:// rules): answers live only until the page closes.
    }
  }

  function file(n, partNo) {
    return "ekran-" + (n < 10 ? "0" : "") + n + (partNo > 1 ? "-" + partNo : "") + ".html";
  }

  function pageIndex(n, partNo) {
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].n === n && PAGES[i].part === partNo) return i;
    }
    return -1;
  }

  function pageTitle(page) {
    var screen = page.n === 0 ? INTRO : SCREENS[page.n - 1];
    return page.n + ". " + screen.title + (screen.parts ? " (" + page.part + "/" + screen.parts + ")" : "");
  }

  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
    return list;
  }

  /* ---------------------------------------------------------------- frame of the page */

  function arrow(page, sign, word) {
    if (!page) return '<a class="arrow off" aria-hidden="true">' + sign + "</a>";
    var label = escapeHTML(word + ": " + pageTitle(page));
    return '<a class="arrow" href="' + file(page.n, page.part) + '" title="' + label + '" aria-label="' + label +
      '" data-key="' + (sign === "←" ? "ArrowLeft" : "ArrowRight") + '">' + sign + "</a>";
  }

  function renderHeader(index) {
    var nav = '<a href="index.html">Карта</a>';
    if (index >= 0) {
      nav += arrow(PAGES[index - 1], "←", "Назад") + '<span class="count">' + PAGES[index].n + " / " +
        SCREENS.length + "</span>" + arrow(PAGES[index + 1], "→", "Напред");
    }
    var header = document.createElement("header");
    header.className = "topbar";
    header.innerHTML =
      '<div class="topbar-inner"><a class="brand" href="index.html">' + LOGO +
      "<span>Как компютрите се научиха да играят</span></a>" +
      '<nav class="topnav" aria-label="Навигация">' + nav + "</nav></div>";
    document.body.insertBefore(header, document.body.firstChild);
  }


  // Left and right arrow keys move between screens, unless the pupil is typing or moving a slider.
  function setupKeys() {
    document.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      var target = event.target;
      if (target.closest && target.closest("input, textarea, select, [contenteditable], [role=slider]")) return;
      var link = document.querySelector('.topnav a[data-key="' + event.key + '"]');
      if (link) window.location.href = link.getAttribute("href");
    });
  }

  function pagerLink(page, cls, label) {
    return '<a class="' + cls + '" href="' + file(page.n, page.part) + '"><small>' + label + "</small>" +
      escapeHTML(pageTitle(page)) + "</a>";
  }

  function renderPager(index, main) {
    var nav = document.createElement("nav");
    nav.className = "pager";
    nav.setAttribute("aria-label", "Предишен и следващ екран");
    nav.innerHTML =
      (index > 0 ? pagerLink(PAGES[index - 1], "prev", "← Назад") :
        '<a class="prev" href="index.html"><small>← Назад</small>Карта</a>') +
      (index < PAGES.length - 1 ? pagerLink(PAGES[index + 1], "next", "Напред →") :
        '<a class="next" href="index.html"><small>Край</small>Към картата →</a>');
    main.parentNode.insertBefore(nav, main.nextSibling);
  }

  function renderFooter() {
    var foot = document.createElement("footer");
    foot.className = "foot";
    foot.innerHTML =
      '<a href="za-uchitelya.html">За учителя</a> · <a href="iztochnici.html">Източници и лицензи</a><br>' +
      "Финален проект по „Дигитална компетентност и дигитална креативност“, ФМИ, СУ · Димитър Димитров";
    document.body.appendChild(foot);
  }

  /* ---------------------------------------------------------------- question: guess, choose, discover, understand */

  // A question with data-poll has no wrong answer: each option only shows its comment.
  function setupQuestion(q, key) {
    var list = q.querySelector(".q-opts");
    var items = Array.prototype.slice.call(list.children);
    var poll = q.hasAttribute("data-poll");
    var inQuiz = q.closest("[data-quiz]") !== null;
    var i;
    for (i = 0; i < items.length; i++) items[i].setAttribute("data-i", String(i));
    if (!q.hasAttribute("data-fixed")) {
      shuffle(items);
      for (i = 0; i < items.length; i++) list.appendChild(items[i]);
    }
    for (i = 0; i < items.length; i++) {
      var button = items[i].querySelector("button");
      var letter = document.createElement("span");
      letter.className = "k";
      letter.textContent = LETTERS[i];
      button.insertBefore(letter, button.firstChild);
    }
    var result = document.createElement("p");
    result.className = "q-result";
    result.setAttribute("aria-live", "polite");
    q.appendChild(result);

    function item(index) {
      return list.querySelector('[data-i="' + index + '"]');
    }
    function isOk(li) {
      return li.hasAttribute("data-ok");
    }
    function reveal(li) {
      li.classList.add("shown", poll ? "pick" : isOk(li) ? "ok" : "no");
    }
    function show(index) {
      var chosen = item(index);
      q.classList.add("answered");
      chosen.classList.add("chosen");
      reveal(chosen);
      if (poll) {
        result.textContent = "Тук няма един верен отговор. Кликни и другите, за да ги сравниш.";
        return;
      }
      for (var j = 0; j < items.length; j++) {
        if (isOk(items[j])) reveal(items[j]);
      }
      result.textContent = isOk(chosen) ? "Вярно!" : "Не съвсем. Прочети обяснението и верния отговор.";
      result.className = "q-result " + (isOk(chosen) ? "good" : "bad");
    }

    list.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button || !list.contains(button)) return;
      var li = button.parentNode;
      if (inQuiz) {
        // The final quiz says nothing on the way: the answer is final and the review comes at the end.
        if (q.classList.contains("answered")) return;
        memory.answers[key] = { i: Number(li.getAttribute("data-i")), ok: isOk(li) };
        save();
        q.classList.add("answered");
        li.classList.add("chosen");
        q.dispatchEvent(new CustomEvent("answered", { bubbles: true }));
        return;
      }
      if (q.classList.contains("answered")) {
        // Keep at most the correct explanation and the one just clicked (a poll has no correct one),
        // so comparing the options never makes the question taller than the first answer did.
        for (var j = 0; j < items.length; j++) {
          if (poll || !isOk(items[j])) items[j].classList.remove("shown");
        }
        reveal(li);
        return;
      }
      var index = Number(li.getAttribute("data-i"));
      memory.answers[key] = { i: index, ok: isOk(li) };
      save();
      show(index);
      q.dispatchEvent(new CustomEvent("answered", { bubbles: true }));
    });

    var stored = memory.answers[key];
    if (stored && item(stored.i)) {
      if (inQuiz) q.classList.add("answered");
      else show(stored.i);
    }
  }

  // The final quiz: one question at a time, nothing said on the way, the review after the last answer.
  function setupQuiz(quiz, n) {
    var questions = quiz.querySelectorAll(".q");
    var total = questions.length;
    var count = document.createElement("p");
    count.className = "quiz-count";
    count.setAttribute("aria-live", "polite");
    var done = document.createElement("div");
    done.className = "quiz-done";
    var review = document.createElement("ol");
    review.className = "review";
    quiz.insertBefore(review, quiz.firstChild);
    quiz.insertBefore(done, review);
    quiz.insertBefore(count, done);

    function answer(i) {
      return memory.answers["s" + n + "-" + i];
    }
    function firstUnanswered() {
      for (var i = 0; i < total; i++) {
        if (!answer(i)) return i;
      }
      return total;
    }
    var current = firstUnanswered();

    // The text of an option without its letter badge.
    function optionText(li) {
      var copy = li.querySelector("button").cloneNode(true);
      var letter = copy.querySelector(".k");
      if (letter) copy.removeChild(letter);
      return escapeHTML(copy.textContent.trim());
    }
    function why(li) {
      return escapeHTML(li.querySelector(".q-why").textContent.trim());
    }

    // The result and, for every question, right or wrong; the explanation only for the wrong ones.
    function summary() {
      var correct = 0;
      var rows = "";
      for (var i = 0; i < total; i++) {
        var q = questions[i];
        var a = answer(i);
        var title = (i + 1) + ". " + escapeHTML(q.querySelector(".q-text").textContent.trim());
        if (a.ok) {
          correct++;
          rows += '<li class="ok"><span class="verdict">✓ Верен</span><b>' + title + "</b></li>";
        } else {
          var chosen = q.querySelector('[data-i="' + a.i + '"]');
          var right = q.querySelector("[data-ok]");
          rows += '<li class="no"><span class="verdict">✗ Грешен</span><b>' + title + "</b>" +
            '<p><span class="lbl">Ти избра:</span> ' + optionText(chosen) + '<br><span class="why">' + why(chosen) + "</span></p>" +
            '<p><span class="lbl">Верният отговор:</span> ' + optionText(right) + '<br><span class="why">' + why(right) + "</span></p></li>";
        }
      }
      review.innerHTML = rows;
      done.innerHTML = '<p tabindex="-1"><b>Резултат: ' + correct + " от " + total + " (" +
        Math.round((correct / total) * 100) + "%)</b></p>" +
        '<button type="button" class="btn ghost" data-quiz-reset>Започни отначало</button>';
    }

    function show() {
      var finished = current >= total;
      for (var i = 0; i < total; i++) questions[i].hidden = i !== current;
      count.hidden = finished;
      done.hidden = !finished;
      review.hidden = !finished;
      if (finished) summary();
      else count.textContent = "Въпрос " + (current + 1) + " от " + total;
    }

    quiz.addEventListener("answered", function () {
      window.setTimeout(function () {
        current = firstUnanswered();
        show();
        // The clicked option is gone: the focus moves to the new question, or to the result.
        var target = current < total ? questions[current].querySelector(".q-text") : done.querySelector("p");
        target.setAttribute("tabindex", "-1");
        target.focus();
      }, QUIZ_ADVANCE_MS);
    });
    done.addEventListener("click", function (event) {
      if (!event.target.closest("[data-quiz-reset]")) return;
      for (var i = 0; i < total; i++) delete memory.answers["s" + n + "-" + i];
      save();
      window.location.reload();
    });
    show();
  }

  /* ---------------------------------------------------------------- media and notes */

  function setupVideo(box) {
    var id = box.getAttribute("data-yt");
    var title = escapeHTML(box.getAttribute("data-title") || "Видео");
    var start = box.getAttribute("data-start");
    var end = box.getAttribute("data-end");
    var watch = "https://www.youtube.com/watch?v=" + id + (start ? "&t=" + start + "s" : "");
    box.innerHTML =
      '<div class="yt-card"><button type="button" class="yt-play" aria-label="Пусни видеото">▶</button><div>' +
      '<p class="yt-title">' + title + "</p>" +
      '<p class="yt-note">Видео от YouTube. Зарежда се едва след клик.</p>' +
      '<a href="' + watch + '" target="_blank" rel="noopener">Отвори в YouTube</a></div></div>';
    box.querySelector(".yt-play").addEventListener("click", function () {
      var src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0" +
        (start ? "&start=" + start : "") + (end ? "&end=" + end : "");
      box.innerHTML =
        '<div class="yt-frame"><iframe src="' + src + '" title="' + title + '" allow="autoplay; encrypted-media; ' +
        'picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>' +
        '<p class="yt-link"><a href="' + watch + '" target="_blank" rel="noopener">Не тръгва? Отвори видеото в YouTube.</a></p>';
      box.querySelector("iframe").focus();  // the clicked button is gone: keep the keyboard focus on the player
    });
  }

  function setupAudio(box) {
    var audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.addEventListener("error", function () {
      box.hidden = true;  // the recording is not in the site yet
    });
    audio.src = box.getAttribute("data-audio");
    box.appendChild(audio);
  }

  function setupNote(area) {
    var key = area.getAttribute("data-note");
    if (memory.notes[key]) area.value = memory.notes[key];
    var status = document.createElement("p");
    status.className = "saved";
    status.setAttribute("aria-live", "polite");
    area.parentNode.insertBefore(status, area.nextSibling);
    area.addEventListener("input", function () {
      memory.notes[key] = area.value;
      save();
      status.textContent = "Запазено само в този браузър.";
    });
  }

  function setupHome() {
    var reset = document.querySelector("[data-reset]");
    if (!reset) return;
    reset.addEventListener("click", function () {
      if (!window.confirm("Да изтрия ли отговорите и бележките, запазени в този браузър?")) return;
      memory = { answers: {}, notes: {} };
      save();
      window.location.reload();
    });
  }

  function each(selector, fn) {
    var found = document.querySelectorAll(selector);
    for (var i = 0; i < found.length; i++) fn(found[i], i);
  }

  function init() {
    load();
    var body = document.body;
    var onScreen = body.hasAttribute("data-screen");  // data-screen="0" is the intro
    var n = Number(body.getAttribute("data-screen")) || 0;
    var partNo = Number(body.getAttribute("data-part")) || 1;
    var index = onScreen ? pageIndex(n, partNo) : -1;
    if (onScreen && index < 0) throw new Error("Unknown page: screen " + n + ", part " + partNo);
    if (onScreen) body.classList.add("is-screen");
    renderHeader(index);
    var main = document.querySelector("main");
    if (onScreen && main) renderPager(index, main);
    renderFooter();
    if (onScreen) setupKeys();
    each(".q", function (q, i) { setupQuestion(q, "s" + n + "-" + (partNo > 1 ? partNo + "-" : "") + i); });
    var quiz = document.querySelector("[data-quiz]");
    if (quiz) setupQuiz(quiz, n);
    each("[data-yt]", setupVideo);
    each("[data-audio]", setupAudio);
    each("textarea[data-note]", setupNote);
    if (body.classList.contains("home")) setupHome();
  }

  window.Site = {
    SCREENS: SCREENS,
    file: file,
    escapeHTML: escapeHTML,
    note: function (key) {
      return memory.notes[key] || "";
    }
  };
  init();
})();
