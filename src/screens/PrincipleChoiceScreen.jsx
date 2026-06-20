import React, { useState } from 'react';
import {
  campaignPrincipleGroups,
  getCampaignPrincipleOptions
} from '../data/campaignPrinciples.js';

export default function PrincipleChoiceScreen({
  pendingChoice,
  onChoose,
  onCancel
}) {
  const group = pendingChoice?.group;
  const options = getCampaignPrincipleOptions(group);
  const [selectedId, setSelectedId] = useState(options[0]?.id || '');
  const selected = options.find(option => option.id === selectedId);

  if (!pendingChoice || !group) {
    return (
      <section className="placeholder-screen">
        <h2>No Principle Choice Pending</h2>
        <button type="button" onClick={onCancel}>Return to Settlement</button>
      </section>
    );
  }

  return (
    <section className="settlement-screen">
      <div className="settlement-panel">
        <p className="eyebrow">Permanent Campaign Principle</p>
        <h2>{campaignPrincipleGroups[group]?.name || 'Campaign Principle'}</h2>
        <p><strong>Trigger:</strong> {pendingChoice.trigger || campaignPrincipleGroups[group]?.triggerLabel}</p>
        <p className="missing">
          This choice is permanent. Campaign principles are not normal innovations and cannot be changed later.
        </p>
        <div className="item-grid">
          {options.map(option => (
            <article className="item-card" key={option.id}>
              <label>
                <input
                  type="radio"
                  name="campaign-principle"
                  value={option.id}
                  checked={selectedId === option.id}
                  onChange={() => setSelectedId(option.id)}
                />{' '}
                <strong>{option.name}</strong>
              </label>
              <p>{option.playerSummary}</p>
              <p><strong>Effect:</strong> {option.mechanicalSummary}</p>
            </article>
          ))}
        </div>
        <div className="button-row">
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onChoose(group, selected.id)}
          >
            Confirm {selected?.name || 'Principle'}
          </button>
          {onCancel && (
            <button type="button" className="secondary-button" onClick={onCancel}>
              Return
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
