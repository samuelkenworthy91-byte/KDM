import React from 'react';
import { resources } from '../data/resources.js';

export default function LootRewardScreen({ quarryName, level, choices, genericRewards = [], bossReward, onChoose }) {
  return (
    <section className="loot-reward-screen">
      <p className="eyebrow">Loot Reward</p>
      <h2>{quarryName} Level {level}</h2>
      {bossReward && (
        <div className="generic-reward-list">
          <strong>Generic resources gained:</strong>{' '}
          {genericRewards.map(resourceId => resources[resourceId]?.name || resourceId).join(', ')}
        </div>
      )}
      <p>{bossReward ? 'Choose one creature-specific resource.' : 'Choose one resource to carry forward.'}</p>
      <div className="loot-choice-grid">
        {choices.map((resourceId, index) => {
          const resource = resources[resourceId];
          return (
            <button type="button" key={`${resourceId}-${index}`} onClick={() => onChoose(resourceId)}>
              <strong>{resource?.name || resourceId}</strong>
              <span>{resource?.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
