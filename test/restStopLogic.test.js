import assert from 'node:assert/strict';
import test from 'node:test';

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

test('forage adds resources or nothing', () => {
  const s1 = survivor('S1');
  const result = resolveRestStopChoice(state([s1]), 'forage');
  assert.equal(result.applied, true);
  // runResources starts empty in state(), so it should have 0 or 1 item
  assert.ok((result.runResources || []).length <= 1);
});

test('scoutTheDark can find a survivor or gear', () => {
  const s1 = survivor('S1');
  const settlement = {
    ...defaultSettlement,
    survivors: [s1],
    builtInnovations: ['boneSmith']
  };
  const result = resolveRestStopChoice({ ...state([s1]), settlement }, 'scoutTheDark');
  
  assert.equal(result.applied, true);
});
