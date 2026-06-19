import { signatureCards } from './signatureCards.js';
import { consumableCards } from './consumableCards.js';
import { normalQuarryCards } from './normalQuarryGear.js';
import { starterSupportCards } from './starterSupportCards.js';
import { starterWeaponCards } from './starterWeaponCards.js';

export const gearCards = {
  ...starterWeaponCards,
  ...starterSupportCards,
  ...normalQuarryCards,
  ...signatureCards,
  ...consumableCards
};

export const gearCardPackages = Object.fromEntries(
  Object.values(gearCards).reduce((packages, card) => {
    if (!card.sourceGearId) return packages;
    const next = packages.get(card.sourceGearId) || [];
    next.push(card.id);
    packages.set(card.sourceGearId, next);
    return packages;
  }, new Map())
);
