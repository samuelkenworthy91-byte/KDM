export const signatureCards = {
  // 1. Lion Trophy Hall / Palechord Cleaver
  signature_raking_chord: {
    id: 'signature_raking_chord',
    name: 'Raking Chord',
    cost: 0,
    description: 'Deal 3 damage. Apply Bleed 1.',
    effects: [
      { type: 'damage', amount: 3 },
      { type: 'bleedMonster', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'axe', 'bleed', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'palechord_cleaver',
    weaponType: 'axe',
    implemented: true
  },
  signature_feedback_guard: {
    id: 'signature_feedback_guard',
    name: 'Feedback Guard',
    cost: 0,
    description: 'Apply Bleed 1. Gain 3 Block.',
    effects: [
      { type: 'bleedMonster', amount: 1 },
      { type: 'block', amount: 3 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'axe', 'bleed', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'palechord_cleaver',
    weaponType: 'axe',
    implemented: true
  },
  signature_cleaver_solo: {
    id: 'signature_cleaver_solo',
    name: 'Cleaver Solo',
    cost: 0,
    description: 'Deal 2 damage. Deal +1 more damage for each Bleed on the quarry, max +5.',
    effects: [
      { type: 'damage', amount: 2, bonusPerBleed: 1, maximumBonus: 5 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'axe', 'bleed', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'palechord_cleaver',
    weaponType: 'axe',
    implemented: true
  },

  // 2. Antelope Larder / Gorge-Fist Knucklers
  signature_gut_punch: {
    id: 'signature_gut_punch',
    name: 'Gut Punch',
    cost: 0,
    description: 'Deal 3 damage. If you used a consumable this turn, deal +2 damage.',
    effects: [
      { type: 'damage', amount: 3, bonusIfConsumableUsed: 2 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'fistAndTooth', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'gorge_fist_knucklers',
    weaponType: 'fistAndTooth',
    implemented: true
  },
  signature_ration_crush: {
    id: 'signature_ration_crush',
    name: 'Ration Crush',
    cost: 0,
    description: 'You may play 1 consumable from hand. Gain 4 Block.',
    effects: [
      { type: 'playConsumableFromHand' },
      { type: 'block', amount: 4 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'fistAndTooth', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'gorge_fist_knucklers',
    weaponType: 'fistAndTooth',
    implemented: true
  },
  signature_second_stomach: {
    id: 'signature_second_stomach',
    name: 'Second Stomach',
    cost: 0,
    description: 'Return 1 consumable card from Lost or discard to hand, or gain 2 Survival.',
    effects: [
      { type: 'secondStomach' }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'fistAndTooth', 'survival', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'gorge_fist_knucklers',
    weaponType: 'fistAndTooth',
    implemented: true
  },

  // 3. Phoenix Pyre / Ash-Second Spear
  signature_ash_thrust: {
    id: 'signature_ash_thrust',
    name: 'Ash Thrust',
    cost: 0,
    description: 'Deal 3 damage. If you have already played Ash Thrust this fight, deal +2 damage.',
    effects: [
      { type: 'damage', amount: 3, bonusIfAshThrustPlayed: 2 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'spear', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'ash_second_spear',
    weaponType: 'spear',
    implemented: true
  },
  signature_second_ember: {
    id: 'signature_second_ember',
    name: 'Second Ember',
    cost: 0,
    description: 'Play an attack card from discard. It deals -1 damage.',
    effects: [
      { type: 'playFromDiscard', filter: 'attack', damageModifier: -1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'spear', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'ash_second_spear',
    weaponType: 'spear',
    implemented: true
  },
  signature_burning_recall: {
    id: 'signature_burning_recall',
    name: 'Burning Recall',
    cost: 0,
    description: 'Return 1 attack card from discard to hand. Take 1 damage.',
    effects: [
      { type: 'returnFromDiscard', filter: 'attack', takeDamage: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'spear', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'ash_second_spear',
    weaponType: 'spear',
    implemented: true
  },

  // 4. Storm Shrine / Stormglass Lantern
  signature_bottle_lightning: {
    id: 'signature_bottle_lightning',
    name: 'Bottle Lightning',
    cost: 0,
    description: 'Gain Charge 2. If you have Charge 3+, apply Shock 1.',
    effects: [
      { type: 'gainCharge', amount: 2 },
      { type: 'shockTargetIfCharge3', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'tool', 'charge', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'stormglass_lantern',
    implemented: true
  },
  signature_lantern_surge: {
    id: 'signature_lantern_surge',
    name: 'Lantern Surge',
    cost: 0,
    description: 'Spend up to 3 Charge. Gain 3 Block for each Charge spent.',
    effects: [
      { type: 'spendChargeForBlock', rate: 3, maxSpend: 3 }
    ],
    type: 'skill',
    tags: ['gear', 'tool', 'block', 'charge', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'stormglass_lantern',
    implemented: true
  },
  signature_white_flash: {
    id: 'signature_white_flash',
    name: 'White Flash',
    cost: 0,
    description: 'Spend Charge 3. Apply Shock 2 and Vulnerable 1.',
    effects: [
      { type: 'spendCharge', amount: 3 },
      { type: 'shockTarget', amount: 2 },
      { type: 'vulnerableTarget', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'tool', 'charge', 'shock', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'stormglass_lantern',
    implemented: true
  },

  // 5. Red Tannery / Redwater Toothsaw
  signature_river_tooth_slash: {
    id: 'signature_river_tooth_slash',
    name: 'River-Tooth Slash',
    cost: 0,
    description: 'Deal 3 damage. Apply Bleed 1.',
    effects: [
      { type: 'damage', amount: 3 },
      { type: 'bleedMonster', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'sword', 'bleed', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'redwater_toothsaw',
    weaponType: 'sword',
    implemented: true
  },
  signature_undertow_hook: {
    id: 'signature_undertow_hook',
    name: 'Undertow Hook',
    cost: 0,
    description: 'Deal 2 damage. Apply Vulnerable 1.',
    effects: [
      { type: 'damage', amount: 2 },
      { type: 'vulnerableMonster', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'sword', 'vulnerable', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'redwater_toothsaw',
    weaponType: 'sword',
    implemented: true
  },
  signature_death_roll: {
    id: 'signature_death_roll',
    name: 'Death Roll',
    cost: 0,
    description: 'Deal 2 damage. If the quarry has Bleed, deal +4 damage.',
    effects: [
      { type: 'damage', amount: 2, bonusIfMonsterBleeding: 4 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'sword', 'bleed', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'redwater_toothsaw',
    weaponType: 'sword',
    implemented: true
  },

  // 6. Wet Yard / Croakspike Lash
  signature_tongue_lash: {
    id: 'signature_tongue_lash',
    name: 'Tongue Lash',
    cost: 0,
    description: 'Deal 2 damage. Apply Poison 1.',
    effects: [
      { type: 'damage', amount: 2 },
      { type: 'poisonMonster', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'whip', 'poison', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'croakspike_lash',
    weaponType: 'whip',
    implemented: true
  },
  signature_wet_yank: {
    id: 'signature_wet_yank',
    name: 'Wet Yank',
    cost: 0,
    description: 'Apply Poison 1 and Snared 1. Draw 1 card.',
    effects: [
      { type: 'poisonMonster', amount: 1 },
      { type: 'snareMonster', amount: 1 },
      { type: 'draw', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'whip', 'poison', 'snare', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'croakspike_lash',
    weaponType: 'whip',
    implemented: true
  },
  signature_venom_slap: {
    id: 'signature_venom_slap',
    name: 'Venom Slap',
    cost: 0,
    description: 'Deal 3 damage. If the quarry has Poison, apply Staggered 1.',
    effects: [
      { type: 'damage', amount: 3 },
      { type: 'staggerTargetIfMonsterPoisoned', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'whip', 'poison', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'croakspike_lash',
    weaponType: 'whip',
    implemented: true
  },

  // 7. Silk Loom / Widowline Needles
  signature_needle_flurry: {
    id: 'signature_needle_flurry',
    name: 'Needle Flurry',
    cost: 0,
    description: 'Deal 1 damage twice.',
    effects: [
      { type: 'multiHitDamage', amount: 1, hits: 2 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'dagger', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'widowline_needles',
    weaponType: 'dagger',
    implemented: true
  },
  signature_binding_stitch: {
    id: 'signature_binding_stitch',
    name: 'Binding Stitch',
    cost: 0,
    description: 'Apply Snared 1. Gain 4 Block.',
    effects: [
      { type: 'snareMonster', amount: 1 },
      { type: 'block', amount: 4 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'dagger', 'snare', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'widowline_needles',
    weaponType: 'dagger',
    implemented: true
  },
  signature_silk_reversal: {
    id: 'signature_silk_reversal',
    name: 'Silk Reversal',
    cost: 0,
    description: 'Reduce the next damage you take by 3. Apply Snared 1.',
    effects: [
      { type: 'block', amount: 3 },
      { type: 'snareMonster', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'dagger', 'snare', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'widowline_needles',
    weaponType: 'dagger',
    implemented: true
  },

  // 8. Duelist Garden / Thorn-Saint Katana
  signature_petal_draw: {
    id: 'signature_petal_draw',
    name: 'Petal Draw',
    cost: 0,
    description: 'Deal 4 damage. If this is your only attack this turn, apply Vulnerable 1.',
    effects: [
      { type: 'damage', amount: 4 },
      { type: 'vulnerableIfOnlyAttack', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'katana', 'vulnerable', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'thorn_saint_katana',
    weaponType: 'katana',
    implemented: true
  },
  signature_duelist_breath: {
    id: 'signature_duelist_breath',
    name: 'Duelist’s Breath',
    cost: 0,
    description: 'Gain 4 Block. Your next single attack this turn deals +2 damage.',
    effects: [
      { type: 'block', amount: 4 },
      { type: 'nextAttackBonus', amount: 2 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'katana', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'thorn_saint_katana',
    weaponType: 'katana',
    implemented: true
  },
  signature_thorn_riposte: {
    id: 'signature_thorn_riposte',
    name: 'Thorn Riposte',
    cost: 0,
    description: 'If you have Block, deal 3 damage after the quarry attacks you.',
    effects: [
      { type: 'damageIfBlock', amount: 3 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'katana', 'counter', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'thorn_saint_katana',
    weaponType: 'katana',
    implemented: true
  },

  // 9. Smog Kiln / Blacklung Recurve
  signature_soot_arrow: {
    id: 'signature_soot_arrow',
    name: 'Soot Arrow',
    cost: 0,
    description: 'Deal 2 damage. Apply Burn 1 or Poison 1.',
    effects: [
      { type: 'damage', amount: 2 },
      { type: 'applyBurnOrPoison', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'bow', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'blacklung_recurve',
    weaponType: 'bow',
    implemented: true
  },
  signature_choking_shot: {
    id: 'signature_choking_shot',
    name: 'Choking Shot',
    cost: 0,
    description: 'If the quarry has a damage-over-time status, apply a different damage-over-time status at 1.',
    effects: [
      { type: 'applyDifferentDoT', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'bow', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'blacklung_recurve',
    weaponType: 'bow',
    implemented: true
  },
  signature_smoke_cover: {
    id: 'signature_smoke_cover',
    name: 'Smoke Cover',
    cost: 0,
    description: 'Gain Target Avoidance. Draw 1 card.',
    effects: [
      { type: 'targetAvoidance', amount: 1 },
      { type: 'draw', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'bow', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'blacklung_recurve',
    weaponType: 'bow',
    implemented: true
  },

  // 10. Chitin Foundry / Carapace Katars
  signature_horn_jab: {
    id: 'signature_horn_jab',
    name: 'Horn Jab',
    cost: 0,
    description: 'Deal 2 damage. Draw 1 card if you already played a Katar card this turn.',
    effects: [
      { type: 'damage', amount: 2 },
      { type: 'drawIfKatarPlayed', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'katar', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'carapace_katars',
    weaponType: 'katar',
    implemented: true
  },
  signature_resin_catch: {
    id: 'signature_resin_catch',
    name: 'Resin Catch',
    cost: 0,
    description: 'Deal 2 damage. Gain 3 Block.',
    effects: [
      { type: 'damage', amount: 2 },
      { type: 'block', amount: 3 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'katar', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'carapace_katars',
    weaponType: 'katar',
    implemented: true
  },
  signature_twin_plate_cut: {
    id: 'signature_twin_plate_cut',
    name: 'Twin Plate Cut',
    cost: 0,
    description: 'Deal 3 damage. If you already played a Katar card this turn, deal +3 damage.',
    effects: [
      { type: 'damage', amount: 3, bonusIfKatarPlayed: 3 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'katar', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'carapace_katars',
    weaponType: 'katar',
    implemented: true
  },

  // 11. Crystal Forge / Dragon Slayer: Grand Cleaver
  signature_ember_decree: {
    id: 'signature_ember_decree',
    name: 'Ember Decree',
    cost: 0,
    description: 'Deal 6 damage. Apply Burn 1.',
    effects: [
      { type: 'damage', amount: 6 },
      { type: 'burnTarget', amount: 1 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'grandWeapon', 'burn', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'dragon_slayer_grand_cleaver',
    weaponType: 'grandWeapon',
    implemented: true
  },
  signature_royal_heat: {
    id: 'signature_royal_heat',
    name: 'Royal Heat',
    cost: 0,
    description: 'Another survivor’s next attack deals +3 damage.',
    effects: [
      { type: 'partyEffect', target: 'nextPartyMember', effectType: 'nextAttackBonus', value: 3 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'grandWeapon', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'dragon_slayer_grand_cleaver',
    weaponType: 'grandWeapon',
    implemented: true
  },
  signature_crownfire_cleave: {
    id: 'signature_crownfire_cleave',
    name: 'Crownfire Cleave',
    cost: 0,
    description: 'Deal 5 damage. If another survivor dealt damage this round, deal +3 damage.',
    effects: [
      { type: 'damage', amount: 5, bonusIfAllyDealtDamage: 3 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'grandWeapon', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'dragon_slayer_grand_cleaver',
    weaponType: 'grandWeapon',
    implemented: true
  },

  // 12. Shell Sanctum / Noon-Shell Bulwark
  signature_noon_bash: {
    id: 'signature_noon_bash',
    name: 'Noon Bash',
    cost: 0,
    description: 'Deal damage equal to half your Block, max 6.',
    effects: [
      { type: 'damageFromBlock', divisor: 2, maximum: 6 }
    ],
    type: 'attack',
    tags: ['gear', 'weapon', 'shield', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'noon_shell_bulwark',
    weaponType: 'shield',
    implemented: true
  },
  signature_blinding_guard: {
    id: 'signature_blinding_guard',
    name: 'Blinding Guard',
    cost: 0,
    description: 'Gain 5 Block and Target Avoidance.',
    effects: [
      { type: 'block', amount: 5 },
      { type: 'targetAvoidance', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'shield', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'noon_shell_bulwark',
    weaponType: 'shield',
    implemented: true
  },
  signature_mirror_return: {
    id: 'signature_mirror_return',
    name: 'Mirror Return',
    cost: 0,
    description: 'Gain 3 Block. If hit this round, reflect 2 damage.',
    effects: [
      { type: 'block', amount: 3 },
      { type: 'reflectDamageIfHit', amount: 2 }
    ],
    type: 'skill',
    tags: ['gear', 'weapon', 'shield', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'noon_shell_bulwark',
    weaponType: 'shield',
    implemented: true
  },

  // 13. Pride Hall / Judgement Crown Helm
  signature_stand_before_the_king: {
    id: 'signature_stand_before_the_king',
    name: 'Stand Before the King',
    cost: 0,
    description: 'Gain 5 Block. Until the next quarry action, this survivor is more likely to be targeted.',
    effects: [
      { type: 'block', amount: 5 },
      { type: 'drawMonsterTarget' }
    ],
    type: 'skill',
    tags: ['gear', 'armor', 'head', 'block', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'judgement_crown_helm',
    implemented: true
  },
  signature_judgement_sight: {
    id: 'signature_judgement_sight',
    name: 'Judgement Sight',
    cost: 0,
    description: 'Apply Vulnerable 1. Draw 1 card if this survivor has been targeted this round.',
    effects: [
      { type: 'vulnerableTarget', amount: 1 },
      { type: 'drawIfTargeted', amount: 1 }
    ],
    type: 'skill',
    tags: ['gear', 'armor', 'head', 'vulnerable', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'judgement_crown_helm',
    implemented: true
  },
  signature_crown_still_stands: {
    id: 'signature_crown_still_stands',
    name: 'Crown Still Stands',
    cost: 0,
    description: 'Gain 2 Survival. If this survivor has Block, their next attack deals +3 damage.',
    effects: [
      { type: 'survival', amount: 2 },
      { type: 'nextAttackBonusIfBlock', amount: 3 }
    ],
    type: 'skill',
    tags: ['gear', 'armor', 'head', 'survival', 'signature'],
    sourceType: 'equipment',
    sourceGearId: 'judgement_crown_helm',
    implemented: true
  }
};
