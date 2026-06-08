export const equipment = {
  boneBlade: {
    id: 'boneBlade',
    name: 'Bone Blade',
    slot: 'weapon',
    description: 'A hooked blade that teaches a survivor to hack through hide.',
    cost: { bone: 1, sinew: 1 },
    effects: [{ type: 'addCard', cardId: 'hack', copies: 2 }]
  },
  hideWraps: {
    id: 'hideWraps',
    name: 'Hide Wraps',
    slot: 'armor',
    description: 'Layered hide absorbs the first blows of every combat.',
    cost: { hide: 2 },
    effects: [{ type: 'startBlock', amount: 5 }]
  },
  clawCharm: {
    id: 'clawCharm',
    name: 'Claw Charm',
    slot: 'trinket',
    description: 'A sharpened charm makes every attack more vicious.',
    cost: { claw: 1, organ: 1 },
    effects: [{ type: 'attackDamageBonus', amount: 1 }]
  },
  rawhideHood: {
    id: 'rawhideHood',
    name: 'Rawhide Hood',
    slot: 'head',
    description: 'Draw 1 additional card at the start of each combat.',
    cost: { hide: 1, fur: 1 },
    effects: [{ type: 'firstTurnDrawBonus', amount: 1 }]
  },
  boneDarts: {
    id: 'boneDarts',
    name: 'Bone Darts',
    slot: 'weapon',
    description: 'Add 2 Claw Strike cards to the survivor deck.',
    cost: { bone: 1, scrap: 1 },
    effects: [{ type: 'addCard', cardId: 'clawStrike', copies: 2 }]
  },
  monsterGrease: {
    id: 'monsterGrease',
    name: 'Monster Grease',
    slot: 'consumable',
    description: 'Add Slip Away for the current and future runs.',
    cost: { organ: 1 },
    effects: [{ type: 'addCard', cardId: 'slipAway', copies: 1 }]
  },
  strangeEyeAmulet: {
    id: 'strangeEyeAmulet',
    name: 'Strange Eye Amulet',
    slot: 'trinket',
    description: 'Add Strange Glimpse to the survivor deck.',
    cost: { strangeEye: 1, sinew: 1 },
    effects: [{ type: 'addCard', cardId: 'strangeGlimpse', copies: 1 }]
  },
  hornMaul: {
    id: 'hornMaul',
    name: 'Horn Maul',
    slot: 'weapon',
    description: 'Add Bone Flurry to the survivor deck.',
    cost: { horn: 1, bone: 1, sinew: 1 },
    effects: [{ type: 'addCard', cardId: 'boneFlurry', copies: 1 }]
  }
};

export const equipmentList = Object.values(equipment);
