import React, { useState } from 'react';
import { resources } from '../data/resources.js';

export default function LootRewardScreen({
  quarryName,
  level,
  choices,
  genericRewards = [],
  bossReward,
  brokenWeakPoints = [],
  wounds = [],
  onChoose
}) {
  const chooseCount = level;
  const [selected, setSelected] = useState([]);
  const toggleChoice = resourceId => {
    setSelected(current => current.includes(resourceId)
      ? current.filter(id => id !== resourceId)
      : current.length < chooseCount ? [...current, resourceId] : current);
  };
  const rarityLabel = resource => {
    if (resource?.type === 'level3Rare') return 'Level 3 Rare';
    if (resource?.type === 'rare' || resource?.type === 'strange') return 'Rare';
    return resource?.type === 'creature' ? 'Common' : 'Uncommon';
  };
  return (
    <section className="loot-reward-screen">
      <p className="eyebrow">Party Spoils</p>
      <h2>{quarryName} Level {level}</h2>
      {bossReward && (
        <div className="generic-reward-list">
          <strong>Generic resources gained:</strong>{' '}
          {genericRewards.map(resourceId => resources[resourceId]?.name || resourceId).join(', ')}
        </div>
      )}
      {brokenWeakPoints.length > 0 && (
        <div className="generic-reward-list">
          <strong>Broken weak points:</strong>
          {brokenWeakPoints.map(weakPoint => (
            <p key={weakPoint.id}>
              {weakPoint.name} - {weakPoint.harvestResult?.quality || 'Messy'} harvest -{' '}
              {weakPoint.harvestResult?.impactText || 'related part odds improved'}
            </p>
          ))}
        </div>
      )}
      {wounds.length > 0 && (
        <p>
          Wounds suffered: {wounds.map(wound =>
            `${wound.name} (${wound.location}, ${wound.severity})`
          ).join(', ')}
        </p>
      )}
      <p>Choose {chooseCount} monster {chooseCount === 1 ? 'part' : 'parts'}.</p>
      <div className="loot-choice-grid">
        {choices.map((resourceId, index) => {
          const resource = resources[resourceId];
          return (
            <button
              type="button"
              key={`${resourceId}-${index}`}
              className={selected.includes(resourceId) ? 'selected' : ''}
              onClick={() => toggleChoice(resourceId)}
            >
              <strong>{resource?.name || resourceId}</strong>
              <span>{rarityLabel(resource)}</span>
              <span>{resource?.description}</span>
            </button>
          );
        })}
      </div>
      <button type="button" disabled={selected.length !== chooseCount} onClick={() => onChoose(selected)}>
        Take Selected Parts ({selected.length}/{chooseCount})
      </button>
    </section>
  );
}
