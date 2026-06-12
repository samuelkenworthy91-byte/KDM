import React from 'react';
import { formatValueForDisplay } from '../utils/formatters.js';
import {
  getIntentTargetRule,
  getTargetingTell
} from '../game/monsterTargeting.js';

function clearerTell(intent) {
  const tags = intent?.tags || [];
  if (tags.some(tag => ['attack', 'heavy', 'precision', 'ambush', 'charge'].includes(tag))) {
    return 'The motion is preparing an attack, but its force and target remain unclear.';
  }
  if (tags.some(tag => ['guard', 'armour', 'shell', 'evasive'].includes(tag))) {
    return 'The creature is gathering itself defensively, though the exact protection is unclear.';
  }
  if (tags.some(tag => ['panic', 'sound', 'blind', 'disruptive', 'time'].includes(tag))) {
    return 'The tell suggests disruption rather than a direct strike.';
  }
  return 'The pattern becomes clearer, but exact consequences remain hidden.';
}

export default function MonsterPanel({
  monster,
  intent,
  hasMonsterBane,
  intentHintLevel = 0,
  likelyTargetNames = []
}) {
  const targetRule = getIntentTargetRule(intent, monster);
  return (
    <div className="combatant-panel monster-panel">
      <h2>{formatValueForDisplay(monster.name)}</h2>
      <p>HP: {monster.hp} / {monster.maxHp}</p>
      <p>Block: {monster.block}</p>
      {monster.level && <p>Quarry Level: {monster.level}</p>}
      {monster.tier && <p>Monster Tier: {monster.tier.charAt(0).toUpperCase() + monster.tier.slice(1)}</p>}
      {monster.passiveTell && (
        <p className="monster-passive">
          <strong>{hasMonsterBane ? 'Known behaviour:' : 'Creature nature:'}</strong>{' '}
          {formatValueForDisplay(hasMonsterBane ? monster.passiveText : monster.passiveTell)}
        </p>
      )}
      <div className="intent">
        <strong>{hasMonsterBane ? formatValueForDisplay(intent.name) : 'Creature Tell'}</strong>
        <p>{formatValueForDisplay(hasMonsterBane ? intent.revealedText : intent.tellText)}</p>
        <p>{formatValueForDisplay(getTargetingTell(targetRule, hasMonsterBane))}</p>
        {likelyTargetNames.length > 0 && (
          <p>
            Likely target{likelyTargetNames.length > 1 ? 's' : ''}:{' '}
            {formatValueForDisplay(likelyTargetNames.join(', '))}
          </p>
        )}
        {!hasMonsterBane && intentHintLevel > 0 && <p>{clearerTell(intent)}</p>}
      </div>
    </div>
  );
}
