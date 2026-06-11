import React from 'react';
import {
  fightingArts,
  getSurvivorMonsterBaneId
} from '../data/fightingArts.js';
import { getMonsterSurvivorRewardChoices } from '../data/monsterSurvivorRewards.js';
import { quarries } from '../data/quarries.js';

export default function SurvivorProgressScreen({
  survivorName,
  quarryId,
  level,
  offerBane,
  ownedArts,
  oralTradition,
  quarryRevealed,
  onChoose
}) {
  const baneId = `monsterBane_${quarryId}`;
  const ownedBaneId = getSurvivorMonsterBaneId({ fightingArts: ownedArts });
  const includeBane = offerBane && !ownedBaneId;
  const themedRewards = getMonsterSurvivorRewardChoices(quarryId, level, {
    includeBane,
    survivorHasAnyBane: Boolean(ownedBaneId),
    quarryRevealed
  });
  const targetCount = level + 2;
  const rewards = themedRewards.map(reward => ({
      id: reward.id,
      name: reward.type === 'monsterBane'
        ? fightingArts[baneId]?.name || reward.name
        : reward.name,
      description: reward.type === 'monsterBane'
        ? fightingArts[baneId]?.description || `${reward.description} ${reward.effectText}`
        : reward.description,
      label: reward.type === 'monsterBane'
        ? 'Monster Bane - Locked'
        : reward.family === 'mimic'
        ? 'Mimic Technique'
        : reward.family === 'support' ? 'Party Support' : 'Counter Technique',
      rarity: reward.rarity.charAt(0).toUpperCase() + reward.rarity.slice(1)
    }));
  if (rewards.length < targetCount) {
    rewards.push({
      id: 'survival',
      name: 'Hard-Won Composure',
      description: 'Gain +1 survival.',
      label: 'Stat Reward',
      rarity: 'Common'
    });
  }

  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Survivor Progress</p>
      <h2>{survivorName} Returns Changed</h2>
      <p>{quarries[quarryId]?.name} - Level {level} {level === 3 ? 'Rare' : ''}</p>
      <p>Choose one lesson from {rewards.length} rewards.</p>
      {ownedBaneId && (
        <p className="muted-text">
          This survivor already has {fightingArts[ownedBaneId]?.name || ownedBaneId}.
          {' '}Monster Bane is permanent and cannot be changed.
        </p>
      )}
      <div className="progress-choice-grid">
        {rewards.map(reward => (
          <button
            type="button"
            key={reward.id}
            data-reward-id={reward.id}
            onClick={() => onChoose(reward.id)}
          >
            <strong>{reward.name}</strong>
            <span>{reward.label} - {reward.rarity}</span>
            <span>{reward.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
