import cardDataRaw from '../../../all_deck_cards.json' with { type: 'json' };

function numericValue(value) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : 0;
}

export const canonicalStatusEffectTypes = {
  bleed: 'bleedTarget',
  burn: 'burnTarget',
  poison: 'poisonTarget',
  doom: 'doomTarget',
  vulnerable: 'vulnerableTarget',
  stagger: 'staggerTarget',
  staggered: 'staggerTarget',
  guard: 'guardTarget',
  guarded: 'guardTarget',
  mark: 'markTarget',
  marked: 'markTarget',
  expose: 'exposeTarget',
  exposed: 'exposeTarget',
  snare: 'snareTarget',
  snared: 'snareTarget',
  shock: 'shockTarget',
  blind: 'blindTarget',
  dodge: 'guardSelf',
  prepared: 'preparedSelf',
  salvage: 'salvageSelf',
  testbonus: 'testBonus',
  consequence: 'consequenceReduction',
  consequencereduction: 'consequenceReduction'
};

export function getCanonicalStatusEffectType(status) {
  const key = String(status || '').toLowerCase().replace(/[^a-z]/g, '');
  return canonicalStatusEffectTypes[key] || null;
}

function targetAwareStatusType(status, cardType) {
  const key = String(status || '').toLowerCase().replace(/[^a-z]/g, '');
  if (key === 'dodge') return 'guardSelf';
  if (['guard', 'guarded'].includes(key) && cardType !== 'attack') return 'guardSelf';
  return getCanonicalStatusEffectType(status);
}

function addStatusEffects(effects, statusApplied, cardType) {
  if (!statusApplied) return;
  if (typeof statusApplied === 'object') {
    Object.entries(statusApplied).forEach(([status, amount]) => {
      const type = targetAwareStatusType(status, cardType);
      if (!type) return;
      effects.push({
        type,
        amount: numericValue(amount) || 1
      });
    });
    return;
  }
  if (typeof statusApplied === 'string') {
    const matches = statusApplied.matchAll(/([A-Za-z]+(?:\s+[A-Za-z]+)?)\s*(\d+)?/g);
    for (const match of matches) {
      const type = targetAwareStatusType(match[1], cardType);
      if (!type) continue;
      effects.push({
        type,
        amount: numericValue(match[2]) || 1
      });
    }
  }
}

function addAuraEffects(effects, card) {
  const auras = [
    ...(Array.isArray(card.auras) ? card.auras : []),
    ...(card.aura ? [card.aura] : [])
  ].filter(Boolean);
  auras.forEach(aura => {
    if (typeof aura === 'string') {
      effects.push({ type: 'aura', auraType: aura, amount: 1, duration: 'combat' });
      return;
    }
    if (typeof aura !== 'object') return;
    effects.push({
      type: 'aura',
      auraType: aura.type || aura.auraType,
      amount: numericValue(aura.amount) || 1,
      duration: aura.duration || 'combat',
      remainingUses: aura.remainingUses,
      rounds: aura.rounds
    });
  });
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
  addStatusEffects(effects, card.statusApplied, card.type);
  if (card.testBonus) effects.push({ type: 'testBonus', amount: numericValue(card.testBonus) });
  if (card.consequenceReduction) {
    effects.push({ type: 'consequenceReduction', amount: numericValue(card.consequenceReduction) });
  }
  if (card.salvage) effects.push({ type: 'salvageSelf', amount: numericValue(card.salvage) || 1 });
  if (card.prepared) effects.push({ type: 'preparedSelf', amount: numericValue(card.prepared) || 1 });
  if (card.panicGain) effects.push({ type: 'addPanic', amount: numericValue(card.panicGain) || 1 });
  if (card.panicClear) effects.push({ type: 'removePanicAny', amount: numericValue(card.panicClear) || 1 });
  if (card.heal) effects.push({ type: 'healSelf', amount: numericValue(card.heal) || 1 });
  if (card.healIfWounded) {
    effects.push({ type: 'healIfWounded', amount: numericValue(card.healIfWounded) || 1 });
  }
  if (card.healAfterCombat) {
    effects.push({ type: 'healAfterCombat', amount: numericValue(card.healAfterCombat) || 1 });
  }
  if (card.partyHealAfterCombat) {
    effects.push({ type: 'partyHealAfterCombat', amount: numericValue(card.partyHealAfterCombat) || 1 });
  }
  if (card.reduceBleedSelf) {
    effects.push({ type: 'reduceBleedSelf', amount: numericValue(card.reduceBleedSelf) || 1 });
  }
  if (card.targetAvoidance) {
    effects.push({ type: 'targetAvoidance', amount: numericValue(card.targetAvoidance) || 1 });
  }
  if (card.partyBlock) {
    effects.push({
      type: 'partyEffect',
      target: 'nextPartyMember',
      effectType: 'block',
      value: numericValue(card.partyBlock) || 1
    });
  }
  if (card.partyDraw) {
    effects.push({
      type: 'partyEffect',
      target: 'nextPartyMember',
      effectType: 'draw',
      value: numericValue(card.partyDraw) || 1
    });
  }
  if (card.partyReveal) {
    effects.push({
      type: 'partyEffect',
      target: 'nextPartyMember',
      effectType: 'reveal',
      value: numericValue(card.partyReveal) || 1
    });
  }
  addAuraEffects(effects, card);
  
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
    panicClear: card.panicClear,
    heal: card.heal,
    healIfWounded: card.healIfWounded,
    healAfterCombat: card.healAfterCombat,
    partyHealAfterCombat: card.partyHealAfterCombat,
    reduceBleedSelf: card.reduceBleedSelf,
    targetAvoidance: card.targetAvoidance,
    partyBlock: card.partyBlock,
    partyDraw: card.partyDraw,
    partyReveal: card.partyReveal,
    aura: card.aura,
    auras: card.auras,
    effects,
    exhaust: card.exhaust,
    implemented: true
  };
  return acc;
}, {});

export function getCard(id) {
  return overhaulCards[id] || null;
}
