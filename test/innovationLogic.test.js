import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BASE_INNOVATION_POOL_IDS,
  defaultInnovationCost,
  innovationCards,
  memoryActionInnovationList,
  QUARRY_INNOVATION_POOL
} from '../src/data/innovationCards.js';
import {
  applyInnovationChoice,
  drawInnovationCandidates,
  getDrawableInnovationIdsForSettlement,
  getInnovationDeckEntries
} from '../src/game/innovationLogic.js';
import {
  getInnovationPlayerFields,
  getPrinciplePlayerFields,
  getWorkTogetherDisplay
} from '../src/game/innovationPresentation.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';
import { campaignPrinciples } from '../src/data/campaignPrinciples.js';

function settlement(overrides = {}) {
  return {
    lanternYear: 1,
    maxHuntPartySize: 1,
    builtInnovations: ['lanternHearth'],
    builtMemoryInnovations: [],
    rumouredInnovations: [],
    settlementHistory: [],
    defeatedQuarryLevels: {},
    innovationDeckState: {
      discoveredInnovationIds: ['lanternHearth'],
      availableInnovationPoolIds: [...BASE_INNOVATION_POOL_IDS],
      builtInnovationIds: ['lanternHearth'],
      innovationHistory: []
    },
    ...overrides
  };
}

test('every innovation card has a summary, destination, and tutorial', () => {
  Object.values(innovationCards).forEach(card => {
    assert.ok(card.settlementBoostSummary, `${card.id} needs a settlement boost summary`);
    assert.ok(card.uiDestination, `${card.id} needs a UI destination`);
    assert.ok(card.tutorialTitle, `${card.id} needs a tutorial title`);
    assert.ok(card.tutorialSteps.length, `${card.id} needs tutorial steps`);
    assert.ok(card.effects.length, `${card.id} needs an explained effect`);
    assert.ok(card.playerSummary, `${card.id} needs a player summary`);
    assert.ok(card.howToUse, `${card.id} needs usage instructions`);
    assert.ok(card.actionLocation, `${card.id} needs an action location`);
    assert.ok(card.whyItMatters, `${card.id} needs a reason to care`);
    const fields = getInnovationPlayerFields(card);
    assert.ok(fields.type, `${card.id} needs a display type`);
    assert.ok(fields.effect, `${card.id} needs a display effect`);
    assert.ok(fields.where, `${card.id} needs a display location`);
    assert.ok(fields.costLimit, `${card.id} needs cost/limit display`);
  });
});

test('innovation player summary helper is safe for partial legacy cards', () => {
  const fields = getInnovationPlayerFields({ id: 'legacyPartial', name: 'Legacy Partial' });

  assert.equal(fields.type, 'Passive');
  assert.equal(fields.effect, 'This innovation has no current rules summary.');
  assert.equal(fields.where, 'Settlement > Innovations');
  assert.equal(fields.workTogetherEligible, 'No');
});

test('innovation cards use the unified exact innovation cost', () => {
  Object.values(innovationCards).forEach(card => {
    assert.equal(card.buildCost, undefined, `${card.id} must not use legacy buildCost`);
    assert.equal(card.innovationCost?.materials?.basicResources, undefined, `${card.id} must not use generic basicResources`);
    if (card.id === 'lanternHearth') {
      assert.deepEqual(card.innovationCost, { memory: 0, materials: {} });
    } else {
      assert.deepEqual(card.innovationCost, defaultInnovationCost, `${card.id} needs the default exact cost`);
    }
  });
});

test('memory action innovations are unified cards with plain-language action locations', () => {
  memoryActionInnovationList.forEach(innovation => {
    assert.ok(innovation.playerSummary, `${innovation.id} needs a player summary`);
    assert.ok(innovation.howToUse, `${innovation.id} needs usage instructions`);
    assert.ok(innovation.actionLocation, `${innovation.id} needs an action location`);
    assert.ok(innovation.whyItMatters, `${innovation.id} needs a reason to care`);
  });

  const expectedTabs = {
    weaponDrills: 'training',
    riteOfForgetting: 'recovery',
    painLessons: 'recovery',
    quietNight: 'recovery',
    taboo: 'recovery',
    shrineOfNames: 'legacy'
  };
  Object.entries(expectedTabs).forEach(([id, tab]) => {
    assert.equal(
      memoryActionInnovationList.find(innovation => innovation.id === id)?.unlockedTab,
      tab
    );
  });

  assert.equal(getInnovationPlayerFields(innovationCards.weaponDrills).type, 'Settlement Action');
  assert.equal(getInnovationPlayerFields(innovationCards.weaponDrills).workTogetherEligible, 'Yes');
  assert.equal(getInnovationPlayerFields(innovationCards.quietNight).workTogetherEligible, 'Yes');
  assert.equal(getInnovationPlayerFields(innovationCards.painLessons).workTogetherEligible, 'Innovation attempt only');
  assert.equal(getInnovationPlayerFields(innovationCards.taboo).workTogetherEligible, 'Innovation attempt only');
});

test('campaign principles display as principles, not normal innovations', () => {
  const current = settlement({
    innovationDeckState: {
      discoveredInnovationIds: [],
      availableInnovationPoolIds: ['graves', 'cannibalism', 'language'],
      builtInnovationIds: [],
      innovationHistory: []
    }
  });

  assert.equal(innovationCards.graves.implemented, false);
  assert.equal(innovationCards.cannibalism, undefined);
  assert.deepEqual(getDrawableInnovationIdsForSettlement(current), ['language']);

  const graves = getPrinciplePlayerFields(campaignPrinciples.graves);
  assert.equal(graves.type, 'Campaign Principle - Death');
  assert.equal(graves.effect, 'Each survivor death gives +1 Memory.');
  assert.equal(graves.where, 'Automatically after survivor deaths.');
});

test('Work Together display is consistent for exact 1-Memory costs', () => {
  const current = {
    ...settlement({ lanternYear: 5 }),
    principles: { death: null, newLife: null, society: 'workTogether' }
  };
  const preview = getWorkTogetherDisplay(current, 1);

  assert.equal(preview.originalCost, 1);
  assert.equal(preview.discount, 1);
  assert.equal(preview.finalCost, 0);
  assert.match(preview.label, /Original cost: 1 Memory/);
  assert.match(preview.label, /Work Together discount: -1/);
  assert.match(preview.label, /Final cost: 0 Memory/);
  assert.equal(getWorkTogetherDisplay(current, 2).eligible, false);
});

test('all quarry innovation-pool ids resolve to real cards', () => {
  const missing = [...new Set(Object.values(QUARRY_INNOVATION_POOL).flat())]
    .filter(id => !innovationCards[id]);

  assert.deepEqual(missing, []);
});

test('draws only use available cards whose prerequisites are satisfied', () => {
  const current = settlement({
    innovationDeckState: {
      discoveredInnovationIds: [],
      availableInnovationPoolIds: ['sharedBurden', 'language'],
      builtInnovationIds: [],
      innovationHistory: []
    }
  });
  const entries = getInnovationDeckEntries(current);
  const choices = drawInnovationCandidates(current, 3, () => 0);

  assert.equal(entries.find(entry => entry.id === 'sharedBurden').status, 'prerequisite-locked');
  assert.deepEqual(choices, ['language']);
});

test('choosing an innovation applies unlocks, history, and tutorial state atomically', () => {
  const next = applyInnovationChoice(settlement(), 'trailSignals', '2026-06-15T00:00:00.000Z');

  assert.equal(next.maxHuntPartySize, 2);
  assert.ok(next.innovationDeckState.builtInnovationIds.includes('trailSignals'));
  assert.ok(next.innovationDeckState.availableInnovationPoolIds.includes('sharedBurden'));
  assert.equal(next.pendingInnovationTutorialId, 'trailSignals');
  assert.equal(next.settlementHistory[0].type, 'innovation-acquired');
});

test('starting innovation is free and owned at campaign start', () => {
  const migrated = normalizeSettlement({ survivors: [] });

  assert.ok(migrated.innovationDeckState.builtInnovationIds.includes('lanternHearth'));
  assert.ok(migrated.builtInnovations.includes('lanternHearth'));
  assert.deepEqual(innovationCards.lanternHearth.innovationCost, { memory: 0, materials: {} });
});

test('deck-acquired memory innovations retain existing action compatibility', () => {
  const next = applyInnovationChoice(settlement(), 'weaponDrills');

  assert.ok(next.builtMemoryInnovations.includes('weaponDrills'));
});

test('legacy memory innovation ids migrate into the unified innovation deck', () => {
  const migrated = normalizeSettlement({
    survivors: [],
    builtMemoryInnovations: ['weaponDrills']
  });

  assert.ok(migrated.innovationDeckState.builtInnovationIds.includes('weaponDrills'));
  assert.ok(migrated.builtMemoryInnovations.includes('weaponDrills'));
});

test('legacy innovation ids survive save migration and render in owned state', () => {
  const migrated = normalizeSettlement({
    survivors: [],
    builtInnovations: ['legacyLaw'],
    innovationDeckState: {
      builtInnovationIds: ['legacyLaw'],
      availableInnovationPoolIds: []
    }
  });

  assert.ok(migrated.innovationDeckState.builtInnovationIds.includes('legacyLaw'));
  assert.ok(migrated.innovationDeckState.availableInnovationPoolIds.includes('scoutTower'));
});
