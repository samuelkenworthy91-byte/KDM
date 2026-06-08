// Placeholder map generation logic.

// Generate a five‑row map for a run. Each row contains 2–3 nodes except
// the final row, which contains a single boss node. Nodes have a type
// such as 'fight', 'event', 'resource', 'craft' or 'boss'.
export function generateMap() {
  const map = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    const nodes = i === 4 ? 1 : Math.floor(Math.random() * 2) + 2;
    for (let j = 0; j < nodes; j++) {
      const types = ['fight', 'event', 'resource', 'craft'];
      const type = i === 4 ? 'boss' : types[Math.floor(Math.random() * types.length)];
      row.push({ id: `${i}-${j}`, type, connections: [] });
    }
    map.push(row);
  }
  // TODO: connect nodes forward to the next row
  return map;
}