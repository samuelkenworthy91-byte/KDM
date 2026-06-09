import React from 'react';

export default function SettlementDefeatedScreen({ settlement, onReset }) {
  return (
    <section className="summary-screen">
      <p className="eyebrow">Campaign Defeated</p>
      <h2>{settlement.settlementName} Has Gone Dark</h2>
      <dl className="summary-list">
        <div><dt>Total Runs</dt><dd>{settlement.totalRuns}</dd></div>
        <div><dt>Dead Survivors</dt><dd>{settlement.deadSurvivors}</dd></div>
        <div><dt>Victorious Runs</dt><dd>{settlement.victoriousRuns}</dd></div>
      </dl>
      <button type="button" onClick={onReset}>Start New Settlement</button>
    </section>
  );
}
