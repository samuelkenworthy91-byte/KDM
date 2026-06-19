import {
  genericResourceIds,
  getGenericResourceDropWeight,
  resources
} from '../data/resources.js';
import { quarries } from '../data/quarries.js';
import { getResourceRarityTier } from './resourceRarityLogic.js';

export const HARVEST_BASE_WEIGHTS = {
  commonGeneric: 60,
  creatureSpecific: 25,
  rare: 8,
  strange: 5,
  level3Rare: 0
};

const QUALITY_MULTIPLIERS = {
  clean: {
    commonGeneric: 0.75,
    creatureSpecific: 1.7,
    rare: 1.25,
    strange: 1,
    level3Rare: 1
  },
  messy: {
    commonGeneric: 1.3,
    creatureSpecific: 0.8,
    rare: 0.25,
    strange: 0.25,
    level3Rare: 0
  },
  ruined: {
    commonGeneric: 2,
    creatureSpecific: 0.25,
    rare: 0,
    strange: 0,
    level3Rare: 0
  }
};

function seededRandom(seed) {
  if (!seed) return Math.random;
  let value = 0;
  String(seed).split('').forEach(char => {
    value = (value * 31 + char.charCodeAt(0)) >>> 0;
  });
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function addCandidate(candidates, resourceId, weight, source, quality, reason, weightDebug, level, rarityUpgrade) {
  const resource = resources[resourceId];
  if (!resource || weight <= 0) return;
  const rarityTier = getResourceRarityTier(resource);
  if (rarityTier === 'level3Rare' && level < 3 && rarityUpgrade < 2) return;
  if (['rare', 'strange'].includes(rarityTier) && level < 2 && rarityUpgrade < 1) return;
  candidates.push({
    resourceId,
    quantity: 1,
    rarityTier,
    source,
    quality,
    reason,
    weightDebug: { ...weightDebug, finalWeight: Math.round(weight * 100) / 100 },
    weight
  });
}

function drawWeighted(candidates, random) {
  const total = candidates.reduce((sum, item) => sum + item.weight, 0);
  let roll = random() * total;
  for (const item of candidates) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return candidates[candidates.length - 1];
}

function combineOffers(offers) {
  const map = new Map();
  offers.forEach(offer => {
    const key = `${offer.resourceId}:${offer.source}:${offer.quality}:${offer.reason}`;
    const existing = map.get(key);
    if (existing) existing.quantity += offer.quantity;
    else map.set(key, { ...offer });
  });
  return [...map.values()];
}

function ensureOffer(offers, candidates, predicate, random) {
  if (offers.some(predicate)) return offers;
  const options = candidates.filter(predicate);
  if (!options.length) return offers;
  const selected = options[Math.floor(random() * options.length)];
  return [...offers.slice(0, Math.max(0, offers.length - 1)), selected];
}

function genericCommonPool() {
  return genericResourceIds.filter(resourceId =>
    getResourceRarityTier(resourceId) === 'common' &&
    getGenericResourceDropWeight(resourceId) > 0
  );
}

function quarryPools(quarryId) {
  const quarryResources = Object.values(resources).filter(resource => resource.creatureId === quarryId);
  return {
    creature: quarryResources.filter(resource => getResourceRarityTier(resource) === 'creature').map(resource => resource.id),
    rare: quarryResources.filter(resource => getResourceRarityTier(resource) === 'rare').map(resource => resource.id),
    strange: quarryResources.filter(resource => getResourceRarityTier(resource) === 'strange').map(resource => resource.id),
    level3Rare: quarryResources.filter(resource => getResourceRarityTier(resource) === 'level3Rare').map(resource => resource.id)
  };
}

function qualityReason(quality) {
  if (quality === 'clean') return 'Clean break improved precise-part odds.';
  if (quality === 'ruined') return 'The part was badly mutilated; only common material remained.';
  return 'Messy harvest damaged delicate tissue.';
}

function addWeakPointCandidates({ candidates, result, quarryLevel, rarityUpgrade }) {
  const profile = result.harvestProfile;
  if (!profile) return;
  const quality = result.quality || 'messy';
  const multipliers = QUALITY_MULTIPLIERS[quality] || QUALITY_MULTIPLIERS.messy;
  const reason = qualityReason(quality);
  profile.fallbackPartIds?.forEach(resourceId => {
    addCandidate(
      candidates,
      resourceId,
      HARVEST_BASE_WEIGHTS.commonGeneric * multipliers.commonGeneric,
      'fallback',
      quality,
      quality === 'ruined' ? reason : `${result.weakPointName || 'Weak point'} fallback material.`,
      { bucket: 'commonGeneric', quality },
      quarryLevel,
      rarityUpgrade
    );
  });
  profile.relatedPartIds?.forEach(resourceId => {
    const tier = getResourceRarityTier(resourceId);
    const bucket = tier === 'creature' ? 'creatureSpecific' : tier;
    addCandidate(
      candidates,
      resourceId,
      (HARVEST_BASE_WEIGHTS[bucket] || HARVEST_BASE_WEIGHTS.creatureSpecific) * (multipliers[bucket] ?? 1),
      tier === 'creature' ? 'weakPoint' : 'rareWeakPoint',
      quality,
      reason,
      { bucket, quality },
      quarryLevel,
      rarityUpgrade
    );
  });
  profile.rarePartIds?.forEach(resourceId => {
    const bucket = getResourceRarityTier(resourceId);
    addCandidate(
      candidates,
      resourceId,
      (HARVEST_BASE_WEIGHTS[bucket] || HARVEST_BASE_WEIGHTS.rare) * (multipliers[bucket] ?? 0),
      'rareWeakPoint',
      quality,
      reason,
      { bucket, quality },
      quarryLevel,
      rarityUpgrade
    );
  });
}

export function buildHarvestRewardOffers({
  quarryId,
  quarryLevel = 1,
  harvestResults = [],
  rarityUpgrade = 0,
  qualityUpgrade = 0,
  quarryLevelBonus = 0,
  extraOfferCount = 0,
  offerSeed
} = {}) {
  const quarry = quarries[quarryId];
  if (!quarry) return [];
  const random = seededRandom(offerSeed);
  const candidates = [];
  const effectiveQuarryLevel = Math.min(3, Math.max(1, Number(quarryLevel) + Number(quarryLevelBonus || 0)));
  const totalRarityUpgrade = Number(rarityUpgrade || 0) + (effectiveQuarryLevel > Number(quarryLevel) ? 1 : 0);
  const pools = quarryPools(quarryId);

  genericCommonPool().forEach(resourceId => {
    const genericWeight = getGenericResourceDropWeight(resourceId);
    addCandidate(
      candidates,
      resourceId,
      genericWeight,
      'generic',
      'messy',
      'Generic fallback material is common on any hunt.',
      { bucket: 'commonGeneric' },
      effectiveQuarryLevel,
      totalRarityUpgrade
    );
  });
  pools.creature.forEach(resourceId => {
    addCandidate(candidates, resourceId, HARVEST_BASE_WEIGHTS.creatureSpecific, 'quarryPool', 'messy', `${quarry.name} quarry pool.`, { bucket: 'creatureSpecific' }, effectiveQuarryLevel, totalRarityUpgrade);
  });
  pools.rare.forEach(resourceId => {
    addCandidate(candidates, resourceId, HARVEST_BASE_WEIGHTS.rare, 'quarryPool', 'clean', 'Rare part odds require quality or level support.', { bucket: 'rare' }, effectiveQuarryLevel, totalRarityUpgrade);
  });
  pools.strange.forEach(resourceId => {
    addCandidate(candidates, resourceId, HARVEST_BASE_WEIGHTS.strange, 'quarryPool', 'clean', 'Strange part odds require quality or level support.', { bucket: 'strange' }, effectiveQuarryLevel, totalRarityUpgrade);
  });
  pools.level3Rare.forEach(resourceId => {
    addCandidate(candidates, resourceId, effectiveQuarryLevel >= 3 ? 5 : HARVEST_BASE_WEIGHTS.level3Rare, 'quarryPool', 'clean', 'Level 3 rare requires apex quarry quality.', { bucket: 'level3Rare' }, effectiveQuarryLevel, totalRarityUpgrade);
  });

  harvestResults.forEach(result => addWeakPointCandidates({
    candidates,
    result: qualityUpgrade && result.quality === 'messy' ? { ...result, quality: 'clean' } : result,
    quarryLevel: effectiveQuarryLevel,
    rarityUpgrade: totalRarityUpgrade
  }));

  if (!candidates.length) return [];
  const offerRanges = { 1: [3, 4], 2: [4, 6], 3: [5, 8] };
  const [min, max] = offerRanges[effectiveQuarryLevel] || offerRanges[1];
  const count = min + Math.floor(random() * (max - min + 1)) + Math.max(0, Number(extraOfferCount) || 0);
  let drawn = Array.from({ length: count }, () => drawWeighted(candidates, random));
  drawn = ensureOffer(drawn, candidates, offer => offer.source === 'generic', random);
  drawn = ensureOffer(drawn, candidates, offer => offer.source === 'quarryPool' && offer.rarityTier === 'creature', random);
  if (harvestResults.some(result => result.quality === 'clean')) {
    drawn = ensureOffer(drawn, candidates, offer => offer.source === 'weakPoint', random);
  }
  if (effectiveQuarryLevel > Number(quarryLevel)) {
    drawn = ensureOffer(drawn, candidates, offer => ['rare', 'strange', 'level3Rare'].includes(offer.rarityTier), random);
  }
  return combineOffers(drawn.map(({ weight, ...offer }) => ({ ...offer })));
}

export function getHarvestBenefitLabels(cardOrGear = {}) {
  const tags = [...(cardOrGear.tags || []), ...(cardOrGear.keywords || [])].map(tag => String(tag).toLowerCase());
  const labels = [];
  if (cardOrGear.testBonus) labels.push(`Harvest: +${cardOrGear.testBonus} to next harvest/weak-point test.`);
  if (cardOrGear.salvage) labels.push('Salvage: keep 1 common fallback on failed harvest.');
  if (cardOrGear.consequenceReduction) labels.push(`Safety: reduce failed harvest consequence by ${cardOrGear.consequenceReduction}.`);
  if (cardOrGear.opensWeakPoint) labels.push('Weak Point: exposes or improves weak-point targeting.');
  if (cardOrGear.quirk === 'careful') labels.push('Precision: better chance of clean harvest on fragile weak points.');
  if (cardOrGear.quirk === 'salvage') labels.push('Salvage: keep common material when the part is damaged.');
  if (tags.includes('harvest') || tags.includes('weakpoint')) labels.push('Harvest tool: improves weak-point reward planning.');
  if (tags.includes('precise') || tags.includes('tool')) labels.push('Precision: better match for delicate weak points.');
  return [...new Set(labels)];
}
