import { BASIC_RESOURCE_IDS } from '../data/resources.js';
import {
  createPendingPrincipleChoice,
  getWorkTogetherMemoryCost,
  hasCampaignPrinciple,
  markWorkTogetherUsed
} from './campaignPrincipleLogic.js';

function normalizeAmount(amount) {
  return Math.max(0, Math.floor(Number(amount) || 0));
}

export function getMemoryBalance(settlement = {}) {
  if (Number.isFinite(settlement.memories)) return Math.max(0, settlement.memories);
  return Math.max(0, Number(settlement.settlementMemory) || 0);
}

export function canSpendMemories(settlement, amount) {
  const preview = getWorkTogetherMemoryCost(settlement, amount);
  return getMemoryBalance(settlement) >= preview.finalCost;
}

function addMemoryTransaction(settlement, transaction) {
  return {
    ...settlement,
    memoryHistory: [
      transaction,
      ...(Array.isArray(settlement.memoryHistory) ? settlement.memoryHistory : [])
    ].slice(0, 250)
  };
}

export function gainMemories(settlement, amount, details = {}) {
  const gained = normalizeAmount(amount);
  if (!gained) return settlement;
  const balance = getMemoryBalance(settlement) + gained;
  return addMemoryTransaction({
    ...settlement,
    memories: balance,
    settlementMemory: balance
  }, {
    id: details.id || `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'gain',
    amount: gained,
    balance,
    source: details.source || 'unknown',
    description: details.description || 'Memory gained.',
    survivorIds: details.survivorIds || [],
    huntId: details.huntId || null,
    lanternYear: details.lanternYear ?? settlement.lanternYear ?? null,
    timestamp: details.timestamp || new Date().toISOString()
  });
}

export function spendMemories(settlement, amount, details = {}) {
  const spent = normalizeAmount(amount);
  if (!spent) return null;
  const preview = getWorkTogetherMemoryCost(settlement, spent);
  if (!canSpendMemories(settlement, spent)) return null;
  const balance = getMemoryBalance(settlement) - preview.finalCost;
  const nextSettlement = preview.applied
    ? markWorkTogetherUsed(settlement, details)
    : settlement;
  return addMemoryTransaction({
    ...settlement,
    ...nextSettlement,
    memories: balance,
    settlementMemory: balance
  }, {
    id: details.id || `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'spend',
    amount: -preview.finalCost,
    balance,
    source: details.source || 'unknown',
    description: details.description || (preview.applied
      ? 'Work Together covered a 1-Memory cost.'
      : 'Memory spent.'),
    originalCost: preview.originalCost,
    workTogetherDiscount: preview.discount,
    finalCost: preview.finalCost,
    survivorIds: details.survivorIds || [],
    huntId: details.huntId || null,
    lanternYear: details.lanternYear ?? settlement.lanternYear ?? null,
    timestamp: details.timestamp || new Date().toISOString()
  });
}

export function awardHuntReturnMemories(settlement, survivors, huntId) {
  const returning = (survivors || []).filter(survivor =>
    survivor?.id && survivor.alive !== false && survivor.hp > 0
  );
  return gainMemories(settlement, returning.length, {
    source: 'hunt-return',
    description: `${returning.length} survivor${returning.length === 1 ? '' : 's'} returned alive.`,
    survivorIds: returning.map(survivor => survivor.id),
    huntId
  });
}

export function createDeathResolution(survivor, details = {}) {
  return {
    id: details.id || `death-${survivor?.id || 'unknown'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    survivorId: survivor?.id || null,
    survivorName: survivor?.name || details.survivorName || 'Unknown / Legacy',
    cause: details.cause || survivor?.causeOfDeath || 'Unknown',
    huntId: details.huntId || null,
    lanternYear: details.lanternYear ?? null,
    status: 'pending',
    timestamp: details.timestamp || new Date().toISOString()
  };
}

export function queueDeathResolutions(settlement, resolutions) {
  const existing = Array.isArray(settlement.pendingDeathResolutions)
    ? settlement.pendingDeathResolutions
    : [];
  const existingIds = new Set(existing.map(entry => entry.id));
  const queued = {
    ...settlement,
    pendingDeathResolutions: [
      ...existing,
      ...(resolutions || []).filter(entry => entry && !existingIds.has(entry.id))
    ]
  };
  if (queued.principles?.death) {
    return queued.pendingDeathResolutions.reduce((next, resolution) => (
      resolution.status === 'pending' ? resolveDeathMemoryChoice(next, resolution.id) : next
    ), queued);
  }
  if (!queued.pendingPrincipleChoice && queued.pendingDeathResolutions.some(entry => entry.status === 'pending')) {
    return createPendingPrincipleChoice(
      queued,
      'death',
      'First survivor death',
      queued.pendingDeathResolutions.filter(entry => entry.status === 'pending').map(entry => entry.id)
    );
  }
  return queued;
}

function addSettlementHistory(settlement, entry) {
  return {
    ...settlement,
    settlementHistory: [
      entry,
      ...(settlement.settlementHistory || [])
    ]
  };
}

function deathRewardId(resolution) {
  return `death-principle:${resolution?.id || resolution?.survivorId || resolution?.timestamp || 'unknown'}`;
}

export function resolveDeathMemoryChoice(settlement, resolutionId, choice, resourceId) {
  const resolutions = settlement.pendingDeathResolutions || [];
  const resolution = resolutions.find(entry =>
    entry.id === resolutionId &&
    entry.status === 'pending' &&
    !entry.principleRewardGranted
  );
  if (!resolution) return settlement;
  const principle = settlement.principles?.death;
  if (!['graves', 'cannibalism'].includes(principle)) {
    if (!settlement.pendingPrincipleChoice) {
      return createPendingPrincipleChoice(settlement, 'death', 'First survivor death', [resolutionId]);
    }
    return settlement;
  }

  let next = {
    ...settlement,
    pendingDeathResolutions: resolutions.map(entry => entry.id === resolutionId
      ? {
          ...entry,
          status: 'resolved',
          choice: principle,
          principleRewardGranted: true,
          principleRewardId: deathRewardId(entry)
        }
      : entry)
  };

  if (hasCampaignPrinciple(next, 'death', 'graves')) {
    next = gainMemories(next, 1, {
      id: deathRewardId(resolution),
      source: 'death-principle-graves',
      description: `${resolution.survivorName || 'A survivor'} was remembered by Graves.`,
      survivorIds: resolution.survivorId ? [resolution.survivorId] : [],
      lanternYear: resolution.lanternYear ?? settlement.lanternYear
    });
    return addSettlementHistory(next, {
      type: 'death-principle-reward',
      principleId: 'graves',
      resolutionId,
      message: `${resolution.survivorName || 'A survivor'} granted +1 Memory through Graves.`,
      survivorIds: resolution.survivorId ? [resolution.survivorId] : [],
      lanternYear: resolution.lanternYear ?? settlement.lanternYear,
      timestamp: new Date().toISOString()
    });
  }

  const safeResourceId = BASIC_RESOURCE_IDS.includes(resourceId)
    ? resourceId
    : BASIC_RESOURCE_IDS[Math.floor(Math.random() * BASIC_RESOURCE_IDS.length)] || 'bone';
  return addSettlementHistory({
    ...next,
    stash: {
      ...(next.stash || {}),
      [safeResourceId]: (next.stash?.[safeResourceId] || 0) + 1
    }
  }, {
    type: 'death-principle-reward',
    principleId: 'cannibalism',
    resolutionId,
    resourceId: safeResourceId,
    message: `${resolution.survivorName || 'A survivor'} granted 1 ${safeResourceId} through Cannibalism.`,
    survivorIds: resolution.survivorId ? [resolution.survivorId] : [],
    lanternYear: resolution.lanternYear ?? settlement.lanternYear,
    timestamp: new Date().toISOString()
  });
}

export function createHuntEventMemoryAward(amount, description = 'A hunt event preserved a memory.') {
  return {
    type: 'memoryAward',
    amount: 0,
    source: 'hunt-event',
    description: description || 'No Memory gained from hunt events under the current economy.'
  };
}
