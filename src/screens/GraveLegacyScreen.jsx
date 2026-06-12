import React, { useState } from 'react';
import { graveLegacyList } from '../data/graveLegacies.js';
import { formatModifierEffect, formatValueForDisplay } from '../utils/formatters.js';

export default function GraveLegacyScreen({ summary, showAllChoices, onChooseLegacy }) {
  const visibleLegacies = showAllChoices ? graveLegacyList : graveLegacyList.slice(0, 4);
  const [selectedLegacyId, setSelectedLegacyId] = useState(visibleLegacies[0].id);
  const selectedLegacy = visibleLegacies.find(legacy => legacy.id === selectedLegacyId);

  return (
    <section className="grave-legacy-screen">
      <p className="eyebrow">A survivor has fallen</p>
      <h2>Choose What Remains</h2>
      <div className="fallen-details">
        {summary?.survivorName && <p>{summary.survivorName} is gone.</p>}
        {summary?.killedBy && <p>Killed by {summary.killedBy}.</p>}
        <p>
          Row reached: {summary?.rowReached ?? 0} | Nodes completed:{' '}
          {summary?.nodesCompleted ?? 0}
        </p>
        <p>settlementMemory earned from this run: +{summary?.settlementMemoryEarned ?? 0}</p>
      </div>

      <div className="grave-card-grid" aria-label="Grave legacy options">
        {visibleLegacies.map(legacy => (
          <button
            key={legacy.id}
            type="button"
            className={`grave-card ${selectedLegacyId === legacy.id ? 'selected' : ''}`}
            onClick={() => setSelectedLegacyId(legacy.id)}
          >
            <h3>{legacy.name}</h3>
            <p>{formatValueForDisplay(legacy.description)}</p>
            <strong>{formatModifierEffect(legacy.effect)}</strong>
          </button>
        ))}
      </div>

      <button type="button" onClick={() => onChooseLegacy(selectedLegacy)}>
        Choose Legacy
      </button>
    </section>
  );
}
