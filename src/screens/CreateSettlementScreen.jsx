import React, { useState } from 'react';

export default function CreateSettlementScreen({ slotId, onCreate, onCancel }) {
  const [name, setName] = useState('');
  const [population, setPopulation] = useState(null);
  const [founderDrafts, setFounderDrafts] = useState([]);

  const rollPopulation = () => {
    const rolledPop = 8 + Math.floor(Math.random() * 5);
    setPopulation(rolledPop);
    setFounderDrafts(Array.from({ length: rolledPop }, () => ({
      name: '',
      gender: 'other',
      appearance: ''
    })));
  };

  const isFormValid = name.trim() !== '' &&
    population !== null &&
    founderDrafts.length === population &&
    founderDrafts.every(draft => draft.name.trim() !== '' && draft.gender !== '');

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

      {population !== null && (
        <div className="founders-setup" style={{ marginTop: '1.5rem' }}>
          <h3>Founder Identities</h3>
          <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem', border: '1px solid #302c27', padding: '1rem', background: '#0f0e0d' }}>
            {founderDrafts.map((draft, index) => (
              <div key={index} className="founder-draft" style={{ marginBottom: '1.25rem', borderBottom: index < founderDrafts.length - 1 ? '1px solid #302c27' : 'none', paddingBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#bcae96' }}>Founder {index + 1}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem' }}>
                  <div>
                    <label className="field-label" htmlFor={`founder-name-${index}`} style={{ margin: '0 0 0.2rem', fontSize: '0.9rem' }}>Name *</label>
                    <input
                      id={`founder-name-${index}`}
                      value={draft.name}
                      placeholder={`Founder name`}
                      required
                      onChange={e => {
                        const next = [...founderDrafts];
                        next[index] = { ...next[index], name: e.target.value };
                        setFounderDrafts(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`founder-gender-${index}`} style={{ margin: '0 0 0.2rem', fontSize: '0.9rem' }}>Gender *</label>
                    <select
                      id={`founder-gender-${index}`}
                      value={draft.gender}
                      onChange={e => {
                        const next = [...founderDrafts];
                        next[index] = { ...next[index], gender: e.target.value };
                        setFounderDrafts(next);
                      }}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <label className="field-label" htmlFor={`founder-appearance-${index}`} style={{ margin: '0 0 0.2rem', fontSize: '0.9rem' }}>Appearance (optional)</label>
                  <input
                    id={`founder-appearance-${index}`}
                    value={draft.appearance}
                    placeholder="e.g. Scarred, Quiet"
                    onChange={e => {
                      const next = [...founderDrafts];
                      next[index] = { ...next[index], appearance: e.target.value };
                      setFounderDrafts(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="button-row">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={() => onCreate({ settlementName: name.trim(), population, founderDrafts })}
        >
          Start New Settlement
        </button>
        <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  );
}
