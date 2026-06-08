import React from 'react';
import InventoryPanel from '../components/InventoryPanel.jsx';

export default function RewardScreen({
  eyebrow,
  title,
  text,
  choices,
  inventory,
  onChoose
}) {
  return (
    <section className="reward-screen">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
      <InventoryPanel inventory={inventory} compact />
      <div className="reward-grid" aria-label="Resource rewards">
        {choices.map(resource => (
          <button
            key={resource.id}
            type="button"
            className={`reward-card ${resource.type}`}
            onClick={() => onChoose(resource.id)}
          >
            <span className="reward-type">{resource.type}</span>
            <h3>{resource.name}</h3>
            <p>{resource.description}</p>
            <strong>Take 1</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
