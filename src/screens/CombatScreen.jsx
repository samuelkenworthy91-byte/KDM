import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorPanel from '../components/SurvivorPanel.jsx';
import { createCombatState, endTurn, playCard } from '../game/combatLogic.js';

export default function CombatScreen({
  monster,
  playerDamageBonus = 0,
  victoryActionLabel = 'Continue Hunt',
  onVictory,
  onDefeat
}) {
  const [combat, setCombat] = useState(() =>
    createCombatState(monster, { playerDamageBonus })
  );
  const currentIntent = combat.monster.intents[combat.intentIndex];
  const combatOver = combat.status !== 'playing';

  const handlePlayCard = cardIndex => {
    setCombat(current => playCard(cardIndex, current));
  };

  return (
    <section className="combat-screen">
      <div className="combatants">
        <SurvivorPanel survivor={combat.survivor} />
        <MonsterPanel monster={combat.monster} intent={currentIntent} />
      </div>

      {combatOver && (
        <div className={`combat-result ${combat.status}`} role="status">
          <div>{combat.status === 'won' ? 'Victory!' : 'Defeat'}</div>
          <button
            type="button"
            onClick={combat.status === 'won' ? onVictory : onDefeat}
          >
            {combat.status === 'won' ? victoryActionLabel : 'View Run Summary'}
          </button>
        </div>
      )}

      <div className="combat-controls">
        <div>
          Draw: {combat.drawPile.length} | Discard: {combat.discardPile.length}
          {combat.playerDamageBonus > 0 && ' | Monster Archive: +1 attack damage'}
        </div>
        <button type="button" onClick={() => setCombat(endTurn)} disabled={combatOver}>
          End Turn
        </button>
      </div>

      <div className="hand" aria-label="Card hand">
        {combat.hand.map((card, index) => {
          const disabled =
            combatOver || card.unplayable || card.cost > combat.survivor.energy;

          return (
            <Card
              key={`${card.id}-${index}`}
              card={card}
              disabled={disabled}
              onPlay={() => handlePlayCard(index)}
            />
          );
        })}
      </div>
    </section>
  );
}
