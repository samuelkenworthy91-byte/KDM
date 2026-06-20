import { cards } from '../data/cards.js';
import { BASIC_RESOURCE_IDS, resources } from '../data/resources.js';

export const nemesisChampionCardIds = {
  cruelCollector: 'championCruelCollectorDue',
  maskedJudge: 'championMaskedJudgeEdict',
  wanderingKiller: 'championWanderingKillerStep',
  shadowStalker: 'championShadowStalkerMantle',
  mirrorTyrant: 'championMirrorTyrantClaim'
};

function resourceName(resourceId) {
  return resources[resourceId]?.name || resourceId;
}

function pick(items, random = Math.random) {
  if (!items.length) return null;
  return items[Math.floor(random() * items.length)];
}

function unlockedCreatureResourcePool(settlement = {}) {
  const unlocked = new Set([
    ...(Array.isArray(settlement.unlockedQuarries) ? settlement.unlockedQuarries : []),
    ...(Array.isArray(settlement.discoveredQuarries) ? settlement.discoveredQuarries : [])
  ]);
  return Object.values(resources)
    .filter(resource => resource.creatureId && unlocked.has(resource.creatureId))
    .filter(resource => ['creature', 'rare', 'strange', 'level3Rare'].includes(resource.type))
    .map(resource => resource.id);
}

function createResourceRewards(encounter, settlement = {}, random = Math.random) {
  const basics = BASIC_RESOURCE_IDS.filter(id => id !== 'loveJuice').slice(0, 3);
  const unique = encounter?.rewards?.uniqueResourceId || null;
  const creaturePool = unlockedCreatureResourcePool(settlement);
  const quarryResourceId = pick(creaturePool, random);
  return [...basics, ...(quarryResourceId ? [quarryResourceId] : []), ...(unique ? [unique] : [])];
}

export function createNemesisVictoryReward(encounter, survivor, options = {}) {
  const rewardEventId = options.rewardEventId ||
    `nemesis-reward-${encounter?.id || 'legacy'}-${Date.now()}`;
  const championCardId = nemesisChampionCardIds[encounter?.id];
  const championCard = cards[championCardId] || null;
  const championCardOwned = Boolean(championCardId && (survivor?.personalDeckAdditions || [])
    .some(addition => (typeof addition === 'string' ? addition : addition?.cardId) === championCardId));
  const resourceIds = createResourceRewards(encounter, options.settlement, options.random);

  return {
    rewardEventId,
    resourceIds,
    resourceNames: resourceIds.map(resourceName),
    championCardId,
    championCardName: championCard?.name || 'Unknown / Legacy',
    championCardDescription: championCard?.description || 'This older reward has no current description.',
    championCardOwned,
    rewardClaimed: true,
    chosenRewardId: championCardOwned ? 'alreadyOwned' : 'championCard',
    rewardChoices: [],
    uniqueResourceId: encounter?.rewards?.uniqueResourceId || null,
    uniqueResourceName: resourceName(encounter?.rewards?.uniqueResourceId),
    learningText: encounter?.rewards?.learningText ||
      'The survivor carried an unnamed lesson home.'
  };
}

export function addNemesisChampionCardToSurvivor(survivor, reward) {
  const cardId = reward?.championCardId;
  if (!cardId || !cards[cardId]) return survivor;
  const additions = survivor.personalDeckAdditions || [];
  if (additions.some(addition => (typeof addition === 'string' ? addition : addition?.cardId) === cardId)) {
    return survivor;
  }
  return {
    ...survivor,
    personalDeckAdditions: [
      ...additions,
      {
        cardId,
        sourceType: 'nemesisChampion',
        reason: reward.championCardName || 'Nemesis champion reward',
        locked: true
      }
    ]
  };
}

export function getNemesisRewardChoice(reward, choiceId) {
  return reward?.rewardChoices?.find(choice => choice.id === choiceId) || null;
}
