export const graveLegacies = {
  rememberTechnique: {
    id: 'rememberTechnique',
    name: 'Remember Technique',
    description: 'The settlement records one useful movement from the dead survivor.',
    effect: 'Gain +1 settlementMemory immediately.'
  },
  buryGear: {
    id: 'buryGear',
    name: 'Bury Gear',
    description: 'A useful scrap of gear is buried, then recovered by the next survivor.',
    effect: 'The next run starts with 1 random monster part.'
  },
  studyDeath: {
    id: 'studyDeath',
    name: 'Study Death',
    description: 'The settlement studies how the survivor died.',
    effect: 'Gain +1 monsterKnowledge against the monster that killed the survivor.'
  },
  inheritScar: {
    id: 'inheritScar',
    name: 'Inherit Scar',
    description: 'The next survivor grows up hearing the story of this wound.',
    effect: 'The next run starts with +1 max HP.'
  },
  oathOfVengeance: {
    id: 'oathOfVengeance',
    name: 'Oath of Vengeance',
    description: 'The settlement swears revenge against the killer.',
    effect: 'The next run starts with +1 strength for the first combat only.'
  }
};

export const graveLegacyList = Object.values(graveLegacies);
