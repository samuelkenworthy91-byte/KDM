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
  monsterBane_paleHuntLion: {
    id: 'monsterBane_paleHuntLion',
    name: 'Monster Bane: Pale Hunt Lion',
    description: 'Reveal exact Pale Hunt Lion intents. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Pale Hunt Lion.',
    effect: { type: 'monsterBane', quarryId: 'paleHuntLion' },
    implemented: true
  },
  monsterBane_wailingAntelope: {
    id: 'monsterBane_wailingAntelope',
    name: 'Monster Bane: Wailing Antelope',
    description: 'Reveal exact Wailing Antelope intents. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Wailing Antelope.',
    effect: { type: 'monsterBane', quarryId: 'wailingAntelope' },
    implemented: true
  },
  monsterBane_ashPhoenix: {
    id: 'monsterBane_ashPhoenix',
    name: 'Monster Bane: Ash Phoenix',
    description: 'Reveal exact Ash Phoenix intents. With Monster Archive, deal +1 damage to it.',
    trigger: 'Against Ash Phoenix.',
    effect: { type: 'monsterBane', quarryId: 'ashPhoenix' },
    implemented: true
  }
};

export const implementedFightingArts = Object.values(fightingArts).filter(art => art.implemented);
export const generalFightingArts = implementedFightingArts.filter(
  art => art.effect.type !== 'monsterBane'
);

export function getMonsterBaneId(quarryId) {
  return `monsterBane_${quarryId}`;
}
