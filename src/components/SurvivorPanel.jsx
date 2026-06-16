import React from 'react';
import { getSurvivorDisplayName } from '../game/survivorIdentity.js';

const statusText = {
  bleed: value => `Bleed ${value}: true HP damage at end of turn; ignores block; then -1.`,
  burn: value => `Burn ${value}: damages block first, strips Guarded, then HP; then -1.`,
  poison: value => `Poison ${value}: ignores half block and halves healing; then -1.`,
  doom: value => `Doom ${value}: countdown; at 0, 10 true damage.`,
  vulnerable: value => `Vulnerable ${value}: next incoming hit +50% damage.`,
  staggered: value => `Staggered ${value}: next incoming hit deals double damage.`,
  guarded: value => `Guarded ${value}: next incoming hit -2 damage.`,
  snared: value => `Snared ${value}: next outgoing hit -5 damage and retarget/evade restricted.`,
  shock: value => `Shock ${value}: next card costs +1 energy.`,
  blind: value => `Blind ${value}: next attack -3 damage / glancing blow.`,
  prepared: value => `Prepared ${value}: improves next card.`,
  salvage: value => `Salvage ${value}: adds post-combat reward value.`,
  testBonus: value => `Test Bonus ${value}: improves relevant tests.`,
  consequenceReduction: value => `Consequence Reduction ${value}: softens failed risks/events.`,
  marked: value => `Marked ${value}: combo and targeting setup.`
};

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
        {survivor.bleed > 0 && <span className="status-tag bleed" title={statusText.bleed(survivor.bleed)}>Bleed {survivor.bleed}</span>}
        {survivor.burn > 0 && <span className="status-tag burn" title={statusText.burn(survivor.burn)}>Burn {survivor.burn}</span>}
        {survivor.poison > 0 && <span className="status-tag poison" title={statusText.poison(survivor.poison)}>Poison {survivor.poison}</span>}
        {survivor.doom > 0 && <span className="status-tag doom" title={statusText.doom(survivor.doom)}>Doom {survivor.doom}</span>}
        {survivor.vulnerable > 0 && <span className="status-tag vulnerable" title={statusText.vulnerable(survivor.vulnerable)}>Vulnerable {survivor.vulnerable}</span>}
        {survivor.staggered > 0 && <span className="status-tag staggered" title={statusText.staggered(survivor.staggered)}>Staggered {survivor.staggered}</span>}
        {survivor.guarded > 0 && <span className="status-tag guarded" title={statusText.guarded(survivor.guarded)}>Guarded {survivor.guarded}</span>}
        {survivor.snared > 0 && <span className="status-tag snared" title={statusText.snared(survivor.snared)}>Snared {survivor.snared}</span>}
        {survivor.shock > 0 && <span className="status-tag shock" title={statusText.shock(survivor.shock)}>Shock {survivor.shock}</span>}
        {survivor.blind > 0 && <span className="status-tag blind" title={statusText.blind(survivor.blind)}>Blind {survivor.blind}</span>}
        {survivor.prepared > 0 && <span className="status-tag prepared" title={statusText.prepared(survivor.prepared)}>Prepared {survivor.prepared}</span>}
        {survivor.salvage > 0 && <span className="status-tag salvage" title={statusText.salvage(survivor.salvage)}>Salvage {survivor.salvage}</span>}
        {survivor.testBonus > 0 && <span className="status-tag testBonus" title={statusText.testBonus(survivor.testBonus)}>Test Bonus {survivor.testBonus}</span>}
        {survivor.consequenceReduction > 0 && <span className="status-tag consequenceReduction" title={statusText.consequenceReduction(survivor.consequenceReduction)}>Consequence Reduction {survivor.consequenceReduction}</span>}
        {survivor.marked > 0 && <span className="status-tag marked" title={statusText.marked(survivor.marked)}>Marked {survivor.marked}</span>}
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
