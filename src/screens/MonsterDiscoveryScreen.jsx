import React from 'react';

export default function MonsterDiscoveryScreen({ quarries, onChoose, onSkip }) {
  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Monster Discovery</p>
      <h2>Choose A New Quarry Rumour</h2>
      <p>The returning hunter brings enough knowledge to pursue one new creature.</p>
      <div className="progress-choice-grid">
        {quarries.map(quarry => (
          <button type="button" key={quarry.id} onClick={() => onChoose(quarry.id)}>
            <strong>{quarry.name}</strong>
            <span>{quarry.description}</span>
            <span>Reveals: {quarry.associatedInnovations?.[0] || 'future settlement knowledge'}</span>
          </button>
        ))}
      </div>
      <button type="button" className="secondary-button" onClick={onSkip}>Keep Existing Knowledge</button>
    </section>
  );
}
