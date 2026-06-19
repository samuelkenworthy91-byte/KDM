const WEAPON_TYPES = [
  ['katana', 'Katana'],
  ['sword', 'Sword'],
  ['dagger', 'Dagger'],
  ['whip', 'Whip'],
  ['grandWeapon', 'Grand Weapon'],
  ['katar', 'Katar Pair'],
  ['shield', 'Shield'],
  ['bow', 'Bow'],
  ['axe', 'Axe'],
  ['fistAndTooth', 'Fist & Tooth'],
  ['spear', 'Spear']
];

const BODY_SLOTS = ['head', 'chest', 'arms', 'legs', 'accessory'];

const normalQuarrySuites = [
  {
    quarryId: 'paleHuntLion',
    buildingId: 'lionTrophyHall',
    primary: 'Pale',
    secondary: 'Mane',
    finisher: 'Ambush',
    mechanic: 'Ambush',
    mechanicPair: 'Ambush and Pounce',
    armourSet: 'Prowler Hide',
    armourPrefix: 'Pale',
    armourTrigger: 'Ambush or Pounce',
    weaponNames: ['Moon-Wait Blade', 'Mane-Splitter', 'Quiet Fang', 'Tail-Loop Lash', 'Den-Roar Cleaver', 'Twin Pounce Claws', 'Maneguard Targe', 'Low-Crouch Bow', 'Pridebreaker Axe', 'Tooth-and-Knuckle Rites', 'Dawn-Stalk Spear'],
    instrument: 'Den-Hum Drum',
    tools: ['Mane Snare Kit', 'Blindside Chalk', 'Hunter Eye Needle', 'Pounce Hook'],
    resources: ['paleLionHide', 'paleLionClaw', 'paleLionSinew', 'paleLionMane', 'paleLionEye']
  },
  {
    quarryId: 'wailingAntelope',
    buildingId: 'antelopeLarder',
    primary: 'Dust',
    secondary: 'Horn',
    finisher: 'Momentum',
    mechanic: 'Momentum',
    mechanicPair: 'Momentum and Graze',
    armourSet: 'Dust Grazer',
    armourPrefix: 'Dust',
    armourTrigger: 'Momentum or Graze',
    weaponNames: ['Dust-Breath Katana', 'Ribpath Cutter', 'Grass-Quick Knife', 'Wailing Sinew Lash', 'Stomach-Stone Ram', 'Twin Hoof Katars', 'Horn-Rim Buckler', 'Long-Grass Bow', 'Marrow-Hunger Axe', 'Hoofbone Knuckles', 'Far-Plain Spear'],
    instrument: 'Hollow Horn Choir',
    tools: ['Grazing Charm', 'Stomach Stone Gauge', 'Sinew Runeline', 'Hunger Hook'],
    resources: ['wailingHorn', 'wailingOrgan', 'wailingHide', 'screamingSinew', 'stomachStone']
  },
  {
    quarryId: 'ashPhoenix',
    buildingId: 'phoenixPyre',
    primary: 'Ashen',
    secondary: 'Feather',
    finisher: 'Ash',
    mechanic: 'Ash Memory',
    mechanicPair: 'Ash Memory and Time Slip',
    armourSet: 'Yesterday Ash',
    armourPrefix: 'Ashen',
    armourTrigger: 'Ash Memory or Time Slip',
    weaponNames: ['Yesterday Edge', 'Cinder-Recalled Sword', 'Unspent Feather Knife', 'Hourglass Lash', 'Future-Burn Maul', 'Twin Ash Talons', 'Beforelight Shield', 'Second-Sun Bow', 'Forgetful Fire Axe', 'Ashen Palm Rites', 'Afterimage Spear'],
    instrument: 'Winged Harp of Later',
    tools: ['Memory Glass Lens', 'Phoenix Ash Vial', 'Time Bone Pin', 'Unspent Feather Fan'],
    resources: ['ashFeather', 'phoenixAsh', 'timeBone', 'burntOrgan', 'memoryGlass']
  },
  {
    quarryId: 'bloatedGodling',
    buildingId: 'stormShrine',
    primary: 'Thunder',
    secondary: 'Gland',
    finisher: 'Charge',
    mechanic: 'Charge',
    mechanicPair: 'Charge and Surge',
    armourSet: 'Living Storm',
    armourPrefix: 'Thunder',
    armourTrigger: 'Charge or Surge',
    weaponNames: ['Storm-Held Katana', 'Blue Pulse Sword', 'Static Molar Knife', 'Nerve-Arc Lash', 'Thunderbelly Breaker', 'Twin Spark Katars', 'Surge-Stomach Shield', 'Lightning Vessel Bow', 'Cracked-Molar Axe', 'Stormfist Rites', 'Blue Rod Spear'],
    instrument: 'Thunder Gut Gong',
    tools: ['Charge Rod', 'Gland Clamp', 'Surge Jar', 'Storm Stitcher'],
    resources: ['thunderGland', 'bloatedHide', 'denseOrgan', 'stormBone', 'crackedMolar']
  },
  {
    quarryId: 'crimsonCrocodile',
    buildingId: 'redTannery',
    primary: 'Crimson',
    secondary: 'Scale',
    finisher: 'Drag,',
    mechanic: 'Blood-Water',
    mechanicPair: 'Drag, Marked and Blood-Water',
    armourSet: 'Red River',
    armourPrefix: 'Crimson',
    armourTrigger: 'Blood-Water or Submerge',
    weaponNames: ['Still-Water Katana', 'Red Leather Sabre', 'River Tooth Knife', 'Mud-Drag Lash', 'Deathroll Cleaver', 'Twin Lockjaw Katars', 'Crimson Scale Shield', 'Bankshadow Bow', 'Scale-Rip Axe', 'Lockjaw Rites', 'Reed-Lurker Spear'],
    instrument: 'Mudlung Horn',
    tools: ['Blood-Mud Poultice', 'Crocodile Eye Prism', 'River Snare Peg', 'Red Leather Strap'],
    resources: ['crimsonScale', 'riverTooth', 'bloodMudOrgan', 'crocodileEye', 'redLeather']
  },
  {
    quarryId: 'frogdog',
    buildingId: 'wetYard',
    primary: 'Wet',
    secondary: 'Tongue',
    finisher: 'Poison,',
    mechanic: 'Poison',
    mechanicPair: 'Poison, Bloat and Tongue Snare',
    armourSet: 'Rubbery Bloat',
    armourPrefix: 'Wet',
    armourTrigger: 'Poison or Bloat',
    weaponNames: ['Wetbone Katana', 'Rubberhide Blade', 'Toxic Tongue Knife', 'Many-Mouth Lash', 'Bulging Godhammer', 'Twin Gland Katars', 'Rubberhide Bulwark', 'Puddle-Spore Bow', 'Wetbone Splitter', 'Swampbite Rites', 'Tongue-Line Spear'],
    instrument: 'Croaking Lung Pipes',
    tools: ['Toxic Gland Dropper', 'Bulging Eye Mirror', 'Wetbone Splint', 'Tongue Spool'],
    resources: ['frogdogTongue', 'rubberyHide', 'toxicGland', 'wetBone', 'bulgingEye']
  },
  {
    quarryId: 'silkMatriarch',
    buildingId: 'silkLoom',
    primary: 'Silk',
    secondary: 'Thread',
    finisher: 'Snare',
    mechanic: 'Snare',
    mechanicPair: 'Snare and Bind Wound',
    armourSet: 'Broodweb',
    armourPrefix: 'Silk',
    armourTrigger: 'Snare or Bind Wound',
    weaponNames: ['Web-Drawn Katana', 'Chitin Thread Sword', 'Venom Kiss Knife', 'Widowline Lash', 'Brood-Crown Glaive', 'Twin Spinner Katars', 'Webbed Hide Ward', 'Silkstrand Bow', 'Egg-Sac Axe', 'Silkgrip Rites', 'Needleleg Spear'],
    instrument: 'Spinneret Harp',
    tools: ['Bind-Wound Needle', 'Snare Shuttle', 'Venom Sac Vial', 'Spider Eye Lens'],
    resources: ['silkGland', 'chitinThread', 'venomSac', 'webbedHide', 'spiderEye']
  },
  {
    quarryId: 'bloomKnight',
    buildingId: 'duelistGarden',
    primary: 'Bloom',
    secondary: 'Thorn',
    finisher: 'Duel,',
    mechanic: 'Flourish',
    mechanicPair: 'Duel, Flourish and Riposte',
    armourSet: 'Bloom Duelist',
    armourPrefix: 'Bloom',
    armourTrigger: 'Flourish or Riposte',
    weaponNames: ['Petal-Still Katana', 'Thorn Court Sword', 'Rosepoint Knife', 'Floral Sinew Lash', 'Garden Oath Greatblade', 'Twin Thorn Katars', 'Petalguard Shield', 'Stemline Bow', 'Pruning Axe', 'Thornhand Rites', 'Perfect-Thrust Spear'],
    instrument: 'Glass-Petal Violin',
    tools: ['Duelist Thorn Pin', 'Petal Counterweight', 'Polished Stem Rule', 'Knight Seed Charm'],
    resources: ['bloomPetal', 'duelistThorn', 'polishedStem', 'floralSinew', 'knightSeed']
  },
  {
    quarryId: 'smogSingers',
    buildingId: 'smogKiln',
    primary: 'Smog',
    secondary: 'Lung',
    finisher: 'Chorus,',
    mechanic: 'Chorus',
    mechanicPair: 'Chorus, Smoke and Panic Control',
    armourSet: 'Chorus Mask',
    armourPrefix: 'Smog',
    armourTrigger: 'Chorus or Smoke Veil',
    weaponNames: ['Black-Harmony Katana', 'Sootbreath Sword', 'Choking Mask Knife', 'Tar-Feather Lash', 'Final Chorus Maul', 'Twin Soot Katars', 'Smokeveil Shield', 'Ashen Note Bow', 'Kiln-Cough Axe', 'Tar-Lung Rites', 'Harmonic Spear'],
    instrument: 'Final Chorus Lute',
    tools: ['Soot Lung Bellows', 'Harmony Bone Tuner', 'Smog Pipe Reed', 'Choking Mask Filter'],
    resources: ['smogPipe', 'sootLung', 'harmonyBone', 'tarFeather', 'chokingMask']
  },
  {
    quarryId: 'chitinCrusader',
    buildingId: 'chitinFoundry',
    primary: 'Amber',
    secondary: 'Plate',
    finisher: 'Resin,',
    mechanic: 'Resin',
    mechanicPair: 'Resin, Plate and Fortress Block',
    armourSet: 'Amber Fortress',
    armourPrefix: 'Amber',
    armourTrigger: 'Resin or Plate Lock',
    weaponNames: ['Amber-Seam Katana', 'Chitin Plate Sword', 'Resin-Blood Knife', 'Jewelwing Lash', 'Crusader Heartplate Maul', 'Twin Mandible Katars', 'Amber Fortress Shield', 'Beetle-Horn Bow', 'Plate-Grind Axe', 'Shellknuckle Rites', 'Horncharge Spear'],
    instrument: 'Beetle-Horn Bugle',
    tools: ['Resin Blood Jar', 'Plate Riveter', 'Dung Core Heater', 'Jewelwing Prism'],
    resources: ['chitinPlate', 'dungCore', 'beetleHorn', 'resinBlood', 'jewelWing']
  },
  {
    quarryId: 'drakeEmperor',
    buildingId: 'crystalForge',
    primary: 'Imperial',
    secondary: 'Crystal',
    finisher: 'Imperial',
    mechanic: 'Flame',
    mechanicPair: 'Imperial Fire and Crystal Edge',
    armourSet: 'Imperial Crystal',
    armourPrefix: 'Imperial',
    armourTrigger: 'Flame or Crystal Guard',
    weaponNames: ['Molten-Edict Katana', 'Crystal Crown Sword', 'Fire-Gland Knife', 'Scalefire Lash', 'Emperor Flame Maul', 'Twin Drake Katars', 'Imperial Scale Shield', 'Crownfire Bow', 'Crystalbone Axe', 'Drakeclaw Rites', 'Furnace Horn Spear'],
    instrument: 'Crownfire Organ',
    tools: ['Fire Gland Injector', 'Crystal Bone Wedge', 'Molten Eye Lens', 'Imperial Horn Compass'],
    resources: ['drakeScale', 'crystalBone', 'fireGland', 'imperialHorn', 'moltenEye']
  },
  {
    quarryId: 'sunSovereign',
    buildingId: 'shellSanctum',
    primary: 'Solar',
    secondary: 'Shell',
    finisher: 'Radiance,',
    mechanic: 'Radiance',
    mechanicPair: 'Radiance, Blind and Warmth',
    armourSet: 'Captured Day',
    armourPrefix: 'Solar',
    armourTrigger: 'Radiance or Warmth',
    weaponNames: ['Noon-Sealed Katana', 'Radiant Shell Sword', 'Blinding Scale Knife', 'Heat-Mirage Lash', 'Captured Noon Hammer', 'Twin Sun Katars', 'Sky-Reef Aegis', 'White-Horizon Bow', 'Solar Splitter', 'Sunhand Rites', 'Dawnbeam Spear'],
    instrument: 'Warm Pearl Chime',
    tools: ['Radiant Eye Prism', 'Solar Ichor Dropper', 'Warm Pearl Cup', 'Blinding Scale Shard'],
    resources: ['sunShell', 'radiantEye', 'solarIchor', 'blindingScale', 'warmPearl']
  },
  {
    quarryId: 'prideKing',
    buildingId: 'prideHall',
    primary: 'Golden',
    secondary: 'Mane',
    finisher: 'Judgment,',
    mechanic: 'Judgment',
    mechanicPair: 'Judgment, Dominion and Royal Guard',
    armourSet: 'Royal Mane',
    armourPrefix: 'Golden',
    armourTrigger: 'Judgment or Royal Guard',
    weaponNames: ['Perfect Dominion Katana', 'Crownless Sword', 'Judgment Eye Knife', 'Regal Mane Lash', 'Royal Maul Greatweapon', 'Twin Crown Katars', 'Mane-Wall Shield', 'Golden Sentence Bow', 'Kingclaw Axe', 'Dominion Rites', 'Thronepoint Spear'],
    instrument: 'Judgment Horn',
    tools: ['Judgment Eye Lens', 'Crown Heart Seal', 'Golden Fang Awl', 'Regal Hide Banner'],
    resources: ['prideMane', 'kingClaw', 'goldenFang', 'regalHide', 'judgmentEye']
  }
];

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function cardId(sourceGearId, name) {
  return `normal_${sourceGearId}_${slugify(name)}`;
}

function titleCaseSlot(slot) {
  return slot === 'accessory' ? 'Accessory' : slot[0].toUpperCase() + slot.slice(1);
}

function setupEffect(mechanic, amount = 1) {
  if (mechanic === 'Charge') return { type: 'gainCharge', amount };
  return { type: 'preparedSelf', amount };
}

function mechanicTargetEffect(mechanic, amount = 1) {
  if (mechanic === 'Poison') return { type: 'poisonTarget', amount };
  if (mechanic === 'Snare') return { type: 'snareTarget', amount };
  if (mechanic === 'Flame') return { type: 'burnTarget', amount };
  if (mechanic === 'Radiance') return { type: 'blindTarget', amount };
  if (mechanic === 'Judgment' || mechanic === 'Blood-Water') return { type: 'markTarget', amount };
  return setupEffect(mechanic, amount);
}

function makeCard({ sourceGearId, name, cost, description, effects, type = 'skill', tags = [], weaponType = null }) {
  return {
    id: cardId(sourceGearId, name),
    name,
    cost,
    description,
    effects,
    type,
    tags,
    sourceType: 'equipment',
    sourceGearId,
    ...(weaponType ? { weaponType } : {}),
    implemented: true
  };
}

function weaponCardSpecs(suite, weaponType) {
  const primary = suite.primary;
  const secondary = suite.secondary;
  const finisher = suite.finisher;
  const mechanic = suite.mechanic;
  const finisherText = finisher.endsWith(',') ? finisher : finisher;
  const commonTags = ['gear', 'weapon', 'normal', weaponType, slugify(mechanic)];
  const specs = {
    katana: [
      [`${primary} Patient Edge`, 0, `Gain ${mechanic} 1. Your next Katana attack this fight deals +2 damage.`, [setupEffect(mechanic), { type: 'nextAttackBonus', amount: 2 }], 'skill'],
      [`${secondary} Held Breath Cut`, 1, `Deal 5 damage. You may spend any ${mechanic}; deal +2 damage for each spent.`, [{ type: 'damage', amount: 5 }, { type: 'nextAttackBonus', amount: 2 }], 'attack'],
      [`${finisherText} One Clean Moment`, 2, `Deal 9 damage. If you built ${mechanic} on a previous turn, ignore 2 Block.`, [{ type: 'removeMonsterBlock', amount: 2 }, { type: 'damage', amount: 9 }], 'attack']
    ],
    sword: [
      [`${primary} Reliable Cut`, 1, 'Deal 4 damage. If this wounds, gain 1 Survival.', [{ type: 'damage', amount: 4 }, { type: 'survival', amount: 1 }], 'attack'],
      [`${secondary} Guarded Advance`, 1, 'Deal 3 damage and gain 2 Block.', [{ type: 'damage', amount: 3 }, { type: 'block', amount: 2 }], 'attack'],
      [`${finisherText} Follow Through`, 2, `Deal 6 damage. If the quarry has ${mechanic}, draw 1 card.`, [{ type: 'damage', amount: 6 }, { type: 'draw', amount: 1 }], 'attack']
    ],
    dagger: [
      [`${primary} Quick Nick`, 0, `Deal 1 damage. Apply Bleed 1 or ${mechanic} 1.`, [{ type: 'damage', amount: 1 }, { type: 'bleedMonster', amount: 1 }, mechanicTargetEffect(mechanic)], 'attack'],
      [`${secondary} Soft Spot Work`, 1, `Deal 2 damage. If the quarry has Block, deal only 1 damage but apply ${mechanic} 2.`, [{ type: 'damage', amount: 2 }, mechanicTargetEffect(mechanic, 2)], 'attack'],
      [`${finisherText} Many Little Hurts`, 1, 'Deal 1 damage three times. Each hit can add 1 DoT if it wounds.', [{ type: 'multiHitDamage', amount: 1, hits: 3 }, { type: 'bleedMonster', amount: 1 }], 'attack']
    ],
    whip: [
      [`${primary} Hook and Call`, 1, 'Deal 3 damage. The quarry is more likely to target this survivor next turn.', [{ type: 'damage', amount: 3 }, { type: 'markTarget', amount: 1 }], 'attack'],
      [`${secondary} Dragging Line`, 1, 'Apply Snare 1 and remove 2 quarry Block.', [{ type: 'snareTarget', amount: 1 }, { type: 'removeMonsterBlock', amount: 2 }], 'skill'],
      [`${finisherText} Punishing Crack`, 2, 'Deal 5 damage. If the quarry targets you next turn, gain 4 Block first.', [{ type: 'block', amount: 4 }, { type: 'damage', amount: 5 }], 'attack']
    ],
    grandWeapon: [
      [`${primary} Commit the Weight`, 3, 'Deal 11 damage. You cannot play Block cards after this card this turn.', [{ type: 'damage', amount: 11 }], 'attack'],
      [`${secondary} Breaking Arc`, 3, 'Deal 8 damage and remove 6 quarry Block.', [{ type: 'removeMonsterBlock', amount: 6 }, { type: 'damage', amount: 8 }], 'attack'],
      [`${finisherText} Awful Finisher`, 4, 'Deal 15 damage. If this is the killing blow, reduce precision harvest quality by 1.', [{ type: 'damage', amount: 15 }], 'attack']
    ],
    katar: [
      [`${primary} First Hand`, 1, 'Cost 1, or 0 if two Katars are equipped. Deal 3 damage.', [{ type: 'damage', amount: 3 }], 'attack'],
      [`${secondary} Second Hand`, 1, 'Cost 1, or 0 if two Katars are equipped. Deal 2 damage and draw 1 attack card.', [{ type: 'damage', amount: 2 }, { type: 'draw', amount: 1 }], 'attack'],
      [`${finisherText} Twin Rhythm`, 2, 'Cost 2, or 1 if two Katars are equipped. Deal 4 damage twice.', [{ type: 'multiHitDamage', amount: 4, hits: 2 }], 'attack']
    ],
    shield: [
      [`${primary} Set the Wall`, 1, 'Gain 5 Block.', [{ type: 'block', amount: 5 }], 'skill'],
      [`${secondary} Absorb and Answer`, 1, 'Gain 3 Block. Your next Shield attack deals bonus damage equal to half your Block.', [{ type: 'block', amount: 3 }, { type: 'nextAttackBonus', amount: 2 }], 'skill'],
      [`${finisherText} Counterweight Slam`, 2, 'Deal damage equal to your Block, then lose half your Block.', [{ type: 'damageFromBlock', divisor: 1, maximum: 20 }], 'attack']
    ],
    bow: [
      [`${primary} Careful Shot`, 1, 'Deal 2 damage. Improve your next weak-point test by +2.', [{ type: 'damage', amount: 2 }, { type: 'testBonus', amount: 2 }], 'attack'],
      [`${secondary} Stay Unseen`, 1, 'Deal 2 damage. The quarry is less likely to target this survivor next turn.', [{ type: 'damage', amount: 2 }, { type: 'targetAvoidance', amount: 1 }], 'attack'],
      [`${finisherText} Thread the Gap`, 2, 'Deal 5 damage. If this hits a weak point, gain the better reward choice.', [{ type: 'damage', amount: 5 }, { type: 'testBonus', amount: 1 }], 'attack']
    ],
    axe: [
      [`${primary} Bite the Guard`, 1, 'Deal 4 damage. Damage dealt to quarry Block is doubled.', [{ type: 'damage', amount: 4 }, { type: 'removeMonsterBlock', amount: 2 }], 'attack'],
      [`${secondary} Splintering Blow`, 2, 'Remove 8 quarry Block, then deal 3 damage.', [{ type: 'removeMonsterBlock', amount: 8 }, { type: 'damage', amount: 3 }], 'attack'],
      [`${finisherText} Ugly Harvest`, 2, 'Deal 7 damage. If this kills, reduce delicate harvest rewards by 1.', [{ type: 'damage', amount: 7 }], 'attack']
    ],
    fistAndTooth: [
      [`${primary} Bare Sign`, 0, '[AURA] Your first attack each turn deals +1 damage this fight.', [{ type: 'aura', auraType: 'globalDamageBonus', amount: 1, expiresAfterCombat: true }], 'skill'],
      [`${secondary} Close Enough`, 0, 'Deal 1 damage and gain 1 Block.', [{ type: 'damage', amount: 1 }, { type: 'block', amount: 1 }], 'attack'],
      [`${finisherText} Pack Instinct`, 1, '[AURA] Another survivor’s next attack deals +2 damage.', [{ type: 'aura', auraType: 'nextSurvivorDamageBonus', amount: 2 }], 'skill']
    ],
    spear: [
      [`${primary} Reach Strike`, 1, 'Deal 3 damage and gain 2 Block.', [{ type: 'damage', amount: 3 }, { type: 'block', amount: 2 }], 'attack'],
      [`${secondary} Keep It Back`, 1, 'Deal 2 damage. If the quarry targets you next turn, gain 3 extra Block.', [{ type: 'damage', amount: 2 }, { type: 'block', amount: 3 }], 'attack'],
      [`${finisherText} Line Held`, 2, 'Deal 5 damage and give another survivor 2 Block.', [{ type: 'damage', amount: 5 }, { type: 'partyEffect', target: 'another', effectType: 'block', value: 2 }], 'attack']
    ]
  };
  return specs[weaponType].map(([name, cost, text, effects, type]) => makeCard({
    sourceGearId: '',
    name,
    cost,
    description: text,
    effects,
    type,
    tags: commonTags,
    weaponType
  }));
}

function withSource(card, sourceGearId) {
  return {
    ...card,
    id: cardId(sourceGearId, card.name),
    sourceGearId
  };
}

function gearCost(resources, index, extra = 'bone') {
  return index % 3 === 0
    ? { [resources[index % resources.length]]: 1, [extra]: 1 }
    : { [resources[index % resources.length]]: 1, [resources[(index + 1) % resources.length]]: 1 };
}

function makeWeaponItem(suite, weaponType, label, name, index) {
  const id = `normal_${slugify(suite.buildingId)}_${slugify(name)}`;
  const cards = weaponCardSpecs(suite, weaponType).map(card => withSource(card, id));
  return {
    item: {
      id,
      name,
      itemType: 'weapon',
      loadoutCategory: 'weapon',
      slot: 'weapon',
      weaponType,
      hands: weaponType === 'bow' || weaponType === 'grandWeapon' ? 2 : 1,
      buildingId: suite.buildingId,
      locationId: suite.buildingId,
      craftingLocationId: suite.buildingId,
      displayLocationId: suite.buildingId,
      quarryId: suite.quarryId,
      cost: gearCost(suite.resources, index),
      cardPackage: cards.map(card => card.id),
      passiveText: `${label} from the ${suite.armourSet} suite. Uses ${suite.mechanicPair}.`,
      keywords: ['Normal', 'Quarry', 'Weapon', label, suite.mechanic],
      normalQuarryGear: true,
      implemented: true
    },
    cards
  };
}

function makeArmourItem(suite, slot, index) {
  const slotName = titleCaseSlot(slot);
  const name = `${suite.armourSet} ${slotName}`;
  const id = `normal_${slugify(suite.buildingId)}_${slugify(name)}`;
  const cardName = `${suite.armourPrefix} ${slotName} Response`;
  const description = `Gain 2 Block. If you used ${suite.armourTrigger} this turn, gain 2 more Block.`;
  const card = makeCard({
    sourceGearId: id,
    name: cardName,
    cost: 1,
    description,
    effects: [{ type: 'block', amount: 2 }, { type: 'block', amount: 2 }],
    tags: ['gear', 'armor', 'normal', slugify(suite.mechanic)],
  });
  return {
    item: {
      id,
      name,
      itemType: 'armor',
      loadoutCategory: 'armor',
      slot: 'armor',
      bodySlot: slot,
      buildingId: suite.buildingId,
      locationId: suite.buildingId,
      craftingLocationId: suite.buildingId,
      displayLocationId: suite.buildingId,
      quarryId: suite.quarryId,
      cost: gearCost(suite.resources, index, 'hide'),
      cardPackage: [card.id],
      passiveText: `${slotName}: ${index === 0 ? 'Read the quarry earlier' : index === 1 ? 'Gain passive Block at the start of your turn' : index === 2 ? 'Improve your first attack or utility card each turn' : index === 3 ? 'Move safely after a defensive play' : 'Carry the set mechanic into other gear cards'}. Also interact with ${suite.mechanicPair}.`,
      keywords: ['Normal', 'Quarry', 'Armor', suite.armourSet, suite.mechanic],
      normalQuarryGear: true,
      implemented: true
    },
    cards: [card]
  };
}

function makeInstrumentItem(suite) {
  const id = `normal_${slugify(suite.buildingId)}_${slugify(suite.instrument)}`;
  const cards = [
    makeCard({
      sourceGearId: id,
      name: 'Opening Note',
      cost: 0,
      description: `Choose a survivor. They gain ${suite.mechanic} 1 or 2 Block.`,
      effects: [setupEffect(suite.mechanic), { type: 'block', amount: 2 }],
      tags: ['gear', 'instrument', 'normal', slugify(suite.mechanic)]
    }),
    makeCard({
      sourceGearId: id,
      name: 'Sustained Rhythm',
      cost: 1,
      description: `[AURA] Until your next turn, cards using ${suite.mechanicPair} are +1 stronger.`,
      effects: [{ type: 'aura', auraType: 'globalDamageBonus', amount: 1 }],
      tags: ['gear', 'instrument', 'aura', 'normal', slugify(suite.mechanic)]
    }),
    makeCard({
      sourceGearId: id,
      name: 'Final Call',
      cost: 2,
      description: `Choose a survivor. Their next hit deals +4 damage, or +6 if they already used ${suite.mechanic} this fight.`,
      effects: [{ type: 'nextAttackBonus', amount: 4 }],
      tags: ['gear', 'instrument', 'normal', slugify(suite.mechanic)]
    })
  ];
  return {
    item: {
      id,
      name: suite.instrument,
      itemType: 'instrument',
      loadoutCategory: 'tool',
      slot: 'tool',
      buildingId: suite.buildingId,
      locationId: suite.buildingId,
      craftingLocationId: suite.buildingId,
      displayLocationId: suite.buildingId,
      quarryId: suite.quarryId,
      cost: { [suite.resources[0]]: 1, organ: 1 },
      cardPackage: cards.map(card => card.id),
      passiveText: `Instrument for ${suite.mechanicPair}.`,
      keywords: ['Normal', 'Quarry', 'Instrument', suite.mechanic],
      normalQuarryGear: true,
      implemented: true
    },
    cards
  };
}

function makeToolItem(suite, name, index) {
  const id = `normal_${slugify(suite.buildingId)}_${slugify(name)}`;
  const fieldText = `Apply ${suite.mechanic} 1, heal 1 HP, or improve the next weak-point test by +1.`;
  const riskyText = '50% chance the next hit deals double damage. On failure, gain 2 Block instead.';
  const cards = [
    makeCard({
      sourceGearId: id,
      name: 'Field Use',
      cost: 0,
      description: fieldText,
      effects: [mechanicTargetEffect(suite.mechanic), { type: 'healSelf', amount: 1 }, { type: 'testBonus', amount: 1 }],
      tags: ['gear', 'tool', 'normal', slugify(suite.mechanic)]
    }),
    makeCard({
      sourceGearId: id,
      name: 'Risky Use',
      cost: 1,
      description: riskyText,
      effects: [{ type: 'nextAttackBonus', amount: 3 }, { type: 'block', amount: 2 }],
      tags: ['gear', 'tool', 'normal', 'risk', slugify(suite.mechanic)]
    })
  ];
  return {
    item: {
      id,
      name,
      itemType: 'tool',
      loadoutCategory: 'tool',
      slot: 'tool',
      buildingId: suite.buildingId,
      locationId: suite.buildingId,
      craftingLocationId: suite.buildingId,
      displayLocationId: suite.buildingId,
      quarryId: suite.quarryId,
      cost: { [suite.resources[index % suite.resources.length]]: 1, organ: 1 },
      cardPackage: cards.map(card => card.id),
      passiveText: `Tool for ${suite.mechanicPair}.`,
      keywords: ['Normal', 'Quarry', 'Tool', suite.mechanic],
      normalQuarryGear: true,
      implemented: true
    },
    cards
  };
}

function buildNormalQuarryCatalogue() {
  const records = normalQuarrySuites.flatMap(suite => {
    const weapons = WEAPON_TYPES.map(([weaponType, label], index) =>
      makeWeaponItem(suite, weaponType, label, suite.weaponNames[index], index)
    );
    const armour = BODY_SLOTS.map((slot, index) => makeArmourItem(suite, slot, index));
    const instrument = makeInstrumentItem(suite);
    const tools = suite.tools.map((tool, index) => makeToolItem(suite, tool, index));
    return [...weapons, ...armour, instrument, ...tools];
  });

  return {
    gear: records.map(record => record.item),
    cards: Object.fromEntries(records.flatMap(record => record.cards).map(card => [card.id, card]))
  };
}

const normalQuarryCatalogue = buildNormalQuarryCatalogue();

export const normalQuarryGear = normalQuarryCatalogue.gear;
export const normalQuarryCards = normalQuarryCatalogue.cards;
export const normalQuarrySuiteDefinitions = normalQuarrySuites;
