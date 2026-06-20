import React, { useState } from 'react';
import { getActiveSurvivorPassives } from '../game/passiveRegistry.js';
import { getSurvivorDisplayName } from '../game/survivorIdentity.js';
import { groupPassivesForPanel } from './survivorPanelPassives.js';

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

function PassiveList({ groups }) {
  if (!groups.length) return <p className="passive-empty">No active passives.</p>;
  return (
    <div className="hunter-passive-groups">
      {groups.map(group => (
        <section className="hunter-passive-group" key={group.label}>
          <h3>{group.label}</h3>
          <ul>
            {group.items.map(passive => (
              <li key={`${group.label}-${passive.id}`}>
                <strong>{passive.name}</strong>
                <span>{passive.timing}{passive.active === false ? ' - inactive' : ''}</span>
                {passive.text && <p>{passive.text}</p>}
                {passive.reason && <small>{passive.reason}</small>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// Displays survivor stats during a fight.
export default function SurvivorPanel({
  survivor,
  passiveContext = {},
  defaultFlipped = false
}) {
  const [flipped, setFlipped] = useState(defaultFlipped);
  const passiveSurvivor = {
    ...(passiveContext.survivor || {}),
    ...survivor
  };
  const passiveGroupsForSurvivor = groupPassivesForPanel(getActiveSurvivorPassives({
    survivor: passiveSurvivor,
    settlement: passiveContext.settlement,
    combatState: passiveContext.combatState,
    huntState: passiveContext.huntState,
    equippedGear: passiveContext.equippedGear,
    currentQuarryId: passiveContext.currentQuarryId
  }));

  return (
    <div className={`combatant-panel survivor-panel ${flipped ? 'is-flipped' : ''}`}>
      <div className="hunter-panel-header">
        <h2>{getSurvivorDisplayName(survivor)}</h2>
        <button
          type="button"
          className="panel-flip-button"
          aria-pressed={flipped}
          onClick={() => setFlipped(value => !value)}
        >
          {flipped ? 'Stats' : 'Passives'}
        </button>
      </div>
      {flipped ? (
        <div className="hunter-panel-back" aria-label={`${getSurvivorDisplayName(survivor)} active passives`}>
          <h3>Active Passives</h3>
          <PassiveList groups={passiveGroupsForSurvivor} />
        </div>
      ) : (
        <div className="hunter-panel-front">
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
      )}
    </div>
  );
}
