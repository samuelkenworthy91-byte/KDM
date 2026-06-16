import React, { useState } from 'react';
import { resources } from '../data/resources.js';
import {
  formatEffectForDisplay,
  formatHistoryDetail,
  formatValueForDisplay
} from '../utils/formatters.js';
import { getResourceRarityLabel, getResourceRarityTier } from '../game/resourceRarityLogic.js';

function normalizeOffer(choice, index) {
  if (typeof choice === 'string') {
    const resource = resources[choice];
    return {
      id: `${choice}-${index}`,
      resourceId: choice,
      quantity: 1,
      rarityTier: getResourceRarityTier(resource),
      source: resource?.creatureId ? 'quarryPool' : 'generic',
      quality: 'messy',
      reason: resource?.creatureId ? 'Quarry pool.' : 'Generic fallback.',
      legacy: true
    };
  }
  return {
    id: `${choice.resourceId}-${index}-${choice.source || 'offer'}-${choice.reason || ''}`,
    quantity: 1,
    rarityTier: getResourceRarityTier(choice.resourceId),
    ...choice
  };
}

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
  const offers = choices.map(normalizeOffer);
  const toggleChoice = offerId => {
    setSelected(current => current.includes(offerId)
      ? current.filter(id => id !== offerId)
      : current.length < chooseCount ? [...current, offerId] : current);
  };
  const selectedResources = () => selected.flatMap(offerId => {
    const offer = offers.find(item => item.id === offerId);
    return offer ? Array.from({ length: offer.quantity || 1 }, () => offer.resourceId) : [];
  });
  const sourceLabel = source => {
    const labels = {
      generic: 'Generic fallback',
      fallback: 'Weak-point fallback',
      quarryPool: 'Quarry pool',
      weakPoint: 'Weak point',
      rareWeakPoint: 'Rare weak point'
    };
    return labels[source] || 'Unknown / Legacy';
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
              {formatValueForDisplay(weakPoint.name)} -{' '}
              {formatValueForDisplay(weakPoint.harvestResult?.quality) || 'Messy'} harvest -{' '}
              {formatHistoryDetail(
                weakPoint.harvestResult?.impactText ||
                weakPoint.harvestResult?.effect ||
                'related part odds improved'
              )}
              {weakPoint.onBreakEffect && (
                <> ({formatEffectForDisplay(weakPoint.onBreakEffect)})</>
              )}
            </p>
          ))}
        </div>
      )}
      {wounds.length > 0 && (
        <p>
          Wounds suffered: {wounds.map(wound =>
            `${formatValueForDisplay(wound.name)} (${formatValueForDisplay(wound.location)}, ${formatValueForDisplay(wound.severity)})`
          ).join(', ')}
        </p>
      )}
      <p>Choose {chooseCount} monster {chooseCount === 1 ? 'part' : 'parts'}.</p>
      <div className="loot-choice-grid">
        {offers.map(offer => {
          const resource = resources[offer.resourceId];
          return (
            <button
              type="button"
              key={offer.id}
              className={selected.includes(offer.id) ? 'selected' : ''}
              onClick={() => toggleChoice(offer.id)}
            >
              <strong>{resource?.name || 'Unknown / Legacy'}{offer.quantity > 1 ? ` x${offer.quantity}` : ''}</strong>
              <span>{getResourceRarityLabel(resource || offer.resourceId)}</span>
              <span>{sourceLabel(offer.source)} - {formatValueForDisplay(offer.quality || 'messy')}</span>
              <span>{formatHistoryDetail(offer.reason || 'No harvest reason recorded.')}</span>
              <span>{formatValueForDisplay(resource?.description)}</span>
            </button>
          );
        })}
      </div>
      <button type="button" disabled={selected.length !== chooseCount} onClick={() => onChoose(selectedResources())}>
        Take Selected Parts ({selected.length}/{chooseCount})
      </button>
    </section>
  );
}
