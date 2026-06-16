# Card Copy Mechanic Implementation

## Rule
Each equipped item instance contributes 1 base copy of each card in its package. If the player likes a card and invests in it, that specific item instance can contribute up to 3 copies of that card.

## Data model
Track card training per survivor and per item instance:

```js
survivor.gearCardTraining = {
  [gearInstanceId]: {
    [cardId]: {
      unlockedCopies: 1, // 1 to 3
      practice: 0
    }
  }
}
```

## Runtime deck construction
For each equipped item:
1. Read its card package.
2. For each card ID, read `unlockedCopies`.
3. Clamp copies between 1 and 3.
4. Add that many copies to the deck.
5. If the item is unequipped, do not add its trained copies.

## Duplicate weapon interaction
Two weapons with the same name are allowed if they fit the 2 weapon item limit. They must have different `gearInstanceId` values, so each can train its card copies separately.

## Suggested unlock pacing
- Second copy: 3 successful plays + 1 matching or generic resource.
- Third copy: 6 total successful plays + 1 rare/matching quarry resource or 2 generic resources.

A successful play means the card resolves at least one meaningful effect: damage, block, healing, draw/filtering, status application, survival gain, resource gain, or party support.

## Hard cap
Never allow more than **3 copies of a card from one item instance**.
