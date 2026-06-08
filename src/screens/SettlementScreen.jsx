import React, { useState } from 'react';
import { equipment } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { graveLegacies } from '../data/graveLegacies.js';
import { settlementUpgrades } from '../data/settlementUpgrades.js';
import { hasUpgrade } from '../game/saveLogic.js';

function UpgradeCard({ settlement, upgrade, onBuyUpgrade }) {
  const unlocked = hasUpgrade(settlement, upgrade.id);
  const affordable = settlement.settlementMemory >= upgrade.cost;

  return (
    <article className={`upgrade-card ${unlocked ? 'unlocked' : ''} ${!affordable ? 'unaffordable' : ''}`}>
      <div className="upgrade-heading">
        <h3>{upgrade.name}</h3>
        <span>{unlocked ? 'Unlocked' : `${upgrade.cost} Memory`}</span>
      </div>
      <p>{upgrade.effect}</p>
      {!unlocked && (
        <button type="button" disabled={!affordable} onClick={() => onBuyUpgrade(upgrade)}>
          {affordable ? 'Buy Upgrade' : 'Cannot Afford'}
        </button>
      )}
    </article>
  );
}

export default function SettlementScreen({
  settlement,
  onBuyUpgrade,
  onStartRun,
  onStartLivingSurvivor
}) {
  const [survivorName, setSurvivorName] = useState('');
  const unlocked = settlementUpgrades.filter(upgrade => hasUpgrade(settlement, upgrade.id));
  const available = settlementUpgrades.filter(upgrade => !hasUpgrade(settlement, upgrade.id));
  const graves = settlement.graveHistory.slice(0, 5);

  const startRun = event => {
    event.preventDefault();
    onStartRun(survivorName.trim() || 'Nameless Survivor');
  };

  return (
    <section className="settlement-screen">
      <header className="settlement-header">
        <div>
          <p className="eyebrow">Permanent Settlement</p>
          <h2>The Lanterns Are Lit</h2>
          <p>Each hunt leaves knowledge for the survivors who follow.</p>
        </div>
        <form className="survivor-name-form" onSubmit={startRun}>
          <label htmlFor="survivor-name">Next survivor</label>
          <input
            id="survivor-name"
            type="text"
            value={survivorName}
            maxLength={40}
            placeholder="Nameless Survivor"
            onChange={event => setSurvivorName(event.target.value)}
          />
          <button type="submit">Start New Run</button>
        </form>
      </header>

      <div className="settlement-stats">
        <div><strong>{settlement.settlementMemory}</strong><span>Memory</span></div>
        <div><strong>{settlement.totalRuns}</strong><span>Total Runs</span></div>
        <div><strong>{settlement.deadSurvivors}</strong><span>Dead Survivors</span></div>
        <div><strong>{settlement.victoriousRuns}</strong><span>Victories</span></div>
      </div>

      <section className="upgrade-section">
        <h3>Living Survivors</h3>
        <div className="survivor-grid">
          {settlement.livingSurvivors.length ? settlement.livingSurvivors.map(survivor => (
            <article key={survivor.id} className="survivor-card">
              <h3>{survivor.name}</h3>
              <p>Max HP: {survivor.maxHp}</p>
              <p>Completed runs: {survivor.completedRuns}</p>
              <p>
                Equipment:{' '}
                {survivor.craftedEquipment.length
                  ? survivor.craftedEquipment.map(id => equipment[id]?.name || id).join(', ')
                  : 'None'}
              </p>
              <p>
                Fighting arts:{' '}
                {survivor.fightingArts.length
                  ? survivor.fightingArts.map(id => fightingArts[id]?.name || id).join(', ')
                  : 'None'}
              </p>
              <button type="button" onClick={() => onStartLivingSurvivor(survivor.id)}>
                Start Run
              </button>
            </article>
          )) : <p className="empty-upgrades">No living veterans. Name a new survivor.</p>}
        </div>
      </section>

      <section className="upgrade-section">
        <h3>Unlocked Upgrades</h3>
        <div className="upgrade-grid">
          {unlocked.length
            ? unlocked.map(upgrade => (
                <UpgradeCard key={upgrade.id} settlement={settlement} upgrade={upgrade} onBuyUpgrade={onBuyUpgrade} />
              ))
            : <p className="empty-upgrades">No permanent upgrades unlocked.</p>}
        </div>
      </section>

      <section className="upgrade-section">
        <h3>Available Upgrades</h3>
        <div className="upgrade-grid">
          {available.length
            ? available.map(upgrade => (
                <UpgradeCard key={upgrade.id} settlement={settlement} upgrade={upgrade} onBuyUpgrade={onBuyUpgrade} />
              ))
            : <p className="empty-upgrades">Every settlement upgrade is unlocked.</p>}
        </div>
      </section>

      <section className="graveyard-section">
        <h3>Graveyard / Fallen Survivors</h3>
        {graves.length ? (
          <ul>
            {graves.map(grave => (
              <li key={`${grave.timestamp}-${grave.survivorName}`}>
                <strong>{grave.survivorName || 'Nameless Survivor'}</strong> killed by{' '}
                {grave.killedBy || 'unknownMonster'} |{' '}
                {graveLegacies[grave.chosenLegacyId]?.name || grave.chosenLegacyId} | Nodes completed:{' '}
                {grave.nodesCompleted ?? 0} | Lost equipment: {grave.equipmentCount ?? 0} |
                Completed runs: {grave.completedRuns ?? 0} | Fighting arts:{' '}
                {grave.fightingArts?.length
                  ? grave.fightingArts.map(id => fightingArts[id]?.name || id).join(', ')
                  : 'None'}
              </li>
            ))}
          </ul>
        ) : <p>No graves yet. The settlement waits.</p>}
      </section>

      {Object.values(settlement.settlementStash).some(amount => amount > 0) && (
        <section className="graveyard-section">
          <h3>Settlement Stash</h3>
          <p>
            {Object.entries(settlement.settlementStash)
              .filter(([, amount]) => amount > 0)
              .map(([id, amount]) => `${id} x${amount}`)
              .join(', ')}
          </p>
        </section>
      )}
    </section>
  );
}
