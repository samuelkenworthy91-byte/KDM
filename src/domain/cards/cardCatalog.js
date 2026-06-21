import { getGearCards } from '../content/contentIndex.js';

export function getCardCatalog() {
  return getGearCards().map(card => ({
    ...card,
    tags: card.tags || [],
    slot: card.slot || card.weaponType || '',
    rulesSummary: card.description || card.rulesText || 'No rules summary available.',
    image: card.image || `assets/cards/${card.id}.png`
  }));
}
