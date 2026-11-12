import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeName, ruleName} from '../public/core.js';
import {createLegalityIndex} from '../public/rules.js';
import {selectCatalogCards, libraryWidthBounds, clampLibraryWidth, readCatalogPreferences} from '../public/catalog.js';

const cards = JSON.parse(readFileSync(new URL('../public/data/cards.json', import.meta.url)));
for (const c of cards) c.search = normalizeName([c.name, c.set, c.text].join(' '));
const index = createLegalityIndex(cards);

test('Catalog follows deck format, includes permitted reprints and excludes bans and unknowns', () => {
  const standard = selectCatalogCards(cards, {format: 'standard'}, index);
  const expanded = selectCatalogCards(cards, {format: 'expanded'}, index);
  const standardIds = new Set(standard.map(c => c.id)), expandedIds = new Set(expanded.map(c => c.id));
  assert(standard.length > 0 && expanded.length > standard.length);
  for (const card of cards) {
    assert.equal(standardIds.has(card.id), index.standard.get(card.id).status === 'legal', card.id);
    assert.equal(expandedIds.has(card.id), index.expanded.get(card.id).status === 'legal', card.id);
  }
  const oldBall = cards.find(c => c.name === '하이퍼볼' && c.series === 'BW');
  assert(standardIds.has(oldBall.id), 'Explicitly permitted old reprints must remain visible');
  const oldPokemon = cards.find(c => c.name === '리오르' && c.mark === 'G');
  assert(!standardIds.has(oldPokemon.id));
  assert(expandedIds.has(oldPokemon.id));
  assert(!expanded.some(c => c.name === '회수네트' || c.name.includes('V-UNION')));
});

test('Turning format scope off restores all printings, and other filters still compose', () => {
  assert.equal(selectCatalogCards(cards, {formatOnly: false}).length, cards.length);
  const allRiolu = selectCatalogCards(cards, {formatOnly: false, query: '리오르', category: 'pokemon'}, index);
  const standardRiolu = selectCatalogCards(cards, {query: '리오르', category: 'pokemon'}, index);
  assert(standardRiolu.length > 0 && allRiolu.length > standardRiolu.length);
  const result = selectCatalogCards(cards, {category: 'trainer', uniqueOnly: true, order: 'name', format: 'expanded'}, index);
  assert(result.every(c => c.group === 'trainer' && index.expanded.get(c.id).status === 'legal'));
  assert.equal(new Set(result.map(c => ruleName(c.name))).size, result.length);
  assert.deepEqual(result.map(c => c.name), result.map(c => c.name).sort((a, b) => a.localeCompare(b, 'ko')));
});

test('Catalog width stays bounded without taking away the minimum deck space', () => {
  for (const [viewport, rail] of [[721, 0], [1000, 0], [1363, 60], [1920, 60]]) {
    const bounds = libraryWidthBounds(viewport, rail);
    for (const width of [-100, 440, 9000, NaN]) {
      const actual = clampLibraryWidth(width, bounds);
      assert(actual >= bounds.min && actual <= bounds.max);
      assert(viewport - rail - 12 - actual >= 360);
    }
  }
  assert.equal(readCatalogPreferences().formatOnly, true, 'A fresh catalog defaults to the selected deck format');
});
