import { cards } from '../data/cards.js';
import { equipmentList } from '../data/equipment.js';

export function validateOverhaulData() {
  const warnings = [];
  const gearIds = new Set();
  const cardIds = new Set(Object.keys(cards));

  equipmentList.forEach(item => {
    if (!item.id) warnings.push(`Gear entry missing ID: ${item.name || 'unknown'}`);
    if (gearIds.has(item.id)) warnings.push(`Duplicate gear ID: ${item.id}`);
    gearIds.add(item.id);

    if (!item.name) warnings.push(`Gear ${item.id} missing name`);
    if (!item.slot) warnings.push(`Gear ${item.id} missing slot`);
    if (!item.keywords || item.keywords.length === 0) warnings.push(`Gear ${item.id} has no keywords`);

    if (!item.cardPackage || item.cardPackage.length === 0) {
      warnings.push(`Gear ${item.id} has no cards`);
    } else {
      item.cardPackage.forEach(cardId => {
        if (!cardIds.has(cardId)) warnings.push(`Gear ${item.id} references missing card ID: ${cardId}`);
      });
      const uniqueCards = new Set(item.cardPackage);
      if (uniqueCards.size !== item.cardPackage.length) {
        warnings.push(`Gear ${item.id} has duplicate card IDs in its package`);
      }
    }
  });

  if (warnings.length > 0) {
    console.warn(`[Gear Validation] Found ${warnings.length} issues:`, warnings);
  }

  return warnings;
}
