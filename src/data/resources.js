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
  regalHide: resource('regalHide', 'Regal Hide', 'creature', 'Scarred hide from an apex ruler.', 'prideKing')
};

export const genericResourceIds = Object.values(resources)
  .filter(item => !item.creatureId && item.type !== 'rare' && item.type !== 'strange')
  .map(item => item.id);
