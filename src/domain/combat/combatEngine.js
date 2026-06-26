import { createSurvivor } from '../schema/survivorSchema.js';
import { buildCombatDeckForSurvivor, drawCards, shuffleCards } from './combatDeck.js';
import { chooseMonsterIntent, createMonster } from './monsterAI.js';
import { createWeakPointDeck, drawWeakPoint, resolveWeakPointHit } from './weakPoints.js';

function recoveryState(reason = 'Invalid combat input') {
  return {
    id: 'combat-recovery',
    status: 'recovery',
    round: 0,
    monster: createMonster(),
    survivors: [createSurvivor()],
    activeSurvivorId: 'survivor-recovery',
    drawPile: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    passiveCards: [],
    passiveEffects: [],
    gearCardGroups: [],
    deckWarnings: [],
    weakPointDeck: createWeakPointDeck(),
    currentWeakPoint: null,
    revealedWeakPoints: [],
    combatLog: [reason],
    pendingMonsterIntent: null
  };
}

function safeCard(card, index = 0) {
  const raw = card && typeof card === 'object' ? card : {};
  return {
    id: raw.id || `card-${index + 1}`,
    name: raw.name || `Card ${index + 1}`,
    type: raw.type || 'skill',
    effects: Array.isArray(raw.effects) ? raw.effects : [],
    exhaust: Boolean(raw.exhaust),
    ...raw
  };
}

function activeSurvivor(state) {
  return state.survivors.find(survivor => survivor.id === state.activeSurvivorId) || state.survivors[0];
}

export function createCombatState(input = {}) {
  const {
    monster,
    survivors,
    cards,
    cardCatalog,
    gearCatalog,
    loadout,
    random
  } = input && typeof input === 'object' ? input : {};
  if (!monster || !Array.isArray(survivors) || !survivors.length) {
    return recoveryState();
  }
  const safeSurvivors = survivors.filter(Boolean).map(createSurvivor);
  if (!safeSurvivors.length) return recoveryState();
  const safeMonster = createMonster(monster);
  const builtDeck = Array.isArray(cards) && cards.length
    ? { drawPile: shuffleCards(cards.map(safeCard), random), sourceGroups: [], passives: [], warnings: [] }
    : buildCombatDeckForSurvivor({
        survivor: safeSurvivors[0],
        loadout,
        cardCatalog,
        gearCatalog,
        random
      });

  return {
    id: `combat-${Date.now()}`,
    status: 'active',
    round: 1,
    monster: safeMonster,
    survivors: safeSurvivors,
    activeSurvivorId: safeSurvivors[0].id,
    drawPile: builtDeck.drawPile,
    hand: [],
    discardPile: [],
    exhaustPile: [],
    passiveCards: builtDeck.passives || [],
    passiveEffects: (builtDeck.passives || []).flatMap(card => card.effects || card.passiveEffect || []),
    gearCardGroups: builtDeck.sourceGroups || [],
    deckWarnings: builtDeck.warnings || [],
    weakPointDeck: createWeakPointDeck(safeMonster),
    currentWeakPoint: null,
    revealedWeakPoints: [],
    combatLog: [`${safeMonster.name} emerges.`, ...(builtDeck.warnings || [])],
    pendingMonsterIntent: chooseMonsterIntent(safeMonster, random)
  };
}

export function drawOpeningHand(combatState) {
  if (!combatState || combatState.status === 'recovery') return recoveryState();
  return drawCards(combatState, 5);
}

function applyCardEffect(state, effect) {
  const next = { ...state, monster: { ...state.monster } };
  const hits = effect.hits || 1;
  if (effect.type === 'damage' || effect.type === 'multiHitDamage') {
    next.monster.hp = Math.max(0, next.monster.hp - ((effect.amount || 0) * hits));
  }
  if (effect.type === 'block') {
    const survivor = activeSurvivor(next);
    next.survivors = next.survivors.map(item => item.id === survivor.id ? { ...item, block: (item.block || 0) + (effect.amount || 0) } : item);
  }
  if (effect.type === 'survival') {
    const survivor = activeSurvivor(next);
    next.survivors = next.survivors.map(item => item.id === survivor.id ? { ...item, survival: Math.min(item.maxSurvival, item.survival + (effect.amount || 0)) } : item);
  }
  return next;
}

function applyAttackEffectWithWeakPoint(state, card, effect) {
  const hits = effect.hits || 1;
  const baseDamage = (effect.amount || 0) * hits;
  const revealedState = drawWeakPoint(state);
  const resolved = resolveWeakPointHit({
    combatState: revealedState,
    card,
    weakPoint: revealedState.currentWeakPoint,
    damage: baseDamage
  });
  const next = {
    ...resolved.combatState,
    monster: {
      ...resolved.combatState.monster,
      hp: Math.max(0, resolved.combatState.monster.hp - resolved.damage)
    },
    combatLog: [
      ...resolved.combatState.combatLog,
      ...resolved.log,
      `${card.name} deals ${resolved.damage} damage from ${card.sourceGearName || card.sourceGearId || 'unknown gear'}.`
    ]
  };
  return next;
}

export function playCard({ combatState, cardId } = {}) {
  if (!combatState || combatState.status === 'recovery') return recoveryState();
  const card = combatState.hand.find(item => item.id === cardId);
  if (!card || card.unplayable) return { ...combatState, combatLog: [...combatState.combatLog, 'Card could not be played.'] };

  let next = {
    ...combatState,
    hand: combatState.hand.filter(item => item.id !== cardId),
    discardPile: card.exhaust ? combatState.discardPile : [...combatState.discardPile, card],
    exhaustPile: card.exhaust ? [...combatState.exhaustPile, card] : combatState.exhaustPile,
    combatLog: [...combatState.combatLog, `${card.name} played${card.sourceGearName ? ` from ${card.sourceGearName}` : ''}.`]
  };
  card.effects.forEach(effect => {
    if (effect.type === 'damage' || effect.type === 'multiHitDamage') {
      next = applyAttackEffectWithWeakPoint(next, card, effect);
    } else {
      next = applyCardEffect(next, effect);
    }
  });
  return checkCombatEnd(next);
}

export function endSurvivorTurn(combatState) {
  if (!combatState || combatState.status === 'recovery') return recoveryState();
  return {
    ...combatState,
    discardPile: [...combatState.discardPile, ...combatState.hand],
    hand: [],
    combatLog: [...combatState.combatLog, 'Survivor turn ends.']
  };
}

export function resolveMonsterTurn(combatState) {
  if (!combatState || combatState.status === 'recovery') return recoveryState();
  const intent = combatState.pendingMonsterIntent || chooseMonsterIntent(combatState.monster);
  const survivor = activeSurvivor(combatState);
  const damage = intent.type === 'damage' ? Number(intent.amount || combatState.monster.damage || 1) : 0;
  const nextSurvivor = {
    ...survivor,
    hp: Math.max(0, survivor.hp - damage),
    alive: survivor.hp - damage > 0
  };
  const next = {
    ...combatState,
    round: combatState.round + 1,
    survivors: combatState.survivors.map(item => item.id === survivor.id ? nextSurvivor : item),
    pendingMonsterIntent: chooseMonsterIntent(combatState.monster),
    combatLog: [...combatState.combatLog, `${combatState.monster.name} uses ${intent.label || intent.id}.`]
  };
  return checkCombatEnd(drawCards(next, 5));
}

export function checkCombatEnd(combatState) {
  if (!combatState || combatState.status === 'recovery') return recoveryState();
  if (combatState.monster.hp <= 0) return { ...combatState, status: 'victory', combatLog: [...combatState.combatLog, 'Victory.'] };
  if (!combatState.survivors.some(survivor => survivor.alive && survivor.hp > 0)) {
    return { ...combatState, status: 'defeat', combatLog: [...combatState.combatLog, 'Defeat.'] };
  }
  return combatState;
}
