import test from 'node:test';
import assert from 'node:assert/strict';

import { cards } from '../src/data/cards.js';
import { equipmentList, validateEquipmentCardPackages } from '../src/data/equipment.js';
import {
  auditEquipmentCardSignatures,
  getMechanicalSignature
} from '../src/utils/equipmentCardAudit.js';

function uniqueSignatureCount(cardIds) {
  return new Set(cardIds.map(cardId => getMechanicalSignature(cards[cardId]))).size;
}

test('signature equipment card packages have varied mechanical signatures', () => {
  equipmentList
    .filter(item => item.keywords?.includes('Signature'))
    .forEach(item => {
      assert.equal(item.cardPackage.length, 3);
      assert.ok(uniqueSignatureCount(item.cardPackage) >= 2, `${item.id} cards are too mechanically flat`);
    });
});

test('curated gear packages resolve to runtime cards', () => {
  const packageValidation = validateEquipmentCardPackages();
  assert.deepEqual(packageValidation.missingCardIds, []);
  assert.ok(equipmentList.every(item => Array.isArray(item.cardPackage)));
});

test('equipment audit reports duplicate groups with required fields', () => {
  const groups = auditEquipmentCardSignatures({ minimumGroupSize: 2 });
  assert.ok(Array.isArray(groups));
  if (!groups.length) return;
  const group = groups[0];

  assert.equal(typeof group.signature, 'string');
  assert.equal(typeof group.count, 'number');
  assert.ok(Array.isArray(group.equipmentNames));
  assert.ok(Array.isArray(group.cardNames));
  assert.ok(Array.isArray(group.currentEffects));
});
