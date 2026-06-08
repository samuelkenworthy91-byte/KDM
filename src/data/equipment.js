// Example equipment definitions. Each item defines a cost and deck effects.
export const equipment = {
  boneBlade: {
    id: 'boneBlade',
    name: 'Bone Blade',
    slot: 'weapon',
    cost: { bone: 1, sinew: 1 },
    effects: [
      { type: 'addCard', card: 'Hack', copies: 2 },
      { type: 'modifyCard', tag: 'attack', damageBonus: 1 }
    ]
  },
  hideWraps: {
    id: 'hideWraps',
    name: 'Hide Wraps',
    slot: 'armor',
    cost: { hide: 2 },
    effects: [
      { type: 'startBlock', block: 5 }
    ]
  },
  clawCharm: {
    id: 'clawCharm',
    name: 'Claw Charm',
    slot: 'trinket',
    cost: { claw: 1, organ: 1 },
    effects: [
      { type: 'modifyCard', tag: 'attack', damageBonus: 1 }
    ]
  }
};