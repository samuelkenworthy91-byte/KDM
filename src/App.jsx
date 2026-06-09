import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { starterDeck } from './data/cards.js';
import { getCreatureBehaviour } from './data/creatureBehaviours.js';
import { equipment } from './data/equipment.js';
import { events } from './data/events.js';
import { graveLegacies } from './data/graveLegacies.js';
import { getNewlyUnlockedQuarries, quarries } from './data/quarries.js';
import { emptyInventory, resourceIds, resources } from './data/resources.js';
import { craftEquipment, getEquipmentEffects } from './game/craftingLogic.js';
import { resolveEventChoice } from './game/eventLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import {
  createNewSettlement,
  hasUpgrade,
  isSettlementDefeated,
  loadSettlement,
  resetSettlement,
  saveSettlement
} from './game/saveLogic.js';
import {
  buildInnovation,
  getGearLimit,
  hasInnovation
} from './game/settlementLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import CreateSettlementScreen from './screens/CreateSettlementScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import HuntEventScreen from './screens/HuntEventScreen.jsx';
import LoadoutScreen from './screens/LoadoutScreen.jsx';
import LootRewardScreen from './screens/LootRewardScreen.jsx';
import QuarrySelectionScreen from './screens/QuarrySelectionScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementDefeatedScreen from './screens/SettlementDefeatedScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';
import SurvivorProgressScreen, {
  survivorProgressRewards
} from './screens/SurvivorProgressScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];
const DEFAULT_LOOT = ['bone', 'hide', 'sinew', 'organ', 'claw', 'fur', 'monsterTooth'];

const SPECIAL_TRAITS = [
  'Lantern-Eyed',
  'Bone-Strong',
  'Quiet Listener',
  'Marked by the Dark',
  'Scarless'
];

function createSurvivor(name, gender, settlement) {
  const specialTrait = settlement.pendingSpecialTrait;
  const survivor = {
    id: `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || 'Nameless Survivor',
    gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
    ageCategory: 'adult',
    maxHp: 30 + (hasInnovation(settlement, 'lanternOven') ? 1 : 0),
    hp: 30 + (hasInnovation(settlement, 'lanternOven') ? 1 : 0),
    strength: 0,
    personalDeckAdditions: [],
    fightingArts: [],
    completedRuns: 0,
    kills: 0,
    traits: specialTrait ? [specialTrait] : [],
    scars: [],
    isAlive: true,
    retired: false,
    survival: hasInnovation(settlement, 'storytellerCircle') ? 1 : 0
  };

  if (specialTrait === 'Lantern-Eyed') survivor.survival += 1;
  if (specialTrait === 'Bone-Strong') {
    survivor.maxHp += 1;
    survivor.hp += 1;
  }
  if (specialTrait === 'Marked by the Dark') survivor.strength += 1;
  if (specialTrait === 'Marked by the Dark') survivor.personalDeckAdditions.push('panic');
  return survivor;
}

function createIdleRunState() {
  return {
    survivor: null,
    hp: 30,
    maxHp: 30,
    collectedResources: { ...emptyInventory },
    equippedGear: [],
    usedConsumableGear: [],
    deck: starterDeck.map(card => card.id),
    fightingArts: [],
    kills: 0,
    settlementMemoryGained: 0,
    survival: 0
  };
}

const abandonedWorkshop = {
  id: 'abandonedWorkshop',
  name: 'Abandoned Workshop',
  description: 'Broken tools and old remains lie beneath a collapsed workbench.',
  choices: [
    {
      text: 'Scavenge tools',
      outcome: 'You salvage one usable piece of metal.',
      effects: [{ type: 'gainResource', resourceId: 'scrap', amount: 1 }]
    },
    {
      text: 'Patch wounds',
      outcome: 'Old bindings hold long enough to close the wound.',
      effects: [{ type: 'healHp', amount: 2 }]
    },
    {
      text: 'Study remains',
      outcome: 'The dead teach a useful lesson at a cost.',
      effects: [
        { type: 'gainSettlementMemory', amount: 1 },
        { type: 'addCardToDeck', cardId: 'panic' }
      ]
    }
  ]
};

function addResource(inventory, resourceId, amount = 1) {
  if (!resources[resourceId]) {
    return inventory;
  }
  return {
    ...inventory,
    [resourceId]: (inventory[resourceId] || 0) + amount
  };
}

function chooseUnique(ids, count = 3) {
  const shuffled = [...new Set(ids)].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createScaledMonster(type, selection = { quarryId: 'paleHuntLion', level: 1 }) {
  const quarry = quarries[selection.quarryId] || quarries.paleHuntLion;
  const behaviour = getCreatureBehaviour(quarry.id);
  const quarryLevel = behaviour.levelScaling[selection.level] || behaviour.levelScaling[1];
  const multiplier = type === 'boss' ? 1.35 : type === 'elite' ? 1.15 : 1;
  const damageBonus = type === 'boss' ? 2 : type === 'elite' ? 1 : 0;
  const hp = Math.round(quarryLevel.hp * multiplier);

  return {
    id: `${quarry.id}-${selection.level}-${type}`,
    baseId: quarry.id,
    name:
      type === 'boss'
        ? `Ancient ${quarry.name}`
        : type === 'elite'
          ? `Frenzied ${quarry.name}`
          : quarry.name,
    hp,
    maxHp: hp,
    block: 0,
    level: selection.level,
    damage: quarryLevel.damage + damageBonus,
    intents: behaviour.intents.map(intent => ({
      ...intent,
      effects: intent.effects.map(effect => ({ ...effect }))
    })),
    passiveRules: behaviour.passiveRules,
    loot: behaviour.lootTable,
    rareLoot: behaviour.rareLootTable,
    rareChance: quarryLevel.rareChance,
    behaviourDescription: behaviour.description
  };
}

function resourceNames(inventory) {
  return Object.entries(inventory)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => `${resources[id]?.name || id} x${amount}`);
}

export default function App() {
  const [screen, setScreen] = useState('settlement');
  const [settlement, setSettlement] = useState(() => loadSettlement());
  const [selectedSurvivor, setSelectedSurvivor] = useState(null);
  const [equippedIds, setEquippedIds] = useState([]);
  const [loadoutMessage, setLoadoutMessage] = useState('');
  const [runMap, setRunMap] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [runState, setRunState] = useState(createIdleRunState);
  const [runBonus, setRunBonus] = useState({});
  const [combatBonus, setCombatBonus] = useState({});
  const [rewardChoices, setRewardChoices] = useState([]);
  const [pendingBossLoot, setPendingBossLoot] = useState(false);
  const [runSummary, setRunSummary] = useState(null);
  const [progressChoices, setProgressChoices] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentCombatMonster, setCurrentCombatMonster] = useState(null);
  const [selectedQuarry, setSelectedQuarry] = useState(null);

  const updateSettlement = updater => {
    setSettlement(current => {
      if (!current) return current;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return saveSettlement(next);
    });
  };

  const getRunProgress = (map = runMap, activeNode = currentNode) => {
    const completed = map.flat().filter(node => node.completed);
    const reachedRows = [
      ...completed.map(node => node.row + 1),
      activeNode ? activeNode.row + 1 : 0
    ];
    return {
      nodesCompleted: completed.length,
      rowReached: Math.max(0, ...reachedRows),
      elitesDefeated: completed.filter(node => node.type === 'elite').length
    };
  };

  const handleCraft = item => {
    updateSettlement(current => {
      const result = craftEquipment(
        item,
        current.settlementStash,
        current.armory,
        current.builtInnovations
      );
      return result.crafted
        ? { ...current, settlementStash: result.stash, armory: result.armory }
        : current;
    });
  };

  const handleBuildInnovation = innovationId => {
    updateSettlement(current => {
      let next = buildInnovation(current, innovationId);
      const newQuarries = getNewlyUnlockedQuarries(next);
      if (newQuarries.length) {
        next = {
          ...next,
          unlockedQuarries: [...new Set([...next.unlockedQuarries, ...newQuarries])]
        };
      }
      return next;
    });
  };

  const buyUpgrade = upgrade => {
    updateSettlement(current => {
      if (hasUpgrade(current, upgrade.id) || current.settlementMemory < upgrade.cost) {
        return current;
      }
      return {
        ...current,
        settlementMemory: current.settlementMemory - upgrade.cost,
        unlockedUpgrades: [...current.unlockedUpgrades, upgrade.id]
      };
    });
  };

  const prepareSurvivor = survivor => {
    setSelectedSurvivor({ ...survivor });
    setEquippedIds([]);
    setLoadoutMessage('');
    setScreen('loadout');
  };

  const prepareLivingSurvivor = survivorId => {
    const survivor = settlement.livingSurvivors.find(item => item.id === survivorId);
    if (survivor) {
      prepareSurvivor(survivor);
    }
  };

  const handleCreateSurvivor = (name, gender) => {
    updateSettlement(current => {
      if (current.livingSurvivors.length >= current.population) return current;
      const survivor = createSurvivor(name, gender, current);
      return {
        ...current,
        livingSurvivors: [survivor, ...current.livingSurvivors],
        pendingSpecialTrait: null
      };
    });
  };

  const handleAttemptIntimacy = () => {
    updateSettlement(current => {
      const hasMale = current.livingSurvivors.some(survivor => survivor.gender === 'male');
      const hasFemale = current.livingSurvivors.some(survivor => survivor.gender === 'female');
      if (!hasMale || !hasFemale) return current;

      const roll = Math.floor(Math.random() * 10) + 1;
      let populationGain = 0;
      let title = 'No Birth';
      let description = 'The settlement waits for another season.';
      let pendingSpecialTrait = current.pendingSpecialTrait;
      if (roll === 1) {
        title = 'Tragedy';
        description = 'No birth. A Doom record is added to settlement history.';
      } else if (roll >= 6 && roll <= 8) {
        populationGain = 1;
        title = 'New Life';
        description = 'Population +1.';
      } else if (roll === 9) {
        populationGain = 2;
        title = 'Twins';
        description = 'Population +2.';
      } else if (roll === 10) {
        populationGain = 1;
        pendingSpecialTrait = SPECIAL_TRAITS[Math.floor(Math.random() * SPECIAL_TRAITS.length)];
        title = 'Special Child';
        description = `Population +1. The next created survivor may inherit ${pendingSpecialTrait}.`;
      }
      const entry = {
        id: `intimacy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        roll, title, description, timestamp: new Date().toISOString()
      };
      return {
        ...current,
        population: current.population + populationGain,
        pendingSpecialTrait,
        intimacyHistory: [entry, ...current.intimacyHistory].slice(0, 5)
      };
    });
  };

  const toggleGear = instanceId => {
    if (equippedIds.includes(instanceId)) {
      setEquippedIds(ids => ids.filter(id => id !== instanceId));
      setLoadoutMessage('');
      return;
    }
    const gearLimit = getGearLimit(settlement);
    if (equippedIds.length >= gearLimit) {
      setLoadoutMessage(`A survivor can equip no more than ${gearLimit} pieces of gear.`);
      return;
    }
    setEquippedIds(ids => [...ids, instanceId]);
    setLoadoutMessage('');
  };

  const proceedToQuarry = () => {
    if (!selectedSurvivor) {
      return;
    }
    setScreen('quarrySelect');
  };

  const startHunt = (quarryId, quarryLevel) => {
    if (!selectedSurvivor) return;
    const selection = { quarryId, level: quarryLevel };
    setSelectedQuarry(selection);

    const equippedGear = settlement.armory
      .filter(item => equippedIds.includes(item.instanceId))
      .map(item => ({ ...item, ...(equipment[item.id] || {}) }));
    const nextRunBonus = settlement.nextRunBonus || {};
    let collectedResources = { ...emptyInventory };
    let maxHp = selectedSurvivor.maxHp || 30;
    const activeRunBonus = {};

    if (nextRunBonus.randomMonsterPart) {
      const partId = RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)];
      collectedResources = addResource(collectedResources, partId);
    }
    if (hasUpgrade(settlement, 'boneSmith')) {
      collectedResources = addResource(collectedResources, 'bone');
    }
    if (nextRunBonus.extraMaxHp) {
      maxHp += nextRunBonus.extraMaxHp;
    }
    if (nextRunBonus.firstCombatStrength) {
      activeRunBonus.firstCombatStrength = nextRunBonus.firstCombatStrength;
    }

    updateSettlement(current => ({
      ...current,
      totalRuns: current.totalRuns + 1,
      nextRunBonus: {
        ...current.nextRunBonus,
        randomMonsterPart: false,
        extraMaxHp: 0,
        firstCombatStrength: 0
      }
    }));
    setRunState({
      survivor: { ...selectedSurvivor },
      hp: maxHp,
      maxHp,
      collectedResources,
      equippedGear,
      usedConsumableGear: [],
      deck: [
        ...starterDeck.map(card => card.id),
        ...(selectedSurvivor.personalDeckAdditions || [])
      ],
      fightingArts: [...(selectedSurvivor.fightingArts || [])],
      survival: selectedSurvivor.survival || 0,
      kills: selectedSurvivor.kills || 0,
      settlementMemoryGained: 0
    });
    setRunMap(generateMap({ moreResources: hasInnovation(settlement, 'scoutTower') }));
    setCurrentNode(null);
    setRunBonus(activeRunBonus);
    setCombatBonus({});
    setRewardChoices([]);
    setPendingBossLoot(false);
    setRunSummary(null);
    setScreen('map');
  };

  const selectNode = node => {
    if (!node.available || node.completed) {
      return;
    }
    setCurrentNode(node);

    if (['fight', 'elite', 'boss'].includes(node.type)) {
      const monster = createScaledMonster(node.type, selectedQuarry);
      const archiveBonus =
        (hasInnovation(settlement, 'monsterArchive') || hasUpgrade(settlement, 'monsterArchive')) &&
        (settlement.monsterKnowledge[monster.baseId] || 0) > 0
          ? 1
          : 0;
      const monsterBonusHp = runBonus.nextCombatMonsterBonusHp || 0;
      const monsterHpPenalty = runBonus.monsterHpPenalty || 0;
      const adjustedMonster = {
        ...monster,
        hp: Math.max(1, monster.hp + monsterBonusHp - monsterHpPenalty),
        maxHp: monster.maxHp + monsterBonusHp
      };
      const activeEffectGear = runState.equippedGear;
      const effects = getEquipmentEffects(activeEffectGear);
      effects.attackDamageBonus += archiveBonus;
      setCombatBonus({
        maxHp: runState.maxHp,
        currentHp: runState.hp,
        survivorName: runState.survivor.name,
        strength: runState.survivor.strength || 0,
        firstCombatStrength: runBonus.firstCombatStrength || 0,
        deck: runState.deck,
        personalCardIds: runState.survivor.personalDeckAdditions || [],
        fightingArts: runState.fightingArts,
        traits: runState.survivor.traits || [],
        survival: runState.survival || 0,
        scars: runState.survivor.scars || [],
        equippedGear: runState.equippedGear,
        equipmentEffects: effects,
        nextCombatStartBlock: runBonus.nextCombatStartBlock || 0,
        nextCombatEnergyPenalty: runBonus.nextCombatEnergyPenalty || 0
      });
      setCurrentCombatMonster(adjustedMonster);
      setRunBonus(current => ({
        ...current,
        firstCombatStrength: 0,
        nextCombatStartBlock: 0,
        nextCombatMonsterBonusHp: 0,
        nextCombatEnergyPenalty: 0,
        monsterHpPenalty: 0
      }));
      setScreen('combat');
      return;
    }

    if (node.type === 'resource') {
      setRewardChoices(chooseUnique(resourceIds, 3));
      setScreen('resourceReward');
      return;
    }

    if (node.type === 'event') {
      setCurrentEvent(events[Math.floor(Math.random() * events.length)]);
      setScreen('event');
      return;
    }

    if (node.type === 'workshopEvent') {
      setCurrentEvent(abandonedWorkshop);
      setScreen('event');
    }
  };

  const completeCurrentNode = () => {
    if (!currentNode) {
      return;
    }
    setRunMap(map => completeMapNode(map, currentNode.id));
    setCurrentNode(null);
    setRewardChoices([]);
    setCurrentEvent(null);
    setScreen('map');
  };

  const chooseResource = resourceId => {
    setRunState(current => ({
      ...current,
      collectedResources: addResource(current.collectedResources, resourceId)
    }));
    completeCurrentNode();
  };

  const handleCombatVictory = combat => {
    const monster = createScaledMonster(currentNode?.type, selectedQuarry);
    let choices = chooseUnique(monster.loot?.length ? monster.loot : DEFAULT_LOOT, 3);
    const rareChance = Math.min(
      1,
      (monster.rareChance || 0) +
      (currentNode?.type === 'elite' ? 0.2 : 0) +
      (currentNode?.type === 'boss' ? 0.35 : 0)
    );
    if (monster.rareLoot?.length && Math.random() < rareChance) {
      const rare = chooseUnique(monster.rareLoot, 1)[0];
      choices = chooseUnique([...monster.loot, rare], 3);
      if (!choices.includes(rare)) choices[choices.length - 1] = rare;
    }

    setRunState(current => ({
      ...current,
      hp: combat.survivor.hp,
      kills: current.kills + 1
    }));
    updateSettlement(current => ({
      ...current,
      monsterKnowledge: {
        ...current.monsterKnowledge,
        [monster.baseId]: (current.monsterKnowledge[monster.baseId] || 0) + 1
      }
    }));
    setRewardChoices(choices);
    setPendingBossLoot(currentNode?.type === 'boss');
    setScreen('lootReward');
  };

  const chooseLoot = resourceId => {
    let nextResources = addResource(runState.collectedResources, resourceId);
    const behaviour = getCreatureBehaviour(selectedQuarry?.quarryId);
    if (currentNode?.type === 'elite') {
      const bonusId = behaviour.lootTable[Math.floor(Math.random() * behaviour.lootTable.length)];
      nextResources = addResource(nextResources, bonusId);
    }
    if ((selectedQuarry?.level || 1) >= 2) {
      const basicResources = resourceIds.filter(id => resources[id]?.type === 'basic');
      const levelThreePool = [...behaviour.lootTable, ...behaviour.rareLootTable]
        .filter(id => resources[id]?.type === 'monster' || resources[id]?.type === 'rare');
      const bonusPool = selectedQuarry.level === 2 ? basicResources : levelThreePool;
      const bonusId = bonusPool[Math.floor(Math.random() * bonusPool.length)];
      nextResources = addResource(nextResources, bonusId);
    }
    const nextRunState = { ...runState, collectedResources: nextResources };
    setRunState(nextRunState);
    setRewardChoices([]);

    if (pendingBossLoot) {
      setPendingBossLoot(false);
      finishRun('victory', nextRunState);
      return;
    }
    completeCurrentNode();
  };

  const transferResources = (current, collectedResources) => {
    const nextStash = { ...current.settlementStash };
    Object.entries(collectedResources).forEach(([id, amount]) => {
      nextStash[id] = (nextStash[id] || 0) + amount;
    });
    // TODO: Later hunt events may cause some gathered resources to be lost.
    return nextStash;
  };

  const finishRun = (outcome, completedRunState = runState, deathDetails = {}) => {
    const completedMap =
      outcome === 'victory' && currentNode
        ? completeMapNode(runMap, currentNode.id)
        : runMap;
    const progress = getRunProgress(completedMap, currentNode);
    const deathBonus =
      outcome === 'death' && hasUpgrade(settlement, 'gravesOfTheFallen') ? 1 : 0;
    const memoryEarned =
      completedRunState.settlementMemoryGained +
      (outcome === 'victory' ? 3 : 1 + deathBonus);
    const survivor = {
      ...completedRunState.survivor,
      completedRuns:
        (completedRunState.survivor.completedRuns || 0) + (outcome === 'victory' ? 1 : 0),
      kills: completedRunState.kills
    };
    const unlockMessages = [];
    if (outcome === 'victory' && selectedQuarry && currentNode?.type === 'boss') {
      const oldLevel = settlement.defeatedQuarryLevels[selectedQuarry.quarryId] || 0;
      const defeatedLevel = Math.max(oldLevel, selectedQuarry.level);
      if (defeatedLevel < 3 && defeatedLevel > oldLevel) {
        unlockMessages.push(`${quarries[selectedQuarry.quarryId].name} Level ${defeatedLevel + 1} unlocked.`);
      }
      const simulatedSettlement = {
        ...settlement,
        defeatedQuarryLevels: {
          ...settlement.defeatedQuarryLevels,
          [selectedQuarry.quarryId]: defeatedLevel
        }
      };
      getNewlyUnlockedQuarries(simulatedSettlement).forEach(id =>
        unlockMessages.push(`${quarries[id].name} unlocked.`)
      );
    }
    const summary = {
      outcome,
      survivorName: survivor.name,
      killedBy: deathDetails.killedBy,
      killedById: deathDetails.killedById,
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      elitesDefeated: progress.elitesDefeated,
      settlementMemoryEarned: memoryEarned,
      resources: completedRunState.collectedResources,
      survivor,
      populationChange: outcome === 'death' ? -1 : 0,
      quarryName: selectedQuarry ? quarries[selectedQuarry.quarryId]?.name : null,
      quarryLevel: selectedQuarry?.level,
      unlockMessages
    };

    setRunMap(completedMap);
    updateSettlement(current => {
      let next = {
        ...current,
        settlementMemory: current.settlementMemory + memoryEarned,
        victoriousRuns: current.victoriousRuns + (outcome === 'victory' ? 1 : 0),
        deadSurvivors: current.deadSurvivors + (outcome === 'death' ? 1 : 0),
        population: Math.max(0, current.population - (outcome === 'death' ? 1 : 0)),
        settlementStash: transferResources(current, completedRunState.collectedResources),
        livingSurvivors: outcome === 'death'
          ? current.livingSurvivors.filter(item => item.id !== survivor.id)
          : current.livingSurvivors
      };
      if (outcome === 'victory' && selectedQuarry && currentNode?.type === 'boss') {
        const oldLevel = next.defeatedQuarryLevels[selectedQuarry.quarryId] || 0;
        const defeatedLevel = Math.max(oldLevel, selectedQuarry.level);
        next = {
          ...next,
          defeatedQuarryLevels: {
            ...next.defeatedQuarryLevels,
            [selectedQuarry.quarryId]: defeatedLevel
          }
        };
        const newQuarries = getNewlyUnlockedQuarries(next);
        if (newQuarries.length) {
          next = { ...next, unlockedQuarries: [...new Set([...next.unlockedQuarries, ...newQuarries])] };
        }
      }
      if (next.population <= 0) next.campaignDefeated = true;
      return next;
    });
    setRunSummary(summary);
    setScreen('runSummary');
  };

  const handleCombatDefeat = deathDetails => {
    finishRun('death', runState, deathDetails);
  };

  const handleEventChoice = choice => {
    const result = resolveEventChoice(choice, {
      runState,
      runBonus,
      hasGraves: hasUpgrade(settlement, 'gravesOfTheFallen')
    });
    setRunState(result.runState);
    setRunBonus(result.runBonus);
    return result.appliedEffects;
  };

  const continueFromSummary = () => {
    if (runSummary?.outcome === 'death') {
      setScreen('graveLegacy');
      return;
    }
    const available = survivorProgressRewards.filter(reward => {
      if (reward.type === 'fightingArt') {
        return !runSummary.survivor.fightingArts.includes(reward.value);
      }
      if (reward.type === 'card') {
        return !runSummary.survivor.personalDeckAdditions.includes(reward.value);
      }
      if (reward.type === 'scar') {
        return !runSummary.survivor.scars.includes(reward.value);
      }
      return true;
    });
    const quietListenerBonus =
      runSummary.survivor.traits?.includes('Quiet Listener') &&
      runSummary.survivor.completedRuns === 1
        ? 1
        : 0;
    setProgressChoices(chooseUnique(
      available,
      (hasInnovation(settlement, 'storytellerCircle') ? 4 : 3) + quietListenerBonus
    ));
    setScreen('survivorProgress');
  };

  const chooseProgress = reward => {
    let survivor = { ...runSummary.survivor };
    if (reward.type === 'maxHp') {
      survivor.maxHp += reward.value;
    } else if (reward.type === 'fightingArt') {
      survivor.fightingArts = [...survivor.fightingArts, reward.value];
    } else if (reward.type === 'card') {
      survivor.personalDeckAdditions = [...survivor.personalDeckAdditions, reward.value];
    } else if (reward.type === 'scar') {
      survivor.scars = [...survivor.scars, reward.value];
    }

    updateSettlement(current => ({
      ...current,
      livingSurvivors: [
        survivor,
        ...current.livingSurvivors.filter(item => item.id !== survivor.id)
      ]
    }));
    returnToSettlement();
  };

  const chooseGraveLegacy = legacy => {
    if (!legacy || !runSummary) {
      return;
    }
    const graveEntry = {
      survivorName: runSummary.survivorName,
      killedBy: runSummary.killedBy || 'unknownMonster',
      nodesCompleted: runSummary.nodesCompleted,
      rowReached: runSummary.rowReached,
      chosenLegacyId: legacy.id,
      completedRuns: runSummary.survivor?.completedRuns || 0,
      fightingArts: runSummary.survivor?.fightingArts || [],
      timestamp: new Date().toISOString()
    };

    updateSettlement(current => {
      const nextRunBonus = { ...(current.nextRunBonus || {}) };
      const monsterKnowledge = { ...(current.monsterKnowledge || {}) };
      let settlementMemory = current.settlementMemory;

      if (legacy.id === graveLegacies.rememberTechnique.id) {
        settlementMemory += 1;
      } else if (legacy.id === graveLegacies.buryGear.id) {
        nextRunBonus.randomMonsterPart = true;
      } else if (legacy.id === graveLegacies.studyDeath.id) {
        const monsterId = runSummary.killedById || 'unknownMonster';
        monsterKnowledge[monsterId] = (monsterKnowledge[monsterId] || 0) + 1;
      } else if (legacy.id === graveLegacies.inheritScar.id) {
        nextRunBonus.extraMaxHp = (nextRunBonus.extraMaxHp || 0) + 1;
      } else if (legacy.id === graveLegacies.oathOfVengeance.id) {
        nextRunBonus.firstCombatStrength = (nextRunBonus.firstCombatStrength || 0) + 1;
      }

      return {
        ...current,
        settlementMemory,
        monsterKnowledge,
        nextRunBonus,
        graveHistory: [graveEntry, ...current.graveHistory]
      };
    });
    returnToSettlement();
  };

  const returnToSettlement = () => {
    setSelectedSurvivor(null);
    setEquippedIds([]);
    setRunMap([]);
    setCurrentNode(null);
    setRunState(createIdleRunState());
    setRunBonus({});
    setCombatBonus({});
    setRewardChoices([]);
    setRunSummary(null);
    setProgressChoices([]);
    setCurrentEvent(null);
    setCurrentCombatMonster(null);
    setSelectedQuarry(null);
    setScreen('settlement');
  };

  const renderScreen = () => {
    if (!settlement) {
      return <CreateSettlementScreen onCreate={name => setSettlement(saveSettlement(createNewSettlement(name)))} />;
    }
    if (screen === 'settlement' && isSettlementDefeated(settlement)) {
      return <SettlementDefeatedScreen settlement={settlement} onReset={() => {
        if (window.confirm('Clear this campaign and start a new settlement?')) {
          resetSettlement();
          setSettlement(null);
        }
      }} />;
    }

    switch (screen) {
      case 'settlement':
        return (
          <SettlementScreen
            settlement={settlement}
            onCraft={handleCraft}
            onBuildInnovation={handleBuildInnovation}
            onBuyUpgrade={buyUpgrade}
            onCreateSurvivor={handleCreateSurvivor}
            onPrepareLivingSurvivor={prepareLivingSurvivor}
            onAttemptIntimacy={handleAttemptIntimacy}
          />
        );
      case 'loadout':
        return (
          <LoadoutScreen
            survivor={selectedSurvivor}
            armory={settlement.armory}
            equippedIds={equippedIds}
            message={loadoutMessage}
            gearLimit={getGearLimit(settlement)}
            onToggleGear={toggleGear}
            onStartHunt={proceedToQuarry}
            onBack={returnToSettlement}
          />
        );
      case 'quarrySelect':
        return (
          <QuarrySelectionScreen
            settlement={settlement}
            onSelect={startHunt}
            onBack={() => setScreen('loadout')}
          />
        );
      case 'map':
        return (
          <MapScreen
            map={runMap}
            onSelectNode={selectNode}
            resources={resourceNames(runState.collectedResources)}
            revealAll={hasInnovation(settlement, 'scoutTower')}
          />
        );
      case 'combat':
        return (
          <CombatScreen
            key={currentNode?.id}
            monster={currentCombatMonster || createScaledMonster(currentNode?.type, selectedQuarry)}
            runBonus={combatBonus}
            onVictory={handleCombatVictory}
            onDefeat={handleCombatDefeat}
          />
        );
      case 'resourceReward':
      case 'lootReward':
        return (
          <LootRewardScreen
            choices={rewardChoices}
            onChoose={screen === 'lootReward' ? chooseLoot : chooseResource}
            rewardNote={screen === 'lootReward'
              ? [
                  currentNode?.type === 'elite' ? 'Elite reward: gain one additional quarry resource.' : '',
                  selectedQuarry?.level === 2 ? 'Level 2 reward: gain one additional basic resource.' : '',
                  selectedQuarry?.level === 3 ? 'Level 3 reward: gain one additional monster or rare resource.' : ''
                ].filter(Boolean).join(' ')
              : ''}
          />
        );
      case 'event':
        return (
          <HuntEventScreen
            event={currentEvent}
            onChoose={handleEventChoice}
            onContinue={completeCurrentNode}
          />
        );
      case 'runSummary':
        return <RunSummaryScreen summary={runSummary} onContinue={continueFromSummary} />;
      case 'survivorProgress':
        return (
          <SurvivorProgressScreen
            survivor={runSummary.survivor}
            choices={progressChoices}
            onChoose={chooseProgress}
          />
        );
      case 'graveLegacy':
        return <GraveLegacyScreen summary={runSummary} onChooseLegacy={chooseGraveLegacy} />;
      default:
        return <div>Unknown Screen</div>;
    }
  };

  return (
    <div className="app">
      <header className="app-title">
        <h1>Lantern Deckbuilder Prototype</h1>
      </header>
      <main>{renderScreen()}</main>
    </div>
  );
}
