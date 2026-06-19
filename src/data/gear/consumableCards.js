export const consumableCards = {
  // D1. Standard cheap consumables
  consumable_bone_broth: {
    id: 'consumable_bone_broth',
    name: 'Bone Broth Flask',
    cost: 1,
    description: 'Heal 4 HP. Gain 1 Survival. Lost.',
    effects: [
      { type: 'healSelf', amount: 4 },
      { type: 'survival', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'bone_broth_flask',
    implemented: true
  },
  consumable_hide_poultice: {
    id: 'consumable_hide_poultice',
    name: 'Hide Poultice',
    cost: 1,
    description: 'Heal 2 HP. Remove Bleed 2. Lost.',
    effects: [
      { type: 'healSelf', amount: 2 },
      { type: 'reduceBleedSelf', amount: 2 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'hide_poultice',
    implemented: true
  },
  consumable_sinew_stitch: {
    id: 'consumable_sinew_stitch',
    name: 'Sinew Stitch Kit',
    cost: 1,
    description: 'Prevent the next 5 damage this survivor would take. Lost.',
    effects: [
      { type: 'block', amount: 5 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'sinew_stitch_kit',
    implemented: true
  },
  consumable_scrap_flashpot: {
    id: 'consumable_scrap_flashpot',
    name: 'Scrap Flashpot',
    cost: 1,
    description: 'Apply Blind 1 and Vulnerable 1. Lost.',
    effects: [
      { type: 'blindTarget', amount: 1 },
      { type: 'vulnerableTarget', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'scrap_flashpot',
    implemented: true
  },
  consumable_bone_needle: {
    id: 'consumable_bone_needle',
    name: 'Bone Needle Tonic',
    cost: 0,
    description: 'Draw 2 cards. Discard 1 card. Lost.',
    effects: [
      { type: 'draw', amount: 2 },
      { type: 'discard' }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'bone_needle_tonic',
    implemented: true
  },
  consumable_charred_meat: {
    id: 'consumable_charred_meat',
    name: 'Charred Meat Strip',
    cost: 0,
    description: 'Gain 2 Survival. Your next attack this round deals +2 damage. Lost.',
    effects: [
      { type: 'survival', amount: 2 },
      { type: 'nextAttackBonus', amount: 2 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'charred_meat_strip',
    implemented: true
  },
  consumable_hide_smoke: {
    id: 'consumable_hide_smoke',
    name: 'Hide Smoke Wrap',
    cost: 1,
    description: 'Gain Target Avoidance and 3 Block. Lost.',
    effects: [
      { type: 'targetAvoidance', amount: 1 },
      { type: 'block', amount: 3 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'hide_smoke_wrap',
    implemented: true
  },

  // D2. Quarry common drops
  consumable_pale_mane_warpaint: {
    id: 'consumable_pale_mane_warpaint',
    name: 'Pale Mane Warpaint',
    cost: 1,
    description: 'Apply Bleed 2. Your next attack this round deals +2 damage. Lost.',
    effects: [
      { type: 'bleedTarget', amount: 2 },
      { type: 'nextAttackBonus', amount: 2 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'pale_mane_warpaint',
    implemented: true
  },
  consumable_screaming_jerky: {
    id: 'consumable_screaming_jerky',
    name: 'Screaming Jerky',
    cost: 1,
    description: 'Gain 3 Survival. Draw 1 card. Your next Fist & Tooth attack deals +2 damage. Lost.',
    effects: [
      { type: 'survival', amount: 3 },
      { type: 'draw', amount: 1 },
      { type: 'nextAttackBonus', amount: 2 } // simple fallback for Fist & Tooth
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'screaming_jerky',
    implemented: true
  },
  consumable_ashwake_powder: {
    id: 'consumable_ashwake_powder',
    name: 'Ashwake Powder',
    cost: 1,
    description: 'Return 1 attack card from discard to hand. It costs 1 less this turn. Lost.',
    effects: [
      { type: 'returnFromDiscard', filter: 'attack', costReduction: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'ashwake_powder',
    implemented: true
  },
  consumable_thunder_gland_ampoule: {
    id: 'consumable_thunder_gland_ampoule',
    name: 'Thunder-Gland Ampoule',
    cost: 1,
    description: 'Gain Charge 3. Apply Shock 1. Lost.',
    effects: [
      { type: 'gainCharge', amount: 3 },
      { type: 'shockTarget', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'thunder_gland_ampoule',
    implemented: true
  },
  consumable_blood_mud_coagulant: {
    id: 'consumable_blood_mud_coagulant',
    name: 'Blood-Mud Coagulant',
    cost: 1,
    description: 'Apply Bleed 1 and Vulnerable 1. Gain 3 Block. Lost.',
    effects: [
      { type: 'bleedTarget', amount: 1 },
      { type: 'vulnerableTarget', amount: 1 },
      { type: 'block', amount: 3 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'blood_mud_coagulant',
    implemented: true
  },
  consumable_rubbery_antidote: {
    id: 'consumable_rubbery_antidote',
    name: 'Rubbery Antidote',
    cost: 1,
    description: 'Remove Poison from this survivor. Heal 3 HP. Apply Poison 1 to the quarry. Lost.',
    effects: [
      { type: 'removePoisonSelf' },
      { type: 'healSelf', amount: 3 },
      { type: 'poisonTarget', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'rubbery_antidote',
    implemented: true
  },
  consumable_silk_binding_wrap: {
    id: 'consumable_silk_binding_wrap',
    name: 'Silk Binding Wrap',
    cost: 1,
    description: 'Apply Snared 2. Gain 4 Block. Lost.',
    effects: [
      { type: 'snareMonster', amount: 2 },
      { type: 'block', amount: 4 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'silk_binding_wrap',
    implemented: true
  },
  consumable_petal_focus_draught: {
    id: 'consumable_petal_focus_draught',
    name: 'Petal Focus Draught',
    cost: 1,
    description: 'Your next single attack this turn deals +4 damage. If it hits, apply Vulnerable 1. Lost.',
    effects: [
      { type: 'nextAttackBonus', amount: 4 },
      { type: 'nextAttackMarksVulnerable', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'petal_focus_draught',
    implemented: true
  },
  consumable_sootlung_inhaler: {
    id: 'consumable_sootlung_inhaler',
    name: 'Sootlung Inhaler',
    cost: 1,
    description: 'Apply Burn 1 and Poison 1. Gain Target Avoidance. Lost.',
    effects: [
      { type: 'burnTarget', amount: 1 },
      { type: 'poisonTarget', amount: 1 },
      { type: 'targetAvoidance', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'sootlung_inhaler',
    implemented: true
  },
  consumable_resin_hardener: {
    id: 'consumable_resin_hardener',
    name: 'Resin Hardener',
    cost: 1,
    description: 'Gain 8 Block. Your next attack deals +1 damage if you still have Block. Lost.',
    effects: [
      { type: 'block', amount: 8 },
      { type: 'nextAttackBonusIfBlock', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'resin_hardener',
    implemented: true
  },
  consumable_drakefire_oil: {
    id: 'consumable_drakefire_oil',
    name: 'Drakefire Oil',
    cost: 1,
    description: 'Your next attack deals +4 damage and applies Burn 2. Lost.',
    effects: [
      { type: 'nextAttackBonus', amount: 4 },
      { type: 'nextAttackAppliesBurn', amount: 2 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'drakefire_oil',
    implemented: true
  },
  consumable_sun_shell_glare_dust: {
    id: 'consumable_sun_shell_glare_dust',
    name: 'Sun-Shell Glare Dust',
    cost: 1,
    description: 'Apply Blind 2. Gain 4 Block. Lost.',
    effects: [
      { type: 'blindTarget', amount: 2 },
      { type: 'block', amount: 4 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'sun_shell_glare_dust',
    implemented: true
  },
  consumable_regal_blood_salve: {
    id: 'consumable_regal_blood_salve',
    name: 'Regal Blood Salve',
    cost: 1,
    description: 'Gain 4 Block and 2 Survival. If targeted this round, draw 1 card. Lost.',
    effects: [
      { type: 'block', amount: 4 },
      { type: 'survival', amount: 2 },
      { type: 'drawIfTargeted', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'regal_blood_salve',
    implemented: true
  },

  // D3. Quarry rare drops
  consumable_elder_fang_oil: {
    id: 'consumable_elder_fang_oil',
    name: 'Elder Fang Oil',
    cost: 1,
    description: 'Apply Bleed 3. Your next Axe attack deals +5 damage. Lost.',
    effects: [
      { type: 'bleedTarget', amount: 3 },
      { type: 'nextAxeAttackBonus', amount: 5 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'elder_fang_oil',
    implemented: true
  },
  consumable_stomach_stone_feast: {
    id: 'consumable_stomach_stone_feast',
    name: 'Stomach-Stone Feast',
    cost: 1,
    description: 'Gain 4 Survival. Draw 2 cards. Consumables you use this round give +2 more to one number they grant. Lost.',
    effects: [
      { type: 'survival', amount: 4 },
      { type: 'draw', amount: 2 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'stomach_stone_feast',
    implemented: true
  },
  consumable_memory_glass_shard: {
    id: 'consumable_memory_glass_shard',
    name: 'Memory Glass Shard',
    cost: 1,
    description: 'Play 1 card from discard for free. Then remove that card from combat until the fight ends. Lost.',
    effects: [
      { type: 'playFromDiscardFreeAndExhaust' }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'memory_glass_shard',
    implemented: true
  },
  consumable_cracked_molar_battery: {
    id: 'consumable_cracked_molar_battery',
    name: 'Cracked Molar Battery',
    cost: 1,
    description: 'Gain Charge 5. Apply Shock 2 and Vulnerable 1. Lost.',
    effects: [
      { type: 'gainCharge', amount: 5 },
      { type: 'shockTarget', amount: 2 },
      { type: 'vulnerableTarget', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'cracked_molar_battery',
    implemented: true
  },
  consumable_red_leather_tourniquet: {
    id: 'consumable_red_leather_tourniquet',
    name: 'Red Leather Tourniquet',
    cost: 1,
    description: 'Remove all Bleed from one survivor. Apply that much Bleed to the quarry, max 5. Lost.',
    effects: [
      { type: 'removeBleedSelfToMonster', max: 5 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'red_leather_tourniquet',
    implemented: true
  },
  consumable_bulging_eye_extract: {
    id: 'consumable_bulging_eye_extract',
    name: 'Bulging Eye Extract',
    cost: 1,
    description: 'Apply Poison 3. Apply Vulnerable 1. The quarry is less likely to target this survivor this round. Lost.',
    effects: [
      { type: 'poisonTarget', amount: 3 },
      { type: 'vulnerableTarget', amount: 1 },
      { type: 'targetAvoidance', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'bulging_eye_extract',
    implemented: true
  },
  consumable_spider_eye_thread: {
    id: 'consumable_spider_eye_thread',
    name: 'Spider-Eye Thread',
    cost: 1,
    description: 'Apply Snared 3 and Poison 1. Draw 1 card. Lost.',
    effects: [
      { type: 'snareMonster', amount: 3 },
      { type: 'poisonTarget', amount: 1 },
      { type: 'draw', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'spider_eye_thread',
    implemented: true
  },
  consumable_knight_seed_elixir: {
    id: 'consumable_knight_seed_elixir',
    name: 'Knight-Seed Elixir',
    cost: 1,
    description: 'Your next single attack this turn deals +6 damage. If it hits, apply Vulnerable 2. Lost.',
    effects: [
      { type: 'nextAttackBonus', amount: 6 },
      { type: 'nextAttackMarksVulnerable', amount: 2 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'knight_seed_elixir',
    implemented: true
  },
  consumable_choking_mask_filter: {
    id: 'consumable_choking_mask_filter',
    name: 'Choking Mask Filter',
    cost: 1,
    description: 'Apply Burn 2, Poison 2, and Blind 1. Lost.',
    effects: [
      { type: 'burnTarget', amount: 2 },
      { type: 'poisonTarget', amount: 2 },
      { type: 'blindTarget', amount: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'choking_mask_filter',
    implemented: true
  },
  consumable_resin_blood_plate_seal: {
    id: 'consumable_resin_blood_plate_seal',
    name: 'Resin-Blood Plate Seal',
    cost: 1,
    description: 'Gain 12 Block. Until the next quarry action, Block does not decay. Lost.',
    effects: [
      { type: 'block', amount: 12 },
      { type: 'blockDoesNotDecayThisRound' }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'resin_blood_plate_seal',
    implemented: true
  },
  consumable_molten_eye_spark: {
    id: 'consumable_molten_eye_spark',
    name: 'Molten Eye Spark',
    cost: 1,
    description: 'All survivors’ next attacks this round deal +3 damage. Apply Burn 1 after each hit. Lost.',
    effects: [
      { type: 'partyEffect', target: 'all', effectType: 'nextAttackBonus', value: 3 },
      { type: 'partyEffect', target: 'all', effectType: 'nextAttackAppliesBurn', value: 1 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'molten_eye_spark',
    implemented: true
  },
  consumable_warm_pearl_lens: {
    id: 'consumable_warm_pearl_lens',
    name: 'Warm Pearl Lens',
    cost: 1,
    description: 'Cancel the next hit against this survivor. Reflect 5 damage. Lost.',
    effects: [
      { type: 'block', amount: 5 } // simple representation: block next hit
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'warm_pearl_lens',
    implemented: true
  },
  consumable_judgement_eye_draught: {
    id: 'consumable_judgement_eye_draught',
    name: 'Judgement Eye Draught',
    cost: 1,
    description: 'This survivor is more likely to be targeted. Gain 10 Block. Their next attack deals +5 damage. Lost.',
    effects: [
      { type: 'drawMonsterTarget' },
      { type: 'block', amount: 10 },
      { type: 'nextAttackBonus', amount: 5 }
    ],
    type: 'skill',
    tags: ['consumable', 'singleUse', 'lost'],
    sourceType: 'equipment',
    sourceGearId: 'judgement_eye_draught',
    implemented: true
  }
};
