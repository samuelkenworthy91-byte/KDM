export const cards = {
  foundingStone: {
    id: 'foundingStone',
    name: 'Founding Stone',
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', amount: 6 }]
  },
  wildSwing: {
    id: 'wildSwing',
    name: 'Wild Swing',
    cost: 2,
    description: 'Deal 10 damage.',
    effects: [{ type: 'damage', amount: 10 }]
  },
  scramble: {
    id: 'scramble',
    name: 'Scramble',
    cost: 1,
    description: 'Gain 5 block.',
    effects: [{ type: 'block', amount: 5 }]
  },
  desperateDodge: {
    id: 'desperateDodge',
    name: 'Desperate Dodge',
    cost: 1,
    description: 'Gain 4 block. Gain 8 instead while below half HP.',
    effects: [{ type: 'conditionalBlock', amount: 4, lowHpAmount: 8 }]
  },
  encourage: {
    id: 'encourage',
    name: 'Encourage',
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
  clawStrike: {
    id: 'clawStrike',
    name: 'Claw Strike',
    type: 'attack',
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', amount: 6 }]
  },
  slipAway: {
    id: 'slipAway',
    name: 'Slip Away',
    type: 'skill',
    cost: 0,
    description: 'Evade the next attack. Exhaust.',
    exhaust: true,
    effects: [{ type: 'evasion', amount: 1 }]
  },
  strangeGlimpse: {
    id: 'strangeGlimpse',
    name: 'Strange Glimpse',
    type: 'skill',
    cost: 0,
    description: 'Draw 2 cards. Exhaust.',
    exhaust: true,
    effects: [{ type: 'draw', amount: 2 }]
  },
  boneFlurry: {
    id: 'boneFlurry',
    name: 'Bone Flurry',
    type: 'attack',
    cost: 2,
    description: 'Deal 3 damage three times.',
    effects: [{ type: 'damage', amount: 3, hits: 3 }]
  },
  veteranStrike: {
    id: 'veteranStrike',
    name: 'Veteran Strike',
    type: 'attack',
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [{ type: 'damage', amount: 6 }]
  },
  focusBreath: {
    id: 'focusBreath',
    name: 'Focus Breath',
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
