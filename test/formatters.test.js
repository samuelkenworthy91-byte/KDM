import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCardFrontText,
  formatCostForDisplay,
  formatEffectForDisplay,
  formatEffectsForDisplay,
  formatHistoryDetail,
  formatModifierEffect,
  formatRewardForDisplay,
  formatValueForDisplay
} from '../src/utils/formatters.js';

test('formats common type and amount effects', () => {
  assert.equal(
    formatEffectForDisplay({ type: 'settlementMemory', amount: 1 }),
    '+1 Settlement Memory'
  );
  assert.equal(
    formatEffectForDisplay({ type: 'population', amount: -1 }),
    '-1 Population'
  );
  assert.equal(
    formatEffectForDisplay({ type: 'resource', resourceId: 'bone', amount: 2 }),
    '+2 Bone'
  );
  assert.equal(formatEffectForDisplay({ type: 'heal', amount: 2 }), 'Heal 2 HP');
  assert.equal(formatEffectForDisplay({ type: 'addPanic', amount: 1 }), 'Add 1 Panic');
});

test('formats registry ids and compound display values', () => {
  assert.equal(
    formatEffectForDisplay({ type: 'unlockInnovation', id: 'trailSignals' }),
    'Unlocks innovation: Trail Signals'
  );
  assert.equal(
    formatEffectForDisplay({ type: 'unlockBuilding', id: 'lionTrophyHall' }),
    'Unlocks location: Lion Trophy Hall'
  );
  assert.equal(formatCostForDisplay({ bone: 2, hide: 1 }), '2 Bone, 1 Hide');
  assert.equal(
    formatEffectsForDisplay([{ type: 'survival', amount: 1 }, 'Stay ready']),
    '+1 Survival, Stay ready'
  );
});

test('formats reward, modifier, history, and unknown objects without returning objects', () => {
  const values = [
    formatRewardForDisplay({ mechanicalEffect: { type: 'strength', amount: 1 } }),
    formatModifierEffect({ type: 'gainBlock', amount: 3 }),
    formatHistoryDetail([{ type: 'settlementMemory', amount: 1 }]),
    formatValueForDisplay({ legacyShape: { amount: 2 } })
  ];
  values.forEach(value => assert.equal(typeof value, 'string'));
  assert.match(values[3], /legacyShape/);
});

test('formatCardFrontText simplifies common card effects', () => {
  const card = {
    id: 'test-card',
    effects: [
      { type: 'damage', amount: 5 },
      { type: 'globalBlockCardBonus', amount: 1 }
    ]
  };
  const text = formatCardFrontText(card);
  assert.match(text, /Deal 5 damage/);
  assert.match(text, /All Block cards give \+1 more Block this fight/);
});
