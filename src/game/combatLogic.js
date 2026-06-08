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
  const equipmentEffects = runBonus.equipmentEffects || {};
  const addedCards = [...(runBonus.deckCardIds || []), ...(runBonus.nextCombatCardIds || [])]
    .map(cardId => cards[cardId])
    .filter(Boolean);
  const openingHandSize = HAND_SIZE + (equipmentEffects.firstTurnDrawBonus || 0);
  const survivor = {
    name: 'Survivor',
    hp: 30 + extraMaxHp,
    maxHp: 30 + extraMaxHp,
    block: equipmentEffects.startBlock || 0,
    energy: ENERGY_PER_TURN,
    strength,
    evasion: 0
  };
  const monster = {
    ...monsterOverride,
    block: monsterOverride.block ?? 0,
    maxHp: monsterOverride.maxHp ?? monsterOverride.hp,
    intents: monsterOverride.intents.map(intent => ({ ...intent }))
  };
  const initialDraw = drawCards(
    shuffleCards([...starterDeck, ...addedCards]),
    [],
    [],
    openingHandSize
  );

  return {
    survivor,
    monster,
    drawPile: initialDraw.deck,
    hand: initialDraw.hand,
    discardPile: initialDraw.discard,
    intentIndex: 0,
    attackDamageBonus: equipmentEffects.attackDamageBonus || 0,
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

  card.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage': {
        const attackBonus = card.type === 'attack' ? state.attackDamageBonus || 0 : 0;
        const damage = effect.amount + (survivor.strength || 0) + attackBonus;
        const hits = effect.hits || 1;
        for (let hit = 0; hit < hits; hit += 1) {
          monster = applyDamage(monster, damage);
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
      case 'evasion':
        survivor = { ...survivor, evasion: (survivor.evasion || 0) + effect.amount };
        break;
      case 'bleed':
        monster = { ...monster, bleed: (monster.bleed || 0) + effect.amount };
        break;
      default:
        break;
    }
  });

  const playedCardIndex = hand.indexOf(card);
  const discarded = card.exhaust
    ? {
        hand: hand.filter((_, index) => index !== playedCardIndex),
        discard: discardPile
      }
    : discardCard(hand, discardPile, playedCardIndex);

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
    if ((survivor.evasion || 0) > 0) {
      survivor.evasion -= 1;
    } else {
      survivor = applyDamage(survivor, intent.damage);
    }
  } else if (intent.type === 'block') {
    nextMonster.block += intent.block;
  }

  if ((nextMonster.bleed || 0) > 0) {
    nextMonster = applyDamage(nextMonster, nextMonster.bleed);
  }

  survivor.block = 0;
  survivor.evasion = 0;

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
