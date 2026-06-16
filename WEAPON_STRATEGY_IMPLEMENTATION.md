# Weapon Strategy Implementation — v7

Every weapon row now includes:

- `weaponStrategyId`
- `weaponStrategyName`
- `weaponStrategySummary`
- `weaponRampResource`
- `weaponPayoffPattern`
- `weaponDeckAdvice`
- `weaponStrategyCardIds`

These fields do not replace card effects. They give the player and implementation code a clear deckbuilding identity for each weapon.

## Strategy profiles

### Block-to-Damage Engine (`blockToDamage`)

- Ramp resource: Block / Guarded
- Payoff: Counter cards, shield-wall cards and guard-to-damage attacks.
- Advice: Pair with Blue affinity and armour that starts combat with Block.
- Summary: Build Block/Guarded, then turn prevention into Counter damage or bash payoffs.

### Panic Furnace (`panicRamp`)

- Ramp resource: Panic
- Payoff: Strange attacks, scythes and cards that gain power from Panic or clearing Panic.
- Advice: Pair with controlled Panic clearing so the deck does not collapse before the payoff.
- Summary: Accept or generate Panic, then turn instability into bigger attacks.

### Status Stack (`bleedStatus`)

- Ramp resource: Status tokens
- Payoff: Repeat hits, low-cost attacks and status riders.
- Advice: Pair with Red affinity and draw/filtering to keep pressure constant.
- Summary: Stack Bleed, Poison, Burn, Shock or Snared until the quarry buckles under pressure.

### Weak-Point Breaker (`weakPointBreaker`)

- Ramp resource: Marked / Exposed / break damage
- Payoff: Break-damage attacks and weak-point payoff cards.
- Advice: Pair with Purple reward pieces or ranged setup cards.
- Summary: Open, mark and break weak points for burst damage and reward/control triggers.

### Combo Tempo (`comboTempo`)

- Ramp resource: Cards played this turn / cheap attacks
- Payoff: Follow-up riders, extra draw, cost reduction and repeated attack bonuses.
- Advice: Pair with draw/filtering so chain pieces appear together.
- Summary: Chain low-cost attacks, follow-ups and first-card bonuses into smooth damage turns.

### Heavy Breaker (`heavyBreaker`)

- Ramp resource: Energy / setup / exposed target
- Payoff: High base damage, break damage and guard stripping.
- Advice: Pair with Green or Blue support to survive the setup turn.
- Summary: Build slowly into huge single hits, guard breaks and expensive attacks.

### Ranged Control (`rangedControl`)

- Ramp resource: Marked / positioning / pinning
- Payoff: Ranged attacks that ignore guard, break weak points or improve follow-up hits.
- Advice: Pair with mobility and weak-point reward gear.
- Summary: Mark, pin or soften the quarry from a distance before committing.

### Resource Hunter (`resourceHarvest`)

- Ramp resource: Harvest tests / weak-point breaks
- Payoff: Extra resources, preserved resources, salvage and improved hunt rewards.
- Advice: Pair with Purple affinity for reward spikes after a successful hunt.
- Summary: Turn tests, broken weak points and retreats into more resources.

### Party Support Weapon (`partySupport`)

- Ramp resource: Prepared / ally Block / party positioning
- Payoff: Ally buffs, block grants, panic clear and shared payoffs.
- Advice: Pair with Green affinity and other support gear.
- Summary: Use weapon actions to protect or set up allies rather than only dealing damage.

### Wound-Risk Berserker (`woundRisk`)

- Ramp resource: Wounds / low HP / self-risk
- Payoff: Bonus damage when wounded, exposed or after paying risky costs.
- Advice: Pair with healing or death prevention so ramp does not kill the survivor.
- Summary: Grow damage from wounds, low safety or self-inflicted risk.

## Current weapon strategy distribution

{
  "bleedStatus": 11,
  "rangedControl": 19,
  "panicRamp": 14,
  "heavyBreaker": 18,
  "partySupport": 11,
  "weakPointBreaker": 17,
  "blockToDamage": 10,
  "resourceHarvest": 2,
  "comboTempo": 7
}

## Implementation use

Use these fields in the UI to show:
- recommended build path,
- what resource the weapon wants to build,
- what cards or effects are the payoff,
- why two weapons might pair well or badly.

Examples:
- A `panicRamp` survivor wants cards that safely add or clear Panic before playing a huge payoff.
- A `blockToDamage` survivor wants armour and Blue affinity pieces that build Block before playing counters.
- A `resourceHarvest` survivor wants Purple affinity and weak-point/resource tools.
