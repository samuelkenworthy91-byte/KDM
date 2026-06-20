import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultSettlement,
  deleteSettlement,
  getActiveSlot,
  getSaveSlotKey,
  listSaveSlots,
  loadSettlement,
  normalizeSettlement,
  saveSettlement,
  setActiveSlot
} from '../src/game/saveLogic.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear()
  };
}

function settlement(name) {
  return {
    ...defaultSettlement,
    settlementName: name,
    population: 1,
    survivors: []
  };
}

test('save slot 1 can be created and deleted without legacy remigration', () => {
  globalThis.localStorage = createStorage();
  localStorage.setItem('settlement', JSON.stringify(settlement('Legacy Hold')));
  listSaveSlots();
  assert.equal(loadSettlement(1).settlementName, 'Legacy Hold');

  deleteSettlement(1);

  assert.equal(localStorage.getItem(getSaveSlotKey(1)), null);
  assert.equal(localStorage.getItem('settlement'), null);
  assert.equal(loadSettlement(1), null);
  assert.equal(listSaveSlots()[0].settlement, null);
});

test('deleting slot 1 leaves slot 2 intact', () => {
  globalThis.localStorage = createStorage();
  saveSettlement(settlement('First Hold'), 1);
  saveSettlement(settlement('Second Hold'), 2);

  deleteSettlement(1);

  assert.equal(loadSettlement(1), null);
  assert.equal(loadSettlement(2).settlementName, 'Second Hold');
});

test('deleting slot 2 leaves slot 1 intact', () => {
  globalThis.localStorage = createStorage();
  saveSettlement(settlement('First Hold'), 1);
  saveSettlement(settlement('Second Hold'), 2);

  deleteSettlement(2);

  assert.equal(loadSettlement(1).settlementName, 'First Hold');
  assert.equal(loadSettlement(2), null);
});

test('all save slots delete their own storage key', () => {
  globalThis.localStorage = createStorage();
  [1, 2, 3].forEach(slotId => {
    saveSettlement(settlement(`Hold ${slotId}`), slotId);
    assert.notEqual(localStorage.getItem(getSaveSlotKey(slotId)), null);

    deleteSettlement(slotId);

    assert.equal(localStorage.getItem(getSaveSlotKey(slotId)), null);
    assert.equal(loadSettlement(slotId), null);
  });
});

test('deleting current active slot clears the active slot marker and loaded save', () => {
  globalThis.localStorage = createStorage();
  saveSettlement(settlement('First Hold'), 1);
  setActiveSlot(1);

  deleteSettlement(1);

  assert.equal(localStorage.getItem('lanternDeckbuilder.activeSlot'), null);
  assert.equal(loadSettlement(1), null);
  assert.equal(getActiveSlot(), 1);
});

test('old saves migrate legacy resources, innovations, intimacy, and training safely', () => {
  const normalized = normalizeSettlement({
    settlementName: 'Legacy Migration',
    population: 6,
    settlementMemory: 3,
    stash: {
      claw: 2,
      fur: { count: 1 },
      horn: 1,
      ichor: 1,
      monsterTooth: 1,
      strangeEye: 1,
      loveJuice: { id: 'loveJuice', materialTags: ['organ'] },
      bone: 2
    },
    builtInnovations: ['language'],
    builtMemoryInnovations: ['nightDrills', 'legacyMemoryRite'],
    innovationDeckState: {
      builtInnovationIds: ['cooking'],
      availableInnovationPoolIds: ['ammonia'],
      innovationHistory: [{
        type: 'chosen',
        innovationId: 'unknownOldInnovation',
        lanternYear: 2,
        paidResources: ['hide', 'organ', 'bone']
      }]
    },
    survivors: [{
      id: 's1',
      name: 'Mara',
      gender: 'female',
      fightingArts: ['clawStyle', 'unknownOldArt'],
      personalDeckAdditions: ['missingOldCard'],
      gearCardTraining: {
        'gear-1': {
          oldCard: { copies: 2 }
        },
        's1:gear-2:otherOldCard': 3
      },
      hp: 20,
      maxHp: 30
    }],
    intimacyHistory: [{
      timestamp: '2026-01-01T00:00:00.000Z',
      lanternYear: 1,
      outcome: 'Legacy intimacy result',
      loveJuiceUsed: true
    }],
    pendingNewborn: {
      id: 'pending-old',
      parentIds: ['s1', 's2'],
      parentNames: ['Mara', 'Ren'],
      innateTraitIds: ['Lantern-Eyed'],
      source: 'intimacy'
    }
  });

  assert.equal(normalized.stash.claw, 2);
  assert.equal(normalized.stash.fur, 1);
  assert.equal(normalized.stash.horn, 1);
  assert.equal(normalized.stash.ichor, 1);
  assert.equal(normalized.stash.monsterTooth, 1);
  assert.equal(normalized.stash.strangeEye, 1);
  assert.equal(normalized.stash.loveJuice, 1);
  assert.ok(normalized.innovationDeckState.builtInnovationIds.includes('nightDrills'));
  assert.ok(normalized.innovationDeckState.builtInnovationIds.includes('legacyMemoryRite'));
  assert.ok(normalized.innovationDeckState.builtInnovationIds.includes('cooking'));
  assert.equal(normalized.builtMemoryInnovations.includes('nightDrills'), true);
  assert.equal(normalized.builtMemoryInnovations.includes('legacyMemoryRite'), true);
  assert.deepEqual(
    normalized.innovationDeckState.innovationHistory[0].paidResources.legacyResourceIds,
    ['hide', 'organ', 'bone']
  );
  assert.equal(normalized.innovationDeckState.innovationHistory[0].legacy, true);
  assert.deepEqual(normalized.survivors[0].fightingArts, ['clawStyle', 'unknownOldArt']);
  assert.deepEqual(normalized.survivors[0].personalDeckAdditions, [{
    cardId: 'missingOldCard',
    sourceType: 'personal'
  }]);
  assert.equal(normalized.survivors[0].gearCardTraining['gear-1:oldCard'], 2);
  assert.equal(normalized.survivors[0].gearCardTraining['s1:gear-2:otherOldCard'], 3);
  assert.equal(normalized.pendingNewborn.id, 'pending-old');
  assert.deepEqual(normalized.pendingNewborn.innateTraitIds, ['lanternEyed']);
  assert.equal(normalized.intimacyHistory[0].loveJuiceUsed, true);
  assert.equal(normalized.memories, 3);
  assert.equal(normalized.settlementMemory, 3);
});

test('old array stash saves normalize to counted legacy resource ids', () => {
  const normalized = normalizeSettlement({
    stash: ['bone', 'bone', 'claw', 'fur', { id: 'horn' }, { resourceId: 'unknownLegacyResource' }]
  });

  assert.deepEqual(normalized.stash, {
    bone: 2,
    claw: 1,
    fur: 1,
    horn: 1,
    unknownLegacyResource: 1
  });
});
