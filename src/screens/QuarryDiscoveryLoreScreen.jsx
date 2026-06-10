import React from 'react';
import { innovationCards } from '../data/innovationCards.js';
import { innovations } from '../data/innovations.js';

function effectText(effect) {
  if (effect.type === 'settlementMemory') return `Gain ${effect.amount} settlement Memory.`;
  if (effect.type === 'resource') return `Gain ${effect.amount} ${effect.resourceId}.`;
  if (effect.type === 'resourceOrMemory') return `Gain ${effect.amount} ${effect.resourceId}, or Memory if it cannot be stored.`;
  if (effect.type === 'resourceOrResource') return `Gain ${effect.amount} ${effect.resourceIds.join(' or ')}.`;
  if (effect.type === 'nextHuntModifier') return effect.text;
  if (effect.type === 'rumour') return `New rumour: ${effect.text}`;
  return effect.text || effect.type;
}

export default function QuarryDiscoveryLoreScreen({ event, onContinue }) {
  if (!event) return null;
  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Quarry Discovery</p>
      <h2>{event.title}</h2>
      {event.loreParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <div className="item-card">
        <h3>Settlement Impact</h3>
        {event.settlementEffects.map((effect, index) => <p key={`${effect.type}-${index}`}>{effectText(effect)}</p>)}
        <p><strong>Innovations:</strong> {event.unlocksInnovationIds.map(id => innovationCards[id]?.name || id).join(', ') || 'None'}</p>
        <p><strong>Locations:</strong> {event.unlocksBuildingIds.map(id => innovations[id]?.name || id).join(', ') || 'None'}</p>
        <p><strong>Recipes:</strong> Quarry recipe family unlocked</p>
      </div>
      <button type="button" onClick={onContinue}>Continue</button>
    </section>
  );
}
