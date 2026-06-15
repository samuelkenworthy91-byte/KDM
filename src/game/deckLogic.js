import { cards, starterCardIds } from '../data/cards.js';
import { equipment } from '../data/equipment.js';

export function getStarterDeck() {
  return getCardsFromIds(starterCardIds, 'Starter deck', 'starter');
}

export function getPersonalCardId(addition) {
  return typeof addition === 'string' ? addition : addition?.cardId;
}

export function normalizePersonalCardAddition(addition, fallbackSourceType = 'personal') {
  if (typeof addition === 'string') {
    return {
      cardId: addition,
      sourceType: addition === 'panic' ? 'curse' : fallbackSourceType
    };
  }
  if (!addition?.cardId) return null;
  return {
    ...addition,
    sourceType: addition.sourceType || (addition.cardId === 'panic' ? 'curse' : fallbackSourceType)
  };
}

export function getCardsFromIds(cardIds = [], source, sourceType) {
  return cardIds.flatMap(addition => {
    const normalized = normalizePersonalCardAddition(addition, sourceType);
    const cardId = normalized?.cardId;
    const card = cards[cardId];
    if (!card) {
      console.warn(`Skipping missing card id "${cardId}"${source ? ` from ${source}` : ''}.`);
      return [];
    }
    return [{
      ...card,
      instanceId: `card-${cardId}-${Math.random().toString(36).substr(2, 9)}`,
      sourceType: sourceType || normalized.sourceType || card.sourceType,
      ...(source ? { source } : {}),
      ...(normalized.reason ? { sourceReason: normalized.reason } : {})
    }];
  });
}

export function getEquipmentCardIds(equippedGear = []) {
  return equippedGear.flatMap(itemOrId => {
    const item = typeof itemOrId === 'string'
      ? equipment[itemOrId]
      : itemOrId?.equipmentId
        ? equipment[itemOrId.equipmentId]
        : itemOrId;
    return item?.cardPackage || [];
  });
}

export function buildRunDeck({ survivor, equippedGear = [], temporaryCards = [] }) {
  const personalIds = survivor?.personalDeckAdditions || survivor?.deckAdditions || [];
  const negativeIds = survivor?.permanentNegativeCards || [];
  const forgotten = new Set(survivor?.forgottenCardIds || []);
  const deck = [
    ...getStarterDeck(),
    ...getCardsFromIds(personalIds, survivor?.name ? `${survivor.name}'s progress` : 'Survivor progress'),
    ...getCardsFromIds(negativeIds, survivor?.name ? `${survivor.name}'s permanent burdens` : 'Permanent burdens', 'curse')
  ].filter(card => !forgotten.has(card.id));
  const activeProficiencyType = survivor?.activeProficiencyType || 'fistAndTooth';

  equippedGear.forEach(itemOrId => {
    const item = typeof itemOrId === 'string'
      ? equipment[itemOrId]
      : itemOrId?.equipmentId
        ? equipment[itemOrId.equipmentId]
        : itemOrId;
    if (item) {
      deck.push(...getCardsFromIds(item.cardPackage, item.name, 'gear').map(card => ({
        ...card,
        weaponType: item.weaponType || null,
        keywords: [...new Set([...(card.keywords || []), ...(item.keywords || [])])]
      })));
    }
  });

  const activeDeck = deck.filter(card =>
    !['proficiency', 'weaponMastery'].includes(card.sourceType) ||
    card.weaponType === activeProficiencyType
  );
  return [...activeDeck, ...getCardsFromIds(temporaryCards, 'Hunt event', 'event')];
}

export function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function drawCards(deck, hand, discard, num) {
  let nextDeck = [...deck];
  let nextHand = [...hand];
  let nextDiscard = [...discard];

  for (let count = 0; count < num; count += 1) {
    if (nextDeck.length === 0) {
      if (nextDiscard.length === 0) {
        break;
      }

      nextDeck = shuffleCards(nextDiscard);
      nextDiscard = [];
    }

    const [drawnCard, ...remainingDeck] = nextDeck;
    nextDeck = remainingDeck;
    nextHand = [...nextHand, drawnCard];
  }

  return { deck: nextDeck, hand: nextHand, discard: nextDiscard };
}

export function discardCard(hand, discard, cardIndex) {
  const card = hand[cardIndex];

  if (!card) {
    return { hand, discard };
  }

  return {
    hand: hand.filter((_, index) => index !== cardIndex),
    discard: [...discard, card]
  };
}
