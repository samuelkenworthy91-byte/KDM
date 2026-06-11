import { fightingArts, generalFightingArts, isMonsterBaneId } from './fightingArts.js';
import {
  findMonsterSurvivorReward,
  monsterSurvivorRewards
} from './monsterSurvivorRewards.js';
import { getPersonalCardId } from '../game/deckLogic.js';

const rarityWeight = {
  1: { common: 10, uncommon: 4, rare: 0.25 },
  2: { common: 5, uncommon: 9, rare: 2 },
  3: { common: 2, uncommon: 7, rare: 8 }
};

export const genericSurvivorRewards = {
  survival: {
    id: 'survival',
    name: 'Hard-Won Composure',
    type: 'stat',
    category: 'generic',
    rarity: 'common',
    description: 'Gain +1 survival.',
    mechanicalEffectText: 'Immediately gain 1 survival, up to the survivor maximum.',
    tags: ['survival', 'stat']
  },
  strengthLesson: {
    id: 'strengthLesson',
    name: 'Strength Lesson',
    type: 'stat',
    category: 'generic',
    rarity: 'uncommon',
    description: 'Gain +1 strength.',
    mechanicalEffectText: 'Permanently gain 1 strength.',
    tags: ['strength', 'stat']
  },
  hardenedBody: {
    id: 'hardenedBody',
    name: 'Hardened Body',
    type: 'stat',
    category: 'wound',
    rarity: 'uncommon',
    description: 'Gain +1 maximum HP and heal 1.',
    mechanicalEffectText: 'Permanently gain 1 maximum HP, then heal 1 HP.',
    tags: ['wound', 'health', 'stat']
  },
  weaponPractice: {
    id: 'weaponPractice',
    name: 'Weapon Practice',
    type: 'weaponXp',
    category: 'weapon',
    rarity: 'common',
    description: 'Gain +1 XP with the active weapon proficiency.',
    mechanicalEffectText: 'Adds 1 XP to the survivor’s active weapon proficiency.',
    tags: ['weapon', 'learning']
  }
};

const randomWeighted = (items, weightFor, random) => {
  const weighted = items.map(item => ({ item, weight: Math.max(0, weightFor(item)) }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (!total) return null;
  let roll = random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return weighted.at(-1)?.item || null;
};

function artReward(art) {
  const monsterBane = isMonsterBaneId(art.id);
  return {
    id: art.id,
    name: art.name,
    type: monsterBane ? 'monsterBane' : 'fightingArt',
    category: monsterBane ? 'monster' : art.tags?.some(tag =>
      ['sword', 'axe', 'dagger', 'spear', 'bow', 'club', 'hammer', 'katar',
        'fistAndTooth', 'strangeWeapon', 'weapon'].includes(tag)
    ) ? 'weapon' : art.tags?.some(tag =>
      ['wound', 'scar', 'disorder', 'panic'].includes(tag)
    ) ? 'wound' : 'generic',
    rarity: art.rarity || 'common',
    description: art.shortDescription || art.description,
    mechanicalEffectText: art.mechanicalEffectText || art.description,
    tags: art.tags || [],
    source: art.source || 'Survivor reward'
  };
}

export function findSurvivorReward(rewardId) {
  return genericSurvivorRewards[rewardId] ||
    findMonsterSurvivorReward(rewardId) ||
    (fightingArts[rewardId] ? artReward(fightingArts[rewardId]) : null);
}

export function generateSurvivorRewardChoices({
  survivor,
  quarryId,
  level = 1,
  includeBane = false,
  quarryRevealed = true,
  context = {},
  random = Math.random
}) {
  const targetCount = Math.max(3, Math.min(5, level + 2));
  const ownedArts = new Set(survivor?.fightingArts || []);
  const ownedCards = new Set((survivor?.personalDeckAdditions || []).map(getPersonalCardId));
  const recent = new Set((survivor?.recentRewardOfferIds || []).slice(-15));
  const hasAnyBane = [...ownedArts].some(isMonsterBaneId);
  const monsterEntry = quarryRevealed ? monsterSurvivorRewards[quarryId] : null;
  const monsterPool = monsterEntry
    ? Object.values(monsterEntry.levelRewards)
      .flat()
      .filter(reward => reward.levelMin <= level && !ownedCards.has(reward.id))
      .map(reward => ({ ...reward, category: 'monster', mechanicalEffectText: reward.effectText }))
    : [];
  if (includeBane && !hasAnyBane && monsterEntry?.monsterBaneReward) {
    monsterPool.push({ ...monsterEntry.monsterBaneReward, category: 'monster' });
  }

  const artPool = generalFightingArts
    .filter(art => !ownedArts.has(art.id))
    .filter(art => !(art.grantsCards || []).some(cardId => ownedCards.has(cardId)))
    .map(artReward);
  const relevantWound = Boolean(
    survivor?.injuries?.length ||
    survivor?.scars?.length ||
    survivor?.disorders?.length ||
    context.woundsSuffered ||
    context.endedLowHp
  );
  const activeWeapon = survivor?.activeProficiencyType;
  const pool = [
    ...monsterPool,
    ...artPool,
    ...Object.values(genericSurvivorRewards).filter(reward =>
      reward.id !== 'hardenedBody' || relevantWound
    )
  ];
  const selected = [];

  const weightFor = reward => {
    let weight = rarityWeight[level]?.[reward.rarity] || 1;
    if (recent.has(reward.id)) weight *= 0.04;
    if (reward.category === 'monster') weight *= level === 3 ? 2.2 : 1.5;
    if (activeWeapon && reward.tags?.includes(activeWeapon)) weight *= 3;
    if (reward.category === 'weapon' && context.weaponTypeUsed) weight *= 1.8;
    if (reward.category === 'wound' && relevantWound) weight *= 2.5;
    if (reward.tags?.includes('support') && context.supportActionsUsed) weight *= 2;
    if (reward.tags?.includes('harvest') && context.brokeWeakPoint) weight *= 2.5;
    if (reward.tags?.includes('finisher') && context.dealtFinalBlow) weight *= 2;
    if (reward.tags?.includes('monsterBane') && hasAnyBane) return 0;
    return weight;
  };

  const takeCategory = category => {
    const choice = randomWeighted(
      pool.filter(reward => reward.category === category && !selected.some(item => item.id === reward.id)),
      weightFor,
      random
    );
    if (choice) selected.push(choice);
  };

  takeCategory('monster');
  takeCategory('weapon');
  takeCategory('generic');
  if (relevantWound && selected.length < targetCount) takeCategory('wound');
  if (level >= 2 && selected.length < targetCount) {
    const rare = randomWeighted(
      pool.filter(reward => reward.rarity === 'rare' && !selected.some(item => item.id === reward.id)),
      weightFor,
      random
    );
    if (rare) selected.push(rare);
  }
  while (selected.length < targetCount) {
    const choice = randomWeighted(
      pool.filter(reward => !selected.some(item => item.id === reward.id)),
      weightFor,
      random
    );
    if (!choice) break;
    selected.push(choice);
  }
  return selected.slice(0, targetCount);
}
