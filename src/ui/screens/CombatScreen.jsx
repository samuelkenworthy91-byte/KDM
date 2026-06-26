import { useState } from 'react';
import {
  createCombatState,
  drawOpeningHand,
  endSurvivorTurn,
  playCard,
  resolveMonsterTurn
} from '../../domain/combat/combatEngine.js';
import CardHand from '../components/CardHand.jsx';
import CombatLog from '../components/CombatLog.jsx';
import FlippableCard from '../components/FlippableCard.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorCombatPanel from '../components/SurvivorCombatPanel.jsx';

export default function CombatScreen({ monster, survivor, onReturn }) {
  const [combatState, setCombatState] = useState(() => drawOpeningHand(createCombatState({
    monster,
    survivors: [survivor],
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
          <MonsterPanel monster={combatState.monster} intent={combatState.pendingMonsterIntent} weakPoint={combatState.currentWeakPoint} />
          <SurvivorCombatPanel survivor={activeSurvivor} passives={combatState.passiveCards} />
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
            <section className="combat-section">
              <h2>Deck Sources</h2>
              <div className="gear-source-list">
                {(combatState.gearCardGroups || []).map(group => (
                  <article className="gear-source" key={group.gearId}>
                    <h3>{group.gearName || 'Unknown Gear'}</h3>
                    <p>{group.gearType || 'gear'} / {group.slot || 'slot'}</p>
                    <div className="mini-card-list">
                      {[...(group.activeCards || []), ...(group.passiveCards || []), ...(group.unlinkedCards || [])].map(card => (
                        <span key={card.id}>{card.name || 'Unnamed Card'}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="combat-section">
              <h2>Passives</h2>
              <div className="hand-grid">
                {(combatState.passiveCards || []).map(card => <FlippableCard key={card.id} card={card} />)}
              </div>
              {(combatState.deckWarnings || []).map(warning => <p className="warning-text" key={warning}>{warning}</p>)}
            </section>

            <CardHand hand={combatState.hand} onPlayCard={handlePlayCard} />
            <button type="button" onClick={handleEndTurn}>End Turn</button>
          </>
        )}

        <CombatLog entries={combatState.combatLog} />
      </section>
    </main>
  );
}
