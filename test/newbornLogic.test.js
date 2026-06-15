import assert from 'node:assert/strict';
import test from 'node:test';

import { createPendingNewborn, getBirthTraitCost } from '../src/game/newbornLogic.js';
import { createSurvivor, normalizeSettlement } from '../src/game/saveLogic.js';

const parentA = {
  id: 'parent-a',
  name: 'Aster Ashward',
  firstName: 'Aster',
  familyName: 'Ashward',
  generationType: 'born',
  generation: 2
};
const parentB = {
  id: 'parent-b',
  name: 'Brin Cinderwake',
  firstName: 'Brin',
  familyName: 'Cinderwake',
  generationType: 'born',
  generation: 3
};

test('successful birth data becomes a pending newborn identity', () => {
  const pending = createPendingNewborn(parentA, parentB, {
    id: 'newborn-1',
    primaryParent: parentB,
    random: () => 0,
    innateTraitIds: ['lanternEyed'],
    birthLanternYear: 7,
    remainingBirths: 2
  });

  assert.equal(pending.id, 'newborn-1');
  assert.deepEqual(pending.parentIds, ['parent-a', 'parent-b']);
  assert.deepEqual(pending.parentNames, ['Aster Ashward', 'Brin Cinderwake']);
  assert.equal(pending.suggestedFamilyNames[0], 'Cinderwake');
  assert.equal(pending.birthLanternYear, 7);
  assert.equal(pending.generation, 4);
  assert.equal(pending.remainingBirths, 2);
  assert.deepEqual(pending.innateTraitIds, ['lanternEyed']);
  assert.equal(pending.source, 'intimacy');
});

test('birth trait costs are unique and unknown ids are free', () => {
  assert.equal(getBirthTraitCost(['steadyChild', 'boneStrong']), 3);
  assert.equal(getBirthTraitCost(['steadyChild', 'steadyChild']), 1);
  assert.equal(getBirthTraitCost(['unknownLegacyTrait']), 0);
});

test('born survivors store family, parent, generation, and birth fields', () => {
  const survivor = createSurvivor('Vale Cinderwake', 'other', {
    firstName: 'Vale',
    familyName: 'Cinderwake',
    generationType: 'born',
    generation: 4,
    parentIds: ['parent-a', 'parent-b'],
    parentNames: ['Aster Ashward', 'Brin Cinderwake'],
    birthLanternYear: 7,
    bornFromIntimacy: true,
    innateTraits: ['lanternEyed'],
    purchasedBirthTraits: ['steadyChild'],
    memorySpentAtBirth: 1
  });

  assert.equal(survivor.firstName, 'Vale');
  assert.equal(survivor.name, 'Vale Cinderwake');
  assert.equal(survivor.generation, 4);
  assert.equal(survivor.bornFromIntimacy, true);
  assert.deepEqual(survivor.parentNames, ['Aster Ashward', 'Brin Cinderwake']);
  assert.deepEqual(survivor.purchasedBirthTraits, ['steadyChild']);
});

test('old saves and pending newborns normalize safely', () => {
  const oldSave = normalizeSettlement({
    settlementName: 'Old Light',
    survivors: [{ id: 'legacy', name: 'Mara', hp: 10, maxHp: 30 }]
  });
  const pendingSave = normalizeSettlement({
    survivors: [],
    lanternYear: 5,
    pendingNewborn: {
      id: 'pending',
      parentIds: ['a', 'b'],
      parentNames: ['A', 'B'],
      innateTraitIds: ['Lantern-Eyed'],
      source: 'intimacy'
    }
  });

  assert.equal(oldSave.pendingNewborn, null);
  assert.equal(oldSave.survivors[0].firstName, 'Mara');
  assert.deepEqual(oldSave.survivors[0].purchasedBirthTraits, []);
  assert.equal(oldSave.survivors[0].memorySpentAtBirth, 0);
  assert.equal(pendingSave.pendingNewborn.source, 'intimacy');
  assert.deepEqual(pendingSave.pendingNewborn.innateTraitIds, ['lanternEyed']);
  assert.equal(pendingSave.pendingNewborn.birthLanternYear, 5);
});
