export const HIT_LOCATION_IDS = ['head', 'arms', 'body', 'legs', 'mind'];

export function createHitLocations(existing = {}) {
  return Object.fromEntries(HIT_LOCATION_IDS.map(location => [
    location,
    {
      wounded: Boolean(existing?.[location]?.wounded),
      severe: Boolean(existing?.[location]?.severe),
      resultId: existing?.[location]?.resultId || null,
      penalty: existing?.[location]?.penalty || ''
    }
  ]));
}

const wound = (id, name, severity, effect, extra = {}) => ({
  id, name, severity, effect, ...extra
});

export const woundTables = {
  head: [
    wound('ringingSkull', 'Ringing Skull', 'light', 'Add 1 Panic at the start of the next combat.', { panic: 1 }),
    wound('crackedBrow', 'Cracked Brow', 'light', 'Draw 1 fewer card at the start of the next combat.', { nextCombatDrawPenalty: 1 }),
    wound('blindedOneEye', 'Blinded in One Eye', 'serious', 'Precise and ranged attacks deal 1 less damage until treated.', { injuryId: 'blindedOneEye', scarId: 'crackedBrowScar' }),
    wound('skullSplit', 'Split Skull', 'fatal', 'Fatal unless a prevention effect intervenes.')
  ],
  arms: [
    wound('tornGrip', 'Torn Grip', 'light', 'The first attack next combat deals 2 less damage.', { nextCombatAttackPenalty: 2 }),
    wound('brokenFingers', 'Broken Fingers', 'serious', 'Dagger, katar, bow, and katana attacks deal 1 less damage until treated.', { injuryId: 'brokenFingers', scarId: 'boneSetWrong' }),
    wound('deadArm', 'Dead Arm', 'serious', 'Two-handed weapons are impaired and Strength is reduced by 1.', { injuryId: 'deadArm', scarId: 'offHandScar' }),
    wound('severedArm', 'Severed Arm', 'fatal', 'Fatal unless a prevention effect intervenes.')
  ],
  body: [
    wound('crackedRibs', 'Cracked Ribs', 'light', 'Maximum HP is reduced by 1 until treated.', { injuryId: 'crackedRibs' }),
    wound('bleedingTorso', 'Bleeding Torso', 'serious', 'Lose 1 HP after each hunt node until treated.', { injuryId: 'bleedingTorso', scarId: 'lionScar' }),
    wound('crushedChest', 'Crushed Chest', 'serious', 'Start combat with 1 less survival.', { injuryId: 'crushedChest', scarId: 'thunderScar' }),
    wound('heartPierced', 'Pierced Heart', 'fatal', 'Fatal unless a prevention effect intervenes.')
  ],
  legs: [
    wound('twistedAnkle', 'Twisted Ankle', 'light', 'Dodge grants 2 less block until treated.', { injuryId: 'twistedAnkle' }),
    wound('hamstrung', 'Hamstrung', 'serious', 'The first Dodge each combat costs 1 additional survival.', { injuryId: 'hamstrung', scarId: 'boneSetWrong' }),
    wound('brokenLeg', 'Broken Leg', 'serious', 'Start combat with 0 block and the first block card gives no block.', { injuryId: 'brokenLeg', scarId: 'stubbornStepScar' }),
    wound('takenOffFeet', 'Taken Off the Feet', 'fatal', 'Fatal unless a prevention effect intervenes.')
  ],
  mind: [
    wound('shaken', 'Shaken', 'light', 'Add 1 Panic to the personal deck.', { panic: 1 }),
    wound('nightmareSeed', 'Nightmare Seed', 'serious', 'Gain or worsen Night Terrors.', { disorderId: 'nightTerrors', scarId: 'deadEyeCalm' }),
    wound('paranoiaBloom', 'Paranoia Bloom', 'serious', 'Gain Paranoia and carry the memory of the wound.', { disorderId: 'paranoia', scarId: 'fearListenerScar' }),
    wound('mindBreak', 'Mind Break', 'fatal', 'Gain a disorder and lose memory; fatal when already heavily disordered.', { disorderId: 'quietMadness' })
  ]
};

export function getWoundResult(location, severity) {
  const table = woundTables[location] || woundTables.body;
  const candidates = table.filter(result => result.severity === severity);
  return candidates[Math.floor(Math.random() * candidates.length)] || table[0];
}

export function rollWoundSeverity({ severe = false, damage = 0, protectedLimb = false } = {}) {
  const roll = Math.random();
  const fatalChance = severe || damage >= 10 ? 0.18 : 0.1;
  const seriousChance = protectedLimb ? 0.28 : severe || damage >= 7 ? 0.5 : 0.38;
  if (roll < fatalChance) return 'fatal';
  if (roll < fatalChance + seriousChance) return 'serious';
  return 'light';
}

export function applyWoundToMember(member, options = {}) {
  const locations = options.location
    ? [options.location]
    : HIT_LOCATION_IDS;
  const location = locations[Math.floor(Math.random() * locations.length)];
  const protectedLimb = Boolean(
    options.injuryProtection &&
    ['arms', 'legs'].includes(location)
  );
  let severity = options.severity || rollWoundSeverity({
    severe: options.severe,
    damage: options.damage,
    protectedLimb
  });
  if (protectedLimb && severity === 'fatal') severity = 'serious';
  else if (protectedLimb && severity === 'serious') severity = 'light';

  const result = getWoundResult(location, severity);
  const survivor = {
    ...member.survivor,
    hitLocations: createHitLocations(member.survivor.hitLocations),
    treatmentNotes: [...(member.survivor.treatmentNotes || [])]
  };
  const injuries = [...(member.injuries || [])];
  const scars = [...(member.scars || [])];
  const disorders = [...(member.disorders || [])];
  const personalDeckAdditions = [...(member.personalDeckAdditions || [])];
  let fatal = severity === 'fatal';

  if (result.id === 'mindBreak' && disorders.length < 2) fatal = false;
  if (fatal && options.preventFatal) {
    fatal = false;
    severity = 'serious';
  }

  survivor.hitLocations[location] = {
    wounded: true,
    severe: severity !== 'light',
    resultId: result.id,
    penalty: result.effect
  };
  survivor.treatmentNotes.push(`${result.name}: ${result.effect}`);
  if (result.injuryId && !injuries.includes(result.injuryId)) injuries.push(result.injuryId);
  if (result.disorderId && !disorders.includes(result.disorderId)) disorders.push(result.disorderId);
  if (result.panic) {
    personalDeckAdditions.push(...Array(result.panic).fill(null).map(() => ({
      cardId: 'panic',
      sourceType: 'curse',
      reason: result.name
    })));
  }
  if (!fatal && severity === 'serious' && result.scarId && Math.random() < 0.65 &&
    !scars.includes(result.scarId)) {
    scars.push(result.scarId);
  }

  survivor.hp = fatal ? 0 : Math.max(1, survivor.hp);
  return {
    ...member,
    survivor,
    injuries,
    scars,
    disorders,
    personalDeckAdditions,
    woundHistory: [
      ...(member.woundHistory || []),
      {
        location,
        resultId: result.id,
        name: result.name,
        severity,
        fatal,
        timestamp: new Date().toISOString()
      }
    ],
    lastWound: { location, ...result, severity, fatal }
  };
}

export function treatWound(survivor, location, treatmentType = 'rest') {
  const hitLocations = createHitLocations(survivor.hitLocations);
  const woundState = hitLocations[location];
  if (!woundState?.wounded) return survivor;
  const allowed = treatmentType === 'rest' ||
    (treatmentType === 'bandage' && ['arms', 'body'].includes(location)) ||
    (treatmentType === 'splint' && ['arms', 'legs'].includes(location));
  if (!allowed) return survivor;
  if (woundState.severe && treatmentType === 'rest') {
    hitLocations[location] = { ...woundState, penalty: `Reduced for this hunt: ${woundState.penalty}` };
  } else {
    hitLocations[location] = { wounded: false, severe: false, resultId: null, penalty: '' };
  }
  return {
    ...survivor,
    hitLocations,
    treatmentNotes: [
      ...(survivor.treatmentNotes || []),
      `${treatmentType} treatment applied to ${location}.`
    ]
  };
}
