import { useState } from 'react';
import {
  createCombatState,
  drawOpeningHand,
  endSurvivorTurn,
  playCard,
  resolveMonsterTurn
} from '../../domain/combat/combatEngine.js';
import { getCardCatalog } from '../../domain/cards/cardCatalog.js';
import CardHand from '../components/CardHand.jsx';
import CombatLog from '../components/CombatLog.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorCombatPanel from '../components/SurvivorCombatPanel.jsx';

function makeCards() {
  const cards = getCardCatalog().filter(card => card.effects?.length).slice(0, 12);
  return cards.length ? cards : [
    { id: 'fallback-strike', name: 'Fallback Strike', type: 'attack', effects: [{ type: 'damage', amount: 3 }] }
  ];
}

export default function CombatScreen({ monster, survivor, onReturn }) {
  const [combatState, setCombatState] = useState(() => drawOpeningHand(createCombatState({
    monster,
    survivors: [survivor],
    cards: makeCards(),
    random: () => 0
  })));
  const activeSurvivor = combatState.survivors.find(item => item.id === combatState.activeSurvivorId) || combatState.survivors[0];

  function handlePlayCard(cardId) {
    setCombatState(current => playCard({ combatState: current, cardId, targetId: combatState.monster.id }));
  }

  function handleEndTurn() {
    setCombatState(current => resolveMonsterTurn(endSurvivorTurn(current)));
  }

  return (
    <main className="app-shell">
      <section className="panel combat-screen">
        <div className="screen-header">
          <div>
            <p className="eyebrow">Card combat</p>
            <h1>Test Fight</h1>
          </div>
          <button className="secondary" type="button" onClick={onReturn}>Return</button>
        </div>

        <div className="combat-layout">
          <MonsterPanel monster={combatState.monster} intent={combatState.pendingMonsterIntent} />
          <SurvivorCombatPanel survivor={activeSurvivor} />
        </div>

        <div className="stats-grid">
          <div className="stat"><span>Draw</span><strong>{combatState.drawPile.length}</strong></div>
          <div className="stat"><span>Discard</span><strong>{combatState.discardPile.length}</strong></div>
          <div className="stat"><span>Exhaust</span><strong>{combatState.exhaustPile.length}</strong></div>
          <div className="stat"><span>Round</span><strong>{combatState.round}</strong></div>
        </div>

        {combatState.status === 'victory' || combatState.status === 'defeat' ? (
          <section className="result-banner">
            <h2>{combatState.status === 'victory' ? 'Victory' : 'Defeat'}</h2>
            <button type="button" onClick={onReturn}>Return to Settlement</button>
          </section>
        ) : (
          <>
            <CardHand hand={combatState.hand} onPlayCard={handlePlayCard} />
            <button type="button" onClick={handleEndTurn}>End Turn</button>
          </>
        )}

        <CombatLog entries={combatState.combatLog} />
      </section>
    </main>
  );
}
