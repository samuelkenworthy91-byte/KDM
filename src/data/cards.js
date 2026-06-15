import { gearCards } from './gearCards.js';
import { monsterRewardCards } from './monsterSurvivorRewards.js';
import { fightingArtCards } from './fightingArtCards.js';
import { overhaulCards } from './overhaul/cardRegistry.js';

function card(id, name, cost, description, effects, options = {}) {
  return {
    id,
    name,
    cost,
    description,
    effects,
    type: options.type || 'skill',
    tags: options.tags || [],
    sourceType: options.sourceType || 'personal',
    sourceGearId: options.sourceGearId,
    weaponType: options.weaponType,
    exhaust: options.exhaust,
    implemented: options.implemented !== false
  };
}

export const weaponMasteryCards = {
  masterySwordMarkedEcho: card('masterySwordMarkedEcho', 'Marked Echo', 1, 'Deal 5 damage. If the monster is Marked, deal +3 and draw 1.', [{ type: 'damage', amount: 5, bonusIfMonsterMarked: 3 }, { type: 'drawByMonsterMarked', amount: 1 }], { type: 'attack', tags: ['mastery', 'precise', 'marked'], sourceType: 'weaponMastery', weaponType: 'sword' }),
  masteryAxeSunder: card('masteryAxeSunder', 'Total Sunder', 2, 'Remove all monster block, then deal 8 damage. Deal +4 if it had block.', [{ type: 'removeAllMonsterBlock' }, { type: 'damage', amount: 8, bonusIfMonsterHasBlock: 4 }], { type: 'attack', tags: ['mastery', 'heavy', 'breaker'], sourceType: 'weaponMastery', weaponType: 'axe' }),
  masteryDaggerRedOpening: card('masteryDaggerRedOpening', 'Red Opening', 1, 'Deal 2 damage three times and apply 2 Bleed. Fragile weak points are riskier.', [{ type: 'multiHitDamage', amount: 2, hits: 3 }, { type: 'bleedMonster', amount: 2 }], { type: 'attack', tags: ['mastery', 'quick', 'bleed', 'weakPointRisk'], sourceType: 'weaponMastery', weaponType: 'dagger' }),
  masterySpearHeldLine: card('masterySpearHeldLine', 'Hold the Long Line', 1, 'Gain 8 block and improve the next Counter by 3.', [{ type: 'block', amount: 8 }, { type: 'nextCounterBonus', amount: 3 }], { tags: ['mastery', 'reach', 'counter', 'safeWeakPoint'], sourceType: 'weaponMastery', weaponType: 'spear' }),
  masteryBowPredatorsArc: card('masteryBowPredatorsArc', "Predator's Arc", 1, 'Deal 4 damage, Mark the monster, and draw 1.', [{ type: 'damage', amount: 4 }, { type: 'markMonster' }, { type: 'draw', amount: 1 }], { type: 'attack', tags: ['mastery', 'ranged', 'precise', 'marked'], sourceType: 'weaponMastery', weaponType: 'bow' }),
  masteryClubCrushingRebuke: card('masteryClubCrushingRebuke', 'Crushing Rebuke', 1, 'Deal 6 damage, apply 1 Vulnerable, and gain 4 block.', [{ type: 'damage', amount: 6 }, { type: 'vulnerableMonster', amount: 1 }, { type: 'block', amount: 4 }], { type: 'attack', tags: ['mastery', 'heavy', 'block', 'vulnerable'], sourceType: 'weaponMastery', weaponType: 'club' }),
  masteryHammerFaultLine: card('masteryHammerFaultLine', 'Fault Line', 2, 'Remove 6 monster block, deal 7 damage, and apply 2 Staggered.', [{ type: 'removeMonsterBlock', amount: 6 }, { type: 'damage', amount: 7 }, { type: 'staggerMonster', amount: 2 }], { type: 'attack', tags: ['mastery', 'heavy', 'breaker', 'staggered'], sourceType: 'weaponMastery', weaponType: 'hammer' }),
  masteryGrandWeaponFinalArc: card('masteryGrandWeaponFinalArc', 'Final Arc', 3, 'Deal 16 damage and gain 5 block.', [{ type: 'damage', amount: 16 }, { type: 'block', amount: 5 }], { type: 'attack', tags: ['mastery', 'heavy', 'brutal'], sourceType: 'weaponMastery', weaponType: 'grandWeapon' }),
  masteryKatarMarkedFrenzy: card('masteryKatarMarkedFrenzy', 'Marked Frenzy', 2, 'Deal 3 damage three times, or 5 damage three times if the monster is Marked.', [{ type: 'multiHitDamage', amount: 3, hits: 3, markedAmount: 5 }], { type: 'attack', tags: ['mastery', 'quick', 'multiHit', 'marked'], sourceType: 'weaponMastery', weaponType: 'katar' }),
  masteryFistAndToothLastBreath: card('masteryFistAndToothLastBreath', 'Last-Breath Counter', 1, 'Gain 4 block and improve the next Counter by 4. Heal 1 while wounded.', [{ type: 'block', amount: 4 }, { type: 'nextCounterBonus', amount: 4 }, { type: 'healIfWounded', amount: 1 }], { tags: ['mastery', 'counter', 'wound', 'comeback'], sourceType: 'weaponMastery', weaponType: 'fistAndTooth' }),
  masteryShieldReturnedForce: card('masteryShieldReturnedForce', 'Returned Force', 1, 'Deal damage equal to half your block, up to 20, then gain 1 survival.', [{ type: 'damageFromBlock', divisor: 2, maximum: 20 }, { type: 'survival', amount: 1 }], { type: 'attack', tags: ['mastery', 'block', 'counter', 'survival'], sourceType: 'weaponMastery', weaponType: 'shield' }),
  masteryWhipBindingRead: card('masteryWhipBindingRead', 'Binding Read', 0, 'Mark the monster, clarify the tell, and gain 3 block. Exhaust.', [{ type: 'markMonster' }, { type: 'revealIntentHint' }, { type: 'block', amount: 3 }], { tags: ['mastery', 'reach', 'marked', 'reveal', 'exhaust'], sourceType: 'weaponMastery', weaponType: 'whip', exhaust: true }),
  masteryScytheHarvestFear: card('masteryScytheHarvestFear', 'Harvest Fear', 2, 'Deal 7 damage, apply 2 Bleed, and deal +1 per Panic in discard, maximum +4.', [{ type: 'damage', amount: 7, bonusPerPanicInDiscard: 1, maximumBonus: 4 }, { type: 'bleedMonster', amount: 2 }], { type: 'attack', tags: ['mastery', 'heavy', 'bleed', 'panic'], sourceType: 'weaponMastery', weaponType: 'scythe' }),
  masteryKatanaUnbrokenMoment: card('masteryKatanaUnbrokenMoment', 'Unbroken Moment', 2, 'Deal 10 damage, +5 if this is your first attack and no block card was played this turn.', [{ type: 'damage', amount: 10, bonusIfFirstAttackWithoutBlock: 5 }], { type: 'attack', tags: ['mastery', 'precise', 'firstStrike', 'risk'], sourceType: 'weaponMastery', weaponType: 'katana' }),
  masteryStrangeWeaponBlackRite: card('masteryStrangeWeaponBlackRite', 'Black Rite', 0, 'Draw 3, add 2 Panic, and gain 1 energy. Exhaust.', [{ type: 'draw', amount: 3 }, { type: 'addPanic', amount: 2 }, { type: 'energy', amount: 1 }], { tags: ['mastery', 'strange', 'panic', 'ritual', 'exhaust'], sourceType: 'weaponMastery', weaponType: 'strangeWeapon', exhaust: true })
};

export const cards = {
  ...overhaulCards,
  ...weaponMasteryCards,
  foundingStone: card('foundingStone', 'Founding Stone', 1, 'Deal 6 damage. Exhaust.', [{ type: 'damage', amount: 6 }], { type: 'attack', tags: ['brutal'], exhaust: true }),
  wildSwing: card('wildSwing', 'Wild Swing', 2, 'Deal 10 damage.', [{ type: 'damage', amount: 10 }], { type: 'attack', tags: ['brutal', 'hideBreaker'] }),
  scramble: card('scramble', 'Scramble', 1, 'Gain 5 block.', [{ type: 'block', amount: 5 }]),
  desperateDodge: card('desperateDodge', 'Desperate Dodge', 1, 'Gain 4 block. Gain 8 instead while below half HP.', [{ type: 'conditionalBlock', amount: 4, lowHpAmount: 8 }]),
  encourage: card('encourage', 'Encourage', 0, 'Gain 1 survival. Draw 1 card.', [{ type: 'survival', amount: 1 }, { type: 'draw', amount: 1 }]),
  panic: {
    id: 'panic',
    name: 'Panic',
    cost: 0,
    description: 'Unplayable.',
    type: 'curse',
    tags: ['curse', 'panic'],
    sourceType: 'curse',
    unplayable: true,
    effects: []
  },

  hack: card('hack', 'Hack', 1, 'Deal 5 damage.', [{ type: 'damage', amount: 5 }], { type: 'attack' }),
  carve: card('carve', 'Carve', 1, 'Deal 3 damage. Draw 1 card.', [{ type: 'damage', amount: 3 }, { type: 'draw', amount: 1 }], { type: 'attack' }),
  skullCrack: card('skullCrack', 'Skull Crack', 1, 'Remove 4 monster block, then deal 4 damage.', [{ type: 'removeMonsterBlock', amount: 4 }, { type: 'damage', amount: 4 }], { type: 'attack', tags: ['breaker', 'headHunter'] }),
  guardBreak: card('guardBreak', 'Guard Break', 1, 'Remove all monster block. Exhaust.', [{ type: 'removeAllMonsterBlock' }], { exhaust: true }),
  boneDart: card('boneDart', 'Bone Dart', 0, 'Deal 2 damage. Draw 1. Exhaust.', [{ type: 'damage', amount: 2 }, { type: 'draw', amount: 1 }], { type: 'attack', exhaust: true }),
  quickToss: card('quickToss', 'Quick Toss', 1, 'Deal 3 damage twice.', [{ type: 'damage', amount: 3 }, { type: 'damage', amount: 3 }], { type: 'attack' }),
  brace: card('brace', 'Brace', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }]),
  duckAndRoll: card('duckAndRoll', 'Duck and Roll', 0, 'Gain 3 block. Exhaust.', [{ type: 'block', amount: 3 }], { exhaust: true }),
  rawhideDodge: card('rawhideDodge', 'Rawhide Dodge', 0, 'Gain 6 block. Exhaust.', [{ type: 'block', amount: 6 }], { exhaust: true }),
  readTheBeast: card('readTheBeast', 'Read the Beast', 0, 'Gain 1 survival. Draw 1 card. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'draw', amount: 1 }], { exhaust: true }),
  slipAway: card('slipAway', 'Slip Away', 0, 'Gain 4 block. Draw 1.', [{ type: 'block', amount: 4 }, { type: 'draw', amount: 1 }]),
  clawStrike: card('clawStrike', 'Claw Strike', 1, 'Deal 4 damage. Your next attack deals +1.', [{ type: 'damage', amount: 4 }, { type: 'nextAttackBonus', amount: 1 }], { type: 'attack' }),
  ripOpen: card('ripOpen', 'Rip Open', 1, 'Deal 6 damage.', [{ type: 'damage', amount: 6 }], { type: 'attack' }),
  bloodRush: card('bloodRush', 'Blood Rush', 0, 'Gain 1 energy. Draw 1.', [{ type: 'energy', amount: 1 }, { type: 'draw', amount: 1 }]),
  strangeGlimpse: card('strangeGlimpse', 'Strange Glimpse', 0, 'Draw 1. Exhaust.', [{ type: 'draw', amount: 1 }], { exhaust: true }),
  seeThePattern: card('seeThePattern', 'See the Pattern', 0, 'Draw 2. Add 1 Panic to discard. Exhaust.', [{ type: 'draw', amount: 2 }, { type: 'addPanic', amount: 1 }], { exhaust: true }),
  boneFlurry: card('boneFlurry', 'Bone Flurry', 2, 'Deal 3 damage three times.', [{ type: 'damage', amount: 3 }, { type: 'damage', amount: 3 }, { type: 'damage', amount: 3 }], { type: 'attack' }),
  goringSwing: card('goringSwing', 'Goring Swing', 2, 'Deal 9 damage. Discard 1 other card if possible.', [{ type: 'damage', amount: 9 }, { type: 'discard', amount: 1 }], { type: 'attack' }),
  braceMaul: card('braceMaul', 'Brace Maul', 1, 'Gain 7 block. Draw 1 card.', [{ type: 'block', amount: 7 }, { type: 'draw', amount: 1 }]),
  savageFollowUp: card('savageFollowUp', 'Savage Follow-Up', 1, 'Deal 5 damage. Your next attack deals +1.', [{ type: 'damage', amount: 5 }, { type: 'nextAttackBonus', amount: 1 }], { type: 'attack' }),
  hornShot: card('hornShot', 'Horn Shot', 1, 'Deal 5 damage. Draw 1.', [{ type: 'damage', amount: 5 }, { type: 'draw', amount: 1 }], { type: 'attack' }),
  trample: card('trample', 'Trample', 2, 'Remove 3 block and deal 7 damage.', [{ type: 'removeMonsterBlock', amount: 3 }, { type: 'damage', amount: 7 }], { type: 'attack' }),
  settle: card('settle', 'Settle', 0, 'Remove one Panic from discard. Draw 1.', [{ type: 'removePanic', amount: 1 }, { type: 'draw', amount: 1 }]),
  ashCycle: card('ashCycle', 'Ash Cycle', 0, 'Draw 2, then discard 1.', [{ type: 'draw', amount: 2 }, { type: 'discard', amount: 1 }]),
  delayedCut: card('delayedCut', 'Delayed Cut', 1, 'Deal 5 damage. Gain 1 energy.', [{ type: 'damage', amount: 5 }, { type: 'energy', amount: 1 }], { type: 'attack' }),
  memoryFilter: card('memoryFilter', 'Memory Filter', 0, 'Draw 2. Exhaust.', [{ type: 'draw', amount: 2 }], { exhaust: true }),
  lanternFocus: card('lanternFocus', 'Lantern Focus', 0, 'Gain 1 survival. Draw 1. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'draw', amount: 1 }], { exhaust: true }),
  pinningShot: card('pinningShot', 'Pinning Shot', 1, 'Remove 3 monster block, then deal 3 damage.', [{ type: 'removeMonsterBlock', amount: 3 }, { type: 'damage', amount: 3 }, { type: 'markMonster' }], { type: 'attack', tags: ['ranged', 'precise', 'limbHunter'] }),
  measuredStrike: card(
    'measuredStrike',
    'Measured Strike',
    1,
    'Deal 4 damage.',
    [{ type: 'damage', amount: 4 }],
    { type: 'attack', tags: ['training'], sourceType: 'training' }
  ),
  steadyGuard: card(
    'steadyGuard',
    'Steady Guard',
    1,
    'Gain 5 block.',
    [{ type: 'block', amount: 5 }],
    { tags: ['training'], sourceType: 'training' }
  ),
  deepBreath: card(
    'deepBreath',
    'Deep Breath',
    0,
    'Gain 1 survival. Exhaust.',
    [{ type: 'survival', amount: 1 }],
    { tags: ['training'], sourceType: 'training', exhaust: true }
  ),
  veteranStrike: card(
    'veteranStrike',
    'Veteran Strike',
    1,
    'Deal 5 damage.',
    [{ type: 'damage', amount: 5 }],
    { type: 'attack', tags: ['personal'], sourceType: 'personal' }
  ),
  hardWonGuard: card(
    'hardWonGuard',
    'Hard-Won Guard',
    1,
    'Gain 6 block.',
    [{ type: 'block', amount: 6 }],
    { tags: ['personal'], sourceType: 'personal' }
  ),
  blackLanternFocus: card(
    'blackLanternFocus',
    'Black Lantern Focus',
    0,
    'Gain 1 survival. Clarify the monster tell. Add 1 Panic. Exhaust.',
    [
      { type: 'survival', amount: 1 },
      { type: 'revealIntentHint' },
      { type: 'addPanic', amount: 1 }
    ],
    { tags: ['timeline', 'strange', 'panic'], sourceType: 'timeline', exhaust: true }
  ),
  watchTheDark: card(
    'watchTheDark',
    'Watch the Dark',
    0,
    'Gain 3 block and clarify the monster tell. Exhaust.',
    [{ type: 'block', amount: 3 }, { type: 'revealIntentHint' }],
    { tags: ['timeline', 'block'], sourceType: 'timeline', exhaust: true }
  )
};

Object.assign(cards, gearCards, monsterRewardCards, fightingArtCards);

Object.keys(cards).forEach(cardId => {
  const current = cards[cardId];
  const text = `${cardId} ${current.sourceGearId || ''} ${current.name || ''} ${(current.tags || []).join(' ')}`.toLowerCase();
  const createsCounter = current.effects?.some(effect => effect.type === 'nextCounterBonus');
  if (!createsCounter &&
    !['counter', 'riposte', 'reaction', 'punish', 'parry'].some(tag => text.includes(tag))) return;
  let preferredTags = [];
  let breakModifier = 0;
  let riskModifier = 0;
  if (text.includes('shield')) preferredTags = ['body', 'shell', 'claws'];
  else if (text.includes('perfect step')) preferredTags = ['legs', 'limb'];
  else if (text.includes('royal challenge')) {
    preferredTags = ['head', 'body'];
    riskModifier = 1;
  } else if (text.includes('thorn')) preferredTags = ['limb', 'body'];
  cards[cardId] = {
    ...current,
    counterCanTargetWeakPoint: true,
    counterPreferredWeakPointTags: preferredTags,
    counterBreakDamageModifier: breakModifier,
    counterRiskModifier: riskModifier
  };
});

export const starterCardIds = [
  'foundingStone',
  'wildSwing',
  'wildSwing',
  'scramble',
  'scramble',
  'desperateDodge',
  'encourage'
];

starterCardIds.forEach(cardId => {
  cards[cardId] = {
    ...cards[cardId],
    tags: [...new Set([...(cards[cardId].tags || []), 'starter'])],
    sourceType: 'starter'
  };
});

export const starterDeck = starterCardIds.map(cardId => cards[cardId]);
export const trainingCardIds = ['measuredStrike', 'steadyGuard', 'deepBreath'];
