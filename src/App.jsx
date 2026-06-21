import { useState } from 'react';
import { loadSettlement, resetSettlementSave, saveSettlement } from './domain/save/localSave.js';
import CreateSettlementScreen from './ui/screens/CreateSettlementScreen.jsx';
import GearCatalogScreen from './ui/screens/GearCatalogScreen.jsx';
import SettlementScreen from './ui/screens/SettlementScreen.jsx';

export default function App() {
  const [settlement, setSettlement] = useState(() => loadSettlement());
  const [screen, setScreen] = useState('settlement');

  function handleCreate(nextSettlement) {
    setSettlement(saveSettlement(nextSettlement));
  }

  function handleReset() {
    resetSettlementSave();
    setSettlement(null);
    setScreen('settlement');
  }

  if (!settlement) return <CreateSettlementScreen onCreate={handleCreate} />;
  if (screen === 'gear') return <GearCatalogScreen onBack={() => setScreen('settlement')} />;
  return <SettlementScreen settlement={settlement} onReset={handleReset} onOpenGear={() => setScreen('gear')} />;
}
