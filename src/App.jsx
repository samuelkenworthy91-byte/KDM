import React, { useEffect, useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { cards, starterCardIds, trainingCardIds } from './data/cards.js';
import { childTraitList, childTraits, normalizeChildTraitId } from './data/childTraits.js';
import { getCreatureBehaviour } from './data/creatureBehaviours.js';
import { equipment } from './data/equipment.js';
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
import { startingTraits } from './data/memoryInnovations.js';
import {
  getDrawableInnovationIds,
  innovationCards,
  QUARRY_INNOVATION_POOL
} from './data/innovationCards.js';
import {
  calculateAvailableQuarryTiers,
  getCreatureSpecificLootChoices,
  getDiscoveryChoices,
  getHighestDefeatedQuarryLevel,
  hasDefeatedQuarryLevel,
  normalizeDefeatedQuarryLevels,
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
import { addWeaponProficiencyXp, getProficientWeaponSummary } from './data/weaponProficiency.js';
import { genericResourceIds, resources as resourceData } from './data/resources.js';
import { getQuarryDiscoveryEvent } from './data/quarryDiscoveryEvents.js';
import { createMonsterWeakPoints, getBrokenWeakPointRewards } from './data/weakPoints.js';
import { treatWound } from './data/woundTables.js';
import { addResources, canAffordCost, deductCost } from './game/craftingLogic.js';
import {
  addUniqueCondition,
  getConditionName,
  rollBossScar,
  rollLowHpCondition
} from './game/conditionLogic.js';
import { resolveEvent } from './game/eventLogic.js';
import { buildRunDeck, getCardsFromIds, getPersonalCardId } from './game/deckLogic.js';
import { isMemoryInnovationUnlocked } from './game/memoryInnovationLogic.js';
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
import { addPersonalCard, learnFightingArt } from './game/survivorProgression.js';
import CombatScreen from './screens/CombatScreen.jsx';
import PartyCombatScreen from './screens/PartyCombatScreen.jsx';
import CreateSettlementScreen from './screens/CreateSettlementScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import LootRewardScreen from './screens/LootRewardScreen.jsx';
import InnovationDrawScreen from './screens/InnovationDrawScreen.jsx';
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
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';
import SurvivorProgressScreen from './screens/SurvivorProgressScreen.jsx';
import TitleScreen from './screens/TitleScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];
const DEADLY_EVENT_IDS = new Set(['strangeCarcass', 'blackRain', 'woundedBeast', 'lanternStorm']);

validateQuarryContent();

function chooseHuntEvent(level) {
  const deadlyEvents = events.filter(event => DEADLY_EVENT_IDS.has(event.id));
  const saferEvents = events.filter(event => !DEADLY_EVENT_IDS.has(event.id));
  const deadlyChance = level === 3 ? 0.6 : level === 2 ? 0.4 : 0.2;
  const pool = Math.random() < deadlyChance ? deadlyEvents : saferEvents;
  return pool[Math.floor(Math.random() * pool.length)];
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
    const targetingRule = intent.targetingRule ||
      (level >= 3 && intent.tags?.includes('dangerous') ? 'lowestHp'
        : level >= 2 && intent.tags?.includes('precision') ? 'mostBlock'
          : intent.tags?.includes('wild') ? 'random' : 'front');
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
  const initialSlot = getActiveSlot();
  const initialSettlement = loadSettlement(initialSlot);
  const [screen, setScreen] = useState('title');
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
  const [innovationPayment, setInnovationPayment] = useState([]);
  const [appliedInnovationId, setAppliedInnovationId] = useState(null);
  const [runEventWarningUsed, setRunEventWarningUsed] = useState(false);
  const [runConditionGains, setRunConditionGains] = useState({
    injuries: [],
    scars: [],
    disorders: []
  });
  const [nemesisResult, setNemesisResult] = useState(null);
  const [pendingQuarryDiscoveryId, setPendingQuarryDiscoveryId] = useState(null);

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
    setSelectedQuarry('paleHuntLion');
    setSelectedLevel(1);
    setScreen('settlement');
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
    if (slotId === activeSlot) setSettlement(null);
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
      hp: survivor.injuries?.includes('deepCut') ? Math.max(1, survivor.hp - 1) : survivor.hp
    }));
    const partyDecks = huntParty.map(survivor => {
      const equippedGear = (survivor.boundGear || []).map(gear => equipment[gear.equipmentId]).filter(Boolean);
      const deck = buildRunDeck({ survivor, equippedGear });
      if (equippedGear.some(item => item.id === 'predatorMask') && !(survivor.scars || []).length) {
        deck.push(...getCardsFromIds(['panic'], 'Predator Mask'));
      }
      if (survivor.disorders?.includes('nightTerrors')) {
        deck.push(...getCardsFromIds(['panic'], 'Night Terrors'));
      }
      return deck;
    });
    const equippedGear = (activeSurvivor.boundGear || []).map(gear => equipment[gear.equipmentId]).filter(Boolean);
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
    setCurrentNode(null);
    setRunResources(startingResources);
    setRunSurvivor(huntSurvivor);
    setRunParty(huntParty);
    setRunEquippedGear(equippedGear.map(item => item.id));
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
      const equipped = (nodeSurvivor.boundGear || []).map(gear => equipment[gear.equipmentId]).filter(Boolean);
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
        monsterEnrage: runModifiers.monsterEnrage || 0,
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
      setRunModifiers({});
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
        updateSettlement(current => ({
          ...current,
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
                equipment[gear.equipmentId]?.name || gear.equipmentId),
              rewardsMissed: true,
              timestamp: new Date().toISOString()
            })),
            ...current.graveHistory
          ]
        }));
      }
      setRunParty(living);
      setRunSurvivor(living[0]);
      const isBoss = currentNode?.type === 'boss';
      setBossGenericRewards(isBoss ? rollTierGenericBossRewards(selectedQuarry, selectedLevel) : []);
      setPendingCombatVictory({
        isBoss,
        survivors: living,
        brokenWeakPoints,
        harvestResults,
        wounds: combatResult.wounds || []
      });
      setLootChoices(getCreatureSpecificLootChoices(
        selectedQuarry,
        selectedLevel,
        harvestResults
      ));
      setScreen('lootReward');
      return;
    }
    let survivorAfterCombat = {
      ...runSurvivor,
      hp: combatResult?.survivor?.hp ?? runSurvivor.hp,
      survival: combatResult?.survivor?.survival ?? runSurvivor.survival,
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
    const genericRewards = isBoss
      ? rollTierGenericBossRewards(selectedQuarry, selectedLevel)
      : [];
    setBossGenericRewards(genericRewards);
    setPendingCombatVictory({
      isBoss,
      survivor: survivorAfterCombat
    });
    setLootChoices(
      getCreatureSpecificLootChoices(selectedQuarry, selectedLevel)
    );
    setScreen('lootReward');
  };

  const finishBossVictory = (selectedResources, survivorAfterFight) => {
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
      settlementMemoryEarned: progress.nodesCompleted,
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
      quarryUnlockTriggered
    };

    setRunMap(completedMap);
    setRunResources(allRewards);
    setRunSummary(summary);
    updateSettlement(current => {
      const nextYear = (current.lanternYear || 0) + 1;
      const next = {
      ...current,
      settlementMemory: (current.settlementMemory || 0) + summary.settlementMemoryEarned,
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
        ? {
          ...survivor,
          hp: healedSurvivorHp,
          survival: survivor.survival,
          traits: survivorAfterFight.traits,
          fightingArts: survivorAfterFight.fightingArts,
          deckAdditions: [],
          personalDeckAdditions: survivorAfterFight.personalDeckAdditions || [],
          injuries: survivorAfterFight.injuries || [],
          scars: survivorAfterFight.scars || [],
          disorders: survivorAfterFight.disorders || [],
          permanentModifiers: survivorAfterFight.permanentModifiers || {},
          weaponProficiency: addWeaponProficiencyXp(
            survivorAfterFight.weaponProficiency,
            [activeProficiencyType]
          ),
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
          completedRuns: (survivor.completedRuns || 0) + 1
        }
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

  const finishPartyBossVictory = (selectedResources, survivingParty) => {
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
      settlementMemoryEarned: progress.nodesCompleted,
      resources: allRewards.map(id => resourceData[id]?.name || id),
      populationBefore: settlement.population,
      populationAfter: settlement.population,
      lanternYearBefore: settlement.lanternYear,
      lanternYearAfter: settlement.lanternYear + 1,
      quarryUnlockTriggered
    };

    setRunMap(completedMap);
    setRunResources(allRewards);
    setRunParty(healedParty);
    setRunSummary(summary);
    setSurvivorRewardQueue(healedParty.map(survivor => survivor.id));
    updateSettlement(current => {
      const nextYear = current.lanternYear + 1;
      const next = {
        ...current,
        settlementMemory: current.settlementMemory + progress.nodesCompleted,
        stash: addResources(current.stash, allRewards),
        totalRuns: current.totalRuns + 1,
        completedHunts: current.completedHunts + 1,
        lanternYear: nextYear,
        survivors: current.survivors.map(survivor => {
          const returning = healedParty.find(item => item.id === survivor.id);
          if (!returning) return survivor;
          const activeProficiencyType = returning.activeProficiencyType || 'fistAndTooth';
          return {
            ...survivor,
            ...returning,
            alive: true,
            weaponProficiency: addWeaponProficiencyXp(
              returning.weaponProficiency,
              [activeProficiencyType]
            ),
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
            completedRuns: (survivor.completedRuns || 0) + 1
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
        settlementMemoryEarned: progress.nodesCompleted,
        resources: runResources.map(id => resourceData[id]?.name || id),
        populationBefore: settlement.population,
        populationAfter: Math.max(0, settlement.population - fallen.length),
        lanternYearBefore: settlement.lanternYear,
        lanternYearAfter: settlement.lanternYear + 1
      };
      setRunSummary(summary);
      updateSettlement(current => {
        const nextYear = current.lanternYear + 1;
        const next = {
          ...current,
          population: Math.max(0, current.population - fallen.length),
          deadSurvivors: current.deadSurvivors + fallen.length,
          totalRuns: current.totalRuns + 1,
          lanternYear: nextYear,
          settlementMemory: current.settlementMemory + progress.nodesCompleted,
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
              killedBy: deathDetails.killedBy,
              quarryId: selectedQuarry,
              quarryLevel: selectedLevel,
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
                equipment[gear.equipmentId]?.name || gear.equipmentId),
              rewardsMissed: true,
              timestamp: new Date().toISOString()
            })),
            ...current.graveHistory
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
      gearLostNames: lostGear.map(gear => equipment[gear.equipmentId]?.name || gear.equipmentId),
      killedBy: deathDetails?.killedBy || 'unknownMonster',
      killedById: deathDetails?.killedById || 'unknownMonster',
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: progress.nodesCompleted,
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
      const next = {
      ...current,
      population: Math.max(0, (current.population || 0) - 1),
      deadSurvivors: (current.deadSurvivors || 0) + 1,
      totalRuns: (current.totalRuns || 0) + 1,
      lanternYear: nextYear,
      settlementMemory: (current.settlementMemory || 0) + summary.settlementMemoryEarned,
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
      )?.id || null
      };
      return applyLanternYearTimeline(next, nextYear);
    });
    setScreen('runSummary');
  };

  const returnToSettlement = () => {
    setCurrentNode(null);
    setCombatBonus({});
    setRunSummary(null);
    setRunConditionGains({ injuries: [], scars: [], disorders: [] });
    setSelectedLevel(Math.min(
      3,
      getHighestDefeatedQuarryLevel(settlement, selectedQuarry) + 1
    ));
    setScreen('settlement');
  };

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
      let settlementMemory = current.settlementMemory || 0;

      if (legacy.id === graveLegacies.rememberTechnique.id) settlementMemory += 1;
      else if (legacy.id === graveLegacies.buryGear.id) nextRunBonus.randomMonsterPart = true;
      else if (legacy.id === graveLegacies.studyDeath.id) monsterKnowledge[killedById] = (monsterKnowledge[killedById] || 0) + 1;
      else if (legacy.id === graveLegacies.inheritScar.id) nextRunBonus.extraMaxHp = (nextRunBonus.extraMaxHp || 0) + 1;
      else if (legacy.id === graveLegacies.oathOfVengeance.id) nextRunBonus.firstCombatStrength = (nextRunBonus.firstCombatStrength || 0) + 1;
      if (current.innovationDeckState.builtInnovationIds.includes('graves')) {
        settlementMemory += 1;
      }

      return {
        ...current,
        settlementMemory,
        monsterKnowledge,
        nextRunBonus,
        graveHistory: [graveEntry, ...(current.graveHistory || [])]
      };
    });
    returnToSettlement();
  };

  const handleBuild = item => {
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
    if (!settlement.builtInnovations.includes(recipe.buildingId) || !canAffordCost(recipe.cost, settlement.stash)) return;
    updateSettlement(current => ({
      ...current,
      stash: deductCost(current.stash, recipe.cost),
      totalCraftedGear: (current.totalCraftedGear || 0) + 1,
      armory: [...current.armory, createGearInstance(recipe.id)]
    }));
  };

  const handleBuildMemoryInnovation = innovation => {
    updateSettlement(current => {
      if (current.builtMemoryInnovations.includes(innovation.id)) return current;
      if (!isMemoryInnovationUnlocked(innovation, current)) return current;
      if (current.settlementMemory < innovation.costMemory) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - innovation.costMemory,
        builtMemoryInnovations: [...current.builtMemoryInnovations, innovation.id]
      };
    });
  };

  const handleAttemptInnovation = () => {
    const highestQuarryLevel = Math.max(
      0,
      ...Object.values(normalizeDefeatedQuarryLevels(settlement.defeatedQuarryLevels))
        .map(levels => Math.max(0, ...levels))
    );
    const drawable = getDrawableInnovationIds(settlement.innovationDeckState).filter(id => {
      if (id === 'sharedBurden') {
        return settlement.innovationDeckState.builtInnovationIds.includes('trailSignals') &&
          (settlement.lanternYear >= 3 || highestQuarryLevel >= 2);
      }
      if (id === 'lanternProcession') {
        return settlement.innovationDeckState.builtInnovationIds.includes('sharedBurden') &&
          (settlement.lanternYear >= 6 || highestQuarryLevel >= 3);
      }
      return true;
    });
    const basicIds = ['bone', 'hide', 'sinew', 'organ', 'scrap', 'claw'];
    const availableResources = basicIds.flatMap(resourceId =>
      Array(settlement.stash[resourceId] || 0).fill(resourceId)
    );
    if (settlement.settlementMemory < 1 || availableResources.length < 3 || !drawable.length) {
      return;
    }
    const payment = availableResources.slice(0, 3);
    const choices = [...drawable].sort(() => Math.random() - 0.5).slice(0, 3);
    updateSettlement(current => {
      const stash = { ...current.stash };
      payment.forEach(resourceId => {
        stash[resourceId] = Math.max(0, (stash[resourceId] || 0) - 1);
      });
      return {
        ...current,
        settlementMemory: current.settlementMemory - 1,
        stash,
        innovationDeckState: {
          ...current.innovationDeckState,
          innovationHistory: [
            ...current.innovationDeckState.innovationHistory,
            {
              type: 'attempt',
              lanternYear: current.lanternYear,
              paidResources: payment,
              offeredIds: choices,
              timestamp: new Date().toISOString()
            }
          ]
        }
      };
    });
    setInnovationDraw(choices);
    setInnovationPayment(payment);
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
    updateSettlement(current => ({
      ...current,
      maxHuntPartySize: innovationId === 'trailSignals'
        ? Math.max(2, current.maxHuntPartySize)
        : innovationId === 'sharedBurden'
          ? Math.max(3, current.maxHuntPartySize)
          : innovationId === 'lanternProcession'
            ? 4
            : current.maxHuntPartySize,
      builtInnovations: [
        ...new Set([...current.builtInnovations, ...(card.unlocksBuildings || [])])
      ],
      builtMemoryInnovations: current.builtMemoryInnovations.includes(innovationId) ||
        !['riteOfForgetting', 'deathArchive', 'trialNames', 'painLessons', 'monsterStories',
          'quietNight', 'weaponDrills', 'taboo', 'shrineOfNames', 'huntSongs', 'oralTradition',
          'sharedWarnings'].includes(innovationId)
        ? current.builtMemoryInnovations
        : [...current.builtMemoryInnovations, innovationId],
      rumouredInnovations: [
        ...new Set([...current.rumouredInnovations, ...(card.unlocksBuildings || [])])
      ],
      innovationDeckState: {
        ...current.innovationDeckState,
        discoveredInnovationIds: [
          ...new Set([...current.innovationDeckState.discoveredInnovationIds, innovationId])
        ],
        builtInnovationIds: [
          ...new Set([...current.innovationDeckState.builtInnovationIds, innovationId])
        ],
        availableInnovationPoolIds: [
          ...new Set([
            ...current.innovationDeckState.availableInnovationPoolIds,
            ...(card.addsToInnovationPool || [])
          ])
        ],
        innovationHistory: [
          ...current.innovationDeckState.innovationHistory,
          {
            type: 'chosen',
            innovationId,
            lanternYear: current.lanternYear,
            timestamp: new Date().toISOString()
          }
        ]
      }
    }));
    setAppliedInnovationId(innovationId);
  };

  const forgetCardForSurvivor = (survivor, cardId, method, lanternYear) => {
    const cardName = cards[cardId]?.name || cardId;
    const wasStarterCard = starterCardIds.includes(cardId);
    const wasNegative = cardId === 'panic' ||
      cards[cardId]?.type === 'curse' ||
      (survivor.permanentNegativeCards || []).some(addition =>
        getPersonalCardId(addition) === cardId
      );
    return {
      ...survivor,
      forgottenCardIds: [...new Set([...(survivor.forgottenCardIds || []), cardId])],
      forgottenCardsLog: [
        ...(survivor.forgottenCardsLog || []),
        { cardId, cardName, lanternYear, method, wasStarterCard, wasNegative }
      ]
    };
  };

  const handleForgetCard = (survivorId, cardId) => {
    updateSettlement(current => {
      const survivor = current.survivors.find(item => item.id === survivorId);
      if (!current.builtMemoryInnovations.includes('riteOfForgetting')) return current;
      if (!survivor || survivor.lastForgetLanternYear === current.lanternYear) return current;
      if (!cardId || survivor.forgottenCardIds?.includes(cardId)) return current;
      const futureIds = [
        ...starterCardIds,
        ...(survivor.personalDeckAdditions || []).map(getPersonalCardId),
        ...(survivor.permanentNegativeCards || []).map(getPersonalCardId)
      ];
      if (!futureIds.includes(cardId) || cardId === 'panic' || cards[cardId]?.type === 'curse') {
        return current;
      }
      if (current.settlementMemory < 1) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - 1,
        survivors: current.survivors.map(item => item.id === survivorId
          ? {
            ...forgetCardForSurvivor(item, cardId, 'Rite of Forgetting', current.lanternYear),
            lastForgetLanternYear: current.lanternYear
          }
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
      if (cardId !== 'panic' || current.settlementMemory < config.cost) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - config.cost,
        memoryActionsUsedThisYear: {
          ...current.memoryActionsUsedThisYear,
          [actionId]: current.lanternYear
        },
        survivors: current.survivors.map(item => item.id === survivorId
          ? forgetCardForSurvivor(item, cardId, config.method, current.lanternYear)
          : item)
      };
    });
  };

  const handleWeaponDrill = (survivorId, cardId) => {
    updateSettlement(current => {
      if (!current.builtMemoryInnovations.includes('weaponDrills')) return current;
      if (current.memoryActionsUsedThisYear.weaponDrills === current.lanternYear) return current;
      if (!trainingCardIds.includes(cardId) || current.settlementMemory < 1) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - 1,
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
      if (current.settlementMemory < 2) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - 2,
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
      if ((current.settlementMemory || 0) < 1) return current;
      const survivor = current.survivors.find(item =>
        item.id === survivorId && item.alive !== false && (
          item.hp < item.maxHp ||
          Object.values(item.hitLocations || {}).some(wound => wound.wounded)
        )
      );
      if (!survivor) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - 1,
        survivors: current.survivors.map(item => {
          if (item.id !== survivorId) return item;
          const lightLocation = Object.entries(item.hitLocations || {})
            .find(([, wound]) => wound.wounded && !wound.severe)?.[0];
          const rested = lightLocation ? treatWound(item, lightLocation, 'rest') : item;
          return {
            ...rested,
            hp: Math.min(rested.maxHp, rested.hp + Math.ceil(rested.maxHp / 3))
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
        .map(gear => equipment[gear.equipmentId])
        .filter(Boolean);
      setRunSurvivor(preparedSurvivor);
      setRunEquippedGear(equipped.map(item => item.id));
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
    setRunModifiers(result.runModifiers);
    updateSettlement(current => ({
      ...current,
      settlementMemory: Math.max(0, current.settlementMemory + result.settlementMemoryDelta),
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
    }));
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

  const handleRestChoice = choiceId => {
    if (choiceId === 'bindWounds') {
      setRunSurvivor(current => {
        const lightLocation = Object.entries(current.hitLocations || {})
          .find(([, wound]) => wound.wounded && !wound.severe)?.[0];
        const rested = lightLocation ? treatWound(current, lightLocation, 'rest') : current;
        return {
          ...rested,
          hp: Math.min(
            rested.maxHp,
            rested.hp + Math.max(
              0,
              Math.ceil(rested.maxHp * 0.25) - (rested.injuries?.includes('twistedAnkle') ? 1 : 0)
            )
          )
        };
      });
      setRunParty(current => current.map(survivor => survivor.id === runSurvivor.id
        ? (() => {
          const lightLocation = Object.entries(survivor.hitLocations || {})
            .find(([, wound]) => wound.wounded && !wound.severe)?.[0];
          const rested = lightLocation ? treatWound(survivor, lightLocation, 'rest') : survivor;
          return {
            ...rested,
            hp: Math.min(
              rested.maxHp,
              rested.hp + Math.max(
                0,
                Math.ceil(rested.maxHp * 0.25) -
                  (rested.injuries?.includes('twistedAnkle') ? 1 : 0)
              )
            )
          };
        })()
        : survivor));
    } else if (choiceId === 'shareStories') {
      setRunSurvivor(current => ({
        ...current,
        survival: Math.min(current.maxSurvival || 3, (current.survival || 0) + 1)
      }));
      setRunParty(current => current.map(survivor => survivor.id === runSurvivor.id
        ? {
          ...survivor,
          survival: Math.min(survivor.maxSurvival || 3, (survivor.survival || 0) + 1)
        }
        : survivor));
    } else if (choiceId === 'sharpenGear') {
      setRunModifiers(current => ({ ...current, firstAttackBonus: (current.firstAttackBonus || 0) + 2 }));
    } else {
      setRunModifiers(current => ({ ...current, nextCombatStartBlock: (current.nextCombatStartBlock || 0) + 2 }));
    }
    completeCurrentNode();
  };

  const handleLootChoice = resourceIds => {
    const pending = pendingCombatVictory;
    setPendingCombatVictory(null);
    setLootChoices([]);
    if (pending?.isBoss) {
      if (pending.survivors) finishPartyBossVictory(resourceIds, pending.survivors);
      else finishBossVictory(resourceIds, pending.survivor);
      setBossGenericRewards([]);
      return;
    }
    const resourceId = Array.isArray(resourceIds) ? resourceIds[0] : resourceIds;
    setRunResources(items => [...items, resourceId]);
    completeCurrentNode();
  };

  const handleProgressChoice = (rewardId, offeredIds = []) => {
    const monsterReward = findMonsterSurvivorReward(rewardId);
    const reward = findSurvivorReward(rewardId);
    const rewardSurvivorId = survivorRewardQueue[0] || runSummary.survivorId;
    updateSettlement(current => ({
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
        if (rewardId === 'survival') {
          return {
            ...withHistory,
            survival: Math.min(survivor.maxSurvival || 3, (survivor.survival || 0) + 1)
          };
        }
        if (rewardId === 'strengthLesson') {
          return { ...withHistory, strength: (survivor.strength || 0) + 1 };
        }
        if (rewardId === 'hardenedBody') {
          return {
            ...withHistory,
            maxHp: (survivor.maxHp || 30) + 1,
            hp: Math.min((survivor.maxHp || 30) + 1, (survivor.hp || 0) + 1)
          };
        }
        if (rewardId === 'weaponPractice') {
          return {
            ...withHistory,
            weaponProficiency: addWeaponProficiencyXp(
              survivor.weaponProficiency,
              [survivor.activeProficiencyType || 'fistAndTooth']
            )
          };
        }
        if (monsterReward?.type === 'card') {
          return addPersonalCard(withHistory, rewardId, {
            sourceType: 'monsterReward',
            reason: `${quarries[selectedQuarry].name} Level ${selectedLevel}`
          });
        }
        if (monsterReward?.type === 'trait') {
          return {
            ...withHistory,
            traits: [...new Set([...(survivor.traits || []), rewardId])]
          };
        }
        if (cards[rewardId]?.sourceType === 'personal') {
          return addPersonalCard(withHistory, rewardId, {
            sourceType: 'personal',
            reason: 'Survivor victory'
          });
        }
        if (!fightingArts[rewardId]?.implemented) return withHistory;
        if (isMonsterBaneId(rewardId) && getSurvivorMonsterBaneId(survivor)) {
          return {
            ...withHistory,
            survival: Math.min(
              survivor.maxSurvival || 3,
              (survivor.survival || 0) + 1
            )
          };
        }
        return learnFightingArt(withHistory, rewardId, reward?.source || 'Survivor reward');
      })
    }));
    const remainingRewardQueue = survivorRewardQueue.slice(1);
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
      updateSettlement(current => ({
        ...current,
        settlementMemory: current.settlementMemory + 1
      }));
      setRunSummary(current => ({
        ...current,
        discoveryMessage: 'No new quarry rumours were found. The settlement gains 1 Memory instead.'
      }));
      setScreen('runSummary');
    }
  };

  const handleMonsterDiscovery = quarryId => {
    const quarry = quarries[quarryId];
    const discoveryEvent = getQuarryDiscoveryEvent(quarryId);
    if (!quarry || quarry.role !== 'quarry' || !quarry.huntable || !discoveryEvent) return;
    updateSettlement(current => {
      let settlementMemory = current.settlementMemory || 0;
      const stash = { ...current.stash };
      const nextRunBonus = { ...(current.nextRunBonus || {}) };
      const rumourTexts = [...(current.rumourTexts || [])];

      discoveryEvent.settlementEffects.forEach(effect => {
        if (effect.type === 'settlementMemory') settlementMemory += effect.amount;
        if (effect.type === 'resource' || effect.type === 'resourceOrMemory') {
          if (resourceData[effect.resourceId]) stash[effect.resourceId] = (stash[effect.resourceId] || 0) + effect.amount;
          else settlementMemory += effect.amount;
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
        settlementMemory,
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
      if (current.settlementMemory < 1 || current.pendingNemesisEncounter?.memorySpent) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - 1,
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
    const rewards = encounter.rewards || {};
    const details = [];
    if (rewards.settlementMemory) details.push(`+${rewards.settlementMemory} settlement Memory`);
    (rewards.resources || []).forEach(id => details.push(`+1 ${resourceData[id]?.name || id}`));
    (rewards.innovationIds || []).forEach(id => details.push(`Innovation added: ${innovationCards[id]?.name || id}`));
    if (rewards.survivorStrength) details.push(`${runSurvivor.name} gains +${rewards.survivorStrength} strength`);
    if (rewards.fightingArt) details.push(`${runSurvivor.name} learns a fighting art`);
    if (rewards.removePanic) details.push(`Remove ${rewards.removePanic} Panic from ${runSurvivor.name}`);
    const result = {
      nemesisId: encounter.id,
      nemesisName: encounter.displayName,
      result: 'victory',
      survivorName: runSurvivor.name,
      text: encounter.victoryText,
      details,
      deathSummary: null
    };
    updateSettlement(current => {
      const survivorAfter = combatResult?.survivor || runSurvivor;
      const randomArt = generalFightingArts.find(art =>
        !(runSurvivor.fightingArts || []).includes(art.id)
      );
      return {
        ...current,
        settlementMemory: current.settlementMemory + (rewards.settlementMemory || 0),
        stash: addResources(current.stash, rewards.resources || []),
        survivors: current.survivors.map(survivor => {
          if (survivor.id !== runSurvivor.id) return survivor;
          let permanentNegativeCards = survivor.permanentNegativeCards || [];
          if (rewards.removePanic) {
            let remaining = rewards.removePanic;
            permanentNegativeCards = permanentNegativeCards.filter(addition => {
              if (remaining > 0 && getPersonalCardId(addition) === 'panic') {
                remaining -= 1;
                return false;
              }
              return true;
            });
          }
          return {
            ...survivor,
            hp: survivorAfter.hp,
            survival: survivorAfter.survival,
            strength: (survivor.strength || 0) + (rewards.survivorStrength || 0),
            fightingArts: rewards.fightingArt && randomArt
              ? [...new Set([...survivor.fightingArts, randomArt.id])]
              : survivor.fightingArts,
            permanentNegativeCards
          };
        }),
        innovationDeckState: {
          ...current.innovationDeckState,
          availableInnovationPoolIds: [
            ...new Set([
              ...current.innovationDeckState.availableInnovationPoolIds,
              ...(rewards.innovationIds || [])
            ])
          ]
        },
        pendingNemesisEncounter: null,
        lastNemesisResult: result,
        settlementHistory: [...current.settlementHistory, {
          lanternYear: current.lanternYear,
          nemesisId: encounter.id,
          nemesisName: encounter.displayName,
          result: 'victory',
          survivorUsed: runSurvivor.name,
          consequences: [],
          rewards: details,
          deaths: [],
          timestamp: new Date().toISOString()
        }]
      };
    });
    setNemesisResult(result);
    setScreen('nemesisResult');
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
      gearLostNames: lostGear.map(gear => equipment[gear.equipmentId]?.name || gear.equipmentId),
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
          details.push(`Settlement Memory -${loss}`);
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
          details.push(`Settlement Memory -${loss}`);
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
      return {
        ...current,
        population,
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
      const survivor = createSurvivor(name, gender, options);
      if (options?.useSpecialTrait && current.pendingSpecialChildTrait) {
        const traitId = normalizeChildTraitId(current.pendingSpecialChildTrait);
        const trait = childTraits[traitId];
        if (trait) {
          survivor.traits.push(traitId);
          survivor.survival += trait.mechanicalEffect.startingSurvival || 0;
          if (trait.mechanicalEffect.maxHp) {
            survivor.maxHp += trait.mechanicalEffect.maxHp;
            survivor.hp += trait.mechanicalEffect.maxHp;
          }
          survivor.strength += trait.mechanicalEffect.strength || 0;
          if (trait.mechanicalEffect.permanentPanic) {
            survivor.permanentNegativeCards.push({
              cardId: 'panic',
              sourceType: 'curse',
              reason: trait.name
            });
          }
          if (trait.mechanicalEffect.randomFightingArt) {
            const options = generalFightingArts.filter(art =>
              !['hardened', 'scarTissue'].includes(art.id)
            );
            if (options.length) {
              survivor.fightingArts.push(
                options[Math.floor(Math.random() * options.length)].id
              );
            }
          }
        }
      }
      if (
        options?.startingTrait &&
        startingTraits[options.startingTrait] &&
        current.builtMemoryInnovations.includes('trialNames')
      ) {
        survivor.traits.push(options.startingTrait);
      }
      if (current.builtMemoryInnovations.includes('sharedWarnings')) {
        survivor.survival += 1;
      }
      if (current.innovationDeckState.builtInnovationIds.includes('oralTradition')) {
        survivor.survival += 1;
      }
      if (current.innovationDeckState.builtInnovationIds.includes('cooking')) {
        survivor.maxHp += 1;
        survivor.hp += 1;
      }
      survivor.survival = Math.min(survivor.maxSurvival, survivor.survival);
      return {
        ...current,
        survivors: [...current.survivors, survivor],
        activeSurvivorId: current.activeSurvivorId || survivor.id,
        pendingSpecialChildTrait: options?.useSpecialTrait ? null : current.pendingSpecialChildTrait
      };
    });
  };

  const handleAttemptIntimacy = (maleId, femaleId) => {
    updateSettlement(current => {
      if (current.lastIntimacyLanternYear === current.lanternYear) return current;
      const male = current.survivors.find(survivor => survivor.id === maleId && survivor.alive !== false && survivor.gender === 'male');
      const female = current.survivors.find(survivor => survivor.id === femaleId && survivor.alive !== false && survivor.gender === 'female');
      if (!male || !female || current.population <= 0) return current;

      const roll = Math.floor(Math.random() * 10) + 1;
      let populationChange = 0;
      let outcome = 'No birth.';
      let deathId = null;
      let severeWoundId = null;
      let pendingSpecialChildTrait = current.pendingSpecialChildTrait;

      if (roll === 1) {
        deathId = Math.random() < 0.5 ? male.id : female.id;
        populationChange = -1;
        outcome = 'Tragedy struck during intimacy.';
      } else if (roll === 2) {
        if (Math.random() < 0.5) {
          deathId = Math.random() < 0.5 ? male.id : female.id;
          populationChange = -1;
          outcome = 'A fatal disaster claimed a participant.';
        } else {
          severeWoundId = Math.random() < 0.5 ? male.id : female.id;
          outcome = 'A participant survived with a severe wound.';
        }
      } else if (roll >= 6 && roll <= 8) {
        populationChange = 1;
        outcome = 'New life. Population increased by 1.';
      } else if (roll === 9) {
        populationChange = 2;
        outcome = 'Twins were born. Population increased by 2.';
      } else if (roll === 10) {
        populationChange = 1;
        pendingSpecialChildTrait =
          childTraitList[Math.floor(Math.random() * childTraitList.length)].id;
        outcome = 'A special child was born. Population increased by 1.';
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
        participantNames: [male.name, female.name],
        roll,
        outcome,
        populationChange,
        deathName: deathSurvivor?.name || null
      };

      return {
        ...current,
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
          gearLostNames: gearLost.map(gear => equipment[gear.equipmentId]?.name || gear.equipmentId),
          timestamp: historyEntry.timestamp
        }, ...current.graveHistory] : current.graveHistory,
        lastIntimacyLanternYear: current.lanternYear,
        intimacyHistory: [historyEntry, ...current.intimacyHistory],
        pendingSpecialChildTrait
      };
    });
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
            onBuildMemoryInnovation={handleBuildMemoryInnovation}
            onAttemptInnovation={handleAttemptInnovation}
            onTimelineChoice={handleTimelineChoice}
            onCreateSurvivor={handleCreateSurvivor}
            onSelectSurvivor={survivorId => updateSettlement(current => ({ ...current, activeSurvivorId: survivorId }))}
            onStartHunt={prepareHunt}
            onAttemptIntimacy={handleAttemptIntimacy}
            onRestSurvivor={handleRestSurvivor}
            onTreatInjury={handleTreatInjury}
            onForgetCard={handleForgetCard}
            onMemoryCardRemoval={handleMemoryCardRemoval}
            onWeaponDrill={handleWeaponDrill}
            onPainLesson={handlePainLesson}
            onShrineOfNames={handleShrineOfNames}
            onReturnToTitle={showTitle}
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
        ) : null;
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
        ) : null;
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
        ) : null;
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
        ) : null;
      }
      case 'nemesisResult':
        return nemesisResult ? (
          <NemesisResultScreen
            result={nemesisResult}
            onContinue={() => {
              if (nemesisResult.deathSummary) setScreen('graveLegacy');
              else {
                setNemesisResult(null);
                setScreen('settlement');
              }
            }}
          />
        ) : null;
      case 'innovationDraw':
        return (
          <InnovationDrawScreen
            cards={innovationDraw.map(id => innovationCards[id]).filter(Boolean)}
            paidResources={innovationPayment}
            appliedCard={innovationCards[appliedInnovationId] || null}
            onChoose={handleChooseInnovation}
            onContinue={() => {
              setInnovationDraw([]);
              setInnovationPayment([]);
              setAppliedInnovationId(null);
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
        return <MapScreen map={runMap} onSelectNode={selectNode} resources={runResources.map(id => resourceData[id]?.name || id)} />;
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
              !runEventWarningUsed && (
                runSurvivor?.disorders?.includes('paranoia') ||
                runSurvivor?.traits?.includes('watchful')
              )
            }
            onChoose={handleEventChoice}
            onContinue={completeCurrentNode}
          />
        ) : null;
      case 'rest':
        return <RestStopScreen onChoose={handleRestChoice} />;
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
        return (
          <QuarryDiscoveryLoreScreen
            event={getQuarryDiscoveryEvent(pendingQuarryDiscoveryId)}
            onContinue={() => {
              setPendingQuarryDiscoveryId(null);
              setScreen('runSummary');
            }}
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
