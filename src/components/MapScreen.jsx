import React from 'react';

const NODE_LABELS = {
  fight: 'Fight',
  elite: 'Elite',
  event: 'Event',
  resource: 'Resource',
  craft: 'Craft',
  boss: 'Boss'
};

export default function MapScreen({
  map,
  onSelectNode,
  resources,
  revealAllNodeTypes = false,
  storytellerActive = false
}) {
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

      <div className="run-bonus-notes">
        {revealAllNodeTypes && <span>Scout Path: all node types revealed.</span>}
        {storytellerActive && (
          <span>Storyteller active: future reward choices will be expanded.</span>
        )}
      </div>

      <div className="hunt-map" aria-label="Hunt map">
        {map.map((row, rowIndex) => (
          <div key={rowIndex} className="map-row">
            <span className="map-row-label">
              {rowIndex === map.length - 1 ? 'Nemesis' : `Depth ${rowIndex + 1}`}
            </span>
            <div className="map-row-nodes">
              {row.map(node => {
                // TODO: Hide locked node types here when the hidden-map system is added.
                // Scout Path already supplies the permanent reveal flag for that system.
                const nodeLabel = NODE_LABELS[node.type];
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
                    <span className="node-type">{nodeLabel}</span>
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
