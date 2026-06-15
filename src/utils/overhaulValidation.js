import { gearRegistry } from '../data/overhaul/gearRegistry.js';
import { overhaulCards } from '../data/overhaul/cardRegistry.js';

export function validateOverhaulData() {
  const warnings = [];
  const gearIds = new Set();
  const cardIds = new Set(Object.keys(overhaulCards));

  gearRegistry.forEach(item => {
    if (!item.id) warnings.push(`Gear entry missing ID: ${item.originalKdmName}`);
    if (gearIds.has(item.id)) warnings.push(`Duplicate gear ID: ${item.id}`);
    gearIds.add(item.id);

    if (!item.name) warnings.push(`Gear ${item.id} missing name`);
    if (!item.slot && !item.ourSlot) warnings.push(`Gear ${item.id} missing slot/role`);
    
    if (!item.cardPackage || item.cardPackage.length === 0) {
      if (!item.passiveText && !item.ourPassiveEffect) {
        warnings.push(`Gear ${item.id} has no cards and no passive effect`);
      }
    } else {
      item.cardPackage.forEach(cardId => {
        if (!cardIds.has(cardId)) {
          warnings.push(`Gear ${item.id} references missing card ID: ${cardId}`);
        }
      });
      
      const uniqueCards = new Set(item.cardPackage);
      if (uniqueCards.size !== item.cardPackage.length) {
        warnings.push(`Gear ${item.id} has duplicate card IDs in its package`);
      }
    }

    if (!item.keywords || item.keywords.length === 0) {
      warnings.push(`Gear ${item.id} has no keywords`);
    }
    
    if (!item.location && !item.ourCraftingLocation && !item.source && !item.ourHuntSource) {
      warnings.push(`Gear ${item.id} missing source/crafting location`);
    }
  });

  if (warnings.length > 0) {
    console.warn(`[Overhaul Validation] Found ${warnings.length} issues:`, warnings);
  } else {
    console.log('[Overhaul Validation] Data is valid!');
  }

  return warnings;
}
