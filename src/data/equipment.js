export const equipment = {
  boneBlade: {
    id: 'boneBlade',
    name: 'Bone Blade',
    slot: 'weapon',
    cost: { bone: 1, sinew: 1 },
    description: 'Adds 2 Hack cards to the combat deck.',
    effects: [{ type: 'addCard', cardId: 'hack', copies: 2 }]
  },
  hideWraps: {
    id: 'hideWraps',
    name: 'Hide Wraps',
    slot: 'armor',
    cost: { hide: 2 },
    description: 'Start each combat with 5 block.',
    effects: [{ type: 'startBlock', amount: 5 }]
  },
  clawCharm: {
    id: 'clawCharm',
    name: 'Claw Charm',
    slot: 'trinket',
    cost: { claw: 1, organ: 1 },
    description: 'Attack cards deal +1 damage.',
    effects: [{ type: 'attackDamageBonus', amount: 1 }]
  },
  rawhideHood: {
    id: 'rawhideHood',
    name: 'Rawhide Hood',
    slot: 'head',
    cost: { hide: 1, fur: 1 },
    description: 'Draw 1 additional card on the first turn.',
    effects: [{ type: 'firstTurnDrawBonus', amount: 1 }]
  },
  boneDarts: {
    id: 'boneDarts',
    name: 'Bone Darts',
    slot: 'weapon',
    cost: { bone: 1, scrap: 1 },
    description: 'Adds 2 Claw Strike cards to the combat deck.',
    effects: [{ type: 'addCard', cardId: 'clawStrike', copies: 2 }]
  },
  monsterGrease: {
    id: 'monsterGrease',
    name: 'Monster Grease',
    slot: 'consumable',
    cost: { organ: 1 },
    description: 'Adds 1 exhausting Slip Away card to combat.',
    effects: [{ type: 'addCard', cardId: 'slipAway', copies: 1 }]
  },
  strangeEyeAmulet: {
    id: 'strangeEyeAmulet',
    name: 'Strange Eye Amulet',
    slot: 'trinket',
    cost: { strangeEye: 1, sinew: 1 },
    description: 'Adds 1 Strange Glimpse card to the combat deck.',
    effects: [{ type: 'addCard', cardId: 'strangeGlimpse', copies: 1 }]
  },
  hornMaul: {
    id: 'hornMaul',
    name: 'Horn Maul',
    slot: 'weapon',
    cost: { horn: 1, bone: 1, sinew: 1 },
    description: 'Adds 1 Bone Flurry card to the combat deck.',
    effects: [{ type: 'addCard', cardId: 'boneFlurry', copies: 1 }]
  }
};

export const equipmentList = Object.values(equipment);
