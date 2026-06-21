const trait = (id, name, description, effectText, mechanicalEffect) => ({
  id, name, description, effectText, mechanicalEffect, implemented: true
});

export const childTraits = {
  lanternEyed: trait(
    'lanternEyed', 'Lantern-Eyed',
    'This child stares into lanternlight without blinking.',
    'Starts with +1 survival. Ignores the first Panic gained each hunt.',
    { startingSurvival: 1, ignoreFirstPanic: true }
  ),
  boneStrong: trait(
    'boneStrong', 'Bone-Strong',
    'Their limbs set thick and hard, as though fear grew into muscle.',
    '+1 max HP.',
    { maxHp: 1 }
  ),
  quietListener: trait(
    'quietListener', 'Quiet Listener',
    'They remember what adults mutter when they think no one hears.',
    'Starts with one random basic fighting art.',
    { randomFightingArt: true }
  ),
  markedByTheDark: trait(
    'markedByTheDark', 'Marked by the Dark',
    'Something noticed them before they were named.',
    '+1 strength. Starts each hunt with 1 Panic.',
    { strength: 1, permanentPanic: 1 }
  ),
  scarless: trait(
    'scarless', 'Scarless',
    'Wounds close strangely clean on their skin.',
    'This no longer prevents death. Start each combat with 1 block instead.',
    { startingBlock: 1 }
  ),
  luckyBirth: trait(
    'luckyBirth', 'Lucky Birth',
    'The settlement remembers the night they arrived as unusually kind.',
    'Starts with +1 survival.',
    { startingSurvival: 1 }
  ),
  wolfSmile: trait(
    'wolfSmile', 'Wolf Smile',
    'They smile at things others run from.',
    'Counter survival action deals +1 damage.',
    { counterDamage: 1 }
  )
};

export const childTraitList = Object.values(childTraits);

export const birthTraitOptions = [
  {
    id: 'steadyChild',
    name: 'Steady Child',
    costMemory: 1,
    description: 'Starts with +1 Survival.',
    mechanicalEffect: { startingSurvival: 1 }
  },
  {
    id: 'boneStrong',
    name: 'Bone-Strong',
    costMemory: 2,
    description: 'Starts with +1 maximum HP.',
    mechanicalEffect: { childTraitId: 'boneStrong' }
  },
  {
    id: 'quietListener',
    name: 'Quiet Listener',
    costMemory: 1,
    description: 'Starts with the Watchful trait, which clarifies the first event warning.',
    mechanicalEffect: { startingTraitId: 'watchful' }
  },
  {
    id: 'lanternEyed',
    name: 'Lantern-Eyed',
    costMemory: 2,
    description: 'Starts with +1 Survival and ignores the first Panic gained each hunt.',
    mechanicalEffect: { childTraitId: 'lanternEyed' }
  },
  {
    id: 'familyLesson',
    name: 'Family Lesson',
    costMemory: 1,
    description: 'Records a harmless lesson inherited from the newborn parents.',
    mechanicalEffect: { familyLesson: true }
  }
];

export function normalizeChildTraitId(value) {
  const aliases = {
    'Lantern-Touched': 'lanternEyed',
    'Dream-Touched': 'quietListener',
    'Lantern-Eyed': 'lanternEyed',
    'Bone-Strong': 'boneStrong',
    'Quiet Listener': 'quietListener',
    'Marked by the Dark': 'markedByTheDark',
    Scarless: 'scarless',
    'Lucky Birth': 'luckyBirth',
    'Wolf Smile': 'wolfSmile'
  };
  return childTraits[value] ? value : aliases[value] || value;
}
