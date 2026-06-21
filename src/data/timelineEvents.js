const choice = (
  id, label, storyText, preview, effects, options = {}
) => ({
  id,
  label,
  storyText,
  preview,
  effects,
  requiresNomination: Boolean(options.requiresNomination),
  nominationCount: options.nominationCount || (options.requiresNomination ? 1 : 0)
});

const event = ({
  id,
  title,
  lanternYear,
  eventType,
  description,
  storyParagraphs,
  choices,
  impactLevel,
  historyText,
  requirements,
  repeatable = false,
  weight,
  cooldown
}) => ({
  id,
  title,
  lanternYear,
  eventType,
  description,
  storyParagraphs,
  choices,
  repeatable,
  impactLevel,
  historyText,
  ...(requirements ? { requirements } : {}),
  ...(weight ? { weight } : {}),
  ...(cooldown ? { cooldown } : {})
});

export const timelineEvents = [
  event({
    id: 'firstLanternOath',
    title: 'The First Lantern Oath',
    lanternYear: 1,
    eventType: 'major',
    description: 'The settlement must decide what its first shared promise protects.',
    storyParagraphs: [
      'The first repaired lantern is raised above the sleeping places.',
      'No one agrees whether its light belongs to the living, the hunters, or the memories that survived the dark.'
    ],
    impactLevel: 3,
    historyText: 'The settlement chose the purpose of its first shared light.',
    choices: [
      choice('guardLiving', 'Guard the living', 'The oath is spoken over every sleeping place.', 'Population is protected, but knowledge grows slowly.', [
        { type: 'setFutureEventFlag', flag: 'populationLossWard', value: 1 },
        { type: 'loseSettlementMemory', amount: 1 },
        { type: 'addHistory', text: 'The first oath guarded the living.' }
      ]),
      choice('teachHunters', 'Teach the hunters', 'Every departure becomes part of the oath.', 'Hunts gain support and Trail Signals enters the innovation pool.', [
        { type: 'addInnovationToPool', innovationId: 'trailSignals' },
        { type: 'addTemporaryHuntModifier', modifier: 'startingSurvival', amount: 1, uses: 1 },
        { type: 'addHistory', text: 'The first oath belonged to those who left the light.' }
      ]),
      choice('nameTheLost', 'Name what was lost', 'The oath becomes a list of absences.', 'Memory rises, but every living survivor carries Panic.', [
        { type: 'gainSettlementMemory', amount: 2 },
        { type: 'addPanicToAllSurvivorDecks', amount: 1 },
        { type: 'addHistory', text: 'The first oath named the missing.' }
      ])
    ]
  }),
  event({
    id: 'blackLanternArgument',
    title: 'The Black Lantern Argument',
    lanternYear: 3,
    eventType: 'major',
    description: 'A lantern burns black and divides the settlement before morning.',
    storyParagraphs: [
      'The flame gives no light, yet every face around it casts a shadow.',
      'Some call it a warning. Others call it the first gift the darkness has offered willingly.'
    ],
    impactLevel: 4,
    historyText: 'The settlement decided what the black lantern meant.',
    choices: [
      choice('hideLantern', 'Hide it beneath the bone pile', 'The argument ends under weight and silence.', 'Safer settlement, less memory.', [
        { type: 'setFutureEventFlag', flag: 'populationLossWard', value: 1 },
        { type: 'loseSettlementMemory', amount: 1 },
        { type: 'addHistory', text: 'The settlement chose safety over knowledge.' }
      ]),
      choice('giveLantern', 'Give it to a survivor', 'One pair of hands accepts the lightless flame.', 'Powerful survivor card, possible trauma.', [
        { type: 'addSurvivorCard', cardId: 'blackLanternFocus' },
        { type: 'addPanicToSurvivorDeck', amount: 1 },
        { type: 'gainSettlementMemory', amount: 1 },
        { type: 'addSurvivorTrait', traitId: 'blackLanternBearer' }
      ], { requiresNomination: true }),
      choice('buildRite', 'Build a ritual around it', 'The black flame becomes the center of a new practice.', 'Innovation path unlocked, future danger rises.', [
        { type: 'addInnovationToPool', innovationId: 'blackLanternRite' },
        { type: 'addCampaignPressure', amount: 1 },
        { type: 'gainSettlementMemory', amount: 2 },
        { type: 'setFutureEventFlag', flag: 'blackLanternRite', value: true }
      ])
    ]
  }),
  event({
    id: 'hunterWouldNotEat',
    title: 'The Hunter Who Would Not Eat',
    lanternYear: 7,
    eventType: 'minor',
    description: 'A hunter returns hungry and refuses every piece of cooked flesh.',
    storyParagraphs: ['They say the meat has begun whispering the names of future kills.'],
    impactLevel: 2,
    historyText: 'The settlement answered a hunter who refused food.',
    choices: [
      choice('forceMeal', 'Force them to eat', 'Hands hold the hunter still until the bowl is empty.', 'Healing now, Panic later.', [
        { type: 'healSurvivor', amount: 4 },
        { type: 'addPanicToSurvivorDeck', amount: 1 }
      ], { requiresNomination: true }),
      choice('hearHunger', 'Listen to their hunger', 'The settlement fasts beside them for one night.', 'A strange trait, but stored organs are lost.', [
        { type: 'addSurvivorTrait', traitId: 'fastingListener' },
        { type: 'loseResource', resourceId: 'organ', amount: 1 }
      ], { requiresNomination: true }),
      choice('huntHungry', 'Send them out hungry', 'Their empty stomach becomes a sharpened promise.', 'The next hunt begins stronger and afraid.', [
        { type: 'addTemporaryHuntModifier', modifier: 'firstCombatStrength', amount: 1, uses: 1 },
        { type: 'addPanicToSurvivorDeck', amount: 1 }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'firstFuneralSong',
    title: 'The First Funeral Song',
    lanternYear: 10,
    eventType: 'major',
    description: 'A melody forms around the names recorded in the grave history.',
    storyParagraphs: [
      'No survivor remembers beginning the song.',
      'By the final verse, the tools of the dead are laid in a row before the lantern hearth.'
    ],
    requirements: { minimumGraves: 1 },
    impactLevel: 4,
    historyText: 'The settlement chose how the dead would be carried forward.',
    choices: [
      choice('singNames', 'Sing the names', 'Every living voice carries one line.', 'Memory rises and Panic recedes.', [
        { type: 'gainSettlementMemory', amount: 2 },
        { type: 'removePanicFromAllSurvivorDecks', amount: 1 }
      ]),
      choice('buryTools', 'Bury the tools', 'Useful steel and bone vanish beneath the graves.', 'Lose armory gear, unlock grave knowledge.', [
        { type: 'destroyArmoryItem', amount: 1 },
        { type: 'addInnovationToPool', innovationId: 'graveOfferings' },
        { type: 'addSurvivorTrait', traitId: 'graveListener' }
      ], { requiresNomination: true }),
      choice('refuseMourning', 'Refuse mourning', 'The tools are stripped and returned to work.', 'Gain resources, burden one survivor.', [
        { type: 'gainResource', resourceId: 'bone', amount: 1 },
        { type: 'gainResource', resourceId: 'scrap', amount: 1 },
        { type: 'addSurvivorDisorder', disorderId: 'quietMadness' }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'boneRain',
    title: 'The Bone Rain',
    lanternYear: 11,
    eventType: 'minor',
    description: 'Small white fragments fall from a cloudless dark.',
    storyParagraphs: ['They are warm when gathered and cold when named as bone.'],
    impactLevel: 2,
    historyText: 'The settlement endured the bone rain.',
    choices: [
      choice('gatherRain', 'Gather it', 'Baskets fill before the rain stops.', 'Gain bone, increase future strange events.', [
        { type: 'gainResource', resourceId: 'bone', amount: 2 },
        { type: 'setFutureEventFlag', flag: 'gatheredBoneRain', value: true },
        { type: 'addCampaignPressure', amount: 1 }
      ]),
      choice('burnRain', 'Burn it', 'The fragments crack like tiny teeth.', 'Spend hide, gain memory.', [
        { type: 'loseResource', resourceId: 'hide', amount: 1 },
        { type: 'gainSettlementMemory', amount: 1 }
      ])
    ]
  }),
  event({
    id: 'childrenOfAsh',
    title: 'Children of the Ash',
    lanternYear: 14,
    eventType: 'major',
    description: 'The youngest survivors ask what they should learn before they are old enough to hunt.',
    storyParagraphs: ['Three teachers answer at once, and each offers a different future.'],
    requirements: { minimumPopulation: 4 },
    impactLevel: 4,
    historyText: 'The settlement chose what its children would learn first.',
    choices: [
      choice('teachHide', 'Teach them to hide', 'Ash marks become maps of safe ground.', 'Safer next hunt and Trail Signals knowledge.', [
        { type: 'addTemporaryHuntModifier', modifier: 'startingSurvival', amount: 1, uses: 1 },
        { type: 'addInnovationToPool', innovationId: 'trailSignals' }
      ]),
      choice('teachWatch', 'Teach them to watch', 'One young survivor learns to hear motion inside silence.', 'A survivor gains a trait and personal card.', [
        { type: 'addSurvivorTrait', traitId: 'quietListener' },
        { type: 'addSurvivorCard', cardId: 'watchTheDark' }
      ], { requiresNomination: true }),
      choice('teachCut', 'Teach them to cut', 'Practice begins on hanging strips of old hide.', 'Weapon experience at the cost of Panic.', [
        { type: 'gainWeaponXp', weaponType: 'sword', amount: 1 },
        { type: 'addPanicToSurvivorDeck', amount: 1 }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'brokenWorkshop',
    title: 'The Broken Workshop',
    lanternYear: 18,
    eventType: 'major',
    description: 'A settlement location collapses after a night of patient tremors.',
    storyParagraphs: ['The foundation stones are found standing upright beneath the wreckage.'],
    requirements: { minimumBuildings: 2 },
    impactLevel: 4,
    historyText: 'The settlement rebuilt, abandoned, or changed a fallen workshop.',
    choices: [
      choice('rebuildBone', 'Rebuild with bone', 'The walls return heavier and less willing to move.', 'Spend bone, preserve buildings, gain memory.', [
        { type: 'loseResource', resourceId: 'bone', amount: 2 },
        { type: 'repairBuilding' },
        { type: 'gainSettlementMemory', amount: 1 }
      ]),
      choice('salvageWorkshop', 'Let it fall', 'Every useful piece is pulled from the wreckage.', 'A building is disabled for a year, resources are recovered.', [
        { type: 'damageBuilding', duration: 1 },
        { type: 'gainResource', resourceId: 'scrap', amount: 2 }
      ]),
      choice('wrongArchitecture', 'Build it wrong on purpose', 'Doors face walls and supports lean toward empty rooms.', 'Strange innovation, stranger future.', [
        { type: 'addInnovationToPool', innovationId: 'wrongArchitecture' },
        { type: 'addCampaignPressure', amount: 1 },
        { type: 'addSurvivorDisorder', disorderId: 'paranoia' },
        { type: 'setFutureEventFlag', flag: 'wrongArchitecture', value: true }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'dreamsBackwards',
    title: 'The Survivor Who Dreams Backwards',
    lanternYear: 17,
    eventType: 'minor',
    description: 'A survivor wakes remembering tomorrow and forgets part of yesterday.',
    storyParagraphs: ['Their warning is precise, except for the order of every word.'],
    impactLevel: 2,
    historyText: 'The settlement decided how to use a backwards dream.',
    choices: [
      choice('recordDream', 'Record every word', 'The warning is copied without correction.', 'Gain memory and a future event flag, add Panic.', [
        { type: 'gainSettlementMemory', amount: 1 },
        { type: 'setFutureEventFlag', flag: 'backwardsDreamRecorded', value: true },
        { type: 'addPanicToSurvivorDeck', amount: 1 }
      ], { requiresNomination: true }),
      choice('breakDream', 'Wake them fully', 'Cold water and shouted names drag them into the present.', 'Remove a personal card, but leave a scar.', [
        { type: 'removeSurvivorCard' },
        { type: 'addSurvivorScar', scarId: 'fearListenerScar' }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'lawOfTeeth',
    title: 'The Law of Teeth',
    lanternYear: 23,
    eventType: 'minor',
    description: 'A row of monster teeth appears around the settlement border.',
    storyParagraphs: ['Every point faces inward.'],
    impactLevel: 2,
    historyText: 'The settlement answered the inward-facing teeth.',
    choices: [
      choice('makeBoundary', 'Keep the boundary', 'No one crosses the teeth alone.', 'Reduce pressure, restrict the next hunt.', [
        { type: 'reduceCampaignPressure', amount: 1 },
        { type: 'addTemporaryHuntModifier', modifier: 'firstTurnEnergyPenalty', amount: 1, uses: 1 }
      ]),
      choice('makeWeapons', 'Make weapons', 'The border becomes a pile of sharpened handles.', 'Gain resources and weapon experience, lose memory.', [
        { type: 'gainResource', resourceId: 'claw', amount: 2 },
        { type: 'gainWeaponXp', weaponType: 'dagger', amount: 1 },
        { type: 'loseSettlementMemory', amount: 1 }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'doorInGround',
    title: 'The Door in the Ground',
    lanternYear: 24,
    eventType: 'disaster',
    description: 'A stone door is uncovered beneath a place everyone remembers as solid earth.',
    storyParagraphs: [
      'It has no handle on this side.',
      'Something below knocks only when the settlement is silent.'
    ],
    impactLevel: 5,
    historyText: 'The settlement answered the door beneath its foundations.',
    choices: [
      choice('sealDoor', 'Seal it', 'Stone, bone, and hide are packed into every seam.', 'Spend resources and reduce campaign pressure.', [
        { type: 'loseResource', resourceId: 'bone', amount: 2 },
        { type: 'loseResource', resourceId: 'hide', amount: 1 },
        { type: 'reduceCampaignPressure', amount: 2 },
        { type: 'setFutureEventFlag', flag: 'buriedDoorSealed', value: true }
      ]),
      choice('openDoor', 'Open it', 'The door descends without making room for light.', 'Dangerous knowledge and future pressure.', [
        { type: 'addInnovationToPool', innovationId: 'buriedMap' },
        { type: 'addCampaignPressure', amount: 2 },
        { type: 'addSurvivorInjury', injuryId: 'concussion' },
        { type: 'setFutureEventFlag', flag: 'buriedDoorOpened', value: true }
      ], { requiresNomination: true }),
      choice('listenDoor', 'Listen through it', 'Every living survivor hears a different answer.', 'Gain memory, spread Panic, reveal a vague hint.', [
        { type: 'gainSettlementMemory', amount: 2 },
        { type: 'addPanicToAllSurvivorDecks', amount: 1 },
        { type: 'setFutureEventFlag', flag: 'heardFinaleBelow', value: true },
        { type: 'addHistory', text: 'A later threat was heard beneath the settlement, but not named.' }
      ])
    ]
  }),
  event({
    id: 'graveOpensBelow',
    title: 'The Grave Opens From Below',
    lanternYear: 28,
    eventType: 'disaster',
    description: 'One grave is found empty, its floor pushed upward from beneath.',
    storyParagraphs: ['The dead survivor remains listed in every memory, but their tools have returned clean.'],
    requirements: { minimumGraves: 1 },
    impactLevel: 5,
    historyText: 'The settlement chose what to do with an opened grave.',
    choices: [
      choice('closeGrave', 'Close it with names', 'The grave is filled with spoken history instead of soil.', 'Spend memory to reduce pressure.', [
        { type: 'loseSettlementMemory', amount: 2 },
        { type: 'reduceCampaignPressure', amount: 2 },
        { type: 'setFutureEventFlag', flag: 'graveClosedWithNames', value: true }
      ]),
      choice('takeTools', 'Take the returned tools', 'No one asks what cleaned them.', 'Gain gear resources, but invite future danger.', [
        { type: 'gainResource', resourceId: 'scrap', amount: 2 },
        { type: 'gainResource', resourceId: 'bone', amount: 1 },
        { type: 'addCampaignPressure', amount: 2 },
        { type: 'setFutureEventFlag', flag: 'acceptedReturnedTools', value: true }
      ]),
      choice('sendListener', 'Send someone below', 'A rope descends until its end returns cut and warm.', 'A survivor gains knowledge, injury, and a title.', [
        { type: 'addSurvivorCard', cardId: 'watchTheDark' },
        { type: 'addSurvivorInjury', injuryId: 'deepCut' },
        { type: 'addSurvivorTrait', traitId: 'undergraveWalker' },
        { type: 'gainSettlementMemory', amount: 2 }
      ], { requiresNomination: true })
    ]
  }),
  event({
    id: 'lastWarmNight',
    title: 'The Last Warm Night',
    lanternYear: 34,
    eventType: 'finale',
    description: 'For one night, the settlement is warm enough to sleep without huddling together.',
    storyParagraphs: [
      'No fire burns hotter. No wind has changed.',
      'The warmth feels borrowed, and dawn waits too long beyond the lanterns.'
    ],
    impactLevel: 5,
    historyText: 'The settlement decided what to do with borrowed warmth.',
    choices: [
      choice('restWarmth', 'Let everyone rest', 'The settlement sleeps deeply and wakes missing a warning.', 'Heal survivors, but raise campaign pressure.', [
        { type: 'healAllSurvivors', amount: 5 },
        { type: 'addCampaignPressure', amount: 2 },
        { type: 'setFutureEventFlag', flag: 'sleptLastWarmNight', value: true }
      ]),
      choice('workWarmth', 'Work until dawn', 'Every workshop uses the impossible heat.', 'Repair buildings and gain resources, exhaust a survivor.', [
        { type: 'repairBuilding' },
        { type: 'gainResource', resourceId: 'scrap', amount: 2 },
        { type: 'makeSurvivorUnavailable', hunts: 1 }
      ], { requiresNomination: true }),
      choice('rejectWarmth', 'Put out every lantern', 'The settlement chooses cold it understands.', 'Gain memory and reduce pressure, but lose population.', [
        { type: 'gainSettlementMemory', amount: 3 },
        { type: 'reduceCampaignPressure', amount: 2 },
        { type: 'losePopulation', amount: 1 },
        { type: 'setFutureEventFlag', flag: 'rejectedLastWarmNight', value: true }
      ])
    ]
  })
];

export const quietYearSummaries = [
  {
    id: 'quietLanternsLow',
    title: 'A Quiet Year',
    description: 'The lanterns burn low. No great horror comes, but hunger remains.',
    effects: [{ type: 'loseResource', resourceId: 'organ', amount: 1 }]
  },
  {
    id: 'quietNamesDead',
    title: 'A Quiet Year',
    description: 'Children learn the names of the dead.',
    effects: [{ type: 'gainSettlementMemory', amount: 1 }]
  },
  {
    id: 'quietRepairs',
    title: 'A Quiet Year',
    description: 'The settlement repairs what the last hunt broke.',
    effects: [{ type: 'repairBuilding' }]
  },
  {
    id: 'quietSharedBreath',
    title: 'A Quiet Year',
    description: 'No shape crosses the lantern ring. Survivors practice breathing without fear.',
    effects: [{ type: 'addTemporaryHuntModifier', modifier: 'startingSurvival', amount: 1, uses: 1 }]
  }
];

export function timelineRequirementsMet(eventData, settlement) {
  const requirements = eventData.requirements || {};
  if ((requirements.minimumGraves || 0) > (settlement.graveHistory?.length || 0)) return false;
  if ((requirements.minimumPopulation || 0) > (settlement.population || 0)) return false;
  if ((requirements.minimumBuildings || 0) > (settlement.builtInnovations?.length || 0)) return false;
  if (requirements.flag && !settlement.timelineFlags?.[requirements.flag]) return false;
  return true;
}

export function getTimelineEventForYear(year, settlement) {
  return timelineEvents.find(eventData =>
    eventData.lanternYear === year &&
    !settlement.resolvedTimelineEventIds?.includes(eventData.id) &&
    timelineRequirementsMet(eventData, settlement)
  ) || null;
}
