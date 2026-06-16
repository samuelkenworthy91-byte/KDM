import test from 'node:test';
import assert from 'node:assert/strict';
import { resources } from '../src/data/resources.js';
import { quarryWeakPoints } from '../src/data/weakPoints.js';
import {
  buildHarvestRewardOffers,
  getHarvestBenefitLabels
} from '../src/game/harvestRewardLogic.js';
import {
  getResourceRarityTier,
  isCommonHarvestResource
} from '../src/game/resourceRarityLogic.js';
import { getWeakPointHarvestPreview } from '../src/data/weakPoints.js';

test('basic generic resources display as common harvest resources', () => {
  ['bone', 'hide', 'organ', 'sinew'].forEach(resourceId => {
    assert.equal(resources[resourceId].type, 'basic');
    assert.equal(getResourceRarityTier(resourceId), 'common');
    assert.equal(isCommonHarvestResource(resourceId), true);
  });
});

test('level 1 Pale Hunt Lion cannot offer level 3 rare parts by default', () => {
  const offers = buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    offerSeed: 'level-one-lion'
  });
  const ids = offers.map(offer => offer.resourceId);
  assert.equal(ids.includes('elderPaleFang'), false);
  assert.equal(ids.includes('whiteHeart'), false);
  assert.equal(ids.includes('perfectMane'), false);
  assert.ok(ids.some(id => getResourceRarityTier(id) === 'common'));
  assert.ok(ids.some(id => getResourceRarityTier(id) === 'creature'));
});

test('generic common candidates outweigh creature-specific candidates by default', () => {
  const offers = buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    offerSeed: 'weight-debug'
  });
  const common = offers.find(offer => offer.source === 'generic');
  const creature = offers.find(offer => offer.source === 'quarryPool');
  assert.ok(common || creature);
  if (common && creature) {
    assert.ok(common.weightDebug.finalWeight > creature.weightDebug.finalWeight);
  }
});

test('clean preferred weak-point break increases creature-specific odds', () => {
  const weakPoint = quarryWeakPoints.paleHuntLion.find(point => point.id === 'rakingClaws');
  const offers = buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 2,
    harvestResults: [{
      weakPointId: weakPoint.id,
      weakPointName: weakPoint.name,
      quality: 'clean',
      harvestProfile: weakPoint.harvestProfile
    }],
    offerSeed: 'clean-claw'
  });
  assert.ok(offers.some(offer => offer.source === 'weakPoint' && offer.reason.includes('Clean break')));
});

test('ruined break mostly offers common fallback or generic resources', () => {
  const weakPoint = quarryWeakPoints.paleHuntLion.find(point => point.id === 'hungryBody');
  const offers = buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 2,
    harvestResults: [{
      weakPointId: weakPoint.id,
      weakPointName: weakPoint.name,
      quality: 'ruined',
      harvestProfile: weakPoint.harvestProfile
    }],
    offerSeed: 'ruined-body'
  });
  assert.ok(offers.every(offer => !['rare', 'strange', 'level3Rare'].includes(offer.rarityTier)));
  assert.ok(offers.some(offer => ['fallback', 'generic'].includes(offer.source)));
});

test('weak-point preview labels perfect range, overkill, and tool suitability', () => {
  const fragile = quarryWeakPoints.paleHuntLion.find(point => point.id === 'paleHead');
  const perfect = getWeakPointHarvestPreview({
    weakPoint: fragile,
    breakDamage: fragile.breakValue,
    weaponType: 'dagger',
    cardTags: ['precise']
  });
  assert.ok(perfect.labels.includes('Perfect range: likely clean break.'));
  assert.ok(perfect.labels.includes('Preferred tool: this weapon type improves clean harvest odds.'));

  const overkill = getWeakPointHarvestPreview({
    weakPoint: fragile,
    breakDamage: fragile.breakValue + Math.ceil(fragile.breakValue * 0.5),
    weaponType: 'hammer',
    cardTags: ['heavy']
  });
  assert.ok(overkill.labels.includes('Overkill warning: may mutilate delicate parts and reduce rare/specific loot.'));
  assert.ok(overkill.labels.includes('Poor tool: this weapon type may damage the part.'));
});

test('harvest benefit labels surface gear and card harvest hooks', () => {
  const labels = getHarvestBenefitLabels({
    testBonus: 3,
    salvage: 1,
    consequenceReduction: 2,
    opensWeakPoint: true,
    quirk: 'careful',
    tags: ['Harvest', 'Precise']
  });
  assert.ok(labels.some(label => label.includes('Harvest: +3')));
  assert.ok(labels.some(label => label.includes('Salvage')));
  assert.ok(labels.some(label => label.includes('Precision')));
  assert.ok(labels.some(label => label.includes('Weak Point')));
});

test('offer seeds randomise between fights and remain stable for same seed', () => {
  const first = buildHarvestRewardOffers({ quarryId: 'paleHuntLion', quarryLevel: 1, offerSeed: 'fight-a' });
  const same = buildHarvestRewardOffers({ quarryId: 'paleHuntLion', quarryLevel: 1, offerSeed: 'fight-a' });
  const second = buildHarvestRewardOffers({ quarryId: 'paleHuntLion', quarryLevel: 1, offerSeed: 'fight-b' });
  assert.deepEqual(first, same);
  assert.notDeepEqual(first, second);
});
