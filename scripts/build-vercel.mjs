import { cp, mkdir, readdir, rm } from 'node:fs/promises';

const outputDirectory = new URL('../dist/', import.meta.url);
const projectRoot = new URL('../', import.meta.url);

const publicFiles = [
  'index.html',
  'admin.html',
  'styles.css',
  'admin.css',
  'script.js',
  'admin.js',
  'menu-data.js',
  'product-image-map.js',
  'supabase-config.js',
  'supabase-store.js',
  'robots.txt',
  'sitemap.xml',
  'image-sitemap.xml',
  'privacy.html',
];

const publicDirectories = ['assets', 'en', 'it'];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  ...publicFiles.map((path) =>
    cp(new URL(path, projectRoot), new URL(path, outputDirectory))
  ),
  ...publicDirectories.map((path) =>
    cp(new URL(`${path}/`, projectRoot), new URL(`${path}/`, outputDirectory), {
      recursive: true,
    })
  ),
]);

const productDirectory = new URL('assets/products/', outputDirectory);
const productFiles = await readdir(productDirectory);
const webpNames = new Set(productFiles.filter((file) => file.endsWith('.webp')).map((file) => file.replace(/\.webp$/, '')));
await Promise.all(
  productFiles
    .filter((file) => file.endsWith('.jpg') && webpNames.has(file.replace(/\.jpg$/, '')))
    .map((file) => rm(new URL(file, productDirectory)))
);

console.log('Prepared the Vercel static output in dist/.');
