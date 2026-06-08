import React, { useState } from 'react';
import MapScreen from './components/MapScreen.jsx';
import { monsters } from './data/monsters.js';
import { resources as resourceData } from './data/resources.js';
import { completeMapNode, generateMap } from './game/mapLogic.js';
import CombatScreen from './screens/CombatScreen.jsx';

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
  const [runMap, setRunMap] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [runResources, setRunResources] = useState([]);
  const [resourceReward, setResourceReward] = useState(null);

  const startRun = () => {
    setRunMap(generateMap());
    setCurrentNode(null);
    setRunResources([]);
    setResourceReward(null);
    setScreen('map');
  };

  const selectNode = node => {
    if (!node.available || node.completed) {
      return;
    }

    setCurrentNode(node);

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
      setRunMap(map => completeMapNode(map, currentNode.id));
      setScreen('runVictory');
      return;
    }

    completeCurrentNode();
  };

  const returnToSettlement = () => {
    setCurrentNode(null);
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
          <section className="settlement-screen">
            <p className="eyebrow">Settlement</p>
            <h2>The Lanterns Are Lit</h2>
            <p>Gather your courage and begin a new hunt through the darkness.</p>
            <button type="button" onClick={startRun}>Begin Hunt</button>
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
            onVictory={handleCombatVictory}
            onDefeat={returnToSettlement}
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
      case 'runVictory':
        return (
          <section className="victory-screen">
            <p className="eyebrow">Hunt Complete</p>
            <h2>The Nemesis Has Fallen</h2>
            <p>You return through the dark with {runResources.length} gathered resources.</p>
            <button type="button" onClick={returnToSettlement}>
              Return to Settlement
            </button>
          </section>
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
