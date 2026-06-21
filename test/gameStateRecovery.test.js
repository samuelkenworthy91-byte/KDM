import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyRuntime,
  getInvalidCombatSurvivorIds,
  recoverGameState,
  validateGameState
} from '../src/game/gameStateRecovery.js';
import { safeParseSave } from '../src/game/saveLogic.js';

function settlement() {
  return {
    survivors: [{ id: 'survivor-1', hp: 30, alive: true }],
    livingSurvivors: [{ id: 'survivor-1', hp: 30, alive: true }],
    armory: [],
    stash: {},
    settlementHistory: []
  };
}

test('missing run data on combat recovers instead of rendering', () => {
  const result = validateGameState({
    activeSlot: 1,
    settlement: settlement(),
    runtime: { ...createEmptyRuntime('combat'), runParty: [] }
  });
  assert.equal(result.valid, false);
  assert.match(result.reason, /hunt party/);
});

test('principleChoice is a valid settlement screen without hunt state', () => {
  const result = validateGameState({
    activeSlot: 1,
    settlement: {
      ...settlement(),
      pendingPrincipleChoice: { group: 'newLife', trigger: 'First newborn' }
    },
    runtime: { ...createEmptyRuntime('principleChoice'), runParty: [], runMap: [], currentNode: null }
  });
  assert.equal(result.valid, true);
});

test('temporary Scout fight combat validates through sourceNodeId', () => {
  const runtime = {
    ...createEmptyRuntime('combat'),
    runMap: [[{ id: 'rest-1', type: 'rest', completed: false }]],
    currentNode: { id: 'rest-1:scout-fight', sourceNodeId: 'rest-1', type: 'fight' },
    runParty: [{ id: 'survivor-1', hp: 20 }],
    partyCombatBonuses: [{ survivor: { id: 'survivor-1', hp: 20 }, runDeck: [] }]
  };
  const result = validateGameState({ activeSlot: 1, settlement: settlement(), runtime });
  assert.equal(result.valid, true);
});

test('incomplete party combat decks are rejected', () => {
  const runtime = {
    ...createEmptyRuntime('combat'),
    runMap: [[{ id: 'node-1', type: 'fight' }]],
    currentNode: { id: 'node-1', type: 'fight' },
    runParty: [{ id: 'survivor-1', hp: 20 }],
    partyCombatBonuses: [{ survivor: { id: 'survivor-1' } }]
  };
  const result = validateGameState({ activeSlot: 1, settlement: settlement(), runtime });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'incomplete party combat state');
});

test('combat with persisted pending lethal damage is rejected for safe recovery', () => {
  const runtime = {
    ...createEmptyRuntime('combat'),
    runMap: [[{ id: 'node-1', type: 'fight' }]],
    currentNode: { id: 'node-1', type: 'fight' },
    runParty: [{ id: 'survivor-1', hp: 1 }],
    partyCombatBonuses: [{
      survivor: { id: 'survivor-1', hp: 1, pendingLethalDamage: true },
      runDeck: []
    }]
  };
  const result = validateGameState({ activeSlot: 1, settlement: settlement(), runtime });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'unresolved lethal combat damage');
  assert.deepEqual(getInvalidCombatSurvivorIds(runtime), ['survivor-1']);
});

test('malformed weak point harvest data is rejected', () => {
  const runtime = {
    ...createEmptyRuntime('lootReward'),
    runParty: [{ id: 'survivor-1', hp: 20 }],
    pendingCombatVictory: { brokenWeakPoints: {} },
    lootChoices: ['hide']
  };
  const result = validateGameState({ activeSlot: 1, settlement: settlement(), runtime });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'missing harvest data');
});

test('missing part choices are rejected', () => {
  const runtime = {
    ...createEmptyRuntime('lootReward'),
    runParty: [{ id: 'survivor-1', hp: 20 }],
    selectedLevel: 2,
    pendingCombatVictory: { brokenWeakPoints: [] },
    lootChoices: ['hide']
  };
  const result = validateGameState({ activeSlot: 1, settlement: settlement(), runtime });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'missing part rewards');
});

test('malformed survivor reward state is rejected', () => {
  const runtime = {
    ...createEmptyRuntime('survivorProgress'),
    runParty: [{ id: 'survivor-1', hp: 20 }],
    runSummary: { survivorId: 'missing-survivor' }
  };
  const result = validateGameState({ activeSlot: 1, settlement: settlement(), runtime });
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'missing survivor reward');
});

test('recovery preserves settlement and clears transient hunt state', () => {
  const current = {
    activeSlot: 1,
    settlement: settlement(),
    runtime: {
      ...createEmptyRuntime('combat'),
      runParty: [{ id: 'survivor-1', hp: 20 }]
    }
  };
  const recovered = recoverGameState(current, 'missing combat', { resetHunt: true });
  assert.equal(recovered.settlement.survivors[0].id, 'survivor-1');
  assert.equal(recovered.runtime.screen, 'settlement');
  assert.deepEqual(recovered.runtime.runParty, []);
  assert.equal(
    recovered.settlement.settlementHistory.at(-1).message,
    'A broken hunt state was recovered.'
  );
});

test('malformed JSON returns a recoverable settlement without throwing', () => {
  const recovered = safeParseSave('{"broken":', 2);
  assert.equal(recovered.settlementName, 'Recovered Save Slot 2');
  assert.equal(Array.isArray(recovered.livingSurvivors), true);
  assert.match(recovered.recoveryReason, /malformed/i);
});

test('older settlement saves receive required arrays and maps', () => {
  const migrated = safeParseSave(JSON.stringify({
    settlementName: 'Old Light',
    survivors: [{ id: 'legacy-1', name: 'Legacy', hp: 12, maxHp: 30 }]
  }));
  assert.equal(migrated.settlementName, 'Old Light');
  assert.equal(Array.isArray(migrated.armory), true);
  assert.equal(Array.isArray(migrated.settlementHistory), true);
  assert.equal(typeof migrated.huntRewardLedger, 'object');
});
