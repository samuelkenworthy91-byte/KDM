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

const safeText = (value, fallback = 'Unknown') =>
  value == null || value === '' ? fallback : formatValueForDisplay(value);

const safeBandLabel = band =>
  safeText(band?.label || band?.id, 'Outcome');

const safeBandText = band =>
  safeText(band?.resultText || band?.outcomeText || band?.description, 'The event changes the hunt.');

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
  const [isRolling, setIsRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState(null);
  const [lockedRoll, setLockedRoll] = useState(null);
  const [chosenEventSurvivorId, setChosenEventSurvivorId] = useState(null);
  const rollTimerRef = useRef(null);
  const displayEvent = normalizeHuntEventForRoll(event);
  const context = { runParty, settlement, selectedQuarry: { id: selectedQuarry }, quarry: { id: selectedQuarry } };
  const livingParty = (runParty || []).filter(survivor => survivor?.hp > 0 && survivor.alive !== false);
  const resultBands = Array.isArray(displayEvent?.resultBands) ? displayEvent.resultBands : [];
  const isRollEvent = isHuntRollEvent(displayEvent);
  const needsEventSurvivorChoice = isRollEvent &&
    (displayEvent.allowsChoice || displayEvent.eventSurvivorRule === 'playerChoice');

  useEffect(() => {
    setResult(null);
    setIsRolling(false);
    setDisplayRoll(null);
    setLockedRoll(null);
    setChosenEventSurvivorId(null);
    if (rollTimerRef.current) {
      clearInterval(rollTimerRef.current);
      rollTimerRef.current = null;
    }
  }, [displayEvent?.id]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) {
        clearInterval(rollTimerRef.current);
      }
    };
  }, []);

  const previewBands = lockedRoll
    ? resultBands.filter(band => (
      (band.min == null || lockedRoll >= band.min) &&
      (band.max == null || lockedRoll <= band.max)
    ))
    : resultBands;
  const autoPreview = previewBands.flatMap(band =>
    band?.effects
      ? formatEventEffects(band.effects, context).map(effect => `${band.label || band.id}: ${effect}`)
      : []
  ).filter(effect => effect != null && effect !== '');
  const chooseEventSurvivor = survivorId => {
    setChosenEventSurvivorId(survivorId);
  };
  const getRollDie = () => Number(displayEvent?.roll?.die) || 10;
  const generateRoll = () => {
    const die = getRollDie();
    return Math.floor(Math.random() * die) + 1;
  };
  const safelyChoose = choice => {
    try {
      if (typeof onChoose !== 'function') {
        setResult({
          eventId: displayEvent?.id || 'unknownEvent',
          choiceId: 'eventRecovery',
          outcomeText: 'The event hit a recovery path.',
          appliedEffects: ['Event recovery: event choice handler missing'],
          recovered: true
        });
        return;
      }
      const next = onChoose(choice);
      setResult(next || {
        eventId: displayEvent?.id || 'unknownEvent',
        choiceId: 'eventRecovery',
        outcomeText: 'The event resolved without a result.',
        appliedEffects: ['Event recovery: No event result was returned.'],
        recovered: true
      });
    } catch (error) {
      setResult({
        eventId: displayEvent?.id || 'unknownEvent',
        choiceId: 'eventRecovery',
        outcomeText: 'The event hit a recovery path.',
        appliedEffects: [`Event recovery: ${error?.message || 'unknown error'}`],
        recovered: true
      });
    }
  };
  const handleRoll = () => {
    if (isRolling || result) return;

    const finalRoll = generateRoll();
    setLockedRoll(finalRoll);
    setIsRolling(true);

    let ticks = 0;
    const die = getRollDie();

    rollTimerRef.current = setInterval(() => {
      ticks += 1;
      setDisplayRoll(Math.floor(Math.random() * die) + 1);

      if (ticks >= 12) {
        clearInterval(rollTimerRef.current);
        rollTimerRef.current = null;
        setDisplayRoll(finalRoll);
        setIsRolling(false);
        safelyChoose({
          eventSurvivorId: chosenEventSurvivorId,
          rollOverride: finalRoll
        });
      }
    }, 80);
  };

  return (
    <section className="event-screen">
      <p className="eyebrow">Hunt Event</p>
      <h2>{formatValueForDisplay(displayEvent.name)}</h2>
      <p className="event-description">
        {formatValueForDisplay(displayEvent.longDescription || displayEvent.description)}
      </p>
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
                <strong>{formatBandRange(band)} - {safeBandLabel(band)}</strong>
                <span>{safeBandText(band)}</span>
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
              className={chosenEventSurvivorId === survivor.id ? 'selected' : ''}
              onClick={() => chooseEventSurvivor(survivor.id)}
            >
              {survivor.name} - HP {survivor.hp}/{survivor.maxHp}, Survival {survivor.survival || 0}
            </button>
          ))}
        </div>
      ) : null}

      {!result && isRollEvent ? (
        <div className="event-outcome">
          <section className="event-roll-graphic" aria-label="Roll result graphic">
            <div className={`roll-die ${isRolling ? 'rolling' : ''}`}>
              {displayRoll || lockedRoll || '?'}
            </div>
            <div>
              <p>Roll: d{getRollDie()}</p>
              {chosenEventSurvivorId && (
                <p>
                  Event survivor selected: {
                    livingParty.find(survivor => survivor.id === chosenEventSurvivorId)?.name ||
                    chosenEventSurvivorId
                  }
                </p>
              )}
            </div>
          </section>
          <button
            type="button"
            onClick={handleRoll}
            disabled={isRolling || (needsEventSurvivorChoice && !chosenEventSurvivorId)}
          >
            {isRolling ? 'Rolling...' : `Roll d${getRollDie()}`}
          </button>
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
      ) : result?.recovered ? (
        <div className="event-outcome event-recovery-panel">
          <h3>Event Recovery</h3>
          <p>Event: {result.eventId || displayEvent?.id || 'unknownEvent'}</p>
          <ul>
            {(result.appliedEffects || ['Event recovery: unknown error'])
              .filter(effect => effect != null && effect !== '')
              .map((effect, index) => (
              <li key={`event-recovery-${index}`}>{formatHistoryDetail(effect)}</li>
            ))}
          </ul>
          <button type="button" onClick={onContinue}>Continue Hunt</button>
        </div>
      ) : result ? (
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
                {result.appliedEffects
                  .filter(effect => effect != null && effect !== '')
                  .map((effect, index) => (
                  <li key={`event-effect-${index}`}>{formatHistoryDetail(effect)}</li>
                ))}
              </ul>
            </>
          )}
          <button type="button" onClick={onContinue}>Continue Hunt</button>
        </div>
      ) : null}
    </section>
  );
}
