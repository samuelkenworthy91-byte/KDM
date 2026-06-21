import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const createSettlementSource = fs.readFileSync('src/screens/CreateSettlementScreen.jsx', 'utf8');
const settlementSource = fs.readFileSync('src/screens/SettlementScreen.jsx', 'utf8');
const appSource = fs.readFileSync('src/App.jsx', 'utf8');

test('create settlement collects founder drafts', () => {
  assert.match(createSettlementSource, /founderDrafts/);
  assert.match(createSettlementSource, /setFounderDrafts/);
  assert.match(createSettlementSource, /updateFounderDraft/);
});

test('create settlement requires founder names before starting', () => {
  assert.match(createSettlementSource, /name\.trim\(\)\.length > 0/);
  assert.match(createSettlementSource, /every\(/);
});

test('create settlement submits founder drafts', () => {
  assert.match(createSettlementSource, /onCreate\(\{/);
  assert.match(createSettlementSource, /founderDrafts:\s*founderDrafts\.map/);
});

test('survivor tab no longer exposes manual survivor creation', () => {
  assert.doesNotMatch(settlementSource, /onCreateSurvivor/);
  assert.doesNotMatch(settlementSource, /submitSurvivor/);
  assert.doesNotMatch(settlementSource, /Create Survivor/);
  assert.doesNotMatch(settlementSource, /Add Survivor/);
});

test('app creates safe founders from founder drafts', () => {
  assert.match(appSource, /founderDrafts/);
  assert.match(appSource, /createSurvivor/);
  assert.match(appSource, /Founder \$\{index \+ 1\}/);
  assert.match(appSource, /activeSurvivorId/);
  assert.match(appSource, /founders\.find\(survivor =>\s*survivor\?\.id && survivor\.alive !== false/);
});
