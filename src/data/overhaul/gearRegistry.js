import gearDataRaw from '../../../gear_master_overhaul.json' with { type: 'json' };
import deckCardsRaw from '../../../all_deck_cards.json' with { type: 'json' };

const locationMapping = {
  'Bone Smith': 'boneSmith',
  'Skinnery': 'skinnery',
  'Organ Grinder': 'organGrinder',
  'Catarium': 'lionTrophyHall',
  'Giga-Catarium': 'lionTrophyHall',
  'Dark Catarium': 'lionTrophyHall',
  'Plumery': 'phoenixPyre',
  'Silk Mill': 'silkLoom',
  'Dragon Armory': 'crystalForge',
  'Sky Reef Sanctuary': 'shellSanctum',
  'Stone Circle': 'antelopeLarder',
  'Gormery': 'wetYard',
  'Barber Surgeon': 'organGrinder',
  'Blacksmith': 'boneSmith',
  'Leather Worker': 'skinnery',
  'Mask Maker': 'lionTrophyHall',
  'Weapon Crafter': 'boneSmith',
  'Wet Resin Crafter': 'chitinFoundry',
  'Cotton Mill': 'skinnery',
  'Hunting Hall': 'lanternHearth',
  'Blood Crafter': 'organGrinder',
  'Light Forging': 'boneSmith',
  'Green Armor': 'skinnery',
  'Exhausted Lantern Hoard': 'lanternHearth',
  'Sense Memory': 'lanternHearth',
  '': 'lanternHearth'
};

const phasePattern = /\s*\((hunt phase|showdown phase)\)\s*$/i;

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+(.)/g, (_, letter) => letter.toUpperCase());
}

function stableId(value) {
  const slug = slugify(value);
  return slug ? slug.charAt(0).toLowerCase() + slug.slice(1) : 'unnamedGear';
}

function parseArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // Fall through to delimiter parsing.
    }
    try {
      const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // Fall through to delimiter parsing.
    }
    return trimmed.split(/[,;|]/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function parseCost(value) {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return parseCost(JSON.parse(value));
    } catch {
      return value
        .split(/[,;]/)
        .map(part => part.trim())
        .filter(Boolean)
        .reduce((cost, part) => {
          const match = part.match(/^(\d+)\s+(.+)$/);
          const amount = match ? Number(match[1]) : 1;
          const name = match ? match[2] : part;
          const id = stableId(name);
          if (id) cost[id] = (cost[id] || 0) + amount;
          return cost;
        }, {});
    }
  }
  if (typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.entries(value).reduce((cost, [resourceId, amount]) => {
    const parsedAmount = Number(amount);
    if (resourceId && parsedAmount > 0) cost[resourceId] = parsedAmount;
    return cost;
  }, {});
}

function cleanPhaseName(name) {
  const withoutPhase = String(name || '').replace(phasePattern, '').trim();
  const sharedPhaseBases = [
    'Amber Cello',
    'Lantern Gong',
    'Winding Horn',
    'Scrap Horn',
    'Winged Harp',
    'Nuclear Flute',
    'Gloom Drum',
    'Beetugle',
    'Eventide',
    'Trom Bone',
    "Death's Wail",
    'Ink Bagpipes',
    "Lion's Roar",
    "Hunter's Roar",
    'Glute'
  ];
  if (/\broar$/i.test(withoutPhase)) return "Hunter's Roar";
  const sharedBase = sharedPhaseBases.find(base =>
    new RegExp(`${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i').test(withoutPhase)
  );
  if (sharedBase) return sharedBase;
  return withoutPhase;
}

function phaseForName(name) {
  const match = String(name || '').match(phasePattern);
  if (!match) return null;
  return match[1].toLowerCase().startsWith('hunt') ? 'hunt' : 'showdown';
}

const deckCardsByEquipmentName = deckCardsRaw.reduce((acc, card) => {
  const keys = [
    card.equipmentName,
    card.sourceEquipmentName,
    card.originalKdmName
  ].map(cleanPhaseName).filter(Boolean);
  keys.forEach(key => {
    if (!acc[key]) acc[key] = [];
    acc[key].push(card);
  });
  return acc;
}, {});

function cardIdsFor(item, displayName) {
  const explicitPackage = parseArray(item.ourCardPackage)
    .map(card => typeof card === 'string' ? card : card?.cardId)
    .filter(Boolean);
  const cardsFromDeck = [
    ...(deckCardsByEquipmentName[displayName] || []),
    ...(deckCardsByEquipmentName[item.originalKdmName] || [])
  ];
  if (cardsFromDeck.length) {
    const phase = phaseForName(item.ourGameName || item.name || item.originalKdmName);
    const phaseCards = phase
      ? cardsFromDeck.filter(card => phaseForName(card.equipmentName || card.sourceEquipmentName) === phase)
      : cardsFromDeck;
    return [...new Set((phaseCards.length ? phaseCards : cardsFromDeck).map(card => card.cardId).filter(Boolean))];
  }
  const detailed = parseArray(item.deckCardsDetailed)
    .map(card => card.cardId)
    .filter(Boolean);
  return [...new Set([
    ...cardsFromDeck.map(card => card.cardId).filter(Boolean),
    ...explicitPackage,
    ...detailed
  ])];
}

function isBoneThemed(item) {
  const text = [
    item.ourGameName,
    item.originalKdmName,
    item.ourWeaponType,
    ...parseArray(item.ourKeywords)
  ].join(' ').toLowerCase();
  return /\b(bone|tooth|teeth|fang|horn|claw|skull|rib|jaw|molar)\b/.test(text);
}

function isOrganResource(resourceId) {
  return /(organ|gland|eye|nerve|brain|heart|fat|ichor|sinew|tissue|sac|lung|blood|gut|stomach|tongue)/i
    .test(resourceId);
}

function sanitizeCostForBuilding(cost, buildingId, item) {
  const next = { ...cost };
  if (buildingId === 'organGrinder' && next.bone && !isBoneThemed(item)) {
    delete next.bone;
    if (!Object.keys(next).some(isOrganResource)) next.organ = Math.max(next.organ || 0, 1);
    else next.organ = next.organ || undefined;
  }
  return Object.fromEntries(Object.entries(next).filter(([, amount]) => amount > 0));
}

function assertSourceDataIsValid() {
  const failures = [];
  if (!Array.isArray(gearDataRaw) || gearDataRaw.length === 0) {
    failures.push('gear_master_overhaul.json is empty or invalid');
  } else if (gearDataRaw.length < 300) {
    failures.push(`gear_master_overhaul.json has ${gearDataRaw.length} rows; expected at least 300`);
  }
  if (!Array.isArray(deckCardsRaw) || deckCardsRaw.length === 0) {
    failures.push('all_deck_cards.json is empty or invalid');
  } else if (deckCardsRaw.length < 700) {
    failures.push(`all_deck_cards.json has ${deckCardsRaw.length} rows; expected at least 700`);
  }
  if (!gearDataRaw.some(item => item?.ourGameName === 'Acid Tooth Knife' || item?.originalKdmName === 'ACID TOOTH DAGGER')) {
    failures.push('Acid Tooth Knife is missing from gear_master_overhaul.json');
  }
  if (!gearDataRaw.some(item => item?.ourGameName === 'Amber Bow' || /AMBER BOW/i.test(item?.originalKdmName || ''))) {
    failures.push('Amber Bow is missing from gear_master_overhaul.json');
  }
  if (failures.length) {
    throw new Error(`[V8 gear source] ${failures.join('; ')}`);
  }
}

assertSourceDataIsValid();

function normalizeGear(item) {
  const rawName = item.ourGameName || item.name || item.auditDisplayName || item.originalKdmName;
  const displayName = cleanPhaseName(rawName);
  const phase = phaseForName(rawName);
  const buildingId = locationMapping[item.canonicalCraftingLocationId] ||
    item.canonicalCraftingLocationId ||
    locationMapping[item.ourCraftingLocation] ||
    item.ourCraftingLocation ||
    'lanternHearth';
  const cost = sanitizeCostForBuilding(
    parseCost(item.canonicalCraftingCost || item.ourCraftingCost),
    buildingId,
    item
  );
  const slot = item.loadoutSlot || item.ourSlot || item.slot || item.ourItemType || 'gear';
  const itemType = item.ourItemType || item.itemType || slot || 'gear';
  const cards = cardIdsFor(item, displayName);
  const firstDeckCard = [
    ...(deckCardsByEquipmentName[displayName] || []),
    ...(deckCardsByEquipmentName[item.originalKdmName] || [])
  ][0] || {};
  return {
    ...item,
    id: item.ourGameId || stableId(displayName),
    name: displayName,
    displayName,
    itemType,
    buildingId,
    locationId: buildingId,
    craftingLocationId: buildingId,
    craftingLocationName: item.canonicalCraftingLocationName || item.ourCraftingLocation || '',
    slot,
    loadoutSlot: item.loadoutSlot || item.ourSlot || slot,
    bodySlot: item.bodySlot || item.ourBodySlot || '',
    weaponType: item.ourWeaponType || item.weaponType || '',
    hands: Number(item.ourHands ?? item.hands ?? 0) || 0,
    keywords: parseArray(item.ourKeywords || item.keywords || item.tags),
    rarity: item.ourRarity || item.rarity || '',
    tier: item.ourTier || item.tier || '',
    cost,
    craftingCost: cost,
    location: item.ourCraftingLocation,
    source: item.canonicalQuarryName || item.ourHuntSource || firstDeckCard.canonicalQuarryName || item.source || '',
    quarryId: item.canonicalQuarryId || item.quarryId || firstDeckCard.canonicalQuarryId || null,
    quarryName: item.canonicalQuarryName || item.ourHuntSource || firstDeckCard.canonicalQuarryName || '',
    colorAffinity: item.colorAffinity || firstDeckCard.colorAffinity || '',
    colorAffinityName: item.colorAffinityName || firstDeckCard.colorAffinityName || '',
    loadoutCategory: item.loadoutCategory || itemType,
    isEquippable: item.isEquippable !== false,
    cardPackage: cards,
    passiveText: item.ourPassiveEffect,
    description: item.ourPassiveEffect || '',
    passiveEffects: item.passiveEffectsDetailed || [],
    phase,
    implemented: true,
    importedSource: 'v8GearRegistry'
  };
}

const normalizedRows = gearDataRaw.map(normalizeGear);

export const gearRegistry = normalizedRows.reduce((items, item) => {
  const existing = items.find(candidate => candidate.id === item.id || candidate.name === item.name);
  if (!existing) {
    items.push({
      ...item,
      phaseVariants: item.phase ? {
        [item.phase]: { cards: item.cardPackage, cardPackage: item.cardPackage }
      } : {}
    });
    return items;
  }

  existing.cardPackage = [...new Set([...existing.cardPackage, ...item.cardPackage])];
  existing.keywords = [...new Set([...existing.keywords, ...item.keywords])];
  if (item.phase) {
    existing.phaseVariants = {
      ...(existing.phaseVariants || {}),
      [item.phase]: { cards: item.cardPackage, cardPackage: item.cardPackage }
    };
  }
  existing.name = cleanPhaseName(existing.name);
  existing.displayName = existing.name;
  existing.phase = null;
  return items;
}, []);

if (!gearRegistry.some(item => item.id === 'acidToothKnife')) {
  throw new Error('[V8 gear source] acidToothKnife cannot be created from gear_master_overhaul.json');
}

export const gearById = gearRegistry.reduce((acc, item) => {
  acc[item.id] = item;
  acc[item.originalKdmName] = item;
  acc[item.ourGameName] = item;
  acc[item.displayName] = item;
  return acc;
}, {});

export function getGear(id) {
  return gearById[id] || null;
}
