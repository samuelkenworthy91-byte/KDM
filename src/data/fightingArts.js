// Fighting arts definitions. Each art may become a card or passive trait.
export const fightingArts = {
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    type: 'active',
    description: 'Deal 4 damage. If you have no block, deal 4 more.',
    energy: 1
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
    description: 'Once per fight, ignore the next hit and gain 5 block.'
  },
  monsterClawStyle: {
    id: 'monsterClawStyle',
    name: 'Monster Claw Style',
    type: 'passive',
    description: 'Your attacks apply 1 bleed.'
  }
};