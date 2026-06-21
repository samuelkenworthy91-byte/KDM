import { normaliseName } from '../schema/contentSchemas.js';
import { buildDeltas, effectsToMechanicalEffects } from './eventEffects.js';

function safeRoll(roll, random) {
  const rolled = roll ?? (typeof random === 'function' ? Math.ceil(random() * 10) : 5);
  const number = Number(rolled);
  if (!Number.isFinite(number)) return 5;
  return Math.max(1, Math.min(10, Math.round(number)));
}

function bandForRoll(event, roll) {
  const bands = Array.isArray(event?.resultBands) ? event.resultBands : [];
  return bands.find(band => {
    const min = band.min ?? 1;
    const max = band.max ?? 10;
    return roll >= min && roll <= max;
  }) || null;
}

function fallbackBand(roll) {
  if (roll <= 3) return { id: 'low', label: 'Hard Passage', resultText: 'The path takes its price.' };
  if (roll <= 7) return { id: 'mid', label: 'Narrow Passage', resultText: 'The party finds a usable rhythm.' };
  return { id: 'high', label: 'Bright Find', resultText: 'The party returns with something useful.' };
}

export function resolveEvent({ event, roll, random } = {}) {
  const resolvedRoll = safeRoll(roll, random);
  const safeEvent = event && typeof event === 'object'
    ? event
    : {
        id: 'recoveryEvent',
        name: 'Recovery Event',
        description: 'A safe fallback event catches malformed hunt data.',
        resultBands: []
      };
  const band = bandForRoll(safeEvent, resolvedRoll) || fallbackBand(resolvedRoll);
  const mechanicalEffects = effectsToMechanicalEffects(band.effects, resolvedRoll);
  const { stateDelta, settlementDelta } = buildDeltas(mechanicalEffects);

  return {
    eventId: normaliseName(safeEvent.id, 'recoveryEvent'),
    eventName: normaliseName(safeEvent.name || safeEvent.title, 'Recovery Event'),
    roll: resolvedRoll,
    outcomeBand: normaliseName(band.label || band.id, 'Safe Outcome'),
    title: normaliseName(band.label || safeEvent.name, 'Safe Outcome'),
    text: normaliseName(band.resultText || safeEvent.description || safeEvent.longDescription, 'The event resolves safely.'),
    mechanicalEffects,
    stateDelta,
    settlementDelta,
    warnings: event ? [] : ['Missing event input; used recovery event.']
  };
}
