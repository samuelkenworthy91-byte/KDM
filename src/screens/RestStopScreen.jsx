import React, { useMemo, useState } from 'react';
import { getMemoryBalance } from '../game/memoryEconomy.js';
import {
  getForgettableRestCards,
  getRestParty
} from '../game/restStopLogic.js';
import { formatValueForDisplay } from '../utils/formatters.js';

const choices = [
  {
    id: 'bindWounds',
    name: 'Bind Wounds',
    description: 'Heal one living survivor for 25% of max HP and treat one light wound.'
  },
  {
    id: 'prepareNextFight',
    name: 'Prepare the Next Fight',
    description: 'The first attack in the next combat deals +2 damage.'
  },
  {
    id: 'keepWatch',
    name: 'Keep Watch',
    description: 'Start the next combat with 4 block and receive a clearer warning at the next event.'
  },
  {
    id: 'shareStories',
    name: 'Share Stories',
    description: 'Give one survivor 1 Survival, or preserve the story as 1 settlement Memory.'
  },
  {
    id: 'forgetBurden',
    name: 'Forget a Burden',
    description: 'Spend 1 settlement Memory to permanently forget one eligible personal card.'
  },
  {
    id: 'repairGear',
    name: 'Repair Gear',
    description: 'Reinforce straps and edges. Start the next combat with 5 additional block.'
  },
  {
    id: 'studyTracks',
    name: 'Study Tracks',
    description: 'Prepare for the path ahead: warn of an event, reveal connected nodes, or wound the next quarry.'
  }
];

export default function RestStopScreen({
  settlement,
  party,
  activeSurvivor,
  onChoose
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
  const [trackStudy, setTrackStudy] = useState('saferEvent');
  const selectedSurvivor = livingParty.find(survivor => survivor.id === survivorId);
  const forgettableCards = useMemo(
    () => getForgettableRestCards(settlement, activeSurvivor),
    [settlement, activeSurvivor]
  );
  const [cardId, setCardId] = useState('');
  const memoryBalance = getMemoryBalance(settlement);

  const choiceState = choiceId => {
    if (choiceId === 'bindWounds') {
      const wounded = selectedSurvivor && (
        selectedSurvivor.hp < selectedSurvivor.maxHp ||
        Object.values(selectedSurvivor.hitLocations || {})
          .some(wound => wound.wounded && !wound.severe)
      );
      return wounded ? {} : { disabled: true, reason: 'Choose a living survivor with wounds.' };
    }
    if (choiceId === 'shareStories' && storyReward === 'survival' &&
      selectedSurvivor?.survival >= (selectedSurvivor?.maxSurvival || 3)) {
      return { disabled: true, reason: 'This survivor already has maximum Survival.' };
    }
    if (choiceId === 'forgetBurden') {
      if (memoryBalance < 1) return { disabled: true, reason: 'Requires 1 settlement Memory.' };
      if (!forgettableCards.length) {
        return { disabled: true, reason: 'No eligible personal cards can be forgotten.' };
      }
      if (!cardId) return { disabled: true, reason: 'Choose a card to forget.' };
    }
    return {};
  };

  const choose = choiceId => {
    onChoose(choiceId, {
      survivorId,
      storyReward,
      trackStudy,
      cardId
    });
  };

  return (
    <section className="event-screen">
      <p className="eyebrow">Rest Stop</p>
      <h2>A Brief Shelter</h2>
      <p>There is enough time for one meaningful preparation before the hunt continues.</p>
      <p className="muted-text">Settlement Memory available: {memoryBalance}</p>

      <label className="field-label" htmlFor="rest-survivor">Survivor</label>
      <select
        id="rest-survivor"
        value={survivorId}
        onChange={event => {
          setSurvivorId(event.target.value);
          setCardId('');
        }}
      >
        {livingParty.map(survivor => (
          <option value={survivor.id} key={survivor.id}>
            {survivor.name} - HP {survivor.hp}/{survivor.maxHp}, Survival {survivor.survival || 0}
          </option>
        ))}
      </select>

      <div className="rest-option-controls">
        <label className="field-label" htmlFor="story-reward">Story reward</label>
        <select
          id="story-reward"
          value={storyReward}
          onChange={event => setStoryReward(event.target.value)}
        >
          <option value="survival">Gain 1 Survival</option>
          <option value="memory">Gain 1 settlement Memory</option>
        </select>

        <label className="field-label" htmlFor="track-study">Track study</label>
        <select
          id="track-study"
          value={trackStudy}
          onChange={event => setTrackStudy(event.target.value)}
        >
          <option value="saferEvent">Clearer warning at the next event</option>
          <option value="revealNodes">Reveal connected node types</option>
          <option value="woundQuarry">Next quarry starts slightly wounded</option>
        </select>

        <label className="field-label" htmlFor="forget-card">
          Card for {activeSurvivor?.name || 'active survivor'} to forget
        </label>
        <select
          id="forget-card"
          value={cardId}
          onChange={event => setCardId(event.target.value)}
        >
          <option value="">Choose an eligible card</option>
          {forgettableCards.map(entry => (
            <option value={entry.cardId} key={entry.cardId}>{entry.name}</option>
          ))}
        </select>
      </div>

      <div className="event-choices">
        {choices.map(choice => {
          const state = choiceState(choice.id);
          return (
            <button
              type="button"
              key={choice.id}
              disabled={state.disabled}
              title={state.reason || ''}
              onClick={() => choose(choice.id)}
            >
              <strong>{choice.name}</strong>
              <span>{formatValueForDisplay(choice.description)}</span>
              {state.reason && <small>{state.reason}</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
