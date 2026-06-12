import React from 'react';
import { resources } from '../data/resources.js';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';

function resourceNames(ids = []) {
  return ids.map(id => resources[id]?.name || id);
}

export default function RetreatResultScreen({ result, settlement, onContinue }) {
  const affectedNames = (result.affectedSurvivorIds || []).map(id =>
    settlement.survivors.find(survivor => survivor.id === id)?.name || id
  );
  return (
    <section className="placeholder-screen">
      <p className="eyebrow">Hunt Retreat</p>
      <h2>D20 Roll: {result.roll}</h2>
      <h3>{formatValueForDisplay(result.title)}</h3>
      <p>{formatHistoryDetail(result.lore)}</p>
      <p><strong>Consequence:</strong> {formatHistoryDetail(result.consequenceText)}</p>
      <p>
        <strong>Resources kept:</strong>{' '}
        {resourceNames(result.gatheredResourcesKept).join(', ') || 'None'}
      </p>
      <p>
        <strong>Resources lost:</strong>{' '}
        {resourceNames(result.resourcesLost).join(', ') || 'None'}
      </p>
      {!!affectedNames.length && (
        <p><strong>Affected survivors:</strong> {affectedNames.join(', ')}</p>
      )}
      <button type="button" onClick={onContinue}>Return to Settlement</button>
    </section>
  );
}
