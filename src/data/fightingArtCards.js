const personalCard = (id, name, cost, type, description, effects, tags, options = {}) => ({
  id,
  name,
  cost,
  type,
  description,
  effects,
  tags: ['personal', 'fightingArt', ...tags],
  sourceType: 'fightingArt',
  exhaust: Boolean(options.exhaust),
  locked: Boolean(options.locked),
  unforgettable: Boolean(options.locked),
  implemented: true
});

export const fightingArtCards = {
  waitForTheShoulder: personalCard('waitForTheShoulder', 'Wait for the Shoulder', 1, 'skill', 'Gain 5 block. If the current tell opens a weak point, draw 1.', [{ type: 'block', amount: 5 }, { type: 'drawIfOpenWeakPoint', amount: 1 }], ['block', 'tell']),
  pounceReversal: personalCard('pounceReversal', 'Pounce Reversal', 3, 'attack', 'Deal 12 damage. If targeted last monster turn, deal +6.', [{ type: 'damage', amount: 12, bonusIfTargetedLastTurn: 6 }], ['attack', 'counter']),
  holdTheLine: personalCard('holdTheLine', 'Hold the Line', 2, 'skill', 'Gain 10 block. The next party member gains 3 block.', [{ type: 'block', amount: 10 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: 3 }], ['block', 'support']),
  cleanCut: personalCard('cleanCut', 'Clean Cut', 1, 'attack', 'Deal 4 damage. Breaking a weak point slightly improves harvest quality.', [{ type: 'damage', amount: 4 }, { type: 'harvestBonusIfWeakPointBroken', amount: 1 }], ['attack', 'precise', 'harvest']),
  brutalBreak: personalCard('brutalBreak', 'Brutal Break', 1, 'attack', 'Deal 5 damage and +4 break damage to hide or shell. Fragile parts are easier to ruin.', [{ type: 'damage', amount: 5 }, { type: 'taggedBreakBonus', tags: ['hide', 'shell'], amount: 4, fragileRisk: 1 }], ['attack', 'brutal', 'harvest']),
  fearIntoFire: personalCard('fearIntoFire', 'Fear into Fire', 1, 'skill', 'Remove 1 Panic from discard. The next attack deals +3.', [{ type: 'removePanic', amount: 1 }, { type: 'nextAttackBonus', amount: 3 }], ['panic', 'attack']),
  sharedBreath: personalCard('sharedBreath', 'Shared Breath', 0, 'skill', 'Gain 1 survival. The next party member gains 1 survival. Exhaust.', [{ type: 'survival', amount: 1 }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'survival', value: 1 }], ['support', 'survival'], { exhaust: true }),
  scarMemory: personalCard('scarMemory', 'Scar Memory', 1, 'skill', 'Draw 2 if this survivor has a scar; otherwise draw 1.', [{ type: 'drawIfScar', amount: 2, fallbackAmount: 1 }], ['scar', 'draw']),
  lowLanternCrawl: personalCard('lowLanternCrawl', 'Low Lantern Crawl', 1, 'skill', 'Gain 6 block, or 8 in the first party slot.', [{ type: 'block', amount: 6, bonusIfFrontPosition: 2 }], ['block', 'position']),
  strikeTheOpening: personalCard('strikeTheOpening', 'Strike the Opening', 1, 'attack', 'Deal 4 damage and +4 break damage against an Open weak point.', [{ type: 'damage', amount: 4 }, { type: 'breakBonusIfOpenWeakPoint', amount: 4 }], ['attack', 'weakPoint']),
  counterCall: personalCard('counterCall', 'Counter Call', 1, 'skill', 'The next party member’s first attack deals +2.', [{ type: 'partyEffect', target: 'nextPartyMember', effectType: 'nextAttackBonus', value: 2 }], ['support', 'party']),
  doNotLookAway: personalCard('doNotLookAway', 'Do Not Look Away', 0, 'skill', 'Add 1 Panic and clarify the current tell. Exhaust.', [{ type: 'addPanic', amount: 1 }, { type: 'revealIntentHint' }], ['panic', 'tell'], { exhaust: true }),
  rageWithShape: personalCard('rageWithShape', 'Rage with Shape', 2, 'attack', 'Deal 7 damage, +3 if this survivor has a disorder.', [{ type: 'damage', amount: 7, bonusIfDisorder: 3 }], ['disorder', 'attack']),
  boneSetterStance: personalCard('boneSetterStance', 'Bone-Setter Stance', 1, 'skill', 'Gain 4 block. If wounded, heal 1 HP. Exhaust.', [{ type: 'block', amount: 4 }, { type: 'healIfWounded', amount: 1 }], ['wound', 'block'], { exhaust: true }),
  patientBlade: personalCard('patientBlade', 'Patient Blade', 1, 'attack', 'Deal 5 damage. If this is the first attack this combat, apply Marked.', [{ type: 'damage', amount: 5 }, { type: 'markIfFirstAttack' }], ['attack', 'marked']),
  turnTheRoar: personalCard('turnTheRoar', 'Turn the Roar', 1, 'skill', 'Remove 1 Panic. Another party member gains 3 block.', [{ type: 'removePanicAny' }, { type: 'partyEffect', target: 'nextPartyMember', effectType: 'block', value: 3 }], ['panic', 'support']),
  gutFeeling: personalCard('gutFeeling', 'Gut Feeling', 0, 'skill', 'Draw 1. With Paranoia, gain 3 block. Exhaust.', [{ type: 'draw', amount: 1 }, { type: 'blockIfDisorder', disorderId: 'paranoia', amount: 3 }], ['disorder', 'draw'], { exhaust: true }),
  takeTheLesson: personalCard('takeTheLesson', 'Take the Lesson', 1, 'skill', 'Gain 1 weapon proficiency XP after this combat if this survivor survives. Exhaust.', [{ type: 'pendingWeaponXp', amount: 1 }], ['weapon', 'learning'], { exhaust: true }),
  markTheJoint: personalCard('markTheJoint', 'Mark the Joint', 1, 'attack', 'Deal 3 damage and Mark the targeted weak point.', [{ type: 'damage', amount: 3 }, { type: 'markWeakPoint' }], ['attack', 'marked', 'weakPoint']),
  lanternOath: personalCard('lanternOath', 'Lantern Oath', 2, 'skill', 'Gain 8 block. If another party member is at 1 HP, they heal 1.', [{ type: 'block', amount: 8 }, { type: 'partyEffectIfOneHp', effectType: 'heal', value: 1 }], ['support', 'block'])
};
