import React from 'react';
import { equipment } from '../data/equipment.js';

export default function EquipmentPanel({ craftedEquipment = [] }) {
  const names = craftedEquipment.map(itemId => equipment[itemId]?.name || itemId);

  return (
    <aside className="equipment-panel">
      <h3>Equipment</h3>
      <p>{names.length ? names.join(', ') : 'None crafted'}</p>
    </aside>
  );
}
