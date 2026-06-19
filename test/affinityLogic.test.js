import test from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../src/data/cards.js';
import { equipment, equipmentList } from '../src/data/equipment.js';
import {
  AFFINITY_COLORS,
  calculateAffinityTotals,
  formatAffinityTotals,
  getActiveAffinityBonuses,
  getAffinityCombatBonus,
  getItemAffinities,
  getPurpleHarvestBonus
} from '../src/game/affinityLogic.js';
import { buildRunDeck } from '../src/game/deckLogic.js';
import { buildHarvestRewardOffers } from '../src/game/harvestRewardLogic.js';
import { createCombatState, playCard } from '../src/game/combatLogic.js';

function monster() {
  return {
    id: 'affinityMonster',
    name: 'Affinity Monster',
    hp: 30,
    maxHp: 30,
    block: 0,
    intents: [{ id: 'idle', name: 'Idle', tellText: 'Idle', revealedText: 'Idle', tags: [], effects: [] }]
  };
}

function stateWithCard(card, bonus = {}) {
  const base = createCombatState(monster(), { runDeck: [], ...bonus });
  return {
    ...base,
    hand: [card],
    drawPile: [],
    discardPile: [],
    survivor: { ...base.survivor, energy: 3 }
  };
}

test('every equipment item has valid affinity data', () => {
  equipmentList.forEach(item => {
    const affinities = getItemAffinities(item);
    assert.deepEqual(Object.keys(affinities), AFFINITY_COLORS, `${item.id} should use the four affinity colours`);
    assert.ok(Object.values(affinities).some(value => value > 0), `${item.id} should have at least one affinity`);
    Object.entries(affinities).forEach(([color, value]) => {
      assert.ok(AFFINITY_COLORS.includes(color), `${item.id} has invalid affinity ${color}`);
      assert.ok(Number.isInteger(value), `${item.id} ${color} should be an integer`);
      assert.ok(value >= 0, `${item.id} ${color} should not be negative`);
    });
  });
});

test('bespoke affinity roles cover expected gear families', () => {
  const daggers = equipmentList.filter(item =>
    item.weaponType === 'dagger' || /knife|dagger/i.test(`${item.name} ${(item.keywords || []).join(' ')}`)
  );
  const shields = equipmentList.filter(item => item.weaponType === 'shield' || /shield|buckler|targe/i.test(item.name));
  const grandWeapons = equipmentList.filter(item => item.weaponType === 'grandWeapon');
  const defensiveArmour = equipmentList.filter(item => item.loadoutCategory === 'armor' || item.itemType === 'armor');
  const healingTools = equipmentList.filter(item =>
    item.loadoutCategory === 'tool' && /heal|wound|survival|organ|flask|broth|wrap|salve/i.test(`${item.name} ${item.passiveText || ''} ${(item.keywords || []).join(' ')}`)
  );
  const harvestTools = equipmentList.filter(item =>
    item.loadoutCategory === 'tool' && /harvest|weak|eye|lens|needle|snare|hook|gauge|hunt/i.test(`${item.name} ${item.passiveText || ''} ${(item.keywords || []).join(' ')}`)
  );

  assert.ok(daggers.filter(item => getItemAffinities(item).purple > 0 || getItemAffinities(item).red > 0).length / daggers.length >= 0.8);
  assert.ok(shields.filter(item => getItemAffinities(item).blue > 0).length / shields.length >= 0.8);
  assert.ok(grandWeapons.filter(item => getItemAffinities(item).red > 0).length / grandWeapons.length >= 0.8);
  assert.ok(defensiveArmour.filter(item => getItemAffinities(item).blue > 0).length / defensiveArmour.length >= 0.8);
  assert.ok(healingTools.every(item => getItemAffinities(item).green > 0));
  assert.ok(harvestTools.every(item => getItemAffinities(item).purple > 0));
});

test('affinity totals and active bonus labels calculate from equipped gear', () => {
  const equippedGear = [
    { equipmentId: 'starter_axe' },
    { equipmentId: 'starter_grand_weapon' },
    { equipmentId: 'starter_shield' },
    { equipmentId: 'starter_hide_vest' },
    { equipmentId: 'starter_survival_wrap' },
    { equipmentId: 'bone_broth_flask' }
  ];
  const totals = calculateAffinityTotals(equippedGear);
  assert.ok(totals.red >= 2);
  assert.ok(totals.blue >= 2);
  assert.ok(totals.green >= 2);
  const labels = formatAffinityTotals(totals);
  const bonuses = getActiveAffinityBonuses(totals);
  assert.ok(labels.some(label => label.startsWith('Red ')));
  assert.ok(bonuses.some(bonus => bonus.label === 'Red 2'));
  assert.ok(bonuses.some(bonus => bonus.label === 'Blue 2'));
  assert.ok(bonuses.some(bonus => bonus.label === 'Green 2'));
});

test('combat affinity thresholds grant red, blue, and green bonuses', () => {
  const red = playCard(0, stateWithCard(
    { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 4 }] },
    { affinityBonus: getAffinityCombatBonus({ red: 2, blue: 0, green: 0, purple: 0 }) }
  ));
  assert.equal(red.monster.hp, 25);

  const blue = playCard(0, stateWithCard(
    { id: 'guard', name: 'Guard', cost: 0, type: 'skill', effects: [{ type: 'block', amount: 4 }] },
    { affinityBonus: getAffinityCombatBonus({ red: 0, blue: 2, green: 0, purple: 0 }) }
  ));
  assert.equal(blue.survivor.block, 5);

  const green = playCard(0, stateWithCard(
    { id: 'heal', name: 'Heal', cost: 0, type: 'skill', effects: [{ type: 'healSelf', amount: 2 }] },
    { affinityBonus: getAffinityCombatBonus({ red: 0, blue: 0, green: 2, purple: 0 }), survivor: { hp: 5, maxHp: 20 } }
  ));
  assert.equal(green.survivor.hp, 8);
});

test('purple affinity improves level 1 and max-level quarry rewards without level 4 loot', () => {
  const levelOneBonus = getPurpleHarvestBonus({ red: 0, blue: 0, green: 0, purple: 4 });
  const levelOne = buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 1,
    quarryLevelBonus: levelOneBonus.quarryLevelBonus,
    offerSeed: 'purple-level-one'
  });
  assert.ok(levelOne.some(offer => ['rare', 'strange'].includes(offer.rarityTier)));

  const maxBonus = getPurpleHarvestBonus({ red: 0, blue: 0, green: 0, purple: 6 });
  const maxLevel = buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 3,
    quarryLevelBonus: maxBonus.quarryLevelBonus,
    extraOfferCount: maxBonus.extraOfferCount,
    rarityUpgrade: maxBonus.rarityUpgrade,
    offerSeed: 'purple-max-level'
  });
  assert.ok(maxLevel.length >= 5);
  assert.doesNotThrow(() => buildHarvestRewardOffers({
    quarryId: 'paleHuntLion',
    quarryLevel: 3,
    quarryLevelBonus: maxBonus.quarryLevelBonus,
    offerSeed: 'purple-max-safe'
  }));
});

test('gear card packages still resolve and gear cards inherit affinity metadata', () => {
  equipmentList.forEach(item => {
    assert.ok(Array.isArray(item.cardPackage));
    item.cardPackage.forEach(cardId => assert.ok(cards[cardId], `${item.id} missing ${cardId}`));
  });
  const deck = buildRunDeck({
    survivor: { id: 's1', name: 'Affinity Tester' },
    equippedGear: [{ equipmentId: 'starter_axe', instanceId: 'axe-1' }]
  });
  const gearCard = deck.find(card => card.sourceGearId === 'starter_axe');
  assert.ok(gearCard);
  assert.ok(gearCard.affinities.red > 0);
});

test('aura cards pass focused aura audit', () => {
  const auraCards = Object.values(cards).filter(card =>
    card.tags?.includes?.('aura') || card.tags?.includes?.('Aura')
  );
  assert.ok(auraCards.length > 0);
  auraCards.forEach(card => {
    assert.ok(card.tags.includes('aura'), `${card.id} should use normalized aura tag`);
    assert.ok([2, 3].includes(Number(card.cost)), `${card.id} has bad aura cost`);
    assert.equal(card.exhaust, true, `${card.id} should exhaust`);
    const auraEffects = (card.effects || []).filter(effect => effect.type === 'aura');
    assert.ok(auraEffects.length > 0, `${card.id} should have aura effect data`);
    assert.ok(auraEffects.every(effect => effect.duration === 'combat'), `${card.id} should last combat`);
  });
});
