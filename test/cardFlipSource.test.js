import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const flippablePath = path.join(root, 'src/ui/components/FlippableCard.jsx');
const previewPath = path.join(root, 'src/ui/components/CardPreview.jsx');
const handPath = path.join(root, 'src/ui/components/CardHand.jsx');

test('FlippableCard exists and supports front/back state', () => {
  assert.ok(fs.existsSync(flippablePath));
  const source = fs.readFileSync(flippablePath, 'utf8');
  assert.match(source, /useState/);
  assert.match(source, /isBackVisible/);
  assert.match(source, /side=\{isBackVisible \? 'back' : 'front'\}/);
});

test('CardPreview uses safe fallback text', () => {
  const source = fs.readFileSync(previewPath, 'utf8');
  assert.match(source, /safeValue/);
  assert.match(source, /Unnamed Card/);
  assert.match(source, /No rules text available/);
  assert.doesNotMatch(source, new RegExp('>' + 'null' + '<'));
  assert.doesNotMatch(source, new RegExp('\\{' + 'null' + '\\}'));
});

test('Combat hand uses FlippableCard or CardPreview', () => {
  const source = fs.readFileSync(handPath, 'utf8');
  assert.match(source, /FlippableCard|CardPreview/);
});
