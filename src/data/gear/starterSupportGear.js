export const starterSupportGear = [
  {
    id: 'starter_hide_vest',
    name: 'Basic Hide Vest',
    itemType: 'armor',
    loadoutCategory: 'armor',
    slot: 'armor',
    bodySlot: 'body',
    buildingId: 'skinnery',
    locationId: 'skinnery',
    craftingLocationId: 'skinnery',
    displayLocationId: 'skinnery',
    cost: { hide: 2 },
    cardPackage: ['starter_hide_vest_guard'],
    keywords: ['Starter', 'Armor', 'Block'],
    passiveText: 'Simple hide protection for new survivors.',
    implemented: true
  },
  {
    id: 'starter_survival_wrap',
    name: 'Basic Survival Wrap',
    itemType: 'survivalGear',
    loadoutCategory: 'tool',
    slot: 'tool',
    buildingId: 'skinnery',
    locationId: 'skinnery',
    craftingLocationId: 'skinnery',
    displayLocationId: 'skinnery',
    cost: { hide: 1, sinew: 1 },
    cardPackage: ['starter_survival_wrap_scramble'],
    keywords: ['Starter', 'Survival'],
    passiveText: 'A simple wrap for carrying survival supplies.',
    implemented: true
  }
];
