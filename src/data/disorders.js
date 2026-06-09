export const disorders = {
  nightTerrors: {
    id: 'nightTerrors',
    name: 'Night Terrors',
    effect: 'Start each hunt with 1 Panic in the deck.',
    implemented: true
  },
  hoarder: {
    id: 'hoarder',
    name: 'Hoarder',
    effect: 'Normal rest events cannot remove Panic from this survivor.',
    implemented: true
  },
  deathWish: {
    id: 'deathWish',
    name: 'Death Wish',
    effect: 'While at or below 2 HP, attacks deal +1 damage.',
    implemented: true
  },
  paranoia: {
    id: 'paranoia',
    name: 'Paranoia',
    effect: 'Start combat with +1 block and 1 Panic in the deck.',
    implemented: true
  },
  lanternFixation: {
    id: 'lanternFixation',
    name: 'Lantern Fixation',
    effect: 'Start combat with +1 survival against Ash Phoenix.',
    implemented: true
  }
};

export const disorderList = Object.values(disorders);
