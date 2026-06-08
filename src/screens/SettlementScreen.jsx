import React from 'react';
import { graveLegacies } from '../data/graveLegacies.js';
import { settlementUpgrades } from '../data/settlementUpgrades.js';
import { hasUpgrade } from '../game/saveLogic.js';

function UpgradeCard({ settlement, upgrade, onBuyUpgrade }) {
  const isUnlocked = hasUpgrade(settlement, upgrade.id);
  const isAffordable = settlement.settlementMemory >= upgrade.cost;

  return (
    <article
      className={`upgrade-card ${isUnlocked ? 'unlocked' : 'locked'} ${
        !isUnlocked && !isAffordable ? 'unaffordable' : ''
      }`}
    >
      <div className="upgrade-heading">
        <h3>{upgrade.name}</h3>
        <span>{isUnlocked ? 'Unlocked' : `${upgrade.cost} Memory`}</span>
      </div>
      <p>{upgrade.effect}</p>
      {!isUnlocked && (
        <button
          type="button"
          disabled={!isAffordable}
          onClick={() => onBuyUpgrade(upgrade)}
        >
          {isAffordable ? 'Buy Upgrade' : 'Cannot Afford'}
        </button>
      )}
    </article>
  );
}

export default function SettlementScreen({ settlement, onBuyUpgrade, onStartRun }) {
  const unlocked = settlementUpgrades.filter(upgrade =>
    hasUpgrade(settlement, upgrade.id)
  );
  const available = settlementUpgrades.filter(upgrade =>
    !hasUpgrade(settlement, upgrade.id)
  );
  const latestGraves = settlement.graveHistory.slice(0, 5);

  return (
    <section className="settlement-screen">
      <header className="settlement-header">
        <div>
          <p className="eyebrow">Permanent Settlement</p>
          <h2>The Lanterns Are Lit</h2>
          <p>Each hunt leaves knowledge for the survivors who follow.</p>
        </div>
        <button type="button" onClick={onStartRun}>
          Start New Run
        </button>
      </header>

      <div className="settlement-stats">
        <div><strong>{settlement.settlementMemory}</strong><span>Memory</span></div>
        <div><strong>{settlement.totalRuns}</strong><span>Total Runs</span></div>
        <div><strong>{settlement.deadSurvivors}</strong><span>Dead Survivors</span></div>
        <div><strong>{settlement.victoriousRuns}</strong><span>Victories</span></div>
      </div>

      <div className="upgrade-section">
        <h3>Unlocked Upgrades</h3>
        <div className="upgrade-grid">
          {unlocked.length ? unlocked.map(upgrade => (
            <UpgradeCard
              key={upgrade.id}
              settlement={settlement}
              upgrade={upgrade}
              onBuyUpgrade={onBuyUpgrade}
            />
          )) : <p className="empty-upgrades">No permanent upgrades unlocked.</p>}
        </div>
      </div>

      <div className="upgrade-section">
        <h3>Available Upgrades</h3>
        <div className="upgrade-grid">
          {available.length ? available.map(upgrade => (
            <UpgradeCard
              key={upgrade.id}
              settlement={settlement}
              upgrade={upgrade}
              onBuyUpgrade={onBuyUpgrade}
            />
          )) : <p className="empty-upgrades">Every settlement upgrade is unlocked.</p>}
        </div>
      </div>

      <div className="graveyard-section">
        <h3>Graveyard / Fallen Survivors</h3>
        {latestGraves.length === 0 ? (
          <p>No graves yet. The settlement waits.</p>
        ) : (
          <ul>
            {latestGraves.map(grave => (
              <li key={`${grave.timestamp}-${grave.survivorName}`}>
                <strong>{grave.survivorName || 'Unknown Survivor'}</strong> killed by{' '}
                {grave.killedBy || 'unknownMonster'} |{' '}
                {graveLegacies[grave.chosenLegacyId]?.name || grave.chosenLegacyId} | Nodes
                completed: {grave.nodesCompleted ?? 0}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
