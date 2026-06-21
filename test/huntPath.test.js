import assert from 'node:assert/strict';
import test from 'node:test';

import { createHuntPath, huntPathHasRequiredNodes } from '../src/domain/hunt/huntPath.js';
import { advanceHunt, createHuntState, resolveEventNode, resolveFightNode } from '../src/domain/hunt/huntState.js';

test('hunt path always contains at least one event and one fight', () => {
  const path = createHuntPath();
  assert.equal(huntPathHasRequiredNodes(path), true);
});

test('advancing path never throws', () => {
  let hunt = createHuntState();
  assert.doesNotThrow(() => {
    hunt = advanceHunt(hunt);
    hunt = advanceHunt(hunt);
    hunt = advanceHunt(hunt);
  });
  assert.ok(hunt.currentNode);
});

test('resolving event node returns to hunt', () => {
  const hunt = createHuntState({ currentIndex: 1 });
  const next = resolveEventNode(hunt);
  assert.equal(next.status, 'active');
  assert.equal(next.currentNode.type, 'resource');
});

test('resolving fight node returns to settlement', () => {
  const hunt = createHuntState({ currentIndex: 3 });
  const next = resolveFightNode(hunt, 'victory');
  assert.equal(next.status, 'complete');
});
