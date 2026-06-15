import { birthTraitOptions } from '../data/childTraits.js';
import {
  createBornSurvivorName,
  getSurvivorDisplayName
} from './survivorIdentity.js';

export function createPendingNewborn(parentA, parentB, options = {}) {
  const identity = createBornSurvivorName(parentA, parentB, {
    primaryParent: options.primaryParent || parentB,
    random: options.random
  });

  return {
    id: options.id || `newborn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    parentIds: [parentA?.id, parentB?.id].filter(Boolean),
    parentNames: [getSurvivorDisplayName(parentA), getSurvivorDisplayName(parentB)],
    suggestedFamilyNames: [...new Set([
      options.primaryParent?.familyName,
      parentB?.familyName,
      parentA?.familyName,
      identity.familyName
    ].filter(Boolean))],
    suggestedFirstName: identity.firstName,
    innateTraitIds: [...new Set((options.innateTraitIds || []).filter(Boolean))],
    birthLanternYear: Number(options.birthLanternYear) || 0,
    generation: identity.generation,
    remainingBirths: Math.max(1, Number(options.remainingBirths) || 1),
    source: 'intimacy',
    historyTimestamp: options.historyTimestamp || null
  };
}

export function getBirthTraitCost(traitIds = []) {
  return [...new Set(traitIds)].reduce((total, traitId) => {
    return total + (birthTraitOptions.find(option => option.id === traitId)?.costMemory || 0);
  }, 0);
}
