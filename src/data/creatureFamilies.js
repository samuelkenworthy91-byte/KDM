function family(id, displayName, role, implemented, playerVisible, unlockHint, designTags, notes = '') {
  return { id, displayName, role, designTags, unlockHint, implemented, playerVisible, notes };
}

export const creatureFamilies = {
  paleHuntLion: family('paleHuntLion', 'Pale Hunt Lion', 'quarry', true, true, 'Known from settlement founding.', ['predator', 'bleed', 'pounce']),
  wailingAntelope: family('wailingAntelope', 'Wailing Antelope', 'quarry', true, true, 'Defeat Pale Hunt Lion Level 1.', ['mobile', 'panic', 'trample']),
  ashPhoenix: family('ashPhoenix', 'Ash Phoenix', 'quarry', true, true, 'Defeat Wailing Antelope Level 1.', ['fire', 'memory', 'deck-disruption']),
  bloatedGodling: family('bloatedGodling', 'Bloated Godling', 'quarry', false, false, 'Rumours follow storms beyond the lantern horizon.', ['storm', 'dense', 'gland'], 'Resources are registered; encounter not implemented.'),
  crimsonCrocodile: family('crimsonCrocodile', 'Crimson Crocodile', 'quarry', false, false, 'Discover the flooded red trail.', ['aquatic', 'ambush']),
  frogdog: family('frogdog', 'Frogdog', 'quarry', false, false, 'Hear the croaking beyond the settlement.', ['swarm', 'amphibian']),
  silkMatriarch: family('silkMatriarch', 'Silk Matriarch', 'quarry', false, false, 'Find webbed hide during a hunt.', ['silk', 'venom', 'control']),
  bloomKnight: family('bloomKnight', 'Bloom Knight', 'quarry', false, false, 'Witness the duelist garden.', ['duelist', 'floral']),
  smogSingers: family('smogSingers', 'Smog Singers', 'quarry', false, false, 'Follow a song through black smoke.', ['chorus', 'smog']),
  chitinCrusader: family('chitinCrusader', 'Chitin Crusader', 'quarry', false, false, 'Recover a plate of sacred chitin.', ['armor', 'beetle']),
  drakeEmperor: family('drakeEmperor', 'Drake Emperor', 'quarry', false, false, 'Survive the imperial furnace.', ['fire', 'dragon', 'imperial']),
  sunSovereign: family('sunSovereign', 'Sun Sovereign', 'quarry', false, false, 'Reach the country beneath the false sun.', ['radiant', 'blind']),
  prideKing: family('prideKing', 'Pride King', 'quarry', false, false, 'Build a hall worthy of an apex ruler.', ['lion', 'royal']),
  theKingInspired: family('theKingInspired', 'The King Inspired', 'nemesis', false, false, 'A late campaign nemesis.', ['royal', 'nemesis']),
  cruelCollector: family('cruelCollector', 'Cruel Collector', 'nemesis', false, false, 'A collector notices valuable settlements.', ['collector', 'theft']),
  wanderingKiller: family('wanderingKiller', 'Wandering Killer', 'nemesis', false, false, 'A killer follows repeated hunt trails.', ['pursuit', 'duel']),
  maskedJudge: family('maskedJudge', 'Masked Judge', 'nemesis', false, false, 'Judgment follows broken settlement laws.', ['judge', 'mask']),
  regalKnight: family('regalKnight', 'Regal Knight', 'nemesis', false, false, 'A distant court sends its champion.', ['knight', 'armor']),
  shadowStalker: family('shadowStalker', 'Shadow Stalker', 'nemesis', false, false, 'Study enough deaths in darkness.', ['shadow', 'ambush']),
  mirrorTyrant: family('mirrorTyrant', 'Mirror Tyrant', 'nemesis', false, false, 'Find the settlement reflected incorrectly.', ['mirror', 'copy']),
  blackKnightInspired: family('blackKnightInspired', 'Black Knight Inspired', 'expansion', false, false, 'Future content family.', ['knight']),
  redWitchesInspired: family('redWitchesInspired', 'Red Witches Inspired', 'expansion', false, false, 'Future content family.', ['witch', 'blood']),
  childEaterInspired: family('childEaterInspired', 'Child Eater Inspired', 'expansion', false, false, 'Future content family.', ['nemesis']),
  pariahInspired: family('pariahInspired', 'Pariah Inspired', 'wanderer', false, false, 'Future wanderer content.', ['wanderer']),
  watcherInspired: family('watcherInspired', 'Watcher Inspired', 'nemesis', false, false, 'Future content family.', ['watcher']),
  goldSmokeKnightInspired: family('goldSmokeKnightInspired', 'Gold Smoke Knight Inspired', 'nemesis', false, false, 'Future content family.', ['smoke', 'knight']),
  gamblerInspired: family('gamblerInspired', 'Gambler Inspired', 'wanderer', false, false, 'Future wanderer content.', ['chance']),
  godhandInspired: family('godhandInspired', 'Godhand Inspired', 'nemesis', false, false, 'Future content family.', ['boss']),
  wanderersPack: family('wanderersPack', 'Wanderers Pack', 'content-pack', false, false, 'Future modular content.', ['wanderers']),
  scoutPack: family('scoutPack', 'Scout Pack', 'content-pack', false, false, 'Future modular content.', ['scouting']),
  whiteBoxPack: family('whiteBoxPack', 'White Box Pack', 'content-pack', false, false, 'Future modular content.', ['equipment']),
  strainPack: family('strainPack', 'Strain Pack', 'content-pack', false, false, 'Future modular content.', ['strain']),
  philosophyPack: family('philosophyPack', 'Philosophy Pack', 'content-pack', false, false, 'Future modular content.', ['philosophy'])
};

export const creatureFamilyList = Object.values(creatureFamilies);
