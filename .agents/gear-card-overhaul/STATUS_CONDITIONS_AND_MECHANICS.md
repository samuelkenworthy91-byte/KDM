
# Status Conditions and New Mechanics

## Decaying DoT rule
Damage-over-time statuses now use a simple decaying stack model unless a card explicitly says otherwise.

### Bleed X
At the end of the affected combatant's turn, take X true damage that ignores block, then reduce Bleed by 1. Bleed stacks additively with no hard cap. Example: Bleed 2 deals 2 damage at end of turn, becomes Bleed 1, then deals 1 next turn and clears. If another card applies Bleed 3 before it ticks, the stack becomes Bleed 5.

### Burn X
At the end of the affected combatant's turn, take X damage, then reduce Burn by 1. Burn damage hits block first, then HP. Burn stacks additively. Fire gear often applies Burn but may risk Panic or self-Burn.

### Poison X
At the end of the affected combatant's turn, take X damage, then reduce Poison by 1. Poison ignores half block, rounded down. Poison stacks additively and represents toxic, acid, venom and disease effects.

### Doom X
A rare non-decaying delayed damage status. At the end of the affected combatant's turn, reduce Doom by 1. When it reaches 0, resolve the listed Doom effect. Used sparingly for cursed, time, or mirror gear.

## Combat control statuses
- Marked: The next attack or weak-point attempt that cares about Marked gains its bonus, then Marked clears unless a card says it stays.
- Exposed: The next weak-point attack against this target gains +50% break damage and no failed-break risk, then clears.
- Snared X: The target’s next movement, pounce, charge or dodge-style effect is weakened by X, then Snared is reduced by 1.
- Shock X: The target's next block gain is reduced by X, then Shock clears.
- Blind X: The target's next attack loses X damage or targets randomly with a worse preview, then Blind clears.
- Stagger X: The target’s next attack deals X less damage, then Stagger clears.
- Guarded: The survivor has support protection; reduce next incoming damage by the Guarded value.

## Weak-point harvest mechanics
- Break Damage: Damage dealt to a weak point's break track.
- Harvest Quality: Clean, Messy or Ruined. Clean improves rare odds, Messy gives smaller related-part odds, Ruined removes fragile rare odds and adds fallback materials.
- Fragile Part: Head, eye, heart, organ, gland, memory and radiant parts are usually fragile.
- Overkill: If break damage exceeds break value by 8+ on a fragile part, worsen harvest quality by one step unless using Precise/Harvest tools.

## Party support mechanics
- Next Ally: The next living survivor in party order after the current survivor.
- Chosen Ally: Any living survivor selected by the player.
- Party Block: Block granted to another survivor before the next monster attack.
- Prepared: A pending support buff stored until the target’s next turn or the next monster attack.

## Retreat mechanics
- Retreat Aid: Gear with Retreat can soften or reroll a retreat consequence once per hunt if the implementation allows it.
- Salvage: A retreat item can preserve one gathered resource that would otherwise be lost.
