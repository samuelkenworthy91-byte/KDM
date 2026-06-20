import { childTraits } from '../data/childTraits.js';
import { disorders } from '../data/disorders.js';
import { getEquipment } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { scars } from '../data/scars.js';
import {
  createWeaponProficiency,
  weaponProficiencyDefinitions
} from '../data/weaponProficiency.js';

function compact(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function titleCase(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function passive({
  id,
  name,
  sourceType,
  sourceName,
  timing = 'Always',
  text,
  active = true,
  reason = '',
  tags = []
}) {
  return {
    id: String(id || `${sourceType}:${name || 'unknown'}`),
    name: name || titleCase(id),
    sourceType,
    sourceName: sourceName || name || titleCase(id),
    timing,
    text: text || reason || '',
    active: Boolean(active),
    reason: reason || '',
    tags: compact(tags)
  };
}

function quarryName(id) {
  return titleCase(String(id || '').replace(/^monsterBane_/, ''));
}

function fightingArtPassives(survivor = {}, currentQuarryId) {
  return compact(survivor.fightingArts).map(id => {
    const art = fightingArts[id];
    if (id.startsWith('monsterBane_')) {
      const quarryId = art?.effect?.quarryId || id.replace(/^monsterBane_/, '');
      const active = !currentQuarryId || currentQuarryId === quarryId;
      return passive({
        id,
        name: art?.name || `Monster Bane: ${quarryName(quarryId)}`,
        sourceType: 'Monster Bane',
        sourceName: art?.name || `Monster Bane: ${quarryName(quarryId)}`,
        timing: 'Conditional',
        text: art?.description || `Monster Bane against ${quarryName(quarryId)}.`,
        active,
        reason: active ? 'Matching quarry' : `Requires ${quarryName(quarryId)}`,
        tags: ['monsterBane', quarryId]
      });
    }
    if (!art) {
      return passive({
        id,
        name: titleCase(id),
        sourceType: 'Fighting Art',
        sourceName: 'Unknown Fighting Art',
        timing: 'Inactive',
        text: 'Legacy fighting art data is not available.',
        active: false,
        reason: 'Unknown legacy fighting art',
        tags: ['legacy']
      });
    }
    return passive({
      id,
      name: art.name,
      sourceType: 'Fighting Art',
      sourceName: art.name,
      timing: art.trigger ? 'Conditional' : 'Always',
      text: art.description || art.trigger || '',
      reason: art.trigger || '',
      tags: art.tags || []
    });
  });
}

function proficiencyPassives(survivor = {}) {
  const proficiency = createWeaponProficiency(survivor.weaponProficiency);
  return Object.entries(proficiency).flatMap(([type, progress]) => {
    const definition = weaponProficiencyDefinitions[type];
    if (!definition || !progress?.level) return [];
    const tiers = [
      ['level1', 1, 'Conditional'],
      ['level2', 2, 'Conditional'],
      ['mastery', 3, 'Once per fight']
    ];
    return tiers
      .filter(([, level]) => progress.level >= level)
      .map(([key, level, timing]) => passive({
        id: `weaponProficiency:${type}:${key}`,
        name: `${definition.name} ${level === 3 ? 'Mastery' : `Level ${level}`}`,
        sourceType: 'Weapon Proficiency',
        sourceName: definition.name,
        timing,
        text: definition[key],
        reason: `${progress.xp} XP`,
        tags: ['weaponProficiency', type]
      }));
  });
}

function traitPassives(survivor = {}) {
  return compact(survivor.traits).map(id => {
    const trait = childTraits[id];
    return passive({
      id,
      name: trait?.name || titleCase(id),
      sourceType: 'Trait',
      sourceName: trait?.name || 'Unknown Trait',
      timing: trait ? 'Always' : 'Inactive',
      text: trait?.effectText || trait?.description || 'Legacy trait data is not available.',
      active: Boolean(trait),
      reason: trait ? '' : 'Unknown legacy trait',
      tags: trait ? ['trait'] : ['legacy']
    });
  });
}

function scarPassives(survivor = {}) {
  return compact(survivor.scars).map(id => {
    const scar = scars[id];
    return passive({
      id,
      name: scar?.name || titleCase(id),
      sourceType: 'Scar',
      sourceName: scar?.source || scar?.name || 'Unknown Scar',
      timing: scar ? 'Conditional' : 'Inactive',
      text: scar?.effect || 'Legacy scar data is not available.',
      active: Boolean(scar),
      reason: scar?.source ? `Source: ${scar.source}` : scar ? '' : 'Unknown legacy scar',
      tags: scar ? ['scar'] : ['legacy']
    });
  });
}

function disorderPassives(survivor = {}) {
  return compact(survivor.disorders).map(id => {
    const disorder = disorders[id];
    return passive({
      id,
      name: disorder?.name || titleCase(id),
      sourceType: 'Disorder',
      sourceName: disorder?.name || 'Unknown Disorder',
      timing: disorder ? 'Conditional' : 'Inactive',
      text: disorder?.effect || disorder?.downside || disorder?.description || 'Legacy disorder data is not available.',
      active: Boolean(disorder),
      reason: disorder?.trigger || (disorder ? '' : 'Unknown legacy disorder'),
      tags: disorder ? ['disorder'] : ['legacy']
    });
  });
}

function gearId(itemOrId) {
  if (typeof itemOrId === 'string') return itemOrId;
  return itemOrId?.equipmentId || itemOrId?.id || itemOrId?.sourceGearId || null;
}

function gearPassives({ survivor = {}, equippedGear = [] }) {
  const gear = [
    ...compact(equippedGear),
    ...compact(survivor.boundGear),
    ...compact(survivor.equippedGear)
  ];
  const seen = new Set();
  return gear.flatMap((itemOrId, index) => {
    const id = gearId(itemOrId);
    const instanceId = typeof itemOrId === 'object'
      ? itemOrId.instanceId || itemOrId.equipmentId || itemOrId.id
      : itemOrId;
    const key = instanceId || `${id || 'unknown'}:${index}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const item = typeof itemOrId === 'object' && itemOrId.passiveText
      ? itemOrId
      : getEquipment(id);
    if (!item?.passiveText) return [];
    return passive({
      id: `gear:${key}`,
      name: item.name || titleCase(id),
      sourceType: 'Gear',
      sourceName: item.name || titleCase(id),
      timing: item.passiveText.includes('Exhaust') ? 'Exhaust' : 'Conditional',
      text: item.passiveText,
      active: !item.deprecated,
      reason: item.deprecated ? 'Unknown legacy gear' : '',
      tags: item.keywords || []
    });
  });
}

function campaignPrinciplePassives(settlement = {}) {
  const principles = settlement.campaignPrinciples || settlement.principles || {};
  if (Array.isArray(principles)) {
    return principles.map(entry => passive({
      id: `campaignPrinciple:${entry.id || entry}`,
      name: entry.name || titleCase(entry.id || entry),
      sourceType: 'Campaign Principle',
      sourceName: entry.sourceName || 'Campaign Principle',
      timing: entry.timing || 'Always',
      text: entry.text || entry.description || '',
      active: entry.active !== false,
      reason: entry.reason || '',
      tags: entry.tags || ['principle']
    }));
  }
  return Object.entries(principles).map(([key, value]) => {
    const data = typeof value === 'object' ? value : { id: value, name: value };
    return passive({
      id: `campaignPrinciple:${key}:${data.id || data.name}`,
      name: data.name || titleCase(data.id || value),
      sourceType: 'Campaign Principle',
      sourceName: titleCase(key),
      timing: data.timing || 'Always',
      text: data.text || data.description || '',
      active: data.active !== false,
      reason: data.reason || '',
      tags: data.tags || ['principle', key]
    });
  });
}

function temporaryModifierPassives({ combatState = {}, huntState = {}, settlement = {} }) {
  const auras = compact(combatState.activeAuras).map(aura => passive({
    id: `temporary:aura:${aura.id || aura.type}`,
    name: titleCase(aura.type || 'Aura'),
    sourceType: 'Temporary Modifier',
    sourceName: aura.sourceCardName || aura.sourceEquipmentName || 'Combat Aura',
    timing: aura.duration === 'combat' ? 'Always' : 'Conditional',
    text: aura.text || aura.description || `${titleCase(aura.type)} ${aura.amount ?? ''}`.trim(),
    reason: aura.duration ? `Duration: ${aura.duration}` : '',
    tags: ['temporary', 'combat', aura.type].filter(Boolean)
  }));
  const modifierEntries = [
    ...Object.entries(huntState.temporaryModifiers || huntState.modifiers || {}),
    ...Object.entries(settlement.temporarySettlementModifiers || {})
  ];
  const modifiers = modifierEntries.map(([key, value]) => passive({
    id: `temporary:${key}`,
    name: titleCase(key),
    sourceType: 'Temporary Modifier',
    sourceName: 'Temporary Modifier',
    timing: 'Conditional',
    text: typeof value === 'object'
      ? value.text || value.description || JSON.stringify(value)
      : `${titleCase(key)}: ${value}`,
    reason: 'Temporary state',
    tags: ['temporary']
  }));
  return [...auras, ...modifiers];
}

export function getActiveSurvivorPassives({
  survivor = {},
  settlement = {},
  combatState = {},
  huntState = {},
  equippedGear = [],
  currentQuarryId
} = {}) {
  return [
    ...fightingArtPassives(survivor, currentQuarryId || combatState.monster?.quarryId),
    ...proficiencyPassives(survivor),
    ...traitPassives(survivor),
    ...scarPassives(survivor),
    ...disorderPassives(survivor),
    ...campaignPrinciplePassives(settlement),
    ...gearPassives({ survivor, equippedGear }),
    ...temporaryModifierPassives({ combatState, huntState, settlement })
  ];
}
