import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cardPlayed,
  combatStart,
  harvestRolled,
  initializeFightingArtHooks,
  panicGained,
  panicRemoved,
  runFightingArtHooks,
  statusApplied,
  weakPointBroken
} from '../src/game/fightingArtLogic.js';

const artData = {
  startArt: {
    id: 'startArt',
    name: 'Start Art',
    hooks: {
      combatStart: {
        handler: context => ({
          ...context,
          state: {
            ...context.state,
            startedByHook: true
          }
        })
      }
    }
  },
  cardArt: {
    id: 'cardArt',
    name: 'Card Art',
    hooks: {
      cardPlayed: [
        {
          handler: context => ({
            ...context,
            state: {
              ...context.state,
              playedCards: [...(context.state.playedCards || []), context.card.id]
            }
          })
        }
      ]
    }
  },
  statusArt: {
    id: 'statusArt',
    name: 'Status Art',
    hooks: {
      statusApplied: context => ({
        ...context,
        state: {
          ...context.state,
          statuses: [...(context.state.statuses || []), `${context.target}:${context.type}:${context.amount}`]
        }
      })
    }
  },
  weakPointArt: {
    id: 'weakPointArt',
    name: 'Weak Point Art',
    hooks: {
      weakPointBroken: context => ({
        ...context,
        state: {
          ...context.state,
          brokenWeakPoints: [...(context.state.brokenWeakPoints || []), context.weakPoint.id]
        }
      })
    }
  },
  panicArt: {
    id: 'panicArt',
    name: 'Panic Art',
    onPanicGained: context => ({
      ...context,
      state: {
        ...context.state,
        panicDelta: (context.state.panicDelta || 0) + context.amount
      }
    }),
    onPanicRemoved: context => ({
      ...context,
      state: {
        ...context.state,
        panicDelta: (context.state.panicDelta || 0) - context.amount
      }
    })
  }
};

test('combat start hooks can transform context state', () => {
  const hooks = initializeFightingArtHooks(['startArt'], { artData });
  const result = runFightingArtHooks(hooks, combatStart, { state: {} });

  assert.equal(result.state.startedByHook, true);
});

test('card played hooks receive the played card context', () => {
  const hooks = initializeFightingArtHooks(['cardArt'], { artData });
  const result = runFightingArtHooks(hooks, cardPlayed, {
    state: {},
    card: { id: 'boneAxeStrike' }
  });

  assert.deepEqual(result.state.playedCards, ['boneAxeStrike']);
});

test('status applied hooks receive target, status type, and amount', () => {
  const hooks = initializeFightingArtHooks(['statusArt'], { artData });
  const result = runFightingArtHooks(hooks, statusApplied, {
    state: {},
    target: 'monster',
    type: 'bleed',
    amount: 2
  });

  assert.deepEqual(result.state.statuses, ['monster:bleed:2']);
});

test('weak point broken hooks receive the broken weak point', () => {
  const hooks = initializeFightingArtHooks(['weakPointArt'], { artData });
  const result = runFightingArtHooks(hooks, weakPointBroken, {
    state: {},
    weakPoint: { id: 'softBelly', broken: true }
  });

  assert.deepEqual(result.state.brokenWeakPoints, ['softBelly']);
});

test('Panic gained and removed hooks support legacy on-hook names', () => {
  const hooks = initializeFightingArtHooks(['panicArt'], { artData });
  const gained = runFightingArtHooks(hooks, panicGained, { state: {}, amount: 3 });
  const removed = runFightingArtHooks(hooks, panicRemoved, { state: gained.state, amount: 1 });

  assert.equal(removed.state.panicDelta, 2);
});

test('object-only hooks are safe no-ops until reducers exist', () => {
  const hooks = initializeFightingArtHooks(['futureArt'], {
    artData: {
      futureArt: {
        id: 'futureArt',
        hooks: {
          combatStart: { type: 'futureEffect', amount: 1 }
        }
      }
    }
  });
  const context = { state: { unchanged: true } };

  assert.equal(runFightingArtHooks(hooks, combatStart, context), context);
});

test('object hooks can improve harvest quality by one step', () => {
  const hooks = initializeFightingArtHooks(['harvestArt'], {
    artData: {
      harvestArt: {
        id: 'harvestArt',
        hooks: {
          harvestRolled: { type: 'improveHarvestQuality', amount: 1 }
        }
      }
    }
  });
  const result = runFightingArtHooks(hooks, harvestRolled, {
    state: {},
    harvestResult: { quality: 'messy', reason: 'Base roll.' }
  });

  assert.equal(result.harvestResult.quality, 'clean');
  assert.match(result.harvestResult.reason, /improved harvest quality/);
});

test('object hooks record gear-card practice by survivor, gear instance, and card id', () => {
  const hooks = initializeFightingArtHooks(['practiceArt'], {
    artData: {
      practiceArt: {
        id: 'practiceArt',
        hooks: {
          cardPlayed: {
            type: 'recordGearCardPractice',
            cardTypes: ['attack'],
            sameGearAsPrevious: true
          }
        }
      }
    }
  });
  const result = runFightingArtHooks(hooks, cardPlayed, {
    previousState: { previousGearInstanceId: 'gear-1' },
    state: {
      survivor: { id: 'survivor-1' }
    },
    card: {
      id: 'slash',
      type: 'attack',
      gearInstanceId: 'gear-1'
    }
  });

  assert.equal(result.state.survivor.gearCardPractice['survivor-1:gear-1:slash'], 1);
});
