export const scars = {
  lionScar: {
    id: 'lionScar',
    name: 'Lion Scar',
    effect: 'Against Pale Hunt Lion, start combat with +1 survival.',
    source: 'Pale Hunt Lion',
    implemented: true
  },
  hornBruise: {
    id: 'hornBruise',
    name: 'Horn Bruise',
    effect: 'Against Wailing Antelope, start combat with +2 block.',
    source: 'Wailing Antelope',
    implemented: true
  },
  ashMarked: {
    id: 'ashMarked',
    name: 'Ash-Marked',
    effect: 'Start combat with +1 survival against Ash Phoenix.',
    source: 'Ash Phoenix',
    implemented: true
  },
  boneSetWrong: {
    id: 'boneSetWrong',
    name: 'Bone Set Wrong',
    effect: '+1 max HP, but the first attack each combat deals 1 less damage.',
    implemented: true
  },
  deadEyeCalm: {
    id: 'deadEyeCalm',
    name: 'Dead-Eye Calm',
    effect: 'Start combat with +1 survival.',
    implemented: true
  }
};

export const scarList = Object.values(scars);
