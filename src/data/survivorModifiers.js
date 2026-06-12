import { childTraits } from './childTraits.js';
import { disorders } from './disorders.js';
import { fightingArts } from './fightingArts.js';
import { injuries } from './injuries.js';
import { startingTraits } from './memoryInnovations.js';
import { scars } from './scars.js';
import { weaponProficiencyDefinitions } from './weaponProficiency.js';
import { woundTables } from './woundTables.js';

const normalize = (entry, type, defaults = {}) => ({
  id: entry.id,
  name: entry.name,
  type,
  shortDescription:
    entry.shortDescription ||
    entry.description ||
    entry.effect ||
    entry.effectText ||
    'A lasting survivor modifier.',
  fullDescription:
    entry.fullDescription ||
    entry.description ||
    entry.effect ||
    entry.effectText ||
    'A lasting survivor modifier.',
  mechanicalEffectText:
    entry.mechanicalEffectText ||
    entry.effectText ||
    (typeof entry.effect === 'string' ? entry.effect : null) ||
    entry.description ||
    'This legacy modifier has no additional rules text.',
  tags: entry.tags || defaults.tags || [type],
  rarity: entry.rarity || defaults.rarity || 'common',
  source: entry.source || defaults.source || 'Survivor progression',
  implemented: entry.implemented !== false,
  ...entry
});

const timelineTraits = {
  blackLanternBearer: {
    id: 'blackLanternBearer',
    name: 'Black Lantern Bearer',
    effect: 'Carries a settlement memory formed in dangerous lanternlight.',
    source: 'Lantern timeline'
  },
  fastingListener: {
    id: 'fastingListener',
    name: 'Fasting Listener',
    effect: 'Endurance sharpened by listening through hunger.',
    source: 'Lantern timeline'
  },
  graveListener: {
    id: 'graveListener',
    name: 'Grave Listener',
    effect: 'Learns from the names and warnings of the dead.',
    source: 'Lantern timeline'
  },
  undergraveWalker: {
    id: 'undergraveWalker',
    name: 'Undergrave Walker',
    effect: 'Returned from a path beneath the settlement with uncommon resolve.',
    source: 'Lantern timeline'
  }
};

const woundEntries = Object.values(woundTables).flat();
const weaponMasteries = Object.values(weaponProficiencyDefinitions).map(definition => ({
  id: `weaponMastery_${definition.type}`,
  name: `${definition.name} Mastery`,
  description: definition.mastery,
  effect: `${definition.level1} ${definition.level2} Mastery: ${definition.mastery}`,
  source: 'Weapon proficiency',
  rarity: 'rare',
  tags: ['weapon', definition.type, 'mastery']
}));

export const survivorModifierRegistry = Object.fromEntries([
  ...Object.values({ ...startingTraits, ...childTraits, ...timelineTraits })
    .map(entry => normalize(entry, 'trait', { source: 'Survivor origin' })),
  ...Object.values(fightingArts).map(entry => normalize(
    entry,
    entry.effect?.type === 'monsterBane' ? 'monsterBane' : 'fightingArt',
    { source: entry.effect?.type === 'monsterBane' ? 'Quarry mastery' : 'Survivor reward' }
  )),
  ...Object.values(disorders).map(entry => normalize(entry, 'disorder', {
    source: 'Trauma',
    tags: ['disorder', 'trauma']
  })),
  ...Object.values(injuries).map(entry => normalize(entry, 'injury', {
    source: 'Wound',
    tags: ['injury', 'wound']
  })),
  ...Object.values(scars).map(entry => normalize(entry, 'scar', {
    source: 'Lasting wound',
    tags: ['scar', 'wound']
  })),
  ...woundEntries.map(entry => normalize({
    ...entry,
    id: `woundResult_${entry.id}`,
    name: `${entry.name} Wound`
  }, 'woundArt', {
    source: 'Wound table',
    tags: ['wound', entry.severity]
  })),
  ...weaponMasteries.map(entry => normalize(entry, 'weaponMastery'))
].map(entry => [entry.id, entry]));

const warnedUnknownIds = new Set();

export function getSurvivorModifier(id, expectedType = 'trait') {
  const modifier = survivorModifierRegistry[id];
  if (modifier) return modifier;
  if (!warnedUnknownIds.has(id)) {
    console.warn(`[Survivor modifiers] Unknown legacy modifier "${id}".`);
    warnedUnknownIds.add(id);
  }
  return {
    id: id || 'unknownLegacyTrait',
    name: 'Unknown legacy item',
    type: expectedType,
    shortDescription: 'This modifier came from an older save and is no longer recognized.',
    fullDescription: 'This modifier came from an older save. It is preserved so the save remains usable.',
    mechanicalEffectText: 'No current mechanical effect.',
    tags: ['legacy', 'unknown'],
    rarity: 'common',
    source: 'Legacy save',
    implemented: true
  };
}

export function getSurvivorModifiers(ids = [], expectedType) {
  return ids.map(id => getSurvivorModifier(id, expectedType));
}
