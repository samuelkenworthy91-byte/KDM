import { BASIC_RESOURCE_IDS, resources } from '../data/resources.js';
import {
  generalFightingArts,
  getSurvivorMonsterBaneId
} from '../data/fightingArts.js';
import { disorders } from '../data/disorders.js';
import { injuries } from '../data/injuries.js';
import { scars } from '../data/scars.js';
import { removePanicFromSurvivor } from './deckLogic.js';

const BASIC_IDS = BASIC_RESOURCE_IDS;
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

function resourceName(resourceId) {
  return resources[resourceId]?.name || 'Unknown / Legacy';
}

function idLabel(id) {
  return String(id || 'Unknown / Legacy')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, letter => letter.toUpperCase());
}

function formatResourceGain(resourceId, amount = 1) {
  return `Gain ${resourceName(resourceId)} x${amount}.`;
}

export function formatEventEffect(key, value, context = {}) {
  switch (key) {
    case 'gainResource':
      return formatResourceGain(value.resourceId, value.amount || 1);
    case 'gainRandomResource':
      return `Gain ${value.amount || 1} random ${value.pool || 'hunt'} resource${(value.amount || 1) === 1 ? '' : 's'}.`;
    case 'gainSettlementMemory':
      return value > 0
        ? 'No Memory gained under the current economy.'
        : `Lose Memory x${Math.abs(value)}.`;
    case 'loseHp':
      return `Lose HP x${value}.`;
    case 'healHp':
      return `Heal HP x${value}.`;
    case 'healFull':
      return 'Heal to full HP.';
    case 'gainSurvival':
      return `Gain Survival x${value}.`;
    case 'addCardToDeck':
      return `Add ${idLabel(value)} to the deck.`;
    case 'addPanic':
      return `Gain Panic ${value}.`;
    case 'removePanic':
      return `Remove Panic ${typeof value === 'number' ? value : 1}.`;
    case 'gainFightingArt':
      return `Gain fighting art: ${idLabel(value)}.`;
    case 'gainRandomFightingArt':
      return 'Gain a random fighting art.';
    case 'gainTrait':
      return value?.type === 'monsterBaneCurrent'
        ? `Gain quarry knowledge for ${context.quarry?.name || 'the current quarry'}.`
        : `Gain trait: ${idLabel(value)}.`;
    case 'gainScar':
    case 'addScar':
      return `Gain scar: ${idLabel(value)}.`;
    case 'addInjury':
      return `Gain injury: ${idLabel(value)}.`;
    case 'addDisorder':
      return `Gain disorder: ${idLabel(value)}.`;
    case 'gainTemporaryPassive':
      return `Gain temporary passive: ${idLabel(value)}.`;
    case 'nextCombatStartBlock':
      return `Next combat: +${value} starting Block.`;
    case 'nextCombatMonsterBonusHp':
      return `Next combat: quarry +${value} HP.`;
    case 'nextCombatEnergyPenalty':
      return `Next combat: -${value} first-turn Energy.`;
    case 'monsterStartsWounded':
      return `The quarry starts wounded by ${value}.`;
    case 'nextCombatMonsterEnrage':
      return `Next combat: quarry attacks deal +${value}.`;
    case 'nextCombatFirstAttackBonus':
      return `Next combat: first attack deals +${value}.`;
    case 'gainCreatureResource':
      return 'Gain one resource from the current quarry.';
    case 'addQuarryRumour':
      return 'Record a quarry rumour.';
    case 'pendingSpecialChildTrait':
      return `Future newborn may gain ${idLabel(value)}.`;
    case 'gravesMemoryBonus':
      return `If the grave tradition applies, gain Memory x${value}.`;
    case 'chance':
      return `Chance ${value.percent}%: ${formatEventEffects(value.success, context).join(' ')} Otherwise: ${formatEventEffects(value.failure, context).join(' ')}`;
    default:
      if (typeof console !== 'undefined') console.warn(`Unknown event effect: ${key}`);
      return `Unknown effect: ${key}`;
  }
}

export function formatEventEffects(effects = {}, context = {}) {
  return Object.entries(effects).map(([key, value]) => formatEventEffect(key, value, context));
}

function appendUnknownEffects(next, effects, handledKeys) {
  Object.keys(effects || {}).forEach(key => {
    if (!handledKeys.has(key)) {
      next.appliedEffects.push(`Unknown effect: ${key}`);
      if (typeof console !== 'undefined') console.warn(`Unknown event effect: ${key}`);
    }
  });
}

function applyEffects(effects, state, context) {
  const handledKeys = new Set();
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
    handledKeys.add('gainResource');
    const { resourceId, amount = 1 } = effects.gainResource;
    next.runResources.push(...Array(amount).fill(resourceId));
    next.appliedEffects.push(formatResourceGain(resourceId, amount));
  }
  if (effects.gainRandomResource) {
    handledKeys.add('gainRandomResource');
    const { pool = 'any', amount = 1 } = effects.gainRandomResource;
    const choices = getPool(pool, context.quarry);
    for (let index = 0; index < amount; index += 1) {
      const resourceId = pick(choices);
      next.runResources.push(resourceId);
      next.appliedEffects.push(formatResourceGain(resourceId, 1));
    }
  }
  if (effects.gainSettlementMemory) {
    handledKeys.add('gainSettlementMemory');
    const minimumDelta = -(Number(context.settlementMemory) || 0);
    const delta = effects.gainSettlementMemory > 0
      ? 0
      : Math.max(minimumDelta, effects.gainSettlementMemory);
    next.settlementMemoryDelta += delta;
    next.appliedEffects.push(delta >= 0
      ? 'No Memory gained under the current economy.'
      : `Lose Memory x${Math.abs(delta)}.`);
  }
  if (effects.loseHp) {
    handledKeys.add('loseHp');
    next.runSurvivor.hp = Math.max(0, next.runSurvivor.hp - effects.loseHp);
    next.appliedEffects.push(`Lose HP x${effects.loseHp}.`);
  }
  if (effects.healHp) {
    handledKeys.add('healHp');
    const healed = next.runSurvivor.hp > 0
      ? Math.min(effects.healHp, next.runSurvivor.maxHp - next.runSurvivor.hp)
      : 0;
    next.runSurvivor.hp += healed;
    next.appliedEffects.push(`Heal HP x${healed}.`);
  }
  if (effects.healFull) {
    handledKeys.add('healFull');
    const healed = next.runSurvivor.hp > 0
      ? next.runSurvivor.maxHp - next.runSurvivor.hp
      : 0;
    if (next.runSurvivor.hp > 0) next.runSurvivor.hp = next.runSurvivor.maxHp;
    next.appliedEffects.push(`Heal to full HP. Restored ${healed}.`);
  }
  if (effects.gainSurvival) {
    handledKeys.add('gainSurvival');
    next.runSurvivor.survival = Math.min(
      next.runSurvivor.maxSurvival || 3,
      (next.runSurvivor.survival || 0) + effects.gainSurvival
    );
    next.appliedEffects.push(`Gain Survival x${effects.gainSurvival}.`);
  }
  if (effects.addCardToDeck) {
    handledKeys.add('addCardToDeck');
    next.runSurvivor.personalDeckAdditions.push({
      cardId: effects.addCardToDeck,
      sourceType: 'event',
      reason: 'Hunt event'
    });
    next.appliedEffects.push(`Add ${idLabel(effects.addCardToDeck)} to the deck.`);
  }
  if (effects.addPanic) {
    handledKeys.add('addPanic');
    next.runSurvivor.personalDeckAdditions.push(...Array(effects.addPanic).fill(null).map(() => ({
      cardId: 'panic',
      sourceType: 'curse',
      reason: 'Hunt event'
    })));
    next.appliedEffects.push(`Gain Panic ${effects.addPanic}.`);
  }
  if (effects.gainFightingArt) {
    handledKeys.add('gainFightingArt');
    if (!next.runSurvivor.fightingArts.includes(effects.gainFightingArt)) {
      next.runSurvivor.fightingArts.push(effects.gainFightingArt);
      next.appliedEffects.push(`Fighting art gained: ${effects.gainFightingArt}`);
    }
  }
  if (effects.gainRandomFightingArt) {
    handledKeys.add('gainRandomFightingArt');
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
    handledKeys.add('gainTrait');
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
    handledKeys.add('gainScar');
    const scarId = scars[effects.gainScar] ? effects.gainScar : null;
    if (scarId && !next.runSurvivor.scars.includes(scarId)) {
      next.runSurvivor.scars.push(scarId);
      next.appliedEffects.push(`Scar gained: ${scars[scarId].name}`);
    }
  }
  if (effects.addInjury) {
    handledKeys.add('addInjury');
    if (injuries[effects.addInjury]?.implemented && !next.runSurvivor.injuries.includes(effects.addInjury)) {
      next.runSurvivor.injuries.push(effects.addInjury);
      next.appliedEffects.push(`Injury gained: ${injuries[effects.addInjury].name}`);
    }
  }
  if (effects.addScar) {
    handledKeys.add('addScar');
    if (scars[effects.addScar]?.implemented && !next.runSurvivor.scars.includes(effects.addScar)) {
      next.runSurvivor.scars.push(effects.addScar);
      if (effects.addScar === 'boneSetWrong') {
        next.runSurvivor.maxHp += 1;
        next.runSurvivor.permanentModifiers.boneSetWrongApplied = true;
      }
      next.appliedEffects.push(`Scar gained: ${scars[effects.addScar].name}`);
    }
  }
  if (effects.addDisorder) {
    handledKeys.add('addDisorder');
    if (disorders[effects.addDisorder]?.implemented && !next.runSurvivor.disorders.includes(effects.addDisorder)) {
      next.runSurvivor.disorders.push(effects.addDisorder);
      next.appliedEffects.push(`Disorder gained: ${disorders[effects.addDisorder].name}`);
    }
  }
  if (effects.gainTemporaryPassive) {
    handledKeys.add('gainTemporaryPassive');
    next.runSurvivor.temporaryPassives.push(effects.gainTemporaryPassive);
    next.appliedEffects.push(`Temporary passive: ${effects.gainTemporaryPassive}`);
  }
  if (effects.nextCombatStartBlock) {
    handledKeys.add('nextCombatStartBlock');
    next.runModifiers.nextCombatStartBlock = (next.runModifiers.nextCombatStartBlock || 0) + effects.nextCombatStartBlock;
    next.appliedEffects.push(`Next combat: +${effects.nextCombatStartBlock} starting Block.`);
  }
  if (effects.nextCombatMonsterBonusHp) {
    handledKeys.add('nextCombatMonsterBonusHp');
    next.runModifiers.nextCombatMonsterBonusHp = (next.runModifiers.nextCombatMonsterBonusHp || 0) + effects.nextCombatMonsterBonusHp;
    next.appliedEffects.push(`Next combat: quarry +${effects.nextCombatMonsterBonusHp} HP.`);
  }
  if (effects.nextCombatEnergyPenalty) {
    handledKeys.add('nextCombatEnergyPenalty');
    next.runModifiers.nextCombatEnergyPenalty = (next.runModifiers.nextCombatEnergyPenalty || 0) + effects.nextCombatEnergyPenalty;
    next.appliedEffects.push(`Next combat: -${effects.nextCombatEnergyPenalty} first-turn Energy.`);
  }
  if (effects.monsterStartsWounded) {
    handledKeys.add('monsterStartsWounded');
    next.runModifiers.monsterStartsWounded = (next.runModifiers.monsterStartsWounded || 0) + effects.monsterStartsWounded;
    next.appliedEffects.push(`The quarry starts wounded by ${effects.monsterStartsWounded}.`);
  }
  if (effects.nextCombatMonsterEnrage) {
    handledKeys.add('nextCombatMonsterEnrage');
    next.runModifiers.monsterEnrage = (next.runModifiers.monsterEnrage || 0) + effects.nextCombatMonsterEnrage;
    next.appliedEffects.push(`Next combat: quarry attacks deal +${effects.nextCombatMonsterEnrage}.`);
  }
  if (effects.nextCombatFirstAttackBonus) {
    handledKeys.add('nextCombatFirstAttackBonus');
    next.runModifiers.firstAttackBonus = (next.runModifiers.firstAttackBonus || 0) + effects.nextCombatFirstAttackBonus;
    next.appliedEffects.push(`Next combat: first attack deals +${effects.nextCombatFirstAttackBonus}.`);
  }
  if (effects.removePanic) {
    handledKeys.add('removePanic');
    if (next.runSurvivor.disorders.includes('hoarder')) {
      next.appliedEffects.push('Hoarder prevented Panic removal');
    } else {
      const amount = typeof effects.removePanic === 'number' ? effects.removePanic : 1;
      const initialCount = (next.runSurvivor.personalDeckAdditions || []).length + (next.runSurvivor.permanentNegativeCards || []).length;
      
      const updated = removePanicFromSurvivor(next.runSurvivor, amount);
      next.runSurvivor = updated;
      
      const finalCount = (updated.personalDeckAdditions || []).length + (updated.permanentNegativeCards || []).length;
      const removedCount = initialCount - finalCount;

      if (removedCount > 0) {
        next.appliedEffects.push(`Remove Panic ${removedCount}.`);
      } else {
        next.appliedEffects.push('No Panic to remove');
      }
    }
  }
  if (effects.gainCreatureResource) {
    handledKeys.add('gainCreatureResource');
    const choices = getPool('monster', context.quarry);
    const resourceId = pick(choices);
    next.runResources.push(resourceId);
    next.appliedEffects.push(formatResourceGain(resourceId, 1));
  }
  if (effects.addQuarryRumour) {
    handledKeys.add('addQuarryRumour');
    next.quarryRumour = true;
    next.appliedEffects.push('Record a quarry rumour.');
  }
  if (effects.pendingSpecialChildTrait) {
    handledKeys.add('pendingSpecialChildTrait');
    next.pendingSpecialChildTrait = effects.pendingSpecialChildTrait;
    next.appliedEffects.push(`Future newborn may gain ${idLabel(effects.pendingSpecialChildTrait)}.`);
  }
  if (effects.gravesMemoryBonus) {
    handledKeys.add('gravesMemoryBonus');
    if (context.hasGravesUpgrade) {
      next.settlementMemoryDelta += effects.gravesMemoryBonus;
      next.appliedEffects.push(`Gain Memory x${effects.gravesMemoryBonus} from grave tradition.`);
    }
  }
  if (effects.chance) {
    handledKeys.add('chance');
    const branch = Math.random() * 100 < effects.chance.percent
      ? effects.chance.success
      : effects.chance.failure;
    return applyEffects(branch, next, context);
  }

  appendUnknownEffects(next, effects, handledKeys);
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

const SEVERE_INTIMACY_INJURIES = new Set([
  'brokenArm',
  'deepCut',
  'shatteredNerve',
  'bleedingTorso',
  'crushedChest',
  'brokenLeg'
]);

function clampChance(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function percentRow(label, value, category, source, options = {}) {
  return {
    label,
    value,
    category,
    source,
    type: options.type || category,
    detail: options.detail || '',
    protects: options.protects || []
  };
}

function getBuiltInnovationIds(settlement = {}) {
  return settlement.innovationDeckState?.builtInnovationIds || [];
}

function getParticipantRows(participants = []) {
  return participants.flatMap(participant => {
    const severeInjuries = (participant?.injuries || [])
      .filter(injuryId => SEVERE_INTIMACY_INJURIES.has(injuryId));
    if (!severeInjuries.length) return [];
    return [
      percentRow(
        `${participant.name || 'Participant'} untreated severe injury`,
        -0.1,
        'participant',
        'participant',
        {
          type: 'success',
          detail: severeInjuries
            .map(injuryId => injuries[injuryId]?.name || idLabel(injuryId))
            .join(', ')
        }
      )
    ];
  });
}

export function hasLoveJuice(settlement = {}) {
  return (settlement.stash?.loveJuice || 0) > 0;
}

export function spendLoveJuiceForIntimacy(settlement = {}) {
  if (!hasLoveJuice(settlement)) return null;
  return {
    ...settlement,
    stash: {
      ...(settlement.stash || {}),
      loveJuice: Math.max(0, (settlement.stash?.loveJuice || 0) - 1)
    }
  };
}

export function shouldLoveJuiceProtectIntimacy({ roll, tragedyChance, loveJuiceSelected } = {}) {
  return Boolean(loveJuiceSelected) && Number(roll) < Number(tragedyChance);
}

export function calculateIntimacyProjections(settlement = {}, innovationCards = {}, options = {}) {
  const baseSuccessChance = 0.35;
  const baseTragedyChance = 0.2;
  const participants = (options.participants || []).filter(Boolean);
  const loveJuiceSelected = Boolean(options.loveJuiceSelected);
  const memoryMitigationSelected = Boolean(options.mitigateRisk);
  const loveJuiceAvailable = hasLoveJuice(settlement);

  const modifierRows = [
    percentRow('Base chance', baseSuccessChance, 'base', 'base', {
      type: 'success'
    }),
    percentRow('Base tragedy risk', baseTragedyChance, 'base', 'base', {
      type: 'tragedy'
    })
  ];
  const modifiers = [];
  const builtIds = settlement.innovationDeckState?.builtInnovationIds || [];
  
  builtIds.forEach(id => {
    const card = innovationCards[id];
    if (card?.mechanicalEffects?.intimacySuccessBonus) {
      const row = percentRow(
        card.name,
        card.mechanicalEffects.intimacySuccessBonus,
        'innovation',
        'innovation',
        { type: 'success' }
      );
      modifiers.push(row);
      modifierRows.push(row);
    }
    if (card?.mechanicalEffects?.intimacyTragedyReduction) {
      const row = percentRow(
        card.name,
        -card.mechanicalEffects.intimacyTragedyReduction,
        'innovation',
        'innovation',
        { type: 'tragedy' }
      );
      modifiers.push(row);
      modifierRows.push(row);
    }
  });

  getParticipantRows(participants).forEach(row => {
    modifiers.push(row);
    modifierRows.push(row);
  });

  if (memoryMitigationSelected) {
    const row = percentRow('Memory mitigation', -0.1, 'risk', 'memory', {
      type: 'tragedy',
      detail: 'Spend 1 Memory to reduce tragedy risk for this attempt.'
    });
    modifiers.push(row);
    modifierRows.push(row);
  }

  if ((settlement.survivors || []).filter(survivor => survivor.alive !== false).length >= (settlement.population || 0)) {
    const row = percentRow('No open population capacity', -0.15, 'risk', 'population', {
      type: 'success',
      detail: 'Name or recover population space before relying on births.'
    });
    modifiers.push(row);
    modifierRows.push(row);
  }

  const loveJuiceRow = {
    label: loveJuiceSelected
      ? 'Love Juice protection selected'
      : loveJuiceAvailable
        ? 'Love Juice protection available'
        : 'Love Juice protection unavailable',
    value: 0,
    category: 'resource',
    source: 'loveJuice',
    type: 'protection',
    available: loveJuiceAvailable,
    selected: loveJuiceSelected,
    detail: loveJuiceSelected
      ? 'Consumes 1 Love Juice before the attempt. It prevents intimacy tragedy, death, severe wound, Panic, and resource-loss consequences from this attempt only.'
      : loveJuiceAvailable
        ? 'Spend 1 Love Juice before the attempt to prevent negative outcomes; it does not improve birth odds.'
        : 'No Love Juice in the settlement stash.',
    protects: ['tragedy', 'death', 'severeWound', 'panic', 'resourceLoss']
  };
  modifierRows.push(loveJuiceRow);

  const successBonus = modifiers
    .filter(m => m.type === 'success')
    .reduce((total, m) => total + m.value, 0);
  const tragedyReduction = modifiers
    .filter(m => m.type === 'tragedy')
    .reduce((total, m) => total + m.value, 0);

  const finalSuccessChance = clampChance(baseSuccessChance + successBonus, 0.05, 0.85);
  const finalTragedyChance = clampChance(baseTragedyChance + tragedyReduction, 0, 0.85);
  modifierRows.push(percentRow('Final chance', finalSuccessChance, 'final', 'final', {
    type: 'success'
  }));
  modifierRows.push(percentRow('Final tragedy risk', finalTragedyChance, 'final', 'final', {
    type: 'tragedy'
  }));

  return {
    baseSuccessChance,
    baseTragedyChance,
    modifiers,
    modifierRows,
    loveJuiceAvailable,
    loveJuiceSelected,
    memoryMitigationSelected,
    finalSuccessChance,
    finalTragedyChance,
    improvementTips: [
      !getBuiltInnovationIds(settlement).includes('language') && 'Innovate Language for +5% success.',
      !getBuiltInnovationIds(settlement).includes('cooking') && 'Innovate Cooking for +10% success.',
      !getBuiltInnovationIds(settlement).includes('ammonia') && 'Innovate Ammonia to reduce tragedy risk.',
      participants.some(participant => (participant?.injuries || []).some(injuryId => SEVERE_INTIMACY_INJURIES.has(injuryId))) &&
        'Treat severe participant injuries before attempting intimacy.',
      !loveJuiceAvailable && 'Find Love Juice from basic resource rewards to protect against tragedy.',
      loveJuiceAvailable && 'Use Love Juice when you want safety; it will not raise the birth chance.'
    ].filter(Boolean),
    outcomes: [
      { label: 'Tragedy / Wound', chance: finalTragedyChance, risk: true },
      { label: 'No Birth', chance: Math.max(0, 1 - finalSuccessChance - finalTragedyChance) },
      { label: 'New Life (Success)', chance: finalSuccessChance }
    ]
  };
}
