import { getGearCards } from '../content/contentIndex.js';

export function getGearCatalog() {
  return getGearCards()
    .filter(item => item.sourceType === 'equipment' || item.tags?.includes('gear') || item.type === 'gear')
    .map(item => ({
      ...item,
      tags: item.tags || [],
      slot: item.slot || item.weaponType || 'Any',
      rulesSummary: item.description || item.rulesText || 'No rules summary available.',
      image: item.image || `assets/gear/${item.sourceGearId || item.id}.png`
    }));
}
