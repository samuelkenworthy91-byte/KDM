import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { monsters } from './data/monsters.js';
import { resources as resourceData } from './data/resources.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import {
  hasUpgrade,
  loadSettlement,
  saveSettlement
} from './game/saveLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';
import RunSummaryScreen from './screens/RunSummaryScreen.jsx';
import SettlementScreen from './screens/SettlementScreen.jsx';

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

const EMPTY_RUN_PROGRESS = {
  nodesCompleted: 0,
  elitesDefeated: 0,
  maxRowReached: 0,
  storytellerActive: false,
  revealAllNodeTypes: false
};

function createScaledMonster(type) {
  const base = monsters.whiteLion;
  const multiplier = type === 'boss' ? 2 : type === 'elite' ? 1.5 : 1;
  const damageBonus = type === 'boss' ? 4 : type === 'elite' ? 2 : 0;
  const hp = Math.round(base.maxHp * multiplier);

  return {
    ...base,
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
  const [settlement, setSettlement] = useState(loadSettlement);
  const [runMap, setRunMap] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [runResources, setRunResources] = useState([]);
  const [resourceReward, setResourceReward] = useState(null);
  const [runProgress, setRunProgress] = useState(EMPTY_RUN_PROGRESS);
  const [runSummary, setRunSummary] = useState(null);

  const buyUpgrade = upgrade => {
    setSettlement(current => {
      if (
        hasUpgrade(current, upgrade.id) ||
        current.settlementMemory < upgrade.cost
      ) {
        return current;
      }

      return saveSettlement({
        ...current,
        settlementMemory: current.settlementMemory - upgrade.cost,
        unlockedUpgrades: [...current.unlockedUpgrades, upgrade.id]
      });
    });
  };

  const startRun = () => {
    const boneSmithActive = hasUpgrade(settlement, 'boneSmith');
    const revealAllNodeTypes = hasUpgrade(settlement, 'scoutPath');
    const storytellerActive = hasUpgrade(settlement, 'storyteller');
    const nextRunBonus = {
      startingBone: boneSmithActive ? 1 : 0,
      revealAllNodeTypes,
      storytellerActive
    };
    const updatedSettlement = saveSettlement({
      ...settlement,
      totalRuns: settlement.totalRuns + 1,
      nextRunBonus
    });

    setSettlement(updatedSettlement);
    setRunMap(generateMap());
    setCurrentNode(null);
    setRunResources(boneSmithActive ? ['Bone'] : []);
    setResourceReward(null);
    setRunProgress({
      ...EMPTY_RUN_PROGRESS,
      revealAllNodeTypes,
      storytellerActive
    });
    setRunSummary(null);
    setScreen('map');
  };

  const selectNode = node => {
    if (!node.available || node.completed) {
      return;
    }

    setCurrentNode(node);
    setRunProgress(progress => ({
      ...progress,
      maxRowReached: Math.max(progress.maxRowReached, node.row + 1)
    }));

    if (['fight', 'elite', 'boss'].includes(node.type)) {
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
    setRunProgress(progress => ({
      ...progress,
      nodesCompleted: progress.nodesCompleted + 1,
      elitesDefeated:
        progress.elitesDefeated + (currentNode.type === 'elite' ? 1 : 0)
    }));
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

  const finishRun = result => {
    const victory = result === 'Victory';
    const completedBoss = victory && currentNode?.type === 'boss';
    const nodesCompleted = runProgress.nodesCompleted + (completedBoss ? 1 : 0);
    const elitesDefeated = runProgress.elitesDefeated;
    const progressReward = runProgress.maxRowReached >= 2 ? 1 : 0;
    const eliteReward = elitesDefeated > 0 ? 1 : 0;
    const graveReward =
      !victory && hasUpgrade(settlement, 'gravesOfTheFallen') ? 1 : 0;
    const memoryGained = victory
      ? 3
      : 1 + progressReward + eliteReward + graveReward;
    const monsterId = completedBoss ? createScaledMonster('boss').id : null;
    const updatedSettlement = saveSettlement({
      ...settlement,
      settlementMemory: settlement.settlementMemory + memoryGained,
      deadSurvivors: settlement.deadSurvivors + (victory ? 0 : 1),
      victoriousRuns: settlement.victoriousRuns + (victory ? 1 : 0),
      monsterKnowledge: monsterId
        ? {
            ...settlement.monsterKnowledge,
            [monsterId]: (settlement.monsterKnowledge[monsterId] || 0) + 1
          }
        : settlement.monsterKnowledge
    });

    setSettlement(updatedSettlement);
    setRunSummary({
      result,
      memoryGained,
      totalMemory: updatedSettlement.settlementMemory,
      nodesCompleted,
      elitesDefeated
    });
    setScreen('runSummary');
  };

  const handleCombatVictory = () => {
    if (currentNode?.type === 'boss') {
      setRunMap(map => completeMapNode(map, currentNode.id));
      finishRun('Victory');
      return;
    }

    completeCurrentNode();
  };

  const returnToSettlement = () => {
    setCurrentNode(null);
    setRunSummary(null);
    setScreen('settlement');
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
            resources={runResources}
            revealAllNodeTypes={runProgress.revealAllNodeTypes}
            storytellerActive={runProgress.storytellerActive}
          />
        );
      case 'combat': {
        const monster = createScaledMonster(currentNode?.type);
        const archiveBonus =
          hasUpgrade(settlement, 'monsterArchive') &&
          settlement.monsterKnowledge[monster.id]
            ? 1
            : 0;

        return (
          <CombatScreen
            key={currentNode?.id}
            monster={monster}
            playerDamageBonus={archiveBonus}
            victoryActionLabel={
              currentNode?.type === 'boss' ? 'View Run Summary' : 'Continue Hunt'
            }
            onVictory={handleCombatVictory}
            onDefeat={() => finishRun('Death')}
          />
        );
      }
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
        return <RunSummaryScreen summary={runSummary} onReturn={returnToSettlement} />;
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
