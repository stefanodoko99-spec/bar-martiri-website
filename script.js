(function startBarMartiri() {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuData = window.BAR_MARTIRI_MENU || { categories: [], products: [] };
  const supabaseConfig = window.BAR_MARTIRI_SUPABASE || {};
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
  const mapFrame = document.querySelector('[data-map-shell] iframe');
  const mapPlaceholder = document.querySelector('[data-map-placeholder]');
  const MENU_CACHE_KEY = 'barMartiri.publicMenu.v2';
  const MENU_CACHE_TTL = 5 * 60 * 1000;
  const WEATHER_CACHE_KEY = 'barMartiri.spilleWeather.v1';
  const WEATHER_CACHE_TTL = 60 * 60 * 1000;
  const REVIEW_CACHE_KEY = 'barMartiri.googleReviews.v1';
  const REVIEW_CACHE_TTL = 6 * 60 * 60 * 1000;
  const SPILLE_COORDS = { latitude: 41.0966, longitude: 19.4583 };
  const COOKIE_NAME = 'bar_martiri_cookie_pref';

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
  let menuRefreshStarted = false;
  let catalogProducts = menuData.products.map(normalizeProduct);
  let storyImagesLoaded = false;
  let lastScrollY = window.scrollY;
  let lastPanelScrollY = 0;
  let scrollFrame = 0;

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

  function renderReviewStats(stats) {
    const rating = Number(stats?.rating);
    const count = Number(stats?.userRatingCount);
    if (!Number.isFinite(rating) || !Number.isInteger(count) || count < 1) return false;

    const ratingElement = document.querySelector('[data-review-rating]');
    const countElement = document.querySelector('[data-review-count]');
    if (ratingElement) ratingElement.textContent = rating.toFixed(1);
    if (countElement) countElement.textContent = count.toLocaleString('sq-AL');

    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData) {
      try {
        const data = JSON.parse(structuredData.textContent);
        const business = data?.['@graph']?.find((entry) => entry?.['@id']?.endsWith('#business'));
        if (business) {
          business.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: rating.toFixed(1),
            reviewCount: String(count),
          };
          structuredData.textContent = JSON.stringify(data);
        }
      } catch {
        // The visible review total remains available if structured data cannot be updated.
      }
    }
    return true;
  }

  async function loadGoogleReviewStats() {
    if (!document.querySelector('[data-review-count]')) return;

    try {
      const cached = JSON.parse(localStorage.getItem(REVIEW_CACHE_KEY));
      if (
        cached?.stats &&
        Date.now() - Number(cached.savedAt) < REVIEW_CACHE_TTL &&
        renderReviewStats(cached.stats)
      ) {
        return;
      }
    } catch {
      // Continue with the static verified total when storage is unavailable.
    }

    try {
      const response = await fetch('/.netlify/functions/google-reviews');
      if (!response.ok) return;
      const stats = await response.json();
      if (!renderReviewStats(stats)) return;
      try {
        localStorage.setItem(
          REVIEW_CACHE_KEY,
          JSON.stringify({ stats, savedAt: Date.now() })
        );
      } catch {
        // The live values remain visible when storage is unavailable.
      }
    } catch {
      // The static review count is the production fallback.
    }
  }

  function normalizeProduct(product, index = 0) {
    const image = String(product.image || '');
    return {
      id: String(product.id || `product-${index}`),
      name: String(product.name || '').slice(0, 80),
      category: String(product.category || ''),
      description: String(product.description || '').slice(0, 240),
      price:
        product.price === null || product.price === undefined
          ? ''
          : String(product.price),
      image: optimizedLocalImages[image] || image,
      sortOrder: Number(product.sort_order ?? product.sortOrder ?? index),
    };
  }

  function readCachedProducts() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(MENU_CACHE_KEY));
      if (
        !cached ||
        !Array.isArray(cached.products) ||
        Date.now() - Number(cached.savedAt) > MENU_CACHE_TTL
      ) {
        return null;
      }
      return cached.products.map(normalizeProduct);
    } catch {
      return null;
    }
  }

  function cacheProducts(products) {
    try {
      sessionStorage.setItem(
        MENU_CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), products })
      );
    } catch {
      // The menu still works when storage is unavailable.
    }
  }

  async function refreshProducts() {
    if (menuRefreshStarted) return;
    menuRefreshStarted = true;

    const cachedProducts = readCachedProducts();
    if (cachedProducts?.length) {
      catalogProducts = cachedProducts;
      renderProducts();
      if (menuStatus) menuStatus.textContent = '';
      return;
    }

    if (!supabaseConfig.url || !supabaseConfig.publishableKey) return;
    if (menuStatus) menuStatus.textContent = 'Po perditesojme menune...';

    try {
      const query = new URLSearchParams({
        select: 'id,name,category,description,price,image,sort_order,created_at',
        order: 'sort_order.asc,created_at.asc',
      });
      const response = await fetch(
        `${supabaseConfig.url}/rest/v1/products?${query.toString()}`,
        {
          headers: {
            apikey: supabaseConfig.publishableKey,
            Authorization: `Bearer ${supabaseConfig.publishableKey}`,
          },
        }
      );
      if (!response.ok) throw new Error(`Menu request failed with ${response.status}`);

      const products = (await response.json()).map(normalizeProduct);
      if (products.length) {
        catalogProducts = products;
        cacheProducts(products);
        renderProducts();
      }
      if (menuStatus) menuStatus.textContent = '';
    } catch (error) {
      console.error('Menuja nuk mund te perditesohet.', error);
      if (menuStatus) {
        menuStatus.textContent =
          'Po shfaqet menuja e ruajtur. Provo perseri pas pak per perditesimet.';
      }
    }
  }

  function formatPrice(price) {
    if (price === null || price === undefined || String(price).trim() === '') return '';
    return `${String(price).trim()} ALL`;
  }

  function capitalizeWords(value) {
    return String(value || '').replace(/(^|\s)(\S)/g, (match, space, letter) => {
      return `${space}${letter.toLocaleUpperCase('sq-AL')}`;
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
      button.textContent = capitalizeWords(category.label);
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
    image.src = product.image || 'assets/optimized/ice-cream-cone.webp';
    image.alt = product.name || 'Produkt i Bar Martiri';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 560;
    image.height = 700;

    const body = document.createElement('div');
    const title = document.createElement('h4');
    const description = document.createElement('p');
    title.textContent = capitalizeWords(product.name || 'Pa emer');
    description.textContent = product.description || '';
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
      title.textContent = capitalizeWords(category.label);
      count.textContent = products.length ? `${products.length} produkte` : 'Se shpejti';
      heading.append(title, count);

      const items = document.createElement('div');
      items.className = 'product-grid';
      if (products.length) {
        products.forEach((product) => items.append(createProductCard(product)));
      } else {
        const empty = document.createElement('p');
        empty.className = 'empty-category';
        empty.textContent = 'Produktet e kesaj kategorie do te shtohen se shpejti.';
        items.append(empty);
      }

      section.append(heading, items);
      productGrid.append(section);
    });
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
    if (reducedMotion || !story || !window.gsap || !window.ScrollTrigger) {
      loadStoryImages();
      return;
    }
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

  setDockActive('home');
  updateSunset();
  window.setInterval(updateSunset, 60 * 1000);
  loadSpilleWeather();
  loadGoogleReviewStats();
  createStoryMotion();
  createMarqueeVisibility();
  if (!getCookiePreference()) {
    window.setTimeout(showCookieBanner, 650);
  }
  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
