import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const screenUrl = new URL('../src/screens/HuntClashScreen.jsx', import.meta.url);

test('HuntClashScreen source exists and exposes safe fight controls', () => {
  assert.equal(existsSync(screenUrl), true);
  const source = readFileSync(screenUrl, 'utf8');

  assert.match(source, /onVictory/);
  assert.match(source, /onDefeat/);
  assert.match(source, /Attack/);
  assert.match(source, /Defend/);
  assert.doesNotMatch(source, /party\[0\]\.id/);
  assert.doesNotMatch(source, /monster\.id/);
});

test('App normal combat route uses HuntClashScreen instead of PartyCombatScreen', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const combatCase = app.slice(app.indexOf("case 'combat':"), app.indexOf("case 'lootReward':"));

  assert.match(app, /import HuntClashScreen from '\.\/screens\/HuntClashScreen\.jsx'/);
  assert.match(combatCase, /<HuntClashScreen/);
  assert.doesNotMatch(combatCase, /<PartyCombatScreen/);
});
