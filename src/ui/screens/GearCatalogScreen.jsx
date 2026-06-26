import { getGearCardGroups } from '../../domain/gear/gearCardGrouping.js';
import { getGearCatalog } from '../../domain/gear/gearCatalog.js';
import { getResourceCatalog } from '../../domain/resources/resourceCatalog.js';
import FlippableCard from '../components/FlippableCard.jsx';

export default function GearCatalogScreen({ onBack }) {
  const resources = getResourceCatalog();
  const gear = getGearCatalog();
  const groups = getGearCardGroups();
  const cardCount = groups.reduce((total, group) =>
    total + group.activeCards.length + group.passiveCards.length + group.unlinkedCards.length, 0);

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
          <div className="stat"><span>Cards</span><strong>{cardCount}</strong></div>
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
          <div className="gear-source-list">
            {groups.slice(0, 36).map(group => (
              <article className="gear-source" key={group.gearId}>
                <h3>{group.gearName}</h3>
                <p>{group.gearType} / {group.slot}</p>
                <div className="catalog-grid">
                  {[...group.activeCards, ...group.passiveCards, ...group.unlinkedCards].map(card => (
                    <FlippableCard key={card.id} card={card} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
