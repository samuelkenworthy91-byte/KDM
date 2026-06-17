import test from 'node:test';
import assert from 'node:assert/strict';

import { cards } from '../src/data/cards.js';
import { equipmentList, validateEquipmentCardPackages } from '../src/data/equipment.js';
import { overhaulCards } from '../src/data/overhaul/cardRegistry.js';
import {
  auditEquipmentCardSignatures,
  getMechanicalSignature
} from '../src/utils/equipmentCardAudit.js';

function uniqueSignatureCount(cardIds) {
  return new Set(cardIds.map(cardId => getMechanicalSignature(cards[cardId]))).size;
}

function isPureBlockOnly(card) {
  return (card?.effects || []).length === 1 && card.effects[0].type === 'block';
}

function largestGroupMatching(predicate) {
  return auditEquipmentCardSignatures({ minimumGroupSize: 2 })
    .filter(predicate)
    .at(0);
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
  assert.equal(uniqueSignatureCount([
    'vespertineBowTechnique',
    'emberDrakeBiteBoltTechnique',
    'gloomCoatedArrowTechnique'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'nuclearKnifeTechnique',
    'fangKnifeTechnique',
    'hoodedScrapKatarTechnique'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'riotMaceTechnique',
    'shaxeTechnique',
    'whistlingMaceTechnique'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'websilkWhipTechnique',
    'hunterWhipTechnique',
    'stitchedHideWhipTechnique'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'amberCelloShowdownPhaseEcho',
    'nuclearFluteShowdownPhaseEcho',
    'stitchedHideDrumEcho'
  ]), 3);
  assert.equal(uniqueSignatureCount([
    'bloodCrownBrace',
    'greenGlovesBrace',
    'calcifiedGreavesBrace',
    'wailingCoatBrace',
    'lanternArmorSetBrace'
  ]), 5);
});

test('weapon Technique cards are not pure block-only', () => {
  const pureBlockTechniques = Object.values(cards)
    .filter(card => /— Technique$/.test(card.name || '') && isPureBlockOnly(card))
    .map(card => card.id);

  assert.deepEqual(pureBlockTechniques, []);
});

test('empty Glimmer and Echo reaction groups stay collapsed', () => {
  const emptyGlimmers = Object.values(cards)
    .filter(card => /— Glimmer$/.test(card.name || '') && card.type === 'reaction' && (card.effects || []).length === 0)
    .map(card => card.id);
  const emptyEchoes = Object.values(cards)
    .filter(card => /— Echo$/.test(card.name || '') && card.type === 'reaction' && (card.effects || []).length === 0)
    .map(card => card.id);

  assert.deepEqual(emptyGlimmers, []);
  assert.deepEqual(emptyEchoes, []);
});

test('largest pure block duplicate group is below audit limit', () => {
  const pureBlockGroup = largestGroupMatching(group =>
    group.currentEffects.every(entry =>
      entry.effects.length === 1 && entry.effects[0].type === 'block'
    )
  );

  assert.ok((pureBlockGroup?.count || 0) <= 3);
});

test('top equipment duplicate groups stay below pass 4 identity limits', () => {
  const groups = auditEquipmentCardSignatures({ minimumGroupSize: 2 });
  // Pass 4: No group should be 5 or larger unless allowlisted
  assert.ok(groups[0].count < 5, `Largest group is too large: ${groups[0].count} cards in group ${groups[0].signature}`);

  const mixedWeaponArmorGroups = groups.filter(group => {
    const hasTechnique = group.cardNames.some(name => /— Technique$/.test(name));
    const hasArmour = group.cardNames.some(name => /— (Brace|Fitted Plate|Setline|Set)$/.test(name));
    return hasTechnique && hasArmour;
  });

  assert.deepEqual(
    mixedWeaponArmorGroups.map(group => group.cardNames),
    [],
    "Weapon techniques should not share mechanical signatures with armor cards"
  );
});

test('generic support templates are not overused', () => {
  // block + nextPartyMember block
  const nextPartyMemberBlockGroups = auditEquipmentCardSignatures({ minimumGroupSize: 2 })
    .filter(group => group.currentEffects.every(entry =>
      entry.effects.length === 2 &&
      entry.effects[0].type === 'block' &&
      entry.effects[1].type === 'partyEffect' &&
      entry.effects[1].effectType === 'block'
    ));

  nextPartyMemberBlockGroups.forEach(group => {
    assert.ok(group.count <= 3, `Generic block+partyBlock template overused: ${group.count} cards in group`);
  });

  // block + guardSelf
  const blockGuardSelfGroups = auditEquipmentCardSignatures({ minimumGroupSize: 2 })
    .filter(group => group.currentEffects.every(entry =>
      entry.effects.length === 2 &&
      entry.effects[0].type === 'block' &&
      entry.effects[1].type === 'guardSelf'
    ));

  blockGuardSelfGroups.forEach(group => {
    assert.ok(group.count <= 3, `Generic block+guardSelf template overused: ${group.count} cards in group`);
  });
});

test('omen and glimmer groups are not generic panic clusters', () => {
  const omenGlimmerGroups = auditEquipmentCardSignatures({ minimumGroupSize: 2 })
    .filter(group => group.cardNames.some(name => /— (Omen|Glimmer)$/.test(name)));

  const genericPanicGroups = omenGlimmerGroups.filter(group =>
    group.currentEffects.every(entry =>
      entry.effects.every(e => ['addPanic', 'guardSelf'].includes(e.type))
    )
  );

  assert.ok(genericPanicGroups.length === 0, "Omen/Glimmer groups should not be generic panic/guard clusters");
});

test('repeated contingency salvage template stays below audit limit', () => {
  const salvageGroup = largestGroupMatching(group =>
    group.currentEffects.every(entry =>
      entry.effects.length === 2 &&
      entry.effects[0].type === 'consequenceReduction' &&
      entry.effects[1].type === 'salvageSelf'
    )
  );

  assert.ok((salvageGroup?.count || 0) <= 4);
});

test('card registry normalises overhaul cards and gear packages resolve', () => {
  Object.values(overhaulCards).forEach(card => {
    assert.equal(card.id, card.cardId);
    assert.equal(typeof card.name, 'string');
    assert.ok(Array.isArray(card.effects));
  });

  const packageValidation = validateEquipmentCardPackages();
  assert.deepEqual(packageValidation.missingCardIds, []);
  assert.ok(equipmentList.every(item => Array.isArray(item.cardPackage)));
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
