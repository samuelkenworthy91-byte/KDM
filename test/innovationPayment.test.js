import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyInnovationPayment,
  buildInnovationPaymentOptions,
  getInnovationPaymentWarnings,
  validateInnovationPayment
} from '../src/game/innovationPayment.js';

function settlement(overrides = {}) {
  return {
    memories: 3,
    settlementMemory: 3,
    memoryHistory: [],
    stash: {
      hide: 1,
      sinew: 1,
      bone: 1
    },
    ...overrides
  };
}

test('innovation payment options are material-tagged by slot', () => {
  const options = buildInnovationPaymentOptions(settlement({
    stash: {
      hide: 1,
      sinew: 1,
      stomachStone: 1,
      bone: 1,
      scrap: 3
    }
  }).stash);

  assert.ok(options.hide.some(option => option.resourceId === 'hide'));
  assert.ok(options.organ.some(option => option.resourceId === 'sinew'));
  assert.ok(options.organ.some(option => option.resourceId === 'stomachStone'));
  assert.ok(options.bone.some(option => option.resourceId === 'stomachStone'));
  assert.equal(options.hide.some(option => option.resourceId === 'scrap'), false);
  assert.equal(options.organ.some(option => option.resourceId === 'scrap'), false);
  assert.equal(options.bone.some(option => option.resourceId === 'scrap'), false);
});

test('one multi-tag resource unit cannot fill two innovation payment slots', () => {
  const current = settlement({
    stash: {
      hide: 1,
      stomachStone: 1
    }
  });

  const options = buildInnovationPaymentOptions(current.stash, {
    hide: 'hide',
    organ: 'stomachStone',
    bone: ''
  });

  assert.equal(options.bone.some(option => option.resourceId === 'stomachStone'), false);
  assert.equal(validateInnovationPayment(current, {
    hide: 'hide',
    organ: 'stomachStone',
    bone: 'stomachStone'
  }).valid, false);
});

test('duplicate multi-tag resources can fill multiple eligible slots when quantity allows', () => {
  const current = settlement({
    stash: {
      hide: 1,
      stomachStone: 2
    }
  });

  assert.equal(validateInnovationPayment(current, {
    hide: 'hide',
    organ: 'stomachStone',
    bone: 'stomachStone'
  }).valid, true);
});

test('innovation payment warns for quarry, rare, strange, level 3 rare, legacy, and loveJuice resources', () => {
  assert.ok(getInnovationPaymentWarnings('paleLionHide').some(text => text.includes('Quarry-specific')));
  assert.ok(getInnovationPaymentWarnings('stomachStone').some(text => text.includes('rare')));
  assert.ok(getInnovationPaymentWarnings('timeBone').some(text => text.includes('strange')));
  assert.ok(getInnovationPaymentWarnings('elderPaleFang').some(text => text.includes('Level 3 rare')));
  assert.ok(getInnovationPaymentWarnings('fur').some(text => text.includes('legacy')));
  assert.ok(getInnovationPaymentWarnings('loveJuice').some(text => text.includes('intimacy protection')));
});

test('innovation payment does not auto-spend without explicit selected slots', () => {
  const current = settlement();

  assert.equal(validateInnovationPayment(current, {}).valid, false);
  assert.equal(applyInnovationPayment(current, {}), null);
  assert.deepEqual(current.stash, { hide: 1, sinew: 1, bone: 1 });
  assert.equal(current.memories, 3);
});

test('innovation payment records a slot mapping and deducts one resource unit per slot', () => {
  const paid = applyInnovationPayment(settlement(), {
    memory: 1,
    hide: 'hide',
    organ: 'sinew',
    bone: 'bone'
  }, '2026-06-19T00:00:00.000Z');

  assert.deepEqual(paid.paidResources, {
    memory: 1,
    hide: 'hide',
    organ: 'sinew',
    bone: 'bone'
  });
  assert.equal(paid.memories, 2);
  assert.equal(paid.settlementMemory, 2);
  assert.equal(paid.stash.hide, 0);
  assert.equal(paid.stash.sinew, 0);
  assert.equal(paid.stash.bone, 0);
});
