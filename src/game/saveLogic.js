const SETTLEMENT_STORAGE_KEY = 'settlement';

export const DEFAULT_SETTLEMENT = {
  settlementMemory: 0,
  totalRuns: 0,
  deadSurvivors: 0,
  victoriousRuns: 0,
  monsterKnowledge: {},
  unlockedUpgrades: [],
  nextRunBonus: {}
};

function normalizeSettlement(data = {}) {
  return {
    ...DEFAULT_SETTLEMENT,
    ...data,
    monsterKnowledge: {
      ...DEFAULT_SETTLEMENT.monsterKnowledge,
      ...(data.monsterKnowledge || {})
    },
    unlockedUpgrades: Array.isArray(data.unlockedUpgrades)
      ? data.unlockedUpgrades
      : [],
    nextRunBonus: {
      ...DEFAULT_SETTLEMENT.nextRunBonus,
      ...(data.nextRunBonus || {})
    }
  };
}

export function loadSettlement() {
  if (typeof localStorage === 'undefined') {
    return normalizeSettlement();
  }

  try {
    const saved = JSON.parse(localStorage.getItem(SETTLEMENT_STORAGE_KEY));
    return normalizeSettlement(saved || {});
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

export function resetSettlement() {
  const settlement = normalizeSettlement();

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SETTLEMENT_STORAGE_KEY);
  }

  return settlement;
}

export function addSettlementMemory(amount) {
  const settlement = loadSettlement();
  return saveSettlement({
    ...settlement,
    settlementMemory: Math.max(0, settlement.settlementMemory + amount)
  });
}

export function unlockUpgrade(upgradeId) {
  const settlement = loadSettlement();

  if (hasUpgrade(settlement, upgradeId)) {
    return settlement;
  }

  return saveSettlement({
    ...settlement,
    unlockedUpgrades: [...settlement.unlockedUpgrades, upgradeId]
  });
}

export function hasUpgrade(settlement, upgradeId) {
  return settlement.unlockedUpgrades.includes(upgradeId);
}
