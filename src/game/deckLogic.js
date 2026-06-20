import { cards, starterCardIds } from '../data/cards.js';
import { equipment, getEquipment } from '../data/equipment.js';
import { fightingArtCards } from '../data/fightingArtCards.js';
import { weaponMasteryCardIds } from '../data/weaponProficiency.js';
import { calculateAffinityTotals, getItemAffinities } from './affinityLogic.js';

const obsoletePassiveCardIds = new Set([
  ...Object.keys(fightingArtCards),
  ...Object.values(weaponMasteryCardIds)
]);
const obsoletePassiveSourceTypes = new Set(['fightingArt', 'proficiency', 'weaponMastery']);

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

export function getCardsFromIds(cardIds = [], source, sourceType, options = {}) {
  const warnOnMissing = options.warnOnMissing !== false;
  return cardIds.flatMap(addition => {
    const normalized = normalizePersonalCardAddition(addition, sourceType);
    const cardId = normalized?.cardId;
    const card = cards[cardId];
    if (!card) {
      if (warnOnMissing) {
        console.warn(`Skipping missing card id "${cardId}"${source ? ` from ${source}` : ''}.`);
      }
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

function shouldExcludeForgotten(cardId, forgotten, { allowPanic = false } = {}) {
  if (allowPanic && cardId === 'panic') return false;
  return forgotten.has(cardId);
}

function filterForgottenAdditions(additions = [], forgotten, options = {}) {
  return additions.filter(addition => {
    const cardId = getPersonalCardId(addition);
    return !shouldExcludeForgotten(cardId, forgotten, options);
  });
}

export function isObsoletePassiveCardAddition(addition) {
  const normalized = normalizePersonalCardAddition(addition);
  const cardId = normalized?.cardId;
  if (!cardId) return false;
  return obsoletePassiveCardIds.has(cardId) ||
    obsoletePassiveSourceTypes.has(normalized.sourceType) ||
    obsoletePassiveSourceTypes.has(cards[cardId]?.sourceType);
}

export function migratePassiveCardAdditions(additions = []) {
  return (Array.isArray(additions) ? additions : [])
    .filter(addition => !isObsoletePassiveCardAddition(addition));
}

export function buildRunDeck({ survivor, equippedGear = [], temporaryCards = [] }) {
  const personalIds = migratePassiveCardAdditions(
    survivor?.personalDeckAdditions || survivor?.deckAdditions || []
  );
  const negativeIds = survivor?.permanentNegativeCards || [];
  const forgotten = new Set(survivor?.forgottenCardIds || []);
  const deck = [
    ...getStarterDeck(),
    ...getCardsFromIds(
      filterForgottenAdditions(personalIds, forgotten),
      survivor?.name ? `${survivor.name}'s progress` : 'Survivor progress',
      undefined,
      { warnOnMissing: false }
    ),
    ...getCardsFromIds(
      filterForgottenAdditions(negativeIds, forgotten, { allowPanic: true }),
      survivor?.name ? `${survivor.name}'s permanent burdens` : 'Permanent burdens',
      'curse',
      { warnOnMissing: false }
    )
  ].filter(card => !shouldExcludeForgotten(card.id, forgotten, { allowPanic: card.id === 'panic' }));
  const activeProficiencyType = survivor?.activeProficiencyType || 'fistAndTooth';

  equippedGear.forEach(itemOrId => {
    const resolved = resolveEquippedGear(itemOrId);
    const item = resolved?.item;
    if (item) {
      const cardIds = (item.cardPackage || [])
        .filter(cardId => !shouldExcludeForgotten(cardId, forgotten))
        .flatMap(cardId => {
        const card = cards[cardId];
        if (!card) return [];
        const copies = card?.cardCopyEligible === false
          ? 1
          : getTrainedCopyCount(survivor, resolved.gearInstanceId, cardId);
        return Array.from({ length: copies }, () => cardId);
      });
      deck.push(...getCardsFromIds(cardIds, item.name, 'gear', { warnOnMissing: false }).map(card => ({
        ...card,
        weaponType: item.weaponType || null,
        gearInstanceId: resolved.gearInstanceId,
        sourceGearId: resolved.equipmentId,
        affinities: getItemAffinities(item),
        colorAffinity: item.colorAffinity || card.colorAffinity || '',
        colorAffinityName: item.colorAffinityName || card.colorAffinityName || '',
        keywords: [...new Set([...(card.keywords || []), ...(item.keywords || [])])]
      })));
    }
  });

  const affinityCounts = calculateAffinityTotals(equippedGear);
  Object.values(cards)
    .filter(card => card.grantedByAffinity && card.affinityThresholdRequired)
    .forEach(card => {
      if (
        !shouldExcludeForgotten(card.id, forgotten) &&
        (affinityCounts[card.grantedByAffinity] || 0) >= Number(card.affinityThresholdRequired)
      ) {
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

/**
 * Removes one or more Panic cards from all survivor card locations.
 */
export function removePanicFromSurvivor(survivor, amount = 1) {
  let remaining = amount;
  const filterPanic = (list) => {
    if (!list || remaining <= 0) return list;
    return list.filter(item => {
      const cardId = typeof item === 'string' ? item : item?.cardId || item?.id;
      if (cardId === 'panic' && remaining > 0) {
        remaining -= 1;
        return false;
      }
      return true;
    });
  };

  const next = {
    ...survivor,
    personalDeckAdditions: filterPanic(survivor.personalDeckAdditions),
    permanentNegativeCards: filterPanic(survivor.permanentNegativeCards),
    // If in combat, these may be present
    hand: filterPanic(survivor.hand),
    drawPile: filterPanic(survivor.drawPile),
    discardPile: filterPanic(survivor.discardPile),
    exhaustPile: filterPanic(survivor.exhaustPile)
  };

  return next;
}
