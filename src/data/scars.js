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
  },
  crackedBrowScar: {
    id: 'crackedBrowScar',
    name: 'Cracked Brow Scar',
    effect: 'A precise attack can turn this old injury into focus.',
    implemented: true
  },
  offHandScar: {
    id: 'offHandScar',
    name: 'Off-Hand Scar',
    effect: 'The first one-handed attack each combat may draw 1.',
    implemented: true
  },
  stubbornStepScar: {
    id: 'stubbornStepScar',
    name: 'Stubborn Step',
    effect: 'The first Dodge each combat gains additional block.',
    implemented: true
  },
  thunderScar: {
    id: 'thunderScar',
    name: 'Thunder Scar',
    effect: 'Start combat with +1 survival.',
    implemented: true
  },
  fearListenerScar: {
    id: 'fearListenerScar',
    name: 'Fear Listener',
    effect: 'The first Panic each combat can become survival.',
    implemented: true
  },
  webBurnScar: {
    id: 'webBurnScar',
    name: 'Web-Burn Scar',
    effect: 'A reminder that binding can be broken.',
    implemented: true
  },
  radiantBlindness: {
    id: 'radiantBlindness',
    name: 'Radiant Blindness',
    effect: 'Strange attacks gain power, but precise attacks are impaired.',
    implemented: true
  }
};

export const scarList = Object.values(scars);
