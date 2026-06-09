export const memoryInnovations = {
  oralTradition: {
    id: 'oralTradition',
    name: 'Oral Tradition',
    category: 'culture',
    costMemory: 2,
    description: 'Victors return to a settlement prepared to interpret more of what they learned.',
    unlockRequirement: { type: 'always' },
    unlockText: 'Visible from settlement creation.',
    limit: 'Permanent once built.',
    effect: 'Survivor victory progress offers one additional reward option when possible.',
    actionUnlocks: []
  },
  riteOfForgetting: {
    id: 'riteOfForgetting',
    name: 'Rite of Forgetting',
    category: 'ritual',
    costMemory: 3,
    description: 'A survivor names a lesson and lets the lantern smoke carry it away.',
    unlockRequirement: { type: 'personalCardOrPanic' },
    unlockText: 'Requires a survivor with a personal card or Panic.',
    limit: 'Forget once per survivor per Lantern Year.',
    effect: 'Unlocks Forget Card. Each use costs 1 Memory.',
    actionUnlocks: ['forgetCard']
  },
  sharedWarnings: {
    id: 'sharedWarnings',
    name: 'Shared Warnings',
    category: 'survival',
    costMemory: 2,
    description: 'The names of the dead become instructions for those newly named.',
    unlockRequirement: { type: 'deadSurvivors', count: 1 },
    unlockText: 'Requires the first survivor death.',
    limit: 'Permanent once built.',
    effect: 'New survivors start with +1 survival.',
    actionUnlocks: []
  },
  deathArchive: {
    id: 'deathArchive',
    name: 'Death Archive',
    category: 'legacy',
    costMemory: 4,
    description: 'Every grave is indexed by wound, quarry, equipment, and final lesson.',
    unlockRequirement: {
      type: 'any',
      requirements: [
        { type: 'deadSurvivors', count: 3 },
        { type: 'anyQuarryLevel', level: 2 }
      ]
    },
    unlockText: 'Requires 3 dead survivors or defeat any Level 2 quarry.',
    limit: 'Permanent once built.',
    effect: 'Grave legacy presents one additional choice and grave records remain detailed.',
    actionUnlocks: []
  },
  trialNames: {
    id: 'trialNames',
    name: 'Trial Names',
    category: 'identity',
    costMemory: 2,
    description: 'A new name carries a declared way of facing the darkness.',
    unlockRequirement: { type: 'population', count: 8 },
    unlockText: 'Requires population 8 or higher.',
    limit: 'One starting trait per new survivor.',
    effect: 'New survivors may choose Steady, Bold, or Watchful.',
    actionUnlocks: []
  },
  painLessons: {
    id: 'painLessons',
    name: 'Pain Lessons',
    category: 'training',
    costMemory: 3,
    description: 'A wound is studied until it becomes part of a survivor instead of an interruption.',
    unlockRequirement: { type: 'anyInjury' },
    unlockText: 'Requires any survivor to gain an injury.',
    limit: 'Once per Lantern Year across the settlement.',
    effect: 'Convert one injury into a scar.',
    actionUnlocks: ['painLessons']
  },
  monsterStories: {
    id: 'monsterStories',
    name: 'Monster Stories',
    category: 'knowledge',
    costMemory: 3,
    description: 'Quarry tales are compared until recurring weaknesses emerge.',
    unlockRequirement: { type: 'differentQuarries', count: 2 },
    unlockText: 'Requires victories against two different quarry types.',
    limit: 'Permanent once built.',
    effect: 'Monster Bane is more likely to appear after boss victories.',
    actionUnlocks: []
  },
  quietNight: {
    id: 'quietNight',
    name: 'Quiet Night',
    category: 'recovery',
    costMemory: 2,
    description: 'The settlement keeps one night free of work, ritual, and retelling.',
    unlockRequirement: { type: 'disorderOrPanic' },
    unlockText: 'Requires a disorder or Panic in a personal deck.',
    limit: 'Once per Lantern Year across the settlement.',
    effect: 'Remove one Panic from a survivor for 1 Memory.',
    actionUnlocks: ['quietNight']
  },
  weaponDrills: {
    id: 'weaponDrills',
    name: 'Weapon Drills',
    category: 'training',
    costMemory: 4,
    description: 'Repeated forms turn basic movements into dependable personal techniques.',
    unlockRequirement: { type: 'craftedGear', count: 3 },
    unlockText: 'Requires any 3 crafted gear pieces.',
    limit: 'Once per Lantern Year across the settlement.',
    effect: 'Add one basic training card to a survivor for 1 Memory.',
    actionUnlocks: ['weaponDrills']
  },
  taboo: {
    id: 'taboo',
    name: 'Taboo',
    category: 'law',
    costMemory: 5,
    description: 'The settlement forbids one poisonous story from being spoken again.',
    unlockRequirement: { type: 'lanternYear', count: 5 },
    unlockText: 'Requires Lantern Year 5.',
    limit: 'Once per Lantern Year across the settlement.',
    effect: 'Permanently remove one curse or Panic personal card for 2 Memory.',
    actionUnlocks: ['taboo']
  },
  shrineOfNames: {
    id: 'shrineOfNames',
    name: 'Shrine of Names',
    category: 'legacy',
    costMemory: 4,
    description: 'The living carry a little more strength beneath the recorded names of the dead.',
    unlockRequirement: { type: 'graveHistory', count: 5 },
    unlockText: 'Requires at least 5 grave records.',
    limit: 'Once per Lantern Year across the settlement.',
    effect: 'Give one living survivor +1 max HP for 2 Memory.',
    actionUnlocks: ['shrineOfNames']
  },
  huntSongs: {
    id: 'huntSongs',
    name: 'Hunt Songs',
    category: 'culture',
    costMemory: 3,
    description: 'Old victories are sung in the rhythm of the next departure.',
    unlockRequirement: { type: 'anyQuarryLevel', level: 2 },
    unlockText: 'Requires any Level 2 quarry victory.',
    limit: 'Permanent once built.',
    effect: 'Start hunts against previously defeated quarries with +1 survival.',
    actionUnlocks: []
  }
};

export const memoryInnovationList = Object.values(memoryInnovations);

export const startingTraits = {
  steady: {
    id: 'steady',
    name: 'Steady',
    effect: 'Start the first combat of each hunt with +1 block.'
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    effect: 'The first attack of each hunt deals +1 damage.'
  },
  watchful: {
    id: 'watchful',
    name: 'Watchful',
    effect: 'The first event choice each hunt shows a warning note.'
  }
};
