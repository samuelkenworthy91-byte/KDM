import { createSettlement as createSettlementSchema } from '../schema/settlementSchema.js';
import { createFounders } from '../survivors/survivorLogic.js';

export function createNewSettlement(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};
  const survivors = Array.isArray(raw.survivors) && raw.survivors.length
    ? raw.survivors
    : createFounders(4);

  return createSettlementSchema({
    id: raw.id || 'settlement-1',
    name: raw.name || 'Lantern Refuge',
    survivors,
    resources: raw.resources || [],
    innovations: raw.innovations || [],
    principles: raw.principles || [],
    memory: raw.memory || ['The first lantern was lit.']
  });
}
