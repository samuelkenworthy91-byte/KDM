import assert from 'node:assert/strict';
import test from 'node:test';

import {
  dedupeGearList,
  cleanGearDisplayName,
  getGearStableId,
  getGearUnlockState,
  groupGearByArmouryTab,
  normaliseCraftingLocation,
  normaliseCreatureSource
} from '../src/utils/gearNormalization.js';

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

test('known buildings are locked until built and hidden by default grouping', () => {
  const item = gear({ buildingId: 'boneSmith' });
  const lockedSettlement = { builtInnovations: [], discoveredQuarries: [] };
  const unlockedSettlement = { builtInnovations: ['boneSmith'], discoveredQuarries: [] };

  assert.equal(getGearUnlockState(item, lockedSettlement).unlocked, false);
  assert.equal(getGearUnlockState(item, unlockedSettlement).unlocked, true);
  assert.deepEqual(
    groupGearByArmouryTab([item], lockedSettlement, { includeLocked: false }),
    {}
  );
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
