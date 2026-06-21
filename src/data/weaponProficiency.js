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
  sword: ['First Sword attack each turn deals +1 damage.', 'After you play a Sword attack, your next Block card this turn gives +1 Block.', 'Once per fight, after a Sword card wounds, draw 1 card.'],
  axe: ['Axe attacks deal double damage to monster Block.', 'When an Axe removes all monster Block, your next attack deals +2 damage.', 'First Axe attack each fight also applies Vulnerable 1.'],
  dagger: ['First Dagger card each turn costs 0.', 'Dagger attacks apply +1 extra Bleed/Poison/Burn if they already apply a damage-over-time status.', 'After you play two Dagger cards in one turn, draw 1 card.'],
  spear: ['First Spear attack each turn also gives +1 Block.', 'If you have Block, Spear attacks deal +1 damage.', 'Once per fight, after a Spear attack, give another survivor 3 Block.'],
  bow: ['First Bow attack each turn makes the quarry less likely to target this survivor.', 'Bow attacks gain +2 on weak-point and harvest tests.', 'Once per fight, after a Bow attack wounds, clarify the next quarry tell.'],
  club: ['Legacy Club attacks give +2 Block.', 'Legacy Club attacks reduce the next quarry attack by 1 once per turn.', 'First legacy Club attack each fight deals +5 damage.'],
  hammer: ['Legacy Hammer attacks remove 2 extra monster Block.', 'Legacy Hammer attacks deal +2 after striking a guarded quarry.', 'First legacy Hammer attack each fight applies Vulnerable 1.'],
  grandWeapon: ['Grand Weapon attacks deal +2 damage.', 'First Grand Weapon card each fight costs 1 less.', 'Once per fight, after a Grand Weapon attack wounds, gain 4 Block.'],
  katar: ['If two Katars are equipped, Katar attacks cost 1 less, minimum 0.', 'After a Katar card damages the quarry, your next Katar card this turn deals +1 damage.', 'Once per turn, after playing two Katar cards, draw 1 card.'],
  fistAndTooth: ['First Fist & Tooth card each turn costs 0.', 'Fist & Tooth Aura cards last 1 extra turn if they target only this survivor.', 'Once per fight, when wounded, draw 1 and gain 3 Block.'],
  shield: ['First Shield card each turn gives +1 Block.', 'When Block prevents damage, your next Shield attack deals +2 damage.', 'Once per fight, deal damage equal to half your Block, up to 20.'],
  whip: ['Whip attacks that damage the quarry apply Snare 1.', 'Whip cards make the quarry more likely to target this survivor until next quarry turn.', 'Once per fight, when this survivor is targeted, gain 5 Block before damage.'],
  scythe: ['Legacy Scythe attacks deal +1 to Bleeding monsters.', 'First legacy Scythe attack adds 1 Panic and deals +3.', 'Legacy Scythe attacks deal +2 while Panic is in discard.'],
  katana: ['The first Katana setup card each fight costs 0.', 'Katana setup bonuses do not expire until your next Katana attack.', 'Once per fight, double the stored bonus on your next Katana strike.'],
  strangeWeapon: ['First Strange card each fight may remove 1 Panic or draw 1.', 'When you gain Panic from your own Strange card, gain 1 Survival.', 'Once per fight, convert 1 Panic into +4 damage or +4 Block.']
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

export function applyWeaponProficiencyXp(survivor, usedTypes = []) {
  return {
    ...survivor,
    weaponProficiency: addWeaponProficiencyXp(
      createWeaponProficiency(survivor.weaponProficiency),
      usedTypes
    )
  };
}

export function syncWeaponMasteryCards(survivor) {
  return {
    ...survivor,
    personalDeckAdditions: Array.isArray(survivor.personalDeckAdditions)
      ? survivor.personalDeckAdditions
      : [],
    weaponProficiency: createWeaponProficiency(survivor.weaponProficiency)
  };
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
  if (progress.mastered) return `${definition.level1} ${definition.level2} Mastery: ${definition.mastery}`;
  if (progress.level >= 2) return `${definition.level1} ${definition.level2}`;
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
