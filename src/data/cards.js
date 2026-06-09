function card(id, name, cost, description, effects, options = {}) {
  return {
    id,
    name,
    cost,
    description,
    effects,
    type: options.type || 'skill',
    tags: options.tags || [],
    sourceType: options.sourceType || 'personal',
    exhaust: options.exhaust
  };
}

export const cards = {
  foundingStone: card('foundingStone', 'Founding Stone', 1, 'Deal 6 damage. Exhaust.', [{ type: 'damage', amount: 6 }], { type: 'attack', exhaust: true }),
  wildSwing: card('wildSwing', 'Wild Swing', 2, 'Deal 10 damage.', [{ type: 'damage', amount: 10 }], { type: 'attack' }),
  scramble: card('scramble', 'Scramble', 1, 'Gain 5 block.', [{ type: 'block', amount: 5 }]),
  desperateDodge: card('desperateDodge', 'Desperate Dodge', 1, 'Gain 4 block. Gain 8 instead while below half HP.', [{ type: 'conditionalBlock', amount: 4, lowHpAmount: 8 }]),
  encourage: card('encourage', 'Encourage', 0, 'Gain 1 survival. Draw 1 card.', [{ type: 'survival', amount: 1 }, { type: 'draw', amount: 1 }]),
  panic: {
    id: 'panic',
    name: 'Panic',
    cost: 0,
    description: 'Unplayable.',
    type: 'curse',
    tags: ['curse', 'panic'],
    sourceType: 'curse',
    unplayable: true,
    effects: []
  },

  hack: card('hack', 'Hack', 1, 'Deal 5 damage.', [{ type: 'damage', amount: 5 }], { type: 'attack' }),
  carve: card('carve', 'Carve', 1, 'Deal 3 damage. Draw 1 card.', [{ type: 'damage', amount: 3 }, { type: 'draw', amount: 1 }], { type: 'attack' }),
  skullCrack: card('skullCrack', 'Skull Crack', 1, 'Remove 4 monster block, then deal 4 damage.', [{ type: 'removeMonsterBlock', amount: 4 }, { type: 'damage', amount: 4 }], { type: 'attack' }),
  guardBreak: card('guardBreak', 'Guard Break', 1, 'Remove all monster block. Exhaust.', [{ type: 'removeAllMonsterBlock' }], { exhaust: true }),
  boneDart: card('boneDart', 'Bone Dart', 0, 'Deal 2 damage. Draw 1. Exhaust.', [{ type: 'damage', amount: 2 }, { type: 'draw', amount: 1 }], { type: 'attack', exhaust: true }),
  quickToss: card('quickToss', 'Quick Toss', 1, 'Deal 3 damage twice.', [{ type: 'damage', amount: 3 }, { type: 'damage', amount: 3 }], { type: 'attack' }),
  brace: card('brace', 'Brace', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }]),
  duckAndRoll: card('duckAndRoll', 'Duck and Roll', 0, 'Gain 3 block. Exhaust.', [{ type: 'block', amount: 3 }], { exhaust: true }),
  rawhideDodge: card('rawhideDodge', 'Rawhide Dodge', 0, 'Gain 6 block. Exhaust.', [{ type: 'block', amount: 6 }], { exhaust: true }),
  readTheBeast: card('readTheBeast', 'Read the Beast', 0, 'Gain 1 survival. Draw 1 card. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'draw', amount: 1 }], { exhaust: true }),
  slipAway: card('slipAway', 'Slip Away', 0, 'Gain 4 block. Draw 1.', [{ type: 'block', amount: 4 }, { type: 'draw', amount: 1 }]),
  clawStrike: card('clawStrike', 'Claw Strike', 1, 'Deal 4 damage. Your next attack deals +1.', [{ type: 'damage', amount: 4 }, { type: 'nextAttackBonus', amount: 1 }], { type: 'attack' }),
  ripOpen: card('ripOpen', 'Rip Open', 1, 'Deal 6 damage.', [{ type: 'damage', amount: 6 }], { type: 'attack' }),
  bloodRush: card('bloodRush', 'Blood Rush', 0, 'Gain 1 energy. Draw 1.', [{ type: 'energy', amount: 1 }, { type: 'draw', amount: 1 }]),
  strangeGlimpse: card('strangeGlimpse', 'Strange Glimpse', 0, 'Draw 1. Exhaust.', [{ type: 'draw', amount: 1 }], { exhaust: true }),
  seeThePattern: card('seeThePattern', 'See the Pattern', 0, 'Draw 2. Add 1 Panic to discard. Exhaust.', [{ type: 'draw', amount: 2 }, { type: 'addPanic', amount: 1 }], { exhaust: true }),
  boneFlurry: card('boneFlurry', 'Bone Flurry', 2, 'Deal 3 damage three times.', [{ type: 'damage', amount: 3 }, { type: 'damage', amount: 3 }, { type: 'damage', amount: 3 }], { type: 'attack' }),
  goringSwing: card('goringSwing', 'Goring Swing', 2, 'Deal 9 damage. Discard 1 other card if possible.', [{ type: 'damage', amount: 9 }, { type: 'discard', amount: 1 }], { type: 'attack' }),
  braceMaul: card('braceMaul', 'Brace Maul', 1, 'Gain 7 block. Draw 1 card.', [{ type: 'block', amount: 7 }, { type: 'draw', amount: 1 }]),
  savageFollowUp: card('savageFollowUp', 'Savage Follow-Up', 1, 'Deal 5 damage. Your next attack deals +1.', [{ type: 'damage', amount: 5 }, { type: 'nextAttackBonus', amount: 1 }], { type: 'attack' }),
  hornShot: card('hornShot', 'Horn Shot', 1, 'Deal 5 damage. Draw 1.', [{ type: 'damage', amount: 5 }, { type: 'draw', amount: 1 }], { type: 'attack' }),
  trample: card('trample', 'Trample', 2, 'Remove 3 block and deal 7 damage.', [{ type: 'removeMonsterBlock', amount: 3 }, { type: 'damage', amount: 7 }], { type: 'attack' }),
  settle: card('settle', 'Settle', 0, 'Remove one Panic from discard. Draw 1.', [{ type: 'removePanic', amount: 1 }, { type: 'draw', amount: 1 }]),
  ashCycle: card('ashCycle', 'Ash Cycle', 0, 'Draw 2, then discard 1.', [{ type: 'draw', amount: 2 }, { type: 'discard', amount: 1 }]),
  delayedCut: card('delayedCut', 'Delayed Cut', 1, 'Deal 5 damage. Gain 1 energy.', [{ type: 'damage', amount: 5 }, { type: 'energy', amount: 1 }], { type: 'attack' }),
  memoryFilter: card('memoryFilter', 'Memory Filter', 0, 'Draw 2. Exhaust.', [{ type: 'draw', amount: 2 }], { exhaust: true }),
  measuredStrike: card(
    'measuredStrike',
    'Measured Strike',
    1,
    'Deal 4 damage.',
    [{ type: 'damage', amount: 4 }],
    { type: 'attack', tags: ['training'], sourceType: 'training' }
  ),
  steadyGuard: card(
    'steadyGuard',
    'Steady Guard',
    1,
    'Gain 5 block.',
    [{ type: 'block', amount: 5 }],
    { tags: ['training'], sourceType: 'training' }
  ),
  deepBreath: card(
    'deepBreath',
    'Deep Breath',
    0,
    'Gain 1 survival. Exhaust.',
    [{ type: 'survival', amount: 1 }],
    { tags: ['training'], sourceType: 'training', exhaust: true }
  ),
  veteranStrike: card(
    'veteranStrike',
    'Veteran Strike',
    1,
    'Deal 5 damage.',
    [{ type: 'damage', amount: 5 }],
    { type: 'attack', tags: ['personal'], sourceType: 'personal' }
  ),
  hardWonGuard: card(
    'hardWonGuard',
    'Hard-Won Guard',
    1,
    'Gain 6 block.',
    [{ type: 'block', amount: 6 }],
    { tags: ['personal'], sourceType: 'personal' }
  )
};

export const starterCardIds = [
  'foundingStone',
  'wildSwing',
  'wildSwing',
  'scramble',
  'scramble',
  'desperateDodge',
  'encourage'
];

starterCardIds.forEach(cardId => {
  cards[cardId] = {
    ...cards[cardId],
    tags: [...new Set([...(cards[cardId].tags || []), 'starter'])],
    sourceType: 'starter'
  };
});

export const starterDeck = starterCardIds.map(cardId => cards[cardId]);
export const trainingCardIds = ['measuredStrike', 'steadyGuard', 'deepBreath'];
