export const innovations = {
  lanternHearth: {
    id: 'lanternHearth',
    name: 'Lantern Hearth',
    category: 'core',
    cost: {},
    description: 'The center of settlement life. Built when the settlement is founded.',
    unlockRequirement: { type: 'always' },
    unlockSource: 'Settlement creation',
    unlockText: 'Available from settlement creation.',
    effects: ['The settlement can organize hunts.'],
    unlocksRecipes: []
  },
  boneSmith: {
    id: 'boneSmith',
    name: 'Bone Smith',
    category: 'crafting',
    cost: { bone: 2, paleLionSinew: 1 },
    fallbackCost: { bone: 2, sinew: 1 },
    description: 'Shapes bone into dependable hunting weapons.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'paleHuntLion', level: 1 },
    unlockSource: 'Pale Hunt Lion',
    unlockText: 'Defeat Pale Hunt Lion Level 1.',
    effects: ['Unlocks bone weapons and basic lion gear recipes.'],
    unlocksRecipes: ['boneBlade', 'boneHammer', 'boneDarts']
  },
  skinnery: {
    id: 'skinnery',
    name: 'Skinnery',
    category: 'crafting',
    cost: { hide: 2, paleLionHide: 1 },
    description: 'Cures monster hide into protective equipment.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'paleHuntLion', level: 1 },
    unlockSource: 'Pale Hunt Lion',
    unlockText: 'Defeat Pale Hunt Lion Level 1.',
    effects: ['Unlocks hide and rawhide gear recipes.'],
    unlocksRecipes: ['hideWraps', 'rawhideHood', 'rawhideVest']
  },
  organGrinder: {
    id: 'organGrinder',
    name: 'Organ Grinder',
    category: 'crafting',
    cost: { organ: 2, wailingOrgan: 1 },
    description: 'Preserves organs and turns trophies into charms.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'wailingAntelope', level: 1 },
    unlockSource: 'Wailing Antelope',
    unlockText: 'Defeat Wailing Antelope Level 1.',
    effects: ['Unlocks organ, paint, and charm recipes.'],
    unlocksRecipes: ['monsterGrease', 'clawCharm', 'bloodPaint']
  },
  scoutTower: {
    id: 'scoutTower',
    name: 'Scout Tower',
    category: 'utility',
    cost: { scrap: 1, hide: 1, bone: 1 },
    description: 'Scouts mark the character of each route before departure.',
    unlockRequirement: { type: 'any', requirements: [
      { type: 'completedHunts', count: 2 },
      { type: 'quarryLevel', quarryId: 'paleHuntLion', level: 1 }
    ] },
    unlockSource: 'Campaign progress',
    unlockText: 'Complete 2 hunts or defeat Pale Hunt Lion Level 1.',
    effects: ['Hunt map node types are identified.'],
    activeNote: 'Route types were already visible; the tower confirms that scouting information.',
    unlocksRecipes: []
  },
  storytellerCircle: {
    id: 'storytellerCircle',
    name: 'Storyteller Circle',
    category: 'legacy',
    cost: { hide: 1, strangeEye: 1, bone: 1 },
    description: 'The settlement turns victories and deaths into useful instruction.',
    unlockRequirement: { type: 'any', requirements: [
      { type: 'deadSurvivors', count: 1 },
      { type: 'completedHunts', count: 1 }
    ] },
    unlockSource: 'Settlement history',
    unlockText: 'Lose a survivor or win a hunt.',
    effects: ['Survivor progress offers four choices after victories (planned campaign hook).'],
    activeNote: 'Legacy instruction is recorded; expanded survivor choices are planned.',
    unlocksRecipes: []
  },
  monsterArchive: {
    id: 'monsterArchive',
    name: 'Monster Archive',
    category: 'knowledge',
    cost: { strangeEye: 1, monsterTooth: 1, scrap: 1 },
    description: 'Records quarry weaknesses learned through hard hunts.',
    unlockRequirement: { type: 'anyQuarryLevel', level: 2 },
    unlockSource: 'Quarry mastery',
    unlockText: 'Defeat any quarry at Level 2.',
    effects: ['Gain +1 strength against monsters recorded in monsterKnowledge.'],
    unlocksRecipes: []
  },
  armoryRack: {
    id: 'armoryRack',
    name: 'Armory Rack',
    category: 'utility',
    cost: { scrap: 2, bone: 1 },
    description: 'Organizes equipment so hunters can carry one additional piece.',
    unlockRequirement: { type: 'craftedGear', count: 2 },
    unlockSource: 'Crafting progress',
    unlockText: 'Craft any 2 gear pieces.',
    effects: ['Increases the gear equip limit from 4 to 5.'],
    unlocksRecipes: []
  },
  firstAidTent: {
    id: 'firstAidTent',
    name: 'First Aid Tent',
    category: 'survival',
    cost: { hide: 2, organ: 1, scrap: 1 },
    description: 'A clean shelter where returning hunters receive sustained care.',
    unlockRequirement: { type: 'completedHunts', count: 2 },
    unlockSource: 'Campaign progress',
    unlockText: 'Complete 2 hunts.',
    effects: ['Treat one injury per Lantern Year for 1 organ or 1 hide.'],
    unlocksRecipes: []
  },
  lionTrophyHall: {
    id: 'lionTrophyHall',
    name: 'Lion Trophy Hall',
    category: 'quarry',
    cost: { paleLionMane: 1, paleLionClaw: 1, bone: 1 },
    description: 'Displays proof of mastery over the Pale Hunt Lion.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'paleHuntLion', level: 2 },
    unlockSource: 'Pale Hunt Lion',
    unlockText: 'Defeat Pale Hunt Lion Level 2.',
    effects: ['Unlocks advanced Pale Hunt Lion gear.'],
    unlocksRecipes: ['paleFangKatar', 'paleManeBow', 'whitePounceKatana', 'stalkingSpear', 'lionhideBuckler', 'maneCloak', 'catEyeCharm', 'pouncingGreaves', 'whiskerNeedle', 'predatorMask', 'whiteClawTrap', 'huntingHideWrap']
  },
  antelopeLarder: {
    id: 'antelopeLarder',
    name: 'Antelope Larder',
    category: 'quarry',
    cost: { stomachStone: 1, wailingOrgan: 1, hide: 1 },
    description: 'Preserves the Antelope resources needed for mobile hunting gear.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'wailingAntelope', level: 2 },
    unlockSource: 'Wailing Antelope',
    unlockText: 'Defeat Wailing Antelope Level 2.',
    effects: ['Unlocks Wailing Antelope gear and survival improvements.'],
    unlocksRecipes: ['wailingHornBow', 'stomachStoneCharm', 'trampleBoots', 'hungerDrum', 'gutCordWrap', 'grassDevourerMask']
  },
  phoenixPyre: {
    id: 'phoenixPyre',
    name: 'Phoenix Pyre',
    category: 'quarry',
    cost: { phoenixAsh: 1, memoryGlass: 1, scrap: 1 },
    description: 'A controlled flame for shaping time-touched remains.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'ashPhoenix', level: 2 },
    unlockSource: 'Ash Phoenix',
    unlockText: 'Defeat Ash Phoenix Level 2.',
    effects: ['Unlocks Ash Phoenix gear and deck-control equipment.'],
    unlocksRecipes: ['ashFeatherMantle', 'timeBoneBlade', 'memoryGlassEye', 'burntWingFan', 'emberThreadWrap', 'ashClockCharm']
  }
};

const quarryLocations = [
  ['stormShrine', 'Storm Shrine', 'bloatedGodling', { thunderGland: 1, bone: 1 }, 'Channels storm-charged remains.', ['thunderMaul', 'stormGutCharm', 'swollenHideVest', 'staticNeedle', 'godlingDrum', 'crackedMolarBlade']],
  ['redTannery', 'Red Tannery', 'crimsonCrocodile', { crimsonScale: 1, hide: 1 }, 'Cures river scales and dense red leather.', ['crimsonScaleShield', 'riverToothBlade', 'redLeatherCoat', 'drowningHook', 'bloodMudPaint', 'crocodileEyeCharm']],
  ['wetYard', 'Wet Yard', 'frogdog', { rubberyHide: 1, organ: 1 }, 'Contains toxins and elastic quarry parts.', ['frogdogTongueWhip', 'rubberyHideSuit', 'toxicGlandBomb', 'wetBoneClub', 'bulgingEyeCharm', 'leapingBoots']],
  ['silkLoom', 'Silk Loom', 'silkMatriarch', { silkGland: 1, bone: 1 }, 'Works shell-strong silk and measured venom.', ['silkThreadBow', 'venomSacNeedle', 'webbedHideMantle', 'spiderEyeCharm', 'eggPouch', 'skitterWraps']],
  ['duelistGarden', 'Duelist Garden', 'bloomKnight', { bloomPetal: 1, hide: 1 }, 'Cultivates living weapons and precise armor.', ['duelistThornRapier', 'bloomPetalCloak', 'polishedStemSpear', 'floralSinewBowstring', 'knightSeedCharm', 'perfectStepBoots']],
  ['smogKiln', 'Smog Kiln', 'smogSingers', { sootLung: 1, scrap: 1 }, 'Fires soot, tar, and resonant bone.', ['smogPipeFlute', 'sootLungMask', 'harmonyBoneBlade', 'tarFeatherCloak', 'chokingMask', 'chorusBell']],
  ['chitinFoundry', 'Chitin Foundry', 'chitinCrusader', { chitinPlate: 1, scrap: 1 }, 'Layers shell and hardening resin.', ['chitinPlateArmor', 'beetleHornHammer', 'resinBloodShield', 'jewelWingCharm', 'dungCoreBomb', 'crusaderShellHelm']],
  ['crystalForge', 'Crystal Forge', 'drakeEmperor', { crystalBone: 1, scrap: 1 }, 'Shapes heatproof scale and crystal bone.', ['drakeScaleMail', 'crystalBoneBlade', 'fireGlandBomb', 'imperialHornHelm', 'moltenEyeCharm', 'emberCrown']],
  ['shellSanctum', 'Shell Sanctum', 'sunSovereign', { sunShell: 1, hide: 1 }, 'Tempers radiant shell beneath heavy cloth.', ['sunShellShield', 'radiantEyeCharm', 'solarIchorBlade', 'blindingScaleCloak', 'warmPearlAmulet', 'noonMirror']],
  ['prideHall', 'Pride Hall', 'prideKing', { prideMane: 1, bone: 1 }, 'Turns royal trophies into demanding gear.', ['prideManeCloak', 'kingClawGauntlet', 'goldenFangBlade', 'regalHideArmor', 'judgmentEyeCharm', 'royalChallengeHorn']]
];

quarryLocations.forEach(([id, name, quarryId, cost, description, unlocksRecipes]) => {
  innovations[id] = {
    id,
    name,
    category: 'quarry',
    cost,
    description,
    unlockRequirement: { type: 'quarryDiscovery', quarryId },
    unlockSource: quarryId,
    unlockText: `Discover ${quarryId}.`,
    effects: [`Unlocks ${name} recipes.`],
    unlocksRecipes
  };
});

export const innovationList = Object.values(innovations);
