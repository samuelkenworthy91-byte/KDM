import React from 'react';

export default function MonsterPanel({ monster, intent, hasMonsterBane }) {
  return (
    <div className="combatant-panel monster-panel">
      <h2>{monster.name}</h2>
      <p>HP: {monster.hp} / {monster.maxHp}</p>
      <p>Block: {monster.block}</p>
      <div className="intent">
        <strong>{hasMonsterBane ? intent.name : 'Creature Tell'}</strong>
        <p>{hasMonsterBane ? intent.revealedText : intent.tellText}</p>
      </div>
      {hasMonsterBane && monster.passiveText && (
        <p className="monster-passive"><strong>Known behaviour:</strong> {monster.passiveText}</p>
      )}
    </div>
  );
}
