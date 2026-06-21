import { getPrincipleChoices } from '../../domain/principles/principleLogic.js';

export default function PrinciplesScreen({ settlement, onApplyPrinciple, onBack }) {
  const choices = getPrincipleChoices('death');

  return (
    <main className="app-shell">
      <section className="panel">
        <div className="screen-header">
          <div>
            <p className="eyebrow">Principles</p>
            <h1>Settlement Choices</h1>
          </div>
          <button className="secondary" type="button" onClick={onBack}>Back</button>
        </div>

        <div className="catalog-grid">
          {choices.map(principle => (
            <article className="catalog-card" key={principle.id}>
              <div className="image-fallback">Principle</div>
              <div>
                <h3>{principle.name}</h3>
                <p>{principle.playerSummary || principle.description || 'A permanent settlement choice.'}</p>
                <p>{principle.whereItMatters || 'Applies when its story trigger appears.'}</p>
                <button type="button" onClick={() => onApplyPrinciple(principle)}>Choose</button>
              </div>
            </article>
          ))}
        </div>

        <p className="lede">Chosen: {settlement.principles.length}</p>
      </section>
    </main>
  );
}
