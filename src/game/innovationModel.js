import { defaultInnovationCost } from '../data/innovationCards.js';

const uniqueIds = values => [...new Set(
  (Array.isArray(values) ? values : []).filter(value => typeof value === 'string' && value)
)];

const normalizeTutorialSteps = value => (
  Array.isArray(value)
    ? value.filter(step => typeof step === 'string' && step.trim()).map(step => step.trim())
    : []
);

function normalizePaidResources(value) {
  if (Array.isArray(value)) {
    const paidResourceIds = value.filter(resourceId => typeof resourceId === 'string' && resourceId);
    return {
      memory: 1,
      hide: paidResourceIds[0] || null,
      organ: paidResourceIds[1] || null,
      bone: paidResourceIds[2] || null,
      legacyResourceIds: paidResourceIds
    };
  }
  if (value && typeof value === 'object') {
    return {
      ...value,
      memory: Number.isFinite(value.memory) ? value.memory : 1
    };
  }
  return null;
}

function normalizeInnovationHistoryEntry(entry = {}) {
  if (!entry || typeof entry !== 'object') {
    return {
      type: 'legacy',
      timestamp: null,
      legacy: true
    };
  }
  const paidResources = normalizePaidResources(entry.paidResources);
  return {
    ...entry,
    type: entry.type || (entry.innovationId ? 'chosen' : 'legacy'),
    offeredIds: uniqueIds(entry.offeredIds),
    ...(entry.innovationId ? { innovationId: entry.innovationId } : {}),
    ...(paidResources ? { paidResources } : {}),
    legacy: Boolean(entry.legacy || Array.isArray(entry.paidResources))
  };
}

export function createLegacyInnovationDefinition(id) {
  return {
    id: id || 'unknown-legacy',
    name: 'Unknown / Legacy',
    tier: 'legacy',
    category: 'legacy',
    prerequisites: [],
    deckWeight: 0,
    settlementBoostSummary: 'This saved innovation is not present in the current data catalog.',
    mechanicalEffects: {},
    unlocks: [],
    innovationCost: null,
    memoryCost: null,
    tutorialTitle: 'Legacy innovation',
    tutorialSteps: [],
    uiDestination: 'Settlement > Innovations',
    legacy: true
  };
}

export function normalizeInnovationDefinition(id, definition) {
  if (!definition || typeof definition !== 'object') {
    return createLegacyInnovationDefinition(id);
  }

  const effects = Array.isArray(definition.effects)
    ? definition.effects
    : definition.effect
      ? [definition.effect]
      : [];
  const unlocks = uniqueIds([
    ...(definition.unlocks || []),
    ...(definition.actionUnlocks || []),
    ...(definition.unlocksBuildings || []),
    ...(definition.unlocksRecipes || [])
  ]);

  return {
    ...definition,
    id: definition.id || id,
    name: definition.name || 'Unknown / Legacy',
    tier: definition.tier || 'legacy',
    category: definition.category || 'legacy',
    prerequisites: definition.prerequisites || definition.unlockRequirement || [],
    deckWeight: Number.isFinite(definition.deckWeight) ? definition.deckWeight : 1,
    settlementBoostSummary:
      definition.settlementBoostSummary ||
      effects[0] ||
      definition.description ||
      'Effect not described.',
    mechanicalEffects: definition.mechanicalEffects || {},
    unlocks,
    innovationCost: definition.innovationCost || defaultInnovationCost,
    memoryCost: Number.isFinite(definition.innovationCost?.memory)
      ? definition.innovationCost.memory
      : Number.isFinite(definition.memoryCost)
        ? definition.memoryCost
        : defaultInnovationCost.memory,
    tutorialTitle: definition.tutorialTitle || `Using ${definition.name || 'Unknown / Legacy'}`,
    tutorialSteps: normalizeTutorialSteps(definition.tutorialSteps),
    uiDestination: definition.uiDestination || 'Settlement > Innovations',
    legacy: false
  };
}

export function getInnovationDefinition(catalog, id) {
  return normalizeInnovationDefinition(id, catalog?.[id]);
}

export function normalizeInnovationDeckState(state = {}, options = {}) {
  const ownedIds = uniqueIds([
    ...(options.ownedIds || []),
    ...(state.builtInnovationIds || [])
  ]);
  const excludedPoolIds = new Set(options.excludePoolIds || []);

  return {
    discoveredInnovationIds: uniqueIds([
      ...ownedIds,
      ...(state.discoveredInnovationIds || [])
    ]),
    availableInnovationPoolIds: uniqueIds([
      ...(options.defaultPoolIds || []),
      ...(state.availableInnovationPoolIds || [])
    ]).filter(id => !excludedPoolIds.has(id)),
    builtInnovationIds: ownedIds,
    innovationHistory: Array.isArray(state.innovationHistory)
      ? state.innovationHistory.map(normalizeInnovationHistoryEntry)
      : []
  };
}
