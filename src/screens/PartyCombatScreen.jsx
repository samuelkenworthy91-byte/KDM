import React, { useState } from 'react';
import Card from '../components/Card.jsx';
import MonsterPanel from '../components/MonsterPanel.jsx';
import SurvivorPanel from '../components/SurvivorPanel.jsx';
import {
  createPartyCombatState,
  endPartyTurn,
  getPartyCounterPreview,
  getPartyWeakPointPreview,
  playPartyCard,
  selectPartyCombatTarget,
  treatPartyWound,
  usePartyFightingArtAction,
  usePartySurvivalAction
} from '../game/partyCombatLogic.js';
import {
  cleanupConsumedCards,
  formatAuraForDisplay,
  getActiveFightingArtActions,
  getAdjustedCardCost,
  getVisibleNamedMechanicCounters,
  getPostCombatSalvageRewards,
  resolveAfterCombatHealing
} from '../game/combatLogic.js';
import {
  formatEffectForDisplay,
  formatHistoryDetail,
  formatValueForDisplay
} from '../utils/formatters.js';
import { getCardPreview } from '../utils/cardPreview.js';

const survivalActions = [
  { id: 'dodge', name: 'Dodge', cost: 1, effect: '+5 block' },
  { id: 'counter', name: 'Counter', cost: 1, effect: 'Counter body or weak point' },
  { id: 'focus', name: 'Focus', cost: 1, effect: 'Draw 1 card' },
  { id: 'endure', name: 'Endure', cost: 2, effect: 'Remove 1 Panic' }
];

export default function PartyCombatScreen({
  monster,
  partyBonuses,
  pendingPartyEffects = [],
  hasMonsterBane,
  settlement,
  onVictory,
  onDefeat
}) {
  const [combat, setCombat] = useState(() =>
    createPartyCombatState(monster, partyBonuses, pendingPartyEffects)
  );
  const [namedSpendSelections, setNamedSpendSelections] = useState({});
  const safeCombatUpdate = (label, updater) => {
    setCombat(current => {
      try {
        const next = updater(current);
        return next || current;
      } catch (error) {
        return {
          ...current,
          status: 'lost',
          combatLog: [
            ...(current?.combatLog || []),
            `Combat recovery (${label}): ${error?.message || 'unknown error'}`
          ]
        };
      }
    });
  };
  const combatMonster = combat?.monster || monster;
  const validMemberEntries = (combat.members || [])
    .map((member, index) => ({ member, index }))
    .filter(entry => entry.member?.survivor?.id);
  const validMembers = validMemberEntries.map(entry => entry.member);

  if (!combatMonster?.id || !Array.isArray(combatMonster.intents)) {
    return (
      <section className="placeholder-screen">
        <p className="eyebrow">Combat Recovery</p>
        <h2>Combat monster could not be loaded.</h2>
        <p className="muted-text">Recovery reason: missing combat monster</p>
        <button type="button" onClick={() => onDefeat({
          survivors: validMembers.map(member => member.survivor).filter(Boolean),
          killedBy: monster?.name || 'Unknown quarry',
          killedById: monster?.baseId || monster?.id || 'unknown'
        })}>
          Resolve as Defeat
        </button>
      </section>
    );
  }

  if (!validMembers.length) {
    return (
      <section className="placeholder-screen">
        <p className="eyebrow">Combat Recovery</p>
        <h2>Combat party could not be loaded.</h2>
        <p className="muted-text">Recovery reason: missing combat members</p>
        <button type="button" onClick={() => onDefeat({
          survivors: [],
          killedBy: monster?.name || 'Unknown quarry',
          killedById: monster?.baseId || monster?.id || 'unknown'
        })}>
          Resolve as Defeat
        </button>
      </section>
    );
  }

  const indexedActive = combat.members?.[combat.activePartyIndex];
  const active = indexedActive?.survivor?.id
    ? indexedActive
    : validMembers.find(member => member?.survivor?.id === combat.activeCombatant) || validMembers[0];
  const currentIntent = combatMonster.intents?.[combat.intentIndex] || combatMonster.intents?.[0] || null;
  const combatOver = combat.status !== 'playing';
  const activeAuras = combat.activeAuras || [];
  const safeActive = active ? {
    ...active,
    hand: Array.isArray(active.hand) ? active.hand : [],
    runDeck: Array.isArray(active.runDeck) ? active.runDeck : [],
    drawPile: Array.isArray(active.drawPile) ? active.drawPile : [],
    discardPile: Array.isArray(active.discardPile) ? active.discardPile : [],
    exhaustPile: Array.isArray(active.exhaustPile) ? active.exhaustPile : [],
    survivalActionsUsed: Array.isArray(active.survivalActionsUsed) ? active.survivalActionsUsed : []
  } : null;
  const fightingArtActions = safeActive ? getActiveFightingArtActions(safeActive) : [];
  const livingPartyHasMonsterBane = validMembers.some(member =>
    member?.survivor?.hp > 0 &&
    member.fightingArts?.includes(`monsterBane_${combatMonster.quarryId}`)
  );
  const turnNames = combat.combatTurnOrder.map(combatantId =>
    combatantId === 'monster'
      ? 'Monster'
      : validMembers.find(member => member?.survivor?.id === combatantId)?.survivor.name
  ).filter(Boolean);
  const brokenWeakPoints = (combatMonster.weakPoints || []).filter(weakPoint => weakPoint.broken);
  const selectedWeakPointId = combat.selectedCombatTarget?.type === 'weakPoint'
    ? combat.selectedCombatTarget.id
    : null;
  const selectedWeakPoint = selectedWeakPointId
    ? (combatMonster.weakPoints || []).find(point => point.id === selectedWeakPointId)
    : null;
  const previewAttack = selectedWeakPointId
    ? safeActive?.hand.find(card =>
      card.type === 'attack' && !card.unplayable && getAdjustedCardCost(card, safeActive) <= safeActive?.survivor?.energy
    )
    : null;
  const baneRevealsWeakPoints = livingPartyHasMonsterBane || (
    hasMonsterBane && validMembers.some(member => member?.survivor?.hp > 0 && member.hasMonsterBane)
  );
  const selectedCardPreview = previewAttack && selectedWeakPoint
    ? getCardPreview({
        card: previewAttack,
        survivor: safeActive.survivor,
        combatState: {
          ...safeActive,
          monster: combatMonster,
          intentIndex: combat.intentIndex,
          selectedWeakPointId,
          hasMonsterBane: baneRevealsWeakPoints
        },
        monster: combatMonster,
        selectedTarget: combat.selectedCombatTarget,
        selectedWeakPoint,
        party: validMembers
      })
    : null;
  const selectedPreview = selectedCardPreview
    ? {
        cardName: previewAttack.name,
        monsterDamage: selectedCardPreview.monsterHpDamage,
        breakDamage: selectedCardPreview.weakPointBreakDamage,
        weaponMatch: selectedCardPreview.weaponMatch || 'Neutral',
        harvestPreview: selectedCardPreview.harvestPreview,
        weakPointBreakdown: selectedCardPreview.weakPointBreakdown,
        overkillBreakdown: selectedCardPreview.overkillBreakdown,
        harvestBreakdown: selectedCardPreview.harvestBreakdown,
        failedBreakBreakdown: selectedCardPreview.failedBreakBreakdown,
        tellState: selectedCardPreview.tellState === 'unknown'
          ? getPartyWeakPointPreview(combat, selectedWeakPointId)?.tellState || 'neutral'
          : selectedCardPreview.tellState,
        riskSuppressed: selectedCardPreview.failedBreakRiskSuppressed
      }
    : null;
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
  const counterIntentText = weakPoint => {
    const intentTags = currentIntent?.tags || [];
    const connected = intentTags.some(tag => weakPoint.tags?.includes(tag)) ||
      weakPoint.effect?.tags?.some(tag => intentTags.includes(tag));
    if (!baneRevealsWeakPoints) {
      const tellState = getPartyCounterPreview(combat, weakPoint.id)?.tellState || 'neutral';
      if (tellState === 'open') return `The ${weakPoint.name.toLowerCase()} is exposed.`;
      if (tellState === 'guarded') return `The ${weakPoint.name.toLowerCase()} is protected.`;
      if (tellState === 'dangerous') return `The ${weakPoint.name.toLowerCase()} is moving too quickly.`;
      return 'Its relation to the attack is unclear.';
    }
    return connected
      ? `Connected to ${currentIntent?.name || 'the current intent'}; breaking it can weaken this pattern.`
      : 'Not directly connected to the current intent.';
  };

  const finish = () => {
    const safePartyBonuses = Array.isArray(partyBonuses) ? partyBonuses : [];
    const healedMembers = validMembers.map(member =>
      resolveAfterCombatHealing(cleanupConsumedCards(member), combat.status === 'won' ? 'victory' : 'combat')
    );
    const survivors = healedMembers
      .filter(member => member?.survivor?.id)
      .map(member => {
        const originalBonus = safePartyBonuses.find(
          bonus => bonus?.survivor?.id === member?.survivor?.id
        );
        return {
          ...(originalBonus?.survivor || member.survivor),
          hp: member.survivor.hp,
          survival: member.survivor.survival,
          hitLocations: member.survivor.hitLocations,
          treatmentNotes: member.survivor.treatmentNotes,
          injuries: member.injuries,
          scars: member.scars,
          disorders: member.disorders,
          personalDeckAdditions: member.personalDeckAdditions,
          woundHistory: member.woundHistory,
          boundGear: member.status === 'dead'
            ? member.destroyedBoundGear || []
            : member.boundGear,
          causeOfDeath: member.causeOfDeath || null,
          alive: member.status !== 'dead',
          isAlive: member.status !== 'dead',
          combatStats: {
            cardsPlayed: member.cardsPlayedThisTurn,
            attacksPlayed: member.attacksPlayedThisTurn,
            brokeWeakPoint: Boolean(member.brokeWeakPointThisHunt),
            dealtFinalBlow: Boolean(member.dealtFinalBlowThisHunt)
          }
        };
      });
    const salvageRewards = healedMembers.map(getPostCombatSalvageRewards);
    if (combat.status === 'won') onVictory({
      survivors,
      monster: combatMonster,
      brokenWeakPoints,
      wounds: healedMembers.flatMap(member => member.woundHistory || []),
      salvageTokens: salvageRewards.reduce((total, reward) => total + reward.salvageTokens, 0),
      salvageResources: salvageRewards.flatMap(reward => reward.resources),
      afterCombatLog: [
        ...healedMembers.flatMap(member => member.afterCombatLog || []),
        ...salvageRewards.flatMap(reward => reward.log)
      ]
    });
    else onDefeat({
      survivors,
      killedBy: combatMonster.name,
      killedById: combatMonster.baseId || combatMonster.id
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
            : active?.survivor?.name}
        </strong>
      </p>
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
      <div className="combatants">
        <div>
          {validMembers.map(member => (
            <div key={member.survivor.id} className={member.survivor.id === combat.activeCombatant ? 'selected' : ''}>
              <SurvivorPanel
                survivor={member.survivor}
                passiveContext={{
                  survivor: {
                    ...member,
                    ...member.survivor
                  },
                  settlement,
                  combatState: {
                    ...member,
                    activeAuras: combat.activeAuras,
                    monster: combatMonster
                  },
                  currentQuarryId: combatMonster?.quarryId
                }}
              />
            </div>
          ))}
        </div>
        <MonsterPanel
          monster={combatMonster}
          intent={currentIntent}
          hasMonsterBane={baneRevealsWeakPoints}
          intentHintLevel={active?.intentHintLevel || 0}
        />
      </div>

      <section className="survival-command-bar targeting-bar">
        <div>
          <strong>Target</strong>
          <span>{selectedWeakPointId
            ? selectedWeakPoint?.name
            : 'Monster Body'}</span>
        </div>
        <div className="survival-action-buttons targeting-options">
          <button
            type="button"
            className={!selectedWeakPointId ? 'selected' : ''}
            onClick={() => safeCombatUpdate('select target', current => selectPartyCombatTarget({
              type: 'monster',
              id: current.monster.id || 'monster'
            }, current))}
          >
            <strong>Monster Body</strong>
            <small>{combatMonster.hp}/{combatMonster.maxHp} HP</small>
          </button>
          {(combatMonster.weakPoints || []).map(weakPoint => (
            <button
              type="button"
              key={weakPoint.id}
              disabled={weakPoint.broken}
              className={selectedWeakPointId === weakPoint.id ? 'selected' : ''}
              title={formatValueForDisplay(weakPoint.description)}
              onClick={() => safeCombatUpdate('select weak point', current => selectPartyCombatTarget({
                type: 'weakPoint',
                id: weakPoint.id
              }, current))}
            >
              <strong>{weakPoint.name}</strong>
              <small>{weakPoint.broken
                ? 'Broken'
                : `${weakPoint.currentBreakDamage}/${weakPoint.breakValue} break`}</small>
              <small>{weakPoint.broken
                ? 'Disabled'
                : `${tellLabel(getPartyWeakPointPreview(combat, weakPoint.id)?.tellState || 'neutral')} | ${weakPoint.riskLabel}`}</small>
            </button>
          ))}
        </div>
        {selectedPreview && (
          <div className="run-bonus-note">
            <strong>Preview using {selectedPreview.cardName}</strong>
            <div>
              Damage: {selectedPreview.monsterDamage} monster HP,{' '}
              {selectedCardPreview.blockDamage || 0} block,{' '}
              {selectedCardPreview.finalDamage || selectedPreview.monsterDamage} total.
            </div>
            {selectedPreview.weakPointBreakdown && (
              <div>
                Weak Point: {selectedPreview.weakPointBreakdown.name}. Break:{' '}
                {selectedPreview.weakPointBreakdown.current} / {selectedPreview.weakPointBreakdown.breakValue}
                {' '}+ incoming {selectedPreview.weakPointBreakdown.incoming}
                {' '}= {selectedPreview.weakPointBreakdown.projected}.{' '}
                {selectedPreview.weakPointBreakdown.outcomeLabel}.
              </div>
            )}
            {selectedPreview.overkillBreakdown && (
              <div>
                Overkill: {selectedPreview.overkillBreakdown.amount} -{' '}
                {selectedPreview.overkillBreakdown.label}.
              </div>
            )}
            {selectedPreview.harvestBreakdown && (
              <div>
                Harvest: {selectedPreview.harvestBreakdown.quality};{' '}
                {selectedPreview.harvestBreakdown.family} family;{' '}
                {selectedPreview.harvestBreakdown.weaponSuitability} weapon.
                {selectedPreview.harvestBreakdown.warning
                  ? ` ${selectedPreview.harvestBreakdown.warning}`
                  : ' Low risk of ruined harvest.'}
                {selectedPreview.harvestBreakdown.rarePartHint
                  ? ` ${selectedPreview.harvestBreakdown.rarePartHint}.`
                  : ''}
              </div>
            )}
            {selectedPreview.failedBreakBreakdown && (
              <div>
                Failed-break consequence: {selectedPreview.failedBreakBreakdown.consequence}
                {selectedPreview.failedBreakBreakdown.suppressed
                  ? `, suppressed because ${selectedPreview.failedBreakBreakdown.suppressionReason}.`
                  : '.'}
              </div>
            )}
            <div>
              Tell: {tellLabel(selectedPreview.tellState)}.{' '}
              {baneRevealsWeakPoints ? counterIntentText(selectedWeakPoint) : harvestPreview(selectedWeakPoint)}
            </div>
          </div>
        )}
        {!selectedPreview && (
          <p className="run-bonus-note">
            Monster Body: normal HP damage. Attacks and Counter use this shared target automatically.
          </p>
        )}
      </section>

      {!!combat.combatLog?.length && (
        <details className="combat-deck-list">
          <summary>Combat Log ({combat.combatLog.length})</summary>
          <ul>
            {combat.combatLog.slice(-10).map((entry, index) => (
              <li key={`combat-log-${index}`}>{formatHistoryDetail(entry)}</li>
            ))}
          </ul>
        </details>
      )}

      {combatOver && (
        <div className={`combat-result ${combat.status}`} role="status">
          <div>{combat.status === 'won' ? 'Victory!' : 'Party Defeated'}</div>
          {brokenWeakPoints.map(weakPoint => (
            <p key={weakPoint.id}>
              Broken weak point: {formatValueForDisplay(weakPoint.name)} -{' '}
              {formatValueForDisplay(weakPoint.harvestResult?.quality) || 'messy'} harvest.{' '}
              {formatHistoryDetail(
                weakPoint.harvestResult?.impactText ||
                weakPoint.harvestResult?.effect ||
                weakPoint.onBreakEffect
              )}
              {weakPoint.onBreakEffect && (
                <> {formatEffectForDisplay(weakPoint.onBreakEffect)}</>
              )}
            </p>
          ))}
          {validMemberEntries.flatMap(({ member, index: memberIndex }) =>
            Object.entries(member.survivor.hitLocations || {})
              .filter(([, wound]) => wound.wounded)
              .map(([location, wound]) => (
                <div key={`${member.survivor.id}-${location}`}>
                  <p>
                    {formatValueForDisplay(member.survivor.name)}:{' '}
                    {formatValueForDisplay(location)} - {formatHistoryDetail(wound.penalty)}
                  </p>
                  {!wound.severe && ['arms', 'body'].includes(location) && (
                    <button
                      type="button"
                      onClick={() => safeCombatUpdate('treat wound', current =>
                        treatPartyWound(memberIndex, location, 'bandage', current)
                      )}
                    >
                      Bandage {member.survivor.name}'s {location}
                    </button>
                  )}
                  {!wound.severe && ['arms', 'legs'].includes(location) && (
                    <button
                      type="button"
                      onClick={() => safeCombatUpdate('treat wound', current =>
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

      {!combatOver && safeActive && (
        <>
          <section className="survival-command-bar">
            <div>
              <strong>{safeActive.survivor.name} Survival Actions</strong>
              <span>{safeActive.survivor.survival} / {safeActive.survivor.maxSurvival}</span>
            </div>
            <div className="survival-action-buttons">
              {survivalActions.map(action => {
                const used = safeActive.survivalActionsUsed.includes(action.id);
                const insufficient = safeActive.survivor.survival < action.cost;
                return (
                  <button
                    type="button"
                    key={action.id}
                    disabled={used || insufficient}
                    title={`${formatValueForDisplay(action.name)}: ${formatHistoryDetail(action.effect)}`}
                    onClick={() => safeCombatUpdate('survival action', current => usePartySurvivalAction(action.id, current))}
                  >
                    {action.name} ({action.cost})
                  </button>
                );
              })}
            </div>
            {!safeActive.survivalActionsUsed.includes('counter') && selectedWeakPoint && (
              <small>
                Counter preview: {
                  getPartyCounterPreview(combat, selectedWeakPoint.id)?.targetable
                    ? `${getPartyCounterPreview(combat, selectedWeakPoint.id)?.monsterDamage || 0} monster / ` +
                      `${getPartyCounterPreview(combat, selectedWeakPoint.id)?.breakDamage || 0} break`
                    : 'invalid for this part; Counter will fall back to Monster Body'
                }.
              </small>
            )}
            {safeActive.survivalFeedback && <p role="status">{safeActive.survivalFeedback}</p>}
            {fightingArtActions.length > 0 && (
              <div className="survival-action-buttons" aria-label="Active fighting arts">
                {fightingArtActions.map(action => (
                  <button
                    type="button"
                    key={action.id}
                    disabled={action.disabled}
                    title={`${action.reason} Uses left: ${action.remainingUses}`}
                    onClick={() => safeCombatUpdate('fighting art action', current => usePartyFightingArtAction(action.id, current))}
                  >
                    {action.name} ({action.remainingUses})
                  </button>
                ))}
              </div>
            )}
          </section>
          <div className="combat-controls">
            <div>
              Draw: {safeActive.drawPile.length} | Discard: {safeActive.discardPile.length} | Exhaust: {safeActive.exhaustPile.length}
            </div>
            <button type="button" onClick={() => safeCombatUpdate('end turn', endPartyTurn)}>End Turn</button>
          </div>
          {getVisibleNamedMechanicCounters(safeActive).length > 0 && (
            <section className="run-bonus-note" aria-label="Named mechanic counters">
              <strong>Named Mechanics:</strong>{' '}
              {getVisibleNamedMechanicCounters(safeActive).map(counter => (
                <span className="status-tag" key={counter.name}>{counter.name} {counter.amount}</span>
              ))}
            </section>
          )}
          <details className="combat-deck-list">
            <summary>{safeActive.survivor.name} Deck ({safeActive.runDeck.length} cards)</summary>
            <ul>
              {safeActive.runDeck.map((card, index) => (
                <li key={`${card.id}-${index}`}>{card.name}{card.source ? ` - ${card.source}` : ''}</li>
              ))}
            </ul>
          </details>
          <div className="hand" aria-label={`${safeActive.survivor.name} card hand`}>
            {safeActive.hand.map((card, index) => {
              const previewState = {
                ...safeActive,
                monster: combatMonster,
                intentIndex: combat.intentIndex,
                selectedWeakPointId,
                hasMonsterBane: baneRevealsWeakPoints
              };
              const adjustedCost = getAdjustedCardCost(card, previewState);
              const spendableEffects = (card.effects || []).filter(effect =>
                ['spendNamedMechanicForDamage', 'spendNamedMechanicForBlock'].includes(effect.type)
              );
              const playOptions = {
                namedMechanicSpend: namedSpendSelections[index] || {}
              };
              return (
                <Card
                  key={`${card.id}-${index}`}
                  card={card}
                  preview={getCardPreview({
                    card,
                    survivor: safeActive.survivor,
                    combatState: previewState,
                    monster: combatMonster,
                    selectedTarget: combat.selectedCombatTarget,
                    selectedWeakPoint,
                    party: validMembers,
                    playOptions
                  })}
                  monster={combatMonster}
                  survivor={safeActive.survivor}
                  combatState={previewState}
                  party={validMembers}
                  adjustedCost={adjustedCost}
                  spendableEffects={spendableEffects}
                  spendSelections={namedSpendSelections[index] || {}}
                  playOptions={playOptions}
                  onSpendChange={(mechanic, amount) => setNamedSpendSelections(current => ({
                    ...current,
                    [index]: {
                      ...(current[index] || {}),
                      [mechanic]: amount
                    }
                  }))}
                  disabled={card.unplayable || adjustedCost > safeActive.survivor.energy}
                  onPlay={() => {
                    safeCombatUpdate('play card', current => playPartyCard(index, current, playOptions));
                    setNamedSpendSelections({});
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
