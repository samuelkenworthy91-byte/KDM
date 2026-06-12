import React from 'react';
import { formatValueForDisplay } from '../utils/formatters.js';

// Simple card component used in combat. Displays the card name and description.
export default function Card({ card, disabled, onPlay, preview }) {
  const breakdown = (preview?.modifierBreakdown || []).join('\n');
  return (
    <button
      type="button"
      className="card"
      disabled={disabled}
      onClick={onPlay}
      title={breakdown || formatValueForDisplay(card.description)}
    >
      <div className="card-cost">{card.unplayable ? '-' : card.cost}</div>
      <h3>{formatValueForDisplay(card.name)}</h3>
      <small className="card-type">{formatValueForDisplay(card.type || 'card')}</small>
      {preview?.effectSummary && (
        <strong className="card-preview">{formatValueForDisplay(preview.effectSummary)}</strong>
      )}
      {preview?.weakPointBreakValue > 0 && (
        <small className="card-preview-detail">
          Progress: {preview.weakPointProgress} / {preview.weakPointBreakValue}
          {preview.weaponMatch ? ` | Weapon: ${preview.weaponMatch}` : ''}
        </small>
      )}
      {preview?.willBreakWeakPoint && (
        <small className="card-preview-detail">
          Will break target. {formatValueForDisplay(preview.breakEffect)}
        </small>
      )}
      {preview?.failedBreakRisk && !preview?.willBreakWeakPoint && (
        <small className="card-preview-detail">
          Will not break. {formatValueForDisplay(preview.failedBreakRisk)}
        </small>
      )}
      {preview?.harvestWarning && (
        <small className="card-preview-detail">
          {formatValueForDisplay(preview.harvestWarning)}
        </small>
      )}
      <p>{formatValueForDisplay(card.description)}</p>
      {preview?.modifierBreakdown?.length > 0 && (
        <small className="card-breakdown-hint">Hover for modifier breakdown</small>
      )}
      {card.weaponType && <small>Type: {card.weaponType}</small>}
      {card.keywords?.length > 0 && <small>Keywords: {card.keywords.join(', ')}</small>}
      {card.source && (
        <small className="card-source">Source: {formatValueForDisplay(card.source)}</small>
      )}
    </button>
  );
}
