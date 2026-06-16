import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import deckCardSource from '../all_deck_cards.json' with { type: 'json' };
import gearSource from '../gear_master_overhaul.json' with { type: 'json' };
import { cards } from '../src/data/cards.js';
import { gearCardPackages, legacyCompatibilityGearCardPackages } from '../src/data/gearCards.js';
import {
  equipment,
  equipmentList,
  getEquipment,
  validateEquipmentCardPackages,
  validateEquipmentIds
} from '../src/data/equipment.js';
import { canCraft } from '../src/game/craftingLogic.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import { createSurvivor } from '../src/game/saveLogic.js';
import { groupGearByArmouryTab } from '../src/utils/gearNormalization.js';

const oldRecipeIds = [
  'boneBlade',
  'boneHammer',
  'hideWraps',
  'rawhideVest',
  'monsterGrease',
  'clawCharm'
];

const oldHandcraftedCardIds = [
  'carefulCut',
  'nickWeakSpot',
  'boneEdge',
  'crackGuard',
  'heavyStagger',
  'skullRattle',
  'wrapAndRoll',
  'slipFree',
  'greaseTheBlade',
  'charmOfTeeth',
  'followTheMark'
];

test('v8 source JSON files are populated and registry imports gear master', () => {
  assert.ok(Array.isArray(gearSource));
  assert.ok(Array.isArray(deckCardSource));
  assert.ok(gearSource.length >= 300);
  assert.ok(deckCardSource.length >= 700);
  assert.ok(gearSource.some(item => item.ourGameName === 'Acid Tooth Knife'));
  assert.ok(gearSource.some(item => item.ourGameName === 'Amber Bow'));

  const registrySource = readFileSync(new URL('../src/data/overhaul/gearRegistry.js', import.meta.url), 'utf8');
  assert.match(registrySource, /gear_master_overhaul\.json/);
  assert.doesNotMatch(registrySource, /\.agents\/gear-card-overhaul\/gear_card_package_table\.json/);
});

test('normal equipment is v8 current gear and excludes old recipe ids', () => {
  assert.deepEqual(validateEquipmentIds().duplicateIds, []);
  assert.ok(equipment.acidToothKnife);
  assert.ok(equipment.amberBow);
  assert.equal(equipment.acidToothKnife.name, 'Acid Tooth Knife');
  assert.equal(equipment.amberBow.name, 'Amber Bow');
  assert.equal(canCraft(equipment.acidToothKnife, equipment.acidToothKnife.cost), true);

  equipmentList.forEach(item => {
    assert.equal(item.currentSource, 'v8GearRegistry');
    assert.equal(item.hiddenFromCrafting, false);
    assert.equal(item.deprecated, false);
  });
  oldRecipeIds.forEach(id => {
    assert.equal(equipment[id], undefined);
    assert.equal(equipmentList.some(item => item.id === id), false);
  });
});

test('normal cards and gear card packages exclude handcrafted legacy data', () => {
  oldHandcraftedCardIds.forEach(cardId => {
    assert.equal(cards[cardId], undefined);
  });
  oldRecipeIds.forEach(id => {
    assert.equal(gearCardPackages[id], undefined);
    assert.equal(legacyCompatibilityGearCardPackages[id], undefined);
  });
});

test('Armoury grouping contains v8 gear and not old handcrafted recipes', () => {
  const settlement = {
    builtInnovations: ['boneSmith', 'skinnery', 'organGrinder'],
    discoveredQuarries: []
  };
  const grouped = groupGearByArmouryTab(
    equipmentList.filter(item => item.currentSource === 'v8GearRegistry'),
    settlement
  );
  const recipes = Object.values(grouped).flatMap(sourceGroups => Object.values(sourceGroups).flat());

  assert.ok(recipes.some(item => item.id === 'acidToothKnife'));
  assert.ok(recipes.some(item => item.id === 'amberBow'));
  oldRecipeIds.forEach(id => {
    assert.equal(recipes.some(item => item.id === id), false);
  });
});

test('unknown old save gear becomes a generic uncrafteable placeholder', () => {
  const placeholder = getEquipment('oldSaveItemId');
  assert.equal(placeholder.name, 'Unknown Legacy Item');
  assert.equal(placeholder.currentSource, 'legacyPlaceholder');
  assert.equal(placeholder.hiddenFromCrafting, true);
  assert.deepEqual(placeholder.cardPackage, []);
  assert.equal(canCraft(placeholder, {}), false);
});

test('old save gear references do not add legacy cards to the runtime deck', () => {
  const survivor = createSurvivor('Legacy Fighter');
  const deck = buildRunDeck({
    survivor,
    equippedGear: [{ instanceId: 'old-instance', equipmentId: 'oldSaveItemId' }]
  });

  assert.equal(deck.some(card => card.sourceGearId === 'oldSaveItemId'), false);
});

test('active v8 gear packages resolve to runtime cards', () => {
  const validation = validateEquipmentCardPackages();
  assert.deepEqual(validation.missingCardIds, []);
  assert.deepEqual(validation.equipmentWithNoCardPackage, []);
});
