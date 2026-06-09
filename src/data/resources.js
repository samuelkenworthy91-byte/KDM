function resource(id, name, type, description, creatureId) {
  return { id, name, type, description, ...(creatureId ? { creatureId } : {}) };
}

export const resources = {
  bone: resource('bone', 'Bone', 'basic', 'Hard monster bone used for weapons and structures.'),
  hide: resource('hide', 'Hide', 'basic', 'Tough hide used for armor and shelter.'),
  sinew: resource('sinew', 'Sinew', 'basic', 'Flexible tissue used for bindings and bowstrings.'),
  organ: resource('organ', 'Organ', 'basic', 'A preserved organ with alchemical uses.'),
  claw: resource('claw', 'Claw', 'monster', 'A sharp trophy from a slain creature.'),
  strangeEye: resource('strangeEye', 'Strange Eye', 'strange', 'An eye that remembers impossible sights.'),
  scrap: resource('scrap', 'Scrap', 'basic', 'Salvaged metal and useful debris.'),
  fur: resource('fur', 'Fur', 'basic', 'Warm monster fur.'),
  horn: resource('horn', 'Horn', 'monster', 'Dense horn suitable for tools and weapons.'),
  ichor: resource('ichor', 'Ichor', 'rare', 'Potent fluid taken from an advanced quarry.'),
  monsterTooth: resource('monsterTooth', 'Monster Tooth', 'rare', 'A trophy from a dangerous quarry.'),

  paleLionHide: resource('paleLionHide', 'Pale Lion Hide', 'creature', 'Moon-pale hide from the Pale Hunt Lion.', 'paleHuntLion'),
  paleLionClaw: resource('paleLionClaw', 'Pale Lion Claw', 'creature', 'A hooked claw made for sudden violence.', 'paleHuntLion'),
  paleLionSinew: resource('paleLionSinew', 'Pale Lion Sinew', 'creature', 'Powerful sinew from a mature lion.', 'paleHuntLion'),
  paleLionMane: resource('paleLionMane', 'Pale Lion Mane', 'rare', 'A mantle of pale, static-charged hair.', 'paleHuntLion'),
  paleLionEye: resource('paleLionEye', 'Pale Lion Eye', 'rare', 'An eye adapted to hunt beyond lantern light.', 'paleHuntLion'),

  wailingHorn: resource('wailingHorn', 'Wailing Horn', 'creature', 'A resonant horn from the Wailing Antelope.', 'wailingAntelope'),
  wailingOrgan: resource('wailingOrgan', 'Wailing Organ', 'creature', 'An organ that hums after death.', 'wailingAntelope'),
  wailingHide: resource('wailingHide', 'Wailing Hide', 'creature', 'Elastic hide marked by running scars.', 'wailingAntelope'),
  screamingSinew: resource('screamingSinew', 'Screaming Sinew', 'creature', 'Sinew that tightens at sudden sound.', 'wailingAntelope'),
  stomachStone: resource('stomachStone', 'Stomach Stone', 'rare', 'A polished stone formed in a quarry stomach.', 'wailingAntelope'),

  ashFeather: resource('ashFeather', 'Ash Feather', 'creature', 'A feather that smolders without burning.', 'ashPhoenix'),
  phoenixAsh: resource('phoenixAsh', 'Phoenix Ash', 'rare', 'Living ash gathered from an Ash Phoenix.', 'ashPhoenix'),
  timeBone: resource('timeBone', 'Time Bone', 'strange', 'Bone aged across several possible lives.', 'ashPhoenix'),
  burntOrgan: resource('burntOrgan', 'Burnt Organ', 'creature', 'A heat-cured organ from an Ash Phoenix.', 'ashPhoenix'),
  memoryGlass: resource('memoryGlass', 'Memory Glass', 'strange', 'Glass containing a moment the phoenix discarded.', 'ashPhoenix'),

  thunderGland: resource('thunderGland', 'Thunder Gland', 'creature', 'A gland that stores a violent charge.', 'bloatedGodling'),
  bloatedHide: resource('bloatedHide', 'Bloated Hide', 'creature', 'Swollen hide resistant to impact.', 'bloatedGodling'),
  denseOrgan: resource('denseOrgan', 'Dense Organ', 'creature', 'An impossibly heavy organ.', 'bloatedGodling'),
  stormBone: resource('stormBone', 'Storm Bone', 'rare', 'Bone veined with trapped lightning.', 'bloatedGodling'),

  silkGland: resource('silkGland', 'Silk Gland', 'creature', 'A gland filled with strong, workable silk.', 'silkMatriarch'),
  chitinThread: resource('chitinThread', 'Chitin Thread', 'creature', 'Fine thread with the strength of shell.', 'silkMatriarch'),
  venomSac: resource('venomSac', 'Venom Sac', 'rare', 'A carefully harvested venom reservoir.', 'silkMatriarch'),
  webbedHide: resource('webbedHide', 'Webbed Hide', 'creature', 'Hide layered with adhesive webbing.', 'silkMatriarch'),

  bloomPetal: resource('bloomPetal', 'Bloom Petal', 'creature', 'A sharp petal from the Bloom Knight.', 'bloomKnight'),
  duelistThorn: resource('duelistThorn', 'Duelist Thorn', 'rare', 'A perfectly balanced living thorn.', 'bloomKnight'),
  polishedStem: resource('polishedStem', 'Polished Stem', 'creature', 'A rigid stem polished by countless clashes.', 'bloomKnight'),
  floralSinew: resource('floralSinew', 'Floral Sinew', 'creature', 'Fibrous tissue that moves like muscle.', 'bloomKnight'),

  chitinPlate: resource('chitinPlate', 'Chitin Plate', 'creature', 'A broad plate from the Chitin Crusader.', 'chitinCrusader'),
  dungCore: resource('dungCore', 'Dung Core', 'strange', 'A compressed core carrying unusual heat.', 'chitinCrusader'),
  beetleHorn: resource('beetleHorn', 'Beetle Horn', 'creature', 'A heavy horn suited to crushing impacts.', 'chitinCrusader'),
  resinBlood: resource('resinBlood', 'Resin Blood', 'rare', 'Blood that hardens into amber resin.', 'chitinCrusader'),

  drakeScale: resource('drakeScale', 'Drake Scale', 'creature', 'A heatproof scale from the Drake Emperor.', 'drakeEmperor'),
  crystalBone: resource('crystalBone', 'Crystal Bone', 'rare', 'Translucent drake bone with a cutting edge.', 'drakeEmperor'),
  fireGland: resource('fireGland', 'Fire Gland', 'creature', 'An organ that produces furnace heat.', 'drakeEmperor'),
  imperialHorn: resource('imperialHorn', 'Imperial Horn', 'rare', 'A crown-like horn from the Drake Emperor.', 'drakeEmperor'),

  sunShell: resource('sunShell', 'Sun Shell', 'creature', 'A shell that remains warm in darkness.', 'sunSovereign'),
  radiantEye: resource('radiantEye', 'Radiant Eye', 'rare', 'An eye that shines with captured daylight.', 'sunSovereign'),
  solarIchor: resource('solarIchor', 'Solar Ichor', 'rare', 'Brilliant ichor from the Sun Sovereign.', 'sunSovereign'),
  blindingScale: resource('blindingScale', 'Blinding Scale', 'creature', 'A mirrored scale painful to look upon.', 'sunSovereign'),

  prideMane: resource('prideMane', 'Pride Mane', 'creature', 'A royal mane that refuses to lie flat.', 'prideKing'),
  kingClaw: resource('kingClaw', 'King Claw', 'rare', 'A massive claw from the Pride King.', 'prideKing'),
  goldenFang: resource('goldenFang', 'Golden Fang', 'rare', 'A fang with the color and weight of gold.', 'prideKing'),
  regalHide: resource('regalHide', 'Regal Hide', 'creature', 'Scarred hide from an apex ruler.', 'prideKing'),
  judgmentEye: resource('judgmentEye', 'Judgment Eye', 'strange', 'An eye that seems to weigh every weakness.', 'prideKing'),

  crackedMolar: resource('crackedMolar', 'Cracked Molar', 'rare', 'A thunder-split tooth from the Bloated Godling.', 'bloatedGodling'),
  crimsonScale: resource('crimsonScale', 'Crimson Scale', 'creature', 'A blood-red river scale.', 'crimsonCrocodile'),
  riverTooth: resource('riverTooth', 'River Tooth', 'creature', 'A tooth polished by black water.', 'crimsonCrocodile'),
  bloodMudOrgan: resource('bloodMudOrgan', 'Blood-Mud Organ', 'creature', 'An organ packed with mineral-rich mud.', 'crimsonCrocodile'),
  crocodileEye: resource('crocodileEye', 'Crocodile Eye', 'rare', 'A patient eye adapted to still water.', 'crimsonCrocodile'),
  redLeather: resource('redLeather', 'Red Leather', 'rare', 'Dense leather cured crimson by the creature.', 'crimsonCrocodile'),
  frogdogTongue: resource('frogdogTongue', 'Frogdog Tongue', 'creature', 'A long adhesive hunting tongue.', 'frogdog'),
  rubberyHide: resource('rubberyHide', 'Rubbery Hide', 'creature', 'Elastic hide that turns aside blunt force.', 'frogdog'),
  toxicGland: resource('toxicGland', 'Toxic Gland', 'rare', 'A gland filled with unstable venom.', 'frogdog'),
  wetBone: resource('wetBone', 'Wet Bone', 'creature', 'Bone that refuses to dry.', 'frogdog'),
  bulgingEye: resource('bulgingEye', 'Bulging Eye', 'strange', 'An eye that watches in several directions.', 'frogdog'),
  spiderEye: resource('spiderEye', 'Spider Eye', 'strange', 'A many-faceted eye from the Silk Matriarch.', 'silkMatriarch'),
  knightSeed: resource('knightSeed', 'Knight Seed', 'strange', 'A seed bearing a tiny armoured silhouette.', 'bloomKnight'),
  smogPipe: resource('smogPipe', 'Smog Pipe', 'creature', 'A hollow organ that produces choking song.', 'smogSingers'),
  sootLung: resource('sootLung', 'Soot Lung', 'creature', 'A lung lined with warm soot.', 'smogSingers'),
  harmonyBone: resource('harmonyBone', 'Harmony Bone', 'rare', 'Bone that vibrates in perfect intervals.', 'smogSingers'),
  tarFeather: resource('tarFeather', 'Tar Feather', 'creature', 'A feather heavy with fragrant tar.', 'smogSingers'),
  chokingMask: resource('chokingMask', 'Choking Mask', 'strange', 'A natural mask that whispers without breath.', 'smogSingers'),
  jewelWing: resource('jewelWing', 'Jewel Wing', 'strange', 'A brilliant wing plate from the Chitin Crusader.', 'chitinCrusader'),
  moltenEye: resource('moltenEye', 'Molten Eye', 'strange', 'A drake eye holding liquid fire.', 'drakeEmperor'),
  warmPearl: resource('warmPearl', 'Warm Pearl', 'strange', 'A pearl that radiates steady heat.', 'sunSovereign')
};

const additionalFamilies = [
  ['theKingInspired', 'Crown Fragment', 'Command Sinew', 'Royal Ichor'],
  ['cruelCollector', 'Hook Finger', 'Collection Hide', 'Catalog Eye'],
  ['wanderingKiller', 'Road Blade', 'Dust Sinew', 'Killer Token'],
  ['maskedJudge', 'Verdict Shard', 'Mask Leather', 'Sentence Eye'],
  ['regalKnight', 'Regal Plate', 'Courtly Bone', 'Banner Sinew'],
  ['shadowStalker', 'Shadow Hide', 'Night Claw', 'Dark Eye'],
  ['mirrorTyrant', 'Mirror Scale', 'Reflected Organ', 'Silver Bone'],
  ['blackKnightInspired', 'Black Plate', 'Iron Marrow', 'Oath Fang'],
  ['redWitchesInspired', 'Red Thread', 'Coven Organ', 'Hex Eye'],
  ['childEaterInspired', 'Hunger Tooth', 'Cradle Bone', 'Dread Organ'],
  ['pariahInspired', 'Exile Hide', 'Pariah Bone', 'Forsaken Eye'],
  ['watcherInspired', 'Watcher Plate', 'Lantern Marrow', 'Vigil Eye'],
  ['goldSmokeKnightInspired', 'Gold Smoke Plate', 'Gilded Bone', 'Smoke Eye'],
  ['gamblerInspired', 'Chance Bone', 'Wager Organ', 'Loaded Eye'],
  ['godhandInspired', 'Hand Bone', 'Divine Sinew', 'God Ichor'],
  ['wanderersPack', 'Wanderer Token', 'Road Hide', 'Far Eye'],
  ['scoutPack', 'Scout Token', 'Trail Sinew', 'Horizon Eye'],
  ['whiteBoxPack', 'White Fragment', 'Curio Hide', 'Box Eye'],
  ['strainPack', 'Strain Organ', 'Twisted Bone', 'Mutation Eye'],
  ['philosophyPack', 'Thought Bone', 'Question Organ', 'Idea Eye']
];

additionalFamilies.forEach(([creatureId, ...names]) => {
  names.forEach((name, index) => {
    const id = `${creatureId}Resource${index + 1}`;
    resources[id] = resource(
      id,
      name,
      index === 2 ? 'strange' : index === 1 ? 'rare' : 'creature',
      `${name} associated with ${creatureId}.`,
      creatureId
    );
  });
});

export const genericResourceIds = Object.values(resources)
  .filter(item => !item.creatureId && item.type !== 'rare' && item.type !== 'strange')
  .map(item => item.id);
