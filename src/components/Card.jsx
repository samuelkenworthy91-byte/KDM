import React, { useState, useMemo } from 'react';
import { formatValueForDisplay, formatCardFrontText } from '../utils/formatters.js';
import { getCardPreview } from '../utils/cardPreview.js';

// Card component used in combat. Supports flipping between simple text and tactical preview.
export default function Card({
  card,
  disabled,
  onPlay,
  preview,
  monster,
  survivor,
  combatState,
  party
}) {
  const [isFlipped, setIsFlipped] = useState(false);

  const weakPoints = useMemo(() => {
    if (!monster?.weakPoints) return [];
    return monster.weakPoints.filter(wp => !wp.broken);
  }, [monster]);

  const allPreviews = useMemo(() => {
    if (!isFlipped || !monster || !survivor || !combatState || weakPoints.length === 0) {
      return [];
    }
    return weakPoints.map(wp => ({
      weakPoint: wp,
      preview: getCardPreview({
        card,
        survivor,
        combatState,
        monster,
        selectedWeakPoint: wp,
        party
      })
    }));
  }, [isFlipped, card, monster, survivor, combatState, weakPoints, party]);

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const frontText = formatCardFrontText(card);

  return (
    <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
      <div className="card-inner">
        {/* Front of Card */}
        <div
          className={`card card-front ${disabled ? 'disabled' : ''}`}
          onClick={disabled ? undefined : onPlay}
        >
          <div className="card-cost">{card.unplayable ? '-' : card.cost}</div>
          <h3>{formatValueForDisplay(card.name)}</h3>
          <small className="card-type">{formatValueForDisplay(card.type || 'card')}</small>
          
          <div className="card-body">
            <p className="simple-text">{formatValueForDisplay(frontText)}</p>
          </div>

          <div className="card-footer">
            {card.weaponType && <small>Type: {card.weaponType}</small>}
            {card.keywords?.length > 0 && <small>Keywords: {card.keywords.join(', ')}</small>}
          </div>

          {(monster || preview) && (
            <button
              type="button"
              className="flip-button"
              onClick={handleFlip}
            >
              Preview
            </button>
          )}
        </div>

        {/* Back of Card */}
        <div className="card card-back">
          <div className="card-back-header">
            <h3>Tactical Preview</h3>
            <button
              type="button"
              className="flip-button back"
              onClick={handleFlip}
            >
              Back
            </button>
          </div>
          
          <div className="card-back-content">
            {weakPoints.length === 0 ? (
              <p className="no-previews">
                No weak points available.<br />
                This card will only apply its normal effect.
              </p>
            ) : (
              <div className="preview-list">
                {allPreviews.map(({ weakPoint, preview: wpPreview }, idx) => (
                  <div key={weakPoint.id || idx} className="preview-row">
                    <div className="preview-wp-name">{formatValueForDisplay(weakPoint.name)}</div>
                    <div className="preview-stats">
                      Damage: {wpPreview.monsterHpDamage} | Break: {wpPreview.weakPointBreakDamage}
                    </div>
                    <div className={`preview-result ${wpPreview.willBreakWeakPoint ? 'breaks' : 'fails'}`}>
                      {wpPreview.willBreakWeakPoint ? 'Breaks it' : 'Does not break'}
                      {wpPreview.overkill > 0 && ` (Overkill by ${wpPreview.overkill})`}
                    </div>
                    {wpPreview.willBreakWeakPoint && wpPreview.breakEffect && (
                      <div className="preview-effect">Broken: {formatValueForDisplay(wpPreview.breakEffect)}</div>
                    )}
                    {wpPreview.harvestLikelyQuality && (
                      <div className="preview-harvest">Likely: {formatValueForDisplay(wpPreview.harvestLikelyQuality)}</div>
                    )}
                    {!wpPreview.willBreakWeakPoint && wpPreview.failedBreakRisk && wpPreview.failedBreakRisk !== 'none' && (
                      <div className="preview-risk">Risk: {formatValueForDisplay(wpPreview.failedBreakRisk)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
