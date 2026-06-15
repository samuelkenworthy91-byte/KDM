import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { quarryList } from '../src/data/quarries.js';

test('every huntable quarry has portrait metadata and an available PNG', () => {
  const huntableQuarries = quarryList.filter(quarry => quarry.role === 'quarry');

  huntableQuarries.forEach(quarry => {
    assert.equal(
      quarry.portraitPath,
      `./assets/quarries/portraits/${quarry.id.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()}.png`
    );
    assert.equal(quarry.portraitAlt, `${quarry.displayName} portrait`);
    assert.equal(
      existsSync(`public/${quarry.portraitPath.replace('./', '')}`),
      true,
      `${quarry.id} is missing ${quarry.portraitPath}`
    );
  });
});

test('non-quarry registry entries do not claim quarry portrait paths', () => {
  quarryList.filter(quarry => quarry.role !== 'quarry').forEach(quarry => {
    assert.equal(quarry.portraitPath, null);
    assert.ok(quarry.portraitAlt);
  });
});
