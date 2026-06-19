export const events = [
  {
    "name": "Ash-Wick Scatter",
    "sourceSeed": "Broken Lanterns",
    "id": "ashWickScatter",
    "section": "core",
    "mode": "choice",
    "description": "A trail of cold lamp fragments makes the hunters choose between salvage and safety.",
    "choices": [
      {
        "id": "gatherTheCoolGlass",
        "text": "Gather the cool glass",
        "outcomeText": "You collect useful fragments, but every reflection shows one of you dying.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "walkWithoutLooking",
        "text": "Walk without looking",
        "outcomeText": "The party avoids the visions and keeps the route clear.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "A trail of cold lamp fragments makes the hunters choose between salvage and safety. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Body Under the Faces",
    "sourceSeed": "Corpse",
    "id": "bodyUnderTheFaces",
    "section": "core",
    "mode": "choice",
    "description": "A body lies half-swallowed by stone faces, still clutching something warm.",
    "choices": [
      {
        "id": "cutTheHandFree",
        "text": "Cut the hand free",
        "outcomeText": "The hand gives up supplies, and the corpse gives up a scream.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "nameTheDead",
        "text": "Name the dead",
        "outcomeText": "A made-up name settles the body and steadies the settlement story.",
        "effects": {
          "gainSettlementMemory": 1,
          "healHp": 1
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A body lies half-swallowed by stone faces, still clutching something warm. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Tumour Birds",
    "sourceSeed": "Cancer Pigeons",
    "id": "tumourBirds",
    "section": "core",
    "mode": "choice",
    "description": "Pale birds with swollen throats hop around the path, pecking at lantern smoke.",
    "choices": [
      {
        "id": "scatterThem",
        "text": "Scatter them",
        "outcomeText": "You drive them off and find what they were guarding.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "stayStill",
        "text": "Stay still",
        "outcomeText": "They pass over you like a bad thought.",
        "effects": {
          "gainSurvival": 1,
          "removePanic": 1
        }
      },
      {
        "id": "forceThePassage",
        "text": "Force the passage",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "boneStrong"
        },
        "lockedText": "Requires trait: boneStrong.",
        "outcomeText": "Bone-strong hands move what should have been immovable.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "keepTheNightQuiet",
        "text": "Keep the night quiet",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "quietNight"
        },
        "lockedText": "Requires innovation: quietNight.",
        "outcomeText": "The party refuses to name the omen, and it loses some of its grip.",
        "effects": {
          "removePanic": 1,
          "healHp": 1
        }
      }
    ],
    "longDescription": "Pale birds with swollen throats hop around the path, pecking at lantern smoke. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Hollow Bellies",
    "sourceSeed": "Famine",
    "id": "hollowBellies",
    "section": "core",
    "mode": "automatic",
    "description": "The party hears stomachs growling from beneath the ground.",
    "autoOutcome": {
      "outcomeText": "No one speaks until the sound fades.",
      "effects": {
        "nextCombatEnergyPenalty": 1,
        "gainSurvival": 1
      }
    },
    "longDescription": "The party hears stomachs growling from beneath the ground. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Meat-Reed Plain",
    "sourceSeed": "Flesh Fields",
    "id": "meatReedPlain",
    "section": "core",
    "mode": "choice",
    "description": "A field of warm red reeds bends toward the hunters.",
    "choices": [
      {
        "id": "harvestTheSoftStems",
        "text": "Harvest the soft stems",
        "outcomeText": "The cut reeds bleed useful matter.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "burnAPath",
        "text": "Burn a path",
        "outcomeText": "Smoke clears the field and the quarry trail sharpens.",
        "effects": {
          "nextCombatFirstAttackBonus": 2,
          "addQuarryRumour": true
        }
      },
      {
        "id": "reciteSharedWarnings",
        "text": "Recite shared warnings",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "sharedWarnings"
        },
        "lockedText": "Requires innovation: sharedWarnings.",
        "outcomeText": "Warnings passed between generations turn the ambush into a lesson.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "A field of warm red reeds bends toward the hunters. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Blank Idol",
    "sourceSeed": "Faceless Statue",
    "id": "blankIdol",
    "section": "core",
    "mode": "automatic",
    "description": "A huge idol without features waits beside the trail, holding out both hands.",
    "autoOutcome": {
      "outcomeText": "The idol remembers the settlement.",
      "effects": {
        "gainSettlementMemory": 1,
        "gainResource": {
          "resourceId": "scrap",
          "amount": 1
        }
      }
    },
    "longDescription": "A huge idol without features waits beside the trail, holding out both hands. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Chewing Earth",
    "sourceSeed": "Hungry Ground",
    "id": "chewingEarth",
    "section": "core",
    "mode": "choice",
    "description": "The floor clicks like teeth under every step.",
    "choices": [
      {
        "id": "runAcross",
        "text": "Run across",
        "outcomeText": "You cross quickly, losing blood to the biting ground.",
        "effects": {
          "loseHp": 2,
          "nextCombatFirstAttackBonus": 2
        }
      },
      {
        "id": "moveOneStepAtATime",
        "text": "Move one step at a time",
        "outcomeText": "Patience reveals a safer route and a small find.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "gainSurvival": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "The floor clicks like teeth under every step. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Mourning Vapour",
    "sourceSeed": "Wailing Smoke",
    "id": "mourningVapour",
    "section": "core",
    "mode": "choice",
    "description": "Smoke rises from nowhere and cries with voices the survivors almost know.",
    "choices": [
      {
        "id": "breatheItIn",
        "text": "Breathe it in",
        "outcomeText": "The voice teaches a warning, then claws at memory.",
        "effects": {
          "gainSettlementMemory": 1,
          "addPanic": 1
        }
      },
      {
        "id": "coverTheLanterns",
        "text": "Cover the lanterns",
        "outcomeText": "The party keeps its fear contained.",
        "effects": {
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Smoke rises from nowhere and cries with voices the survivors almost know. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "False Dawn",
    "sourceSeed": "Golden Light",
    "id": "falseDawn",
    "section": "core",
    "mode": "choice",
    "description": "A gold glow brightens the horizon where no sun exists.",
    "choices": [
      {
        "id": "walkTowardIt",
        "text": "Walk toward it",
        "outcomeText": "The path is rich and cruel.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "nextCombatMonsterBonusHp": 5
        }
      },
      {
        "id": "turnAway",
        "text": "Turn away",
        "outcomeText": "The hunters reject the lure and keep formation.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "forceThePassage",
        "text": "Force the passage",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "boneStrong"
        },
        "lockedText": "Requires trait: boneStrong.",
        "outcomeText": "Bone-strong hands move what should have been immovable.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A gold glow brightens the horizon where no sun exists. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "The Bone Picker",
    "sourceSeed": "Harvester",
    "id": "theBonePicker",
    "section": "core",
    "mode": "choice",
    "description": "A bent figure harvests teeth from the ground with a hooked tool.",
    "choices": [
      {
        "id": "tradeAStory",
        "text": "Trade a story",
        "outcomeText": "The picker swaps a useful scrap for a memory.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "stealFromItsBasket",
        "text": "Steal from its basket",
        "outcomeText": "You gain more, but it marks your scent.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 2
          },
          "nextCombatMonsterEnrage": 2
        }
      },
      {
        "id": "snareTheMovement",
        "text": "Snare the movement",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "whip"
        },
        "lockedText": "Requires a Whip.",
        "outcomeText": "The lash catches motion before motion catches you.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 2
        }
      }
    ],
    "longDescription": "A bent figure harvests teeth from the ground with a hooked tool. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Steam Pile",
    "sourceSeed": "Monster Droppings",
    "id": "steamPile",
    "section": "core",
    "mode": "choice",
    "description": "A fresh steaming pile pulses with half-digested trophies.",
    "choices": [
      {
        "id": "digThroughIt",
        "text": "Dig through it",
        "outcomeText": "The stink rewards greedy hands.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "studyThePile",
        "text": "Study the pile",
        "outcomeText": "Its contents reveal what the quarry has eaten.",
        "effects": {
          "addQuarryRumour": true,
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A fresh steaming pile pulses with half-digested trophies. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Thread Around the Ankle",
    "sourceSeed": "Destiny-Bound",
    "id": "threadAroundTheAnkle",
    "section": "core",
    "mode": "automatic",
    "description": "A black thread coils round one hunter’s ankle and points onward.",
    "autoOutcome": {
      "outcomeText": "The cut thread curls into a charm-like lesson.",
      "effects": {
        "gainSettlementMemory": 1,
        "gainSurvival": 1
      }
    },
    "longDescription": "A black thread coils round one hunter’s ankle and points onward. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Too Much Light",
    "sourceSeed": "Overload",
    "id": "tooMuchLight",
    "section": "core",
    "mode": "choice",
    "description": "The lanterns suddenly flare until sight becomes pain.",
    "choices": [
      {
        "id": "shieldYourEyes",
        "text": "Shield your eyes",
        "outcomeText": "The party avoids the worst glare.",
        "effects": {
          "nextCombatStartBlock": 4
        }
      },
      {
        "id": "lookIntoIt",
        "text": "Look into it",
        "outcomeText": "The vision burns but reveals a strike.",
        "effects": {
          "nextCombatFirstAttackBonus": 3,
          "addPanic": 1
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "The lanterns suddenly flare until sight becomes pain. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Stranger at the Edge",
    "sourceSeed": "Chance Encounter",
    "id": "strangerAtTheEdge",
    "section": "core",
    "mode": "choice",
    "description": "Another survivor shape appears ahead, waving with the wrong hand.",
    "choices": [
      {
        "id": "approachOpenly",
        "text": "Approach openly",
        "outcomeText": "The stranger shares a route and vanishes.",
        "effects": {
          "gainSettlementMemory": 1,
          "addQuarryRumour": true
        }
      },
      {
        "id": "ambushTheShape",
        "text": "Ambush the shape",
        "outcomeText": "It bursts into useful remains.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "snareTheMovement",
        "text": "Snare the movement",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "whip"
        },
        "lockedText": "Requires a Whip.",
        "outcomeText": "The lash catches motion before motion catches you.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 2
        }
      }
    ],
    "longDescription": "Another survivor shape appears ahead, waving with the wrong hand. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Jaw Roots",
    "sourceSeed": "Man-trap",
    "id": "jawRoots",
    "section": "core",
    "mode": "choice",
    "description": "Root-like jaws hide beneath dust, waiting for weight.",
    "choices": [
      {
        "id": "springTheTrapWithASpear",
        "text": "Spring the trap with a spear",
        "outcomeText": "The jaws snap shut on nothing and expose buried bone.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatStartBlock": 1
        }
      },
      {
        "id": "riskAShortcut",
        "text": "Risk a shortcut",
        "outcomeText": "Someone is bitten, but the party gains ground.",
        "effects": {
          "loseHp": 2,
          "monsterStartsWounded": 2
        }
      },
      {
        "id": "splitTheHazard",
        "text": "Split the hazard open",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "The huge weapon makes one terrible problem into two useful pieces.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "Root-like jaws hide beneath dust, waiting for weight. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Sleeping While Walking",
    "sourceSeed": "Night Terrors",
    "id": "sleepingWhileWalking",
    "section": "core",
    "mode": "choice",
    "description": "The hunters realise one of them has been dreaming aloud for an hour.",
    "choices": [
      {
        "id": "wakeThemHard",
        "text": "Wake them hard",
        "outcomeText": "The dream breaks violently.",
        "effects": {
          "addPanic": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "letTheDreamFinish",
        "text": "Let the dream finish",
        "outcomeText": "A useful route is spoken in sleep.",
        "effects": {
          "addQuarryRumour": true,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "usePainAsInstruction",
        "text": "Use pain as instruction",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "painLessons"
        },
        "lockedText": "Requires innovation: painLessons.",
        "outcomeText": "Old wounds tell the party which mistake not to repeat.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "The hunters realise one of them has been dreaming aloud for an hour. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "The Near Face",
    "sourceSeed": "Face-to-Face",
    "id": "theNearFace",
    "section": "core",
    "mode": "choice",
    "description": "A stone face rises close enough to fog with breath.",
    "choices": [
      {
        "id": "speakToIt",
        "text": "Speak to it",
        "outcomeText": "It answers in the hunter’s own voice.",
        "effects": {
          "gainSettlementMemory": 1,
          "addPanic": 1
        }
      },
      {
        "id": "breakItsTeeth",
        "text": "Break its teeth",
        "outcomeText": "The face cracks and drops a hard prize.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "holdItAtReach",
        "text": "Hold it at reach",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "spear"
        },
        "lockedText": "Requires a Spear.",
        "outcomeText": "Reach keeps the thing from deciding who it wants first.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A stone face rises close enough to fog with breath. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Ash Grass",
    "sourceSeed": "Dead Weed",
    "id": "ashGrass",
    "section": "core",
    "mode": "automatic",
    "description": "A mat of dead grass rattles like old paper.",
    "autoOutcome": {
      "outcomeText": "The fire forces the quarry trail into view.",
      "effects": {
        "nextCombatFirstAttackBonus": 2
      }
    },
    "longDescription": "A mat of dead grass rattles like old paper. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Black Breath",
    "sourceSeed": "Exhalation of Darkness",
    "id": "blackBreath",
    "section": "core",
    "mode": "choice",
    "description": "A valley exhales darkness warm enough to sweat.",
    "choices": [
      {
        "id": "holdYourBreathAndCross",
        "text": "Hold your breath and cross",
        "outcomeText": "The crossing is clean but exhausting.",
        "effects": {
          "nextCombatEnergyPenalty": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "walkWithTheBreath",
        "text": "Walk with the breath",
        "outcomeText": "The darkness hides the party’s approach.",
        "effects": {
          "monsterStartsWounded": 2,
          "addPanic": 1
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "A valley exhales darkness warm enough to sweat. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Thirsting Flats",
    "sourceSeed": "Dry Lands",
    "id": "thirstingFlats",
    "section": "core",
    "mode": "choice",
    "description": "The path becomes cracked and thirsty, drinking spilled blood instantly.",
    "choices": [
      {
        "id": "cutYourPalm",
        "text": "Cut your palm",
        "outcomeText": "The ground shows a shortcut after tasting you.",
        "effects": {
          "loseHp": 1,
          "addQuarryRumour": true
        }
      },
      {
        "id": "conserveStrength",
        "text": "Conserve strength",
        "outcomeText": "The party slows but arrives steadier.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "applyWeaponDrills",
        "text": "Apply weapon drills",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "weaponDrills"
        },
        "lockedText": "Requires innovation: weaponDrills.",
        "outcomeText": "Training turns panic into practiced movement.",
        "effects": {
          "nextCombatFirstAttackBonus": 2
        }
      }
    ],
    "longDescription": "The path becomes cracked and thirsty, drinking spilled blood instantly. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Charcoal Warnings",
    "sourceSeed": "Drawings",
    "id": "charcoalWarnings",
    "section": "core",
    "mode": "choice",
    "description": "Charcoal figures on stone show hunters making mistakes not yet made.",
    "choices": [
      {
        "id": "copyTheDrawings",
        "text": "Copy the drawings",
        "outcomeText": "The settlement gains a warning diagram.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "scrubThemAway",
        "text": "Scrub them away",
        "outcomeText": "The future loses interest for now.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      },
      {
        "id": "keepTheNightQuiet",
        "text": "Keep the night quiet",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "quietNight"
        },
        "lockedText": "Requires innovation: quietNight.",
        "outcomeText": "The party refuses to name the omen, and it loses some of its grip.",
        "effects": {
          "removePanic": 1,
          "healHp": 1
        }
      }
    ],
    "longDescription": "Charcoal figures on stone show hunters making mistakes not yet made. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Sour Rain",
    "sourceSeed": "Acid Rain",
    "id": "sourRain",
    "section": "core",
    "mode": "choice",
    "description": "Rain hisses on bone and leaves clear holes in the dust.",
    "choices": [
      {
        "id": "collectItInASkull",
        "text": "Collect it in a skull",
        "outcomeText": "The dangerous liquid becomes a tool.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "shelterUnderHides",
        "text": "Shelter under hides",
        "outcomeText": "The party waits it out safely.",
        "effects": {
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "answerWithTool",
        "text": "Answer with a tool",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "tool"
        },
        "lockedText": "Requires a Tool.",
        "outcomeText": "The weapon behaves as if it remembers this place.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "Rain hisses on bone and leaves clear holes in the dust. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Clear Pool",
    "sourceSeed": "Clean Water",
    "id": "clearPool",
    "section": "core",
    "mode": "choice",
    "description": "A still pool reflects the survivors as healthier strangers.",
    "choices": [
      {
        "id": "drinkDeeply",
        "text": "Drink deeply",
        "outcomeText": "The water restores the body, but not the mind.",
        "effects": {
          "healHp": 2,
          "addPanic": 1
        }
      },
      {
        "id": "bottleItForLater",
        "text": "Bottle it for later",
        "outcomeText": "The settlement will remember where water can be trusted.",
        "effects": {
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "consultTheCharm",
        "text": "Consult a charm or trinket",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "trinket"
        },
        "lockedText": "Requires gearTag: trinket.",
        "outcomeText": "The little object twitches toward the safer answer.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A still pool reflects the survivors as healthier strangers. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Borrowed Meal",
    "sourceSeed": "Food from the Mouths of Others",
    "id": "borrowedMeal",
    "section": "core",
    "mode": "automatic",
    "description": "A nest of lesser things coughs up warm, edible scraps.",
    "autoOutcome": {
      "outcomeText": "The food becomes settlement knowledge.",
      "effects": {
        "gainSettlementMemory": 1,
        "gainRandomResource": {
          "pool": "basicOrMonster",
          "amount": 1
        }
      }
    },
    "longDescription": "A nest of lesser things coughs up warm, edible scraps. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Distant Giants",
    "sourceSeed": "Titans in the Dark",
    "id": "distantGiants",
    "section": "core",
    "mode": "choice",
    "description": "Vast silhouettes move far away, rearranging the horizon.",
    "choices": [
      {
        "id": "hideAndWatch",
        "text": "Hide and watch",
        "outcomeText": "Their steps reveal old paths.",
        "effects": {
          "addQuarryRumour": true,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "runBeforeTheyTurn",
        "text": "Run before they turn",
        "outcomeText": "The party escapes shaken but quickened.",
        "effects": {
          "addPanic": 1,
          "nextCombatFirstAttackBonus": 2
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "Vast silhouettes move far away, rearranging the horizon. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Mouth in the Ground",
    "sourceSeed": "Pit",
    "id": "mouthInTheGround",
    "section": "core",
    "mode": "choice",
    "description": "The path opens into a vertical black mouth.",
    "choices": [
      {
        "id": "climbDown",
        "text": "Climb down",
        "outcomeText": "A prize waits on a ledge.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "loseHp": 2
        }
      },
      {
        "id": "markTheEdge",
        "text": "Mark the edge",
        "outcomeText": "The party avoids disaster and records the hazard.",
        "effects": {
          "gainSurvival": 1,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "applyWeaponDrills",
        "text": "Apply weapon drills",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "weaponDrills"
        },
        "lockedText": "Requires innovation: weaponDrills.",
        "outcomeText": "Training turns panic into practiced movement.",
        "effects": {
          "nextCombatFirstAttackBonus": 2
        }
      }
    ],
    "longDescription": "The path opens into a vertical black mouth. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Hooked Silhouettes",
    "sourceSeed": "Man-stealers",
    "id": "hookedSilhouettes",
    "section": "core",
    "mode": "choice",
    "description": "Long-armed shapes move between rocks, carrying bags that kick.",
    "choices": [
      {
        "id": "chaseThem",
        "text": "Chase them",
        "outcomeText": "The hunters recover supplies but draw attention.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "stayHidden",
        "text": "Stay hidden",
        "outcomeText": "Survival matters more than heroics.",
        "effects": {
          "gainSurvival": 2
        }
      },
      {
        "id": "crackTheHardPart",
        "text": "Split the hard part",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "A heavy strike turns the obstacle into salvage.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "Long-armed shapes move between rocks, carrying bags that kick. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Mocking Carrion Bird",
    "sourceSeed": "Trollbird",
    "id": "mockingCarrionBird",
    "section": "core",
    "mode": "choice",
    "description": "A huge carrion bird laughs with a human throat.",
    "choices": [
      {
        "id": "throwStones",
        "text": "Throw stones",
        "outcomeText": "It drops something stolen.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatMonsterBonusHp": 3
        }
      },
      {
        "id": "laughBack",
        "text": "Laugh back",
        "outcomeText": "The bird is offended into silence.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      },
      {
        "id": "steadyTheLine",
        "text": "Steady the party",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "steady"
        },
        "lockedText": "Requires trait: steady.",
        "outcomeText": "A steady survivor keeps the others from turning fear into mistakes.",
        "effects": {
          "gainSurvival": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "A huge carrion bird laughs with a human throat. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "The Unlit Smith",
    "sourceSeed": "Dark Blacksmith",
    "id": "theUnlitSmith",
    "section": "core",
    "mode": "choice",
    "description": "Hammer blows ring from a forge with no flame.",
    "choices": [
      {
        "id": "offerScrap",
        "text": "Offer scrap",
        "outcomeText": "The smith tempers a small advantage.",
        "effects": {
          "nextCombatFirstAttackBonus": 3,
          "addPanic": 1,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "watchFromAfar",
        "text": "Watch from afar",
        "outcomeText": "You learn the rhythm without paying.",
        "effects": {
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "takeTheOpening",
        "text": "Take the dangerous opening",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "bold"
        },
        "lockedText": "Requires trait: bold.",
        "outcomeText": "Boldness wins a reward before caution can object.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "Hammer blows ring from a forge with no flame. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Softened Faces",
    "sourceSeed": "Rotten Faces",
    "id": "softenedFaces",
    "section": "core",
    "mode": "automatic",
    "description": "Stone faces ahead rot like fruit.",
    "autoOutcome": {
      "outcomeText": "The party keeps clean footing.",
      "effects": {
        "nextCombatStartBlock": 2,
        "gainSurvival": 1
      }
    },
    "longDescription": "Stone faces ahead rot like fruit. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Path That Blinks",
    "sourceSeed": "Strange Path",
    "id": "pathThatBlinks",
    "section": "core",
    "mode": "choice",
    "description": "The trail appears only whenever no one looks directly at it.",
    "choices": [
      {
        "id": "trustTheCornerOfYourEye",
        "text": "Trust the corner of your eye",
        "outcomeText": "The party advances strangely fast.",
        "effects": {
          "monsterStartsWounded": 2,
          "addPanic": 1
        }
      },
      {
        "id": "makeYourOwnPath",
        "text": "Make your own path",
        "outcomeText": "Hard work becomes reliable memory.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          }
        }
      },
      {
        "id": "burnTheBadMemory",
        "text": "Burn the bad memory",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "riteOfForgetting"
        },
        "lockedText": "Requires innovation: riteOfForgetting.",
        "outcomeText": "The ritual keeps the worst part from following the party home.",
        "effects": {
          "removePanic": 1,
          "gainSettlementMemory": 1
        }
      }
    ],
    "longDescription": "The trail appears only whenever no one looks directly at it. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Laughing Fit",
    "sourceSeed": "Sudden Madness",
    "id": "laughingFit",
    "section": "core",
    "mode": "choice",
    "description": "One survivor begins laughing at something in the dark.",
    "choices": [
      {
        "id": "restrainThem",
        "text": "Restrain them",
        "outcomeText": "The panic is contained roughly.",
        "effects": {
          "addPanic": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "letTheLaughSpread",
        "text": "Let the laugh spread",
        "outcomeText": "The whole party runs lighter, for now.",
        "effects": {
          "gainSurvival": 2,
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "One survivor begins laughing at something in the dark. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Name in the Teeth",
    "sourceSeed": "It Whispers Your Name",
    "id": "nameInTheTeeth",
    "section": "core",
    "mode": "choice",
    "description": "A voice whispers a survivor’s name from between stones.",
    "choices": [
      {
        "id": "answerIt",
        "text": "Answer it",
        "outcomeText": "The answer returns as a dangerous lesson.",
        "effects": {
          "gainSettlementMemory": 2,
          "addPanic": 1
        }
      },
      {
        "id": "refuseTheName",
        "text": "Refuse the name",
        "outcomeText": "Silence becomes armour.",
        "effects": {
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "advanceBehindTheShield",
        "text": "Advance behind a shield",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "shield"
        },
        "lockedText": "Requires a Shield.",
        "outcomeText": "The blow lands on prepared cover instead of skin.",
        "effects": {
          "nextCombatStartBlock": 5
        }
      }
    ],
    "longDescription": "A voice whispers a survivor’s name from between stones. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Weight of Hopelessness",
    "sourceSeed": "Crippling Misery",
    "id": "weightOfHopelessness",
    "section": "core",
    "mode": "choice",
    "description": "A sadness settles so heavily that moving hurts.",
    "choices": [
      {
        "id": "shareTheBurden",
        "text": "Share the burden",
        "outcomeText": "The party steadies one another.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "pushThroughAlone",
        "text": "Push through alone",
        "outcomeText": "Pain becomes momentum.",
        "effects": {
          "loseHp": 1,
          "nextCombatFirstAttackBonus": 3
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "A sadness settles so heavily that moving hurts. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Cold Furnace",
    "sourceSeed": "Broken Lantern Oven",
    "id": "coldFurnace",
    "section": "core",
    "mode": "choice",
    "description": "A dead furnace is packed with cracked lantern glass.",
    "choices": [
      {
        "id": "rakeTheAshes",
        "text": "Rake the ashes",
        "outcomeText": "Useful salvage cuts the hands.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "relightItBriefly",
        "text": "Relight it briefly",
        "outcomeText": "The flame teaches the settlement a trick.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 1
        }
      },
      {
        "id": "takeTheOpening",
        "text": "Take the dangerous opening",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "bold"
        },
        "lockedText": "Requires trait: bold.",
        "outcomeText": "Boldness wins a reward before caution can object.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "A dead furnace is packed with cracked lantern glass. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Fresh Sign",
    "sourceSeed": "On the Trail",
    "id": "freshSign",
    "section": "core",
    "mode": "automatic",
    "description": "The quarry trail becomes unmistakable: warm prints, fresh blood, and disturbed dust.",
    "autoOutcome": {
      "outcomeText": "The party prepares the opening.",
      "effects": {
        "nextCombatFirstAttackBonus": 2,
        "gainSurvival": 1
      }
    },
    "longDescription": "The quarry trail becomes unmistakable: warm prints, fresh blood, and disturbed dust. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "No Same Stone Twice",
    "sourceSeed": "Lost",
    "id": "noSameStoneTwice",
    "section": "core",
    "mode": "choice",
    "description": "The party realises every landmark has moved.",
    "choices": [
      {
        "id": "followTheLanternSmoke",
        "text": "Follow the lantern smoke",
        "outcomeText": "The smoke knows the way, but not kindly.",
        "effects": {
          "addPanic": 1,
          "addQuarryRumour": true
        }
      },
      {
        "id": "campAndListen",
        "text": "Camp and listen",
        "outcomeText": "The lost path becomes a remembered route.",
        "effects": {
          "gainSettlementMemory": 1,
          "healHp": 1
        }
      },
      {
        "id": "snareTheMovement",
        "text": "Snare the movement",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "whip"
        },
        "lockedText": "Requires a Whip.",
        "outcomeText": "The lash catches motion before motion catches you.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 2
        }
      }
    ],
    "longDescription": "The party realises every landmark has moved. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Many-Horned Grazer",
    "sourceSeed": "Gregalope",
    "id": "manyHornedGrazer",
    "section": "core",
    "mode": "choice",
    "description": "A skittish many-horned creature feeds nearby.",
    "choices": [
      {
        "id": "huntItQuietly",
        "text": "Hunt it quietly",
        "outcomeText": "The party gains meat and fear.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatMonsterBonusHp": 3
        }
      },
      {
        "id": "driveItTowardTheQuarry",
        "text": "Drive it toward the quarry",
        "outcomeText": "The chaos wounds what waits ahead.",
        "effects": {
          "monsterStartsWounded": 3
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A skittish many-horned creature feeds nearby. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Thick Milk Fog",
    "sourceSeed": "Heavy Mist",
    "id": "thickMilkFog",
    "section": "core",
    "mode": "choice",
    "description": "White mist presses down until voices sound buried.",
    "choices": [
      {
        "id": "tieEveryoneTogether",
        "text": "Tie everyone together",
        "outcomeText": "No one is lost, but movement is slow.",
        "effects": {
          "nextCombatEnergyPenalty": 1,
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "moveByInstinct",
        "text": "Move by instinct",
        "outcomeText": "The party arrives suddenly and dangerously.",
        "effects": {
          "nextCombatFirstAttackBonus": 3,
          "addPanic": 1
        }
      },
      {
        "id": "holdItAtReach",
        "text": "Hold it at reach",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "spear"
        },
        "lockedText": "Requires a Spear.",
        "outcomeText": "Reach keeps the thing from deciding who it wants first.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "White mist presses down until voices sound buried. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Borrowed Sleep",
    "sourceSeed": "Dream",
    "id": "borrowedSleep",
    "section": "core",
    "mode": "choice",
    "description": "A survivor dreams while walking and wakes with wet eyes.",
    "choices": [
      {
        "id": "recordTheDream",
        "text": "Record the dream",
        "outcomeText": "The settlement gains a new omen.",
        "effects": {
          "gainSettlementMemory": 1,
          "addQuarryRumour": true
        }
      },
      {
        "id": "shakeItAway",
        "text": "Shake it away",
        "outcomeText": "The dream fades with some fear.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "steadyTheLine",
        "text": "Steady the party",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "steady"
        },
        "lockedText": "Requires trait: steady.",
        "outcomeText": "A steady survivor keeps the others from turning fear into mistakes.",
        "effects": {
          "gainSurvival": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "A survivor dreams while walking and wakes with wet eyes. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Dream With Teeth",
    "sourceSeed": "Nightmare",
    "id": "dreamWithTeeth",
    "section": "core",
    "mode": "choice",
    "description": "The walking dream turns violent and everyone sees it.",
    "choices": [
      {
        "id": "fightTheDream",
        "text": "Fight the dream",
        "outcomeText": "The party wakes bloodied but ready.",
        "effects": {
          "loseHp": 1,
          "nextCombatFirstAttackBonus": 3
        }
      },
      {
        "id": "fleeInsideIt",
        "text": "Flee inside it",
        "outcomeText": "The nightmare leaves panic behind.",
        "effects": {
          "addPanic": 2,
          "monsterStartsWounded": 2
        }
      },
      {
        "id": "shootTheWarningSign",
        "text": "Use a bow to test the path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "bow"
        },
        "lockedText": "Requires a Bow.",
        "outcomeText": "An arrow makes the hidden danger answer from a safer distance.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "The walking dream turns violent and everyone sees it. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Crawling Surgeon",
    "sourceSeed": "Surgeon",
    "id": "crawlingSurgeon",
    "section": "core",
    "mode": "automatic",
    "description": "A tiny masked thing offers treatment with too many tools.",
    "autoOutcome": {
      "outcomeText": "You keep your skin and take salvage.",
      "effects": {
        "gainResource": {
          "resourceId": "scrap",
          "amount": 1
        },
        "gainSettlementMemory": 1
      }
    },
    "longDescription": "A tiny masked thing offers treatment with too many tools. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Warm Kill Site",
    "sourceSeed": "Fresh Kill",
    "id": "warmKillSite",
    "section": "core",
    "mode": "choice",
    "description": "A fresh carcass steams in a circle of quiet.",
    "choices": [
      {
        "id": "harvestQuickly",
        "text": "Harvest quickly",
        "outcomeText": "You take parts before the owner returns.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "studyTheWounds",
        "text": "Study the wounds",
        "outcomeText": "The killer’s pattern becomes readable.",
        "effects": {
          "nextCombatFirstAttackBonus": 2,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A fresh carcass steams in a circle of quiet. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Hands in the Dust",
    "sourceSeed": "Opportunists",
    "id": "handsInTheDust",
    "section": "core",
    "mode": "choice",
    "description": "Small figures creep toward your packs whenever you blink.",
    "choices": [
      {
        "id": "guardThePacks",
        "text": "Guard the packs",
        "outcomeText": "The party loses time but not supplies.",
        "effects": {
          "nextCombatStartBlock": 2,
          "gainSurvival": 1
        }
      },
      {
        "id": "setACounterAmbush",
        "text": "Set a counter-ambush",
        "outcomeText": "You catch one and take its bundle.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "answerWithTool",
        "text": "Answer with a tool",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "tool"
        },
        "lockedText": "Requires a Tool.",
        "outcomeText": "The weapon behaves as if it remembers this place.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "Small figures creep toward your packs whenever you blink. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Knife Valley",
    "sourceSeed": "Jagged Valley",
    "id": "knifeValley",
    "section": "core",
    "mode": "choice",
    "description": "The trail drops through stone teeth.",
    "choices": [
      {
        "id": "climbTheSharpWay",
        "text": "Climb the sharp way",
        "outcomeText": "The cuts are worth the high ground.",
        "effects": {
          "loseHp": 1,
          "nextCombatFirstAttackBonus": 3
        }
      },
      {
        "id": "takeTheLongWay",
        "text": "Take the long way",
        "outcomeText": "Slow travel keeps the party whole.",
        "effects": {
          "healHp": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "crackTheHardPart",
        "text": "Split the hard part",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "A heavy strike turns the obstacle into salvage.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "keepTheNightQuiet",
        "text": "Keep the night quiet",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "quietNight"
        },
        "lockedText": "Requires innovation: quietNight.",
        "outcomeText": "The party refuses to name the omen, and it loses some of its grip.",
        "effects": {
          "removePanic": 1,
          "healHp": 1
        }
      }
    ],
    "longDescription": "The trail drops through stone teeth. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Black Current",
    "sourceSeed": "River",
    "id": "blackCurrent",
    "section": "core",
    "mode": "choice",
    "description": "A dark river crosses the path, flowing uphill.",
    "choices": [
      {
        "id": "wadeThrough",
        "text": "Wade through",
        "outcomeText": "The current steals warmth but uncovers a find.",
        "effects": {
          "loseHp": 1,
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          }
        }
      },
      {
        "id": "buildACrossing",
        "text": "Build a crossing",
        "outcomeText": "Care becomes a settlement lesson.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "steadyTheLine",
        "text": "Steady the party",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "steady"
        },
        "lockedText": "Requires trait: steady.",
        "outcomeText": "A steady survivor keeps the others from turning fear into mistakes.",
        "effects": {
          "gainSurvival": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "A dark river crosses the path, flowing uphill. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Feeding Trees",
    "sourceSeed": "Banquet Trees",
    "id": "feedingTrees",
    "section": "core",
    "mode": "choice",
    "description": "Trees with mouth-like knots offer hanging fruit.",
    "choices": [
      {
        "id": "eatTheFruit",
        "text": "Eat the fruit",
        "outcomeText": "It restores flesh and invites dreams.",
        "effects": {
          "healHp": 2,
          "addPanic": 1
        }
      },
      {
        "id": "cutTheBranches",
        "text": "Cut the branches",
        "outcomeText": "The wood-like bone is useful.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "Trees with mouth-like knots offer hanging fruit. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "The Quiet Bet",
    "sourceSeed": "Death Wager",
    "id": "theQuietBet",
    "section": "core",
    "mode": "automatic",
    "description": "A coin of bone spins in the air and will not fall.",
    "autoOutcome": {
      "outcomeText": "The coin stops, disappointed.",
      "effects": {
        "gainSurvival": 1,
        "removePanic": 1
      }
    },
    "longDescription": "A coin of bone spins in the air and will not fall. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Yellow Marsh",
    "sourceSeed": "Pus Fields",
    "id": "yellowMarsh",
    "section": "core",
    "mode": "choice",
    "description": "The ground bubbles with yellow blisters.",
    "choices": [
      {
        "id": "skimTheSurface",
        "text": "Skim the surface",
        "outcomeText": "The fluid is disgusting but useful.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "stepOnDryRidges",
        "text": "Step on dry ridges",
        "outcomeText": "The careful route keeps everyone stable.",
        "effects": {
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "letArmourTakeIt",
        "text": "Let armour take the punishment",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "armor"
        },
        "lockedText": "Requires gearTag: armor.",
        "outcomeText": "The party trusts cured hide, bone, and plate instead of bare skin.",
        "effects": {
          "nextCombatStartBlock": 4
        }
      }
    ],
    "longDescription": "The ground bubbles with yellow blisters. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Hanging Cage",
    "sourceSeed": "Gibbet",
    "id": "hangingCage",
    "section": "core",
    "mode": "choice",
    "description": "A cage swings from a bone arch, knocking softly.",
    "choices": [
      {
        "id": "openIt",
        "text": "Open it",
        "outcomeText": "The cage contains a warning and a little salvage.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          }
        }
      },
      {
        "id": "cutItDownFromAfar",
        "text": "Cut it down from afar",
        "outcomeText": "It crashes loudly enough to stir the quarry.",
        "effects": {
          "monsterStartsWounded": 2,
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "shootTheWarningSign",
        "text": "Use a bow to test the path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "bow"
        },
        "lockedText": "Requires a Bow.",
        "outcomeText": "An arrow makes the hidden danger answer from a safer distance.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A cage swings from a bone arch, knocking softly. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Lanternless Group",
    "sourceSeed": "Refugees",
    "id": "lanternlessGroup",
    "section": "core",
    "mode": "choice",
    "description": "A small group begs to follow your lanterns.",
    "choices": [
      {
        "id": "guideThemHomeward",
        "text": "Guide them homeward",
        "outcomeText": "Their gratitude becomes memory.",
        "effects": {
          "gainSettlementMemory": 2,
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "takeTheirSupplies",
        "text": "Take their supplies",
        "outcomeText": "The settlement gains goods, not trust.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "forceThePassage",
        "text": "Force the passage",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "boneStrong"
        },
        "lockedText": "Requires trait: boneStrong.",
        "outcomeText": "Bone-strong hands move what should have been immovable.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A small group begs to follow your lanterns. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Whisper Flies",
    "sourceSeed": "Madflies",
    "id": "whisperFlies",
    "section": "core",
    "mode": "choice",
    "description": "A cloud of flies repeats every fearful word spoken near it.",
    "choices": [
      {
        "id": "staySilent",
        "text": "Stay silent",
        "outcomeText": "The party crosses with discipline.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "letThemSwarmTheLantern",
        "text": "Let them swarm the lantern",
        "outcomeText": "They burn and drop strange residue.",
        "effects": {
          "gainResource": {
            "resourceId": "ichor",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "A cloud of flies repeats every fearful word spoken near it. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Mask Pedlar",
    "sourceSeed": "Mask Salesman",
    "id": "maskPedlar",
    "section": "core",
    "mode": "choice",
    "description": "A hidden pedlar displays masks that twitch when ignored.",
    "choices": [
      {
        "id": "buyWithAMemory",
        "text": "Buy with a memory",
        "outcomeText": "A mask whispers how to survive.",
        "effects": {
          "gainSettlementMemory": -1,
          "gainSurvival": 2,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "stealAMask",
        "text": "Steal a mask",
        "outcomeText": "The mask keeps screaming in the pack.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "addPanic": 2
        }
      },
      {
        "id": "answerWithTool",
        "text": "Answer with a tool",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "tool"
        },
        "lockedText": "Requires a Tool.",
        "outcomeText": "The weapon behaves as if it remembers this place.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "A hidden pedlar displays masks that twitch when ignored. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Needle-Bone Squall",
    "sourceSeed": "Bone Storm",
    "id": "needleBoneSquall",
    "section": "core",
    "mode": "automatic",
    "description": "A storm of tiny bones strips across the plain.",
    "autoOutcome": {
      "outcomeText": "Speed costs blood.",
      "effects": {
        "loseHp": 2,
        "monsterStartsWounded": 2
      }
    },
    "longDescription": "A storm of tiny bones strips across the plain. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Living Mud",
    "sourceSeed": "Mudslide",
    "id": "livingMud",
    "section": "core",
    "mode": "choice",
    "description": "A slope of mud rolls uphill toward the party.",
    "choices": [
      {
        "id": "rideIt",
        "text": "Ride it",
        "outcomeText": "The party is carried closer to the quarry.",
        "effects": {
          "monsterStartsWounded": 2,
          "addPanic": 1
        }
      },
      {
        "id": "anchorDown",
        "text": "Anchor down",
        "outcomeText": "The mud leaves resources around your feet.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "letArmourTakeIt",
        "text": "Let armour take the punishment",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "armor"
        },
        "lockedText": "Requires gearTag: armor.",
        "outcomeText": "The party trusts cured hide, bone, and plate instead of bare skin.",
        "effects": {
          "nextCombatStartBlock": 4
        }
      }
    ],
    "longDescription": "A slope of mud rolls uphill toward the party. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Picked Giant",
    "sourceSeed": "Dead Monster",
    "id": "pickedGiant",
    "section": "core",
    "mode": "choice",
    "description": "The remains of a huge beast lie stripped by things with careful hands.",
    "choices": [
      {
        "id": "takeWhatRemains",
        "text": "Take what remains",
        "outcomeText": "There is still something worth cutting.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "studyWhatKilledIt",
        "text": "Study what killed it",
        "outcomeText": "The party learns caution from the wounds.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "applyWeaponDrills",
        "text": "Apply weapon drills",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "weaponDrills"
        },
        "lockedText": "Requires innovation: weaponDrills.",
        "outcomeText": "Training turns panic into practiced movement.",
        "effects": {
          "nextCombatFirstAttackBonus": 2
        }
      }
    ],
    "longDescription": "The remains of a huge beast lie stripped by things with careful hands. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Thunder Belly Laugh",
    "sourceSeed": "Gorm's Laughter",
    "id": "thunderBellyLaugh",
    "section": "core",
    "mode": "choice",
    "description": "A deep laugh rolls under the ground and makes stones jump.",
    "choices": [
      {
        "id": "laughWithIt",
        "text": "Laugh with it",
        "outcomeText": "The sound shakes fear loose.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "braceAgainstIt",
        "text": "Brace against it",
        "outcomeText": "The shaking reveals buried parts.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "A deep laugh rolls under the ground and makes stones jump. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Warm Scent",
    "sourceSeed": "Scent on the Wind",
    "id": "warmScent",
    "section": "core",
    "mode": "choice",
    "description": "A warm animal smell cuts through the dark.",
    "choices": [
      {
        "id": "followTheScent",
        "text": "Follow the scent",
        "outcomeText": "The party finds the quarry’s recent passage.",
        "effects": {
          "monsterStartsWounded": 2,
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "maskYourOwnScent",
        "text": "Mask your own scent",
        "outcomeText": "The next fight begins on your terms.",
        "effects": {
          "nextCombatStartBlock": 2,
          "gainSurvival": 1
        }
      },
      {
        "id": "steadyTheLine",
        "text": "Steady the party",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "steady"
        },
        "lockedText": "Requires trait: steady.",
        "outcomeText": "A steady survivor keeps the others from turning fear into mistakes.",
        "effects": {
          "gainSurvival": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "A warm animal smell cuts through the dark. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Old Fight Marks",
    "sourceSeed": "Signs of Battle",
    "id": "oldFightMarks",
    "section": "core",
    "mode": "choice",
    "description": "Broken weapons and dragged footprints mark a violent crossing.",
    "choices": [
      {
        "id": "searchTheDebris",
        "text": "Search the debris",
        "outcomeText": "The old fight gives up materials.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 2
          }
        }
      },
      {
        "id": "recreateTheFight",
        "text": "Recreate the fight",
        "outcomeText": "The lesson sharpens the opening blow.",
        "effects": {
          "nextCombatFirstAttackBonus": 3,
          "addPanic": 1
        }
      },
      {
        "id": "snareTheMovement",
        "text": "Snare the movement",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "whip"
        },
        "lockedText": "Requires a Whip.",
        "outcomeText": "The lash catches motion before motion catches you.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 2
        }
      }
    ],
    "longDescription": "Broken weapons and dragged footprints mark a violent crossing. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Crawling Fire",
    "sourceSeed": "Wildfire",
    "id": "crawlingFire",
    "section": "core",
    "mode": "automatic",
    "description": "Blue fire crawls across the ground against the wind.",
    "autoOutcome": {
      "outcomeText": "The fire hardens a useful piece.",
      "effects": {
        "gainResource": {
          "resourceId": "bone",
          "amount": 1
        },
        "gainSettlementMemory": 1
      }
    },
    "longDescription": "Blue fire crawls across the ground against the wind. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Cold Strike",
    "sourceSeed": "Frozen Lightning",
    "id": "coldStrike",
    "section": "core",
    "mode": "choice",
    "description": "A bolt of lightning hangs frozen in the air, humming softly.",
    "choices": [
      {
        "id": "touchItWithScrap",
        "text": "Touch it with scrap",
        "outcomeText": "The charge makes a dangerous tool.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "walkBeneathIt",
        "text": "Walk beneath it",
        "outcomeText": "The static wakes tired muscles.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "A bolt of lightning hangs frozen in the air, humming softly. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Thin Gap",
    "sourceSeed": "Space Between the Rocks",
    "id": "thinGap",
    "section": "core",
    "mode": "choice",
    "description": "Two rocks open a gap wider inside than outside.",
    "choices": [
      {
        "id": "enterTheGap",
        "text": "Enter the gap",
        "outcomeText": "The space folds you nearer the quarry.",
        "effects": {
          "monsterStartsWounded": 2,
          "addPanic": 1
        }
      },
      {
        "id": "leaveAMarker",
        "text": "Leave a marker",
        "outcomeText": "The strange place becomes a future route.",
        "effects": {
          "addQuarryRumour": true,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "holdItAtReach",
        "text": "Hold it at reach",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "spear"
        },
        "lockedText": "Requires a Spear.",
        "outcomeText": "Reach keeps the thing from deciding who it wants first.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Two rocks open a gap wider inside than outside. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Marching Feet",
    "sourceSeed": "Feet",
    "id": "marchingFeet",
    "section": "core",
    "mode": "choice",
    "description": "Dozens of bare footprints appear ahead, all fresh and all your size.",
    "choices": [
      {
        "id": "stepExactlyInsideThem",
        "text": "Step exactly inside them",
        "outcomeText": "The path carries you safely.",
        "effects": {
          "gainSurvival": 2
        }
      },
      {
        "id": "breakThePattern",
        "text": "Break the pattern",
        "outcomeText": "The footprints scatter into useful bone.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "shootTheWarningSign",
        "text": "Use a bow to test the path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "bow"
        },
        "lockedText": "Requires a Bow.",
        "outcomeText": "An arrow makes the hidden danger answer from a safer distance.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "Dozens of bare footprints appear ahead, all fresh and all your size. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Dry Fountain",
    "sourceSeed": "Stone Fountain",
    "id": "dryFountain",
    "section": "core",
    "mode": "choice",
    "description": "A fountain of stone pours nothing into a full basin.",
    "choices": [
      {
        "id": "cupTheNothing",
        "text": "Cup the nothing",
        "outcomeText": "Your hands come away full of impossible coolness.",
        "effects": {
          "healHp": 2,
          "addPanic": 1
        }
      },
      {
        "id": "chipTheBasin",
        "text": "Chip the basin",
        "outcomeText": "The fountain remembers the blow.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "snareTheMovement",
        "text": "Snare the movement",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "whip"
        },
        "lockedText": "Requires a Whip.",
        "outcomeText": "The lash catches motion before motion catches you.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 2
        }
      }
    ],
    "longDescription": "A fountain of stone pours nothing into a full basin. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Watching Statue",
    "sourceSeed": "Statue",
    "id": "watchingStatue",
    "section": "core",
    "mode": "choice",
    "description": "A statue turns only when no one admits it moved.",
    "choices": [
      {
        "id": "stareItDown",
        "text": "Stare it down",
        "outcomeText": "It gives up first.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      },
      {
        "id": "walkBehindIt",
        "text": "Walk behind it",
        "outcomeText": "You find offerings at its feet.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "splitTheHazard",
        "text": "Split the hazard open",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "The huge weapon makes one terrible problem into two useful pieces.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "A statue turns only when no one admits it moved. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Word That Hurts",
    "sourceSeed": "Forbidden Word",
    "id": "wordThatHurts",
    "section": "core",
    "mode": "automatic",
    "description": "A word appears in the dust. Everyone knows not to say it.",
    "autoOutcome": {
      "outcomeText": "The party keeps the danger unnamed.",
      "effects": {
        "removePanic": 1,
        "nextCombatStartBlock": 2
      }
    },
    "longDescription": "A word appears in the dust. Everyone knows not to say it. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Glistening Pools",
    "sourceSeed": "Saliva Pools",
    "id": "glisteningPools",
    "section": "core",
    "mode": "choice",
    "description": "Pools of thick saliva tremble with trapped sparks.",
    "choices": [
      {
        "id": "collectTheSlime",
        "text": "Collect the slime",
        "outcomeText": "The fluid will help craft or poison.",
        "effects": {
          "gainResource": {
            "resourceId": "ichor",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "skirtTheEdge",
        "text": "Skirt the edge",
        "outcomeText": "The party learns what fed here.",
        "effects": {
          "addQuarryRumour": true,
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "crackTheHardPart",
        "text": "Split the hard part",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "A heavy strike turns the obstacle into salvage.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "Pools of thick saliva tremble with trapped sparks. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Known Face in Stone",
    "sourceSeed": "A Familiar Face",
    "id": "knownFaceInStone",
    "section": "core",
    "mode": "choice",
    "description": "A stone face resembles someone back home.",
    "choices": [
      {
        "id": "speakToItAsFamily",
        "text": "Speak to it as family",
        "outcomeText": "The answer comforts and wounds.",
        "effects": {
          "gainSettlementMemory": 1,
          "addPanic": 1
        }
      },
      {
        "id": "breakTheResemblance",
        "text": "Break the resemblance",
        "outcomeText": "The party refuses the omen.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "shootTheWarningSign",
        "text": "Use a bow to test the path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "bow"
        },
        "lockedText": "Requires a Bow.",
        "outcomeText": "An arrow makes the hidden danger answer from a safer distance.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A stone face resembles someone back home. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Skipped Moment",
    "sourceSeed": "Time Lapse",
    "id": "skippedMoment",
    "section": "core",
    "mode": "choice",
    "description": "The hunters blink and find their footprints already ahead of them.",
    "choices": [
      {
        "id": "acceptTheLostTime",
        "text": "Accept the lost time",
        "outcomeText": "The quarry is closer than it should be.",
        "effects": {
          "monsterStartsWounded": 2,
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "anchorTheMoment",
        "text": "Anchor the moment",
        "outcomeText": "Memory holds the party together.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      },
      {
        "id": "keepTheNightQuiet",
        "text": "Keep the night quiet",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "quietNight"
        },
        "lockedText": "Requires innovation: quietNight.",
        "outcomeText": "The party refuses to name the omen, and it loses some of its grip.",
        "effects": {
          "removePanic": 1,
          "healHp": 1
        }
      }
    ],
    "longDescription": "The hunters blink and find their footprints already ahead of them. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Vault of the Best",
    "sourceSeed": "Tomb of Excellence",
    "id": "vaultOfTheBest",
    "section": "core",
    "mode": "choice",
    "description": "A perfect tomb displays tools too clean for the dead.",
    "choices": [
      {
        "id": "takeOneCarefully",
        "text": "Take one carefully",
        "outcomeText": "Excellence costs attention.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "studyTheCraft",
        "text": "Study the craft",
        "outcomeText": "The lesson matters more than the tool.",
        "effects": {
          "gainSettlementMemory": 2
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "A perfect tomb displays tools too clean for the dead. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Nameless Relic",
    "sourceSeed": "Found Relic",
    "id": "namelessRelic",
    "section": "core",
    "mode": "choice",
    "description": "Something old and deliberate rests in the dust.",
    "choices": [
      {
        "id": "keepIt",
        "text": "Keep it",
        "outcomeText": "The relic hums with possible use.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          }
        }
      },
      {
        "id": "buryItAgain",
        "text": "Bury it again",
        "outcomeText": "The act steadies the party’s story.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "answerWithTool",
        "text": "Answer with a tool",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "tool"
        },
        "lockedText": "Requires a Tool.",
        "outcomeText": "The weapon behaves as if it remembers this place.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      }
    ],
    "longDescription": "Something old and deliberate rests in the dust. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Waiting Game",
    "sourceSeed": "Something to Pass the Time",
    "id": "waitingGame",
    "section": "core",
    "mode": "automatic",
    "description": "The hunt slows, and boredom becomes dangerous.",
    "autoOutcome": {
      "outcomeText": "The next fight starts sharper.",
      "effects": {
        "nextCombatFirstAttackBonus": 2
      }
    },
    "longDescription": "The hunt slows, and boredom becomes dangerous. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Sunless Ember",
    "sourceSeed": "Golden Ember",
    "id": "sunlessEmber",
    "section": "core",
    "mode": "choice",
    "description": "A golden coal glows in a skull-shaped hollow.",
    "choices": [
      {
        "id": "carryIt",
        "text": "Carry it",
        "outcomeText": "It warms the party and burns the pack.",
        "effects": {
          "nextCombatStartBlock": 3,
          "loseHp": 1
        }
      },
      {
        "id": "crushItIntoAsh",
        "text": "Crush it into ash",
        "outcomeText": "The ash becomes a ritual memory.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          }
        }
      },
      {
        "id": "advanceBehindTheShield",
        "text": "Advance behind a shield",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "shield"
        },
        "lockedText": "Requires a Shield.",
        "outcomeText": "The blow lands on prepared cover instead of skin.",
        "effects": {
          "nextCombatStartBlock": 5
        }
      }
    ],
    "longDescription": "A golden coal glows in a skull-shaped hollow. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Horn-Slashed Stone",
    "sourceSeed": "Antler-Gouged",
    "id": "hornSlashedStone",
    "section": "core",
    "mode": "choice",
    "description": "Deep horn marks scar a wall of faces.",
    "choices": [
      {
        "id": "traceTheGouges",
        "text": "Trace the gouges",
        "outcomeText": "The pattern teaches evasive timing.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "pryOutLodged fragments",
        "text": "Pry out lodged fragments",
        "outcomeText": "Useful shards remain in the cuts.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Deep horn marks scar a wall of faces. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Wrong Step",
    "sourceSeed": "Oops!",
    "id": "wrongStep",
    "section": "core",
    "mode": "choice",
    "description": "Someone steps exactly where everyone silently agreed not to.",
    "choices": [
      {
        "id": "helpImmediately",
        "text": "Help immediately",
        "outcomeText": "The party recovers but loses momentum.",
        "effects": {
          "healHp": 1,
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "useTheMistake",
        "text": "Use the mistake",
        "outcomeText": "The accident exposes a hidden route.",
        "effects": {
          "addQuarryRumour": true,
          "addPanic": 1
        }
      },
      {
        "id": "holdItAtReach",
        "text": "Hold it at reach",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "spear"
        },
        "lockedText": "Requires a Spear.",
        "outcomeText": "Reach keeps the thing from deciding who it wants first.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Someone steps exactly where everyone silently agreed not to. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Dream-Path",
    "sourceSeed": "Dream the Way",
    "id": "dreamPath",
    "section": "core",
    "mode": "choice",
    "description": "A survivor suddenly remembers dreaming this exact route.",
    "choices": [
      {
        "id": "trustThe memory",
        "text": "Trust the memory",
        "outcomeText": "The dream guides you to an advantage.",
        "effects": {
          "nextCombatFirstAttackBonus": 2,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "fightTheDJVu",
        "text": "Fight the déjà vu",
        "outcomeText": "The party stays grounded.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "usePainAsInstruction",
        "text": "Use pain as instruction",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "painLessons"
        },
        "lockedText": "Requires innovation: painLessons.",
        "outcomeText": "Old wounds tell the party which mistake not to repeat.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A survivor suddenly remembers dreaming this exact route. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Soft Mouth Sink",
    "sourceSeed": "Sinkhole",
    "id": "softMouthSink",
    "section": "core",
    "mode": "choice",
    "description": "The ground puckers and pulls downward.",
    "choices": [
      {
        "id": "diveForTheGlint",
        "text": "Dive for the glint",
        "outcomeText": "A prize lies just below the surface.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "formAChain",
        "text": "Form a chain",
        "outcomeText": "The party learns to save one another.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "snareTheMovement",
        "text": "Snare the movement",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "whip"
        },
        "lockedText": "Requires a Whip.",
        "outcomeText": "The lash catches motion before motion catches you.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 2
        }
      }
    ],
    "longDescription": "The ground puckers and pulls downward. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Fallen Trophy-Taker",
    "sourceSeed": "Dead Great Game Hunter",
    "id": "fallenTrophyTaker",
    "section": "core",
    "mode": "automatic",
    "description": "A dead hunter is surrounded by labelled bones from beasts you have not met.",
    "autoOutcome": {
      "outcomeText": "The kit is useful and cursed by failure.",
      "effects": {
        "gainResource": {
          "resourceId": "scrap",
          "amount": 1
        },
        "addPanic": 1
      }
    },
    "longDescription": "A dead hunter is surrounded by labelled bones from beasts you have not met. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Tiny Dying Miner",
    "sourceSeed": "Dying Small Prospector",
    "id": "tinyDyingMiner",
    "section": "core",
    "mode": "choice",
    "description": "A tiny miner offers directions in exchange for being remembered.",
    "choices": [
      {
        "id": "hearTheirLastRoute",
        "text": "Hear their last route",
        "outcomeText": "The route is useful and sad.",
        "effects": {
          "addQuarryRumour": true,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "takeThePick",
        "text": "Take the pick",
        "outcomeText": "The tool is crude but valuable.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "A tiny miner offers directions in exchange for being remembered. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Heart-Sick Stone",
    "sourceSeed": "Lovelorn Rock",
    "id": "heartSickStone",
    "section": "core",
    "mode": "choice",
    "description": "A boulder sighs whenever anyone touches it.",
    "choices": [
      {
        "id": "comfortIt",
        "text": "Comfort it",
        "outcomeText": "The stone gifts a soft, impossible warmth.",
        "effects": {
          "healHp": 2,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "ignoreItsSobbing",
        "text": "Ignore its sobbing",
        "outcomeText": "The party saves time but feels cruel.",
        "effects": {
          "nextCombatFirstAttackBonus": 2,
          "addPanic": 1
        }
      },
      {
        "id": "holdItAtReach",
        "text": "Hold it at reach",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "spear"
        },
        "lockedText": "Requires a Spear.",
        "outcomeText": "Reach keeps the thing from deciding who it wants first.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A boulder sighs whenever anyone touches it. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Arms in the Soil",
    "sourceSeed": "Field of Arms",
    "id": "armsInTheSoil",
    "section": "core",
    "mode": "choice",
    "description": "Human-like arms grow from the ground, reaching but not grabbing yet.",
    "choices": [
      {
        "id": "pullOneFree",
        "text": "Pull one free",
        "outcomeText": "It leaves a useful bone and a terrible sound.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "threadBetweenThem",
        "text": "Thread between them",
        "outcomeText": "The party avoids the grasping field.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatStartBlock": 2
        }
      },
      {
        "id": "useTheRightTool",
        "text": "Use a carried tool",
        "lockedUnless": {
          "type": "partyHasGearTag",
          "tag": "tool"
        },
        "lockedText": "Requires gearTag: tool.",
        "outcomeText": "The right tool makes the grotesque work cleaner.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          }
        }
      }
    ],
    "longDescription": "Human-like arms grow from the ground, reaching but not grabbing yet. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Biting Grass",
    "sourceSeed": "Consuming Grass",
    "id": "bitingGrass",
    "section": "core",
    "mode": "choice",
    "description": "Grass blades chew at boots and old blood.",
    "choices": [
      {
        "id": "cutAPath",
        "text": "Cut a path",
        "outcomeText": "The grass yields hide-like strands.",
        "effects": {
          "gainResource": {
            "resourceId": "hide",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "stepWithTheWind",
        "text": "Step with the wind",
        "outcomeText": "The hunters learn the rhythm.",
        "effects": {
          "gainSurvival": 2
        }
      },
      {
        "id": "usePainAsInstruction",
        "text": "Use pain as instruction",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "painLessons"
        },
        "lockedText": "Requires innovation: painLessons.",
        "outcomeText": "Old wounds tell the party which mistake not to repeat.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Grass blades chew at boots and old blood. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Warm Red Pillar",
    "sourceSeed": "Flesh Monolith",
    "id": "warmRedPillar",
    "section": "core",
    "mode": "choice",
    "description": "A monolith of meat beats like a distant heart.",
    "choices": [
      {
        "id": "cutASample",
        "text": "Cut a sample",
        "outcomeText": "The flesh fights back.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "loseHp": 2
        }
      },
      {
        "id": "listenToTheHeartbeat",
        "text": "Listen to the heartbeat",
        "outcomeText": "It predicts the next violence.",
        "effects": {
          "nextCombatStartBlock": 2,
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A monolith of meat beats like a distant heart. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Wet Ledger",
    "sourceSeed": "Scribe’s Book",
    "id": "wetLedger",
    "section": "core",
    "mode": "automatic",
    "description": "A soaked book writes the party’s names before anyone opens it.",
    "autoOutcome": {
      "outcomeText": "The pages become useful records later.",
      "effects": {
        "gainSettlementMemory": 1,
        "gainSurvival": 1
      }
    },
    "longDescription": "A soaked book writes the party’s names before anyone opens it. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "The Dare Path",
    "sourceSeed": "Test of Courage",
    "id": "theDarePath",
    "section": "core",
    "mode": "choice",
    "description": "A narrow path dares the hunters to cross without light.",
    "choices": [
      {
        "id": "douseTheLanterns",
        "text": "Douse the lanterns",
        "outcomeText": "Courage brings a clean approach.",
        "effects": {
          "nextCombatFirstAttackBonus": 3,
          "addPanic": 1
        }
      },
      {
        "id": "keepTheLightHigh",
        "text": "Keep the light high",
        "outcomeText": "Caution wins over pride.",
        "effects": {
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "A narrow path dares the hunters to cross without light. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Sour Burrows",
    "sourceSeed": "Putrid Tunnels",
    "id": "sourBurrows",
    "section": "core",
    "mode": "choice",
    "description": "Low tunnels breathe rot into the hunters’ faces.",
    "choices": [
      {
        "id": "crawlThrough",
        "text": "Crawl through",
        "outcomeText": "The shortcut is foul and profitable.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "collapseTheEntrance",
        "text": "Collapse the entrance",
        "outcomeText": "The path behind becomes safer.",
        "effects": {
          "gainSettlementMemory": 1,
          "monsterStartsWounded": 1
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Low tunnels breathe rot into the hunters’ faces. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Crying Wall",
    "sourceSeed": "Weeping Faces",
    "id": "cryingWall",
    "section": "core",
    "mode": "choice",
    "description": "A wall of faces weeps dark water.",
    "choices": [
      {
        "id": "collectTheTears",
        "text": "Collect the tears",
        "outcomeText": "They cool wounds but taste of grief.",
        "effects": {
          "healHp": 2,
          "addPanic": 1
        }
      },
      {
        "id": "singBackToThem",
        "text": "Sing back to them",
        "outcomeText": "The wall remembers your settlement.",
        "effects": {
          "gainSettlementMemory": 1,
          "removePanic": 1
        }
      },
      {
        "id": "forceThePassage",
        "text": "Force the passage",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "boneStrong"
        },
        "lockedText": "Requires trait: boneStrong.",
        "outcomeText": "Bone-strong hands move what should have been immovable.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      },
      {
        "id": "advanceBehindTheShield",
        "text": "Advance behind a shield",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "shield"
        },
        "lockedText": "Requires a Shield.",
        "outcomeText": "The blow lands on prepared cover instead of skin.",
        "effects": {
          "nextCombatStartBlock": 5
        }
      }
    ],
    "longDescription": "A wall of faces weeps dark water. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Blade in the Idol",
    "sourceSeed": "The Sword and the Statue",
    "id": "bladeInTheIdol",
    "section": "core",
    "mode": "choice",
    "description": "A blade is buried through a statue’s chest.",
    "choices": [
      {
        "id": "pullTheBlade",
        "text": "Pull the blade",
        "outcomeText": "The statue punishes theft but leaves metal behind.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "loseHp": 1
        }
      },
      {
        "id": "pushItDeeper",
        "text": "Push it deeper",
        "outcomeText": "The idol’s wound becomes your opening lesson.",
        "effects": {
          "nextCombatFirstAttackBonus": 2,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A blade is buried through a statue’s chest. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Polishing Birds",
    "sourceSeed": "Cleaner Birds",
    "id": "polishingBirds",
    "section": "core",
    "mode": "choice",
    "description": "Small birds clean old blood from stones with needle beaks.",
    "choices": [
      {
        "id": "letThemCleanYourWounds",
        "text": "Let them clean your wounds",
        "outcomeText": "It hurts but helps.",
        "effects": {
          "healHp": 2,
          "loseHp": 1
        }
      },
      {
        "id": "followThemToCarrion",
        "text": "Follow them to carrion",
        "outcomeText": "They lead you to leftovers.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "takeTheOpening",
        "text": "Take the dangerous opening",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "bold"
        },
        "lockedText": "Requires trait: bold.",
        "outcomeText": "Boldness wins a reward before caution can object.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "Small birds clean old blood from stones with needle beaks. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Last-Lantern Glow",
    "sourceSeed": "Light on the Horizon",
    "id": "lastLanternGlow",
    "section": "core",
    "mode": "automatic",
    "description": "A far light suggests safety, settlement, or bait.",
    "autoOutcome": {
      "outcomeText": "The party becomes harder to find.",
      "effects": {
        "nextCombatStartBlock": 3
      }
    },
    "longDescription": "A far light suggests safety, settlement, or bait. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "First Footprint",
    "sourceSeed": "The Beginning",
    "id": "firstFootprint",
    "section": "core",
    "mode": "choice",
    "description": "A perfect first footprint appears in untouched dust.",
    "choices": [
      {
        "id": "stepBesideIt",
        "text": "Step beside it",
        "outcomeText": "The hunt feels newly possible.",
        "effects": {
          "gainSurvival": 2
        }
      },
      {
        "id": "eraseIt",
        "text": "Erase it",
        "outcomeText": "The party refuses whatever began here.",
        "effects": {
          "removePanic": 1,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "advanceBehindTheShield",
        "text": "Advance behind a shield",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "shield"
        },
        "lockedText": "Requires a Shield.",
        "outcomeText": "The blow lands on prepared cover instead of skin.",
        "effects": {
          "nextCombatStartBlock": 5
        }
      }
    ],
    "longDescription": "A perfect first footprint appears in untouched dust. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Bad Omen Start",
    "sourceSeed": "Failed Start",
    "id": "badOmenStart",
    "section": "core",
    "mode": "choice",
    "description": "The trail immediately splits, collapses, and laughs.",
    "choices": [
      {
        "id": "admitTheBadOmen",
        "text": "Admit the bad omen",
        "outcomeText": "Naming failure makes it manageable.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 1
        }
      },
      {
        "id": "forceTheHuntOnward",
        "text": "Force the hunt onward",
        "outcomeText": "Stubbornness cuts a path.",
        "effects": {
          "loseHp": 1,
          "nextCombatFirstAttackBonus": 2
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "The trail immediately splits, collapses, and laughs. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Voice Under Stone",
    "sourceSeed": "Lost Survivor",
    "id": "voiceUnderStone",
    "section": "core",
    "mode": "choice",
    "description": "A living voice calls from under a stone face.",
    "choices": [
      {
        "id": "freeThem",
        "text": "Free them",
        "outcomeText": "They cannot join, but their story survives.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "takeTheirSuppliesFirst",
        "text": "Take their supplies first",
        "outcomeText": "The party gains resources and shame.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "hewThePath",
        "text": "Hew open a path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "axe"
        },
        "lockedText": "Requires an Axe.",
        "outcomeText": "You cut through the obstacle and learn where the quarry passed.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "A living voice calls from under a stone face. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Heaving Slop",
    "sourceSeed": "Sickening Mess",
    "id": "heavingSlop",
    "section": "core",
    "mode": "choice",
    "description": "A pile of half-living waste churns beside the path.",
    "choices": [
      {
        "id": "rummageInIt",
        "text": "Rummage in it",
        "outcomeText": "Useful matter sticks to your arms.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "burnItClean",
        "text": "Burn it clean",
        "outcomeText": "The smoke hardens resolve.",
        "effects": {
          "nextCombatStartBlock": 2,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "usePainAsInstruction",
        "text": "Use pain as instruction",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "painLessons"
        },
        "lockedText": "Requires innovation: painLessons.",
        "outcomeText": "Old wounds tell the party which mistake not to repeat.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A pile of half-living waste churns beside the path. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Blue-Lipped Wanderer",
    "sourceSeed": "Grim and Frostbitten",
    "id": "blueLippedWanderer",
    "section": "core",
    "mode": "choice",
    "description": "A frostbitten wanderer stares through the party.",
    "choices": [
      {
        "id": "shareWarmth",
        "text": "Share warmth",
        "outcomeText": "Kindness costs time and leaves a lesson.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatEnergyPenalty": 1
        }
      },
      {
        "id": "takeTheFrozenBundle",
        "text": "Take the frozen bundle",
        "outcomeText": "The bundle contains something useful.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "takeTheOpening",
        "text": "Take the dangerous opening",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "bold"
        },
        "lockedText": "Requires trait: bold.",
        "outcomeText": "Boldness wins a reward before caution can object.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "A frostbitten wanderer stares through the party. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Hooded Figure",
    "sourceSeed": "Cloaked Stranger",
    "id": "hoodedFigure",
    "section": "core",
    "mode": "automatic",
    "description": "A cloaked figure offers advice without showing hands.",
    "autoOutcome": {
      "outcomeText": "It asks only to be remembered.",
      "effects": {
        "gainSettlementMemory": 1,
        "addQuarryRumour": true
      }
    },
    "longDescription": "A cloaked figure offers advice without showing hands. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Stone That Breathes",
    "sourceSeed": "Living Stone",
    "id": "stoneThatBreathes",
    "section": "core",
    "mode": "choice",
    "description": "A boulder slowly inhales around trapped bones.",
    "choices": [
      {
        "id": "waitForTheExhale",
        "text": "Wait for the exhale",
        "outcomeText": "Bones slide free.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "gainSurvival": 1
        }
      },
      {
        "id": "crackItOpen",
        "text": "Crack it open",
        "outcomeText": "The stone screams but gives more.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatMonsterEnrage": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A boulder slowly inhales around trapped bones. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Eyes in the Dark",
    "sourceSeed": "Bloody Eyes",
    "id": "eyesInTheDark",
    "section": "core",
    "mode": "choice",
    "description": "Wet red eyes open around the path.",
    "choices": [
      {
        "id": "meetTheirStare",
        "text": "Meet their stare",
        "outcomeText": "The fear sharpens into focus.",
        "effects": {
          "addPanic": 1,
          "nextCombatFirstAttackBonus": 3
        }
      },
      {
        "id": "lowerYourGaze",
        "text": "Lower your gaze",
        "outcomeText": "The party passes guarded and quiet.",
        "effects": {
          "nextCombatStartBlock": 3
        }
      },
      {
        "id": "listenPastTheFear",
        "text": "Listen past the fear",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "quietListener"
        },
        "lockedText": "Requires trait: quietListener.",
        "outcomeText": "The quiet survivor hears the safe rhythm beneath the noise.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Wet red eyes open around the path. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Falling Teeth Gate",
    "sourceSeed": "Portcullis",
    "id": "fallingTeethGate",
    "section": "core",
    "mode": "choice",
    "description": "A gate of stone teeth slams down across the route.",
    "choices": [
      {
        "id": "liftItTogether",
        "text": "Lift it together",
        "outcomeText": "The party is exhausted but united.",
        "effects": {
          "nextCombatEnergyPenalty": 1,
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "breakAToothLoose",
        "text": "Break a tooth loose",
        "outcomeText": "The gate opens angry and incomplete.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "monsterStartsWounded": 1
        }
      },
      {
        "id": "crackTheHardPart",
        "text": "Split the hard part",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "A heavy strike turns the obstacle into salvage.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A gate of stone teeth slams down across the route. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "End-Shape Omen",
    "sourceSeed": "The Finale",
    "id": "endShapeOmen",
    "section": "core",
    "mode": "choice",
    "description": "The path briefly shows the shape of a final battle no one understands.",
    "choices": [
      {
        "id": "lookUntilItEnds",
        "text": "Look until it ends",
        "outcomeText": "The vision is unbearable and useful.",
        "effects": {
          "gainSettlementMemory": 2,
          "addPanic": 2
        }
      },
      {
        "id": "turnEveryLanternAway",
        "text": "Turn every lantern away",
        "outcomeText": "The party keeps some innocence.",
        "effects": {
          "removePanic": 1,
          "gainSurvival": 2
        }
      },
      {
        "id": "usePainAsInstruction",
        "text": "Use pain as instruction",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "painLessons"
        },
        "lockedText": "Requires innovation: painLessons.",
        "outcomeText": "Old wounds tell the party which mistake not to repeat.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "The path briefly shows the shape of a final battle no one understands. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Infant Beside the Blade",
    "sourceSeed": "Baby and the Sword",
    "id": "infantBesideTheBlade",
    "section": "expansion",
    "mode": "choice",
    "description": "A wrapped infant sleeps beside a weapon too large for any child.",
    "choices": [
      {
        "id": "carryTheChildSOmenHome",
        "text": "Carry the child’s omen home",
        "outcomeText": "The settlement gains a pending birth-marked trait.",
        "effects": {
          "pendingSpecialChildTrait": "lanternEyed",
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "takeOnlyTheBladeShard",
        "text": "Take only the blade-shard",
        "outcomeText": "You avoid responsibility, not consequence.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A wrapped infant sleeps beside a weapon too large for any child. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Armoured Dead",
    "sourceSeed": "Dead Warrior",
    "id": "armouredDead",
    "section": "expansion",
    "mode": "automatic",
    "description": "A dead warrior kneels upright, still guarding the trail.",
    "autoOutcome": {
      "outcomeText": "Useful pieces come away with a curse.",
      "effects": {
        "gainResource": {
          "resourceId": "scrap",
          "amount": 1
        },
        "addPanic": 1
      }
    },
    "longDescription": "A dead warrior kneels upright, still guarding the trail. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Wanted Thing",
    "sourceSeed": "Object of Desire",
    "id": "wantedThing",
    "section": "expansion",
    "mode": "choice",
    "description": "Each hunter sees a different perfect object half-buried nearby.",
    "choices": [
      {
        "id": "letOneSurvivorTakeIt",
        "text": "Let one survivor take it",
        "outcomeText": "Desire becomes strength and trouble.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "leaveItUntouched",
        "text": "Leave it untouched",
        "outcomeText": "Restraint becomes a settlement story.",
        "effects": {
          "gainSettlementMemory": 2
        }
      },
      {
        "id": "burnTheBadMemory",
        "text": "Burn the bad memory",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "riteOfForgetting"
        },
        "lockedText": "Requires innovation: riteOfForgetting.",
        "outcomeText": "The ritual keeps the worst part from following the party home.",
        "effects": {
          "removePanic": 1,
          "gainSettlementMemory": 1
        }
      }
    ],
    "longDescription": "Each hunter sees a different perfect object half-buried nearby. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Buried Edge",
    "sourceSeed": "Sword in the Stone",
    "id": "buriedEdge",
    "section": "expansion",
    "mode": "choice",
    "description": "A blade is wedged in a black stone, humming like a trapped insect.",
    "choices": [
      {
        "id": "pullTogether",
        "text": "Pull together",
        "outcomeText": "The blade refuses, but metal flakes free.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 2
        }
      },
      {
        "id": "swearToReturn",
        "text": "Swear to return",
        "outcomeText": "The vow steadies the party.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "shootTheWarningSign",
        "text": "Use a bow to test the path",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "bow"
        },
        "lockedText": "Requires a Bow.",
        "outcomeText": "An arrow makes the hidden danger answer from a safer distance.",
        "effects": {
          "gainSurvival": 1,
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A blade is wedged in a black stone, humming like a trapped insect. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Black Pot",
    "sourceSeed": "Cauldron",
    "id": "blackPot",
    "section": "legacyOptional",
    "mode": "choice",
    "description": "A huge pot bubbles without fire and smells like childhood.",
    "choices": [
      {
        "id": "tasteTheBroth",
        "text": "Taste the broth",
        "outcomeText": "The body heals while the mind recoils.",
        "effects": {
          "healHp": 3,
          "addPanic": 1
        }
      },
      {
        "id": "pourItOut",
        "text": "Pour it out",
        "outcomeText": "Something in the pot thanks you by sinking into memory.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          }
        }
      },
      {
        "id": "splitTheHazard",
        "text": "Split the hazard open",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "grandWeapon"
        },
        "lockedText": "Requires a Grand Weapon.",
        "outcomeText": "The huge weapon makes one terrible problem into two useful pieces.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "A huge pot bubbles without fire and smells like childhood. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Bright Blood Trail",
    "sourceSeed": "Glowing Blood",
    "id": "brightBloodTrail",
    "section": "legacyOptional",
    "mode": "choice",
    "description": "A line of glowing blood leads away from the quarry path.",
    "choices": [
      {
        "id": "followTheGlow",
        "text": "Follow the glow",
        "outcomeText": "The trail reveals a rare remnant.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "nextCombatMonsterBonusHp": 4
        }
      },
      {
        "id": "smearItOnWeapons",
        "text": "Smear it on weapons",
        "outcomeText": "The next strike burns brighter.",
        "effects": {
          "nextCombatFirstAttackBonus": 3,
          "loseHp": 1
        }
      },
      {
        "id": "usePainAsInstruction",
        "text": "Use pain as instruction",
        "lockedUnless": {
          "type": "settlementHasInnovation",
          "innovationId": "painLessons"
        },
        "lockedText": "Requires innovation: painLessons.",
        "outcomeText": "Old wounds tell the party which mistake not to repeat.",
        "effects": {
          "nextCombatStartBlock": 3,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A line of glowing blood leads away from the quarry path. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Black Slick Fields",
    "sourceSeed": "Oil Fields",
    "id": "blackSlickFields",
    "section": "legacyOptional",
    "mode": "choice",
    "description": "Oil pools shine under the lanternlight like open eyes.",
    "choices": [
      {
        "id": "skimTheOil",
        "text": "Skim the oil",
        "outcomeText": "The substance can be used later.",
        "effects": {
          "gainResource": {
            "resourceId": "ichor",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "igniteAPool",
        "text": "Ignite a pool",
        "outcomeText": "The fire blocks pursuit and reveals the trail.",
        "effects": {
          "monsterStartsWounded": 2,
          "nextCombatStartBlock": 1
        }
      },
      {
        "id": "takeTheOpening",
        "text": "Take the dangerous opening",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "bold"
        },
        "lockedText": "Requires trait: bold.",
        "outcomeText": "Boldness wins a reward before caution can object.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "loseHp": 1
        }
      }
    ],
    "longDescription": "Oil pools shine under the lanternlight like open eyes. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Silent Camp",
    "sourceSeed": "Quarantine Camp",
    "id": "silentCamp",
    "section": "legacyOptional",
    "mode": "automatic",
    "description": "A ring of abandoned shelters bears warning marks.",
    "autoOutcome": {
      "outcomeText": "The settlement learns what not to touch.",
      "effects": {
        "gainSettlementMemory": 2
      }
    },
    "longDescription": "A ring of abandoned shelters bears warning marks. The hunters have only a moment to understand what is happening before the road forces its answer. Whatever follows will shape the next stretch of the hunt."
  },
  {
    "name": "Lantern Graveyard",
    "sourceSeed": "Scattered Lanterns",
    "id": "lanternGraveyard",
    "section": "legacyOptional",
    "mode": "choice",
    "description": "Dozens of dead lanterns lie scattered like fallen stars.",
    "choices": [
      {
        "id": "collectTheLeastBroken",
        "text": "Collect the least broken",
        "outcomeText": "Scrap and glass fill the pack.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "gainSettlementMemory": 1
        }
      },
      {
        "id": "relightOne",
        "text": "Relight one",
        "outcomeText": "The single flame guides the next approach.",
        "effects": {
          "nextCombatFirstAttackBonus": 2,
          "nextCombatStartBlock": 1
        }
      },
      {
        "id": "readTheLanternShape",
        "text": "Read the lantern-shape",
        "lockedUnless": {
          "type": "partyHasTrait",
          "traitId": "lanternEyed"
        },
        "lockedText": "Requires trait: lanternEyed.",
        "outcomeText": "Lantern-bright eyes turn the omen into a usable warning.",
        "effects": {
          "gainSettlementMemory": 1,
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "Dozens of dead lanterns lie scattered like fallen stars. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "name": "Crying Flame",
    "sourceSeed": "Wailing Fire",
    "id": "cryingFlame",
    "section": "legacyOptional",
    "mode": "choice",
    "description": "A fire wails like a child whenever the wind dies.",
    "choices": [
      {
        "id": "feedItBone",
        "text": "Feed it bone",
        "outcomeText": "It quiets and leaves hot ash.",
        "effects": {
          "gainSettlementMemory": 3,
          "addPanic": 1
        }
      },
      {
        "id": "carryACoal",
        "text": "Carry a coal",
        "outcomeText": "The coal is helpful and hateful.",
        "effects": {
          "nextCombatStartBlock": 3,
          "addPanic": 1
        }
      },
      {
        "id": "cutTheSmallOpening",
        "text": "Cut through the small opening",
        "lockedUnless": {
          "type": "partyHasWeaponType",
          "weaponType": "dagger"
        },
        "lockedText": "Requires a Dagger.",
        "outcomeText": "A quick blade finds the seam before the dark closes it.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "nextCombatFirstAttackBonus": 1
        }
      }
    ],
    "longDescription": "A fire wails like a child whenever the wind dies. The party can slow down, press for advantage, or turn aside before the moment closes. One possible answer depends on knowledge, gear, or settlement practice the party may not have yet."
  },
  {
    "id": "strangeCarcass",
    "name": "Strange Carcass",
    "description": "A swollen carcass lies across the path. Its ribs flex though no breath enters it.",
    "choices": [
      {
        "id": "harvest",
        "text": "Harvest it",
        "outcomeText": "You cut quickly. Something useful comes free, followed by a memory that is not yours.",
        "effects": {
          "gainRandomResource": {
            "pool": "basicOrMonster",
            "amount": 1
          },
          "addPanic": 1,
          "addDisorder": "nightTerrors"
        }
      },
      {
        "id": "burn",
        "text": "Burn it",
        "outcomeText": "The carcass screams in the fire. The settlement will remember that caution.",
        "effects": {
          "gainSettlementMemory": 1,
          "loseHp": 1
        }
      }
    ],
    "longDescription": "A swollen carcass lies across the path. Its ribs flex though no breath enters it. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "lostSurvivor",
    "name": "Lost Survivor",
    "description": "A lanternless survivor crawls from beneath a stone face and reaches for your hand.",
    "choices": [
      {
        "id": "rescue",
        "text": "Rescue them",
        "outcomeText": "You guide them toward a known trail and carry their story onward.",
        "effects": {
          "gainSettlementMemory": 1,
          "gainSurvival": 1
        }
      },
      {
        "id": "rob",
        "text": "Rob them",
        "outcomeText": "You take what they have. Their stare follows you into the dark.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 1
          },
          "addPanic": 1
        }
      }
    ],
    "longDescription": "A lanternless survivor crawls from beneath a stone face and reaches for your hand. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "lanternShrine",
    "name": "Lantern Shrine",
    "description": "A shallow altar cups a flame that bends toward your wounds.",
    "choices": [
      {
        "id": "pray",
        "text": "Pray",
        "outcomeText": "Warm light closes the worst of your injuries.",
        "effects": {
          "healHp": 2
        }
      },
      {
        "id": "blood",
        "text": "Offer blood",
        "outcomeText": "The flame drinks deeply. Its lesson returns to the settlement.",
        "effects": {
          "loseHp": 2,
          "gainSettlementMemory": 2
        }
      }
    ],
    "longDescription": "A shallow altar cups a flame that bends toward your wounds. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "beastTrail",
    "name": "Beast Trail",
    "description": "Deep tracks pulse with fresh heat. The quarry is close, and it is feeding.",
    "choices": [
      {
        "id": "follow",
        "text": "Follow the tracks",
        "outcomeText": "You recover a fresh monster part, but your pursuit drives the quarry into a frenzy.",
        "effects": {
          "gainRandomResource": {
            "pool": "monster",
            "amount": 1
          },
          "nextCombatMonsterBonusHp": 5
        }
      },
      {
        "id": "avoid",
        "text": "Avoid the trail",
        "outcomeText": "Restraint keeps the hunting party composed.",
        "effects": {
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "Deep tracks pulse with fresh heat. The quarry is close, and it is feeding. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "whisperingFaces",
    "name": "Whispering Faces",
    "description": "Stone faces murmur a technique in voices worn smooth by centuries.",
    "choices": [
      {
        "id": "listen",
        "text": "Listen",
        "outcomeText": "One voice resolves into a lesson meant for your quarry.",
        "effects": {
          "gainTrait": {
            "type": "monsterBaneCurrent",
            "rare": true
          }
        }
      },
      {
        "id": "cover",
        "text": "Cover your ears",
        "outcomeText": "The whispers follow inside your skull, but your breathing steadies.",
        "effects": {
          "addPanic": 1,
          "healHp": 1
        }
      }
    ],
    "longDescription": "Stone faces murmur a technique in voices worn smooth by centuries. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "blackRain",
    "name": "Black Rain",
    "description": "Oily rain falls upward from the ground and stains the lantern smoke.",
    "choices": [
      {
        "id": "walk",
        "text": "Walk through it",
        "outcomeText": "You seize a strange residue while the rain burns your skin.",
        "effects": {
          "gainRandomResource": {
            "pool": [
              "strangeEye",
              "ichor"
            ],
            "amount": 1
          },
          "loseHp": 2,
          "addInjury": "deepCut"
        }
      },
      {
        "id": "shelter",
        "text": "Shelter",
        "outcomeText": "You reinforce your gear while the storm passes.",
        "effects": {
          "nextCombatStartBlock": 4
        }
      }
    ],
    "longDescription": "Oily rain falls upward from the ground and stains the lantern smoke. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "boneField",
    "name": "Bone Field",
    "description": "A plain of finger bones clicks beneath every careful step.",
    "choices": [
      {
        "id": "scavenge",
        "text": "Scavenge",
        "outcomeText": "You search until the field begins searching back.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          },
          "chance": {
            "percent": 50,
            "success": {
              "gainResource": {
                "resourceId": "bone",
                "amount": 1
              }
            },
            "failure": {
              "addPanic": 1
            }
          }
        }
      },
      {
        "id": "careful",
        "text": "Move carefully",
        "outcomeText": "Patience yields one sound bone.",
        "effects": {
          "gainResource": {
            "resourceId": "bone",
            "amount": 1
          }
        }
      }
    ],
    "longDescription": "A plain of finger bones clicks beneath every careful step. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "woundedBeast",
    "name": "Wounded Beast",
    "description": "A lesser beast drags itself through the dust, leaving useful pieces in its wake.",
    "choices": [
      {
        "id": "kill",
        "text": "Kill it",
        "outcomeText": "The work is ugly and profitable.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 2
          },
          "gainSettlementMemory": -1
        }
      },
      {
        "id": "leave",
        "text": "Leave it",
        "outcomeText": "Mercy steadies your hands. The beast later weakens the quarry territory.",
        "effects": {
          "gainSurvival": 1,
          "monsterStartsWounded": 3
        }
      }
    ],
    "longDescription": "A lesser beast drags itself through the dust, leaving useful pieces in its wake. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "oldGrave",
    "name": "Old Grave",
    "description": "A grave marker bears tooth marks instead of a name.",
    "choices": [
      {
        "id": "dig",
        "text": "Dig",
        "outcomeText": "A blackened tooth waits beneath the marker.",
        "effects": {
          "gainResource": {
            "resourceId": "monsterTooth",
            "amount": 1
          },
          "addPanic": 1
        }
      },
      {
        "id": "honour",
        "text": "Honour it",
        "outcomeText": "You speak a name for the nameless dead.",
        "effects": {
          "gainSettlementMemory": 1,
          "gravesMemoryBonus": 1
        }
      }
    ],
    "longDescription": "A grave marker bears tooth marks instead of a name. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "lanternStorm",
    "name": "Lantern Storm",
    "description": "A cyclone of cold lanterns tears across the hunt path.",
    "choices": [
      {
        "id": "run",
        "text": "Run",
        "outcomeText": "You escape with fresh cuts and no understanding of what pursued you.",
        "effects": {
          "loseHp": 1,
          "addInjury": "twistedAnkle"
        }
      },
      {
        "id": "stand",
        "text": "Stand firm",
        "outcomeText": "You catch a rare fragment in the storm, but the next battle begins exhausted.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 1
          },
          "nextCombatEnergyPenalty": 1
        }
      }
    ],
    "longDescription": "A cyclone of cold lanterns tears across the hunt path. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "goldenTracks",
    "name": "Golden Tracks",
    "description": "Tracks shimmer as if filled with molten light.",
    "choices": [
      {
        "id": "follow",
        "text": "Follow them",
        "outcomeText": "The trail ends in either treasure or a furious hunting ground.",
        "effects": {
          "chance": {
            "percent": 50,
            "success": {
              "gainRandomResource": {
                "pool": "rare",
                "amount": 1
              }
            },
            "failure": {
              "nextCombatMonsterEnrage": 2
            }
          }
        }
      },
      {
        "id": "mark",
        "text": "Mark the path",
        "outcomeText": "The route becomes a story the settlement can follow.",
        "effects": {
          "gainSettlementMemory": 1,
          "addQuarryRumour": true
        }
      }
    ],
    "longDescription": "Tracks shimmer as if filled with molten light. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "collapsedLantern",
    "name": "Collapsed Lantern",
    "description": "A broken lantern burns beneath a fallen stone face.",
    "choices": [
      {
        "id": "salvage",
        "text": "Salvage",
        "outcomeText": "You pull useful remains from the hot wreckage.",
        "effects": {
          "gainResource": {
            "resourceId": "scrap",
            "amount": 1
          },
          "gainRandomResource": {
            "pool": [
              "strangeEye"
            ],
            "amount": 1
          },
          "loseHp": 2
        }
      },
      {
        "id": "leave",
        "text": "Leave it burning",
        "outcomeText": "The steady light restores your composure.",
        "effects": {
          "healHp": 1,
          "gainSurvival": 1
        }
      }
    ],
    "longDescription": "A broken lantern burns beneath a fallen stone face. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "screamingTree",
    "name": "Screaming Tree",
    "description": "A leafless tree screams with every movement of its wet bark.",
    "choices": [
      {
        "id": "cut",
        "text": "Cut it open",
        "outcomeText": "An organ falls from the hollow trunk, still screaming.",
        "effects": {
          "gainResource": {
            "resourceId": "organ",
            "amount": 1
          },
          "addPanic": 2
        }
      },
      {
        "id": "sing",
        "text": "Sing back",
        "outcomeText": "Your breath finds a calm rhythm inside the noise.",
        "effects": {
          "gainFightingArt": "focusedBreath",
          "loseHp": 1
        }
      }
    ],
    "longDescription": "A leafless tree screams with every movement of its wet bark. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "whiteRain",
    "name": "White Rain",
    "description": "Warm white rain falls from a sky without clouds.",
    "choices": [
      {
        "id": "drink",
        "text": "Drink",
        "outcomeText": "Your wounds close around a new permanent mark.",
        "effects": {
          "healFull": true,
          "addScar": "deadEyeCalm"
        }
      },
      {
        "id": "collect",
        "text": "Collect",
        "outcomeText": "The rain thickens into valuable ichor.",
        "effects": {
          "gainResource": {
            "resourceId": "ichor",
            "amount": 1
          }
        }
      }
    ],
    "longDescription": "Warm white rain falls from a sky without clouds. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "deadSettlement",
    "name": "Dead Settlement",
    "description": "Cold homes surround a lantern that no longer remembers fire.",
    "choices": [
      {
        "id": "loot",
        "text": "Loot homes",
        "outcomeText": "You leave richer and less certain of your own people.",
        "effects": {
          "gainRandomResource": {
            "pool": "any",
            "amount": 2
          },
          "gainSettlementMemory": -1
        }
      },
      {
        "id": "honour",
        "text": "Honour the dead",
        "outcomeText": "A carved warning teaches you how your quarry kills.",
        "effects": {
          "gainSettlementMemory": 1,
          "chance": {
            "percent": 40,
            "success": {
              "gainTrait": {
                "type": "monsterBaneCurrent"
              }
            },
            "failure": {}
          }
        }
      }
    ],
    "longDescription": "Cold homes surround a lantern that no longer remembers fire. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "crawlingPit",
    "name": "Crawling Pit",
    "description": "The earth opens onto a pit whose walls crawl toward the light.",
    "choices": [
      {
        "id": "descend",
        "text": "Descend",
        "outcomeText": "You seize rich remains while the pit tears at your body and mind.",
        "effects": {
          "gainRandomResource": {
            "pool": "rare",
            "amount": 2
          },
          "loseHp": 12,
          "addPanic": 2
        }
      },
      {
        "id": "seal",
        "text": "Seal it",
        "outcomeText": "The buried thing weakens the territory above it.",
        "effects": {
          "gainSettlementMemory": 1,
          "monsterStartsWounded": 3
        }
      }
    ],
    "longDescription": "The earth opens onto a pit whose walls crawl toward the light. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "dreamingChild",
    "name": "Dreaming Child",
    "description": "A sleeping child floats an inch above the dust.",
    "choices": [
      {
        "id": "wake",
        "text": "Wake them",
        "outcomeText": "The child vanishes, leaving a promise for the settlement.",
        "effects": {
          "pendingSpecialChildTrait": "quietListener"
        }
      },
      {
        "id": "sleep",
        "text": "Let them sleep",
        "outcomeText": "You take the eye-shaped stone beneath their head.",
        "effects": {
          "gainResource": {
            "resourceId": "strangeEye",
            "amount": 1
          },
          "addPanic": 1
        }
      }
    ],
    "longDescription": "A sleeping child floats an inch above the dust. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "brokenMask",
    "name": "Broken Mask",
    "description": "A cracked mask smiles differently each time you look away.",
    "choices": [
      {
        "id": "wear",
        "text": "Wear it",
        "outcomeText": "A complete fighting lesson enters your body with the fear.",
        "effects": {
          "gainRandomFightingArt": true,
          "addPanic": 1
        }
      },
      {
        "id": "break",
        "text": "Break it",
        "outcomeText": "A monster tooth was hidden inside.",
        "effects": {
          "gainResource": {
            "resourceId": "monsterTooth",
            "amount": 1
          }
        }
      }
    ],
    "longDescription": "A cracked mask smiles differently each time you look away. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "freshKill",
    "name": "Fresh Kill",
    "description": "A fresh carcass bears wounds made by the quarry you pursue.",
    "choices": [
      {
        "id": "harvest",
        "text": "Harvest quickly",
        "outcomeText": "You take one useful piece before the killer returns.",
        "effects": {
          "gainCreatureResource": true
        }
      },
      {
        "id": "watch",
        "text": "Wait and watch",
        "outcomeText": "Patient observation reveals a fragment of the quarry pattern.",
        "effects": {
          "chance": {
            "percent": 35,
            "success": {
              "gainTrait": {
                "type": "monsterBaneCurrent"
              }
            },
            "failure": {
              "nextCombatStartBlock": 2
            }
          }
        }
      }
    ],
    "longDescription": "A fresh carcass bears wounds made by the quarry you pursue. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  },
  {
    "id": "perfectSilence",
    "name": "The Perfect Silence",
    "description": "Every sound stops, including the survivor’s heartbeat.",
    "choices": [
      {
        "id": "sit",
        "text": "Sit in silence",
        "outcomeText": "One old terror leaves without a sound.",
        "effects": {
          "removePanic": 1
        }
      },
      {
        "id": "run",
        "text": "Run from it",
        "outcomeText": "Fear sharpens your guard for the next encounter.",
        "effects": {
          "nextCombatStartBlock": 2
        }
      }
    ],
    "longDescription": "Every sound stops, including the survivor’s heartbeat. The party can slow down, press for advantage, or turn aside before the moment closes. No answer is certain, but each one points toward a different kind of risk or reward."
  }
];

export const eventsById = Object.fromEntries(events.map(event => [event.id, event]));
