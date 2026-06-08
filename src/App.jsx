import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { starterDeck } from './data/cards.js';
import { graveLegacies } from './data/graveLegacies.js';
import { monsters } from './data/monsters.js';
import { resources as resourceData } from './data/resources.js';
import {
  applyEventChoice,
  applyResourceGain,
  getRandomEvent,
  getResourceNodeChoices
} from './game/eventLogic.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import { hasUpgrade, loadSettlement, saveSettlement } from './game/saveLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import EventScreen from './screens/EventScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import ResourceScreen from './screens/ResourceScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];

const NON_COMBAT_COPY = {
  craft: {
    eyebrow: 'Makeshift Forge',
    title: 'Crafting',
    text: 'The crafting station is not yet fully stocked. You tend your gear and prepare to move on.',
    action: 'Finish Crafting'
  }
};

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
  const [runState, setRunState] = useState({
    hp: 30,
    maxHp: 30,
    survival: 0,
    survivor: { name: 'Nameless Survivor' },
    inventory: {},
    resources: [],
    deck: starterDeck.map(card => card.id),
    nextCombatModifiers: {},
    fightingArts: []
  });
  const [activeEvent, setActiveEvent] = useState(null);
  const [resourceChoices, setResourceChoices] = useState([]);
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

  const startRun = survivorName => {
    if (screen !== 'settlement') {
      return;
    }

    const nextRunBonus = settlement.nextRunBonus || {};
    let startingState = {
      hp: 30,
      maxHp: 30,
      survival: 0,
      survivor: { name: survivorName || 'Nameless Survivor' },
      inventory: {},
      resources: [],
      deck: starterDeck.map(card => card.id),
      nextCombatModifiers: {},
      fightingArts: [],
      temporaryFightingArts: []
    };
    const activeRunBonus = {};

    if (nextRunBonus.randomMonsterPart) {
      const partId = RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)];
      startingState = applyResourceGain(startingState, partId, 1);
    }

    if (hasUpgrade(settlement, 'boneSmith')) {
      startingState = applyResourceGain(startingState, 'bone', 1);
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
      const nextCombatBonus = {
        extraMaxHp: runBonus.extraMaxHp || 0,
        firstCombatStrength,
        survivorName: runState.survivor?.name || 'Nameless Survivor',
        currentHp: runState.hp,
        deck: runState.deck,
        nextCombatModifiers: runState.nextCombatModifiers || {},
        fightingArts: runState.fightingArts || []
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
      const withResource = applyResourceGain(current, offer.resourceId, 1);
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

  const handleCombatVictory = combat => {
    setRunState(current => ({ ...current, hp: combat.survivor.hp }));

    if (currentNode?.type === 'boss') {
      const completedMap = completeMapNode(runMap, currentNode.id);
      const progress = getRunProgress(completedMap, currentNode);
      const summary = {
        outcome: 'victory',
        survivorName: runState.survivor?.name || 'Nameless Survivor',
        nodesCompleted: progress.nodesCompleted,
        rowReached: progress.rowReached,
        settlementMemoryEarned: 3,
        resources: resourceNames
      };

      setRunMap(completedMap);
      setRunSummary(summary);
      updateSettlement(current => ({
        ...current,
        settlementMemory: current.settlementMemory + summary.settlementMemoryEarned,
        victoriousRuns: current.victoriousRuns + 1
      }));
      setScreen('runSummary');
      return;
    }

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
      resources: resourceNames
    };

    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: current.settlementMemory + summary.settlementMemoryEarned,
      deadSurvivors: current.deadSurvivors + 1
    }));
    setScreen('runSummary');
  };

  const returnToSettlement = () => {
    setRunMap([]);
    setCurrentNode(null);
    setRunState({
      hp: 30,
      maxHp: 30,
      survival: 0,
      survivor: { name: 'Nameless Survivor' },
      inventory: {},
      resources: [],
      deck: starterDeck.map(card => card.id),
      nextCombatModifiers: {},
      fightingArts: []
    });
    setRunBonus({});
    setCombatBonus({});
    setActiveEvent(null);
    setResourceChoices([]);
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
            resources={resourceNames}
            survivorName={runState.survivor?.name}
            fightingArts={runState.fightingArts}
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
        return renderPlaceholder(screen);
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
