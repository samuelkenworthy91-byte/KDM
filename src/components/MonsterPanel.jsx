import React from 'react';

export default function MonsterPanel({ monster, intent, hasMonsterBane }) {
  return (
    <div className="combatant-panel monster-panel">
      <h2>{monster.name}</h2>
      <p>HP: {monster.hp} / {monster.maxHp}</p>
      <p>Block: {monster.block}</p>
      {monster.level && <p>Quarry Level: {monster.level}</p>}
      {monster.passiveTell && (
        <p className="monster-passive">
          <strong>{hasMonsterBane ? 'Known behaviour:' : 'Creature nature:'}</strong>{' '}
          {hasMonsterBane ? monster.passiveText : monster.passiveTell}
        </p>
      )}
      <div className="intent">
        <strong>{hasMonsterBane ? intent.name : 'Creature Tell'}</strong>
        <p>{hasMonsterBane ? intent.revealedText : intent.tellText}</p>
      </div>
    </div>
  );
}
