import test from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../src/data/cards.js';
import { createCombatState } from '../src/game/combatLogic.js';
import { getCardPreview } from '../src/utils/cardPreview.js';
import { createMonsterWeakPoints } from '../src/data/weakPoints.js';

function stateWith(card, overrides = {}) {
  const state = createCombatState({
    id: 'previewMonster',
    quarryId: 'paleHuntLion',
    name: 'Preview Monster',
    hp: 30,
    maxHp: 30,
    block: 0,
    weakPoints: createMonsterWeakPoints('paleHuntLion', 3),
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

test('weak-point preview marks severe overkill on fragile part with harvest warning', () => {
  const state = stateWith(cards.wildSwing, {
    hasMonsterBane: true,
    monster: {
      intents: [{
        id: 'lanternShakingRoar',
        name: 'Roar',
        tellText: 'Roar',
        revealedText: 'Roar',
        effects: [],
        tags: ['panic']
      }]
    }
  });
  const paleHead = state.monster.weakPoints.find(point => point.id === 'paleHead');
  paleHead.currentBreakDamage = 14;
  const preview = getCardPreview({
    card: cards.wildSwing,
    survivor: state.survivor,
    combatState: {
      ...state,
      selectedWeakPointId: paleHead.id,
      hasMonsterBane: true
    },
    monster: state.monster,
    selectedWeakPoint: paleHead
  });

  assert.equal(preview.willBreakWeakPoint, true);
  assert.equal(preview.overkillSeverity, 'Severe');
  assert.match(preview.harvestWarning, /Fragile part warning/);
  assert.equal(preview.harvestLikelyQuality, 'Ruined harvest risk');
  assert.equal(preview.harvestFamily, 'head');
  assert.match(preview.harvestRarePartHint, /elderPaleFang/);
});

test('weak-point preview marks safe body break and low harvest risk', () => {
  const card = {
    id: 'carefulHit',
    name: 'Careful Hit',
    type: 'attack',
    cost: 1,
    tags: [],
    effects: [{ type: 'damage', amount: 4 }]
  };
  const state = stateWith(card, {
    survivor: { id: 'preview-survivor', name: 'Mira', hp: 20, maxHp: 20, strength: 0 }
  });
  const body = state.monster.weakPoints.find(point => point.id === 'hungryBody');
  body.currentBreakDamage = 4;
  body.breakValue = 8;
  body.harvestProfile = {
    ...body.harvestProfile,
    fragile: false,
    overkillSensitive: false
  };
  const preview = getCardPreview({
    card,
    survivor: state.survivor,
    combatState: {
      ...state,
      selectedWeakPointId: body.id,
      hasMonsterBane: true
    },
    monster: state.monster,
    selectedWeakPoint: body
  });

  assert.equal(preview.willBreakWeakPoint, true);
  assert.equal(preview.overkillSeverity, 'Safe');
  assert.equal(preview.harvestLikelyQuality, 'Likely clean harvest');
  assert.equal(preview.harvestFamily, 'body');
  assert.equal(preview.failedBreakConsequence, 'none');
});

test('weak-point preview shows failed-break risk and suppression', () => {
  const card = {
    id: 'lightTap',
    name: 'Light Tap',
    type: 'attack',
    cost: 1,
    tags: ['precise'],
    effects: [{ type: 'damage', amount: 1 }]
  };
  const state = stateWith(card, {
    survivor: { id: 'preview-survivor', name: 'Mira', hp: 20, maxHp: 20, strength: 0 },
    hasMonsterBane: true,
    monster: {
      intents: [{
        id: 'lanternShakingRoar',
        name: 'Roar',
        tellText: 'Roar',
        revealedText: 'Roar',
        effects: [],
        tags: ['panic']
      }]
    }
  });
  const paleHead = state.monster.weakPoints.find(point => point.id === 'paleHead');
  const preview = getCardPreview({
    card,
    survivor: state.survivor,
    combatState: {
      ...state,
      selectedWeakPointId: paleHead.id,
      hasMonsterBane: true
    },
    monster: state.monster,
    selectedWeakPoint: paleHead
  });

  assert.equal(preview.willBreakWeakPoint, false);
  assert.match(preview.failedBreakConsequence, /Panic 1/);
  assert.equal(preview.failedBreakRiskSuppressed, true);
  assert.match(preview.failedBreakBreakdown.suppressionReason, /tell is open/);
});
