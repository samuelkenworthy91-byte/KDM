export function canCraft(item, inventory = {}, craftedEquipment = []) {
  if (!item || craftedEquipment.includes(item.id)) {
    return false;
  }

  return Object.entries(item.cost).every(
    ([resourceId, amount]) => (inventory[resourceId] || 0) >= amount
  );
}

function collectEquipmentEffects(craftedEquipment, equipmentById) {
  const effects = {
    startBlock: 0,
    attackDamageBonus: 0,
    firstTurnDrawBonus: 0
  };

  craftedEquipment.forEach(itemId => {
    equipmentById[itemId]?.effects.forEach(effect => {
      if (effect.type !== 'addCard') {
        effects[effect.type] = (effects[effect.type] || 0) + effect.amount;
      }
    });
  });

  return effects;
}

export function craftEquipment(item, runState, equipmentById) {
  if (!canCraft(item, runState.inventory, runState.craftedEquipment)) {
    return { crafted: false, runState };
  }

  const inventory = { ...runState.inventory };
  Object.entries(item.cost).forEach(([resourceId, amount]) => {
    inventory[resourceId] -= amount;
  });

  const craftedEquipment = [...(runState.craftedEquipment || []), item.id];
  const addedCards = item.effects
    .filter(effect => effect.type === 'addCard')
    .flatMap(effect => Array.from({ length: effect.copies || 1 }, () => effect.cardId));
  const personalDeckAdditions = [
    ...(runState.personalDeckAdditions || []),
    ...addedCards
  ];

  return {
    crafted: true,
    runState: {
      ...runState,
      inventory,
      resources: Object.entries(inventory).flatMap(([resourceId, amount]) =>
        Array.from({ length: Math.max(0, amount) }, () => resourceId)
      ),
      craftedEquipment,
      personalDeckAdditions,
      deck: [...(runState.deck || []), ...addedCards],
      equipmentEffects: collectEquipmentEffects(craftedEquipment, equipmentById)
    }
  };
}

export function getEquipmentEffects(craftedEquipment, equipmentById) {
  return collectEquipmentEffects(craftedEquipment || [], equipmentById);
}
