const card = (
  id, name, category, description, effects, options = {}
) => ({
  id,
  name,
  category,
  description,
  costType: options.costType || 'innovationAttempt',
  buildCost: options.buildCost || { settlementMemory: 1, basicResources: 3 },
  unlockRequirement: options.unlockRequirement || { type: 'pool' },
  addsToInnovationPool: options.addsToInnovationPool || [],
  unlocksRecipes: options.unlocksRecipes || [],
  unlocksBuildings: options.unlocksBuildings || [],
  effects,
  tags: options.tags || [],
  implemented: options.implemented !== false
});

export const BASE_INNOVATION_POOL_IDS = [
  'language',
  'symposium',
  'ammonia',
  'cooking',
  'bloodletting',
  'graves',
  'oralTradition',
  'sharedWarnings'
];

export const innovationCards = {
  language: card(
    'language', 'Language', 'culture',
    'Survivors learn to preserve meaning, warning and names.',
    ['Settlement history becomes clearer.', 'Adds Symposium and Oral Tradition to the innovation pool.'],
    { addsToInnovationPool: ['symposium', 'oralTradition'], tags: ['history', 'culture'] }
  ),
  symposium: card(
    'symposium', 'Symposium', 'education',
    'The settlement learns by argument, story and shared panic.',
    ['Boss victory progress offers one additional reward option when possible.'],
    { addsToInnovationPool: ['weaponDrills', 'trialNames'], tags: ['education'] }
  ),
  ammonia: card(
    'ammonia', 'Ammonia', 'treatment',
    'The settlement discovers a harsh cleansing substance.',
    ['Reveals First Aid Tent and treatment innovations.'],
    { addsToInnovationPool: ['painLessons'], unlocksBuildings: ['firstAidTent'], tags: ['treatment'] }
  ),
  cooking: card(
    'cooking', 'Cooking', 'food',
    'Survivors discover that food can be changed before it changes them.',
    ['New survivors start with +1 max HP.', 'Adds communal food knowledge to the pool.'],
    { addsToInnovationPool: ['huntSongs'], tags: ['food', 'health'] }
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
  riteOfForgetting: card('riteOfForgetting', 'Rite of Forgetting', 'ritual', 'A lesson can be named and released into smoke.', ['Unlocks card forgetting.'], { tags: ['memory'] }),
  deathArchive: card('deathArchive', 'Death Archive', 'legacy', 'Every grave is indexed by wound and final lesson.', ['Expands grave legacy choices.'], { tags: ['legacy'] }),
  trialNames: card('trialNames', 'Trial Names', 'identity', 'A new name declares a way of facing darkness.', ['New survivors may choose a starting trait.'], { tags: ['identity'] }),
  painLessons: card('painLessons', 'Pain Lessons', 'training', 'Wounds are studied until they become instruction.', ['Unlocks injury-to-scar treatment.'], { tags: ['treatment'] }),
  monsterStories: card('monsterStories', 'Monster Stories', 'knowledge', 'Quarry tales reveal recurring weaknesses.', ['Monster Bane is more likely after victory.'], { tags: ['bane'] }),
  quietNight: card('quietNight', 'Quiet Night', 'recovery', 'One night is kept free of work and retelling.', ['Remove one Panic per Lantern Year.'], { tags: ['recovery'] }),
  weaponDrills: card('weaponDrills', 'Weapon Drills', 'training', 'Repeated forms become dependable techniques.', ['Add training cards to survivors.'], { tags: ['training'] }),
  taboo: card('taboo', 'Taboo', 'law', 'One poisonous story is forbidden.', ['Remove one curse per Lantern Year.'], { tags: ['law'] }),
  shrineOfNames: card('shrineOfNames', 'Shrine of Names', 'legacy', 'The living carry strength beneath recorded names.', ['Grant a survivor +1 max HP.'], { tags: ['legacy'] }),
  huntSongs: card('huntSongs', 'Hunt Songs', 'culture', 'Victories are sung into the rhythm of departure.', ['Gain +1 starting survival against known quarries.'], { tags: ['culture'] }),

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
  timeKeeping: card('timeKeeping', 'Time Keeping', 'knowledge', 'The settlement marks years the Phoenix tried to steal.', ['Timeline records show clearer milestones.']),
  stormShrine: card('stormShrine', 'Storm Shrine', 'quarry craft', 'Lightning is invited into a controlled place.', ['Unlocks Storm Shrine rumour.'], { unlocksBuildings: ['stormShrine'] }),
  thunderWorkshop: card('thunderWorkshop', 'Thunder Workshop', 'quarry craft', 'Dense organs power violent tools.', ['Unlocks Thunder Workshop rumour.'], { unlocksBuildings: ['thunderWorkshop'] }),
  silkLoom: card('silkLoom', 'Silk Loom', 'quarry craft', 'Chitin thread becomes settlement cloth.', ['Unlocks Silk Loom rumour.'], { unlocksBuildings: ['silkLoom'] }),
  venomLab: card('venomLab', 'Venom Lab', 'quarry craft', 'Venom becomes a measured tool.', ['Unlocks Venom Lab rumour.'], { unlocksBuildings: ['venomLab'] }),
  duelistGarden: card('duelistGarden', 'Duelist Garden', 'quarry craft', 'Living thorns teach measured violence.', ['Unlocks Duelist Garden rumour.'], { unlocksBuildings: ['duelistGarden'] }),
  petalForge: card('petalForge', 'Petal Forge', 'quarry craft', 'Floral metal is shaped without losing life.', ['Unlocks Petal Forge rumour.'], { unlocksBuildings: ['petalForge'] }),
  chitinFoundry: card('chitinFoundry', 'Chitin Foundry', 'quarry craft', 'Shell and resin become layered armour.', ['Unlocks Chitin Foundry rumour.'], { unlocksBuildings: ['chitinFoundry'] }),
  armourDoctrine: card('armourDoctrine', 'Armour Doctrine', 'training', 'Guard becomes a settlement discipline.', ['Reveals armour training themes.']),
  crystalForge: card('crystalForge', 'Crystal Forge', 'quarry craft', 'Crystal bone holds an imperial edge.', ['Unlocks Crystal Forge rumour.'], { unlocksBuildings: ['crystalForge'] }),
  fireRite: card('fireRite', 'Fire Rite', 'ritual', 'Flame becomes a test rather than an accident.', ['Reveals fire survival themes.']),
  sunMirror: card('sunMirror', 'Sun Mirror', 'quarry craft', 'Radiance is reflected into useful shapes.', ['Unlocks Sun Mirror rumour.'], { unlocksBuildings: ['sunMirror'] }),
  shellSanctum: card('shellSanctum', 'Shell Sanctum', 'quarry craft', 'Warm shell protects the settlement core.', ['Unlocks Shell Sanctum rumour.'], { unlocksBuildings: ['shellSanctum'] }),
  prideHall: card('prideHall', 'Pride Hall', 'quarry craft', 'Royal trophies become a warning against weakness.', ['Unlocks Pride Hall rumour.'], { unlocksBuildings: ['prideHall'] }),
  judgementRite: card('judgementRite', 'Judgement Rite', 'ritual', 'Survivors name weakness before it can name them.', ['Reveals Pride King countermeasures.'])
};

export const innovationCardList = Object.values(innovationCards);

export const QUARRY_INNOVATION_POOL = {
  paleHuntLion: ['boneSmith', 'skinnery', 'lionTrophyHall', 'clawLore'],
  wailingAntelope: ['organGrinder', 'antelopeLarder', 'hornCraft', 'stomachLore'],
  ashPhoenix: ['phoenixPyre', 'monsterArchive', 'ashRitual', 'timeKeeping'],
  bloatedGodling: ['stormShrine', 'thunderWorkshop'],
  silkMatriarch: ['silkLoom', 'venomLab'],
  bloomKnight: ['duelistGarden', 'petalForge'],
  chitinCrusader: ['chitinFoundry', 'armourDoctrine'],
  drakeEmperor: ['crystalForge', 'fireRite'],
  sunSovereign: ['sunMirror', 'shellSanctum'],
  prideKing: ['prideHall', 'judgementRite']
};

export function getDrawableInnovationIds(state) {
  const built = new Set(state?.builtInnovationIds || []);
  return (state?.availableInnovationPoolIds || [])
    .filter(id => innovationCards[id]?.implemented && !built.has(id));
}
