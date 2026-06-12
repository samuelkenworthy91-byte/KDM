import test from 'node:test';
import assert from 'node:assert/strict';

function createStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

test('manual recovery repairs the active save and boots into settlement', async () => {
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();
  localStorage.setItem('lanternDeckbuilder.activeSlot', '1');
  localStorage.setItem('lanternDeckbuilder.saveSlot1', JSON.stringify({
    settlementName: 'Lantern Hold',
    population: 8,
    stash: { bone: 2 },
    survivors: [{ id: 'survivor-1', name: 'Ari', hp: 20, maxHp: 30 }],
    armory: [{ instanceId: 'gear-1', equipmentId: 'boneBlade' }],
    settlementHistory: [],
    appRuntime: { screen: 'combat' }
  }));

  const { consumeRecoveryBootScreen, recoverActiveSave } = await import(
    '../src/game/recoveryActions.js'
  );
  assert.equal(recoverActiveSave('manual recovery from render error', true), 'settlement');
  assert.equal(consumeRecoveryBootScreen(), 'settlement');

  const repaired = JSON.parse(localStorage.getItem('lanternDeckbuilder.saveSlot1'));
  assert.equal(repaired.settlementName, 'Lantern Hold');
  assert.equal(repaired.stash.bone, 2);
  assert.equal(repaired.survivors[0].name, 'Ari');
  assert.equal(repaired.appRuntime.screen, 'settlement');
  assert.deepEqual(repaired.appRuntime.runParty, []);
  assert.equal(
    repaired.settlementHistory.at(-1).message,
    'A broken hunt state was recovered.'
  );
});
