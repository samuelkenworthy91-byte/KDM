import assert from 'node:assert/strict';
import test from 'node:test';

import { applyInnovation, drawInnovation, getInnovationDeck } from '../src/domain/innovations/innovationLogic.js';
import { applyPrincipleChoice, getPrincipleChoices } from '../src/domain/principles/principleLogic.js';
import { createSettlement } from '../src/domain/schema/settlementSchema.js';

test('principle choice applies to settlement', () => {
  const settlement = createSettlement();
  const principle = getPrincipleChoices('death')[0];
  const next = applyPrincipleChoice(settlement, principle);
  assert.equal(next.principles.length, 1);
  assert.equal(next.principles[0].id, principle.id);
});

test('innovation deck draw returns safe innovation', () => {
  const innovation = drawInnovation(createSettlement(), () => 0);
  assert.ok(innovation.id);
  assert.ok(innovation.name);
});

test('innovation apply never throws', () => {
  const settlement = createSettlement();
  const innovation = drawInnovation(settlement, () => 0);
  assert.doesNotThrow(() => applyInnovation(settlement, innovation));
});

test('no direct null IDs', () => {
  const settlement = createSettlement();
  [...getPrincipleChoices('death'), ...getInnovationDeck(settlement)].forEach(item => {
    assert.ok(item.id);
    assert.notEqual(item.id, null);
    assert.notEqual(item.id, 'null');
  });
});
