import React, { useMemo, useState } from 'react';
import {
  DEFAULT_REST_OUTCOME_ODDS,
  getRestOutcomeOdds,
  getRestParty
} from '../game/restStopLogic.js';
import { formatValueForDisplay } from '../utils/formatters.js';

const choices = [
  {
    id: 'healParty',
    name: 'Heal Party',
    description: 'Heal every living survivor for 25% of their max HP.'
  },
  {
    id: 'shareStories',
    name: 'Share Stories',
    description: 'Share stories around the dark. Everyone gains either 1 Survival or 1 Memory.'
  },
  {
    id: 'practice',
    name: 'Practice',
    description: 'One survivor practises under pressure. High risk, high reward.'
  },
  {
    id: 'forage',
    name: 'Forage',
    description: 'Search the area for anything useful.'
  },
  {
    id: 'scoutTheDark',
    name: 'Scout the Dark',
    description: 'Scout the dark before moving on.'
  }
];

function formatOdds(odds) {
  return `Negative ${odds.negative}% / Neutral ${odds.neutral}% / Positive ${odds.positive}%`;
}

export default function RestStopScreen({
  settlement,
  party,
  activeSurvivor,
  onChoose,
  result,
  onContinue
}) {
  const livingParty = useMemo(
    () => getRestParty(party, activeSurvivor),
    [party, activeSurvivor]
  );
  const [survivorId, setSurvivorId] = useState(
    livingParty.find(survivor => survivor.id === activeSurvivor?.id)?.id ||
      livingParty[0]?.id ||
      ''
  );
  const [storyReward, setStoryReward] = useState('survival');

  const choose = choiceId => {
    onChoose(choiceId, {
      survivorId,
      storyReward
    });
  };

  const selectedChoice = result ? choices.find(c => c.id === result.choiceId) : null;
  const restOdds = getRestOutcomeOdds(settlement);

  return (
    <section className="event-screen">
      <p className="eyebrow">Rest Stop</p>
      
      {!result ? (
        <>
          <h2>A Brief Shelter</h2>
          <p>There is enough time for one meaningful preparation before the hunt continues.</p>

          <div className="rest-odds-panel">
            <h3>Rest Outcome Odds</h3>
            <p>Base: {formatOdds(DEFAULT_REST_OUTCOME_ODDS)}</p>
            {restOdds.modified ? (
              <>
                <p>Current: {formatOdds(restOdds)}</p>
                <p>Embrace the Dark: worse outcomes -10%, neutral outcomes -10%, positive outcomes +20%.</p>
              </>
            ) : (
              <p>Current: {formatOdds(restOdds)}</p>
            )}
          </div>

          <div className="rest-selection-context">
            <label className="field-label" htmlFor="rest-survivor">Focus Survivor (for Practice)</label>
            <select
              id="rest-survivor"
              value={survivorId}
              onChange={event => setSurvivorId(event.target.value)}
            >
              {livingParty.map(survivor => (
                <option value={survivor.id} key={survivor.id}>
                  {survivor.name} - HP {survivor.hp}/{survivor.maxHp}, Survival {survivor.survival || 0}
                </option>
              ))}
            </select>

            <label className="field-label" htmlFor="story-reward">Share Stories reward (applies to all)</label>
            <select
              id="story-reward"
              value={storyReward}
              onChange={event => setStoryReward(event.target.value)}
            >
              <option value="survival">Gain 1 Survival each</option>
              <option value="memory">Gain 1 Memory</option>
            </select>
          </div>

          <div className="event-choices">
            {choices.map(choice => (
              <button
                type="button"
                key={choice.id}
                onClick={() => choose(choice.id)}
              >
                <strong>{choice.name}</strong>
                <span>{formatValueForDisplay(choice.description)}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="rest-result-view">
          <h2>{selectedChoice?.name || 'Rest Outcome'}</h2>
          <div className="outcome-box">
            <p className="outcome-text">{result.outcomeText}</p>
            {result.nextNodeType === 'fight' && (
              <p className="danger-text">Prepare for combat!</p>
            )}
            {result.outcomeCategory && (
              <p>Outcome category: <strong>{result.outcomeCategory}</strong></p>
            )}
            {result.healingResults?.length > 0 && (
              <div className="rest-healing-results">
                <h3>Healing Applied</h3>
                <ul>
                  {result.healingResults.map(entry => (
                    <li key={entry.survivorId}>
                      {entry.survivorName}: HP {entry.beforeHp}/{entry.maxHp} {'->'} {entry.afterHp}/{entry.maxHp}
                      {entry.healed === 0 ? ' (already at max)' : ` (+${entry.healed})`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button type="button" className="continue-button" onClick={onContinue}>
            Continue
          </button>
        </div>
      )}
    </section>
  );
}
