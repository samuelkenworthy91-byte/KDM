// Resource metadata drives event rewards, resource-node offers, and crafting labels.
export const resources = {
  scrap: {
    id: 'scrap',
    name: 'Scrap',
    type: 'basic',
    rarity: 'common',
    description: 'Weathered material suitable for crude tools.'
  },
  bone: {
    id: 'bone',
    name: 'Bone',
    type: 'basic',
    rarity: 'common',
    description: 'Dense remains used in weapons and armor.'
  },
  hide: {
    id: 'hide',
    name: 'Hide',
    type: 'monster',
    rarity: 'common',
    description: 'Tough skin stripped from a hunted beast.'
  },
  sinew: {
    id: 'sinew',
    name: 'Sinew',
    type: 'monster',
    rarity: 'common',
    description: 'Strong fibers used to bind and reinforce gear.'
  },
  organ: {
    id: 'organ',
    name: 'Organ',
    type: 'monster',
    rarity: 'uncommon',
    description: 'A preserved organ with uncertain properties.'
  },
  claw: {
    id: 'claw',
    name: 'Claw',
    type: 'monster',
    rarity: 'uncommon',
    description: 'A sharp trophy fit for a blade or charm.'
  },
  monsterTooth: {
    id: 'monsterTooth',
    name: 'Monster Tooth',
    type: 'monster',
    rarity: 'uncommon',
    description: 'A jagged tooth that can be used in brutal crafting.'
  },
  fur: {
    id: 'fur',
    name: 'Fur',
    type: 'basic',
    rarity: 'common',
    description: 'Matted monster fur that still holds warmth.'
  },
  horn: {
    id: 'horn',
    name: 'Horn',
    type: 'rare',
    rarity: 'rare',
    description: 'A heavy horn fit for a brutal weapon head.'
  },
  strangeEye: {
    id: 'strangeEye',
    name: 'Strange Eye',
    type: 'rare',
    rarity: 'rare',
    description: 'An unblinking eye that sees beyond lanternlight.'
  },
  ichor: {
    id: 'ichor',
    name: 'Ichor',
    type: 'rare',
    rarity: 'rare',
    description: 'Black fluid that moves against gravity.'
  }
};

export const resourceIds = Object.keys(resources);

export const emptyInventory = resourceIds.reduce(
  (inventory, resourceId) => ({ ...inventory, [resourceId]: 0 }),
  {}
);
