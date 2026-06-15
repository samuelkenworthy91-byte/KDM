import assert from 'node:assert/strict';
import test from 'node:test';

import { fightingArts, generalFightingArts } from '../src/data/fightingArts.js';
import { nemesisList } from '../src/data/nemesisEncounters.js';
import { genericResourceIds, resources } from '../src/data/resources.js';
import {
  createNemesisVictoryReward,
  getNemesisRewardChoice
} from '../src/game/nemesisRewardLogic.js';
import {
  createCombatState,
  playCard,
  useSurvivalAction
} from '../src/game/combatLogic.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';

test('every implemented nemesis has a unique trophy and mirror art', () => {
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
    assert.ok(nemesis.rewards.learningText);
  });
});

test('new nemesis art offers a choice between art and extra trophy', () => {
  const encounter = nemesisList.find(nemesis => nemesis.id === 'mirrorTyrant');
  const reward = createNemesisVictoryReward(encounter, {
    id: 'survivor-1',
    fightingArts: []
  }, { rewardEventId: 'reward-1' });

  assert.equal(reward.uniqueResourceId, 'tyrantMirrorSplinter');
  assert.equal(reward.artId, 'invertedStrength');
  assert.equal(reward.rewardClaimed, false);
  assert.deepEqual(
    reward.rewardChoices.map(choice => choice.id),
    ['learnArt', 'takeExtraTrophy']
  );
  assert.equal(getNemesisRewardChoice(reward, 'learnArt').artId, 'invertedStrength');
});

test('owned nemesis art is never offered twice', () => {
  const encounter = nemesisList.find(nemesis => nemesis.id === 'shadowStalker');
  const reward = createNemesisVictoryReward(encounter, {
    id: 'survivor-1',
    fightingArts: ['wearTheDark']
  });

  assert.equal(reward.artOwned, true);
  assert.deepEqual(reward.rewardChoices.map(choice => choice.id), ['takeExtraTrophy']);
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
