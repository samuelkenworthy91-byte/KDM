import React from 'react';

const NODE_LABELS = {
  fight: 'Fight',
  elite: 'Elite',
  event: 'Event',
  resource: 'Resource',
  rest: 'Rest Stop',
  boss: 'Boss'
};

export default function MapScreen({ map, onSelectNode, resources, onRetreat }) {
  const [confirmingRetreat, setConfirmingRetreat] = React.useState(false);
  const [retreatPending, setRetreatPending] = React.useState(false);
  const confirmRetreat = () => {
    if (retreatPending) return;
    setRetreatPending(true);
    onRetreat();
  };
  return (
    <section className="map-screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">The Hunt</p>
          <h2>Choose Your Path</h2>
        </div>
        <div className="resource-summary">
          Spoils: {resources.length ? resources.join(', ') : 'None'}
        </div>
      </header>

      {!confirmingRetreat ? (
        <button type="button" onClick={() => setConfirmingRetreat(true)}>Retreat</button>
      ) : (
        <section className="event-outcome" role="dialog" aria-labelledby="retreat-title">
          <h3 id="retreat-title">Retreat from the Hunt?</h3>
          <p>
            The party drags itself back through the dark. They keep what they have gathered so far,
            but the settlement pays the price.
          </p>
          <div className="event-choices">
            <button type="button" disabled={retreatPending} onClick={confirmRetreat}>
              {retreatPending ? 'Resolving Retreat...' : 'Confirm Retreat'}
            </button>
            <button type="button" onClick={() => setConfirmingRetreat(false)}>Continue Hunt</button>
          </div>
        </section>
      )}

      <div className="hunt-map" aria-label="Hunt map">
        {map.map((row, rowIndex) => (
          <div key={rowIndex} className="map-row">
            <span className="map-row-label">
              {rowIndex === map.length - 1 ? 'Nemesis' : `Depth ${rowIndex + 1}`}
            </span>
            <div className="map-row-nodes">
              {row.map(node => {
                const state = node.completed
                  ? 'completed'
                  : node.available
                    ? 'available'
                    : 'locked';

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`map-node ${node.type} ${state}`}
                    disabled={!node.available || node.completed}
                    onClick={() => onSelectNode(node)}
                  >
                    <span className="node-type">{NODE_LABELS[node.type]}</span>
                    <span className="node-state">
                      {node.completed ? 'Completed' : node.available ? 'Available' : 'Locked'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
