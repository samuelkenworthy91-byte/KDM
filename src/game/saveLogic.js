const LEGACY_SAVE_KEY = 'settlement';
const ACTIVE_SLOT_KEY = 'lanternDeckbuilder.activeSlot';
const SLOT_COUNT = 3;

export function createGearInstance(equipmentId) {
  return {
    instanceId: `gear-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    equipmentId
  };
}

export function createSurvivor(name = 'Nameless Survivor', gender = 'other', options = {}) {
  return {
    id: `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || 'Nameless Survivor',
    gender,
    appearance: options.appearance?.trim() || '',
    alive: true,
    maxHp: 30,
    hp: 30,
    survival: 0,
    strength: 0,
    traits: [],
    fightingArts: [],
    personalDeckAdditions: [],
    scars: [],
    completedRuns: 0,
    kills: 0,
    deckAdditions: [],
    boundGear: []
  };
}

export const defaultSettlement = {
  settlementName: 'Unnamed Settlement',
  population: 10,
  settlementMemory: 0,
  monsterKnowledge: {},
  nextRunBonus: {},
  graveHistory: [],
  stash: {},
  builtInnovations: ['lanternHearth'],
  craftedGear: [],
  equippedGear: [],
  armory: [],
  defeatedQuarryLevels: {},
  totalRuns: 0,
  completedHunts: 0,
  deadSurvivors: 0,
  survivors: [],
  activeSurvivorId: null,
  intimacyHistory: [],
  lanternYear: 0,
  lastIntimacyLanternYear: null,
  pendingSpecialChildTrait: null,
  discoveredQuarries: ['paleHuntLion'],
  unlockedQuarries: ['paleHuntLion'],
  rumouredInnovations: []
};

export function getSaveSlotKey(slotId) {
  return `lanternDeckbuilder.saveSlot${slotId}`;
}

function isValidSlot(slotId) {
  return Number.isInteger(Number(slotId)) && Number(slotId) >= 1 && Number(slotId) <= SLOT_COUNT;
}

export function normalizeSettlement(data = {}) {
  const survivors = Array.isArray(data.survivors) && data.survivors.length
    ? data.survivors.map(survivor => {
      const legacyBanes = (survivor.traits || [])
        .filter(trait => typeof trait === 'string' && trait.startsWith('Monster Bane: '))
        .map(trait => {
          const name = trait.replace('Monster Bane: ', '');
          if (name === 'Pale Hunt Lion') return 'monsterBane_paleHuntLion';
          if (name === 'Wailing Antelope') return 'monsterBane_wailingAntelope';
          if (name === 'Ash Phoenix') return 'monsterBane_ashPhoenix';
          return null;
        })
        .filter(Boolean);
      return {
      maxHp: 30,
      hp: 30,
      survival: 0,
      strength: 0,
      traits: [],
      fightingArts: [],
      personalDeckAdditions: [],
      scars: [],
      completedRuns: 0,
      kills: 0,
      deckAdditions: [],
      boundGear: [],
      alive: true,
      ...survivor,
      gender: ['male', 'female', 'other'].includes(survivor.gender) ? survivor.gender : 'other',
      fightingArts: [...new Set([...(survivor.fightingArts || []), ...legacyBanes])],
      personalDeckAdditions: survivor.personalDeckAdditions || survivor.deckAdditions || [],
      boundGear: Array.isArray(survivor.boundGear)
        ? survivor.boundGear.map((gear, index) => typeof gear === 'string'
          ? { instanceId: `bound-${survivor.id}-${index}-${gear}`, equipmentId: gear }
          : gear)
        : []
    };
    })
    : [];
  const livingSurvivors = survivors.filter(survivor => survivor.alive !== false);
  const activeSurvivorId = livingSurvivors.some(survivor => survivor.id === data.activeSurvivorId)
    ? data.activeSurvivorId
    : livingSurvivors[0]?.id || null;
  const hasInstanceGear = Array.isArray(data.armory) ||
    survivors.some(survivor => survivor.boundGear.length > 0);
  let armory = Array.isArray(data.armory)
    ? data.armory.map((gear, index) => typeof gear === 'string'
      ? { instanceId: `armory-${index}-${gear}`, equipmentId: gear }
      : gear)
    : [];

  if (!hasInstanceGear && Array.isArray(data.craftedGear)) {
    const equippedIndexes = new Set(Array.isArray(data.equippedGear) ? data.equippedGear : []);
    const activeSurvivor = survivors.find(survivor => survivor.id === activeSurvivorId);

    data.craftedGear.forEach((equipmentId, index) => {
      const instance = { instanceId: `legacy-${index}-${equipmentId}`, equipmentId };
      if (equippedIndexes.has(index) && activeSurvivor) activeSurvivor.boundGear.push(instance);
      else armory.push(instance);
    });
  }
  const allGearIds = [
    ...armory.map(gear => gear.equipmentId),
    ...survivors.flatMap(survivor => survivor.boundGear.map(gear => gear.equipmentId))
  ];

  return {
    ...defaultSettlement,
    ...data,
    settlementName: data.settlementName?.trim() || 'Unnamed Settlement',
    population: Number.isFinite(data.population) ? data.population : defaultSettlement.population,
    monsterKnowledge: data.monsterKnowledge || {},
    nextRunBonus: data.nextRunBonus || {},
    graveHistory: Array.isArray(data.graveHistory) ? data.graveHistory : [],
    stash: data.stash || {},
    builtInnovations: Array.isArray(data.builtInnovations)
      ? [...new Set(['lanternHearth', ...data.builtInnovations])]
      : ['lanternHearth'],
    craftedGear: allGearIds,
    equippedGear: [],
    armory,
    defeatedQuarryLevels: data.defeatedQuarryLevels || {},
    totalRuns: Number.isFinite(data.totalRuns) ? data.totalRuns : 0,
    completedHunts: Number.isFinite(data.completedHunts) ? data.completedHunts : 0,
    deadSurvivors: Number.isFinite(data.deadSurvivors)
      ? data.deadSurvivors
      : (Array.isArray(data.graveHistory) ? data.graveHistory.length : 0),
    survivors,
    activeSurvivorId,
    intimacyHistory: Array.isArray(data.intimacyHistory) ? data.intimacyHistory : [],
    lanternYear: Number.isFinite(data.lanternYear) ? data.lanternYear : 0,
    lastIntimacyLanternYear: Number.isFinite(data.lastIntimacyLanternYear)
      ? data.lastIntimacyLanternYear
      : null,
    pendingSpecialChildTrait: data.pendingSpecialChildTrait || null,
    rumouredInnovations: Array.isArray(data.rumouredInnovations) ? data.rumouredInnovations : [],
    discoveredQuarries: Array.isArray(data.discoveredQuarries)
      ? [...new Set(['paleHuntLion', ...data.discoveredQuarries])]
      : Array.isArray(data.unlockedQuarries)
        ? [...new Set(['paleHuntLion', ...data.unlockedQuarries])]
        : ['paleHuntLion'],
    unlockedQuarries: Array.isArray(data.unlockedQuarries)
      ? [...new Set(['paleHuntLion', ...data.unlockedQuarries])]
      : Array.isArray(data.discoveredQuarries)
        ? [...new Set(['paleHuntLion', ...data.discoveredQuarries])]
        : ['paleHuntLion']
  };
}

export function migrateLegacySave() {
  if (localStorage.getItem(getSaveSlotKey(1)) || !localStorage.getItem(LEGACY_SAVE_KEY)) {
    return;
  }

  try {
    const legacySave = JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY));
    if (legacySave) {
      localStorage.setItem(getSaveSlotKey(1), JSON.stringify(normalizeSettlement(legacySave)));
    }
  } catch (error) {
    // Keep an unreadable legacy save untouched so it can be recovered manually.
  }
}

export function listSaveSlots() {
  migrateLegacySave();

  return Array.from({ length: SLOT_COUNT }, (_, index) => {
    const slotId = index + 1;
    return { slotId, settlement: loadSettlement(slotId) };
  });
}

export function loadSettlement(slotId = getActiveSlot()) {
  if (!isValidSlot(slotId)) {
    return null;
  }

  migrateLegacySave();

  try {
    const rawSave = localStorage.getItem(getSaveSlotKey(slotId));
    return rawSave ? normalizeSettlement(JSON.parse(rawSave)) : null;
  } catch (error) {
    return null;
  }
}

export function saveSettlement(data, slotId = getActiveSlot()) {
  if (!isValidSlot(slotId)) {
    return;
  }

  localStorage.setItem(getSaveSlotKey(slotId), JSON.stringify(normalizeSettlement(data)));
}

export function deleteSettlement(slotId) {
  if (!isValidSlot(slotId)) {
    return;
  }

  localStorage.removeItem(getSaveSlotKey(slotId));
  if (getActiveSlot() === Number(slotId)) {
    localStorage.removeItem(ACTIVE_SLOT_KEY);
  }
}

export function setActiveSlot(slotId) {
  if (isValidSlot(slotId)) {
    localStorage.setItem(ACTIVE_SLOT_KEY, String(slotId));
  }
}

export function getActiveSlot() {
  const slotId = Number(localStorage.getItem(ACTIVE_SLOT_KEY));
  return isValidSlot(slotId) ? slotId : 1;
}

export function hasSave(slotId) {
  migrateLegacySave();
  return isValidSlot(slotId) && localStorage.getItem(getSaveSlotKey(slotId)) !== null;
}
