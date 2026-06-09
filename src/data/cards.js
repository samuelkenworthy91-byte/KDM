const card = (id, name, type, cost, description, effects = [], extra = {}) => ({
  id,
  name,
  type,
  cost,
  description,
  effects,
  ...extra
});

export const cards = {
  foundingStone: card('foundingStone', 'Founding Stone', 'attack', 1, 'Deal 6 damage. Exhaust.', [{ type: 'damage', amount: 6 }], { exhaust: true }),
  wildSwing: card('wildSwing', 'Wild Swing', 'attack', 1, 'Deal 3 damage.', [{ type: 'damage', amount: 3 }]),
  scramble: card('scramble', 'Scramble', 'skill', 1, 'Gain 4 block.', [{ type: 'block', amount: 4 }]),
  encourage: card('encourage', 'Encourage', 'skill', 0, 'Gain 1 survival.', [{ type: 'survival', amount: 1 }]),
  panic: card('panic', 'Panic', 'curse', 0, 'Unplayable.', [], { unplayable: true }),
  ash: card('ash', 'Ash', 'curse', 0, 'Unplayable. A burned fragment of memory.', [], { unplayable: true }),
  hack: card('hack', 'Hack', 'attack', 1, 'Deal 5 damage.', [{ type: 'damage', amount: 5 }]),
  carve: card('carve', 'Carve', 'attack', 1, 'Deal 3 damage. If this is the second attack played this turn, draw 1 card.', [
    { type: 'damage', amount: 3 },
    { type: 'drawIfAttackCount', amount: 1, minimum: 2 }
  ]),
  splinterStrike: card('splinterStrike', 'Splinter Strike', 'attack', 1, 'Break 3 monster block, then deal 4 damage.', [
    { type: 'breakBlock', amount: 3 },
    { type: 'damage', amount: 4 }
  ]),
  skullCrack: card('skullCrack', 'Skull Crack', 'attack', 1, 'Break 4 monster block, then deal 4 damage.', [
    { type: 'breakBlock', amount: 4 },
    { type: 'damage', amount: 4 }
  ]),
  staggeringBlow: card('staggeringBlow', 'Staggering Blow', 'attack', 2, 'Deal 7 damage. Gain 2 block against the next attack.', [
    { type: 'damage', amount: 7 },
    { type: 'block', amount: 2 }
  ]),
  guardBreak: card('guardBreak', 'Guard Break', 'attack', 1, 'Remove all monster block. Exhaust.', [{ type: 'removeBlock' }], { exhaust: true }),
  boneDart: card('boneDart', 'Bone Dart', 'attack', 0, 'Deal 2 damage. Draw 1 card. Exhaust.', [
    { type: 'damage', amount: 2 },
    { type: 'draw', amount: 1 }
  ], { exhaust: true }),
  pinningShot: card('pinningShot', 'Pinning Shot', 'attack', 1, 'Deal 3 damage. Gain 1 block against the next attack.', [
    { type: 'damage', amount: 3 },
    { type: 'block', amount: 1 }
  ]),
  quickToss: card('quickToss', 'Quick Toss', 'attack', 1, 'Deal 3 damage twice.', [{ type: 'damage', amount: 3, hits: 2 }]),
  brace: card('brace', 'Brace', 'skill', 1, 'Gain 5 block.', [{ type: 'block', amount: 5 }]),
  duckAndRoll: card('duckAndRoll', 'Duck and Roll', 'skill', 0, 'Gain 3 block. Exhaust.', [{ type: 'block', amount: 3 }], { exhaust: true }),
  rawhideDodge: card('rawhideDodge', 'Rawhide Dodge', 'skill', 0, 'Gain 6 block. Exhaust.', [{ type: 'block', amount: 6 }], { exhaust: true }),
  readTheBeast: card('readTheBeast', 'Read the Beast', 'skill', 0, 'Draw 1 card and gain 1 survival. Exhaust.', [
    { type: 'draw', amount: 1 },
    { type: 'survival', amount: 1 }
  ], { exhaust: true }),
  slipAway: card('slipAway', 'Slip Away', 'skill', 0, 'Gain 4 block. Exhaust.', [{ type: 'block', amount: 4 }], { exhaust: true }),
  clawStrike: card('clawStrike', 'Claw Strike', 'attack', 1, 'Deal 4 damage. Mark the monster.', [
    { type: 'damage', amount: 4 },
    { type: 'mark', amount: 1 }
  ]),
  ripOpen: card('ripOpen', 'Rip Open', 'attack', 1, 'Deal 3 damage. Deal 3 more if the monster is marked.', [
    { type: 'damage', amount: 3 },
    { type: 'conditionalDamage', amount: 3, condition: 'monsterMarked' }
  ]),
  savageFollowUp: card('savageFollowUp', 'Savage Follow-Up', 'attack', 1, 'Deal 2 damage twice. If you played another attack this turn, deal +1 each hit.', [
    { type: 'damage', amount: 2, hits: 2, bonusIfPriorAttack: 1 }
  ]),
  strangeGlimpse: card('strangeGlimpse', 'Strange Glimpse', 'skill', 0, 'Draw 1 card. Exhaust.', [{ type: 'draw', amount: 1 }], { exhaust: true }),
  seeThePattern: card('seeThePattern', 'See the Pattern', 'skill', 1, 'Draw 2 cards. Add 1 Panic to discard.', [
    { type: 'draw', amount: 2 },
    { type: 'addCardToDiscard', cardId: 'panic' }
  ]),
  lanternFocus: card('lanternFocus', 'Lantern Focus', 'skill', 1, 'Draw 1 card and gain 3 block.', [
    { type: 'draw', amount: 1 },
    { type: 'block', amount: 3 }
  ]),
  boneFlurry: card('boneFlurry', 'Bone Flurry', 'attack', 2, 'Deal 3 damage three times.', [{ type: 'damage', amount: 3, hits: 3 }]),
  goringSwing: card('goringSwing', 'Goring Swing', 'attack', 2, 'Deal 9 damage. Discard 1 other card.', [
    { type: 'damage', amount: 9 },
    { type: 'discard', amount: 1 }
  ]),
  braceMaul: card('braceMaul', 'Brace Maul', 'skill', 1, 'Gain 7 block. Your next attack this turn deals +2 damage.', [
    { type: 'block', amount: 7 },
    { type: 'nextAttackBonus', amount: 2 }
  ]),
  veteranStrike: card('veteranStrike', 'Veteran Strike', 'attack', 1, 'Deal 6 damage.', [{ type: 'damage', amount: 6 }]),
  focusBreath: card('focusBreath', 'Focus Breath', 'skill', 0, 'Draw 1 card. Exhaust.', [{ type: 'draw', amount: 1 }], { exhaust: true })
};

export const starterDeck = [
  cards.foundingStone,
  cards.wildSwing,
  cards.scramble,
  cards.encourage,
  cards.panic
];
