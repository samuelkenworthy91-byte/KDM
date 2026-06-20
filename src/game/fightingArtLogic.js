import { fightingArts } from '../data/fightingArts.js';

export const combatStart = 'combatStart';
export const cardPlayed = 'cardPlayed';
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
  if (typeof hook === 'function') return hook(context, entry) || context;
  if (typeof hook.handler === 'function') return hook.handler(context, entry) || context;
  if (typeof hook.apply === 'function') return hook.apply(context, entry) || context;

  // Object-only hook definitions are reserved for the fighting-art data rework.
  // They are intentionally no-ops until each effect type has an explicit reducer.
  return context;
}

export function runFightingArtHooks(hooks = {}, hookName, context = {}) {
  const normalizedName = normalizeHookName(hookName);
  const entries = hooks?.[normalizedName] || [];
  return entries.reduce((nextContext, entry) => runHookEntry(entry, nextContext), context);
}
