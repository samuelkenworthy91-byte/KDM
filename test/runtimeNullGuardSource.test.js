import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('runtime null guards are present in screen routes and combat source', () => {
  const partyCombat = readFileSync(new URL('../src/screens/PartyCombatScreen.jsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const eventScreen = readFileSync(new URL('../src/screens/EventScreen.jsx', import.meta.url), 'utf8');

  assert.doesNotMatch(partyCombat, /bonus\.survivor\.id/);
  assert.match(partyCombat, /bonus => bonus\?\.survivor\?\.id === member\.survivor\.id/);
  assert.match(app, /reason="missing loadout survivor"/);
  assert.match(app, /reason="missing combat party"/);
  assert.match(eventScreen, /Array\.isArray\(event\.resultBands\) && event\.resultBands\.length > 0/);
});
