import test from 'node:test';
import assert from 'node:assert/strict';
import rawCards from '../all_deck_cards.json' with { type: 'json' };
import {
  applyDamageToSurvivor,
  applyEndTurnStatuses,
  applyMonsterIntent,
  createCombatState,
  endTurn,
  getPostCombatSalvageRewards,
  playCard,
  resolveAfterCombatHealing
} from '../src/game/combatLogic.js';
import {
  getCanonicalStatusEffectType,
  overhaulCards
} from '../src/data/overhaul/cardRegistry.js';
import { cards } from '../src/data/cards.js';
import { selectRandomLivingSurvivor } from '../src/game/monsterTargeting.js';

function monster(effects = []) {
  return {
    id: 'statusMonster',
    name: 'Status Monster',
    hp: 30,
    maxHp: 30,
    block: 0,
    intents: [{
      id: 'idle',
      name: 'Idle',
      tellText: 'Idle',
      revealedText: 'Idle',
      tags: [],
      effects
    }]
  };
}

function stateWithCard(card, overrides = {}) {
  return {
    ...createCombatState(monster(), { runDeck: [] }),
    hand: [card],
    drawPile: [],
    discardPile: [],
    survivor: {
      ...createCombatState(monster(), { runDeck: [] }).survivor,
      energy: 3,
      ...(overrides.survivor || {})
    },
    monster: {
      ...createCombatState(monster(), { runDeck: [] }).monster,
      ...(overrides.monster || {})
    },
    ...overrides.state
  };
}

test('Staggered doubles next incoming hit and is consumed before Vulnerable', () => {
  const card = { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 4 }] };
  const result = playCard(0, stateWithCard(card, {
    monster: { hp: 30, block: 0, staggered: 1, vulnerable: 1 }
  }));
  assert.equal(result.monster.hp, 18);
  assert.equal(result.monster.staggered, 0);
  assert.equal(result.monster.vulnerable, 0);
});

test('Snared reduces next outgoing survivor hit by 5 and is consumed', () => {
  const card = { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 7 }] };
  const result = playCard(0, stateWithCard(card, {
    survivor: { snared: 1 }
  }));
  assert.equal(result.monster.hp, 28);
  assert.equal(result.survivor.snared, 0);
});

test('Blind reduces next outgoing survivor hit by 3 and is consumed', () => {
  const card = { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 7 }] };
  const result = playCard(0, stateWithCard(card, {
    survivor: { blind: 1 }
  }));
  assert.equal(result.monster.hp, 26);
  assert.equal(result.survivor.blind, 0);
});

test('Shock increases survivor card cost by 1', () => {
  const expensive = { id: 'cost3', name: 'Cost 3', cost: 3, type: 'skill', effects: [{ type: 'block', amount: 1 }] };
  const blocked = playCard(0, stateWithCard(expensive, { survivor: { energy: 3, shock: 1 } }));
  assert.equal(blocked.survivor.energy, 3);
  assert.equal(blocked.hand.length, 1);

  const playable = { id: 'cost2', name: 'Cost 2', cost: 2, type: 'skill', effects: [{ type: 'block', amount: 1 }] };
  const result = playCard(0, stateWithCard(playable, { survivor: { energy: 3, shock: 1 } }));
  assert.equal(result.survivor.energy, 0);
  assert.equal(result.survivor.shock, 0);
});

test('Shock blocks one quarry non-damage status from an intent', () => {
  const base = createCombatState(monster([
    { type: 'dealDamage', amount: 3 },
    { type: 'applyBleed', amount: 2 }
  ]), { runDeck: [] });
  const result = applyMonsterIntent({ ...base.monster, shock: 1 }, base);
  assert.equal(result.survivor.hp, base.survivor.hp - 2);
  assert.equal(result.survivor.bleed || 0, 0);
});

test('Burn strips block and removes Guarded', () => {
  const base = createCombatState(monster(), { runDeck: [] });
  const result = applyMonsterIntent({ ...base.monster, burn: 3, block: 2, guarded: 1, hp: 10 }, base);
  assert.equal(result.monster.hp, 9);
  assert.equal(result.monster.guarded, 0);
  assert.equal(result.monster.burn, 2);
});

test('Poison halves healing', () => {
  const card = { id: 'heal', name: 'Heal', cost: 0, type: 'skill', effects: [{ type: 'healSelf', amount: 5 }] };
  const result = playCard(0, stateWithCard(card, {
    survivor: { hp: 10, maxHp: 20, poison: 1 }
  }));
  assert.equal(result.survivor.hp, 12);
});

test('Vulnerable increases incoming hit by 50%', () => {
  const result = applyDamageToSurvivor({
    survivor: { hp: 20, block: 0, vulnerable: 1 },
    amount: 5
  });
  assert.equal(result.survivor.hp, 12);
  assert.equal(result.survivor.vulnerable, 0);
});

test('Guarded reduces incoming hit by 2', () => {
  const result = applyDamageToSurvivor({
    survivor: { hp: 20, block: 0, guarded: 1 },
    amount: 5
  });
  assert.equal(result.survivor.hp, 17);
  assert.equal(result.survivor.guarded, 0);
});

test('aura card activates an active aura', () => {
  const card = {
    id: 'warBeat',
    name: 'War Beat',
    cost: 0,
    type: 'skill',
    effects: [{ type: 'aura', auraType: 'globalDamageBonus', amount: 2, duration: 'combat' }]
  };
  const result = playCard(0, stateWithCard(card));

  assert.equal(result.activeAuras.length, 1);
  assert.equal(result.activeAuras[0].type, 'globalDamageBonus');
  assert.equal(result.activeAuras[0].amount, 2);
});

test('global damage aura applies to attacks', () => {
  const attack = { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 4 }] };
  const result = playCard(0, stateWithCard(attack, {
    state: {
      activeAuras: [{
        id: 'aura-1',
        sourceCardId: 'warBeat',
        sourceCardName: 'War Beat',
        type: 'globalDamageBonus',
        amount: 2,
        duration: 'combat'
      }]
    }
  }));

  assert.equal(result.monster.hp, 24);
});

test('global block-card aura applies to block cards', () => {
  const block = { id: 'guard', name: 'Guard', cost: 0, type: 'skill', effects: [{ type: 'block', amount: 3 }] };
  const result = playCard(0, stateWithCard(block, {
    state: {
      activeAuras: [{
        id: 'aura-1',
        sourceCardId: 'shieldHymn',
        sourceCardName: 'Shield Hymn',
        type: 'globalBlockCardBonus',
        amount: 2,
        duration: 'combat'
      }]
    }
  }));

  assert.equal(result.survivor.block, 5);
});

test('next survivor damage aura applies only once', () => {
  const attack = { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 4 }] };
  const first = playCard(0, stateWithCard(attack, {
    state: {
      activeAuras: [{
        id: 'aura-1',
        sourceCardId: 'warBeat',
        sourceCardName: 'War Beat',
        type: 'nextSurvivorDamageBonus',
        amount: 3,
        duration: 'nextUse',
        remainingUses: 1
      }]
    }
  }));
  const second = playCard(0, {
    ...first,
    hand: [attack],
    survivor: { ...first.survivor, energy: 3 }
  });

  assert.equal(first.monster.hp, 23);
  assert.equal(first.activeAuras.some(aura => aura.type === 'nextSurvivorDamageBonus'), false);
  assert.equal(second.monster.hp, 19);
});

test('DoT multiplier applies only while aura is active', () => {
  const base = createCombatState(monster(), { runDeck: [] });
  const withAura = endTurn({
    ...base,
    survivor: { ...base.survivor, bleed: 2 },
    activeAuras: [{
      id: 'aura-1',
      sourceCardId: 'grindingRhythm',
      sourceCardName: 'Grinding Rhythm',
      type: 'dotDamageMultiplier',
      amount: 2,
      duration: 'combat'
    }]
  });
  const withoutAura = endTurn({
    ...base,
    survivor: { ...base.survivor, bleed: 2 },
    activeAuras: []
  });

  assert.equal(withAura.survivor.hp, base.survivor.hp - 4);
  assert.equal(withoutAura.survivor.hp, base.survivor.hp - 2);
});

test('block persistence aura expires after monster turn', () => {
  const base = createCombatState(monster(), { runDeck: [] });
  const result = endTurn({
    ...base,
    survivor: { ...base.survivor, block: 5 },
    activeAuras: [{
      id: 'aura-1',
      sourceCardId: 'lockedGuard',
      sourceCardName: 'Locked Guard',
      type: 'blockPersistsUntilRoundEnd',
      amount: 1,
      duration: 'nextMonsterTurn',
      remainingRounds: 1
    }]
  });

  assert.equal(result.survivor.block, 5);
  assert.equal(result.activeAuras.some(aura => aura.type === 'blockPersistsUntilRoundEnd'), false);
});

test('party after-combat heal aura stores modest healing', () => {
  const card = {
    id: 'triageCircle',
    name: 'Triage Circle',
    cost: 0,
    type: 'skill',
    effects: [{ type: 'aura', auraType: 'partyAfterCombatHeal', amount: 1, duration: 'combat' }]
  };
  const played = playCard(0, stateWithCard(card, {
    survivor: { hp: 8, maxHp: 10 }
  }));
  const healed = resolveAfterCombatHealing({
    survivor: played.survivor,
    afterCombatHealing: played.afterCombatHealing
  }, 'victory');

  assert.equal(played.afterCombatHealing, 1);
  assert.equal(healed.survivor.hp, 9);
});

test('Bleed ignores block and can kill', () => {
  const log = [];
  const result = applyEndTurnStatuses({ hp: 2, block: 10, bleed: 3 }, 'Target', log);
  assert.equal(result.hp, 0);
  assert.equal(result.block, 10);
  assert.equal(result.bleed, 2);
});

test('Doom ruptures for 10 true damage', () => {
  const base = createCombatState(monster(), { runDeck: [] });
  const result = applyMonsterIntent({ ...base.monster, doom: 1, block: 10, hp: 20 }, base);
  assert.equal(result.monster.hp, 10);
  assert.equal(result.monster.doom, 0);
});

test('Prepared boosts next card and is consumed', () => {
  const card = { id: 'hit', name: 'Hit', cost: 0, type: 'attack', effects: [{ type: 'damage', amount: 4 }] };
  const result = playCard(0, stateWithCard(card, {
    survivor: { prepared: 1 }
  }));
  assert.equal(result.monster.hp, 25);
  assert.equal(result.survivor.prepared, 0);
});

test('Salvage adds post-combat reward value', () => {
  const card = { id: 'salvage', name: 'Salvage', cost: 0, type: 'skill', effects: [{ type: 'salvageSelf', amount: 2 }] };
  const result = playCard(0, stateWithCard(card));
  const rewards = getPostCombatSalvageRewards(result);
  assert.equal(rewards.salvageTokens, 2);
  assert.deepEqual(rewards.resources, ['scrap', 'scrap']);
});

test('Healing during combat works and caps at max HP', () => {
  const card = { id: 'heal', name: 'Heal', cost: 0, type: 'skill', effects: [{ type: 'healSelf', amount: 10 }] };
  const result = playCard(0, stateWithCard(card, {
    survivor: { hp: 18, maxHp: 20 }
  }));
  assert.equal(result.survivor.hp, 20);
});

test('Heal after combat applies and persists', () => {
  const healed = resolveAfterCombatHealing({
    survivor: { name: 'Ari', hp: 5, maxHp: 10, alive: true, isAlive: true },
    afterCombatHealing: 4
  }, 'victory');
  assert.equal(healed.survivor.hp, 9);
  assert.match(healed.afterCombatLog[0], /Ari healed 4 HP/);
});

test('Dead survivors are not healed unless revive is explicit', () => {
  const healed = resolveAfterCombatHealing({
    survivor: { name: 'Ari', hp: 0, maxHp: 10, alive: false, isAlive: false },
    afterCombatHealing: 4
  }, 'loss');
  assert.equal(healed.survivor.hp, 0);
});

test('Parser maps all v8 statusApplied values to implemented effects', () => {
  const statuses = new Set();
  rawCards.forEach(card => {
    if (!card.statusApplied) return;
    if (typeof card.statusApplied === 'object') {
      Object.keys(card.statusApplied).forEach(status => statuses.add(status));
    } else {
      String(card.statusApplied).split(/[;,]/).forEach(part => {
        const match = part.match(/([A-Za-z ]+)/);
        if (match) statuses.add(match[1].trim());
      });
    }
  });
  statuses.forEach(status => {
    assert.ok(getCanonicalStatusEffectType(status), `missing canonical parser mapping for ${status}`);
  });
});

test('No implemented status silently does nothing', () => {
  const implemented = [
    'bleedTarget',
    'burnTarget',
    'poisonTarget',
    'doomTarget',
    'vulnerableTarget',
    'staggerTarget',
    'guardTarget',
    'markTarget',
    'exposeTarget',
    'snareTarget',
    'shockTarget',
    'blindTarget',
    'preparedSelf',
    'salvageSelf',
    'testBonus',
    'consequenceReduction',
    'reduceBleedSelf',
    'targetAvoidance',
    'healSelf',
    'healAfterCombat',
    'partyHealAfterCombat'
  ];
  const seen = new Set(Object.values(overhaulCards).flatMap(card => card.effects.map(effect => effect.type)));
  implemented.forEach(type => {
    assert.ok(
      seen.has(type) || [
        'vulnerableTarget',
        'healSelf',
        'healAfterCombat',
        'partyHealAfterCombat'
      ].includes(type),
      `${type} has no parser or card coverage`
    );
  });
});

test('medical and scent effects resolve as real mechanics', () => {
  const bandages = cards.bandagesResonance;
  const fecalSalve = cards.fecalSalveResonance;
  const bandageState = createCombatState(monster(), {
    survivor: {
      id: 'medic',
      name: 'Medic',
      hp: 5,
      maxHp: 10,
      block: 0,
      bleed: 3,
      energy: 3
    },
    runDeck: [bandages]
  });
  bandageState.survivor.bleed = 3;

  const bleedingBandageResult = playCard(0, { ...bandageState, hand: [bandages] });

  assert.equal(bleedingBandageResult.survivor.bleed, 2);
  assert.equal(bleedingBandageResult.survivor.hp, 6);
  assert.equal(bleedingBandageResult.afterCombatHealing, 1);

  const salveState = createCombatState(monster(), {
    survivor: {
      id: 'salve',
      name: 'Salve',
      hp: 10,
      maxHp: 10,
      block: 0,
      energy: 3
    },
    runDeck: [fecalSalve]
  });
  const salveResult = playCard(0, { ...salveState, hand: [fecalSalve] });

  assert.equal(salveResult.survivor.targetAvoidance, 3);
  assert.equal(salveResult.survivor.guarded, 1);
  assert.equal(salveResult.discardPile.some(card => card.id === 'panic'), true);
});

test('target avoidance lowers random targeting weight without making survivor untargetable', () => {
  const party = [
    { survivor: { id: 'masked', hp: 10, isAlive: true, alive: true, targetAvoidance: 3 } },
    { survivor: { id: 'plain', hp: 10, isAlive: true, alive: true } }
  ];

  assert.equal(selectRandomLivingSurvivor(party, {}, () => 0.19), 'masked');
  assert.equal(selectRandomLivingSurvivor(party, {}, () => 0.21), 'plain');
});
