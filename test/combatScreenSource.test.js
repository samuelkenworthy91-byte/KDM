import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const combatSource = readFileSync(new URL('../src/ui/screens/CombatScreen.jsx', import.meta.url), 'utf8');

function readSources(dir) {
  return readdirSync(dir).flatMap(entry => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return readSources(path);
    return path.endsWith('.js') || path.endsWith('.jsx') ? [readFileSync(path, 'utf8')] : [];
  });
}

test('CombatScreen imports combatEngine functions', () => {
  assert.match(combatSource, /combatEngine/);
  assert.match(combatSource, /createCombatState/);
  assert.match(combatSource, /playCard/);
});

test('CombatScreen renders CardHand', () => {
  assert.match(combatSource, /<CardHand/);
});

test('CombatScreen renders MonsterPanel', () => {
  assert.match(combatSource, /<MonsterPanel/);
});

test('CombatScreen renders CombatLog', () => {
  assert.match(combatSource, /<CombatLog/);
});

test('legacy clash or dice-only fight does not exist', () => {
  const source = readSources(fileURLToPath(new URL('../src', import.meta.url))).join('\n');
  assert.doesNotMatch(source, new RegExp('Hunt' + 'Clash'));
  assert.doesNotMatch(combatSource, /dice-only/i);
});

test('no legacy clash screen import anywhere', () => {
  const source = readSources(fileURLToPath(new URL('../src', import.meta.url))).join('\n');
  assert.doesNotMatch(source, new RegExp('Hunt' + 'Clash' + 'Screen'));
});
