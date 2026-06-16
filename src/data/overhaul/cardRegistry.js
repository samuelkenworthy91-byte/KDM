import cardDataRaw from '../../../all_deck_cards.json' with { type: 'json' };

function numericValue(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

function addStatusEffects(effects, statusApplied) {
  if (!statusApplied) return;
  if (typeof statusApplied === 'object') {
    Object.entries(statusApplied).forEach(([status, amount]) => {
      effects.push({
        type: `${status.toLowerCase()}Monster`,
        amount: numericValue(amount) || 1
      });
    });
    return;
  }
  if (typeof statusApplied === 'string') {
    const match = statusApplied.match(/([A-Za-z]+)\s*(\d+)?/);
    if (match) {
      effects.push({
        type: `${match[1].toLowerCase()}Monster`,
        amount: numericValue(match[2]) || 1
      });
    }
  }
}

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
        amount: numericValue(card.damage)
      });
    }
  }
  if (card.block) {
    effects.push({
      type: 'block',
      amount: numericValue(card.block)
    });
  }
  if (card.breakDamage) {
    effects.push({
      type: 'breakBonus',
      amount: numericValue(card.breakDamage)
    });
  }
  addStatusEffects(effects, card.statusApplied);
  if (card.testBonus) effects.push({ type: 'testBonus', amount: numericValue(card.testBonus) });
  if (card.consequenceReduction) {
    effects.push({ type: 'consequenceReduction', amount: numericValue(card.consequenceReduction) });
  }
  if (card.salvage) effects.push({ type: 'salvage', value: card.salvage });
  if (card.prepared) effects.push({ type: 'prepared', value: card.prepared });
  if (card.panicGain) effects.push({ type: 'addPanic', amount: numericValue(card.panicGain) || 1 });
  
  acc[card.cardId] = {
    ...card,
    id: card.cardId,
    name: card.cardName,
    cost: card.energyCost ?? card.cost ?? 0,
    description: card.cardText || card.fullEffect || card.shortEffect,
    type: card.type,
    tags: card.tags || [],
    sourceType: 'gear',
    sourceGearName: card.equipmentName || card.sourceEquipmentName,
    cardCopyEligible: card.cardCopyEligible !== false,
    maxCopiesFromOneItem: Number(card.maxCopiesFromOneItem || 3),
    mechanicFlags: card.mechanicFlags || [],
    phaseRestriction: card.phaseRestriction || null,
    testBonus: card.testBonus,
    consequenceReduction: card.consequenceReduction,
    salvage: card.salvage,
    prepared: card.prepared,
    panicGain: card.panicGain,
    effects,
    exhaust: card.exhaust,
    implemented: true
  };
  return acc;
}, {});

export function getCard(id) {
  return overhaulCards[id] || null;
}
