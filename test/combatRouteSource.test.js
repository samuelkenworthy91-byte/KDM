import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('normal hunt combat route uses PartyCombatScreen card combat', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const combatCase = app.slice(app.indexOf("case 'combat':"), app.indexOf("case 'lootReward':"));

  assert.match(app, /import PartyCombatScreen from '\.\/screens\/PartyCombatScreen\.jsx'/);
  assert.match(combatCase, /<PartyCombatScreen/);
  assert.doesNotMatch(combatCase, /<HuntClashScreen/);
  assert.doesNotMatch(app, /import HuntClashScreen/);
});
