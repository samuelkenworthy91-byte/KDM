import React from 'react';
import { formatValueForDisplay } from '../utils/formatters.js';
import {
  getIntentTargetRule,
  getTargetingTell
} from '../game/monsterTargeting.js';

const statusText = {
  bleed: value => `Bleed ${value}: true HP damage at end of turn; ignores block; then -1.`,
  burn: value => `Burn ${value}: damages block first, strips Guarded, then HP; then -1.`,
  poison: value => `Poison ${value}: ignores half block and halves healing; then -1.`,
  doom: value => `Doom ${value}: countdown; at 0, 10 true damage.`,
  vulnerable: value => `Vulnerable ${value}: next incoming hit +50% damage.`,
  staggered: value => `Staggered ${value}: next incoming hit deals double damage.`,
  guarded: value => `Guarded ${value}: next incoming hit -2 damage.`,
  snared: value => `Snared ${value}: next outgoing hit -5 damage and retarget/evade restricted.`,
  shock: value => `Shock ${value}: disrupts next card/intent.`,
  blind: value => `Blind ${value}: next attack -3 damage / glancing blow.`,
  marked: () => 'Marked: combo and targeting setup.',
  exposed: value => `Exposed ${value}: one closed weak point can be targeted as open.`
};

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
      <div className="status-effects">
        {monster.bleed > 0 && <span className="status-tag bleed" title={statusText.bleed(monster.bleed)}>Bleed {monster.bleed}</span>}
        {monster.burn > 0 && <span className="status-tag burn" title={statusText.burn(monster.burn)}>Burn {monster.burn}</span>}
        {monster.poison > 0 && <span className="status-tag poison" title={statusText.poison(monster.poison)}>Poison {monster.poison}</span>}
        {monster.doom > 0 && <span className="status-tag doom" title={statusText.doom(monster.doom)}>Doom {monster.doom}</span>}
        {monster.vulnerable > 0 && <span className="status-tag vulnerable" title={statusText.vulnerable(monster.vulnerable)}>Vulnerable {monster.vulnerable}</span>}
        {monster.staggered > 0 && <span className="status-tag staggered" title={statusText.staggered(monster.staggered)}>Staggered {monster.staggered}</span>}
        {monster.guarded > 0 && <span className="status-tag guarded" title={statusText.guarded(monster.guarded)}>Guarded {monster.guarded}</span>}
        {monster.snared > 0 && <span className="status-tag snared" title={statusText.snared(monster.snared)}>Snared {monster.snared}</span>}
        {monster.shock > 0 && <span className="status-tag shock" title={statusText.shock(monster.shock)}>Shock {monster.shock}</span>}
        {monster.blind > 0 && <span className="status-tag blind" title={statusText.blind(monster.blind)}>Blind {monster.blind}</span>}
        {monster.marked && <span className="status-tag marked" title={statusText.marked()}>Marked {Number.isFinite(Number(monster.marked)) ? monster.marked : ''}</span>}
        {monster.exposed > 0 && <span className="status-tag exposed" title={statusText.exposed(monster.exposed)}>Exposed {monster.exposed}</span>}
      </div>
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
