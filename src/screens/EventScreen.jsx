import React, { useState, useEffect, useRef } from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';
import {
  formatEventEffects,
  isHuntRollEvent,
  normalizeHuntEventForRoll
} from '../game/eventLogic.js';

const formatBandRange = band => {
  if (band.min == null && band.max == null) return 'Any';
  if (band.min == null) return `<= ${band.max}`;
  if (band.max == null) return `${band.min}+`;
  return `${band.min}-${band.max}`;
};

export default function EventScreen({
  event,
  hasParanoia,
  onChoose,
  onContinue,
  runParty,
  settlement,
  selectedQuarry
}) {
  const [result, setResult] = useState(null);
  const resolvedEventIdRef = useRef(null);
  const displayEvent = normalizeHuntEventForRoll(event);
  const context = { runParty, settlement, selectedQuarry: { id: selectedQuarry }, quarry: { id: selectedQuarry } };
  const livingParty = (runParty || []).filter(survivor => survivor?.hp > 0 && survivor.alive !== false);
  const resultBands = Array.isArray(displayEvent?.resultBands) ? displayEvent.resultBands : [];
  const isRollEvent = isHuntRollEvent(displayEvent);
  const needsEventSurvivorChoice = isRollEvent &&
    (displayEvent.allowsChoice || displayEvent.eventSurvivorRule === 'playerChoice');

  useEffect(() => {
    setResult(null);
    resolvedEventIdRef.current = null;
  }, [displayEvent?.id]);

  useEffect(() => {
    if (!isRollEvent || needsEventSurvivorChoice || result) return;
    if (resolvedEventIdRef.current === displayEvent?.id) return;
    resolvedEventIdRef.current = displayEvent?.id;
    const next = onChoose(null);
    setResult(next);
  }, [displayEvent?.id, isRollEvent, needsEventSurvivorChoice, result]);

  const autoPreview = resultBands[0]?.effects
    ? formatEventEffects(resultBands[0].effects, context)
    : [];
  const chooseEventSurvivor = survivorId => {
    const next = onChoose({ eventSurvivorId: survivorId });
    setResult(next);
  };

  return (
    <section className="event-screen">
      <p className="eyebrow">Hunt Event</p>
      <h2>{formatValueForDisplay(displayEvent.name)}</h2>
      <p className="event-description">
        {formatValueForDisplay(displayEvent.longDescription || displayEvent.description)}
      </p>
      {isRollEvent && !needsEventSurvivorChoice && !result && (
        <p className="run-bonus-note">This event resolves immediately. The result will be shown before the hunt continues.</p>
      )}
      
      {hasParanoia && !result && (
        <p className="missing">Paranoia warns that every choice may conceal a worse outcome.</p>
      )}

      {isRollEvent && (
        <section className="event-roll-table" aria-label="Hunt event roll table">
          <h3>Roll Table</h3>
          <p>Event survivor: {displayEvent.eventSurvivorRule || 'partyLeader'}</p>
          <p>Roll: d{displayEvent.roll?.die || 10}</p>
          <div className="roll-band-list">
            {resultBands.map(band => (
              <div
                key={band.id}
                className={`roll-band ${result?.outcomeBand?.id === band.id ? 'selected' : ''}`}
              >
                <strong>{formatBandRange(band)} - {band.label}</strong>
                <span>{band.resultText || band.outcomeText}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!result && needsEventSurvivorChoice ? (
        <div className="event-choices">
          <h3>Choose Event Survivor</h3>
          {livingParty.map(survivor => (
            <button
              type="button"
              key={survivor.id}
              onClick={() => chooseEventSurvivor(survivor.id)}
            >
              {survivor.name} - HP {survivor.hp}/{survivor.maxHp}, Survival {survivor.survival || 0}
            </button>
          ))}
        </div>
      ) : !result && isRollEvent ? (
        <div className="event-outcome">
          <p className="outcome-text">The event is resolving.</p>
          {autoPreview.length > 0 && (
            <>
              <h3>Expected Effects</h3>
              <ul>
                {autoPreview.map((effect, index) => (
                  <li key={`event-auto-preview-${index}`}>{formatHistoryDetail(effect)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div className="event-outcome">
          <p className="outcome-text">
            {formatValueForDisplay(result.outcomeText || 'The hunt event resolves.')}
          </p>
          {result.roll && (
            <section className="event-roll-graphic" aria-label="Roll result graphic">
              <div className="roll-die">d{displayEvent.roll?.die || 10}</div>
              <div>
                <p>Base roll: {result.roll.baseRoll}</p>
                <p>Final roll: {result.roll.finalRoll}</p>
                {result.outcomeBand && <p>Outcome: {result.outcomeBand.label}</p>}
              </div>
            </section>
          )}
          {result.roll && (
            <section className="event-roll-breakdown" aria-label="Hunt event roll breakdown">
              <h3>Roll Result</h3>
              {result.eventSurvivor && (
                <p>
                  Event survivor: <strong>{result.eventSurvivor.name || result.eventSurvivor.id}</strong>
                  {' '}({result.eventSurvivorReason})
                </p>
              )}
              <p>Base roll: {result.roll.baseRoll}</p>
              {result.roll.modifiers?.length > 0 ? (
                <ul>
                  {result.roll.modifiers.map(modifier => (
                    <li key={modifier.id}>
                      {modifier.label}: {modifier.amount > 0 ? '+' : ''}{modifier.amount}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No modifiers.</p>
              )}
              <p>Final roll: {result.roll.finalRoll}</p>
              {result.outcomeBand && <p>Outcome band: {result.outcomeBand.label}</p>}
            </section>
          )}
          {result.appliedEffects?.length > 0 && (
            <>
              <h3>Applied Effects</h3>
              <ul>
                {result.appliedEffects.map((effect, index) => (
                  <li key={`event-effect-${index}`}>{formatHistoryDetail(effect)}</li>
                ))}
              </ul>
            </>
          )}
          <button type="button" onClick={onContinue}>Continue Hunt</button>
        </div>
      )}
    </section>
  );
}
