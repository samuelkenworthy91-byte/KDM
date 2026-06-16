# Counter Mechanic Implementation

## Intended rule

Once per battle per equipment, the first card with tag `Counter` from that equipment costs 0. After it is used, mark that equipment's free counter as spent until the next battle starts.

## Required battle state

```js
battleState.firstCounterUsedByEquipmentId = battleState.firstCounterUsedByEquipmentId || {};
```

Use a stable equipment instance/source key. Good options, in order:

1. equipped item instance id
2. equipment card source id
3. source equipment name as fallback

## Cost calculation pseudocode

```js
function getCardCost(card, battleState, sourceEquipmentKey) {
  let cost = card.cost ?? 0;
  const flags = card.mechanicFlags || {};
  const conditional = card.conditionalCost;

  if (
    flags.firstCounterFree &&
    conditional?.condition === 'firstCounterCardThisBattleFromThisEquipment' &&
    !battleState.firstCounterUsedByEquipmentId?.[sourceEquipmentKey]
  ) {
    cost = conditional.cost ?? 0;
  }

  return Math.max(0, cost);
}

function onCardResolved(card, battleState, sourceEquipmentKey) {
  const flags = card.mechanicFlags || {};
  if (flags.countsAsCounter && flags.firstCounterFree) {
    battleState.firstCounterUsedByEquipmentId ||= {};
    battleState.firstCounterUsedByEquipmentId[sourceEquipmentKey] = true;
  }
}

function onBattleStart(battleState) {
  battleState.firstCounterUsedByEquipmentId = {};
}
```

## Why this is needed

Putting “first counter costs 0” in card text is not enough. The cost UI, affordability check, card-play validation, and resolution step must all read the same structured flag.
