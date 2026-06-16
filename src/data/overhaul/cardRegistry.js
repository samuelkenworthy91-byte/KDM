import cardDataRaw from '../../../all_deck_cards.json' with { type: 'json' };

export const overhaulCards = cardDataRaw.reduce((acc, card) => {
  const effects = [];
  if (card.damage) {
    if (typeof card.damage === 'string' && card.damage.includes('current block')) {
      const match = card.damage.match(/cap (\d+)/);
      effects.push({
        type: card.type === 'attack' ? 'damage' : 'skillDamage',
        amount: 0,
        bonusPerBlock: 1,
        maximumBonus: match ? parseInt(match[1]) : 20
      });
    } else {
      effects.push({
        type: card.type === 'attack' ? 'damage' : 'skillDamage',
        amount: parseInt(card.damage) || 0
      });
    }
  }
  if (card.block) {
    effects.push({
      type: 'block',
      amount: parseInt(card.block) || 0
    });
  }
  if (card.breakDamage) {
    effects.push({
      type: 'breakBonus',
      amount: parseInt(card.breakDamage) || 0
    });
  }
  if (card.statusApplied && typeof card.statusApplied === 'object') {
    Object.entries(card.statusApplied).forEach(([status, amount]) => {
      effects.push({
        type: `${status.toLowerCase()}Monster`,
        amount: parseInt(amount) || 1
      });
    });
  }
  
  acc[card.cardId] = {
    ...card,
    id: card.cardId,
    name: card.cardName,
    cost: card.energyCost ?? card.cost ?? 0,
    description: card.cardText || card.fullEffect || card.shortEffect,
    type: card.type,
    tags: card.tags,
    sourceType: 'gear',
    sourceGearName: card.equipmentName || card.sourceEquipmentName,
    cardCopyEligible: card.cardCopyEligible !== false,
    maxCopiesFromOneItem: Number(card.maxCopiesFromOneItem || 3),
    effects,
    exhaust: card.exhaust,
    implemented: true
  };
  return acc;
}, {});

export function getCard(id) {
  return overhaulCards[id] || null;
}
