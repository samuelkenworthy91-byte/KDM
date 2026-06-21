import { getCardCatalog } from '../../domain/cards/cardCatalog.js';
import { getGearCatalog } from '../../domain/gear/gearCatalog.js';
import { getResourceCatalog } from '../../domain/resources/resourceCatalog.js';
import CardPreview from '../components/CardPreview.jsx';

export default function GearCatalogScreen({ onBack }) {
  const resources = getResourceCatalog();
  const gear = getGearCatalog();
  const cards = getCardCatalog();

  return (
    <main className="app-shell">
      <section className="panel catalog-panel">
        <div className="screen-header">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Resources and Gear</h1>
          </div>
          <button className="secondary" type="button" onClick={onBack}>Back</button>
        </div>

        <div className="stats-grid">
          <div className="stat"><span>Resources</span><strong>{resources.length}</strong></div>
          <div className="stat"><span>Gear</span><strong>{gear.length}</strong></div>
          <div className="stat"><span>Cards</span><strong>{cards.length}</strong></div>
        </div>

        <section className="audit-section">
          <h2>Resource Catalog</h2>
          <div className="resource-list">
            {resources.slice(0, 24).map(resource => (
              <span key={resource.id}>{resource.name}</span>
            ))}
          </div>
        </section>

        <section className="audit-section">
          <h2>Gear / Equipment / Cards</h2>
          <div className="catalog-grid">
            {cards.slice(0, 36).map(card => <CardPreview key={card.id} card={card} />)}
          </div>
        </section>
      </section>
    </main>
  );
}
