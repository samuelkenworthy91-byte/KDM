const level = (hp, damage, rewardCount) => ({ hp, damage, rewardCount });

export const quarries = {
  paleHuntLion: {
    id: 'paleHuntLion',
    name: 'Pale Hunt Lion',
    description: 'A swift predator that drives wounded prey into the dark.',
    unlocked: true,
    maxLevel: 3,
    levels: { 1: level(30, 5, 1), 2: level(45, 7, 2), 3: level(65, 9, 3) },
    lootByLevel: {
      1: ['hide', 'bone', 'sinew', 'claw'],
      2: ['hide', 'sinew', 'claw', 'monsterTooth'],
      3: ['claw', 'monsterTooth', 'strangeEye', 'ichor']
    },
    unlockRequirements: [],
    behaviourTags: ['fast', 'predator', 'bleed'],
    implemented: true
  },
  wailingAntelope: {
    id: 'wailingAntelope',
    name: 'Wailing Antelope',
    description: 'A charging grazer whose impossible cry breaks resolve.',
    maxLevel: 3,
    levels: { 1: level(34, 5, 1), 2: level(50, 7, 2), 3: level(72, 10, 3) },
    lootByLevel: {
      1: ['hide', 'organ', 'sinew', 'horn'],
      2: ['organ', 'sinew', 'horn', 'monsterTooth'],
      3: ['horn', 'ichor', 'strangeEye', 'organ']
    },
    unlockRequirements: [{ type: 'defeat', quarryId: 'paleHuntLion', level: 1 }],
    unlockText: 'Defeat Pale Hunt Lion Level 1.',
    behaviourTags: ['trample', 'heal', 'panic'],
    implemented: true
  },
  ashPhoenix: {
    id: 'ashPhoenix',
    name: 'Ash Phoenix',
    description: 'A burning bird that twists time and scatters practiced plans.',
    maxLevel: 3,
    levels: { 1: level(38, 6, 1), 2: level(56, 8, 2), 3: level(80, 11, 3) },
    lootByLevel: {
      1: ['organ', 'scrap', 'fur', 'strangeEye'],
      2: ['scrap', 'strangeEye', 'ichor', 'monsterTooth'],
      3: ['strangeEye', 'ichor', 'horn', 'scrap']
    },
    unlockRequirements: [{ type: 'defeat', quarryId: 'wailingAntelope', level: 1 }],
    unlockText: 'Defeat Wailing Antelope Level 1.',
    behaviourTags: ['time', 'burn', 'deck disruption'],
    implemented: true
  },
  bloatedGodling: {
    id: 'bloatedGodling',
    name: 'Bloated Godling',
    description: 'A thunderous mass of sacred organs and crushing weight.',
    maxLevel: 3,
    levels: { 1: level(42, 6, 1), 2: level(60, 9, 2), 3: level(86, 12, 3) },
    lootByLevel: { 1: ['organ', 'bone', 'ichor'], 2: ['organ', 'ichor'], 3: ['ichor', 'strangeEye'] },
    unlockRequirements: [
      { type: 'innovationOrDefeat', innovationId: 'boneSmith', quarryId: 'paleHuntLion', level: 2 }
    ],
    unlockText: 'Build Bone Smith or defeat Pale Hunt Lion Level 2.',
    behaviourTags: ['thunder', 'heavy', 'organs'],
    implemented: false
  },
  silkMatriarch: {
    id: 'silkMatriarch',
    name: 'Silk Matriarch',
    description: 'A patient binder that poisons anything caught in its web.',
    maxLevel: 3,
    levels: { 1: level(40, 6, 1), 2: level(59, 8, 2), 3: level(84, 11, 3) },
    lootByLevel: { 1: ['sinew', 'organ', 'hide'], 2: ['sinew', 'ichor'], 3: ['ichor', 'strangeEye'] },
    unlockRequirements: [{ type: 'defeat', quarryId: 'wailingAntelope', level: 2 }],
    unlockText: 'Defeat Wailing Antelope Level 2.',
    behaviourTags: ['web', 'poison', 'bind'],
    implemented: false
  },
  bloomKnight: {
    id: 'bloomKnight', name: 'Bloom Knight', description: 'A precise duelist from a flowering court.',
    maxLevel: 3, levels: {}, lootByLevel: {},
    unlockRequirements: [{ type: 'innovationAndAnyDefeat', innovationId: 'skinnery', level: 2 }],
    unlockText: 'Build Skinnery and defeat any Level 2 quarry.',
    behaviourTags: ['duel', 'riposte', 'precision'], implemented: false
  },
  chitinCrusader: {
    id: 'chitinCrusader', name: 'Chitin Crusader', description: 'An armoured pilgrim that advances behind an unbroken guard.',
    maxLevel: 3, levels: {}, lootByLevel: {},
    unlockRequirements: [{ type: 'anyDefeat', level: 3 }],
    unlockText: 'Defeat any Level 3 quarry.',
    behaviourTags: ['armour', 'guard', 'blunt'], implemented: false
  },
  drakeEmperor: {
    id: 'drakeEmperor', name: 'Drake Emperor', description: 'A crystal-scaled ruler of flame.',
    maxLevel: 3, levels: {}, lootByLevel: {}, unlockRequirements: [],
    unlockText: 'Reach a future campaign milestone.', behaviourTags: ['fire', 'crystal', 'phase'], implemented: false
  },
  sunSovereign: {
    id: 'sunSovereign', name: 'Sun Sovereign', description: 'A radiant shell that blinds its hunters.',
    maxLevel: 3, levels: {}, lootByLevel: {}, unlockRequirements: [],
    unlockText: 'Reach a future campaign milestone.', behaviourTags: ['blind', 'shell', 'radiant'], implemented: false
  },
  prideKing: {
    id: 'prideKing', name: 'Pride King', description: 'A punishing monarch wrapped in layered armour.',
    maxLevel: 3, levels: {}, lootByLevel: {}, unlockRequirements: [],
    unlockText: 'Reach a future campaign milestone.', behaviourTags: ['armour break', 'pride', 'punishment'], implemented: false
  }
};

export const quarryList = Object.values(quarries);

export function isQuarryRequirementMet(requirement, settlement) {
  const defeated = settlement.defeatedQuarryLevels || {};
  const built = settlement.builtInnovations || [];
  const anyDefeated = levelNeeded => Object.values(defeated).some(value => value >= levelNeeded);

  switch (requirement.type) {
    case 'defeat':
      return (defeated[requirement.quarryId] || 0) >= requirement.level;
    case 'anyDefeat':
      return anyDefeated(requirement.level);
    case 'innovationOrDefeat':
      return built.includes(requirement.innovationId) ||
        (defeated[requirement.quarryId] || 0) >= requirement.level;
    case 'innovationAndAnyDefeat':
      return built.includes(requirement.innovationId) && anyDefeated(requirement.level);
    default:
      return false;
  }
}

export function getNewlyUnlockedQuarries(settlement) {
  return quarryList
    .filter(quarry => quarry.implemented)
    .filter(quarry => !(settlement.unlockedQuarries || []).includes(quarry.id))
    .filter(quarry => quarry.unlockRequirements.length > 0)
    .filter(quarry => quarry.unlockRequirements.every(requirement =>
      isQuarryRequirementMet(requirement, settlement)
    ))
    .map(quarry => quarry.id);
}
