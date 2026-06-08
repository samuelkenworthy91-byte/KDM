import React from 'react';

export default function RunSummaryScreen({ summary, onReturn }) {
  return (
    <section className={`run-summary ${summary.result.toLowerCase()}`}>
      <p className="eyebrow">Run Summary</p>
      <h2>{summary.result}</h2>
      <div className="summary-stats">
        <p><span>Settlement Memory Gained</span><strong>+{summary.memoryGained}</strong></p>
        <p><span>Total Settlement Memory</span><strong>{summary.totalMemory}</strong></p>
        <p><span>Nodes Completed</span><strong>{summary.nodesCompleted}</strong></p>
        <p><span>Elites Defeated</span><strong>{summary.elitesDefeated}</strong></p>
      </div>
      <button type="button" onClick={onReturn}>
        Return to Settlement
      </button>
    </section>
  );
}
