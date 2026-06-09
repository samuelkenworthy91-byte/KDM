import React from 'react';

// Displays monster information during a fight. Shows HP and the next intent.
export default function MonsterPanel({ monster, intent }) {
  return (
    <div className="combatant-panel monster-panel">
      <h2>{monster.name}</h2>
      <p>Quarry Level: {monster.level || 1}</p>
      <p>HP: {monster.hp} / {monster.maxHp}</p>
      <p>Block: {monster.block}</p>
      {monster.marked > 0 && <p>Marked</p>}
      <p className="intent">Next Intent: {intent?.name || 'Unknown'}</p>
      <p>{intent?.text}</p>
      {!!monster.passiveRules?.length && (
        <div className="monster-passives">
          <strong>Active Passive</strong>
          {monster.passiveRules.map(rule => <p key={rule.id}>{rule.text}</p>)}
        </div>
      )}
    </div>
  );
}
