function innovationRequirementMet(item, builtInnovations = []) {
  const requirement = item.requiresInnovation;
  if (!requirement) {
    return true;
  }
  return Array.isArray(requirement)
    ? requirement.some(id => builtInnovations.includes(id))
    : builtInnovations.includes(requirement);
}

export function canCraft(item, stash, armory = [], builtInnovations = []) {
  // TODO: Support multiple crafted charges for consumables when armory stacking is added.
  const alreadyOwned = armory.some(armoryItem => armoryItem.id === item.id);
  return !alreadyOwned &&
    innovationRequirementMet(item, builtInnovations) &&
    Object.entries(item.cost).every(
    ([resourceId, amount]) => (stash[resourceId] || 0) >= amount
  );
}

export function craftEquipment(item, stash, armory = [], builtInnovations = []) {
  if (!canCraft(item, stash, armory, builtInnovations)) {
    return { crafted: false, stash, armory };
  }

  const nextStash = { ...stash };
  Object.entries(item.cost).forEach(([resourceId, amount]) => {
    nextStash[resourceId] -= amount;
  });

  return {
    crafted: true,
    stash: nextStash,
    armory: [
      ...armory,
      {
        id: item.id,
        instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: item.name,
        slot: item.slot
      }
    ]
  };
}

export function getEquipmentEffects(equippedGear = []) {
  return equippedGear.reduce((effects, item) => {
    (item.effects || []).forEach(effect => {
      if (effect.type === 'addCard') {
        effects.cardIds.push(
          ...Array.from({ length: effect.copies || 1 }, () => effect.cardId)
        );
      } else {
        effects[effect.type] = (effects[effect.type] || 0) + (effect.amount || 0);
      }
    });
    Object.entries(item.cardPackage || {}).forEach(([cardId, copies]) => {
      effects.cardIds.push(...Array.from({ length: copies }, () => ({
        cardId,
        source: item.name
      })));
    });
    return effects;
  }, {
    cardIds: [],
    startBlock: 0,
    attackDamageBonus: 0,
    firstTurnDrawBonus: 0,
    firstSkillBlockBonus: 0,
    noBlockAttackBonus: 0
  });
}
