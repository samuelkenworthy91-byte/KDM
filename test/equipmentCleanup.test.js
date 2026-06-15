import assert from 'node:assert/strict';
import test from 'node:test';

import {
  equipment,
  equipmentList,
  getEquipment,
  resolvedDuplicateRecipeIds,
  validateEquipmentIds,
  validateGearVariety
} from '../src/data/equipment.js';
import { canCraft } from '../src/game/craftingLogic.js';
import {
  createSurvivor,
  defaultSettlement,
  normalizeSettlement
} from '../src/game/saveLogic.js';
import {
  cleanGearDisplayName,
  groupGearByArmouryTab
} from '../src/utils/gearNormalization.js';

const knownDuplicateIds = [
  'maneCloak',
  'catEyeCharm',
  'wailingHornBow',
  'stomachStoneCharm',
  'trampleBoots',
  'ashFeatherMantle',
  'timeBoneBlade',
  'memoryGlassEye'
];

test('equipment list has unique ids and resolves known source duplicates', () => {
  assert.deepEqual(validateEquipmentIds().duplicateIds, []);
  assert.deepEqual(
    [...resolvedDuplicateRecipeIds].sort(),
    [...knownDuplicateIds].sort()
  );
  knownDuplicateIds.forEach(id => {
    assert.equal(equipment[id].deprecated, undefined);
    assert.equal(equipmentList.filter(item => item.id === id).length, 1);
  });
});

test('imported legacy gear remains addressable but cannot be crafted', () => {
  const legacy = equipment.acid_tooth_dagger;
  assert.equal(legacy.deprecated, true);
  assert.equal(legacy.hiddenFromCrafting, true);
  assert.equal(equipmentList.some(item => item.id === legacy.id), false);
  assert.equal(canCraft(legacy, legacy.cost), false);
  assert.equal(canCraft(equipment.boneBlade, { bone: 1, sinew: 1 }), true);
  assert.match(getEquipment('acid_tooth_dagger').name, /Legacy gear/);
});

test('display-name cleanup strips import and user prefixes without changing ids', () => {
  assert.equal(cleanGearDisplayName('[Imported: archive] Bone Blade'), 'Bone Blade');
  assert.equal(cleanGearDisplayName('source: Wailing Horn Bow'), 'Wailing Horn Bow');
  assert.equal(cleanGearDisplayName('@builder - Ash Mantle'), 'Ash Mantle');
  assert.equal(equipment.boneBlade.id, 'boneBlade');
});

test('old saves retain deprecated and unknown gear safely', () => {
  const survivor = createSurvivor('Legacy Bearer');
  survivor.boundGear = [
    { instanceId: 'bound-legacy', equipmentId: 'acid_tooth_dagger' },
    { instanceId: 'bound-unknown', equipmentId: 'removedGearId' }
  ];
  const normalized = normalizeSettlement({
    ...defaultSettlement,
    survivors: [survivor],
    activeSurvivorId: survivor.id,
    armory: [{ instanceId: 'stored-legacy', equipmentId: 'acid_tooth_dagger' }]
  });

  assert.equal(normalized.armory[0].equipmentId, 'acid_tooth_dagger');
  assert.equal(normalized.survivors[0].boundGear.length, 2);
  assert.equal(getEquipment('removedGearId').name, 'Unknown / Legacy gear');
});

test('Armoury grouping excludes hidden gear unless developer review is enabled', () => {
  const settlement = {
    builtInnovations: ['boneSmith'],
    discoveredQuarries: []
  };
  const normal = groupGearByArmouryTab(Object.values(equipment), settlement);
  const review = groupGearByArmouryTab(Object.values(equipment), settlement, {
    includeHidden: true
  });

  assert.equal(normal['Legacy / Hidden Review'], undefined);
  assert.ok(review['Legacy / Hidden Review'].General.length > 0);
});

test('active gear packages pass the variety audit', () => {
  assert.deepEqual(validateGearVariety(), []);
});
