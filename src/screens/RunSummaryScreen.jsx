import React from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';

export default function RunSummaryScreen({ summary, onContinue }) {
  const isDeath = summary?.outcome === 'death';

  return (
    <section className="summary-screen">
      <p className="eyebrow">{isDeath ? 'Run Summary' : 'Hunt Complete'}</p>
      <h2>{isDeath ? 'The Hunt Ends in Blood' : 'The Nemesis Has Fallen'}</h2>
      <dl className="summary-list">
        <div>
          <dt>Outcome</dt>
          <dd>{isDeath ? 'Survivor death' : 'Victory'}</dd>
        </div>
        {summary?.recoveredHp > 0 && (
          <div>
            <dt>Between-Hunt Recovery</dt>
            <dd>Recovered {summary.recoveredHp} HP between hunts.</dd>
          </div>
        )}
        {Number.isFinite(summary?.hpBeforeHealing) && (
          <div>
            <dt>Survivor HP</dt>
            <dd>{summary.hpBeforeHealing} before healing / {summary.hpAfterHealing} after</dd>
          </div>
        )}
        {summary?.survivorName && (
          <div>
            <dt>Survivor</dt>
            <dd>{formatValueForDisplay(summary.survivorName)}</dd>
          </div>
        )}
        {summary?.killedBy && (
          <div>
            <dt>Killed By</dt>
            <dd>{formatValueForDisplay(summary.killedBy)}</dd>
          </div>
        )}
        {isDeath && (
          <div>
            <dt>Population</dt>
            <dd>Population -1</dd>
          </div>
        )}
        {Number.isFinite(summary?.populationBefore) && (
          <div>
            <dt>Population Change</dt>
            <dd>{summary.populationBefore} to {summary.populationAfter}</dd>
          </div>
        )}
        {Number.isFinite(summary?.lanternYearBefore) && (
          <div>
            <dt>Lantern Year</dt>
            <dd>{summary.lanternYearBefore} to {summary.lanternYearAfter}</dd>
          </div>
        )}
        {summary?.quarryName && (
          <div>
            <dt>Quarry</dt>
            <dd>{formatValueForDisplay(summary.quarryName)} Level {summary.quarryLevel}</dd>
          </div>
        )}
        <div>
          <dt>Nodes Completed</dt>
          <dd>{summary?.nodesCompleted ?? 0}</dd>
        </div>
        <div>
          <dt>Row Reached</dt>
          <dd>{summary?.rowReached ?? 0}</dd>
        </div>
        <div>
          <dt>Memory Earned</dt>
          <dd>+{summary?.settlementMemoryEarned ?? 0}</dd>
        </div>
        <div>
          <dt>Spoils</dt>
          <dd>{summary?.resources?.length ? formatHistoryDetail(summary.resources) : 'None'}</dd>
        </div>
        <div>
          <dt>Injuries Gained</dt>
          <dd>{formatHistoryDetail(summary?.injuriesGained) || 'None'}</dd>
        </div>
        <div>
          <dt>Scars Gained</dt>
          <dd>{formatHistoryDetail(summary?.scarsGained) || 'None'}</dd>
        </div>
        <div>
          <dt>Disorders Gained</dt>
          <dd>{formatHistoryDetail(summary?.disordersGained) || 'None'}</dd>
        </div>
        {isDeath && (
          <div>
            <dt>Gear Lost</dt>
            <dd>{formatHistoryDetail(summary?.gearLostNames) || 'None'}</dd>
          </div>
        )}
      </dl>
      <div className="condition-summary">
        {(summary?.injuriesGained || []).map(name => (
          <p key={`injury-${name}`}>{summary.survivorName} suffered {name}.</p>
        ))}
        {(summary?.scarsGained || []).map(name => (
          <p key={`scar-${name}`}>{summary.survivorName} gained scar: {name}.</p>
        ))}
        {(summary?.disordersGained || []).map(name => (
          <p key={`disorder-${name}`}>{summary.survivorName} gained disorder: {name}.</p>
        ))}
      </div>
      {summary?.discoveryMessage && (
        <p className="unlock-message">{formatHistoryDetail(summary.discoveryMessage)}</p>
      )}
      <button type="button" onClick={onContinue}>
        {isDeath ? 'Choose Grave Legacy' : 'Return to Settlement'}
      </button>
    </section>
  );
}
