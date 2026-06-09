import React from 'react';

const choices = [
  { id: 'bindWounds', name: 'Bind Wounds', description: 'Heal 25% of max HP.' },
  { id: 'shareStories', name: 'Share Stories', description: 'Gain 1 survival.' },
  { id: 'sharpenGear', name: 'Sharpen Gear', description: 'Your first attack next combat deals +2 damage.' },
  { id: 'keepWatch', name: 'Keep Watch', description: 'Start the next combat with +2 block.' }
];

export default function RestStopScreen({ onChoose }) {
  return (
    <section className="event-screen">
      <p className="eyebrow">Rest Stop</p>
      <h2>A Brief Shelter</h2>
      <p>There is enough time for one preparation before the hunt continues.</p>
      <div className="event-choices">
        {choices.map(choice => (
          <button type="button" key={choice.id} onClick={() => onChoose(choice.id)}>
            <strong>{choice.name}</strong>
            <span>{choice.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
