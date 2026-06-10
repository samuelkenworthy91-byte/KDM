const intent = (id, name, tellText, revealedText, effects, tags = []) => ({
  id,
  name,
  tellText,
  revealedText,
  effects,
  tags,
  weight: 1,
  levelWeights: {}
});

const lore = (title, paragraphs) => ({ title, paragraphs });

export const nemesisEncounters = {
  cruelCollector: {
    id: 'cruelCollector',
    displayName: 'The Cruel Collector',
    description: 'A figure that comes to claim trophies from the living.',
    firstLanternYear: 5,
    repeatInterval: 10,
    warningText: 'Something beyond the lanternlight has counted your dead and found your living wanting.',
    loreIntro: lore('The Counting Sound', [
      'Three nights before it arrives, the settlement hears bone tapping against bone.',
      'No one sees the visitor. No footprints mark the ash. But every survivor wakes with the same dream: a hand selecting trophies from a row of sleeping mouths.',
      'On the fourth morning, something has counted the living.'
    ]),
    repeatLoreText: 'The Counting Sound returns. The Cruel Collector has not forgotten the settlement.',
    preparationText: 'Choose who will answer the count. Resources and bound gear may be taken if they fail.',
    victoryText: 'The Collector withdraws without its chosen trophies.',
    defeatText: 'The Collector leaves carrying proof that the settlement could not protect its own.',
    behaviourId: 'cruelCollector',
    rewards: { settlementMemory: 2, resources: ['scrap'], innovationIds: ['trophyRites'] },
    defeatConsequences: { populationLoss: 1, randomResourceLoss: 2, disorderId: 'nightTerrors' },
    implemented: true
  },
  maskedJudge: {
    id: 'maskedJudge',
    displayName: 'The Masked Judge',
    description: 'A silent lawbringer that punishes settlements with too much memory and too little order.',
    firstLanternYear: 9,
    repeatInterval: 10,
    warningText: 'The lantern flames stand straight. A law without words has arrived to measure the settlement.',
    loreIntro: lore('The Law Without Words', [
      'The lanterns burn straight and narrow, their flames refusing to flicker.',
      'Arguments stop mid-sentence. Children lower their eyes. The settlement feels, all at once, that it has broken a law it never learned.',
      'At the edge of the light, a mask waits to hear a confession.'
    ]),
    repeatLoreText: 'The flames stand straight again. The Masked Judge has returned to hear what the settlement has become.',
    preparationText: 'Choose a survivor to stand beneath the raised mask. The settlement memory will be weighed.',
    victoryText: 'The mask lowers. For this year, the settlement is permitted to endure.',
    defeatText: 'The verdict is delivered without a voice.',
    behaviourId: 'maskedJudge',
    rewards: { settlementMemory: 2, innovationIds: ['settlementLaw'] },
    defeatConsequences: { settlementMemoryLoss: 2, disorderId: 'paranoia', populationLossIfNoMemory: 1 },
    implemented: true
  },
  wanderingKiller: {
    id: 'wanderingKiller',
    displayName: 'The Wandering Killer',
    description: 'A murderer at the edge of lanternlight.',
    firstLanternYear: 12,
    repeatInterval: 10,
    warningText: 'A clean blade has been left among the sleeping places. Someone has followed the hunters home.',
    loreIntro: lore('No One Walks Alone', [
      'The first sign is not a body, but a silence.',
      'Tracks appear inside the settlement ring. A blade is found resting beside the sleeping places, clean enough to reflect a frightened eye.',
      'By dusk, every survivor understands: someone has followed them home.'
    ]),
    repeatLoreText: 'The silence returns before the footsteps. The Wandering Killer is close.',
    preparationText: 'Choose who will hunt the hunter. A wounded survivor will be especially vulnerable.',
    victoryText: 'The footsteps turn away from the lantern ring.',
    defeatText: 'The Killer leaves one final track inside the settlement.',
    behaviourId: 'wanderingKiller',
    rewards: { survivorStrength: 1, fightingArt: true },
    defeatConsequences: { selectedSurvivorDies: true, deepCutIfSurvives: true },
    implemented: true
  },
  shadowStalker: {
    id: 'shadowStalker',
    displayName: 'The Shadow Stalker',
    description: 'A thing that follows survivors home from the hunt.',
    firstLanternYear: 16,
    repeatInterval: 10,
    warningText: 'Every shadow points toward the settlement, no matter where the lanterns stand.',
    loreIntro: lore('The Shape Behind the Flame', [
      'The lanternlight grows longer than it should.',
      'Shadows stop obeying the bodies that cast them. One survivor turns quickly and sees their own outline still standing behind them.',
      'Something has learned the settlement’s shape.'
    ]),
    repeatLoreText: 'The shadows stretch in the wrong direction. The Shadow Stalker has found the settlement again.',
    preparationText: 'Choose a survivor whose shadow can be trusted. Panic will follow the fight home.',
    victoryText: 'The lanternlight contracts. Every shadow belongs to a living body again.',
    defeatText: 'The settlement wakes with fear already inside its walls.',
    behaviourId: 'shadowStalker',
    rewards: { removePanic: 1, resources: ['strangeEye'] },
    defeatConsequences: { panic: 2, populationLossIfNoSurvivor: 1 },
    implemented: true
  },
  mirrorTyrant: {
    id: 'mirrorTyrant',
    displayName: 'The Mirror Tyrant',
    description: 'A reflective ruler that turns the settlement’s strengths against it.',
    firstLanternYear: 20,
    repeatInterval: 10,
    warningText: 'The settlement appears in every dark surface, kneeling before a ruler it has never seen.',
    loreIntro: lore('The King in the Reflection', [
      'Every polished surface darkens.',
      'Water bowls show a throne. Blades show a crown. In the pupils of the living, something vast and patient sits upright.',
      'The settlement has become a mirror, and the mirror has found its ruler.'
    ]),
    repeatLoreText: 'The reflections darken once more. The Mirror Tyrant sits waiting behind every eye.',
    preparationText: 'Choose carefully. Strength, guard, and a swollen deck can all be reflected back.',
    victoryText: 'The throne fractures. The settlement sees only itself again.',
    defeatText: 'The Tyrant takes a piece of the settlement into the dark glass.',
    behaviourId: 'mirrorTyrant',
    rewards: { settlementMemory: 3, innovationIds: ['mirrorDoctrine'] },
    defeatConsequences: { loseBuiltInnovation: 1, settlementMemoryLossFallback: 3 },
    implemented: true
  }
};

export const nemesisList = Object.values(nemesisEncounters);

export const nemesisBehaviours = {
  cruelCollector: {
    passiveTell: 'Its attention moves between the survivor and everything the settlement has made.',
    passiveRevealedText: 'Precise attacks punish an open guard and disrupt the survivor deck.',
    passiveRules: [{ type: 'attackBonusIfPlayerNoBlock', amount: 1 }],
    intents: [
      intent('trophyMark', 'Trophy Mark', 'A hooked finger settles on one living feature.', 'Trophy Mark: applies Marked and adds 1 Panic.', [{ type: 'applyMarked', amount: 1 }, { type: 'addPanic', amount: 1 }]),
      intent('hookedBlade', 'Hooked Blade', 'A narrow blade turns toward the gap beside the guard.', 'Hooked Blade: deals 8 damage and 3 more if the survivor has no block.', [{ type: 'dealDamage', amount: 8 }, { type: 'bonusIfPlayerNoBlock', amount: 3 }]),
      intent('countTheLiving', 'Count the Living', 'Bone taps answer one another around the lantern ring.', 'Count the Living: adds 2 Panic.', [{ type: 'addPanic', amount: 2 }]),
      intent('takeAPrize', 'Take a Prize', 'Its empty hand closes as if something already rests inside it.', 'Take a Prize: deals 5 damage and discards 2 cards from the draw pile.', [{ type: 'dealDamage', amount: 5 }, { type: 'discardRandomCard', amount: 2 }])
    ]
  },
  maskedJudge: {
    passiveTell: 'The mask grows heavier whenever old stories are spoken.',
    passiveRevealedText: 'Judgement attacks add Panic and repeatedly strip away guard.',
    passiveRules: [],
    intents: [
      intent('silentVerdict', 'Silent Verdict', 'The mask tilts by the width of a final decision.', 'Silent Verdict: deals 9 damage.', [{ type: 'dealDamage', amount: 9 }]),
      intent('weighedSin', 'Weighed Sin', 'Invisible scales pull the survivor’s arms apart.', 'Weighed Sin: removes 5 block and deals 6 damage.', [{ type: 'reducePlayerBlock', amount: 5 }, { type: 'dealDamage', amount: 6 }]),
      intent('raisedMask', 'Raised Mask', 'The Judge raises its face and the lanterns dim beneath it.', 'Raised Mask: adds 2 Panic and gains 6 block.', [{ type: 'addPanic', amount: 2 }, { type: 'gainBlock', amount: 6 }]),
      intent('sentence', 'Sentence', 'One hand traces a line from the survivor to the ground.', 'Sentence: deals 4 damage twice and adds 1 Panic.', [{ type: 'multiHitDamage', amount: 4, hits: 2 }, { type: 'addPanic', amount: 1 }])
    ]
  },
  wanderingKiller: {
    passiveTell: 'It watches old wounds more closely than the weapon in the survivor’s hand.',
    passiveRevealedText: 'The Killer deals high damage but builds little defence.',
    passiveRules: [{ type: 'attackBonusIfSurvivorWounded', amount: 2 }],
    intents: [
      intent('suddenCut', 'Sudden Cut', 'The blade is already moving when its shoulder turns.', 'Sudden Cut: deals 10 damage.', [{ type: 'dealDamage', amount: 10 }]),
      intent('noWitness', 'No Witness', 'The Killer glances past the survivor toward the empty dark.', 'No Witness: deals 7 damage and adds 1 Panic.', [{ type: 'dealDamage', amount: 7 }, { type: 'addPanic', amount: 1 }]),
      intent('bloodTrail', 'Blood Trail', 'The blade lowers until its point follows an old wound.', 'Blood Trail: deals 6 damage and applies 2 Bleed.', [{ type: 'dealDamage', amount: 6 }, { type: 'applyBleed', amount: 2 }]),
      intent('killersRush', 'Killer’s Rush', 'Both feet leave the ash at once.', 'Killer’s Rush: deals 5 damage twice.', [{ type: 'multiHitDamage', amount: 5, hits: 2 }])
    ]
  },
  shadowStalker: {
    passiveTell: 'Its shape slips whenever the survivor tries to hold a single plan in mind.',
    passiveRevealedText: 'The Stalker removes block, disrupts the draw pile, and adds Panic.',
    passiveRules: [],
    intents: [
      intent('behindYou', 'Behind You', 'Breath touches the survivor from the side without a shadow.', 'Behind You: removes all player block and deals 6 damage.', [{ type: 'removeAllPlayerBlock' }, { type: 'dealDamage', amount: 6 }]),
      intent('snuffLantern', 'Snuff Lantern', 'A dark hand closes around light that is not there.', 'Snuff Lantern: discards 2 cards and removes 1 energy next turn.', [{ type: 'discardRandomCard', amount: 2 }, { type: 'playerEnergyPenaltyNextTurn', amount: 1 }]),
      intent('longShadow', 'Long Shadow', 'Its outline crosses the survivor before its body moves.', 'Long Shadow: gains 8 block and adds 1 Panic.', [{ type: 'gainBlock', amount: 8 }, { type: 'addPanic', amount: 1 }]),
      intent('panicBreath', 'Panic Breath', 'The survivor’s own frightened breath answers from behind.', 'Panic Breath: adds 2 Panic.', [{ type: 'addPanic', amount: 2 }])
    ]
  },
  mirrorTyrant: {
    passiveTell: 'Every strong stance returns from its surface with a crueler posture.',
    passiveRevealedText: 'The Tyrant copies strength and block, and punishes large decks.',
    passiveRules: [],
    intents: [
      intent('reflectGuard', 'Reflect Guard', 'A second shield rises inside the dark reflection.', 'Reflect Guard: gains block equal to player block plus 4.', [{ type: 'copyPlayerBlock', amount: 4 }]),
      intent('borrowedStrength', 'Borrowed Strength', 'The reflection grips its weapon with the survivor’s own confidence.', 'Borrowed Strength: deals 6 damage plus twice player strength.', [{ type: 'damageFromPlayerStrength', amount: 6, multiplier: 2 }]),
      intent('crackedReflection', 'Cracked Reflection', 'Hairline fractures divide every card-shaped thought.', 'Cracked Reflection: discards 2 cards and deals 1 damage per 5 cards in the run deck.', [{ type: 'discardRandomCard', amount: 2 }, { type: 'damageFromDeckSize', divisor: 5 }]),
      intent('tyrantsCommand', 'Tyrant’s Command', 'The throne in its chest leans forward.', 'Tyrant’s Command: deals 8 damage and adds 1 Panic.', [{ type: 'dealDamage', amount: 8 }, { type: 'addPanic', amount: 1 }])
    ]
  }
};

export function getNemesisForLanternYear(year) {
  return nemesisList.find(nemesis =>
    nemesis.implemented &&
    (year === nemesis.firstLanternYear ||
      (nemesis.repeatInterval &&
        year > nemesis.firstLanternYear &&
        (year - nemesis.firstLanternYear) % nemesis.repeatInterval === 0))
  ) || null;
}

export function getNemesisBehaviour(id) {
  return nemesisBehaviours[id] || null;
}
