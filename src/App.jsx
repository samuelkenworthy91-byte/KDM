import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { graveLegacies } from './data/graveLegacies.js';
import { monsters } from './data/monsters.js';
import {
  defaultInventory,
  resources as resourceData,
  resourceIds
} from './data/resources.js';
import { craftEquipment } from './game/craftingLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import { hasUpgrade, loadSettlement, saveSettlement } from './game/saveLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import CraftingScreen from './screens/CraftingScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import RewardScreen from './screens/RewardScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];
const DEFAULT_LOOT = ['bone', 'hide', 'sinew', 'organ', 'claw'];
const RARE_LOOT = resourceIds.filter(resourceId => resourceData[resourceId].type === 'rare');

const NON_COMBAT_COPY = {
  event: {
    eyebrow: 'Strange Encounter',
    title: 'A Voice Beyond the Lantern Light',
    text: 'The darkness shifts around you. For now, the omen passes without consequence.',
    action: 'Leave the Event'
  }
};

const EMPTY_EQUIPMENT_STATE = {
  craftedEquipment: [],
  deckCardIds: [],
  nextCombatCardIds: [],
  equipmentEffects: {}
};

function createInventory() {
  return { ...defaultInventory };
}

function addResource(inventory, resourceId, amount = 1) {
  return {
    ...inventory,
    [resourceId]: (inventory[resourceId] || 0) + amount
  };
}

function chooseUniqueResources(pool, count = 3) {
  const uniquePool = [...new Set(pool)].filter(resourceId => resourceData[resourceId]);
  const shuffled = [...uniquePool];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count).map(resourceId => resourceData[resourceId]);
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

export default function App() {
  const [screen, setScreen] = useState('settlement');
  const [settlement, setSettlement] = useState(() => loadSettlement());
  const [runMap, setRunMap] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [inventory, setInventory] = useState(createInventory);
  const [rewardChoices, setRewardChoices] = useState([]);
  const [equipmentState, setEquipmentState] = useState(EMPTY_EQUIPMENT_STATE);
  const [runBonus, setRunBonus] = useState({});
  const [combatBonus, setCombatBonus] = useState({});
  const [runSummary, setRunSummary] = useState(null);

  const updateSettlement = updater => {
    setSettlement(current => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      return saveSettlement(next);
    });
  };

  const getRunProgress = (map = runMap, activeNode = currentNode) => {
    const completedNodes = map.flat().filter(node => node.completed).length;
    const reachedRows = [
      ...map.flat().filter(node => node.completed).map(node => node.row + 1),
      activeNode ? activeNode.row + 1 : 0
    ];

    return {
      nodesCompleted: completedNodes,
      rowReached: Math.max(0, ...reachedRows)
    };
  };

  const buyUpgrade = upgrade => {
    updateSettlement(current => {
      if (
        hasUpgrade(current, upgrade.id) ||
        current.settlementMemory < upgrade.cost
      ) {
        return current;
      }

      return {
        ...current,
        settlementMemory: current.settlementMemory - upgrade.cost,
        unlockedUpgrades: [...current.unlockedUpgrades, upgrade.id]
      };
    });
  };

  const startRun = () => {
    if (screen !== 'settlement') {
      return;
    }

    const nextRunBonus = settlement.nextRunBonus || {};
    let startingInventory = createInventory();
    const activeRunBonus = {};

    if (nextRunBonus.randomMonsterPart) {
      const partId = RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)];
      startingInventory = addResource(startingInventory, partId);
    }

    const boneSmithBonus = hasUpgrade(settlement, 'boneSmith') ? 1 : 0;
    if (boneSmithBonus > 0) {
      startingInventory = addResource(startingInventory, 'bone', boneSmithBonus);
    }

    if (nextRunBonus.extraMaxHp) {
      activeRunBonus.extraMaxHp = nextRunBonus.extraMaxHp;
    }

    if (nextRunBonus.firstCombatStrength) {
      activeRunBonus.firstCombatStrength = nextRunBonus.firstCombatStrength;
    }

    activeRunBonus.revealAllNodeTypes = hasUpgrade(settlement, 'scoutPath');
    activeRunBonus.storytellerActive = hasUpgrade(settlement, 'storyteller');
    activeRunBonus.storytellerRewardUsed = false;

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
    setRunMap(generateMap());
    setCurrentNode(null);
    setInventory(startingInventory);
    setRewardChoices([]);
    setEquipmentState(EMPTY_EQUIPMENT_STATE);
    setRunBonus(activeRunBonus);
    setCombatBonus({});
    setRunSummary(null);
    setScreen('map');
  };

  const selectNode = node => {
    if (!node.available || node.completed) {
      return;
    }

    setCurrentNode(node);

    if (['fight', 'elite', 'boss'].includes(node.type)) {
      const firstCombatStrength = runBonus.firstCombatStrength || 0;
      const monster = createScaledMonster(node.type);
      const archiveDamageBonus =
        hasUpgrade(settlement, 'monsterArchive') &&
        (settlement.monsterKnowledge[monster.baseId] || 0) > 0
          ? 1
          : 0;
      const nextCombatBonus = {
        extraMaxHp: runBonus.extraMaxHp || 0,
        firstCombatStrength,
        ...equipmentState,
        equipmentEffects: {
          ...equipmentState.equipmentEffects,
          attackDamageBonus:
            (equipmentState.equipmentEffects.attackDamageBonus || 0) + archiveDamageBonus
        }
      };

      setCombatBonus(nextCombatBonus);
      if (equipmentState.nextCombatCardIds.length) {
        setEquipmentState(current => ({ ...current, nextCombatCardIds: [] }));
      }
      if (firstCombatStrength) {
        setRunBonus(current => ({ ...current, firstCombatStrength: 0 }));
      }
      setScreen('combat');
      return;
    }

    if (node.type === 'resource') {
      setRewardChoices(chooseUniqueResources(resourceIds));
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

  const chooseReward = resourceId => {
    setInventory(current => addResource(current, resourceId));
    completeCurrentNode();
  };

  const handleCombatVictory = () => {
    const defeatedMonsterId = createScaledMonster(currentNode?.type).baseId;

    if (currentNode?.type === 'boss') {
      const rareResourceId = RARE_LOOT[Math.floor(Math.random() * RARE_LOOT.length)];
      const finalInventory = addResource(inventory, rareResourceId);
      const completedMap = completeMapNode(runMap, currentNode.id);
      const progress = getRunProgress(completedMap, currentNode);
      const settlementMemoryEarned = 3;
      const summary = {
        outcome: 'victory',
        survivorName: 'Survivor',
        nodesCompleted: progress.nodesCompleted,
        rowReached: progress.rowReached,
        settlementMemoryEarned,
        resources: finalInventory,
        bossResource: resourceData[rareResourceId]?.name
      };

      setRunMap(completedMap);
      setInventory(finalInventory);
      setRunSummary(summary);
      updateSettlement(current => ({
        ...current,
        settlementMemory: current.settlementMemory + settlementMemoryEarned,
        victoriousRuns: current.victoriousRuns + 1,
        monsterKnowledge: {
          ...current.monsterKnowledge,
          [defeatedMonsterId]: (current.monsterKnowledge[defeatedMonsterId] || 0) + 1
        }
      }));
      setScreen('runSummary');
      return;
    }

    const monster = createScaledMonster(currentNode?.type);
    const lootPool = monster.loot?.length ? monster.loot : DEFAULT_LOOT;
    const storytellerBonus =
      runBonus.storytellerActive && !runBonus.storytellerRewardUsed ? 1 : 0;
    const choices =
      currentNode?.type === 'elite'
        ? [
            ...chooseUniqueResources(lootPool, 2 + storytellerBonus),
            resourceData[RARE_LOOT[Math.floor(Math.random() * RARE_LOOT.length)]]
          ]
        : chooseUniqueResources(lootPool, 3 + storytellerBonus);

    updateSettlement(current => ({
      ...current,
      monsterKnowledge: {
        ...current.monsterKnowledge,
        [defeatedMonsterId]: (current.monsterKnowledge[defeatedMonsterId] || 0) + 1
      }
    }));
    if (storytellerBonus) {
      setRunBonus(current => ({ ...current, storytellerRewardUsed: true }));
    }
    setRewardChoices(choices);
    setScreen('lootReward');
  };

  const handleCombatDefeat = deathDetails => {
    const progress = getRunProgress();
    const completedElites = runMap
      .flat()
      .filter(node => node.completed && node.type === 'elite').length;
    const progressReward = progress.rowReached >= 2 ? 1 : 0;
    const eliteReward = completedElites > 0 ? 1 : 0;
    const graveReward = hasUpgrade(settlement, 'gravesOfTheFallen') ? 1 : 0;
    const settlementMemoryEarned = 1 + progressReward + eliteReward + graveReward;
    const summary = {
      outcome: 'death',
      survivorName: deathDetails?.survivorName || 'Survivor',
      killedBy: deathDetails?.killedBy || 'unknownMonster',
      killedById: deathDetails?.killedById || 'unknownMonster',
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned,
      resources: inventory
    };

    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: current.settlementMemory + settlementMemoryEarned,
      deadSurvivors: current.deadSurvivors + 1
    }));
    setScreen('runSummary');
  };

  const handleCraft = equipmentItem => {
    const result = craftEquipment(equipmentItem, inventory, equipmentState);

    if (!result.crafted) {
      return;
    }

    setInventory(result.inventory);
    setEquipmentState(result.runState);
  };

  const returnToSettlement = () => {
    setRunMap([]);
    setCurrentNode(null);
    setInventory(createInventory());
    setRewardChoices([]);
    setEquipmentState(EMPTY_EQUIPMENT_STATE);
    setRunBonus({});
    setCombatBonus({});
    setRunSummary(null);
    setScreen('settlement');
  };

  const continueFromSummary = () => {
    if (runSummary?.outcome === 'death') {
      setScreen('graveLegacy');
      return;
    }

    returnToSettlement();
  };

  const chooseGraveLegacy = legacy => {
    if (!legacy || !runSummary) {
      return;
    }

    const killedById = runSummary.killedById || 'unknownMonster';
    const graveEntry = {
      survivorName: runSummary.survivorName,
      killedBy: runSummary.killedBy || 'unknownMonster',
      nodesCompleted: runSummary.nodesCompleted,
      rowReached: runSummary.rowReached,
      chosenLegacyId: legacy.id,
      timestamp: new Date().toISOString()
    };

    updateSettlement(current => {
      const nextRunBonus = { ...(current.nextRunBonus || {}) };
      const monsterKnowledge = { ...(current.monsterKnowledge || {}) };
      let settlementMemory = current.settlementMemory || 0;

      if (legacy.id === graveLegacies.rememberTechnique.id) {
        settlementMemory += 1;
      } else if (legacy.id === graveLegacies.buryGear.id) {
        nextRunBonus.randomMonsterPart = true;
      } else if (legacy.id === graveLegacies.studyDeath.id) {
        monsterKnowledge[killedById] = (monsterKnowledge[killedById] || 0) + 1;
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
        graveHistory: [graveEntry, ...(current.graveHistory || [])]
      };
    });

    returnToSettlement();
  };

  const renderPlaceholder = type => {
    const copy = NON_COMBAT_COPY[type];

    return (
      <section className="placeholder-screen">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.text}</p>
        <button type="button" onClick={completeCurrentNode}>
          {copy.action}
        </button>
      </section>
    );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'settlement':
        return (
          <SettlementScreen
            settlement={settlement}
            onBuyUpgrade={buyUpgrade}
            onStartRun={startRun}
          />
        );
      case 'map':
        return (
          <MapScreen
            map={runMap}
            onSelectNode={selectNode}
            inventory={inventory}
            craftedEquipment={equipmentState.craftedEquipment}
            revealAllNodeTypes={runBonus.revealAllNodeTypes}
          />
        );
      case 'combat':
        return (
          <CombatScreen
            key={currentNode?.id}
            monster={createScaledMonster(currentNode?.type)}
            runBonus={combatBonus}
            craftedEquipment={combatBonus.craftedEquipment}
            onVictory={handleCombatVictory}
            onDefeat={handleCombatDefeat}
          />
        );
      case 'resourceReward':
        return (
          <RewardScreen
            eyebrow="Scavenged Remains"
            title="Choose a Resource"
            text="Three useful remains lie among the ruin. Carry only one onward."
            choices={rewardChoices}
            inventory={inventory}
            onChoose={chooseReward}
          />
        );
      case 'lootReward':
        return (
          <RewardScreen
            eyebrow={currentNode?.type === 'elite' ? 'Elite Spoils' : 'Monster Parts'}
            title="Claim Your Trophy"
            text="Choose one part from the defeated monster."
            choices={rewardChoices}
            inventory={inventory}
            onChoose={chooseReward}
          />
        );
      case 'event':
        return renderPlaceholder(screen);
      case 'craft':
        return (
          <CraftingScreen
            inventory={inventory}
            craftedEquipment={equipmentState.craftedEquipment}
            onCraft={handleCraft}
            onReturn={completeCurrentNode}
          />
        );
      case 'runSummary':
        return (
          <RunSummaryScreen summary={runSummary} onContinue={continueFromSummary} />
        );
      case 'graveLegacy':
        return (
          <GraveLegacyScreen summary={runSummary} onChooseLegacy={chooseGraveLegacy} />
        );
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
