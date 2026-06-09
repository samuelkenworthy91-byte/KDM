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
  const strength = (runBonus.firstCombatStrength || 0) + (runBonus.survivor?.strength || 0);
  const handSize = HAND_SIZE + (runBonus.extraFirstTurnDraw || 0) + (arts.includes('focusedBreath') ? 1 : 0);
  const maxHp = runBonus.survivor?.maxHp || 30;
  const currentHp = runBonus.survivor?.hp ?? maxHp;
  const survivor = {
    name: runBonus.survivor?.name || 'Survivor',
    hp: Math.min(currentHp + extraMaxHp, maxHp + extraMaxHp),
    maxHp: maxHp + extraMaxHp,
    block:
      (runBonus.startingBlock || 0) +
      (arts.includes('tumble') ? 3 : 0) +
      (arts.includes('scarTissue') ? 2 : 0),
    energy: Math.max(0, ENERGY_PER_TURN - (runBonus.firstTurnEnergyPenalty || 0)),
    strength
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
  const runDeck = runBonus.runDeck || buildRunDeck({ survivor: runBonus.survivor });
  const initialDraw = drawCards(shuffleCards(runDeck), [], [], handSize);

  return {
    survivor,
    monster,
    drawPile: initialDraw.deck,
    hand: initialDraw.hand,
    discardPile: initialDraw.discard,
    exhaustPile: [],
    runDeck,
    intentIndex: 0,
    fightingArts: arts,
    firstAttackBonus: runBonus.firstAttackBonus || 0,
    firstAttackPlayed: false,
    nextAttackBonus: 0,
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
  const isAttack = card.type === 'attack';

  card.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage':
        monster = applyDamage(
          monster,
          effect.amount +
          (survivor.strength || 0) +
          (state.fightingArts?.includes('clawStyle') ? 1 : 0) +
          (state.fightingArts?.includes('berserker') && survivor.block === 0 ? 1 : 0) +
          (!state.firstAttackPlayed ? state.firstAttackBonus || 0 : 0) +
          (isAttack ? nextAttackBonus : 0)
        );
        if (isAttack) nextAttackBonus = 0;
        break;
      case 'removeMonsterBlock':
        monster = { ...monster, block: Math.max(0, monster.block - effect.amount) };
        break;
      case 'removeAllMonsterBlock':
        monster = { ...monster, block: 0 };
        break;
      case 'block':
        survivor = { ...survivor, block: survivor.block + effect.amount };
        break;
      case 'conditionalBlock': {
        const isLowHp = survivor.hp < survivor.maxHp / 2;
        const block = isLowHp ? effect.lowHpAmount : effect.amount;
        survivor = { ...survivor, block: survivor.block + block };
        break;
      }
      case 'energy':
        survivor = { ...survivor, energy: survivor.energy + effect.amount };
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
    firstAttackPlayed: state.firstAttackPlayed || card.type === 'attack',
    status: getCombatStatus(survivor, monster)
  };
}

export function applyMonsterIntent(monster, state) {
  const intent = monster.intents[state.intentIndex];
  let survivor = { ...state.survivor };
  let nextMonster = { ...monster, block: 0 };
  let drawPile = state.drawPile;
  let discardPile = state.discardPile;
  const playerHadNoBlock = survivor.block === 0;

  intent.effects.forEach(effect => {
    if (effect.type === 'dealDamage') {
      survivor = applyDamage(survivor, effect.amount);
    } else if (effect.type === 'bonusIfPlayerNoBlock' && playerHadNoBlock) {
      survivor = applyDamage(survivor, effect.amount);
    } else if (effect.type === 'gainBlock') {
      nextMonster.block += effect.amount;
    } else if (effect.type === 'addPanic') {
      discardPile = [...discardPile, ...Array(effect.amount).fill(cards.panic)];
    }
  });

  survivor.block = 0;

  return {
    ...state,
    survivor,
    monster: nextMonster,
    drawPile,
    discardPile,
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
    survivor: { ...afterIntent.survivor, energy: ENERGY_PER_TURN },
    drawPile: drawn.deck,
    hand: drawn.hand,
    discardPile: drawn.discard,
    intentIndex: (state.intentIndex + 1) % state.monster.intents.length
  };
}
