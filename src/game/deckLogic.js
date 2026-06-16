import { cards, legacyCompatibilityCards, starterCardIds } from '../data/cards.js';
import { equipment, getEquipment } from '../data/equipment.js';

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

function resolveCard(cardId, includeLegacyCompatibility = false) {
  return cards[cardId] || (includeLegacyCompatibility ? legacyCompatibilityCards[cardId] : null);
}

export function getCardsFromIds(cardIds = [], source, sourceType, options = {}) {
  const includeLegacyCompatibility = Boolean(options.includeLegacyCompatibility);
  return cardIds.flatMap(addition => {
    const normalized = normalizePersonalCardAddition(addition, sourceType);
    const cardId = normalized?.cardId;
    const card = resolveCard(cardId, includeLegacyCompatibility);
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
    const item = resolveEquippedGear(itemOrId)?.item;
    return item?.cardPackage || [];
  });
}

function resolveEquippedGear(itemOrId) {
  if (typeof itemOrId === 'string') {
    const item = equipment[itemOrId] || getEquipment(itemOrId);
    return item ? { item, gearInstanceId: itemOrId, equipmentId: itemOrId } : null;
  }
  if (itemOrId?.equipmentId) {
    const item = equipment[itemOrId.equipmentId] || getEquipment(itemOrId.equipmentId);
    return item ? {
      item,
      gearInstanceId: itemOrId.instanceId || itemOrId.equipmentId,
      equipmentId: itemOrId.equipmentId
    } : null;
  }
  if (itemOrId?.id) {
    return {
      item: itemOrId,
      gearInstanceId: itemOrId.instanceId || itemOrId.id,
      equipmentId: itemOrId.id
    };
  }
  return null;
}

function getTrainedCopyCount(survivor, gearInstanceId, cardId) {
  const training = survivor?.gearCardTraining || {};
  const fullKey = `${survivor?.id || 'survivor'}:${gearInstanceId}:${cardId}`;
  const shortKey = `${gearInstanceId}:${cardId}`;
  const raw = training[fullKey] ?? training[shortKey] ?? training?.[gearInstanceId]?.[cardId];
  const value = typeof raw === 'object' ? raw.copies ?? raw.copyCount : raw;
  return Math.min(3, Math.max(1, Number(value) || 1));
}

export function buildRunDeck({ survivor, equippedGear = [], temporaryCards = [] }) {
  const personalIds = survivor?.personalDeckAdditions || survivor?.deckAdditions || [];
  const negativeIds = survivor?.permanentNegativeCards || [];
  const forgotten = new Set(survivor?.forgottenCardIds || []);
  const deck = [
    ...getStarterDeck(),
    ...getCardsFromIds(personalIds, survivor?.name ? `${survivor.name}'s progress` : 'Survivor progress', undefined, { includeLegacyCompatibility: true }),
    ...getCardsFromIds(negativeIds, survivor?.name ? `${survivor.name}'s permanent burdens` : 'Permanent burdens', 'curse', { includeLegacyCompatibility: true })
  ].filter(card => !forgotten.has(card.id));
  const activeProficiencyType = survivor?.activeProficiencyType || 'fistAndTooth';

  equippedGear.forEach(itemOrId => {
    const resolved = resolveEquippedGear(itemOrId);
    const item = resolved?.item;
    if (item) {
      const includeLegacyCompatibility = Boolean(item.deprecated || item.hiddenFromCrafting || item.legacySource);
      const cardIds = (item.cardPackage || []).flatMap(cardId => {
        const card = resolveCard(cardId, includeLegacyCompatibility);
        const copies = card?.cardCopyEligible === false
          ? 1
          : getTrainedCopyCount(survivor, resolved.gearInstanceId, cardId);
        return Array.from({ length: copies }, () => cardId);
      });
      deck.push(...getCardsFromIds(cardIds, item.name, 'gear', { includeLegacyCompatibility }).map(card => ({
        ...card,
        weaponType: item.weaponType || null,
        gearInstanceId: resolved.gearInstanceId,
        sourceGearId: resolved.equipmentId,
        colorAffinity: item.colorAffinity || card.colorAffinity || '',
        colorAffinityName: item.colorAffinityName || card.colorAffinityName || '',
        keywords: [...new Set([...(card.keywords || []), ...(item.keywords || [])])]
      })));
    }
  });

  const affinityCounts = equippedGear.reduce((counts, itemOrId) => {
    const item = resolveEquippedGear(itemOrId)?.item;
    if (item?.colorAffinity) {
      counts[item.colorAffinity] = (counts[item.colorAffinity] || 0) + 1;
    }
    return counts;
  }, {});
  Object.values(cards)
    .filter(card => card.grantedByAffinity && card.affinityThresholdRequired)
    .forEach(card => {
      if ((affinityCounts[card.grantedByAffinity] || 0) >= Number(card.affinityThresholdRequired)) {
        deck.push(...getCardsFromIds([card.id], `${card.colorAffinityName || card.grantedByAffinity} affinity`, 'affinity'));
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
