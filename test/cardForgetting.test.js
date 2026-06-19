import assert from 'node:assert/strict';
import test from 'node:test';

import { cards } from '../src/data/cards.js';
import {
  forgetSurvivorCard,
  getCardForgetEligibility,
  hasEarlyForgettingAccess
} from '../src/game/cardForgetting.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import { equipment } from '../src/data/equipment.js';

function settlement(overrides = {}) {
  return {
    builtInnovations: ['lanternHearth'],
    builtMemoryInnovations: [],
    memories: 2,
    settlementMemory: 2,
    lanternYear: 2,
    ...overrides
  };
}

function survivor(overrides = {}) {
  return {
    id: 'survivor-1',
    name: 'Mara',
    personalDeckAdditions: [],
    permanentNegativeCards: [],
    forgottenCardIds: [],
    ...overrides
  };
}

test('Lantern Hearth grants early Guided Reflection access', () => {
  const current = settlement();
  const currentSurvivor = survivor();
  const result = getCardForgetEligibility({
    settlement: current,
    survivor: currentSurvivor,
    cardId: 'foundingStone',
    card: cards.foundingStone
  });

  assert.equal(hasEarlyForgettingAccess(current), true);
  assert.equal(result.eligible, true);
});

test('legacy Rite of Forgetting remains an equivalent unlock', () => {
  const current = settlement({
    builtInnovations: [],
    builtMemoryInnovations: ['riteOfForgetting']
  });

  assert.equal(hasEarlyForgettingAccess(current), true);
});

test('Monster Bane and permanent cards explain why they cannot be forgotten', () => {
  const current = settlement();
  const currentSurvivor = survivor();
  const monsterBane = getCardForgetEligibility({
    settlement: current,
    survivor: currentSurvivor,
    cardId: 'monsterBane_testQuarry',
    card: { id: 'monsterBane_testQuarry', tags: ['monsterBane'] }
  });
  const permanent = getCardForgetEligibility({
    settlement: current,
    survivor: currentSurvivor,
    cardId: 'waitForTheShoulder',
    card: cards.waitForTheShoulder
  });

  assert.equal(monsterBane.reason, 'Locked: Monster Bane');
  assert.equal(permanent.reason, 'Permanent card');
});

test('gear cards are eligible for forgetting but Panic remains locked', () => {
  const current = settlement();
  const currentSurvivor = survivor();
  const gearCard = getCardForgetEligibility({
    settlement: current,
    survivor: currentSurvivor,
    cardId: 'amberBowTechnique',
    card: { ...cards.amberBowTechnique, sourceType: 'gear', sourceGearId: 'amberBow' },
    gearGranted: true
  });
  const panic = getCardForgetEligibility({
    settlement: current,
    survivor: currentSurvivor,
    cardId: 'panic',
    card: cards.panic
  });

  assert.equal(gearCard.eligible, true);
  assert.equal(panic.eligible, false);
  assert.equal(panic.reason, 'Permanent burden: use Quiet Night or Taboo');
});

test('forgotten cards persist on the survivor and leave the run deck', () => {
  const currentSurvivor = survivor();
  const nextSurvivor = forgetSurvivorCard(
    currentSurvivor,
    'foundingStone',
    'Guided Reflection',
    2,
    cards.foundingStone
  );
  const deck = buildRunDeck({ survivor: nextSurvivor });

  assert.deepEqual(nextSurvivor.forgottenCardIds, ['foundingStone']);
  assert.equal(nextSurvivor.lastForgetLanternYear, 2);
  assert.equal(nextSurvivor.forgottenCardsLog[0].method, 'Guided Reflection');
  assert.equal(deck.some(card => card.id === 'foundingStone'), false);
});

test('forgotten gear card is excluded without unequipping item or removing sibling cards', () => {
  const currentSurvivor = survivor({
    forgottenCardIds: ['signature_raking_chord'],
    gearCardTraining: {
      'survivor-1:cleaver-1:signature_raking_chord': 3
    }
  });
  const equippedGear = [{ equipmentId: 'palechord_cleaver', instanceId: 'cleaver-1' }];
  const deck = buildRunDeck({ survivor: currentSurvivor, equippedGear });

  assert.ok(equipment.palechord_cleaver.cardPackage.includes('signature_raking_chord'));
  assert.equal(deck.some(card => card.id === 'signature_raking_chord'), false);
  assert.equal(deck.some(card => card.id === 'signature_feedback_guard'), true);
  assert.equal(deck.some(card => card.id === 'signature_cleaver_solo'), true);
});

test('forgotten gear card survives re-equipping and does not affect another survivor', () => {
  const equippedGear = [{ equipmentId: 'palechord_cleaver', instanceId: 'cleaver-1' }];
  const forgettingSurvivor = survivor({ forgottenCardIds: ['signature_raking_chord'] });
  const otherSurvivor = survivor({ id: 'survivor-2', name: 'Nia' });

  assert.equal(
    buildRunDeck({ survivor: forgettingSurvivor, equippedGear })
      .some(card => card.id === 'signature_raking_chord'),
    false
  );
  assert.equal(
    buildRunDeck({ survivor: otherSurvivor, equippedGear })
      .some(card => card.id === 'signature_raking_chord'),
    true
  );
});

test('affinity cards obey forgetting while temporary cards ignore it', () => {
  const affinityCard = Object.values(cards).find(card =>
    card.grantedByAffinity && card.affinityThresholdRequired
  );
  if (!affinityCard) return;
  const gear = Object.values(equipment)
    .filter(item => item.colorAffinity === affinityCard.grantedByAffinity)
    .slice(0, Number(affinityCard.affinityThresholdRequired))
    .map(item => ({ equipmentId: item.id, instanceId: `${item.id}-1` }));
  if (gear.length < Number(affinityCard.affinityThresholdRequired)) return;

  const currentSurvivor = survivor({ forgottenCardIds: [affinityCard.id, 'deepBreath'] });
  const deck = buildRunDeck({
    survivor: currentSurvivor,
    equippedGear: gear,
    temporaryCards: ['deepBreath']
  });

  assert.equal(deck.some(card => card.id === affinityCard.id), false);
  assert.equal(deck.some(card => card.id === 'deepBreath'), true);
});

test('old saves with forgotten Panic still keep permanent Panic burden', () => {
  const currentSurvivor = survivor({
    forgottenCardIds: ['panic'],
    permanentNegativeCards: ['panic']
  });
  const deck = buildRunDeck({ survivor: currentSurvivor });

  assert.equal(deck.some(card => card.id === 'panic'), true);
});

test('missing access, memory, and yearly limits block removal safely', () => {
  const noAccess = getCardForgetEligibility({
    settlement: settlement({ builtInnovations: [], builtMemoryInnovations: [] }),
    survivor: survivor(),
    cardId: 'foundingStone',
    card: cards.foundingStone
  });
  const noMemory = getCardForgetEligibility({
    settlement: settlement({ memories: 0, settlementMemory: 0 }),
    survivor: survivor(),
    cardId: 'foundingStone',
    card: cards.foundingStone
  });
  const alreadyUsed = getCardForgetEligibility({
    settlement: settlement(),
    survivor: survivor({ lastForgetLanternYear: 2 }),
    cardId: 'foundingStone',
    card: cards.foundingStone
  });

  assert.match(noAccess.reason, /Lantern Hearth/);
  assert.equal(noMemory.reason, 'Not enough Memory');
  assert.equal(alreadyUsed.reason, 'Already used this Lantern Year');
});
