# Colour Affinity Bonuses

Every equipment item has exactly one colour affinity. A survivor counts equipped items by colour after all loadout changes.

Affinities stack independently from armour set bonuses.

## Thresholds

### Blue — Block and protection

- 2 pieces: Start each combat with +2 Block.
- 4 pieces: The first Block or Counter card you play each combat gains +3 Block.
- 5 pieces: Gain the Blue affinity ability card while the threshold is maintained.
- Ability card: `blueBastionStance` — Cost 1. Gain 8 Block. Until your next turn, the first time damage is prevented by Block, deal 2 counter damage.
- Implementation: Count equipped items with colorAffinity === "blue". Apply 2/4 passives at combat start. Add/remove the special card dynamically while count >= 5.

### Red — Damage and aggression

- 2 pieces: The first Attack card you play each combat deals +1 damage.
- 4 pieces: Once per combat, when you deal break damage, add +2 break damage.
- 5 pieces: Gain the Red affinity ability card while the threshold is maintained.
- Ability card: `redButchersTempo` — Cost 1. Deal 5 damage and apply Bleed 2. If the target has Block, remove 3 Block first.
- Implementation: Count equipped items with colorAffinity === "red". Apply 2/4 combat modifiers. Add/remove the special card dynamically while count >= 5.

### Green — Survival and healing

- 2 pieces: Start each hunt with +1 Survival.
- 4 pieces: After each combat, heal the equipped survivor for 2 HP.
- 5 pieces: Gain the Green affinity ability card while the threshold is maintained.
- Ability card: `greenMendersOath` — Cost 1. At the end of combat, heal an ally for 5 HP. If no ally is wounded, gain 2 Survival instead.
- Implementation: Count equipped items with colorAffinity === "green". Apply hunt-start and post-combat passives. Add/remove the special card dynamically while count >= 5.

### Purple — Resources and rewards

- 2 pieces: At the end of a successful hunt/run, gain +1 standard monster resource.
- 4 pieces: At the end of a successful hunt/run, gain +1 additional resource from the defeated quarry reward pool.
- 5 pieces: Gain the Purple affinity ability card while the threshold is maintained.
- Ability card: `purpleScavengersClaim` — Cost 0. Exhaust. The next time any survivor breaks a weak point this combat, add +1 standard monster resource to the hunt rewards.
- Implementation: Count equipped items with colorAffinity === "purple". Apply reward passives only after a successful combat/hunt. Add/remove the special card dynamically while count >= 5.

