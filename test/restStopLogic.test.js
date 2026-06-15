import assert from 'node:assert/strict';
import test from 'node:test';

import { createSurvivor, defaultSettlement } from '../src/game/saveLogic.js';
import {
  getForgettableRestCards,
  getRestParty,
  resolveRestStopChoice
} from '../src/game/restStopLogic.js';

function survivor(name, overrides = {}) {
  return {
    ...createSurvivor(name),
    id: name.toLowerCase().replace(/\s+/g, '-'),
    ...overrides
  };
}

function state(party, active = party[0], settlementOverrides = {}) {
  return {
    settlement: {
      ...defaultSettlement,
      memories: 1,
      settlementMemory: 1,
      survivors: party,
      ...settlementOverrides
    },
    runParty: party,
    runSurvivor: active,
    runModifiers: {},
    runMap: [[{
      id: 'rest',
      type: 'rest',
      connections: ['next'],
      available: true
    }], [{
      id: 'next',
      type: 'elite',
      connections: ['future'],
      available: false
    }], [{
      id: 'future',
      type: 'event',
      connections: [],
      available: false
    }]],
    currentNode: {
      id: 'rest',
      type: 'rest',
      connections: ['next']
    },
    currentHuntId: 'hunt-test'
  };
}

test('solo rest choices heal safely and apply next-combat modifiers', () => {
  const solo = survivor('Solo', { hp: 10, maxHp: 20 });
  const healed = resolveRestStopChoice(state([], solo), 'bindWounds', {
    survivorId: solo.id
  });
  const prepared = resolveRestStopChoice(state([solo]), 'prepareNextFight');
  const repaired = resolveRestStopChoice(state([solo]), 'repairGear');

  assert.equal(healed.applied, true);
  assert.equal(healed.runSurvivor.hp, 15);
  assert.equal(prepared.runModifiers.firstAttackBonus, 2);
  assert.equal(repaired.runModifiers.nextCombatStartBlock, 5);
});

test('party rest targets a living member and never revives a dead survivor', () => {
  const active = survivor('Active', { hp: 20, maxHp: 20 });
  const wounded = survivor('Wounded', { hp: 5, maxHp: 20 });
  const dead = survivor('Dead', { hp: 0, alive: false });
  const partyState = state([active, wounded, dead], active);

  const healed = resolveRestStopChoice(partyState, 'bindWounds', {
    survivorId: wounded.id
  });
  const deadAttempt = resolveRestStopChoice(partyState, 'bindWounds', {
    survivorId: dead.id
  });

  assert.equal(healed.runParty.find(member => member.id === wounded.id).hp, 10);
  assert.equal(healed.runParty.find(member => member.id === dead.id).alive, false);
  assert.equal(getRestParty([active, wounded, dead]).some(member => member.id === dead.id), false);
  assert.equal(deadAttempt.applied, false);
});

test('watch and track choices update existing run modifiers and map state', () => {
  const active = survivor('Tracker');
  const watched = resolveRestStopChoice(state([active]), 'keepWatch');
  const warned = resolveRestStopChoice(state([active]), 'studyTracks', {
    trackStudy: 'saferEvent'
  });
  const woundedQuarry = resolveRestStopChoice(state([active]), 'studyTracks', {
    trackStudy: 'woundQuarry'
  });
  const revealed = resolveRestStopChoice(state([active]), 'studyTracks', {
    trackStudy: 'revealNodes'
  });

  assert.equal(watched.runModifiers.nextCombatStartBlock, 4);
  assert.equal(watched.runModifiers.nextEventWarning, true);
  assert.equal(warned.runModifiers.nextEventWarning, true);
  assert.equal(woundedQuarry.runModifiers.monsterStartsWounded, 2);
  assert.equal(revealed.runMap.flat().find(node => node.id === 'future').revealedByTracks, true);
});

test('share stories supports Survival or settlement Memory', () => {
  const active = survivor('Storyteller', { survival: 0, maxSurvival: 3 });
  const survival = resolveRestStopChoice(state([active]), 'shareStories', {
    survivorId: active.id,
    storyReward: 'survival'
  });
  const memory = resolveRestStopChoice(state([active]), 'shareStories', {
    survivorId: active.id,
    storyReward: 'memory'
  });

  assert.equal(survival.runSurvivor.survival, 1);
  assert.equal(memory.settlement.memories, 2);
  assert.equal(memory.settlement.memoryHistory[0].source, 'rest-stories');
});

test('forget burden spends Memory once and excludes locked or permanent cards', () => {
  const active = survivor('Reflector', {
    personalDeckAdditions: [
      { cardId: 'veteranStrike', sourceType: 'personal', reason: 'Old lesson' },
      { cardId: 'masterySwordMarkedEcho', sourceType: 'weaponMastery', locked: true }
    ]
  });
  const restState = state([active]);
  const eligible = getForgettableRestCards(restState.settlement, active);
  const forgotten = resolveRestStopChoice(restState, 'forgetBurden', {
    cardId: 'veteranStrike'
  });
  const lockedAttempt = resolveRestStopChoice(restState, 'forgetBurden', {
    cardId: 'masterySwordMarkedEcho'
  });

  assert.equal(eligible.some(entry => entry.cardId === 'veteranStrike'), true);
  assert.equal(eligible.some(entry => entry.cardId === 'masterySwordMarkedEcho'), false);
  assert.equal(forgotten.applied, true);
  assert.equal(forgotten.settlement.memories, 0);
  assert.equal(forgotten.runSurvivor.forgottenCardIds.includes('veteranStrike'), true);
  assert.equal(lockedAttempt.applied, false);
  assert.match(lockedAttempt.reason, /Permanent card/);
});

test('forget burden fails cleanly without enough settlement Memory', () => {
  const active = survivor('Empty Memory', {
    personalDeckAdditions: [{ cardId: 'veteranStrike', sourceType: 'personal' }]
  });
  const result = resolveRestStopChoice(state([active], active, {
    memories: 0,
    settlementMemory: 0
  }), 'forgetBurden', {
    cardId: 'veteranStrike'
  });

  assert.equal(result.applied, false);
  assert.match(result.reason, /Not enough Memory/);
});
