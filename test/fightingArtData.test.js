import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fightingArts,
  generalFightingArts,
  getMonsterBaneId,
  isMonsterBaneId
} from '../src/data/fightingArts.js';

test('new situational fighting arts use hook definitions', () => {
  const expected = [
    'blueKnuckleDoctrine',
    'secondKnifeTruth',
    'harvestWithoutMercy',
    'purpleGutInstinct'
  ];

  expected.forEach(id => {
    assert.ok(fightingArts[id], `${id} is registered`);
    assert.ok(Object.keys(fightingArts[id].hooks || {}).length > 0, `${id} has hook data`);
    assert.equal(fightingArts[id].implemented, true);
  });
});

test('Second Knife Truth tracks card practice with survivor, gear instance, and card id requirements', () => {
  const art = fightingArts.secondKnifeTruth;

  assert.deepEqual(art.hooks.cardPlayed, {
    type: 'recordGearCardPractice',
    cardTypes: ['attack'],
    sameGearAsPrevious: true
  });
  assert.ok(art.passiveEffects.some(effect => effect.type === 'sameGearSecondAttackBreakBonus'));
});

test('Harvest Without Mercy hooks harvest quality and Panic without affinity inflation', () => {
  const art = fightingArts.harvestWithoutMercy;
  const hookTypes = art.hooks.harvestRolled.map(hook => hook.type);

  assert.deepEqual(hookTypes, ['improveHarvestQuality', 'addPanicToDiscard']);
  assert.equal('affinityBonus' in art, false);
  assert.equal('affinityTotals' in art, false);
});

test('Monster Bane IDs remain locked, unforgettable, and outside the general art pool', () => {
  const id = getMonsterBaneId('paleHuntLion');
  const art = fightingArts[id];

  assert.equal(isMonsterBaneId(id), true);
  assert.equal(art.locked, true);
  assert.equal(art.unforgettable, true);
  assert.equal(generalFightingArts.some(candidate => candidate.id === id), false);
});
