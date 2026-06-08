import React from 'react';

const NODE_LABELS = {
  fight: 'Fight',
  elite: 'Elite',
  event: 'Event',
  resource: 'Resource',
  workshop: 'Workshop',
  boss: 'Boss'
};

export default function MapScreen({ map, onSelectNode, resources }) {
  return (
    <section className="map-screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">The Hunt</p>
          <h2>Choose Your Path</h2>
        </div>
        <div className="resource-summary">
          Gathered: {resources.length ? resources.join(', ') : 'None'}
        </div>
      </header>

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
