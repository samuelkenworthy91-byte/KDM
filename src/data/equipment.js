export const equipment = {
  boneBlade: {
    id: 'boneBlade',
    name: 'Bone Blade',
    slot: 'weapon',
    cost: { bone: 1, sinew: 1 },
    description: 'A hooked blade lashed together from bone and sinew. Adds 2 Hack cards to your deck.',
    effects: [
      { type: 'addCard', cardId: 'hack', copies: 2 }
    ],
    tags: ['bone', 'deck']
  },
  hideWraps: {
    id: 'hideWraps',
    name: 'Hide Wraps',
    slot: 'body',
    cost: { hide: 2 },
    description: 'Layered hide bindings. Start each combat with 5 block.',
    effects: [
      { type: 'startBlock', block: 5 }
    ],
    tags: ['hide', 'passive']
  },
  clawCharm: {
    id: 'clawCharm',
    name: 'Claw Charm',
    slot: 'trinket',
    cost: { claw: 1, organ: 1 },
    description: 'A claw strung beside a dried organ. All attack cards deal +1 damage.',
    effects: [
      { type: 'attackDamageBonus', amount: 1 }
    ],
    tags: ['monster', 'passive']
  },
  rawhideHood: {
    id: 'rawhideHood',
    name: 'Rawhide Hood',
    slot: 'head',
    cost: { hide: 1, fur: 1 },
    description: 'A low hood that sharpens first instincts. Draw 1 extra card on turn 1.',
    effects: [
      { type: 'firstTurnDrawBonus', amount: 1 }
    ],
    tags: ['hide', 'passive']
  },
  boneDarts: {
    id: 'boneDarts',
    name: 'Bone Darts',
    slot: 'weapon',
    cost: { bone: 1, scrap: 1 },
    description: 'Small barbed darts carried at the belt. Adds 2 Claw Strike cards to your deck.',
    effects: [
      { type: 'addCard', cardId: 'clawStrike', copies: 2 }
    ],
    tags: ['bone', 'deck']
  },
  monsterGrease: {
    id: 'monsterGrease',
    name: 'Monster Grease',
    slot: 'consumable',
    cost: { organ: 1 },
    description: 'Rendered organ fat smeared over skin. Adds 1 Slip Away card to the next combat only.',
    effects: [
      { type: 'addNextCombatCard', cardId: 'slipAway', copies: 1 }
    ],
    tags: ['consumable', 'temporary']
  },
  strangeEyeAmulet: {
    id: 'strangeEyeAmulet',
    name: 'Strange Eye Amulet',
    slot: 'trinket',
    cost: { strangeEye: 1, sinew: 1 },
    description: 'A staring charm that sees openings. Adds 1 Strange Glimpse card to your deck.',
    effects: [
      { type: 'addCard', cardId: 'strangeGlimpse', copies: 1 }
    ],
    tags: ['strange', 'deck']
  },
  hornMaul: {
    id: 'hornMaul',
    name: 'Horn Maul',
    slot: 'weapon',
    cost: { horn: 1, bone: 1, sinew: 1 },
    description: 'A horn-weighted club with shattering force. Adds 1 Bone Flurry card to your deck.',
    effects: [
      { type: 'addCard', cardId: 'boneFlurry', copies: 1 }
    ],
    tags: ['rare', 'deck']
  }
};

export const equipmentList = Object.values(equipment);
