import { cards } from '../data/cards.js';
import { fightingArts } from '../data/fightingArts.js';
import { spendMemories } from './memoryEconomy.js';

export const MEMORY_TRAINING_ACTION_ID = 'memoryTraining';
export const MEMORY_TRAINING_UNLOCK_IDS = ['nightDrills', 'memoryPit'];

function hasMemoryTraining(settlement = {}) {
  return MEMORY_TRAINING_UNLOCK_IDS.some(id => settlement.builtMemoryInnovations?.includes(id));
}

function addUnique(list = [], id) {
  return list.includes(id) ? list : [...list, id];
}

function firstNewFightingArt(survivor = {}) {
  return Object.keys(fightingArts).find(id => !survivor.fightingArts?.includes(id)) || null;
}

function activeWeaponType(survivor = {}) {
  return survivor.activeProficiencyType || 'fistAndTooth';
}

function addWeaponProgress(survivor) {
  const weaponType = activeWeaponType(survivor);
  const current = survivor.weaponProficiency?.[weaponType] || {};
  return {
    ...survivor,
    weaponProficiency: {
      ...(survivor.weaponProficiency || {}),
      [weaponType]: {
        ...current,
        xp: (current.xp || 0) + 1
      }
    }
  };
}

function addGearPractice(survivor, selectedCardId) {
  const cardId = selectedCardId || survivor.boundGear?.[0]?.equipmentId || 'unassigned';
  return {
    ...survivor,
    gearCardTraining: {
      ...(survivor.gearCardTraining || {}),
      [cardId]: (survivor.gearCardTraining?.[cardId] || 0) + 1
    }
  };
}

function removeOnePanic(survivor) {
  let removed = false;
  const removeFrom = additions => (additions || []).filter(addition => {
    const cardId = typeof addition === 'string' ? addition : addition?.cardId;
    if (!removed && cardId === 'panic') {
      removed = true;
      return false;
    }
    return true;
  });
  return {
    ...survivor,
    personalDeckAdditions: removeFrom(survivor.personalDeckAdditions),
    permanentNegativeCards: removed
      ? survivor.permanentNegativeCards || []
      : removeFrom(survivor.permanentNegativeCards)
  };
}

function addFightingArt(survivor) {
  const artId = firstNewFightingArt(survivor);
  return artId ? { ...survivor, fightingArts: addUnique(survivor.fightingArts || [], artId) } : survivor;
}

function applyMemoryTrainingOutcome(survivor, roll, selectedCardId) {
  if (roll <= 2) {
    return {
      ...survivor,
      injuries: addUnique(survivor.injuries || [], 'deepCut'),
      history: [...(survivor.history || []), 'Memory Training went wrong: gained Deep Cut.']
    };
  }
  if (roll <= 5) {
    return survivor.scars?.length
      ? removeOnePanic(survivor)
      : { ...survivor, scars: addUnique(survivor.scars || [], 'deadEyeCalm') };
  }
  if (roll <= 10) return addWeaponProgress(survivor);
  if (roll <= 14) return addGearPractice(survivor, selectedCardId);
  if (roll <= 17) return addFightingArt(survivor);
  if (roll <= 19) return addGearPractice(addFightingArt(survivor), selectedCardId);
  return {
    ...addWeaponProgress(addFightingArt(survivor)),
    personalDeckAdditions: cards.hardWonGuard
      ? [
          ...(survivor.personalDeckAdditions || []),
          { cardId: 'hardWonGuard', sourceType: 'training', reason: 'Memory Training perfect lesson' }
        ]
      : survivor.personalDeckAdditions || []
  };
}

export function resolveMemoryTraining(settlement, survivorId, options = {}) {
  if (!hasMemoryTraining(settlement)) return settlement;
  if (settlement.memoryActionsUsedThisYear?.[MEMORY_TRAINING_ACTION_ID] === settlement.lanternYear) return settlement;
  const survivor = settlement.survivors?.find(item => item.id === survivorId && item.alive !== false);
  if (!survivor) return settlement;

  const spent = spendMemories(settlement, 1, {
    source: MEMORY_TRAINING_ACTION_ID,
    description: 'A survivor completed Memory Training.',
    survivorIds: [survivorId]
  });
  if (!spent) return settlement;

  const roll = Math.min(20, Math.max(1, Math.floor(options.roll ?? Math.random() * 20 + 1)));
  return {
    ...spent,
    memoryActionsUsedThisYear: {
      ...(spent.memoryActionsUsedThisYear || {}),
      [MEMORY_TRAINING_ACTION_ID]: settlement.lanternYear
    },
    survivorTrainingLog: [
      ...(spent.survivorTrainingLog || []),
      { survivorId, actionId: MEMORY_TRAINING_ACTION_ID, roll, lanternYear: settlement.lanternYear }
    ],
    survivors: spent.survivors.map(item => item.id === survivorId
      ? applyMemoryTrainingOutcome(item, roll, options.cardId)
      : item)
  };
}
