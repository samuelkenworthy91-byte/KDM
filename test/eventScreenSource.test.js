import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../src/ui/screens/EventScreen.jsx', import.meta.url), 'utf8');

test('EventScreen contains Roll button', () => {
  const rollDieSource = readFileSync(new URL('../src/ui/components/RollDie.jsx', import.meta.url), 'utf8');
  assert.match(rollDieSource, /Roll/);
});

test('EventScreen does not auto-resolve on mount', () => {
  const beforeHandler = source.split('function handleRoll')[0];
  assert.doesNotMatch(beforeHandler, /resolveEvent\(/);
});

test('EventScreen displays mechanicalEffects', () => {
  assert.match(source, /mechanicalEffects/);
  assert.match(source, /Mechanical Effects/);
});

test('EventScreen uses safe fallback labels', () => {
  assert.match(source, /Safe Outcome/);
  assert.match(source, /Safe fallback effect/);
});
