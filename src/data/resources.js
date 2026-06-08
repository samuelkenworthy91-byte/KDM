export const resources = {
  bone: { id: 'bone', name: 'Bone', type: 'basic' },
  hide: { id: 'hide', name: 'Hide', type: 'monster' },
  sinew: { id: 'sinew', name: 'Sinew', type: 'monster' },
  organ: { id: 'organ', name: 'Organ', type: 'monster' },
  claw: { id: 'claw', name: 'Claw', type: 'monster' },
  strangeEye: { id: 'strangeEye', name: 'Strange Eye', type: 'rare' },
  scrap: { id: 'scrap', name: 'Scrap', type: 'basic' },
  fur: { id: 'fur', name: 'Fur', type: 'basic' },
  horn: { id: 'horn', name: 'Horn', type: 'rare' },
  ichor: { id: 'ichor', name: 'Ichor', type: 'rare' },
  monsterTooth: { id: 'monsterTooth', name: 'Monster Tooth', type: 'monster' }
};

export const resourceIds = Object.keys(resources);

export const emptyInventory = resourceIds.reduce(
  (inventory, resourceId) => ({ ...inventory, [resourceId]: 0 }),
  {}
);
