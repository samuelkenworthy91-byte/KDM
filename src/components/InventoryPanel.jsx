import React from 'react';
import { resources } from '../data/resources.js';

export default function InventoryPanel({ inventory = {}, compact = false }) {
  const entries = Object.values(resources).filter(
    resource => !compact || (inventory[resource.id] || 0) > 0
  );

  return (
    <aside className={`inventory-panel ${compact ? 'compact' : ''}`}>
      <h3>Inventory</h3>
      {entries.length === 0 ? (
        <p>Empty</p>
      ) : (
        <div className="inventory-grid">
          {entries.map(resource => (
            <span key={resource.id} title={resource.description}>
              {resource.name} <strong>{inventory[resource.id] || 0}</strong>
            </span>
          ))}
        </div>
      )}
    </aside>
  );
}
