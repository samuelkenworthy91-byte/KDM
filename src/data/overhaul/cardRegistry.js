import cardDataRaw from '../../../.agents/gear-card-overhaul/all_deck_cards.json' with { type: 'json' };

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
    // We'll add a new effect type or handle it in damage
    effects.push({
      type: 'breakBonus',
      amount: parseInt(card.breakDamage) || 0
    });
  }
  // statusApplied is handled separately in playCard now, but we could add it here too
  
  acc[card.cardId] = {
    ...card,
    id: card.cardId,
    name: card.cardName,
    cost: card.energyCost,
    description: card.cardText,
    type: card.type,
    tags: card.tags,
    effects,
    exhaust: card.exhaust,
    implemented: true
  };
  return acc;
}, {});

export function getCard(id) {
  return overhaulCards[id] || null;
}
