import {
  getContentSummary,
  getDuplicateContentIds,
  getGearCards,
  getMissingImageReferences
} from '../../domain/content/contentIndex.js';

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function WarningList({ title, items, renderItem }) {
  if (!items.length) return null;
  return (
    <section className="audit-section warning">
      <h2>{title}</h2>
      <ul>
        {items.slice(0, 20).map((item, index) => (
          <li key={`${title}-${item.id || index}`}>{renderItem(item)}</li>
        ))}
      </ul>
    </section>
  );
}

export default function ContentLibraryScreen() {
  const summary = getContentSummary();
  const gearCards = getGearCards();
  const duplicateIds = getDuplicateContentIds();
  const missingImages = getMissingImageReferences();
  const missingNames = gearCards.filter(item => item.name.startsWith('Unnamed '));

  return (
    <main className="app-shell library-shell">
      <section className="panel library-panel">
        <p className="eyebrow">Stage 1 audit</p>
        <h1>Content Library</h1>
        <p className="lede">
          Preserved data is loading through a defensive content index before new gameplay systems are rebuilt.
        </p>

        <div className="stats-grid">
          <Stat label="Quarries" value={summary.quarries} />
          <Stat label="Resources" value={summary.resources} />
          <Stat label="Events" value={summary.events} />
          <Stat label="Gear / cards" value={summary.gear} />
          <Stat label="Missing names" value={summary.missingNames} />
          <Stat label="Duplicate IDs" value={summary.duplicateIds} />
          <Stat label="Missing images" value={summary.missingImageReferences} />
          <Stat label="Asset folders" value={summary.publicAssetFolders.length} />
        </div>

        <section className="audit-section">
          <h2>First 20 Gear / Cards</h2>
          <div className="card-grid">
            {gearCards.slice(0, 20).map(card => (
              <article className="content-card" key={`${card.source}-${card.id}`}>
                {card.image ? (
                  <img src={`/${card.image.replace(/^\.\//, '')}`} alt="" loading="lazy" />
                ) : (
                  <div className="image-fallback">No image</div>
                )}
                <div>
                  <h3>{card.name}</h3>
                  <p>{card.type}</p>
                  <small>{card.id}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <WarningList
          title="Missing Names"
          items={missingNames}
          renderItem={item => `${item.id} uses fallback name "${item.name}"`}
        />
        <WarningList
          title="Duplicate IDs"
          items={duplicateIds}
          renderItem={item => `${item.id}: ${item.count} entries across ${item.types.join(', ')}`}
        />
        <WarningList
          title="Missing Image Paths"
          items={missingImages}
          renderItem={item => `${item.id}: ${item.image}`}
        />
      </section>
    </main>
  );
}
