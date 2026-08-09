import { readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IMAGE_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];
const EXCLUDED_FILES = new Set(['favicon-48.png', 'favicon-96.png', 'apple-touch-icon.png']);

const productIds = (await readdir(resolve(projectRoot, 'assets/products')))
  .filter((file) => file.endsWith('.webp'))
  .map((file) => file.replace(/\.webp$/, ''))
  .sort();
if (!productIds.length) throw new Error('No optimized catalog images were found.');

const optimizedFiles = (await readdir(resolve(projectRoot, 'assets/optimized')))
  .filter((file) => IMAGE_EXTENSIONS.some((ext) => file.endsWith(ext)) && !EXCLUDED_FILES.has(file))
  .sort();
if (!optimizedFiles.length) throw new Error('No optimized site images were found.');

const imageLocations = [
  ...optimizedFiles.map((file) => `assets/optimized/${file}`),
  ...productIds.map((id) => `assets/products/${id}.webp`),
];
const images = imageLocations
  .map(
    (path) =>
      `    <image:image><image:loc>https://www.barmartiri.com/${path}</image:loc></image:image>`
  )
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.barmartiri.com/</loc>
${images}
  </url>
</urlset>
`;

await writeFile(resolve(projectRoot, 'image-sitemap.xml'), sitemap);
console.log(`Generated image sitemap with ${imageLocations.length} images.`);
