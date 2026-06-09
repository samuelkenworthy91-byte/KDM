import React from 'react';
import { getAvailableQuarryLevel, quarries, quarryList } from '../data/quarries.js';

export default function QuarrySelectionScreen({
  settlement,
  selectedQuarry,
  selectedLevel,
  onSelectQuarry,
  onSelectLevel,
  onStart,
  onBack
}) {
  const available = quarryList.filter(quarry =>
    settlement.discoveredQuarries.includes(quarry.id)
  );

  return (
    <section className="settlement-hub">
      <p className="eyebrow">Quarry Selection</p>
      <h2>Choose The Hunt</h2>
      <div className="quarry-list">
        {available.map(quarry => (
          <button
            type="button"
            key={quarry.id}
            className={selectedQuarry === quarry.id ? 'selected' : ''}
            onClick={() => onSelectQuarry(quarry.id)}
          >
            <strong>{quarry.name}</strong>
            <span>{quarry.description}</span>
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="hunt-quarry-level">Quarry level</label>
      <select id="hunt-quarry-level" value={selectedLevel} onChange={event => onSelectLevel(Number(event.target.value))}>
        {Array.from({ length: getAvailableQuarryLevel(selectedQuarry, settlement) }, (_, index) => index + 1)
          .map(level => <option value={level} key={level}>Level {level}</option>)}
      </select>
      <div className="button-row">
        <button type="button" onClick={onStart}>Start Hunt</button>
        <button type="button" className="secondary-button" onClick={onBack}>Back to Loadout</button>
      </div>
    </section>
  );
}
