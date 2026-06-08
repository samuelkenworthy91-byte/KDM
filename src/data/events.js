// Hunt events use a small declarative effect vocabulary resolved by eventLogic.
export const events = [
  {
    id: 'strangeCarcass',
    name: 'Strange Carcass',
    description: 'A swollen carcass lies split open under lanternlight.',
    choices: [
      {
        id: 'harvest',
        text: 'Harvest it',
        outcomeText: 'You cut useful matter free. Its stench follows you.',
        effects: { randomResource: { type: 'any', amount: 1 }, addCard: 'panic' }
      },
      {
        id: 'burn',
        text: 'Burn it',
        outcomeText: 'The corpse gutters away, and the lesson remains.',
        effects: { settlementMemory: 1, hp: -1 }
      }
    ]
  },
  {
    id: 'lostSurvivor',
    name: 'Lost Survivor',
    description: 'A shaking survivor crawls from the dark.',
    choices: [
      {
        id: 'rescue',
        text: 'Rescue them',
        outcomeText: 'They vanish before dawn, but leave courage and a warning.',
        effects: { settlementMemory: 1, survival: 1 }
      },
      {
        id: 'rob',
        text: 'Rob them',
        outcomeText: 'You take what they carried. Their stare enters your dreams.',
        effects: {
          randomResource: { type: 'any', amount: 1 },
          randomCard: ['shame', 'panic']
        }
      }
    ]
  },
  {
    id: 'lanternShrine',
    name: 'Lantern Shrine',
    description: 'A dead shrine flickers with a weak flame.',
    choices: [
      {
        id: 'pray',
        text: 'Pray',
        outcomeText: 'A little warmth returns to your wounds.',
        effects: { hp: 2 }
      },
      {
        id: 'offerBlood',
        text: 'Offer blood',
        outcomeText: 'The shrine drinks deeply and answers with remembrance.',
        effects: { hp: -2, settlementMemory: 2 }
      }
    ]
  },
  {
    id: 'beastTrail',
    name: 'Beast Trail',
    description: 'Fresh tracks suggest a dangerous shortcut.',
    choices: [
      {
        id: 'follow',
        text: 'Follow the tracks',
        outcomeText: 'You find a jagged tooth. Its owner will find you stronger.',
        effects: {
          resource: { id: 'monsterTooth', amount: 1 },
          nextCombatModifiers: { monsterBonusHp: 5 }
        }
      },
      {
        id: 'avoid',
        text: 'Avoid it',
        outcomeText: 'Caution preserves your strength.',
        effects: { survival: 1 }
      }
    ]
  },
  {
    id: 'whisperingFaces',
    name: 'Whispering Faces',
    description: 'Stone faces whisper names of the dead.',
    choices: [
      {
        id: 'listen',
        text: 'Listen',
        outcomeText: 'A dead warrior teaches you the Claw Style.',
        effects: { temporaryFightingArt: 'clawStyle' }
      },
      {
        id: 'coverEars',
        text: 'Cover your ears',
        outcomeText: 'The voices fade, but panic remains beneath the silence.',
        effects: { addCard: 'panic', hp: 1 }
      }
    ]
  },
  {
    id: 'blackRain',
    name: 'Black Rain',
    description: 'Oily rain falls from nowhere.',
    choices: [
      {
        id: 'walk',
        text: 'Walk through it',
        outcomeText: 'You bottle the filth as it burns through your skin.',
        effects: { randomResource: { ids: ['strangeEye', 'ichor'], amount: 1 }, hp: -2 }
      },
      {
        id: 'shelter',
        text: 'Shelter',
        outcomeText: 'You wait, braced and watchful for what follows.',
        effects: { nextCombatModifiers: { startBlock: 4 } }
      }
    ]
  },
  {
    id: 'boneField',
    name: 'Bone Field',
    description: 'The ground is thick with old bones.',
    choices: [
      {
        id: 'scavenge',
        text: 'Scavenge',
        outcomeText: 'You dig until something shifts beneath the field.',
        effects: {
          resource: { id: 'bone', amount: 1 },
          chance: {
            probability: 0.5,
            success: { resource: { id: 'bone', amount: 1 } },
            failure: { addCard: 'panic' }
          }
        }
      },
      {
        id: 'careful',
        text: 'Move carefully',
        outcomeText: 'You take one clean bone and disturb nothing else.',
        effects: { resource: { id: 'bone', amount: 1 } }
      }
    ]
  },
  {
    id: 'woundedBeast',
    name: 'Wounded Beast',
    description: 'A smaller beast lies wounded and afraid.',
    choices: [
      {
        id: 'kill',
        text: 'Kill it',
        outcomeText: 'The work is easy. Remembering it will not be.',
        effects: {
          randomResource: { type: 'any', amount: 2 },
          settlementMemory: -1,
          memoryMinimum: 0
        }
      },
      {
        id: 'leave',
        text: 'Leave it',
        outcomeText: 'It limps away. Something larger follows its blood trail.',
        effects: {
          survival: 1,
          nextCombatModifiers: { monsterBonusHp: -3 }
        }
      }
    ]
  },
  {
    id: 'oldGrave',
    name: 'Old Grave',
    description: 'A cracked grave marker bears a forgotten symbol.',
    choices: [
      {
        id: 'dig',
        text: 'Dig',
        outcomeText: 'You uncover useful remains and an older malice.',
        effects: {
          randomResource: { type: 'gear', amount: 1 },
          randomCard: ['curse', 'panic']
        }
      },
      {
        id: 'honour',
        text: 'Honour it',
        outcomeText: 'The forgotten dead are named beneath your breath.',
        effects: { settlementMemory: 1, gravesOfFallenBonus: 1 }
      }
    ]
  },
  {
    id: 'lanternStorm',
    name: 'Lantern Storm',
    description: 'A storm of sparks tears across the sky.',
    choices: [
      {
        id: 'run',
        text: 'Run',
        outcomeText: 'You escape scorched, but still moving.',
        effects: { hp: -1 }
      },
      {
        id: 'stand',
        text: 'Stand firm',
        outcomeText: 'A rare fragment falls at your feet. The storm leaves you drained.',
        effects: {
          randomResource: { type: 'rare', amount: 1 },
          nextCombatModifiers: { firstTurnEnergyPenalty: 1 }
        }
      }
    ]
  }
];
