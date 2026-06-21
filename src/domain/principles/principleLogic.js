import { campaignPrinciples, getCampaignPrincipleOptions } from '../../data/campaignPrinciples.js';
import { normaliseContentItem } from '../schema/contentSchemas.js';
import { createSettlement } from '../schema/settlementSchema.js';

export function getPrincipleChoices(group = 'death') {
  const options = getCampaignPrincipleOptions(group);
  return (options.length ? options : Object.values(campaignPrinciples))
    .filter(Boolean)
    .map(item => normaliseContentItem(item, 'principle'));
}

export function applyPrincipleChoice(settlement, principleInput) {
  const principle = normaliseContentItem(principleInput, 'principle');
  const safeSettlement = createSettlement(settlement);
  const existing = safeSettlement.principles.filter(item => item?.id !== principle.id);
  return createSettlement({
    ...safeSettlement,
    principles: [...existing, principle],
    memory: [...safeSettlement.memory, `Principle chosen: ${principle.name}`]
  });
}
