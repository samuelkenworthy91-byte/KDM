const BORN_GIVEN_NAMES = [
  'Aster', 'Brin', 'Cinder', 'Daro', 'Eira', 'Fenn', 'Gale', 'Hale',
  'Iris', 'Jora', 'Kest', 'Lumen', 'Mara', 'Nox', 'Orin', 'Pella',
  'Rook', 'Sable', 'Tarin', 'Vale', 'Wren', 'Yara'
];

const FAMILY_NAMES = [
  'Ashward', 'Blackreed', 'Cinderwake', 'Dawnscar', 'Emberfall',
  'Flintmere', 'Gravewind', 'Holloway', 'Ironvein', 'Lanternward',
  'Mournwell', 'Nightglass', 'Rimewood', 'Stonewake', 'Thornmere',
  'Vigilant'
];

function cleanName(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function hashText(value) {
  return [...String(value)].reduce(
    (hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0,
    0
  );
}

function getStoredGivenName(survivor = {}) {
  return cleanName(survivor.firstName) ||
    cleanName(survivor.givenName) ||
    cleanName(survivor.name);
}

export function getSurvivorDisplayName(survivor = {}) {
  const givenName = getStoredGivenName(survivor);
  const familyName = cleanName(survivor.familyName);

  if (survivor.generationType === 'born' && familyName) {
    return `${givenName || 'Unknown'} ${familyName}`;
  }

  return cleanName(survivor.name) || givenName || 'Unknown / Legacy';
}

export function normalizeSurvivorIdentity(survivor = {}) {
  const hasGenerationMetadata = ['founder', 'born', 'legacy'].includes(survivor.generationType);
  const generationType = hasGenerationMetadata ? survivor.generationType : 'legacy';
  const familyName = cleanName(survivor.familyName) || null;
  const firstName = cleanName(survivor.firstName) ||
    cleanName(survivor.givenName) ||
    (generationType === 'born' && familyName
      ? cleanName(survivor.name).replace(new RegExp(`\\s+${familyName}$`, 'i'), '')
      : cleanName(survivor.name)) ||
    'Unknown / Legacy';
  const normalized = {
    ...survivor,
    generationType,
    firstName,
    givenName: firstName,
    familyName,
    generation: Math.max(
      1,
      Number(survivor.generation) || (generationType === 'born' ? 2 : 1)
    ),
    parentIds: Array.isArray(survivor.parentIds)
      ? survivor.parentIds.filter(Boolean).slice(0, 2)
      : [],
    parentNames: Array.isArray(survivor.parentNames)
      ? survivor.parentNames.filter(Boolean).slice(0, 2)
      : [],
    birthLanternYear: Number.isFinite(survivor.birthLanternYear)
      ? survivor.birthLanternYear
      : null,
    bornFromIntimacy: Boolean(survivor.bornFromIntimacy || generationType === 'born'),
    innateTraits: Array.isArray(survivor.innateTraits)
      ? [...new Set(survivor.innateTraits.filter(Boolean))]
      : [],
    purchasedBirthTraits: Array.isArray(survivor.purchasedBirthTraits)
      ? [...new Set(survivor.purchasedBirthTraits.filter(Boolean))]
      : [],
    memorySpentAtBirth: Math.max(0, Number(survivor.memorySpentAtBirth) || 0)
  };

  return {
    ...normalized,
    name: getSurvivorDisplayName(normalized)
  };
}

export function createBornSurvivorName(parentA, parentB, options = {}) {
  const random = options.random || Math.random;
  const primaryParent = options.primaryParent || parentB || parentA;
  const secondaryParent = primaryParent === parentA ? parentB : parentA;
  const inheritedFamilyName = cleanName(primaryParent?.familyName) ||
    cleanName(secondaryParent?.familyName);
  const parentKey = [parentA?.id || parentA?.name, parentB?.id || parentB?.name]
    .filter(Boolean)
    .sort()
    .join('|') || 'new-family';
  const familyName = inheritedFamilyName ||
    FAMILY_NAMES[hashText(parentKey) % FAMILY_NAMES.length];
  const givenName = BORN_GIVEN_NAMES[
    Math.floor(Math.max(0, Math.min(0.999999, random())) * BORN_GIVEN_NAMES.length)
  ];

  return {
    firstName: givenName,
    givenName,
    familyName,
    displayName: `${givenName} ${familyName}`,
    generationType: 'born',
    parentIds: [parentA?.id, parentB?.id].filter(Boolean),
    parentNames: [getSurvivorDisplayName(parentA), getSurvivorDisplayName(parentB)],
    generation: Math.max(
      Number(parentA?.generation) || 1,
      Number(parentB?.generation) || 1
    ) + 1,
    familyOrigin: inheritedFamilyName
      ? `Inherited from ${getSurvivorDisplayName(primaryParent?.familyName
        ? primaryParent
        : secondaryParent)}`
      : `Founded by the child of ${getSurvivorDisplayName(parentA)} and ${getSurvivorDisplayName(parentB)}`
  };
}

export function getSurvivorGenerationText(survivor = {}) {
  if (survivor.generationType === 'founder') return 'Founder: first generation, one name.';
  if (survivor.generationType === 'born') {
    return survivor.familyOrigin
      ? `Born survivor. Family line: ${survivor.familyOrigin}.`
      : `Born survivor of the ${survivor.familyName || 'Unknown / Legacy'} family line.`;
  }
  return 'Legacy survivor: identity preserved from an older save.';
}
