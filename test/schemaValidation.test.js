import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normaliseArray,
  normaliseContentItem,
  normaliseId,
  normaliseName
} from '../src/domain/schema/contentSchemas.js';
import { createRunState } from '../src/domain/schema/runStateSchema.js';
import { createSettlement } from '../src/domain/schema/settlementSchema.js';
import { createSurvivor } from '../src/domain/schema/survivorSchema.js';

test('createSurvivor handles empty input', () => {
  const survivor = createSurvivor();
  assert.ok(survivor.id);
  assert.equal(survivor.name, 'Nameless Survivor');
  assert.ok(Array.isArray(survivor.traits));
});

test('createSettlement handles empty input', () => {
  const settlement = createSettlement();
  assert.ok(settlement.id);
  assert.equal(settlement.name, 'Unnamed Settlement');
  assert.ok(Array.isArray(settlement.survivors));
});

test('createRunState handles empty input', () => {
  const runState = createRunState();
  assert.ok(runState.id);
  assert.equal(runState.phase, 'settlement');
  assert.ok(runState.settlement.id);
});

test('null IDs become safe fallback IDs', () => {
  assert.match(normaliseId(null, 'thing'), /^thing-/);
  assert.notEqual(normaliseContentItem({ id: null }, 'gear').id, null);
});

test('null names become safe fallback names', () => {
  assert.equal(normaliseName(null, 'Fallback Name'), 'Fallback Name');
  assert.equal(createSurvivor({ name: null }).name, 'Nameless Survivor');
});

test('arrays filter nulls', () => {
  assert.deepEqual(normaliseArray([null, 'bone', undefined, 'hide']), ['bone', 'hide']);
  assert.equal(createSettlement({ survivors: [null, { name: 'Ari' }] }).survivors.length, 1);
});
