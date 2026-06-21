const starterWeaponDefinitions = [
  ['starter_sword', 'Basic Sword', 'sword', 1, { bone: 1, scrap: 1 }, ['starter_sword_cut']],
  ['starter_dagger', 'Basic Dagger', 'dagger', 1, { bone: 1 }, ['starter_dagger_flurry']],
  ['starter_axe', 'Basic Axe', 'axe', 1, { bone: 1, scrap: 1 }, ['starter_axe_split']],
  ['starter_spear', 'Basic Spear', 'spear', 1, { bone: 1, sinew: 1 }, ['starter_spear_brace']],
  ['starter_bow', 'Basic Bow', 'bow', 2, { bone: 1, sinew: 1 }, ['starter_bow_shot']],
  ['starter_shield', 'Basic Shield', 'shield', 1, { hide: 1, bone: 1 }, ['starter_shield_bash']],
  ['starter_grand_weapon', 'Basic Grand Weapon', 'grandWeapon', 2, { bone: 2, scrap: 1 }, ['starter_grand_weapon_swing']],
  ['starter_fist_wraps', 'Basic Fist Wraps', 'fistAndTooth', 1, { hide: 1, sinew: 1 }, ['starter_fist_wraps_combo']],
  ['starter_katars', 'Basic Katars', 'katar', 1, { bone: 1, scrap: 1 }, ['starter_katars_rake']],
  ['starter_katana', 'Basic Katana', 'katana', 1, { bone: 1, scrap: 1, sinew: 1 }, ['starter_katana_draw']]
];

export const starterWeapons = starterWeaponDefinitions.map(([
  id,
  name,
  weaponType,
  hands,
  cost,
  cardPackage
]) => ({
  id,
  name,
  itemType: 'weapon',
  loadoutCategory: 'weapon',
  slot: 'weapon',
  weaponType,
  hands,
  buildingId: 'boneSmith',
  locationId: 'boneSmith',
  craftingLocationId: 'boneSmith',
  displayLocationId: 'boneSmith',
  cost,
  cardPackage,
  keywords: ['Starter', 'Weapon'],
  passiveText: 'A simple settlement weapon.',
  implemented: true
}));
