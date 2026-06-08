const MAP_ROWS = 5;
const NODE_TYPES = ['fight', 'elite', 'event', 'resource', 'workshop'];

function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function connectRows(currentRow, nextRow) {
  currentRow.forEach((node, index) => {
    const projectedIndex =
      currentRow.length === 1
        ? 0
        : Math.round((index / (currentRow.length - 1)) * (nextRow.length - 1));
    const connections = new Set([nextRow[projectedIndex].id]);

    if (nextRow.length > 1 && Math.random() < 0.7) {
      const adjacentIndex =
        projectedIndex === nextRow.length - 1 ? projectedIndex - 1 : projectedIndex + 1;
      connections.add(nextRow[adjacentIndex].id);
    }

    node.connections = [...connections];
  });

  nextRow.forEach((nextNode, index) => {
    const hasIncomingConnection = currentRow.some(node =>
      node.connections.includes(nextNode.id)
    );

    if (!hasIncomingConnection) {
      const sourceIndex =
        nextRow.length === 1
          ? 0
          : Math.round((index / (nextRow.length - 1)) * (currentRow.length - 1));
      currentRow[sourceIndex].connections.push(nextNode.id);
    }
  });
}

export function generateMap() {
  const rowSizes = Array.from(
    { length: MAP_ROWS - 1 },
    () => Math.floor(Math.random() * 2) + 2
  );
  const nodeCount = rowSizes.reduce((total, size) => total + size, 0);
  const typePool = shuffle([
    ...NODE_TYPES,
    ...Array.from(
      { length: nodeCount - NODE_TYPES.length },
      () => NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)]
    )
  ]);

  let typeIndex = 0;
  const map = rowSizes.map((size, row) =>
    Array.from({ length: size }, (_, column) => ({
      id: `${row}-${column}`,
      row,
      column,
      type: typePool[typeIndex++],
      connections: [],
      completed: false,
      available: row === 0
    }))
  );

  map.push([
    {
      id: '4-0',
      row: 4,
      column: 0,
      type: 'boss',
      connections: [],
      completed: false,
      available: false
    }
  ]);

  for (let row = 0; row < map.length - 1; row += 1) {
    connectRows(map[row], map[row + 1]);
  }

  return map;
}

export function completeMapNode(map, nodeId) {
  const selectedNode = map.flat().find(node => node.id === nodeId);

  if (!selectedNode) {
    return map;
  }

  return map.map(row =>
    row.map(node => {
      if (node.id === nodeId) {
        return { ...node, completed: true, available: false };
      }

      if (selectedNode.connections.includes(node.id)) {
        return { ...node, available: true };
      }

      return { ...node, available: false };
    })
  );
}
