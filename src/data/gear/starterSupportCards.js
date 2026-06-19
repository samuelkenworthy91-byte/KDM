export const starterSupportCards = {
  starter_hide_vest_guard: {
    id: 'starter_hide_vest_guard',
    name: 'Hide Guard',
    cost: 1,
    description: 'Gain 4 Block.',
    effects: [{ type: 'block', amount: 4 }],
    type: 'skill',
    tags: ['gear', 'armor', 'starter', 'block'],
    sourceType: 'equipment',
    sourceGearId: 'starter_hide_vest',
    implemented: true
  },
  starter_survival_wrap_scramble: {
    id: 'starter_survival_wrap_scramble',
    name: 'Wrapped Scramble',
    cost: 0,
    description: 'Gain 1 survival. Exhaust.',
    effects: [{ type: 'survival', amount: 1 }],
    type: 'skill',
    tags: ['gear', 'survival', 'starter', 'exhaust'],
    sourceType: 'equipment',
    sourceGearId: 'starter_survival_wrap',
    exhaust: true,
    implemented: true
  }
};
