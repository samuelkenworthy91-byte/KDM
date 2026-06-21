import { innovations } from '../../data/innovations.js';
import { normaliseContentItem } from '../schema/contentSchemas.js';
import { createSettlement } from '../schema/settlementSchema.js';

export function getInnovationDeck(settlement) {
  const knownIds = new Set((settlement?.innovations || []).map(item => item?.id || item));
  return Object.values(innovations)
    .filter(Boolean)
    .filter(item => !knownIds.has(item.id))
    .map(item => normaliseContentItem(item, 'innovation'));
}

export function drawInnovation(settlement, random = Math.random) {
  const deck = getInnovationDeck(settlement);
  if (!deck.length) return normaliseContentItem({ id: 'memoryPractice', name: 'Memory Practice', effects: ['Record a settlement lesson.'] }, 'innovation');
  const index = Math.floor((typeof random === 'function' ? random() : 0) * deck.length);
  return deck[Math.max(0, Math.min(deck.length - 1, index))];
}

export function applyInnovation(settlement, innovationInput) {
  const innovation = normaliseContentItem(innovationInput, 'innovation');
  const safeSettlement = createSettlement(settlement);
  const existing = safeSettlement.innovations.filter(item => item?.id !== innovation.id);
  return createSettlement({
    ...safeSettlement,
    innovations: [...existing, innovation],
    memory: [...safeSettlement.memory, `Innovation learned: ${innovation.name}`]
  });
}
