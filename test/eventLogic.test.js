import assert from 'node:assert/strict';
import test from 'node:test';
import { events } from '../src/data/events.js';
import {
  calculateIntimacyProjections,
  formatEventEffects,
  getHuntEventRollBreakdown,
  resolveEvent,
  selectEventSurvivor,
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

test('Roll-driven hunt event engine', async (t) => {
  const party = [
    { ...mockSurvivor('leader'), name: 'Leader', hp: 20, maxHp: 30, survival: 1 },
    { ...mockSurvivor('hurt'), name: 'Hurt', hp: 4, maxHp: 30, survival: 3 },
    { ...mockSurvivor('steady'), name: 'Steady', hp: 30, maxHp: 30, survival: 0, traits: ['lanternEyed'] }
  ];
  const state = {
    runResources: [],
    runSurvivor: party[0],
    runParty: party,
    runModifiers: {},
    appliedEffects: []
  };
  const context = {
    runParty: party,
    quarry: { id: 'paleHuntLion', name: 'Pale Hunt Lion' },
    settlement: { principles: { society: 'workTogether' } }
  };

  await t.test('automatic event survivor selection supports party leader, random, and lowest HP', () => {
    assert.equal(selectEventSurvivor({ eventSurvivorRule: 'partyLeader' }, state, context).survivor.id, 'leader');
    assert.equal(
      selectEventSurvivor({ eventSurvivorRule: 'randomLivingSurvivor' }, state, {
        ...context,
        random: () => 0.6
      }).survivor.id,
      'hurt'
    );
    assert.equal(selectEventSurvivor({ eventSurvivorRule: 'lowestHp' }, state, context).survivor.id, 'hurt');
  });

  await t.test('player-choice event waits for and accepts chosen event survivor', () => {
    const pending = resolveEvent({
      id: 'choiceRoll',
      eventType: 'huntRoll',
      allowsChoice: true,
      eventSurvivorRule: 'playerChoice',
      roll: { die: 10 },
      resultBands: [{ id: 'ok', min: 1, resultText: 'Chosen.', effects: { gainSurvival: 1 } }]
    }, null, state, { ...context, roll: 5 });
    assert.equal(pending.requiresEventSurvivorChoice, true);

    const result = resolveEvent({
      id: 'choiceRoll',
      eventType: 'huntRoll',
      allowsChoice: true,
      eventSurvivorRule: 'playerChoice',
      roll: { die: 10 },
      resultBands: [{ id: 'ok', min: 1, resultText: 'Chosen.', effects: { gainSurvival: 1 } }]
    }, { eventSurvivorId: 'steady' }, state, { ...context, roll: 5 });
    assert.equal(result.eventSurvivor.id, 'steady');
    assert.equal(result.runSurvivor.id, 'steady');
    assert.equal(result.runSurvivor.survival, 1);
  });

  await t.test('modifiers apply from survivor stats, passives, and principles', () => {
    const survivor = {
      ...party[1],
      fightingArts: ['braceAndBreathe']
    };
    const event = {
      id: 'modifiedRoll',
      eventType: 'huntRoll',
      roll: { die: 10 },
      modifiers: [
        { type: 'survival', amountPer: 1, label: 'Survival' },
        { type: 'passiveTag', tag: 'survival', amount: 1, label: 'Survival passive' },
        { type: 'principle', group: 'society', id: 'workTogether', amount: 1, label: 'Work Together' }
      ]
    };
    const breakdown = getHuntEventRollBreakdown(event, survivor, state, { ...context, roll: 2 });

    assert.equal(breakdown.baseRoll, 2);
    assert.equal(breakdown.finalRoll, 7);
    assert.deepEqual(breakdown.modifiers.map(row => row.label), [
      'Survival',
      'Survival passive',
      'Work Together'
    ]);
  });

  await t.test('final roll selects outcome band and applies explicit effects', () => {
    const result = resolveEvent({
      id: 'banded',
      eventType: 'huntRoll',
      eventSurvivorRule: 'lowestHp',
      roll: { die: 10 },
      modifiers: [{ type: 'survival', amountPer: 1, label: 'Survival' }],
      resultBands: [
        { id: 'low', max: 4, label: 'Low', resultText: 'Bad.', effects: { loseHp: 1 } },
        { id: 'high', min: 5, label: 'High', resultText: 'Good.', effects: { gainSurvival: 1 } }
      ]
    }, null, state, { ...context, roll: 2 });

    assert.equal(result.eventSurvivor.id, 'hurt');
    assert.equal(result.roll.baseRoll, 2);
    assert.equal(result.roll.finalRoll, 5);
    assert.equal(result.outcomeBand.label, 'High');
    assert.equal(result.runSurvivor.survival, 3);
    assert.deepEqual(result.appliedEffects, ['Gain Survival x1.']);
  });

  await t.test('old event fallback still resolves safely', () => {
    const result = resolveEvent({
      id: 'legacyUnknown',
      name: 'Legacy Unknown'
    }, 'fallback', state, context);

    assert.equal(result.choiceId, 'fallback');
    assert.equal(result.runSurvivor.hp, 18);
  });

  await t.test('roll result exposes UI breakdown fields', () => {
    const result = resolveEvent({
      id: 'uiBreakdown',
      eventType: 'huntRoll',
      eventSurvivorRule: 'partyLeader',
      roll: { die: 10 },
      modifiers: [{ type: 'survival', amountPer: 1, label: 'Survival' }],
      resultBands: [{ id: 'any', min: 1, label: 'Any', resultText: 'Shown.', effects: {} }]
    }, null, state, { ...context, roll: 4 });

    assert.equal(result.eventSurvivor.name, 'Leader');
    assert.equal(result.eventSurvivorReason, 'Party leader.');
    assert.equal(result.roll.baseRoll, 4);
    assert.deepEqual(result.roll.modifiers, [{ id: 'survival:Survival', label: 'Survival', amount: 1 }]);
    assert.equal(result.roll.finalRoll, 5);
    assert.equal(result.outcomeBand.label, 'Any');
  });
});
