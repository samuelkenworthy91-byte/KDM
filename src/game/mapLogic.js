const TYPE_WEIGHTS = {
  1: ['fight', 'fight', 'fight', 'event', 'event', 'resource', 'rest', 'elite'],
  2: ['fight', 'fight', 'fight', 'fight', 'event', 'event', 'resource', 'elite', 'elite', 'rest'],
  3: ['fight', 'fight', 'fight', 'fight', 'fight', 'event', 'event', 'event', 'resource', 'elite', 'elite', 'elite', 'rest']
};

function randomType(level) {
  const pool = TYPE_WEIGHTS[level] || TYPE_WEIGHTS[1];
  return pool[Math.floor(Math.random() * pool.length)];
}

function connectRows(currentRow, nextRow) {
  currentRow.forEach((node, index) => {
    const projectedIndex =
      currentRow.length === 1
        ? 0
        : Math.round((index / (currentRow.length - 1)) * (nextRow.length - 1));
    const connections = new Set([nextRow[projectedIndex].id]);

    if (nextRow.length > 1 && Math.random() < 0.65) {
      const adjacentIndex =
        projectedIndex === nextRow.length - 1 ? projectedIndex - 1 : projectedIndex + 1;
      connections.add(nextRow[adjacentIndex].id);
    }
    node.connections = [...connections];
  });

  nextRow.forEach((nextNode, index) => {
    if (!currentRow.some(node => node.connections.includes(nextNode.id))) {
      const sourceIndex =
        nextRow.length === 1
          ? 0
          : Math.round((index / (nextRow.length - 1)) * (currentRow.length - 1));
      currentRow[sourceIndex].connections.push(nextNode.id);
    }
  });
}

export function generateMap(level = 1) {
  const safeLevel = Math.max(1, Math.min(3, level));
  const totalRows = 6 + safeLevel;
  const mandatoryEliteRows = safeLevel === 3
    ? new Set([Math.floor(totalRows / 2) - 1, totalRows - 2])
    : safeLevel === 2
      ? new Set([totalRows - 2])
      : new Set();

  const map = Array.from({ length: totalRows - 1 }, (_, row) => {
    const mandatoryElite = mandatoryEliteRows.has(row);
    const size = mandatoryElite ? 1 : Math.floor(Math.random() * 2) + 2;
    return Array.from({ length: size }, (_, column) => ({
      id: `${row}-${column}`,
      row,
      column,
      type: mandatoryElite ? 'elite' : randomType(safeLevel),
      connections: [],
      completed: false,
      available: row === 0
    }));
  });

  map.push([{
    id: `${totalRows - 1}-0`,
    row: totalRows - 1,
    column: 0,
    type: 'boss',
    connections: [],
    completed: false,
    available: false
  }]);

  for (let row = 0; row < map.length - 1; row += 1) {
    connectRows(map[row], map[row + 1]);
  }
  return map;
}

export function completeMapNode(map, nodeId) {
  const selectedNode = map.flat().find(node => node.id === nodeId);
  if (!selectedNode) return map;

  return map.map(row =>
    row.map(node => {
      if (node.id === nodeId) return { ...node, completed: true, available: false };
      if (selectedNode.connections.includes(node.id)) return { ...node, available: true };
      return { ...node, available: false };
    })
  );
}
