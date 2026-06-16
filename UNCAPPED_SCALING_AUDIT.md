# Uncapped Scaling Audit — v7

The design rule is that cards should not contain arbitrary upper-limit damage/block/reward caps like:

- `to a max of 20`
- `maximum of 10`
- `capped at 15`
- `cap of 5`

Big numbers are allowed if the player has earned them through difficult ramping.

## Result

- Cards scanned: 778
- Explicit upper-limit caps removed: 0
- Remaining upper-limit cap hits: 0

No removable upper-limit caps were found in v6 card text, so v7 preserves the card effects as written while adding the implementation rule to prevent future caps.

## Important preserved limits

The following are not arbitrary scaling caps and were intentionally preserved:

- `minimum 0` cost language.
- `once per battle` tracking for first-counter-free mechanics.
- movement ranges such as `move up to 3 spaces`.
- `max HP` wording.
