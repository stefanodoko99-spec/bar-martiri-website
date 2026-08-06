import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(projectRoot, 'index.html'), 'utf8');

const locales = {
  it: {
    htmlLanguage: 'it-IT',
    ogLocale: 'it_IT',
    path: '/it/',
    title: 'Bar Martiri Spille | Lettini vicino al mare',
    description:
      'Bar Martiri a Spille, Albania: lettini, parcheggio gratuito, gelato, caffè e bibite vicino al mare.',
    socialDescription:
      'Lettini, parcheggio gratuito, gelato, caffè e bibite vicino al mare a Spille, Albania.',
  },
  en: {
    htmlLanguage: 'en-GB',
    ogLocale: 'en_GB',
    path: '/en/',
    title: 'Bar Martiri Spille | Sunbeds by the Sea',
    description:
      'Bar Martiri in Spille, Albania: sunbeds, free parking, ice cream, coffee and cold drinks by the sea.',
    socialDescription:
      'Sunbeds, free parking, ice cream, coffee and cold drinks by the sea in Spille, Albania.',
  },
};

for (const [language, locale] of Object.entries(locales)) {
  const canonical = `https://bar-martiri.vercel.app${locale.path}`;
  let page = source
    .replace('<html lang="sq-AL">', `<html lang="${locale.htmlLanguage}" data-initial-language="${language}">`)
    .replace('<head>', '<head>\n    <base href="/">')
    .replaceAll('href="#', `href="${locale.path}#`)
    .replace(
      'content="Bar Martiri në Spille, Shqipëri: shezlongje, parkim falas, akullore, kafe dhe pije pranë detit për pushimet tuaja verore."',
      `content="${locale.description}"`
    )
    .replace(
      '<link rel="canonical" href="https://bar-martiri.vercel.app/">',
      `<link rel="canonical" href="${canonical}">`
    )
    .replace('content="sq_AL"', `content="${locale.ogLocale}"`)
    .replaceAll('content="Bar Martiri Spille | Shezlongje pranë Detit"', `content="${locale.title}"`)
    .replaceAll(
      'content="Shezlongje, parkim falas, akullore, kafe dhe pije pranë detit në Spille, Shqipëri."',
      `content="${locale.socialDescription}"`
    )
    .replace(
      'content="Shezlongje, parkim falas, akullore, kafe dhe pije pranë detit në Spille."',
      `content="${locale.socialDescription}"`
    )
    .replace('content="https://bar-martiri.vercel.app/"', `content="${canonical}"`)
    .replace('<title>Bar Martiri Spille | Shezlongje pranë Detit</title>', `<title>${locale.title}</title>`)
    .replaceAll('"inLanguage": "sq-AL"', `"inLanguage": "${locale.htmlLanguage}"`);

  await writeFile(resolve(projectRoot, language, 'index.html'), page);
}

console.log('Generated localized pages: /it/ and /en/');
