import React from 'react';
import { fightingArts } from '../data/fightingArts.js';

export default function SurvivorProgressScreen({ survivorName, quarryId, offerBane, ownedArts, onChoose }) {
  const baneId = `monsterBane_${quarryId}`;
  const availableGeneralArts = ['clawStyle', 'berserker', 'tumble', 'scarTissue', 'hardened', 'focusedBreath']
    .filter(id => fightingArts[id]?.implemented && !ownedArts.includes(id));
  const rewards = [
    ...(offerBane && !ownedArts.includes(baneId) ? [{
      id: baneId,
      name: fightingArts[baneId]?.name,
      description: fightingArts[baneId]?.description
    }] : []),
    {
      id: 'survival',
      name: 'Hard-Won Composure',
      description: 'Gain +1 survival.'
    },
    ...availableGeneralArts.slice(0, 2).map(id => ({
      id,
      name: fightingArts[id].name,
      description: fightingArts[id].description
    }))
  ];

  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Survivor Progress</p>
      <h2>{survivorName} Returns Changed</h2>
      <p>Choose one lesson from the victory.</p>
      <div className="progress-choice-grid">
        {rewards.map(reward => (
          <button type="button" key={reward.id} onClick={() => onChoose(reward.id)}>
            <strong>{reward.name}</strong>
            <span>{reward.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
