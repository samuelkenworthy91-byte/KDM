import { equipment } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { getGearMetadata } from '../data/gearMetadata.js';

/**
 * Checks if a locked requirement is met by the current hunting party and settlement state.
 * @param {Object} lockedUnless The requirement object from the event choice.
 * @param {Object} context The hunt context.
 * @param {Object[]} context.runParty All living survivors in the hunting party.
 * @param {Object} context.settlement The current settlement state.
 * @param {Object} context.selectedQuarry The current quarry being hunted.
 * @returns {boolean}
 */
export function meetsLockedRequirement(lockedUnless, context) {
  if (!lockedUnless) return true;
  const { type, requirements, ...params } = lockedUnless;

  switch (type) {
    case 'all':
      return requirements.every(req => meetsLockedRequirement(req, context));
    case 'any':
      return requirements.some(req => meetsLockedRequirement(req, context));
    case 'partyHasWeaponType':
      return (context.runParty || []).some(survivor => 
        (survivor.boundGear || []).some(gear => {
          const item = equipment[gear.equipmentId];
          const weaponType = item?.weaponType || getGearMetadata(item || {}).weaponType;
          return weaponType === params.weaponType;
        })
      );
    case 'partyHasGearTag':
      return (context.runParty || []).some(survivor => 
        (survivor.boundGear || []).some(gear => {
          const item = equipment[gear.equipmentId];
          if (!item) return false;
          const metadata = getGearMetadata(item);
          const allTags = [
            ...(item.tags || []),
            ...(item.keywords || []),
            item.slot,
            item.loadoutCategory,
            item.itemType,
            metadata.slot,
            ...(metadata.keywords || [])
          ].filter(Boolean).map(tag => String(tag).toLowerCase());
          return allTags.includes(String(params.tag).toLowerCase());
        })
      );
    case 'partyHasGearId':
      return (context.runParty || []).some(survivor => 
        (survivor.boundGear || []).some(gear => gear.equipmentId === params.equipmentId)
      );
    case 'partyHasTrait':
      return (context.runParty || []).some(survivor => 
        (survivor.traits || []).includes(params.traitId)
      );
    case 'partyHasFightingArt':
      return (context.runParty || []).some(survivor => 
        (survivor.fightingArts || []).includes(params.fightingArtId)
      );
    case 'partyHasFightingArtTag':
      return (context.runParty || []).some(survivor => 
        (survivor.fightingArts || []).some(artId => {
          const art = fightingArts[artId];
          return art && (art.tags || []).includes(params.tag);
        })
      );
    case 'partyHasCondition':
      return (context.runParty || []).some(survivor => {
        const { conditionType, conditionId } = params;
        if (conditionType === 'scar') return (survivor.scars || []).includes(conditionId);
        if (conditionType === 'disorder') return (survivor.disorders || []).includes(conditionId);
        if (conditionType === 'injury') return (survivor.injuries || []).includes(conditionId);
        return false;
      });
    case 'settlementHasInnovation':
      return (context.settlement?.innovationDeckState?.builtInnovationIds || []).includes(params.innovationId);
    case 'partyHasMonsterBaneForCurrentQuarry': {
      if (!context.selectedQuarry) return false;
      const targetBaneId = `monsterBane_${context.selectedQuarry.id}`;
      return (context.runParty || []).some(survivor => 
        (survivor.fightingArts || []).includes(targetBaneId)
      );
    }
    default:
      console.warn(`Unknown requirement type: ${type}`);
      return false;
  }
}

/**
 * Returns the locked text for a choice if it is locked.
 * @param {Object} choice
 * @param {Object} context
 * @returns {string|null}
 */
export function getChoiceLockedText(choice, context) {
  if (!choice.lockedUnless) return null;
  if (meetsLockedRequirement(choice.lockedUnless, context)) return null;
  return choice.lockedText || 'Locked';
}

/**
 * Checks if an event choice can be used.
 * @param {Object} choice
 * @param {Object} context
 * @returns {boolean}
 */
export function canUseEventChoice(choice, context) {
  if (!choice.lockedUnless) return true;
  return meetsLockedRequirement(choice.lockedUnless, context);
}
