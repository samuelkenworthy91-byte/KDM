import assert from 'node:assert/strict';
import test from 'node:test';

import { resetSettlementSave, saveSettlement, loadSettlement, SAVE_KEY } from '../src/domain/save/localSave.js';
import { createNewSettlement } from '../src/domain/settlement/createSettlement.js';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: key => data.get(key) || null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
    has: key => data.has(key)
  };
}

test('new settlement always has at least one survivor', () => {
  const settlement = createNewSettlement({ name: 'Test' });
  assert.ok(settlement.survivors.length >= 1);
});

test('survivors have safe IDs and names', () => {
  const settlement = createNewSettlement();
  settlement.survivors.forEach(survivor => {
    assert.ok(survivor.id);
    assert.ok(survivor.name);
    assert.notEqual(survivor.id, 'null');
  });
});

test('local save serialises and deserialises without throwing', () => {
  const storage = memoryStorage();
  const settlement = createNewSettlement({ name: 'Ash Home' });
  assert.doesNotThrow(() => saveSettlement(settlement, storage));
  const loaded = loadSettlement(storage);
  assert.equal(loaded.name, 'Ash Home');
});

test('reset save clears data', () => {
  const storage = memoryStorage();
  saveSettlement(createNewSettlement(), storage);
  assert.equal(storage.has(SAVE_KEY), true);
  resetSettlementSave(storage);
  assert.equal(storage.has(SAVE_KEY), false);
});

test('settlement with null survivor entries normalises safely', () => {
  const settlement = createNewSettlement({ survivors: [null, { id: null, name: null }] });
  assert.equal(settlement.survivors.length, 1);
  assert.ok(settlement.survivors[0].id);
  assert.ok(settlement.survivors[0].name);
});
