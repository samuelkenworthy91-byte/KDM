import { quarryList } from './quarries.js';
import { nemesisList } from './nemesisEncounters.js';

export const fightingArts = {
  clawStyle: {
    id: 'clawStyle',
    name: 'Claw Style',
    description: 'Attacks deal +1 damage.',
    trigger: 'When playing an attack.',
    effect: { type: 'attackDamageBonus', amount: 1 },
    implemented: true
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'While you have 0 block, attacks deal +1 damage.',
    trigger: 'When playing an attack at 0 block.',
    effect: { type: 'noBlockAttackDamageBonus', amount: 1 },
    implemented: true
  },
  tumble: {
    id: 'tumble',
    name: 'Tumble',
    description: 'Start each combat with +3 block.',
    trigger: 'Combat start.',
    effect: { type: 'startingBlock', amount: 3 },
    implemented: true
  },
  scarTissue: {
    id: 'scarTissue',
    name: 'Scar Tissue',
    description: 'Start each combat with +2 block.',
    trigger: 'Combat start.',
    effect: { type: 'startingBlock', amount: 2 },
    implemented: true
  },
  hardened: {
    id: 'hardened',
    name: 'Hardened',
    description: 'Gain +1 max HP.',
    trigger: 'When learned.',
    effect: { type: 'maxHp', amount: 1 },
    implemented: true
  },
  focusedBreath: {
    id: 'focusedBreath',
    name: 'Focused Breath',
    description: 'Draw 1 extra card at the start of combat.',
    trigger: 'Combat start.',
    effect: { type: 'extraFirstTurnDraw', amount: 1 },
    implemented: true
  },
  steadyHands: {
    id: 'steadyHands', name: 'Steady Hands',
    description: 'Once per combat, the first Panic a card would add grants 1 block instead.',
    trigger: 'First self-inflicted Panic.', effect: { type: 'panicToBlock', amount: 1 },
    tags: ['survival', 'panic'], implemented: true
  },
  bodyShield: {
    id: 'bodyShield', name: 'Body Shield',
    description: 'After gaining 8 block in one turn, another party member heals 1 HP after combat.',
    trigger: 'Gain 8 block in a turn.', effect: { type: 'partyHealAfterCombat', amount: 1 },
    tags: ['support', 'party'], implemented: true
  },
  grimTeacher: {
    id: 'grimTeacher', name: 'Grim Teacher',
    description: 'After a successful hunt, another party member gains 1 weapon proficiency XP.',
    trigger: 'Successful hunt.', effect: { type: 'partyWeaponXp', amount: 1 },
    tags: ['support', 'weapon', 'party'], implemented: true
  },
  lastToRun: {
    id: 'lastToRun', name: 'Last to Run',
    description: 'Start combat with +1 survival while another party member is wounded.',
    trigger: 'Combat start.', effect: { type: 'survivalIfPartyWounded', amount: 1 },
    tags: ['support', 'survival', 'party'], implemented: true
  },
  scarReader: {
    id: 'scarReader', name: 'Scar Reader',
    description: 'If this survivor has a scar, their first attack each combat deals +1.',
    trigger: 'First attack.', effect: { type: 'firstAttackIfScar', amount: 1 },
    tags: ['wound', 'selfish'], implemented: true
  },
  fearEater: {
    id: 'fearEater', name: 'Fear Eater',
    description: 'The first Panic removed each combat grants 1 survival.',
    trigger: 'Remove Panic.', effect: { type: 'survivalOnPanicRemoved', amount: 1 },
    tags: ['panic', 'survival'], implemented: true
  },
  boneMemory: {
    id: 'boneMemory', name: 'Bone Memory',
    description: 'The first attack with a bone weapon each combat Marks the monster.',
    trigger: 'First bone weapon attack.', effect: { type: 'firstBoneAttackMarks' },
    tags: ['weapon', 'counter'], implemented: true
  },
  hideWorker: {
    id: 'hideWorker', name: 'Hide Worker',
    description: 'While wearing body armor, the first block card each combat gains +2 block.',
    trigger: 'First block card.', effect: { type: 'firstArmorBlockBonus', amount: 2 },
    tags: ['weapon', 'support'], implemented: true
  },
  lanternSinger: {
    id: 'lanternSinger', name: 'Lantern Singer',
    description: 'Once per hunt, another survivor gains +1 survival before their turn.',
    trigger: 'Chosen ally turn start.', effect: { type: 'partySurvival', amount: 1 },
    tags: ['support', 'party', 'survival'], implemented: true
  },
  packMender: {
    id: 'packMender', name: 'Pack Mender',
    description: 'Rest nodes heal every living party member for 1 additional HP.',
    trigger: 'Rest node.', effect: { type: 'partyRestHealing', amount: 1 },
    tags: ['support', 'party', 'wound'], implemented: true
  },
  openingReader: {
    id: 'openingReader', name: 'Opening Reader', description: 'Gain 2 block when the first tell remains vague.',
    trigger: 'First vague tell.', effect: { type: 'firstVagueTellBlock', amount: 2 },
    tags: ['counter'], implemented: true
  },
  sharedBreath: {
    id: 'sharedBreath', name: 'Shared Breath', description: 'The next party member starts their first turn with 1 block.',
    trigger: 'End first turn.', effect: { type: 'nextPartyBlock', amount: 1 },
    tags: ['support', 'party'], implemented: true
  },
  woundLedger: {
    id: 'woundLedger', name: 'Wound Ledger', description: 'Deal +1 with the first attack for each injury, maximum 2.',
    trigger: 'First attack.', effect: { type: 'firstAttackPerInjury', amount: 1, maximum: 2 },
    tags: ['wound', 'risky'], implemented: true
  },
  patientEdge: {
    id: 'patientEdge', name: 'Patient Edge', description: 'If no attack was played last turn, the first attack deals +2.',
    trigger: 'First attack after restraint.', effect: { type: 'patientAttack', amount: 2 },
    tags: ['weapon', 'counter'], implemented: true
  },
  panicCourier: {
    id: 'panicCourier', name: 'Panic Courier', description: 'Once per combat, move one incoming Panic to your discard to give another survivor 2 block.',
    trigger: 'Panic gained.', effect: { type: 'panicForPartyBlock', amount: 2 },
    tags: ['panic', 'support', 'party'], implemented: true
  },
  hardRationer: {
    id: 'hardRationer', name: 'Hard Rationer', description: 'Rest healing is reduced by 1, but start each combat with +1 survival.',
    trigger: 'Rest and combat start.', effect: { type: 'riskySurvival', amount: 1 },
    tags: ['selfish', 'survival', 'risky'], implemented: true
  },
  markedHunter: {
    id: 'markedHunter', name: 'Marked Hunter', description: 'The first attack against a Marked monster deals +2.',
    trigger: 'First attack against Marked.', effect: { type: 'firstMarkedAttack', amount: 2 },
    tags: ['counter', 'weapon'], implemented: true
  },
  lanternWard: {
    id: 'lanternWard', name: 'Lantern Ward', description: 'Once per combat, prevent 1 Panic from being added to every party member.',
    trigger: 'Party-wide Panic.', effect: { type: 'partyPanicReduction', amount: 1 },
    tags: ['support', 'party', 'panic'], implemented: true
  },
  bloodTempo: {
    id: 'bloodTempo', name: 'Blood Tempo', description: 'At half HP or less, the second attack each turn deals +1.',
    trigger: 'Second attack while wounded.', effect: { type: 'woundedSecondAttack', amount: 1 },
    tags: ['wound', 'risky', 'weapon'], implemented: true
  },
  finalLantern: {
    id: 'finalLantern', name: 'Final Lantern', description: 'Once per combat, when another survivor dies, gain 2 survival and draw 2.',
    trigger: 'Party member death.', effect: { type: 'allyDeathRecovery', survival: 2, draw: 2 },
    tags: ['rare', 'party', 'survival'], implemented: true
  },
  deadEyeCalm: {
    id: 'deadEyeCalm', name: 'Dead-Eye Calm',
    description: 'With a head scar, the first precise or ranged attack each combat deals +2.',
    trigger: 'First precise attack.', effect: { type: 'headScarAttack', amount: 2 },
    tags: ['wound', 'precise'], implemented: true
  },
  offHandGrit: {
    id: 'offHandGrit', name: 'Off-Hand Grit',
    description: 'With an arm wound or scar, the first one-handed attack each combat draws 1.',
    trigger: 'First one-handed attack.', effect: { type: 'armWoundDraw', amount: 1 },
    tags: ['wound', 'weapon'], implemented: true
  },
  stubbornFootwork: {
    id: 'stubbornFootwork', name: 'Stubborn Footwork',
    description: 'With a leg wound or scar, the first Dodge each combat gains +3 block.',
    trigger: 'First Dodge.', effect: { type: 'legWoundDodge', amount: 3 },
    tags: ['wound', 'survival'], implemented: true
  },
  ribCageResolve: {
    id: 'ribCageResolve', name: 'Rib-Cage Resolve',
    description: 'With a body scar, start combat with +1 survival.',
    trigger: 'Combat start.', effect: { type: 'bodyScarSurvival', amount: 1 },
    tags: ['wound', 'survival'], implemented: true
  },
  fearListener: {
    id: 'fearListener', name: 'Fear Listener',
    description: 'With a mind wound or disorder, the first Panic each combat grants +1 survival.',
    trigger: 'First Panic.', effect: { type: 'mindWoundPanicSurvival', amount: 1 },
    tags: ['wound', 'panic'], implemented: true
  },
  scarredTeacher: {
    id: 'scarredTeacher', name: 'Scarred Teacher',
    description: 'After a hunt where this survivor was wounded, another party member gains 1 weapon XP.',
    trigger: 'Hunt end.', effect: { type: 'woundedPartyWeaponXp', amount: 1 },
    tags: ['wound', 'party'], implemented: true
  },
  bloodMemory: {
    id: 'bloodMemory', name: 'Blood Memory',
    description: 'After being wounded this combat, attacks deal +1.',
    trigger: 'Attack while wounded.', effect: { type: 'woundedCombatAttack', amount: 1 },
    tags: ['wound', 'weapon'], implemented: true
  },
  woundLaugh: {
    id: 'woundLaugh', name: 'Wound Laugh',
    description: 'Once per combat when reduced to 1 HP, gain 1 survival.',
    trigger: 'Reduced to 1 HP.', effect: { type: 'oneHpSurvival', amount: 1 },
    tags: ['wound', 'survival'], implemented: true
  },
  carefulPatient: {
    id: 'carefulPatient', name: 'Careful Patient',
    description: 'Bandages used by this survivor heal 1 additional HP.',
    trigger: 'Bandage treatment.', effect: { type: 'bandageHealing', amount: 1 },
    tags: ['wound', 'support'], implemented: true
  },
  boneSetWrong: {
    id: 'boneSetWrong', name: 'Bone Set Wrong',
    description: 'Start with 1 less max HP, but heavy weapon attacks deal +1.',
    trigger: 'Combat start and heavy attack.', effect: { type: 'wrongSetHeavy', amount: 1 },
    tags: ['wound', 'heavy'], implemented: true
  },
  monsterBane_paleHuntLion: {
    id: 'monsterBane_paleHuntLion',
    name: 'Monster Bane: Pale Hunt Lion',
    description: 'Reveal exact Pale Hunt Lion intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Pale Hunt Lion.',
    effect: { type: 'monsterBane', quarryId: 'paleHuntLion' },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    quarrySpecific: true,
    replaceable: false,
    implemented: true
  },
  monsterBane_wailingAntelope: {
    id: 'monsterBane_wailingAntelope',
    name: 'Monster Bane: Wailing Antelope',
    description: 'Reveal exact Wailing Antelope intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Wailing Antelope.',
    effect: { type: 'monsterBane', quarryId: 'wailingAntelope' },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    quarrySpecific: true,
    replaceable: false,
    implemented: true
  },
  monsterBane_ashPhoenix: {
    id: 'monsterBane_ashPhoenix',
    name: 'Monster Bane: Ash Phoenix',
    description: 'Reveal exact Ash Phoenix intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Ash Phoenix.',
    effect: { type: 'monsterBane', quarryId: 'ashPhoenix' },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    quarrySpecific: true,
    replaceable: false,
    implemented: true
  }
};

const art = (
  id,
  name,
  mechanicalEffectText,
  tags,
  passiveEffects = [],
  options = {}
) => ({
  id,
  name,
  type: options.type || 'fightingArt',
  description: options.shortDescription || mechanicalEffectText,
  shortDescription: options.shortDescription || mechanicalEffectText,
  fullDescription: options.fullDescription || mechanicalEffectText,
  mechanicalEffectText,
  trigger: options.trigger || 'Passive.',
  effect: passiveEffects[0] || { type: 'describedPassive' },
  passiveEffects,
  grantsCards: options.grantsCards || [],
  tags,
  rarity: options.rarity || 'common',
  source: options.source || 'Survivor reward',
  requirements: options.requirements || null,
  implemented: true
});

Object.assign(fightingArts, Object.fromEntries([
  art('shoulderBehindShield', 'Shoulder Behind Shield', 'The first time this survivor is targeted each combat, gain +3 block.', ['block', 'defensive', 'party'], [{ type: 'firstTargetedBlock', value: 3 }]),
  art('braceAndBreathe', 'Brace and Breathe', 'If this survivor ends a turn with 8 or more block, gain 1 survival once per combat.', ['block', 'survival'], [{ type: 'survivalAtTurnEndBlock', threshold: 8, value: 1 }], { grantsCards: ['holdTheLine'] }),
  art('lastLanternGuard', 'Last Lantern Guard', 'If another party member is dead or wounded, start combat with +1 survival.', ['party', 'survival', 'trauma'], [{ type: 'survivalIfPartyWounded', value: 1 }]),
  art('bloodInTheHands', 'Blood in the Hands', 'While wounded, this survivor’s first attack each combat deals +3.', ['wound', 'attack'], [{ type: 'firstAttackIfWounded', value: 3 }], { grantsCards: ['boneSetterStance'] }),
  art('secondCutHabit', 'Second Cut Habit', 'The second attack this survivor plays each turn deals +2.', ['attack', 'combo'], [{ type: 'secondAttackBonus', value: 2 }]),
  art('finishItClean', 'Finish It Clean', 'Attacks against monsters below 25% HP deal +2.', ['attack', 'finisher'], [{ type: 'lowMonsterHpAttackBonus', threshold: 0.25, value: 2 }]),
  art('warningVoice', 'Warning Voice', 'When a monster tell is shown, one other party member gains +2 block once per combat.', ['support', 'tell', 'party'], [{ type: 'tellPartyBlock', value: 2 }], { grantsCards: ['counterCall'] }),
  art('fieldTeacher', 'Field Teacher', 'After a successful hunt, another surviving party member gains +1 weapon proficiency XP.', ['support', 'weapon', 'party'], [{ type: 'partyWeaponXp', value: 1 }], { grantsCards: ['takeTheLesson'] }),
  art('useTheFear', 'Use the Fear', 'If Panic is in this survivor’s discard pile, their first attack each combat deals +2.', ['panic', 'attack'], [{ type: 'firstAttackIfPanicDiscard', value: 2 }], { grantsCards: ['fearIntoFire'] }),
  art('quietMadnessStyle', 'Quiet Madness Style', 'If this survivor plays no attack cards on their turn, gain 1 survival.', ['panic', 'strange'], [{ type: 'survivalIfNoAttack', value: 1 }], { grantsCards: ['doNotLookAway'] }),
  art('carefulCarver', 'Careful Carver', 'Breaking a weak point with a Precise card slightly improves harvest quality.', ['harvest', 'precise'], [{ type: 'preciseBreakHarvestBonus', value: 1 }], { grantsCards: ['cleanCut'] }),
  art('brutalButcher', 'Brutal Butcher', 'Gain +3 break damage against hide, shell, and body weak points, but fragile parts are easier to ruin.', ['harvest', 'brutal'], [{ type: 'brutalBreakBonus', value: 3, fragileRisk: 1 }], { grantsCards: ['brutalBreak'] }),
  art('eyeHunter', 'Eye Hunter', 'Head and eye weak-point attacks gain +2 break damage with dagger, katar, or bow.', ['harvest', 'precise', 'dagger', 'katar', 'bow'], [{ type: 'taggedWeakPointBreakBonus', tags: ['head', 'eye'], weapons: ['dagger', 'katar', 'bow'], value: 2 }]),
  art('partBreaker', 'Part Breaker', 'Shell, hide, and horn weak-point attacks gain +3 break damage with hammer, axe, or club.', ['harvest', 'breaker', 'hammer', 'axe', 'club'], [{ type: 'taggedWeakPointBreakBonus', tags: ['shell', 'hide', 'horn'], weapons: ['hammer', 'axe', 'club'], value: 3 }]),
  art('readTheShoulders', 'Read the Shoulders', 'When a vague tell appears, gain +2 block once per combat.', ['tell', 'counter'], [{ type: 'firstVagueTellBlock', value: 2 }], { grantsCards: ['waitForTheShoulder'] }),
  art('interruptThePattern', 'Interrupt the Pattern', 'The first attack against an Open weak point each combat deals +2 break damage.', ['weakPoint', 'counter'], [{ type: 'firstOpenWeakPointBreakBonus', value: 2 }], { grantsCards: ['strikeTheOpening'] }),
  art('monsterStudent', 'Monster Student', 'If any party member has Monster Bane for this quarry, the first attack deals +1 damage and +1 break damage.', ['monsterBane', 'party'], [{ type: 'partyBaneFirstAttackBonus', damage: 1, breakDamage: 1 }]),
  art('swordRhythm', 'Sword Rhythm', 'After playing two sword cards in a combat, draw 1 once per combat.', ['sword', 'combo'], [{ type: 'weaponCardsDraw', weaponType: 'sword', count: 2, value: 1 }], { grantsCards: ['patientBlade'] }),
  art('daggerPatience', 'Dagger Patience', 'Dagger and katar attacks against Marked weak points gain +2 break damage.', ['dagger', 'katar', 'precise'], [{ type: 'markedWeakPointWeaponBreak', weapons: ['dagger', 'katar'], value: 2 }]),
  art('hammerCertainty', 'Hammer Certainty', 'Hammer and club cards remove +2 monster block or gain +2 break damage against shell and hide.', ['hammer', 'club', 'breaker'], [{ type: 'heavyBlockOrBreakBonus', value: 2 }]),
  art('bowStillness', 'Bow Stillness', 'The first bow attack each combat applies Marked.', ['bow', 'marked'], [{ type: 'firstWeaponAttackMarks', weaponType: 'bow' }], { grantsCards: ['markTheJoint'] }),
  art('spearDistance', 'Spear Distance', 'Spear attacks against leg and body weak points reduce failed-break risk once per combat.', ['spear', 'reach'], [{ type: 'weaponWeakPointRiskReduction', weaponType: 'spear', tags: ['leg', 'body'], value: 1 }]),
  art('fistDefiance', 'Fist Defiance', 'Counter deals +2 while fist-and-tooth gear is equipped.', ['fistAndTooth', 'counter'], [{ type: 'counterWithWeaponBonus', weaponType: 'fistAndTooth', value: 2 }]),
  art('strangeGrip', 'Strange Grip', 'The first strange-weapon card each combat draws 1 and adds 1 Panic to discard.', ['strangeWeapon', 'panic'], [{ type: 'firstWeaponCardDrawAndPanic', weaponType: 'strangeWeapon', draw: 1, panic: 1 }], { grantsCards: ['gutFeeling'] }),
  art('impossibleRefusal', 'Impossible Refusal', 'This no longer prevents death. The first block card each combat gains +3 block.', ['rare', 'block', 'wound'], [{ type: 'firstBlockBonus', value: 3 }], { rarity: 'rare', grantsCards: ['scarMemory'] }),
  art('monsterInTheBlood', 'Monster in the Blood', 'After defeating a level 3 quarry, start future fights against it with +1 survival and +1 strength.', ['rare', 'quarrySpecific'], [{ type: 'levelThreeQuarryMemory', survival: 1, strength: 1 }], { rarity: 'rare' }),
  art('perfectStillness', 'Perfect Stillness', 'Once per combat, playing no cards for a turn makes the next turn’s first attack deal +6.', ['rare', 'patience'], [{ type: 'stillTurnNextAttack', value: 6 }], { rarity: 'rare' }),
  art('lanternSaint', 'Lantern Saint', 'Once per hunt, heal every living party member by 1 after a combat.', ['rare', 'support', 'party'], [{ type: 'partyHealAfterCombat', value: 1 }], { rarity: 'rare', grantsCards: ['lanternOath'] }),
  art('lowLanternGuard', 'Low Lantern Guard', 'The first block card each combat gains +2 block.', ['block', 'defensive'], [{ type: 'firstBlockBonus', value: 2 }], { grantsCards: ['lowLanternCrawl'] }),
  art('counterPulse', 'Counter Pulse', 'After using Counter, the next attack deals +2.', ['counter', 'attack'], [{ type: 'counterNextAttackBonus', value: 2 }], { grantsCards: ['pounceReversal'] }),
  art('sharedGuard', 'Shared Guard', 'The first time this survivor gains 8 block in a turn, the next party member gains 3 block.', ['support', 'block', 'party'], [{ type: 'blockThresholdPartyBlock', threshold: 8, value: 3 }], { grantsCards: ['holdTheLine'] }),
  art('panicTurner', 'Panic Turner', 'The first Panic removed each combat gives another party member +2 block.', ['panic', 'support'], [{ type: 'panicRemovedPartyBlock', value: 2 }], { grantsCards: ['turnTheRoar'] }),
  art('disorderedShape', 'Disordered Shape', 'The first attack each combat deals +2 while this survivor has a disorder.', ['disorder', 'attack'], [{ type: 'firstAttackIfDisorder', value: 2 }], { grantsCards: ['rageWithShape'] }),
  art('scarMemoryArt', 'Scar Memory', 'With any scar, the first skill played each combat draws 1.', ['scar', 'draw'], [{ type: 'firstSkillIfScarDraw', value: 1 }], { grantsCards: ['scarMemory'] }),
  art('frontLantern', 'Front Lantern', 'In the first party slot, start combat with +2 block.', ['position', 'block', 'party'], [{ type: 'frontPositionBlock', value: 2 }], { grantsCards: ['lowLanternCrawl'] }),
  art('jointMarker', 'Joint Marker', 'The first weak point hit each combat becomes Marked.', ['weakPoint', 'marked'], [{ type: 'firstWeakPointMarks' }], { grantsCards: ['markTheJoint'] }),
  art('supportOath', 'Support Oath', 'Healing or guarding an ally grants 1 survival once per combat.', ['support', 'survival', 'party'], [{ type: 'supportActionSurvival', value: 1 }], { grantsCards: ['lanternOath'] }),
  art('lessonKeeper', 'Lesson Keeper', 'After surviving a combat in which a weapon card was played, gain 1 bonus proficiency XP once per hunt.', ['weapon', 'learning'], [{ type: 'bonusWeaponXp', value: 1 }], { grantsCards: ['takeTheLesson'] }),
  art('openHandSignal', 'Open Hand Signal', 'The next party member’s first attack each combat deals +1.', ['support', 'party', 'attack'], [{ type: 'nextPartyFirstAttackBonus', value: 1 }], { grantsCards: ['counterCall'] }),
  art('woundMender', 'Wound Mender', 'The first skill played while wounded heals 1 HP once per combat.', ['wound', 'healing'], [{ type: 'firstSkillWoundedHeal', value: 1 }], { grantsCards: ['boneSetterStance'] }),
  art('clearerTerror', 'Clearer Terror', 'Adding Panic can clarify the current tell once per combat.', ['panic', 'tell'], [{ type: 'panicClarifiesTell', value: 1 }], { grantsCards: ['doNotLookAway'] }),
  art('preciseOath', 'Precise Oath', 'The first Precise attack each combat gains +2 break damage.', ['precise', 'weakPoint'], [{ type: 'firstPreciseBreakBonus', value: 2 }], { grantsCards: ['cleanCut'] }),
  art('harvestVow', 'Harvest Vow', 'The first intact weak point broken each hunt slightly improves harvest quality.', ['harvest', 'weakPoint'], [{ type: 'firstBreakHarvestBonus', value: 1 }]),
  art('lastBreathGift', 'Last Breath Gift', 'When reduced to 1 HP, another living party member gains 1 survival once per hunt.', ['wound', 'support', 'party'], [{ type: 'oneHpPartySurvival', value: 1 }], { rarity: 'uncommon', grantsCards: ['sharedBreath'] }),
  art('patientPredator', 'Patient Predator', 'If the first card played this combat is an attack, it applies Marked.', ['attack', 'marked', 'patience'], [{ type: 'firstCardAttackMarks' }], { rarity: 'uncommon', grantsCards: ['patientBlade'] }),
  art('oathAgainstDeath', 'Oath Against Death', 'Once per hunt, a block card played at 1 HP gains +8 block.', ['rare', 'block', 'death'], [{ type: 'oneHpBlockBonus', value: 8 }], { rarity: 'rare', grantsCards: ['lanternOath'] }),
  art(
    'measuredPayment',
    'Measured Payment',
    'The first block card each combat gains +3 block.',
    ['nemesis', 'mirror', 'cruelCollector', 'block'],
    [{ type: 'firstBlockBonus', value: 3 }],
    { rarity: 'nemesis', source: 'Cruel Collector victory' }
  ),
  art(
    'verdictWithoutVoice',
    'Verdict Without Voice',
    'When the first vague tell appears each combat, gain +2 block.',
    ['nemesis', 'mirror', 'maskedJudge', 'tell'],
    [{ type: 'firstVagueTellBlock', value: 2 }],
    { rarity: 'nemesis', source: 'Masked Judge victory' }
  ),
  art(
    'noFootstepsBehind',
    'No Footsteps Behind',
    'While wounded, the first attack each combat deals +3 damage.',
    ['nemesis', 'mirror', 'wanderingKiller', 'wound', 'attack'],
    [{ type: 'firstAttackIfWounded', value: 3 }],
    { rarity: 'nemesis', source: 'Wandering Killer victory' }
  ),
  art(
    'wearTheDark',
    'Wear the Dark',
    'Once per combat, the first Panic a card would add grants 1 block instead.',
    ['nemesis', 'mirror', 'shadowStalker', 'panic', 'block'],
    [{ type: 'panicToBlock', value: 1 }],
    { rarity: 'nemesis', source: 'Shadow Stalker victory' }
  ),
  art(
    'invertedStrength',
    'Inverted Strength',
    'After using Counter, the next attack deals +2 damage.',
    ['nemesis', 'mirror', 'mirrorTyrant', 'counter', 'attack'],
    [{ type: 'counterNextAttackBonus', value: 2 }],
    { rarity: 'nemesis', source: 'Mirror Tyrant victory' }
  )
].map(entry => [entry.id, entry])));

quarryList.forEach(quarry => {
  const id = `monsterBane_${quarry.id}`;
  if (!fightingArts[id]) {
    fightingArts[id] = {
      id,
      name: `Monster Bane: ${quarry.displayName}`,
      description: `Reveal exact ${quarry.displayName} intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.`,
      trigger: `Against ${quarry.displayName}.`,
      effect: { type: 'monsterBane', quarryId: quarry.id },
      tags: ['monsterBane'],
      locked: true,
      unforgettable: true,
      quarrySpecific: true,
      replaceable: false,
      implemented: true
    };
  }
});

nemesisList.forEach(nemesis => {
  const id = `monsterBane_${nemesis.id}`;
  fightingArts[id] = {
    id,
    name: `Monster Bane: ${nemesis.displayName}`,
    description: `Reveal exact ${nemesis.displayName} intents. With Monster Archive, deal +1 damage to it.`,
    trigger: `Against ${nemesis.displayName}.`,
    effect: { type: 'monsterBane', quarryId: nemesis.id },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    implemented: true
  };
});

export const implementedFightingArts = Object.values(fightingArts).filter(art => art.implemented);
export const generalFightingArts = implementedFightingArts.filter(
  art => art.effect.type !== 'monsterBane' && !art.tags?.includes('nemesis')
);

export function getFightingArtGrantedCards(artId) {
  return fightingArts[artId]?.grantsCards || [];
}

export function getMonsterBaneId(quarryId) {
  return `monsterBane_${quarryId}`;
}

export function isMonsterBaneId(id) {
  return Boolean(id && (
    fightingArts[id]?.effect?.type === 'monsterBane' ||
    id.startsWith('monsterBane_')
  ));
}

export function getSurvivorMonsterBaneId(survivor) {
  return (survivor?.fightingArts || []).find(isMonsterBaneId) || null;
}

export function validateSurvivorMonsterBane(survivor) {
  const baneIds = (survivor?.fightingArts || []).filter(isMonsterBaneId);
  const keptId = baneIds[0] || null;
  const warnings = [];

  if (baneIds.length > 1) {
    warnings.push(`${survivor?.name || 'Survivor'} had multiple Monster Banes; kept ${keptId}.`);
  }
  if (keptId && (!fightingArts[keptId]?.locked || !fightingArts[keptId]?.unforgettable)) {
    warnings.push(`${keptId} must be locked and unforgettable.`);
  }

  return {
    survivor: {
      ...survivor,
      fightingArts: [
        ...(survivor?.fightingArts || []).filter(id => !isMonsterBaneId(id)),
        ...(keptId ? [keptId] : [])
      ]
    },
    keptId,
    removedIds: baneIds.slice(1),
    warnings
  };
}
