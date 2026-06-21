export default function HuntScreen({ huntState, onAdvance, onOpenEvent, onOpenFight, onReturn }) {
  const node = huntState.currentNode;

  function handleNode() {
    if (node?.type === 'event') return onOpenEvent();
    if (node?.type === 'fight') return onOpenFight();
    return onAdvance();
  }

  return (
    <main className="app-shell">
      <section className="panel hunt-screen">
        <div className="screen-header">
          <div>
            <p className="eyebrow">Hunt path</p>
            <h1>{node?.label || 'Unknown Node'}</h1>
          </div>
          <button className="secondary" type="button" onClick={onReturn}>Return</button>
        </div>

        <div className="hunt-path">
          {huntState.path.map((pathNode, index) => (
            <div className={index === huntState.currentIndex ? 'hunt-node active' : 'hunt-node'} key={pathNode.id}>
              <span>{index + 1}</span>
              <strong>{pathNode.label}</strong>
              <small>{pathNode.type}</small>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleNode}>
          {node?.type === 'event' ? 'Resolve Event' : node?.type === 'fight' ? 'Start Fight' : 'Advance'}
        </button>
      </section>
    </main>
  );
}
