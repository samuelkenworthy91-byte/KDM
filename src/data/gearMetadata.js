export const weaponStyleDefinitions = {
  sword: {
    hands: 1,
    speedStyle: 'balanced',
    keywords: ['Precise', 'Duelist'],
    requiredTags: ['precise'],
    identity: 'precise, reliable cuts'
  },
  axe: {
    hands: 1,
    speedStyle: 'heavy',
    keywords: ['Brutal', 'Guardbreaker'],
    requiredTags: ['heavy', 'breaker'],
    identity: 'heavy armour breaking'
  },
  dagger: {
    hands: 1,
    speedStyle: 'quick',
    keywords: ['Quick', 'Bleeding'],
    requiredTags: ['quick', 'bleed'],
    identity: 'quick cuts, bleed, and marked prey'
  },
  spear: {
    hands: 1,
    speedStyle: 'precise',
    keywords: ['Reach', 'Defensive'],
    requiredTags: ['reach', 'limbHunter'],
    identity: 'reach, limb pressure, and bracing'
  },
  bow: {
    hands: 2,
    speedStyle: 'precise',
    keywords: ['Ranged', 'Marking'],
    requiredTags: ['ranged', 'marked'],
    identity: 'ranged marking and weak-point pressure'
  },
  club: {
    hands: 1,
    speedStyle: 'balanced',
    keywords: ['Brutal', 'Defensive'],
    requiredTags: ['heavy', 'block'],
    identity: 'impact and defensive follow-through'
  },
  hammer: {
    hands: 1,
    speedStyle: 'heavy',
    keywords: ['Heavy', 'Guardbreaker'],
    requiredTags: ['heavy', 'breaker'],
    identity: 'heavy block and shell breaking'
  },
  grandWeapon: {
    hands: 2,
    speedStyle: 'heavy',
    keywords: ['Heavy', 'Brutal'],
    requiredTags: ['heavy'],
    identity: 'expensive, committed heavy attacks'
  },
  katar: {
    hands: 1,
    speedStyle: 'quick',
    keywords: ['Quick', 'Marking'],
    requiredTags: ['quick', 'multiHit'],
    identity: 'marked multi-hit combinations'
  },
  fistAndTooth: {
    hands: 1,
    speedStyle: 'quick',
    keywords: ['Quick', 'Counter'],
    requiredTags: ['quick', 'counter'],
    identity: 'repeated strikes and close counters'
  },
  shield: {
    hands: 1,
    speedStyle: 'defensive',
    keywords: ['Defensive', 'Counter'],
    requiredTags: ['block', 'counter'],
    identity: 'block, counter, and returned force'
  },
  whip: {
    hands: 1,
    speedStyle: 'quick',
    keywords: ['Reach', 'Marking'],
    requiredTags: ['reach', 'marked'],
    identity: 'reach, marking, and limb control'
  },
  scythe: {
    hands: 2,
    speedStyle: 'heavy',
    keywords: ['Bleeding', 'Panic'],
    requiredTags: ['bleed', 'panic'],
    identity: 'bleed and Panic finishers'
  },
  katana: {
    hands: 1,
    speedStyle: 'precise',
    keywords: ['Precise', 'Duelist'],
    requiredTags: ['precise', 'firstStrike'],
    identity: 'precise opening strikes'
  },
  strangeWeapon: {
    hands: 1,
    speedStyle: 'strange',
    keywords: ['Strange', 'Panic'],
    requiredTags: ['strange', 'panic'],
    identity: 'Panic-fuelled strange effects'
  }
};

const weaponGroups = {
  sword: [
    'boneBlade', 'timeBoneBlade', 'duelistThornRapier', 'harmonyBoneBlade',
    'crystalBoneBlade', 'solarIchorBlade', 'goldenFangBlade'
  ],
  axe: ['boneCleaver', 'crimsonRiverAxe', 'chitinHookAxe'],
  dagger: ['lionFangKatar', 'riverToothBlade', 'venomSacNeedle', 'boneDarts'],
  spear: ['stalkingSpear', 'polishedStemSpear', 'paleFangSpear', 'sunLance'],
  bow: ['wailingHornBow', 'paleManeBow', 'silkThreadBow', 'floralSinewBow'],
  club: ['wetBoneClub'],
  hammer: ['boneHammer', 'beetleHornHammer'],
  grandWeapon: ['hornMaul', 'thunderMaul', 'crackedMolarBlade', 'prideGrandBlade'],
  katar: ['paleFangKatar'],
  fistAndTooth: [
    'kingClawGauntlet', 'boneKnuckleWraps', 'frogdogBiteGloves',
    'kingClawGauntletPair'
  ],
  shield: ['lionhideBuckler', 'crimsonScaleShield', 'resinBloodShield', 'sunShellShield'],
  whip: ['frogdogTongueWhip', 'gutCordWhip', 'silkSnareWhip'],
  scythe: ['ashHookScythe', 'bloomReaper', 'smogReedScythe'],
  katana: ['whitePounceKatana', 'ashCurveBlade', 'petalEdgeKatana', 'mirrorCuttingBlade'],
  strangeWeapon: ['noonMirror']
};

export const explicitWeaponTypes = Object.fromEntries(
  Object.entries(weaponGroups).flatMap(([weaponType, ids]) =>
    ids.map(id => [id, weaponType])
  )
);

export const explicitSlotOverrides = {
  rawhideHood: 'head',
  predatorMask: 'head',
  grassDevourerMask: 'head',
  sootLungMask: 'head',
  chokingMask: 'head',
  crusaderShellHelm: 'head',
  imperialHornHelm: 'head',
  emberCrown: 'head',
  pouncingGreaves: 'legs',
  trampleBoots: 'legs',
  leapingBoots: 'legs',
  perfectStepBoots: 'legs',
  skitterWraps: 'legs',
  whiskerNeedle: 'tool',
  staticNeedle: 'tool',
  floralSinewBowstring: 'tool',
  warningHorn: 'signalTool',
  royalChallengeHorn: 'instrument'
};

export const explicitGearKeywords = {
  warningHorn: ['Support', 'Signal', 'Reveal'],
  royalChallengeHorn: ['Support', 'Challenge', 'Regal'],
  imperialHornHelm: ['Defensive', 'Command', 'Fire'],
  memoryGlassEye: ['Memory', 'Discard', 'Reveal'],
  stormGutCharm: ['Thunder', 'Panic', 'Survival'],
  godlingDrum: ['Thunder', 'Rhythm', 'Panic'],
  ashClockCharm: ['Time', 'Draw', 'Survival'],
  crocodileEyeCharm: ['Ambush', 'Reveal', 'Counter'],
  skitterWraps: ['Web', 'Movement', 'Counter'],
  perfectStepBoots: ['Duelist', 'Movement', 'Dodge'],
  chokingMask: ['Smoke', 'Panic', 'Command'],
  crusaderShellHelm: ['Shell', 'Defensive', 'Survival'],
  emberCrown: ['Fire', 'Command', 'Risk'],
  predatorMask: ['Predator', 'Panic', 'Marking'],
  grassDevourerMask: ['Hunger', 'Panic', 'Survival']
};

export function getGearMetadata(item) {
  const weaponType = explicitWeaponTypes[item.id] || null;
  const style = weaponType ? weaponStyleDefinitions[weaponType] : null;
  const baseSlot = item.slot === 'armor' ? 'body'
    : item.slot === 'trinket' || item.slot === 'strange' ? 'charm'
      : item.slot === 'consumable' ? 'tool'
        : item.slot;
  return {
    weaponType,
    slot: explicitSlotOverrides[item.id] || (weaponType ? 'weapon' : baseSlot),
    hands: style?.hands || 0,
    speedStyle: style?.speedStyle || 'support',
    keywords: explicitGearKeywords[item.id] || style?.keywords || ['Survival'],
    styleTags: style?.requiredTags || [],
    deckIdentity: style?.identity || null
  };
}
