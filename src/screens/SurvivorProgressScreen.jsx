import React from 'react';
import {
  fightingArts,
  getSurvivorMonsterBaneId
} from '../data/fightingArts.js';

export default function SurvivorProgressScreen({
  survivorName,
  quarryId,
  offerBane,
  ownedArts,
  oralTradition,
  onChoose
}) {
  const baneId = `monsterBane_${quarryId}`;
  const ownedBaneId = getSurvivorMonsterBaneId({ fightingArts: ownedArts });
  const availableGeneralArts = ['clawStyle', 'berserker', 'tumble', 'scarTissue', 'hardened', 'focusedBreath']
    .filter(id => fightingArts[id]?.implemented && !ownedArts.includes(id));
  const rewards = [
    ...(offerBane && !ownedBaneId ? [{
      id: baneId,
      name: fightingArts[baneId]?.name,
      description: fightingArts[baneId]?.description
    }] : []),
    {
      id: 'survival',
      name: 'Hard-Won Composure',
      description: 'Gain +1 survival.'
    },
    {
      id: 'veteranStrike',
      name: 'Veteran Strike',
      description: 'Add Veteran Strike to this survivor’s personal deck.'
    },
    ...(oralTradition ? [{
      id: 'hardWonGuard',
      name: 'Hard-Won Guard',
      description: 'Add Hard-Won Guard to this survivor’s personal deck.'
    }] : []),
    ...availableGeneralArts.slice(0, 1).map(id => ({
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
      {ownedBaneId && (
        <p className="muted-text">
          This survivor already has {fightingArts[ownedBaneId]?.name || ownedBaneId}.
          {' '}Monster Bane is permanent and cannot be changed.
        </p>
      )}
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
