const TARGET_LABELS = {
  none: 'No survivor target.',
  randomLivingSurvivor: 'Targets one random living survivor when it attacks.',
  all: 'Targets all living survivors.',
  twoRandom: 'Targets two random living survivors.',
  threeRandom: 'Targets three random living survivors.'
};

const TARGET_EXPLANATIONS = {
  none: 'no survivor target',
  randomLivingSurvivor: 'random living survivor',
  all: 'all living survivors',
  twoRandom: 'two random living survivors',
  threeRandom: 'three random living survivors'
};

// Only party-wide, multi-target, and self-only exceptions remain configured.
// Every other legacy personality rule is normalized to a random living survivor.
const QUARRY_RULES = {
  paleHuntLion: {
    lanternShakingRoar: 'all',
    terrifyingRoar: 'all',
    circlingHunger: 'none'
  },
  wailingAntelope: {
    hoovesInDust: 'twoRandom',
    trample: 'twoRandom',
    devour: 'none',
    boundAway: 'none',
    wailingChest: 'all'
  },
  ashPhoenix: {
    ashWing: 'all',
    cinderWing: 'all',
    ashVeil: 'none'
  },
  bloatedGodling: {
    thunderBelly: 'all',
    staticBellow: 'all'
  },
  crimsonCrocodile: {
    crimsonHide: 'none'
  },
  frogdog: {
    toxicBelch: 'twoRandom'
  },
  silkMatriarch: {
    skitterAway: 'none',
    eggTremor: 'all'
  },
  smogSingers: {
    chokingChorus: 'all',
    sootBreath: 'twoRandom',
    smokeVeil: 'none'
  },
  chitinCrusader: {
    shellUp: 'none',
    resinGuard: 'none'
  },
  drakeEmperor: {
    fireGlandFlare: 'twoRandom',
    imperialRoar: 'all'
  },
  sunSovereign: {
    blindingFlash: 'all',
    heatMirage: 'none'
  },
  prideKing: {
    maneGuard: 'none'
  }
};

const SURVIVOR_EFFECT_TYPES = new Set([
  'dealDamage',
  'multiHitDamage',
  'addPanic',
  'applyBleed',
  'applyMarked',
  'reducePlayerBlock',
  'removeAllPlayerBlock',
  'playerEnergyPenaltyNextTurn',
  'discardRandomCard',
  'damageFromPlayerStrength',
  'damageFromDeckSize'
]);

function survivorFor(member) {
  return member?.survivor || member;
}

function survivorId(member) {
  return survivorFor(member)?.id;
}

export function isLivingPartyMember(member) {
  const survivor = survivorFor(member);
  return Boolean(
    survivor &&
    survivor.id &&
    survivor.hp > 0 &&
    survivor.isAlive !== false &&
    survivor.alive !== false &&
    member?.status !== 'dead'
  );
}

export function normalizeMonsterTargetRule(rule) {
  if (rule === 'none' || rule === 'all' || rule === 'twoRandom' || rule === 'threeRandom') {
    return rule;
  }
  if (rule === 'frontAndRandom') return 'twoRandom';
  return 'randomLivingSurvivor';
}

function randomIndex(length, random) {
  if (length <= 0) return -1;
  const value = Number(random?.());
  if (!Number.isFinite(value) || value < 0 || value >= 1) return -1;
  return Math.floor(value * length);
}

export function selectRandomLivingSurvivor(party = [], combatState = {}, random = Math.random) {
  void combatState;
  const living = party.filter(isLivingPartyMember);
  if (!living.length) return null;
  const index = randomIndex(living.length, random);
  return survivorId(living[index >= 0 ? index : 0]);
}

function selectRandomLivingSurvivors(party, count, combatState, random) {
  const remaining = party.filter(isLivingPartyMember);
  const selected = [];
  while (remaining.length && selected.length < count) {
    const selectedId = selectRandomLivingSurvivor(remaining, combatState, random);
    const index = remaining.findIndex(member => survivorId(member) === selectedId);
    const selectedIndex = index >= 0 ? index : 0;
    selected.push(survivorId(remaining[selectedIndex]));
    remaining.splice(selectedIndex, 1);
  }
  return selected;
}

export function getIntentTargetRule(intent, monster = {}, quarry = null) {
  const explicitRule = intent?.targetingRule || intent?.target;
  if (explicitRule) return normalizeMonsterTargetRule(explicitRule);

  const configured = [
    monster.quarryId,
    monster.creatureId,
    monster.baseId,
    monster.id,
    quarry?.id
  ].filter(Boolean).map(identity => QUARRY_RULES[identity]).find(Boolean);
  const configuredRule = configured?.[intent?.id] || configured?.default;
  if (configuredRule) return normalizeMonsterTargetRule(configuredRule);

  const targetsSurvivors = intent?.effects?.some(effect => SURVIVOR_EFFECT_TYPES.has(effect.type));
  if (!targetsSurvivors) return 'none';

  return 'randomLivingSurvivor';
}

export function selectMonsterTargets({
  intent,
  monster,
  party = [],
  combatState = {},
  quarry,
  random = Math.random
}) {
  const living = party.filter(isLivingPartyMember);
  const targetRule = getIntentTargetRule(intent, monster, quarry);
  if (!living.length) {
    return {
      targets: [],
      targetRule,
      targetExplanation: 'No living survivors remain.'
    };
  }

  let targets = [];
  if (targetRule === 'all') {
    targets = living.map(survivorId);
  } else if (targetRule === 'twoRandom') {
    targets = selectRandomLivingSurvivors(living, 2, combatState, random);
  } else if (targetRule === 'threeRandom') {
    targets = selectRandomLivingSurvivors(living, 3, combatState, random);
  } else if (targetRule !== 'none') {
    const targetId = selectRandomLivingSurvivor(living, combatState, random);
    targets = targetId ? [targetId] : [survivorId(living[0])];
  }

  return {
    targets,
    targetRule,
    targetExplanation: TARGET_EXPLANATIONS[targetRule] || 'random living survivor'
  };
}

export function getTargetingTell(rule, exact = false) {
  const normalizedRule = normalizeMonsterTargetRule(rule);
  if (normalizedRule === 'none') return 'The creature turns inward, gathering itself.';
  if (normalizedRule === 'all' || normalizedRule === 'twoRandom' || normalizedRule === 'threeRandom') {
    return TARGET_LABELS[normalizedRule];
  }
  if (exact) return TARGET_LABELS.randomLivingSurvivor;
  return "The monster's attention flickers across the party.";
}
