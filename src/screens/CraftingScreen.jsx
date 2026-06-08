import React from 'react';
import EquipmentPanel from '../components/EquipmentPanel.jsx';
import InventoryPanel from '../components/InventoryPanel.jsx';
import { equipmentList } from '../data/equipment.js';
import { resources } from '../data/resources.js';
import { canCraft } from '../game/craftingLogic.js';

function formatCost(cost) {
  return Object.entries(cost)
    .map(([resourceId, amount]) => `${amount} ${resources[resourceId]?.name || resourceId}`)
    .join(', ');
}

export default function CraftingScreen({
  inventory,
  craftedEquipment,
  onCraft,
  onReturn
}) {
  return (
    <section className="crafting-screen">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Makeshift Forge</p>
          <h2>Crafting</h2>
        </div>
        <button type="button" onClick={onReturn}>Return to Map</button>
      </header>

      <div className="status-panels">
        <InventoryPanel inventory={inventory} />
        <EquipmentPanel craftedEquipment={craftedEquipment} />
      </div>

      <div className="recipe-grid" aria-label="Equipment recipes">
        {equipmentList.map(item => {
          const owned = item.slot !== 'consumable' && craftedEquipment.includes(item.id);
          const craftable = !owned && canCraft(item, inventory);

          return (
            <article key={item.id} className={`recipe-card ${craftable ? 'craftable' : ''}`}>
              <span className="recipe-slot">{item.slot}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p className="recipe-cost">Cost: {formatCost(item.cost)}</p>
              {owned ? (
                <strong className="crafted-label">Already crafted</strong>
              ) : (
                <button type="button" disabled={!craftable} onClick={() => onCraft(item)}>
                  {craftable ? 'Craft' : 'Missing resources'}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
