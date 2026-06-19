import { signatureItems } from './signatureItems.js';
import { consumables } from './consumables.js';
import { normalQuarryGear } from './normalQuarryGear.js';
import { starterSupportGear } from './starterSupportGear.js';
import { starterWeapons } from './starterWeapons.js';

export const gearCatalog = [
  ...starterWeapons,
  ...starterSupportGear,
  ...normalQuarryGear,
  ...signatureItems,
  ...consumables
];

export const gearCatalogById = Object.fromEntries(
  gearCatalog.map(item => [item.id, item])
);
