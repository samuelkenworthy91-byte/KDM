import { cards } from './cards.js';
import { gearCardPackages } from './gearCards.js';
import {
  explicitGearKeywords,
  getGearMetadata,
  weaponStyleDefinitions
} from './gearMetadata.js';
import { gearRegistry } from './overhaul/gearRegistry.js';
import {
  cleanGearDisplayName,
  dedupeGearList
} from '../utils/gearNormalization.js';

const LOCATION_QUARRIES = {
  lionTrophyHall: 'paleHuntLion',
  antelopeLarder: 'wailingAntelope',
  phoenixPyre: 'ashPhoenix',
  stormShrine: 'bloatedGodling',
  redTannery: 'crimsonCrocodile',
  wetYard: 'frogdog',
  silkLoom: 'silkMatriarch',
  duelistGarden: 'bloomKnight',
  smogKiln: 'smogSingers',
  chitinFoundry: 'chitinCrusader',
  crystalForge: 'drakeEmperor',
  shellSanctum: 'sunSovereign',
  prideHall: 'prideKing'
};

function recipe(id, name, buildingId, cost, description, cardPackage, passiveText, slot = 'gear', tags = []) {
  const quarryId = LOCATION_QUARRIES[buildingId] || null;
  const resolvedCardPackage = gearCardPackages[id] || cardPackage;
  return {
    id,
    name,
    buildingId,
    locationId: buildingId,
    quarryId,
    requiresInnovation: buildingId,
    unlockRequirement: { type: 'building', buildingId },
    cost,
    description,
    cardPackage: resolvedCardPackage,
    passiveText,
    passiveEffects: [{ type: 'described', text: passiveText }],
    slot,
    role: slot,
    tags: [...new Set([slot, ...(quarryId ? [quarryId] : []), ...tags])],
    implemented: true
  };
}

const currentEquipment = Object.fromEntries(
  gearRegistry.map(item => [
    item.id,
    {
      ...item,
      name: cleanGearDisplayName(item.name),
      deprecated: false,
      hiddenFromCrafting: false,
      legacySource: null,
      currentSource: 'v8GearRegistry'
    }
  ])
);

export const legacyCompatibilityEquipment = {
  boneBlade: recipe('boneBlade', 'Bone Blade', 'boneSmith', { bone: 1, sinew: 1 }, 'A reliable cutting weapon.', ['hack', 'hack', 'carve'], 'Adds direct attack cards.', 'weapon'),
  boneHammer: recipe('boneHammer', 'Bone Hammer', 'boneSmith', { bone: 2, hide: 1 }, 'A heavy weapon for cracking defenses.', ['skullCrack', 'skullCrack', 'guardBreak'], 'Heavy block-breaking package.', 'weapon'),
  boneDarts: recipe('boneDarts', 'Bone Darts', 'boneSmith', { bone: 1, sinew: 1 }, 'Light throwing weapons.', ['boneDart', 'boneDart', 'quickToss'], 'Fast ranged attack package.', 'weapon'),
  hideWraps: recipe('hideWraps', 'Hide Wraps', 'skinnery', { hide: 2 }, 'Simple layers of cured hide.', ['brace', 'duckAndRoll'], 'Start combat with +3 block.', 'armor'),
  rawhideHood: recipe('rawhideHood', 'Rawhide Hood', 'skinnery', { hide: 1, sinew: 1 }, 'A hood that narrows attention to the hunt.', ['readTheBeast', 'rawhideDodge'], 'Improves early defense.', 'armor'),
  rawhideVest: recipe('rawhideVest', 'Rawhide Vest', 'skinnery', { hide: 2, bone: 1 }, 'A fitted vest reinforced with bone toggles.', ['rawhideDodge', 'slipAway'], 'Start combat with +2 max HP.', 'armor'),
  monsterGrease: recipe('monsterGrease', 'Monster Grease', 'organGrinder', { organ: 1, hide: 1 }, 'Rendered fat protects exposed skin.', ['slipAway'], 'Start combat with +2 block.', 'consumable'),
  clawCharm: recipe('clawCharm', 'Claw Charm', 'organGrinder', { claw: 1, organ: 1 }, 'A trophy charm that encourages aggression.', ['clawStrike', 'ripOpen'], '+1 strength in combat.', 'trinket'),
  strangeEyeAmulet: recipe('strangeEyeAmulet', 'Strange Eye Amulet', 'organGrinder', { strangeEye: 1, organ: 1 }, 'An amulet that catches patterns hidden in panic.', ['strangeGlimpse', 'seeThePattern'], 'Adds deck filtering and dangerous insight.', 'trinket'),
  bloodPaint: recipe('bloodPaint', 'Blood Paint', 'organGrinder', { organ: 1, bone: 1 }, 'Ritual paint for committing to the first blow.', ['bloodRush', 'clawStrike'], '+1 strength in the first combat.', 'consumable'),

  lionFangKatar: recipe('lionFangKatar', 'Lion Fang Knife', 'lionTrophyHall', { paleLionClaw: 1, paleLionSinew: 1, bone: 1 }, 'A narrow predator knife made from a single lion claw.', ['clawStrike', 'savageFollowUp', 'ripOpen'], 'Marked knife combo identity.', 'weapon'),
  maneCloak: recipe('maneCloak', 'Mane Cloak', 'lionTrophyHall', { paleLionMane: 1, paleLionHide: 1 }, 'A crackling cloak made from a mature lion mane.', ['duckAndRoll', 'rawhideDodge'], 'Start combat with +1 survival and +3 block.', 'armor'),
  catEyeCharm: recipe('catEyeCharm', 'Cat Eye Charm', 'lionTrophyHall', { paleLionEye: 1, strangeEye: 1 }, 'A charm that reveals the opening in every fight.', ['strangeGlimpse', 'readTheBeast'], 'Draw 1 extra card on the first turn.', 'trinket'),

  wailingHornBow: recipe('wailingHornBow', 'Wailing Horn Bow', 'antelopeLarder', { wailingHorn: 1, screamingSinew: 1, bone: 1 }, 'A resonant bow with a screaming sinew string.', ['hornShot', 'hornShot', 'quickToss'], 'Ranged and draw identity.', 'weapon'),
  hornMaul: recipe('hornMaul', 'Horn Maul', 'antelopeLarder', { wailingHorn: 1, bone: 2, screamingSinew: 1 }, 'A massive horn-headed maul built to break guarded prey.', ['boneFlurry', 'goringSwing', 'braceMaul'], 'Heavy multi-hit and defensive attacks.', 'weapon'),
  stomachStoneCharm: recipe('stomachStoneCharm', 'Stomach Stone Charm', 'antelopeLarder', { stomachStone: 1, organ: 1 }, 'A grounding charm worn close to the heart.', ['settle', 'brace'], 'Recover after Panic.', 'trinket'),
  trampleBoots: recipe('trampleBoots', 'Trample Boots', 'antelopeLarder', { wailingHide: 1, horn: 1 }, 'Hard boots made for carrying momentum through a target.', ['trample', 'braceMaul'], 'Charge attacks reduce block.', 'armor'),

  ashFeatherMantle: recipe('ashFeatherMantle', 'Ash Feather Mantle', 'phoenixPyre', { ashFeather: 1, phoenixAsh: 1 }, 'A warm mantle that sheds distressing memories.', ['ashCycle', 'settle'], 'Supports Panic avoidance.', 'armor'),
  timeBoneBlade: recipe('timeBoneBlade', 'Time Bone Blade', 'phoenixPyre', { timeBone: 1, bone: 1, sinew: 1 }, 'A blade whose strike arrives twice.', ['delayedCut', 'delayedCut', 'quickToss'], 'Can grant extra energy.', 'weapon'),
  memoryGlassEye: recipe('memoryGlassEye', 'Memory Glass Eye', 'phoenixPyre', { memoryGlass: 1, strangeEye: 1 }, 'A lens for selecting which memories remain.', ['memoryFilter', 'seeThePattern'], 'Improves deck filtering and Panic control.', 'trinket')
};

const monsterRecipeRows = [
  ['paleFangKatar', 'Pale Fang Katar', 'lionTrophyHall', { paleLionClaw: 1, bone: 1, sinew: 1 }, 'A paired claw blade for rapid cuts.', ['clawStrike', 'savageFollowUp', 'ripOpen'], 'Fast attacks build into a brutal follow-up.', 'weapon'],
  ['paleManeBow', 'Pale Mane Bow', 'lionTrophyHall', { paleLionMane: 1, paleLionSinew: 1, bone: 1 }, 'A quiet bow for marking prey before it closes.', ['boneDart', 'pinningShot'], 'Ranged marking and weak-point pressure.', 'weapon'],
  ['whitePounceKatana', 'White Pounce Katana', 'lionTrophyHall', { elderPaleFang: 1, paleLionMane: 1, bone: 1 }, 'A long pale edge held motionless until the opening strike.', ['measuredStrike', 'ripOpen'], 'Precise first-strike risk package.', 'weapon'],
  ['stalkingSpear', 'Stalking Spear', 'lionTrophyHall', { paleLionClaw: 1, paleLionSinew: 1, bone: 1 }, 'A reach weapon for pinning legs and bracing a charge.', ['pinningShot', 'braceMaul'], 'Reach, movement break, and defensive pressure.', 'weapon'],
  ['lionhideBuckler', 'Lionhide Buckler', 'lionTrophyHall', { paleLionHide: 1, paleLionMane: 1 }, 'A compact hide shield reinforced for claws and pounces.', ['brace', 'guardBreak'], 'Defensive counter and block conversion.', 'weapon'],
  ['maneCloak', 'Mane Cloak', 'lionTrophyHall', { paleLionMane: 1, hide: 1 }, 'A cloak that turns with incoming blows.', ['duckAndRoll'], 'Start combat with +2 block.', 'armor'],
  ['catEyeCharm', 'Cat Eye Charm', 'lionTrophyHall', { paleLionEye: 1, strangeEye: 1 }, 'A charm for hunters who still lack a singular bane.', ['readTheBeast', 'strangeGlimpse'], 'Improves Monster Bane reward chance while its wearer has no Monster Bane.', 'trinket'],
  ['pouncingGreaves', 'Pouncing Greaves', 'lionTrophyHall', { paleLionSinew: 1, hide: 1 }, 'Spring-bound greaves that turn defense into momentum.', ['quickToss'], 'The first Counter each combat deals +1 damage.', 'armor'],
  ['whiskerNeedle', 'Whisker Needle', 'lionTrophyHall', { paleLionMane: 1, bone: 1 }, 'A trembling pointer for reading tiny changes in a quarry.', ['seeThePattern'], 'Once per hunt, clarifies one vague tell without revealing numbers.', 'tool'],
  ['predatorMask', 'Predator Mask', 'lionTrophyHall', { paleLionEye: 1, paleLionMane: 1, organ: 1 }, 'A pale mask that teaches the wearer to stare back.', ['lanternFocus'], 'Start combat with +1 survival; add 1 Panic if the wearer has no scars.', 'strange'],
  ['whiteClawTrap', 'White Claw Trap', 'lionTrophyHall', { paleLionClaw: 1, scrap: 1 }, 'A folding trap set during hunt preparation.', ['guardBreak'], 'The next hunted monster starts with reduced block.', 'tool'],
  ['huntingHideWrap', 'Hunting Hide Wrap', 'lionTrophyHall', { paleLionHide: 1, hide: 1 }, 'Layered hide fitted for long pursuit.', ['rawhideDodge'], '+1 max HP while equipped.', 'armor'],

  ['wailingHornBow', 'Wailing Horn Bow', 'antelopeLarder', { wailingHorn: 1, screamingSinew: 1, bone: 1 }, 'A bow that cries when fully drawn.', ['hornShot', 'quickToss'], 'Ranged attacks cycle the hand.', 'weapon'],
  ['stomachStoneCharm', 'Stomach Stone Charm', 'antelopeLarder', { stomachStone: 1, organ: 1 }, 'A polished weight that steadies panic.', ['settle'], 'The first Panic added each combat is placed on the bottom of the deck.', 'trinket'],
  ['trampleBoots', 'Trample Boots', 'antelopeLarder', { wailingHide: 1, horn: 1 }, 'Hard boots made to carry a charge through guard.', ['trample', 'braceMaul'], 'Charge attacks remove additional block.', 'armor'],
  ['hungerDrum', 'Hunger Drum', 'antelopeLarder', { wailingOrgan: 1, wailingHide: 1 }, 'A stomach drum whose rhythm refuses to slow.', ['bloodRush'], 'Start combat with +1 energy on the first turn.', 'tool'],
  ['gutCordWrap', 'Gut Cord Wrap', 'antelopeLarder', { screamingSinew: 1, hide: 1 }, 'Elastic cords that brace the torso.', ['brace', 'duckAndRoll'], 'Start combat with +2 block.', 'armor'],
  ['grassDevourerMask', 'Grass Devourer Mask', 'antelopeLarder', { stomachStone: 1, wailingOrgan: 1, hide: 1 }, 'A feeding mask that turns fear into appetite.', ['settle', 'savageFollowUp'], 'After removing Panic, the next attack deals +1 damage.', 'strange'],

  ['ashFeatherMantle', 'Ash Feather Mantle', 'phoenixPyre', { ashFeather: 1, phoenixAsh: 1 }, 'A mantle that sheds distressing memories.', ['ashCycle', 'settle'], 'Supports Panic control.', 'armor'],
  ['timeBoneBlade', 'Time Bone Blade', 'phoenixPyre', { timeBone: 1, bone: 1, sinew: 1 }, 'A blade whose strike seems to arrive twice.', ['delayedCut', 'quickToss'], 'Attacks can restore energy.', 'weapon'],
  ['memoryGlassEye', 'Memory Glass Eye', 'phoenixPyre', { memoryGlass: 1, strangeEye: 1 }, 'A lens for choosing which memory remains.', ['memoryFilter', 'seeThePattern'], 'Improves deck filtering.', 'trinket'],
  ['burntWingFan', 'Burnt Wing Fan', 'phoenixPyre', { ashFeather: 2, bone: 1 }, 'A broad fan that scatters hot ash.', ['quickToss', 'guardBreak'], 'The first attack can strip monster block.', 'tool'],
  ['emberThreadWrap', 'Ember Thread Wrap', 'phoenixPyre', { burntOrgan: 1, sinew: 1, hide: 1 }, 'Warm bindings that keep injured limbs moving.', ['duckAndRoll', 'bloodRush'], 'Start combat with +1 survival.', 'armor'],
  ['ashClockCharm', 'Ash Clock Charm', 'phoenixPyre', { phoenixAsh: 1, timeBone: 1 }, 'A charm that measures moments by cooling ash.', ['memoryFilter', 'delayedCut'], 'Once per combat, the first exhausted card returns to discard.', 'strange'],

  ['thunderMaul', 'Thunder Maul', 'stormShrine', { stormBone: 1, denseOrgan: 1, bone: 1 }, 'A heavy head that releases trapped thunder.', ['skullCrack', 'guardBreak', 'goringSwing'], 'Heavy strikes break guarded monsters.', 'weapon'],
  ['stormGutCharm', 'Storm Gut Charm', 'stormShrine', { thunderGland: 1, organ: 1 }, 'A charged organ sealed in hide.', ['bloodRush', 'seeThePattern'], 'Start combat with +1 energy.', 'trinket'],
  ['swollenHideVest', 'Swollen Hide Vest', 'stormShrine', { bloatedHide: 2, sinew: 1 }, 'Impact-resistant hide with air pockets.', ['brace', 'rawhideDodge'], 'Start combat with +3 block.', 'armor'],
  ['staticNeedle', 'Static Needle', 'stormShrine', { thunderGland: 1, scrap: 1 }, 'A fine conductor for waking exhausted muscles.', ['quickToss'], 'Once per hunt, gain 1 survival after an event.', 'tool'],
  ['godlingDrum', 'Godling Drum', 'stormShrine', { denseOrgan: 1, bloatedHide: 1 }, 'A deep drum that shakes loose hesitation.', ['braceMaul', 'settle'], 'The first Panic card drawn each combat may be discarded.', 'strange'],
  ['crackedMolarBlade', 'Cracked Molar Blade', 'stormShrine', { crackedMolar: 1, stormBone: 1 }, 'A tooth blade split by internal lightning.', ['skullCrack', 'savageFollowUp'], 'A heavy cleave that converts wounds into power.', 'weapon'],

  ['crimsonScaleShield', 'Crimson Scale Shield', 'redTannery', { crimsonScale: 2, hide: 1 }, 'Layered river scales that lock under pressure.', ['brace', 'rawhideDodge'], 'Start combat with +4 block.', 'armor'],
  ['riverToothBlade', 'River Tooth Blade', 'redTannery', { riverTooth: 1, bone: 1, sinew: 1 }, 'A serrated knife for quick cuts through opened guard.', ['hack', 'ripOpen'], 'Quick cuts strip guard and bleed exposed prey.', 'weapon'],
  ['redLeatherCoat', 'Red Leather Coat', 'redTannery', { redLeather: 1, hide: 1 }, 'Dense leather cured in mineral mud.', ['duckAndRoll', 'brace'], '+1 max HP while equipped.', 'armor'],
  ['drowningHook', 'Drowning Hook', 'redTannery', { riverTooth: 1, scrap: 1, sinew: 1 }, 'A hooked tool for dragging a target off balance.', ['guardBreak', 'quickToss'], 'The first hit removes 2 monster block.', 'tool'],
  ['bloodMudPaint', 'Blood-Mud Paint', 'redTannery', { bloodMudOrgan: 1, organ: 1 }, 'Cold paint that hides a hunter scent.', ['slipAway'], 'The monster begins combat with reduced block.', 'tool'],
  ['crocodileEyeCharm', 'Crocodile Eye Charm', 'redTannery', { crocodileEye: 1, strangeEye: 1 }, 'A still eye that rewards waiting.', ['readTheBeast', 'seeThePattern'], 'Draw 1 extra card on the first turn.', 'strange'],

  ['frogdogTongueWhip', 'Frogdog Tongue Whip', 'wetYard', { frogdogTongue: 1, sinew: 1 }, 'An adhesive whip for pulling open a guard.', ['quickToss', 'guardBreak'], 'Fast attacks remove block.', 'weapon'],
  ['rubberyHideSuit', 'Rubbery Hide Suit', 'wetYard', { rubberyHide: 2, hide: 1 }, 'Elastic armor that throws force sideways.', ['rawhideDodge', 'duckAndRoll'], 'Start combat with +3 block.', 'armor'],
  ['toxicGlandBomb', 'Toxic Gland Bomb', 'wetYard', { toxicGland: 1, scrap: 1 }, 'A sealed gland prepared as a one-use bomb.', ['boneDart', 'guardBreak'], 'The first combat monster starts wounded.', 'tool'],
  ['wetBoneClub', 'Wet Bone Club', 'wetYard', { wetBone: 2, organ: 1 }, 'A heavy club that never loses its weight.', ['skullCrack', 'goringSwing'], 'Heavy attacks punish low block.', 'weapon'],
  ['bulgingEyeCharm', 'Bulging Eye Charm', 'wetYard', { bulgingEye: 1, strangeEye: 1 }, 'A many-angled charm that catches sideward motion.', ['strangeGlimpse', 'seeThePattern'], 'Once per combat, draw after using Focus.', 'trinket'],
  ['leapingBoots', 'Leaping Boots', 'wetYard', { rubberyHide: 1, frogdogTongue: 1 }, 'Springy boots made for abrupt retreats.', ['slipAway', 'quickToss'], 'The first Dodge each combat gains +2 block.', 'armor'],

  ['silkThreadBow', 'Silk Thread Bow', 'silkLoom', { chitinThread: 2, bone: 1 }, 'A quiet bow strung with shell-strong silk.', ['boneDart', 'pinningShot', 'quickToss'], 'Ranged attacks control guarded prey.', 'weapon'],
  ['venomSacNeedle', 'Venom Sac Needle', 'silkLoom', { venomSac: 1, bone: 1 }, 'A narrow weapon fed by a measured venom sac.', ['clawStrike', 'ripOpen'], 'The first attack deals +1 damage.', 'weapon'],
  ['webbedHideMantle', 'Webbed Hide Mantle', 'silkLoom', { webbedHide: 1, hide: 1 }, 'A sticky mantle that catches glancing blows.', ['brace', 'duckAndRoll'], 'Start combat with +3 block.', 'armor'],
  ['spiderEyeCharm', 'Spider Eye Charm', 'silkLoom', { spiderEye: 1, strangeEye: 1 }, 'A faceted charm for seeing repeated patterns.', ['seeThePattern', 'strangeGlimpse'], 'Draw 1 extra card on the first turn.', 'trinket'],
  ['eggPouch', 'Egg Pouch', 'silkLoom', { silkGland: 1, organ: 1 }, 'A warm pouch used once during hunt preparation.', ['settle'], 'Ignore the first Panic added by a hunt event.', 'tool'],
  ['skitterWraps', 'Skitter Wraps', 'silkLoom', { chitinThread: 1, webbedHide: 1 }, 'Tight wraps that encourage sudden lateral movement.', ['slipAway', 'rawhideDodge'], 'The first Counter each combat costs no survival.', 'strange'],

  ['duelistThornRapier', 'Duelist Thorn Rapier', 'duelistGarden', { duelistThorn: 1, floralSinew: 1 }, 'A living point balanced for exact attacks.', ['measuredStrike', 'savageFollowUp', 'ripOpen'], 'Precise attacks gain strength after a block card.', 'weapon'],
  ['bloomPetalCloak', 'Bloom Petal Cloak', 'duelistGarden', { bloomPetal: 2, hide: 1 }, 'Overlapping petals turn blades aside.', ['duckAndRoll', 'rawhideDodge'], 'Start combat with +3 block.', 'armor'],
  ['polishedStemSpear', 'Polished Stem Spear', 'duelistGarden', { polishedStem: 1, bone: 1, sinew: 1 }, 'A rigid spear grown toward a single line.', ['quickToss', 'guardBreak'], 'The first attack removes monster block.', 'weapon'],
  ['floralSinewBowstring', 'Floral Sinew Bowstring', 'duelistGarden', { floralSinew: 2, bone: 1 }, 'A living string fitted to a compact bow.', ['boneDart', 'pinningShot'], 'Ranged cards draw through the deck.', 'tool'],
  ['knightSeedCharm', 'Knight Seed Charm', 'duelistGarden', { knightSeed: 1, strangeEye: 1 }, 'A seed that stiffens when danger approaches.', ['lanternFocus', 'seeThePattern'], 'Start combat with +1 survival.', 'trinket'],
  ['perfectStepBoots', 'Perfect Step Boots', 'duelistGarden', { bloomPetal: 1, polishedStem: 1 }, 'Measured footwear for never yielding the same angle twice.', ['slipAway', 'measuredStrike'], 'The first Dodge each combat gains +2 block.', 'strange'],

  ['smogPipeFlute', 'Smog Pipe Flute', 'smogKiln', { smogPipe: 1, bone: 1 }, 'A breath weapon that breaks a monster rhythm.', ['guardBreak', 'settle'], 'Once per combat, reduce monster block after Focus.', 'tool'],
  ['sootLungMask', 'Soot Lung Mask', 'smogKiln', { sootLung: 1, hide: 1 }, 'A breathing mask lined with warm soot.', ['settle', 'lanternFocus'], 'Ignore the first Panic added each combat.', 'armor'],
  ['harmonyBoneBlade', 'Harmony Bone Blade', 'smogKiln', { harmonyBone: 1, sinew: 1 }, 'A blade that vibrates at the moment of impact.', ['hack', 'savageFollowUp'], 'Successive attacks deal +1 damage.', 'weapon'],
  ['tarFeatherCloak', 'Tar Feather Cloak', 'smogKiln', { tarFeather: 2, hide: 1 }, 'A heavy cloak that swallows outlines.', ['slipAway', 'duckAndRoll'], 'Start combat with +3 block.', 'armor'],
  ['chokingMask', 'Choking Mask', 'smogKiln', { chokingMask: 1, organ: 1 }, 'A natural mask whose whisper unsettles prey.', ['strangeGlimpse', 'seeThePattern'], 'The monster begins combat with reduced block.', 'strange'],
  ['chorusBell', 'Chorus Bell', 'smogKiln', { harmonyBone: 1, scrap: 1 }, 'A bell tuned to several impossible voices.', ['bloodRush', 'quickToss'], 'Start combat with +1 energy on the first turn.', 'trinket'],

  ['chitinPlateArmor', 'Chitin Plate Armor', 'chitinFoundry', { chitinPlate: 2, hide: 1 }, 'Layered shell armor that closes under impact.', ['brace', 'rawhideDodge'], 'Start combat with +5 block.', 'armor'],
  ['beetleHornHammer', 'Beetle Horn Hammer', 'chitinFoundry', { beetleHorn: 1, bone: 1 }, 'A compact hammer built around a dense horn.', ['skullCrack', 'guardBreak'], 'Heavy attacks excel against block.', 'weapon'],
  ['resinBloodShield', 'Resin Blood Shield', 'chitinFoundry', { resinBlood: 1, chitinPlate: 1 }, 'A shield that hardens as it is struck.', ['braceMaul', 'brace'], 'The first block card gains +2 block.', 'armor'],
  ['jewelWingCharm', 'Jewel Wing Charm', 'chitinFoundry', { jewelWing: 1, strangeEye: 1 }, 'A brilliant plate that splits lantern light.', ['strangeGlimpse', 'lanternFocus'], 'Start combat with +1 survival.', 'trinket'],
  ['dungCoreBomb', 'Dung Core Bomb', 'chitinFoundry', { dungCore: 1, scrap: 1 }, 'A hot core sealed for one violent use.', ['boneDart', 'guardBreak'], 'The first combat monster starts wounded.', 'tool'],
  ['crusaderShellHelm', 'Crusader Shell Helm', 'chitinFoundry', { chitinPlate: 1, beetleHorn: 1 }, 'A forward-heavy helm that rewards commitment.', ['brace', 'goringSwing'], '+1 max HP while equipped.', 'strange'],

  ['drakeScaleMail', 'Drake Scale Mail', 'crystalForge', { drakeScale: 2, hide: 1 }, 'Heatproof scales linked into flexible mail.', ['brace', 'rawhideDodge'], 'Start combat with +4 block.', 'armor'],
  ['crystalBoneBlade', 'Crystal Bone Blade', 'crystalForge', { crystalBone: 1, sinew: 1 }, 'A translucent edge that holds furnace heat.', ['hack', 'ripOpen'], 'The first attack deals +1 damage.', 'weapon'],
  ['fireGlandBomb', 'Fire Gland Bomb', 'crystalForge', { fireGland: 1, scrap: 1 }, 'A pressure vessel prepared for hunt use.', ['boneDart', 'guardBreak'], 'The first combat monster starts wounded.', 'tool'],
  ['imperialHornHelm', 'Imperial Horn Helm', 'crystalForge', { imperialHorn: 1, drakeScale: 1 }, 'A crowned helm that makes retreat difficult.', ['braceMaul', 'lanternFocus'], 'Start combat with +1 survival and +2 block.', 'armor'],
  ['moltenEyeCharm', 'Molten Eye Charm', 'crystalForge', { moltenEye: 1, strangeEye: 1 }, 'A liquid-bright eye sealed behind crystal.', ['seeThePattern', 'strangeGlimpse'], 'Draw 1 extra card on the first turn.', 'trinket'],
  ['emberCrown', 'Ember Crown', 'crystalForge', { imperialHorn: 1, fireGland: 1, crystalBone: 1 }, 'A dangerous crown that burns away hesitation.', ['bloodRush', 'savageFollowUp'], 'Start combat with +1 energy; the first attack deals +1 damage.', 'strange'],

  ['sunShellShield', 'Sun Shell Shield', 'shellSanctum', { sunShell: 2, hide: 1 }, 'A warm shield that brightens under pressure.', ['brace', 'rawhideDodge'], 'Start combat with +5 block.', 'armor'],
  ['radiantEyeCharm', 'Radiant Eye Charm', 'shellSanctum', { radiantEye: 1, strangeEye: 1 }, 'A covered eye that reveals a quarry outline.', ['readTheBeast', 'seeThePattern'], 'Improves Monster Bane reward chance while unmarked by a Bane.', 'trinket'],
  ['solarIchorBlade', 'Solar Ichor Blade', 'shellSanctum', { solarIchor: 1, bone: 1 }, 'A bright blade fed by slow-moving ichor.', ['hack', 'savageFollowUp'], 'The first attack deals +1 damage.', 'weapon'],
  ['blindingScaleCloak', 'Blinding Scale Cloak', 'shellSanctum', { blindingScale: 2, hide: 1 }, 'Mirrored scales scatter hostile attention.', ['slipAway', 'duckAndRoll'], 'Start combat with +3 block.', 'armor'],
  ['warmPearlAmulet', 'Warm Pearl Amulet', 'shellSanctum', { warmPearl: 1, organ: 1 }, 'A steady heat carried close to the heart.', ['settle', 'lanternFocus'], 'Start combat with +1 survival.', 'trinket'],
  ['noonMirror', 'Noon Mirror', 'shellSanctum', { blindingScale: 1, radiantEye: 1, scrap: 1 }, 'A hand mirror that catches a fraction of noon.', ['strangeGlimpse', 'guardBreak'], 'The monster begins combat with reduced block.', 'strange'],

  ['prideManeCloak', 'Pride Mane Cloak', 'prideHall', { prideMane: 1, hide: 1 }, 'A royal mantle that makes fear visible.', ['duckAndRoll', 'lanternFocus'], 'Start combat with +1 survival and +2 block.', 'armor'],
  ['kingClawGauntlet', 'King Claw Gauntlet', 'prideHall', { kingClaw: 1, sinew: 1 }, 'A massive claw fixed to a braced gauntlet.', ['clawStrike', 'savageFollowUp'], 'Repeated rakes and close counters reward held courage.', 'weapon'],
  ['goldenFangBlade', 'Golden Fang Blade', 'prideHall', { goldenFang: 1, bone: 1 }, 'A weighted fang edge for decisive cuts.', ['ripOpen', 'guardBreak'], 'Attacks punish guarded prey.', 'weapon'],
  ['regalHideArmor', 'Regal Hide Armor', 'prideHall', { regalHide: 2, hide: 1 }, 'Scarred hide fitted into imposing armor.', ['brace', 'rawhideDodge'], 'Start combat with +5 block.', 'armor'],
  ['judgmentEyeCharm', 'Judgment Eye Charm', 'prideHall', { judgmentEye: 1, strangeEye: 1 }, 'An eye that seems to compare every choice.', ['seeThePattern', 'readTheBeast'], 'Draw 1 extra card on the first turn.', 'trinket'],
  ['royalChallengeHorn', 'Royal Challenge Horn', 'prideHall', { prideMane: 1, goldenFang: 1, organ: 1 }, 'A horn whose note demands an answer.', ['goringSwing', 'bloodRush'], 'Challenges the quarry and rallies every living survivor.', 'instrument']
];

const expandedWeaponRows = [
  ['boneCleaver', 'Bone Cleaver', 'boneSmith', { bone: 2, sinew: 1 }, 'A broad axe made for opening guarded prey.', ['skullCrack', 'hack'], 'Guardbreaking axe package.', 'weapon'],
  ['gutCordWhip', 'Gut Cord Whip', 'organGrinder', { organ: 1, sinew: 2 }, 'A weighted cord that catches limbs and armor.', ['quickToss', 'guardBreak'], 'Marking control weapon.', 'weapon'],
  ['boneKnuckleWraps', 'Bone Knuckle Wraps', 'boneSmith', { bone: 1, hide: 1 }, 'Reinforced wraps for close, repeated blows.', ['clawStrike', 'quickToss'], 'Fast fist combo package.', 'weapon'],
  ['paleFangSpear', 'Pale Fang Spear', 'lionTrophyHall', { elderPaleFang: 1, paleLionSinew: 1 }, 'A long spear tipped with an elder fang.', ['pinningShot', 'braceMaul'], 'Reach and defensive pressure.', 'weapon'],
  ['ashCurveBlade', 'Ash Curve Blade', 'phoenixPyre', { ashFeather: 1, timeBone: 1 }, 'A curved blade that follows cooling ash.', ['delayedCut', 'quickToss'], 'Quick duelist katana package.', 'weapon'],
  ['ashHookScythe', 'Ash Hook Scythe', 'phoenixPyre', { timeBone: 1, sinew: 1 }, 'A hooked ash blade that harvests hesitation.', ['ripOpen', 'seeThePattern'], 'Panic and finishing scythe package.', 'weapon'],
  ['crimsonRiverAxe', 'Crimson River Axe', 'redTannery', { riverTooth: 1, redLeather: 1 }, 'A river-tooth axe weighted for guarded scales.', ['skullCrack', 'guardBreak'], 'Brutal guardbreaking axe package.', 'weapon'],
  ['frogdogBiteGloves', 'Frogdog Bite Gloves', 'wetYard', { wetBone: 1, frogdogTongue: 1 }, 'Jaw-shaped gloves that snap shut in pairs.', ['clawStrike', 'quickToss'], 'Poisonous fist combo package.', 'weapon'],
  ['silkSnareWhip', 'Silk Snare Whip', 'silkLoom', { chitinThread: 2, venomSac: 1 }, 'A quiet whip that marks and binds prey.', ['pinningShot', 'guardBreak'], 'Web marking control package.', 'weapon'],
  ['petalEdgeKatana', 'Petal Edge Katana', 'duelistGarden', { bloomPetal: 1, duelistThorn: 1 }, 'A curved living edge for unguarded commitment.', ['measuredStrike', 'savageFollowUp'], 'Precise no-guard duelist package.', 'weapon'],
  ['bloomReaper', 'Bloom Reaper', 'duelistGarden', { polishedStem: 1, bloomPetal: 2 }, 'A long floral scythe that rewards patient setup.', ['ripOpen', 'measuredStrike'], 'Precise marked finisher package.', 'weapon'],
  ['floralSinewBow', 'Floral Sinew Bow', 'duelistGarden', { floralSinew: 2, polishedStem: 1 }, 'A living bow that tightens around a marked target.', ['hornShot', 'pinningShot'], 'Precise ranged marking package.', 'weapon'],
  ['smogReedScythe', 'Smog Reed Scythe', 'smogKiln', { smogPipe: 1, harmonyBone: 1 }, 'A hollow scythe that sings through every cut.', ['ripOpen', 'settle'], 'Panic-clearing scythe package.', 'weapon'],
  ['chitinHookAxe', 'Chitin Hook Axe', 'chitinFoundry', { beetleHorn: 1, chitinPlate: 1 }, 'A hooked shell axe for peeling armor.', ['skullCrack', 'guardBreak'], 'Heavy shellbreaking axe package.', 'weapon'],
  ['mirrorCuttingBlade', 'Mirror Cutting Blade', 'shellSanctum', { blindingScale: 1, radiantEye: 1 }, 'A curved blade visible only at the moment it cuts.', ['delayedCut', 'seeThePattern'], 'Radiant strange katana package.', 'weapon'],
  ['sunLance', 'Sun Lance', 'shellSanctum', { sunShell: 1, solarIchor: 1 }, 'A radiant spear that holds the line at noon.', ['pinningShot', 'braceMaul'], 'Radiant reach and guard package.', 'weapon'],
  ['kingClawGauntletPair', 'King Claw Gauntlet Pair', 'prideHall', { kingClaw: 1, prideMane: 1 }, 'Paired royal claws for relentless close attacks.', ['clawStrike', 'savageFollowUp'], 'Regal fist combo package.', 'weapon'],
  ['prideGrandBlade', 'Pride Grand Blade', 'prideHall', { goldenFang: 1, regalHide: 1 }, 'A two-handed royal edge with crushing authority.', ['goringSwing', 'guardBreak'], 'Heavy regal grand weapon package.', 'weapon']
];

expandedWeaponRows.forEach(row => monsterRecipeRows.push(row));

export const resolvedDuplicateRecipeIds = [];
monsterRecipeRows.forEach(row => {
  const existing = legacyCompatibilityEquipment[row[0]];
  if (existing && !existing.deprecated && !existing.hiddenFromCrafting) {
    resolvedDuplicateRecipeIds.push(row[0]);
    return;
  }
  legacyCompatibilityEquipment[row[0]] = recipe(...row);
});

[
  ['boneFlute', 'Bone Flute', 'boneSmith', { bone: 1, sinew: 1 }, 'A hollow instrument for carrying warnings through the dark.', ['dirgeOfTeeth'], 'Affects other survivors: grants survival to the next party member.', 'instrument', ['support', 'party']],
  ['hideDrum', 'Hide Drum', 'skinnery', { hide: 2, bone: 1 }, 'A compact drum that keeps several hunters moving together.', ['steadyBeat'], 'Affects other survivors: grants block to the next party member.', 'instrument', ['support', 'party']],
  ['gutStringLute', 'Gut-String Lute', 'organGrinder', { sinew: 2, organ: 1 }, 'A tense instrument whose ugly song redirects fear.', ['fearSong'], 'Affects other survivors: helps the next party member draw.', 'instrument', ['support', 'party']],
  ['fieldBandages', 'Field Bandages', 'skinnery', { hide: 1, organ: 1 }, 'Clean strips reserved for another hunter.', ['bindAnother'], 'Affects other survivors: heals an ally after combat once per hunt.', 'bandage', ['support', 'party']],
  ['splintKit', 'Splint Kit', 'boneSmith', { bone: 1, hide: 1 }, 'Straight bone braces carried for emergency treatment.', ['setTheLimb'], 'Affects other survivors: reduces an ally injury risk.', 'bandage', ['support', 'party']],
  ['lanternBanner', 'Lantern Banner', 'skinnery', { hide: 2, scrap: 1 }, 'A low banner that gives scattered hunters one point to follow.', ['raiseTheLanterns'], 'Affects other survivors: protects the whole party.', 'banner', ['support', 'party']],
  ['warningHorn', 'Warning Horn', 'boneSmith', { bone: 1, horn: 1 }, 'A blunt signal tool for calling out a monster pattern.', ['warningCall'], 'Affects other survivors: clarifies the next party member’s tell.', 'signalTool', ['support', 'party']],
  ['rationBundle', 'Ration Bundle', 'organGrinder', { organ: 1, hide: 1 }, 'Food packed to be divided without argument.', ['shareRations'], 'Affects other survivors: heals the party at rest.', 'ration', ['support', 'party']]
].forEach(row => {
  legacyCompatibilityEquipment[row[0]] = recipe(...row);
  legacyCompatibilityEquipment[row[0]].supportGear = true;
  legacyCompatibilityEquipment[row[0]].affectsOtherSurvivors = true;
});

Object.values(legacyCompatibilityEquipment).forEach(item => {
  item.deprecated = true;
  item.hiddenFromCrafting = true;
  item.legacySource = item.legacySource || 'handcraftedCompatibilityRecipe';
});

Object.values({ ...currentEquipment, ...legacyCompatibilityEquipment }).forEach(item => {
  item.name = cleanGearDisplayName(item.name);
  const metadata = getGearMetadata(item);
  item.weaponType = item.weaponType || metadata.weaponType;
  item.slot = item.slot || metadata.slot;
  item.hands = Number(item.hands ?? metadata.hands ?? 0) || 0;
  item.speedStyle = metadata.speedStyle;
  item.styleTags = metadata.styleTags;
  item.keywords = [...new Set([
    ...(item.keywords || []),
    ...metadata.keywords,
    (item.tags || []).includes('paleHuntLion') ? 'Predator' : null,
    (item.tags || []).includes('silkMatriarch') ? 'Web' : null,
    (item.tags || []).includes('drakeEmperor') ? 'Fire' : null,
    (item.tags || []).includes('sunSovereign') ? 'Radiant' : null,
    (item.tags || []).includes('prideKing') ? 'Regal' : null
  ].filter(Boolean))];
  const resolvedTags = item.cardPackage
    .flatMap(cardId => cards[cardId]?.tags || [])
    .filter((tag, index, tags) => tags.indexOf(tag) === index);
  item.deckIdentity = metadata.deckIdentity || resolvedTags
    .filter(tag => [
      'marked', 'panic', 'block', 'survival', 'reveal', 'discard', 'wound',
      'multiHit', 'support', 'party', 'bleed', 'counter', 'exhaust'
    ].includes(tag))
    .slice(0, 3)
    .join(', ') || explicitGearKeywords[item.id]?.join(', ') || 'survival support';
  item.proficiencyXpGranted = Boolean(item.weaponType) &&
    !item.deprecated &&
    !item.hiddenFromCrafting;
});

export const equipment = currentEquipment;
export const equipmentList = dedupeGearList(Object.values(equipment));
export const equipmentCatalogList = dedupeGearList(Object.values(equipment), {
  includeHidden: true
});

export function getEquipment(id) {
  const item = equipment[id] || legacyCompatibilityEquipment[id];
  if (item) {
    return {
      ...item,
      name: legacyCompatibilityEquipment[id] || item.deprecated || item.hiddenFromCrafting
        ? `${cleanGearDisplayName(item.name)} (Legacy gear)`
        : cleanGearDisplayName(item.name)
    };
  }
  return {
    id,
    name: 'Unknown / Legacy gear',
    passiveText: 'This item is from a legacy version of the game.',
    cardPackage: [],
    slot: 'gear',
    deprecated: true,
    hiddenFromCrafting: true,
    implemented: false
  };
}

export function getEquipmentDisplayName(id) {
  return getEquipment(id).name;
}

export function validateEquipmentIds() {
  const seen = new Set();
  const duplicateIds = [];
  equipmentList.forEach(item => {
    if (seen.has(item.id)) duplicateIds.push(item.id);
    seen.add(item.id);
  });
  return {
    duplicateIds,
    resolvedDuplicateRecipeIds: [...resolvedDuplicateRecipeIds]
  };
}

export function validateEquipmentCardPackages() {
  const missingCardIds = [];
  const equipmentWithNoCardPackage = [];
  let cardPackageCount = 0;

  equipmentList.forEach(item => {
    if (!Array.isArray(item.cardPackage) || item.cardPackage.length === 0) {
      equipmentWithNoCardPackage.push(item.id);
      return;
    }
    cardPackageCount += item.cardPackage.length;
    item.cardPackage.forEach(cardId => {
      if (!cards[cardId]) missingCardIds.push({ equipmentId: item.id, cardId });
    });
  });

  return { missingCardIds, equipmentWithNoCardPackage, cardPackageCount };
}

export function getMissingCardIdsFromEquipment() {
  return validateEquipmentCardPackages().missingCardIds;
}

export function validateGearVariety() {
  const warnings = [];
  const globalPackages = new Map();
  const globalEffectPackages = new Map();
  const monsterLocations = [...new Set(equipmentList.map(item => item.locationId).filter(locationId =>
    LOCATION_QUARRIES[locationId]
  ))];
  monsterLocations.forEach(locationId => {
    const items = equipmentList.filter(item => item.locationId === locationId);
    const typeCounts = items.reduce((counts, item) => {
      if (item.weaponType) counts[item.weaponType] = (counts[item.weaponType] || 0) + 1;
      return counts;
    }, {});
    Object.entries(typeCounts).forEach(([weaponType, count]) => {
      if (count > 2) warnings.push(`${locationId}: ${count} items use ${weaponType}`);
    });
    const roles = new Set(items.map(item => item.role || item.slot));
    if (roles.size < 4) warnings.push(`${locationId}: fewer than 4 distinct item roles`);
    const packages = new Map();
    const effectPackages = new Map();
    items.forEach(item => {
      const key = JSON.stringify(item.cardPackage || []);
      const owners = packages.get(key) || [];
      packages.set(key, [...owners, item.id]);
      const effectKey = JSON.stringify(item.cardPackage.map(cardId =>
        (cards[cardId]?.effects || []).map(effect => {
          const { cardId: temporaryCardId, ...comparable } = effect;
          return comparable;
        })
      ));
      const effectOwners = effectPackages.get(effectKey) || [];
      effectPackages.set(effectKey, [...effectOwners, item.id]);
      globalPackages.set(key, [...(globalPackages.get(key) || []), item.id]);
      globalEffectPackages.set(effectKey, [
        ...(globalEffectPackages.get(effectKey) || []),
        item.id
      ]);
      if (!item.weaponType && !item.keywords?.length) {
        warnings.push(`${item.id}: lacks weapon type and keywords`);
      }
      if (!item.deckIdentity) warnings.push(`${item.id}: lacks deck identity`);
      (item.cardPackage || []).forEach(cardId => {
        const card = cards[cardId];
        if (!card) {
          warnings.push(`${item.id}: missing card ${cardId}`);
          return;
        }
        if (card.sourceType === 'gear' && card.sourceGearId !== item.id) {
          warnings.push(`${item.id}: ${cardId} belongs to ${card.sourceGearId || 'no gear'}`);
        }
      });
      if (!item.weaponType && item.proficiencyXpGranted) {
        warnings.push(`${item.id}: nonweapon grants weapon proficiency`);
      }
      if (item.weaponType) {
        const style = weaponStyleDefinitions[item.weaponType];
        const cardTags = new Set(item.cardPackage.flatMap(cardId => cards[cardId]?.tags || []));
        const gearCards = item.cardPackage.map(cardId => cards[cardId]).filter(Boolean);
        const effects = gearCards.flatMap(card => card.effects || []);
        (style?.requiredTags || []).forEach(tag => {
          if (!cardTags.has(tag)) warnings.push(`${item.id}: ${item.weaponType} package lacks ${tag}`);
        });
        const hasEffect = type => effects.some(effect => effect.type === type);
        const hasConditional = property => effects.some(effect => Number(effect[property]) > 0);
        const semanticMatch = {
          axe: hasEffect('removeMonsterBlock') || hasEffect('removeAllMonsterBlock'),
          dagger: hasEffect('bleedMonster'),
          bow: hasEffect('markMonster'),
          grandWeapon: gearCards.some(card => card.type === 'attack' && card.cost >= 2),
          katar: hasEffect('multiHitDamage'),
          fistAndTooth: hasEffect('multiHitDamage') && hasEffect('nextCounterBonus'),
          shield: hasEffect('block') && (
            hasEffect('nextCounterBonus') || hasEffect('damageFromBlock') ||
            gearCards.some(card => card.type === 'attack')
          ),
          whip: hasEffect('markMonster'),
          scythe: hasEffect('bleedMonster') && hasEffect('addPanic'),
          katana: hasConditional('bonusIfFirstAttack'),
          strangeWeapon: hasEffect('addPanic')
        }[item.weaponType];
        if (semanticMatch === false) {
          warnings.push(`${item.id}: cards do not implement ${item.weaponType} mechanics`);
        }
        if (item.slot !== 'weapon') warnings.push(`${item.id}: weapon is labelled as ${item.slot}`);
        if (item.hands !== style?.hands) warnings.push(`${item.id}: incorrect hand count`);
      }
    });
    packages.forEach(owners => {
      if (owners.length > 1) warnings.push(`${locationId}: identical card package on ${owners.join(', ')}`);
    });
    effectPackages.forEach(owners => {
      if (owners.length > 1) warnings.push(`${locationId}: mechanically identical package on ${owners.join(', ')}`);
    });
  });
  globalPackages.forEach(owners => {
    if (owners.length > 1) warnings.push(`identical card package on ${owners.join(', ')}`);
  });
  globalEffectPackages.forEach(owners => {
    if (owners.length > 1) warnings.push(`mechanically identical package on ${owners.join(', ')}`);
  });
  warnings.forEach(message => console.warn(`[Gear variety] ${message}`));
  return warnings;
}

export function validateGearCardStyles() {
  const warnings = [];
  const directEffectWords = {
    damage: 'deal',
    block: 'block',
    markMonster: 'mark',
    bleedMonster: 'bleed',
    draw: 'draw',
    survival: 'survival',
    addPanic: 'panic',
    removeMonsterBlock: 'block',
    removeAllMonsterBlock: 'block'
  };

  equipmentList.forEach(item => {
    item.cardPackage.forEach(cardId => {
      const card = cards[cardId];
      if (!card) return;
      const description = card.description.toLowerCase();
      card.effects.forEach(effect => {
        const expectedWord = directEffectWords[effect.type];
        if (expectedWord && !description.includes(expectedWord)) {
          warnings.push(`${item.id}/${cardId}: description omits ${effect.type}`);
        }
      });
    });
  });

  warnings.push(...validateGearVariety());
  [...new Set(warnings)].forEach(message => console.warn(`[Gear style] ${message}`));
  return [...new Set(warnings)];
}

const validation = validateEquipmentCardPackages();
if (validation.missingCardIds.length || validation.equipmentWithNoCardPackage.length) {
  console.warn('Equipment card package validation failed.', validation);
}
