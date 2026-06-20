import assert from 'node:assert/strict';
import test from 'node:test';

import {
  awardHuntReturnMemories,
  canSpendMemories,
  createDeathResolution,
  createHuntEventMemoryAward,
  gainMemories,
  queueDeathResolutions,
  resolveDeathMemoryChoice,
  spendMemories
} from '../src/game/memoryEconomy.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';

function settlement(memories = 0) {
  return {
    memories,
    settlementMemory: memories,
    memoryHistory: [],
    pendingDeathResolutions: [],
    stash: {},
    lanternYear: 3,
    principles: { death: null, newLife: null, society: null },
    principleUses: {},
    principleHistory: []
  };
}

test('four living hunt returners award four memories', () => {
  const survivors = Array.from({ length: 4 }, (_, index) => ({
    id: `survivor-${index}`,
    hp: 10,
    alive: true
  }));
  const next = awardHuntReturnMemories(settlement(), survivors, 'hunt-4');

  assert.equal(next.memories, 4);
  assert.equal(next.memoryHistory[0].source, 'hunt-return');
  assert.deepEqual(next.memoryHistory[0].survivorIds, survivors.map(item => item.id));
});

test('only living returners award memories and dead survivors can be queued', () => {
  const party = [
    { id: 'alive-1', name: 'Alive One', hp: 5, alive: true },
    { id: 'alive-2', name: 'Alive Two', hp: 1, alive: true },
    { id: 'dead-1', name: 'Dead One', hp: 0, alive: false },
    { id: 'dead-2', name: 'Dead Two', hp: 0, alive: false }
  ];
  const awarded = awardHuntReturnMemories(settlement(), party, 'hunt-2');
  const queued = queueDeathResolutions(
    awarded,
    party.slice(2).map(survivor => createDeathResolution(survivor, {
      huntId: 'hunt-2',
      timestamp: `2026-01-0${survivor.id.endsWith('1') ? 1 : 2}T00:00:00.000Z`
    }))
  );

  assert.equal(queued.memories, 2);
  assert.equal(queued.pendingDeathResolutions.length, 2);
});

test('full party death awards no memories', () => {
  const party = [
    { id: 'dead-1', name: 'Dead One', hp: 0, alive: false },
    { id: 'dead-2', name: 'Dead Two', hp: 0, alive: false }
  ];
  const awarded = awardHuntReturnMemories(settlement(), party, 'hunt-failed');

  assert.equal(awarded.memories, 0);
  assert.equal(awarded.memoryHistory.length, 0);
});

test('death principle choices replace repeated burial/resource choices', () => {
  const resolution = createDeathResolution(
    { id: 'dead-1', name: 'Mara' },
    { id: 'resolution-1', timestamp: '2026-01-01T00:00:00.000Z' }
  );
  const queued = queueDeathResolutions(settlement(), [resolution]);
  const graves = resolveDeathMemoryChoice({
    ...queued,
    principles: { ...queued.principles, death: 'graves' }
  }, resolution.id, 'bury');
  const cannibalism = resolveDeathMemoryChoice({
    ...queueDeathResolutions(settlement(), [resolution]),
    principles: { death: 'cannibalism', newLife: null, society: null }
  }, resolution.id, 'recover-resource', 'hide');

  assert.equal(queued.pendingPrincipleChoice.group, 'death');
  assert.equal(graves.memories, 1);
  assert.equal(graves.memoryHistory[0].source, 'death-principle-graves');
  assert.equal(graves.pendingDeathResolutions[0].status, 'resolved');
  assert.equal(graves.pendingDeathResolutions[0].choice, 'graves');
  assert.equal(cannibalism.memories, 0);
  assert.equal(cannibalism.stash.hide, 1);
  assert.equal(cannibalism.pendingDeathResolutions[0].choice, 'cannibalism');
});

test('same death principle reward cannot be claimed twice', () => {
  const resolution = createDeathResolution(
    { id: 'dead-1', name: 'Mara' },
    { id: 'resolution-1', timestamp: '2026-01-01T00:00:00.000Z' }
  );
  const queued = {
    ...queueDeathResolutions(settlement(), [resolution]),
    principles: { death: 'graves', newLife: null, society: null }
  };
  const once = resolveDeathMemoryChoice(queued, resolution.id);
  const twice = resolveDeathMemoryChoice(once, resolution.id);

  assert.equal(once.memories, 1);
  assert.equal(twice.memories, 1);
  assert.equal(twice.memoryHistory.length, 1);
});

test('spending cannot make memory negative', () => {
  assert.equal(canSpendMemories(settlement(1), 2), false);
  assert.equal(spendMemories(settlement(1), 2), null);
  assert.equal(spendMemories(settlement(2), 2).memories, 0);
});

test('Work Together discounts exactly one 1-Memory cost per Lantern Year', () => {
  const current = {
    ...settlement(0),
    principles: { death: null, newLife: null, society: 'workTogether' }
  };
  assert.equal(canSpendMemories(current, 1), true);
  const first = spendMemories(current, 1, { source: 'test-action' });

  assert.equal(first.memories, 0);
  assert.equal(first.memoryHistory[0].workTogetherDiscount, 1);
  assert.equal(first.principleUses.workTogether.lanternYear, 3);
  assert.equal(canSpendMemories(first, 1), false);
  assert.equal(spendMemories(first, 1), null);
  assert.equal(canSpendMemories({ ...current, memories: 1, settlementMemory: 1 }, 2), false);
});

test('legacy settlement memory migrates into the authoritative balance', () => {
  const migrated = normalizeSettlement({ settlementMemory: 7, survivors: [] });

  assert.equal(migrated.memories, 7);
  assert.equal(migrated.settlementMemory, 7);
  assert.equal(migrated.memoryHistory[0].source, 'legacy-save');
});

test('hunt events do not grant memory by default', () => {
  const award = createHuntEventMemoryAward(2, 'The party records a strange light.');
  const next = gainMemories(settlement(), award.amount, {
    source: award.source,
    description: award.description
  });

  assert.equal(award.type, 'memoryAward');
  assert.equal(award.amount, 0);
  assert.equal(next.memories, 0);
  assert.equal(next.memoryHistory.length, 0);
});
