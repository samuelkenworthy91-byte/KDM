const SETTLEMENT_STORAGE_KEY = 'settlement';

export const emptySettlementStash = {
  bone: 0,
  hide: 0,
  sinew: 0,
  organ: 0,
  claw: 0,
  strangeEye: 0,
  scrap: 0,
  fur: 0,
  horn: 0,
  ichor: 0,
  monsterTooth: 0
};

export const defaultSettlement = {
  settlementMemory: 0,
  totalRuns: 0,
  deadSurvivors: 0,
  victoriousRuns: 0,
  monsterKnowledge: {},
  unlockedUpgrades: [],
  nextRunBonus: {},
  graveHistory: [],
  livingSurvivors: [],
  settlementStash: emptySettlementStash,
  armory: []
};

function normalizeSurvivor(survivor = {}) {
  return {
    id: survivor.id || `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: survivor.name || 'Nameless Survivor',
    maxHp: Number(survivor.maxHp) || 30,
    strength: Number(survivor.strength) || 0,
    personalDeckAdditions: Array.isArray(survivor.personalDeckAdditions)
      ? survivor.personalDeckAdditions
      : [],
    fightingArts: Array.isArray(survivor.fightingArts) ? survivor.fightingArts : [],
    completedRuns: Number(survivor.completedRuns) || 0,
    kills: Number(survivor.kills) || 0,
    scars: Array.isArray(survivor.scars) ? survivor.scars : [],
    isAlive: survivor.isAlive !== false
    // TODO: Old saves may contain craftedEquipment on survivors. It is intentionally
    // ignored because Stage 7 makes all equipment settlement property.
  };
}

export function normalizeSettlement(data = {}) {
  const legacyUpgradeIds = Object.entries(data.upgrades || {})
    .filter(([, unlocked]) => Boolean(unlocked))
    .map(([upgradeId]) => upgradeId);
  const unlockedUpgrades = Array.isArray(data.unlockedUpgrades)
    ? data.unlockedUpgrades
    : legacyUpgradeIds;

  return {
    ...defaultSettlement,
    ...data,
    settlementMemory: Number(data.settlementMemory) || 0,
    totalRuns: Number(data.totalRuns) || 0,
    deadSurvivors: Number(data.deadSurvivors) || 0,
    victoriousRuns: Number(data.victoriousRuns) || 0,
    monsterKnowledge: { ...(data.monsterKnowledge || {}) },
    unlockedUpgrades: [...new Set(unlockedUpgrades)],
    nextRunBonus: { ...(data.nextRunBonus || {}) },
    graveHistory: Array.isArray(data.graveHistory) ? data.graveHistory : [],
    livingSurvivors: Array.isArray(data.livingSurvivors)
      ? data.livingSurvivors.map(normalizeSurvivor).filter(survivor => survivor.isAlive)
      : [],
    settlementStash: {
      ...emptySettlementStash,
      ...(data.settlementStash || {})
    },
    armory: Array.isArray(data.armory)
      ? data.armory.filter(item => item && item.id).map(item => ({
          id: item.id,
          instanceId: item.instanceId || `${item.id}-${Date.now()}`,
          name: item.name || item.id,
          slot: item.slot || 'gear'
        }))
      : []
  };
}

export function loadSettlement() {
  if (typeof localStorage === 'undefined') {
    return normalizeSettlement();
  }

  try {
    return normalizeSettlement(JSON.parse(localStorage.getItem(SETTLEMENT_STORAGE_KEY)) || {});
  } catch {
    return normalizeSettlement();
  }
}

export function saveSettlement(data) {
  const settlement = normalizeSettlement(data);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTLEMENT_STORAGE_KEY, JSON.stringify(settlement));
  }
  return settlement;
}

export function hasUpgrade(settlement, upgradeId) {
  return (settlement.unlockedUpgrades || []).includes(upgradeId);
}
