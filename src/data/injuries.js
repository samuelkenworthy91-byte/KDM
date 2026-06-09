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
  }
};

export const injuryList = Object.values(injuries);
