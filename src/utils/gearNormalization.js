import { innovations } from '../data/innovations.js';

const LOCATION_LABELS = {
  lanternHearth: 'Starting / Basic',
  boneSmith: 'Bone Smith',
  skinnery: 'Skinnery',
  organGrinder: 'Organ Grinder',
  lionTrophyHall: 'Catarium',
  antelopeLarder: 'Stone Circle',
  phoenixPyre: 'Plumery',
  silkLoom: 'Silk Mill',
  wetYard: 'Gormery',
  redTannery: 'Red Tannery',
  stormShrine: 'Storm Shrine',
  duelistGarden: 'Duelist Garden',
  smogKiln: 'Smog Kiln',
  chitinFoundry: 'Chitin Foundry',
  crystalForge: 'Dragon Armory',
  shellSanctum: 'Sky Reef Sanctuary',
  prideHall: 'Pride Hall'
};

const CREATURE_SOURCES = [
  [['white lion', 'pale hunt lion', 'lion'], 'paleHuntLion'],
  [['screaming antelope', 'wailing antelope', 'antelope'], 'wailingAntelope'],
  [['phoenix', 'ash phoenix'], 'ashPhoenix'],
  [['gorm'], 'frogdog'],
  [['frogdog'], 'frogdog'],
  [['spidicules', 'silk matriarch', 'silk'], 'silkMatriarch'],
  [['rose knight', 'bloom knight'], 'bloomKnight'],
  [['smog singer', 'smog'], 'smogSingers'],
  [['dung beetle knight', 'chitin crusader', 'beetle'], 'chitinCrusader'],
  [['dragon king', 'drake emperor', 'dragon', 'drake'], 'drakeEmperor'],
  [['sunstalker', 'sun sovereign', 'sky reef'], 'sunSovereign'],
  [['pride king'], 'prideKing'],
  [['crimson crocodile', 'crocodile'], 'crimsonCrocodile'],
  [['bloated godling'], 'bloatedGodling']
];

const SPECIAL_UNLOCK_METHODS = new Set(['promoOrEvent', 'rareHarvestOrEvent']);

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function formatReadableLabel(value) {
  if (!value) return '';
  if (LOCATION_LABELS[value]) return LOCATION_LABELS[value];
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, letter => letter.toUpperCase())
    .trim();
}

function getGearIdentityKeys(item) {
  const id = item?.id || item?.gearId || item?.cardId || item?.ourGameId;
  const nameSlug = slugify(getGearDisplayName(item));
  return [
    id ? `id:${slugify(id)}` : null,
    nameSlug ? `name:${nameSlug}` : null
  ].filter(Boolean);
}

function getMetadataScore(item) {
  return [
    item?.id,
    getGearDisplayName(item),
    item?.cost && Object.keys(item.cost).length,
    item?.cardPackage?.length,
    item?.buildingId || item?.ourCraftingLocation,
    item?.description || item?.passiveText,
    item?.unlockRequirement || item?.ourUnlockMethod,
    item?.implemented
  ].reduce((score, value) => score + (value ? 1 : 0), 0);
}

export function getGearDisplayName(item = {}) {
  return item.ourGameName ||
    item.auditDisplayName ||
    item.originalKdmName ||
    item.name ||
    item.id ||
    'Unnamed gear';
}

export function getGearStableId(item = {}) {
  const id = item.id || item.gearId || item.cardId || item.ourGameId;
  if (id) return slugify(id);
  return slugify(getGearDisplayName(item)) || 'unnamed_gear';
}

export function isCraftableGear(item) {
  return Boolean(
    item &&
    getGearStableId(item) &&
    item.cost &&
    typeof item.cost === 'object' &&
    !Array.isArray(item.cost) &&
    Array.isArray(item.cardPackage)
  );
}

export function dedupeGearList(items = []) {
  const deduped = [];
  const keyOwners = new Map();

  [...items]
    .filter(isCraftableGear)
    .sort((a, b) => getMetadataScore(b) - getMetadataScore(a))
    .forEach(item => {
      const keys = getGearIdentityKeys(item);
      const existingIndex = keys
        .map(key => keyOwners.get(key))
        .find(index => index !== undefined);

      if (existingIndex !== undefined) {
        keys.forEach(key => keyOwners.set(key, existingIndex));
        return;
      }

      const index = deduped.length;
      deduped.push({
        ...item,
        stableId: getGearStableId(item)
      });
      keys.forEach(key => keyOwners.set(key, index));
    });

  return deduped.sort((a, b) =>
    getGearDisplayName(a).localeCompare(getGearDisplayName(b))
  );
}

export function normaliseCraftingLocation(item = {}) {
  const rawLocation = item.ourCraftingLocation ||
    item.kdmSettlementLocationOrSource ||
    item.ourSettlementSource ||
    item.location ||
    item.locationId ||
    item.buildingId;
  const unlockMethods = Array.isArray(item.ourUnlockMethod) ? item.ourUnlockMethod : [];

  if (!rawLocation || rawLocation === 'Anywhere') {
    return unlockMethods.some(method => SPECIAL_UNLOCK_METHODS.has(method))
      ? 'Event / Rare / Special Gear'
      : 'Unassigned / Needs Source Review';
  }

  return formatReadableLabel(rawLocation);
}

export function normaliseCreatureSource(item = {}) {
  if (item.quarryId) return item.quarryId;
  const rawSource = item.kdmMonsterOrEventSource ||
    item.ourHuntSource ||
    item.source ||
    '';
  const normalized = String(rawSource).toLowerCase();

  if (!normalized || normalized === 'settlement' || normalized.includes('promo/anywhere')) {
    return null;
  }

  const match = CREATURE_SOURCES.find(([needles]) =>
    needles.some(needle => normalized.includes(needle))
  );
  return match?.[1] || formatReadableLabel(rawSource);
}

export function getGearUnlockState(item, settlement = {}) {
  const builtInnovations = settlement.builtInnovations || [];
  const discoveredQuarries = new Set([
    ...(settlement.discoveredQuarries || []),
    ...(settlement.unlockedQuarries || []),
    ...(settlement.unlockedRecipeFamilies || [])
  ]);
  const location = normaliseCraftingLocation(item);
  const creatureId = normaliseCreatureSource(item);
  const buildingId = item.buildingId || item.locationId;

  if (buildingId && innovations[buildingId]) {
    const unlocked = builtInnovations.includes(buildingId);
    return {
      unlocked,
      reason: unlocked ? '' : `Requires ${innovations[buildingId].name}`
    };
  }

  if (builtInnovations.includes(buildingId) || builtInnovations.includes(location)) {
    return { unlocked: true, reason: '' };
  }

  if (creatureId && discoveredQuarries.has(creatureId)) {
    return { unlocked: true, reason: '' };
  }

  if (creatureId) {
    return {
      unlocked: false,
      reason: `Requires access to ${formatReadableLabel(creatureId)} resources`
    };
  }

  const unlockMethods = Array.isArray(item.ourUnlockMethod) ? item.ourUnlockMethod : [];
  if (unlockMethods.some(method => SPECIAL_UNLOCK_METHODS.has(method))) {
    return {
      unlocked: false,
      reason: item.methodToMakeDetailed || 'Requires the associated event or rare unlock'
    };
  }

  return {
    unlocked: false,
    reason: `Requires ${location}`
  };
}

export function groupGearByArmouryTab(
  items = [],
  settlementState = null,
  { includeLocked = true } = {}
) {
  const groups = {};

  dedupeGearList(items).forEach(item => {
    if (
      settlementState &&
      !includeLocked &&
      !getGearUnlockState(item, settlementState).unlocked
    ) {
      return;
    }

    const location = normaliseCraftingLocation(item);
    const creature = normaliseCreatureSource(item);
    const source = creature || 'General';

    if (!groups[location]) groups[location] = {};
    if (!groups[location][source]) groups[location][source] = [];
    groups[location][source].push(item);
  });

  return groups;
}
