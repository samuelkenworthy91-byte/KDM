import React from 'react';
import { normalizeDefeatedQuarryLevels, quarries } from '../data/quarries.js';

function getProgressSummary(settlement) {
  const entries = Object.entries(normalizeDefeatedQuarryLevels(settlement.defeatedQuarryLevels))
    .map(([quarryId, levels]) => [quarryId, Math.max(0, ...levels)]);
  if (!entries.length) return 'No quarry victories';

  const [quarryId, level] = entries.sort((a, b) => b[1] - a[1])[0];
  return `${quarries[quarryId]?.name || quarryId} Level ${level}`;
}

export default function TitleScreen({ slots, onLoad, onNew, onDelete }) {
  return (
    <section className="title-screen">
      <div className="title-copy">
        <p className="eyebrow">Settlement survival</p>
        <h1>Lantern Deckbuilder</h1>
        <p>A settlement survival deckbuilder</p>
      </div>

      <div className="save-slot-grid">
        {slots.map(({ slotId, settlement }) => (
          <article className="save-slot-card" key={slotId}>
            <p className="eyebrow">Save Slot {slotId}</p>
            {settlement ? (
              <>
                <h2>{settlement.settlementName || 'Unnamed Settlement'}</h2>
                <dl className="slot-details">
                  <div><dt>Population</dt><dd>{settlement.population || 0}</dd></div>
                  <div><dt>Total runs</dt><dd>{settlement.totalRuns || 0}</dd></div>
                  <div><dt>Dead survivors</dt><dd>{settlement.deadSurvivors || 0}</dd></div>
                  <div><dt>Progress</dt><dd>{getProgressSummary(settlement)}</dd></div>
                </dl>
                <div className="button-row">
                  <button type="button" onClick={() => onLoad(slotId)}>Load Settlement</button>
                  <button type="button" className="danger-button" onClick={() => onDelete(slotId)}>
                    Delete Settlement
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Empty</h2>
                <p>No settlement has been founded in this slot.</p>
                <button type="button" onClick={() => onNew(slotId)}>New Settlement</button>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
