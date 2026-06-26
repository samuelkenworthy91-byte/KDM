import { gearCatalog as defaultGearCatalog } from '../../data/gear/gearCatalog.js';
import { gearCards as defaultGearCards } from '../../data/gear/gearCards.js';
import { buildSurvivorDeckFromLoadout } from '../gear/gearCardGrouping.js';

const FALLBACK_WARNING = 'No linked gear cards found; fallback starter deck used.';

function safeCombatCard(card, index = 0) {
  const raw = card && typeof card === 'object' ? card : {};
  const id = raw.id || raw.cardId || `combat-card-${index + 1}`;
  const name = raw.name || raw.displayName || raw.cardName || `Combat Card ${index + 1}`;
  return {
    ...raw,
    id,
    name,
    type: raw.type || 'skill',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    effects: Array.isArray(raw.effects) ? raw.effects : [],
    description: raw.description || raw.rulesText || raw.rulesSummary || 'No rules text available.'
  };
}

function isPlayableCard(card) {
  if (!card || card.unplayable) return false;
  if (card.type === 'passive') return false;
  if (card.passive === true || card.passiveText || card.passiveEffect) return false;
  return Array.isArray(card.effects) && card.effects.length > 0;
}

function fallbackStarterDeck() {
  return [
    { id: 'fallback-strike', name: 'Fallback Strike', type: 'attack', effects: [{ type: 'damage', amount: 3 }], description: 'Deal 3 damage.', tags: ['fallback'] },
    { id: 'fallback-guard', name: 'Fallback Guard', type: 'skill', effects: [{ type: 'block', amount: 2 }], description: 'Gain 2 Block.', tags: ['fallback'] },
    { id: 'fallback-scramble', name: 'Fallback Scramble', type: 'skill', effects: [{ type: 'survival', amount: 1 }], description: 'Gain 1 survival.', tags: ['fallback'] }
  ];
}

export function shuffleCards(cards = [], random = Math.random) {
  const deck = [...(Array.isArray(cards) ? cards : [])].filter(Boolean);
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor((typeof random === 'function' ? random() : 0.5) * (index + 1));
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }
  return deck;
}

export function drawCards(state, count = 1) {
  const next = {
    ...state,
    drawPile: [...(state?.drawPile || [])],
    hand: [...(state?.hand || [])],
    discardPile: [...(state?.discardPile || [])]
  };

  for (let index = 0; index < count; index += 1) {
    if (!next.drawPile.length && next.discardPile.length) {
      next.drawPile = [...next.discardPile];
      next.discardPile = [];
    }
    const card = next.drawPile.shift();
    if (card) next.hand.push(card);
  }

  return next;
}

export function buildCombatDeckForSurvivor({
  survivor,
  loadout,
  cardCatalog = defaultGearCards,
  gearCatalog = defaultGearCatalog,
  random
} = {}) {
  const warnings = [];
  const deck = buildSurvivorDeckFromLoadout({ survivor, loadout, cardCatalog, gearCatalog });
  const playable = deck.activeCards.map(safeCombatCard).filter(isPlayableCard);
  const passives = deck.passiveCards.map(safeCombatCard);
  const sourceGroups = deck.sourceGroups.map(group => ({
    ...group,
    activeCards: group.activeCards.map(safeCombatCard).filter(isPlayableCard),
    passiveCards: group.passiveCards.map(safeCombatCard),
    unlinkedCards: (group.unlinkedCards || []).map(safeCombatCard)
  }));

  if (!playable.length) {
    warnings.push(FALLBACK_WARNING);
    return {
      drawPile: shuffleCards(fallbackStarterDeck().map(safeCombatCard), random),
      sourceGroups,
      passives,
      warnings
    };
  }

  return {
    drawPile: typeof random === 'function' ? shuffleCards(playable, random) : playable,
    sourceGroups,
    passives,
    warnings
  };
}
