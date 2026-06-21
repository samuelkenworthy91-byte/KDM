function attack(id, name, tellText, vagueHint, damage, extra = {}) {
  return {
    id,
    name,
    tellText,
    vagueHint,
    revealedText: `${name}: deals ${damage} damage.${extra.revealedSuffix || ''}`,
    effects: [{ type: 'dealDamage', amount: damage }, ...(extra.effects || [])],
    tags: ['attack', ...(extra.tags || [])]
  };
}

function guard(id, name, tellText, vagueHint, block) {
  return {
    id,
    name,
    tellText,
    vagueHint,
    revealedText: `${name}: gains ${block} block.`,
    effects: [{ type: 'gainBlock', amount: block }],
    tags: ['defense']
  };
}

export const monsters = {
  whiteLion: {
    id: 'whiteLion',
    creatureId: 'paleHuntLion',
    name: 'Pale Hunt Lion',
    hp: 30,
    maxHp: 30,
    block: 0,
    passiveText: 'Predatory pressure punishes hunters who leave themselves exposed.',
    intents: [
      attack(
        'pounce',
        'Pounce',
        'The Pale Hunt Lion lowers its body and coils to spring.',
        'A heavy attack is coming. Blocking may matter.',
        8,
        {
          revealedSuffix: ' Deals +2 if you have no block.',
          effects: [{ type: 'bonusIfPlayerNoBlock', amount: 2 }],
          tags: ['heavy']
        }
      ),
      attack(
        'rend',
        'Rend',
        'It drags one claw slowly across the ground, testing for weakness.',
        'This strike may leave something harmful behind.',
        5,
        { effects: [{ type: 'addPanic', amount: 1 }], tags: ['wound'] }
      ),
      {
        id: 'terrifyingRoar',
        name: 'Terrifying Roar',
        tellText: 'Its throat swells. The lanterns tremble.',
        vagueHint: 'This may disrupt your deck.',
        revealedText: 'Terrifying Roar: adds 1 Panic to your discard pile.',
        effects: [{ type: 'addPanic', amount: 1 }],
        tags: ['panic', 'deck-disruption']
      }
    ],
    loot: ['hide', 'bone', 'sinew', 'paleLionClaw']
  },
  screamingAntelope: {
    id: 'screamingAntelope',
    creatureId: 'wailingAntelope',
    name: 'Wailing Antelope',
    hp: 35,
    maxHp: 35,
    block: 0,
    passiveText: 'Its momentum alternates between guarded movement and trampling force.',
    intents: [
      attack('hornSweep', 'Horn Sweep', 'The antelope lowers one horn and begins a wide, circling step.', 'A quick attack is coming.', 5),
      guard('boundAway', 'Bound Away', 'Its hooves scrape backward as it measures the distance between you.', 'The creature is preparing to defend itself.', 6),
      attack('trample', 'Trample', 'The Wailing Antelope screams and drives its weight into its forelegs.', 'A heavy attack is coming.', 9, { tags: ['heavy'] })
    ],
    loot: ['hide', 'organ', 'horn', 'wailingHide', 'wailingHorn']
  },
  ashPhoenix: {
    id: 'ashPhoenix',
    creatureId: 'ashPhoenix',
    name: 'Ash Phoenix',
    hp: 42,
    maxHp: 42,
    block: 0,
    passiveText: 'Ash and memory gather around its defensive turns.',
    intents: [
      attack('cinderWing', 'Cinder Wing', 'One burning wing folds across its body, then snaps open.', 'A moderate attack is coming.', 6),
      guard('ashVeil', 'Ash Veil', 'The phoenix dissolves at the edges into a curtain of ash.', 'The creature is preparing a strong defense.', 7),
      attack(
        'memoryBurn',
        'Memory Burn',
        'Its glassy eyes reflect a moment you hoped to forget.',
        'A heavy, disruptive attack is coming.',
        10,
        { effects: [{ type: 'addPanic', amount: 1 }], tags: ['heavy', 'panic'] }
      )
    ],
    loot: ['organ', 'scrap', 'ashFeather', 'burntOrgan']
  }
};
