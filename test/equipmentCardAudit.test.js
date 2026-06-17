import test from 'node:test';
import assert from 'node:assert/strict';

import { cards } from '../src/data/cards.js';
import {
  auditEquipmentCardSignatures,
  getMechanicalSignature
} from '../src/utils/equipmentCardAudit.js';

function uniqueSignatureCount(cardIds) {
  return new Set(cardIds.map(cardId => getMechanicalSignature(cards[cardId]))).size;
}

test('focused equipment identity clusters have varied mechanical signatures', () => {
  assert.equal(uniqueSignatureCount([
    'amberBowTechnique',
    'penumbraBowTechnique',
    'noonsharkBowTechnique'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'acidToothKnifeTechnique',
    'boneKnifeTechnique',
    'calcifiedBoneKnifeTechnique'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'bandagesResonance',
    'firstAidKitResonance',
    'fecalSalveResonance'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'boneAxeTechnique',
    'boneClubTechnique',
    'beaconGuardShieldWall'
  ]), 3);
});

test('equipment audit reports duplicate groups with required fields', () => {
  const groups = auditEquipmentCardSignatures({ minimumGroupSize: 4 });
  assert.ok(groups.length > 0);
  const group = groups[0];

  assert.equal(typeof group.signature, 'string');
  assert.equal(typeof group.count, 'number');
  assert.ok(Array.isArray(group.equipmentNames));
  assert.ok(Array.isArray(group.cardNames));
  assert.ok(Array.isArray(group.currentEffects));
});
