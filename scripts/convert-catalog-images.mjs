import { access, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imageDirectory = resolve(projectRoot, 'assets/products');
const products = JSON.parse(
  await readFile(resolve(projectRoot, 'backup/products-2026-08-03.json'), 'utf8')
);
const remoteProducts = products.filter((product) => String(product.image || '').startsWith('http'));
const imageMap = {};

for (const product of remoteProducts) {
  const safeId = String(product.id).replace(/[^a-zA-Z0-9_-]/g, '-');
  const source = resolve(imageDirectory, `${safeId}.jpg`);
  const output = resolve(imageDirectory, `${safeId}.webp`);
  await access(source);
  await sharp(source)
    .rotate()
    .resize({ width: 640, height: 700, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 6, smartSubsample: true })
    .toFile(output);
  imageMap[String(product.id)] = {
    source: String(product.image),
    local: `/assets/products/${safeId}.webp`,
  };
}

const sortedMap = Object.fromEntries(
  Object.entries(imageMap).sort(([left], [right]) => left.localeCompare(right))
);
await writeFile(
  resolve(projectRoot, 'product-image-map.js'),
  `(function defineLocalProductImages(){window.BAR_MARTIRI_LOCAL_PRODUCT_IMAGES=Object.freeze(${JSON.stringify(sortedMap, null, 2)});})();\n`
);

console.log(`Converted ${remoteProducts.length} catalog images to responsive WebP files.`);
