import { resources } from '../data/resources.js';
import {
  generalFightingArts,
  getSurvivorMonsterBaneId
} from '../data/fightingArts.js';
import { disorders } from '../data/disorders.js';
import { injuries } from '../data/injuries.js';
import { scars } from '../data/scars.js';

const BASIC_IDS = Object.values(resources).filter(item => item.type === 'basic').map(item => item.id);
const MONSTER_IDS = Object.values(resources).filter(item => item.type === 'monster' && !item.creatureId).map(item => item.id);
const RARE_IDS = Object.values(resources).filter(item => ['rare', 'strange'].includes(item.type) && !item.creatureId).map(item => item.id);

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getPool(pool, quarry) {
  if (Array.isArray(pool)) return pool;
  if (pool === 'basicOrMonster') return [...BASIC_IDS, ...MONSTER_IDS];
  const quarryResources = Object.values(resources)
    .filter(item => item.creatureId === quarry?.id)
    .map(item => item.id);
  if (pool === 'monster') {
    return quarryResources.length ? quarryResources : MONSTER_IDS;
  }
  if (pool === 'rare') {
    const quarryRare = quarryResources.filter(resourceId => ['rare', 'strange'].includes(resources[resourceId]?.type));
    return [...RARE_IDS, ...quarryRare];
  }
  return [...BASIC_IDS, ...MONSTER_IDS, ...RARE_IDS, ...quarryResources];
}

function applyEffects(effects, state, context) {
  const next = {
    runResources: [...state.runResources],
    runSurvivor: {
      ...state.runSurvivor,
      traits: [...(state.runSurvivor.traits || [])],
      fightingArts: [...(state.runSurvivor.fightingArts || [])],
      personalDeckAdditions: [...(state.runSurvivor.personalDeckAdditions || [])],
      injuries: [...(state.runSurvivor.injuries || [])],
      scars: [...(state.runSurvivor.scars || [])],
      disorders: [...(state.runSurvivor.disorders || [])],
      permanentModifiers: { ...(state.runSurvivor.permanentModifiers || {}) },
      temporaryPassives: [...(state.runSurvivor.temporaryPassives || [])]
    },
    runModifiers: { ...state.runModifiers },
    settlementMemoryDelta: state.settlementMemoryDelta || 0,
    appliedEffects: [...state.appliedEffects]
  };

  if (effects.gainResource) {
    const { resourceId, amount = 1 } = effects.gainResource;
    next.runResources.push(...Array(amount).fill(resourceId));
    next.appliedEffects.push(`+${amount} ${resources[resourceId]?.name || resourceId}`);
  }
  if (effects.gainRandomResource) {
    const { pool = 'any', amount = 1 } = effects.gainRandomResource;
    const choices = getPool(pool, context.quarry);
    for (let index = 0; index < amount; index += 1) {
      const resourceId = pick(choices);
      next.runResources.push(resourceId);
      next.appliedEffects.push(`+1 ${resources[resourceId]?.name || resourceId}`);
    }
  }
  if (effects.gainSettlementMemory) {
    const minimumDelta = -context.settlementMemory;
    const delta = Math.max(minimumDelta, effects.gainSettlementMemory);
    next.settlementMemoryDelta += delta;
    next.appliedEffects.push(`${delta >= 0 ? '+' : ''}${delta} settlementMemory`);
  }
  if (effects.loseHp) {
    next.runSurvivor.hp = Math.max(0, next.runSurvivor.hp - effects.loseHp);
    next.appliedEffects.push(`-${effects.loseHp} HP`);
  }
  if (effects.healHp) {
    const healed = next.runSurvivor.hp > 0
      ? Math.min(effects.healHp, next.runSurvivor.maxHp - next.runSurvivor.hp)
      : 0;
    next.runSurvivor.hp += healed;
    next.appliedEffects.push(`+${healed} HP`);
  }
  if (effects.healFull) {
    const healed = next.runSurvivor.hp > 0
      ? next.runSurvivor.maxHp - next.runSurvivor.hp
      : 0;
    if (next.runSurvivor.hp > 0) next.runSurvivor.hp = next.runSurvivor.maxHp;
    next.appliedEffects.push(`Healed to full (+${healed} HP)`);
  }
  if (effects.gainSurvival) {
    next.runSurvivor.survival = Math.min(
      next.runSurvivor.maxSurvival || 3,
      (next.runSurvivor.survival || 0) + effects.gainSurvival
    );
    next.appliedEffects.push(`+${effects.gainSurvival} Survival`);
  }
  if (effects.addCardToDeck) {
    next.runSurvivor.personalDeckAdditions.push({
      cardId: effects.addCardToDeck,
      sourceType: 'event',
      reason: 'Hunt event'
    });
    next.appliedEffects.push(`Card added: ${effects.addCardToDeck}`);
  }
  if (effects.addPanic) {
    next.runSurvivor.personalDeckAdditions.push(...Array(effects.addPanic).fill(null).map(() => ({
      cardId: 'panic',
      sourceType: 'curse',
      reason: 'Hunt event'
    })));
    next.appliedEffects.push(`Panic added${effects.addPanic > 1 ? ` x${effects.addPanic}` : ''}`);
  }
  if (effects.gainFightingArt) {
    if (!next.runSurvivor.fightingArts.includes(effects.gainFightingArt)) {
      next.runSurvivor.fightingArts.push(effects.gainFightingArt);
      next.appliedEffects.push(`Fighting art gained: ${effects.gainFightingArt}`);
    }
  }
  if (effects.gainRandomFightingArt) {
    const available = generalFightingArts.filter(art =>
      !next.runSurvivor.fightingArts.includes(art.id)
    );
    if (available.length) {
      const art = pick(available);
      next.runSurvivor.fightingArts.push(art.id);
      next.appliedEffects.push(`Fighting art gained: ${art.name}`);
    }
  }
  if (effects.gainTrait) {
    const trait = effects.gainTrait.type === 'monsterBaneCurrent'
      ? `monsterBane_${context.quarry.id}`
      : effects.gainTrait;
    if (effects.gainTrait.type === 'monsterBaneCurrent') {
      const existingBaneId = getSurvivorMonsterBaneId(next.runSurvivor);
      if (!existingBaneId) {
        next.runSurvivor.fightingArts.push(trait);
        next.appliedEffects.push(`Monster Bane gained: ${context.quarry.name}`);
      } else {
        next.appliedEffects.push('Monster Bane reward replaced: this survivor already has permanent Monster Bane knowledge.');
        const replacement = generalFightingArts.find(art =>
          !next.runSurvivor.fightingArts.includes(art.id)
        );
        if (replacement) {
          next.runSurvivor.fightingArts.push(replacement.id);
          next.appliedEffects.push(`Fighting art gained instead: ${replacement.name}`);
        } else {
          next.runSurvivor.survival = Math.min(
            next.runSurvivor.maxSurvival || 3,
            (next.runSurvivor.survival || 0) + 1
          );
          next.appliedEffects.push('+1 Survival instead');
        }
      }
    } else {
      if (!next.runSurvivor.traits.includes(trait)) next.runSurvivor.traits.push(trait);
      next.appliedEffects.push(`Trait gained: ${trait}`);
    }
  }
  if (effects.gainScar) {
    const scarId = scars[effects.gainScar] ? effects.gainScar : null;
    if (scarId && !next.runSurvivor.scars.includes(scarId)) {
      next.runSurvivor.scars.push(scarId);
      next.appliedEffects.push(`Scar gained: ${scars[scarId].name}`);
    }
  }
  if (effects.addInjury && injuries[effects.addInjury]?.implemented) {
    if (!next.runSurvivor.injuries.includes(effects.addInjury)) {
      next.runSurvivor.injuries.push(effects.addInjury);
      next.appliedEffects.push(`Injury gained: ${injuries[effects.addInjury].name}`);
    }
  }
  if (effects.addScar && scars[effects.addScar]?.implemented) {
    if (!next.runSurvivor.scars.includes(effects.addScar)) {
      next.runSurvivor.scars.push(effects.addScar);
      if (effects.addScar === 'boneSetWrong') {
        next.runSurvivor.maxHp += 1;
        next.runSurvivor.permanentModifiers.boneSetWrongApplied = true;
      }
      next.appliedEffects.push(`Scar gained: ${scars[effects.addScar].name}`);
    }
  }
  if (effects.addDisorder && disorders[effects.addDisorder]?.implemented) {
    if (!next.runSurvivor.disorders.includes(effects.addDisorder)) {
      next.runSurvivor.disorders.push(effects.addDisorder);
      next.appliedEffects.push(`Disorder gained: ${disorders[effects.addDisorder].name}`);
    }
  }
  if (effects.gainTemporaryPassive) {
    next.runSurvivor.temporaryPassives.push(effects.gainTemporaryPassive);
    next.appliedEffects.push(`Temporary passive: ${effects.gainTemporaryPassive}`);
  }
  if (effects.nextCombatStartBlock) {
    next.runModifiers.nextCombatStartBlock = (next.runModifiers.nextCombatStartBlock || 0) + effects.nextCombatStartBlock;
    next.appliedEffects.push(`Next combat: +${effects.nextCombatStartBlock} block`);
  }
  if (effects.nextCombatMonsterBonusHp) {
    next.runModifiers.nextCombatMonsterBonusHp = (next.runModifiers.nextCombatMonsterBonusHp || 0) + effects.nextCombatMonsterBonusHp;
    next.appliedEffects.push(`Next combat: monster +${effects.nextCombatMonsterBonusHp} HP`);
  }
  if (effects.nextCombatEnergyPenalty) {
    next.runModifiers.nextCombatEnergyPenalty = (next.runModifiers.nextCombatEnergyPenalty || 0) + effects.nextCombatEnergyPenalty;
    next.appliedEffects.push(`Next combat: -${effects.nextCombatEnergyPenalty} first-turn energy`);
  }
  if (effects.monsterStartsWounded) {
    next.runModifiers.monsterStartsWounded = (next.runModifiers.monsterStartsWounded || 0) + effects.monsterStartsWounded;
    next.appliedEffects.push(`Next combat: monster starts wounded for ${effects.monsterStartsWounded}`);
  }
  if (effects.nextCombatMonsterEnrage) {
    next.runModifiers.monsterEnrage = (next.runModifiers.monsterEnrage || 0) + effects.nextCombatMonsterEnrage;
    next.appliedEffects.push(`Next combat: monster attacks deal +${effects.nextCombatMonsterEnrage}`);
  }
  if (effects.nextCombatFirstAttackBonus) {
    next.runModifiers.firstAttackBonus = (next.runModifiers.firstAttackBonus || 0) + effects.nextCombatFirstAttackBonus;
    next.appliedEffects.push(`Next combat: first attack deals +${effects.nextCombatFirstAttackBonus}`);
  }
  if (effects.removePanic) {
    if (next.runSurvivor.disorders.includes('hoarder')) {
      next.appliedEffects.push('Hoarder prevented Panic removal');
    } else {
      const amount = typeof effects.removePanic === 'number' ? effects.removePanic : 1;
      let removedCount = 0;
      for (let i = 0; i < amount; i++) {
        const index = next.runSurvivor.personalDeckAdditions.findIndex(addition =>
          (typeof addition === 'string' ? addition : addition.cardId) === 'panic'
        );
        if (index >= 0) {
          next.runSurvivor.personalDeckAdditions.splice(index, 1);
          removedCount++;
        }
      }
      if (removedCount > 0) {
        next.appliedEffects.push(`Removed ${removedCount} Panic`);
      } else {
        next.appliedEffects.push('No Panic to remove');
      }
    }
  }
  if (effects.gainCreatureResource) {
    const choices = getPool('monster', context.quarry);
    const resourceId = pick(choices);
    next.runResources.push(resourceId);
    next.appliedEffects.push(`+1 ${resources[resourceId]?.name || resourceId}`);
  }
  if (effects.addQuarryRumour) {
    next.quarryRumour = true;
    next.appliedEffects.push('A new quarry rumour was recorded');
  }
  if (effects.pendingSpecialChildTrait) {
    next.pendingSpecialChildTrait = effects.pendingSpecialChildTrait;
    next.appliedEffects.push(`Pending child trait: ${effects.pendingSpecialChildTrait}`);
  }
  if (effects.gravesMemoryBonus && context.hasGravesUpgrade) {
    next.settlementMemoryDelta += effects.gravesMemoryBonus;
    next.appliedEffects.push(`+${effects.gravesMemoryBonus} settlementMemory from grave tradition`);
  }
  if (effects.chance) {
    const branch = Math.random() * 100 < effects.chance.percent
      ? effects.chance.success
      : effects.chance.failure;
    return applyEffects(branch, next, context);
  }

  return next;
}

export function resolveEvent(event, choice, state, context) {
  if (!event) return null;
  
  if (event.mode === 'automatic') {
    return {
      eventId: event.id,
      choiceId: 'automatic',
      outcomeText: event.autoOutcome.outcomeText,
      ...applyEffects(event.autoOutcome.effects || {}, { ...state, appliedEffects: [] }, context)
    };
  }

  if (choice === 'fallback') {
    return {
      eventId: event.id,
      choiceId: 'fallback',
      outcomeText: 'With no other choice, the party forces a desperate route.',
      ...applyEffects({ loseHp: 2 }, { ...state, appliedEffects: [] }, context)
    };
  }

  if (!choice) return null;
  return {
    eventId: event.id,
    choiceId: choice.id,
    outcomeText: choice.outcomeText,
    ...applyEffects(choice.effects || {}, { ...state, appliedEffects: [] }, context)
  };
}

export function calculateIntimacyProjections(settlement, innovationCards) {
  const baseSuccessChance = 0.5; // rolls 6-10
  const baseTragedyChance = 0.2; // rolls 1-2
  
  const modifiers = [];
  const builtIds = settlement.innovationDeckState?.builtInnovationIds || [];
  
  builtIds.forEach(id => {
    const card = innovationCards[id];
    if (card?.mechanicalEffects?.intimacySuccessBonus) {
      modifiers.push({
        name: card.name,
        value: card.mechanicalEffects.intimacySuccessBonus,
        type: 'success',
        source: 'innovation'
      });
    }
    if (card?.mechanicalEffects?.intimacyTragedyReduction) {
      modifiers.push({
        name: card.name,
        value: -card.mechanicalEffects.intimacyTragedyReduction,
        type: 'tragedy',
        source: 'innovation'
      });
    }
  });

  const successBonus = modifiers
    .filter(m => m.type === 'success')
    .reduce((total, m) => total + m.value, 0);
  const tragedyReduction = modifiers
    .filter(m => m.type === 'tragedy')
    .reduce((total, m) => total + m.value, 0);

  const finalSuccessChance = Math.min(0.95, baseSuccessChance + successBonus);
  const finalTragedyChance = Math.max(0.01, baseTragedyChance + tragedyReduction);

  return {
    baseSuccessChance,
    baseTragedyChance,
    modifiers,
    finalSuccessChance,
    finalTragedyChance,
    outcomes: [
      { label: 'Tragedy / Wound', chance: finalTragedyChance, risk: true },
      { label: 'No Birth', chance: Math.max(0, 1 - finalSuccessChance - finalTragedyChance) },
      { label: 'New Life (Success)', chance: finalSuccessChance }
    ]
  };
}

