import { creatureFamilies } from './creatureFamilies.js';
import { resources } from './resources.js';

const GENERIC_BOSS_RESOURCES = ['bone', 'hide', 'sinew', 'organ', 'scrap', 'claw'];

export const quarries = {
  paleHuntLion: {
    id: 'paleHuntLion',
    name: 'Pale Hunt Lion',
    familyId: 'paleHuntLion',
    monsterId: 'whiteLion',
    associatedInnovations: ['boneSmith', 'skinnery', 'lionTrophyHall'],
    description: 'A territorial predator whose parts support weapons and rawhide armor.',
    lootByLevel: {
      1: ['hide', 'bone', 'sinew', 'paleLionHide', 'paleLionClaw'],
      2: ['hide', 'bone', 'paleLionHide', 'paleLionSinew', 'paleLionMane', 'monsterTooth'],
      3: ['paleLionHide', 'paleLionSinew', 'paleLionMane', 'paleLionEye', 'strangeEye', 'monsterTooth']
    }
  },
  wailingAntelope: {
    id: 'wailingAntelope',
    name: 'Wailing Antelope',
    familyId: 'wailingAntelope',
    monsterId: 'screamingAntelope',
    associatedInnovations: ['organGrinder', 'antelopeLarder'],
    description: 'A swift quarry rich in horns, organs, and survival materials.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'paleHuntLion', level: 1 },
    lootByLevel: {
      1: ['hide', 'organ', 'horn', 'wailingHide', 'wailingHorn'],
      2: ['organ', 'wailingHide', 'wailingHorn', 'wailingOrgan', 'screamingSinew', 'stomachStone'],
      3: ['wailingOrgan', 'screamingSinew', 'stomachStone', 'strangeEye', 'ichor']
    }
  },
  ashPhoenix: {
    id: 'ashPhoenix',
    name: 'Ash Phoenix',
    familyId: 'ashPhoenix',
    monsterId: 'ashPhoenix',
    associatedInnovations: ['monsterArchive', 'phoenixPyre'],
    description: 'A disruptive quarry carrying ash, memory, and time-touched remains.',
    unlockRequirement: { type: 'quarryLevel', quarryId: 'wailingAntelope', level: 1 },
    lootByLevel: {
      1: ['organ', 'scrap', 'ashFeather', 'burntOrgan'],
      2: ['scrap', 'ashFeather', 'burntOrgan', 'phoenixAsh', 'memoryGlass'],
      3: ['phoenixAsh', 'memoryGlass', 'timeBone', 'strangeEye']
    }
  }
};

export const quarryList = Object.values(quarries);
export const quarryRegistry = Object.values(creatureFamilies).filter(family => family.role === 'quarry');

export function isQuarryUnlocked(quarry, settlement) {
  if (settlement.discoveredQuarries?.includes(quarry.id)) return true;
  const requirement = quarry.unlockRequirement;
  if (!requirement) return true;
  return (settlement.defeatedQuarryLevels?.[requirement.quarryId] || 0) >= requirement.level;
}

export function getAvailableQuarryLevel(quarryId, settlement) {
  return Math.min(3, (settlement.defeatedQuarryLevels?.[quarryId] || 0) + 1);
}

export function rollQuarryLoot(quarryId, level) {
  const pool = quarries[quarryId]?.lootByLevel[level] || [];
  const rewardCount = level === 3 ? 5 : level === 2 ? 4 : 3;
  const generic = pool.filter(resourceId => ![
    'paleLionHide', 'paleLionClaw', 'paleLionSinew', 'paleLionMane', 'paleLionEye',
    'wailingHide', 'wailingHorn', 'wailingOrgan', 'screamingSinew', 'stomachStone',
    'ashFeather', 'burntOrgan', 'phoenixAsh', 'memoryGlass', 'timeBone'
  ].includes(resourceId));
  const creature = pool.filter(resourceId => !generic.includes(resourceId));
  const rewards = [];

  if (generic.length) rewards.push(generic[Math.floor(Math.random() * generic.length)]);
  if (creature.length) rewards.push(creature[Math.floor(Math.random() * creature.length)]);

  const remaining = pool.filter(resourceId => !rewards.includes(resourceId));
  while (rewards.length < rewardCount && remaining.length) {
    const index = Math.floor(Math.random() * remaining.length);
    rewards.push(remaining.splice(index, 1)[0]);
  }

  return rewards;
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

  const available = Array.from({ length: level }, (_, index) => quarry.lootByLevel[index + 1] || [])
    .flat()
    .filter(resourceId => resources[resourceId]?.creatureId === quarryId);
  const fallback = Object.values(resources)
    .filter(resource => resource.creatureId === quarryId)
    .map(resource => resource.id);
  const choiceCount = Math.min(5, 2 + level);

  return [...new Set([...available, ...fallback])].slice(0, choiceCount);
}
