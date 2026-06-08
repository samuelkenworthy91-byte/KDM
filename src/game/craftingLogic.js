// Placeholder crafting logic. Later versions will verify resource
// availability, deduct costs and apply equipment effects to the deck.

export function canCraft(item, inventory) {
  // Check if the inventory has enough resources for the item cost.
  return true;
}

export function craft(item, inventory) {
  // Deduct resources and apply equipment effects. Returns updated inventory.
  return inventory;
}