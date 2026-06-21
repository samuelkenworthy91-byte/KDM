import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('runtime null guards are present in screen routes and combat source', () => {
  const partyCombat = readFileSync(new URL('../src/screens/PartyCombatScreen.jsx', import.meta.url), 'utf8');
  const partyCombatLogic = readFileSync(new URL('../src/game/partyCombatLogic.js', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const eventScreen = readFileSync(new URL('../src/screens/EventScreen.jsx', import.meta.url), 'utf8');

  assert.doesNotMatch(partyCombat, /bonus\.survivor\.id/);
  assert.match(partyCombat, /bonus => bonus\?\.survivor\?\.id === member\?\.survivor\?\.id/);
  assert.match(partyCombat, /validMembers\.map\(member =>/);
  assert.doesNotMatch(partyCombat, /combat\.members\.map\(member =>\s*\(\s*<div key=\{member\.survivor\.id\}/s);
  assert.match(partyCombatLogic, /validBonuses/);
  assert.doesNotMatch(partyCombatLogic, /\.some\(\s*member =>\s*member\.survivor\.hp/s);
  assert.doesNotMatch(partyCombatLogic, /bonus\.survivor\.id/);
  assert.match(app, /reason="missing loadout survivor"/);
  assert.match(app, /reason="missing combat party"/);
  assert.match(app, /reason="missing combat monster"/);
  assert.match(app, /partyBonuses=\{safePartyBonuses\}/);
  assert.match(eventScreen, /normalizeHuntEventForRoll/);
  assert.match(eventScreen, /const resultBands = Array\.isArray\(displayEvent\?\.resultBands\) \? displayEvent\.resultBands : \[\]/);
});

test('hunt roll event routing and roll UI source guards are present', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const eventScreen = readFileSync(new URL('../src/screens/EventScreen.jsx', import.meta.url), 'utf8');

  assert.match(app, /const rollPool = pool\.filter/);
  assert.match(app, /normalizeHuntEventForRoll/);
  assert.match(eventScreen, /event-roll-table/);
  assert.match(eventScreen, /event-roll-graphic/);
  assert.doesNotMatch(eventScreen, /choices\.map/);
});
