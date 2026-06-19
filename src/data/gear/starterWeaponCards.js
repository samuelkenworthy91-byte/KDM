function starterWeaponCard(id, name, sourceGearId, weaponType, effects, description, tags = []) {
  return {
    id,
    name,
    cost: 1,
    description,
    effects,
    type: effects.some(effect => effect.type === 'damage' || effect.type === 'multiHitDamage') ? 'attack' : 'skill',
    tags: ['gear', 'weapon', weaponType, 'starter', ...tags],
    sourceType: 'equipment',
    sourceGearId,
    weaponType,
    implemented: true
  };
}

export const starterWeaponCards = {
  starter_sword_cut: starterWeaponCard(
    'starter_sword_cut',
    'Clean Cut',
    'starter_sword',
    'sword',
    [{ type: 'damage', amount: 4 }],
    'Deal 4 damage.',
    ['precise']
  ),
  starter_dagger_flurry: starterWeaponCard(
    'starter_dagger_flurry',
    'Bone Flurry',
    'starter_dagger',
    'dagger',
    [{ type: 'multiHitDamage', amount: 2, hits: 2 }],
    'Deal 2 damage twice.',
    ['quick']
  ),
  starter_axe_split: starterWeaponCard(
    'starter_axe_split',
    'Scrap Split',
    'starter_axe',
    'axe',
    [{ type: 'damage', amount: 5 }, { type: 'removeMonsterBlock', amount: 1 }],
    'Deal 5 damage. Remove 1 monster block.',
    ['heavy', 'breaker']
  ),
  starter_spear_brace: starterWeaponCard(
    'starter_spear_brace',
    'Long Brace',
    'starter_spear',
    'spear',
    [{ type: 'damage', amount: 3 }, { type: 'block', amount: 2 }],
    'Deal 3 damage. Gain 2 Block.',
    ['reach']
  ),
  starter_bow_shot: starterWeaponCard(
    'starter_bow_shot',
    'Lantern Shot',
    'starter_bow',
    'bow',
    [{ type: 'damage', amount: 3 }, { type: 'markMonster' }],
    'Deal 3 damage. Mark the monster.',
    ['ranged', 'marked']
  ),
  starter_shield_bash: starterWeaponCard(
    'starter_shield_bash',
    'Shield Bash',
    'starter_shield',
    'shield',
    [{ type: 'block', amount: 4 }, { type: 'damage', amount: 2 }],
    'Gain 4 Block. Deal 2 damage.',
    ['block']
  ),
  starter_grand_weapon_swing: starterWeaponCard(
    'starter_grand_weapon_swing',
    'Heavy Swing',
    'starter_grand_weapon',
    'grandWeapon',
    [{ type: 'damage', amount: 8 }],
    'Deal 8 damage.',
    ['heavy']
  ),
  starter_fist_wraps_combo: starterWeaponCard(
    'starter_fist_wraps_combo',
    'Knuckle Combo',
    'starter_fist_wraps',
    'fistAndTooth',
    [{ type: 'multiHitDamage', amount: 2, hits: 2 }, { type: 'block', amount: 1 }],
    'Deal 2 damage twice. Gain 1 Block.',
    ['quick', 'counter']
  ),
  starter_katars_rake: starterWeaponCard(
    'starter_katars_rake',
    'Twin Rake',
    'starter_katars',
    'katar',
    [{ type: 'multiHitDamage', amount: 2, hits: 2 }, { type: 'markMonster' }],
    'Deal 2 damage twice. Mark the monster.',
    ['quick', 'multiHit']
  ),
  starter_katana_draw: starterWeaponCard(
    'starter_katana_draw',
    'First Draw',
    'starter_katana',
    'katana',
    [{ type: 'damage', amount: 5 }],
    'Deal 5 damage.',
    ['precise', 'firstStrike']
  )
};
