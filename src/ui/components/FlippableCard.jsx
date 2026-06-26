import { useState } from 'react';
import CardPreview from './CardPreview.jsx';

export default function FlippableCard({ card, actions }) {
  const [isBackVisible, setIsBackVisible] = useState(false);

  return (
    <article className="flippable-card">
      <button
        className="card-inspect"
        type="button"
        onClick={() => setIsBackVisible(value => !value)}
        aria-label={`Inspect ${card?.name || 'card'}`}
      >
        <CardPreview card={card} side={isBackVisible ? 'back' : 'front'} />
      </button>
      {actions ? <div className="card-actions">{actions}</div> : null}
    </article>
  );
}

