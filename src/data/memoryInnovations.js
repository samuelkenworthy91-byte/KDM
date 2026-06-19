import {
  memoryActionInnovationList,
  startingTraits
} from './innovationCards.js';

// Deprecated compatibility shim. Memory-action innovations now live in innovationCards.js.
export const memoryInnovations = Object.fromEntries(
  memoryActionInnovationList.map(innovation => [innovation.id, innovation])
);

export const memoryInnovationList = memoryActionInnovationList;
export { startingTraits };
