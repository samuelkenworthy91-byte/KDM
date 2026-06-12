import React from 'react';
import {
  getSurvivorMonsterBaneId
} from '../data/fightingArts.js';
import { generateSurvivorRewardChoices } from '../data/survivorRewards.js';
import { quarries } from '../data/quarries.js';
import {
  formatModifierEffect,
  formatRewardForDisplay,
  formatValueForDisplay
} from '../utils/formatters.js';

export default function SurvivorProgressScreen({
  survivorName,
  survivor,
  quarryId,
  level,
  offerBane,
  ownedArts,
  oralTradition,
  quarryRevealed,
  onChoose
}) {
  const ownedBaneId = getSurvivorMonsterBaneId({ fightingArts: ownedArts });
  const includeBane = offerBane && !ownedBaneId;
  const rewards = React.useMemo(() => generateSurvivorRewardChoices({
    survivor: survivor || { fightingArts: ownedArts },
    quarryId,
    level,
    includeBane,
    quarryRevealed,
    context: survivor?.lastHuntRewardContext || {}
  }), [survivor?.id, quarryId, level, includeBane, quarryRevealed]);

  return (
    <section className="survivor-progress-screen">
      <p className="eyebrow">Survivor Progress</p>
      <h2>{survivorName} Returns Changed</h2>
      <p>{quarries[quarryId]?.name} - Level {level} {level === 3 ? 'Rare' : ''}</p>
      <p>Choose one lesson from {rewards.length} rewards.</p>
      {ownedBaneId && (
        <p className="muted-text">
          This survivor already has permanent Monster Bane knowledge.
          {' '}Monster Bane is permanent and cannot be changed.
        </p>
      )}
      <div className="progress-choice-grid">
        {rewards.map(reward => (
          <button
            type="button"
            key={reward.id}
            data-reward-id={reward.id}
            onClick={() => onChoose(reward.id, rewards.map(item => item.id))}
          >
            <strong>{reward.name}</strong>
            <span>{reward.type} - {reward.rarity}</span>
            <span>{formatValueForDisplay(reward.description)}</span>
            <span className="effect-text">
              {formatModifierEffect(
                reward.mechanicalEffectText ||
                reward.effectText ||
                reward.mechanicalEffect ||
                reward.effects ||
                formatRewardForDisplay(reward)
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
