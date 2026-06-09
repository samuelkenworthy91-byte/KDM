const family = (id, displayName, role, node, designTags, unlockHint, implemented, notes = '') => ({
  id, displayName, role, node, designTags, unlockHint, implemented, notes
});

export const creatureFamilies = [
  family('paleHuntLion', 'Pale Hunt Lion', 'quarry', 'NQ1', ['fast', 'predator', 'bleed'], 'Available at settlement founding.', true),
  family('wailingAntelope', 'Wailing Antelope', 'quarry', 'NQ1', ['trample', 'heal', 'panic'], 'Defeat Pale Hunt Lion Level 1.', true),
  family('ashPhoenix', 'Ash Phoenix', 'quarry', 'NQ2', ['time', 'burn', 'deck disruption'], 'Defeat Wailing Antelope Level 1.', true),
  family('bloatedGodling', 'Bloated Godling', 'quarry', 'NQ2', ['thunder', 'heavy', 'organs'], 'Build Bone Smith or defeat Pale Hunt Lion Level 2.', true),
  family('crimsonCrocodile', 'Crimson Crocodile', 'quarry', 'NQ1', ['ambush', 'blood', 'drag'], 'Future quarry expansion.', false),
  family('frogdog', 'Frogdog', 'quarry', 'NQ1', ['leap', 'tongue', 'swallow'], 'Future quarry expansion.', false),
  family('silkMatriarch', 'Silk Matriarch', 'quarry', 'NQ2', ['web', 'poison', 'bind'], 'Defeat Wailing Antelope Level 2.', true),
  family('bloomKnight', 'Bloom Knight', 'quarry', 'NQ2', ['duel', 'riposte', 'precision'], 'Build Skinnery and defeat a Level 2 quarry.', false),
  family('smogSingers', 'Smog Singers', 'quarry', 'NQ2', ['chorus', 'smog', 'flight'], 'Future quarry expansion.', false),
  family('chitinCrusader', 'Chitin Crusader', 'quarry', 'NQ3', ['armour', 'guard', 'blunt'], 'Defeat any Level 3 quarry.', false),
  family('drakeEmperor', 'Drake Emperor', 'quarry', 'NQ4', ['fire', 'crystal', 'phase'], 'Future campaign milestone.', false),
  family('sunSovereign', 'Sun Sovereign', 'quarry', 'NQ4', ['blind', 'shell', 'radiant'], 'Future campaign milestone.', false),
  family('prideKing', 'Pride King', 'quarry', 'NQ4', ['armour break', 'pride', 'punishment'], 'Future campaign milestone.', false),
  family('theKingInspired', 'The King Inspired', 'quarry', 'NQ4', ['royal', 'command', 'terror'], 'Future campaign milestone.', false),
  family('cruelCollector', 'Cruel Collector', 'nemesis', 'NN1', ['collection', 'hooks'], 'Future nemesis system.', false),
  family('wanderingKiller', 'Wandering Killer', 'nemesis', 'NN1', ['ambush', 'execution'], 'Future nemesis system.', false),
  family('maskedJudge', 'Masked Judge', 'nemesis', 'NN2', ['verdict', 'mask'], 'Future nemesis system.', false),
  family('regalKnight', 'Regal Knight', 'nemesis', 'NN2', ['duel', 'armour'], 'Future nemesis system.', false),
  family('shadowStalker', 'Shadow Stalker', 'nemesis', 'NN2', ['darkness', 'stalk'], 'Future nemesis system.', false),
  family('mirrorTyrant', 'Mirror Tyrant', 'nemesis', 'NN3', ['copy', 'reflection'], 'Future nemesis system.', false),
  family('blackKnightInspired', 'Black Knight Inspired', 'nemesis', 'NN2', ['guard', 'challenge'], 'Future nemesis system.', false),
  family('redWitchesInspired', 'Red Witches Inspired', 'nemesis', 'NN3', ['coven', 'blood'], 'Future nemesis system.', false),
  family('childEaterInspired', 'Child Eater Inspired', 'nemesis', 'NN3', ['hunger', 'population'], 'Future nemesis system.', false),
  family('pariahInspired', 'Pariah Inspired', 'nemesis', 'NN3', ['exile', 'curse'], 'Future nemesis system.', false),
  family('watcherInspired', 'Watcher Inspired', 'core', 'Co', ['lantern', 'siege'], 'Future core encounter.', false),
  family('goldSmokeKnightInspired', 'Gold Smoke Knight Inspired', 'finale', 'Fi', ['smoke', 'gold', 'finale'], 'Future finale.', false),
  family('gamblerInspired', 'Gambler Inspired', 'core', 'Co', ['chance', 'wager'], 'Future core encounter.', false),
  family('godhandInspired', 'Godhand Inspired', 'finale', 'Fi', ['divine', 'hand'], 'Future finale.', false),
  family('wanderersPack', 'Wanderers Pack', 'wanderer', 'Special', ['wanderer'], 'Future special content.', false),
  family('scoutPack', 'Scout Pack', 'system', 'Special', ['scouting'], 'Future special content.', false),
  family('whiteBoxPack', 'White Box Pack', 'system', 'Special', ['promotional'], 'Future special content.', false),
  family('strainPack', 'Strain Pack', 'system', 'Special', ['strain'], 'Future special content.', false),
  family('philosophyPack', 'Philosophy Pack', 'system', 'Special', ['philosophy'], 'Future special content.', false)
];
