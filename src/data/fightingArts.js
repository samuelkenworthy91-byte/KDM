// Fighting arts definitions. Each art may become a card or passive trait.
export const fightingArts = {
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    type: 'passive',
    description: 'Attack cards deal +1 damage while you have 0 block.'
  },
  clutchFighter: {
    id: 'clutchFighter',
    name: 'Clutch Fighter',
    type: 'passive',
    description: 'Gain +2 strength when below half HP.'
  },
  tumble: {
    id: 'tumble',
    name: 'Tumble',
    type: 'passive',
    description: 'Start each combat with +3 block.'
  },
  clawStyle: {
    id: 'clawStyle',
    name: 'Claw Style',
    type: 'passive',
    description: 'Your attacks apply 1 bleed.'
  }
};
