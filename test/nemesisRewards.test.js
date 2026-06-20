import assert from 'node:assert/strict';
import test from 'node:test';

import { cards } from '../src/data/cards.js';
import { fightingArts, generalFightingArts } from '../src/data/fightingArts.js';
import {
  createDeadlyNemesisIntents,
  getNemesisBehaviour,
  nemesisList
} from '../src/data/nemesisEncounters.js';
import { genericResourceIds, resources } from '../src/data/resources.js';
import {
  addNemesisChampionCardToSurvivor,
  createNemesisVictoryReward,
  nemesisChampionCardIds
} from '../src/game/nemesisRewardLogic.js';
import {
  createCombatState,
  playCard,
  useSurvivalAction
} from '../src/game/combatLogic.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';

test('every implemented nemesis has a unique trophy, mirror art, and champion card', () => {
  const implemented = nemesisList.filter(nemesis => nemesis.implemented);

  assert.deepEqual(
    implemented.map(nemesis => nemesis.id).sort(),
    ['cruelCollector', 'maskedJudge', 'mirrorTyrant', 'shadowStalker', 'wanderingKiller']
  );
  implemented.forEach(nemesis => {
    const resource = resources[nemesis.rewards.uniqueResourceId];
    const art = fightingArts[nemesis.rewards.mirrorArtId];

    assert.equal(resource?.type, 'nemesis', `${nemesis.id} needs a nemesis trophy`);
    assert.ok(art?.tags.includes('nemesis'), `${nemesis.id} needs a nemesis art`);
    assert.ok(art?.tags.includes('mirror'), `${nemesis.id} needs a mirror art`);
    assert.ok(art?.tags.includes(nemesis.id), `${nemesis.id} art needs its source tag`);
    const championCard = cards[nemesisChampionCardIds[nemesis.id]];
    assert.equal(championCard?.sourceType, 'nemesisChampion', `${nemesis.id} needs champion card`);
    assert.equal(championCard?.exhaust, true, `${nemesis.id} champion card should be limited`);
    assert.ok(nemesis.rewards.learningText);
  });
});

test('nemesis champion victory grants resources and champion card data', () => {
  const encounter = nemesisList.find(nemesis => nemesis.id === 'mirrorTyrant');
  const reward = createNemesisVictoryReward(encounter, {
    id: 'survivor-1',
    fightingArts: [],
    personalDeckAdditions: []
  }, {
    rewardEventId: 'reward-1',
    settlement: { unlockedQuarries: ['paleHuntLion'] },
    random: () => 0
  });

  assert.deepEqual(reward.resourceIds.slice(0, 3), ['bone', 'hide', 'organ']);
  assert.equal(reward.resourceIds.includes('paleLionHide'), true);
  assert.equal(reward.uniqueResourceId, 'tyrantMirrorSplinter');
  assert.equal(reward.championCardId, 'championMirrorTyrantClaim');
  assert.equal(reward.rewardClaimed, true);
  assert.deepEqual(reward.rewardChoices, []);
});

test('champion card goes to the correct survivor only and appears in their run deck', () => {
  const encounter = nemesisList.find(nemesis => nemesis.id === 'shadowStalker');
  const reward = createNemesisVictoryReward(encounter, {
    id: 'survivor-1',
    personalDeckAdditions: []
  });
  const champion = addNemesisChampionCardToSurvivor({
    id: 'survivor-1',
    name: 'Champion',
    personalDeckAdditions: []
  }, reward);
  const bystander = {
    id: 'survivor-2',
    name: 'Bystander',
    personalDeckAdditions: []
  };

  assert.equal(champion.personalDeckAdditions[0].cardId, 'championShadowStalkerMantle');
  assert.deepEqual(bystander.personalDeckAdditions, []);
  assert.equal(
    buildRunDeck({ survivor: champion }).some(card => card.id === 'championShadowStalkerMantle'),
    true
  );
});

test('nemesis rewards do not leak into generic art or resource pools', () => {
  const nemesisArtIds = nemesisList
    .filter(nemesis => nemesis.implemented)
    .map(nemesis => nemesis.rewards.mirrorArtId);
  const nemesisResourceIds = nemesisList
    .filter(nemesis => nemesis.implemented)
    .map(nemesis => nemesis.rewards.uniqueResourceId);

  nemesisArtIds.forEach(id => {
    assert.equal(generalFightingArts.some(art => art.id === id), false);
  });
  nemesisResourceIds.forEach(id => {
    assert.equal(genericResourceIds.includes(id), false);
  });
});

test('champion card reward cannot be duplicated', () => {
  const reward = createNemesisVictoryReward(
    nemesisList.find(nemesis => nemesis.id === 'cruelCollector'),
    { personalDeckAdditions: [] }
  );
  const once = addNemesisChampionCardToSurvivor({ personalDeckAdditions: [] }, reward);
  const twice = addNemesisChampionCardToSurvivor(once, reward);

  assert.equal(
    twice.personalDeckAdditions.filter(addition => addition.cardId === reward.championCardId).length,
    1
  );
});

test('nemesis duel intents are deadlier than base behaviour intents', () => {
  const base = getNemesisBehaviour('wanderingKiller').intents.find(intent => intent.id === 'suddenCut');
  const deadly = createDeadlyNemesisIntents('wanderingKiller', [base])[0];

  assert.equal(base.effects[0].amount, 10);
  assert.equal(deadly.effects[0].amount, 12);
});

test('champion cards exhaust when played', () => {
  const card = cards.championCruelCollectorDue;
  const state = createCombatState(undefined, {
    survivor: {
      name: 'Champion',
      hp: 30,
      maxHp: 30,
      maxSurvival: 3,
      strength: 0
    }
  });
  const after = playCard(0, {
    ...state,
    hand: [card],
    monster: { ...state.monster, hp: 30, maxHp: 30 }
  });

  assert.equal(after.exhaustPile.some(item => item.id === card.id), true);
});

test('old and partial nemesis results normalize safely', () => {
  const oldSave = normalizeSettlement({
    survivors: [],
    lastNemesisResult: {
      nemesisId: 'legacyNemesis',
      result: 'victory'
    }
  });
  const partialReward = normalizeSettlement({
    survivors: [],
    lastNemesisResult: {
      nemesisId: 'mirrorTyrant',
      result: 'victory',
      uniqueReward: {
        uniqueResourceId: 'tyrantMirrorSplinter',
        rewardChoices: null
      }
    }
  });

  assert.deepEqual(oldSave.lastNemesisResult.details, []);
  assert.equal(oldSave.lastNemesisResult.uniqueReward, null);
  assert.equal(
    partialReward.lastNemesisResult.uniqueReward.uniqueResourceName,
    'Unknown / Legacy'
  );
  assert.deepEqual(partialReward.lastNemesisResult.uniqueReward.rewardChoices, []);
});

test('mirror art combat effects resolve through existing combat state', () => {
  const judgeState = createCombatState(undefined, {
    survivor: {
      name: 'Judge Breaker',
      hp: 30,
      maxHp: 30,
      maxSurvival: 3,
      fightingArts: ['verdictWithoutVoice']
    },
    hasMonsterBane: false
  });
  assert.equal(judgeState.survivor.block, 2);

  const shadowState = createCombatState(undefined, {
    survivor: {
      name: 'Shadow Breaker',
      hp: 30,
      maxHp: 30,
      maxSurvival: 3,
      fightingArts: ['wearTheDark']
    }
  });
  const panicCard = {
    id: 'testPanicArt',
    name: 'Test Panic Art',
    cost: 0,
    type: 'skill',
    effects: [{ type: 'addPanic', amount: 1 }]
  };
  const afterPanic = playCard(0, { ...shadowState, hand: [panicCard] });
  assert.equal(afterPanic.survivor.block, 1);
  assert.equal(afterPanic.discardPile.some(card => card.id === 'panic'), false);

  const mirrorState = createCombatState(undefined, {
    survivor: {
      name: 'Mirror Breaker',
      hp: 30,
      maxHp: 30,
      maxSurvival: 3,
      survival: 1,
      fightingArts: ['invertedStrength']
    }
  });
  const afterCounter = useSurvivalAction('counter', mirrorState);
  assert.equal(afterCounter.nextAttackBonus, 2);
});
