# Loadout Slot Implementation — v7

## Survivor equipment cap

A survivor can equip a maximum of **9 pieces** total.

## Weapon rule

A survivor can equip at most **2 weapons**.

Validation:
1. Count equipped items where `loadoutCategory === "weapon"`.
2. Reject the loadout if count is greater than 2.
3. Reject the loadout if two equipped weapons have the same `ourGameName`.

## Armour body slot rule

Armour pieces use exactly one of:

- `head`
- `chest`
- `waist`
- `arms`
- `legs`

Validation:
1. Filter equipped items where `loadoutCategory === "armor"`.
2. Each item must have `bodySlot` in the allowed list.
3. Reject the loadout if more than one armour item has the same `bodySlot`.

User-facing wording:
- Head: helmet, crown, hood, mask, turban, visage, headdress.
- Chest: coat, cloak, mantle, cuirass, vest, robes, suit, jacket, harness.
- Waist: skirt, kilt, belt, faulds, sash, pants/leggings if used as waist armour.
- Arms: bracers, sleeves, gloves, gauntlets, cuffs, shoulder pads.
- Legs: greaves, treads, boots, shoes, galoshes, leg warmers.

## Jewellery slot rule

A survivor can equip **1 jewellery item**.

Items with `loadoutCategory === "jewelry"` include charms, circlets, rings, amulets, earrings, badges, wreaths and similar items. These count toward colour affinity thresholds, but do not occupy a body armour slot.

## Utility gear

Items with `loadoutCategory === "utility"` count against the 9-piece equipment cap but do not use weapon, body armour or jewellery limits.

## Set definition rows

Rows with `loadoutCategory === "setDefinition"` are not directly equipped. They define set bonuses only.

## Suggested validation order

1. Remove non-equippable set definition rows from equipped item selection.
2. Check total equippable items <= 9.
3. Check weapon count and duplicate weapon names.
4. Check body armour slot duplicates.
5. Check jewellery count.
6. Recalculate armour set thresholds.
7. Recalculate colour affinity thresholds.
8. Inject/remove temporary set and affinity cards.
