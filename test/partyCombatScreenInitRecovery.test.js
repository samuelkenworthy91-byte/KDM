import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/screens/PartyCombatScreen.jsx', 'utf8');

test('party combat catches createPartyCombatState initialisation errors', () => {
  assert.match(source, /safelyCreatePartyCombatState/);
  assert.match(source, /try\s*\{\s*return createPartyCombatState/);
  assert.match(source, /createCombatRecoveryState/);
  assert.match(source, /combat\.status === 'recovery'/);
});

test('party combat does not call createPartyCombatState directly in useState', () => {
  assert.doesNotMatch(source, /useState\(\(\) =>\s*createPartyCombatState/);
});
