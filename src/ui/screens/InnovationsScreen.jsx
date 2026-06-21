import { useState } from 'react';
import { drawInnovation } from '../../domain/innovations/innovationLogic.js';

export default function InnovationsScreen({ settlement, onApplyInnovation, onBack }) {
  const [drawn, setDrawn] = useState(null);

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="screen-header">
          <div>
            <p className="eyebrow">Innovations</p>
            <h1>Innovation Deck</h1>
          </div>
          <button className="secondary" type="button" onClick={onBack}>Back</button>
        </div>

        <button type="button" onClick={() => setDrawn(drawInnovation(settlement))}>Draw Innovation</button>

        {drawn ? (
          <article className="catalog-card innovation-card">
            <div className="image-fallback">Idea</div>
            <div>
              <h2>{drawn.name}</h2>
              <p>{drawn.description || 'A safe settlement innovation.'}</p>
              <p>{drawn.unlockText || drawn.unlockSource || 'Use this in future settlement systems.'}</p>
              <ul className="effect-list">
                {(drawn.effects || ['Unlocks a future settlement option.']).map(effect => <li key={effect}>{effect}</li>)}
              </ul>
              <button type="button" onClick={() => onApplyInnovation(drawn)}>Apply Innovation</button>
            </div>
          </article>
        ) : null}

        <p className="lede">Known innovations: {settlement.innovations.length}</p>
      </section>
    </main>
  );
}
