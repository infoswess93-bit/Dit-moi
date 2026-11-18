(function () {
  var currentKey = "pc";
  var currentLesson = 0;
  var inErrors = false;
  var inVocab = false;
  var inGram = false;
  var inHome = false;
  var inSettings = false;

  /* Settings (stored per device). */
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var GOALS = [10, 20, 30, 50];
  var dailyGoal = parseInt(lsGet("fr-goal", "20"), 10);
  if (GOALS.indexOf(dailyGoal) < 0) dailyGoal = 20;
  var theme = lsGet("fr-theme", "system");
  var autoSay = lsGet("fr-autosay", "0") === "1";
  var sfxOn = lsGet("fr-sfx", "0") === "1";
  var vibOn = lsGet("fr-vib", "1") === "1";
  var canVib = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
  function applyTheme() {
    if (theme === "light" || theme === "dark") document.documentElement.setAttribute("data-theme", theme);
    else if (lsGet("fr-theme-set", "0") === "1") document.documentElement.removeAttribute("data-theme");
  }
  applyTheme();
  var actx = null;
  function beep(ok) {
    if (!sfxOn) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === "suspended") actx.resume();
      var notes = ok ? [660, 880] : [220, 180], t = actx.currentTime;
      for (var i = 0; i < notes.length; i++) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = ok ? "sine" : "triangle";
        o.frequency.value = notes[i];
        g.gain.setValueAtTime(0.0001, t + i * 0.11);
        g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.11 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.16);
        o.connect(g); g.connect(actx.destination);
        o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.18);
      }
    } catch (e) {}
  }
  function answerFx(ok, sentence) {
    beep(ok);
    if (vibOn && canVib) { try { navigator.vibrate(ok ? 25 : [70, 50, 70]); } catch (e) {} }
    if (autoSay && sentence) setTimeout(function () { say(sentence); }, sfxOn ? 380 : 0);
  }

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
    if (todayCount() < dailyGoal) return;
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
  function daysWord(n) { var m = n % 10, h = n % 100; return (m === 1 && h !== 11) ? "день" : (m >= 2 && m <= 4 && (h < 12 || h > 14)) ? "дні" : "днів"; }

  /* Answers given today (for the Today screen). */
  var today = { d: "", n: 0 };
  try { var td0 = JSON.parse(localStorage.getItem("fr-day") || "{}"); if (td0 && typeof td0.n === "number") today = { d: String(td0.d || ""), n: td0.n }; } catch (e) {}
  function todayCount() { return today.d === dayStr(new Date()) ? today.n : 0; }
  function bumpDay() {
    var t = dayStr(new Date());
    if (today.d !== t) today = { d: t, n: 0 };
    today.n++;
    try { localStorage.setItem("fr-day", JSON.stringify(today)); } catch (e) {}
    if (today.n >= dailyGoal) {
      var before = streak.last;
      touchStreak();
      saveGame();
      if (before !== streak.last) { refreshGame(); toast("🎯 Денну мету виконано! Серія: " + streak.n + " " + daysWord(streak.n)); }
    }
  }

  /* French text-to-speech (built into Android, works offline). */
  var canSpeak = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  var frVoice = null;
  function pickVoice() {
    try {
      var vs = window.speechSynthesis.getVoices(), best = null;
      for (var i = 0; i < vs.length; i++) {
        var lg = String(vs[i].lang || "").toLowerCase().replace("_", "-");
        if (lg.indexOf("fr") !== 0) continue;
        if (!best || (lg === "fr-fr" && String(best.lang).toLowerCase().replace("_", "-") !== "fr-fr")) best = vs[i];
      }
      frVoice = best;
    } catch (e) {}
  }
  if (canSpeak) {
    pickVoice();
    try { window.speechSynthesis.addEventListener("voiceschanged", pickVoice); } catch (e) {}
  }
  function say(text) {
    if (!canSpeak || !text) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR";
      if (frVoice) u.voice = frVoice;
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function sayBtn(text, cls) {
    return canSpeak ? '<button type="button" class="say' + (cls ? " " + cls : "") + '" data-say="' + esc(text).replace(/"/g, "&quot;") + '" aria-label="Прослухати">🔊</button>' : "";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-say]") : null;
    if (b) say(b.getAttribute("data-say"));
  });

  /* Accent keys for typing on a phone. */
  var ACCENTS = ["é", "è", "ê", "à", "â", "ç", "ô", "û", "ù", "î", "ï", "ë", "œ", "’"];
  function keysHtml() {
    var h = '<div class="keys" role="group" aria-label="Французькі літери">';
    for (var i = 0; i < ACCENTS.length; i++) h += '<button type="button" class="key" data-k="' + ACCENTS[i] + '" tabindex="-1">' + ACCENTS[i] + '</button>';
    return h + '</div>';
  }
  function wireKeys(inputId) {
    var box = stage.querySelector(".keys"), inp = document.getElementById(inputId);
    if (!box || !inp) return;
    box.addEventListener("mousedown", function (e) { e.preventDefault(); });
    box.addEventListener("pointerdown", function (e) { if (e.target.closest(".key")) e.preventDefault(); });
    box.addEventListener("click", function (e) {
      var k = e.target.closest(".key");
      if (!k || inp.disabled) return;
      var ch = k.getAttribute("data-k") === "’" ? "'" : k.getAttribute("data-k");
      var a = inp.selectionStart == null ? inp.value.length : inp.selectionStart, b = inp.selectionEnd == null ? a : inp.selectionEnd;
      inp.value = inp.value.slice(0, a) + ch + inp.value.slice(b);
      inp.focus();
      try { inp.setSelectionRange(a + ch.length, a + ch.length); } catch (e2) {}
    });
  }

  /* Answer mode: pick from options or type (typing gives more points). */
  var amode = "choice";
  try { if (localStorage.getItem("fr-amode") === "typed") amode = "typed"; } catch (e) {}

  function starsText(n) { return n === 3 ? "★★★" : n === 2 ? "★★☆" : n === 1 ? "★☆☆" : "☆☆☆"; }
  function refreshGame() {
    var lv = levelOf(xp);
    document.getElementById("gxp").textContent = String(xp);
    var gl = document.getElementById("glvl");
    gl.textContent = "Рівень " + lv.n;
    gl.title = lv.name + ". До наступного рівня: " + (lv.to - xp) + " балів";
    var sn = streakNow(), gs = document.getElementById("gstreak");
    gs.textContent = sn ? "🔥 " + sn : "";
    gs.title = sn ? "Серія: " + sn + " " + daysWord(sn) + " поспіль" : "";
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
    var typed = amode === "typed";
    var html = "";
    html += '<section class="card" aria-labelledby="sentence">';
    html += '<div class="meta"><span class="chip">' + esc(SETS[q.set].label + (inErrors ? " · урок " + (q.lesson + 1) : "")) + '</span>' + (hist[q.id] ? '<span class="chip warn">помилок раніше: ' + hist[q.id] + '</span>' : '') + '<span class="verb">(' + wrapWords(q.verb) + ')</span></div>';
    html += '<p class="sentence" id="sentence">' + wrapWords(q.pre) + '<span class="blank" id="blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>' + wrapWords(q.post) + '</p>';
    html += '<p class="tr">' + esc(q.tr) + '</p>';
    html += '<div class="seg amode" role="group" aria-label="Спосіб відповіді"><button type="button" class="segbtn" data-am="choice" aria-pressed="' + !typed + '">Варіанти</button><button type="button" class="segbtn" data-am="typed" aria-pressed="' + typed + '">Вписати <small>+50%</small></button></div>';
    if (!typed) {
      html += '<div class="opts" id="opts">';
      for (var i = 0; i < opts.length; i++) {
        html += '<button type="button" class="opt" data-v="' + esc(opts[i]) + '">' + esc(opts[i]) + '</button>';
      }
      html += '</div>';
    } else {
      html += '<form class="type" id="typeform" autocomplete="off">';
      html += '<input class="field" id="answer" type="text" placeholder="' + esc(SETS[q.set].placeholder || "Напишіть форму дієслова") + '" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Ваша відповідь">';
      html += keysHtml();
      html += '<button type="submit" class="btn" id="check">Перевірити</button>';
      html += '</form>';
    }
    html += '<div id="fb" aria-live="polite"></div>';
    html += '<div class="nextrow" id="nextrow" hidden>' + sayBtn(q.pre + q.a[0] + q.post, "") + '<button type="button" class="btn" id="next">' + (pos === queue.length - 1 ? "Показати результат" : "Далі") + '</button></div>';
    html += '</section>';
    stage.innerHTML = html;

    stage.querySelector(".amode").addEventListener("click", function (e) {
      var b = e.target.closest("[data-am]");
      if (!b || b.getAttribute("data-am") === amode) return;
      amode = b.getAttribute("data-am");
      try { localStorage.setItem("fr-amode", amode); } catch (e2) {}
      if (!answered) render();
      else { var bs = stage.querySelectorAll(".amode .segbtn"); for (var j = 0; j < bs.length; j++) bs[j].setAttribute("aria-pressed", String(bs[j].getAttribute("data-am") === amode)); }
    });
    var ob = document.getElementById("opts");
    if (ob) ob.addEventListener("click", function (e) {
      var b = e.target.closest(".opt");
      if (!b || answered) return;
      submit(b.getAttribute("data-v"), "choice");
    });
    var tf = document.getElementById("typeform");
    if (tf) {
      tf.addEventListener("submit", function (e) {
        e.preventDefault();
        if (answered) { pos++; render(); keepInView(); return; }
        var v = document.getElementById("answer").value;
        if (!norm(v)) { document.getElementById("answer").focus(); return; }
        submit(v, "typed");
      });
      wireKeys("answer");
      try { document.getElementById("answer").focus({ preventScroll: true }); } catch (e3) {}
    }
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
      if (inErrors) { delete bank[q.id]; pts = mode === "typed" ? 8 : 5; }
      else if (kind === "main" && !got[q.id]) { pts = mode === "typed" ? 15 : 10; got[q.id] = 1; }
    } else {
      wrong.push({ q: q, given: value });
      bank[q.id] = (bank[q.id] || 0) + 1;
      hist[q.id] = (hist[q.id] || 0) + 1;
    }
    touchStreak();
    bumpDay();
    if (pts) { lessonPts += pts; addXp(pts); }
    saveProg();
    saveGame();
    saveState();
    refreshStatus();

    answerFx(ok, q.pre + q.a[0] + q.post);
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
    var ai = document.getElementById("answer"); if (ai) ai.readOnly = true;
    var ck = document.getElementById("check"); if (ck) ck.hidden = true;
    var kb = stage.querySelectorAll(".key"); for (var kk = 0; kk < kb.length; kk++) kb[kk].disabled = true;

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
    if (mode !== "typed") document.getElementById("next").focus({ preventScroll: true });
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
      h += '<form class="type" id="ttype" autocomplete="off"><input class="field" id="tanswer" type="text" placeholder="Напишіть відповідь" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Ваша відповідь">' + keysHtml() + '<button type="submit" class="btn" id="tcheck">Перевірити</button></form>';
    } else if (it.t === "judge") {
      h += '<p class="tq" id="sentence">' + wrapWords(q.pre) + '<b>' + esc(it.shown) + '</b>' + wrapWords(q.post) + '</p><p class="tr">' + esc(q.tr) + '</p>';
      h += '<div class="opts" id="topts"><button type="button" class="opt" data-v="1">Вірно</button><button type="button" class="opt" data-v="0">Є помилка</button></div>';
    } else {
      h += '<p class="tq" id="sentence">' + esc(q.tr) + '</p><div class="opts" id="topts">';
      var os2 = shuffle(q.o);
      for (var j = 0; j < os2.length; j++) h += '<button type="button" class="opt" data-v="' + esc(os2[j]) + '">' + wrapWords(fullSentence(q, os2[j])) + '</button>';
      h += '</div>';
    }
    h += '<div id="tfb" aria-live="polite"></div><div class="nextrow" id="tnextrow" hidden>' + sayBtn(fullSentence(q, q.a[0]), "") + '<button type="button" class="btn" id="tnext">' + (tpos === tq.length - 1 ? "Показати результат" : "Далі") + '</button></div></section>';
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
    if (tf) wireKeys("tanswer");
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
    answerFx(ok, fullSentence(q, q.a[0]));
    if (ok) tscore++;
    else {
      twrong.push({ q: q, given: it.t === "judge" ? (val === "1" ? "Вірно" : "Є помилка") : val });
      bank[q.id] = (bank[q.id] || 0) + 1; hist[q.id] = (hist[q.id] || 0) + 1;
    }
    touchStreak(); bumpDay(); saveGame(); saveState(); refreshStatus();
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
    document.getElementById("tnext").focus({ preventScroll: true });
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
    return inSettings ? "settings" : inHome ? "home" : inErrors ? "err" : inVocab ? "vocab" : inGram ? "gram" : SETS[currentKey].group;
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
    var tg = (g === "tenses" || g === "topics") ? "lessons" : g;
    var tabs = document.querySelectorAll("#maintabs .tab");
    for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute("aria-current", tabs[i].getAttribute("data-g") === tg ? "true" : "false");
    var ec = bankTotal(), eb = document.getElementById("errcount");
    eb.textContent = String(ec); eb.hidden = ec === 0;
    var vb = document.getElementById("vocabcount"), vd = dueCount();
    vb.textContent = String(vd); vb.hidden = vd === 0;
    var gb = document.querySelectorAll("#groupseg .segbtn");
    for (var gi2 = 0; gi2 < gb.length; gi2++) gb[gi2].setAttribute("aria-pressed", String(gb[gi2].getAttribute("data-grp") === g));
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
    if (!inErrors && !inVocab && !inGram && !inHome && !inSettings) renderLessonChips();
    refreshGame();
  }

  function setMode() {
    var other = inErrors || inVocab || inGram || inHome || inSettings;
    document.getElementById("setbtn").setAttribute("aria-pressed", String(inSettings));
    document.getElementById("lessons").hidden = other;
    document.getElementById("recapbox").hidden = other;
    syncNav();
    document.getElementById("errnote").hidden = !inErrors;
    document.getElementById("progress").hidden = inVocab || inGram || inHome || inSettings;
  }
  function dueCount() {
    var now = Date.now(), n = 0;
    for (var i = 0; i < vocab.length; i++) { if ((vocab[i].due || 0) <= now) n++; }
    return n;
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
      h += '</div><div class="vbtns">' + sayBtn(v.w, "vsay") + '<button type="button" class="vdel" data-w="' + esc(v.w) + '" aria-label="Видалити слово ' + esc(v.w) + '">×</button></div></li>';
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
    if (canSpeak) h += '<div style="display:flex;justify-content:center">' + sayBtn(cur.w + (fshow && cur.ex ? ". " + cur.ex : ""), "") + '</div>';
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
    bumpDay();
    if (vibOn && canVib) { try { navigator.vibrate(15); } catch (e) {} }
    fq.shift();
    if (r === 1) fq.push(cur.w); else fdone++;
    fshow = false;
    renderVocabView();
  }

  function renderVocabView() {
    if (photoOpen) { renderPhoto(); return; }
    var html = '<section class="card vocab"><div class="vhead"><p class="label" style="margin:0">Словник</p><span class="count" id="vcount">Слів: ' + vocab.length + '</span></div>';
    html += '<div class="vtop"><button type="button" class="btn ghost" id="tophoto">📷 Слова з фото</button></div>';
    if (!vocab.length) {
      html += "<p style=\"margin:0\">Словник порожній. Двічі торкніться слова в реченні або додайте слова з фото тексту.</p>";
      stage.innerHTML = html + '</section>';
      document.getElementById("tophoto").addEventListener("click", openPhoto);
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
    document.getElementById("tophoto").addEventListener("click", openPhoto);
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
      if (!t || t.hasAttribute("data-say") || t.id === "tophoto") return;
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
    inGram = true; inHome = false; inSettings = false; inVocab = false; inErrors = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "gram:0"); } catch (e) {}
    renderGram();
  }

  function openVocab() {
    photoOpen = false;
    inVocab = true; inHome = false; inSettings = false;
    inGram = false;
    inErrors = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "vocab:0"); } catch (e) {}
    if (vmode === "cards") { fq = buildQueue(false); fshow = false; fdone = 0; }
    renderVocabView();
  }

  function openErrors() {
    inErrors = true; inHome = false; inSettings = false;
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
    inHome = false;
    inSettings = false;
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
    try { localStorage.setItem("fr-state", key + ":" + idx); localStorage.setItem("fr-last", key + ":" + idx); } catch (e) {}
    start(list, "main", res);
  }

  document.getElementById("maintabs").addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest(".tab") : null;
    if (!t) return;
    var g = t.getAttribute("data-g");
    if (g === "home") { openHome(); window.scrollTo(0, 0); return; }
    if (g === "err") { openErrors(); window.scrollTo(0, 0); return; }
    if (g === "vocab") { openVocab(); window.scrollTo(0, 0); return; }
    if (g === "gram") { openGram(); window.scrollTo(0, 0); return; }
    var cg = curGroup();
    if (cg === "tenses" || cg === "topics") { navOpen = !navOpen; syncNav(); window.scrollTo(0, 0); return; }
    navOpen = false;
    var lt = lastTarget();
    openSet(lt.k, lt.l);
    window.scrollTo(0, 0);
  });
  document.getElementById("groupseg").addEventListener("click", function (e) {
    var b = e.target.closest("[data-grp]");
    if (!b) return;
    var g = b.getAttribute("data-grp");
    if (g === curGroup()) return;
    navOpen = true;
    var key = lastSet[g];
    if (!key) { var nt = nextIn(g); key = nt ? nt.k : null; }
    if (!key) for (var k in SETS) { if (SETS[k].group === g) { key = k; break; } }
    openSet(key, pickLesson(key));
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

  /* Today screen: continue where you stopped, plus a short plan for the day. */
  function lastTarget() {
    var k = "pc", l = 0;
    try {
      var raw = (localStorage.getItem("fr-last") || localStorage.getItem("fr-state") || "").split(":");
      if (SETS[raw[0]]) { k = raw[0]; l = parseInt(raw[1], 10) || 0; }
    } catch (e) {}
    if (l < 0 || l >= SETS[k].lessons.length) l = 0;
    return { k: k, l: l };
  }
  function firstOpen(k, from) {
    for (var l = from || 0; l < SETS[k].lessons.length; l++) { if (!finished[k + ":" + l]) return l; }
    return -1;
  }
  function nextIn(g, afterKey) {
    var keys = [], k, i, l;
    for (k in SETS) { if (SETS[k].group === g) keys.push(k); }
    if (!afterKey) {
      for (i = 0; i < keys.length; i++) {
        for (l = 0; l < SETS[keys[i]].lessons.length; l++) {
          var pr = prog[keys[i] + ":" + l];
          if (pr && pr.n > 0) return { k: keys[i], l: l, done: Math.min(pr.n, SETS[keys[i]].lessons[l].length) };
        }
      }
    }
    var startI = afterKey ? Math.max(0, keys.indexOf(afterKey)) : 0;
    for (i = 0; i < keys.length; i++) {
      k = keys[(startI + i) % keys.length];
      l = firstOpen(k, 0);
      if (l >= 0) return { k: k, l: l };
    }
    return null;
  }
  function contTarget() {
    var t = lastTarget(), pk = t.k + ":" + t.l, pr = prog[pk];
    if (pr && pr.n > 0) return { k: t.k, l: t.l, act: "Продовжити", done: Math.min(pr.n, SETS[t.k].lessons[t.l].length) };
    if (!finished[pk]) return { k: t.k, l: t.l, act: "Почати урок", done: 0 };
    var nl = firstOpen(t.k, t.l + 1);
    if (nl >= 0) return { k: t.k, l: nl, act: "Наступний урок", done: 0 };
    var nx = nextIn(SETS[t.k].group, t.k);
    if (nx) return { k: nx.k, l: nx.l, act: "Наступна тема", done: 0 };
    return { k: t.k, l: t.l, act: "Повторити урок", done: 0 };
  }
  function openHome() {
    inHome = true; inSettings = false; inErrors = false; inVocab = false; inGram = false;
    navOpen = false;
    setMode();
    refreshStatus();
    renderHome();
  }
  function renderHome() {
    var c = contTarget(), set = SETS[c.k], total = set.lessons[c.l].length;
    var h = '<section class="card hero"><p class="label">' + (c.done ? "Ви зупинилися тут" : "Далі за планом") + '</p>';
    h += '<p class="htitle">' + esc(set.label) + ' · Урок ' + (c.l + 1) + '</p>';
    h += '<p class="hsub">' + (set.group === "tenses" ? "Часи" : "Практика") + (c.done ? " · виконано " + c.done + " з " + total : " · " + total + " вправ") + '</p>';
    if (c.done) h += '<div class="hbar" aria-hidden="true"><i style="width:' + Math.round(c.done / total * 100) + '%"></i></div>';
    h += '<button type="button" class="btn big" id="hgo">' + c.act + '</button></section>';

    var rows = "", ec = bankTotal(), dc = dueCount();
    rows += '<li><button type="button" class="prow" data-act="err"><span class="pt"><b>Робота над помилками</b><small>' + (ec ? "Приклади, де ви помилилися" : "Помилок немає") + '</small></span><span class="pn ' + (ec ? "warn" : "ok") + '">' + (ec || "✓") + '</span></button></li>';
    rows += '<li><button type="button" class="prow" data-act="cards"><span class="pt"><b>Картки слів</b><small>' + (dc ? "До повторення зараз" : (vocab.length ? "На зараз усе повторено" : "Словник порожній")) + '</small></span><span class="pn' + (dc ? "" : " ok") + '">' + (dc || "✓") + '</span></button></li>';
    rows += '<li><button type="button" class="prow" data-act="photo"><span class="pt"><b>📷 Слова з фото</b><small>Сфотографуйте текст, підкреслені слова підуть у словник</small></span><span class="chev" aria-hidden="true">›</span></button></li>';
    var groups = [["tenses", "часи"], ["topics", "практика"]];
    for (var i = 0; i < groups.length; i++) {
      var nt = nextIn(groups[i][0]);
      if (!nt || (nt.k === c.k && nt.l === c.l)) continue;
      rows += '<li><button type="button" class="prow" data-act="lesson" data-k="' + nt.k + '" data-l="' + nt.l + '"><span class="pt"><b>' + (nt.done ? "Продовжити: " : "Новий урок: ") + groups[i][1] + '</b><small>' + esc(SETS[nt.k].label) + ' · урок ' + (nt.l + 1) + (nt.done ? " · " + nt.done + " з " + SETS[nt.k].lessons[nt.l].length : "") + '</small></span><span class="chev" aria-hidden="true">›</span></button></li>';
    }
    h += '<section class="card"><p class="label" style="margin:0">На сьогодні</p><ul class="plan">' + rows + '</ul></section>';

    var lv = levelOf(xp), sn = streakNow();
    h += '<div class="hstats">' +
      '<div class="hstat' + (todayCount() >= dailyGoal ? " ok" : "") + '"><b>' + todayCount() + '<small> / ' + dailyGoal + '</small></b><span>' + (todayCount() >= dailyGoal ? "мету виконано ✓" : "денна мета") + '</span></div>' +
      '<div class="hstat"><b>' + sn + '</b><span>' + daysWord(sn) + ' поспіль</span></div>' +
      '<div class="hstat" title="' + esc(lv.name) + '"><b>' + (lv.to - xp) + '</b><span>балів до рівня ' + (lv.n + 1) + '</span></div></div>';
    stage.innerHTML = h;
    document.getElementById("hgo").addEventListener("click", function () { openSet(c.k, c.l); window.scrollTo(0, 0); });
    stage.querySelector(".plan").addEventListener("click", function (e) {
      var b = e.target.closest(".prow");
      if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "err") openErrors();
      else if (a === "photo") { openVocab(); openPhoto(); }
      else if (a === "cards") { vmode = "cards"; try { localStorage.setItem("fr-vmode", "cards"); } catch (e2) {} openVocab(); }
      else openSet(b.getAttribute("data-k"), parseInt(b.getAttribute("data-l"), 10));
      window.scrollTo(0, 0);
    });
  }

  /* Words from a photo: Claude (viewer's account, inside the Claude app) reads the photo,
     finds underlined / highlighted words, or the word under a tap, and translates it. */
  var photoOpen = false;
  var sampleFn = null, sampleImages = false, sampleChecked = false;
  var samplePromise = null;
  function getSample() {
    if (!samplePromise) {
      samplePromise = new Promise(function (resolve) {
        try {
          if (!window.claude || typeof window.claude.use !== "function") { resolve(null); return; }
          window.claude.use("sample").then(function (fn) {
            if (!fn) { resolve(null); return; }
            sampleFn = fn;
            Promise.resolve(fn.limits ? fn.limits() : null).then(function (lim) {
              sampleImages = !!(lim && lim.images);
              resolve(fn);
            }, function () { resolve(fn); });
          }, function () { resolve(null); });
        } catch (e) { resolve(null); }
      }).then(function (fn) { sampleChecked = true; return fn; });
    }
    return samplePromise;
  }
  var ph = null; /* { url, img, W, H, zoom } */
  var found = [], pins = [], mainCtl = null, mainState = "idle", mainNote = "";
  function sampleErr(e) {
    var c = e && e.code;
    if (c === "not_granted" || c === "sampling_disabled" || c === "not_declared" || c === "capability_disabled" || c === "images_unavailable") return "Claude не має дозволу читати фото на цій сторінці. Дозвольте його в меню сторінки (Дозволи) і спробуйте ще раз.";
    if (c === "rate_limited") return "Забагато запитів підряд або вичерпано ліміт Claude. Спробуйте трохи пізніше.";
    if (c === "image_rejected") return "Фото не підходить: завелике або незвичний формат. Спробуйте інше.";
    if (c === "refused") return "Claude не зміг обробити це фото.";
    if (c === "session_expired") return "Потрібно знову увійти в Claude.";
    if (c === "invalid_json" || c === "empty_completion") return "Не вдалося прочитати відповідь. Спробуйте ще раз.";
    return "Не вдалося зв'язатися з Claude. Перевірте інтернет і спробуйте ще раз.";
  }
  var ENTRY_RULES = 'For each word give: "fr" = dictionary form (verbs in the infinitive, adjectives in masculine singular, nouns with the definite article le/la/l\'/les; keep a fixed multi-word expression together), "seen" = the exact form as printed, "ua" = a short Ukrainian translation (1-4 words; separate different meanings with commas), "ex" = the French sentence from the text that contains it (fix obvious recognition errors, at most 160 characters), "exua" = Ukrainian translation of that sentence.';
  function cleanEntry(o) {
    if (!o || typeof o !== "object") return null;
    var fr = String(o.fr || o.seen || "").trim().slice(0, 80);
    if (!fr) return null;
    return { fr: fr, seen: String(o.seen || "").trim().slice(0, 80), ua: String(o.ua || "").trim().slice(0, 120), ex: String(o.ex || "").trim().slice(0, 200), exua: String(o.exua || "").trim().slice(0, 240) };
  }
  function addFound(e, src, pin) {
    for (var i = 0; i < found.length; i++) {
      if (found[i].fr.toLowerCase() === e.fr.toLowerCase()) { if (pin) pin.n = i + 1; return; }
    }
    e.src = src;
    e.on = !vocabHas(e.fr);
    found.push(e);
    if (pin) pin.n = found.length;
  }
  function openPhoto() {
    if (!inVocab) openVocab();
    photoOpen = true;
    renderPhoto();
    window.scrollTo(0, 0);
  }
  function closePhoto() {
    if (mainCtl) { try { mainCtl.abort(); } catch (e) {} }
    photoOpen = false;
    renderVocabView();
  }
  function renderPhoto() {
    var h = '<section class="card vocab"><div class="vhead"><p class="label" style="margin:0">Слова з фото</p><button type="button" class="btn ghost" id="pback">← Словник</button></div>';
    var noClaude = sampleChecked && (!sampleFn || !sampleImages);
    if (noClaude) {
      h += '<p class="smsg warn">Ця функція працює у версії застосунку, відкритій у Claude: фото читає Claude з вашого акаунта. Тут вона недоступна.</p></section>';
      stage.innerHTML = h;
      document.getElementById("pback").addEventListener("click", closePhoto);
      return;
    }
    if (!ph) {
      h += '<p style="margin:0">Сфотографуйте сторінку з французьким текстом. Підкреслені, обведені або виділені маркером слова знайдуться самі. Інші слова можна додати дотиком до фото.</p>';
    }
    h += '<div class="photo-actions">' +
      '<span class="btn filebtn">📷 ' + (ph ? "Нове фото" : "Зробити фото") + '<input type="file" id="pcam" accept="image/*" capture="environment" aria-label="Зробити фото"></span>' +
      '<span class="btn ghost filebtn">З галереї<input type="file" id="pgal" accept="image/*" aria-label="Вибрати фото з галереї"></span></div>';
    if (ph) {
      h += '<div class="ptools"><p class="pstatus" id="pstatus"></p><button type="button" class="btn ghost" id="pzoom">' + (ph.zoom ? "Зменшити" : "Збільшити") + '</button></div>';
      h += '<div class="pwrap" id="pwrap"><div class="pinner' + (ph.zoom ? " z2" : "") + '" id="pinner"><img id="pimg" src="' + ph.url + '" alt="Ваше фото тексту"><div id="ppins"></div></div></div>';
      h += '<p class="hint" style="margin:0;color:var(--muted);font-size:0.88rem">Торкніться слова на фото, щоб додати його. «Збільшити» допомагає влучити в дрібний шрифт.</p>';
      h += '<ul class="flist" id="flist"></ul>';
      h += '<div class="nextrow" id="paddrow"><button type="button" class="btn" id="padd"></button></div>';
    }
    h += '</section>';
    stage.innerHTML = h;
    document.getElementById("pback").addEventListener("click", closePhoto);
    ["pcam", "pgal"].forEach(function (id) {
      document.getElementById(id).addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0];
        if (f) loadPhoto(f);
      });
    });
    if (ph) {
      document.getElementById("pzoom").addEventListener("click", function () { ph.zoom = !ph.zoom; renderPhoto(); });
      document.getElementById("pimg").addEventListener("click", onPhotoTap);
      document.getElementById("padd").addEventListener("click", addChosen);
      var fl = document.getElementById("flist");
      fl.addEventListener("change", function (e) {
        var li = e.target.closest("[data-i]"); if (!li) return;
        var it = found[+li.getAttribute("data-i")]; if (!it) return;
        if (e.target.type === "checkbox") { it.on = e.target.checked; li.classList.toggle("off", !it.on); updateAdd(); }
      });
      fl.addEventListener("input", function (e) {
        var li = e.target.closest("[data-i]"); if (!li) return;
        var it = found[+li.getAttribute("data-i")]; if (!it) return;
        if (e.target.classList.contains("fw")) it.fr = e.target.value;
        else if (e.target.classList.contains("fua")) it.ua = e.target.value;
      });
      fl.addEventListener("click", function (e) {
        var b = e.target.closest(".fx"); if (!b) return;
        var i = +b.closest("[data-i]").getAttribute("data-i");
        found.splice(i, 1);
        for (var k = 0; k < pins.length; k++) { if (pins[k].n === i + 1) pins[k].n = 0; else if (pins[k].n > i + 1) pins[k].n--; }
        updateList(); updatePins();
      });
      updateStatus(); updatePins(); updateList();
    }
    if (!sampleChecked) getSample().then(function () { if (photoOpen && inVocab && (!sampleFn || !sampleImages)) renderPhoto(); });
  }
  function updateStatus() {
    var el = document.getElementById("pstatus"); if (!el) return;
    var busy = 0; for (var i = 0; i < pins.length; i++) if (pins[i].st === "busy") busy++;
    var h = "";
    if (mainState === "busy") h = '<span class="spin" aria-hidden="true"></span>Шукаю підкреслені слова… <button type="button" class="btn ghost" id="pstop" style="padding:4px 10px">Стоп</button>';
    else if (busy) h = '<span class="spin" aria-hidden="true"></span>Розпізнаю слово…';
    else if (mainNote) h = esc(mainNote);
    el.innerHTML = h;
    var st = document.getElementById("pstop");
    if (st) st.addEventListener("click", function () { if (mainCtl) mainCtl.abort(); });
  }
  function updatePins() {
    var box = document.getElementById("ppins"); if (!box || !ph) return;
    var h = "";
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      h += '<span class="pin ' + p.st + '" style="left:' + (p.x / ph.W * 100) + '%;top:' + (p.y / ph.H * 100) + '%">' + (p.st === "busy" ? "…" : p.st === "err" ? "!" : (p.n || "✓")) + '</span>';
    }
    box.innerHTML = h;
  }
  function updateAdd() {
    var b = document.getElementById("padd"), row = document.getElementById("paddrow"); if (!b) return;
    var n = 0; for (var i = 0; i < found.length; i++) if (found[i].on && found[i].fr.trim()) n++;
    b.textContent = n ? "Додати в словник: " + n : "Позначте слова, щоб додати";
    b.disabled = !n;
    row.hidden = !found.length;
  }
  function updateList() {
    var fl = document.getElementById("flist"); if (!fl) return;
    var h = "";
    for (var i = 0; i < found.length; i++) {
      var it = found[i], dup = vocabHas(it.fr);
      h += '<li class="fitem' + (it.on ? "" : " off") + '" data-i="' + i + '"><input type="checkbox" id="fc' + i + '" aria-label="Додати ' + esc(it.fr) + '"' + (it.on ? " checked" : "") + '>' +
        '<div class="fbody"><input class="fin fw" value="' + esc(it.fr).replace(/"/g, "&quot;") + '" aria-label="Слово" spellcheck="false">' +
        '<input class="fin fua" value="' + esc(it.ua).replace(/"/g, "&quot;") + '" aria-label="Переклад">' +
        (it.ex ? '<p class="fctx">' + esc(it.ex) + '</p>' : '') +
        '<span class="ftag' + (dup ? " dup" : "") + '">' + (dup ? "вже у словнику" : (it.src === "mark" ? "підкреслене" : "дотик № " + (i + 1))) + '</span></div>' +
        '<button type="button" class="fx" aria-label="Прибрати ' + esc(it.fr) + '">×</button></li>';
    }
    fl.innerHTML = h;
    updateAdd();
  }
  function loadPhoto(file) {
    if (mainCtl) { try { mainCtl.abort(); } catch (e) {} }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      if (ph && ph.url) { try { URL.revokeObjectURL(ph.url); } catch (e) {} }
      ph = { url: url, img: img, W: img.naturalWidth, H: img.naturalHeight, zoom: false };
      found = []; pins = []; mainNote = "";
      renderPhoto();
      findMarked();
    };
    img.onerror = function () { toast("Не вдалося відкрити фото. Спробуйте інше."); };
    img.src = url;
  }
  function toBlob(canvas, q) {
    return new Promise(function (res) { canvas.toBlob(function (b) { res(b); }, "image/jpeg", q || 0.9); });
  }
  function scaled(maxSide) {
    var k = Math.min(1, maxSide / Math.max(ph.W, ph.H)), c = document.createElement("canvas");
    c.width = Math.round(ph.W * k); c.height = Math.round(ph.H * k);
    c.getContext("2d").drawImage(ph.img, 0, 0, c.width, c.height);
    return toBlob(c, 0.9);
  }
  function findMarked() {
    var my = ph;
    mainState = "busy"; mainNote = ""; updateStatus();
    getSample().then(function (fn) {
      if (!fn || !sampleImages) { mainState = "idle"; renderPhoto(); return; }
      return scaled(2000).then(function (blob) {
        if (my !== ph) return;
        mainCtl = new AbortController();
        var prompt = "The image is a photo of a page with French text (a book, worksheet or screen). A Ukrainian learner of French has underlined, circled or highlighted some words or expressions (pen, pencil or marker). Find every such marked word or expression, in reading order. Ignore printed formatting such as bold headings or hyperlinks unless it is clearly a hand or marker mark. " + ENTRY_RULES + ' Reply with only JSON: {"marked": [{"fr": "...", "seen": "...", "ua": "...", "ex": "...", "exua": "..."}]}. If nothing is marked, reply {"marked": []}.';
        return fn.json(prompt, { images: [blob], signal: mainCtl.signal }).then(function (r) {
          if (my !== ph) return;
          var list = r && Array.isArray(r.marked) ? r.marked : [];
          var n = 0;
          for (var i = 0; i < list.length; i++) { var e = cleanEntry(list[i]); if (e) { addFound(e, "mark"); n++; } }
          mainState = "idle";
          mainNote = n ? "Знайдено підкреслених слів: " + n + "." : "Підкреслених слів не знайдено. Торкніться слів на фото, щоб додати їх.";
          updateStatus(); updateList(); updatePins();
        });
      });
    }).catch(function (e) {
      if (my !== ph) return;
      mainState = "idle";
      mainNote = e && e.code === "cancelled" ? "Пошук зупинено. Слова можна додавати дотиком." : sampleErr(e);
      updateStatus();
    });
  }
  function onPhotoTap(e) {
    if (!ph) return;
    var r = e.currentTarget.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * ph.W, y = (e.clientY - r.top) / r.height * ph.H;
    if (x < 0 || y < 0 || x > ph.W || y > ph.H) return;
    var pin = { x: x, y: y, st: "busy", n: 0 };
    pins.push(pin); updatePins(); updateStatus();
    var my = ph;
    /* Crop a band around the tap so small print stays legible, and mark the spot. */
    var cw = Math.min(ph.W, Math.max(ph.W * 0.42, 360)), chh = Math.min(ph.H, Math.max(cw * 0.42, 160));
    var sx = Math.max(0, Math.min(ph.W - cw, x - cw / 2)), sy = Math.max(0, Math.min(ph.H - chh, y - chh / 2));
    var k = Math.min(1, 1200 / cw), c = document.createElement("canvas");
    c.width = Math.round(cw * k); c.height = Math.round(chh * k);
    var g = c.getContext("2d");
    g.drawImage(ph.img, sx, sy, cw, chh, 0, 0, c.width, c.height);
    var mx = (x - sx) * k, my2 = (y - sy) * k, rad = Math.max(10, c.width * 0.018);
    g.lineWidth = Math.max(3, rad * 0.35); g.strokeStyle = "rgba(230,0,40,0.95)";
    g.beginPath(); g.arc(mx, my2, rad, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(mx, my2 + rad * 1.2); g.lineTo(mx, my2 + rad * 3.2); g.stroke();
    toBlob(c, 0.9).then(function (blob) {
      return getSample().then(function (fn) {
        if (!fn || !sampleImages) throw { code: "images_unavailable" };
        var prompt = "The image is a crop of a photo of French text. A red circle (with a short red line below it) marks the spot where the learner tapped. Identify the single French word whose letters are under or closest to the centre of the red circle (if it is part of an elided form like l'école, take école; if it is clearly part of a fixed expression, you may give the whole expression). " + ENTRY_RULES + ' Reply with only JSON: {"fr": "...", "seen": "...", "ua": "...", "ex": "...", "exua": "..."}. If there is no readable word at the circle, reply {"fr": ""}.';
        return fn.json(prompt, { images: [blob] });
      });
    }).then(function (r) {
      if (my !== ph) return;
      var en = cleanEntry(r);
      if (!en) { pin.st = "err"; toast("Під позначкою не видно слова. Торкніться точніше або збільште фото."); }
      else { pin.st = "ok"; addFound(en, "tap", pin); }
      updatePins(); updateList(); updateStatus();
    }, function (err) {
      if (my !== ph) return;
      pin.st = "err"; updatePins(); updateStatus();
      toast(sampleErr(err));
    });
  }
  function addChosen() {
    var added = 0, skipped = 0, now = Date.now();
    for (var i = found.length - 1; i >= 0; i--) {
      var it = found[i];
      if (!it.on || !it.fr.trim()) continue;
      var w = it.fr.trim();
      if (vocabHas(w)) { skipped++; continue; }
      vocab.unshift({ w: w, ua: it.ua.trim() || "—", ex: it.ex, exua: it.exua, t: now, box: 0, due: 0, reps: 0, lapses: 0, src: "photo" });
      added++;
    }
    saveVocab();
    var keep = [];
    for (var j = 0; j < found.length; j++) { if (!found[j].on) keep.push(found[j]); }
    found = keep;
    for (var k2 = 0; k2 < pins.length; k2++) pins[k2].n = 0;
    refreshStatus();
    toast(added ? "Додано до словника: " + added + (skipped ? " (ще " + skipped + " вже були)" : "") : "Ці слова вже є у словнику.");
    updateList(); updatePins();
  }

  /* Settings screen. */
  var importText = "", importMsg = null, importReady = null;
  function exportData() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("fr-") === 0) data[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return JSON.stringify({ app: "dis-moi", v: 1, date: new Date().toISOString(), data: data });
  }
  function parseImport(text) {
    var o;
    try { o = JSON.parse(String(text).trim()); } catch (e) { return { err: "Це не схоже на файл прогресу. Скопіюйте текст повністю, від { до }." }; }
    if (!o || o.app !== "dis-moi" || !o.data || typeof o.data !== "object") return { err: "У тексті немає даних Dis-moi. Перевірте, що вставили саме експорт прогресу." };
    var n = 0;
    for (var k in o.data) { if (k.indexOf("fr-") === 0 && typeof o.data[k] === "string") n++; }
    if (!n) return { err: "Файл прогресу порожній." };
    var g = {}; try { g = JSON.parse(o.data["fr-game"] || "{}"); } catch (e) {}
    var v = []; try { v = JSON.parse(o.data["fr-vocab"] || "[]"); } catch (e) {}
    return { data: o.data, date: o.date, xp: g.xp || 0, words: Array.isArray(v) ? v.length : 0 };
  }
  function openSettings() {
    inSettings = true; inHome = false; inErrors = false; inVocab = false; inGram = false;
    navOpen = false;
    importMsg = null; importReady = null;
    setMode();
    refreshStatus();
    renderSettings();
  }
  function seg(name, items, cur) {
    var h = '<div class="seg wide" role="group">';
    for (var i = 0; i < items.length; i++) h += '<button type="button" class="segbtn" data-' + name + '="' + items[i][0] + '" aria-pressed="' + (String(items[i][0]) === String(cur)) + '">' + items[i][1] + '</button>';
    return h + '</div>';
  }
  function sw(id, label, sub, on) {
    return '<label class="swrow" for="' + id + '"><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><input type="checkbox" class="sw" id="' + id + '"' + (on ? " checked" : "") + '></label>';
  }
  function renderSettings() {
    var h = '<section class="card sets"><h2>Денна мета</h2>';
    h += seg("goal", GOALS.map(function (g) { return [g, String(g)]; }), dailyGoal);
    h += '<p class="hint">Скільки відповідей на день: вправи, тести й картки. Серія днів 🔥 зростає, коли мету виконано. Сьогодні: ' + todayCount() + ' з ' + dailyGoal + '.</p></section>';

    h += '<section class="card sets"><h2>Вигляд</h2>' + seg("theme", [["system", "Як у системі"], ["light", "Світла"], ["dark", "Темна"]], theme) + '</section>';

    h += '<section class="card sets"><h2>Звук і вібрація</h2>';
    h += sw("s-autosay", "Озвучувати речення", "Автоматично після кожної відповіді", autoSay);
    h += sw("s-sfx", "Звуки відповіді", "Короткий сигнал: правильно чи ні", sfxOn);
    if (canVib) h += sw("s-vib", "Вібрація", "Легкий відгук на відповідь", vibOn);
    if (canSpeak) {
      pickVoice();
      h += '<div class="voice"><button type="button" class="btn ghost" id="s-test">🔊 Перевірити голос</button><span>' + (frVoice ? 'Голос: <b>' + esc(frVoice.name) + '</b>' : 'Французький голос не знайдено. На Android: Налаштування → Мова та введення → Синтез мовлення → Google → встановити французьку.') + '</span></div>';
    } else {
      h += '<p class="hint">Цей браузер не вміє озвучувати текст.</p>';
    }
    h += '</section>';

    h += '<section class="card sets"><h2>Перенести прогрес</h2>';
    h += '<p class="hint">Бали, зірки, помилки, словник і налаштування зберігаються лише на цьому пристрої. Щоб перенести їх на інший телефон чи в іншу версію застосунку, скопіюйте прогрес тут і вставте там.</p>';
    h += '<div class="srow"><button type="button" class="btn" id="s-copy">Скопіювати прогрес</button>' + (window.self === window.top ? '<button type="button" class="btn ghost" id="s-save">Зберегти файл</button>' : '') + '</div>';
    h += '<textarea class="ta" id="s-out" readonly hidden aria-label="Експорт прогресу"></textarea>';
    h += '<hr class="sep">';
    h += '<label class="hint" for="s-in">Вставте скопійований прогрес або виберіть файл:</label>';
    h += '<textarea class="ta" id="s-in" placeholder="{&quot;app&quot;:&quot;dis-moi&quot;, …}" spellcheck="false">' + esc(importText) + '</textarea>';
    h += '<div class="srow"><button type="button" class="btn ghost" id="s-check">Завантажити прогрес</button><span class="btn ghost filebtn">Вибрати файл<input type="file" id="s-file" accept=".json,application/json,text/plain" aria-label="Вибрати файл прогресу"></span></div>';
    if (importMsg) h += '<p class="smsg ' + importMsg[0] + '">' + importMsg[1] + '</p>';
    if (importReady) h += '<div class="srow"><button type="button" class="btn" id="s-apply">Так, замінити</button><button type="button" class="btn ghost" id="s-cancel">Скасувати</button></div>';
    h += '</section>';

    var nq = 0; for (var id in ALL) nq++;
    h += '<section class="card sets"><h2>Про застосунок</h2><div class="about">' +
      '<div class="hstat"><b>' + nq + '</b><span>вправ</span></div>' +
      '<div class="hstat"><b>' + GRAM.length + '</b><span>тем граматики</span></div>' +
      '<div class="hstat"><b>' + vocab.length + '</b><span>слів у словнику</span></div></div></section>';
    stage.innerHTML = h;

    var box = stage;
    box.querySelectorAll("[data-goal]").forEach(function (b) { b.addEventListener("click", function () { dailyGoal = parseInt(b.getAttribute("data-goal"), 10); lsSet("fr-goal", String(dailyGoal)); renderSettings(); refreshGame(); }); });
    box.querySelectorAll("[data-theme]").forEach(function (b) { b.addEventListener("click", function () { theme = b.getAttribute("data-theme"); lsSet("fr-theme", theme); lsSet("fr-theme-set", "1"); applyTheme(); renderSettings(); }); });
    function bindSw(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener("change", function () { fn(el.checked); }); }
    bindSw("s-autosay", function (v) { autoSay = v; lsSet("fr-autosay", v ? "1" : "0"); if (v) say("C'est parti !"); });
    bindSw("s-sfx", function (v) { sfxOn = v; lsSet("fr-sfx", v ? "1" : "0"); if (v) beep(true); });
    bindSw("s-vib", function (v) { vibOn = v; lsSet("fr-vib", v ? "1" : "0"); if (v && canVib) { try { navigator.vibrate(30); } catch (e) {} } });
    var tb = document.getElementById("s-test"); if (tb) tb.addEventListener("click", function () { say("Bonjour ! Je m'appelle Dis-moi. On pratique le français ensemble ?"); });

    document.getElementById("s-copy").addEventListener("click", function () {
      var txt = exportData(), out = document.getElementById("s-out");
      out.value = txt; out.hidden = false;
      function fallback() { out.focus(); out.select(); toast("Виділено. Натисніть «Копіювати» в меню телефона."); }
      try {
        navigator.clipboard.writeText(txt).then(function () { toast("Прогрес скопійовано. Вставте його в іншій версії застосунку."); }, fallback);
      } catch (e) { fallback(); }
    });
    var sv = document.getElementById("s-save");
    if (sv) sv.addEventListener("click", function () {
      try {
        var blob = new Blob([exportData()], { type: "application/json" }), a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "dis-moi-progres-" + dayStr(new Date()) + ".json";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      } catch (e) { toast("Не вдалося зберегти файл. Скористайтеся кнопкою «Скопіювати прогрес»."); }
    });
    var inp = document.getElementById("s-in");
    inp.addEventListener("input", function () { importText = inp.value; });
    function check(text) {
      importText = text;
      var r = parseImport(text);
      if (r.err) { importMsg = ["bad", r.err]; importReady = null; }
      else {
        importReady = r.data;
        importMsg = ["warn", "Знайдено прогрес" + (r.date ? " від " + esc(String(r.date).slice(0, 10)) : "") + ": " + r.xp + " балів, " + r.words + " слів у словнику. Поточний прогрес на цьому пристрої буде замінено."];
      }
      renderSettings();
    }
    document.getElementById("s-check").addEventListener("click", function () { check(inp.value); });
    document.getElementById("s-file").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { check(String(rd.result || "")); };
      rd.onerror = function () { importMsg = ["bad", "Не вдалося прочитати файл."]; renderSettings(); };
      rd.readAsText(f);
    });
    var ap = document.getElementById("s-apply");
    if (ap) ap.addEventListener("click", function () {
      try {
        var del = [];
        for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf("fr-") === 0) del.push(k); }
        for (var j = 0; j < del.length; j++) localStorage.removeItem(del[j]);
        for (var key in importReady) { if (key.indexOf("fr-") === 0 && typeof importReady[key] === "string") localStorage.setItem(key, importReady[key]); }
        importReady = null; importText = "";
        importMsg = ["good", "Прогрес завантажено. Перезапускаю…"];
        renderSettings();
        setTimeout(function () { location.reload(); }, 600);
      } catch (e) { importMsg = ["bad", "Не вдалося записати прогрес на цьому пристрої."]; renderSettings(); }
    });
    var cc = document.getElementById("s-cancel");
    if (cc) cc.addEventListener("click", function () { importReady = null; importMsg = null; renderSettings(); });
  }
  document.getElementById("setbtn").addEventListener("click", function () {
    if (inSettings) openHome(); else openSettings();
    window.scrollTo(0, 0);
  });

  (function () {
    var lt = lastTarget();
    currentKey = lt.k; currentLesson = lt.l;
    lastSet[SETS[lt.k].group] = lt.k;
  })();
  openHome();
})();
