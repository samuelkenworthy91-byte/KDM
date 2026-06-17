import { cards } from '../data/cards.js';
import { equipmentList } from '../data/equipment.js';

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortObject(entry)])
  );
}

export function getMechanicalSignature(card) {
  const effects = (card?.effects || []).map(effect => sortObject(effect));
  const mechanicFlags = Array.isArray(card?.mechanicFlags)
    ? card.mechanicFlags
    : card?.mechanicFlags
      ? [card.mechanicFlags]
      : [];
  return JSON.stringify({
    type: card?.type || '',
    cost: card?.cost ?? 0,
    effects,
    exhaust: Boolean(card?.exhaust),
    cardCopyEligible: card?.cardCopyEligible !== false,
    mechanicFlags: [...mechanicFlags].sort()
  });
}

export function auditEquipmentCardSignatures({ minimumGroupSize = 2 } = {}) {
  const rows = equipmentList.flatMap(item =>
    (item.cardPackage || []).flatMap(cardId => {
      const card = cards[cardId];
      if (!card) return [];
      return [{
        signature: getMechanicalSignature(card),
        equipmentId: item.id,
        equipmentName: item.name,
        cardId,
        cardName: card.name,
        currentEffects: card.effects || []
      }];
    })
  );
  const groups = Object.values(rows.reduce((acc, row) => {
    acc[row.signature] = acc[row.signature] || [];
    acc[row.signature].push(row);
    return acc;
  }, {}))
    .filter(group => group.length >= minimumGroupSize)
    .sort((left, right) => right.length - left.length);

  return groups.map(group => ({
    signature: group[0].signature,
    count: group.length,
    equipmentNames: [...new Set(group.map(row => row.equipmentName))],
    cardNames: group.map(row => row.cardName),
    currentEffects: group.map(row => ({
      cardId: row.cardId,
      equipmentName: row.equipmentName,
      cardName: row.cardName,
      effects: row.currentEffects
    }))
  }));
}

export function findAuditGroupsForCardIds(cardIds = [], options = {}) {
  const wanted = new Set(cardIds);
  return auditEquipmentCardSignatures(options)
    .filter(group => group.currentEffects.some(entry =>
      wanted.has(entry.cardId)
    ));
}
