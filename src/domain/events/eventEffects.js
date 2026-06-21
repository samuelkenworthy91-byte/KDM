import { createRunState } from '../schema/runStateSchema.js';
import { createSettlement } from '../schema/settlementSchema.js';

function amount(value, fallback = 1) {
  const number = Number(value);
  return Number.isFinite(number) && number !== 0 ? number : fallback;
}

export function fallbackEffectsForRoll(roll = 5) {
  if (roll <= 3) return [{ type: 'loseHp', amount: 1, label: 'Lose 1 HP' }];
  if (roll <= 7) return [{ type: 'gainSurvival', amount: 1, label: 'Gain 1 survival' }];
  return [{ type: 'gainResource', resourceId: 'bone', amount: 1, label: 'Gain 1 basic resource' }];
}

export function effectsToMechanicalEffects(effects, roll = 5) {
  const rawEffects = effects && typeof effects === 'object' ? effects : {};
  const mechanical = [];

  if (rawEffects.loseHp) mechanical.push({ type: 'loseHp', amount: amount(rawEffects.loseHp), label: `Lose ${amount(rawEffects.loseHp)} HP` });
  if (rawEffects.healHp) mechanical.push({ type: 'gainHp', amount: amount(rawEffects.healHp), label: `Recover ${amount(rawEffects.healHp)} HP` });
  if (rawEffects.gainSurvival) mechanical.push({ type: 'gainSurvival', amount: amount(rawEffects.gainSurvival), label: `Gain ${amount(rawEffects.gainSurvival)} survival` });
  if (rawEffects.loseSurvival) mechanical.push({ type: 'loseSurvival', amount: amount(rawEffects.loseSurvival), label: `Lose ${amount(rawEffects.loseSurvival)} survival` });
  if (rawEffects.addPanic) mechanical.push({ type: 'gainCondition', condition: 'panic', amount: amount(rawEffects.addPanic), label: `Gain ${amount(rawEffects.addPanic)} panic` });
  if (rawEffects.removePanic) mechanical.push({ type: 'removeCondition', condition: 'panic', amount: amount(rawEffects.removePanic), label: `Remove ${amount(rawEffects.removePanic)} panic` });
  if (rawEffects.nextCombatStartBlock) mechanical.push({ type: 'modifyNextFight', key: 'startBlock', amount: amount(rawEffects.nextCombatStartBlock), label: `Next fight starts with ${amount(rawEffects.nextCombatStartBlock)} block` });
  if (rawEffects.nextCombatMonsterEnrage) mechanical.push({ type: 'modifyNextFight', key: 'monsterEnrage', amount: amount(rawEffects.nextCombatMonsterEnrage), label: 'Next fight monster is enraged' });
  if (rawEffects.gainSettlementMemory) mechanical.push({ type: 'modifySettlementMemory', amount: amount(rawEffects.gainSettlementMemory), label: 'Settlement gains memory' });
  if (rawEffects.unlockQuarry) mechanical.push({ type: 'unlockQuarry', quarryId: rawEffects.unlockQuarry, label: `Unlock quarry clue: ${rawEffects.unlockQuarry}` });
  if (rawEffects.gainResource) {
    mechanical.push({
      type: 'gainResource',
      resourceId: rawEffects.gainResource.resourceId || 'bone',
      amount: amount(rawEffects.gainResource.amount),
      label: `Gain ${amount(rawEffects.gainResource.amount)} ${rawEffects.gainResource.resourceId || 'bone'}`
    });
  }
  if (rawEffects.loseResource) {
    mechanical.push({
      type: 'loseResource',
      resourceId: rawEffects.loseResource.resourceId || 'bone',
      amount: amount(rawEffects.loseResource.amount),
      label: `Lose ${amount(rawEffects.loseResource.amount)} ${rawEffects.loseResource.resourceId || 'bone'}`
    });
  }
  if (rawEffects.gainRandomResource) {
    mechanical.push({ type: 'gainResource', resourceId: 'bone', amount: amount(rawEffects.gainRandomResource.amount), label: 'Gain a random resource' });
  }

  return mechanical.length ? mechanical : fallbackEffectsForRoll(roll);
}

export function buildDeltas(mechanicalEffects) {
  const stateDelta = { survivorHp: 0, survivorSurvival: 0, conditions: [], nextFight: {}, unlocked: [] };
  const settlementDelta = { resources: [], memory: [] };

  mechanicalEffects.forEach(effect => {
    if (effect.type === 'loseHp') stateDelta.survivorHp -= effect.amount;
    if (effect.type === 'gainHp') stateDelta.survivorHp += effect.amount;
    if (effect.type === 'gainSurvival') stateDelta.survivorSurvival += effect.amount;
    if (effect.type === 'loseSurvival') stateDelta.survivorSurvival -= effect.amount;
    if (effect.type === 'gainCondition') stateDelta.conditions.push(effect.condition);
    if (effect.type === 'removeCondition') stateDelta.conditions = stateDelta.conditions.filter(condition => condition !== effect.condition);
    if (effect.type === 'modifyNextFight') stateDelta.nextFight[effect.key] = effect.amount;
    if (effect.type === 'unlockQuarry') stateDelta.unlocked.push(effect.quarryId);
    if (effect.type === 'gainResource') settlementDelta.resources.push({ id: effect.resourceId, amount: effect.amount });
    if (effect.type === 'loseResource') settlementDelta.resources.push({ id: effect.resourceId, amount: -effect.amount });
    if (effect.type === 'modifySettlementMemory') settlementDelta.memory.push('A hunt omen was recorded.');
  });

  return { stateDelta, settlementDelta };
}

export function applyEventDeltas({ runState, settlement, stateDelta, settlementDelta }) {
  const safeRunState = createRunState(runState);
  const safeSettlement = createSettlement(settlement || safeRunState.settlement);
  return {
    runState: {
      ...safeRunState,
      flags: { ...safeRunState.flags, nextFight: stateDelta?.nextFight || {} }
    },
    settlement: createSettlement({
      ...safeSettlement,
      resources: [...safeSettlement.resources, ...(settlementDelta?.resources || [])],
      memory: [...safeSettlement.memory, ...(settlementDelta?.memory || [])]
    })
  };
}
