export function canCraft(equipmentItem, inventory = {}) {
  return Object.entries(equipmentItem.cost || {}).every(
    ([resourceId, amount]) => (inventory[resourceId] || 0) >= amount
  );
}

export function applyEquipmentEffect(equipmentItem, runState = {}) {
  const nextState = {
    ...runState,
    craftedEquipment: [...(runState.craftedEquipment || [])],
    deckCardIds: [...(runState.deckCardIds || [])],
    nextCombatCardIds: [...(runState.nextCombatCardIds || [])],
    equipmentEffects: { ...(runState.equipmentEffects || {}) }
  };

  (equipmentItem.effects || []).forEach(effect => {
    switch (effect.type) {
      case 'addCard':
        nextState.deckCardIds.push(
          ...Array.from({ length: effect.copies || 1 }, () => effect.cardId)
        );
        break;
      case 'addNextCombatCard':
        nextState.nextCombatCardIds.push(
          ...Array.from({ length: effect.copies || 1 }, () => effect.cardId)
        );
        break;
      case 'startBlock':
        nextState.equipmentEffects.startBlock =
          (nextState.equipmentEffects.startBlock || 0) + effect.block;
        break;
      case 'attackDamageBonus':
        nextState.equipmentEffects.attackDamageBonus =
          (nextState.equipmentEffects.attackDamageBonus || 0) + effect.amount;
        break;
      case 'firstTurnDrawBonus':
        nextState.equipmentEffects.firstTurnDrawBonus =
          (nextState.equipmentEffects.firstTurnDrawBonus || 0) + effect.amount;
        break;
      default:
        break;
    }
  });

  return nextState;
}

export function craftEquipment(equipmentItem, inventory = {}, runState = {}) {
  const craftedEquipment = runState.craftedEquipment || [];
  const alreadyCrafted =
    equipmentItem.slot !== 'consumable' && craftedEquipment.includes(equipmentItem.id);

  if (alreadyCrafted || !canCraft(equipmentItem, inventory)) {
    return { inventory, runState, crafted: false };
  }

  const nextInventory = { ...inventory };
  Object.entries(equipmentItem.cost || {}).forEach(([resourceId, amount]) => {
    nextInventory[resourceId] = Math.max(0, (nextInventory[resourceId] || 0) - amount);
  });

  const withCraftedItem = {
    ...runState,
    craftedEquipment: [...craftedEquipment, equipmentItem.id]
  };

  return {
    inventory: nextInventory,
    runState: applyEquipmentEffect(equipmentItem, withCraftedItem),
    crafted: true
  };
}

export function getCraftableEquipment(inventory = {}, craftedEquipment = []) {
  return equipmentList.filter(item => {
    const alreadyCrafted = item.slot !== 'consumable' && craftedEquipment.includes(item.id);
    return !alreadyCrafted && canCraft(item, inventory);
  });
}
import { equipmentList } from '../data/equipment.js';
