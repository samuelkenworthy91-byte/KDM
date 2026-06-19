import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultInnovationCost
} from '../src/data/innovationCards.js';
import {
  getInnovationDefinition,
  normalizeInnovationDeckState,
  normalizeInnovationDefinition
} from '../src/game/innovationModel.js';

test('normalizes existing innovation fields without changing their mechanics', () => {
  const source = {
    id: 'weaponDrills',
    name: 'Weapon Drills',
    category: 'training',
    costMemory: 4,
    effect: 'Add one training card.',
    actionUnlocks: ['weaponDrills'],
    mechanicalEffects: { trainingOptionsBonus: 1 }
  };
  const normalized = normalizeInnovationDefinition(source.id, source);

  assert.equal(normalized.name, source.name);
  assert.deepEqual(normalized.innovationCost, defaultInnovationCost);
  assert.equal(normalized.memoryCost, 1);
  assert.equal(normalized.settlementBoostSummary, source.effect);
  assert.deepEqual(normalized.unlocks, ['weaponDrills']);
  assert.deepEqual(normalized.mechanicalEffects, source.mechanicalEffects);
});

test('unknown saved innovation ids render as Unknown / Legacy', () => {
  const normalized = getInnovationDefinition({}, 'removedInnovation');

  assert.equal(normalized.id, 'removedInnovation');
  assert.equal(normalized.name, 'Unknown / Legacy');
  assert.equal(normalized.legacy, true);
});

test('deck-state normalization preserves legacy owned ids and removes duplicates', () => {
  const normalized = normalizeInnovationDeckState({
    builtInnovationIds: ['language', 'legacyLaw', 'language'],
    discoveredInnovationIds: ['symposium'],
    availableInnovationPoolIds: ['cooking', 'cooking'],
    innovationHistory: [{ type: 'chosen', innovationId: 'language' }]
  }, {
    ownedIds: ['lanternHearth', 'legacyLaw'],
    defaultPoolIds: ['language', 'cooking']
  });

  assert.deepEqual(
    normalized.builtInnovationIds,
    ['lanternHearth', 'legacyLaw', 'language']
  );
  assert.deepEqual(
    normalized.discoveredInnovationIds,
    ['lanternHearth', 'legacyLaw', 'language', 'symposium']
  );
  assert.deepEqual(normalized.availableInnovationPoolIds, ['language', 'cooking']);
  assert.equal(normalized.innovationHistory.length, 1);
});
