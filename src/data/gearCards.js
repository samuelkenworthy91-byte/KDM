import {
  gearCards as curatedGearCards,
  gearCardPackages as curatedGearCardPackages
} from './gear/gearCards.js';

export const gearCards = curatedGearCards;
export const gearCardPackages = curatedGearCardPackages;

export const legacyCompatibilityGearCards = {};
export const legacyCompatibilityGearCardPackages = {};

export function createLegacyCompatibilityCard(cardId) {
  return {
    id: cardId,
    name: 'Unknown Legacy Card',
    cost: 0,
    description: 'This card is from an older save and is no longer available.',
    effects: [],
    type: 'skill',
    tags: ['legacyCompatibility'],
    sourceType: 'legacyCompatibility',
    legacyCompatibility: true,
    implemented: false
  };
}
