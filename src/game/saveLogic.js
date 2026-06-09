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
  monsterTooth: 0,
  phoenixAsh: 0,
  timeBone: 0
};

export const defaultSettlement = {
  settlementName: '',
  population: 0,
  populationRoll: 0,
  settlementMemory: 0,
  totalRuns: 0,
  deadSurvivors: 0,
  victoriousRuns: 0,
  monsterKnowledge: {},
  builtInnovations: [],
  unlockedUpgrades: [],
  nextRunBonus: {},
  graveHistory: [],
  livingSurvivors: [],
  settlementStash: emptySettlementStash,
  armory: [],
  unlockedQuarries: ['paleHuntLion'],
  defeatedQuarryLevels: {},
  intimacyHistory: [],
  pendingSpecialTrait: null,
  campaignDefeated: false
};

export function rollPopulation() {
  return Math.floor(Math.random() * 10) + 1;
}

export function createNewSettlement(name) {
  const populationRoll = rollPopulation();
  return migrateSettlementSave({
    ...defaultSettlement,
    settlementName: name?.trim() || 'The Nameless Settlement',
    populationRoll,
    population: 4 + populationRoll
  });
}

function normalizeSurvivor(survivor = {}, fallbackGender = 'other') {
  return {
    id: survivor.id || `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: survivor.name || 'Nameless Survivor',
    gender: ['male', 'female', 'other'].includes(survivor.gender)
      ? survivor.gender
      : fallbackGender,
    ageCategory: survivor.ageCategory || 'adult',
    maxHp: Number(survivor.maxHp) || 30,
    hp: Number.isFinite(Number(survivor.hp)) ? Number(survivor.hp) : Number(survivor.maxHp) || 30,
    survival: Number(survivor.survival) || 0,
    strength: Number(survivor.strength) || 0,
    personalDeckAdditions: Array.isArray(survivor.personalDeckAdditions)
      ? survivor.personalDeckAdditions
      : [],
    fightingArts: Array.isArray(survivor.fightingArts) ? survivor.fightingArts : [],
    traits: Array.isArray(survivor.traits) ? survivor.traits : [],
    scars: Array.isArray(survivor.scars) ? survivor.scars : [],
    completedRuns: Number(survivor.completedRuns) || 0,
    kills: Number(survivor.kills) || 0,
    isAlive: survivor.isAlive !== false,
    retired: Boolean(survivor.retired)
  };
}

export function migrateSettlementSave(data = {}) {
  const legacyUpgradeIds = Object.entries(data.upgrades || {})
    .filter(([, unlocked]) => Boolean(unlocked))
    .map(([upgradeId]) => upgradeId);
  const unlockedUpgrades = Array.isArray(data.unlockedUpgrades)
    ? data.unlockedUpgrades
    : legacyUpgradeIds;
  const livingSurvivors = Array.isArray(data.livingSurvivors)
    ? data.livingSurvivors
      .map((survivor, index) => normalizeSurvivor(survivor, index % 2 ? 'male' : 'female'))
      .filter(survivor => survivor.isAlive)
    : [];
  const hasPopulation = data.population !== undefined && data.population !== null;
  const inferredPopulation = hasPopulation
    ? Math.max(0, Number(data.population) || 0)
    : Math.max(4, livingSurvivors.length + (Number(data.deadSurvivors) || 0));

  return {
    ...defaultSettlement,
    ...data,
    settlementName: data.settlementName?.trim() || 'First Lantern',
    population: inferredPopulation,
    populationRoll: Number(data.populationRoll) || 0,
    settlementMemory: Number(data.settlementMemory) || 0,
    totalRuns: Number(data.totalRuns) || 0,
    deadSurvivors: Number(data.deadSurvivors) || 0,
    victoriousRuns: Number(data.victoriousRuns) || 0,
    monsterKnowledge: { ...(data.monsterKnowledge || {}) },
    builtInnovations: Array.isArray(data.builtInnovations)
      ? [...new Set(data.builtInnovations)]
      : [],
    unlockedUpgrades: [...new Set(unlockedUpgrades)],
    nextRunBonus: { ...(data.nextRunBonus || {}) },
    graveHistory: Array.isArray(data.graveHistory) ? data.graveHistory : [],
    livingSurvivors,
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
      : [],
    unlockedQuarries: [
      ...new Set(['paleHuntLion', ...(Array.isArray(data.unlockedQuarries) ? data.unlockedQuarries : [])])
    ],
    defeatedQuarryLevels: { ...(data.defeatedQuarryLevels || {}) },
    intimacyHistory: Array.isArray(data.intimacyHistory) ? data.intimacyHistory.slice(0, 5) : [],
    pendingSpecialTrait: data.pendingSpecialTrait || null,
    campaignDefeated: Boolean(data.campaignDefeated) || inferredPopulation <= 0
  };
}

export const normalizeSettlement = migrateSettlementSave;

export function loadSettlement() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(SETTLEMENT_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return migrateSettlementSave(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveSettlement(data) {
  const settlement = migrateSettlementSave(data);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SETTLEMENT_STORAGE_KEY, JSON.stringify(settlement));
  }
  return settlement;
}

export function resetSettlement() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(SETTLEMENT_STORAGE_KEY);
  }
}

export function isSettlementDefeated(settlement) {
  return Boolean(settlement && (settlement.campaignDefeated || settlement.population <= 0));
}

export function hasUpgrade(settlement, upgradeId) {
  return (settlement?.unlockedUpgrades || []).includes(upgradeId);
}
