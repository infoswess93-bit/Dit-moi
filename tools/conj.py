"""Відмінювання французьких дієслів для генератора вправ (tools/gen_tenses.py).

Особи: 0 je, 1 tu, 2 il/elle, 3 nous, 4 vous, 5 ils/elles.
"""

VOWELS = "aeiouyhâàéèêëîïôûœ"

# Дієслова з неправильними формами: теперішній час (6 форм), participe passé, допоміжне,
# основа futur, і за потреби subjonctif / основа imparfait.
IRR = {
    "être": dict(pres="suis es est sommes êtes sont", pp="été", aux="a", fut="ser", imp="ét",
                 subj="sois sois soit soyons soyez soient"),
    "avoir": dict(pres="ai as a avons avez ont", pp="eu", aux="a", fut="aur",
                  subj="aie aies ait ayons ayez aient"),
    "aller": dict(pres="vais vas va allons allez vont", pp="allé", aux="e", fut="ir",
                  subj="aille ailles aille allions alliez aillent"),
    "faire": dict(pres="fais fais fait faisons faites font", pp="fait", aux="a", fut="fer",
                  subj="fasse fasses fasse fassions fassiez fassent"),
    "pouvoir": dict(pres="peux peux peut pouvons pouvez peuvent", pp="pu", aux="a", fut="pourr",
                    subj="puisse puisses puisse puissions puissiez puissent"),
    "vouloir": dict(pres="veux veux veut voulons voulez veulent", pp="voulu", aux="a", fut="voudr",
                    subj="veuille veuilles veuille voulions vouliez veuillent"),
    "savoir": dict(pres="sais sais sait savons savez savent", pp="su", aux="a", fut="saur",
                   subj="sache saches sache sachions sachiez sachent"),
    "devoir": dict(pres="dois dois doit devons devez doivent", pp="dû", aux="a", fut="devr"),
    "venir": dict(pres="viens viens vient venons venez viennent", pp="venu", aux="e", fut="viendr"),
    "revenir": dict(pres="reviens reviens revient revenons revenez reviennent", pp="revenu", aux="e", fut="reviendr"),
    "devenir": dict(pres="deviens deviens devient devenons devenez deviennent", pp="devenu", aux="e", fut="deviendr"),
    "tenir": dict(pres="tiens tiens tient tenons tenez tiennent", pp="tenu", aux="a", fut="tiendr"),
    "obtenir": dict(pres="obtiens obtiens obtient obtenons obtenez obtiennent", pp="obtenu", aux="a", fut="obtiendr"),
    "prendre": dict(pres="prends prends prend prenons prenez prennent", pp="pris", aux="a", fut="prendr"),
    "apprendre": dict(pres="apprends apprends apprend apprenons apprenez apprennent", pp="appris", aux="a", fut="apprendr"),
    "comprendre": dict(pres="comprends comprends comprend comprenons comprenez comprennent", pp="compris", aux="a", fut="comprendr"),
    "mettre": dict(pres="mets mets met mettons mettez mettent", pp="mis", aux="a", fut="mettr"),
    "lire": dict(pres="lis lis lit lisons lisez lisent", pp="lu", aux="a", fut="lir"),
    "écrire": dict(pres="écris écris écrit écrivons écrivez écrivent", pp="écrit", aux="a", fut="écrir"),
    "dire": dict(pres="dis dis dit disons dites disent", pp="dit", aux="a", fut="dir"),
    "voir": dict(pres="vois vois voit voyons voyez voient", pp="vu", aux="a", fut="verr"),
    "partir": dict(pres="pars pars part partons partez partent", pp="parti", aux="e", fut="partir"),
    "sortir": dict(pres="sors sors sort sortons sortez sortent", pp="sorti", aux="e", fut="sortir"),
    "dormir": dict(pres="dors dors dort dormons dormez dorment", pp="dormi", aux="a", fut="dormir"),
    "servir": dict(pres="sers sers sert servons servez servent", pp="servi", aux="a", fut="servir"),
    "ouvrir": dict(pres="ouvre ouvres ouvre ouvrons ouvrez ouvrent", pp="ouvert", aux="a", fut="ouvrir"),
    "offrir": dict(pres="offre offres offre offrons offrez offrent", pp="offert", aux="a", fut="offrir"),
    "découvrir": dict(pres="découvre découvres découvre découvrons découvrez découvrent", pp="découvert", aux="a", fut="découvrir"),
    "recevoir": dict(pres="reçois reçois reçoit recevons recevez reçoivent", pp="reçu", aux="a", fut="recevr"),
    "boire": dict(pres="bois bois boit buvons buvez boivent", pp="bu", aux="a", fut="boir"),
    "connaître": dict(pres="connais connais connaît connaissons connaissez connaissent", pp="connu", aux="a", fut="connaîtr"),
    "croire": dict(pres="crois crois croit croyons croyez croient", pp="cru", aux="a", fut="croir"),
    "vivre": dict(pres="vis vis vit vivons vivez vivent", pp="vécu", aux="a", fut="vivr"),
    "suivre": dict(pres="suis suis suit suivons suivez suivent", pp="suivi", aux="a", fut="suivr"),
    "courir": dict(pres="cours cours court courons courez courent", pp="couru", aux="a", fut="courr"),
    "conduire": dict(pres="conduis conduis conduit conduisons conduisez conduisent", pp="conduit", aux="a", fut="conduir"),
    "construire": dict(pres="construis construis construit construisons construisez construisent", pp="construit", aux="a", fut="construir"),
    "traduire": dict(pres="traduis traduis traduit traduisons traduisez traduisent", pp="traduit", aux="a", fut="traduir"),
    "rire": dict(pres="ris ris rit rions riez rient", pp="ri", aux="a", fut="rir"),
    "envoyer": dict(pres="envoie envoies envoie envoyons envoyez envoient", pp="envoyé", aux="a", fut="enverr"),
    "payer": dict(pres="paie paies paie payons payez paient", pp="payé", aux="a", fut="paier"),
    "nettoyer": dict(pres="nettoie nettoies nettoie nettoyons nettoyez nettoient", pp="nettoyé", aux="a", fut="nettoier"),
    "acheter": dict(pres="achète achètes achète achetons achetez achètent", pp="acheté", aux="a", fut="achèter"),
    "appeler": dict(pres="appelle appelles appelle appelons appelez appellent", pp="appelé", aux="a", fut="appeller"),
    "préférer": dict(pres="préfère préfères préfère préférons préférez préfèrent", pp="préféré", aux="a", fut="préférer"),
    "répéter": dict(pres="répète répètes répète répétons répétez répètent", pp="répété", aux="a", fut="répéter"),
    "lever": dict(pres="lève lèves lève levons levez lèvent", pp="levé", aux="a", fut="lèver"),
    "pleuvoir": dict(pres="pleus pleus pleut pleuvons pleuvez pleuvent", pp="plu", aux="a", fut="pleuvr"),
    "naître": dict(pres="nais nais naît naissons naissez naissent", pp="né", aux="e", fut="naîtr"),
    "plaire": dict(pres="plais plais plaît plaisons plaisez plaisent", pp="plu", aux="a", fut="plair"),
    "falloir": dict(pres="faut faut faut faut faut faut", pp="fallu", aux="a", fut="faudr", imp="fall",
                    subj="faille faille faille faille faille faille"),
    "finir": dict(pres="finis finis finit finissons finissez finissent", pp="fini", aux="a", fut="finir"),
}

# -ir з -iss- (2 група)
IR2 = ["choisir", "réussir", "remplir", "grandir", "réfléchir", "réagir", "maigrir", "grossir", "agir", "bâtir", "obéir", "punir", "rougir", "saisir", "garantir"]
# -re з основою без змін (attendre)
RE3 = ["attendre", "vendre", "répondre", "entendre", "perdre", "descendre", "rendre", "défendre", "mordre", "tondre"]
ETRE = {"aller", "venir", "revenir", "devenir", "arriver", "partir", "sortir", "entrer", "rentrer", "rester",
        "tomber", "monter", "descendre", "retourner", "naître", "mourir", "passer_e"}

PRON = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"]
IMP_END = ["ais", "ais", "ait", "ions", "iez", "aient"]
FUT_END = ["ai", "as", "a", "ons", "ez", "ont"]
SUBJ_END = ["e", "es", "e", "ions", "iez", "ent"]


def info(v):
    if v in IRR:
        d = dict(IRR[v])
        d["pres"] = d["pres"].split()
        if "subj" in d:
            d["subj"] = d["subj"].split()
        return d
    if v in IR2:
        st = v[:-2]
        return dict(pres=[st + e for e in ["is", "is", "it", "issons", "issez", "issent"]], pp=st + "i",
                    aux="a", fut=v)
    if v in RE3:
        st = v[:-2]
        return dict(pres=[st + e for e in ["s", "s", "", "ons", "ez", "ent"]], pp=st + "u",
                    aux="e" if v in ETRE else "a", fut=v[:-1])
    if v.endswith("er"):
        st = v[:-2]
        pres = [st + e for e in ["e", "es", "e", "ons", "ez", "ent"]]
        if v.endswith("ger"):
            pres[3] = st + "eons"
        if v.endswith("cer"):
            pres[3] = st[:-1] + "çons"
        return dict(pres=pres, pp=st + "é", aux="e" if v in ETRE else "a", fut=v)
    raise KeyError("Немає дієслова в таблиці: " + v)


def present(v, p):
    return info(v)["pres"][p]


def imp_stem(v):
    d = info(v)
    if "imp" in d:
        return d["imp"]
    return d["pres"][3][:-3]


def imparfait(v, p):
    st = imp_stem(v)
    if v.endswith("ger") and IMP_END[p][0] == "i":
        st = st[:-1]  # mangeais / mangions
    if v.endswith("cer") and IMP_END[p][0] == "i":
        st = st[:-1] + "c"  # commençais / commencions
    return st + IMP_END[p]


def futur(v, p):
    return info(v)["fut"] + FUT_END[p]


def cond(v, p):
    return info(v)["fut"] + IMP_END[p]


def subj(v, p):
    d = info(v)
    if "subj" in d:
        return d["subj"][p]
    sing = d["pres"][5][:-3]  # ils parlent -> parl
    plur = d["pres"][3][:-3]  # nous parlons -> parl
    if v.endswith("ger"):
        plur = plur[:-1]
    if v.endswith("cer"):
        plur = plur[:-1] + "c"
    return (sing if p in (0, 1, 2, 5) else plur) + SUBJ_END[p]


def aux_of(v):
    return info(v)["aux"]


def agree(pp, g, p):
    """g: 'm' або 'f'; множина для осіб 3,4,5."""
    s = pp
    if g == "f":
        s += "e"
    if p >= 3 and not s.endswith("s"):
        s += "s"
    return s


def pc(v, p, g="m"):
    d = info(v)
    if d["aux"] == "e":
        return present("être", p) + " " + agree(d["pp"], g, p)
    return present("avoir", p) + " " + d["pp"]


def futur_proche(v, p):
    return present("aller", p) + " " + v


def starts_vowel(s):
    return s[:1].lower() in VOWELS
