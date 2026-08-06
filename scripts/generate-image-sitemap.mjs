import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const products = JSON.parse(
  await readFile(resolve(projectRoot, 'backup/products-2026-08-03.json'), 'utf8')
);
const productIds = products
  .filter((product) => String(product.image || '').startsWith('http'))
  .map((product) => String(product.id).replace(/[^a-zA-Z0-9_-]/g, '-'));

await Promise.all(
  productIds.map((id) => access(resolve(projectRoot, `assets/products/${id}.webp`)))
);

const imageLocations = [
  'assets/optimized/bar-martiri-spille-social.jpg',
  'assets/optimized/ice-cream-cone.webp',
  ...productIds.map((id) => `assets/products/${id}.webp`),
];
const images = imageLocations
  .map(
    (path) =>
      `    <image:image><image:loc>https://bar-martiri.vercel.app/${path}</image:loc></image:image>`
  )
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://bar-martiri.vercel.app/</loc>
${images}
  </url>
</urlset>
`;

await writeFile(resolve(projectRoot, 'image-sitemap.xml'), sitemap);
console.log(`Generated image sitemap with ${imageLocations.length} images.`);
