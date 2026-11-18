/* Практика: граматичні теми */
var T_COD = [
  { pre: "Je mange la pomme. Je ", post: " mange.", verb: "la pomme", tr: "Я їм яблуко. Я його їм.", a: ["la"], o: ["la", "le", "lui", "les"], why: "La pomme: жіночий рід, однина, прямий додаток: la." },
  { pre: "Tu regardes le film ? Tu ", post: " regardes ?", verb: "le film", tr: "Ти дивишся фільм? Ти його дивишся?", a: ["le"], o: ["le", "lui", "la", "les"], why: "Le film: чоловічий рід, однина: le." },
  { pre: "Elle aime ses enfants. Elle ", post: " aime.", verb: "ses enfants", tr: "Вона любить своїх дітей. Вона їх любить.", a: ["les"], o: ["les", "leur", "le", "la"], why: "Ses enfants: множина, прямий додаток: les." },
  { pre: "Nous prenons le train. Nous ", post: " prenons.", verb: "le train", tr: "Ми їдемо потягом. Ми його беремо.", a: ["le"], o: ["le", "lui", "les", "leur"], why: "Le train: чоловічий рід: le." },
  { pre: "Il cherche Marie. Il ", post: " cherche.", verb: "Marie", tr: "Він шукає Марі. Він її шукає.", a: ["la"], o: ["la", "lui", "le", "les"], why: "Chercher бере прямий додаток без прийменника. Marie: жіночий рід: la." },
  { pre: "Je regarde Anna. Je ", post: " regarde.", verb: "Anna", tr: "Я дивлюся на Анну. Я дивлюся на неї.", a: ["l'"], o: ["l'", "la", "lui", "le"], why: "Перед голосною le і la стають l'." },
  { pre: "Il ouvre la porte. Il ", post: " ouvre.", verb: "la porte", tr: "Він відчиняє двері. Він їх відчиняє.", a: ["l'"], o: ["l'", "la", "le", "lui"], why: "Ouvre починається з голосної: l'." },
  { pre: "Vous écoutez la radio ? Vous ", post: " écoutez ?", verb: "la radio", tr: "Ви слухаєте радіо? Ви його слухаєте?", a: ["l'"], o: ["l'", "la", "lui", "les"], why: "Écouter бере прямий додаток. Голосна: l'." },
  { pre: "Tu m'attends ? Oui, je ", post: " attends.", verb: "я тебе", tr: "Ти мене чекаєш? Так, я тебе чекаю.", a: ["t'"], o: ["t'", "m'", "te", "me"], why: "Мова про «тебе»: te, перед голосною t'." },
  { pre: "Je ne vois pas mes clés. Je ne ", post: " vois pas.", verb: "mes clés", tr: "Я не бачу своїх ключів. Я їх не бачу.", a: ["les"], o: ["les", "leur", "le", "la"], why: "Mes clés: множина: les." },
  { pre: "Il veut acheter la voiture. Il veut ", post: " acheter.", verb: "la voiture", tr: "Він хоче купити машину. Він хоче її купити.", a: ["l'"], o: ["l'", "la", "lui", "le"], why: "Займенник стоїть перед інфінітивом. Acheter з голосної: l'." },
  { pre: "Elle va inviter ses amis. Elle va ", post: " inviter.", verb: "ses amis", tr: "Вона запросить друзів. Вона їх запросить.", a: ["les"], o: ["les", "leur", "le", "la"], why: "Ses amis: множина: les." },
  { pre: "J'ai vu Paul. Je ", post: "ai vu hier.", verb: "Paul", tr: "Я бачив Поля. Я бачив його вчора.", a: ["l'"], o: ["l'", "le", "lui", "la"], why: "У passé composé займенник перед avoir. Ai починається з голосної: l'." },
  { pre: "Tu as lu le livre ? Oui, je ", post: "ai lu.", verb: "le livre", tr: "Ти прочитав книгу? Так, я її прочитав.", a: ["l'"], o: ["l'", "le", "lui", "la"], why: "Le livre: чоловічий рід. Перед ai: l'." },
  { pre: "Regarde la photo ! Regarde-", post: " !", verb: "la photo", tr: "Подивися на фото! Подивися на неї!", a: ["la"], o: ["la", "le", "lui", "l'"], why: "У ствердному наказовому займенник після дієслова з дефісом: regarde-la." },
  { pre: "Mes parents ", post: "aiment beaucoup.", verb: "мене", tr: "Мої батьки мене дуже люблять.", a: ["m'"], o: ["m'", "me", "moi", "lui"], why: "«Мене»: me, перед голосною m'." },
  { pre: "Vous voyez Paul et Marie ? Vous ", post: " voyez ?", verb: "Paul et Marie", tr: "Ви бачите Поля й Марі? Ви їх бачите?", a: ["les"], o: ["les", "leur", "le", "la"], why: "Двоє людей: множина: les." },
  { pre: "Je prends ce livre ? Oui, prends-", post: ".", verb: " ce livre", tr: "Мені взяти цю книгу? Так, візьми її.", a: ["le"], o: ["le", "lui", "l'", "les"], why: "Ствердний наказовий: prends-le." },
  { pre: "Il a acheté les fleurs. Il ", post: "a achetées.", verb: "les fleurs", tr: "Він купив квіти. Він їх купив.", a: ["les"], o: ["les", "leur", "le", "en"], why: "Les: множина. Participe achetées узгоджується з les (COD перед дієсловом)." },
  { pre: "Tu connais ce restaurant ? Oui, je ", post: " connais bien.", verb: "ce restaurant", tr: "Ти знаєш цей ресторан? Так, я його добре знаю.", a: ["le"], o: ["le", "lui", "la", "l'"], why: "Ce restaurant: чоловічий рід, приголосна: le." }
];

var T_COI = [
  { pre: "Je parle à Paul. Je ", post: " parle.", verb: "à Paul", tr: "Я розмовляю з Полем. Я розмовляю з ним.", a: ["lui"], o: ["lui", "le", "leur", "l'"], why: "Parler à: непрямий додаток. Однина: lui." },
  { pre: "Elle téléphone à ses parents. Elle ", post: " téléphone.", verb: "à ses parents", tr: "Вона телефонує батькам. Вона їм телефонує.", a: ["leur"], o: ["leur", "les", "lui", "leurs"], why: "À + люди в множині: leur." },
  { pre: "Nous écrivons à Marie. Nous ", post: " écrivons.", verb: "à Marie", tr: "Ми пишемо Марі. Ми їй пишемо.", a: ["lui"], o: ["lui", "la", "leur", "l'"], why: "Lui для чоловіка і жінки, однина." },
  { pre: "Tu réponds à ton chef ? Tu ", post: " réponds ?", verb: "à ton chef", tr: "Ти відповідаєш своєму шефу? Ти йому відповідаєш?", a: ["lui"], o: ["lui", "le", "leur", "y"], why: "Répondre à + особа: lui." },
  { pre: "Il donne un livre à ses amis. Il ", post: " donne un livre.", verb: "à ses amis", tr: "Він дає книгу друзям. Він їм дає книгу.", a: ["leur"], o: ["leur", "les", "lui", "y"], why: "À ses amis: множина: leur." },
  { pre: "Je dis la vérité à mon frère. Je ", post: " dis la vérité.", verb: "à mon frère", tr: "Я кажу правду своєму братові. Я йому кажу правду.", a: ["lui"], o: ["lui", "le", "leur", "l'"], why: "Dire à: lui." },
  { pre: "Tu me téléphones demain ? Oui, je ", post: " téléphone demain.", verb: "я тобі", tr: "Ти мені зателефонуєш завтра? Так, я тобі зателефоную.", a: ["te"], o: ["te", "t'", "me", "lui"], why: "«Тобі»: te. Перед приголосною te." },
  { pre: "Il demande l'heure à une dame. Il ", post: " demande l'heure.", verb: "à une dame", tr: "Він питає даму про час. Він її питає про час.", a: ["lui"], o: ["lui", "la", "leur", "l'"], why: "Demander à + особа: lui." },
  { pre: "Nous offrons des fleurs à nos voisins. Nous ", post: " offrons des fleurs.", verb: "à nos voisins", tr: "Ми даруємо квіти сусідам. Ми їм даруємо квіти.", a: ["leur"], o: ["leur", "les", "lui", "y"], why: "À + множина: leur." },
  { pre: "Elle explique la règle aux élèves. Elle ", post: " explique la règle.", verb: "aux élèves", tr: "Вона пояснює правило учням. Вона їм пояснює правило.", a: ["leur"], o: ["leur", "les", "lui", "leurs"], why: "Aux élèves: множина: leur." },
  { pre: "Je ne parle pas à Paul. Je ne ", post: " parle pas.", verb: "à Paul", tr: "Я не розмовляю з Полем. Я з ним не розмовляю.", a: ["lui"], o: ["lui", "le", "leur", "l'"], why: "Заперечення обгортає займенник і дієслово: ne lui parle pas." },
  { pre: "Il va écrire à Anna. Il va ", post: " écrire.", verb: "à Anna", tr: "Він напише Анні. Він їй напише.", a: ["lui"], o: ["lui", "la", "l'", "leur"], why: "Перед інфінітивом: va lui écrire." },
  { pre: "J'ai téléphoné à Marc. Je ", post: "ai téléphoné.", verb: "à Marc", tr: "Я телефонував Марку. Я йому телефонував.", a: ["lui"], o: ["lui", "l'", "le", "leur"], why: "У passé composé займенник перед avoir. Participe не змінюється." },
  { pre: "Tu as parlé aux voisins ? Tu ", post: " as parlé ?", verb: "aux voisins", tr: "Ти розмовляв із сусідами? Ти з ними розмовляв?", a: ["leur"], o: ["leur", "les", "lui", "y"], why: "Aux voisins: множина: leur." },
  { pre: "Écris à ta mère. Écris-", post: " !", verb: "à ta mère", tr: "Напиши мамі. Напиши їй!", a: ["lui"], o: ["lui", "la", "leur", "le"], why: "Ствердний наказовий: écris-lui." },
  { pre: "Vous me donnez le livre ? Oui, je ", post: " donne le livre.", verb: "я вам", tr: "Ви мені даєте книгу? Так, я вам даю книгу.", a: ["vous"], o: ["vous", "me", "nous", "lui"], why: "«Вам»: vous." },
  { pre: "Elle sourit à son enfant. Elle ", post: " sourit.", verb: "à son enfant", tr: "Вона усміхається своїй дитині. Вона їй усміхається.", a: ["lui"], o: ["lui", "le", "l'", "leur"], why: "Sourire à: lui." },
  { pre: "Le professeur dit bonjour aux étudiants. Il ", post: " dit bonjour.", verb: "aux étudiants", tr: "Викладач вітається зі студентами. Він із ними вітається.", a: ["leur"], o: ["leur", "les", "lui", "leurs"], why: "Aux étudiants: множина: leur." },
  { pre: "Paul envoie un message à Marie. Il ", post: " envoie un message.", verb: "à Marie", tr: "Поль надсилає повідомлення Марі. Він їй надсилає повідомлення.", a: ["lui"], o: ["lui", "la", "leur", "l'"], why: "Envoyer à: lui." },
  { pre: "Nous téléphonons à nos parents. Nous ", post: " téléphonons.", verb: "à nos parents", tr: "Ми телефонуємо батькам. Ми їм телефонуємо.", a: ["leur"], o: ["leur", "les", "lui", "leurs"], why: "À nos parents: множина: leur." }
];

var T_MIX = [
  { pre: "Je vois Marie. Je ", post: " vois.", verb: "Marie", tr: "Я бачу Марі. Я її бачу.", a: ["la"], o: ["la", "lui", "le", "leur"], why: "Voir: прямий додаток: la." },
  { pre: "Je parle à Marie. Je ", post: " parle.", verb: "à Marie", tr: "Я розмовляю з Марі. Я з нею розмовляю.", a: ["lui"], o: ["lui", "la", "l'", "y"], why: "Parler à: непрямий: lui." },
  { pre: "Il aime ses parents. Il ", post: " aime.", verb: "ses parents", tr: "Він любить своїх батьків. Він їх любить.", a: ["les"], o: ["les", "leur", "lui", "le"], why: "Aimer: прямий додаток: les." },
  { pre: "Il téléphone à ses parents. Il ", post: " téléphone.", verb: "à ses parents", tr: "Він телефонує батькам. Він їм телефонує.", a: ["leur"], o: ["leur", "les", "lui", "y"], why: "Téléphoner à: непрямий: leur." },
  { pre: "Nous attendons Paul. Nous ", post: " attendons.", verb: "Paul", tr: "Ми чекаємо Поля. Ми його чекаємо.", a: ["l'"], o: ["l'", "lui", "le", "la"], why: "Attendre: прямий додаток. Голосна: l'." },
  { pre: "Nous répondons à Paul. Nous ", post: " répondons.", verb: "à Paul", tr: "Ми відповідаємо Полю. Ми йому відповідаємо.", a: ["lui"], o: ["lui", "le", "l'", "leur"], why: "Répondre à: непрямий: lui." },
  { pre: "Elle écoute la radio. Elle ", post: " écoute.", verb: "la radio", tr: "Вона слухає радіо. Вона його слухає.", a: ["l'"], o: ["l'", "lui", "la", "leur"], why: "Écouter: прямий додаток. Голосна: l'." },
  { pre: "Elle écrit à Anna. Elle ", post: " écrit.", verb: "à Anna", tr: "Вона пише Анні. Вона їй пише.", a: ["lui"], o: ["lui", "la", "l'", "leur"], why: "Écrire à: непрямий: lui." },
  { pre: "Vous cherchez Marc ? Vous ", post: " cherchez ?", verb: "Marc", tr: "Ви шукаєте Марка? Ви його шукаєте?", a: ["le"], o: ["le", "lui", "l'", "y"], why: "Chercher: прямий додаток: le." },
  { pre: "Vous donnez un cadeau à Marc ? Vous ", post: " donnez un cadeau ?", verb: "à Marc", tr: "Ви даруєте подарунок Марку? Ви йому даруєте подарунок?", a: ["lui"], o: ["lui", "le", "l'", "leur"], why: "Donner à: непрямий: lui." },
  { pre: "Ils invitent leurs amis. Ils ", post: " invitent.", verb: "leurs amis", tr: "Вони запрошують друзів. Вони їх запрошують.", a: ["les"], o: ["les", "leur", "lui", "le"], why: "Inviter: прямий додаток: les." },
  { pre: "Ils disent merci à leurs amis. Ils ", post: " disent merci.", verb: "à leurs amis", tr: "Вони дякують друзям. Вони їм дякують.", a: ["leur"], o: ["leur", "les", "lui", "y"], why: "Dire à: непрямий: leur." },
  { pre: "Je regarde les enfants. Je ", post: " regarde.", verb: "les enfants", tr: "Я дивлюся на дітей. Я дивлюся на них.", a: ["les"], o: ["les", "leur", "lui", "le"], why: "Regarder: прямий додаток: les." },
  { pre: "Je demande aux enfants. Je ", post: " demande.", verb: "aux enfants", tr: "Я питаю дітей. Я їх питаю.", a: ["leur"], o: ["leur", "les", "lui", "l'"], why: "Demander à: непрямий: leur." },
  { pre: "Tu connais Anna ? Tu ", post: " connais ?", verb: "Anna", tr: "Ти знаєш Анну? Ти її знаєш?", a: ["la"], o: ["la", "lui", "l'", "leur"], why: "Connaître: прямий додаток: la." },
  { pre: "Tu offres des fleurs à Anna ? Tu ", post: " offres des fleurs ?", verb: "à Anna", tr: "Ти даруєш Анні квіти? Ти їй даруєш квіти?", a: ["lui"], o: ["lui", "la", "l'", "leur"], why: "Offrir à: непрямий: lui." },
  { pre: "Il prend ses clés. Il ", post: " prend.", verb: "ses clés", tr: "Він бере свої ключі. Він їх бере.", a: ["les"], o: ["les", "leur", "lui", "le"], why: "Prendre: прямий додаток: les." },
  { pre: "Il montre ses clés à Marie. Il ", post: " montre ses clés.", verb: "à Marie", tr: "Він показує ключі Марі. Він їй показує ключі.", a: ["lui"], o: ["lui", "la", "l'", "leur"], why: "Montrer à: непрямий: lui." },
  { pre: "Je ne vois pas Paul. Je ne ", post: " vois pas.", verb: "Paul", tr: "Я не бачу Поля. Я його не бачу.", a: ["le"], o: ["le", "lui", "l'", "la"], why: "Voir: прямий додаток: le." },
  { pre: "Je ne parle pas à Paul. Je ne ", post: " parle pas.", verb: "à Paul", tr: "Я не розмовляю з Полем. Я з ним не розмовляю.", a: ["lui"], o: ["lui", "le", "l'", "leur"], why: "Parler à: непрямий: lui." }
];

var T_YEN = [
  { pre: "Tu vas à Paris ? Oui, j'", post: " vais.", verb: "à Paris", tr: "Ти їдеш до Парижа? Так, я їду туди.", a: ["y"], o: ["y", "en", "le", "lui"], why: "Y замінює à + місце." },
  { pre: "Tu veux du café ? Oui, j'", post: " veux.", verb: "du café", tr: "Ти хочеш кави? Так, я хочу.", a: ["en"], o: ["en", "y", "le", "lui"], why: "En замінює частковий артикль + іменник." },
  { pre: "Il habite à Berne. Il ", post: " habite.", verb: "à Berne", tr: "Він живе в Берні. Він там живе.", a: ["y"], o: ["y", "en", "le", "lui"], why: "Y замінює à + місце." },
  { pre: "Elle mange des pommes. Elle ", post: " mange.", verb: "des pommes", tr: "Вона їсть яблука. Вона їх їсть.", a: ["en"], o: ["en", "y", "les", "lui"], why: "Des pommes: невизначена кількість: en." },
  { pre: "Nous allons au cinéma. Nous ", post: " allons.", verb: "au cinéma", tr: "Ми йдемо в кіно. Ми йдемо туди.", a: ["y"], o: ["y", "en", "le", "lui"], why: "Au cinéma = à + місце: y." },
  { pre: "Tu as des frères ? Oui, j'", post: " ai deux.", verb: "des frères", tr: "У тебе є брати? Так, у мене їх двоє.", a: ["en"], o: ["en", "y", "les", "leur"], why: "En + число: j'en ai deux." },
  { pre: "Je pense à mon travail. J'", post: " pense.", verb: "à mon travail", tr: "Я думаю про свою роботу. Я про неї думаю.", a: ["y"], o: ["y", "en", "le", "lui"], why: "Penser à + річ: y." },
  { pre: "Il vient de Paris. Il ", post: " vient.", verb: "de Paris", tr: "Він приїжджає з Парижа. Він звідти приїжджає.", a: ["en"], o: ["en", "y", "le", "lui"], why: "De + місце: en." },
  { pre: "Elle a besoin d'aide. Elle ", post: " a besoin.", verb: "d'aide", tr: "Їй потрібна допомога. Їй вона потрібна.", a: ["en"], o: ["en", "y", "lui", "le"], why: "Avoir besoin de: en." },
  { pre: "Tu réponds à cette lettre ? Tu ", post: " réponds ?", verb: "à cette lettre", tr: "Ти відповідаєш на цей лист? Ти на нього відповідаєш?", a: ["y"], o: ["y", "en", "lui", "la"], why: "Répondre à + річ: y. Lui лише для людей." },
  { pre: "Je n'ai pas de voiture. Je n'", post: " ai pas.", verb: "de voiture", tr: "У мене немає машини. У мене її немає.", a: ["en"], o: ["en", "y", "la", "lui"], why: "Pas de + іменник: en." },
  { pre: "Ils sont dans le jardin. Ils ", post: " sont.", verb: "dans le jardin", tr: "Вони в саду. Вони там.", a: ["y"], o: ["y", "en", "le", "les"], why: "Dans + місце: y." },
  { pre: "J'achète trois pommes. J'", post: " achète trois.", verb: "trois pommes", tr: "Я купую три яблука. Я купую три.", a: ["en"], o: ["en", "y", "les", "la"], why: "Число лишається: j'en achète trois." },
  { pre: "Tu reviens de Zurich ? Oui, j'", post: " reviens.", verb: "de Zurich", tr: "Ти повертаєшся з Цюриха? Так, я звідти повертаюсь.", a: ["en"], o: ["en", "y", "le", "lui"], why: "De + місце: en." },
  { pre: "Nous restons à la maison. Nous ", post: " restons.", verb: "à la maison", tr: "Ми залишаємося вдома. Ми там залишаємося.", a: ["y"], o: ["y", "en", "la", "lui"], why: "À + місце: y." },
  { pre: "Elle parle de son voyage. Elle ", post: " parle.", verb: "de son voyage", tr: "Вона розповідає про свою подорож. Вона про неї розповідає.", a: ["en"], o: ["en", "y", "le", "lui"], why: "Parler de + річ: en." },
  { pre: "Tu vas à la maison ? Vas-", post: " !", verb: "à la maison", tr: "Ти йдеш додому? Іди туди!", a: ["y"], o: ["y", "en", "la", "lui"], why: "Ствердний наказовий: vas-y (s зберігається перед y)." },
  { pre: "Tu veux des pâtes ? Prends-", post: " !", verb: "des pâtes", tr: "Хочеш макарони? Візьми!", a: ["en"], o: ["en", "y", "les", "le"], why: "Ствердний наказовий: prends-en." },
  { pre: "Il joue au tennis. Il ", post: " joue souvent.", verb: "au tennis", tr: "Він грає в теніс. Він часто в нього грає.", a: ["y"], o: ["y", "en", "le", "lui"], why: "Jouer à + спорт: y." },
  { pre: "Il y ", post: " a trois.", verb: "pommes", tr: "Є три (яблука).", a: ["en"], o: ["en", "y", "les", "le"], why: "Il y en a: en з числом. Дослівно: «їх є три»." }
];

var T_ART = [
  { pre: "J'ai ", post: " frère.", verb: "один", tr: "У мене є брат.", a: ["un"], o: ["un", "une", "le", "des"], why: "Один невизначений брат: un." },
  { pre: "Elle a ", post: " sœur.", verb: "одна", tr: "У неї є сестра.", a: ["une"], o: ["une", "un", "la", "des"], why: "Sœur: жіночий рід: une." },
  { pre: "Je bois ", post: " café.", verb: "трохи", tr: "Я п'ю каву.", a: ["du"], o: ["du", "le", "un", "de la"], why: "Частковий артикль, чоловічий рід: du." },
  { pre: "Je mange ", post: " soupe.", verb: "трохи", tr: "Я їм суп.", a: ["de la"], o: ["de la", "du", "la", "une"], why: "Частковий артикль, жіночий рід: de la." },
  { pre: "Voilà ", post: " clé que tu cherches.", verb: "та, що шукаєш", tr: "Ось ключ, який ти шукаєш.", a: ["la"], o: ["la", "une", "de la", "du"], why: "Відома конкретна річ: la." },
  { pre: "J'aime ", post: " musique.", verb: "загалом", tr: "Я люблю музику.", a: ["la"], o: ["la", "de la", "une", "du"], why: "Для вподобань означений артикль: la." },
  { pre: "Il y a ", post: " enfants dans le parc.", verb: "кілька", tr: "У парку є діти.", a: ["des"], o: ["des", "les", "de", "du"], why: "Множина, невизначено: des." },
  { pre: "Je n'ai pas ", post: " voiture.", verb: "немає", tr: "У мене немає машини.", a: ["de"], o: ["de", "une", "la", "des"], why: "Після заперечення un / une / des → de." },
  { pre: "Nous avons ", post: " temps.", verb: "трохи", tr: "У нас є час.", a: ["du"], o: ["du", "le", "un", "de"], why: "Temps, частковий: du." },
  { pre: "Elle ne mange pas ", post: " viande.", verb: "немає", tr: "Вона не їсть м'яса.", a: ["de"], o: ["de", "la", "du", "de la"], why: "Після заперечення du / de la → de." },
  { pre: "Paris est ", post: " grande ville.", verb: "одна з", tr: "Париж це велике місто.", a: ["une"], o: ["une", "du", "de", "des"], why: "Ville: жіночий рід, невизначено: une." },
  { pre: "Ferme ", post: " porte, s'il te plaît.", verb: "ця", tr: "Зачини двері, будь ласка.", a: ["la"], o: ["la", "une", "de la", "des"], why: "Конкретні двері: la." },
  { pre: "Tu veux ", post: " eau ?", verb: "трохи", tr: "Хочеш води?", a: ["de l'"], o: ["de l'", "de la", "du", "l'"], why: "Eau жіночого роду на голосну: de l'." },
  { pre: "Il y a beaucoup ", post: " monde.", verb: "багато", tr: "Там багато людей.", a: ["de"], o: ["de", "du", "des", "le"], why: "Після beaucoup завжди de." },
  { pre: "Je voudrais ", post: " kilo de pommes.", verb: "один", tr: "Я хотів би кілограм яблук.", a: ["un"], o: ["un", "du", "le", "de"], why: "Один кілограм: un." },
  { pre: "C'est ", post: " livre de Marie.", verb: "її", tr: "Це книга Марі.", a: ["le"], o: ["le", "du", "de", "des"], why: "Відомий предмет: le." },
  { pre: "Il me faut ", post: " argent.", verb: "трохи", tr: "Мені потрібні гроші.", a: ["de l'"], o: ["de l'", "de la", "du", "l'"], why: "Argent на голосну: de l'." },
  { pre: "Nous allons ", post: " cinéma.", verb: "до", tr: "Ми йдемо в кіно.", a: ["au"], o: ["au", "du", "aux", "à la"], why: "À + le = au." },
  { pre: "Il revient ", post: " États-Unis.", verb: "з", tr: "Він повертається зі Сполучених Штатів.", a: ["des"], o: ["des", "aux", "du", "les"], why: "De + les = des." },
  { pre: "Je prends ", post: " pain et du fromage.", verb: "трохи", tr: "Я беру хліб і сир.", a: ["du"], o: ["du", "le", "un", "de la"], why: "Pain: чоловічий рід, частковий: du." }
];

var T_PREP = [
  { pre: "J'habite ", post: " Paris.", verb: "місто", tr: "Я живу в Парижі.", a: ["à"], o: ["à", "en", "au", "dans"], why: "Перед містом: à." },
  { pre: "Elle habite ", post: " France.", verb: "країна", tr: "Вона живе у Франції.", a: ["en"], o: ["en", "à", "au", "aux"], why: "Жіночі країни: en." },
  { pre: "Il va ", post: " Canada.", verb: "країна", tr: "Він їде до Канади.", a: ["au"], o: ["au", "en", "à", "aux"], why: "Чоловічі країни: au." },
  { pre: "Nous allons ", post: " États-Unis.", verb: "країна", tr: "Ми їдемо до Сполучених Штатів.", a: ["aux"], o: ["aux", "au", "en", "des"], why: "Країни в множині: aux." },
  { pre: "Je suis ", post: " moi ce soir.", verb: "у моєму домі", tr: "Сьогодні ввечері я вдома.", a: ["chez"], o: ["chez", "à", "dans", "en"], why: "Chez + особа: chez moi." },
  { pre: "Le livre est ", post: " la table.", verb: "зверху", tr: "Книга на столі.", a: ["sur"], o: ["sur", "sous", "dans", "à"], why: "Sur: на." },
  { pre: "Le chat dort ", post: " le lit.", verb: "знизу", tr: "Кіт спить під ліжком.", a: ["sous"], o: ["sous", "sur", "dans", "chez"], why: "Sous: під." },
  { pre: "Elle vient ", post: " Suisse.", verb: "країна", tr: "Вона з Швейцарії.", a: ["de"], o: ["de", "du", "en", "d'"], why: "Жіноча країна: de." },
  { pre: "Il vient ", post: " Canada.", verb: "країна", tr: "Він із Канади.", a: ["du"], o: ["du", "de", "au", "des"], why: "De + le = du." },
  { pre: "J'habite ici ", post: " deux ans.", verb: "триває досі", tr: "Я живу тут уже два роки.", a: ["depuis"], o: ["depuis", "pendant", "il y a", "dans"], why: "Depuis: дія триває досі." },
  { pre: "Il est arrivé ", post: " une semaine.", verb: "тому", tr: "Він приїхав тиждень тому.", a: ["il y a"], o: ["il y a", "depuis", "pendant", "dans"], why: "Il y a: тому." },
  { pre: "Nous partons ", post: " deux jours.", verb: "через", tr: "Ми їдемо через два дні.", a: ["dans"], o: ["dans", "en", "pendant", "il y a"], why: "Dans: через (у майбутньому)." },
  { pre: "J'ai travaillé ", post: " trois heures.", verb: "тривалість", tr: "Я працював три години.", a: ["pendant"], o: ["pendant", "depuis", "dans", "il y a"], why: "Pendant: тривалість у минулому." },
  { pre: "Je pense ", post: " mon travail.", verb: "думаю про", tr: "Я думаю про свою роботу.", a: ["à"], o: ["à", "de", "sur", "pour"], why: "Penser à: думати про." },
  { pre: "Elle parle ", post: " son voyage.", verb: "розповідає про", tr: "Вона розповідає про свою подорож.", a: ["de"], o: ["de", "à", "sur", "du"], why: "Parler de: говорити про." },
  { pre: "Il a besoin ", post: " aide.", verb: "потребує", tr: "Йому потрібна допомога.", a: ["d'"], o: ["d'", "de", "à", "en"], why: "Avoir besoin de; перед голосною d'." },
  { pre: "Nous allons ", post: " le médecin.", verb: "до лікаря", tr: "Ми йдемо до лікаря.", a: ["chez"], o: ["chez", "à", "au", "dans"], why: "Chez + особа." },
  { pre: "Le restaurant est ", post: " la banque.", verb: "поруч із", tr: "Ресторан поруч із банком.", a: ["à côté de"], o: ["à côté de", "à côté", "près", "à côté à"], why: "À côté de: поруч із." },
  { pre: "Il commence ", post: " travailler.", verb: "починає", tr: "Він починає працювати.", a: ["à"], o: ["à", "de", "pour", "en"], why: "Commencer à + інфінітив." },
  { pre: "Il a fini ", post: " travailler.", verb: "закінчив", tr: "Він закінчив працювати.", a: ["de"], o: ["de", "à", "pour", "en"], why: "Finir de + інфінітив." }
];

var T_NEG = [
  { pre: "Je ", post: " parle pas anglais.", verb: "не", tr: "Я не розмовляю англійською.", a: ["ne"], o: ["ne", "n'", "non", "pas"], why: "Ne стоїть перед дієсловом." },
  { pre: "Il ", post: " aime pas le café.", verb: "не", tr: "Він не любить каву.", a: ["n'"], o: ["n'", "ne", "non", "pas"], why: "Перед голосною ne → n'." },
  { pre: "Je ne mange ", post: " de viande.", verb: "ніколи", tr: "Я ніколи не їм м'яса.", a: ["jamais"], o: ["jamais", "rien", "personne", "aucun"], why: "Ne … jamais: ніколи." },
  { pre: "Il ne voit ", post: " dans la rue.", verb: "нікого", tr: "Він нікого не бачить на вулиці.", a: ["personne"], o: ["personne", "rien", "jamais", "plus"], why: "Ne … personne: нікого." },
  { pre: "Nous n'avons ", post: " mangé.", verb: "ще не", tr: "Ми ще не їли.", a: ["pas encore"], o: ["pas encore", "personne", "plus", "rien"], why: "Ne … pas encore: ще не." },
  { pre: "Elle ne travaille ", post: " ici.", verb: "вже не", tr: "Вона тут більше не працює.", a: ["plus"], o: ["plus", "que", "rien", "personne"], why: "Ne … plus: вже не." },
  { pre: "Je n'ai ", post: " vu.", verb: "нічого", tr: "Я нічого не бачив.", a: ["rien"], o: ["rien", "personne", "jamais", "plus"], why: "Ne … rien: нічого. У passé composé rien стоїть перед participe." },
  { pre: "", post: " ne vient ce soir.", verb: "ніхто", tr: "Сьогодні ввечері ніхто не прийде.", a: ["Personne"], o: ["Personne", "Rien", "Jamais", "Plus"], why: "Personne може бути підметом: Personne ne vient." },
  { pre: "Il n'a ", post: " dix euros.", verb: "тільки", tr: "В нього лише десять євро.", a: ["que"], o: ["que", "personne", "rien", "aucun"], why: "Ne … que: тільки." },
  { pre: "Je n'ai pas ", post: " voiture.", verb: "немає", tr: "У мене немає машини.", a: ["de"], o: ["de", "une", "la", "des"], why: "Після заперечення un / une / des → de." },
  { pre: "Elle ne boit ", post: " de café.", verb: "ніколи", tr: "Вона ніколи не п'є кави.", a: ["jamais"], o: ["jamais", "rien", "personne", "aucun"], why: "Ne … jamais." },
  { pre: "Ce n'est ", post: " un chat.", verb: "не", tr: "Це не кіт.", a: ["pas"], o: ["pas", "ne", "non", "que"], why: "Ne … pas. Після être артикль не змінюється." },
  { pre: "Je n'ai vu ", post: " hier.", verb: "нікого", tr: "Я вчора нікого не бачив.", a: ["personne"], o: ["personne", "rien", "jamais", "pas"], why: "Personne стоїть після participe passé." },
  { pre: "Il ne dit ", post: " à personne.", verb: "нічого", tr: "Він нікому нічого не каже.", a: ["rien"], o: ["rien", "jamais", "plus", "pas"], why: "Ne … rien." },
  { pre: "Il n'y a ", post: " de problème.", verb: "немає", tr: "Проблем немає.", a: ["pas"], o: ["pas", "rien", "personne", "que"], why: "Il n'y a pas de + іменник." },
  { pre: "Nous ne mangeons ", post: " le soir.", verb: "ніколи", tr: "Ми ніколи не їмо ввечері.", a: ["jamais"], o: ["jamais", "rien", "personne", "aucun"], why: "Ne … jamais." },
  { pre: "Elle n'a ", post: " d'enfants.", verb: "немає", tr: "В неї немає дітей.", a: ["pas"], o: ["pas", "rien", "personne", "que"], why: "Ne … pas de." },
  { pre: "Je ne connais ", post: " ici.", verb: "нікого", tr: "Я нікого тут не знаю.", a: ["personne"], o: ["personne", "rien", "jamais", "plus"], why: "Ne … personne." },
  { pre: "Il ne reste ", post: " dans le frigo.", verb: "нічого", tr: "У холодильнику нічого не залишилося.", a: ["rien"], o: ["rien", "personne", "jamais", "que"], why: "Ne … rien." },
  { pre: "Elle n'est ", post: " arrivée.", verb: "ще не", tr: "Вона ще не приїхала.", a: ["pas encore"], o: ["pas encore", "plus", "rien", "personne"], why: "Ne … pas encore: ще не." }
];

var T_POSS = [
  { pre: "", post: " sœur s'appelle Anna.", verb: "моя", tr: "Мою сестру звати Анна.", a: ["Ma"], o: ["Ma", "Mon", "Mes", "Moi"], why: "Sœur жіночого роду: ma." },
  { pre: "C'est ", post: " ami Paul.", verb: "мій", tr: "Це мій друг Поль.", a: ["mon"], o: ["mon", "ma", "mes", "m'"], why: "Ami чоловічого роду: mon." },
  { pre: "J'ai perdu ", post: " clés.", verb: "мої", tr: "Я загубив свої ключі.", a: ["mes"], o: ["mes", "mon", "ma", "me"], why: "Множина: mes." },
  { pre: "Tu as ", post: " livre ?", verb: "твою", tr: "У тебе є твоя книга?", a: ["ton"], o: ["ton", "ta", "tes", "te"], why: "Livre: чоловічий рід: ton." },
  { pre: "Elle aime ", post: " mère.", verb: "свою", tr: "Вона любить свою маму.", a: ["sa"], o: ["sa", "son", "ses", "leur"], why: "Mère: жіночий рід: sa." },
  { pre: "Il parle à ", post: " père.", verb: "свого", tr: "Він розмовляє зі своїм батьком.", a: ["son"], o: ["son", "sa", "ses", "leur"], why: "Père: чоловічий рід: son." },
  { pre: "Marie et Paul aiment ", post: " enfants.", verb: "їхніх", tr: "Марі й Поль люблять своїх дітей.", a: ["leurs"], o: ["leurs", "leur", "ses", "son"], why: "Багато дітей і багато власників: leurs." },
  { pre: "Nous aimons ", post: " maison.", verb: "наш", tr: "Ми любимо наш дім.", a: ["notre"], o: ["notre", "nos", "ma", "nous"], why: "Maison однина: notre." },
  { pre: "Vous avez ", post: " passeport ?", verb: "ваш", tr: "У вас є ваш паспорт?", a: ["votre"], o: ["votre", "vos", "vous", "ton"], why: "Passeport однина: votre." },
  { pre: "Où sont ", post: " amis ?", verb: "ваші", tr: "Де ваші друзі?", a: ["vos"], o: ["vos", "votre", "vous", "tes"], why: "Множина: vos." },
  { pre: "Elle prend ", post: " amie au cinéma.", verb: "свою", tr: "Вона бере свою подругу в кіно.", a: ["son"], o: ["son", "sa", "ses", "leur"], why: "Перед жіночим іменником на голосну: son amie." },
  { pre: "", post: " livre est intéressant.", verb: "цей", tr: "Ця книга цікава.", a: ["Ce"], o: ["Ce", "Cet", "Cette", "Ces"], why: "Livre чоловічого роду на приголосну: ce." },
  { pre: "", post: " femme est médecin.", verb: "ця", tr: "Ця жінка лікар.", a: ["Cette"], o: ["Cette", "Ce", "Cet", "Ces"], why: "Femme: жіночий рід: cette." },
  { pre: "Je connais ", post: " homme.", verb: "цього", tr: "Я знаю цього чоловіка.", a: ["cet"], o: ["cet", "ce", "cette", "ces"], why: "Перед голосною чоловічий: cet." },
  { pre: "Tu aimes ", post: " chaussures ?", verb: "ці", tr: "Тобі подобається це взуття?", a: ["ces"], o: ["ces", "ce", "cette", "cet"], why: "Множина: ces." },
  { pre: "Paul cherche ", post: " lunettes.", verb: "свої", tr: "Поль шукає свої окуляри.", a: ["ses"], o: ["ses", "son", "sa", "leurs"], why: "Множина: ses." },
  { pre: "Mes amis habitent à Paris. ", post: " maison est grande.", verb: "їхній", tr: "Мої друзі живуть у Парижі. Їхній дім великий.", a: ["Leur"], o: ["Leur", "Leurs", "Son", "Sa"], why: "Один дім, кілька власників: leur." },
  { pre: "Nous avons deux enfants. ", post: " enfants ont dix et douze ans.", verb: "наші", tr: "У нас двоє дітей. Нашим дітям десять і дванадцять років.", a: ["Nos"], o: ["Nos", "Notre", "Mes", "Vos"], why: "Множина: nos." },
  { pre: "", post: " école est près d'ici.", verb: "моя", tr: "Моя школа поруч.", a: ["Mon"], o: ["Mon", "Ma", "Mes", "Ton"], why: "Перед жіночим іменником на голосну: mon école." },
  { pre: "Elle a oublié ", post: " sac.", verb: "цей", tr: "Вона забула цю сумку.", a: ["ce"], o: ["ce", "cet", "cette", "ces"], why: "Sac чоловічого роду: ce sac." }
];

var T_REL = [
  { pre: "L'homme ", post: " parle est mon père.", verb: "хто підмет", tr: "Чоловік, який говорить, мій батько.", a: ["qui"], o: ["qui", "que", "dont", "où"], why: "Qui замінює підмет: l'homme parle." },
  { pre: "Le livre ", post: " je lis est intéressant.", verb: "що додаток", tr: "Книга, яку я читаю, цікава.", a: ["que"], o: ["que", "qui", "dont", "où"], why: "Que замінює прямий додаток: je lis le livre." },
  { pre: "La ville ", post: " j'habite est petite.", verb: "місце", tr: "Місто, де я живу, маленьке.", a: ["où"], o: ["où", "que", "qui", "dont"], why: "Où вказує на місце." },
  { pre: "Le film ", post: " je parle est nouveau.", verb: "parler de", tr: "Фільм, про який я говорю, новий.", a: ["dont"], o: ["dont", "que", "qui", "où"], why: "Parler de → dont." },
  { pre: "Voilà la femme ", post: " travaille avec moi.", verb: "хто підмет", tr: "Ось жінка, яка працює зі мною.", a: ["qui"], o: ["qui", "que", "dont", "où"], why: "Підмет: qui." },
  { pre: "Voici le café ", post: " j'adore.", verb: "що додаток", tr: "Ось кафе, яке я обожнюю.", a: ["que"], o: ["que", "qui", "dont", "où"], why: "Додаток: que." },
  { pre: "Le jour ", post: " il est arrivé, il pleuvait.", verb: "час", tr: "У день, коли він приїхав, ішов дощ.", a: ["où"], o: ["où", "que", "qui", "dont"], why: "Où вказує на час." },
  { pre: "L'ami ", post: " la sœur est médecin habite à Genève.", verb: "чия", tr: "Друг, сестра якого лікарка, живе в Женеві.", a: ["dont"], o: ["dont", "que", "qui", "où"], why: "Dont = чий: dont la sœur." },
  { pre: "C'est le collègue ", post: " m'a aidé.", verb: "хто підмет", tr: "Це колега, який мені допоміг.", a: ["qui"], o: ["qui", "que", "dont", "où"], why: "Підмет: qui." },
  { pre: "Les fleurs ", post: " tu as achetées sont belles.", verb: "що додаток", tr: "Квіти, які ти купив, гарні.", a: ["que"], o: ["que", "qui", "dont", "où"], why: "Додаток: que." },
  { pre: "La maison ", post: " nous rêvons est grande.", verb: "rêver de", tr: "Дім, про який ми мріємо, великий.", a: ["dont"], o: ["dont", "que", "qui", "où"], why: "Rêver de → dont." },
  { pre: "Je connais un restaurant ", post: " on mange bien.", verb: "місце", tr: "Я знаю ресторан, де добре годують.", a: ["où"], o: ["où", "que", "qui", "dont"], why: "Місце: où." },
  { pre: "Le chat ", post: " dort sur le lit est à moi.", verb: "хто підмет", tr: "Кіт, який спить на ліжку, мій.", a: ["qui"], o: ["qui", "que", "dont", "où"], why: "Підмет: qui." },
  { pre: "Les clés ", post: " j'ai perdues sont dans la voiture.", verb: "що додаток", tr: "Ключі, які я загубив, у машині.", a: ["que"], o: ["que", "qui", "dont", "où"], why: "Додаток: que (участь perdues узгоджується)." },
  { pre: "La chose ", post: " j'ai besoin est ici.", verb: "avoir besoin de", tr: "Річ, яка мені потрібна, тут.", a: ["dont"], o: ["dont", "que", "qui", "où"], why: "Avoir besoin de → dont." },
  { pre: "Le pays ", post: " tu viens est beau.", verb: "звідки", tr: "Країна, з якої ти приїхав, гарна.", a: ["d'où"], o: ["d'où", "où", "dont", "que"], why: "Звідки: d'où." },
  { pre: "Le médecin ", post: " m'a soigné est excellent.", verb: "хто підмет", tr: "Лікар, який мене лікував, чудовий.", a: ["qui"], o: ["qui", "que", "dont", "où"], why: "Підмет: qui." },
  { pre: "La robe ", post: " elle porte est rouge.", verb: "що додаток", tr: "Сукня, яку вона носить, червона.", a: ["que"], o: ["que", "qui", "dont", "où"], why: "Додаток: que." },
  { pre: "Le livre ", post: " tu as besoin est sur la table.", verb: "avoir besoin de", tr: "Книга, яка тобі потрібна, на столі.", a: ["dont"], o: ["dont", "que", "qui", "où"], why: "Avoir besoin de → dont." },
  { pre: "Le moment ", post: " j'ai compris était magique.", verb: "час", tr: "Момент, коли я зрозумів, був чарівний.", a: ["où"], o: ["où", "que", "qui", "dont"], why: "Час: où." }
];

var T_LEQ = [
  { pre: "J'ai deux sacs. ", post: " préfères-tu ?", verb: "ч. однина", tr: "У мене дві сумки. Яку ти обираєш?", a: ["Lequel"], o: ["Lequel", "Laquelle", "Lesquels", "Lesquelles"], why: "Sacs чоловічого роду в однині в питанні: lequel." },
  { pre: "Il y a trois robes. ", post: " te plaît ?", verb: "ж. однина", tr: "Є три сукні. Яка тобі подобається?", a: ["Laquelle"], o: ["Laquelle", "Lequel", "Lesquels", "Lesquelles"], why: "Robe жіночого роду: laquelle." },
  { pre: "Voilà mes livres. ", post: " veux-tu lire ?", verb: "ч. множина", tr: "Ось мої книги. Які ти хочеш прочитати?", a: ["Lesquels"], o: ["Lesquels", "Lequel", "Laquelle", "Lesquelles"], why: "Livres чоловічого роду, множина: lesquels." },
  { pre: "Voici des chaises. ", post: " sont libres ?", verb: "ж. множина", tr: "Ось стільці. Які вільні?", a: ["Lesquelles"], o: ["Lesquelles", "Lequel", "Lesquels", "Laquelle"], why: "Chaises жіночого роду, множина: lesquelles." },
  { pre: "Il y a deux trains. ", post: " prends-tu ?", verb: "ч. однина", tr: "Є два потяги. Яким ти їдеш?", a: ["Lequel"], o: ["Lequel", "Laquelle", "Lesquels", "Lesquelles"], why: "Train чоловічого роду: lequel." },
  { pre: "La table sur ", post: " j'ai posé le livre est neuve.", verb: "ж. однина", tr: "Стіл, на який я поклав книгу, новий.", a: ["laquelle"], o: ["laquelle", "lequel", "lesquelles", "qui"], why: "Table жіночого роду: sur laquelle." },
  { pre: "Le stylo avec ", post: " j'écris est cassé.", verb: "ч. однина", tr: "Ручка, якою я пишу, зламана.", a: ["lequel"], o: ["lequel", "laquelle", "lesquels", "qui"], why: "Stylo чоловічого роду: avec lequel." },
  { pre: "Les outils avec ", post: " il travaille sont neufs.", verb: "ч. множина", tr: "Інструменти, якими він працює, нові.", a: ["lesquels"], o: ["lesquels", "lesquelles", "qui", "dont"], why: "Outils чоловічого роду, множина: avec lesquels." },
  { pre: "Les raisons pour ", post: " il est parti sont claires.", verb: "ж. множина", tr: "Причини, через які він пішов, зрозумілі.", a: ["lesquelles"], o: ["lesquelles", "lesquels", "laquelle", "qui"], why: "Raisons жіночого роду, множина: pour lesquelles." },
  { pre: "La maison dans ", post: " j'habite est ancienne.", verb: "ж. однина", tr: "Будинок, у якому я живу, старий.", a: ["laquelle"], o: ["laquelle", "lequel", "lesquelles", "qui"], why: "Maison жіночого роду: dans laquelle." },
  { pre: "Le projet ", post: " je pense est difficile.", verb: "penser à + ч. однина", tr: "Проєкт, про який я думаю, складний.", a: ["auquel"], o: ["auquel", "duquel", "à laquelle", "lequel"], why: "Penser à + masc.: auquel." },
  { pre: "La question ", post: " je réponds est facile.", verb: "répondre à + ж. однина", tr: "Питання, на яке я відповідаю, легке.", a: ["à laquelle"], o: ["à laquelle", "auquel", "de laquelle", "laquelle"], why: "Répondre à + fém.: à laquelle." },
  { pre: "Les lettres ", post: " il répond sont longues.", verb: "répondre à + ж. множина", tr: "Листи, на які він відповідає, довгі.", a: ["auxquelles"], o: ["auxquelles", "auxquels", "desquelles", "lesquelles"], why: "À + lesquelles = auxquelles." },
  { pre: "Le quartier près ", post: " nous habitons est calme.", verb: "près de + ч. однина", tr: "Район, поруч із яким ми живемо, тихий.", a: ["duquel"], o: ["duquel", "de laquelle", "auquel", "lequel"], why: "De + lequel = duquel." },
  { pre: "La rue au bout ", post: " se trouve la poste est longue.", verb: "au bout de + ж. однина", tr: "Вулиця, наприкінці якої пошта, довга.", a: ["de laquelle"], o: ["de laquelle", "duquel", "à laquelle", "laquelle"], why: "Au bout de + fém.: de laquelle." },
  { pre: "Les murs derrière ", post: " il se cache sont hauts.", verb: "ч. множина", tr: "Стіни, за якими він ховається, високі.", a: ["lesquels"], o: ["lesquels", "lesquelles", "desquels", "qui"], why: "Murs чоловічого роду, множина: derrière lesquels." },
  { pre: "Il y a deux solutions. Pour ", post: " vas-tu opter ?", verb: "ж. однина", tr: "Є два рішення. Яке ти оберешь?", a: ["laquelle"], o: ["laquelle", "lequel", "lesquelles", "quelle"], why: "Solution жіночого роду: pour laquelle." },
  { pre: "Voilà trois chemins. Par ", post: " passons-nous ?", verb: "ч. однина", tr: "Ось три шляхи. Яким підемо?", a: ["lequel"], o: ["lequel", "laquelle", "lesquels", "quel"], why: "Chemin чоловічого роду: par lequel." },
  { pre: "", post: " de ces hommes as-tu écrit ?", verb: "écrire à + ч. однина", tr: "Якому з цих чоловіків ти писав?", a: ["Auquel"], o: ["Auquel", "Duquel", "Lequel", "Lesquels"], why: "Écrire à → auquel." },
  { pre: "Voici deux filles. ", post: " s'appelle Anna ?", verb: "ж. однина", tr: "Ось дві дівчини. Яку з них звати Анна?", a: ["Laquelle"], o: ["Laquelle", "Lequel", "Lesquelles", "Quelle"], why: "Filles: ж. рід, одна з двох: laquelle." }
];

var T2_DP = [
  { pre: "Tu donnes le livre à Paul ? Oui, je ", post: " donne.", verb: "COD + COI", tr: "Так, я йому його даю.", a: ["le lui"], o: ["le lui", "lui le", "le leur", "lui en"], why: "Спершу le (COD), потім lui (COI): je le lui donne." },
  { pre: "Marie montre les photos à ses amis. Elle ", post: " montre.", verb: "COD + COI мн.", tr: "Вона їм їх показує.", a: ["les leur"], o: ["les leur", "leur les", "les lui", "leur en"], why: "les (COD) стоїть перед leur (COI)." },
  { pre: "Tu me prêtes ton stylo ? Oui, je ", post: " prête.", verb: "me / te + le", tr: "Так, я тобі його позичаю.", a: ["te le"], o: ["te le", "le te", "te lui", "t'en"], why: "me / te / nous / vous стоять перед le / la / les: je te le prête." },
  { pre: "Il vous envoie la lettre. Il ", post: "envoie.", verb: "vous + la", tr: "Він її вам надсилає.", a: ["vous l'"], o: ["vous l'", "l'vous", "vous lui", "vous en"], why: "vous перед l' (la): il vous l'envoie." },
  { pre: "Tu donnes du pain aux enfants ? Oui, je ", post: " donne.", verb: "COI + en", tr: "Так, я їм його (трохи) даю.", a: ["leur en"], o: ["leur en", "en leur", "leur le", "lui en"], why: "leur (COI) перед en: je leur en donne." },
  { pre: "Tu parles de ce problème à Paul ? Oui, je ", post: " parle.", verb: "lui + en", tr: "Так, я йому про це говорю.", a: ["lui en"], o: ["lui en", "en lui", "le lui", "y en"], why: "lui перед en: je lui en parle." },
  { pre: "Il y a du café dans la cuisine ? Oui, il ", post: " a.", verb: "y + en", tr: "Так, там є (кава).", a: ["y en"], o: ["y en", "en y", "l'y", "y le"], why: "y завжди перед en: il y en a." },
  { pre: "Je ne ", post: " donne pas.", verb: "заперечення", tr: "Я йому його не даю.", a: ["le lui"], o: ["le lui", "lui le", "lui en", "le leur"], why: "У запереченні ne перед усією групою: je ne le lui donne pas." },
  { pre: "Elle a donné la clé à Paul. Elle ", post: " a donnée.", verb: "passé composé", tr: "Вона йому її дала.", a: ["la lui"], o: ["la lui", "lui la", "la leur", "lui en"], why: "Група стоїть перед avoir: elle la lui a donnée." },
  { pre: "Tu veux voir la maison ? Je vais ", post: " montrer.", verb: "перед інфінітивом", tr: "Хочеш побачити дім? Я збираюся тобі її показати.", a: ["te la"], o: ["te la", "la te", "te lui", "t'en"], why: "Група стоїть перед інфінітивом: je vais te la montrer." }
];

var T2_IMPR = [
  { pre: "Le livre ? Donne-", post: " !", verb: "COD + я", tr: "Книгу? Дай її мені!", a: ["le-moi"], o: ["le-moi", "moi-le", "me le", "me-le"], why: "Ствердно: дієслово-COD-COI, me → moi: donne-le-moi." },
  { pre: "Ne ", post: " donne pas !", verb: "заперечення", tr: "Не давай мені його!", a: ["me le"], o: ["me le", "le me", "moi le", "me-le"], why: "У запереченні порядок звичайний: ne me le donne pas." },
  { pre: "Tu veux ce gâteau ? Prends-", post: " !", verb: "en", tr: "Хочеш цей торт? Візьми (трохи)!", a: ["en"], o: ["en", "y", "le", "lui"], why: "En стоїть після дієслова через дефіс: prends-en." },
  { pre: "Parle à Paul ! Parle-", post: " !", verb: "COI", tr: "Поговори з Полем! Поговори з ним!", a: ["lui"], o: ["lui", "leur", "le", "moi"], why: "Ствердно COI стоїть після дієслова: parle-lui." },
  { pre: "Tu t'assois ? Assieds-", post: " !", verb: "зворотне", tr: "Сядеш? Сідай!", a: ["toi"], o: ["toi", "te", "tu", "moi"], why: "У ствердному te → toi: assieds-toi." },
  { pre: "Ne ", post: " lève pas si tôt !", verb: "зворотне, заперечення", tr: "Не вставай так рано!", a: ["te"], o: ["te", "toi", "tu", "se"], why: "У запереченні te лишається перед дієсловом: ne te lève pas." },
  { pre: "Les clés ? Donne-", post: "-nous !", verb: "COD + COI", tr: "Ключі? Дай їх нам!", a: ["les"], o: ["les", "le", "leur", "lui"], why: "Спершу COD (les), потім COI: donne-les-nous." },
  { pre: "Ne ", post: " parle pas !", verb: "COI, заперечення", tr: "Не говори з ним!", a: ["lui"], o: ["lui", "leur", "le", "y"], why: "Заперечення: lui стоїть перед дієсловом." },
  { pre: "Tu veux du pain ? Oui, donne-", post: " !", verb: "me + en", tr: "Хочеш хліба? Так, дай мені (трохи)!", a: ["m'en"], o: ["m'en", "moi-en", "me en", "en-moi"], why: "me перед en → m'en: donne-m'en." },
  { pre: "Cette chanson ? Écoute-", post: " !", verb: "COD", tr: "Ця пісня? Послухай її!", a: ["la"], o: ["la", "lui", "leur", "les"], why: "COD ж. однина після дієслова: écoute-la." }
];

var T2_TON = [
  { pre: "Tu viens chez ", post: " ce soir ?", verb: "chez + я", tr: "Ти прийдеш до мене ввечері?", a: ["moi"], o: ["moi", "je", "me", "mon"], why: "Після прийменника — наголошений займенник: chez moi." },
  { pre: "Qui a frappé ? — C'est ", post: ".", verb: "це він", tr: "Хто стукав? — Це він.", a: ["lui"], o: ["lui", "il", "le", "eux"], why: "C'est + наголошений: c'est lui." },
  { pre: "Je travaille avec mes collègues. Je travaille avec ", post: ".", verb: "вони (ч.)", tr: "Я працюю зі своїми колегами. Я працюю з ними.", a: ["eux"], o: ["eux", "ils", "leur", "elles"], why: "Після avec: eux (чоловіки або змішана група)." },
  { pre: "Mes sœurs sont là. Je vais au cinéma avec ", post: ".", verb: "вони (ж.)", tr: "Мої сестри тут. Я йду в кіно з ними.", a: ["elles"], o: ["elles", "eux", "elle", "leur"], why: "Жіноча множина: elles." },
  { pre: "", post: ", je suis ukrainien.", verb: "наголос", tr: "Я, я українець.", a: ["Moi"], o: ["Moi", "Je", "Me", "Mon"], why: "Для наголосу: Moi, je …" },
  { pre: "Tu es plus grand que ", post: ".", verb: "порівняння", tr: "Ти вищий за мене.", a: ["moi"], o: ["moi", "je", "me", "mon"], why: "Після que у порівнянні — наголошений займенник." },
  { pre: "Paul et Marie ne sont pas là. Tu penses à ", post: " ?", verb: "penser à + вони", tr: "Поля і Марі немає. Ти думаєш про них?", a: ["eux"], o: ["eux", "leur", "ils", "lui"], why: "Penser à + особа: à eux." },
  { pre: "Marie ? Je parle souvent d'", post: ".", verb: "про неї", tr: "Марі? Я часто говорю про неї.", a: ["elle"], o: ["elle", "la", "lui", "elles"], why: "Після de: d'elle." },
  { pre: "Ce cadeau est pour ", post: ", Anna.", verb: "для тебе", tr: "Цей подарунок для тебе, Анно.", a: ["toi"], o: ["toi", "tu", "te", "ton"], why: "Після pour — toi." },
  { pre: "Vous aimez le café ? — Pas ", post: ", mais mon mari oui.", verb: "я ні", tr: "Ви любите каву? — Я ні, а чоловік так.", a: ["moi"], o: ["moi", "je", "me", "mon"], why: "Без дієслова — наголошений займенник: pas moi." }
];

var T2_REFL = [
  { pre: "Je ", post: " lève à six heures.", verb: "se lever", tr: "Я встаю о шостій.", a: ["me"], o: ["me", "te", "se", "nous"], why: "Je → me." },
  { pre: "Tu ", post: "habilles vite le matin.", verb: "s'habiller", tr: "Ти швидко одягаєшся вранці.", a: ["t'"], o: ["t'", "te", "me", "s'"], why: "Перед голосною te → t': tu t'habilles." },
  { pre: "Elle ", post: " lave les mains.", verb: "se laver", tr: "Вона миє руки.", a: ["se"], o: ["se", "me", "te", "nous"], why: "Elle → se." },
  { pre: "Nous ", post: " couchons tard.", verb: "se coucher", tr: "Ми лягаємо пізно.", a: ["nous"], o: ["nous", "vous", "se", "me"], why: "Nous → nous." },
  { pre: "Ils ", post: " dépêchent.", verb: "se dépêcher", tr: "Вони поспішають.", a: ["se"], o: ["se", "me", "te", "vous"], why: "Ils → se." },
  { pre: "Hier, je ", post: " suis levé à sept heures.", verb: "passé composé", tr: "Вчора я встав о сьомій.", a: ["me"], o: ["me", "m'", "se", "ai"], why: "Passé composé: me suis levé." },
  { pre: "Elle s'est ", post: " tôt.", verb: "passé composé, вона", tr: "Вона рано прокинулась.", a: ["réveillée"], o: ["réveillée", "réveillé", "réveiller", "réveillés"], why: "З être узгодження з підметом: elle → réveillée." },
  { pre: "Nous (чоловіки) nous sommes ", post: " au parc.", verb: "se promener", tr: "Ми (чоловіки) погуляли в парку.", a: ["promenés"], o: ["promenés", "promené", "promenées", "promener"], why: "Nous (чоловіки) → promenés." },
  { pre: "Ils ne se sont pas ", post: " hier.", verb: "se disputer", tr: "Вони не посварилися вчора.", a: ["disputés"], o: ["disputés", "disputé", "disputées", "disputer"], why: "Ils → disputés." },
  { pre: "Tu (чоловік) ne t'es pas ", post: " ?", verb: "se coucher", tr: "Ти не ліг?", a: ["couché"], o: ["couché", "couchée", "couchés", "couchez"], why: "Ти — чоловік: couché." }
];

var T2_AGR = [
  { pre: "Les photos ? Je les ai ", post: " .", verb: "COD перед avoir", tr: "Фото? Я їх бачив.", a: ["vues"], o: ["vues", "vu", "vue", "vus"], why: "les = photos (ж. мн.) перед avoir → vues." },
  { pre: "La lettre que j'ai ", post: " est longue.", verb: "écrire", tr: "Лист, який я написав, довгий.", a: ["écrite"], o: ["écrite", "écrit", "écrits", "écrites"], why: "que = la lettre (ж. одн.) → écrite." },
  { pre: "Elle a ", post: " ses clés.", verb: "COD після", tr: "Вона загубила ключі.", a: ["perdu"], o: ["perdu", "perdue", "perdus", "perdues"], why: "COD після avoir → без узгодження." },
  { pre: "Elle est ", post: " à Paris.", verb: "aller", tr: "Вона поїхала в Париж.", a: ["allée"], o: ["allée", "allé", "allés", "allées"], why: "Aller з être: узгодження з підметом." },
  { pre: "Ils sont ", post: " tard.", verb: "arriver", tr: "Вони прийшли пізно.", a: ["arrivés"], o: ["arrivés", "arrivé", "arrivée", "arrivées"], why: "Ils → arrivés." },
  { pre: "Mes amies sont ", post: " hier.", verb: "partir", tr: "Мої подруги поїхали вчора.", a: ["parties"], o: ["parties", "partis", "partie", "parti"], why: "Amies → parties." },
  { pre: "Les pommes ? Je les ai ", post: " ce matin.", verb: "acheter", tr: "Яблука? Я їх купив сьогодні вранці.", a: ["achetées"], o: ["achetées", "acheté", "achetée", "achetés"], why: "les = pommes (ж. мн.) → achetées." },
  { pre: "Tu as vu Marie ? Oui, je l'ai ", post: " hier.", verb: "COD ж.", tr: "Бачив Марі? Так, бачив її вчора.", a: ["vue"], o: ["vue", "vu", "vus", "vues"], why: "l' = Marie → vue." },
  { pre: "Les livres que tu as ", post: " sont intéressants.", verb: "lire", tr: "Книги, які ти прочитав, цікаві.", a: ["lus"], o: ["lus", "lu", "lue", "lues"], why: "que = les livres (ч. мн.) → lus." },
  { pre: "Elles ont ", post: " au restaurant.", verb: "manger", tr: "Вони поїли в ресторані.", a: ["mangé"], o: ["mangé", "mangées", "mangés", "mangée"], why: "З avoir без COD перед ним — без узгодження." }
];

var T2_SI = [
  { pre: "Si tu ", post: ", nous irons au cinéma.", verb: "si + présent", tr: "Якщо ти прийдеш, підемо в кіно.", a: ["viens"], o: ["viens", "viendras", "viendrais", "venais"], why: "Si + présent, головне речення — futur." },
  { pre: "S'il pleut demain, je ", post: " à la maison.", verb: "futur simple", tr: "Якщо завтра буде дощ, я залишусь вдома.", a: ["resterai"], o: ["resterai", "resterais", "restais", "resté"], why: "Si + présent → futur simple." },
  { pre: "Si j'avais plus de temps, je ", post: " plus.", verb: "si + imparfait", tr: "Якби я мав більше часу, я б читав більше.", a: ["lirais"], o: ["lirais", "lirai", "lis", "lisais"], why: "Si + imparfait → conditionnel présent." },
  { pre: "Si nous gagnions au loto, nous ", post: " le monde.", verb: "si + imparfait", tr: "Якби ми виграли в лотерею, ми б подорожували світом.", a: ["visiterions"], o: ["visiterions", "visiterons", "visitons", "visitions"], why: "Si + imparfait → conditionnel." },
  { pre: "Si elle se levait plus tôt, elle ", post: " pas en retard.", verb: "conditionnel", tr: "Якби вона вставала раніше, вона б не запізнювалась.", a: ["ne serait"], o: ["ne serait", "ne sera", "n'était", "ne serais"], why: "Conditionnel présent: elle ne serait pas." },
  { pre: "Si je ", post: " riche, j'achèterais une maison.", verb: "si + imparfait", tr: "Якби я був багатим, я б купив дім.", a: ["étais"], o: ["étais", "suis", "serai", "serais"], why: "Після si — imparfait." },
  { pre: "Si vous ", post: " le temps, venez nous voir.", verb: "si + présent", tr: "Якщо матимете час, заходьте до нас.", a: ["avez"], o: ["avez", "aurez", "aviez", "auriez"], why: "Si + présent (далі може бути наказовий)." },
  { pre: "Que feriez-vous si vous ", post: " beaucoup d'argent ?", verb: "si + imparfait", tr: "Що б ви робили, якби мали багато грошей?", a: ["aviez"], o: ["aviez", "avez", "aurez", "auriez"], why: "Після si — imparfait." },
  { pre: "Si on part maintenant, on ", post: " à l'heure.", verb: "si + présent", tr: "Якщо вирушимо зараз, будемо вчасно.", a: ["arrivera"], o: ["arrivera", "arriverait", "arrivait", "est arrivé"], why: "Si + présent → futur." },
  { pre: "Si j'étais toi, je ne ", post: " pas.", verb: "si + imparfait", tr: "На твоєму місці я б не їхав.", a: ["partirais"], o: ["partirais", "partirai", "pars", "partais"], why: "Si + imparfait → conditionnel." }
];

var T2_SUBJ = [
  { pre: "Il faut que tu ", post: " plus tôt.", verb: "venir", tr: "Треба, щоб ти прийшов раніше.", a: ["viennes"], o: ["viennes", "viens", "viendras", "venais"], why: "Il faut que + subjonctif: que tu viennes." },
  { pre: "Je veux que vous ", post: " ici.", verb: "être", tr: "Я хочу, щоб ви були тут.", a: ["soyez"], o: ["soyez", "êtes", "serez", "étiez"], why: "Vouloir que + subjonctif: que vous soyez." },
  { pre: "Il faut que nous ", post: " à la banque.", verb: "aller", tr: "Нам треба йти в банк.", a: ["allions"], o: ["allions", "allons", "irons", "allez"], why: "Subjonctif aller: que nous allions." },
  { pre: "Je travaille pour que ma famille ", post: " heureuse.", verb: "être", tr: "Я працюю, щоб моя родина була щасливою.", a: ["soit"], o: ["soit", "est", "sera", "soient"], why: "Pour que + subjonctif: soit." },
  { pre: "Bien qu'il ", post: " fatigué, il continue.", verb: "être", tr: "Хоч він і втомлений, він продовжує.", a: ["soit"], o: ["soit", "est", "était", "sera"], why: "Bien que + subjonctif." },
  { pre: "Il faut que je ", post: " ce travail aujourd'hui.", verb: "finir", tr: "Мені треба закінчити цю роботу сьогодні.", a: ["finisse"], o: ["finisse", "finis", "finirai", "finissais"], why: "Il faut que + subjonctif: que je finisse." },
  { pre: "Elle veut que nous ", post: " la vérité.", verb: "dire", tr: "Вона хоче, щоб ми сказали правду.", a: ["disions"], o: ["disions", "disons", "dirons", "dites"], why: "Vouloir que + subjonctif: que nous disions." },
  { pre: "Il est possible qu'il ", post: " demain.", verb: "pleuvoir", tr: "Можливо, завтра буде дощ.", a: ["pleuve"], o: ["pleuve", "pleut", "pleuvra", "pleuvait"], why: "Il est possible que + subjonctif." },
  { pre: "Je suis content que tu ", post: " là.", verb: "être", tr: "Я радий, що ти тут.", a: ["sois"], o: ["sois", "es", "seras", "étais"], why: "Почуття + que + subjonctif." },
  { pre: "Il faut que tu ", post: " attention.", verb: "faire", tr: "Треба, щоб ти звернув увагу.", a: ["fasses"], o: ["fasses", "fais", "feras", "faisais"], why: "Subjonctif faire: que tu fasses." }
];

var T2_COMP = [
  { pre: "Paul est ", post: " grand que Marc.", verb: "більше", tr: "Поль вищий за Марка.", a: ["plus"], o: ["plus", "moins", "aussi", "très"], why: "Plus + прикметник + que." },
  { pre: "Ce gâteau est ", post: " que l'autre.", verb: "bon → краще", tr: "Цей торт кращий за той.", a: ["meilleur"], o: ["meilleur", "mieux", "plus bon", "le meilleur"], why: "Bon → meilleur (прикметник)." },
  { pre: "Elle chante ", post: " que moi.", verb: "bien → краще", tr: "Вона співає краще за мене.", a: ["mieux"], o: ["mieux", "meilleur", "plus bien", "le mieux"], why: "Bien → mieux (прислівник)." },
  { pre: "C'est ", post: " restaurant de la ville.", verb: "найкращий", tr: "Це найкращий ресторан міста.", a: ["le meilleur"], o: ["le meilleur", "le mieux", "meilleur", "plus bon"], why: "Найвищий ступінь від bon: le meilleur." },
  { pre: "Il est ", post: " intelligent que son frère.", verb: "однаково", tr: "Він такий же розумний, як його брат.", a: ["aussi"], o: ["aussi", "plus", "moins", "très"], why: "Aussi … que — однаковий ступінь." },
  { pre: "Marie court ", post: " vite de la classe.", verb: "найшвидше", tr: "Марі бігає найшвидше в класі.", a: ["le plus"], o: ["le plus", "plus", "la plus", "mieux"], why: "Прислівник у найвищому ступені: le plus." },
  { pre: "C'est ", post: " grande ville du pays.", verb: "найбільше", tr: "Це найбільше місто країни.", a: ["la plus"], o: ["la plus", "le plus", "plus", "la meilleure"], why: "Ville жіночого роду: la plus grande." },
  { pre: "Mon français est ", post: " qu'avant.", verb: "краще", tr: "Моя французька краща, ніж раніше.", a: ["meilleur"], o: ["meilleur", "mieux", "plus bon", "le meilleur"], why: "Français — іменник: meilleur." },
  { pre: "Il y a ", post: " de monde qu'hier.", verb: "більше", tr: "Сьогодні людей більше, ніж учора.", a: ["plus"], o: ["plus", "mieux", "meilleur", "très"], why: "Plus de + іменник + que." },
  { pre: "Je me sens ", post: " aujourd'hui.", verb: "bien → краще", tr: "Сьогодні я почуваюсь краще.", a: ["mieux"], o: ["mieux", "meilleur", "plus bon", "bon"], why: "Se sentir + прислівник: mieux." }
];

var T2_ADJ = [
  { pre: "Une ", post: " voiture.", verb: "нова", tr: "Нова машина.", a: ["nouvelle"], o: ["nouvelle", "nouveau", "nouvel", "nouvelles"], why: "Voiture ж. → nouvelle." },
  { pre: "Un ", post: " appartement.", verb: "гарний", tr: "Гарна квартира.", a: ["bel"], o: ["bel", "beau", "belle", "beaux"], why: "Перед голосною ч. р.: bel." },
  { pre: "Des ", post: " enfants.", verb: "маленькі", tr: "Маленькі діти.", a: ["petits"], o: ["petits", "petit", "petites", "petite"], why: "Мн. ч. → petits." },
  { pre: "J'habite dans une ", post: ".", verb: "велика хата", tr: "Я живу у великому домі.", a: ["grande maison"], o: ["grande maison", "maison grande", "grand maison", "maison grand"], why: "Grand ставимо перед іменником, у жіночому роді grande." },
  { pre: "Elle a une ", post: ".", verb: "червона машина", tr: "У неї червона машина.", a: ["voiture rouge"], o: ["voiture rouge", "rouge voiture", "voiture rouges", "rouge voitures"], why: "Колір стоїть після іменника." },
  { pre: "Ce sont de ", post: " fleurs.", verb: "гарні", tr: "Це гарні квіти.", a: ["belles"], o: ["belles", "beaux", "belle", "bel"], why: "Fleurs ж. мн. → belles." },
  { pre: "Elle est très ", post: ".", verb: "щаслива", tr: "Вона дуже щаслива.", a: ["heureuse"], o: ["heureuse", "heureux", "heureuses", "content"], why: "Ж. р. → heureuse." },
  { pre: "Mes parents sont ", post: ".", verb: "добрі", tr: "Мої батьки добрі.", a: ["gentils"], o: ["gentils", "gentil", "gentille", "gentilles"], why: "Parents — ч. р. мн. → gentils." },
  { pre: "C'est un ", post: " homme.", verb: "старий", tr: "Це старий чоловік.", a: ["vieil"], o: ["vieil", "vieux", "vieille", "vieilles"], why: "Перед голосною ч. р.: vieil." },
  { pre: "Une ", post: " histoire.", verb: "гарна", tr: "Гарна історія.", a: ["belle"], o: ["belle", "bel", "beau", "belles"], why: "Histoire ж. р. → belle." }
];

var T2_ADV = [
  { pre: "Il parle ", post: ".", verb: "lent", tr: "Він говорить повільно.", a: ["lentement"], o: ["lentement", "lent", "lente", "lentes"], why: "Lente + ment = lentement." },
  { pre: "", post: ", il n'a pas plu.", verb: "heureux", tr: "На щастя, дощу не було.", a: ["Heureusement"], o: ["Heureusement", "Heureux", "Heureuse", "Heureuses"], why: "Heureuse + ment = heureusement." },
  { pre: "Elle marche ", post: ".", verb: "rapide", tr: "Вона йде швидко.", a: ["rapidement"], o: ["rapidement", "rapide", "rapides", "rapidemment"], why: "Rapide + ment = rapidement." },
  { pre: "", post: ", c'est vrai.", verb: "évident", tr: "Звісно, це правда.", a: ["Évidemment"], o: ["Évidemment", "Évident", "Évidente", "Évidentement"], why: "-ent → -emment." },
  { pre: "Il se plaint ", post: ".", verb: "constant", tr: "Він постійно скаржиться.", a: ["constamment"], o: ["constamment", "constantement", "constant", "constante"], why: "-ant → -amment." },
  { pre: "Elle attend ", post: ".", verb: "patient", tr: "Вона терпляче чекає.", a: ["patiemment"], o: ["patiemment", "patientement", "patient", "patiente"], why: "-ent → -emment." },
  { pre: "C'est ", post: " bon !", verb: "vrai", tr: "Це справді смачно!", a: ["vraiment"], o: ["vraiment", "vrai", "vraie", "vraies"], why: "Vrai + ment = vraiment." },
  { pre: "Il joue très ", post: ".", verb: "bon", tr: "Він грає дуже добре.", a: ["bien"], o: ["bien", "bon", "bonne", "bons"], why: "Bon → bien (прислівник)." },
  { pre: "Elle chante ", post: ".", verb: "mauvais", tr: "Вона співає погано.", a: ["mal"], o: ["mal", "mauvais", "mauvaise", "bon"], why: "Mauvais → mal (прислівник)." },
  { pre: "Il répond ", post: ".", verb: "gentil", tr: "Він відповідає люб'язно.", a: ["gentiment"], o: ["gentiment", "gentil", "gentille", "gentilment"], why: "Виняток: gentil → gentiment." }
];

var T2_QUEST = [
  { pre: "", post: " vous parlez français ?", verb: "так/ні", tr: "Ви говорите французькою?", a: ["Est-ce que"], o: ["Est-ce que", "Qu'est-ce que", "Est-ce", "Quel"], why: "Питання «так/ні»: est-ce que + речення." },
  { pre: "Où ", post: "-tu ?", verb: "інверсія", tr: "Де ти живеш?", a: ["habites"], o: ["habites", "habite", "habitons", "habitez"], why: "Інверсія: habites-tu ?" },
  { pre: "", post: " heure est-il ?", verb: "яка", tr: "Котра година?", a: ["Quelle"], o: ["Quelle", "Quel", "Quels", "Lequel"], why: "Heure ж. р. → quelle." },
  { pre: "", post: " films aimes-tu ?", verb: "які", tr: "Які фільми ти любиш?", a: ["Quels"], o: ["Quels", "Quel", "Quelle", "Lesquels"], why: "Films ч. мн. → quels." },
  { pre: "Voici trois films. ", post: " as-tu vu ?", verb: "котрий із", tr: "Ось три фільми. Котрий ти бачив?", a: ["Lequel"], o: ["Lequel", "Quel", "Laquelle", "Lesquels"], why: "Замість іменника — lequel." },
  { pre: "", post: " tu manges ?", verb: "що", tr: "Що ти їси?", a: ["Qu'est-ce que"], o: ["Qu'est-ce que", "Est-ce que", "Qui est-ce que", "Que est-ce que"], why: "Що (додаток): qu'est-ce que." },
  { pre: "", post: " est-ce que tu vas au travail ?", verb: "спосіб", tr: "Як ти їдеш на роботу?", a: ["Comment"], o: ["Comment", "Pourquoi", "Combien", "Quel"], why: "Comment — як." },
  { pre: "", post: " personnes viennent ?", verb: "скільки", tr: "Скільки людей прийде?", a: ["Combien de"], o: ["Combien de", "Combien", "Combien des", "Quelles"], why: "Combien de + іменник." },
  { pre: "", post: " est ton nom ?", verb: "який", tr: "Яке твоє ім'я?", a: ["Quel"], o: ["Quel", "Quelle", "Lequel", "Quels"], why: "Nom ч. р.: quel." },
  { pre: "Elle a trois robes. ", post: " de ces robes te plaît ?", verb: "котра з", tr: "У неї три сукні. Яка з цих суконь тобі подобається?", a: ["Laquelle"], o: ["Laquelle", "Quelle", "Lequel", "Lesquelles"], why: "Laquelle de + іменник." }
];

var T2_TIME = [
  { pre: "J'habite ici ", post: " dix ans.", verb: "з (триває)", tr: "Я живу тут десять років.", a: ["depuis"], o: ["depuis", "pendant", "il y a", "dans"], why: "Depuis — дія триває досі." },
  { pre: "Il est parti ", post: " deux heures.", verb: "тому", tr: "Він пішов дві години тому.", a: ["il y a"], o: ["il y a", "depuis", "pendant", "dans"], why: "Il y a — тому." },
  { pre: "J'ai travaillé ", post: " trois heures.", verb: "протягом", tr: "Я працював три години.", a: ["pendant"], o: ["pendant", "depuis", "il y a", "dans"], why: "Pendant — тривалість дії." },
  { pre: "Le train part ", post: " dix minutes.", verb: "через", tr: "Потяг відходить через десять хвилин.", a: ["dans"], o: ["dans", "en", "depuis", "pendant"], why: "Dans — через (у майбутньому)." },
  { pre: "Je viens ", post: " manger.", verb: "venir de", tr: "Я щойно поїв.", a: ["de"], o: ["de", "à", "pour", "en"], why: "Venir de + інфінітив = щойно." },
  { pre: "Elle ", post: " finir son travail.", verb: "щойно", tr: "Вона щойно закінчила роботу.", a: ["vient de"], o: ["vient de", "va", "a", "vient à"], why: "Vient de + інфінітив: passé récent." },
  { pre: "Nous sommes en Suisse ", post: " 2024.", verb: "з", tr: "Ми у Швейцарії з 2024.", a: ["depuis"], o: ["depuis", "pendant", "il y a", "dans"], why: "Depuis + початок періоду." },
  { pre: "Il a fini le travail ", post: " une heure.", verb: "за", tr: "Він закінчив роботу за годину.", a: ["en"], o: ["en", "dans", "pendant", "depuis"], why: "En = за який час виконано." },
  { pre: "Ils viennent ", post: "arriver.", verb: "щойно", tr: "Вони щойно приїхали.", a: ["d'"], o: ["d'", "de", "à", "en"], why: "Перед голосною de → d'." },
  { pre: "Il a plu ", post: " la nuit.", verb: "протягом", tr: "Уночі йшов дощ.", a: ["pendant"], o: ["pendant", "depuis", "dans", "il y a"], why: "Pendant — протягом." }
];

var T2_QTY = [
  { pre: "Il y a beaucoup ", post: " monde.", verb: "beaucoup de", tr: "Багато людей.", a: ["de"], o: ["de", "du", "des", "de la"], why: "Beaucoup de + іменник." },
  { pre: "Je voudrais un peu ", post: " sucre.", verb: "un peu de", tr: "Я хотів би трохи цукру.", a: ["de"], o: ["de", "du", "de l'", "des"], why: "Un peu de." },
  { pre: "Nous avons assez ", post: " temps.", verb: "assez de", tr: "У нас достатньо часу.", a: ["de"], o: ["de", "du", "de la", "le"], why: "Assez de." },
  { pre: "Il mange trop ", post: " chocolat.", verb: "trop de", tr: "Він їсть забагато шоколаду.", a: ["de"], o: ["de", "du", "le", "un"], why: "Trop de." },
  { pre: "Elle a beaucoup ", post: "amis.", verb: "перед голосною", tr: "У неї багато друзів.", a: ["d'"], o: ["d'", "de", "des", "les"], why: "Перед голосною de → d'." },
  { pre: "Il ne boit pas ", post: " café.", verb: "заперечення", tr: "Він не п'є кави.", a: ["de"], o: ["de", "du", "le", "un"], why: "Після заперечення du → de." },
  { pre: "Il y a ", post: " de monde ici !", verb: "дуже багато", tr: "Тут дуже багато людей!", a: ["beaucoup"], o: ["beaucoup", "très", "tout", "plus"], why: "Beaucoup + de (не très)." },
  { pre: "Un kilo ", post: " tomates, s'il vous plaît.", verb: "одиниця виміру", tr: "Кілограм помідорів, будь ласка.", a: ["de"], o: ["de", "des", "les", "du"], why: "Одиниця міри + de." },
  { pre: "La plupart ", post: " étudiants sont ici.", verb: "більшість", tr: "Більшість студентів тут.", a: ["des"], o: ["des", "de", "d'", "les"], why: "Виняток: la plupart des." },
  { pre: "Je prends un verre ", post: "eau.", verb: "склянка", tr: "Я беру склянку води.", a: ["d'"], o: ["d'", "de l'", "l'", "des"], why: "Un verre d'eau." }
];

var T2_PQP = [
  { pre: "Quand je suis arrivé, il ", post: " déjà parti.", verb: "être", tr: "Коли я прийшов, він уже пішов.", a: ["était"], o: ["était", "a", "avait", "est"], why: "Partir з être: il était parti." },
  { pre: "Elle avait ", post: " son travail avant midi.", verb: "finir", tr: "Вона закінчила роботу до полудня.", a: ["fini"], o: ["fini", "finie", "finissait", "finit"], why: "Avait + participe: fini." },
  { pre: "Nous ", post: " mangé quand tu as appelé.", verb: "avoir", tr: "Ми вже поїли, коли ти подзвонив.", a: ["avions"], o: ["avions", "avons", "avait", "étions"], why: "Nous avions mangé." },
  { pre: "Ils étaient ", post: " avant nous.", verb: "arriver", tr: "Вони приїхали раніше за нас.", a: ["arrivés"], o: ["arrivés", "arrivé", "arrivées", "arrivaient"], why: "Ils étaient arrivés." },
  { pre: "Je ne savais pas qu'il avait ", post: " la clé.", verb: "perdre", tr: "Я не знав, що він загубив ключ.", a: ["perdu"], o: ["perdu", "perdue", "perdait", "perdre"], why: "Avait perdu." },
  { pre: "Elle s'était ", post: " tôt.", verb: "se lever", tr: "Вона встала рано.", a: ["levée"], o: ["levée", "levé", "levés", "levait"], why: "Зворотні: être, узгодження: levée." },
  { pre: "Hier, j'ai su que tu ", post: " ma lettre.", verb: "recevoir", tr: "Вчора я дізнався, що ти отримав мого листа.", a: ["avais reçu"], o: ["avais reçu", "as reçu", "recevais", "aurais reçu"], why: "Avais reçu — раніше за «j'ai su»." },
  { pre: "Il n'avait jamais ", post: " la mer avant.", verb: "voir", tr: "Він ніколи раніше не бачив моря.", a: ["vu"], o: ["vu", "vue", "voyait", "voir"], why: "N'avait jamais vu." },
  { pre: "Quand nous sommes arrivés, le film ", post: " déjà commencé.", verb: "commencer", tr: "Коли ми прийшли, фільм уже почався.", a: ["avait"], o: ["avait", "a", "était", "avons"], why: "Commencer з avoir: avait commencé." },
  { pre: "J'avais ", post: " mon livre à la maison.", verb: "oublier", tr: "Я забув книгу вдома.", a: ["oublié"], o: ["oublié", "oubliée", "oubliais", "oublier"], why: "Avais oublié." }
];

var T2_GER = [
  { pre: "Elle écoute de la musique en ", post: ".", verb: "travailler", tr: "Вона слухає музику, працюючи.", a: ["travaillant"], o: ["travaillant", "travaillent", "travaillé", "travailler"], why: "En + -ant." },
  { pre: "Je lis en ", post: " le café.", verb: "boire", tr: "Я читаю, п'ючи каву.", a: ["buvant"], o: ["buvant", "bois", "bu", "boire"], why: "Nous buvons → buvant." },
  { pre: "Il s'est blessé en ", post: " au football.", verb: "jouer", tr: "Він поранився, граючи у футбол.", a: ["jouant"], o: ["jouant", "jouer", "joué", "joue"], why: "En jouant." },
  { pre: "En ", post: " de la gare, j'ai vu Paul.", verb: "sortir", tr: "Виходячи з вокзалу, я побачив Поля.", a: ["sortant"], o: ["sortant", "sortir", "sorti", "sortent"], why: "En sortant." },
  { pre: "Il apprend le français en ", post: " des exercices.", verb: "faire", tr: "Він вчить французьку, роблячи вправи.", a: ["faisant"], o: ["faisant", "fait", "faire", "faisons"], why: "Nous faisons → faisant." },
  { pre: "En ", post: " attentif, tu comprendras.", verb: "être", tr: "Будучи уважним, ти зрозумієш.", a: ["étant"], o: ["étant", "être", "été", "sommes"], why: "Виняток: être → étant." },
  { pre: "Nous marchons en ", post: ".", verb: "parler", tr: "Ми йдемо, розмовляючи.", a: ["parlant"], o: ["parlant", "parler", "parlé", "parlons"], why: "En parlant." },
  { pre: "Elle est tombée en ", post: " dans l'escalier.", verb: "courir", tr: "Вона впала, біжучи по сходах.", a: ["courant"], o: ["courant", "courir", "couru", "court"], why: "En courant." },
  { pre: "On apprend en ", post: ".", verb: "pratiquer", tr: "Вчаться, практикуючись.", a: ["pratiquant"], o: ["pratiquant", "pratiquer", "pratiqué", "pratique"], why: "En pratiquant." },
  { pre: "Il est sorti en ", post: " la porte.", verb: "fermer", tr: "Він вийшов, зачинивши двері.", a: ["fermant"], o: ["fermant", "fermer", "fermé", "ferme"], why: "En fermant." }
];

var T2_IND = [
  { pre: "Il dit : « Je suis fatigué ». → Il dit qu'il ", post: " fatigué.", verb: "dire que", tr: "Він каже, що втомлений.", a: ["est"], o: ["est", "était", "soit", "sera"], why: "Головне речення в présent → час не змінюється." },
  { pre: "Elle a dit : « Je viens ». → Elle a dit qu'elle ", post: ".", verb: "passé → imparfait", tr: "Вона сказала, що приходить.", a: ["venait"], o: ["venait", "vient", "vienne", "est venue"], why: "Після a dit: présent → imparfait." },
  { pre: "Il m'a demandé : « Tu viens ? » → Il m'a demandé ", post: " je venais.", verb: "si", tr: "Він запитав, чи я приходжу.", a: ["si"], o: ["si", "que", "qui", "quoi"], why: "Питання «так/ні» → si." },
  { pre: "Elle demande : « Où est la gare ? » → Elle demande où ", post: " la gare.", verb: "порядок слів", tr: "Вона питає, де вокзал.", a: ["est"], o: ["est", "est-ce que", "est-elle", "qu'est"], why: "У непрямому питанні — прямий порядок слів." },
  { pre: "Il a dit : « J'ai faim ». → Il a dit qu'il ", post: " faim.", verb: "avoir", tr: "Він сказав, що голодний.", a: ["avait"], o: ["avait", "a", "aura", "ait"], why: "Présent → imparfait: avait." },
  { pre: "Je lui ai demandé ", post: " il voulait.", verb: "що", tr: "Я спитав його, чого він хоче.", a: ["ce qu'"], o: ["ce qu'", "ce que", "qu'", "quoi"], why: "Що (додаток): ce que / ce qu'." },
  { pre: "Elle m'a dit de ", post: " attention.", verb: "наказ → de + інфінітив", tr: "Вона сказала мені бути уважним.", a: ["faire"], o: ["faire", "fais", "fasse", "fait"], why: "Наказ у непрямій мові: de + інфінітив." },
  { pre: "Il a dit : « Je partirai demain ». → Il a dit qu'il ", post: " le lendemain.", verb: "futur → conditionnel", tr: "Він сказав, що поїде наступного дня.", a: ["partirait"], o: ["partirait", "partira", "part", "partait"], why: "Futur → conditionnel." },
  { pre: "Ils ont demandé : « Qu'est-ce que tu fais ? » → Ils ont demandé ce que je ", post: ".", verb: "що", tr: "Вони запитали, що я роблю.", a: ["faisais"], o: ["faisais", "fais", "ferai", "fasse"], why: "Présent → imparfait: faisais." },
  { pre: "Il a dit : « Je suis arrivé hier ». → Il a dit qu'il était arrivé ", post: ".", verb: "hier → la veille", tr: "Він сказав, що приїхав напередодні.", a: ["la veille"], o: ["la veille", "hier", "demain", "aujourd'hui"], why: "Hier → la veille." }
];

var T2_CONJ = [
  { pre: "Je reste à la maison ", post: "il pleut.", verb: "причина", tr: "Я лишаюсь вдома, бо йде дощ.", a: ["parce qu'"], o: ["parce qu'", "donc", "pourtant", "alors que"], why: "Parce que → перед голосною parce qu'." },
  { pre: "Il pleut, ", post: " je prends mon parapluie.", verb: "наслідок", tr: "Іде дощ, тому беру парасольку.", a: ["donc"], o: ["donc", "parce que", "pourtant", "alors que"], why: "Donc — наслідок." },
  { pre: "Il est malade, ", post: " il travaille.", verb: "всупереч", tr: "Він хворий, але все ж працює.", a: ["pourtant"], o: ["pourtant", "donc", "parce que", "car"], why: "Pourtant — всупереч очікуванню." },
  { pre: "Il travaille ", post: " son frère se repose.", verb: "контраст", tr: "Він працює, тоді як брат відпочиває.", a: ["alors que"], o: ["alors que", "parce que", "donc", "pourtant"], why: "Alors que — контраст." },
  { pre: "Je ne sors pas, ", post: " il fait trop froid.", verb: "причина", tr: "Я не виходжу, бо надто холодно.", a: ["car"], o: ["car", "donc", "pourtant", "bien que"], why: "Car — причина." },
  { pre: "Nous sortons ", post: "il fasse froid.", verb: "хоч", tr: "Ми виходимо, хоч і холодно.", a: ["bien qu'"], o: ["bien qu'", "parce qu'", "alors qu'", "pour qu'"], why: "Bien que + subjonctif." },
  { pre: "Il parle fort ", post: " tout le monde l'entende.", verb: "мета", tr: "Він говорить голосно, щоб усі чули.", a: ["pour que"], o: ["pour que", "parce que", "bien que", "donc"], why: "Pour que + subjonctif." },
  { pre: "Il était tard, ", post: " nous sommes rentrés.", verb: "наслідок", tr: "Було пізно, тож ми повернулись.", a: ["alors"], o: ["alors", "pourtant", "parce que", "bien que"], why: "Alors — тож." },
  { pre: "", post: " tu es là, aide-moi.", verb: "оскільки", tr: "Оскільки ти тут, допоможи мені.", a: ["Puisque"], o: ["Puisque", "Bien que", "Pourtant", "Donc"], why: "Puisque — причина, відома обом." },
  { pre: "Il est petit, ", post: " il court vite.", verb: "протиставлення", tr: "Він малий, але швидко бігає.", a: ["mais"], o: ["mais", "donc", "car", "parce que"], why: "Mais — протиставлення." }
];
