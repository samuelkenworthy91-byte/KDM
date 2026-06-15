import React from 'react';
import { formatEffectsForDisplay, formatValueForDisplay } from '../utils/formatters.js';

export default function InnovationDrawScreen({
  cards,
  paidResources,
  appliedCard,
  onChoose,
  onContinue
}) {
  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Innovation Attempt</p>
      <h2>The Settlement Attempts To Innovate</h2>
      <p>
        Paid: 1 Memory and 3 basic resources
        {paidResources?.length ? ` (${formatValueForDisplay(paidResources)})` : ''}.
      </p>
      {appliedCard ? (
        <article className="item-card built">
          <p className="eyebrow">Innovation Acquired | Tier {appliedCard.tier}</p>
          <h3>{appliedCard.name}</h3>
          <p>{formatValueForDisplay(appliedCard.description)}</p>
          <p className="effect-text">{appliedCard.settlementBoostSummary}</p>
          <p><strong>Use at:</strong> {appliedCard.uiDestination}</p>
          <section className="innovation-tutorial">
            <h4>{appliedCard.tutorialTitle}</h4>
            <ol>
              {appliedCard.tutorialSteps.map(step => <li key={step}>{step}</li>)}
            </ol>
          </section>
          <button type="button" onClick={onContinue}>Return to Settlement</button>
        </article>
      ) : (
        <div className="progress-choice-grid">
          {cards.map(card => (
            <button type="button" key={card.id} onClick={() => onChoose(card.id)}>
              <strong>{card.name}</strong>
              <span>Tier {card.tier} | {card.category}</span>
              <span>{formatValueForDisplay(card.description)}</span>
              <span>{card.settlementBoostSummary || formatEffectsForDisplay(card.effects)}</span>
              <span>Use at: {card.uiDestination}</span>
              {(card.unlocksBuildings?.length > 0 || card.unlocksRecipes?.length > 0) && (
                <span className="unlock-hint">
                  Unlocks: {[...(card.unlocksBuildings || []), ...(card.unlocksRecipes || [])].join(', ')}
                </span>
              )}
              <span>Choose</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
