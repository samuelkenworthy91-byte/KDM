import { getWorkTogetherMemoryCost } from './campaignPrincipleLogic.js';

function hasAny(values) {
  return Array.isArray(values) && values.length > 0;
}

function text(value, fallback = 'Not described.') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function memoryCostLabel(cost) {
  if (!Number.isFinite(cost)) return 'No Memory cost.';
  if (cost <= 0) return 'Free.';
  return `${cost} Memory.`;
}

export function getInnovationTypeLabel(innovation = {}) {
  if (innovation.presentationType) return innovation.presentationType;
  if (hasAny(innovation.actionUnlocks)) return 'Settlement Action';
  if (hasAny(innovation.unlocksBuildings)) return 'Building Unlock';
  if (hasAny(innovation.addsToInnovationPool)) return 'Deck Unlock';
  return 'Passive';
}

export function getInnovationEffectText(innovation = {}) {
  return text(
    innovation.effectSummary ||
      innovation.playerSummary ||
      innovation.settlementBoostSummary ||
      innovation.effects?.[0],
    'This innovation has no current rules summary.'
  );
}

export function getInnovationWhereText(innovation = {}) {
  return text(
    innovation.actionLocation ||
      innovation.uiDestination ||
      innovation.howToUse,
    'Settlement > Innovations'
  );
}

export function getInnovationCostLimitText(innovation = {}) {
  const parts = [];
  if (Number.isFinite(innovation.actionMemoryCost)) {
    parts.push(`Action cost: ${memoryCostLabel(innovation.actionMemoryCost)}`);
  }
  if (innovation.costType === 'innovationAttempt' && innovation.innovationCost) {
    parts.push(`Innovation attempt cost: ${memoryCostLabel(innovation.innovationCost.memory)} plus required materials.`);
  }
  if (innovation.limit) parts.push(`Limit: ${innovation.limit}`);
  return parts.length ? parts.join(' ') : 'Cost/limit: None.';
}

export function isWorkTogetherEligibleInnovation(innovation = {}) {
  if (Number.isFinite(innovation.actionMemoryCost)) {
    return innovation.actionMemoryCost === 1 || innovation.innovationCost?.memory === 1;
  }
  return innovation.costType === 'innovationAttempt' && innovation.innovationCost?.memory === 1;
}

export function getInnovationWorkTogetherEligibilityLabel(innovation = {}) {
  if (Number.isFinite(innovation.actionMemoryCost)) {
    if (innovation.actionMemoryCost === 1) return 'Yes';
    if (innovation.innovationCost?.memory === 1) return 'Innovation attempt only';
    return 'No';
  }
  return isWorkTogetherEligibleInnovation(innovation) ? 'Yes' : 'No';
}

export function getWorkTogetherDisplay(settlement = {}, cost = 0) {
  const preview = getWorkTogetherMemoryCost(settlement, cost);
  return {
    ...preview,
    eligible: cost === 1,
    label: cost === 1
      ? `Original cost: ${preview.originalCost} Memory. Work Together discount: -${preview.discount}. Final cost: ${preview.finalCost} Memory. ${preview.usedThisYear ? 'Already used this Lantern Year.' : 'Available if Work Together is chosen and unused this Lantern Year.'}`
      : 'Work Together eligible: No'
  };
}

export function getInnovationPlayerFields(innovation = {}, settlement = {}) {
  const workTogetherCost = Number.isFinite(innovation.actionMemoryCost)
    ? (innovation.actionMemoryCost === 1 ? innovation.actionMemoryCost : innovation.innovationCost?.memory)
    : innovation.innovationCost?.memory;
  return {
    type: getInnovationTypeLabel(innovation),
    effect: getInnovationEffectText(innovation),
    where: getInnovationWhereText(innovation),
    costLimit: getInnovationCostLimitText(innovation),
    permanent: innovation.permanent === false ? 'No' : 'Yes',
    workTogetherEligible: getInnovationWorkTogetherEligibilityLabel(innovation),
    workTogether: getWorkTogetherDisplay(settlement, Number(workTogetherCost) || 0),
    flavor: text(innovation.flavorText || innovation.description, '')
  };
}

export function getPrinciplePlayerFields(principle = {}, settlement = {}) {
  const groupLabel = principle.group
    ? `${principle.group === 'newLife' ? 'New Life' : principle.group[0].toUpperCase() + principle.group.slice(1)}`
    : 'Campaign';
  return {
    type: `Campaign Principle - ${groupLabel}`,
    effect: text(principle.effectSummary || principle.mechanicalSummary || principle.playerSummary),
    where: text(principle.whereToUse || principle.whereItMatters, 'Automatically when its trigger applies.'),
    costLimit: principle.limit || 'Cost/limit: None.',
    permanent: principle.permanent === false ? 'No' : 'Yes',
    workTogetherEligible: principle.id === 'workTogether' ? 'Yes, for exact 1-Memory costs.' : 'No',
    workTogether: principle.id === 'workTogether' ? getWorkTogetherDisplay(settlement, 1) : null,
    flavor: text(principle.flavorText || principle.playerSummary, '')
  };
}
