import React, { useState } from 'react';

const createFounderDrafts = count =>
  Array.from({ length: count }, () => ({
    name: '',
    gender: 'other',
    appearance: ''
  }));

export default function CreateSettlementScreen({ slotId, onCreate, onCancel }) {
  const [settlementName, setSettlementName] = useState('');
  const [population, setPopulation] = useState(null);
  const [founderDrafts, setFounderDrafts] = useState([]);

  const rollPopulation = () => {
    const rolledPopulation = 8 + Math.floor(Math.random() * 5);
    setPopulation(rolledPopulation);
    setFounderDrafts(createFounderDrafts(rolledPopulation));
  };

  const updateFounderDraft = (index, field, value) => {
    setFounderDrafts(drafts =>
      drafts.map((draft, draftIndex) =>
        draftIndex === index ? { ...draft, [field]: value } : draft
      )
    );
  };

  const canStart =
    settlementName.trim().length > 0 &&
    population > 0 &&
    founderDrafts.length === population &&
    founderDrafts.every(draft => draft.name.trim().length > 0 && draft.gender);

  return (
    <section className="create-settlement-screen">
      <p className="eyebrow">Save Slot {slotId}</p>
      <h2>Create Settlement</h2>
      <label className="field-label" htmlFor="settlement-name">Settlement name</label>
      <input
        id="settlement-name"
        value={settlementName}
        maxLength={40}
        placeholder="Gravewick"
        onChange={event => setSettlementName(event.target.value)}
      />

      <div className="population-roll">
        <strong>Population: {population ?? 'Not rolled'}</strong>
        <button type="button" onClick={rollPopulation}>
          {population === null ? 'Roll Population' : 'Roll Again'}
        </button>
      </div>

      {population > 0 && (
        <div className="settlement-panel">
          <h3>Founder Identities</h3>
          {founderDrafts.map((draft, index) => (
            <section className="item-card" key={`founder-${index}`}>
              <h4>Founder {index + 1}</h4>
              <label className="field-label">
                Name
                <input
                  value={draft.name}
                  placeholder={`Founder ${index + 1}`}
                  onChange={event => updateFounderDraft(index, 'name', event.target.value)}
                  required
                />
              </label>
              <label className="field-label">
                Gender
                <select
                  value={draft.gender}
                  onChange={event => updateFounderDraft(index, 'gender', event.target.value)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="field-label">
                Appearance / description
                <input
                  value={draft.appearance}
                  placeholder="Optional"
                  onChange={event => updateFounderDraft(index, 'appearance', event.target.value)}
                />
              </label>
            </section>
          ))}
        </div>
      )}

      <div className="button-row">
        <button
          type="button"
          disabled={!canStart}
          onClick={() => onCreate({
            settlementName: settlementName.trim(),
            population,
            founderDrafts: founderDrafts.map(draft => ({
              name: draft.name.trim(),
              gender: draft.gender || 'other',
              appearance: draft.appearance?.trim() || ''
            }))
          })}
        >
          Start New Settlement
        </button>
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}
