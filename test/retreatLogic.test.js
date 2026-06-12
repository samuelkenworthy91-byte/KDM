import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRetreatConsequence,
  retreatConsequences
} from '../src/data/retreatConsequences.js';
import { resolveHuntRetreat } from '../src/game/retreatLogic.js';

function settlement() {
  const survivor = {
    id: 'mira',
    name: 'Mira',
    hp: 10,
    maxHp: 10,
    alive: true,
    injuries: [],
    scars: [],
    disorders: [],
    boundGear: []
  };
  return {
    population: 5,
    settlementMemory: 3,
    lanternYear: 2,
    stash: {},
    armory: [],
    survivors: [survivor],
    livingSurvivors: [survivor],
    activeSurvivorId: survivor.id,
    graveHistory: [],
    deadSurvivors: 0,
    settlementHistory: [],
    huntRewardLedger: {},
    temporarySettlementModifiers: {},
    quarryRetreatModifiers: {},
    totalRuns: 0
  };
}

test('retreat consequence table covers every D20 result', () => {
  assert.equal(retreatConsequences.length, 20);
  assert.equal(getRetreatConsequence(1).id, 'starvationInTheDark');
  assert.equal(getRetreatConsequence(20).id, 'hardLesson');
});

test('retreat banks gathered resources and records history', () => {
  const current = settlement();
  const resolved = resolveHuntRetreat({
    settlement: current,
    party: current.survivors,
    gatheredResources: ['bone', 'hide'],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-1',
    roll: 20,
    random: () => 0
  });

  assert.equal(resolved.settlement.stash.bone, 1);
  assert.equal(resolved.settlement.stash.hide, 1);
  assert.equal(resolved.settlement.settlementMemory, 4);
  assert.equal(resolved.settlement.settlementHistory.at(-1).type, 'retreat');
  assert.equal(resolved.settlement.huntRewardLedger['hunt-1'].retreatResolved, true);
});

test('same retreat result cannot apply twice', () => {
  const current = settlement();
  const first = resolveHuntRetreat({
    settlement: current,
    party: current.survivors,
    gatheredResources: ['bone'],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-1',
    roll: 20
  });
  const second = resolveHuntRetreat({
    settlement: first.settlement,
    party: current.survivors,
    gatheredResources: ['bone'],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-1',
    roll: 20
  });

  assert.equal(second.duplicate, true);
  assert.equal(second.settlement.stash.bone, 1);
  assert.equal(second.settlement.settlementMemory, 4);
});

test('empty hands loses half gathered resources with a minimum of one', () => {
  const current = settlement();
  const resolved = resolveHuntRetreat({
    settlement: current,
    party: current.survivors,
    gatheredResources: ['bone', 'hide', 'sinew', 'organ'],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-2',
    roll: 10,
    random: () => 0
  });

  assert.equal(resolved.result.gatheredResourcesKept.length, 2);
  assert.equal(resolved.result.resourcesLost.length, 2);
});

test('starvation kills a living survivor and records a grave', () => {
  const current = settlement();
  const resolved = resolveHuntRetreat({
    settlement: current,
    party: current.survivors,
    gatheredResources: [],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-3',
    roll: 1,
    random: () => 0
  });

  assert.equal(resolved.settlement.survivors[0].alive, false);
  assert.equal(resolved.settlement.population, 4);
  assert.equal(resolved.settlement.graveHistory[0].killedBy, 'Starved after retreat');
});
