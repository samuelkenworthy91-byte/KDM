export const disorders = {
  nightTerrors: {
    id: 'nightTerrors',
    name: 'Night Terrors',
    description: 'Sleep carries warnings that feel exactly like teeth.',
    downside: 'Start each hunt with 1 Panic in the personal deck.',
    upside: 'After surviving a boss, this survivor helps earn settlement memory.',
    trigger: 'Hunt start and boss victory.',
    effect: 'Start each hunt with 1 Panic in the personal deck. Boss survival can produce a warning memory.',
    implemented: true
  },
  hoarder: {
    id: 'hoarder',
    name: 'Hoarder',
    description: 'Nothing useful may be surrendered willingly.',
    downside: 'Cannot choose optional event results that discard resources.',
    upside: 'After a successful hunt, may preserve one extra generic resource.',
    trigger: 'Resource choices and hunt rewards.',
    effect: 'Cannot willingly discard resources; has a chance to preserve an extra generic resource.',
    implemented: true
  },
  deathWish: {
    id: 'deathWish',
    name: 'Death Wish',
    description: 'Pain makes the next step feel obvious.',
    downside: 'Cannot choose Rest first when a risky event choice is available.',
    upside: 'While at or below 2 HP, attacks deal +2 damage.',
    trigger: 'Low HP attacks and event choices.',
    effect: 'At 2 HP or less, attacks deal +2; risky choices take priority over Rest.',
    implemented: true
  },
  paranoia: {
    id: 'paranoia',
    name: 'Paranoia',
    description: 'The survivor sees traps in every silence.',
    downside: 'When active at an event node, add 1 Panic to discard.',
    upside: 'The first vague monster tell each combat grants 3 block.',
    trigger: 'Event node start and first vague tell.',
    effect: 'Events add Panic, but the first vague monster tell each combat grants 3 block.',
    implemented: true
  },
  lanternFixation: {
    id: 'lanternFixation',
    name: 'Lantern Fixation',
    description: 'Radiance is studied long after looking away would be wiser.',
    downside: 'Timeline and nemesis events add 1 Panic to discard.',
    upside: 'Gain +1 survival against Ash Phoenix and radiant monsters.',
    trigger: 'Radiant combat and timeline events.',
    effect: 'Gain +1 survival in radiant fights; timeline danger adds Panic.',
    implemented: true
  },
  cowardice: {
    id: 'cowardice',
    name: 'Cowardice',
    description: 'The first motion is always away.',
    downside: 'The first attack each combat deals -1 damage.',
    upside: 'Dodge grants +2 additional block.',
    trigger: 'First attack and Dodge.',
    effect: 'First attack deals -1; Dodge grants +2 block.',
    implemented: true
  },
  recklessJoy: {
    id: 'recklessJoy',
    name: 'Reckless Joy',
    description: 'Danger is funniest just before impact.',
    downside: 'The first block card each combat grants 2 less block.',
    upside: 'The first attack each combat deals +2 damage.',
    trigger: 'First attack and first block card.',
    effect: 'First attack deals +2; first block card grants -2 block.',
    implemented: true
  },
  quietMadness: {
    id: 'quietMadness',
    name: 'Quiet Madness',
    description: 'Stillness and violence take turns speaking.',
    downside: 'Playing 3 or more attacks in a turn adds 1 Panic to discard.',
    upside: 'A turn with no attacks grants 1 survival.',
    trigger: 'End of survivor turn.',
    effect: 'No attacks grants survival; 3 or more attacks adds Panic.',
    implemented: true
  }
};

export const disorderList = Object.values(disorders);
