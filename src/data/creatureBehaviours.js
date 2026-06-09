const scaledDamage = (offset = 0) => ({ type: 'dealDamage', scalesWithDamage: true, amount: offset });

export const creatureBehaviours = {
  paleHuntLion: {
    id: 'paleHuntLion',
    name: 'Pale Hunt Lion',
    role: 'quarry',
    description: 'A fast predator that punishes hunters who end their turn exposed.',
    levelScaling: {
      1: { hp: 30, damage: 5, rareChance: 0 },
      2: { hp: 45, damage: 7, rareChance: 0.15 },
      3: { hp: 65, damage: 9, rareChance: 0.35 }
    },
    intents: [
      { id: 'clawSwipe', name: 'Claw Swipe', type: 'attack', weight: 4, text: 'A quick, measured rake.', effects: [scaledDamage()] },
      { id: 'pounce', name: 'Pounce', type: 'attack', weight: 2, levelWeights: { 3: 2 }, text: 'A crushing leap that hits harder against an unguarded survivor.', effects: [{ ...scaledDamage(2), bonusIfPlayerNoBlock: 2 }] },
      { id: 'circlePrey', name: 'Circle Prey', type: 'defend', weight: 2, text: 'The lion circles, guarding itself and preparing a stronger attack.', effects: [{ type: 'gainBlock', amount: 5, perLevel: 2 }, { type: 'monsterNextAttackBonus', amount: 1 }] },
      { id: 'rend', name: 'Rend', type: 'attack', weight: 1, levelWeights: { 2: 2, 3: 2 }, text: 'A low rake opens a bleeding wound.', effects: [scaledDamage(-2), { type: 'applyBleed', amount: 2 }] },
      { id: 'terrifyingRoar', name: 'Terrifying Roar', type: 'disruption', weight: 1, levelWeights: { 3: 2 }, text: 'The roar plants Panic in the survivor deck.', effects: [{ type: 'addPanicToPlayerDeck', amount: 1 }] }
    ],
    passiveRules: [
      { id: 'exposedPrey', text: 'If the survivor ends their turn with 0 block, the lion gains +1 damage on its next attack.' }
    ],
    lootTable: ['hide', 'bone', 'claw', 'sinew'],
    rareLootTable: ['monsterTooth', 'fur', 'strangeEye'],
    unlocksOnDefeat: [{ level: 1, quarryId: 'wailingAntelope' }]
  },
  wailingAntelope: {
    id: 'wailingAntelope',
    name: 'Wailing Antelope',
    role: 'quarry',
    description: 'An unstable trampler that recovers when hunters fail to mark it.',
    levelScaling: {
      1: { hp: 34, damage: 5, rareChance: 0 },
      2: { hp: 50, damage: 7, rareChance: 0.18 },
      3: { hp: 72, damage: 10, rareChance: 0.4 }
    },
    intents: [
      { id: 'trample', name: 'Trample', type: 'attack', weight: 4, text: 'The antelope crushes through the survivor guard.', effects: [{ type: 'reducePlayerBlock', amount: 3, perLevel: 1 }, scaledDamage(1)] },
      { id: 'devourGrass', name: 'Devour Grass', type: 'heal', weight: 2, text: 'It tears at pale growth and closes its wounds.', effects: [{ type: 'healMonster', amount: 4, perLevel: 1 }] },
      { id: 'panicWail', name: 'Panic Wail', type: 'disruption', weight: 2, text: 'An impossible cry adds Panic to the discard pile.', effects: [{ type: 'addPanicToPlayerDeck', amount: 1 }] },
      { id: 'wildKick', name: 'Wild Kick', type: 'attack', weight: 3, text: 'Two erratic kicks strike in quick succession.', effects: [{ type: 'multiHitDamage', scalesWithDamage: true, amount: -2, hits: 2 }] },
      { id: 'fleeingCharge', name: 'Fleeing Charge', type: 'defend', weight: 1, levelWeights: { 2: 1, 3: 2 }, text: 'It bounds away behind a wall of momentum and prepares a charge.', effects: [{ type: 'gainBlock', amount: 4, perLevel: 2 }, { type: 'monsterNextAttackBonus', amount: 2 }] }
    ],
    passiveRules: [
      { id: 'grazeRecovery', text: 'After every third monster turn, heal 3 HP if the antelope is not marked.' }
    ],
    lootTable: ['hide', 'organ', 'horn', 'sinew'],
    rareLootTable: ['strangeEye', 'ichor'],
    unlocksOnDefeat: [{ level: 1, quarryId: 'ashPhoenix' }]
  },
  ashPhoenix: {
    id: 'ashPhoenix',
    name: 'Ash Phoenix',
    role: 'quarry',
    description: 'A temporal predator that burns holes in the survivor deck.',
    levelScaling: {
      1: { hp: 38, damage: 6, rareChance: 0.08 },
      2: { hp: 56, damage: 8, rareChance: 0.25 },
      3: { hp: 80, damage: 11, rareChance: 0.5 }
    },
    intents: [
      { id: 'ashWing', name: 'Ash Wing', type: 'attack', weight: 3, text: 'A burning wing strikes and leaves Panic behind.', effects: [scaledDamage(), { type: 'addPanicToPlayerDeck', amount: 1 }] },
      { id: 'timeShudder', name: 'Time Shudder', type: 'disruption', weight: 2, levelWeights: { 2: 1, 3: 1 }, text: 'Time buckles. The survivor loses 1 energy next turn.', effects: [{ type: 'playerEnergyPenaltyNextTurn', amount: 1 }] },
      { id: 'moltingFire', name: 'Molting Fire', type: 'defend', weight: 2, text: 'Burning feathers harden into a shield as the phoenix heals.', effects: [{ type: 'gainBlock', amount: 5, perLevel: 2 }, { type: 'healMonster', amount: 2, perLevel: 1 }] },
      { id: 'burningMemory', name: 'Burning Memory', type: 'disruption', weight: 2, levelWeights: { 3: 1 }, text: 'A memory burns away and ash clogs the discard pile.', effects: [{ type: 'discardRandomCard', amount: 1 }, { type: 'drawDisruption', cardId: 'ash', amount: 1 }] },
      { id: 'talonSpiral', name: 'Talon Spiral', type: 'attack', weight: 3, levelWeights: { 3: 1 }, text: 'Three talon strikes spiral through the air.', effects: [{ type: 'multiHitDamage', scalesWithDamage: true, amount: -3, hits: 3 }] }
    ],
    passiveRules: [
      { id: 'memoryShed', text: 'Each time the phoenix crosses a quarter-health threshold, it adds Ash to the discard pile.' }
    ],
    lootTable: ['organ', 'strangeEye', 'ichor', 'scrap'],
    rareLootTable: ['phoenixAsh', 'timeBone'],
    unlocksOnDefeat: []
  }
};

const placeholder = (id, name, role, description, designTags, unlockHint) => ({
  id, name, role, description, designTags, implemented: false, unlockHint
});

export const creatureBehaviourPlaceholders = [
  placeholder('bloatedGodling', 'Bloated Godling', 'quarry', 'A heavy thunder creature built around organs and crushing attacks.', ['thunder', 'heavy', 'organs'], 'Build Bone Smith or defeat Pale Hunt Lion Level 2.'),
  placeholder('silkMatriarch', 'Silk Matriarch', 'quarry', 'A binding poison creature that controls the survivor hand.', ['web', 'poison', 'bind'], 'Defeat Wailing Antelope Level 2.'),
  placeholder('bloomKnight', 'Bloom Knight', 'quarry', 'A precise duelist focused on ripostes.', ['duel', 'riposte', 'precision'], 'Build Skinnery and defeat any Level 2 quarry.'),
  placeholder('chitinCrusader', 'Chitin Crusader', 'quarry', 'An armoured guard creature resistant to light attacks.', ['armour', 'guard', 'blunt'], 'Defeat any Level 3 quarry.'),
  placeholder('drakeEmperor', 'Drake Emperor', 'finale', 'A phased crystal and fire encounter.', ['fire', 'crystal', 'phase'], 'Future campaign milestone.'),
  placeholder('sunSovereign', 'Sun Sovereign', 'finale', 'A radiant shell creature that blinds hunters.', ['blind', 'shell', 'radiant'], 'Future campaign milestone.'),
  placeholder('prideKing', 'Pride King', 'finale', 'A punishing monarch with breakable armour.', ['armour break', 'pride', 'punishment'], 'Future campaign milestone.'),
  placeholder('cruelCollector', 'Cruel Collector', 'nemesis', 'A hook-bearing collector of survivors and gear.', ['collection', 'hooks'], 'Future nemesis system.'),
  placeholder('wanderingKiller', 'Wandering Killer', 'nemesis', 'An ambushing executioner.', ['ambush', 'execution'], 'Future nemesis system.'),
  placeholder('maskedJudge', 'Masked Judge', 'nemesis', 'A masked enemy that issues changing verdicts.', ['verdict', 'mask'], 'Future nemesis system.'),
  placeholder('regalKnight', 'Regal Knight', 'nemesis', 'An armoured challenger built around formal duels.', ['duel', 'armour'], 'Future nemesis system.'),
  placeholder('shadowStalker', 'Shadow Stalker', 'nemesis', 'A stalking enemy that grows stronger in darkness.', ['darkness', 'stalk'], 'Future nemesis system.'),
  placeholder('mirrorTyrant', 'Mirror Tyrant', 'nemesis', 'A tyrant that copies survivor techniques.', ['copy', 'reflection'], 'Future nemesis system.')
];

export const creatureBehaviourList = [
  ...Object.values(creatureBehaviours).map(behaviour => ({ ...behaviour, implemented: true })),
  ...creatureBehaviourPlaceholders
];

export function getCreatureBehaviour(id) {
  return creatureBehaviours[id] || creatureBehaviours.paleHuntLion;
}
