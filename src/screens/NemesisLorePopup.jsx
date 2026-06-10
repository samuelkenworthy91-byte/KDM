import React from 'react';

export default function NemesisLorePopup({ encounter, lanternYear, seen, onContinue }) {
  const intro = encounter.loreIntro;
  return (
    <section className="placeholder-screen">
      <p className="eyebrow">Lantern Year {lanternYear}</p>
      <h2>{seen ? encounter.displayName : intro.title}</h2>
      {seen
        ? <p>{encounter.repeatLoreText}</p>
        : intro.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <button type="button" onClick={onContinue}>Continue</button>
    </section>
  );
}
