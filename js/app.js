(function () {
  var currentKey = "pc";
  var currentLesson = 0;
  var inErrors = false;
  var inVocab = false;
  var inGram = false;

  /* Every exercise gets a stable id (tense-oldLesson-oldIndex). Source lists hold 20 exercises; each is shown as two lessons of 10.
     New source lists are appended at the end and never reordered, so saved ids stay valid. */
  var ALL = {};
  (function () {
    for (var k in SETS) {
      var src = SETS[k].lessons, out = [];
      for (var l = 0; l < src.length; l++) {
        for (var h = 0; h < src[l].length / 10; h++) {
          var part = [];
          for (var i = h * 10; i < h * 10 + 10; i++) {
            var q = src[l][i];
            q.set = k; q.lesson = out.length; q.id = k + "-" + l + "-" + i;
            ALL[q.id] = q; part.push(q);
          }
          out.push(part);
        }
      }
      SETS[k].lessons = out;
    }
  })();

  /* One-time migration from lessons of 20 to lessons of 10. */
  try {
    if (!localStorage.getItem("fr-v2")) {
      var of0 = JSON.parse(localStorage.getItem("fr-fin") || "{}"), nf0 = {};
      for (var ok0 in of0) {
        if (!of0[ok0]) continue;
        var pp0 = ok0.split(":"), li0 = parseInt(pp0[1], 10);
        if (isNaN(li0)) continue;
        nf0[pp0[0] + ":" + (li0 * 2)] = true;
        nf0[pp0[0] + ":" + (li0 * 2 + 1)] = true;
      }
      localStorage.setItem("fr-fin", JSON.stringify(nf0));
      var st0 = (localStorage.getItem("fr-state") || "").split(":");
      if (SETS[st0[0]]) localStorage.setItem("fr-state", st0[0] + ":" + ((parseInt(st0[1], 10) || 0) * 2));
      localStorage.setItem("fr-v2", "1");
    }
  } catch (e) {}

  var bank = {};
  var finished = {};
  var hist = {};
  try {
    var b0 = JSON.parse(localStorage.getItem("fr-bank") || "{}");
    for (var id0 in b0) { if (ALL[id0]) bank[id0] = b0[id0]; }
    var f0 = JSON.parse(localStorage.getItem("fr-fin") || "{}");
    for (var fk in f0) { if (f0[fk]) finished[fk] = true; }
    var h0 = JSON.parse(localStorage.getItem("fr-hist") || "{}");
    for (var hid in h0) { if (ALL[hid] && h0[hid] > 0) hist[hid] = h0[hid]; }
    for (var bid in bank) { if (!hist[bid]) hist[bid] = 1; }
  } catch (e) {}

  /* Game state: points, per-exercise reward flags, best stars per lesson, streak, lesson progress. */
  var xp = 0, got = {}, stars = {}, streak = { last: "", n: 0 }, prog = {}, lastL = {};
  var LEVEL_AT = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
  var LEVEL_NAME = ["Новачок", "Учень", "Практик", "Знавець", "Майстер", "Експерт", "Віртуоз", "Поліглот", "Легенда", "Гуру"];
  var STAR_BONUS = [0, 10, 20, 30];
  try {
    var g0 = JSON.parse(localStorage.getItem("fr-game") || "{}");
    if (typeof g0.xp === "number" && g0.xp > 0) xp = g0.xp;
    if (g0.got) { for (var gid in g0.got) { if (ALL[gid]) got[gid] = 1; } }
    if (g0.stars) { for (var gs in g0.stars) { if (g0.stars[gs] > 0) stars[gs] = Math.min(3, g0.stars[gs]); } }
    if (g0.streak && typeof g0.streak.n === "number") streak = { last: String(g0.streak.last || ""), n: g0.streak.n };
    if (g0.prog) { prog = g0.prog; }
    if (g0.lastL) { lastL = g0.lastL; }
  } catch (e) {}
  function saveGame() {
    try { localStorage.setItem("fr-game", JSON.stringify({ xp: xp, got: got, stars: stars, streak: streak, prog: prog, lastL: lastL })); } catch (e) {}
  }
  function levelOf(x) {
    var i = 0;
    while (i + 1 < LEVEL_AT.length && x >= LEVEL_AT[i + 1]) i++;
    var from = LEVEL_AT[i], to = i + 1 < LEVEL_AT.length ? LEVEL_AT[i + 1] : from + 800 * (1 + Math.floor((x - from) / 800)) ;
    if (i + 1 >= LEVEL_AT.length) { var extra = Math.floor((x - LEVEL_AT[i]) / 800); i += extra; from = LEVEL_AT[LEVEL_AT.length - 1] + extra * 800; to = from + 800; }
    return { n: i + 1, name: LEVEL_NAME[Math.min(i, LEVEL_NAME.length - 1)], from: from, to: to };
  }
  function addXp(n) {
    if (!n) return;
    var before = levelOf(xp).n;
    xp += n;
    var after = levelOf(xp);
    if (after.n > before) toast("Новий рівень: " + after.n + " · " + after.name);
    refreshGame();
  }
  function dayStr(d) {
    function z(x) { return (x < 10 ? "0" : "") + x; }
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }
  function touchStreak() {
    var now = new Date(), t = dayStr(now);
    if (streak.last === t) return;
    var y = new Date(now.getTime()); y.setDate(y.getDate() - 1);
    streak.n = streak.last === dayStr(y) ? streak.n + 1 : 1;
    streak.last = t;
  }
  function streakNow() {
    var now = new Date(), y = new Date(now.getTime()); y.setDate(y.getDate() - 1);
    return (streak.last === dayStr(now) || streak.last === dayStr(y)) ? streak.n : 0;
  }
  function starsText(n) { return n === 3 ? "★★★" : n === 2 ? "★★☆" : n === 1 ? "★☆☆" : "☆☆☆"; }
  function refreshGame() {
    var lv = levelOf(xp);
    document.getElementById("gxp").textContent = String(xp);
    var gl = document.getElementById("glvl");
    gl.textContent = "Рівень " + lv.n + " · " + lv.name;
    gl.title = "До наступного рівня: " + (lv.to - xp) + " балів";
    var sn = streakNow();
    document.getElementById("gstreak").textContent = sn ? "Серія: " + sn + " " + (sn === 1 ? "день" : (sn < 5 ? "дні" : "днів")) : "";
    document.getElementById("gbarfill").style.width = Math.max(0, Math.min(100, (xp - lv.from) / (lv.to - lv.from) * 100)) + "%";
  }

  function saveState() {
    try {
      localStorage.setItem("fr-bank", JSON.stringify(bank));
      localStorage.setItem("fr-fin", JSON.stringify(finished));
      localStorage.setItem("fr-hist", JSON.stringify(hist));
    } catch (e) {}
  }
  function bankTotal() {
    var n = 0;
    for (var id in bank) { if (ALL[id]) n++; }
    return n;
  }
  function bankCountFor(key, l) {
    var n = 0;
    for (var id in bank) { var q = ALL[id]; if (q && q.set === key && q.lesson === l) n++; }
    return n;
  }
  function lessonStatus(key, l) {
    if (bankCountFor(key, l) > 0) return "todo";
    if (finished[key + ":" + l]) return "done";
    return "new";
  }
  function tenseStatus(key) {
    var n = SETS[key].lessons.length, allDone = true, anyTodo = false;
    for (var l = 0; l < n; l++) {
      var s = lessonStatus(key, l);
      if (s === "todo") anyTodo = true;
      if (s !== "done") allDone = false;
    }
    return anyTodo ? "todo" : (allDone ? "done" : "new");
  }

  /* Vocabulary: words in GLOSS become tappable; a double tap saves them to the dictionary. */
  var vocab = [];
  try {
    var v0 = JSON.parse(localStorage.getItem("fr-vocab") || "[]");
    if (Array.isArray(v0)) {
      for (var vi = 0; vi < v0.length; vi++) {
        if (v0[vi] && typeof v0[vi].w === "string" && typeof v0[vi].ua === "string") vocab.push(v0[vi]);
      }
    }
  } catch (e) {}
  function saveVocab() {
    try { localStorage.setItem("fr-vocab", JSON.stringify(vocab)); } catch (e) {}
  }
  function glossFor(key) {
    return Object.prototype.hasOwnProperty.call(GLOSS, key) ? GLOSS[key] : null;
  }
  function vocabHas(key) {
    for (var i = 0; i < vocab.length; i++) { if (vocab[i].w === key) return true; }
    return false;
  }
  try {
    if (!localStorage.getItem("fr-preset1")) {
      for (var pi = PRESET1.length - 1; pi >= 0; pi--) {
        var pw = PRESET1[pi];
        if (!vocabHas(pw[0])) vocab.unshift({ w: pw[0], ua: pw[1], ex: pw[2], exua: pw[3], t: Date.now(), box: 0, due: 0, reps: 0, lapses: 0 });
      }
      saveVocab();
      localStorage.setItem("fr-preset1", "1");
    }
  } catch (e) {}
  try {
    if (!localStorage.getItem("fr-preset2")) {
      for (var pj = PRESET2.length - 1; pj >= 0; pj--) {
        var pv = PRESET2[pj];
        if (!vocabHas(pv[0])) vocab.unshift({ w: pv[0], ua: pv[1], ex: pv[2], exua: pv[3], t: Date.now(), box: 0, due: 0, reps: 0, lapses: 0 });
      }
      saveVocab();
      localStorage.setItem("fr-preset2", "1");
    }
  } catch (e) {}
  var WORD_RE = /aujourd['’]hui|\p{L}+(?:-\p{L}+)*'?/giu;
  function wrapWords(text) {
    var out = "", last = 0, m;
    WORD_RE.lastIndex = 0;
    while ((m = WORD_RE.exec(text)) !== null) {
      out += esc(text.slice(last, m.index));
      var raw = m[0];
      var key = raw.toLowerCase().replace(/[’]/g, "'");
      if (glossFor(key)) {
        out += '<span class="w' + (vocabHas(key) ? " saved" : "") + '" data-w="' + esc(key) + '">' + esc(raw) + '</span>';
      } else {
        out += esc(raw);
      }
      last = m.index + raw.length;
    }
    return out + esc(text.slice(last));
  }
  var toastTimer = null;
  function toast(text) {
    var box = document.getElementById("toast");
    document.getElementById("toasttext").textContent = text;
    box.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.hidden = true; }, 2600);
  }
  function addWord(key) {
    var ua = glossFor(key);
    if (!ua) return;
    if (vocabHas(key)) { toast("Вже у словнику: " + key + " — " + ua); return; }
    var q = queue && queue[pos];
    vocab.unshift({ w: key, ua: ua, ex: q ? q.pre + q.a[0] + q.post : "", exua: q ? q.tr : "", t: Date.now(), box: 0, due: 0, reps: 0, lapses: 0 });
    saveVocab();
    var els = document.querySelectorAll(".w");
    for (var i = 0; i < els.length; i++) {
      if (els[i].getAttribute("data-w") === key) els[i].classList.add("saved");
    }
    refreshStatus();
    toast("Додано до словника: " + key + " — " + ua);
  }

  var stage = document.getElementById("stage");
  var barFill = document.getElementById("barfill");
  var bar = document.getElementById("bar");
  var countEl = document.getElementById("count");

  var queue, pos, score, wrong, answered, kind = "main", lessonPts = 0;

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function norm(s) {
    return String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim();
  }
  function strip(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function start(list, k, res) {
    queue = list;
    kind = k || "main";
    lessonPts = res ? (res.p || 0) : 0;
    pos = res ? res.n : 0; score = res ? res.s : 0; wrong = res ? res.w : []; answered = false;
    render();
  }
  /* Scroll only when the top of the exercise is above the screen; never jump to the page header. */
  function keepInView() {
    var r = stage.getBoundingClientRect();
    if (r.top < 0) window.scrollBy(0, r.top - 8);
  }
  function saveProg() {
    if (kind !== "main" || inErrors) return;
    var ids = [], wl = [];
    for (var i = 0; i < queue.length; i++) ids.push(queue[i].id);
    for (var j = 0; j < wrong.length; j++) wl.push({ id: wrong[j].q.id, g: wrong[j].given });
    prog[currentKey + ":" + currentLesson] = { o: ids, n: pos + 1, s: score, w: wl, p: lessonPts };
  }

  function setProgress() {
    var total = queue.length;
    var shown = Math.min(pos + 1, total);
    countEl.textContent = shown + " / " + total;
    var pct = (pos / total) * 100;
    barFill.style.width = pct + "%";
    bar.setAttribute("aria-valuemax", String(total));
    bar.setAttribute("aria-valuenow", String(pos));
  }

  function render() {
    if (pos >= queue.length) { return renderSummary(); }
    setProgress();
    answered = false;
    var q = queue[pos];
    var opts = shuffle(q.o);
    var html = "";
    html += '<section class="card" aria-labelledby="sentence">';
    html += '<div class="meta"><span class="chip">' + esc(SETS[q.set].label + (inErrors ? " · урок " + (q.lesson + 1) : "")) + '</span>' + (hist[q.id] ? '<span class="chip warn">помилок раніше: ' + hist[q.id] + '</span>' : '') + '<span class="verb">(' + wrapWords(q.verb) + ')</span></div>';
    html += '<p class="sentence" id="sentence">' + wrapWords(q.pre) + '<span class="blank" id="blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>' + wrapWords(q.post) + '</p>';
    html += '<p class="tr">' + esc(q.tr) + '</p>';
    html += '<div><p class="label">Оберіть варіант</p><div class="opts" id="opts">';
    for (var i = 0; i < opts.length; i++) {
      html += '<button type="button" class="opt" data-v="' + esc(opts[i]) + '">' + esc(opts[i]) + '</button>';
    }
    html += '</div></div>';
    html += '<div class="or">або впишіть самі</div>';
    html += '<form class="type" id="typeform" autocomplete="off">';
    html += '<input class="field" id="answer" type="text" placeholder="' + esc(SETS[q.set].placeholder || "Напишіть форму дієслова") + '" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Ваша відповідь">';
    html += '<button type="submit" class="btn" id="check">Перевірити</button>';
    html += '</form>';
    html += '<div id="fb" aria-live="polite"></div>';
    html += '<div class="nextrow" id="nextrow" hidden><button type="button" class="btn" id="next">' + (pos === queue.length - 1 ? "Показати результат" : "Далі") + '</button></div>';
    html += '</section>';
    stage.innerHTML = html;

    document.getElementById("opts").addEventListener("click", function (e) {
      var b = e.target.closest(".opt");
      if (!b || answered) return;
      submit(b.getAttribute("data-v"), "choice");
    });
    document.getElementById("typeform").addEventListener("submit", function (e) {
      e.preventDefault();
      if (answered) return;
      var v = document.getElementById("answer").value;
      if (!norm(v)) { document.getElementById("answer").focus(); return; }
      submit(v, "typed");
    });
    document.getElementById("next").addEventListener("click", function () { pos++; render(); keepInView(); });
  }

  function submit(value, mode) {
    var q = queue[pos];
    var ok = false, near = false;
    var nv = norm(value);
    for (var i = 0; i < q.a.length; i++) {
      var na = norm(q.a[i]);
      if (nv === na) ok = true;
      else if (strip(nv) === strip(na)) near = true;
    }
    answered = true;
    var pts = 0;
    if (ok) {
      score++;
      if (inErrors) { delete bank[q.id]; pts = 5; }
      else if (kind === "main" && !got[q.id]) { pts = 10; got[q.id] = 1; }
    } else {
      wrong.push({ q: q, given: value });
      bank[q.id] = (bank[q.id] || 0) + 1;
      hist[q.id] = (hist[q.id] || 0) + 1;
    }
    touchStreak();
    if (pts) { lessonPts += pts; addXp(pts); }
    saveProg();
    saveGame();
    saveState();
    refreshStatus();

    var blank = document.getElementById("blank");
    if (ok) blank.innerHTML = wrapWords(q.a[0]); else blank.textContent = value;
    blank.className = "blank " + (ok ? "good" : "bad");

    var optBtns = document.querySelectorAll(".opt");
    for (var k = 0; k < optBtns.length; k++) {
      var b = optBtns[k];
      b.disabled = true;
      var v = b.getAttribute("data-v");
      if (v === q.a[0]) b.className = "opt good";
      else if (mode === "choice" && v === value) b.className = "opt bad";
    }
    document.getElementById("answer").disabled = true;
    document.getElementById("check").disabled = true;

    var fb = document.getElementById("fb");
    var msg;
    if (ok) {
      msg = '<div class="feedback good"><strong>Правильно' + (pts ? ' <span class="pts">+' + pts + ' балів</span>' : '') + '</strong><span>' + esc(q.why) + '</span></div>';
    } else {
      var head = near ? "Майже, перевірте діакритику" : "Не зовсім";
      msg = '<div class="feedback bad"><strong>' + head + '</strong><span>Правильна відповідь: <b>' + wrapWords(q.a[0]) + '</b></span><span>' + esc(q.why) + '</span></div>';
    }
    fb.innerHTML = msg;
    var nr = document.getElementById("nextrow");
    nr.hidden = false;
    document.getElementById("next").focus();
    barFill.style.width = ((pos + 1) / queue.length * 100) + "%";
    bar.setAttribute("aria-valuenow", String(pos + 1));
  }

  function renderSummary() {
    var total = queue.length;
    barFill.style.width = "100%";
    bar.setAttribute("aria-valuenow", String(total));
    countEl.textContent = total + " / " + total;
    var award = 0, newStars = 0, prevStars = 0;
    if (!inErrors) {
      var lk = currentKey + ":" + currentLesson;
      finished[lk] = true;
      if (kind === "main") {
        newStars = score >= total ? 3 : (score >= total * 0.8 ? 2 : (score >= total * 0.6 ? 1 : 0));
        prevStars = stars[lk] || 0;
        if (newStars > prevStars) { award = STAR_BONUS[newStars] - STAR_BONUS[prevStars]; stars[lk] = newStars; }
        if (award) { lessonPts += award; addXp(award); }
        delete prog[lk];
        touchStreak();
        saveGame();
      }
      saveState();
      refreshStatus();
    }
    var html = '<section class="card summary">';
    html += '<p class="label" style="margin:0">Результат</p>';
    html += '<div class="score">' + score + '<small> / ' + total + '</small></div>';
    if (!inErrors && kind === "main") {
      html += '<div class="reward"><span class="bigstars" aria-label="Зірок: ' + newStars + ' з 3">' + starsText(newStars) + '</span>' +
        '<span>' + (lessonPts ? 'Бали за урок: <b>+' + lessonPts + '</b>' : 'Бали за ці приклади вже були нараховані раніше.') + (award ? ' Із них бонус за зірки: ' + award + '.' : '') + '</span>' +
        '<span style="color:var(--muted);font-size:0.88rem">Зірки: 10 з 10 дає ★★★, від 8 ★★☆, від 6 ★☆☆. Бонус нараховується лише за покращення результату.</span></div>';
    } else if (inErrors && lessonPts) {
      html += '<div class="reward"><span>Бали за раунд: <b>+' + lessonPts + '</b></span></div>';
    }
    if (wrong.length === 0) {
      if (inErrors) {
        html += '<p style="margin:0">Усі приклади цього раунду опрацьовано. ' + (bankTotal() > 0 ? 'У списку помилок ще ' + bankTotal() + '.' : 'Список помилок порожній.') + '</p>';
      } else {
        var hasNextLesson = currentLesson + 1 < SETS[currentKey].lessons.length;
        var green = lessonStatus(currentKey, currentLesson) === "done";
        html += '<p style="margin:0">Усі відповіді правильні. ' + (green ? 'Урок позначено зеленим. ' : 'Урок стане зеленим, коли ви пройдете його помилки в розділі «Робота над помилками». ') + (hasNextLesson ? 'Можна переходити до уроку ' + (currentLesson + 2) + '.' : esc(SETS[currentKey].next)) + '</p>';
      }
    } else {
      html += '<p style="margin:0">Помилки для повторення:</p><ul class="mistakes">';
      for (var i = 0; i < wrong.length; i++) {
        var w = wrong[i];
        html += '<li>' + esc(w.q.pre) + '<b>' + esc(w.q.a[0]) + '</b>' + esc(w.q.post) + '<br><span style="color:var(--muted)">Ваша відповідь: ' + esc(w.given) + '</span></li>';
      }
      html += '</ul>';
      if (!inErrors) html += '<p style="margin:0;color:var(--muted)">Помилки збережено в розділі «Робота над помилками». Тут їх можна повторити одразу для практики, а зі списку вони зникають лише після правильної відповіді в тому розділі. Тоді урок стане зеленим.</p>';
    }
    html += '<div class="actions">';
    if (wrong.length) html += '<button type="button" class="btn" id="retry">Повторити помилки</button>';
    if (inErrors) {
      if (bankTotal() > 0) html += '<button type="button" class="btn' + (wrong.length ? ' ghost' : '') + '" id="errnext">Новий раунд помилок</button>';
      html += '<button type="button" class="btn ghost" id="tolessons">До уроків</button>';
    } else {
      var nextIdx = currentLesson + 1;
      if (nextIdx < SETS[currentKey].lessons.length) {
        html += '<button type="button" class="btn' + (wrong.length ? ' ghost' : '') + '" id="nextlesson">Урок ' + (nextIdx + 1) + '</button>';
      }
      if (bankTotal() > 0) html += '<button type="button" class="btn ghost" id="toerrors">До роботи над помилками</button>';
      html += '<button type="button" class="btn ghost" id="restart">Почати цей урок спочатку</button>';
    }
    html += '</div></section>';
    stage.innerHTML = html;
    var r = document.getElementById("retry");
    if (r) r.addEventListener("click", function () {
      var again = [];
      for (var i = 0; i < wrong.length; i++) again.push(wrong[i].q);
      start(shuffle(again), inErrors ? "errors" : "retry");
    });
    var rs = document.getElementById("restart");
    if (rs) rs.addEventListener("click", function () { delete prog[currentKey + ":" + currentLesson]; saveGame(); start(shuffle(SETS[currentKey].lessons[currentLesson]), "main"); });
    var en = document.getElementById("errnext");
    if (en) en.addEventListener("click", function () { openErrors(); keepInView(); });
    var te = document.getElementById("toerrors");
    if (te) te.addEventListener("click", function () { openErrors(); keepInView(); });
    var tl = document.getElementById("tolessons");
    if (tl) tl.addEventListener("click", function () { openSet(currentKey, currentLesson); keepInView(); });
    var nl = document.getElementById("nextlesson");
    if (nl) nl.addEventListener("click", function () { openSet(currentKey, currentLesson + 1); keepInView(); });
  }

  /* Final test: mixed formats built from the exercises of one set; unlocked when every lesson is finished. */
  var tests = {};
  try { var t0 = JSON.parse(localStorage.getItem("fr-tests") || "{}"); if (t0 && typeof t0 === "object") tests = t0; } catch (e) {}
  function saveTests() { try { localStorage.setItem("fr-tests", JSON.stringify(tests)); } catch (e) {} }
  var tq = [], tpos = 0, tscore = 0, twrong = [], tkey = "", tans = false;
  var TYPE_LABEL = { choice: "Оберіть варіант", type: "Впишіть самі", judge: "Вірно чи є помилка?", tr: "Яке речення відповідає перекладу?" };
  function openTest() {
    var set = SETS[currentKey], pool = [];
    for (var l = 0; l < set.lessons.length; l++) pool = pool.concat(set.lessons[l]);
    pool = shuffle(pool).slice(0, 12);
    var types = shuffle(["choice", "choice", "choice", "type", "type", "type", "judge", "judge", "judge", "tr", "tr", "tr"]);
    tq = [];
    for (var i = 0; i < pool.length; i++) {
      var q = pool[i], it = { q: q, t: types[i % 12] };
      if (it.t === "judge") {
        var bad = [];
        for (var k = 0; k < q.o.length; k++) { if (q.a.indexOf(q.o[k]) < 0) bad.push(q.o[k]); }
        it.good = Math.random() < 0.5;
        it.shown = it.good ? q.a[0] : bad[Math.floor(Math.random() * bad.length)];
      }
      tq.push(it);
    }
    tpos = 0; tscore = 0; twrong = []; tkey = currentKey;
    renderTest();
    keepInView();
  }
  function fullSentence(q, w) { return q.pre + w + q.post; }
  function renderTest() {
    if (tpos >= tq.length) return testSummary();
    tans = false;
    var it = tq[tpos], q = it.q;
    countEl.textContent = (tpos + 1) + " / " + tq.length;
    barFill.style.width = (tpos / tq.length * 100) + "%";
    bar.setAttribute("aria-valuemax", String(tq.length)); bar.setAttribute("aria-valuenow", String(tpos));
    var h = '<section class="card"><div class="meta"><span class="tbadge">Тест · ' + esc(SETS[tkey].label) + '</span></div>';
    h += '<p class="label" style="margin:0">' + TYPE_LABEL[it.t] + '</p>';
    if (it.t === "choice" || it.t === "type") {
      h += '<p class="sentence" id="sentence">' + wrapWords(q.pre) + '<span class="blank" id="blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>' + wrapWords(q.post) + '</p><p class="tr">' + esc(q.tr) + '</p>';
    }
    if (it.t === "choice") {
      h += '<div class="opts" id="topts">';
      var os = shuffle(q.o);
      for (var i = 0; i < os.length; i++) h += '<button type="button" class="opt" data-v="' + esc(os[i]) + '">' + esc(os[i]) + '</button>';
      h += '</div>';
    } else if (it.t === "type") {
      h += '<form class="type" id="ttype" autocomplete="off"><input class="field" id="tanswer" type="text" placeholder="Напишіть відповідь" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Ваша відповідь"><button type="submit" class="btn" id="tcheck">Перевірити</button></form>';
    } else if (it.t === "judge") {
      h += '<p class="tq" id="sentence">' + wrapWords(q.pre) + '<b>' + esc(it.shown) + '</b>' + wrapWords(q.post) + '</p><p class="tr">' + esc(q.tr) + '</p>';
      h += '<div class="opts" id="topts"><button type="button" class="opt" data-v="1">Вірно</button><button type="button" class="opt" data-v="0">Є помилка</button></div>';
    } else {
      h += '<p class="tq" id="sentence">' + esc(q.tr) + '</p><div class="opts" id="topts">';
      var os2 = shuffle(q.o);
      for (var j = 0; j < os2.length; j++) h += '<button type="button" class="opt" data-v="' + esc(os2[j]) + '">' + wrapWords(fullSentence(q, os2[j])) + '</button>';
      h += '</div>';
    }
    h += '<div id="tfb" aria-live="polite"></div><div class="nextrow" id="tnextrow" hidden><button type="button" class="btn" id="tnext">' + (tpos === tq.length - 1 ? "Показати результат" : "Далі") + '</button></div></section>';
    stage.innerHTML = h;
    var to = document.getElementById("topts");
    if (to) to.addEventListener("click", function (e) {
      var b = e.target.closest(".opt");
      if (!b || tans) return;
      tsubmit(b.getAttribute("data-v"), b);
    });
    var tf = document.getElementById("ttype");
    if (tf) tf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (tans) return;
      var v = document.getElementById("tanswer").value;
      if (!norm(v)) return;
      tsubmit(v, null);
    });
    document.getElementById("tnext").addEventListener("click", function () { tpos++; renderTest(); keepInView(); });
  }
  function tsubmit(val, btn) {
    var it = tq[tpos], q = it.q, ok = false, near = false, shownAns;
    if (it.t === "judge") { ok = (val === "1") === it.good; shownAns = it.good ? "Вірно" : "Є помилка: " + fullSentence(q, q.a[0]); }
    else {
      for (var i = 0; i < q.a.length; i++) {
        if (norm(val) === norm(q.a[i])) ok = true; else if (strip(norm(val)) === strip(norm(q.a[i]))) near = true;
      }
      shownAns = it.t === "tr" ? fullSentence(q, q.a[0]) : q.a[0];
    }
    tans = true;
    if (ok) tscore++;
    else {
      twrong.push({ q: q, given: it.t === "judge" ? (val === "1" ? "Вірно" : "Є помилка") : val });
      bank[q.id] = (bank[q.id] || 0) + 1; hist[q.id] = (hist[q.id] || 0) + 1;
    }
    touchStreak(); saveGame(); saveState(); refreshStatus();
    var bs = document.querySelectorAll("#topts .opt");
    for (var k = 0; k < bs.length; k++) {
      var v = bs[k].getAttribute("data-v"); bs[k].disabled = true;
      var right = it.t === "judge" ? ((v === "1") === it.good) : (v === q.a[0]);
      if (right) bs[k].className = "opt good"; else if (btn === bs[k]) bs[k].className = "opt bad";
    }
    var ti = document.getElementById("tanswer"); if (ti) ti.disabled = true;
    var tc = document.getElementById("tcheck"); if (tc) tc.disabled = true;
    var bl = document.getElementById("blank");
    if (bl) { if (ok) bl.innerHTML = wrapWords(q.a[0]); else bl.textContent = val; bl.className = "blank " + (ok ? "good" : "bad"); }
    document.getElementById("tfb").innerHTML = ok
      ? '<div class="feedback good"><strong>Правильно</strong><span>' + esc(q.why) + '</span></div>'
      : '<div class="feedback bad"><strong>' + (near ? "Майже, перевірте діакритику" : "Не зовсім") + '</strong><span>Правильно: <b>' + wrapWords(shownAns) + '</b></span><span>' + esc(q.why) + '</span></div>';
    document.getElementById("tnextrow").hidden = false;
    document.getElementById("tnext").focus();
    barFill.style.width = ((tpos + 1) / tq.length * 100) + "%";
  }
  function testSummary() {
    var n = tq.length, tb = tests[tkey], award = 0;
    if (!tb) award = 20 + tscore * 5; else if (tscore > tb.best) award = (tscore - tb.best) * 5;
    tests[tkey] = { best: Math.max(tscore, tb ? tb.best : 0), of: n, runs: (tb ? tb.runs : 0) + 1 };
    saveTests();
    if (award) addXp(award);
    touchStreak(); saveGame(); refreshStatus();
    barFill.style.width = "100%";
    countEl.textContent = n + " / " + n;
    var pct = tscore / n, title = pct >= 0.9 ? "🏆 Майстер!" : (pct >= 0.7 ? "👏 Дуже добре" : (pct >= 0.5 ? "👍 Непогано" : "💪 Є що повторити"));
    var h = '<section class="card summary"><p class="label" style="margin:0">Підсумковий тест · ' + esc(SETS[tkey].label) + '</p><div class="score">' + tscore + '<small> / ' + n + '</small></div>';
    h += '<div class="reward"><span class="bigstars">' + title + '</span><span>' + (award ? 'Бали за тест: <b>+' + award + '</b>' : 'Бали нараховуються лише за покращення найкращого результату (' + tests[tkey].best + ' з ' + n + ').') + '</span></div>';
    if (twrong.length) {
      h += '<p style="margin:0">Помилки (збережено в «Роботі над помилками»):</p><ul class="mistakes">';
      for (var i = 0; i < twrong.length; i++) { var w = twrong[i]; h += '<li>' + esc(w.q.pre) + '<b>' + esc(w.q.a[0]) + '</b>' + esc(w.q.post) + '<br><span style="color:var(--muted)">Ваша відповідь: ' + esc(w.given) + '</span></li>'; }
      h += '</ul>';
    }
    h += '<div class="actions"><button type="button" class="btn" id="tagain">Ще раз (нові питання)</button>';
    if (bankTotal() > 0) h += '<button type="button" class="btn ghost" id="terr">До роботи над помилками</button>';
    h += '<button type="button" class="btn ghost" id="tback">До уроків</button></div></section>';
    stage.innerHTML = h;
    document.getElementById("tagain").addEventListener("click", function () { currentKey = tkey; openTest(); });
    var te = document.getElementById("terr"); if (te) te.addEventListener("click", function () { openErrors(); keepInView(); });
    document.getElementById("tback").addEventListener("click", function () { openSet(tkey, currentLesson); keepInView(); });
  }

  function renderLessonChips() {
    var set = SETS[currentKey];
    var lh = "";
    for (var n = 0; n < set.lessons.length; n++) {
      var st = lessonStatus(currentKey, n);
      var label = "Урок " + (n + 1);
      var pr = prog[currentKey + ":" + n];
      var note = st === "done" ? "пройдено, помилок немає" : (st === "todo" ? "є помилки для повторення" : "");
      if (pr) note += (note ? "; " : "") + "незавершено: " + Math.min(pr.n, 10) + " з 10";
      var sc = stars[currentKey + ":" + n] || 0;
      lh += '<button type="button" class="lesson' + (st !== "new" ? " " + st : "") + (pr ? " inprog" : "") + '" role="tab" data-lesson="' + n + '" aria-selected="' + (!inErrors && !inGram && n === currentLesson ? "true" : "false") + '"' + (note ? ' title="' + note + '" aria-label="' + label + ', ' + note + '"' : "") + '>' + label + (sc ? '<span class="stars" aria-hidden="true">' + starsText(sc) + '</span>' : '') + '</button>';
    }
    var fin = 0;
    for (var tl2 = 0; tl2 < set.lessons.length; tl2++) { if (finished[currentKey + ":" + tl2]) fin++; }
    var unlocked = fin >= set.lessons.length, tb = tests[currentKey];
    lh += '<button type="button" class="lesson testchip' + (unlocked ? " ok" : "") + '" id="testbtn"' + (unlocked ? "" : " disabled") + '>' +
      (unlocked ? "🏆 Підсумковий тест" + (tb ? " · найкращий " + tb.best + "/" + tb.of : "") : "🔒 Підсумковий тест · пройдено уроків " + fin + " з " + set.lessons.length) + '</button>';
    document.getElementById("lessons").innerHTML = lh;
  }

  function curGroup() {
    return inErrors ? "err" : inVocab ? "vocab" : inGram ? "gram" : SETS[currentKey].group;
  }
  function groupStatus(g) {
    var any = false, allDone = true, todo = false;
    for (var k in SETS) {
      if (SETS[k].group !== g) continue;
      any = true;
      var st = tenseStatus(k);
      if (st === "todo") todo = true;
      if (st !== "done") allDone = false;
    }
    return !any ? "new" : (todo ? "todo" : (allDone ? "done" : "new"));
  }
  var lastSet = { tenses: "pc", topics: "cod" };
  function syncTabs() {
    var g = curGroup();
    var tabs = document.querySelectorAll("#maintabs .tab");
    for (var i = 0; i < tabs.length; i++) {
      var gk = tabs[i].getAttribute("data-g");
      tabs[i].setAttribute("aria-selected", gk === g ? "true" : "false");
      if (gk === "tenses" || gk === "topics") {
        var st = groupStatus(gk);
        tabs[i].classList.toggle("done", st === "done");
        tabs[i].classList.toggle("todo", st === "todo");
      } else if (gk === "err" || gk === "vocab") {
        var c = gk === "err" ? bankTotal() : vocab.length;
        var badge = document.getElementById(gk === "err" ? "errcount" : "vocabcount");
        badge.textContent = String(c);
        badge.hidden = c === 0;
      }
    }
    var sub = document.getElementById("subtabs");
    if (g === "tenses" || g === "topics") {
      var h = "";
      for (var k in SETS) {
        if (SETS[k].group !== g) continue;
        var ks = tenseStatus(k);
        h += '<button type="button" class="subtab' + (ks !== "new" ? " " + ks : "") + '" role="tab" data-set="' + k + '" aria-selected="' + (k === currentKey ? "true" : "false") + '">' + esc(SETS[k].label) + '</button>';
      }
      sub.innerHTML = h;
      sub.hidden = false;
    } else {
      sub.hidden = true;
    }
  }
  var navOpen = false;
  function syncNav() {
    var g = curGroup(), lesson = g === "tenses" || g === "topics";
    var nb = document.getElementById("navbar"), np = document.getElementById("navpanel");
    nb.hidden = !lesson;
    np.hidden = !(lesson && navOpen);
    nb.setAttribute("aria-expanded", lesson && navOpen ? "true" : "false");
    if (lesson) {
      var st = lessonStatus(currentKey, currentLesson);
      document.getElementById("navlabel").textContent = SETS[currentKey].label + " · Урок " + (currentLesson + 1) + (st === "done" ? " ✓" : (st === "todo" ? " ↻" : ""));
    }
  }
  function refreshStatus() {
    syncTabs();
    syncNav();
    if (!inErrors && !inVocab && !inGram) renderLessonChips();
    refreshGame();
  }

  function setMode() {
    document.getElementById("lessons").hidden = inErrors || inVocab || inGram;
    document.getElementById("recapbox").hidden = inErrors || inVocab || inGram;
    syncNav();
    document.getElementById("errnote").hidden = !inErrors;
    document.getElementById("progress").hidden = inVocab || inGram;
  }

  function vocabListHtml(filter) {
    var f = norm(filter || "");
    var h = "", n = 0;
    for (var i = 0; i < vocab.length; i++) {
      var v = vocab[i];
      if (f && norm(v.w).indexOf(f) < 0 && strip(norm(v.w)).indexOf(strip(f)) < 0 && norm(v.ua).indexOf(f) < 0) continue;
      n++;
      h += '<li class="vitem"><div class="vtext"><div class="vline"><b class="vw">' + esc(v.w) + '</b><span class="vua">' + esc(v.ua) + '</span></div>';
      if (v.ex) h += '<p class="vex">' + esc(v.ex) + (v.exua ? '<br><span class="vexua">' + esc(v.exua) + '</span>' : '') + '</p>';
      h += '</div><button type="button" class="vdel" data-w="' + esc(v.w) + '" aria-label="Видалити слово ' + esc(v.w) + '">×</button></li>';
    }
    return n ? h : '<li class="vempty">Нічого не знайдено.</li>';
  }

  /* Flashcards: simple Leitner-style scheduling (Anki-like four ratings). */
  var BOX_DAYS = [0, 1, 3, 7, 14, 30];
  var DAY = 86400000, MIN = 60000;
  var vmode = "list";
  var fdir = "fu";
  try { vmode = localStorage.getItem("fr-vmode") === "cards" ? "cards" : "list"; fdir = localStorage.getItem("fr-fdir") === "uf" ? "uf" : "fu"; } catch (e) {}
  var fq = [], fshow = false, fahead = false, fdone = 0;

  function cardInfo(v) { return { box: v.box || 0, due: v.due || 0 }; }
  function fmtIv(ms) {
    if (ms < 60 * MIN) return Math.max(1, Math.round(ms / MIN)) + " хв";
    if (ms < DAY) return Math.round(ms / (60 * MIN)) + " год";
    return Math.round(ms / DAY) + " дн";
  }
  function nextState(v, r) {
    var c = cardInfo(v), box = c.box, iv;
    if (r === 1) { box = 0; iv = MIN; }
    else if (r === 2) { iv = Math.max(10 * MIN, BOX_DAYS[box] * DAY * 0.5); }
    else if (r === 3) { box = Math.min(5, box + 1); iv = BOX_DAYS[box] * DAY; }
    else { box = Math.min(5, box + 2); iv = BOX_DAYS[box] * DAY; }
    return { box: box, iv: iv };
  }
  function buildQueue(ahead) {
    var now = Date.now(), list = [];
    for (var i = 0; i < vocab.length; i++) {
      if (ahead || (vocab[i].due || 0) <= now) list.push(vocab[i]);
    }
    list.sort(function (a, b) { return (a.due || 0) - (b.due || 0); });
    return list.slice(0, 20).map(function (v) { return v.w; });
  }
  function findWord(k) {
    for (var i = 0; i < vocab.length; i++) { if (vocab[i].w === k) return vocab[i]; }
    return null;
  }
  function renderCards() {
    var now = Date.now(), due = 0, fresh = 0;
    for (var i = 0; i < vocab.length; i++) {
      if ((vocab[i].due || 0) <= now) due++;
      if (!vocab[i].reps) fresh++;
    }
    var h = '<div class="fstats"><span>До повторення: ' + due + '</span><span>Нових: ' + fresh + '</span><span>Усього: ' + vocab.length + '</span></div>';
    h += '<div class="seg" role="group" aria-label="Напрям">' +
      '<button type="button" class="segbtn" data-dir="fu" aria-pressed="' + (fdir === "fu") + '">Французька → українська</button>' +
      '<button type="button" class="segbtn" data-dir="uf" aria-pressed="' + (fdir === "uf") + '">Українська → французька</button></div>';
    var cur = fq.length ? findWord(fq[0]) : null;
    while (fq.length && !cur) { fq.shift(); cur = fq.length ? findWord(fq[0]) : null; }
    if (!cur) {
      h += '<div class="fcard" style="cursor:default"><div class="ftr">' + (fdone ? "Готово! Сеанс завершено." : (due ? "Натисніть, щоб почати." : "На зараз повторювати нічого.")) + '</div>' +
        '<div class="fhint">' + (fdone ? "Повторено карток: " + fdone : "Нові слова з'являються тут, коли ви двічі торкаєтесь їх у реченні.") + '</div></div>';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
      if (due) h += '<button type="button" class="btn" id="fstart">Почати повторення</button>';
      h += '<button type="button" class="btn ghost" id="fahead">Повторити все одно</button></div>';
      return h;
    }
    var front = fdir === "fu" ? '<div class="fword">' + esc(cur.w) + '</div>' : '<div class="ftr">' + esc(cur.ua) + '</div>';
    h += '<button type="button" class="fcard" id="fflip" aria-label="Перевернути картку">' + front;
    if (!fshow) h += '<div class="fhint">Торкніться, щоб побачити відповідь</div>';
    else {
      h += fdir === "fu" ? '<div class="ftr">' + esc(cur.ua) + '</div>' : '<div class="fword">' + esc(cur.w) + '</div>';
      if (cur.ex) h += '<p class="fex">' + esc(cur.ex) + (cur.exua ? '<br>' + esc(cur.exua) : '') + '</p>';
    }
    h += '</button>';
    if (fshow) {
      var labels = ["Знову", "Важко", "Добре", "Легко"];
      h += '<div class="frate">';
      for (var r = 1; r <= 4; r++) h += '<button type="button" class="r' + r + '" data-r="' + r + '">' + labels[r - 1] + '<small>' + fmtIv(nextState(cur, r).iv) + '</small></button>';
      h += '</div>';
    }
    h += '<div class="fhint">Залишилось у сеансі: ' + fq.length + '</div>';
    return h;
  }
  function rateCard(r) {
    var cur = fq.length ? findWord(fq[0]) : null;
    if (!cur) return;
    var st = nextState(cur, r);
    cur.box = st.box; cur.due = Date.now() + st.iv; cur.reps = (cur.reps || 0) + 1;
    if (r === 1) cur.lapses = (cur.lapses || 0) + 1;
    saveVocab();
    fq.shift();
    if (r === 1) fq.push(cur.w); else fdone++;
    fshow = false;
    renderVocabView();
  }

  function renderVocabView() {
    var html = '<section class="card vocab"><div class="vhead"><p class="label" style="margin:0">Словник</p><span class="count" id="vcount">Слів: ' + vocab.length + '</span></div>';
    if (!vocab.length) {
      html += "<p style=\"margin:0\">Словник порожній. Двічі торкніться слова в реченні, і воно з'явиться тут разом із перекладом.</p>";
      stage.innerHTML = html + '</section>';
      return;
    }
    html += '<div class="seg" role="group" aria-label="Режим словника">' +
      '<button type="button" class="segbtn" data-vm="list" aria-pressed="' + (vmode === "list") + '">Список</button>' +
      '<button type="button" class="segbtn" data-vm="cards" aria-pressed="' + (vmode === "cards") + '">Картки</button></div>';
    if (vmode === "cards") {
      html += renderCards();
    } else {
      if (vocab.length > 7) html += '<input class="field" id="vsearch" type="search" placeholder="Пошук слова або перекладу" aria-label="Пошук у словнику" autocomplete="off">';
      html += '<ul class="vlist" id="vlist">' + vocabListHtml("") + '</ul>';
    }
    html += '</section>';
    stage.innerHTML = html;
    var s = document.getElementById("vsearch");
    if (s) s.addEventListener("input", function () { document.getElementById("vlist").innerHTML = vocabListHtml(s.value); });
    var vl = document.getElementById("vlist");
    if (vl) vl.addEventListener("click", function (e) {
      var b = e.target.closest(".vdel");
      if (!b) return;
      var key = b.getAttribute("data-w");
      var keep = [];
      for (var i = 0; i < vocab.length; i++) { if (vocab[i].w !== key) keep.push(vocab[i]); }
      vocab = keep;
      saveVocab();
      refreshStatus();
      var cur = s ? s.value : "";
      if (!vocab.length) { renderVocabView(); return; }
      document.getElementById("vlist").innerHTML = vocabListHtml(cur);
      document.getElementById("vcount").textContent = "Слів: " + vocab.length;
    });
    var sec = stage.querySelector(".vocab");
    if (sec) sec.addEventListener("click", function (e) {
      var t = e.target.closest("button");
      if (!t) return;
      if (t.getAttribute("data-vm")) {
        vmode = t.getAttribute("data-vm");
        try { localStorage.setItem("fr-vmode", vmode); } catch (e2) {}
        if (vmode === "cards") { fq = buildQueue(false); fshow = false; fdone = 0; }
        renderVocabView();
      } else if (t.getAttribute("data-dir")) {
        fdir = t.getAttribute("data-dir");
        try { localStorage.setItem("fr-fdir", fdir); } catch (e2) {}
        fshow = false;
        renderVocabView();
      } else if (t.id === "fflip") { fshow = !fshow; renderVocabView(); }
      else if (t.getAttribute("data-r")) rateCard(parseInt(t.getAttribute("data-r"), 10));
      else if (t.id === "fstart") { fq = buildQueue(false); fshow = false; fdone = 0; renderVocabView(); }
      else if (t.id === "fahead") { fq = buildQueue(true); fshow = false; fdone = 0; renderVocabView(); }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (!inVocab || vmode !== "cards" || e.ctrlKey || e.metaKey || e.altKey) return;
    var tg = e.target && e.target.tagName;
    if (tg === "INPUT" || tg === "TEXTAREA") return;
    if (e.key === " " || e.key === "Enter") {
      if (tg === "BUTTON") return;
      if (fq.length) { e.preventDefault(); fshow = !fshow; renderVocabView(); }
    } else if (fshow && e.key >= "1" && e.key <= "4") { rateCard(parseInt(e.key, 10)); }
  });

  for (var gi = 0; gi < GRAM.length; gi++) {
    GRAM[gi].txt = strip((GRAM[gi].t + " " + GRAM[gi].h.replace(/<[^>]+>/g, " ")).toLowerCase());
  }
  var GRAM_ORDER = [];
  (function () {
    var i, g, k;
    for (i = 0; i < GRAM.length; i++) {
      g = GRAM[i];
      g.p = GP1.indexOf(g.t) >= 0 ? 1 : (GP3.indexOf(g.t) >= 0 ? 3 : 2);
      k = GORD.indexOf(g.t);
      g.o = k >= 0 ? k : 9000 + i;
      g.i = i;
    }
    GRAM_ORDER = GRAM.slice().sort(function (a, b) {
      return (a.p - b.p) || (a.o - b.o) || (a.i - b.i);
    });
  })();
  var PNAME = { 1: "Обов'язково знати", 2: "Важливо", 3: "Додатково" };
  var gview = "prio";
  try { if (localStorage.getItem("fr-gview") === "topic") gview = "topic"; } catch (e) {}
  var glevel = "A1";
  try { var gl0 = localStorage.getItem("fr-glevel"); if (gl0 === "A1" || gl0 === "A2" || gl0 === "B1" || gl0 === "B2") glevel = gl0; } catch (e) {}
  var gopen = {};
  var gq = "";

  function gramItemHtml(g, num, f) {
    return '<details class="gtopic" data-i="' + g.i + '"' + (gopen[g.i] || f ? " open" : "") + '><summary><span>' + (num ? '<span class="gnum">' + num + '.</span> ' : "") + esc(g.t) + (f ? '<span class="gtag">' + g.lv + '</span>' : '') + '</span><span class="gpri p' + g.p + '" title="' + PNAME[g.p] + '"></span></summary><div class="gbody">' + g.h + '</div></details>';
  }
  function gramListHtml(filter) {
    var f = strip(norm(filter || "")), h = "", n = 0, i, g, lv;
    if (f) {
      var exact = [];
      for (i = 0; i < GRAM.length; i++) { if (strip(norm(GRAM[i].t)) === f) exact.push(GRAM[i]); }
      if (exact.length) {
        for (i = 0; i < exact.length; i++) { n++; h += gramItemHtml(exact[i], 0, f); }
      } else {
        for (lv = 0; lv < 4; lv++) {
          for (i = 0; i < GRAM_ORDER.length; i++) {
            g = GRAM_ORDER[i];
            if (g.lv !== ["A1", "A2", "B1", "B2"][lv] || g.txt.indexOf(f) < 0) continue;
            n++; h += gramItemHtml(g, 0, f);
          }
        }
      }
    } else if (gview === "prio") {
      var lastP = 0, num = 0;
      for (i = 0; i < GRAM_ORDER.length; i++) {
        g = GRAM_ORDER[i];
        if (g.lv !== glevel) continue;
        if (g.p !== lastP) { h += '<h3>' + g.p + '. ' + PNAME[g.p] + '</h3>'; lastP = g.p; }
        n++; num++; h += gramItemHtml(g, num, "");
      }
    } else {
      var secs = [], si;
      for (i = 0; i < GRAM.length; i++) {
        if (GRAM[i].lv === glevel && secs.indexOf(GRAM[i].sec) < 0) secs.push(GRAM[i].sec);
      }
      for (si = 0; si < secs.length; si++) {
        h += '<h3>' + esc(secs[si]) + '</h3>';
        for (i = 0; i < GRAM.length; i++) {
          g = GRAM[i];
          if (g.lv !== glevel || g.sec !== secs[si]) continue;
          n++; h += gramItemHtml(g, 0, "");
        }
      }
    }
    return n ? h : '<p style="margin:0;color:var(--muted)">Нічого не знайдено.</p>';
  }
  function renderGram() {
    var counts = { A1: 0, A2: 0, B1: 0, B2: 0 };
    for (var i = 0; i < GRAM.length; i++) counts[GRAM[i].lv]++;
    var html = '<section class="card gram"><div class="vhead"><p class="label" style="margin:0">Граматика</p><span class="count">Тем: ' + GRAM.length + '</span></div>';
    html += '<p style="margin:0;color:var(--muted);font-size:0.9rem">Довідник за рівнями A1–B2. У режимі «За важливістю» теми йдуть від найпотрібніших до додаткових: червона крапка означає «обовʼязково», жовта «важливо», сіра «додатково». Рідкісні винятки й літературну мову варто перевіряти в повній граматиці.</p>';
    html += '<div class="seg" role="group" aria-label="Рівень">';
    var lvls = ["A1", "A2", "B1", "B2"];
    for (var k = 0; k < lvls.length; k++) html += '<button type="button" class="segbtn" data-gl="' + lvls[k] + '" aria-pressed="' + (glevel === lvls[k]) + '">' + lvls[k] + ' <small>(' + counts[lvls[k]] + ')</small></button>';
    html += '</div>';
    html += '<div class="seg" role="group" aria-label="Порядок"><button type="button" class="segbtn" data-gv="prio" aria-pressed="' + (gview === "prio") + '">За важливістю</button><button type="button" class="segbtn" data-gv="topic" aria-pressed="' + (gview === "topic") + '">За темами</button></div>';
    html += '<input class="field" id="gsearch" type="search" placeholder="Пошук по всій граматиці" aria-label="Пошук у граматиці" autocomplete="off">';
    html += '<div id="glist" style="display:flex;flex-direction:column;gap:8px">' + gramListHtml(gq) + '</div></section>';
    stage.innerHTML = html;
    var s = document.getElementById("gsearch");
    s.value = gq;
    s.addEventListener("input", function () { gq = s.value; document.getElementById("glist").innerHTML = gramListHtml(s.value); });
    stage.querySelector(".gram").addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button[data-gl], button[data-gv]") : null;
      if (!b) return;
      if (b.getAttribute("data-gv")) {
        gview = b.getAttribute("data-gv");
        try { localStorage.setItem("fr-gview", gview); } catch (e2) {}
      } else {
        glevel = b.getAttribute("data-gl");
        try { localStorage.setItem("fr-glevel", glevel); } catch (e2) {}
      }
      renderGram();
    });
    document.getElementById("glist").addEventListener("toggle", function (e) {
      var d = e.target;
      if (d && d.getAttribute && d.getAttribute("data-i")) gopen[d.getAttribute("data-i")] = d.open;
    }, true);
  }
  function openGram(topic) {
    if (typeof topic === "string") gq = topic;
    inGram = true; inVocab = false; inErrors = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "gram:0"); } catch (e) {}
    renderGram();
  }

  function openVocab() {
    inVocab = true;
    inGram = false;
    inErrors = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "vocab:0"); } catch (e) {}
    if (vmode === "cards") { fq = buildQueue(false); fshow = false; fdone = 0; }
    renderVocabView();
  }

  function openErrors() {
    inErrors = true;
    inVocab = false;
    inGram = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "err:0"); } catch (e) {}
    var ids = [];
    for (var id in bank) { if (ALL[id]) ids.push(id); }
    var note = document.getElementById("errnote");
    var progressEl = document.getElementById("progress");
    if (!ids.length) {
      note.textContent = "Тут збираються приклади з усіх часів, у яких була помилка. Приклад зникає зі списку після правильної відповіді в цьому розділі.";
      progressEl.hidden = true;
      queue = []; pos = 0; wrong = [];
      stage.innerHTML = '<section class="card summary"><p class="label" style="margin:0">Робота над помилками</p><p style="margin:0">Помилок поки немає. Приклади, у яких ви помилилися в будь-якому уроці, з\'являться тут автоматично.</p><div class="actions"><button type="button" class="btn ghost" id="tolessons">До уроків</button></div></section>';
      document.getElementById("tolessons").addEventListener("click", function () { openSet(currentKey, currentLesson); });
      return;
    }
    var round = shuffle(ids).slice(0, 20);
    note.textContent = "У списку помилок: " + ids.length + ". Приклад зникає зі списку лише після правильної відповіді в цьому розділі. За один раунд показується до 20 прикладів.";
    progressEl.hidden = false;
    var list = [];
    for (var j = 0; j < round.length; j++) list.push(ALL[round[j]]);
    start(list, "errors");
  }

  function pickLesson(key) {
    var n = SETS[key].lessons.length;
    if (typeof lastL[key] === "number" && lastL[key] >= 0 && lastL[key] < n) return lastL[key];
    for (var l = 0; l < n; l++) { if (lessonStatus(key, l) !== "done") return l; }
    return 0;
  }
  function openSet(key, lessonIdx, fresh) {
    var set = SETS[key];
    var idx = lessonIdx || 0;
    if (idx < 0 || idx >= set.lessons.length) idx = 0;
    currentKey = key;
    currentLesson = idx;
    inErrors = false;
    inVocab = false;
    inGram = false;
    lastL[key] = idx;
    lastSet[SETS[key].group] = key;
    var pk = key + ":" + idx, res = null, list = null;
    var pr = prog[pk];
    if (pr && !fresh && pr.o && pr.o.length === set.lessons[idx].length) {
      list = [];
      for (var oi = 0; oi < pr.o.length; oi++) {
        var qq = ALL[pr.o[oi]];
        if (!qq || qq.set !== key || qq.lesson !== idx) { list = null; break; }
        list.push(qq);
      }
      if (list && pr.n >= 0 && pr.n <= list.length) {
        var wr = [];
        for (var wi = 0; wi < (pr.w || []).length; wi++) { if (ALL[pr.w[wi].id]) wr.push({ q: ALL[pr.w[wi].id], given: pr.w[wi].g }); }
        res = { n: pr.n, s: pr.s || 0, w: wr, p: pr.p || 0 };
      } else list = null;
    }
    if (!res) { delete prog[pk]; list = shuffle(set.lessons[idx]); }
    saveGame();
    setMode();
    refreshStatus();
    document.getElementById("recap").innerHTML = set.recap + (set.gramRef ? '<p><button type="button" class="btn ghost" id="gref">Повне правило в розділі «Граматика»</button></p>' : "");
    try { localStorage.setItem("fr-state", key + ":" + idx); } catch (e) {}
    start(list, "main", res);
  }

  document.getElementById("maintabs").addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".tab") : null;
    if (!t) return;
    var g = t.getAttribute("data-g");
    if (g === "err") { openErrors(); return; }
    if (g === "vocab") { openVocab(); return; }
    if (g === "gram") { openGram(); return; }
    navOpen = true;
    if (curGroup() === g) { syncNav(); return; }
    var key = lastSet[g] || currentKey;
    openSet(key, key === currentKey ? currentLesson : pickLesson(key));
  });
  document.getElementById("subtabs").addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".subtab") : null;
    if (!t) return;
    var key = t.getAttribute("data-set");
    navOpen = true;
    if (key === currentKey && !inErrors && !inVocab && !inGram) { syncNav(); return; }
    openSet(key, key === currentKey ? currentLesson : pickLesson(key));
  });
  document.getElementById("recap").addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("#gref") : null;
    if (b && SETS[currentKey].gramRef) openGram(SETS[currentKey].gramRef);
  });
  document.getElementById("lessons").addEventListener("click", function (e) {
    var b = e.target.closest(".lesson");
    if (!b) return;
    if (b.id === "testbtn") { navOpen = false; openTest(); return; }
    var n = parseInt(b.getAttribute("data-lesson"), 10);
    navOpen = false;
    if (n !== currentLesson) openSet(currentKey, n); else syncNav();
  });
  document.getElementById("navbar").addEventListener("click", function () { navOpen = !navOpen; syncNav(); });

  /* Double tap (two taps on the same word within 450 ms) saves the word. */
  var lastTap = { w: null, t: 0 };
  stage.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest(".w") : null;
    if (!el) return;
    var w = el.getAttribute("data-w");
    var now = Date.now();
    if (lastTap.w === w && now - lastTap.t < 450) {
      lastTap.w = null;
      addWord(w);
    } else {
      lastTap.w = w;
      lastTap.t = now;
    }
  });

  var startKey = "pc", startLesson = 0, startMode = "lesson";
  try {
    var saved = (localStorage.getItem("fr-state") || "").split(":");
    if (saved[0] === "err") { startMode = "err"; }
    else if (saved[0] === "vocab") { startMode = "vocab"; }
    else if (saved[0] === "gram") { startMode = "gram"; }
    else if (SETS[saved[0]]) { startKey = saved[0]; startLesson = parseInt(saved[1], 10) || 0; }
  } catch (e) {}
  if (startMode === "err" && bankTotal() > 0) openErrors();
  else if (startMode === "vocab") openVocab();
  else if (startMode === "gram") openGram();
  else openSet(startKey, startLesson);
})();
