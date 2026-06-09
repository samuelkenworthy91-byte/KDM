import React from 'react';
import { resources } from '../data/resources.js';

export default function RunSummaryScreen({ summary, onContinue }) {
  const isDeath = summary?.outcome === 'death';
  const resourceEntries = Object.entries(summary?.resources || {})
    .filter(([, amount]) => amount > 0);

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
        {summary?.quarryName && (
          <div>
            <dt>Quarry</dt>
            <dd>{summary.quarryName} Level {summary.quarryLevel}</dd>
          </div>
        )}
        {isDeath && (
          <div>
            <dt>Population</dt>
            <dd>Population -1</dd>
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
          <dt>Elites Defeated</dt>
          <dd>{summary?.elitesDefeated ?? 0}</dd>
        </div>
        <div>
          <dt>Resources Collected This Run</dt>
          <dd>
            {resourceEntries.length
              ? resourceEntries
                  .map(([id, amount]) => `${resources[id]?.name || id} x${amount}`)
                  .join(', ')
              : 'None'}
          </dd>
        </div>
        <div>
          <dt>Resources Returned To Settlement</dt>
          <dd>{resourceEntries.length ? 'All gathered resources transferred' : 'None'}</dd>
        </div>
      </dl>
      {!!summary?.unlockMessages?.length && (
        <div className="unlock-messages">
          {summary.unlockMessages.map(message => <p key={message}>{message}</p>)}
        </div>
      )}
      <button type="button" onClick={onContinue}>
        {isDeath ? 'Choose Grave Legacy' : 'Return to Settlement'}
      </button>
    </section>
  );
}
