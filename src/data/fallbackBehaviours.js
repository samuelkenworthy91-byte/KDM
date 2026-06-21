const behaviourIntents = {
  predator: [
    ['stalkingLunge', 'Stalking Lunge', 'The creature lowers itself and watches your hands.', 'deals 7 damage.', [{ type: 'dealDamage', amount: 7 }]],
    ['circleWeakness', 'Circle Weakness', 'It circles just beyond the lantern light.', 'gains 5 block.', [{ type: 'gainBlock', amount: 5 }]]
  ],
  brute: [
    ['crushingBlow', 'Crushing Blow', 'The ground bends beneath its gathered weight.', 'deals 9 damage.', [{ type: 'dealDamage', amount: 9 }]],
    ['thickGuard', 'Thick Guard', 'It draws its bulk inward.', 'gains 7 block.', [{ type: 'gainBlock', amount: 7 }]]
  ],
  armoured: [
    ['shieldedAdvance', 'Shielded Advance', 'Its plated body closes every visible gap.', 'gains 9 block.', [{ type: 'gainBlock', amount: 9 }]],
    ['plateCrash', 'Plate Crash', 'Hard plates grind together as it advances.', 'deals 6 damage.', [{ type: 'dealDamage', amount: 6 }]]
  ],
  evasive: [
    ['dartingStrike', 'Darting Strike', 'Its outline flickers from one side to the other.', 'deals 5 damage.', [{ type: 'dealDamage', amount: 5 }]],
    ['vanishingGuard', 'Vanishing Guard', 'Dust rises where the creature used to stand.', 'gains 6 block.', [{ type: 'gainBlock', amount: 6 }]]
  ],
  poison: [
    ['venomBite', 'Venom Bite', 'A wet gland swells beside its teeth.', 'deals 5 damage and adds 1 Panic.', [{ type: 'dealDamage', amount: 5 }, { type: 'addPanic', amount: 1 }]],
    ['toxicCloud', 'Toxic Cloud', 'Colored vapor gathers around its body.', 'adds 1 Panic.', [{ type: 'addPanic', amount: 1 }]]
  ],
  radiant: [
    ['radiantBurst', 'Radiant Burst', 'Light gathers until its shape becomes painful to see.', 'deals 8 damage.', [{ type: 'dealDamage', amount: 8 }]],
    ['shiningShell', 'Shining Shell', 'Its surface turns toward the lanterns.', 'gains 8 block.', [{ type: 'gainBlock', amount: 8 }]]
  ],
  disruptive: [
    ['memoryCry', 'Memory Cry', 'A familiar voice speaks from inside the creature.', 'adds 1 Panic.', [{ type: 'addPanic', amount: 1 }]],
    ['brokenRhythm', 'Broken Rhythm', 'Its movement skips a beat your body expected.', 'deals 6 damage.', [{ type: 'dealDamage', amount: 6 }]]
  ],
  duelist: [
    ['measuredCut', 'Measured Cut', 'It settles into a precise and patient stance.', 'deals 7 damage.', [{ type: 'dealDamage', amount: 7 }]],
    ['perfectGuard', 'Perfect Guard', 'Every limb aligns behind a narrow defense.', 'gains 7 block.', [{ type: 'gainBlock', amount: 7 }]]
  ],
  swarm: [
    ['manyStrikes', 'Many Strikes', 'Many small movements become one approaching shape.', 'deals 4 damage twice.', [{ type: 'dealDamage', amount: 4 }, { type: 'dealDamage', amount: 4 }]],
    ['churningMass', 'Churning Mass', 'The mass folds its outer bodies inward.', 'gains 6 block.', [{ type: 'gainBlock', amount: 6 }]]
  ],
  nightmare: [
    ['dreadTouch', 'Dread Touch', 'Something impossible reaches through its silhouette.', 'deals 7 damage and adds 1 Panic.', [{ type: 'dealDamage', amount: 7 }, { type: 'addPanic', amount: 1 }]],
    ['unrealShape', 'Unreal Shape', 'Its outline rejects the shape your eyes assign it.', 'gains 5 block.', [{ type: 'gainBlock', amount: 5 }]]
  ]
};

export function createFallbackMonster(quarry) {
  const fallbackId = quarry.fallbackBehaviourId || quarry.designTags?.[0] || 'brute';
  const intents = behaviourIntents[fallbackId] || behaviourIntents.brute;
  return {
    id: quarry.id,
    creatureId: quarry.id,
    name: quarry.displayName,
    hp: 34,
    maxHp: 34,
    block: 0,
    passiveText: `Fallback ${fallbackId} behaviour based on ${quarry.designTags.join(', ')}.`,
    intents: intents.map(([id, name, tellText, revealedSuffix, effects]) => ({
      id,
      name,
      tellText,
      revealedText: `${name}: ${revealedSuffix}`,
      effects: effects.map(effect => ({ ...effect })),
      tags: [fallbackId]
    })),
    loot: quarry.uniqueResources
  };
}
