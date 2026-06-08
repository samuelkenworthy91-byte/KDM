import React from 'react';
import { cards } from '../data/cards.js';
import { equipment } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';

export default function LoadoutScreen({
  survivor,
  armory,
  equippedIds,
  message,
  onToggleGear,
  onStartHunt,
  onBack
}) {
  const equipped = armory.filter(item => equippedIds.includes(item.instanceId));

  return (
    <section className="loadout-screen">
      <p className="eyebrow">Prepare For The Hunt</p>
      <h2>{survivor.name}</h2>
      <p>Choose up to 4 pieces of gear. Equipment remains settlement property.</p>

      <div className="loadout-layout">
        <section className="base-panel">
          <h3>Survivor Progress</h3>
          <p>Max HP: {survivor.maxHp}</p>
          <p>Completed runs: {survivor.completedRuns}</p>
          <p>Kills: {survivor.kills || 0}</p>
          <p>
            Fighting arts: {survivor.fightingArts.length
              ? survivor.fightingArts.map(id => fightingArts[id]?.name || id).join(', ')
              : 'None'}
          </p>
          <p>
            Personal cards: {survivor.personalDeckAdditions.length
              ? survivor.personalDeckAdditions.map(id => cards[id]?.name || id).join(', ')
              : 'None'}
          </p>
          <p>Scars: {survivor.scars.length ? survivor.scars.join(', ') : 'None'}</p>
        </section>

        <section className="base-panel">
          <h3>Equipped Gear ({equipped.length}/4)</h3>
          <div className="gear-slots">
            {Array.from({ length: 4 }, (_, index) => {
              const item = equipped[index];
              return (
                <div key={index} className="gear-slot">
                  {item ? (
                    <>
                      <strong>{equipment[item.id]?.name || item.name}</strong>
                      <button type="button" onClick={() => onToggleGear(item.instanceId)}>
                        Unequip
                      </button>
                    </>
                  ) : <span>Empty slot</span>}
                </div>
              );
            })}
          </div>
          {message && <p className="warning-message" role="alert">{message}</p>}
        </section>
      </div>

      <section className="base-panel">
        <h3>Settlement Armory</h3>
        {armory.length ? (
          <div className="recipe-grid">
            {armory.map(item => {
              const selected = equippedIds.includes(item.instanceId);
              const definition = equipment[item.id];
              return (
                <article key={item.instanceId} className={`recipe-card ${selected ? 'selected' : ''}`}>
                  <h4>{definition?.name || item.name}</h4>
                  <p>{definition?.description}</p>
                  <button type="button" onClick={() => onToggleGear(item.instanceId)}>
                    {selected ? 'Unequip' : 'Equip'}
                  </button>
                </article>
              );
            })}
          </div>
        ) : <p>The armory is empty. This survivor will leave without gear.</p>}
      </section>

      <div className="screen-actions">
        <button type="button" onClick={onBack}>Back to Settlement</button>
        <button type="button" onClick={onStartHunt}>Start Hunt</button>
      </div>
    </section>
  );
}
