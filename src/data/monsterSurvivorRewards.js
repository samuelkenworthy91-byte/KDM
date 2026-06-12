const quarryNames = {
  paleHuntLion: 'Pale Hunt Lion',
  wailingAntelope: 'Wailing Antelope',
  ashPhoenix: 'Ash Phoenix',
  bloatedGodling: 'Bloated Godling',
  crimsonCrocodile: 'Crimson Crocodile',
  frogdog: 'Frogdog',
  silkMatriarch: 'Silk Matriarch',
  bloomKnight: 'Bloom Knight',
  smogSingers: 'Smog Singers',
  chitinCrusader: 'Chitin Crusader',
  drakeEmperor: 'Drake Emperor',
  sunSovereign: 'Sun Sovereign',
  prideKing: 'Pride King'
};

const quarryRewardSpecs = {
  paleHuntLion: [
    ['markThePrey', 'Mark the Prey', 1, 'mimic', 0, 'Mark the monster. Your next attack deals +2 damage.', [{ type: 'markMonster' }, { type: 'nextAttackBonus', amount: 2 }], ['setup', 'marked', 'predator']],
    ['pounceWindow', 'Pounce Window', 1, 'counter', 1, 'Gain 7 block. Draw 1 if Survival was spent this turn.', [{ type: 'block', amount: 7 }, { type: 'drawIfSurvivalSpent', amount: 1 }], ['block', 'pounce', 'counter']],
    ['stillHunter', 'Still Hunter', 2, 'mimic', 0, 'Gain 1 survival. Your next attack Marks the monster. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'nextAttackMarks' }], ['survival', 'stillness', 'exhaust']],
    ['whitePounce', 'White Pounce', 2, 'mimic', 2, 'Deal 7 damage, +4 if this is your first attack this turn.', [{ type: 'damage', amount: 7, bonusIfFirstAttack: 4 }], ['attack', 'pounce', 'firstStrike']],
    ['breakTheCrouch', 'Break the Crouch', 2, 'counter', 1, 'Deal 3 damage. This precise strike excels at exposed limbs.', [{ type: 'damage', amount: 3 }], ['attack', 'counter', 'limbHunter', 'breaker', 'safeWeakPoint']],
    ['perfectPredator', 'Perfect Predator', 3, 'mimic', 4, 'Deal 14 damage. Add 1 Panic unless the monster is Marked.', [{ type: 'damage', amount: 14 }, { type: 'addPanic', amount: 1 }], ['attack', 'rare', 'predator', 'risk']]
  ],
  wailingAntelope: [
    ['wildGallop', 'Wild Gallop', 1, 'mimic', 0, 'Gain 1 survival. Your next attack this turn deals +1 per hit. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'nextAttackBonus', amount: 1 }], ['survival', 'speed', 'setup', 'exhaust']],
    ['hoofbeatFlurry', 'Hoofbeat Flurry', 1, 'mimic', 1, 'Deal 2 damage three times. If this is the second attack played this turn, gain 1 survival.', [{ type: 'multiHitDamage', amount: 2, hits: 3 }, { type: 'survivalIfSecondAttack', amount: 1 }], ['attack', 'multiHit', 'speed']],
    ['skipTheKick', 'Skip the Kick', 2, 'counter', 1, 'Gain 6 block, or 10 against a multi-hit or trample tell.', [{ type: 'block', amount: 6, bonusIfMultiHitTell: 4 }], ['block', 'counter', 'antiMultiHit']],
    ['trampleLine', 'Trample Line', 2, 'mimic', 2, 'Deal 4 damage. This strike deals heavy break damage to movement weak points.', [{ type: 'damage', amount: 4 }], ['attack', 'break', 'movement', 'limbHunter', 'breaker']],
    ['cutTheRhythm', 'Cut the Rhythm', 2, 'counter', 1, 'Deal 3 damage. Reduce the next monster attack by 2.', [{ type: 'damage', amount: 3 }, { type: 'nextMonsterDamageReduction', amount: 2 }], ['attack', 'counter', 'antiMultiHit']],
    ['hungerSprint', 'Hunger Sprint', 3, 'mimic', 3, 'Deal 3 damage four times. Add 1 Panic. Draw 1 if this breaks a weak point.', [{ type: 'multiHitDamage', amount: 3, hits: 4 }, { type: 'addPanic', amount: 1 }, { type: 'drawIfWeakPointBroken', amount: 1 }], ['attack', 'multiHit', 'rare', 'hunger']]
  ],
  ashPhoenix: [
    ['ashRecall', 'Ash Recall', 1, 'mimic', 0, 'Draw 2, then discard another card.', [{ type: 'draw', amount: 2 }, { type: 'discard', amount: 1 }], ['memory', 'draw', 'discard']],
    ['unburntThought', 'Unburnt Thought', 1, 'counter', 1, 'Gain 5 block and remove 1 Panic from any pile.', [{ type: 'block', amount: 5 }, { type: 'removePanicAny' }], ['block', 'counter', 'ash']],
    ['borrowedSecond', 'Borrowed Second', 2, 'mimic', 0, 'Return the top discard to hand, or draw 1. Exhaust.', [{ type: 'drawFromDiscardOrDeck', amount: 1 }], ['memory', 'discard', 'timeLoop', 'exhaust']],
    ['cinderLoop', 'Cinder Loop', 2, 'mimic', 2, 'Deal 5 damage twice. Discard another card if possible.', [{ type: 'multiHitDamage', amount: 5, hits: 2 }, { type: 'discard', amount: 1 }], ['attack', 'timeLoop', 'discard']],
    ['anchorTheMoment', 'Anchor the Moment', 2, 'counter', 1, 'Gain 4 block and draw 1. Panic cannot improve this card.', [{ type: 'block', amount: 4 }, { type: 'draw', amount: 1 }], ['block', 'counter', 'memory']],
    ['burnTheMemory', 'Burn the Memory', 3, 'mimic', 3, 'Discard another card. Deal 12 damage if discarded, otherwise 6.', [{ type: 'discardForDamage', amount: 12, fallbackAmount: 6 }], ['attack', 'rare', 'ash', 'discard']]
  ],
  bloatedGodling: [
    ['thunderBrace', 'Thunder Brace', 1, 'counter', 1, 'Gain 8 block.', [{ type: 'block', amount: 8 }], ['block', 'thunder', 'counter']],
    ['organSpark', 'Organ Spark', 1, 'mimic', 0, 'Lose 1 HP and gain 2 survival. Exhaust.', [{ type: 'loseHp', amount: 1 }, { type: 'survival', amount: 2 }], ['wound', 'organ', 'exhaust']],
    ['groundTheSlam', 'Ground the Slam', 2, 'counter', 1, 'Gain 6 block and reduce the next monster attack by 2.', [{ type: 'block', amount: 6 }, { type: 'nextMonsterDamageReduction', amount: 2 }], ['block', 'slam', 'counter']],
    ['swollenImpact', 'Swollen Impact', 2, 'mimic', 3, 'Deal 11 damage. Gain 4 block after the impact.', [{ type: 'damage', amount: 11 }, { type: 'block', amount: 4 }], ['attack', 'heavy', 'delayed']],
    ['painConductor', 'Pain Conductor', 2, 'mimic', 1, 'Deal 4 damage, +4 while wounded.', [{ type: 'damage', amount: 4, bonusIfSurvivorWounded: 4 }], ['attack', 'wound', 'thunder']],
    ['livingThunderhead', 'Living Thunderhead', 3, 'mimic', 4, 'Deal 16 damage. Lose 2 HP.', [{ type: 'damage', amount: 16 }, { type: 'loseHp', amount: 2 }], ['attack', 'rare', 'heavy', 'risk']]
  ],
  crimsonCrocodile: [
    ['riverAmbush', 'River Ambush', 1, 'mimic', 0, 'Mark the monster and gain 2 block. Exhaust.', [{ type: 'markMonster' }, { type: 'block', amount: 2 }], ['ambush', 'marked', 'exhaust']],
    ['scaleAgainstBlood', 'Scale Against Blood', 1, 'counter', 1, 'Gain 7 block and remove 1 Panic.', [{ type: 'block', amount: 7 }, { type: 'removePanicAny' }], ['block', 'counter', 'bleed']],
    ['dragUnder', 'Drag Under', 2, 'mimic', 1, 'Deal 4 damage and remove 4 monster block.', [{ type: 'damage', amount: 4 }, { type: 'removeMonsterBlock', amount: 4 }], ['attack', 'drag', 'grip']],
    ['breakTheJaw', 'Break the Jaw', 2, 'counter', 2, 'Deal 5 damage with strong break pressure against head and armour.', [{ type: 'damage', amount: 5 }], ['attack', 'counter', 'headHunter', 'breaker']],
    ['blockThenBite', 'Block Then Bite', 2, 'mimic', 1, 'Deal damage equal to half your block, up to 20.', [{ type: 'damageFromBlock', divisor: 2, maximum: 20 }], ['attack', 'block', 'bite']],
    ['deathRoll', 'Death Roll', 3, 'mimic', 3, 'Deal 4 damage three times, +1 per hit if the monster is Marked.', [{ type: 'multiHitDamage', amount: 4, hits: 3, markedAmount: 5 }], ['attack', 'rare', 'multiHit', 'marked']]
  ],
  frogdog: [
    ['tongueMark', 'Tongue Mark', 1, 'mimic', 0, 'Mark the monster. Draw 1. Exhaust.', [{ type: 'markMonster' }, { type: 'draw', amount: 1 }], ['tongue', 'marked', 'exhaust']],
    ['slipTheSnare', 'Slip the Snare', 1, 'counter', 1, 'Gain 6 block and 1 survival.', [{ type: 'block', amount: 6 }, { type: 'survival', amount: 1 }], ['block', 'counter', 'snare']],
    ['toxicNibble', 'Toxic Nibble', 2, 'mimic', 1, 'Deal 3 damage and apply 2 Bleed.', [{ type: 'damage', amount: 3 }, { type: 'bleedMonster', amount: 2 }], ['attack', 'poison', 'bleed']],
    ['cutTheTongue', 'Cut the Tongue', 2, 'counter', 1, 'Deal 3 damage with heavy break pressure against flexible limbs.', [{ type: 'damage', amount: 3 }], ['attack', 'counter', 'limbHunter', 'breaker']],
    ['wrongWayLeap', 'Wrong-Way Leap', 2, 'mimic', 0, 'Gain 4 block and draw 1. Add 1 Panic. Exhaust.', [{ type: 'block', amount: 4 }, { type: 'draw', amount: 1 }, { type: 'addPanic', amount: 1 }], ['block', 'leap', 'random', 'exhaust']],
    ['impossibleBounce', 'Impossible Bounce', 3, 'mimic', 3, 'Deal 2 damage five times. Gain 1 survival.', [{ type: 'multiHitDamage', amount: 2, hits: 5 }, { type: 'survival', amount: 1 }], ['attack', 'rare', 'multiHit', 'leap']]
  ],
  silkMatriarch: [
    ['castTheThread', 'Cast the Thread', 1, 'mimic', 0, 'Mark the monster and gain 3 block.', [{ type: 'markMonster' }, { type: 'block', amount: 3 }], ['web', 'bind', 'marked']],
    ['cutFree', 'Cut Free', 1, 'counter', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }], ['block', 'counter', 'web']],
    ['venomMeasure', 'Venom Measure', 2, 'mimic', 1, 'Deal 2 damage and apply 3 Bleed.', [{ type: 'damage', amount: 2 }, { type: 'bleedMonster', amount: 3 }], ['attack', 'venom', 'bleed']],
    ['silkShelter', 'Silk Shelter', 2, 'support', 1, 'Gain 4 block. The next survivor gains 3 block.', [{ type: 'block', amount: 4 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: 3 }], ['support', 'party', 'web']],
    ['burnTheAnchor', 'Burn the Anchor', 2, 'counter', 2, 'Deal 5 damage and remove 5 monster block.', [{ type: 'damage', amount: 5 }, { type: 'removeMonsterBlock', amount: 5 }], ['attack', 'counter', 'web', 'breaker']],
    ['matriarchPreparation', 'Matriarch Preparation', 3, 'mimic', 3, 'Deal 10 damage, +5 if the monster is Marked.', [{ type: 'damage', amount: 10, bonusIfMonsterMarked: 5 }], ['attack', 'rare', 'web', 'setup']]
  ],
  bloomKnight: [
    ['duelistMeasure', 'Duelist Measure', 1, 'mimic', 0, 'Draw 1. Your next attack deals +2. Exhaust.', [{ type: 'draw', amount: 1 }, { type: 'nextAttackBonus', amount: 2 }], ['duel', 'setup', 'exhaust']],
    ['gracefulVoid', 'Graceful Void', 1, 'counter', 1, 'Gain 6 block. Draw 1 if no attack has been played.', [{ type: 'block', amount: 6 }, { type: 'drawIfNoAttackPlayed', amount: 1 }], ['block', 'dodge', 'counter']],
    ['singlePetalCut', 'Single Petal Cut', 2, 'mimic', 2, 'Deal 7 damage, +5 if this is your first attack this turn.', [{ type: 'damage', amount: 7, bonusIfFirstAttack: 5 }], ['attack', 'precise', 'singleAttack']],
    ['thornRiposte', 'Thorn Riposte', 2, 'mimic', 1, 'Gain 4 block. Your next Counter deals +3.', [{ type: 'block', amount: 4 }, { type: 'nextCounterBonus', amount: 3 }], ['block', 'riposte', 'counter']],
    ['breakTheFlourish', 'Break the Flourish', 2, 'counter', 1, 'Deal 4 damage and Mark the monster.', [{ type: 'damage', amount: 4 }, { type: 'markMonster' }], ['attack', 'counter', 'stance']],
    ['perfectBloom', 'Perfect Bloom', 3, 'mimic', 4, 'Deal 17 damage. This must be your first attack for full force.', [{ type: 'damage', amount: 12, bonusIfFirstAttack: 5 }], ['attack', 'rare', 'precise', 'singleAttack']]
  ],
  smogSingers: [
    ['answeringTone', 'Answering Tone', 1, 'mimic', 0, 'Gain 3 block. Draw 1 if the previous card was an attack.', [{ type: 'block', amount: 3 }, { type: 'drawIfPreviousCardAttack', amount: 1 }], ['chorus', 'rhythm', 'block']],
    ['clearTheSmoke', 'Clear the Smoke', 1, 'counter', 1, 'Remove 1 Panic and gain 5 block.', [{ type: 'removePanicAny' }, { type: 'block', amount: 5 }], ['counter', 'smoke', 'panic']],
    ['strikingVerse', 'Striking Verse', 2, 'mimic', 1, 'Deal 4 damage, +3 if the previous card was a skill.', [{ type: 'damage', amount: 4, bonusIfPreviousCardSkill: 3 }], ['attack', 'chorus', 'rhythm']],
    ['sharedRefrain', 'Shared Refrain', 2, 'support', 1, 'Gain 1 survival. The next survivor draws 1.', [{ type: 'survival', amount: 1 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'draw', value: 1 }], ['support', 'party', 'song']],
    ['silenceTheLead', 'Silence the Lead', 2, 'counter', 2, 'Deal 6 damage and remove 3 monster block.', [{ type: 'damage', amount: 6 }, { type: 'removeMonsterBlock', amount: 3 }], ['attack', 'counter', 'sound']],
    ['manyThroatedCry', 'Many-Throated Cry', 3, 'mimic', 3, 'Deal 9 damage. Add 1 Panic; every ally gains 2 block.', [{ type: 'damage', amount: 9 }, { type: 'addPanic', amount: 1 }, { type: 'partyEffect', target: 'all', effectType: 'block', value: 2 }], ['attack', 'rare', 'party', 'chorus']]
  ],
  chitinCrusader: [
    ['closeTheShell', 'Close the Shell', 1, 'mimic', 1, 'Gain 10 block. Discard another card.', [{ type: 'block', amount: 10 }, { type: 'discard', amount: 1 }], ['block', 'shell', 'heavy']],
    ['stepAsideTheHorn', 'Step Aside the Horn', 1, 'counter', 1, 'Gain 6 block and reduce the next monster attack by 1.', [{ type: 'block', amount: 6 }, { type: 'nextMonsterDamageReduction', amount: 1 }], ['block', 'counter', 'charge']],
    ['resinGuard', 'Resin Guard', 2, 'mimic', 1, 'Gain 7 block. Your next attack deals +2.', [{ type: 'block', amount: 7 }, { type: 'nextAttackBonus', amount: 2 }], ['block', 'guard', 'shell']],
    ['returnTheShell', 'Return the Shell', 2, 'mimic', 1, 'Deal damage equal to half your block, up to 20.', [{ type: 'damageFromBlock', divisor: 2, maximum: 20 }], ['attack', 'block', 'shell']],
    ['crackThePlate', 'Crack the Plate', 2, 'counter', 2, 'Remove all monster block, then deal 3 damage.', [{ type: 'removeAllMonsterBlock' }, { type: 'damage', amount: 3 }], ['attack', 'counter', 'armour', 'breaker']],
    ['crusaderAdvance', 'Crusader Advance', 3, 'mimic', 4, 'Deal 13 damage and gain 8 block.', [{ type: 'damage', amount: 13 }, { type: 'block', amount: 8 }], ['attack', 'rare', 'heavy', 'guard']]
  ],
  drakeEmperor: [
    ['crystalFacet', 'Crystal Facet', 1, 'mimic', 1, 'Gain 6 block and draw 1.', [{ type: 'block', amount: 6 }, { type: 'draw', amount: 1 }], ['crystal', 'block']],
    ['quenchTheThroat', 'Quench the Throat', 1, 'counter', 1, 'Gain 7 block and remove 2 monster block.', [{ type: 'block', amount: 7 }, { type: 'removeMonsterBlock', amount: 2 }], ['counter', 'fire', 'block']],
    ['imperialOrder', 'Imperial Order', 2, 'support', 0, 'The next survivor draws 1 and gains 2 block. Exhaust.', [{ type: 'partyEffect', target: 'nextPartyMember', effectType: 'draw', value: 1 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: 2 }], ['support', 'party', 'command', 'exhaust']],
    ['crystalBreak', 'Crystal Break', 2, 'counter', 2, 'Deal 5 damage and remove all monster block.', [{ type: 'damage', amount: 5 }, { type: 'removeAllMonsterBlock' }], ['attack', 'counter', 'crystal', 'breaker']],
    ['furnaceEdict', 'Furnace Edict', 2, 'mimic', 3, 'Deal 12 damage and add 1 Panic.', [{ type: 'damage', amount: 12 }, { type: 'addPanic', amount: 1 }], ['attack', 'fire', 'command', 'risk']],
    ['moltenDominion', 'Molten Dominion', 3, 'mimic', 4, 'Deal 18 damage. Add 2 Panic.', [{ type: 'damage', amount: 18 }, { type: 'addPanic', amount: 2 }], ['attack', 'rare', 'fire', 'imperial']]
  ],
  sunSovereign: [
    ['warmRadiance', 'Warm Radiance', 1, 'mimic', 0, 'Heal 1 HP and gain 1 survival. Exhaust.', [{ type: 'heal', amount: 1 }, { type: 'survival', amount: 1 }], ['radiant', 'healing', 'exhaust']],
    ['shadeTheEyes', 'Shade the Eyes', 1, 'counter', 1, 'Gain 7 block.', [{ type: 'block', amount: 7 }], ['block', 'counter', 'blind']],
    ['noonGuard', 'Noon Guard', 2, 'mimic', 2, 'Gain 11 block.', [{ type: 'block', amount: 11 }], ['block', 'radiant', 'shell']],
    ['coolTheShell', 'Cool the Shell', 2, 'counter', 1, 'Deal 3 damage and remove 5 monster block.', [{ type: 'damage', amount: 3 }, { type: 'removeMonsterBlock', amount: 5 }], ['attack', 'counter', 'heat', 'breaker']],
    ['punishingGlare', 'Punishing Glare', 2, 'mimic', 1, 'Deal 4 damage, +4 while you have block.', [{ type: 'damage', amount: 4, bonusIfBlock: 4 }], ['attack', 'radiant', 'block']],
    ['sovereignFlash', 'Sovereign Flash', 3, 'mimic', 3, 'Deal 11 damage, Mark the monster, and gain 5 block.', [{ type: 'damage', amount: 11 }, { type: 'markMonster' }, { type: 'block', amount: 5 }], ['attack', 'rare', 'radiant', 'blind']]
  ],
  prideKing: [
    ['raiseTheMane', 'Raise the Mane', 1, 'mimic', 0, 'Gain 1 survival and Mark the monster. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'markMonster' }], ['challenge', 'marked', 'exhaust']],
    ['standJudged', 'Stand Judged', 1, 'counter', 1, 'Gain 8 block.', [{ type: 'block', amount: 8 }], ['block', 'counter', 'judgement']],
    ['royalChallenge', 'Royal Challenge', 2, 'mimic', 1, 'Deal 5 damage, +3 with at least 2 survival.', [{ type: 'damage', amount: 5, bonusIfHighSurvival: 3, survivalRequired: 2 }], ['attack', 'challenge', 'survival']],
    ['guardTheFearful', 'Guard the Fearful', 2, 'support', 1, 'Gain 5 block. Every ally gains 1 block.', [{ type: 'block', amount: 5 }, { type: 'partyEffect', target: 'all', effectType: 'block', value: 1 }], ['support', 'party', 'morale']],
    ['denyTheSentence', 'Deny the Sentence', 2, 'counter', 2, 'Deal 6 damage and remove 1 Panic.', [{ type: 'damage', amount: 6 }, { type: 'removePanicAny' }], ['attack', 'counter', 'judgement']],
    ['regalFinalBlow', 'Regal Final Blow', 3, 'mimic', 4, 'Deal 14 damage, +5 if the monster is below half HP.', [{ type: 'damage', amount: 14, bonusIfMonsterWounded: 5 }], ['attack', 'rare', 'finisher', 'regal']]
  ]
};

Object.entries(quarryRewardSpecs).forEach(([quarryId, specs], index) => {
  const quarryName = quarryNames[quarryId] || quarryId;
  specs.unshift(
    [
      'patientObservation',
      `${quarryName} Observation`,
      1,
      'counter',
      0,
      'Gain 3 block and draw 1. Exhaust.',
      [
        { type: 'block', amount: 3, quarryLesson: quarryId },
        { type: 'draw', amount: 1 }
      ],
      ['block', 'counter', 'tell', 'exhaust']
    ],
    [
      'measuredLesson',
      `${quarryName} Lesson`,
      1,
      index % 3 === 0 ? 'support' : 'mimic',
      1,
      'Deal 3 damage and Mark the monster.',
      [
        { type: 'damage', amount: 3, quarryLesson: quarryId },
        { type: 'markMonster' }
      ],
      ['attack', 'marked', index % 3 === 0 ? 'support' : 'mimic']
    ]
  );
});

const rarityForLevel = level => level === 3 ? 'rare' : level === 2 ? 'uncommon' : 'common';

function makeCardReward(quarryId, spec) {
  const [suffix, name, levelMin, family, cost, description, effects, tags] = spec;
  const id = `${quarryId}_${suffix}`;
  return {
    id,
    name,
    type: 'card',
    family,
    description,
    effectText: description,
    rarity: rarityForLevel(levelMin),
    levelMin,
    quarrySpecific: true,
    tags: [
      'monsterReward', family, quarryId, 'quarrySpecific',
      `level${levelMin}`, ...(levelMin === 3 ? ['rare'] : []), ...tags
    ],
    mechanicalEffect: {
      card: {
        id,
        name,
        cost,
        description,
        type: tags.includes('attack') ? 'attack' : 'skill',
        effects,
        tags: ['personal', 'monsterReward', family, quarryId, 'quarrySpecific', ...tags],
        sourceType: 'personal',
        implemented: true
      }
    },
    implemented: true
  };
}

function makeBaneReward(quarryId) {
  const id = `monsterBane_${quarryId}`;
  return {
    id,
    name: `Monster Bane: ${quarryNames[quarryId] || quarryId}`,
    type: 'monsterBane',
    family: 'bane',
    description: 'Reveal exact intent details, weak-point openings, failed-break risks, and harvest information for this quarry.',
    effectText: 'Permanent quarry knowledge. Locked, unforgettable, and never replaceable.',
    rarity: 'rare',
    levelMin: 1,
    quarrySpecific: true,
    locked: true,
    unforgettable: true,
    replaceable: false,
    tags: ['monsterReward', 'monsterBane', quarryId, 'quarrySpecific', 'locked'],
    mechanicalEffect: { fightingArtId: id },
    implemented: true
  };
}

export const monsterSurvivorRewards = Object.fromEntries(
  Object.entries(quarryRewardSpecs).map(([quarryId, specs]) => {
    const rewards = specs.map(spec => makeCardReward(quarryId, spec));
    const monsterBaneReward = makeBaneReward(quarryId);
    return [quarryId, {
      quarryId,
      monsterBaneReward,
      rewardPool: [...rewards, monsterBaneReward],
      levelRewards: {
        1: rewards.filter(item => item.levelMin === 1),
        2: rewards.filter(item => item.levelMin === 2),
        3: rewards.filter(item => item.levelMin === 3)
      }
    }];
  })
);

export const monsterRewardCards = Object.fromEntries(
  Object.values(monsterSurvivorRewards)
    .flatMap(entry => Object.values(entry.levelRewards).flat())
    .map(item => [item.id, item.mechanicalEffect.card])
);

export function getMonsterBaneOfferChance(level, {
  brokeWeakPoint = false,
  dealtFinalBlow = false,
  survivorHasAnyBane = false,
  partyHasMatchingBane = false
} = {}) {
  if (survivorHasAnyBane) return 0;
  const base = { 1: 0.08, 2: 0.15, 3: 0.25 }[level] || 0.08;
  return Math.min(0.35,
    base +
    (brokeWeakPoint ? 0.05 : 0) +
    (dealtFinalBlow ? 0.05 : 0) +
    (!partyHasMatchingBane ? 0.05 : 0)
  );
}

export function shouldOfferMonsterBane(level, context = {}, random = Math.random) {
  return random() < getMonsterBaneOfferChance(level, context);
}

export function getMonsterSurvivorRewardChoices(quarryId, level, {
  includeBane = false,
  survivorHasAnyBane = false,
  quarryRevealed = true
} = {}) {
  const entry = monsterSurvivorRewards[quarryId];
  if (!entry || !quarryRevealed) return [];
  const pool = Array.from({ length: level }, (_, index) => entry.levelRewards[index + 1] || []).flat();
  const targetCount = level + 2;
  const ordered = [...pool].sort((a, b) => {
    const levelDelta = b.levelMin - a.levelMin;
    return levelDelta || Math.random() - 0.5;
  });
  const choices = ordered.slice(0, Math.max(0, targetCount - (includeBane ? 1 : 0)));
  if (includeBane && !survivorHasAnyBane) choices.unshift(entry.monsterBaneReward);
  return choices;
}

export function findMonsterSurvivorReward(rewardId) {
  return Object.values(monsterSurvivorRewards)
    .flatMap(entry => entry.rewardPool)
    .find(item => item.id === rewardId) || null;
}

export function validateMonsterBaneRewards({
  survivors = [],
  offeredRewards = [],
  renderedRewardIds = null
} = {}) {
  const warnings = [];
  Object.entries(monsterSurvivorRewards).forEach(([quarryId, entry]) => {
    const expectedId = `monsterBane_${quarryId}`;
    if (!entry.monsterBaneReward) warnings.push(`${quarryId}: missing Monster Bane reward`);
    if (!entry.rewardPool.some(reward => reward.id === expectedId)) {
      warnings.push(`${quarryId}: Monster Bane is not in the reward pool`);
    }
    const eligibleProbe = getMonsterSurvivorRewardChoices(quarryId, 3, { includeBane: true });
    if (!eligibleProbe.some(reward => reward.id === expectedId)) {
      warnings.push(`${quarryId}: eligible Monster Bane was filtered out`);
    }
  });
  survivors.forEach(survivor => {
    const banes = (survivor.fightingArts || []).filter(id => id.startsWith('monsterBane_'));
    const offeredBanes = offeredRewards.filter(reward =>
      reward.survivorId === survivor.id && reward.rewardId?.startsWith('monsterBane_')
    );
    if (banes.length && offeredBanes.length) {
      warnings.push(`${survivor.name || survivor.id}: incorrectly offered a second Monster Bane`);
    }
    if (banes.length > 1) warnings.push(`${survivor.name || survivor.id}: owns multiple Monster Banes`);
  });
  if (Array.isArray(renderedRewardIds)) {
    offeredRewards
      .filter(reward => reward.rewardId?.startsWith('monsterBane_'))
      .forEach(reward => {
        if (!renderedRewardIds.includes(reward.rewardId)) {
          warnings.push(`${reward.rewardId}: offered Monster Bane is not displayed in the UI`);
        }
      });
  }
  warnings.forEach(message => console.warn(`[Monster Bane] ${message}`));
  return warnings;
}

export function validateRewardVariety() {
  const warnings = [];
  const effectOwners = new Map();
  Object.entries(monsterSurvivorRewards).forEach(([quarryId, entry]) => {
    const rewards = Object.values(entry.levelRewards).flat();
    if (rewards.length < 6) warnings.push(`${quarryId}: fewer than 6 learned rewards`);
    if (!entry.monsterBaneReward) warnings.push(`${quarryId}: Monster Bane missing`);
    const patterns = new Set();
    const costs = new Set();
    rewards.forEach(reward => {
      const card = reward.mechanicalEffect.card;
      costs.add(card.cost);
      const pattern = JSON.stringify(card.effects);
      patterns.add(pattern);
      const owners = effectOwners.get(pattern) || [];
      effectOwners.set(pattern, [...owners, quarryId]);
    });
    if (patterns.size < rewards.length - 1) warnings.push(`${quarryId}: repeated reward effects`);
    if (costs.size < 3) warnings.push(`${quarryId}: reward costs lack variety`);
  });
  effectOwners.forEach((owners, pattern) => {
    const uniqueOwners = [...new Set(owners)];
    if (uniqueOwners.length > 2) warnings.push(`Shared reward template across ${uniqueOwners.join(', ')}: ${pattern}`);
  });
  warnings.forEach(message => console.warn(`[Reward variety] ${message}`));
  return warnings;
}
