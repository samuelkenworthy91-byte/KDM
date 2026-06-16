import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEvent } from '../src/game/eventLogic.js';
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
      mockSurvivor('s1', ['steady'], [{ equipmentId: 'boneBlade' }]),
      mockSurvivor('s2', ['bold'], [{ equipmentId: 'wailingHornBow' }])
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
  });
});
