export default function SettlementScreen({ settlement, onReset, onOpenGear, onOpenEvent, onOpenCombat, onStartHunt }) {
  const survivors = settlement?.survivors || [];
  const living = survivors.filter(survivor => survivor.alive).length;

  return (
    <main className="app-shell">
      <section className="panel settlement-panel">
        <div className="screen-header">
          <div>
            <p className="eyebrow">Settlement</p>
            <h1>{settlement.name}</h1>
          </div>
          <button className="secondary" type="button" onClick={onReset}>Reset Save</button>
        </div>

        <div className="stats-grid">
          <div className="stat"><span>Survivors</span><strong>{survivors.length}</strong></div>
          <div className="stat"><span>Living</span><strong>{living}</strong></div>
          <div className="stat"><span>Resources</span><strong>{settlement.resources.length}</strong></div>
          <div className="stat"><span>Memory</span><strong>{settlement.memory.length}</strong></div>
        </div>

        <section className="audit-section">
          <h2>Founders</h2>
          <div className="survivor-grid">
            {survivors.map(survivor => (
              <article className="survivor-card" key={survivor.id}>
                <h3>{survivor.name}</h3>
                <p>HP {survivor.hp}/{survivor.maxHp}</p>
                <p>Survival {survivor.survival}/{survivor.maxSurvival}</p>
                <strong>{survivor.alive ? 'Alive' : 'Dead'}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="action-row" aria-label="Future settlement systems">
          <button type="button" onClick={onStartHunt}>Start Hunt</button>
          <button type="button" onClick={onOpenEvent}>Test Event</button>
          <button type="button" onClick={onOpenCombat}>Test Fight</button>
          <button type="button">Innovations</button>
          <button type="button">Principles</button>
          <button type="button" onClick={onOpenGear}>Gear</button>
        </section>
      </section>
    </main>
  );
}
