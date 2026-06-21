import { normaliseArray, normaliseId, normaliseName } from './contentSchemas.js';
import { createSurvivor } from './survivorSchema.js';

export function createSettlement(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};

  return {
    ...raw,
    id: normaliseId(raw.id, 'settlement'),
    name: normaliseName(raw.name, 'Unnamed Settlement'),
    survivors: normaliseArray(raw.survivors).map(createSurvivor),
    resources: normaliseArray(raw.resources),
    innovations: normaliseArray(raw.innovations),
    principles: normaliseArray(raw.principles),
    memory: normaliseArray(raw.memory)
  };
}
