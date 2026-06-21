import React, { useState, useEffect } from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';
import { canUseEventChoice, getChoiceLockedText } from '../game/eventRequirementLogic.js';
import { formatEventEffects } from '../game/eventLogic.js';

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
  const context = { runParty, settlement, selectedQuarry: { id: selectedQuarry }, quarry: { id: selectedQuarry } };
  const choices = event.choices || [];
  const livingParty = (runParty || []).filter(survivor => survivor?.hp > 0 && survivor.alive !== false);
  const isRollEvent = event.eventType === 'huntRoll' ||
    (Array.isArray(event.resultBands) && event.resultBands.length > 0);
  const needsEventSurvivorChoice = isRollEvent && (event.allowsChoice || event.eventSurvivorRule === 'playerChoice');
  const isAutomatic = event.mode === 'automatic';

  useEffect(() => {
    setResult(null);
  }, [event?.id]);

  // Automatic and roll events still render their text and outcome before the player continues.
  useEffect(() => {
    if ((isAutomatic || (isRollEvent && !needsEventSurvivorChoice)) && !result) {
      const next = onChoose(null);
      setResult(next);
    }
  }, [isAutomatic, isRollEvent, needsEventSurvivorChoice, result, onChoose]);

  const choose = choice => {
    if (!canUseEventChoice(choice, context)) return;
    const next = onChoose(choice);
    setResult(next);
  };

  const isChoiceLocked = choice => !canUseEventChoice(choice, context);
  const choicePreview = choice => choice.preview ||
    formatEventEffects(choice.effects || {}, context).join(' ');
  const autoPreview = event.autoOutcome?.effects
    ? formatEventEffects(event.autoOutcome.effects, context)
    : [];
  const chooseEventSurvivor = survivorId => {
    const next = onChoose({ eventSurvivorId: survivorId });
    setResult(next);
  };

  return (
    <section className="event-screen">
      <p className="eyebrow">Hunt Event</p>
      <h2>{formatValueForDisplay(event.name)}</h2>
      <p className="event-description">
        {formatValueForDisplay(event.longDescription || event.description)}
      </p>
      {(isAutomatic || (isRollEvent && !needsEventSurvivorChoice)) && !result && (
        <p className="run-bonus-note">This event resolves immediately. The result will be shown before the hunt continues.</p>
      )}
      
      {hasParanoia && !result && (
        <p className="missing">Paranoia warns that every choice may conceal a worse outcome.</p>
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
      ) : !result && !isAutomatic && !isRollEvent ? (
        <div className="event-choices">
          {choices.map(choice => {
            const lockedText = getChoiceLockedText(choice, context);
            const isLocked = Boolean(lockedText);
            const preview = choicePreview(choice);
            
            return (
              <div key={choice.id} className="choice-container">
                <button
                  type="button"
                  onClick={() => choose(choice)}
                  disabled={isLocked}
                  className={isLocked ? 'locked' : ''}
                >
                  {formatValueForDisplay(choice.text)}
                </button>
                {preview && <p className="choice-preview">{formatHistoryDetail(preview)}</p>}
                {isLocked && <p className="locked-text">{lockedText}</p>}
              </div>
            );
          })}
          {choices.every(isChoiceLocked) && (
            <div className="choice-container fallback">
              <button
                type="button"
                onClick={() => {
                  const next = onChoose('fallback');
                  setResult(next);
                }}
              >
                Force a desperate route (-2 HP)
              </button>
              <p className="choice-preview">Fallback: Lose HP x2. The hunt continues.</p>
            </div>
          )}
        </div>
      ) : !result && (isAutomatic || isRollEvent) ? (
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
