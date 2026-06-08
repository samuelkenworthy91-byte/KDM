import React from 'react';
import { settlementUpgrades } from '../data/settlementUpgrades.js';
import { hasUpgrade } from '../game/saveLogic.js';

export default function SettlementScreen({ settlement, onBuyUpgrade, onStartRun }) {
  const unlocked = settlementUpgrades.filter(upgrade =>
    hasUpgrade(settlement, upgrade.id)
  );
  const available = settlementUpgrades.filter(upgrade =>
    !hasUpgrade(settlement, upgrade.id)
  );

  const renderUpgrade = upgrade => {
    const isUnlocked = hasUpgrade(settlement, upgrade.id);
    const isAffordable = settlement.settlementMemory >= upgrade.cost;

    return (
      <article
        key={upgrade.id}
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
            {isAffordable ? 'Buy' : 'Cannot Afford'}
          </button>
        )}
      </article>
    );
  };

  return (
    <section className="settlement-screen">
      <header className="settlement-header">
        <div>
          <p className="eyebrow">Permanent Settlement</p>
          <h2>The Lanterns Are Lit</h2>
          <p>Each lost life leaves knowledge for the next survivor.</p>
        </div>
        <button type="button" onClick={onStartRun}>
          Start New Survivor
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
          {unlocked.length ? unlocked.map(renderUpgrade) : (
            <p className="empty-upgrades">No permanent upgrades unlocked.</p>
          )}
        </div>
      </div>

      <div className="upgrade-section">
        <h3>Available Upgrades</h3>
        <div className="upgrade-grid">
          {available.length ? available.map(renderUpgrade) : (
            <p className="empty-upgrades">Every settlement upgrade is unlocked.</p>
          )}
        </div>
      </div>

      {hasUpgrade(settlement, 'storyteller') && (
        <p className="active-upgrade-note">
          Storyteller active: future reward choices will be expanded.
        </p>
      )}
    </section>
  );
}
