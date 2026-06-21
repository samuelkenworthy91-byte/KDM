import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getContentSummary,
  getDuplicateContentIds,
  getEvents,
  getGearCards,
  getMissingImageReferences,
  getQuarries,
  getResources
} from '../src/domain/content/contentIndex.js';

const getters = [
  getGearCards,
  getQuarries,
  getResources,
  getEvents,
  getMissingImageReferences,
  getDuplicateContentIds
];

test('getContentSummary returns an object', () => {
  const summary = getContentSummary();
  assert.equal(typeof summary, 'object');
  assert.ok(summary);
});

test('all exported content getters return arrays', () => {
  getters.forEach(getter => {
    assert.ok(Array.isArray(getter()), getter.name);
  });
});

test('duplicate ID detector returns an array', () => {
  assert.ok(Array.isArray(getDuplicateContentIds()));
});

test('missing image detector returns an array', () => {
  assert.ok(Array.isArray(getMissingImageReferences()));
});

test('normalised gear and cards have safe fallback names', () => {
  getGearCards().forEach((item, index) => {
    assert.equal(typeof item.name, 'string', `gear/card ${index}`);
    assert.notEqual(item.name.trim(), '');
  });
});

test('no getter throws', () => {
  getters.forEach(getter => assert.doesNotThrow(() => getter(), getter.name));
});
