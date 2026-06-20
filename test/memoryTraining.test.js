import assert from 'node:assert/strict';
import test from 'node:test';

import { createSurvivor } from '../src/game/saveLogic.js';
import { resolveMemoryTraining } from '../src/game/memoryTrainingLogic.js';
import { innovationCards } from '../src/data/innovationCards.js';

function settlement(overrides = {}) {
  return {
    lanternYear: 3,
    settlementMemory: 2,
    memories: 2,
    memoryHistory: [],
    builtMemoryInnovations: [],
    memoryActionsUsedThisYear: {},
    survivorTrainingLog: [],
    survivors: [
      {
        ...createSurvivor('Toma'),
        id: 'survivor-1',
        activeProficiencyType: 'sword',
        weaponProficiency: { sword: { xp: 0, level: 0 } }
      }
    ],
    ...overrides
  };
}

test('nightDrills and memoryPit unlock usable Memory Training', () => {
  assert.deepEqual(innovationCards.nightDrills.actionUnlocks, ['memoryTraining']);
  assert.deepEqual(innovationCards.memoryPit.actionUnlocks, ['memoryTraining']);

  ['nightDrills', 'memoryPit'].forEach(innovationId => {
    const next = resolveMemoryTraining(settlement({
      builtMemoryInnovations: [innovationId]
    }), 'survivor-1', { roll: 8 });

    assert.equal(next.settlementMemory, 1);
    assert.equal(next.memoryActionsUsedThisYear.memoryTraining, 3);
    assert.equal(next.survivors[0].weaponProficiency.sword.xp, 1);
    assert.equal(next.survivorTrainingLog[0].actionId, 'memoryTraining');
  });
});

test('Memory Training is unavailable without a training innovation or after yearly use', () => {
  const locked = resolveMemoryTraining(settlement(), 'survivor-1', { roll: 8 });
  assert.equal(locked.settlementMemory, 2);

  const used = resolveMemoryTraining(settlement({
    builtMemoryInnovations: ['nightDrills'],
    memoryActionsUsedThisYear: { memoryTraining: 3 }
  }), 'survivor-1', { roll: 8 });
  assert.equal(used.settlementMemory, 2);
});
