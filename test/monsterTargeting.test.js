import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getIntentTargetRule,
  getTargetingTell,
  selectMonsterTargets,
  selectRandomLivingSurvivor
} from '../src/game/monsterTargeting.js';

const party = [
  { survivor: { id: 'one', name: 'Holt', hp: 10, maxHp: 20 } },
  { survivor: { id: 'two', name: 'Mira', hp: 4, maxHp: 20 } },
  { survivor: { id: 'dead', name: 'Sen', hp: 0, maxHp: 20 }, status: 'dead' },
  { survivor: { id: 'four', name: 'Ash', hp: 8, maxHp: 20 } }
];

test('legacy smart and front rules normalize to random living survivor', () => {
  for (const targetingRule of ['front', 'lowestHp', 'lastAttacker', 'mostBlock', 'random']) {
    assert.equal(
      getIntentTargetRule({ targetingRule, effects: [{ type: 'dealDamage', amount: 1 }] }),
      'randomLivingSurvivor'
    );
  }
});

test('configured all-party and multi-target intents retain their target count', () => {
  assert.equal(
    getIntentTargetRule(
      { id: 'lanternShakingRoar', effects: [{ type: 'addPanic', amount: 1 }] },
      { quarryId: 'paleHuntLion' }
    ),
    'all'
  );
  assert.equal(
    getIntentTargetRule(
      { id: 'hoovesInDust', effects: [{ type: 'dealDamage', amount: 1 }] },
      { quarryId: 'wailingAntelope' }
    ),
    'twoRandom'
  );
});

test('missing rules default to random even when legacy tags implied smart targeting', () => {
  assert.equal(
    getIntentTargetRule({
      effects: [{ type: 'addPanic', amount: 1 }],
      tags: ['panic', 'sound', 'heavy', 'precision']
    }),
    'randomLivingSurvivor'
  );
});

test('single-target randomness selects across living survivors and never selects dead survivors', () => {
  assert.equal(selectRandomLivingSurvivor(party, {}, () => 0), 'one');
  assert.equal(selectRandomLivingSurvivor(party, {}, () => 0.4), 'two');
  assert.equal(selectRandomLivingSurvivor(party, {}, () => 0.99), 'four');
});

test('invalid randomness uses the first living survivor only as an emergency fallback', () => {
  assert.equal(selectRandomLivingSurvivor(party, {}, () => Number.NaN), 'one');
  assert.equal(selectRandomLivingSurvivor(party, {}, () => 1), 'one');
});

test('all targets every living survivor', () => {
  const result = selectMonsterTargets({
    intent: { targetingRule: 'all' },
    monster: {},
    party
  });
  assert.deepEqual(result.targets, ['one', 'two', 'four']);
});

test('two and three random target unique living survivors', () => {
  const values = [0, 0.99, 0];
  const two = selectMonsterTargets({
    intent: { targetingRule: 'twoRandom' },
    monster: {},
    party,
    random: () => values.shift()
  });
  const three = selectMonsterTargets({
    intent: { targetingRule: 'threeRandom' },
    monster: {},
    party,
    random: () => values.shift() ?? 0
  });

  assert.equal(new Set(two.targets).size, 2);
  assert.equal(new Set(three.targets).size, 3);
  assert.ok(!two.targets.includes('dead'));
  assert.ok(!three.targets.includes('dead'));
});

test('targeting tells expose only random or target-count information', () => {
  assert.equal(
    getTargetingTell('lowestHp', false),
    "The monster's attention flickers across the party."
  );
  assert.equal(
    getTargetingTell('lastAttacker', true),
    'Targets one random living survivor when it attacks.'
  );
  assert.equal(getTargetingTell('all', false), 'Targets all living survivors.');
  assert.equal(getTargetingTell('twoRandom', true), 'Targets two random living survivors.');
});
