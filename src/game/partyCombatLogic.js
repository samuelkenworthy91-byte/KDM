import {
  applyMonsterIntent,
  applyEndTurnStatuses,
  createCombatState,
  getCounterWeakPointPreview,
  getMonsterIntentForResolution,
  playCard,
  useSurvivalAction
} from './combatLogic.js';
import { cards } from '../data/cards.js';
import { drawCards } from './deckLogic.js';
import { treatWound } from '../data/woundTables.js';
import {
  getTellBreakModifier,
  getWeakPointTellState,
  getWeaponSuitability
} from '../data/weakPoints.js';
import {
  isLivingPartyMember,
  selectMonsterTargets
} from './monsterTargeting.js';

const HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;

function syncMonster(members, monster) {
  return members.map(member => ({ ...member, monster }));
}

function livingIndexes(members) {
  return members
    .map((member, index) =>
      member.survivor.hp > 0 &&
      member.survivor.isAlive !== false &&
      member.survivor.alive !== false &&
      member.status !== 'dead'
        ? index
        : -1
    )
    .filter(index => index >= 0);
}

function buildTurnOrder(members) {
  return [
    ...livingIndexes(members).map(index => members[index].survivor.id),
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
    } else if (effect.effectType === 'heal') {
      const survivor = member.survivor;
      if (survivor.hp > 0) {
        const raw = Math.max(0, effect.value || 0);
        const amount = survivor.poison > 0 ? Math.floor(raw / 2) : raw;
        member = {
          ...member,
          survivor: {
            ...survivor,
            hp: Math.min(survivor.maxHp, survivor.hp + amount)
          }
        };
      }
    } else if (effect.effectType === 'injuryProtection') {
      member = { ...member, injuryProtection: (member.injuryProtection || 0) + effect.value };
    }
    if (effect.target === 'all') remaining.push({ ...effect, target: 'all' });
  });
  return { member, pendingPartyEffects: remaining.filter(effect => effect.target !== 'all') };
}

export function killSurvivorImmediately(member, source) {
  const destroyedBoundGear = [
    ...(member.destroyedBoundGear || []),
    ...(member.boundGear || [])
  ];
  return {
    ...member,
    status: 'dead',
    causeOfDeath: source,
    destroyedBoundGear,
    boundGear: [],
    hand: [],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    survivor: {
      ...member.survivor,
      hp: 0,
      alive: false,
      isAlive: false
    }
  };
}

function killZeroHpMembers(members, source) {
  return members.map(member =>
    member.survivor.hp <= 0 && member.status !== 'dead'
      ? killSurvivorImmediately(member, source)
      : member
  );
}

function removeTransientTargetFields(value = {}) {
  const {
    selectedTargetIds,
    targetId,
    currentTargetId,
    focusedTargetId,
    forcedMonsterTargetId,
    lastSelectedTargetId,
    pendingMonsterTargets,
    pendingTarget,
    targetMemory,
    markedTarget,
    lockTarget,
    targetQueue,
    ...rest
  } = value;
  return rest;
}

function clearMonsterTargetState(monster) {
  const clearedMonster = removeTransientTargetFields(monster);
  return {
    ...clearedMonster,
    currentIntent: null,
    intents: (clearedMonster.intents || []).map(removeTransientTargetFields)
  };
}

function clearCombatTargetState(state) {
  return {
    ...removeTransientTargetFields(state),
    monster: clearMonsterTargetState(state.monster),
    lastTargetId: null,
    lastTargetIds: [],
    lastTargetRule: null
  };
}

function formatTargetingLog(monster, intent, selection, members) {
  const names = selection.targets.map(targetId =>
    members.find(member => member.survivor.id === targetId)?.survivor.name
  ).filter(Boolean);
  if (selection.targetRule === 'all') {
    return `${monster.name} hits all living survivors.`;
  }
  if (!names.length) return `${monster.name} uses ${intent.name} without choosing a survivor.`;
  return `${monster.name} randomly targets ${names.join(' and ')}.`;
}

export function resolveMonsterTurn(state, { random = Math.random } = {}) {
  const previousTargetIds = [
    ...(state.lastTargetIds || []),
    ...(state.monster?.currentIntent?.selectedTargetIds || [])
  ];
  state = clearCombatTargetState(state);
  const intent = getMonsterIntentForResolution(state.monster, state.intentIndex);
  let selection = selectMonsterTargets({
    intent,
    monster: state.monster,
    party: state.members,
    combatState: state,
    random
  });
  if (!livingIndexes(state.members).length) {
    return { ...state, status: 'lost', activeCombatant: 'monster' };
  }
  const validTargetIds = selection.targets.filter(targetId =>
    state.members.some(member =>
      member.survivor.id === targetId && isLivingPartyMember(member)
    )
  );
  if (validTargetIds.length !== selection.targets.length) {
    selection = selectMonsterTargets({
      intent,
      monster: state.monster,
      party: state.members,
      combatState: state,
      random
    });
  } else {
    selection = { ...selection, targets: validTargetIds };
  }
  if (import.meta.env?.DEV) {
    const livingIds = state.members
      .filter(isLivingPartyMember)
      .map(member => member.survivor.id);
    console.debug(
      `Monster target roll: turn=${state.round + 1} ` +
      `living=[${livingIds.join(',')}] selected=[${selection.targets.join(',')}] ` +
      `previous=[${previousTargetIds.join(',')}] freshlyRolled=true`
    );
  }

  const selectedIntent = {
    ...intent,
    selectedTargetIds: [...selection.targets],
    selectedTargetRule: selection.targetRule,
    targetExplanation: selection.targetExplanation
  };
  let monster = {
    ...state.monster,
    currentIntent: selectedIntent
  };
  const targetIds = selection.targets;
  const resolutionIds = targetIds.length
    ? targetIds
    : [state.members[livingIndexes(state.members)[0]].survivor.id];
  let members = [...state.members];
  const intentMonster = monster;
  let resolvedMonster = monster;
  const resolutionLog = [];
  resolutionIds.forEach((targetId, resolutionIndex) => {
    const targetIndex = members.findIndex(member => member.survivor.id === targetId);
    if (targetIndex < 0) return;
    const targetResult = applyMonsterIntent(intentMonster, {
      ...members[targetIndex],
      monster: intentMonster,
      intentIndex: state.intentIndex,
      resolvedIntent: selectedIntent,
      status: 'playing'
    });
    if (resolutionIndex === 0) resolvedMonster = targetResult.monster;
    if (!targetIds.includes(targetId)) return;
    let resolvedTarget = targetResult;
    if (targetResult.survivor.hp <= 0) {
      resolvedTarget = killSurvivorImmediately(
        targetResult,
        `${state.monster.name}: ${intent.name}`
      );
      resolutionLog.push(`${targetResult.survivor.name} is killed by ${state.monster.name}.`);
    }
    members[targetIndex] = resolvedTarget;
  });
  monster = clearMonsterTargetState(resolvedMonster);
  members = syncMonster(members, monster);
  const living = livingIndexes(members);
  const targetingLog = formatTargetingLog(state.monster, intent, selection, state.members);

  if (!living.length) {
    return {
      ...state,
      members,
      monster,
      combatTurnOrder: buildTurnOrder(members),
      intentIndex: (state.intentIndex + 1) % monster.intents.length,
      activeCombatant: 'monster',
      status: 'lost',
      lastTargetId: null,
      lastTargetIds: [],
      lastTargetRule: null,
      combatLog: [...(state.combatLog || []), targetingLog, ...resolutionLog]
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
    lastTargetId: null,
    lastTargetIds: [],
    lastTargetRule: null,
    combatLog: [...(state.combatLog || []), targetingLog, ...resolutionLog],
    round: state.round + 1,
    selectedCombatTarget: state.selectedCombatTarget?.type === 'weakPoint' &&
      monster.weakPoints?.some(point =>
        point.id === state.selectedCombatTarget.id && !point.broken
      )
      ? state.selectedCombatTarget
      : { type: 'monster', id: monster.id || 'monster' }
  };
}

export function createPartyCombatState(monster, partyBonuses, pendingPartyEffects = []) {
  const members = partyBonuses.map(bonus => {
    const member = createCombatState(monster, bonus);
    member.survivor.id = bonus.survivor.id;
    if (
      member.survivor.hp <= 0 ||
      bonus.survivor.alive === false ||
      bonus.survivor.isAlive === false
    ) {
      return killSurvivorImmediately(
        member,
        bonus.survivor.causeOfDeath || 'Previous combat damage'
      );
    }
    return member;
  });
  const combatMonster = members[0]?.monster || monster;
  const firstIndex = livingIndexes(members)[0] ?? -1;
  const state = {
    monster: combatMonster,
    members: syncMonster(members, combatMonster),
    combatTurnOrder: buildTurnOrder(members),
    activeCombatant: firstIndex >= 0 ? members[firstIndex].survivor.id : 'monster',
    activePartyIndex: firstIndex,
    intentIndex: 0,
    round: 0,
    pendingPartyEffects,
    status: firstIndex >= 0 ? 'playing' : 'lost',
    lastTargetId: null,
    selectedCombatTarget: { type: 'monster', id: monster.id || 'monster' },
    lastAttackerId: null,
    lastWeakPointBreakerId: null,
    lastSupportUserId: null,
    lastTargetIds: [],
    lastTargetRule: null,
    combatLog: [`${monster.name} reveals a tell. The party acts first.`]
  };
  return state;
}

export function playPartyCard(cardIndex, state) {
  if (state.status !== 'playing' || state.activePartyIndex < 0) return state;
  if (!livingIndexes(state.members).includes(state.activePartyIndex)) return endPartyTurn(state);
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
  const activeBefore = state.members[state.activePartyIndex];
  const playedCard = activeBefore.hand[cardIndex];
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
      (monsterHpBefore > 0 && active.monster.hp <= 0),
    damageDealtThisCombat: (activeBefore.damageDealtThisCombat || 0) +
      Math.max(0, monsterHpBefore - active.monster.hp),
    weakPointsBrokenThisCombat: (activeBefore.weakPointsBrokenThisCombat || 0) +
      (active.monster.weakPoints || []).filter(point =>
        point.broken && !beforeWeakPoints.get(point.id)
      ).length,
    usedSupportThisCombat: activeBefore.usedSupportThisCombat ||
      playedCard?.type === 'skill' ||
      playedCard?.effects?.some(effect => effect.type === 'partyEffect')
  };
  const brokeWeakPoint = cleanedActive.weakPointsBrokenThisCombat >
    (activeBefore.weakPointsBrokenThisCombat || 0);
  const usedSupport = cleanedActive.usedSupportThisCombat && !activeBefore.usedSupportThisCombat;
  let members = syncMonster(
    state.members.map((member, index) => index === state.activePartyIndex ? cleanedActive : member),
    active.monster
  );
  members = killZeroHpMembers(members, `${active.survivor.name}: self-inflicted damage`);
  const living = livingIndexes(members);
  const activeDied = members[state.activePartyIndex]?.status === 'dead';
  const deathLog = activeDied
    ? [`${active.survivor.name} is killed by self-inflicted damage.`]
    : [];
  const nextLivingIndex = activeDied
    ? living.find(index => index > state.activePartyIndex)
    : state.activePartyIndex;
  const nextState = {
    ...state,
    members,
    monster: active.monster,
    combatTurnOrder: buildTurnOrder(members),
    pendingPartyEffects: [...(state.pendingPartyEffects || []), ...emitted],
    lastAttackerId: playedCard?.type === 'attack'
      ? active.survivor.id
      : state.lastAttackerId,
    lastWeakPointBreakerId: brokeWeakPoint
      ? active.survivor.id
      : state.lastWeakPointBreakerId,
    lastSupportUserId: usedSupport
      ? active.survivor.id
      : state.lastSupportUserId,
    combatLog: [
      ...(state.combatLog || []),
      ...(active.combatLogEntries || []),
      ...deathLog
    ],
    activePartyIndex: activeDied ? (nextLivingIndex ?? -1) : state.activePartyIndex,
    activeCombatant: activeDied
      ? (nextLivingIndex !== undefined ? members[nextLivingIndex].survivor.id : 'monster')
      : state.activeCombatant,
    status: living.length
      ? (active.monster.hp <= 0 ? 'won' : 'playing')
      : 'lost',
    selectedCombatTarget: selectedWeakPointId &&
      active.monster.weakPoints?.some(point => point.id === selectedWeakPointId && !point.broken)
      ? state.selectedCombatTarget
      : { type: 'monster', id: active.monster.id || 'monster' }
  };
  if (
    activeDied &&
    living.length &&
    nextLivingIndex === undefined &&
    active.monster.hp > 0
  ) {
    return resolveMonsterTurn({
      ...nextState,
      activePartyIndex: -1,
      activeCombatant: 'monster'
    });
  }
  return nextState;
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
  if (!livingIndexes(state.members).includes(state.activePartyIndex)) return endPartyTurn(state);
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
      (monsterHpBefore > 0 && active.monster.hp <= 0),
    damageDealtThisCombat: (state.members[state.activePartyIndex].damageDealtThisCombat || 0) +
      Math.max(0, monsterHpBefore - active.monster.hp),
    weakPointsBrokenThisCombat:
      (state.members[state.activePartyIndex].weakPointsBrokenThisCombat || 0) +
      (active.monster.weakPoints || []).filter(point =>
        point.broken && !beforeWeakPoints.get(point.id)
      ).length
  };
  const brokeWeakPoint = trackedActive.weakPointsBrokenThisCombat >
    (state.members[state.activePartyIndex].weakPointsBrokenThisCombat || 0);
  const members = syncMonster(
    state.members.map((member, index) => index === state.activePartyIndex ? trackedActive : member),
    active.monster
  );
  return {
    ...state,
    members,
    monster: active.monster,
    lastAttackerId: actionId === 'counter'
      ? active.survivor.id
      : state.lastAttackerId,
    lastWeakPointBreakerId: brokeWeakPoint
      ? active.survivor.id
      : state.lastWeakPointBreakerId,
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
  if (!livingIndexes(state.members).includes(state.activePartyIndex)) {
    const nextIndex = livingIndexes(state.members)[0];
    if (nextIndex === undefined) {
      return {
        ...state,
        status: 'lost',
        activePartyIndex: -1,
        activeCombatant: 'monster',
        combatTurnOrder: buildTurnOrder(state.members)
      };
    }
    return {
      ...state,
      activePartyIndex: nextIndex,
      activeCombatant: state.members[nextIndex].survivor.id,
      combatTurnOrder: buildTurnOrder(state.members)
    };
  }
  const quietMadness = state.members[state.activePartyIndex].disorders?.includes('quietMadness');
  const noAttackSurvival = quietMadness &&
    state.members[state.activePartyIndex].attacksPlayedThisTurn === 0 ? 1 : 0;
  const attackPanic = quietMadness &&
    state.members[state.activePartyIndex].attacksPlayedThisTurn >= 3 ? [cards.panic] : [];
  const turnLog = [];
  const tickedSurvivor = applyEndTurnStatuses(
    state.members[state.activePartyIndex].survivor,
    state.members[state.activePartyIndex].survivor.name,
    turnLog
  );
  const currentMember = {
    ...state.members[state.activePartyIndex],
    survivor: {
      ...tickedSurvivor,
      survival: Math.min(
        tickedSurvivor.maxSurvival,
        tickedSurvivor.survival + noAttackSurvival
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
      combatLog: [...(state.combatLog || []), ...turnLog],
      selectedCombatTarget: state.selectedCombatTarget
    };
  }

  return resolveMonsterTurn({
    ...state,
    members,
    combatLog: [...(state.combatLog || []), ...turnLog],
    activeCombatant: 'monster',
    activePartyIndex: -1
  });
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
