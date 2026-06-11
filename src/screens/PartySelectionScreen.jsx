import React from 'react';
import { disorders } from '../data/disorders.js';
import { equipment } from '../data/equipment.js';
import { fightingArts, getSurvivorMonsterBaneId } from '../data/fightingArts.js';
import { injuries } from '../data/injuries.js';
import { buildRunDeck } from '../game/deckLogic.js';

export default function PartySelectionScreen({
  settlement,
  selectedIds,
  quarryId,
  onToggle,
  onContinue,
  onBack
}) {
  const living = settlement.survivors.filter(survivor => survivor.alive !== false);
  const matchingBane = selectedIds.some(id =>
    living.find(survivor => survivor.id === id)?.fightingArts?.includes(`monsterBane_${quarryId}`)
  );

  return (
    <section className="settlement-hub">
      <p className="eyebrow">Hunting Party</p>
      <h2>Choose Party</h2>
      <p>Select 1 to {settlement.maxHuntPartySize} living survivors.</p>
      <div className="quarry-list">
        {living.map(survivor => {
          const selected = selectedIds.includes(survivor.id);
          const gear = (survivor.boundGear || []).map(item => equipment[item.equipmentId]).filter(Boolean);
          const baneId = getSurvivorMonsterBaneId(survivor);
          const deckSize = buildRunDeck({ survivor, equippedGear: gear }).length;
          const unavailable = (survivor.unavailableHunts || 0) > 0;
          const disabled = unavailable || (!selected && selectedIds.length >= settlement.maxHuntPartySize);
          return (
            <button
              type="button"
              key={survivor.id}
              className={selected ? 'selected' : ''}
              disabled={disabled}
              onClick={() => onToggle(survivor.id)}
            >
              <strong>{survivor.name}</strong>
              <span>HP {survivor.hp}/{survivor.maxHp} | Survival {survivor.survival || 0}</span>
              <span>Personal deck: {deckSize} cards | Bound gear: {gear.length}</span>
              <span>
                Weapon proficiency: {Object.entries(survivor.weaponProficiency || {})
                  .filter(([, value]) => value.level > 0)
                  .map(([type, value]) => `${type} ${value.level}`)
                  .join(', ') || 'None'}
              </span>
              {(survivor.hp < survivor.maxHp || survivor.injuries?.length) && (
                <span className="missing">This survivor is wounded.</span>
              )}
              {unavailable && <span className="missing">Unavailable for the next hunt.</span>}
              {!gear.length && <span className="missing">This survivor has no gear.</span>}
              {gear.length > 0 && <span>This survivor already has bound gear.</span>}
              {baneId && <span>{fightingArts[baneId]?.name || baneId}</span>}
              {baneId === `monsterBane_${quarryId}` && (
                <span>This survivor has Monster Bane for this quarry.</span>
              )}
              {(survivor.injuries || []).map(id => (
                <span key={id}>{injuries[id]?.name || id}</span>
              ))}
              {(survivor.disorders || []).map(id => (
                <span key={id}>{disorders[id]?.name || id}</span>
              ))}
              {(survivor.scars || []).map(id => <span key={id}>Scar: {id}</span>)}
            </button>
          );
        })}
      </div>
      {selectedIds.length > 0 && !matchingBane && (
        <p className="missing">No survivor has Monster Bane for this quarry.</p>
      )}
      <h3>Party order</h3>
      <ol>
        {selectedIds.map(id => <li key={id}>{living.find(survivor => survivor.id === id)?.name}</li>)}
      </ol>
      <div className="button-row">
        <button type="button" disabled={!selectedIds.length} onClick={onContinue}>Prepare Loadouts</button>
        <button type="button" className="secondary-button" onClick={onBack}>Back</button>
      </div>
    </section>
  );
}
