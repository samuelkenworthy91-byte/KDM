export const SETTLEMENT_SCREEN = 'settlement';

export const KNOWN_SCREENS = new Set([
  'title',
  'createSettlement',
  'settlement',
  'partySelection',
  'loadout',
  'quarrySelection',
  'map',
  'combat',
  'lootReward',
  'resource',
  'event',
  'rest',
  'survivorProgress',
  'monsterDiscovery',
  'quarryDiscoveryLore',
  'runSummary',
  'graveLegacy',
  'retreatResult',
  'innovationPayment',
  'innovationDraw',
  'nemesisLore',
  'nemesisWarning',
  'nemesisPreparation',
  'nemesisCombat',
  'nemesisResult'
]);

export const HUNT_SCREENS = new Set([
  'map',
  'combat',
  'lootReward',
  'resource',
  'event',
  'rest',
  'survivorProgress',
  'monsterDiscovery',
  'quarryDiscoveryLore',
  'runSummary',
  'graveLegacy'
]);
const IS_DEV = Boolean(import.meta.env?.DEV);

export function createEmptyRuntime(screen = SETTLEMENT_SCREEN) {
  return {
    screen,
    selectedQuarry: 'paleHuntLion',
    selectedLevel: 1,
    runMap: [],
    currentNode: null,
    runResources: [],
    resourceReward: null,
    currentEvent: null,
    runSurvivor: null,
    runParty: [],
    selectedPartyIds: [],
    loadoutPartyIndex: 0,
    partyCombatBonuses: [],
    pendingPartyEffects: [],
    survivorRewardQueue: [],
    runDeck: [],
    runEquippedGear: [],
    runModifiers: {},
    runBonus: {},
    combatBonus: {},
    runSummary: null,
    lootChoices: [],
    pendingCombatVictory: null,
    bossGenericRewards: [],
    progressOfferBane: false,
    innovationDraw: [],
    innovationPayment: null,
    appliedInnovationId: null,
    runEventWarningUsed: false,
    runConditionGains: { injuries: [], scars: [], disorders: [] },
    nemesisResult: null,
    pendingQuarryDiscoveryId: null,
    currentHuntId: null,
    retreatResult: null
  };
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasHuntingParty(runtime) {
  return Array.isArray(runtime.runParty) && runtime.runParty.some(survivor =>
    survivor?.id && survivor.alive !== false && Number(survivor.hp) > 0
  );
}

export function getInvalidCombatSurvivorIds(runtime = {}) {
  if (!Array.isArray(runtime.partyCombatBonuses)) return [];
  return [...new Set(runtime.partyCombatBonuses.filter(member =>
    member?.survivor?.hp <= 0 ||
    member?.survivor?.isAlive === false ||
    member?.survivor?.alive === false ||
    member?.status === 'dead' ||
    member?.survivor?.pendingLethalDamage ||
    member?.pendingLethalDamage
  ).map(member => member?.survivor?.id).filter(Boolean))];
}

function invalid(reason, warning) {
  if (IS_DEV) console.warn(`[Game state recovery] ${warning || reason}`);
  return { valid: false, reason };
}

export function validateGameState(gameState) {
  if (!isObject(gameState)) return invalid('missing game state');
  const { settlement, runtime, activeSlot } = gameState;
  if (!Number.isInteger(Number(activeSlot))) return invalid('missing active save slot');
  if (!isObject(settlement)) return invalid('missing settlement');
  if (!Array.isArray(settlement.survivors)) return invalid('missing survivor list');
  if (!Array.isArray(settlement.livingSurvivors)) return invalid('missing living survivor list');
  if (!Array.isArray(settlement.armory)) return invalid('missing settlement armory');
  if (!isObject(settlement.stash)) return invalid('missing settlement stash');
  if (!Array.isArray(settlement.settlementHistory)) {
    return invalid('missing settlement history');
  }
  if (!isObject(runtime)) return invalid('missing runtime state');
  if (!KNOWN_SCREENS.has(runtime.screen)) {
    return invalid(`invalid screen "${String(runtime.screen)}"`, 'invalid screen');
  }

  if (HUNT_SCREENS.has(runtime.screen) && !hasHuntingParty(runtime)) {
    return invalid('missing current hunt party', 'missing currentRun');
  }
  if (HUNT_SCREENS.has(runtime.screen) && typeof runtime.selectedQuarry !== 'string') {
    return invalid('missing quarry id');
  }
  if (['map', 'combat', 'resource', 'event', 'rest'].includes(runtime.screen)) {
    if (!Array.isArray(runtime.runMap) || runtime.runMap.length === 0) {
      return invalid('missing current hunt map', 'missing currentRun');
    }
    if (runtime.currentNode) {
      const nodeExists = runtime.runMap.flat().some(node => node?.id === runtime.currentNode.id);
      if (!nodeExists) return invalid('invalid current hunt node', 'missing currentRun');
    }
  }
  if (runtime.screen === 'combat') {
    if (!runtime.currentNode || !['fight', 'elite', 'boss'].includes(runtime.currentNode.type)) {
      return invalid('missing combat state after hunt return', 'missing combat');
    }
    if (
      !Array.isArray(runtime.partyCombatBonuses) ||
      runtime.partyCombatBonuses.length === 0
    ) {
      return invalid('missing party combat state', 'missing combat');
    }
    if (runtime.partyCombatBonuses.some(member =>
      !member?.survivor?.id || !Array.isArray(member.runDeck)
    )) {
      return invalid('incomplete party combat state', 'missing combat');
    }
    if (runtime.partyCombatBonuses.some(member =>
      member.survivor.pendingLethalDamage || member.pendingLethalDamage
    )) {
      return invalid('unresolved lethal combat damage', 'missing combat');
    }
    if (!Array.isArray(runtime.pendingPartyEffects)) {
      return invalid('incomplete party combat effects', 'missing combat');
    }
  }
  if (runtime.screen === 'lootReward') {
    if (!isObject(runtime.pendingCombatVictory) || !Array.isArray(runtime.lootChoices)) {
      return invalid('missing part rewards', 'missing survivor reward');
    }
    if (
      runtime.pendingCombatVictory.brokenWeakPoints != null &&
      !Array.isArray(runtime.pendingCombatVictory.brokenWeakPoints)
    ) {
      return invalid('missing harvest data', 'missing harvest data');
    }
    if (runtime.lootChoices.length < Math.max(1, Number(runtime.selectedLevel) || 1)) {
      return invalid('missing part rewards', 'missing survivor reward');
    }
  }
  if (runtime.screen === 'survivorProgress') {
    const rewardIds = Array.isArray(runtime.survivorRewardQueue)
      ? runtime.survivorRewardQueue
      : [];
    const fallbackId = runtime.runSummary?.survivorId;
    const survivorId = rewardIds[0] || fallbackId;
    if (!runtime.runSummary || !settlement.survivors.some(item => item.id === survivorId)) {
      return invalid('missing survivor reward', 'missing survivor reward');
    }
  }
  if (runtime.screen === 'resource' && !runtime.resourceReward?.id) {
    return invalid('missing resource reward');
  }
  if (runtime.screen === 'event' && !runtime.currentEvent?.id) {
    return invalid('missing hunt event');
  }
  if (['runSummary', 'graveLegacy'].includes(runtime.screen) && !runtime.runSummary) {
    return invalid('missing hunt result');
  }
  if (runtime.screen === 'quarryDiscoveryLore' && !runtime.pendingQuarryDiscoveryId) {
    return invalid('missing quarry discovery data');
  }
  if (runtime.screen === 'innovationDraw' && !Array.isArray(runtime.innovationDraw)) {
    return invalid('missing innovation reward');
  }
  if (runtime.screen === 'retreatResult' && !isObject(runtime.retreatResult)) {
    return invalid('missing retreat result');
  }
  if (runtime.screen.startsWith('nemesis') && runtime.screen !== 'nemesisResult') {
    if (!settlement.pendingNemesisEncounter) return invalid('missing nemesis encounter');
  }
  if (runtime.screen === 'nemesisResult' && !runtime.nemesisResult) {
    return invalid('missing nemesis result');
  }

  return { valid: true, reason: null };
}

export function addRecoveryHistory(settlement, reason, resetHunt = false) {
  const message = resetHunt
    ? 'A broken hunt state was recovered.'
    : `A broken hunt state was recovered. Recovery reason: ${reason}.`;
  const history = Array.isArray(settlement?.settlementHistory)
    ? settlement.settlementHistory
    : [];
  if (history.at(-1)?.message === message) return settlement;
  return {
    ...settlement,
    settlementHistory: [
      ...history,
      {
        type: 'recovery',
        message,
        reason,
        timestamp: new Date().toISOString()
      }
    ]
  };
}

export function recoverGameState(gameState, reason, options = {}) {
  return {
    ...gameState,
    settlement: addRecoveryHistory(gameState.settlement, reason, options.resetHunt),
    runtime: createEmptyRuntime(SETTLEMENT_SCREEN),
    recoveryReason: reason
  };
}
