import React from 'react';
import InventoryPanel from '../components/InventoryPanel.jsx';
import { cards } from '../data/cards.js';
import { equipmentList } from '../data/equipment.js';
import { resources } from '../data/resources.js';
import { canCraft } from '../game/craftingLogic.js';

function describeEffects(item) {
  return item.effects.map(effect => {
    if (effect.type === 'addCard') {
      return `Add ${effect.copies || 1} ${cards[effect.cardId]?.name || effect.cardId} card${effect.copies === 1 ? '' : 's'}.`;
    }
    if (effect.type === 'startBlock') return `Start combat with +${effect.amount} block.`;
    if (effect.type === 'attackDamageBonus') return `Attack cards deal +${effect.amount} damage.`;
    if (effect.type === 'firstTurnDrawBonus') return `Draw +${effect.amount} card on turn 1.`;
    return effect.type;
  }).join(' ');
}

export default function CraftingScreen({ runState, onCraft, onContinue }) {
  return (
    <section className="crafting-screen">
      <p className="eyebrow">Makeshift Forge</p>
      <h2>Craft Equipment</h2>
      <InventoryPanel inventory={runState.inventory} />
      <div className="crafting-grid">
        {equipmentList.map(item => {
          const crafted = runState.craftedEquipment?.includes(item.id);
          const affordable = canCraft(item, runState.inventory, runState.craftedEquipment);
          const cost = Object.entries(item.cost)
            .map(([id, amount]) => `${resources[id]?.name || id} x${amount}`)
            .join(', ');

          return (
            <article key={item.id} className={`crafting-card ${crafted ? 'crafted' : ''}`}>
              <div className="upgrade-heading">
                <h3>{item.name}</h3>
                <span>{item.slot}</span>
              </div>
              <p>{item.description}</p>
              <p><strong>Cost:</strong> {cost}</p>
              <p><strong>Effect:</strong> {describeEffects(item)}</p>
              {!crafted && affordable && (
                <button type="button" onClick={() => onCraft(item)}>Craft</button>
              )}
              {crafted && <strong>Crafted</strong>}
              {!crafted && !affordable && <span>Missing resources</span>}
            </article>
          );
        })}
      </div>
      <button type="button" onClick={onContinue}>Return to Hunt</button>
    </section>
  );
}
