import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { starterDeck } from './data/cards.js';
import { equipment } from './data/equipment.js';
import { graveLegacies } from './data/graveLegacies.js';
import { monsters } from './data/monsters.js';
import { emptyInventory, resources as resourceData } from './data/resources.js';
import {
  applyEventChoice,
  addResourceToInventory,
  getRandomEvent,
  getResourceNodeChoices
} from './game/eventLogic.js';
import { craftEquipment, getEquipmentEffects } from './game/craftingLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import { hasUpgrade, loadSettlement, saveSettlement } from './game/saveLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import CraftingScreen from './screens/CraftingScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import LootRewardScreen from './screens/LootRewardScreen.jsx';
import ResourceScreen from './screens/ResourceScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';
import SurvivorProgressScreen, {
  survivorProgressRewards
} from './screens/SurvivorProgressScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];
const DEFAULT_LOOT = ['bone', 'hide', 'sinew', 'organ', 'claw'];
const RARE_LOOT = ['strangeEye', 'horn', 'ichor'];

function createSurvivor(name) {
  return {
    id: `survivor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name?.trim() || 'Nameless Survivor',
    maxHp: 30,
    strength: 0,
    personalDeckAdditions: [],
    fightingArts: [],
    craftedEquipment: [],
    completedRuns: 0,
    kills: 0,
    scars: [],
    isAlive: true
  };
}

function createIdleRunState() {
  return {
    hp: 30,
    maxHp: 30,
    survival: 0,
    survivor: createSurvivor('Nameless Survivor'),
    inventory: { ...emptyInventory },
    resources: [],
    deck: starterDeck.map(card => card.id),
    personalDeckAdditions: [],
    craftedEquipment: [],
    equipmentEffects: {},
    nextCombatModifiers: {},
    fightingArts: [],
    kills: 0
  };
}

function chooseUnique(ids, count) {
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

export default function App() {
  const [screen, setScreen] = useState('settlement');
  const [settlement, setSettlement] = useState(() => loadSettlement());
  const [runMap, setRunMap] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [runState, setRunState] = useState(createIdleRunState);
  const [activeEvent, setActiveEvent] = useState(null);
  const [resourceChoices, setResourceChoices] = useState([]);
  const [lootChoices, setLootChoices] = useState([]);
  const [pendingLoot, setPendingLoot] = useState(null);
  const [progressChoices, setProgressChoices] = useState([]);
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

  const startRunWithSurvivor = survivor => {
    if (screen !== 'settlement') {
      return;
    }

    const nextRunBonus = settlement.nextRunBonus || {};
    const equipmentEffects = getEquipmentEffects(survivor.craftedEquipment, equipment);
    const baseMaxHp = survivor.maxHp || 30;
    let startingState = {
      hp: baseMaxHp,
      maxHp: baseMaxHp,
      survival: 0,
      survivor: { ...survivor },
      inventory: { ...emptyInventory },
      resources: [],
      deck: [
        ...starterDeck.map(card => card.id),
        ...(survivor.personalDeckAdditions || [])
      ],
      personalDeckAdditions: [...(survivor.personalDeckAdditions || [])],
      craftedEquipment: [...(survivor.craftedEquipment || [])],
      equipmentEffects,
      nextCombatModifiers: {},
      fightingArts: [...(survivor.fightingArts || [])],
      kills: survivor.kills || 0
    };
    const activeRunBonus = {};

    if (nextRunBonus.randomMonsterPart) {
      const partId = RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)];
      startingState = addResourceToInventory(startingState, partId, 1);
    }

    if (hasUpgrade(settlement, 'boneSmith')) {
      startingState = addResourceToInventory(startingState, 'bone', 1);
    }

    if (nextRunBonus.extraMaxHp) {
      activeRunBonus.extraMaxHp = nextRunBonus.extraMaxHp;
      startingState.hp += nextRunBonus.extraMaxHp;
      startingState.maxHp += nextRunBonus.extraMaxHp;
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
    setRunMap(generateMap());
    setCurrentNode(null);
    setRunState(startingState);
    setActiveEvent(null);
    setResourceChoices([]);
    setLootChoices([]);
    setPendingLoot(null);
    setProgressChoices([]);
    setRunBonus(activeRunBonus);
    setCombatBonus({});
    setRunSummary(null);
    setScreen('map');
  };

  const startNewSurvivor = survivorName => {
    startRunWithSurvivor(createSurvivor(survivorName));
  };

  const startLivingSurvivor = survivorId => {
    const survivor = settlement.livingSurvivors.find(
      item => item.id === survivorId && item.isAlive
    );
    if (survivor) {
      startRunWithSurvivor(survivor);
    }
  };

  const selectNode = node => {
    if (!node.available || node.completed) {
      return;
    }

    setCurrentNode(node);

    if (['fight', 'elite', 'boss'].includes(node.type)) {
      const firstCombatStrength = runBonus.firstCombatStrength || 0;
      const monster = createScaledMonster(node.type);
      const archiveBonus =
        hasUpgrade(settlement, 'monsterArchive') &&
        (settlement.monsterKnowledge[monster.baseId] || 0) > 0
          ? 1
          : 0;
      const nextCombatBonus = {
        maxHp: runState.maxHp,
        strength: runState.survivor?.strength || 0,
        firstCombatStrength,
        survivorName: runState.survivor?.name || 'Nameless Survivor',
        currentHp: runState.hp,
        deck: runState.deck,
        nextCombatModifiers: runState.nextCombatModifiers || {},
        fightingArts: runState.fightingArts || [],
        craftedEquipment: runState.craftedEquipment || [],
        equipmentEffects: {
          ...(runState.equipmentEffects || {}),
          attackDamageBonus:
            (runState.equipmentEffects?.attackDamageBonus || 0) + archiveBonus
        },
        scars: runState.survivor?.scars || []
      };

      setCombatBonus(nextCombatBonus);
      setRunState(current => ({ ...current, nextCombatModifiers: {} }));
      if (firstCombatStrength) {
        setRunBonus(current => ({ ...current, firstCombatStrength: 0 }));
      }
      setScreen('combat');
      return;
    }

    if (node.type === 'resource') {
      setResourceChoices(getResourceNodeChoices());
      setScreen('resource');
      return;
    }

    if (node.type === 'event') {
      setActiveEvent(getRandomEvent());
      setScreen('event');
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
    setActiveEvent(null);
    setResourceChoices([]);
    setScreen('map');
  };

  const chooseResource = offer => {
    setRunState(current => {
      const withResource = addResourceToInventory(current, offer.resourceId, 1);
      return {
        ...withResource,
        hp: Math.max(0, withResource.hp - (offer.hpCost || 0))
      };
    });
  };

  const chooseEvent = choice => {
    const result = applyEventChoice(activeEvent, choice, runState, settlement);
    setRunState(result.runState);
    updateSettlement(result.settlement);
    return result;
  };

  const resourceNames = (runState.resources || []).map(
    id => resourceData[id]?.name || id
  );

  const finishVictory = completedRunState => {
    const completedMap = completeMapNode(runMap, currentNode.id);
    const progress = getRunProgress(completedMap, currentNode);
    const summary = {
      outcome: 'victory',
      survivorName: completedRunState.survivor.name,
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: 3,
      resources: completedRunState.resources.map(id => resourceData[id]?.name || id),
      survivor: completedRunState.survivor
    };

    setRunMap(completedMap);
    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: current.settlementMemory + summary.settlementMemoryEarned,
      victoriousRuns: current.victoriousRuns + 1
    }));
    setScreen('runSummary');
  };

  const handleCombatVictory = combat => {
    const monster = createScaledMonster(currentNode?.type);
    const updatedRunState = {
      ...runState,
      hp: combat.survivor.hp,
      kills: (runState.kills || 0) + 1
    };
    const baseLoot = monster.loot?.length ? monster.loot : DEFAULT_LOOT;
    let choices = chooseUnique(baseLoot, 3);

    if (currentNode?.type === 'elite') {
      choices = chooseUnique([...baseLoot, ...RARE_LOOT], 3);
      if (!choices.some(id => RARE_LOOT.includes(id))) {
        choices[choices.length - 1] = chooseUnique(RARE_LOOT, 1)[0];
      }
    }

    if (currentNode?.type === 'boss') {
      choices = chooseUnique([...baseLoot, ...RARE_LOOT], 3);
      if (!choices.some(id => RARE_LOOT.includes(id))) {
        choices[choices.length - 1] = chooseUnique(RARE_LOOT, 1)[0];
      }
    }

    updateSettlement(current => ({
      ...current,
      monsterKnowledge: {
        ...current.monsterKnowledge,
        [monster.baseId]: (current.monsterKnowledge[monster.baseId] || 0) + 1
      }
    }));
    setRunState(updatedRunState);
    setLootChoices(choices);
    setPendingLoot({ isBoss: currentNode?.type === 'boss' });
    setScreen('lootReward');
  };

  const chooseLootReward = resourceId => {
    const updatedRunState = addResourceToInventory(runState, resourceId, 1);
    setRunState(updatedRunState);
    setLootChoices([]);

    if (pendingLoot?.isBoss) {
      setPendingLoot(null);
      finishVictory(updatedRunState);
      return;
    }

    setPendingLoot(null);
    completeCurrentNode();
  };

  const handleCombatDefeat = deathDetails => {
    const progress = getRunProgress();
    const completedElites = runMap
      .flat()
      .filter(node => node.completed && node.type === 'elite').length;
    const progressReward = progress.rowReached >= 2 ? 1 : 0;
    const eliteReward = completedElites > 0 ? 1 : 0;
    const graveReward = hasUpgrade(settlement, 'gravesOfTheFallen') ? 1 : 0;
    const summary = {
      outcome: 'death',
      survivorName:
        deathDetails?.survivorName ||
        runState.survivor?.name ||
        'Nameless Survivor',
      killedBy: deathDetails?.killedBy || 'unknownMonster',
      killedById: deathDetails?.killedById || 'unknownMonster',
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: 1 + progressReward + eliteReward + graveReward,
      resources: resourceNames,
      survivor: {
        ...runState.survivor,
        completedRuns: runState.survivor?.completedRuns || 0,
        kills: runState.kills || 0,
        craftedEquipment: runState.craftedEquipment || [],
        fightingArts: runState.fightingArts || [],
        personalDeckAdditions: runState.personalDeckAdditions || []
      }
    };

    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: current.settlementMemory + summary.settlementMemoryEarned,
      deadSurvivors: current.deadSurvivors + 1,
      livingSurvivors: current.livingSurvivors.filter(
        survivor => survivor.id !== runState.survivor?.id
      )
    }));
    setScreen('runSummary');
  };

  const handleCraft = item => {
    setRunState(current => craftEquipment(item, current, equipment).runState);
  };

  const returnToSettlement = () => {
    setRunMap([]);
    setCurrentNode(null);
    setRunState(createIdleRunState());
    setRunBonus({});
    setCombatBonus({});
    setActiveEvent(null);
    setResourceChoices([]);
    setLootChoices([]);
    setPendingLoot(null);
    setProgressChoices([]);
    setRunSummary(null);
    setScreen('settlement');
  };

  const continueFromSummary = () => {
    if (runSummary?.outcome === 'death') {
      setScreen('graveLegacy');
      return;
    }

    const hasPersonalCurse = (runState.personalDeckAdditions || []).some(id =>
      ['panic', 'shame', 'curse'].includes(id)
    );
    setProgressChoices(
      chooseUnique(
        survivorProgressRewards.filter(
          reward =>
            (reward.type !== 'removeCurse' || hasPersonalCurse) &&
            (reward.type !== 'fightingArt' ||
              !runState.fightingArts?.includes(reward.value)) &&
            (reward.type !== 'card' ||
              !runState.personalDeckAdditions?.includes(reward.value)) &&
            (reward.type !== 'scar' ||
              !runState.survivor?.scars?.includes(reward.value))
        ),
        3
      )
    );
    setScreen('survivorProgress');
  };

  const chooseSurvivorProgress = reward => {
    let survivor = {
      ...runState.survivor,
      maxHp: runState.survivor?.maxHp || 30,
      personalDeckAdditions: [...(runState.personalDeckAdditions || [])],
      fightingArts: [...(runState.fightingArts || [])],
      craftedEquipment: [...(runState.craftedEquipment || [])],
      completedRuns: (runState.survivor?.completedRuns || 0) + 1,
      kills: runState.kills || 0,
      scars: [...(runState.survivor?.scars || [])],
      isAlive: true
    };

    if (reward.type === 'fightingArt') {
      survivor.fightingArts = [...new Set([...survivor.fightingArts, reward.value])];
    } else if (reward.type === 'card') {
      survivor.personalDeckAdditions.push(reward.value);
    } else if (reward.type === 'maxHp') {
      survivor.maxHp += reward.value;
    } else if (reward.type === 'strength') {
      survivor.strength = (survivor.strength || 0) + reward.value;
    } else if (reward.type === 'scar') {
      survivor.scars = [...new Set([...survivor.scars, reward.value])];
    } else if (reward.type === 'removeCurse') {
      const curseIndex = survivor.personalDeckAdditions.findIndex(id =>
        ['panic', 'shame', 'curse'].includes(id)
      );
      if (curseIndex >= 0) {
        survivor.personalDeckAdditions.splice(curseIndex, 1);
      }
    }

    updateSettlement(current => {
      const otherSurvivors = current.livingSurvivors.filter(item => item.id !== survivor.id);
      return {
        ...current,
        livingSurvivors: [...otherSurvivors, survivor]
      };
    });
    returnToSettlement();
  };

  const chooseGraveLegacy = legacy => {
    if (!legacy || !runSummary) {
      return;
    }

    const killedById = runSummary.killedById || 'unknownMonster';
    const graveEntry = {
      survivorName: runSummary.survivorName,
      completedRuns: runSummary.survivor?.completedRuns || 0,
      equipmentCount: runSummary.survivor?.craftedEquipment?.length || 0,
      fightingArts: runSummary.survivor?.fightingArts || [],
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

  const renderScreen = () => {
    switch (screen) {
      case 'settlement':
        return (
          <SettlementScreen
            settlement={settlement}
            onBuyUpgrade={buyUpgrade}
            onStartRun={startNewSurvivor}
            onStartLivingSurvivor={startLivingSurvivor}
          />
        );
      case 'map':
        return (
          <MapScreen
            map={runMap}
            onSelectNode={selectNode}
            resources={resourceNames}
            survivorName={runState.survivor?.name}
            fightingArts={runState.fightingArts}
            inventory={runState.inventory}
            craftedEquipment={runState.craftedEquipment}
            revealAllNodeTypes={hasUpgrade(settlement, 'scoutPath')}
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
      case 'resource':
        return (
          <ResourceScreen
            key={currentNode?.id}
            choices={resourceChoices}
            inventory={runState.inventory}
            onChoose={chooseResource}
            onContinue={completeCurrentNode}
          />
        );
      case 'event':
        return activeEvent ? (
          <EventScreen
            key={currentNode?.id}
            event={activeEvent}
            runState={runState}
            onChoose={chooseEvent}
            onContinue={completeCurrentNode}
          />
        ) : null;
      case 'craft':
        return (
          <CraftingScreen
            runState={runState}
            onCraft={handleCraft}
            onContinue={completeCurrentNode}
          />
        );
      case 'lootReward':
        return (
          <LootRewardScreen
            choices={lootChoices}
            inventory={runState.inventory}
            isBoss={pendingLoot?.isBoss}
            onChoose={chooseLootReward}
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
      case 'survivorProgress':
        return (
          <SurvivorProgressScreen
            survivor={runState.survivor}
            choices={progressChoices}
            onChoose={chooseSurvivorProgress}
          />
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
