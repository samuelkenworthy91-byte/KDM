import React, { useState } from 'react';
import { equipmentList } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { graveLegacies } from '../data/graveLegacies.js';
import { resources } from '../data/resources.js';
import { settlementUpgrades } from '../data/settlementUpgrades.js';
import { canCraft } from '../game/craftingLogic.js';
import { hasUpgrade } from '../game/saveLogic.js';

function ResourceList({ stash }) {
  return (
    <div className="resource-grid">
      {Object.entries(stash).map(([id, amount]) => (
        <div key={id}>
          <strong>{amount}</strong>
          <span>{resources[id]?.name || id}</span>
        </div>
      ))}
    </div>
  );
}

export default function SettlementScreen({
  settlement,
  onCraft,
  onBuyUpgrade,
  onPrepareNewSurvivor,
  onPrepareLivingSurvivor
}) {
  const [survivorName, setSurvivorName] = useState('');
  const graves = settlement.graveHistory.slice(0, 5);

  const submitSurvivor = event => {
    event.preventDefault();
    onPrepareNewSurvivor(survivorName.trim() || 'Nameless Survivor');
  };

  return (
    <section className="settlement-screen">
      <header className="settlement-header">
        <div>
          <p className="eyebrow">Settlement Armory</p>
          <h2>The Lanterns Are Lit</h2>
          <p>Craft for the settlement, then prepare one survivor for the hunt.</p>
        </div>
        <form className="survivor-name-form" onSubmit={submitSurvivor}>
          <label htmlFor="survivor-name">New survivor name</label>
          <input
            id="survivor-name"
            value={survivorName}
            maxLength={40}
            placeholder="Nameless Survivor"
            onChange={event => setSurvivorName(event.target.value)}
          />
          <button type="submit">Prepare New Survivor</button>
        </form>
      </header>

      <div className="settlement-stats">
        <div><strong>{settlement.settlementMemory}</strong><span>Memory</span></div>
        <div><strong>{settlement.totalRuns}</strong><span>Total Runs</span></div>
        <div><strong>{settlement.victoriousRuns}</strong><span>Victories</span></div>
        <div><strong>{settlement.deadSurvivors}</strong><span>Deaths</span></div>
      </div>

      <section className="base-panel">
        <h3>Settlement Stash</h3>
        <ResourceList stash={settlement.settlementStash} />
      </section>

      <section className="base-panel">
        <h3>Settlement Armory</h3>
        {settlement.armory.length ? (
          <div className="compact-grid">
            {settlement.armory.map(item => (
              <article key={item.instanceId} className="compact-card">
                <strong>{item.name}</strong>
                <span>{item.slot}</span>
              </article>
            ))}
          </div>
        ) : <p>The racks are empty.</p>}
      </section>

      <section className="base-panel">
        <h3>Craft Gear</h3>
        <p>Crafting spends settlement resources. The armory keeps one copy of each item.</p>
        <div className="recipe-grid">
          {equipmentList.map(item => {
            const owned = settlement.armory.some(gear => gear.id === item.id);
            const affordable = canCraft(
              item,
              settlement.settlementStash,
              settlement.armory
            );
            return (
              <article key={item.id} className="recipe-card">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <p className="recipe-cost">
                  {Object.entries(item.cost)
                    .map(([id, amount]) => `${resources[id]?.name || id} x${amount}`)
                    .join(', ')}
                </p>
                <button type="button" disabled={!affordable} onClick={() => onCraft(item)}>
                  {owned ? 'In Armory' : affordable ? 'Craft' : 'Missing Resources'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="base-panel">
        <h3>Living Survivors</h3>
        <div className="survivor-grid">
          {settlement.livingSurvivors.length ? settlement.livingSurvivors.map(survivor => (
            <article key={survivor.id} className="survivor-card">
              <h4>{survivor.name}</h4>
              <p>Max HP: {survivor.maxHp} | Completed runs: {survivor.completedRuns}</p>
              <p>
                Fighting arts: {survivor.fightingArts.length
                  ? survivor.fightingArts.map(id => fightingArts[id]?.name || id).join(', ')
                  : 'None'}
              </p>
              <button type="button" onClick={() => onPrepareLivingSurvivor(survivor.id)}>
                Prepare Loadout
              </button>
            </article>
          )) : <p>No living veterans. Name a new survivor.</p>}
        </div>
      </section>

      <section className="base-panel">
        <h3>Settlement Upgrades</h3>
        <div className="compact-grid">
          {settlementUpgrades.map(upgrade => {
            const unlocked = hasUpgrade(settlement, upgrade.id);
            const affordable = settlement.settlementMemory >= upgrade.cost;
            return (
              <article key={upgrade.id} className="compact-card">
                <strong>{upgrade.name}</strong>
                <p>{upgrade.effect}</p>
                <button
                  type="button"
                  disabled={unlocked || !affordable}
                  onClick={() => onBuyUpgrade(upgrade)}
                >
                  {unlocked ? 'Unlocked' : `${upgrade.cost} Memory`}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="base-panel graveyard-section">
        <h3>Graveyard</h3>
        {graves.length ? (
          <ul>
            {graves.map(grave => (
              <li key={`${grave.timestamp}-${grave.survivorName}`}>
                <strong>{grave.survivorName}</strong> killed by {grave.killedBy} |{' '}
                {graveLegacies[grave.chosenLegacyId]?.name || grave.chosenLegacyId}
              </li>
            ))}
          </ul>
        ) : <p>No graves yet. The settlement waits.</p>}
      </section>
    </section>
  );
}
