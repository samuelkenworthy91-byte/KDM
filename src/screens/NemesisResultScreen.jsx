import React from 'react';
import { formatHistoryDetail, formatValueForDisplay } from '../utils/formatters.js';

export default function NemesisResultScreen({ result, onChooseReward, onContinue }) {
  const reward = result.uniqueReward;
  const choicePending = result.result === 'victory' &&
    reward?.rewardChoices?.length > 0 &&
    !reward.rewardClaimed;

  return (
    <section className="summary-screen">
      <p className="eyebrow">Timeline Threat Resolved</p>
      <h2>{result.nemesisName}: {result.result === 'victory' ? 'Victory' : 'Defeat'}</h2>
      <p>{formatValueForDisplay(result.text)}</p>
      <p><strong>Survivor:</strong> {formatValueForDisplay(result.survivorName) || 'None'}</p>
      <p><strong>{result.result === 'victory' ? 'Rewards' : 'Consequences'}:</strong>{' '}
        {formatHistoryDetail(result.details) || 'None'}
      </p>
      {result.result === 'victory' && reward && (
        <section className="item-card">
          <h3>Nemesis Trophy</h3>
          <p><strong>{reward.uniqueResourceName}</strong> was added to the settlement stash.</p>
          <h3>Mirror Art Choice</h3>
          {choicePending ? (
            <div className="item-grid">
              {reward.rewardChoices.map(choice => (
                <button
                  type="button"
                  key={choice.id}
                  onClick={() => onChooseReward(choice.id)}
                >
                  <strong>{choice.name}</strong>
                  <span>{formatValueForDisplay(choice.description)}</span>
                </button>
              ))}
            </div>
          ) : (
            <p>
              <strong>Chosen:</strong>{' '}
              {reward.chosenRewardId === 'learnArt'
                ? reward.artName
                : reward.chosenRewardId === 'takeExtraTrophy'
                  ? `Additional ${reward.uniqueResourceName}`
                  : 'No additional reward'}
            </p>
          )}
          <p className="effect-text">{formatValueForDisplay(reward.learningText)}</p>
        </section>
      )}
      <button type="button" disabled={choicePending} onClick={onContinue}>
        {result.deathSummary ? 'Choose Grave Legacy' : 'Return to Settlement'}
      </button>
      {choicePending && <p className="missing">Choose a mirror-art reward before continuing.</p>}
    </section>
  );
}
