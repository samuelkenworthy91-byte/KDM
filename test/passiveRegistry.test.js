import test from 'node:test';
import assert from 'node:assert/strict';

import { createWeaponProficiency } from '../src/data/weaponProficiency.js';
import { getActiveSurvivorPassives } from '../src/game/passiveRegistry.js';

test('survivor with a fighting art returns a fighting art passive', () => {
  const passives = getActiveSurvivorPassives({
    survivor: { fightingArts: ['clawStyle'] }
  });

  const clawStyle = passives.find(passive => passive.id === 'clawStyle');
  assert.equal(clawStyle.sourceType, 'Fighting Art');
  assert.equal(clawStyle.name, 'Claw Style');
  assert.match(clawStyle.text, /Attacks deal \+1 damage/);
});

test('weapon proficiency returns passive summaries up to current level', () => {
  const passives = getActiveSurvivorPassives({
    survivor: {
      weaponProficiency: createWeaponProficiency({
        katar: { xp: 5 }
      })
    }
  }).filter(passive => passive.sourceType === 'Weapon Proficiency');

  assert.deepEqual(
    passives.map(passive => passive.id),
    ['weaponProficiency:katar:level1', 'weaponProficiency:katar:level2']
  );
  assert.match(passives[0].text, /two Katars/i);
  assert.match(passives[1].reason, /5 XP/);
});

test('survivor with Monster Bane returns a Monster Bane passive', () => {
  const passives = getActiveSurvivorPassives({
    survivor: { fightingArts: ['monsterBane_paleHuntLion'] },
    currentQuarryId: 'paleHuntLion'
  });

  const bane = passives.find(passive => passive.sourceType === 'Monster Bane');
  assert.equal(bane.name, 'Monster Bane: Pale Hunt Lion');
  assert.equal(bane.active, true);
  assert.equal(bane.reason, 'Matching quarry');
});

test('equipped gear with passiveText returns a gear passive', () => {
  const passives = getActiveSurvivorPassives({
    equippedGear: ['starter_sword']
  });

  const gear = passives.find(passive => passive.sourceType === 'Gear');
  assert.equal(gear.name, 'Basic Sword');
  assert.match(gear.text, /settlement weapon/i);
});

test('temporary combat and hunt modifiers appear', () => {
  const passives = getActiveSurvivorPassives({
    combatState: {
      activeAuras: [{
        id: 'aura-1',
        type: 'globalDamageBonus',
        amount: 1,
        duration: 'combat',
        sourceCardName: 'Test Aura'
      }]
    },
    huntState: {
      temporaryModifiers: {
        stormWarning: { text: 'Next rest is worse.' }
      }
    }
  }).filter(passive => passive.sourceType === 'Temporary Modifier');

  assert.equal(passives.some(passive => passive.id === 'temporary:aura:aura-1'), true);
  assert.equal(passives.some(passive => passive.id === 'temporary:stormWarning'), true);
});

test('unknown legacy IDs do not crash and return inactive records when useful', () => {
  const passives = getActiveSurvivorPassives({
    survivor: {
      fightingArts: ['unknownOldArt'],
      traits: ['unknownOldTrait'],
      scars: ['unknownOldScar'],
      disorders: ['unknownOldDisorder'],
      boundGear: [{ instanceId: 'old-gear', equipmentId: 'unknownOldGear' }]
    }
  });

  assert.equal(passives.some(passive => passive.reason === 'Unknown legacy fighting art'), true);
  assert.equal(passives.some(passive => passive.reason === 'Unknown legacy trait'), true);
  assert.equal(passives.some(passive => passive.reason === 'Unknown legacy scar'), true);
  assert.equal(passives.some(passive => passive.reason === 'Unknown legacy disorder'), true);
  assert.equal(passives.some(passive => passive.reason === 'Unknown legacy gear'), true);
});
