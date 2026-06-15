import assert from 'node:assert/strict';
import test from 'node:test';

import { cards } from '../src/data/cards.js';
import {
  applyWeaponProficiencyXp,
  createWeaponProficiency,
  syncWeaponMasteryCards,
  weaponMasteryCardIds,
  weaponTypes
} from '../src/data/weaponProficiency.js';
import { buildRunDeck, getCardsFromIds } from '../src/game/deckLogic.js';
import {
  createSurvivor,
  defaultSettlement,
  normalizeSettlement
} from '../src/game/saveLogic.js';

function survivorAt(type, xp) {
  const survivor = createSurvivor('Mastery Test');
  survivor.activeProficiencyType = type;
  survivor.weaponProficiency = createWeaponProficiency({
    [type]: { xp }
  });
  return survivor;
}

test('every weapon type has one registered mastery card', () => {
  assert.deepEqual(Object.keys(weaponMasteryCardIds).sort(), [...weaponTypes].sort());
  weaponTypes.forEach(type => {
    const card = cards[weaponMasteryCardIds[type]];
    assert.ok(card, `${type} mastery card is registered`);
    assert.equal(card.weaponType, type);
    assert.equal(card.sourceType, 'weaponMastery');
  });
});

test('crossing from 7 XP to 8 XP awards one mastery card', () => {
  const survivor = survivorAt('sword', 7);
  const rewarded = applyWeaponProficiencyXp(survivor, ['sword']);

  assert.equal(rewarded.weaponProficiency.sword.xp, 8);
  assert.equal(rewarded.weaponProficiency.sword.mastered, true);
  assert.deepEqual(rewarded.personalDeckAdditions, [{
    cardId: weaponMasteryCardIds.sword,
    sourceType: 'weaponMastery',
    reason: 'Sword Mastery',
    locked: true
  }]);
});

test('mastered survivors do not gain duplicate mastery cards', () => {
  const mastered = syncWeaponMasteryCards(survivorAt('axe', 8));
  const rewardedAgain = applyWeaponProficiencyXp(mastered, ['axe']);
  const syncedAgain = syncWeaponMasteryCards(rewardedAgain);
  const masteryCards = syncedAgain.personalDeckAdditions.filter(addition =>
    addition.cardId === weaponMasteryCardIds.axe
  );

  assert.equal(rewardedAgain.weaponProficiency.axe.xp, 9);
  assert.equal(masteryCards.length, 1);
});

test('old mastered saves are backfilled safely during normalization', () => {
  const survivor = survivorAt('bow', 8);
  const normalized = normalizeSettlement({
    ...defaultSettlement,
    survivors: [survivor],
    activeSurvivorId: survivor.id
  });
  const additions = normalized.survivors[0].personalDeckAdditions;

  assert.equal(
    additions.filter(addition => addition.cardId === weaponMasteryCardIds.bow).length,
    1
  );
});

test('only the active mastery card enters the run deck', () => {
  let survivor = survivorAt('sword', 8);
  survivor = syncWeaponMasteryCards(survivor);
  survivor.weaponProficiency = createWeaponProficiency({
    sword: { xp: 8 },
    axe: { xp: 8 }
  });
  survivor = syncWeaponMasteryCards(survivor);
  survivor.activeProficiencyType = 'sword';

  const deck = buildRunDeck({ survivor });
  assert.equal(deck.some(card => card.id === weaponMasteryCardIds.sword), true);
  assert.equal(deck.some(card => card.id === weaponMasteryCardIds.axe), false);
});

test('mastery additions preserve their source and reason in deck cards', () => {
  const [card] = getCardsFromIds([{
    cardId: weaponMasteryCardIds.spear,
    sourceType: 'weaponMastery',
    reason: 'Spear Mastery'
  }]);

  assert.equal(card.sourceType, 'weaponMastery');
  assert.equal(card.sourceReason, 'Spear Mastery');
});
