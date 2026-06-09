import { innovations } from '../data/innovations.js';

export function hasInnovation(settlement, innovationId) {
  return (settlement?.builtInnovations || []).includes(innovationId);
}

export function canBuildInnovation(innovation, settlementStash, builtInnovations = []) {
  if (!innovation || builtInnovations.includes(innovation.id)) {
    return false;
  }
  const requirementsMet = (innovation.requires || []).every(id => builtInnovations.includes(id));
  return requirementsMet && Object.entries(innovation.cost || {}).every(
    ([resourceId, amount]) => (settlementStash?.[resourceId] || 0) >= amount
  );
}

export function buildInnovation(settlement, innovationId) {
  const innovation = innovations[innovationId];
  if (!canBuildInnovation(
    innovation,
    settlement.settlementStash,
    settlement.builtInnovations
  )) {
    return settlement;
  }

  const settlementStash = { ...settlement.settlementStash };
  Object.entries(innovation.cost).forEach(([resourceId, amount]) => {
    settlementStash[resourceId] -= amount;
  });

  return {
    ...settlement,
    settlementStash,
    builtInnovations: [...settlement.builtInnovations, innovationId]
  };
}

export function getUnlockedRecipeIds(settlement) {
  return [...new Set(
    (settlement?.builtInnovations || []).flatMap(id => innovations[id]?.unlocksRecipes || [])
  )];
}

export function getGearLimit(settlement) {
  return hasInnovation(settlement, 'armoryRack') ? 5 : 4;
}
