import assert from 'node:assert/strict';
import test from 'node:test';

import { groupPassivesForPanel } from '../src/components/survivorPanelPassives.js';
import { createWeaponProficiency } from '../src/data/weaponProficiency.js';
import { getActiveSurvivorPassives } from '../src/game/passiveRegistry.js';

test('hunter panel groups active passives from the passive registry', () => {
  const passives = getActiveSurvivorPassives({
    survivor: {
      fightingArts: ['clawStyle'],
      weaponProficiency: createWeaponProficiency({ sword: { xp: 5 } }),
      traits: ['lanternEyed'],
      scars: ['deadEyeCalm'],
      disorders: ['cowardice'],
      boundGear: ['starter_sword']
    },
    settlement: {
      principles: {
        death: { id: 'graves', name: 'Graves', text: '+1 Memory when survivors die.' }
      }
    },
    combatState: {
      activeAuras: [{ id: 'aura-1', type: 'globalDamageBonus', amount: 1 }],
      monster: { quarryId: 'paleHuntLion' }
    }
  });
  const labels = groupPassivesForPanel(passives).map(group => group.label);

  assert.equal(labels.includes('Fighting Arts'), true);
  assert.equal(labels.includes('Weapon Proficiency'), true);
  assert.equal(labels.includes('Traits'), true);
  assert.equal(labels.includes('Scars'), true);
  assert.equal(labels.includes('Disorders'), true);
  assert.equal(labels.includes('Campaign Principles'), true);
  assert.equal(labels.includes('Gear Passives'), true);
  assert.equal(labels.includes('Temporary Hunt/Combat Modifiers'), true);
});

test('unknown passive source groups safely as other passives', () => {
  const groups = groupPassivesForPanel([{
    id: 'legacy:mystery',
    name: 'Mystery',
    sourceType: 'Legacy Mystery',
    timing: 'Inactive',
    text: 'Unknown old save data.',
    active: false
  }]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].label, 'Other Passives');
  assert.equal(groups[0].items[0].name, 'Mystery');
});

test('grouping is per passive list so hunter panels can differ independently', () => {
  const firstHunterGroups = groupPassivesForPanel(getActiveSurvivorPassives({
    survivor: { fightingArts: ['clawStyle'] }
  }));
  const secondHunterGroups = groupPassivesForPanel(getActiveSurvivorPassives({
    survivor: {
      weaponProficiency: createWeaponProficiency({ katar: { xp: 5 } })
    }
  }));

  assert.deepEqual(firstHunterGroups.map(group => group.label), ['Fighting Arts']);
  assert.deepEqual(secondHunterGroups.map(group => group.label), ['Weapon Proficiency']);
});

test('active fighting art button passives are discoverable as their own group', () => {
  const groups = groupPassivesForPanel(getActiveSurvivorPassives({
    survivor: { fightingArts: ['braceAndBreathe'] }
  }));
  const activeGroup = groups.find(group => group.label === 'Active Fighting Art Buttons');

  assert.ok(activeGroup);
  assert.equal(activeGroup.items[0].name, 'Brace and Breathe');
  assert.equal(activeGroup.items[0].timing, 'Active: once per fight');
});
