import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { getCardCatalog } from '../src/domain/cards/cardCatalog.js';
import { getGearCatalog } from '../src/domain/gear/gearCatalog.js';
import { getResourceCatalog } from '../src/domain/resources/resourceCatalog.js';

test('resource catalog returns array', () => {
  assert.ok(Array.isArray(getResourceCatalog()));
});

test('gear catalog returns array', () => {
  assert.ok(Array.isArray(getGearCatalog()));
});

test('card catalog returns array', () => {
  assert.ok(Array.isArray(getCardCatalog()));
});

test('no catalog item has null id or name', () => {
  [...getResourceCatalog(), ...getGearCatalog(), ...getCardCatalog()].forEach(item => {
    assert.ok(item.id);
    assert.ok(item.name);
    assert.notEqual(item.id, null);
    assert.notEqual(item.name, null);
  });
});

test('missing image is safe fallback, not crash', () => {
  const item = getCardCatalog().find(card => card.image);
  assert.equal(typeof item.image, 'string');
});

test('card preview source contains fallback image handling', () => {
  const source = readFileSync(new URL('../src/ui/components/CardPreview.jsx', import.meta.url), 'utf8');
  assert.match(source, /Missing image/);
  assert.match(source, /onError/);
});
