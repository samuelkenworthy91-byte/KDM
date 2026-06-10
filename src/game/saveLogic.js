import { quarries } from '../data/quarries.js';
import { createWeaponProficiency } from '../data/weaponProficiency.js';
import { createHitLocations } from '../data/woundTables.js';

const LEGACY_SAVE_KEY = 'settlement';
const ACTIVE_SLOT_KEY = 'lanternDeckbuilder.activeSlot';
const SLOT_COUNT = 3;
const BASE_INNOVATION_POOL_IDS = [
  'language', 'symposium', 'ammonia', 'cooking', 'bloodletting', 'graves',
  'oralTradition', 'sharedWarnings', 'trailSignals'
];
const CHILD_TRAIT_ALIASES = {
  'Lantern-Touched': 'lanternEyed',
  'Lantern-Eyed': 'lanternEyed',
  'Bone-Strong': 'boneStrong',
  'Quiet Listener': 'quietListener',
  'Dream-Touched': 'quietListener',
  'Marked by the Dark': 'markedByTheDark',
  Scarless: 'scarless',
  'Lucky Birth': 'luckyBirth',
  'Wolf Smile': 'wolfSmile'
};
const QUARRY_LOCATION_IDS = {
  paleHuntLion: 'lionTrophyHall',
  wailingAntelope: 'antelopeLarder',
  ashPhoenix: 'phoenixPyre',
  bloatedGodling: 'stormShrine',
  crimsonCrocodile: 'redTannery',
  frogdog: 'wetYard',
  silkMatriarch: 'silkLoom',
  bloomKnight: 'duelistGarden',
  smogSingers: 'smogKiln',
  chitinCrusader: 'chitinFoundry',
  drakeEmperor: 'crystalForge',
  sunSovereign: 'shellSanctum',
  prideKing: 'prideHall'
};

function normalizePersonalAddition(addition, fallbackSourceType = 'personal') {
  if (typeof addition === 'string') {
    return {
      cardId: addition,
      sourceType: addition === 'panic' ? 'curse' : fallbackSourceType
    };
  }
  if (!addition?.cardId) return null;
  return {
    ...addition,
    sourceType: addition.sourceType || (addition.cardId === 'panic' ? 'curse' : fallbackSourceType)
  };
}

function isMonsterBaneId(id) {
  return typeof id === 'string' && id.startsWith('monsterBane_');
}

function normalizeMonsterBanes(fightingArts, survivorName, history) {
  const uniqueArts = [...new Set(fightingArts)];
  const baneIds = uniqueArts.filter(isMonsterBaneId);
  if (baneIds.length <= 1) return { fightingArts: uniqueArts, history };

  const keptId = baneIds[0];
  const keptName = keptId
    .replace('monsterBane_', '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, letter => letter.toUpperCase());
  return {
    fightingArts: uniqueArts.filter(id => !isMonsterBaneId(id) || id === keptId),
    history: [
      ...(Array.isArray(history) ? history : []),
      `Conflicting Monster Bane knowledge faded. Monster Bane: ${keptName} remained.`
    ]
  };
}

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
    maxSurvival: 3,
    strength: 0,
    traits: [],
    fightingArts: [],
    personalDeckAdditions: [],
    permanentNegativeCards: [],
    forgottenCardIds: [],
    injuries: [],
    scars: [],
    disorders: [],
    hitLocations: createHitLocations(),
    treatmentNotes: [],
    woundHistory: [],
    history: [],
    permanentModifiers: {},
    forgottenCardsLog: [],
    lastForgetLanternYear: null,
    completedRuns: 0,
    kills: 0,
    deckAdditions: [],
    boundGear: [],
    weaponProficiency: createWeaponProficiency()
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
  totalCraftedGear: 0,
  equippedGear: [],
  armory: [],
  defeatedQuarryLevels: {},
  totalRuns: 0,
  completedHunts: 0,
  deadSurvivors: 0,
  survivors: [],
  activeSurvivorId: null,
  maxHuntPartySize: 1,
  huntingParty: [],
  intimacyHistory: [],
  lanternYear: 0,
  lastIntimacyLanternYear: null,
  lastInjuryTreatmentLanternYear: null,
  builtMemoryInnovations: [],
  innovationDeckState: {
    discoveredInnovationIds: [],
    availableInnovationPoolIds: BASE_INNOVATION_POOL_IDS,
    builtInnovationIds: ['lanternHearth'],
    innovationHistory: []
  },
  memoryActionsUsedThisYear: {},
  survivorTrainingLog: [],
  conditionHistory: {
    injuryGained: false,
    disorderGained: false
  },
  pendingSpecialChildTrait: null,
  timelineHistory: [],
  lastTimelineEvent: null,
  pendingTimelineEvent: null,
  pendingNemesisEncounter: null,
  revealedNemesisIds: [],
  seenNemesisLoreIds: [],
  settlementHistory: [],
  lastNemesisResult: null,
  discoveredQuarries: ['paleHuntLion'],
  unlockedQuarries: ['paleHuntLion'],
  rumouredInnovations: []
  ,
  unlockedRecipeFamilies: ['paleHuntLion'],
  rumourTexts: []
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
      const normalizedBanes = normalizeMonsterBanes(
        [...(survivor.fightingArts || []), ...legacyBanes],
        survivor.name,
        survivor.history
      );
      return {
        hp: 30,
        survival: 0,
        maxSurvival: 3,
        strength: 0,
        completedRuns: 0,
        kills: 0,
        alive: true,
        ...survivor,
        gender: ['male', 'female', 'other'].includes(survivor.gender) ? survivor.gender : 'other',
        injuries: Array.isArray(survivor.injuries) ? survivor.injuries : [],
        scars: Array.isArray(survivor.scars) ? survivor.scars : [],
        disorders: Array.isArray(survivor.disorders) ? survivor.disorders : [],
        hitLocations: createHitLocations(survivor.hitLocations),
        treatmentNotes: Array.isArray(survivor.treatmentNotes) ? survivor.treatmentNotes : [],
        woundHistory: Array.isArray(survivor.woundHistory) ? survivor.woundHistory : [],
        traits: Array.isArray(survivor.traits)
          ? survivor.traits.map(trait => CHILD_TRAIT_ALIASES[trait] || trait)
          : [],
        maxHp: (survivor.maxHp || 30) + (
          survivor.scars?.includes('boneSetWrong') &&
          !survivor.permanentModifiers?.boneSetWrongApplied ? 1 : 0
        ),
        permanentModifiers: {
          ...(survivor.permanentModifiers && typeof survivor.permanentModifiers === 'object'
            ? survivor.permanentModifiers
            : {}),
          ...(survivor.scars?.includes('boneSetWrong') ? { boneSetWrongApplied: true } : {})
        },
        forgottenCardsLog: Array.isArray(survivor.forgottenCardsLog)
          ? survivor.forgottenCardsLog
          : [],
        forgottenCardIds: Array.isArray(survivor.forgottenCardIds)
          ? [...new Set(survivor.forgottenCardIds)]
          : [],
        permanentNegativeCards: Array.isArray(survivor.permanentNegativeCards)
          ? survivor.permanentNegativeCards.map(addition =>
            normalizePersonalAddition(addition, 'curse')
          ).filter(Boolean)
          : [],
        lastForgetLanternYear: Number.isFinite(survivor.lastForgetLanternYear)
          ? survivor.lastForgetLanternYear
          : null,
        fightingArts: normalizedBanes.fightingArts,
        history: normalizedBanes.history,
        personalDeckAdditions: [
          ...(Array.isArray(survivor.personalDeckAdditions) ? survivor.personalDeckAdditions : []),
          ...(Array.isArray(survivor.deckAdditions) ? survivor.deckAdditions : [])
        ].map(addition => normalizePersonalAddition(addition)).filter(Boolean),
        maxSurvival: Math.max(1, Number(survivor.maxSurvival) || 3),
        survival: Math.min(
          Math.max(0, Number(survivor.survival) || 0),
          Math.max(1, Number(survivor.maxSurvival) || 3)
        ),
        deckAdditions: [],
        weaponProficiency: createWeaponProficiency(survivor.weaponProficiency),
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
  const legacyBuiltInnovationIds = [
    ...(Array.isArray(data.builtInnovations) ? data.builtInnovations : []),
    ...(Array.isArray(data.builtMemoryInnovations) ? data.builtMemoryInnovations : [])
  ];
  const innovationDeckState = data.innovationDeckState || {};
  const builtInnovationIds = [...new Set([
    'lanternHearth',
    ...legacyBuiltInnovationIds,
    ...(Array.isArray(innovationDeckState.builtInnovationIds)
      ? innovationDeckState.builtInnovationIds
      : [])
  ])];
  const discoveredQuarryIds = Array.isArray(data.discoveredQuarries)
    ? data.discoveredQuarries.filter(id => quarries[id]?.role === 'quarry')
    : Array.isArray(data.unlockedQuarries)
      ? data.unlockedQuarries.filter(id => quarries[id]?.role === 'quarry')
      : [];
  const migratedLocationIds = discoveredQuarryIds.map(id => QUARRY_LOCATION_IDS[id]).filter(Boolean);

  return {
    ...defaultSettlement,
    ...data,
    settlementName: data.settlementName?.trim() || 'Unnamed Settlement',
    population: Number.isFinite(data.population) ? data.population : defaultSettlement.population,
    monsterKnowledge: data.monsterKnowledge || {},
    nextRunBonus: data.nextRunBonus || {},
    graveHistory: Array.isArray(data.graveHistory)
      ? data.graveHistory.map(grave => ({
        ...grave,
        injuries: Array.isArray(grave.injuries) ? grave.injuries : [],
        scars: Array.isArray(grave.scars) ? grave.scars : [],
        disorders: Array.isArray(grave.disorders) ? grave.disorders : [],
        fightingArts: Array.isArray(grave.fightingArts) ? grave.fightingArts : [],
        traits: Array.isArray(grave.traits) ? grave.traits : [],
        gearLostNames: Array.isArray(grave.gearLostNames) ? grave.gearLostNames : [],
        weaponProficiency: createWeaponProficiency(grave.weaponProficiency),
        proficientWeaponTypes: Array.isArray(grave.proficientWeaponTypes)
          ? grave.proficientWeaponTypes
          : [],
        masteredWeaponTypes: Array.isArray(grave.masteredWeaponTypes)
          ? grave.masteredWeaponTypes
          : []
      }))
      : [],
    stash: data.stash || {},
    builtInnovations: [...new Set([
      'lanternHearth',
      ...(Array.isArray(data.builtInnovations) ? data.builtInnovations : []),
      ...migratedLocationIds
    ])],
    craftedGear: allGearIds,
    totalCraftedGear: Math.max(
      Number.isFinite(data.totalCraftedGear) ? data.totalCraftedGear : 0,
      Array.isArray(data.craftedGear) ? data.craftedGear.length : 0,
      allGearIds.length
    ),
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
    maxHuntPartySize: Math.min(4, Math.max(1, Number(data.maxHuntPartySize) || 1)),
    huntingParty: (Array.isArray(data.huntingParty) ? data.huntingParty : [activeSurvivorId])
      .filter((id, index, ids) =>
        id && ids.indexOf(id) === index &&
        livingSurvivors.some(survivor => survivor.id === id)
      )
      .slice(0, Math.min(4, Math.max(1, Number(data.maxHuntPartySize) || 1))),
    intimacyHistory: Array.isArray(data.intimacyHistory) ? data.intimacyHistory : [],
    lanternYear: Number.isFinite(data.lanternYear) ? data.lanternYear : 0,
    lastIntimacyLanternYear: Number.isFinite(data.lastIntimacyLanternYear)
      ? data.lastIntimacyLanternYear
      : null,
    lastInjuryTreatmentLanternYear: Number.isFinite(data.lastInjuryTreatmentLanternYear)
      ? data.lastInjuryTreatmentLanternYear
      : null,
    builtMemoryInnovations: Array.isArray(data.builtMemoryInnovations)
      ? [...new Set(data.builtMemoryInnovations)]
      : [],
    innovationDeckState: {
      discoveredInnovationIds: [...new Set([
        ...builtInnovationIds,
        ...(Array.isArray(innovationDeckState.discoveredInnovationIds)
          ? innovationDeckState.discoveredInnovationIds
          : [])
      ])],
      availableInnovationPoolIds: [...new Set([
        ...BASE_INNOVATION_POOL_IDS,
        ...(Array.isArray(innovationDeckState.availableInnovationPoolIds)
          ? innovationDeckState.availableInnovationPoolIds
          : [])
      ])],
      builtInnovationIds,
      innovationHistory: Array.isArray(innovationDeckState.innovationHistory)
        ? innovationDeckState.innovationHistory
        : []
    },
    memoryActionsUsedThisYear: data.memoryActionsUsedThisYear &&
      typeof data.memoryActionsUsedThisYear === 'object'
      ? data.memoryActionsUsedThisYear
      : {},
    survivorTrainingLog: Array.isArray(data.survivorTrainingLog) ? data.survivorTrainingLog : [],
    conditionHistory: {
      injuryGained: Boolean(
        data.conditionHistory?.injuryGained ||
        survivors.some(survivor => survivor.injuries.length) ||
        data.graveHistory?.some(grave => grave.injuries?.length)
      ),
      disorderGained: Boolean(
        data.conditionHistory?.disorderGained ||
        survivors.some(survivor => survivor.disorders.length) ||
        data.graveHistory?.some(grave => grave.disorders?.length)
      )
    },
    pendingSpecialChildTrait:
      CHILD_TRAIT_ALIASES[data.pendingSpecialChildTrait] ||
      data.pendingSpecialChildTrait ||
      null,
    timelineHistory: Array.isArray(data.timelineHistory) ? data.timelineHistory : [],
    lastTimelineEvent: data.lastTimelineEvent || null,
    pendingTimelineEvent: data.pendingTimelineEvent || null,
    pendingNemesisEncounter: data.pendingNemesisEncounter || null,
    revealedNemesisIds: Array.isArray(data.revealedNemesisIds)
      ? [...new Set(data.revealedNemesisIds)]
      : [],
    seenNemesisLoreIds: Array.isArray(data.seenNemesisLoreIds)
      ? [...new Set(data.seenNemesisLoreIds)]
      : [],
    settlementHistory: Array.isArray(data.settlementHistory) ? data.settlementHistory : [],
    lastNemesisResult: data.lastNemesisResult || null,
    rumouredInnovations: Array.isArray(data.rumouredInnovations) ? data.rumouredInnovations : [],
    unlockedRecipeFamilies: [...new Set([
      'paleHuntLion',
      ...(Array.isArray(data.unlockedRecipeFamilies) ? data.unlockedRecipeFamilies : []),
      ...discoveredQuarryIds
    ])],
    rumourTexts: Array.isArray(data.rumourTexts) ? [...new Set(data.rumourTexts)] : [],
    discoveredQuarries: Array.isArray(data.discoveredQuarries)
      ? [...new Set(['paleHuntLion', ...data.discoveredQuarries.filter(id =>
        quarries[id]?.role === 'quarry'
      )])]
      : Array.isArray(data.unlockedQuarries)
        ? [...new Set(['paleHuntLion', ...data.unlockedQuarries.filter(id =>
          quarries[id]?.role === 'quarry'
        )])]
        : ['paleHuntLion'],
    unlockedQuarries: Array.isArray(data.unlockedQuarries)
      ? [...new Set(['paleHuntLion', ...data.unlockedQuarries.filter(id =>
        quarries[id]?.role === 'quarry'
      )])]
      : Array.isArray(data.discoveredQuarries)
        ? [...new Set(['paleHuntLion', ...data.discoveredQuarries.filter(id =>
          quarries[id]?.role === 'quarry'
        )])]
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
