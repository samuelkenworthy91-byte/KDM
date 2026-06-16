import React, { useState, useEffect } from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';
import { canUseEventChoice, getChoiceLockedText } from '../game/eventRequirementLogic.js';

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
  const context = { runParty, settlement, selectedQuarry: { id: selectedQuarry } };

  // Handle automatic events immediately
  useEffect(() => {
    if (event.mode === 'automatic' && !result) {
      const next = onChoose(null);
      setResult(next);
    }
  }, [event, result, onChoose]);

  const choose = choice => {
    if (!canUseEventChoice(choice, context)) return;
    const next = onChoose(choice);
    setResult(next);
  };

  const isChoiceLocked = choice => !canUseEventChoice(choice, context);

  return (
    <section className="event-screen">
      <p className="eyebrow">Hunt Event</p>
      <h2>{formatValueForDisplay(event.name)}</h2>
      <p className="event-description">{formatValueForDisplay(event.description)}</p>
      
      {hasParanoia && !result && (
        <p className="missing">Paranoia warns that every choice may conceal a worse outcome.</p>
      )}

      {!result ? (
        <div className="event-choices">
          {event.choices.map(choice => {
            const lockedText = getChoiceLockedText(choice, context);
            const isLocked = Boolean(lockedText);
            
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
                {isLocked && <p className="locked-text">{lockedText}</p>}
              </div>
            );
          })}
          {event.choices.every(isChoiceLocked) && (
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
            </div>
          )}
        </div>
      ) : (
        <div className="event-outcome">
          <p className="outcome-text">{formatValueForDisplay(result.outcomeText)}</p>
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
