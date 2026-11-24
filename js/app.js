(function () {
  var currentKey = "pc";
  var currentLesson = 0;
  var inErrors = false;
  var inVocab = false;
  var inGram = false;
  var inHome = false;
  var inSettings = false;
  var inDaily = false;

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
      var pack = (typeof eco !== "undefined" && eco.equip.sound) || "";
      var notes = ok ? (pack === "cafe" ? [1046, 1318] : pack === "accordeon" ? [523, 659, 784] : pack === "minimal" ? [1200] : [660, 880]) : (pack === "minimal" ? [300] : [220, 180]), t = actx.currentTime;
      for (var i = 0; i < notes.length; i++) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = pack === "accordeon" ? "sawtooth" : (ok ? "sine" : "triangle");
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
  function lvStart(n) { return 50 * n * (n - 1); }
  function levelOf(x) {
    var n = 1;
    while (lvStart(n + 1) <= x) n++;
    return { n: n, name: titleOf(n), from: lvStart(n), to: lvStart(n + 1) };
  }
  function addXp(n) {
    if (!n) return;
    var before = levelOf(xp).n;
    xp += n;
    var after = levelOf(xp);
    if (after.n > before) toast("🎉 Новий рівень: " + after.n + " · " + after.name);
    refreshGame();
  }
  function dayStr(d) {
    function z(x) { return (x < 10 ? "0" : "") + x; }
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }
  function touchStreak() {
    if (todayCount() < dayGoal()) return;
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
    if (today.n >= dayGoal()) {
      var before = streak.last;
      touchStreak();
      saveGame();
      if (before !== streak.last) {
        refreshGame(); toast("🎯 Денну мету виконано! Серія: " + streak.n + " " + daysWord(streak.n));
        eco.ach.bestStreak = Math.max(eco.ach.bestStreak || 0, streak.n); achCheck();
      }
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
    return '<button type="button" class="say' + (cls ? " " + cls : "") + (canSpeak ? "" : " off") + '" data-say="' + esc(text).replace(/"/g, "&quot;") + '" aria-label="Прослухати">🔊</button>';
  }
  /* The Claude Android app shows pages in a WebView without speech and often without the file picker.
     In Chrome (claude.ai in the browser) both work, so point the learner there. */
  var APP_URL = "https://claude.ai/artifact/GmDRjoUZC3FDbFRkrHB9UD";
  var inWebView = /; wv\)/.test(navigator.userAgent || "");
  function chromeHint(text) {
    return '<div class="chint"><p>' + text + '</p><div class="srow"><a class="btn" href="' + APP_URL + '" target="_blank" rel="noopener">Відкрити в браузері</a><button type="button" class="btn ghost" data-copylink="1">Скопіювати посилання</button></div>' +
      '<p class="chint-url">' + APP_URL + '</p></div>';
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-copylink]") : null;
    if (!b) return;
    var done = function () { toast("Посилання скопійовано. Вставте його в адресний рядок Chrome."); };
    try { navigator.clipboard.writeText(APP_URL).then(done, function () { toast("Скопіюйте посилання під кнопками вручну."); }); }
    catch (e2) { toast("Скопіюйте посилання під кнопками вручну."); }
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-say]") : null;
    if (!b) return;
    if (!canSpeak) { toast("Озвучка недоступна в цьому вікні (застосунок Claude на Android). Відкрийте сторінку в Chrome — там вона працює."); return; }
    say(b.getAttribute("data-say"));
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
    gl.textContent = "Niv. " + lv.n;
    gl.title = lv.name + ". До наступного рівня: " + (lv.to - xp) + " XP";
    var sn = streakNow(), gs = document.getElementById("gstreak"), done = streak.last === dayStr(new Date());
    var protectedNow = typeof eco !== "undefined" && eco.vac && eco.vac >= dayStr(new Date());
    gs.textContent = "🔥 " + sn;
    gs.className = "fire" + (protectedNow ? " ice" : (sn >= 30 && done ? " gold" : (done ? " on" : "")));
    gs.title = done ? "Сьогодні зараховано" : "Сьогодні ще не зараховано";
    var ge = document.getElementById("gecusn"); if (ge && typeof eco !== "undefined") ge.textContent = String(eco.ecus);
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
    for (var id in bank) { var q = ALL[id]; if (q && q.set === key && q.lesson === l && !((typeof eco !== "undefined" && eco.beat[id]) >= 1)) n++; }
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

  var lessonEcus = 0;
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
    if (!res && k !== "fix") lessonEcus = 0;
    secondArmed = false;
    pos = res ? res.n : 0; score = res ? res.s : 0; wrong = res ? res.w : []; answered = false;
    render();
  }
  /* Scroll only when the top of the exercise is above the screen; never jump to the page header. */
  function keepInView() {
    var r = stage.getBoundingClientRect();
    if (r.top < 0) window.scrollBy(0, r.top - 8);
  }
  function saveProg() {
    if (kind === "daily") { saveDaily(); return; }
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
    if (pos >= queue.length) {
      if ((kind === "main" || kind === "daily") && wrong.length) return renderFixIntro();
      return renderSummary();
    }
    setProgress();
    answered = false;
    var q = queue[pos];
    var opts = shuffle(q.o);
    var typed = amode === "typed";
    var html = "";
    html += '<section class="card" aria-labelledby="sentence">';
    html += '<div class="meta"><span class="chip">' + esc(SETS[q.set].label + (inErrors ? " · урок " + (q.lesson + 1) : "")) + '</span>' + (hist[q.id] ? '<span class="chip warn">помилок раніше: ' + hist[q.id] + '</span>' : '') + (q.verb ? '<span class="verb">(' + wrapWords(q.verb) + ')</span>' : '') + '</div>';
    html += '<p class="sentence" id="sentence">' + wrapWords(q.pre) + '<span class="blank" id="blank">&nbsp;&nbsp;&nbsp;&nbsp;</span>' + wrapWords(q.post) + '</p>';
    html += '<p class="tr">' + esc(q.tr) + '</p>';
    if ((eco.combo || 0) >= 2) html += '<p class="combo' + (eco.combo >= 3 ? " hot" : "") + '">🔥 ' + eco.combo + ' поспіль' + (eco.combo >= 3 ? ' · XP ×1,5' : '') + '</p>';
    html += '<div class="seg amode" role="group" aria-label="Спосіб відповіді"><button type="button" class="segbtn" data-am="choice" aria-pressed="' + !typed + '">Варіанти</button><button type="button" class="segbtn" data-am="typed" aria-pressed="' + typed + '">Вписати</button></div>';
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
    html += boostRow();
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
    var br = document.getElementById("boosts");
    if (br) br.addEventListener("click", function (e) { var b = e.target.closest("[data-boost]"); if (b && !answered) useBoost(b.getAttribute("data-boost")); });
  }

  /* Boosters during a lesson (bought in La Boutique; one tap buys when you have none). */
  var BOOSTS = [["indice", "Indice"], ["motcle", "Mot clé"], ["joker", "Joker"], ["seconde", "Seconde chance"]];
  var secondArmed = false;
  function boostRow() {
    var h = '<div class="boosts" id="boosts" role="group" aria-label="Підказки">';
    BOOSTS.forEach(function (b) {
      var n = eco.inv[b[0]] || 0, it = shopItem(b[0]);
      h += '<button type="button" class="boost' + (b[0] === "seconde" && secondArmed ? " armed" : "") + '" data-boost="' + b[0] + '"><b>' + b[1] + '</b><small>' + (n ? "×" + n : '<span class="coin">●</span>' + priceOf(it)) + '</small></button>';
    });
    return h + '</div>';
  }
  function useBoost(id) {
    if (!(eco.inv[id] > 0)) { if (!buy(id)) return; }
    var q = queue[pos];
    if (id === "joker") {
      var used = {}; queue.forEach(function (x) { used[x.id] = 1; });
      var pool = []; SETS[q.set].lessons.forEach(function (l) { l.forEach(function (x) { if (!used[x.id]) pool.push(x); }); });
      if (!pool.length) { toast("У цій темі немає інших вправ для заміни."); return; }
      eco.inv.joker--; ecoSave(); queue[pos] = pool[Math.floor(Math.random() * pool.length)]; render(); toast("Joker: нова вправа"); return;
    }
    if (id === "seconde") { if (secondArmed) return; eco.inv.seconde--; secondArmed = true; ecoSave(); document.querySelector('[data-boost="seconde"]').classList.add("armed"); toast("Seconde chance увімкнено для цієї вправи"); return; }
    if (id === "indice") {
      var ob = document.querySelectorAll("#opts .opt:not(:disabled)"), cut = 0;
      if (ob.length) { for (var i = 0; i < ob.length && cut < 2; i++) { if (q.a.indexOf(ob[i].getAttribute("data-v")) < 0) { ob[i].disabled = true; ob[i].classList.add("gone"); cut++; } } }
      else { var inp = document.getElementById("answer"); if (inp) inp.placeholder = "Починається з «" + q.a[0].charAt(0) + "…»"; }
      eco.inv.indice--; ecoSave(); return;
    }
    if (id === "motcle") {
      var words = (q.pre + " " + q.post).toLowerCase().replace(/[’]/g, "'").match(/\p{L}+(?:-\p{L}+)*'?/gu) || [], hit = null;
      for (var w = 0; w < words.length && !hit; w++) { if (glossFor(words[w]) && words[w].length > 3) hit = words[w]; }
      if (!hit && glossFor((q.verb || "").toLowerCase())) hit = q.verb.toLowerCase();
      if (!hit) { toast("Тут немає слова з перекладом у словнику. Підказку не витрачено."); return; }
      eco.inv.motcle--; ecoSave();
      var fb = document.getElementById("fb"); fb.innerHTML = '<div class="feedback hint"><strong>Mot clé</strong><span><b>' + esc(hit) + '</b> — ' + esc(glossFor(hit)) + '</span></div>';
    }
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
    if (!ok && secondArmed && mode === "choice") {
      secondArmed = false;
      bank[q.id] = (bank[q.id] || 0) + 1; hist[q.id] = (hist[q.id] || 0) + 1; saveState();
      var wb = document.querySelector('#opts .opt[data-v="' + (window.CSS && CSS.escape ? CSS.escape(value) : value) + '"]');
      if (wb) { wb.disabled = true; wb.className = "opt bad"; }
      document.getElementById("fb").innerHTML = '<div class="feedback bad"><strong>Seconde chance</strong><span>Не те. Спробуй ще раз — комбо збережено. Помилку записано в Mes erreurs.</span></div>';
      var sb = document.querySelector('[data-boost="seconde"]'); if (sb) sb.classList.remove("armed");
      return;
    }
    secondArmed = false;
    answered = true;
    var pts = 0, rw = { x: 0, c: 0 }, extra = "";
    var st0 = eco.stats[q.set] || (eco.stats[q.set] = { c: 0, w: 0 });
    if (ok) {
      score++;
      eco.combo = (eco.combo || 0) + 1; st0.c++;
      qBump("combo", eco.combo, true);
      if (q.set === "pc") eco.pcRight = (eco.pcRight || 0) + 1;
      if (["cod", "coi", "codcoi", "dp", "yen"].indexOf(q.set) >= 0) { eco.codRun = (eco.codRun || 0) + 1; eco.ach.ninjaBest = Math.max(eco.ach.ninjaBest || 0, eco.codRun); }
      var mult = eco.combo >= 3 ? 1.5 : 1;
      if (kind === "fix") { eco.beat[q.id] = Math.max(1, eco.beat[q.id] || 0); rw = gain(15, 3); qBump("fix"); extra = "Помилку виправлено (1/2)"; }
      else if (inErrors || (kind === "daily" && bank[q.id])) {
        var bt = (eco.beat[q.id] || 0) + 1; eco.beat[q.id] = bt; qBump("fix");
        if (bt >= 2) { delete bank[q.id]; delete eco.beat[q.id]; eco.beaten = (eco.beaten || 0) + 1; rw = gain(25, 10); extra = "Помилку переможено (2/2)!"; }
        else { rw = gain(15, 3); extra = "Виправлено (1/2)"; }
      }
      else if (kind === "main" && got[q.id]) rw = gain(5 * mult, 0.5);
      else { if (kind === "main") got[q.id] = 1; rw = gain(10 * mult, 1); }
      pts = rw.x; lessonEcus += rw.c;
      achCheck();
    } else {
      eco.combo = 0; eco.codRun = 0; st0.w++;
      if (kind === "fix") queue.push(q); /* comes back until it is right */
      else wrong.push({ q: q, given: value });
      bank[q.id] = (bank[q.id] || 0) + 1;
      hist[q.id] = (hist[q.id] || 0) + 1;
    }
    ecoSave();
    touchStreak();
    bumpDay();
    if (pts) { lessonPts += pts; }
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
      var cheer = eco.combo >= 3 ? MINOU_CHEER[eco.combo % MINOU_CHEER.length] : ["Parfait !", "Très bien !", "Exact !"][score % 3];
      msg = '<div class="feedback good"><strong>' + cheer + (rewardText(rw) ? ' <span class="pts">' + rewardText(rw) + '</span>' : '') + '</strong>' + (extra ? '<span class="xtra">' + extra + '</span>' : '') + '<span>' + esc(q.why) + '</span></div>';
    } else {
      var head = near ? "Майже — перевір діакритику" : MINOU_SOFT[hist[q.id] % MINOU_SOFT.length];
      msg = '<div class="feedback bad"><strong>' + head + '</strong><span>Правильна відповідь: <b>' + wrapWords(q.a[0]) + '</b></span><span>' + esc(q.why) + '</span>' +
        (kind === "fix" ? '<span class="tobank">↺ Приклад повернеться ще раз у цьому раунді</span>' : '<span class="tobank">↺ Додано в Mes erreurs — виправиш пізніше за +3 Écus</span>') + '</div>';
    }
    fb.innerHTML = msg;
    var nr = document.getElementById("nextrow");
    nr.hidden = false;
    if (mode !== "typed") document.getElementById("next").focus({ preventScroll: true });
    barFill.style.width = ((pos + 1) / queue.length * 100) + "%";
    bar.setAttribute("aria-valuenow", String(pos + 1));
  }

  /* End of a lesson: record the result once (stars, green status, daily bonus). */
  var mainRes = null;
  function finishMain() {
    var res = { kind: kind, score: score, total: queue.length, wrong: wrong.slice(), pts: lessonPts, ecus: lessonEcus, rows: [], stars: 0 };
    if ((kind === "main" && !inErrors) || kind === "daily") {
      res.stars = res.score >= res.total ? 3 : (res.score >= res.total * 0.8 ? 2 : 1);
      if (res.score === res.total - 1 && (eco.inv.bouclier || 0) > 0) { eco.inv.bouclier--; res.stars = 3; res.shield = true; }
      var repeat = false;
      if (kind === "main") {
        var lk = currentKey + ":" + currentLesson;
        repeat = !!finished[lk]; finished[lk] = true;
        if (res.stars > (stars[lk] || 0)) stars[lk] = res.stars;
        delete prog[lk];
        if (res.stars === 3 && !eco.stamps[currentKey]) { eco.stamps[currentKey] = 1; res.stamp = SETS[currentKey].label; }
        if (currentKey === "leq" && res.score === res.total) eco.ach.lequelDone = 1;
      } else {
        repeat = !!daily.awarded; daily.awarded = true;
        daily.done = true; daily.score = res.score; daily.total = res.total; saveDaily();
      }
      var r1 = gain(repeat ? 10 : 20, repeat ? 5 : 10); res.rows.push(["Урок завершено" + (repeat ? " (повтор, ½)" : ""), r1]);
      if (res.score === res.total) { var r2 = gain(repeat ? 15 : 30, repeat ? 7 : 15); res.rows.push(["Без помилок", r2]); }
      if (new Date().getHours() < 7) eco.ach.leveDone = 1;
      qBump("lesson"); achCheck();
    }
    touchStreak(); saveGame(); saveState(); ecoSave(); refreshStatus();
    return res;
  }
  function renderFixIntro() {
    mainRes = finishMain();
    barFill.style.width = "100%";
    countEl.textContent = queue.length + " / " + queue.length;
    var n = mainRes.wrong.length;
    var h = '<section class="card summary fixintro"><p class="label" style="margin:0">Робота над помилками</p>';
    h += '<p class="htitle">' + (mainRes.score) + ' з ' + mainRes.total + ' правильно</p>';
    h += '<p style="margin:0">Тепер виправимо ' + n + ' ' + plural(n, "помилку", "помилки", "помилок") + '. Неправильні приклади повертатимуться, доки ви не відповісте правильно' + (mainRes.kind === "main" ? ', і тоді урок стане зеленим' : '') + '.</p>';
    h += '<ul class="mistakes">';
    for (var i = 0; i < mainRes.wrong.length; i++) { var w = mainRes.wrong[i]; h += '<li>' + esc(w.q.pre) + '<b class="bad-ans">' + esc(w.given) + '</b>' + esc(w.q.post) + '</li>'; }
    h += '</ul><div class="actions"><button type="button" class="btn big" id="fixgo">Виправити помилки</button></div></section>';
    stage.innerHTML = h;
    document.getElementById("fixgo").addEventListener("click", function () {
      var list = [];
      for (var j = 0; j < mainRes.wrong.length; j++) list.push(mainRes.wrong[j].q);
      start(shuffle(list), "fix");
      keepInView();
    });
  }
  function renderSummary() {
    var res = kind === "fix" ? mainRes : finishMain();
    if (kind === "fix") { refreshStatus(); }
    if (kind === "errors") { res = { kind: "errors", score: score, total: queue.length, wrong: wrong.slice(), pts: lessonPts, ecus: lessonEcus, rows: [] }; }
    var total = res.total;
    barFill.style.width = "100%";
    bar.setAttribute("aria-valuenow", String(queue.length));
    countEl.textContent = total + " / " + total;
    var ansX = res.pts + (kind === "fix" ? lessonPts : 0), ansC = res.ecus + (kind === "fix" ? lessonEcus : 0);
    var html = '<section class="card summary result">';
    html += '<p class="label" style="margin:0">' + (res.kind === "daily" ? "Сьогоднішній урок пройдено" : (res.kind === "errors" ? "Mes erreurs · раунд" : "Résultat")) + '</p>';
    if (res.stars) html += '<div class="bigstars pop" aria-label="Зірок: ' + res.stars + ' з 3">' + starsText(res.stars) + '</div>';
    html += '<div class="score">' + res.score + '<small> / ' + total + '</small></div>';
    html += '<ul class="rows"><li><span>Відповіді' + (ansX ? '' : '') + '</span><b>' + rewardText({ x: ansX, c: ansC }) + '</b></li>';
    (res.rows || []).forEach(function (r) { html += '<li><span>' + r[0] + '</span><b>' + rewardText(r[1]) + '</b></li>'; });
    html += '</ul>';
    if (res.shield) html += '<p class="xtra">🛡 Bouclier d\'étoile зберіг зірку.</p>';
    if (res.stamp) html += '<p class="xtra">✉ Нова марка в альбомі: «' + esc(res.stamp) + '»</p>';
    if (res.wrong.length && res.kind !== "errors") html += '<p class="fixdone">✓ Усі помилки виправлено (1/2). Другий раз — у «Mes erreurs» за +3 Écus.</p>';
    else if (!res.wrong.length) html += '<p style="margin:0">Усі відповіді правильні. Bravo !</p>';
    var q = questsToday(), qd = questsDone();
    html += '<div class="qmini"><span>Квести сьогодні: ' + qd + '/3</span><div class="hbar"><i style="width:' + (qd / 3 * 100) + '%"></i></div></div>';
    if (res.kind === "main") {
      var hasNext = currentLesson + 1 < SETS[currentKey].lessons.length;
      html += '<p style="margin:0;color:var(--muted)">' + (lessonStatus(currentKey, currentLesson) === "done" ? "Урок позначено зеленим. " : "") + (hasNext ? "Можна переходити до уроку " + (currentLesson + 2) + "." : esc(SETS[currentKey].next)) + '</p>';
    }
    html += '<div class="actions">';
    if (qd === 3 && !q.chest) html += '<button type="button" class="btn gold" id="sumchest">Відкрити срібну скриню</button>';
    if (res.kind === "main") {
      if (currentLesson + 1 < SETS[currentKey].lessons.length) html += '<button type="button" class="btn" id="nextlesson">Урок ' + (currentLesson + 2) + ' →</button>';
      html += '<button type="button" class="btn ghost" id="restart">Пройти урок ще раз</button>';
    }
    if (res.kind === "errors" && bankTotal()) html += '<button type="button" class="btn" data-goto="errors">Mes erreurs</button>';
    html += '<button type="button" class="btn ghost" id="tohome">На головну</button>';
    html += '</div></section>';
    stage.innerHTML = html;
    if (res.stars === 3 && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) confetti();
    var sc = document.getElementById("sumchest");
    if (sc) sc.addEventListener("click", function () { q.chest = true; ecoSave(); openChest("silver", function () { renderSummaryAgain(); }); });
    function renderSummaryAgain() { var b2 = document.getElementById("sumchest"); if (b2) b2.remove(); }
    var rs = document.getElementById("restart");
    if (rs) rs.addEventListener("click", function () { delete prog[currentKey + ":" + currentLesson]; saveGame(); start(shuffle(SETS[currentKey].lessons[currentLesson]), "main"); keepInView(); });
    var nl = document.getElementById("nextlesson");
    if (nl) nl.addEventListener("click", function () { openSet(currentKey, currentLesson + 1); keepInView(); });
    document.getElementById("tohome").addEventListener("click", function () { openHome(); window.scrollTo(0, 0); });
  }
  function confetti() {
    var cols = ["#2d5bff", "#e8473f", "#f5b731", "#2bb673", "#9b8afb"];
    for (var i = 0; i < 28; i++) {
      var c = document.createElement("span"); c.className = "confetti";
      c.style.left = (Math.random() * 100) + "vw"; c.style.background = cols[i % cols.length];
      c.style.animationDelay = (Math.random() * 0.3) + "s"; c.style.setProperty("--dx", (Math.random() * 120 - 60) + "px");
      document.body.appendChild(c); setTimeout(function (n) { return function () { n.remove(); }; }(c), 1800);
    }
  }

  /* Today's lesson: 20 exercises from all tenses (open mistakes first), one per day, resumable. */
  var daily = {};
  try { var dl0 = JSON.parse(localStorage.getItem("fr-daily") || "{}"); if (dl0 && typeof dl0 === "object") daily = dl0; } catch (e) {}
  function saveDaily() {
    if (kind === "daily" && !daily.done) {
      var wl = [];
      for (var j = 0; j < wrong.length; j++) wl.push({ id: wrong[j].q.id, g: wrong[j].given });
      daily.n = Math.min(pos + 1, queue.length); daily.s = score; daily.w = wl; daily.p = lessonPts;
    }
    try { localStorage.setItem("fr-daily", JSON.stringify(daily)); } catch (e) {}
  }
  function dailyToday() { return daily.d === dayStr(new Date()) ? daily : null; }
  /* Rule of the day: rotates through the rules of the learner's current level (first level not finished). */
  function ruleOfDay() {
    var lvl = null, i, j;
    for (i = 0; i < LEVELS.length && !lvl; i++) {
      var l = setsOfLevel(LEVELS[i]);
      for (j = 0; j < l.length; j++) { if (tenseStatus(l[j]) !== "done") { lvl = LEVELS[i]; break; } }
    }
    var list = setsOfLevel(lvl || "A1");
    var day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    return list.length ? list[day % list.length] : null;
  }
  function buildDaily(rule) {
    var ids = [], have = {}, k, i;
    var bk = []; for (var id in bank) { if (ALL[id]) bk.push(id); }
    bk = shuffle(bk).slice(0, 5);
    for (i = 0; i < bk.length; i++) { ids.push(bk[i]); have[bk[i]] = 1; }
    var keys = []; for (k in SETS) { if (SETS[k].group === "tenses") keys.push(k); }
    var pools = {};
    for (i = 0; i < keys.length; i++) { var pl = []; for (var l = 0; l < SETS[keys[i]].lessons.length; l++) pl = pl.concat(SETS[keys[i]].lessons[l]); pools[keys[i]] = shuffle(pl); }
    var r = 0; keys = shuffle(keys);
    while (ids.length < (rule ? 15 : 20) && r < 200) {
      var pk = pools[keys[r % keys.length]];
      while (pk.length && have[pk[pk.length - 1].id]) pk.pop();
      if (pk.length) { var q = pk.pop(); ids.push(q.id); have[q.id] = 1; }
      r++;
    }
    ids = shuffle(ids);
    if (rule) {
      var rp = []; for (var rl = 0; rl < SETS[rule].lessons.length; rl++) rp = rp.concat(SETS[rule].lessons[rl]);
      rp = shuffle(rp).filter(function (q) { return !have[q.id]; }).slice(0, 5);
      ids = rp.map(function (q) { return q.id; }).concat(ids);
    }
    return ids;
  }
  function openDaily(again) {
    inPage = "";
    var t = dailyToday();
    if (!t || again) { var rk = ruleOfDay(); daily = { d: dayStr(new Date()), rule: rk, ids: buildDaily(rk), n: 0, s: 0, w: [], p: 0, done: false, awarded: t ? !!t.awarded : false }; }
    inDaily = true; inHome = false; inSettings = false; inErrors = false; inVocab = false; inGram = false;
    navOpen = false;
    setMode(); refreshStatus();
    var list = []; for (var i = 0; i < daily.ids.length; i++) { if (ALL[daily.ids[i]]) list.push(ALL[daily.ids[i]]); }
    var res = null;
    if (!daily.done && daily.n > 0 && daily.n <= list.length) {
      var wr = []; for (var j = 0; j < (daily.w || []).length; j++) { if (ALL[daily.w[j].id]) wr.push({ q: ALL[daily.w[j].id], given: daily.w[j].g }); }
      res = { n: daily.n, s: daily.s || 0, w: wr, p: daily.p || 0 };
    }
    saveDaily();
    if (!res && daily.rule && SETS[daily.rule]) { renderDailyIntro(list); return; }
    start(list, "daily", res);
  }
  function renderDailyIntro(list) {
    var r = SETS[daily.rule];
    countEl.textContent = "0 / " + list.length; barFill.style.width = "0%";
    var h = '<section class="card summary rintro"><p class="ckind">Правило дня · ' + esc(r.level) + '</p><p class="htitle">' + esc(r.label) + '</p>' +
      '<div class="recap-body">' + r.recap + '</div>' +
      '<p style="margin:0;color:var(--muted)">Спершу 5 завдань на це правило, потім 15 на часи.</p>' +
      '<div class="actions"><button type="button" class="btn big" id="dstart">Почати</button>' + (r.gramRef ? '<button type="button" class="btn ghost" id="dgram">Повне правило</button>' : '') + '</div></section>';
    stage.innerHTML = h;
    document.getElementById("dstart").addEventListener("click", function () { start(list, "daily", null); keepInView(); });
    var dg = document.getElementById("dgram"); if (dg) dg.addEventListener("click", function () { inDaily = false; openGram(r.gramRef); window.scrollTo(0, 0); });
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
    if (award) gain(award, Math.round(award / 5));
    if (tscore / n >= 0.8 && eco.stamps[tkey] !== "rare") { eco.stamps[tkey] = "rare"; ecoSave(); toast("✉ Рідкісна марка: " + SETS[tkey].label); achCheck(); }
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
    var unlocked = fin >= set.lessons.length || !!(eco.early && eco.early[currentKey]), tb = tests[currentKey];
    if (!unlocked && (eco.bossToken || 0) > 0) { lh += '<button type="button" class="lesson testchip ok" id="testbtn" data-boss="1">🏆 Défi Boss · використати жетон (' + eco.bossToken + ')</button>'; document.getElementById("lessons").innerHTML = lh; return; }
    lh += '<button type="button" class="lesson testchip' + (unlocked ? " ok" : "") + '" id="testbtn"' + (unlocked ? "" : " disabled") + '>' +
      (unlocked ? "🏆 Підсумковий тест" + (tb ? " · найкращий " + tb.best + "/" + tb.of : "") : "🔒 Підсумковий тест · пройдено уроків " + fin + " з " + set.lessons.length) + '</button>';
    document.getElementById("lessons").innerHTML = lh;
  }

  function curGroup() {
    return inPage ? "page:" + inPage : inDaily ? "daily" : inSettings ? "settings" : inHome ? "home" : inErrors ? "err" : inVocab ? "vocab" : inGram ? "gram" : SETS[currentKey].group;
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
  var LEVELS = ["A1", "A2", "B1", "B2"];
  var GIDX = null;
  function setsOfLevel(lv) {
    if (!GIDX) { GIDX = {}; for (var gx = 0; gx < GRAM_ORDER.length; gx++) GIDX[GRAM_ORDER[gx].t] = gx; }
    var out = [];
    for (var k in SETS) { if (SETS[k].group === "topics" && SETS[k].level === lv) out.push(k); }
    return out.sort(function (a, b) { return ((GIDX[SETS[a].gramRef] || 999) - (GIDX[SETS[b].gramRef] || 999)); });
  }
  function syncTabs() {
    var g = curGroup();
    var tg = (g === "tenses" || g === "topics") ? "lessons" : (g === "daily" || g === "err" ? "home" : (g.indexOf("page:") === 0 ? PAGE_TAB[g.slice(5)] : g));
    var tabs = document.querySelectorAll("#maintabs .tab");
    for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute("aria-current", tabs[i].getAttribute("data-g") === tg ? "true" : "false");
    var ec = bankTotal(), eb = document.getElementById("errcount");
    if (eb) { eb.textContent = String(ec); eb.hidden = ec === 0; }
    var vb = document.getElementById("vocabcount"), vd = dueCount();
    vb.textContent = String(vd); vb.hidden = vd === 0;
    var gb = document.querySelectorAll("#groupseg .segbtn");
    for (var gi2 = 0; gi2 < gb.length; gi2++) gb[gi2].setAttribute("aria-pressed", String(gb[gi2].getAttribute("data-grp") === g));
    var sub = document.getElementById("subtabs"), lsg = document.getElementById("levelseg");
    lsg.hidden = g !== "topics";
    if (g === "topics") {
      var lb = lsg.querySelectorAll(".segbtn"), clv = SETS[currentKey].level;
      for (var li2 = 0; li2 < lb.length; li2++) {
        var lvk = lb[li2].getAttribute("data-lv"), all = setsOfLevel(lvk), dn = 0;
        for (var a2 = 0; a2 < all.length; a2++) if (tenseStatus(all[a2]) === "done") dn++;
        lb[li2].setAttribute("aria-pressed", String(lvk === clv));
        lb[li2].innerHTML = lvk + ' <small>' + dn + '/' + all.length + '</small>';
      }
    }
    if (g === "tenses" || g === "topics") {
      var h = "", keys = g === "topics" ? setsOfLevel(SETS[currentKey].level) : Object.keys(SETS);
      for (var ki = 0; ki < keys.length; ki++) {
        var k = keys[ki];
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
    if (!inErrors && !inVocab && !inGram && !inHome && !inSettings && !inDaily && !inPage) renderLessonChips();
    refreshGame();
  }

  function setMode() {
    var other = inErrors || inVocab || inGram || inHome || inSettings || inDaily || !!inPage;
    document.getElementById("setbtn").setAttribute("aria-pressed", String(inSettings));
    document.getElementById("lessons").hidden = other;
    document.getElementById("recapbox").hidden = other;
    syncNav();
    document.getElementById("errnote").hidden = !inErrors;
    document.getElementById("progress").hidden = inVocab || inGram || inHome || inSettings || !!inPage;
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
    if (r >= 3) gain(2, 0);
    qBump("cards");
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

  function practiceFor(title) {
    var best = null;
    for (var k in SETS) { if (SETS[k].gramRef === title) { if (!best || (SETS[k].group === "topics" && SETS[best].group !== "topics")) best = k; } }
    return best;
  }
  function gramItemHtml(g, num, f) {
    var pk = practiceFor(g.t);
    return '<details class="gtopic" data-i="' + g.i + '"' + (gopen[g.i] || f ? " open" : "") + '><summary><span>' + (num ? '<span class="gnum">' + num + '.</span> ' : "") + esc(g.t) + (f ? '<span class="gtag">' + g.lv + '</span>' : '') + '</span><span class="gpri p' + g.p + '" title="' + PNAME[g.p] + '"></span></summary><div class="gbody">' + g.h + (pk ? '<p><button type="button" class="btn gpractice" data-practice="' + pk + '">Вправи на це правило →</button></p>' : '') + '</div></details>';
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
      var pb = e.target.closest ? e.target.closest("button[data-practice]") : null;
      if (pb) { var pk = pb.getAttribute("data-practice"); navOpen = false; openSet(pk, pickLesson(pk)); window.scrollTo(0, 0); return; }
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
      if (d && d.getAttribute && d.getAttribute("data-i")) {
        gopen[d.getAttribute("data-i")] = d.open;
        var rk = todayS() + ":" + d.getAttribute("data-i");
        if (d.open && !eco.rules[rk]) { eco.rules[rk] = 1; for (var oldk in eco.rules) { if (oldk.slice(0, 10) !== todayS()) delete eco.rules[oldk]; } gain(5, 0); qBump("rule"); toast("+5 XP за прочитане правило"); }
      }
    }, true);
  }
  function openGram(topic) {
    if (typeof topic === "string") gq = topic;
    inPage = "";
    inGram = true; inHome = false; inSettings = false; inDaily = false; inVocab = false; inErrors = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "gram:0"); } catch (e) {}
    renderGram();
  }

  function openVocab() {
    inPage = "";
    photoOpen = false;
    inVocab = true; inHome = false; inSettings = false; inDaily = false;
    inGram = false;
    inErrors = false;
    setMode();
    refreshStatus();
    try { localStorage.setItem("fr-state", "vocab:0"); } catch (e) {}
    if (vmode === "cards") { fq = buildQueue(false); fshow = false; fdone = 0; }
    renderVocabView();
  }

  function openErrors() { openPage("errors"); }
  function openErrorsOld() {
    inErrors = true; inHome = false; inSettings = false; inDaily = false;
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
    inPage = "";
    inHome = false;
    inSettings = false;
    inDaily = false;
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
    if (g === "profile") { openPage("profile"); return; }
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
  document.getElementById("levelseg").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lv]");
    if (!b) return;
    var lv = b.getAttribute("data-lv"), list = setsOfLevel(lv);
    if (!list.length || lv === SETS[currentKey].level) return;
    var key = list[0];
    for (var i = 0; i < list.length; i++) { if (tenseStatus(list[i]) !== "done") { key = list[i]; break; } }
    navOpen = true;
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
    if (b.id === "testbtn") { if (b.getAttribute("data-boss")) { eco.bossToken--; eco.early = eco.early || {}; eco.early[currentKey] = 1; ecoSave(); } navOpen = false; openTest(); return; }
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
    inPage = "";
    inHome = true; inSettings = false; inDaily = false; inErrors = false; inVocab = false; inGram = false;
    navOpen = false;
    setMode();
    refreshStatus();
    renderHome();
  }
  var ICON = {
    err: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
    cards: '<rect x="3" y="7" width="13" height="14" rx="2.5"/><path d="M8 4h11a2 2 0 0 1 2 2v11"/>',
    photo: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    book: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5V5.5"/>'
  };
  function ico(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }
  function greeting() {
    var hr = new Date().getHours();
    if (hr < 5) return ["Bonne nuit", "Добраніч"];
    if (hr < 12) return ["Bonjour", "Доброго ранку"];
    if (hr < 18) return ["Bon après-midi", "Доброго дня"];
    return ["Bonsoir", "Доброго вечора"];
  }
  function dayHash() { var d = dayStr(new Date()), h = 0; for (var i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0; return h; }
  /* Word of the day: from the learner's own dictionary, else from the lesson glossary. */
  var wodShift = 0;
  function wordOfDay() {
    if (vocab.length) { var v = vocab[(dayHash() + wodShift) % vocab.length]; return { w: v.w, ua: v.ua, ex: v.ex, exua: v.exua, mine: true }; }
    var keys = Object.keys(GLOSS);
    var k = keys[(dayHash() + wodShift) % keys.length];
    return { w: k, ua: GLOSS[k], ex: "", exua: "", mine: false };
  }
  /* Quick question: one exercise right on the home screen, from lessons already met. */
  var quickQ = null, quickDone = false, quickAns = null, quickOpts = null;
  function plural(n, one, few, many) { var m = n % 10, h = n % 100; return (m === 1 && h !== 11) ? one : (m >= 2 && m <= 4 && (h < 12 || h > 14)) ? few : many; }
  function pickQuick() {
    var pool = [];
    for (var k in SETS) for (var l = 0; l < SETS[k].lessons.length; l++) if (finished[k + ":" + l] || prog[k + ":" + l]) pool = pool.concat(SETS[k].lessons[l]);
    if (!pool.length) { var c = contTarget(); pool = SETS[c.k].lessons[c.l]; }
    var q = pool[Math.floor(Math.random() * pool.length)];
    if (quickQ && pool.length > 1 && q === quickQ) q = pool[(pool.indexOf(q) + 1) % pool.length];
    quickQ = q; quickDone = false; quickAns = null; quickOpts = shuffle(q.o);
  }
  function quickHtml() {
    if (!quickQ) pickQuick();
    var q = quickQ, opts = quickOpts, done = quickAns !== null, ok = done && q.a.indexOf(quickAns) >= 0, h = '';
    h += '<p class="qs">' + esc(q.pre) + '<span class="blank' + (done ? (ok ? " good" : " bad") : "") + '" id="qblank">' + (done ? esc(ok ? quickAns : q.a[0]) : "&nbsp;&nbsp;&nbsp;") + '</span>' + esc(q.post) + '</p>';
    h += '<p class="qtr">' + esc(q.tr) + ' <span class="verb">(' + esc(q.verb) + ')</span></p><div class="qopts" id="qopts">';
    for (var i = 0; i < opts.length; i++) {
      var cls = done ? (opts[i] === q.a[0] ? " good" : (opts[i] === quickAns ? " bad" : "")) : "";
      h += '<button type="button" class="opt' + cls + '" data-v="' + esc(opts[i]) + '"' + (done ? " disabled" : "") + '>' + esc(opts[i]) + '</button>';
    }
    h += '</div>';
    if (done) h += '<div class="qres ' + (ok ? "good" : "bad") + '"><b>' + (ok ? "Чудово!" : "Майже. Правильно: " + esc(q.a[0])) + '</b><span>' + esc(q.why) + '</span><div class="qbtns">' + sayBtn(q.pre + q.a[0] + q.post, "") + '<button type="button" class="btn" id="qnext">Ще питання</button></div></div>';
    return h;
  }
  function wireQuick() {
    var card = document.getElementById("quick");
    card.addEventListener("click", function (e) {
      if (e.target.closest("#qnext") || e.target.closest("#qskip")) { pickQuick(); renderHome(); var qc = document.getElementById("quick"); if (qc) qc.scrollIntoView({ block: "nearest" }); return; }
      var b = e.target.closest(".opt"); if (!b || quickAns !== null) return;
      var q = quickQ; quickAns = b.getAttribute("data-v");
      var ok = q.a.indexOf(quickAns) >= 0;
      if (!ok) { bank[q.id] = (bank[q.id] || 0) + 1; hist[q.id] = (hist[q.id] || 0) + 1; saveState(); }
      answerFx(ok, q.pre + q.a[0] + q.post);
      bumpDay();
      card.querySelector(".qbody").innerHTML = quickHtml();
      refreshStatus(); updateRing(); updateTiles();
    });
  }
  function updateTiles() {
    var t = stage.querySelector('.tile[data-act="err"]'); if (!t) return;
    var ec = bankTotal();
    t.querySelector("b").textContent = ec || "✓";
    t.querySelector("span:last-child").textContent = ec ? plural(ec, "помилка", "помилки", "помилок") + " на повтор" : "помилок немає";
  }
  function ringSvg() {
    var n = todayCount(), g = dayGoal(), f = Math.min(1, n / g), C = 2 * Math.PI * 30;
    return '<svg viewBox="0 0 72 72" class="ring" aria-hidden="true"><circle cx="36" cy="36" r="30" class="rbg"/><circle cx="36" cy="36" r="30" class="rfg' + (f >= 1 ? " done" : "") + '" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - f)).toFixed(1) + '"/></svg>' +
      '<span class="rnum">' + (f >= 1 ? "✓" : n) + '<small>' + (f >= 1 ? "мета" : "з " + g) + '</small></span>';
  }
  function updateRing() { var r = document.getElementById("ringbox"); if (r) r.innerHTML = ringSvg(); var t = document.getElementById("hgoal"); if (t) t.textContent = goalText(); }
  function goalText() {
    var n = todayCount();
    var g = dayGoal();
    if (n >= g) return "Денну мету виконано. Bravo !";
    if (!n) return "Почнімо: денна мета " + g + " відповідей";
    return "Ще " + (g - n) + " до денної мети";
  }
  function renderHome() {
    var c = contTarget(), set = SETS[c.k], total = set.lessons[c.l].length, gr = greeting(), sn = streakNow(), lv = levelOf(xp);
    var h = '<section class="hello"><div class="htext"><p class="hi">' + gr[0] + '&nbsp;!</p><p class="hisub" id="hgoal">' + goalText() + '</p>' +
      '<p class="hchips"><span class="hchip">' + esc(titleOf(lv.n)) + ' · Niv. ' + lv.n + '</span><span class="hchip">ще ' + (lv.to - xp) + ' XP</span></p></div>' +
      '<button type="button" class="ringbox" id="ringbox" aria-label="Денна мета: ' + todayCount() + ' з ' + dayGoal() + '. Змінити в налаштуваннях">' + ringSvg() + '</button></section>';
    var hideHint = false; try { hideHint = localStorage.getItem("fr-hint-chrome") === "1"; } catch (e0) {}
    if ((inWebView || !canSpeak) && !hideHint) h += '<section class="card chome">' + chromeHint("Ви відкрили застосунок у Claude на Android: тут не працюють озвучка 🔊 і камера для «Слів з фото». Відкрийте цю сторінку в Chrome, і все запрацює. Прогрес можна перенести в ⚙️ Налаштуваннях.") + '<button type="button" class="qskip chx" id="hidehint" aria-label="Сховати">×</button></section>';

    h += '<section class="card cont"><div class="ctop">' + minouSvg(56) + '<div class="ctext"><p class="ckind">' + (set.group === "tenses" ? "Часи" : "Практика · " + set.level) + '</p><p class="htitle">' + esc(set.label) + '</p><p class="clesson">Урок ' + (c.l + 1) + ' з ' + set.lessons.length + (c.done ? " · вправа " + (c.done + 1) + " з " + total : "") + '</p></div></div>';
    if (c.done) h += '<div class="hbar" aria-hidden="true"><i style="width:' + Math.round(c.done / total * 100) + '%"></i></div>';
    h += '<button type="button" class="btn big" id="hgo">' + c.act + ' →</button></section>';

    if (streak.n >= 7 && streak.n % 7 === 0 && streak.last === todayS() && eco.goldAt !== streak.n) h += '<section class="card gchest"><div>' + chestSvg("gold") + '</div><div><p class="htitle">' + streak.n + ' днів серії!</p><p class="clesson">Золота скриня: 60–100 Écus</p><button type="button" class="btn gold" id="goldgo">Відкрити</button></div></section>';

    var q = questsToday(), qd = questsDone();
    h += '<section class="card quests"><div class="qhead"><p class="label" style="margin:0">Щоденні квести</p><span class="count">' + qd + '/3</span></div><ul class="qlist">';
    q.list.forEach(function (k) { var g = QUESTS[k].goal, n = Math.min(g, q.n[k] || 0); h += '<li class="' + (n >= g ? "done" : "") + '"><span>' + esc(QUESTS[k].t) + '</span><div class="hbar"><i style="width:' + pct(n, g) + '%"></i></div><b>' + (n >= g ? "✓" : n + "/" + g) + '</b></li>'; });
    h += '</ul><div class="qchest">' + chestSvg("silver") + '<span>' + (q.chest ? "Скриню відкрито ✓" : (qd === 3 ? "Усі квести виконано!" : "Срібна скриня за всі три (20–40 Écus)")) + '</span>' + (qd === 3 && !q.chest ? '<button type="button" class="btn gold" id="qchest">Відкрити</button>' : '') + '</div></section>';

    var ec = bankTotal();
    h += '<div class="tiles two">';
    h += '<button type="button" class="tile t-warm" data-goto="errors"><b>' + (ec || "✓") + '</b><span class="tname">Mes erreurs</span><span>' + (ec ? "+3 Écus за кожну" : "порожньо") + '</span></button>';
    var dd = eco.defi[todayS()];
    h += '<button type="button" class="tile t-lav" data-goto="defi"><b class="tsm">Le Défi du jour</b><span>' + (dd ? (dd.ok ? "виконано ✓" : "завтра новий") : "+50 XP · +20 Écus") + '</span></button>';
    h += '</div>';

    var t = dailyToday(), dn = t && !t.done ? Math.min(t.n || 0, 20) : 0;
    h += '<section class="card daily"><div class="dtext"><p class="ckind">Сьогоднішній урок</p><p class="htitle">' + (t && t.done ? "Пройдено ✓" : "20 завдань") + '</p>' +
      '<p class="clesson">' + (t && t.done ? "Результат: " + t.score + " з " + t.total + ". Завтра буде новий урок." : (dn ? "Виконано " + dn + " з 20" : "Правило дня: " + esc((SETS[(t && t.rule) || ruleOfDay()] || {}).label || "часи") + " + 15 завдань на часи")) + '</p>' +
      (dn ? '<div class="hbar" aria-hidden="true"><i style="width:' + (dn * 5) + '%"></i></div>' : '') + '</div>' +
      '<button type="button" class="btn big" id="dgo">' + (t && t.done ? "Пройти ще раз" : (dn ? "Продовжити" : "Пройти")) + '</button></section>';

    var wd = wordOfDay();
    h += '<section class="wodh" aria-label="Слово дня"><p class="wlabel">Слово дня</p>' +
      '<h2 class="wtitle"><span class="ww">' + esc(wd.w) + '</span> <span class="wdash">—</span> <span class="wua">' + esc(wd.ua) + '</span></h2>' +
      (wd.ex ? '<p class="wex">' + esc(wd.ex) + '</p>' : '') +
      '<div class="wtools">' + sayBtn(wd.w + (wd.ex ? ". " + wd.ex : ""), "") + (wd.mine || vocabHas(wd.w) ? '' : '<button type="button" class="btn ghost" id="wadd">+ У словник</button>') + '<button type="button" class="qskip" id="wnext" aria-label="Інше слово">↻</button></div></section>';

    var dc = dueCount();
    h += '<div class="tiles">';
    h += '<button type="button" class="tile t-blue" data-act="cards"><span class="tico">' + ico("cards") + '</span><b>' + (dc || "✓") + '</b><span>' + (dc ? plural(dc, "картка", "картки", "карток") + " до повтору" : "картки повторено") + '</span></button>';
    h += '<button type="button" class="tile t-rose" data-act="photo"><span class="tico">' + ico("photo") + '</span><b class="tsm">Слова з фото</b><span>знімок → словник</span></button>';
    h += '<button type="button" class="tile t-mint" data-goto="story"><span class="tico">' + ico("book") + '</span><b class="tsm">Mini-histoire</b><span>' + (bonusOpen("histoire") ? "історії з озвученням" : "🔒 рівень 16 або в магазині") + '</span></button>';
    h += '<button type="button" class="tile t-gold" data-goto="scenario"><span class="tico">' + ico("err") + '</span><b class="tsm">Scénario</b><span>' + (bonusOpen("scenario") ? "лікар, робота, установа" : "🔒 рівень 16 або в магазині") + '</span></button>';
    h += '</div>';

    var sx = seasonXp(), tier = Math.min(30, Math.floor(sx / 300));
    h += '<button type="button" class="card seasonstrip" data-goto="season"><span class="ckind">La Saison · ' + esc(REGIONS[seasonIdx() % 10][0]) + '</span><span class="sline"><b>' + tier + '/30</b><span class="hbar"><i style="width:' + pct(sx % 300, 300) + '%"></i></span><small>ще ' + (300 - sx % 300) + ' XP</small></span></button>';
    stage.innerHTML = h;

    var hh = document.getElementById("hidehint");
    if (hh) hh.addEventListener("click", function () { try { localStorage.setItem("fr-hint-chrome", "1"); } catch (e1) {} renderHome(); });
    document.getElementById("dgo").addEventListener("click", function () { openDaily(!!(t && t.done)); window.scrollTo(0, 0); });
    document.getElementById("hgo").addEventListener("click", function () { openSet(c.k, c.l); window.scrollTo(0, 0); });
    document.getElementById("ringbox").addEventListener("click", function () { openSettings(); window.scrollTo(0, 0); });
    var qc = document.getElementById("qchest"); if (qc) qc.addEventListener("click", function () { q.chest = true; ecoSave(); openChest("silver", renderHome); });
    var gg = document.getElementById("goldgo"); if (gg) gg.addEventListener("click", function () { eco.goldAt = streak.n; ecoSave(); openChest("gold", renderHome); });
    stage.querySelectorAll(".tile[data-act]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-act");
        if (a === "photo") { openVocab(); openPhoto(); }
        else if (a === "cards") { vmode = "cards"; try { localStorage.setItem("fr-vmode", "cards"); } catch (e2) {} openVocab(); }
        window.scrollTo(0, 0);
      });
    });
    document.getElementById("wnext").addEventListener("click", function () { wodShift++; renderHome(); });
    var wa = document.getElementById("wadd");
    if (wa) wa.addEventListener("click", function () {
      vocab.unshift({ w: wd.w, ua: wd.ua, ex: "", exua: "", t: Date.now(), box: 0, due: 0, reps: 0, lapses: 0 });
      saveVocab(); refreshStatus(); toast("Додано до словника: " + wd.w); renderHome();
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
      '<button type="button" class="btn" data-pick="pcam">📷 ' + (ph ? "Нове фото" : "Зробити фото") + '</button>' +
      '<button type="button" class="btn ghost" data-pick="pgal">З галереї</button></div>' +
      '<input type="file" class="vh" id="pcam" accept="image/*" capture="environment" tabindex="-1" aria-hidden="true">' +
      '<input type="file" class="vh" id="pgal" accept="image/*" tabindex="-1" aria-hidden="true">';
    if (!ph) {
      h += '<textarea class="ta paste" id="ppaste" rows="2" placeholder="Або вставте сюди скопійоване фото: утримуйте палець тут → «Вставити»" aria-label="Вставити фото"></textarea>';
      if (inWebView) h += chromeHint("Камера й галерея не відкриваються? У застосунку Claude на Android вибір файлів часто заблокований. Відкрийте цю сторінку в Chrome: там працює і фото, і озвучка.");
    }
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
    stage.querySelectorAll("[data-pick]").forEach(function (b) {
      b.addEventListener("click", function () {
        var inp = document.getElementById(b.getAttribute("data-pick"));
        inp.value = "";
        try { inp.click(); } catch (e) { toast("Не вдалося відкрити вибір фото. Спробуйте в Chrome."); }
      });
    });
    var pp = document.getElementById("ppaste");
    if (pp) pp.addEventListener("paste", function (e) {
      var items = (e.clipboardData && e.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image/") === 0) { e.preventDefault(); loadPhoto(items[i].getAsFile()); return; }
      }
      setTimeout(function () { pp.value = ""; }, 0);
      toast("У буфері немає фото. Скопіюйте зображення в галереї й вставте ще раз.");
    });
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

  /* ===================== Dix Mois game system: Écus, quests, chests, shop, season, league, profile ===================== */
  var eco = { ecus: 0, frac: 0, inv: {}, owned: {}, equip: {}, stats: {}, beat: {}, beaten: 0, ach: {}, stamps: {}, cards: {}, xplog: {},
    q: {}, freeze: 0, vac: "", night: "", last: "", start: "", combo: 0, maxCombo: {}, codRun: 0, pcRight: 0, boost: 0, shield: 0,
    league: { tier: 0, week: "" }, season: {}, defi: {}, rules: {}, early: {}, bossToken: 0, greeted: "" };
  try {
    var e0 = JSON.parse(localStorage.getItem("fr-eco") || "{}");
    if (e0 && typeof e0 === "object") for (var ek in e0) eco[ek] = e0[ek];
  } catch (e) {}
  if (!eco.start) eco.start = dayStr(new Date());
  function ecoSave() { try { localStorage.setItem("fr-eco", JSON.stringify(eco)); } catch (e) {} }
  function daysBetween(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / DAY_MS); }
  var DAY_MS = 86400000;
  function addDays(ds, n) { var d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + n); return dayStr(d); }
  function todayS() { return dayStr(new Date()); }
  function boostOn() { return eco.boost && Date.now() < eco.boost; }

  /* Rewards. XP never decreases; Écus are spent in the shop. */
  function gain(x, c, why) {
    x = Math.round(x * (boostOn() ? 2 : 1));
    var whole = Math.floor(c + (eco.frac || 0) + 1e-9);
    eco.frac = Math.round(((c + (eco.frac || 0)) - whole) * 100) / 100;
    if (x) { addXp(x); var t = todayS(); eco.xplog[t] = (eco.xplog[t] || 0) + x; seasonCheck(); }
    if (whole) eco.ecus += whole;
    ecoSave(); refreshGame();
    return { x: x, c: whole };
  }
  function spend(n) { if (eco.ecus < n) return false; eco.ecus -= n; ecoSave(); refreshGame(); return true; }
  function rewardText(r) { return (r.x ? "+" + r.x + " XP" : "") + (r.c ? (r.x ? " · " : "") + "+" + r.c + " Écus" : ""); }

  /* Titles by level: level N needs 100 × N XP. */
  var TITLES = [[1, "Touriste"], [6, "Voyageur"], [16, "Résident"], [26, "Habitant"], [41, "Francophone"]];
  function titleOf(n) { var t = TITLES[0][1]; for (var i = 0; i < TITLES.length; i++) if (n >= TITLES[i][0]) t = TITLES[i][1]; return t; }

  /* Daily quests: three a day from a pool, all three = silver chest. */
  var QUESTS = {
    lesson: { t: "Пройди 1 урок з будь-якої теми", goal: 1 },
    fix: { t: "Виправ 3 помилки з «Mes erreurs»", goal: 3 },
    cards: { t: "Повтори 10 карток словника", goal: 10 },
    combo: { t: "Зроби комбо з 5 правильних відповідей", goal: 5 },
    rule: { t: "Прочитай 1 правило з довідника граматики", goal: 1 }
  };
  function questsToday() {
    var t = todayS();
    if (eco.q.d !== t) {
      var keys = Object.keys(QUESTS), h = 0;
      for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
      var pick = [];
      while (pick.length < 3) { var k = keys[h % keys.length]; if (pick.indexOf(k) < 0) pick.push(k); h = (h * 1103515245 + 12345) >>> 0; }
      eco.q = { d: t, list: pick, n: {}, chest: false };
      ecoSave();
    }
    return eco.q;
  }
  function qBump(kind, n, isMax) {
    var q = questsToday();
    if (q.list.indexOf(kind) < 0) return;
    var before = Math.min(q.n[kind] || 0, QUESTS[kind].goal);
    q.n[kind] = isMax ? Math.max(q.n[kind] || 0, n) : (q.n[kind] || 0) + (n || 1);
    if (before < QUESTS[kind].goal && q.n[kind] >= QUESTS[kind].goal) toast("✓ Квест виконано: " + QUESTS[kind].t);
    ecoSave();
  }
  function questsDone() { var q = questsToday(), d = 0; for (var i = 0; i < q.list.length; i++) if ((q.n[q.list[i]] || 0) >= QUESTS[q.list[i]].goal) d++; return d; }

  /* Chests: the range is shown before opening. */
  var CHESTS = { wood: { name: "Дерев'яна скриня", min: 10, max: 20 }, silver: { name: "Срібна скриня", min: 20, max: 40 }, gold: { name: "Золота скриня", min: 60, max: 100 } };
  function chestSvg(kind) {
    var c = kind === "gold" ? ["#f5b731", "#c98d0c"] : kind === "silver" ? ["#c9d1de", "#8e99ad"] : ["#b9773f", "#7d4b22"];
    return '<svg viewBox="0 0 120 100" class="chest-svg" aria-hidden="true"><rect x="12" y="44" width="96" height="48" rx="8" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="4"/>' +
      '<path d="M12 46 Q12 14 60 14 Q108 14 108 46 Z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="4" class="chest-lid"/>' +
      '<rect x="52" y="40" width="16" height="22" rx="4" fill="' + c[1] + '"/><rect x="12" y="62" width="96" height="6" fill="' + c[1] + '" opacity=".5"/></svg>';
  }
  function openChest(kind, after) {
    var ch = CHESTS[kind], amount = ch.min + Math.floor(Math.random() * (ch.max - ch.min + 1));
    var ov = document.createElement("div");
    ov.className = "modal";
    ov.innerHTML = '<div class="mcard chestbox"><p class="ckind">' + ch.name + '</p><div class="chest shake">' + chestSvg(kind) + '</div><p class="chest-range">Усередині: ' + ch.min + '–' + ch.max + ' Écus</p>' +
      '<button type="button" class="btn big gold" id="chopen">Відкрити</button></div>';
    document.body.appendChild(ov);
    ov.querySelector("#chopen").addEventListener("click", function () {
      var box = ov.querySelector(".chest");
      box.classList.remove("shake"); box.classList.add("burst");
      eco.ecus += amount; ecoSave(); refreshGame(); beep(true);
      setTimeout(function () {
        ov.querySelector(".mcard").innerHTML = '<p class="ckind">' + ch.name + '</p><div class="chest open">' + chestSvg(kind) + '</div><p class="loot"><span class="coin">●</span> +' + amount + ' Écus</p><button type="button" class="btn big" id="chok">Чудово!</button>';
        ov.querySelector("#chok").addEventListener("click", function () { ov.remove(); if (after) after(); });
      }, 420);
    });
  }
  function modal(html, wire) {
    var ov = document.createElement("div");
    ov.className = "modal";
    ov.innerHTML = '<div class="mcard">' + html + '</div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) { if (e.target === ov || e.target.closest("[data-close]")) ov.remove(); });
    if (wire) wire(ov);
    return ov;
  }

  /* Streak protection: freezes, holidays, night weeks, repair. */
  function dayGoal() { return eco.night && todayS() <= eco.night ? 5 : dailyGoal; }
  function protectStreak() {
    var t = todayS(), y = addDays(t, -1);
    if (!streak.last || streak.last >= y) return;
    var gap = daysBetween(streak.last, y); /* missed days */
    var used = 0;
    for (var i = 1; i <= gap; i++) {
      var d = addDays(streak.last, i);
      if (eco.vac && d <= eco.vac) continue;
      if (eco.freeze > 0) { eco.freeze--; used++; continue; }
      return; /* streak broken: Réparation can bring it back within 48 h */
    }
    streak.last = y; saveGame(); ecoSave();
    if (used) setTimeout(function () { toast("❄ Використано «Jour de repos»: " + used + ". Серію збережено."); }, 600);
  }
  function canRepair() { return streak.n > 1 && streakNow() === 0 && streak.last && daysBetween(streak.last, todayS()) <= 3; }

  /* Season = one month = one region of the map. 30 tiers × 300 XP. */
  var REGIONS = [["Paris", "Ейфелева вежа й кафе"], ["Normandie", "скелі Етрета, сидр"], ["Bretagne", "маяки, млинці"], ["Lyon", "бушони, Сона й Рона"], ["Provence", "лаванда, ринки"],
    ["Alsace", "фахверкові будиночки"], ["Genève", "Женевське озеро, фонтан"], ["Lausanne", "Лозанна над Леманом"], ["Jura", "ліси, сир Gruyère"], ["Québec", "фінал: французька Америка"]];
  function seasonIdx() { var s = new Date(eco.start + "T12:00:00"), n = new Date(); return Math.max(0, (n.getFullYear() - s.getFullYear()) * 12 + n.getMonth() - s.getMonth()); }
  function monthKey() { var n = new Date(); return n.getFullYear() + "-" + (n.getMonth() + 1); }
  function seasonXp() { var m = todayS().slice(0, 7), s = 0; for (var d in eco.xplog) if (d.slice(0, 7) === m) s += eco.xplog[d]; return s; }
  function tierReward(t) { return t === 30 ? 100 : (t % 5 === 0 ? 30 : 10); }
  function seasonCheck() {
    var mk = monthKey(), st = eco.season[mk] || (eco.season[mk] = { claimed: 0 });
    var tier = Math.min(30, Math.floor(seasonXp() / 300));
    while (st.claimed < tier) {
      st.claimed++;
      var r = tierReward(st.claimed);
      eco.ecus += r;
      if (st.claimed === 30) { st.postcard = true; toast("🏆 Сезон завершено! Листівка «" + REGIONS[seasonIdx() % 10][0] + "» + " + r + " Écus"); }
      else toast("Сезон: рівень " + st.claimed + " · +" + r + " Écus");
    }
  }

  /* League against yourself: this week vs last week. */
  function weekStart(ds) { var d = new Date(ds + "T12:00:00"), wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return dayStr(d); }
  function weekXp(ws) { var s = 0; for (var i = 0; i < 7; i++) s += eco.xplog[addDays(ws, i)] || 0; return s; }
  var TIERS = ["Bronze", "Argent", "Or", "Platine", "Diamant"];
  function leagueUpdate() {
    var ws = weekStart(todayS());
    if (!eco.league.week) { eco.league.week = ws; return; }
    while (eco.league.week < ws) {
      var w = eco.league.week, prev = addDays(w, -7), a = weekXp(w), b = weekXp(prev);
      if (a > b && a > 0) eco.league.tier = Math.min(4, eco.league.tier + 1);
      else if (a < b * 0.5) eco.league.tier = Math.max(0, eco.league.tier - 1);
      eco.league.week = addDays(w, 7);
    }
    ecoSave();
  }

  /* Achievements. */
  var ACH = [
    { id: "passe", t: "Maître du Passé", d: "100 правильних у passé composé", goal: 100, v: function () { return eco.pcRight || 0; } },
    { id: "chasseur", t: "Chasseur d'erreurs", d: "Переможено 50 помилок", goal: 50, v: function () { return eco.beaten || 0; } },
    { id: "lequel", t: "Lequel ?", d: "Урок на lequel без помилок", goal: 1, v: function () { return eco.ach.lequelDone ? 1 : 0; } },
    { id: "ninja", t: "COD/COI Ninja", d: "20 займенників поспіль без помилки", goal: 20, v: function () { return eco.ach.ninjaBest || 0; } },
    { id: "leve", t: "Lève-tôt", d: "Урок до 7:00", goal: 1, v: function () { return eco.ach.leveDone ? 1 : 0; } },
    { id: "jours", t: "Une semaine", d: "Серія 7 днів", goal: 7, v: function () { return Math.max(streakNow(), eco.ach.bestStreak || 0); } },
    { id: "defi", t: "Défi relevé", d: "10 щоденних викликів", goal: 10, v: function () { return eco.ach.defiWins || 0; } },
    { id: "collect", t: "Philatéliste", d: "10 марок у колекції", goal: 10, v: function () { return Object.keys(eco.stamps).length; } }
  ];
  function achCheck() {
    for (var i = 0; i < ACH.length; i++) {
      var a = ACH[i];
      if (!eco.ach["got_" + a.id] && a.v() >= a.goal) { eco.ach["got_" + a.id] = todayS(); toast("🏅 Досягнення: " + a.t); }
    }
    ecoSave();
  }

  /* Shop. */
  var SHOP = [
    { tab: "help", id: "indice", t: "Indice", d: "Прибирає 2 неправильні варіанти або показує першу літеру", p: 20 },
    { tab: "help", id: "motcle", t: "Mot clé", d: "Показує переклад слова з речення", p: 10 },
    { tab: "help", id: "seconde", t: "Seconde chance", d: "Друга спроба без втрати комбо (помилка все одно йде в банк)", p: 25 },
    { tab: "help", id: "joker", t: "Joker", d: "Замінити вправу іншою з тієї ж теми", p: 30 },
    { tab: "help", id: "bouclier", t: "Bouclier d'étoile", d: "Одна помилка не знімає зірку за урок", p: 40 },
    { tab: "help", id: "xp2", t: "XP ×2 (15 хв)", d: "Подвійний досвід протягом 15 хвилин", p: 50, now: true },
    { tab: "streak", id: "repos", t: "Jour de repos", d: "Заморозка серії на 1 день (максимум 2 в запасі)", p: 100, max: 2 },
    { tab: "streak", id: "vacances", t: "Vacances", d: "Режим відпустки на 7 днів: серія не згорає", p: 400, now: true },
    { tab: "streak", id: "reparation", t: "Réparation", d: "Відновити втрачену серію (протягом 48 год)", p: 250, now: true },
    { tab: "streak", id: "nuit", t: "Semaine de nuit", d: "Нічні зміни: мета дня 5 відповідей на 7 днів", p: 150, now: true },
    { tab: "bonus", id: "histoire", t: "Mini-histoire", d: "Короткі історії з озвученням і питаннями (безкоштовно з рівня 16)", p: 120, once: true },
    { tab: "bonus", id: "scenario", t: "Scénario", d: "Фрази: «В лікаря», «На зміні», «У префектурі» (безкоштовно з рівня 16)", p: 200, once: true },
    { tab: "bonus", id: "boss", t: "Défi Boss", d: "Відкриває підсумковий тест будь-якої теми достроково; нагорода — рідкісна марка", p: 150 },
    { tab: "style", id: "skin-nuit", t: "Тема «Paris la nuit»", d: "Темно-синя з золотом", p: 400, once: true, equip: ["skin", "nuit"] },
    { tab: "style", id: "skin-lavande", t: "Тема «Lavande de Provence»", d: "Лавандова", p: 300, once: true, equip: ["skin", "lavande"] },
    { tab: "style", id: "skin-jura", t: "Тема «Forêt du Jura»", d: "Лісова зелена", p: 300, once: true, equip: ["skin", "jura"] },
    { tab: "style", id: "skin-leman", t: "Тема «Lac Léman»", d: "Озерна бірюзова", p: 500, once: true, equip: ["skin", "leman"] },
    { tab: "style", id: "out-echarpe", t: "Шарф для Minou", d: "Червоний шарф", p: 80, once: true, equip: ["outfit", "echarpe"] },
    { tab: "style", id: "out-mariniere", t: "Тільняшка для Minou", d: "Футболка в смужку", p: 150, once: true, equip: ["outfit", "mariniere"] },
    { tab: "style", id: "out-casque", t: "Каска техніка", d: "Для змінної роботи", p: 250, once: true, equip: ["outfit", "casque"] },
    { tab: "style", id: "frame-or", t: "Золота рамка аватара", d: "Рамка в профілі", p: 150, once: true, equip: ["frame", "or"] },
    { tab: "style", id: "frame-tricolore", t: "Рамка «Tricolore»", d: "Синьо-біло-червона", p: 150, once: true, equip: ["frame", "tricolore"] },
    { tab: "style", id: "snd-cafe", t: "Звуки «Café»", d: "М'які дзвіночки", p: 200, once: true, equip: ["sound", "cafe"] },
    { tab: "style", id: "snd-accordeon", t: "Звуки «Accordéon»", d: "Акордеонні акорди", p: 200, once: true, equip: ["sound", "accordeon"] },
    { tab: "style", id: "snd-minimal", t: "Звуки «Мінімалізм»", d: "Ледь чутне клацання", p: 200, once: true, equip: ["sound", "minimal"] },
    { tab: "style", id: "title-conj", t: "Титул «Le Conjugueur»", d: "Показується в профілі", p: 100, once: true, equip: ["title", "Le Conjugueur"] },
    { tab: "style", id: "title-coi", t: "Титул «Roi du COI»", d: "Показується в профілі", p: 100, once: true, equip: ["title", "Roi du COI"] }
  ];
  function shopItem(id) { for (var i = 0; i < SHOP.length; i++) if (SHOP[i].id === id) return SHOP[i]; return null; }
  function offerToday() {
    var t = todayS(), h = 0; for (var i = 0; i < t.length; i++) h = (h * 33 + t.charCodeAt(i)) >>> 0;
    var pool = SHOP.filter(function (s) { return !(s.once && eco.owned[s.id]); });
    return pool.length ? pool[h % pool.length].id : null;
  }
  function priceOf(it) { return it.id === offerToday() ? Math.round(it.p * 0.7) : it.p; }
  function buy(id) {
    var it = shopItem(id); if (!it) return false;
    if (it.once && eco.owned[id]) return false;
    if (it.max && (eco.inv[id] || 0) >= it.max) { toast("Уже є максимум: " + it.max); return false; }
    if (id === "reparation" && !canRepair()) { toast("Серія не втрачена або минуло більше 48 годин."); return false; }
    var pr = priceOf(it);
    if (!spend(pr)) {
      var need = pr - eco.ecus;
      toast("Бракує " + need + " Écus. Виправ " + Math.ceil(need / 3) + " помилок або пройди урок без помилок.");
      return false;
    }
    if (id === "xp2") eco.boost = Date.now() + 15 * 60000;
    else if (id === "vacances") eco.vac = addDays(todayS(), 7);
    else if (id === "nuit") eco.night = addDays(todayS(), 6);
    else if (id === "reparation") { streak.last = addDays(todayS(), -1); saveGame(); }
    else if (id === "repos") eco.freeze = (eco.freeze || 0) + 1;
    else if (id === "boss") eco.bossToken = (eco.bossToken || 0) + 1;
    else if (it.once) { eco.owned[id] = todayS(); if (it.equip) { eco.equip[it.equip[0]] = it.equip[1]; applySkin(); } }
    else eco.inv[id] = (eco.inv[id] || 0) + 1;
    ecoSave(); refreshGame(); beep(true);
    toast("Куплено: " + it.t + " (−" + pr + " Écus)");
    return true;
  }
  function applySkin() {
    var s = eco.equip.skin || "";
    if (s) document.documentElement.setAttribute("data-skin", s); else document.documentElement.removeAttribute("data-skin");
  }
  applySkin();

  /* Minou, the companion cat (outfit and frame from the shop). */
  function minouSvg(size, mood) {
    var o = eco.equip.outfit || "", fr = eco.equip.frame || "";
    var ring = fr === "or" ? '<circle cx="60" cy="60" r="57" fill="none" stroke="#f5b731" stroke-width="6"/>' :
      fr === "tricolore" ? '<circle cx="60" cy="60" r="57" fill="none" stroke="#2d5bff" stroke-width="6" stroke-dasharray="120 240"/><circle cx="60" cy="60" r="57" fill="none" stroke="#ffffff" stroke-width="6" stroke-dasharray="120 240" stroke-dashoffset="-120"/><circle cx="60" cy="60" r="57" fill="none" stroke="#e8473f" stroke-width="6" stroke-dasharray="120 240" stroke-dashoffset="-240"/>' : "";
    var body = o === "mariniere" ? '<path d="M28 118 Q30 84 60 84 Q90 84 92 118Z" fill="#fff"/><path d="M30 96h60M29 104h62M28 112h64" stroke="#1b2a4a" stroke-width="4"/>' :
      '<path d="M28 118 Q30 84 60 84 Q90 84 92 118Z" fill="#f2a65a"/>';
    var scarf = o === "echarpe" ? '<path d="M36 84 Q60 96 84 84 L84 92 Q60 104 36 92Z" fill="#e8473f"/><rect x="70" y="90" width="9" height="20" rx="3" fill="#e8473f"/>' : "";
    var hat = o === "casque" ? '<path d="M30 40 Q32 14 60 14 Q88 14 90 40Z" fill="#f5b731"/><rect x="26" y="38" width="68" height="7" rx="3" fill="#c98d0c"/>' :
      '<ellipse cx="62" cy="26" rx="27" ry="10" fill="#1b2a4a"/><circle cx="62" cy="15" r="4" fill="#1b2a4a"/>';
    var eyes = mood === "wow" ? '<circle cx="47" cy="58" r="6" fill="#1b2a4a"/><circle cx="73" cy="58" r="6" fill="#1b2a4a"/>' :
      '<path d="M41 59 Q47 53 53 59M67 59 Q73 53 79 59" stroke="#1b2a4a" stroke-width="4" fill="none" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" class="minou" aria-label="Кіт Minou"><circle cx="60" cy="60" r="54" fill="var(--gold-soft)"/>' + ring +
      '<g clip-path="url(#mclip' + size + ')"><clipPath id="mclip' + size + '"><circle cx="60" cy="60" r="54"/></clipPath>' + body + scarf +
      '<path d="M32 42 L28 16 L50 32Z M88 42 L92 16 L70 32Z" fill="#f2a65a"/><circle cx="60" cy="58" r="30" fill="#f2a65a"/>' +
      '<path d="M36 26 L33 20 M84 26 L87 20" stroke="#f2a65a" stroke-width="2"/>' + eyes +
      '<path d="M57 68 L63 68 L60 72Z" fill="#e8473f"/><path d="M60 72 Q55 78 50 74 M60 72 Q65 78 70 74" stroke="#1b2a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M28 66 L44 68 M28 74 L44 72 M92 66 L76 68 M92 74 L76 72" stroke="#1b2a4a" stroke-width="1.6" opacity=".6"/>' + hat + '</g></svg>';
  }
  var MINOU_CHEER = ["Bravo !", "Super combo !", "Continue comme ça !", "Magnifique !"];
  var MINOU_SOFT = ["Pas grave, on réessaie.", "Помилка — це майбутні Écus.", "Courage ! Ти майже там.", "On apprend en se trompant."];

  /* ===================== Game screens ===================== */
  var inPage = "";
  var PAGE_TAB = { shop: "profile", season: "profile", league: "profile", profile: "profile", map: "profile", errors: "home", defi: "home", story: "home", scenario: "home" };
  function openPage(name, arg) {
    inPage = name; inHome = false; inSettings = false; inDaily = false; inVocab = false; inGram = false; inErrors = false;
    navOpen = false;
    setMode(); refreshStatus();
    var r = PAGES[name];
    if (r) r(arg);
    window.scrollTo(0, 0);
  }
  function backBtn(label, to) { return '<button type="button" class="btn ghost pback" data-goto="' + to + '">← ' + label + '</button>'; }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-goto]") : null;
    if (!b) return;
    var g = b.getAttribute("data-goto");
    if (g === "home") openHome(); else if (g === "settings") openSettings(); else openPage(g, b.getAttribute("data-arg"));
    window.scrollTo(0, 0);
  });
  function pct(a, b) { return Math.max(0, Math.min(100, b ? a / b * 100 : 0)); }

  /* Mes erreurs: every mistake must be answered right twice (end of lesson + later). */
  function errorItems() {
    var out = [];
    for (var id in bank) { if (ALL[id]) out.push({ q: ALL[id], b: eco.beat[id] || 0 }); }
    return out;
  }
  function renderErrorsPage() {
    var items = errorItems(), by = {};
    items.forEach(function (it) { (by[it.q.set] = by[it.q.set] || []).push(it); });
    var h = '<section class="card"><div class="vhead"><p class="label" style="margin:0">Mes erreurs</p><span class="count">' + items.length + '</span></div>';
    if (!items.length) {
      h += '<div class="empty">' + minouSvg(84) + '<p>Банк помилок порожній. Помилки з уроків з\'являтимуться тут, і кожна виправлена принесе <b>+3 Écus</b>.</p></div>';
    } else {
      h += '<p class="hint" style="margin:0;color:var(--muted)">Кожну помилку треба виправити двічі: у кінці уроку і тут. Виправлена: <b>+15 XP · +3 Écus</b>; переможена (2/2): <b>+25 XP · +10 Écus</b>.</p>';
      h += '<button type="button" class="btn big" id="ertrain">Тренувати помилки (' + Math.min(10, items.length) + ')</button>';
      Object.keys(by).forEach(function (k) {
        h += '<h3 class="ehead">' + esc(SETS[k].label) + '</h3><ul class="elist">';
        by[k].forEach(function (it) {
          h += '<li><span class="etext">' + esc(it.q.pre) + '<b>' + esc(it.q.a[0]) + '</b>' + esc(it.q.post) + '</span><span class="ebeat b' + it.b + '">' + it.b + '/2</span></li>';
        });
        h += '</ul>';
      });
    }
    h += '<p class="hint" style="margin:0;color:var(--muted)">Переможено всього: <b>' + (eco.beaten || 0) + '</b></p></section>';
    stage.innerHTML = h;
    var tb = document.getElementById("ertrain");
    if (tb) tb.addEventListener("click", function () { startErrorsRound(); });
  }
  function startErrorsRound() {
    inPage = ""; inErrors = true; inHome = false; inSettings = false; inDaily = false; inVocab = false; inGram = false;
    setMode(); refreshStatus();
    var items = errorItems().sort(function (a, b) { return b.b - a.b; });
    var list = shuffle(items.slice(0, 10)).map(function (it) { return it.q; });
    document.getElementById("errnote").hidden = true;
    start(list, "errors");
    window.scrollTo(0, 0);
  }

  /* Le Défi du jour: one harder sentence a day, typed. */
  function defiQ() {
    var pool = [];
    ["B1", "B2"].forEach(function (lv) { setsOfLevel(lv).forEach(function (k) { SETS[k].lessons.forEach(function (l) { pool = pool.concat(l); }); }); });
    ["cond", "sbj"].forEach(function (k) { SETS[k].lessons.forEach(function (l) { pool = pool.concat(l); }); });
    return pool[dayHash() % pool.length];
  }
  function renderDefi() {
    var q = defiQ(), d = eco.defi[todayS()];
    var h = '<section class="card defi"><p class="ckind">Le Défi du jour · ' + esc(SETS[q.set].label) + '</p><p class="htitle">Одне складне речення на день</p>';
    h += '<p class="sentence">' + esc(q.pre) + '<span class="blank' + (d ? (d.ok ? " good" : " bad") : "") + '" id="dblank">' + (d ? esc(d.ok ? q.a[0] : d.given) : "&nbsp;&nbsp;&nbsp;&nbsp;") + '</span>' + esc(q.post) + '</p><p class="tr">' + esc(q.tr) + (q.verb ? ' <span class="verb">(' + esc(q.verb) + ')</span>' : '') + '</p>';
    if (!d) {
      h += '<p class="hint" style="margin:0;color:var(--muted)">Без варіантів, одна спроба. Нагорода: <b>+50 XP · +20 Écus</b>.</p>';
      h += '<form class="type" id="dform" autocomplete="off"><input class="field" id="danswer" type="text" placeholder="Ваша відповідь" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Відповідь">' + keysHtml() + '<button type="submit" class="btn">Перевірити</button></form>';
    } else {
      h += '<div class="feedback ' + (d.ok ? "good" : "bad") + '"><strong>' + (d.ok ? "Parfait ! +50 XP · +20 Écus" : "Не цього разу") + '</strong><span>Правильно: <b>' + esc(q.a[0]) + '</b></span><span>' + esc(q.why) + '</span></div>';
      h += '<p class="hint" style="margin:0;color:var(--muted)">Новий виклик з\'явиться завтра.</p>';
    }
    h += '<div class="actions">' + sayBtn(q.pre + q.a[0] + q.post, "") + backBtn("На головну", "home") + '</div></section>';
    stage.innerHTML = h;
    var f = document.getElementById("dform");
    if (f) {
      wireKeys("danswer");
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = document.getElementById("danswer").value; if (!norm(v)) return;
        var ok = q.a.some(function (a) { return norm(a) === norm(v); });
        eco.defi[todayS()] = { ok: ok, given: v };
        if (ok) { gain(50, 20); eco.ach.defiWins = (eco.ach.defiWins || 0) + 1; achCheck(); }
        else { bank[q.id] = (bank[q.id] || 0) + 1; saveState(); }
        answerFx(ok, q.pre + q.a[0] + q.post); bumpDay(); ecoSave(); renderDefi();
      });
    }
  }

  /* La Boutique. */
  var shopTab = "help";
  function renderShop() {
    var off = offerToday(), offIt = off ? shopItem(off) : null;
    var h = '<section class="card shop"><div class="vhead"><p class="label" style="margin:0">La Boutique</p><span class="ecus"><span class="coin">●</span> ' + eco.ecus + '</span></div>';
    if (offIt) h += '<div class="offer"><span class="ckind">Offre du jour · −30%</span><b>' + esc(offIt.t) + '</b><span>' + esc(offIt.d) + '</span><button type="button" class="btn gold" data-buy="' + offIt.id + '"><s>' + offIt.p + '</s> ' + priceOf(offIt) + ' Écus</button></div>';
    var tabs = [["help", "Допомога"], ["streak", "Серія"], ["bonus", "Бонуси"], ["style", "Стиль"]];
    h += '<div class="seg wide" role="group">' + tabs.map(function (t) { return '<button type="button" class="segbtn" data-stab="' + t[0] + '" aria-pressed="' + (shopTab === t[0]) + '">' + t[1] + '</button>'; }).join("") + '</div><ul class="items">';
    SHOP.filter(function (s) { return s.tab === shopTab; }).forEach(function (it) {
      var have = it.once ? (eco.owned[it.id] ? "є" : "") : (it.id === "repos" ? (eco.freeze || 0) : (it.id === "boss" ? (eco.bossToken || 0) : (eco.inv[it.id] || 0)));
      var status = "";
      if (it.id === "xp2" && boostOn()) status = "активно ще " + Math.ceil((eco.boost - Date.now()) / 60000) + " хв";
      if (it.id === "vacances" && eco.vac >= todayS()) status = "до " + eco.vac;
      if (it.id === "nuit" && eco.night >= todayS()) status = "до " + eco.night;
      var owned = it.once && eco.owned[it.id];
      var equipped = it.equip && eco.equip[it.equip[0]] === it.equip[1];
      h += '<li class="item"><div class="itext"><b>' + esc(it.t) + '</b><span>' + esc(it.d) + '</span>' + (have !== "" && !it.once ? '<small>У тебе: ' + have + '</small>' : '') + (status ? '<small>' + status + '</small>' : '') + '</div>';
      if (owned && it.equip) h += '<button type="button" class="btn ' + (equipped ? "" : "ghost") + '" data-equip="' + it.id + '">' + (equipped ? "Знято" : "Вдягти") + '</button>';
      else if (owned) h += '<span class="ownd">Куплено ✓</span>';
      else h += '<button type="button" class="btn gold" data-buy="' + it.id + '">' + priceOf(it) + '</button>';
      h += '</li>';
    });
    h += '</ul><p class="hint" style="margin:0;color:var(--muted)">Пояснення правил і довідник завжди безкоштовні. Скрізь лише Écus, жодних справжніх грошей.</p>' + backBtn("Профіль", "profile") + '</section>';
    stage.innerHTML = h;
    stage.querySelector(".shop").addEventListener("click", function (e) {
      var t = e.target.closest("[data-stab]"); if (t) { shopTab = t.getAttribute("data-stab"); renderShop(); return; }
      var b = e.target.closest("[data-buy]"); if (b) { if (buy(b.getAttribute("data-buy"))) { coinBurst(b); renderShop(); } return; }
      var q = e.target.closest("[data-equip]");
      if (q) { var it = shopItem(q.getAttribute("data-equip")); var on = eco.equip[it.equip[0]] === it.equip[1]; eco.equip[it.equip[0]] = on ? "" : it.equip[1]; ecoSave(); applySkin(); renderShop(); }
    });
  }
  function coinBurst(el) {
    try {
      var r = el.getBoundingClientRect();
      for (var i = 0; i < 6; i++) {
        var c = document.createElement("span"); c.className = "flycoin"; c.textContent = "●";
        c.style.left = (r.left + r.width / 2) + "px"; c.style.top = (r.top) + "px"; c.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
        document.body.appendChild(c); setTimeout(function (n) { return function () { n.remove(); }; }(c), 700);
      }
    } catch (e) {}
  }

  /* La Saison. */
  function renderSeason() {
    var sx = seasonXp(), tier = Math.min(30, Math.floor(sx / 300)), reg = REGIONS[seasonIdx() % 10];
    var now = new Date(), end = new Date(now.getFullYear(), now.getMonth() + 1, 1), left = Math.ceil((end - now) / DAY_MS);
    var h = '<section class="card"><p class="ckind">La Saison · ' + esc(reg[0]) + '</p><p class="htitle">Рівень сезону ' + tier + ' з 30</p>';
    h += '<p class="clesson">Ще ' + (tier < 30 ? (300 - sx % 300) + ' XP до наступної нагороди' : 'сезон завершено') + ' · до кінця місяця ' + left + ' ' + daysWord(left) + '</p><div class="hbar"><i style="width:' + pct(sx % 300, 300) + '%"></i></div>';
    h += '<div class="tiers">';
    for (var t = 1; t <= 30; t++) h += '<div class="tier' + (t <= tier ? " got" : "") + (t === 30 ? " final" : "") + '"><b>' + t + '</b><span>' + (t === 30 ? "листівка + 100" : tierReward(t)) + '</span></div>';
    h += '</div><p class="hint" style="margin:0;color:var(--muted)">Кожні 300 XP цього місяця — нагорода в Écus. Рівень 30 дає листівку регіону «' + esc(reg[0]) + '» на карту.</p>' + backBtn("Профіль", "profile") + '</section>';
    stage.innerHTML = h;
  }

  /* La Ligue: you against last week's you. */
  function renderLeague() {
    leagueUpdate();
    var ws = weekStart(todayS()), prev = addDays(ws, -7), a = weekXp(ws), b = weekXp(prev), mx = 1, i;
    for (i = 0; i < 7; i++) mx = Math.max(mx, eco.xplog[addDays(ws, i)] || 0, eco.xplog[addDays(prev, i)] || 0);
    var days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
    var h = '<section class="card"><p class="ckind">La Ligue · ' + TIERS[eco.league.tier] + '</p><p class="htitle">Ти проти себе минулого тижня</p>';
    h += '<p class="clesson">Цей тиждень: <b>' + a + ' XP</b> · минулий: <b>' + b + ' XP</b>. ' + (a > b ? "Ти попереду, так тримати!" : "Ще " + (b - a + 1) + " XP, щоб обігнати себе.") + '</p>';
    h += '<div class="lchart" role="img" aria-label="XP по днях: цей і минулий тиждень">';
    for (i = 0; i < 7; i++) {
      var x1 = eco.xplog[addDays(ws, i)] || 0, x0 = eco.xplog[addDays(prev, i)] || 0;
      h += '<div class="lday"><div class="lbars"><i class="old" style="height:' + pct(x0, mx) + '%" title="' + x0 + '"></i><i class="new" style="height:' + pct(x1, mx) + '%" title="' + x1 + '"></i></div><span>' + days[i] + '</span></div>';
    }
    h += '</div><p class="legend"><span class="sw old"></span> минулий тиждень <span class="sw new"></span> цей тиждень</p>';
    h += '<div class="ltiers">' + TIERS.map(function (t, k) { return '<span class="' + (k === eco.league.tier ? "on" : "") + '">' + t + '</span>'; }).join("") + '</div>';
    h += '<p class="hint" style="margin:0;color:var(--muted)">У неділю ввечері: обігнав себе — ліга вище; менше половини минулого — на крок нижче.</p>' + backBtn("Профіль", "profile") + '</section>';
    stage.innerHTML = h;
  }

  /* La Carte: ten regions, one per month. */
  function renderMap() {
    var cur = seasonIdx(), h = '<section class="card"><p class="ckind">La Carte · подорож на 10 місяців</p><p class="htitle">Регіон ' + (Math.min(cur, 9) + 1) + ' з 10</p><ol class="map">';
    REGIONS.forEach(function (r, i) {
      var past = i < cur, now = i === cur % 10 && cur < 10, mk = (function () { var s = new Date(eco.start + "T12:00:00"); s.setMonth(s.getMonth() + i); return s.getFullYear() + "-" + (s.getMonth() + 1); })();
      var pc = eco.season[mk] && eco.season[mk].postcard;
      h += '<li class="reg' + (past ? " past" : "") + (now ? " now" : "") + '"><span class="dot">' + (pc ? "✉" : (past ? "✓" : i + 1)) + '</span><div><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + (pc ? " · листівку отримано" : "") + '</span></div>' + (now ? minouSvg(44) : "") + '</li>';
    });
    h += '</ol><p class="hint" style="margin:0;color:var(--muted)">Кожен місяць — новий регіон. Пройди 30 рівнів сезону, щоб отримати його листівку.</p>' + backBtn("Профіль", "profile") + '</section>';
    stage.innerHTML = h;
  }

  /* Profil. */
  function renderProfile() {
    var lv = levelOf(xp), sn = streakNow();
    var h = '<section class="card prof"><div class="phead">' + minouSvg(96) + '<div><p class="htitle">' + esc(eco.equip.title || titleOf(lv.n)) + '</p><p class="clesson">Рівень ' + lv.n + ' · ' + titleOf(lv.n) + ' · ' + xp + ' XP</p><div class="hbar"><i style="width:' + pct(xp - lv.from, lv.to - lv.from) + '%"></i></div><p class="clesson">Ще ' + (lv.to - xp) + ' XP до рівня ' + (lv.n + 1) + '</p></div></div>';
    h += '<div class="pstats"><div><b>' + sn + '</b><span>днів серії</span></div><div><b class="gold-t">' + eco.ecus + '</b><span>Écus</span></div><div><b>' + (eco.beaten || 0) + '</b><span>переможено помилок</span></div><div><b>' + Object.keys(eco.stamps).length + '</b><span>марок</span></div></div>';
    h += '<div class="plinks"><button type="button" class="tile t-gold" data-goto="shop"><b class="tsm">La Boutique</b><span>магазин за Écus</span></button><button type="button" class="tile t-lav" data-goto="season"><b class="tsm">La Saison</b><span>' + Math.min(30, Math.floor(seasonXp() / 300)) + '/30</span></button><button type="button" class="tile t-blue" data-goto="league"><b class="tsm">La Ligue</b><span>' + TIERS[eco.league.tier] + '</span></button><button type="button" class="tile t-mint" data-goto="map"><b class="tsm">La Carte</b><span>' + esc(REGIONS[seasonIdx() % 10][0]) + '</span></button></div></section>';
    h += '<section class="card"><p class="label" style="margin:0">Досягнення</p><div class="achs">';
    ACH.forEach(function (a) { var got = eco.ach["got_" + a.id], v = Math.min(a.goal, a.v()); h += '<div class="ach' + (got ? " got" : "") + '"><span class="apin">' + (got ? "★" : "☆") + '</span><b>' + esc(a.t) + '</b><span>' + esc(a.d) + '</span>' + (got ? '' : '<small>' + v + '/' + a.goal + '</small>') + '</div>'; });
    h += '</div></section>';
    var stampKeys = Object.keys(eco.stamps);
    h += '<section class="card"><p class="label" style="margin:0">Альбом марок (Timbres)</p>' + (stampKeys.length ? '<div class="stamps">' + stampKeys.map(function (k) { return '<span class="stamp' + (eco.stamps[k] === "rare" ? " rare" : "") + '">' + esc(SETS[k] ? SETS[k].label : k) + '</span>'; }).join("") + '</div>' : '<p class="hint" style="margin:0;color:var(--muted)">Марку дає урок теми на 3 зірки, рідкісну — підсумковий тест (Défi Boss).</p>') + '</section>';
    var acc = Object.keys(eco.stats).map(function (k) { var s = eco.stats[k]; return { k: k, n: s.c + s.w, p: Math.round(s.c / Math.max(1, s.c + s.w) * 100) }; }).filter(function (x) { return x.n >= 5 && SETS[x.k]; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 6);
    if (acc.length) {
      h += '<section class="card"><p class="label" style="margin:0">Точність: найслабші теми</p><ul class="accl">' + acc.map(function (x) { return '<li><span>' + esc(SETS[x.k].label) + '</span><div class="hbar"><i style="width:' + x.p + '%"></i></div><b>' + x.p + '%</b></li>'; }).join("") + '</ul></section>';
    }
    stage.innerHTML = h;
  }

  /* Bonus content: mini stories and scenarios. Free from level 16 (Résident), earlier when bought. */
  var STORIES = [
    { t: "Le premier jour", text: "Lundi matin, Olena commence un nouveau travail à Lausanne. Elle prend le bus de six heures et arrive en avance. Son chef, Monsieur Favre, lui montre l'atelier et lui présente ses collègues. À midi, ils mangent ensemble à la cantine. Olena ne comprend pas tout, mais elle pose des questions. Le soir, elle est fatiguée mais contente : demain, elle connaîtra déjà le chemin.",
      qs: [["Де Олена починає нову роботу?", ["У Лозанні", "У Женеві", "У Парижі"]], ["Коли вона приходить?", ["Раніше часу", "Із запізненням", "Опівдні"]], ["Хто показує їй майстерню?", ["Начальник", "Сусідка", "Водій автобуса"]], ["Що вони роблять опівдні?", ["Обідають у їдальні", "Ідуть додому", "Пишуть звіт"]], ["Як Олена почувається ввечері?", ["Втомлена, але задоволена", "Сумна", "Сердита"]]] },
    { t: "Chez le médecin", text: "Depuis trois jours, Marc a mal à la gorge et il tousse beaucoup. Il appelle le cabinet et prend un rendez-vous pour le lendemain. Le médecin l'examine, prend sa température et lui dit que ce n'est pas grave. Il lui prescrit un sirop et lui conseille de boire du thé chaud et de se reposer. Marc doit rester à la maison pendant deux jours.",
      qs: [["Що болить у Марка?", ["Горло", "Нога", "Спина"]], ["Як давно?", ["Три дні", "Тиждень", "Одну годину"]], ["Що каже лікар?", ["Нічого серйозного", "Треба в лікарню", "Треба операцію"]], ["Що він призначає?", ["Сироп", "Окуляри", "Нічого"]], ["Скільки днів Марк має бути вдома?", ["Два", "П'ять", "Жодного"]]] },
    { t: "Un samedi au marché", text: "Le samedi, Sophie va toujours au marché de Vevey. Elle achète des légumes, du fromage et du pain frais. Aujourd'hui, il fait beau et il y a beaucoup de monde. Au stand de fruits, elle rencontre son voisin Paul. Ils boivent un café ensemble au bord du lac. Avant de partir, Sophie achète des fleurs pour sa mère.",
      qs: [["Коли Софі ходить на ринок?", ["У суботу", "У понеділок", "Щодня"]], ["Що вона купує?", ["Овочі, сир і хліб", "Одяг", "Книжки"]], ["Яка сьогодні погода?", ["Гарна", "Іде дощ", "Сніг"]], ["Кого вона зустрічає?", ["Сусіда Поля", "Маму", "Лікаря"]], ["Що вона купує для мами?", ["Квіти", "Фрукти", "Каву"]]] }
  ];
  var SCENARIOS = [
    { t: "Chez le médecin · В лікаря", ph: [["J'ai pris rendez-vous pour 10 heures.", "Я записаний на 10:00."], ["J'ai mal à la tête depuis deux jours.", "У мене два дні болить голова."], ["J'ai de la fièvre.", "У мене температура."], ["Je tousse beaucoup la nuit.", "Я сильно кашляю вночі."], ["Je suis allergique à la pénicilline.", "У мене алергія на пеніцилін."], ["Combien de fois par jour dois-je le prendre ?", "Скільки разів на день це приймати?"], ["Pouvez-vous me faire un certificat médical ?", "Можете дати мені медичну довідку?"], ["Est-ce que c'est remboursé par l'assurance ?", "Чи це покриває страховка?"], ["Je travaille de nuit, est-ce un problème ?", "Я працюю вночі, це проблема?"], ["Merci, docteur. Bonne journée !", "Дякую, лікарю. Гарного дня!"]] },
    { t: "Au travail · На зміні", ph: [["Je commence à six heures ce matin.", "Я починаю сьогодні о шостій."], ["Je suis de nuit cette semaine.", "Цього тижня я в нічну зміну."], ["Est-ce que tu peux échanger ton horaire avec moi ?", "Можеш помінятися зі мною зміною?"], ["La machine est en panne.", "Машина зламалася."], ["Où est-ce que je mets ces cartons ?", "Куди мені поставити ці коробки?"], ["J'ai fini ma pause.", "Я закінчив перерву."], ["Peux-tu répéter plus lentement, s'il te plaît ?", "Можеш повторити повільніше?"], ["Je dois partir plus tôt aujourd'hui.", "Мені сьогодні треба піти раніше."], ["Qui est responsable de l'équipe ?", "Хто відповідає за бригаду?"], ["Bonne fin de service !", "Гарного кінця зміни!"]] },
    { t: "À la préfecture · В установі", ph: [["Je voudrais renouveler mon permis de séjour.", "Я хотів би продовжити дозвіл на проживання."], ["Quels documents faut-il apporter ?", "Які документи треба принести?"], ["Voici mon passeport et mon contrat de travail.", "Ось мій паспорт і трудовий договір."], ["Il me manque une photo d'identité.", "Мені бракує фото на документи."], ["Faut-il prendre un rendez-vous ?", "Чи треба записуватися?"], ["Combien coûte la demande ?", "Скільки коштує заява?"], ["Je n'ai pas bien compris le formulaire.", "Я не зовсім зрозумів анкету."], ["Pouvez-vous m'aider à le remplir ?", "Чи можете допомогти мені її заповнити?"], ["Quand est-ce que je recevrai la réponse ?", "Коли я отримаю відповідь?"], ["Je vous remercie de votre aide.", "Дякую вам за допомогу."]] }
  ];
  function bonusOpen(id) { return levelOf(xp).n >= 16 || eco.owned[id]; }
  var storyIdx = 0, storyAns = {};
  function renderStory() {
    if (!bonusOpen("histoire")) { lockedBonus("histoire", "Mini-histoire"); return; }
    var st = STORIES[storyIdx % STORIES.length];
    var h = '<section class="card story"><p class="ckind">Mini-histoire ' + (storyIdx % STORIES.length + 1) + ' з ' + STORIES.length + '</p><p class="htitle">' + esc(st.t) + '</p>';
    h += '<p class="stext">' + wrapWords(st.text) + '</p><div class="actions">' + sayBtn(st.text, "") + '</div>';
    st.qs.forEach(function (q, i) {
      var key = storyIdx + ":" + i, a = storyAns[key];
      h += '<div class="sq"><p><b>' + (i + 1) + '.</b> ' + esc(q[0]) + '</p><div class="qopts">';
      var opts = q[1].slice().sort();
      opts.forEach(function (o) { var cls = a ? (o === q[1][0] ? " good" : (o === a ? " bad" : "")) : ""; h += '<button type="button" class="opt' + cls + '" data-sq="' + i + '" data-v="' + esc(o) + '"' + (a ? " disabled" : "") + '>' + esc(o) + '</button>'; });
      h += '</div></div>';
    });
    h += '<div class="actions"><button type="button" class="btn ghost" id="snext">Наступна історія →</button>' + backBtn("На головну", "home") + '</div></section>';
    stage.innerHTML = h;
    stage.querySelector(".story").addEventListener("click", function (e) {
      var b = e.target.closest("[data-sq]");
      if (b) { var i = +b.getAttribute("data-sq"), v = b.getAttribute("data-v"), ok = v === st.qs[i][1][0]; storyAns[storyIdx + ":" + i] = v; if (ok) gain(10, 1); answerFx(ok, ""); bumpDay(); renderStory(); }
      if (e.target.closest("#snext")) { storyIdx++; renderStory(); window.scrollTo(0, 0); }
    });
  }
  var scenIdx = 0;
  function renderScenario() {
    if (!bonusOpen("scenario")) { lockedBonus("scenario", "Scénario"); return; }
    var sc = SCENARIOS[scenIdx % SCENARIOS.length];
    var h = '<section class="card"><p class="ckind">Scénario</p><div class="seg wide" role="group">' + SCENARIOS.map(function (s, i) { return '<button type="button" class="segbtn" data-scn="' + i + '" aria-pressed="' + (i === scenIdx) + '">' + esc(s.t.split(" · ")[1]) + '</button>'; }).join("") + '</div><p class="htitle">' + esc(sc.t) + '</p><ul class="phr">';
    sc.ph.forEach(function (p) { h += '<li><div><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></div>' + sayBtn(p[0], "vsay") + '</li>'; });
    h += '</ul>' + backBtn("На головну", "home") + '</section>';
    stage.innerHTML = h;
    stage.querySelectorAll("[data-scn]").forEach(function (b) { b.addEventListener("click", function () { scenIdx = +b.getAttribute("data-scn"); renderScenario(); }); });
  }
  function lockedBonus(id, name) {
    var it = shopItem(id);
    stage.innerHTML = '<section class="card"><p class="ckind">' + name + '</p><div class="empty">' + minouSvg(84) + '<p>Відкривається безкоштовно з рівня 16 (Résident). Зараз у тебе рівень ' + levelOf(xp).n + '. Можна відкрити раніше в магазині за <b>' + priceOf(it) + ' Écus</b>.</p></div><div class="actions"><button type="button" class="btn gold" id="lbuy">Відкрити за ' + priceOf(it) + '</button>' + backBtn("На головну", "home") + '</div></section>';
    document.getElementById("lbuy").addEventListener("click", function () { if (buy(id)) openPage(id === "histoire" ? "story" : "scenario"); });
  }

  /* Welcome back after a break: gift, never blame. */
  function greetReturn() {
    var t = todayS(), last = eco.last;
    eco.last = t;
    if (last && last !== t && daysBetween(last, t) >= 3 && eco.greeted !== t) {
      eco.greeted = t; eco.ecus += 30; ecoSave(); refreshGame();
      modal('<div class="empty">' + minouSvg(96, "wow") + '<p class="htitle">Bon retour !</p><p>Minou скучав. Ось подарунок: <b>+30 Écus</b>. Почнімо з легкого розігріву.</p></div>' +
        (canRepair() ? '<p class="hint">Серію можна відновити в магазині («Réparation»).</p>' : '') + '<button type="button" class="btn big" data-close="1">Allons-y !</button>');
    }
    ecoSave();
  }

  var PAGES = { errors: renderErrorsPage, defi: renderDefi, shop: renderShop, season: renderSeason, league: renderLeague, map: renderMap, profile: renderProfile, story: renderStory, scenario: renderScenario };


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
    inPage = "";
    inSettings = true; inHome = false; inDaily = false; inErrors = false; inVocab = false; inGram = false;
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
      h += chromeHint("Озвучка недоступна в цьому вікні: вбудований браузер застосунку Claude на Android не вміє читати текст уголос. У Chrome вона працює.");
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

  protectStreak(); leagueUpdate(); seasonCheck(); questsToday();
  (function () {
    var lt = lastTarget();
    currentKey = lt.k; currentLesson = lt.l;
    lastSet[SETS[lt.k].group] = lt.k;
  })();
  openHome();
  setTimeout(greetReturn, 300);
})();
