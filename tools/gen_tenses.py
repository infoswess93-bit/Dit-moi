"""Генерує data/tenses-more.js з речень у tools/items/<час>.txt.

Рядок у файлі: pre|post|дієслово|особа|переклад
  особа: 1s 2s 3m 3f 1p 2p 3pm 3pf (жін. рід для je/tu/nous/vous: 1sf 2sf 1pf 2pf)
  "je " у кінці pre сам стає "j'" перед голосною.
Відповідь, 3 неправильні варіанти й пояснення рахуються з tools/conj.py.
Запуск: python3 tools/gen_tenses.py
"""
import json
import re
import sys
import pathlib

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from conj import (info, present, imparfait, futur, cond, subj, pc, futur_proche, agree,
                  starts_vowel, imp_stem, IR2, RE3, IMP_END, FUT_END)

ROOT = pathlib.Path(__file__).resolve().parent.parent
PERS = {"1s": (0, "m"), "1sf": (0, "f"), "2s": (1, "m"), "2sf": (1, "f"), "3m": (2, "m"), "3f": (2, "f"),
        "1p": (3, "m"), "1pf": (3, "f"), "2p": (4, "m"), "2pf": (4, "f"), "3pm": (5, "m"), "3pf": (5, "f")}
SUBJ_NAME = {"1s": "je", "1sf": "je", "2s": "tu", "2sf": "tu", "3m": "il", "3f": "elle", "1p": "nous", "1pf": "nous",
             "2p": "vous", "2pf": "vous", "3pm": "ils", "3pf": "elles"}
ALT = {0: 2, 1: 2, 2: 0, 3: 5, 4: 3, 5: 2}
ALTS = {0: [2, 3, 5], 1: [2, 4, 0], 2: [5, 0, 3], 3: [4, 2, 5], 4: [3, 2, 1], 5: [2, 3, 0]}
FAKE_PP = {"prendre": "prendu", "apprendre": "apprendu", "comprendre": "comprendu", "mettre": "mettu",
           "écrire": "écrivé", "dire": "disé", "lire": "lisé", "faire": "faisé", "voir": "voyé", "ouvrir": "ouvri",
           "offrir": "offri", "découvrir": "découvri", "venir": "veni", "revenir": "reveni", "devenir": "deveni",
           "tenir": "teni", "obtenir": "obteni", "recevoir": "recevu", "boire": "buvé", "connaître": "connaissé",
           "croire": "croyé", "vivre": "vivu", "suivre": "suivu", "courir": "couri", "conduire": "conduisé",
           "construire": "construisé", "traduire": "traduisé", "partir": "partu", "sortir": "sortu",
           "dormir": "dormu", "servir": "servu", "avoir": "avu", "pouvoir": "pouvu", "vouloir": "voulé",
           "savoir": "savu", "devoir": "devu", "rire": "rit", "être": "étu", "pleuvoir": "pleuvu"}


def cap(s):
    return s[:1].upper() + s[1:]


def fake_pp(v):
    if v in FAKE_PP:
        return FAKE_PP[v]
    if v in IR2:
        return v[:-2] + "é"
    if v in RE3:
        return v[:-2] + "é"
    if v.endswith("er"):
        return v  # «a parler»
    return None


def fake_fut(v, p):
    st = info(v)["fut"]
    if v.endswith("re") and st == v[:-1]:
        return v[:-2] + "er" + FUT_END[p]  # répondera
    if st not in (v, v[:-1]):
        return (v[:-1] if v.endswith("re") else v) + FUT_END[p]  # venirai, allerai
    return None


def why_and_opts(tense, v, code, ans):
    p, g = PERS[code]
    d = info(v)
    nm = SUBJ_NAME[code]
    c = []
    if tense == "pc":
        pp = d["pp"]
        if d["aux"] == "e":
            c += [present("avoir", p) + " " + pp,
                  present("être", p) + " " + (pp if ans.split()[-1] != pp else agree(pp, "f", p)),
                  present("être", p) + " " + agree(pp, "m" if g == "f" else "f", p)]
            why = cap(v) + " з être, тож participe passé узгоджується з підметом " + nm + ": " + ans.split()[-1] + "."
        else:
            c += [present("être", p) + " " + agree(pp, g, p)]
            if fake_pp(v):
                c.append(present("avoir", p) + " " + fake_pp(v))
            c += [present("avoir", p) + " " + agree(pp, "f", p), imparfait(v, p)]
            why = cap(v) + " з avoir. Participe passé: " + pp + "."
        c.append(imparfait(v, p))
    elif tense == "imp":
        c += [imparfait(v, ALT[p]), pc(v, p, g), cond(v, p), present(v, p)]
        if v == "être":
            why = "Être в imparfait має особливу основу ét-: " + nm + " " + ans + "."
        else:
            st = imp_stem(v)
            why = "Основа від nous " + present(v, 3) + ": " + st + "-. " + cap(nm) + " → -" + IMP_END[p] + "."
            if v.endswith("ger") or v.endswith("cer"):
                why += " Перед -i- основа без " + ("e" if v.endswith("ger") else "ç") + "."
    elif tense == "fp":
        c += [present("aller", ALT[p]) + " " + v, present("aller", p) + " " + d["pp"],
              present("avoir", p) + " " + v, present("aller", ALTS[p][1]) + " " + v]
        why = cap(nm) + " → " + present("aller", p) + " + інфінітив " + v + "."
    elif tense == "fs":
        c += [cond(v, p), futur(v, ALT[p])]
        if fake_fut(v, p):
            c.append(fake_fut(v, p))
        c += [imparfait(v, p), present(v, p)]
        st = d["fut"]
        if st in (v, v[:-1]):
            why = cap(v) + " → " + st + "- + " + FUT_END[p] + ". " + cap(cond(v, p)) + " це conditionnel."
        else:
            why = "Неправильна основа майбутнього: " + v + " → " + st + "-. " + cap(nm) + " → -" + FUT_END[p] + "."
    elif tense == "prs":
        for q in ALTS[p] + [x for x in range(6) if x not in ALTS[p] and x != p]:
            c.append(present(v, q))
        c.append(v)
        if v in IR2 or v == "finir":
            why = "Дієслово 2 групи: " + nm + " " + ans + (" (у множині -iss-)." if p >= 3 else ".")
        elif v.endswith("er") and v not in ("aller",):
            why = "Дієслово на -er: " + nm + " → -" + ["e", "es", "e", "ons", "ez", "ent"][p] + ": " + ans + "."
        else:
            why = cap(v) + " — неправильне дієслово: " + nm + " " + ans + "."
    elif tense == "cond":
        c += [futur(v, p), imparfait(v, p), present(v, p), cond(v, ALT[p])]
        why = "Основа майбутнього " + d["fut"] + "- + закінчення imparfait -" + IMP_END[p] + ": " + ans + "."
    elif tense == "sbj":
        c += [present(v, p), futur(v, p), imparfait(v, p), cond(v, p), subj(v, ALT[p])]
        q = "que j'" if (p == 0 and starts_vowel(ans)) else ("qu'" + nm if nm[0] in "ie" else "que " + nm)
        q = q if q.endswith("'") else q + " "
        why = "Цей зворот вимагає subjonctif: " + v + " → " + q + ans + "."
    opts = [ans]
    for x in c:
        if x and x.lower() != ans.lower() and x.lower() not in [o.lower() for o in opts]:
            opts.append(x)
        if len(opts) == 4:
            break
    assert len(opts) == 4, (tense, v, code, opts)
    return why, opts


def answer(tense, v, code):
    p, g = PERS[code]
    return {"pc": lambda: pc(v, p, g), "imp": lambda: imparfait(v, p), "fp": lambda: futur_proche(v, p),
            "fs": lambda: futur(v, p), "prs": lambda: present(v, p), "cond": lambda: cond(v, p),
            "sbj": lambda: subj(v, p)}[tense]()


NAMES = {"pc": ("PC", 6), "imp": ("IMP", 6), "fp": ("FP", 6), "fs": ("FS", 6),
         "prs": ("T3_PRS", 2), "cond": ("T3_COND", 2), "sbj": ("T3_SBJ", 2)}


def main():
    existing = set()
    for f in ("tenses.js", "tenses2.js", "topics.js"):
        for m in re.finditer(r'pre: "((?:[^"\\]|\\.)*)", post: "((?:[^"\\]|\\.)*)"', (ROOT / "data" / f).read_text("utf-8")):
            existing.add((m.group(1).strip().lower(), m.group(2).strip().lower()))
    out = ["/* Згенеровано tools/gen_tenses.py з tools/items/*.txt. Не редагуйте вручну: змініть .txt і запустіть генератор. */"]
    seen = set()
    problems = []
    for tense, (nm, first) in NAMES.items():
        lines = [l for l in (ROOT / "tools" / "items" / (tense + ".txt")).read_text("utf-8").splitlines()
                 if l.strip() and not l.startswith("#")]
        if len(lines) != 100:
            problems.append(f"{tense}: {len(lines)} рядків замість 100")
        items = []
        for ln in lines:
            parts = ln.split("|")
            if len(parts) != 5:
                problems.append("формат: " + ln)
                continue
            pre, post, v, code, tr = parts
            ans = answer(tense, v, code)
            if PERS[code][0] == 0 and starts_vowel(ans):
                pre = re.sub(r"\b([Jj])e $", r"\1'", pre)
            key = (pre.strip().lower(), post.strip().lower())
            if key in existing or key in seen:
                problems.append("повтор: " + pre + "___" + post)
            seen.add(key)
            why, opts = why_and_opts(tense, v, code, ans)
            items.append(dict(pre=pre, post=post, verb=v, tr=tr.strip(), a=[ans], o=opts, why=why))
        for k in range(0, len(items), 20):
            out.append("var " + nm + str(first + k // 20) + " = [")
            for it in items[k:k + 20]:
                out.append("  " + json.dumps(it, ensure_ascii=False) + ",")
            out.append("];")
    (ROOT / "data" / "tenses-more.js").write_text("\n".join(out) + "\n", "utf-8")
    print("\n".join(problems) or "OK")


if __name__ == "__main__":
    main()
