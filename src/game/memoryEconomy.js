import { BASIC_RESOURCE_IDS } from '../data/resources.js';

function normalizeAmount(amount) {
  return Math.max(0, Math.floor(Number(amount) || 0));
}

export function getMemoryBalance(settlement = {}) {
  if (Number.isFinite(settlement.memories)) return Math.max(0, settlement.memories);
  return Math.max(0, Number(settlement.settlementMemory) || 0);
}

export function canSpendMemories(settlement, amount) {
  return getMemoryBalance(settlement) >= normalizeAmount(amount);
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
  if (!spent || !canSpendMemories(settlement, spent)) return null;
  const balance = getMemoryBalance(settlement) - spent;
  return addMemoryTransaction({
    ...settlement,
    memories: balance,
    settlementMemory: balance
  }, {
    id: details.id || `memory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'spend',
    amount: -spent,
    balance,
    source: details.source || 'unknown',
    description: details.description || 'Memory spent.',
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
  return {
    ...settlement,
    pendingDeathResolutions: [
      ...existing,
      ...(resolutions || []).filter(entry => entry && !existingIds.has(entry.id))
    ]
  };
}

export function resolveDeathMemoryChoice(settlement, resolutionId, choice, resourceId = 'bone') {
  const resolutions = settlement.pendingDeathResolutions || [];
  const resolution = resolutions.find(entry => entry.id === resolutionId && entry.status === 'pending');
  if (!resolution) return settlement;

  let next = {
    ...settlement,
    pendingDeathResolutions: resolutions.map(entry => entry.id === resolutionId
      ? { ...entry, status: 'resolved', choice }
      : entry)
  };

  if (choice === 'bury') {
    return next;
  }

  if (choice === 'recover-resource') {
    const safeResourceId = BASIC_RESOURCE_IDS.includes(resourceId) ? resourceId : 'bone';
    next = {
      ...next,
      stash: {
        ...(next.stash || {}),
        [safeResourceId]: (next.stash?.[safeResourceId] || 0) + 1
      }
    };
  }

  return next;
}

export function createHuntEventMemoryAward(amount, description = 'A hunt event preserved a memory.') {
  return {
    type: 'memoryAward',
    amount: 0,
    source: 'hunt-event',
    description: description || 'No Memory gained from hunt events under the current economy.'
  };
}
