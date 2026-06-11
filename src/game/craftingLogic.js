import { resources } from '../data/resources.js';
import { innovations } from '../data/innovations.js';
import {
  getHighestDefeatedQuarryLevel,
  normalizeDefeatedQuarryLevels
} from '../data/quarries.js';

export function getMissingResources(cost = {}, stash = {}) {
  return Object.entries(cost)
    .map(([resourceId, required]) => ({
      resourceId,
      required,
      owned: stash[resourceId] || 0,
      missing: Math.max(0, required - (stash[resourceId] || 0))
    }))
    .filter(entry => entry.missing > 0);
}

export function formatCostWithMissing(cost = {}, stash = {}) {
  return Object.entries(cost).map(([resourceId, required]) => {
    const owned = stash[resourceId] || 0;
    const missing = Math.max(0, required - owned);
    return {
      resourceId,
      name: resources[resourceId]?.name || resourceId,
      owned,
      required,
      missing,
      text: `${resources[resourceId]?.name || resourceId}: ${owned} / ${required}${missing ? ` (Missing ${missing})` : ''}`
    };
  });
}

export function canAffordCost(cost, stash) {
  return getMissingResources(cost, stash).length === 0;
}

export function getMissingUnlockRequirements(item, settlement) {
  const requirement = item?.unlockRequirement;
  if (!requirement) {
    if (item?.requiresInnovation && !settlement.builtInnovations?.includes(item.requiresInnovation)) {
      return [`Build ${innovations[item.requiresInnovation]?.name || item.requiresInnovation}.`];
    }
    return [];
  }
  if (requirement.type === 'always') return [];

  switch (requirement.type) {
    case 'quarryLevel':
      return getHighestDefeatedQuarryLevel(settlement, requirement.quarryId) >= requirement.level
        ? []
        : [item.unlockText || `Defeat ${requirement.quarryId} Level ${requirement.level}.`];
    case 'completedHunts':
      return (settlement.completedHunts || 0) >= requirement.count
        ? []
        : [`Complete ${requirement.count} hunts (${settlement.completedHunts || 0}/${requirement.count}).`];
    case 'deadSurvivors':
      return (settlement.deadSurvivors || 0) >= requirement.count
        ? []
        : [`Lose ${requirement.count} survivor (${settlement.deadSurvivors || 0}/${requirement.count}).`];
    case 'craftedGear':
      return (settlement.craftedGear?.length || 0) >= requirement.count
        ? []
        : [`Craft ${requirement.count} gear pieces (${settlement.craftedGear?.length || 0}/${requirement.count}).`];
    case 'anyQuarryLevel':
      return Object.values(normalizeDefeatedQuarryLevels(settlement.defeatedQuarryLevels))
        .some(levels => Math.max(0, ...levels) >= requirement.level)
        ? []
        : [`Defeat any quarry at Level ${requirement.level}.`];
    case 'any':
      return requirement.requirements.some(child =>
        getMissingUnlockRequirements({ unlockRequirement: child }, settlement).length === 0
      ) ? [] : [item.unlockText || 'Meet one campaign requirement.'];
    default:
      return ['Campaign requirement not met.'];
  }
}

export function canBuildUnlocked(item, settlement) {
  if (settlement.rumouredInnovations?.includes(item.id)) return true;
  return getMissingUnlockRequirements(item, settlement).length === 0;
}

export function deductCost(stash, cost) {
  const next = { ...stash };
  Object.entries(cost).forEach(([resourceId, amount]) => {
    next[resourceId] = Math.max(0, (next[resourceId] || 0) - amount);
  });
  return next;
}

export function addResources(stash, resourceIds) {
  const next = { ...stash };
  resourceIds.forEach(resourceId => {
    next[resourceId] = (next[resourceId] || 0) + 1;
  });
  return next;
}

export function canCraft(item, inventory) {
  return canAffordCost(item.cost, inventory);
}

export function craft(item, inventory) {
  return canCraft(item, inventory) ? deductCost(inventory, item.cost) : inventory;
}
