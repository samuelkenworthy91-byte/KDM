import {
  applyMonsterIntent,
  createCombatState,
  getCounterWeakPointPreview,
  playCard,
  useSurvivalAction
} from './combatLogic.js';
import { cards } from '../data/cards.js';
import { drawCards } from './deckLogic.js';
import { applyWoundToMember, treatWound } from '../data/woundTables.js';
import {
  getTellBreakModifier,
  getWeakPointTellState,
  getWeaponSuitability
} from '../data/weakPoints.js';

const HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;

function syncMonster(members, monster) {
  return members.map(member => ({ ...member, monster }));
}

function livingIndexes(members) {
  return members
    .map((member, index) => member.survivor.hp > 0 ? index : -1)
    .filter(index => index >= 0);
}

function buildTurnOrder(members) {
  return [
    ...members.filter(member => member.survivor.hp > 0).map(member => member.survivor.id),
    'monster'
  ];
}

function prepareTurn(member) {
  const discarded = [...member.discardPile, ...member.hand];
  const drawn = drawCards(member.drawPile, [], discarded, HAND_SIZE);
  return {
    ...member,
    survivor: {
      ...member.survivor,
      energy: Math.max(0, ENERGY_PER_TURN - (member.pendingEnergyPenalty || 0))
    },
    drawPile: drawn.deck,
    hand: drawn.hand,
    discardPile: drawn.discard,
    pendingEnergyPenalty: 0,
    monsterHitsThisTurn: 0,
    survivalActionsUsed: [],
    survivalFeedback: '',
    cardsPlayedThisTurn: 0,
    attacksPlayedThisTurn: 0,
    survivalSpentThisTurn: 0,
    blockGainedThisTurn: 0,
    cardDiscardedThisTurn: false,
    previousCardType: null,
    intentHintLevel: 0,
    nextCounterBonus: 0,
    pendingCounterConfig: null,
    weaponTurnTriggers: {},
    damageTakenLastTurn: member.damageTakenThisTurn || 0,
    damageTakenThisTurn: 0
  };
}

function applyPendingEffects(state, targetIndex) {
  const targetId = state.members[targetIndex]?.survivor.id;
  const effects = state.pendingPartyEffects || [];
  let member = state.members[targetIndex];
  const remaining = [];
  effects.forEach(effect => {
    const applies = effect.target === 'all' ||
      effect.target === targetId ||
      effect.target === 'nextPartyMember';
    if (!applies) {
      remaining.push(effect);
      return;
    }
    if (effect.effectType === 'block') {
      member = { ...member, survivor: { ...member.survivor, block: member.survivor.block + effect.value } };
    } else if (effect.effectType === 'survival') {
      member = {
        ...member,
        survivor: {
          ...member.survivor,
          survival: Math.min(member.survivor.maxSurvival, member.survivor.survival + effect.value)
        }
      };
    } else if (effect.effectType === 'draw') {
      const drawn = drawCards(member.drawPile, member.hand, member.discardPile, effect.value);
      member = { ...member, drawPile: drawn.deck, hand: drawn.hand, discardPile: drawn.discard };
    } else if (effect.effectType === 'reveal') {
      member = { ...member, intentHintLevel: Math.max(member.intentHintLevel || 0, effect.value) };
    } else if (effect.effectType === 'healAfterCombat') {
      member = { ...member, afterCombatHealing: (member.afterCombatHealing || 0) + effect.value };
    } else if (effect.effectType === 'injuryProtection') {
      member = { ...member, injuryProtection: (member.injuryProtection || 0) + effect.value };
    }
    if (effect.target === 'all') remaining.push({ ...effect, target: 'all' });
  });
  return { member, pendingPartyEffects: remaining.filter(effect => effect.target !== 'all') };
}

function chooseTargetIndex(state, intent) {
  const living = livingIndexes(state.members);
  if (!living.length) return -1;
  const forcedIndex = living.find(index =>
    state.members[index].survivor.id === state.forcedMonsterTargetId
  );
  if (forcedIndex !== undefined) return forcedIndex;
  const rule = intent?.target || intent?.targetingRule || 'front';
  if (rule === 'lowestHp') {
    return living.reduce((chosen, index) =>
      state.members[index].survivor.hp < state.members[chosen].survivor.hp ? index : chosen
    , living[0]);
  }
  if (rule === 'mostBlock') {
    return living.reduce((chosen, index) =>
      state.members[index].survivor.block > state.members[chosen].survivor.block ? index : chosen
    , living[0]);
  }
  if (rule === 'random') return living[Math.floor(Math.random() * living.length)];
  return living[0];
}

function resolveMonsterTurn(state) {
  const intent = state.monster.intents[state.intentIndex];
  const targetIndex = chooseTargetIndex(state, intent);
  if (targetIndex < 0) return { ...state, status: 'lost', activeCombatant: 'monster' };

  const targetResult = applyMonsterIntent(state.monster, {
    ...state.members[targetIndex],
    monster: state.monster,
    intentIndex: state.intentIndex,
    status: 'playing'
  });
  const damage = targetResult.damageTakenThisTurn || 0;
  const severeIntent = intent?.tags?.some(tag => ['severe', 'deadly'].includes(tag));
  const needsWound = targetResult.survivor.hp <= 0 || severeIntent || damage >= 8;
  let woundedTarget = targetResult;
  if (needsWound) {
    woundedTarget = applyWoundToMember(targetResult, {
      severe: severeIntent,
      damage,
      injuryProtection: targetResult.injuryProtection > 0,
      preventFatal: targetResult.traits?.includes('scarless') && !targetResult.scarlessUsed
    });
    if (targetResult.injuryProtection > 0) {
      woundedTarget.injuryProtection = Math.max(0, targetResult.injuryProtection - 1);
    }
    if (woundedTarget.survivor.hp === 1 &&
      woundedTarget.fightingArts?.includes('woundLaugh') &&
      !woundedTarget.woundLaughUsed) {
      woundedTarget.survivor.survival = Math.min(
        woundedTarget.survivor.maxSurvival,
        woundedTarget.survivor.survival + 1
      );
      woundedTarget.woundLaughUsed = true;
    }
  }
  let members = state.members.map((member, index) =>
    index === targetIndex ? woundedTarget : member
  );
  const monster = targetResult.monster;
  members = syncMonster(members, monster);
  const living = livingIndexes(members);

  if (!living.length) {
    return {
      ...state,
      members,
      monster,
      combatTurnOrder: buildTurnOrder(members),
      intentIndex: (state.intentIndex + 1) % monster.intents.length,
      activeCombatant: 'monster',
      status: 'lost',
      lastTargetId: members[targetIndex].survivor.id
    };
  }

  const firstIndex = living[0];
  members = members.map((member, index) => index === firstIndex ? prepareTurn(member) : member);
  const effectResult = applyPendingEffects({ ...state, members }, firstIndex);
  members = members.map((member, index) => index === firstIndex ? effectResult.member : member);
  state = { ...state, pendingPartyEffects: effectResult.pendingPartyEffects };
  return {
    ...state,
    members,
    monster,
    intentIndex: (state.intentIndex + 1) % monster.intents.length,
    combatTurnOrder: buildTurnOrder(members),
    activePartyIndex: firstIndex,
    activeCombatant: members[firstIndex].survivor.id,
    status: monster.hp <= 0 ? 'won' : 'playing',
    lastTargetId: members[targetIndex].survivor.id,
    round: state.round + 1,
    selectedCombatTarget: state.selectedCombatTarget?.type === 'weakPoint' &&
      monster.weakPoints?.some(point =>
        point.id === state.selectedCombatTarget.id && !point.broken
      )
      ? state.selectedCombatTarget
      : { type: 'monster', id: monster.id || 'monster' },
    forcedMonsterTargetId: null
  };
}

export function createPartyCombatState(monster, partyBonuses, pendingPartyEffects = []) {
  const members = partyBonuses.map(bonus => {
    const member = createCombatState(monster, bonus);
    member.survivor.id = bonus.survivor.id;
    return member;
  });
  const state = {
    monster,
    members: syncMonster(members, monster),
    combatTurnOrder: buildTurnOrder(members),
    activeCombatant: members[0]?.survivor.id || 'monster',
    activePartyIndex: members.length ? 0 : -1,
    intentIndex: 0,
    round: 0,
    pendingPartyEffects,
    status: 'playing',
    lastTargetId: null,
    selectedCombatTarget: { type: 'monster', id: monster.id || 'monster' },
    forcedMonsterTargetId: null,
    combatLog: [`${monster.name} reveals a tell. The party acts first.`]
  };
  return state;
}

export function playPartyCard(cardIndex, state) {
  if (state.status !== 'playing' || state.activePartyIndex < 0) return state;
  const partyHasMonsterBane = state.members.some(member =>
    member.survivor.hp > 0 && (
      member.hasMonsterBane ||
      member.fightingArts?.includes(`monsterBane_${state.monster.quarryId}`)
    )
  );
  const selectedWeakPointId = state.selectedCombatTarget?.type === 'weakPoint'
    ? state.selectedCombatTarget.id
    : null;
  const beforeWeakPoints = new Map(
    (state.monster.weakPoints || []).map(point => [point.id, point.broken])
  );
  const monsterHpBefore = state.monster.hp;
  const active = playCard(cardIndex, {
    ...state.members[state.activePartyIndex],
    monster: state.monster,
    intentIndex: state.intentIndex,
    selectedWeakPointId,
    hasMonsterBane: partyHasMonsterBane
  });
  const emitted = active.emittedPartyEffects || [];
  const cleanedActive = {
    ...active,
    emittedPartyEffects: [],
    hasMonsterBane: state.members[state.activePartyIndex].hasMonsterBane,
    brokeWeakPointThisHunt: state.members[state.activePartyIndex].brokeWeakPointThisHunt ||
      (active.monster.weakPoints || []).some(point => point.broken && !beforeWeakPoints.get(point.id)),
    dealtFinalBlowThisHunt: state.members[state.activePartyIndex].dealtFinalBlowThisHunt ||
      (monsterHpBefore > 0 && active.monster.hp <= 0)
  };
  const members = syncMonster(
    state.members.map((member, index) => index === state.activePartyIndex ? cleanedActive : member),
    active.monster
  );
  return {
    ...state,
    members,
    monster: active.monster,
    combatTurnOrder: buildTurnOrder(members),
    pendingPartyEffects: [...(state.pendingPartyEffects || []), ...emitted],
    forcedMonsterTargetId: active.forceNextMonsterTarget
      ? active.survivor.id
      : state.forcedMonsterTargetId,
    combatLog: [...(state.combatLog || []), ...(active.combatLogEntries || [])],
    status: active.monster.hp <= 0 ? 'won' : 'playing',
    selectedCombatTarget: selectedWeakPointId &&
      active.monster.weakPoints?.some(point => point.id === selectedWeakPointId && !point.broken)
      ? state.selectedCombatTarget
      : { type: 'monster', id: active.monster.id || 'monster' }
  };
}

export function selectPartyCombatTarget(target, state) {
  if (state.status !== 'playing') return state;
  if (!target || target.type === 'monster') {
    return {
      ...state,
      selectedCombatTarget: { type: 'monster', id: state.monster.id || 'monster' }
    };
  }
  if (target.type !== 'weakPoint') return state;
  const valid = state.monster.weakPoints?.some(
    weakPoint => weakPoint.id === target.id && !weakPoint.broken
  );
  return valid ? { ...state, selectedCombatTarget: target } : state;
}

export function selectPartyWeakPoint(weakPointId, state) {
  return selectPartyCombatTarget(
    weakPointId
      ? { type: 'weakPoint', id: weakPointId }
      : { type: 'monster', id: state.monster.id || 'monster' },
    state
  );
}

export function getPartyCounterPreview(state, weakPointId) {
  const active = state.members[state.activePartyIndex];
  if (!active) return null;
  return getCounterWeakPointPreview({
    ...active,
    monster: state.monster,
    intentIndex: state.intentIndex
  }, weakPointId);
}

export function getPartyWeakPointPreview(state, weakPointId) {
  const member = state.members[state.activePartyIndex];
  const weakPoint = state.monster.weakPoints?.find(point => point.id === weakPointId);
  if (!member || !weakPoint) return null;
  const card = member.hand.find(item =>
    item.type === 'attack' && !item.unplayable && item.cost <= member.survivor.energy
  );
  if (!card) {
    return {
      weaponMatch: 'Neutral',
      monsterDamage: 0,
      breakDamage: 0,
      tellState: getWeakPointTellState(
        weakPoint,
        state.monster.intents[state.intentIndex],
        state.monster.quarryId
      ),
      cardName: 'No playable attack'
    };
  }
  const baseDamage = card.effects.reduce((total, effect) => {
    if (effect.type === 'damage') return total + (effect.amount || 0);
    if (effect.type === 'multiHitDamage') return total + (effect.amount || 0) * (effect.hits || 1);
    if (effect.type === 'discardForDamage') return total + (effect.amount || effect.fallbackAmount || 0);
    return total;
  }, 0) + (member.survivor.strength || 0);
  const cardTags = [...(card.tags || []), ...(card.keywords || [])];
  let suitability = getWeaponSuitability(
    weakPoint,
    card.weaponType,
    cardTags
  );
  if (cardTags.includes('ignorePoorWeapon') && suitability.modifier < 0) {
    suitability = { ...suitability, modifier: 0, label: suitability.flatBonus > 0 ? 'Good' : 'Neutral' };
  }
  let tellState = getWeakPointTellState(
    weakPoint,
    state.monster.intents[state.intentIndex],
    state.monster.quarryId
  );
  if (cardTags.includes('exposeWeakPoint')) tellState = 'exposed';
  return {
    cardName: card.name,
    weaponMatch: suitability.label,
    monsterDamage: Math.max(0, Math.floor(baseDamage * weakPoint.monsterDamageMultiplier)),
    breakDamage: Math.max(0, Math.round(
      baseDamage * weakPoint.breakDamageMultiplier *
      (1 + suitability.modifier) * getTellBreakModifier(tellState)
    ) + suitability.flatBonus),
    tellState,
    riskSuppressed: ['open', 'exposed'].includes(tellState) || cardTags.includes('safeWeakPoint')
  };
}

export function treatPartyWound(memberIndex, location, treatmentType, state) {
  if (!['won', 'playing'].includes(state.status)) return state;
  const treatmentId = `${treatmentType}-${memberIndex}`;
  if (state.usedTreatments?.includes(treatmentId)) return state;
  const target = state.members[memberIndex];
  const woundState = target?.survivor.hitLocations?.[location];
  if (!target || !woundState?.wounded || woundState.severe) return state;
  const gearId = treatmentType === 'bandage' ? 'fieldBandages' : 'splintKit';
  const hasGear = state.members.some(member =>
    member.survivor.hp > 0 &&
    member.boundGear?.some(gear => gear.equipmentId === gearId)
  );
  if (!hasGear) return state;
  const members = state.members.map((member, index) => index === memberIndex
    ? { ...member, survivor: treatWound(member.survivor, location, treatmentType) }
    : member);
  return {
    ...state,
    members,
    usedTreatments: [...(state.usedTreatments || []), treatmentId]
  };
}

export function usePartySurvivalAction(actionId, state) {
  if (state.status !== 'playing' || state.activePartyIndex < 0) return state;
  const partyHasMonsterBane = state.members.some(member =>
    member.survivor.hp > 0 && (
      member.hasMonsterBane ||
      member.fightingArts?.includes(`monsterBane_${state.monster.quarryId}`)
    )
  );
  const selectedWeakPointId = state.selectedCombatTarget?.type === 'weakPoint'
    ? state.selectedCombatTarget.id
    : null;
  const beforeWeakPoints = new Map(
    (state.monster.weakPoints || []).map(point => [point.id, point.broken])
  );
  const monsterHpBefore = state.monster.hp;
  const active = useSurvivalAction(actionId, {
    ...state.members[state.activePartyIndex],
    monster: state.monster,
    intentIndex: state.intentIndex,
    selectedWeakPointId,
    hasMonsterBane: partyHasMonsterBane,
    combatLogEntries: []
  });
  const trackedActive = {
    ...active,
    brokeWeakPointThisHunt: state.members[state.activePartyIndex].brokeWeakPointThisHunt ||
      (active.monster.weakPoints || []).some(point => point.broken && !beforeWeakPoints.get(point.id)),
    dealtFinalBlowThisHunt: state.members[state.activePartyIndex].dealtFinalBlowThisHunt ||
      (monsterHpBefore > 0 && active.monster.hp <= 0)
  };
  const members = syncMonster(
    state.members.map((member, index) => index === state.activePartyIndex ? trackedActive : member),
    active.monster
  );
  return {
    ...state,
    members,
    monster: active.monster,
    forcedMonsterTargetId: active.forceNextMonsterTarget
      ? active.survivor.id
      : state.forcedMonsterTargetId,
    combatLog: [...(state.combatLog || []), ...(active.combatLogEntries || [])],
    status: active.monster.hp <= 0 ? 'won' : 'playing',
    selectedCombatTarget: selectedWeakPointId &&
      active.monster.weakPoints?.some(point => point.id === selectedWeakPointId && !point.broken)
      ? state.selectedCombatTarget
      : { type: 'monster', id: active.monster.id || 'monster' }
  };
}

export function endPartyTurn(state) {
  if (state.status !== 'playing' || state.activePartyIndex < 0) return state;
  const quietMadness = state.members[state.activePartyIndex].disorders?.includes('quietMadness');
  const noAttackSurvival = quietMadness &&
    state.members[state.activePartyIndex].attacksPlayedThisTurn === 0 ? 1 : 0;
  const attackPanic = quietMadness &&
    state.members[state.activePartyIndex].attacksPlayedThisTurn >= 3 ? [cards.panic] : [];
  const currentMember = {
    ...state.members[state.activePartyIndex],
    survivor: {
      ...state.members[state.activePartyIndex].survivor,
      survival: Math.min(
        state.members[state.activePartyIndex].survivor.maxSurvival,
        state.members[state.activePartyIndex].survivor.survival + noAttackSurvival
      )
    },
    discardPile: [
      ...state.members[state.activePartyIndex].discardPile,
      ...state.members[state.activePartyIndex].hand,
      ...attackPanic
    ],
    hand: []
  };
  let members = state.members.map((member, index) =>
    index === state.activePartyIndex ? currentMember : member
  );
  const nextIndex = livingIndexes(members).find(index => index > state.activePartyIndex);

  if (nextIndex !== undefined) {
    members = members.map((member, index) => index === nextIndex ? prepareTurn(member) : member);
    const effectResult = applyPendingEffects({ ...state, members }, nextIndex);
    members = members.map((member, index) => index === nextIndex ? effectResult.member : member);
    return {
      ...state,
      members,
      pendingPartyEffects: effectResult.pendingPartyEffects,
      activePartyIndex: nextIndex,
      activeCombatant: members[nextIndex].survivor.id,
      combatTurnOrder: buildTurnOrder(members),
      selectedCombatTarget: state.selectedCombatTarget
    };
  }

  return resolveMonsterTurn({ ...state, members, activeCombatant: 'monster', activePartyIndex: -1 });
}

export function validateTargetingBar(state = null, {
  attackTargetModalOpen = false,
  survivalCounterBypassedSelection = false,
  weakPointUsedSeparatePicker = false
} = {}) {
  const warnings = [];
  if (state) {
    const target = state.selectedCombatTarget;
    const valid = target?.type === 'monster' || (
      target?.type === 'weakPoint' &&
      state.monster?.weakPoints?.some(point => point.id === target.id && !point.broken)
    );
    if (!valid) warnings.push('selectedCombatTarget is invalid');
    if ('counterTargetWeakPointId' in state) warnings.push('Survival Counter still uses old target state');
    if ('selectedWeakPointId' in state) warnings.push('Weak-point targeting still uses old separate state');
  }
  if (attackTargetModalOpen) warnings.push('An attack card opened the old targeting modal');
  if (survivalCounterBypassedSelection) warnings.push('Survival Counter bypassed selectedCombatTarget');
  if (weakPointUsedSeparatePicker) warnings.push('Weak-point targeting used old separate logic');
  warnings.forEach(message => console.warn(`[Targeting bar] ${message}`));
  return warnings;
}
