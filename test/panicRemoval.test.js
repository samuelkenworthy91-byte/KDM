import assert from 'node:assert/strict';
import test from 'node:test';
import { removePanicFromSurvivor } from '../src/game/deckLogic.js';

test('removePanicFromSurvivor removes Panic from all relevant piles', () => {
  const survivor = {
    id: 's1',
    personalDeckAdditions: ['panic', 'strike'],
    permanentNegativeCards: ['panic', 'doom'],
    hand: [{ id: 'panic' }, { id: 'slash' }],
    drawPile: [{ id: 'panic' }, { id: 'block' }],
    discardPile: [{ id: 'panic' }, { id: 'panic' }],
    exhaustPile: [{ id: 'panic' }]
  };

  const amount = 3;
  const result = removePanicFromSurvivor(survivor, amount);

  // Check personalDeckAdditions
  assert.equal(result.personalDeckAdditions.filter(id => id === 'panic').length, 0); // 1 removed
  // Check permanentNegativeCards
  assert.equal(result.permanentNegativeCards.filter(id => id === 'panic').length, 0); // 1 removed
  // Check hand
  assert.equal(result.hand.filter(c => c.id === 'panic').length, 0); // 1 removed (Total 3 removed)
  
  // These should still have panic because we only removed 3
  assert.equal(result.drawPile.filter(c => c.id === 'panic').length, 1);
  assert.equal(result.discardPile.filter(c => c.id === 'panic').length, 2);
  assert.equal(result.exhaustPile.filter(c => c.id === 'panic').length, 1);
});

test('removePanicFromSurvivor removes all Panic if amount is high', () => {
  const survivor = {
    id: 's1',
    personalDeckAdditions: ['panic'],
    permanentNegativeCards: ['panic'],
    hand: [{ id: 'panic' }],
    drawPile: [{ id: 'panic' }],
    discardPile: [{ id: 'panic' }],
    exhaustPile: [{ id: 'panic' }]
  };

  const result = removePanicFromSurvivor(survivor, 10);

  assert.equal(result.personalDeckAdditions.includes('panic'), false);
  assert.equal(result.permanentNegativeCards.includes('panic'), false);
  assert.equal(result.hand.some(c => c.id === 'panic'), false);
  assert.equal(result.drawPile.some(c => c.id === 'panic'), false);
  assert.equal(result.discardPile.some(c => c.id === 'panic'), false);
  assert.equal(result.exhaustPile.some(c => c.id === 'panic'), false);
});
