import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveEvent } from '../src/domain/events/eventEngine.js';
import { applyEventDeltas } from '../src/domain/events/eventEffects.js';
import { getEventCatalog } from '../src/domain/events/eventCatalog.js';
import { createRunState } from '../src/domain/schema/runStateSchema.js';
import { createSettlement } from '../src/domain/schema/settlementSchema.js';

test('every event in catalog resolves for roll 1, 5, 10', () => {
  getEventCatalog().forEach(event => {
    [1, 5, 10].forEach(roll => {
      const result = resolveEvent({ event, roll });
      assert.equal(result.eventId, event.id);
      assert.equal(result.roll, roll);
    });
  });
});

test('no result has null label, title, or text', () => {
  const result = resolveEvent({ event: getEventCatalog()[0], roll: 5 });
  assert.ok(result.outcomeBand);
  assert.ok(result.title);
  assert.ok(result.text);
});

test('every result has at least one mechanical effect', () => {
  getEventCatalog().slice(0, 20).forEach(event => {
    const result = resolveEvent({ event, roll: 5 });
    assert.ok(result.mechanicalEffects.length >= 1);
  });
});

test('applying result delta to run state never throws', () => {
  const result = resolveEvent({ event: getEventCatalog()[0], roll: 10 });
  assert.doesNotThrow(() => applyEventDeltas({
    runState: createRunState(),
    settlement: createSettlement(),
    stateDelta: result.stateDelta,
    settlementDelta: result.settlementDelta
  }));
});

test('missing event input returns safe recovery event result, not null', () => {
  const result = resolveEvent();
  assert.ok(result);
  assert.equal(result.eventId, 'recoveryEvent');
  assert.ok(result.mechanicalEffects.length);
});
