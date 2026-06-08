import React from 'react';

// Displays survivor stats during a fight.
export default function SurvivorPanel({ survivor }) {
  return (
    <div className="combatant-panel survivor-panel">
      <h2>{survivor.name}</h2>
      <p>HP: {survivor.hp} / {survivor.maxHp}</p>
      <p>Block: {survivor.block}</p>
      <p>Energy: {survivor.energy} / 3</p>
    </div>
  );
}
