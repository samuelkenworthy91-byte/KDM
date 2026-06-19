import { equipment, getEquipment } from '../data/equipment.js';

export const AFFINITY_COLORS = ['red', 'blue', 'green', 'purple'];

export const AFFINITY_THRESHOLDS = [2, 4, 6];

export const AFFINITY_BONUS_TEXT = {
  red: {
    2: 'First attack each fight deals +1 damage.',
    4: 'First attack each round deals +1 damage.',
    6: 'Once per fight, after a weapon card wounds, draw 1 card.'
  },
  blue: {
    2: 'First Block card each round gives +1 Block.',
    4: 'Start combat with 2 Block.',
    6: 'Once per fight, prevent 5 damage.'
  },
  green: {
    2: 'First heal each fight heals +1 HP.',
    4: 'After combat, heal 1 HP if wounded.',
    6: 'Once per fight, remove Bleed or Poison.'
  },
  purple: {
    2: 'Choose 1 extra resource after a fight.',
    4: 'Harvest as if the quarry were 1 level higher where possible.',
    6: 'Choose from a larger reward pool after a fight.'
  }
};

export function normalizeAffinities(raw = {}) {
  const source = typeof raw === 'string' ? { [raw]: 1 } : raw || {};
  return AFFINITY_COLORS.reduce((affinities, color) => ({
    ...affinities,
    [color]: Math.max(0, Number(source[color]) || 0)
  }), {});
}

export function getItemAffinities(item = {}) {
  return normalizeAffinities(item.affinities || item.affinity || item.colorAffinity || {});
}

function resolveGearItem(itemOrId) {
  if (typeof itemOrId === 'string') return equipment[itemOrId] || getEquipment(itemOrId);
  if (itemOrId?.equipmentId) return equipment[itemOrId.equipmentId] || getEquipment(itemOrId.equipmentId);
  if (itemOrId?.id) return itemOrId;
  return null;
}

export function calculateAffinityTotals(equippedGear = []) {
  return equippedGear.reduce((totals, itemOrId) => {
    const item = resolveGearItem(itemOrId);
    const affinities = getItemAffinities(item);
    AFFINITY_COLORS.forEach(color => {
      totals[color] += affinities[color];
    });
    return totals;
  }, normalizeAffinities());
}

export function getAffinityLevel(total = 0) {
  if (total >= 6) return 3;
  if (total >= 4) return 2;
  if (total >= 2) return 1;
  return 0;
}

export function getActiveAffinityBonuses(totals = {}) {
  return AFFINITY_COLORS.flatMap(color => {
    const total = Number(totals[color]) || 0;
    return AFFINITY_THRESHOLDS
      .filter(threshold => total >= threshold)
      .map(threshold => ({
        color,
        threshold,
        label: `${capitalize(color)} ${threshold}`,
        description: AFFINITY_BONUS_TEXT[color][threshold]
      }));
  });
}

export function getAffinityCombatBonus(totals = {}) {
  return {
    affinityTotals: normalizeAffinities(totals),
    redLevel: getAffinityLevel(totals.red),
    blueLevel: getAffinityLevel(totals.blue),
    greenLevel: getAffinityLevel(totals.green),
    purpleLevel: getAffinityLevel(totals.purple),
    startingBlock: totals.blue >= 4 ? 2 : 0,
    afterCombatHealing: totals.green >= 4 ? 1 : 0
  };
}

export function getPurpleHarvestBonus(totals = {}) {
  const level = getAffinityLevel(totals.purple);
  return {
    purpleAffinityLevel: level,
    extraSelections: level >= 1 ? 1 : 0,
    quarryLevelBonus: level >= 2 ? 1 : 0,
    extraOfferCount: level >= 3 ? 2 : 0,
    rarityUpgrade: level >= 3 ? 1 : 0
  };
}

export function formatAffinityTotals(totals = {}) {
  return AFFINITY_COLORS
    .filter(color => (Number(totals[color]) || 0) > 0)
    .map(color => `${capitalize(color)} ${Number(totals[color]) || 0}`);
}

function capitalize(value) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
