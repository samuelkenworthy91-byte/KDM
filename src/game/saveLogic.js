const SETTLEMENT_STORAGE_KEY = 'settlement';
export const defaultSettlement = {
  settlementMemory: 0,
  totalRuns: 0,
  deadSurvivors: 0,
  victoriousRuns: 0,
  monsterKnowledge: {},
  unlockedUpgrades: [],
  nextRunBonus: {},
  graveHistory: []
};

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
    graveHistory: Array.isArray(data.graveHistory) ? data.graveHistory : []
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
  return settlement.unlockedUpgrades.includes(upgradeId);
}
