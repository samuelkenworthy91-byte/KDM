export const innovations = {
  boneSmith: {
    id: 'boneSmith',
    name: 'Bone Smith',
    category: 'workshop',
    cost: { bone: 2, sinew: 1 },
    description: 'A crude workshop for shaping bone into weapons.',
    effects: ['Unlocks bone weapon recipes.'],
    unlocksRecipes: ['boneBlade', 'boneHammer', 'boneDarts', 'hornMaul'],
    requires: []
  },
  skinnery: {
    id: 'skinnery',
    name: 'Skinnery',
    category: 'workshop',
    cost: { hide: 2, bone: 1 },
    description: 'A place to scrape, tan and bind monster hides.',
    effects: ['Unlocks hide armour and rawhide survival gear.'],
    unlocksRecipes: ['hideWraps', 'rawhideHood', 'rawhideVest', 'rawhideBoots'],
    requires: []
  },
  organGrinder: {
    id: 'organGrinder',
    name: 'Organ Grinder',
    category: 'workshop',
    cost: { organ: 2, bone: 1 },
    description: 'A foul table for turning organs into oils, charms and stimulants.',
    effects: ['Unlocks organ consumables and charms.'],
    unlocksRecipes: ['monsterGrease', 'clawCharm', 'bloodPaint'],
    requires: []
  },
  lanternOven: {
    id: 'lanternOven',
    name: 'Lantern Oven',
    category: 'survival',
    cost: { scrap: 1, organ: 1, hide: 1 },
    description: 'A glowing oven that warms the settlement.',
    effects: ['New survivors start with +1 max HP.'],
    unlocksRecipes: [],
    requires: []
  },
  scoutTower: {
    id: 'scoutTower',
    name: 'Scout Tower',
    category: 'map',
    cost: { scrap: 1, hide: 1, bone: 1 },
    description: 'A fragile tower used to watch the darkness.',
    effects: ['Reveal all node types on the hunt map.', 'Resource nodes are slightly more common.'],
    unlocksRecipes: [],
    requires: []
  },
  storytellerCircle: {
    id: 'storytellerCircle',
    name: 'Storyteller Circle',
    category: 'training',
    cost: { hide: 1, strangeEye: 1, bone: 1 },
    description: 'Survivors gather to remember hunts and learn from the dead.',
    effects: ['Survivor progress offers 4 choices.', 'New survivors start with +1 survival.'],
    unlocksRecipes: ['strangeEyeAmulet'],
    requires: []
  },
  monsterArchive: {
    id: 'monsterArchive',
    name: 'Monster Archive',
    category: 'knowledge',
    cost: { strangeEye: 1, monsterTooth: 1, scrap: 1 },
    description: 'Carved records describe how monsters kill.',
    effects: ['Gain +1 damage against monsters with monster knowledge.'],
    unlocksRecipes: ['strangeEyeAmulet'],
    requires: []
  },
  armoryRack: {
    id: 'armoryRack',
    name: 'Armory Rack',
    category: 'gear',
    cost: { scrap: 2, bone: 1 },
    description: 'A rack where gear can be prepared before a hunt.',
    effects: ['Increase the gear equip limit from 4 to 5.'],
    unlocksRecipes: [],
    requires: []
  }
};

export const innovationList = Object.values(innovations);
