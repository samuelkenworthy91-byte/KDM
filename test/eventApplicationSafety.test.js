import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('App event application guards null survivor ids and recovers safely', () => {
  const appSource = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const handlerSource = appSource.slice(
    appSource.indexOf('const handleEventChoice = choice =>'),
    appSource.indexOf('const handleRestChoice =')
  );

  assert.doesNotMatch(appSource, /runParty\.find\(survivor => survivor\.id/);
  assert.doesNotMatch(appSource, /appliedSurvivors\.map\(survivor => survivor\.id/);
  assert.match(handlerSource, /survivor\?\.id/);
  assert.match(handlerSource, /createEventRecoveryResult/);
  assert.match(handlerSource, /catch \(error\)/);
});
