import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getActiveCardsForGearItem,
  getCardsForGearItem,
  getGearCardGroups,
  getPassiveCardsForGearItem
} from '../src/domain/gear/gearCardGrouping.js';

test('getGearCardGroups returns safe gear groups', () => {
  const groups = getGearCardGroups();
  assert.ok(Array.isArray(groups));
  assert.ok(groups.length > 0);
  groups.forEach(group => {
    assert.ok(group.gearId);
    assert.ok(group.gearName);
    assert.ok(Array.isArray(group.activeCards));
    assert.ok(Array.isArray(group.passiveCards));
    assert.ok(Array.isArray(group.unlinkedCards));
  });
});

test('unlinked cards are grouped and not thrown away', () => {
  const groups = getGearCardGroups({
    gearCatalog: [{ id: 'known-sword', name: 'Known Sword', itemType: 'weapon' }],
    cardCatalog: [{ id: 'loose-card', name: 'Loose Card', type: 'attack', effects: [{ type: 'damage', amount: 1 }] }]
  });
  const unlinked = groups.find(group => group.gearName === 'Unlinked Cards');
  assert.ok(unlinked);
  assert.equal(unlinked.unlinkedCards[0].id, 'loose-card');
});

test('no grouped card has null id or name', () => {
  const groups = getGearCardGroups({
    gearCatalog: [{ id: 'known-sword', name: 'Known Sword', itemType: 'weapon' }],
    cardCatalog: [{ sourceGearId: 'known-sword', type: 'attack', effects: [{ type: 'damage', amount: 1 }] }]
  });
  groups.flatMap(group => [...group.activeCards, ...group.passiveCards, ...group.unlinkedCards]).forEach(card => {
    assert.ok(card.id);
    assert.ok(card.name);
  });
});

test('gear card helper exports return arrays', () => {
  assert.ok(Array.isArray(getCardsForGearItem('starter_sword')));
  assert.ok(Array.isArray(getActiveCardsForGearItem('starter_sword')));
  assert.ok(Array.isArray(getPassiveCardsForGearItem('starter_sword')));
});

