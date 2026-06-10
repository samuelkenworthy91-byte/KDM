import React from 'react';

export default function NemesisWarningScreen({ encounter, lanternYear, onPrepare }) {
  return (
    <section className="placeholder-screen">
      <p className="eyebrow">Timeline Threat</p>
      <h2>Lantern Year {lanternYear}: {encounter.displayName} Approaches</h2>
      <p>{encounter.warningText}</p>
      <p><strong>At stake:</strong> {encounter.defeatText}</p>
      <button type="button" onClick={onPrepare}>Prepare Settlement</button>
    </section>
  );
}
