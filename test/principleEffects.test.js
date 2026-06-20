import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateIntimacyProjections } from '../src/game/eventLogic.js';
import {
  createDeathResolution,
  queueDeathResolutions
} from '../src/game/memoryEconomy.js';
import {
  applyNewLifePrincipleToNewborn,
  chooseCampaignPrincipleWithEffects
} from '../src/game/principleEffects.js';
import { getRestOutcomeOdds } from '../src/game/restStopLogic.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';

function settlement(overrides = {}) {
  return normalizeSettlement({
    survivors: [],
    lanternYear: 1,
    ...overrides
  });
}

test('choosing Graves grants Memory for the death that triggered the choice', () => {
  const resolution = createDeathResolution(
    { id: 'dead-1', name: 'Mara' },
    { id: 'resolution-1', timestamp: '2026-01-01T00:00:00.000Z' }
  );
  const queued = queueDeathResolutions(settlement(), [resolution]);
  const chosen = chooseCampaignPrincipleWithEffects(queued, 'death', 'graves', {
    timestamp: '2026-06-20T00:00:00.000Z'
  });

  assert.equal(chosen.principles.death, 'graves');
  assert.equal(chosen.memories, 1);
  assert.equal(chosen.pendingDeathResolutions[0].principleRewardGranted, true);
});

test('later Graves deaths auto-grant Memory without another choice', () => {
  const resolution = createDeathResolution(
    { id: 'dead-2', name: 'Ren' },
    { id: 'resolution-2', timestamp: '2026-01-02T00:00:00.000Z' }
  );
  const next = queueDeathResolutions(settlement({
    principles: { death: 'graves', newLife: null, society: null }
  }), [resolution]);

  assert.equal(next.pendingPrincipleChoice, null);
  assert.equal(next.memories, 1);
  assert.equal(next.pendingDeathResolutions[0].status, 'resolved');
});

test('choosing Cannibalism grants a basic resource for the triggering death', () => {
  const resolution = createDeathResolution(
    { id: 'dead-1', name: 'Mara' },
    { id: 'resolution-1', timestamp: '2026-01-01T00:00:00.000Z' }
  );
  const queued = queueDeathResolutions(settlement(), [resolution]);
  const chosen = chooseCampaignPrincipleWithEffects(queued, 'death', 'cannibalism', {
    random: () => 0,
    timestamp: '2026-06-20T00:00:00.000Z'
  });

  assert.equal(chosen.principles.death, 'cannibalism');
  assert.equal(chosen.stash.bone, 1);
  assert.equal(chosen.pendingDeathResolutions[0].principleRewardGranted, true);
});

test('later Cannibalism deaths auto-grant a basic resource without another choice', () => {
  const resolution = createDeathResolution(
    { id: 'dead-2', name: 'Ren' },
    { id: 'resolution-2', timestamp: '2026-01-02T00:00:00.000Z' }
  );
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const next = queueDeathResolutions(settlement({
      principles: { death: 'cannibalism', newLife: null, society: null }
    }), [resolution]);

    assert.equal(next.pendingPrincipleChoice, null);
    assert.equal(next.stash.bone, 1);
    assert.equal(next.pendingDeathResolutions[0].status, 'resolved');
  } finally {
    Math.random = originalRandom;
  }
});

test('first newborn creates pending New Life principle', () => {
  const normalized = settlement({
    pendingNewborn: {
      id: 'newborn-1',
      parentIds: [],
      parentNames: [],
      innateTraitIds: [],
      remainingBirths: 1
    }
  });

  assert.equal(normalized.pendingPrincipleChoice.group, 'newLife');
  assert.deepEqual(normalized.pendingPrincipleChoice.affectedIds, ['newborn-1']);
});

test('old saves with pending death resolutions migrate to pending Death Principle', () => {
  const normalized = settlement({
    pendingDeathResolutions: [{
      id: 'legacy-death',
      survivorId: 's1',
      survivorName: 'Old Dead',
      status: 'pending'
    }]
  });

  assert.equal(normalized.pendingPrincipleChoice.group, 'death');
  assert.deepEqual(normalized.pendingPrincipleChoice.affectedIds, ['legacy-death']);
});

test('Protect the Young modifies intimacy odds and newborn HP', () => {
  const current = settlement({
    principles: { death: null, newLife: 'protectTheYoung', society: null }
  });
  const projections = calculateIntimacyProjections(current, {});
  const newborn = applyNewLifePrincipleToNewborn({ maxHp: 30, hp: 30, permanentModifiers: {} }, current);

  assert.equal(Number(projections.finalSuccessChance.toFixed(2)), 0.45);
  assert.equal(Number(projections.finalTragedyChance.toFixed(2)), 0.1);
  assert.equal(newborn.maxHp, 35);
  assert.equal(newborn.hp, 35);
});

test('Survival of the Fittest modifies tragedy odds, newborn damage, and max Survival', () => {
  const current = settlement({
    principles: { death: null, newLife: 'survivalOfTheFittest', society: null }
  });
  const projections = calculateIntimacyProjections(current, {});
  const newborn = applyNewLifePrincipleToNewborn({
    maxSurvival: 3,
    permanentModifiers: {}
  }, current);

  assert.equal(Number(projections.finalTragedyChance.toFixed(2)), 0.4);
  assert.equal(newborn.maxSurvival, 4);
  assert.equal(newborn.permanentModifiers.personalDamageBonus, 2);
});

test('Society principle choice appears at Lantern Year 5', () => {
  const normalized = settlement({ lanternYear: 5 });

  assert.equal(normalized.pendingPrincipleChoice.group, 'society');
  assert.equal(normalized.pendingPrincipleChoice.trigger, 'Lantern Year 5');
});

test('Embrace the Dark modifies rest odds and keeps total at 100', () => {
  const odds = getRestOutcomeOdds(settlement({
    principles: { death: null, newLife: null, society: 'embraceTheDark' }
  }), {
    negative: 30,
    neutral: 40,
    positive: 30
  });

  assert.deepEqual(odds, {
    negative: 20,
    neutral: 30,
    positive: 50,
    modified: true
  });
  assert.equal(odds.negative + odds.neutral + odds.positive, 100);
});
