import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorPanel from '../components/SurvivorPanel.jsx';
import { equipment } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { createCombatState, endTurn, playCard } from '../game/combatLogic.js';

export default function CombatScreen({ monster, runBonus, onVictory, onDefeat }) {
  const [combat, setCombat] = useState(() => createCombatState(monster, runBonus));
  const currentIntent = combat.currentIntent;
  const combatOver = combat.status !== 'playing';

  const handlePlayCard = cardIndex => {
    setCombat(current => playCard(cardIndex, current));
  };

  const handleDefeat = () => {
    onDefeat({
      survivorName: combat.survivor.name,
      killedBy: combat.monster.name,
      killedById: combat.monster.baseId || combat.monster.id
    });
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
            onClick={combat.status === 'won' ? () => onVictory(combat) : handleDefeat}
          >
            {combat.status === 'won' ? 'Continue Hunt' : 'View Run Summary'}
          </button>
        </div>
      )}

      {runBonus?.firstCombatStrength > 0 && (
        <div className="run-bonus-note" role="status">
          Oath of Vengeance active: +1 strength for first combat.
        </div>
      )}

      {!!runBonus?.fightingArts?.length && (
        <div className="active-passives">
          <strong>Fighting Arts:</strong>{' '}
          {runBonus.fightingArts.map(id => fightingArts[id]?.name || id).join(', ')}
        </div>
      )}

      {!!runBonus?.equippedGear?.length && (
        <div className="active-passives">
          <strong>Equipped Gear:</strong>{' '}
          {runBonus.equippedGear.map(item => equipment[item.id]?.name || item.name).join(', ')}
        </div>
      )}

      <div className="combat-controls">
        <div>
          Draw: {combat.drawPile.length} | Discard: {combat.discardPile.length}
        </div>
        <button type="button" onClick={() => setCombat(endTurn)} disabled={combatOver}>
          End Turn
        </button>
        {import.meta.env.DEV && (
          <button
            type="button"
            className="test-button"
            onClick={() => setCombat(current => ({
              ...current,
              survivor: { ...current.survivor, hp: 0 },
              status: 'lost'
            }))}
            disabled={combatOver}
          >
            Test Death
          </button>
        )}
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
