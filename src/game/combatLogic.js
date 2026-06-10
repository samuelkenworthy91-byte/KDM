import { cards } from '../data/cards.js';
import { monsters } from '../data/monsters.js';
import { findMonsterSurvivorReward } from '../data/monsterSurvivorRewards.js';
import { createWeaponProficiency } from '../data/weaponProficiency.js';
import { buildRunDeck, drawCards, shuffleCards } from './deckLogic.js';
import { createHitLocations } from '../data/woundTables.js';
import {
  getTellBreakModifier,
  getWeakPointTellState,
  getWeaponSuitability,
  rollHarvestQuality
} from '../data/weakPoints.js';

const HAND_SIZE = 5;
const ENERGY_PER_TURN = 3;

function applyDamage(target, amount) {
  const absorbed = Math.min(target.block, amount);

  return {
    ...target,
    block: target.block - absorbed,
    hp: Math.max(0, target.hp - (amount - absorbed))
  };
}

function applyDirectDamage(target, amount) {
  return { ...target, hp: Math.max(0, target.hp - amount) };
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
      (arts.includes('tumble') ? 3 : 0) +
      (arts.includes('scarTissue') ? 2 : 0) +
      (scars.includes('hornBruise') && quarryId === 'wailingAntelope' ? 2 : 0) +
      (disorders.includes('paranoia') && !runBonus.hasMonsterBane ? 3 : 0),
    energy: Math.max(0, ENERGY_PER_TURN - (runBonus.firstTurnEnergyPenalty || 0)),
    strength,
    maxSurvival: Math.max(1, runBonus.survivor?.maxSurvival || 3),
    survival: Math.min(
      Math.max(1, runBonus.survivor?.maxSurvival || 3),
      (runBonus.survivor?.survival || 0) + conditionSurvival
    ),
    hitLocations: createHitLocations(runBonus.survivor?.hitLocations),
    treatmentNotes: [...(runBonus.survivor?.treatmentNotes || [])]
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
    intents: monsterOverride.intents.map(intent => ({
      ...intent,
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
    activeWeaponTypes: [...new Set(runDeck.map(card => card.weaponType).filter(Boolean))],
    weaponCardsPlayed: {},
    weaponMasteryUsed: {},
    weaponTurnTriggers: {},
    damageTakenLastTurn: 0,
    damageTakenThisTurn: 0,
    nextMonsterDamageReduction: 0,
    scarlessUsed: false,
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
    nextAttackMarks: false,
    selectedWeakPointId: null,
    weakPointFeedback: '',
    combatLogEntries: [],
    status: 'playing'
  };
}

export function playCard(cardIndex, state) {
  if (state.status !== 'playing') {
    return state;
  }

  const card = state.hand[cardIndex];

  if (!card || card.unplayable || card.cost > state.survivor.energy) {
    return state;
  }

  let survivor = {
    ...state.survivor,
    energy: state.survivor.energy - card.cost
  };
  let monster = { ...state.monster };
  let drawPile = state.drawPile;
  let hand = state.hand;
  let discardPile = state.discardPile;
  let exhaustPile = state.exhaustPile || [];
  let nextAttackBonus = state.nextAttackBonus || 0;
  let nextAttackMarks = state.nextAttackMarks || false;
  let monsterHitsThisTurn = state.monsterHitsThisTurn || 0;
  let blockGainedThisTurn = state.blockGainedThisTurn || 0;
  let cardDiscardedThisTurn = state.cardDiscardedThisTurn || false;
  let intentHintLevel = state.intentHintLevel || 0;
  let emittedPartyEffects = [...(state.emittedPartyEffects || [])];
  const isAttack = card.type === 'attack';
  const weaponType = card.weaponType;
  const proficiencyLevel = weaponType ? state.weaponProficiency?.[weaponType]?.level || 0 : 0;
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
  if (selectedWeakPoint && cardTags.includes('exposeWeakPoint')) tellState = 'exposed';
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
  const combatLogEntries = [];

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
      proficiencyDamageBonus += Math.min(8, survivor.block);
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
    if (monster.marked) amount += effect.bonusIfMonsterMarked || 0;
    if (survivor.hp < survivor.maxHp) amount += effect.bonusIfSurvivorWounded || 0;
    if (panicInDiscard()) amount += effect.bonusIfPanicInDiscard || 0;
    if ((state.survivalSpentThisTurn || 0) > 0) amount += effect.bonusIfSurvivalSpent || 0;
    if ((state.cardsPlayedThisTurn || 0) === 0) amount += effect.bonusIfFirstCard || 0;
    if ((state.attacksPlayedThisTurn || 0) === 1) amount += effect.bonusIfSecondAttack || 0;
    if ((state.attacksPlayedThisTurn || 0) === 0) amount += effect.bonusIfFirstAttack || 0;
    if (survivor.block > 0) amount += effect.bonusIfBlock || 0;
    if ((state.blockGainedThisTurn || 0) > 0) amount += effect.bonusIfBlockThisTurn || 0;
    if (monster.block <= 0) amount += effect.bonusIfMonsterNoBlock || 0;
    if (monster.block > 0) amount += effect.bonusIfMonsterHasBlock || 0;
    if (monster.bleed > 0) amount += effect.bonusIfMonsterBleeding || 0;
    if (monster.hp < monster.maxHp / 2) amount += effect.bonusIfMonsterWounded || 0;
    if ((state.cardsPlayedThisTurn || 0) >= (effect.cardsRequired || Infinity)) {
      amount += effect.bonusIfCardsPlayed || 0;
    }
    if (survivor.survival >= (effect.survivalRequired || Infinity)) {
      amount += effect.bonusIfHighSurvival || 0;
    }
    if (state.previousCardType === 'skill') amount += effect.bonusIfPreviousCardSkill || 0;
    if (state.cardDiscardedThisTurn) amount += effect.bonusIfCardDiscarded || 0;
    amount += Math.min(
      effect.maximumBonus || Infinity,
      panicInDiscard() * (effect.bonusPerPanicInDiscard || 0)
    );
    return amount;
  };
  const dealCardDamage = effect => {
    const firstAttackPenalty = !state.firstAttackPlayed && firstDamageEffect
      ? (state.injuries?.includes('brokenArm') ? 1 : 0) +
        (state.scars?.includes('boneSetWrong') ? 1 : 0)
      : 0;
    const amount = Math.max(0,
      conditionalDamage(effect) +
      (survivor.strength || 0) +
      (state.fightingArts?.includes('clawStyle') ? 1 : 0) +
      (state.fightingArts?.includes('berserker') && survivor.block === 0 ? 1 : 0) +
      (state.disorders?.includes('deathWish') && survivor.hp <= 2 ? 2 : 0) +
      (!state.firstAttackPlayed && state.disorders?.includes('recklessJoy') ? 2 : 0) -
      (!state.firstAttackPlayed && state.disorders?.includes('cowardice') ? 1 : 0) -
      firstAttackPenalty +
      (!state.firstAttackPlayed ? state.firstAttackBonus || 0 : 0) +
      (isAttack ? nextAttackBonus : 0) +
      proficiencyDamageBonus +
      (state.fightingArts?.includes('bloodMemory') && state.woundHistory?.length ? 1 : 0) +
      (state.fightingArts?.includes('boneSetWrong') &&
        ['hammer', 'club', 'axe', 'grandWeapon', 'scythe'].includes(weaponType) ? 1 : 0) +
      (effect.type === 'multiHitDamage' ? proficiencyPerHitBonus : 0)
    );
    const monsterDamage = selectedWeakPoint
      ? Math.max(0, Math.floor(amount * selectedWeakPoint.monsterDamageMultiplier))
      : amount;
    const hpBefore = monster.hp;
    monster = effect.ignoreBlockIfMonsterMarked && monster.marked
      ? applyDirectDamage(monster, monsterDamage)
      : applyDamage(monster, monsterDamage);
    const dealt = Math.max(0, hpBefore - monster.hp);
    if (selectedWeakPoint && amount > 0) {
      weakPointAttempted = true;
      let flatBreakBonus = selectedWeakPoint.marked || monster.marked ? 1 : 0;
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
        (amount + flatBreakBonus) *
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
    if (isAttack) {
      nextAttackBonus = 0;
      nextAttackMarks = false;
    }
  };

  card.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage': {
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
        monster.bleed = (monster.bleed || 0) + effect.amount;
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
        const gained = Math.max(0, effect.amount - penalty) +
          (state.hasMonsterBane ? effect.bonusIfMonsterBane || 0 : 0);
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
      case 'heal':
        survivor.hp = Math.min(survivor.maxHp, survivor.hp + effect.amount);
        break;
      case 'healIfBelowHalf':
        if (survivor.hp < survivor.maxHp / 2) survivor.hp = Math.min(survivor.maxHp, survivor.hp + effect.amount);
        break;
      case 'healIfWounded':
        if (survivor.hp < survivor.maxHp) survivor.hp = Math.min(survivor.maxHp, survivor.hp + effect.amount);
        break;
      case 'healIfWoundedOrBlock':
        if (survivor.hp < survivor.maxHp) survivor.hp = Math.min(survivor.maxHp, survivor.hp + effect.heal);
        else {
          survivor.block += effect.block;
          blockGainedThisTurn += effect.block;
        }
        break;
      case 'loseHp':
        survivor.hp = Math.max(1, survivor.hp - effect.amount);
        break;
      case 'draw': {
        drawAmount(effect.amount);
        break;
      }
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
      case 'addPanic':
        discardPile = [...discardPile, ...Array(effect.amount).fill(cards.panic)];
        break;
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
      case 'nextAttackBonus':
        nextAttackBonus += effect.amount;
        break;
      case 'nextAttackBonusIfMonsterBane':
        if (state.hasMonsterBane) nextAttackBonus += effect.amount;
        break;
      case 'nextAttackMarks':
        nextAttackMarks = true;
        break;
      case 'nextCounterBonus':
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
    monsterHitsThisTurn,
    cardsPlayedThisTurn: (state.cardsPlayedThisTurn || 0) + 1,
    attacksPlayedThisTurn: (state.attacksPlayedThisTurn || 0) + (isAttack ? 1 : 0),
    blockGainedThisTurn,
    cardDiscardedThisTurn,
    previousCardType: card.type,
    weaponCardsPlayed,
    weaponMasteryUsed,
    weaponTurnTriggers,
    monsterRewardTriggers,
    nextMonsterDamageReduction,
    intentHintLevel,
    emittedPartyEffects,
    firstAttackPlayed: state.firstAttackPlayed || card.type === 'attack',
    firstBlockPlayed: state.firstBlockPlayed ||
      card.effects.some(effect => ['block', 'conditionalBlock'].includes(effect.type)),
    status: getCombatStatus(survivor, monster)
  };
}

export function useSurvivalAction(actionId, state) {
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

  if (actionId === 'dodge') {
    const katanaBonus = state.activeWeaponTypes?.includes('katana') &&
      (state.weaponProficiency?.katana?.level || 0) >= 2 ? 2 : 0;
    const learnedBonus = !state.monsterRewardTriggers?.firstDodgeBlock
      ? state.monsterRewardTraits?.filter(rule => rule.type === 'firstDodgeBlock')
        .reduce((total, rule) => total + (rule.amount || 0), 0) || 0
      : 0;
    const cowardiceBonus = state.disorders?.includes('cowardice') ? 2 : 0;
    survivor.block += 5 + katanaBonus + learnedBonus + cowardiceBonus;
    feedback = `Dodge: +${5 + katanaBonus + learnedBonus + cowardiceBonus} block`;
  } else if (actionId === 'counter') {
    const baneBonus = state.monsterBaneDamageBonus || 0;
    const traitBonus = state.traits?.includes('wolfSmile') ? 1 : 0;
    const gearBonus = (state.counterDamageBonus || 0) + (state.nextCounterBonus || 0);
    const fistBonus = state.activeWeaponTypes?.includes('fistAndTooth') &&
      (state.weaponProficiency?.fistAndTooth?.level || 0) >= 2 ? 1 : 0;
    const counterDamage = 3 + baneBonus + traitBonus + gearBonus + fistBonus;
    monster = applyDamage(monster, counterDamage);
    feedback = `Counter: dealt ${counterDamage} damage`;
    if ((state.weaponProficiency?.fistAndTooth?.level || 0) >= 3 &&
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

  return {
    ...state,
    survivor,
    monster,
    drawPile,
    hand,
    discardPile,
    blockGainedThisTurn: (state.blockGainedThisTurn || 0) + blockGained,
    survivalSpentThisTurn: (state.survivalSpentThisTurn || 0) + cost,
    nextCounterBonus: actionId === 'counter' ? 0 : state.nextCounterBonus,
    weaponMasteryUsed: actionId === 'counter' &&
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

export function applyMonsterIntent(monster, state) {
  let intent = monster.intents[state.intentIndex];
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
  let survivor = { ...state.survivor };
  const hpBeforeIntent = survivor.hp;
  let nextMonster = { ...monster, block: 0 };
  if (nextMonster.bleed > 0) {
    nextMonster = applyDirectDamage(nextMonster, 1);
    nextMonster.bleed = Math.max(0, nextMonster.bleed - 1);
  }
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
  let attackBonus =
    (monster.nextAttackBonus || 0) +
    (monster.enrage || 0) +
    passiveAttackBonus +
    woundedAttackBonus;
  let attackBonusConsumed = false;
  let monsterAttackCount = 0;

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
    survivor = applyDamage(
      survivor,
      Math.max(0, amount + bonus - reduction - proficiencyReduction - partReduction)
    );
    monsterAttackCount += 1;
    attackBonusConsumed = true;
  };

  intent.effects.forEach(effect => {
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
      const reduction = brokenEffects
        .filter(partEffect => partEffect.type === 'reduceBleed')
        .reduce((total, partEffect) => total + (partEffect.amount || 0), 0);
      survivor.bleed = (survivor.bleed || 0) + Math.max(0, effect.amount - reduction);
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

  if (survivor.bleed > 0) {
    survivor = applyDamage(survivor, 1);
    survivor.bleed = Math.max(0, survivor.bleed - 1);
  }
  const shieldGuardSurvived = survivor.block > 0 &&
    state.activeWeaponTypes?.includes('shield') &&
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
  let scarlessUsed = state.scarlessUsed;
  if (
    survivor.hp <= 0 &&
    state.traits?.includes('scarless') &&
    !state.scarlessUsed
  ) {
    survivor.hp = 1;
    scarlessUsed = true;
  }

  return {
    ...state,
    survivor,
    monster: nextMonster,
    drawPile,
    discardPile,
    lanternPanicIgnored,
    scarlessUsed,
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

  const discardedHand = [...state.discardPile, ...state.hand];
  const afterIntent = applyMonsterIntent(state.monster, {
    ...state,
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
    HAND_SIZE
  );

  return {
    ...afterIntent,
    survivor: {
      ...afterIntent.survivor,
      energy: Math.max(0, ENERGY_PER_TURN - (afterIntent.pendingEnergyPenalty || 0))
    },
    drawPile: drawn.deck,
    hand: drawn.hand,
    discardPile: drawn.discard,
    intentIndex: (state.intentIndex + 1) % state.monster.intents.length,
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
    weaponTurnTriggers: {},
    damageTakenLastTurn: afterIntent.damageTakenThisTurn || 0,
    damageTakenThisTurn: 0
  };
}
