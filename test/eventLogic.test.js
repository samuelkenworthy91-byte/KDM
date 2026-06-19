import assert from 'node:assert/strict';
import test from 'node:test';
import { events } from '../src/data/events.js';
import { formatEventEffects, resolveEvent } from '../src/game/eventLogic.js';
import { meetsLockedRequirement } from '../src/game/eventRequirementLogic.js';

const mockSurvivor = (id, traits = [], boundGear = []) => ({
  id,
  traits,
  boundGear,
  fightingArts: [],
  scars: [],
  disorders: [],
  injuries: [],
  hp: 30,
  maxHp: 30,
  survival: 0,
  personalDeckAdditions: []
});

const mockSettlement = (innovationIds = []) => ({
  innovationDeckState: {
    builtInnovationIds: innovationIds
  }
});

test('Event Requirement Logic', async (t) => {
  const context = {
    runParty: [
      mockSurvivor('s1', ['steady'], [{ equipmentId: 'redwater_toothsaw' }]),
      mockSurvivor('s2', ['bold'], [{ equipmentId: 'blacklung_recurve' }])
    ],
    settlement: mockSettlement(['sharedWarnings']),
    selectedQuarry: { id: 'paleHuntLion' }
  };

  await t.test('partyHasWeaponType works', () => {
    assert.strictEqual(meetsLockedRequirement({ type: 'partyHasWeaponType', weaponType: 'sword' }, context), true);
    assert.strictEqual(meetsLockedRequirement({ type: 'partyHasWeaponType', weaponType: 'bow' }, context), true);
    assert.strictEqual(meetsLockedRequirement({ type: 'partyHasWeaponType', weaponType: 'axe' }, context), false);
  });

  await t.test('partyHasTrait works', () => {
    assert.strictEqual(meetsLockedRequirement({ type: 'partyHasTrait', traitId: 'steady' }, context), true);
    assert.strictEqual(meetsLockedRequirement({ type: 'partyHasTrait', traitId: 'bold' }, context), true);
    assert.strictEqual(meetsLockedRequirement({ type: 'partyHasTrait', traitId: 'quietListener' }, context), false);
  });

  await t.test('settlementHasInnovation works', () => {
    assert.strictEqual(meetsLockedRequirement({ type: 'settlementHasInnovation', innovationId: 'sharedWarnings' }, context), true);
    assert.strictEqual(meetsLockedRequirement({ type: 'settlementHasInnovation', innovationId: 'cooking' }, context), false);
  });

  await t.test('any requirement works', () => {
    const req = {
      type: 'any',
      requirements: [
        { type: 'partyHasTrait', traitId: 'quietListener' },
        { type: 'partyHasTrait', traitId: 'bold' }
      ]
    };
    assert.strictEqual(meetsLockedRequirement(req, context), true);
  });

  await t.test('all requirement works', () => {
    const req = {
      type: 'all',
      requirements: [
        { type: 'partyHasTrait', traitId: 'steady' },
        { type: 'partyHasTrait', traitId: 'bold' }
      ]
    };
    assert.strictEqual(meetsLockedRequirement(req, context), true);

    const reqFail = {
      type: 'all',
      requirements: [
        { type: 'partyHasTrait', traitId: 'steady' },
        { type: 'partyHasTrait', traitId: 'quietListener' }
      ]
    };
    assert.strictEqual(meetsLockedRequirement(reqFail, context), false);
  });
});

test('Event Resolution Logic', async (t) => {
  const event = {
    id: 'testEvent',
    mode: 'automatic',
    autoOutcome: {
      outcomeText: 'Success!',
      effects: { gainSurvival: 1 }
    }
  };
  const state = {
    runResources: [],
    runSurvivor: mockSurvivor('s1'),
    runModifiers: {},
    appliedEffects: []
  };
  const context = {
    quarry: { id: 'paleHuntLion', name: 'Pale Hunt Lion' }
  };

  await t.test('automatic event resolution', () => {
    const result = resolveEvent(event, null, state, context);
    assert.strictEqual(result.outcomeText, 'Success!');
    assert.strictEqual(result.choiceId, 'automatic');
    assert.strictEqual(result.runSurvivor.survival, 1);
    assert.deepEqual(result.appliedEffects, ['Gain Survival x1.']);
  });

  await t.test('fallback prevents all-locked event softlock', () => {
    const result = resolveEvent({ id: 'lockedOut', choices: [] }, 'fallback', state, context);
    assert.strictEqual(result.choiceId, 'fallback');
    assert.strictEqual(result.runSurvivor.hp, 28);
    assert.deepEqual(result.appliedEffects, ['Lose HP x2.']);
  });

  await t.test('readable effect formatter covers common preview text', () => {
    assert.deepEqual(formatEventEffects({
      gainResource: { resourceId: 'bone', amount: 1 },
      gainSettlementMemory: 1,
      nextCombatStartBlock: 2,
      monsterStartsWounded: 2,
      addPanic: 1
    }, context), [
      'Gain Bone x1.',
      'No Memory gained under the current economy.',
      'Next combat: +2 starting Block.',
      'The quarry starts wounded by 2.',
      'Gain Panic 1.'
    ]);
  });

  await t.test('positive event memory effects do not grant memory by default', () => {
    const result = resolveEvent({
      id: 'memoryEvent',
      choices: [{
        id: 'remember',
        text: 'Remember',
        outcomeText: 'A memory would have been gained.',
        effects: { gainSettlementMemory: 2 }
      }]
    }, {
      id: 'remember',
      outcomeText: 'A memory would have been gained.',
      effects: { gainSettlementMemory: 2 }
    }, state, { ...context, settlementMemory: 0 });

    assert.equal(result.settlementMemoryDelta, 0);
    assert.deepEqual(result.appliedEffects, ['No Memory gained under the current economy.']);
  });

  await t.test('unknown effects are reported safely', () => {
    const result = resolveEvent({
      id: 'unknownEffect',
      choices: [{
        id: 'try',
        text: 'Try',
        outcomeText: 'Something happens.',
        effects: { mysteryEffect: 1 }
      }]
    }, {
      id: 'try',
      outcomeText: 'Something happens.',
      effects: { mysteryEffect: 1 }
    }, state, context);
    assert.deepEqual(result.appliedEffects, ['Unknown effect: mysteryEffect']);
  });

  await t.test('events have readable long descriptions and bounded choice counts', () => {
    assert.equal(events.filter(event => !event.longDescription).length, 0);
    events.forEach(event => {
      assert.ok(event.longDescription.length >= event.description.length, event.id);
      if (event.mode !== 'automatic' && event.choices) {
        assert.ok(event.choices.length >= 2 && event.choices.length <= 4, event.id);
      }
    });
  });
});
