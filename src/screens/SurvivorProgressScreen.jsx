import React from 'react';

export const survivorProgressRewards = [
  { id: 'clawStyle', name: 'Claw Style', description: 'Attacks apply bleed.', type: 'fightingArt', value: 'clawStyle' },
  { id: 'berserker', name: 'Berserker', description: 'Attacks deal +1 damage at 0 block.', type: 'fightingArt', value: 'berserker' },
  { id: 'tumble', name: 'Tumble', description: 'Start combat with +3 block.', type: 'fightingArt', value: 'tumble' },
  { id: 'hardened', name: 'Hardened', description: 'Gain +1 max HP.', type: 'maxHp', value: 1 },
  { id: 'ironResolve', name: 'Iron Resolve', description: 'Gain +1 permanent strength.', type: 'strength', value: 1 },
  { id: 'veteranStrike', name: 'Veteran Strike', description: 'Add Veteran Strike to the personal deck.', type: 'card', value: 'veteranStrike' },
  { id: 'focusBreath', name: 'Focus Breath', description: 'Add Focus Breath to the personal deck.', type: 'card', value: 'focusBreath' },
  { id: 'scarTissue', name: 'Scar Tissue', description: 'Start combat with +2 block.', type: 'scar', value: 'scarTissue' },
  { id: 'purgeFear', name: 'Purge Fear', description: 'Remove one personal Panic, Shame, or Curse.', type: 'removeCurse' }
];

export default function SurvivorProgressScreen({ survivor, choices, onChoose }) {
  return (
    <section className="progress-screen">
      <p className="eyebrow">Survivor Progress</p>
      <h2>{survivor.name} Returns Changed</h2>
      <p>Choose one personal reward. It remains with this survivor until death.</p>
      <div className="grave-card-grid">
        {choices.map(reward => (
          <button key={reward.id} type="button" className="grave-card" onClick={() => onChoose(reward)}>
            <h3>{reward.name}</h3>
            <p>{reward.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
