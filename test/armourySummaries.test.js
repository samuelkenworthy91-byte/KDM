
import test from 'node:test';
import assert from 'node:assert/strict';
import { getSimpleCardSummary, getCardTag } from '../src/utils/cardSummaries.js';

test('getSimpleCardSummary provides simplified text for Beetugle Showdown Use', () => {
  const card = {
    id: 'beetugleShowdownPhaseUse',
    name: 'Beetugle (Showdown Phase) — Use',
    shortEffect: 'Gain +3 to the next harvest, retreat, or weak-point test. If it fails, apply Marked 2 to the quarry or clear it from a survivor. Harvest tool: improves weak-point reward planning. Precision: better match for delicate weak points.'
  };
  
  const summary = getSimpleCardSummary(card);
  
  assert.strictEqual(summary, "Improves your next harvest or weak-point test. If it fails, the quarry becomes easier to track.");
  assert.ok(!summary.includes("Harvest tool"));
  assert.ok(!summary.includes("Precision"));
  assert.ok(!summary.includes("+3"));
});

test('getSimpleCardSummary provides simplified text for Beetugle Showdown Contingency', () => {
  const card = {
    id: 'beetugleShowdownPhaseContingency',
    name: 'Beetugle (Showdown Phase) — Contingency',
    shortEffect: 'When a hunt or monster consequence is previewed, reduce it by 3; on retreat, preserve 2 gathered resource. Safety: prevents accidental resource loss.'
  };
  
  const summary = getSimpleCardSummary(card);
  
  assert.strictEqual(summary, "Makes a bad hunt or monster result less punishing and helps protect gathered resources.");
  assert.ok(!summary.includes("Safety"));
  assert.ok(!summary.includes("reduce it by 3"));
});

test('getCardTag categorizes cards correctly', () => {
  assert.strictEqual(getCardTag({ type: 'attack' }), 'Attack');
  assert.strictEqual(getCardTag({ tags: ['Harvest'] }), 'Harvest');
  assert.strictEqual(getCardTag({ block: 5 }), 'Defence');
  assert.strictEqual(getCardTag({ heal: 2 }), 'Heal');
  assert.strictEqual(getCardTag({ aura: 'some-aura' }), 'Aura');
  assert.strictEqual(getCardTag({}), 'Support');
});
