import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { starterDeck } from './data/cards.js';
import { equipment } from './data/equipment.js';
import { graveLegacies } from './data/graveLegacies.js';
import { monsters } from './data/monsters.js';
import { emptyInventory, resourceIds, resources } from './data/resources.js';
import { craftEquipment, getEquipmentEffects } from './game/craftingLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import { hasUpgrade, loadSettlement, saveSettlement } from './game/saveLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import LoadoutScreen from './screens/LoadoutScreen.jsx';
import LootRewardScreen from './screens/LootRewardScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';
import SurvivorProgressScreen, {
  survivorProgressRewards
} from './screens/SurvivorProgressScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];
const DEFAULT_LOOT = ['bone', 'hide', 'sinew', 'organ', 'claw', 'fur', 'monsterTooth'];
const RARE_LOOT = ['strangeEye', 'horn', 'ichor'];

function createSurvivor(name) {
  return {
    id: `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || 'Nameless Survivor',
    maxHp: 30,
    strength: 0,
    personalDeckAdditions: [],
    fightingArts: [],
    completedRuns: 0,
    kills: 0,
    scars: [],
    isAlive: true
  };
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
    settlementMemoryGained: 0
  };
}

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

function createScaledMonster(type) {
  const base = monsters.whiteLion;
  const multiplier = type === 'boss' ? 2 : type === 'elite' ? 1.5 : 1;
  const damageBonus = type === 'boss' ? 4 : type === 'elite' ? 2 : 0;
  const hp = Math.round(base.maxHp * multiplier);

  return {
    ...base,
    baseId: base.id,
    id: `${base.id}-${type}`,
    name:
      type === 'boss'
        ? `Ancient ${base.name}`
        : type === 'elite'
          ? `Frenzied ${base.name}`
          : base.name,
    hp,
    maxHp: hp,
    intents: base.intents.map(intent =>
      intent.type === 'attack'
        ? { ...intent, damage: intent.damage + damageBonus }
        : { ...intent }
    )
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

  const updateSettlement = updater => {
    setSettlement(current => {
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
      const result = craftEquipment(item, current.settlementStash, current.armory);
      return result.crafted
        ? { ...current, settlementStash: result.stash, armory: result.armory }
        : current;
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

  const toggleGear = instanceId => {
    if (equippedIds.includes(instanceId)) {
      setEquippedIds(ids => ids.filter(id => id !== instanceId));
      setLoadoutMessage('');
      return;
    }
    if (equippedIds.length >= 4) {
      setLoadoutMessage('A survivor can equip no more than 4 pieces of gear.');
      return;
    }
    setEquippedIds(ids => [...ids, instanceId]);
    setLoadoutMessage('');
  };

  const startHunt = () => {
    if (!selectedSurvivor) {
      return;
    }

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
      kills: selectedSurvivor.kills || 0,
      settlementMemoryGained: 0
    });
    setRunMap(generateMap());
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
      const monster = createScaledMonster(node.type);
      const archiveBonus =
        hasUpgrade(settlement, 'monsterArchive') &&
        (settlement.monsterKnowledge[monster.baseId] || 0) > 0
          ? 1
          : 0;
      const activeEffectGear = runState.equippedGear.filter(
        item => item.slot !== 'consumable' || !runState.usedConsumableGear.includes(item.instanceId)
      );
      const effects = getEquipmentEffects(activeEffectGear);
      effects.attackDamageBonus += archiveBonus;
      setCombatBonus({
        maxHp: runState.maxHp,
        currentHp: runState.hp,
        survivorName: runState.survivor.name,
        strength: runState.survivor.strength || 0,
        firstCombatStrength: runBonus.firstCombatStrength || 0,
        deck: runState.deck,
        fightingArts: runState.fightingArts,
        scars: runState.survivor.scars || [],
        equippedGear: runState.equippedGear,
        equipmentEffects: effects
      });
      if (runBonus.firstCombatStrength) {
        setRunBonus(current => ({ ...current, firstCombatStrength: 0 }));
      }
      const usedConsumables = activeEffectGear
        .filter(item => item.slot === 'consumable')
        .map(item => item.instanceId);
      if (usedConsumables.length) {
        setRunState(current => ({
          ...current,
          usedConsumableGear: [
            ...new Set([...current.usedConsumableGear, ...usedConsumables])
          ]
        }));
      }
      setScreen('combat');
      return;
    }

    if (node.type === 'resource') {
      setRewardChoices(chooseUnique(resourceIds, 3));
      setScreen('resourceReward');
      return;
    }

    setScreen(node.type);
  };

  const completeCurrentNode = () => {
    if (!currentNode) {
      return;
    }
    setRunMap(map => completeMapNode(map, currentNode.id));
    setCurrentNode(null);
    setRewardChoices([]);
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
    const monster = createScaledMonster(currentNode?.type);
    let choices = chooseUnique(monster.loot?.length ? monster.loot : DEFAULT_LOOT, 3);
    if (currentNode?.type === 'elite' || currentNode?.type === 'boss') {
      choices = chooseUnique([...choices, ...RARE_LOOT], 3);
      if (!choices.some(id => RARE_LOOT.includes(id))) {
        choices[choices.length - 1] = chooseUnique(RARE_LOOT, 1)[0];
      }
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
    const nextResources = addResource(runState.collectedResources, resourceId);
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
      survivor
    };

    setRunMap(completedMap);
    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: current.settlementMemory + memoryEarned,
      victoriousRuns: current.victoriousRuns + (outcome === 'victory' ? 1 : 0),
      deadSurvivors: current.deadSurvivors + (outcome === 'death' ? 1 : 0),
      settlementStash: transferResources(current, completedRunState.collectedResources),
      livingSurvivors:
        outcome === 'death'
          ? current.livingSurvivors.filter(item => item.id !== survivor.id)
          : current.livingSurvivors
    }));
    setScreen('runSummary');
  };

  const handleCombatDefeat = deathDetails => {
    finishRun('death', runState, deathDetails);
  };

  const handleWorkshopChoice = choice => {
    if (choice === 'scrap') {
      setRunState(current => ({
        ...current,
        collectedResources: addResource(current.collectedResources, 'scrap')
      }));
    } else if (choice === 'memory') {
      setRunState(current => ({
        ...current,
        settlementMemoryGained: current.settlementMemoryGained + 1
      }));
    } else if (choice === 'heal') {
      setRunState(current => ({
        ...current,
        hp: Math.min(current.maxHp, current.hp + 2)
      }));
    }
    completeCurrentNode();
  };

  const handleEventReward = () => {
    const resourceId = resourceIds[Math.floor(Math.random() * resourceIds.length)];
    setRunState(current => ({
      ...current,
      collectedResources: addResource(current.collectedResources, resourceId)
    }));
    completeCurrentNode();
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
    setProgressChoices(chooseUnique(available, 3));
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
    setScreen('settlement');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'settlement':
        return (
          <SettlementScreen
            settlement={settlement}
            onCraft={handleCraft}
            onBuyUpgrade={buyUpgrade}
            onPrepareNewSurvivor={name => prepareSurvivor(createSurvivor(name))}
            onPrepareLivingSurvivor={prepareLivingSurvivor}
          />
        );
      case 'loadout':
        return (
          <LoadoutScreen
            survivor={selectedSurvivor}
            armory={settlement.armory}
            equippedIds={equippedIds}
            message={loadoutMessage}
            onToggleGear={toggleGear}
            onStartHunt={startHunt}
            onBack={returnToSettlement}
          />
        );
      case 'map':
        return (
          <MapScreen
            map={runMap}
            onSelectNode={selectNode}
            resources={resourceNames(runState.collectedResources)}
          />
        );
      case 'combat':
        return (
          <CombatScreen
            key={currentNode?.id}
            monster={createScaledMonster(currentNode?.type)}
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
          />
        );
      case 'workshop':
        return (
          <section className="placeholder-screen">
            <p className="eyebrow">Workshop Event</p>
            <h2>Abandoned Workshop</h2>
            <p>Crafting happens at the settlement. Here, only broken tools remain.</p>
            <div className="screen-actions">
              <button type="button" onClick={() => handleWorkshopChoice('scrap')}>Scavenge: gain 1 Scrap</button>
              <button type="button" onClick={() => handleWorkshopChoice('memory')}>Study tools: gain 1 Memory</button>
              <button type="button" onClick={() => handleWorkshopChoice('heal')}>Patch wounds: heal 2 HP</button>
            </div>
          </section>
        );
      case 'event':
        return (
          <section className="placeholder-screen">
            <p className="eyebrow">Strange Encounter</p>
            <h2>A Carcass Beyond the Light</h2>
            <p>You take one uncertain resource and continue.</p>
            <button type="button" onClick={handleEventReward}>Harvest and Leave</button>
          </section>
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
