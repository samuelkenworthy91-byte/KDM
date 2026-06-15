import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createBornSurvivorName,
  getSurvivorDisplayName,
  normalizeSurvivorIdentity
} from '../src/game/survivorIdentity.js';
import { createSurvivor, normalizeSettlement } from '../src/game/saveLogic.js';

test('new founders keep one name', () => {
  const founder = createSurvivor('Mara', 'female');

  assert.equal(founder.generationType, 'founder');
  assert.equal(founder.givenName, 'Mara');
  assert.equal(founder.familyName, null);
  assert.equal(getSurvivorDisplayName(founder), 'Mara');
});

test('two founders establish one deterministic family line for their children', () => {
  const parentA = { id: 'founder-a', name: 'Aster', generationType: 'founder' };
  const parentB = { id: 'founder-b', name: 'Brin', generationType: 'founder' };
  const first = createBornSurvivorName(parentA, parentB, { random: () => 0 });
  const second = createBornSurvivorName(parentA, parentB, { random: () => 0.5 });

  assert.ok(first.familyName);
  assert.equal(second.familyName, first.familyName);
  assert.match(first.displayName, new RegExp(` ${first.familyName}$`));
});

test('children inherit the birthing primary parent family name', () => {
  const parentA = { id: 'a', name: 'Aster Ashward', familyName: 'Ashward', generationType: 'born' };
  const parentB = { id: 'b', name: 'Brin Cinderwake', familyName: 'Cinderwake', generationType: 'born' };
  const child = createBornSurvivorName(parentA, parentB, {
    primaryParent: parentB,
    random: () => 0
  });

  assert.equal(child.familyName, 'Cinderwake');
  assert.deepEqual(child.parentIds, ['a', 'b']);
});

test('born survivor records store the derived display name and parent metadata', () => {
  const parentA = { id: 'a', name: 'Aster', generationType: 'founder' };
  const parentB = { id: 'b', name: 'Brin', generationType: 'founder' };
  const identity = createBornSurvivorName(parentA, parentB, { random: () => 0 });
  const child = createSurvivor(identity.displayName, 'female', identity);

  assert.equal(child.generationType, 'born');
  assert.equal(child.name, `${child.givenName} ${child.familyName}`);
  assert.deepEqual(child.parentIds, ['a', 'b']);
});

test('legacy saves preserve their existing survivor name', () => {
  const legacy = normalizeSurvivorIdentity({ id: 'old', name: 'Old Light' });
  const settlement = normalizeSettlement({
    settlementName: 'Legacy Test',
    survivors: [{ id: 'old', name: 'Old Light', hp: 12, maxHp: 30 }]
  });

  assert.equal(legacy.generationType, 'legacy');
  assert.equal(getSurvivorDisplayName(legacy), 'Old Light');
  assert.equal(settlement.survivors[0].name, 'Old Light');
  assert.equal(settlement.survivors[0].generationType, 'legacy');
});

test('missing identity fields render safely', () => {
  assert.equal(getSurvivorDisplayName({}), 'Unknown / Legacy');
});
