export const events = [
  {
    id: 'strangeCarcass',
    name: 'Strange Carcass',
    description: 'A swollen carcass lies across the path. Its ribs flex though no breath enters it.',
    choices: [
      {
        id: 'harvest',
        text: 'Harvest it',
        outcomeText: 'You cut quickly. Something useful comes free, followed by a memory that is not yours.',
        effects: { gainRandomResource: { pool: 'basicOrMonster', amount: 1 }, addPanic: 1 }
      },
      {
        id: 'burn',
        text: 'Burn it',
        outcomeText: 'The carcass screams in the fire. The settlement will remember that caution.',
        effects: { gainSettlementMemory: 1, loseHp: 1 }
      }
    ]
  },
  {
    id: 'lostSurvivor',
    name: 'Lost Survivor',
    description: 'A lanternless survivor crawls from beneath a stone face and reaches for your hand.',
    choices: [
      {
        id: 'rescue',
        text: 'Rescue them',
        outcomeText: 'You guide them toward a known trail and carry their story onward.',
        effects: { gainSettlementMemory: 1, gainSurvival: 1 }
      },
      {
        id: 'rob',
        text: 'Rob them',
        outcomeText: 'You take what they have. Their stare follows you into the dark.',
        effects: { gainRandomResource: { pool: 'any', amount: 1 }, addPanic: 1 }
      }
    ]
  },
  {
    id: 'lanternShrine',
    name: 'Lantern Shrine',
    description: 'A shallow altar cups a flame that bends toward your wounds.',
    choices: [
      {
        id: 'pray',
        text: 'Pray',
        outcomeText: 'Warm light closes the worst of your injuries.',
        effects: { healHp: 2 }
      },
      {
        id: 'blood',
        text: 'Offer blood',
        outcomeText: 'The flame drinks deeply. Its lesson returns to the settlement.',
        effects: { loseHp: 2, gainSettlementMemory: 2 }
      }
    ]
  },
  {
    id: 'beastTrail',
    name: 'Beast Trail',
    description: 'Deep tracks pulse with fresh heat. The quarry is close, and it is feeding.',
    choices: [
      {
        id: 'follow',
        text: 'Follow the tracks',
        outcomeText: 'You recover a fresh monster part, but your pursuit drives the quarry into a frenzy.',
        effects: { gainRandomResource: { pool: 'monster', amount: 1 }, nextCombatMonsterBonusHp: 5 }
      },
      {
        id: 'avoid',
        text: 'Avoid the trail',
        outcomeText: 'Restraint keeps the hunting party composed.',
        effects: { gainSurvival: 1 }
      }
    ]
  },
  {
    id: 'whisperingFaces',
    name: 'Whispering Faces',
    description: 'Stone faces murmur a technique in voices worn smooth by centuries.',
    choices: [
      {
        id: 'listen',
        text: 'Listen',
        outcomeText: 'One voice resolves into a lesson meant for your quarry.',
        effects: { gainTrait: { type: 'monsterBaneCurrent', rare: true } }
      },
      {
        id: 'cover',
        text: 'Cover your ears',
        outcomeText: 'The whispers follow inside your skull, but your breathing steadies.',
        effects: { addPanic: 1, healHp: 1 }
      }
    ]
  },
  {
    id: 'blackRain',
    name: 'Black Rain',
    description: 'Oily rain falls upward from the ground and stains the lantern smoke.',
    choices: [
      {
        id: 'walk',
        text: 'Walk through it',
        outcomeText: 'You seize a strange residue while the rain burns your skin.',
        effects: { gainRandomResource: { pool: ['strangeEye', 'ichor'], amount: 1 }, loseHp: 2 }
      },
      {
        id: 'shelter',
        text: 'Shelter',
        outcomeText: 'You reinforce your gear while the storm passes.',
        effects: { nextCombatStartBlock: 4 }
      }
    ]
  },
  {
    id: 'boneField',
    name: 'Bone Field',
    description: 'A plain of finger bones clicks beneath every careful step.',
    choices: [
      {
        id: 'scavenge',
        text: 'Scavenge',
        outcomeText: 'You search until the field begins searching back.',
        effects: { gainResource: { resourceId: 'bone', amount: 1 }, chance: { percent: 50, success: { gainResource: { resourceId: 'bone', amount: 1 } }, failure: { addPanic: 1 } } }
      },
      {
        id: 'careful',
        text: 'Move carefully',
        outcomeText: 'Patience yields one sound bone.',
        effects: { gainResource: { resourceId: 'bone', amount: 1 } }
      }
    ]
  },
  {
    id: 'woundedBeast',
    name: 'Wounded Beast',
    description: 'A lesser beast drags itself through the dust, leaving useful pieces in its wake.',
    choices: [
      {
        id: 'kill',
        text: 'Kill it',
        outcomeText: 'The work is ugly and profitable.',
        effects: { gainRandomResource: { pool: 'any', amount: 2 }, gainSettlementMemory: -1 }
      },
      {
        id: 'leave',
        text: 'Leave it',
        outcomeText: 'Mercy steadies your hands. The beast later weakens the quarry territory.',
        effects: { gainSurvival: 1, monsterStartsWounded: 3 }
      }
    ]
  },
  {
    id: 'oldGrave',
    name: 'Old Grave',
    description: 'A grave marker bears tooth marks instead of a name.',
    choices: [
      {
        id: 'dig',
        text: 'Dig',
        outcomeText: 'A blackened tooth waits beneath the marker.',
        effects: { gainResource: { resourceId: 'monsterTooth', amount: 1 }, addPanic: 1 }
      },
      {
        id: 'honour',
        text: 'Honour it',
        outcomeText: 'You speak a name for the nameless dead.',
        effects: { gainSettlementMemory: 1, gravesMemoryBonus: 1 }
      }
    ]
  },
  {
    id: 'lanternStorm',
    name: 'Lantern Storm',
    description: 'A cyclone of cold lanterns tears across the hunt path.',
    choices: [
      {
        id: 'run',
        text: 'Run',
        outcomeText: 'You escape with fresh cuts and no understanding of what pursued you.',
        effects: { loseHp: 1 }
      },
      {
        id: 'stand',
        text: 'Stand firm',
        outcomeText: 'You catch a rare fragment in the storm, but the next battle begins exhausted.',
        effects: { gainRandomResource: { pool: 'rare', amount: 1 }, nextCombatEnergyPenalty: 1 }
      }
    ]
  },
  {
    id: 'goldenTracks',
    name: 'Golden Tracks',
    description: 'Tracks shimmer as if filled with molten light.',
    choices: [
      {
        id: 'follow',
        text: 'Follow them',
        outcomeText: 'The trail ends in either treasure or a furious hunting ground.',
        effects: {
          chance: {
            percent: 50,
            success: { gainRandomResource: { pool: 'rare', amount: 1 } },
            failure: { nextCombatMonsterEnrage: 2 }
          }
        }
      },
      {
        id: 'mark',
        text: 'Mark the path',
        outcomeText: 'The route becomes a story the settlement can follow.',
        effects: { gainSettlementMemory: 1, addQuarryRumour: true }
      }
    ]
  },
  {
    id: 'collapsedLantern',
    name: 'Collapsed Lantern',
    description: 'A broken lantern burns beneath a fallen stone face.',
    choices: [
      {
        id: 'salvage',
        text: 'Salvage',
        outcomeText: 'You pull useful remains from the hot wreckage.',
        effects: { gainResource: { resourceId: 'scrap', amount: 1 }, gainRandomResource: { pool: ['strangeEye'], amount: 1 }, loseHp: 2 }
      },
      {
        id: 'leave',
        text: 'Leave it burning',
        outcomeText: 'The steady light restores your composure.',
        effects: { healHp: 1, gainSurvival: 1 }
      }
    ]
  },
  {
    id: 'screamingTree',
    name: 'Screaming Tree',
    description: 'A leafless tree screams with every movement of its wet bark.',
    choices: [
      {
        id: 'cut',
        text: 'Cut it open',
        outcomeText: 'An organ falls from the hollow trunk, still screaming.',
        effects: { gainResource: { resourceId: 'organ', amount: 1 }, addPanic: 2 }
      },
      {
        id: 'sing',
        text: 'Sing back',
        outcomeText: 'Your breath finds a calm rhythm inside the noise.',
        effects: { gainFightingArt: 'focusedBreath', loseHp: 1 }
      }
    ]
  },
  {
    id: 'whiteRain',
    name: 'White Rain',
    description: 'Warm white rain falls from a sky without clouds.',
    choices: [
      {
        id: 'drink',
        text: 'Drink',
        outcomeText: 'Your wounds close around a new permanent mark.',
        effects: { healFull: true, gainScar: 'Rain-White Veins' }
      },
      {
        id: 'collect',
        text: 'Collect',
        outcomeText: 'The rain thickens into valuable ichor.',
        effects: { gainResource: { resourceId: 'ichor', amount: 1 } }
      }
    ]
  },
  {
    id: 'deadSettlement',
    name: 'Dead Settlement',
    description: 'Cold homes surround a lantern that no longer remembers fire.',
    choices: [
      {
        id: 'loot',
        text: 'Loot homes',
        outcomeText: 'You leave richer and less certain of your own people.',
        effects: { gainRandomResource: { pool: 'any', amount: 2 }, gainSettlementMemory: -1 }
      },
      {
        id: 'honour',
        text: 'Honour the dead',
        outcomeText: 'A carved warning teaches you how your quarry kills.',
        effects: { gainSettlementMemory: 1, chance: { percent: 40, success: { gainTrait: { type: 'monsterBaneCurrent' } }, failure: {} } }
      }
    ]
  },
  {
    id: 'crawlingPit',
    name: 'Crawling Pit',
    description: 'The earth opens onto a pit whose walls crawl toward the light.',
    choices: [
      {
        id: 'descend',
        text: 'Descend',
        outcomeText: 'You seize rich remains while the pit tears at your body and mind.',
        effects: { gainRandomResource: { pool: 'rare', amount: 2 }, loseHp: 12, addPanic: 2 }
      },
      {
        id: 'seal',
        text: 'Seal it',
        outcomeText: 'The buried thing weakens the territory above it.',
        effects: { gainSettlementMemory: 1, monsterStartsWounded: 3 }
      }
    ]
  },
  {
    id: 'dreamingChild',
    name: 'Dreaming Child',
    description: 'A sleeping child floats an inch above the dust.',
    choices: [
      {
        id: 'wake',
        text: 'Wake them',
        outcomeText: 'The child vanishes, leaving a promise for the settlement.',
        effects: { pendingSpecialChildTrait: 'Dream-Touched' }
      },
      {
        id: 'sleep',
        text: 'Let them sleep',
        outcomeText: 'You take the eye-shaped stone beneath their head.',
        effects: { gainResource: { resourceId: 'strangeEye', amount: 1 }, addPanic: 1 }
      }
    ]
  },
  {
    id: 'brokenMask',
    name: 'Broken Mask',
    description: 'A cracked mask smiles differently each time you look away.',
    choices: [
      {
        id: 'wear',
        text: 'Wear it',
        outcomeText: 'A complete fighting lesson enters your body with the fear.',
        effects: { gainRandomFightingArt: true, addPanic: 1 }
      },
      {
        id: 'break',
        text: 'Break it',
        outcomeText: 'A monster tooth was hidden inside.',
        effects: { gainResource: { resourceId: 'monsterTooth', amount: 1 } }
      }
    ]
  },
  {
    id: 'freshKill',
    name: 'Fresh Kill',
    description: 'A fresh carcass bears wounds made by the quarry you pursue.',
    choices: [
      {
        id: 'harvest',
        text: 'Harvest quickly',
        outcomeText: 'You take one useful piece before the killer returns.',
        effects: { gainCreatureResource: true }
      },
      {
        id: 'watch',
        text: 'Wait and watch',
        outcomeText: 'Patient observation reveals a fragment of the quarry pattern.',
        effects: { chance: { percent: 35, success: { gainTrait: { type: 'monsterBaneCurrent' } }, failure: { nextCombatStartBlock: 2 } } }
      }
    ]
  },
  {
    id: 'perfectSilence',
    name: 'The Perfect Silence',
    description: 'Every sound stops, including the survivor’s heartbeat.',
    choices: [
      {
        id: 'sit',
        text: 'Sit in silence',
        outcomeText: 'One old terror leaves without a sound.',
        effects: { removePanic: 1 }
      },
      {
        id: 'run',
        text: 'Run from it',
        outcomeText: 'Fear sharpens your guard for the next encounter.',
        effects: { nextCombatStartBlock: 2 }
      }
    ]
  }
];

export const eventsById = Object.fromEntries(events.map(event => [event.id, event]));
