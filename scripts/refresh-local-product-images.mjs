// One-off: re-download product images from Supabase Storage into the local
// assets/products/ cache, so the pre-baked local copies (served in place of
// live Supabase URLs, see normalizeProduct() in script.js) match what's
// actually in storage after a bulk re-upload.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = resolve(projectRoot, 'product-image-map.js');
const mapSource = await readFile(mapPath, 'utf8');
const mapMatch = mapSource.match(/window\.BAR_MARTIRI_LOCAL_PRODUCT_IMAGES\s*=\s*Object\.freeze\((\{[\s\S]*\})\);/);
if (!mapMatch) throw new Error('Could not parse product-image-map.js');
const imageMap = Function(`"use strict"; return (${mapMatch[1]});`)();

const entries = Object.entries(imageMap);
let updated = 0;
let failed = 0;

for (const [productId, { source, local }] of entries) {
  try {
    const response = await fetch(`${source}?refresh=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(resolve(projectRoot, local.replace(/^\//, '')), buffer);
    updated += 1;
  } catch (error) {
    failed += 1;
    console.error(`Failed ${productId}: ${error.message}`);
  }
}

console.log(`Refreshed ${updated} local product images; ${failed} failed.`);
