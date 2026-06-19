import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { cards } from '../src/data/cards.js';
import { equipment, equipmentList, getEquipment, validateEquipmentCardPackages, validateEquipmentIds } from '../src/data/equipment.js';
import { consumables } from '../src/data/gear/consumables.js';
import { normalQuarryCards, normalQuarryGear } from '../src/data/gear/normalQuarryGear.js';
import { signatureItems } from '../src/data/gear/signatureItems.js';
import { starterSupportGear } from '../src/data/gear/starterSupportGear.js';
import { starterWeapons } from '../src/data/gear/starterWeapons.js';
import { resources } from '../src/data/resources.js';
import { canCraft } from '../src/game/craftingLogic.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import { cleanupConsumedCards, createCombatState, playCard } from '../src/game/combatLogic.js';
import { createSurvivor } from '../src/game/saveLogic.js';
import { events } from '../src/data/events.js';
import { groupGearByArmouryTab } from '../src/utils/gearNormalization.js';

const oldGearIds = [
  'acidToothKnife',
  'amberBow',
  'boneBlade',
  'boneHammer',
  'hideWraps',
  'rawhideVest',
  'monsterGrease',
  'clawCharm',
  'emberCrown'
];

const deletedWeaponTypes = new Set(['club', 'hammer', 'scythe', 'strangeWeapon']);
const fullSuiteLocations = [
  'lionTrophyHall',
  'antelopeLarder',
  'phoenixPyre',
  'stormShrine',
  'redTannery',
  'wetYard',
  'silkLoom',
  'duelistGarden',
  'smogKiln',
  'chitinFoundry',
  'crystalForge',
  'shellSanctum',
  'prideHall'
];

function flattenChoices() {
  return events.flatMap(event => event.choices || []);
}

function normalGearAt(locationId) {
  return normalQuarryGear.filter(item => item.buildingId === locationId);
}

function namesAt(locationId) {
  return normalGearAt(locationId).map(item => item.name);
}

function assertLocationContains(locationId, names) {
  const found = namesAt(locationId);
  names.forEach(name => assert.ok(found.includes(name), `${locationId} missing ${name}`));
}

test('active equipment catalogue is the new curated gear only', () => {
  assert.equal(Array.isArray(equipment), true);
  assert.ok(equipment.length > 0);
  assert.equal(typeof equipment.map, 'function');
  assert.equal(typeof equipment.filter, 'function');
  assert.deepEqual(validateEquipmentIds().duplicateIds, []);
  assert.equal(equipmentList.length, signatureItems.length + consumables.length + starterWeapons.length + starterSupportGear.length + normalQuarryGear.length);
  equipment.forEach(item => {
    assert.ok(item.id);
    assert.ok(item.name);
    assert.ok(
      item.buildingId || item.locationId || item.craftingLocationId,
      `${item.id} has no crafting location field`
    );
  });
  assert.ok(equipment.palechord_cleaver);
  assert.ok(equipment.stormglass_lantern);
  assert.ok(equipment.judgement_crown_helm);
  oldGearIds.forEach(id => {
    assert.equal(equipment[id], undefined);
    assert.equal(equipmentList.some(item => item.id === id), false);
  });
  equipmentList.forEach(item => {
    assert.equal(item.currentSource, 'gearOverhaulCatalog');
    assert.equal(item.hiddenFromCrafting, false);
    assert.equal(item.deprecated, false);
  });
});

test('full normal quarry gear catalogue is present', () => {
  assert.equal(normalQuarryGear.length, 273);
  assert.equal(Object.keys(normalQuarryCards).length, 637);
  assert.ok(equipment.length > 46);
  assert.ok(Object.keys(cards).length >= 637);
});

test('each quarry building has a complete normal suite', () => {
  fullSuiteLocations.forEach(locationId => {
    const items = normalGearAt(locationId);
    assert.equal(items.length, 21, `${locationId} normal item count`);
    assert.equal(items.filter(item => item.itemType === 'weapon').length, 11, `${locationId} weapons`);
    assert.equal(items.filter(item => item.itemType === 'armor').length, 5, `${locationId} armour`);
    assert.equal(items.filter(item => item.itemType === 'instrument').length, 1, `${locationId} instrument`);
    assert.equal(items.filter(item => item.itemType === 'tool').length, 4, `${locationId} tools`);
    assert.ok(equipmentList.some(item => item.buildingId === locationId && item.keywords?.includes('Signature')), `${locationId} missing signature item`);
  });
});

test('DOCX named normal quarry gear examples are present', () => {
  assertLocationContains('lionTrophyHall', [
    'Moon-Wait Blade',
    'Mane-Splitter',
    'Quiet Fang',
    'Prowler Hide Head',
    'Prowler Hide Chest',
    'Den-Hum Drum',
    'Mane Snare Kit',
    'Pounce Hook'
  ]);
  assertLocationContains('silkLoom', [
    'Web-Drawn Katana',
    'Widowline Lash',
    'Broodweb Head',
    'Broodweb Chest',
    'Spinneret Harp',
    'Bind-Wound Needle',
    'Spider Eye Lens'
  ]);
  assertLocationContains('crystalForge', [
    'Molten-Edict Katana',
    'Crystal Crown Sword',
    'Emperor Flame Maul',
    'Imperial Crystal Head',
    'Imperial Crystal Chest',
    'Crownfire Organ',
    'Fire Gland Injector',
    'Imperial Horn Compass'
  ]);
  assertLocationContains('prideHall', [
    'Perfect Dominion Katana',
    'Crownless Sword',
    'Royal Maul Greatweapon',
    'Royal Mane Head',
    'Royal Mane Chest',
    'Judgment Horn',
    'Judgment Eye Lens',
    'Regal Hide Banner'
  ]);
});

test('normal quarry weapon types stay within the curated set', () => {
  const badWeaponTypes = equipmentList.filter(item => deletedWeaponTypes.has(item.weaponType));
  assert.deepEqual(badWeaponTypes.map(item => `${item.name}: ${item.weaponType}`), []);

  const maulsAndHammers = normalQuarryGear.filter(item => /maul|hammer/i.test(item.name));
  assert.ok(maulsAndHammers.length > 0);
  maulsAndHammers.forEach(item => {
    assert.equal(item.weaponType, 'grandWeapon', `${item.name} should be grandWeapon`);
  });
});

test('signature items and cards match the new weapon plan', () => {
  assert.equal(signatureItems.length, 13);
  signatureItems.forEach(item => {
    assert.equal(item.implemented, true);
    assert.equal(item.cardPackage.length, 3);
    item.cardPackage.forEach(cardId => assert.ok(cards[cardId], `${item.id} missing ${cardId}`));
  });
  signatureItems
    .filter(item => item.itemType === 'weapon')
    .forEach(item => assert.equal(deletedWeaponTypes.has(item.weaponType), false));
  const dragonSlayer = signatureItems.find(item => item.name === 'Dragon Slayer: Grand Cleaver');
  assert.ok(dragonSlayer);
  assert.equal(equipment.dragon_slayer_grand_cleaver.name, 'Dragon Slayer: Grand Cleaver');
  assert.equal(dragonSlayer.weaponType, 'grandWeapon');
});

test('all crafting costs and card packages resolve', () => {
  const validation = validateEquipmentCardPackages();
  assert.deepEqual(validation.missingCardIds, []);
  assert.deepEqual(validation.equipmentWithNoCardPackage, []);
  equipmentList.forEach(item => {
    Object.keys(item.cost || {}).forEach(resourceId => {
      assert.ok(resources[resourceId], `${item.id} uses invalid resource ${resourceId}`);
    });
  });
});

test('Armoury grouping exposes new gear and no old recipes', () => {
  const grouped = groupGearByArmouryTab(equipmentList, {
    builtInnovations: ['lionTrophyHall', 'stormShrine', 'prideHall', 'organGrinder', 'skinnery', 'boneSmith'],
    discoveredQuarries: []
  });
  const recipes = Object.values(grouped).flatMap(sourceGroups => Object.values(sourceGroups).flat());
  assert.ok(recipes.some(item => item.id === 'palechord_cleaver'));
  assert.ok(recipes.some(item => item.id === 'stormglass_lantern'));
  assert.ok(recipes.some(item => item.id === 'judgement_crown_helm'));
  oldGearIds.forEach(id => assert.equal(recipes.some(item => item.id === id), false));
});

test('unknown old save gear is inert and does not add cards', () => {
  const placeholder = getEquipment('oldSaveItemId');
  assert.equal(placeholder.name, 'Unknown Legacy Item');
  assert.equal(placeholder.hiddenFromCrafting, true);
  assert.deepEqual(placeholder.cardPackage, []);
  assert.equal(canCraft(placeholder, {}), false);

  const deck = buildRunDeck({
    survivor: createSurvivor('Legacy Fighter'),
    equippedGear: [{ instanceId: 'old-instance', equipmentId: 'oldSaveItemId' }]
  });
  assert.equal(deck.some(card => card.sourceGearId === 'oldSaveItemId'), false);
});

test('equipping new gear adds its card package to the deck', () => {
  const deck = buildRunDeck({
    survivor: createSurvivor('Axe Fighter'),
    equippedGear: [{ instanceId: 'gear-axe', equipmentId: 'palechord_cleaver' }]
  });
  equipment.palechord_cleaver.cardPackage.forEach(cardId => {
    assert.ok(deck.some(card => card.id === cardId && card.sourceGearId === 'palechord_cleaver'));
  });
});

test('consumables are craftable and move to Lost when played', () => {
  const item = equipment.bone_broth_flask;
  assert.equal(canCraft(item, item.cost), true);
  const deck = buildRunDeck({
    survivor: createSurvivor('Hungry Fighter'),
    equippedGear: [{ instanceId: 'gear-broth', equipmentId: item.id }]
  });
  const consumable = deck.find(card => card.id === 'consumable_bone_broth');
  const state = createCombatState(undefined, { runDeck: [] });
  const played = playCard(0, {
    ...state,
    hand: [consumable],
    drawPile: [],
    discardPile: [],
    lostPile: [],
    consumedCardInstanceIds: [],
    boundGear: [{ instanceId: 'gear-broth', equipmentId: item.id }]
  });
  assert.equal(played.discardPile.some(card => card.id === consumable.id), false);
  assert.equal(played.lostPile.some(card => card.id === consumable.id), true);
  assert.ok(played.consumedCardInstanceIds.includes(consumable.instanceId));

  const cleaned = cleanupConsumedCards(played);
  assert.equal(cleaned.lostPile.some(card => card.id === consumable.id), false);
  assert.equal(cleaned.boundGear.some(gear => gear.instanceId === 'gear-broth'), false);
});

test('Second Stomach can recover a consumable from Lost', () => {
  const state = createCombatState(undefined, { runDeck: [] });
  const consumable = {
    ...cards.consumable_bone_broth,
    instanceId: 'card-consumable',
    gearInstanceId: 'gear-broth'
  };
  const played = playCard(0, {
    ...state,
    hand: [{ ...cards.signature_second_stomach, instanceId: 'second-stomach' }],
    drawPile: [],
    discardPile: [],
    lostPile: [consumable],
    consumedCardInstanceIds: ['card-consumable']
  });
  assert.ok(played.hand.some(card => card.instanceId === 'card-consumable'));
  const replayed = playCard(0, { ...played, hand: [played.hand.find(card => card.instanceId === 'card-consumable')] });
  assert.ok(replayed.lostPile.some(card => card.instanceId === 'card-consumable'));
  assert.ok(replayed.consumedCardInstanceIds.includes('card-consumable'));
});

test('non-consumables are not deleted by Lost cleanup', () => {
  const card = { ...cards.signature_raking_chord, instanceId: 'signature-card', gearInstanceId: 'gear-axe' };
  const cleaned = cleanupConsumedCards({
    hand: [card],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    lostPile: [],
    runDeck: [card],
    boundGear: [{ instanceId: 'gear-axe', equipmentId: 'palechord_cleaver' }],
    consumedCardInstanceIds: []
  });
  assert.ok(cleaned.hand.some(item => item.instanceId === 'signature-card'));
  assert.ok(cleaned.boundGear.some(item => item.instanceId === 'gear-axe'));
});

test('event locked choices do not reference deleted gear ids or weapon types', () => {
  flattenChoices().forEach(choice => {
    const text = JSON.stringify(choice.lockedUnless || {});
    oldGearIds.forEach(id => assert.equal(text.includes(id), false, `${choice.id} references ${id}`));
    deletedWeaponTypes.forEach(type => assert.equal(text.includes(type), false, `${choice.id} references ${type}`));
    assert.doesNotMatch(choice.lockedText || '', /weaponType:|strangeWeapon|hammer|scythe|club/);
  });
});

test('old gear registry sources are not active imports', () => {
  [
    '../src/data/equipment.js',
    '../src/data/gear/gearCatalog.js',
    '../src/data/gear/gearCards.js'
  ].forEach(path => {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /gear_master_overhaul\.json/);
    assert.doesNotMatch(source, /all_deck_cards\.json/);
    assert.doesNotMatch(source, /gear_card_package_table\.json/);
    assert.doesNotMatch(source, /overhaul\/gearRegistry/);
    assert.doesNotMatch(source, /overhaul\/cardRegistry/);
  });
});
