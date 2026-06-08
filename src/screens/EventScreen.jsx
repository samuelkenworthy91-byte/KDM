import React, { useState } from 'react';
import { fightingArts } from '../data/fightingArts.js';
import { resources } from '../data/resources.js';

function inventoryText(resourceIds) {
  if (!resourceIds?.length) {
    return 'None';
  }

  return resourceIds.map(id => resources[id]?.name || id).join(', ');
}

export default function EventScreen({ event, runState, onChoose, onContinue }) {
  const [outcome, setOutcome] = useState('');
  const [rewards, setRewards] = useState([]);
  const [todos, setTodos] = useState([]);

  const choose = choice => {
    const result = onChoose(choice);
    setOutcome(choice.outcomeText);
    setRewards(result?.appliedEffects || []);
    setTodos(result?.todoEffects || []);
  };

  return (
    <section className="event-screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Strange Encounter</p>
          <h2>{event.name}</h2>
        </div>
        <div className="run-status">
          <span>HP {runState.hp}/{runState.maxHp}</span>
          <span>Survival {runState.survival || 0}</span>
        </div>
      </header>

      <p className="event-description">{event.description}</p>

      {!outcome ? (
        <div className="event-choice-grid">
          {event.choices.map(choice => (
            <button
              key={choice.id}
              type="button"
              className="event-choice"
              onClick={() => choose(choice)}
            >
              <strong>{choice.text}</strong>
              <span>The consequence is hidden in the dark.</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="event-outcome" role="status">
          <p>{outcome}</p>
          <div className="event-rewards">
            <strong>Rewards gained</strong>
            {rewards.length ? (
              <ul>
                {rewards.map((reward, index) => (
                  <li key={`${reward.type}-${index}`}>{reward.text}</li>
                ))}
              </ul>
            ) : <span>No lasting change.</span>}
            {todos.map(todo => <span key={todo}>{todo}</span>)}
          </div>
          <button type="button" onClick={onContinue}>Continue</button>
        </div>
      )}

      <p className="event-inventory">
        <strong>Inventory:</strong> {inventoryText(runState.resources)}
      </p>
      {!!runState.fightingArts?.length && (
        <p className="event-inventory">
          <strong>Fighting arts:</strong>{' '}
          {runState.fightingArts
            .map(id => fightingArts[id]?.name || id)
            .join(', ')}
        </p>
      )}
    </section>
  );
}
