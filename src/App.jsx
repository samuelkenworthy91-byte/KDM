import React, { useState } from 'react';
import CombatScreen from './screens/CombatScreen.jsx';

// Simple router between screens
export default function App() {
  const [screen, setScreen] = useState('settlement');

  const renderScreen = () => {
    switch (screen) {
      case 'settlement':
        return <div>Settlement Screen (placeholder)</div>;
      case 'map':
        return <div>Hunt Map Screen (placeholder)</div>;
      case 'combat':
        return <CombatScreen />;
      case 'craft':
        return <div>Crafting Screen (placeholder)</div>;
      default:
        return <div>Unknown Screen</div>;
    }
  };

  return (
    <div className="app">
      <h1>Lantern Deckbuilder Prototype</h1>
      <nav>
        <button onClick={() => setScreen('settlement')}>Settlement</button>
        <button onClick={() => setScreen('map')}>Map</button>
        <button onClick={() => setScreen('combat')}>Combat</button>
        <button onClick={() => setScreen('craft')}>Craft</button>
      </nav>
      <main>{renderScreen()}</main>
    </div>
  );
}
