export const cards = {
  foundingStone: {
    id: 'foundingStone',
    name: 'Founding Stone',
    type: 'attack',
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', amount: 6 }]
  },
  wildSwing: {
    id: 'wildSwing',
    name: 'Wild Swing',
    type: 'attack',
    cost: 2,
    description: 'Deal 10 damage.',
    effects: [{ type: 'damage', amount: 10 }]
  },
  scramble: {
    id: 'scramble',
    name: 'Scramble',
    type: 'skill',
    cost: 1,
    description: 'Gain 5 block.',
    effects: [{ type: 'block', amount: 5 }]
  },
  desperateDodge: {
    id: 'desperateDodge',
    name: 'Desperate Dodge',
    type: 'skill',
    cost: 1,
    description: 'Gain 4 block. Gain 8 instead while below half HP.',
    effects: [{ type: 'conditionalBlock', amount: 4, lowHpAmount: 8 }]
  },
  encourage: {
    id: 'encourage',
    name: 'Encourage',
    type: 'skill',
    cost: 0,
    description: 'Gain 1 energy. Draw 1 card.',
    effects: [
      { type: 'energy', amount: 1 },
      { type: 'draw', amount: 1 }
    ]
  },
  panic: {
    id: 'panic',
    name: 'Panic',
    type: 'curse',
    cost: 0,
    description: 'Unplayable.',
    unplayable: true,
    effects: []
  },
  hack: {
    id: 'hack',
    name: 'Hack',
    type: 'attack',
    cost: 1,
    description: 'Deal 5 damage.',
    effects: [{ type: 'damage', amount: 5 }]
  },
  brace: {
    id: 'brace',
    name: 'Brace',
    type: 'skill',
    cost: 1,
    description: 'Gain 6 block.',
    effects: [{ type: 'block', amount: 6 }]
  },
  boneFlurry: {
    id: 'boneFlurry',
    name: 'Bone Flurry',
    type: 'attack',
    cost: 2,
    description: 'Deal 3 damage three times.',
    effects: [{ type: 'damage', amount: 3, hits: 3 }]
  },
  slipAway: {
    id: 'slipAway',
    name: 'Slip Away',
    type: 'skill',
    cost: 0,
    description: 'Gain 1 evasion this turn. Exhaust.',
    exhaust: true,
    effects: [{ type: 'evasion', amount: 1 }]
  },
  clawStrike: {
    id: 'clawStrike',
    name: 'Claw Strike',
    type: 'attack',
    cost: 1,
    description: 'Deal 4 damage and apply 1 bleed.',
    effects: [
      { type: 'damage', amount: 4 },
      { type: 'bleed', amount: 1 }
    ]
  },
  strangeGlimpse: {
    id: 'strangeGlimpse',
    name: 'Strange Glimpse',
    type: 'skill',
    cost: 0,
    description: 'Draw 1 card. Exhaust.',
    exhaust: true,
    effects: [{ type: 'draw', amount: 1 }]
  }
};

export const starterDeck = [
  cards.foundingStone,
  cards.wildSwing,
  cards.scramble,
  cards.desperateDodge,
  cards.encourage,
  cards.panic
];
