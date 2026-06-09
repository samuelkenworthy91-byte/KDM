export const equipment = {
  boneBlade: {
    id: 'boneBlade', name: 'Bone Blade', slot: 'weapon',
    cost: { bone: 1, sinew: 1 }, requiresInnovation: 'boneSmith',
    description: 'A reliable cutting weapon that rewards repeated attacks.',
    effects: [], cardPackage: { hack: 2, carve: 1 }, passiveText: 'Reliable blade technique.', tags: ['bone', 'blade']
  },
  boneHammer: {
    id: 'boneHammer', name: 'Bone Hammer', slot: 'weapon',
    cost: { bone: 2, scrap: 1 }, requiresInnovation: 'boneSmith',
    description: 'A blunt weapon built to destroy monster guard.',
    effects: [], cardPackage: { skullCrack: 2, guardBreak: 1 }, passiveText: 'Blunt attacks excel at breaking monster block.', tags: ['bone', 'blunt']
  },
  boneDarts: {
    id: 'boneDarts', name: 'Bone Darts', slot: 'weapon',
    cost: { bone: 1, scrap: 1 }, requiresInnovation: 'boneSmith',
    description: 'Cheap ranged attacks keep the hand moving.',
    effects: [], cardPackage: { boneDart: 2, quickToss: 1 }, passiveText: 'Ranged and quick.', tags: ['bone', 'ranged']
  },
  hideWraps: {
    id: 'hideWraps', name: 'Hide Wraps', slot: 'armor',
    cost: { hide: 2 }, requiresInnovation: 'skinnery',
    description: 'Rough protection for a desperate survivor.',
    effects: [{ type: 'startBlock', amount: 5 }], cardPackage: { brace: 1, duckAndRoll: 1 },
    passiveText: 'Start combat with +5 block.', tags: ['hide', 'armor']
  },
  rawhideHood: {
    id: 'rawhideHood', name: 'Rawhide Hood', slot: 'head',
    cost: { hide: 1, fur: 1 }, requiresInnovation: 'skinnery',
    description: 'Helps the wearer read an approaching beast.',
    effects: [], cardPackage: { readTheBeast: 1, rawhideDodge: 1 },
    passiveText: 'Rawhide Dodge is added to the deck.', tags: ['rawhide', 'insight']
  },
  rawhideVest: {
    id: 'rawhideVest', name: 'Rawhide Vest', slot: 'armor',
    cost: { hide: 2, sinew: 1 }, requiresInnovation: 'skinnery',
    description: 'Flexible armor for evasive survival.',
    effects: [{ type: 'firstSkillBlockBonus', amount: 1 }], cardPackage: { rawhideDodge: 1, slipAway: 1 },
    passiveText: 'The first skill each combat gains +1 block.', tags: ['rawhide', 'evasive']
  },
  clawCharm: {
    id: 'clawCharm', name: 'Claw Charm', slot: 'trinket',
    cost: { claw: 1, organ: 1 }, requiresInnovation: 'organGrinder',
    description: 'A vicious charm that encourages bleeding attacks.',
    effects: [{ type: 'attackDamageBonus', amount: 1 }], cardPackage: { clawStrike: 1, ripOpen: 1 },
    passiveText: 'Attacks deal +1 damage.', tags: ['claw', 'bleed']
  },
  monsterGrease: {
    id: 'monsterGrease', name: 'Monster Grease', slot: 'consumable',
    cost: { organ: 1 }, requiresInnovation: 'organGrinder',
    description: 'Slick monster oil used for evasive movement.',
    effects: [], cardPackage: { slipAway: 1 },
    passiveText: 'Reusable for now; consumable charges are not yet tracked.', tags: ['organ', 'evasive']
  },
  strangeEyeAmulet: {
    id: 'strangeEyeAmulet', name: 'Strange Eye Amulet', slot: 'trinket',
    cost: { strangeEye: 1, sinew: 1 }, requiresInnovation: ['monsterArchive', 'storytellerCircle'],
    description: 'Unwelcome insight at the edge of the lantern light.',
    effects: [], cardPackage: { strangeGlimpse: 1, seeThePattern: 1 },
    passiveText: 'Insight cards trade certainty for draw.', tags: ['insight', 'strange']
  },
  hornMaul: {
    id: 'hornMaul', name: 'Horn Maul', slot: 'weapon',
    cost: { horn: 1, bone: 1, sinew: 1 }, requiresInnovation: 'boneSmith',
    description: 'A heavy weapon with powerful, demanding attacks.',
    effects: [], cardPackage: { boneFlurry: 1, goringSwing: 1, braceMaul: 1 },
    passiveText: 'Heavy attacks add discard pressure.', tags: ['horn', 'heavy']
  },
  bloodPaint: {
    id: 'bloodPaint', name: 'Blood Paint', slot: 'body',
    cost: { organ: 1, monsterTooth: 1 }, requiresInnovation: 'organGrinder',
    description: 'War paint that rewards fighting without guard.',
    effects: [{ type: 'noBlockAttackBonus', amount: 1 }], cardPackage: { savageFollowUp: 1 },
    passiveText: 'At 0 block, attacks deal +1 damage.', tags: ['organ', 'aggressive']
  }
};

export const equipmentList = Object.values(equipment);
