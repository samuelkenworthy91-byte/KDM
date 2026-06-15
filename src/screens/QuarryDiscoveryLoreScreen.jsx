import React from 'react';
import QuarryPortrait from '../components/QuarryPortrait.jsx';
import { innovationCards } from '../data/innovationCards.js';
import { innovations } from '../data/innovations.js';
import { quarries } from '../data/quarries.js';
import { formatEffectForDisplay, formatValueForDisplay } from '../utils/formatters.js';

export default function QuarryDiscoveryLoreScreen({ event, onContinue }) {
  if (!event) return null;
  const quarry = quarries[event.quarryId];
  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Quarry Discovery</p>
      <h2>{event.title}</h2>
      <QuarryPortrait quarry={quarry} size="lore" />
      {event.loreParagraphs.map((paragraph, index) => (
        <p key={`lore-${index}`}>{formatValueForDisplay(paragraph)}</p>
      ))}
      <div className="item-card">
        <h3>Settlement Impact</h3>
        {event.settlementEffects.map((effect, index) => (
          <p key={`${effect.type}-${index}`}>{formatEffectForDisplay(effect)}</p>
        ))}
        <p><strong>Innovations:</strong> {event.unlocksInnovationIds.map(id => innovationCards[id]?.name || id).join(', ') || 'None'}</p>
        <p><strong>Locations:</strong> {event.unlocksBuildingIds.map(id => innovations[id]?.name || id).join(', ') || 'None'}</p>
        <p><strong>Recipes:</strong> Quarry recipe family unlocked</p>
      </div>
      <button type="button" onClick={onContinue}>Continue</button>
    </section>
  );
}
