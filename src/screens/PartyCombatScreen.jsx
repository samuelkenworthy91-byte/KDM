import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorPanel from '../components/SurvivorPanel.jsx';
import {
  createPartyCombatState,
  endPartyTurn,
  getPartyWeakPointPreview,
  playPartyCard,
  selectPartyWeakPoint,
  treatPartyWound,
  usePartySurvivalAction
} from '../game/partyCombatLogic.js';

const survivalActions = [
  { id: 'dodge', name: 'Dodge', cost: 1, effect: '+5 block' },
  { id: 'counter', name: 'Counter', cost: 1, effect: 'Deal 3 damage' },
  { id: 'focus', name: 'Focus', cost: 1, effect: 'Draw 1 card' },
  { id: 'endure', name: 'Endure', cost: 2, effect: 'Remove 1 Panic' }
];

export default function PartyCombatScreen({
  monster,
  partyBonuses,
  pendingPartyEffects = [],
  hasMonsterBane,
  onVictory,
  onDefeat
}) {
  const [combat, setCombat] = useState(() =>
    createPartyCombatState(monster, partyBonuses, pendingPartyEffects)
  );
  const active = combat.members[combat.activePartyIndex] || combat.members[0];
  const currentIntent = combat.monster.intents[combat.intentIndex];
  const combatOver = combat.status !== 'playing';
  const livingPartyHasMonsterBane = combat.members.some(member =>
    member.survivor.hp > 0 &&
    member.fightingArts?.includes(`monsterBane_${combat.monster.quarryId}`)
  );
  const turnNames = combat.combatTurnOrder.map(combatantId =>
    combatantId === 'monster'
      ? 'Monster'
      : combat.members.find(member => member.survivor.id === combatantId)?.survivor.name
  ).filter(Boolean);
  const brokenWeakPoints = (combat.monster.weakPoints || []).filter(weakPoint => weakPoint.broken);
  const selectedPreview = combat.selectedWeakPointId
    ? getPartyWeakPointPreview(combat, combat.selectedWeakPointId)
    : null;
  const baneRevealsWeakPoints = livingPartyHasMonsterBane || (
    hasMonsterBane && combat.members.some(member => member.survivor.hp > 0 && member.hasMonsterBane)
  );
  const tellLabel = tellState => {
    if (baneRevealsWeakPoints) {
      return {
        open: 'Open from tell',
        guarded: 'Guarded by current tell',
        dangerous: 'Dangerous during current tell',
        exposed: 'Exposed',
        neutral: 'Neutral'
      }[tellState];
    }
    return {
      open: 'Looks reachable',
      guarded: 'Seems protected',
      dangerous: 'Twitches dangerously',
      exposed: 'Looks exposed',
      neutral: 'No clear opening'
    }[tellState];
  };
  const riskText = weakPoint => {
    const risk = weakPoint?.riskOnFailedBreak;
    if (!risk) return 'No failed-break effect';
    const labels = {
      panic: `gain ${risk.amount || 1} Panic`,
      panicAndTarget: `gain ${risk.amount || 1} Panic and become the next target`,
      marked: 'become Marked',
      bleed: `gain ${risk.amount || 1} Bleed`,
      monsterHeal: `monster heals ${risk.amount || 1}`,
      monsterBlock: `monster gains ${risk.amount || 1} block`,
      monsterEnrage: `monster gains ${risk.amount || 1} Enrage`,
      loseBlock: `lose ${risk.amount || 1} block`
    };
    return labels[risk.type] || risk.label;
  };
  const harvestPreview = weakPoint => {
    const profile = weakPoint?.harvestProfile;
    if (!profile) return 'Breaking this may improve the final harvest.';
    if (!baneRevealsWeakPoints) {
      return profile.fragile
        ? 'Breaking this might expose a delicate part.'
        : 'Breaking this may improve a related part harvest.';
    }
    return `${profile.targetPartFamily} harvest odds improve. ` +
      `${profile.fragile ? 'Fragile: avoid overkill.' : 'Heavy force is less likely to ruin it.'}`;
  };

  const finish = () => {
    const survivors = combat.members.map(member => ({
      ...partyBonuses.find(bonus => bonus.survivor.id === member.survivor.id)?.survivor,
      hp: member.survivor.hp,
      survival: member.survivor.survival,
      hitLocations: member.survivor.hitLocations,
      treatmentNotes: member.survivor.treatmentNotes,
      injuries: member.injuries,
      scars: member.scars,
      disorders: member.disorders,
      personalDeckAdditions: member.personalDeckAdditions,
      woundHistory: member.woundHistory,
      combatStats: {
        cardsPlayed: member.cardsPlayedThisTurn,
        attacksPlayed: member.attacksPlayedThisTurn
      }
    }));
    if (combat.status === 'won') onVictory({
      survivors,
      monster: combat.monster,
      brokenWeakPoints,
      wounds: combat.members.flatMap(member => member.woundHistory || [])
    });
    else onDefeat({
      survivors,
      killedBy: combat.monster.name,
      killedById: combat.monster.baseId || combat.monster.id
    });
  };

  return (
    <section className="combat-screen">
      <p className="eyebrow">Party Combat</p>
      <p>
        Turn order: {turnNames.join(' \u2192 ')}
      </p>
      <p>
        Active combatant: <strong>
          {combat.activeCombatant === 'monster'
            ? 'Monster'
            : active?.survivor.name}
        </strong>
      </p>
      <div className="combatants">
        <div>
          {combat.members.map(member => (
            <div key={member.survivor.id} className={member.survivor.id === combat.activeCombatant ? 'selected' : ''}>
              <SurvivorPanel survivor={member.survivor} />
            </div>
          ))}
        </div>
        <MonsterPanel
          monster={combat.monster}
          intent={currentIntent}
          hasMonsterBane={baneRevealsWeakPoints}
          intentHintLevel={active?.intentHintLevel || 0}
        />
      </div>

      {combat.lastTargetId && (
        <p className="run-bonus-note">
          The monster targeted {combat.members.find(member =>
            member.survivor.id === combat.lastTargetId)?.survivor.name || 'the front survivor'}.
        </p>
      )}

      <section className="survival-command-bar">
        <div>
          <strong>Attack Target</strong>
          <span>{combat.selectedWeakPointId
            ? combat.monster.weakPoints.find(point => point.id === combat.selectedWeakPointId)?.name
            : 'Monster Body'}</span>
        </div>
        <div className="survival-action-buttons">
          <button
            type="button"
            className={!combat.selectedWeakPointId ? 'selected' : ''}
            onClick={() => setCombat(current => selectPartyWeakPoint(null, current))}
          >
            Attack Monster
          </button>
          {(combat.monster.weakPoints || []).map(weakPoint => (
            <button
              type="button"
              key={weakPoint.id}
              disabled={weakPoint.broken}
              className={combat.selectedWeakPointId === weakPoint.id ? 'selected' : ''}
              title={weakPoint.description}
              onClick={() => setCombat(current => selectPartyWeakPoint(weakPoint.id, current))}
            >
              {weakPoint.name} ({weakPoint.broken
                ? 'broken'
                : `${weakPoint.currentBreakDamage}/${weakPoint.breakValue}`})
            </button>
          ))}
        </div>
        {(combat.monster.weakPoints || []).map(weakPoint => (
          <small key={`${weakPoint.id}-status`}>
            {weakPoint.name}: {weakPoint.broken
              ? `Broken - ${weakPoint.harvestResult?.quality || 'messy'} harvest - ${weakPoint.onBreakEffect}`
              : `${weakPoint.currentBreakDamage}/${weakPoint.breakValue} - ${weakPoint.riskLabel} - ` +
                `${tellLabel(getPartyWeakPointPreview(combat, weakPoint.id)?.tellState || 'neutral')}`}
          </small>
        ))}
        {selectedPreview && (
          <p className="run-bonus-note">
            Preview using {selectedPreview.cardName}: about {selectedPreview.monsterDamage} monster damage,{' '}
            {selectedPreview.breakDamage} break damage. Weapon Match: {selectedPreview.weaponMatch}.{' '}
            {tellLabel(selectedPreview.tellState)}. Risk: {
              selectedPreview.riskSuppressed
                ? 'Suppressed by opening/card'
                : combat.monster.weakPoints.find(point => point.id === combat.selectedWeakPointId)?.riskLabel
            } ({riskText(combat.monster.weakPoints.find(point =>
              point.id === combat.selectedWeakPointId
            ))}). {harvestPreview(combat.monster.weakPoints.find(point =>
              point.id === combat.selectedWeakPointId
            ))}
          </p>
        )}
      </section>

      {!!combat.combatLog?.length && (
        <details className="combat-deck-list">
          <summary>Combat Log ({combat.combatLog.length})</summary>
          <ul>
            {combat.combatLog.slice(-10).map((entry, index) => (
              <li key={`${index}-${entry}`}>{entry}</li>
            ))}
          </ul>
        </details>
      )}

      {combatOver && (
        <div className={`combat-result ${combat.status}`} role="status">
          <div>{combat.status === 'won' ? 'Victory!' : 'Party Defeated'}</div>
          {brokenWeakPoints.map(weakPoint => (
            <p key={weakPoint.id}>
              Broken weak point: {weakPoint.name} - {weakPoint.harvestResult?.quality || 'messy'} harvest.{' '}
              {weakPoint.harvestResult?.impactText}
            </p>
          ))}
          {combat.members.flatMap((member, memberIndex) =>
            Object.entries(member.survivor.hitLocations || {})
              .filter(([, wound]) => wound.wounded)
              .map(([location, wound]) => (
                <div key={`${member.survivor.id}-${location}`}>
                  <p>{member.survivor.name}: {location} - {wound.penalty}</p>
                  {!wound.severe && ['arms', 'body'].includes(location) && (
                    <button
                      type="button"
                      onClick={() => setCombat(current =>
                        treatPartyWound(memberIndex, location, 'bandage', current)
                      )}
                    >
                      Bandage {member.survivor.name}'s {location}
                    </button>
                  )}
                  {!wound.severe && ['arms', 'legs'].includes(location) && (
                    <button
                      type="button"
                      onClick={() => setCombat(current =>
                        treatPartyWound(memberIndex, location, 'splint', current)
                      )}
                    >
                      Splint {member.survivor.name}'s {location}
                    </button>
                  )}
                </div>
              ))
          )}
          <button type="button" onClick={finish}>
            {combat.status === 'won' ? 'Continue Hunt' : 'View Run Summary'}
          </button>
        </div>
      )}

      {!combatOver && active && (
        <>
          <section className="survival-command-bar">
            <div>
              <strong>{active.survivor.name} Survival Actions</strong>
              <span>{active.survivor.survival} / {active.survivor.maxSurvival}</span>
            </div>
            <div className="survival-action-buttons">
              {survivalActions.map(action => {
                const used = active.survivalActionsUsed.includes(action.id);
                const insufficient = active.survivor.survival < action.cost;
                return (
                  <button
                    type="button"
                    key={action.id}
                    disabled={used || insufficient}
                    title={`${action.name}: ${action.effect}`}
                    onClick={() => setCombat(current => usePartySurvivalAction(action.id, current))}
                  >
                    {action.name} ({action.cost})
                  </button>
                );
              })}
            </div>
            {active.survivalFeedback && <p role="status">{active.survivalFeedback}</p>}
          </section>
          <div className="combat-controls">
            <div>
              Draw: {active.drawPile.length} | Discard: {active.discardPile.length} | Exhaust: {active.exhaustPile.length}
            </div>
            <button type="button" onClick={() => setCombat(endPartyTurn)}>End Turn</button>
          </div>
          <details className="combat-deck-list">
            <summary>{active.survivor.name} Deck ({active.runDeck.length} cards)</summary>
            <ul>
              {active.runDeck.map((card, index) => (
                <li key={`${card.id}-${index}`}>{card.name}{card.source ? ` - ${card.source}` : ''}</li>
              ))}
            </ul>
          </details>
          <div className="hand" aria-label={`${active.survivor.name} card hand`}>
            {active.hand.map((card, index) => (
              <Card
                key={`${card.id}-${index}`}
                card={card}
                disabled={card.unplayable || card.cost > active.survivor.energy}
                onPlay={() => setCombat(current => playPartyCard(index, current))}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
