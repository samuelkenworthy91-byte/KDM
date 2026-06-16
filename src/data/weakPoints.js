import { resources } from './resources.js';

const preciseTags = ['head', 'eye', 'organ', 'heart', 'strange'];
const armourTags = ['hide', 'shell', 'armour', 'bone', 'mane'];
const limbTags = ['limb', 'legs', 'tail', 'tongue', 'wing', 'wings', 'claws'];
const HARVEST_QUALITIES = ['clean', 'messy', 'ruined'];
const DEFAULT_QUALITY_WEIGHTS = {
  clean: { related: 40, rare: 20, fallback: 5 },
  messy: { related: 20, rare: 5, fallback: 15 },
  ruined: { related: 5, rare: 0, fallback: 25 }
};

function includesAny(tags, candidates) {
  return candidates.some(tag => tags.includes(tag));
}

function defaultsFor(tags, levelMin, dangerEffect) {
  const precise = includesAny(tags, preciseTags);
  const armour = includesAny(tags, armourTags);
  const limb = includesAny(tags, limbTags);
  const dangerous = tags.includes('dangerous') || Boolean(dangerEffect);
  const body = tags.includes('body') && !tags.includes('organ');
  const preferredWeaponTypes = precise
    ? ['dagger', 'katar', 'bow', 'katana', 'strangeWeapon']
    : armour
      ? ['hammer', 'club', 'axe', 'grandWeapon']
      : limb
        ? ['sword', 'spear', 'whip', 'katar']
        : ['sword', 'axe', 'spear', 'grandWeapon'];
  const poorWeaponTypes = precise
    ? ['hammer', 'club', 'grandWeapon']
    : armour
      ? ['dagger', 'katar']
      : limb
        ? ['grandWeapon']
        : [];
  const preferredKeywords = precise
    ? ['precise', 'ranged', 'organHunter', 'headHunter', 'strange']
    : armour
      ? ['breaker', 'brutal', 'hideBreaker', 'heavy']
      : limb
        ? ['precise', 'reach', 'limbHunter', 'wingClipper']
        : ['brutal', 'reach'];
  const poorKeywords = precise ? ['heavy'] : armour ? ['quick'] : [];
  const riskOnFailedBreak = !dangerous && body
    ? null
    : dangerEffect === 'panicIfMissed' || tags.includes('head') || tags.includes('eye')
      ? { type: 'panic', amount: dangerous ? 2 : 1, label: dangerous ? 'Rare but Dangerous' : 'Panic Risk' }
      : dangerEffect === 'bleedIfMissed'
        ? { type: 'bleed', amount: 1, label: 'Counter Risk' }
        : tags.includes('claws') || tags.includes('weapon')
          ? { type: 'marked', amount: 1, label: 'Counter Risk' }
          : tags.includes('organ') || tags.includes('heart')
            ? { type: 'monsterHeal', amount: dangerous ? 3 : 2, label: dangerous ? 'Rare but Dangerous' : 'Monster Rage Risk' }
            : armour
              ? { type: 'monsterBlock', amount: 3, label: 'Low Risk' }
              : limb
                ? { type: 'loseBlock', amount: 2, label: 'Low Risk' }
                : null;
  return {
    breakValue: 8 + (precise ? 2 : 0) + (armour ? 2 : 0) +
      (dangerous ? 3 : 0) + Math.max(0, levelMin - 1) * 2,
    monsterDamageMultiplier: tags.includes('eye') || tags.includes('heart') || tags.includes('organ')
      ? 0.25
      : body ? 0.75 : 0.5,
    breakDamageMultiplier: tags.includes('organ') || tags.includes('heart')
      ? 1.25
      : tags.includes('shell') || tags.includes('armour') ? 0.75 : 1,
    preferredWeaponTypes,
    poorWeaponTypes,
    preferredKeywords,
    poorKeywords,
    riskOnFailedBreak,
    riskLabel: riskOnFailedBreak?.label || 'Safe Target'
  };
}

function getHarvestFamily(tags) {
  return tags.find(tag => [
    'head', 'eye', 'heart', 'organ', 'claws', 'mane', 'hide', 'shell', 'bone',
    'legs', 'tail', 'tongue', 'wing', 'wings', 'body', 'limb'
  ].includes(tag)) || 'body';
}

function getFallbackPartIds(tags) {
  if (includesAny(tags, ['head', 'claws'])) return tags.includes('claws') ? ['claw', 'bone'] : ['bone', 'monsterTooth'];
  if (includesAny(tags, ['hide', 'mane', 'shell', 'armour'])) return ['hide', 'sinew'];
  if (includesAny(tags, ['organ', 'heart', 'eye', 'strange'])) return ['organ', 'bone'];
  if (includesAny(tags, ['legs', 'tail', 'tongue', 'wing', 'wings', 'limb'])) return ['sinew', 'hide'];
  return ['hide', 'bone'];
}

function createHarvestProfile(tags, rewardPartIds, overrides = {}) {
  const rarePartIds = rewardPartIds.filter(resourceId =>
    ['rare', 'strange', 'level3Rare'].includes(resources[resourceId]?.type)
  );
  return {
    targetPartFamily: getHarvestFamily(tags),
    relatedPartIds: rewardPartIds.filter(resourceId => resources[resourceId]?.type !== 'level3Rare'),
    rarePartIds,
    fallbackPartIds: getFallbackPartIds(tags),
    qualityWeights: DEFAULT_QUALITY_WEIGHTS,
    fragile: includesAny(tags, ['head', 'eye', 'heart', 'organ', 'strange']),
    overkillSensitive: includesAny(tags, ['head', 'eye', 'heart', 'organ', 'gland', 'strange']),
    ...overrides
  };
}

const part = (
  id, name, tags, description, rewardPartIds, effectText,
  effect, levelMin = 1, dangerEffect = null, overrides = {}
) => {
  const { harvestProfile: harvestOverrides, ...weakPointOverrides } = overrides;
  return {
    id,
    name,
    tags,
    description,
    rewardPartIds,
    harvestProfile: createHarvestProfile(tags, rewardPartIds, harvestOverrides),
    onBreakEffect: effectText,
    effect,
    levelMin,
    ...defaultsFor(tags, levelMin, dangerEffect),
    ...weakPointOverrides
  };
};

export const quarryWeakPoints = {
  paleHuntLion: [
    part('rakingClaws', 'Raking Claws', ['claws', 'limb', 'attack'], 'Hooks scrape furrows through the stone.', ['paleLionClaw'], 'Claw attacks deal 2 less damage.', { type: 'reduceIntentDamage', tags: ['attack', 'bleed'], amount: 2 }, 1, null, {
      breakValue: 10,
      preferredWeaponTypes: ['sword', 'axe', 'katar', 'whip'],
      poorWeaponTypes: ['bow'],
      riskOnFailedBreak: { type: 'marked', amount: 1, label: 'Counter Risk' },
      riskLabel: 'Counter Risk',
      harvestProfile: {
        targetPartFamily: 'claw',
        relatedPartIds: ['paleLionClaw', 'paleLionSinew'],
        rarePartIds: ['elderPaleFang'],
        fallbackPartIds: ['claw', 'bone'],
        fragile: false,
        overkillSensitive: false
      }
    }),
    part('hungryBody', 'Hungry Body', ['body'], 'The broad body is the safest target.', ['paleLionHide', 'whiteHeart'], 'A reliable harvesting target.', null, 1, null, {
      breakValue: 8,
      monsterDamageMultiplier: 0.75,
      preferredWeaponTypes: ['axe', 'sword', 'grandWeapon'],
      riskOnFailedBreak: null,
      riskLabel: 'Safe Target',
      harvestProfile: {
        targetPartFamily: 'body',
        relatedPartIds: ['paleLionHide', 'paleLionSinew'],
        rarePartIds: ['whiteHeart'],
        fallbackPartIds: ['hide', 'organ', 'bone'],
        fragile: true,
        overkillSensitive: true
      }
    }),
    part('stalkingLegs', 'Stalking Legs', ['legs', 'limb', 'movement'], 'Coiled legs carry every sudden rush.', ['paleLionSinew'], 'Pounce and heavy movement deal 2 less damage.', { type: 'reduceIntentDamage', tags: ['heavy'], amount: 2 }, 1, null, {
      breakValue: 9,
      preferredWeaponTypes: ['spear', 'whip', 'bow'],
      riskOnFailedBreak: { type: 'monsterEnrage', amount: 1, label: 'Monster Rage Risk' },
      riskLabel: 'Monster Rage Risk',
      harvestProfile: {
        targetPartFamily: 'leg',
        relatedPartIds: ['paleLionSinew', 'paleLionClaw'],
        rarePartIds: [],
        fallbackPartIds: ['sinew', 'hide'],
        fragile: false,
        overkillSensitive: false
      }
    }),
    part('paleHead', 'Pale Head', ['head', 'precise', 'predator'], 'Still eyes follow every lantern.', ['paleLionEye', 'elderPaleFang'], 'Roar and Panic intents are weakened.', { type: 'reducePanic', amount: 1 }, 2, 'panicIfMissed', {
      breakValue: 14,
      monsterDamageMultiplier: 0.25,
      preferredWeaponTypes: ['dagger', 'katar', 'bow', 'katana'],
      poorWeaponTypes: ['hammer', 'grandWeapon'],
      preferredKeywords: ['precise', 'ranged', 'predator', 'headHunter'],
      poorKeywords: ['heavy'],
      riskOnFailedBreak: { type: 'panicAndTarget', amount: 1, label: 'Panic Risk' },
      riskLabel: 'Panic Risk',
      harvestProfile: {
        targetPartFamily: 'head',
        relatedPartIds: ['paleLionEye', 'paleLionMane'],
        rarePartIds: ['elderPaleFang'],
        fallbackPartIds: ['bone', 'monsterTooth'],
        fragile: true,
        overkillSensitive: true
      }
    }),
    part('paleMane', 'Pale Mane', ['hide', 'mane'], 'A dense mane catches blows and light.', ['paleLionMane', 'perfectMane'], 'Block gains are reduced by 4.', { type: 'reduceBlockGain', amount: 4 }, 2, null, {
      breakValue: 12,
      preferredWeaponTypes: ['axe', 'sword', 'grandWeapon'],
      poorWeaponTypes: ['dagger'],
      riskOnFailedBreak: { type: 'monsterBlock', amount: 4, label: 'Low Risk' },
      riskLabel: 'Low Risk',
      harvestProfile: {
        targetPartFamily: 'hide',
        relatedPartIds: ['paleLionMane', 'paleLionHide'],
        rarePartIds: ['perfectMane'],
        fallbackPartIds: ['hide', 'sinew'],
        fragile: false,
        overkillSensitive: false
      }
    })
  ],
  wailingAntelope: [
    part('thrashingHooves', 'Thrashing Hooves', ['legs', 'limb'], 'The hooves never settle.', ['screamingSinew'], 'Trample and kick damage is reduced.', { type: 'reduceIntentDamage', tags: ['trample', 'multi'], amount: 2 }),
    part('sourHide', 'Sour Hide', ['hide', 'body'], 'Elastic hide turns glancing cuts.', ['wailingHide'], 'Block gains are reduced by 3.', { type: 'reduceBlockGain', amount: 3 }),
    part('devouringStomach', 'Devouring Stomach', ['body', 'organ'], 'The swollen stomach knots around old meals.', ['stomachStone', 'wailingOrgan'], 'Healing is reduced by 3.', { type: 'reduceHealing', amount: 3 }),
    part('wailingHead', 'Wailing Head', ['head', 'precise'], 'Its horns frame a throat full of pressure.', ['wailingHorn'], 'Panic intents are weakened.', { type: 'reducePanic', amount: 1 }, 2),
    part('hollowChest', 'Hollow Chest', ['body', 'organ', 'dangerous'], 'A hollow rhythm answers each breath.', ['wailingOrgan', 'endlessMarrow'], 'Rare organ rewards enter the pool.', null, 3, 'panicIfMissed')
  ],
  ashPhoenix: [
    part('burningWings', 'Burning Wings', ['wings', 'limb', 'ranged'], 'Each feather leaves a second path in ash.', ['ashFeather'], 'Multi-hit attacks deal 1 less per hit.', { type: 'reduceIntentDamage', tags: ['multi', 'ash'], amount: 1 }),
    part('talons', 'Talons', ['claws', 'limb'], 'Black talons close around future footing.', ['claw'], 'Talon attacks deal 2 less damage.', { type: 'reduceIntentDamage', tags: ['attack'], amount: 2 }),
    part('timeBone', 'Time Bone', ['strange', 'organ'], 'A pale bone appears older than the wound around it.', ['timeBone'], 'Time disruption is less likely.', { type: 'disableIntentTag', tags: ['time'] }, 2),
    part('memorySkull', 'Memory Skull', ['head', 'strange'], 'Reflections move behind the skull.', ['memoryGlass'], 'Deck disruption is weakened.', { type: 'disableIntentTag', tags: ['disruptive'] }, 2),
    part('ashHeart', 'Ash Heart', ['organ', 'heart', 'dangerous'], 'Living ash circles a bright hollow.', ['phoenixAsh', 'burntOrgan'], 'Healing is reduced.', { type: 'reduceHealing', amount: 4 }, 3, 'counterIfMissed')
  ],
  bloatedGodling: [
    part('swollenHide', 'Swollen Hide', ['hide', 'body'], 'The surface tightens before impact.', ['bloatedHide'], 'Block gains are reduced.', { type: 'reduceBlockGain', amount: 4 }),
    part('stormBone', 'Storm Bone', ['bone', 'limb'], 'Blue light runs through dense supports.', ['stormBone'], 'Heavy slam damage is reduced.', { type: 'reduceIntentDamage', tags: ['heavy'], amount: 2 }),
    part('thunderBelly', 'Thunder Belly', ['body', 'organ'], 'Charge pools beneath the belly.', ['thunderGland'], 'Thunder damage is reduced.', { type: 'reduceIntentDamage', tags: ['thunder'], amount: 3 }, 2),
    part('denseOrgan', 'Dense Organ', ['organ'], 'An organ rolls toward each wound.', ['denseOrgan'], 'Healing is reduced.', { type: 'reduceHealing', amount: 4 }, 2),
    part('crackedJaw', 'Cracked Jaw', ['head', 'dangerous'], 'A split molar flashes inside the bellow.', ['crackedMolar'], 'Panic and bite attacks are weakened.', { type: 'reducePanic', amount: 1 }, 3, 'counterIfMissed')
  ],
  crimsonCrocodile: [
    part('redScales', 'Red Scales', ['hide', 'armour'], 'River scales overlap in heavy rows.', ['crimsonScale'], 'Block gains are reduced.', { type: 'reduceBlockGain', amount: 4 }),
    part('drowningTail', 'Drowning Tail', ['tail', 'limb'], 'The tail draws circles through black water.', ['redLeather', 'bloodMudOrgan'], 'Control attacks deal less damage.', { type: 'reduceIntentDamage', tags: ['control'], amount: 2 }),
    part('crimsonJaw', 'Crimson Jaw', ['head', 'precise'], 'The jaw locks before the body turns.', ['riverTooth'], 'Bite and roll attacks deal less damage.', { type: 'reduceIntentDamage', tags: ['attack', 'bleed'], amount: 2 }, 2),
    part('crocodileEye', 'Crocodile Eye', ['eye', 'head', 'ranged'], 'One eye remains level with the water.', ['crocodileEye'], 'Ambush attacks are weakened.', { type: 'reduceIntentDamage', tags: ['ambush'], amount: 3 }, 2),
    part('bloodBelly', 'Blood Belly', ['body', 'organ', 'dangerous'], 'Mud-dark blood shifts beneath thin scales.', ['bloodMudOrgan', 'riverKingHeart'], 'Rare organ rewards enter the pool.', null, 3, 'bleedIfMissed')
  ],
  frogdog: [
    part('tongue', 'Tongue', ['tongue', 'limb'], 'The tongue tests the air before it lashes.', ['frogdogTongue'], 'Snare attacks are weakened.', { type: 'reduceIntentDamage', tags: ['tongue'], amount: 2 }),
    part('rubberyHide', 'Rubbery Hide', ['hide', 'body'], 'The wet hide folds around impacts.', ['rubberyHide'], 'Block gains are reduced.', { type: 'reduceBlockGain', amount: 3 }),
    part('wetBones', 'Wet Bones', ['bone', 'legs'], 'Flexible bones compress before a leap.', ['wetBone'], 'Leap attacks deal less damage.', { type: 'reduceIntentDamage', tags: ['attack'], amount: 1 }),
    part('toxicGland', 'Toxic Gland', ['organ', 'strange'], 'Color gathers beneath the throat.', ['toxicGland'], 'Poison and bleed effects are weakened.', { type: 'reduceBleed', amount: 1 }, 2),
    part('bulgingEye', 'Bulging Eye', ['eye', 'head'], 'The eye watches several angles at once.', ['bulgingEye', 'manyMouthGland'], 'Disruption and Panic are weakened.', { type: 'reducePanic', amount: 1 }, 3)
  ],
  silkMatriarch: [
    part('silkGland', 'Silk Gland', ['organ'], 'Heavy silk pulses beneath the abdomen.', ['silkGland'], 'Web effects are weakened.', { type: 'disableIntentTag', tags: ['web'] }),
    part('webbedHide', 'Webbed Hide', ['hide', 'body'], 'Layered webbing binds the shell together.', ['webbedHide'], 'Block gains are reduced.', { type: 'reduceBlockGain', amount: 3 }),
    part('venomSac', 'Venom Sac', ['organ', 'precise'], 'A dark drop hangs inside a clear sac.', ['venomSac'], 'Venom damage and bleed are reduced.', { type: 'reduceBleed', amount: 1 }, 2),
    part('spiderEyes', 'Spider Eyes', ['eye', 'head'], 'Many eyes predict the next opening.', ['spiderEye'], 'Evasive intents are weakened.', { type: 'reduceBlockGain', amount: 4 }, 2),
    part('eggCluster', 'Egg Cluster', ['organ', 'dangerous'], 'Small shapes answer movement from within.', ['chitinThread', 'broodCrown'], 'Swarm attacks are weakened.', { type: 'reduceIntentDamage', tags: ['swarm'], amount: 2 }, 3, 'counterIfMissed')
  ],
  bloomKnight: [
    part('polishedStem', 'Polished Stem', ['body', 'reach'], 'A rigid stem holds the duelist upright.', ['polishedStem'], 'Reach attacks are weakened.', { type: 'reduceIntentDamage', tags: ['precision'], amount: 1 }),
    part('floralSinew', 'Floral Sinew', ['legs', 'limb'], 'Fibers tighten before each step.', ['floralSinew'], 'Evasive block is reduced.', { type: 'reduceBlockGain', amount: 3 }),
    part('flowerHelm', 'Flower Helm', ['head', 'precise'], 'Petals close around a polished face.', ['bloomPetal'], 'Duel and riposte intents are weakened.', { type: 'reduceBlockGain', amount: 4 }, 2),
    part('thornBlade', 'Thorn Blade', ['limb', 'weapon'], 'The living blade bends toward openings.', ['duelistThorn'], 'Precision damage is reduced.', { type: 'reduceIntentDamage', tags: ['precision'], amount: 3 }, 2),
    part('knightSeed', 'Knight Seed', ['organ', 'strange', 'dangerous'], 'A second silhouette sleeps inside the seed.', ['knightSeed', 'perfectThornHeart'], 'Rare seed rewards enter the pool.', null, 3, 'counterIfMissed')
  ],
  smogSingers: [
    part('smogPipe', 'Smog Pipe', ['organ', 'sound'], 'A hollow pipe shapes the chorus.', ['smogPipe'], 'Sound Panic is reduced.', { type: 'reducePanic', amount: 1 }),
    part('sootLung', 'Soot Lung', ['organ'], 'Warm soot moves with every breath.', ['sootLung'], 'Breath damage is reduced.', { type: 'reduceIntentDamage', tags: ['smoke'], amount: 2 }),
    part('tarFeather', 'Tar Feather', ['wing', 'hide'], 'Heavy feathers sustain the smoke veil.', ['tarFeather'], 'Guard gains are reduced.', { type: 'reduceBlockGain', amount: 3 }),
    part('harmonyBone', 'Harmony Bone', ['bone', 'strange'], 'Shared rhythm travels through one pale bone.', ['harmonyBone'], 'Multi-hit sound damage is reduced.', { type: 'reduceIntentDamage', tags: ['sound'], amount: 1 }, 2),
    part('chokingMask', 'Choking Mask', ['head', 'dangerous'], 'The natural mask sings without breath.', ['chokingMask', 'finalChorusLung'], 'Panic is reduced.', { type: 'reducePanic', amount: 1 }, 3)
  ],
  chitinCrusader: [
    part('chitinPlate', 'Chitin Plate', ['hide', 'shell', 'armour'], 'Broad plates lock over one another.', ['chitinPlate'], 'Armour and block gains are reduced.', { type: 'reduceBlockGain', amount: 5 }),
    part('beetleHorn', 'Beetle Horn', ['head', 'limb'], 'The horn lowers into a straight charge.', ['beetleHorn'], 'Charge damage is reduced.', { type: 'reduceIntentDamage', tags: ['charge'], amount: 3 }),
    part('resinBlood', 'Resin Blood', ['organ'], 'Amber blood seals every opening.', ['resinBlood'], 'Healing is reduced.', { type: 'reduceHealing', amount: 3 }, 2),
    part('jewelWing', 'Jewel Wing', ['wing', 'ranged'], 'A bright wing shifts the shell sideways.', ['jewelWing'], 'Evasive effects are weakened.', { type: 'reduceBlockGain', amount: 3 }, 2),
    part('dungCore', 'Dung Core', ['organ', 'strange', 'dangerous'], 'Compressed heat turns inside the core.', ['dungCore', 'crusaderHeartplate'], 'Rare core rewards enter the pool.', null, 3, 'counterIfMissed')
  ],
  drakeEmperor: [
    part('drakeScale', 'Drake Scale', ['hide', 'armour'], 'Heatproof scales overlap the body.', ['drakeScale'], 'Block gains are reduced.', { type: 'reduceBlockGain', amount: 4 }),
    part('drakeHorn', 'Drake Horn', ['head', 'precise'], 'The crown-like horn carries command.', ['imperialHorn'], 'Roar and pressure are weakened.', { type: 'reducePanic', amount: 1 }),
    part('crystalBone', 'Crystal Bone', ['bone', 'shell'], 'Clear bones ring beneath the scales.', ['crystalBone'], 'Crystal damage is reduced.', { type: 'reduceIntentDamage', tags: ['crystal'], amount: 2 }, 2),
    part('fireGland', 'Fire Gland', ['organ'], 'Furnace light pools beneath the throat.', ['fireGland'], 'Fire damage is reduced.', { type: 'reduceIntentDamage', tags: ['fire'], amount: 3 }, 2),
    part('moltenEye', 'Molten Eye', ['eye', 'strange', 'dangerous'], 'Liquid fire turns toward the attacker.', ['moltenEye', 'emperorFlameMarrow'], 'Rare fire rewards enter the pool.', null, 3, 'counterIfMissed')
  ],
  sunSovereign: [
    part('sunShell', 'Sun Shell', ['shell', 'hide'], 'Captured daylight hardens the shell.', ['sunShell'], 'Shell block is reduced.', { type: 'reduceBlockGain', amount: 5 }),
    part('solarIchor', 'Solar Ichor', ['organ'], 'Bright fluid carries heat through the body.', ['solarIchor'], 'Heat attacks are weakened.', { type: 'reduceIntentDamage', tags: ['attack'], amount: 1 }),
    part('blindingScale', 'Blinding Scale', ['hide', 'strange'], 'Mirrored scales split the outline.', ['blindingScale'], 'Evasive block is reduced.', { type: 'reduceBlockGain', amount: 3 }, 2),
    part('radiantEye', 'Radiant Eye', ['eye', 'head', 'ranged'], 'The eye opens around a white point.', ['radiantEye'], 'Blind disruption is disabled.', { type: 'disableIntentTag', tags: ['blind'] }, 2),
    part('warmPearl', 'Warm Pearl', ['organ', 'strange'], 'A steady warmth hides beneath the shell.', ['warmPearl', 'captiveNoon'], 'Rare support rewards enter the pool.', null, 3)
  ],
  prideKing: [
    part('kingClaw', 'King Claw', ['claws', 'limb'], 'One claw carries the weight of a verdict.', ['kingClaw'], 'Maul attacks deal less damage.', { type: 'reduceIntentDamage', tags: ['attack'], amount: 2 }),
    part('regalHide', 'Regal Hide', ['hide', 'armour'], 'Scarred hide holds a ruler upright.', ['regalHide'], 'Guard gains are reduced.', { type: 'reduceBlockGain', amount: 4 }),
    part('prideMane', 'Pride Mane', ['mane', 'hide'], 'The mane rises before intimidation.', ['prideMane'], 'Panic and guard are weakened.', { type: 'reducePanic', amount: 1 }, 2),
    part('goldenFang', 'Golden Fang', ['head', 'precise'], 'A heavy fang waits behind still lips.', ['goldenFang'], 'Finisher damage is reduced.', { type: 'reduceIntentDamage', tags: ['punishment'], amount: 3 }, 2),
    part('judgmentEye', 'Judgment Eye', ['eye', 'head', 'dangerous'], 'The eye weighs every retreat.', ['judgmentEye', 'crownHeart'], 'Judgement Panic is weakened.', { type: 'reducePanic', amount: 1 }, 3, 'counterIfMissed')
  ]
};

export function createMonsterWeakPoints(quarryId, level = 1) {
  return (quarryWeakPoints[quarryId] || [])
    .filter(weakPoint => (weakPoint.levelMin || 1) <= level)
    .map(weakPoint => ({
      ...weakPoint,
      breakValue: weakPoint.breakValue + Math.max(0, level - 1) * 2,
      rewardPartIds: weakPoint.rewardPartIds.filter(resourceId => {
        const type = resources[resourceId]?.type;
        if (type === 'level3Rare') return level >= 3;
        if (['rare', 'strange'].includes(type)) return level >= 2;
        return true;
      }),
      harvestProfile: {
        ...weakPoint.harvestProfile,
        relatedPartIds: weakPoint.harvestProfile.relatedPartIds.filter(resourceId => {
          const type = resources[resourceId]?.type;
          if (type === 'level3Rare') return level >= 3;
          if (['rare', 'strange'].includes(type)) return level >= 2;
          return true;
        }),
        rarePartIds: weakPoint.harvestProfile.rarePartIds.filter(resourceId => {
          const type = resources[resourceId]?.type;
          if (type === 'level3Rare') return level >= 3;
          return level >= 2;
        })
      },
      currentBreakDamage: 0,
      broken: false
    }));
}

export function getWeakPointTellState(weakPoint, intent, quarryId) {
  const intentId = intent?.id || '';
  const intentTags = intent?.tags || [];
  if (quarryId === 'paleHuntLion') {
    if (intentId.startsWith('lowCrouch')) {
      if (weakPoint.id === 'stalkingLegs') return 'open';
      if (weakPoint.id === 'paleHead') return 'guarded';
      if (weakPoint.id === 'rakingClaws') return 'dangerous';
    }
    if (intentId.startsWith('lanternShakingRoar')) {
      if (weakPoint.id === 'paleHead') return 'open';
      if (weakPoint.id === 'rakingClaws') return 'guarded';
    }
    if (intentId.startsWith('draggingClaw') && weakPoint.id === 'rakingClaws') return 'dangerous';
  }
  if (intentTags.some(tag => weakPoint.tags.includes(tag))) return 'dangerous';
  if (intentTags.some(tag => ['guard', 'armour', 'shell', 'evasive'].includes(tag)) &&
    includesAny(weakPoint.tags, armourTags)) return 'guarded';
  if (intentTags.some(tag => ['panic', 'sound', 'blind', 'pressure'].includes(tag)) &&
    includesAny(weakPoint.tags, ['head', 'eye'])) return 'open';
  if (intentTags.some(tag => ['attack', 'charge', 'trample', 'heavy'].includes(tag)) &&
    includesAny(weakPoint.tags, ['legs', 'wing', 'wings', 'tail'])) return 'open';
  return 'neutral';
}

export function getWeaponSuitability(weakPoint, weaponType, cardTags = []) {
  const tags = cardTags.map(tag => tag.toLowerCase());
  let modifier = 0;
  if (weakPoint.preferredWeaponTypes.includes(weaponType)) modifier += 0.25;
  if (weakPoint.poorWeaponTypes.includes(weaponType)) modifier -= 0.25;
  const flatBonus =
    weakPoint.preferredKeywords.filter(tag => tags.includes(tag.toLowerCase())).length -
    weakPoint.poorKeywords.filter(tag => tags.includes(tag.toLowerCase())).length;
  const matchScore = modifier + flatBonus * 0.1;
  return {
    modifier,
    flatBonus,
    label: matchScore >= 0.2 ? 'Good' : matchScore <= -0.2 ? 'Poor' : 'Neutral'
  };
}

export function getWeakPointHarvestPreview({
  weakPoint,
  breakDamage = 0,
  weaponType,
  cardTags = []
}) {
  if (!weakPoint) return null;
  const breakValue = weakPoint.breakValue || 0;
  const remaining = Math.max(0, breakValue - breakDamage);
  const overkill = Math.max(0, breakDamage - breakValue);
  const overkillRatio = breakValue ? overkill / breakValue : 0;
  const suitability = getWeaponSuitability(weakPoint, weaponType, cardTags);
  const labels = [];

  if (breakDamage >= breakValue && overkillRatio <= 0.1) {
    labels.push('Perfect range: likely clean break.');
  } else if (breakDamage >= breakValue && overkillRatio <= 0.25) {
    labels.push('Safe break: should break without much damage.');
  }
  if (
    breakDamage >= breakValue &&
    overkillRatio >= 0.3 &&
    (weakPoint.harvestProfile?.fragile || weakPoint.harvestProfile?.overkillSensitive)
  ) {
    labels.push('Overkill warning: may mutilate delicate parts and reduce rare/specific loot.');
  }
  if (suitability.label === 'Poor') labels.push('Poor tool: this weapon type may damage the part.');
  if (suitability.label === 'Good') labels.push('Preferred tool: this weapon type improves clean harvest odds.');
  if (weakPoint.harvestProfile?.fragile || weakPoint.harvestProfile?.overkillSensitive) {
    labels.push('Harvest risk: fragile / overkill sensitive.');
  } else {
    labels.push('Harvest risk: safe.');
  }

  return {
    breakValue,
    breakDamage,
    remaining,
    overkill,
    weaponMatch: suitability.label,
    labels,
    expectedQualityHint: labels.find(label => label.startsWith('Perfect range'))
      ? 'Clean harvest likely.'
      : labels.find(label => label.startsWith('Overkill warning'))
        ? 'Mutilation may push harvest toward ruined.'
        : 'Messy harvest possible.'
  };
}

function worsenQuality(quality) {
  return HARVEST_QUALITIES[Math.min(HARVEST_QUALITIES.length - 1, HARVEST_QUALITIES.indexOf(quality) + 1)];
}

export function rollHarvestQuality({
  weakPoint,
  weaponType,
  cardTags = [],
  suitability,
  proficiencyLevel = 0,
  hasMonsterBane = false,
  overkill = 0,
  monsterLevel = 1,
  random = Math.random
}) {
  const tags = cardTags.map(tag => tag.toLowerCase());
  const precise = tags.some(tag => ['precise', 'cleancut', 'precisestrike', 'carefulcarve', 'safeweakpoint'].includes(tag));
  const brutal = tags.some(tag => ['brutal', 'brutalbreak'].includes(tag));
  const heavy = tags.includes('heavy') || ['hammer', 'club', 'grandWeapon'].includes(weaponType);
  const profile = weakPoint.harvestProfile;
  const reasons = [];
  let cleanBonus = 0;

  if (suitability?.label === 'Good') {
    cleanBonus += 0.1;
    reasons.push('preferred weapon');
  } else if (suitability?.label === 'Poor') {
    cleanBonus -= 0.12;
    reasons.push('poor weapon');
  }
  if (precise && profile.fragile) {
    cleanBonus += 0.1;
    reasons.push('precise attack');
  }
  if (weakPoint.marked || tags.includes('harvestmark')) {
    cleanBonus += 0.07;
    reasons.push('Marked target');
  }
  if (hasMonsterBane) {
    cleanBonus += 0.08;
    reasons.push('Monster Bane');
  }
  if (proficiencyLevel > 0 && suitability?.label === 'Good') {
    cleanBonus += Math.min(0.09, proficiencyLevel * 0.03);
    reasons.push('weapon proficiency');
  }
  if (profile.fragile && (brutal || heavy) && suitability?.label !== 'Good') {
    cleanBonus -= brutal && heavy ? 0.18 : 0.12;
    reasons.push('rough impact');
  }
  if (monsterLevel >= 3) cleanBonus -= 0.05;
  if (weakPoint.tags.includes('dangerous')) cleanBonus -= 0.04;
  if (overkill <= 3) cleanBonus += 0.03;
  else if (overkill >= 4 && overkill <= 7 && profile.overkillSensitive) {
    cleanBonus -= 0.08;
    reasons.push('overkill');
  }

  const roll = random();
  const cleanThreshold = Math.max(0.12, Math.min(0.7, 0.35 + cleanBonus));
  const ruinedThreshold = Math.max(cleanThreshold + 0.15, Math.min(0.95, 0.8 + cleanBonus * 0.5));
  let quality = roll < cleanThreshold ? 'clean' : roll < ruinedThreshold ? 'messy' : 'ruined';
  if (overkill >= 8 && profile.overkillSensitive && !precise && suitability?.label !== 'Good') {
    quality = worsenQuality(quality);
    reasons.unshift('severe overkill');
  }

  const impactText = quality === 'clean'
    ? `${profile.targetPartFamily} parts are much more likely; a rare part is possible.`
    : quality === 'messy'
      ? `${profile.targetPartFamily} parts are more likely, but rare material may be damaged.`
      : `The ${profile.targetPartFamily} was ruined; common fallback material was recovered.`;
  return {
    quality,
    overkill,
    reason: reasons.slice(0, 2).join(', '),
    impactText
  };
}

export function getTellBreakModifier(tellState) {
  if (tellState === 'exposed') return 1.5;
  if (tellState === 'open') return 1.25;
  if (tellState === 'guarded') return 0.75;
  return 1;
}

export function getBrokenWeakPointRewards(weakPoints = []) {
  return weakPoints
    .filter(weakPoint => weakPoint.broken && weakPoint.harvestResult)
    .map(weakPoint => ({
      weakPointId: weakPoint.id,
      weakPointName: weakPoint.name,
      harvestProfile: weakPoint.harvestProfile,
      ...weakPoint.harvestResult
    }));
}
