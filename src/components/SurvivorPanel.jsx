import React from 'react';

// Displays survivor stats during a fight.
export default function SurvivorPanel({ survivor }) {
  return (
    <div className="combatant-panel survivor-panel">
      <h2>{survivor.name}</h2>
      <p>HP: {survivor.hp} / {survivor.maxHp}</p>
      <p>Block: {survivor.block}</p>
      <p>Strength: {survivor.strength || 0}</p>
      <p>Survival: {survivor.survival || 0} / {survivor.maxSurvival || 3}</p>
      <p>Energy: {survivor.energy} / 3</p>
      {survivor.bleed > 0 && <p>Bleed: {survivor.bleed}</p>}
      {survivor.marked > 0 && <p>Marked</p>}
    </div>
  );
}
