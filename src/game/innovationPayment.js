import {
  resourceCanPayMaterial,
  resources
} from '../data/resources.js';
import { canSpendMemories, spendMemories } from './memoryEconomy.js';

export const INNOVATION_PAYMENT_MEMORY_COST = 1;
export const INNOVATION_PAYMENT_SLOTS = ['hide', 'organ', 'bone'];
const WARNING_TYPES = new Set(['rare', 'strange', 'level3Rare', 'legacy']);

function getSelectedCounts(payment = {}) {
  return INNOVATION_PAYMENT_SLOTS.reduce((counts, slot) => {
    const resourceId = payment?.[slot];
    if (!resourceId) return counts;
    return {
      ...counts,
      [resourceId]: (counts[resourceId] || 0) + 1
    };
  }, {});
}

export function getInnovationPaymentSlotChoices(stash = {}, slot, payment = {}) {
  const selectedCounts = getSelectedCounts(payment);
  const selectedForSlot = payment?.[slot];

  return Object.entries(stash)
    .filter(([resourceId, count]) => {
      const availableCount = Math.max(0, Number(count) || 0);
      const usedInOtherSlots = (selectedCounts[resourceId] || 0) -
        (selectedForSlot === resourceId ? 1 : 0);
      return (
        availableCount > usedInOtherSlots &&
        resourceCanPayMaterial(resourceId, slot)
      );
    })
    .map(([resourceId, count]) => ({
      resourceId,
      name: resources[resourceId]?.name || resourceId,
      count: Math.max(0, Number(count) || 0),
      tags: resources[resourceId]?.materialTags || [],
      warnings: getInnovationPaymentWarnings(resourceId)
    }))
    .sort((a, b) => {
      const aBasic = resources[a.resourceId]?.basicResource ? 0 : 1;
      const bBasic = resources[b.resourceId]?.basicResource ? 0 : 1;
      if (aBasic !== bBasic) return aBasic - bBasic;
      return a.name.localeCompare(b.name);
    });
}

export function buildInnovationPaymentOptions(stash = {}, payment = {}) {
  return Object.fromEntries(
    INNOVATION_PAYMENT_SLOTS.map(slot => [
      slot,
      getInnovationPaymentSlotChoices(stash, slot, payment)
    ])
  );
}

export function getInnovationPaymentWarnings(resourceId) {
  const resource = resources[resourceId];
  if (!resource) return ['Unknown legacy resource.'];

  const warnings = [];
  if (resource.creatureId) warnings.push('Quarry-specific resource.');
  if (WARNING_TYPES.has(resource.type)) {
    warnings.push(`${resource.type === 'level3Rare' ? 'Level 3 rare' : resource.type} resource.`);
  }
  if (resource.id === 'loveJuice') {
    warnings.push('Love Juice has an intimacy protection use.');
  }
  return warnings;
}

export function validateInnovationPayment(settlement = {}, payment = {}) {
  if (!canSpendMemories(settlement, INNOVATION_PAYMENT_MEMORY_COST)) {
    return { valid: false, reason: 'Need 1 Memory to attempt innovation.' };
  }

  const selectedCounts = getSelectedCounts(payment);
  for (const slot of INNOVATION_PAYMENT_SLOTS) {
    const resourceId = payment?.[slot];
    if (!resourceId) return { valid: false, reason: `Choose a ${slot} resource.` };
    if (!resourceCanPayMaterial(resourceId, slot)) {
      return {
        valid: false,
        reason: `${resources[resourceId]?.name || resourceId} cannot fill the ${slot} slot.`
      };
    }
  }

  for (const [resourceId, usedCount] of Object.entries(selectedCounts)) {
    const stashCount = Math.max(0, Number(settlement.stash?.[resourceId]) || 0);
    if (usedCount > stashCount) {
      return {
        valid: false,
        reason: `Not enough ${resources[resourceId]?.name || resourceId} for selected slots.`
      };
    }
  }

  return { valid: true, reason: '' };
}

export function applyInnovationPayment(settlement, payment, timestamp = new Date().toISOString()) {
  const validation = validateInnovationPayment(settlement, payment);
  if (!validation.valid) return null;

  const spent = spendMemories(settlement, INNOVATION_PAYMENT_MEMORY_COST, {
    source: 'innovation',
    description: 'Attempted an innovation.'
  });
  if (!spent) return null;
  const memoryPayment = spent.memoryHistory?.[0] || {};
  const paidResources = {
    memory: INNOVATION_PAYMENT_MEMORY_COST,
    originalMemoryCost: memoryPayment.originalCost ?? INNOVATION_PAYMENT_MEMORY_COST,
    workTogetherDiscount: memoryPayment.workTogetherDiscount ?? 0,
    finalMemoryCost: memoryPayment.finalCost ?? INNOVATION_PAYMENT_MEMORY_COST,
    hide: payment.hide,
    organ: payment.organ,
    bone: payment.bone
  };

  const stash = { ...spent.stash };
  INNOVATION_PAYMENT_SLOTS.forEach(slot => {
    const resourceId = payment[slot];
    stash[resourceId] = Math.max(0, (stash[resourceId] || 0) - 1);
  });

  return {
    ...spent,
    stash,
    temporarySettlementModifiers: {
      ...(spent.temporarySettlementModifiers || {}),
      delayedWork: false
    },
    paidResources,
    timestamp
  };
}
