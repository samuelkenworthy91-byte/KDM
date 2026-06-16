# Universal Targeting Implementation

## Rule

No equipment card effect may require the survivor to be fighting the equipment's source quarry, source monster, source expansion or crafting location.

Source fields remain useful for:
- unlocks
- crafting location
- hunt/source flavour
- audit traceability
- future art direction

They must **not** be used as combat effect gates.

## Implementation

When resolving a card:

```ts
function canResolveEquipmentCard(card, context) {
  if (card.universalTargeting === true) {
    return normalTimingAndTargetChecks(card, context);
  }

  // Default behaviour for old/legacy cards should still avoid source-monster gating.
  return normalTimingAndTargetChecks(card, context);
}
```

Do not check:

```ts
card.targetProfile === currentQuarry.name
card.sourceOriginalName === currentQuarry.name
equipment.kdmMonsterOrEventSource === currentQuarry.name
```

## Target profiles

- Attack cards use `targetProfile: "Any valid target"` unless they have no target.
- Support/block/reaction cards may have a blank target profile.
- Unlock/source data is separate from targeting data.

## Text migration

Old pattern:

> Apply Bleed 2 if the target has a White Lion weak point, otherwise gain Marked 1.

New pattern:

> Apply Bleed 2.

The effect now goes off against any valid quarry/target.
