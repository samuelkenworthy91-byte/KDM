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
  shame: {
    id: 'shame',
    name: 'Shame',
    cost: 0,
    description: 'Unplayable. A memory of what you chose.',
    unplayable: true,
    effects: []
  },
  curse: {
    id: 'curse',
    name: 'Curse',
    cost: 0,
    description: 'Unplayable. Something followed you home.',
    unplayable: true,
    effects: []
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
