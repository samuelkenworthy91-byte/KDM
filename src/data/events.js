// Event definitions for map nodes. Each event has choices with outcomes.
export const events = [
  {
    id: 'strangeCarcass',
    name: 'Strange Carcass',
    description: 'You find a bloated carcass. Gain a random resource but risk a curse.',
    choices: [
      { text: 'Harvest', result: { resource: true, curse: true } },
      { text: 'Ignore', result: {} }
    ]
  },
  {
    id: 'lostSurvivor',
    name: 'Lost Survivor',
    description: 'A survivor crawls out of the darkness. Do you rescue them?',
    choices: [
      { text: 'Rescue', result: { recruit: true, loseCard: true } },
      { text: 'Leave', result: {} }
    ]
  }
];