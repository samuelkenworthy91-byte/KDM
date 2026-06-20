import {
  innovationCards,
  MEMORY_ACTION_INNOVATION_IDS
} from '../data/innovationCards.js';
import { normalizeDefeatedQuarryLevels } from '../data/quarries.js';
import { getInnovationDefinition } from './innovationModel.js';

const unique = values => [...new Set((values || []).filter(Boolean))];
const NORMAL_INNOVATION_DISABLED_IDS = new Set(['graves']);

export function getHighestQuarryLevel(settlement) {
  return Math.max(
    0,
    ...Object.values(normalizeDefeatedQuarryLevels(settlement?.defeatedQuarryLevels))
      .map(levels => Math.max(0, ...levels))
  );
}

export function getInnovationPrerequisiteStatus(innovation, settlement) {
  if (!innovation) return { eligible: false, reason: 'Unknown / Legacy innovation' };
  const requirement = innovation.prerequisites || innovation.unlockRequirement;
  const built = settlement?.innovationDeckState?.builtInnovationIds || [];

  if (requirement?.type === 'partyProgress') {
    if (!built.includes(requirement.innovationId)) {
      return {
        eligible: false,
        reason: `Requires ${innovationCards[requirement.innovationId]?.name || requirement.innovationId}`
      };
    }
    if (
      (settlement?.lanternYear || 0) < requirement.lanternYear
      && getHighestQuarryLevel(settlement) < requirement.quarryLevel
    ) {
      return {
        eligible: false,
        reason: `Requires Lantern Year ${requirement.lanternYear} or a Level ${requirement.quarryLevel} quarry victory`
      };
    }
  }

  return { eligible: true, reason: '' };
}

export function getInnovationDeckEntries(settlement) {
  const state = settlement?.innovationDeckState || {};
  const available = new Set(state.availableInnovationPoolIds || []);
  const owned = new Set(state.builtInnovationIds || []);
  const discovered = new Set(state.discoveredInnovationIds || []);

  return Object.keys(innovationCards).map(id => {
    const innovation = getInnovationDefinition(innovationCards, id);
    const prerequisite = getInnovationPrerequisiteStatus(innovation, settlement);
    const status = owned.has(id)
      ? 'owned'
      : available.has(id)
        ? prerequisite.eligible
          ? discovered.has(id) ? 'drawn' : 'available'
          : 'prerequisite-locked'
        : 'locked';
    return {
      ...innovation,
      status,
      lockReason: status === 'locked'
        ? 'Not yet added to the innovation pool'
        : prerequisite.reason
    };
  });
}

export function getDrawableInnovationIdsForSettlement(settlement) {
  return getInnovationDeckEntries(settlement)
    .filter(entry =>
      ['available', 'drawn'].includes(entry.status) &&
      entry.implemented &&
      !NORMAL_INNOVATION_DISABLED_IDS.has(entry.id)
    )
    .map(entry => entry.id);
}

export function drawInnovationCandidates(settlement, count = 3, random = Math.random) {
  const weighted = getDrawableInnovationIdsForSettlement(settlement).flatMap(id => {
    const weight = Math.max(1, Math.floor(innovationCards[id]?.deckWeight || 1));
    return Array.from({ length: weight }, () => id);
  });
  const choices = [];

  while (weighted.length && choices.length < count) {
    const index = Math.floor(random() * weighted.length);
    const [id] = weighted.splice(index, 1);
    if (!choices.includes(id)) choices.push(id);
  }
  return choices;
}

export function applyInnovationChoice(settlement, innovationId, timestamp = new Date().toISOString()) {
  const card = innovationCards[innovationId];
  if (!card) return settlement;
  if (NORMAL_INNOVATION_DISABLED_IDS.has(innovationId) || card.implemented === false) return settlement;
  const state = settlement.innovationDeckState || {};
  if (state.builtInnovationIds?.includes(innovationId)) return settlement;

  const memoryActionInnovation = MEMORY_ACTION_INNOVATION_IDS.includes(innovationId);
  const maxHuntPartySize = innovationId === 'trailSignals'
    ? Math.max(2, settlement.maxHuntPartySize || 1)
    : innovationId === 'sharedBurden'
      ? Math.max(3, settlement.maxHuntPartySize || 1)
      : innovationId === 'lanternProcession'
        ? 4
        : settlement.maxHuntPartySize;
  const historyEntry = {
    type: 'innovation-acquired',
    innovationId,
    innovationName: card.name,
    summary: card.settlementBoostSummary,
    lanternYear: settlement.lanternYear,
    timestamp
  };

  return {
    ...settlement,
    maxHuntPartySize,
    builtInnovations: unique([
      ...(settlement.builtInnovations || []),
      ...(card.unlocksBuildings || [])
    ]),
    builtMemoryInnovations: memoryActionInnovation
      ? unique([...(settlement.builtMemoryInnovations || []), innovationId])
      : settlement.builtMemoryInnovations || [],
    rumouredInnovations: unique([
      ...(settlement.rumouredInnovations || []),
      ...(card.unlocksBuildings || [])
    ]),
    settlementHistory: [historyEntry, ...(settlement.settlementHistory || [])],
    pendingInnovationTutorialId: innovationId,
    innovationDeckState: {
      ...state,
      discoveredInnovationIds: unique([...(state.discoveredInnovationIds || []), innovationId]),
      builtInnovationIds: unique([...(state.builtInnovationIds || []), innovationId]),
      availableInnovationPoolIds: unique([
        ...(state.availableInnovationPoolIds || []),
        ...(card.addsToInnovationPool || [])
      ]),
      innovationHistory: [
        ...(state.innovationHistory || []),
        {
          type: 'chosen',
          innovationId,
          lanternYear: settlement.lanternYear,
          timestamp
        }
      ]
    }
  };
}
