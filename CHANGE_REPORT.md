# Gear Master Overhaul Clean v8 — Weapon Duplicate + Card Copy Training Patch

## Why this patch exists
This patch corrects the v7 weapon-limit wording and adds the missing progression system for increasing copies of strong item cards.

## Weapon loadout rule
- Survivor max equipment remains **9 pieces**.
- A survivor may equip at most **2 weapon items**.
- Those 2 weapons may have the **same name**.
- Example: two Katars / two Acid Tooth Knives / two copies of the same paired weapon are legal.
- The number of **distinct weapon names** equipped by one survivor cannot exceed **2**.

## Card copy training rule
Each item card starts at **1 copy** from the equipped item.

A survivor may train a specific card from a specific item instance:
- Copy 1: default.
- Copy 2: unlock through practice.
- Copy 3: unlock through deeper practice.
- Maximum: **3 copies of the same card from one item instance**.

Duplicate items are tracked separately. If a survivor equips two copies of the same weapon, each physical item instance can separately train its own cards, but each item instance is still capped at 3 copies per card.

## Implementation warning
Do not create duplicate static card rows. The card database stays unique. Extra copies are generated only during runtime deck construction from a survivor's equipped gear and `gearCardTraining` state.
