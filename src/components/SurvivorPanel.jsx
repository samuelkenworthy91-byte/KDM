import React from 'react';
import { getSurvivorDisplayName } from '../game/survivorIdentity.js';

// Displays survivor stats during a fight.
export default function SurvivorPanel({ survivor }) {
  return (
    <div className="combatant-panel survivor-panel">
      <h2>{getSurvivorDisplayName(survivor)}</h2>
      <p>HP: {survivor.hp} / {survivor.maxHp}</p>
      <p>Block: {survivor.block}</p>
      <p>Strength: {survivor.strength || 0}</p>
      <p>Survival: {survivor.survival || 0} / {survivor.maxSurvival || 3}</p>
      <p>Energy: {survivor.energy} / 3</p>
      <div className="status-effects">
        {survivor.bleed > 0 && <span className="status-tag bleed" title="Bleed: Deals damage at the end of your turn.">Bleed {survivor.bleed}</span>}
        {survivor.poison > 0 && <span className="status-tag poison" title="Poison: Deals damage over time.">Poison {survivor.poison}</span>}
        {survivor.vulnerable > 0 && <span className="status-tag vulnerable" title="Vulnerable: Takes 50% more damage.">Vulnerable {survivor.vulnerable}</span>}
        {survivor.staggered > 0 && <span className="status-tag staggered" title="Staggered: Accuracy/Damage penalty.">Staggered {survivor.staggered}</span>}
        {survivor.guarded > 0 && <span className="status-tag guarded" title="Guarded: Next damage taken is reduced by 2.">Guarded {survivor.guarded}</span>}
      </div>
      {Object.entries(survivor.hitLocations || {})
        .filter(([, wound]) => wound.wounded)
        .map(([location, wound]) => (
          <p key={location}>
            {location}: {wound.severe ? 'serious' : 'light'} wound
          </p>
        ))}
    </div>
  );
}
