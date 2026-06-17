import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorPanel from '../components/SurvivorPanel.jsx';
import {
  createCombatState,
  endTurn,
  getPostCombatSalvageRewards,
  formatAuraForDisplay,
  playCard,
  resolveAfterCombatHealing,
  useSurvivalAction
} from '../game/combatLogic.js';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';
import { getCardPreview } from '../utils/cardPreview.js';

export default function CombatScreen({
  monster,
  runBonus,
  equippedGear,
  hasMonsterBane,
  victoryButtonText = 'Continue Hunt',
  defeatButtonText = 'View Run Summary',
  onVictory,
  onDefeat
}) {
  const [combat, setCombat] = useState(() => createCombatState(monster, {
    ...runBonus,
    hasMonsterBane
  }));
  const currentIntent = combat.monster.intents[combat.intentIndex];
  const combatOver = combat.status !== 'playing';
  const activeAuras = combat.activeAuras || [];

  const handlePlayCard = cardIndex => {
    setCombat(current => playCard(cardIndex, current));
  };

  const survivalActions = [
    { id: 'dodge', name: 'Dodge', cost: 1, effect: '+5 block' },
    { id: 'counter', name: 'Counter', cost: 1, effect: 'Deal 3 damage' },
    { id: 'focus', name: 'Focus', cost: 1, effect: 'Draw 1 card' },
    { id: 'endure', name: 'Endure', cost: 2, effect: 'Remove 1 Panic' }
  ];

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
        <MonsterPanel
          monster={combat.monster}
          intent={currentIntent}
          hasMonsterBane={hasMonsterBane}
          intentHintLevel={combat.intentHintLevel}
        />
      </div>

      {combatOver && (
        <div className={`combat-result ${combat.status}`} role="status">
          <div>{combat.status === 'won' ? 'Victory!' : 'Defeat'}</div>
          <button
            type="button"
            onClick={combat.status === 'won'
              ? () => {
                const healed = resolveAfterCombatHealing({
                  survivor: combat.survivor,
                  afterCombatHealing: combat.afterCombatHealing
                }, 'victory');
                const salvage = getPostCombatSalvageRewards(combat);
                onVictory({
                  survivor: healed.survivor,
                  salvageTokens: salvage.salvageTokens,
                  salvageResources: salvage.resources,
                  afterCombatLog: [
                    ...(healed.afterCombatLog || []),
                    ...salvage.log
                  ]
                });
              }
              : handleDefeat}
          >
            {combat.status === 'won' ? victoryButtonText : defeatButtonText}
          </button>
        </div>
      )}

      {runBonus?.firstCombatStrength > 0 && (
        <div className="run-bonus-note" role="status">
          Oath of Vengeance active: +1 strength for first combat.
        </div>
      )}
      {[
        ...(runBonus?.survivor?.injuries || []),
        ...(runBonus?.survivor?.scars || []),
        ...(runBonus?.survivor?.disorders || [])
      ].length > 0 && (
        <div className="run-bonus-note" role="status">
          Survivor conditions are active in this combat.
        </div>
      )}
      {activeAuras.length > 0 && (
        <section className="run-bonus-note" aria-label="Active auras">
          {activeAuras.map(aura => (
            <div key={aura.id}>
              <strong>{aura.type?.startsWith('nextSurvivor') ? 'Queued Aura' : 'Active Aura'}:</strong>{' '}
              {formatAuraForDisplay(aura)}
            </div>
          ))}
        </section>
      )}

      <section className="survival-command-bar">
        <div>
          <strong>Survival Actions</strong>
          <span>{combat.survivor.survival} / {combat.survivor.maxSurvival}</span>
        </div>
        <div className="survival-action-buttons">
          {survivalActions.map(action => {
            const used = combat.survivalActionsUsed.includes(action.id);
            const insufficient = combat.survivor.survival < action.cost;
            const reason = used
              ? 'Already used this turn'
              : insufficient
                ? 'Not enough survival'
                : `${formatValueForDisplay(action.name)}: ${formatHistoryDetail(action.effect)}`;
            return (
              <button
                type="button"
                key={action.id}
                disabled={combatOver || used || insufficient}
                title={reason}
                onClick={() => setCombat(current => useSurvivalAction(action.id, current))}
              >
                {action.name} ({action.cost})
              </button>
            );
          })}
        </div>
        {combat.survivalFeedback && <p role="status">{combat.survivalFeedback}</p>}
      </section>

      <div className="combat-controls">
        <div>
          Draw: {combat.drawPile.length} | Discard: {combat.discardPile.length} | Exhaust: {combat.exhaustPile.length}
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

      <details className="combat-deck-list">
        <summary>Deck ({combat.runDeck.length} cards)</summary>
        {equippedGear?.length > 0 && <p>Equipped gear: {equippedGear.join(', ')}</p>}
        <ul>
          {combat.runDeck.map((card, index) => (
            <li key={`${card.id}-${index}`}>
              {card.name}{card.source ? ` - ${card.source}` : ''}
            </li>
          ))}
        </ul>
      </details>

      <div className="hand" aria-label="Card hand">
        {combat.hand.map((card, index) => {
          const disabled =
            combatOver || card.unplayable || card.cost > combat.survivor.energy;

          return (
            <Card
              key={`${card.id}-${index}`}
              card={card}
              preview={getCardPreview({
                card,
                survivor: combat.survivor,
                combatState: combat,
                monster: combat.monster
              })}
              disabled={disabled}
              onPlay={() => handlePlayCard(index)}
            />
          );
        })}
      </div>
    </section>
  );
}
