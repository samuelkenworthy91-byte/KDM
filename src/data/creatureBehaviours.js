import { quarryList } from './quarries.js';

const intent = (id, name, tellText, revealedText, effects, tags, weight = 1, levelWeights = {}) => ({
  id, name, tellText, revealedText, effects, tags, weight, levelWeights
});

const mainIntents = {
  paleHuntLion: [
    intent('lowCrouch', 'Low Crouch', 'The lion crouches low, muscles trembling.', 'Low Crouch: deals 8 damage and +2 more if the survivor has no block.', [{ type: 'dealDamage', amount: 8 }, { type: 'bonusIfPlayerNoBlock', amount: 2 }], ['attack', 'heavy'], 2, { 3: 2 }),
    intent('draggingClaw', 'Dragging Claw', 'One claw drags slowly through the dirt.', 'Dragging Claw: deals 5 damage and applies 2 Bleed.', [{ type: 'dealDamage', amount: 5 }, { type: 'applyBleed', amount: 2 }], ['attack', 'bleed'], 1, { 2: 2 }),
    intent('lanternShakingRoar', 'Lantern-Shaking Roar', 'Its throat swells. The lantern light trembles.', 'Lantern-Shaking Roar: adds 1 Panic.', [{ type: 'addPanic', amount: 1 }], ['panic'], 1, { 3: 2 }),
    intent('circlingHunger', 'Circling Hunger', 'The lion moves where the lantern light is weakest.', 'Circling Hunger: gains 5 block and +1 next attack damage.', [{ type: 'gainBlock', amount: 5 }, { type: 'nextAttackBonus', amount: 1 }], ['predator'])
  ],
  wailingAntelope: [
    intent('hoovesInDust', 'Hooves in the Dust', 'The antelope drives its weight into its forelegs.', 'Hooves in the Dust: removes 3 player block and deals 8 damage.', [{ type: 'reducePlayerBlock', amount: 3 }, { type: 'dealDamage', amount: 8 }], ['attack', 'trample'], 2),
    intent('devour', 'Devour Grass', 'It tears pale growth from between the stones.', 'Devour Grass: heals 5 HP.', [{ type: 'healMonster', amount: 5 }], ['heal']),
    intent('wailingChest', 'Wailing Chest', 'Its lungs swell beyond the shape of its ribs.', 'Wailing Chest: adds 1 Panic.', [{ type: 'addPanic', amount: 1 }], ['panic'], 1, { 3: 1 }),
    intent('blindKick', 'Blind Kick', 'Its hind legs twitch in different rhythms.', 'Blind Kick: deals 4 damage twice.', [{ type: 'multiHitDamage', amount: 4, hits: 2 }], ['attack', 'multi'], 2, { 2: 1 })
  ],
  ashPhoenix: [
    intent('ashWing', 'Ash Wing', 'A burning wing folds across its body.', 'Ash Wing: deals 7 damage and adds 1 Panic.', [{ type: 'dealDamage', amount: 7 }, { type: 'addPanic', amount: 1 }], ['attack', 'ash'], 2),
    intent('timeShudder', 'Time Shudder', 'The same feather falls twice.', 'Time Shudder: player loses 1 energy next turn.', [{ type: 'playerEnergyPenaltyNextTurn', amount: 1 }], ['time']),
    intent('burningMemory', 'Burning Memory', 'Its eyes reflect a moment you tried to forget.', 'Burning Memory: discards 1 random card and adds 1 Panic.', [{ type: 'discardRandomCard', amount: 1 }, { type: 'addPanic', amount: 1 }], ['disruptive'], 1, { 2: 1 }),
    intent('talonSpiral', 'Talon Spiral', 'Three burning shadows rotate around its claws.', 'Talon Spiral: deals 3 damage three times.', [{ type: 'multiHitDamage', amount: 3, hits: 3 }], ['attack', 'multi'], 2, { 3: 2 })
  ],
  bloatedGodling: [
    intent('thunderBelly', 'Thunder Belly', 'Lightning crawls across its swollen abdomen.', 'Thunder Belly: deals 9 damage.', [{ type: 'dealDamage', amount: 9 }], ['thunder', 'attack'], 2),
    intent('boneDeepSlam', 'Bone-Deep Slam', 'Its whole body rises a handspan above the ground.', 'Bone-Deep Slam: deals 5 damage twice.', [{ type: 'multiHitDamage', amount: 5, hits: 2 }], ['heavy'], 2, { 3: 1 }),
    intent('staticBellow', 'Static Bellow', 'Its mouth fills with blue static.', 'Static Bellow: adds 1 Panic and enrages by 1.', [{ type: 'addPanic', amount: 1 }, { type: 'monsterEnrage', amount: 1 }], ['panic']),
    intent('organSurge', 'Organ Surge', 'Organs roll beneath its hide toward the wound.', 'Organ Surge: heals 5 HP and gains 6 block.', [{ type: 'healMonster', amount: 5 }, { type: 'gainBlock', amount: 6 }], ['heal', 'guard'])
  ],
  crimsonCrocodile: [
    intent('deathRoll', 'Death Roll', 'Its body twists before its jaws move.', 'Death Roll: deals 4 damage three times.', [{ type: 'multiHitDamage', amount: 4, hits: 3 }], ['attack', 'bleed'], 2),
    intent('riverLunge', 'River Lunge', 'Dark water gathers beneath its feet.', 'River Lunge: deals 9 damage.', [{ type: 'dealDamage', amount: 9 }], ['ambush'], 2),
    intent('crimsonHide', 'Crimson Hide', 'Its scales lift and lock together.', 'Crimson Hide: gains 10 block.', [{ type: 'gainBlock', amount: 10 }], ['armour']),
    intent('dragUnder', 'Drag Under', 'Its tail draws a circle around the survivor.', 'Drag Under: removes 4 block, deals 6 damage, applies Marked.', [{ type: 'reducePlayerBlock', amount: 4 }, { type: 'dealDamage', amount: 6 }, { type: 'applyMarked', amount: 1 }], ['control'])
  ],
  frogdog: [
    intent('tongueSnare', 'Tongue Snare', 'Its mouth opens while its body remains still.', 'Tongue Snare: removes 3 block and deals 6 damage.', [{ type: 'reducePlayerBlock', amount: 3 }, { type: 'dealDamage', amount: 6 }], ['tongue']),
    intent('toxicBelch', 'Toxic Belch', 'A colored bubble rises through its throat.', 'Toxic Belch: adds 1 Panic and applies 1 Bleed.', [{ type: 'addPanic', amount: 1 }, { type: 'applyBleed', amount: 1 }], ['poison']),
    intent('wetLeap', 'Wet Leap', 'Its limbs compress into its shining body.', 'Wet Leap: deals 8 damage.', [{ type: 'dealDamage', amount: 8 }], ['attack'], 2),
    intent('bulgingStare', 'Bulging Stare', 'Both eyes turn inward toward a private sight.', 'Bulging Stare: player loses 1 energy next turn.', [{ type: 'playerEnergyPenaltyNextTurn', amount: 1 }], ['disruptive'])
  ],
  silkMatriarch: [
    intent('webBind', 'Web Bind', 'Fine strands tighten across the path.', 'Web Bind: removes 4 block and player loses 1 energy next turn.', [{ type: 'reducePlayerBlock', amount: 4 }, { type: 'playerEnergyPenaltyNextTurn', amount: 1 }], ['web']),
    intent('venomKiss', 'Venom Kiss', 'Its mouthparts shine with a careful drop.', 'Venom Kiss: deals 6 damage and applies 2 Bleed.', [{ type: 'dealDamage', amount: 6 }, { type: 'applyBleed', amount: 2 }], ['poison'], 2),
    intent('skitterAway', 'Skitter Away', 'Its many feet make one soft sound.', 'Skitter Away: gains 9 block.', [{ type: 'gainBlock', amount: 9 }], ['evasive']),
    intent('eggTremor', 'Egg Tremor', 'The sacs beneath it shiver in sequence.', 'Egg Tremor: deals 3 damage twice and adds 1 Panic.', [{ type: 'multiHitDamage', amount: 3, hits: 2 }, { type: 'addPanic', amount: 1 }], ['swarm'], 1, { 3: 2 })
  ],
  bloomKnight: [
    intent('flourish', 'Flourish', 'A thorn traces a perfect circle in the air.', 'Flourish: gains 6 block and +1 next attack.', [{ type: 'gainBlock', amount: 6 }, { type: 'nextAttackBonus', amount: 1 }], ['duel']),
    intent('thornRiposte', 'Thorn Riposte', 'The knight waits with its point turned aside.', 'Thorn Riposte: gains 8 block and enrages by 1.', [{ type: 'gainBlock', amount: 8 }, { type: 'monsterEnrage', amount: 1 }], ['riposte']),
    intent('petalStep', 'Petal Step', 'Petals settle where the knight no longer stands.', 'Petal Step: gains 5 block and discards 1 random card.', [{ type: 'gainBlock', amount: 5 }, { type: 'discardRandomCard', amount: 1 }], ['evasive']),
    intent('perfectThrust', 'Perfect Thrust', 'Every line of its body points at one opening.', 'Perfect Thrust: deals 10 damage.', [{ type: 'dealDamage', amount: 10 }], ['precision'], 2, { 3: 2 })
  ],
  smogSingers: [
    intent('chokingChorus', 'Choking Chorus', 'Several throats inhale on the same beat.', 'Choking Chorus: adds 2 Panic.', [{ type: 'addPanic', amount: 2 }], ['sound']),
    intent('sootBreath', 'Soot Breath', 'Black breath gathers behind their masks.', 'Soot Breath: deals 7 damage and removes 2 block.', [{ type: 'reducePlayerBlock', amount: 2 }, { type: 'dealDamage', amount: 7 }], ['smoke']),
    intent('harmonicPulse', 'Harmonic Pulse', 'Their ribs vibrate in a shared rhythm.', 'Harmonic Pulse: deals 4 damage twice.', [{ type: 'multiHitDamage', amount: 4, hits: 2 }], ['sound'], 2),
    intent('smokeVeil', 'Smoke Veil', 'Their outlines merge into one dark cloud.', 'Smoke Veil: gains 9 block.', [{ type: 'gainBlock', amount: 9 }], ['guard'])
  ],
  chitinCrusader: [
    intent('shellUp', 'Shell Up', 'Every plate closes toward a single seam.', 'Shell Up: gains 12 block.', [{ type: 'gainBlock', amount: 12 }], ['armour'], 2),
    intent('hornCharge', 'Horn Charge', 'Its horn lowers until it touches the ground.', 'Horn Charge: deals 10 damage.', [{ type: 'dealDamage', amount: 10 }], ['charge'], 2),
    intent('resinGuard', 'Resin Guard', 'Amber blood hardens across damaged plates.', 'Resin Guard: heals 3 HP and gains 7 block.', [{ type: 'healMonster', amount: 3 }, { type: 'gainBlock', amount: 7 }], ['guard']),
    intent('crushingMandibles', 'Crushing Mandibles', 'Its jaws open with a grinding click.', 'Crushing Mandibles: deals 5 damage twice.', [{ type: 'multiHitDamage', amount: 5, hits: 2 }], ['attack'], 1, { 3: 2 })
  ],
  drakeEmperor: [
    intent('fireGlandFlare', 'Fire Gland Flare', 'Orange light moves beneath its throat scales.', 'Fire Gland Flare: deals 9 damage and applies 1 Bleed.', [{ type: 'dealDamage', amount: 9 }, { type: 'applyBleed', amount: 1 }], ['fire']),
    intent('crystalSweep', 'Crystal Sweep', 'Crystal bones ring against one another.', 'Crystal Sweep: deals 4 damage twice.', [{ type: 'multiHitDamage', amount: 4, hits: 2 }], ['crystal']),
    intent('imperialRoar', 'Imperial Roar', 'The air kneels before the sound.', 'Imperial Roar: adds 1 Panic and enrages by 2.', [{ type: 'addPanic', amount: 1 }, { type: 'monsterEnrage', amount: 2 }], ['pressure']),
    intent('moltenBite', 'Molten Bite', 'Its jaw glows through sealed teeth.', 'Molten Bite: deals 11 damage.', [{ type: 'dealDamage', amount: 11 }], ['attack'], 2, { 3: 2 })
  ],
  sunSovereign: [
    intent('blindingFlash', 'Blinding Flash', 'Its shell opens around a point of white light.', 'Blinding Flash: player loses 1 energy and discards 1 random card.', [{ type: 'playerEnergyPenaltyNextTurn', amount: 1 }, { type: 'discardRandomCard', amount: 1 }], ['blind']),
    intent('solarShell', 'Solar Shell', 'Radiance hardens over its body.', 'Solar Shell: gains 12 block.', [{ type: 'gainBlock', amount: 12 }], ['shell'], 2),
    intent('radiantBite', 'Radiant Bite', 'A mouth appears in the brightest part of its shell.', 'Radiant Bite: deals 10 damage.', [{ type: 'dealDamage', amount: 10 }], ['attack']),
    intent('heatMirage', 'Heat Mirage', 'Several false bodies step away from the true one.', 'Heat Mirage: gains 7 block and +2 next attack.', [{ type: 'gainBlock', amount: 7 }, { type: 'nextAttackBonus', amount: 2 }], ['evasive'])
  ],
  prideKing: [
    intent('royalMaul', 'Royal Maul', 'The king advances without looking at the survivor.', 'Royal Maul: deals 11 damage.', [{ type: 'dealDamage', amount: 11 }], ['attack'], 2),
    intent('judgementStare', 'Judgement Stare', 'One golden eye measures every retreat.', 'Judgement Stare: adds 1 Panic and applies Marked.', [{ type: 'addPanic', amount: 1 }, { type: 'applyMarked', amount: 1 }], ['judgement']),
    intent('maneGuard', 'Mane Guard', 'The mane rises into a wall of hooked gold.', 'Mane Guard: gains 11 block.', [{ type: 'gainBlock', amount: 11 }], ['guard']),
    intent('punishCowardice', 'Punish Cowardice', 'The king bares its teeth at lowered weapons.', 'Punish Cowardice: deals 8 damage and +3 if player has no block.', [{ type: 'dealDamage', amount: 8 }, { type: 'bonusIfPlayerNoBlock', amount: 3 }], ['punishment'], 1, { 3: 2 })
  ]
};

const genericSets = {
  predator: mainIntents.paleHuntLion,
  brute: mainIntents.bloatedGodling,
  armoured: mainIntents.chitinCrusader,
  evasive: mainIntents.bloomKnight,
  poison: mainIntents.silkMatriarch,
  radiant: mainIntents.sunSovereign,
  disruptive: mainIntents.ashPhoenix,
  duelist: mainIntents.bloomKnight,
  swarm: mainIntents.smogSingers,
  nightmare: mainIntents.prideKing
};

const passiveRules = {
  paleHuntLion: [{ type: 'attackBonusIfPlayerNoBlock', amount: 1 }],
  wailingAntelope: [{ type: 'healEveryMonsterTurns', turns: 3, amount: 3 }],
  bloatedGodling: [{ type: 'enrageAfterRepeatedHits', hits: 3, amount: 1 }]
};
const passiveText = {
  paleHuntLion: {
    tell: 'The lion watches every opening left by a lowered guard.',
    revealed: 'If the survivor ends the turn with 0 block, the next attack deals +1 damage.'
  },
  wailingAntelope: {
    tell: 'Its wounds pulse in time with a distant rhythm.',
    revealed: 'At the end of every third monster turn, it heals 3 HP.'
  },
  ashPhoenix: {
    tell: 'Loose ash gathers around memories that have not happened yet.',
    revealed: 'Its Time and Memory intents disrupt energy, cards, and the discard pile.'
  },
  bloatedGodling: {
    tell: 'Every impact makes the charge beneath its skin answer more violently.',
    revealed: 'After taking three hits in one survivor turn, it gains 1 Enrage.'
  }
};

function buildPack(quarry) {
  const intents = mainIntents[quarry.id] ||
    genericSets[quarry.fallbackBehaviourId] ||
    genericSets[quarry.designTags?.[0]] ||
    genericSets.brute;
  return {
    id: quarry.behaviourId || `fallback_${quarry.id}`,
    creatureId: quarry.id,
    displayName: quarry.displayName,
    passiveTell: passiveText[quarry.id]?.tell ||
      `${quarry.displayName} shifts according to its ${quarry.designTags.join(' and ')} nature.`,
    passiveRevealedText: passiveText[quarry.id]?.revealed ||
      `${quarry.displayName} uses a ${quarry.implemented ? 'unique' : 'fallback'} ${quarry.designTags.join('/')} behaviour pack.`,
    passiveRules: passiveRules[quarry.id] || [],
    intents: intents.map(item => ({ ...item, effects: item.effects.map(effect => ({ ...effect })) })),
    levelScaling: {
      1: { hp: 1, damage: 0, dangerousWeight: 0 },
      2: { hp: 1.35, damage: 1, dangerousWeight: 1 },
      3: { hp: 1.75, damage: 3, dangerousWeight: 2 }
    }
  };
}

export const creatureBehaviours = Object.fromEntries(
  quarryList.filter(quarry => quarry.huntable).map(quarry => [quarry.id, buildPack(quarry)])
);

export function getCreatureBehaviour(quarryId) {
  return creatureBehaviours[quarryId] || null;
}
