# Implementation Plan — v7

1. Import `gear_master_overhaul.json`, `gear_card_package_table.json`, `armour_set_bonuses.json`, `affinity_bonuses.json`, `loadout_rules.json`, and `weapon_strategy_profiles.json`.
2. Use `loadoutCategory` and `bodySlot` to validate survivor equipment.
3. Enforce 9 total equipped pieces.
4. Enforce max 2 weapons and no duplicate weapon names.
5. Enforce one armour item in each body slot.
6. Enforce one jewellery item.
7. Recalculate armour set bonuses using corrected body-slot pieces.
8. Recalculate colour affinity bonuses.
9. Use weapon strategy fields for UI descriptions and build recommendations.
10. Do not add future upper-limit caps to scaling cards unless the cap represents a real finite resource.

See:
- `LOADOUT_SLOT_IMPLEMENTATION.md`
- `WEAPON_STRATEGY_IMPLEMENTATION.md`
- `UNCAPPED_SCALING_AUDIT.md`
- `AFFINITY_BONUSES.md`
- `ARMOUR_SET_BONUSES.md`



# v8 Addendum — Duplicate Weapons and Card Copy Training

1. Update loadout validation:
   - Count weapon items.
   - Reject if weapon item count > 2.
   - Count distinct weapon names.
   - Reject if distinct weapon names > 2.
   - Do not reject duplicate same-name weapons.

2. Add `gearCardTraining` to survivor save data.

3. During deck building:
   - For each equipped gear instance and each package card, add `clamp(unlockedCopies, 1, 3)` copies.
   - Use gear instance IDs so duplicate weapons train separately.
   - Keep static card IDs unique; runtime copies are deck instances, not new database cards.

4. Add UI:
   - Show each card under its item with current copies: 1/3, 2/3, or 3/3.
   - Show progress towards next copy.
   - Disable upgrade button at 3/3.
