import assert from 'node:assert/strict';
import test from 'node:test';
import { events } from '../src/data/events.js';
import {
  calculateIntimacyProjections,
  formatEventEffects,
  resolveEvent,
  shouldLoveJuiceProtectIntimacy,
  spendLoveJuiceForIntimacy
} from '../src/game/eventLogic.js';
import { innovationCards } from '../src/data/innovationCards.js';
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

test('Love Juice intimacy support', async (t) => {
  await t.test('spends one Love Juice before intimacy protection', () => {
    const settlement = { stash: { loveJuice: 2, bone: 1 } };
    const spent = spendLoveJuiceForIntimacy(settlement);

    assert.equal(spent.stash.loveJuice, 1);
    assert.equal(spent.stash.bone, 1);
    assert.equal(settlement.stash.loveJuice, 2);
  });

  await t.test('cannot spend Love Juice when unavailable', () => {
    assert.equal(spendLoveJuiceForIntimacy({ stash: { bone: 1 } }), null);
  });

  await t.test('Love Juice protects only negative intimacy rolls and never guarantees success', () => {
    assert.equal(shouldLoveJuiceProtectIntimacy({
      roll: 0.05,
      tragedyChance: 0.2,
      loveJuiceSelected: true
    }), true);
    assert.equal(shouldLoveJuiceProtectIntimacy({
      roll: 0.6,
      tragedyChance: 0.2,
      loveJuiceSelected: true
    }), false);
    assert.equal(shouldLoveJuiceProtectIntimacy({
      roll: 0.05,
      tragedyChance: 0.2,
      loveJuiceSelected: false
    }), false);
  });

  await t.test('intimacy projections expose transparent rows including Love Juice', () => {
    const participant = mockSurvivor('s1');
    participant.name = 'Aster';
    participant.injuries = ['brokenLeg'];
    const projections = calculateIntimacyProjections({
      stash: { loveJuice: 1 },
      population: 10,
      survivors: [participant],
      innovationDeckState: { builtInnovationIds: ['language', 'ammonia'] }
    }, innovationCards, {
      participants: [participant],
      mitigateRisk: true,
      loveJuiceSelected: true
    });

    assert.ok(projections.modifierRows.some(row => row.label === 'Base chance'));
    assert.ok(projections.modifierRows.some(row => row.label === 'Language' && row.type === 'success'));
    assert.ok(projections.modifierRows.some(row => row.label === 'Ammonia' && row.type === 'tragedy'));
    assert.ok(projections.modifierRows.some(row => row.label.includes('untreated severe injury')));
    assert.ok(projections.modifierRows.some(row => row.source === 'loveJuice' && row.selected));
    assert.equal(projections.loveJuiceAvailable, true);
    assert.equal(projections.loveJuiceSelected, true);
    assert.equal(projections.finalSuccessChance, 0.3);
    assert.equal(projections.finalTragedyChance, 0);
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
