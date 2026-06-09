function personalCardId(addition) {
  return typeof addition === 'string' ? addition : addition?.cardId;
}

export function getMissingMemoryUnlockRequirements(item, settlement) {
  const requirement = item?.unlockRequirement;
  if (!requirement || requirement.type === 'always') return [];

  switch (requirement.type) {
    case 'personalCardOrPanic':
      return settlement.survivors.some(survivor =>
        (survivor.personalDeckAdditions || []).some(addition => Boolean(personalCardId(addition)))
      ) ? [] : [item.unlockText];
    case 'deadSurvivors':
      return (settlement.deadSurvivors || 0) >= requirement.count ? [] : [item.unlockText];
    case 'anyQuarryLevel':
      return Object.values(settlement.defeatedQuarryLevels || {}).some(level => level >= requirement.level)
        ? [] : [item.unlockText];
    case 'population':
      return (settlement.population || 0) >= requirement.count ? [] : [item.unlockText];
    case 'anyInjury':
      return settlement.conditionHistory?.injuryGained ||
        settlement.survivors.some(survivor => survivor.injuries?.length) ? [] : [item.unlockText];
    case 'differentQuarries':
      return Object.values(settlement.defeatedQuarryLevels || {}).filter(level => level > 0).length >= requirement.count
        ? [] : [item.unlockText];
    case 'disorderOrPanic':
      return settlement.conditionHistory?.disorderGained || settlement.survivors.some(survivor =>
        survivor.disorders?.length ||
        (survivor.personalDeckAdditions || []).some(addition => personalCardId(addition) === 'panic')
      ) ? [] : [item.unlockText];
    case 'craftedGear':
      return (settlement.totalCraftedGear || 0) >= requirement.count ? [] : [item.unlockText];
    case 'lanternYear':
      return (settlement.lanternYear || 0) >= requirement.count ? [] : [item.unlockText];
    case 'graveHistory':
      return (settlement.graveHistory?.length || 0) >= requirement.count ? [] : [item.unlockText];
    case 'any':
      return requirement.requirements.some(child =>
        getMissingMemoryUnlockRequirements({ ...item, unlockRequirement: child }, settlement).length === 0
      ) ? [] : [item.unlockText];
    default:
      return [item.unlockText || 'Campaign requirement not met.'];
  }
}

export function isMemoryInnovationUnlocked(item, settlement) {
  return getMissingMemoryUnlockRequirements(item, settlement).length === 0;
}

export function isMemoryActionUsed(settlement, actionId) {
  return settlement.memoryActionsUsedThisYear?.[actionId] === settlement.lanternYear;
}
