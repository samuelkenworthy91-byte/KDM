import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASIC_RESOURCE_IDS,
  BODY_MATERIAL_TAGS,
  genericResourceIds,
  getGenericResourceDropWeight,
  getResourceMaterialTags,
  resourceCanPayMaterial,
  resources
} from '../src/data/resources.js';
import {
  getResourceRarityTier,
  isCommonHarvestResource
} from '../src/game/resourceRarityLogic.js';
import { buildHarvestRewardOffers } from '../src/game/harvestRewardLogic.js';

test('resource catalogue exposes exactly the six basic resources', () => {
  assert.deepEqual(BASIC_RESOURCE_IDS, ['bone', 'hide', 'organ', 'sinew', 'scrap', 'loveJuice']);
  assert.deepEqual(genericResourceIds, BASIC_RESOURCE_IDS);
  assert.deepEqual(BODY_MATERIAL_TAGS, ['bone', 'hide', 'organ']);

  BASIC_RESOURCE_IDS.forEach(resourceId => {
    assert.equal(resources[resourceId].basicResource, true, `${resourceId} should be basic`);
    assert.equal(getResourceRarityTier(resourceId), 'common');
    assert.equal(isCommonHarvestResource(resourceId), true);
  });
});

test('old generic resources are legacy-safe but no longer basic generic drops', () => {
  ['claw', 'fur', 'horn', 'ichor', 'monsterTooth', 'strangeEye'].forEach(resourceId => {
    assert.ok(resources[resourceId], `${resourceId} should remain for legacy saves`);
    assert.equal(resources[resourceId].basicResource, false, `${resourceId} should not be basic`);
    assert.equal(genericResourceIds.includes(resourceId), false, `${resourceId} should not be generic`);
    assert.equal(isCommonHarvestResource(resourceId), false, `${resourceId} should not be common generic harvest`);
  });
});

test('resource material tags support later body-slot payments', () => {
  assert.deepEqual(getResourceMaterialTags('bone'), ['bone']);
  assert.deepEqual(getResourceMaterialTags('hide'), ['hide']);
  assert.deepEqual(getResourceMaterialTags('organ'), ['organ']);
  assert.deepEqual(getResourceMaterialTags('sinew'), ['organ']);
  assert.deepEqual(getResourceMaterialTags('scrap'), ['scrap']);
  assert.deepEqual(getResourceMaterialTags('loveJuice'), ['organ']);

  assert.equal(resourceCanPayMaterial('sinew', 'organ'), true);
  assert.equal(resourceCanPayMaterial('loveJuice', 'organ'), true);
  assert.equal(resourceCanPayMaterial('scrap', 'bone'), false);
  assert.equal(resourceCanPayMaterial('stomachStone', 'bone'), true);
  assert.equal(resourceCanPayMaterial('stomachStone', 'organ'), true);
});

test('all resources have material tags and love juice has special use metadata', () => {
  Object.values(resources).forEach(resource => {
    assert.ok(Array.isArray(resource.materialTags), `${resource.id} needs materialTags`);
    assert.ok(resource.materialTags.length > 0, `${resource.id} needs at least one material tag`);
  });
  assert.equal(resources.loveJuice.specialUse, 'Future intimacy protection.');
});

test('generic drop weights make love juice rarer than the other basics', () => {
  assert.equal(getGenericResourceDropWeight('bone'), 60);
  assert.equal(getGenericResourceDropWeight('hide'), 60);
  assert.equal(getGenericResourceDropWeight('organ'), 60);
  assert.equal(getGenericResourceDropWeight('sinew'), 60);
  assert.equal(getGenericResourceDropWeight('scrap'), 45);
  assert.equal(getGenericResourceDropWeight('loveJuice'), 12);
  assert.ok(getGenericResourceDropWeight('loveJuice') < getGenericResourceDropWeight('scrap'));
  assert.equal(getGenericResourceDropWeight('claw'), 0);
});

test('generic harvest offers use only explicit basics and carry configured weights', () => {
  const seen = new Map();
  for (let index = 0; index < 80; index += 1) {
    buildHarvestRewardOffers({
      quarryId: 'paleHuntLion',
      quarryLevel: 1,
      offerSeed: `generic-pool-${index}`
    })
      .filter(offer => offer.source === 'generic')
      .forEach(offer => seen.set(offer.resourceId, offer));
  }

  assert.deepEqual([...seen.keys()].sort(), [...BASIC_RESOURCE_IDS].sort());
  seen.forEach(offer => {
    assert.equal(genericResourceIds.includes(offer.resourceId), true);
    assert.equal(offer.weightDebug.finalWeight, getGenericResourceDropWeight(offer.resourceId));
  });
});
