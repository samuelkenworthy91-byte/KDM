import assetManifest from '../../../public/assets/manifest.json' with { type: 'json' };
import * as cardData from '../../data/cards.js';
import * as eventData from '../../data/events.js';
import * as gearCardData from '../../data/gear/gearCards.js';
import * as quarryData from '../../data/quarries.js';
import * as resourceData from '../../data/resources.js';

const FALLBACK_IMAGE = '';

function valuesFrom(moduleNamespace, exportNames) {
  const found = exportNames
    .map(name => moduleNamespace?.[name])
    .find(value => value && (Array.isArray(value) || typeof value === 'object'));

  if (!found) return [];
  return Array.isArray(found) ? found : Object.values(found);
}

function safeString(value, fallback) {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text && text.toLowerCase() !== 'null' ? text : fallback;
}

function inferImage(item, type) {
  const explicit = item?.image || item?.imagePath || item?.portraitPath || item?.assetPath || item?.cardImage;
  if (explicit) return safeString(explicit, FALLBACK_IMAGE);

  const id = safeString(item?.id, '');
  if (!id) return FALLBACK_IMAGE;
  if (type === 'resource') return `assets/resources/${id}.png`;
  if (type === 'quarry') return `assets/quarries/portraits/${id}.png`;
  if (type === 'gear') return `assets/gear/${id}.png`;
  if (type === 'card') return `assets/cards/${id}.png`;
  if (type === 'event') return `assets/events/${id}.png`;
  return FALLBACK_IMAGE;
}

function normaliseItem(item, fallbackType, index = 0, source = fallbackType) {
  const raw = item && typeof item === 'object' ? item : {};
  const type = safeString(raw.type || raw.eventType || raw.role || fallbackType, fallbackType);
  const id = safeString(raw.id || raw.key, `${fallbackType}-${index + 1}`);
  const name = safeString(raw.name || raw.displayName || raw.title, `Unnamed ${fallbackType} ${index + 1}`);

  return {
    ...raw,
    id,
    name,
    type,
    source: safeString(raw.source || raw.sourceType || raw.section || source, source),
    image: inferImage({ ...raw, id }, fallbackType)
  };
}

function normaliseList(items, type, source) {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map((item, index) => normaliseItem(item, type, index, source));
}

function manifestPaths() {
  return new Set((assetManifest?.assets || []).map(asset => safeString(asset.path, '')));
}

export function getGearCards() {
  const gearCards = valuesFrom(gearCardData, ['gearCards', 'curatedGearCards']);
  const cards = valuesFrom(cardData, ['cards']);
  return normaliseList([...gearCards, ...cards], 'card', 'src/data/cards').map(item => ({
    ...item,
    type: item.type === 'skill' || item.type === 'attack' || item.type === 'curse' ? item.type : item.type || 'card'
  }));
}

export function getQuarries() {
  return normaliseList(valuesFrom(quarryData, ['quarryList', 'quarries', 'quarryRegistry']), 'quarry', 'src/data/quarries');
}

export function getResources() {
  return normaliseList(valuesFrom(resourceData, ['resources']), 'resource', 'src/data/resources');
}

export function getEvents() {
  return normaliseList(valuesFrom(eventData, ['events']), 'event', 'src/data/events');
}

export function getMissingImageReferences() {
  const assets = manifestPaths();
  const allItems = [...getGearCards(), ...getQuarries(), ...getResources(), ...getEvents()];
  return allItems
    .filter(item => item.image)
    .filter(item => {
      const imagePath = item.image.replace(/^\.\//, '').replace(/^\/+/, '');
      return !assets.has(imagePath);
    })
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      image: item.image
    }));
}

export function getDuplicateContentIds() {
  const seen = new Map();
  const duplicates = new Map();
  const allItems = [...getGearCards(), ...getQuarries(), ...getResources(), ...getEvents()];

  allItems.forEach(item => {
    const id = item.id;
    if (!seen.has(id)) {
      seen.set(id, item);
      return;
    }
    duplicates.set(id, [...(duplicates.get(id) || [seen.get(id)]), item]);
  });

  return [...duplicates.entries()].map(([id, items]) => ({
    id,
    count: items.length,
    types: [...new Set(items.map(item => item.type))],
    names: [...new Set(items.map(item => item.name))]
  }));
}

export function getContentSummary() {
  const gear = getGearCards();
  const quarries = getQuarries();
  const resources = getResources();
  const events = getEvents();
  const allItems = [...gear, ...quarries, ...resources, ...events];
  const duplicateIds = getDuplicateContentIds();
  const missingImageReferences = getMissingImageReferences();
  const publicAssetFolders = [...new Set(
    (assetManifest?.assets || [])
      .map(asset => safeString(asset.path, ''))
      .filter(Boolean)
      .map(path => path.split('/').slice(0, 2).join('/'))
  )];

  return {
    quarries: quarries.length,
    resources: resources.length,
    events: events.length,
    gear: gear.length,
    cards: gear.length,
    missingNames: allItems.filter(item => item.name.startsWith('Unnamed ')).length,
    duplicateIds: duplicateIds.length,
    missingImageReferences: missingImageReferences.length,
    publicAssetFolders
  };
}
