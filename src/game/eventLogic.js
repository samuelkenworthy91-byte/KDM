import { resources } from '../data/resources.js';
import { fightingArts } from '../data/fightingArts.js';

const pools = {
  basicMonster: Object.values(resources).filter(resource => ['basic', 'monster'].includes(resource.type)).map(resource => resource.id),
  monster: Object.values(resources).filter(resource => resource.type === 'monster').map(resource => resource.id),
  rare: Object.values(resources).filter(resource => resource.type === 'rare').map(resource => resource.id),
  all: Object.keys(resources)
};

function randomFrom(pool) {
  const ids = Array.isArray(pool) ? pool : pools[pool] || pools.all;
  return ids[Math.floor(Math.random() * ids.length)];
}

export function resolveEventChoice(choice, context = {}) {
  let runState = {
    ...context.runState,
    collectedResources: { ...context.runState.collectedResources },
    deck: [...context.runState.deck],
    fightingArts: [...context.runState.fightingArts]
  };
  let runBonus = { ...(context.runBonus || {}) };
  const appliedEffects = [];

  const applyEffect = effect => {
    if (effect.type === 'chance') {
      applyEffect(Math.random() < effect.chance ? effect.success : effect.failure);
      return;
    }

    switch (effect.type) {
      case 'gainResource':
        runState.collectedResources[effect.resourceId] =
          (runState.collectedResources[effect.resourceId] || 0) + effect.amount;
        appliedEffects.push(`+${effect.amount} ${resources[effect.resourceId]?.name || effect.resourceId}`);
        break;
      case 'gainRandomResource': {
        for (let count = 0; count < effect.amount; count += 1) {
          const resourceId = randomFrom(effect.pool);
          runState.collectedResources[resourceId] =
            (runState.collectedResources[resourceId] || 0) + 1;
          appliedEffects.push(`+1 ${resources[resourceId]?.name || resourceId}`);
        }
        break;
      }
      case 'gainSettlementMemory': {
        const graveBonus = effect.graveBonus && context.hasGraves ? effect.graveBonus : 0;
        const change = Math.max(
          -runState.settlementMemoryGained,
          effect.amount + graveBonus
        );
        runState.settlementMemoryGained += change;
        if (change !== 0) {
          appliedEffects.push(`${change > 0 ? '+' : ''}${change} Settlement Memory`);
        } else {
          appliedEffects.push('No Settlement Memory available to lose');
        }
        break;
      }
      case 'loseHp':
        runState.hp = Math.max(1, runState.hp - effect.amount);
        appliedEffects.push(`-${effect.amount} HP`);
        break;
      case 'healHp': {
        const healed = Math.min(effect.amount, runState.maxHp - runState.hp);
        runState.hp += healed;
        appliedEffects.push(`+${healed} HP`);
        break;
      }
      case 'gainSurvival':
        runState.survival = (runState.survival || 0) + effect.amount;
        appliedEffects.push(`+${effect.amount} Survival`);
        break;
      case 'addCardToDeck':
        runState.deck.push(effect.cardId);
        appliedEffects.push(`${effect.cardId === 'panic' ? 'Panic' : effect.cardId} added to deck`);
        break;
      case 'gainFightingArt':
      case 'gainTemporaryPassive':
        if (!runState.fightingArts.includes(effect.passiveId || effect.fightingArtId)) {
          runState.fightingArts.push(effect.passiveId || effect.fightingArtId);
        }
        appliedEffects.push(
          `${fightingArts[effect.passiveId || effect.fightingArtId]?.name || effect.passiveId || effect.fightingArtId} gained`
        );
        break;
      case 'nextCombatStartBlock':
        runBonus.nextCombatStartBlock = (runBonus.nextCombatStartBlock || 0) + effect.amount;
        appliedEffects.push(`Next combat: +${effect.amount} starting block`);
        break;
      case 'nextCombatMonsterBonusHp':
        runBonus.nextCombatMonsterBonusHp = (runBonus.nextCombatMonsterBonusHp || 0) + effect.amount;
        appliedEffects.push(`Next combat: monster +${effect.amount} HP`);
        break;
      case 'nextCombatEnergyPenalty':
        runBonus.nextCombatEnergyPenalty = (runBonus.nextCombatEnergyPenalty || 0) + effect.amount;
        appliedEffects.push(`Next combat: first turn -${effect.amount} energy`);
        break;
      case 'monsterStartsWounded':
        runBonus.monsterHpPenalty = (runBonus.monsterHpPenalty || 0) + effect.amount;
        appliedEffects.push(`Next combat: monster starts -${effect.amount} HP`);
        break;
      default:
        appliedEffects.push(`${effect.type} applied`);
    }
  };

  (choice.effects || []).forEach(applyEffect);
  return { runState, runBonus, appliedEffects };
}
