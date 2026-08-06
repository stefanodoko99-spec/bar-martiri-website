import { access, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requiredFiles = [
  'index.html',
  'it/index.html',
  'en/index.html',
  'admin.html',
  'styles.css',
  'admin.css',
  'script.js',
  'product-image-map.js',
  'admin.js',
  'supabase-store.js',
  'netlify.toml',
  'supabase/setup.sql',
];

await Promise.all(requiredFiles.map((file) => access(resolve(projectRoot, file))));

const publicHtml = await readFile(resolve(projectRoot, 'index.html'), 'utf8');
const publicScript = await readFile(resolve(projectRoot, 'script.js'), 'utf8');
const menuData = await readFile(resolve(projectRoot, 'menu-data.js'), 'utf8');
const adminHtml = await readFile(resolve(projectRoot, 'admin.html'), 'utf8');
const adminScript = await readFile(resolve(projectRoot, 'admin.js'), 'utf8');
const italianHtml = await readFile(resolve(projectRoot, 'it/index.html'), 'utf8');
const englishHtml = await readFile(resolve(projectRoot, 'en/index.html'), 'utf8');
const productImageMap = await readFile(resolve(projectRoot, 'product-image-map.js'), 'utf8');
const backupProducts = JSON.parse(
  await readFile(resolve(projectRoot, 'backup/products-2026-08-03.json'), 'utf8')
);

const assertions = [
  [!publicHtml.includes('data-language-choice="sq" disabled'), 'Language choices must be immediately enabled'],
  [!publicScript.includes('/.netlify/functions/google-reviews'), 'Broken reviews endpoint must not be requested'],
  [!adminHtml.includes('crypto-js.min.js'), 'Production admin must not load local password fallback'],
  [!adminScript.includes('FIXED_AUTH'), 'Production admin must fail closed without Supabase'],
  [publicHtml.includes('hreflang="it-IT"') && publicHtml.includes('hreflang="en-GB"'), 'Localized hreflang links are required'],
  [
    !['Kalo te permbajtja', 'Cdo dite', 'cokollate', 'Privatesia'].some((text) =>
      publicHtml.includes(text)
    ),
    'Visible Albanian source text must use standard diacritics',
  ],
  [
    ['Çokollatë', 'Ujë Natyral', 'Joalkoolik', 'Jägermeister', 'Disaronno'].every((text) =>
      menuData.includes(text)
    ),
    'Corrected Albanian product names must remain in the menu overrides',
  ],
  [
    italianHtml.includes('rel="canonical" href="https://bar-martiri.vercel.app/it/"') &&
      englishHtml.includes('rel="canonical" href="https://bar-martiri.vercel.app/en/"'),
    'Localized canonical links must use the Vercel production domain',
  ],
];

for (const [passed, message] of assertions) {
  if (!passed) throw new Error(message);
}

for (const pageName of ['index.html', 'admin.html']) {
  const html = await readFile(resolve(projectRoot, pageName), 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) throw new Error(`${pageName} has duplicate IDs: ${[...new Set(duplicates)].join(', ')}`);
}

const optimizedDirectory = resolve(projectRoot, 'assets/products');
const optimizedFiles = (await readdir(optimizedDirectory)).filter((file) => file.endsWith('.jpg'));
const remoteProducts = backupProducts.filter((product) => String(product.image || '').startsWith('http'));
if (optimizedFiles.length !== remoteProducts.length) {
  throw new Error(`Expected ${remoteProducts.length} optimized catalog images, found ${optimizedFiles.length}`);
}
for (const product of remoteProducts) {
  if (!productImageMap.includes(`"${product.id}"`)) {
    throw new Error(`Missing optimized image mapping for ${product.id}`);
  }
}
const oversizedImages = [];
for (const file of optimizedFiles) {
  const details = await stat(resolve(optimizedDirectory, file));
  if (details.size > 150 * 1024) oversizedImages.push(file);
}
if (oversizedImages.length) {
  throw new Error(`Optimized images over 150 KB: ${oversizedImages.join(', ')}`);
}

console.log('Static verification passed.');
