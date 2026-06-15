import React, { useEffect, useState } from 'react';
import { cards } from '../data/cards.js';
import { disorders } from '../data/disorders.js';
import {
  equipment,
  getEquipment,
  getEquipmentDisplayName
} from '../data/equipment.js';
import { injuries } from '../data/injuries.js';
import {
  getActiveProficiencyPassive,
  weaponProficiencyDefinitions
} from '../data/weaponProficiency.js';
import {
  getLegacyDescription,
  getLegacyDisplayName
} from '../game/legacyContent.js';
import { formatValueForDisplay } from '../utils/formatters.js';
import { getSurvivorDisplayName } from '../game/survivorIdentity.js';

function GearCards({ gear }) {
  const item = getEquipment(gear.equipmentId);
  const knownItem = equipment[gear.equipmentId];
  return (
    <article className="item-card">
      <h4>{item.name}</h4>
      {!knownItem && <small>Legacy id: {gear.equipmentId}</small>}
      {(item.deprecated || item.hiddenFromCrafting) && (
        <p className="locked-badge">Legacy gear retained from an older save.</p>
      )}
      <p>
        Type: {item?.weaponType || 'Non-weapon'} | Hands: {item?.hands ?? 0} | Slot: {item?.slot}
      </p>
      <p>Keywords: {item?.keywords?.join(', ') || 'Survival'}</p>
      <p>{formatValueForDisplay(item?.passiveText)}</p>
      {item?.affectsOtherSurvivors && <p className="effect-text">Affects other survivors.</p>}
      {item?.deckIdentity && <p className="effect-text">Deck identity: {item.deckIdentity}</p>}
      <ul>
        {(item?.cardPackage || []).map(cardId => (
          <li key={cardId}>
            <strong>{getLegacyDisplayName(cards, cardId, 'card')}</strong>:{' '}
            {getLegacyDescription(cards, cardId)}
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
  const availableWeaponTypes = [...new Set(allRunGear
    .map(gear => equipment[gear.equipmentId])
    .filter(item => item?.proficiencyXpGranted && item.weaponType)
    .map(item => item.weaponType))];
  const validProficiencyTypes = availableWeaponTypes.length
    ? availableWeaponTypes
    : ['fistAndTooth'];
  const [activeProficiencyType, setActiveProficiencyType] = useState(
    validProficiencyTypes.includes(survivor.activeProficiencyType)
      ? survivor.activeProficiencyType
      : validProficiencyTypes[0]
  );

  useEffect(() => {
    if (!validProficiencyTypes.includes(activeProficiencyType)) {
      setActiveProficiencyType(validProficiencyTypes[0]);
    }
  }, [activeProficiencyType, validProficiencyTypes.join('|')]);

  const togglePreview = instanceId => {
    setSelectedInstanceIds(current => {
      if (current.includes(instanceId)) return current.filter(id => id !== instanceId);
      if (current.length >= remainingSlots) return current;
      return [...current, instanceId];
    });
  };

  const destroyBoundGear = gear => {
    if (window.confirm(`Removing ${getEquipmentDisplayName(gear.equipmentId)} will destroy it. Continue?`)) {
      onDestroyBoundGear(gear.instanceId);
    }
  };

  return (
    <section className="settlement-hub">
      <p className="eyebrow">Loadout</p>
      <h2>Prepare {getSurvivorDisplayName(survivor)}</h2>
      <p>HP {survivor.hp}/{survivor.maxHp} | Survival {survivor.survival || 0}</p>
      {wounded && <p className="missing">Warning: this survivor is wounded.</p>}
      {(survivor.injuries?.length > 0 || survivor.disorders?.length > 0) && (
        <ul className="condition-warning-list">
          {(survivor.injuries || []).map(id => (
            <li key={id}>
              <strong>{getLegacyDisplayName(injuries, id, 'injury')}:</strong>{' '}
              {getLegacyDescription(injuries, id)}
            </li>
          ))}
          {(survivor.disorders || []).map(id => (
            <li key={id}>
              <strong>{getLegacyDisplayName(disorders, id, 'disorder')}:</strong>{' '}
              {getLegacyDescription(disorders, id)}
            </li>
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
          const item = getEquipment(gear.equipmentId);
          return (
            <article className={`item-card ${selected ? 'built' : ''}`} key={gear.instanceId}>
              <h4>{item.name}</h4>
              {!equipment[gear.equipmentId] && <small>Legacy id: {gear.equipmentId}</small>}
              {(item.deprecated || item.hiddenFromCrafting) && (
                <p className="locked-badge">Legacy gear retained from an older save.</p>
              )}
              <p>
                Type: {item.weaponType || 'Non-weapon'} |{' '}
                Hands: {item.hands ?? 0} | Slot: {item.slot}
              </p>
              <p>Keywords: {item.keywords?.join(', ') || 'Survival'}</p>
              <p>{formatValueForDisplay(item.passiveText)}</p>
              {item.affectsOtherSurvivors && (
                <p className="effect-text">Affects other survivors.</p>
              )}
              {item.deckIdentity && (
                <p className="effect-text">
                  This gear adds a {item.deckIdentity} package.
                </p>
              )}
              <ul>
                {(item.cardPackage || []).map(cardId => (
                  <li key={cardId}>
                    <strong>{getLegacyDisplayName(cards, cardId, 'card')}</strong>:{' '}
                    {getLegacyDescription(cards, cardId)}
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
          const item = getEquipment(gear.equipmentId);
          return (
            <div key={gear.instanceId}>
              <strong>{item.name} adds:</strong>
              <ul>
                {(item?.cardPackage || []).map((cardId, cardIndex) => (
                  <li key={`${cardId}-${cardIndex}`}>
                    <strong>{getLegacyDisplayName(cards, cardId, 'card')}</strong>:{' '}
                    {getLegacyDescription(cards, cardId)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }) : <p>No gear is adding cards.</p>}
      </section>

      <section className="gear-card-summary">
        <h3>Active Proficiency</h3>
        <p className="muted-text">
          Only this proficiency's passive and proficiency cards will be active during the hunt.
        </p>
        <label className="field-label" htmlFor="active-proficiency">Active proficiency</label>
        <select
          id="active-proficiency"
          value={activeProficiencyType}
          onChange={event => setActiveProficiencyType(event.target.value)}
        >
          {validProficiencyTypes.map(type => (
            <option value={type} key={type}>
              {weaponProficiencyDefinitions[type]?.name || type}
            </option>
          ))}
        </select>
        {!availableWeaponTypes.length && (
          <p>Unarmed loadout: Fist and Tooth will gain proficiency XP.</p>
        )}
        <p>
          XP: {survivor.weaponProficiency?.[activeProficiencyType]?.xp || 0}/8 |{' '}
          {getActiveProficiencyPassive(survivor.weaponProficiency, activeProficiencyType)}
        </p>
      </section>

      {import.meta.env.DEV && (
        <button type="button" className="test-button" onClick={onAddTestResources}>
          Test: add resources for gear
        </button>
      )}
      <div className="button-row">
        <button
          type="button"
          onClick={() => onConfirm(selectedInstanceIds, activeProficiencyType)}
        >
          {confirmLabel}
        </button>
        <button type="button" className="secondary-button" onClick={onBack}>Back</button>
      </div>
    </section>
  );
}
