export const resources = {
  bone: {
    id: 'bone',
    name: 'Bone',
    type: 'basic',
    description: 'Pale, dense material used for blades, hooks and charms.'
  },
  hide: {
    id: 'hide',
    name: 'Hide',
    type: 'basic',
    description: 'Tough monster skin that can be wrapped into crude protection.'
  },
  sinew: {
    id: 'sinew',
    name: 'Sinew',
    type: 'basic',
    description: 'Elastic strands for binding handles, darts and armor plates.'
  },
  organ: {
    id: 'organ',
    name: 'Organ',
    type: 'monster',
    description: 'Warm viscera with unstable properties when rendered down.'
  },
  claw: {
    id: 'claw',
    name: 'Claw',
    type: 'monster',
    description: 'A sharp natural weapon, still edged enough to draw blood.'
  },
  strangeEye: {
    id: 'strangeEye',
    name: 'Strange Eye',
    type: 'strange',
    description: 'An unblinking eye that catches light from impossible angles.'
  },
  scrap: {
    id: 'scrap',
    name: 'Scrap',
    type: 'basic',
    description: 'Broken metal and stone fragments fit for rough reinforcement.'
  },
  fur: {
    id: 'fur',
    name: 'Fur',
    type: 'basic',
    description: 'Matted monster fur that still holds warmth against the dark.'
  },
  horn: {
    id: 'horn',
    name: 'Horn',
    type: 'rare',
    description: 'Heavy, curved growth strong enough to become a brutal head.'
  },
  ichor: {
    id: 'ichor',
    name: 'Ichor',
    type: 'rare',
    description: 'A shimmering fluid that stains tools and dreams alike.'
  }
};

export const resourceIds = Object.keys(resources);

export const defaultInventory = resourceIds.reduce(
  (inventory, resourceId) => ({ ...inventory, [resourceId]: 0 }),
  {}
);
