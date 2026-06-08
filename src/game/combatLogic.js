import { cards, starterDeck } from '../data/cards.js';
import { monsters } from '../data/monsters.js';
import { discardCard, drawCards, shuffleCards } from './deckLogic.js';

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
  const strength = runBonus.firstCombatStrength || 0;
  const maxHp = 30 + extraMaxHp;
  const modifiers = runBonus.nextCombatModifiers || {};
  const fightingArts = runBonus.fightingArts || [];
  const energy = Math.max(0, ENERGY_PER_TURN - (modifiers.firstTurnEnergyPenalty || 0));
  const survivor = {
    name: runBonus.survivorName || 'Nameless Survivor',
    hp: Math.min(runBonus.currentHp ?? maxHp, maxHp),
    maxHp,
    block: (modifiers.startBlock || 0) + (fightingArts.includes('tumble') ? 3 : 0),
    energy,
    strength
  };
  const monsterBonusHp = modifiers.monsterBonusHp || 0;
  const monster = {
    ...monsterOverride,
    hp: Math.max(1, monsterOverride.hp + monsterBonusHp),
    block: monsterOverride.block ?? 0,
    maxHp: Math.max(
      1,
      (monsterOverride.maxHp ?? monsterOverride.hp) + monsterBonusHp
    ),
    intents: monsterOverride.intents.map(intent => ({ ...intent }))
  };
  const runDeck = (runBonus.deck || [])
    .map(cardId => cards[cardId])
    .filter(Boolean);
  const combatDeck = runDeck.length ? runDeck : starterDeck;
  const initialDraw = drawCards(shuffleCards(combatDeck), [], [], HAND_SIZE);

  return {
    survivor,
    monster,
    drawPile: initialDraw.deck,
    hand: initialDraw.hand,
    discardPile: initialDraw.discard,
    intentIndex: 0,
    fightingArts,
    status: getCombatStatus(survivor, monster)
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

  card.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage': {
        const berserkerBonus =
          state.fightingArts?.includes('berserker') && survivor.block === 0 ? 1 : 0;
        monster = applyDamage(
          monster,
          effect.amount + (survivor.strength || 0) + berserkerBonus
        );
        if (state.fightingArts?.includes('clawStyle')) {
          monster = { ...monster, bleed: (monster.bleed || 0) + 1 };
        }
        break;
      }
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
      default:
        break;
    }
  });

  const playedCardIndex = hand.indexOf(card);
  const discarded = discardCard(hand, discardPile, playedCardIndex);

  return {
    ...state,
    survivor,
    monster,
    drawPile,
    hand: discarded.hand,
    discardPile: discarded.discard,
    status: getCombatStatus(survivor, monster)
  };
}

export function applyMonsterIntent(monster, state) {
  const intent = monster.intents[state.intentIndex];
  let survivor = { ...state.survivor };
  let nextMonster = { ...monster, block: 0 };

  if (intent.type === 'attack') {
    survivor = applyDamage(survivor, intent.damage);
  } else if (intent.type === 'block') {
    nextMonster.block += intent.block;
  }

  if ((nextMonster.bleed || 0) > 0) {
    nextMonster = applyDamage(nextMonster, nextMonster.bleed);
  }

  survivor.block = 0;

  return {
    ...state,
    survivor,
    monster: nextMonster,
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
