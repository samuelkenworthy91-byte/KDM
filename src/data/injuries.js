export const injuries = {
  crackedRibs: {
    id: 'crackedRibs',
    name: 'Cracked Ribs',
    effect: 'The first block card each combat gives 1 less block.',
    implemented: true
  },
  twistedAnkle: {
    id: 'twistedAnkle',
    name: 'Twisted Ankle',
    effect: 'Rest Stop healing is reduced by 1.',
    implemented: true
  },
  brokenArm: {
    id: 'brokenArm',
    name: 'Broken Arm',
    effect: 'The first attack each combat deals 1 less damage.',
    implemented: true
  },
  deepCut: {
    id: 'deepCut',
    name: 'Deep Cut',
    effect: 'Start each hunt missing 1 HP after healing.',
    implemented: true
  },
  concussion: {
    id: 'concussion',
    name: 'Concussion',
    effect: 'Start each combat with 1 Panic in discard.',
    implemented: true
  },
  shatteredNerve: {
    id: 'shatteredNerve',
    name: 'Shattered Nerve',
    effect: 'If combat starts below half HP, add 1 Panic to the deck.',
    implemented: true
  },
  blindedOneEye: {
    id: 'blindedOneEye',
    name: 'Blinded in One Eye',
    effect: 'Precise and ranged attacks deal 1 less damage until treated.',
    implemented: true
  },
  brokenFingers: {
    id: 'brokenFingers',
    name: 'Broken Fingers',
    effect: 'Dagger, katar, bow, and katana attacks deal 1 less damage until treated.',
    implemented: true
  },
  deadArm: {
    id: 'deadArm',
    name: 'Dead Arm',
    effect: 'Two-handed weapon attacks deal 1 less damage.',
    implemented: true
  },
  bleedingTorso: {
    id: 'bleedingTorso',
    name: 'Bleeding Torso',
    effect: 'Lose 1 HP after completing a hunt node until treated.',
    implemented: true
  },
  crushedChest: {
    id: 'crushedChest',
    name: 'Crushed Chest',
    effect: 'Start combat with 1 less survival.',
    implemented: true
  },
  hamstrung: {
    id: 'hamstrung',
    name: 'Hamstrung',
    effect: 'The first Dodge each combat costs 1 additional survival.',
    implemented: true
  },
  brokenLeg: {
    id: 'brokenLeg',
    name: 'Broken Leg',
    effect: 'Start combat without block and gain no block from the first block card.',
    implemented: true
  }
};

export const injuryList = Object.values(injuries);
