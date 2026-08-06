import { readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const productIds = (await readdir(resolve(projectRoot, 'assets/products')))
  .filter((file) => file.endsWith('.webp'))
  .map((file) => file.replace(/\.webp$/, ''))
  .sort();
if (!productIds.length) throw new Error('No optimized catalog images were found.');

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
