import { useState } from 'react';
import { loadSettlement, resetSettlementSave, saveSettlement } from './domain/save/localSave.js';
import { getFirstEvent } from './domain/events/eventCatalog.js';
import { applyEventDeltas } from './domain/events/eventEffects.js';
import { getQuarries } from './domain/content/contentIndex.js';
import { createRunState } from './domain/schema/runStateSchema.js';
import { createHuntState, advanceHunt, resolveEventNode, resolveFightNode } from './domain/hunt/huntState.js';
import CombatScreen from './ui/screens/CombatScreen.jsx';
import CreateSettlementScreen from './ui/screens/CreateSettlementScreen.jsx';
import EventScreen from './ui/screens/EventScreen.jsx';
import GearCatalogScreen from './ui/screens/GearCatalogScreen.jsx';
import HuntScreen from './ui/screens/HuntScreen.jsx';
import SettlementScreen from './ui/screens/SettlementScreen.jsx';

export default function App() {
  const [settlement, setSettlement] = useState(() => loadSettlement());
  const [screen, setScreen] = useState('settlement');
  const [huntState, setHuntState] = useState(null);

  function handleCreate(nextSettlement) {
    setSettlement(saveSettlement(nextSettlement));
  }

  function handleReset() {
    resetSettlementSave();
    setSettlement(null);
    setScreen('settlement');
  }

  if (!settlement) return <CreateSettlementScreen onCreate={handleCreate} />;
  if (screen === 'hunt') {
    return (
      <HuntScreen
        huntState={huntState || createHuntState()}
        onAdvance={() => setHuntState(current => advanceHunt(current || createHuntState()))}
        onOpenEvent={() => setScreen('huntEvent')}
        onOpenFight={() => setScreen('huntCombat')}
        onReturn={() => setScreen('settlement')}
      />
    );
  }
  if (screen === 'gear') return <GearCatalogScreen onBack={() => setScreen('settlement')} />;
  if (screen === 'combat' || screen === 'huntCombat') {
    const monster = getQuarries()[0] || { id: 'test-monster', name: 'Test Monster', hp: 20 };
    const survivor = settlement.survivors.find(item => item.alive) || settlement.survivors[0];
    return (
      <CombatScreen
        monster={{ ...monster, hp: 20, maxHp: 20, damage: 2 }}
        survivor={survivor}
        onReturn={() => {
          if (screen === 'huntCombat') {
            setHuntState(current => resolveFightNode(current || createHuntState(), 'victory'));
          }
          setScreen('settlement');
        }}
      />
    );
  }
  if (screen === 'event' || screen === 'huntEvent') {
    return (
      <EventScreen
        event={getFirstEvent()}
        runState={createRunState({ settlement })}
        settlement={settlement}
        onApply={result => {
          const applied = applyEventDeltas({
            runState: createRunState({ settlement }),
            settlement,
            stateDelta: result.stateDelta,
            settlementDelta: result.settlementDelta
          });
          setSettlement(saveSettlement(applied.settlement));
        }}
        onContinue={() => {
          if (screen === 'huntEvent') {
            setHuntState(current => resolveEventNode(current || createHuntState()));
            setScreen('hunt');
          } else {
            setScreen('settlement');
          }
        }}
      />
    );
  }
  return (
    <SettlementScreen
      settlement={settlement}
      onReset={handleReset}
      onOpenGear={() => setScreen('gear')}
      onOpenEvent={() => setScreen('event')}
      onOpenCombat={() => setScreen('combat')}
      onStartHunt={() => {
        setHuntState(createHuntState());
        setScreen('hunt');
      }}
    />
  );
}
