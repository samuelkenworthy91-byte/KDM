export const weaponTypes = [
  'sword',
  'axe',
  'dagger',
  'spear',
  'bow',
  'club',
  'hammer',
  'grandWeapon',
  'katar',
  'fistAndTooth',
  'shield',
  'whip',
  'scythe',
  'katana',
  'strangeWeapon'
];

export const proficiencyThresholds = {
  level1: 2,
  level2: 5,
  mastery: 8
};

const passives = {
  sword: ['First sword attack each combat deals +1.', 'Sword attacks against Marked monsters deal +1.', 'After two sword cards, draw 1 once per combat.'],
  axe: ['Axe attacks remove 1 extra monster block.', 'Axe attacks deal +2 while the monster has block.', 'First axe attack each combat applies Marked.'],
  dagger: ['First dagger attack each turn deals +1. Weak-point counters against heads, eyes, and organs gain +2 break but +1 failed-break risk.', 'After two dagger cards in a turn, gain 1 survival.', 'Dagger multi-hit attacks deal +1 per hit.'],
  spear: ['First spear attack each combat gives +2 block. Once per combat, a counter against legs or limbs suppresses failed-break risk.', 'Spear attacks deal +2 if no damage was taken last turn.', 'First spear card each combat gives +8 block.'],
  bow: ['First bow attack each combat applies Marked.', 'Bow attacks against Marked monsters draw 1 once per turn.', 'First bow card each combat grants 1 survival.'],
  club: ['Club attacks give +2 block.', 'Club attacks reduce the next monster attack by 1 once per turn.', 'First club attack each combat deals +5.'],
  hammer: ['Hammer attacks remove 2 extra monster block.', 'Hammer attacks deal +2 after striking a guarded monster.', 'First hammer attack each combat applies Marked.'],
  grandWeapon: ['Heavy attacks deal +2.', 'First 2-cost attack each combat draws 1.', 'First 2-cost weapon card each combat refunds 2 energy.'],
  katar: ['First katar attack each turn deals +1. Weak-point counters against heads, eyes, and organs gain +2 break but +1 failed-break risk.', 'Katar attacks against Marked monsters deal +1 per hit.', 'After applying Marked, the next katar card draws 1.'],
  fistAndTooth: ['Fist attacks deal +1. While wounded, Counter deals +2; failed weak-point counters add Panic.', 'Counter deals +1 while fist-and-tooth gear is equipped.', 'After Counter, draw 1 once per combat.'],
  shield: ['First shield card each combat gives +2 block. Counters against claws and body gain +2 break.', 'If block remains after a monster turn, gain 1 survival once per combat.', 'Once per combat, a shield attack adds up to 20 block as damage.'],
  whip: ['Whip attacks that deal damage apply Marked. Counters against tails, tongues, and limbs Mark the weak point.', 'Whip attacks against Marked monsters reduce next monster damage by 1.', 'First whip card each combat clarifies the tell.'],
  scythe: ['Scythe attacks deal +1 to Marked or Bleeding monsters.', 'First scythe attack adds 1 Panic and deals +3.', 'Scythe attacks deal +2 while Panic is in discard.'],
  katana: ['First katana attack deals +2 if no block card was played this turn. After avoiding damage, a weak-point counter gains +3 break.', 'After a katana card, the next Dodge gives +2 block.', 'After avoiding damage for a turn, the next katana attack deals +6 once per combat.'],
  strangeWeapon: ['First strange weapon card draws 1 and adds 1 Panic.', 'A strange weapon card removes 1 Panic once per combat.', 'When Panic is drawn, gain 1 survival and draw 1 once per combat.']
};

const labels = {
  grandWeapon: 'Grand Weapon',
  fistAndTooth: 'Fist and Tooth',
  strangeWeapon: 'Strange Weapon'
};

export const weaponProficiencyDefinitions = Object.fromEntries(
  weaponTypes.map(type => [type, {
    type,
    name: labels[type] || type.charAt(0).toUpperCase() + type.slice(1),
    level1: passives[type][0],
    level2: passives[type][1],
    mastery: passives[type][2]
  }])
);

export const weaponMasteryCardIds = {
  sword: 'masterySwordMarkedEcho',
  axe: 'masteryAxeSunder',
  dagger: 'masteryDaggerRedOpening',
  spear: 'masterySpearHeldLine',
  bow: 'masteryBowPredatorsArc',
  club: 'masteryClubCrushingRebuke',
  hammer: 'masteryHammerFaultLine',
  grandWeapon: 'masteryGrandWeaponFinalArc',
  katar: 'masteryKatarMarkedFrenzy',
  fistAndTooth: 'masteryFistAndToothLastBreath',
  shield: 'masteryShieldReturnedForce',
  whip: 'masteryWhipBindingRead',
  scythe: 'masteryScytheHarvestFear',
  katana: 'masteryKatanaUnbrokenMoment',
  strangeWeapon: 'masteryStrangeWeaponBlackRite'
};

export function getProficiencyLevel(xp = 0) {
  if (xp >= proficiencyThresholds.mastery) return 3;
  if (xp >= proficiencyThresholds.level2) return 2;
  if (xp >= proficiencyThresholds.level1) return 1;
  return 0;
}

export function createWeaponProficiency(existing = {}) {
  return Object.fromEntries(weaponTypes.map(type => {
    const xp = Math.max(0, Number(existing[type]?.xp) || 0);
    return [type, {
      xp,
      level: getProficiencyLevel(xp),
      mastered: xp >= proficiencyThresholds.mastery
    }];
  }));
}

export function addWeaponProficiencyXp(existing, usedTypes = []) {
  const next = createWeaponProficiency(existing);
  [...new Set(usedTypes)].filter(type => next[type]).forEach(type => {
    const xp = next[type].xp + 1;
    next[type] = {
      xp,
      level: getProficiencyLevel(xp),
      mastered: xp >= proficiencyThresholds.mastery
    };
  });
  return next;
}

function getPersonalCardId(addition) {
  return typeof addition === 'string' ? addition : addition?.cardId;
}

function addMasteryCard(survivor, weaponType) {
  const cardId = weaponMasteryCardIds[weaponType];
  if (!cardId) return survivor;
  const additions = survivor.personalDeckAdditions || [];
  if (additions.some(addition => getPersonalCardId(addition) === cardId)) return survivor;
  return {
    ...survivor,
    personalDeckAdditions: [
      ...additions,
      {
        cardId,
        sourceType: 'weaponMastery',
        reason: `${weaponProficiencyDefinitions[weaponType].name} Mastery`,
        locked: true
      }
    ]
  };
}

export function applyWeaponProficiencyXp(survivor, usedTypes = []) {
  const before = createWeaponProficiency(survivor.weaponProficiency);
  const weaponProficiency = addWeaponProficiencyXp(before, usedTypes);
  let next = { ...survivor, weaponProficiency };

  [...new Set(usedTypes)].forEach(type => {
    if (
      before[type]?.xp < proficiencyThresholds.mastery &&
      weaponProficiency[type]?.xp >= proficiencyThresholds.mastery
    ) {
      next = addMasteryCard(next, type);
    }
  });

  return next;
}

export function syncWeaponMasteryCards(survivor) {
  const proficiency = createWeaponProficiency(survivor.weaponProficiency);
  return weaponTypes.reduce((next, type) => (
    proficiency[type].mastered ? addMasteryCard(next, type) : next
  ), {
    ...survivor,
    weaponProficiency: proficiency,
    personalDeckAdditions: Array.isArray(survivor.personalDeckAdditions)
      ? survivor.personalDeckAdditions
      : []
  });
}

export function getWeaponMasteryCardId(type) {
  return weaponMasteryCardIds[type] || null;
}

export function isValidWeaponType(type) {
  return weaponTypes.includes(type);
}

export function getActiveProficiencyPassive(proficiency = {}, type = 'fistAndTooth') {
  const definition = weaponProficiencyDefinitions[type] || weaponProficiencyDefinitions.fistAndTooth;
  const progress = proficiency[type] || { level: 0, mastered: false };
  if (progress.mastered) return `${definition.level2} Mastery: ${definition.mastery}`;
  if (progress.level >= 2) return definition.level2;
  if (progress.level >= 1) return definition.level1;
  return `Unlocks at 2 XP: ${definition.level1}`;
}

export function validateWeaponProficiencyMapping({
  equipment = [],
  cards = {},
  survivors = []
} = {}) {
  const warnings = [];
  equipment.forEach(item => {
    if (item.proficiencyXpGranted && !item.weaponType) {
      warnings.push(`${item.id}: grants proficiency XP without a weaponType`);
    }
    if (item.weaponType && !isValidWeaponType(item.weaponType)) {
      warnings.push(`${item.id}: invalid weaponType "${item.weaponType}"`);
    }
    if (!item.weaponType && item.proficiencyXpGranted) {
      warnings.push(`${item.id}: weapon has no weaponType`);
    }
    if (!item.weaponType && item.proficiencyXpGranted !== false) {
      warnings.push(`${item.id}: support gear must set proficiencyXpGranted to false`);
    }
  });
  Object.values(cards).forEach(card => {
    if (card.weaponType && !isValidWeaponType(card.weaponType)) {
      warnings.push(`${card.id}: card references invalid weaponType "${card.weaponType}"`);
    }
  });
  survivors.forEach(survivor => {
    if (!isValidWeaponType(survivor.activeProficiencyType)) {
      warnings.push(`${survivor.id || survivor.name}: invalid active proficiency`);
    }
    Object.keys(survivor.weaponProficiency || {}).forEach(type => {
      if (!isValidWeaponType(type)) {
        warnings.push(`${survivor.id || survivor.name}: invalid proficiency data "${type}"`);
      }
    });
  });
  warnings.forEach(message => console.warn(`[Weapon proficiency] ${message}`));
  return warnings;
}

export const validateWeaponProficiencyData = validateWeaponProficiencyMapping;

export function getProficientWeaponSummary(proficiency = {}) {
  return weaponTypes
    .filter(type => (proficiency[type]?.xp || 0) >= proficiencyThresholds.level1)
    .map(type => ({
      type,
      name: weaponProficiencyDefinitions[type].name,
      xp: proficiency[type].xp,
      level: proficiency[type].level,
      mastered: Boolean(proficiency[type].mastered)
    }));
}
