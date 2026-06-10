import React from 'react';

// Simple card component used in combat. Displays the card name and description.
export default function Card({ card, disabled, onPlay }) {
  return (
    <button
      type="button"
      className="card"
      disabled={disabled}
      onClick={onPlay}
    >
      <div className="card-cost">{card.unplayable ? '-' : card.cost}</div>
      <h3>{card.name}</h3>
      <p>{card.description}</p>
      {card.weaponType && <small>Type: {card.weaponType}</small>}
      {card.keywords?.length > 0 && <small>Keywords: {card.keywords.join(', ')}</small>}
      {card.source && <small className="card-source">Source: {card.source}</small>}
    </button>
  );
}
