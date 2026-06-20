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
  party,
  adjustedCost,
  spendableEffects = [],
  spendSelections = {},
  onSpendChange,
  playOptions = {}
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
        party,
        playOptions
      })
    }));
  }, [isFlipped, card, monster, survivor, combatState, weakPoints, party, playOptions]);

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };
  const handleSpendChange = (mechanic, value) => {
    if (!onSpendChange) return;
    onSpendChange(mechanic, Number(value) || 0);
  };

  const frontText = formatCardFrontText(card);
  const visibleCost = adjustedCost ?? card.cost;

  return (
    <div className="card-shell">
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of Card */}
        <div
          className={`card card-face card-front ${disabled ? 'disabled' : ''}`}
          onClick={disabled ? undefined : onPlay}
        >
          <div className="card-cost">
            {card.unplayable ? '-' : visibleCost}
            {adjustedCost != null && adjustedCost !== card.cost && (
              <small title="Adjusted cost"> was {card.cost}</small>
            )}
          </div>
          <h3>{formatValueForDisplay(card.name)}</h3>
          <small className="card-type">{formatValueForDisplay(card.type || 'card')}</small>
          
          <div className="card-body">
            <p className="simple-text">{formatValueForDisplay(frontText)}</p>
            {preview?.previewText && <p className="simple-text">Preview: {formatValueForDisplay(preview.previewText)}</p>}
            {!preview?.previewText && preview?.effectSummary && <p className="simple-text">Preview: {formatValueForDisplay(preview.effectSummary)}</p>}
            {preview?.costSummary && <p className="simple-text">Preview: {formatValueForDisplay(preview.costSummary)}</p>}
            {spendableEffects.map(effect => {
              const mechanic = effect.mechanic || effect.namedMechanic;
              const available = Math.max(0, Number(combatState?.namedMechanicCounters?.[mechanic]) || 0);
              return (
                <label
                  key={`${card.id}-${mechanic}-${effect.type}`}
                  className="card-spend-control"
                  onClick={event => event.stopPropagation()}
                >
                  Spend {mechanic}:{' '}
                  <select
                    value={spendSelections[mechanic] ?? 0}
                    onChange={event => handleSpendChange(mechanic, event.target.value)}
                    disabled={disabled || available <= 0}
                  >
                    {Array.from({ length: available + 1 }, (_, amount) => (
                      <option value={amount} key={amount}>{amount}</option>
                    ))}
                  </select>
                </label>
              );
            })}
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
        <div className="card card-face card-back">
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
