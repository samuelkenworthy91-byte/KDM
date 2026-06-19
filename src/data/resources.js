export const BASIC_RESOURCE_IDS = ['bone', 'hide', 'organ', 'sinew', 'scrap', 'loveJuice'];
export const BODY_MATERIAL_TAGS = ['bone', 'hide', 'organ'];
export const genericResourceIds = BASIC_RESOURCE_IDS;

const genericDropWeights = {
  bone: 60,
  hide: 60,
  organ: 60,
  sinew: 60,
  scrap: 45,
  loveJuice: 12
};

function resource(id, name, type, description, creatureId, options = {}) {
  return {
    id,
    name,
    type,
    description,
    ...(creatureId ? { creatureId } : {}),
    materialTags: options.materialTags || [],
    basicResource: Boolean(options.basicResource),
    genericDropWeight: options.genericDropWeight ?? 0,
    specialUse: options.specialUse || null
  };
}

export const resources = {
  bone: resource('bone', 'Bone', 'basic', 'Hard monster bone used for weapons and structures.'),
  hide: resource('hide', 'Hide', 'basic', 'Tough hide used for armor and shelter.'),
  sinew: resource('sinew', 'Sinew', 'basic', 'Flexible tissue used for bindings and bowstrings.'),
  organ: resource('organ', 'Organ', 'basic', 'A preserved organ with alchemical uses.'),
  claw: resource('claw', 'Claw', 'monster', 'A sharp trophy from a slain creature.'),
  strangeEye: resource('strangeEye', 'Strange Eye', 'strange', 'An eye that remembers impossible sights.'),
  scrap: resource('scrap', 'Scrap', 'basic', 'Salvaged metal and useful debris.'),
  loveJuice: resource('loveJuice', 'Love Juice', 'basic', 'A rare life-giving basic resource used for future intimacy protection.'),
  fur: resource('fur', 'Fur', 'legacy', 'Warm monster fur.'),
  horn: resource('horn', 'Horn', 'monster', 'Dense horn suitable for tools and weapons.'),
  ichor: resource('ichor', 'Ichor', 'rare', 'Potent fluid taken from an advanced quarry.'),
  monsterTooth: resource('monsterTooth', 'Monster Tooth', 'rare', 'A trophy from a dangerous quarry.'),
  collectorsDue: resource(
    'collectorsDue',
    "Collector's Due",
    'nemesis',
    'A hooked tally-token taken from the Cruel Collector.'
  ),
  silentVerdictShard: resource(
    'silentVerdictShard',
    'Silent Verdict Shard',
    'nemesis',
    'A mask fragment that grows cold near a broken promise.'
  ),
  roadlessToken: resource(
    'roadlessToken',
    'Roadless Token',
    'nemesis',
    'A worn marker carried by the Wandering Killer between ambushes.'
  ),
  captiveShadow: resource(
    'captiveShadow',
    'Captive Shadow',
    'nemesis',
    'A strip of darkness that no longer follows its former owner.'
  ),
  tyrantMirrorSplinter: resource(
    'tyrantMirrorSplinter',
    'Tyrant Mirror Splinter',
    'nemesis',
    'Dark glass that reflects strength as weakness.'
  ),

  paleLionHide: resource('paleLionHide', 'Pale Lion Hide', 'creature', 'Moon-pale hide from the Pale Hunt Lion.', 'paleHuntLion'),
  paleLionClaw: resource('paleLionClaw', 'Pale Lion Claw', 'creature', 'A hooked claw made for sudden violence.', 'paleHuntLion'),
  paleLionSinew: resource('paleLionSinew', 'Pale Lion Sinew', 'creature', 'Powerful sinew from a mature lion.', 'paleHuntLion'),
  paleLionMane: resource('paleLionMane', 'Pale Lion Mane', 'rare', 'A mantle of pale, static-charged hair.', 'paleHuntLion'),
  paleLionEye: resource('paleLionEye', 'Pale Lion Eye', 'rare', 'An eye adapted to hunt beyond lantern light.', 'paleHuntLion'),
  elderPaleFang: resource('elderPaleFang', 'Elder Pale Fang', 'level3Rare', 'A flawless fang from an old pale predator.', 'paleHuntLion'),
  whiteHeart: resource('whiteHeart', 'White Heart', 'level3Rare', 'A pale heart that beats once after death.', 'paleHuntLion'),
  perfectMane: resource('perfectMane', 'Perfect Mane', 'level3Rare', 'An unscarred mane from a predator at its peak.', 'paleHuntLion'),

  wailingHorn: resource('wailingHorn', 'Wailing Horn', 'creature', 'A resonant horn from the Wailing Antelope.', 'wailingAntelope'),
  wailingOrgan: resource('wailingOrgan', 'Wailing Organ', 'creature', 'An organ that hums after death.', 'wailingAntelope'),
  wailingHide: resource('wailingHide', 'Wailing Hide', 'creature', 'Elastic hide marked by running scars.', 'wailingAntelope'),
  screamingSinew: resource('screamingSinew', 'Screaming Sinew', 'creature', 'Sinew that tightens at sudden sound.', 'wailingAntelope'),
  stomachStone: resource('stomachStone', 'Stomach Stone', 'rare', 'A polished stone formed in a quarry stomach.', 'wailingAntelope'),
  endlessMarrow: resource('endlessMarrow', 'Endless Marrow', 'level3Rare', 'Marrow hardened by a lifetime of running.', 'wailingAntelope'),

  ashFeather: resource('ashFeather', 'Ash Feather', 'creature', 'A feather that smolders without burning.', 'ashPhoenix'),
  phoenixAsh: resource('phoenixAsh', 'Phoenix Ash', 'rare', 'Living ash gathered from an Ash Phoenix.', 'ashPhoenix'),
  timeBone: resource('timeBone', 'Time Bone', 'strange', 'Bone aged across several possible lives.', 'ashPhoenix'),
  burntOrgan: resource('burntOrgan', 'Burnt Organ', 'creature', 'A heat-cured organ from an Ash Phoenix.', 'ashPhoenix'),
  memoryGlass: resource('memoryGlass', 'Memory Glass', 'strange', 'Glass containing a moment the phoenix discarded.', 'ashPhoenix'),
  unspentFeather: resource('unspentFeather', 'Unspent Feather', 'level3Rare', 'A feather from a future the phoenix never used.', 'ashPhoenix'),

  thunderGland: resource('thunderGland', 'Thunder Gland', 'creature', 'A gland that stores a violent charge.', 'bloatedGodling'),
  bloatedHide: resource('bloatedHide', 'Bloated Hide', 'creature', 'Swollen hide resistant to impact.', 'bloatedGodling'),
  denseOrgan: resource('denseOrgan', 'Dense Organ', 'creature', 'An impossibly heavy organ.', 'bloatedGodling'),
  stormBone: resource('stormBone', 'Storm Bone', 'rare', 'Bone veined with trapped lightning.', 'bloatedGodling'),
  livingThunderCore: resource('livingThunderCore', 'Living Thunder Core', 'level3Rare', 'A charged core that refuses to become still.', 'bloatedGodling'),

  silkGland: resource('silkGland', 'Silk Gland', 'creature', 'A gland filled with strong, workable silk.', 'silkMatriarch'),
  chitinThread: resource('chitinThread', 'Chitin Thread', 'creature', 'Fine thread with the strength of shell.', 'silkMatriarch'),
  venomSac: resource('venomSac', 'Venom Sac', 'rare', 'A carefully harvested venom reservoir.', 'silkMatriarch'),
  webbedHide: resource('webbedHide', 'Webbed Hide', 'creature', 'Hide layered with adhesive webbing.', 'silkMatriarch'),
  broodCrown: resource('broodCrown', 'Brood Crown', 'level3Rare', 'The hardened crest of an ancient matriarch.', 'silkMatriarch'),

  bloomPetal: resource('bloomPetal', 'Bloom Petal', 'creature', 'A sharp petal from the Bloom Knight.', 'bloomKnight'),
  duelistThorn: resource('duelistThorn', 'Duelist Thorn', 'rare', 'A perfectly balanced living thorn.', 'bloomKnight'),
  polishedStem: resource('polishedStem', 'Polished Stem', 'creature', 'A rigid stem polished by countless clashes.', 'bloomKnight'),
  floralSinew: resource('floralSinew', 'Floral Sinew', 'creature', 'Fibrous tissue that moves like muscle.', 'bloomKnight'),
  perfectThornHeart: resource('perfectThornHeart', 'Perfect Thorn Heart', 'level3Rare', 'A heart grown around one immaculate thorn.', 'bloomKnight'),

  chitinPlate: resource('chitinPlate', 'Chitin Plate', 'creature', 'A broad plate from the Chitin Crusader.', 'chitinCrusader'),
  dungCore: resource('dungCore', 'Dung Core', 'strange', 'A compressed core carrying unusual heat.', 'chitinCrusader'),
  beetleHorn: resource('beetleHorn', 'Beetle Horn', 'creature', 'A heavy horn suited to crushing impacts.', 'chitinCrusader'),
  resinBlood: resource('resinBlood', 'Resin Blood', 'rare', 'Blood that hardens into amber resin.', 'chitinCrusader'),
  crusaderHeartplate: resource('crusaderHeartplate', 'Crusader Heartplate', 'level3Rare', 'A final plate grown over the creature’s heart.', 'chitinCrusader'),

  drakeScale: resource('drakeScale', 'Drake Scale', 'creature', 'A heatproof scale from the Drake Emperor.', 'drakeEmperor'),
  crystalBone: resource('crystalBone', 'Crystal Bone', 'rare', 'Translucent drake bone with a cutting edge.', 'drakeEmperor'),
  fireGland: resource('fireGland', 'Fire Gland', 'creature', 'An organ that produces furnace heat.', 'drakeEmperor'),
  imperialHorn: resource('imperialHorn', 'Imperial Horn', 'rare', 'A crown-like horn from the Drake Emperor.', 'drakeEmperor'),
  emperorFlameMarrow: resource('emperorFlameMarrow', 'Emperor Flame Marrow', 'level3Rare', 'Crystal marrow holding a sovereign flame.', 'drakeEmperor'),

  sunShell: resource('sunShell', 'Sun Shell', 'creature', 'A shell that remains warm in darkness.', 'sunSovereign'),
  radiantEye: resource('radiantEye', 'Radiant Eye', 'rare', 'An eye that shines with captured daylight.', 'sunSovereign'),
  solarIchor: resource('solarIchor', 'Solar Ichor', 'rare', 'Brilliant ichor from the Sun Sovereign.', 'sunSovereign'),
  blindingScale: resource('blindingScale', 'Blinding Scale', 'creature', 'A mirrored scale painful to look upon.', 'sunSovereign'),
  captiveNoon: resource('captiveNoon', 'Captive Noon', 'level3Rare', 'A bead of daylight sealed inside shell.', 'sunSovereign'),

  prideMane: resource('prideMane', 'Pride Mane', 'creature', 'A royal mane that refuses to lie flat.', 'prideKing'),
  kingClaw: resource('kingClaw', 'King Claw', 'rare', 'A massive claw from the Pride King.', 'prideKing'),
  goldenFang: resource('goldenFang', 'Golden Fang', 'rare', 'A fang with the color and weight of gold.', 'prideKing'),
  regalHide: resource('regalHide', 'Regal Hide', 'creature', 'Scarred hide from an apex ruler.', 'prideKing'),
  judgmentEye: resource('judgmentEye', 'Judgment Eye', 'strange', 'An eye that seems to weigh every weakness.', 'prideKing'),
  crownHeart: resource('crownHeart', 'Crown Heart', 'level3Rare', 'The dense heart of a ruler that never bowed.', 'prideKing'),

  crackedMolar: resource('crackedMolar', 'Cracked Molar', 'rare', 'A thunder-split tooth from the Bloated Godling.', 'bloatedGodling'),
  crimsonScale: resource('crimsonScale', 'Crimson Scale', 'creature', 'A blood-red river scale.', 'crimsonCrocodile'),
  riverTooth: resource('riverTooth', 'River Tooth', 'creature', 'A tooth polished by black water.', 'crimsonCrocodile'),
  bloodMudOrgan: resource('bloodMudOrgan', 'Blood-Mud Organ', 'creature', 'An organ packed with mineral-rich mud.', 'crimsonCrocodile'),
  crocodileEye: resource('crocodileEye', 'Crocodile Eye', 'rare', 'A patient eye adapted to still water.', 'crimsonCrocodile'),
  redLeather: resource('redLeather', 'Red Leather', 'rare', 'Dense leather cured crimson by the creature.', 'crimsonCrocodile'),
  riverKingHeart: resource('riverKingHeart', 'River King Heart', 'level3Rare', 'A cold heart packed with black river silt.', 'crimsonCrocodile'),
  frogdogTongue: resource('frogdogTongue', 'Frogdog Tongue', 'creature', 'A long adhesive hunting tongue.', 'frogdog'),
  rubberyHide: resource('rubberyHide', 'Rubbery Hide', 'creature', 'Elastic hide that turns aside blunt force.', 'frogdog'),
  toxicGland: resource('toxicGland', 'Toxic Gland', 'rare', 'A gland filled with unstable venom.', 'frogdog'),
  wetBone: resource('wetBone', 'Wet Bone', 'creature', 'Bone that refuses to dry.', 'frogdog'),
  bulgingEye: resource('bulgingEye', 'Bulging Eye', 'strange', 'An eye that watches in several directions.', 'frogdog'),
  manyMouthGland: resource('manyMouthGland', 'Many-Mouth Gland', 'level3Rare', 'A gland that twitches toward nearby movement.', 'frogdog'),
  spiderEye: resource('spiderEye', 'Spider Eye', 'strange', 'A many-faceted eye from the Silk Matriarch.', 'silkMatriarch'),
  knightSeed: resource('knightSeed', 'Knight Seed', 'strange', 'A seed bearing a tiny armoured silhouette.', 'bloomKnight'),
  smogPipe: resource('smogPipe', 'Smog Pipe', 'creature', 'A hollow organ that produces choking song.', 'smogSingers'),
  sootLung: resource('sootLung', 'Soot Lung', 'creature', 'A lung lined with warm soot.', 'smogSingers'),
  harmonyBone: resource('harmonyBone', 'Harmony Bone', 'rare', 'Bone that vibrates in perfect intervals.', 'smogSingers'),
  tarFeather: resource('tarFeather', 'Tar Feather', 'creature', 'A feather heavy with fragrant tar.', 'smogSingers'),
  chokingMask: resource('chokingMask', 'Choking Mask', 'strange', 'A natural mask that whispers without breath.', 'smogSingers'),
  finalChorusLung: resource('finalChorusLung', 'Final Chorus Lung', 'level3Rare', 'A lung that exhales a complete chord.', 'smogSingers'),
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

const explicitMaterialTags = {
  bone: ['bone'],
  hide: ['hide'],
  organ: ['organ'],
  sinew: ['organ'],
  scrap: ['scrap'],
  loveJuice: ['organ'],
  claw: ['bone'],
  fur: ['hide'],
  horn: ['bone'],
  ichor: ['organ'],
  monsterTooth: ['bone'],
  strangeEye: ['organ'],
  captiveShadow: ['organ'],
  paleLionHide: ['hide'],
  paleLionClaw: ['bone'],
  paleLionSinew: ['organ'],
  paleLionMane: ['hide'],
  paleLionEye: ['organ'],
  elderPaleFang: ['bone'],
  whiteHeart: ['organ'],
  perfectMane: ['hide'],
  wailingHorn: ['bone'],
  wailingOrgan: ['organ'],
  wailingHide: ['hide'],
  screamingSinew: ['organ'],
  stomachStone: ['bone', 'organ'],
  endlessMarrow: ['bone', 'organ'],
  ashFeather: ['hide'],
  phoenixAsh: ['organ', 'scrap'],
  timeBone: ['bone'],
  burntOrgan: ['organ'],
  memoryGlass: ['organ', 'scrap'],
  unspentFeather: ['hide'],
  thunderGland: ['organ'],
  bloatedHide: ['hide'],
  denseOrgan: ['organ'],
  stormBone: ['bone'],
  livingThunderCore: ['bone', 'organ'],
  crackedMolar: ['bone'],
  silkGland: ['organ'],
  chitinThread: ['organ'],
  venomSac: ['organ'],
  webbedHide: ['hide'],
  broodCrown: ['bone'],
  spiderEye: ['organ'],
  bloomPetal: ['hide'],
  duelistThorn: ['bone'],
  polishedStem: ['bone'],
  floralSinew: ['organ'],
  perfectThornHeart: ['bone', 'organ'],
  knightSeed: ['organ'],
  chitinPlate: ['bone', 'hide'],
  dungCore: ['organ', 'scrap'],
  beetleHorn: ['bone'],
  resinBlood: ['organ'],
  crusaderHeartplate: ['bone', 'organ'],
  jewelWing: ['hide'],
  drakeScale: ['hide'],
  crystalBone: ['bone'],
  fireGland: ['organ'],
  imperialHorn: ['bone'],
  emperorFlameMarrow: ['bone', 'organ'],
  moltenEye: ['organ'],
  sunShell: ['bone', 'hide'],
  radiantEye: ['organ'],
  solarIchor: ['organ'],
  blindingScale: ['hide'],
  captiveNoon: ['organ', 'scrap'],
  warmPearl: ['bone', 'organ'],
  prideMane: ['hide'],
  kingClaw: ['bone'],
  goldenFang: ['bone'],
  regalHide: ['hide'],
  judgmentEye: ['organ'],
  crownHeart: ['organ'],
  crimsonScale: ['hide'],
  riverTooth: ['bone'],
  bloodMudOrgan: ['organ'],
  crocodileEye: ['organ'],
  redLeather: ['hide'],
  riverKingHeart: ['organ'],
  frogdogTongue: ['organ'],
  rubberyHide: ['hide'],
  toxicGland: ['organ'],
  wetBone: ['bone'],
  bulgingEye: ['organ'],
  manyMouthGland: ['organ'],
  smogPipe: ['organ'],
  sootLung: ['organ'],
  harmonyBone: ['bone'],
  tarFeather: ['hide', 'organ'],
  chokingMask: ['bone', 'hide'],
  finalChorusLung: ['organ']
};

const generatedMaterialTagsByName = {
  'Crown Fragment': ['bone', 'scrap'],
  'Command Sinew': ['organ'],
  'Royal Ichor': ['organ'],
  'Hook Finger': ['bone'],
  'Collection Hide': ['hide'],
  'Catalog Eye': ['organ'],
  'Road Blade': ['bone', 'scrap'],
  'Dust Sinew': ['organ'],
  'Killer Token': ['scrap'],
  'Verdict Shard': ['bone', 'scrap'],
  'Mask Leather': ['hide'],
  'Sentence Eye': ['organ'],
  'Regal Plate': ['bone', 'hide'],
  'Courtly Bone': ['bone'],
  'Banner Sinew': ['organ'],
  'Shadow Hide': ['hide'],
  'Night Claw': ['bone'],
  'Dark Eye': ['organ'],
  'Mirror Scale': ['hide'],
  'Reflected Organ': ['organ'],
  'Silver Bone': ['bone'],
  'Black Plate': ['bone', 'hide'],
  'Iron Marrow': ['bone', 'organ'],
  'Oath Fang': ['bone'],
  'Red Thread': ['organ'],
  'Coven Organ': ['organ'],
  'Hex Eye': ['organ'],
  'Hunger Tooth': ['bone'],
  'Cradle Bone': ['bone'],
  'Dread Organ': ['organ'],
  'Exile Hide': ['hide'],
  'Pariah Bone': ['bone'],
  'Forsaken Eye': ['organ'],
  'Watcher Plate': ['bone', 'hide'],
  'Lantern Marrow': ['bone', 'organ'],
  'Vigil Eye': ['organ'],
  'Gold Smoke Plate': ['bone', 'hide'],
  'Gilded Bone': ['bone'],
  'Smoke Eye': ['organ'],
  'Chance Bone': ['bone'],
  'Wager Organ': ['organ'],
  'Loaded Eye': ['organ'],
  'Hand Bone': ['bone'],
  'Divine Sinew': ['organ'],
  'God Ichor': ['organ'],
  'Wanderer Token': ['scrap'],
  'Road Hide': ['hide'],
  'Far Eye': ['organ'],
  'Scout Token': ['scrap'],
  'Trail Sinew': ['organ'],
  'Horizon Eye': ['organ'],
  'White Fragment': ['bone', 'scrap'],
  'Curio Hide': ['hide'],
  'Box Eye': ['organ'],
  'Strain Organ': ['organ'],
  'Twisted Bone': ['bone'],
  'Mutation Eye': ['organ'],
  'Thought Bone': ['bone'],
  'Question Organ': ['organ'],
  'Idea Eye': ['organ']
};

function inferMaterialTags(resource = {}) {
  const text = `${resource.name || ''} ${resource.id || ''}`.toLowerCase();
  const tags = [];
  if (/(hide|leather|pelt|mane|fur|feather|scale|wing|cloak)/.test(text)) tags.push('hide');
  if (/(bone|fang|tooth|claw|horn|shell|shard|plate|crown|thorn|stem|marrow)/.test(text)) tags.push('bone');
  if (/(organ|heart|eye|gland|lung|sac|ichor|blood|sinew|tongue|thread|seed|core)/.test(text)) tags.push('organ');
  if (/(token|scrap|fragment|blade|mirror|glass|metal|shard|due|verdict)/.test(text)) tags.push('scrap');
  return [...new Set(tags)];
}

Object.values(resources).forEach(item => {
  const materialTags = explicitMaterialTags[item.id] ||
    generatedMaterialTagsByName[item.name] ||
    inferMaterialTags(item);
  item.materialTags = [...new Set(materialTags)];
  item.basicResource = BASIC_RESOURCE_IDS.includes(item.id);
  item.genericDropWeight = genericDropWeights[item.id] ?? 0;
  item.specialUse = item.id === 'loveJuice'
    ? 'Future intimacy protection.'
    : item.specialUse || null;
});

export function getResourceMaterialTags(resourceId) {
  return resources[resourceId]?.materialTags || [];
}

export function resourceCanPayMaterial(resourceId, material) {
  return getResourceMaterialTags(resourceId).includes(material);
}

export function getGenericResourceDropWeight(resourceId) {
  return resources[resourceId]?.genericDropWeight || 0;
}
