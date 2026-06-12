import React from 'react';
import { formatValueForDisplay } from '../utils/formatters.js';

export default function NemesisLorePopup({ encounter, lanternYear, seen, onContinue }) {
  const intro = encounter.loreIntro;
  return (
    <section className="placeholder-screen">
      <p className="eyebrow">Lantern Year {lanternYear}</p>
      <h2>{formatValueForDisplay(seen ? encounter.displayName : intro.title)}</h2>
      {seen
        ? <p>{formatValueForDisplay(encounter.repeatLoreText)}</p>
        : intro.paragraphs.map((paragraph, index) => (
          <p key={`nemesis-lore-${index}`}>{formatValueForDisplay(paragraph)}</p>
        ))}
      <button type="button" onClick={onContinue}>Continue</button>
    </section>
  );
}
