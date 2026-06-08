// Helpers for loading and saving settlement data in localStorage.

export const defaultSettlement = {
  settlementMemory: 0,
  monsterKnowledge: {},
  nextRunBonus: {},
  graveHistory: []
};

export function normalizeSettlement(data = {}) {
  return {
    ...defaultSettlement,
    ...data,
    monsterKnowledge: data.monsterKnowledge || {},
    nextRunBonus: data.nextRunBonus || {},
    graveHistory: Array.isArray(data.graveHistory) ? data.graveHistory : []
  };
}

export function loadSettlement() {
  try {
    return normalizeSettlement(JSON.parse(localStorage.getItem('settlement')) || {});
  } catch (e) {
    return normalizeSettlement();
  }
}

export function saveSettlement(data) {
  localStorage.setItem('settlement', JSON.stringify(data));
}
