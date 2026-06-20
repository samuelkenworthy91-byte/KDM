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
    mechanicalSummary: 'Future survivor deaths will be resolved by the Graves principle. Reward wiring is handled by the death-principle reward patch.',
    permanent: true,
    effectTags: ['death', 'memory', 'principle']
  },
  cannibalism: {
    id: 'cannibalism',
    group: 'death',
    name: 'Cannibalism',
    triggerLabel: campaignPrincipleGroups.death.triggerLabel,
    playerSummary: 'The settlement decides that the dead must feed the living.',
    mechanicalSummary: 'Future survivor deaths will be resolved by the Cannibalism principle. Reward wiring is handled by the death-principle reward patch.',
    permanent: true,
    effectTags: ['death', 'resource', 'principle']
  },
  protectTheYoung: {
    id: 'protectTheYoung',
    group: 'newLife',
    name: 'Protect the Young',
    triggerLabel: campaignPrincipleGroups.newLife.triggerLabel,
    playerSummary: 'Children are sheltered as the settlement learns to endure.',
    mechanicalSummary: '+10 percentage points intimacy success, -10 tragedy, and newborn HP effects will be wired by the New Life effects patch.',
    permanent: true,
    effectTags: ['newLife', 'intimacy', 'newborn', 'principle']
  },
  survivalOfTheFittest: {
    id: 'survivalOfTheFittest',
    group: 'newLife',
    name: 'Survival of the Fittest',
    triggerLabel: campaignPrincipleGroups.newLife.triggerLabel,
    playerSummary: 'The settlement lets only the strongest lessons survive.',
    mechanicalSummary: '+20 percentage points intimacy tragedy and newborn survival/damage effects will be wired by the New Life effects patch.',
    permanent: true,
    effectTags: ['newLife', 'intimacy', 'newborn', 'principle']
  },
  workTogether: {
    id: 'workTogether',
    group: 'society',
    name: 'Work Together',
    triggerLabel: campaignPrincipleGroups.society.triggerLabel,
    playerSummary: 'The settlement learns to share memory and labor.',
    mechanicalSummary: 'Once per Lantern Year, one exact 1-Memory action can be discounted to 0. Discount wiring is handled by the Society effects patch.',
    permanent: true,
    effectTags: ['society', 'memory', 'discount', 'principle']
  },
  embraceTheDark: {
    id: 'embraceTheDark',
    group: 'society',
    name: 'Embrace the Dark',
    triggerLabel: campaignPrincipleGroups.society.triggerLabel,
    playerSummary: 'The settlement stops fighting the dark and learns its rhythm.',
    mechanicalSummary: 'Rest-stop odds adjustment will be wired by the Society effects patch.',
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
