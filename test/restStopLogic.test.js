import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { equipment } from '../src/data/equipment.js';
import { createSurvivor, defaultSettlement } from '../src/game/saveLogic.js';
import {
  getForgettableRestCards,
  getRestParty,
  resolveRestStopChoice
} from '../src/game/restStopLogic.js';

function survivor(name, overrides = {}) {
  return {
    ...createSurvivor(name),
    id: name.toLowerCase().replace(/\s+/g, '-'),
    ...overrides
  };
}

function state(party, active = party[0], settlementOverrides = {}) {
  return {
    settlement: {
      ...defaultSettlement,
      memories: 1,
      settlementMemory: 1,
      survivors: party,
      ...settlementOverrides
    },
    runParty: party,
    runSurvivor: active,
    runModifiers: {},
    runMap: [[{
      id: 'rest',
      type: 'rest',
      connections: ['next'],
      available: true
    }], [{
      id: 'next',
      type: 'elite',
      connections: ['future'],
      available: false
    }], [{
      id: 'future',
      type: 'event',
      connections: [],
      available: false
    }]],
    currentNode: {
      id: 'rest',
      type: 'rest',
      connections: ['next']
    },
    currentHuntId: 'hunt-test'
  };
}

function withRandom(value, fn) {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

test('healParty heals all living survivors by 25% max HP', () => {
  const s1 = survivor('S1', { hp: 10, maxHp: 20 });
  const s2 = survivor('S2', { hp: 5, maxHp: 20 });
  const dead = survivor('Dead', { hp: 0, alive: false });
  const result = resolveRestStopChoice(state([s1, s2, dead]), 'healParty');

  assert.equal(result.applied, true);
  assert.equal(result.runParty.find(s => s.id === 's1').hp, 15);
  assert.equal(result.runParty.find(s => s.id === 's2').hp, 10);
  assert.equal(result.runParty.find(s => s.id === 'dead').hp, 0);
  assert.equal(result.runParty.find(s => s.id === 'dead').alive, false);
});

test('shareStories adds Memory or Survival', () => {
  const s1 = survivor('S1', { survival: 0, maxSurvival: 3 });
  const survivalResult = resolveRestStopChoice(state([s1]), 'shareStories', { storyReward: 'survival' });
  const memoryResult = resolveRestStopChoice(state([s1]), 'shareStories', { storyReward: 'memory' });

  assert.equal(survivalResult.runParty[0].survival, 1);
  assert.equal(memoryResult.settlement.stash.memory, 1);
});

test('practice has success and failure paths and persists fighting arts', () => {
  const s1 = survivor('S1', { hp: 10, fightingArts: [] });
  
  const result = resolveRestStopChoice(state([s1]), 'practice', { survivorId: 's1' });
  
  assert.equal(result.applied, true);
  const updatedS1 = result.runParty[0];
  if (updatedS1.fightingArts.length === 1) {
    const settlementS1 = result.settlement.survivors.find(s => s.id === 's1');
    assert.equal(settlementS1.fightingArts.length, 1);
    assert.equal(settlementS1.fightingArts[0], updatedS1.fightingArts[0]);
  } else {
    assert.equal(updatedS1.hp, 9);
  }
});

test('forage adds resources or nothing and provides outcomeText', () => {
  const s1 = survivor('S1');
  const initialState = { ...state([s1]), currentQuarryId: 'paleHuntLion', runResources: [] };
  const result = resolveRestStopChoice(initialState, 'forage');
  
  assert.equal(result.applied, true);
  assert.ok(result.outcomeText.length > 0);
  
  if (result.runResources.length > 0) {
    assert.ok(result.outcomeText.includes('Found') || result.outcomeText.includes('Recovered'));
  } else {
    assert.ok(result.outcomeText.includes('nothing'));
  }
});

test('scoutTheDark provides outcomeText for all paths', () => {
  const s1 = survivor('S1');
  const settlement = {
    ...defaultSettlement,
    survivors: [s1],
    builtInnovations: ['boneSmith']
  };
  const result = resolveRestStopChoice({ ...state([s1]), settlement }, 'scoutTheDark');
  
  assert.equal(result.applied, true);
  assert.ok(result.outcomeText.length > 0);
});

test('scoutTheDark random gear uses active equipment from unlocked buildings', () => {
  const s1 = survivor('S1');
  const settlement = {
    ...defaultSettlement,
    survivors: [s1],
    builtInnovations: ['boneSmith']
  };

  const result = withRandom(0.35, () =>
    resolveRestStopChoice({ ...state([s1]), settlement }, 'scoutTheDark')
  );

  assert.equal(result.applied, true);
  assert.equal(result.settlement.armory.length, 1);
  const gearId = result.settlement.armory[0].equipmentId;
  const item = equipment.find(candidate => candidate.id === gearId);
  assert.ok(item, `${gearId} should come from active equipment`);
  assert.equal(item.buildingId || item.locationId || item.craftingLocationId, 'boneSmith');
  assert.equal(item.deprecated, false);
  assert.equal(item.hiddenFromCrafting, false);
  assert.notEqual(item.itemType, 'consumable');
  assert.notEqual(item.loadoutCategory, 'consumable');
});

test('scoutTheDark random gear falls back safely when no unlocked gear exists', () => {
  const s1 = survivor('S1');
  const settlement = {
    ...defaultSettlement,
    survivors: [s1],
    builtInnovations: []
  };

  const result = withRandom(0.35, () =>
    resolveRestStopChoice({ ...state([s1]), settlement, runResources: [] }, 'scoutTheDark')
  );

  assert.equal(result.applied, true);
  assert.deepEqual(result.runResources, ['scrap']);
  assert.match(result.outcomeText, /No unlocked non-consumable gear/);
});

test('restStopLogic does not import the deleted old gear registry', () => {
  const source = readFileSync(new URL('../src/game/restStopLogic.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /overhaul\/gearRegistry/);
  assert.doesNotMatch(source, /gearRegistry/);
  assert.match(source, /import \{ equipment \} from '\.\.\/data\/equipment\.js';/);
});
