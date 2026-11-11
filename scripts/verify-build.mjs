import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const root = path.resolve('dist');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const app = await readFile(path.join(root, 'app.js'), 'utf8');
const cards = JSON.parse(await readFile(path.join(root, 'data/cards.json'), 'utf8'));
const compressed = JSON.parse(gunzipSync(await readFile(path.join(root, 'data/cards.json.gz'))));
assert.deepEqual(compressed, cards, 'Compressed and uncompressed card databases differ');
const resources = new Set(['index.html', 'app.js', 'core.js', 'rules.js', 'recipe.js', 'theme-init.js', 'tutorial.js', 'tutorial.css', 'portal-theme.css', 'templates/recipe-template-2026.xlsx', 'templates/recipe-template-2026.json', 'styles.css', 'pokemon-theme.css', 'favicon.svg', 'art/pikachu.png', 'data/cards.json', 'data/cards.json.gz', 'data/meta.json', 'data/example.json', 'data-license.txt', 'downloads/PTCG_Canvas.zip']);
for (const [,ref] of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  if (/^(?:https?:|data:|#)/.test(ref)) continue;
  assert(!ref.startsWith('/'), `Root-relative URL breaks project Pages: ${ref}`);
  resources.add(ref.split(/[?#]/)[0]);
}
for (const [,ref] of app.matchAll(/(?:from\s*|fetch\()\s*['"](\.\/[^'"]+)['"]/g)) resources.add(ref);
for (const card of cards) if (card.localImage) resources.add(card.localImage);
for (const resource of resources) {
  const target = path.resolve(root, resource);
  assert(target.startsWith(root + path.sep), `Asset outside deployment: ${resource}`);
  assert((await stat(target)).isFile(), `Missing deployment asset: ${resource}`);
}
const zip = await readFile(path.join(root, 'downloads/PTCG_Canvas.zip'));
assert.equal(zip.subarray(0,4).toString('hex'), '504b0304', 'Source ZIP is invalid');
console.log(`Verified ${resources.size} deployment resources, ${cards.length.toLocaleString()} cards, gzip fallback, source ZIP and relative asset paths.`);
