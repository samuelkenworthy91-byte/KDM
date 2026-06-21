import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDamageToSurvivor } from '../src/game/combatLogic.js';
import {
  createPartyCombatState,
  resolveMonsterTurn
} from '../src/game/partyCombatLogic.js';

function survivor(id, hp = 10) {
  return {
    id,
    name: id,
    hp,
    maxHp: 10,
    survival: 3,
    maxSurvival: 3,
    alive: true,
    boundGear: []
  };
}

function party(ids, hp = 10) {
  return ids.map(id => ({
    survivor: survivor(id, hp),
    runDeck: []
  }));
}

function monster(targetingRule, effects = [{ type: 'dealDamage', amount: 1 }]) {
  return {
    id: 'testMonster',
    name: 'Test Monster',
    hp: 20,
    maxHp: 20,
    block: 0,
    intents: [{
      id: 'testIntent',
      name: 'Test Intent',
      targetingRule,
      effects,
      tags: ['attack']
    }]
  };
}

test('damage subtracts block and reports lethal before any prevention', () => {
  const result = applyDamageToSurvivor({
    survivor: { hp: 3, block: 1 },
    amount: 5
  });
  assert.equal(result.survivor.hp, 0);
  assert.equal(result.survivor.block, 0);
  assert.equal(result.damage, 4);
  assert.equal(result.lethal, true);
  assert.equal(result.survivor.isAlive, false);
});

test('damage that naturally leaves one HP does not kill', () => {
  const result = applyDamageToSurvivor({
    survivor: { hp: 5, block: 0 },
    amount: 4
  });
  assert.equal(result.survivor.hp, 1);
  assert.equal(result.lethal, false);
});

test('selected random target receives damage and is cleared after resolution', () => {
  const state = createPartyCombatState(
    monster('random'),
    party(['Survivor 1', 'Survivor 2', 'Survivor 3', 'Survivor 4'])
  );
  const result = resolveMonsterTurn(state, { random: () => 0.99 });

  assert.equal(result.monster.currentIntent, null);
  assert.deepEqual(result.lastTargetIds, []);
  assert.equal(result.lastTargetId, null);
  assert.equal('selectedTargetIds' in result, false);
  assert.equal('selectedTargetIds' in result.monster.intents[0], false);
  assert.equal(result.members[0].survivor.hp, 10);
  assert.equal(result.members[3].survivor.hp, 9);
  assert.match(result.combatLog.at(-1), /Test Monster randomly targets Survivor 4/);
});

test('consecutive monster turns reroll without reusing cached target ids', () => {
  const ids = ['Survivor 1', 'Survivor 2', 'Survivor 3', 'Survivor 4'];
  const calls = [];
  let state = createPartyCombatState(monster('random'), party(ids));
  state.monster.currentIntent = {
    ...state.monster.intents[0],
    selectedTargetIds: ['Survivor 1']
  };
  state.lastTargetId = 'Survivor 1';
  state.lastTargetIds = ['Survivor 1'];

  state = resolveMonsterTurn(state, {
    random: () => {
      calls.push('turn-1');
      return 0.8;
    }
  });
  assert.equal(state.members[3].survivor.hp, 9);
  assert.equal(state.monster.currentIntent, null);
  assert.deepEqual(state.lastTargetIds, []);

  state.activeCombatant = 'monster';
  state.activePartyIndex = -1;
  state = resolveMonsterTurn(state, {
    random: () => {
      calls.push('turn-2');
      return 0.3;
    }
  });

  assert.deepEqual(calls, ['turn-1', 'turn-2']);
  assert.equal(state.members[1].survivor.hp, 9);
  assert.equal(state.members[3].survivor.hp, 9);
  assert.equal(state.monster.currentIntent, null);
  assert.deepEqual(state.lastTargetIds, []);
  assert.match(state.combatLog.at(-1), /Test Monster randomly targets Survivor 2/);
});

test('all-target intent damages each living survivor and applies monster effects once', () => {
  const state = createPartyCombatState(
    monster('all', [
      { type: 'dealDamage', amount: 1 },
      { type: 'gainBlock', amount: 5 }
    ]),
    party(['Holt', 'Mira', 'Sen'])
  );
  const result = resolveMonsterTurn(state, { random: () => 0.99 });

  assert.deepEqual(result.members.map(member => member.survivor.hp), [9, 9, 9]);
  assert.equal(result.monster.block, 5);
  assert.deepEqual(result.lastTargetIds, []);
  assert.equal(result.monster.currentIntent, null);
  assert.match(result.combatLog.at(-1), /Test Monster hits all living survivors/);
});

test('two random rerolls fresh unique targets on consecutive monster turns', () => {
  const ids = ['Holt', 'Mira', 'Sen', 'Ash'];
  let state = createPartyCombatState(monster('twoRandom'), party(ids));
  const firstRolls = [0, 0];
  state = resolveMonsterTurn(state, { random: () => firstRolls.shift() });
  assert.deepEqual(state.members.map(member => member.survivor.hp), [9, 9, 10, 10]);

  state.activeCombatant = 'monster';
  state.activePartyIndex = -1;
  const secondRolls = [0.99, 0.99];
  state = resolveMonsterTurn(state, { random: () => secondRolls.shift() });

  assert.deepEqual(state.members.map(member => member.survivor.hp), [9, 9, 9, 9]);
  assert.equal(state.monster.currentIntent, null);
  assert.deepEqual(state.lastTargetIds, []);
});

for (const [hp, damage] of [[1, 1], [2, 2], [5, 7]]) {
  test(`${hp} HP survivor dies immediately from ${damage} damage`, () => {
    const state = createPartyCombatState(
      monster('front', [{ type: 'dealDamage', amount: damage }]),
      party(['Mira'], hp)
    );
    state.members[0].boundGear = [{ instanceId: 'gear-1', equipmentId: 'testGear' }];
    const result = resolveMonsterTurn(state, { random: () => 0.99 });

    assert.equal(result.members[0].survivor.hp, 0);
    assert.equal(result.members[0].survivor.isAlive, false);
    assert.equal(result.members[0].status, 'dead');
    assert.deepEqual(result.members[0].boundGear, []);
    assert.equal(result.members[0].destroyedBoundGear.length, 1);
    assert.deepEqual(result.combatTurnOrder, ['monster']);
    assert.equal(result.status, 'lost');
    assert.match(result.combatLog.at(-1), /is killed by Test Monster/i);
  });
}

test('combat creation repairs a dead active member and advances to a living survivor', () => {
  const bonuses = party(['Dead', 'Living']);
  bonuses[0].survivor.hp = 0;
  bonuses[0].survivor.alive = true;
  const state = createPartyCombatState(monster('random'), bonuses);

  assert.equal(state.members[0].status, 'dead');
  assert.equal(state.activeCombatant, 'Living');
  assert.equal(state.activePartyIndex, 1);
  assert.deepEqual(state.combatTurnOrder, ['Living', 'monster']);
});

test('combat creation ignores invalid party bonuses without throwing', () => {
  const state = createPartyCombatState(monster('random'), [null, {}, { survivor: null }]);

  assert.deepEqual(state.members, []);
  assert.equal(state.activeCombatant, 'monster');
  assert.equal(state.activePartyIndex, -1);
  assert.equal(state.status, 'lost');
});

test('combat creation still creates members from valid bonuses', () => {
  const state = createPartyCombatState(
    monster('random'),
    [null, ...party(['Mira', 'Holt'])]
  );

  assert.equal(state.members.length, 2);
  assert.deepEqual(state.members.map(member => member.survivor.id), ['Mira', 'Holt']);
  assert.equal(state.activeCombatant, 'Mira');
  assert.equal(state.status, 'playing');
});

test('death prevention traits do not save a survivor at zero HP', () => {
  const state = createPartyCombatState(
    monster('front', [{ type: 'dealDamage', amount: 2 }]),
    party(['Mira'], 1)
  );
  state.members[0].traits = ['scarless'];
  state.members[0].fightingArts = ['impossibleRefusal'];
  state.members[0].artPassives = [{ type: 'preventDeathWithWound', value: 1 }];
  const result = resolveMonsterTurn(state, { random: () => 0.99 });

  assert.equal(result.members[0].status, 'dead');
  assert.equal(result.status, 'lost');
  assert.equal(result.members[0].survivor.hp, 0);
});
