import { cp, mkdir, rm } from 'node:fs/promises';

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

console.log('Prepared the Vercel static output in dist/.');
