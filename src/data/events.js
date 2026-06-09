const choice = (text, outcome, effects) => ({ text, outcome, effects });

export const events = [
  {
    id: 'strangeCarcass', name: 'Strange Carcass',
    description: 'A bloated carcass twitches beneath a cloud of pale flies.',
    choices: [
      choice('Harvest', 'You cut useful matter from the carcass, but the sight follows you.', [{ type: 'gainRandomResource', pool: 'basicMonster', amount: 1 }, { type: 'addCardToDeck', cardId: 'panic' }]),
      choice('Burn it', 'The foul smoke becomes a warning remembered by the settlement.', [{ type: 'gainSettlementMemory', amount: 1 }, { type: 'loseHp', amount: 1 }])
    ]
  },
  {
    id: 'lostSurvivor', name: 'Lost Survivor',
    description: 'A wounded stranger crawls toward your lantern.',
    choices: [
      choice('Rescue', 'You guide them toward safety and remember the act.', [{ type: 'gainSettlementMemory', amount: 1 }, { type: 'gainSurvival', amount: 1 }]),
      choice('Rob them', 'You take what remains and leave with a heavier conscience.', [{ type: 'gainRandomResource', pool: 'all', amount: 1 }, { type: 'addCardToDeck', cardId: 'panic' }])
    ]
  },
  {
    id: 'lanternShrine', name: 'Lantern Shrine', description: 'Wax and old blood coat a shrine in the dark.',
    choices: [
      choice('Pray', 'Warm light closes your wounds.', [{ type: 'healHp', amount: 2 }]),
      choice('Offer blood', 'Pain sharpens the story you will carry home.', [{ type: 'loseHp', amount: 2 }, { type: 'gainSettlementMemory', amount: 2 }])
    ]
  },
  {
    id: 'beastTrail', name: 'Beast Trail', description: 'Fresh tracks lead toward something well fed.',
    choices: [
      choice('Follow tracks', 'You find a useful monster part, and draw the beast closer.', [{ type: 'gainRandomResource', pool: 'monster', amount: 1 }, { type: 'nextCombatMonsterBonusHp', amount: 5 }]),
      choice('Avoid', 'Caution leaves you ready for what comes next.', [{ type: 'gainSurvival', amount: 1 }])
    ]
  },
  {
    id: 'whisperingFaces', name: 'Whispering Faces', description: 'Faces in a stone wall teach violence in familiar voices.',
    choices: [
      choice('Listen', 'You accept the lesson of the claw.', [{ type: 'gainTemporaryPassive', passiveId: 'monsterClawStyle' }]),
      choice('Cover ears', 'The whispers remain, but your body steadies.', [{ type: 'addCardToDeck', cardId: 'panic' }, { type: 'healHp', amount: 1 }])
    ]
  },
  {
    id: 'blackRain', name: 'Black Rain', description: 'Oily rain hisses against the lantern.',
    choices: [
      choice('Walk through it', 'You catch a strange residue and pay in blood.', [{ type: 'gainRandomResource', pool: ['strangeEye', 'ichor'], amount: 1 }, { type: 'loseHp', amount: 2 }]),
      choice('Shelter', 'You wait and prepare a guarded approach.', [{ type: 'nextCombatStartBlock', amount: 4 }])
    ]
  },
  {
    id: 'boneField', name: 'Bone Field', description: 'Loose bones shift under every careful step.',
    choices: [
      choice('Scavenge', 'You search deeply, accepting the risk of what you uncover.', [{ type: 'gainResource', resourceId: 'bone', amount: 1 }, { type: 'chance', chance: 0.5, success: { type: 'gainResource', resourceId: 'bone', amount: 1 }, failure: { type: 'addCardToDeck', cardId: 'panic' } }]),
      choice('Move carefully', 'You take one clean bone and leave.', [{ type: 'gainResource', resourceId: 'bone', amount: 1 }])
    ]
  },
  {
    id: 'woundedBeast', name: 'Wounded Beast', description: 'A dying beast watches you with an intelligent eye.',
    choices: [
      choice('Kill it', 'The beast dies hard, yielding valuable remains.', [{ type: 'gainRandomResource', pool: 'monster', amount: 2 }, { type: 'gainSettlementMemory', amount: -1 }]),
      choice('Leave it', 'Mercy lends confidence, and the next beast bears old wounds.', [{ type: 'gainSurvival', amount: 1 }, { type: 'monsterStartsWounded', amount: 3 }])
    ]
  },
  {
    id: 'oldGrave', name: 'Old Grave', description: 'A shallow grave is marked by a broken tooth.',
    choices: [
      choice('Dig', 'You take the tooth and carry the grave with you.', [{ type: 'gainResource', resourceId: 'monsterTooth', amount: 1 }, { type: 'addCardToDeck', cardId: 'panic' }]),
      choice('Honour it', 'You add the dead to the settlement story.', [{ type: 'gainSettlementMemory', amount: 1, graveBonus: 1 }])
    ]
  },
  {
    id: 'lanternStorm', name: 'Lantern Storm', description: 'Burning motes tear sideways through the dark.',
    choices: [
      choice('Run', 'You escape scorched but alive.', [{ type: 'loseHp', amount: 1 }]),
      choice('Stand firm', 'You seize a rare fragment, but exhaustion follows.', [{ type: 'gainRandomResource', pool: 'rare', amount: 1 }, { type: 'nextCombatEnergyPenalty', amount: 1 }])
    ]
  }
];
