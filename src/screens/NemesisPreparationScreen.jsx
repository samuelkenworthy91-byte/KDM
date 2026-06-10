import React from 'react';

export default function NemesisPreparationScreen({
  encounter,
  settlement,
  selectedSurvivorId,
  onSelectSurvivor,
  onSpendMemory,
  onHeal,
  onContinue
}) {
  const living = settlement.survivors.filter(survivor => survivor.alive !== false);
  const selected = living.find(survivor => survivor.id === selectedSurvivorId);
  const healingResource = (settlement.stash.hide || 0) > 0
    ? 'hide'
    : (settlement.stash.organ || 0) > 0
      ? 'organ'
      : null;

  return (
    <section className="settlement-hub">
      <p className="eyebrow">Nemesis Preparation</p>
      <h2>Prepare for {encounter.displayName}</h2>
      <p>{encounter.preparationText}</p>
      {!living.length && <p className="missing">No living survivor can defend the settlement.</p>}
      <div className="item-grid">
        {living.map(survivor => (
          <button
            type="button"
            key={survivor.id}
            className={selectedSurvivorId === survivor.id ? 'selected' : ''}
            onClick={() => onSelectSurvivor(survivor.id)}
          >
            <strong>{survivor.name}</strong>
            <span>HP {survivor.hp}/{survivor.maxHp} | Survival {survivor.survival || 0}</span>
            {survivor.hp < survivor.maxHp && <span className="missing">Wounded</span>}
          </button>
        ))}
      </div>
      {selected && (
        <div className="button-row">
          <button
            type="button"
            disabled={settlement.settlementMemory < 1 || settlement.pendingNemesisEncounter?.memorySpent}
            onClick={onSpendMemory}
          >
            Spend 1 Memory: +1 Starting Survival
          </button>
          <button
            type="button"
            disabled={!healingResource || selected.hp >= selected.maxHp || settlement.pendingNemesisEncounter?.healingSpent}
            onClick={() => onHeal(healingResource)}
          >
            Spend 1 {healingResource || 'Hide/Organ'}: Heal 2
          </button>
        </div>
      )}
      <button type="button" disabled={!selected} onClick={onContinue}>
        Choose Gear
      </button>
    </section>
  );
}
