import React from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';

export default function NemesisResultScreen({ result, onContinue }) {
  return (
    <section className="summary-screen">
      <p className="eyebrow">Timeline Threat Resolved</p>
      <h2>{result.nemesisName}: {result.result === 'victory' ? 'Victory' : 'Defeat'}</h2>
      <p>{formatValueForDisplay(result.text)}</p>
      <p><strong>Survivor:</strong> {formatValueForDisplay(result.survivorName) || 'None'}</p>
      <p><strong>{result.result === 'victory' ? 'Rewards' : 'Consequences'}:</strong>{' '}
        {formatHistoryDetail(result.details) || 'None'}
      </p>
      <button type="button" onClick={onContinue}>
        {result.deathSummary ? 'Choose Grave Legacy' : 'Return to Settlement'}
      </button>
    </section>
  );
}
