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
  assert.equal(resolved.settlement.settlementMemory, 3);
  const history = resolved.settlement.settlementHistory.at(-1);
  assert.equal(history.type, 'retreat');
  assert.equal(history.quarry, 'Pale Hunt Lion');
  assert.deepEqual(history.partyMembers, ['Mira']);
  assert.deepEqual(history.gatheredResourcesKept, ['bone', 'hide']);
  assert.equal(history.d20Roll, 20);
  assert.ok(history.details.every(detail => typeof detail === 'string'));
  assert.equal(resolved.settlement.huntRewardLedger['hunt-1'].retreatResolved, true);
  assert.equal(resolved.settlement.huntRewardLedger['hunt-1'].partsApplied, undefined);
  assert.equal(resolved.settlement.huntRewardLedger['hunt-1'].survivorRewardsApplied, undefined);
  assert.equal(resolved.settlement.completedHunts, undefined);
  assert.equal(resolved.settlement.defeatedQuarryLevels, undefined);
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
  assert.equal(second.settlement.settlementMemory, 3);
});

test('empty hands loses half gathered resources rounded down', () => {
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

test('empty hands rounds down and keeps a single gathered resource', () => {
  const current = settlement();
  const resolved = resolveHuntRetreat({
    settlement: current,
    party: current.survivors,
    gatheredResources: ['bone'],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-one-resource',
    roll: 10,
    random: () => 0
  });

  assert.deepEqual(resolved.result.gatheredResourcesKept, ['bone']);
  assert.deepEqual(resolved.result.resourcesLost, []);
  assert.equal(resolved.settlement.stash.bone, 1);
});

test('retreat persists party HP, conditions, survival, and bound gear', () => {
  const current = settlement();
  current.survivors[0].boundGear = [{ instanceId: 'old', equipmentId: 'oldGear' }];
  const returning = {
    ...current.survivors[0],
    hp: 3,
    survival: 1,
    injuries: ['deepCut'],
    scars: ['lionScar'],
    disorders: ['paranoia'],
    boundGear: [{ instanceId: 'kept', equipmentId: 'lionhideBuckler' }]
  };
  const resolved = resolveHuntRetreat({
    settlement: current,
    party: [returning],
    gatheredResources: [],
    quarryId: 'paleHuntLion',
    quarryLevel: 2,
    huntResultId: 'hunt-persist',
    roll: 20,
    random: () => 0
  });
  const survivor = resolved.settlement.survivors[0];

  assert.equal(survivor.hp, 3);
  assert.equal(survivor.survival, 1);
  assert.deepEqual(survivor.injuries, ['deepCut']);
  assert.deepEqual(survivor.scars, ['lionScar']);
  assert.deepEqual(survivor.disorders, ['paranoia']);
  assert.deepEqual(survivor.boundGear, returning.boundGear);
});

test('retreat recovery records an unpersisted party death once', () => {
  const current = settlement();
  const fallen = {
    ...current.survivors[0],
    hp: 0,
    alive: false,
    isAlive: false,
    causeOfDeath: 'Raking Claws',
    boundGear: [{ instanceId: 'lost', equipmentId: 'lionhideBuckler' }]
  };
  const resolved = resolveHuntRetreat({
    settlement: current,
    party: [fallen],
    gatheredResources: [],
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    huntResultId: 'hunt-death-recovery',
    roll: 20,
    random: () => 0
  });

  assert.equal(resolved.settlement.population, 4);
  assert.equal(resolved.settlement.deadSurvivors, 1);
  assert.equal(resolved.settlement.survivors[0].alive, false);
  assert.equal(resolved.settlement.survivors[0].hp, 0);
  assert.deepEqual(resolved.settlement.survivors[0].boundGear, []);
  assert.equal(resolved.settlement.graveHistory[0].killedBy, 'Raking Claws');
  assert.deepEqual(resolved.settlement.graveHistory[0].gearLostNames, ['lionhideBuckler']);
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
