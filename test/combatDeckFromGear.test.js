import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCombatDeckForSurvivor } from '../src/domain/combat/combatDeck.js';

const gearCatalog = [
  { id: 'test-sword', name: 'Test Sword', itemType: 'weapon', slot: 'weapon' },
  { id: 'test-charm', name: 'Test Charm', itemType: 'tool', slot: 'tool', passiveText: 'Stay steady.' }
];
const cardCatalog = [
  { id: 'test-cut', name: 'Test Cut', type: 'attack', sourceGearId: 'test-sword', effects: [{ type: 'damage', amount: 3 }] },
  { id: 'test-focus', name: 'Test Focus', type: 'passive', sourceGearId: 'test-charm', description: 'Passive focus.' },
  { id: 'unrelated-hit', name: 'Unrelated Hit', type: 'attack', sourceGearId: 'other-gear', effects: [{ type: 'damage', amount: 9 }] }
];

test('buildCombatDeckForSurvivor returns draw pile, passives, and source groups', () => {
  const deck = buildCombatDeckForSurvivor({
    survivor: { id: 's1', gear: ['test-sword', 'test-charm'] },
    cardCatalog,
    gearCatalog
  });
  assert.ok(Array.isArray(deck.drawPile));
  assert.ok(Array.isArray(deck.passives));
  assert.ok(Array.isArray(deck.sourceGroups));
});

test('deck order is deterministic for the same loadout without random', () => {
  const input = { survivor: { id: 's1', gear: ['test-sword', 'test-charm'] }, cardCatalog, gearCatalog };
  assert.deepEqual(
    buildCombatDeckForSurvivor(input).drawPile.map(card => card.id),
    buildCombatDeckForSurvivor(input).drawPile.map(card => card.id)
  );
});

test('passives are not shuffled into draw pile', () => {
  const deck = buildCombatDeckForSurvivor({
    survivor: { id: 's1', gear: ['test-sword', 'test-charm'] },
    cardCatalog,
    gearCatalog
  });
  assert.equal(deck.drawPile.some(card => card.id === 'test-focus'), false);
  assert.ok(deck.passives.some(card => card.id === 'test-focus'));
});

test('unrelated catalog cards are not selected when linked gear cards exist', () => {
  const deck = buildCombatDeckForSurvivor({
    survivor: { id: 's1', gear: ['test-sword'] },
    cardCatalog,
    gearCatalog
  });
  assert.deepEqual(deck.drawPile.map(card => card.id), ['test-cut']);
});

test('fallback starter deck is used only when no linked gear cards exist', () => {
  const linked = buildCombatDeckForSurvivor({
    survivor: { id: 's1', gear: ['test-sword'] },
    cardCatalog,
    gearCatalog
  });
  assert.equal(linked.warnings.length, 0);

  const fallback = buildCombatDeckForSurvivor({
    survivor: { id: 's1', gear: ['empty-gear'] },
    cardCatalog: [],
    gearCatalog: [{ id: 'empty-gear', name: 'Empty Gear' }]
  });
  assert.ok(fallback.warnings.includes('No linked gear cards found; fallback starter deck used.'));
  assert.ok(fallback.drawPile.length > 0);
});

