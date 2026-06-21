import { getResources } from '../content/contentIndex.js';

export function getResourceCatalog() {
  return getResources().map(resource => ({
    ...resource,
    tags: resource.materialTags || [],
    image: resource.image || `assets/resources/${resource.id}.png`
  }));
}
