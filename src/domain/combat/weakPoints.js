export const GENERIC_WEAK_POINTS = [
  {
    id: 'soft-underbelly',
    name: 'Soft Underbelly',
    trigger: 'attack',
    effect: { bonusDamage: 1 },
    text: '+1 damage on this hit.'
  },
  {
    id: 'armoured-plate',
    name: 'Armoured Plate',
    trigger: 'attack',
    effect: { reducedDamage: 1 },
    text: '-1 damage on this hit.'
  },
  {
    id: 'exposed-nerve',
    name: 'Exposed Nerve',
    trigger: 'attack',
    effect: { gainSurvival: 1 },
    text: 'Gain 1 survival if the hit wounds.'
  }
];

function safeWeakPoint(weakPoint, index = 0) {
  const raw = weakPoint && typeof weakPoint === 'object' ? weakPoint : {};
  const id = raw.id || `weak-point-${index + 1}`;
  const name = raw.name || raw.label || `Weak Point ${index + 1}`;
  return {
    ...raw,
    id,
    name,
    trigger: raw.trigger || 'attack',
    effect: raw.effect || raw.effects?.[0] || {},
    text: raw.text || raw.description || raw.onBreakEffect || 'No weak point effect.'
  };
}

function isAttackCard(card) {
  return card?.type === 'attack' || (card?.effects || []).some(effect =>
    effect.type === 'damage' || effect.type === 'multiHitDamage'
  );
}

export function createWeakPointDeck(monster) {
  const source = Array.isArray(monster?.weakPoints) && monster.weakPoints.length
    ? monster.weakPoints
    : GENERIC_WEAK_POINTS;
  return source.map(safeWeakPoint);
}

export function drawWeakPoint(combatState) {
  const deck = Array.isArray(combatState?.weakPointDeck) && combatState.weakPointDeck.length
    ? combatState.weakPointDeck
    : createWeakPointDeck(combatState?.monster);
  const [weakPoint, ...rest] = deck;
  const discard = [...(combatState?.revealedWeakPoints || []), weakPoint].filter(Boolean);
  return {
    ...combatState,
    weakPointDeck: rest.length ? rest : createWeakPointDeck(combatState?.monster),
    currentWeakPoint: weakPoint || safeWeakPoint(null),
    revealedWeakPoints: discard
  };
}

export function resolveWeakPointHit({ combatState, card, weakPoint, damage = 0 } = {}) {
  const point = safeWeakPoint(weakPoint);
  const effect = point.effect || {};
  let nextDamage = Number(damage || 0);
  let nextState = combatState;

  if (!isAttackCard(card)) {
    return { combatState: nextState, damage: nextDamage, log: [] };
  }

  const log = [`Weak point revealed: ${point.name}. ${point.text}`];
  if (effect.bonusDamage) {
    nextDamage += Number(effect.bonusDamage || 0);
  }
  if (effect.reducedDamage) {
    nextDamage = Math.max(0, nextDamage - Number(effect.reducedDamage || 0));
  }
  if (effect.gainSurvival) {
    const activeId = nextState.activeSurvivorId;
    nextState = {
      ...nextState,
      survivors: nextState.survivors.map(survivor => survivor.id === activeId
        ? {
            ...survivor,
            survival: Math.min(survivor.maxSurvival ?? survivor.survival ?? 0, (survivor.survival || 0) + Number(effect.gainSurvival || 0))
          }
        : survivor)
    };
  }

  return { combatState: nextState, damage: nextDamage, log };
}

