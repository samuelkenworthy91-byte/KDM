export function createHuntPath() {
  return [
    { id: 'departure', type: 'departure', label: 'Departure' },
    { id: 'event-1', type: 'event', label: 'Hunt Event' },
    { id: 'resource-1', type: 'resource', label: 'Scavenge' },
    { id: 'fight-1', type: 'fight', label: 'Showdown' }
  ];
}

export function huntPathHasRequiredNodes(path) {
  const safePath = Array.isArray(path) ? path : [];
  return safePath.some(node => node.type === 'event') && safePath.some(node => node.type === 'fight');
}
