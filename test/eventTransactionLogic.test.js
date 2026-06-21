import assert from 'node:assert/strict';
import test from 'node:test';

import { events } from '../src/data/events.js';
import { quarries } from '../src/data/quarries.js';
import { createSurvivor } from '../src/game/saveLogic.js';
import { normalizeHuntEventForRoll } from '../src/game/eventLogic.js';
import {
  applyEventTransactionToRun,
  createSafeEventState,
  resolveEventTransaction
} from '../src/game/eventTransactionLogic.js';

function survivor(id = 'ari') {
  return {
    ...createSurvivor('Ari'),
    id,
    hp: 4,
    maxHp: 5,
    survival: 1,
    maxSurvival: 3,
    alive: true
  };
}

function baseState() {
  const member = survivor();
  return {
    runResources: [],
    runSurvivor: member,
    runParty: [member],
    runModifiers: {},
    settlement: {
      settlementMemory: 1,
      memories: 1,
      settlementHistory: [],
      survivors: [member]
    }
  };
}

test('resolveEventTransaction never throws for every event at roll 1, 5, and 10', () => {
  for (const event of events) {
    for (const roll of [1, 5, 10]) {
      assert.doesNotThrow(() => {
        const result = resolveEventTransaction({
          event,
          choice: { rollOverride: roll },
          state: baseState(),
          context: {
            quarry: quarries.paleHuntLion,
            selectedQuarry: 'paleHuntLion',
            roll,
            random: () => 0.4
          }
        });
        assert.ok(result.eventId);
        assert.ok(Array.isArray(result.appliedEffects));
        assert.doesNotMatch(result.appliedEffects.join('\n'), /Cannot read properties/);
      }, `${event.id} roll ${roll}`);
    }
  }
});

test('every normalised event band has mechanical effects', () => {
  for (const event of events) {
    const normalized = normalizeHuntEventForRoll(event);
    for (const band of normalized.resultBands || []) {
      assert.ok(band.effects);
      assert.ok(Object.keys(band.effects).length > 0, `${event.id}/${band.id}`);
    }
  }
});

test('applyEventTransactionToRun updates the matching survivor in runParty', () => {
  const first = survivor('first');
  const second = survivor('second');
  const updatedSecond = { ...second, hp: 2, survival: 3 };
  const applied = applyEventTransactionToRun({
    transaction: {
      runSurvivor: updatedSecond,
      runParty: [first, second],
      runResources: ['bone'],
      runModifiers: { firstAttackBonus: 1 }
    },
    runState: {
      runResources: [],
      runSurvivor: first,
      runParty: [first, second],
      runModifiers: {}
    },
    settlement: { settlementMemory: 0, memories: 0 }
  });

  assert.equal(applied.runSurvivor.id, 'second');
  assert.equal(applied.runParty.find(item => item.id === 'second').hp, 2);
  assert.deepEqual(applied.runResources, ['bone']);
  assert.equal(applied.runModifiers.firstAttackBonus, 1);
});

test('createSafeEventState uses first living party member when runSurvivor is null', () => {
  const fallen = { ...survivor('fallen'), hp: 0, alive: false };
  const living = survivor('living');
  const state = createSafeEventState({
    runSurvivor: null,
    runParty: [fallen, living]
  });

  assert.equal(state.runSurvivor.id, 'living');
});

test('null event and null state returns recovery instead of throwing', () => {
  const result = resolveEventTransaction({
    event: null,
    choice: null,
    state: null,
    context: null
  });

  assert.equal(result.recovered, true);
  assert.equal(result.eventId, 'unknownEvent');
  assert.ok(Array.isArray(result.runParty));
});

test('Tumour Birds Guarded Cache resolves safely with resource gain or fallback effect', () => {
  const tumourBirds = events.find(event => event.id === 'tumourBirds');
  const result = resolveEventTransaction({
    event: tumourBirds,
    choice: { rollOverride: 10 },
    state: baseState(),
    context: {
      quarry: quarries.paleHuntLion,
      selectedQuarry: 'paleHuntLion',
      random: () => 0.1
    }
  });

  assert.equal(result.eventId, 'tumourBirds');
  assert.ok(result.appliedEffects.length > 0);
  assert.ok(result.runResources.length > 0 || result.appliedEffects.some(effect => /resource|Event recovery/i.test(effect)));
});
