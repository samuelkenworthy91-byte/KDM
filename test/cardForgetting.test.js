import assert from 'node:assert/strict';
import test from 'node:test';

import { cards } from '../src/data/cards.js';
import {
  forgetSurvivorCard,
  getCardForgetEligibility,
  hasEarlyForgettingAccess
} from '../src/game/cardForgetting.js';
import { buildRunDeck } from '../src/game/deckLogic.js';

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

test('Monster Bane, permanent, and gear cards explain why they cannot be forgotten', () => {
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
  const gearCard = getCardForgetEligibility({
    settlement: current,
    survivor: currentSurvivor,
    cardId: 'testGearCard',
    card: { id: 'testGearCard', sourceType: 'gear', sourceGearId: 'testGear' }
  });

  assert.equal(monsterBane.reason, 'Locked: Monster Bane');
  assert.equal(permanent.reason, 'Permanent card');
  assert.equal(gearCard.reason, 'Gear card: unequip item to remove');
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
