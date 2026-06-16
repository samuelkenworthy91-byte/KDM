import assert from 'node:assert/strict';
import test from 'node:test';

import {
  equipment,
  equipmentList,
  getEquipment,
  resolvedDuplicateRecipeIds,
  validateEquipmentCardPackages,
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
  assert.ok(resolvedDuplicateRecipeIds.length >= knownDuplicateIds.length);
  assert.equal(equipmentList.filter(item => item.id === 'acidToothKnife').length, 1);
});

test('v8 imported gear is craftable and old handcrafted gear is compatibility-only', () => {
  const current = equipment.acidToothKnife;
  assert.equal(current.deprecated, false);
  assert.equal(current.hiddenFromCrafting, false);
  assert.equal(equipmentList.some(item => item.id === current.id), true);
  assert.equal(canCraft(current, current.cost), true);
  assert.equal(equipment.boneBlade.deprecated, true);
  assert.equal(equipment.boneBlade.hiddenFromCrafting, true);
  assert.equal(canCraft(equipment.boneBlade, { bone: 1, sinew: 1 }), false);
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

test('Armoury grouping excludes hidden gear and never creates review tabs', () => {
  const settlement = {
    builtInnovations: ['boneSmith'],
    discoveredQuarries: []
  };
  const normal = groupGearByArmouryTab(Object.values(equipment), settlement);
  const review = groupGearByArmouryTab(Object.values(equipment), settlement, {
    includeHidden: true
  });

  assert.equal(normal['Legacy / Hidden Review'], undefined);
  assert.equal(review['Legacy / Hidden Review'], undefined);
});

test('active gear packages resolve to runtime cards', () => {
  const validation = validateEquipmentCardPackages();
  assert.deepEqual(validation.missingCardIds, []);
  assert.deepEqual(validation.equipmentWithNoCardPackage, []);
});
