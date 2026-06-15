import { canSpendMemories } from './memoryEconomy.js';

export const EARLY_FORGETTING_ACTION_ID = 'guidedReflection';
export const EARLY_FORGETTING_COST = 1;

const FORGETTING_INNOVATION_IDS = new Set([
  EARLY_FORGETTING_ACTION_ID,
  'riteOfForgetting'
]);

const getIds = (settlement, field) => (
  Array.isArray(settlement?.[field]) ? settlement[field] : []
);

export function hasEarlyForgettingAccess(settlement) {
  return getIds(settlement, 'builtInnovations').includes('lanternHearth')
    || getIds(settlement, 'builtMemoryInnovations')
      .some(id => FORGETTING_INNOVATION_IDS.has(id));
}

function isMonsterBane(cardId, card) {
  return String(cardId || '').startsWith('monsterBane_')
    || card?.tags?.includes('monsterBane');
}

export function getCardForgetEligibility({
  settlement,
  survivor,
  cardId,
  card,
  addition,
  gearGranted = false
}) {
  if (!cardId || !card) {
    return { eligible: false, reason: 'Unknown / Legacy card' };
  }
  if (!hasEarlyForgettingAccess(settlement)) {
    return { eligible: false, reason: 'Requires Guided Reflection at the Lantern Hearth' };
  }
  if (survivor?.forgottenCardIds?.includes(cardId)) {
    return { eligible: false, reason: 'Already forgotten' };
  }
  if (survivor?.lastForgetLanternYear === settlement?.lanternYear) {
    return { eligible: false, reason: 'Already used this Lantern Year' };
  }
  if (gearGranted || card.sourceType === 'gear' || card.sourceGearId) {
    return { eligible: false, reason: 'Gear card: unequip item to remove' };
  }
  if (isMonsterBane(cardId, card)) {
    return { eligible: false, reason: 'Locked: Monster Bane' };
  }
  if (card.locked || card.unforgettable || addition?.locked) {
    return { eligible: false, reason: 'Permanent card' };
  }
  if (card.sourceType === 'fightingArt' || addition?.sourceType === 'fightingArt') {
    return { eligible: false, reason: 'Permanent card' };
  }
  if (cardId === 'panic' || card.type === 'curse') {
    return { eligible: false, reason: 'Permanent burden: use Quiet Night or Taboo' };
  }
  if (!canSpendMemories(settlement, EARLY_FORGETTING_COST)) {
    return { eligible: false, reason: 'Not enough Memory' };
  }
  return { eligible: true, reason: '' };
}

export function forgetSurvivorCard(survivor, cardId, method, lanternYear, card) {
  const cardName = card?.name || cardId || 'Unknown / Legacy';
  const wasStarterCard = card?.sourceType === 'starter';
  const wasNegative = cardId === 'panic'
    || card?.type === 'curse'
    || (survivor.permanentNegativeCards || []).some(addition => (
      (typeof addition === 'string' ? addition : addition?.cardId) === cardId
    ));

  return {
    ...survivor,
    forgottenCardIds: [...new Set([...(survivor.forgottenCardIds || []), cardId])],
    lastForgetLanternYear: lanternYear,
    forgottenCardsLog: [
      ...(survivor.forgottenCardsLog || []),
      { cardId, cardName, lanternYear, method, wasStarterCard, wasNegative }
    ]
  };
}
