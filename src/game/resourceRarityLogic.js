import { resources } from '../data/resources.js';

const COMMON_RESOURCE_IDS = new Set(['bone', 'hide', 'organ', 'sinew', 'scrap', 'fur', 'claw', 'horn', 'ichor']);

export function getResourceRarityTier(resourceOrId) {
  const resource = typeof resourceOrId === 'string' ? resources[resourceOrId] : resourceOrId;
  if (!resource) return 'unknown';
  if (resource.rarityTier) return resource.rarityTier;
  if (resource.type === 'basic') return 'common';
  if (COMMON_RESOURCE_IDS.has(resource.id) && !resource.creatureId) return 'common';
  if (resource.type === 'creature') return 'creature';
  if (['rare', 'strange', 'level3Rare', 'nemesis'].includes(resource.type)) return resource.type;
  return resource.type || 'unknown';
}

export function getResourceRarityLabel(resourceOrId) {
  const labels = {
    common: 'Common',
    creature: 'Creature',
    rare: 'Rare',
    strange: 'Strange',
    level3Rare: 'Level 3 Rare',
    nemesis: 'Nemesis',
    unknown: 'Unknown / Legacy'
  };
  return labels[getResourceRarityTier(resourceOrId)] || labels.unknown;
}

export function isCommonHarvestResource(resourceOrId) {
  return getResourceRarityTier(resourceOrId) === 'common';
}
