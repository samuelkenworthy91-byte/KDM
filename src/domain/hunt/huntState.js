import { createHuntPath } from './huntPath.js';

export function createHuntState(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};
  const path = Array.isArray(raw.path) && raw.path.length ? raw.path : createHuntPath();
  const currentIndex = Math.max(0, Math.min(path.length - 1, Number(raw.currentIndex || 0)));
  return {
    id: raw.id || 'hunt-1',
    status: raw.status || 'active',
    path,
    currentIndex,
    currentNode: path[currentIndex],
    log: Array.isArray(raw.log) ? raw.log.filter(Boolean) : []
  };
}

export function advanceHunt(huntState) {
  const hunt = createHuntState(huntState);
  const nextIndex = Math.min(hunt.path.length - 1, hunt.currentIndex + 1);
  return createHuntState({
    ...hunt,
    currentIndex: nextIndex,
    status: nextIndex === hunt.path.length - 1 ? 'fight' : 'active',
    log: [...hunt.log, `Advanced to ${hunt.path[nextIndex]?.label || 'node'}.`]
  });
}

export function resolveEventNode(huntState) {
  const hunt = createHuntState(huntState);
  return advanceHunt({ ...hunt, log: [...hunt.log, 'Event node resolved.'] });
}

export function resolveFightNode(huntState, outcome = 'victory') {
  const hunt = createHuntState(huntState);
  return createHuntState({
    ...hunt,
    status: 'complete',
    log: [...hunt.log, outcome === 'victory' ? 'Fight won. Rewards pending.' : 'Fight lost. Injury pending.']
  });
}
