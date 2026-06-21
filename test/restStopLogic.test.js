import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { equipment } from '../src/data/equipment.js';
import { createSurvivor, defaultSettlement } from '../src/game/saveLogic.js';
import {
  DEFAULT_REST_OUTCOME_ODDS,
  getForgettableRestCards,
  getRestParty,
  getRestOutcomeCategory,
  getRestOutcomeOdds,
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
  assert.deepEqual(result.healingResults.map(entry => ({
    survivorId: entry.survivorId,
    beforeHp: entry.beforeHp,
    afterHp: entry.afterHp,
    maxHp: entry.maxHp
  })), [
    { survivorId: 's1', beforeHp: 10, afterHp: 15, maxHp: 20 },
    { survivorId: 's2', beforeHp: 5, afterHp: 10, maxHp: 20 }
  ]);
});

test('healParty caps healing at max HP and does not revive dead survivors', () => {
  const wounded = survivor('Wounded', { hp: 19, maxHp: 20 });
  const dead = survivor('Dead', { hp: 0, maxHp: 20, alive: false });
  const result = resolveRestStopChoice(state([wounded, dead]), 'healParty');

  assert.equal(result.runParty.find(s => s.id === 'wounded').hp, 20);
  assert.equal(result.runParty.find(s => s.id === 'dead').hp, 0);
  assert.equal(result.runParty.find(s => s.id === 'dead').alive, false);
  assert.equal(result.healingResults[0].beforeHp, 19);
  assert.equal(result.healingResults[0].afterHp, 20);
  assert.equal(result.healingResults[0].healed, 1);
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

test('forage adds resources or nothing and provides result panel data', () => {
  const s1 = survivor('S1');
  const initialState = { ...state([s1]), currentQuarryId: 'paleHuntLion', runResources: [] };
  const result = resolveRestStopChoice(initialState, 'forage');
  
  assert.equal(result.applied, true);
  assert.ok(result.outcomeText.length > 0);
  assert.ok(['negative', 'neutral', 'positive'].includes(result.outcomeCategory));
  assert.equal(result.odds.negative + result.odds.neutral + result.odds.positive, 100);
  
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

test('negative scoutTheDark result requests an immediate fight without changing rest node id', () => {
  const s1 = survivor('S1');
  const result = withRandom(0.05, () =>
    resolveRestStopChoice(state([s1]), 'scoutTheDark')
  );

  assert.equal(result.applied, true);
  assert.equal(result.nextNodeType, 'fight');
  assert.match(result.outcomeText, /immediate confrontation/);

  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /startImmediateRestFight\(currentNode\)/);
  assert.doesNotMatch(app, /selectNode\(\{\s*\.\.\.currentNode,\s*type:\s*'fight'\s*\}\)/);
});

test('scoutTheDark random gear uses active equipment from unlocked buildings', () => {
  const s1 = survivor('S1');
  const settlement = {
    ...defaultSettlement,
    survivors: [s1],
    builtInnovations: ['boneSmith']
  };

  const result = withRandom(0.85, () =>
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

  const result = withRandom(0.85, () =>
    resolveRestStopChoice({ ...state([s1]), settlement, runResources: [] }, 'scoutTheDark')
  );

  assert.equal(result.applied, true);
  assert.deepEqual(result.runResources, ['scrap']);
  assert.match(result.outcomeText, /No unlocked non-consumable gear/);
});

test('rest outcome odds are explicit, normalized, and Embrace the Dark stays non-negative', () => {
  const base = getRestOutcomeOdds(defaultSettlement);
  assert.deepEqual(base, { ...DEFAULT_REST_OUTCOME_ODDS, modified: false });

  const embrace = getRestOutcomeOdds({
    ...defaultSettlement,
    principles: { death: null, newLife: null, society: 'embraceTheDark' }
  });
  assert.deepEqual(embrace, { negative: 20, neutral: 30, positive: 50, modified: true });
  assert.equal(embrace.negative + embrace.neutral + embrace.positive, 100);
  assert.ok(Object.values(embrace).filter(value => typeof value === 'number').every(value => value >= 0));

  const clamped = getRestOutcomeOdds({
    ...defaultSettlement,
    principles: { death: null, newLife: null, society: 'embraceTheDark' }
  }, {
    negative: 5,
    neutral: 5,
    positive: 90
  });
  assert.equal(clamped.negative + clamped.neutral + clamped.positive, 100);
  assert.ok([clamped.negative, clamped.neutral, clamped.positive].every(value => value >= 0));
});

test('Embrace the Dark changes rest category rolls only through rest odds', () => {
  const settlement = {
    ...defaultSettlement,
    principles: { death: null, newLife: null, society: 'embraceTheDark' }
  };

  assert.equal(getRestOutcomeCategory(defaultSettlement, () => 0.25), 'negative');
  assert.equal(getRestOutcomeCategory(settlement, () => 0.25), 'neutral');

  const eventLogic = readFileSync(new URL('../src/game/eventLogic.js', import.meta.url), 'utf8');
  assert.doesNotMatch(eventLogic, /getRestOutcomeOdds|adjustRestOutcomeOddsForPrinciples|embraceTheDark/);
});

test('rest stop UI keeps choices and results in separate states before Continue', () => {
  const screen = readFileSync(new URL('../src/screens/RestStopScreen.jsx', import.meta.url), 'utf8');
  assert.match(screen, /!\s*result\s*\?/);
  assert.match(screen, /rest-result-view/);
  assert.match(screen, /Healing Applied/);
  assert.match(screen, /Continue/);

  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  assert.match(app, /setRestResult\(\{/);
  assert.match(app, /const handleRestContinue = \(\) => \{/);
  assert.match(app, /setRestResult\(null\);/);
  assert.match(app, /completeCurrentNode/);
});

test('restStopLogic does not import the deleted old gear registry', () => {
  const source = readFileSync(new URL('../src/game/restStopLogic.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /overhaul\/gearRegistry/);
  assert.doesNotMatch(source, /gearRegistry/);
  assert.match(source, /import \{ equipment \} from '\.\.\/data\/equipment\.js';/);
});
