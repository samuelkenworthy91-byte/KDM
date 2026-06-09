import React, { useState } from 'react';
import { resources } from '../data/resources.js';

export default function MonsterDiscoveryScreen({ quarries, onChoose, onSkip }) {
  const roles = [...new Set(quarries.map(quarry => quarry.role))];
  const [role, setRole] = useState(roles[0] || 'quarry');
  const visible = quarries.filter(quarry => quarry.role === role);

  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Monster Discovery</p>
      <h2>Choose A New Quarry Rumour</h2>
      <p>The returning hunter brings enough knowledge to pursue one new creature.</p>
      <div className="button-row">
        {roles.map(roleId => (
          <button
            type="button"
            key={roleId}
            className={role === roleId ? 'selected' : 'secondary-button'}
            onClick={() => setRole(roleId)}
          >
            {roleId}
          </button>
        ))}
      </div>
      <div className="progress-choice-grid">
        {visible.map(quarry => (
          <button type="button" key={quarry.id} onClick={() => onChoose(quarry.id)}>
            <strong>{quarry.name}</strong>
            <span>{quarry.description}</span>
            <span>{quarry.implemented ? 'Fully implemented' : 'Fallback behaviour'}</span>
            <span>Reveals: {quarry.associatedInnovations?.[0] || 'future settlement knowledge'}</span>
            <span>
              Resources: {quarry.uniqueResources.slice(0, 3)
                .map(resourceId => resources[resourceId]?.name || resourceId).join(', ')}
            </span>
          </button>
        ))}
      </div>
      <button type="button" className="secondary-button" onClick={onSkip}>Keep Existing Knowledge</button>
    </section>
  );
}
