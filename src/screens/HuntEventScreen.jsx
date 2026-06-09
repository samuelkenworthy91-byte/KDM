import React, { useState } from 'react';

export default function HuntEventScreen({ event, onChoose, onContinue }) {
  const [result, setResult] = useState(null);

  const choose = choice => {
    const appliedEffects = onChoose(choice);
    setResult({ outcome: choice.outcome, appliedEffects });
  };

  return (
    <section className="event-screen">
      <p className="eyebrow">Hunt Event</p>
      <h2>{event.name}</h2>
      <p>{event.description}</p>

      {!result ? (
        <div className="event-choices">
          {event.choices.map(choice => (
            <button key={choice.text} type="button" onClick={() => choose(choice)}>
              {choice.text}
            </button>
          ))}
        </div>
      ) : (
        <div className="event-outcome" role="status">
          <p>{result.outcome}</p>
          <h3>Applied Effects</h3>
          <ul>
            {result.appliedEffects.map((effect, index) => (
              <li key={`${effect}-${index}`}>{effect}</li>
            ))}
          </ul>
          <button type="button" onClick={onContinue}>Continue</button>
        </div>
      )}
    </section>
  );
}
