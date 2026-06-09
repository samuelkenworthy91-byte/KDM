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

function withSource(card, source) {
  return source ? { ...card, source } : card;
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

function chooseWeightedIntent(intents, level) {
  const weighted = intents.map(intent => ({
    intent,
    weight: Math.max(0, intent.weight + (intent.levelWeights?.[level] || 0))
  }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.intent;
  }
  return intents[0];
}

function effectAmount(effect, monster) {
  const base = effect.scalesWithDamage ? monster.damage : 0;
  return Math.max(0, base + (effect.amount || 0) + (effect.perLevel || 0) * (monster.level - 1));
}

export function createCombatState(monsterOverride = monsters.whiteLion, runBonus = {}) {
  const maxHp = runBonus.maxHp || 30;
  const strength = (runBonus.strength || 0) + (runBonus.firstCombatStrength || 0);
  const fightingArts = runBonus.fightingArts || [];
  const equipmentEffects = runBonus.equipmentEffects || {};
  const scarBlock = runBonus.scars?.includes('scarTissue') ? 2 : 0;
  const survivor = {
    name: runBonus.survivorName || 'Nameless Survivor',
    hp: Math.min(runBonus.currentHp ?? maxHp, maxHp),
    maxHp,
    block:
      (equipmentEffects.startBlock || 0) +
      (runBonus.nextCombatStartBlock || 0) +
      (fightingArts.includes('tumble') ? 3 : 0) +
      scarBlock,
    energy: Math.max(0, ENERGY_PER_TURN - (runBonus.nextCombatEnergyPenalty || 0)),
    strength,
    evasion: 0,
    survival: runBonus.survival || 0
  };
  const monster = {
    ...monsterOverride,
    block: monsterOverride.block ?? 0,
    maxHp: monsterOverride.maxHp ?? monsterOverride.hp,
    level: monsterOverride.level || 1,
    damage: monsterOverride.damage || 5,
    passiveRules: monsterOverride.passiveRules || [],
    intents: monsterOverride.intents.map(intent => ({
      ...intent,
      effects: (intent.effects || []).map(effect => ({ ...effect }))
    })),
    nextAttackBonus: 0,
    enrage: 0,
    turnCount: 0
  };
  const runDeck = (runBonus.deck || [])
    .map(cardId => withSource(cards[cardId], runBonus.personalCardIds?.includes(cardId) ? 'Survivor' : 'Starter'))
    .filter(Boolean);
  const gearCards = (equipmentEffects.cardIds || [])
    .map(entry => typeof entry === 'string'
      ? cards[entry]
      : withSource(cards[entry.cardId], entry.source))
    .filter(Boolean);
  const combatDeck = [
    ...(runDeck.length ? runDeck : starterDeck),
    ...gearCards
  ];
  const initialDraw = drawCards(
    shuffleCards(combatDeck),
    [],
    [],
    HAND_SIZE + (equipmentEffects.firstTurnDrawBonus || 0)
  );

  return {
    survivor,
    monster,
    drawPile: initialDraw.deck,
    hand: initialDraw.hand,
    discardPile: initialDraw.discard,
    currentIntent: chooseWeightedIntent(monster.intents, monster.level),
    fightingArts,
    traits: runBonus.traits || [],
    scarlessUsed: false,
    attackDamageBonus:
      (equipmentEffects.attackDamageBonus || 0) +
      (fightingArts.includes('monsterClawStyle') ? 1 : 0),
    noBlockAttackBonus: equipmentEffects.noBlockAttackBonus || 0,
    firstSkillBlockBonus: equipmentEffects.firstSkillBlockBonus || 0,
    attacksPlayedThisTurn: 0,
    skillsPlayedThisCombat: 0,
    nextAttackBonus: 0,
    pendingEnergyPenalty: 0,
    healthThresholdsCrossed: 0,
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
  const priorAttacks = state.attacksPlayedThisTurn || 0;
  const attackCount = priorAttacks + (card.type === 'attack' ? 1 : 0);
  const firstSkillBonus =
    card.type === 'skill' && (state.skillsPlayedThisCombat || 0) === 0
      ? state.firstSkillBlockBonus || 0
      : 0;
  let nextAttackBonus = state.nextAttackBonus || 0;
  const monsterHpBeforeCards = monster.hp;
  if (firstSkillBonus) {
    survivor = { ...survivor, block: survivor.block + firstSkillBonus };
  }

  card.effects.forEach(effect => {
    switch (effect.type) {
      case 'damage': {
        const berserkerBonus =
          state.fightingArts?.includes('berserker') && survivor.block === 0 ? 1 : 0;
        const damage =
          effect.amount +
          (effect.bonusIfPriorAttack && priorAttacks > 0 ? effect.bonusIfPriorAttack : 0) +
          (survivor.strength || 0) +
          berserkerBonus +
          (state.attackDamageBonus || 0) +
          (survivor.block === 0 ? state.noBlockAttackBonus || 0 : 0) +
          (card.type === 'attack' ? nextAttackBonus : 0);
        for (let hit = 0; hit < (effect.hits || 1); hit += 1) {
          monster = applyDamage(monster, damage);
        }
        if (card.type === 'attack') {
          nextAttackBonus = 0;
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
      case 'drawIfAttackCount':
        if (attackCount >= effect.minimum) {
          const result = drawCards(drawPile, hand, discardPile, effect.amount);
          drawPile = result.deck;
          hand = result.hand;
          discardPile = result.discard;
        }
        break;
      case 'evasion':
        survivor = { ...survivor, evasion: (survivor.evasion || 0) + effect.amount };
        break;
      case 'survival':
        survivor = { ...survivor, survival: (survivor.survival || 0) + effect.amount };
        break;
      case 'breakBlock':
        monster = { ...monster, block: Math.max(0, monster.block - effect.amount) };
        break;
      case 'removeBlock':
        monster = { ...monster, block: 0 };
        break;
      case 'mark':
        monster = { ...monster, marked: (monster.marked || 0) + effect.amount };
        break;
      case 'conditionalDamage':
        if (effect.condition === 'monsterMarked' && monster.marked > 0) {
          monster = applyDamage(monster, effect.amount + (survivor.strength || 0));
        }
        break;
      case 'addCardToDiscard':
        if (cards[effect.cardId]) {
          discardPile = [...discardPile, cards[effect.cardId]];
        }
        break;
      case 'discard': {
        const discardCount = Math.min(effect.amount, Math.max(0, hand.length - 1));
        const otherCards = hand.filter(item => item !== card);
        const discardedCards = otherCards.slice(0, discardCount);
        hand = hand.filter(item => !discardedCards.includes(item));
        discardPile = [...discardPile, ...discardedCards];
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
  const discarded = card.exhaust
    ? {
        hand: hand.filter((_, index) => index !== playedCardIndex),
        discard: discardPile
      }
    : discardCard(hand, discardPile, playedCardIndex);

  let nextDiscardPile = discarded.discard;
  let healthThresholdsCrossed = state.healthThresholdsCrossed || 0;
  const hasMemoryShed = monster.passiveRules?.some(rule => rule.id === 'memoryShed');
  if (hasMemoryShed && monster.hp < monsterHpBeforeCards) {
    const crossed = Math.min(3, Math.floor((monster.maxHp - monster.hp) / (monster.maxHp / 4)));
    if (crossed > healthThresholdsCrossed && cards.ash) {
      nextDiscardPile = [...nextDiscardPile, ...Array.from(
        { length: crossed - healthThresholdsCrossed },
        () => cards.ash
      )];
      healthThresholdsCrossed = crossed;
    }
  }

  return {
    ...state,
    survivor,
    monster,
    drawPile,
    hand: discarded.hand,
    discardPile: nextDiscardPile,
    attacksPlayedThisTurn: attackCount,
    skillsPlayedThisCombat:
      (state.skillsPlayedThisCombat || 0) + (card.type === 'skill' ? 1 : 0),
    nextAttackBonus,
    healthThresholdsCrossed,
    status: getCombatStatus(survivor, monster)
  };
}

export function applyMonsterIntent(monster, state) {
  const intent = state.currentIntent;
  let survivor = { ...state.survivor };
  let nextMonster = { ...monster, block: 0 };
  let drawPile = [...state.drawPile];
  let hand = [...state.hand];
  let discardPile = [...state.discardPile];
  let pendingEnergyPenalty = state.pendingEnergyPenalty || 0;
  let attackBonusAvailable = (nextMonster.nextAttackBonus || 0) + (nextMonster.enrage || 0);

  const damagePlayer = amount => {
    if ((survivor.evasion || 0) > 0) {
      survivor.evasion -= 1;
      return;
    }
    survivor = applyDamage(survivor, amount);
  };

  (intent.effects || []).forEach(effect => {
    switch (effect.type) {
      case 'dealDamage': {
        const exposedBonus = effect.bonusIfPlayerNoBlock && survivor.block === 0
          ? effect.bonusIfPlayerNoBlock
          : 0;
        damagePlayer(effectAmount(effect, nextMonster) + attackBonusAvailable + exposedBonus);
        attackBonusAvailable = 0;
        nextMonster.nextAttackBonus = 0;
        break;
      }
      case 'multiHitDamage': {
        const amount = effectAmount(effect, nextMonster) + attackBonusAvailable;
        attackBonusAvailable = 0;
        nextMonster.nextAttackBonus = 0;
        for (let hit = 0; hit < effect.hits; hit += 1) damagePlayer(amount);
        break;
      }
      case 'gainBlock':
        nextMonster.block += effectAmount(effect, nextMonster);
        break;
      case 'applyBleed':
        survivor.bleed = (survivor.bleed || 0) + effect.amount;
        break;
      case 'addPanicToPlayerDeck':
        discardPile.push(...Array.from({ length: effect.amount || 1 }, () => cards.panic));
        break;
      case 'reducePlayerBlock':
        survivor.block = Math.max(0, survivor.block - effectAmount(effect, nextMonster));
        break;
      case 'healMonster':
        nextMonster.hp = Math.min(nextMonster.maxHp, nextMonster.hp + effectAmount(effect, nextMonster));
        break;
      case 'monsterNextAttackBonus':
        nextMonster.nextAttackBonus = (nextMonster.nextAttackBonus || 0) + effect.amount;
        break;
      case 'playerEnergyPenaltyNextTurn':
        pendingEnergyPenalty += effect.amount;
        break;
      case 'discardRandomCard': {
        const source = hand.length ? 'hand' : 'draw';
        const pile = source === 'hand' ? hand : drawPile;
        if (pile.length) {
          const index = Math.floor(Math.random() * pile.length);
          const [discardedCard] = pile.splice(index, 1);
          discardPile.push(discardedCard);
        }
        break;
      }
      case 'drawDisruption': {
        const disruption = cards[effect.cardId] || cards.panic;
        discardPile.push(...Array.from({ length: effect.amount || 1 }, () => disruption));
        break;
      }
      case 'monsterEnrage':
        nextMonster.enrage = (nextMonster.enrage || 0) + effect.amount;
        break;
      default:
        break;
    }
  });

  nextMonster.turnCount = (nextMonster.turnCount || 0) + 1;
  const antelopeRecovery =
    nextMonster.passiveRules?.some(rule => rule.id === 'grazeRecovery') &&
    nextMonster.turnCount % 3 === 0 &&
    !(nextMonster.marked > 0);
  if (antelopeRecovery) {
    nextMonster.hp = Math.min(nextMonster.maxHp, nextMonster.hp + 3);
  }

  if ((survivor.bleed || 0) > 0) {
    survivor = applyDamage(survivor, 1);
    survivor.bleed -= 1;
  }

  survivor.block = 0;
  survivor.evasion = 0;
  const scarlessTriggered =
    survivor.hp <= 0 &&
    state.traits?.includes('Scarless') &&
    !state.scarlessUsed;
  if (scarlessTriggered) {
    survivor.hp = 1;
  }

  return {
    ...state,
    survivor,
    monster: nextMonster,
    drawPile,
    hand,
    discardPile,
    pendingEnergyPenalty,
    scarlessUsed: state.scarlessUsed || scarlessTriggered,
    status: getCombatStatus(survivor, nextMonster)
  };
}

export function endTurn(state) {
  if (state.status !== 'playing') {
    return state;
  }

  const exposedPrey =
    state.monster.passiveRules?.some(rule => rule.id === 'exposedPrey') &&
    state.survivor.block === 0;
  const preparedMonster = exposedPrey
    ? {
        ...state.monster,
        nextAttackBonus: (state.monster.nextAttackBonus || 0) + 1
      }
    : state.monster;
  const afterIntent = applyMonsterIntent(preparedMonster, {
    ...state,
    monster: preparedMonster
  });

  if (afterIntent.status !== 'playing') {
    return afterIntent;
  }

  const drawn = drawCards(
    afterIntent.drawPile,
    [],
    [...afterIntent.discardPile, ...afterIntent.hand],
    HAND_SIZE
  );
  const nextEnergy = Math.max(0, ENERGY_PER_TURN - (afterIntent.pendingEnergyPenalty || 0));

  return {
    ...afterIntent,
    survivor: { ...afterIntent.survivor, energy: nextEnergy },
    drawPile: drawn.deck,
    hand: drawn.hand,
    discardPile: drawn.discard,
    currentIntent: chooseWeightedIntent(afterIntent.monster.intents, afterIntent.monster.level),
    attacksPlayedThisTurn: 0,
    nextAttackBonus: 0,
    pendingEnergyPenalty: 0
  };
}
