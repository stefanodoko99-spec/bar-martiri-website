import { readFile, writeFile } from 'node:fs/promises';
import * as esbuild from 'esbuild';

const distRoot = new URL('../dist/', import.meta.url);

const targets = [
  { path: 'styles.css', loader: 'css' },
  { path: 'script.js', loader: 'js' },
];

for (const { path, loader } of targets) {
  const fileUrl = new URL(path, distRoot);
  const source = await readFile(fileUrl, 'utf8');
  const { code } = await esbuild.transform(source, { loader, minify: true });
  await writeFile(fileUrl, code);
  console.log(`Minified ${path}: ${source.length} -> ${code.length} bytes`);
}
