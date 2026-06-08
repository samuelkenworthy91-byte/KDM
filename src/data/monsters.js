// Example monster definitions. Each monster has stats, intents and a loot table.
export const monsters = {
  whiteLion: {
    id: 'whiteLion',
    name: 'White Lion',
    hp: 30,
    maxHp: 30,
    block: 0,
    intents: [
      { type: 'attack', name: 'Claw', damage: 5 },
      { type: 'block', name: 'Stalk', block: 5 },
      { type: 'attack', name: 'Maul', damage: 9 }
    ],
    loot: ['hide', 'bone', 'sinew', 'claw']
  },
  screamingAntelope: {
    id: 'screamingAntelope',
    name: 'Screaming Antelope',
    hp: 35,
    intents: [
      { type: 'attack', damage: 4 },
      { type: 'heal', amount: 3 },
      { type: 'curse', card: 'Panic' }
    ],
    loot: ['hide', 'organ', 'sinew']
  }
};
