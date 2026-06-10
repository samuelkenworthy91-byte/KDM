import React from 'react';

export default function NemesisResultScreen({ result, onContinue }) {
  return (
    <section className="summary-screen">
      <p className="eyebrow">Timeline Threat Resolved</p>
      <h2>{result.nemesisName}: {result.result === 'victory' ? 'Victory' : 'Defeat'}</h2>
      <p>{result.text}</p>
      <p><strong>Survivor:</strong> {result.survivorName || 'None'}</p>
      <p><strong>{result.result === 'victory' ? 'Rewards' : 'Consequences'}:</strong>{' '}
        {result.details.join(', ') || 'None'}
      </p>
      <button type="button" onClick={onContinue}>
        {result.deathSummary ? 'Choose Grave Legacy' : 'Return to Settlement'}
      </button>
    </section>
  );
}
