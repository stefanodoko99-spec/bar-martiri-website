(function startBarMartiri() {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuData = window.BAR_MARTIRI_MENU || {
    categories: [],
    products: [],
    productTranslations: {},
    categoryOverrides: {},
  };
  const supabaseConfig = window.BAR_MARTIRI_SUPABASE || {};
  const localProductImages = window.BAR_MARTIRI_LOCAL_PRODUCT_IMAGES || {};
  const story = document.querySelector('.assembly-story');
  const dock = document.querySelector('[data-bottom-dock]');
  const dockActions = [...document.querySelectorAll('[data-dock-action]')];
  const panelLayer = document.querySelector('[data-panel-layer]');
  const panels = [...document.querySelectorAll('[data-panel]')];
  const closeButtons = [...document.querySelectorAll('[data-panel-close]')];
  const categoryTabs = document.querySelector('[data-category-tabs]');
  const productGrid = document.querySelector('[data-product-grid]');
  const menuStatus = document.querySelector('[data-menu-status]');
  const cookieBanner = document.querySelector('[data-cookie-banner]');
  const welcomeGate = document.querySelector('[data-welcome-gate]');
  const welcomeStatus = document.querySelector('[data-welcome-status]');
  const welcomeLoader = document.querySelector('[data-welcome-loader]');
  const languageChoices = [...document.querySelectorAll('[data-language-choice]')];
  const languageSwitches = [...document.querySelectorAll('[data-language-switch]')];
  const mapFrame = document.querySelector('[data-map-shell] iframe');
  const mapPlaceholder = document.querySelector('[data-map-placeholder]');
  const MENU_CACHE_KEY = 'barMartiri.publicMenu.v3';
  const MENU_CACHE_TTL = 24 * 60 * 60 * 1000;
  const MENU_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
  const WEATHER_CACHE_KEY = 'barMartiri.spilleWeather.v1';
  const WEATHER_CACHE_TTL = 60 * 60 * 1000;
  const SPILLE_COORDS = { latitude: 41.0966, longitude: 19.4583 };
  const COOKIE_NAME = 'bar_martiri_cookie_pref';
  const LANGUAGE_KEY = 'barMartiri.language.v1';

  const LANGUAGE_LOCALES = Object.freeze({
    sq: 'sq-AL',
    it: 'it-IT',
    en: 'en-GB',
  });

  const SEO_TEXT = Object.freeze({
    sq: {
      title: 'Bar Martiri Spille | Shezlongje pranë Detit',
      description:
        'Bar Martiri në Spille, Shqipëri: shezlongje, parkim falas, akullore, kafe dhe pije pranë detit për pushimet tuaja verore.',
      path: '/',
    },
    it: {
      title: 'Bar Martiri Spille | Lettini vicino al mare',
      description:
        'Bar Martiri a Spille, Albania: lettini, parcheggio gratuito, gelato, caffè e bibite vicino al mare.',
      path: '/it/',
    },
    en: {
      title: 'Bar Martiri Spille | Sunbeds by the Sea',
      description:
        'Bar Martiri in Spille, Albania: sunbeds, free parking, ice cream, coffee and cold drinks by the sea.',
      path: '/en/',
    },
  });

  const UI_TEXT = Object.freeze({
    'Kalo te permbajtja': { sq: 'Kalo te përmbajtja', it: 'Vai al contenuto', en: 'Skip to content' },
    'Kreu i faqes': { sq: 'Kreu i faqes', it: 'Intestazione del sito', en: 'Site header' },
    'Bar Martiri, kryefaqja': { sq: 'Bar Martiri, kryefaqja', it: 'Bar Martiri, pagina iniziale', en: 'Bar Martiri, home page' },
    'Zgjedhja e gjuhës': { sq: 'Zgjedhja e gjuhës', it: 'Scelta della lingua', en: 'Language selection' },
    'Ndrysho gjuhën': { sq: 'Ndrysho gjuhën', it: 'Cambia lingua', en: 'Change language' },
    'Navigimi kryesor': { sq: 'Navigimi kryesor', it: 'Navigazione principale', en: 'Main navigation' },
    'Shërbimet e Bar Martiri': { sq: 'Shërbimet e Bar Martiri', it: 'Servizi di Bar Martiri', en: 'Bar Martiri services' },
    'Shijet e akullores': { sq: 'Shijet e akullores', it: 'Gusti del gelato', en: 'Ice cream flavours' },
    'Akullore vanilje qe vendoset ne kaush': { sq: 'Akullore vanilje që vendoset në kaush', it: 'Gelato alla vaniglia servito nel cono', en: 'Vanilla ice cream placed in a cone' },
    '5 nga 5': { sq: '5 nga 5', it: '5 su 5', en: '5 out of 5' },
    'BAR MARTIRI · SPILLE · AKULLORE · KAFE · DET ·': { sq: 'BAR MARTIRI · SPILLE · AKULLORE · KAFE · DET ·', it: 'BAR MARTIRI · SPILLE · GELATO · CAFFÈ · MARE ·', en: 'BAR MARTIRI · SPILLE · ICE CREAM · COFFEE · SEA ·' },
    'Hap menune': { sq: 'Hap menunë', it: 'Apri il menu', en: 'Open menu' },
    'Mbyll menune': { sq: 'Mbyll menunë', it: 'Chiudi il menu', en: 'Close menu' },
    'Hap vendndodhjen': { sq: 'Hap vendndodhjen', it: 'Apri la posizione', en: 'Open location' },
    'Mbyll vendndodhjen': { sq: 'Mbyll vendndodhjen', it: 'Chiudi la posizione', en: 'Close location' },
    'Hap informacionin': { sq: 'Hap informacionin', it: 'Apri le informazioni', en: 'Open information' },
    'Mbyll informacionin': { sq: 'Mbyll informacionin', it: 'Chiudi le informazioni', en: 'Close information' },
    'Kategorite e menuse': { sq: 'Kategoritë e menusë', it: 'Categorie del menu', en: 'Menu categories' },
    'Lidhje te tjera': { sq: 'Lidhje të tjera', it: 'Altri collegamenti', en: 'Other links' },
    'Sherbimet e Bar Martiri': { sq: 'Shërbimet e Bar Martiri', it: 'Servizi di Bar Martiri', en: 'Bar Martiri services' },
    'Spille · Shqipëri': { sq: 'Spille · Shqipëri', it: 'Spille · Albania', en: 'Spille · Albania' },
    'E bute. E fresket. E jotja.': { sq: 'E butë. E freskët. E jotja.', it: 'Morbido. Fresco. Tuo.', en: 'Soft. Fresh. Yours.' },
    'Akullorja qe nis me kaushin.': { sq: 'Akullorja që nis me kaushin.', it: 'Il gelato che inizia dal cono.', en: 'The ice cream that starts with the cone.' },
    'Pese shije': { sq: 'Pesë shije', it: 'Cinque gusti', en: 'Five flavours' },
    'Nje Martiri.': { sq: 'Një Martiri.', it: 'Un Martiri.', en: 'One Martiri.' },
    'Baza': { sq: 'Baza', it: 'La base', en: 'The base' },
    'E bere me qumesht': { sq: 'E bërë me qumësht', it: 'Preparato con latte', en: 'Made with milk' },
    'E lemuar, e fresket dhe e pergatitur per momentin tend prane detit.': { sq: 'E lëmuar, e freskët dhe e përgatitur për momentin tënd pranë detit.', it: 'Cremoso, fresco e preparato per il tuo momento vicino al mare.', en: 'Smooth, fresh and made for your moment by the sea.' },
    'Kaushi': { sq: 'Kaushi', it: 'Il cono', en: 'The cone' },
    'Vafer krokante': { sq: 'Vafer krokante', it: 'Cialda croccante', en: 'Crisp wafer' },
    'Nje fund i lehte dhe krokant per cdo spirale akulloreje.': { sq: 'Një bazë e lehtë dhe krokante për çdo spirale akulloreje.', it: 'Una base leggera e croccante per ogni spirale di gelato.', en: 'A light, crisp base for every swirl of ice cream.' },
    'Rreshqit per ta krijuar': { sq: 'Rrëshqit për ta krijuar', it: 'Scorri per crearlo', en: 'Scroll to build it' },
    'Bar në Spille': { sq: 'Bar në Spille', it: 'Bar a Spille', en: 'Bar in Spille' },
    'Vera pranë detit nis te Martiri.': { sq: 'Vera pranë detit nis te Martiri.', it: "L'estate al mare inizia da Martiri.", en: 'Summer by the sea starts at Martiri.' },
    'Bar Martiri në Spille, Shqipëri, është ndalesa pranë plazhit për shezlongje, akullore, kafe dhe pije të freskëta. Parkimi falas dhe aksesi i thjeshtë e bëjnë ditën në det më të lehtë.': { sq: 'Bar Martiri në Spille, Shqipëri, është ndalesa pranë plazhit për shezlongje, akullore, kafe dhe pije të freskëta. Parkimi falas dhe aksesi i thjeshtë e bëjnë ditën në det më të lehtë.', it: 'Bar Martiri a Spille, Albania, è una sosta vicino alla spiaggia per lettini, gelato, caffè e bibite. Il parcheggio gratuito e il facile accesso rendono più semplice la giornata al mare.', en: 'Bar Martiri in Spille, Albania, is a beachside stop for sunbeds, ice cream, coffee and cold drinks. Free parking and easy access make a day by the sea simpler.' },
    'Shezlongje pranë detit': { sq: 'Shezlongje pranë detit', it: 'Lettini vicino al mare', en: 'Sunbeds by the sea' },
    'Prenoto vendin tënd për një ditë pushimi në Spille.': { sq: 'Prenoto vendin tënd për një ditë pushimi në Spille.', it: 'Prenota il tuo posto per una giornata di relax a Spille.', en: 'Book your spot for a relaxing day in Spille.' },
    'Parkim falas': { sq: 'Parkim falas', it: 'Parcheggio gratuito', en: 'Free parking' },
    'Parkim pa pagesë për klientët e Bar Martiri.': { sq: 'Parkim pa pagesë për klientët e Bar Martiri.', it: 'Parcheggio gratuito per i clienti di Bar Martiri.', en: 'Free parking for Bar Martiri customers.' },
    'Shije verore': { sq: 'Shije verore', it: "Sapori d'estate", en: 'Summer flavours' },
    'Akullore, kafe dhe pije të freskëta pranë plazhit.': { sq: 'Akullore, kafe dhe pije të freskëta pranë plazhit.', it: 'Gelato, caffè e bibite vicino alla spiaggia.', en: 'Ice cream, coffee and cold drinks by the beach.' },
    'Po marrim kushtet e fundit.': { sq: 'Po marrim kushtet e fundit.', it: 'Stiamo caricando le condizioni attuali.', en: 'Loading the latest conditions.' },
    'Moti: MET Norway': { sq: 'Moti: MET Norway', it: 'Meteo: MET Norway', en: 'Weather: MET Norway' },
    'Prane detit': { sq: 'Pranë detit', it: 'Vicino al mare', en: 'By the sea' },
    'Ndal per shijen.': { sq: 'Ndal për shijen.', it: 'Fermati per il gusto.', en: 'Stop for the flavour.' },
    'Qendro per pamjen.': { sq: 'Qëndro për pamjen.', it: 'Resta per la vista.', en: 'Stay for the view.' },
    'Orari': { sq: 'Orari', it: 'Orari', en: 'Hours' },
    'Cdo dite': { sq: 'Çdo ditë', it: 'Tutti i giorni', en: 'Every day' },
    'Hap ne harte': { sq: 'Hap në hartë', it: 'Apri la mappa', en: 'Open map' },
    'Google Reviews': { sq: 'Vlerësime në Google', it: 'Recensioni Google', en: 'Google Reviews' },
    'Vlerësimi i fundit i verifikuar më 3 gusht 2026, nga': { sq: 'Vlerësimi i fundit i verifikuar më 3 gusht 2026, nga', it: 'Ultima valutazione verificata il 3 agosto 2026, da', en: 'Latest rating verified on 3 August 2026, from' },
    'vlerësime në Google.': { sq: 'vlerësime në Google.', it: 'recensioni su Google.', en: 'Google reviews.' },
    'Vleresimi aktual nga': { sq: 'Vlerësimi aktual nga', it: 'Valutazione attuale da', en: 'Current rating from' },
    'pershtypje te publikuara ne Google.': { sq: 'vlerësime të publikuara në Google.', it: 'recensioni pubblicate su Google.', en: 'reviews published on Google.' },
    'Shiko te gjitha ne Google': { sq: 'Shiko të gjitha në Google', it: 'Vedi tutte su Google', en: 'See all on Google' },
    'Shihemi': { sq: 'Shihemi', it: 'Ci vediamo', en: 'See you' },
    'te Martiri.': { sq: 'te Martiri.', it: 'da Martiri.', en: 'at Martiri.' },
    'Akullore, kafe dhe pije te fresketa, cdo dite nga 06:00 deri ne 23:00.': { sq: 'Akullore, kafe dhe pije të freskëta, çdo ditë nga 06:00 deri në 23:00.', it: 'Gelato, caffè e bibite, tutti i giorni dalle 06:00 alle 23:00.', en: 'Ice cream, coffee and cold drinks, every day from 06:00 to 23:00.' },
    'Na gjen ketu': { sq: 'Na gjen këtu', it: 'Ci trovi qui', en: 'Find us here' },
    'Harta ngarkohet vetem kur e kerkon ti.': { sq: 'Harta ngarkohet vetëm kur e kërkon ti.', it: 'La mappa si carica solo quando lo richiedi.', en: 'The map loads only when you request it.' },
    'Ngarko Google Maps': { sq: 'Ngarko Google Maps', it: 'Carica Google Maps', en: 'Load Google Maps' },
    'Adresa': { sq: 'Adresa', it: 'Indirizzo', en: 'Address' },
    'Merr drejtimin': { sq: 'Merr drejtimin', it: 'Indicazioni stradali', en: 'Get directions' },
    'Informacion': { sq: 'Informacion', it: 'Informazioni', en: 'Information' },
    'Pushimi yt ne Spille': { sq: 'Pushimi yt në Spille', it: 'La tua vacanza a Spille', en: 'Your break in Spille' },
    'Deti, hija dhe gjithcka qe te duhet per nje dite te qete.': { sq: 'Deti, hija dhe gjithçka që të duhet për një ditë të qetë.', it: 'Il mare, l’ombra e tutto ciò che serve per una giornata tranquilla.', en: 'The sea, shade and everything you need for a relaxed day.' },
    'Bar Martiri eshte prane plazhit, me sherbim te thjeshte dhe hapesire per te kaluar diten me familjen ose miqte.': { sq: 'Bar Martiri është pranë plazhit, me shërbim të thjeshtë dhe hapësirë për të kaluar ditën me familjen ose miqtë.', it: 'Bar Martiri è vicino alla spiaggia, con un servizio semplice e spazio per trascorrere la giornata con la famiglia o gli amici.', en: 'Bar Martiri is by the beach, with simple service and space to spend the day with family or friends.' },
    'Shezlongje': { sq: 'Shezlongje', it: 'Lettini', en: 'Sunbeds' },
    'Prenoto vendin tend prane detit me nje telefonate.': { sq: 'Prenoto vendin tënd pranë detit me një telefonatë.', it: 'Prenota il tuo posto vicino al mare con una telefonata.', en: 'Book your place by the sea with one phone call.' },
    'Parkim pa pagese per klientet e Bar Martiri.': { sq: 'Parkim pa pagesë për klientët e Bar Martiri.', it: 'Parcheggio gratuito per i clienti di Bar Martiri.', en: 'Free parking for Bar Martiri customers.' },
    'Akses i thjeshte': { sq: 'Akses i thjeshtë', it: 'Accesso facile', en: 'Easy access' },
    'Na gjen lehte nga Rruga e Pishave ne Spille.': { sq: 'Na gjen lehtë nga Rruga e Pishave në Spille.', it: 'Ci trovi facilmente da Rruga e Pishave a Spille.', en: 'Find us easily from Rruga e Pishave in Spille.' },
    'Hapur cdo dite': { sq: 'Hapur çdo ditë', it: 'Aperto ogni giorno', en: 'Open every day' },
    'Te presim nga ora 06:00 deri ne 23:00.': { sq: 'Të presim nga ora 06:00 deri në 23:00.', it: 'Ti aspettiamo dalle 06:00 alle 23:00.', en: 'We welcome you from 06:00 to 23:00.' },
    'Prenotime shezlongjesh': { sq: 'Prenotime shezlongjesh', it: 'Prenotazione lettini', en: 'Sunbed reservations' },
    'Rezervo me telefon': { sq: 'Rezervo me telefon', it: 'Prenota per telefono', en: 'Book by phone' },
    'Telefono tani': { sq: 'Telefono tani', it: 'Chiama ora', en: 'Call now' },
    'Preferencat e cookies': { sq: 'Preferencat e cookies', it: 'Preferenze cookie', en: 'Cookie preferences' },
    'Privatesia': { sq: 'Privatësia', it: 'Privacy', en: 'Privacy' },
    'Ruajme vetem preferencen tende. Google Maps ngarkohet vetem pasi ta pranosh.': { sq: 'Ruajmë vetëm preferencën tënde. Google Maps ngarkohet vetëm pasi ta pranosh.', it: 'Salviamo solo la tua preferenza. Google Maps si carica solo dopo il consenso.', en: 'We only save your preference. Google Maps loads only after you consent.' },
    'Vetem te nevojshmet': { sq: 'Vetëm të nevojshmet', it: 'Solo necessari', en: 'Essential only' },
    'Prano': { sq: 'Prano', it: 'Accetta', en: 'Accept' },
    'Home': { sq: 'Kryefaqja', it: 'Home', en: 'Home' },
    'Kryefaqja': { sq: 'Kryefaqja', it: 'Home', en: 'Home' },
    'Location': { sq: 'Vendndodhja', it: 'Posizione', en: 'Location' },
    'Info': { sq: 'Info', it: 'Info', en: 'Info' },
  });

  const DYNAMIC_TEXT = Object.freeze({
    chooseLanguage: { sq: 'Zgjidh gjuhën për të vazhduar.', it: 'Scegli la lingua per continuare.', en: 'Choose your language to continue.' },
    refreshingMenu: { sq: 'Po përditësojmë menunë…', it: 'Aggiornamento del menu…', en: 'Updating the menu…' },
    cachedMenu: { sq: 'Po shfaqet menuja e ruajtur. Provo përsëri pas pak për përditësimet.', it: 'Mostriamo il menu salvato. Riprova tra poco per gli aggiornamenti.', en: 'Showing the saved menu. Try again shortly for updates.' },
    offlineMenu: { sq: 'Lidhja me menunë nuk është e disponueshme. Po shfaqen vetëm produktet bazë.', it: 'Il collegamento al menu non è disponibile. Vengono mostrati solo i prodotti di base.', en: 'The menu connection is unavailable. Only the basic products are shown.' },
    products: { sq: 'produkte', it: 'prodotti', en: 'products' },
    comingSoon: { sq: 'Së shpejti', it: 'Prossimamente', en: 'Coming soon' },
    emptyCategory: { sq: 'Produktet e kësaj kategorie do të shtohen së shpejti.', it: 'I prodotti di questa categoria saranno aggiunti presto.', en: 'Products in this category will be added soon.' },
    unnamedProduct: { sq: 'Pa emër', it: 'Senza nome', en: 'Unnamed' },
  });

  const optimizedLocalImages = {
    'assets/icecream-gallery/ice-cream-cone-transparent.png':
      'assets/optimized/ice-cream-cone.webp',
    'assets/icecream-gallery/vanilla-chocolate-cone-transparent.png':
      'assets/optimized/vanilla-chocolate-cone.webp',
    'assets/icecream-gallery/chocolate-cone-transparent.png':
      'assets/optimized/chocolate-cone.webp',
    'assets/icecream-gallery/vanilla-pink-cone-transparent.png':
      'assets/optimized/vanilla-pink-cone.webp',
    'assets/icecream-gallery/pink-cone-transparent.png':
      'assets/optimized/pink-cone.webp',
  };

  let activePanel = null;
  let activeCategory = menuData.categories[0]?.id || '';
  let previousFocus = null;
  let closeTimer = 0;
  let menuRendered = false;
  let catalogProducts = menuData.products.map(normalizeProduct);
  let storyImagesLoaded = false;
  let lastScrollY = window.scrollY;
  let lastPanelScrollY = 0;
  let scrollFrame = 0;
  let currentLanguage = 'sq';
  let menuLoadPromise = null;
  let productImageObserver = null;

  function dynamicText(key) {
    return DYNAMIC_TEXT[key]?.[currentLanguage] || DYNAMIC_TEXT[key]?.sq || '';
  }

  function setDynamicText(element, key) {
    if (!element) return;
    element.dataset.i18nDynamic = key;
    element.textContent = dynamicText(key);
  }

  function translateTextNodes(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
        const trimmed = node.nodeValue.trim();
        const normalized = trimmed.replace(/\s+/g, ' ');
        if (normalized) {
          if (!node.__barMartiriSourceText) {
            node.__barMartiriSourceText = UI_TEXT[normalized]
              ? normalized
              : Object.keys(UI_TEXT).find((key) => UI_TEXT[key]?.sq === normalized);
          }
          const source = node.__barMartiriSourceText;
          const translated = source && UI_TEXT[source]?.[currentLanguage];
          if (translated) {
            const leading = node.nodeValue.match(/^\s*/)?.[0] || '';
            const trailing = node.nodeValue.match(/\s*$/)?.[0] || '';
            node.nodeValue = `${leading}${translated}${trailing}`;
          }
        }
      }
      node = walker.nextNode();
    }
  }

  function translateAttributes(root = document.body) {
    if (!root) return;
    const attributes = ['aria-label', 'title', 'placeholder', 'alt', 'data-dock-label'];
    root.querySelectorAll(attributes.map((name) => `[${name}]`).join(',')).forEach((element) => {
      attributes.forEach((name) => {
        if (!element.hasAttribute(name)) return;
        const sourceKey = `i18nSource${name.replace(/(^|-)(\w)/g, (_, dash, letter) => letter.toUpperCase())}`;
        const current = element.getAttribute(name);
        if (!element.dataset[sourceKey] && UI_TEXT[current]) {
          element.dataset[sourceKey] = current;
        }
        const source = element.dataset[sourceKey];
        const translated = source && UI_TEXT[source]?.[currentLanguage];
        if (translated) element.setAttribute(name, translated);
      });
    });
  }

  function categoryLabelFor(category) {
    return category?.labels?.[currentLanguage] || category?.label || '';
  }

  function productTranslationFor(product) {
    if (currentLanguage === 'sq') return null;
    const databaseTranslation = product?.translations?.[currentLanguage];
    if (databaseTranslation?.name || databaseTranslation?.description) return databaseTranslation;
    return menuData.productTranslations?.[product?.id]?.[currentLanguage] || null;
  }

  function updateDocumentMetadata() {
    const metadata = SEO_TEXT[currentLanguage] || SEO_TEXT.sq;
    const absoluteUrl = new URL(metadata.path, window.location.origin).href;
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', absoluteUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', absoluteUrl);
  }

  function productNameFor(product) {
    return productTranslationFor(product)?.name || product?.name || dynamicText('unnamedProduct');
  }

  function productDescriptionFor(product) {
    if (!String(product?.description || '').trim()) return '';
    return productTranslationFor(product)?.description || product.description;
  }

  function applyLanguage(language) {
    currentLanguage = LANGUAGE_LOCALES[language] ? language : 'sq';
    document.documentElement.lang = LANGUAGE_LOCALES[currentLanguage];
    updateDocumentMetadata();
    try {
      localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    } catch {
      // The selected language still applies for this visit.
    }

    translateTextNodes(document.body);
    translateAttributes(document.body);
    document.querySelectorAll('[data-i18n-dynamic]').forEach((element) => {
      element.textContent = dynamicText(element.dataset.i18nDynamic);
    });
    languageSwitches.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.languageSwitch === currentLanguage));
    });

    if (menuRendered) {
      renderCategories();
      renderProducts();
    }
  }

  function closeWelcomeGate(language) {
    applyLanguage(language);
    const languagePath = SEO_TEXT[currentLanguage]?.path;
    if (languagePath && window.location.pathname !== languagePath) {
      window.location.assign(languagePath);
      return;
    }
    if (!welcomeGate) return;
    welcomeGate.classList.add('is-leaving');
    document.body.classList.remove('is-welcome-open');
    window.setTimeout(() => {
      welcomeGate.hidden = true;
    }, reducedMotion ? 0 : 260);
    scheduleStoryMotion();
  }

  function getInitialLanguage() {
    const routeLanguage = document.documentElement.dataset.initialLanguage;
    if (LANGUAGE_LOCALES[routeLanguage]) return routeLanguage;
    try {
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
      if (LANGUAGE_LOCALES[savedLanguage]) return savedLanguage;
    } catch {
      // The language chooser remains available when storage is unavailable.
    }
    return '';
  }

  function initializeWelcomeGate() {
    const initialLanguage = getInitialLanguage();
    if (initialLanguage) {
      const languagePath = SEO_TEXT[initialLanguage]?.path;
      const routeLanguage = document.documentElement.dataset.initialLanguage;
      if (!routeLanguage && languagePath && window.location.pathname !== languagePath) {
        window.location.replace(languagePath);
        return;
      }
      applyLanguage(initialLanguage);
      if (welcomeGate) welcomeGate.hidden = true;
      document.body.classList.remove('is-welcome-open');
      void refreshProducts();
      scheduleStoryMotion();
      return;
    }

    if (!welcomeGate) {
      void refreshProducts();
      return;
    }

    welcomeGate.hidden = false;
    document.body.classList.add('is-welcome-open');
    setDynamicText(welcomeStatus, 'chooseLanguage');
    welcomeLoader?.classList.add('is-ready');
    languageChoices.forEach((button) => {
      button.disabled = false;
      button.addEventListener('click', () => closeWelcomeGate(button.dataset.languageChoice), {
        once: true,
      });
    });
    languageChoices[0]?.focus({ preventScroll: true });
    void refreshProducts();
  }

  languageSwitches.forEach((button) => {
    button.addEventListener('click', () => {
      const language = button.dataset.languageSwitch;
      const languagePath = SEO_TEXT[language]?.path;
      if (languagePath && window.location.pathname !== languagePath) {
        try {
          localStorage.setItem(LANGUAGE_KEY, language);
        } catch {
          // Navigation still applies when storage is unavailable.
        }
        window.location.assign(languagePath);
        return;
      }
      applyLanguage(language);
    });
  });

  function normalizeDegrees(value) {
    return ((value % 360) + 360) % 360;
  }

  function calculateSunset(date, latitude, longitude) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const day = Math.floor(
      (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) /
        86400000
    );
    const longitudeHour = longitude / 15;
    const approximateTime = day + (18 - longitudeHour) / 24;
    const meanAnomaly = 0.9856 * approximateTime - 3.289;
    const trueLongitude = normalizeDegrees(
      meanAnomaly +
        1.916 * Math.sin((meanAnomaly * Math.PI) / 180) +
        0.02 * Math.sin((2 * meanAnomaly * Math.PI) / 180) +
        282.634
    );
    let rightAscension =
      (Math.atan(0.91764 * Math.tan((trueLongitude * Math.PI) / 180)) * 180) / Math.PI;
    rightAscension = normalizeDegrees(rightAscension);
    rightAscension +=
      Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
    rightAscension /= 15;

    const sinDeclination = 0.39782 * Math.sin((trueLongitude * Math.PI) / 180);
    const cosDeclination = Math.cos(Math.asin(sinDeclination));
    const cosHour =
      (Math.cos((90.833 * Math.PI) / 180) -
        sinDeclination * Math.sin((latitude * Math.PI) / 180)) /
      (cosDeclination * Math.cos((latitude * Math.PI) / 180));
    const hourAngle =
      (Math.acos(Math.min(1, Math.max(-1, cosHour))) * 180) / Math.PI / 15;
    const localMeanTime =
      hourAngle + rightAscension - 0.06571 * approximateTime - 6.622;
    const universalTime = ((localMeanTime - longitudeHour) % 24 + 24) % 24;
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        Math.floor(universalTime),
        Math.round((universalTime % 1) * 60)
      )
    );
  }

  function formatSpilleTime(date) {
    return new Intl.DateTimeFormat('sq-AL', {
      timeZone: 'Europe/Tirane',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  function getSpilleCalendarDate(date) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Tirane',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return new Date(
      Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 12)
    );
  }

  function getNextSunset(now = new Date()) {
    const today = getSpilleCalendarDate(now);
    let sunset = calculateSunset(today, SPILLE_COORDS.latitude, SPILLE_COORDS.longitude);
    let tomorrow = false;
    if (sunset <= now) {
      today.setUTCDate(today.getUTCDate() + 1);
      sunset = calculateSunset(today, SPILLE_COORDS.latitude, SPILLE_COORDS.longitude);
      tomorrow = true;
    }
    return { sunset, tomorrow };
  }

  function updateSunset() {
    const time = document.querySelector('[data-sunset-time]');
    const countdown = document.querySelector('[data-sunset-countdown]');
    const now = new Date();
    const { sunset, tomorrow } = getNextSunset(now);
    const totalMinutes = Math.max(0, Math.round((sunset - now) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (time) time.textContent = formatSpilleTime(sunset);
    if (countdown) {
      countdown.textContent =
        `${tomorrow ? 'Perendimi neser pas' : 'Perendimi pas'} ${hours}h ${minutes}m`;
    }
    document
      .querySelectorAll('[data-ticker-sunset]')
      .forEach((item) => (item.textContent = formatSpilleTime(sunset)));
  }

  function weatherDescription(symbolCode = '') {
    if (symbolCode.includes('thunder')) return 'Stuhi ne afersi';
    if (symbolCode.includes('rain') || symbolCode.includes('sleet')) return 'Mundesi reshjesh';
    if (symbolCode.includes('fog')) return 'Mjegull ne breg';
    if (symbolCode.includes('partlycloudy')) return 'Pjeserisht me re';
    if (symbolCode.includes('cloudy')) return 'Me re';
    if (symbolCode.includes('fair')) return 'Kthjellime';
    return 'Qiell i kthjellet';
  }

  function coastalEstimate(windSpeedKmh) {
    if (windSpeedKmh < 12) return 'I qete';
    if (windSpeedKmh < 25) return 'Levizje e lehte';
    return 'Me ere';
  }

  function weatherIcon(symbolCode = '') {
    if (symbolCode.includes('thunder')) return '#weather-icon-storm';
    if (symbolCode.includes('rain') || symbolCode.includes('sleet')) {
      return '#weather-icon-rain';
    }
    if (symbolCode.includes('cloud') || symbolCode.includes('fog')) {
      return '#weather-icon-cloud';
    }
    if (symbolCode.includes('night')) return '#weather-icon-moon';
    return '#weather-icon-sun';
  }

  function renderWeather(payload, savedAt = Date.now()) {
    const details = payload?.data?.instant?.details;
    if (!details) return false;

    const temperature = Math.round(details.air_temperature);
    const windSpeed = Math.round(details.wind_speed * 3.6);
    const uv = Math.round((details.ultraviolet_index_clear_sky || 0) * 10) / 10;
    const symbol = payload?.data?.next_1_hours?.summary?.symbol_code || '';
    document
      .querySelectorAll('[data-ticker-temp]')
      .forEach((item) => (item.textContent = temperature));
    document
      .querySelectorAll('[data-ticker-uv]')
      .forEach((item) => (item.textContent = uv.toLocaleString('sq-AL')));
    document
      .querySelectorAll('[data-ticker-wind]')
      .forEach((item) => (item.textContent = windSpeed));
    document.querySelectorAll('[data-ticker-condition-use]').forEach((icon) => {
      icon.setAttribute('href', weatherIcon(symbol));
    });
    const summary = document.querySelector('[data-weather-summary]');
    if (summary) {
      summary.textContent =
        `${weatherDescription(symbol)}, ${temperature} grade. ` +
        `UV ${uv.toLocaleString('sq-AL')}, ere ${windSpeed} kilometra ne ore, ` +
        `deti ${coastalEstimate(windSpeed)}. Perditesuar ${formatSpilleTime(new Date(savedAt))}.`;
    }
    return true;
  }

  async function loadSpilleWeather() {
    if (!document.querySelector('[data-spille-dashboard]')) return;

    try {
      const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY));
      if (
        cached?.payload &&
        Date.now() - Number(cached.savedAt) < WEATHER_CACHE_TTL &&
        renderWeather(cached.payload, cached.savedAt)
      ) {
        return;
      }
    } catch {
      // Continue with a fresh request when storage is unavailable.
    }

    try {
      const query = new URLSearchParams({
        lat: SPILLE_COORDS.latitude,
        lon: SPILLE_COORDS.longitude,
      });
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/complete?${query}`
      );
      if (!response.ok) throw new Error(`Weather request failed with ${response.status}`);
      const forecast = await response.json();
      const payload = forecast?.properties?.timeseries?.[0];
      if (!renderWeather(payload)) {
        throw new Error('Weather response did not contain current data');
      }
      try {
        localStorage.setItem(
          WEATHER_CACHE_KEY,
          JSON.stringify({ payload, savedAt: Date.now() })
        );
      } catch {
        // Weather remains visible when storage is unavailable.
      }
    } catch (error) {
      console.error('Moti per Spillen nuk mund te perditesohet.', error);
      const summary = document.querySelector('[data-weather-summary]');
      if (summary) summary.textContent = 'Moti nuk u perditesua. Provo perseri pas pak.';
    }
  }

  function normalizeProduct(product, index = 0) {
    const image = String(product.image || '');
    const localCatalogImage = localProductImages[String(product.id || '')];
    return {
      id: String(product.id || `product-${index}`),
      name: String(product.name || '').slice(0, 80),
      category: menuData.categoryOverrides?.[String(product.id || '')] || String(product.category || ''),
      description: String(product.description || '').slice(0, 240),
      price:
        product.price === null || product.price === undefined
          ? ''
          : String(product.price),
      image:
        (localCatalogImage?.source === image && localCatalogImage.local) ||
        optimizedLocalImages[image] ||
        image,
      sortOrder: Number(product.sort_order ?? product.sortOrder ?? index),
      translations: {
        it: {
          name: String(product.name_it ?? product.translations?.it?.name ?? '').slice(0, 80),
          description: String(
            product.description_it ?? product.translations?.it?.description ?? ''
          ).slice(0, 240),
        },
        en: {
          name: String(product.name_en ?? product.translations?.en?.name ?? '').slice(0, 80),
          description: String(
            product.description_en ?? product.translations?.en?.description ?? ''
          ).slice(0, 240),
        },
      },
    };
  }

  function readCachedProducts() {
    try {
      const cached = JSON.parse(localStorage.getItem(MENU_CACHE_KEY));
      if (
        !cached ||
        !Array.isArray(cached.products) ||
        Date.now() - Number(cached.savedAt) > MENU_CACHE_MAX_AGE
      ) {
        return null;
      }
      return {
        products: cached.products.map(normalizeProduct),
        stale: Date.now() - Number(cached.savedAt) > MENU_CACHE_TTL,
      };
    } catch {
      return null;
    }
  }

  function cacheProducts(products) {
    try {
      localStorage.setItem(
        MENU_CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), products })
      );
    } catch {
      // The menu still works when storage is unavailable.
    }
  }

  function refreshProducts() {
    if (menuLoadPromise) return menuLoadPromise;

    menuLoadPromise = (async () => {
      const cached = readCachedProducts();
      if (cached?.products?.length) {
        catalogProducts = cached.products;
        if (menuRendered) renderProducts();
        if (menuStatus) {
          menuStatus.textContent = '';
          delete menuStatus.dataset.i18nDynamic;
        }
        if (!cached.stale) return catalogProducts;
      }

      if (!supabaseConfig.url || !supabaseConfig.publishableKey) return catalogProducts;
      setDynamicText(menuStatus, 'refreshingMenu');

      try {
        const requestProducts = async (includeTranslations = true) => {
          const fields = [
            'id',
            'name',
            'category',
            'description',
            'price',
            'image',
            'sort_order',
            'created_at',
          ];
          if (includeTranslations) {
            fields.push('name_it', 'name_en', 'description_it', 'description_en');
          }
          const query = new URLSearchParams({
            select: fields.join(','),
            order: 'sort_order.asc,created_at.asc',
          });
          return fetch(`${supabaseConfig.url}/rest/v1/products?${query.toString()}`, {
            headers: {
              apikey: supabaseConfig.publishableKey,
              Authorization: `Bearer ${supabaseConfig.publishableKey}`,
            },
          });
        };
        let response = await requestProducts(true);
        if (response.status === 400) response = await requestProducts(false);
        if (!response.ok) throw new Error(`Menu request failed with ${response.status}`);

        const products = (await response.json()).map(normalizeProduct);
        if (products.length) {
          catalogProducts = products;
          cacheProducts(products);
          if (menuRendered) renderProducts();
        }
        if (menuStatus) {
          menuStatus.textContent = '';
          delete menuStatus.dataset.i18nDynamic;
        }
      } catch (error) {
        console.error('Menuja nuk mund te perditesohet.', error);
        setDynamicText(menuStatus, cached?.products?.length ? 'cachedMenu' : 'offlineMenu');
      }
      return catalogProducts;
    })().finally(() => {
      menuLoadPromise = null;
    });

    return menuLoadPromise;
  }

  function formatPrice(price) {
    if (price === null || price === undefined || String(price).trim() === '') return '';
    return `${String(price).trim()} ALL`;
  }

  function capitalizeWords(value) {
    return String(value || '').replace(/(^|\s)(\S)/g, (match, space, letter) => {
      return `${space}${letter.toLocaleUpperCase(LANGUAGE_LOCALES[currentLanguage])}`;
    });
  }

  function renderCategories() {
    if (!categoryTabs) return;
    categoryTabs.replaceChildren();

    menuData.categories.forEach((category) => {
      const button = document.createElement('button');
      button.className = 'category-tab';
      button.type = 'button';
      button.dataset.category = category.id;
      button.textContent = capitalizeWords(categoryLabelFor(category));
      button.setAttribute('aria-controls', `menu-category-${category.id}`);
      button.classList.toggle('is-active', category.id === activeCategory);
      button.addEventListener('click', () => {
        activeCategory = category.id;
        categoryTabs
          .querySelectorAll('.category-tab')
          .forEach((tab) => tab.classList.toggle('is-active', tab === button));
        document
          .querySelector(`#menu-category-${category.id}`)
          ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
      categoryTabs.append(button);
    });
  }

  function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.src =
      'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    image.dataset.src = product.image || '/assets/optimized/ice-cream-cone.webp';
    image.alt = productNameFor(product);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 560;
    image.height = 700;
    image.addEventListener(
      'error',
      () => {
        if (!image.src.endsWith('/assets/optimized/ice-cream-cone.webp')) {
          image.src = '/assets/optimized/ice-cream-cone.webp';
        }
      },
      { once: true }
    );

    const body = document.createElement('div');
    const title = document.createElement('h4');
    const description = document.createElement('p');
    title.textContent = capitalizeWords(productNameFor(product));
    description.textContent = productDescriptionFor(product);
    body.append(title, description);

    const price = formatPrice(product.price);
    if (price) {
      const priceElement = document.createElement('strong');
      priceElement.textContent = price;
      body.append(priceElement);
    }

    card.append(image, body);
    return card;
  }

  function observeProductImages() {
    productImageObserver?.disconnect();
    const images = [...productGrid.querySelectorAll('img[data-src]')];
    const loadImage = (image) => {
      if (!image.dataset.src) return;
      image.src = image.dataset.src;
      delete image.dataset.src;
    };
    if (!('IntersectionObserver' in window)) {
      images.forEach(loadImage);
      return;
    }
    const menuPanel = panels.find((panel) => panel.dataset.panel === 'menu') || null;
    productImageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          productImageObserver?.unobserve(entry.target);
          loadImage(entry.target);
        });
      },
      { root: menuPanel, rootMargin: '500px 0px' }
    );
    images.forEach((image) => productImageObserver.observe(image));
  }

  function renderProducts() {
    if (!productGrid) return;
    menuRendered = true;
    productGrid.replaceChildren();

    menuData.categories.forEach((category) => {
      const products = catalogProducts.filter((product) => product.category === category.id);
      const section = document.createElement('section');
      section.className = 'menu-category';
      section.id = `menu-category-${category.id}`;
      section.setAttribute('aria-labelledby', `menu-category-title-${category.id}`);

      const heading = document.createElement('header');
      const title = document.createElement('h3');
      const count = document.createElement('span');
      title.id = `menu-category-title-${category.id}`;
      title.textContent = capitalizeWords(categoryLabelFor(category));
      count.textContent = products.length
        ? `${products.length} ${dynamicText('products')}`
        : dynamicText('comingSoon');
      heading.append(title, count);

      const items = document.createElement('div');
      items.className = 'product-grid';
      if (products.length) {
        products.forEach((product) => items.append(createProductCard(product)));
      } else {
        const empty = document.createElement('p');
        empty.className = 'empty-category';
        empty.textContent = dynamicText('emptyCategory');
        items.append(empty);
      }

      section.append(heading, items);
      productGrid.append(section);
    });
    observeProductImages();
  }

  function setDockActive(name) {
    dockActions.forEach((action) => {
      const selected = action.dataset.dockAction === name;
      action.classList.toggle('is-active', selected);
      action.setAttribute('aria-pressed', String(selected));
    });
  }

  function getFocusable(container) {
    return [
      ...container.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((element) => !element.hidden);
  }

  function openPanel(name, trigger) {
    const target = panels.find((panel) => panel.dataset.panel === name);
    if (!target || !panelLayer) return;

    if (activePanel === name) {
      closePanel();
      return;
    }

    window.clearTimeout(closeTimer);
    panels.forEach((panel) => {
      panel.classList.remove('is-open');
      panel.hidden = panel !== target;
    });

    previousFocus = trigger || document.activeElement;
    activePanel = name;
    panelLayer.hidden = false;
    target.hidden = false;
    target.scrollTop = 0;
    lastPanelScrollY = 0;
    document.body.classList.add('is-panel-open');
    dock?.classList.remove('is-compact');
    setDockActive(name);

    if (name === 'menu') {
      if (!menuRendered) {
        renderCategories();
        renderProducts();
      }
      void refreshProducts();
    }
    if (name === 'location' && getCookiePreference() === 'all') loadMap();

    requestAnimationFrame(() => {
      panelLayer.classList.add('is-visible');
      target.classList.add('is-open');
      if (!reducedMotion && target.animate) {
        target.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      }
      getFocusable(target)[0]?.focus();
    });
  }

  function closePanel(options = {}) {
    if (!panelLayer || !activePanel) {
      if (!options.keepActive) setDockActive('home');
      return;
    }

    const closingPanel = panels.find((panel) => panel.dataset.panel === activePanel);
    activePanel = null;
    panelLayer.classList.remove('is-visible');
    closingPanel?.classList.remove('is-open');
    document.body.classList.remove('is-panel-open');
    if (!options.keepActive) setDockActive('home');

    closeTimer = window.setTimeout(() => {
      panels.forEach((panel) => {
        panel.hidden = true;
      });
      panelLayer.hidden = true;
    }, reducedMotion ? 0 : 320);

    if (options.restoreFocus !== false && previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  }

  function handleDockAction(action) {
    const name = action.dataset.dockAction;
    if (name === 'home') {
      closePanel({ restoreFocus: false });
      document
        .querySelector('#home')
        ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      setDockActive('home');
      return;
    }
    openPanel(name, action);
  }

  dockActions.forEach((action) => {
    action.addEventListener('click', () => {
      if (!reducedMotion && action.animate) {
        action.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }],
          { duration: 240, easing: 'ease-out' }
        );
      }
      handleDockAction(action);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => closePanel());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activePanel) {
      closePanel();
      return;
    }

    if (event.key !== 'Tab' || !activePanel) return;
    const currentPanel = panels.find((panel) => panel.dataset.panel === activePanel);
    const focusable = currentPanel ? getFocusable(currentPanel) : [];
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  function updateDockForScroll(nextScrollY, isPanelScroll = false) {
    const previous = isPanelScroll ? lastPanelScrollY : lastScrollY;
    const delta = nextScrollY - previous;
    if (Math.abs(delta) > 5) {
      dock?.classList.toggle('is-compact', delta > 0 && nextScrollY > 90);
    }
    if (isPanelScroll) lastPanelScrollY = nextScrollY;
    else lastScrollY = nextScrollY;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (scrollFrame || activePanel) return;
      scrollFrame = requestAnimationFrame(() => {
        updateDockForScroll(window.scrollY);
        scrollFrame = 0;
      });
    },
    { passive: true }
  );

  panels.forEach((panel) => {
    panel.addEventListener(
      'scroll',
      () => {
        if (panel.dataset.panel === activePanel) updateDockForScroll(panel.scrollTop, true);
      },
      { passive: true }
    );
  });

  function getCookiePreference() {
    const cookie = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
    return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
  }

  function saveCookiePreference(value) {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
    hideCookieBanner();
  }

  function showCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
    requestAnimationFrame(() => cookieBanner.classList.add('is-visible'));
  }

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.classList.remove('is-visible');
    window.setTimeout(() => {
      cookieBanner.hidden = true;
    }, reducedMotion ? 0 : 240);
  }

  function loadMap() {
    if (!mapFrame || mapFrame.src) return;
    mapFrame.src = mapFrame.dataset.src;
    mapFrame.hidden = false;
    if (mapPlaceholder) mapPlaceholder.hidden = true;
  }

  document.querySelectorAll('[data-cookie-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = button.dataset.cookieChoice === 'all' ? 'all' : 'essential';
      saveCookiePreference(choice);
      if (choice === 'all' && activePanel === 'location') loadMap();
    });
  });

  document.querySelector('[data-load-map]')?.addEventListener('click', () => {
    saveCookiePreference('all');
    loadMap();
  });

  document.querySelector('[data-cookie-settings]')?.addEventListener('click', () => {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    showCookieBanner();
  });

  function createMarqueeVisibility() {
    const marquees = [...document.querySelectorAll('.footer-marquee, .weather-ticker-track')];
    if (!marquees.length || reducedMotion) return;
    if (!('IntersectionObserver' in window)) {
      marquees.forEach((marquee) => marquee.classList.add('is-running'));
      return;
    }

    marquees.forEach((marquee) => {
      const observer = new IntersectionObserver(
        ([entry]) => marquee.classList.toggle('is-running', entry.isIntersecting),
        { rootMargin: '120px 0px' }
      );
      observer.observe(marquee);
    });
  }

  function loadStoryImages() {
    if (storyImagesLoaded) return;
    storyImagesLoaded = true;
    document.querySelectorAll('[data-story-src]').forEach((image) => {
      image.src = image.dataset.storySrc;
      image.removeAttribute('data-story-src');
    });
  }

  function createStoryMotion() {
    if (reducedMotion || !story) {
      loadStoryImages();
      return;
    }
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    const wafer = document.querySelector('[data-cone-piece="wafer"]');
    const serve = document.querySelector('[data-cone-piece="serve"]');
    const shadow = document.querySelector('.cone-shadow');
    const intro = document.querySelector('[data-story-panel="intro"]');
    const milk = document.querySelector('[data-story-panel="milk"]');
    const waferFact = document.querySelector('[data-story-panel="wafer"]');
    const finale = document.querySelector('[data-story-panel="finale"]');
    const leftFlavors = [...document.querySelectorAll('[data-story-flavor="left"]')];
    const rightFlavors = [...document.querySelectorAll('[data-story-flavor="right"]')];
    const scrollCue = document.querySelector('.scroll-cue');
    const progress = document.querySelector('[data-progress-bar]');
    const compactStory = window.matchMedia('(max-width: 640px)').matches;

    gsap.set(wafer, {
      autoAlpha: 1,
      xPercent: -50,
      y: 42,
      rotation: -3,
      scale: 0.96,
      transformOrigin: '50% 0%',
    });
    gsap.set(serve, {
      autoAlpha: 0,
      xPercent: -50,
      y: -270,
      rotation: 5,
      scale: 0.92,
      transformOrigin: '50% 100%',
    });
    gsap.set(shadow, { autoAlpha: 0, scaleX: 0.4, xPercent: -50 });
    gsap.set([milk, waferFact], { autoAlpha: 0, y: 28 });
    gsap.set(finale, { autoAlpha: 0, y: 16, xPercent: -50 });
    gsap.set(leftFlavors, {
      autoAlpha: 0,
      x: compactStory ? -150 : -360,
      y: 72,
      scale: 0.78,
    });
    gsap.set(rightFlavors, {
      autoAlpha: 0,
      x: compactStory ? 150 : 360,
      y: 72,
      scale: 0.78,
    });

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'bar-martiri-cone-story',
        trigger: story,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.18,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set(progress, { scaleX: self.progress });
          if (self.progress > 0.55) loadStoryImages();
        },
      },
    });

    timeline
      .addLabel('intro', 0)
      .to(wafer, { y: 0, rotation: 0, scale: 1, duration: 1.25, ease: 'back.out(1.25)' }, 0.35)
      .to(shadow, { autoAlpha: 1, scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.7)
      .to(intro, { autoAlpha: 0, y: -36, duration: 0.7 }, 1.25)
      .to(scrollCue, { autoAlpha: 0, y: 12, duration: 0.4 }, 1.1)
      .addLabel('softServe', 2)
      .to(
        serve,
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 1.55,
          ease: 'power3.out',
        },
        2
      )
      .to(
        [wafer, serve],
        {
          y: compactStory ? -112 : 0,
          scale: compactStory ? 0.82 : 1,
          duration: 0.8,
          ease: 'power2.inOut',
        },
        3.55
      )
      .addLabel('milkFact', 4)
      .to(milk, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 4)
      .to(milk, { autoAlpha: 0, y: -22, duration: 0.5 }, 5.35)
      .addLabel('waferFact', 5.7)
      .to(waferFact, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 5.7)
      .to(waferFact, { autoAlpha: 0, y: -22, duration: 0.55 }, 7.15)
      .to(
        [wafer, serve],
        {
          scale: compactStory ? 0.68 : 0.82,
          y: compactStory ? -116 : -20,
          duration: 1.1,
          ease: 'power2.inOut',
        },
        7.25
      )
      .addLabel('flavorJoin', 8)
      .to(
        leftFlavors,
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          stagger: 0.16,
          duration: 1.15,
          ease: 'power3.out',
        },
        8
      )
      .to(
        rightFlavors,
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          stagger: 0.16,
          duration: 1.15,
          ease: 'power3.out',
        },
        8
      )
      .to(finale, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 9.05)
      .to({}, { duration: 0.9 });

    [
      ['.visit-copy > *', '.visit-section'],
      ['.visit-details > *', '.visit-section'],
      ['.closing-section > *', '.closing-section'],
    ].forEach(([targets, trigger]) => {
      gsap.from(targets, {
        autoAlpha: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger,
          start: 'top 82%',
          once: true,
        },
      });
    });

    window.addEventListener('load', () => window.ScrollTrigger?.refresh(), { once: true });
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${source}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') resolve();
        else {
          existing.addEventListener('load', resolve, { once: true });
          existing.addEventListener('error', reject, { once: true });
        }
        return;
      }
      const script = document.createElement('script');
      script.src = source;
      script.defer = true;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });
  }

  async function loadStoryMotion() {
    if (reducedMotion) {
      loadStoryImages();
      return;
    }
    try {
      await loadScript('assets/vendor/gsap.min.js');
      await loadScript('assets/vendor/ScrollTrigger.min.js');
      createStoryMotion();
    } catch {
      loadStoryImages();
    }
  }

  function runWhenNear(element, callback, rootMargin = '600px 0px') {
    if (!element || !('IntersectionObserver' in window)) {
      const run = () => callback();
      if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1800 });
      else window.setTimeout(run, 700);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        callback();
      },
      { rootMargin }
    );
    observer.observe(element);
  }

  let storyMotionScheduled = false;
  function scheduleStoryMotion() {
    if (storyMotionScheduled) return;
    storyMotionScheduled = true;
    window.setTimeout(
      () => runWhenNear(story, () => void loadStoryMotion(), '700px 0px'),
      reducedMotion ? 0 : 450
    );
  }

  setDockActive('home');
  updateSunset();
  window.setInterval(updateSunset, 60 * 1000);
  runWhenNear(document.querySelector('[data-spille-dashboard]'), loadSpilleWeather, '500px 0px');
  createMarqueeVisibility();
  initializeWelcomeGate();
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
