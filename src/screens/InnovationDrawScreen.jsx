import React from 'react';
import { resources } from '../data/resources.js';
import { getInnovationPlayerFields } from '../game/innovationPresentation.js';
import { formatValueForDisplay } from '../utils/formatters.js';

function formatPaidResource(resourceId) {
  return resources[resourceId]?.name || resourceId || 'None';
}

function MemoryPayment({ paidResources }) {
  const original = paidResources?.originalMemoryCost ?? paidResources?.memory ?? 1;
  const discount = paidResources?.workTogetherDiscount ?? 0;
  const final = paidResources?.finalMemoryCost ?? Math.max(0, original - discount);
  return (
    <>
      <p>Memory original cost: {original}</p>
      <p>Work Together discount: -{discount}</p>
      <p>Memory final cost: {final}</p>
    </>
  );
}

function InnovationSummary({ card }) {
  const fields = getInnovationPlayerFields(card);
  return (
    <>
      <span><strong>Type:</strong> {fields.type}</span>
      <span><strong>Effect:</strong> {fields.effect}</span>
      <span><strong>Where to use:</strong> {fields.where}</span>
      <span><strong>Cost/limit:</strong> {fields.costLimit}</span>
      <span><strong>Work Together eligible:</strong> {fields.workTogetherEligible}</span>
      {fields.flavor && <span><strong>Flavour:</strong> {formatValueForDisplay(fields.flavor)}</span>}
    </>
  );
}

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
      <div className="item-card">
        <h3>Paid Resources</h3>
        <MemoryPayment paidResources={paidResources} />
        <p>Hide: {formatValueForDisplay(formatPaidResource(paidResources?.hide))}</p>
        <p>Organ: {formatValueForDisplay(formatPaidResource(paidResources?.organ))}</p>
        <p>Bone: {formatValueForDisplay(formatPaidResource(paidResources?.bone))}</p>
      </div>
      {appliedCard ? (
        <article className="item-card built">
          <p className="eyebrow">Innovation Acquired | Tier {appliedCard.tier}</p>
          <h3>{appliedCard.name}</h3>
          <InnovationSummary card={appliedCard} />
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
              <InnovationSummary card={card} />
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
