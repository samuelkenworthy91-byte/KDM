import React from 'react';

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
        {summary?.survivorName && (
          <div>
            <dt>Survivor</dt>
            <dd>{summary.survivorName}</dd>
          </div>
        )}
        {summary?.killedBy && (
          <div>
            <dt>Killed By</dt>
            <dd>{summary.killedBy}</dd>
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
          <dt>settlementMemory Earned</dt>
          <dd>+{summary?.settlementMemoryEarned ?? 0}</dd>
        </div>
        <div>
          <dt>Spoils</dt>
          <dd>{summary?.resources?.length ? summary.resources.join(', ') : 'None'}</dd>
        </div>
      </dl>
      <button type="button" onClick={onContinue}>
        {isDeath ? 'Choose Grave Legacy' : 'Return to Settlement'}
      </button>
    </section>
  );
}
