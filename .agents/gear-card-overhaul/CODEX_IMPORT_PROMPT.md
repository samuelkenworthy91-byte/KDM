# Codex Implementation Prompt — Gear Card Package Overhaul

Use the files in this folder to overhaul the gear/card systems.

Primary source files:
- `gear_card_package_table.csv` for human spreadsheet checking.
- `gear_card_package_table.json` for structured item/card data.
- `all_deck_cards.json` for a flat card import list.
- `STATUS_CONDITIONS_AND_MECHANICS.md` for new status rules.

Implementation requirements:
1. Do not add art or touch public/assets.
2. Preserve browser and SteamOS builds.
3. Add gear card packages from the JSON table.
4. Ensure each equipped item adds its listed deck cards only while equipped/bound.
5. Implement decaying DoT: Bleed X deals X true damage at end of affected combatant's turn, then becomes Bleed X-1. Bleed stacks with no cap.
6. Implement Burn, Poison, Doom, Marked, Exposed, Snared, Shock, Blind, Stagger and Guarded as described.
7. Add damage previews for all cards using card damage, strength, proficiency, weak-point and status modifiers.
8. Implement passive effects as gear passives where possible; if too complex, add a visible placeholder note rather than silent no-op.
9. Use `methodToMakeDetailed` / crafting fields to place items into crafting/event/reward sources.
10. Do not copy KDM rules text; use our generated mechanics.

Acceptance tests:
- At least one item from each weapon type adds the expected cards.
- Bleed 2 ticks for 2, then Bleed 1 ticks for 1, then clears.
- Stacked Bleed adds together and decays once after ticking.
- Support gear can affect another survivor.
- Buckler/shield block conversion caps at 20.
- Weak-point and harvest tags affect break and harvest systems.
- npm run build passes.
