import React from 'react';

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
        Paid: 1 settlementMemory and 3 basic resources
        {paidResources?.length ? ` (${paidResources.join(', ')})` : ''}.
      </p>
      {appliedCard ? (
        <article className="item-card built">
          <p className="eyebrow">Applied Effects</p>
          <h3>{appliedCard.name}</h3>
          <p>{appliedCard.description}</p>
          <p className="effect-text">{appliedCard.effects.join(' ')}</p>
          <button type="button" onClick={onContinue}>Return to Settlement</button>
        </article>
      ) : (
        <div className="progress-choice-grid">
          {cards.map(card => (
            <button type="button" key={card.id} onClick={() => onChoose(card.id)}>
              <strong>{card.name}</strong>
              <span>{card.category}</span>
              <span>{card.description}</span>
              <span>{card.effects.join(' ')}</span>
              <span>Choose</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
