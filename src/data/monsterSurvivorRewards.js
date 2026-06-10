const themes = {
  paleHuntLion: ['Lion Step', 'Watch the Shoulders', 'Pale Pounce', 'Break the Crouch', 'Hunter Stillness', 'Perfect Predator Stance', 'Stand Against the Pounce', 'Kingless Nerve'],
  wailingAntelope: ['Running Breath', 'Read the Hooves', 'Hunger Rush', 'Break the Trample', 'Hollow-Belly Calm', 'Endless Gallop', 'Kick-Side Guard', 'Devourer Discipline'],
  ashPhoenix: ['Ash Memory', 'Count the Feathers', 'Borrowed Talon', 'Break the Loop', 'Cinder Patience', 'Second-Sun Talons', 'Anchor the Moment', 'Unburnt Thought'],
  bloatedGodling: ['Storm Belly', 'Ground the Charge', 'Thunder Heave', 'Pierce the Swell', 'Heavy Blood', 'Living Conductor', 'Silence the Organ', 'Bone-Deep Resolve'],
  crimsonCrocodile: ['River Stillness', 'Watch the Tail', 'Crimson Roll', 'Dry-Ground Step', 'Scale Patience', 'Black-Water Lunge', 'Break the Jawline', 'Cold-Blooded Guard'],
  frogdog: ['Rubber Step', 'Watch the Tongue', 'Wet Leap', 'Cut the Snare', 'Sideways Sight', 'Many-Mouthed Rush', 'Poison-Safe Breath', 'Unblinking Nerve'],
  silkMatriarch: ['Thread Step', 'Count the Legs', 'Venom Needle', 'Tear the Web', 'Brood Patience', 'Matriarch Flurry', 'Burn the Anchor', 'Silken Nerve'],
  bloomKnight: ['Petal Footwork', 'Read the Point', 'Thorn Riposte', 'Break the Flourish', 'Duelist Root', 'Perfect Bloom', 'Refuse the Duel', 'Garden Discipline'],
  smogSingers: ['Chorus Breath', 'Find the Lead Voice', 'Soot Pulse', 'Break the Harmony', 'Tar-Lung Calm', 'Many-Throated Cry', 'Clear the Smoke', 'Silent Refrain'],
  chitinCrusader: ['Shell Posture', 'Watch the Horn', 'Resin Charge', 'Crack the Plate', 'Amber Patience', 'Crusader Advance', 'Turn the Mandible', 'Unyielding Core'],
  drakeEmperor: ['Furnace Breath', 'Read the Throat', 'Crystal Sweep', 'Quench the Gland', 'Imperial Nerve', 'Molten Dominion', 'Stand Outside the Flame', 'Crowned Resolve'],
  sunSovereign: ['Noon Posture', 'Watch the Shell', 'Radiant Arc', 'Shade the Eye', 'Warm-Blood Calm', 'Sovereign Flash', 'Fold the Light', 'Daybreak Discipline'],
  prideKing: ['Royal Step', 'Read the Mane', 'King Claw', 'Deny the Judgment', 'Proud Nerve', 'Apex Sentence', 'Stand Before the Crown', 'Regal Mastery']
};

const descriptions = {
  mimic: 'The survivor adopts a fragment of the quarry’s movement.',
  counter: 'The survivor learns to interrupt the quarry’s strongest pattern.',
  support: 'The survivor turns quarry knowledge into a warning for the whole party.'
};

function slug(value) {
  return value.replace(/[^a-zA-Z0-9]+(.)/g, (_, letter) => letter.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, letter => letter.toLowerCase());
}

function reward(quarryId, name, level, family, index) {
  const isCard = (level + index) % 2 === 1;
  const rarity = level === 3 ? 'rare' : level === 2 ? 'uncommon' : 'common';
  const id = `${quarryId}_${slug(name)}`;
  const mechanicalEffect = isCard
    ? {
      card: {
        id,
        name,
        cost: level === 3 ? 2 : 1,
        description: family === 'mimic'
          ? `Deal ${4 + level * 2} damage${level >= 2 ? ' and gain 2 block' : ''}.`
          : family === 'counter'
            ? `Gain ${3 + level * 2} block${level >= 2 ? '; your next attack deals +2' : ''}.`
            : `Gain ${2 + level} block. The next party member gains ${level} block.`,
        type: family === 'mimic' ? 'attack' : 'skill',
        effects: family === 'mimic'
          ? [{ type: 'damage', amount: 4 + level * 2 }, ...(level >= 2 ? [{ type: 'block', amount: 2 }] : [])]
          : family === 'counter'
            ? [{ type: 'block', amount: 3 + level * 2 }, ...(level >= 2 ? [{ type: 'nextAttackBonus', amount: 2 }] : [])]
            : [
              { type: 'block', amount: 2 + level },
              { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: level }
            ],
        tags: ['personal', 'monsterReward', family, 'quarrySpecific'],
        sourceType: 'personal',
        implemented: true
      }
    }
    : {
      trait: level === 1
        ? {
          type: family === 'mimic'
            ? 'firstDodgeBlock'
            : family === 'counter' ? 'firstVagueTellBlock' : 'nextPartyBlock',
          amount: 2
        }
        : level === 2
          ? {
            type: family === 'mimic'
              ? 'firstAttackBlock'
              : family === 'counter' ? 'markedDamageReduction' : 'partySurvival',
            amount: 2
          }
          : {
            type: family === 'mimic'
              ? 'threeAttackRecovery'
              : family === 'counter' ? 'firstMonsterAttackReduction' : 'partyRecovery',
            amount: 2
          }
    };
  return {
    id,
    name,
    type: isCard ? 'card' : 'trait',
    family,
    description: descriptions[family],
    effectText: isCard
      ? mechanicalEffect.card.description
      : level === 3
        ? 'Once per combat, gain a strong defensive or recovery benefit from this learned pattern.'
        : 'Once per combat, gain +2 block when this learned pattern is triggered.',
    rarity,
    levelMin: level,
    tags: [
      'monsterReward', family, quarryId, 'quarrySpecific',
      level === 1 ? 'level1' : level === 2 ? 'level2' : 'level3',
      ...(level === 3 ? ['rare'] : []),
      ...(family === 'support' ? ['support', 'party'] : []),
      ...(family === 'counter' ? ['counter'] : []),
      ...(family === 'mimic' ? ['mimic'] : [])
    ],
    mechanicalEffect,
    implemented: true
  };
}

export const monsterSurvivorRewards = Object.fromEntries(
  Object.entries(themes).map(([quarryId, names]) => {
    const rewards = names.map((name, index) => {
      const level = index < 2 ? 1 : index < 5 ? 2 : 3;
      const families = ['mimic', 'counter', 'support'];
      return reward(quarryId, name, level, families[index % families.length], index);
    });
    return [quarryId, {
      quarryId,
      levelRewards: {
        1: rewards.filter(item => item.levelMin === 1),
        2: rewards.filter(item => item.levelMin === 2),
        3: rewards.filter(item => item.levelMin === 3)
      }
    }];
  })
);

export const monsterRewardCards = Object.fromEntries(
  Object.values(monsterSurvivorRewards)
    .flatMap(entry => Object.values(entry.levelRewards).flat())
    .filter(item => item.type === 'card')
    .map(item => [item.id, item.mechanicalEffect.card])
);

export function getMonsterSurvivorRewardChoices(quarryId, level, { includeBane = false } = {}) {
  const entry = monsterSurvivorRewards[quarryId];
  if (!entry) return [];
  const pool = Array.from({ length: level }, (_, index) => entry.levelRewards[index + 1] || []).flat();
  const targetCount = level + 2;
  const ordered = [...pool].sort((a, b) => {
    const levelDelta = b.levelMin - a.levelMin;
    return levelDelta || Math.random() - 0.5;
  });
  const choices = ordered.slice(0, Math.max(0, targetCount - (includeBane ? 1 : 0)));
  return choices;
}

export function findMonsterSurvivorReward(rewardId) {
  return Object.values(monsterSurvivorRewards)
    .flatMap(entry => Object.values(entry.levelRewards).flat())
    .find(item => item.id === rewardId) || null;
}
