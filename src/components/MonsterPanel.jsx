import React from 'react';

// Displays monster information during a fight. Shows HP and the next intent.
export default function MonsterPanel({ monster, intent }) {
  const intentText =
    intent.type === 'attack'
      ? `${intent.name}: Attack for ${intent.damage}`
      : `${intent.name}: Gain ${intent.block} block`;

  return (
    <div className="combatant-panel monster-panel">
      <h2>{monster.name}</h2>
      <p>HP: {monster.hp} / {monster.maxHp}</p>
      <p>Block: {monster.block}</p>
      {(monster.bleed || 0) > 0 && <p>Bleed: {monster.bleed}</p>}
      <p className="intent">Next Intent: {intentText}</p>
    </div>
  );
}
