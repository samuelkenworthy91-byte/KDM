import test from 'node:test';
import assert from 'node:assert/strict';
import { playCard, createCombatState } from '../src/game/combatLogic.js';
import { getCardPreview } from '../src/utils/cardPreview.js';

function monster() {
  return {
    id: 'statusMonster',
    name: 'Status Monster',
    hp: 30,
    maxHp: 30,
    block: 0,
    intents: []
  };
}

function stateWithCard(card) {
  const base = createCombatState(monster(), { runDeck: [] });
  return {
    ...base,
    hand: [card],
    survivor: {
      ...base.survivor,
      energy: 3
    }
  };
}

test('Penumbra Bow statusApplied object does not crash', () => {
  const card = {
    id: 'penumbraBowOpeningStrike',
    name: 'Penumbra Bow — Opening Strike',
    cost: 1,
    type: 'attack',
    statusApplied: {
      "Bleed": 3,
      "Dodge": 1
    },
    effects: [] 
  };

  // Should NOT throw
  const result = playCard(0, stateWithCard(card));
  assert.ok(result);
  // Bleed 3 should NOT be applied if effects is empty (since it's an object statusApplied)
  assert.equal(result.monster.bleed || 0, 0);
});

test('Penumbra Bow with effects applies statuses correctly', () => {
  const card = {
    id: 'penumbraBowOpeningStrike',
    name: 'Penumbra Bow — Opening Strike',
    cost: 1,
    type: 'attack',
    statusApplied: {
      "Bleed": 3,
      "Dodge": 1
    },
    effects: [
      { type: 'bleedTarget', amount: 3 },
      { type: 'guardSelf', amount: 1 }
    ]
  };

  const result = playCard(0, stateWithCard(card));
  assert.equal(result.monster.bleed, 3);
  assert.equal(result.survivor.guarded, 1);
});

test('Legacy string statusApplied still works if no effects', () => {
  const card = {
    id: 'legacyCard',
    name: 'Legacy Card',
    cost: 1,
    type: 'attack',
    statusApplied: "Apply Bleed 2",
    effects: []
  };

  const result = playCard(0, stateWithCard(card));
  assert.equal(result.monster.bleed, 2);
});

test('Representative cards with object statusApplied', () => {
  const cards = [
    { id: 'acidToothKnifeOpeningCut', statusApplied: { "Bleed": 1 } },
    { id: 'amberBowOpeningStrike', statusApplied: { "Bleed": 2 } },
    { id: 'boneAxeOpeningStrike', statusApplied: { "Bleed": 2 } },
    { id: 'catgutBowOpeningStrike', statusApplied: { "Bleed": 1 } },
    { id: 'noonsharkBowOpeningStrike', statusApplied: { "Bleed": 3 } }
  ];

  for (const cardData of cards) {
    const card = {
      ...cardData,
      name: 'Test Card',
      cost: 1,
      type: 'attack',
      effects: []
    };
    assert.doesNotThrow(() => {
      playCard(0, stateWithCard(card));
    }, `Card ${card.id} crashed`);
  }
});

test('Penumbra Bow preview does not include Exact preview unavailable', () => {
  const card = {
    id: 'penumbraBowOpeningStrike',
    name: 'Penumbra Bow — Opening Strike',
    cost: 1,
    type: 'attack',
    description: 'Deal 3 damage. Apply Bleed 3. Gain Dodge 1 if you have no Dodge.',
    statusApplied: {
      "Bleed": 3,
      "Dodge": 1
    },
    effects: [
      { type: 'damage', amount: 3 },
      { type: 'bleedTarget', amount: 3 },
      { type: 'guardSelf', amount: 1 }
    ]
  };

  const combatState = createCombatState(monster(), { runDeck: [] });
  const preview = getCardPreview({
    card,
    combatState
  });

  assert.ok(preview);
  assert.ok(!preview.warnings.includes('Exact preview unavailable'));
  assert.match(preview.effectSummary, /Damage: 3/);
});
