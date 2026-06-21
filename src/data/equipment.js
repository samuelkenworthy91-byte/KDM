import { cards } from './cards.js';
import {
  explicitGearKeywords,
  getGearMetadata,
  weaponStyleDefinitions
} from './gearMetadata.js';
import { gearCatalog } from './gear/gearCatalog.js';
import {
  cleanGearDisplayName,
  dedupeGearList
} from '../utils/gearNormalization.js';

export const legacyCompatibilityEquipmentIds = new Set([
  'boneBlade',
  'boneBladeBroken',
  'boneHammer',
  'hideWraps',
  'rawhideVest',
  'rawhideBoots',
  'monsterGrease',
  'clawCharm'
]);

function isLegacyCompatibilityGear(item) {
  return legacyCompatibilityEquipmentIds.has(item.id);
}

const affinityColors = ['red', 'blue', 'green', 'purple'];

function normalizeAffinities(raw = {}) {
  return affinityColors.reduce((affinities, color) => ({
    ...affinities,
    [color]: Math.max(0, Number(raw[color]) || 0)
  }), {});
}

function addAffinity(base, color, value = 1) {
  if (!affinityColors.includes(color)) return base;
  return { ...base, [color]: (base[color] || 0) + value };
}

function inferGearAffinities(item, metadata = {}) {
  let affinities = normalizeAffinities(item.affinities || item.affinity || item.colorAffinity || {});
  const text = [
    item.id,
    item.name,
    item.itemType,
    item.loadoutCategory,
    item.slot,
    item.bodySlot,
    item.weaponType,
    item.passiveText,
    ...(item.keywords || []),
    ...(metadata.keywords || []),
    ...(metadata.styleTags || [])
  ].filter(Boolean).join(' ').toLowerCase();
  const hasAnyAffinity = () => affinityColors.some(color => affinities[color] > 0);

  if (item.weaponType) {
    if (['grandWeapon', 'axe', 'sword', 'katana', 'katar', 'fistAndTooth'].includes(item.weaponType)) {
      affinities = addAffinity(affinities, 'red');
    } else if (item.weaponType === 'shield') {
      affinities = addAffinity(affinities, 'blue');
      if (/(bash|spike|fang|crimson|fire|storm|surge|pounce)/.test(text)) affinities = addAffinity(affinities, 'red');
    } else if (['dagger', 'bow', 'whip', 'spear'].includes(item.weaponType)) {
      affinities = addAffinity(affinities, 'purple');
      if (/(bleed|burn|fire|axe|strike|breaker|damage|crimson|thunder|dragon|drake)/.test(text)) {
        affinities = addAffinity(affinities, 'red');
      }
    } else {
      affinities = addAffinity(affinities, 'red');
    }
  }

  if (item.loadoutCategory === 'armor' || item.itemType === 'armor' || item.bodySlot) {
    affinities = addAffinity(affinities, 'blue');
    if (/(heal|wound|warmth|bind|recovery|silk|verdant)/.test(text)) affinities = addAffinity(affinities, 'green');
    if (/(aggressive|riposte|counter|fire|drake|crimson|predator|pounce)/.test(text)) affinities = addAffinity(affinities, 'red');
  }

  if (item.loadoutCategory === 'tool' || ['tool', 'instrument', 'survivalGear', 'consumable'].includes(item.itemType)) {
    affinities = addAffinity(affinities, 'green');
    if (/(harvest|weak|eye|lens|needle|snare|hook|gauge|chalk|hunt|mark|precision|resource|loot)/.test(text)) {
      affinities = addAffinity(affinities, 'purple');
    }
    if (/(fire|burn|blood|bleed|crimson|tooth|claw|fang|damage|risky|warpaint)/.test(text)) {
      affinities = addAffinity(affinities, 'red');
    }
  }

  if (/(heal|wound|poison|cleanse|organ|flask|broth|salve|bandage|medicine|wrap)/.test(text)) {
    affinities = addAffinity(affinities, 'green');
  }
  if (/(harvest|weak|mark|marked|eye|lens|needle|knife|dagger|bow|snare|hook|hunt|loot|resource|precision)/.test(text)) {
    affinities = addAffinity(affinities, 'purple');
  }
  if (/(shield|guard|block|armor|armour|plate|shell|chitin|fortress|buckler|targe|vest|helm|greaves)/.test(text)) {
    affinities = addAffinity(affinities, 'blue');
  }
  if (/(grand|axe|cleaver|katana|sword|katar|burn|bleed|fire|drake|dragon|crimson|storm|thunder|emperor|damage)/.test(text)) {
    affinities = addAffinity(affinities, 'red');
  }

  if (!hasAnyAffinity()) affinities = addAffinity(affinities, 'green');
  return affinityColors.reduce((capped, color) => ({
    ...capped,
    [color]: affinities[color] > 0 ? 1 : 0
  }), {});
}

const currentEquipmentById = Object.fromEntries(
  gearCatalog
    .filter(item => !isLegacyCompatibilityGear(item))
    .map(item => {
      const normalized = {
        ...item,
        name: cleanGearDisplayName(item.name),
        deprecated: false,
        hiddenFromCrafting: false,
        legacySource: null,
        currentSource: 'gearOverhaulCatalog'
      };
      const metadata = getGearMetadata(normalized);
      normalized.affinities = inferGearAffinities(normalized, metadata);
      const primaryAffinity = affinityColors.find(color => normalized.affinities[color] > 0) || '';
      normalized.colorAffinity = normalized.colorAffinity || primaryAffinity;
      normalized.colorAffinityName = normalized.colorAffinityName ||
        (primaryAffinity ? `${primaryAffinity.charAt(0).toUpperCase()}${primaryAffinity.slice(1)}` : '');
      normalized.weaponType = normalized.weaponType || metadata.weaponType;
      normalized.slot = normalized.slot || metadata.slot;
      normalized.hands = Number(normalized.hands ?? metadata.hands ?? 0) || 0;
      normalized.speedStyle = metadata.speedStyle;
      normalized.styleTags = metadata.styleTags;
      normalized.keywords = [...new Set([
        ...(normalized.keywords || []),
        ...metadata.keywords
      ].filter(Boolean))];
      const cardTags = (normalized.cardPackage || [])
        .flatMap(cardId => cards[cardId]?.tags || [])
        .filter((tag, index, tags) => tags.indexOf(tag) === index);
      normalized.deckIdentity = metadata.deckIdentity || cardTags
        .filter(tag => [
          'marked', 'panic', 'block', 'survival', 'reveal', 'discard', 'wound',
          'multiHit', 'support', 'party', 'bleed', 'counter', 'exhaust'
        ].includes(tag))
        .slice(0, 3)
        .join(', ') || explicitGearKeywords[normalized.id]?.join(', ') || 'survival support';
      normalized.proficiencyXpGranted = Boolean(normalized.weaponType);
      return [normalized.id, normalized];
    })
);

export const equipmentList = dedupeGearList(Object.values(currentEquipmentById));
export const equipment = equipmentList;
export const equipmentById = Object.fromEntries(equipment.map(item => [item.id, item]));

Object.defineProperties(
  equipment,
  Object.fromEntries(
    Object.entries(equipmentById).map(([id, item]) => [id, {
      value: item,
      enumerable: false,
      configurable: false,
      writable: false
    }])
  )
);

export const equipmentCatalogList = equipmentList;

export const legacyCompatibilityEquipment = {};

export function createLegacyEquipmentPlaceholder(id) {
  return {
    id,
    name: 'Unknown Legacy Item',
    displayName: 'Unknown Legacy Item',
    currentSource: 'legacyPlaceholder',
    legacySource: 'unknownOldSaveReference',
    hiddenFromCrafting: true,
    deprecated: true,
    implemented: false,
    cardPackage: [],
    cost: {},
    passiveText: 'This saved item is from an older version and is no longer available.',
    passiveEffects: [],
    slot: 'gear',
    role: 'gear',
    tags: ['legacyCompatibility']
  };
}

export function getEquipment(id) {
  return equipmentById[id] || createLegacyEquipmentPlaceholder(id);
}

export function getEquipmentDisplayName(id) {
  return getEquipment(id).name;
}

export function validateEquipmentIds() {
  const seen = new Set();
  const duplicateIds = [];
  equipmentList.forEach(item => {
    if (seen.has(item.id)) duplicateIds.push(item.id);
    seen.add(item.id);
  });
  return {
    duplicateIds,
    resolvedDuplicateRecipeIds: []
  };
}

export function validateEquipmentCardPackages() {
  const missingCardIds = [];
  const equipmentWithNoCardPackage = [];
  let cardPackageCount = 0;

  equipmentList.forEach(item => {
    if (!Array.isArray(item.cardPackage) || item.cardPackage.length === 0) {
      equipmentWithNoCardPackage.push(item.id);
      return;
    }
    cardPackageCount += item.cardPackage.length;
    item.cardPackage.forEach(cardId => {
      if (!cards[cardId]) missingCardIds.push({ equipmentId: item.id, cardId });
    });
  });

  return { missingCardIds, equipmentWithNoCardPackage, cardPackageCount };
}

export function getMissingCardIdsFromEquipment() {
  return validateEquipmentCardPackages().missingCardIds;
}

export function validateGearVariety() {
  const warnings = [];
  equipmentList.forEach(item => {
    if (!item.weaponType && !item.keywords?.length) {
      warnings.push(`${item.id}: lacks weapon type and keywords`);
    }
    if (item.weaponType) {
      const style = weaponStyleDefinitions[item.weaponType];
      if (style && item.hands !== style.hands) {
        warnings.push(`${item.id}: incorrect hand count`);
      }
    }
  });
  warnings.forEach(message => console.warn(`[Gear variety] ${message}`));
  return warnings;
}

export function validateGearCardStyles() {
  const warnings = validateGearVariety();
  warnings.forEach(message => console.warn(`[Gear style] ${message}`));
  return [...new Set(warnings)];
}

const validation = validateEquipmentCardPackages();
if (validation.missingCardIds.length || validation.equipmentWithNoCardPackage.length) {
  console.warn('Equipment card package validation failed.', validation);
}
