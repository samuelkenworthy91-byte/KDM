import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { cards, starterCardIds, trainingCardIds } from './data/cards.js';
import { childTraitList, childTraits, normalizeChildTraitId } from './data/childTraits.js';
import { getCreatureBehaviour } from './data/creatureBehaviours.js';
import { equipment } from './data/equipment.js';
import { events } from './data/events.js';
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
  getCreatureSpecificLootChoices,
  getDiscoveryChoices,
  quarryList,
  quarries,
  rollGenericBossRewards,
  rollQuarryLoot
} from './data/quarries.js';
import { genericResourceIds, resources as resourceData } from './data/resources.js';
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
import CombatScreen from './screens/CombatScreen.jsx';
import CreateSettlementScreen from './screens/CreateSettlementScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import LootRewardScreen from './screens/LootRewardScreen.jsx';
import InnovationDrawScreen from './screens/InnovationDrawScreen.jsx';
import LoadoutScreen from './screens/LoadoutScreen.jsx';
import MonsterDiscoveryScreen from './screens/MonsterDiscoveryScreen.jsx';
import QuarrySelectionScreen from './screens/QuarrySelectionScreen.jsx';
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

function createScaledMonster(quarryId, level, type) {
  const quarry = quarries[quarryId] || quarryList[0];
  const behaviour = getCreatureBehaviour(quarry.id);
  const scaling = behaviour?.levelScaling?.[level] || { hp: 1, damage: 0, dangerousWeight: 0 };
  const nodeMultiplier = type === 'boss' ? 1.5 : type === 'elite' ? 1.25 : 1;
  const encounterDamageBonus = type === 'boss'
    ? (level >= 2 ? 3 : 2)
    : type === 'elite'
      ? (level >= 2 ? 2 : 1)
      : 0;
  const damageBonus = encounterDamageBonus + (scaling.damage || 0);
  const baseHp = 30 + Math.min(18, quarry.designTags.length * 3);
  const hp = Math.round(baseHp * nodeMultiplier * scaling.hp);
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
  const scaledIntents = (behaviour?.intents || []).flatMap(intent => {
    const effects = intent.effects.map(scaleEffect);
    const copies = Math.max(
      1,
      (intent.weight || 1) +
      (intent.levelWeights?.[level] || 0) +
      (intent.tags?.some(tag => ['heavy', 'precision', 'punishment'].includes(tag))
        ? scaling.dangerousWeight || 0
        : 0)
    );
    const scaledIntent = {
      ...intent,
      effects,
      revealedText: `${intent.name}: ${effects.map(describeEffect).join('; ')}.`
    };
    return Array.from({ length: copies }, (_, copyIndex) => ({
      ...scaledIntent,
      id: `${scaledIntent.id}-${copyIndex}`
    }));
  });

  return {
    id: `${quarry.id}-${level}-${type}`,
    baseId: quarry.id,
    quarryId,
    name: quarry.displayName,
    level,
    passiveTell: behaviour?.passiveTell || '',
    passiveText: behaviour?.passiveRevealedText || '',
    passiveRules: behaviour?.passiveRules || [],
    hp,
    maxHp: hp,
    block: 0,
    intents: scaledIntents
  };
}

function getLoadoutBonus(settlement, monsterId, quarryId) {
  const activeSurvivor = settlement.survivors.find(survivor => survivor.id === settlement.activeSurvivorId);
  const equipped = (activeSurvivor?.boundGear || [])
    .map(gear => equipment[gear.equipmentId])
    .filter(Boolean);
  const bonus = { extraMaxHp: 0, startingBlock: 0, strength: 0, extraFirstTurnDraw: 0 };

  equipped.forEach(item => {
    if (item.id === 'hideWraps' || item.id === 'maneCloak') bonus.startingBlock += 3;
    if (item.id === 'monsterGrease') bonus.startingBlock += 2;
    if (item.id === 'rawhideVest') bonus.extraMaxHp += 2;
    if (item.id === 'clawCharm' || item.id === 'bloodPaint') bonus.strength += 1;
    if (item.id === 'catEyeCharm') bonus.extraFirstTurnDraw += 1;
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
    const activeSurvivor = settlement.survivors.find(
      survivor => survivor.id === settlement.activeSurvivorId && survivor.alive !== false
    );
    if (!activeSurvivor) return;
    const nextRunBonus = settlement.nextRunBonus || {};
    const startingResources = [];
    const activeRunBonus = {};
    const equippedGear = (activeSurvivor.boundGear || [])
      .map(gear => equipment[gear.equipmentId])
      .filter(Boolean);
    const huntSurvivor = {
      ...activeSurvivor,
      hp: activeSurvivor.injuries?.includes('deepCut')
        ? Math.max(1, activeSurvivor.hp - 1)
        : activeSurvivor.hp
    };
    const nextRunDeck = buildRunDeck({ survivor: huntSurvivor, equippedGear });
    if (huntSurvivor.disorders?.includes('nightTerrors')) {
      nextRunDeck.push(...getCardsFromIds(['panic'], 'Night Terrors'));
    }

    if (nextRunBonus.randomMonsterPart) {
      startingResources.push(RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)]);
    }
    if (nextRunBonus.extraMaxHp) activeRunBonus.extraMaxHp = nextRunBonus.extraMaxHp;
    if (nextRunBonus.firstCombatStrength) activeRunBonus.firstCombatStrength = nextRunBonus.firstCombatStrength;
    if (nextRunBonus.nextCombatMonsterBonusHp) {
      activeRunBonus.nextCombatMonsterBonusHp = nextRunBonus.nextCombatMonsterBonusHp;
    }
    if (activeSurvivor.traits?.includes('steady')) activeRunBonus.firstCombatBlock = 1;
    if (activeSurvivor.traits?.includes('bold')) activeRunBonus.firstHuntAttackBonus = 1;
    if (
      settlement.builtMemoryInnovations.includes('huntSongs') &&
      (settlement.defeatedQuarryLevels?.[selectedQuarry] || 0) > 0
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
        nextCombatMonsterBonusHp: 0
      }
    }));
    setRunMap(generateMap(selectedLevel));
    setCurrentNode(null);
    setRunResources(startingResources);
    setRunSurvivor(huntSurvivor);
    setRunEquippedGear(equippedGear.map(item => item.id));
    setRunDeck(nextRunDeck);
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
    updateSettlement(current => ({ ...current, activeSurvivorId: survivorId }));
    setScreen('loadout');
  };

  const selectNode = node => {
    if (!node.available || node.completed) return;
    setCurrentNode(node);

    if (['fight', 'elite', 'boss'].includes(node.type)) {
      const monsterId = quarries[selectedQuarry]?.monsterId;
      const loadoutBonus = getLoadoutBonus(settlement, monsterId, selectedQuarry);
      const firstCombatStrength = runBonus.firstCombatStrength || 0;
      setCombatBonus({
        ...loadoutBonus,
        extraMaxHp: (loadoutBonus.extraMaxHp || 0) + (runBonus.extraMaxHp || 0),
        firstCombatStrength: firstCombatStrength + (loadoutBonus.strength || 0),
        startingBlock:
          (loadoutBonus.startingBlock || 0) +
          (runModifiers.nextCombatStartBlock || 0) +
          (runBonus.firstCombatBlock || 0),
        firstTurnEnergyPenalty: runModifiers.nextCombatEnergyPenalty || 0,
        monsterBonusHp:
          (runModifiers.nextCombatMonsterBonusHp || 0) +
          (runBonus.nextCombatMonsterBonusHp || 0),
        monsterStartsWounded: runModifiers.monsterStartsWounded || 0,
        monsterEnrage: runModifiers.monsterEnrage || 0,
        firstAttackBonus:
          (runModifiers.firstAttackBonus || 0) +
          (runBonus.firstHuntAttackBonus || 0),
        monsterBaneDamageBonus:
          settlement.builtInnovations.includes('monsterArchive') &&
          runSurvivor?.fightingArts?.includes(getMonsterBaneId(selectedQuarry))
            ? 1
            : 0,
        survivor: runSurvivor,
        runDeck,
        huntDeckConditionsApplied: true
      });
      setRunModifiers({});
      setRunBonus(current => ({
        ...current,
        firstCombatBlock: 0,
        firstHuntAttackBonus: 0,
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
    const genericRewards = isBoss ? rollGenericBossRewards(3) : [];
    setBossGenericRewards(genericRewards);
    setPendingCombatVictory({
      isBoss,
      survivor: survivorAfterCombat
    });
    setLootChoices(
      isBoss
        ? getCreatureSpecificLootChoices(selectedQuarry, selectedLevel)
        : rollQuarryLoot(selectedQuarry, selectedLevel).slice(0, 3)
    );
    setScreen('lootReward');
  };

  const finishBossVictory = (selectedResource, survivorAfterFight) => {
    const completedMap = completeMapNode(runMap, currentNode.id);
    const progress = getRunProgress(completedMap, currentNode);
    const allRewards = [...runResources, ...bossGenericRewards, selectedResource];
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
      lanternYearAfter: settlement.lanternYear + 1
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
          kills: survivorAfterFight.kills || 0,
          completedRuns: (survivor.completedRuns || 0) + 1
        }
        : survivor.alive === false ? survivor : {
          ...survivor,
          hp: Math.min(survivor.maxHp, survivor.hp + Math.ceil(survivor.maxHp / 3))
        }),
      defeatedQuarryLevels: {
        ...current.defeatedQuarryLevels,
        [selectedQuarry]: Math.max(current.defeatedQuarryLevels?.[selectedQuarry] || 0, selectedLevel)
      },
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
    const archiveBuilt = settlement.builtInnovations.includes('monsterArchive');
    const monsterStoriesBuilt = settlement.builtMemoryInnovations.includes('monsterStories');
    setProgressOfferBane(archiveBuilt || monsterStoriesBuilt || Math.random() < 0.65);
    setScreen('survivorProgress');
  };

  const handleCombatDefeat = (
    deathDetails,
    defeatedRunState = null,
    immediateConditionGains = { injuries: [], scars: [], disorders: [] }
  ) => {
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
    setSelectedLevel(Math.min(3, (settlement?.defeatedQuarryLevels?.[selectedQuarry] || 0) + 1));
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
    const drawable = getDrawableInnovationIds(settlement.innovationDeckState);
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

  const handleTimelineChoice = choiceId => {
    updateSettlement(current => resolveLanternTimelineChoice(current, choiceId));
  };

  const handleChooseInnovation = innovationId => {
    const card = innovationCards[innovationId];
    if (!card) return;
    updateSettlement(current => ({
      ...current,
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
        item.id === survivorId && item.alive !== false && item.hp < item.maxHp
      );
      if (!survivor) return current;
      return {
        ...current,
        settlementMemory: current.settlementMemory - 1,
        survivors: current.survivors.map(item => item.id === survivorId
          ? {
            ...item,
            hp: Math.min(item.maxHp, item.hp + Math.ceil(item.maxHp / 3))
          }
          : item)
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

  const handleConfirmLoadout = selectedInstanceIds => {
    updateSettlement(current => {
      const survivor = current.survivors.find(item => item.id === current.activeSurvivorId);
      const limit = current.builtInnovations.includes('armoryRack') ? 5 : 4;
      const remainingSlots = Math.max(0, limit - (survivor?.boundGear?.length || 0));
      const selected = current.armory
        .filter(gear => selectedInstanceIds.includes(gear.instanceId))
        .slice(0, remainingSlots);
      const selectedIds = new Set(selected.map(gear => gear.instanceId));
      return {
        ...current,
        armory: current.armory.filter(gear => !selectedIds.has(gear.instanceId)),
        survivors: current.survivors.map(survivor => survivor.id === current.activeSurvivorId
          ? { ...survivor, boundGear: [...(survivor.boundGear || []), ...selected] }
          : survivor)
      };
    });
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
          !current.discoveredQuarries.includes(quarry.id)
        ).slice(0, 1).map(quarry => quarry.id)])]
        : current.discoveredQuarries,
      unlockedQuarries: result.quarryRumour
        ? [...new Set([...current.unlockedQuarries, ...quarryList.filter(quarry =>
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
      setRunSurvivor(current => ({
        ...current,
        hp: Math.min(
          current.maxHp,
          current.hp + Math.max(
            0,
            Math.ceil(current.maxHp * 0.25) - (current.injuries?.includes('twistedAnkle') ? 1 : 0)
          )
        )
      }));
    } else if (choiceId === 'shareStories') {
      setRunSurvivor(current => ({
        ...current,
        survival: Math.min(current.maxSurvival || 3, (current.survival || 0) + 1)
      }));
    } else if (choiceId === 'sharpenGear') {
      setRunModifiers(current => ({ ...current, firstAttackBonus: (current.firstAttackBonus || 0) + 2 }));
    } else {
      setRunModifiers(current => ({ ...current, nextCombatStartBlock: (current.nextCombatStartBlock || 0) + 2 }));
    }
    completeCurrentNode();
  };

  const handleLootChoice = resourceId => {
    const pending = pendingCombatVictory;
    setPendingCombatVictory(null);
    setLootChoices([]);
    if (pending?.isBoss) {
      finishBossVictory(resourceId, pending.survivor);
      setBossGenericRewards([]);
      return;
    }
    setRunResources(items => [...items, resourceId]);
    completeCurrentNode();
  };

  const handleProgressChoice = rewardId => {
    updateSettlement(current => ({
      ...current,
      survivors: current.survivors.map(survivor => {
        if (survivor.id !== runSummary.survivorId) return survivor;
        if (rewardId === 'survival') {
          return {
            ...survivor,
            survival: Math.min(survivor.maxSurvival || 3, (survivor.survival || 0) + 1)
          };
        }
        if (cards[rewardId]?.sourceType === 'personal') {
          return {
            ...survivor,
            personalDeckAdditions: [
              ...survivor.personalDeckAdditions,
              { cardId: rewardId, sourceType: 'personal', reason: 'Survivor victory' }
            ]
          };
        }
        if (!fightingArts[rewardId]?.implemented) return survivor;
        if (isMonsterBaneId(rewardId) && getSurvivorMonsterBaneId(survivor)) {
          return {
            ...survivor,
            survival: Math.min(
              survivor.maxSurvival || 3,
              (survivor.survival || 0) + 1
            )
          };
        }
        const next = {
          ...survivor,
          fightingArts: [...new Set([...(survivor.fightingArts || []), rewardId])]
        };
        if (rewardId === 'hardened') {
          next.maxHp += 1;
          next.hp += 1;
        }
        return next;
      })
    }));
    const discoveryChoices = getDiscoveryChoices(settlement);
    setScreen(discoveryChoices.length ? 'monsterDiscovery' : 'runSummary');
  };

  const handleMonsterDiscovery = quarryId => {
    const quarry = quarries[quarryId];
    if (!quarry) return;
    updateSettlement(current => ({
      ...current,
      discoveredQuarries: [...new Set([...current.discoveredQuarries, quarryId])],
      unlockedQuarries: [...new Set([...current.unlockedQuarries, quarryId])],
      rumouredInnovations: [
        ...new Set([
          ...(current.rumouredInnovations || []),
          ...(quarry.associatedInnovations || []).slice(0, 1)
        ])
      ],
      innovationDeckState: {
        ...current.innovationDeckState,
        availableInnovationPoolIds: [
          ...new Set([
            ...current.innovationDeckState.availableInnovationPoolIds,
            ...(QUARRY_INNOVATION_POOL[quarryId] || [])
          ])
        ]
      }
    }));
    setRunSummary(current => ({
      ...current,
      discoveryMessage: `The settlement now knows how to hunt ${quarry.name}.`
    }));
    setScreen('runSummary');
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
      case 'loadout': {
        const survivor = settlement.survivors.find(item => item.id === settlement.activeSurvivorId);
        return (
          <LoadoutScreen
            survivor={survivor}
            armory={settlement.armory}
            equipLimit={settlement.builtInnovations.includes('armoryRack') ? 5 : 4}
            onConfirm={handleConfirmLoadout}
            onDestroyBoundGear={handleDestroyBoundGear}
            onAddTestResources={handleAddTestGearResources}
            onBack={() => setScreen('settlement')}
          />
        );
      }
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
            onBack={() => setScreen('loadout')}
          />
        );
      case 'map':
        return <MapScreen map={runMap} onSelectNode={selectNode} resources={runResources.map(id => resourceData[id]?.name || id)} />;
      case 'combat':
        return (
          <CombatScreen
            key={currentNode?.id}
            monster={createScaledMonster(selectedQuarry, selectedLevel, currentNode?.type)}
            runBonus={combatBonus}
            equippedGear={runEquippedGear}
            hasMonsterBane={Boolean(
              runSurvivor?.fightingArts?.includes(getMonsterBaneId(selectedQuarry))
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
        return (
          <SurvivorProgressScreen
            survivorName={runSummary?.survivorName}
            quarryId={selectedQuarry}
            offerBane={progressOfferBane}
            oralTradition={
              settlement.builtMemoryInnovations.includes('oralTradition') ||
              settlement.innovationDeckState.builtInnovationIds.includes('oralTradition') ||
              settlement.innovationDeckState.builtInnovationIds.includes('symposium')
            }
            ownedArts={settlement.survivors.find(item => item.id === runSummary?.survivorId)?.fightingArts || []}
            onChoose={handleProgressChoice}
          />
        );
      case 'monsterDiscovery': {
        const choices = getDiscoveryChoices(settlement);
        return (
          <MonsterDiscoveryScreen
            quarries={choices}
            onChoose={handleMonsterDiscovery}
            onSkip={() => setScreen('runSummary')}
          />
        );
      }
      case 'runSummary':
        return <RunSummaryScreen summary={runSummary} onContinue={continueFromSummary} />;
      case 'graveLegacy':
        return (
          <GraveLegacyScreen
            summary={runSummary}
            showAllChoices={settlement.builtMemoryInnovations.includes('deathArchive')}
            onChooseLegacy={chooseGraveLegacy}
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
