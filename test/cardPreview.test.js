import test from 'node:test';
import assert from 'node:assert/strict';
import { cards, legacyCompatibilityCards } from '../src/data/cards.js';
import { createCombatState } from '../src/game/combatLogic.js';
import { getCardPreview } from '../src/utils/cardPreview.js';

function stateWith(card, overrides = {}) {
  const state = createCombatState({
    id: 'previewMonster',
    quarryId: 'paleHuntLion',
    name: 'Preview Monster',
    hp: 30,
    maxHp: 30,
    block: 0,
    intents: [{
      id: 'testIntent',
      name: 'Test',
      tellText: 'Test tell.',
      revealedText: 'Test intent.',
      effects: [],
      tags: []
    }]
  }, {
    survivor: {
      id: 'preview-survivor',
      name: 'Mira',
      hp: 20,
      maxHp: 20,
      strength: 2
    },
    runDeck: [card]
  });
  return {
    ...state,
    ...overrides,
    hand: [card],
    monster: { ...state.monster, ...(overrides.monster || {}) }
  };
}

test('attack preview includes strength and monster block', () => {
  const state = stateWith(cards.foundingStone, { monster: { block: 4 } });
  const preview = getCardPreview({
    card: cards.foundingStone,
    survivor: state.survivor,
    combatState: state,
    monster: state.monster
  });
  assert.equal(preview.finalDamage, 8);
  assert.equal(preview.blockDamage, 4);
  assert.equal(preview.monsterHpDamage, 4);
  assert.match(preview.modifierBreakdown.join(' '), /Strength/);
});

test('unknown card shapes return a safe string preview', () => {
  const card = { id: 'unknown', name: 'Unknown', description: 'Do something.', effects: [] };
  const state = stateWith(card);
  const preview = getCardPreview({ card, combatState: state });
  assert.equal(typeof preview.effectSummary, 'string');
  assert.equal(Array.isArray(preview.modifierBreakdown), true);
});

test('buckler block conversion preview and effect cap at 10 damage', () => {
  const card = legacyCompatibilityCards.shieldBash;
  const state = stateWith(card);
  state.survivor = { ...state.survivor, block: 50, strength: 0 };
  state.monster = { ...state.monster, hp: 50, maxHp: 50 };

  const preview = getCardPreview({
    card,
    survivor: state.survivor,
    combatState: state,
    monster: state.monster
  });

  assert.equal(card.effects[0].maximumBonus, 10);
  assert.match(card.description, /max 10/i);
  assert.equal(preview.monsterHpDamage, 13); // 3 base + 10 bonus
  assert.equal(preview.effectSummary, 'Damage: 13');
});
