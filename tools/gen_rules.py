"""Генерує data/rules.js — вправи на граматичні правила за рівнями — з tools/rules/*.txt.

Формат файлу:
  @ ключ | точна назва правила в довіднику (data/grammar.js) | коротка назва теми
  recap: коротке нагадування (HTML, один рядок)
  початок|ВІДПОВІДЬ|кінець|підказка|переклад|неправильний1;неправильний2;неправильний3|пояснення
  або коротко: початок|кінець|підказка|переклад|ВІДПОВІДЬ;неправильний1;неправильний2;неправильний3|пояснення
Ключі не змінювати й не видаляти: від них залежить прогрес. Нові теми додавати в кінець файлу.
Запуск: python3 tools/gen_rules.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def main():
    gram = (ROOT / "data" / "grammar.js").read_text("utf-8")
    titles = set(re.findall(r'^T\("[AB][12]", "[^"]*", "([^"]*)"', gram, re.M))
    existing = set()
    for f in ("tenses.js", "tenses2.js", "topics.js", "tenses-more.js"):
        for m in re.finditer(r'"?pre"?: "((?:[^"\\]|\\.)*)", "?post"?: "((?:[^"\\]|\\.)*)"', (ROOT / "data" / f).read_text("utf-8")):
            existing.add((m.group(1).strip().lower(), m.group(2).strip().lower()))
    sets, problems, keys = [], [], set()
    for path in sorted((ROOT / "tools" / "rules").glob("*.txt")):
        cur = None
        for n, ln in enumerate(path.read_text("utf-8").splitlines(), 1):
            if not ln.strip() or ln.startswith("#"):
                continue
            where = f"{path.name}:{n}"
            if ln.startswith("@"):
                key, ref, label = [x.strip() for x in ln[1:].split("|")]
                if key in keys:
                    problems.append(f"{where}: ключ {key} уже є")
                if ref not in titles:
                    problems.append(f"{where}: немає правила «{ref}» у довіднику")
                keys.add(key)
                cur = dict(key=key, gramRef=ref, label=label, recap="", items=[])
                sets.append(cur)
                continue
            if ln.startswith("recap:"):
                cur["recap"] = ln[6:].strip()
                continue
            parts = ln.split("|")
            if len(parts) == 6:  # коротка форма: правильна відповідь перша серед варіантів
                pre, post, hint, tr, opts, why = parts
                op = [w.strip() for w in opts.split(";") if w.strip()]
                ans, ws = (op[0] if op else ""), op[1:]
            elif len(parts) == 7:
                pre, ans, post, hint, tr, wrongs, why = parts
                ws = [w.strip() for w in wrongs.split(";") if w.strip()]
            else:
                problems.append(f"{where}: {len(parts)} полів замість 7")
                continue
            if len(ws) != 3 or ans.strip() in ws or len(set(ws)) != 3:
                problems.append(f"{where}: потрібно 3 різні неправильні варіанти, без правильного")
            k = (pre.strip().lower(), post.strip().lower())
            if k in existing:
                problems.append(f"{where}: повтор речення")
            existing.add(k)
            cur["items"].append(dict(pre=pre, post=post, verb=hint.strip(), tr=tr.strip(), a=[ans.strip()],
                                     o=[ans.strip()] + ws, why=why.strip()))
    for s in sets:
        if len(s["items"]) % 10 or not s["items"]:
            problems.append(f"{s['key']}: {len(s['items'])} вправ (потрібно кратно 10)")
    out = ["/* Згенеровано tools/gen_rules.py з tools/rules/*.txt. Не редагуйте вручну. */",
           "var RULESETS = ["]
    for s in sets:
        out.append("  " + json.dumps(s, ensure_ascii=False) + ",")
    out.append("];")
    out.append("""(function () {
  var lv = {};
  for (var i = 0; i < GRAM.length; i++) lv[GRAM[i].t] = GRAM[i].lv;
  for (var j = 0; j < RULESETS.length; j++) {
    var r = RULESETS[j];
    if (SETS[r.key]) continue;
    var lessons = [];
    for (var k = 0; k < r.items.length; k += 20) lessons.push(r.items.slice(k, k + 20));
    SETS[r.key] = { label: r.label, group: "topics", gramRef: r.gramRef, placeholder: "Напишіть відповідь",
      lessons: lessons, recap: r.recap, next: "Можна переходити до наступного правила цього рівня." };
  }
  for (var key in SETS) { if (!SETS[key].level) SETS[key].level = lv[SETS[key].gramRef] || "A1"; }
})();""")
    (ROOT / "data" / "rules.js").write_text("\n".join(out) + "\n", "utf-8")
    total = sum(len(s["items"]) for s in sets)
    print("\n".join(problems) or f"OK: {len(sets)} тем, {total} вправ")


if __name__ == "__main__":
    main()
