import { createSurvivor } from '../schema/survivorSchema.js';

const FOUNDER_NAMES = ['Ari', 'Sable', 'Venn', 'Mara'];

export function createFounder(index = 0, input = {}) {
  return createSurvivor({
    id: `founder-${index + 1}`,
    name: FOUNDER_NAMES[index] || `Founder ${index + 1}`,
    hp: 5,
    maxHp: 5,
    survival: 1,
    maxSurvival: 3,
    alive: true,
    traits: ['founder'],
    conditions: [],
    gear: [],
    deck: ['foundingStone', 'measuredStrike', 'steadyGuard', 'encourage'],
    ...input
  });
}

export function createFounders(count = 4) {
  const safeCount = Math.max(1, Number.isFinite(Number(count)) ? Number(count) : 4);
  return Array.from({ length: safeCount }, (_, index) => createFounder(index));
}
