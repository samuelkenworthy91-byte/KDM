import React, { useState } from 'react';
import InventoryPanel from '../components/InventoryPanel.jsx';
import { resources } from '../data/resources.js';

export default function ResourceScreen({ choices, inventory, onChoose, onContinue }) {
  const [selected, setSelected] = useState(null);

  const choose = offer => {
    onChoose(offer);
    setSelected(offer);
  };

  return (
    <section className="event-screen resource-screen">
      <p className="eyebrow">Scavenged Remains</p>
      <h2>Choose What You Carry</h2>
      <InventoryPanel inventory={inventory} />

      {!selected ? (
        <div className="event-choice-grid">
          {choices.map((offer, index) => {
            const resource = resources[offer.resourceId];
            return (
              <button
                key={`${offer.resourceId}-${index}`}
                type="button"
                className="event-choice"
                onClick={() => choose(offer)}
              >
                <strong>{resource.name}</strong>
                <span>{resource.description}</span>
                {offer.hpCost > 0 && <em>Costs {offer.hpCost} HP</em>}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="event-outcome" role="status">
          <p>You take <strong>{resources[selected.resourceId].name}</strong>.</p>
          <button type="button" onClick={onContinue}>Continue</button>
        </div>
      )}
    </section>
  );
}
