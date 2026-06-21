import assert from 'node:assert/strict';
import test from 'node:test';

import { completeMapNode } from '../src/game/mapLogic.js';
import {
  buildSafePartyCombatBonuses,
  createScoutFightNode,
  getCompletionNodeId,
  hasRecoverableHuntRoute,
  isValidSelectableNode
} from '../src/game/huntRouting.js';
import { createSurvivor } from '../src/game/saveLogic.js';

test('hunt node selection helpers reject null and incomplete nodes without throwing', () => {
  assert.equal(isValidSelectableNode(null), false);
  assert.equal(isValidSelectableNode({ id: 'node-1' }), false);
  assert.equal(isValidSelectableNode({ type: 'fight' }), false);
  assert.equal(isValidSelectableNode({ id: 'node-1', type: 'fight' }), true);
});

test('recoverable hunt route requires a map and living party', () => {
  assert.equal(hasRecoverableHuntRoute([[{ id: 'n1' }]], [{ id: 's1', hp: 1 }]), true);
  assert.equal(hasRecoverableHuntRoute([], [{ id: 's1', hp: 1 }]), false);
  assert.equal(hasRecoverableHuntRoute([[{ id: 'n1' }]], [null, { id: 's1', hp: 0 }]), false);
});

test('fight setup tolerates null partyCombatBonuses and rebuilds fallback decks', () => {
  const survivor = {
    ...createSurvivor('Ari'),
    id: 'ari',
    hp: 20,
    boundGear: [],
    fightingArts: []
  };
  const bonuses = buildSafePartyCombatBonuses({
    runParty: [survivor],
    existingBonuses: [null, { survivor: null }],
    settlement: { builtInnovations: [] },
    monsterId: 'lion',
    quarryId: 'paleHuntLion',
    getLoadoutBonus: () => ({ strength: 1, startingBlock: 2 })
  });

  assert.equal(bonuses.length, 1);
  assert.equal(bonuses[0].survivor.id, 'ari');
  assert.equal(Array.isArray(bonuses[0].runDeck), true);
  assert.equal(bonuses[0].huntDeckConditionsApplied, true);
  assert.equal(bonuses[0].strength, 1);
});

test('Scout the Dark fight node completes the original rest node id', () => {
  const origin = {
    id: 'rest-1',
    type: 'rest',
    row: 0,
    column: 1,
    connections: ['next'],
    available: true,
    completed: false
  };
  const scoutFight = createScoutFightNode(origin);
  assert.equal(scoutFight.id, 'rest-1:scout-fight');
  assert.equal(scoutFight.sourceNodeId, 'rest-1');
  assert.equal(getCompletionNodeId(scoutFight), 'rest-1');

  const completed = completeMapNode([[origin]], getCompletionNodeId(scoutFight));
  assert.equal(completed[0][0].id, 'rest-1');
  assert.equal(completed[0][0].completed, true);
});
