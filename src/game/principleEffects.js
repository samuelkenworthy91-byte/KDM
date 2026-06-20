import { BASIC_RESOURCE_IDS } from '../data/resources.js';
import {
  chooseCampaignPrinciple,
  createPendingPrincipleChoice,
  getWorkTogetherMemoryCost,
  hasCampaignPrinciple,
  markWorkTogetherUsed
} from './campaignPrincipleLogic.js';
import { gainMemories } from './memoryEconomy.js';

function timestamp() {
  return new Date().toISOString();
}

function historyEntry(type, message, details = {}) {
  return {
    type,
    message,
    lanternYear: details.lanternYear ?? null,
    timestamp: details.timestamp || timestamp(),
    ...details
  };
}

function deathRewardId(resolution) {
  return `death-principle:${resolution?.id || resolution?.survivorId || resolution?.timestamp || 'unknown'}`;
}

function markResolved(entry, optionId, reward) {
  return {
    ...entry,
    status: 'resolved',
    choice: optionId,
    principleRewardGranted: true,
    principleRewardId: deathRewardId(entry),
    principleReward: reward
  };
}

export function applyDeathPrincipleReward(settlement = {}, resolutionId, options = {}) {
  const resolutions = settlement.pendingDeathResolutions || [];
  const resolution = resolutions.find(entry =>
    entry.id === resolutionId &&
    entry.status === 'pending' &&
    !entry.principleRewardGranted
  );
  if (!resolution) return settlement;
  const optionId = settlement.principles?.death;
  if (!['graves', 'cannibalism'].includes(optionId)) return settlement;

  if (optionId === 'graves') {
    const rewarded = gainMemories(settlement, 1, {
      id: deathRewardId(resolution),
      source: 'death-principle-graves',
      description: `${resolution.survivorName || 'A survivor'} was remembered by Graves.`,
      survivorIds: resolution.survivorId ? [resolution.survivorId] : [],
      lanternYear: resolution.lanternYear ?? settlement.lanternYear
    });
    return {
      ...rewarded,
      pendingDeathResolutions: resolutions.map(entry =>
        entry.id === resolutionId ? markResolved(entry, optionId, { memory: 1 }) : entry
      ),
      settlementHistory: [
        historyEntry('death-principle-reward', `${resolution.survivorName || 'A survivor'} granted +1 Memory through Graves.`, {
          principleId: optionId,
          resolutionId,
          survivorIds: resolution.survivorId ? [resolution.survivorId] : [],
          lanternYear: resolution.lanternYear ?? settlement.lanternYear
        }),
        ...(settlement.settlementHistory || [])
      ]
    };
  }

  const random = options.random || Math.random;
  const safeResources = BASIC_RESOURCE_IDS.filter(Boolean);
  const resourceId = safeResources[Math.floor(random() * safeResources.length)] || 'bone';
  return {
    ...settlement,
    stash: {
      ...(settlement.stash || {}),
      [resourceId]: (settlement.stash?.[resourceId] || 0) + 1
    },
    pendingDeathResolutions: resolutions.map(entry =>
      entry.id === resolutionId ? markResolved(entry, optionId, { resourceId, amount: 1 }) : entry
    ),
    settlementHistory: [
      historyEntry('death-principle-reward', `${resolution.survivorName || 'A survivor'} granted 1 ${resourceId} through Cannibalism.`, {
        principleId: optionId,
        resolutionId,
        resourceId,
        survivorIds: resolution.survivorId ? [resolution.survivorId] : [],
        lanternYear: resolution.lanternYear ?? settlement.lanternYear
      }),
      ...(settlement.settlementHistory || [])
    ]
  };
}

export function resolvePendingDeathPrincipleRewards(settlement = {}, options = {}) {
  if (!settlement.principles?.death) return settlement;
  return (settlement.pendingDeathResolutions || []).reduce((next, resolution) => (
    resolution.status === 'pending' && !resolution.principleRewardGranted
      ? applyDeathPrincipleReward(next, resolution.id, options)
      : next
  ), settlement);
}

export function queueOrResolveDeathPrinciple(settlement = {}, resolutionIds = []) {
  if (settlement.principles?.death) return resolvePendingDeathPrincipleRewards(settlement);
  if (settlement.pendingPrincipleChoice?.group === 'death') return settlement;
  return createPendingPrincipleChoice(settlement, 'death', 'First survivor death', resolutionIds);
}

export function chooseCampaignPrincipleWithEffects(settlement = {}, group, optionId, options = {}) {
  const chosen = chooseCampaignPrinciple(settlement, group, optionId, options.timestamp);
  if (group === 'death' && chosen.principles?.death === optionId) {
    return resolvePendingDeathPrincipleRewards(chosen, options);
  }
  if (group === 'newLife' && chosen.principles?.newLife === optionId) {
    const affectedIds = chosen.principleHistory
      .filter(entry => entry.group === 'newLife' && entry.optionId === optionId)
      .at(-1)?.affectedIds || [];
    if (!affectedIds.length) return chosen;
    return {
      ...chosen,
      survivors: (chosen.survivors || []).map(survivor =>
        affectedIds.includes(survivor.id)
          ? applyNewLifePrincipleToNewborn(survivor, chosen)
          : survivor
      )
    };
  }
  return chosen;
}

export function getNewLifeIntimacyModifiers(settlement = {}) {
  if (hasCampaignPrinciple(settlement, 'newLife', 'protectTheYoung')) {
    return {
      successDelta: 0.1,
      tragedyDelta: -0.1,
      label: 'Protect the Young'
    };
  }
  if (hasCampaignPrinciple(settlement, 'newLife', 'survivalOfTheFittest')) {
    return {
      successDelta: 0,
      tragedyDelta: 0.2,
      label: 'Survival of the Fittest'
    };
  }
  return { successDelta: 0, tragedyDelta: 0, label: '' };
}

export function applyNewLifePrincipleToNewborn(newborn, settlement = {}) {
  if (!newborn) return newborn;
  if (newborn.permanentModifiers?.newLifePrincipleApplied) return newborn;
  if (hasCampaignPrinciple(settlement, 'newLife', 'protectTheYoung')) {
    return {
      ...newborn,
      maxHp: (newborn.maxHp || 30) + 5,
      hp: (newborn.hp || 30) + 5,
      permanentModifiers: {
        ...(newborn.permanentModifiers || {}),
        newLifePrincipleApplied: 'protectTheYoung'
      },
      history: [
        ...(newborn.history || []),
        'Protect the Young: +5 max HP at birth.'
      ]
    };
  }
  if (hasCampaignPrinciple(settlement, 'newLife', 'survivalOfTheFittest')) {
    return {
      ...newborn,
      maxSurvival: (newborn.maxSurvival || 3) + 1,
      permanentModifiers: {
        ...(newborn.permanentModifiers || {}),
        newLifePrincipleApplied: 'survivalOfTheFittest',
        personalDamageBonus: (newborn.permanentModifiers?.personalDamageBonus || 0) + 2
      },
      history: [
        ...(newborn.history || []),
        'Survival of the Fittest: +2 personal damage and +1 max Survival at birth.'
      ]
    };
  }
  return newborn;
}

export function queueNewLifePrincipleIfNeeded(settlement = {}, affectedIds = []) {
  if (settlement.principles?.newLife || settlement.pendingPrincipleChoice?.group === 'newLife') return settlement;
  return createPendingPrincipleChoice(settlement, 'newLife', 'First newborn', affectedIds);
}

export function queueSocietyPrincipleIfNeeded(settlement = {}) {
  if ((Number(settlement.lanternYear) || 0) < 5) return settlement;
  if (settlement.principles?.society || settlement.pendingPrincipleChoice?.group === 'society') return settlement;
  return createPendingPrincipleChoice(settlement, 'society', 'Lantern Year 5', []);
}

export { getWorkTogetherMemoryCost, markWorkTogetherUsed };

function normalizeOdds(odds = {}) {
  const raw = {
    negative: Math.max(0, Number(odds.negative) || 0),
    neutral: Math.max(0, Number(odds.neutral) || 0),
    positive: Math.max(0, Number(odds.positive) || 0)
  };
  const total = raw.negative + raw.neutral + raw.positive;
  if (total <= 0) return { negative: 0, neutral: 0, positive: 100 };

  const scaled = {
    negative: Math.round((raw.negative / total) * 100),
    neutral: Math.round((raw.neutral / total) * 100),
    positive: 0
  };
  scaled.positive = 100 - scaled.negative - scaled.neutral;
  if (scaled.positive < 0) {
    scaled.neutral = Math.max(0, scaled.neutral + scaled.positive);
    scaled.positive = 0;
  }
  return scaled;
}

export function adjustRestOutcomeOddsForPrinciples(settlement = {}, odds = {}) {
  const base = normalizeOdds(odds);
  if (!hasCampaignPrinciple(settlement, 'society', 'embraceTheDark')) {
    return { ...base, modified: false };
  }
  const shifted = {
    negative: Math.max(0, base.negative - 10),
    neutral: Math.max(0, base.neutral - 10),
    positive: base.positive + 20
  };
  return { ...normalizeOdds(shifted), modified: true };
}
