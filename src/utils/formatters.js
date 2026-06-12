import { cards } from '../data/cards.js';
import { childTraits } from '../data/childTraits.js';
import { disorders } from '../data/disorders.js';
import { equipment } from '../data/equipment.js';
import { fightingArts } from '../data/fightingArts.js';
import { innovationCards } from '../data/innovationCards.js';
import { innovations } from '../data/innovations.js';
import { injuries } from '../data/injuries.js';
import { quarries } from '../data/quarries.js';
import { resources } from '../data/resources.js';
import { scars } from '../data/scars.js';

const IS_DEV = Boolean(import.meta.env?.DEV);

const LABELS = {
  settlementMemory: 'Settlement Memory',
  gainSettlementMemory: 'Settlement Memory',
  loseSettlementMemory: 'Settlement Memory',
  population: 'Population',
  gainPopulation: 'Population',
  losePopulation: 'Population',
  survival: 'Survival',
  strength: 'Strength',
  maxHp: 'Maximum HP',
  hp: 'HP',
  block: 'Block',
  panic: 'Panic',
  addPanic: 'Panic',
  addPanicToSurvivorDeck: 'Panic',
  removePanicFromSurvivorDeck: 'Panic',
  campaignPressure: 'Campaign Pressure'
};

function titleCase(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function signed(amount) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return '';
  return `${number > 0 ? '+' : ''}${number}`;
}

function lookupName(registry, id) {
  return registry?.[id]?.name || registry?.[id]?.displayName || id;
}

export function warnIfRenderingObject(label, value) {
  if (IS_DEV) console.warn('Unknown display object', label, value);
}

export function formatResourceAmount(resourceId, amount = 1) {
  const name = lookupName(resources, resourceId) || 'Unknown resource';
  const count = Number(amount);
  return `${Number.isFinite(count) ? count : amount} ${name}`;
}

export function formatEffectForDisplay(effect) {
  if (effect == null) return '';
  if (typeof effect !== 'object' || Array.isArray(effect)) {
    return formatValueForDisplay(effect, 'effect');
  }
  if (effect.text) return formatValueForDisplay(effect.text, 'effect text');
  if (effect.effectText) return formatValueForDisplay(effect.effectText, 'effect text');

  const amount = Number(effect.amount ?? effect.value);
  const type = effect.type;
  if (!type && effect.addResource) {
    return `${signed(Number.isFinite(amount) ? amount : 1)} ${lookupName(resources, effect.addResource)}`;
  }
  if (!type && effect.removeResource) {
    return `${signed(-(Number.isFinite(amount) ? amount : 1))} ${lookupName(resources, effect.removeResource)}`;
  }
  if (!type && effect.addSettlementMemory != null) {
    return `${signed(effect.addSettlementMemory ?? amount)} Settlement Memory`;
  }
  if (!type && effect.population != null) return `${signed(effect.population)} Population`;
  if (!type && effect.survival != null) return `${signed(effect.survival)} Survival`;
  if (!type && effect.hp != null) return `${signed(effect.hp)} HP`;
  if (!type && effect.id && Number.isFinite(amount)) {
    return `${signed(amount)} ${effect.name || effect.id}`;
  }
  if (type === 'resource' || type === 'gainResource') {
    return `${signed(Number.isFinite(amount) ? amount : 1)} ${lookupName(resources, effect.resourceId)}`;
  }
  if (type === 'loseResource') {
    return `${signed(-(Number.isFinite(amount) ? amount : 1))} ${lookupName(resources, effect.resourceId)}`;
  }
  if (type === 'resourceOrMemory') {
    return `${formatResourceAmount(effect.resourceId, amount)} or Settlement Memory`;
  }
  if (type === 'resourceOrResource') {
    return `${amount || 1} ${(effect.resourceIds || []).map(id => lookupName(resources, id)).join(' or ')}`;
  }
  if (['settlementMemory', 'gainSettlementMemory'].includes(type)) {
    return `${signed(amount)} Settlement Memory`;
  }
  if (type === 'loseSettlementMemory') return `${signed(-Math.abs(amount))} Settlement Memory`;
  if (['population', 'gainPopulation'].includes(type)) return `${signed(amount)} Population`;
  if (type === 'losePopulation') return `${signed(-Math.abs(amount))} Population`;
  if (type === 'heal' || type === 'healSurvivor' || type === 'healAllSurvivors') {
    return `Heal ${amount || 0} HP`;
  }
  if (type === 'dealDamage') return `Deal ${amount || 0} damage`;
  if (type === 'gainBlock') return `Gain ${amount || 0} block`;
  if (type === 'addPanic' || type === 'addPanicToSurvivorDeck') {
    return `Add ${amount || 1} Panic`;
  }
  if (type === 'removePanicFromSurvivorDeck') return `Remove ${amount || 1} Panic`;
  if (type === 'unlockInnovation' || type === 'addInnovationToPool') {
    const id = effect.id || effect.innovationId;
    return `Unlocks innovation: ${lookupName(innovationCards, id)}`;
  }
  if (type === 'unlockBuilding') {
    const id = effect.id || effect.buildingId;
    return `Unlocks location: ${lookupName(innovations, id)}`;
  }
  if (type === 'unlockQuarry' || type === 'unlockQuarryRumour') {
    return `Unlocks quarry: ${lookupName(quarries, effect.id || effect.quarryId)}`;
  }
  if (type === 'addSurvivorTrait') {
    return `Trait gained: ${lookupName({ ...childTraits }, effect.traitId)}`;
  }
  if (type === 'addSurvivorDisorder') {
    return `Disorder gained: ${lookupName(disorders, effect.disorderId)}`;
  }
  if (type === 'addSurvivorScar') return `Scar gained: ${lookupName(scars, effect.scarId)}`;
  if (type === 'addSurvivorInjury') {
    return `Injury gained: ${lookupName(injuries, effect.injuryId)}`;
  }
  if (type === 'addSurvivorCard') return `Card gained: ${lookupName(cards, effect.cardId)}`;
  if (type === 'nextHuntModifier' || type === 'addTemporaryHuntModifier') {
    return `Next hunt: ${titleCase(effect.id || effect.modifier || 'modifier')} ${signed(amount)}`.trim();
  }
  if (type && Number.isFinite(amount)) {
    return `${signed(amount)} ${LABELS[type] || titleCase(type)}`;
  }
  if (type) {
    const detail = effect.id || effect.resourceId || effect.cardId || effect.traitId ||
      effect.fightingArtId || effect.gearId || effect.recipeId || effect.quarryId;
    return detail ? `${titleCase(type)}: ${formatValueForDisplay(detail)}` : titleCase(type);
  }

  return formatValueForDisplay(effect, 'effect');
}

export function formatEffectsForDisplay(effects) {
  if (effects == null) return '';
  const values = Array.isArray(effects) ? effects : [effects];
  return values.map(formatEffectForDisplay).filter(Boolean).join(', ');
}

export function formatCostForDisplay(cost) {
  if (cost == null) return '';
  if (typeof cost !== 'object' || Array.isArray(cost)) return formatValueForDisplay(cost, 'cost');
  return Object.entries(cost)
    .map(([resourceId, amount]) => formatResourceAmount(resourceId, amount))
    .join(', ');
}

export function formatRewardForDisplay(reward) {
  if (reward == null) return '';
  if (typeof reward !== 'object' || Array.isArray(reward)) {
    return formatValueForDisplay(reward, 'reward');
  }
  if (reward.effectText || reward.mechanicalEffectText) {
    return formatValueForDisplay(
      reward.effectText || reward.mechanicalEffectText,
      'reward effect'
    );
  }
  if (reward.resourceId) return formatResourceAmount(reward.resourceId, reward.amount);
  if (reward.cardId) return `Card: ${lookupName(cards, reward.cardId)}`;
  if (reward.traitId) return `Trait: ${lookupName(childTraits, reward.traitId)}`;
  if (reward.fightingArtId) {
    return `Fighting Art: ${lookupName(fightingArts, reward.fightingArtId)}`;
  }
  if (reward.gearId) return `Gear: ${lookupName(equipment, reward.gearId)}`;
  return formatEffectForDisplay(reward.mechanicalEffect || reward.effect || reward);
}

export function formatModifierEffect(effect) {
  const formatted = formatEffectsForDisplay(effect);
  return formatted || 'Effect not described yet';
}

export function formatHistoryDetail(detail) {
  return formatValueForDisplay(detail, 'history detail');
}

export function formatValueForDisplay(value, label = 'value') {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    return value.map(item => formatValueForDisplay(item, label)).filter(Boolean).join(', ');
  }
  if (typeof value === 'object') {
    if (value.type) return formatEffectForDisplay(value);
    if (
      value.addResource || value.removeResource || value.addSettlementMemory != null ||
      value.population != null || value.survival != null || value.hp != null
    ) {
      return formatEffectForDisplay(value);
    }
    if (value.resourceId) return formatResourceAmount(value.resourceId, value.amount);
    if (value.traitId) return `Trait: ${lookupName(childTraits, value.traitId)}`;
    if (value.fightingArtId) return `Fighting Art: ${lookupName(fightingArts, value.fightingArtId)}`;
    if (value.cardId) return `Card: ${lookupName(cards, value.cardId)}`;
    if (value.gearId) return `Gear: ${lookupName(equipment, value.gearId)}`;
    if (value.quarryId) return `Quarry: ${lookupName(quarries, value.quarryId)}`;
    warnIfRenderingObject(label, value);
    try {
      return JSON.stringify(value);
    } catch {
      return '[Unrecognized legacy data]';
    }
  }
  return String(value);
}
