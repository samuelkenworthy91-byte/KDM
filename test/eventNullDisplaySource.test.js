import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const eventScreen = fs.readFileSync('src/screens/EventScreen.jsx', 'utf8');
const transactionLogic = fs.readFileSync('src/game/eventTransactionLogic.js', 'utf8');

test('event screen uses safe band labels in result display', () => {
  assert.match(eventScreen, /safeBandLabel\(result\.outcomeBand\)/);
  assert.doesNotMatch(eventScreen, /Outcome: \{result\.outcomeBand\.label\}/);
  assert.doesNotMatch(eventScreen, /Outcome band: \{result\.outcomeBand\.label\}/);
});

test('event screen filters null applied effects after formatting', () => {
  assert.match(eventScreen, /safeEffectText/);
  assert.match(eventScreen, /\.map\(safeEffectText\)/);
});

test('event transaction sanitises null text', () => {
  assert.match(transactionLogic, /cleanText/);
  assert.match(transactionLogic, /cleanEffects/);
});
