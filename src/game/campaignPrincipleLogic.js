import {
  PRINCIPLE_GROUPS,
  campaignPrincipleGroups,
  getCampaignPrinciple,
  getCampaignPrincipleOptions
} from '../data/campaignPrinciples.js';

export const emptyPrinciples = {
  death: null,
  newLife: null,
  society: null
};
const WORK_TOGETHER_KEY = 'workTogether';

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function normalizePrinciples(value = {}) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return PRINCIPLE_GROUPS.reduce((principles, group) => {
    const optionId = typeof source[group] === 'string' ? source[group] : null;
    return {
      ...principles,
      [group]: getCampaignPrinciple(optionId)?.group === group ? optionId : null
    };
  }, { ...emptyPrinciples });
}

export function normalizePendingPrincipleChoice(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (!PRINCIPLE_GROUPS.includes(value.group)) return null;
  return {
    group: value.group,
    trigger: value.trigger || campaignPrincipleGroups[value.group]?.triggerLabel || value.group,
    affectedIds: unique(Array.isArray(value.affectedIds) ? value.affectedIds : []),
    createdAtLanternYear: Number.isFinite(value.createdAtLanternYear)
      ? value.createdAtLanternYear
      : null
  };
}

export function normalizePrincipleHistory(value = []) {
  return Array.isArray(value)
    ? value.filter(entry => entry && typeof entry === 'object')
    : [];
}

export function normalizePrincipleUses(value = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function normalizeCampaignPrincipleState(settlement = {}) {
  const principles = normalizePrinciples(settlement.principles);
  const history = normalizePrincipleHistory(settlement.principleHistory);
  const legacyBuilt = Array.isArray(settlement.builtInnovations)
    ? settlement.builtInnovations
    : [];

  if (!principles.death && legacyBuilt.includes('graves')) {
    principles.death = 'graves';
    if (!history.some(entry => entry.group === 'death' && entry.optionId === 'graves')) {
      history.push({
        type: 'principle-migration',
        group: 'death',
        optionId: 'graves',
        trigger: 'Migrated from legacy Graves innovation',
        lanternYear: Number.isFinite(settlement.lanternYear) ? settlement.lanternYear : null,
        timestamp: null
      });
    }
  }

  return {
    principles,
    pendingPrincipleChoice: normalizePendingPrincipleChoice(settlement.pendingPrincipleChoice),
    principleHistory: history,
    principleUses: normalizePrincipleUses(settlement.principleUses)
  };
}

export function hasCampaignPrinciple(settlement, group, optionId) {
  return normalizePrinciples(settlement?.principles)[group] === optionId;
}

export function getMissingPrincipleChoices(settlement = {}) {
  const principles = normalizePrinciples(settlement.principles);
  const pendingGroup = normalizePendingPrincipleChoice(settlement.pendingPrincipleChoice)?.group;
  const missing = [];
  const hasDeathTrigger =
    (settlement.deadSurvivors || 0) > 0 ||
    (settlement.graveHistory || []).length > 0 ||
    (settlement.pendingDeathResolutions || []).length > 0;
  const hasNewLifeTrigger =
    Boolean(settlement.pendingNewborn) ||
    (settlement.intimacyHistory || []).some(entry => entry?.newbornId || entry?.outcome === 'birth');
  const hasSocietyTrigger = (Number(settlement.lanternYear) || 0) >= 5;

  if (hasDeathTrigger && !principles.death && pendingGroup !== 'death') missing.push('death');
  if (hasNewLifeTrigger && !principles.newLife && pendingGroup !== 'newLife') missing.push('newLife');
  if (hasSocietyTrigger && !principles.society && pendingGroup !== 'society') missing.push('society');
  return missing;
}

export function createPendingPrincipleChoice(settlement = {}, group, trigger, affectedIds = []) {
  if (!PRINCIPLE_GROUPS.includes(group)) return settlement;
  const principles = normalizePrinciples(settlement.principles);
  if (principles[group]) return {
    ...settlement,
    principles
  };
  return {
    ...settlement,
    principles,
    pendingPrincipleChoice: {
      group,
      trigger: trigger || campaignPrincipleGroups[group]?.triggerLabel || group,
      affectedIds: unique(affectedIds),
      createdAtLanternYear: Number.isFinite(settlement.lanternYear)
        ? settlement.lanternYear
        : null
    }
  };
}

export function chooseCampaignPrinciple(
  settlement = {},
  group,
  optionId,
  timestamp = new Date().toISOString()
) {
  if (!PRINCIPLE_GROUPS.includes(group)) return settlement;
  const option = getCampaignPrinciple(optionId);
  const principles = normalizePrinciples(settlement.principles);
  if (!option || option.group !== group) return {
    ...settlement,
    principles
  };
  if (principles[group]) return {
    ...settlement,
    principles
  };

  const pending = normalizePendingPrincipleChoice(settlement.pendingPrincipleChoice);
  return {
    ...settlement,
    principles: {
      ...principles,
      [group]: optionId
    },
    pendingPrincipleChoice: pending?.group === group ? null : pending,
    principleHistory: [
      ...(Array.isArray(settlement.principleHistory) ? settlement.principleHistory : []),
      {
        type: 'principle-chosen',
        group,
        optionId,
        optionName: option.name,
        trigger: pending?.group === group ? pending.trigger : campaignPrincipleGroups[group]?.triggerLabel,
        affectedIds: pending?.group === group ? pending.affectedIds : [],
        lanternYear: Number.isFinite(settlement.lanternYear) ? settlement.lanternYear : null,
        timestamp
      }
    ],
    principleUses: normalizePrincipleUses(settlement.principleUses)
  };
}

export function getNextMissingPrincipleChoice(settlement = {}) {
  const [group] = getMissingPrincipleChoices(settlement);
  if (!group) return null;
  return {
    group,
    trigger: campaignPrincipleGroups[group]?.triggerLabel || group,
    options: getCampaignPrincipleOptions(group)
  };
}

export function getWorkTogetherMemoryCost(settlement = {}, originalCost = 0) {
  const cost = Math.max(0, Math.floor(Number(originalCost) || 0));
  const usedYear = settlement.principleUses?.[WORK_TOGETHER_KEY]?.lanternYear;
  const available = hasCampaignPrinciple(settlement, 'society', WORK_TOGETHER_KEY) &&
    cost === 1 &&
    usedYear !== settlement.lanternYear;
  return {
    originalCost: cost,
    discount: available ? 1 : 0,
    finalCost: available ? 0 : cost,
    usedThisYear: usedYear === settlement.lanternYear,
    applied: available
  };
}

export function markWorkTogetherUsed(settlement = {}, details = {}) {
  return {
    ...settlement,
    principleUses: {
      ...normalizePrincipleUses(settlement.principleUses),
      [WORK_TOGETHER_KEY]: {
        lanternYear: settlement.lanternYear,
        source: details.source || 'memory-action',
        timestamp: details.timestamp || new Date().toISOString()
      }
    }
  };
}
