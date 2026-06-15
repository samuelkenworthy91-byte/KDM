import React from 'react';
import QuarryPortrait from '../components/QuarryPortrait.jsx';
import { formatValueForDisplay } from '../utils/formatters.js';
import {
  calculateAvailableQuarryTiers,
  getAvailableQuarryLevel,
  getHighestDefeatedQuarryLevel,
  getQuarryTierProgress,
  getQuarryBehaviourLabel,
  getQuarryBehaviourNote,
  quarries,
  quarryList
} from '../data/quarries.js';

export default function QuarrySelectionScreen({
  settlement,
  selectedQuarry,
  selectedLevel,
  onSelectQuarry,
  onSelectLevel,
  onStart,
  onBack,
  partySize = 1,
  scaledHp
}) {
  const available = quarryList.filter(quarry =>
    quarry.role === 'quarry' &&
    quarry.huntable &&
    settlement.discoveredQuarries.includes(quarry.id)
  );
  const quarry = quarries[selectedQuarry];
  const rewardProfile = quarry?.levelRewardProfile?.[selectedLevel];
  const dangerLabels = ['Low', 'Hunting', 'Severe', 'Deadly', 'Apex'];
  const danger = dangerLabels[Math.min(4, (quarry?.tierRank || 1) - 1 + selectedLevel - 1)];

  return (
    <section className="settlement-hub">
      <p className="eyebrow">Quarry Selection</p>
      <h2>Choose The Hunt</h2>
      <div className="item-card">
        <strong>Quarry Tier Progress</strong>
        {['early', 'mid', 'late', 'apex'].map(tier => {
          const progress = getQuarryTierProgress(settlement, tier);
          const availableTier = calculateAvailableQuarryTiers(settlement).includes(tier);
          return (
            <p key={tier}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}: {availableTier
                ? `${progress.unlocked}/${progress.total} unlocked`
                : 'Locked until the previous tier reaches 50%'}
            </p>
          );
        })}
      </div>
      <div className="quarry-list">
        {available.map(quarry => (
          <button
            type="button"
            key={quarry.id}
            className={selectedQuarry === quarry.id ? 'selected' : ''}
            onClick={() => onSelectQuarry(quarry.id)}
          >
            <QuarryPortrait quarry={quarry} size="selection" />
            <strong>{quarry.name}</strong>
            <span>Monster Tier: {quarry.tier.charAt(0).toUpperCase() + quarry.tier.slice(1)}</span>
            <span>Highest defeated level: {getHighestDefeatedQuarryLevel(settlement, quarry.id)}</span>
            <span>{formatValueForDisplay(quarry.description)}</span>
            <span>{getQuarryBehaviourLabel(quarry)}</span>
            {getQuarryBehaviourNote(quarry) && <span>{getQuarryBehaviourNote(quarry)}</span>}
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="hunt-quarry-level">Quarry level</label>
      <select id="hunt-quarry-level" value={selectedLevel} onChange={event => onSelectLevel(Number(event.target.value))}>
        {Array.from({ length: getAvailableQuarryLevel(selectedQuarry, settlement) }, (_, index) => index + 1)
          .map(level => <option value={level} key={level}>Level {level}</option>)}
      </select>
      {quarry && (
        <article className="item-card quarry-selection-summary">
          <QuarryPortrait quarry={quarry} size="hero" />
          <div>
            <strong>{quarry.name} - Tier: {quarry.tier.charAt(0).toUpperCase() + quarry.tier.slice(1)} - Level {selectedLevel}</strong>
            <p>Expected Danger: {danger}</p>
            <p>Reward Quality: {rewardProfile?.quality} / {quarry.tierRewardProfile.genericQuality}</p>
            <p>Unique resource reward count: {rewardProfile?.uniqueCount}</p>
            <p><strong>Party Size Scaling</strong></p>
            <p>1 survivor: normal HP | 2 survivors: monster HP x2 | 3 survivors: monster HP x3 | 4 survivors: monster HP x4</p>
            <p>This quarry will have {scaledHp} HP because {partySize} survivor{partySize === 1 ? '' : 's'} are hunting.</p>
            <p>
              {selectedLevel === 1
                ? 'A readable first hunt with mostly basic intents.'
                : selectedLevel === 2
                  ? 'A more aggressive hunt with stronger thematic intents and uncommon parts.'
                  : 'The quarry at its deadliest. Rare intents, level 3 parts, and improved survivor learning are available.'}
            </p>
          </div>
        </article>
      )}
      <div className="button-row">
        <button type="button" onClick={onStart}>Start Hunt</button>
        <button type="button" className="secondary-button" onClick={onBack}>Back to Loadout</button>
      </div>
    </section>
  );
}
