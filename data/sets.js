/* Реєстр розділів. Порядок ключів і списків у lessons не змінювати: від них залежать id вправ і збережений прогрес. Нові списки додавати лише в кінець. */
var SETS = {
  pc: {
    label: "Passé composé", group: "tenses", gramRef: "Passé composé",
    lessons: [PC, PC2, PC3, PC4, PC5],
    recap:
      '<p class="formula">avoir / être (présent) + participe passé</p>' +
      '<p>З <b>avoir</b> більшість дієслів. Participe passé не змінюється, якщо немає COD перед дієсловом.</p>' +
      '<p>З <b>être</b> дієслова руху та зміни стану, а також усі займенникові дієслова. Participe passé узгоджується з підметом: <i>elle est allée, ils sont partis</i>.</p>' +
      '<p>Дієслова з être (мнемоніка DR &amp; MRS VANDERTRAMP):</p>' +
      '<div class="mnemonic"><span>devenir</span><span>revenir</span><span>monter</span><span>rester</span><span>sortir</span><span>venir</span><span>aller</span><span>naître</span><span>descendre</span><span>entrer</span><span>rentrer</span><span>tomber</span><span>retourner</span><span>arriver</span><span>mourir</span><span>partir</span></div>' +
      '<p>Заперечення охоплює допоміжне дієслово: <i>je <b>n\'</b>ai <b>pas</b> fini</i>.</p>',
    next: "Можна переходити до розділу Imparfait."
  },
  imp: {
    label: "Imparfait", group: "tenses", gramRef: "Imparfait",
    lessons: [IMP, IMP2, IMP3, IMP4, IMP5],
    recap:
      '<p class="formula">основа від nous (présent) без -ons + закінчення</p>' +
      '<div class="mnemonic"><span>je -ais</span><span>tu -ais</span><span>il -ait</span><span>nous -ions</span><span>vous -iez</span><span>ils -aient</span></div>' +
      '<p>Imparfait: <b>звичка</b> (<i>chaque jour, souvent, avant</i>), <b>опис і фон</b> (<i>il faisait froid</i>), <b>тривала дія</b>, яку перериває коротка подія в passé composé.</p>' +
      '<p>Виняток: <b>être</b> має основу ét-: <i>j\'étais, nous étions</i>.</p>' +
      '<p>Правопис: <i>manger → je mangeais, nous mangions</i>; <i>commencer → je commençais, nous commencions</i>; <i>étudier → nous étudiions</i>.</p>',
    next: "Можна переходити до розділу Futur proche."
  },
  fp: {
    label: "Futur proche", group: "tenses", gramRef: "Futur proche та passé récent",
    lessons: [FP, FP2, FP3, FP4, FP5],
    recap:
      '<p class="formula">aller (présent) + інфінітив</p>' +
      '<div class="mnemonic"><span>je vais</span><span>tu vas</span><span>il / elle / on va</span><span>nous allons</span><span>vous allez</span><span>ils / elles vont</span></div>' +
      '<p>Futur proche: <b>близьке або вже заплановане</b> майбутнє, а також те, що очевидно станеться (<i>il va pleuvoir</i>).</p>' +
      '<p>Заперечення обгортає aller: <i>je <b>ne</b> vais <b>pas</b> venir</i>. Перед голосною: <i>nous <b>n\'</b>allons pas</i>.</p>' +
      '<p>Займенники стоять перед інфінітивом: <i>je vais <b>lui</b> parler</i>, <i>ils vont <b>se</b> lever</i>.</p>',
    next: "Можна переходити до розділу Futur simple."
  },
  fs: {
    label: "Futur simple", group: "tenses", gramRef: "Futur simple",
    lessons: [FS, FS2, FS3, FS4, FS5],
    recap:
      '<p class="formula">інфінітив (у -re без e) + закінчення</p>' +
      '<div class="mnemonic"><span>je -ai</span><span>tu -as</span><span>il -a</span><span>nous -ons</span><span>vous -ez</span><span>ils -ont</span></div>' +
      '<p>Нерегулярні основи: <b>être</b> ser-, <b>avoir</b> aur-, <b>aller</b> ir-, <b>faire</b> fer-, <b>voir</b> verr-, <b>pouvoir</b> pourr-, <b>vouloir</b> voudr-, <b>venir</b> viendr-, <b>envoyer</b> enverr-, <b>recevoir</b> recevr-.</p>' +
      '<p>Правопис: <i>appeler → j\'appellerai</i>, <i>se lever → je me lèverai</i>, <i>payer → je paierai / payerai</i>.</p>' +
      '<p>Futur simple після <b>quand, dès que, lorsque</b> та в схемі <b>si + présent → futur simple</b>: <i>S\'il pleut, nous resterons.</i></p>',
    next: "Можна переходити до вправ на вибір між futur proche і futur simple."
  },
  prs: {
    label: "Présent", group: "tenses", gramRef: "Дієслова на -er (présent)",
    lessons: [T3_PRS],
    recap: "<p class=\"formula\">основа + закінчення особи</p><div class=\"mnemonic\"><span>-er: -e, -es, -e, -ons, -ez, -ent</span><span>-ir: -is, -is, -it, -issons, -issez, -issent</span><span>-re: -s, -s, —, -ons, -ez, -ent</span></div><p>Нерегулярні: <b>être</b> (suis, es, est, sommes, êtes, sont), <b>avoir</b>, <b>aller</b> (vais, vas, va, allons, allez, vont), <b>faire</b>, <b>venir</b>, <b>prendre</b>, <b>pouvoir</b>, <b>vouloir</b>, <b>devoir</b>, <b>dire</b>, <b>voir</b>, <b>boire</b>.</p>",
    next: "Можна переходити до наступного часу."
  },
  cond: {
    label: "Conditionnel présent", group: "tenses", gramRef: "Conditionnel présent",
    lessons: [T3_COND],
    recap: "<p class=\"formula\">основа futur simple + закінчення imparfait</p><div class=\"mnemonic\"><span>je -ais</span><span>tu -ais</span><span>il -ait</span><span>nous -ions</span><span>vous -iez</span><span>ils -aient</span></div><p>Ввічливість: <i>Je voudrais, pourriez-vous</i>. Порада: <i>Tu devrais</i>. Гіпотеза: <i>Si j'avais le temps, je voyagerais.</i> Основи ті самі, що й у futur simple: ser-, aur-, ir-, fer-, pourr-, voudr-, viendr-.</p>",
    next: "Можна переходити до наступного часу."
  },
  sbj: {
    label: "Subjonctif présent", group: "tenses", gramRef: "Subjonctif présent",
    lessons: [T3_SBJ],
    recap: "<p class=\"formula\">3 ос. мн. présent без -ent + -e, -es, -e, -ions, -iez, -ent</p><p><i>Il faut que tu <b>viennes</b>. Je veux que vous <b>soyez</b> là. Bien que, pour que, avant que + subjonctif.</i> Нерегулярні: <b>être</b> (sois, soyons, soient), <b>avoir</b> (aie, ayons, aient), <b>aller</b> (aille, allions), <b>faire</b> (fasse), <b>pouvoir</b> (puisse), <b>savoir</b> (sache), <b>vouloir</b> (veuille).</p>",
    next: "Можна повертатися до інших часів або практики."
  },
  cod: {
    label: "COD (кого? що?)", group: "topics", gramRef: "Прямий додаток (COD)", placeholder: "Напишіть відповідь",
    lessons: [T_COD],
    recap: "<p class=\"formula\">le / la / l' / les стоять перед дієсловом</p><p>COD відповідає на «кого? що?» і не має прийменника: <i>Je vois <b>Paul</b> → Je <b>le</b> vois.</i></p><div class=\"mnemonic\"><span>me (m')</span><span>te (t')</span><span>le / la / l'</span><span>nous</span><span>vous</span><span>les</span></div><p>Перед голосною <i>le / la → l'</i>. У passé composé займенник перед avoir: <i>Je l'ai vu</i>. Перед інфінітивом: <i>Je vais le faire</i>. У ствердному наказовому після дієслова: <i>Regarde-le !</i></p><p>Підказка в дужках показує, яке слово треба замінити.</p>",
    next: "Можна переходити до COI."
  },
  coi: {
    label: "COI (кому? чому?)", group: "topics", gramRef: "Непрямий додаток (COI)", placeholder: "Напишіть відповідь",
    lessons: [T_COI],
    recap: "<p class=\"formula\">à + особа → lui / leur</p><p>COI відповідає на «кому?» і вводиться прийменником <b>à</b>: <i>Je parle <b>à Paul</b> → Je <b>lui</b> parle.</i></p><div class=\"mnemonic\"><span>me (m')</span><span>te (t')</span><span>lui</span><span>nous</span><span>vous</span><span>leur</span></div><p><b>lui</b> для чоловіка й жінки в однині, <b>leur</b> для множини. Дієслова з à: <i>parler, téléphoner, répondre, écrire, donner, dire, demander, offrir, expliquer</i>.</p><p>Для речей замість lui / leur використовують <b>y</b> (див. розділ Y та en).</p>",
    next: "Можна переходити до COD чи COI."
  },
  codcoi: {
    label: "COD чи COI", group: "topics", gramRef: "Прямий додаток (COD)", placeholder: "Напишіть відповідь",
    lessons: [T_MIX],
    recap: "<p class=\"formula\">без à → le / la / les; з à + особа → lui / leur</p><p>Спершу дивимось, чи є після дієслова прийменник <b>à</b>. Немає: COD (<i>Je vois Marie → Je la vois</i>). Є: COI (<i>Je parle à Marie → Je lui parle</i>).</p><p>Дієслова без прийменника у французькій: <i>attendre, chercher, écouter, regarder, aimer, connaître, voir, inviter, prendre</i>.</p>",
    next: "Можна переходити до Y та en."
  },
  yen: {
    label: "Y та en", group: "topics", gramRef: "Y та en", placeholder: "Напишіть відповідь",
    lessons: [T_YEN],
    recap: "<p class=\"formula\">y = à + місце / річ; en = de + річ, кількість</p><p><b>y</b>: <i>Tu vas à Paris ? Oui, j'y vais.</i> <i>Je pense à ça → J'y pense.</i></p><p><b>en</b>: <i>Tu veux du café ? Oui, j'en veux.</i> <i>J'ai trois frères → J'en ai trois.</i> <i>Il vient de Paris → Il en vient.</i></p><p>Обидва стоять перед дієсловом, у ствердному наказовому після: <i>Vas-y ! Prends-en !</i></p>",
    next: "Можна переходити до розділу Артиклі."
  },
  art: {
    label: "Артиклі", group: "topics", gramRef: "Артиклі: означені, неозначені, частковий", placeholder: "Напишіть відповідь",
    lessons: [T_ART],
    recap: "<div class=\"mnemonic\"><span>le / la / l' / les</span><span>un / une / des</span><span>du / de la / de l'</span></div><p>Означений: відоме, єдине, загальне. Неозначений: нове, лічене. Частковий: нелічена кількість.</p><p>Після заперечення та після <i>beaucoup, peu, assez, trop</i> + <b>de (d')</b>. Злиття: <i>à + le = au, à + les = aux, de + le = du, de + les = des</i>.</p>",
    next: "Можна переходити до Прийменників."
  },
  prep: {
    label: "Прийменники", group: "topics", gramRef: "Прийменники місця й напрямку", placeholder: "Напишіть відповідь",
    lessons: [T_PREP],
    recap: "<p>Міста: <b>à</b> (<i>à Paris</i>). Жіночі країни: <b>en</b> (<i>en France</i>). Чоловічі: <b>au</b> (<i>au Canada</i>). Множина: <b>aux</b> (<i>aux États-Unis</i>). Звідки: <i>de France, du Canada, des États-Unis</i>.</p><p><b>chez</b> + особа. Час: <b>depuis</b> (триває досі), <b>pendant</b> (тривалість), <b>il y a</b> (тому), <b>dans</b> (через).</p><p>Дієслова: <i>penser à, parler de, avoir besoin de, commencer à, finir de</i>.</p>",
    next: "Можна переходити до Заперечень."
  },
  neg: {
    label: "Заперечення", group: "topics", gramRef: "Розширені заперечення", placeholder: "Напишіть відповідь",
    lessons: [T_NEG],
    recap: "<div class=\"mnemonic\"><span>ne … pas</span><span>ne … jamais</span><span>ne … rien</span><span>ne … personne</span><span>ne … plus</span><span>ne … pas encore</span><span>ne … que</span></div><p><i>ne</i> перед дієсловом, друга частина після нього. У passé composé навколо допоміжного: <i>Je n'ai rien vu</i>, але <i>Je n'ai vu personne</i>.</p><p>Після заперечення <i>un / une / des / du</i> стають <b>de</b>. Підказка в дужках показує потрібне значення.</p>",
    next: "Можна переходити до Присвійних і вказівних."
  },
  poss: {
    label: "Присвійні та вказівні", group: "topics", gramRef: "Присвійні та вказівні прикметники", placeholder: "Напишіть відповідь",
    lessons: [T_POSS],
    recap: "<div class=\"mnemonic\"><span>mon / ma / mes</span><span>ton / ta / tes</span><span>son / sa / ses</span><span>notre / nos</span><span>votre / vos</span><span>leur / leurs</span></div><p>Форма залежить від <b>роду й числа речі</b>, а не власника. Перед жіночим іменником на голосну: <i>mon amie</i>.</p><p>Вказівні: <i>ce</i> (ч.), <i>cet</i> (голосна), <i>cette</i> (ж.), <i>ces</i> (мн.).</p>",
    next: "Можна повертатися до Часів або додати ще теми."
  },
  rel: {
    label: "Qui / que / dont / où", group: "topics", gramRef: "Відносні займенники dont та інші", placeholder: "Напишіть відповідь",
    lessons: [T_REL],
    recap: "<div class=\"mnemonic\"><span>qui = підмет</span><span>que = прямий додаток</span><span>dont = de + що / хто, «чий»</span><span>où = місце, час</span></div><p><i>L'homme <b>qui</b> parle.</i> <i>Le livre <b>que</b> je lis.</i> <i>Le film <b>dont</b> je parle.</i> <i>La ville <b>où</b> j'habite.</i></p><p>Підказка в дужках показує функцію слова: підмет, додаток, parler de, місце, час.</p>",
    next: "Можна переходити до Lequel."
  },
  leq: {
    label: "Lequel і прийменники", group: "topics", gramRef: "Lequel, laquelle, lesquels, lesquelles", placeholder: "Напишіть відповідь",
    lessons: [T_LEQ],
    recap: "<div class=\"mnemonic\"><span>lequel (ч. одн.)</span><span>laquelle (ж. одн.)</span><span>lesquels (ч. мн.)</span><span>lesquelles (ж. мн.)</span></div><p>Форма залежить від роду й числа іменника. Зливання: <i>à + lequel = auquel, auxquels, auxquelles</i>; <i>de + lequel = duquel, desquels, desquelles</i>. Але <i>à laquelle, de laquelle</i> без змін.</p><p>Підказка в дужках: рід і число, а також дієслово чи прийменник, який вимагає à або de.</p>",
    next: "Можна повертатися до Часів або Практики."
  },
  dp: {
    label: "Подвійні займенники", group: "topics", gramRef: "Подвійні займенники та їх порядок", placeholder: "Напишіть відповідь",
    lessons: [T2_DP],
    recap: "<p class=\"formula\">me / te / nous / vous → le / la / les → lui / leur → y → en</p><p><i>Je <b>le lui</b> donne. Il <b>m'en</b> parle. Il y <b>en</b> a.</i></p><p>У запереченні ne стоїть перед усією групою: <i>Je ne le lui donne pas.</i> У passé composé група перед avoir.</p>",
    next: "Далі: наказовий спосіб із займенниками."
  },
  impr: {
    label: "Наказовий і займенники", group: "topics", gramRef: "Наказовий спосіб (impératif)", placeholder: "Напишіть відповідь",
    lessons: [T2_IMPR],
    recap: "<p class=\"formula\">Ствердно: дієслово-COD-COI. Заперечно: ne + займенники + дієслово + pas</p><p><i>Donne-<b>le-moi</b> ! Ne <b>me le</b> donne pas ! Prends-<b>en</b> !</i></p><p>Після дієслова me → moi, te → toi (але m'en, t'en).</p>",
    next: "Далі: наголошені займенники."
  },
  ton: {
    label: "Наголошені займенники", group: "topics", gramRef: "Тонічні займенники", placeholder: "Напишіть відповідь",
    lessons: [T2_TON],
    recap: "<div class=\"mnemonic\"><span>moi</span><span>toi</span><span>lui / elle</span><span>nous</span><span>vous</span><span>eux / elles</span></div><p>Після прийменників (<i>chez moi, avec eux</i>), після <i>c'est</i>, після <i>que</i> і для наголосу: <i>Moi, je suis ukrainien.</i></p>",
    next: "Далі: зворотні дієслова."
  },
  refl: {
    label: "Зворотні дієслова", group: "topics", gramRef: "Займенникові дієслова", placeholder: "Напишіть відповідь",
    lessons: [T2_REFL],
    recap: "<div class=\"mnemonic\"><span>me</span><span>te</span><span>se</span><span>nous</span><span>vous</span><span>se</span></div><p><i>Je <b>me</b> lève. Tu <b>t'</b>habilles.</i> У passé composé — завжди être: <i>Elle s'est levée. Ils se sont disputés.</i> Participe узгоджується з підметом.</p>",
    next: "Далі: узгодження participe passé."
  },
  agr: {
    label: "Узгодження participe passé", group: "topics", gramRef: "Узгодження participe passé", placeholder: "Напишіть відповідь",
    lessons: [T2_AGR],
    recap: "<p class=\"formula\">être → узгодження з підметом. avoir → з COD, що стоїть перед ним.</p><p><i>Elle est <b>allée</b>. Je les ai <b>vues</b>. La lettre que j'ai <b>écrite</b>.</i> Якщо COD після avoir — без узгодження: <i>Elle a perdu ses clés.</i></p>",
    next: "Далі: речення з si."
  },
  si: {
    label: "Умовні речення з si", group: "topics", gramRef: "Речення з si", placeholder: "Напишіть відповідь",
    lessons: [T2_SI],
    recap: "<p class=\"formula\">si + présent → futur · si + imparfait → conditionnel</p><p><i>Si tu viens, nous irons. Si j'avais le temps, je lirais.</i> Після si ніколи не ставимо futur і conditionnel.</p>",
    next: "Далі: subjonctif."
  },
  subj: {
    label: "Subjonctif présent", group: "topics", gramRef: "Subjonctif présent", placeholder: "Напишіть відповідь",
    lessons: [T2_SUBJ],
    recap: "<p class=\"formula\">il faut que · je veux que · pour que · bien que + subjonctif</p><p><i>Il faut que tu <b>viennes</b>. Je veux que vous <b>soyez</b> là.</i> Основа — 3 особа множини (ils viennent → vienn-) + -e, -es, -e, -ions, -iez, -ent. Нерегулярні: être, avoir, aller, faire.</p>",
    next: "Далі: порівняння."
  },
  comp: {
    label: "Порівняння", group: "topics", gramRef: "Порівняння та найвищий ступінь", placeholder: "Напишіть відповідь",
    lessons: [T2_COMP],
    recap: "<p class=\"formula\">plus / moins / aussi + прикметник + que · le plus / le moins</p><p>Bon → <b>meilleur</b> (прикметник), bien → <b>mieux</b> (прислівник): <i>Ce gâteau est meilleur. Elle chante mieux.</i></p>",
    next: "Далі: прикметники."
  },
  adj: {
    label: "Прикметники", group: "topics", gramRef: "Прикметники: узгодження та місце", placeholder: "Напишіть відповідь",
    lessons: [T2_ADJ],
    recap: "<p>Прикметник узгоджується з іменником у роді й числі. Перед іменником: <b>B</b>eauty, <b>A</b>ge, <b>G</b>oodness, <b>S</b>ize — beau, jeune, bon, grand, petit, vieux, nouveau.</p><p><i>un bel appartement, un vieil homme, une voiture rouge.</i></p>",
    next: "Далі: прислівники."
  },
  adv: {
    label: "Прислівники на -ment", group: "topics", gramRef: "Прислівники", placeholder: "Напишіть відповідь",
    lessons: [T2_ADV],
    recap: "<p>Прислівник = жіноча форма прикметника + <b>-ment</b>: <i>lent → lentement</i>. Прикметники на -ant / -ent: <i>-amment, -emment</i> (constant → constamment). Винятки: <i>bon → bien</i>, <i>mauvais → mal</i>, <i>gentil → gentiment</i>.</p>",
    next: "Далі: питання."
  },
  quest: {
    label: "Питання", group: "topics", gramRef: "Питання", placeholder: "Напишіть відповідь",
    lessons: [T2_QUEST],
    recap: "<p><b>Est-ce que</b> + речення; інверсія: <i>Où habites-tu ?</i>; <b>quel / quelle / quels / quelles</b> + іменник; <b>lequel</b> замість іменника: <i>Quel livre ? Lequel préfères-tu ?</i></p>",
    next: "Далі: час (depuis, il y a …)."
  },
  time: {
    label: "Час: depuis, il y a, dans", group: "topics", gramRef: "Прийменники часу: depuis, pendant, il y a, dans, en", placeholder: "Напишіть відповідь",
    lessons: [T2_TIME],
    recap: "<p><b>depuis</b> = з (ще триває), <b>il y a</b> = тому, <b>pendant</b> = протягом, <b>dans</b> = через, <b>en</b> = за (скільки зайняло). <b>venir de</b> + інфінітив = щойно: <i>Je viens de manger.</i></p>",
    next: "Далі: кількість."
  },
  qty: {
    label: "Кількість без артикля", group: "topics", gramRef: "Кількість: beaucoup de, un peu de та інші", placeholder: "Напишіть відповідь",
    lessons: [T2_QTY],
    recap: "<p>Після слів кількості артикль зникає: <i>beaucoup <b>de</b> monde, un peu <b>de</b> sucre, assez <b>de</b> temps, trop <b>de</b> bruit</i>. Перед голосною <i>d'</i>. Виняток: <i>la plupart <b>des</b></i>.</p>",
    next: "Далі: plus-que-parfait."
  },
  pqp: {
    label: "Plus-que-parfait", group: "topics", gramRef: "Plus-que-parfait", placeholder: "Напишіть відповідь",
    lessons: [T2_PQP],
    recap: "<p class=\"formula\">avoir / être в imparfait + participe passé</p><p>Дія раніше за іншу минулу: <i>Quand je suis arrivé, il <b>était</b> déjà <b>parti</b>.</i> Узгодження як у passé composé.</p>",
    next: "Далі: gérondif."
  },
  ger: {
    label: "Gérondif", group: "topics", gramRef: "Participe présent і gérondif", placeholder: "Напишіть відповідь",
    lessons: [T2_GER],
    recap: "<p class=\"formula\">en + основа nous + -ant</p><p><i>nous parlons → en <b>parlant</b>. Elle écoute de la musique en <b>travaillant</b>.</i> Виняток: être → étant, avoir → ayant, savoir → sachant.</p>",
    next: "Далі: непряма мова."
  },
  ind: {
    label: "Непряма мова", group: "topics", gramRef: "Непряма мова", placeholder: "Напишіть відповідь",
    lessons: [T2_IND],
    recap: "<p>Після <i>dit / a dit que</i> часи зсуваються: présent → imparfait, futur → conditionnel, passé composé → plus-que-parfait. Питання: <i>si</i>, <i>ce que</i>. Час: hier → la veille, demain → le lendemain.</p>",
    next: "Далі: сполучники."
  },
  conj: {
    label: "Сполучники", group: "topics", gramRef: "Причина, наслідок, мета", placeholder: "Напишіть відповідь",
    lessons: [T2_CONJ],
    recap: "<p><b>parce que / car</b> — причина, <b>donc / alors</b> — наслідок, <b>pourtant / mais</b> — протиставлення, <b>alors que</b> — тоді як, <b>pour que, bien que</b> + subjonctif, <b>puisque</b> — оскільки (відомо).</p>",
    next: "Можна повертатися до часів або практики."
  }
};
