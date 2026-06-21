import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('pending newborn forces settlement into mandatory naming flow', () => {
  const screen = readFileSync(new URL('../src/screens/SettlementScreen.jsx', import.meta.url), 'utf8');

  assert.match(screen, /const hasPendingNewborn = Boolean\(settlement\.pendingNewborn\)/);
  assert.match(screen, /const actionTabs = hasPendingNewborn \? \[\] : \[/);
  assert.match(screen, /const settlementTabs = hasPendingNewborn\s*\?\s*\['population'\]/);
  assert.match(screen, /Naming is required before any other settlement actions can continue\./);
  assert.match(screen, /setTab\('population'\)/);
});

test('normal settlement actions are blocked while newborn naming is pending', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');

  assert.match(app, /const prepareHunt = survivorId => \{\s*if \(settlement\.pendingNewborn\) return;/);
  assert.match(app, /const startRun = \(\) => \{\s*if \(settlement\?\.pendingNewborn\) return;/);
  assert.match(app, /const handleBuild = item => \{\s*if \(settlement\.pendingNewborn\) return;/);
  assert.match(app, /const handleCraft = recipe => \{\s*if \(settlement\.pendingNewborn\) return;/);
  assert.match(app, /const handleAttemptInnovation = \(\) => \{\s*if \(settlement\.pendingNewborn\) return;/);
  assert.match(app, /const handleRestSurvivor = survivorId => \{\s*if \(settlement\.pendingNewborn\) return;/);
  assert.match(app, /const handleTreatInjury = \(survivorId, injuryId\) => \{\s*if \(settlement\.pendingNewborn\) return;/);
  assert.match(app, /if \(!settlement\.pendingNewborn\) setScreen\('principleChoice'\)/);
});

test('newborn confirmation advances twins and routes final New Life principle choice', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');

  assert.match(app, /const remainingBirths = pending\.remainingBirths - 1;/);
  assert.match(app, /if \(remainingBirths > 0\) \{/);
  assert.match(app, /nextPending = createPendingNewborn/);
  assert.match(app, /createPendingPrincipleChoice\(namedSettlement, 'newLife', 'First newborn', \[newborn\.id\]\)/);
  assert.match(app, /routeAfterNaming = 'principleChoice'/);
  assert.match(app, /setScreen\(routeAfterNaming\)/);
});
