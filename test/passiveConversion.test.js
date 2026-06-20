import assert from 'node:assert/strict';
import test from 'node:test';

import { weaponMasteryCardIds } from '../src/data/weaponProficiency.js';
import {
  createCombatState,
  getActiveFightingArtActions,
  useFightingArtAction
} from '../src/game/combatLogic.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import { learnFightingArt } from '../src/game/survivorProgression.js';
import {
  createSurvivor,
  defaultSettlement,
  normalizeSettlement
} from '../src/game/saveLogic.js';

test('run deck filters obsolete fighting art and proficiency cards but keeps allowed cards', () => {
  const survivor = {
    name: 'Kara',
    fightingArts: ['braceAndBreathe'],
    activeProficiencyType: 'sword',
    personalDeckAdditions: [
      { cardId: 'holdTheLine', sourceType: 'fightingArt' },
      { cardId: weaponMasteryCardIds.sword, sourceType: 'weaponMastery' },
      { cardId: 'panic', sourceType: 'curse' },
      { cardId: 'blackLanternFocus', sourceType: 'timeline' },
      { cardId: 'smogSingers_clearTheSmoke', sourceType: 'monsterReward' }
    ]
  };

  const deck = buildRunDeck({ survivor, equippedGear: ['starter_sword'] });
  const ids = deck.map(card => card.id);

  assert.equal(ids.includes('holdTheLine'), false);
  assert.equal(ids.includes(weaponMasteryCardIds.sword), false);
  assert.equal(ids.includes('starter_sword_cut'), true);
  assert.equal(ids.includes('panic'), true);
  assert.equal(ids.includes('blackLanternFocus'), true);
  assert.equal(ids.includes('smogSingers_clearTheSmoke'), true);
});

test('learning a fighting art records the art without adding ordinary deck cards', () => {
  const survivor = createSurvivor('Art Learner');
  const learned = learnFightingArt(survivor, 'braceAndBreathe');

  assert.deepEqual(learned.fightingArts, ['braceAndBreathe']);
  assert.deepEqual(learned.personalDeckAdditions, []);
});

test('save migration removes obsolete passive cards and keeps real personal cards', () => {
  const survivor = createSurvivor('Old Save');
  survivor.fightingArts = ['braceAndBreathe'];
  survivor.weaponProficiency.sword.xp = 8;
  survivor.personalDeckAdditions = [
    'holdTheLine',
    { cardId: weaponMasteryCardIds.sword, sourceType: 'weaponMastery' },
    { cardId: 'panic', sourceType: 'curse' },
    { cardId: 'blackLanternFocus', sourceType: 'timeline' },
    { cardId: 'smogSingers_clearTheSmoke', sourceType: 'monsterReward' }
  ];

  const normalized = normalizeSettlement({
    ...defaultSettlement,
    survivors: [survivor],
    activeSurvivorId: survivor.id
  });
  const additions = normalized.survivors[0].personalDeckAdditions;
  const ids = additions.map(addition => addition.cardId);

  assert.equal(ids.includes('holdTheLine'), false);
  assert.equal(ids.includes(weaponMasteryCardIds.sword), false);
  assert.deepEqual(ids, ['panic', 'blackLanternFocus', 'smogSingers_clearTheSmoke']);
});

test('active fighting art button can be used once per fight', () => {
  const state = createCombatState(undefined, {
    survivor: {
      name: 'Brace',
      hp: 10,
      maxHp: 10,
      survival: 0,
      maxSurvival: 3,
      fightingArts: ['braceAndBreathe']
    }
  });
  const braced = {
    ...state,
    survivor: { ...state.survivor, block: 8, survival: 0 }
  };

  const [action] = getActiveFightingArtActions(braced);
  assert.equal(action.id, 'braceAndBreathe');
  assert.equal(action.remainingUses, 1);

  const used = useFightingArtAction('braceAndBreathe', braced);
  assert.equal(used.survivor.survival, 1);
  assert.equal(getActiveFightingArtActions(used)[0].remainingUses, 0);

  const usedAgain = useFightingArtAction('braceAndBreathe', used);
  assert.equal(usedAgain.survivor.survival, 1);
});

test('active fighting art is unavailable until its condition is met', () => {
  const state = createCombatState(undefined, {
    survivor: {
      name: 'Brace',
      hp: 10,
      maxHp: 10,
      survival: 0,
      maxSurvival: 3,
      fightingArts: ['braceAndBreathe']
    }
  });

  const [action] = getActiveFightingArtActions(state);
  assert.equal(action.disabled, true);
  assert.match(action.reason, /Requires 8 block/);
});
