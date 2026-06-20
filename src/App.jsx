import React, { useEffect, useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { cards, starterCardIds, trainingCardIds } from './data/cards.js';
import {
  birthTraitOptions,
  childTraitList,
  childTraits,
  normalizeChildTraitId
} from './data/childTraits.js';
import { getCreatureBehaviour } from './data/creatureBehaviours.js';
import {
  equipment,
  getEquipmentDisplayName
} from './data/equipment.js';
import { events } from './data/events.js';
import { disorders } from './data/disorders.js';
import {
  getNemesisBehaviour,
  nemesisEncounters
} from './data/nemesisEncounters.js';
import {
  fightingArts,
  generalFightingArts,
  getMonsterBaneId,
  getSurvivorMonsterBaneId,
  isMonsterBaneId
} from './data/fightingArts.js';
import { graveLegacies } from './data/graveLegacies.js';
import { getIntentTargetRule } from './game/monsterTargeting.js';
import {
  innovationCards,
  QUARRY_INNOVATION_POOL,
  startingTraits
} from './data/innovationCards.js';
import {
  calculateAvailableQuarryTiers,
  getDiscoveryChoices,
  getHighestDefeatedQuarryLevel,
  hasDefeatedQuarryLevel,
  quarryList,
  quarries,
  recordDefeatedQuarryLevel,
  rollTierGenericBossRewards
} from './data/quarries.js';
import {
  findMonsterSurvivorReward,
  shouldOfferMonsterBane
} from './data/monsterSurvivorRewards.js';
import { findSurvivorReward } from './data/survivorRewards.js';
import {
  applyWeaponProficiencyXp,
  getProficientWeaponSummary
} from './data/weaponProficiency.js';
import {
  genericResourceIds,
  resources as resourceData
} from './data/resources.js';
import { getQuarryDiscoveryEvent } from './data/quarryDiscoveryEvents.js';
import { createMonsterWeakPoints, getBrokenWeakPointRewards } from './data/weakPoints.js';
import { buildHarvestRewardOffers } from './game/harvestRewardLogic.js';
import {
  calculateAffinityTotals,
  getAffinityCombatBonus,
  getPurpleHarvestBonus
} from './game/affinityLogic.js';
import { treatWound } from './data/woundTables.js';
import {
  addResources,
  canAffordCost,
  canCraft,
  deductCost
} from './game/craftingLogic.js';
import { getGearUnlockState } from './utils/gearNormalization.js';
import { validateOverhaulData } from './utils/overhaulValidation.js';
import {
  addUniqueCondition,
  getConditionName,
  rollBossScar,
  rollLowHpCondition
} from './game/conditionLogic.js';
import {
  calculateIntimacyProjections,
  resolveEvent,
  shouldLoveJuiceProtectIntimacy,
  spendLoveJuiceForIntimacy
} from './game/eventLogic.js';
import { buildRunDeck, getCardsFromIds, getPersonalCardId, removePanicFromSurvivor } from './game/deckLogic.js';
import {
  EARLY_FORGETTING_COST,
  forgetSurvivorCard,
  getCardForgetEligibility
} from './game/cardForgetting.js';
import { resolveRestStopChoice } from './game/restStopLogic.js';
import {
  createNemesisVictoryReward,
  getNemesisRewardChoice
} from './game/nemesisRewardLogic.js';
import {
  applyInnovationChoice,
  drawInnovationCandidates,
  getDrawableInnovationIdsForSettlement
} from './game/innovationLogic.js';
import {
  applyInnovationPayment,
  validateInnovationPayment
} from './game/innovationPayment.js';
import {
  getSurvivorDisplayName
} from './game/survivorIdentity.js';
import { createPendingNewborn, getBirthTraitCost } from './game/newbornLogic.js';
import {
  awardHuntReturnMemories,
  canSpendMemories,
  createDeathResolution,
  gainMemories,
  queueDeathResolutions,
  resolveDeathMemoryChoice,
  spendMemories
} from './game/memoryEconomy.js';
import { resolveMemoryTraining } from './game/memoryTrainingLogic.js';
import {
  applyLanternYearTimeline,
  resolveLanternTimelineChoice
} from './game/lanternTimelineLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import { validateQuarryContent } from './game/quarryValidation.js';
import {
  defaultSettlement,
  deleteSettlement,
  getActiveSlot,
  listSaveSlots,
  loadSettlement,
  normalizeSettlement,
  createSurvivor,
  createGearInstance,
  saveSettlement,
  setActiveSlot
} from './game/saveLogic.js';
import {
  addRecoveryHistory,
  createEmptyRuntime,
  getInvalidCombatSurvivorIds,
  validateGameState
} from './game/gameStateRecovery.js';
import { consumeRecoveryBootScreen } from './game/recoveryActions.js';
import { resolveHuntRetreat } from './game/retreatLogic.js';
import { addPersonalCard, learnFightingArt } from './game/survivorProgression.js';
import CombatScreen from './screens/CombatScreen.jsx';
import PartyCombatScreen from './screens/PartyCombatScreen.jsx';
import CreateSettlementScreen from './screens/CreateSettlementScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import LootRewardScreen from './screens/LootRewardScreen.jsx';
import InnovationDrawScreen from './screens/InnovationDrawScreen.jsx';
import InnovationPaymentScreen from './screens/InnovationPaymentScreen.jsx';
import LoadoutScreen from './screens/LoadoutScreen.jsx';
import MonsterDiscoveryScreen from './screens/MonsterDiscoveryScreen.jsx';
import NemesisLorePopup from './screens/NemesisLorePopup.jsx';
import NemesisPreparationScreen from './screens/NemesisPreparationScreen.jsx';
import NemesisResultScreen from './screens/NemesisResultScreen.jsx';
import NemesisWarningScreen from './screens/NemesisWarningScreen.jsx';
import QuarrySelectionScreen from './screens/QuarrySelectionScreen.jsx';
import PartySelectionScreen from './screens/PartySelectionScreen.jsx';
import QuarryDiscoveryLoreScreen from './screens/QuarryDiscoveryLoreScreen.jsx';
import RestStopScreen from './screens/RestStopScreen.jsx';
import RetreatResultScreen from './screens/RetreatResultScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';
import SurvivorProgressScreen from './screens/SurvivorProgressScreen.jsx';
import TitleScreen from './screens/TitleScreen.jsx';
import PrincipleChoiceScreen from './screens/PrincipleChoiceScreen.jsx';
import { chooseCampaignPrinciple } from './game/campaignPrincipleLogic.js';

function applyChildTrait(survivor, rawTraitId, recordInnate = true) {
  const traitId = normalizeChildTraitId(rawTraitId);
  const trait = childTraits[traitId];
  if (!trait) return survivor;

  const next = {
    ...survivor,
    traits: [...new Set([...(survivor.traits || []), traitId])],
    innateTraits: recordInnate
      ? [...new Set([...(survivor.innateTraits || []), traitId])]
      : survivor.innateTraits || [],
    survival: survivor.survival + (trait.mechanicalEffect.startingSurvival || 0),
    maxHp: survivor.maxHp + (trait.mechanicalEffect.maxHp || 0),
    hp: survivor.hp + (trait.mechanicalEffect.maxHp || 0),
    strength: survivor.strength + (trait.mechanicalEffect.strength || 0)
  };
  if (trait.mechanicalEffect.permanentPanic) {
    next.permanentNegativeCards = [
      ...next.permanentNegativeCards,
      { cardId: 'panic', sourceType: 'curse', reason: trait.name }
    ];
  }
  if (trait.mechanicalEffect.randomFightingArt) {
    const availableArts = generalFightingArts.filter(art =>
      !['hardened', 'scarTissue'].includes(art.id)
    );
    if (availableArts.length) {
      return learnFightingArt(
        next,
        availableArts[Math.floor(Math.random() * availableArts.length)].id,
        `${trait.name} birth trait`
      );
    }
  }
  return next;
}

function applyNewSurvivorSettlementBonuses(survivor, settlement) {
  const next = { ...survivor };
  if (settlement.builtMemoryInnovations.includes('sharedWarnings')) next.survival += 1;
  if (settlement.innovationDeckState.builtInnovationIds.includes('oralTradition')) {
    next.survival += 1;
  }
  if (settlement.innovationDeckState.builtInnovationIds.includes('cooking')) {
    next.maxHp += 1;
    next.hp += 1;
  }
  next.survival = Math.min(next.maxSurvival, next.survival);
  return next;
}

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];
const DEADLY_EVENT_IDS = new Set(['strangeCarcass', 'blackRain', 'woundedBeast', 'lanternStorm']);

function getHuntAgeProgression(survivor, settlement) {
  const hasGrace = settlement.innovationDeckState?.builtInnovationIds?.includes('timeKeeping')
    && !survivor.ageingGraceUsed;
  if (!hasGrace) {
    return { completedRuns: (survivor.completedRuns || 0) + 1 };
  }
  return {
    completedRuns: survivor.completedRuns || 0,
    ageingGraceUsed: true,
    ageingHistory: [
      ...(survivor.ageingHistory || []),
      {
        type: 'hunt-age-prevented',
        source: 'timeKeeping',
        lanternYear: settlement.lanternYear
      }
    ]
  };
}

validateQuarryContent();

function createHuntResultId() {
  return `hunt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function InvalidPhaseScreen({ reason, onRecover }) {
  return (
    <section className="placeholder-screen">
      <p className="eyebrow">Recovery</p>
      <h2>Something went wrong while loading this screen.</h2>
      <p className="muted-text">Recovery reason: {reason}</p>
      <button type="button" onClick={() => onRecover(reason, { resetHunt: true })}>
        Return to Settlement
      </button>
    </section>
  );
}

function chooseHuntEvent(level) {
  const deadlyChance = level === 3 ? 0.35 : level === 2 ? 0.2 : 0.05;
  const useExpansion = level >= 2 || Math.random() < 0.2;
  
  let pool = events.filter(e => e.section === 'core' || !e.section);
  if (useExpansion) {
    pool = events.filter(e => e.section === 'core' || e.section === 'expansion' || !e.section);
  }
  
  // High level hunts can also draw from legacyOptional
  if (level === 3) {
    pool = events;
  }

  // Simple shuffle/select
  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected;
}

function createScaledMonster(quarryId, level, type, partySize = 1) {
  const quarry = quarries[quarryId] || quarryList[0];
  const behaviour = getCreatureBehaviour(quarry.id);
  const scaling = behaviour?.levelScaling?.[level] || { hp: 1, damage: 0, dangerousWeight: 0 };
  const tierScaling = quarry.tierScaling || { hp: 1, damage: 0, aggression: 0 };
  const nodeMultiplier = type === 'boss' ? 1.5 : type === 'elite' ? 1.25 : 1;
  const encounterDamageBonus = type === 'boss'
    ? (level >= 2 ? 3 : 2)
    : type === 'elite'
      ? (level >= 2 ? 2 : 1)
      : 0;
  const damageBonus = encounterDamageBonus + (scaling.damage || 0) + (tierScaling.damage || 0);
  const baseHp = 30 + Math.min(18, quarry.designTags.length * 3);
  const hp = Math.round(baseHp * nodeMultiplier * scaling.hp * (tierScaling.hp || 1) * partySize);
  const scaleEffect = effect => (
    ['dealDamage', 'multiHitDamage'].includes(effect.type)
      ? { ...effect, amount: effect.amount + damageBonus }
      : { ...effect }
  );
  const describeEffect = effect => {
    const descriptions = {
      dealDamage: `deals ${effect.amount} damage`,
      gainBlock: `gains ${effect.amount} block`,
      multiHitDamage: `deals ${effect.amount} damage ${effect.hits} times`,
      applyBleed: `applies ${effect.amount} Bleed`,
      applyMarked: 'applies Marked',
      addPanic: `adds ${effect.amount} Panic`,
      reducePlayerBlock: `removes ${effect.amount} player block`,
      healMonster: `heals ${effect.amount} HP`,
      nextAttackBonus: `adds ${effect.amount} to its next attack`,
      playerEnergyPenaltyNextTurn: `removes ${effect.amount} energy next turn`,
      discardRandomCard: `discards ${effect.amount} random card`,
      monsterEnrage: `gains ${effect.amount} Enrage`,
      bonusIfPlayerNoBlock: `deals +${effect.amount} if the survivor has no block`
    };
    return descriptions[effect.type] || effect.type;
  };
  const scaledIntents = (behaviour?.intents || [])
    .filter(intent => (intent.levelMin || 1) <= level)
    .filter(intent => !intent.tierMin || quarry.tierRank >= intent.tierMin)
    .flatMap(intent => {
    const effects = intent.effects.map(scaleEffect);
    const partyAggressionBonus = partySize <= 1 ? 0 : (partySize - 1) * 0.05;
    const copies = Math.max(
      1,
      (intent.aggressionWeight || intent.weight || 1) +
      (intent.levelWeights?.[level] || 0) +
      (intent.tags?.includes('dangerous') ? tierScaling.aggression || 0 : 0) +
      (intent.tags?.some(tag => ['heavy', 'precision', 'punishment'].includes(tag))
        ? scaling.dangerousWeight || 0
        : 0)
    );
    const targetingRule = getIntentTargetRule(
      { ...intent, effects },
      { quarryId: quarry.id, baseId: quarry.id }
    );
    const scaledIntent = {
      ...intent,
      effects,
      targetingRule,
      partyAggressionBonus,
      revealedText: `${intent.name}: ${effects.map(describeEffect).join('; ')}.`
    };
    const weightedCopies = copies + (Math.random() < partyAggressionBonus ? 1 : 0);
    return Array.from({ length: weightedCopies }, (_, copyIndex) => ({
      ...scaledIntent,
      id: `${scaledIntent.id}-${copyIndex}`
    }));
  }).sort(() => Math.random() - 0.5);

  return {
    id: `${quarry.id}-${level}-${type}`,
    baseId: quarry.id,
    quarryId,
    name: quarry.displayName,
    level,
    tier: quarry.tier,
    tierRank: quarry.tierRank,
    passiveTell: behaviour?.passiveTell || '',
    passiveText: behaviour?.passiveRevealedText || '',
    passiveRules: behaviour?.passiveRules || [],
    hp,
    maxHp: hp,
    block: 0,
    weakPoints: createMonsterWeakPoints(quarry.id, level),
    intents: scaledIntents
  };
}

function createNemesisMonster(nemesisId) {
  const encounter = nemesisEncounters[nemesisId];
  const behaviour = getNemesisBehaviour(nemesisId);
  if (!encounter || !behaviour) return null;
  const hpByNemesis = {
    cruelCollector: 48,
    maskedJudge: 55,
    wanderingKiller: 50,
    shadowStalker: 62,
    mirrorTyrant: 72
  };
  const hp = hpByNemesis[nemesisId] || 50;
  return {
    id: `nemesis-${nemesisId}`,
    baseId: nemesisId,
    quarryId: nemesisId,
    name: encounter.displayName,
    passiveTell: behaviour.passiveTell,
    passiveText: behaviour.passiveRevealedText,
    passiveRules: behaviour.passiveRules,
    hp,
    maxHp: hp,
    block: 0,
    intents: behaviour.intents
  };
}

function removeRandomResources(stash, amount) {
  const next = { ...stash };
  const available = Object.keys(next).flatMap(id => Array(next[id] || 0).fill(id));
  const removed = [];
  for (let count = 0; count < amount && available.length; count += 1) {
    const index = Math.floor(Math.random() * available.length);
    const [id] = available.splice(index, 1);
    next[id] = Math.max(0, (next[id] || 0) - 1);
    removed.push(resourceData[id]?.name || id);
  }
  return { stash: next, removed };
}

function getLoadoutBonus(settlement, monsterId, quarryId) {
  const activeSurvivor = settlement.survivors.find(survivor => survivor.id === settlement.activeSurvivorId);
  const equipped = (activeSurvivor?.boundGear || [])
    .map(gear => equipment[gear.equipmentId])
    .filter(Boolean);
  const bonus = {
    extraMaxHp: 0,
    startingBlock: 0,
    strength: 0,
    extraFirstTurnDraw: 0,
    startingSurvival: 0,
    counterDamageBonus: 0,
    monsterStartsWounded: 0
  };
  const affinityTotals = calculateAffinityTotals(activeSurvivor?.boundGear || []);
  const affinityBonus = getAffinityCombatBonus(affinityTotals);
  bonus.affinityTotals = affinityTotals;
  bonus.affinityBonus = affinityBonus;
  bonus.startingBlock += affinityBonus.startingBlock;
  bonus.afterCombatHealing = affinityBonus.afterCombatHealing;
  bonus.purpleHarvestBonus = getPurpleHarvestBonus(affinityTotals);

  equipped.forEach(item => {
    if (item.id === 'hideWraps') bonus.startingBlock += 3;
    if (item.id === 'maneCloak') bonus.startingBlock += 2;
    if (item.id === 'monsterGrease') bonus.startingBlock += 2;
    if (item.id === 'rawhideVest') bonus.extraMaxHp += 2;
    if (item.id === 'huntingHideWrap') bonus.extraMaxHp += 1;
    if (item.id === 'clawCharm' || item.id === 'bloodPaint') bonus.strength += 1;
    if (item.id === 'catEyeCharm') bonus.extraFirstTurnDraw += 1;
    if (item.id === 'predatorMask') bonus.startingSurvival += 1;
    if (item.id === 'pouncingGreaves') bonus.counterDamageBonus += 1;
    if (item.id === 'whiteClawTrap') bonus.monsterStartsWounded += 2;
  });

  if (
    settlement.builtInnovations.includes('monsterArchive') &&
    (settlement.monsterKnowledge?.[monsterId] || 0) > 0
  ) {
    bonus.strength += 1;
  }
  if (settlement.builtInnovations.includes('monsterArchive') &&
    activeSurvivor?.fightingArts.includes(getMonsterBaneId(quarryId))) {
    bonus.strength += 1;
  }

  return bonus;
}

export default function App() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      validateOverhaulData();
    }
  }, []);
  const initialSlot = getActiveSlot();
  const initialSettlement = loadSettlement(initialSlot);
  const recoveryBootScreen = consumeRecoveryBootScreen();
  const [screen, setScreen] = useState(recoveryBootScreen || 'title');
  const [activeSlot, setActiveSlotState] = useState(initialSlot);
  const [settlement, setSettlement] = useState(initialSettlement);
  const [createSlot, setCreateSlot] = useState(null);
  const [slotVersion, setSlotVersion] = useState(0);
  const [selectedQuarry, setSelectedQuarry] = useState('paleHuntLion');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [runMap, setRunMap] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [runResources, setRunResources] = useState([]);
  const [resourceReward, setResourceReward] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [runSurvivor, setRunSurvivor] = useState(null);
  const [runParty, setRunParty] = useState([]);
  const [selectedPartyIds, setSelectedPartyIds] = useState([]);
  const [loadoutPartyIndex, setLoadoutPartyIndex] = useState(0);
  const [partyCombatBonuses, setPartyCombatBonuses] = useState([]);
  const [pendingPartyEffects, setPendingPartyEffects] = useState([]);
  const [survivorRewardQueue, setSurvivorRewardQueue] = useState([]);
  const [runDeck, setRunDeck] = useState([]);
  const [runEquippedGear, setRunEquippedGear] = useState([]);
  const [runModifiers, setRunModifiers] = useState({});
  const [runBonus, setRunBonus] = useState({});
  const [combatBonus, setCombatBonus] = useState({});
  const [runSummary, setRunSummary] = useState(null);
  const [lootChoices, setLootChoices] = useState([]);
  const [pendingCombatVictory, setPendingCombatVictory] = useState(null);
  const [bossGenericRewards, setBossGenericRewards] = useState([]);
  const [progressOfferBane, setProgressOfferBane] = useState(false);
  const [innovationDraw, setInnovationDraw] = useState([]);
  const [innovationPayment, setInnovationPayment] = useState(null);
  const [appliedInnovationId, setAppliedInnovationId] = useState(null);
  const [runEventWarningUsed, setRunEventWarningUsed] = useState(false);
  const [runConditionGains, setRunConditionGains] = useState({
    injuries: [],
    scars: [],
    disorders: []
  });
  const [nemesisResult, setNemesisResult] = useState(null);
  const [pendingQuarryDiscoveryId, setPendingQuarryDiscoveryId] = useState(null);
  const [currentHuntId, setCurrentHuntId] = useState(null);
  const [retreatResult, setRetreatResult] = useState(null);
  const [restResult, setRestResult] = useState(null);

  const getRuntimeSnapshot = (screenOverride = screen) => ({
    screen: screenOverride,
    selectedQuarry,
    selectedLevel,
    runMap,
    currentNode,
    runResources,
    resourceReward,
    currentEvent,
    runSurvivor,
    runParty,
    selectedPartyIds,
    loadoutPartyIndex,
    partyCombatBonuses,
    pendingPartyEffects,
    survivorRewardQueue,
    runDeck,
    runEquippedGear,
    runModifiers,
    runBonus,
    combatBonus,
    runSummary,
    lootChoices,
    pendingCombatVictory,
    bossGenericRewards,
    progressOfferBane,
    innovationDraw,
    innovationPayment,
    appliedInnovationId,
    runEventWarningUsed,
    runConditionGains,
    nemesisResult,
    pendingQuarryDiscoveryId,
    currentHuntId,
    retreatResult,
    restResult
  });

  const applyRuntime = runtime => {
    const safe = { ...createEmptyRuntime(), ...(runtime || {}) };
    setSelectedQuarry(safe.selectedQuarry);
    setSelectedLevel(safe.selectedLevel);
    setRunMap(safe.runMap);
    setCurrentNode(safe.currentNode);
    setRunResources(safe.runResources);
    setResourceReward(safe.resourceReward);
    setCurrentEvent(safe.currentEvent);
    setRunSurvivor(safe.runSurvivor);
    setRunParty(safe.runParty);
    setSelectedPartyIds(safe.selectedPartyIds);
    setLoadoutPartyIndex(safe.loadoutPartyIndex);
    setPartyCombatBonuses(safe.partyCombatBonuses);
    setPendingPartyEffects(safe.pendingPartyEffects);
    setSurvivorRewardQueue(safe.survivorRewardQueue);
    setRunDeck(safe.runDeck);
    setRunEquippedGear(safe.runEquippedGear);
    setRunModifiers(safe.runModifiers);
    setRunBonus(safe.runBonus);
    setCombatBonus(safe.combatBonus);
    setRunSummary(safe.runSummary);
    setLootChoices(safe.lootChoices);
    setPendingCombatVictory(safe.pendingCombatVictory);
    setBossGenericRewards(safe.bossGenericRewards);
    setProgressOfferBane(safe.progressOfferBane);
    setInnovationDraw(safe.innovationDraw);
    setInnovationPayment(safe.innovationPayment);
    setAppliedInnovationId(safe.appliedInnovationId);
    setRunEventWarningUsed(safe.runEventWarningUsed);
    setRunConditionGains(safe.runConditionGains);
    setNemesisResult(safe.nemesisResult);
    setPendingQuarryDiscoveryId(safe.pendingQuarryDiscoveryId);
    setCurrentHuntId(safe.currentHuntId);
    setRetreatResult(safe.retreatResult);
    setRestResult(safe.restResult);
    setScreen(safe.screen);
  };

  const returnToSettlementSafely = (reason = null, options = {}) => {
    const emptyRuntime = createEmptyRuntime('settlement');
    setSettlement(current => {
      if (!current) return current;
      const next = reason
        ? addRecoveryHistory(current, reason, options.resetHunt)
        : current;
      const normalized = normalizeSettlement({
        ...next,
        appRuntime: emptyRuntime,
        recoveryReason: reason
      });
      saveSettlement(normalized, activeSlot);
      return normalized;
    });
    applyRuntime(emptyRuntime);
  };

  useEffect(() => {
    if (!settlement || ['title', 'createSettlement'].includes(screen)) return;
    const runtime = getRuntimeSnapshot();
    saveSettlement({ ...settlement, appRuntime: runtime }, activeSlot);
  }, [
    activeSlot,
    screen,
    settlement,
    selectedQuarry,
    selectedLevel,
    runMap,
    currentNode,
    runResources,
    resourceReward,
    currentEvent,
    runSurvivor,
    runParty,
    selectedPartyIds,
    loadoutPartyIndex,
    partyCombatBonuses,
    pendingPartyEffects,
    survivorRewardQueue,
    runDeck,
    runEquippedGear,
    runModifiers,
    runBonus,
    combatBonus,
    runSummary,
    lootChoices,
    pendingCombatVictory,
    bossGenericRewards,
    progressOfferBane,
    innovationDraw,
    innovationPayment,
    appliedInnovationId,
    runEventWarningUsed,
    runConditionGains,
    nemesisResult,
    pendingQuarryDiscoveryId,
    currentHuntId,
    retreatResult
  ]);

  useEffect(() => {
    if (!settlement || ['title', 'createSettlement'].includes(screen)) return;
    const validation = validateGameState({
      activeSlot,
      settlement,
      runtime: getRuntimeSnapshot()
    });
    if (!validation.valid) {
      returnToSettlementSafely(validation.reason, { resetHunt: true });
    }
  }, [screen]);

  useEffect(() => {
    if (!settlement?.pendingNemesisEncounter) return;
    if (screen === 'runSummary' && runSummary?.outcome === 'death') return;
    const forcedScreens = new Set([
      'settlement', 'survivorProgress', 'monsterDiscovery', 'runSummary'
    ]);
    if (forcedScreens.has(screen)) {
      setScreen(settlement.pendingNemesisEncounter.stage === 'lore'
        ? 'nemesisLore'
        : settlement.pendingNemesisEncounter.stage === 'warning'
          ? 'nemesisWarning'
          : 'nemesisPreparation');
    }
  }, [settlement?.pendingNemesisEncounter, screen, runSummary?.outcome]);

  const updateSettlement = updater => {
    setSettlement(current => {
      if (!current) return current;
      const next = normalizeSettlement(typeof updater === 'function' ? updater(current) : updater);
      saveSettlement(next, activeSlot);
      return next;
    });
  };

  const showTitle = () => {
    setRunMap([]);
    setCurrentNode(null);
    setRunSummary(null);
    setScreen('title');
    setSlotVersion(version => version + 1);
  };

  const handleLoad = slotId => {
    const loaded = loadSettlement(slotId);
    if (!loaded) return;
    setActiveSlot(slotId);
    setActiveSlotState(slotId);
    setSettlement(loaded);
    const runtime = loaded.appRuntime || createEmptyRuntime('settlement');
    const validation = validateGameState({
      activeSlot: slotId,
      settlement: loaded,
      runtime
    });
    if (validation.valid) {
      applyRuntime(runtime);
    } else {
      const invalidCombatSurvivorIds = getInvalidCombatSurvivorIds(runtime);
      const invalidCombatSurvivors = loaded.survivors.filter(survivor =>
        invalidCombatSurvivorIds.includes(survivor.id) && survivor.alive !== false
      );
      const recovered = normalizeSettlement({
        ...addRecoveryHistory(loaded, validation.reason, true),
        population: Math.max(0, loaded.population - invalidCombatSurvivors.length),
        deadSurvivors: (loaded.deadSurvivors || 0) + invalidCombatSurvivors.length,
        survivors: loaded.survivors.map(survivor =>
          invalidCombatSurvivorIds.includes(survivor.id)
            ? { ...survivor, hp: 0, alive: false, isAlive: false, boundGear: [] }
            : survivor
        ),
        graveHistory: [
          ...invalidCombatSurvivors.map(survivor => ({
            survivorName: survivor.name,
            survivorId: survivor.id,
            killedBy: 'Unresolved lethal combat damage',
            lanternYear: loaded.lanternYear,
            gearLostCount: survivor.boundGear?.length || 0,
            gearLostNames: (survivor.boundGear || []).map(gear =>
              getEquipmentDisplayName(gear.equipmentId)),
            timestamp: new Date().toISOString()
          })),
          ...(loaded.graveHistory || [])
        ],
        appRuntime: createEmptyRuntime('settlement'),
        recoveryReason: validation.reason
      });
      saveSettlement(recovered, slotId);
      setSettlement(recovered);
      applyRuntime(createEmptyRuntime('settlement'));
    }
  };

  const handleCreate = data => {
    const next = normalizeSettlement({ ...defaultSettlement, ...data });
    setActiveSlot(createSlot);
    saveSettlement(next, createSlot);
    setActiveSlotState(createSlot);
    setSettlement(next);
    setCreateSlot(null);
    setSelectedQuarry('paleHuntLion');
    setSelectedLevel(1);
    setSlotVersion(version => version + 1);
    setScreen('settlement');
  };

  const handleDelete = slotId => {
    if (!window.confirm(`Delete Save Slot ${slotId}? This cannot be undone.`)) return;
    deleteSettlement(slotId);
    if (Number(slotId) === Number(activeSlot)) {
      setSettlement(null);
      applyRuntime(createEmptyRuntime('title'));
      setActiveSlotState(getActiveSlot());
    }
    setCreateSlot(null);
    setSlotVersion(version => version + 1);
    setScreen('title');
  };

  const getRunProgress = (map = runMap, activeNode = currentNode) => {
    const completedNodes = map.flat().filter(node => node.completed).length;
    const reachedRows = [
      ...map.flat().filter(node => node.completed).map(node => node.row + 1),
      activeNode ? activeNode.row + 1 : 0
    ];
    return { nodesCompleted: completedNodes, rowReached: Math.max(0, ...reachedRows) };
  };

  const recordConditionGain = (type, conditionId) => {
    if (!conditionId) return;
    setRunConditionGains(current => ({
      ...current,
      [type]: current[type].includes(conditionId)
        ? current[type]
        : [...current[type], conditionId]
    }));
  };

  const startRun = () => {
    if (!settlement || settlement.population <= 0) return;
    const selectedParty = selectedPartyIds
      .slice(0, settlement.maxHuntPartySize)
      .map(id => settlement.survivors.find(survivor => survivor.id === id && survivor.alive !== false))
      .filter(Boolean);
    if (!selectedParty.length) return;
    const activeSurvivor = selectedParty[0];
    const nextRunBonus = settlement.nextRunBonus || {};
    const startingResources = [];
    const activeRunBonus = {};
    const huntParty = selectedParty.map(survivor => ({
      ...survivor,
      hp: survivor.injuries?.includes('deepCut') ? Math.max(0, survivor.hp - 1) : survivor.hp,
      survival: Math.min(
        survivor.maxSurvival || 3,
        (survivor.survival || 0) + (survivor.nextHuntSurvivalBonus || 0)
      ),
      nextHuntSurvivalBonus: 0
    }));
    if (huntParty.some(survivor => survivor.hp <= 0)) {
      handleCombatDefeat({
        survivors: huntParty,
        killedBy: 'Deep Cut',
        killedById: 'injury:deepCut'
      });
      return;
    }
    const partyDecks = huntParty.map(survivor => {
      const equippedGear = (survivor.boundGear || []).filter(gear => equipment[gear.equipmentId]);
      const deck = buildRunDeck({ survivor, equippedGear });
      if (equippedGear.some(item => item.equipmentId === 'predatorMask') && !(survivor.scars || []).length) {
        deck.push(...getCardsFromIds(['panic'], 'Predator Mask'));
      }
      if (survivor.disorders?.includes('nightTerrors')) {
        deck.push(...getCardsFromIds(['panic'], 'Night Terrors'));
      }
      return deck;
    });
    const equippedGear = (activeSurvivor.boundGear || []).filter(gear => equipment[gear.equipmentId]);
    const huntSurvivor = huntParty[0];
    const nextRunDeck = partyDecks[0];

    if (nextRunBonus.randomMonsterPart) {
      startingResources.push(RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)]);
    }
    if (nextRunBonus.extraMaxHp) activeRunBonus.extraMaxHp = nextRunBonus.extraMaxHp;
    if (nextRunBonus.firstCombatStrength) activeRunBonus.firstCombatStrength = nextRunBonus.firstCombatStrength;
    if (nextRunBonus.extraFirstTurnDraw) activeRunBonus.extraFirstTurnDraw = nextRunBonus.extraFirstTurnDraw;
    if (nextRunBonus.startingBlock) activeRunBonus.firstCombatBlock = nextRunBonus.startingBlock;
    if (nextRunBonus.startingSurvival) activeRunBonus.startingSurvival = nextRunBonus.startingSurvival;
    if (nextRunBonus.nextCombatMonsterBonusHp) {
      activeRunBonus.nextCombatMonsterBonusHp = nextRunBonus.nextCombatMonsterBonusHp;
    }
    activeRunBonus.retreatMonsterEnrage =
      (settlement.temporarySettlementModifiers?.followedBySomething || 0) +
      (settlement.quarryRetreatModifiers?.[selectedQuarry]?.aggression || 0);
    if (activeSurvivor.traits?.includes('steady')) activeRunBonus.firstCombatBlock = 1;
    if (activeSurvivor.traits?.includes('bold')) activeRunBonus.firstHuntAttackBonus = 1;
    if (
      settlement.builtMemoryInnovations.includes('huntSongs') &&
      getHighestDefeatedQuarryLevel(settlement, selectedQuarry) > 0
    ) {
      huntSurvivor.maxSurvival = (huntSurvivor.maxSurvival || 3) + 1;
      huntSurvivor.survival = Math.min(
        huntSurvivor.maxSurvival,
        (huntSurvivor.survival || 0) + 1
      );
    }

    updateSettlement(current => ({
      ...current,
      survivors: current.survivors.map(survivor => selectedPartyIds.includes(survivor.id)
        ? { ...survivor, nextHuntSurvivalBonus: 0 }
        : survivor),
      temporarySettlementModifiers: {
        ...(current.temporarySettlementModifiers || {}),
        followedBySomething: 0
      },
      quarryRetreatModifiers: {
        ...(current.quarryRetreatModifiers || {}),
        [selectedQuarry]: {
          ...(current.quarryRetreatModifiers?.[selectedQuarry] || {}),
          aggression: 0
        }
      },
      nextRunBonus: {
        ...current.nextRunBonus,
        randomMonsterPart: false,
        extraMaxHp: 0,
        firstCombatStrength: 0,
        extraFirstTurnDraw: 0,
        startingBlock: 0,
        startingSurvival: 0,
        nextCombatMonsterBonusHp: 0
      }
    }));
    setRunMap(generateMap(selectedLevel));
    setCurrentHuntId(createHuntResultId());
    setRetreatResult(null);
    setCurrentNode(null);
    setRunResources(startingResources);
    setRunSurvivor(huntSurvivor);
    setRunParty(huntParty);
    setRunEquippedGear(equippedGear.map(item => item.equipmentId));
    setRunDeck(nextRunDeck);
    setPartyCombatBonuses(huntParty.map((survivor, index) => ({
      survivor,
      runDeck: partyDecks[index],
      huntDeckConditionsApplied: true
    })));
    setPendingPartyEffects([]);
    setRunModifiers({});
    setResourceReward(null);
    setRunBonus(activeRunBonus);
    setCombatBonus({});
    setRunSummary(null);
    setRunConditionGains({ injuries: [], scars: [], disorders: [] });
    setRunEventWarningUsed(false);
    setScreen('map');
  };

  const handleRetreat = () => {
    const huntResultId = currentHuntId || createHuntResultId();
    const resolved = resolveHuntRetreat({
      settlement,
      party: runParty,
      gatheredResources: runResources,
      quarryId: selectedQuarry,
      quarryLevel: selectedLevel,
      huntResultId
    });
    setCurrentHuntId(huntResultId);
    setSettlement(resolved.settlement);
    saveSettlement({
      ...resolved.settlement,
      appRuntime: {
        ...getRuntimeSnapshot('retreatResult'),
        currentHuntId: huntResultId,
        retreatResult: resolved.result
      }
    }, activeSlot);
    setRetreatResult(resolved.result);
    setPendingCombatVictory(null);
    setLootChoices([]);
    setBossGenericRewards([]);
    setCurrentNode(null);
    setScreen('retreatResult');
  };

  const finishRetreat = () => {
    setRetreatResult(null);
    setCurrentHuntId(null);
    applyRuntime(createEmptyRuntime('settlement'));
  };

  const prepareHunt = survivorId => {
    if (settlement.pendingTimelineEvent) return;
    const firstId = survivorId || settlement.activeSurvivorId ||
      settlement.survivors.find(survivor => survivor.alive !== false)?.id;
    const firstSurvivor = settlement.survivors.find(survivor => survivor.id === firstId);
    if (!firstId || (firstSurvivor?.unavailableHunts || 0) > 0) return;
    setSelectedPartyIds([firstId]);
    setLoadoutPartyIndex(0);
    setScreen('partySelection');
  };

  const selectNode = node => {
    if (!node.available || node.completed) return;
    setCurrentNode(node);
    const completedCount = runMap.flat().filter(item => item.completed).length;
    const livingParty = runParty.filter(survivor => survivor.hp > 0);
    const nodeSurvivor = livingParty[completedCount % Math.max(1, livingParty.length)];
    if (nodeSurvivor && !['fight', 'elite', 'boss'].includes(node.type)) {
      setRunSurvivor(nodeSurvivor);
      const equipped = (nodeSurvivor.boundGear || []).filter(gear => equipment[gear.equipmentId]);
      setRunDeck(buildRunDeck({ survivor: nodeSurvivor, equippedGear: equipped }));
    }

    if (['fight', 'elite', 'boss'].includes(node.type)) {
      const monsterId = quarries[selectedQuarry]?.monsterId;
      const partyBonuses = runParty.filter(survivor => survivor.hp > 0).map((survivor, index) => {
        const partySettlement = { ...settlement, activeSurvivorId: survivor.id };
        const loadoutBonus = getLoadoutBonus(partySettlement, monsterId, selectedQuarry);
        return {
          ...partyCombatBonuses.find(bonus => bonus.survivor.id === survivor.id),
          ...loadoutBonus,
          survivor,
          runDeck: partyCombatBonuses.find(bonus => bonus.survivor.id === survivor.id)?.runDeck,
          startingBlock:
            (loadoutBonus.startingBlock || 0) +
            (runModifiers.nextCombatStartBlock || 0) +
            (runBonus.firstCombatBlock || 0),
          firstTurnEnergyPenalty: runModifiers.nextCombatEnergyPenalty || 0,
          monsterBaneDamageBonus:
            settlement.builtInnovations.includes('monsterArchive') &&
            survivor.fightingArts?.includes(getMonsterBaneId(selectedQuarry)) ? 1 : 0,
          hasMonsterBane: survivor.fightingArts?.includes(getMonsterBaneId(selectedQuarry)),
          huntDeckConditionsApplied: true
        };
      });
      setPartyCombatBonuses(partyBonuses);
      const loadoutBonus = getLoadoutBonus(settlement, monsterId, selectedQuarry);
      const firstCombatStrength = runBonus.firstCombatStrength || 0;
      setCombatBonus({
        ...loadoutBonus,
        extraMaxHp: (loadoutBonus.extraMaxHp || 0) + (runBonus.extraMaxHp || 0),
        firstCombatStrength: firstCombatStrength + (loadoutBonus.strength || 0),
        extraFirstTurnDraw: (loadoutBonus.extraFirstTurnDraw || 0) + (runBonus.extraFirstTurnDraw || 0),
        startingBlock:
          (loadoutBonus.startingBlock || 0) +
          (runModifiers.nextCombatStartBlock || 0) +
          (runBonus.firstCombatBlock || 0),
        firstTurnEnergyPenalty: runModifiers.nextCombatEnergyPenalty || 0,
        monsterBonusHp:
          (runModifiers.nextCombatMonsterBonusHp || 0) +
          (runBonus.nextCombatMonsterBonusHp || 0),
        monsterStartsWounded:
          (runModifiers.monsterStartsWounded || 0) +
          (loadoutBonus.monsterStartsWounded || 0),
        counterDamageBonus: loadoutBonus.counterDamageBonus || 0,
        monsterEnrage:
          (runModifiers.monsterEnrage || 0) +
          (runBonus.retreatMonsterEnrage || 0),
        firstAttackBonus:
          (runModifiers.firstAttackBonus || 0) +
          (runBonus.firstHuntAttackBonus || 0),
        monsterBaneDamageBonus:
          settlement.builtInnovations.includes('monsterArchive') &&
          runSurvivor?.fightingArts?.includes(getMonsterBaneId(selectedQuarry))
            ? 1
            : 0,
        survivor: (runBonus.startingSurvival || loadoutBonus.startingSurvival)
          ? {
            ...runSurvivor,
            survival: Math.min(
              runSurvivor.maxSurvival || 3,
              (runSurvivor.survival || 0) +
                (runBonus.startingSurvival || 0) +
                (loadoutBonus.startingSurvival || 0)
            )
          }
          : runSurvivor,
        runDeck,
        huntDeckConditionsApplied: true
      });
      setRunModifiers(current => current.nextEventWarning
        ? { nextEventWarning: true }
        : {});
      setRunBonus(current => ({
        ...current,
        firstCombatBlock: 0,
        firstHuntAttackBonus: 0,
        extraFirstTurnDraw: 0,
        startingSurvival: 0,
        nextCombatMonsterBonusHp: 0
      }));
      if (firstCombatStrength) setRunBonus(current => ({ ...current, firstCombatStrength: 0 }));
      setScreen('combat');
      return;
    }

    if (node.type === 'resource') {
      const rewardId = genericResourceIds[Math.floor(Math.random() * genericResourceIds.length)];
      setResourceReward(resourceData[rewardId]);
      setScreen('resource');
      return;
    }
    if (node.type === 'event') {
      if (nodeSurvivor?.disorders?.includes('paranoia')) {
        setRunDeck(current => [...current, cards.panic]);
      }
      setCurrentEvent(chooseHuntEvent(selectedLevel));
      setScreen('event');
      return;
    }
    if (node.type === 'rest') {
      setScreen('rest');
      return;
    }
  };

  const completeCurrentNode = () => {
    if (!currentNode) return;
    setRunMap(map => completeMapNode(map, currentNode.id));
    setCurrentNode(null);
    setResourceReward(null);
    setCurrentEvent(null);
    setScreen('map');
  };

  const completeResourceNode = () => {
    if (resourceReward) setRunResources(items => [...items, resourceReward.id]);
    completeCurrentNode();
  };

  const handleCombatVictory = combatResult => {
    if (combatResult?.survivors) {
      const survivorsAfterCombat = combatResult.survivors.map(survivor => ({
        ...survivor,
        kills: (survivor.kills || 0) + 1
      }));
      const fallen = survivorsAfterCombat.filter(survivor => survivor.hp <= 0);
      const living = survivorsAfterCombat.filter(survivor => survivor.hp > 0);
      const brokenWeakPoints = combatResult.brokenWeakPoints || [];
      const harvestResults = getBrokenWeakPointRewards(brokenWeakPoints);
      if (fallen.length) {
        updateSettlement(current => {
          const deathSettlement = queueDeathResolutions(
            current,
            fallen.map(survivor => createDeathResolution(survivor, {
              cause: combatResult.monster?.name || quarries[selectedQuarry].name,
              huntId: currentHuntId,
              lanternYear: current.lanternYear
            }))
          );
          return {
          ...deathSettlement,
          population: Math.max(0, current.population - fallen.length),
          deadSurvivors: current.deadSurvivors + fallen.length,
          survivors: current.survivors.map(survivor => fallen.some(item => item.id === survivor.id)
            ? { ...survivor, alive: false, hp: 0, boundGear: [] }
            : survivor),
          graveHistory: [
            ...fallen.map(survivor => ({
              survivorName: survivor.name,
              survivorId: survivor.id,
              killedBy: combatResult.monster?.name || quarries[selectedQuarry].name,
              quarryId: selectedQuarry,
              quarryLevel: selectedLevel,
              huntPartyMembers: survivorsAfterCombat.map(item => item.name),
              weaponProficiency: survivor.weaponProficiency || {},
              proficientWeaponTypes: getProficientWeaponSummary(survivor.weaponProficiency),
              supportGearCarried: (survivor.boundGear || [])
                .map(gear => equipment[gear.equipmentId])
                .filter(item => item?.supportGear)
                .map(item => item.name),
              injuries: survivor.injuries || [],
              scars: survivor.scars || [],
              disorders: survivor.disorders || [],
              woundHistory: survivor.woundHistory || [],
              finalWound: survivor.woundHistory?.at(-1) || null,
              gearLostCount: survivor.boundGear?.length || 0,
              gearLostNames: (survivor.boundGear || []).map(gear =>
                getEquipmentDisplayName(gear.equipmentId)),
              rewardsMissed: true,
              timestamp: new Date().toISOString()
            })),
            ...current.graveHistory
          ]
        };
        });
      }
      setRunParty(living);
      setRunSurvivor(living[0]);
      if (combatResult.salvageResources?.length) {
        setRunResources(items => [...items, ...combatResult.salvageResources]);
      }
      const isBoss = currentNode?.type === 'boss';
      setBossGenericRewards(isBoss ? rollTierGenericBossRewards(selectedQuarry, selectedLevel) : []);
      const purpleHarvestBonus = getPurpleHarvestBonus(calculateAffinityTotals(
        living.flatMap(survivor => survivor.boundGear || [])
      ));
      setPendingCombatVictory({
        huntResultId: createHuntResultId(),
        isBoss,
        survivors: living,
        brokenWeakPoints,
        harvestResults,
        wounds: combatResult.wounds || [],
        extraLootSelections: purpleHarvestBonus.extraSelections
      });
      setLootChoices(buildHarvestRewardOffers({
        quarryId: selectedQuarry,
        quarryLevel: selectedLevel,
        quarryLevelBonus: purpleHarvestBonus.quarryLevelBonus,
        extraOfferCount: purpleHarvestBonus.extraOfferCount,
        rarityUpgrade: purpleHarvestBonus.rarityUpgrade,
        brokenWeakPoints,
        harvestResults,
        combatWounds: combatResult.wounds || [],
        party: living,
        runModifiers,
        offerSeed: `${currentHuntId || Date.now()}:${currentNode?.id || 'combat'}:${selectedQuarry}:${selectedLevel}`
      }));
      setScreen('lootReward');
      return;
    }
    let survivorAfterCombat = {
      ...runSurvivor,
      hp: combatResult?.survivor?.hp ?? runSurvivor.hp,
      survival: combatResult?.survivor?.survival ?? runSurvivor.survival,
      boundGear: combatResult?.survivor?.boundGear ?? runSurvivor.boundGear,
      equippedGear: combatResult?.survivor?.equippedGear ?? runSurvivor.equippedGear,
      kills: (runSurvivor.kills || 0) + 1
    };
    const injuryId = rollLowHpCondition(survivorAfterCombat);
    if (injuryId) {
      survivorAfterCombat = addUniqueCondition(survivorAfterCombat, 'injuries', injuryId);
      recordConditionGain('injuries', injuryId);
    }
    const isBoss = currentNode?.type === 'boss';
    const scarId = isBoss ? rollBossScar(survivorAfterCombat, selectedQuarry) : null;
    if (scarId) {
      survivorAfterCombat = addUniqueCondition(survivorAfterCombat, 'scars', scarId);
      recordConditionGain('scars', scarId);
    }
    setRunSurvivor(survivorAfterCombat);
    if (combatResult?.salvageResources?.length) {
      setRunResources(items => [...items, ...combatResult.salvageResources]);
    }
    const genericRewards = isBoss
      ? rollTierGenericBossRewards(selectedQuarry, selectedLevel)
      : [];
    setBossGenericRewards(genericRewards);
    const purpleHarvestBonus = getPurpleHarvestBonus(calculateAffinityTotals(survivorAfterCombat.boundGear || []));
    setPendingCombatVictory({
      huntResultId: createHuntResultId(),
      isBoss,
      survivor: survivorAfterCombat,
      extraLootSelections: purpleHarvestBonus.extraSelections
    });
    setLootChoices(buildHarvestRewardOffers({
      quarryId: selectedQuarry,
      quarryLevel: selectedLevel,
      quarryLevelBonus: purpleHarvestBonus.quarryLevelBonus,
      extraOfferCount: purpleHarvestBonus.extraOfferCount,
      rarityUpgrade: purpleHarvestBonus.rarityUpgrade,
      party: [survivorAfterCombat],
      runModifiers,
      offerSeed: `${currentHuntId || Date.now()}:${currentNode?.id || 'combat'}:${selectedQuarry}:${selectedLevel}`
    }));
    setScreen('lootReward');
  };

  const finishBossVictory = (selectedResources, survivorAfterFight, huntResultId) => {
    const completedMap = completeMapNode(runMap, currentNode.id);
    const progress = getRunProgress(completedMap, currentNode);
    const monsterPartRewards = Array.isArray(selectedResources)
      ? selectedResources
      : [selectedResources].filter(Boolean);
    const allRewards = [...runResources, ...bossGenericRewards, ...monsterPartRewards];
    const activeProficiencyType = survivorAfterFight.activeProficiencyType || 'fistAndTooth';
    const quarryUnlockTriggered = !hasDefeatedQuarryLevel(
      settlement,
      selectedQuarry,
      selectedLevel
    );
    const recoveryAmount = Math.min(
      Math.ceil(survivorAfterFight.maxHp / 3),
      survivorAfterFight.maxHp - survivorAfterFight.hp
    );
    const healedSurvivorHp = survivorAfterFight.hp + recoveryAmount;
    const summary = {
      outcome: 'victory',
      survivorName: survivorAfterFight.name,
      survivorId: survivorAfterFight.id,
      quarryName: quarries[selectedQuarry].name,
      quarryLevel: selectedLevel,
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: 1,
      resources: allRewards.map(id => resourceData[id]?.name || id),
      hpBeforeHealing: survivorAfterFight.hp,
      hpAfterHealing: healedSurvivorHp,
      recoveredHp: recoveryAmount,
      injuriesGained: runConditionGains.injuries.map(id => getConditionName('injuries', id)),
      scarsGained: runConditionGains.scars.map(id => getConditionName('scars', id)),
      disordersGained: runConditionGains.disorders.map(id => getConditionName('disorders', id)),
      populationBefore: settlement.population,
      populationAfter: settlement.population,
      lanternYearBefore: settlement.lanternYear,
      lanternYearAfter: settlement.lanternYear + 1,
      quarryUnlockTriggered,
      huntResultId
    };

    setRunMap(completedMap);
    setRunResources(allRewards);
    setRunSummary(summary);
    updateSettlement(current => {
      const existingReward = current.huntRewardLedger?.[huntResultId];
      if (huntResultId && existingReward?.partsApplied) return current;
      const nextYear = (current.lanternYear || 0) + 1;
      const memorySettlement = awardHuntReturnMemories(
        current,
        [survivorAfterFight],
        huntResultId
      );
      const next = {
      ...memorySettlement,
      stash: addResources(current.stash, allRewards),
      totalRuns: (current.totalRuns || 0) + 1,
      completedHunts: (current.completedHunts || 0) + 1,
      conditionHistory: {
        ...current.conditionHistory,
        injuryGained: current.conditionHistory.injuryGained ||
          Boolean(survivorAfterFight.injuries?.length),
        disorderGained: current.conditionHistory.disorderGained ||
          Boolean(survivorAfterFight.disorders?.length)
      },
      lanternYear: nextYear,
      survivors: current.survivors.map(survivor => survivor.id === survivorAfterFight.id
        ? (() => {
          const proficiencyReward = applyWeaponProficiencyXp({
            ...survivorAfterFight,
            personalDeckAdditions: survivorAfterFight.personalDeckAdditions || []
          }, [activeProficiencyType]);
          return {
          ...survivor,
          hp: healedSurvivorHp,
          survival: survivor.survival,
          traits: survivorAfterFight.traits,
          fightingArts: survivorAfterFight.fightingArts,
          deckAdditions: [],
          personalDeckAdditions: proficiencyReward.personalDeckAdditions,
          injuries: survivorAfterFight.injuries || [],
          scars: survivorAfterFight.scars || [],
          disorders: survivorAfterFight.disorders || [],
          permanentModifiers: survivorAfterFight.permanentModifiers || {},
          weaponProficiency: proficiencyReward.weaponProficiency,
          activeProficiencyType,
          lastHuntRewardContext: {
            quarryId: selectedQuarry,
            quarryLevel: selectedLevel,
            weaponTypeUsed: activeProficiencyType,
            woundsSuffered: runConditionGains.injuries.length > 0,
            scarsGained: runConditionGains.scars.length > 0,
            supportActionsUsed: (survivorAfterFight.boundGear || []).some(gear =>
              equipment[gear.equipmentId]?.supportGear
            ),
            endedLowHp: survivorAfterFight.hp <= Math.ceil(survivorAfterFight.maxHp / 3),
            brokeWeakPoint: Boolean(survivorAfterFight.combatStats?.brokeWeakPoint),
            dealtFinalBlow: Boolean(survivorAfterFight.combatStats?.dealtFinalBlow)
          },
          kills: survivorAfterFight.kills || 0,
          ...getHuntAgeProgression(survivor, current)
          };
        })()
        : survivor.alive === false ? survivor : {
          ...survivor,
          hp: Math.min(survivor.maxHp, survivor.hp + Math.ceil(survivor.maxHp / 3))
        }),
      defeatedQuarryLevels: recordDefeatedQuarryLevel(
        current.defeatedQuarryLevels,
        selectedQuarry,
        selectedLevel
      ),
      innovationDeckState: {
        ...current.innovationDeckState,
        availableInnovationPoolIds: [
          ...new Set([
            ...current.innovationDeckState.availableInnovationPoolIds,
            ...(QUARRY_INNOVATION_POOL[selectedQuarry] || [])
          ])
        ]
      },
      settlementHistory: [
        ...current.settlementHistory,
        {
          type: 'huntResult',
          huntResultId,
          message: `${survivorAfterFight.name} returned from the hunt.`,
          timestamp: new Date().toISOString()
        }
      ],
      huntRewardLedger: {
        ...current.huntRewardLedger,
        [huntResultId]: {
          huntResultId,
          partsApplied: true,
          survivorRewardsApplied: false,
          settlementHistoryApplied: true,
          quarryUnlockApplied: quarryUnlockTriggered,
          survivorRewardIds: []
        }
      }
      };
      return applyLanternYearTimeline(next, nextYear);
    });
    const survivorHasAnyBane = Boolean(getSurvivorMonsterBaneId(survivorAfterFight));
    const partyHasMatchingBane = settlement.survivors.some(survivor =>
      survivor.alive !== false &&
      survivor.fightingArts?.includes(`monsterBane_${selectedQuarry}`)
    );
    setProgressOfferBane(shouldOfferMonsterBane(selectedLevel, {
      survivorHasAnyBane,
      partyHasMatchingBane,
      brokeWeakPoint: Boolean(survivorAfterFight.combatStats?.brokeWeakPoint),
      dealtFinalBlow: Boolean(survivorAfterFight.combatStats?.dealtFinalBlow)
    }));
    setScreen('survivorProgress');
  };

  const finishPartyBossVictory = (selectedResources, survivingParty, huntResultId) => {
    const completedMap = completeMapNode(runMap, currentNode.id);
    const progress = getRunProgress(completedMap, currentNode);
    const monsterParts = Array.isArray(selectedResources)
      ? selectedResources
      : [selectedResources].filter(Boolean);
    const allRewards = [...runResources, ...bossGenericRewards, ...monsterParts];
    const healedParty = survivingParty.map(survivor => {
      const recovery = Math.min(
        Math.ceil(survivor.maxHp / 3),
        survivor.maxHp - survivor.hp
      );
      return { ...survivor, hp: survivor.hp + recovery, recoveredHp: recovery };
    });
    const quarryUnlockTriggered = !hasDefeatedQuarryLevel(
      settlement,
      selectedQuarry,
      selectedLevel
    );
    const summary = {
      outcome: 'victory',
      survivorName: healedParty.map(survivor => survivor.name).join(', '),
      survivorIds: healedParty.map(survivor => survivor.id),
      partyMembers: healedParty.map(survivor => survivor.name),
      quarryName: quarries[selectedQuarry].name,
      quarryLevel: selectedLevel,
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: healedParty.length,
      resources: allRewards.map(id => resourceData[id]?.name || id),
      populationBefore: settlement.population,
      populationAfter: settlement.population,
      lanternYearBefore: settlement.lanternYear,
      lanternYearAfter: settlement.lanternYear + 1,
      quarryUnlockTriggered,
      huntResultId
    };

    setRunMap(completedMap);
    setRunResources(allRewards);
    setRunParty(healedParty);
    setRunSummary(summary);
    setSurvivorRewardQueue(healedParty.map(survivor => survivor.id));
    updateSettlement(current => {
      const existingReward = current.huntRewardLedger?.[huntResultId];
      if (huntResultId && existingReward?.partsApplied) return current;
      const nextYear = current.lanternYear + 1;
      const memorySettlement = awardHuntReturnMemories(current, healedParty, huntResultId);
      const next = {
        ...memorySettlement,
        stash: addResources(current.stash, allRewards),
        totalRuns: current.totalRuns + 1,
        completedHunts: current.completedHunts + 1,
        lanternYear: nextYear,
        survivors: current.survivors.map(survivor => {
          const returning = healedParty.find(item => item.id === survivor.id);
          if (!returning) return survivor;
          const activeProficiencyType = returning.activeProficiencyType || 'fistAndTooth';
          const proficiencyReward = applyWeaponProficiencyXp(returning, [activeProficiencyType]);
          return {
            ...survivor,
            ...proficiencyReward,
            alive: true,
            activeProficiencyType,
            lastHuntRewardContext: {
              quarryId: selectedQuarry,
              quarryLevel: selectedLevel,
              weaponTypeUsed: activeProficiencyType,
              woundsSuffered: Boolean(returning.woundHistory?.length),
              scarsGained: Boolean(returning.scars?.length),
              supportActionsUsed: (returning.boundGear || []).some(gear =>
                equipment[gear.equipmentId]?.supportGear
              ),
              endedLowHp: returning.hp <= Math.ceil(returning.maxHp / 3),
              brokeWeakPoint: Boolean(returning.combatStats?.brokeWeakPoint),
              dealtFinalBlow: Boolean(returning.combatStats?.dealtFinalBlow)
            },
            ...getHuntAgeProgression(survivor, current)
          };
        }),
        defeatedQuarryLevels: recordDefeatedQuarryLevel(
          current.defeatedQuarryLevels,
          selectedQuarry,
          selectedLevel
        ),
        innovationDeckState: {
          ...current.innovationDeckState,
          availableInnovationPoolIds: [
            ...new Set([
              ...current.innovationDeckState.availableInnovationPoolIds,
              ...(QUARRY_INNOVATION_POOL[selectedQuarry] || [])
            ])
          ]
        },
        settlementHistory: [
          ...current.settlementHistory,
          {
            type: 'huntResult',
            huntResultId,
            message: `${healedParty.map(survivor => survivor.name).join(', ')} returned from the hunt.`,
            timestamp: new Date().toISOString()
          }
        ],
        huntRewardLedger: {
          ...current.huntRewardLedger,
          [huntResultId]: {
            huntResultId,
            partsApplied: true,
            survivorRewardsApplied: false,
            settlementHistoryApplied: true,
            quarryUnlockApplied: quarryUnlockTriggered,
            survivorRewardIds: []
          }
        }
      };
      return applyLanternYearTimeline(next, nextYear);
    });
    const partyHasMatchingBane = healedParty.some(survivor =>
      survivor.fightingArts?.includes(`monsterBane_${selectedQuarry}`)
    );
    setProgressOfferBane(Object.fromEntries(healedParty.map(survivor => [
      survivor.id,
      shouldOfferMonsterBane(selectedLevel, {
        survivorHasAnyBane: Boolean(getSurvivorMonsterBaneId(survivor)),
        partyHasMatchingBane,
        brokeWeakPoint: Boolean(survivor.combatStats?.brokeWeakPoint),
        dealtFinalBlow: Boolean(survivor.combatStats?.dealtFinalBlow)
      })
    ])));
    setScreen('survivorProgress');
  };

  const handleCombatDefeat = (
    deathDetails,
    defeatedRunState = null,
    immediateConditionGains = { injuries: [], scars: [], disorders: [] }
  ) => {
    if (deathDetails?.survivors) {
      const fallen = deathDetails.survivors.filter(survivor => survivor.hp <= 0);
      const progress = getRunProgress();
      const summary = {
        outcome: 'death',
        survivorName: fallen.map(survivor => survivor.name).join(', '),
        partyMembers: deathDetails.survivors.map(survivor => survivor.name),
        quarryName: quarries[selectedQuarry]?.name,
        quarryLevel: selectedLevel,
        killedBy: deathDetails.killedBy,
        killedById: deathDetails.killedById,
        nodesCompleted: progress.nodesCompleted,
        rowReached: progress.rowReached,
        settlementMemoryEarned: deathDetails.survivors.filter(survivor =>
          survivor.hp > 0 && survivor.alive !== false
        ).length,
        resources: runResources.map(id => resourceData[id]?.name || id),
        populationBefore: settlement.population,
        populationAfter: Math.max(0, settlement.population - fallen.length),
        lanternYearBefore: settlement.lanternYear,
        lanternYearAfter: settlement.lanternYear + 1
      };
      setRunSummary(summary);
      updateSettlement(current => {
        const nextYear = current.lanternYear + 1;
        const returning = deathDetails.survivors.filter(survivor =>
          survivor.hp > 0 && survivor.alive !== false
        );
        const memorySettlement = awardHuntReturnMemories(current, returning, currentHuntId);
        const deathSettlement = queueDeathResolutions(
          memorySettlement,
          fallen.map(survivor => createDeathResolution(survivor, {
            cause: survivor.causeOfDeath || deathDetails.killedBy,
            huntId: currentHuntId,
            lanternYear: nextYear
          }))
        );
        const next = {
          ...deathSettlement,
          population: Math.max(0, current.population - fallen.length),
          deadSurvivors: current.deadSurvivors + fallen.length,
          totalRuns: current.totalRuns + 1,
          lanternYear: nextYear,
          temporarySettlementModifiers: {
            ...(current.temporarySettlementModifiers || {}),
            graveDebt: false
          },
          stash: addResources(current.stash, runResources),
          survivors: current.survivors.map(survivor => fallen.some(item => item.id === survivor.id)
            ? { ...survivor, alive: false, hp: 0, boundGear: [] }
            : survivor),
          activeSurvivorId: current.survivors.find(survivor =>
            !fallen.some(item => item.id === survivor.id) && survivor.alive !== false)?.id || null,
          graveHistory: [
            ...fallen.map(survivor => ({
              survivorName: survivor.name,
              survivorId: survivor.id,
              killedBy: survivor.causeOfDeath || deathDetails.killedBy,
              quarryId: selectedQuarry,
              quarryLevel: selectedLevel,
              lanternYear: current.lanternYear,
              huntResultId: currentHuntId,
              huntPartyMembers: deathDetails.survivors.map(item => item.name),
              weaponProficiency: survivor.weaponProficiency || {},
              proficientWeaponTypes: getProficientWeaponSummary(survivor.weaponProficiency),
              supportGearCarried: (survivor.boundGear || [])
                .map(gear => equipment[gear.equipmentId])
                .filter(item => item?.supportGear)
                .map(item => item.name),
              injuries: survivor.injuries || [],
              scars: survivor.scars || [],
              disorders: survivor.disorders || [],
              woundHistory: survivor.woundHistory || [],
              finalWound: survivor.woundHistory?.at(-1) || null,
              gearLostCount: survivor.boundGear?.length || 0,
              gearLostNames: (survivor.boundGear || []).map(gear =>
                getEquipmentDisplayName(gear.equipmentId)),
              rewardsMissed: true,
              timestamp: new Date().toISOString()
            })),
            ...current.graveHistory
          ],
          settlementHistory: [
            ...(current.settlementHistory || []),
            {
              type: 'huntFailure',
              huntResultId: currentHuntId,
              quarryId: selectedQuarry,
              quarryLevel: selectedLevel,
              message: `The hunting party was wiped out by ${deathDetails.killedBy}.`,
              survivorIds: fallen.map(survivor => survivor.id),
              timestamp: new Date().toISOString()
            }
          ]
        };
        return applyLanternYearTimeline(next, nextYear);
      });
      setScreen('runSummary');
      return;
    }
    const fallenSurvivor = defeatedRunState?.runSurvivor || runSurvivor;
    const fallenResources = defeatedRunState?.runResources || runResources;
    const lostGear = fallenSurvivor?.boundGear || [];
    const progress = getRunProgress();
    const summary = {
      outcome: 'death',
      survivorName: deathDetails?.survivorName || fallenSurvivor?.name || 'Survivor',
      survivorId: fallenSurvivor?.id,
      survivorTraits: fallenSurvivor?.traits || [],
      survivorFightingArts: fallenSurvivor?.fightingArts || [],
      survivorWeaponProficiency: fallenSurvivor?.weaponProficiency || {},
      proficientWeaponTypes: getProficientWeaponSummary(fallenSurvivor?.weaponProficiency),
      survivorInjuries: fallenSurvivor?.injuries || [],
      survivorScars: fallenSurvivor?.scars || [],
      survivorDisorders: fallenSurvivor?.disorders || [],
      survivorCompletedRuns: fallenSurvivor?.completedRuns || 0,
      gearLostCount: lostGear.length,
      gearLostNames: lostGear.map(gear => getEquipmentDisplayName(gear.equipmentId)),
      killedBy: deathDetails?.killedBy || 'unknownMonster',
      killedById: deathDetails?.killedById || 'unknownMonster',
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: 0,
      resources: fallenResources.map(id => resourceData[id]?.name || id),
      hpBeforeHealing: 0,
      hpAfterHealing: 0,
      recoveredHp: 0,
      injuriesGained: [...new Set([
        ...runConditionGains.injuries,
        ...immediateConditionGains.injuries
      ])].map(id => getConditionName('injuries', id)),
      scarsGained: [...new Set([
        ...runConditionGains.scars,
        ...immediateConditionGains.scars
      ])].map(id => getConditionName('scars', id)),
      disordersGained: [...new Set([
        ...runConditionGains.disorders,
        ...immediateConditionGains.disorders
      ])].map(id => getConditionName('disorders', id)),
      populationBefore: settlement.population,
      populationAfter: Math.max(0, settlement.population - 1),
      lanternYearBefore: settlement.lanternYear,
      lanternYearAfter: settlement.lanternYear + 1
    };

    setRunSummary(summary);
    updateSettlement(current => {
      const nextYear = (current.lanternYear || 0) + 1;
      const deathSettlement = queueDeathResolutions(current, [
        createDeathResolution(fallenSurvivor, {
          cause: deathDetails?.killedBy || 'Unknown',
          huntId: currentHuntId,
          lanternYear: nextYear
        })
      ]);
      const next = {
      ...deathSettlement,
      population: Math.max(0, (current.population || 0) - 1),
      deadSurvivors: (current.deadSurvivors || 0) + 1,
      totalRuns: (current.totalRuns || 0) + 1,
      lanternYear: nextYear,
      temporarySettlementModifiers: {
        ...(current.temporarySettlementModifiers || {}),
        graveDebt: false
      },
      stash: addResources(current.stash, fallenResources),
      conditionHistory: {
        ...current.conditionHistory,
        injuryGained: current.conditionHistory.injuryGained ||
          Boolean(fallenSurvivor?.injuries?.length),
        disorderGained: current.conditionHistory.disorderGained ||
          Boolean(fallenSurvivor?.disorders?.length)
      },
      survivors: current.survivors.map(survivor => survivor.id === fallenSurvivor?.id
        ? { ...survivor, alive: false, hp: 0, boundGear: [] }
        : survivor),
      activeSurvivorId: current.survivors.find(
        survivor => survivor.id !== fallenSurvivor?.id && survivor.alive !== false
      )?.id || null,
      graveHistory: fallenSurvivor ? [{
        survivorName: fallenSurvivor.name,
        survivorId: fallenSurvivor.id,
        killedBy: fallenSurvivor.causeOfDeath || summary.killedBy,
        quarryId: selectedQuarry,
        quarryLevel: selectedLevel,
        lanternYear: current.lanternYear,
        huntResultId: currentHuntId,
        weaponProficiency: fallenSurvivor.weaponProficiency || {},
        proficientWeaponTypes: getProficientWeaponSummary(fallenSurvivor.weaponProficiency),
        injuries: fallenSurvivor.injuries || [],
        scars: fallenSurvivor.scars || [],
        disorders: fallenSurvivor.disorders || [],
        gearLostCount: lostGear.length,
        gearLostNames: lostGear.map(gear =>
          getEquipmentDisplayName(gear.equipmentId)),
        timestamp: new Date().toISOString()
      }, ...(current.graveHistory || [])] : current.graveHistory,
      settlementHistory: [
        ...(current.settlementHistory || []),
        {
          type: 'huntFailure',
          huntResultId: currentHuntId,
          quarryId: selectedQuarry,
          quarryLevel: selectedLevel,
          message: `${fallenSurvivor?.name || 'A survivor'} was killed during the hunt.`,
          survivorIds: fallenSurvivor?.id ? [fallenSurvivor.id] : [],
          timestamp: new Date().toISOString()
        }
      ]
      };
      return applyLanternYearTimeline(next, nextYear);
    });
    setScreen('runSummary');
  };

  const returnToSettlement = () => returnToSettlementSafely();

  const continueFromSummary = () => {
    if (runSummary?.outcome === 'death') setScreen('graveLegacy');
    else returnToSettlement();
  };

  const chooseGraveLegacy = legacy => {
    if (!legacy || !runSummary) return;
    const killedById = runSummary.killedById || 'unknownMonster';
    const graveEntry = {
      survivorName: runSummary.survivorName,
      killedBy: runSummary.killedBy || 'unknownMonster',
      nodesCompleted: runSummary.nodesCompleted,
      rowReached: runSummary.rowReached,
      chosenLegacyId: legacy.id,
      completedRuns: runSummary.survivorCompletedRuns || 0,
      traits: runSummary.survivorTraits || [],
      fightingArts: runSummary.survivorFightingArts || [],
      weaponProficiency: runSummary.survivorWeaponProficiency || {},
      proficientWeaponTypes: runSummary.proficientWeaponTypes || [],
      masteredWeaponTypes: (runSummary.proficientWeaponTypes || []).filter(item => item.mastered),
      injuries: runSummary.survivorInjuries || [],
      scars: runSummary.survivorScars || [],
      disorders: runSummary.survivorDisorders || [],
      gearLostCount: runSummary.gearLostCount || 0,
      gearLostNames: runSummary.gearLostNames || [],
      timestamp: new Date().toISOString()
    };

    updateSettlement(current => {
      const nextRunBonus = { ...(current.nextRunBonus || {}) };
      const monsterKnowledge = { ...(current.monsterKnowledge || {}) };
      if (legacy.id === graveLegacies.buryGear.id) nextRunBonus.randomMonsterPart = true;
      else if (legacy.id === graveLegacies.studyDeath.id) monsterKnowledge[killedById] = (monsterKnowledge[killedById] || 0) + 1;
      else if (legacy.id === graveLegacies.inheritScar.id) nextRunBonus.extraMaxHp = (nextRunBonus.extraMaxHp || 0) + 1;
      else if (legacy.id === graveLegacies.oathOfVengeance.id) nextRunBonus.firstCombatStrength = (nextRunBonus.firstCombatStrength || 0) + 1;

      return {
        ...current,
        monsterKnowledge,
        nextRunBonus,
        graveHistory: [graveEntry, ...(current.graveHistory || [])]
      };
    });
    returnToSettlement();
  };

  const handleBuild = item => {
    // Prevent direct building of deck-pool innovations unless they were drawn/chosen
    if (innovationCards[item.id] && !settlement.innovationDeckState.builtInnovationIds.includes(item.id)) {
      return;
    }
    const cost = item.fallbackCost && canAffordCost(item.fallbackCost, settlement.stash)
      ? item.fallbackCost
      : item.cost;
    if (!canAffordCost(cost, settlement.stash)) return;
    updateSettlement(current => ({
      ...current,
      stash: deductCost(current.stash, cost),
      builtInnovations: [...new Set([...current.builtInnovations, item.id])]
    }));
  };

  const handleCraft = recipe => {
    updateSettlement(current => {
      if (!getGearUnlockState(recipe, current).unlocked || !canCraft(recipe, current.stash)) {
        return current;
      }
      return {
        ...current,
        stash: deductCost(current.stash, recipe.cost),
        totalCraftedGear: (current.totalCraftedGear || 0) + 1,
        armory: [...current.armory, createGearInstance(recipe.id)]
      };
    });
  };

  const handleAttemptInnovation = () => {
    const drawable = getDrawableInnovationIdsForSettlement(settlement);
    if (
      !canSpendMemories(settlement, 1) ||
      !drawable.length
    ) {
      return;
    }

    setInnovationDraw([]);
    setInnovationPayment(null);
    setAppliedInnovationId(null);
    setScreen('innovationPayment');
  };

  const handleConfirmInnovationPayment = payment => {
    const drawable = getDrawableInnovationIdsForSettlement(settlement);
    const validation = validateInnovationPayment(settlement, payment);
    if (!validation.valid || !drawable.length) return;

    const choices = drawInnovationCandidates(settlement, 3);
    const previewPaymentResult = applyInnovationPayment(settlement, payment);
    if (!previewPaymentResult) return;
    const paidResources = previewPaymentResult.paidResources;
    updateSettlement(current => {
      const paymentResult = applyInnovationPayment(current, payment);
      if (!paymentResult) return current;
      const { paidResources: _paidResources, timestamp, ...paidSettlement } = paymentResult;
      return {
        ...paidSettlement,
        innovationDeckState: {
          ...current.innovationDeckState,
          discoveredInnovationIds: [
            ...new Set([
              ...current.innovationDeckState.discoveredInnovationIds,
              ...choices
            ])
          ],
          innovationHistory: [
            ...current.innovationDeckState.innovationHistory,
            {
              type: 'attempt',
              lanternYear: current.lanternYear,
              paidResources,
              offeredIds: choices,
              timestamp
            }
          ]
        }
      };
    });
    setInnovationDraw(choices);
    setInnovationPayment(paidResources);
    setAppliedInnovationId(null);
    setScreen('innovationDraw');
  };

  const handleTimelineChoice = (choiceId, nominatedSurvivorIds = []) => {
    updateSettlement(current =>
      resolveLanternTimelineChoice(current, choiceId, nominatedSurvivorIds)
    );
  };

  const handleChooseInnovation = innovationId => {
    const card = innovationCards[innovationId];
    if (!card) return;
    updateSettlement(current => applyInnovationChoice(current, innovationId));
    setAppliedInnovationId(innovationId);
  };

  const handleChooseCampaignPrinciple = (group, optionId) => {
    updateSettlement(current => chooseCampaignPrinciple(current, group, optionId));
    setScreen('settlement');
  };

  const handleForgetCard = (survivorId, cardId) => {
    updateSettlement(current => {
      const survivor = current.survivors.find(item => item.id === survivorId);
      if (!survivor || !cardId) return current;
      const additions = [
        ...(survivor.personalDeckAdditions || []),
        ...(survivor.permanentNegativeCards || [])
      ];
      const addition = additions.find(item => getPersonalCardId(item) === cardId);
      const gearSource = (survivor.boundGear || []).flatMap(gear => {
        const item = equipment[gear.equipmentId];
        return (item?.cardPackage || []).includes(cardId)
          ? [{ gear, item }]
          : [];
      })[0];
      if (!starterCardIds.includes(cardId) && !addition && !gearSource) return current;
      const card = cards[cardId];
      const sourceCard = gearSource
        ? {
          ...card,
          sourceType: 'gear',
          sourceGearId: gearSource.item.id,
          sourceGearName: gearSource.item.name
        }
        : card;
      const eligibility = getCardForgetEligibility({
        settlement: current,
        survivor,
        cardId,
        card: sourceCard,
        addition,
        gearGranted: Boolean(gearSource)
      });
      if (!eligibility.eligible) return current;

      const method = current.builtMemoryInnovations.includes('riteOfForgetting')
        ? 'Rite of Forgetting'
        : 'Guided Reflection';
      const cardName = card.name || cardId;
      const gearPrefix = gearSource ? `${gearSource.item.name} — ` : '';
      const cardShortName = gearSource && cardName.startsWith(gearPrefix)
        ? cardName.slice(gearPrefix.length)
        : cardName;
      const forgetDescription = gearSource
        ? `Forgot ${gearSource.item.name} — ${cardShortName} from ${gearSource.item.name}.`
        : `${survivor.name} forgot ${card.name}.`;
      const spent = spendMemories(current, EARLY_FORGETTING_COST, {
        source: 'guided-reflection',
        description: forgetDescription,
        survivorIds: [survivorId]
      });
      if (!spent) return current;
      return {
        ...spent,
        survivors: spent.survivors.map(item => item.id === survivorId
          ? forgetSurvivorCard(item, cardId, method, current.lanternYear, sourceCard)
          : item)
      };
    });
  };

  const handleMemoryCardRemoval = (actionId, survivorId, cardId) => {
    const config = actionId === 'quietNight'
      ? { innovationId: 'quietNight', cost: 1, method: 'Quiet Night' }
      : { innovationId: 'taboo', cost: 2, method: 'Taboo' };
    updateSettlement(current => {
      const survivor = current.survivors.find(item => item.id === survivorId);
      if (!current.builtMemoryInnovations.includes(config.innovationId)) return current;
      if (current.memoryActionsUsedThisYear[actionId] === current.lanternYear) return current;
      if (!survivor) return current;
      const survivorBurdenIds = [
        ...(survivor.personalDeckAdditions || []),
        ...(survivor.permanentNegativeCards || [])
      ].map(getPersonalCardId);
      const removableCard = cards[cardId];
      const validBurden = survivorBurdenIds.includes(cardId) &&
        !survivor.forgottenCardIds?.includes(cardId) &&
        removableCard?.type === 'curse';
      if (actionId === 'quietNight' ? cardId !== 'panic' || !validBurden : !validBurden) {
        return current;
      }
      const spent = spendMemories(current, config.cost, {
        source: actionId,
        description: `${config.method} removed ${removableCard?.name || 'a burden'}.`,
        survivorIds: [survivorId]
      });
      if (!spent) return current;
      return {
        ...spent,
        memoryActionsUsedThisYear: {
          ...current.memoryActionsUsedThisYear,
          [actionId]: current.lanternYear
        },
        survivors: current.survivors.map(item => item.id === survivorId
          ? cardId === 'panic'
            ? removePanicFromSurvivor(item, 1) // Remove 1 Panic card
            : forgetSurvivorCard(item, cardId, config.method, current.lanternYear, removableCard)
          : item)
      };
    });
  };

  const handleWeaponDrill = (survivorId, cardId) => {
    updateSettlement(current => {
      if (!current.builtMemoryInnovations.includes('weaponDrills')) return current;
      if (current.memoryActionsUsedThisYear.weaponDrills === current.lanternYear) return current;
      if (!trainingCardIds.includes(cardId)) return current;
      const spent = spendMemories(current, 1, {
        source: 'training',
        description: 'A survivor completed weapon drills.',
        survivorIds: [survivorId]
      });
      if (!spent) return current;
      return {
        ...spent,
        memoryActionsUsedThisYear: {
          ...current.memoryActionsUsedThisYear,
          weaponDrills: current.lanternYear
        },
        survivorTrainingLog: [
          ...(current.survivorTrainingLog || []),
          { survivorId, cardId, lanternYear: current.lanternYear }
        ],
        survivors: current.survivors.map(item => item.id === survivorId
          ? {
            ...item,
            personalDeckAdditions: [
              ...item.personalDeckAdditions,
              { cardId, sourceType: 'training', reason: 'Weapon Drills' }
            ]
          }
          : item)
      };
    });
  };

  const handleMemoryTraining = (survivorId, cardId) => {
    updateSettlement(current => resolveMemoryTraining(current, survivorId, { cardId }));
  };

  const handlePainLesson = (survivorId, injuryId) => {
    updateSettlement(current => {
      if (!current.builtMemoryInnovations.includes('painLessons')) return current;
      if (current.memoryActionsUsedThisYear.painLessons === current.lanternYear) return current;
      const survivor = current.survivors.find(item => item.id === survivorId);
      if (!survivor?.injuries.includes(injuryId)) return current;
      const scarId = ['concussion', 'shatteredNerve'].includes(injuryId)
        ? 'deadEyeCalm'
        : 'boneSetWrong';
      return {
        ...current,
        memoryActionsUsedThisYear: {
          ...current.memoryActionsUsedThisYear,
          painLessons: current.lanternYear
        },
        survivors: current.survivors.map(item => {
          if (item.id !== survivorId) return item;
          const withoutInjury = {
            ...item,
            injuries: item.injuries.filter(id => id !== injuryId)
          };
          return addUniqueCondition(withoutInjury, 'scars', scarId);
        })
      };
    });
  };

  const handleShrineOfNames = survivorId => {
    updateSettlement(current => {
      if (!current.builtMemoryInnovations.includes('shrineOfNames')) return current;
      if (current.memoryActionsUsedThisYear.shrineOfNames === current.lanternYear) return current;
      const spent = spendMemories(current, 2, {
        source: 'shrine-of-names',
        description: 'A survivor gained lasting vitality.',
        survivorIds: [survivorId]
      });
      if (!spent) return current;
      return {
        ...spent,
        memoryActionsUsedThisYear: {
          ...current.memoryActionsUsedThisYear,
          shrineOfNames: current.lanternYear
        },
        survivors: current.survivors.map(item => item.id === survivorId
          ? { ...item, maxHp: item.maxHp + 1, hp: item.hp + 1 }
          : item)
      };
    });
  };

  const handleRestSurvivor = survivorId => {
    updateSettlement(current => {
      if (!canSpendMemories(current, 1)) return current;
      const survivor = current.survivors.find(item =>
        item.id === survivorId && item.alive !== false && (
          item.hp < item.maxHp ||
          Object.values(item.hitLocations || {}).some(wound => wound.wounded)
        )
      );
      if (!survivor) return current;
      const spent = spendMemories(current, 1, {
        source: 'rest',
        description: `Rested ${survivor.name}.`,
        survivorIds: [survivorId]
      });
      if (!spent) return current;
      return {
        ...spent,
        survivors: current.survivors.map(item => {
          if (item.id !== survivorId) return item;
          const lightLocation = Object.entries(item.hitLocations || {})
            .find(([, wound]) => wound.wounded && !wound.severe)?.[0];
          const rested = lightLocation ? treatWound(item, lightLocation, 'rest') : item;
          const restMultiplier = current.innovationDeckState.builtInnovationIds.includes('quietNight')
            ? innovationCards.quietNight.mechanicalEffects.restHealingMultiplier
            : 1;
          return {
            ...rested,
            hp: Math.min(
              rested.maxHp,
              rested.hp + Math.ceil((rested.maxHp / 3) * restMultiplier)
            )
          };
        })
      };
    });
  };

  const handleTreatInjury = (survivorId, injuryId) => {
    updateSettlement(current => {
      if (!current.builtInnovations.includes('firstAidTent')) return current;
      if (current.lastInjuryTreatmentLanternYear === current.lanternYear) return current;
      const resourceId = (current.stash.organ || 0) > 0
        ? 'organ'
        : (current.stash.hide || 0) > 0
          ? 'hide'
          : null;
      const survivor = current.survivors.find(item =>
        item.id === survivorId && item.alive !== false && item.injuries?.includes(injuryId)
      );
      if (!resourceId || !survivor) return current;
      return {
        ...current,
        stash: deductCost(current.stash, { [resourceId]: 1 }),
        lastInjuryTreatmentLanternYear: current.lanternYear,
        survivors: current.survivors.map(item => item.id === survivorId
          ? { ...item, injuries: item.injuries.filter(id => id !== injuryId) }
          : item)
      };
    });
  };

  const handleConfirmLoadout = (selectedInstanceIds, activeProficiencyType) => {
    const nemesisPreparation = settlement.pendingNemesisEncounter;
    const activeSurvivor = settlement.survivors.find(
      item => item.id === settlement.activeSurvivorId
    );
    const limit = settlement.builtInnovations.includes('armoryRack') ? 5 : 4;
    const remainingSlots = Math.max(0, limit - (activeSurvivor?.boundGear?.length || 0));
    const selected = settlement.armory
      .filter(gear => selectedInstanceIds.includes(gear.instanceId))
      .slice(0, remainingSlots);
    const preparedSurvivor = activeSurvivor
      ? {
          ...activeSurvivor,
          activeProficiencyType: activeProficiencyType || 'fistAndTooth',
          boundGear: [...(activeSurvivor.boundGear || []), ...selected]
        }
      : null;
    updateSettlement(current => {
      const survivor = current.survivors.find(item => item.id === current.activeSurvivorId);
      const currentLimit = current.builtInnovations.includes('armoryRack') ? 5 : 4;
      const currentRemainingSlots = Math.max(0, currentLimit - (survivor?.boundGear?.length || 0));
      const currentSelected = current.armory
        .filter(gear => selectedInstanceIds.includes(gear.instanceId))
        .slice(0, currentRemainingSlots);
      const selectedIds = new Set(currentSelected.map(gear => gear.instanceId));
      return {
        ...current,
        armory: current.armory.filter(gear => !selectedIds.has(gear.instanceId)),
        survivors: current.survivors.map(survivor => survivor.id === current.activeSurvivorId
          ? {
              ...survivor,
              activeProficiencyType: activeProficiencyType || 'fistAndTooth',
              boundGear: [...(survivor.boundGear || []), ...currentSelected]
            }
          : survivor)
      };
    });
    if (nemesisPreparation && preparedSurvivor) {
      const equipped = preparedSurvivor.boundGear
        .filter(gear => equipment[gear.equipmentId]);
      setRunSurvivor(preparedSurvivor);
      setRunEquippedGear(equipped.map(item => item.equipmentId));
      setRunDeck(buildRunDeck({ survivor: preparedSurvivor, equippedGear: equipped }));
      setCombatBonus({
        ...getLoadoutBonus(settlement, null, nemesisPreparation.nemesisId),
        survivor: {
          ...preparedSurvivor,
          survival: Math.min(
            preparedSurvivor.maxSurvival || 3,
            (preparedSurvivor.survival || 0) + (nemesisPreparation.startingSurvivalBonus || 0)
          )
        },
        runDeck: buildRunDeck({ survivor: preparedSurvivor, equippedGear: equipped }),
        huntDeckConditionsApplied: true,
        monsterEnrage: nemesisPreparation.nemesisId === 'maskedJudge'
          ? Math.floor((settlement.settlementMemory || 0) / 3)
          : 0,
        monsterBaneDamageBonus:
          settlement.builtInnovations.includes('monsterArchive') &&
          preparedSurvivor.fightingArts.includes(getMonsterBaneId(nemesisPreparation.nemesisId))
            ? 1
            : 0
      });
      setScreen('nemesisCombat');
      return;
    }
    if (loadoutPartyIndex < selectedPartyIds.length - 1) {
      const nextIndex = loadoutPartyIndex + 1;
      const nextId = selectedPartyIds[nextIndex];
      setLoadoutPartyIndex(nextIndex);
      updateSettlement(current => ({ ...current, activeSurvivorId: nextId }));
      return;
    }
    updateSettlement(current => ({
      ...current,
      huntingParty: selectedPartyIds.slice(0, current.maxHuntPartySize),
      activeSurvivorId: selectedPartyIds[0] || current.activeSurvivorId
    }));
    setScreen('quarrySelection');
  };

  const handleDestroyBoundGear = instanceId => {
    updateSettlement(current => ({
      ...current,
      survivors: current.survivors.map(survivor => survivor.id === current.activeSurvivorId
        ? { ...survivor, boundGear: (survivor.boundGear || []).filter(gear => gear.instanceId !== instanceId) }
        : survivor)
    }));
  };

  const handleAddTestGearResources = () => {
    if (!import.meta.env.DEV) return;
    updateSettlement(current => ({
      ...current,
      stash: {
        ...current.stash,
        bone: (current.stash.bone || 0) + 8,
        sinew: (current.stash.sinew || 0) + 4,
        hide: (current.stash.hide || 0) + 6,
        claw: (current.stash.claw || 0) + 2,
        organ: (current.stash.organ || 0) + 2
      }
    }));
  };

  const handleEventChoice = choice => {
    const result = resolveEvent(
      currentEvent,
      choice,
      { runResources, runSurvivor, runModifiers, settlementMemoryDelta: 0 },
      {
        quarry: quarries[selectedQuarry],
        runParty,
        settlementMemory: settlement.settlementMemory,
        hasGravesUpgrade: settlement.builtInnovations.includes('storytellerCircle')
      }
    );
    if (!result) return null;
    const eventConditionGains = { injuries: [], scars: [], disorders: [] };
    ['injuries', 'scars', 'disorders'].forEach(type => {
      (result.runSurvivor[type] || []).forEach(conditionId => {
        if (!(runSurvivor[type] || []).includes(conditionId)) {
          eventConditionGains[type].push(conditionId);
          recordConditionGain(type, conditionId);
        }
      });
    });
    const previousAdditions = runSurvivor.personalDeckAdditions || [];
    const eventCardIds = (result.runSurvivor.personalDeckAdditions || []).slice(previousAdditions.length);
    if (eventCardIds.length) {
      setRunDeck(current => [...current, ...getCardsFromIds(eventCardIds, 'Hunt event')]);
    }
    setRunResources(result.runResources);
    setRunSurvivor(result.runSurvivor);
    setRunParty(current => current.map(survivor =>
      survivor.id === result.runSurvivor.id ? result.runSurvivor : survivor
    ));
    setRunModifiers({
      ...result.runModifiers,
      nextEventWarning: false
    });
    updateSettlement(current => {
      const memorySettlement = result.settlementMemoryDelta > 0
        ? gainMemories(current, result.settlementMemoryDelta, {
          source: 'hunt-event',
          description: result.outcomeText || 'A hunt event preserved a memory.',
          survivorIds: [result.runSurvivor.id],
          huntId: currentHuntId
        })
        : result.settlementMemoryDelta < 0
          ? spendMemories(current, Math.abs(result.settlementMemoryDelta), {
            source: 'hunt-event',
            description: result.outcomeText || 'A hunt event consumed memory.',
            survivorIds: [result.runSurvivor.id],
            huntId: currentHuntId
          }) || current
          : current;
      return {
      ...memorySettlement,
      survivors: current.survivors.map(survivor => survivor.id === result.runSurvivor.id
        ? {
          ...survivor,
          survival: result.runSurvivor.survival,
          traits: result.runSurvivor.traits,
          fightingArts: result.runSurvivor.fightingArts,
          personalDeckAdditions: result.runSurvivor.personalDeckAdditions,
          deckAdditions: [],
          injuries: result.runSurvivor.injuries,
          scars: result.runSurvivor.scars,
          disorders: result.runSurvivor.disorders,
          permanentModifiers: result.runSurvivor.permanentModifiers
        }
        : survivor),
      conditionHistory: {
        ...current.conditionHistory,
        injuryGained: current.conditionHistory.injuryGained ||
          Boolean(result.runSurvivor.injuries?.length),
        disorderGained: current.conditionHistory.disorderGained ||
          Boolean(result.runSurvivor.disorders?.length)
      },
      pendingSpecialChildTrait: result.pendingSpecialChildTrait || current.pendingSpecialChildTrait,
      discoveredQuarries: result.quarryRumour
        ? [...new Set([...current.discoveredQuarries, ...quarryList.filter(quarry =>
          quarry.role === 'quarry' &&
          !current.discoveredQuarries.includes(quarry.id)
        ).slice(0, 1).map(quarry => quarry.id)])]
        : current.discoveredQuarries,
      unlockedQuarries: result.quarryRumour
        ? [...new Set([...current.unlockedQuarries, ...quarryList.filter(quarry =>
          quarry.role === 'quarry' &&
          !current.discoveredQuarries.includes(quarry.id)
        ).slice(0, 1).map(quarry => quarry.id)])]
        : current.unlockedQuarries
    };
    });
    if (result.runSurvivor.hp <= 0) {
      handleCombatDefeat({
        survivorName: result.runSurvivor.name,
        killedBy: currentEvent.name,
        killedById: `event:${currentEvent.id}`
      }, result, eventConditionGains);
    }
    setRunEventWarningUsed(true);
    return result;
  };

  const handleRestChoice = (choiceId, options = {}) => {
    const result = resolveRestStopChoice({
      settlement,
      runParty,
      runSurvivor,
      runModifiers,
      runMap,
      currentNode,
      currentHuntId,
      currentQuarryId: selectedQuarry,
      runResources
    }, choiceId, options);
    if (!result.applied) return;

    const nextParty = result.runParty || runParty;
    const nextActive = result.runSurvivor || runSurvivor;
    const nextPartyBonuses = nextParty.map(survivor => {
      const equippedGear = (survivor.boundGear || [])
        .filter(gear => equipment[gear.equipmentId]);
      const existing = partyCombatBonuses.find(member => member?.survivor?.id === survivor.id);
      return {
        ...existing,
        survivor,
        runDeck: buildRunDeck({ survivor, equippedGear })
      };
    });

    if (result.settlement && result.settlement !== settlement) setSettlement(result.settlement);
    setRunParty(nextParty);
    setRunSurvivor(nextActive);
    setRunResources(result.runResources || runResources);
    setRunModifiers(result.runModifiers || runModifiers);
    setRunMap(result.runMap || runMap);
    setPartyCombatBonuses(nextPartyBonuses);
    if (nextActive) {
      const equippedGear = (nextActive.boundGear || [])
        .filter(gear => equipment[gear.equipmentId]);
      setRunDeck(buildRunDeck({ survivor: nextActive, equippedGear }));
    }
    
    // Scout the Dark might trigger a fight immediately
    if (result.nextNodeType === 'fight') {
      setRestResult({
        ...result,
        choiceId,
        onContinue: () => selectNode({ ...currentNode, type: 'fight' })
      });
    } else {
      setRestResult({
        ...result,
        choiceId,
        onContinue: completeCurrentNode
      });
    }
  };

  const handleRestContinue = () => {
    const onContinue = restResult?.onContinue || completeCurrentNode;
    setRestResult(null);
    onContinue();
  };

  const handleLootChoice = resourceIds => {
    const pending = pendingCombatVictory;
    setPendingCombatVictory(null);
    setLootChoices([]);
    if (pending?.isBoss) {
      if (pending.survivors) {
        finishPartyBossVictory(resourceIds, pending.survivors, pending.huntResultId);
      } else {
        finishBossVictory(resourceIds, pending.survivor, pending.huntResultId);
      }
      setBossGenericRewards([]);
      return;
    }
    const resourceId = Array.isArray(resourceIds) ? resourceIds[0] : resourceIds;
    setRunResources(items => [...items, resourceId]);
    completeCurrentNode();
  };

  const handleProgressChoice = (rewardId, offeredIds = []) => {
    const knownReward = ['survival', 'strengthLesson', 'hardenedBody', 'weaponPractice']
      .includes(rewardId) ||
      Boolean(findMonsterSurvivorReward(rewardId)) ||
      Boolean(findSurvivorReward(rewardId)) ||
      Boolean(cards[rewardId]) ||
      Boolean(fightingArts[rewardId]);
    const safeRewardId = knownReward ? rewardId : 'survival';
    if (!knownReward) {
      console.warn(`[Reward recovery] Unknown reward id "${rewardId}"; granting Survival.`);
    }
    const monsterReward = findMonsterSurvivorReward(safeRewardId);
    const reward = findSurvivorReward(safeRewardId);
    const rewardSurvivorId = survivorRewardQueue[0] || runSummary.survivorId;
    const remainingRewardQueue = survivorRewardQueue.slice(1);
    const huntResultId = runSummary?.huntResultId;
    updateSettlement(current => ({
      ...(huntResultId && current.huntRewardLedger?.[huntResultId]?.survivorRewardIds
        ?.includes(rewardSurvivorId)
        ? current
        : {
          ...current,
          survivors: current.survivors.map(survivor => {
        if (survivor.id !== rewardSurvivorId) return survivor;
        const withHistory = {
          ...survivor,
          recentRewardOfferIds: [
            ...(survivor.recentRewardOfferIds || []),
            ...offeredIds
          ].slice(-15)
        };
        if (safeRewardId === 'survival') {
          return {
            ...withHistory,
            survival: Math.min(survivor.maxSurvival || 3, (survivor.survival || 0) + 1)
          };
        }
        if (safeRewardId === 'strengthLesson') {
          return { ...withHistory, strength: (survivor.strength || 0) + 1 };
        }
        if (safeRewardId === 'hardenedBody') {
          return {
            ...withHistory,
            maxHp: (survivor.maxHp || 30) + 1,
            hp: Math.min((survivor.maxHp || 30) + 1, (survivor.hp || 0) + 1)
          };
        }
        if (safeRewardId === 'weaponPractice') {
          return applyWeaponProficiencyXp(
            withHistory,
            [survivor.activeProficiencyType || 'fistAndTooth']
          );
        }
        if (monsterReward?.type === 'card') {
          return addPersonalCard(withHistory, safeRewardId, {
            sourceType: 'monsterReward',
            reason: `${quarries[selectedQuarry].name} Level ${selectedLevel}`
          });
        }
        if (monsterReward?.type === 'trait') {
          return {
            ...withHistory,
            traits: [...new Set([...(survivor.traits || []), safeRewardId])]
          };
        }
        if (cards[safeRewardId]?.sourceType === 'personal') {
          return addPersonalCard(withHistory, safeRewardId, {
            sourceType: 'personal',
            reason: 'Survivor victory'
          });
        }
        if (!fightingArts[safeRewardId]?.implemented) return withHistory;
        if (isMonsterBaneId(safeRewardId) && getSurvivorMonsterBaneId(survivor)) {
          return {
            ...withHistory,
            survival: Math.min(
              survivor.maxSurvival || 3,
              (survivor.survival || 0) + 1
            )
          };
        }
        return learnFightingArt(withHistory, safeRewardId, reward?.source || 'Survivor reward');
          }),
          huntRewardLedger: huntResultId ? {
            ...current.huntRewardLedger,
            [huntResultId]: {
              ...current.huntRewardLedger?.[huntResultId],
              huntResultId,
              survivorRewardIds: [
                ...(current.huntRewardLedger?.[huntResultId]?.survivorRewardIds || []),
                rewardSurvivorId
              ],
              survivorRewardsApplied: remainingRewardQueue.length === 0
            }
          } : current.huntRewardLedger
        })
    }));
    setSurvivorRewardQueue(remainingRewardQueue);
    if (remainingRewardQueue.length) return;
    if (!runSummary?.quarryUnlockTriggered) {
      setScreen('runSummary');
      return;
    }
    const discoveryChoices = getDiscoveryChoices(settlement, selectedQuarry);
    if (discoveryChoices.length) {
      setScreen('monsterDiscovery');
    } else {
      setRunSummary(current => ({
        ...current,
        discoveryMessage: 'No new quarry rumours were found.'
      }));
      setScreen('runSummary');
    }
  };

  const handleMonsterDiscovery = quarryId => {
    const quarry = quarries[quarryId];
    const discoveryEvent = getQuarryDiscoveryEvent(quarryId);
    if (!quarry || quarry.role !== 'quarry' || !quarry.huntable || !discoveryEvent) return;
    updateSettlement(current => {
      const stash = { ...current.stash };
      const nextRunBonus = { ...(current.nextRunBonus || {}) };
      const rumourTexts = [...(current.rumourTexts || [])];

      discoveryEvent.settlementEffects.forEach(effect => {
        if (effect.type === 'resource' || effect.type === 'resourceOrMemory') {
          if (resourceData[effect.resourceId]) stash[effect.resourceId] = (stash[effect.resourceId] || 0) + effect.amount;
        }
        if (effect.type === 'resourceOrResource') {
          const resourceId = effect.resourceIds.find(id => resourceData[id]);
          if (resourceId) stash[resourceId] = (stash[resourceId] || 0) + effect.amount;
        }
        if (effect.type === 'nextHuntModifier') Object.assign(nextRunBonus, effect.effects);
        if (effect.type === 'rumour') rumourTexts.push(effect.text);
      });

      return {
        ...current,
        stash,
        nextRunBonus,
        rumourTexts: [...new Set(rumourTexts)],
        discoveredQuarries: [...new Set([...current.discoveredQuarries, quarryId])],
        unlockedQuarries: [...new Set([...current.unlockedQuarries, quarryId])],
        availableQuarryTiers: calculateAvailableQuarryTiers({
          ...current,
          discoveredQuarries: [...new Set([...current.discoveredQuarries, quarryId])],
          unlockedQuarries: [...new Set([...current.unlockedQuarries, quarryId])]
        }),
        builtInnovations: [...new Set([...current.builtInnovations, ...discoveryEvent.unlocksBuildingIds])],
        unlockedRecipeFamilies: [...new Set([...(current.unlockedRecipeFamilies || []), quarryId])],
        rumouredInnovations: [
          ...new Set([...(current.rumouredInnovations || []), ...discoveryEvent.unlocksBuildingIds])
        ],
        settlementHistory: [...current.settlementHistory, {
          type: 'quarryDiscovery',
          lanternYear: current.lanternYear,
          quarryId,
          title: discoveryEvent.title,
          text: discoveryEvent.historyText,
          timestamp: new Date().toISOString()
        }],
        innovationDeckState: {
          ...current.innovationDeckState,
          availableInnovationPoolIds: [
            ...new Set([
              ...current.innovationDeckState.availableInnovationPoolIds,
              ...(QUARRY_INNOVATION_POOL[quarryId] || []),
              ...discoveryEvent.unlocksInnovationIds
            ])
          ]
        }
      };
    });
    setRunSummary(current => ({
      ...current,
      discoveryMessage: `The settlement now knows how to hunt ${quarry.name}.`
    }));
    setPendingQuarryDiscoveryId(quarryId);
    setScreen('quarryDiscoveryLore');
  };

  const continueNemesisLore = () => {
    updateSettlement(current => {
      const pending = current.pendingNemesisEncounter;
      if (!pending) return current;
      return {
        ...current,
        revealedNemesisIds: [...new Set([...current.revealedNemesisIds, pending.nemesisId])],
        seenNemesisLoreIds: [...new Set([...current.seenNemesisLoreIds, pending.nemesisId])],
        pendingNemesisEncounter: { ...pending, stage: 'warning' }
      };
    });
    setScreen('nemesisWarning');
  };

  const beginNemesisPreparation = () => {
    const living = settlement.survivors.filter(survivor => survivor.alive !== false);
    if (!living.length) {
      const encounter = nemesisEncounters[settlement.pendingNemesisEncounter.nemesisId];
      const result = {
        nemesisId: encounter.id,
        nemesisName: encounter.displayName,
        result: 'defeat',
        survivorName: null,
        text: 'No living survivor could answer the attack. The settlement is defeated.',
        details: ['Population reduced to 0'],
        deathSummary: null
      };
      updateSettlement(current => ({
        ...current,
        population: 0,
        pendingNemesisEncounter: null,
        lastNemesisResult: result,
        settlementHistory: [...current.settlementHistory, {
          lanternYear: current.lanternYear,
          nemesisId: encounter.id,
          nemesisName: encounter.displayName,
          result: 'defeat',
          survivorUsed: null,
          consequences: result.details,
          rewards: [],
          deaths: [],
          timestamp: new Date().toISOString()
        }]
      }));
      setNemesisResult(result);
      setScreen('nemesisResult');
      return;
    }
    updateSettlement(current => ({
      ...current,
      activeSurvivorId: living[0].id,
      pendingNemesisEncounter: {
        ...current.pendingNemesisEncounter,
        stage: 'preparation',
        selectedSurvivorId: living[0].id
      }
    }));
    setScreen('nemesisPreparation');
  };

  const selectNemesisSurvivor = survivorId => {
    updateSettlement(current => ({
      ...current,
      activeSurvivorId: survivorId,
      pendingNemesisEncounter: {
        ...current.pendingNemesisEncounter,
        selectedSurvivorId: survivorId
      }
    }));
  };

  const spendNemesisMemory = () => {
    updateSettlement(current => {
      if (current.pendingNemesisEncounter?.memorySpent) return current;
      const spent = spendMemories(current, 1, {
        source: 'nemesis-preparation',
        description: 'Prepared a defender for a settlement threat.',
        survivorIds: [current.pendingNemesisEncounter?.selectedSurvivorId].filter(Boolean)
      });
      if (!spent) return current;
      return {
        ...spent,
        pendingNemesisEncounter: {
          ...current.pendingNemesisEncounter,
          memorySpent: true,
          startingSurvivalBonus: 1
        }
      };
    });
  };

  const healNemesisSurvivor = resourceId => {
    updateSettlement(current => {
      const pending = current.pendingNemesisEncounter;
      const survivor = current.survivors.find(item => item.id === pending?.selectedSurvivorId);
      if (!pending || pending.healingSpent || !survivor || (current.stash[resourceId] || 0) < 1) {
        return current;
      }
      return {
        ...current,
        stash: deductCost(current.stash, { [resourceId]: 1 }),
        survivors: current.survivors.map(item => item.id === survivor.id
          ? { ...item, hp: Math.min(item.maxHp, item.hp + 2) }
          : item),
        pendingNemesisEncounter: { ...pending, healingSpent: true }
      };
    });
  };

  const prepareNemesisLoadout = () => {
    setScreen('loadout');
  };

  const finishNemesisVictory = combatResult => {
    const pending = settlement.pendingNemesisEncounter;
    const encounter = nemesisEncounters[pending?.nemesisId];
    if (!encounter || !runSurvivor) return;
    const uniqueReward = createNemesisVictoryReward(encounter, runSurvivor);
    const details = uniqueReward.uniqueResourceId
      ? [`+1 ${uniqueReward.uniqueResourceName}`]
      : ['No unique trophy data was available.'];
    const result = {
      nemesisId: encounter.id,
      nemesisName: encounter.displayName,
      result: 'victory',
      survivorName: runSurvivor.name,
      survivorId: runSurvivor.id,
      text: encounter.victoryText,
      details,
      uniqueReward,
      deathSummary: null
    };
    updateSettlement(current => {
      const survivorAfter = combatResult?.survivor || runSurvivor;
      return {
        ...current,
        stash: uniqueReward.uniqueResourceId
          ? addResources(current.stash, [uniqueReward.uniqueResourceId])
          : current.stash,
        survivors: current.survivors.map(survivor => {
          if (survivor.id !== runSurvivor.id) return survivor;
          return {
            ...survivor,
            hp: survivorAfter.hp,
            survival: survivorAfter.survival,
            history: [
              ...(survivor.history || []),
              `Defeated ${encounter.displayName} and recovered ${uniqueReward.uniqueResourceName}.`
            ]
          };
        }),
        pendingNemesisEncounter: null,
        lastNemesisResult: result,
        settlementHistory: [...current.settlementHistory, {
          id: uniqueReward.rewardEventId,
          type: 'nemesis-victory',
          lanternYear: current.lanternYear,
          nemesisId: encounter.id,
          nemesisName: encounter.displayName,
          result: 'victory',
          survivorUsed: runSurvivor.name,
          consequences: [],
          rewards: details,
          learningText: uniqueReward.learningText,
          rewardClaimed: uniqueReward.rewardClaimed,
          deaths: [],
          timestamp: new Date().toISOString()
        }]
      };
    });
    setNemesisResult(result);
    setScreen('nemesisResult');
  };

  const handleNemesisRewardChoice = choiceId => {
    if (!nemesisResult?.uniqueReward || nemesisResult.uniqueReward.rewardClaimed) return;
    const choice = getNemesisRewardChoice(nemesisResult.uniqueReward, choiceId);
    if (!choice) return;

    const currentSurvivor = settlement.survivors.find(item =>
      item.id === nemesisResult.survivorId
    );
    const artAlreadyOwned = choice.artId &&
      currentSurvivor?.fightingArts?.includes(choice.artId);
    const resolvedChoice = artAlreadyOwned
      ? getNemesisRewardChoice(nemesisResult.uniqueReward, 'takeExtraTrophy')
      : choice;
    if (!resolvedChoice || !currentSurvivor) return;
    const learnedArt = resolvedChoice.type === 'fightingArt';
    const choiceText = learnedArt
      ? `${currentSurvivor.name} learned ${fightingArts[resolvedChoice.artId]?.name || 'Unknown / Legacy'}.`
      : `The settlement took another ${resourceData[resolvedChoice.resourceId]?.name || 'Unknown / Legacy'}.`;
    const updatedResult = {
      ...nemesisResult,
      details: [
        ...nemesisResult.details,
        choiceText,
        nemesisResult.uniqueReward.learningText
      ],
      uniqueReward: {
        ...nemesisResult.uniqueReward,
        rewardClaimed: true,
        chosenRewardId: resolvedChoice.id
      }
    };

    updateSettlement(current => {
      const storedResult = current.lastNemesisResult?.uniqueReward?.rewardEventId ===
        nemesisResult.uniqueReward.rewardEventId
        ? current.lastNemesisResult
        : nemesisResult;
      if (storedResult.uniqueReward?.rewardClaimed) return current;
      const reward = storedResult.uniqueReward;
      const survivor = current.survivors.find(item => item.id === storedResult.survivorId);
      if (!survivor) return current;

      const safeChoice = resolvedChoice.artId && survivor.fightingArts.includes(resolvedChoice.artId)
        ? getNemesisRewardChoice(reward, 'takeExtraTrophy')
        : resolvedChoice;
      if (!safeChoice) return current;
      const safeLearnedArt = safeChoice.type === 'fightingArt';
      const safeChoiceText = safeLearnedArt
        ? `${survivor.name} learned ${fightingArts[safeChoice.artId]?.name || 'Unknown / Legacy'}.`
        : `The settlement took another ${resourceData[safeChoice.resourceId]?.name || 'Unknown / Legacy'}.`;
      const safeResult = {
        ...storedResult,
        details: [...storedResult.details, safeChoiceText, reward.learningText],
        uniqueReward: {
          ...reward,
          rewardClaimed: true,
          chosenRewardId: safeChoice.id
        }
      };

      return {
        ...current,
        stash: safeChoice.type === 'resource'
          ? addResources(current.stash, [safeChoice.resourceId])
          : current.stash,
        survivors: current.survivors.map(item => item.id === survivor.id
          ? {
            ...item,
            fightingArts: safeLearnedArt
              ? [...new Set([...item.fightingArts, safeChoice.artId])]
              : item.fightingArts,
            history: [...(item.history || []), reward.learningText, safeChoiceText]
          }
          : item),
        lastNemesisResult: safeResult,
        settlementHistory: current.settlementHistory.map(entry =>
          entry.id === reward.rewardEventId
            ? {
              ...entry,
              rewards: [...(entry.rewards || []), safeChoiceText],
              learningText: reward.learningText,
              rewardClaimed: true
            }
            : entry
        )
      };
    });
    setNemesisResult(updatedResult);
  };

  const finishNemesisDefeat = deathDetails => {
    const pending = settlement.pendingNemesisEncounter;
    const encounter = nemesisEncounters[pending?.nemesisId];
    if (!encounter || !runSurvivor) return;
    const consequences = encounter.defeatConsequences || {};
    const lostGear = runSurvivor.boundGear || [];
    const details = [];
    const deathSummary = {
      outcome: 'death',
      survivorName: runSurvivor.name,
      survivorId: runSurvivor.id,
      survivorTraits: runSurvivor.traits || [],
      survivorFightingArts: runSurvivor.fightingArts || [],
      survivorWeaponProficiency: runSurvivor.weaponProficiency || {},
      proficientWeaponTypes: getProficientWeaponSummary(runSurvivor.weaponProficiency),
      survivorInjuries: runSurvivor.injuries || [],
      survivorScars: runSurvivor.scars || [],
      survivorDisorders: runSurvivor.disorders || [],
      survivorCompletedRuns: runSurvivor.completedRuns || 0,
      gearLostCount: lostGear.length,
      gearLostNames: lostGear.map(gear => getEquipmentDisplayName(gear.equipmentId)),
      killedBy: encounter.displayName,
      killedById: encounter.id,
      nodesCompleted: 0,
      rowReached: 0,
      settlementMemoryEarned: 0
    };
    updateSettlement(current => {
      let population = Math.max(0, current.population - 1);
      let settlementMemory = current.settlementMemory;
      let stash = current.stash;
      let builtInnovations = current.builtInnovations;
      let innovationDeckState = current.innovationDeckState;
      const randomLoss = consequences.randomResourceLoss
        ? removeRandomResources(stash, consequences.randomResourceLoss)
        : { stash, removed: [] };
      stash = randomLoss.stash;
      if (consequences.populationLoss) {
        population = Math.max(0, population - consequences.populationLoss);
        details.push(`Population -${consequences.populationLoss}`);
      }
      if (randomLoss.removed.length) details.push(`Resources lost: ${randomLoss.removed.join(', ')}`);
      if (consequences.settlementMemoryLoss) {
        if (settlementMemory > 0) {
          const loss = Math.min(settlementMemory, consequences.settlementMemoryLoss);
          settlementMemory -= loss;
          details.push(`Memory -${loss}`);
        } else if (consequences.populationLossIfNoMemory) {
          population = Math.max(0, population - consequences.populationLossIfNoMemory);
          details.push(`Population -${consequences.populationLossIfNoMemory}`);
        }
      }
      if (consequences.loseBuiltInnovation) {
        const removable = builtInnovations.find(id => id !== 'lanternHearth');
        if (removable) {
          builtInnovations = builtInnovations.filter(id => id !== removable);
          innovationDeckState = {
            ...innovationDeckState,
            builtInnovationIds: innovationDeckState.builtInnovationIds.filter(id => id !== removable)
          };
          details.push(`Innovation lost: ${innovationCards[removable]?.name || removable}`);
        } else {
          const loss = Math.min(settlementMemory, consequences.settlementMemoryLossFallback || 0);
          settlementMemory -= loss;
          details.push(`Memory -${loss}`);
        }
      }
      details.unshift(`${runSurvivor.name} died`, `Bound gear destroyed: ${lostGear.length}`);
      const nextSurvivors = current.survivors.map(survivor => {
        if (survivor.id !== runSurvivor.id) return survivor;
        return {
          ...survivor,
          alive: false,
          hp: 0,
          boundGear: []
        };
      });
      if (consequences.disorderId) {
        const disorderTarget = nextSurvivors.find(survivor => survivor.alive !== false);
        if (disorderTarget) {
          disorderTarget.disorders = [
            ...new Set([...(disorderTarget.disorders || []), consequences.disorderId])
          ];
          details.push(`${disorderTarget.name} gains ${disorders[consequences.disorderId]?.name || consequences.disorderId}`);
        }
      }
      if (consequences.panic) {
        const target = nextSurvivors.find(survivor => survivor.alive !== false);
        if (target) {
          target.permanentNegativeCards = [
            ...(target.permanentNegativeCards || []),
            ...Array(consequences.panic).fill(null).map(() => ({
              cardId: 'panic',
              sourceType: 'curse',
              reason: encounter.displayName
            }))
          ];
          details.push(`${target.name} gains ${consequences.panic} Panic`);
        } else if (consequences.populationLossIfNoSurvivor) {
          population = Math.max(0, population - consequences.populationLossIfNoSurvivor);
          details.push(`Population -${consequences.populationLossIfNoSurvivor}`);
        }
      }
      const historyEntry = {
        lanternYear: current.lanternYear,
        nemesisId: encounter.id,
        nemesisName: encounter.displayName,
        result: 'defeat',
        survivorUsed: runSurvivor.name,
        consequences: details,
        rewards: [],
        deaths: [runSurvivor.name],
        timestamp: new Date().toISOString()
      };
      const deathSettlement = queueDeathResolutions(current, [
        createDeathResolution(runSurvivor, {
          cause: encounter.displayName,
          lanternYear: current.lanternYear
        })
      ]);
      return {
        ...deathSettlement,
        population,
        memories: settlementMemory,
        settlementMemory,
        stash,
        builtInnovations,
        innovationDeckState,
        survivors: nextSurvivors,
        activeSurvivorId: nextSurvivors.find(survivor => survivor.alive !== false)?.id || null,
        deadSurvivors: current.deadSurvivors + 1,
        pendingNemesisEncounter: null,
        settlementHistory: [...current.settlementHistory, historyEntry],
        lastNemesisResult: {
          nemesisId: encounter.id,
          nemesisName: encounter.displayName,
          result: 'defeat',
          survivorName: runSurvivor.name,
          text: encounter.defeatText,
          details,
          deathSummary
        }
      };
    });
    const result = {
      nemesisId: encounter.id,
      nemesisName: encounter.displayName,
      result: 'defeat',
      survivorName: runSurvivor.name,
      text: encounter.defeatText,
      details,
      deathSummary
    };
    setRunSummary(deathSummary);
    setNemesisResult(result);
    setScreen('nemesisResult');
  };

  const handleCreateSurvivor = (name, gender, options) => {
    updateSettlement(current => {
      const survivor = createSurvivor(name, gender, {
        ...options,
        generationType: 'founder'
      });
      let nextSurvivor = survivor;
      if (options?.useSpecialTrait && current.pendingSpecialChildTrait) {
        nextSurvivor = applyChildTrait(nextSurvivor, current.pendingSpecialChildTrait);
      }
      if (
        options?.startingTrait &&
        startingTraits[options.startingTrait] &&
        current.builtMemoryInnovations.includes('trialNames')
      ) {
        nextSurvivor.traits.push(options.startingTrait);
      }
      nextSurvivor = applyNewSurvivorSettlementBonuses(nextSurvivor, current);
      return {
        ...current,
        survivors: [...current.survivors, nextSurvivor],
        activeSurvivorId: current.activeSurvivorId || nextSurvivor.id,
        pendingSpecialChildTrait: options?.useSpecialTrait ? null : current.pendingSpecialChildTrait
      };
    });
  };

  const handleAttemptIntimacy = (maleId, femaleId, options = {}) => {
    updateSettlement(current => {
      if (current.lastIntimacyLanternYear === current.lanternYear) return current;
      if (current.pendingNewborn) return current;
      const male = current.survivors.find(survivor => survivor.id === maleId && survivor.alive !== false && survivor.gender === 'male');
      const female = current.survivors.find(survivor => survivor.id === femaleId && survivor.alive !== false && survivor.gender === 'female');
      if (!male || !female || current.population <= 0) return current;
      const memorySettlement = options.mitigateRisk
        ? spendMemories(current, 1, {
          source: 'intimacy-mitigation',
          description: 'Reduced intimacy tragedy risk.',
          survivorIds: [male.id, female.id]
        })
        : current;
      if (!memorySettlement) return current;
      const loveJuiceProtected = Boolean(options.useLoveJuice);
      const protectedSettlement = loveJuiceProtected
        ? spendLoveJuiceForIntimacy(memorySettlement)
        : memorySettlement;
      if (!protectedSettlement) return current;

      const projections = calculateIntimacyProjections(protectedSettlement, innovationCards, {
        participants: [male, female],
        mitigateRisk: options.mitigateRisk,
        loveJuiceSelected: loveJuiceProtected
      });
      const tragedyChance = projections.finalTragedyChance;
      const roll = Math.random();

      let populationChange = 0;
      let outcome = 'No birth.';
      let deathId = null;
      let severeWoundId = null;
      let pendingSpecialChildTrait = current.pendingSpecialChildTrait;
      let pendingNewborn = current.pendingNewborn;
      let finalRollValue = Math.floor(roll * 10) + 1; // For history display

      const loveJuiceProtectionApplied = shouldLoveJuiceProtectIntimacy({
        roll,
        tragedyChance,
        loveJuiceSelected: loveJuiceProtected
      });

      if (loveJuiceProtectionApplied) {
        outcome = 'Love Juice protected the participants from intimacy tragedy. No birth.';
      } else if (roll < tragedyChance) {
        // Tragedy / Wound
        if (Math.random() < 0.5) {
          deathId = Math.random() < 0.5 ? male.id : female.id;
          populationChange = -1;
          outcome = 'Tragedy struck during intimacy.';
        } else {
          severeWoundId = Math.random() < 0.5 ? male.id : female.id;
          outcome = 'A participant survived with a severe wound.';
        }
      } else if (roll >= 1 - projections.finalSuccessChance) {
        // Success
        const successRoll = Math.random();
        const innateTraitIds = current.pendingSpecialChildTrait
          ? [normalizeChildTraitId(current.pendingSpecialChildTrait)]
          : [];
        if (successRoll < 0.2) {
          populationChange = 2;
          outcome = 'Twins were born. Population increased by 2.';
        } else if (successRoll < 0.4) {
          populationChange = 1;
          pendingSpecialChildTrait =
            childTraitList[Math.floor(Math.random() * childTraitList.length)].id;
          innateTraitIds.push(normalizeChildTraitId(pendingSpecialChildTrait));
          outcome = 'A special child was born. Population increased by 1.';
        } else {
          populationChange = 1;
          outcome = 'New life. Population increased by 1.';
        }
        pendingNewborn = createPendingNewborn(male, female, {
          primaryParent: female,
          innateTraitIds,
          birthLanternYear: current.lanternYear,
          remainingBirths: populationChange
        });
        pendingSpecialChildTrait = null;
        outcome += populationChange > 1
          ? ' Name each newborn before they join the roster.'
          : ' Name the newborn before they join the roster.';
      }

      const deathSurvivor = current.survivors.find(survivor => survivor.id === deathId);
      const gearLost = deathSurvivor?.boundGear || [];
      const nextSurvivors = current.survivors.map(survivor => {
        if (survivor.id === deathId) return { ...survivor, alive: false, hp: 0, boundGear: [] };
        if (survivor.id === severeWoundId) {
          return {
            ...survivor,
            hp: 1,
            injuries: [...new Set([...(survivor.injuries || []), 'brokenArm'])]
          };
        }
        return survivor;
      });
      const nextLiving = nextSurvivors.filter(survivor => survivor.alive !== false);
      const historyEntry = {
        timestamp: new Date().toISOString(),
        lanternYear: current.lanternYear,
        participantIds: [male.id, female.id],
        participantNames: [getSurvivorDisplayName(male), getSurvivorDisplayName(female)],
        newbornIds: pendingNewborn ? [pendingNewborn.id] : [],
        newbornNames: [],
        roll,
        outcome,
        populationChange,
        memoryAwarded: 0,
        memorySpentOnMitigation: options.mitigateRisk ? 1 : 0,
        loveJuiceUsed: loveJuiceProtected,
        loveJuiceProtectionApplied,
        deathName: deathSurvivor?.name || null
      };
      if (pendingNewborn) pendingNewborn.historyTimestamp = historyEntry.timestamp;
      const resolvedSettlement = deathSurvivor
        ? queueDeathResolutions(memorySettlement, [
          createDeathResolution(deathSurvivor, {
            cause: 'Intimacy tragedy',
            lanternYear: current.lanternYear
          })
        ])
        : protectedSettlement;

      return {
        ...resolvedSettlement,
        population: Math.max(0, current.population + populationChange),
        deadSurvivors: current.deadSurvivors + (deathId ? 1 : 0),
        survivors: nextSurvivors,
        activeSurvivorId: deathId === current.activeSurvivorId
          ? nextLiving[0]?.id || null
          : current.activeSurvivorId,
        graveHistory: deathSurvivor ? [{
          survivorName: deathSurvivor.name,
          killedBy: 'Intimacy tragedy',
          completedRuns: deathSurvivor.completedRuns || 0,
          traits: deathSurvivor.traits || [],
          fightingArts: deathSurvivor.fightingArts || [],
          weaponProficiency: deathSurvivor.weaponProficiency || {},
          proficientWeaponTypes: getProficientWeaponSummary(deathSurvivor.weaponProficiency),
          masteredWeaponTypes: getProficientWeaponSummary(deathSurvivor.weaponProficiency)
            .filter(item => item.mastered),
          injuries: deathSurvivor.injuries || [],
          scars: deathSurvivor.scars || [],
          disorders: deathSurvivor.disorders || [],
          gearLostCount: gearLost.length,
          gearLostNames: gearLost.map(gear => getEquipmentDisplayName(gear.equipmentId)),
          timestamp: historyEntry.timestamp
        }, ...current.graveHistory] : current.graveHistory,
        lastIntimacyLanternYear: current.lanternYear,
        intimacyHistory: [historyEntry, ...current.intimacyHistory],
        pendingNewborn,
        pendingSpecialChildTrait
      };
    });
  };

  const handleConfirmNewborn = details => {
    updateSettlement(current => {
      const pending = current.pendingNewborn;
      if (!pending) return current;
      const firstName = details.firstName?.trim();
      const familyName = details.familyName?.trim();
      if (!firstName || !familyName) return current;

      const selectedBirthTraits = [...new Set(details.purchasedBirthTraits || [])]
        .map(id => birthTraitOptions.find(option => option.id === id))
        .filter(option =>
          option &&
          (
            !option.mechanicalEffect?.childTraitId ||
            !pending.innateTraitIds.includes(option.mechanicalEffect.childTraitId)
          )
        );
      const memoryCost = getBirthTraitCost(selectedBirthTraits.map(trait => trait.id));
      const paidSettlement = memoryCost
        ? spendMemories(current, memoryCost, {
          source: 'newborn-traits',
          description: `Birth traits were chosen for ${firstName} ${familyName}.`,
          survivorIds: pending.parentIds
        })
        : current;
      if (!paidSettlement) return current;

      const parents = pending.parentIds
        .map(parentId => current.survivors.find(survivor => survivor.id === parentId))
        .filter(Boolean);
      let newborn = createSurvivor(`${firstName} ${familyName}`, details.gender, {
        firstName,
        familyName,
        appearance: details.appearance,
        generationType: 'born',
        generation: pending.generation,
        parentIds: pending.parentIds,
        parentNames: pending.parentNames,
        birthLanternYear: pending.birthLanternYear,
        bornFromIntimacy: true,
        innateTraits: pending.innateTraitIds,
        purchasedBirthTraits: selectedBirthTraits.map(trait => trait.id),
        memorySpentAtBirth: memoryCost,
        familyOrigin: parents.some(parent => parent.familyName === familyName)
          ? `Inherited from ${getSurvivorDisplayName(
            parents.find(parent => parent.familyName === familyName)
          )}`
          : `Founded by the child of ${pending.parentNames.join(' and ')}`
      });
      newborn.id = pending.id;
      pending.innateTraitIds.forEach(traitId => {
        newborn = applyChildTrait(newborn, traitId);
      });
      selectedBirthTraits.forEach(option => {
        const effect = option.mechanicalEffect || {};
        if (effect.startingSurvival) newborn.survival += effect.startingSurvival;
        if (effect.childTraitId) {
          newborn = applyChildTrait(newborn, effect.childTraitId, false);
        }
        if (effect.startingTraitId && startingTraits[effect.startingTraitId]) {
          newborn.traits = [...new Set([...newborn.traits, effect.startingTraitId])];
        }
        if (effect.familyLesson) {
          newborn.history = [
            ...newborn.history,
            `Family lesson inherited from ${pending.parentNames.join(' and ')}.`
          ];
        }
      });

      if (current.innovationDeckState.builtInnovationIds.includes('trialNames')) {
        const traitIds = Object.keys(startingTraits);
        const traitId = traitIds[Math.floor(Math.random() * traitIds.length)];
        const fightingArt = generalFightingArts[
          Math.floor(Math.random() * generalFightingArts.length)
        ];
        if (traitId) newborn.traits = [...new Set([...newborn.traits, traitId])];
        if (fightingArt) {
          newborn = learnFightingArt(newborn, fightingArt.id, 'Trial Names birth teaching');
        }
      }
      newborn = applyNewSurvivorSettlementBonuses(newborn, current);

      const remainingBirths = pending.remainingBirths - 1;
      let nextPending = null;
      if (remainingBirths > 0) {
        nextPending = createPendingNewborn(parents[0], parents[1], {
          primaryParent: parents[1],
          innateTraitIds: pending.innateTraitIds,
          birthLanternYear: pending.birthLanternYear,
          remainingBirths,
          historyTimestamp: pending.historyTimestamp
        });
      }

      return {
        ...paidSettlement,
        survivors: [...current.survivors, newborn],
        activeSurvivorId: current.activeSurvivorId || newborn.id,
        pendingNewborn: nextPending,
        intimacyHistory: current.intimacyHistory.map(entry =>
          entry.timestamp === pending.historyTimestamp
            ? {
              ...entry,
              newbornIds: [...new Set([...(entry.newbornIds || []), newborn.id])],
              newbornNames: [...(entry.newbornNames || []), getSurvivorDisplayName(newborn)]
            }
            : entry
        )
      };
    });
  };

  const handleResolveDeath = (resolutionId, choice, resourceId) => {
    updateSettlement(current =>
      resolveDeathMemoryChoice(current, resolutionId, choice, resourceId)
    );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'title':
        return (
          <TitleScreen
            key={slotVersion}
            slots={listSaveSlots()}
            onLoad={handleLoad}
            onNew={slotId => { setCreateSlot(slotId); setScreen('createSettlement'); }}
            onDelete={handleDelete}
          />
        );
      case 'createSettlement':
        return <CreateSettlementScreen slotId={createSlot} onCreate={handleCreate} onCancel={showTitle} />;
      case 'settlement':
        return settlement ? (
          <SettlementScreen
            settlement={settlement}
            activeSlot={activeSlot}
            selectedQuarry={selectedQuarry}
            selectedLevel={selectedLevel}
            onSelectQuarry={quarryId => { setSelectedQuarry(quarryId); setSelectedLevel(1); }}
            onSelectLevel={setSelectedLevel}
            onBeginHunt={() => settlement.activeSurvivorId && prepareHunt(settlement.activeSurvivorId)}
            onBuild={handleBuild}
            onCraft={handleCraft}
            onAttemptInnovation={handleAttemptInnovation}
            onTimelineChoice={handleTimelineChoice}
            onCreateSurvivor={handleCreateSurvivor}
            onSelectSurvivor={survivorId => updateSettlement(current => ({ ...current, activeSurvivorId: survivorId }))}
            onStartHunt={prepareHunt}
            onAttemptIntimacy={handleAttemptIntimacy}
            onConfirmNewborn={handleConfirmNewborn}
            onResolveDeath={handleResolveDeath}
            onRestSurvivor={handleRestSurvivor}
            onTreatInjury={handleTreatInjury}
            onForgetCard={handleForgetCard}
            onMemoryCardRemoval={handleMemoryCardRemoval}
            onWeaponDrill={handleWeaponDrill}
            onMemoryTraining={handleMemoryTraining}
            onPainLesson={handlePainLesson}
            onShrineOfNames={handleShrineOfNames}
            onOpenPrincipleChoice={() => setScreen('principleChoice')}
            onReturnToTitle={showTitle}
          />
        ) : <TitleScreen slots={listSaveSlots()} onLoad={handleLoad} onNew={() => {}} onDelete={handleDelete} />;
      case 'principleChoice':
        return settlement ? (
          <PrincipleChoiceScreen
            pendingChoice={settlement.pendingPrincipleChoice}
            onChoose={handleChooseCampaignPrinciple}
            onCancel={() => setScreen('settlement')}
          />
        ) : <TitleScreen slots={listSaveSlots()} onLoad={handleLoad} onNew={() => {}} onDelete={handleDelete} />;
      case 'partySelection':
        return (
          <PartySelectionScreen
            settlement={settlement}
            selectedIds={selectedPartyIds}
            quarryId={selectedQuarry}
            onToggle={survivorId => setSelectedPartyIds(current => current.includes(survivorId)
              ? current.filter(id => id !== survivorId)
              : current.length < settlement.maxHuntPartySize
                ? [...current, survivorId]
                : current)}
            onContinue={() => {
              const firstId = selectedPartyIds[0];
              if (!firstId) return;
              setLoadoutPartyIndex(0);
              updateSettlement(current => ({ ...current, activeSurvivorId: firstId }));
              setScreen('loadout');
            }}
            onBack={() => setScreen('settlement')}
          />
        );
      case 'loadout': {
        const survivor = settlement.survivors.find(item => item.id === settlement.activeSurvivorId);
        const isNemesisLoadout = Boolean(settlement.pendingNemesisEncounter);
        return (
          <LoadoutScreen
            survivor={survivor}
            armory={settlement.armory}
            equipLimit={settlement.builtInnovations.includes('armoryRack') ? 5 : 4}
            onConfirm={handleConfirmLoadout}
            onDestroyBoundGear={handleDestroyBoundGear}
            onAddTestResources={handleAddTestGearResources}
            confirmLabel={isNemesisLoadout ? 'Confirm Loadout and Face Nemesis' : undefined}
            onBack={() => setScreen(isNemesisLoadout ? 'nemesisPreparation' : 'partySelection')}
          />
        );
      }
      case 'nemesisLore': {
        const pending = settlement.pendingNemesisEncounter;
        const encounter = nemesisEncounters[pending?.nemesisId];
        return encounter ? (
          <NemesisLorePopup
            encounter={encounter}
            lanternYear={pending.lanternYear}
            seen={settlement.seenNemesisLoreIds.includes(encounter.id)}
            onContinue={continueNemesisLore}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing nemesis lore data"
            onRecover={returnToSettlementSafely}
          />
        );
      }
      case 'nemesisWarning': {
        const pending = settlement.pendingNemesisEncounter;
        const encounter = nemesisEncounters[pending?.nemesisId];
        return encounter ? (
          <NemesisWarningScreen
            encounter={encounter}
            lanternYear={pending.lanternYear}
            onPrepare={beginNemesisPreparation}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing nemesis warning data"
            onRecover={returnToSettlementSafely}
          />
        );
      }
      case 'nemesisPreparation': {
        const pending = settlement.pendingNemesisEncounter;
        const encounter = nemesisEncounters[pending?.nemesisId];
        return encounter ? (
          <NemesisPreparationScreen
            encounter={encounter}
            settlement={settlement}
            selectedSurvivorId={pending.selectedSurvivorId}
            onSelectSurvivor={selectNemesisSurvivor}
            onSpendMemory={spendNemesisMemory}
            onHeal={healNemesisSurvivor}
            onContinue={prepareNemesisLoadout}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing nemesis preparation data"
            onRecover={returnToSettlementSafely}
          />
        );
      }
      case 'nemesisCombat': {
        const pending = settlement.pendingNemesisEncounter;
        const monster = createNemesisMonster(pending?.nemesisId);
        return monster ? (
          <CombatScreen
            key={`${pending.nemesisId}-${pending.lanternYear}-${runSurvivor?.id}`}
            monster={monster}
            runBonus={combatBonus}
            equippedGear={runEquippedGear}
            hasMonsterBane={Boolean(
              runSurvivor?.fightingArts?.includes(getMonsterBaneId(pending.nemesisId))
            )}
            victoryButtonText="Resolve Nemesis Victory"
            defeatButtonText="Resolve Settlement Defeat"
            onVictory={finishNemesisVictory}
            onDefeat={finishNemesisDefeat}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing nemesis combat data"
            onRecover={returnToSettlementSafely}
          />
        );
      }
      case 'nemesisResult':
        return nemesisResult ? (
          <NemesisResultScreen
            result={nemesisResult}
            onChooseReward={handleNemesisRewardChoice}
            onContinue={() => {
              if (nemesisResult.deathSummary) setScreen('graveLegacy');
              else {
                setNemesisResult(null);
                setScreen('settlement');
              }
            }}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing nemesis result data"
            onRecover={returnToSettlementSafely}
          />
        );
      case 'innovationDraw':
        return (
          <InnovationDrawScreen
            cards={innovationDraw.map(id => innovationCards[id]).filter(Boolean)}
            paidResources={innovationPayment}
            appliedCard={innovationCards[appliedInnovationId] || null}
            onChoose={handleChooseInnovation}
            onContinue={() => {
              updateSettlement(current => ({
                ...current,
                pendingInnovationTutorialId: null
              }));
              setInnovationDraw([]);
              setInnovationPayment(null);
              setAppliedInnovationId(null);
              setScreen('settlement');
            }}
          />
        );
      case 'innovationPayment':
        return (
          <InnovationPaymentScreen
            settlement={settlement}
            onConfirm={handleConfirmInnovationPayment}
            onCancel={() => {
              setInnovationPayment(null);
              setScreen('settlement');
            }}
          />
        );
      case 'quarrySelection':
        return (
          <QuarrySelectionScreen
            settlement={settlement}
            selectedQuarry={selectedQuarry}
            selectedLevel={selectedLevel}
            onSelectQuarry={quarryId => { setSelectedQuarry(quarryId); setSelectedLevel(1); }}
            onSelectLevel={setSelectedLevel}
            onStart={startRun}
            onBack={() => setScreen('partySelection')}
            partySize={selectedPartyIds.length}
            scaledHp={createScaledMonster(
              selectedQuarry,
              selectedLevel,
              'fight',
              Math.max(1, selectedPartyIds.length)
            ).maxHp}
          />
        );
      case 'map':
        return (
          <MapScreen
            map={runMap}
            onSelectNode={selectNode}
            onRetreat={handleRetreat}
            resources={runResources.map(id => resourceData[id]?.name || id)}
          />
        );
      case 'retreatResult':
        return retreatResult ? (
          <RetreatResultScreen
            result={retreatResult}
            settlement={settlement}
            onContinue={finishRetreat}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing retreat result"
            onRecover={returnToSettlementSafely}
          />
        );
      case 'combat':
        return (
          <PartyCombatScreen
            key={currentNode?.id}
            monster={createScaledMonster(
              selectedQuarry,
              selectedLevel,
              currentNode?.type,
              runParty.filter(survivor => survivor.hp > 0).length
            )}
            partyBonuses={partyCombatBonuses}
            pendingPartyEffects={pendingPartyEffects}
            hasMonsterBane={Boolean(
              runParty.some(survivor =>
                survivor.hp > 0 && survivor.fightingArts?.includes(getMonsterBaneId(selectedQuarry))
              )
            )}
            onVictory={handleCombatVictory}
            onDefeat={handleCombatDefeat}
          />
        );
      case 'lootReward':
        return (
          <LootRewardScreen
            quarryName={quarries[selectedQuarry]?.name}
            level={selectedLevel}
            choices={lootChoices}
            genericRewards={bossGenericRewards}
            bossReward={pendingCombatVictory?.isBoss}
            brokenWeakPoints={pendingCombatVictory?.brokenWeakPoints || []}
            wounds={pendingCombatVictory?.wounds || []}
            extraSelections={pendingCombatVictory?.extraLootSelections || 0}
            onChoose={handleLootChoice}
          />
        );
      case 'resource':
        return (
          <section className="placeholder-screen">
            <p className="eyebrow">Scavenged Remains</p>
            <h2>Resource Found</h2>
            <p>You recover one <strong>{resourceReward?.name}</strong>.</p>
            <button type="button" onClick={completeResourceNode}>Take Resource</button>
          </section>
        );
      case 'event':
        return currentEvent ? (
          <EventScreen
            event={currentEvent}
            hasParanoia={
              runModifiers.nextEventWarning || (
                !runEventWarningUsed && (
                runSurvivor?.disorders?.includes('paranoia') ||
                runSurvivor?.traits?.includes('watchful')
                )
              )
            }
            onChoose={handleEventChoice}
            onContinue={completeCurrentNode}
            runParty={runParty}
            settlement={settlement}
            selectedQuarry={selectedQuarry}
          />
        ) : null;
      case 'rest':
        return (
          <RestStopScreen
            settlement={settlement}
            party={runParty}
            activeSurvivor={runSurvivor}
            onChoose={handleRestChoice}
            result={restResult}
            onContinue={handleRestContinue}
          />
        );
      case 'survivorProgress':
        {
          const rewardSurvivorId = survivorRewardQueue[0] || runSummary?.survivorId;
          const rewardSurvivor = settlement.survivors.find(item => item.id === rewardSurvivorId);
        return (
          <SurvivorProgressScreen
            key={rewardSurvivorId}
            survivorName={rewardSurvivor?.name || runSummary?.survivorName}
            survivor={rewardSurvivor}
            quarryId={selectedQuarry}
            level={selectedLevel}
            offerBane={typeof progressOfferBane === 'object'
              ? Boolean(progressOfferBane[rewardSurvivorId])
              : progressOfferBane}
            oralTradition={
              settlement.builtMemoryInnovations.includes('oralTradition') ||
              settlement.innovationDeckState.builtInnovationIds.includes('oralTradition') ||
              settlement.innovationDeckState.builtInnovationIds.includes('symposium')
            }
            ownedArts={rewardSurvivor?.fightingArts || []}
            quarryRevealed={settlement.discoveredQuarries.includes(selectedQuarry)}
            onChoose={handleProgressChoice}
          />
        );
        }
      case 'monsterDiscovery': {
        const choices = getDiscoveryChoices(settlement, selectedQuarry);
        return (
          <MonsterDiscoveryScreen
            quarries={choices}
            storyText="The settlement understands this creature differently now. Its old rumours point toward a new horror."
            onChoose={handleMonsterDiscovery}
            onSkip={() => setScreen('runSummary')}
          />
        );
      }
      case 'quarryDiscoveryLore':
        return getQuarryDiscoveryEvent(pendingQuarryDiscoveryId) ? (
          <QuarryDiscoveryLoreScreen
            event={getQuarryDiscoveryEvent(pendingQuarryDiscoveryId)}
            onContinue={() => {
              setPendingQuarryDiscoveryId(null);
              setScreen('runSummary');
            }}
          />
        ) : (
          <InvalidPhaseScreen
            reason="missing quarry discovery data"
            onRecover={returnToSettlementSafely}
          />
        );
      case 'runSummary':
        return <RunSummaryScreen summary={runSummary} onContinue={continueFromSummary} />;
      case 'graveLegacy':
        return (
          <GraveLegacyScreen
            summary={runSummary}
            showAllChoices={settlement.builtMemoryInnovations.includes('deathArchive')}
            onChooseLegacy={legacy => {
              chooseGraveLegacy(legacy);
              setNemesisResult(null);
            }}
          />
        );
      default:
        return <div>Unknown Screen</div>;
    }
  };

  return (
    <div className="app">
      {screen !== 'title' && (
        <header className="app-title"><h1>Lantern Deckbuilder</h1></header>
      )}
      <main>{renderScreen()}</main>
    </div>
  );
}
