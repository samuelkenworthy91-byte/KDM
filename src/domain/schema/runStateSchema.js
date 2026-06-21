import { normaliseArray, normaliseId, normaliseName, normaliseNumber } from './contentSchemas.js';
import { createSettlement } from './settlementSchema.js';

export function createRunState(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};

  return {
    ...raw,
    id: normaliseId(raw.id, 'run'),
    name: normaliseName(raw.name, 'Clean Core Run'),
    settlement: createSettlement(raw.settlement),
    phase: normaliseName(raw.phase, 'settlement'),
    log: normaliseArray(raw.log),
    flags: raw.flags && typeof raw.flags === 'object' ? raw.flags : {},
    turn: Math.max(0, normaliseNumber(raw.turn, 0))
  };
}
