import {
  calculateAvailableQuarryTiers,
  normalizeDefeatedQuarryLevels,
  quarries
} from '../data/quarries.js';
import { equipment } from '../data/equipment.js';
import {
  BASE_INNOVATION_POOL_IDS,
  MEMORY_ACTION_INNOVATION_IDS
} from '../data/innovationCards.js';
import {
  createWeaponProficiency,
  isValidWeaponType,
  syncWeaponMasteryCards
} from '../data/weaponProficiency.js';
import { createHitLocations } from '../data/woundTables.js';
import { syncFightingArtCards } from './survivorProgression.js';
import {
  getSurvivorDisplayName,
  normalizeSurvivorIdentity
} from './survivorIdentity.js';
import { getMemoryBalance } from './memoryEconomy.js';
import { normalizeInnovationDeckState } from './innovationModel.js';

const LEGACY_SAVE_KEY = 'settlement';
const ACTIVE_SLOT_KEY = 'lanternDeckbuilder.activeSlot';
const SLOT_COUNT = 3;
const SAVE_VERSION = 5;
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

function normalizeCount(value) {
  if (Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') {
    if (
      (typeof value.id === 'string' || typeof value.resourceId === 'string') &&
      value.count === undefined &&
      value.amount === undefined &&
      value.quantity === undefined &&
      value.copies === undefined
    ) {
      return 1;
    }
    return Math.max(0, Math.floor(Number(
      value.count ?? value.amount ?? value.quantity ?? value.copies ?? 0
    ) || 0));
  }
  return Math.max(0, Math.floor(Number(value) || 0));
}

function normalizeStash(stash) {
  if (Array.isArray(stash)) {
    return stash.reduce((next, entry) => {
      const resourceId = typeof entry === 'string' ? entry : entry?.id || entry?.resourceId;
      if (typeof resourceId !== 'string' || !resourceId) return next;
      next[resourceId] = (next[resourceId] || 0) + 1;
      return next;
    }, {});
  }
  if (!stash || typeof stash !== 'object') return {};
  return Object.fromEntries(
    Object.entries(stash)
      .filter(([resourceId]) => typeof resourceId === 'string' && resourceId)
      .map(([resourceId, value]) => [resourceId, normalizeCount(value)])
      .filter(([, count]) => count > 0)
  );
}

function normalizeGearCardTraining(training) {
  if (!training || typeof training !== 'object' || Array.isArray(training)) return {};
  return Object.fromEntries(
    Object.entries(training).flatMap(([key, value]) => {
      if (!key) return [];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const direct = normalizeCount(value);
        if (direct > 0) return [[key, direct]];
        return Object.entries(value).flatMap(([cardId, nestedValue]) => {
          const nested = normalizeCount(nestedValue);
          return nested > 0 ? [[`${key}:${cardId}`, nested]] : [];
        });
      }
      const count = normalizeCount(value);
      return count > 0 ? [[key, count]] : [];
    })
  );
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
  const identity = normalizeSurvivorIdentity({
    name: name?.trim() || options.firstName || options.givenName || 'Nameless Survivor',
    generationType: options.generationType || 'founder',
    firstName: options.firstName || options.givenName || name,
    givenName: options.firstName || options.givenName || name,
    familyName: options.familyName || null,
    generation: options.generation,
    parentIds: options.parentIds || [],
    parentNames: options.parentNames || [],
    birthLanternYear: options.birthLanternYear,
    bornFromIntimacy: options.bornFromIntimacy,
    innateTraits: options.innateTraits || [],
    purchasedBirthTraits: options.purchasedBirthTraits || [],
    memorySpentAtBirth: options.memorySpentAtBirth,
    familyOrigin: options.familyOrigin || null
  });
  return {
    id: `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...identity,
    name: getSurvivorDisplayName(identity),
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
    recentRewardOfferIds: [],
    permanentNegativeCards: [],
    forgottenCardIds: [],
    gearCardTraining: {},
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
    unavailableHunts: 0,
    completedRuns: 0,
    kills: 0,
    deckAdditions: [],
    boundGear: [],
    weaponProficiency: createWeaponProficiency(),
    activeProficiencyType: 'fistAndTooth'
  };
}

export const defaultSettlement = {
  saveVersion: SAVE_VERSION,
  settlementName: 'Unnamed Settlement',
  population: 10,
  settlementMemory: 0,
  memories: 0,
  memoryHistory: [],
  pendingDeathResolutions: [],
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
  availableQuarryTiers: ['early'],
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
  pendingInnovationTutorialId: null,
  memoryActionsUsedThisYear: {},
  survivorTrainingLog: [],
  conditionHistory: {
    injuryGained: false,
    disorderGained: false
  },
  pendingNewborn: null,
  pendingSpecialChildTrait: null,
  timelineHistory: [],
  lastTimelineEvent: null,
  pendingTimelineEvent: null,
  lastTimelineResult: null,
  timelineFlags: {},
  campaignPressure: 0,
  lastMajorTimelineEventYear: null,
  resolvedTimelineEventIds: [],
  timelineDamagedBuildings: {},
  pendingNemesisEncounter: null,
  revealedNemesisIds: [],
  seenNemesisLoreIds: [],
  settlementHistory: [],
  huntRewardLedger: {},
  temporarySettlementModifiers: {},
  quarryRetreatModifiers: {},
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
  const migratedMemoryBalance = getMemoryBalance(data);
  const survivors = Array.isArray(data.survivors) && data.survivors.length
    ? data.survivors.map(survivor => {
      const survivorIdentity = normalizeSurvivorIdentity(survivor);
      const legacyBanes = (survivor.traits || [])
        .filter(trait => typeof trait === 'string' && trait.startsWith('Monster Bane: '))
        .map(trait => {
          const name = trait.replace('Monster Bane: ', '');
          const quarry = Object.values(quarries).find(item =>
            item.name === name || item.displayName === name
          );
          return quarry ? `monsterBane_${quarry.id}` : null;
        })
        .filter(Boolean);
      const normalizedBanes = normalizeMonsterBanes(
        [...(survivor.fightingArts || []), ...legacyBanes],
        getSurvivorDisplayName(survivorIdentity),
        survivor.history
      );
      const boundGear = Array.isArray(survivor.boundGear)
        ? survivor.boundGear.map((gear, index) => typeof gear === 'string'
          ? { instanceId: `bound-${survivor.id}-${index}-${gear}`, equipmentId: gear }
          : gear)
        : [];
      const equippedWeaponTypes = [...new Set(boundGear
        .map(gear => equipment[gear.equipmentId])
        .filter(item => item?.proficiencyXpGranted && isValidWeaponType(item.weaponType))
        .map(item => item.weaponType))];
      const activeProficiencyType = equippedWeaponTypes.includes(survivor.activeProficiencyType)
        ? survivor.activeProficiencyType
        : equippedWeaponTypes[0] || 'fistAndTooth';
      const normalizedSurvivor = {
        hp: 30,
        survival: 0,
        maxSurvival: 3,
        strength: 0,
        completedRuns: 0,
        kills: 0,
        unavailableHunts: 0,
        alive: true,
        ...survivor,
        ...survivorIdentity,
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
        unavailableHunts: Math.max(0, Number(survivor.unavailableHunts) || 0),
        fightingArts: normalizedBanes.fightingArts,
        history: normalizedBanes.history,
        personalDeckAdditions: [
          ...(Array.isArray(survivor.personalDeckAdditions) ? survivor.personalDeckAdditions : []),
          ...(Array.isArray(survivor.deckAdditions) ? survivor.deckAdditions : [])
        ].map(addition => normalizePersonalAddition(addition)).filter(Boolean),
        recentRewardOfferIds: Array.isArray(survivor.recentRewardOfferIds)
          ? survivor.recentRewardOfferIds.filter(id => typeof id === 'string').slice(-15)
          : [],
        gearCardTraining: normalizeGearCardTraining(survivor.gearCardTraining),
        maxSurvival: Math.max(1, Number(survivor.maxSurvival) || 3),
        survival: Math.min(
          Math.max(0, Number(survivor.survival) || 0),
          Math.max(1, Number(survivor.maxSurvival) || 3)
        ),
        deckAdditions: [],
        weaponProficiency: createWeaponProficiency(survivor.weaponProficiency),
        activeProficiencyType,
        boundGear
      };
      return syncFightingArtCards(syncWeaponMasteryCards(normalizedSurvivor));
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
  const normalizedInnovationDeckState = normalizeInnovationDeckState(innovationDeckState, {
    ownedIds: builtInnovationIds,
    defaultPoolIds: BASE_INNOVATION_POOL_IDS
  });
  const builtMemoryInnovationIds = [...new Set([
    ...(Array.isArray(data.builtMemoryInnovations) ? data.builtMemoryInnovations : []),
    ...normalizedInnovationDeckState.builtInnovationIds.filter(id =>
      MEMORY_ACTION_INNOVATION_IDS.includes(id)
    )
  ])];
  const discoveredQuarryIds = [...new Set([
    ...(Array.isArray(data.discoveredQuarries) ? data.discoveredQuarries : []),
    ...(Array.isArray(data.unlockedQuarries) ? data.unlockedQuarries : [])
  ])].filter(id => quarries[id]?.role === 'quarry');
  const migratedLocationIds = discoveredQuarryIds.map(id => QUARRY_LOCATION_IDS[id]).filter(Boolean);
  const defeatedQuarryLevels = normalizeDefeatedQuarryLevels(data.defeatedQuarryLevels);
  const progressionSettlement = {
    ...data,
    discoveredQuarries: discoveredQuarryIds,
    unlockedQuarries: discoveredQuarryIds
  };

  return {
    ...defaultSettlement,
    ...data,
    settlementName: data.settlementName?.trim() || 'Unnamed Settlement',
    population: Number.isFinite(data.population) ? data.population : defaultSettlement.population,
    memories: migratedMemoryBalance,
    settlementMemory: migratedMemoryBalance,
    memoryHistory: Array.isArray(data.memoryHistory) ? data.memoryHistory : (
      migratedMemoryBalance > 0
        ? [{
          id: 'legacy-memory-migration',
          type: 'migration',
          amount: migratedMemoryBalance,
          balance: migratedMemoryBalance,
          source: 'legacy-save',
          description: 'Migrated from the previous settlement memory balance.',
          survivorIds: [],
          huntId: null,
          lanternYear: Number.isFinite(data.lanternYear) ? data.lanternYear : null,
          timestamp: new Date().toISOString()
        }]
        : []
    ),
    pendingDeathResolutions: Array.isArray(data.pendingDeathResolutions)
      ? data.pendingDeathResolutions
      : [],
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
    stash: normalizeStash(data.stash),
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
    defeatedQuarryLevels,
    availableQuarryTiers: calculateAvailableQuarryTiers(progressionSettlement),
    totalRuns: Number.isFinite(data.totalRuns) ? data.totalRuns : 0,
    completedHunts: Number.isFinite(data.completedHunts) ? data.completedHunts : 0,
    deadSurvivors: Number.isFinite(data.deadSurvivors)
      ? data.deadSurvivors
      : (Array.isArray(data.graveHistory) ? data.graveHistory.length : 0),
    survivors,
    livingSurvivors,
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
    builtMemoryInnovations: builtMemoryInnovationIds,
    innovationDeckState: normalizedInnovationDeckState,
    pendingInnovationTutorialId: typeof data.pendingInnovationTutorialId === 'string'
      ? data.pendingInnovationTutorialId
      : null,
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
    pendingNewborn: data.pendingNewborn && typeof data.pendingNewborn === 'object'
      ? {
        id: data.pendingNewborn.id || `newborn-${Date.now()}`,
        parentIds: Array.isArray(data.pendingNewborn.parentIds)
          ? data.pendingNewborn.parentIds.filter(Boolean).slice(0, 2)
          : [],
        parentNames: Array.isArray(data.pendingNewborn.parentNames)
          ? data.pendingNewborn.parentNames.filter(Boolean).slice(0, 2)
          : [],
        suggestedFamilyNames: Array.isArray(data.pendingNewborn.suggestedFamilyNames)
          ? [...new Set(data.pendingNewborn.suggestedFamilyNames.filter(Boolean))]
          : [],
        suggestedFirstName: data.pendingNewborn.suggestedFirstName || '',
        innateTraitIds: Array.isArray(data.pendingNewborn.innateTraitIds)
          ? data.pendingNewborn.innateTraitIds
              .map(id => CHILD_TRAIT_ALIASES[id] || id)
              .filter(Boolean)
          : [],
        birthLanternYear: Number.isFinite(data.pendingNewborn.birthLanternYear)
          ? data.pendingNewborn.birthLanternYear
          : Number(data.lanternYear) || 0,
        generation: Math.max(1, Number(data.pendingNewborn.generation) || 2),
        remainingBirths: Math.max(1, Number(data.pendingNewborn.remainingBirths) || 1),
        source: 'intimacy',
        historyTimestamp: data.pendingNewborn.historyTimestamp || null
      }
      : null,
    pendingSpecialChildTrait:
      CHILD_TRAIT_ALIASES[data.pendingSpecialChildTrait] ||
      data.pendingSpecialChildTrait ||
      null,
    timelineHistory: Array.isArray(data.timelineHistory) ? data.timelineHistory : [],
    lastTimelineEvent: data.lastTimelineEvent || null,
    pendingTimelineEvent: data.pendingTimelineEvent || null,
    lastTimelineResult: data.lastTimelineResult || null,
    timelineFlags: data.timelineFlags && typeof data.timelineFlags === 'object'
      ? data.timelineFlags
      : {},
    campaignPressure: Math.max(0, Number(data.campaignPressure) || 0),
    lastMajorTimelineEventYear: Number.isFinite(data.lastMajorTimelineEventYear)
      ? data.lastMajorTimelineEventYear
      : null,
    resolvedTimelineEventIds: Array.isArray(data.resolvedTimelineEventIds)
      ? [...new Set(data.resolvedTimelineEventIds)]
      : [],
    timelineDamagedBuildings: data.timelineDamagedBuildings &&
      typeof data.timelineDamagedBuildings === 'object'
      ? data.timelineDamagedBuildings
      : {},
    pendingNemesisEncounter: data.pendingNemesisEncounter || null,
    revealedNemesisIds: Array.isArray(data.revealedNemesisIds)
      ? [...new Set(data.revealedNemesisIds)]
      : [],
    seenNemesisLoreIds: Array.isArray(data.seenNemesisLoreIds)
      ? [...new Set(data.seenNemesisLoreIds)]
      : [],
    settlementHistory: Array.isArray(data.settlementHistory) ? data.settlementHistory : [],
    huntRewardLedger: data.huntRewardLedger && typeof data.huntRewardLedger === 'object'
      ? data.huntRewardLedger
      : {},
    temporarySettlementModifiers:
      data.temporarySettlementModifiers && typeof data.temporarySettlementModifiers === 'object'
        ? data.temporarySettlementModifiers
        : {},
    quarryRetreatModifiers:
      data.quarryRetreatModifiers && typeof data.quarryRetreatModifiers === 'object'
        ? data.quarryRetreatModifiers
        : {},
    lastNemesisResult: data.lastNemesisResult && typeof data.lastNemesisResult === 'object'
      ? {
        ...data.lastNemesisResult,
        details: Array.isArray(data.lastNemesisResult.details)
          ? data.lastNemesisResult.details
          : [],
        uniqueReward: data.lastNemesisResult.uniqueReward &&
          typeof data.lastNemesisResult.uniqueReward === 'object'
          ? {
            rewardEventId: data.lastNemesisResult.uniqueReward.rewardEventId || null,
            uniqueResourceId: data.lastNemesisResult.uniqueReward.uniqueResourceId || null,
            uniqueResourceName:
              data.lastNemesisResult.uniqueReward.uniqueResourceName || 'Unknown / Legacy',
            artId: data.lastNemesisResult.uniqueReward.artId || null,
            artName: data.lastNemesisResult.uniqueReward.artName || 'Unknown / Legacy',
            artDescription: data.lastNemesisResult.uniqueReward.artDescription ||
              'This older reward has no current description.',
            artOwned: Boolean(data.lastNemesisResult.uniqueReward.artOwned),
            rewardChoices: Array.isArray(data.lastNemesisResult.uniqueReward.rewardChoices)
              ? data.lastNemesisResult.uniqueReward.rewardChoices
              : [],
            rewardClaimed: Boolean(data.lastNemesisResult.uniqueReward.rewardClaimed),
            chosenRewardId: data.lastNemesisResult.uniqueReward.chosenRewardId || null,
            learningText: data.lastNemesisResult.uniqueReward.learningText ||
              'The survivor carried an unnamed lesson home.'
          }
          : null
      }
      : null,
    rumouredInnovations: Array.isArray(data.rumouredInnovations) ? data.rumouredInnovations : [],
    unlockedRecipeFamilies: [...new Set([
      'paleHuntLion',
      ...(Array.isArray(data.unlockedRecipeFamilies) ? data.unlockedRecipeFamilies : []),
      ...discoveredQuarryIds
    ])],
    rumourTexts: Array.isArray(data.rumourTexts) ? [...new Set(data.rumourTexts)] : [],
    discoveredQuarries: [...new Set(['paleHuntLion', ...discoveredQuarryIds])],
    unlockedQuarries: [...new Set(['paleHuntLion', ...discoveredQuarryIds])]
  };
}

export function safeParseSave(rawSave, slotId = 1) {
  if (typeof rawSave !== 'string' || !rawSave.trim()) return null;
  try {
    const parsed = JSON.parse(rawSave);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Save root is not an object.');
    }
    return normalizeSettlement(parsed);
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn(`[Save recovery] Save Slot ${slotId} is malformed.`, error);
    }
    return normalizeSettlement({
      ...defaultSettlement,
      settlementName: `Recovered Save Slot ${slotId}`,
      recoveryReason: 'The save data was malformed. The original data was preserved as a backup.',
      settlementHistory: [{
        type: 'recovery',
        message: 'A malformed save was opened in recovery mode.',
        reason: error instanceof Error ? error.message : 'Malformed save',
        timestamp: new Date().toISOString()
      }]
    });
  }
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

  const rawSave = localStorage.getItem(getSaveSlotKey(slotId));
  if (!rawSave) return null;
  const parsed = safeParseSave(rawSave, slotId);
  if (parsed?.recoveryReason) {
    const backupKey = `${getSaveSlotKey(slotId)}.brokenBackup`;
    if (!localStorage.getItem(backupKey)) localStorage.setItem(backupKey, rawSave);
  }
  return parsed;
}

export function saveSettlement(data, slotId = getActiveSlot()) {
  if (!isValidSlot(slotId)) {
    return;
  }

  try {
    localStorage.setItem(getSaveSlotKey(slotId), JSON.stringify(normalizeSettlement(data)));
  } catch (error) {
    console.warn(`[Save recovery] Could not save Slot ${slotId}.`, error);
  }
}

export function deleteSettlement(slotId) {
  if (!isValidSlot(slotId)) {
    return;
  }

  localStorage.removeItem(getSaveSlotKey(slotId));
  if (Number(slotId) === 1) {
    localStorage.removeItem(LEGACY_SAVE_KEY);
  }
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
