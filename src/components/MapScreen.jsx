import React from 'react';

// Displays a simple branching map. Each row contains several nodes with type names.
export default function MapScreen({ map }) {
  return (
    <div className="map-screen">
      {map.map((row, rowIndex) => (
        <div key={rowIndex} className="map-row">
          {row.map(node => (
            <div key={node.id} className={`map-node ${node.type}`}>{node.type}</div>
          ))}
        </div>
      ))}
    </div>
  );
}