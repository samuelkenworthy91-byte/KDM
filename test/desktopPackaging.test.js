import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(
  new URL('../package.json', import.meta.url),
  'utf8'
));

test('browser and SteamOS package scripts remain available', () => {
  assert.equal(packageJson.scripts.dev, 'vite');
  assert.equal(packageJson.scripts.build, 'vite build');
  assert.ok(packageJson.scripts['desktop:dev']);
  assert.equal(packageJson.scripts['desktop:linux'], 'npm run dist:linux');
  assert.equal(packageJson.scripts['package:steamos'], 'npm run desktop:linux');
  assert.equal(packageJson.build.linux.artifactName, 'KDM.AppImage');
  assert.equal(packageJson.build.linux.icon, 'public/icons/kdm-icon.png');
});

test('legacy SteamOS installer path delegates to the maintained installer', () => {
  const installer = readFileSync(
    new URL('../scripts/install-steamos.sh', import.meta.url),
    'utf8'
  );
  assert.match(installer, /tools\/install-steamos\.sh/);
});
