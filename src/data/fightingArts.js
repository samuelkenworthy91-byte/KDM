import { quarryList } from './quarries.js';
import { nemesisList } from './nemesisEncounters.js';

export const fightingArts = {
  clawStyle: {
    id: 'clawStyle',
    name: 'Claw Style',
    description: 'Attacks deal +1 damage.',
    trigger: 'When playing an attack.',
    effect: { type: 'attackDamageBonus', amount: 1 },
    implemented: true
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    description: 'While you have 0 block, attacks deal +1 damage.',
    trigger: 'When playing an attack at 0 block.',
    effect: { type: 'noBlockAttackDamageBonus', amount: 1 },
    implemented: true
  },
  tumble: {
    id: 'tumble',
    name: 'Tumble',
    description: 'Start each combat with +3 block.',
    trigger: 'Combat start.',
    effect: { type: 'startingBlock', amount: 3 },
    implemented: true
  },
  scarTissue: {
    id: 'scarTissue',
    name: 'Scar Tissue',
    description: 'Start each combat with +2 block.',
    trigger: 'Combat start.',
    effect: { type: 'startingBlock', amount: 2 },
    implemented: true
  },
  hardened: {
    id: 'hardened',
    name: 'Hardened',
    description: 'Gain +1 max HP.',
    trigger: 'When learned.',
    effect: { type: 'maxHp', amount: 1 },
    implemented: true
  },
  focusedBreath: {
    id: 'focusedBreath',
    name: 'Focused Breath',
    description: 'Draw 1 extra card at the start of combat.',
    trigger: 'Combat start.',
    effect: { type: 'extraFirstTurnDraw', amount: 1 },
    implemented: true
  },
  steadyHands: {
    id: 'steadyHands', name: 'Steady Hands',
    description: 'Once per combat, the first Panic a card would add grants 1 block instead.',
    trigger: 'First self-inflicted Panic.', effect: { type: 'panicToBlock', amount: 1 },
    tags: ['survival', 'panic'], implemented: true
  },
  bodyShield: {
    id: 'bodyShield', name: 'Body Shield',
    description: 'After gaining 8 block in one turn, another party member heals 1 HP after combat.',
    trigger: 'Gain 8 block in a turn.', effect: { type: 'partyHealAfterCombat', amount: 1 },
    tags: ['support', 'party'], implemented: true
  },
  grimTeacher: {
    id: 'grimTeacher', name: 'Grim Teacher',
    description: 'After a successful hunt, another party member gains 1 weapon proficiency XP.',
    trigger: 'Successful hunt.', effect: { type: 'partyWeaponXp', amount: 1 },
    tags: ['support', 'weapon', 'party'], implemented: true
  },
  lastToRun: {
    id: 'lastToRun', name: 'Last to Run',
    description: 'Start combat with +1 survival while another party member is wounded.',
    trigger: 'Combat start.', effect: { type: 'survivalIfPartyWounded', amount: 1 },
    tags: ['support', 'survival', 'party'], implemented: true
  },
  scarReader: {
    id: 'scarReader', name: 'Scar Reader',
    description: 'If this survivor has a scar, their first attack each combat deals +1.',
    trigger: 'First attack.', effect: { type: 'firstAttackIfScar', amount: 1 },
    tags: ['wound', 'selfish'], implemented: true
  },
  fearEater: {
    id: 'fearEater', name: 'Fear Eater',
    description: 'The first Panic removed each combat grants 1 survival.',
    trigger: 'Remove Panic.', effect: { type: 'survivalOnPanicRemoved', amount: 1 },
    tags: ['panic', 'survival'], implemented: true
  },
  boneMemory: {
    id: 'boneMemory', name: 'Bone Memory',
    description: 'The first attack with a bone weapon each combat Marks the monster.',
    trigger: 'First bone weapon attack.', effect: { type: 'firstBoneAttackMarks' },
    tags: ['weapon', 'counter'], implemented: true
  },
  hideWorker: {
    id: 'hideWorker', name: 'Hide Worker',
    description: 'While wearing body armor, the first block card each combat gains +2 block.',
    trigger: 'First block card.', effect: { type: 'firstArmorBlockBonus', amount: 2 },
    tags: ['weapon', 'support'], implemented: true
  },
  lanternSinger: {
    id: 'lanternSinger', name: 'Lantern Singer',
    description: 'Once per hunt, another survivor gains +1 survival before their turn.',
    trigger: 'Chosen ally turn start.', effect: { type: 'partySurvival', amount: 1 },
    tags: ['support', 'party', 'survival'], implemented: true
  },
  packMender: {
    id: 'packMender', name: 'Pack Mender',
    description: 'Rest nodes heal every living party member for 1 additional HP.',
    trigger: 'Rest node.', effect: { type: 'partyRestHealing', amount: 1 },
    tags: ['support', 'party', 'wound'], implemented: true
  },
  openingReader: {
    id: 'openingReader', name: 'Opening Reader', description: 'Gain 2 block when the first tell remains vague.',
    trigger: 'First vague tell.', effect: { type: 'firstVagueTellBlock', amount: 2 },
    tags: ['counter'], implemented: true
  },
  sharedBreath: {
    id: 'sharedBreath', name: 'Shared Breath', description: 'The next party member starts their first turn with 1 block.',
    trigger: 'End first turn.', effect: { type: 'nextPartyBlock', amount: 1 },
    tags: ['support', 'party'], implemented: true
  },
  woundLedger: {
    id: 'woundLedger', name: 'Wound Ledger', description: 'Deal +1 with the first attack for each injury, maximum 2.',
    trigger: 'First attack.', effect: { type: 'firstAttackPerInjury', amount: 1, maximum: 2 },
    tags: ['wound', 'risky'], implemented: true
  },
  patientEdge: {
    id: 'patientEdge', name: 'Patient Edge', description: 'If no attack was played last turn, the first attack deals +2.',
    trigger: 'First attack after restraint.', effect: { type: 'patientAttack', amount: 2 },
    tags: ['weapon', 'counter'], implemented: true
  },
  panicCourier: {
    id: 'panicCourier', name: 'Panic Courier', description: 'Once per combat, move one incoming Panic to your discard to give another survivor 2 block.',
    trigger: 'Panic gained.', effect: { type: 'panicForPartyBlock', amount: 2 },
    tags: ['panic', 'support', 'party'], implemented: true
  },
  hardRationer: {
    id: 'hardRationer', name: 'Hard Rationer', description: 'Rest healing is reduced by 1, but start each combat with +1 survival.',
    trigger: 'Rest and combat start.', effect: { type: 'riskySurvival', amount: 1 },
    tags: ['selfish', 'survival', 'risky'], implemented: true
  },
  markedHunter: {
    id: 'markedHunter', name: 'Marked Hunter', description: 'The first attack against a Marked monster deals +2.',
    trigger: 'First attack against Marked.', effect: { type: 'firstMarkedAttack', amount: 2 },
    tags: ['counter', 'weapon'], implemented: true
  },
  lanternWard: {
    id: 'lanternWard', name: 'Lantern Ward', description: 'Once per combat, prevent 1 Panic from being added to every party member.',
    trigger: 'Party-wide Panic.', effect: { type: 'partyPanicReduction', amount: 1 },
    tags: ['support', 'party', 'panic'], implemented: true
  },
  bloodTempo: {
    id: 'bloodTempo', name: 'Blood Tempo', description: 'At half HP or less, the second attack each turn deals +1.',
    trigger: 'Second attack while wounded.', effect: { type: 'woundedSecondAttack', amount: 1 },
    tags: ['wound', 'risky', 'weapon'], implemented: true
  },
  finalLantern: {
    id: 'finalLantern', name: 'Final Lantern', description: 'Once per combat, when another survivor dies, gain 2 survival and draw 2.',
    trigger: 'Party member death.', effect: { type: 'allyDeathRecovery', survival: 2, draw: 2 },
    tags: ['rare', 'party', 'survival'], implemented: true
  },
  deadEyeCalm: {
    id: 'deadEyeCalm', name: 'Dead-Eye Calm',
    description: 'With a head scar, the first precise or ranged attack each combat deals +2.',
    trigger: 'First precise attack.', effect: { type: 'headScarAttack', amount: 2 },
    tags: ['wound', 'precise'], implemented: true
  },
  offHandGrit: {
    id: 'offHandGrit', name: 'Off-Hand Grit',
    description: 'With an arm wound or scar, the first one-handed attack each combat draws 1.',
    trigger: 'First one-handed attack.', effect: { type: 'armWoundDraw', amount: 1 },
    tags: ['wound', 'weapon'], implemented: true
  },
  stubbornFootwork: {
    id: 'stubbornFootwork', name: 'Stubborn Footwork',
    description: 'With a leg wound or scar, the first Dodge each combat gains +3 block.',
    trigger: 'First Dodge.', effect: { type: 'legWoundDodge', amount: 3 },
    tags: ['wound', 'survival'], implemented: true
  },
  ribCageResolve: {
    id: 'ribCageResolve', name: 'Rib-Cage Resolve',
    description: 'With a body scar, start combat with +1 survival.',
    trigger: 'Combat start.', effect: { type: 'bodyScarSurvival', amount: 1 },
    tags: ['wound', 'survival'], implemented: true
  },
  fearListener: {
    id: 'fearListener', name: 'Fear Listener',
    description: 'With a mind wound or disorder, the first Panic each combat grants +1 survival.',
    trigger: 'First Panic.', effect: { type: 'mindWoundPanicSurvival', amount: 1 },
    tags: ['wound', 'panic'], implemented: true
  },
  scarredTeacher: {
    id: 'scarredTeacher', name: 'Scarred Teacher',
    description: 'After a hunt where this survivor was wounded, another party member gains 1 weapon XP.',
    trigger: 'Hunt end.', effect: { type: 'woundedPartyWeaponXp', amount: 1 },
    tags: ['wound', 'party'], implemented: true
  },
  bloodMemory: {
    id: 'bloodMemory', name: 'Blood Memory',
    description: 'After being wounded this combat, attacks deal +1.',
    trigger: 'Attack while wounded.', effect: { type: 'woundedCombatAttack', amount: 1 },
    tags: ['wound', 'weapon'], implemented: true
  },
  woundLaugh: {
    id: 'woundLaugh', name: 'Wound Laugh',
    description: 'Once per combat when reduced to 1 HP, gain 1 survival.',
    trigger: 'Reduced to 1 HP.', effect: { type: 'oneHpSurvival', amount: 1 },
    tags: ['wound', 'survival'], implemented: true
  },
  carefulPatient: {
    id: 'carefulPatient', name: 'Careful Patient',
    description: 'Bandages used by this survivor heal 1 additional HP.',
    trigger: 'Bandage treatment.', effect: { type: 'bandageHealing', amount: 1 },
    tags: ['wound', 'support'], implemented: true
  },
  boneSetWrong: {
    id: 'boneSetWrong', name: 'Bone Set Wrong',
    description: 'Start with 1 less max HP, but heavy weapon attacks deal +1.',
    trigger: 'Combat start and heavy attack.', effect: { type: 'wrongSetHeavy', amount: 1 },
    tags: ['wound', 'heavy'], implemented: true
  },
  monsterBane_paleHuntLion: {
    id: 'monsterBane_paleHuntLion',
    name: 'Monster Bane: Pale Hunt Lion',
    description: 'Reveal exact Pale Hunt Lion intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Pale Hunt Lion.',
    effect: { type: 'monsterBane', quarryId: 'paleHuntLion' },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    quarrySpecific: true,
    replaceable: false,
    implemented: true
  },
  monsterBane_wailingAntelope: {
    id: 'monsterBane_wailingAntelope',
    name: 'Monster Bane: Wailing Antelope',
    description: 'Reveal exact Wailing Antelope intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Wailing Antelope.',
    effect: { type: 'monsterBane', quarryId: 'wailingAntelope' },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    quarrySpecific: true,
    replaceable: false,
    implemented: true
  },
  monsterBane_ashPhoenix: {
    id: 'monsterBane_ashPhoenix',
    name: 'Monster Bane: Ash Phoenix',
    description: 'Reveal exact Ash Phoenix intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Ash Phoenix.',
    effect: { type: 'monsterBane', quarryId: 'ashPhoenix' },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    quarrySpecific: true,
    replaceable: false,
    implemented: true
  }
};

quarryList.forEach(quarry => {
  const id = `monsterBane_${quarry.id}`;
  if (!fightingArts[id]) {
    fightingArts[id] = {
      id,
      name: `Monster Bane: ${quarry.displayName}`,
      description: `Reveal exact ${quarry.displayName} intents, weak-point openings, failed-break risks, and harvest hints. With Monster Archive, deal +1 damage to it.`,
      trigger: `Against ${quarry.displayName}.`,
      effect: { type: 'monsterBane', quarryId: quarry.id },
      tags: ['monsterBane'],
      locked: true,
      unforgettable: true,
      quarrySpecific: true,
      replaceable: false,
      implemented: true
    };
  }
});

nemesisList.forEach(nemesis => {
  const id = `monsterBane_${nemesis.id}`;
  fightingArts[id] = {
    id,
    name: `Monster Bane: ${nemesis.displayName}`,
    description: `Reveal exact ${nemesis.displayName} intents. With Monster Archive, deal +1 damage to it.`,
    trigger: `Against ${nemesis.displayName}.`,
    effect: { type: 'monsterBane', quarryId: nemesis.id },
    tags: ['monsterBane'],
    locked: true,
    unforgettable: true,
    implemented: true
  };
});

export const implementedFightingArts = Object.values(fightingArts).filter(art => art.implemented);
export const generalFightingArts = implementedFightingArts.filter(
  art => art.effect.type !== 'monsterBane'
);

export function getMonsterBaneId(quarryId) {
  return `monsterBane_${quarryId}`;
}

export function isMonsterBaneId(id) {
  return Boolean(id && (
    fightingArts[id]?.effect?.type === 'monsterBane' ||
    id.startsWith('monsterBane_')
  ));
}

export function getSurvivorMonsterBaneId(survivor) {
  return (survivor?.fightingArts || []).find(isMonsterBaneId) || null;
}

export function validateSurvivorMonsterBane(survivor) {
  const baneIds = (survivor?.fightingArts || []).filter(isMonsterBaneId);
  const keptId = baneIds[0] || null;
  const warnings = [];

  if (baneIds.length > 1) {
    warnings.push(`${survivor?.name || 'Survivor'} had multiple Monster Banes; kept ${keptId}.`);
  }
  if (keptId && (!fightingArts[keptId]?.locked || !fightingArts[keptId]?.unforgettable)) {
    warnings.push(`${keptId} must be locked and unforgettable.`);
  }

  return {
    survivor: {
      ...survivor,
      fightingArts: [
        ...(survivor?.fightingArts || []).filter(id => !isMonsterBaneId(id)),
        ...(keptId ? [keptId] : [])
      ]
    },
    keptId,
    removedIds: baneIds.slice(1),
    warnings
  };
}
