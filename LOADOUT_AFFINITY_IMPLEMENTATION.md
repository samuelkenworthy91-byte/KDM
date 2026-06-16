# Loadout, Armour Set and Colour Affinity Implementation

## Loadout limits

- A survivor may equip up to 9 total equipment pieces.
- A survivor may equip no more than 2 weapons.
- If 2 weapons are equipped, their equipment names must be different.
- Weapon checks should use canonical equipment name or equipment ID, not display slot position.

## Armour set bonuses

Keep the v5 armour set system:
- Count equipped armour pieces by `setId`.
- Apply 2-piece minor bonus, 4-piece major bonus, full-set huge bonus.
- Add the full-set special ability card only while the full set is still worn.
- Remove the special ability card when the survivor unequips below the full-set threshold.

## Colour affinity bonuses

New v6 rule:
- Every equipment item has one `colorAffinity`.
- Allowed values: `blue`, `red`, `green`, `purple`.
- Count equipped items by colour after all equipment is equipped.
- Apply thresholds at 2, 4 and 5 matching pieces.
- At 5 matching pieces, add the matching affinity ability card to that survivor's deck.
- Remove that card immediately if the survivor drops below 5 matching pieces.
- Affinity bonuses do not replace armour set bonuses. They stack.

## Suggested resolver order

1. Validate loadout size: max 9 equipment.
2. Validate weapon count: max 2.
3. Validate weapon names: no duplicate weapon names.
4. Build base deck from survivor + equipped gear.
5. Apply passive equipment effects.
6. Apply armour set thresholds and dynamic armour set cards.
7. Apply colour affinity thresholds and dynamic affinity cards.
8. Start combat/hunt and resolve start-of-hunt/start-of-combat passives.

## Standard monster resource rule

For Purple affinity, "standard monster resource" should use the repo's generic resource list:
- `bone`
- `hide`
- `sinew`
- `organ`

If your reward resolver already includes `claw` or `scrap` as generic hunt rewards, those may be added as optional standard resources, but the default safe pool should be the four core basics above.

## Universal targeting rule

No card effect should check that the current enemy is a specific quarry. Source monsters/crafting locations control unlocks and recipe flavour only. During combat, effects target the current monster, the current survivor, or an ally/party target as described by the card.
