import React, { useState } from 'react';
import { cards } from '../data/cards.js';
import { disorders } from '../data/disorders.js';
import { equipment } from '../data/equipment.js';
import { injuries } from '../data/injuries.js';

function GearCards({ gear }) {
  const item = equipment[gear.equipmentId];
  return (
    <article className="item-card">
      <h4>{item?.name || gear.equipmentId}</h4>
      <p>
        Type: {item?.weaponType || 'Non-weapon'} | Hands: {item?.hands ?? 0} | Slot: {item?.slot}
      </p>
      <p>Keywords: {item?.keywords?.join(', ') || 'Survival'}</p>
      <p>{item?.passiveText}</p>
      {item?.affectsOtherSurvivors && <p className="effect-text">Affects other survivors.</p>}
      {item?.deckIdentity && <p className="effect-text">Deck identity: {item.deckIdentity}</p>}
      <ul>
        {(item?.cardPackage || []).map(cardId => (
          <li key={cardId}>
            <strong>{cards[cardId]?.name || cardId}</strong>: {cards[cardId]?.description}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function LoadoutScreen({
  survivor,
  armory,
  equipLimit,
  onConfirm,
  onDestroyBoundGear,
  onAddTestResources,
  confirmLabel = 'Confirm Loadout and Choose Quarry',
  onBack
}) {
  const [selectedInstanceIds, setSelectedInstanceIds] = useState([]);
  const boundGear = survivor.boundGear || [];
  const wounded = survivor.hp < survivor.maxHp || survivor.injuries?.length || survivor.disorders?.length;
  const remainingSlots = Math.max(0, equipLimit - boundGear.length);
  const selectedGear = armory.filter(gear => selectedInstanceIds.includes(gear.instanceId));
  const allRunGear = [...boundGear, ...selectedGear];

  const togglePreview = instanceId => {
    setSelectedInstanceIds(current => {
      if (current.includes(instanceId)) return current.filter(id => id !== instanceId);
      if (current.length >= remainingSlots) return current;
      return [...current, instanceId];
    });
  };

  const destroyBoundGear = gear => {
    const item = equipment[gear.equipmentId];
    if (window.confirm(`Removing ${item?.name || gear.equipmentId} will destroy it. Continue?`)) {
      onDestroyBoundGear(gear.instanceId);
    }
  };

  return (
    <section className="settlement-hub">
      <p className="eyebrow">Loadout</p>
      <h2>Prepare {survivor.name}</h2>
      <p>HP {survivor.hp}/{survivor.maxHp} | Survival {survivor.survival || 0}</p>
      {wounded && <p className="missing">Warning: this survivor is wounded.</p>}
      {(survivor.injuries?.length > 0 || survivor.disorders?.length > 0) && (
        <ul className="condition-warning-list">
          {(survivor.injuries || []).map(id => (
            <li key={id}><strong>{injuries[id]?.name || id}:</strong> {injuries[id]?.effect}</li>
          ))}
          {(survivor.disorders || []).map(id => (
            <li key={id}><strong>{disorders[id]?.name || id}:</strong> {disorders[id]?.effect}</li>
          ))}
        </ul>
      )}

      <h3>Bound Gear ({boundGear.length}/{equipLimit})</h3>
      <p className="muted-text">Bound gear persists with this survivor. Removing it destroys it permanently.</p>
      <div className="item-grid">
        {boundGear.map(gear => (
          <div key={gear.instanceId}>
            <GearCards gear={gear} />
            <button type="button" className="danger-button" onClick={() => destroyBoundGear(gear)}>
              Remove and Destroy
            </button>
          </div>
        ))}
      </div>
      {!boundGear.length && <p>No gear is bound to this survivor.</p>}

      <h3>Settlement Armory</h3>
      <p>Select freely. These items are not bound until you confirm the loadout.</p>
      <div className="item-grid">
        {armory.map(gear => {
          const selected = selectedInstanceIds.includes(gear.instanceId);
          return (
            <article className={`item-card ${selected ? 'built' : ''}`} key={gear.instanceId}>
              <h4>{equipment[gear.equipmentId]?.name || gear.equipmentId}</h4>
              <p>
                Type: {equipment[gear.equipmentId]?.weaponType || 'Non-weapon'} |{' '}
                Hands: {equipment[gear.equipmentId]?.hands ?? 0} | Slot: {equipment[gear.equipmentId]?.slot}
              </p>
              <p>Keywords: {equipment[gear.equipmentId]?.keywords?.join(', ') || 'Survival'}</p>
              <p>{equipment[gear.equipmentId]?.passiveText}</p>
              {equipment[gear.equipmentId]?.affectsOtherSurvivors && (
                <p className="effect-text">Affects other survivors.</p>
              )}
              {equipment[gear.equipmentId]?.deckIdentity && (
                <p className="effect-text">
                  This gear adds a {equipment[gear.equipmentId].deckIdentity} package.
                </p>
              )}
              <ul>
                {(equipment[gear.equipmentId]?.cardPackage || []).map(cardId => (
                  <li key={cardId}>
                    <strong>{cards[cardId]?.name || cardId}</strong>: {cards[cardId]?.description}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={!selected && selectedInstanceIds.length >= remainingSlots}
                onClick={() => togglePreview(gear.instanceId)}
              >
                {selected ? 'Deselect' : 'Select'}
              </button>
            </article>
          );
        })}
      </div>
      {!armory.length && <p>The settlement armory is empty.</p>}

      <section className="gear-card-summary">
        <h3>Cards Added by Gear</h3>
        {allRunGear.length ? allRunGear.map(gear => {
          const item = equipment[gear.equipmentId];
          return (
            <div key={gear.instanceId}>
              <strong>{item?.name || gear.equipmentId} adds:</strong>
              <ul>
                {(item?.cardPackage || []).map((cardId, cardIndex) => (
                  <li key={`${cardId}-${cardIndex}`}>
                    <strong>{cards[cardId]?.name || cardId}</strong>: {cards[cardId]?.description}
                  </li>
                ))}
              </ul>
            </div>
          );
        }) : <p>No gear is adding cards.</p>}
      </section>

      {import.meta.env.DEV && (
        <button type="button" className="test-button" onClick={onAddTestResources}>
          Test: add resources for gear
        </button>
      )}
      <div className="button-row">
        <button type="button" onClick={() => onConfirm(selectedInstanceIds)}>
          {confirmLabel}
        </button>
        <button type="button" className="secondary-button" onClick={onBack}>Back</button>
      </div>
    </section>
  );
}
