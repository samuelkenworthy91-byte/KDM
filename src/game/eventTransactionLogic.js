import {
  normalizeHuntEventForRoll,
  resolveEvent
} from './eventLogic.js';

function normalizeSurvivor(survivor) {
  if (!survivor?.id) return null;
  return {
    ...survivor,
    traits: Array.isArray(survivor.traits) ? survivor.traits : [],
    fightingArts: Array.isArray(survivor.fightingArts) ? survivor.fightingArts : [],
    personalDeckAdditions: Array.isArray(survivor.personalDeckAdditions)
      ? survivor.personalDeckAdditions
      : [],
    injuries: Array.isArray(survivor.injuries) ? survivor.injuries : [],
    scars: Array.isArray(survivor.scars) ? survivor.scars : [],
    disorders: Array.isArray(survivor.disorders) ? survivor.disorders : [],
    permanentModifiers: survivor.permanentModifiers || {},
    temporaryPassives: Array.isArray(survivor.temporaryPassives) ? survivor.temporaryPassives : []
  };
}

function validParty(party) {
  return Array.isArray(party)
    ? party.map(normalizeSurvivor).filter(Boolean)
    : [];
}

function firstLivingSurvivor(party) {
  return party.find(survivor => survivor.hp > 0 && survivor.alive !== false) || null;
}

function replacePartySurvivor(party, survivor) {
  if (!survivor?.id) return validParty(party);
  const normalizedParty = validParty(party);
  const replaced = normalizedParty.map(member =>
    member.id === survivor.id ? survivor : member
  );
  return replaced.some(member => member.id === survivor.id)
    ? replaced
    : [survivor, ...replaced];
}

export function createSafeEventState(input = {}) {
  input = input || {};
  const runParty = validParty(input.runParty);
  const runSurvivor = normalizeSurvivor(input.runSurvivor) || firstLivingSurvivor(runParty);
  return {
    runResources: Array.isArray(input.runResources) ? input.runResources : [],
    runSurvivor,
    runParty,
    runModifiers: input.runModifiers || {},
    settlementMemoryDelta: Number(input.settlementMemoryDelta) || 0,
    settlement: input.settlement || {}
  };
}

export function createEventRecoveryResult({ event, state, error, message } = {}) {
  const safeState = createSafeEventState(state);
  return {
    eventId: event?.id || 'unknownEvent',
    choiceId: 'eventRecovery',
    outcomeText: message || 'The event hit a recovery path.',
    appliedEffects: [`Event recovery: ${error?.message || message || 'unknown error'}`],
    runResources: [...safeState.runResources],
    runSurvivor: safeState.runSurvivor,
    runParty: safeState.runParty,
    runModifiers: { ...safeState.runModifiers },
    settlementMemoryDelta: safeState.settlementMemoryDelta,
    recovered: true
  };
}

function normaliseEventResult(result, safeState, event) {
  const resultSurvivor = normalizeSurvivor(result.runSurvivor);
  const runSurvivor = resultSurvivor || safeState.runSurvivor;
  const resultParty = validParty(result.runParty);
  const runParty = resultSurvivor
    ? replacePartySurvivor(resultParty.length ? resultParty : safeState.runParty, resultSurvivor)
    : resultParty.length ? resultParty : safeState.runParty;

  return {
    ...result,
    eventId: result.eventId || event?.id || 'unknownEvent',
    choiceId: result.choiceId || 'huntRoll',
    outcomeText: result.outcomeText || 'The hunt event resolves.',
    appliedEffects: Array.isArray(result.appliedEffects) ? result.appliedEffects : [],
    runResources: Array.isArray(result.runResources)
      ? result.runResources
      : [...safeState.runResources],
    runSurvivor,
    runParty,
    runModifiers: result.runModifiers || { ...safeState.runModifiers },
    settlementMemoryDelta: Number(result.settlementMemoryDelta) || 0
  };
}

export function resolveEventTransaction({ event, choice, state = {}, context = {} } = {}) {
  const safeState = createSafeEventState(state);
  const normalizedEvent = normalizeHuntEventForRoll(event);

  try {
    const result = resolveEvent(
      normalizedEvent,
      choice,
      safeState,
      {
        ...context,
        runParty: safeState.runParty,
        settlement: safeState.settlement,
        quarry: context?.quarry || context?.selectedQuarry || {
          id: 'unknownQuarry',
          name: 'Unknown quarry'
        },
        selectedQuarry: typeof context?.selectedQuarry === 'string'
          ? context.selectedQuarry
          : context?.selectedQuarry?.id
      }
    );

    if (!result) {
      return createEventRecoveryResult({
        event: normalizedEvent,
        state: safeState,
        message: 'No event result was returned.'
      });
    }

    return normaliseEventResult(result, safeState, normalizedEvent);
  } catch (error) {
    return createEventRecoveryResult({
      event: normalizedEvent,
      state: safeState,
      error
    });
  }
}

function applyMemoryDelta(settlement = {}, delta = 0) {
  const memory = Math.max(0, Number(settlement.settlementMemory || settlement.memories || 0) + delta);
  return {
    ...settlement,
    settlementMemory: memory,
    memories: memory
  };
}

function applyQuarryRumour(settlement = {}) {
  const entry = {
    type: 'quarryRumour',
    message: 'The hunting party recorded a quarry rumour.',
    timestamp: new Date().toISOString()
  };
  return {
    ...settlement,
    quarryRumours: [...(settlement.quarryRumours || []), entry],
    settlementHistory: [...(settlement.settlementHistory || []), entry]
  };
}

export function applyEventTransactionToRun({ transaction, runState = {}, settlement } = {}) {
  try {
    const safeRun = createSafeEventState({ ...runState, settlement });
    const safeTransaction = transaction || {};
    const runResources = Array.isArray(safeTransaction.runResources)
      ? safeTransaction.runResources
      : safeRun.runResources;
    const transactionSurvivor = normalizeSurvivor(safeTransaction.runSurvivor);
    const transactionParty = validParty(safeTransaction.runParty);
    const runSurvivor = transactionSurvivor || safeRun.runSurvivor;
    const runParty = transactionSurvivor
      ? replacePartySurvivor(transactionParty.length ? transactionParty : safeRun.runParty, transactionSurvivor)
      : transactionParty.length ? transactionParty : safeRun.runParty;
    const runModifiers = safeTransaction.runModifiers
      ? { ...safeRun.runModifiers, ...safeTransaction.runModifiers }
      : { ...safeRun.runModifiers };
    const memoryDelta = Number(safeTransaction.settlementMemoryDelta) || 0;
    let nextSettlement = settlement || safeRun.settlement;

    if (memoryDelta) nextSettlement = applyMemoryDelta(nextSettlement, memoryDelta);
    if (safeTransaction.pendingSpecialChildTrait) {
      nextSettlement = {
        ...nextSettlement,
        pendingSpecialChildTrait: safeTransaction.pendingSpecialChildTrait
      };
    }
    if (safeTransaction.quarryRumour) nextSettlement = applyQuarryRumour(nextSettlement);

    return {
      runResources,
      runSurvivor,
      runParty,
      runModifiers,
      settlement: nextSettlement
    };
  } catch {
    const safeRun = createSafeEventState({ ...runState, settlement });
    return {
      runResources: safeRun.runResources,
      runSurvivor: safeRun.runSurvivor,
      runParty: safeRun.runParty,
      runModifiers: safeRun.runModifiers,
      settlement: settlement || safeRun.settlement
    };
  }
}
