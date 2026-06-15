import gearDataRaw from '../../../.agents/gear-card-overhaul/gear_card_package_table.json' with { type: 'json' };
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
  'Wet Resin Crafter': 'chitinFoundry'
};

export const gearRegistry = gearDataRaw.map(item => {
  const buildingId = locationMapping[item.ourCraftingLocation] || item.ourCraftingLocation || 'boneSmith';
  return {
    ...item,
    id: item.ourGameId || item.originalKdmName.toLowerCase().replace(/\s+/g, '_'),
    name: item.ourGameName,
    buildingId,
    locationId: buildingId,
    slot: item.ourSlot,
    weaponType: item.ourWeaponType,
    hands: item.ourHands,
    keywords: item.ourKeywords,
    rarity: item.ourRarity,
    tier: item.ourTier,
    cost: item.ourCraftingCost,
    location: item.ourCraftingLocation,
    source: item.ourHuntSource,
    cardPackage: (item.deckCardsDetailed || []).map(c => c.cardId),
    passiveText: item.ourPassiveEffect,
    passiveEffects: item.passiveEffectsDetailed || []
  };
});

export const gearById = gearRegistry.reduce((acc, item) => {
  acc[item.id] = item;
  acc[item.originalKdmName] = item; // Fallback for legacy
  return acc;
}, {});

export function getGear(id) {
  return gearById[id] || null;
}
