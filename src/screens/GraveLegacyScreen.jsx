import React, { useState } from 'react';
import { graveLegacyList } from '../data/graveLegacies.js';

export default function GraveLegacyScreen({ summary, onChooseLegacy }) {
  const [selectedLegacyId, setSelectedLegacyId] = useState(graveLegacyList[0].id);
  const selectedLegacy = graveLegacyList.find(legacy => legacy.id === selectedLegacyId);

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
        {graveLegacyList.map(legacy => (
          <button
            key={legacy.id}
            type="button"
            className={`grave-card ${selectedLegacyId === legacy.id ? 'selected' : ''}`}
            onClick={() => setSelectedLegacyId(legacy.id)}
          >
            <h3>{legacy.name}</h3>
            <p>{legacy.description}</p>
            <strong>{legacy.effect}</strong>
          </button>
        ))}
      </div>

      <button type="button" onClick={() => onChooseLegacy(selectedLegacy)}>
        Choose Legacy
      </button>
    </section>
  );
}
