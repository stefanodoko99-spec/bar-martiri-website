import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execute = promisify(execFile);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(projectRoot, 'assets/products');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'bar-martiri-images-'));
const products = JSON.parse(
  await readFile(resolve(projectRoot, 'backup/products-2026-08-03.json'), 'utf8')
);
const remoteProducts = products.filter((product) => String(product.image || '').startsWith('http'));

await mkdir(outputDirectory, { recursive: true });

let completed = 0;
let failed = 0;
const queue = [...remoteProducts];
const optimizedImages = new Map();

async function optimizeNext() {
  while (queue.length) {
    const product = queue.shift();
    const safeId = String(product.id).replace(/[^a-zA-Z0-9_-]/g, '-');
    const source = resolve(temporaryDirectory, `${safeId}.source`);
    const output = resolve(outputDirectory, `${safeId}.jpg`);
    try {
      const response = await fetch(product.image);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await writeFile(source, Buffer.from(await response.arrayBuffer()));
      await execute('/usr/bin/sips', [
        '-Z',
        '800',
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        '72',
        source,
        '--out',
        output,
      ]);
      optimizedImages.set(String(product.id), {
        source: String(product.image),
        local: `/assets/products/${safeId}.jpg`,
      });
      completed += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed ${product.id}: ${error.message}`);
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => optimizeNext()));
await rm(temporaryDirectory, { recursive: true, force: true });

const imageMap = Object.fromEntries(
  [...optimizedImages.entries()].sort(([left], [right]) => left.localeCompare(right))
);
await writeFile(
  resolve(projectRoot, 'product-image-map.js'),
  `(function defineLocalProductImages(){window.BAR_MARTIRI_LOCAL_PRODUCT_IMAGES=Object.freeze(${JSON.stringify(imageMap, null, 2)});})();\n`
);

console.log(`Optimized ${completed} images; ${failed} failed.`);
if (failed) process.exitCode = 1;
