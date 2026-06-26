import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkCombatEnd,
  createCombatState,
  drawOpeningHand,
  playCard,
  resolveMonsterTurn
} from '../src/domain/combat/combatEngine.js';
import { createSurvivor } from '../src/domain/schema/survivorSchema.js';

const attackCard = { id: 'strike', name: 'Strike', type: 'attack', effects: [{ type: 'damage', amount: 4 }] };
const guardCard = { id: 'guard', name: 'Guard', type: 'skill', effects: [{ type: 'block', amount: 2 }] };
const monster = { id: 'beast', name: 'Beast', hp: 10, maxHp: 10, damage: 2, intents: [{ id: 'bite', label: 'Bite', type: 'damage', amount: 2 }] };

function state() {
  return createCombatState({
    monster,
    survivors: [createSurvivor({ id: 's1', name: 'Ari' })],
    cards: [attackCard, guardCard, attackCard, guardCard, attackCard],
    random: () => 0
  });
}

test('combat starts with one survivor and one monster', () => {
  const combat = state();
  assert.equal(combat.survivors.length, 1);
  assert.equal(combat.monster.id, 'beast');
  assert.equal(combat.status, 'active');
});

test('opening hand draws cards', () => {
  const combat = drawOpeningHand(state());
  assert.ok(combat.hand.length > 0);
});

test('playing a card moves it out of hand', () => {
  const combat = drawOpeningHand(state());
  const next = playCard({ combatState: combat, cardId: combat.hand[0].id });
  assert.equal(next.hand.some(card => card.id === combat.hand[0].id), false);
});

test('playing an attack card damages monster', () => {
  const combat = { ...drawOpeningHand(state()), hand: [attackCard] };
  const next = playCard({ combatState: combat, cardId: 'strike' });
  assert.equal(next.monster.hp, 5);
  assert.ok(next.currentWeakPoint);
});

test('monster turn damages survivor', () => {
  const combat = state();
  const next = resolveMonsterTurn(combat);
  assert.equal(next.survivors[0].hp, 3);
});

test('combat can reach victory', () => {
  const combat = { ...state(), monster: { ...monster, hp: 0 } };
  assert.equal(checkCombatEnd(combat).status, 'victory');
});

test('combat can reach defeat', () => {
  const combat = { ...state(), survivors: [createSurvivor({ id: 's1', hp: 0, alive: false })] };
  assert.equal(checkCombatEnd(combat).status, 'defeat');
});

test('null input returns recovery state, not throw', () => {
  assert.doesNotThrow(() => createCombatState(null));
  assert.equal(createCombatState(null).status, 'recovery');
});
