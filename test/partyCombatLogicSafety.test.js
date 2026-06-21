import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPartyCombatState,
  playPartyCard,
  resolveMonsterTurn
} from '../src/game/partyCombatLogic.js';

function survivor(id = 'survivor') {
  return {
    id,
    name: id,
    hp: 5,
    maxHp: 5,
    survival: 1,
    maxSurvival: 3,
    alive: true,
    boundGear: []
  };
}

function bonus(id = 'survivor') {
  return {
    survivor: survivor(id),
    runDeck: [],
    strength: 0,
    startingBlock: 0
  };
}

test('createPartyCombatState with null monster and empty party returns recovery state', () => {
  let state;
  assert.doesNotThrow(() => {
    state = createPartyCombatState(null, []);
  });

  assert.equal(state.status, 'lost');
  assert.equal(state.monster.id, 'monster');
  assert.ok(Array.isArray(state.combatLog));
});

test('createPartyCombatState supplies fallback intents for monsters without intents', () => {
  let state;
  assert.doesNotThrow(() => {
    state = createPartyCombatState({ id: 'beast', name: 'Beast', hp: 5, maxHp: 5 }, [bonus()]);
  });

  assert.equal(state.monster.id, 'beast');
  assert.ok(state.monster.intents.length > 0);
});

test('resolveMonsterTurn with malformed state does not throw', () => {
  let state;
  assert.doesNotThrow(() => {
    state = resolveMonsterTurn({ status: 'playing', monster: null, members: [null], combatLog: [] });
  });

  assert.equal(state.status, 'lost');
  assert.match(state.combatLog.at(-1), /Combat recovery|no valid monster target/);
});

test('playPartyCard with malformed active state does not throw', () => {
  let state;
  assert.doesNotThrow(() => {
    state = playPartyCard(0, {
      status: 'playing',
      activePartyIndex: 0,
      monster: null,
      members: [{ survivor: null }],
      combatLog: []
    });
  });

  assert.equal(state.status, 'lost');
  assert.ok(Array.isArray(state.combatLog));
});
