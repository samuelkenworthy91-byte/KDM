import test from 'node:test';
import assert from 'node:assert/strict';
import { events } from '../src/data/events.js';
import {
  normalizeHuntEventForRoll,
  resolveEvent
} from '../src/game/eventLogic.js';
import {
  createPartyCombatState,
  endPartyTurn,
  playPartyCard
} from '../src/game/partyCombatLogic.js';
import {
  runCombatSmokeSweep,
  runEventResolutionSweep
} from '../src/qa/runtimeSmoke.js';

test('all hunt events resolve safely through smoke sweep', () => {
  const report = runEventResolutionSweep({
    events,
    resolveEvent,
    normalizeHuntEventForRoll
  });

  assert.equal(
    report.ok,
    true,
    JSON.stringify(report.failures.slice(0, 10), null, 2)
  );
});

test('party combat starts safely through smoke sweep', () => {
  const report = runCombatSmokeSweep({
    createPartyCombatState,
    playPartyCard,
    endPartyTurn
  });

  assert.equal(
    report.ok,
    true,
    JSON.stringify(report.failures, null, 2)
  );
});

test('tumour birds guarded cache resolves safely', () => {
  const event = events.find(item => item.id === 'tumourBirds');
  const normalized = normalizeHuntEventForRoll(event);

  const report = runEventResolutionSweep({
    events: [normalized],
    resolveEvent,
    normalizeHuntEventForRoll
  });

  assert.equal(report.ok, true, JSON.stringify(report.failures, null, 2));
});
