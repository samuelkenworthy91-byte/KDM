import { useState } from 'react';
import { loadSettlement, resetSettlementSave, saveSettlement } from './domain/save/localSave.js';
import CreateSettlementScreen from './ui/screens/CreateSettlementScreen.jsx';
import SettlementScreen from './ui/screens/SettlementScreen.jsx';

export default function App() {
  const [settlement, setSettlement] = useState(() => loadSettlement());

  function handleCreate(nextSettlement) {
    setSettlement(saveSettlement(nextSettlement));
  }

  function handleReset() {
    resetSettlementSave();
    setSettlement(null);
  }

  if (!settlement) return <CreateSettlementScreen onCreate={handleCreate} />;
  return <SettlementScreen settlement={settlement} onReset={handleReset} />;
}
