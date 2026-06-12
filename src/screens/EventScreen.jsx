import React, { useState } from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';

export default function EventScreen({ event, hasParanoia, onChoose, onContinue }) {
  const [result, setResult] = useState(null);

  const choose = choice => {
    const next = onChoose(choice);
    setResult(next);
  };

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
          {event.choices.map(choice => (
            <button type="button" key={choice.id} onClick={() => choose(choice)}>
              {formatValueForDisplay(choice.text)}
            </button>
          ))}
        </div>
      ) : (
        <div className="event-outcome">
          <p>{formatValueForDisplay(result.outcomeText)}</p>
          <h3>Applied Effects</h3>
          <ul>
            {result.appliedEffects.map((effect, index) => (
              <li key={`event-effect-${index}`}>{formatHistoryDetail(effect)}</li>
            ))}
          </ul>
          <button type="button" onClick={onContinue}>Continue Hunt</button>
        </div>
      )}
    </section>
  );
}
