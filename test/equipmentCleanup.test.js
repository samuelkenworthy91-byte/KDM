import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import gearSource from '../gear_master_overhaul.json' with { type: 'json' };
import deckCardSource from '../all_deck_cards.json' with { type: 'json' };
import {
  cards,
  legacyCompatibilityCardIds,
  legacyCompatibilityCards
} from '../src/data/cards.js';
import {
  gearCardPackages,
  legacyCompatibilityGearCardPackages
} from '../src/data/gearCards.js';
import { gearRegistry } from '../src/data/overhaul/gearRegistry.js';
import {
  equipment,
  equipmentList,
  getEquipment,
  legacyCompatibilityEquipment,
  validateEquipmentCardPackages,
  validateEquipmentIds
} from '../src/data/equipment.js';
import { canCraft } from '../src/game/craftingLogic.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import {
  createSurvivor,
  defaultSettlement,
  normalizeSettlement
} from '../src/game/saveLogic.js';
import {
  cleanGearDisplayName,
  groupGearByArmouryTab
} from '../src/utils/gearNormalization.js';

const legacyRecipeIds = [
  'boneBlade',
  'boneHammer',
  'hideWraps',
  'rawhideVest',
  'rawhideBoots',
  'monsterGrease',
  'clawCharm'
];

const oldPlaceholderCardIds = [
  'hack',
  'carve',
  'guardBreak',
  'boneDart',
  'quickToss',
  'rawhideDodge',
  'clawStrike',
  'ripOpen'
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

test('equipment list has unique ids and resolves known source duplicates', () => {
  assert.deepEqual(validateEquipmentIds().duplicateIds, []);
  assert.equal(equipmentList.filter(item => item.id === 'acidToothKnife').length, 1);
  assert.equal(equipmentList.filter(item => item.name === 'Amber Cello').length, 1);
});

test('v8 imported gear is craftable and old handcrafted gear is compatibility-only', () => {
  const current = equipment.acidToothKnife;
  assert.equal(current.deprecated, false);
  assert.equal(current.hiddenFromCrafting, false);
  assert.equal(equipmentList.some(item => item.id === current.id), true);
  assert.equal(canCraft(current, current.cost), true);
  assert.equal(equipment.amberBow?.name, 'Amber Bow');
  legacyRecipeIds.forEach(id => {
    assert.equal(equipment[id], undefined);
    assert.equal(equipmentList.some(item => item.id === id), false);
    if (legacyCompatibilityEquipment[id]) {
      assert.match(getEquipment(id).name, /Legacy gear/);
    }
  });
  assert.equal(getEquipment('removedGearId').name, 'Unknown / Legacy gear');
});

test('display-name cleanup strips import and user prefixes without changing ids', () => {
  assert.equal(cleanGearDisplayName('[Imported: archive] Bone Blade'), 'Bone Blade');
  assert.equal(cleanGearDisplayName('source: Wailing Horn Bow'), 'Wailing Horn Bow');
  assert.equal(cleanGearDisplayName('@builder - Ash Mantle'), 'Ash Mantle');
  assert.equal(equipment.acidToothKnife.id, 'acidToothKnife');
});

test('old saves retain deprecated and unknown gear safely', () => {
  const survivor = createSurvivor('Legacy Bearer');
  survivor.boundGear = [
    { instanceId: 'bound-legacy', equipmentId: 'boneBlade' },
    { instanceId: 'bound-unknown', equipmentId: 'removedGearId' }
  ];
  const normalized = normalizeSettlement({
    ...defaultSettlement,
    survivors: [survivor],
    activeSurvivorId: survivor.id,
    armory: [{ instanceId: 'stored-legacy', equipmentId: 'boneBlade' }]
  });

  assert.equal(normalized.armory[0].equipmentId, 'boneBlade');
  assert.equal(normalized.survivors[0].boundGear.length, 2);
  assert.equal(getEquipment('removedGearId').name, 'Unknown / Legacy gear');
});

test('Acid Tooth Knife uses v8 card ids, not old placeholder cards', () => {
  const acid = equipment.acidToothKnife;
  assert.ok(acid);
  assert.ok(acid.cardPackage.length > 0);
  assert.deepEqual(
    acid.cardPackage.filter(cardId => oldPlaceholderCardIds.includes(cardId)),
    []
  );
  acid.cardPackage.forEach(cardId => {
    assert.equal(cards[cardId]?.sourceType, 'gear');
    assert.equal(cards[cardId]?.legacyCompatibility, undefined);
  });
});

test('normal cards exclude old placeholder cards and keep them in compatibility only', () => {
  oldPlaceholderCardIds.forEach(cardId => {
    assert.ok(legacyCompatibilityCardIds.includes(cardId));
    assert.equal(cards[cardId], undefined);
    assert.equal(legacyCompatibilityCards[cardId]?.sourceType, 'legacyCompatibility');
    assert.equal(legacyCompatibilityCards[cardId]?.legacyCompatibility, true);
  });
});

test('normal gear card packages exclude handcrafted packages', () => {
  ['boneBlade', 'boneHammer', 'hideWraps', 'monsterGrease', 'clawCharm'].forEach(id => {
    assert.equal(gearCardPackages[id], undefined);
    assert.ok(legacyCompatibilityGearCardPackages[id]?.length > 0);
  });
});

test('Armoury grouping uses v8 equipment and excludes handcrafted craftables', () => {
  const settlement = {
    builtInnovations: ['boneSmith', 'skinnery', 'organGrinder'],
    discoveredQuarries: []
  };
  const normal = groupGearByArmouryTab(equipmentList, settlement);
  const review = groupGearByArmouryTab(Object.values(equipment), settlement, {
    includeHidden: true
  });
  const normalRecipes = Object.values(normal).flatMap(sourceGroups => Object.values(sourceGroups).flat());

  assert.equal(normal['Legacy / Hidden Review'], undefined);
  assert.equal(review['Legacy / Hidden Review'], undefined);
  assert.ok(normalRecipes.some(item => item.id === 'acidToothKnife'));
  assert.ok(normalRecipes.some(item => item.id === 'amberBow'));
  legacyRecipeIds.forEach(id => {
    assert.equal(normalRecipes.some(item => item.id === id), false);
  });
});

test('active gear packages resolve to runtime cards', () => {
  const validation = validateEquipmentCardPackages();
  assert.deepEqual(validation.missingCardIds, []);
  assert.deepEqual(validation.equipmentWithNoCardPackage, []);
});

test('normal equipment is sourced from v8 gear registry', () => {
  const excludedCurrentIds = legacyRecipeIds.filter(id => gearRegistry.some(item => item.id === id));
  assert.equal(equipmentList.length, gearRegistry.length - excludedCurrentIds.length);
  assert.ok(equipmentList.length >= 300);
  equipmentList.forEach(item => {
    assert.equal(item.currentSource, 'v8GearRegistry');
    assert.equal(item.deprecated, false);
    assert.equal(item.hiddenFromCrafting, false);
  });
});

test('legacy equipped gear resolves compatibility cards without adding them to normal cards', () => {
  const survivor = createSurvivor('Legacy Fighter');
  const deck = buildRunDeck({
    survivor,
    equippedGear: [{ instanceId: 'legacy-bone-blade', equipmentId: 'boneBlade' }]
  });

  assert.equal(cards.hack, undefined);
  assert.ok(deck.some(card => card.legacyCompatibility));
});
