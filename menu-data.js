(function defineMenuData() {
  const categories = [
    { id: 'icecreams', label: 'Akullore', labels: { sq: 'Akullore', it: 'Gelato', en: 'Ice Cream' } },
    { id: 'sodas', label: 'Pije Freskuese', labels: { sq: 'Pije Freskuese', it: 'Bibite', en: 'Soft Drinks' } },
    { id: 'coffee', label: 'Kafe', labels: { sq: 'Kafe', it: 'Caffè', en: 'Coffee' } },
    { id: 'beers', label: 'Birra', labels: { sq: 'Birra', it: 'Birre', en: 'Beers' } },
    { id: 'cocktails', label: 'Kokteje', labels: { sq: 'Kokteje', it: 'Cocktail', en: 'Cocktails' } },
    { id: 'alcohol', label: 'Alkol', labels: { sq: 'Alkol', it: 'Alcolici', en: 'Spirits' } },
  ];

  const productTranslations = Object.freeze({
    'vanilla-soft-serve': {
      sq: { name: 'Vanilje', description: 'Akullore e butë me shije vaniljeje dhe kaush krokant.' },
      it: { name: 'Vaniglia', description: 'Gelato soft alla vaniglia con cono croccante.' },
      en: { name: 'Vanilla', description: 'Soft vanilla ice cream in a crisp cone.' },
    },
    'vanilla-chocolate': {
      sq: { name: 'Vanilje + Çokollatë', description: 'Dy shije të bashkuara në një spirale.' },
      it: { name: 'Vaniglia + Cioccolato', description: 'Due gusti uniti in un’unica spirale.' },
      en: { name: 'Vanilla + Chocolate', description: 'Two flavours combined in one swirl.' },
    },
    'chocolate-soft-serve': {
      sq: { name: 'Çokollatë', description: 'Akullore e butë me shije të plotë çokollate.' },
      it: { name: 'Cioccolato', description: 'Gelato soft dal gusto pieno di cioccolato.' },
      en: { name: 'Chocolate', description: 'Soft ice cream with a full chocolate flavour.' },
    },
    'vanilla-pink': {
      sq: { name: 'Vanilje + Fruta Pylli', description: 'Përzierje e freskët me vanilje dhe fruta pylli.' },
      it: { name: 'Vaniglia + Frutti di Bosco', description: 'Un fresco mix di vaniglia e frutti di bosco.' },
      en: { name: 'Vanilla + Mixed Berries', description: 'A refreshing mix of vanilla and mixed berries.' },
    },
    'pink-soft-serve': {
      sq: { name: 'Fruta Pylli', description: 'Akullore e butë me shije frutash pylli.' },
      it: { name: 'Frutti di Bosco', description: 'Gelato soft al gusto di frutti di bosco.' },
      en: { name: 'Mixed Berries', description: 'Soft ice cream with a mixed-berry flavour.' },
    },
    '8984d444-d94a-4ce0-9c10-db89815594ab': {
      sq: { description: 'Pije energjike me kafeinë, taurinë dhe vitamina të grupit B; shërbehet e ftohtë.' },
      it: { description: 'Bevanda energetica con caffeina, taurina e vitamine del gruppo B; servita fredda.' },
      en: { description: 'Energy drink with caffeine, taurine and B-group vitamins; served cold.' },
    },
    '69e09cd5-3eaa-4d95-89d9-f2c6dfd837a0': {
      sq: { description: 'Pije energjike me kafeinë, taurinë dhe vitamina të grupit B; shërbehet e ftohtë.' },
      it: { description: 'Bevanda energetica con caffeina, taurina e vitamine del gruppo B; servita fredda.' },
      en: { description: 'Energy drink with caffeine, taurine and B-group vitamins; served cold.' },
    },
    'be59db76-80a5-42c4-904d-a7d2f1d73610': {
      sq: { name: 'Coca-Cola', description: 'Pije e gazuar me shijen klasike Coca-Cola, e freskët dhe e ftohtë.' },
      it: { description: 'Bibita gassata dal gusto classico Coca-Cola, fresca e servita fredda.' },
      en: { description: 'Sparkling soft drink with the classic Coca-Cola taste, served chilled.' },
    },
    '8dfa7625-38c2-422f-9a4a-7457784247ab': {
      sq: { name: 'Coca-Cola Lime', description: 'Pije e gazuar Coca-Cola me një prekje limete; shërbehet e ftohtë.' },
      it: { description: 'Coca-Cola gassata con un tocco di lime; servita fredda.' },
      en: { description: 'Sparkling Coca-Cola with a hint of lime; served chilled.' },
    },
    '407892f8-1be4-4e7a-978d-17e860c4f516': {
      sq: { name: 'Coca-Cola Pa Sheqer', description: 'Shija karakteristike e Coca-Cola-s në një version pa sheqer; shërbehet e ftohtë.' },
      it: { name: 'Coca-Cola Zero Zuccheri', description: 'Il gusto caratteristico di Coca-Cola nella versione senza zucchero; servita fredda.' },
      en: { name: 'Coca-Cola Zero Sugar', description: 'The signature Coca-Cola taste in a sugar-free version; served chilled.' },
    },
    'dd705e52-6835-41fc-8c69-2057faac19f3': {
      sq: { description: 'Pije e gazuar me shije frutash ekzotike, e ëmbël dhe freskuese.' },
      it: { description: 'Bibita gassata dal profilo di frutti esotici, dolce e rinfrescante.' },
      en: { description: 'Sparkling soft drink with an exotic-fruit profile and a sweet, refreshing taste.' },
    },
    '35769819-fd82-4dc8-8746-c064ef9398f5': {
      sq: { description: 'Pije e gazuar me shije portokalli, e freskët dhe me aromë fruti.' },
      it: { name: 'Fanta Arancia', description: 'Bibita gassata al gusto di arancia, fresca e fruttata.' },
      en: { name: 'Fanta Orange', description: 'Sparkling orange-flavoured soft drink with a fresh, fruity taste.' },
    },
    '0d056963-d63d-4703-941c-ce006eb757f1': {
      sq: { name: 'Schweppes', description: 'Pije e gazuar Schweppes me shije freskuese dhe flluska të imëta.' },
      it: { name: 'Schweppes', description: 'Bibita gassata Schweppes dal gusto fresco e con bollicine fini.' },
      en: { name: 'Schweppes', description: 'Schweppes sparkling drink with a refreshing taste and fine bubbles.' },
    },
    '1e05d030-bb16-4ed1-9177-9d2c427d2db4': {
      sq: { name: 'Lemonsoda', description: 'Limonatë italiane e gazuar me shije të fortë limoni; shërbehet e ftohtë.' },
      it: { name: 'Lemonsoda', description: 'Limonata italiana gassata dal deciso gusto di limone; servita fredda.' },
      en: { name: 'Lemonsoda', description: 'Italian sparkling lemonade with a distinctive lemon taste; served chilled.' },
    },
    'e1266386-e4aa-4e04-b2ab-bc62a8e27d0c': {
      sq: { name: 'Oransoda', description: 'Pije e gazuar italiane me portokall dhe shije të plotë agrumesh.' },
      it: { name: 'Oransoda', description: 'Bibita italiana gassata all’arancia dal pieno gusto agrumato.' },
      en: { name: 'Oransoda', description: 'Italian sparkling orange drink with a full citrus flavour.' },
    },
    '2421ed75-4cba-4212-8940-1590e998286f': {
      sq: { name: 'Bravo Pjeshkë', description: 'Pije frutash Bravo me shije të ëmbël pjeshke; shërbehet e ftohtë.' },
      it: { name: 'Bravo Pesca', description: 'Bevanda alla frutta Bravo dal dolce gusto di pesca; servita fredda.' },
      en: { name: 'Bravo Peach', description: 'Bravo fruit drink with a sweet peach flavour; served chilled.' },
    },
    '8cf18af1-272c-4634-b2d4-06b671771973': {
      sq: { name: 'Bravo Mollë', description: 'Pije frutash Bravo me shije të freskët molle.' },
      it: { name: 'Bravo Mela', description: 'Bevanda alla frutta Bravo dal fresco gusto di mela.' },
      en: { name: 'Bravo Apple', description: 'Bravo fruit drink with a fresh apple flavour.' },
    },
    '21181f19-bbec-49d1-8c26-4086b79720bf': {
      sq: { description: 'Pije frutash Bravo me shije rrushi, ideale e ftohtë.' },
      it: { name: 'Bravo Uva', description: 'Bevanda alla frutta Bravo al gusto di uva, ideale servita fredda.' },
      en: { name: 'Bravo Grape', description: 'Bravo fruit drink with a grape flavour, best served chilled.' },
    },
    '0962de52-0061-4195-bed7-883c0bc3ab59': {
      sq: { description: 'Pije frutash Bravo me shije qershie, e ëmbël dhe me aromë fruti.' },
      it: { name: 'Bravo Ciliegia', description: 'Bevanda alla frutta Bravo al gusto di ciliegia, dolce e fruttata.' },
      en: { name: 'Bravo Cherry', description: 'Bravo fruit drink with a sweet, fruity cherry flavour.' },
    },
    'd3639671-07b6-4f44-ad7d-a02f79c458a7': {
      sq: { description: 'Pije frutash Bravo me shije luleshtrydhe; shërbehet e ftohtë.' },
      it: { name: 'Bravo Fragola', description: 'Bevanda alla frutta Bravo al gusto di fragola; servita fredda.' },
      en: { name: 'Bravo Strawberry', description: 'Bravo fruit drink with a strawberry flavour; served chilled.' },
    },
    'f435b9ca-75e4-45a5-b80f-1a6473f995da': {
      sq: { name: 'Lipton Pjeshkë', description: 'Çaj i ftohtë Lipton me shije pjeshke, i lehtë dhe freskues.' },
      it: { name: 'Lipton Pesca', description: 'Tè freddo Lipton al gusto di pesca, leggero e rinfrescante.' },
      en: { name: 'Lipton Peach', description: 'Light and refreshing Lipton iced tea with a peach flavour.' },
    },
    'f69b3ed8-8235-43e8-a558-333d9b137a12': {
      sq: { description: 'Çaj i ftohtë Lipton me shije limoni, i freskët dhe me aromë agrumesh.' },
      it: { name: 'Lipton Limone', description: 'Tè freddo Lipton al gusto di limone, fresco e agrumato.' },
      en: { name: 'Lipton Lemon', description: 'Fresh, citrusy Lipton iced tea with a lemon flavour.' },
    },
    '8a2bc2a2-a7fa-468f-a856-a87acd7a3ba0': {
      sq: { description: 'Pije e gazuar me shije limoni dhe aromë të freskët agrumesh.' },
      it: { name: 'Ivi Limone', description: 'Bibita gassata al gusto di limone dal fresco profilo agrumato.' },
      en: { name: 'Ivi Lemon', description: 'Sparkling lemon-flavoured drink with a fresh citrus profile.' },
    },
    'e261500f-0619-402d-bdf2-85c9de3b00c7': {
      sq: { description: 'Espres AMA me aromë të plotë dhe një shtresë të hollë kremi.' },
      it: { name: 'Caffè AMA', description: 'Espresso AMA dall’aroma pieno e con un sottile strato di crema.' },
      en: { name: 'AMA Coffee', description: 'AMA espresso with a full aroma and a fine layer of crema.' },
    },
    'be293d73-12f0-433b-b072-55ba93098e28': {
      sq: { name: 'Makiato AMA', description: 'Espres AMA me një prekje qumështi të rrahur.' },
      it: { name: 'Macchiato AMA', description: 'Espresso AMA con un tocco di latte montato.' },
      en: { name: 'AMA Macchiato', description: 'AMA espresso with a touch of foamed milk.' },
    },
    '1ba1c140-d768-44c4-afdb-5dfc0711ebbb': {
      sq: { name: 'Ujë Natyral', description: 'Ujë natyral pa gaz, shërbehet i ftohtë.' },
      it: { name: 'Acqua Naturale', description: 'Acqua naturale non gassata, servita fredda.' },
      en: { name: 'Still Water', description: 'Still natural water, served chilled.' },
    },
    'e9abc34b-8821-449b-914b-75e7bfecdfd4': {
      sq: { name: 'Ujë I Gazuar', description: 'Ujë i gazuar me flluska, shërbehet i ftohtë.' },
      it: { name: 'Acqua Frizzante', description: 'Acqua gassata con bollicine, servita fredda.' },
      en: { name: 'Sparkling Water', description: 'Sparkling water with bubbles, served chilled.' },
    },
    '52df4424-06fa-4eb1-92e2-d7fbeed3ca29': {
      sq: { description: 'Espres i ftohtë i tundur me akull, me shije intensive dhe një shtresë të lehtë shkume.' },
      it: { description: 'Espresso freddo shakerato con ghiaccio, dal gusto intenso e con una leggera schiuma.' },
      en: { description: 'Chilled espresso shaken with ice for an intense flavour and a light layer of foam.' },
    },
    '6aabc70d-3563-4a69-ba8f-6e835a81db49': {
      sq: { name: 'Makiato Freddo', description: 'Kafe e ftohtë me një prekje qumështi të rrahur.' },
      it: { name: 'Freddo Macchiato', description: 'Caffè freddo con un tocco di latte montato.' },
      en: { name: 'Freddo Macchiato', description: 'Chilled freddo coffee with a touch of foamed milk.' },
    },
    '0b94ffdf-0bd9-4755-8f95-a59e0ade8a6f': {
      sq: { description: 'Espres i ftohtë me akull, i plotësuar me qumësht të ftohtë të rrahur.' },
      it: { description: 'Espresso freddo con ghiaccio, completato da latte freddo montato.' },
      en: { description: 'Chilled espresso over ice, topped with cold foamed milk.' },
    },
    'de0a86bb-95c9-4e10-8a59-28f2f51748b5': {
      sq: { name: 'Frappé', description: 'Kafe e ftohtë e tundur me ujë dhe akull derisa të krijojë shkumë të dendur.' },
      it: { name: 'Frappè', description: 'Caffè freddo shakerato con acqua e ghiaccio fino a ottenere una schiuma densa.' },
      en: { name: 'Frappé', description: 'Chilled coffee shaken with water and ice until thickly foamed.' },
    },
    '60e56284-5b66-4cc4-9941-25574a48daa7': {
      sq: { name: 'Frappé Me Akullore', description: 'Frappé i ftohtë me akullore, për një shije më kremoze dhe më të ëmbël.' },
      it: { name: 'Frappè con Gelato', description: 'Frappè freddo con gelato, per un gusto più cremoso e dolce.' },
      en: { name: 'Frappé with Ice Cream', description: 'Chilled frappé with ice cream for a creamier, sweeter taste.' },
    },
    'd4084eca-364a-47e7-8862-f28a346e21dd': {
      sq: { description: 'Espres me qumësht të ngrohtë dhe një shtresë të lehtë shkume.' },
      it: { name: 'Caffè Latte', description: 'Espresso con latte caldo e un leggero strato di schiuma.' },
      en: { name: 'Caffè Latte', description: 'Espresso with warm milk and a light layer of foam.' },
    },
    '33133700-b949-4872-8c35-96ed93654773': {
      sq: { description: 'Kafe e shoqëruar me akullore vanilje, një kombinim i ngrohtë dhe kremoz.' },
      it: { name: 'Caffè con Gelato', description: 'Caffè accompagnato da gelato alla vaniglia, un abbinamento caldo e cremoso.' },
      en: { name: 'Coffee with Ice Cream', description: 'Coffee served with vanilla ice cream for a warm, creamy combination.' },
    },
    '48a6012b-f978-429b-a455-00c22000bf08': {
      sq: { name: 'Kafe Pa Kafeinë', description: 'Espres pa kafeinë me aromë të butë.' },
      it: { name: 'Espresso Decaffeinato', description: 'Espresso decaffeinato dal profilo aromatico delicato.' },
      en: { name: 'Decaf Espresso', description: 'Decaffeinated espresso with a smooth aromatic profile.' },
    },
    '103e6d55-bb22-47b4-ae5a-898e3f3cbb6d': {
      sq: { name: 'Çokollatë E Ftohtë', description: 'Pije e ftohtë çokollate, e ëmbël dhe kremoze.' },
      it: { name: 'Cioccolata Fredda', description: 'Bevanda fredda al cioccolato, dolce e cremosa.' },
      en: { name: 'Iced Chocolate', description: 'A sweet and creamy chilled chocolate drink.' },
    },
    'ad7b2f0c-960e-40bc-b284-658f95c421c7': {
      sq: { name: 'AMA Ice Coffee', description: 'Kafe e ftohtë AMA, e menduar për t’u shijuar e freskët dhe në mënyrë praktike.' },
      it: { description: 'Caffè freddo AMA, pensato per essere gustato fresco e in modo pratico.' },
      en: { description: 'AMA iced coffee made to be enjoyed chilled and conveniently.' },
    },
    '4237dc02-491a-4c87-bc57-3be413e90e91': {
      sq: { name: 'Caffè Mio', description: 'Kafe e ftohtë kremoze me qumësht, ideale për ta shijuar në lëvizje.' },
      it: { name: 'Caffè Mio', description: 'Caffè freddo cremoso con latte, ideale da gustare in movimento.' },
      en: { description: 'Creamy iced coffee with milk, convenient to enjoy on the go.' },
    },
    'dcd72bfc-0a9a-4001-afe5-6388baacb0f2': {
      sq: { description: 'Birrë gruri natyrshëm e turbullt, me nota të buta fruti dhe majaje.' },
      it: { name: 'Paulaner Torbida', description: 'Birra di frumento naturalmente torbida, con morbide note fruttate e di lievito.' },
      en: { name: 'Paulaner Wheat Beer', description: 'Naturally cloudy wheat beer with soft fruit and yeast notes.' },
    },
    'f9e3ecf4-e830-4362-b99c-10439cf45702': {
      sq: { description: 'Birrë e pastër dhe e ekuilibruar, me profil të lehtë malti dhe hopi.' },
      it: { description: 'Lager pulita ed equilibrata, dal leggero profilo di malto e luppolo.' },
      en: { description: 'Clean, balanced lager with a light malt-and-hop profile.' },
    },
    '5b7ec5a2-9934-4320-9842-d70677c29557': {
      sq: { description: 'Birrë e freskët dhe e ekuilibruar, me nota të lehta fruti.' },
      it: { description: 'Lager fresca ed equilibrata, con leggere note fruttate.' },
      en: { description: 'Crisp, balanced lager with light fruity notes.' },
    },
    '64b37384-0d00-4113-afe3-7a24d807a591': {
      sq: { description: 'Birrë Peja, e lehtë dhe freskuese; shërbehet e ftohtë.' },
      it: { description: 'Lager di Peja, leggera e rinfrescante; servita fredda.' },
      en: { name: 'Peja Beer', description: 'Light, refreshing lager from Peja; served chilled.' },
    },
    'c6e5ede5-2bbb-4873-a8f0-a8705744fc3a': {
      sq: { name: 'Heineken 0.0 Pa Alkool', description: 'Birrë pa alkool me nota fruti dhe trup të butë malti.' },
      it: { name: 'Heineken 0.0 Analcolica', description: 'Lager analcolica con note fruttate e un morbido corpo maltato.' },
      en: { name: 'Heineken 0.0 Alcohol-Free', description: 'Alcohol-free lager with fruity notes and a smooth malt body.' },
    },
    '7958cec0-546a-4413-85be-b64823bb7c44': {
      sq: { description: 'Birrë e lehtë dhe freskuese, ideale e ftohtë.' },
      it: { description: 'Lager leggera e rinfrescante, ideale servita fredda.' },
      en: { name: 'Elbar Beer', description: 'Light and refreshing lager, best served chilled.' },
    },
    'c2573937-65b4-44a6-8d5e-9138296e0ceb': {
      sq: { description: 'E madhe: 400 ALL / e vogël: 300 ALL' },
      it: { description: 'Grande 400 ALL / Piccola 300 ALL' },
      en: { description: 'Large 400 ALL / Small 300 ALL' },
    },
    '47f839e4-8800-4c20-b1f9-676ae629dbd0': {
      sq: { description: 'E madhe / e vogël: 200 ALL / 250 ALL' },
      it: { name: 'Peja alla Spina', description: 'Grande / Piccola · 250 ALL / 200 ALL' },
      en: { name: 'Draught Peja', description: 'Large / Small · 250 ALL / 200 ALL' },
    },
    'e690a2df-f9c0-4cea-add7-317ae44298f6': {
      sq: { name: 'Xhin Tonik / Limon', description: 'Xhin i shërbyer me tonik ose pije limoni, akull dhe një prekje agrumesh.' },
      it: { name: 'Gin Tonic / Limone', description: 'Gin servito con tonica o bibita al limone, ghiaccio e un tocco di agrumi.' },
      en: { description: 'Gin served with tonic or lemon soda, ice and a touch of citrus.' },
    },
    '350403e2-af5a-4012-a03b-1b7eac43cec4': {
      sq: { name: 'Joalkoolik', description: 'I ëmbël / i athët' },
      it: { name: 'Analcolico', description: 'Dolce / Aspro' },
      en: { name: 'Non-Alcoholic', description: 'Sweet / Sour' },
    },
    'f85d71a3-a33f-4de1-b855-c5ce95a8249b': {
      sq: { description: 'Kokteil italian me Prosecco, Aperol dhe sodë, shërbehet me akull dhe portokall.' },
      it: { description: 'Cocktail italiano con Prosecco, Aperol e soda, servito con ghiaccio e arancia.' },
      en: { description: 'Italian cocktail with Prosecco, Aperol and soda, served with ice and orange.' },
    },
    'baff7dc6-e07a-41b3-9285-6d7ea1c55265': {
      sq: { description: 'Kokteil me Campari, Prosecco dhe sodë, i freskët dhe lehtë i hidhur.' },
      it: { description: 'Cocktail con Campari, Prosecco e soda, fresco e leggermente amaro.' },
      en: { description: 'Cocktail with Campari, Prosecco and soda, fresh and gently bitter.' },
    },
    'b87e074e-005b-4e0c-aaab-29fd76d7a6a8': {
      sq: { description: 'Spritz me shije agrumesh, limoncello, verë gazuar dhe sodë, shërbehet me akull.' },
      it: { description: 'Spritz agrumato con limoncello, vino spumante e soda, servito con ghiaccio.' },
      en: { description: 'Citrusy spritz with limoncello, sparkling wine and soda, served over ice.' },
    },
    '823064c6-5e98-4bd4-9a7b-7d4c029189b1': {
      sq: { name: 'Hendrick’s Gin', description: 'Xhin skocez premium, i shërbyer thjesht ose me tonik.' },
      it: { name: 'Gin Hendrick’s', description: 'Gin scozzese premium, servito liscio o con tonica.' },
      en: { name: 'Hendrick’s Gin', description: 'Premium Scottish gin, served neat or with tonic.' },
    },
    'c5891891-5ac7-4a2d-9fdd-d89f12ec32f1': {
      sq: { name: 'Gordon’s Gin', description: 'Xhin klasik britanik, i shërbyer me tonik dhe akull.' },
      it: { name: 'Gin Gordon’s', description: 'Gin classico britannico, servito con tonica e ghiaccio.' },
      en: { name: 'Gordon’s Gin', description: 'Classic British gin, served with tonic and ice.' },
    },
    '8bff6869-20ee-4b5d-a378-e2593ef4d879': {
      sq: { name: 'Shot Tekila', description: 'Shot tekile, shërbehet me limon dhe kripë.' },
      it: { name: 'Shot di Tequila', description: 'Shot di tequila, servito con lime e sale.' },
      en: { name: 'Tequila Shots', description: 'Tequila shot, served with lime and salt.' },
    },
    'a33ac9ac-d1a6-47c5-b923-ffaa50104511': {
      sq: { name: 'Raki Rrushi', description: 'Raki tradicionale rrushi, e prodhuar lokalisht.' },
      it: { name: 'Raki d’Uva', description: 'Raki tradizionale d’uva, di produzione locale.' },
      en: { name: 'Grape Raki', description: 'Traditional grape raki, locally produced.' },
    },
    '4407426d-26c2-4acf-aa23-1acdba2468b0': {
      sq: { name: 'Jack Daniel’s', description: 'Uiski amerikan Tennessee, i shërbyer thjesht ose me akull.' },
      it: { name: 'Jack Daniel’s', description: 'Whiskey americano del Tennessee, servito liscio o con ghiaccio.' },
      en: { name: 'Jack Daniel’s', description: 'Tennessee whiskey, served neat or on the rocks.' },
    },
    '003ed2e4-231d-4ee8-9256-b42295bf3316': {
      sq: { name: 'Vecchia Romagna', description: 'Brandy italian, i shërbyer thjesht ose me akull.' },
      it: { name: 'Vecchia Romagna', description: 'Brandy italiano, servito liscio o con ghiaccio.' },
      en: { name: 'Vecchia Romagna', description: 'Italian brandy, served neat or on the rocks.' },
    },
    'fe455313-2e60-4379-840a-d106b264bcd6': {
      sq: { name: 'Jägermeister', description: 'Liker gjerman bimësh, shërbehet i ftohtë.' },
      it: { name: 'Jägermeister', description: 'Amaro tedesco alle erbe, servito freddo.' },
      en: { name: 'Jägermeister', description: 'German herbal liqueur, served ice-cold.' },
    },
    '82ee247b-94fc-4dbe-823f-fb800a9b7d2d': {
      sq: { name: 'Disaronno', description: 'Liker italian me shije bajame, shërbehet thjesht ose me akull.' },
      it: { name: 'Disaronno', description: 'Liquore italiano al gusto di mandorla, servito liscio o con ghiaccio.' },
      en: { name: 'Disaronno', description: 'Italian almond-flavoured liqueur, served neat or on the rocks.' },
    },
    'cadacfcf-1b9d-487c-96c4-d89bdc37c427': {
      sq: { description: 'Uiski skocez i përzier, i shërbyer thjesht ose me akull.' },
      it: { description: 'Whisky scozzese blended, servito liscio o con ghiaccio.' },
      en: { description: 'Blended Scotch whisky, served neat or on the rocks.' },
    },
    '52e8dbb7-d1be-405d-9813-90ffd4cf586e': {
      sq: { description: 'Vodka suedeze, e shërbyer e ftohtë ose me pije shoqëruese.' },
      it: { description: 'Vodka svedese, servita fredda o con una bibita a scelta.' },
      en: { description: 'Swedish vodka, served chilled or with a mixer.' },
    },
    '573be5b4-e84f-4f4b-b9bf-f0d728ae8c00': {
      sq: { description: 'Vermut italian, shërbehet thjesht ose me akull.' },
      it: { description: 'Vermouth italiano, servito liscio o con ghiaccio.' },
      en: { description: 'Italian vermouth, served neat or on the rocks.' },
    },
    'f71cccf3-3ced-475c-b57d-53782a50ab74': {
      sq: { description: 'Uzo grek me shije anasoni, shërbehet i ftohtë me ujë ose akull.' },
      it: { description: 'Ouzo greco all’anice, servito freddo con acqua o ghiaccio.' },
      en: { description: 'Greek anise-flavoured ouzo, served chilled with water or ice.' },
    },
    '729ae90e-6bad-46ef-bf0a-1152cd4c5224': {
      sq: { description: 'Amaro italian bimësh, shërbehet i ftohtë.' },
      it: { description: 'Amaro italiano alle erbe, servito freddo.' },
      en: { description: 'Italian herbal amaro, served ice-cold.' },
    },
    'd875f83a-fba8-4d71-8364-8627d0425437': {
      sq: { description: 'Aperitiv italian i kuq me shije të hidhur bimësh.' },
      it: { description: 'Aperitivo italiano rosso dal gusto amaro di erbe.' },
      en: { description: 'Italian red bitter aperitif with herbal notes.' },
    },
    '85e64572-7cf3-4992-bb96-83b24c966fea': {
      sq: { description: 'Amaro italian bimësh me shije të ëmbël-hidhur.' },
      it: { description: 'Amaro italiano alle erbe dal gusto dolce-amaro.' },
      en: { description: 'Italian herbal amaro with a sweet-bitter taste.' },
    },
    '0963df7b-ed4d-48c0-90b1-01c9232e3e80': {
      sq: { description: 'Uiski skocez i përzier, i lehtë dhe i ekuilibruar.' },
      it: { description: 'Whisky scozzese blended, leggero ed equilibrato.' },
      en: { description: 'Blended Scotch whisky, light and balanced.' },
    },
    '04826399-09e4-4759-b910-6e53055dd5bf': {
      sq: { description: 'Uiski i përzier, i shërbyer thjesht ose me akull.' },
      it: { description: 'Whisky blended, servito liscio o con ghiaccio.' },
      en: { description: 'Blended whisky, served neat or on the rocks.' },
    },
    '7750afa1-f226-43a3-9576-5e04367a9a58': {
      sq: { description: 'Uiski skocez i përzier, klasik dhe i lehtë.' },
      it: { description: 'Whisky scozzese blended, classico e leggero.' },
      en: { description: 'Blended Scotch whisky, classic and light.' },
    },
    '8c0350c4-ad16-4879-aae2-1aedbac1ea7f': {
      sq: { description: 'Brendi grek i vjetëruar, me aromë të butë.' },
      it: { description: 'Brandy greco invecchiato, dal profilo morbido.' },
      en: { description: 'Aged Greek brandy with a smooth profile.' },
    },
    '4dc2d43a-ea61-4c10-978f-6f2f4e732511': {
      sq: { description: 'Uiski i përzier italian, i shërbyer thjesht ose me akull.' },
      it: { description: 'Whisky blended italiano, servito liscio o con ghiaccio.' },
      en: { description: 'Italian blended whisky, served neat or on the rocks.' },
    },
  });

  const categoryOverrides = Object.freeze({
    'f71cccf3-3ced-475c-b57d-53782a50ab74': 'alcohol',
    '0963df7b-ed4d-48c0-90b1-01c9232e3e80': 'alcohol',
  });

  const products = [
    {
      id: 'vanilla-soft-serve',
      name: 'Vanilje',
      category: 'icecreams',
      description: 'Akullore e butë me shije vaniljeje dhe kaush krokant.',
      price: '',
      image: 'assets/optimized/ice-cream-cone.webp',
    },
    {
      id: 'vanilla-chocolate',
      name: 'Vanilje + Çokollatë',
      category: 'icecreams',
      description: 'Dy shije të bashkuara në një spirale.',
      price: '',
      image: 'assets/optimized/vanilla-chocolate-cone.webp',
    },
    {
      id: 'chocolate-soft-serve',
      name: 'Çokollatë',
      category: 'icecreams',
      description: 'Akullore e butë me shije të plotë çokollate.',
      price: '',
      image: 'assets/optimized/chocolate-cone.webp',
    },
    {
      id: 'vanilla-pink',
      name: 'Vanilje + Fruta Pylli',
      category: 'icecreams',
      description: 'Përzierje e freskët me vanilje dhe fruta pylli.',
      price: '',
      image: 'assets/optimized/vanilla-pink-cone.webp',
    },
    {
      id: 'pink-soft-serve',
      name: 'Fruta Pylli',
      category: 'icecreams',
      description: 'Akullore e butë me shije frutash pylli.',
      price: '',
      image: 'assets/optimized/pink-cone.webp',
    },
  ];

  window.BAR_MARTIRI_MENU = { categories, products, productTranslations, categoryOverrides };
})();
