import React from 'react';
import InventoryPanel from '../components/InventoryPanel.jsx';
import { resources } from '../data/resources.js';

export default function LootRewardScreen({ choices, inventory, isBoss, onChoose }) {
  return (
    <section className="reward-screen">
      <p className="eyebrow">{isBoss ? 'Nemesis Spoils' : 'Monster Parts'}</p>
      <h2>Choose One Trophy</h2>
      <InventoryPanel inventory={inventory} />
      <div className="reward-grid">
        {choices.map(resourceId => {
          const resource = resources[resourceId];
          return (
            <button
              key={resourceId}
              type="button"
              className="reward-card"
              onClick={() => onChoose(resourceId)}
            >
              <strong>{resource?.name || resourceId}</strong>
              <span>{resource?.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
