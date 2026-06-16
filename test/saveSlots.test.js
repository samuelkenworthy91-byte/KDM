import assert from 'node:assert/strict';
import test from 'node:test';

import {
  defaultSettlement,
  deleteSettlement,
  getActiveSlot,
  getSaveSlotKey,
  listSaveSlots,
  loadSettlement,
  saveSettlement,
  setActiveSlot
} from '../src/game/saveLogic.js';

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear()
  };
}

function settlement(name) {
  return {
    ...defaultSettlement,
    settlementName: name,
    population: 1,
    survivors: []
  };
}

test('save slot 1 can be created and deleted without legacy remigration', () => {
  globalThis.localStorage = createStorage();
  localStorage.setItem('settlement', JSON.stringify(settlement('Legacy Hold')));
  listSaveSlots();
  assert.equal(loadSettlement(1).settlementName, 'Legacy Hold');

  deleteSettlement(1);

  assert.equal(localStorage.getItem(getSaveSlotKey(1)), null);
  assert.equal(localStorage.getItem('settlement'), null);
  assert.equal(loadSettlement(1), null);
  assert.equal(listSaveSlots()[0].settlement, null);
});

test('deleting slot 1 leaves slot 2 intact', () => {
  globalThis.localStorage = createStorage();
  saveSettlement(settlement('First Hold'), 1);
  saveSettlement(settlement('Second Hold'), 2);

  deleteSettlement(1);

  assert.equal(loadSettlement(1), null);
  assert.equal(loadSettlement(2).settlementName, 'Second Hold');
});

test('deleting slot 2 leaves slot 1 intact', () => {
  globalThis.localStorage = createStorage();
  saveSettlement(settlement('First Hold'), 1);
  saveSettlement(settlement('Second Hold'), 2);

  deleteSettlement(2);

  assert.equal(loadSettlement(1).settlementName, 'First Hold');
  assert.equal(loadSettlement(2), null);
});

test('all save slots delete their own storage key', () => {
  globalThis.localStorage = createStorage();
  [1, 2, 3].forEach(slotId => {
    saveSettlement(settlement(`Hold ${slotId}`), slotId);
    assert.notEqual(localStorage.getItem(getSaveSlotKey(slotId)), null);

    deleteSettlement(slotId);

    assert.equal(localStorage.getItem(getSaveSlotKey(slotId)), null);
    assert.equal(loadSettlement(slotId), null);
  });
});

test('deleting current active slot clears the active slot marker and loaded save', () => {
  globalThis.localStorage = createStorage();
  saveSettlement(settlement('First Hold'), 1);
  setActiveSlot(1);

  deleteSettlement(1);

  assert.equal(localStorage.getItem('lanternDeckbuilder.activeSlot'), null);
  assert.equal(loadSettlement(1), null);
  assert.equal(getActiveSlot(), 1);
});
