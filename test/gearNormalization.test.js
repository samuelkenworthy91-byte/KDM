import assert from 'node:assert/strict';
import test from 'node:test';

import {
  STARTER_CRAFTING_LOCATIONS,
  dedupeGearList,
  cleanGearDisplayName,
  getAllGearLocationIds,
  getArmouryDisplayLocationId,
  getGearStableId,
  getGearUnlockState,
  getVisibleGearLocationIds,
  groupGearByArmouryTab,
  hasDefeatedQuarry,
  normaliseCraftingLocation,
  normaliseCreatureSource
} from '../src/utils/gearNormalization.js';
import { equipment } from '../src/data/equipment.js';

function gear(overrides = {}) {
  return {
    id: 'testGear',
    name: 'Test Gear',
    cost: { bone: 1 },
    cardPackage: ['testCard'],
    ...overrides
  };
}

test('stable ids prefer canonical gear ids', () => {
  assert.equal(getGearStableId(gear({ id: 'BoneBlade', name: 'Renamed Blade' })), 'boneblade');
});

test('display names remove source prefixes', () => {
  assert.equal(cleanGearDisplayName('Imported - Bone Blade'), 'Bone Blade');
});

test('dedupe collapses aliases and cross-source copies without exposing deck cards', () => {
  const original = gear({ id: 'boneBlade', name: 'Bone Blade', buildingId: 'boneSmith' });
  const alias = { ...original };
  const importedCopy = gear({
    id: 'bone_blade_import',
    ourGameName: 'Bone Blade',
    ourCraftingLocation: 'Bone Smith'
  });
  const combatCard = { id: 'hack', name: 'Hack', type: 'attack', cost: 1 };

  const result = dedupeGearList([original, alias, importedCopy, combatCard]);

  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Bone Blade');
});

test('grouping uses readable building tabs and creature subgroups', () => {
  const item = gear({
    ourCraftingLocation: 'Catarium',
    kdmMonsterOrEventSource: 'White Lion'
  });
  const grouped = groupGearByArmouryTab([item]);

  assert.equal(normaliseCraftingLocation(item), 'Catarium');
  assert.equal(normaliseCreatureSource(item), 'paleHuntLion');
  assert.equal(grouped.Catarium.paleHuntLion.length, 1);
});

test('starter crafting locations are unlocked on fresh saves', () => {
  const item = gear({ buildingId: 'boneSmith' });
  const lockedSettlement = { builtInnovations: [], discoveredQuarries: [] };

  assert.deepEqual(STARTER_CRAFTING_LOCATIONS, ['boneSmith', 'skinnery', 'organGrinder']);
  assert.equal(getGearUnlockState(item, lockedSettlement).unlocked, true);
  assert.equal(groupGearByArmouryTab([item], lockedSettlement, { includeLocked: false })['Bone Smith'].General.length, 1);
});

test('unmapped creature craftables unlock from discovered quarry access', () => {
  const item = gear({
    buildingId: 'Cotton Mill',
    ourCraftingLocation: 'Cotton Mill',
    kdmMonsterOrEventSource: 'Spidicules'
  });

  assert.equal(
    getGearUnlockState(item, {
      builtInnovations: [],
      discoveredQuarries: ['silkMatriarch']
    }).unlocked,
    true
  );
});

test('active gear location ids come from the equipment array', () => {
  const ids = getAllGearLocationIds(equipment);
  ['boneSmith', 'skinnery', 'organGrinder', 'lionTrophyHall', 'crystalForge', 'prideHall'].forEach(id => {
    assert.ok(ids.includes(id), `${id} missing from active gear locations`);
  });
  assert.equal(equipment.length, 331);
});

test('fresh Armoury state shows starter locations when locked gear is hidden', () => {
  const visible = getVisibleGearLocationIds(equipment, { builtInnovations: [], discoveredQuarries: [] }, { includeLocked: false });
  assert.deepEqual(visible, ['boneSmith', 'organGrinder', 'skinnery']);

  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], discoveredQuarries: [] }, { includeLocked: false });
  assert.ok(grouped['Bone Smith']);
  assert.ok(grouped.Skinnery);
  assert.ok(grouped['Organ Grinder']);
  assert.ok(Object.values(grouped['Bone Smith']).flat().length > 0);
});

test('show locked gear exposes every active gear location', () => {
  const expected = [
    'antelopeLarder',
    'boneSmith',
    'chitinFoundry',
    'crystalForge',
    'duelistGarden',
    'lionTrophyHall',
    'organGrinder',
    'phoenixPyre',
    'prideHall',
    'redTannery',
    'shellSanctum',
    'silkLoom',
    'skinnery',
    'smogKiln',
    'stormShrine',
    'wetYard'
  ];
  assert.deepEqual(
    getVisibleGearLocationIds(equipment, { builtInnovations: [], discoveredQuarries: [] }, { includeLocked: true }),
    expected
  );

  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], discoveredQuarries: [] }, { includeLocked: true });
  assert.ok(Object.values(grouped['Crystal Forge']).flat().some(item => item.name === 'Dragon Slayer: Grand Cleaver'));
  assert.ok(Object.values(grouped['Pride Hall']).flat().some(item => item.name === 'Judgement Crown Helm'));
});

test('locked location gear is visible with locked gear enabled but remains locked', () => {
  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], discoveredQuarries: [] }, { includeLocked: true });
  const dragonSlayer = Object.values(grouped['Crystal Forge']).flat()
    .find(item => item.name === 'Dragon Slayer: Grand Cleaver');

  assert.ok(dragonSlayer);
  assert.equal(getGearUnlockState(dragonSlayer, { builtInnovations: [], discoveredQuarries: [] }).unlocked, false);
});

test('all consumables resolve to Organ Grinder for Armoury display', () => {
  const consumables = equipment.filter(item =>
    item.itemType === 'consumable' || item.loadoutCategory === 'consumable'
  );

  assert.equal(consumables.length, 33);
  consumables.forEach(item => {
    assert.equal(getArmouryDisplayLocationId(item), 'organGrinder', `${item.name} display location`);
    assert.equal(item.displayLocationId, 'organGrinder', `${item.name} data display location`);
  });
});

test('named consumables appear under Organ Grinder and not quarry buildings', () => {
  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], defeatedQuarryLevels: {} }, { includeLocked: true });
  const organRecipes = Object.values(grouped['Organ Grinder']).flat();
  const lionRecipes = Object.values(grouped['Lion Trophy Hall']).flat();
  const crystalRecipes = Object.values(grouped['Crystal Forge']).flat();

  assert.ok(organRecipes.some(item => item.name === 'Pale Mane Warpaint'));
  assert.ok(organRecipes.some(item => item.name === 'Elder Fang Oil'));
  assert.ok(organRecipes.some(item => item.name === 'Drakefire Oil'));
  assert.equal(lionRecipes.some(item => item.name === 'Pale Mane Warpaint'), false);
  assert.equal(lionRecipes.some(item => item.name === 'Elder Fang Oil'), false);
  assert.equal(crystalRecipes.some(item => item.name === 'Drakefire Oil'), false);
});

test('signature items remain in quarry buildings', () => {
  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], defeatedQuarryLevels: {} }, { includeLocked: true });

  assert.ok(Object.values(grouped['Lion Trophy Hall']).flat().some(item => item.name === 'Palechord Cleaver'));
  assert.ok(Object.values(grouped['Crystal Forge']).flat().some(item => item.name === 'Dragon Slayer: Grand Cleaver'));
  assert.ok(Object.values(grouped['Pride Hall']).flat().some(item => item.name === 'Judgement Crown Helm'));
});

test('locked quarry consumables hide unless locked gear is shown', () => {
  const settlement = { builtInnovations: [], defeatedQuarryLevels: {} };
  const hidden = groupGearByArmouryTab(equipment, settlement, { includeLocked: false });
  const shown = groupGearByArmouryTab(equipment, settlement, { includeLocked: true });

  assert.equal(Object.values(hidden['Organ Grinder']).flat().some(item => item.name === 'Pale Mane Warpaint'), false);
  const warpaint = Object.values(shown['Organ Grinder']).flat().find(item => item.name === 'Pale Mane Warpaint');
  assert.ok(warpaint);
  assert.deepEqual(Object.keys(shown['Organ Grinder']).sort(), [
    'Ash Phoenix Consumables',
    'Basic Consumables',
    'Bloated Godling Consumables',
    'Bloom Knight Consumables',
    'Chitin Crusader Consumables',
    'Crimson Crocodile Consumables',
    'Drake Emperor Consumables',
    'Frogdog Consumables',
    'Pale Hunt Lion Consumables',
    'Pride King Consumables',
    'Silk Matriarch Consumables',
    'Smog Singers Consumables',
    'Sun Sovereign Consumables',
    'Wailing Antelope Consumables'
  ]);
  assert.equal(getGearUnlockState(warpaint, settlement).unlocked, false);
  assert.equal(getGearUnlockState(warpaint, settlement).reason, 'Requires defeating Pale Hunt Lion once.');
});

test('quarry consumables unlock after matching quarry defeat', () => {
  const warpaint = equipment.find(item => item.name === 'Pale Mane Warpaint');
  const lockedSettlement = { builtInnovations: [], defeatedQuarryLevels: {} };
  const unlockedSettlement = { builtInnovations: [], defeatedQuarryLevels: { paleHuntLion: [1] } };

  assert.equal(hasDefeatedQuarry(lockedSettlement, 'paleHuntLion'), false);
  assert.equal(getGearUnlockState(warpaint, lockedSettlement).unlocked, false);
  assert.equal(hasDefeatedQuarry(unlockedSettlement, 'paleHuntLion'), true);
  assert.equal(getGearUnlockState(warpaint, unlockedSettlement).unlocked, true);
  assert.ok(Object.values(groupGearByArmouryTab(equipment, unlockedSettlement, { includeLocked: false })['Organ Grinder']).flat()
    .some(item => item.name === 'Pale Mane Warpaint'));
});

test('basic consumables remain visible in Organ Grinder on fresh saves', () => {
  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], defeatedQuarryLevels: {} }, { includeLocked: false });
  const basicConsumables = grouped['Organ Grinder']['Basic Consumables'];

  assert.ok(basicConsumables.some(item => item.name === 'Bone Broth Flask'));
  assert.ok(basicConsumables.some(item => item.name === 'Hide Poultice'));
  assert.ok(basicConsumables.some(item => item.name === 'Sinew Stitch Kit'));
});

test('Bone Smith exposes starter weapons', () => {
  const grouped = groupGearByArmouryTab(equipment, { builtInnovations: [], defeatedQuarryLevels: {} }, { includeLocked: false });
  const weapons = Object.values(grouped['Bone Smith']).flat().filter(item => item.itemType === 'weapon');

  assert.ok(weapons.length >= 1);
  assert.ok(weapons.some(item => item.name === 'Basic Sword'));
});

// Signature weapon tests
import { getMilestoneProgressText } from '../src/utils/signatureProgressHelper.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';
import { signatureItems } from '../src/data/gear/signatureItems.js';
import { canCraft } from '../src/game/craftingLogic.js';

test('signature item visible as locked target and building unlock alone does not make signature craftable', () => {
  const cleaver = equipment.find(item => item.id === 'palechord_cleaver');
  assert.ok(cleaver);

  const settlement = {
    builtInnovations: ['lionTrophyHall'],
    signatureProgress: {
      palechord_cleaver: { unlocked: false, level: 0, counters: {}, milestoneHistory: [] }
    }
  };

  const unlockState = getGearUnlockState(cleaver, settlement);
  assert.equal(unlockState.unlocked, false);
  assert.ok(unlockState.reason.startsWith('Signature Locked:'));
});

test('signature unlock condition makes item craftable if cost is affordable', () => {
  const cleaver = equipment.find(item => item.id === 'palechord_cleaver');
  assert.ok(cleaver);

  const settlement = {
    builtInnovations: ['lionTrophyHall'],
    signatureProgress: {
      palechord_cleaver: { unlocked: true, level: 1, counters: {}, milestoneHistory: [] }
    },
    stash: {
      paleLionClaw: 2,
      paleLionSinew: 2,
      paleLionMane: 2,
      elderPaleFang: 1,
      perfectMane: 1,
      bone: 2,
      scrap: 2
    }
  };

  const unlockState = getGearUnlockState(cleaver, settlement);
  assert.equal(unlockState.unlocked, true);
  assert.equal(canCraft(cleaver, settlement.stash), true);
});

test('existing normal gear remains craftable from buildings', () => {
  const basicSword = equipment.find(item => item.id === 'starter_sword');
  assert.ok(basicSword);

  const settlement = {
    builtInnovations: ['boneSmith']
  };

  const unlockState = getGearUnlockState(basicSword, settlement);
  assert.equal(unlockState.unlocked, true);
});

test('progress state migrates old saves', () => {
  const oldSave = {
    craftedGear: ['palechord_cleaver']
  };

  const normalized = normalizeSettlement(oldSave);
  assert.ok(normalized.signatureProgress);
  assert.ok(normalized.signatureProgress.palechord_cleaver);
  assert.equal(normalized.signatureProgress.palechord_cleaver.unlocked, true);
  assert.equal(normalized.signatureProgress.gorge_fist_knucklers.unlocked, false);
});

test('milestone progress helper returns readable progress', () => {
  const cleaver = signatureItems.find(item => item.id === 'palechord_cleaver');
  assert.ok(cleaver);

  const progress1 = { unlocked: false, level: 0, counters: { bleed_4_fights_won: 2 } };
  const res1 = getMilestoneProgressText(cleaver, progress1);
  assert.equal(res1.nextMilestone, 'Unlock (Level 1)');
  assert.equal(res1.progressText, '2/3');
  assert.equal(res1.requirement, 'Win 3 fights where the quarry had Bleed 4+ before it died.');

  const progress2 = { unlocked: true, level: 1, counters: { max_bleed_in_one_fight: 8 } };
  const res2 = getMilestoneProgressText(cleaver, progress2);
  assert.equal(res2.nextMilestone, 'Level 2');
  assert.equal(res2.progressText, '8/10');
  assert.equal(res2.requirement, 'Apply 10 total Bleed in one fight.');

  const progress3 = { unlocked: true, level: 2, counters: {} };
  const res3 = getMilestoneProgressText(cleaver, progress3);
  assert.equal(res3.nextMilestone, 'Level 3');
  assert.equal(res3.progressText, 'not yet tracked');
  assert.equal(res3.requirement, 'Defeat the Pale Hunt Lion while it has Bleed 6+.');

  const progress4 = { unlocked: true, level: 3, counters: {} };
  const res4 = getMilestoneProgressText(cleaver, progress4);
  assert.equal(res4.nextMilestone, 'None');
  assert.equal(res4.progressText, 'Max Level');
  assert.equal(res4.requirement, 'Fully evolved!');
});
