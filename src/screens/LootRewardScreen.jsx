import React from 'react';
import { resources } from '../data/resources.js';

export default function LootRewardScreen({ choices, onChoose }) {
  return (
    <section className="reward-screen">
      <p className="eyebrow">Hunt Reward</p>
      <h2>Choose One Resource</h2>
      <p>The chosen resource will return to the settlement when the run ends.</p>
      <div className="reward-grid">
        {choices.map(resourceId => (
          <button key={resourceId} type="button" onClick={() => onChoose(resourceId)}>
            <strong>{resources[resourceId]?.name || resourceId}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
