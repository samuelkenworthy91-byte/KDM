import React from 'react';
import { resources } from '../data/resources.js';

export default function InventoryPanel({ inventory = {} }) {
  const entries = Object.entries(inventory).filter(([, amount]) => amount > 0);

  return (
    <div className="inventory-panel">
      <strong>Run Inventory</strong>
      <div>
        {entries.length
          ? entries.map(([resourceId, amount]) => (
              <span key={resourceId}>{resources[resourceId]?.name || resourceId} x{amount}</span>
            ))
          : <span>Empty</span>}
      </div>
    </div>
  );
}
