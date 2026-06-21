export function createSmokeSurvivor(overrides = {}) {
  return {
    id: 'smoke-survivor-1',
    name: 'Smoke Survivor',
    hp: 6,
    maxHp: 6,
    survival: 2,
    maxSurvival: 3,
    alive: true,
    isAlive: true,
    traits: [],
    fightingArts: [],
    disorders: [],
    injuries: [],
    scars: [],
    boundGear: [],
    hitLocations: {},
    personalDeckAdditions: [],
    permanentNegativeCards: [],
    permanentModifiers: {},
    temporaryPassives: [],
    treatmentNotes: [],
    woundHistory: [],
    ...overrides
  };
}

export function createSmokeSettlement(overrides = {}) {
  return {
    id: 'smoke-settlement',
    name: 'Smoke Settlement',
    principles: {},
    campaignPrinciples: {},
    builtInnovations: [],
    builtMemoryInnovations: [],
    settlementMemory: 0,
    memories: 0,
    resources: [],
    storage: [],
    survivors: [createSmokeSurvivor()],
    activeSurvivorId: 'smoke-survivor-1',
    discoveredQuarries: [],
    unlockedQuarries: [],
    conditionHistory: {},
    ...overrides
  };
}

export function createSmokeMonster(overrides = {}) {
  return {
    id: 'smoke-monster',
    baseId: 'smoke-monster',
    quarryId: 'smoke-monster',
    name: 'Smoke Monster',
    hp: 10,
    maxHp: 10,
    block: 0,
    bleed: 0,
    poison: 0,
    vulnerable: 0,
    intents: [
      {
        id: 'scratch',
        name: 'Scratch',
        damage: 1,
        targetRule: 'randomLivingSurvivor',
        targetingRule: 'randomLivingSurvivor',
        effects: [{ type: 'dealDamage', amount: 1 }],
        tags: ['attack']
      }
    ],
    weakPoints: [],
    ...overrides
  };
}

export function createSmokeRunState(overrides = {}) {
  const survivor = createSmokeSurvivor();
  const settlement = createSmokeSettlement({
    survivors: [survivor],
    activeSurvivorId: survivor.id
  });

  return {
    survivor,
    settlement,
    runParty: [survivor],
    runSurvivor: survivor,
    runResources: [],
    runModifiers: {},
    settlementMemoryDelta: 0,
    ...overrides
  };
}

function failureFromError(base, error) {
  return {
    ...base,
    message: error?.message || String(error),
    stack: error?.stack || ''
  };
}

export function runEventResolutionSweep({
  events,
  resolveEvent,
  normalizeHuntEventForRoll
} = {}) {
  const failures = [];
  const eventList = Array.isArray(events) ? events : [];
  const rolls = [1, 5, 10];
  let checked = 0;

  eventList.forEach(rawEvent => {
    const event = normalizeHuntEventForRoll
      ? normalizeHuntEventForRoll(rawEvent)
      : rawEvent;

    rolls.forEach(roll => {
      checked += 1;
      const { runParty, settlement, runSurvivor, runResources, runModifiers, settlementMemoryDelta } = createSmokeRunState();
      const state = {
        runParty,
        runSurvivor,
        runResources,
        runModifiers,
        settlementMemoryDelta
      };
      const context = {
        quarry: { id: 'smoke-quarry', name: 'Smoke Quarry' },
        runParty,
        settlement,
        settlementMemory: 0,
        hasGravesUpgrade: false,
        random: () => 0.99,
        roll
      };

      try {
        const firstResult = resolveEvent(event, { rollOverride: roll }, state, context);
        const result = firstResult?.requiresEventSurvivorChoice
          ? resolveEvent(
              event,
              {
                eventSurvivorId: runSurvivor.id,
                rollOverride: roll
              },
              state,
              context
            )
          : firstResult;

        if (result == null) {
          failures.push({
            eventId: event?.id,
            eventName: event?.name,
            roll,
            message: 'resolveEvent returned no result',
            stack: ''
          });
          return;
        }
        if (!result.outcomeText && !result.requiresEventSurvivorChoice) {
          failures.push({
            eventId: event?.id,
            eventName: event?.name,
            roll,
            message: 'resolveEvent returned no outcomeText',
            stack: ''
          });
        }
        if (!result.eventId) {
          failures.push({
            eventId: event?.id,
            eventName: event?.name,
            roll,
            message: 'resolveEvent returned no eventId',
            stack: ''
          });
        }
      } catch (error) {
        failures.push(failureFromError({
          eventId: event?.id,
          eventName: event?.name,
          roll
        }, error));
      }
    });
  });

  return {
    ok: failures.length === 0,
    failures,
    checked
  };
}

export function runCombatSmokeSweep({
  createPartyCombatState,
  playPartyCard,
  endPartyTurn
} = {}) {
  const failures = [];

  try {
    const monster = createSmokeMonster();
    const survivor = createSmokeSurvivor();
    const partyBonus = {
      survivor,
      runDeck: [],
      startingBlock: 0,
      firstTurnEnergyPenalty: 0,
      monsterBonusHp: 0,
      monsterStartsWounded: 0,
      monsterEnrage: 0,
      firstAttackBonus: 0,
      hasMonsterBane: false,
      monsterBaneDamageBonus: 0,
      huntDeckConditionsApplied: true
    };
    const state = createPartyCombatState(monster, [partyBonus]);

    if (!state) {
      failures.push({ phase: 'createPartyCombatState', message: 'No state returned', stack: '' });
      return { ok: false, failures };
    }
    if (!state.members?.some(member => member?.survivor?.id)) {
      failures.push({ phase: 'createPartyCombatState', message: 'No valid combat member returned', stack: '' });
    }
    if (!state.monster?.id) {
      failures.push({ phase: 'createPartyCombatState', message: 'No combat monster returned', stack: '' });
    }
    if (['crashed', 'error', 'recovery'].includes(state.status)) {
      failures.push({ phase: 'createPartyCombatState', message: `Immediate crash status: ${state.status}`, stack: '' });
    }

    if (playPartyCard && Array.isArray(state.members?.[state.activePartyIndex]?.hand)) {
      try {
        playPartyCard(0, state);
      } catch (error) {
        failures.push(failureFromError({ phase: 'playPartyCard' }, error));
      }
    }

    if (endPartyTurn) {
      try {
        endPartyTurn(state);
      } catch (error) {
        failures.push(failureFromError({ phase: 'endPartyTurn' }, error));
      }
    }
  } catch (error) {
    failures.push(failureFromError({ phase: 'createPartyCombatState' }, error));
  }

  return {
    ok: failures.length === 0,
    failures
  };
}
