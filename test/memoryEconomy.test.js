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
    lanternYear: 3
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

test('burial and resource recovery grant no memory by default', () => {
  const resolution = createDeathResolution(
    { id: 'dead-1', name: 'Mara' },
    { id: 'resolution-1', timestamp: '2026-01-01T00:00:00.000Z' }
  );
  const queued = queueDeathResolutions(settlement(), [resolution]);
  const buried = resolveDeathMemoryChoice(queued, resolution.id, 'bury');
  const recovered = resolveDeathMemoryChoice(
    queueDeathResolutions(settlement(), [resolution]),
    resolution.id,
    'recover-resource',
    'hide'
  );

  assert.equal(buried.memories, 0);
  assert.equal(buried.memoryHistory.length, 0);
  assert.equal(buried.pendingDeathResolutions[0].status, 'resolved');
  assert.equal(buried.pendingDeathResolutions[0].choice, 'bury');
  assert.equal(recovered.memories, 0);
  assert.equal(recovered.stash.hide, 1);
});

test('spending cannot make memory negative', () => {
  assert.equal(canSpendMemories(settlement(1), 2), false);
  assert.equal(spendMemories(settlement(1), 2), null);
  assert.equal(spendMemories(settlement(2), 2).memories, 0);
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
