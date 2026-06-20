import React, { useState } from 'react';

export default function CreateSettlementScreen({ slotId, onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [population, setPopulation] = useState(null);

  const rollPopulation = () => {
    setPopulation(8 + Math.floor(Math.random() * 5));
  };

  return (
    <section className="create-settlement-screen">
      <p className="eyebrow">Save Slot {slotId}</p>
      <h2>Create Settlement</h2>
      <label className="field-label" htmlFor="settlement-name">Settlement name</label>
      <input
        id="settlement-name"
        value={name}
        maxLength={40}
        placeholder="Gravewick"
        onChange={event => setName(event.target.value)}
      />

      <div className="population-roll">
        <strong>Population: {population ?? 'Not rolled'}</strong>
        <button type="button" onClick={rollPopulation}>
          {population === null ? 'Roll Population' : 'Roll Again'}
        </button>
      </div>

      <div className="button-row">
        <button
          type="button"
          disabled={!name.trim() || population === null}
          onClick={() => onCreate({ settlementName: name.trim(), population })}
        >
          Start New Settlement
        </button>
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}
