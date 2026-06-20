import { fightingArts } from '../data/fightingArts.js';
import { cards } from '../data/cards.js';

export const combatStart = 'combatStart';
export const cardPlayed = 'cardPlayed';
export const cardCost = 'cardCost';
export const damageCalculated = 'damageCalculated';
export const blockGained = 'blockGained';
export const damagePrevented = 'damagePrevented';
export const statusApplied = 'statusApplied';
export const weakPointOpened = 'weakPointOpened';
export const weakPointBroken = 'weakPointBroken';
export const harvestRolled = 'harvestRolled';
export const panicGained = 'panicGained';
export const panicRemoved = 'panicRemoved';
export const survivorDeath = 'survivorDeath';
export const combatEnd = 'combatEnd';
export const huntReturn = 'huntReturn';
export const retreat = 'retreat';

export const FIGHTING_ART_HOOKS = Object.freeze({
  combatStart,
  cardPlayed,
  cardCost,
  damageCalculated,
  blockGained,
  damagePrevented,
  statusApplied,
  weakPointOpened,
  weakPointBroken,
  harvestRolled,
  panicGained,
  panicRemoved,
  survivorDeath,
  combatEnd,
  huntReturn,
  retreat
});

const LEGACY_HOOK_ALIASES = Object.freeze({
  onCombatStart: combatStart,
  onCardPlayed: cardPlayed,
  onCardCost: cardCost,
  onDamageCalculated: damageCalculated,
  onBlockGained: blockGained,
  onDamagePrevented: damagePrevented,
  onStatusApplied: statusApplied,
  onWeakPointOpened: weakPointOpened,
  onWeakPointBroken: weakPointBroken,
  onHarvestRolled: harvestRolled,
  onPanicGained: panicGained,
  onPanicRemoved: panicRemoved,
  onSurvivorDeath: survivorDeath,
  onCombatEnd: combatEnd,
  onHuntReturn: huntReturn,
  onRetreat: retreat
});

function normalizeHookName(name) {
  return FIGHTING_ART_HOOKS[name] || LEGACY_HOOK_ALIASES[name] || name;
}

function emptyHookMap() {
  return Object.values(FIGHTING_ART_HOOKS).reduce((hooks, hookName) => {
    hooks[hookName] = [];
    return hooks;
  }, {});
}

function normalizeHookEntries(rawHook) {
  if (!rawHook) return [];
  return Array.isArray(rawHook) ? rawHook : [rawHook];
}

function addHookEntry(hooks, hookName, entry) {
  const normalizedName = normalizeHookName(hookName);
  if (!hooks[normalizedName]) hooks[normalizedName] = [];
  hooks[normalizedName].push(entry);
}

export function initializeFightingArtHooks(artIds = [], options = {}) {
  const artData = options.artData || fightingArts;
  const hooks = emptyHookMap();

  artIds.forEach(artId => {
    const art = artData?.[artId];
    if (!art) return;

    Object.entries(art.hooks || {}).forEach(([hookName, rawHook]) => {
      normalizeHookEntries(rawHook).forEach(hook => {
        addHookEntry(hooks, hookName, {
          artId,
          artName: art.name || artId,
          hook
        });
      });
    });

    Object.entries(LEGACY_HOOK_ALIASES).forEach(([legacyName, hookName]) => {
      normalizeHookEntries(art[legacyName]).forEach(hook => {
        addHookEntry(hooks, hookName, {
          artId,
          artName: art.name || artId,
          hook
        });
      });
    });
  });

  return hooks;
}

function runHookEntry(entry, context) {
  const hook = entry?.hook;
  if (!hook) return context;
  const hookContext = {
    ...context,
    artId: entry.artId,
    artName: entry.artName
  };
  if (typeof hook === 'function') return hook(hookContext, entry) || context;
  if (typeof hook.handler === 'function') return hook.handler(hookContext, entry) || context;
  if (typeof hook.apply === 'function') return hook.apply(hookContext, entry) || context;
  if (hook.type) return applyHookEffect(hook, hookContext, entry, context);

  // Object-only hook definitions are reserved for the fighting-art data rework.
  // Unknown effect types intentionally no-op until each reducer is explicitly added.
  return context;
}

export function runFightingArtHooks(hooks = {}, hookName, context = {}) {
  const normalizedName = normalizeHookName(hookName);
  const entries = hooks?.[normalizedName] || [];
  return entries.reduce((nextContext, entry) => runHookEntry(entry, nextContext), context);
}

function triggerKey(entry, hook, fallback) {
  return hook.onceKey || `${entry.artId}:${hook.type}:${fallback}`;
}

function hasTriggered(state, key) {
  return Boolean(state?.artTriggers?.[key]);
}

function markTriggered(state, key) {
  return {
    ...state,
    artTriggers: {
      ...(state.artTriggers || {}),
      [key]: true
    }
  };
}

function survivorId(survivor = {}) {
  return survivor.id || survivor.survivorId || survivor.name || 'survivor';
}

function addSurvivorBlock(context, amount) {
  const gained = Math.max(0, Number(amount) || 0);
  if (!gained) return context;
  return {
    ...context,
    state: {
      ...context.state,
      survivor: {
        ...context.state.survivor,
        block: (context.state.survivor?.block || 0) + gained
      },
      blockGainedThisTurn: (context.state.blockGainedThisTurn || 0) + gained
    }
  };
}

function addSurvivorSurvival(context, amount) {
  const gained = Math.max(0, Number(amount) || 0);
  if (!gained) return context;
  const survivor = context.state?.survivor || {};
  return {
    ...context,
    state: {
      ...context.state,
      survivor: {
        ...survivor,
        survival: Math.min(
          survivor.maxSurvival || gained,
          (survivor.survival || 0) + gained
        )
      }
    }
  };
}

function addMonsterStatus(context, hook) {
  const status = hook.status;
  if (!status || !context.state?.monster) return context;
  const amount = Math.max(1, Number(hook.amount) || 1);
  const value = ['marked', 'exposed'].includes(status)
    ? Math.max(1, context.state.monster[status] || 0)
    : (context.state.monster[status] || 0) + amount;
  return {
    ...context,
    state: {
      ...context.state,
      monster: {
        ...context.state.monster,
        [status]: value
      }
    }
  };
}

function addPanicToDiscard(context, amount) {
  const gained = Math.max(0, Number(amount) || 0);
  if (!gained) return context;
  return {
    ...context,
    state: {
      ...context.state,
      discardPile: [
        ...(context.state.discardPile || []),
        ...Array(gained).fill(cards.panic)
      ]
    }
  };
}

function addPartyBlockEffect(context, amount) {
  const value = Math.max(0, Number(amount) || 0);
  if (!value) return context;
  return {
    ...context,
    state: {
      ...context.state,
      emittedPartyEffects: [
        ...(context.state?.emittedPartyEffects || []),
        {
          target: 'other',
          effectType: 'block',
          value,
          expiresAfterTurn: true,
          expiresAfterCombat: false
        }
      ]
    }
  };
}

function recordGearCardPractice(context, hook) {
  const card = context.card;
  const survivor = context.state?.survivor || {};
  const gearInstanceId = card?.gearInstanceId;
  const cardId = card?.id || card?.cardId;
  if (!gearInstanceId || !cardId) return context;
  const key = `${survivorId(survivor)}:${gearInstanceId}:${cardId}`;
  const current = survivor.gearCardPractice?.[key] || 0;
  return {
    ...context,
    state: {
      ...context.state,
      survivor: {
        ...survivor,
        gearCardPractice: {
          ...(survivor.gearCardPractice || {}),
          [key]: current + (hook.amount || 1)
        }
      }
    }
  };
}

const qualityOrder = ['ruined', 'messy', 'clean'];

function improveHarvestQuality(context, amount = 1) {
  if (!context.harvestResult?.quality) return context;
  const currentIndex = qualityOrder.indexOf(context.harvestResult.quality);
  if (currentIndex < 0) return context;
  const nextIndex = Math.min(qualityOrder.length - 1, currentIndex + Math.max(0, Number(amount) || 0));
  const quality = qualityOrder[nextIndex];
  if (quality === context.harvestResult.quality) return context;
  return {
    ...context,
    harvestResult: {
      ...context.harvestResult,
      quality,
      reason: [
        context.harvestResult.reason,
        `${context.artName || 'Fighting art'} improved harvest quality.`
      ].filter(Boolean).join(' ')
    }
  };
}

function cardMatches(context, hook) {
  const card = context.card || {};
  if (hook.cardTypes && !hook.cardTypes.includes(card.type)) return false;
  if (hook.tags && !hook.tags.some(tag => [...(card.tags || []), ...(card.keywords || [])].includes(tag))) return false;
  if (hook.weaponTypes && !hook.weaponTypes.includes(card.weaponType)) return false;
  if (hook.sameGearAsPrevious && context.previousState?.previousGearInstanceId !== card.gearInstanceId) return false;
  return true;
}

function hookMatchesContext(context, hook) {
  if (!cardMatches(context, hook)) return false;
  if (hook.target && context.target !== hook.target) return false;
  if (hook.status && context.type && context.type !== hook.status) return false;
  if (hook.weakPointTags?.length) {
    const tags = context.weakPoint?.tags || context.selectedWeakPoint?.tags || [];
    if (!hook.weakPointTags.some(tag => tags.includes(tag))) return false;
  }
  if (hook.requiresHarvestQuality && context.harvestResult?.quality !== hook.requiresHarvestQuality) return false;
  return true;
}

function applyHookEffect(hook, context, entry, originalContext = context) {
  if (!hookMatchesContext(context, hook)) return originalContext;
  let nextContext = context;
  const key = triggerKey(entry, hook, context.card?.id || context.type || context.source || 'hook');
  if (hook.oncePerCombat && hasTriggered(nextContext.state, key)) return nextContext;

  switch (hook.type) {
    case 'addSurvivorBlock':
      nextContext = addSurvivorBlock(nextContext, hook.amount);
      break;
    case 'addSurvivorSurvival':
      nextContext = addSurvivorSurvival(nextContext, hook.amount);
      break;
    case 'addMonsterStatus':
      nextContext = addMonsterStatus(nextContext, hook);
      break;
    case 'addPanicToDiscard':
      nextContext = addPanicToDiscard(nextContext, hook.amount);
      break;
    case 'addPartyBlockEffect':
      nextContext = addPartyBlockEffect(nextContext, hook.amount);
      break;
    case 'recordGearCardPractice':
      nextContext = recordGearCardPractice(nextContext, hook);
      break;
    case 'improveHarvestQuality':
      nextContext = improveHarvestQuality(nextContext, hook.amount);
      break;
    default:
      return originalContext;
  }

  if (hook.oncePerCombat) {
    nextContext = {
      ...nextContext,
      state: markTriggered(nextContext.state || {}, key)
    };
  }
  return nextContext;
}
