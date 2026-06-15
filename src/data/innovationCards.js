const destinationFor = (category, options) => {
  if (options.uiDestination) return options.uiDestination;
  if (options.unlocksBuildings?.length || category.includes('craft')) return 'Settlement > Armoury';
  if (category === 'training') return 'Settlement > Survivors > Survivor details';
  if (category === 'recovery' || category === 'treatment') return 'Settlement > Survivors';
  if (category === 'identity' || category === 'food') return 'Settlement > Population';
  if (category === 'survival' || category === 'utility') return 'Settlement > Hunt preparation';
  if (category === 'legacy') return 'Settlement > Graveyard';
  return 'Settlement > Innovations';
};

const card = (
  id, name, category, description, effects, options = {}
) => {
  const safeEffects = Array.isArray(effects) ? effects : [effects].filter(Boolean);
  const unlocksBuildings = options.unlocksBuildings || [];
  const unlocksRecipes = options.unlocksRecipes || [];
  const uiDestination = destinationFor(category, options);
  return {
    id,
    name,
    tier: options.tier || (category.includes('quarry') || category.includes('strange') ? 2 : 1),
    category,
    description,
    prerequisites: options.prerequisites || options.unlockRequirement || { type: 'pool' },
    deckWeight: Number.isFinite(options.deckWeight) ? options.deckWeight : 1,
    costType: options.costType || 'innovationAttempt',
    buildCost: options.buildCost || { settlementMemory: 1, basicResources: 3 },
    memoryCost: Number.isFinite(options.memoryCost) ? options.memoryCost : 1,
    unlockRequirement: options.unlockRequirement || { type: 'pool' },
    addsToInnovationPool: options.addsToInnovationPool || [],
    unlocksRecipes,
    unlocksBuildings,
    unlocks: options.unlocks || [...unlocksBuildings, ...unlocksRecipes],
    settlementBoostSummary: options.settlementBoostSummary || safeEffects[0] || description,
    mechanicalEffects: options.mechanicalEffects || {},
    tutorialTitle: options.tutorialTitle || `Using ${name}`,
    tutorialSteps: options.tutorialSteps || [
      `Open ${uiDestination}.`,
      `Look for the ${name} effect or unlocked action.`,
      `Review its limits before spending resources or Memory: ${safeEffects[0] || 'the settlement has changed.'}`
    ],
    uiDestination,
    effects: safeEffects,
    tags: options.tags || [],
    implemented: options.implemented !== false
  };
};

export const BASE_INNOVATION_POOL_IDS = [
  'language',
  'symposium',
  'ammonia',
  'cooking',
  'bloodletting',
  'graves',
  'oralTradition',
  'sharedWarnings',
  'trailSignals',
  'scoutTower',
  'storytellerCircle',
  'armoryRack'
];

export const innovationCards = {
  language: card(
    'language', 'Language', 'culture',
    'Survivors learn to preserve meaning, warning and names.',
    ['Settlement history becomes clearer.', 'Adds Symposium and Oral Tradition to the innovation pool.', '+5% Intimacy success chance.'],
    { 
      addsToInnovationPool: ['symposium', 'oralTradition'], 
      tags: ['history', 'culture'],
      mechanicalEffects: { intimacySuccessBonus: 0.05 }
    }
  ),
  symposium: card(
    'symposium', 'Symposium', 'education',
    'The settlement learns by argument, story and shared panic.',
    ['Boss victory progress offers one additional reward option when possible.', 'Unlocks deeper training techniques.'],
    { 
      addsToInnovationPool: ['weaponDrills', 'trialNames'], 
      tags: ['education'],
      mechanicalEffects: { trainingOptionsBonus: 1 }
    }
  ),
  ammonia: card(
    'ammonia', 'Ammonia', 'treatment',
    'The settlement discovers a harsh cleansing substance.',
    ['Reveals First Aid Tent and treatment innovations.', '-10% Intimacy tragedy risk.'],
    { 
      addsToInnovationPool: ['painLessons'], 
      unlocksBuildings: ['firstAidTent'], 
      tags: ['treatment'],
      mechanicalEffects: { intimacyTragedyReduction: 0.1 }
    }
  ),
  cooking: card(
    'cooking', 'Cooking', 'food',
    'Survivors discover that food can be changed before it changes them.',
    ['New survivors start with +1 max HP.', 'Adds communal food knowledge to the pool.', '+10% Intimacy success chance.'],
    { 
      addsToInnovationPool: ['huntSongs'], 
      tags: ['food', 'health'],
      mechanicalEffects: { startingMaxHpBonus: 1, intimacySuccessBonus: 0.1 }
    }
  ),
  scoutTower: card(
    'scoutTower', 'Scout Tower', 'utility',
    'Scouts mark the character of each route before departure.',
    ['Hunt map node types are identified.'],
    { unlocksBuildings: ['scoutTower'], tags: ['utility', 'map'] }
  ),
  storytellerCircle: card(
    'storytellerCircle', 'Storyteller Circle', 'legacy',
    'The settlement turns victories and deaths into useful instruction.',
    ['Survivor progress offers four choices after victories.'],
    { unlocksBuildings: ['storytellerCircle'], tags: ['legacy', 'instruction'] }
  ),
  armoryRack: card(
    'armoryRack', 'Armory Rack', 'utility',
    'Organizes equipment so hunters can carry one additional piece.',
    ['Increases the gear equip limit from 4 to 5.'],
    { unlocksBuildings: ['armoryRack'], tags: ['utility', 'gear'] }
  ),
  bloodletting: card(
    'bloodletting', 'Bloodletting', 'treatment',
    'Pain becomes a tool.',
    ['Unlocks Pain Lessons and Quiet Night treatment actions.'],
    { addsToInnovationPool: ['painLessons', 'quietNight'], tags: ['treatment', 'pain'] }
  ),
  graves: card(
    'graves', 'Graves', 'legacy',
    'The settlement gives the dead a place to remain.',
    ['Grave legacy grants +1 Memory.', 'Adds Death Archive and Shrine of Names to the pool.'],
    { addsToInnovationPool: ['deathArchive', 'shrineOfNames'], tags: ['death', 'legacy'] }
  ),
  oralTradition: card(
    'oralTradition', 'Oral Tradition', 'culture',
    'Old stories become survival instructions.',
    ['New survivors start with +1 survival.', 'Monster Bane appears more often after victories.'],
    { tags: ['culture', 'survival'] }
  ),
  sharedWarnings: card(
    'sharedWarnings', 'Shared Warnings', 'survival',
    'Children are taught what the adults survived.',
    ['New survivors start with +1 survival.', 'Adds Monster Stories to the pool.'],
    { addsToInnovationPool: ['monsterStories'], tags: ['survival', 'bane'] }
  ),
  trailSignals: card(
    'trailSignals', 'Trail Signals', 'survival',
    'The settlement learns how to send more than one survivor into the dark without losing them immediately.',
    ['Maximum hunt party size becomes at least 2.', 'Adds Shared Burden to the innovation pool.'],
    { addsToInnovationPool: ['sharedBurden'], tags: ['party', 'survival'] }
  ),
  sharedBurden: card(
    'sharedBurden', 'Shared Burden', 'survival',
    'Survivors learn how to carry wounds, gear, fear and food between them.',
    ['Maximum hunt party size becomes at least 3.', 'Adds Lantern Procession to the innovation pool.'],
    {
      addsToInnovationPool: ['lanternProcession'],
      unlockRequirement: { type: 'partyProgress', innovationId: 'trailSignals', lanternYear: 3, quarryLevel: 2 },
      tags: ['party', 'survival']
    }
  ),
  lanternProcession: card(
    'lanternProcession', 'Lantern Procession', 'culture',
    'Four lanterns moving together look almost like courage.',
    ['Maximum hunt party size becomes 4.'],
    {
      unlockRequirement: { type: 'partyProgress', innovationId: 'sharedBurden', lanternYear: 6, quarryLevel: 3 },
      tags: ['party', 'culture']
    }
  ),
  riteOfForgetting: card('riteOfForgetting', 'Rite of Forgetting', 'ritual', 'A lesson can be named and released into smoke.', ['Preserves Guided Reflection: forget one eligible personal or basic card per survivor each year for 1 Memory.'], {
    tags: ['memory'],
    unlocks: ['forgetCard'],
    uiDestination: 'Settlement > Survivors > Survivor details > Personal Deck',
    tutorialSteps: [
      'Open Settlement > Survivors and expand a survivor.',
      'Open Personal Cards and choose Forget beside an eligible personal or basic card.',
      'Monster Bane, permanent cards, and gear cards cannot be forgotten. Each use costs 1 Memory.'
    ]
  }),
  deathArchive: card('deathArchive', 'Death Archive', 'legacy', 'Every grave is indexed by wound and final lesson.', ['Expands grave legacy choices.'], { tags: ['legacy'] }),
  trialNames: card('trialNames', 'Trial Names', 'identity', 'A new name declares a way of facing darkness.', ['New survivors may choose a starting trait; children born through intimacy also receive a starting trait and fighting art.'], {
    tags: ['identity'],
    unlocks: ['newbornTraitChoice'],
    uiDestination: 'Settlement > Population',
    tutorialSteps: [
      'Open Settlement > Population.',
      'When creating a survivor, choose an available starting trait.',
      'Children born through intimacy automatically receive one starting trait and one general fighting art.'
    ]
  }),
  painLessons: card('painLessons', 'Pain Lessons', 'training', 'Wounds are studied until they become instruction.', ['Unlocks injury-to-scar treatment.'], { tags: ['treatment'] }),
  monsterStories: card('monsterStories', 'Monster Stories', 'knowledge', 'Quarry tales reveal recurring weaknesses.', ['Monster Bane is more likely after victory.'], { tags: ['bane'] }),
  quietNight: card('quietNight', 'Quiet Night', 'recovery', 'One night is kept free of work and retelling.', ['Remove one Panic per Lantern Year and double healing from Memory-based rest.'], {
    tags: ['recovery'],
    unlocks: ['quietNight'],
    mechanicalEffects: { restHealingMultiplier: 2 },
    tutorialSteps: [
      'Open Settlement > Survivors and expand a survivor carrying Panic.',
      'Choose Quiet Night beside the Panic card.',
      'The settlement spends 1 Memory and can remove Panic once each Lantern Year. Rest healing is doubled automatically.'
    ]
  }),
  weaponDrills: card('weaponDrills', 'Weapon Drills', 'training', 'Repeated forms become dependable techniques.', ['Add one basic training card to a survivor each Lantern Year for 1 Memory.'], {
    tags: ['training'],
    unlocks: ['weaponDrills'],
    tutorialSteps: [
      'Open Settlement > Survivors and expand the survivor to train.',
      'Choose one card under Weapon Drills.',
      'Training costs 1 Memory and the settlement may perform it once each Lantern Year.'
    ]
  }),
  taboo: card('taboo', 'Taboo', 'law', 'One poisonous story is forbidden.', ['Remove one curse per Lantern Year.'], { tags: ['law'] }),
  shrineOfNames: card('shrineOfNames', 'Shrine of Names', 'legacy', 'The living carry strength beneath recorded names.', ['Grant a survivor +1 max HP.'], { tags: ['legacy'] }),
  huntSongs: card('huntSongs', 'Hunt Songs', 'culture', 'Victories are sung into the rhythm of departure.', ['Gain +1 starting survival against known quarries.'], {
    tags: ['culture'],
    uiDestination: 'Hunt > Party preparation'
  }),
  blackLanternRite: card('blackLanternRite', 'Black Lantern Rite', 'ritual', 'A lightless flame is used to study fear without dispelling it.', ['Timeline choices may follow the black lantern path.', 'Campaign pressure can rise around strange knowledge.'], { tags: ['timeline', 'strange', 'ritual'] }),
  graveOfferings: card('graveOfferings', 'Grave Offerings', 'legacy', 'Useful tools are surrendered so their lessons remain with the living.', ['Grave history carries stronger survivor lessons.'], { tags: ['timeline', 'death', 'legacy'] }),
  wrongArchitecture: card('wrongArchitecture', 'Wrong Architecture', 'strange craft', 'Rooms are built to fit shapes that have not arrived.', ['Strange timeline events become more likely.'], { tags: ['timeline', 'strange', 'building'] }),
  buriedMap: card('buriedMap', 'Buried Map', 'forbidden knowledge', 'A route is copied from marks found beneath the settlement.', ['Late campaign paths can be revealed without naming the threat behind them.'], { tags: ['timeline', 'strange', 'knowledge'] }),

  boneSmith: card('boneSmith', 'Bone Smith', 'quarry craft', 'Bone becomes a dependable weapon material.', ['Unlocks Bone Smith building and recipes.'], { unlocksBuildings: ['boneSmith'] }),
  skinnery: card('skinnery', 'Skinnery', 'quarry craft', 'Monster hide becomes durable protection.', ['Unlocks Skinnery building and recipes.'], { unlocksBuildings: ['skinnery'] }),
  lionTrophyHall: card('lionTrophyHall', 'Lion Trophy Hall', 'quarry craft', 'Lion victories are shaped into advanced gear.', ['Unlocks Lion Trophy Hall.'], { unlocksBuildings: ['lionTrophyHall'] }),
  clawLore: card('clawLore', 'Claw Lore', 'quarry lore', 'Claw wounds teach fast and brutal forms.', ['Adds Claw Style to future training themes.']),
  organGrinder: card('organGrinder', 'Organ Grinder', 'quarry craft', 'Organs become oils, food and charms.', ['Unlocks Organ Grinder.'], { unlocksBuildings: ['organGrinder'] }),
  antelopeLarder: card('antelopeLarder', 'Antelope Larder', 'quarry craft', 'Running meat and stomach stones are preserved.', ['Unlocks Antelope Larder.'], { unlocksBuildings: ['antelopeLarder'] }),
  hornCraft: card('hornCraft', 'Horn Craft', 'quarry craft', 'Resonant horn becomes a precise material.', ['Reveals horn recipe themes.']),
  stomachLore: card('stomachLore', 'Stomach Lore', 'quarry lore', 'The settlement studies what survives digestion.', ['Improves Antelope resource knowledge.']),
  phoenixPyre: card('phoenixPyre', 'Phoenix Pyre', 'quarry craft', 'A controlled fire shapes time-touched remains.', ['Unlocks Phoenix Pyre.'], { unlocksBuildings: ['phoenixPyre'] }),
  monsterArchive: card('monsterArchive', 'Monster Archive', 'knowledge', 'Quarry weaknesses are carved into durable records.', ['Monster Bane deals +1 damage.'], { unlocksBuildings: ['monsterArchive'] }),
  ashRitual: card('ashRitual', 'Ash Ritual', 'ritual', 'Ash is used to separate useful memory from fear.', ['Reveals Panic-control themes.']),
  timeKeeping: card('timeKeeping', 'Time Keeping', 'knowledge', 'The settlement marks years the Phoenix tried to steal.', ['Each survivor ignores their next hunt-age increase once.'], {
    mechanicalEffects: { ageingGraceUses: 1 },
    unlocks: ['ageingGrace'],
    uiDestination: 'Settlement > Survivors',
    tutorialSteps: [
      'Open Settlement > Survivors to review completed hunts.',
      'Each survivor ignores their next hunt-age increase once.',
      'The protection is automatic and recorded when consumed.'
    ]
  }),
  stormShrine: card('stormShrine', 'Storm Shrine', 'quarry craft', 'Lightning is invited into a controlled place.', ['Unlocks Storm Shrine rumour.'], { unlocksBuildings: ['stormShrine'] }),
  thunderWorkshop: card('thunderWorkshop', 'Thunder Workshop', 'quarry craft', 'Dense organs power violent tools.', ['Unlocks Thunder Workshop rumour.'], { unlocksBuildings: ['thunderWorkshop'] }),
  redTannery: card('redTannery', 'Red Tannery', 'quarry craft', 'River scales and dense red leather are cured without losing their strength.', ['Unlocks Red Tannery crafting and Crimson Crocodile gear.'], { unlocksBuildings: ['redTannery'] }),
  wetYard: card('wetYard', 'Wet Yard', 'quarry craft', 'A contained yard makes elastic hides and volatile glands usable.', ['Unlocks Wet Yard crafting and Frogdog gear.'], { unlocksBuildings: ['wetYard'] }),
  silkLoom: card('silkLoom', 'Silk Loom', 'quarry craft', 'Chitin thread becomes settlement cloth.', ['Unlocks Silk Loom rumour.'], { unlocksBuildings: ['silkLoom'] }),
  venomLab: card('venomLab', 'Venom Lab', 'quarry craft', 'Venom becomes a measured tool.', ['Unlocks Venom Lab rumour.'], { unlocksBuildings: ['venomLab'] }),
  duelistGarden: card('duelistGarden', 'Duelist Garden', 'quarry craft', 'Living thorns teach measured violence.', ['Unlocks Duelist Garden rumour.'], { unlocksBuildings: ['duelistGarden'] }),
  petalForge: card('petalForge', 'Petal Forge', 'quarry craft', 'Floral metal is shaped without losing life.', ['Unlocks Petal Forge rumour.'], { unlocksBuildings: ['petalForge'] }),
  smogKiln: card('smogKiln', 'Smog Kiln', 'quarry craft', 'Soot, tar, and resonant bone are fired into dependable tools.', ['Unlocks Smog Kiln crafting and Smog Singer gear.'], { unlocksBuildings: ['smogKiln'] }),
  chitinFoundry: card('chitinFoundry', 'Chitin Foundry', 'quarry craft', 'Shell and resin become layered armour.', ['Unlocks Chitin Foundry rumour.'], { unlocksBuildings: ['chitinFoundry'] }),
  armourDoctrine: card('armourDoctrine', 'Armour Doctrine', 'training', 'Guard becomes a settlement discipline.', ['Reveals armour training themes.']),
  crystalForge: card('crystalForge', 'Crystal Forge', 'quarry craft', 'Crystal bone holds an imperial edge.', ['Unlocks Crystal Forge rumour.'], { unlocksBuildings: ['crystalForge'] }),
  fireRite: card('fireRite', 'Fire Rite', 'ritual', 'Flame becomes a test rather than an accident.', ['Reveals fire survival themes.']),
  sunMirror: card('sunMirror', 'Sun Mirror', 'quarry craft', 'Radiance is reflected into useful shapes.', ['Unlocks Sun Mirror rumour.'], { unlocksBuildings: ['sunMirror'] }),
  shellSanctum: card('shellSanctum', 'Shell Sanctum', 'quarry craft', 'Warm shell protects the settlement core.', ['Unlocks Shell Sanctum rumour.'], { unlocksBuildings: ['shellSanctum'] }),
  prideHall: card('prideHall', 'Pride Hall', 'quarry craft', 'Royal trophies become a warning against weakness.', ['Unlocks Pride Hall rumour.'], { unlocksBuildings: ['prideHall'] }),
  judgementRite: card('judgementRite', 'Judgement Rite', 'ritual', 'Survivors name weakness before it can name them.', ['Reveals Pride King countermeasures.'])
  ,
  riverRites: card('riverRites', 'River Rites', 'quarry lore', 'The settlement studies tracks left by remembered water.', ['Reveals river craft and drowning countermeasures.']),
  toxinLessons: card('toxinLessons', 'Toxin Lessons', 'quarry lore', 'Ridiculous glands become measured poisons.', ['Reveals toxin preparation themes.']),
  sootChorus: card('sootChorus', 'Soot Chorus', 'quarry lore', 'Breath and rhythm become a shared warning.', ['Reveals smoke and song craft.'])
  ,
  trophyRites: card('trophyRites', 'Trophy Rites', 'ritual', 'The settlement decides which trophies belong to the living.', ['Records victories over those who come to collect.'], { tags: ['nemesis', 'memory'] }),
  settlementLaw: card('settlementLaw', 'Settlement Law', 'law', 'Spoken rules give shape to punishments and protections.', ['The settlement remembers the verdict it survived.'], { tags: ['nemesis', 'law'] }),
  mirrorDoctrine: card('mirrorDoctrine', 'Mirror Doctrine', 'knowledge', 'Strength is studied together with the weakness it casts behind it.', ['Records the fall of the reflective tyrant.'], { tags: ['nemesis', 'knowledge'] })
};

export const innovationCardList = Object.values(innovationCards);

export const QUARRY_INNOVATION_POOL = {
  paleHuntLion: ['boneSmith', 'skinnery', 'lionTrophyHall', 'clawLore'],
  wailingAntelope: ['organGrinder', 'antelopeLarder', 'hornCraft', 'stomachLore'],
  ashPhoenix: ['phoenixPyre', 'monsterArchive', 'ashRitual', 'timeKeeping'],
  bloatedGodling: ['stormShrine', 'thunderWorkshop'],
  crimsonCrocodile: ['redTannery', 'riverRites'],
  frogdog: ['wetYard', 'toxinLessons'],
  silkMatriarch: ['silkLoom', 'venomLab'],
  bloomKnight: ['duelistGarden', 'petalForge'],
  smogSingers: ['smogKiln', 'sootChorus'],
  chitinCrusader: ['chitinFoundry', 'armourDoctrine'],
  drakeEmperor: ['crystalForge', 'fireRite'],
  sunSovereign: ['sunMirror', 'shellSanctum'],
  prideKing: ['prideHall', 'judgementRite']
};
