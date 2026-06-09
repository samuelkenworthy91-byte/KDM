import { cards } from '../data/cards.js';
import { monsters } from '../data/monsters.js';
import { buildRunDeck, drawCards, shuffleCards } from './deckLogic.js';

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
      (disorders.includes('paranoia') ? 1 : 0),
    energy: Math.max(0, ENERGY_PER_TURN - (runBonus.firstTurnEnergyPenalty || 0)),
    strength,
    maxSurvival: Math.max(1, runBonus.survivor?.maxSurvival || 3),
    survival: Math.min(
      Math.max(1, runBonus.survivor?.maxSurvival || 3),
      (runBonus.survivor?.survival || 0) + conditionSurvival
    )
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
  if (disorders.includes('paranoia')) runDeck.push(cards.panic);
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
    traits,
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
  let monsterHitsThisTurn = state.monsterHitsThisTurn || 0;
  const isAttack = card.type === 'attack';
  let firstDamageEffect = true;
  let firstBlockEffect = true;

  card.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage': {
        const firstAttackPenalty = !state.firstAttackPlayed && firstDamageEffect
          ? (state.injuries?.includes('brokenArm') ? 1 : 0) +
            (state.scars?.includes('boneSetWrong') ? 1 : 0)
          : 0;
        monster = applyDamage(
          monster,
          Math.max(0, effect.amount +
          (survivor.strength || 0) +
          (state.fightingArts?.includes('clawStyle') ? 1 : 0) +
          (state.fightingArts?.includes('berserker') && survivor.block === 0 ? 1 : 0) +
          (state.disorders?.includes('deathWish') && survivor.hp <= 2 ? 1 : 0) -
          firstAttackPenalty +
          (!state.firstAttackPlayed ? state.firstAttackBonus || 0 : 0) +
          (isAttack ? nextAttackBonus : 0))
        );
        monsterHitsThisTurn += 1;
        (monster.passiveRules || []).forEach(rule => {
          if (
            rule.type === 'enrageAfterRepeatedHits' &&
            monsterHitsThisTurn === rule.hits
          ) {
            monster.enrage = (monster.enrage || 0) + (rule.amount || 1);
          }
        });
        firstDamageEffect = false;
        if (isAttack) nextAttackBonus = 0;
        break;
      }
      case 'removeMonsterBlock':
        monster = { ...monster, block: Math.max(0, monster.block - effect.amount) };
        break;
      case 'removeAllMonsterBlock':
        monster = { ...monster, block: 0 };
        break;
      case 'block': {
        const penalty = !state.firstBlockPlayed && firstBlockEffect &&
          state.injuries?.includes('crackedRibs') ? 1 : 0;
        survivor = { ...survivor, block: survivor.block + Math.max(0, effect.amount - penalty) };
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
      case 'draw': {
        const result = drawCards(drawPile, hand, discardPile, effect.amount);
        drawPile = result.deck;
        hand = result.hand;
        discardPile = result.discard;
        break;
      }
      case 'discard': {
        const discardIndex = hand.findIndex(item => item !== card);
        if (discardIndex >= 0) {
          discardPile = [...discardPile, hand[discardIndex]];
          hand = hand.filter((_, index) => index !== discardIndex);
        }
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
      case 'nextAttackBonus':
        nextAttackBonus += effect.amount;
        break;
      default:
        break;
    }
  });

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
    monsterHitsThisTurn,
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
    survivor.block += 5;
    feedback = 'Dodge: +5 block';
  } else if (actionId === 'counter') {
    const baneBonus = state.monsterBaneDamageBonus || 0;
    const traitBonus = state.traits?.includes('wolfSmile') ? 1 : 0;
    monster = applyDamage(monster, 3 + baneBonus + traitBonus);
    feedback = `Counter: dealt ${3 + baneBonus + traitBonus} damage`;
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

  return {
    ...state,
    survivor,
    monster,
    drawPile,
    hand,
    discardPile,
    survivalActionsUsed: [...state.survivalActionsUsed, actionId],
    survivalFeedback: feedback,
    status: getCombatStatus(survivor, monster)
  };
}

export function applyMonsterIntent(monster, state) {
  const intent = monster.intents[state.intentIndex];
  let survivor = { ...state.survivor };
  let nextMonster = { ...monster, block: 0 };
  let drawPile = [...state.drawPile];
  let discardPile = [...state.discardPile];
  let lanternPanicIgnored = state.lanternPanicIgnored;
  let pendingEnergyPenalty = state.pendingEnergyPenalty || 0;
  const playerHadNoBlock = survivor.block === 0;
  const passiveAttackBonus = (monster.passiveRules || [])
    .filter(rule => rule.type === 'attackBonusIfPlayerNoBlock' && playerHadNoBlock)
    .reduce((total, rule) => total + (rule.amount || 0), 0);
  let attackBonus =
    (monster.nextAttackBonus || 0) +
    (monster.enrage || 0) +
    passiveAttackBonus;
  let attackBonusConsumed = false;

  const damageSurvivor = amount => {
    const bonus = attackBonusConsumed ? 0 : attackBonus;
    survivor = applyDamage(survivor, Math.max(0, amount + bonus));
    attackBonusConsumed = true;
  };

  intent.effects.forEach(effect => {
    if (effect.type === 'dealDamage') {
      damageSurvivor(effect.amount);
    } else if (effect.type === 'bonusIfPlayerNoBlock' && playerHadNoBlock) {
      damageSurvivor(effect.amount);
    } else if (effect.type === 'gainBlock') {
      nextMonster.block += effect.amount;
    } else if (effect.type === 'addPanic') {
      const ignore = state.traits?.includes('lanternEyed') && !lanternPanicIgnored;
      const amount = Math.max(0, effect.amount - (ignore ? 1 : 0));
      discardPile = [...discardPile, ...Array(amount).fill(cards.panic)];
      if (ignore) lanternPanicIgnored = true;
    } else if (effect.type === 'reducePlayerBlock') {
      survivor.block = Math.max(0, survivor.block - effect.amount);
    } else if (effect.type === 'multiHitDamage') {
      for (let hit = 0; hit < effect.hits; hit += 1) damageSurvivor(effect.amount);
    } else if (effect.type === 'applyBleed') {
      survivor.bleed = (survivor.bleed || 0) + effect.amount;
    } else if (effect.type === 'applyMarked') {
      survivor.marked = Math.max(1, (survivor.marked || 0) + (effect.amount || 1));
    } else if (effect.type === 'healMonster') {
      nextMonster.hp = Math.min(nextMonster.maxHp, nextMonster.hp + effect.amount);
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
    }
  });

  if (survivor.bleed > 0) {
    survivor = applyDamage(survivor, 1);
    survivor.bleed = Math.max(0, survivor.bleed - 1);
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
    survivalFeedback: ''
  };
}
