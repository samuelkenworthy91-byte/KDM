import { cards } from '../data/cards.js';
import { monsters } from '../data/monsters.js';
import { findMonsterSurvivorReward } from '../data/monsterSurvivorRewards.js';
import { fightingArts } from '../data/fightingArts.js';
import { createWeaponProficiency } from '../data/weaponProficiency.js';
import { buildRunDeck, drawCards, shuffleCards } from './deckLogic.js';
import { createHitLocations } from '../data/woundTables.js';
import {
  getTellBreakModifier,
  getWeakPointTellState,
  getWeaponSuitability,
  rollHarvestQuality
} from '../data/weakPoints.js';
import { getIntentTargetRule } from './monsterTargeting.js';

const HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;

function getArtPassiveEffects(artIds = []) {
  return artIds.flatMap(id => fightingArts[id]?.passiveEffects || []);
}

export function applyDamageToSurvivor({
  survivor,
  amount,
  ignoreBlock = false,
  directHit = true
}) {
  let incoming = Math.max(0, Number(amount) || 0);
  let nextGuarded = survivor.guarded || 0;
  let nextStaggered = survivor.staggered || 0;
  let nextVulnerable = survivor.vulnerable || 0;

  if (directHit && nextStaggered > 0 && incoming > 0) {
    incoming *= 2;
    nextStaggered -= 1;
  }

  if (directHit && nextVulnerable > 0 && incoming > 0) {
    incoming = Math.ceil(incoming * 1.5);
    nextVulnerable -= 1;
  }

  if (directHit && nextGuarded > 0 && incoming > 0) {
    incoming = Math.max(1, incoming - 2);
    nextGuarded -= 1;
  }

  const availableBlock = Math.max(0, Number(survivor.block) || 0);
  const absorbed = ignoreBlock ? 0 : Math.min(availableBlock, incoming);
  const damage = incoming - absorbed;
  const nextHp = Math.max(0, survivor.hp - damage);
  const lethal = survivor.hp > 0 && nextHp <= 0;

  return {
    survivor: {
      ...survivor,
      block: ignoreBlock ? availableBlock : availableBlock - absorbed,
      hp: nextHp,
      guarded: nextGuarded,
      staggered: nextStaggered,
      vulnerable: nextVulnerable,
      ...(lethal ? { alive: false, isAlive: false } : {})
    },
    absorbed,
    damage,
    lethal
  };
}

function applyDamage(target, amount) {
  return applyDamageToSurvivor({ survivor: target, amount }).survivor;
}

function applyDirectDamage(target, amount) {
  const nextHp = Math.max(0, target.hp - amount);
  return {
    ...target,
    hp: nextHp,
    ...(target.hp > 0 && nextHp <= 0 ? { alive: false, isAlive: false } : {})
  };
}

function statusAmount(effect, fallback = 1) {
  return Math.max(0, Number(effect?.amount ?? effect?.value ?? fallback) || 0);
}

function reduceStatus(value, amount = 1) {
  return Math.max(0, (Number(value) || 0) - amount);
}

function applyHealingToSurvivor(survivor, amount, { revive = false } = {}) {
  if (!revive && (survivor.hp <= 0 || survivor.alive === false || survivor.isAlive === false)) {
    return { survivor, healed: 0 };
  }
  const maxHp = survivor.maxHp || survivor.hp || 0;
  const raw = Math.max(0, Number(amount) || 0);
  const adjusted = survivor.poison > 0 ? Math.floor(raw / 2) : raw;
  const nextHp = Math.min(maxHp, (survivor.hp || 0) + adjusted);
  return {
    survivor: {
      ...survivor,
      hp: nextHp,
      ...(revive && nextHp > 0 ? { alive: true, isAlive: true } : {})
    },
    healed: Math.max(0, nextHp - (survivor.hp || 0))
  };
}

function applyStatusToCombatant(combatant, type, amount, options = {}) {
  const value = Math.max(1, Number(amount) || 1);
  switch (type) {
    case 'bleed':
    case 'burn':
    case 'poison':
    case 'vulnerable':
    case 'staggered':
    case 'guarded':
    case 'snared':
    case 'shock':
    case 'blind':
    case 'prepared':
    case 'salvage':
    case 'testBonus':
    case 'consequenceReduction':
      return { ...combatant, [type]: (combatant[type] || 0) + value };
    case 'doom':
      return {
        ...combatant,
        doom: combatant.doom > 0 && !options.stack ? Math.min(combatant.doom, value) : (combatant.doom || 0) + value
      };
    case 'marked':
      return { ...combatant, marked: (combatant.marked || 0) + value };
    case 'exposed':
      return { ...combatant, exposed: (combatant.exposed || 0) + value };
    default:
      return combatant;
  }
}

export function applyEndTurnStatuses(combatant, label, logEntries = []) {
  let next = { ...combatant };
  if (next.bleed > 0) {
    const damage = next.bleed;
    next = applyDirectDamage(next, damage);
    next.bleed = reduceStatus(next.bleed);
    logEntries.push(`${label} takes ${damage} true damage from Bleed.`);
  }
  if (next.burn > 0) {
    const damage = next.burn;
    const guardedBefore = next.guarded || 0;
    const absorbed = Math.min(next.block || 0, damage);
    const remaining = damage - absorbed;
    next = {
      ...next,
      block: Math.max(0, (next.block || 0) - absorbed),
      guarded: guardedBefore > 0 ? guardedBefore - 1 : guardedBefore
    };
    if (remaining > 0) next = applyDirectDamage(next, remaining);
    next.burn = reduceStatus(next.burn);
    logEntries.push(`${label} takes ${damage} Burn damage; protection burns away.`);
  }
  if (next.poison > 0) {
    const damage = next.poison;
    const effectiveBlock = Math.max(0, (next.block || 0) - Math.floor((next.block || 0) / 2));
    const absorbed = Math.min(effectiveBlock, damage);
    const remaining = damage - absorbed;
    next = { ...next, block: Math.max(0, (next.block || 0) - absorbed) };
    if (remaining > 0) next = applyDirectDamage(next, remaining);
    next.poison = reduceStatus(next.poison);
    logEntries.push(`${label} takes ${damage} Poison damage through half block.`);
  }
  if (next.doom > 0) {
    const countdown = reduceStatus(next.doom);
    next = { ...next, doom: countdown };
    if (countdown === 0) {
      next = applyDirectDamage(next, 10);
      logEntries.push(`${label}'s Doom ruptures for 10 true damage.`);
    }
  }
  return next;
}

function normalizeEffectType(type) {
  const aliases = {
    bleedMonster: 'bleedTarget',
    poisonMonster: 'poisonTarget',
    burnMonster: 'burnTarget',
    doomMonster: 'doomTarget',
    vulnerableMonster: 'vulnerableTarget',
    staggerMonster: 'staggerTarget',
    staggeredMonster: 'staggerTarget',
    guardMonster: 'guardTarget',
    guardedMonster: 'guardTarget',
    markMonster: 'markTarget',
    markedMonster: 'markTarget',
    exposeMonster: 'exposeTarget',
    exposedMonster: 'exposeTarget',
    snareMonster: 'snareTarget',
    snaredMonster: 'snareTarget',
    shockMonster: 'shockTarget',
    blindMonster: 'blindTarget',
    guardedSurvivor: 'guardSelf',
    guardSurvivor: 'guardSelf',
    prepared: 'preparedSelf',
    salvage: 'salvageSelf',
    heal: 'healSelf'
  };
  return aliases[type] || type;
}

function getCombatStatus(survivor, monster) {
  if (monster.hp <= 0) {
    return 'won';
  }

  if (survivor.hp <= 0) {
    return 'lost';
  }

  return 'playing';
}

export function createCombatState(monsterOverride = monsters.whiteLion, runBonus = {}) {
  const extraMaxHp = runBonus.extraMaxHp || 0;
  const arts = runBonus.survivor?.fightingArts || [];
  const artPassives = getArtPassiveEffects(arts);
  const injuries = runBonus.survivor?.injuries || [];
  const scars = runBonus.survivor?.scars || [];
  const disorders = runBonus.survivor?.disorders || [];
  const traits = runBonus.survivor?.traits || [];
  const monsterRewardTraits = traits
    .map(findMonsterSurvivorReward)
    .filter(reward => reward?.type === 'trait')
    .map(reward => reward.mechanicalEffect.trait);
  const strength = (runBonus.firstCombatStrength || 0) + (runBonus.survivor?.strength || 0);
  const handSize = HAND_SIZE + (runBonus.extraFirstTurnDraw || 0) + (arts.includes('focusedBreath') ? 1 : 0);
  const maxHp = runBonus.survivor?.maxHp || 30;
  const currentHp = runBonus.survivor?.hp ?? maxHp;
  const quarryId = monsterOverride.quarryId;
  const conditionSurvival =
    (scars.includes('deadEyeCalm') ? 1 : 0) +
    (scars.includes('lionScar') && quarryId === 'paleHuntLion' ? 1 : 0) +
    (scars.includes('ashMarked') && quarryId === 'ashPhoenix' ? 1 : 0) +
    (disorders.includes('lanternFixation') && quarryId === 'ashPhoenix' ? 1 : 0);
  const survivor = {
    name: runBonus.survivor?.name || 'Survivor',
    hp: Math.min(currentHp + extraMaxHp, maxHp + extraMaxHp),
    maxHp: maxHp + extraMaxHp,
    block:
      (runBonus.startingBlock || 0) +
      (traits.includes('scarless') ? 1 : 0) +
      (arts.includes('tumble') ? 3 : 0) +
      (arts.includes('scarTissue') ? 2 : 0) +
      artPassives
        .filter(effect => effect.type === 'frontPositionBlock' && (runBonus.partyPosition || 0) === 0)
        .reduce((total, effect) => total + (effect.value || 0), 0) +
      artPassives
        .filter(effect => effect.type === 'firstVagueTellBlock' && !runBonus.hasMonsterBane)
        .reduce((total, effect) => total + (effect.value || 0), 0) +
      (scars.includes('hornBruise') && quarryId === 'wailingAntelope' ? 2 : 0) +
      (disorders.includes('paranoia') && !runBonus.hasMonsterBane ? 3 : 0),
    energy: Math.max(0, ENERGY_PER_TURN - (runBonus.firstTurnEnergyPenalty || 0)),
    strength,
    maxSurvival: Math.max(1, runBonus.survivor?.maxSurvival || 3),
    survival: Math.min(
      Math.max(1, runBonus.survivor?.maxSurvival || 3),
      (runBonus.survivor?.survival || 0) + conditionSurvival
        + artPassives
          .filter(effect =>
            effect.type === 'bodyScarSurvival' && scars.some(id => ['lionScar', 'thunderScar'].includes(id))
          )
          .reduce((total, effect) => total + (effect.value || 0), 0)
    ),
    hitLocations: createHitLocations(runBonus.survivor?.hitLocations),
    treatmentNotes: [...(runBonus.survivor?.treatmentNotes || [])],
    bleed: 0,
    burn: 0,
    poison: 0,
    doom: 0,
    vulnerable: 0,
    staggered: 0,
    guarded: 0,
    marked: false,
    exposed: false,
    snared: 0,
    shock: 0,
    blind: 0,
    prepared: 0,
    salvage: 0,
    testBonus: 0,
    consequenceReduction: 0
  };
  const monster = {
    ...monsterOverride,
    hp: Math.max(
      1,
      (monsterOverride.hp || monsterOverride.maxHp) +
        (runBonus.monsterBonusHp || 0) -
        (runBonus.monsterStartsWounded || 0)
    ),
    block: monsterOverride.block ?? 0,
    maxHp: (monsterOverride.maxHp ?? monsterOverride.hp) + (runBonus.monsterBonusHp || 0),
    bleed: 0,
    burn: 0,
    poison: 0,
    doom: 0,
    vulnerable: 0,
    staggered: 0,
    guarded: 0,
    marked: false,
    exposed: false,
    snared: 0,
    shock: 0,
    blind: 0,
    intents: monsterOverride.intents.map(intent => ({
      ...intent,
      targetingRule: getIntentTargetRule(intent, monsterOverride),
      effects: intent.effects.map(effect =>
        effect.type === 'dealDamage'
          ? { ...effect, amount: effect.amount + (runBonus.monsterEnrage || 0) }
          : { ...effect }
      )
    }))
  };
  const runDeck = [...(runBonus.runDeck || buildRunDeck({ survivor: runBonus.survivor }))];
  if (disorders.includes('nightTerrors') && !runBonus.huntDeckConditionsApplied) {
    runDeck.push(cards.panic);
  }
  if (injuries.includes('shatteredNerve') && currentHp < maxHp / 2) runDeck.push(cards.panic);
  const initialDraw = drawCards(shuffleCards(runDeck), [], [], handSize);
  const initialDiscard = injuries.includes('concussion')
    ? [...initialDraw.discard, cards.panic]
    : initialDraw.discard;

  return {
    survivor,
    monster,
    drawPile: initialDraw.deck,
    hand: initialDraw.hand,
    discardPile: initialDiscard,
    exhaustPile: [],
    runDeck,
    intentIndex: 0,
    fightingArts: arts,
    artPassives,
    artTriggers: {},
    injuries,
    scars,
    disorders,
    personalDeckAdditions: [...(runBonus.survivor?.personalDeckAdditions || [])],
    woundHistory: [...(runBonus.survivor?.woundHistory || [])],
    boundGear: [...(runBonus.survivor?.boundGear || [])],
    traits,
    monsterRewardTraits,
    monsterRewardTriggers: {},
    weaponProficiency: createWeaponProficiency(runBonus.survivor?.weaponProficiency),
    activeProficiencyType: runBonus.survivor?.activeProficiencyType || 'fistAndTooth',
    weaponCardsPlayed: {},
    weaponMasteryUsed: {},
    weaponTurnTriggers: {},
    damageTakenLastTurn: 0,
    damageTakenThisTurn: 0,
    nextMonsterDamageReduction: 0,
    lanternPanicIgnored: false,
    firstAttackBonus: runBonus.firstAttackBonus || 0,
    firstAttackPlayed: false,
    firstBlockPlayed: false,
    nextAttackBonus: 0,
    survivalActionsUsed: [],
    survivalFeedback: '',
    pendingEnergyPenalty: 0,
    monsterTurnCount: 0,
    monsterHitsThisTurn: 0,
    monsterBaneDamageBonus: runBonus.monsterBaneDamageBonus || 0,
    counterDamageBonus: runBonus.counterDamageBonus || 0,
    hasMonsterBane: Boolean(runBonus.hasMonsterBane),
    cardsPlayedThisTurn: 0,
    attacksPlayedThisTurn: 0,
    survivalSpentThisTurn: 0,
    blockGainedThisTurn: 0,
    cardDiscardedThisTurn: false,
    previousCardType: null,
    intentHintLevel: 0,
    nextCounterBonus: 0,
    pendingCounterConfig: null,
    nextAttackMarks: false,
    selectedWeakPointId: null,
    weakPointFeedback: '',
    combatLogEntries: [],
    status: 'playing',
    // Status conditions
    bleed: 0,
    poison: 0,
    vulnerable: 0,
    staggered: 0,
    guarded: 0,
    burn: 0,
    doom: 0,
    snared: 0,
    shock: 0,
    blind: 0,
    prepared: 0,
    salvage: 0,
    testBonus: 0,
    consequenceReduction: 0,
    salvageTokens: 0,
    afterCombatHealing: 0,
    // Delayed effects
    pendingEnergy: 0,
    pendingDraw: 0
  };
}

export function playCard(cardIndex, state) {
  if (state.status !== 'playing') {
    return state;
  }

  const card = state.hand[cardIndex];
  const shockCost = state.survivor?.shock > 0 ? 1 : 0;
  const totalCardCost = (card?.cost || 0) + shockCost;

  if (!card || card.unplayable || totalCardCost > state.survivor.energy) {
    return state;
  }

  let survivor = {
    ...state.survivor,
    energy: state.survivor.energy - totalCardCost,
    shock: shockCost ? reduceStatus(state.survivor.shock) : state.survivor.shock
  };
  let monster = { ...state.monster };
  const hasMonsterBane = state.hasMonsterBane || 
                         state.monsterBaneKnowledge?.[monster.quarryId] || 
                         state.fightingArts?.includes(`monsterBane_${monster.quarryId}`);
  
  let drawPile = state.drawPile;
  let hand = state.hand;
  let discardPile = state.discardPile;
  let exhaustPile = state.exhaustPile || [];
  let nextAttackBonus = state.nextAttackBonus || 0;
  let nextAttackMarks = state.nextAttackMarks || false;
  let monsterHitsThisTurn = state.monsterHitsThisTurn || 0;
  let blockGainedThisTurn = state.blockGainedThisTurn || 0;
  let cardDiscardedThisTurn = state.cardDiscardedThisTurn || false;
  let intentHintLevel = hasMonsterBane ? 2 : (state.intentHintLevel || 0);
  let emittedPartyEffects = [...(state.emittedPartyEffects || [])];
  let salvageTokens = state.salvageTokens || 0;
  let afterCombatHealing = state.afterCombatHealing || 0;
  const isAttack = card.type === 'attack';
  const preparedConsumed = survivor.prepared > 0 ? 1 : 0;
  if (preparedConsumed) survivor.prepared = reduceStatus(survivor.prepared);
  let preparedDamageBonus = isAttack ? preparedConsumed : 0;
  const weaponType = card.weaponType ||
    (isAttack && state.activeProficiencyType === 'fistAndTooth' ? 'fistAndTooth' : null);
  const proficiencyLevel = weaponType && weaponType === state.activeProficiencyType
    ? state.weaponProficiency?.[weaponType]?.level || 0
    : 0;
  const weaponCardsPlayed = { ...(state.weaponCardsPlayed || {}) };
  const weaponMasteryUsed = { ...(state.weaponMasteryUsed || {}) };
  const weaponTurnTriggers = { ...(state.weaponTurnTriggers || {}) };
  const previousWeaponPlays = weaponCardsPlayed[weaponType] || 0;
  const firstWeaponCard = Boolean(weaponType && previousWeaponPlays === 0);
  const firstWeaponCardThisTurn = Boolean(weaponType && !(weaponTurnTriggers[weaponType] > 0));
  const monsterHadBlock = monster.block > 0;
  let proficiencyDamageBonus = 0;
  let proficiencyPerHitBonus = 0;
  let proficiencyDrawAfter = 0;
  let proficiencySurvivalAfter = 0;
  let proficiencyBlockAfter = 0;
  let proficiencyAddPanic = 0;
  let proficiencyRemovePanic = false;
  let proficiencyReveal = false;
  const monsterRewardTriggers = { ...(state.monsterRewardTriggers || {}) };
  const artTriggers = { ...(state.artTriggers || {}) };
  const artPassives = state.artPassives || getArtPassiveEffects(state.fightingArts);
  const selectedWeakPoint = isAttack
    ? monster.weakPoints?.find(
      weakPoint => weakPoint.id === state.selectedWeakPointId && !weakPoint.broken
    )
    : null;
  const targetTags = selectedWeakPoint?.tags || [];
  const cardTags = [...(card.tags || []), ...(card.keywords || [])];
  const currentIntent = monster.intents?.[state.intentIndex || 0];
  let tellState = selectedWeakPoint
    ? getWeakPointTellState(selectedWeakPoint, currentIntent, monster.quarryId)
    : 'neutral';
  if (selectedWeakPoint && (cardTags.includes('exposeWeakPoint') || monster.exposed)) tellState = 'exposed';
  let suitability = selectedWeakPoint
    ? getWeaponSuitability(selectedWeakPoint, weaponType, cardTags)
    : { modifier: 0, label: 'Neutral' };
  if (cardTags.includes('ignorePoorWeapon') && suitability.modifier < 0) {
    suitability = { ...suitability, modifier: 0, label: suitability.flatBonus > 0 ? 'Good' : 'Neutral' };
  }
  let weakPointMonsterDamage = 0;
  let weakPointBreakDamage = 0;
  let weakPointAttempted = false;
  let weakPointBroke = false;
  let weakPointRiskTriggered = false;
  let weakPointRiskText = '';
  let harvestBreakResult = null;
  let strangeWeakPointPanicAdded = false;
  let cardBreakBonus = 0;
  const combatLogEntries = [];

  card.effects.forEach(effect => {
    if (effect.type === 'breakBonus') cardBreakBonus += effect.amount;
  });

  if (isAttack && proficiencyLevel >= 1) {
    if (weaponType === 'sword' && firstWeaponCard) proficiencyDamageBonus += 1;
    if (weaponType === 'dagger' && firstWeaponCardThisTurn) proficiencyDamageBonus += 1;
    if (weaponType === 'grandWeapon' && (card.cost || 0) >= 2) proficiencyDamageBonus += 2;
    if (weaponType === 'katar' && firstWeaponCardThisTurn) proficiencyDamageBonus += 1;
    if (weaponType === 'fistAndTooth') proficiencyDamageBonus += 1;
    if (weaponType === 'club') proficiencyBlockAfter += 2;
    if (weaponType === 'scythe' && (state.monster.marked || state.monster.bleed > 0)) proficiencyDamageBonus += 1;
    if (weaponType === 'katana' && firstWeaponCard && !state.firstBlockPlayed) proficiencyDamageBonus += 2;
  }
  if (isAttack && proficiencyLevel >= 2) {
    if (weaponType === 'sword' && state.monster.marked) proficiencyDamageBonus += 1;
    if (weaponType === 'axe' && state.monster.block > 0) proficiencyDamageBonus += 2;
    if (weaponType === 'spear' && !(state.damageTakenLastTurn > 0)) proficiencyDamageBonus += 2;
    if (weaponType === 'katar' && state.monster.marked) proficiencyPerHitBonus += 1;
    if (weaponType === 'dagger' && card.effects.some(effect => effect.type === 'multiHitDamage')) {
      proficiencyPerHitBonus += proficiencyLevel >= 3 ? 1 : 0;
    }
    if (weaponType === 'bow' && state.monster.marked && !weaponTurnTriggers.bowMarkedDraw) {
      proficiencyDrawAfter += 1;
      weaponTurnTriggers.bowMarkedDraw = 1;
    }
    if (weaponType === 'hammer' && monsterHadBlock) proficiencyDamageBonus += 2;
    if (weaponType === 'grandWeapon' && (card.cost || 0) >= 2 && firstWeaponCard) {
      proficiencyDrawAfter += 1;
    }
    if (weaponType === 'scythe' && firstWeaponCard) {
      proficiencyDamageBonus += 3;
      proficiencyAddPanic += 1;
    }
  }
  if (proficiencyLevel >= 1 && firstWeaponCard) {
    if (weaponType === 'spear') proficiencyBlockAfter += 2;
    if (weaponType === 'bow' && isAttack) monster.marked = true;
    if (weaponType === 'shield') proficiencyBlockAfter += 2;
    if (weaponType === 'strangeWeapon') {
      proficiencyDrawAfter += 1;
      proficiencyAddPanic += 1;
    }
  }
  if (proficiencyLevel >= 2 && weaponType === 'strangeWeapon' && !weaponTurnTriggers.strangePanicRemoved) {
    proficiencyRemovePanic = true;
    weaponTurnTriggers.strangePanicRemoved = 1;
  }
  if (proficiencyLevel >= 3 && !weaponMasteryUsed[weaponType]) {
    if (isAttack && ['axe', 'hammer'].includes(weaponType)) monster.marked = true;
    if (isAttack && weaponType === 'club') proficiencyDamageBonus += 5;
    if (isAttack && weaponType === 'shield') {
      proficiencyDamageBonus += Math.min(20, survivor.block);
      weaponMasteryUsed.shield = true;
    }
    if (isAttack && weaponType === 'scythe' &&
      state.discardPile.some(discarded => discarded.id === 'panic')) {
      proficiencyDamageBonus += 2;
    }
    if (isAttack && weaponType === 'katana' && !(state.damageTakenLastTurn > 0)) {
      proficiencyDamageBonus += 6;
    }
    if (weaponType === 'grandWeapon' && (card.cost || 0) >= 2) {
      survivor.energy += 2;
    }
    if (weaponType === 'katar') proficiencyDrawAfter += 1;
    if (weaponType === 'spear') proficiencyBlockAfter += 8;
    if (weaponType === 'bow') proficiencySurvivalAfter += 1;
    if (weaponType === 'whip') proficiencyReveal = true;
    if (weaponType === 'strangeWeapon') proficiencyDrawAfter += 1;
    if ([
      'axe', 'club', 'hammer', 'grandWeapon', 'katar', 'spear', 'bow', 'shield',
      'whip', 'scythe', 'katana', 'strangeWeapon'
    ].includes(weaponType)) {
      weaponMasteryUsed[weaponType] = true;
    }
  }
  if (selectedWeakPoint && proficiencyLevel >= 3) {
    if (weaponType === 'bow' && !selectedWeakPoint.marked) {
      monster.weakPoints = monster.weakPoints.map(weakPoint =>
        weakPoint.id === selectedWeakPoint.id ? { ...weakPoint, marked: true } : weakPoint
      );
    }
  }
  if (isAttack && ['axe', 'hammer'].includes(weaponType) && proficiencyLevel >= 1) {
    monster.block = Math.max(0, monster.block - (weaponType === 'hammer' ? 2 : 1));
  }
  if (isAttack && !state.firstAttackPlayed) {
    state.monsterRewardTraits?.filter(rule => rule.type === 'firstAttackBlock').forEach(rule => {
      proficiencyBlockAfter += rule.amount || 0;
    });
  }
  let firstDamageEffect = true;
  let firstBlockEffect = true;
  const panicInDiscard = () => discardPile.filter(item => item.id === 'panic').length;
  const removePanicAny = () => {
    const piles = [hand, discardPile, drawPile];
    const target = piles.find(pile => pile.some(item => item.id === 'panic'));
    if (!target) return false;
    target.splice(target.findIndex(item => item.id === 'panic'), 1);
    return true;
  };

  const parseAndApplyStatus = (statusStr, targetType) => {
    if (!statusStr) return;
    const lower = statusStr.toLowerCase();
    const isMonster = targetType === 'monster';
    const target = isMonster ? monster : survivor;

    if (lower.includes('apply bleed')) {
      const match = lower.match(/apply bleed (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'bleed', amount));
    } else if (lower.includes('apply burn')) {
      const match = lower.match(/apply burn (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'burn', amount));
    } else if (lower.includes('apply poison')) {
      const match = lower.match(/apply poison (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'poison', amount));
    } else if (lower.includes('apply doom')) {
      const match = lower.match(/apply doom (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'doom', amount));
    } else if (lower.includes('marked')) {
      Object.assign(target, applyStatusToCombatant(target, 'marked', 1));
    } else if (lower.includes('exposed')) {
      Object.assign(target, applyStatusToCombatant(target, 'exposed', 1));
    } else if (lower.includes('apply snared')) {
      const match = lower.match(/apply snared (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'snared', amount));
    } else if (lower.includes('apply shock')) {
      const match = lower.match(/apply shock (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'shock', amount));
    } else if (lower.includes('apply blind')) {
      const match = lower.match(/apply blind (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'blind', amount));
    } else if (lower.includes('apply stagger')) {
      const match = lower.match(/apply stagger (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'staggered', amount));
    } else if (lower.includes('guarded')) {
      const match = lower.match(/guarded (\d+)/);
      const amount = match ? parseInt(match[1]) : 1;
      Object.assign(target, applyStatusToCombatant(target, 'guarded', amount));
    }
  };

  if (card.statusApplied) {
    parseAndApplyStatus(card.statusApplied, 'monster'); // Cards usually apply to monster
  }

  const drawAmount = amount => {
    const result = drawCards(drawPile, hand, discardPile, amount);
    drawPile = result.deck;
    hand = result.hand;
    discardPile = result.discard;
  };
  const discardAnotherCard = () => {
    const discardIndex = hand.findIndex(item => item !== card);
    if (discardIndex < 0) return false;
    discardPile = [...discardPile, hand[discardIndex]];
    hand = hand.filter((_, index) => index !== discardIndex);
    cardDiscardedThisTurn = true;
    return true;
  };
  const conditionalDamage = effect => {
    let amount = effect.amount || 0;
    let bonus = 0;
    if (monster.marked) bonus += effect.bonusIfMonsterMarked || 0;
    if (survivor.hp < survivor.maxHp) bonus += effect.bonusIfSurvivorWounded || 0;
    if (panicInDiscard()) bonus += effect.bonusIfPanicInDiscard || 0;
    if ((state.survivalSpentThisTurn || 0) > 0) bonus += effect.bonusIfSurvivalSpent || 0;
    if ((state.cardsPlayedThisTurn || 0) === 0) bonus += effect.bonusIfFirstCard || 0;
    if ((state.attacksPlayedThisTurn || 0) === 1) bonus += effect.bonusIfSecondAttack || 0;
    if ((state.attacksPlayedThisTurn || 0) === 0) bonus += effect.bonusIfFirstAttack || 0;
    if (
      (state.attacksPlayedThisTurn || 0) === 0 &&
      (state.blockGainedThisTurn || 0) === 0
    ) {
      bonus += effect.bonusIfFirstAttackWithoutBlock || 0;
    }
    if (survivor.block > 0) bonus += effect.bonusIfBlock || 0;
    if ((state.blockGainedThisTurn || 0) > 0) bonus += effect.bonusIfBlockThisTurn || 0;
    if (monster.block <= 0) bonus += effect.bonusIfMonsterNoBlock || 0;
    if (monster.block > 0) bonus += effect.bonusIfMonsterHasBlock || 0;
    if (monster.bleed > 0) bonus += effect.bonusIfMonsterBleeding || 0;
    if (monster.vulnerable > 0) bonus += effect.bonusIfMonsterVulnerable || 0;
    if (monster.hp < monster.maxHp / 2) bonus += effect.bonusIfMonsterWounded || 0;
    if (survivor.block > 0) bonus += (survivor.block * (effect.bonusPerBlock || 0));
    
    if ((state.cardsPlayedThisTurn || 0) >= (effect.cardsRequired || Infinity)) {
      bonus += effect.bonusIfCardsPlayed || 0;
    }
    if (survivor.survival >= (effect.survivalRequired || Infinity)) {
      bonus += effect.bonusIfHighSurvival || 0;
    }
    if (state.previousCardType === 'skill') bonus += effect.bonusIfPreviousCardSkill || 0;
    if (state.disorders?.length) bonus += effect.bonusIfDisorder || 0;
    if (state.damageTakenLastTurn > 0) bonus += effect.bonusIfTargetedLastTurn || 0;
    if (state.cardDiscardedThisTurn) bonus += effect.bonusIfCardDiscarded || 0;

    bonus += panicInDiscard() * (effect.bonusPerPanicInDiscard || 0);

    if (effect.maximumBonus) {
      bonus = Math.min(effect.maximumBonus, bonus);
    }

    return amount + bonus;
  };
  const dealCardDamage = effect => {
    const firstAttackPenalty = !state.firstAttackPlayed && firstDamageEffect
      ? (state.injuries?.includes('brokenArm') ? 1 : 0) +
        (state.scars?.includes('boneSetWrong') ? 1 : 0)
      : 0;
    const snaredPenalty = isAttack && survivor.snared > 0 ? 5 : 0;
    const blindPenalty = isAttack && survivor.blind > 0 ? 3 : 0;
    const amount = Math.max(0,
      conditionalDamage(effect) +
      preparedDamageBonus +
      (survivor.strength || 0) +
      (hasMonsterBane ? 1 : 0) +
      (state.fightingArts?.includes('clawStyle') ? 1 : 0) +
      (state.fightingArts?.includes('berserker') && survivor.block === 0 ? 1 : 0) +
      (state.disorders?.includes('deathWish') && survivor.hp <= 2 ? 2 : 0) +
      (!state.firstAttackPlayed && state.disorders?.includes('recklessJoy') ? 2 : 0) -
      (!state.firstAttackPlayed && state.disorders?.includes('cowardice') ? 1 : 0) -
      firstAttackPenalty -
      snaredPenalty -
      blindPenalty +
      (!state.firstAttackPlayed ? state.firstAttackBonus || 0 : 0) +
      (isAttack ? nextAttackBonus : 0) +
      proficiencyDamageBonus +
      (state.fightingArts?.includes('bloodMemory') && state.woundHistory?.length ? 1 : 0) +
      (state.fightingArts?.includes('boneSetWrong') &&
        ['hammer', 'club', 'axe', 'grandWeapon', 'scythe'].includes(weaponType) ? 1 : 0) +
      (effect.type === 'multiHitDamage' ? proficiencyPerHitBonus : 0)
    );
    let artDamageBonus = 0;
    artPassives.forEach(passive => {
      if (passive.type === 'firstAttackIfWounded' && !state.firstAttackPlayed &&
        survivor.hp < survivor.maxHp) artDamageBonus += passive.value || 0;
      if (passive.type === 'firstAttackIfPanicDiscard' && !state.firstAttackPlayed &&
        panicInDiscard()) artDamageBonus += passive.value || 0;
      if (passive.type === 'firstAttackIfDisorder' && !state.firstAttackPlayed &&
        state.disorders?.length) artDamageBonus += passive.value || 0;
      if (passive.type === 'secondAttackBonus' && (state.attacksPlayedThisTurn || 0) === 1) {
        artDamageBonus += passive.value || 0;
      }
      if (passive.type === 'lowMonsterHpAttackBonus' &&
        monster.hp <= monster.maxHp * passive.threshold) artDamageBonus += passive.value || 0;
      if (passive.type === 'firstMarkedAttackBonus' && !artTriggers.firstMarkedAttackBonus &&
        monster.marked) {
        artDamageBonus += passive.value || 0;
        artTriggers.firstMarkedAttackBonus = true;
      }
    });
    const totalAmount = amount + artDamageBonus;
    const monsterDamage = selectedWeakPoint
      ? Math.max(0, Math.floor(totalAmount * selectedWeakPoint.monsterDamageMultiplier))
      : totalAmount;
    const hpBefore = monster.hp;
    monster = effect.ignoreBlockIfMonsterMarked && monster.marked
      ? applyDirectDamage(monster, monsterDamage)
      : applyDamage(monster, monsterDamage);
    const dealt = Math.max(0, hpBefore - monster.hp);
    if (selectedWeakPoint && amount > 0) {
      weakPointAttempted = true;
      let flatBreakBonus = selectedWeakPoint.marked || monster.marked ? 1 : 0;
      artPassives.forEach(passive => {
        const matchingTag = passive.tags?.some(tag => targetTags.includes(tag));
        const matchingWeapon = !passive.weapons || passive.weapons.includes(weaponType);
        if (passive.type === 'taggedWeakPointBreakBonus' && matchingTag && matchingWeapon) {
          flatBreakBonus += passive.value || 0;
        }
        if (passive.type === 'markedWeakPointWeaponBreak' && selectedWeakPoint.marked &&
          matchingWeapon) flatBreakBonus += passive.value || 0;
        if (passive.type === 'firstPreciseBreakBonus' && cardTags.includes('precise') &&
          !artTriggers.firstPreciseBreakBonus) {
          flatBreakBonus += passive.value || 0;
          artTriggers.firstPreciseBreakBonus = true;
        }
        if (passive.type === 'firstOpenWeakPointBreakBonus' &&
          ['open', 'exposed'].includes(tellState) && !artTriggers.firstOpenWeakPointBreakBonus) {
          flatBreakBonus += passive.value || 0;
          artTriggers.firstOpenWeakPointBreakBonus = true;
        }
      });
      if (proficiencyLevel >= 3 && weaponType === 'bow') flatBreakBonus += 1;
      if (cardTags.includes('breaker')) flatBreakBonus += 1;
      if (proficiencyLevel >= 3 && ['dagger', 'katar'].includes(weaponType) &&
        targetTags.some(tag => ['head', 'eye', 'organ'].includes(tag))) flatBreakBonus += 2;
      if (proficiencyLevel >= 3 && ['hammer', 'club'].includes(weaponType) &&
        targetTags.some(tag => ['shell', 'hide', 'armour', 'bone'].includes(tag))) flatBreakBonus += 3;
      if (proficiencyLevel >= 3 && weaponType === 'strangeWeapon' &&
        targetTags.some(tag => ['eye', 'heart', 'strange'].includes(tag))) {
        flatBreakBonus += 2;
        if (!strangeWeakPointPanicAdded) {
          discardPile = [...discardPile, cards.panic];
          strangeWeakPointPanicAdded = true;
        }
      }
      const breakDamage = Math.max(0, Math.round(
        (totalAmount + flatBreakBonus + cardBreakBonus) *
        selectedWeakPoint.breakDamageMultiplier *
        (1 + suitability.modifier) *
        getTellBreakModifier(tellState)
      ) + suitability.flatBonus);
      weakPointMonsterDamage += dealt;
      weakPointBreakDamage += breakDamage;
      monster.weakPoints = monster.weakPoints.map(weakPoint => {
        if (weakPoint.id !== selectedWeakPoint.id || weakPoint.broken) return weakPoint;
        const previousBreakDamage = weakPoint.currentBreakDamage || 0;
        const rawBreakDamage = previousBreakDamage + breakDamage;
        const currentBreakDamage = Math.min(
          weakPoint.breakValue,
          rawBreakDamage
        );
        const brokeNow = currentBreakDamage >= weakPoint.breakValue;
        weakPointBroke = weakPointBroke || brokeNow;
        if (brokeNow) {
          harvestBreakResult = rollHarvestQuality({
            weakPoint: { ...weakPoint, marked: weakPoint.marked || monster.marked },
            weaponType,
            cardTags,
            suitability,
            proficiencyLevel,
            hasMonsterBane: state.hasMonsterBane,
            overkill: Math.max(0, rawBreakDamage - weakPoint.breakValue),
            monsterLevel: monster.level || 1
          });
        }
        return {
          ...weakPoint,
          currentBreakDamage,
          broken: brokeNow,
          ...(harvestBreakResult ? { harvestResult: harvestBreakResult } : {})
        };
      });
    }
    if (effect.markOnHit || (isAttack && nextAttackMarks)) monster.marked = true;
    if (isAttack && weaponType === 'whip' && proficiencyLevel >= 1 && amount > 0) {
      monster.marked = true;
      if (selectedWeakPoint) {
        monster.weakPoints = monster.weakPoints.map(weakPoint =>
          weakPoint.id === selectedWeakPoint.id ? { ...weakPoint, marked: true } : weakPoint
        );
      }
    }
    monsterHitsThisTurn += 1;
    firstDamageEffect = false;
    preparedDamageBonus = 0;
    if (isAttack && snaredPenalty) survivor.snared = reduceStatus(survivor.snared);
    if (isAttack && blindPenalty) survivor.blind = reduceStatus(survivor.blind);
    if (isAttack) {
      nextAttackBonus = 0;
      nextAttackMarks = false;
    }
  };

  card.effects.forEach(rawEffect => {
    const effect = { ...rawEffect, type: normalizeEffectType(rawEffect.type) };
    switch (effect.type) {
      case 'damage':
      case 'skillDamage': {
        dealCardDamage(effect);
        (monster.passiveRules || []).forEach(rule => {
          if (
            rule.type === 'enrageAfterRepeatedHits' &&
            monsterHitsThisTurn === rule.hits
          ) {
            monster.enrage = (monster.enrage || 0) + (rule.amount || 1);
          }
        });
        break;
      }
      case 'multiHitDamage': {
        const amount = monster.marked && effect.markedAmount ? effect.markedAmount : effect.amount;
        for (let hit = 0; hit < effect.hits; hit += 1) dealCardDamage({ ...effect, amount });
        break;
      }
      case 'markMonster':
        monster.marked = true;
        if (selectedWeakPoint) {
          monster.weakPoints = monster.weakPoints.map(weakPoint =>
            weakPoint.id === selectedWeakPoint.id ? { ...weakPoint, marked: true } : weakPoint
          );
        }
        break;
      case 'bleedMonster':
        if (effect.condition === 'monsterMarked' && !monster.marked) break;
        monster.bleed = (monster.bleed || 0) + effect.amount;
        break;
      case 'poisonMonster':
        if (effect.condition === 'monsterMarked' && !monster.marked) break;
        monster.poison = (monster.poison || 0) + effect.amount;
        break;
      case 'vulnerableMonster':
        if (effect.condition === 'monsterMarked' && !monster.marked) break;
        monster.vulnerable = (monster.vulnerable || 0) + effect.amount;
        break;
      case 'staggerMonster':
        if (effect.condition === 'monsterMarked' && !monster.marked) break;
        monster.staggered = (monster.staggered || 0) + effect.amount;
        break;
      case 'guardedSurvivor':
        survivor.guarded = (survivor.guarded || 0) + effect.amount;
        break;
      case 'removeMonsterBlock':
        monster = { ...monster, block: Math.max(0, monster.block - effect.amount) };
        break;
      case 'removeAllMonsterBlock':
        monster = { ...monster, block: 0 };
        break;
      case 'block': {
        const penalty = (!state.firstBlockPlayed && firstBlockEffect &&
          state.injuries?.includes('crackedRibs') ? 1 : 0) +
          (!state.firstBlockPlayed && firstBlockEffect &&
          state.disorders?.includes('recklessJoy') ? 2 : 0);
        survivor = { ...survivor, block: survivor.block + Math.max(0, effect.amount - penalty) };
        const intentTags = currentIntent?.tags || [];
        const tellBonus = intentTags.some(tag => ['multiHit', 'trample'].includes(tag))
          ? effect.bonusIfMultiHitTell || 0
          : 0;
        const artBlockBonus = !state.firstBlockPlayed && firstBlockEffect
          ? artPassives
            .filter(passive => passive.type === 'firstBlockBonus')
            .reduce((total, passive) => total + (passive.value || 0), 0)
          : 0;
        const gained = Math.max(0, effect.amount + artBlockBonus - penalty) +
          (!isAttack ? preparedConsumed : 0) +
          (state.hasMonsterBane ? effect.bonusIfMonsterBane || 0 : 0) +
          tellBonus;
        survivor = { ...survivor, block: survivor.block - Math.max(0, effect.amount - penalty) + gained };
        blockGainedThisTurn += gained;
        firstBlockEffect = false;
        break;
      }
      case 'conditionalBlock': {
        const isLowHp = survivor.hp < survivor.maxHp / 2;
        const block = isLowHp ? effect.lowHpAmount : effect.amount;
        const penalty = !state.firstBlockPlayed && firstBlockEffect &&
          state.injuries?.includes('crackedRibs') ? 1 : 0;
        survivor = { ...survivor, block: survivor.block + Math.max(0, block - penalty) };
        firstBlockEffect = false;
        break;
      }
      case 'energy':
        survivor = { ...survivor, energy: survivor.energy + effect.amount };
        break;
      case 'survival':
        survivor = {
          ...survivor,
          survival: Math.min(
            survivor.maxSurvival,
            (survivor.survival || 0) + effect.amount
          )
        };
        break;
      case 'survivalIfSecondAttack':
        if ((state.attacksPlayedThisTurn || 0) === 1) {
          survivor = {
            ...survivor,
            survival: Math.min(
              survivor.maxSurvival,
              (survivor.survival || 0) + effect.amount
            )
          };
        }
        break;
      case 'heal':
      case 'healSelf':
        survivor = applyHealingToSurvivor(survivor, effect.amount).survivor;
        break;
      case 'healTarget':
        survivor = applyHealingToSurvivor(survivor, effect.amount).survivor;
        break;
      case 'healParty':
        survivor = applyHealingToSurvivor(survivor, effect.amount).survivor;
        emittedPartyEffects.push({
          target: 'all',
          effectType: 'heal',
          value: effect.amount,
          expiresAfterTurn: false,
          expiresAfterCombat: false
        });
        break;
      case 'healIfBelowHalf':
        if (survivor.hp > 0 && survivor.hp < survivor.maxHp / 2) {
          survivor = applyHealingToSurvivor(survivor, effect.amount).survivor;
        }
        break;
      case 'healIfWounded':
        if (survivor.hp > 0 && survivor.hp < survivor.maxHp) {
          survivor = applyHealingToSurvivor(survivor, effect.amount).survivor;
        }
        break;
      case 'healIfWoundedOrBlock':
        if (survivor.hp > 0 && survivor.hp < survivor.maxHp) {
          survivor = applyHealingToSurvivor(survivor, effect.heal).survivor;
        }
        else if (survivor.hp > 0) {
          survivor.block += effect.block;
          blockGainedThisTurn += effect.block;
        }
        break;
      case 'loseHp':
        survivor = applyDamageToSurvivor({
          survivor,
          amount: effect.amount,
          ignoreBlock: true
        }).survivor;
        break;
      case 'draw': {
        drawAmount(effect.amount);
        break;
      }
      case 'delayedEnergy':
        state.pendingEnergy += effect.amount;
        break;
      case 'delayedDraw':
        state.pendingDraw += effect.amount;
        break;
      case 'drawIfSecondAttack':
        if ((state.attacksPlayedThisTurn || 0) === 1) drawAmount(effect.amount);
        break;
      case 'drawIfFirstCard':
        if ((state.cardsPlayedThisTurn || 0) === 0) drawAmount(effect.amount);
        break;
      case 'drawIfSurvivalSpent':
        if ((state.survivalSpentThisTurn || 0) > 0) drawAmount(effect.amount);
        break;
      case 'drawIfMonsterBane':
        if (state.hasMonsterBane) drawAmount(effect.amount);
        break;
      case 'drawIfPanicInDiscard':
        if (panicInDiscard()) drawAmount(effect.amount);
        break;
      case 'drawIfAttackPlayed':
        if ((state.attacksPlayedThisTurn || 0) > 0) drawAmount(effect.amount);
        break;
      case 'drawIfBlockGained':
        if ((state.blockGainedThisTurn || 0) > 0) drawAmount(effect.amount);
        break;
      case 'drawIfPreviousCardAttack':
        if (state.previousCardType === 'attack') drawAmount(effect.amount);
        break;
      case 'drawIfMonsterDefeated':
        if (monster.hp <= 0) drawAmount(effect.amount);
        break;
      case 'drawIfWeakPointBroken':
        if (weakPointBroke) drawAmount(effect.amount);
        break;
      case 'drawIfOpenWeakPoint':
        if (selectedWeakPoint && ['open', 'exposed'].includes(tellState)) drawAmount(effect.amount);
        break;
      case 'drawIfScar':
        drawAmount(state.scars?.length ? effect.amount : effect.fallbackAmount);
        break;
      case 'drawIfNoAttackPlayed':
        if ((state.attacksPlayedThisTurn || 0) === 0) drawAmount(effect.amount);
        break;
      case 'drawIfPanicElseBlock':
        if (panicInDiscard()) drawAmount(effect.draw);
        else {
          survivor.block += effect.block;
          blockGainedThisTurn += effect.block;
        }
        break;
      case 'drawByMonsterMarked':
        drawAmount(monster.marked ? effect.marked : effect.normal);
        break;
      case 'drawFromDiscardOrDeck': {
        if (discardPile.length) hand = [...hand, discardPile.pop()];
        else drawAmount(effect.amount);
        break;
      }
      case 'discard': {
        discardAnotherCard();
        break;
      }
      case 'discardForDamage':
        dealCardDamage({ type: 'damage', amount: discardAnotherCard() ? effect.amount : effect.fallbackAmount });
        break;
      case 'discardForBlock': {
        const amount = discardAnotherCard() ? effect.amount : effect.fallbackAmount;
        survivor.block += amount;
        blockGainedThisTurn += amount;
        break;
      }
      case 'addPanic': {
        const panicToBlock = !artTriggers.panicToBlock
          ? artPassives
            .filter(passive => passive.type === 'panicToBlock')
            .reduce((total, passive) => total + (passive.value || passive.amount || 0), 0)
          : 0;
        const panicAmount = Math.max(0, effect.amount - (panicToBlock ? 1 : 0));
        discardPile = [...discardPile, ...Array(panicAmount).fill(cards.panic)];
        if (panicToBlock) {
          survivor.block += panicToBlock;
          blockGainedThisTurn += panicToBlock;
          artTriggers.panicToBlock = true;
        }
        break;
      }
      case 'removePanic': {
        const panicIndex = discardPile.findIndex(item => item.id === 'panic');
        if (panicIndex >= 0) discardPile = discardPile.filter((_, index) => index !== panicIndex);
        break;
      }
      case 'removePanicAny':
        removePanicAny();
        break;
      case 'removePanicAnyOrSurvival':
        if (!removePanicAny()) {
          survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + effect.amount);
        }
        break;
      case 'removePanicAndDraw': {
        const panicIndex = discardPile.findIndex(item => item.id === 'panic');
        if (panicIndex >= 0) {
          discardPile.splice(panicIndex, 1);
          drawAmount(effect.amount);
        }
        break;
      }
      case 'survivalIfPanicInDiscard':
        if (panicInDiscard()) survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + effect.amount);
        break;
      case 'survivalIfCardsPlayed':
        if ((state.cardsPlayedThisTurn || 0) >= effect.count - 1) {
          survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + effect.amount);
        }
        break;
      case 'partyEffect':
        emittedPartyEffects.push({
          target: effect.target,
          effectType: effect.effectType,
          value: effect.value,
          expiresAfterTurn: effect.expiresAfterTurn !== false,
          expiresAfterCombat: Boolean(effect.expiresAfterCombat)
        });
        break;
      case 'healAfterCombat':
        afterCombatHealing += statusAmount(effect);
        break;
      case 'partyHealAfterCombat':
        emittedPartyEffects.push({
          target: 'all',
          effectType: 'healAfterCombat',
          value: statusAmount(effect),
          expiresAfterTurn: false,
          expiresAfterCombat: true
        });
        break;
      case 'bleedTarget':
      case 'burnTarget':
      case 'poisonTarget':
      case 'doomTarget':
      case 'vulnerableTarget':
      case 'staggerTarget':
      case 'guardTarget':
      case 'markTarget':
      case 'exposeTarget':
      case 'snareTarget':
      case 'shockTarget':
      case 'blindTarget': {
        const statusMap = {
          bleedTarget: 'bleed',
          burnTarget: 'burn',
          poisonTarget: 'poison',
          doomTarget: 'doom',
          vulnerableTarget: 'vulnerable',
          staggerTarget: 'staggered',
          guardTarget: 'guarded',
          markTarget: 'marked',
          exposeTarget: 'exposed',
          snareTarget: 'snared',
          shockTarget: 'shock',
          blindTarget: 'blind'
        };
        monster = applyStatusToCombatant(monster, statusMap[effect.type], statusAmount(effect));
        break;
      }
      case 'guardSelf':
      case 'preparedSelf':
      case 'salvageSelf':
      case 'testBonus':
      case 'consequenceReduction': {
        const selfMap = {
          guardSelf: 'guarded',
          preparedSelf: 'prepared',
          salvageSelf: 'salvage',
          testBonus: 'testBonus',
          consequenceReduction: 'consequenceReduction'
        };
        survivor = applyStatusToCombatant(survivor, selfMap[effect.type], statusAmount(effect));
        if (effect.type === 'salvageSelf') salvageTokens += statusAmount(effect);
        break;
      }
      case 'nextAttackBonus':
        nextAttackBonus += effect.amount;
        break;
      case 'nextAttackBonusIfMonsterBane':
        if (state.hasMonsterBane) nextAttackBonus += effect.amount;
        break;
      case 'nextAttackMarks':
        nextAttackMarks = true;
        break;
      case 'markIfFirstAttack':
        if (!state.firstAttackPlayed) monster.marked = true;
        break;
      case 'markWeakPoint':
        if (selectedWeakPoint) {
          monster.weakPoints = monster.weakPoints.map(weakPoint =>
            weakPoint.id === selectedWeakPoint.id ? { ...weakPoint, marked: true } : weakPoint
          );
        }
        break;
      case 'blockIfDisorder':
        if (state.disorders?.includes(effect.disorderId)) {
          survivor.block += effect.amount;
          blockGainedThisTurn += effect.amount;
        }
        break;
      case 'breakBonusIfOpenWeakPoint':
      case 'taggedBreakBonus':
      case 'harvestBonusIfWeakPointBroken':
      case 'pendingWeaponXp':
      case 'partyEffectIfOneHp':
        break;
      case 'nextCounterBonus':
        break;
      case 'nextMonsterDamageReduction':
        state.nextMonsterDamageReduction = Math.max(
          state.nextMonsterDamageReduction || 0,
          effect.amount || 0
        );
        break;
      case 'revealIntentHint':
        intentHintLevel = Math.max(intentHintLevel, 1);
        break;
      case 'damageFromBlock':
        dealCardDamage({
          type: 'damage',
          amount: Math.min(effect.maximum, Math.floor(survivor.block / effect.divisor))
        });
        break;
      case 'blockFromCardsPlayed': {
        const amount = Math.min(effect.maximum, state.cardsPlayedThisTurn || 0);
        survivor.block += amount;
        blockGainedThisTurn += amount;
        break;
      }
      case 'addTemporaryCard':
        if (cards[effect.cardId]) hand = [...hand, { ...cards[effect.cardId], source: card.source }];
        break;
      default:
        break;
    }
  });

  if (selectedWeakPoint && weakPointAttempted) {
    const updatedPoint = monster.weakPoints.find(weakPoint => weakPoint.id === selectedWeakPoint.id);
    combatLogEntries.push(
      `${survivor.name} targeted ${selectedWeakPoint.name}. ` +
      `The attack dealt ${weakPointMonsterDamage} monster damage and ${weakPointBreakDamage} break damage.`
    );
    const spearRiskProtection = proficiencyLevel >= 3 && weaponType === 'spear' &&
      targetTags.some(tag => ['legs', 'body'].includes(tag)) &&
      !weaponMasteryUsed.spearWeakPointRisk;
    const riskSuppressed = tellState === 'open' || tellState === 'exposed' ||
      cardTags.includes('safeWeakPoint') || spearRiskProtection;

    // Consume Exposed and Marked
    if (tellState === 'exposed' && monster.exposed) {
      monster.exposed = false;
    }
    if (isAttack && monster.marked && !cardTags.includes('keepMarked')) {
      monster.marked = false;
    }

    if (spearRiskProtection && updatedPoint && !updatedPoint.broken) {
      weaponMasteryUsed.spearWeakPointRisk = true;
    }
    if (updatedPoint?.broken) {
      const harvestResult = updatedPoint.harvestResult || harvestBreakResult;
      combatLogEntries.push(
        `${selectedWeakPoint.name} broke. ${selectedWeakPoint.onBreakEffect} ` +
        `Harvest quality: ${harvestResult?.quality || 'messy'}. ` +
        `${harvestResult?.impactText || 'Related part odds improved.'}` +
        (harvestResult?.reason ? ` (${harvestResult.reason})` : '')
      );
    } else if (selectedWeakPoint.riskOnFailedBreak && !riskSuppressed) {
      weakPointRiskTriggered = true;
      const risk = selectedWeakPoint.riskOnFailedBreak;
      const riskAmount = (risk.amount || 1) + (tellState === 'guarded' || tellState === 'dangerous' ? 1 : 0);
      if (risk.type === 'panic' || risk.type === 'panicAndTarget') {
        discardPile = [...discardPile, ...Array(riskAmount).fill(cards.panic)];
        weakPointRiskText = `${survivor.name} gains ${riskAmount} Panic`;
      }
      if (risk.type === 'panicAndTarget') {
        weakPointRiskText += ' and becomes the monster next target';
      } else if (risk.type === 'marked') {
        survivor.marked = Math.max(1, (survivor.marked || 0) + riskAmount);
        weakPointRiskText = `${survivor.name} becomes Marked`;
      } else if (risk.type === 'bleed') {
        survivor.bleed = (survivor.bleed || 0) + riskAmount;
        weakPointRiskText = `${survivor.name} gains ${riskAmount} Bleed`;
      } else if (risk.type === 'monsterHeal') {
        monster.hp = Math.min(monster.maxHp, monster.hp + riskAmount);
        weakPointRiskText = `${monster.name} heals ${riskAmount}`;
      } else if (risk.type === 'monsterBlock') {
        monster.block += riskAmount;
        weakPointRiskText = `${monster.name} gains ${riskAmount} block`;
      } else if (risk.type === 'monsterEnrage') {
        monster.enrage = (monster.enrage || 0) + riskAmount;
        weakPointRiskText = `${monster.name} gains ${riskAmount} Enrage`;
      } else if (risk.type === 'loseBlock') {
        survivor.block = Math.max(0, survivor.block - riskAmount);
        weakPointRiskText = `${survivor.name} loses ${riskAmount} block`;
      }
      combatLogEntries.push(
        `${selectedWeakPoint.name} did not break. ${weakPointRiskText}.`
      );
    }
  }

  if (proficiencyBlockAfter) {
    survivor.block += proficiencyBlockAfter;
    blockGainedThisTurn += proficiencyBlockAfter;
  }
  if (proficiencySurvivalAfter) {
    survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + proficiencySurvivalAfter);
  }
  if (proficiencyAddPanic) {
    discardPile = [...discardPile, ...Array(proficiencyAddPanic).fill(cards.panic)];
  }
  if (proficiencyRemovePanic) removePanicAny();
  if (proficiencyDrawAfter) drawAmount(proficiencyDrawAfter);
  if (proficiencyReveal) intentHintLevel = Math.max(intentHintLevel, 1);
  if (weaponType) {
    weaponCardsPlayed[weaponType] = previousWeaponPlays + 1;
    weaponTurnTriggers[weaponType] = (weaponTurnTriggers[weaponType] || 0) + 1;
    if (proficiencyLevel >= 2 && weaponType === 'dagger' && weaponTurnTriggers[weaponType] === 2) {
      survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + 1);
    }
    if (proficiencyLevel >= 3 && weaponType === 'sword' &&
      weaponCardsPlayed[weaponType] === 2 && !weaponMasteryUsed.sword) {
      drawAmount(1);
      weaponMasteryUsed.sword = true;
    }
  }
  const nextMonsterDamageReduction = isAttack &&
    ((weaponType === 'club' && proficiencyLevel >= 2) ||
      (weaponType === 'whip' && proficiencyLevel >= 2 && monster.marked))
    ? Math.max(state.nextMonsterDamageReduction || 0, 1)
    : state.nextMonsterDamageReduction || 0;
  if (isAttack && (state.attacksPlayedThisTurn || 0) === 2 &&
    !monsterRewardTriggers.threeAttackRecovery) {
    const recoveryRule = state.monsterRewardTraits?.find(rule => rule.type === 'threeAttackRecovery');
    if (recoveryRule) {
      survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + 1);
      drawAmount(1);
      monsterRewardTriggers.threeAttackRecovery = true;
    }
  }

  const playedCardIndex = hand.indexOf(card);
  const nextHand = playedCardIndex >= 0
    ? hand.filter((_, index) => index !== playedCardIndex)
    : hand;
  if (card.exhaust) exhaustPile = [...exhaustPile, card];
  else discardPile = [...discardPile, card];

  return {
    ...state,
    survivor,
    monster,
    drawPile,
    hand: nextHand,
    discardPile,
    exhaustPile,
    nextAttackBonus,
    nextAttackMarks,
    weakPointFeedback: selectedWeakPoint
      ? `${selectedWeakPoint.name}: ${monster.weakPoints.find(point => point.id === selectedWeakPoint.id)?.broken ? 'broken' : 'damaged'}`
      : '',
    forceNextMonsterTarget: weakPointRiskTriggered &&
      selectedWeakPoint?.riskOnFailedBreak?.type === 'panicAndTarget',
    combatLogEntries,
    nextCounterBonus: (state.nextCounterBonus || 0) +
      card.effects.filter(effect => effect.type === 'nextCounterBonus')
        .reduce((total, effect) => total + effect.amount, 0),
    pendingCounterConfig: card.counterCanTargetWeakPoint
      ? {
          counterCanTargetWeakPoint: true,
          counterPreferredWeakPointTags: card.counterPreferredWeakPointTags || [],
          counterBreakDamageModifier: card.counterBreakDamageModifier || 0,
          counterRiskModifier: card.counterRiskModifier || 0
        }
      : state.pendingCounterConfig,
    monsterHitsThisTurn,
    cardsPlayedThisTurn: (state.cardsPlayedThisTurn || 0) + 1,
    attacksPlayedThisTurn: (state.attacksPlayedThisTurn || 0) + (isAttack ? 1 : 0),
    blockGainedThisTurn,
    cardDiscardedThisTurn,
    previousCardType: card.type,
    weaponCardsPlayed,
    weaponMasteryUsed,
    weaponTurnTriggers,
    artTriggers,
    monsterRewardTriggers,
    nextMonsterDamageReduction,
    intentHintLevel,
    emittedPartyEffects,
    salvageTokens,
    afterCombatHealing,
    firstAttackPlayed: state.firstAttackPlayed || card.type === 'attack',
    firstBlockPlayed: state.firstBlockPlayed ||
      card.effects.some(effect => ['block', 'conditionalBlock'].includes(effect.type)),
    status: getCombatStatus(survivor, monster)
  };
}

function getCounterWeapon(state, weakPoint) {
  const weaponType = state.activeProficiencyType || 'fistAndTooth';
  if (!weakPoint) {
    return { weaponType, suitability: { modifier: 0, flatBonus: 0, label: 'Neutral' } };
  }
  return {
    weaponType,
    suitability: getWeaponSuitability(weakPoint, weaponType, ['counter'])
  };
}

function getCounterBaseDamage(state) {
  const baneBonus = state.monsterBaneDamageBonus || 0;
  const traitBonus = state.traits?.includes('wolfSmile') ? 1 : 0;
  const gearBonus = (state.counterDamageBonus || 0) + (state.nextCounterBonus || 0);
  const fistLevel = state.weaponProficiency?.fistAndTooth?.level || 0;
  const fistActive = state.activeProficiencyType === 'fistAndTooth';
  const fistBonus = fistActive && fistLevel >= 2 ? 1 : 0;
  const woundedFistBonus = fistActive &&
    fistLevel >= 1 && state.survivor.hp < state.survivor.maxHp ? 2 : 0;
  return 3 + baneBonus + traitBonus + gearBonus + fistBonus + woundedFistBonus;
}

export function getCounterWeakPointPreview(state, weakPointId) {
  const weakPoint = state.monster.weakPoints?.find(point => point.id === weakPointId && !point.broken);
  if (!weakPoint) return null;
  const currentIntent = state.monster.intents?.[state.intentIndex || 0];
  const tellState = getWeakPointTellState(weakPoint, currentIntent, state.monster.quarryId);
  const { weaponType, suitability } = getCounterWeapon(state, weakPoint);
  const tags = weakPoint.tags || [];
  const proficiencyLevel = weaponType ? state.weaponProficiency?.[weaponType]?.level || 0 : 0;
  let breakBonus = 0;
  let riskModifier = state.pendingCounterConfig?.counterRiskModifier || 0;
  breakBonus += state.pendingCounterConfig?.counterBreakDamageModifier || 0;
  if (state.pendingCounterConfig?.counterPreferredWeakPointTags?.some(tag => tags.includes(tag))) {
    breakBonus += 1;
  }

  if (proficiencyLevel >= 1 && weaponType === 'shield' &&
    tags.some(tag => ['claws', 'body'].includes(tag))) breakBonus += 2;
  if (proficiencyLevel >= 1 && ['katar', 'dagger'].includes(weaponType) &&
    tags.some(tag => ['head', 'eye', 'organ', 'heart'].includes(tag))) {
    breakBonus += 2;
    riskModifier += 1;
  }
  if (proficiencyLevel >= 1 && weaponType === 'katana' && !(state.damageTakenLastTurn > 0)) {
    breakBonus += 3;
  }

  const baseDamage = getCounterBaseDamage(state);
  const monsterDamage = Math.max(0, Math.floor(baseDamage * weakPoint.monsterDamageMultiplier));
  const breakDamage = Math.max(0, Math.round(
    baseDamage *
    weakPoint.breakDamageMultiplier *
    (1 + suitability.modifier) *
    getTellBreakModifier(tellState) *
    0.75
  ) + suitability.flatBonus + breakBonus);
  const fragile = Boolean(weakPoint.harvestProfile?.fragile || tags.includes('rare'));
  const guarded = tellState === 'guarded' && !weakPoint.marked && !state.monster.marked;
  const unsuitableFragile = fragile && suitability.label !== 'Good';

  return {
    weakPoint,
    weaponType,
    weaponMatch: suitability.label,
    suitability,
    tellState,
    monsterDamage,
    breakDamage,
    riskModifier,
    targetable: !guarded && !unsuitableFragile,
    blockedReason: guarded
      ? 'Guarded counters require the weak point to be Marked.'
      : unsuitableFragile
        ? 'This fragile weak point requires a suitable weapon.'
        : ''
  };
}

function applyCounterWeakPoint(state, survivor, monster, drawPile, hand, discardPile, weakPointId) {
  const preview = getCounterWeakPointPreview({ ...state, survivor, monster }, weakPointId);
  if (!preview?.targetable) return null;
  const point = preview.weakPoint;
  const hpBefore = monster.hp;
  monster = applyDamage(monster, preview.monsterDamage);
  const monsterDamage = Math.max(0, hpBefore - monster.hp);
  const previousBreakDamage = point.currentBreakDamage || 0;
  const rawBreakDamage = previousBreakDamage + preview.breakDamage;
  const currentBreakDamage = Math.min(point.breakValue, rawBreakDamage);
  const brokeNow = currentBreakDamage >= point.breakValue;
  let harvestResult = null;

  if (brokeNow) {
    harvestResult = rollHarvestQuality({
      weakPoint: { ...point, marked: point.marked || monster.marked },
      weaponType: preview.weaponType,
      cardTags: ['counter'],
      suitability: preview.suitability,
      proficiencyLevel: preview.weaponType
        ? state.weaponProficiency?.[preview.weaponType]?.level || 0
        : 0,
      hasMonsterBane: state.hasMonsterBane,
      overkill: Math.max(0, rawBreakDamage - point.breakValue),
      monsterLevel: monster.level || 1
    });
  }

  monster.weakPoints = monster.weakPoints.map(weakPoint => weakPoint.id === point.id
    ? {
        ...weakPoint,
        currentBreakDamage,
        broken: brokeNow,
        ...(harvestResult ? { harvestResult } : {})
      }
    : weakPoint);

  const logEntries = [
    `${survivor.name} countered ${point.name}.`,
    `The counter dealt ${monsterDamage} monster damage and ${preview.breakDamage} break damage.`
  ];
  let forceNextMonsterTarget = false;
  const weaponMasteryUsed = { ...(state.weaponMasteryUsed || {}) };
  const spearProtection = preview.weaponType === 'spear' &&
    (state.weaponProficiency?.spear?.level || 0) >= 1 &&
    point.tags.some(tag => ['legs', 'limb'].includes(tag)) &&
    !weaponMasteryUsed.spearCounterRisk;
  const riskSuppressed = ['open', 'exposed'].includes(preview.tellState) || spearProtection;

  if (spearProtection && !brokeNow) weaponMasteryUsed.spearCounterRisk = true;
  if (preview.weaponType === 'whip' &&
    (state.weaponProficiency?.whip?.level || 0) >= 1 &&
    point.tags.some(tag => ['tail', 'tongue', 'limb', 'legs', 'claws'].includes(tag))) {
    monster.weakPoints = monster.weakPoints.map(weakPoint =>
      weakPoint.id === point.id ? { ...weakPoint, marked: true } : weakPoint
    );
    logEntries.push(`${point.name} became Marked by the whip counter.`);
  }

  if (brokeNow) {
    logEntries.push(
      `${point.name} broke during the counter. ${point.onBreakEffect} ` +
      `Harvest quality: ${harvestResult?.quality || 'messy'}.`
    );
    if (harvestResult?.quality === 'ruined') {
      logEntries.push(`The counter ruined the delicate part. Harvest quality: Ruined.`);
    }
  } else if (point.riskOnFailedBreak && !riskSuppressed) {
    const risk = point.riskOnFailedBreak;
    const dangerousModifier = ['guarded', 'dangerous'].includes(preview.tellState) ? 1 : 0;
    const fistRisk = state.activeProficiencyType === 'fistAndTooth' &&
      (state.weaponProficiency?.fistAndTooth?.level || 0) >= 1 ? 1 : 0;
    const riskAmount = (risk.amount || 1) + dangerousModifier + preview.riskModifier;
    let riskText = '';
    if (risk.type === 'panic' || risk.type === 'panicAndTarget') {
      discardPile = [...discardPile, ...Array(riskAmount).fill(cards.panic)];
      riskText = `${survivor.name} gains ${riskAmount} Panic`;
    }
    if (risk.type === 'panicAndTarget') {
      forceNextMonsterTarget = true;
      riskText += ' and becomes the monster next target';
    } else if (risk.type === 'marked') {
      survivor.marked = Math.max(1, (survivor.marked || 0) + riskAmount);
      riskText = `${survivor.name} becomes Marked`;
    } else if (risk.type === 'bleed') {
      survivor.bleed = (survivor.bleed || 0) + riskAmount;
      riskText = `${survivor.name} gains ${riskAmount} Bleed`;
    } else if (risk.type === 'monsterHeal') {
      monster.hp = Math.min(monster.maxHp, monster.hp + riskAmount);
      riskText = `${monster.name} heals ${riskAmount}`;
    } else if (risk.type === 'monsterBlock') {
      monster.block += riskAmount;
      riskText = `${monster.name} gains ${riskAmount} block`;
    } else if (risk.type === 'monsterEnrage') {
      monster.enrage = (monster.enrage || 0) + riskAmount;
      riskText = `${monster.name} gains ${riskAmount} Enrage`;
    } else if (risk.type === 'loseBlock') {
      survivor.block = Math.max(0, survivor.block - riskAmount);
      riskText = `${survivor.name} loses ${riskAmount} block`;
    }
    if (fistRisk) {
      discardPile = [...discardPile, cards.panic];
      riskText += `${riskText ? ' and ' : ''}${survivor.name} gains 1 Panic`;
    }
    logEntries.push(`${point.name} did not break. ${riskText || 'The opening closes'}.`);
  }

  return {
    survivor,
    monster,
    drawPile,
    hand,
    discardPile,
    feedback: `Countered ${point.name}: ${monsterDamage} monster, ${preview.breakDamage} break`,
    logEntries,
    forceNextMonsterTarget,
    weaponMasteryUsed
  };
}

export function useSurvivalAction(actionId, state, options = {}) {
  if (state.status !== 'playing') return state;
  const costs = { dodge: 1, counter: 1, focus: 1, endure: 2 };
  const cost = costs[actionId];
  if (!cost || state.survivalActionsUsed.includes(actionId) || state.survivor.survival < cost) {
    return state;
  }

  let survivor = { ...state.survivor, survival: state.survivor.survival - cost };
  let monster = { ...state.monster };
  let drawPile = [...state.drawPile];
  let hand = [...state.hand];
  let discardPile = [...state.discardPile];
  let feedback = '';
  const artPassives = state.artPassives || getArtPassiveEffects(state.fightingArts);

  if (actionId === 'dodge') {
    if (survivor.snared > 0) {
      survivor.snared = reduceStatus(survivor.snared);
      feedback = 'Dodge prevented by Snared.';
    } else {
    const katanaBonus = state.activeProficiencyType === 'katana' &&
      (state.weaponProficiency?.katana?.level || 0) >= 2 ? 2 : 0;
    const learnedBonus = !state.monsterRewardTriggers?.firstDodgeBlock
      ? state.monsterRewardTraits?.filter(rule => rule.type === 'firstDodgeBlock')
        .reduce((total, rule) => total + (rule.amount || 0), 0) || 0
      : 0;
    const cowardiceBonus = state.disorders?.includes('cowardice') ? 2 : 0;
    survivor.block += 5 + katanaBonus + learnedBonus + cowardiceBonus;
    feedback = `Dodge: +${5 + katanaBonus + learnedBonus + cowardiceBonus} block`;
    }
  } else if (actionId === 'counter') {
    const counterTargetId = options.weakPointId ||
      state.selectedWeakPointId;
    const weakPointResult = counterTargetId
      ? applyCounterWeakPoint(
          state, survivor, monster, drawPile, hand, discardPile, counterTargetId
        )
      : null;
    if (weakPointResult) {
      survivor = weakPointResult.survivor;
      monster = weakPointResult.monster;
      drawPile = weakPointResult.drawPile;
      hand = weakPointResult.hand;
      discardPile = weakPointResult.discardPile;
      feedback = weakPointResult.feedback;
      state = {
        ...state,
        combatLogEntries: [
          ...(state.combatLogEntries || []),
          ...weakPointResult.logEntries
        ],
        forceNextMonsterTarget: weakPointResult.forceNextMonsterTarget,
        weaponMasteryUsed: weakPointResult.weaponMasteryUsed
      };
    } else {
      const counterDamage = getCounterBaseDamage(state);
      monster = applyDamage(monster, counterDamage);
      feedback = `Counter Body: dealt ${counterDamage} damage`;
      state = {
        ...state,
        combatLogEntries: [
          ...(state.combatLogEntries || []),
          `${survivor.name} countered ${monster.name}'s body for ${counterDamage} damage.`
        ]
      };
    }
    if (state.activeProficiencyType === 'fistAndTooth' &&
      (state.weaponProficiency?.fistAndTooth?.level || 0) >= 3 &&
      !state.weaponMasteryUsed?.fistAndTooth) {
      const drawn = drawCards(drawPile, hand, discardPile, 1);
      drawPile = drawn.deck;
      hand = drawn.hand;
      discardPile = drawn.discard;
    }
  } else if (actionId === 'focus') {
    const drawn = drawCards(drawPile, hand, discardPile, 1);
    drawPile = drawn.deck;
    hand = drawn.hand;
    discardPile = drawn.discard;
    feedback = 'Focus: drew 1 card';
  } else {
    const piles = [
      ['hand', hand],
      ['discard', discardPile],
      ['draw', drawPile]
    ];
    const target = piles.find(([, pile]) => pile.some(card => card.id === 'panic'));
    if (target) {
      const index = target[1].findIndex(card => card.id === 'panic');
      target[1].splice(index, 1);
      feedback = 'Endure: Panic removed';
    } else {
      survivor.block += 3;
      feedback = 'Endure: no Panic found, +3 block';
    }
  }
  const blockGained = Math.max(0, survivor.block - state.survivor.block);
  const counterAttackBonus = actionId === 'counter'
    ? artPassives
      .filter(passive => passive.type === 'counterNextAttackBonus')
      .reduce((total, passive) => total + (passive.value || 0), 0)
    : 0;

  return {
    ...state,
    survivor,
    monster,
    drawPile,
    hand,
    discardPile,
    blockGainedThisTurn: (state.blockGainedThisTurn || 0) + blockGained,
    survivalSpentThisTurn: (state.survivalSpentThisTurn || 0) + cost,
    nextAttackBonus: (state.nextAttackBonus || 0) + counterAttackBonus,
    nextCounterBonus: actionId === 'counter' ? 0 : state.nextCounterBonus,
    pendingCounterConfig: actionId === 'counter' ? null : state.pendingCounterConfig,
    weaponMasteryUsed: actionId === 'counter' &&
      state.activeProficiencyType === 'fistAndTooth' &&
      (state.weaponProficiency?.fistAndTooth?.level || 0) >= 3
      ? { ...state.weaponMasteryUsed, fistAndTooth: true }
      : state.weaponMasteryUsed,
    monsterRewardTriggers: actionId === 'dodge'
      ? { ...state.monsterRewardTriggers, firstDodgeBlock: true }
      : state.monsterRewardTriggers,
    survivalActionsUsed: [...state.survivalActionsUsed, actionId],
    survivalFeedback: feedback,
    status: getCombatStatus(survivor, monster)
  };
}

export function getMonsterIntentForResolution(monster, intentIndex) {
  let intent = monster.intents[intentIndex];
  const brokenEffects = (monster.weakPoints || [])
    .filter(weakPoint => weakPoint.broken && weakPoint.effect)
    .map(weakPoint => weakPoint.effect);
  const disabled = brokenEffects.some(effect =>
    effect.type === 'disableIntentTag' &&
    effect.tags?.some(tag => intent.tags?.includes(tag))
  );
  if (disabled) {
    const fallbackIntent = monster.intents.find(candidate => !brokenEffects.some(effect =>
      effect.type === 'disableIntentTag' &&
      effect.tags?.some(tag => candidate.tags?.includes(tag))
    ));
    if (fallbackIntent) intent = fallbackIntent;
  }
  return intent;
}

export function applyMonsterIntent(monster, state) {
  const intent = state.resolvedIntent ||
    getMonsterIntentForResolution(monster, state.intentIndex);
  const brokenEffects = (monster.weakPoints || [])
    .filter(weakPoint => weakPoint.broken && weakPoint.effect)
    .map(weakPoint => weakPoint.effect);
  let survivor = { ...state.survivor };
  const hpBeforeIntent = survivor.hp;
  let nextMonster = { ...monster };
  const hasMonsterBane = state.monsterBaneKnowledge?.[monster.quarryId] || 
                         state.fightingArts?.includes(`monsterBane_${monster.quarryId}`);
  
  nextMonster = applyEndTurnStatuses(nextMonster, monster.name, state.combatLogEntries);

  nextMonster.block = 0;

  // Bane Effect: Full intent visibility
  const intentHintLevel = hasMonsterBane ? 2 : (state.intentHintLevel || 0);

  let drawPile = [...state.drawPile];
  let discardPile = [...state.discardPile];
  let lanternPanicIgnored = state.lanternPanicIgnored;
  let pendingEnergyPenalty = state.pendingEnergyPenalty || 0;
  const playerHadNoBlock = survivor.block === 0;
  const passiveAttackBonus = (monster.passiveRules || [])
    .filter(rule => rule.type === 'attackBonusIfPlayerNoBlock' && playerHadNoBlock)
    .reduce((total, rule) => total + (rule.amount || 0), 0);
  const woundedAttackBonus = (monster.passiveRules || [])
    .filter(rule =>
      rule.type === 'attackBonusIfSurvivorWounded' &&
      survivor.hp < survivor.maxHp
    )
    .reduce((total, rule) => total + (rule.amount || 0), 0);

  const snaredPenalty = nextMonster.snared > 0 ? 5 : 0;
  const blindPenalty = nextMonster.blind > 0 ? 3 : 0;
  const shockPenalty = nextMonster.shock > 0 ? 1 : 0;

  let attackBonus =
    (monster.nextAttackBonus || 0) +
    (monster.enrage || 0) +
    passiveAttackBonus +
    woundedAttackBonus -
    snaredPenalty -
    blindPenalty -
    shockPenalty;
  let attackBonusConsumed = false;
  let monsterAttackCount = 0;
  let shockStatusBlocked = nextMonster.shock > 0;
  const damageSurvivor = amount => {
    const partReduction = brokenEffects
      .filter(effect =>
        effect.type === 'reduceIntentDamage' &&
        effect.tags?.some(tag => intent.tags?.includes(tag))
      )
      .reduce((total, effect) => total + (effect.amount || 0), 0);
    const bonus = attackBonusConsumed ? 0 : attackBonus;
    let reduction = 0;
    if (monster.marked) {
      reduction += state.monsterRewardTraits?.filter(rule => rule.type === 'markedDamageReduction')
        .reduce((total, rule) => total + (rule.amount || 0), 0) || 0;
    }
    if (monsterAttackCount === 0 && !state.monsterRewardTriggers?.firstMonsterAttackReduction) {
      reduction += state.monsterRewardTraits?.filter(rule => rule.type === 'firstMonsterAttackReduction')
        .reduce((total, rule) => total + (rule.amount || 0), 0) || 0;
    }
    const proficiencyReduction = monsterAttackCount === 0
      ? state.nextMonsterDamageReduction || 0
      : 0;
    const result = applyDamageToSurvivor({
      survivor,
      amount: Math.max(0, amount + bonus - reduction - proficiencyReduction - partReduction)
    });
    survivor = result.survivor;
    monsterAttackCount += 1;
    attackBonusConsumed = true;
    if (snaredPenalty) nextMonster.snared = reduceStatus(nextMonster.snared);
    if (blindPenalty) nextMonster.blind = reduceStatus(nextMonster.blind);
    if (shockPenalty) nextMonster.shock = reduceStatus(nextMonster.shock);
  };

  intent.effects.forEach(rawEffect => {
    const effect = { ...rawEffect, type: normalizeEffectType(rawEffect.type) };
    if (effect.type === 'dealDamage') {
      damageSurvivor(effect.amount);
    } else if (effect.type === 'bonusIfPlayerNoBlock' && playerHadNoBlock) {
      damageSurvivor(effect.amount);
    } else if (effect.type === 'gainBlock') {
      const reduction = brokenEffects
        .filter(partEffect => partEffect.type === 'reduceBlockGain')
        .reduce((total, partEffect) => total + (partEffect.amount || 0), 0);
      nextMonster.block += Math.max(0, effect.amount - reduction);
    } else if (effect.type === 'addPanic') {
      const ignore = state.traits?.includes('lanternEyed') && !lanternPanicIgnored;
      const partReduction = brokenEffects
        .filter(partEffect => partEffect.type === 'reducePanic')
        .reduce((total, partEffect) => total + (partEffect.amount || 0), 0);
      const amount = Math.max(0, effect.amount - (ignore ? 1 : 0) - partReduction);
      discardPile = [...discardPile, ...Array(amount).fill(cards.panic)];
      if (ignore) lanternPanicIgnored = true;
    } else if (effect.type === 'reducePlayerBlock') {
      survivor.block = Math.max(0, survivor.block - effect.amount);
    } else if (effect.type === 'removeAllPlayerBlock') {
      survivor.block = 0;
    } else if (effect.type === 'multiHitDamage') {
      for (let hit = 0; hit < effect.hits; hit += 1) damageSurvivor(effect.amount);
    } else if (effect.type === 'applyBleed') {
      if (shockStatusBlocked) {
        shockStatusBlocked = false;
        nextMonster.shock = reduceStatus(nextMonster.shock);
        return;
      }
      const reduction = brokenEffects
        .filter(partEffect => partEffect.type === 'reduceBleed')
        .reduce((total, partEffect) => total + (partEffect.amount || 0), 0);
      survivor.bleed = (survivor.bleed || 0) + Math.max(0, effect.amount - reduction);
    } else if (['burnTarget', 'poisonTarget', 'doomTarget', 'vulnerableTarget', 'staggerTarget', 'guardTarget', 'markTarget', 'exposeTarget', 'snareTarget', 'shockTarget', 'blindTarget'].includes(effect.type)) {
      if (shockStatusBlocked) {
        shockStatusBlocked = false;
        nextMonster.shock = reduceStatus(nextMonster.shock);
        return;
      }
      const statusMap = {
        burnTarget: 'burn',
        poisonTarget: 'poison',
        doomTarget: 'doom',
        vulnerableTarget: 'vulnerable',
        staggerTarget: 'staggered',
        guardTarget: 'guarded',
        markTarget: 'marked',
        exposeTarget: 'exposed',
        snareTarget: 'snared',
        shockTarget: 'shock',
        blindTarget: 'blind'
      };
      survivor = applyStatusToCombatant(survivor, statusMap[effect.type], statusAmount(effect));
    } else if (effect.type === 'applyMarked') {
      survivor.marked = Math.max(1, (survivor.marked || 0) + (effect.amount || 1));
    } else if (effect.type === 'healMonster') {
      const reduction = brokenEffects
        .filter(partEffect => partEffect.type === 'reduceHealing')
        .reduce((total, partEffect) => total + (partEffect.amount || 0), 0);
      nextMonster.hp = Math.min(nextMonster.maxHp, nextMonster.hp + Math.max(0, effect.amount - reduction));
    } else if (effect.type === 'nextAttackBonus') {
      nextMonster.nextAttackBonus = (nextMonster.nextAttackBonus || 0) + effect.amount;
    } else if (effect.type === 'playerEnergyPenaltyNextTurn') {
      pendingEnergyPenalty += effect.amount;
    } else if (effect.type === 'discardRandomCard') {
      const amount = Math.min(effect.amount || 1, drawPile.length);
      const discarded = drawPile.splice(0, amount);
      discardPile.push(...discarded);
    } else if (effect.type === 'monsterStartsGuarded') {
      nextMonster.block += effect.amount || 5;
    } else if (effect.type === 'monsterEnrage') {
      nextMonster.enrage = (nextMonster.enrage || 0) + effect.amount;
    } else if (effect.type === 'copyPlayerBlock') {
      nextMonster.block += survivor.block + (effect.amount || 0);
    } else if (effect.type === 'damageFromPlayerStrength') {
      damageSurvivor((effect.amount || 0) + (survivor.strength || 0) * (effect.multiplier || 1));
    } else if (effect.type === 'damageFromDeckSize') {
      damageSurvivor(Math.floor((state.runDeck?.length || 0) / (effect.divisor || 5)));
    }
  });

  const shieldGuardSurvived = survivor.block > 0 &&
    state.activeProficiencyType === 'shield' &&
    (state.weaponProficiency?.shield?.level || 0) >= 2 &&
    !state.weaponMasteryUsed?.shield;
  if (shieldGuardSurvived) {
    survivor.survival = Math.min(survivor.maxSurvival, survivor.survival + 1);
  }
  survivor.block = 0;
  if (attackBonusConsumed) nextMonster.nextAttackBonus = 0;
  const monsterTurnCount = (state.monsterTurnCount || 0) + 1;
  (monster.passiveRules || []).forEach(rule => {
    if (
      rule.type === 'healEveryMonsterTurns' &&
      monsterTurnCount % rule.turns === 0 &&
      !(rule.blockedByMarked && survivor.marked > 0)
    ) {
      nextMonster.hp = Math.min(nextMonster.maxHp, nextMonster.hp + rule.amount);
    }
  });
  const artTriggers = { ...(state.artTriggers || {}) };

  return {
    ...state,
    survivor,
    monster: nextMonster,
    drawPile,
    discardPile,
    lanternPanicIgnored,
    combatLogEntries: state.combatLogEntries,
    artTriggers,
    pendingEnergyPenalty,
    monsterTurnCount,
    damageTakenThisTurn: Math.max(0, hpBeforeIntent - survivor.hp),
    monsterRewardTriggers: monsterAttackCount > 0
      ? { ...state.monsterRewardTriggers, firstMonsterAttackReduction: true }
      : state.monsterRewardTriggers,
    weaponMasteryUsed: shieldGuardSurvived
      ? { ...state.weaponMasteryUsed, shield: true }
      : state.weaponMasteryUsed,
    nextMonsterDamageReduction: 0,
    status: getCombatStatus(survivor, nextMonster)
  };
}

export function endTurn(state) {
  if (state.status !== 'playing') {
    return state;
  }

  let survivorBeforeIntent = { ...state.survivor };

  survivorBeforeIntent = applyEndTurnStatuses(
    survivorBeforeIntent,
    survivorBeforeIntent.name || 'Survivor',
    state.combatLogEntries
  );

  // Apply delayed effects for next turn
  const nextEnergy = survivorBeforeIntent.energy + state.pendingEnergy;
  const drawNext = state.pendingDraw;

  const artTriggers = { ...(state.artTriggers || {}) };
  const artPassives = state.artPassives || getArtPassiveEffects(state.fightingArts);
  if ((state.attacksPlayedThisTurn || 0) === 0) {
    const survival = artPassives
      .filter(effect => effect.type === 'survivalIfNoAttack')
      .reduce((total, effect) => total + (effect.value || 0), 0);
    survivorBeforeIntent.survival = Math.min(
      survivorBeforeIntent.maxSurvival,
      survivorBeforeIntent.survival + survival
    );
  }
  if (survivorBeforeIntent.block >= 8 && !artTriggers.survivalAtTurnEndBlock) {
    const survival = artPassives
      .filter(effect => effect.type === 'survivalAtTurnEndBlock' &&
        survivorBeforeIntent.block >= effect.threshold)
      .reduce((total, effect) => total + (effect.value || 0), 0);
    survivorBeforeIntent.survival = Math.min(
      survivorBeforeIntent.maxSurvival,
      survivorBeforeIntent.survival + survival
    );
    if (survival) artTriggers.survivalAtTurnEndBlock = true;
  }
  const discardedHand = [...state.discardPile, ...state.hand];
  const afterIntent = applyMonsterIntent(state.monster, {
    ...state,
    survivor: survivorBeforeIntent,
    artTriggers,
    hand: [],
    discardPile: discardedHand
  });

  if (afterIntent.status !== 'playing') {
    return afterIntent;
  }

  const drawn = drawCards(
    afterIntent.drawPile,
    [],
    afterIntent.discardPile,
    HAND_SIZE + (state.pendingDraw || 0)
  );

  return {
    ...afterIntent,
    survivor: {
      ...afterIntent.survivor,
      energy: Math.max(0, ENERGY_PER_TURN + (state.pendingEnergy || 0) - (afterIntent.pendingEnergyPenalty || 0))
    },
    drawPile: drawn.deck,
    hand: drawn.hand,
    discardPile: drawn.discard,
    intentIndex: (state.intentIndex + 1) % state.monster.intents.length,
    pendingEnergyPenalty: 0,
    pendingEnergy: 0,
    pendingDraw: 0,
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
    weaponTurnTriggers: {},
    damageTakenLastTurn: afterIntent.damageTakenThisTurn || 0,
    damageTakenThisTurn: 0
  };
}

export function resolveAfterCombatHealing(target, outcome = 'victory') {
  const survivor = target?.survivor ? target.survivor : target;
  if (!survivor) return target;
  const healing = Math.max(
    0,
    Number(target.afterCombatHealing || survivor.afterCombatHealing || 0) || 0
  );
  if (!healing) return target;
  const { survivor: healed, healed: healedAmount } = applyHealingToSurvivor(survivor, healing);
  const log = healedAmount > 0
    ? `${healed.name || 'Survivor'} healed ${healedAmount} HP after ${outcome}.`
    : `${survivor.name || 'Survivor'} could not heal after ${outcome}.`;
  if (target?.survivor) {
    return {
      ...target,
      survivor: healed,
      afterCombatHealing: 0,
      afterCombatLog: [...(target.afterCombatLog || []), log]
    };
  }
  return {
    ...healed,
    afterCombatHealing: 0,
    afterCombatLog: [...(survivor.afterCombatLog || []), log]
  };
}

export function getPostCombatSalvageRewards(source = {}) {
  const tokens = Math.max(0, Number(source.salvageTokens || source.salvage || 0) || 0);
  return {
    salvageTokens: tokens,
    resources: Array.from({ length: tokens }, () => 'scrap'),
    log: tokens ? [`Salvage converted into ${tokens} Scrap.`] : []
  };
}
