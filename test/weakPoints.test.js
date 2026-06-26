import assert from 'node:assert/strict';
import test from 'node:test';

import { createCombatState, playCard } from '../src/domain/combat/combatEngine.js';
import { createWeakPointDeck, resolveWeakPointHit } from '../src/domain/combat/weakPoints.js';
import { createSurvivor } from '../src/domain/schema/survivorSchema.js';

test('monster without weak points gets generic weak points', () => {
  const deck = createWeakPointDeck({ id: 'blank' });
  assert.equal(deck.length, 3);
  deck.forEach(point => {
    assert.ok(point.id);
    assert.ok(point.name);
  });
});

test('attack reveals one weak point', () => {
  const card = { id: 'strike', name: 'Strike', type: 'attack', effects: [{ type: 'damage', amount: 2 }] };
  const state = createCombatState({
    monster: { id: 'beast', name: 'Beast', hp: 10, weakPoints: [{ id: 'soft', name: 'Soft', effect: { bonusDamage: 1 }, text: '+1 damage.' }] },
    survivors: [createSurvivor({ id: 's1' })],
    cards: [card],
    random: () => 0
  });
  const next = playCard({ combatState: { ...state, hand: [card], drawPile: [] }, cardId: 'strike' });
  assert.equal(next.currentWeakPoint.name, 'Soft');
  assert.equal(next.revealedWeakPoints.length, 1);
});

test('weak point effect changes damage and survival/log', () => {
  const state = createCombatState({
    monster: { id: 'beast', name: 'Beast', hp: 10 },
    survivors: [createSurvivor({ id: 's1', survival: 1, maxSurvival: 3 })],
    cards: [{ id: 'strike', name: 'Strike', type: 'attack', effects: [{ type: 'damage', amount: 2 }] }]
  });
  const resolved = resolveWeakPointHit({
    combatState: state,
    card: { id: 'strike', name: 'Strike', type: 'attack' },
    weakPoint: { id: 'nerve', name: 'Nerve', effect: { bonusDamage: 1, gainSurvival: 1 }, text: 'Gain survival.' },
    damage: 2
  });
  assert.equal(resolved.damage, 3);
  assert.equal(resolved.combatState.survivors[0].survival, 2);
  assert.match(resolved.log.join(' '), /Nerve/);
});

test('no weak point has null labels', () => {
  createWeakPointDeck({ weakPoints: [{}] }).forEach(point => {
    assert.ok(point.id);
    assert.ok(point.name);
    assert.ok(point.text);
  });
});

