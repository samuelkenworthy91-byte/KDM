import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createCombatState,
  getAdjustedCardCost,
  getVisibleNamedMechanicCounters,
  playCard
} from '../src/game/combatLogic.js';
import { getCardPreview } from '../src/utils/cardPreview.js';
import { getSimpleCardSummary } from '../src/utils/cardSummaries.js';
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

test('Patient Edge gains visible Ambush without hiding its existing avoidance effect', () => {
  const result = playCard(0, stateWithHand([cardByName('Pale Patient Edge')]));

  assert.equal(result.namedMechanicCounters.Ambush, 1);
  assert.equal(result.survivor.targetAvoidance, 1);
  assert.deepEqual(
    getVisibleNamedMechanicCounters(result).filter(counter => counter.name === 'Ambush'),
    [{ name: 'Ambush', amount: 1 }]
  );
});

test('Mane Held Breath Cut without Ambush deals base damage plus normal modifiers only', () => {
  const card = cardByName('Mane Held Breath Cut');
  const result = playCard(0, stateWithHand([card], {
    survivor: { strength: 2 }
  }));

  assert.equal(result.monster.hp, 33);
  assert.equal(result.namedMechanicCounters.Ambush, 0);
});

test('Mane Held Breath Cut spends chosen Ambush and removes only the spent amount', () => {
  const card = cardByName('Mane Held Breath Cut');
  const result = playCard(0, stateWithHand([card], {
    survivor: { strength: 2 },
    state: { namedMechanicCounters: { Ambush: 3 } }
  }), {
    namedMechanicSpend: { Ambush: 2 }
  });

  assert.equal(result.monster.hp, 29);
  assert.equal(result.namedMechanicCounters.Ambush, 1);
});

test('card preview includes named mechanic spend and matches runtime damage', () => {
  const card = cardByName('Mane Held Breath Cut');
  const state = stateWithHand([card], {
    survivor: { strength: 2 },
    monster: { block: 1 },
    state: { namedMechanicCounters: { Ambush: 2 } }
  });
  const preview = getCardPreview({
    card,
    combatState: state,
    playOptions: { namedMechanicSpend: { Ambush: 2 } }
  });
  const result = playCard(0, state, { namedMechanicSpend: { Ambush: 2 } });

  assert.equal(preview.monsterHpDamage, 10);
  assert.equal(state.monster.hp - result.monster.hp, 10);
  assert.match(preview.previewText, /4 Ambush spend/);
  assert.equal(preview.namedMechanicSpend.Ambush, 2);
});

test('Katar pair discount is visible and equals actual energy spent', () => {
  const card = cardByName('Pale First Hand');
  const oneKatar = stateWithHand([card], {
    survivor: { energy: 3, boundGear: [{ instanceId: 'katar-1', equipmentId: card.sourceGearId }] },
    state: { boundGear: [{ instanceId: 'katar-1', equipmentId: card.sourceGearId }] }
  });
  const twoKatars = stateWithHand([card], {
    survivor: {
      energy: 3,
      boundGear: [
        { instanceId: 'katar-1', equipmentId: card.sourceGearId },
        { instanceId: 'katar-2', equipmentId: card.sourceGearId }
      ]
    },
    state: {
      boundGear: [
        { instanceId: 'katar-1', equipmentId: card.sourceGearId },
        { instanceId: 'katar-2', equipmentId: card.sourceGearId }
      ]
    }
  });

  assert.equal(getAdjustedCardCost(card, oneKatar), 1);
  assert.equal(getAdjustedCardCost(card, twoKatars), 0);

  const preview = getCardPreview({ card, combatState: twoKatars });
  const result = playCard(0, twoKatars);
  assert.equal(preview.adjustedCost, 0);
  assert.match(preview.costSummary, /Katar pair discount/);
  assert.equal(twoKatars.survivor.energy - result.survivor.energy, preview.adjustedCost);
});

test('card wording exposes implemented named spend effects', () => {
  const card = cardByName('Mane Held Breath Cut');
  assert.ok(card.effects.some(effect => effect.type === 'spendNamedMechanicForDamage'));
  assert.match(getSimpleCardSummary(card), /spend any Ambush/i);
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
