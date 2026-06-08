import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { graveLegacies } from './data/graveLegacies.js';
import { monsters } from './data/monsters.js';
import { resources as resourceData } from './data/resources.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import { loadSettlement, saveSettlement } from './game/saveLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import GraveLegacyScreen from './screens/GraveLegacyScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';

const RANDOM_MONSTER_PARTS = ['bone', 'hide', 'sinew', 'organ', 'claw', 'strangeEye'];

const NON_COMBAT_COPY = {
  event: {
    eyebrow: 'Strange Encounter',
    title: 'A Voice Beyond the Lantern Light',
    text: 'The darkness shifts around you. For now, the omen passes without consequence.',
    action: 'Leave the Event'
  },
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
  const [runResources, setRunResources] = useState([]);
  const [resourceReward, setResourceReward] = useState(null);
  const [runBonus, setRunBonus] = useState({});
  const [combatBonus, setCombatBonus] = useState({});
  const [runSummary, setRunSummary] = useState(null);

  const updateSettlement = updater => {
    setSettlement(current => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      saveSettlement(next);
      return next;
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

  const startRun = () => {
    const nextRunBonus = settlement.nextRunBonus || {};
    const startingResources = [];
    const activeRunBonus = {};

    if (nextRunBonus.randomMonsterPart) {
      const partId = RANDOM_MONSTER_PARTS[Math.floor(Math.random() * RANDOM_MONSTER_PARTS.length)];
      startingResources.push(resourceData[partId]?.name || partId);
    }

    if (nextRunBonus.extraMaxHp) {
      activeRunBonus.extraMaxHp = nextRunBonus.extraMaxHp;
    }

    if (nextRunBonus.firstCombatStrength) {
      activeRunBonus.firstCombatStrength = nextRunBonus.firstCombatStrength;
    }

    updateSettlement(current => ({
      ...current,
      nextRunBonus: {
        ...current.nextRunBonus,
        randomMonsterPart: false,
        extraMaxHp: 0,
        firstCombatStrength: 0
      }
    }));
    setRunMap(generateMap());
    setCurrentNode(null);
    setRunResources(startingResources);
    setResourceReward(null);
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
        firstCombatStrength
      };

      setCombatBonus(nextCombatBonus);
      if (firstCombatStrength) {
        setRunBonus(current => ({ ...current, firstCombatStrength: 0 }));
      }
      setScreen('combat');
      return;
    }

    if (node.type === 'resource') {
      const resourceIds = Object.keys(resourceData);
      const rewardId = resourceIds[Math.floor(Math.random() * resourceIds.length)];
      setResourceReward(resourceData[rewardId]);
      setScreen('resource');
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
    setResourceReward(null);
    setScreen('map');
  };

  const completeResourceNode = () => {
    if (resourceReward) {
      setRunResources(items => [...items, resourceReward.name]);
    }
    completeCurrentNode();
  };

  const handleCombatVictory = () => {
    if (currentNode?.type === 'boss') {
      const completedMap = completeMapNode(runMap, currentNode.id);
      const progress = getRunProgress(completedMap, currentNode);
      const summary = {
        outcome: 'victory',
        survivorName: 'Survivor',
        nodesCompleted: progress.nodesCompleted,
        rowReached: progress.rowReached,
        settlementMemoryEarned: progress.nodesCompleted,
        resources: runResources
      };

      setRunMap(completedMap);
      setRunSummary(summary);
      updateSettlement(current => ({
        ...current,
        settlementMemory: (current.settlementMemory || 0) + summary.settlementMemoryEarned
      }));
      setScreen('runSummary');
      return;
    }

    completeCurrentNode();
  };

  const handleCombatDefeat = deathDetails => {
    const progress = getRunProgress();
    const summary = {
      outcome: 'death',
      survivorName: deathDetails?.survivorName || 'Survivor',
      killedBy: deathDetails?.killedBy || 'unknownMonster',
      killedById: deathDetails?.killedById || 'unknownMonster',
      nodesCompleted: progress.nodesCompleted,
      rowReached: progress.rowReached,
      settlementMemoryEarned: progress.nodesCompleted,
      resources: runResources
    };

    setRunSummary(summary);
    updateSettlement(current => ({
      ...current,
      settlementMemory: (current.settlementMemory || 0) + summary.settlementMemoryEarned
    }));
    setScreen('runSummary');
  };

  const returnToSettlement = () => {
    setCurrentNode(null);
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

  const renderGraveyard = () => {
    const latestGraves = (settlement.graveHistory || []).slice(0, 5);

    return (
      <div className="graveyard-section">
        <h3>Graveyard / Fallen Survivors</h3>
        {latestGraves.length === 0 ? (
          <p>No graves yet. The settlement waits.</p>
        ) : (
          <ul>
            {latestGraves.map(grave => {
              const legacyName = graveLegacies[grave.chosenLegacyId]?.name || grave.chosenLegacyId;

              return (
                <li key={`${grave.timestamp}-${grave.survivorName}`}>
                  <strong>{grave.survivorName || 'Unknown Survivor'}</strong> killed by{' '}
                  {grave.killedBy || 'unknownMonster'} | {legacyName} | Nodes completed:{' '}
                  {grave.nodesCompleted ?? 0}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
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
          <section className="settlement-screen">
            <p className="eyebrow">Settlement</p>
            <h2>The Lanterns Are Lit</h2>
            <p>Gather your courage and begin a new hunt through the darkness.</p>
            <p>settlementMemory: {settlement.settlementMemory || 0}</p>
            {renderGraveyard()}
            <button type="button" onClick={startRun}>
              Begin Hunt
            </button>
          </section>
        );
      case 'map':
        return (
          <MapScreen
            map={runMap}
            onSelectNode={selectNode}
            resources={runResources}
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
          <section className="placeholder-screen">
            <p className="eyebrow">Scavenged Remains</p>
            <h2>Resource Found</h2>
            <p>You recover one <strong>{resourceReward?.name}</strong>.</p>
            <button type="button" onClick={completeResourceNode}>
              Take Resource
            </button>
          </section>
        );
      case 'event':
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
