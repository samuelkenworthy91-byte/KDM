import {
  explicitWeaponTypes
} from './gearMetadata.js';

function gearCard(sourceGearId, id, name, cost, description, effects, options = {}) {
  return {
    id,
    name,
    cost,
    description,
    effects,
    type: options.type || 'skill',
    tags: [...new Set([...(options.tags || []), 'quarrySpecific'])],
    sourceType: 'gear',
    sourceGearId,
    exhaust: Boolean(options.exhaust),
    implemented: true
  };
}

const attack = (gearId, id, name, cost, description, effects, tags = []) =>
  gearCard(gearId, id, name, cost, description, effects, {
    type: 'attack',
    tags: ['attack', ...tags],
    exhaust: tags.includes('exhaust')
  });

const skill = (gearId, id, name, cost, description, effects, tags = [], exhaust = false) =>
  gearCard(gearId, id, name, cost, description, effects, {
    tags,
    exhaust
  });

const exactSets = {
  boneFlute: [
    skill('boneFlute', 'dirgeOfTeeth', 'Dirge of Teeth', 1, 'Gain 1 survival. The next party member gains 1 survival before their turn.', [{ type: 'survival', amount: 1 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'survival', value: 1 }], ['support', 'party', 'survival']),
  ],
  hideDrum: [
    skill('hideDrum', 'steadyBeat', 'Steady Beat', 1, 'Gain 4 block. The next party member starts their turn with 2 block.', [{ type: 'block', amount: 4 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: 2 }], ['support', 'party', 'block']),
  ],
  gutStringLute: [
    skill('gutStringLute', 'fearSong', 'Fear Song', 0, 'Add 1 Panic to your discard. The next party member draws 1.', [{ type: 'addPanic', amount: 1 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'draw', value: 1 }], ['support', 'party', 'panic']),
  ],
  fieldBandages: [
    skill('fieldBandages', 'bindAnother', 'Bind Another', 1, 'After combat, heal another party member 2 HP. Exhaust.', [{ type: 'partyEffect', target: 'nextPartyMember', effectType: 'healAfterCombat', value: 2 }], ['support', 'party', 'wound', 'exhaust'], true),
  ],
  splintKit: [
    skill('splintKit', 'setTheLimb', 'Set the Limb', 1, 'Reduce another party member’s injury risk after combat. Exhaust.', [{ type: 'partyEffect', target: 'nextPartyMember', effectType: 'injuryProtection', value: 1 }], ['support', 'party', 'wound', 'exhaust'], true),
  ],
  lanternBanner: [
    skill('lanternBanner', 'raiseTheLanterns', 'Raise the Lanterns', 1, 'Every living party member gains 1 block.', [{ type: 'partyEffect', target: 'all', effectType: 'block', value: 1 }], ['support', 'party', 'block']),
  ],
  warningHorn: [
    skill('warningHorn', 'warningCall', 'Warning Call', 0, 'The next party member receives a clearer tell and 2 block. Exhaust.', [{ type: 'partyEffect', target: 'nextPartyMember', effectType: 'reveal', value: 1 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: 2 }], ['support', 'party', 'reveal', 'exhaust'], true),
  ],
  rationBundle: [
    skill('rationBundle', 'shareRations', 'Share Rations', 1, 'At the next rest node, heal all party members 1 HP. Exhaust.', [{ type: 'partyEffect', target: 'all', effectType: 'restHeal', value: 1 }], ['support', 'party', 'wound', 'exhaust'], true),
  ],
  boneBlade: [
    attack('boneBlade', 'carefulCut', 'Careful Cut', 1, 'Deal 5 damage. Apply 2 Bleed if the monster is Marked.', [{ type: 'damage', amount: 5 }, { type: 'bleedMonster', amount: 2, condition: 'monsterMarked' }], ['marked', 'precise', 'bleed']),
    attack('boneBlade', 'nickWeakSpot', 'Nick Weak Spot', 0, 'Deal 2 damage and Mark the monster.', [{ type: 'damage', amount: 2 }, { type: 'markMonster' }], ['quick', 'marked']),
    attack('boneBlade', 'boneEdge', 'Bone Edge', 1, 'Deal 4 damage. Draw 1 if this is your second attack this turn.', [{ type: 'damage', amount: 4 }, { type: 'drawIfSecondAttack', amount: 1 }], ['quick'])
  ],
  boneHammer: [
    attack('boneHammer', 'crackGuard', 'Crack Guard', 1, 'Remove 5 monster block and apply 1 Vulnerable.', [{ type: 'removeMonsterBlock', amount: 5 }, { type: 'vulnerableMonster', amount: 1 }], ['heavy', 'breaker', 'vulnerable']),
    attack('boneHammer', 'heavyStagger', 'Heavy Stagger', 2, 'Deal 8 damage and apply 1 Staggered.', [{ type: 'damage', amount: 8 }, { type: 'staggerMonster', amount: 1 }], ['heavy', 'staggered']),
    attack('boneHammer', 'skullRattle', 'Skull Rattle', 1, 'Deal 3 damage. Add 1 Panic to discard, then draw 1.', [{ type: 'damage', amount: 3 }, { type: 'addPanic', amount: 1 }, { type: 'draw', amount: 1 }], ['heavy', 'panic'])
  ],
  boneDarts: [
    attack('boneDarts', 'quickDart', 'Quick Dart', 0, 'Deal 2 damage and apply 1 Poison. Exhaust.', [{ type: 'damage', amount: 2 }, { type: 'poisonMonster', amount: 1 }], ['quick', 'poison', 'exhaust']),
    attack('boneDarts', 'pinTheBeast', 'Pin the Beast', 1, 'Deal 3 damage and Mark the monster.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }], ['quick', 'marked', 'ranged', 'limbHunter']),
    attack('boneDarts', 'throwAndMove', 'Throw and Move', 1, 'Deal 3 damage and gain 3 block.', [{ type: 'damage', amount: 3 }, { type: 'block', amount: 3 }], ['quick', 'block'])
  ],
  hideWraps: [
    skill('hideWraps', 'wrapAndRoll', 'Wrap and Roll', 1, 'Gain 6 block.', [{ type: 'block', amount: 6 }], ['block']),
    skill('hideWraps', 'lowStance', 'Low Stance', 0, 'Gain 2 block and 1 survival. Exhaust.', [{ type: 'block', amount: 2 }, { type: 'survival', amount: 1 }], ['block', 'survival', 'exhaust'], true)
  ],
  rawhideHood: [
    skill('rawhideHood', 'listenThroughHide', 'Listen Through Hide', 0, 'Draw 1. If Panic is in discard, gain 1 survival.', [{ type: 'draw', amount: 1 }, { type: 'survivalIfPanicInDiscard', amount: 1 }], ['panic', 'survival', 'reveal']),
    skill('rawhideHood', 'duckTheShape', 'Duck the Shape', 1, 'Gain 5 block, or 7 while Monster Bane reveals the intent.', [{ type: 'block', amount: 5, bonusIfMonsterBane: 2 }], ['block', 'monsterBane'])
  ],
  rawhideVest: [
    skill('rawhideVest', 'takeTheHit', 'Take the Hit', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }], ['block']),
    skill('rawhideVest', 'stitchedHide', 'Stitched Hide', 1, 'Gain 4 block. Heal 1 HP while below half HP. Exhaust.', [{ type: 'block', amount: 4 }, { type: 'healIfBelowHalf', amount: 1 }], ['block', 'wound', 'exhaust'], true)
  ],
  monsterGrease: [
    skill('monsterGrease', 'slipFree', 'Slip Free', 0, 'Gain 4 block. Exhaust.', [{ type: 'block', amount: 4 }], ['block', 'quick', 'exhaust'], true),
    skill('monsterGrease', 'greaseTheBlade', 'Grease the Blade', 1, 'Your next attack deals +3 damage.', [{ type: 'nextAttackBonus', amount: 3 }], ['attack'])
  ],
  clawCharm: [
    skill('clawCharm', 'charmOfTeeth', 'Charm of Teeth', 0, 'Mark the monster. Exhaust.', [{ type: 'markMonster' }], ['marked', 'exhaust'], true),
    attack('clawCharm', 'followTheMark', 'Follow the Mark', 1, 'Deal 4 damage. Deal +4 if the monster is Marked.', [{ type: 'damage', amount: 4, bonusIfMonsterMarked: 4 }], ['marked'])
  ],
  bloodPaint: [
    skill('bloodPaint', 'paintTheHands', 'Paint the Hands', 0, 'Lose 1 HP and gain 2 survival. Exhaust.', [{ type: 'loseHp', amount: 1 }, { type: 'survival', amount: 2 }], ['survival', 'wound', 'exhaust'], true),
    attack('bloodPaint', 'redCommitment', 'Red Commitment', 1, 'Deal 5 damage. Deal +3 while wounded.', [{ type: 'damage', amount: 5, bonusIfSurvivorWounded: 3 }], ['wound'])
  ],
  strangeEyeAmulet: [
    skill('strangeEyeAmulet', 'blinkInTheDark', 'Blink in the Dark', 0, 'Draw 2. Add 1 Panic to discard. Exhaust.', [{ type: 'draw', amount: 2 }, { type: 'addPanic', amount: 1 }], ['strange', 'panic', 'exhaust'], true),
    skill('strangeEyeAmulet', 'seeTooMuch', 'See Too Much', 1, 'Clarify the monster tell without revealing numbers. With Monster Bane, draw 1.', [{ type: 'revealIntentHint' }, { type: 'drawIfMonsterBane', amount: 1 }], ['strange', 'reveal', 'monsterBane'])
  ],
  hornMaul: [
    attack('hornMaul', 'goringSwing', 'Goring Swing', 2, 'Deal 9 damage and apply 2 Staggered.', [{ type: 'damage', amount: 9 }, { type: 'staggerMonster', amount: 2 }], ['heavy', 'staggered']),
    skill('hornMaul', 'braceMaul', 'Brace Maul', 1, 'Gain 7 block and 1 Guarded.', [{ type: 'block', amount: 7 }, { type: 'guardedSurvivor', amount: 1 }], ['heavy', 'block', 'guarded'])
  ],
  lionFangKatar: [
    attack('lionFangKatar', 'lionFangKatarJab', 'Fang Nick', 0, 'Deal 2 damage and apply 1 Bleed.', [{ type: 'damage', amount: 2 }, { type: 'bleedMonster', amount: 1 }], ['quick', 'bleed']),
    attack('lionFangKatar', 'lionFangKatarRend', 'Marked Throat Cut', 1, 'Deal 4 damage, +3 if the monster is Marked.', [{ type: 'damage', amount: 4, bonusIfMonsterMarked: 3 }], ['quick', 'precise', 'marked']),
    skill('lionFangKatar', 'lionFangKatarWithdraw', 'Knife-Hand Withdrawal', 0, 'Gain 3 block. Draw 1 if one attack has been played this turn. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'drawIfSecondAttack', amount: 1 }], ['quick', 'block', 'exhaust'], true)
  ],
  crackedMolarBlade: [
    attack('crackedMolarBlade', 'crackedMolarBladeCut', 'Pain-Driven Cleave', 2, 'Deal 9 damage, +4 while wounded.', [{ type: 'damage', amount: 9, bonusIfSurvivorWounded: 4 }], ['heavy', 'wound', 'brutal']),
    skill('crackedMolarBlade', 'crackedMolarBladeGrit', 'Set the Molar', 1, 'Gain 6 block. If wounded, heal 1 HP.', [{ type: 'block', amount: 6 }, { type: 'healIfWounded', amount: 1 }], ['heavy', 'block', 'wound'])
  ],
  royalChallengeHorn: [
    skill('royalChallengeHorn', 'royalChallengeHornCall', 'Royal Challenge', 0, 'Gain 2 survival, add 1 Panic, and Mark the monster. Exhaust.', [{ type: 'survival', amount: 2 }, { type: 'addPanic', amount: 1 }, { type: 'markMonster' }], ['support', 'challenge', 'survival', 'panic', 'marked', 'exhaust'], true),
    skill('royalChallengeHorn', 'royalChallengeHornAnswer', 'Rally the Challenged', 1, 'Gain 4 block. Every living party member gains 1 block.', [{ type: 'block', amount: 4 }, { type: 'partyEffect', target: 'all', effectType: 'block', value: 1 }], ['support', 'party', 'challenge', 'block'])
  ],
  paleFangKatar: [
    attack('paleFangKatar', 'whiteFangJab', 'White Fang Jab', 0, 'Deal 2 damage and Mark the monster.', [{ type: 'damage', amount: 2 }, { type: 'markMonster' }], ['quick', 'marked']),
    attack('paleFangKatar', 'twinFangCut', 'Twin Fang Cut', 1, 'Deal 3 damage twice, or 4 twice if the monster is Marked.', [{ type: 'multiHitDamage', amount: 3, hits: 2, markedAmount: 4 }], ['quick', 'multiHit', 'marked']),
    attack('paleFangKatar', 'pounceOpening', 'Pounce Opening', 1, 'Deal 5 damage. Draw 1 if Survival was spent this turn.', [{ type: 'damage', amount: 5 }, { type: 'drawIfSurvivalSpent', amount: 1 }], ['quick', 'survival'])
  ],
  paleManeBow: [
    attack('paleManeBow', 'markFromAfar', 'Mark from Afar', 0, 'Deal 1 damage and Mark the selected target. Exhaust.', [{ type: 'damage', amount: 1 }, { type: 'markMonster' }], ['ranged', 'marked', 'limbHunter', 'exhaust']),
    attack('paleManeBow', 'arrowAtTheCrouch', 'Arrow at the Crouch', 1, 'Deal 4 damage with strong break pressure against head and leg weak points.', [{ type: 'damage', amount: 4 }], ['ranged', 'precise', 'headHunter', 'limbHunter', 'breaker']),
    skill('paleManeBow', 'keepTheDistance', 'Keep the Distance', 1, 'Gain 5 block. Your next weak-point attack is safer.', [{ type: 'block', amount: 5 }, { type: 'nextAttackBonus', amount: 1 }], ['block', 'ranged', 'safeWeakPoint'])
  ],
  whitePounceKatana: [
    attack('whitePounceKatana', 'heldBreathDraw', 'Held-Breath Draw', 2, 'Deal 7 damage, +4 if this is your first attack this turn.', [{ type: 'damage', amount: 7, bonusIfFirstAttack: 4 }], ['precise', 'firstStrike']),
    attack('whitePounceKatana', 'whiteLineCut', 'White-Line Cut', 1, 'Deal 4 damage. This precise cut is safer for fragile harvests.', [{ type: 'damage', amount: 4 }], ['precise', 'safeWeakPoint', 'harvestMark']),
    attack('whitePounceKatana', 'noSecondStep', 'No Second Step', 3, 'Deal 13 damage and add 1 Panic.', [{ type: 'damage', amount: 13 }, { type: 'addPanic', amount: 1 }], ['precise', 'risk', 'pounce'])
  ],
  stalkingSpear: [
    attack('stalkingSpear', 'pinTheLegs', 'Pin the Legs', 1, 'Deal 4 damage with extra break pressure against movement weak points.', [{ type: 'damage', amount: 4 }], ['reach', 'movement', 'limbHunter', 'breaker']),
    skill('stalkingSpear', 'braceTheCharge', 'Brace the Charge', 1, 'Gain 7 block. Your next Counter deals +2.', [{ type: 'block', amount: 7 }, { type: 'nextCounterBonus', amount: 2 }], ['block', 'reach', 'counter']),
    attack('stalkingSpear', 'reachUnderTheMane', 'Reach Under the Mane', 1, 'Deal 5 damage with reduced weak-point risk.', [{ type: 'damage', amount: 5 }], ['reach', 'safeWeakPoint', 'limbHunter'])
  ],
  lionhideBuckler: [
    skill('lionhideBuckler', 'aggressiveBuckle', 'Aggressive Buckle', 1, 'Gain 4 block, apply 1 Vulnerable, and improve the next Counter by 1.', [{ type: 'block', amount: 4 }, { type: 'vulnerableMonster', amount: 1 }, { type: 'nextCounterBonus', amount: 1 }], ['block', 'vulnerable', 'counter']),
    attack('lionhideBuckler', 'shieldBash', 'Shield Bash', 1, 'Deal 3 damage. If you have block, deal extra damage equal to your block (max 10).', [{ type: 'damage', amount: 3, bonusPerBlock: 1, maximumBonus: 10 }], ['block', 'breaker', 'counter'])
  ],
  maneCloak: [
    skill('maneCloak', 'hideInTheMane', 'Hide in the Mane', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }], ['block']),
    skill('maneCloak', 'predatorStillness', 'Predator Stillness', 0, 'Remove 1 Panic from any pile. If none is found, gain 1 survival. Exhaust.', [{ type: 'removePanicAnyOrSurvival', amount: 1 }], ['panic', 'survival', 'exhaust'], true)
  ],
  catEyeCharm: [
    skill('catEyeCharm', 'catEyeGlimmer', 'Cat-Eye Glimmer', 0, 'Draw 1 and gain 1 survival.', [{ type: 'draw', amount: 1 }, { type: 'survival', amount: 1 }], ['reveal', 'survival']),
    skill('catEyeCharm', 'readTheCrouch', 'Read the Crouch', 1, 'Clarify the tell. With Monster Bane, your next attack deals +2.', [{ type: 'revealIntentHint' }, { type: 'nextAttackBonusIfMonsterBane', amount: 2 }], ['reveal', 'monsterBane'])
  ],
  pouncingGreaves: [
    skill('pouncingGreaves', 'springStep', 'Spring Step', 0, 'Gain 2 block. Your next Counter this turn deals +2.', [{ type: 'block', amount: 2 }, { type: 'nextCounterBonus', amount: 2 }], ['block', 'survival']),
    attack('pouncingGreaves', 'lowLeap', 'Low Leap', 1, 'Deal 4 damage and gain 1 survival.', [{ type: 'damage', amount: 4 }, { type: 'survival', amount: 1 }], ['quick', 'survival'])
  ],
  whiskerNeedle: [
    attack('whiskerNeedle', 'threadTheGap', 'Thread the Gap', 1, 'Deal 4 damage. Ignore block if the monster is Marked.', [{ type: 'damage', amount: 4, ignoreBlockIfMonsterMarked: true }], ['marked', 'precise', 'organHunter', 'headHunter', 'ignorePoorWeapon', 'safeWeakPoint']),
    skill('whiskerNeedle', 'whiskerSense', 'Whisker Sense', 0, 'Clarify the monster tell without revealing numbers. Exhaust.', [{ type: 'revealIntentHint' }], ['reveal', 'exhaust'], true)
  ],
  predatorMask: [
    skill('predatorMask', 'wearTheFace', 'Wear the Face', 0, 'Gain 2 survival and add 1 Panic to discard. Exhaust.', [{ type: 'survival', amount: 2 }, { type: 'addPanic', amount: 1 }], ['survival', 'panic', 'exhaust'], true),
    attack('predatorMask', 'predatorThought', 'Predator Thought', 1, 'Deal 6 damage. Deal +2 if Panic is in discard.', [{ type: 'damage', amount: 6, bonusIfPanicInDiscard: 2 }], ['panic']),
    skill('predatorMask', 'hungerFocus', 'Hunger Focus', 1, 'Draw 1. Your next attack Marks the monster.', [{ type: 'draw', amount: 1 }, { type: 'nextAttackMarks' }], ['marked'])
  ],
  whiteClawTrap: [
    skill('whiteClawTrap', 'setWhiteTrap', 'Set White Trap', 1, 'Mark the monster and gain 4 block.', [{ type: 'markMonster' }, { type: 'block', amount: 4 }], ['marked', 'block']),
    attack('whiteClawTrap', 'snapClosed', 'Snap Closed', 1, 'Deal 3 damage, or 6 if the monster is Marked.', [{ type: 'damage', amount: 3, bonusIfMonsterMarked: 3 }], ['marked'])
  ],
  huntingHideWrap: [
    skill('huntingHideWrap', 'huntingRoll', 'Hunting Roll', 1, 'Gain 5 block and draw 1.', [{ type: 'block', amount: 5 }, { type: 'draw', amount: 1 }], ['block']),
    skill('huntingHideWrap', 'scentOfHide', 'Scent of Hide', 0, 'Gain 1 survival. Exhaust.', [{ type: 'survival', amount: 1 }], ['survival', 'exhaust'], true)
  ],
  wailingHornBow: [
    attack('wailingHornBow', 'hornStringShot', 'Horn-String Shot', 1, 'Deal 4 damage and Mark the monster.', [{ type: 'damage', amount: 4 }, { type: 'markMonster' }], ['ranged', 'marked']),
    attack('wailingHornBow', 'screamingArrow', 'Screaming Arrow', 1, 'Deal 4 damage and add 1 Panic. Deal +3 if the monster is Marked.', [{ type: 'damage', amount: 4, bonusIfMonsterMarked: 3 }, { type: 'addPanic', amount: 1 }], ['panic', 'marked']),
    skill('wailingHornBow', 'keepDistance', 'Keep Distance', 0, 'Gain 3 block. Exhaust.', [{ type: 'block', amount: 3 }], ['block', 'exhaust'], true)
  ],
  stomachStoneCharm: [
    skill('stomachStoneCharm', 'sourPrayer', 'Sour Prayer', 0, 'Heal 1 HP and gain 1 survival. Exhaust.', [{ type: 'heal', amount: 1 }, { type: 'survival', amount: 1 }], ['wound', 'survival', 'exhaust'], true),
    skill('stomachStoneCharm', 'digestFear', 'Digest Fear', 1, 'Remove 1 Panic from discard. Draw 1 if removed.', [{ type: 'removePanicAndDraw', amount: 1 }], ['panic'])
  ],
  trampleBoots: [
    skill('trampleBoots', 'braceHooves', 'Brace Hooves', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }], ['block']),
    attack('trampleBoots', 'returnTrample', 'Return Trample', 1, 'Deal damage equal to half your block, up to 20.', [{ type: 'damageFromBlock', divisor: 2, maximum: 20 }], ['block']),
    attack('trampleBoots', 'stampForward', 'Stamp Forward', 1, 'Deal 4 damage and gain 2 block.', [{ type: 'damage', amount: 4 }, { type: 'block', amount: 2 }], ['block'])
  ],
  hungerDrum: [
    skill('hungerDrum', 'beatTheHunger', 'Beat the Hunger', 0, 'Draw 2, then add 1 Panic to discard. Exhaust.', [{ type: 'draw', amount: 2 }, { type: 'addPanic', amount: 1 }], ['panic', 'exhaust'], true),
    attack('hungerDrum', 'starvingRhythm', 'Starving Rhythm', 1, 'Deal 3 damage, plus 1 per Panic in discard, maximum +4.', [{ type: 'damage', amount: 3, bonusPerPanicInDiscard: 1, maximumBonus: 4 }], ['panic'])
  ],
  gutCordWrap: [
    skill('gutCordWrap', 'tightenTheCord', 'Tighten the Cord', 1, 'Gain 5 block and 1 survival.', [{ type: 'block', amount: 5 }, { type: 'survival', amount: 1 }], ['block', 'survival']),
    skill('gutCordWrap', 'holdTheInsides', 'Hold the Insides', 0, 'Heal 1 HP if wounded. Exhaust.', [{ type: 'healIfWounded', amount: 1 }], ['wound', 'exhaust'], true)
  ],
  grassDevourerMask: [
    skill('grassDevourerMask', 'chewTheBitter', 'Chew the Bitter', 1, 'Remove 1 Panic from any pile and gain 1 survival.', [{ type: 'removePanicAny' }, { type: 'survival', amount: 1 }], ['panic', 'survival']),
    skill('grassDevourerMask', 'hungerStare', 'Hunger Stare', 1, 'Mark the monster. Your next attack deals +2.', [{ type: 'markMonster' }, { type: 'nextAttackBonus', amount: 2 }], ['marked'])
  ],
  ashFeatherMantle: [
    skill('ashFeatherMantle', 'ashDrift', 'Ash Drift', 0, 'Gain 3 block and draw 1. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'draw', amount: 1 }], ['block', 'exhaust'], true),
    skill('ashFeatherMantle', 'featheredMemory', 'Feathered Memory', 1, 'Draw 2, then discard another card if possible.', [{ type: 'draw', amount: 2 }, { type: 'discard', amount: 1 }], ['discard'])
  ],
  timeBoneBlade: [
    attack('timeBoneBlade', 'delayedCut', 'Delayed Cut', 1, 'Deal 5 damage. Next turn, gain 1 energy and draw 1.', [{ type: 'damage', amount: 5 }, { type: 'delayedEnergy', amount: 1 }, { type: 'delayedDraw', amount: 1 }], ['strange', 'time', 'precise']),
    attack('timeBoneBlade', 'quickCut', 'Quick Cut', 0, 'Deal 2 damage twice. Exhaust.', [{ type: 'multiHitDamage', amount: 2, hits: 2 }], ['quick', 'precise', 'multiHit', 'exhaust'])
  ],
  memoryGlassEye: [
    skill('memoryGlassEye', 'lookBack', 'Look Back', 0, 'Return the top card of discard to your hand, or draw 1. Exhaust.', [{ type: 'drawFromDiscardOrDeck', amount: 1 }], ['strange', 'exhaust'], true),
    attack('memoryGlassEye', 'memoryShard', 'Memory Shard', 1, 'Deal 3 damage, add 1 Panic to discard, and draw 1.', [{ type: 'damage', amount: 3 }, { type: 'addPanic', amount: 1 }, { type: 'draw', amount: 1 }], ['panic', 'strange'])
  ],
  burntWingFan: [
    skill('burntWingFan', 'fanTheAsh', 'Fan the Ash', 1, 'Gain 5 block and discard another card if possible.', [{ type: 'block', amount: 5 }, { type: 'discard', amount: 1 }], ['block', 'discard']),
    attack('burntWingFan', 'chokingFlutter', 'Choking Flutter', 1, 'Deal 4 damage and remove 3 monster block.', [{ type: 'damage', amount: 4 }, { type: 'removeMonsterBlock', amount: 3 }], ['discard'])
  ],
  emberThreadWrap: [
    attack('emberThreadWrap', 'emberThread', 'Ember Thread', 1, 'Deal 3 damage and Mark the monster.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }], ['marked']),
    attack('emberThreadWrap', 'pullTheEmber', 'Pull the Ember', 1, 'Deal 4 damage. Deal +3 if the monster is Marked.', [{ type: 'damage', amount: 4, bonusIfMonsterMarked: 3 }], ['marked'])
  ],
  ashClockCharm: [
    skill('ashClockCharm', 'tickInAsh', 'Tick in Ash', 0, 'Draw 1. If you have played 3 cards this turn, gain 1 survival.', [{ type: 'draw', amount: 1 }, { type: 'survivalIfCardsPlayed', count: 3, amount: 1 }], ['survival']),
    skill('ashClockCharm', 'lostSecond', 'Lost Second', 1, 'Gain 4 block and draw 1.', [{ type: 'block', amount: 4 }, { type: 'draw', amount: 1 }], ['block'])
  ]
};

const profiles = {
  thunderMaul: ['Thunder Maul', 'survivalHeavy'],
  stormGutCharm: ['Storm Gut Charm', 'panicConversion'],
  swollenHideVest: ['Swollen Hide Vest', 'panicTank'],
  staticNeedle: ['Static Needle', 'markDraw'],
  crimsonScaleShield: ['Crimson Scale Shield', 'shieldCounter'],
  riverToothBlade: ['River Tooth Blade', 'brokenGuard'],
  redLeatherCoat: ['Red Leather Coat', 'layeredDefense'],
  drowningHook: ['Drowning Hook', 'markControl'],
  bloodMudPaint: ['Blood-Mud Paint', 'woundedWeapon'],
  crocodileEyeCharm: ['Crocodile Eye Charm', 'revealPunish'],
  rubberyHideSuit: ['Rubbery Hide Suit', 'bounceDefense'],
  toxicGlandBomb: ['Toxic Gland Bomb', 'bombMark'],
  wetBoneClub: ['Wet Bone Club', 'unreliableHeavy'],
  bulgingEyeCharm: ['Bulging Eye Charm', 'panicReveal'],
  leapingBoots: ['Leaping Boots', 'survivalStep'],
  silkThreadBow: ['Silk Thread Bow', 'rangedMark'],
  venomSacNeedle: ['Venom Sac Needle', 'bleedWeapon'],
  webbedHideMantle: ['Webbed Hide Mantle', 'bindDefense'],
  spiderEyeCharm: ['Spider Eye Charm', 'markedDraw'],
  eggPouch: ['Egg Pouch', 'swarmRisk'],
  skitterWraps: ['Skitter Wraps', 'focusStep'],
  duelistThornRapier: ['Duelist Thorn Rapier', 'singleAttack'],
  bloomPetalCloak: ['Bloom Petal Cloak', 'elegantDefense'],
  polishedStemSpear: ['Polished Stem Spear', 'antiBlockMark'],
  floralSinewBowstring: ['Floral Sinew Bowstring', 'rangedCombo'],
  knightSeedCharm: ['Knight Seed Charm', 'patientGrowth'],
  perfectStepBoots: ['Perfect Step Boots', 'dodgeAttack'],
  smogPipeFlute: ['Smog Pipe Flute', 'soundControl'],
  sootLungMask: ['Soot Lung Mask', 'panicArmor'],
  harmonyBoneBlade: ['Harmony Bone Blade', 'alternating'],
  tarFeatherCloak: ['Tar Feather Cloak', 'discardDefense'],
  chokingMask: ['Choking Mask', 'panicPower'],
  chitinPlateArmor: ['Chitin Plate Armor', 'slowArmor'],
  beetleHornHammer: ['Beetle Horn Hammer', 'chargeAfterBlock'],
  resinBloodShield: ['Resin Blood Shield', 'blockDamage'],
  jewelWingCharm: ['Jewel Wing Charm', 'survivalDraw'],
  dungCoreBomb: ['Dung Core Bomb', 'bombBurst'],
  crusaderShellHelm: ['Crusader Shell Helm', 'panicGuard'],
  drakeScaleMail: ['Drake Scale Mail', 'fireArmor'],
  crystalBoneBlade: ['Crystal Bone Blade', 'blockScale'],
  fireGlandBomb: ['Fire Gland Bomb', 'bombPanic'],
  imperialHornHelm: ['Imperial Horn Helm', 'roarSurvival'],
  emberCrown: ['Ember Crown', 'crownRisk'],
  sunShellShield: ['Sun Shell Shield', 'radiantBlock'],
  radiantEyeCharm: ['Radiant Eye Charm', 'revealBlind'],
  solarIchorBlade: ['Solar Ichor Blade', 'survivalDamage'],
  blindingScaleCloak: ['Blinding Scale Cloak', 'dodgeDefense'],
  warmPearlAmulet: ['Warm Pearl Amulet', 'healingSupport'],
  noonMirror: ['Noon Mirror', 'reflectBlock'],
  prideManeCloak: ['Pride Mane Cloak', 'intimidation'],
  kingClawGauntlet: ['King Claw Gauntlet', 'highSurvival'],
  goldenFangBlade: ['Golden Fang Blade', 'finisher'],
  regalHideArmor: ['Regal Hide Armor', 'baneArmor'],
  judgmentEyeCharm: ['Judgment Eye Charm', 'judgement']
};

const expandedWeaponSpecs = {
  boneCleaver: ['Bone Cleaver', 'axe', 'Split the Guard', 'Cleaver Drop'],
  gutCordWhip: ['Gut Cord Whip', 'whip', 'Catch the Limb', 'Cord Snap'],
  boneKnuckleWraps: ['Bone Knuckle Wraps', 'fistAndTooth', 'Knuckle Chain', 'Close Guard'],
  paleFangSpear: ['Pale Fang Spear', 'spear', 'Elder Fang Pin', 'Brace the Hunt'],
  ashCurveBlade: ['Ash Curve Blade', 'katana', 'Cooling Draw', 'Ash-Line Cut'],
  ashHookScythe: ['Ash Hook Scythe', 'scythe', 'Hook the Memory', 'Reap the Ash'],
  crimsonRiverAxe: ['Crimson River Axe', 'axe', 'Scale Cleft', 'River Execution'],
  frogdogBiteGloves: ['Frogdog Bite Gloves', 'fistAndTooth', 'Biting Pair', 'Bounce Counter'],
  silkSnareWhip: ['Silk Snare Whip', 'whip', 'Cast the Snare', 'Tighten the Web'],
  petalEdgeKatana: ['Petal Edge Katana', 'katana', 'Petal Draw', 'One Falling Line'],
  bloomReaper: ['Bloom Reaper', 'scythe', 'Thorn Harvest', 'Final Bloom'],
  floralSinewBow: ['Floral Sinew Bow', 'bow', 'Seed the Mark', 'Perfect Loose'],
  smogReedScythe: ['Smog Reed Scythe', 'scythe', 'Soot Hook', 'Chorus Reap'],
  chitinHookAxe: ['Chitin Hook Axe', 'axe', 'Peel the Plate', 'Shell-Cracking Drop'],
  mirrorCuttingBlade: ['Mirror Cutting Blade', 'katana', 'Hidden Draw', 'Reflected Cut'],
  sunLance: ['Sun Lance', 'spear', 'Pin with Light', 'Noon Brace'],
  kingClawGauntletPair: ['King Claw Gauntlet Pair', 'fistAndTooth', 'Royal Raking Chain', 'Answer the Challenge'],
  prideGrandBlade: ['Pride Grand Blade', 'grandWeapon', 'Royal Commitment', 'Final Decree']
};

function expandedWeaponCards(gearId, name, weaponType, firstName, secondName) {
  switch (weaponType) {
    case 'axe':
      return [
        attack(gearId, `${gearId}Break`, firstName, 1, 'Remove 5 monster block, then deal 3 damage.', [{ type: 'removeMonsterBlock', amount: 5 }, { type: 'damage', amount: 3 }], ['heavy', 'breaker']),
        attack(gearId, `${gearId}Drop`, secondName, 2, 'Deal 9 damage, +3 while the monster has block.', [{ type: 'damage', amount: 9, bonusIfMonsterHasBlock: 3 }], ['heavy', 'breaker', 'brutal'])
      ];
    case 'whip':
      return [
        attack(gearId, `${gearId}Catch`, firstName, 1, 'Deal 3 damage, Mark the monster, and remove 2 block.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }, { type: 'removeMonsterBlock', amount: 2 }], ['reach', 'marked', 'limbHunter']),
        skill(gearId, `${gearId}Snap`, secondName, 0, 'Gain 3 block and clarify the tell. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'revealIntentHint' }], ['reach', 'marked', 'counter', 'exhaust'], true)
      ];
    case 'fistAndTooth':
      return [
        attack(gearId, `${gearId}Chain`, firstName, 1, 'Deal 2 damage three times.', [{ type: 'multiHitDamage', amount: 2, hits: 3 }], ['quick', 'multiHit', 'counter']),
        skill(gearId, `${gearId}Guard`, secondName, 0, 'Gain 2 block. Your next Counter deals +2. Exhaust.', [{ type: 'block', amount: 2 }, { type: 'nextCounterBonus', amount: 2 }], ['quick', 'counter', 'block', 'exhaust'], true)
      ];
    case 'spear':
      return [
        attack(gearId, `${gearId}Pin`, firstName, 1, 'Deal 4 damage with strong break pressure against limb weak points.', [{ type: 'damage', amount: 4 }], ['reach', 'limbHunter', 'breaker']),
        skill(gearId, `${gearId}Brace`, secondName, 1, 'Gain 7 block. Your next Counter deals +2.', [{ type: 'block', amount: 7 }, { type: 'nextCounterBonus', amount: 2 }], ['reach', 'block', 'counter'])
      ];
    case 'katana':
      return [
        attack(gearId, `${gearId}Draw`, firstName, 1, 'Deal 5 damage, +3 if this is your first attack this turn.', [{ type: 'damage', amount: 5, bonusIfFirstAttack: 3 }], ['precise', 'firstStrike']),
        attack(gearId, `${gearId}Cut`, secondName, 2, 'Deal 8 damage and add 1 Panic.', [{ type: 'damage', amount: 8 }, { type: 'addPanic', amount: 1 }], ['precise', 'firstStrike', 'risk'])
      ];
    case 'scythe':
      return [
        attack(gearId, `${gearId}Hook`, firstName, 1, 'Deal 3 damage and apply 2 Bleed.', [{ type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 2 }], ['bleed', 'panic', 'heavy']),
        attack(gearId, `${gearId}Reap`, secondName, 2, 'Deal 8 damage, +3 if the monster is Bleeding. Add 1 Panic.', [{ type: 'damage', amount: 8, bonusIfMonsterBleeding: 3 }, { type: 'addPanic', amount: 1 }], ['bleed', 'panic', 'heavy', 'finisher'])
      ];
    case 'bow':
      return [
        attack(gearId, `${gearId}Mark`, firstName, 0, 'Deal 1 damage and Mark the monster. Exhaust.', [{ type: 'damage', amount: 1 }, { type: 'markMonster' }], ['ranged', 'marked', 'limbHunter', 'exhaust']),
        attack(gearId, `${gearId}Loose`, secondName, 1, 'Deal 5 damage, +2 if the monster is Marked.', [{ type: 'damage', amount: 5, bonusIfMonsterMarked: 2 }], ['ranged', 'marked', 'precise'])
      ];
    case 'grandWeapon':
      return [
        skill(gearId, `${gearId}Commit`, firstName, 0, 'Gain 1 energy and add 1 Panic. Exhaust.', [{ type: 'energy', amount: 1 }, { type: 'addPanic', amount: 1 }], ['heavy', 'risk', 'exhaust'], true),
        attack(gearId, `${gearId}Decree`, secondName, 3, 'Deal 14 damage and gain 3 block.', [{ type: 'damage', amount: 14 }, { type: 'block', amount: 3 }], ['heavy', 'brutal'])
      ];
    default:
      return [];
  }
}

Object.entries(expandedWeaponSpecs).forEach(([gearId, spec]) => {
  exactSets[gearId] = expandedWeaponCards(gearId, ...spec);
});

exactSets.paleFangSpear = [
  attack('paleFangSpear', 'paleFangSpearPin', 'Elder Fang Pin', 2, 'Deal 6 damage, Mark the monster, and press hard against limb weak points.', [{ type: 'damage', amount: 6 }, { type: 'markMonster' }], ['reach', 'limbHunter', 'breaker', 'marked']),
  skill('paleFangSpear', 'paleFangSpearBrace', 'Long-Hunt Brace', 1, 'Gain 6 block and draw 1.', [{ type: 'block', amount: 6 }, { type: 'draw', amount: 1 }], ['reach', 'block', 'safeWeakPoint'])
];

exactSets.ashCurveBlade = [
  attack('ashCurveBlade', 'ashCurveCoolingDraw', 'Cooling Draw', 1, 'Deal 5 damage, +3 if this is your first attack this turn. Next turn, draw 1.', [{ type: 'damage', amount: 5, bonusIfFirstAttack: 3 }, { type: 'delayedDraw', amount: 1 }], ['precise', 'firstStrike', 'time']),
  attack('ashCurveBlade', 'ashCurveLineCut', 'Ash-Line Cut', 2, 'Deal 7 damage, add 1 Panic, and return this card to the discard next turn.', [{ type: 'damage', amount: 7 }, { type: 'addPanic', amount: 1 }, { type: 'delayedReturnToDiscard' }], ['precise', 'firstStrike', 'risk', 'time'])
];
exactSets.petalEdgeKatana = [
  attack('petalEdgeKatana', 'petalEdgeDraw', 'Petal Draw', 1, 'Deal 4 damage, +4 if this is your first attack this turn. Gain 1 survival if the monster is Marked.', [{ type: 'damage', amount: 4, bonusIfFirstAttack: 4 }, { type: 'survivalIfMonsterMarked', amount: 1 }], ['precise', 'firstStrike', 'marked']),
  attack('petalEdgeKatana', 'petalEdgeLine', 'One Falling Line', 2, 'Deal 8 damage. This measured cut is safer for fragile harvests.', [{ type: 'damage', amount: 8 }], ['precise', 'firstStrike', 'safeWeakPoint'])
];
exactSets.mirrorCuttingBlade = [
  attack('mirrorCuttingBlade', 'mirrorHiddenDraw', 'Hidden Draw', 1, 'Deal 5 damage, +3 if this is your first attack this turn. Gain 2 block.', [{ type: 'damage', amount: 5, bonusIfFirstAttack: 3 }, { type: 'block', amount: 2 }], ['precise', 'firstStrike', 'radiant', 'block']),
  attack('mirrorCuttingBlade', 'mirrorReflectedCut', 'Reflected Cut', 2, 'Deal 6 damage plus half your block, up to 6 bonus damage.', [{ type: 'damage', amount: 6 }, { type: 'damageFromBlock', divisor: 2, maximum: 6 }], ['precise', 'firstStrike', 'radiant', 'counter'])
];
exactSets.ashHookScythe = [
  attack('ashHookScythe', 'ashHookMemory', 'Hook the Memory', 1, 'Deal 3 damage, apply 2 Bleed, then discard another card if possible.', [{ type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 2 }, { type: 'discard', amount: 1 }], ['bleed', 'panic', 'heavy', 'memory']),
  attack('ashHookScythe', 'ashHookReap', 'Reap the Ash', 2, 'Deal 7 damage, add 1 Panic, and draw from discard if the monster is Bleeding.', [{ type: 'damage', amount: 7 }, { type: 'addPanic', amount: 1 }, { type: 'drawFromDiscardIfMonsterBleeding', amount: 1 }], ['bleed', 'panic', 'heavy', 'time'])
];
exactSets.bloomReaper = [
  attack('bloomReaper', 'bloomThornHarvest', 'Thorn Harvest', 1, 'Deal 3 damage, apply 1 Bleed, and Mark the monster.', [{ type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 1 }, { type: 'markMonster' }], ['bleed', 'panic', 'heavy', 'marked', 'precise']),
  attack('bloomReaper', 'bloomFinal', 'Final Bloom', 2, 'Deal 8 damage, +3 if the monster is Marked, then add 1 Panic.', [{ type: 'damage', amount: 8, bonusIfMonsterMarked: 3 }, { type: 'addPanic', amount: 1 }], ['bleed', 'panic', 'heavy', 'finisher', 'duelist'])
];
exactSets.smogReedScythe = [
  attack('smogReedScythe', 'smogSootHook', 'Soot Hook', 1, 'Deal 3 damage, apply 2 Bleed, and add 1 Panic.', [{ type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 2 }, { type: 'addPanic', amount: 1 }], ['bleed', 'panic', 'heavy', 'smoke']),
  attack('smogReedScythe', 'smogChorusReap', 'Chorus Reap', 2, 'Deal 7 damage, +1 per Panic in discard, maximum +4.', [{ type: 'damage', amount: 7, bonusPerPanicInDiscard: 1, maximumBonus: 4 }], ['bleed', 'panic', 'heavy', 'song'])
];
exactSets.crimsonRiverAxe = [
  attack('crimsonRiverAxe', 'crimsonScaleCleft', 'Scale Cleft', 1, 'Remove all monster block and deal 2 damage.', [{ type: 'removeAllMonsterBlock' }, { type: 'damage', amount: 2 }], ['heavy', 'breaker', 'crush']),
  attack('crimsonRiverAxe', 'crimsonExecution', 'River Execution', 2, 'Deal 8 damage, +4 while the monster is Bleeding.', [{ type: 'damage', amount: 8, bonusIfMonsterBleeding: 4 }], ['heavy', 'breaker', 'bleed', 'brutal'])
];
exactSets.chitinHookAxe = [
  attack('chitinHookAxe', 'chitinPeelPlate', 'Peel the Plate', 1, 'Remove 4 monster block, deal 3 damage, and apply 1 Vulnerable.', [{ type: 'removeMonsterBlock', amount: 4 }, { type: 'damage', amount: 3 }, { type: 'vulnerableMonster', amount: 1 }], ['heavy', 'breaker', 'shell']),
  skill('chitinHookAxe', 'chitinAdvance', 'Shell-Cracking Advance', 1, 'Gain 5 block. Your next attack removes 2 additional block.', [{ type: 'block', amount: 5 }, { type: 'nextAttackBlockBreak', amount: 2 }], ['heavy', 'breaker', 'block', 'shell'])
];
exactSets.frogdogTongueWhip = [
  attack('frogdogTongueWhip', 'frogdogAdhesiveLash', 'Adhesive Lash', 1, 'Deal 3 damage, Mark the monster, and apply 1 Poison.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }, { type: 'poisonMonster', amount: 1 }], ['reach', 'marked', 'poison', 'adhesive']),
  skill('frogdogTongueWhip', 'frogdogTongueSnap', 'Tongue Snap', 0, 'Remove 2 monster block and draw 1. Exhaust.', [{ type: 'removeMonsterBlock', amount: 2 }, { type: 'draw', amount: 1 }], ['reach', 'marked', 'quick', 'exhaust'], true)
];
exactSets.frogdogBiteGloves = [
  attack('frogdogBiteGloves', 'frogdogBitingPair', 'Biting Pair', 1, 'Deal 2 damage twice and apply 1 Poison.', [{ type: 'multiHitDamage', amount: 2, hits: 2 }, { type: 'poisonMonster', amount: 1 }], ['quick', 'multiHit', 'counter', 'poison']),
  skill('frogdogBiteGloves', 'frogdogBounceCounter', 'Bounce Counter', 0, 'Gain 2 block and improve the next Counter by 2. Heal 1 if wounded. Exhaust.', [{ type: 'block', amount: 2 }, { type: 'nextCounterBonus', amount: 2 }, { type: 'healIfWounded', amount: 1 }], ['quick', 'counter', 'block', 'recovery', 'exhaust'], true)
];
exactSets.kingClawGauntletPair = [
  attack('kingClawGauntletPair', 'kingClawRoyalChain', 'Royal Raking Chain', 1, 'Deal 2 damage three times. Gain 1 survival if the monster is Marked.', [{ type: 'multiHitDamage', amount: 2, hits: 3 }, { type: 'survivalIfMonsterMarked', amount: 1 }], ['quick', 'multiHit', 'counter', 'regal']),
  skill('kingClawGauntletPair', 'kingClawAnswer', 'Answer the Challenge', 0, 'Gain 3 block, Mark the monster, and improve the next Counter by 1. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'markMonster' }, { type: 'nextCounterBonus', amount: 1 }], ['quick', 'counter', 'block', 'command', 'exhaust'], true)
];
exactSets.godlingDrum = [
  skill('godlingDrum', 'godlingThunderPulse', 'Thunder Pulse', 0, 'Gain 1 energy, add 1 Panic, and gain 2 block. Exhaust.', [{ type: 'energy', amount: 1 }, { type: 'addPanic', amount: 1 }, { type: 'block', amount: 2 }], ['thunder', 'panic', 'instability', 'exhaust'], true),
  attack('godlingDrum', 'godlingSwollenBeat', 'Swollen Beat', 1, 'Deal 3 damage, +2 per Panic in discard, maximum +6.', [{ type: 'damage', amount: 3, bonusPerPanicInDiscard: 2, maximumBonus: 6 }], ['thunder', 'panic', 'heavy'])
];
exactSets.chorusBell = [
  skill('chorusBell', 'chorusResonance', 'Impossible Resonance', 0, 'Draw 1 and clarify the tell. Add 1 Panic. Exhaust.', [{ type: 'draw', amount: 1 }, { type: 'revealIntentHint' }, { type: 'addPanic', amount: 1 }], ['song', 'vibration', 'panic', 'reveal', 'exhaust'], true),
  skill('chorusBell', 'chorusHallucination', 'Chorus Hallucination', 1, 'Mark the monster and gain 4 block.', [{ type: 'markMonster' }, { type: 'block', amount: 4 }], ['song', 'smoke', 'marked', 'block'])
];
exactSets.moltenEyeCharm = [
  skill('moltenEyeCharm', 'moltenSight', 'Molten Sight', 0, 'Clarify the tell, Mark the monster, and add 1 Panic. Exhaust.', [{ type: 'revealIntentHint' }, { type: 'markMonster' }, { type: 'addPanic', amount: 1 }], ['fire', 'reveal', 'marked', 'risk', 'exhaust'], true),
  attack('moltenEyeCharm', 'moltenFlare', 'Imperial Flare', 1, 'Deal 4 damage, +3 if the monster is Marked. Remove 2 monster block.', [{ type: 'damage', amount: 4, bonusIfMonsterMarked: 3 }, { type: 'removeMonsterBlock', amount: 2 }], ['fire', 'marked', 'imperial'])
];

function profileCards(gearId, name, profile) {
  const slug = gearId;
  const strike = (suffix, label, amount, extra = {}, tags = []) =>
    attack(gearId, `${slug}${suffix}`, `${name}: ${label}`, 1, extra.description || `Deal ${amount} damage.`, [{ type: 'damage', amount, ...extra.effect }], tags);
  const guard = (suffix, label, amount, extraEffects = [], tags = []) =>
    skill(gearId, `${slug}${suffix}`, `${name}: ${label}`, 1, `Gain ${amount} block.`, [{ type: 'block', amount }, ...extraEffects], ['block', ...tags]);

  switch (profile) {
    case 'survivalHeavy':
      return [attack(gearId, `${slug}Crash`, `${name}: Thunder Crash`, 3, 'Deal 9 damage, +3 if Survival was spent this turn.', [{ type: 'damage', amount: 9, bonusIfSurvivalSpent: 3 }], ['heavy', 'survival', 'brutal']), skill(gearId, `${slug}Ground`, `${name}: Ground the Charge`, 1, 'Gain 6 block and 1 survival.', [{ type: 'block', amount: 6 }, { type: 'survival', amount: 1 }], ['heavy', 'block', 'survival']), strike('Aftershock', 'Aftershock', 5, { effect: { bonusIfBlockThisTurn: 3 }, description: 'Deal 5 damage, +3 if block was gained this turn.' }, ['heavy', 'block'])];
    case 'panicConversion':
      return [skill(gearId, `${slug}Ground`, `${name}: Ground the Fear`, 0, 'Remove 1 Panic from any pile and gain 1 survival.', [{ type: 'removePanicAny' }, { type: 'survival', amount: 1 }], ['panic', 'survival']), skill(gearId, `${slug}Pulse`, `${name}: Charged Pulse`, 1, 'Draw 1. Gain 1 survival if Panic is in discard.', [{ type: 'draw', amount: 1 }, { type: 'survivalIfPanicInDiscard', amount: 1 }], ['panic', 'survival'])];
    case 'panicTank':
      return [skill(gearId, `${slug}Swell`, `${name}: Swell Against Impact`, 1, 'Gain 10 block and add 1 Panic.', [{ type: 'block', amount: 10 }, { type: 'addPanic', amount: 1 }], ['block', 'panic']), skill(gearId, `${slug}Release`, `${name}: Release Pressure`, 0, 'Remove 1 Panic and gain 3 block. Exhaust.', [{ type: 'removePanicAny' }, { type: 'block', amount: 3 }], ['panic', 'block', 'exhaust'], true)];
    case 'markDraw':
      return [strike('Prick', 'Static Prick', 2, { effect: { markOnHit: true }, description: 'Deal 2 damage and Mark the monster.' }, ['marked', 'quick']), skill(gearId, `${slug}Wake`, `${name}: Wake the Nerves`, 0, 'Draw 1 and gain 1 survival. Exhaust.', [{ type: 'draw', amount: 1 }, { type: 'survival', amount: 1 }], ['survival', 'exhaust'], true)];
    case 'riskyDraw':
      return [skill(gearId, `${slug}Beat`, `${name}: Dangerous Rhythm`, 0, 'Draw 2 and add 1 Panic to discard. Exhaust.', [{ type: 'draw', amount: 2 }, { type: 'addPanic', amount: 1 }], ['panic', 'exhaust'], true), strike('Echo', 'Echoing Blow', 3, { effect: { bonusPerPanicInDiscard: 1, maximumBonus: 4 }, description: 'Deal 3 damage, +1 per Panic in discard (max +4).' }, ['panic'])];
    case 'woundedWeapon':
      return [strike('Cut', 'Pain Edge', 5, { effect: { bonusIfSurvivorWounded: 3 }, description: 'Deal 5 damage, +3 while wounded.' }, ['wound']), skill(gearId, `${slug}Grit`, `${name}: Grit Through It`, 0, 'If wounded, heal 1 HP. Otherwise gain 2 block. Exhaust.', [{ type: 'healIfWoundedOrBlock', heal: 1, block: 2 }], ['wound', 'exhaust'], true)];
    case 'shieldCounter':
      return [guard('Set', 'Set the Scales', 8, [{ type: 'nextCounterBonus', amount: 2 }], ['survival', 'counter']), strike('Bash', 'Red Scale Bash', 4, { effect: { bonusIfBlock: 3 }, description: 'Deal 4 damage, +3 while you have block.' }, ['block', 'counter'])];
    case 'brokenGuard':
      return [attack(gearId, `${slug}Saw`, `${name}: Saw the Opening`, 1, 'Remove 3 monster block, deal 3 damage, and apply 1 Bleed.', [{ type: 'removeMonsterBlock', amount: 3 }, { type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 1 }], ['quick', 'bleed']), strike('Bite', 'River Bite', 4, { effect: { bonusIfMonsterNoBlock: 3 }, description: 'Deal 4 damage, +3 if the monster has no block.' }, ['quick', 'bleed'])];
    case 'layeredDefense':
      return [skill(gearId, `${slug}Layer`, `${name}: Layer the Coat`, 1, 'Gain 6 block and draw 1.', [{ type: 'block', amount: 6 }, { type: 'draw', amount: 1 }], ['block']), skill(gearId, `${slug}Brace`, `${name}: Brace for the Roll`, 0, 'Gain 3 block. Exhaust.', [{ type: 'block', amount: 3 }], ['block', 'exhaust'], true)];
    case 'markControl':
      return [attack(gearId, `${slug}Hook`, `${name}: Hook and Hold`, 1, 'Deal 3 damage, Mark the monster, and remove 2 block.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }, { type: 'removeMonsterBlock', amount: 2 }], ['reach', 'marked']), guard('Pull', 'Pull Aside', 4, [], ['reach', 'marked'])];
    case 'revealPunish':
      return [skill(gearId, `${slug}Watch`, `${name}: Patient Watch`, 0, 'Clarify the tell and draw 1. Exhaust.', [{ type: 'revealIntentHint' }, { type: 'draw', amount: 1 }], ['reveal', 'exhaust'], true), strike('Punish', 'Punish the Guard', 4, { effect: { bonusIfMonsterHasBlock: 3 }, description: 'Deal 4 damage, +3 if the monster has block.' }, ['reveal'])];
    case 'bounceDefense':
      return [guard('Bounce', 'Bounce Aside', 6, [{ type: 'nextCounterBonus', amount: 1 }], ['survival']), skill(gearId, `${slug}Rebound`, `${name}: Rebound`, 0, 'Gain block equal to cards played this turn, maximum 4. Exhaust.', [{ type: 'blockFromCardsPlayed', maximum: 4 }], ['block', 'exhaust'], true)];
    case 'bombMark':
      return [attack(gearId, `${slug}Burst`, `${name}: Toxic Burst`, 0, 'Deal 6 damage, Mark the monster, and add 1 Panic. Exhaust.', [{ type: 'damage', amount: 6 }, { type: 'markMonster' }, { type: 'addPanic', amount: 1 }], ['marked', 'panic', 'exhaust']), skill(gearId, `${slug}Fumes`, `${name}: Lingering Fumes`, 1, 'Remove 4 monster block.', [{ type: 'removeMonsterBlock', amount: 4 }], ['marked'])];
    case 'unreliableHeavy':
      return [attack(gearId, `${slug}Heave`, `${name}: Wet Heave`, 2, 'Discard another card. Deal 11 if discarded, otherwise deal 5.', [{ type: 'discardForDamage', amount: 11, fallbackAmount: 5 }], ['heavy', 'discard']), guard('Catch', 'Catch the Rebound', 5)];
    case 'panicReveal':
      return [skill(gearId, `${slug}Stare`, `${name}: Sideways Stare`, 0, 'Clarify the tell. If Panic is in discard, draw 1.', [{ type: 'revealIntentHint' }, { type: 'drawIfPanicInDiscard', amount: 1 }], ['panic', 'reveal']), strike('Blink', 'Blink Strike', 3, { effect: { bonusIfPanicInDiscard: 3 }, description: 'Deal 3 damage, +3 if Panic is in discard.' }, ['panic'])];
    case 'survivalStep':
      return [skill(gearId, `${slug}Spring`, `${name}: Spring Away`, 0, 'Gain 2 block and improve the next Counter by 2. Exhaust.', [{ type: 'block', amount: 2 }, { type: 'nextCounterBonus', amount: 2 }], ['survival', 'block', 'exhaust'], true), strike('Leap', 'Returning Leap', 4, { effect: { bonusIfSurvivalSpent: 2 }, description: 'Deal 4 damage, +2 if Survival was spent this turn.' }, ['survival'])];
    case 'rangedMark':
      return [attack(gearId, `${slug}Thread`, `${name}: Threading Shot`, 1, 'Deal 3 damage and Mark the monster.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }], ['ranged', 'marked']), strike('Pin', 'Silken Pin', 4, { effect: { bonusIfMonsterMarked: 2 }, description: 'Deal 4 damage, +2 if Marked.' }, ['ranged', 'marked']), skill(gearId, `${slug}Retreat`, `${name}: Quiet Retreat`, 0, 'Gain 3 block. Exhaust.', [{ type: 'block', amount: 3 }], ['ranged', 'block', 'exhaust'], true)];
    case 'bleedWeapon':
      return [attack(gearId, `${slug}Dose`, `${name}: Measured Dose`, 1, 'Deal 3 damage and apply 1 Bleed to the monster.', [{ type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 1 }], ['quick', 'bleed']), strike('Drain', 'Venom Drain', 4, { effect: { bonusIfMonsterBleeding: 3 }, description: 'Deal 4 damage, +3 if the monster is Bleeding.' }, ['quick', 'bleed'])];
    case 'bindDefense':
      return [skill(gearId, `${slug}Web`, `${name}: Catch the Blow`, 1, 'Gain 7 block and Mark the monster.', [{ type: 'block', amount: 7 }, { type: 'markMonster' }], ['block', 'marked']), skill(gearId, `${slug}Bind`, `${name}: Binding Threads`, 1, 'Remove 3 monster block and Mark it.', [{ type: 'removeMonsterBlock', amount: 3 }, { type: 'markMonster' }], ['marked'])];
    case 'markedDraw':
      return [skill(gearId, `${slug}ManyEyes`, `${name}: Many Eyes`, 0, 'Draw 1, or 2 if the monster is Marked. Exhaust.', [{ type: 'drawByMonsterMarked', normal: 1, marked: 2 }], ['marked', 'exhaust'], true), strike('Facet', 'Facet Strike', 3, { effect: { bonusIfMonsterMarked: 2 }, description: 'Deal 3 damage, +2 if Marked.' }, ['marked'])];
    case 'swarmRisk':
      return [skill(gearId, `${slug}Hatch`, `${name}: Hatch the Pouch`, 0, 'Add a temporary Swarm Bite to hand and add 1 Panic. Exhaust.', [{ type: 'addTemporaryCard', cardId: 'swarmBite' }, { type: 'addPanic', amount: 1 }], ['panic', 'exhaust'], true), skill(gearId, `${slug}Warm`, `${name}: Guard the Brood`, 1, 'Gain 5 block and draw 1.', [{ type: 'block', amount: 5 }, { type: 'draw', amount: 1 }], ['block'])];
    case 'focusStep':
      return [skill(gearId, `${slug}Skitter`, `${name}: Skitter Focus`, 0, 'Draw 1 and gain 2 block. Exhaust.', [{ type: 'draw', amount: 1 }, { type: 'block', amount: 2 }], ['block', 'exhaust'], true), strike('Counter', 'Skittering Counter', 3, { effect: { bonusIfSurvivalSpent: 3 }, description: 'Deal 3 damage, +3 if Survival was spent this turn.' }, ['survival'])];
    case 'singleAttack':
      return [strike('Thrust', 'Measured Thrust', 5, { effect: { bonusIfFirstAttack: 3 }, description: 'Deal 5 damage, +3 if this is your first attack this turn.' }, ['precise']), guard('Poise', 'Duelist Poise', 5, [{ type: 'nextAttackBonus', amount: 2 }], ['precise'])];
    case 'elegantDefense':
      return [skill(gearId, `${slug}Turn`, `${name}: Petal Turn`, 1, 'Gain 5 block. Draw 1 if block was already gained this turn.', [{ type: 'block', amount: 5 }, { type: 'drawIfBlockGained', amount: 1 }], ['block']), skill(gearId, `${slug}Bow`, `${name}: Formal Bow`, 0, 'Gain 1 survival. Exhaust.', [{ type: 'survival', amount: 1 }], ['survival', 'exhaust'], true)];
    case 'antiBlockMark':
      return [attack(gearId, `${slug}Reach`, `${name}: Long Reach`, 1, 'Remove 4 monster block and Mark it.', [{ type: 'removeMonsterBlock', amount: 4 }, { type: 'markMonster' }], ['reach', 'limbHunter', 'marked']), strike('Line', 'Perfect Line', 5, { effect: { ignoreBlockIfMonsterMarked: true }, description: 'Deal 5 damage; ignore block if Marked.' }, ['reach', 'limbHunter', 'marked'])];
    case 'rangedCombo':
      return [strike('Loose', 'First Loose', 3, { effect: { bonusIfFirstCard: 2 }, description: 'Deal 3 damage, +2 if first card this turn.' }, ['quick']), attack(gearId, `${slug}Follow`, `${name}: Following Arrow`, 1, 'Deal 3 damage and draw 1 if an attack was already played.', [{ type: 'damage', amount: 3 }, { type: 'drawIfAttackPlayed', amount: 1 }], ['quick'])];
    case 'patientGrowth':
      return [skill(gearId, `${slug}Root`, `${name}: Take Root`, 1, 'Gain 5 block and +1 next attack damage.', [{ type: 'block', amount: 5 }, { type: 'nextAttackBonus', amount: 1 }], ['block']), strike('Bloom', 'Seed Bloom', 4, { effect: { bonusIfCardsPlayed: 2, cardsRequired: 3 }, description: 'Deal 4 damage, +2 after three cards this turn.' })];
    case 'dodgeAttack':
      return [skill(gearId, `${slug}Step`, `${name}: Perfect Step`, 0, 'Gain 2 block. Your next attack deals +2. Exhaust.', [{ type: 'block', amount: 2 }, { type: 'nextAttackBonus', amount: 2 }], ['block', 'exhaust'], true), strike('Answer', 'Elegant Answer', 4, { effect: { bonusIfSurvivalSpent: 2 }, description: 'Deal 4 damage, +2 if Survival was spent.' }, ['survival'])];
    case 'soundControl':
      return [skill(gearId, `${slug}Note`, `${name}: Clearing Note`, 0, 'Remove 1 Panic from any pile. Exhaust.', [{ type: 'removePanicAny' }], ['panic', 'exhaust'], true), skill(gearId, `${slug}Pulse`, `${name}: Breaking Pulse`, 1, 'Remove 4 monster block and clarify the tell.', [{ type: 'removeMonsterBlock', amount: 4 }, { type: 'revealIntentHint' }], ['reveal'])];
    case 'panicArmor':
      return [guard('Breathe', 'Breathe Through Soot', 6, [{ type: 'removePanicAny' }], ['panic']), skill(gearId, `${slug}Filter`, `${name}: Filter the Chorus`, 0, 'Draw 1 if Panic is in discard; otherwise gain 2 block. Exhaust.', [{ type: 'drawIfPanicElseBlock', draw: 1, block: 2 }], ['panic', 'block', 'exhaust'], true)];
    case 'alternating':
      return [attack(gearId, `${slug}Tone`, `${name}: Striking Tone`, 1, 'Deal 4 damage, +2 if the previous card was a skill.', [{ type: 'damage', amount: 4, bonusIfPreviousCardSkill: 2 }], ['precise']), skill(gearId, `${slug}Rest`, `${name}: Harmonic Rest`, 0, 'Gain 3 block. Draw 1 if the previous card was an attack.', [{ type: 'block', amount: 3 }, { type: 'drawIfPreviousCardAttack', amount: 1 }], ['block', 'precise'])];
    case 'discardDefense':
      return [skill(gearId, `${slug}Fold`, `${name}: Tar Fold`, 1, 'Discard another card. Gain 8 block if discarded, otherwise gain 4.', [{ type: 'discardForBlock', amount: 8, fallbackAmount: 4 }], ['block', 'discard']), strike('Feather', 'Hidden Feather', 3, { effect: { bonusIfCardDiscarded: 3 }, description: 'Deal 3 damage, +3 if a card was discarded this turn.' }, ['discard'])];
    case 'panicPower':
      return [skill(gearId, `${slug}Inhale`, `${name}: Black Inhale`, 0, 'Add 1 Panic to discard and gain 2 survival. Exhaust.', [{ type: 'addPanic', amount: 1 }, { type: 'survival', amount: 2 }], ['panic', 'survival', 'exhaust'], true), strike('Choke', 'Choking Command', 4, { effect: { bonusPerPanicInDiscard: 1, maximumBonus: 5 }, description: 'Deal 4 damage, +1 per Panic in discard (max +5).' }, ['panic'])];
    case 'slowArmor':
      return [guard('Close', 'Close the Plates', 10, [{ type: 'discard', amount: 1 }], ['heavy', 'discard']), skill(gearId, `${slug}Advance`, `${name}: Armoured Advance`, 1, 'Gain 5 block and +2 next attack damage.', [{ type: 'block', amount: 5 }, { type: 'nextAttackBonus', amount: 2 }], ['block', 'heavy'])];
    case 'chargeAfterBlock':
      return [guard('Lower', 'Lower the Horn', 6, [{ type: 'nextAttackBonus', amount: 2 }], ['heavy', 'breaker']), strike('Charge', 'Horn Charge', 6, { effect: { bonusIfBlockThisTurn: 3 }, description: 'Deal 6 damage, +3 if block was gained this turn.' }, ['heavy', 'block', 'breaker'])];
    case 'blockDamage':
      return [guard('Harden', 'Harden Resin', 7, [], ['counter']), attack(gearId, `${slug}Return`, `${name}: Return the Weight`, 1, 'Deal damage equal to half your current block, up to 20.', [{ type: 'damageFromBlock', divisor: 2, maximum: 20 }], ['block', 'counter'])];
    case 'survivalDraw':
      return [skill(gearId, `${slug}Flash`, `${name}: Jewel Flash`, 0, 'Gain 1 survival and draw 1. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'draw', amount: 1 }], ['survival', 'exhaust'], true), skill(gearId, `${slug}Wing`, `${name}: Wing Pattern`, 1, 'Clarify the tell and gain 3 block.', [{ type: 'revealIntentHint' }, { type: 'block', amount: 3 }], ['reveal', 'block'])];
    case 'bombBurst':
      return [attack(gearId, `${slug}Detonate`, `${name}: Detonate Core`, 0, 'Deal 12 damage and add 1 Panic. Exhaust.', [{ type: 'damage', amount: 12 }, { type: 'addPanic', amount: 1 }], ['heavy', 'panic', 'exhaust']), skill(gearId, `${slug}Heat`, `${name}: Core Heat`, 1, 'Gain 1 energy and 2 block.', [{ type: 'energy', amount: 1 }, { type: 'block', amount: 2 }], ['block'])];
    case 'panicGuard':
      return [guard('Shell', 'Shell the Mind', 7, [{ type: 'removePanicAny' }], ['panic']), skill(gearId, `${slug}Brace`, `${name}: Crusader Brace`, 0, 'Gain 3 block and 1 survival. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'survival', amount: 1 }], ['block', 'survival', 'exhaust'], true)];
    case 'fireArmor':
      return [guard('Cool', 'Cool the Scales', 7), skill(gearId, `${slug}Heat`, `${name}: Hold the Heat`, 0, 'Gain 3 block. If wounded, heal 1. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'healIfWounded', amount: 1 }], ['block', 'wound', 'exhaust'], true)];
    case 'blockScale':
      return [strike('Edge', 'Crystal Edge', 4, { effect: { bonusIfBlock: 3 }, description: 'Deal 4 damage, +3 while you have block.' }, ['block', 'precise']), skill(gearId, `${slug}Facet`, `${name}: Guarding Facet`, 1, 'Gain 5 block and draw 1.', [{ type: 'block', amount: 5 }, { type: 'draw', amount: 1 }], ['block', 'precise'])];
    case 'bombPanic':
      return [attack(gearId, `${slug}Ignite`, `${name}: Furnace Burst`, 0, 'Deal 10 damage and add 2 Panic. Exhaust.', [{ type: 'damage', amount: 10 }, { type: 'addPanic', amount: 2 }], ['panic', 'exhaust']), skill(gearId, `${slug}Vent`, `${name}: Vent the Gland`, 1, 'Remove 4 monster block and gain 2 block.', [{ type: 'removeMonsterBlock', amount: 4 }, { type: 'block', amount: 2 }], ['block'])];
    case 'roarSurvival':
      return [skill(gearId, `${slug}Roar`, `${name}: Imperial Roar`, 0, 'Gain 2 survival and Mark the monster. Exhaust.', [{ type: 'survival', amount: 2 }, { type: 'markMonster' }], ['survival', 'marked', 'exhaust'], true), guard('Crown', 'Crowned Guard', 6)];
    case 'revealMark':
      return [skill(gearId, `${slug}See`, `${name}: Molten Sight`, 0, 'Clarify the tell and Mark the monster. Exhaust.', [{ type: 'revealIntentHint' }, { type: 'markMonster' }], ['reveal', 'marked', 'exhaust'], true), strike('Flare', 'Eye Flare', 4, { effect: { bonusIfMonsterMarked: 3 }, description: 'Deal 4 damage, +3 if Marked.' }, ['marked'])];
    case 'crownRisk':
      return [skill(gearId, `${slug}Command`, `${name}: Burning Command`, 0, 'Gain 1 energy and add 1 Panic. Exhaust.', [{ type: 'energy', amount: 1 }, { type: 'addPanic', amount: 1 }], ['panic', 'exhaust'], true), strike('Edict', 'Ember Edict', 6, { effect: { bonusIfPanicInDiscard: 3 }, description: 'Deal 6 damage, +3 if Panic is in discard.' }, ['panic'])];
    case 'radiantBlock':
      return [guard('Noon', 'Noon Guard', 9, [{ type: 'drawIfBlockGained', amount: 1 }], ['heavy', 'counter']), attack(gearId, `${slug}Flash`, `${name}: Shield Flash`, 1, 'Deal 3 damage and Mark the monster.', [{ type: 'damage', amount: 3 }, { type: 'markMonster' }], ['marked', 'counter'])];
    case 'revealBlind':
      return [skill(gearId, `${slug}Open`, `${name}: Open the Cover`, 0, 'Clarify the tell and gain 1 survival. Exhaust.', [{ type: 'revealIntentHint' }, { type: 'survival', amount: 1 }], ['reveal', 'survival', 'exhaust'], true), skill(gearId, `${slug}Blind`, `${name}: Dazzling Glance`, 1, 'Gain 5 block and Mark the monster.', [{ type: 'block', amount: 5 }, { type: 'markMonster' }], ['block', 'marked'])];
    case 'survivalDamage':
      return [strike('Arc', 'Solar Arc', 5, { effect: { bonusIfSurvivalSpent: 3 }, description: 'Deal 5 damage, +3 if Survival was spent.' }, ['survival', 'precise']), skill(gearId, `${slug}Fuel`, `${name}: Feed the Ichor`, 0, 'Gain 1 survival and add 1 Panic. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'addPanic', amount: 1 }], ['survival', 'panic', 'precise', 'exhaust'], true)];
    case 'dodgeDefense':
      return [skill(gearId, `${slug}Glint`, `${name}: Blinding Turn`, 0, 'Gain 3 block and improve the next Counter by 1. Exhaust.', [{ type: 'block', amount: 3 }, { type: 'nextCounterBonus', amount: 1 }], ['block', 'survival', 'exhaust'], true), guard('Fold', 'Fold the Light', 6, [{ type: 'drawIfSurvivalSpent', amount: 1 }], ['survival'])];
    case 'healingSupport':
      return [skill(gearId, `${slug}Warm`, `${name}: Steady Warmth`, 0, 'Heal 1 HP and gain 1 survival. Exhaust.', [{ type: 'heal', amount: 1 }, { type: 'survival', amount: 1 }], ['wound', 'survival', 'exhaust'], true), guard('Comfort', 'Pearl Comfort', 5, [{ type: 'removePanicAny' }], ['panic'])];
    case 'reflectBlock':
      return [skill(gearId, `${slug}Catch`, `${name}: Catch Noon`, 1, 'Gain 7 block, add 1 Panic, and improve the next Counter by 2.', [{ type: 'block', amount: 7 }, { type: 'addPanic', amount: 1 }, { type: 'nextCounterBonus', amount: 2 }], ['strange', 'panic', 'block', 'counter']), attack(gearId, `${slug}Return`, `${name}: Return the Glare`, 1, 'Deal damage equal to half your block, up to 20.', [{ type: 'damageFromBlock', divisor: 2, maximum: 20 }], ['strange', 'panic', 'block'])];
    case 'intimidation':
      return [skill(gearId, `${slug}Rise`, `${name}: Raise the Mane`, 0, 'Gain 1 survival and Mark the monster. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'markMonster' }], ['survival', 'marked', 'exhaust'], true), guard('Presence', 'Royal Presence', 6)];
    case 'highSurvival':
      return [attack(gearId, `${slug}Rake`, `${name}: King Rake`, 1, 'Deal 2 damage three times.', [{ type: 'multiHitDamage', amount: 2, hits: 3 }], ['quick', 'multiHit', 'counter', 'survival']), skill(gearId, `${slug}Reserve`, `${name}: Hold Pride`, 1, 'Gain 1 survival, 3 block, and improve the next Counter by 1.', [{ type: 'survival', amount: 1 }, { type: 'block', amount: 3 }, { type: 'nextCounterBonus', amount: 1 }], ['quick', 'counter', 'survival', 'block'])];
    case 'finisher':
      return [strike('Measure', 'Measured Fang', 4, { effect: { bonusIfMonsterWounded: 3 }, description: 'Deal 4 damage, +3 if the monster is below half HP.' }, ['precise', 'wound']), attack(gearId, `${slug}End`, `${name}: Final Sentence`, 2, 'Deal 9 damage. Draw 1 if this defeats the monster.', [{ type: 'damage', amount: 9 }, { type: 'drawIfMonsterDefeated', amount: 1 }], ['precise', 'wound'])];
    case 'baneArmor':
      return [skill(gearId, `${slug}Stand`, `${name}: Stand Judged`, 1, 'Gain 6 block, or 9 with matching Monster Bane.', [{ type: 'block', amount: 6, bonusIfMonsterBane: 3 }], ['block', 'monsterBane']), skill(gearId, `${slug}Answer`, `${name}: Answer the Beast`, 0, 'Gain 1 survival. With Monster Bane, draw 1. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'drawIfMonsterBane', amount: 1 }], ['survival', 'monsterBane', 'exhaust'], true)];
    case 'judgement':
      return [skill(gearId, `${slug}Read`, `${name}: Read the Verdict`, 0, 'Clarify the tell and Mark the monster. Exhaust.', [{ type: 'revealIntentHint' }, { type: 'markMonster' }], ['reveal', 'marked', 'exhaust'], true), strike('Punish', 'Punish the Verdict', 4, { effect: { bonusIfMonsterMarked: 3 }, description: 'Deal 4 damage, +3 if Marked.' }, ['marked'])];
    case 'tauntRisk':
      return [skill(gearId, `${slug}Call`, `${name}: Royal Challenge`, 0, 'Gain 2 survival, add 1 Panic, and Mark the monster. Exhaust.', [{ type: 'survival', amount: 2 }, { type: 'addPanic', amount: 1 }, { type: 'markMonster' }], ['survival', 'panic', 'marked', 'exhaust'], true), strike('Answer', 'Demand an Answer', 6, { effect: { bonusIfSurvivalSpent: 2 }, description: 'Deal 6 damage, +2 if Survival was spent.' }, ['survival'])];
    default:
      return [strike('Technique', 'Signature Strike', 5), guard('Guard', 'Signature Guard', 5)];
  }
}

export const legacyCompatibilityGearCards = {};
export const legacyCompatibilityGearCardPackages = {};

Object.entries(exactSets).forEach(([gearId, set]) => {
  legacyCompatibilityGearCardPackages[gearId] = set.map(card => card.id);
  set.forEach(card => { legacyCompatibilityGearCards[card.id] = card; });
});

Object.entries(profiles).forEach(([gearId, [name, profile]]) => {
  const set = profileCards(gearId, name, profile);
  legacyCompatibilityGearCardPackages[gearId] = set.map(card => card.id);
  set.forEach(card => { legacyCompatibilityGearCards[card.id] = card; });
});

Object.entries(legacyCompatibilityGearCardPackages).forEach(([gearId, cardIds]) => {
  const weaponType = explicitWeaponTypes[gearId];
  if (!weaponType) return;
  cardIds.forEach(cardId => {
    const card = legacyCompatibilityGearCards[cardId];
    if (!card) return;
    card.tags = [...new Set([...card.tags, weaponType])];
  });
});

legacyCompatibilityGearCards.swarmBite = gearCard(
  'eggPouch',
  'swarmBite',
  'Swarm Bite',
  0,
  'Deal 2 damage twice. Exhaust.',
  [{ type: 'multiHitDamage', amount: 2, hits: 2 }],
  { type: 'attack', tags: ['attack', 'multiHit', 'exhaust'], exhaust: true }
);

export const gearCards = {};
export const gearCardPackages = {};
