import { resources } from './resources.js';

const GENERIC_BOSS_RESOURCES = ['bone', 'hide', 'sinew', 'organ', 'scrap', 'claw'];

const roster = [
  ['paleHuntLion', 'Pale Hunt Lion', 'quarry', true, ['predator', 'bleed'], ['boneSmith', 'skinnery', 'lionTrophyHall']],
  ['wailingAntelope', 'Wailing Antelope', 'quarry', true, ['evasive', 'disruptive'], ['organGrinder', 'antelopeLarder']],
  ['ashPhoenix', 'Ash Phoenix', 'quarry', true, ['disruptive', 'radiant'], ['monsterArchive', 'phoenixPyre']],
  ['bloatedGodling', 'Bloated Godling', 'quarry', false, ['brute'], ['stormShrine', 'thunderWorkshop']],
  ['crimsonCrocodile', 'Crimson Crocodile', 'quarry', false, ['brute', 'predator'], ['riverTannery']],
  ['frogdog', 'Frogdog', 'quarry', false, ['poison', 'brute'], ['toxicKitchen']],
  ['silkMatriarch', 'Silk Matriarch', 'quarry', false, ['poison', 'evasive'], ['silkLoom', 'venomLab']],
  ['bloomKnight', 'Bloom Knight', 'quarry', false, ['duelist'], ['duelistGarden', 'petalForge']],
  ['smogSingers', 'Smog Singers', 'quarry', false, ['swarm', 'disruptive'], ['smogChoir']],
  ['chitinCrusader', 'Chitin Crusader', 'quarry', false, ['armoured'], ['resinFoundry']],
  ['drakeEmperor', 'Drake Emperor', 'quarry', false, ['radiant', 'brute'], ['imperialFurnace']],
  ['sunSovereign', 'Sun Sovereign', 'quarry', false, ['radiant', 'armoured'], ['sunTemple']],
  ['prideKing', 'Pride King', 'quarry', false, ['predator', 'armoured'], ['royalHall']],
  ['theKingInspired', 'The King Inspired', 'quarry', false, ['nightmare', 'duelist'], ['kingCourt']],
  ['cruelCollector', 'Cruel Collector', 'nemesis', false, ['nightmare', 'disruptive'], ['trophyVault']],
  ['wanderingKiller', 'Wandering Killer', 'nemesis', false, ['predator', 'duelist'], ['hunterWatch']],
  ['maskedJudge', 'Masked Judge', 'nemesis', false, ['duelist', 'disruptive'], ['judgmentHall']],
  ['regalKnight', 'Regal Knight', 'nemesis', false, ['armoured', 'duelist'], ['knightForge']],
  ['shadowStalker', 'Shadow Stalker', 'nemesis', false, ['nightmare', 'disruptive'], ['shadowArchive']],
  ['mirrorTyrant', 'Mirror Tyrant', 'nemesis', false, ['disruptive', 'evasive'], ['mirrorWorkshop']],
  ['blackKnightInspired', 'Black Knight Inspired', 'nemesis', false, ['armoured', 'brute'], ['blackIronForge']],
  ['redWitchesInspired', 'Red Witches Inspired', 'nemesis', false, ['swarm', 'poison'], ['redCoven']],
  ['childEaterInspired', 'Child Eater Inspired', 'nemesis', false, ['nightmare', 'brute'], ['wardingHearth']],
  ['pariahInspired', 'Pariah Inspired', 'nemesis', false, ['evasive', 'disruptive'], ['exileShrine']],
  ['watcherInspired', 'Watcher Inspired', 'finale', false, ['nightmare', 'armoured'], ['watcherMonument']],
  ['goldSmokeKnightInspired', 'Gold Smoke Knight Inspired', 'finale', false, ['radiant', 'duelist'], ['goldSmokeForge']],
  ['gamblerInspired', 'Gambler Inspired', 'finale', false, ['disruptive', 'evasive'], ['houseOfChance']],
  ['godhandInspired', 'Godhand Inspired', 'finale', false, ['brute', 'radiant'], ['handSanctum']],
  ['wanderersPack', 'Wanderers Pack', 'special', false, ['evasive'], ['wandererCamp'], false],
  ['scoutPack', 'Scout Pack', 'special', false, ['evasive'], ['scoutLodge'], false],
  ['whiteBoxPack', 'White Box Pack', 'special', false, ['disruptive'], ['curioArchive'], false],
  ['strainPack', 'Strain Pack', 'special', false, ['nightmare'], ['strainLaboratory'], false],
  ['philosophyPack', 'Philosophy Pack', 'special', false, ['duelist'], ['philosophyHall'], false]
];

const coreMonsterIds = {
  paleHuntLion: 'whiteLion',
  wailingAntelope: 'screamingAntelope',
  ashPhoenix: 'ashPhoenix'
};

function makeQuarry([id, displayName, role, implemented, designTags, buildingUnlocks, huntable = true]) {
  const uniqueResources = Object.values(resources)
    .filter(resource => resource.creatureId === id)
    .map(resource => resource.id);
  const commons = uniqueResources.filter(resourceId => resources[resourceId]?.type === 'creature');
  const rares = uniqueResources.filter(resourceId => ['rare', 'strange'].includes(resources[resourceId]?.type));
  const genericLoot = ['bone', 'hide', 'sinew', 'organ'];

  return {
    id,
    name: displayName,
    displayName,
    familyId: id,
    role,
    implemented,
    huntable,
    maxLevel: role === 'special' ? 1 : 3,
    monsterId: coreMonsterIds[id] || null,
    description: `${displayName} uses ${designTags.join(' and ')} encounter patterns.`,
    designTags,
    uniqueResources,
    genericLoot,
    lootByLevel: {
      1: [...genericLoot.slice(0, 2), ...commons.slice(0, 2)],
      2: [...genericLoot.slice(1, 3), ...commons.slice(0, 4), ...rares.slice(0, 1)],
      3: [...commons, ...rares]
    },
    buildingUnlocks,
    associatedInnovations: buildingUnlocks,
    recipeUnlocks: [],
    unlockHint: id === 'paleHuntLion'
      ? 'Known from settlement founding.'
      : `Discover ${displayName} after a successful hunt.`,
    behaviourId: huntable ? id : null,
    fallbackBehaviourId: huntable && !implemented ? designTags[0] || 'brute' : null
  };
}

export const quarries = Object.fromEntries(roster.map(entry => {
  const quarry = makeQuarry(entry);
  return [quarry.id, quarry];
}));

export const quarryList = Object.values(quarries);
export const quarryRegistry = quarryList;

export function isQuarryUnlocked(quarry, settlement) {
  return Boolean(
    quarry?.huntable &&
    (settlement.discoveredQuarries?.includes(quarry.id) ||
      settlement.unlockedQuarries?.includes(quarry.id))
  );
}

export function getAvailableQuarryLevel(quarryId, settlement) {
  const quarry = quarries[quarryId];
  return Math.min(quarry?.maxLevel || 3, (settlement.defeatedQuarryLevels?.[quarryId] || 0) + 1);
}

export function rollQuarryLoot(quarryId, level) {
  const pool = quarries[quarryId]?.lootByLevel[level] || [];
  const rewardCount = level === 3 ? 5 : level === 2 ? 4 : 3;
  return [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, rewardCount);
}

export function rollGenericBossRewards(amount = 3) {
  return Array.from(
    { length: amount },
    () => GENERIC_BOSS_RESOURCES[Math.floor(Math.random() * GENERIC_BOSS_RESOURCES.length)]
  );
}

export function getCreatureSpecificLootChoices(quarryId, level) {
  const quarry = quarries[quarryId];
  if (!quarry) return [];
  const pool = Array.from({ length: level }, (_, index) => quarry.lootByLevel[index + 1] || [])
    .flat()
    .filter(resourceId => resources[resourceId]?.creatureId === quarryId);
  return [...new Set([...pool, ...quarry.uniqueResources])].slice(0, Math.min(5, 2 + level));
}

export function getDiscoveryChoices(settlement) {
  return quarryList.filter(quarry =>
    quarry.huntable &&
    !settlement.discoveredQuarries.includes(quarry.id) &&
    (quarry.implemented || quarry.fallbackBehaviourId)
  );
}
