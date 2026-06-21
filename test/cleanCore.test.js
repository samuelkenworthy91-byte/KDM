import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('clean rebuild shell exists', () => {
  assert.equal(fs.existsSync('src/App.jsx'), true);
  assert.equal(fs.existsSync('src/main.jsx'), true);
});

test('preserved content folders are available', () => {
  assert.equal(fs.existsSync('src/data'), true);
});
