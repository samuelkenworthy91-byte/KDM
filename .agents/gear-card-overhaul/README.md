# Gear Card Package Overhaul

This pack was generated from the uploaded `gear-master-overhaul.zip` and adds concrete deck-card designs for every gear entry.

## Files

- `GEAR_CARD_PACKAGE_MASTER.md` — readable master table with original equipment, our gear, method to make, card text columns and passive effects.
- `gear_card_package_table.csv` — spreadsheet-friendly master table.
- `gear_card_package_table.json` — structured item data with detailed `deckCardsDetailed` and `passiveEffectsDetailed` fields.
- `all_deck_cards.json` — flat list of every generated deck card.
- `STATUS_CONDITIONS_AND_MECHANICS.md` — new/overhauled status conditions and mechanics, including decaying DoT/Bleed.
- `CODEX_IMPORT_PROMPT.md` — implementation prompt for Codespaces.
- `COVERAGE_AND_CARD_SUMMARY.md` — counts and summary.

## Key status overhaul

Bleed is now a decaying stack: Bleed 2 deals 2 true damage at the end of the affected combatant's turn, then becomes Bleed 1, then deals 1 next turn and clears. Bleed stacks additively with no hard cap.

## Important note

This is documentation/data only. No game code has been changed.
