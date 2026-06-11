import React from 'react';
import { resources } from '../data/resources.js';
import { getQuarryBehaviourLabel, getQuarryBehaviourNote } from '../data/quarries.js';

export default function MonsterDiscoveryScreen({ quarries, storyText, onChoose, onSkip }) {
  const visible = quarries.filter(quarry => quarry.role === 'quarry');

  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Monster Discovery</p>
      <h2>Choose A New Quarry Rumour</h2>
      <p>{storyText || 'The returning hunter brings enough knowledge to pursue one new creature.'}</p>
      <div className="progress-choice-grid">
        {visible.map(quarry => (
          <button type="button" key={quarry.id} onClick={() => onChoose(quarry.id)}>
            <strong>{quarry.name}</strong>
            <span>{quarry.description}</span>
            <span>{getQuarryBehaviourLabel(quarry)}</span>
            {getQuarryBehaviourNote(quarry) && <span>{getQuarryBehaviourNote(quarry)}</span>}
            <span>Reveals: {quarry.associatedInnovations?.[0] || 'future settlement knowledge'}</span>
            <span>
              Resources: {quarry.uniqueResources.slice(0, 3)
                .map(resourceId => resources[resourceId]?.name || resourceId).join(', ')}
            </span>
          </button>
        ))}
      </div>
      {!visible.length && <p>No new quarry rumours were found.</p>}
      <button type="button" className="secondary-button" onClick={onSkip}>Keep Existing Knowledge</button>
    </section>
  );
}
