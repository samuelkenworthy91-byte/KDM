import {
  normaliseArray,
  normaliseBoolean,
  normaliseId,
  normaliseName,
  normaliseNumber
} from './contentSchemas.js';

export function createSurvivor(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};
  const maxHp = Math.max(1, normaliseNumber(raw.maxHp, 5));
  const maxSurvival = Math.max(0, normaliseNumber(raw.maxSurvival, 3));

  return {
    ...raw,
    id: normaliseId(raw.id, 'survivor'),
    name: normaliseName(raw.name, 'Nameless Survivor'),
    hp: Math.max(0, Math.min(maxHp, normaliseNumber(raw.hp, maxHp))),
    maxHp,
    survival: Math.max(0, Math.min(maxSurvival, normaliseNumber(raw.survival, 1))),
    maxSurvival,
    alive: normaliseBoolean(raw.alive, true),
    traits: normaliseArray(raw.traits),
    conditions: normaliseArray(raw.conditions),
    gear: normaliseArray(raw.gear),
    deck: normaliseArray(raw.deck)
  };
}
