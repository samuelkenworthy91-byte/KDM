import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { equipment } from './data/equipment.js';
import { events } from './data/events.js';
import { fightingArts, getMonsterBaneId } from './data/fightingArts.js';
import { graveLegacies } from './data/graveLegacies.js';
import { monsters } from './data/monsters.js';
import {
  getCreatureSpecificLootChoices,
  quarryList,
  quarries,
  rollGenericBossRewards,
  rollQuarryLoot
} from './data/quarries.js';
import { genericResourceIds, resources as resourceData } from './data/resources.js';
import { addResources, canAffordCost, deductCost } from './game/craftingLogic.js';
import { resolveEvent } from './game/eventLogic.js';
import { buildRunDeck, getCardsFromIds } from './game/deckLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
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

function chooseHuntEvent(level) {
  const deadlyEvents = events.filter(event => DEADLY_EVENT_IDS.has(event.id));
  const saferEvents = events.filter(event => !DEADLY_EVENT_IDS.has(event.id));
  const deadlyChance = level === 3 ? 0.6 : level === 2 ? 0.4 : 0.2;
  const pool = Math.random() < deadlyChance ? deadlyEvents : saferEvents;
  return pool[Math.floor(Math.random() * pool.length)];
}

function createScaledMonster(quarryId, level, type) {
  const quarry = quarries[quarryId] || quarryList[0];
  const base = monsters[quarry.monsterId] || monsters.whiteLion;
  const nodeMultiplier = type === 'boss' ? 1.5 : type === 'elite' ? 1.25 : 1;
  const levelMultiplier = 1 + (level - 1) * 0.35;
  const encounterDamageBonus = type === 'boss'
    ? (level >= 2 ? 3 : 2)
    : type === 'elite'
      ? (level >= 2 ? 2 : 1)
      : 0;
  const damageBonus = encounterDamageBonus + (level - 1);
  const hp = Math.round(base.maxHp * nodeMultiplier * levelMultiplier);

  const scaledIntents = base.intents.map(intent => {
    const effects = intent.effects.map(effect =>
      effect.type === 'dealDamage' ? { ...effect, amount: effect.amount + damageBonus } : { ...effect }
    );
    const damage = effects.find(effect => effect.type === 'dealDamage')?.amount;
    const block = effects.find(effect => effect.type === 'gainBlock')?.amount;
    const panic = effects.find(effect => effect.type === 'addPanic')?.amount;
    const conditional = effects.find(effect => effect.type === 'bonusIfPlayerNoBlock')?.amount;
    const details = [
      damage ? `deals ${damage} damage` : null,
      block ? `gains ${block} block` : null,
      panic ? `adds ${panic} Panic` : null,
      conditional ? `deals +${conditional} if you have no block` : null
    ].filter(Boolean).join('. ');

    return { ...intent, effects, revealedText: `${intent.name}: ${details}.` };
  });

  return {
    ...base,
    baseId: base.id,
    quarryId,
    id: `${base.id}-${level}-${type}`,
    name: type === 'boss' ? `${base.name} Level ${level}` : base.name,
    hp,
    maxHp: hp,
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
    const nextRunDeck = buildRunDeck({ survivor: activeSurvivor, equippedGear });

    if (nextRunBonus.randomMonsterPart) {
      startingResources.push(RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)]);
    }
    if (nextRunBonus.extraMaxHp) activeRunBonus.extraMaxHp = nextRunBonus.extraMaxHp;
    if (nextRunBonus.firstCombatStrength) activeRunBonus.firstCombatStrength = nextRunBonus.firstCombatStrength;

    updateSettlement(current => ({
      ...current,
      nextRunBonus: { ...current.nextRunBonus, randomMonsterPart: false, extraMaxHp: 0, firstCombatStrength: 0 }
    }));
    setRunMap(generateMap(selectedLevel));
    setCurrentNode(null);
    setRunResources(startingResources);
    setRunSurvivor({ ...activeSurvivor });
    setRunEquippedGear(equippedGear.map(item => item.id));
    setRunDeck(nextRunDeck);
    setRunModifiers({});
    setResourceReward(null);
    setRunBonus(activeRunBonus);
    setCombatBonus({});
    setRunSummary(null);
    setScreen('map');
  };

  const prepareHunt = survivorId => {
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
        startingBlock: (loadoutBonus.startingBlock || 0) + (runModifiers.nextCombatStartBlock || 0),
        firstTurnEnergyPenalty: runModifiers.nextCombatEnergyPenalty || 0,
        monsterBonusHp: runModifiers.nextCombatMonsterBonusHp || 0,
        monsterStartsWounded: runModifiers.monsterStartsWounded || 0,
        monsterEnrage: runModifiers.monsterEnrage || 0,
        firstAttackBonus: runModifiers.firstAttackBonus || 0,
        survivor: runSurvivor,
        runDeck
      });
      setRunModifiers({});
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
    setRunSurvivor(current => ({
      ...current,
      hp: combatResult?.survivor?.hp ?? current.hp,
      kills: (current.kills || 0) + 1
    }));
    const isBoss = currentNode?.type === 'boss';
    const genericRewards = isBoss ? rollGenericBossRewards(3) : [];
    setBossGenericRewards(genericRewards);
    setPendingCombatVictory({
      isBoss,
      survivorHp: combatResult?.survivor?.hp
    });
    setLootChoices(
      isBoss
        ? getCreatureSpecificLootChoices(selectedQuarry, selectedLevel)
        : rollQuarryLoot(selectedQuarry, selectedLevel).slice(0, 3)
    );
    setScreen('lootReward');
  };

  const finishBossVictory = (selectedResource, survivorHp) => {
    const completedMap = completeMapNode(runMap, currentNode.id);
    const progress = getRunProgress(completedMap, currentNode);
    const allRewards = [...runResources, ...bossGenericRewards, selectedResource];
    const survivorAfterFight = { ...runSurvivor, hp: survivorHp ?? runSurvivor.hp };
    const fullRecovery = settlement.builtInnovations.includes('firstAidTent');
    const recoveryAmount = fullRecovery
      ? survivorAfterFight.maxHp - survivorAfterFight.hp
      : Math.min(
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
      recoveredHp: recoveryAmount
    };

    setRunMap(completedMap);
    setRunResources(allRewards);
    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: (current.settlementMemory || 0) + summary.settlementMemoryEarned,
      stash: addResources(current.stash, allRewards),
      totalRuns: (current.totalRuns || 0) + 1,
      completedHunts: (current.completedHunts || 0) + 1,
      lanternYear: (current.lanternYear || 0) + 1,
      survivors: current.survivors.map(survivor => survivor.id === survivorAfterFight.id
        ? {
          ...survivor,
          hp: healedSurvivorHp,
          survival: survivorAfterFight.survival,
          traits: survivorAfterFight.traits,
          fightingArts: survivorAfterFight.fightingArts,
          deckAdditions: survivor.deckAdditions,
          personalDeckAdditions: survivor.personalDeckAdditions,
          scars: survivorAfterFight.scars || [],
          kills: survivorAfterFight.kills || 0,
          completedRuns: (survivor.completedRuns || 0) + 1
        }
        : survivor.alive === false ? survivor : {
          ...survivor,
          hp: fullRecovery
            ? survivor.maxHp
            : Math.min(survivor.maxHp, survivor.hp + Math.ceil(survivor.maxHp / 3))
        }),
      defeatedQuarryLevels: {
        ...current.defeatedQuarryLevels,
        [selectedQuarry]: Math.max(current.defeatedQuarryLevels?.[selectedQuarry] || 0, selectedLevel)
      }
    }));
    const archiveBuilt = settlement.builtInnovations.includes('monsterArchive');
    setProgressOfferBane(archiveBuilt || Math.random() < 0.65);
    setScreen('survivorProgress');
  };

  const handleCombatDefeat = (deathDetails, defeatedRunState = null) => {
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
      survivorCompletedRuns: fallenSurvivor?.completedRuns || 0,
      gearLostCount: lostGear.length,
      gearLostNames: lostGear.map(gear => equipment[gear.equipmentId]?.name || gear.equipmentId),
      killedBy: deathDetails?.killedBy || 'unknownMonster',
      killedById: deathDetails?.killedById || 'unknownMonster',
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: progress.nodesCompleted,
      resources: fallenResources.map(id => resourceData[id]?.name || id)
    };

    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      population: Math.max(0, (current.population || 0) - 1),
      deadSurvivors: (current.deadSurvivors || 0) + 1,
      totalRuns: (current.totalRuns || 0) + 1,
      lanternYear: (current.lanternYear || 0) + 1,
      settlementMemory: (current.settlementMemory || 0) + summary.settlementMemoryEarned,
      stash: addResources(current.stash, fallenResources),
      survivors: current.survivors.map(survivor => survivor.id === fallenSurvivor?.id
        ? { ...survivor, alive: false, hp: 0, boundGear: [] }
        : survivor),
      activeSurvivorId: current.survivors.find(
        survivor => survivor.id !== fallenSurvivor?.id && survivor.alive !== false
      )?.id || null
    }));
    setScreen('runSummary');
  };

  const returnToSettlement = () => {
    setCurrentNode(null);
    setCombatBonus({});
    setRunSummary(null);
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
      armory: [...current.armory, createGearInstance(recipe.id)]
    }));
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
    const previousAdditions = runSurvivor.deckAdditions || [];
    const eventCardIds = (result.runSurvivor.deckAdditions || []).slice(previousAdditions.length);
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
          scars: result.runSurvivor.scars
        }
        : survivor),
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
      }, result);
    }
    return result;
  };

  const handleRestChoice = choiceId => {
    if (choiceId === 'bindWounds') {
      setRunSurvivor(current => ({
        ...current,
        hp: Math.min(current.maxHp, current.hp + Math.ceil(current.maxHp * 0.25))
      }));
    } else if (choiceId === 'shareStories') {
      setRunSurvivor(current => ({ ...current, survival: (current.survival || 0) + 1 }));
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
      finishBossVictory(resourceId, pending.survivorHp);
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
        if (rewardId === 'survival') return { ...survivor, survival: (survivor.survival || 0) + 1 };
        if (!fightingArts[rewardId]?.implemented) return survivor;
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
    const discoveryChoices = quarryList.filter(quarry =>
      !settlement.discoveredQuarries.includes(quarry.id)
    );
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
      ]
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
        survivor.traits.push(current.pendingSpecialChildTrait);
      }
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
        pendingSpecialChildTrait = 'Lantern-Touched';
        outcome = 'A special child was born. Population increased by 1.';
      }

      const deathSurvivor = current.survivors.find(survivor => survivor.id === deathId);
      const gearLost = deathSurvivor?.boundGear || [];
      const nextSurvivors = current.survivors.map(survivor => {
        if (survivor.id === deathId) return { ...survivor, alive: false, hp: 0, boundGear: [] };
        if (survivor.id === severeWoundId) {
          return { ...survivor, hp: 1, scars: [...(survivor.scars || []), 'Intimacy Trauma'] };
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
            onCreateSurvivor={handleCreateSurvivor}
            onSelectSurvivor={survivorId => updateSettlement(current => ({ ...current, activeSurvivorId: survivorId }))}
            onStartHunt={prepareHunt}
            onAttemptIntimacy={handleAttemptIntimacy}
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
            ownedArts={settlement.survivors.find(item => item.id === runSummary?.survivorId)?.fightingArts || []}
            onChoose={handleProgressChoice}
          />
        );
      case 'monsterDiscovery': {
        const choices = quarryList.filter(quarry =>
          !settlement.discoveredQuarries.includes(quarry.id)
        );
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
        return <GraveLegacyScreen summary={runSummary} onChooseLegacy={chooseGraveLegacy} />;
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
