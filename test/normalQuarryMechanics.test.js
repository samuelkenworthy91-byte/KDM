import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCombatState,
  playCard
} from '../src/game/combatLogic.js';
import {
  normalQuarryCards,
  normalQuarryMechanicAliases,
  normalQuarrySuiteDefinitions
} from '../src/data/gear/normalQuarryGear.js';
import { creatureBehaviours } from '../src/data/creatureBehaviours.js';

function monster() {
  return {
    id: 'mechanicMonster',
    name: 'Mechanic Monster',
    hp: 40,
    maxHp: 40,
    block: 0,
    intents: [{
      id: 'idle',
      name: 'Idle',
      tellText: 'Idle',
      revealedText: 'Idle',
      tags: [],
      effects: []
    }]
  };
}

function stateWithHand(hand, overrides = {}) {
  const base = createCombatState(monster(), { runDeck: [] });
  return {
    ...base,
    hand,
    drawPile: [],
    discardPile: [],
    survivor: { ...base.survivor, energy: 10, ...(overrides.survivor || {}) },
    monster: { ...base.monster, ...(overrides.monster || {}) },
    ...overrides.state
  };
}

function cardByName(name) {
  const card = Object.values(normalQuarryCards).find(item => item.name === name);
  assert.ok(card, `missing generated card ${name}`);
  return card;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

test('armour conditional Block only grants bonus after matching suite mechanic was used this turn', () => {
  const setup = cardByName('Pale Patient Edge');
  const response = cardByName('Pale Head Response');

  const withoutMechanic = playCard(0, stateWithHand([response]));
  assert.equal(withoutMechanic.survivor.block, 2);

  const afterSetup = playCard(0, stateWithHand([setup, response]));
  const withMechanic = playCard(0, {
    ...afterSetup,
    hand: [response],
    survivor: { ...afterSetup.survivor, energy: 10 }
  });
  assert.equal(withMechanic.survivor.block, 4);
});

test('normal quarry named mechanics resolve to concrete combat effects', () => {
  const cases = [
    ['Ambush', 'Pale Patient Edge', result => assert.equal(result.survivor.targetAvoidance, 1)],
    ['Pounce', 'Pale Patient Edge', result => assert.ok(result.namedMechanicsUsedThisTurn.includes('Pounce'))],
    ['Graze', 'Dust Patient Edge', result => assert.ok(result.namedMechanicsUsedThisTurn.includes('Graze'))],
    ['Charge', 'Thunder Patient Edge', result => assert.equal(result.survivor.charge, 1)],
    ['Poison', 'Wet Quick Nick', result => assert.equal(result.monster.poison, 1)],
    ['Snare', 'Silk Quick Nick', result => assert.equal(result.monster.snared, 1)],
    ['Radiance', 'Solar Quick Nick', result => assert.equal(result.monster.blind, 1)],
    ['Judgment', 'Golden Quick Nick', result => assert.equal(result.monster.marked, 1)]
  ];

  cases.forEach(([mechanic, cardName, assertEffect]) => {
    const result = playCard(0, stateWithHand([cardByName(cardName)]));
    assert.ok(
      result.namedMechanicsUsedThisTurn.includes(mechanic),
      `${mechanic} was not tracked as used`
    );
    assertEffect(result);
  });
});

test('normal quarry armour conditions only reference implemented suite mechanics', () => {
  normalQuarrySuiteDefinitions.forEach(suite => {
    const aliases = normalQuarryMechanicAliases[suite.mechanic] || [];
    const conditionNames = [suite.mechanic, ...aliases];
    const suitePrefix = `normal_${slugify(suite.buildingId)}_`;
    const suiteCards = Object.values(normalQuarryCards).filter(card =>
      card.sourceGearId?.startsWith(suitePrefix)
    );
    const implementedNames = new Set(suiteCards.flatMap(card => card.mechanics || []));
    conditionNames.forEach(name => {
      assert.ok(
        implementedNames.has(name),
        `${suite.armourSet} references ${name} without an implemented suite card mechanic`
      );
    });
  });
});

test('creature behaviour packs use monster intent effects resolved by live combat', () => {
  const supportedIntentEffects = new Set([
    'dealDamage',
    'bonusIfPlayerNoBlock',
    'gainBlock',
    'addPanic',
    'reducePlayerBlock',
    'removeAllPlayerBlock',
    'multiHitDamage',
    'applyBleed',
    'burnTarget',
    'poisonTarget',
    'doomTarget',
    'vulnerableTarget',
    'staggerTarget',
    'guardTarget',
    'markTarget',
    'exposeTarget',
    'snareTarget',
    'shockTarget',
    'blindTarget',
    'applyMarked',
    'healMonster',
    'nextAttackBonus',
    'playerEnergyPenaltyNextTurn',
    'discardRandomCard',
    'monsterStartsGuarded',
    'monsterEnrage',
    'copyPlayerBlock',
    'damageFromPlayerStrength',
    'damageFromDeckSize'
  ]);

  Object.values(creatureBehaviours).forEach(behaviour => {
    assert.ok(behaviour.intents.length > 0, `${behaviour.creatureId} has no live intents`);
    behaviour.intents.flatMap(intent => intent.effects).forEach(effect => {
      assert.ok(
        supportedIntentEffects.has(effect.type),
        `${behaviour.creatureId} behaviour uses unsupported intent effect ${effect.type}`
      );
    });
  });
});
