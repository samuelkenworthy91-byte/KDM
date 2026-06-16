# Loadout and Armour Set Implementation

## Survivor equipment limit

Set the survivor equipment limit to:

```ts
const MAX_EQUIPMENT_PER_SURVIVOR = 9;
```

A survivor can equip up to **9 total pieces**.

## Weapon limit

A survivor can equip a maximum of **2 weapons**, and the two weapons must have different names.

```ts
function validateWeaponLoadout(equipment) {
  const weapons = equipment.filter(item => item.ourItemType === "weapon" || item.ourSlot === "weapon");
  if (weapons.length > 2) return { ok: false, reason: "A survivor can equip a maximum of 2 weapons." };

  const names = new Set(weapons.map(w => w.ourGameName));
  if (names.size !== weapons.length) {
    return { ok: false, reason: "Equipped weapons must have different names." };
  }

  return { ok: true };
}
```

## Armour set bonus rule

Load `armour_set_bonuses.json`.

Each set has:
- `minorThreshold`: usually 2
- `majorThreshold`: usually 4
- `completeThreshold`: all listed pieces
- `specialAbilityCardId`: card injected while complete

```ts
function getActiveArmourSetBonuses(equipped, armourSets) {
  const equippedNames = new Set(equipped.map(item => item.ourGameName));
  const active = [];

  for (const set of armourSets) {
    const wornPieces = set.pieces.filter(piece => equippedNames.has(piece.equipmentName));
    const count = wornPieces.length;

    if (count >= set.minorThreshold) {
      active.push({ setId: set.setId, tier: "minor", bonus: set.minorBonus });
    }

    if (count >= set.majorThreshold) {
      active.push({ setId: set.setId, tier: "major", bonus: set.majorBonus });
    }

    if (count >= set.completeThreshold) {
      active.push({ setId: set.setId, tier: "huge", bonus: set.hugeBonus });
      active.push({ setId: set.setId, tier: "specialCard", cardId: set.specialAbilityCardId });
    }
  }

  return active;
}
```

## Special ability card injection

When deck is built or equipment changes:

```ts
function applyArmourSetCards(deck, activeBonuses, setBonusCards) {
  const activeCardIds = new Set(
    activeBonuses
      .filter(b => b.tier === "specialCard")
      .map(b => b.cardId)
  );

  // Remove old set bonus cards first.
  deck = deck.filter(card => card.itemType !== "setBonus");

  // Add currently active complete-set cards.
  for (const card of setBonusCards) {
    if (activeCardIds.has(card.cardId)) deck.push(card);
  }

  return deck;
}
```

If the survivor removes a required piece, immediately remove the corresponding set bonus card from their deck, hand and discard.
