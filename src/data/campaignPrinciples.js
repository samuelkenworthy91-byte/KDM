export const PRINCIPLE_GROUPS = ['death', 'newLife', 'society'];

export const campaignPrincipleGroups = {
  death: {
    id: 'death',
    name: 'Death Principle',
    triggerLabel: 'First survivor death'
  },
  newLife: {
    id: 'newLife',
    name: 'New Life Principle',
    triggerLabel: 'First newborn'
  },
  society: {
    id: 'society',
    name: 'Society Principle',
    triggerLabel: 'Lantern Year 5'
  }
};

export const campaignPrinciples = {
  graves: {
    id: 'graves',
    group: 'death',
    name: 'Graves',
    triggerLabel: campaignPrincipleGroups.death.triggerLabel,
    playerSummary: 'The settlement gives the dead a place to remain.',
    mechanicalSummary: 'Every survivor death grants +1 Memory, including the death that triggered this choice.',
    effectSummary: 'Each survivor death gives +1 Memory.',
    whereItMatters: 'Automatically after survivor deaths.',
    permanent: true,
    effectTags: ['death', 'memory', 'principle']
  },
  cannibalism: {
    id: 'cannibalism',
    group: 'death',
    name: 'Cannibalism',
    triggerLabel: campaignPrincipleGroups.death.triggerLabel,
    playerSummary: 'The settlement decides that the dead must feed the living.',
    mechanicalSummary: 'Every survivor death grants +1 random basic resource, including the death that triggered this choice.',
    effectSummary: 'Each survivor death gives +1 random basic resource.',
    whereItMatters: 'Automatically after survivor deaths.',
    permanent: true,
    effectTags: ['death', 'resource', 'principle']
  },
  protectTheYoung: {
    id: 'protectTheYoung',
    group: 'newLife',
    name: 'Protect the Young',
    triggerLabel: campaignPrincipleGroups.newLife.triggerLabel,
    playerSummary: 'Children are sheltered as the settlement learns to endure.',
    mechanicalSummary: '+10 percentage points intimacy success, -10 tragedy, and every newborn gains +5 max HP.',
    effectSummary: '+10 intimacy success, -10 tragedy, and every newborn gains +5 max HP.',
    whereItMatters: 'Automatically during intimacy and newborn creation.',
    permanent: true,
    effectTags: ['newLife', 'intimacy', 'newborn', 'principle']
  },
  survivalOfTheFittest: {
    id: 'survivalOfTheFittest',
    group: 'newLife',
    name: 'Survival of the Fittest',
    triggerLabel: campaignPrincipleGroups.newLife.triggerLabel,
    playerSummary: 'The settlement lets only the strongest lessons survive.',
    mechanicalSummary: '+20 percentage points intimacy tragedy; every newborn gains +2 personal damage and +1 max Survival.',
    effectSummary: '+20 intimacy tragedy; every newborn gains +2 personal damage and +1 max Survival.',
    whereItMatters: 'Automatically during intimacy and newborn creation.',
    permanent: true,
    effectTags: ['newLife', 'intimacy', 'newborn', 'principle']
  },
  workTogether: {
    id: 'workTogether',
    group: 'society',
    name: 'Work Together',
    triggerLabel: campaignPrincipleGroups.society.triggerLabel,
    playerSummary: 'The settlement learns to share memory and labor.',
    mechanicalSummary: 'Once per Lantern Year, one exact 1-Memory action costs 0 instead.',
    effectSummary: 'Once per Lantern Year, one exact 1-Memory cost becomes 0.',
    whereItMatters: 'Automatically when paying for a 1-Memory action or innovation attempt.',
    permanent: true,
    effectTags: ['society', 'memory', 'discount', 'principle']
  },
  embraceTheDark: {
    id: 'embraceTheDark',
    group: 'society',
    name: 'Embrace the Dark',
    triggerLabel: campaignPrincipleGroups.society.triggerLabel,
    playerSummary: 'The settlement stops fighting the dark and learns its rhythm.',
    mechanicalSummary: 'Rest stops shift -10 negative, -10 neutral, and +20 positive while keeping total odds at 100%.',
    effectSummary: 'Rest stops shift -10 negative, -10 neutral, and +20 positive.',
    whereItMatters: 'Automatically at rest stops.',
    permanent: true,
    effectTags: ['society', 'rest', 'principle']
  }
};

export const campaignPrincipleOptionsByGroup = PRINCIPLE_GROUPS.reduce((groups, group) => ({
  ...groups,
  [group]: Object.values(campaignPrinciples).filter(principle => principle.group === group)
}), {});

export function getCampaignPrinciple(id) {
  return campaignPrinciples[id] || null;
}

export function getCampaignPrincipleOptions(group) {
  return campaignPrincipleOptionsByGroup[group] || [];
}
