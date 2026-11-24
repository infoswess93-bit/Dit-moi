/* Grammar reference: A1-B2. Add topics with T(level, section, title, html). */
var GRAM = [];
function E(fr, ua) { return '<p class="gex"><i>' + fr + '</i>' + (ua ? '<br><span>' + ua + '</span>' : '') + '</p>'; }
function M(arr) { var o = ""; for (var i = 0; i < arr.length; i++) o += "<span>" + arr[i] + "</span>"; return '<div class="mnemonic">' + o + "</div>"; }
function T(lv, sec, t, h) { GRAM.push({ lv: lv, sec: sec, t: t, h: h, txt: "" }); }
T("A1", "Основи", "Вимова й правопис", `
  <p>Кінцеві приголосні зазвичай <b>не читаються</b>: <i>petit, vous, grand, chat</i>. Виняток: <b>c, r, f, l</b> (слово CaReFuL): <i>avec, par, neuf, il</i>.</p>
  <p>Носові голосні: <i>an/en</i> [ɑ̃], <i>on</i> [ɔ̃], <i>in/ain/ein</i> [ɛ̃], <i>un</i> [œ̃]. Сполука <i>ou</i> читається як [у], <i>u</i> як [ю] (губи вперед), <i>eu</i> та <i>œu</i> як [ø]/[œ].</p>
  <p><b>Liaison</b>: кінцева приголосна читається перед голосним: <i>les amis</i> [лезамі], <i>vous avez</i>. Перед h muet так само (<i>l'homme</i>), перед h aspiré ні (<i>le héros</i>).</p>
  <p>Діакритика: <i>é</i> [e], <i>è/ê</i> [ɛ], <i>à, ù</i> розрізняють слова (<i>a / à, ou / où</i>), <i>ç</i> читається [с] перед a, o, u.</p>
  <p>Наголос завжди на <b>останньому складі</b> слова або групи слів.</p>`);
T("A1", "Основи", "Особові займенники", `
  <p>Підмети: ${M(["je (j')", "tu", "il / elle / on", "nous", "vous", "ils / elles"])}</p>
  <p><b>tu</b>: друзі, родина, діти. <b>vous</b>: незнайомі, шанобливо, а також множина. <b>on</b> у розмові часто означає «ми»: <i>On y va ?</i> (дієслово в формі il).</p>
  <p>Перед голосною <i>je → j'</i>: <i>j'habite</i>. Ils, якщо в групі є хоча б один чоловік.</p>`);
T("A1", "Іменник і артикль", "Артиклі: означені, неозначені, частковий", `
  <p>${M(["le / la / l' / les (той, ця)", "un / une / des (якийсь)", "du / de la / de l' (частина, трохи)"])}</p>
  <p><b>Означений</b>: відомий, єдиний або загальний предмет: <i>Le café est chaud.</i> Також для вподобань: <i>J'aime le chocolat.</i></p>
  <p><b>Неозначений</b>: новий, один із багатьох: <i>J'ai un frère.</i></p>
  <p><b>Частковий</b>: невизначена кількість того, що не лічать: <i>Je bois du café, je mange de la soupe.</i></p>
  <p>Злиття: <i>à + le = au, à + les = aux, de + le = du, de + les = des</i>.</p>
  <p>Після заперечення <i>un / une / des / du / de la → de (d')</i>: <i>Je n'ai pas de voiture.</i> Після <i>être</i> цього немає: <i>Ce n'est pas un chat.</i></p>`);
T("A1", "Іменник і артикль", "Рід і число іменників", `
  <p>Іменник має рід (чол./жін.), який треба вчити разом із словом, часто він не збігається з українським.</p>
  <p>Зазвичай <b>жіночі</b>: <i>-tion, -sion, -té, -ure, -ence, -ance, -ette</i> (<i>la solution, la liberté</i>). Зазвичай <b>чоловічі</b>: <i>-ment, -age, -eau, -isme</i> (<i>le monument, le voyage</i>). Винятки: <i>une image, une page, la plage, l'eau (ж.)</i>.</p>
  <p><b>Множина</b>: +s (<i>un livre → des livres</i>). <i>-al → -aux</i> (<i>un journal → des journaux</i>), <i>-eau, -eu → +x</i> (<i>un bureau → des bureaux</i>). Слова на <i>-s, -x, -z</i> не змінюються: <i>un prix → des prix</i>. У вимові s множини не чути, тому ознака множини лежить в артиклі: <i>le / les</i>.</p>
  <p><b>Жіноча форма</b> для людей: +e (<i>ami → amie</i>), <i>-er → -ère</i> (<i>boulanger → boulangère</i>), <i>-eur → -euse</i> (<i>vendeur → vendeuse</i>), <i>-teur → -trice</i> (<i>acteur → actrice</i>), <i>-ien → -ienne</i>.</p>`);
T("A1", "Іменник і артикль", "Прикметники: узгодження та місце", `
  <p>Прикметник узгоджується з іменником у роді й числі: <i>un grand garçon, une grande maison, des grands garçons</i>.</p>
  <p>Жіноча форма: +e. Особливі: <i>beau → belle, nouveau → nouvelle, vieux → vieille, blanc → blanche, long → longue, gentil → gentille, heureux → heureuse</i>. Перед чоловічим іменником на голосну: <i>un bel homme, un nouvel ami, un vieil arbre</i>.</p>
  <p><b>Місце</b>: зазвичай <b>після</b> іменника (<i>une voiture rouge</i>). Перед іменником короткі часті прикметники (мнемоніка BAGS: Beauty, Age, Goodness, Size): <i>petit, grand, gros, beau, joli, jeune, vieux, nouveau, bon, mauvais, long, haut</i>. <i>une petite maison, un bon café</i>.</p>`);
T("A1", "Іменник і артикль", "Присвійні та вказівні прикметники", `
  <p>Присвійні узгоджуються з <b>річчю, що належить</b>, а не з власником: <i>son père = його / її батько</i>.</p>
  <p>${M(["mon / ma / mes", "ton / ta / tes", "son / sa / ses", "notre / nos", "votre / vos", "leur / leurs"])}</p>
  <p>Перед жіночим іменником на голосну беруть <i>mon / ton / son</i>: <i>mon amie, ton école</i>.</p>
  <p><b>Вказівні</b>: <i>ce garçon, cet homme (голосна / h), cette femme, ces enfants</i>. Для уточнення: <i>ce livre-ci / ce livre-là</i>.</p>`);
T("A1", "Дієслова", "Être та avoir (présent)", `
  <p><b>être</b>: ${M(["je suis", "tu es", "il est", "nous sommes", "vous êtes", "ils sont"])}</p>
  <p><b>avoir</b>: ${M(["j'ai", "tu as", "il a", "nous avons", "vous avez", "ils ont"])}</p>
  <p>Avoir у французькій також у виразах: <i>avoir 30 ans, avoir faim, avoir froid, avoir besoin de, avoir mal à</i>.</p>
  <p>Професія та національність після être зазвичай без артикля: <i>Il est ingénieur. Elle est ukrainienne.</i></p>`);
T("A1", "Дієслова", "Дієслова на -er (présent)", `
  <p>Прибираємо <i>-er</i> і додаємо: ${M(["-e", "-es", "-e", "-ons", "-ez", "-ent"])}</p>
  ${E("Je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.", "")}
  <p>Особливості: <i>manger → nous mangeons</i>, <i>commencer → nous commençons</i>, <i>acheter → j'achète, nous achetons</i>, <i>appeler → j'appelle</i>, <i>préférer → je préfère</i>, <i>payer → je paie / je paye</i>, <i>envoyer → j'envoie</i>.</p>
  <p>Перед голосною: <i>je → j'</i>. Закінчення <i>-e, -es, -ent</i> у вимові не чути.</p>`);
T("A1", "Дієслова", "Дієслова на -ir і часті нерегулярні", `
  <p><b>finir</b> (II група): <i>finis, finis, finit, finissons, finissez, finissent</i>. Так само <i>choisir, réussir, grandir, réfléchir</i>.</p>
  <p><b>aller</b>: ${M(["vais", "vas", "va", "allons", "allez", "vont"])}</p>
  <p><b>faire</b>: ${M(["fais", "fais", "fait", "faisons", "faites", "font"])}</p>
  <p><b>prendre</b>: ${M(["prends", "prends", "prend", "prenons", "prenez", "prennent"])}</p>
  <p><b>venir</b>: ${M(["viens", "viens", "vient", "venons", "venez", "viennent"])}</p>
  <p><b>pouvoir</b>: ${M(["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"])}</p>
  <p><b>vouloir</b>: ${M(["veux", "veux", "veut", "voulons", "voulez", "veulent"])}</p>
  <p><b>savoir</b>: ${M(["sais", "sais", "sait", "savons", "savez", "savent"])}</p>
  <p><b>dire</b>: <i>dis, dis, dit, disons, dites, disent</i>. <b>voir</b>: <i>vois, vois, voit, voyons, voyez, voient</i>.</p>`);
T("A1", "Дієслова", "Займенникові дієслова", `
  <p>Мають зворотний займенник: <b>me, te, se, nous, vous, se</b>: <i>je me lève, tu te lèves, il se lève, nous nous levons, vous vous levez, ils se lèvent</i>.</p>
  <p>Перед голосною: <i>je m'appelle, il s'habille</i>. Часті: <i>se lever, se coucher, se laver, s'habiller, se promener, se souvenir, s'appeler</i>.</p>
  <p>Заперечення: <i>je <b>ne</b> me lève <b>pas</b></i>. Питання: <i>Tu te lèves à quelle heure ?</i></p>`);
T("A1", "Дієслова", "Futur proche та passé récent", `
  <p><b>aller + інфінітив</b>: близьке майбутнє: <i>Je vais manger. Nous allons partir.</i></p>
  <p><b>venir de + інфінітив</b>: щойно відбулося: <i>Il vient d'arriver. Je viens de finir.</i></p>`);
T("A1", "Дієслова", "Наказовий спосіб (impératif)", `
  <p>Беруть форми <b>tu, nous, vous</b> без підмета: <i>Écoute ! Écoutons ! Écoutez !</i></p>
  <p>Для дієслів на <i>-er</i> форма tu <b>без -s</b>: <i>Parle ! Mange !</i> (але <i>Vas-y !</i>, <i>Parles-en !</i> перед y / en).</p>
  <p>Нерегулярні: <i>être: sois, soyons, soyez</i>; <i>avoir: aie, ayons, ayez</i>; <i>aller: va, allons, allez</i>; <i>savoir: sache, sachons, sachez</i>.</p>
  <p>Заперечення: <i>Ne parle pas !</i> Зворотні дієслова: <i>Lève-toi ! Ne te lève pas !</i></p>`);
T("A1", "Речення", "Заперечення ne … pas", `
  <p><b>ne</b> стоїть перед дієсловом, <b>pas</b> після нього: <i>Je ne parle pas russe.</i> Перед голосною <i>n'</i>: <i>Il n'aime pas ça.</i></p>
  <p>У складних часах обгортається допоміжне дієслово: <i>Je <b>n'</b>ai <b>pas</b> mangé.</i> У futur proche: <i>Je <b>ne</b> vais <b>pas</b> venir.</i></p>
  <p>Після заперечення неозначений і частковий артиклі змінюються на <i>de</i>: <i>Je n'ai pas de temps.</i></p>
  <p>У розмовній мові <i>ne</i> часто пропускають: <i>Je sais pas.</i> У письмі та в офіційній мові його зберігають.</p>`);
T("A1", "Речення", "Питання", `
  <p>Три способи: 1) інтонація: <i>Tu viens ?</i>; 2) <i>est-ce que</i>: <i>Est-ce que tu viens ?</i>; 3) інверсія (письмо, формально): <i>Viens-tu ? Parlez-vous français ?</i></p>
  <p>Питальні слова: <b>qui</b> (хто), <b>que / quoi</b> (що), <b>où</b>, <b>quand</b>, <b>comment</b>, <b>pourquoi</b>, <b>combien</b>, <b>quel / quelle / quels / quelles</b> (який).</p>
  ${E("Où est-ce que tu habites ? Tu habites où ? Où habites-tu ?", "Усі три форми означають «Де ти живеш?»")}
  <p>Відповідь на заперечне питання: <b>si</b> замість oui: <i>Tu ne viens pas ? Si, je viens.</i></p>`);
T("A1", "Речення", "Прийменники місця й напрямку", `
  <p><i>à</i> (в, до: місто, місце), <i>de</i> (з, від), <i>dans</i> (всередині), <i>sur</i> (на), <i>sous</i> (під), <i>devant</i>, <i>derrière</i>, <i>entre</i>, <i>près de</i>, <i>loin de</i>, <i>à côté de</i>, <i>en face de</i>, <i>chez</i> (у когось).</p>
  <p>Міста: <i>à Paris, à Berne</i>. Країни: жіночі та на голосну <b>en</b> (<i>en France, en Ukraine, en Suisse</i>), чоловічі <b>au</b> (<i>au Canada, au Portugal</i>), множина <b>aux</b> (<i>aux États-Unis</i>). Звідки: <i>de France, du Canada, des États-Unis</i>.</p>
  <p><i>chez</i> + особа: <i>chez le médecin, chez moi, chez nous</i>.</p>`);
T("A1", "Речення", "Числівники, дата і час", `
  <p>1–10: <i>un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix</i>. 11–16: <i>onze, douze, treize, quatorze, quinze, seize</i>. 20 <i>vingt</i>, 30 <i>trente</i>, 40 <i>quarante</i>, 50 <i>cinquante</i>, 60 <i>soixante</i>, 100 <i>cent</i>.</p>
  <p>70 = <i>soixante-dix</i>, 80 = <i>quatre-vingts</i>, 90 = <i>quatre-vingt-dix</i> (Франція). У Швейцарії та Бельгії: <b>septante</b> (70), <b>nonante</b> (90), а 80 у частині кантонів <b>huitante</b>.</p>
  <p>Час: <i>Il est huit heures / huit heures et quart / huit heures et demie / neuf heures moins le quart / midi / minuit.</i> Дата: <i>le 5 mars</i>, перше число: <i>le 1er mai</i>. Дні тижня й місяці з малої літери.</p>`);
T("A1", "Речення", "Il y a, c'est та il est", `
  <p><b>il y a</b> = є, існує (однина і множина): <i>Il y a un café ici. Il y a deux chats.</i> Заперечення: <i>Il n'y a pas de café.</i></p>
  <p><b>c'est / ce sont</b> + іменник з артиклем, ім'я або займенник: <i>C'est un médecin. C'est Marie. C'est moi.</i></p>
  <p><b>il / elle est</b> + прикметник або професія без артикля: <i>Il est médecin. Elle est contente.</i></p>`);
T("A2", "Минулий час", "Passé composé", `
  <p class="formula">avoir / être (présent) + participe passé</p>
  <p>Participe passé: <i>-er → -é</i> (<i>parlé</i>), <i>-ir → -i</i> (<i>fini</i>), <i>-re → -u</i> (<i>vendu</i>). Нерегулярні: <i>avoir → eu, être → été, faire → fait, prendre → pris, mettre → mis, voir → vu, pouvoir → pu, vouloir → voulu, devoir → dû, savoir → su, venir → venu, dire → dit, écrire → écrit, lire → lu, ouvrir → ouvert, boire → bu</i>.</p>
  <p><b>Avoir</b> з більшістю дієслів. <b>Être</b> з дієсловами руху й зміни стану (мнемоніка DR &amp; MRS VANDERTRAMP: <i>devenir, revenir, monter, rester, sortir, venir, aller, naître, descendre, entrer, rentrer, tomber, retourner, arriver, mourir, partir</i>) та з усіма займенниковими. З être participe passé узгоджується з підметом: <i>elle est partie, ils sont arrivés</i>.</p>
  <p>Якщо <i>monter, descendre, sortir, rentrer, passer, retourner</i> мають прямий додаток, вони беруть avoir: <i>Il a monté les valises.</i></p>
  <p>Заперечення охоплює допоміжне: <i>Je n'ai pas mangé.</i> Прислівники <i>déjà, bien, souvent</i> стоять між допоміжним і participe.</p>`);
T("A2", "Минулий час", "Imparfait", `
  <p class="formula">основа від nous (présent) без -ons + закінчення</p>
  <p>${M(["-ais", "-ais", "-ait", "-ions", "-iez", "-aient"])}</p>
  <p><i>nous parlons → je parlais</i>, <i>nous finissons → je finissais</i>, <i>nous faisons → je faisais</i>. Єдиний виняток: <i>être → j'étais</i>.</p>
  <p>Правопис: <i>manger → je mangeais</i>, <i>commencer → je commençais</i>, але <i>nous mangions, nous commencions</i>.</p>
  <p>Вживання: звичка в минулому (<i>Chaque été, nous allions à la mer.</i>), опис, стан, фон (<i>Il faisait beau.</i>), тривала дія, вік, час.</p>`);
T("A2", "Минулий час", "Passé composé чи imparfait", `
  <p><b>Passé composé</b>: завершена подія, що сталася в певний момент, ланцюжок подій: <i>Il a ouvert la porte, il est entré.</i></p>
  <p><b>Imparfait</b>: тло, опис, звичка, дія в розвитку: <i>Il pleuvait quand je suis sorti.</i></p>
  <p>Маркери imparfait: <i>toujours, souvent, d'habitude, chaque jour, autrefois, à cette époque</i>. Маркери passé composé: <i>hier, soudain, tout à coup, un jour, ce matin, deux fois</i>.</p>
  ${E("Je dormais quand le téléphone a sonné.", "Я спав, коли задзвонив телефон. (довга дія й коротка подія)")}`);
T("A2", "Майбутній час", "Futur simple", `
  <p class="formula">інфінітив (у -re без e) + закінчення</p>
  <p>${M(["-ai", "-as", "-a", "-ons", "-ez", "-ont"])}</p>
  <p><i>parler → je parlerai</i>, <i>finir → je finirai</i>, <i>prendre → je prendrai</i>.</p>
  <p>Нерегулярні основи: <i>être → ser-, avoir → aur-, aller → ir-, faire → fer-, voir → verr-, pouvoir → pourr-, vouloir → voudr-, venir → viendr-, devoir → devr-, savoir → saur-, envoyer → enverr-, falloir → faudr-</i>.</p>
  <p>Правопис: <i>appeler → j'appellerai</i>, <i>acheter → j'achèterai</i>, <i>payer → je paierai</i>.</p>
  <p>Futur simple для плану, обіцянки, прогнозу. Futur proche для близького й очевидного.</p>`);
T("A2", "Займенники", "Прямий додаток (COD)", `
  <p>${M(["me (m')", "te (t')", "le / la / l'", "nous", "vous", "les"])}</p>
  <p>Відповідає на «кого? що?» і стоїть <b>перед дієсловом</b>: <i>Je vois Marie → Je la vois.</i> <i>Il prend le train → Il le prend.</i></p>
  <p>У складних часах перед допоміжним: <i>Je l'ai vu.</i> З інфінітивом перед інфінітивом: <i>Je vais le faire.</i> Заперечення: <i>Je ne le vois pas.</i></p>
  <p>Наказовий (ствердний): після дієслова через дефіс: <i>Regarde-le ! Prends-moi !</i> (<i>me → moi</i>). Заперечний: <i>Ne le regarde pas.</i></p>`);
T("A2", "Займенники", "Непрямий додаток (COI)", `
  <p>${M(["me (m')", "te (t')", "lui", "nous", "vous", "leur"])}</p>
  <p>Замінюють <b>à + особа</b>: <i>Je parle à Paul → Je lui parle.</i> <i>Elle téléphone à ses amis → Elle leur téléphone.</i></p>
  <p>Типові дієслова з à: <i>parler, téléphoner, répondre, donner, dire, écrire, demander, expliquer, offrir, envoyer à qn</i>.</p>
  <p>Увага: <i>attendre, chercher, écouter, regarder</i> беруть прямий додаток без прийменника: <i>Je l'attends. Je le cherche.</i></p>`);
T("A2", "Займенники", "Y та en", `
  <p><b>y</b> замінює <i>à / dans / en + місце чи річ</i>: <i>Tu vas à Paris ? Oui, j'y vais.</i> <i>Je pense à ça → J'y pense.</i></p>
  <p><b>en</b> замінює <i>de + річ</i>, частковий артикль і кількість: <i>Tu veux du café ? Oui, j'en veux.</i> <i>Tu as des frères ? J'en ai deux.</i> <i>Tu viens de Paris ? J'en viens.</i></p>
  <p>Позиція така сама, як у COD: перед дієсловом. Кількість лишається: <i>J'en ai trois, J'en veux beaucoup.</i></p>
  <p>З ім'ям особи <i>penser à Marie → penser à elle</i> (а не y).</p>`);
T("A2", "Займенники", "Тонічні займенники", `
  <p>${M(["moi", "toi", "lui / elle", "nous", "vous", "eux / elles"])}</p>
  <p>Вживаються: після прийменників (<i>avec moi, chez lui, pour toi</i>), після <i>c'est</i> (<i>C'est moi.</i>), для наголосу (<i>Moi, je viens.</i>), без дієслова (<i>Qui veut du café ? Moi !</i>), після <i>et, ou, que</i>, у <i>moi aussi / moi non plus</i>, з <i>-même</i>: <i>lui-même</i>.</p>`);
T("A2", "Займенники", "Відносні займенники qui, que, où (початок)", `
  <p><b>qui</b> = підмет (хто, що): <i>L'homme qui parle est mon père.</i></p>
  <p><b>que (qu')</b> = прямий додаток: <i>Le livre que je lis est intéressant.</i></p>
  <p><b>où</b> = місце або час: <i>La ville où j'habite. Le jour où je suis arrivé.</i></p>
  <p>Qui і que з'єднують два речення в одне й ніколи не пропускаються, на відміну від української.</p>`);
T("A2", "Порівняння й кількість", "Порівняння та найвищий ступінь", `
  <p><b>plus / moins / aussi + прикметник або прислівник + que</b>: <i>Il est plus grand que moi. Elle court aussi vite que lui.</i></p>
  <p>З іменниками: <i>plus de / moins de / autant de + іменник (+ que)</i>: <i>J'ai plus de temps que toi.</i></p>
  <p>Особливі форми: <i>bon → meilleur(e)(s)</i> (не <i>plus bon</i>), <i>bien → mieux</i>, <i>mauvais → pire / plus mauvais</i>, <i>beaucoup → plus</i>.</p>
  <p>Найвищий ступінь: <i>le / la / les plus + прикметник (de)</i>: <i>C'est le plus grand de la classe.</i> <i>le meilleur, le mieux</i>.</p>`);
T("A2", "Порівняння й кількість", "Кількість: beaucoup de, un peu de та інші", `
  <p>Вирази кількості + <b>de</b> без артикля: <i>beaucoup de, peu de, un peu de, assez de, trop de, plus de, moins de, tant de, autant de</i>: <i>Il y a beaucoup de monde.</i></p>
  <p>Тара й міра: <i>une bouteille de lait, un kilo de pommes, un verre d'eau, une tasse de thé</i>.</p>
  <p>Виняток: <i>la plupart des gens, bien des gens</i> (з артиклем).</p>`);
T("A2", "Порівняння й кількість", "Розширені заперечення", `
  <p>${M(["ne … jamais (ніколи)", "ne … rien (нічого)", "ne … personne (нікого)", "ne … plus (вже не)", "ne … pas encore (ще не)", "ne … que (тільки)", "ne … aucun (жоден)"])}</p>
  <p>Місце те саме, що й у <i>ne … pas</i>: <i>Je ne mange jamais de viande. Il n'a rien dit.</i> <i>personne</i> і <i>rien</i> можуть бути підметом: <i>Personne ne vient. Rien ne change.</i></p>
  <p>У passé composé: <i>Je n'ai rien vu</i>, але <i>Je n'ai vu personne</i> (personne після participe).</p>
  <p><i>ne … que</i> не заперечує, а обмежує: <i>Je n'ai que dix euros.</i></p>`);
T("A2", "Порівняння й кількість", "Прислівники", `
  <p>Від прикметників додаванням <b>-ment</b> до жіночої форми: <i>lent → lentement, heureux → heureusement, doux → doucement</i>. Прикметники на <i>-ent / -ant</i> дають <i>-emment / -amment</i>: <i>évident → évidemment, constant → constamment</i>. Виняток <i>gentil → gentiment</i>.</p>
  <p>Часті прислівники: <i>bien, mal, vite, très, trop, assez, déjà, encore, toujours, souvent, parfois, jamais, ici, là, partout, aujourd'hui, demain, hier, bientôt, tard, tôt</i>.</p>
  <p>Місце: після відмінюваного дієслова, у складних часах між допоміжним і participe (короткі): <i>Il a bien dormi.</i></p>`);
T("A2", "Дієслова", "Devoir, pouvoir, vouloir та il faut", `
  <p><b>devoir</b> (повинен): <i>dois, dois, doit, devons, devez, doivent</i>. <b>pouvoir</b> (могти), <b>vouloir</b> (хотіти) див. A1. Далі інфінітив: <i>Je dois partir. Tu peux m'aider ? Je veux manger.</i></p>
  <p><b>il faut</b> + інфінітив (загальна необхідність): <i>Il faut partir.</i> <b>il faut que</b> + subjonctif (конкретна особа, див. B1): <i>Il faut que tu partes.</i></p>
  <p>Заперечення: <i>Tu ne dois pas fumer</i> (не можна). <i>Il ne faut pas fumer</i> (не можна, заборона). Але <i>Tu n'as pas besoin de venir</i> (не треба).</p>`);
T("A2", "Дієслова", "Прийменники часу: depuis, pendant, il y a, dans, en", `
  <p><b>depuis</b> + présent: триває досі: <i>J'habite ici depuis deux ans.</i></p>
  <p><b>pendant</b>: тривалість: <i>J'ai travaillé pendant trois heures.</i></p>
  <p><b>il y a</b> + період + passé: «тому»: <i>Je suis arrivé il y a une semaine.</i></p>
  <p><b>dans</b> + період: «через»: <i>Il arrive dans dix minutes.</i></p>
  <p><b>en</b> + період: за який час завершено: <i>Il a fini en une heure.</i></p>
  <p>Також: <i>à partir de, jusqu'à, de … à, avant, après, vers, pour</i>.</p>`);
T("A2", "Дієслова", "Ввічливе прохання: je voudrais, pourriez-vous", `
  <p><b>Conditionnel</b> робить прохання ввічливим: <i>Je voudrais un café. Pourriez-vous m'aider ? Auriez-vous une chambre ?</i></p>
  <p>Інші форми ввічливості: <i>Est-ce que je peux …? Ça vous dérange si …? Je vous en prie. Avec plaisir. Volontiers.</i></p>
  <p>Для порад: <i>Tu devrais dormir. Vous pourriez essayer.</i> (див. conditionnel в B1)</p>`);
T("A2", "Речення", "З'єднувальні слова", `
  <p>Причина: <i>parce que, car, puisque</i>. Наслідок: <i>donc, alors, c'est pourquoi</i>. Протиставлення: <i>mais, pourtant, par contre</i>. Додавання: <i>et, aussi, en plus</i>. Час: <i>d'abord, ensuite, puis, enfin, après, pendant que, quand</i>.</p>
  ${E("Je suis resté à la maison parce qu'il pleuvait, donc j'ai lu un livre.", "Я залишився вдома, бо йшов дощ, тому читав книгу.")}`);
T("B1", "Минулий і майбутній час", "Plus-que-parfait", `
  <p class="formula">avoir / être (imparfait) + participe passé</p>
  <p><i>J'avais fini, elle était partie, nous nous étions levés.</i> Правила допоміжного дієслова й узгодження ті самі, що в passé composé.</p>
  <p>Дія, що відбулася <b>раніше</b> за іншу минулу: <i>Quand je suis arrivé, elle était déjà partie.</i> Також у непрямій мові та в si-реченнях (див. нижче).</p>`);
T("B1", "Минулий і майбутній час", "Futur antérieur", `
  <p class="formula">avoir / être (futur simple) + participe passé</p>
  <p>Дія, що <b>завершиться до</b> певного моменту або іншої майбутньої дії: <i>Quand tu arriveras, j'aurai fini.</i> <i>Dès qu'il aura payé, nous partirons.</i></p>
  <p>Після <i>quand, lorsque, dès que, aussitôt que, après que</i>, якщо мова про майбутнє. Також припущення: <i>Il aura oublié.</i> (мабуть, забув).</p>`);
T("B1", "Умовність і гіпотеза", "Conditionnel présent", `
  <p class="formula">основа futur simple + закінчення imparfait</p>
  <p>${M(["-ais", "-ais", "-ait", "-ions", "-iez", "-aient"])}</p>
  <p><i>je parlerais, tu finirais, il serait, nous aurions, vous iriez, ils feraient</i>.</p>
  <p>Вживання: ввічливе прохання (<i>Je voudrais …</i>), порада (<i>Tu devrais …</i>), побажання, вигадане або малоймовірне, чужа інформація (<i>Selon lui, il serait malade.</i>), майбутнє в минулому в непрямій мові.</p>`);
T("B1", "Умовність і гіпотеза", "Речення з si", `
  <p>${M(["si + présent → futur / présent / impératif", "si + imparfait → conditionnel présent", "si + plus-que-parfait → conditionnel passé"])}</p>
  ${E("S'il pleut, nous resterons. / Si tu as faim, mange !", "Реальна умова")}
  ${E("Si j'avais plus de temps, je voyagerais.", "Нереальне теперішнє. Якби в мене було більше часу, я б подорожував.")}
  ${E("Si j'avais su, je serais venu.", "Нереальне минуле. Якби я знав, я б прийшов.")}
  <p>Після <b>si</b> ніколи не вживається futur і conditionnel. <i>si + il → s'il</i>, але <i>si + elle</i> не змінюється.</p>`);
T("B1", "Умовність і гіпотеза", "Subjonctif présent", `
  <p class="formula">основа від ils (présent) без -ent + закінчення</p>
  <p>${M(["-e", "-es", "-e", "-ions", "-iez", "-ent"])}</p>
  <p><i>ils parlent → que je parle</i>, <i>ils finissent → que je finisse</i>. У nous і vous збігається з imparfait для регулярних: <i>que nous parlions</i>.</p>
  <p>Нерегулярні: <i>être: sois, sois, soit, soyons, soyez, soient</i>; <i>avoir: aie, aies, ait, ayons, ayez, aient</i>; <i>aller: aille …, allions, alliez</i>; <i>faire: fasse</i>; <i>pouvoir: puisse</i>; <i>savoir: sache</i>; <i>vouloir: veuille</i>; <i>venir: vienne, venions</i>; <i>prendre: prenne, prenions</i>.</p>
  <p>Вживається після <b>que</b> з: <i>il faut que, vouloir que, souhaiter que, préférer que, exiger que, avoir peur que, être content / triste que, regretter que, douter que</i>, а також після <i>pour que, avant que, afin que, bien que, quoique, sans que, jusqu'à ce que, à moins que, pourvu que</i>.</p>
  <p>Той самий підмет у двох частинах: інфінітив замість subjonctif (<i>Je veux partir</i>, а не <i>Je veux que je parte</i>).</p>`);
T("B1", "Займенники", "Подвійні займенники та їх порядок", `
  <p>Порядок перед дієсловом: <b>me / te / se / nous / vous → le / la / les → lui / leur → y → en</b>.</p>
  ${E("Je te le donne. Je le lui donne. Il y en a trois.", "Я тобі це даю. Я це йому даю. Їх три.")}
  <p>У ствердному наказовому порядку інший, усе після дієслова: <i>Donne-le-moi ! Donnez-le-lui !</i> У заперечному звичайний: <i>Ne me le donne pas.</i></p>
  <p>У passé composé займенники перед допоміжним: <i>Je le lui ai dit.</i></p>`);
T("B1", "Займенники", "Відносні займенники dont та інші", `
  <p><b>dont</b> = de + що/хто (де «чий», «про який»): <i>Le livre dont je parle. L'homme dont la fille est médecin.</i></p>
  <p><b>où</b> після місця й часу: <i>Le jour où il est parti.</i></p>
  <p><b>ce qui / ce que / ce dont</b> = «те, що» (без антецедента): <i>Je sais ce qui se passe. Dis-moi ce que tu veux. C'est ce dont j'ai besoin.</i></p>
  <p>Правило: <i>qui</i> = підмет, <i>que</i> = прямий додаток, <i>dont</i> = додаток із de, <i>où</i> = місце/час.</p>`);
T("B1", "Займенники", "Вказівні й присвійні займенники", `
  <p><b>celui / celle / ceux / celles</b> + <i>de, qui, que, -ci, -là</i>: <i>celui de Marie, celle qui parle, ceux-ci</i>. <b>ceci / cela / ça</b> без роду.</p>
  <p><b>Присвійні</b>: ${M(["le mien / la mienne", "le tien / la tienne", "le sien / la sienne", "le nôtre / la nôtre", "le vôtre / la vôtre", "le leur / la leur"])} У множині <i>les miens, les miennes, les nôtres …</i></p>
  <p>Про <b>lequel, laquelle, lesquels, lesquelles</b> див. окрему тему «Lequel, laquelle, lesquels, lesquelles».</p>`);
T("B1", "Складні форми", "Узгодження participe passé", `
  <p>З <b>être</b>: узгодження з підметом: <i>elle est partie, elles sont venues</i>.</p>
  <p>З <b>avoir</b>: узгодження з <b>прямим додатком, що стоїть перед</b> дієсловом: <i>Les fleurs que j'ai achetées. Je les ai vues.</i> Без додатка перед ним: <i>J'ai acheté des fleurs.</i></p>
  <p><b>Займенникові</b>: узгоджується з COD, яким є зворотний займенник: <i>Elle s'est lavée.</i> Якщо COD стоїть після: <i>Elle s'est lavé les mains.</i> Не узгоджується, коли se = COI: <i>Elles se sont parlé / téléphoné.</i></p>
  <p>З <i>en</i> участь не змінюється. <i>fait + інфінітив</i> не змінюється: <i>Elle s'est fait couper les cheveux.</i></p>`);
T("B1", "Складні форми", "Пасив", `
  <p class="formula">être (будь-який час) + participe passé (+ par)</p>
  <p>Participe узгоджується з підметом: <i>La lettre est écrite par Marie. Les portes ont été fermées.</i></p>
  <p>Альтернативи: <i>on</i> (<i>On a fermé les portes.</i>), займенникова форма (<i>Ça se dit comme ça. Le vin blanc se boit frais.</i>), <i>se faire + інфінітив</i> (<i>Il s'est fait voler son sac.</i>).</p>
  <p>Пасивним може бути лише дієслово з прямим додатком.</p>`);
T("B1", "Складні форми", "Participe présent і gérondif", `
  <p><b>Participe présent</b>: основа від nous + <i>-ant</i>: <i>parlant, finissant, faisant</i>. Винятки: <i>étant, ayant, sachant</i>. Не змінюється: <i>Une personne parlant français.</i></p>
  <p><b>Gérondif</b> = <i>en + participe présent</i>: одночасна дія того ж підмета, спосіб, умова: <i>Il mange en regardant la télé. En travaillant, tu réussiras.</i></p>
  <p>Прикметникове «-ant» узгоджується: <i>une histoire amusante, des enfants fatigants</i>.</p>`);
T("B1", "Складні форми", "Непряма мова", `
  <p><b>Теперішній</b> у головному: часи не змінюються: <i>Il dit qu'il vient.</i></p>
  <p><b>Минулий</b> у головному: ${M(["présent → imparfait", "passé composé → plus-que-parfait", "futur → conditionnel", "futur proche → aller (imparfait) + inf"])}</p>
  ${E("Il a dit : « Je viendrai demain. » → Il a dit qu'il viendrait le lendemain.", "")}
  <p>Часові маркери: <i>aujourd'hui → ce jour-là, hier → la veille, demain → le lendemain, maintenant → alors, ici → là, ce soir → ce soir-là</i>.</p>
  <p>Питання: <i>Il demande si je viens. Elle demande ce que je fais. Il demande qui est là. Je me demande où il va.</i> Інверсії в непрямому питанні немає.</p>`);
T("B1", "Складні форми", "Дієслова з прийменниками", `
  <p><b>à</b>: <i>penser à, répondre à, téléphoner à, s'intéresser à, commencer à, apprendre à, réussir à, hésiter à, arriver à, continuer à</i>.</p>
  <p><b>de</b>: <i>parler de, avoir besoin de, avoir envie de, se souvenir de, rêver de, finir de, décider de, essayer de, oublier de, refuser de, venir de, arrêter de</i>.</p>
  <p>Без прийменника: <i>attendre, chercher, écouter, regarder, demander, payer, habiter</i> (+ місце), <i>aimer, vouloir, pouvoir, devoir, savoir, aller + інфінітив</i>.</p>
  <p>З двома об'єктами: <i>demander à qn de faire qc, dire à qn de faire qc, permettre à qn de faire qc</i>. Різниця: <i>penser à</i> (думати про), <i>penser de</i> (мати думку про).</p>`);
T("B1", "Складні форми", "Вирази часу: avant de, après, dès que", `
  <p><b>avant de + інфінітив</b>: <i>Lave-toi les mains avant de manger.</i> <b>avant que + subjonctif</b>, якщо різні підмети.</p>
  <p><b>après + інфінітив passé</b>: <i>Après avoir mangé, il est parti. Après être arrivée, elle a appelé.</i></p>
  <p><b>quand, lorsque, dès que, aussitôt que, après que</b> + indicatif (у майбутньому futur): <i>Dès que j'arriverai, je t'appellerai.</i></p>
  <p><b>pendant que, tant que, au moment où, chaque fois que</b>: <i>Tant que tu travailles, tu apprends.</i></p>`);
T("B2", "Умовність і гіпотеза", "Conditionnel passé", `
  <p class="formula">avoir / être (conditionnel présent) + participe passé</p>
  <p><i>j'aurais fini, elle serait partie, nous nous serions levés</i>.</p>
  <p>Вживання: жаль і докір (<i>J'aurais dû te prévenir. Tu aurais pu m'aider.</i>), нереальна умова в минулому (<i>Si j'avais su, je serais venu.</i>), непідтверджена інформація в новинах (<i>Le ministre aurait démissionné.</i>), майбутнє в минулому, яке вже теж пройшло.</p>`);
T("B2", "Умовність і гіпотеза", "Subjonctif passé та вибір між subjonctif і indicatif", `
  <p><b>Subjonctif passé</b> = avoir / être (subjonctif) + participe passé: <i>Bien qu'il ait fini, … Je suis content que tu sois venu.</i> Дія завершена до головної.</p>
  <p><b>Subjonctif</b>: необхідність, бажання, емоція, сумнів, мета, поступка: <i>il faut que, il est possible que, je doute que, bien que, pour que</i>.</p>
  <p><b>Indicatif</b> після впевненості: <i>je sais que, je pense que, il est clair que, il est certain que, il me semble que, parce que, puisque</i>.</p>
  <p>Заперечення чи питання робить <i>penser / croire / trouver / espérer</i> менш певними, тоді можливий subjonctif: <i>Je ne pense pas qu'il vienne.</i> <i>espérer que</i> завжди з indicatif: <i>J'espère qu'il viendra.</i></p>
  <p>Деякі сполучення мають обидва варіанти зі зміною змісту: <i>de sorte que</i> (+ indicatif результат, + subjonctif мета).</p>`);
T("B2", "Умовність і гіпотеза", "Вирази умови й гіпотези", `
  <p>З <b>subjonctif</b>: <i>à condition que, pourvu que, à moins que (… ne), supposons que, en admettant que</i>.</p>
  <p>З <b>conditionnel</b>: <i>au cas où, dans l'hypothèse où, quand bien même</i>: <i>Au cas où il pleuvrait, prends un parapluie.</i> (одна форма: <i>pleuvrait</i>, а не futur).</p>
  <p>З <b>indicatif</b>: <i>même si, sauf si, si jamais, selon que</i>.</p>
  <p>З іменником: <i>en cas de, faute de, sans</i>: <i>En cas de problème, appelez-moi.</i></p>`);
T("B2", "Складні форми", "Passé simple", `
  <p>Літературний минулий час, у розмові не використовується, але його треба впізнавати в книжках і газетах.</p>
  <p>-er: ${M(["je parlai", "tu parlas", "il parla", "nous parlâmes", "vous parlâtes", "ils parlèrent"])}</p>
  <p>-ir / -re: <i>je finis, il finit, ils finirent; je vendis, il vendit</i>. Інші: <i>il eut (avoir), il fut (être), il fit (faire), il vint (venir), il dit, il vit, il prit, il put, il voulut</i>.</p>
  <p>У тексті найчастіше формою третьої особи: <i>Il ouvrit la porte et entra.</i> Фонові описи в imparfait.</p>`);
T("B2", "Складні форми", "Інфінітив passé та participe passé composé", `
  <p><b>Інфінітив passé</b> = avoir / être + participe: <i>après avoir fini, après être arrivé(e)(s), pour avoir menti, merci d'être venu</i>.</p>
  <p><b>Participe composé</b> = ayant / étant + participe: <i>Ayant fini son travail, il est parti. Étant arrivés trop tard, nous avons manqué le train.</i> Причина або попередня дія при тому ж підметі.</p>
  <p><b>Participe passé сам</b>: <i>Une fois la lettre écrite, elle l'a envoyée.</i> <i>Fatigué, il s'est couché.</i></p>`);
T("B2", "Складні форми", "Складні відносні займенники", `
  <p>Після прийменників для речей <b>lequel / laquelle / lesquels / lesquelles</b> (докладно в B1), для осіб часто <b>qui</b>: <i>la table sur laquelle, la personne avec qui</i>.</p>
  <p>Злиття: <i>auquel, à laquelle, auxquels, auxquelles; duquel, de laquelle, desquels, desquelles</i>. <i>La raison pour laquelle … Le projet auquel je pense.</i></p>
  <p><b>dont</b> замінює <i>de qui / de quoi / duquel</i>, крім випадків із прийменниковою групою на кшталт <i>à côté de</i> (<i>l'immeuble à côté duquel</i>).</p>
  <p><b>ce qui, ce que, ce dont, ce à quoi</b> без антецедента: <i>Je ne sais pas ce à quoi il pense.</i></p>`);
T("B2", "Складні форми", "Виділення (mise en relief)", `
  <p><b>c'est … qui / que</b>: <i>C'est Marie qui a téléphoné. C'est demain que je pars.</i> Після <i>c'est</i> з <i>que</i> можна виділити додаток, обставину, час.</p>
  <p><b>ce qui / ce que … c'est</b>: <i>Ce que j'aime, c'est la mer. Ce qui m'étonne, c'est son silence.</i></p>
  <p>Подвоєння: <i>Moi, je …</i>, <i>Ce livre, je l'ai lu.</i> Також <i>il y a … qui</i>: <i>Il y a quelqu'un qui t'attend.</i></p>`);
T("B2", "Складні форми", "Дія через faire, laisser, voir + інфінітив", `
  <p><b>faire + інфінітив</b> = змусити, організувати дію: <i>Je fais réparer ma voiture. Il fait pleurer les enfants.</i> Займенники перед faire: <i>Je la fais réparer.</i> Participe <i>fait</i> тут не узгоджується.</p>
  <p><b>laisser, voir, entendre, regarder, sentir + інфінітив</b>: <i>Je l'entends chanter. Laisse-les jouer.</i> Тут можливий порядок «підмет-інфінітив»: <i>J'ai vu partir le train.</i></p>`);
T("B2", "Логіка тексту", "Причина, наслідок, мета", `
  <p><b>Причина</b>: <i>parce que</i> (відповідь на pourquoi), <i>puisque</i> (відома причина), <i>comme</i> (на початку), <i>car</i> (письмо), <i>grâce à</i> (позитив), <i>à cause de</i> (негатив), <i>en raison de, étant donné que, du fait que</i>.</p>
  <p><b>Наслідок</b>: <i>donc, c'est pourquoi, par conséquent, si bien que, tellement … que, tant … que, de sorte que, au point de</i>.</p>
  <p><b>Мета</b>: <i>pour, afin de</i> + інфінітив; <i>pour que, afin que, de peur que</i> + subjonctif: <i>Je parle lentement pour que tu comprennes.</i></p>`);
T("B2", "Логіка тексту", "Протиставлення та поступка", `
  <p><b>Subjonctif</b>: <i>bien que, quoique, encore que, quoi que, où que, qui que</i>: <i>Bien qu'il soit fatigué, il travaille.</i></p>
  <p><b>Indicatif</b>: <i>alors que, tandis que, même si, pendant que</i>: <i>Il travaille alors que les autres dorment.</i></p>
  <p><b>Іменник</b>: <i>malgré, en dépit de, contrairement à, au lieu de, sans</i>.</p>
  <p><b>Слова</b>: <i>pourtant, cependant, néanmoins, toutefois, en revanche, par contre, or, mais</i>.</p>`);
T("B2", "Логіка тексту", "Узгодження часів (concordance)", `
  <p>Головна в минулому, підрядна передає перспективу: ${M(["одночасність: imparfait", "раніше: plus-que-parfait", "пізніше: conditionnel", "після passé composé та plus-que-parfait"])}</p>
  <p><i>Je pensais qu'il viendrait. Il m'a dit qu'il avait fini. Elle espérait qu'on lui répondrait.</i></p>
  <p>Для subjonctif у розмові: <i>présent</i> (одночасно або пізніше), <i>passé</i> (раніше): <i>Je voulais qu'il vienne. Je suis content qu'il soit venu.</i> Imparfait du subjonctif (<i>qu'il vînt</i>) у літературі.</p>`);
T("B2", "Стиль", "Ne explétif та інверсія", `
  <p><b>Ne explétif</b> (письмова мова, не заперечує): після <i>avoir peur que, craindre que, éviter que, empêcher que, avant que, à moins que, douter que (у питанні)</i>: <i>Je crains qu'il ne vienne.</i> Його можна опускати.</p>
  <p><b>Інверсія</b> після <i>peut-être, sans doute, à peine, aussi (отже), ainsi, encore</i> на початку: <i>Peut-être viendra-t-il. À peine était-il parti que …</i> Часто замість неї <i>peut-être que + звичайний порядок</i>.</p>
  <p>Між дієсловом і підметом-займенником при інверсії у 3 особі додається <b>-t-</b>: <i>A-t-il, parle-t-elle</i>.</p>`);
T("B2", "Стиль", "Безособові та номінальні конструкції", `
  <p><b>Безособові</b>: <i>il s'agit de, il paraît que, il semble que, il se peut que (+ subj), il est interdit de, il importe de, il suffit de, il reste, il arrive que</i>.</p>
  <p><b>Номіналізація</b> робить текст стислішим: <i>arriver → l'arrivée, décider → la décision, réussir → la réussite, partir → le départ, améliorer → l'amélioration, hésiter → l'hésitation</i>.</p>
  ${E("Après son arrivée, la décision a été prise.", "Замість: Après qu'il est arrivé, on a décidé.")}`);

T("A1", "Вимова й письмо", "Апостроф та елізія", `
  <p>Короткі слова на <b>-e / -a</b> втрачають голосну перед словом, що починається з голосної або німого h, і замість неї ставиться апостроф: <i>je → j'</i> (<i>j'aime</i>), <i>le / la → l'</i> (<i>l'ami, l'école</i>), <i>de → d'</i>, <i>ne → n'</i>, <i>me / te / se → m' / t' / s'</i>, <i>ce → c'</i> (<i>c'est</i>), <i>que → qu'</i>, <i>si + il(s) → s'il(s)</i> (але <i>si elle</i> без апострофа).</p>
  <p>Елізії немає перед h aspiré (<i>le héros, la honte</i>) і перед словами <i>onze, oui</i>: <i>le onze, le oui</i>.</p>`);
T("A1", "Вимова й письмо", "Великі літери та пунктуація", `
  <p>З малої літери пишуться дні тижня, місяці, мови й прикметники національності: <i>lundi, mars, le français, un livre ukrainien</i>. З великої лише іменники-назви людей: <i>un Français, une Ukrainienne</i>.</p>
  <p>Перед <b>? ! : ;</b> і всередині лапок <b>« »</b> ставиться пробіл: <i>Tu viens ? « Oui ! »</i>. Перед <i>et</i> коми немає.</p>
  <p>Діалог починають із тире. Числа: <i>1 000</i> (пробіл), <i>3,5</i> (кома замість крапки).</p>`);
T("A1", "Дієслова", "Дієслова на -re (vendre, attendre, répondre)", `
  <p>Прибираємо <i>-re</i> і додаємо: ${M(["-s", "-s", "— (нічого)", "-ons", "-ez", "-ent"])}</p>
  ${E("Je vends, tu vends, il vend, nous vendons, vous vendez, ils vendent.", "")}
  <p>Так само: <i>attendre, répondre, entendre, descendre, perdre, rendre, défendre</i>. У 3 особі однини закінчення немає. При інверсії додається <b>d</b>: <i>vend-il ? attend-elle ?</i>.</p>
  <p><b>Prendre</b> і його родина (<i>comprendre, apprendre, surprendre</i>) має особливості: <i>nous prenons, ils prennent</i>.</p>`);
T("A1", "Дієслова", "Ще часті нерегулярні дієслова (présent)", `
  <p><b>mettre</b>: <i>mets, mets, met, mettons, mettez, mettent</i>.</p>
  <p><b>partir / sortir / dormir</b>: <i>pars, pars, part, partons, partez, partent</i> (так само sors…, dors…).</p>
  <p><b>lire</b>: <i>lis, lis, lit, lisons, lisez, lisent</i>. <b>écrire</b>: <i>écris, écris, écrit, écrivons, écrivez, écrivent</i>.</p>
  <p><b>boire</b>: <i>bois, bois, boit, buvons, buvez, boivent</i>. <b>croire</b>: <i>crois, crois, croit, croyons, croyez, croient</i>.</p>
  <p><b>connaître</b>: <i>connais, connais, connaît, connaissons, connaissez, connaissent</i>.</p>
  <p><b>devoir</b>: <i>dois, dois, doit, devons, devez, doivent</i>. <b>vivre</b>: <i>vis, vis, vit, vivons, vivez, vivent</i>.</p>
  <p><b>ouvrir</b> (як дієслово на -er): <i>ouvre, ouvres, ouvre, ouvrons, ouvrez, ouvrent</i>. Так само <i>offrir, découvrir</i>.</p>`);
T("A1", "Дієслова", "Вирази з avoir та faire", `
  <p><b>avoir</b> у стійких виразах: <i>avoir faim / soif / chaud / froid / peur / sommeil, avoir raison / tort, avoir besoin de, avoir envie de, avoir mal à, avoir lieu</i>. Українською «мені холодно», по-французьки <i>j'ai froid</i>.</p>
  <p><b>faire</b>: <i>faire du sport, faire la cuisine, faire les courses, faire la vaisselle, faire le ménage, faire attention, faire la queue, faire un voyage, faire une promenade, faire la connaissance de</i>.</p>
  <p>Ціна: <i>Ça fait 10 euros.</i> Погода: <i>Il fait beau.</i></p>`);
T("A1", "Дієслова", "Подобається: aimer, préférer, adorer, détester", `
  <p>Після <i>aimer, adorer, détester, préférer</i> іменник вживається <b>з означеним артиклем</b>: <i>J'aime le café. Il déteste les chats.</i> Після них може стояти й інфінітив: <i>J'aime lire. Nous préférons rester.</i></p>
  <p><i>aimer</i> = любити; <i>aimer bien</i> = подобатися; <i>aimer mieux</i> = віддавати перевагу. Також: <i>Ça me plaît. Ça ne me plaît pas.</i> Згода: <i>Moi aussi. Moi non plus.</i></p>`);
T("A1", "Дієслова", "Погода та безособові конструкції", `
  <p>Безособовий підмет <b>il</b>: <i>Il pleut. Il neige. Il fait beau / mauvais / chaud / froid. Il y a du vent / du soleil / du brouillard.</i> Питання: <i>Quel temps fait-il ?</i></p>
  <p>Інші: <i>il faut + інфінітив</i> (треба), <i>il est tard</i>, <i>il est huit heures</i>, <i>il paraît que</i>, <i>il s'agit de</i>.</p>
  <p>У розмові часто <i>ça</i>: <i>Ça pleut</i> не вживається, а <i>Ça va ? Ça marche.</i> вживається.</p>`);
T("A1", "Речення", "Порядок слів у реченні", `
  <p>Базовий порядок: <b>підмет + дієслово + додаток</b>: <i>Je mange une pomme.</i></p>
  <p>Час і місце можуть стояти на початку або в кінці: <i>Demain, je travaille. Je travaille demain.</i></p>
  <p>Займенники-додатки стоять <b>перед дієсловом</b>: <i>Je le vois.</i> Заперечення обгортає дієслово: <i>Je ne le vois pas.</i> Прикметник зазвичай після іменника.</p>
  <p>Питання без est-ce que: підмет-дієслово зі зміною інтонації або інверсія. Короткі прислівники (<i>bien, déjà, souvent</i>) стоять після відмінюваного дієслова.</p>`);
T("A1", "Речення", "Quel, quelle, quels, quelles", `
  <p>«Який, яка, які» узгоджується з іменником у роді й числі: ${M(["quel (ч. одн.)", "quelle (ж. одн.)", "quels (ч. мн.)", "quelles (ж. мн.)"])}</p>
  <p><i>Quel âge as-tu ? Quelle heure est-il ? À quelle heure ? Quels sont tes projets ? Quelles couleurs aimes-tu ?</i></p>
  <p>Може стояти й після <i>être</i>: <i>Quel est ton nom ?</i> Окличне: <i>Quel dommage ! Quelle surprise !</i></p>
  <p>Quel стоїть перед іменником. Замість нього без іменника вживається <i>lequel</i> (див. B1).</p>`);
T("A1", "Речення", "Привітання, знайомство й ввічливість", `
  <p>Вітання: <i>Bonjour</i> (вдень), <i>Bonsoir</i> (ввечері), <i>Salut</i> (неформально). Прощання: <i>Au revoir, À bientôt, À demain, Bonne journée, Bonne soirée</i>.</p>
  <p>Знайомство: <i>Je m'appelle … Je suis ukrainien(ne). J'ai … ans. J'habite à … Enchanté(e). Comment vous appelez-vous ? Comment vas-tu / allez-vous ? Je vais bien, et toi / vous ?</i></p>
  <p>Ввічливість: <i>S'il vous plaît / s'il te plaît, merci (beaucoup), de rien, pardon, excusez-moi, je suis désolé(e)</i>.</p>
  <p>На уроці: <i>Je ne comprends pas. Pouvez-vous répéter ? Plus lentement, s'il vous plaît. Comment ça s'écrit ?</i></p>`);
T("A1", "Числа й час", "Дні, місяці, пори року, дата", `
  <p>Дні: <i>lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche</i>. <b>Lundi</b> = цього понеділка, <b>le lundi</b> = щопонеділка.</p>
  <p>Місяці: <i>janvier, février, mars, avril, mai, juin, juillet, août, septembre, octobre, novembre, décembre</i>: <i>en mars / au mois de mars</i>.</p>
  <p>Пори року: <i>au printemps, en été, en automne, en hiver</i>.</p>
  <p>Дата: <i>Nous sommes le 17 novembre. Le 1er mai. Quelle est la date ?</i> Рік: <i>en 2026</i>.</p>`);
T("A1", "Числа й час", "Порядкові числівники", `
  <p>Утворюються додаванням <b>-ième</b> до кількісного: <i>deuxième, troisième, quatrième, dixième</i>. Особливі: <i>premier / première</i>, <i>cinquième</i> (u), <i>neuvième</i> (f → v), <i>vingt et unième</i>.</p>
  <p>Для двох елементів вживають <i>second(e)</i>, але в розмові часто й <i>deuxième</i>. Останній: <i>dernier</i>.</p>
  <p>Скорочення: <i>1er, 1re, 2e, 3e</i>. Дати: тільки перше число порядкове (<i>le 1er mai</i>), решта кількісні (<i>le 5 mai</i>).</p>`);
T("A1", "Числа й час", "Транспорт і спосіб пересування", `
  <p><b>en</b> + транспорт, у який сідають: <i>en voiture, en train, en bus, en avion, en taxi, en métro, en bateau</i>.</p>
  <p><b>à</b> + відкритий транспорт чи ходьба: <i>à pied, à vélo, à moto, à cheval</i>.</p>
  <p>З артиклем: <i>prendre le train, prendre le bus</i> (їхати, користуватися), а <i>par le train</i> у формальній мові.</p>
  ${E("Je vais au travail en voiture, mais mon frère y va à vélo.", "Я їжджу на роботу машиною, а мій брат їздить велосипедом.")}`);
T("A1", "Числа й час", "Інтенсивність і міра: très, trop, assez, beaucoup", `
  <p><b>très</b> + прикметник або прислівник: <i>très grand, très bien</i>. Біля дієслова <i>très</i> не вживається.</p>
  <p><b>beaucoup</b> біля дієслова: <i>Il mange beaucoup.</i> З іменником <i>beaucoup de</i>: <i>beaucoup de temps</i>. Не кажуть <i>très beaucoup</i>.</p>
  <p><i>trop</i> (занадто), <i>assez</i> (достатньо), <i>un peu</i> (трохи), <i>peu</i> (мало): <i>trop cher, assez grand, un peu fatigué</i>.</p>`);
T("A2", "Дієслова", "Savoir чи connaître", `
  <p><b>savoir</b>: знати факт, уміти: <i>Je sais nager. Je sais que tu viens. Je sais où il habite.</i> Після нього інфінітив, que або питальне слово.</p>
  <p><b>connaître</b>: бути знайомим з людиною, місцем, річчю: <i>Je connais Paul. Je connais Paris. Tu connais ce film ?</i> Після нього іменник.</p>
  <p>Для мов обидва: <i>Je sais le français</i>, але частіше <i>Je parle français</i>.</p>`);
T("A2", "Дієслова", "Être en train de, aller, venir de", `
  <p><b>être en train de + інфінітив</b>: дія відбувається просто зараз: <i>Je suis en train de manger.</i> (я саме їм)</p>
  <p>Поряд: <b>aller + інф.</b> (скоро буде), <b>venir de + інф.</b> (щойно було): <i>Il va partir. Il vient de partir.</i></p>
  <p>У минулому: <i>J'étais en train de dormir quand tu as appelé.</i></p>`);
T("A2", "Дієслова", "Дієслова на -ir 3-ї групи та споріднені", `
  <p><b>partir, sortir, dormir, servir, sentir</b>: <i>pars, pars, part, partons, partez, partent</i>. <b>venir, tenir</b> (<i>viens, tiens</i>), <b>courir</b> (<i>cours</i>), <b>ouvrir, offrir</b> (як -er: <i>j'ouvre</i>).</p>
  <p>Participe passé: <i>parti, sorti, dormi, servi, venu, tenu, couru, ouvert, offert</i>.</p>
  <p>Не плутати з регулярними на <i>-issons</i> (<i>finir, choisir</i>).</p>`);
T("A2", "Дієслова", "Підрядні з que: je pense que, il dit que", `
  <p>Після <i>penser, croire, savoir, dire, voir, trouver, espérer, comprendre</i> йде <b>que</b> і індикатив: <i>Je pense que tu as raison. Il dit qu'il vient. J'espère que tu viendras.</i></p>
  <p>Que не можна пропускати (як англійське that). Перед голосною <i>qu'</i>.</p>
  <p>Якщо підмет той самий, можливий інфінітив: <i>Je pense partir demain</i> = <i>Je pense que je pars demain.</i></p>`);
T("A2", "Дієслова", "Заперечення інфінітива", `
  <p>Обидві частини заперечення стоять <b>перед інфінітивом</b>: <i>Je préfère ne pas venir. Il décide de ne plus fumer. Il promet de ne jamais mentir.</i></p>
  <p>Займенники між ne pas і інфінітивом: <i>Je préfère ne pas le faire. Il décide de ne pas se lever.</i></p>`);
T("A2", "Дієслова", "Пропозиції: On va …, Si on allait …", `
  <p>Запропонувати: <i>On va au cinéma ? On pourrait manger ensemble. Tu veux venir ? Ça te dit de sortir ?</i></p>
  <p><b>Si + imparfait</b> для ввічливої пропозиції: <i>Si on allait au restaurant ? Et si on partait ?</i></p>
  <p>Відповіді: <i>Pourquoi pas ! D'accord. Avec plaisir. Bonne idée. Désolé, je ne peux pas.</i></p>`);
T("A2", "Дієслова", "Взаємні та ідіоматичні займенникові дієслова", `
  <p><b>Взаємні</b> (одне одного): <i>Ils se parlent. Nous nous aimons. Elles se téléphonent.</i> У passé composé <i>se</i> тут COI, тому без узгодження: <i>Elles se sont parlé.</i></p>
  <p><b>Ідіоматичні</b>: <i>s'en aller, se dépêcher, se rappeler qc, se souvenir de, s'intéresser à, se trouver, s'appeler, se rendre compte</i>.</p>`);
T("A2", "Займенники", "Неозначені займенники", `
  <p><i>quelqu'un</i> (хтось), <i>quelque chose</i> (щось), <i>quelques</i> (кілька, з іменником), <i>plusieurs</i> (кілька), <i>chacun / chacune</i> (кожен), <i>certains</i> (деякі), <i>d'autres</i> (інші), <i>n'importe qui / quoi / où</i> (будь-хто, що, де).</p>
  <p>З прикметником додається <b>de</b>: <i>quelque chose de bon, rien de nouveau, quelqu'un d'autre</i>.</p>
  ${E("Quelqu'un a téléphoné. Je n'ai rien de spécial à dire.", "")}`);
T("A2", "Займенники", "Tout, tous, toute, toutes", `
  <p><b>Прикметник</b>: <i>tout le monde</i> (всі, дієслово в однині), <i>tout le temps, toute la journée, tous les jours, toutes les semaines</i>.</p>
  <p><b>Займенник</b>: <i>Tout va bien. Ils sont tous là</i> (tous читається [тюс]). <i>Elles sont toutes venues.</i></p>
  <p><b>Прислівник</b> «дуже, зовсім»: <i>tout petit, tout à fait, tout de suite, toute petite</i>.</p>`);
T("A2", "Займенники", "Питальні займенники з прийменниками", `
  <p>З особами: <i>avec qui, pour qui, chez qui, à qui, de qui</i>. З речами: <i>à quoi, de quoi, avec quoi, pour quoi</i>.</p>
  <p>Хто / що в різних функціях: ${M(["підмет: qui / qui est-ce qui", "додаток: qui est-ce que / qui", "що (підмет): qu'est-ce qui", "що (додаток): qu'est-ce que / que"])}</p>
  <p>Інші: <i>à quelle heure, depuis quand, jusqu'à quand, d'où, par où, pour combien de temps</i>.</p>
  ${E("Avec qui parles-tu ? À quoi penses-tu ? Qu'est-ce qui se passe ?", "")}`);
T("A2", "Займенники", "C'est чи ça (ceci, cela)", `
  <p><b>C'est</b> + іменник або прикметник описує щось конкретне: <i>C'est un livre. C'est facile.</i></p>
  <p><b>Ça</b> (розмовне від <i>cela</i>) заміщує загальну ідею або дію: <i>Ça va ? Ça me plaît. J'aime ça. Ça dépend.</i></p>
  <p><i>ceci</i> «оце», <i>cela</i> «те»: <i>Prends ceci, laisse cela.</i> У письмі <i>cela</i>, у розмові <i>ça</i>.</p>`);
T("A2", "Займенники", "Приналежність: c'est à moi", `
  <p><b>être à + тонічний</b>: <i>Ce livre est à moi. C'est à toi ? Ce sac est à elle.</i></p>
  <p>Також <i>un ami à moi</i> (мій друг, розм.) і <i>un de mes amis</i>.</p>`);
T("A2", "Порівняння й кількість", "Слова часу й частоти", `
  <p>Частота: <i>toujours, souvent, parfois, quelquefois, rarement, jamais (ne … jamais), d'habitude, tous les jours, chaque semaine</i>.</p>
  <p><b>déjà</b> (вже), <b>pas encore</b> (ще не), <b>encore</b> (ще, знову), <b>toujours</b> (досі), <b>ne … plus</b> (вже не): <i>Tu as déjà mangé ? Non, pas encore.</i> <i>Il est toujours là. Il n'est plus là.</i></p>
  <p>Момент: <i>bientôt, tout de suite, tout à l'heure</i> (скоро / нещодавно), <i>longtemps, enfin, puis, après, avant</i>.</p>`);
T("A2", "Порівняння й кількість", "Il est + прикметник + de, c'est + прикметник + à", `
  <p><b>il est + прикметник + de + інфінітив</b>: <i>Il est facile de comprendre. Il est important de dormir.</i></p>
  <p><b>c'est + прикметник + à + інфінітив</b> (про конкретну річ): <i>Ce texte est facile à comprendre. C'est difficile à dire.</i></p>
  <p><i>c'est + прикметник</i> без додатка: <i>C'est facile.</i></p>`);
T("A2", "Порівняння й кількість", "De замість des перед прикметником", `
  <p>Перед прикметником у множині неозначений артикль часто стає <b>de</b>: <i>de beaux livres, de grandes villes</i>. Але у сталих сполуках лишається <i>des</i>: <i>des jeunes filles, des petits pois</i>.</p>
  <p>У розмові <i>des beaux livres</i> теж трапляється.</p>`);
T("A2", "Порівняння й кількість", "Ça fait … que", `
  <p><i>Ça fait deux ans que j'habite ici.</i> = <i>J'habite ici depuis deux ans.</i></p>
  <p>Також <i>Il y a deux ans que …</i>. Окремо: <i>Ça fait longtemps !</i> (давно не бачилися)</p>`);
T("B1", "Займенники", "Lequel, laquelle, lesquels, lesquelles", `
  <p><b>Lequel</b> = <i>le + quel</i>: форма змінюється за родом і числом іменника, який замінює. ${M(["lequel (ч. одн.)", "laquelle (ж. одн.)", "lesquels (ч. мн.)", "lesquelles (ж. мн.)"])}</p>
  <p><b>1. Питання «який із».</b> Іменник уже названо, повторювати його не треба: <i>J'ai deux robes. Laquelle préfères-tu ? Lequel de ces livres veux-tu ?</i></p>
  <p><b>2. Злиття з прийменниками à і de.</b></p>
  <p>${M(["à + lequel → auquel", "à + laquelle → à laquelle", "à + lesquels → auxquels", "à + lesquelles → auxquelles", "de + lequel → duquel", "de + laquelle → de laquelle", "de + lesquels → desquels", "de + lesquelles → desquelles"])}</p>
  <p>Інші прийменники (<i>avec, pour, sur, dans, sans, sous, entre, par, chez</i>) не зливаються: <i>avec lequel, pour laquelle, sur lesquels</i>.</p>
  <p><b>3. Відносний займенник після прийменника (про речі).</b> <i>La table sur laquelle j'ai posé le livre. Le stylo avec lequel j'écris. Les raisons pour lesquelles il est parti. Le projet auquel je pense.</i></p>
  <p><b>4. Про людей</b> після прийменника частіше <i>qui</i>: <i>l'ami avec qui je voyage</i>. Lequel теж можливий, особливо при неоднозначності: <i>le médecin auquel j'ai écrit / à qui j'ai écrit</i>.</p>
  <p><b>5. Не плутати.</b> <i>Quel</i> стоїть перед іменником (<i>Quel livre veux-tu ?</i>), <i>lequel</i> замінює його (<i>Lequel veux-tu ?</i>). Для de + що/хто частіше <i>dont</i>, але після складених прийменників (<i>près de, à côté de, au bout de</i>) беруть <i>duquel, de laquelle …</i>: <i>le quartier près duquel j'habite</i>.</p>`);
T("A1", "Займенники", "Займенник on", `
  <p><b>On</b> означає «ми» в розмовній мові або «люди, хтось» узагалі. Дієслово завжди в 3-й особі однини, як після il.</p>
  ${E("On va au cinéma ce soir ?", "Ми йдемо в кіно сьогодні ввечері?")}
  ${E("En France, on mange tard.", "У Франції їдять пізно.")}
  ${E("On m'a volé mon vélo.", "У мене вкрали велосипед.")}
  <p>Коли on = «ми», прикметник може бути в множині: <i>On est contents.</i></p>`);
T("A1", "Іменник і артикль", "Приналежність з de: le livre de Paul", `
  <p>Чиє щось, показує <b>de</b>: <i>la voiture <b>de</b> Marie</i>, <i>le chien <b>de</b> mon frère</i>. Українською це родовий відмінок.</p>
  <p>Злиття: <b>de + le = du</b>, <b>de + les = des</b>: <i>le bureau <b>du</b> directeur, la maison <b>des</b> voisins</i>. <i>De la</i> і <i>de l'</i> не змінюються.</p>
  ${E("C'est le téléphone de Paul.", "Це телефон Поля.")}
  ${E("La porte du garage est ouverte.", "Двері гаража відчинені.")}`);
T("A1", "Іменник і артикль", "Національності та професії: жіночий рід", `
  <p>Зазвичай додаємо <b>-e</b>: <i>français → française, avocat → avocate</i>. Якщо слово вже закінчується на -e, воно не змінюється: <i>belge, suisse, journaliste</i>.</p>
  ${M(["-ien → -ienne", "-on → -onne", "-er → -ère", "-eur → -euse", "-teur → -trice"])}
  ${E("Il est italien, elle est italienne.", "Він італієць, вона італійка.")}
  ${E("Il est serveur, elle est serveuse.", "Він офіціант, вона офіціантка.")}
  <p>Після <i>être</i> професію й національність пишемо <b>без артикля</b>: <i>Elle est médecin.</i> Але <i>C'est un médecin.</i></p>`);
T("A2", "Минулий час", "Passé composé займенникових дієслів", `
  <p>Займенникові дієслова в passé composé завжди з <b>être</b>. Займенник стоїть перед допоміжним: <i>je <b>me suis</b> levé</i>.</p>
  ${M(["je me suis levé(e)", "tu t'es levé(e)", "il s'est levé / elle s'est levée", "nous nous sommes levé(e)s", "vous vous êtes levé(e)(s)", "ils se sont levés / elles se sont levées"])}
  ${E("Elle s'est réveillée à 7 h.", "Вона прокинулася о 7:00.")}
  <p>Заперечення обгортає займенник і допоміжне: <i>Je <b>ne</b> me suis <b>pas</b> lavé.</i></p>`);
T("B1", "Складні форми", "Висловлення думки: indicatif чи subjonctif", `
  <p>Після ствердних <i>je pense que, je crois que, je trouve que, il me semble que</i> вживаємо <b>indicatif</b>: <i>Je pense qu'il <b>a</b> raison.</i></p>
  <p>Після заперечення чи питання з інверсією, коли є сумнів, вживаємо <b>subjonctif</b>: <i>Je ne pense pas qu'il <b>ait</b> raison. Crois-tu qu'elle <b>vienne</b> ?</i></p>
  <p>Після <i>je doute que, je ne suis pas sûr que, il est possible que</i> завжди subjonctif, а після <i>il est sûr que, il est probable que</i> indicatif.</p>
  ${E("Je crois qu'il viendra. / Je ne crois pas qu'il vienne.", "Я думаю, що він прийде. / Не думаю, що він прийде.")}`);
T("B1", "Складні форми", "Обмеження ne … que", `
  <p><b>Ne … que</b> означає «лише, тільки». Це не заперечення: <i>Je <b>n'</b>ai <b>que</b> dix euros.</i> = У мене лише десять євро.</p>
  <p><b>Que</b> стоїть безпосередньо перед тим, що обмежуємо: <i>Il ne travaille que le matin. Elle n'a parlé qu'à son frère.</i></p>
  <p>Після <i>ne … que</i> артикль <b>не змінюється на de</b>: <i>Je ne bois que <b>du</b> thé.</i> Синонім: <i>seulement</i>.</p>`);
T("B2", "Займенники", "Нейтральні займенники le, en, y", `
  <p><b>Le</b> замінює цілу думку або прикметник: <i>Il est malade ? Oui, je <b>le</b> sais.</i> <i>Fatiguée ? Je <b>le</b> suis.</i></p>
  <p><b>En</b> замінює думку після дієслів з <b>de</b>: <i>Tu as parlé de ton projet ? Oui, j'<b>en</b> ai parlé.</i> <i>Je m'<b>en</b> souviens.</i></p>
  <p><b>Y</b> замінює думку після дієслів з <b>à</b>: <i>Tu penses à ton examen ? J'<b>y</b> pense.</i> <i>Je n'<b>y</b> crois pas.</i></p>`);
T("B2", "Стиль", "Регістри мовлення: soutenu, courant, familier", `
  <p>Одну думку можна сказати по-різному залежно від ситуації.</p>
  ${M(["familier: T'as vu ? Je sais pas.", "courant: Tu as vu ? Je ne sais pas.", "soutenu: Avez-vous vu ? Je ne sais point."])}
  <p>Розмовна мова губить <i>ne</i>, скорочує <i>tu as → t'as</i>, вживає <i>on</i> замість <i>nous</i> і слова <i>bouquin, boulot, bagnole</i>. У листах і на роботі вживаємо courant або soutenu: <i>livre, travail, voiture</i>.</p>
  <p>Ознаки soutenu: інверсія в питаннях, <i>ne</i> без <i>pas</i> з <i>pouvoir, savoir, oser</i>, passé simple у тексті.</p>`);
T("B2", "Логіка тексту", "Час і протиставлення: alors que, tandis que, à peine … que", `
  <p><b>Alors que / tandis que</b> означають «тоді як» (протиставлення) або «у той час як» (одночасність): <i>Il travaille <b>alors que</b> sa sœur dort.</i></p>
  <p><b>À peine … que</b> = «щойно … як». На початку речення потребує інверсії: <i><b>À peine</b> était-il arrivé <b>qu'</b>il a dû repartir.</i></p>
  <p><b>Au moment où</b> = у той момент, коли; <b>dès que / aussitôt que</b> = щойно; <b>tant que</b> = доки.</p>`);
T("B2", "Складні форми", "Складні заперечення: ne … ni … ni, ne … aucun, ne … guère", `
  ${M(["ne … ni … ni", "ne … aucun(e)", "ne … nulle part", "ne … guère", "ne … pas encore", "ne … plus jamais"])}
  ${E("Je ne bois ni thé ni café.", "Я не п'ю ні чаю, ні кави.")}
  ${E("Il n'a aucune idée.", "Він не має жодного уявлення.")}
  ${E("Je ne l'ai vu nulle part.", "Я ніде його не бачив.")}
  <p>Після <i>ni … ni</i> неозначений і частковий артиклі зникають: <i>Il n'a ni frère ni sœur.</i> Означений залишається: <i>Je n'aime ni le thé ni le café.</i></p>`);
var GP1 = ["Тонічні займенники", "Наказовий спосіб (impératif)", "Займенникові дієслова", "Прислівники", "Прийменники часу: depuis, pendant, il y a, dans, en", "Participe présent і gérondif", "Непряма мова", "Conditionnel passé", "Conditionnel présent", "Devoir, pouvoir, vouloir та il faut", "Futur simple", "Il y a, c'est та il est", "Imparfait", "Lequel, laquelle, lesquels, lesquelles", "Passé composé", "Passé composé чи imparfait", "Plus-que-parfait", "Subjonctif passé та вибір між subjonctif і indicatif", "Subjonctif présent", "Y та en", "Être та avoir (présent)", "Артиклі: означені, неозначені, частковий", "Відносні займенники dont та інші", "Дієслова з прийменниками", "Дієслова на -er (présent)", "Дієслова на -ir і часті нерегулярні", "Заперечення ne … pas", "Кількість: beaucoup de, un peu de та інші", "Непрямий додаток (COI)", "Особові займенники", "Питання", "Подвійні займенники та їх порядок", "Порівняння та найвищий ступінь", "Прикметники: узгодження та місце", "Причина, наслідок, мета", "Протиставлення та поступка", "Прямий додаток (COD)", "Речення з si", "Розширені заперечення", "Рід і число іменників", "Складні відносні займенники", "Узгодження participe passé"];
var GP3 = ["De замість des перед прикметником", "Il est + прикметник + de, c'est + прикметник + à", "Ne explétif та інверсія", "Passé simple", "Ça fait … que", "Інтенсивність і міра: très, trop, assez, beaucoup", "Апостроф та елізія", "Безособові та номінальні конструкції", "Великі літери та пунктуація", "Взаємні та ідіоматичні займенникові дієслова", "Дні, місяці, пори року, дата", "Дія через faire, laisser, voir + інфінітив", "Заперечення інфінітива", "Погода та безособові конструкції", "Подобається: aimer, préférer, adorer, détester", "Порядкові числівники", "Порядок слів у реченні", "Приналежність: c'est à moi", "Пропозиції: On va …, Si on allait …", "Транспорт і спосіб пересування"];
var GORD = ["Особові займенники", "Être та avoir (présent)", "Дієслова на -er (présent)", "Артиклі: означені, неозначені, частковий", "Заперечення ne … pas", "Питання", "Рід і число іменників", "Прикметники: узгодження та місце", "Дієслова на -ir і часті нерегулярні", "Il y a, c'est та il est", "Passé composé", "Imparfait", "Passé composé чи imparfait", "Futur simple", "Прямий додаток (COD)", "Непрямий додаток (COI)", "Y та en", "Порівняння та найвищий ступінь", "Кількість: beaucoup de, un peu de та інші", "Розширені заперечення", "Devoir, pouvoir, vouloir та il faut", "Conditionnel présent", "Речення з si", "Subjonctif présent", "Plus-que-parfait", "Відносні займенники dont та інші", "Lequel, laquelle, lesquels, lesquelles", "Подвійні займенники та їх порядок", "Узгодження participe passé", "Дієслова з прийменниками", "Subjonctif passé та вибір між subjonctif і indicatif", "Conditionnel passé", "Складні відносні займенники", "Причина, наслідок, мета", "Протиставлення та поступка", "Присвійні та вказівні прикметники", "Прийменники місця й напрямку", "Числівники, дата і час", "Займенникові дієслова", "Futur proche та passé récent", "Наказовий спосіб (impératif)", "Дієслова на -re (vendre, attendre, répondre)", "Quel, quelle, quels, quelles", "Привітання, знайомство й ввічливість", "Вирази з avoir та faire", "Ще часті нерегулярні дієслова (présent)", "Вимова й правопис", "Подобається: aimer, préférer, adorer, détester", "Погода та безособові конструкції", "Порядок слів у реченні", "Інтенсивність і міра: très, trop, assez, beaucoup", "Дні, місяці, пори року, дата", "Транспорт і спосіб пересування", "Порядкові числівники", "Апостроф та елізія", "Великі літери та пунктуація", "Приналежність: c'est à moi", "De замість des перед прикметником", "Ça fait … que", "Il est + прикметник + de, c'est + прикметник + à", "Заперечення інфінітива", "Пропозиції: On va …, Si on allait …", "Взаємні та ідіоматичні займенникові дієслова", "Passé simple", "Ne explétif та інверсія", "Безособові та номінальні конструкції", "Дія через faire, laisser, voir + інфінітив"];
