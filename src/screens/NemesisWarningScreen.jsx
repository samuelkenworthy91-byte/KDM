import React from 'react';
import { formatValueForDisplay } from '../utils/formatters.js';

export default function NemesisWarningScreen({ encounter, lanternYear, onPrepare }) {
  return (
    <section className="placeholder-screen">
      <p className="eyebrow">Timeline Threat</p>
      <h2>Lantern Year {lanternYear}: {formatValueForDisplay(encounter.displayName)} Approaches</h2>
      <p>{formatValueForDisplay(encounter.warningText)}</p>
      <p><strong>At stake:</strong> {formatValueForDisplay(encounter.defeatText)}</p>
      <button type="button" onClick={onPrepare}>Prepare Settlement</button>
    </section>
  );
}
