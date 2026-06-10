import { resources } from './resources.js';
import { quarryWeakPoints } from './weakPoints.js';

const GENERIC_BOSS_RESOURCES = ['bone', 'hide', 'sinew', 'organ', 'scrap', 'claw'];
const TIER_DATA = {
  paleHuntLion: ['early', 1],
  wailingAntelope: ['early', 1],
  ashPhoenix: ['mid', 2],
  frogdog: ['mid', 2],
  silkMatriarch: ['mid', 2],
  bloomKnight: ['mid', 2],
  bloatedGodling: ['late', 3],
  crimsonCrocodile: ['late', 3],
  chitinCrusader: ['late', 3],
  smogSingers: ['late', 3],
  drakeEmperor: ['apex', 4],
  sunSovereign: ['apex', 4],
  prideKing: ['apex', 4]
};
const TIER_SCALING = {
  early: { hp: 1, damage: 0, aggression: 0, dangerousIntents: 0 },
  mid: { hp: 1.18, damage: 1, aggression: 1, dangerousIntents: 1 },
  late: { hp: 1.38, damage: 2, aggression: 2, dangerousIntents: 2 },
  apex: { hp: 1.62, damage: 3, aggression: 3, dangerousIntents: 3 },
  special: { hp: 1.5, damage: 2, aggression: 2, dangerousIntents: 2 }
};

const roster = [
  ['paleHuntLion', 'Pale Hunt Lion', 'quarry', true, ['predator', 'bleed'], ['boneSmith', 'skinnery', 'lionTrophyHall']],
  ['wailingAntelope', 'Wailing Antelope', 'quarry', true, ['evasive', 'disruptive'], ['organGrinder', 'antelopeLarder']],
  ['ashPhoenix', 'Ash Phoenix', 'quarry', true, ['disruptive', 'radiant'], ['monsterArchive', 'phoenixPyre']],
  ['bloatedGodling', 'Bloated Godling', 'quarry', true, ['brute'], ['stormShrine']],
  ['crimsonCrocodile', 'Crimson Crocodile', 'quarry', true, ['brute', 'predator'], ['redTannery']],
  ['frogdog', 'Frogdog', 'quarry', true, ['poison', 'brute'], ['wetYard']],
  ['silkMatriarch', 'Silk Matriarch', 'quarry', true, ['poison', 'evasive'], ['silkLoom']],
  ['bloomKnight', 'Bloom Knight', 'quarry', true, ['duelist'], ['duelistGarden']],
  ['smogSingers', 'Smog Singers', 'quarry', true, ['swarm', 'disruptive'], ['smogKiln']],
  ['chitinCrusader', 'Chitin Crusader', 'quarry', true, ['armoured'], ['chitinFoundry']],
  ['drakeEmperor', 'Drake Emperor', 'quarry', true, ['radiant', 'brute'], ['crystalForge']],
  ['sunSovereign', 'Sun Sovereign', 'quarry', true, ['radiant', 'armoured'], ['shellSanctum']],
  ['prideKing', 'Pride King', 'quarry', true, ['predator', 'armoured'], ['prideHall']],
  ['theKingInspired', 'The King Inspired', 'endgame', false, ['nightmare', 'duelist'], ['kingCourt']],
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
  const rares = uniqueResources.filter(resourceId => ['rare', 'strange', 'level3Rare'].includes(resources[resourceId]?.type));
  const level3Rares = uniqueResources.filter(resourceId => resources[resourceId]?.type === 'level3Rare');
  const genericLoot = ['bone', 'hide', 'sinew', 'organ'];
  const [tier, tierRank] = TIER_DATA[id] || ['special', 5];
  const commonParts = uniqueResources.filter(resourceId => resources[resourceId]?.type === 'creature');
  const uncommonParts = uniqueResources.filter(resourceId => ['rare', 'strange'].includes(resources[resourceId]?.type));

  return {
    id,
    name: displayName,
    displayName,
    familyId: id,
    role,
    implemented,
    huntable,
    maxLevel: role === 'special' ? 1 : 3,
    level: 1,
    tier,
    tierRank,
    levelScaling: {
      1: { hp: 1, damage: 0, aggression: 1 },
      2: { hp: 1.35, damage: 1, aggression: 2 },
      3: { hp: 1.75, damage: 3, aggression: 4 }
    },
    tierScaling: TIER_SCALING[tier],
    levelRewardProfile: {
      1: { genericCount: 3, uniqueCount: 1, survivorChoices: 3, quality: 'Common' },
      2: { genericCount: 4, uniqueCount: 2, survivorChoices: 4, quality: 'Uncommon' },
      3: { genericCount: 5, uniqueCount: 3, survivorChoices: 5, quality: 'Rare' }
    },
    tierRewardProfile: {
      genericQuality: tier === 'apex' ? 'Exceptional' : tier === 'late' ? 'Rare' : tier === 'mid' ? 'Improved' : 'Standard',
      rareGenericChance: tier === 'apex' ? 1 : tier === 'late' ? 0.65 : tier === 'mid' ? 0.35 : 0
    },
    monsterId: coreMonsterIds[id] || null,
    description: `${displayName} uses ${designTags.join(' and ')} encounter patterns.`,
    designTags,
    uniqueResources,
    genericLoot,
    lootByLevel: {
      1: commonParts.slice(0, 3),
      2: [...commonParts, ...uncommonParts],
      3: [...commonParts, ...uncommonParts, ...level3Rares]
    },
    level3RareResources: level3Rares,
    weakPoints: quarryWeakPoints[id] || [],
    buildingUnlocks,
    associatedInnovations: buildingUnlocks,
    recipeUnlocks: [],
    unlockHint: id === 'paleHuntLion'
      ? 'Known from settlement founding.'
      : `Discover ${displayName} after a successful hunt.`,
    behaviourId: huntable ? id : null,
    behaviourType: huntable && implemented ? 'unique' : huntable ? 'fallback' : 'none',
    fallbackBehaviourId: huntable && !implemented ? designTags[0] || 'brute' : null
  };
}

export const quarries = Object.fromEntries(roster.map(entry => {
  const quarry = makeQuarry(entry);
  return [quarry.id, quarry];
}));

export const quarryList = Object.values(quarries);
export const quarryRegistry = quarryList;

export function getQuarryBehaviourLabel(quarry) {
  if (!quarry?.huntable) return 'Not yet huntable';
  return quarry.behaviourType === 'fallback' ? 'Behaviour: Fallback' : 'Behaviour: Unique';
}

export function getQuarryBehaviourNote(quarry) {
  return quarry?.behaviourType === 'fallback'
    ? 'Playable with a shared behaviour pack; a fully unique pack is not yet available.'
    : '';
}

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

export function rollTierGenericBossRewards(quarryId, level) {
  const quarry = quarries[quarryId];
  const count = quarry?.levelRewardProfile?.[level]?.genericCount || 3;
  const rewards = rollGenericBossRewards(count);
  const rarePool = ['strangeEye', 'ichor', 'monsterTooth'];
  const rareChance = quarry?.tierRewardProfile?.rareGenericChance || 0;
  if (rareChance >= 1 || Math.random() < rareChance) {
    rewards[Math.max(0, rewards.length - 1)] = rarePool[Math.floor(Math.random() * rarePool.length)];
  }
  return rewards;
}

function addWeight(weightedPool, resourceId, amount, level) {
  const resource = resources[resourceId];
  if (!resource || amount <= 0) return;
  if (resource.type === 'level3Rare' && level < 3) return;
  if (['rare', 'strange'].includes(resource.type) && level < 2) return;
  weightedPool.set(resourceId, (weightedPool.get(resourceId) || 0) + amount);
}

function drawWeightedUnique(weightedPool, count) {
  const remaining = new Map(weightedPool);
  const choices = [];
  while (choices.length < count && remaining.size) {
    const totalWeight = [...remaining.values()].reduce((total, weight) => total + weight, 0);
    let roll = Math.random() * totalWeight;
    let selectedId = remaining.keys().next().value;
    for (const [resourceId, weight] of remaining) {
      roll -= weight;
      if (roll <= 0) {
        selectedId = resourceId;
        break;
      }
    }
    choices.push(selectedId);
    remaining.delete(selectedId);
  }
  return choices;
}

export function getCreatureSpecificLootChoices(quarryId, level, harvestResults = []) {
  const quarry = quarries[quarryId];
  if (!quarry) return [];
  const weightedPool = new Map();
  const tierBonus = Math.max(0, quarry.tierRank - 1);
  const basePool = Array.from(
    { length: level },
    (_, index) => quarry.lootByLevel[index + 1] || []
  ).flat();

  basePool.forEach(resourceId => {
    const type = resources[resourceId]?.type;
    const baseWeight = type === 'level3Rare'
      ? 4 + tierBonus
      : ['rare', 'strange'].includes(type)
        ? 10 + tierBonus * 2
        : 30 + tierBonus;
    addWeight(weightedPool, resourceId, baseWeight, level);
  });

  harvestResults.forEach(result => {
    const profile = result.harvestProfile;
    const qualityWeights = profile?.qualityWeights?.[result.quality];
    if (!profile || !qualityWeights) return;
    profile.relatedPartIds.forEach(resourceId => {
      const isRare = ['rare', 'strange', 'level3Rare'].includes(resources[resourceId]?.type);
      if (result.quality !== 'ruined' || !isRare) {
        addWeight(weightedPool, resourceId, qualityWeights.related, level);
      }
    });
    if (result.quality !== 'ruined') {
      profile.rarePartIds.forEach(resourceId =>
        addWeight(weightedPool, resourceId, qualityWeights.rare, level)
      );
    }
    profile.fallbackPartIds.forEach(resourceId =>
      addWeight(weightedPool, resourceId, qualityWeights.fallback, level)
    );
  });

  const offerRanges = {
    1: [3, 4],
    2: [4, 6],
    3: [5, 8]
  };
  const [minimum, maximum] = offerRanges[level] || offerRanges[1];
  const offerCount = minimum + Math.floor(Math.random() * (maximum - minimum + 1));
  return drawWeightedUnique(weightedPool, offerCount);
}

export function getDiscoveryChoices(settlement) {
  return quarryList.filter(quarry =>
    quarry.role === 'quarry' &&
    quarry.huntable &&
    !settlement.discoveredQuarries.includes(quarry.id) &&
    (quarry.implemented || quarry.fallbackBehaviourId)
  );
}
