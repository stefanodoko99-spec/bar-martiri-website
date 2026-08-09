(function defineIndexNow() {
  'use strict';

  const KEY = '46e297fcd1eacc2d8f7f2cec82e9cfce';
  const HOST = 'www.barmartiri.com';
  const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
  const ENDPOINT = 'https://api.indexnow.org/indexnow';
  const MENU_PATHS = ['/', '/it/', '/en/'];

  async function submit(paths) {
    const urlList = (Array.isArray(paths) && paths.length ? paths : MENU_PATHS).map(
      (path) => `https://${HOST}${path}`
    );
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
      });
    } catch {
      // Best-effort only: a failed IndexNow ping never blocks the admin save flow.
    }
  }

  window.BAR_MARTIRI_INDEXNOW = Object.freeze({ submit });
})();
