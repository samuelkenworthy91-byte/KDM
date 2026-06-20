import test from 'node:test';
import assert from 'node:assert/strict';

import { BASE_INNOVATION_POOL_IDS } from '../src/data/innovationCards.js';
import {
  chooseCampaignPrinciple,
  createPendingPrincipleChoice,
  hasCampaignPrinciple
} from '../src/game/campaignPrincipleLogic.js';
import {
  applyInnovationChoice,
  drawInnovationCandidates,
  getDrawableInnovationIdsForSettlement
} from '../src/game/innovationLogic.js';
import { normalizeSettlement } from '../src/game/saveLogic.js';

function settlement(overrides = {}) {
  return normalizeSettlement({
    survivors: [],
    lanternYear: 1,
    ...overrides
  });
}

test('normalizeSettlement adds empty campaign principle state', () => {
  const normalized = settlement();

  assert.deepEqual(normalized.principles, {
    death: null,
    newLife: null,
    society: null
  });
  assert.equal(normalized.pendingPrincipleChoice, null);
  assert.deepEqual(normalized.principleHistory, []);
  assert.deepEqual(normalized.principleUses, {});
});

test('cannot choose invalid principle', () => {
  const current = settlement();
  const next = chooseCampaignPrinciple(current, 'death', 'protectTheYoung', 'now');

  assert.deepEqual(next.principles, current.principles);
  assert.deepEqual(next.principleHistory, current.principleHistory);
});

test('cannot change locked principle', () => {
  const current = chooseCampaignPrinciple(settlement(), 'death', 'graves', 'now');
  const next = chooseCampaignPrinciple(current, 'death', 'cannibalism', 'later');

  assert.equal(next.principles.death, 'graves');
  assert.equal(next.principleHistory.length, 1);
});

test('choosing principle records history and clears matching pending choice', () => {
  const pending = createPendingPrincipleChoice(
    settlement({ lanternYear: 2 }),
    'death',
    'First survivor death',
    ['survivor-1']
  );
  const next = chooseCampaignPrinciple(pending, 'death', 'cannibalism', '2026-06-20T00:00:00.000Z');

  assert.equal(next.principles.death, 'cannibalism');
  assert.equal(next.pendingPrincipleChoice, null);
  assert.equal(next.principleHistory.length, 1);
  assert.equal(next.principleHistory[0].optionId, 'cannibalism');
  assert.deepEqual(next.principleHistory[0].affectedIds, ['survivor-1']);
});

test('hasCampaignPrinciple reads locked campaign principle state', () => {
  const current = chooseCampaignPrinciple(settlement(), 'society', 'workTogether', 'now');

  assert.equal(hasCampaignPrinciple(current, 'society', 'workTogether'), true);
  assert.equal(hasCampaignPrinciple(current, 'society', 'embraceTheDark'), false);
});

test('Graves is not drawable or buildable as a normal innovation', () => {
  assert.equal(BASE_INNOVATION_POOL_IDS.includes('graves'), false);
  const current = {
    lanternYear: 1,
    maxHuntPartySize: 1,
    builtInnovations: ['lanternHearth'],
    builtMemoryInnovations: [],
    rumouredInnovations: [],
    settlementHistory: [],
    defeatedQuarryLevels: {},
    innovationDeckState: {
      discoveredInnovationIds: [],
      availableInnovationPoolIds: ['graves'],
      builtInnovationIds: ['lanternHearth'],
      innovationHistory: []
    }
  };

  assert.equal(getDrawableInnovationIdsForSettlement(current).includes('graves'), false);
  assert.deepEqual(drawInnovationCandidates(current, 3, () => 0), []);

  const attempted = applyInnovationChoice(current, 'graves', 'now');
  assert.equal(attempted.innovationDeckState.builtInnovationIds.includes('graves'), false);
});

test('old saves with built Graves migrate to death principle without crashing', () => {
  const migrated = settlement({
    builtInnovations: ['lanternHearth', 'graves'],
    innovationDeckState: {
      discoveredInnovationIds: ['lanternHearth', 'graves'],
      availableInnovationPoolIds: ['graves', 'language'],
      builtInnovationIds: ['lanternHearth', 'graves'],
      innovationHistory: []
    }
  });

  assert.equal(migrated.principles.death, 'graves');
  assert.equal(migrated.principleHistory.some(entry => entry.type === 'principle-migration'), true);
  assert.equal(migrated.innovationDeckState.availableInnovationPoolIds.includes('graves'), false);
});
