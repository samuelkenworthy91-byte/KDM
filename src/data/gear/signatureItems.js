export const signatureItems = [
  {
    id: 'palechord_cleaver',
    name: 'Palechord Cleaver',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'axe',
    hands: 1,
    quarryId: 'paleHuntLion',
    buildingId: 'lionTrophyHall',
    locationId: 'lionTrophyHall',
    craftingLocationId: 'lionTrophyHall',
    cost: {
      paleLionClaw: 2,
      paleLionSinew: 2,
      paleLionMane: 2,
      elderPaleFang: 1,
      perfectMane: 1,
      bone: 2,
      scrap: 2
    },
    cardPackage: [
      'signature_raking_chord',
      'signature_feedback_guard',
      'signature_cleaver_solo'
    ],
    passiveText: 'Passive — Predator’s Rhythm: The first time you apply Bleed each round, draw 1 card, then discard 1 card.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Win 3 fights where the quarry had Bleed 4+ before it died.',
        passiveText: 'Passive — Blood Chorus: Every third Bleed you apply in a turn applies +1 extra Bleed.'
      },
      {
        level: 2,
        unlock: 'Apply 10 total Bleed in one fight.',
        passiveText: 'Passive — Trophy Anthem: Once per round, after Bleed damages the quarry, your next Axe card costs 1 less and deals +2 damage.'
      },
      {
        level: 3,
        unlock: 'Defeat the Pale Hunt Lion while it has Bleed 6+.',
        passiveText: 'Passive — Blood Anthem: At the start of combat, apply Bleed 2. Once per round, after Bleed damages the quarry, your next Axe attack deals +2 damage and applies Bleed 1.'
      }
    ],
    keywords: ['Signature', 'Lion', 'Predator', 'Bleed', 'Axe'],
    implemented: true
  },
  {
    id: 'gorge_fist_knucklers',
    name: 'Gorge-Fist Knucklers',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'fistAndTooth',
    hands: 1,
    quarryId: 'wailingAntelope',
    buildingId: 'antelopeLarder',
    locationId: 'antelopeLarder',
    craftingLocationId: 'antelopeLarder',
    cost: {
      wailingHorn: 2,
      screamingSinew: 2,
      wailingOrgan: 2,
      stomachStone: 2,
      endlessMarrow: 1,
      hide: 2,
      organ: 2
    },
    cardPackage: [
      'signature_gut_punch',
      'signature_ration_crush',
      'signature_second_stomach'
    ],
    passiveText: 'Passive — Chew Through Fear: The first consumable you use each combat gives +1 Survival.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Use 5 consumables during one hunt.',
        passiveText: 'Passive — Five Mouth Hunt: Consumables give +1 to one number they grant.'
      },
      {
        level: 2,
        unlock: 'Use 3 different consumables in one fight.',
        passiveText: 'Passive — Hunger Discipline: Once per round, after you use a consumable, draw 1 card and gain 2 Block.'
      },
      {
        level: 3,
        unlock: 'Defeat the Wailing Antelope after using 8 consumables during that hunt.',
        passiveText: 'Passive — Endless Appetite: Start combat with 2 temporary basic consumables. The first consumable you use each round gives +1 Survival, +2 Block, and +2 damage to your next Fist & Tooth attack.'
      }
    ],
    keywords: ['Signature', 'Antelope', 'Hunger', 'Fist & Tooth'],
    implemented: true
  },
  {
    id: 'ash_second_spear',
    name: 'Ash-Second Spear',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'spear',
    hands: 1,
    quarryId: 'ashPhoenix',
    buildingId: 'phoenixPyre',
    locationId: 'phoenixPyre',
    craftingLocationId: 'phoenixPyre',
    cost: {
      ashFeather: 3,
      burntOrgan: 2,
      timeBone: 2,
      memoryGlass: 2,
      unspentFeather: 1,
      sinew: 2,
      scrap: 1
    },
    cardPackage: [
      'signature_ash_thrust',
      'signature_second_ember',
      'signature_burning_recall'
    ],
    passiveText: 'Passive — Remembered Strike: Once per combat, when you miss or deal 0 damage, keep that card instead of discarding it.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Play the same named attack 3 times in one fight.',
        passiveText: 'Passive — Repeated Death: The first repeated attack each fight deals +2 damage.'
      },
      {
        level: 2,
        unlock: 'Win a fight after reshuffling your discard into your draw pile.',
        passiveText: 'Passive — Ash Remembers the Hand: After your first reshuffle each fight, your next attack deals +3 damage.'
      },
      {
        level: 3,
        unlock: 'Defeat the Ash Phoenix after replaying or returning 5 cards that fight.',
        passiveText: 'Passive — Second Death: Once per fight, after you play an attack from discard, repeat half of its damage and status effects, rounded up.'
      }
    ],
    keywords: ['Signature', 'Phoenix', 'Time', 'Memory', 'Spear'],
    implemented: true
  },
  {
    id: 'stormglass_lantern',
    name: 'Stormglass Lantern',
    itemType: 'tool',
    loadoutCategory: 'tool',
    slot: 'tool',
    hands: 0,
    quarryId: 'bloatedGodling',
    buildingId: 'stormShrine',
    locationId: 'stormShrine',
    craftingLocationId: 'stormShrine',
    cost: {
      thunderGland: 2,
      denseOrgan: 2,
      bloatedHide: 1,
      stormBone: 2,
      crackedMolar: 1,
      livingThunderCore: 1,
      organ: 2,
      scrap: 3
    },
    cardPackage: [
      'signature_bottle_lightning',
      'signature_lantern_surge',
      'signature_white_flash'
    ],
    passiveText: 'Passive — Bottled Weather: At the start of combat, gain Charge 1. The first time you gain Block each round, gain Charge 1.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Spend 12 total Charge across hunts while this tool is equipped.',
        passiveText: 'Passive — Storm Wick: Your maximum Charge increases by 2. The first time you reach Charge 3 each round, apply Shock 1.'
      },
      {
        level: 2,
        unlock: 'Prevent 20 total damage with Block while this tool is equipped.',
        passiveText: 'Passive — Thunder Shelter: When you spend Charge, gain Block equal to twice the Charge spent.'
      },
      {
        level: 3,
        unlock: 'Defeat the Bloated Godling after applying Shock 5+ in that fight.',
        passiveText: 'Passive — Lantern of the Living Storm: At the start of combat, gain Charge 3. Once per fight, when the quarry attacks, you may spend Charge 3 to reduce the damage by 8 and apply Shock 2.'
      }
    ],
    keywords: ['Signature', 'Godling', 'Lantern', 'Charge', 'Tool'],
    implemented: true
  },
  {
    id: 'redwater_toothsaw',
    name: 'Redwater Toothsaw',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'sword',
    hands: 1,
    quarryId: 'crimsonCrocodile',
    buildingId: 'redTannery',
    locationId: 'redTannery',
    craftingLocationId: 'redTannery',
    cost: {
      riverTooth: 3,
      crimsonScale: 2,
      bloodMudOrgan: 2,
      redLeather: 2,
      riverKingHeart: 1,
      hide: 2,
      scrap: 2
    },
    cardPackage: [
      'signature_river_tooth_slash',
      'signature_undertow_hook',
      'signature_death_roll'
    ],
    passiveText: 'Passive — Drowning Cut: Your attacks deal +1 damage against a Bleeding quarry.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Apply Bleed and Vulnerable to the same quarry in one fight.',
        passiveText: 'Passive — Red Water Trail: The first Bleed you apply each round also applies Vulnerable 1.'
      },
      {
        level: 2,
        unlock: 'End 3 different fights with the quarry at Bleed 4+ before death.',
        passiveText: 'Passive — Dragged Under: Attacks against a Bleeding quarry ignore 1 Block and deal +1 damage.'
      },
      {
        level: 3,
        unlock: 'Defeat the Crimson Crocodile with Death Roll.',
        passiveText: 'Passive — Death Roll Rhythm: Once per round, after you damage a Bleeding quarry, deal bonus damage equal to half its Bleed, rounded up, max 5.'
      }
    ],
    keywords: ['Signature', 'Crocodile', 'Redwater', 'Bleed', 'Sword'],
    implemented: true
  },
  {
    id: 'croakspike_lash',
    name: 'Croakspike Lash',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'whip',
    hands: 1,
    quarryId: 'frogdog',
    buildingId: 'wetYard',
    locationId: 'wetYard',
    craftingLocationId: 'wetYard',
    cost: {
      frogdogTongue: 3,
      rubberyHide: 2,
      wetBone: 2,
      toxicGland: 2,
      bulgingEye: 1,
      manyMouthGland: 1,
      sinew: 2
    },
    cardPackage: [
      'signature_tongue_lash',
      'signature_wet_yank',
      'signature_venom_slap'
    ],
    passiveText: 'Passive — Wrong Leap: Once per round, after you apply Poison, gain Target Avoidance.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Apply Poison 5 times in one fight.',
        passiveText: 'Passive — Toxin Lesson: Every third Poison you apply also applies Staggered 1.'
      },
      {
        level: 2,
        unlock: 'Win a fight where this survivor is never hit after first applying Poison.',
        passiveText: 'Passive — Laugh Then Choke: A Poisoned quarry is less likely to target this survivor.'
      },
      {
        level: 3,
        unlock: 'Defeat the Frogdog while it has Poison, Staggered, and Vulnerable.',
        passiveText: 'Passive — Paralytic Croak: The first Poison damage each round deals +3. If the quarry has Poison 5+, also apply Staggered 1.'
      }
    ],
    keywords: ['Signature', 'Frogdog', 'Poison', 'Whip'],
    implemented: true
  },
  {
    id: 'widowline_needles',
    name: 'Widowline Needles',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'dagger',
    hands: 1,
    quarryId: 'silkMatriarch',
    buildingId: 'silkLoom',
    locationId: 'silkLoom',
    craftingLocationId: 'silkLoom',
    cost: {
      chitinThread: 3,
      silkGland: 2,
      webbedHide: 2,
      venomSac: 1,
      spiderEye: 1,
      broodCrown: 1,
      sinew: 2
    },
    cardPackage: [
      'signature_needle_flurry',
      'signature_binding_stitch',
      'signature_silk_reversal'
    ],
    passiveText: 'Passive — Tension Line: The first time you gain Block each round, apply Snared 1 to the quarry.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Apply Snared 3 times in one combat.',
        passiveText: 'Passive — Three Knots: The first attack against a Snared quarry each round deals +2 damage.'
      },
      {
        level: 2,
        unlock: 'End 3 rounds in one fight with every living survivor having Block.',
        passiveText: 'Passive — Webbed Formation: The first Block card you play each round also gives another survivor Block 2.'
      },
      {
        level: 3,
        unlock: 'Defeat the Silk Matriarch with no survivor reduced to 0 HP.',
        passiveText: 'Passive — Web of Cuts: Once per turn, after playing 2 Dagger cards, draw 1 card and apply Snared 1. Attacks against a Snared quarry deal +1 damage.'
      }
    ],
    keywords: ['Signature', 'Spider', 'Web', 'Snare', 'Dagger'],
    implemented: true
  },
  {
    id: 'thorn_saint_katana',
    name: 'Thorn-Saint Katana',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'katana',
    hands: 1,
    quarryId: 'bloomKnight',
    buildingId: 'duelistGarden',
    locationId: 'duelistGarden',
    craftingLocationId: 'duelistGarden',
    cost: {
      polishedStem: 2,
      floralSinew: 2,
      bloomPetal: 2,
      duelistThorn: 2,
      knightSeed: 1,
      perfectThornHeart: 1,
      scrap: 1
    },
    cardPackage: [
      'signature_petal_draw',
      'signature_duelist_breath',
      'signature_thorn_riposte'
    ],
    passiveText: 'Passive — Perfect Step: If this survivor plays exactly 1 attack in a turn, that attack deals +1 damage.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Deal damage in 3 separate rounds without missing or dealing 0.',
        passiveText: 'Passive — Formal Wound: Your first single attack each round applies Vulnerable 1.'
      },
      {
        level: 2,
        unlock: 'Win a fight where this survivor never plays more than 2 cards in a turn.',
        passiveText: 'Passive — No Wasted Motion: If you end your turn with an unused card, gain Block 2.'
      },
      {
        level: 3,
        unlock: 'Defeat the Bloom Knight with a turn where this survivor played exactly 1 attack.',
        passiveText: 'Passive — Perfect Thorn Moment: Once per fight, after playing exactly 1 attack this turn, double that attack’s bonus damage and apply Vulnerable 3 before damage.'
      }
    ],
    keywords: ['Signature', 'Knight', 'Thorn', 'Precision', 'Katana'],
    implemented: true
  },
  {
    id: 'blacklung_recurve',
    name: 'Blacklung Recurve',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'bow',
    hands: 2,
    quarryId: 'smogSingers',
    buildingId: 'smogKiln',
    locationId: 'smogKiln',
    craftingLocationId: 'smogKiln',
    cost: {
      smogPipe: 2,
      tarFeather: 3,
      sootLung: 2,
      harmonyBone: 2,
      chokingMask: 1,
      finalChorusLung: 1,
      sinew: 2
    },
    cardPackage: [
      'signature_soot_arrow',
      'signature_choking_shot',
      'signature_smoke_cover'
    ],
    passiveText: 'Passive — Smoke Distance: Your first Bow attack each round makes the quarry less likely to target this survivor.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Have Bleed, Burn, and Poison active at the same time.',
        passiveText: 'Passive — Three Voices: The first damage-over-time status you apply each round also applies a second different damage-over-time status at 1.'
      },
      {
        level: 2,
        unlock: 'The quarry takes damage-over-time damage in 3 consecutive rounds.',
        passiveText: 'Passive — No Clean Air: The first damage-over-time damage each round deals +2.'
      },
      {
        level: 3,
        unlock: 'Defeat the Smog Singers while all living survivors have Block.',
        passiveText: 'Passive — Choking Horizon: Once per round, your first Bow attack applies Burn 1 or Poison 1. If the quarry has 2+ statuses, draw 1 card after the attack.'
      }
    ],
    keywords: ['Signature', 'Singers', 'Soot', 'Ranged', 'Bow'],
    implemented: true
  },
  {
    id: 'carapace_katars',
    name: 'Carapace Katars',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'katar',
    hands: 1,
    quarryId: 'chitinCrusader',
    buildingId: 'chitinFoundry',
    locationId: 'chitinFoundry',
    craftingLocationId: 'chitinFoundry',
    cost: {
      beetleHorn: 3,
      chitinPlate: 2,
      resinBlood: 2,
      jewelWing: 1,
      crusaderHeartplate: 1,
      bone: 2,
      scrap: 2
    },
    cardPackage: [
      'signature_horn_jab',
      'signature_resin_catch',
      'signature_twin_plate_cut'
    ],
    passiveText: 'Passive — Twin Pressure: If two Katars are equipped, Katar attacks cost 1 less, minimum 0.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Play 2 Katar cards in one turn 5 times.',
        passiveText: 'Passive — Paired Cuts: The second Katar card you play each turn deals +2 damage.'
      },
      {
        level: 2,
        unlock: 'Play 10+ Katar cards during one fight and win.',
        passiveText: 'Passive — Living Guard: Every second Katar card you play each turn gives Block 2.'
      },
      {
        level: 3,
        unlock: 'Defeat the Chitin Crusader after playing 3 Katar cards in one turn.',
        passiveText: 'Passive — Living Twin-Blades: Once per turn, after playing 2 Katar cards, draw 1 card, gain Block 2, and the next Katar card this turn costs 0.'
      }
    ],
    keywords: ['Signature', 'Crusader', 'Chitin', 'Defensive', 'Katar'],
    implemented: true
  },
  {
    id: 'dragon_slayer_grand_cleaver',
    name: 'Dragon Slayer: Grand Cleaver',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'grandWeapon',
    hands: 2,
    quarryId: 'drakeEmperor',
    buildingId: 'crystalForge',
    locationId: 'crystalForge',
    craftingLocationId: 'crystalForge',
    cost: {
      crystalBone: 3,
      drakeScale: 2,
      fireGland: 2,
      imperialHorn: 2,
      moltenEye: 1,
      emperorFlameMarrow: 1,
      scrap: 3
    },
    cardPackage: [
      'signature_ember_decree',
      'signature_royal_heat',
      'signature_crownfire_cleave'
    ],
    passiveText: 'Passive — Commanding Heat: The first time you deal damage each combat, all other survivors gain +1 damage on their next attack.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: '3 different survivors deal damage in the same fight.',
        passiveText: 'Passive — First Command: The first ally damage buff you give each round also gives Block 2.'
      },
      {
        level: 2,
        unlock: 'Win a fight where every living survivor dealt damage.',
        passiveText: 'Passive — Fire Has Subjects: When another survivor damages the quarry, your next Grand Weapon attack deals +2 damage.'
      },
      {
        level: 3,
        unlock: 'Defeat the Drake Emperor after every living survivor dealt damage that fight.',
        passiveText: 'Passive — Imperial Command Round: Once per fight, declare a command round. Every survivor’s first attack this round deals +2 damage and applies Burn 1. If all living survivors hit this round, draw 2 cards.'
      }
    ],
    keywords: ['Signature', 'Emperor', 'Drake', 'Command', 'Grand Weapon'],
    implemented: true
  },
  {
    id: 'noon_shell_bulwark',
    name: 'Noon-Shell Bulwark',
    itemType: 'weapon',
    loadoutCategory: 'weapon',
    slot: 'weapon',
    weaponType: 'shield',
    hands: 1,
    quarryId: 'sunSovereign',
    buildingId: 'shellSanctum',
    locationId: 'shellSanctum',
    craftingLocationId: 'shellSanctum',
    cost: {
      sunShell: 3,
      blindingScale: 2,
      radiantEye: 2,
      solarIchor: 1,
      warmPearl: 1,
      captiveNoon: 1,
      hide: 2
    },
    cardPackage: [
      'signature_noon_bash',
      'signature_blinding_guard',
      'signature_mirror_return'
    ],
    passiveText: 'Passive — Covered Radiance: If you have not attacked this round, gain Block 1 when targeted.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Cause the quarry to miss or be redirected away from this survivor 3 times.',
        passiveText: 'Passive — Bright Without Looking: When the quarry misses this survivor, apply Vulnerable 1.'
      },
      {
        level: 2,
        unlock: 'Win with this survivor taking no HP damage.',
        passiveText: 'Passive — Shell of Noon: The first defensive card you play each round reflects 2 damage.'
      },
      {
        level: 3,
        unlock: 'Defeat the Sun Sovereign after reflecting damage twice in that fight.',
        passiveText: 'Passive — Noon Cannot Be Struck: Once per fight, cancel all damage from one quarry attack against this survivor, gain Block 5, and reflect damage equal to half your Block, max 10.'
      }
    ],
    keywords: ['Signature', 'Sovereign', 'Radiant', 'Block', 'Shield'],
    implemented: true
  },
  {
    id: 'judgement_crown_helm',
    name: 'Judgement Crown Helm',
    itemType: 'armor',
    loadoutCategory: 'armor',
    slot: 'armor',
    bodySlot: 'head',
    hands: 0,
    quarryId: 'prideKing',
    buildingId: 'prideHall',
    locationId: 'prideHall',
    craftingLocationId: 'prideHall',
    cost: {
      prideMane: 3,
      regalHide: 2,
      kingClaw: 1,
      goldenFang: 2,
      judgmentEye: 1,
      crownHeart: 1,
      hide: 2,
      bone: 2
    },
    cardPackage: [
      'signature_stand_before_the_king',
      'signature_judgement_sight',
      'signature_crown_still_stands'
    ],
    passiveText: 'Passive — Measured Worth: When this survivor is targeted, gain Block 2. If this survivor made the first attack this round, gain +1 Survival.',
    evolutionMilestones: [
      {
        level: 1,
        unlock: 'Be targeted 6 times across hunts while wearing this armour and survive each fight.',
        passiveText: 'Passive — First to Be Weighed: When this survivor is targeted, gain Block 3 instead of Block 2.'
      },
      {
        level: 2,
        unlock: 'Win a fight where this survivor is targeted at least 3 times and is never reduced to 0 HP.',
        passiveText: 'Passive — No Kneeling: Once per round, when this survivor is targeted, draw 1 card, then discard 1 card. Their next attack deals +2 damage.'
      },
      {
        level: 3,
        unlock: 'Defeat the Pride King after this survivor made the first attack of the fight and survived being targeted.',
        passiveText: 'Passive — The Crown Refuses: Once per fight, when a quarry attack would reduce this survivor to 0 HP, prevent that damage, set them to 1 HP, gain Block 6, and their next attack deals +4 damage.'
      }
    ],
    keywords: ['Signature', 'King', 'Regal', 'Armor', 'Head'],
    implemented: true
  }
];
