import React from 'react';
import { getCreatureBehaviour } from '../data/creatureBehaviours.js';
import { quarryList } from '../data/quarries.js';

export default function QuarrySelectionScreen({ settlement, onSelect, onBack }) {
  const unlocked = new Set(settlement.unlockedQuarries || []);

  return (
    <section className="settlement-screen">
      <p className="eyebrow">Choose The Hunt</p>
      <h2>Quarry Selection</h2>
      <p>Higher levels are more dangerous and return richer resources.</p>
      <div className="recipe-grid">
        {quarryList.map(quarry => {
          const isUnlocked = unlocked.has(quarry.id);
          const defeatedLevel = settlement.defeatedQuarryLevels[quarry.id] || 0;
          const behaviour = quarry.implemented ? getCreatureBehaviour(quarry.id) : null;
          return (
            <article key={quarry.id} className="recipe-card">
              <p className="eyebrow">{quarry.behaviourTags.join(' / ')}</p>
              <h3>{quarry.name}</h3>
              <p>{behaviour?.description || quarry.description}</p>
              {!quarry.implemented && <p className="warning-message">Planned content</p>}
              {!isUnlocked && <p>{quarry.unlockText || 'Locked by a future campaign milestone.'}</p>}
              <div className="level-buttons">
                {[1, 2, 3].map(level => {
                  const levelUnlocked = isUnlocked && quarry.implemented && level <= defeatedLevel + 1;
                  const stats = quarry.levels[level];
                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={!levelUnlocked || !stats}
                      onClick={() => onSelect(quarry.id, level)}
                    >
                      Level {level}
                      {stats ? ` | ${stats.hp} HP / ${stats.damage} DMG` : ' | Locked'}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
      <div className="screen-actions">
        <button type="button" onClick={onBack}>Back to Loadout</button>
      </div>
    </section>
  );
}
