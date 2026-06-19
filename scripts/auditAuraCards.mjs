import { cards } from '../src/data/cards.js';

const allCards = Array.isArray(cards) ? cards : Object.values(cards);
const auraCards = allCards.filter(card =>
  card.tags?.includes?.('aura') || card.tags?.includes?.('Aura')
);

const rows = auraCards.map(card => ({
  id: card.id,
  name: card.name,
  cost: card.cost,
  exhaust: Boolean(card.exhaust),
  duration: [...new Set((card.effects || [])
    .filter(effect => effect.type === 'aura')
    .map(effect => effect.duration || 'combat'))].join(', '),
  tags: card.tags || []
}));

console.table(rows);

const invalid = rows.filter(row =>
  ![2, 3].includes(Number(row.cost)) ||
  !row.exhaust ||
  !String(row.duration).split(',').map(value => value.trim()).every(value => value === 'combat')
);

if (invalid.length) {
  console.error('Invalid aura cards:', invalid);
  process.exitCode = 1;
}
